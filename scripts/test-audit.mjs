/**
 * 审计日志自测：不启动 DSH，直接以原生插件形态加载宿主。
 * 覆盖：写入留痕 / 只读默认不记 / 失败留痕 / 脱敏 / 过滤分页 / 统计 /
 *       HTTP 路由 / recordReads 开关 / 保留期清理 / schema 发现。
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const home = mkdtempSync(join(tmpdir(), "wb-audit-"));
process.env.WB_HOME = home;
let host = null;
let webRoute = null;

const fakeCtx = {
  webServer: { register: (route) => { webRoute = route; return () => {}; } },
  tools: { register: () => {} },
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

async function call(action, args) {
  return host.invoke(action, args || {}, args && args.__origin ? args.__origin : "agent");
}

async function api(method, path) {
  let status = 0;
  let payload = null;
  const req = { method, url: path, headers: {}, async *[Symbol.asyncIterator]() {} };
  const res = {
    writeHead(code) { status = code; },
    end(text) { payload = JSON.parse(String(text)); },
  };
  await webRoute.handler(req, res);
  return { status, payload };
}

try {
  const shell = await import("../packages/shell/lib/index.js");
  shell.apply(fakeCtx);
  if (!host) throw new Error("workbench service not provided");
  const tags = await import("../packages/addons/tags/lib/index.js");
  tags.apply({ workbench: host, effect: fakeCtx.effect });

  // 1. 空账本
  let list = (await call("audit.list", {})).result;
  assert(list.total === 0 && list.records.length === 0, "初始审计应为空");
  assert(list.pageable === true && list.pageSize === 50, "audit.list 分页字段不对");

  // 2. 写 action 留痕
  const created = (await call("tags.create", { name: "审计-令牌" })).result;
  list = (await call("audit.list", {})).result;
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
  await call("tags.list", {});
  list = (await call("audit.list", {})).result;
  assert(list.total === 1, "tags.list 默认不应被记录，实际 total=" + list.total);

  // 4. 失败也要留痕，并且记录错误
  let threw = false;
  try {
    await call("tags.update", { id: "no-such-tag", name: "x" });
  } catch {
    threw = true;
  }
  assert(threw, "更新不存在的标签应抛错");
  const failed = (await call("audit.list", { ok: "false" })).result;
  assert(failed.total === 1, "失败调用应被记录，实际 total=" + failed.total);
  assert(failed.records[0].ok === false, "失败记录 ok 应为 false");
  assert(String(failed.records[0].error).length > 0, "失败记录缺少错误信息");

  // 5. 脱敏：键名命中密码/token/保险箱等一律 ***
  const { redactValue, encodeAuditJson } = await import("../packages/shell/lib/audit.js");
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
  const byPrefix = (await call("audit.list", { actionPrefix: "tags.", pageSize: 10 })).result;
  assert(byPrefix.total === 2, "前缀过滤总数不对：" + byPrefix.total);
  assert(byPrefix.pageSize === 10 && byPrefix.returned === 2, "分页回显不对");
  const capped = (await call("audit.list", { pageSize: 9999 })).result;
  assert(capped.pageSize === 200, "pageSize 应夹到 200，实际 " + capped.pageSize);
  const byActor = (await call("audit.list", { actor: "agent" })).result;
  assert(byActor.total === 2, "按入口过滤不对");
  const byQ = (await call("audit.list", { q: "审计-令牌" })).result;
  assert(byQ.total === 1, "关键字过滤不对：" + byQ.total);

  // 7. 单条详情
  const one = (await call("audit.get", { id: rec.id })).result;
  assert(one && one.action === "tags.create" && one.time, "audit.get 返回不完整");
  let missing = false;
  try {
    await call("audit.get", { id: 999999 });
  } catch {
    missing = true;
  }
  assert(missing, "不存在的审计 id 应抛错");

  // 8. 统计
  const stats = (await call("audit.stats", { rangeDays: 7 })).result;
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
  await call("tags.list", {});
  list = (await call("audit.list", { action: "tags.list" })).result;
  assert(list.total === 1, "打开 recordReads 后 tags.list 应被记录");
  host.db.prepare("DELETE FROM meta WHERE k='audit.recordReads'").run();
  await call("tags.list", {});
  list = (await call("audit.list", { action: "tags.list" })).result;
  assert(list.total === 1, "关闭 recordReads 后 tags.list 不应再记录");

  // 11. 保留期清理
  const oldAt = Date.now() - 10 * 86400000;
  host.db.prepare(
    "INSERT INTO audit_log(at, actor, action, domain, ok, error, target, args, result, duration_ms) VALUES(?,?,?,?,?,?,?,?,?,?)",
  ).run(oldAt, "agent", "tasks.delete", "wb-addon-tasks", 1, null, "id=old", null, null, 3);
  const pruned = (await call("audit.prune", { retentionDays: 1 })).result;
  assert(pruned.deleted === 1, "应清理 1 条过期审计，实际 " + pruned.deleted);
  const after = (await call("audit.list", { action: "tasks.delete" })).result;
  assert(after.total === 0, "过期审计未被清理");

  // 12. schema 发现：audit.* 与业务 action 走同一套 actions.list/help
  const all = (await call("actions.list", { detail: true })).result;
  const auditList = all.actions.find((a) => a.name === "audit.list");
  assert(auditList && auditList.domain === "wb-shell", "actions.list 未包含 audit.list");
  assert(all.domains.some((d) => d.id === "wb-shell"), "actions.list 未包含宿主元域");
  const help = (await call("actions.help", { action: "audit.stats" })).result;
  assert(help.domain === "wb-shell" && help.params.some((p) => p.name === "rangeDays"), "audit.stats 帮助不完整");

  // 13. 审计自身不递归
  const beforeMeta = (await call("audit.list", {})).result.total;
  await call("audit.list", {});
  await call("actions.list", {});
  await call("capabilities.list", {});
  const afterMeta = (await call("audit.list", {})).result.total;
  assert(afterMeta === beforeMeta, "元 action 不应写入审计（避免递归）");

  console.log("AUDIT TEST PASS", {
    created: created.id ? "ok" : "?",
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
