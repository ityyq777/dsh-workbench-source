/**
 * 宿主「事件队列」页的回归（不启动 DSH）：
 * 1. wb.eventOverview / eventList / eventDeliveryList / eventSubscriptionList 能读到真实队列数据；
 * 2. wb.eventReplay 把死信投递退回队列并立刻派发成功；
 * 3. wb.eventCleanup 只删已终结且早于保留天数的事件；
 * 4. 页面组件能在 SSR 下渲染（不白屏、不把对象当组件）。
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const home = mkdtempSync(join(tmpdir(), "wb-queue-page-"));
process.env.WB_HOME = home;
const cleanups = [];
let host = null;

const fakeCtx = {
  webServer: { register: () => () => {} },
  tools: { register: () => {} },
  connection: { requestRejection: () => undefined },
  systemPrompt: { section: () => () => {}, getSectionOrder: () => 500 },
  commands: { register: () => () => {} },
  agents: { get: () => undefined },
  provide: (name, value) => { if (name === "workbench") host = value; },
  effect: (fn) => { const d = fn(); if (typeof d === "function") cleanups.push(d); },
};

function assert(cond, message) {
  if (!cond) throw new Error("断言失败：" + message);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitFor(fn, message, timeoutMs) {
  const deadline = Date.now() + (timeoutMs || 3000);
  for (;;) {
    if (await fn()) return;
    if (Date.now() > deadline) throw new Error("等待超时：" + message);
    await sleep(20);
  }
}

let failed = false;
try {
  const shell = await import("../packages/shell/lib/index.js");
  shell.apply(fakeCtx);
  if (!host) throw new Error("workbench service not provided");

  host.registerDomain({
    id: "wb-addon-queue-probe",
    title: "队列探针",
    version: "0.0.0-test",
    tables: [],
    views: [],
    setup(api) {
      api.action("probe.onTick", {
        origins: ["plugin"],
        execute: (args) => ({ ok: true, eventId: args.eventId }),
      });
      api.events.subscribe("probe.tick", "probe.onTick");
    },
  });

  // 1. 推两条：一条被消费，一条无订阅者直接 done。
  host.events.push("probe.tick", { n: 1 });
  host.events.push("probe.orphan", { n: 2 });
  await waitFor(async () => {
    const r = (await host.invoke("wb.eventOverview", {})).result;
    return (r.events.done || 0) >= 2 && (r.deliveries.done || 0) >= 1;
  }, "事件与投递应落库");

  const overview = (await host.invoke("wb.eventOverview", {})).result;
  assert(overview.events.done === 2, "两条事件都应为 done，实际 " + JSON.stringify(overview.events));
  assert(overview.deliveries.done === 1, "只有订阅者那条产生投递");
  assert(overview.subscriptions >= 1, "应至少有一个订阅");
  assert(overview.types.some((x) => x.type === "probe.tick"), "类型分布应包含 probe.tick");

  const list = (await host.invoke("wb.eventList", { pageSize: 20 })).result;
  assert(list.total === 2 && list.items.length === 2, "事件列表应有 2 条");
  assert(list.items[0].payload.includes("probe") || list.items[0].payload.startsWith("{"), "payload 应为预览串");

  const filtered = (await host.invoke("wb.eventList", { type: "probe.orphan" })).result;
  assert(filtered.total === 1 && filtered.items[0].type === "probe.orphan", "按类型过滤应命中一条");

  const deliveries = (await host.invoke("wb.eventDeliveryList", { status: "done" })).result;
  assert(deliveries.total === 1, "按状态过滤投递应命中一条");
  assert(deliveries.items[0].event_type === "probe.tick", "投递应 join 出事件类型");
  assert(deliveries.items[0].action === "probe.onTick", "投递应带消费 action");

  const subs = (await host.invoke("wb.eventSubscriptionList", {})).result;
  assert(subs.items.some((x) => x.action === "probe.onTick"), "订阅清单应来自登记表");

  // 2. 造一条死信投递，重投后应立刻派发成功。
  const db = new DatabaseSync(join(home, "workbench.db"));
  const now = Date.now();
  const eventId = "replay-event";
  const deliveryId = "replay-delivery";
  db.prepare("INSERT INTO host_event (id, type, source, payload, status, created_at) VALUES (?,?,?,?,?,?)").run(
    eventId, "probe.tick", "host", JSON.stringify({ n: 3 }), "dead", now,
  );
  db.prepare(
    "INSERT INTO host_event_delivery (id, event_id, domain, action, status, attempts, next_at, last_error, updated_at) VALUES (?,?,?,?,?,?,?,?,?)",
  ).run(deliveryId, eventId, "wb-addon-queue-probe", "probe.onTick", "dead", 5, now, "模拟失败", now);
  db.close();

  const replay = (await host.invoke("wb.eventReplay", { deliveryId })).result;
  assert(replay.ok && replay.deliveryId === deliveryId, "重投应返回投递 id");
  await waitFor(async () => {
    const r = (await host.invoke("wb.eventDeliveryList", { domain: "wb-addon-queue-probe" })).result;
    const row = r.items.find((x) => x.id === deliveryId);
    return row && row.status === "done" && row.attempts === 1;
  }, "重投后应派发成功且尝试次数为 1");

  const replayAgain = await host.invoke("wb.eventReplay", { deliveryId }).catch((e) => e);
  assert(replayAgain instanceof Error || (replayAgain && replayAgain.error), "已成功的投递不允许再重投");

  // 3. 清理：30 天前的终态事件会被删，最近的不动。
  const db2 = new DatabaseSync(join(home, "workbench.db"));
  db2.prepare("INSERT INTO host_event (id, type, source, payload, status, created_at) VALUES (?,?,?,?,?,?)").run(
    "old-event", "probe.tick", "host", "{}", "done", now - 30 * 24 * 3600 * 1000,
  );
  db2.prepare(
    "INSERT INTO host_event_delivery (id, event_id, domain, action, status, attempts, next_at, last_error, updated_at) VALUES (?,?,?,?,?,?,?,?,?)",
  ).run("old-delivery", "old-event", "wb-addon-queue-probe", "probe.onTick", "done", 1, now, "", now);
  db2.close();

  const cleaned = (await host.invoke("wb.eventCleanup", { olderThanDays: 7 })).result;
  assert(cleaned.deleted >= 1, "应至少清理 1 条旧事件");
  const afterClean = (await host.invoke("wb.eventList", { pageSize: 50 })).result;
  assert(!afterClean.items.some((x) => x.id === "old-event"), "旧事件应已删除");
  assert(afterClean.items.some((x) => x.id === "replay-event"), "最近的事件应保留");
  const orphanDelivery = (await host.invoke("wb.eventOverview", {})).result;
  assert(orphanDelivery.events.done >= 2, "清理后最近事件仍在");

  // 4. 页面能在 SSR 下渲染：全部请求挂着也应出骨架，不崩。
  globalThis.document = { head: { appendChild() {} }, getElementById: () => null, createElement: () => ({ setAttribute() {} }) };
  globalThis.window = globalThis;
  const React = (await import("react")).default;
  const { renderToString } = await import("react-dom/server");
  const { queuePage } = await import("../packages/shell/client/event-queue-page.cjs");
  const jsxRuntime = await import("react/jsx-runtime");
  const apiStub = { post: () => new Promise(() => {}) };
  let html = "";
  try {
    html = renderToString(
      React.createElement(function Wrapper() {
        return queuePage({
          jsx: { jsx: jsxRuntime.jsx, jsxs: jsxRuntime.jsxs },
          React,
          api: apiStub,
          lang: "zh",
          t: (k) => k,
          head: (title) => React.createElement("h2", null, title),
        });
      }),
    );
  } catch (e) {
    throw new Error("页面渲染崩溃：" + String((e && e.stack) || e));
  }
  assert(html.includes("wbq-stats"), "应渲染统计条，实际：" + html.slice(0, 200));
  assert(html.includes("wbq-tabs"), "应渲染页签");
  assert(!html.includes("React error"), "不应出现 React 报错");

  console.log("EVENT QUEUE PAGE TEST PASS");
} catch (error) {
  failed = true;
  console.error("EVENT QUEUE PAGE TEST FAIL: " + String((error && error.stack) || error));
} finally {
  for (const fn of cleanups.reverse()) {
    try { fn(); } catch { /* 收尾失败不影响结论 */ }
  }
  try { rmSync(home, { recursive: true, force: true }); } catch { /* 临时目录清不掉也不影响结论 */ }
}
process.exit(failed ? 1 : 0);
