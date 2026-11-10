// 「Action 清单」共享视图回归：清单数据来自本插件自己注册的 <域>.actionSchema（插件自证），
// 覆盖字段渲染、搜索/筛选、示例复制、原始 schema 展开、错误与空态，并确认不走宿主统一 schema 接口。
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

function loadFactory(React) {
  const sandbox = createContext({ console, Promise, Set, Map, JSON, Object, Array, String, Number, Error, RegExp, Date });
  const cache = new Map();
  const requireStub = (name) => {
    if (name === "react") return React;
    if (name === "./action-schema-style.cjs") return loadStyle();
    throw new Error("Unexpected runtime dependency: " + name);
  };
  function loadStyle() {
    if (cache.has(STYLE_SRC)) return cache.get(STYLE_SRC).exports;
    const mod = { exports: {} };
    cache.set(STYLE_SRC, mod);
    runInContext("(function (module, exports, require) {" + readFileSync(STYLE_SRC, "utf8") + "\n})", sandbox)(
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
  schema: () => { throw new Error("Action 清单页不得走宿主统一 schema 接口"); },
};
const m = mountView(api);
assert.match(text(m.tree()), /载入中/);
await settle();
let tree = m.rerender();
const body = text(tree);
assert.equal(calls, 1, "只应调用一次本域 actionSchema");
assert.match(body, /Action 清单/);
assert.match(body, /wb-addon-tasks/);
assert.match(body, /v3\.4\.6/, "应展示本域版本");
assert.match(body, /v0\.6\.5/, "应展示宿主版本");
assert.match(body, /2 \/ 2 个 action/, "只统计本域 action 并显示命中数");
assert.ok(!body.includes("tags.list"), "跨域 action 不进本域清单");

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

input.props.onChange({ target: { value: "" } });
tree = m.rerender();
const selects = findAll(tree, (n) => n.type === "select");
assert.equal(selects.length, 2, "应有必填筛选与类型筛选两个下拉");
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

// 视图只导出组件与域常量，不暴露任何写入口
const view = loadFactory(createReact().React)({ domain: "tasks", prefix: "wbt" });
assert.deepEqual(Object.keys(view).sort(), ["ActionSchemaView", "DOMAIN", "paramRows", "typeLabel"]);
assert.equal(typeof view.ActionSchemaView, "function");

console.log("ACTION SCHEMA VIEW TEST PASS");
