/** Shared data browser rendering/interaction regressions. Run after build:clients. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";
import { createReact } from "./data-ui-harness.mjs";
const longRemark = "长备注全文".repeat(50);
function walk(node, out = []) {
  if (Array.isArray(node)) { node.forEach(n => walk(n, out)); return out; }
  if (!node || typeof node !== "object") return out;
  out.push(node); (node.children || []).forEach(n => walk(n, out)); return out;
}
function text(node) {
  if (Array.isArray(node)) return node.map(text).join("");
  return node && typeof node === "object" ? text(node.children || []) : String(node ?? "");
}
async function exercise(domain, prefix, table) {
  const rt = createReact(), calls = [], styles = [], listeners = new Map(), timers = new Map();
  let timerId = 0, failRows = false, failIndex = false, deferIndex = false;
  const pendingIndexes = [], pendingTables = [];
  const secondTable = table + "_second";
  const sandbox = {
    console, URL,
    setTimeout(fn, delay) { const id = ++timerId; timers.set(id, { fn, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    navigator: { language: "zh-CN", clipboard: { writeText: async () => {} } },
    document: {
      documentElement: { lang: "zh" }, head: { appendChild: el => styles.push(el) },
      getElementById: () => null, createElement: () => ({ setAttribute() {} }),
      addEventListener: (name, fn) => listeners.set(name, fn),
      removeEventListener: name => listeners.delete(name),
    },
    __WB_HOST__: { registerAddon: addon => { sandbox.addon = addon; } },
  };
  sandbox.window = sandbox;
  createContext(sandbox);
  runInContext(readFileSync(new URL("../packages/addons/" + domain + "/lib/client.js", import.meta.url), "utf8"), sandbox);
  sandbox.__ModuleLoader__.modules["dsh-workbench-" + domain](name => name === "react" ? rt.React : {});
  const columns = [
    { name: "id", kind: "id", type: "TEXT" }, { name: "name", kind: "text", type: "TEXT" },
    { name: "stock", kind: "text", type: "TEXT" }, { name: "img_list", kind: "text", type: "TEXT" },
    { name: "remark", kind: "text", type: "TEXT" }, { name: "deleted_at", system: true, kind: "timestamp", type: "INTEGER" },
  ];
  const records = Array.from({ length: 12 }, (_, i) => ({ id: "r" + i, name: i === 11 ? "已删物品" : "物品" + i,
    stock: i % 2 ? "半瓶" : "1~2", img_list: JSON.stringify(["https://example.com/a.png", "https://example.com/b.png"]),
    remark: longRemark, deleted_at: i === 11 ? 1234 : null }));
  const api = {
    subscribe() { return () => {}; },
    async call(action, args = {}) {
      calls.push({ action, args });
      assert(action.startsWith(domain + "."), "must not fan out to other domains: " + action);
      if (action.endsWith("configGet")) return { ok: true, result: { values: { "data.pageSize": 10 } } };
      if (action.endsWith("dataTables")) {
        if (args.stats && deferIndex) return new Promise((resolve, reject) => pendingIndexes.push({ resolve, reject }));
        if (args.stats && failIndex) return { ok: false, error: "index unavailable" };
        return { ok: true, result: { tables: [{ name: table, label: { zh: "表目录项", en: "Table" }, count: 12, deletedCount: 1,
          columns, stats: { rows: 12, columnCount: columns.length, primaryKey: ["id"], indexes: [] } },
          { name: secondTable, label: { zh: "第二张表" }, count: 1, columns: [{ name: "other", kind: "text", type: "TEXT" }] }] } };
      }
      if (action.endsWith("dataQuery")) {
        if (args.table === secondTable) return new Promise((resolve, reject) => pendingTables.push({ resolve, reject }));
        if (failRows) return { ok: false, error: "query unavailable" };
        let rows = records.filter(r => args.includeDeleted || !r.deleted_at);
        for (const [key, value] of Object.entries(args.filters || {})) rows = rows.filter(r => String(r[key]).includes(value));
        if (args.search) rows = rows.filter(r => r.name.includes(args.search));
        const total = rows.length, pages = Math.max(1, Math.ceil(total / args.pageSize)), page = Math.min(args.page, pages);
        return { ok: true, result: { columns, rows: rows.slice((page - 1) * args.pageSize, page * args.pageSize), total, pages, page, pageSize: args.pageSize, queryMs: 1 } };
      }
      return { ok: true, result: {} };
    },
  };
  async function settle() { for (let i = 0; i < 12; i++) { await Promise.resolve(); rt.rerender(); } }
  async function debounce() { rt.rerender(); for (const [id, timer] of [...timers]) if (timer.delay === 280) { timers.delete(id); timer.fn(); } await settle(); }
  const nodes = pred => walk(rt.tree).filter(pred);
  const cls = suffix => nodes(n => (n.props.className || "").split(" ").includes(prefix + "-data-" + suffix));
  const button = label => nodes(n => n.type === "button" && text(n) === label)[0];
  const filter = name => nodes(n => n.type === "input" && n.props["aria-label"] === "筛选… " + name)[0];
  const view = sandbox.addon.views.find(v => v.id === "data").component;
  rt.mount(view, { api, lang: "zh" });
  assert(text(rt.tree).includes("载入中"));
  await settle();
  assert.equal(cls("side").length, 1); assert.equal(nodes(n => n.props.role === "tab").length, 2);
  assert.equal(cls("tr").length, 10); assert.equal(filter("deleted_at"), undefined);
  assert(styles.some(s => s.textContent.includes("position:sticky") && s.textContent.includes("grid-template-columns:216px")));
  button("下一页 ›").props.onClick(); await settle();
  assert.equal(cls("tr").length, 1); assert(button("下一页 ›").props.disabled); assert(text(rt.tree).includes("第 2 / 2 页"));
  filter("name").props.onChange({ target: { value: "物品0" } }); await debounce();
  assert.equal(cls("tr").length, 1); assert(text(cls("tr")).includes("物品0"));
  filter("name").props.onChange({ target: { value: "" } }); await debounce();
  filter("stock").props.onChange({ target: { value: "半瓶" } }); await debounce();
  assert.equal(cls("tr").length, 5); assert(cls("tr").every(r => text(r).includes("半瓶")));
  filter("stock").props.onChange({ target: { value: "无匹配库存" } }); await debounce();
  assert(text(rt.tree).includes("没有匹配的行")); assert.equal(cls("tr").length, 0);
  assert(filter("stock"), "empty result must keep filters available");
  filter("stock").props.onChange({ target: { value: "" } }); await debounce();
  nodes(n => n.type === "input" && n.props.type === "checkbox")[0].props.onChange({ target: { checked: true } }); await settle();
  button("下一页 ›").props.onClick(); await settle();
  assert.equal(cls("tr").length, 2); assert(text(rt.tree).includes("已删物品"));
  assert(cls("tr").some(n => n.props.className.includes("deleted")));
  nodes(n => n.type === "input" && n.props.type === "checkbox")[1].props.onChange({ target: { checked: true } }); await settle();
  assert(filter("deleted_at"));
  const queryCount = () => calls.filter(c => c.action.endsWith("dataQuery")).length;
  let before = queryCount(); button("刷新").props.onClick(); await settle(); assert(queryCount() > before);
  if (domain === "storage") {
    assert(nodes(n => n.type === "td" && n.props.title === "1~2").every(n => !n.props.className.includes("num")));
    assert(nodes(n => n.type === "img").length >= 2);
    assert(nodes(n => n.type === "img").every(n => n.props.loading === "lazy" && n.props.referrerPolicy === "no-referrer"));
    assert(nodes(n => n.type === "span" && n.props.title === longRemark).every(n => text(n).length === 81));
    const remarkCell = nodes(n => n.type === "td" && n.props.title === longRemark)[0];
    remarkCell.props.onDoubleClick(); await settle(); assert(nodes(n => n.type === "pre" && text(n) === longRemark).length);
    button("关闭").props.onClick(); await settle();
    nodes(n => n.type === "button" && String(n.props["aria-label"]).startsWith("预览图片"))[0].props.onClick({ stopPropagation() {} }); await settle();
    assert.equal(cls("gallery").length, 1); assert.equal(walk(cls("gallery")).filter(n => n.type === "img").length, 2);
    listeners.get("keydown")({ key: "Escape" }); await settle(); assert.equal(cls("gallery").length, 0);
    for (const bad of ['not json', '["javascript:alert(1)"]', '["https://user:secret@example.com/a.png"]']) {
      records[10].img_list = bad; button("刷新").props.onClick(); await settle();
      assert(nodes(n => n.type === "td" && n.props.title === bad).some(n => text(n) === bad));
      assert(!nodes(n => n.type === "img").some(n => /javascript:|secret/.test(n.props.src)));
    }
  }
  nodes(n => n.props.role === "tab" && text(n) === "表索引")[0].props.onClick(); await settle();
  assert.equal(cls("idx").length, 1); assert(text(rt.tree).includes(table));
  assert(calls.some(c => c.action === domain + ".dataTables" && c.args.stats === true));
  failIndex = true; button("刷新").props.onClick(); await settle(); assert(text(rt.tree).includes("index unavailable"));
  failIndex = false; button("刷新").props.onClick(); await settle();
  nodes(n => n.props.role === "tab" && text(n) === "行数据")[0].props.onClick(); await settle();
  // A late index success or failure cannot reopen a tab the user already left.
  deferIndex = true;
  for (const exit of ["tab", "directory"]) {
    for (const outcome of ["resolve", "reject"]) {
      nodes(n => n.props.role === "tab" && text(n) === "表索引")[0].props.onClick(); await settle();
      assert.equal(pendingIndexes.length, 1);
      if (exit === "tab") nodes(n => n.props.role === "tab" && text(n) === "行数据")[0].props.onClick();
      else cls("stab")[0].props.onClick();
      await settle();
      const pending = pendingIndexes.shift();
      if (outcome === "resolve") pending.resolve({ ok: true, result: { tables: [] } });
      else pending.reject(new Error("stale index error"));
      await settle();
      assert.equal(cls("idx").length, 0, exit + " must survive late " + outcome);
      assert(nodes(n => n.props.role === "tab" && text(n) === "行数据")[0].props["aria-selected"]);
      assert(!text(rt.tree).includes("stale index error"));
    }
  }
  deferIndex = false;
  failRows = true; button("刷新").props.onClick(); await settle(); assert(text(rt.tree).includes("query unavailable"));
  failRows = false; button("重试").props.onClick(); await settle(); assert(!text(rt.tree).includes("query unavailable"));
  filter("name").props.onChange({ target: { value: "物品0" } }); await debounce();
  cls("thbtn").find(n => text(n).startsWith("name")).props.onClick(); await settle();
  cls("stab")[1].props.onClick(); await settle();
  assert.equal(filter("name"), undefined, "old column filters must disappear while B is loading");
  assert.equal(cls("tr").length, 0, "A rows must not appear beneath B's title");
  assert(button("下一页 ›").props.disabled && button("‹ 上一页").props.disabled);
  const bRequests = calls.filter(c => c.action.endsWith("dataQuery") && c.args.table === secondTable);
  assert(bRequests.length > 0 && bRequests.every(c => !c.args.filters && !c.args.sort && c.args.page === 1), "B must never receive A's query state");
  for (const pending of pendingTables.splice(0)) pending.resolve({ ok: true, result: {
    columns: [{ name: "other", kind: "text", type: "TEXT" }], rows: [{ other: "第二表数据" }], total: 1, page: 1, pages: 1, pageSize: 10, queryMs: 1,
  } });
  await settle(); assert(filter("other")); assert(text(rt.tree).includes("第二表数据")); assert.equal(filter("name"), undefined);
  cls("stab")[0].props.onClick(); await settle(); assert(filter("name"));
  records.splice(0); button("刷新").props.onClick(); await settle(); assert(text(rt.tree).includes("这张表还没有数据"));
  for (const hook of rt.hooks) if (hook && hook.cleanup) hook.cleanup();
  console.log("DATA UI PASS", domain, "directory/tabs/filter/deleted/system/paging/refresh/errors/index");
}
for (const args of [["tasks", "wbt", "task"], ["tags", "wbg", "tag"], ["sites", "wbs", "site"], ["storage", "wbi", "storage"]]) await exercise(...args);
