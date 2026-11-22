/**
 * 「事件」页的数据源与渲染：
 * A. 宿主为每个域自动注册 `<域>.eventsInfo`：发布声明带真实发送次数，订阅取自队列登记表；
 * B. 共享视图能渲染（SSR 加载态不抛错），空数据时给出空态文案。
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const home = mkdtempSync(join(tmpdir(), "wb-events-view-"));
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

let failed = false;
try {
  const shell = await import("../packages/shell/lib/index.js");
  shell.apply(fakeCtx);
  if (!host) throw new Error("workbench service not provided");

  // A. 假业务域：声明一条发布事件、订阅别的事件、并注册 plugin-only 的消费 action。
  let probeApi = null;
  host.registerDomain({
    id: "wb-addon-probe",
    title: "探针域",
    version: "0.0.0-test",
    tables: [],
    views: [],
    events: { publishes: [{ type: "probe.tick", description: "测试用节拍" }] },
    setup(api) {
      probeApi = api;
      api.action("probe.onGateway", { origins: ["plugin"], execute: () => ({ ok: true }) });
      api.events.subscribe("gateway.called", "probe.onGateway");
    },
  });

  // eventsInfo 是宿主自动补的 action，不需要插件自己注册。
  const info = (await host.invoke("wb-addon-probe.eventsInfo", {})).result;
  assert(info && info.domain === "wb-addon-probe", "eventsInfo 应回带域名");
  assert(info.publishes.length === 1 && info.publishes[0].type === "probe.tick", "应列出声明的发布事件");
  assert(info.publishes[0].description === "测试用节拍", "应带声明里的说明");
  assert(info.publishes[0].sent === 0, "还没推过时 sent 应为 0");
  assert(info.subscriptions.length === 1, "应列出真实订阅");
  assert(info.subscriptions[0].type === "gateway.called", "订阅类型应来自队列登记表");
  assert(info.subscriptions[0].action === "probe.onGateway", "订阅 action 应来自队列登记表");

  // 发布统计按 source 归属：域自己推的才算「本插件发布」，宿主推的 source=host。
  probeApi.events.push("probe.tick", { at: 1 });
  host.events.push("gateway.called", { at: 2 });
  for (let i = 0; i < 100; i += 1) {
    const s = host.events.stats();
    if ((s.deliveries.pending || 0) === 0 && (s.deliveries.done || 0) >= 2) break;
    await sleep(20);
  }
  const after = (await host.invoke("wb-addon-probe.eventsInfo", {})).result;
  assert(after.publishes[0].sent === 1, "推过一次后 sent 应为 1，实际 " + after.publishes[0].sent);
  assert(typeof after.publishes[0].lastAt === "number", "应记录最近发送时间");
  assert(after.publishes[0].lastStatus === "done", "没有订阅者的发布事件应直接 done");
  assert(after.subscriptions[0].done >= 1, "被消费的订阅应累计 done");

  // 没声明发布事件的域也要能打开页面（空清单）。
  host.registerDomain({ id: "wb-addon-silent", title: "静默域", version: "0.0.0-test", tables: [], views: [] });
  const silent = (await host.invoke("wb-addon-silent.eventsInfo", {})).result;
  assert(Array.isArray(silent.publishes) && silent.publishes.length === 0, "未声明发布事件时应为空清单");
  assert(Array.isArray(silent.subscriptions) && silent.subscriptions.length === 0, "未订阅时应为空清单");

  // B. 共享视图：能在 SSR 下渲染（hook 直接调用会报错，必须走 renderToString）。
  globalThis.document = { head: { appendChild() {} }, getElementById: () => null, createElement: () => ({ setAttribute() {} }) };
  const React = (await import("react")).default;
  const { renderToString } = await import("react-dom/server");
  const createEventsView = (await import("../packages/addons/lib/events-view.cjs")).default;
  const EventsView = createEventsView().EventsView;
  const loadingHtml = renderToString(
    React.createElement(EventsView, {
      api: { call: () => Promise.resolve({ ok: true, result: { publishes: [], subscriptions: [] } }) },
      lang: "zh",
      addonId: "wb-addon-silent",
      t: (k) => k,
    }),
  );
  assert(loadingHtml.includes("载入中"), "首次渲染应显示加载态，实际：" + loadingHtml);
  assert(!loadingHtml.includes("Object"), "不应把对象当组件渲染");

  console.log("EVENTS VIEW TEST PASS");
} catch (error) {
  failed = true;
  console.error("EVENTS VIEW TEST FAIL: " + String((error && error.stack) || error));
} finally {
  for (const fn of cleanups.reverse()) {
    try { fn(); } catch { /* 收尾失败不影响结论 */ }
  }
  try { rmSync(home, { recursive: true, force: true }); } catch { /* 临时目录清不掉也不影响结论 */ }
}
process.exit(failed ? 1 : 0);
