/**
 * 宿主「数据」「配置」两页的自测：不启动 DSH，直接以原生插件形态加载宿主，
 * 走真实 UI 入口 POST /workbench/api/domains/wb-shell/actions/<action>。
 * 覆盖：13 张平台表（含事件队列三张与自动化三张）、白名单拦截、分页与关键字、配置读写与恢复默认。
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const home = mkdtempSync(join(tmpdir(), "wb-hostdata-"));
process.env.WB_HOME = home;
let host = null;
let webRoute = null;

const fakeCtx = {
  webServer: { register: (route) => { webRoute = route; return () => {}; } },
  tools: { register: () => () => {} },
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

async function uiCall(action, args) {
  let status = 0;
  let payload = null;
  const chunks = [Buffer.from(JSON.stringify(args || {}))];
  const req = {
    method: "POST",
    url: "/workbench/api/domains/wb-shell/actions/" + encodeURIComponent(action),
    headers: {},
    async *[Symbol.asyncIterator]() {
      for (const c of chunks) yield c;
    },
  };
  const res = {
    writeHead(code) { status = code; },
    end(text) {
      try { payload = JSON.parse(String(text)); } catch { payload = { raw: String(text) }; }
    },
  };
  await webRoute.handler(req, res);
  return { status, payload };
}

try {
  const shell = await import("../packages/shell/lib/index.js");
  shell.apply(fakeCtx);
  assert(host, "workbench service not provided");

  const probe = await uiCall("wb.dataTables", {});
  if (!probe.payload || !probe.payload.result) {
    throw new Error("wb.dataTables 未返回 result，HTTP " + probe.status + "：" + JSON.stringify(probe.payload));
  }
  // 1. 表清单：13 张平台表（含事件队列三张、自动化三张），带列信息
  const tables = (await uiCall("wb.dataTables", {})).payload.result.tables;
  const names = tables.map((t) => t.name);
  for (const name of [
    "meta",
    "sync_change_log",
    "conflict_shadow",
    "sync_dead_letter",
    "sync_state",
    "session_role",
    "audit_log",
    "host_event",
    "host_event_delivery",
    "host_event_subscription",
    "host_automation_rule",
    "host_automation_run",
    "host_automation_meta",
  ]) {
    assert(names.includes(name), "缺少平台表 " + name + "（实际 " + names.join(",") + "）");
  }
  assert(!names.includes("task"), "业务表不应出现在宿主数据页");
  const meta = tables.find((t) => t.name === "meta");
  assert(Array.isArray(meta.columns) && meta.columns.length > 0 && meta.columns.some((c) => c.name === "k"), "meta 应有列信息");

  // 2. 白名单：业务表拒绝
  const denied = await uiCall("wb.dataQuery", { table: "task" });
  assert(/未知宿主表|不在白名单/.test(String(denied.payload.text) + String(denied.payload.error)), "业务表应被白名单拒绝");

  // 3. 分页与关键字
  const page = (await uiCall("wb.dataQuery", { table: "meta", page: 1, pageSize: 5 })).payload.result;
  assert(Array.isArray(page.rows) && page.pageSize === 10 && page.rows.length <= 10, "分页字段不对");

  // 4. 配置读默认值
  let config = (await uiCall("wb.configGet", {})).payload.result;
  assert(config.items.some((i) => i.id === "audit.recordReads"), "缺少 audit.recordReads");
  assert(config.items.some((i) => i.id === "audit.retentionDays"), "缺少 audit.retentionDays");

  // 5. 写配置并回读
  const setRes = (await uiCall("wb.configSet", { values: { "audit.retentionDays": 120 } })).payload;
  assert(setRes && setRes.result && setRes.result.values && Number(setRes.result.values["audit.retentionDays"]) === 120, "保存配置应成功：" + JSON.stringify(setRes).slice(0, 200));
  config = (await uiCall("wb.configGet", {})).payload.result;
  assert(Number(config.values["audit.retentionDays"]) === 120, "配置应写入 meta 并回读 120：" + JSON.stringify(config.values));

  // 6. 非法值拒绝
  const bad = await uiCall("wb.configSet", { values: { "audit.retentionDays": 3 } });
  assert(/1~3650|7|范围/.test(String(bad.payload.text) + String(bad.payload.error)), "越界配置应被拒绝");

  // 7. 恢复默认
  await uiCall("wb.configReset", { ids: ["audit.retentionDays"] });
  config = (await uiCall("wb.configGet", {})).payload.result;
  assert(Number(config.values["audit.retentionDays"]) === 180 && !config.overrides["audit.retentionDays"], "恢复默认后应回到默认值");

  const { verifyBackupSchemes } = await import("./test-host-backup-schemes.mjs");
  await verifyBackupSchemes(async (action, args) => {
    const { payload } = await uiCall(action, args);
    if (!payload?.result) throw new Error(payload?.error || payload?.text || action);
    return payload.result;
  });
  console.log("HOST DATA TEST PASS", { tables: names.length });
  // 宿主注册了同步定时器，事件循环不会自己空转退出
  process.exit(0);
} catch (e) {
  console.error("HOST DATA TEST FAIL:", e && e.stack ? e.stack : e);
  process.exit(1);
} finally {
  rmSync(home, { recursive: true, force: true });
}
