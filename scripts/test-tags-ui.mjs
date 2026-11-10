/**
 * 在 Node 里用 mini React 渲染 TagsView，验证标签改名的交互链路：
 * 行内改名按钮 → 双击 chip → Enter 保存（只调用一次 tags.update）→ Esc 取消 → 重名交给后端唯一约束拒绝。
 * 用法：node scripts/test-tags-ui.mjs（需先 pnpm build:clients）
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createContext, runInContext } from "node:vm";

const root = join(import.meta.dirname, "..");

function createReact() {
  const rt = {
    hooks: [],
    idx: 0,
    dirty: false,
    effects: [],
    pending: [],
    Component: null,
    props: null,
    tree: null,
  };

  function slot(init) {
    const i = rt.idx++;
    if (!(i in rt.hooks)) rt.hooks[i] = init;
    return i;
  }

  function schedule() {
    rt.dirty = true;
  }

  const React = {
    createElement: (type, props, ...children) => ({ type, key: props?.key, props: { ...props, children }, children }),
    Fragment: "Fragment",
    forwardRef: (fn) => fn,
    createContext: (v) => ({ Provider: (p) => p, Consumer: () => null, _currentValue: v }),
    useContext: () => ({}),
    useId: () => "id",
    useState(initial) {
      const i = slot({ v: typeof initial === "function" ? initial() : initial });
      const set = (next) => {
        const cur = rt.hooks[i].v;
        const val = typeof next === "function" ? next(cur) : next;
        if (val === cur) return;
        rt.hooks[i].v = val;
        schedule();
      };
      return [rt.hooks[i].v, set];
    },
    useRef(initial) {
      const i = slot({ v: { current: initial } });
      return rt.hooks[i].v;
    },
    useMemo(fn) {
      const i = slot({ v: fn() });
      return rt.hooks[i].v;
    },
    useCallback(fn) {
      const i = slot({ v: fn });
      return rt.hooks[i].v;
    },
    useEffect(fn, deps) {
      const i = rt.idx++;
      const prev = rt.hooks[i];
      const changed =
        !prev ||
        !deps ||
        !prev.deps ||
        deps.length !== prev.deps.length ||
        deps.some((d, k) => d !== prev.deps[k]);
      rt.effects.push({ i, fn, deps: deps || null, run: changed });
    },
  };

  // 迷你 React 只渲染一棵元素树；视图现在包了一层 useConfig 外壳，
  // 这里把函数组件就地展开（hook 槽位按调用顺序稳定即可）。
  function expand(node) {
    if (Array.isArray(node)) return node.map(expand);
    if (node === null || node === undefined || typeof node !== "object") return node;
    if (typeof node.type === "function") {
      return expand(node.type(Object.assign({}, node.props)));
    }
    const children = (node.children || []).map(expand);
    if (children.length === (node.children || []).length && children.every((c, i) => c === node.children[i])) return node;
    return Object.assign({}, node, { children });
  }

  rt.mount = (Component, props) => {
    rt.Component = Component;
    rt.props = props;
    let guard = 0;
    do {
      rt.dirty = false;
      rt.idx = 0;
      rt.effects = [];
      rt.tree = expand(Component(props));
      // 先把 effect 挂起来，再统一执行变更过的
      const runNow = rt.effects.filter((e) => e.run);
      for (const e of runNow) {
        const prev = rt.hooks[e.i];
        if (prev && typeof prev.cleanup === "function") prev.cleanup();
        rt.hooks[e.i] = { deps: e.deps, cleanup: e.fn() };
      }
      // effect 里常见的 setState 已经通过 schedule 置 dirty
    } while (rt.dirty && ++guard < 60);
    if (guard >= 60) throw new Error("render loop did not settle");
    return rt.tree;
  };
  rt.rerender = () => rt.mount(rt.Component, rt.props);
  rt.React = React;
  return rt;
}

const rt = createReact();
const React = rt.React;

const styles = [];
const document = {
  documentElement: { lang: "zh" },
  addEventListener() {}, removeEventListener() {},
  head: { appendChild: (el) => styles.push(el) },
  getElementById: () => null,
  createElement: () => ({ setAttribute() {}, appendChild() {}, textContent: "" }),
};
const sandbox = {
  console, setTimeout, clearTimeout,
  fetch: async () => ({ json: async () => ({ ok: true, domains: [] }) }),
  EventSource: function () { this.addEventListener = () => {}; },
  navigator: { language: "zh-CN" },
  document,
};
sandbox.window = sandbox;
createContext(sandbox);

// —— 假的宿主桥：记录 registerAddon ——
sandbox.__WB_HOST__ = { registerAddon: (mod) => { sandbox.__registered = mod; }, slots: {}, api: {} };

function load(file, id) {
  runInContext(readFileSync(file, "utf8"), sandbox, { filename: file });
  const factory = sandbox.__ModuleLoader__.modules[id];
  if (typeof factory !== "function") throw new Error("module not loaded: " + id);
  return factory((name) => (name === "react" ? React : {}));
}

const mod = load(root + "/packages/addons/tags/lib/client.js", "dsh-workbench-tags");
if (!mod) throw new Error("module missing");
mod.apply({});
const addon = sandbox.__registered;
const pkgVersion = JSON.parse(readFileSync(root + "/packages/addons/tags/package.json", "utf8")).version;
if (!addon || addon.version !== pkgVersion) throw new Error("bad addon version: " + (addon && addon.version) + " != " + pkgVersion);
const TagsView = addon.views.find((v) => v.id === "tags").component;
if (typeof TagsView !== "function") throw new Error("TagsView missing");

// —— 假 api ——
const calls = [];
const ROWS = [
  { id: "t1", name: "工作", createTime: "2026-11-01 10:00" },
  { id: "t2", name: "生活", createTime: "2026-11-02 10:00" },
];
const api = {
  subscribe() { return () => {}; },
  call(action, params) {
    calls.push({ action, params });
    if (action === "tags.list") {
      return Promise.resolve({ ok: true, result: { records: ROWS.slice(), total: 2, pages: 1 } });
    }
    if (action === "tags.stats") return Promise.resolve({ ok: true, result: { total: 2, used: 2, unused: 0, links: 3, items: 2 } });
    if (action === "tags.update") {
      const row = ROWS.find((r) => r.id === params.id);
      if (row) row.name = params.name;
      return Promise.resolve({ ok: true, result: { id: params.id, changed: true } });
    }
    return Promise.resolve({ ok: true, result: {} });
  },
};

const tick = () => new Promise((r) => setTimeout(r, 0));

function walk(node, out = []) {
  if (!node) return out;
  if (Array.isArray(node)) { for (const n of node) walk(n, out); return out; }
  if (typeof node !== "object") return out;
  out.push(node);
  for (const c of node.children || []) walk(c, out);
  return out;
}
function findAll(tree, pred) { return walk(tree).filter(pred); }
function byClass(tree, cls) { return findAll(tree, (n) => n.props && typeof n.props.className === "string" && n.props.className.split(" ").includes(cls)); }

const results = [];
function check(name, fn) {
  try { fn(); results.push(["PASS", name]); }
  catch (e) { results.push(["FAIL", name + " :: " + e.message]); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

rt.mount(TagsView, { api, lang: "zh" });
// 视图外壳先用 configGet 拉配置，ready 后才挂记录列表；多推几轮让 Promise/effect 落地。
for (let i = 0; i < 10 && byClass(rt.tree, "wbg-row").length === 0; i++) {
  await tick();
  rt.rerender();
  await tick();
}
rt.rerender();
await tick();

check("列表渲染出两行标签", () => {
  const rows = byClass(rt.tree, "wbg-row");
  assert(rows.length === 2, "rows=" + rows.length);
});

check("工具条有刷新按钮", () => {
  const btn = findAll(rt.tree, (n) => n.type === "button" && n.props["aria-label"] === "刷新")[0];
  assert(btn, "refresh button missing");
  assert(typeof btn.props.onClick === "function", "refresh button without onClick");
});

check("每行都有「重命名」按钮（aria-label=重命名）", () => {
  const btns = findAll(rt.tree, (n) => n.type === "button" && n.props["aria-label"] === "重命名");
  assert(btns.length === 2, "rename buttons=" + btns.length);
});

check("双击 chip 进入行内编辑", () => {
  const chip = findAll(rt.tree, (n) => n.props && n.props.className === "wbg-chip")[0];
  assert(chip, "chip missing");
  chip.props.onDoubleClick();
  rt.rerender();
  const input = byClass(rt.tree, "wbg-rename")[0];
  assert(input, "rename input not rendered");
  assert(input.props.value === "工作", "input value=" + input.props.value);
  assert(String(input.props.title).includes("不能与其它标签重复"), "title hint missing:" + input.props.title);
});

check("Enter 只提交一次 tags.update", async () => {
  const before = calls.filter((c) => c.action === "tags.update").length;
  const input = byClass(rt.tree, "wbg-rename")[0];
  input.props.onChange({ target: { value: "工作-新" } });
  rt.rerender();
  const input2 = byClass(rt.tree, "wbg-rename")[0];
  input2.props.onKeyDown({ key: "Enter", preventDefault() {} });
  rt.rerender();
  // 模拟紧随其后的 blur（真实浏览器里回车后会失焦）
  input2.props.onBlur();
  const after = calls.filter((c) => c.action === "tags.update");
  assert(after.length - before === 1, "update called " + (after.length - before) + " times");
  assert(after[after.length - 1].params.id === "t1", "wrong id");
  assert(after[after.length - 1].params.name === "工作-新", "wrong name");
});

await tick();
await tick();
rt.rerender();

check("改名成功后编辑态关闭并提示", () => {
  assert(byClass(rt.tree, "wbg-rename").length === 0, "still editing");
  const toast = byClass(rt.tree, "wbg-toast")[0];
  assert(toast && String(toast.children[0]).includes("已重命名"), "toast=" + (toast && toast.children));
});

check("Esc 取消不提交", () => {
  const chip = findAll(rt.tree, (n) => n.props && n.props.className === "wbg-chip")[0];
  chip.props.onDoubleClick();
  rt.rerender();
  const before = calls.filter((c) => c.action === "tags.update").length;
  const input = byClass(rt.tree, "wbg-rename")[0];
  input.props.onChange({ target: { value: "不该保存" } });
  rt.rerender();
  byClass(rt.tree, "wbg-rename")[0].props.onKeyDown({ key: "Escape", preventDefault() {} });
  rt.rerender();
  byClass(rt.tree, "wbg-rename")[0]?.props.onBlur?.();
  const after = calls.filter((c) => c.action === "tags.update").length;
  assert(after === before, "Esc 之后仍提交了 " + (after - before) + " 次");
  assert(byClass(rt.tree, "wbg-rename").length === 0, "still editing after Esc");
});

check("改成已存在的名字仍交给后端校验（唯一约束在后端）", async () => {
  const chip = findAll(rt.tree, (n) => n.props && n.props.className === "wbg-chip")[0];
  chip.props.onDoubleClick();
  rt.rerender();
  const before = calls.filter((c) => c.action === "tags.update").length;
  byClass(rt.tree, "wbg-rename")[0].props.onChange({ target: { value: "生活" } });
  rt.rerender();
  byClass(rt.tree, "wbg-rename")[0].props.onKeyDown({ key: "Enter", preventDefault() {} });
  const after = calls.filter((c) => c.action === "tags.update");
  assert(after.length - before === 1, "未提交重名保存");
  assert(after[after.length - 1].params.name === "生活", "name=" + after[after.length - 1].params.name);
});

check("空名被拦下且提示", () => {
  rt.rerender();
  const chip = findAll(rt.tree, (n) => n.props && n.props.className === "wbg-chip")[0];
  chip.props.onDoubleClick();
  rt.rerender();
  const before = calls.filter((c) => c.action === "tags.update").length;
  byClass(rt.tree, "wbg-rename")[0].props.onChange({ target: { value: "   " } });
  rt.rerender();
  byClass(rt.tree, "wbg-rename")[0].props.onKeyDown({ key: "Enter", preventDefault() {} });
  rt.rerender();
  const after = calls.filter((c) => c.action === "tags.update").length;
  assert(after === before, "空名被提交");
  const toast = byClass(rt.tree, "wbg-toast")[0];
  assert(toast && String(toast.children[0]).includes("不能为空"), "toast=" + (toast && toast.children));
});

// 同一客户端 bundle 验证统计页固定请求 100、只保留左列榜单以及区块开关。
const StatsView = addon.views.find((v) => v.id === "stats").component;
const navigations = [];
let statsSub = null;
async function mountStats(sections, count = 100, lang = "zh", itemTypes = []) {
  await tick();
  for (const slot of rt.hooks) if (typeof slot?.cleanup === "function") slot.cleanup();
  rt.hooks = [];
  statsSub = null;
  const statsApi = {
    subscribe(fn) { statsSub = fn; return () => {}; },
    call(action, params) {
      calls.push({ action, params });
      if (action === "tags.configGet") return Promise.resolve({ result: { values: { "stats.top": 5, "stats.sections": sections } } });
      return Promise.resolve({ result: {
        totals: { tags: count, mappings: count }, rates: {}, breakdowns: { itemTypes },
        rankings: { topTags: Array.from({ length: count }, (_, i) => ({ id: "t" + i, name: "标签" + i, count: count - i })) },
        lists: { stale: [], recent: [] }, trend: [], warnings: [],
      } });
    },
  };
  rt.mount(StatsView, { api: statsApi, lang, onNavigate: (view, params) => navigations.push({ view, params }) });
  for (let i = 0; i < 8; i++) { await tick(); rt.rerender(); }
}
await mountStats(["top", "usage", "types", "trend", "stale", "recent"]);
check("Top 100 左列独立请求且渲染全部100项", () => {
  const request = calls.filter((c) => c.action === "tags.statsReport").at(-1);
  assert(request.params.top === 5 && request.params.topTagsLimit === 100, "ranking request changed other list limits");
  const column = byClass(rt.tree, "wbg-top-column");
  assert(column.length === 1 && byClass(column[0], "wbg-top-row").length === 100, "left column missing rows");
  assert(byClass(rt.tree, "wbg-top-row").length === 100, "old ranking duplicated");
  assert(JSON.stringify(column[0]).includes("Top 100 标签"), "Chinese title missing");
});
check("排行单tabstop、可访问名称和点击跳转", () => {
  const rows = byClass(rt.tree, "wbg-top-row");
  assert(rows.filter((r) => r.props.tabIndex === 0).length === 1, "too many tabstops");
  assert(rows[0].props["aria-label"] === "第1名，标签0，100次", "accessible label");
  assert(byClass(rt.tree, "wbg-top-name")[0].props.title === "标签0", "name tooltip");
  rows[0].props.onClick();
  assert(navigations.at(-1).view === "tags" && navigations.at(-1).params.text === "标签0", "navigation filter");
  let focused = -1;
  rows[0].props.onKeyDown({ key: "End", preventDefault() {}, currentTarget: { parentElement: { querySelectorAll: () => rows.map((_, i) => ({ focus() { focused = i; } })) } } });
  rt.rerender();
  assert(focused === 99 && byClass(rt.tree, "wbg-top-row")[99].props.tabIndex === 0, "End key roving focus");
});
await mountStats(["top"], 1);
// 储物标签变化要驱动统计页自动刷新；无关事件不触发。
const statsCallsBefore = calls.filter((c) => c.action === "tags.statsReport").length;
if (typeof statsSub === "function") statsSub({ event: "storage-changed" });
await new Promise((r) => setTimeout(r, 900));
for (let i = 0; i < 4; i++) { await tick(); rt.rerender(); }
const statsCallsAfter = calls.filter((c) => c.action === "tags.statsReport").length;
check("储物标签变化触发统计刷新", () => assert(statsCallsAfter > statsCallsBefore, "storage-changed ignored"));
const noiseBefore = calls.filter((c) => c.action === "tags.statsReport").length;
if (typeof statsSub === "function") statsSub({ event: "storage-ping" });
await new Promise((r) => setTimeout(r, 900));
check("无关事件不触发统计刷新", () => assert(calls.filter((c) => c.action === "tags.statsReport").length === noiseBefore, "unrelated event reloaded"));

await mountStats(["types"], 3, "zh", [{ key: "storage", label: "物品", mappings: 16, items: 16 }]);
check("对象类型图例区分条数与对象", () => {
  const leg = byClass(rt.tree, "wbg-leg")[0];
  assert(leg && JSON.stringify(leg).includes("物品"), "zh storage label missing");
  assert(JSON.stringify(leg).includes("16 对象"), "object note missing");
  const svg = findAll(rt.tree, (n) => n.type === "svg" && n.props["aria-label"] && n.props["aria-label"].includes("16 条关联，16 个对象"))[0];
  assert(svg, "donut aria label missing link/object wording");
});
await mountStats(["types"], 3, "en", [{ key: "storage", label: "物品", mappings: 16, items: 16 }, { key: "other", label: "其他", mappings: 3, items: 2 }]);
check("英文类型名与未知类型", () => {
  const text = JSON.stringify(rt.tree);
  assert(text.includes("Items"), "en storage label missing");
  assert(text.includes("Other"), "en other label missing");
  assert(text.includes("16 objects"), "en object note missing");
  assert(!text.includes("物品"), "server zh label leaked in en UI");
});
await mountStats(["top"], 1);
check("单个标签横条不铺满", () => assert(byClass(rt.tree, "wbg-top-fill")[0].props.style.width === "50%", "single tag full bar"));
await mountStats(["usage"]);
check("关闭top区块不留空白左列", () => assert(byClass(rt.tree, "wbg-top-column").length === 0, "top still visible"));
await mountStats(["top"], 3, "en");
check("不足100项与英文标题", () => {
  assert(byClass(rt.tree, "wbg-top-row").length === 3, "short list padded or hidden");
  assert(JSON.stringify(rt.tree).includes("Top 100 tags"), "English title missing");
});
await mountStats(["top"], 0);
check("空库不显示空排行", () => assert(byClass(rt.tree, "wbg-top-column").length === 0, "empty ranking"));

for (const slot of rt.hooks) if (typeof slot?.cleanup === "function") slot.cleanup();
rt.hooks = [];
rt.mount(TagsView, { api, lang: "zh", viewParams: navigations[0].params });
for (let i = 0; i < 8; i++) { await tick(); rt.rerender(); }
check("跳转参数复用标签搜索请求", () => {
  const request = calls.filter((c) => c.action === "tags.list").at(-1);
  assert(request.params.text === "标签0", "tag filter did not reach list API");
  assert(byClass(rt.tree, "wbg-search")[0].props.value === "标签0", "search input did not reflect filter");
});

const fail = results.filter((r) => r[0] === "FAIL");
for (const [st, name] of results) console.log(st, "-", name);
console.log(fail.length ? "\nTAGS UI TEST FAIL (" + fail.length + ")" : "\nTAGS UI TEST PASS", { checks: results.length, actions: calls.length });
process.exit(fail.length ? 1 : 0);
