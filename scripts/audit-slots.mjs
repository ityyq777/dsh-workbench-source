/**
 * 插槽声明审计（构建期，不启动 DSH、不开浏览器）。
 *
 * 为什么需要它：插槽 id 打错一个字母，界面不会报错，贡献只是永远不显示——
 * 这正是 Cypht 锚点机制最贵的坑（`insert_at_marker` 找不到锚点只记一条 debug 日志）。
 * 所以每个插件的贡献声明必须在构建时就能被查出来。
 *
 * 查四件事：
 *  1. 贡献的 slot 必须在宿主目录（白名单）里；
 *  2. 同一插槽内 id 不能重复（跨插件也不能，否则后到的会被拒）；
 *  3. 贡献必须有 component 函数，order 若给必须是有限数字；
 *  4. 宿主客户端必须暴露 Slot —— 否则插件的 `host.Slot ?` 判断会一直为假，
 *     贡献在源码里写得好好的却永远不会渲染。
 */
import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const catalog = require(new URL("../packages/shell/client/slot-catalog.cjs", import.meta.url).pathname);

const ADDONS = [
  ["tasks", "dsh-workbench-tasks", "wb-addon-tasks"],
  ["tags", "dsh-workbench-tags", "wb-addon-tags"],
  ["sites", "dsh-workbench-sites", "wb-addon-sites"],
  ["storage", "dsh-workbench-storage", "wb-addon-storage"],
  ["message", "dsh-workbench-message", "wb-addon-message"],
  ["mail", "dsh-workbench-mail", "wb-addon-mail"],
  ["vault", "dsh-workbench-vault", "wb-addon-vault"],
  ["connector", "dsh-workbench-connector", "wb-addon-connector"],
  ["contacts", "dsh-workbench-contacts", "wb-addon-contacts"],
  ["calendar", "dsh-workbench-calendar", "wb-addon-calendar"],
  ["salary", "dsh-workbench-salary", "wb-addon-salary"],
  ["danmaku", "dsh-workbench-danmaku", "wb-addon-danmaku"],
];

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

const react = reactStub();
const jsx = { jsx: react.createElement, jsxs: react.createElement, Fragment: "Fragment" };
// 有些插件（消息悬浮入口、弹幕）在加载期就会碰 DOM，stub 要能接住，否则审计被无关错误打断。
const element = () => ({
  style: { setProperty() {}, removeProperty() {}, getPropertyValue() { return ""; } }, dataset: {}, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
  setAttribute() {}, getAttribute() { return null; }, appendChild() {}, removeChild() {},
  addEventListener() {}, removeEventListener() {}, remove() {}, textContent: "",
  getBoundingClientRect() { return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }; },
  getContext() { return null; }, focus() {}, blur() {}, click() {}, removeAttribute() {},
  get ownerDocument() { return document; },
});
const document = {
  documentElement: Object.assign(element(), { lang: "zh" }),
  head: { appendChild: () => {} },
  body: Object.assign(element(), { appendChild: () => {} }),
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  removeEventListener: () => {},
  createElement: element,
  createElementNS: element,
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
sandbox.getComputedStyle = () => ({ getPropertyValue: () => "" });
sandbox.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
sandbox.requestAnimationFrame = (fn) => setTimeout(fn, 0);
sandbox.MutationObserver = class { observe() {} disconnect() {} takeRecords() { return []; } };
sandbox.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
sandbox.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
sandbox.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
sandbox.sessionStorage = sandbox.localStorage;
sandbox.cancelAnimationFrame = (id) => clearTimeout(id);
document.defaultView = sandbox;
createContext(sandbox);

function load(file, id) {
  runInContext(readFileSync(file, "utf8"), sandbox, { filename: file });
  const factory = sandbox.__ModuleLoader__.modules[id];
  if (typeof factory !== "function") throw new Error("模块未加载：" + id + "（先跑 pnpm build:clients）");
  return factory((name) => (name === "react" ? react : name === "react/jsx-runtime" ? jsx : {}));
}

const problems = [];

// 先加载宿主：没有宿主，插件会在 apply 时直接返回，什么都审计不到。
const hostMod = load("packages/shell/client/client.js", "dsh-workbench");
hostMod.apply({
  effect: (fn) => { const d = fn(); if (typeof d === "function") return d; },
  locale: { register: () => () => {}, bind: () => (k) => k },
  theme: { subscribe: () => () => {} },
  slots: { inject: (name, cb) => { if (cb) cb(); }, register: () => () => {} },
});
const host = sandbox.__WB_HOST__;
if (typeof host.Slot !== "function") {
  problems.push("宿主客户端没有暴露 Slot：插件的 `host.Slot ?` 判断将一直为假，贡献永远不会渲染");
}

const seen = new Map(); // slot -> Map(id -> addon)
const declared = [];

for (const [name, moduleId, addonId] of ADDONS) {
  const file = `packages/addons/${name}/lib/client.js`;
  let registered = null;
  const realRegister = host.registerAddon;
  host.registerAddon = (mod) => { registered = mod; return realRegister(mod); };
  try {
    const mod = load(file, moduleId);
    mod.apply({});
  } catch (e) {
    problems.push(`${addonId}：客户端加载失败（${e && e.message ? e.message : e}）`);
  } finally {
    host.registerAddon = realRegister;
  }
  if (!registered) {
    problems.push(`${addonId}：客户端没有调用 registerAddon（跳过插槽检查）`);
    continue;
  }
  const slots = Array.isArray(registered.slots) ? registered.slots : [];
  if (!Array.isArray(registered.slots) && registered.slots !== undefined) {
    problems.push(`${addonId}：slots 必须是数组`);
  }
  for (const c of slots) {
    if (!c || typeof c !== "object") { problems.push(`${addonId}：存在非对象贡献`); continue; }
    if (!catalog.has(c.slot)) {
      problems.push(`${addonId}：贡献指向未知插槽 "${c.slot}"（可用：${catalog.ids().join(", ")}）`);
      continue;
    }
    if (!c.id) { problems.push(`${addonId}：贡献缺少 id`); continue; }
    if (typeof c.component !== "function") problems.push(`${addonId}/${c.id}：component 必须是组件函数`);
    if (c.order !== undefined && !Number.isFinite(Number(c.order))) problems.push(`${addonId}/${c.id}：order 必须是数字`);
    const bucket = seen.get(c.slot) || new Map();
    if (bucket.has(c.id)) problems.push(`插槽 ${c.slot}：id "${c.id}" 被 ${bucket.get(c.id)} 和 ${addonId} 重复占用`);
    bucket.set(c.id, addonId);
    seen.set(c.slot, bucket);
    declared.push({ addon: addonId, slot: c.slot, id: c.id, order: c.order, title: c.title });
  }
}

if (problems.length) {
  console.error("插槽审计失败（" + problems.length + " 项）：");
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}

const summary = catalog.ids().map((slotId) => {
  const bucket = seen.get(slotId);
  return { slot: slotId, contributions: bucket ? [...bucket.keys()] : [] };
});
console.log("SLOT AUDIT PASS", { shell: host.slots.length, declared: declared.length, summary });
