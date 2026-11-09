// Source-level rendering and interaction tests; no generated bundles are overwritten.
import assert from "node:assert/strict";
import { loadLucideReact } from "./storage-visual-test-runtime.mjs";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { runInNewContext } from "node:vm";

let active;
const react = {
  createElement(type, props, ...children) { return { type, props: props || {}, children: children.flat(Infinity).filter(x => x != null && x !== false) }; },
  useState(initial) {
    const frame = active, i = frame.index++;
    if (!(i in frame.slots)) frame.slots[i] = initial;
    return [frame.slots[i], value => { frame.slots[i] = typeof value === "function" ? value(frame.slots[i]) : value; }];
  },
  useRef(initial) {
    const frame = active, i = frame.index++;
    return frame.slots[i] ||= { current: initial };
  },
  useEffect(fn, deps) {
    const frame = active, i = frame.index++, old = frame.slots[i];
    if (!old || deps.some((v, j) => v !== old.deps[j])) {
      frame.effects.push(() => { old?.cleanup?.(); frame.slots[i] = { deps, cleanup: fn() }; });
    }
  },
};
const cache = new Map();
function load(file) {
  file = resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  runInNewContext(readFileSync(file, "utf8"), {
    module, exports: module.exports, URL,
    require: name => name === "react" ? react : name.startsWith("lucide-react/icons/") ? loadLucideReact(react, name) : load(resolve(dirname(file), name)),
  }, { filename: file });
  return module.exports;
}
function renderer(component, props) {
  const frame = { slots: [], index: 0, effects: [] };
  return {
    render(next = props, measurement) {
      props = next; frame.index = 0; frame.effects = []; active = frame;
      const node = component(props);
      walk(node, n => { if (n.props.ref && measurement) n.props.ref.current = measurement; });
      for (const effect of frame.effects) effect();
      return node;
    },
  };
}
function walk(node, visit) {
  if (!node || typeof node !== "object") return;
  visit(node); for (const child of node.children || []) walk(child, visit);
}
function nodes(node, predicate) { const found = []; walk(node, n => { if (predicate(n)) found.push(n); }); return found; }
const cls = (node, name) => nodes(node, n => (n.props.className || "").split(" ").includes(name));
const { StorageCard } = load("packages/addons/storage/client/records.cjs");
const { Description } = load("packages/addons/lib/description.cjs");
function actual(node) {
  if (!node || typeof node !== "object") return node;
  if (typeof node.type === "function") return actual(node.type({ ...node.props, children: node.children }));
  return { ...node, children: node.children.map(actual) };
}
const calls = [];
const base = { item: { id: "empty", name: "No metadata", stock: 0 }, lang: "en", caps: true,
  date: value => value, onEdit: v => calls.push(["edit", v.id]), onDelete: v => calls.push(["delete", v.id]),
  onTag: v => calls.push(["tag", v.id]), onPreview: v => calls.push(["preview", v.url]) };
let card = renderer(StorageCard, base).render();
for (const name of ["wbi-tags", "wbi-metazone", "wbi-images"]) assert.equal(cls(card, name).length, 0, name + " must not leave an empty block");
assert.equal(cls(card, "wbi-stock")[0].children[1].children[0], 0, "zero stock remains visible");
for (const stock of [null, undefined, ""]) {
  const missing = cls(renderer(StorageCard, { ...base, item: { ...base.item, stock, unit: "box" } }).render(), "wbi-stock")[0];
  assert.equal(missing.children.length, 2, "missing stock has icon and dash, no unit");
  assert.equal(missing.children[1].children[0], "—");
}
for (const stock of [null, undefined, "", 0, "0", 5, "12"]) {
  const children = actual(cls(renderer(StorageCard, { ...base, item: { ...base.item, stock, unit: "盒" } }).render(), "wbi-stock")[0]).children;
  assert.equal(children[0].type, "svg");
  assert.match(children[0].props.className, /lucide-package(?:\s|$)/);
  assert.ok(nodes(children[0], n => n.type === "path").length > 0, "real package geometry renders first");
  const missing = stock == null || stock === "";
  assert.equal(children[1].children[0], missing ? "—" : stock);
  assert.equal(children.length, missing ? 2 : 3);
  if (!missing) assert.equal(children[2].children[0], "盒", "unit is last without manual separator spaces");
}
assert.equal(card.children.at(-1).props.className, "wbi-actions");
for (const button of cls(card, "wbi-actions")[0].children) button.props.onClick();
assert.deepEqual(calls, [["edit", "empty"], ["delete", "empty"]]);
const item = { id: "full", name: "LongName".repeat(40), stock: "12", unit: "件", brand: "Maker", remark: "Body",
  createTime: "2026-11-09", tags: [{ id: "tag", name: "标签" }],
  imgList: ["javascript:alert(1)", "https://example.test/1.png", "https://example.test/2.png", "https://example.test/3.png"] };
const full = renderer(StorageCard, { ...base, item });
card = full.render();
assert.equal(cls(card, "wbi-cardhead")[0].children[0].children[0], item.name);
assert.equal(card.children[1].props.className, "wbi-tags", "tags immediately follow heading");
assert.equal(card.children[2].props.className, "wbi-metazone", "metadata precedes body");
assert.equal(card.children[3].type, Description);
assert.equal(cls(card, "wbi-image").length, 1);
assert.equal(cls(card, "wbi-more")[0].children[0], "+2", "only safe hidden images count");
cls(card, "wbi-chip")[0].props.onClick();
cls(card, "wbi-more")[0].props.onClick();
card = full.render();
assert.equal(cls(card, "wbi-image").length, 3);
cls(card, "wbi-image")[2].props.onClick();
assert.deepEqual(calls.slice(-2), [["tag", "tag"], ["preview", "https://example.test/3.png"]]);
cls(card, "wbi-more")[0].props.onClick();
assert.equal(cls(full.render(), "wbi-image").length, 1);
const disabled = renderer(StorageCard, { ...base, item, busy: true, caps: false }).render();
assert.ok(cls(disabled, "wbi-chip")[0].props.disabled);
assert.ok(cls(disabled, "wbi-actions")[0].children.every(n => n.props.disabled));
for (const text of [null, "", "   "]) assert.equal(renderer(Description, { text }).render(), null);
const desc = renderer(Description, { text: "Long body", lang: "en" });
desc.render(undefined, { scrollHeight: 140, clientHeight: 60 });
let body = desc.render();
assert.equal(cls(body, "wb-desc-toggle")[0].props["aria-expanded"], false);
cls(body, "wb-desc-toggle")[0].props.onClick();
body = desc.render();
assert.equal(cls(body, "wb-desc-clamped").length, 0);
assert.equal(cls(body, "wb-desc-toggle")[0].children[0], "Collapse");
cls(body, "wb-desc-toggle")[0].props.onClick();
assert.equal(cls(desc.render(), "wb-desc-clamped").length, 1);
const short = renderer(Description, { text: "Short" });
short.render(undefined, { scrollHeight: 20, clientHeight: 20 });
assert.equal(cls(short.render(), "wb-desc-toggle").length, 0);
// Each description retains its own mode and never follows sibling/config changes.
for (const lang of ["en", "zh"]) {
  const first = renderer(Description, { text: "**first**", lang, bodyMode: "text" });
  const second = renderer(Description, { text: "**second**", lang });
  const toggle = tree => nodes(tree, n => n.props.mode && n.props.onChange)[0];
  const a = first.render(), b = second.render();
  assert.equal(toggle(a).props.mode, "text"); assert.equal(toggle(b).props.mode, "markdown");
  assert.notEqual(a.props["aria-labelledby"], b.props["aria-labelledby"]);
  assert.equal(a.props["aria-labelledby"], cls(a, "wb-body-label")[0].props.id);
  assert.equal(cls(a, "wb-desc-text")[0].children.length, 1, "label is outside clamped content");
  assert.equal(nodes(a, n => n.props.onDoubleClick).length, 0);
  toggle(a).props.onChange("markdown");
  assert.equal(toggle(first.render()).props.mode, "markdown");
  toggle(b).props.onChange("text");
  assert.equal(toggle(first.render({ text: "**first**", lang, bodyMode: "text" })).props.mode, "markdown");
  assert.equal(toggle(second.render()).props.mode, "text");
  const remount = renderer(Description, { text: "new", bodyMode: "text" });
  assert.equal(toggle(remount.render()).props.mode, "text");
}
assert.equal(renderer(StorageCard, { ...base, item, bodyMode: "text" }).render().children[3].props.bodyMode, "text");
console.log("STORAGE CARD TEST PASS: empty fields, hierarchy, safe gallery, callbacks, busy states, measured expand/collapse");
