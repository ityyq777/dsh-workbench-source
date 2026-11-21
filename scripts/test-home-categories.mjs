/**
 * 首页栏目分组回归测试（不启动 DSH、不开浏览器）：
 *
 * A. 宿主契约：registerDomain 的 category 被解析进 listDomains；未声明/空串/未知 id
 *    一律落兜底栏目且只打日志、不阻断注册。
 * B. 栏目表：publicCategories() 顺序稳定、中英文齐全、有且只有一个兜底栏目。
 * C. 首页渲染：用最小 React stub 真实渲染壳首页，验证按栏目分段、段内保持注册顺序、
 *    空栏目不渲染、未知栏目落「其他」、宿主没下发栏目定义时回退单网格。
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createContext, runInContext } from "node:vm";

const root = new URL("../", import.meta.url).pathname;
const home = mkdtempSync(join(tmpdir(), "wb-home-cats-"));
process.env.WB_HOME = home;

// ── A + B：宿主侧 ──
async function hostSide() {
  const cleanups = [];
  let host = null;
  const warns = [];
  const origWarn = console.warn;
  console.warn = (...args) => { warns.push(args.join(" ")); };
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
  try {
    const shell = await import("../packages/shell/lib/index.js");
    shell.apply(fakeCtx);
    assert.ok(host, "宿主应 provide workbench 服务");

    const def = (id, extra) => ({ id, title: id, version: "0.0.1", tables: [], ...extra });
    host.registerDomain(def("wb-addon-alpha", { category: "work" }));
    host.registerDomain(def("wb-addon-beta", { category: "nope" }));
    host.registerDomain(def("wb-addon-gamma", { category: "   " }));
    host.registerDomain(def("wb-addon-delta"));

    const byId = new Map(host.listDomains().map((d) => [d.id, d]));
    assert.equal(byId.get("wb-addon-alpha").category, "work", "命中栏目应原样返回");
    assert.equal(byId.get("wb-addon-beta").category, "other", "未知栏目应落兜底");
    assert.equal(byId.get("wb-addon-gamma").category, "other", "空白栏目应落兜底");
    assert.equal(byId.get("wb-addon-delta").category, "other", "未声明栏目应落兜底");
    assert.ok(byId.has("wb-addon-beta"), "未知栏目不得阻断注册");

    const catLogs = warns.filter((w) => w.includes("栏目"));
    assert.ok(catLogs.some((w) => w.includes("未知栏目") && w.includes("nope")), "未知栏目应打日志并带上原值");
    assert.ok(catLogs.some((w) => w.includes("未声明")), "未声明栏目应打日志");
    assert.ok(!catLogs.some((w) => w.includes("wb-addon-alpha")), "命中栏目不应打日志");

  } finally {
    console.warn = origWarn;
  }
  const { publicCategories, resolveCategory } = await import("../packages/shell/lib/infra/categories.js");
  const cats = publicCategories();
  assert.equal(cats.length, 6, "栏目表应为 6 个栏目");
  assert.deepEqual(cats.map((c) => c.id), ["work", "comm", "assets", "finance", "auto", "other"], "栏目顺序即首页顺序");
  assert.equal(cats.filter((c) => c.fallback).length, 1, "有且只有一个兜底栏目");
  assert.equal(cats[cats.length - 1].fallback, true, "兜底栏目应排在最后");
  for (const c of cats) {
    assert.equal(typeof c.title.zh, "string", c.id + " 缺中文名");
    assert.ok(c.title.zh.length > 0, c.id + " 中文名为空");
    assert.equal(typeof c.title.en, "string", c.id + " 缺英文名");
  }
  assert.equal(resolveCategory(undefined).status, "missing");
  assert.equal(resolveCategory("").status, "missing");
  assert.equal(resolveCategory("work").status, "ok");
  assert.equal(resolveCategory("work").id, "work");
  assert.deepEqual(resolveCategory("zzz"), { id: "other", status: "unknown", declared: "zzz" });

  for (const fn of cleanups.reverse()) fn();
}

// ── C：客户端渲染 ──
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

function nodes(node) {
  const out = [];
  (function walk(n) {
    if (!n || typeof n !== "object") return;
    out.push(n);
    for (const child of [n.props?.children].flat(Infinity)) walk(child);
  })(node);
  return out;
}

/** 造一个最小浏览器沙箱，加载壳客户端并渲染首页。 */
async function renderHome({ domains, categories, lang }) {
  const react = reactStub();
  // useEffect 立即执行：让 useAddonStore 的 refreshAddons 真正发出请求。
  react.useEffect = (fn) => { const d = fn(); if (typeof d === "function") d(); };
  const jsx = { jsx: react.createElement, jsxs: react.createElement, Fragment: "Fragment" };
  const document = {
    documentElement: { lang: lang || "zh" },
    head: { appendChild: () => {} },
    getElementById: () => null,
    createElement: () => ({ setAttribute() {}, appendChild() {}, textContent: "" }),
  };
  let domainsPayload = { ok: true, domains: [], shellVersion: "0.8.2" };
  if (domains) domainsPayload = { ok: true, domains, shellVersion: "0.8.2" };
  if (categories) domainsPayload.categories = categories;
  const sandbox = {
    console, setTimeout, clearTimeout,
    fetch: async (url) => ({ json: async () => (String(url).includes("/workbench/api/domains") ? domainsPayload : { ok: true }) }),
    EventSource: function () { this.addEventListener = () => {}; this.close = () => {}; },
    navigator: { language: lang || "zh-CN" },
    document,
  };
  sandbox.window = sandbox;
  createContext(sandbox);
  runInContext(readFileSync(join(root, "packages/shell/client/client.js"), "utf8"), sandbox, { filename: "client.js" });
  const factory = sandbox.__ModuleLoader__.modules["dsh-workbench"];
  assert.ok(typeof factory === "function", "壳客户端模块应可加载");
  const mod = factory((name) => (name === "react" ? react : name === "react/jsx-runtime" ? jsx : {}));
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
  mod.apply(ctx);
  assert.ok(typeof mainSlot === "function", "应注册 main 插槽");
  // 受控 useState：跨多次渲染保留状态，才能观察 refreshAddons 之后的首页。
  const states = [];
  let cursor = 0;
  react.useState = (initial) => {
    const i = cursor++;
    if (!(i in states)) states[i] = typeof initial === "function" ? initial() : initial;
    return [states[i], (value) => { states[i] = typeof value === "function" ? value(states[i]) : value; }];
  };
  function renderPage() { cursor = 0; const el = mainSlot(); return el.type(el.props); }
  // 首帧后把 fetch 的回包跑完，再渲染真正的首页。
  renderPage();
  await new Promise((r) => setTimeout(r, 20));
  return renderPage();
}

const CATS = [
  { id: "work", title: { zh: "工作与计划", en: "Work & Planning" }, fallback: false },
  { id: "comm", title: { zh: "沟通与消息", en: "Communication" }, fallback: false },
  { id: "assets", title: { zh: "资产与资料", en: "Assets & Docs" }, fallback: false },
  { id: "other", title: { zh: "其他", en: "Other" }, fallback: true },
];

const DOMAINS = [
  { id: "wb-addon-tasks", title: "任务", version: "5.2.33", category: "work", views: [{ id: "stats", title: "统计" }], error: null, enabled: true },
  { id: "wb-addon-mail", title: "邮件", version: "0.4.5", category: "comm", views: [{ id: "stats", title: "统计" }], error: null, enabled: true },
  { id: "wb-addon-tags", title: "标签", version: "1.7.5", category: "work", views: [{ id: "stats", title: "统计" }], error: null, enabled: true },
  { id: "wb-addon-mystery", title: "神秘插件", version: "1.0.0", category: "nope", views: [{ id: "stats", title: "统计" }], error: null, enabled: true },
  { id: "wb-addon-legacy", title: "旧插件", version: "0.9.0", views: [{ id: "stats", title: "统计" }], error: null, enabled: true },
];

function sectionsOf(page) {
  return nodes(page)
    .filter((n) => n.type === "section" && n.props?.className === "wb-home-cat")
    .map((n) => {
      const inner = nodes(n);
      const head = inner.find((x) => x.props?.className === "wb-home-cat-head");
      const countEl = inner.find((x) => x.props?.className === "wb-home-cat-count");
      const grid = inner.find((x) => x.type === "div" && x.props?.className === "wb-home-grid");
      const cards = [grid?.props?.children].flat(Infinity).filter((c) => c && c.type === "button");
      return {
        title: head?.props?.children?.find?.((c) => c && c.type === "h3")?.props?.children,
        count: countEl?.props?.children,
        cards: cards.map((c) => nodes(c).find((x) => x.props?.className === "wb-home-title")?.props?.children),
      };
    });
}

try {
  await hostSide();

  // 1. 中文首页：顺序取宿主栏目表，空栏目（assets）不渲染，未知/未声明落「其他」。
  const zh = sectionsOf(await renderHome({ domains: DOMAINS, categories: CATS, lang: "zh" }));
  assert.deepEqual(zh.map((s) => s.title), ["工作与计划", "沟通与消息", "其他"], "栏目顺序与空栏目处理不符");
  assert.deepEqual(zh.map((s) => s.count), [2, 1, 2], "栏目插件数不符");
  assert.deepEqual(zh[0].cards, ["任务", "标签"], "栏目内应保持注册顺序");
  assert.deepEqual(zh[1].cards, ["邮件"], "沟通栏目内容不符");
  assert.deepEqual(zh[2].cards, ["神秘插件", "旧插件"], "未知/未声明栏目应落「其他」");
  assert.ok(!zh.some((s) => s.title === "资产与资料"), "空栏目不应渲染");

  // 2. 英文首页用 en 文案。
  const en = sectionsOf(await renderHome({ domains: DOMAINS, categories: CATS, lang: "en" }));
  assert.deepEqual(en.map((s) => s.title), ["Work & Planning", "Communication", "Other"], "英文栏目名不符");

  // 3. 宿主没下发栏目定义（旧插件包/旧宿主）：回退单网格，卡片一个不少。
  const legacy = await renderHome({ domains: DOMAINS, lang: "zh" });
  assert.equal(sectionsOf(legacy).length, 0, "没有栏目定义时不应分段");
  // 只数首页那片网格（「工作台管理」区是另一个 .wb-home-grid manage，卡片类名相同）。
  const homeGrid = nodes(legacy).find((n) => n.type === "div" && n.props?.className === "wb-home-grid");
  assert.ok(homeGrid, "回退时应渲染单个平铺网格");
  const flatCards = [homeGrid.props.children].flat(Infinity).filter((c) => c && c.type === "button");
  assert.equal(flatCards.length, DOMAINS.length, "回退单网格应平铺全部插件卡片");

  console.log("HOME CATEGORIES TEST PASS", { sections: zh.map((s) => s.title + "(" + s.count + ")") });
} finally {
  rmSync(home, { recursive: true, force: true });
}
