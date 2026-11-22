/**
 * 宿主「事件队列」页的回归（不启动 DSH）：
 * 1. wb.eventOverview / eventList / eventDeliveryList / eventSubscriptionList 能读到真实队列数据；
 * 2. wb.eventReplay 把死信投递退回队列并立刻派发成功；
 * 3. wb.eventCleanup 只删已终结且早于保留天数的事件；
 * 4. 页面组件能在 SSR 下渲染（不白屏、不把对象当组件）。
 */
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
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

  let probeApi = null;
  host.registerDomain({
    id: "wb-addon-queue-probe",
    title: "队列探针",
    version: "0.0.0-test",
    tables: [],
    views: [],
    events: {
      publishes: [{ type: "probe.ping", description: "探针自己发的节拍" }],
      subscriptions: [{ type: "probe.tick", description: "宿主推的节拍" }],
    },
    setup(api) {
      probeApi = api;
      api.action("probe.onTick", {
        origins: ["plugin"],
        execute: (args) => ({ ok: true, eventId: args.eventId }),
      });
      api.events.subscribe("probe.tick", "probe.onTick");
    },
  });

  // 0. 空队列：总览必须把每个状态都给成 0。
  // 曾经这里只返回出现过的状态键，页面读 stats.events.queued 拿到 undefined，
  // 点开「事件队列」整页崩掉（Cannot read properties of undefined (reading 'queued')）。
  const emptyOverview = (await host.invoke("wb.eventOverview", {})).result;
  for (const key of ["queued", "done", "dead"]) {
    assert(emptyOverview.events[key] === 0, "空队列时事件 " + key + " 应为 0，实际 " + JSON.stringify(emptyOverview.events));
  }
  for (const key of ["pending", "running", "done", "dead"]) {
    assert(emptyOverview.deliveries[key] === 0, "空队列时投递 " + key + " 应为 0，实际 " + JSON.stringify(emptyOverview.deliveries));
  }

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

  // 插件授权清单：声明的发布与监听都要露出来，未声明的推送与订阅直接报错。
  const domains = (await host.invoke("wb.eventDomains", {})).result.domains;
  const probe = domains.find((d) => d.domain === "wb-addon-queue-probe");
  assert(probe, "插件清单应包含探针域");
  assert(probe.publishes.some((p) => p.type === "probe.ping"), "应列出声明的发布事件");
  assert(probe.listens.some((l) => l.type === "probe.tick" && l.registered && l.actions.includes("probe.onTick")), "应列出声明并已登记的监听");
  assert(probe.subscriptions.some((x) => x.action === "probe.onTick"), "应带真实订阅统计");
  let deniedPush = null;
  try {
    probeApi.events.push("probe.undeclared", {});
  } catch (e) {
    deniedPush = e;
  }
  assert(deniedPush && String(deniedPush.message).includes("未声明"), "未声明的事件不许发布");
  let deniedSub = null;
  try {
    probeApi.events.subscribe("probe.other", "probe.onTick");
  } catch (e) {
    deniedSub = e;
  }
  assert(deniedSub && String(deniedSub.message).includes("未声明"), "未声明的事件不许订阅");

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

  // 路由必须渲染组件外壳而不是直接调用页面函数，否则页面 hooks 会挂到
  // WorkbenchPage 的 hook 链上，切路由时 React 抛 #310（曾经的线上白屏）。
  const clientSrc = readFileSync(new URL("../packages/shell/client/client.src.cjs", import.meta.url), "utf8");
  assert(/jsx\.jsx\(QueuePage\.QueueView/.test(clientSrc), "队列路由必须用 jsx.jsx(QueuePage.QueueView, …) 渲染组件");
  assert(!/return QueuePage\.queuePage\(/.test(clientSrc), "队列路由不得直接调用 queuePage()");
  assert(/jsx\.jsx\(HostPages\.ConfigView/.test(clientSrc), "配置路由必须用 jsx.jsx(HostPages.ConfigView, …) 渲染组件");
  assert(!/return HostPages\.configPage\(/.test(clientSrc), "配置路由不得直接调用 configPage()");

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
