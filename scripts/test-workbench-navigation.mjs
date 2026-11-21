/**
 * 跨页跳转回归测试（不启动 DSH、不开浏览器）：
 *
 * 背景：消息悬浮入口这类常驻控件挂在聊天页，而工作台的路由状态只在 WorkbenchPage 挂载期间
 * 才通过 navigateAddonHook 暴露。页面没挂载时若不换面板，点击等于没反应。
 *
 * A. 页面未挂载：navigateAddon 记下待办并调用 ctx.layout.selectPanel("workbench")，返回 true。
 * B. 面板挂载后消费待办：直接落到目标插件的目标视图（不是插件首页视图）。
 * C. 页面已挂载：navigateAddon 走页面内路由，不再重复切面板。
 * D. 旧宿主没有 layout 服务：返回 false 且不留下待办，挂载后仍停在首页。
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";

const root = new URL("../", import.meta.url).pathname;

const DOMAINS = [
  {
    id: "wb-addon-message",
    title: "消息",
    version: "0.1.6",
    category: "comm",
    views: [{ id: "stats", title: "统计" }, { id: "inbox", title: "收件箱" }],
    error: null,
    enabled: true,
  },
];

function reactStub() {
  const createElement = (type, props, ...children) => ({ type, props: props || {}, children });
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
    createContext: (v) => ({ Provider: (p) => p, Consumer: () => null, _currentValue: v }),
    useContext: () => ({}),
    useId: () => "id",
  };
}

/** 迷你 createElement 把 children 放在节点上，真实 React 放在 props.children，两处都读。 */
function kidsOf(node) {
  return [node?.children, node?.props?.children].flat(Infinity).filter(Boolean);
}

function nodes(node) {
  const out = [];
  (function walk(n) {
    if (!n || typeof n !== "object") return;
    out.push(n);
    for (const child of kidsOf(n)) walk(child);
  })(node);
  return out;
}

function textOf(node) {
  return [node?.children, node?.props?.children].flat(Infinity)
    .map((c) => (typeof c === "string" ? c : c && typeof c === "object" ? textOf(c) : ""))
    .join("");
}

/** 造一个最小浏览器沙箱，加载壳客户端；layout 为 null 表示旧宿主（没有布局服务）。 */
function createHarness({ layout = null } = {}) {
  const react = reactStub();
  // 立即执行 effect：让 useAddonStore 真正发出 /domains 请求，也让消费待办的 effect 跑起来。
  // 注意不能顺手调用返回的清理函数——那会把 navigateAddonHook 立刻置空，模拟不出「页面已挂载」。
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
    fetch: async (url) => ({
      json: async () => (String(url).includes("/workbench/api/domains")
        ? { ok: true, domains: DOMAINS, shellVersion: "0.8.3" }
        : { ok: true }),
    }),
    EventSource: function () { this.addEventListener = () => {}; this.close = () => {}; },
    navigator: { language: "zh-CN" },
    document,
  };
  sandbox.window = sandbox;
  createContext(sandbox);
  runInContext(readFileSync(`${root}packages/shell/client/client.js`, "utf8"), sandbox, { filename: "client.js" });

  const factory = sandbox.__ModuleLoader__.modules["dsh-workbench"];
  assert.ok(typeof factory === "function", "壳客户端模块应可加载");
  const mod = factory((name) => (name === "react" ? react : name === "react/jsx-runtime" ? jsx : {}));

  const panels = [];
  const layoutService = layout === null ? undefined : { selectPanel: (id) => { panels.push(id); } };
  let mainSlot = null;
  const ctx = {
    effect: (fn) => { const d = fn(); if (typeof d === "function") return d; },
    locale: { register: () => () => {}, bind: () => (k) => k },
    theme: { subscribe: () => () => {} },
    slots: {
      inject: (name, cb) => { if (cb) cb(); },
      register: (slot, slotRender) => { if (slot && slot.name === "main") mainSlot = slotRender; return () => {}; },
    },
  };
  if (layoutService) ctx.layout = layoutService;
  mod.apply(ctx);
  assert.ok(typeof mainSlot === "function", "应注册 main 插槽");

  // 模拟消息插件客户端注册（真实环境里由 addon client.js 调 __WB_HOST__.registerAddon）。
  sandbox.__WB_HOST__.registerAddon({
    id: "wb-addon-message",
    title: "消息",
    version: "0.1.6",
    icon: null,
    views: [
      { id: "stats", title: { zh: "统计", en: "Stats" }, component: () => null },
      { id: "inbox", title: { zh: "收件箱", en: "Inbox" }, component: () => null },
    ],
  });

  // 受控 useState：跨渲染保留状态，才能观察 refreshAddons 之后的页面。
  const states = [];
  let cursor = 0;
  react.useState = (initial) => {
    const i = cursor++;
    if (!(i in states)) states[i] = typeof initial === "function" ? initial() : initial;
    return [states[i], (value) => { states[i] = typeof value === "function" ? value(states[i]) : value; }];
  };

  // 首帧只发出请求，等回包落地后再渲染一帧才是真正的页面（与首页栏目测试同一套做法）。
  async function renderPage() {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    cursor = 0;
    const first = mainSlot();
    first.type(first.props);
    await sleep(20);
    // 第二帧拿到插件列表，effect 里消费待办并改路由；第三帧才反映新的路由。
    let page = null;
    for (let i = 0; i < 2; i++) {
      cursor = 0;
      const el = mainSlot();
      page = el.type(el.props);
      await sleep(5);
    }
    return page;
  }

  return { sandbox, host: sandbox.__WB_HOST__, panels, renderPage, mod };
}

/**
 * 展开函数组件元素：只展开「视图标签」这类纯展示组件（靠 views 参数识别），
 * 不去展开 Slot / ViewOutlet 等会打真实请求的容器组件。
 */
function expand(node, out = [], depth = 0) {
  if (!node || typeof node !== "object" || depth > 12) return out;
  out.push(node);
  if (typeof node.type === "function" && Array.isArray(node.props && node.props.views)) {
    expand(node.type(node.props), out, depth + 1);
    return out;
  }
  for (const child of kidsOf(node)) expand(child, out, depth + 1);
  return out;
}

function activeTab(page) {
  const tab = expand(page).find(
    (n) => n.type === "button" && typeof n.props?.className === "string" && /(^|\s)wb-tab on(\s|$)/.test(n.props.className),
  );
  return tab ? textOf(tab).trim() : null;
}

// ── A + B：未挂载时切面板并消费待办 ──
{
  const { host, panels, renderPage } = createHarness({ layout: {} });
  assert.equal(host.navigateAddon(""), false, "空 addonId 不应跳转");
  assert.equal(host.navigateAddon("wb-addon-message", "inbox"), true, "未挂载时应通过切面板完成跳转");
  assert.deepEqual(panels, ["workbench"], "应请外壳切换到工作台面板");

  const page = await renderPage();
  assert.equal(activeTab(page), "收件箱", "挂载后应直达目标视图，而不是插件的首页视图");
}

// ── C：已挂载时走页面内路由 ──
{
  const { host, panels, renderPage } = createHarness({ layout: {} });
  await renderPage();
  assert.equal(host.navigateAddon("wb-addon-message", "stats"), true, "已挂载时应页面内跳转成功");
  assert.deepEqual(panels, [], "已挂载时不应再切面板");
  const page = await renderPage();
  assert.equal(activeTab(page), "统计", "页面内跳转应切到目标视图");
}

// ── D：旧宿主没有 layout 服务时明确失败，且不残留待办 ──
{
  const { host, panels, renderPage } = createHarness({ layout: null });
  assert.equal(host.navigateAddon("wb-addon-message", "inbox"), false, "没有布局服务时应返回 false");
  assert.deepEqual(panels, [], "没有布局服务时不应调用 selectPanel");
  const page = await renderPage();
  assert.equal(activeTab(page), null, "失败跳转不应在挂载后悄悄改路由");
}

console.log("WORKBENCH NAVIGATION TEST PASS", { cases: ["未挂载切面板", "挂载消费待办", "已挂载内路由", "旧宿主降级"] });
