/**
 * 客户端模块冒烟：用最小 DOM/React stub 加载宿主与三个业务客户端。
 * 不启动浏览器，只验证 DSH 模块形态、__WB_HOST__ 桥和 registerAddon。
 */
import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";

function reactStub() {
  const createElement = (type, props, ...children) => ({ type, props: props || {}, children });
  return {
    createElement,
    useState: (v) => [typeof v === "function" ? v() : v, () => {}],
    useEffect: () => {}, useMemo: (fn) => fn(), useCallback: (fn) => fn,
    useRef: (v) => ({ current: v }), Fragment: "Fragment",
    forwardRef: (render) => render,
    createContext: (v) => ({ Provider: (p) => p, Consumer: () => null, _currentValue: v }),
    useContext: () => ({}), useId: () => "id",
  };
}
const react = reactStub();
const jsx = { jsx: react.createElement, jsxs: react.createElement, Fragment: "Fragment" };
const styles = [];
const document = {
  documentElement: { lang: "zh" },
  head: { appendChild: (el) => styles.push(el) },
  getElementById: () => null,
  createElement: () => ({ setAttribute() {}, appendChild() {}, textContent: "" }),
};
const sandbox = {
  console, setTimeout, clearTimeout, fetch: async () => ({ json: async () => ({ ok: true, domains: [] }) }),
  EventSource: function () { this.addEventListener = () => {}; },
  navigator: { language: "zh-CN" }, document,
};
sandbox.window = sandbox;
createContext(sandbox);
const errors = [];
const origError = console.error;
console.error = (...a) => { errors.push(a.join(" ")); origError(...a); };

function load(file, id) {
  runInContext(readFileSync(file, "utf8"), sandbox, { filename: file });
  const factory = sandbox.__ModuleLoader__.modules[id];
  if (typeof factory !== "function") throw new Error("module not loaded: " + id);
  return factory((name) => name === "react" ? react : name === "react/jsx-runtime" ? jsx : ({}));
}

try {
  const hostMod = load("packages/shell/client/client.js", "dsh-workbench");
  if (!hostMod || hostMod.name !== "workbench") throw new Error("bad host module");
  const ctx = {
    effect: (fn) => { const d = fn(); if (typeof d === "function") return d; },
    locale: { register: () => () => {}, bind: () => (k) => k },
    slots: { inject: (name, cb) => { if (cb) cb(); }, register: () => () => {} },
  };
  hostMod.apply(ctx);
  const host = sandbox.__WB_HOST__;
  if (!host || typeof host.registerAddon !== "function") throw new Error("host bridge missing");

  const registered = [];
  const realRegister = host.registerAddon;
  host.registerAddon = (mod) => { registered.push(mod); return realRegister(mod); };

  const mods = [
    ["packages/addons/tasks/lib/client.js", "dsh-workbench-tasks", "wb-addon-tasks", "tasks"],
    ["packages/addons/tags/lib/client.js", "dsh-workbench-tags", "wb-addon-tags", "tags"],
    ["packages/addons/sites/lib/client.js", "dsh-workbench-sites", "wb-addon-sites", "sites"],
    ["packages/addons/storage/lib/client.js", "dsh-workbench-storage", "wb-addon-storage", "storage"],
  ];
  for (const [file, id, addonId, viewId] of mods) {
    const mod = load(file, id);
    if (!mod || mod.name !== id) throw new Error("bad module " + id);
    if (!Array.isArray(mod.inject)) throw new Error("bad inject " + id);
    mod.apply({});
    const hit = registered.find((r) => r.id === addonId);
    if (!hit) throw new Error("not registered: " + addonId);
    if (!hit.views.some((v) => v.id === viewId)) throw new Error("view missing: " + viewId);
    if (!hit.views.some((v) => v.id === "stats")) throw new Error("stats view missing: " + addonId);
    if (hit.views[0].id !== "stats") throw new Error("stats view must stay first: " + addonId);
    if (hit.views[1] && hit.views[1].id !== viewId) throw new Error("list view must stay second: " + addonId);
    if (!hit.views.every((v) => typeof v.component === "function")) throw new Error("bad component: " + addonId);
  }
  if (errors.length) throw new Error("console.error: " + errors.join(" | "));
  console.log("CLIENT TEST PASS", { modules: Object.keys(sandbox.__ModuleLoader__.modules), registered: registered.map((r) => r.id), styles: styles.length });
} finally {
  console.error = origError;
}
