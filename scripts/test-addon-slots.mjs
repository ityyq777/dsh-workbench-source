/**
 * 跨插件界面插槽回归测试（不启动 DSH、不开浏览器）。
 *
 * 覆盖三层：
 *  A. 目录与注册表：白名单、拒绝原因、按 (order, id) 稳定排序、卸载撤销；
 *  B. 落点组件：空槽不占位、贡献组件收到正确 props、错误边界隔离、跳转带视图参数；
 *  C. 宿主桥：registerAddon 声明的 slots 生效，插件被卸载后贡献一起消失。
 *
 * 关键不变量：最终顺序只取决于 (order, id)，与注册（安装）顺序无关。
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = new URL("../", import.meta.url).pathname;

const catalog = require(`${root}packages/shell/client/slot-catalog.cjs`);
const createSlotRegistry = require(`${root}packages/shell/client/slot-registry.cjs`);
const createSlotOutlet = require(`${root}packages/shell/client/slot-outlet.cjs`);

const silent = () => {};

// ── A. 目录与注册表 ─────────────────────────────────────────────
{
  const ids = catalog.ids();
  ["item.actions", "view.toolbar", "settings.sections", "home.card.footer"].forEach((id) => {
    assert.ok(ids.includes(id), `目录应包含 ${id}`);
    assert.equal(catalog.has(id), true);
  });
  assert.equal(catalog.has("item.nope"), false, "未知插槽不能出现在白名单里");
  assert.equal(catalog.get("item.actions").title.en, "Item actions");
}
console.log("A1 PASS 目录：四个白名单插槽");

{
  const registry = createSlotRegistry(catalog, () => {});
  const Comp = () => null;
  const origError = console.error;
  console.error = silent;
  try {
    assert.equal(registry.add({ slot: "item.nope", id: "x", component: Comp }, "wb-addon-a"), false);
    assert.equal(registry.add({ slot: "item.actions", id: "", component: Comp }, "wb-addon-a"), false);
    assert.equal(registry.add({ slot: "item.actions", id: "x", component: "nope" }, "wb-addon-a"), false);
    assert.equal(registry.add(null, "wb-addon-a"), false);
    assert.equal(registry.add({ slot: "item.actions", id: "x", component: Comp }, "wb-addon-a"), true);
    assert.equal(registry.add({ slot: "item.actions", id: "x", component: Comp }, "wb-addon-b"), false, "同槽同 id 不可重复");
  } finally {
    console.error = origError;
  }
  const reasons = registry.problems().map((p) => p.reason).sort();
  assert.deepEqual(reasons, ["duplicate-id", "invalid-component", "invalid-contribution", "invalid-id", "unknown-slot"].sort());
  assert.equal(registry.size("item.actions"), 1);
}
console.log("A2 PASS 注册表：五类非法贡献被拒绝并记录原因");

{
  const registry = createSlotRegistry(catalog, () => {});
  const Comp = () => null;
  // 先注册"顺序靠后"的，再注册"顺序靠前"的：最终顺序必须由 order/id 决定。
  registry.add({ slot: "item.actions", id: "z-last", order: 200, component: Comp }, "wb-addon-c");
  registry.add({ slot: "item.actions", id: "b-second", order: 50, component: Comp }, "wb-addon-b");
  registry.add({ slot: "item.actions", id: "a-first", order: 50, component: Comp }, "wb-addon-a");
  registry.add({ slot: "item.actions", id: "m-default", component: Comp }, "wb-addon-m"); // 缺省 order=100
  const order = registry.get("item.actions").map((e) => e.id);
  assert.deepEqual(order, ["a-first", "b-second", "m-default", "z-last"], "应 order 升序、同 order 按 id 字典序");

  // 换个注册顺序（模拟安装顺序不同），结果必须一模一样。
  const reversed = createSlotRegistry(catalog, () => {});
  ["m-default", "z-last", "b-second", "a-first"].reverse().forEach((id) =>
    reversed.add({ slot: "item.actions", id, order: id === "z-last" ? 200 : id === "m-default" ? 100 : 50, component: Comp }, "wb-addon-x"),
  );
  assert.deepEqual(reversed.get("item.actions").map((e) => e.id), order, "安装顺序不得影响最终顺序");
}
console.log("A3 PASS 排序：(order, id) 稳定，且与注册顺序无关");

{
  const registry = createSlotRegistry(catalog, () => {});
  const Comp = () => null;
  registry.add({ slot: "item.actions", id: "a", component: Comp }, "wb-addon-a");
  registry.add({ slot: "view.toolbar", id: "t", component: Comp }, "wb-addon-a");
  assert.equal(registry.removeAddon("wb-addon-a"), 2);
  assert.equal(registry.size("item.actions"), 0);
  assert.deepEqual(registry.get("item.actions"), [], "卸载后不能留下空壳");
}
console.log("A4 PASS 卸载：按 addonId 撤销全部贡献");

// ── B. 落点组件 ────────────────────────────────────────────────
function makeReact() {
  const react = {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
    useState: (v) => [typeof v === "function" ? v() : v, () => {}],
    useEffect: () => () => {},
    // 与真实 React 一致：Component 是可用 .call 的函数构造器（不是 class），
    // 插槽落点正是靠 Component.call(this, props) 继承出错误边界。
    Component: function (props) { this.props = props; this.state = {}; },
  };
  react.Component.prototype.setState = function (next) { this.state = Object.assign({}, this.state, next); };
  return react;
}

function outletDeps(registry, overrides = {}) {
  return Object.assign(
    {
      registry,
      apiFor: (addonId) => ({ addonId, call: () => Promise.resolve({ ok: true }) }),
      navigate: () => true,
      subscribe: () => () => {},
    },
    overrides,
  );
}

{
  const registry = createSlotRegistry(catalog, () => {});
  const react = makeReact();
  const outlet = createSlotOutlet(react, outletDeps(registry));
  assert.equal(outlet.Slot({ slot: "item.actions", lang: "zh" }), null, "没有贡献时必须返回 null，不占位");
}
console.log("B1 PASS 空槽：无贡献渲染 null");

{
  const registry = createSlotRegistry(catalog, () => {});
  const react = makeReact();
  const seen = [];
  const Comp = (props) => { seen.push(props); return null; };
  registry.add({ slot: "item.actions", id: "tasks.x", component: Comp }, "wb-addon-tasks");
  const outlet = createSlotOutlet(react, outletDeps(registry, { navigate: (addonId, viewId, params) => ({ addonId, viewId, params }) }));
  const tree = outlet.Slot({ slot: "item.actions", ownerId: "wb-addon-mail", lang: "en", t: (k) => k, item: { kind: "mail.message", id: "m1" } });

  assert.equal(tree.props["data-slot"], "item.actions");
  // 迷你 createElement 把数组子节点原样放进 children，先拍平。
  const boundaryNode = [tree.children].flat(Infinity)[0];
  const childNode = [boundaryNode.children].flat(Infinity)[0];
  assert.equal(childNode.type, Comp, "应渲染贡献组件本身");
  assert.equal(childNode.props.slot, "item.actions");
  assert.equal(childNode.props.ownerId, "wb-addon-mail");
  assert.equal(childNode.props.contributorId, "wb-addon-tasks");
  assert.equal(childNode.props.lang, "en");
  assert.equal(childNode.props.item.id, "m1", "载荷要透传给贡献组件");
  assert.equal(childNode.props.api.addonId, "wb-addon-tasks", "贡献方拿到的是自己域的 api");
  const jumped = childNode.props.onNavigate("messages", { messageId: "m1" });
  assert.deepEqual(jumped, { addonId: "wb-addon-tasks", viewId: "messages", params: { messageId: "m1" } });
}
console.log("B2 PASS 落点：props 透传、贡献方域名隔离、onNavigate 带参数");

{
  const registry = createSlotRegistry(catalog, () => {});
  const react = makeReact();
  const origError = console.error;
  console.error = silent;
  let boundary;
  try {
    const outlet = createSlotOutlet(react, outletDeps(registry));
    registry.add({ slot: "item.actions", id: "boom", component: () => { throw new Error("boom"); } }, "wb-addon-bad");
    boundary = new outlet.SlotBoundary({ slot: "item.actions", contribution: { id: "boom" }, children: null });
    boundary.componentDidCatch(new Error("boom"));
  } finally {
    console.error = origError;
  }
  assert.equal(boundary.render(), null, "抛错后该贡献应整块消失，而不是继续渲染");
  const [entry] = registry.describe("item.actions");
  assert.equal(entry.ok, false, "错误要记进诊断快照，便于定位是谁的贡献坏了");
  assert.match(entry.error, /boom/);
}
console.log("B3 PASS 隔离：单个贡献抛错只消失它自己并留下诊断");

// ── C. 宿主桥 ──────────────────────────────────────────────────
function reactStub() {
  const createElement = (type, props, ...children) => ({ type, props: props || {}, children });
  function Component(props) { this.props = props; this.state = {}; }
  Component.prototype.setState = function (next) { this.state = Object.assign({}, this.state, next); };
  return {
    createElement,
    useState: (v) => [typeof v === "function" ? v() : v, () => {}],
    useEffect: () => {},
    useMemo: (fn) => fn(),
    useCallback: (fn) => fn,
    useRef: (v) => ({ current: v }),
    useLayoutEffect: () => {},
    useSyncExternalStore: (_sub, get) => get(),
    Fragment: "Fragment",
    forwardRef: (render) => render,
    Component,
    createContext: (v) => ({ Provider: (p) => p, Consumer: () => null, _currentValue: v }),
    useContext: () => ({}),
    useId: () => "id",
  };
}

function loadShellHost() {
  const react = reactStub();
  react.useEffect = (fn) => { fn(); };
  const jsx = { jsx: react.createElement, jsxs: react.createElement, Fragment: "Fragment" };
  const document = {
    documentElement: { lang: "zh" },
    head: { appendChild: () => {} },
    getElementById: () => null,
    createElement: () => ({ setAttribute() {}, appendChild() {}, textContent: "" }),
  };
  const sandbox = {
    console,
    setTimeout,
    clearTimeout,
    setInterval: () => 0,
    clearInterval: () => {},
    fetch: async () => ({ json: async () => ({ ok: true, domains: [], shellVersion: "0.8.3" }) }),
    EventSource: function () { this.addEventListener = () => {}; this.close = () => {}; },
    navigator: { language: "zh-CN" },
    document,
  };
  sandbox.window = sandbox;
  createContext(sandbox);
  runInContext(readFileSync(`${root}packages/shell/client/client.js`, "utf8"), sandbox, { filename: "client.js" });
  const factory = sandbox.__ModuleLoader__.modules["dsh-workbench"];
  const mod = factory((name) => (name === "react" ? react : name === "react/jsx-runtime" ? jsx : {}));
  let mainSlot = null;
  const ctx = {
    effect: (fn) => { const d = fn(); if (typeof d === "function") return d; },
    locale: { register: () => () => {}, bind: () => (k) => k },
    theme: { subscribe: () => () => {} },
    slots: { inject: (name, cb) => { if (cb) cb(); }, register: (slot, render) => { if (slot && slot.name === "main") mainSlot = render; return () => {}; } },
  };
  mod.apply(ctx);
  return sandbox.__WB_HOST__;
}

{
  const host = loadShellHost();
  assert.equal(typeof host.Slot, "function", "宿主必须暴露 Slot 落点组件");
  assert.ok(Array.isArray(host.slots) && host.slots.length === 4, "宿主必须暴露插槽目录");
  assert.equal(typeof host.slotContributions, "function");
  assert.equal(typeof host.navigateAddon, "function");
}
console.log("C1 PASS 宿主桥：Slot / slots / slotContributions / navigateAddon 已暴露");

{
  const host = loadShellHost();
  assert.equal(host.registerAddon({
    id: "wb-addon-tasks",
    views: [{ id: "tasks", title: "任务", component: () => null }],
    slots: [{ slot: "item.actions", id: "tasks.create-from-mail", order: 100, component: () => null }],
  }), undefined);
  assert.equal(host.slotContributions("item.actions").length, 1, "registerAddon 声明的 slots 必须生效");
  const [entry] = host.slotContributions("item.actions");
  assert.equal(entry.addonId, "wb-addon-tasks", "贡献归属必须记成注册它的插件");
  assert.equal(entry.ok, true);

  // 同一个插件重复注册（热重载）不应累积或丢失贡献。
  host.registerAddon({
    id: "wb-addon-tasks",
    views: [{ id: "tasks", title: "任务", component: () => null }],
    slots: [{ slot: "item.actions", id: "tasks.create-from-mail", order: 100, component: () => null }],
  });
  assert.equal(host.slotContributions("item.actions").length, 1, "重复注册不能变成两条");
}
console.log("C2 PASS 宿主桥：贡献注册、归属正确、重复注册幂等");

{
  const host = loadShellHost();
  host.registerAddon({
    id: "wb-addon-tasks",
    views: [{ id: "tasks", title: "任务", component: () => null }],
    slots: [{ slot: "item.actions", id: "tasks.create-from-mail", component: () => null }],
  });
  assert.equal(host.slotContributions("item.actions").length, 1);
  // 插件被卸载：宿主清理 registry 时必须同时撤销贡献，不能在别人界面留孤儿。
  host.registerSlot && host.registerSlot("wb-addon-late", { slot: "view.toolbar", id: "late.t", component: () => null });
  assert.equal(host.slotContributions("view.toolbar").length, 1, "单独 registerSlot 也要生效");
}
console.log("C3 PASS 宿主桥：独立 registerSlot 生效");

// ── D. 回链由来源贡献：属主不解析来源 ─────────────────────────────
{
  const React = reactStub();
  const h = React.createElement;
  const C = { Btn: (p) => h("button", { onClick: p.onClick, kind: p.kind }, p.children) };
  const Icon = () => null;
  const MailBack = require(`${root}packages/addons/mail/client/views/slot-back-to-message.cjs`)({ React, h, C, Icon });

  // 非任务条目、任务但没有邮件标记 → 都不渲染（不同来源的贡献各自认自己的标记）。
  assert.equal(MailBack({ item: { kind: "mail.message", id: "m1" } }), null, "邮件条目上不该出现回链");
  assert.equal(MailBack({ item: { kind: "task", id: "t1", description: "普通任务" } }), null, "没有标记时不占位");

  let navigated = null;
  const tree = MailBack({
    item: { kind: "task", id: "t1", description: "由邮件创建。\n来源邮件：wb-mail:msg-42" },
    lang: "zh",
    onNavigate: (viewId, params) => { navigated = { viewId, params }; },
  });
  assert.ok(tree && tree.props, "带标记时应该渲染按钮");
  tree.props.onClick({ stopPropagation() {} });
  assert.deepEqual(navigated, { viewId: "messages", params: { messageId: "msg-42" } }, "点击应带着 messageId 跳回邮件视图");
}
console.log("D1 PASS 回链贡献：只认自己的标记，点击带 messageId 跳回来源视图");

{
  // 属主侧不出现任何来源专属解析：新增来源不需要改任务。
  const item = readFileSync(`${root}packages/addons/tasks/client/item/task-item.cjs`, "utf8");
  assert.equal(/wb-mail/.test(item), false, "任务组件不应认识具体来源标记");
  assert.equal(/MAIL_REF|openOriginalMail|mailAddonInstalled/.test(item), false, "任务不应保留来源解析函数");
  assert.ok(/kind:\s*"task"/.test(item), "任务应把 item.kind 传给落点");
  assert.ok(/description:\s*String\(task\.description/.test(item), "任务应透传描述原文给贡献方");
  const icons = readFileSync(`${root}packages/addons/tasks/client/ui/icons.cjs`, "utf8");
  assert.equal(/mail:\s*require/.test(icons), false, "回链专用的 mail 图标应随来源代码一起移除");
  const copy = readFileSync(`${root}packages/addons/tasks/client/ui/copy.cjs`, "utf8");
  assert.equal(/backToMail/.test(copy), false, "回链文案应移到来源插件");
}
console.log("D2 PASS 任务侧零来源代码：标记、跳转、图标、文案都不在任务里");

{
  // 双向：任务贡献到邮件，邮件也贡献到任务，同一个槽上两条贡献互不影响。
  const registry = createSlotRegistry(catalog, () => {});
  const stub = (name) => () => name;
  registry.add({ slot: "item.actions", id: "tasks.create-from-mail", order: 100, component: stub("a") }, "wb-addon-tasks");
  registry.add({ slot: "item.actions", id: "mail.back-to-message", order: 100, component: stub("b") }, "wb-addon-mail");
  const entries = registry.get("item.actions");
  assert.equal(entries.length, 2, "同一个槽上应能同时挂两个方向的贡献");
  assert.deepEqual(entries.map((e) => e.id), ["mail.back-to-message", "tasks.create-from-mail"], "order 相同时按 id 稳定排序");
  assert.deepEqual(entries.map((e) => e.addonId), ["wb-addon-mail", "wb-addon-tasks"], "归属各自记在贡献方");

  // 新来源（比如日历）只加一条贡献即可接入，任务侧不需要再注册任何东西。
  registry.add({ slot: "item.actions", id: "calendar.back-to-event", order: 100, component: stub("c") }, "wb-addon-calendar");
  assert.equal(registry.get("item.actions").length, 3, "第三个来源接入不需要改属主");
  registry.removeAddon("wb-addon-calendar");
  assert.equal(registry.get("item.actions").length, 2, "来源卸载后只撤销它自己那条");
}
console.log("D3 PASS 双向贡献：同槽两条互不影响，新来源零改属主");

console.log("\nADDON SLOTS TEST PASS { 用例: 目录/校验/排序/卸载/空槽/props/隔离/桥接/回链/双向 }");
