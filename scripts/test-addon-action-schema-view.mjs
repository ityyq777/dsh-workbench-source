// 「Action」共享视图回归：清单数据来自本插件自己注册的 <域>.actionSchema（插件自证），
// 覆盖字段渲染、搜索/筛选、搜索高亮、示例复制、原始 schema 展开、错误与空态，
// 并确认不走宿主统一 schema 接口。
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createReact } from "./data-ui-harness.mjs";

const DBG = (...args) => { if (process.env.DBG) console.log(...args); };

const require = createRequire(import.meta.url);
const { readFileSync } = require("node:fs");
const { dirname, resolve } = require("node:path");
const { createContext, runInContext } = require("node:vm");
const { fileURLToPath } = require("node:url");

// 共享视图在浏览器里跑真实 React；这里用 data-ui-harness 的最小 React 实现
// 顶替 require("react")，才能在不引 react-dom 的情况下同步渲染并断言。
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const VIEW_SRC = resolve(ROOT, "packages/addons/lib/action-schema-view.cjs");
const STYLE_SRC = resolve(ROOT, "packages/addons/lib/action-schema-style.cjs");
const HIGHLIGHT_SRC = resolve(ROOT, "packages/addons/lib/highlight.cjs");

function loadFactory(React) {
  const sandbox = createContext({ console, Promise, Set, Map, JSON, Object, Array, String, Number, Error, RegExp, Date });
  const cache = new Map();
  const requireStub = (name) => {
    if (name === "react") return React;
    if (name === "./action-schema-style.cjs") return loadOnce(STYLE_SRC);
    if (name === "./highlight.cjs") return loadOnce(HIGHLIGHT_SRC);
    throw new Error("Unexpected runtime dependency: " + name);
  };
  function loadOnce(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const mod = { exports: {} };
    cache.set(file, mod);
    runInContext("(function (module, exports, require) {" + readFileSync(file, "utf8") + "\n})", sandbox)(
      mod, mod.exports, requireStub,
    );
    return mod.exports;
  }
  if (cache.has(VIEW_SRC)) return cache.get(VIEW_SRC).exports;
  const mod = { exports: {} };
  cache.set(VIEW_SRC, mod);
  runInContext("(function (module, exports, require) {" + readFileSync(VIEW_SRC, "utf8") + "\n})", sandbox)(
    mod, mod.exports, requireStub,
  );
  return mod.exports;
}

const kids = (node) => {
  const c = node && node.props ? node.props.children : null;
  return c == null ? [] : Array.isArray(c) ? c.flat(Infinity).filter((x) => x != null) : [c];
};
const walk = (n) => (n && typeof n === "object" ? [n, ...kids(n).flatMap(walk)] : []);
const text = (n) => {
  if (n == null || typeof n === "boolean") return "";
  if (typeof n === "string" || typeof n === "number") return String(n);
  return kids(n).map(text).join(" ");
};
const hasClass = (n, cls) => String((n.props && n.props.className) || "").split(/\s+/).includes(cls);
const find = (tree, fn) => walk(tree).find(fn);
const findAll = (tree, fn) => walk(tree).filter(fn);

const fixture = {
  ok: true,
  readonly: true,
  shellVersion: "0.6.5",
  domains: [
    { id: "wb-addon-tasks", title: "任务", version: "3.4.6", enabled: true, error: null, actionCount: 2 },
    { id: "wb-addon-tags", title: "标签", version: "1.6.12", enabled: true, error: null, actionCount: 1 },
  ],
  actions: [
    {
      name: "tasks.list",
      domain: "wb-addon-tasks",
      description: "分页列出任务",
      required: ["pageNumber"],
      params: ["pageNumber", "titleKey"],
      input: {
        type: "object",
        properties: {
          pageNumber: { type: ["number", "string"], default: 1, minimum: 1, description: "页码" },
          titleKey: { type: "string", maxLength: 120, enum: ["a", "b"], description: "标题关键词" },
        },
        required: ["pageNumber"],
      },
      examples: [{ pageNumber: 1 }],
    },
    {
      name: "tasks.create",
      domain: "wb-addon-tasks",
      description: "新建任务",
      required: [],
      params: [],
      input: { type: "object", properties: {}, required: [] },
      examples: [],
    },
    {
      name: "tags.list",
      domain: "wb-addon-tags",
      description: "标签域 action，不应出现在任务页",
      required: [],
      params: [],
      input: { type: "object", properties: {} },
      examples: [],
    },
  ],
};

function mountView(api, lang = "zh") {
  const rt = createReact();
  const view = loadFactory(rt.React)({ domain: "tasks", prefix: "wbt" });
  let tree = rt.mount(view.ActionSchemaView, { api, lang });
  return {
    rt,
    view,
    tree: () => tree,
    rerender() { tree = rt.rerender(); return tree; },
  };
}

const settle = async () => { await new Promise((r) => setImmediate(r)); };

// ── 加载态 → 数据态 ────────────────────────────────────────────────
let calls = 0;
const api = {
  call: (name) => { calls++; assert.equal(name, "tasks.actionSchema"); return Promise.resolve({ ok: true, result: fixture }); },
  schema: () => { throw new Error("Action 页不得走宿主统一 schema 接口"); },
};
const m = mountView(api);
assert.match(text(m.tree()), /载入中/);
await settle();
let tree = m.rerender();
const body = text(tree);
assert.equal(calls, 1, "只应调用一次本域 actionSchema");
assert.match(body, /Action/);
assert.equal(body.includes("Action 清单"), false, "页签/页内标题不再叫「Action 清单」：页内标题直接是 Action");
assert.equal(text(find(tree, (n) => hasClass(n, "wbt-as-title"))), "Action");
assert.match(body, /wb-addon-tasks/);
assert.match(body, /v3\.4\.6/, "应展示本域版本");
assert.match(body, /v0\.6\.5/, "应展示宿主版本");
assert.match(body, /2 \/ 2 个 action/, "只统计本域 action 并显示命中数");
assert.ok(!body.includes("tags.list"), "跨域 action 不进本域清单");

// 卡片标题行不再重复域名：域只在页头出现一次（venv 期间曾每张卡都渲染一次）。
const cardHeads = findAll(tree, (n) => hasClass(n, "wbt-as-cardhead"));
assert.equal(cardHeads.length, 2, "两个本域 action 各一张卡");
for (const head of cardHeads) {
  const badges = findAll(head, (n) => hasClass(n, "wbt-as-badge")).map((n) => text(n));
  assert.equal(badges.some((b) => b.includes("wb-addon")), false, "卡片内不得再出现域 badge：" + badges.join("|"));
  assert.ok(badges.length >= 1 && badges.length <= 2, "卡片只保留参数数与必填两个 badge");
}

// 参数表：联合类型、必填、默认/范围/枚举/长度约束、参数说明都不伪造。
const rows = findAll(tree, (n) => n.type === "tr");
const listRow = rows.find((row) => text(row).includes("pageNumber") && text(row).includes("页码"));
assert.ok(listRow, "应渲染 pageNumber 参数行");
const listRowText = text(listRow);
assert.match(listRowText, /number \| string/, "联合类型按注册内容展示");
assert.match(listRowText, /必填/);
assert.match(listRowText, /默认 1/);
assert.match(listRowText, /范围 ≥1/);
const keyRow = rows.find((row) => text(row).includes("titleKey"));
assert.match(text(keyRow), /可选/);
assert.match(text(keyRow), /长度 0–120/);
assert.match(text(keyRow), /枚举 "a" \/ "b"/);

// 示例与原始 schema
const copyBtn = find(tree, (n) => n.props && n.props["data-copy-example"] === "tasks.list");
assert.ok(copyBtn, "有示例时应提供复制按钮");
copyBtn.props.onClick({ preventDefault() {} });
tree = m.rerender();
assert.match(text(tree), /已复制/);
const raws = findAll(tree, (n) => n.type === "details");
assert.ok(raws.length >= 2, "每个 action 都应能展开原始 schema");
assert.match(text(raws[0]), /原始 JSON Schema/);

// 无参数 action：明确写「无参数」，不能编造参数行
const createCard = findAll(tree, (n) => hasClass(n, "wbt-as-card")).find((c) => text(c).includes("tasks.create"));
assert.ok(createCard, "应渲染 tasks.create 卡片");
assert.match(text(createCard), /无参数/);
assert.match(text(createCard), /无示例/);

// ── 搜索与筛选 ────────────────────────────────────────────────────
const input = find(tree, (n) => n.type === "input");
assert.ok(input && input.props.type === "search");
input.props.onChange({ target: { value: "titleKey" } });
tree = m.rerender();
assert.match(text(tree), /1 \/ 2 个 action/);
assert.match(text(tree), /tasks\.list/);
assert.ok(!text(tree).includes("tasks.create"), "不匹配的 action 应被搜索过滤");

// ── 搜索命中高亮：与过滤同口径，类名带页面前缀，示例/原始 JSON 不插标签 ──
input.props.onChange({ target: { value: "TITLEKEY" } });
tree = m.rerender();
let marks = findAll(tree, (n) => n.type === "mark");
assert.ok(marks.length >= 1, "命中参数名时应有 mark 高亮");
assert.ok(marks.every((n) => hasClass(n, "wbt-as-hit")), "mark 类名应带页面前缀（wbt-as-hit）");
assert.ok(marks.some((n) => text(n) === "titleKey"), "ASCII 大小写不敏感：TITLEKEY 应高亮 titleKey 原文");
assert.ok(findAll(tree, (n) => n.type === "pre").every((p) => findAll(p, (n) => n.type === "mark").length === 0), "示例与原始 JSON Schema 不高亮");
assert.ok(marks.length > 0 && text(tree).includes("1 / 2 个 action"), "高亮与过滤同口径：过滤命中才高亮");

input.props.onChange({ target: { value: "tasks.list" } });
tree = m.rerender();
marks = findAll(tree, (n) => n.type === "mark");
assert.ok(marks.some((n) => text(n) === "tasks.list"), "正则特殊字符（.）应按字面匹配 action 名称");
assert.match(text(tree), /1 \/ 2 个 action/);

input.props.onChange({ target: { value: "(" } });
tree = m.rerender();
assert.match(text(tree), /没有匹配的 action/, "未转义的正则字符不应抛错，只按字面过滤");
assert.equal(findAll(tree, (n) => n.type === "mark").length, 0, "没有命中就不应有 mark");

input.props.onChange({ target: { value: "" } });
tree = m.rerender();
assert.equal(findAll(tree, (n) => n.type === "mark").length, 0, "清空搜索后不应残留 mark");
const selects = findAll(tree, (n) => n.type === "select");
// 工具栏三个下拉：必填筛选、参数类型、允许来源（来源筛选靠 actions.setActionOrigins 的 origins 生效）。
assert.equal(selects.length, 3, "应有必填筛选、参数类型与允许来源三个下拉");
assert.ok(
  findAll(tree, (n) => n.type === "select" && n.props["data-origin-filter"] !== undefined).length === 1,
  "来源筛选下拉应带 data-origin-filter 标记",
);
selects[0].props.onChange({ target: { value: "required" } });
tree = m.rerender();
assert.match(text(tree), /1 \/ 2 个 action/, "仅必填筛选命中 tasks.list");
selects[0].props.onChange({ target: { value: "optional" } });
tree = m.rerender();
assert.match(text(tree), /1 \/ 2 个 action/, "无必填筛选命中 tasks.create");
selects[0].props.onChange({ target: { value: "all" } });
tree = m.rerender();

// 类型筛选的选项来自真实 schema，筛选按参数真实类型命中
const typeSelect = findAll(tree, (n) => n.type === "select")[1];
const typeOptions = findAll(tree, (n) => n.type === "option").map((o) => o.props.value);
assert.ok(typeOptions.includes("number") && typeOptions.includes("string"), "类型下拉应包含 schema 中真实类型");
typeSelect.props.onChange({ target: { value: "string" } });
tree = m.rerender();
assert.match(text(tree), /1 \/ 2 个 action/, "只命中带 string 参数的 tasks.list");
typeSelect.props.onChange({ target: { value: "boolean" } });
tree = m.rerender();
assert.match(text(tree), /没有匹配的 action/);

// ── 错误态可重试，且不会退回伪造数据 ──────────────────────────────
let attempts = 0;
const failing = {
  call: () => { attempts++; return Promise.reject(new Error("connection rejected")); },
};
const m2 = mountView(failing);
await settle();
tree = m2.rerender();
assert.match(text(tree), /读取 action schema 失败/);
assert.match(text(tree), /connection rejected/);
const retry = find(tree, (n) => n.type === "button" && /重试/.test(text(n)));
assert.ok(retry, "错误态应提供重试按钮");
retry.props.onClick();
m2.rerender();
await settle();
assert.equal(attempts, 2, "重试应重新调用本域 actionSchema");

// ── 本域没有注册 action 时的空态 ───────────────────────────────────
const empty = { call: () => Promise.resolve({ ok: true, result: { shellVersion: "0.6.5", domains: [], actions: [] } }) };
const m3 = mountView(empty);
await settle();
tree = m3.rerender();
assert.match(text(tree), /该域没有注册 action/);

// ── 英文文案 ──────────────────────────────────────────────────────
const m4 = mountView(api, "en");
await settle();
tree = m4.rerender();
assert.match(text(tree), /Actions/);
assert.match(text(tree), /read-only/);
assert.match(text(tree), /2 \/ 2 actions/);
assert.match(text(tree), /No parameters/);

// ── 窄屏样式契约：≤760px 参数表换成带语义类名的字段网格，不能退回无标签的竖向堆叠 ──
// 参数单元格带 pname/ptype/pneed/pextra/pdesc 类名，样式靠它们把五列压成
// 「名称 类型 必填」一行 + 约束行 + 说明行；回归时任一环丢了都会在这里失败。
const cellClasses = findAll(tree, (n) => n.type === "td").map((n) => String(n.props.className || ""));
["wbt-as-pname", "wbt-as-ptype", "wbt-as-pneed", "wbt-as-pextra", "wbt-as-pdesc"].forEach((name) => {
  assert.ok(cellClasses.some((cls) => cls.split(/\s+/).includes(name)), "参数单元格应带 " + name);
});

const styleFactory = require(STYLE_SRC);
const styleEls = [];
const registry = {};
globalThis.document = {
  getElementById: (id) => registry[id] || null,
  createElement: () => {
    const el = { id: "", textContent: "", attrs: {}, setAttribute(key, value) { this.attrs[key] = value; } };
    styleEls.push(el);
    return el;
  },
  head: { appendChild: (el) => { registry[el.id] = el; } },
};
styleFactory("wbt", "wb-addon-tasks")();
delete globalThis.document;
const css = styleEls[0].textContent;
assert.match(css, /@media\(max-width:760px\)/, "应有窄屏断点");
assert.match(css, /grid-template-areas:"name type need"/, "窄屏参数行应按名称/类型/必填排成一行");
assert.ok(!/\.wbt-as-table td\{display:block;border-top:0/.test(css), "不能退回丢掉列名的纯竖向堆叠");
["pname", "ptype", "pneed", "pextra", "pdesc"].forEach((name) => {
  assert.ok(css.includes(".wbt-as-" + name + "{"), "窄屏样式应覆盖 .wbt-as-" + name);
});

// 视图只导出组件与域常量，不暴露任何写入口
const view = loadFactory(createReact().React)({ domain: "tasks", prefix: "wbt" });
assert.deepEqual(Object.keys(view).sort(), ["ActionSchemaView", "DOMAIN", "paramRows", "typeLabel"]);
assert.equal(typeof view.ActionSchemaView, "function");

console.log("ACTION SCHEMA VIEW TEST PASS");
