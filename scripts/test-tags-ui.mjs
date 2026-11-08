/**
 * 在 Node 里用 mini React 渲染 TagsView，验证标签改名的交互链路：
 * 行内改名按钮 → 双击 chip → Enter 保存（只调用一次 tags.update）→ Esc 取消 → 允许重名。
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
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
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

  rt.mount = (Component, props) => {
    rt.Component = Component;
    rt.props = props;
    let guard = 0;
    do {
      rt.dirty = false;
      rt.idx = 0;
      rt.effects = [];
      rt.tree = Component(props);
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
if (!addon || addon.version !== "1.4.2") throw new Error("bad addon version: " + (addon && addon.version));
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
await tick();
await tick();
rt.rerender();
await tick();

check("列表渲染出两行标签", () => {
  const rows = byClass(rt.tree, "wbg-row");
  assert(rows.length === 2, "rows=" + rows.length);
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
  assert(String(input.props.title).includes("允许重名"), "title hint missing");
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

check("改成已存在的名字不被前端拦截（允许重名）", async () => {
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

const fail = results.filter((r) => r[0] === "FAIL");
for (const [st, name] of results) console.log(st, "-", name);
console.log(fail.length ? "\nTAGS UI TEST FAIL (" + fail.length + ")" : "\nTAGS UI TEST PASS", { checks: results.length, actions: calls.length });
process.exit(fail.length ? 1 : 0);
