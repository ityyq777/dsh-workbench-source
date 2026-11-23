/**
 * 审计日志自测：不启动 DSH，直接以原生插件形态加载宿主。
 * 覆盖：写入留痕 / 只读默认不记 / 失败留痕 / 脱敏 / 过滤分页 / 统计 /
 *       HTTP 路由 / recordReads 开关 / 保留期清理 / schema 发现。
 *
 * 入口说明：审计的 actor 由宿主按真实入口决定，插件自报无效（host.invoke 固定 plugin）。
 * 所以这里两路都走真实入口——
 *   - agent：宿主注册的 Workbench 工具（execute 内部以 origin="agent" 分发）；
 *   - ui：POST /workbench/api/domains/<域>/actions/<action>（network 以 origin="ui" 分发）。
 * 结构化结果只从 ui 路由取（工具返回渲染文本），避免测试自报来源。
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const home = mkdtempSync(join(tmpdir(), "wb-audit-"));
process.env.WB_HOME = home;
let host = null;
let webRoute = null;
let tool = null;

const fakeCtx = {
  webServer: { register: (route) => { webRoute = route; return () => {}; } },
  tools: { register: (t) => { tool = t; return () => {}; } },
  connection: { requestRejection: () => undefined },
  systemPrompt: { section: () => () => {}, getSectionOrder: () => 500 },
  commands: { register: () => {} },
  agents: { get: () => undefined },
  provide: (name, value) => { if (name === "workbench") host = value; },
  effect: (fn) => { const dispose = fn(); return dispose; },
};

function assert(cond, message) {
  if (!cond) throw new Error("断言失败：" + message);
}

/** 真实 agent 入口：走宿主注册的工具，origin 由宿主内部固定为 agent。 */
async function agentCall(action, args) {
  if (!tool) throw new Error("宿主没有注册 Workbench 工具");
  return (await tool.execute({ action, args: args || {} }, { agent: { session: { id: "fixture" } } })).text;
}

/** 真实 ui 入口：走网络层 action 路由，origin 固定为 ui。 */
async function uiCall(action, args) {
  const domain = /^(audit|actions|capabilities)\./.test(action) ? "wb-shell" : "wb-addon-" + action.split(".")[0];
  return api("POST", "/workbench/api/domains/" + domain + "/actions/" + action, args || {});
}

async function api(method, path, body) {
  let status = 0;
  let payload = null;
  const chunks = body === undefined ? [] : [Buffer.from(JSON.stringify(body))];
  const req = {
    method,
    url: path,
    headers: {},
    async *[Symbol.asyncIterator]() {
      for (const c of chunks) yield c;
    },
  };
  const res = {
    writeHead(code) { status = code; },
    end(text) {
      try {
        payload = JSON.parse(String(text));
      } catch {
        payload = { raw: String(text) };
      }
    },
  };
  await webRoute.handler(req, res);
  return { status, payload };
}

try {
  const shell = await import("../packages/shell/lib/index.js");
  shell.apply(fakeCtx);
  if (!host) throw new Error("workbench service not provided");
  if (!tool) throw new Error("Workbench 工具未注册");
  const tags = await import("../packages/addons/tags/lib/index.js");
  tags.apply({ workbench: host, effect: fakeCtx.effect });

  // 1. 空账本
  let list = (await uiCall("audit.list", {})).payload.result;
  assert(list.total === 0 && list.records.length === 0, "初始审计应为空");
  assert(list.pageable === true && list.pageSize === 50, "audit.list 分页字段不对");

  // 2. agent 经真实工具写 action 留痕
  const text = await agentCall("tags.create", { name: "审计-令牌" });
  assert(!String(text).startsWith("错误"), "tags.create 应成功：" + text);
  list = (await uiCall("audit.list", {})).payload.result;
  assert(list.total === 1, "tags.create 应被记录，实际 total=" + list.total);
  const rec = list.records[0];
  assert(rec.action === "tags.create", "记录的 action 不对：" + rec.action);
  assert(rec.actor === "agent", "记录的入口不对：" + rec.actor);
  assert(rec.ok === true, "成功记录 ok 应为 true");
  assert(String(rec.domain).startsWith("wb-addon-tags"), "记录的 domain 不对：" + rec.domain);
  assert(String(rec.target).startsWith("name=审计-令牌"), "目标提取不对：" + rec.target);
  assert(rec.args.includes("审计-令牌"), "参数应完整保留非敏感值");
  assert(typeof rec.durationMs === "number", "缺少耗时");

  // 3. 只读 action 默认不记
  await agentCall("tags.list", {});
  list = (await uiCall("audit.list", {})).payload.result;
  assert(list.total === 1, "tags.list 默认不应被记录，实际 total=" + list.total);

  // 4. 失败也要留痕，并且记录错误（工具把失败渲染成「错误：…」文本）
  const failedText = await agentCall("tags.update", { id: "no-such-tag", name: "x" });
  assert(String(failedText).startsWith("错误："), "更新不存在的标签应失败：" + failedText);
  const failed = (await uiCall("audit.list", { ok: "false" })).payload.result;
  assert(failed.total === 1, "失败调用应被记录，实际 total=" + failed.total);
  assert(failed.records[0].ok === false, "失败记录 ok 应为 false");
  assert(String(failed.records[0].error).length > 0, "失败记录缺少错误信息");

  // 5. 脱敏：键名命中密码/token/保险箱等一律 ***
  const { redactValue, encodeAuditJson } = await import("../packages/shell/lib/infra/audit.js");
  const red = redactValue({
    password: "p@ss",
    token: "tok-123",
    apiKey: "ak-1",
    nested: { authorization: "Bearer abc", vault: { key: "secret" }, note: "ok" },
    list: [{ secret: "s" }],
  });
  assert(red.password === "***" && red.token === "***" && red.apiKey === "***", "顶层敏感键未脱敏");
  assert(red.nested.authorization === "***" && red.nested.vault === "***", "嵌套敏感键未脱敏");
  assert(red.nested.note === "ok", "非敏感键被误脱敏");
  assert(red.list[0].secret === "***", "数组内敏感键未脱敏");
  const big = encodeAuditJson({ blobs: Array.from({ length: 40 }, () => "y".repeat(1000)) });
  assert(big.includes('"truncated":true'), "超过 12KB 的参数应折叠为 truncated 包装");
  const small = encodeAuditJson({ blob: "x".repeat(20000) });
  assert(small.length < 5000 && small.includes("chars"), "单字段超长应截断并标注原长度");

  // 6. 过滤与分页
  const byPrefix = (await uiCall("audit.list", { actionPrefix: "tags.", pageSize: 10 })).payload.result;
  assert(byPrefix.total === 2, "前缀过滤总数不对：" + byPrefix.total);
  assert(byPrefix.pageSize === 10 && byPrefix.returned === 2, "分页回显不对");
  const capped = (await uiCall("audit.list", { pageSize: 9999 })).payload.result;
  assert(capped.pageSize === 200, "pageSize 应夹到 200，实际 " + capped.pageSize);
  const byActor = (await uiCall("audit.list", { actor: "agent" })).payload.result;
  assert(byActor.total === 2, "按入口过滤不对");
  const byQ = (await uiCall("audit.list", { q: "审计-令牌" })).payload.result;
  assert(byQ.total === 1, "关键字过滤不对：" + byQ.total);

  // 7. 单条详情
  const one = (await uiCall("audit.get", { id: rec.id })).payload.result;
  assert(one && one.action === "tags.create" && one.time, "audit.get 返回不完整");
  const missing = await uiCall("audit.get", { id: 999999 });
  assert(missing.payload.ok === false, "不存在的审计 id 应报错");

  // 8. 统计
  const stats = (await uiCall("audit.stats", { rangeDays: 7 })).payload.result;
  assert(stats.total === 2 && stats.failed === 1, "统计总数/失败数不对");
  assert(stats.byAction.some((a) => a.action === "tags.create" && a.count === 1), "按 action 统计不对");
  assert(stats.byActor.some((a) => a.actor === "agent"), "按入口统计不对");
  assert(stats.byDay.length >= 1, "按天统计为空");

  // 9. HTTP 路由（审计页数据源）
  const http1 = await api("GET", "/workbench/api/audit?actionPrefix=tags.&pageSize=5");
  assert(http1.status === 200 && http1.payload.ok === true, "GET /audit 失败");
  assert(http1.payload.records.length === 2, "GET /audit 记录数不对");
  const http2 = await api("GET", "/workbench/api/audit?stats=1&rangeDays=7");
  assert(http2.payload.stats && http2.payload.stats.total === 2, "GET /audit?stats=1 统计不对");

  // 10. recordReads 开关：打开后只读 action 也记
  host.db.prepare("INSERT INTO meta(k, v) VALUES('audit.recordReads','1') ON CONFLICT(k) DO UPDATE SET v='1'").run();
  await agentCall("tags.list", {});
  list = (await uiCall("audit.list", { action: "tags.list" })).payload.result;
  assert(list.total === 1, "打开 recordReads 后 tags.list 应被记录");
  host.db.prepare("DELETE FROM meta WHERE k='audit.recordReads'").run();
  await agentCall("tags.list", {});
  list = (await uiCall("audit.list", { action: "tags.list" })).payload.result;
  assert(list.total === 1, "关闭 recordReads 后 tags.list 不应再记录");

  // 11. 保留期清理
  const oldAt = Date.now() - 10 * 86400000;
  host.db.prepare(
    "INSERT INTO audit_log(at, actor, action, domain, ok, error, target, args, result, duration_ms) VALUES(?,?,?,?,?,?,?,?,?,?)",
  ).run(oldAt, "agent", "tasks.delete", "wb-addon-tasks", 1, null, "id=old", null, null, 3);
  const pruned = (await uiCall("audit.prune", { retentionDays: 1 })).payload.result;
  assert(pruned.deleted === 1, "应清理 1 条过期审计，实际 " + pruned.deleted);
  const after = (await uiCall("audit.list", { action: "tasks.delete" })).payload.result;
  assert(after.total === 0, "过期审计未被清理");

  // 12. schema 发现：audit.* 与业务 action 走同一套 actions.list/help
  const all = (await uiCall("actions.list", { detail: true })).payload.result;
  const auditList = all.actions.find((a) => a.name === "audit.list");
  assert(auditList && auditList.domain === "wb-shell", "actions.list 未包含 audit.list");
  assert(all.domains.some((d) => d.id === "wb-shell"), "actions.list 未包含宿主元域");
  const help = (await uiCall("actions.help", { action: "audit.stats" })).payload.result;
  assert(help.domain === "wb-shell" && help.params.some((p) => p.name === "rangeDays"), "audit.stats 帮助不完整");

  // 13. 审计自身不递归
  const beforeMeta = (await uiCall("audit.list", {})).payload.result.total;
  await agentCall("audit.list", {});
  await agentCall("actions.list", {});
  await agentCall("capabilities.list", {});
  const afterMeta = (await uiCall("audit.list", {})).payload.result.total;
  assert(afterMeta === beforeMeta, "元 action 不应写入审计（避免递归）");

  console.log("AUDIT TEST PASS", {
    recordId: rec.id ? "ok" : "?",
    total: afterMeta,
  });
  // 宿主注册了同步定时器，事件循环不会自己空转退出
  process.exit(0);
} catch (err) {
  console.error("AUDIT TEST FAIL", err);
  process.exit(1);
} finally {
  try {
    rmSync(home, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
}
