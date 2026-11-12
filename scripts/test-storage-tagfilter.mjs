// 储物标签查询控件的源码级渲染/交互测试：首屏一页、滚动分页去重、200ms 防抖、
// 多选清除、已选跨页保留、不可用时隐藏、编辑弹窗分页与保存口径。
import assert from "node:assert/strict";
import { loadLucideReact } from "./storage-visual-test-runtime.mjs";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { runInNewContext } from "node:vm";

let active, dirty = false, effects = [], tree;
const frames = new Map(), listeners = new Set(), timers = new Map(), cache = new Map();
let timerId = 0;
const React = {
  createElement(type, props, ...children) { return { type, props: { ...props, children }, children }; },
  useState(initial) {
    const f = active, i = f.i++;
    if (typeof initial === "function") initial = initial();
    if (!(i in f.slots)) f.slots[i] = initial;
    return [f.slots[i], v => { f.slots[i] = typeof v === "function" ? v(f.slots[i]) : v; dirty = true; }];
  },
  useRef(initial) { const f = active, i = f.i++; return f.slots[i] ||= { current: initial }; },
  useCallback(fn, deps) {
    const f = active, i = f.i++, old = f.slots[i];
    if (!old || old.deps.length !== deps.length || deps.some((v, j) => v !== old.deps[j])) f.slots[i] = { deps, fn };
    return f.slots[i].fn;
  },
  useEffect(fn, deps) {
    const f = active, i = f.i++, old = f.slots[i];
    if (!old || deps.some((v, j) => v !== old.deps[j])) effects.push(() => { old?.cleanup?.(); f.slots[i] = { deps, cleanup: fn() }; });
  },
};
const document = { activeElement: null, addEventListener: (n, f) => listeners.add(f), removeEventListener: (n, f) => listeners.delete(f) };
function load(file) {
  file = resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  runInNewContext(readFileSync(file, "utf8"), {
    module, URL, document,
    setTimeout: fn => { timers.set(++timerId, fn); return timerId; },
    clearTimeout: id => timers.delete(id),
    require: n => n === "react" ? React : n.startsWith("lucide-react/icons/") ? loadLucideReact(React, n) : load(resolve(dirname(file), n)),
  }, { filename: file });
  return module.exports;
}
const TagFilter = load("packages/addons/storage/client/ui/tagfilter.cjs");
const Editor = load("packages/addons/storage/client/modals/editor.cjs").Editor;
const Records = load("packages/addons/storage/client/views/records.cjs").Records;

const allTags = Array.from({ length: 45 }, (_, i) => ({ id: "g" + i, name: "标签" + i }));
const calls = [];
let page2Duplicate = false;
const api = {
  async call(name, args = {}) {
    calls.push({ name, args: JSON.parse(JSON.stringify(args)) });
    let result;
    if (name === "storageTags.search") {
      const size = args.pageSize || 20, pageNumber = args.pageNumber || 1;
      const matched = allTags.filter(t => t.name.includes(args.text || ""));
      const pages = Math.max(1, Math.ceil(matched.length / size));
      const current = Math.min(pageNumber, pages);
      let pageTags = matched.slice((current - 1) * size, current * size);
      if (page2Duplicate && current === 2) pageTags = [allTags[0]].concat(pageTags);
      result = { records: pageTags, total: matched.length, pages, current, size, pageable: true };
    } else if (name === "storageTags.byIds") {
      result = { records: allTags.filter(t => args.ids.includes(t.id)) };
    } else if (name === "storage.capabilities") {
      result = { tags: true };
    } else if (name === "storage.configGet") {
      result = { values: { "list.pageSize": 12, "ui.confirmDelete": true } };
    } else if (name === "storage.list") {
      result = { records: [{ id: "r1", name: "物品一", tags: [{ id: "g0", name: "标签0" }] }], total: 1, pages: 1, current: 1 };
    } else if (name === "storage.update" || name === "storage.create") {
      result = { ok: true };
    } else {
      throw Error("Unexpected action " + name);
    }
    return { ok: true, result };
  },
};

function expand(n, path = "root", seen) {
  if (Array.isArray(n)) return n.map((v, i) => expand(v, path + "/" + (v?.props?.key ?? i), seen));
  if (!n || typeof n !== "object") return n;
  if (typeof n.type === "function") {
    const key = path + ":" + (n.type.name || "anon");
    seen.add(key);
    const f = frames.get(key) || { slots: [], i: 0 };
    frames.set(key, f);
    f.i = 0;
    active = f;
    return expand(n.type(n.props), key, seen);
  }
  return { ...n, children: expand(n.children, path, seen) };
}
function render(node) {
  let guard = 0;
  do {
    dirty = false; effects = [];
    const seen = new Set();
    tree = expand(node, "root", seen);
    for (const [k, f] of frames) if (!seen.has(k)) { for (const slot of f.slots) slot?.cleanup?.(); frames.delete(k); }
    for (const fn of effects) fn();
  } while (dirty && ++guard < 30);
  assert.ok(guard < 30, "render loop did not settle");
}
async function settle() { for (let i = 0; i < 12; i++) { await Promise.resolve(); if (dirty || !tree) render(current); } }
function flushTimers() { for (const fn of [...timers.values()]) fn(); timers.clear(); }
function all(n = tree, out = []) {
  if (Array.isArray(n)) { n.forEach(v => all(v, out)); return out; }
  if (n && typeof n === "object") { out.push(n); all(n.children, out); }
  return out;
}
function text(n) { return Array.isArray(n) ? n.map(text).join("") : n && typeof n === "object" ? text(n.children) : String(n ?? ""); }
const nodesOf = (cls) => all().filter(n => (n.props.className || "").split(" ").includes(cls));
const searchCalls = () => calls.filter(c => c.name === "storageTags.search");
const listCalls = () => calls.filter(c => c.name === "storage.list");

let current;
let changes;
function renderFilter(props) {
  frames.clear(); listeners.clear();
  current = React.createElement(TagFilter, { api, lang: "zh", enabled: true, ids: [], onChange: v => changes.push(v), reloadKey: 0, ...props });
  render(current);
}
async function openMenu() {
  const btn = all().find(n => n.type === "button" && text(n).includes("标签筛选"));
  assert.ok(btn, "标签筛选按钮存在");
  btn.props.onClick({ stopPropagation() {} });
  await settle();
  flushTimers();
  await settle();
}

// 1) 不可用时整个控件不渲染。
renderFilter({ enabled: false });
assert.equal(tree, null, "标签不可用时隐藏控件");

// 2) 首展只请求第一页，20 条一页，带上总数。
changes = []; calls.length = 0;
renderFilter({ enabled: true });
await openMenu();
assert.equal(searchCalls().length, 1, "展开只发一次请求");
assert.equal(searchCalls()[0].args.pageNumber, 1);
assert.equal(searchCalls()[0].args.pageSize, 20);
assert.match(text(nodesOf("wbi-tagmenu")[0]), /全部标签 · 45/);
assert.equal(nodesOf("wbi-tagopt").length, 20, "首屏一页 20 条");

// 3) 滚动触底加载下一页，重复 id 去重；到最后一页显示没有更多。
page2Duplicate = true;
nodesOf("wbi-taglist")[0].props.onScroll({ currentTarget: { scrollTop: 2000, clientHeight: 200, scrollHeight: 2200 } });
await settle();
assert.equal(searchCalls().length, 2);
assert.equal(searchCalls()[1].args.pageNumber, 2);
assert.equal(nodesOf("wbi-tagopt").length, 40, "追加时按 id 去重（g0 不重复）");
page2Duplicate = false;
nodesOf("wbi-taglist")[0].props.onScroll({ currentTarget: { scrollTop: 2000, clientHeight: 200, scrollHeight: 2200 } });
await settle();
assert.equal(searchCalls().length, 3);
assert.equal(nodesOf("wbi-tagopt").length, 45);
assert.equal(searchCalls().filter(c => c.args.pageNumber === 4).length, 0, "没有下一页就不再请求");
assert.match(text(nodesOf("wbi-tagmore")[0]), /没有更多/);

// 4) 勾选/取消都通过 onChange 回传字符串 id 数组。
const firstOption = nodesOf("wbi-tagopt")[0];
const firstBox = all(firstOption).find(n => n.type === "input");
firstBox.props.onChange();
assert.equal(JSON.stringify(changes.at(-1)), JSON.stringify(["g0"]));
changes.length = 0;

// 5) 已选置顶并带 × 移除；清空一次清掉全部。
renderFilter({ ids: ["g5"] });
await openMenu();
assert.match(text(nodesOf("wbi-tagsel")[0]), /已选 1/);
assert.match(text(nodesOf("wbi-tagselitem")[0]), /标签5/);
nodesOf("wbi-tagselitem")[0].props.onClick();
assert.equal(JSON.stringify(changes.at(-1)), "[]");
nodesOf("wbi-mini")[0].props.onClick();
assert.equal(JSON.stringify(changes.at(-1)), "[]");

// 6) Esc 关闭菜单（document 级监听）。
assert.ok(nodesOf("wbi-tagmenu").length);
for (const fn of [...listeners]) fn({ key: "Escape" });
await settle();
assert.equal(nodesOf("wbi-tagmenu").length, 0, "Esc 关闭菜单");

// 7) 搜索 200ms 防抖；无结果时显示「没有匹配的标签」。
calls.length = 0;
renderFilter({ enabled: true });
await openMenu();
const searchInput = all().find(n => n.type === "input" && n.props.type === "search");
searchInput.props.onChange({ target: { value: "不存在" } });
render(current);
assert.equal(searchCalls().length, 1, "防抖期间不请求");
flushTimers();
await settle();
assert.equal(searchCalls().length, 2);
assert.equal(searchCalls()[1].args.text, "不存在");
assert.equal(searchCalls()[1].args.pageNumber, 1, "搜索回到第一页");
assert.match(text(nodesOf("wbi-note")[0]), /没有匹配的标签/);

// 8) 编辑弹窗：标签每页 20，已选置顶，搜索与翻页都不丢已选。
calls.length = 0;
const item = { id: "s1", name: "物品一", tags: [{ id: "g0", name: "标签0" }], imgList: [] };
current = React.createElement(Editor, { api, lang: "zh", tagsEnabled: true, item, config: {}, onClose() {}, onSaved() {} });
render(current);
flushTimers();
await settle();
assert.equal(searchCalls()[0].args.pageSize, 20);
assert.equal(searchCalls()[0].args.pageNumber, 1);
const checkedNow = () => all().filter(n => n.type === "input" && n.props.type === "checkbox" && n.props.checked);
assert.equal(checkedNow().length, 1, "已选标签默认勾选");
nodesOf("wbi-tagoptions")[0].props.onScroll({ currentTarget: { scrollTop: 500, clientHeight: 200, scrollHeight: 700 } });
await settle();
assert.equal(searchCalls().at(-1).args.pageNumber, 2, "弹窗滚动加载下一页");
assert.equal(checkedNow().length, 1, "翻页后已选仍在");
const editorSearch = all().find(n => n.type === "input" && n.props.placeholder === "搜索已有标签");
editorSearch.props.onChange({ target: { value: "标签1" } });
render(current);
flushTimers();
await settle();
assert.equal(searchCalls().at(-1).args.pageNumber, 1, "搜索回第一页");
assert.equal(checkedNow().length, 1, "搜索后已选仍保留");
const form = all().find(n => n.type === "form");
form.props.onSubmit({ preventDefault() {} });
await settle();
const saved = calls.filter(c => c.name === "storage.update").at(-1);
assert.equal(JSON.stringify(saved.args.tagIds), JSON.stringify(["g0"]), "保存标签口径不变");

// 9) 记录页：多选标签一起进 storage.list，清除后回到不筛。
calls.length = 0; changes = [];
current = React.createElement(Records, { api, lang: "zh" });
render(current);
await settle();
assert.equal(listCalls().length > 0, true, "记录页加载列表");
assert.equal(listCalls().every(c => c.args.tagIds === undefined), true, "默认不带标签条件");
await openMenu();
const recCheckboxes = nodesOf("wbi-tagopt").map(n => all(n).find(x => x.type === "input"));
recCheckboxes[0].props.onChange();
await settle();
assert.equal(JSON.stringify(listCalls().at(-1).args.tagIds), JSON.stringify(["g0"]), "单选标签进请求");
assert.match(text(nodesOf("wbi-tagon")), /标签筛选 · 1/, "已选数量回显在按钮上");
render(current);
await settle();
assert.equal(nodesOf("wbi-tagmenu").length, 1, "选择后菜单保持展开");
const recCheckboxes2 = nodesOf("wbi-tagopt").map(n => all(n).find(x => x.type === "input"));
recCheckboxes2[1].props.onChange();
await settle();
assert.equal(JSON.stringify(listCalls().at(-1).args.tagIds), JSON.stringify(["g0", "g1"]), "多选标签一起进请求");
const clearBtn = all().find(n => n.type === "button" && text(n).trim() === "清空");
assert.ok(clearBtn, "下拉内清空按钮存在");
clearBtn.props.onClick();
await settle();
assert.equal(listCalls().at(-1).args.tagIds, undefined, "清空后不再按标签筛");
assert.equal(nodesOf("wbi-tagon").length, 0, "清空后按钮不再高亮");
assert.ok(all().some(n => n.type === "button" && /^标签筛选/.test(text(n))), "按钮退回无计数形态");

console.log("PASS storage tag filter: 首屏一页/滚动去重/防抖/多选清除/已选跨页保留/不可用隐藏/编辑弹窗分页保存");
