/**
 * 宿主统一「数据」页（共享组件 packages/addons/lib/data-view.cjs）的渲染与交互回归自测。
 *
 * 12 个业务插件不再自带数据页，本脚本直接实例化共享组件：目录/页签/字段/筛选/软删/
 * 系统列/分页/刷新/错误/表索引全部覆盖，不依赖任何插件的构建产物。
 */
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { createReact, loadCjs } from "./data-ui-harness.mjs";

const dataViewFile = fileURLToPath(new URL("../packages/addons/lib/data-view.cjs", import.meta.url));

/** 数据页的配置外壳：真视图用各插件的 useConfig，这里只按模板读出分页大小。 */
function makeUseConfig(rt, domain) {
  return function useConfig(api, fallback) {
    const React = rt.React;
    const state = React.useState({ ready: false, values: Object.assign({}, fallback) });
    React.useEffect(() => {
      let alive = true;
      Promise.resolve(api.call(domain + ".configGet"))
        .then(reply => {
          if (!alive) return;
          const body = reply && reply.result !== undefined ? reply.result : reply;
          state[1]({ ready: true, values: Object.assign({}, fallback, (body && body.values) || {}) });
        })
        .catch(() => { if (alive) state[1]({ ready: true, values: Object.assign({}, fallback) }); });
      return () => { alive = false; };
    }, [api]);
    return state[0];
  };
}
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
  const indexes = [
    { name: "sqlite_autoindex_" + table + "_1", columns: ["id"], origin: "pk", unique: true },
    { name: "idx_" + table + "_" + "long_name_".repeat(16), columns: ["name"], origin: "c", unique: false },
    { name: "uk_dependency", columns: ["task_id", "depends_on_id"], origin: "c", unique: true },
    { name: "sqlite_autoindex_" + table + "_2", columns: ["name", "stock"], origin: "u", unique: true },
  ];
  const globals = {
    setTimeout(fn, delay) { const id = ++timerId; timers.set(id, { fn, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    navigator: { language: "zh-CN", clipboard: { writeText: async () => {} } },
    document: {
      documentElement: { lang: "zh" }, head: { appendChild: el => styles.push(el) },
      body: { appendChild() {}, removeChild() {} },
      getElementById: () => null, createElement: () => ({ setAttribute() {} }),
      addEventListener: (name, fn) => listeners.set(name, fn),
      removeEventListener: name => listeners.delete(name),
    },
  };
  const createDataView = loadCjs(dataViewFile, { react: rt.React }, globals);
  const columns = [
    { name: "id", kind: "id", type: "TEXT", pk: true }, { name: "name", kind: "text", type: "TEXT" },
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
          columns, stats: { rows: 12, columnCount: columns.length, primaryKey: ["id"], indexes } },
          { name: secondTable, label: { zh: "第二张表" }, count: 1, columns: [{ name: "other", kind: "text", type: "TEXT" }],
            stats: { rows: 1, columnCount: 1, primaryKey: ["a", "b"], indexes: [{ name: "sqlite_autoindex_second_1", columns: ["a", "b"], origin: "pk", unique: true }] } }] } };
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
  const view = createDataView({
    domain, prefix, tables: [table, secondTable], useConfig: makeUseConfig(rt, domain),
  }).DataView;
  rt.mount(view, { api, lang: "zh" });
  function assertLoading() {
    const busy = nodes(n => n.props["aria-busy"] === true || n.props["aria-busy"] === "true");
    assert(busy.some(n => (String(n.props["aria-label"] || "") + text(n)).includes("载入中")), domain + " exposes an accessible loading name and busy state");
  }
  assertLoading();
  await settle();
  assert.equal(cls("side").length, 1); assert.equal(nodes(n => n.props.role === "tab").length, 3);
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
  nodes(n => n.props && n.props.role === "switch")[0].props.onClick({ preventDefault: function () {} }); await settle();
  button("下一页 ›").props.onClick(); await settle();
  assert.equal(cls("tr").length, 2); assert(text(rt.tree).includes("已删物品"));
  assert(cls("tr").some(n => n.props.className.includes("deleted")));
  nodes(n => n.props && n.props.role === "switch")[1].props.onClick({ preventDefault: function () {} }); await settle();
  assert(filter("deleted_at"));
  const queryCount = () => calls.filter(c => c.action.endsWith("dataQuery")).length;
  let before = queryCount(); button("刷新").props.onClick(); await settle(); assert(queryCount() > before);
  // 文本列不右对齐；长文本双击开抽屉，抽屉用 pre 展示全文，Esc 可关。
  assert(nodes(n => n.type === "td" && n.props.title === "1~2").every(n => !n.props.className.includes("num")));
  const remarkCell = nodes(n => n.type === "td" && n.props.title === longRemark)[0];
  remarkCell.props.onDoubleClick(); await settle();
  assert(nodes(n => n.type === "pre" && text(n) === longRemark).length, "双击单元格打开全文抽屉");
  assert.equal(cls("drawer").length, 1);
  button("关闭").props.onClick(); await settle(); assert.equal(cls("drawer").length, 0);
  remarkCell.props.onDoubleClick(); await settle();
  listeners.get("keydown")({ key: "Escape" }); await settle(); assert.equal(cls("drawer").length, 0, "Esc 关闭抽屉");
  nodes(n => n.props.role === "tab" && text(n) === "表索引")[0].props.onClick(); await settle();
  assert.equal(cls("idx").length, 1); assert(text(rt.tree).includes(table));
  assert.equal(cls("stab").length, 2, "directory contains real tables only");
  assert(!text(cls("side")).includes("表索引"));
  assert.equal(cls("tr").length, 4, "one row per physical index");
  assert(text(cls("tr")[0]).includes("主键自动"));
  assert(text(cls("tr")[1]).includes(indexes[1].name));
  assert(text(cls("tr")[2]).includes("task_id, depends_on_id唯一显式创建12"));
  assert(text(cls("tr")[3]).includes("name, stock唯一自动12"));
  assert(text(cls("idxsum")).includes("行数 12列数 6共 4 个索引"));
  assert(text(cls("idxsub")).includes("不是索引条目数"));
  assert(styles.some(s => s.textContent.includes("table-layout:fixed") && s.textContent.includes("overflow-wrap:anywhere")));
  const statsCalls = () => calls.filter(c => c.args.stats).length;
  const beforeSwitch = statsCalls();
  cls("stab")[1].props.onClick(); await settle();
  assert.equal(statsCalls(), beforeSwitch, "switching table uses cached stats");
  assert.equal(cls("idx").length, 1, "table selection keeps index tab open");
  assert(text(cls("idx")).includes(secondTable));
  assert(text(cls("idx")).includes("该表除主键外没有额外索引"));
  assert.equal(cls("tr").length, 0, "primary-key-only tables do not render an empty table");
  assert(!text(cls("idx")).includes("uk_dependency"));
  cls("stab")[0].props.onClick(); await settle();
  assert.equal(cls("tr").length, 4);
  assert(calls.some(c => c.action === domain + ".dataTables" && c.args.stats === true));
  failIndex = true; button("刷新").props.onClick(); await settle(); assert(text(rt.tree).includes("index unavailable"));
  failIndex = false; button("刷新").props.onClick(); await settle();
  nodes(n => n.props.role === "tab" && text(n) === "行数据")[0].props.onClick(); await settle();
  // A late index success or failure cannot reopen a tab the user already left.
  deferIndex = true;
  for (const exit of ["tab"]) {
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
  // Switching while stats are pending renders the new active table without another request.
  nodes(n => n.props.role === "tab" && text(n) === "表索引")[0].props.onClick(); await settle();
  const pendingSwitchCount = calls.length;
  cls("stab")[1].props.onClick(); await settle();
  assert.equal(calls.length, pendingSwitchCount);
  pendingIndexes.shift().resolve({ ok: true, result: { tables: [
    { name: table, stats: { rows: 12, indexes } },
    { name: secondTable, stats: { rows: 1, columnCount: 2, indexes: [indexes[3]] } },
  ] } });
  await settle();
  assert.equal(cls("tr").length, 1, "automatic unique index is an extra index");
  assert(text(cls("tr")).includes("唯一自动1"));
  assert(text(cls("idx")).includes(secondTable));
  // A second refresh supersedes both success and failure of the first request.
  for (const outcome of ["resolve", "reject"]) {
    button("刷新").props.onClick(); await settle();
    button("刷新").props.onClick(); await settle();
    const [stale, latest] = pendingIndexes.splice(0);
    latest.resolve({ tables: [{ name: secondTable, stats: { rows: 7, columnCount: 2, indexes: [] } }] });
    await settle();
    if (outcome === "resolve") stale.resolve({ tables: [{ name: secondTable, stats: { rows: 99, indexes } }] });
    else stale.reject(new Error("stale refresh error"));
    await settle();
    assert(text(cls("idxsum")).includes("行数 7列数 2共 0 个索引"));
    assert(text(cls("idx")).includes("该表除主键外没有额外索引"));
    assert(!text(rt.tree).includes("stale refresh error"));
  }
  nodes(n => n.props.role === "tab" && text(n) === "行数据")[0].props.onClick(); await settle();
  cls("stab")[0].props.onClick(); await settle();
  deferIndex = false;
  failRows = true; button("刷新").props.onClick(); await settle(); assert(text(rt.tree).includes("query unavailable"));
  failRows = false; button("重试").props.onClick(); await settle(); assert(!text(rt.tree).includes("query unavailable"));
  filter("name").props.onChange({ target: { value: "物品0" } }); await debounce();
  cls("thbtn").find(n => text(n).startsWith("name")).props.onClick(); await settle();
  cls("stab")[1].props.onClick(); await settle();
  assertLoading();
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
  // 字段页签：只用 dataTables 的列元信息，0 行表也要列出完整字段（含中文名、类型、主键）。
  assert.equal(nodes(n => n.props.role === "tab").length, 3, "行数据 / 字段 / 表索引 三个页签");
  nodes(n => n.props.role === "tab" && text(n) === "字段")[0].props.onClick(); await settle();
  assert.equal(cls("idx").length, 1);
  const fieldHead = text(cls("table").find(n => n.type === "table"));
  for (const head of ["字段名", "中文名", "类型", "主键", "系统列"]) assert(fieldHead.includes(head), "字段页签缺表头 " + head);
  assert(!fieldHead.includes("可空"), "没有 notnull 元信息时不渲染可空列");
  const fieldsOn = cls("tr").length;
  // 字段页签是表结构说明：系统列也要列出来（系统列开关只管行数据页签）。
  assert(fieldsOn === 5 || fieldsOn === 6, "字段页签列出声明列");
  assert(text(cls("tr")[0]).includes("id")); assert(text(cls("tr")[0]).includes("是"), "主键列显示是");
  assert(text(cls("tr")).includes("deleted_at"), "字段页签也要列出系统列");
  assert(text(cls("idxsub")).includes("共 " + fieldsOn + " 个字段"));
  const rowsTab = () => nodes(n => n.props.role === "tab" && text(n) === "行数据")[0];
  const fieldsTab = () => nodes(n => n.props.role === "tab" && text(n) === "字段")[0];
  // 系统列开关只影响行数据：切到行数据打开系统列再回字段页签，字段数不变。
  rowsTab().props.onClick(); await settle();
  nodes(n => n.props && n.props.role === "switch")[1].props.onClick({ preventDefault: function () {} }); await settle();
  fieldsTab().props.onClick(); await settle();
  assert.equal(cls("tr").length, fieldsOn, "系统列开关不影响字段页签");
  rowsTab().props.onClick(); await settle();
  nodes(n => n.props && n.props.role === "switch")[1].props.onClick({ preventDefault: function () {} }); await settle();
  fieldsTab().props.onClick(); await settle();
  assert.equal(cls("tr").length, fieldsOn);
  // 0 行表在「行数据」页签仍要有完整表头：列来自声明列而不是行派生。
  nodes(n => n.props.role === "tab" && text(n) === "行数据")[0].props.onClick(); await settle();
  const emptyHead = text(cls("table").find(n => n.type === "table"));
  for (const head of ["id", "name", "remark"]) assert(emptyHead.includes(head), "空表表头缺列 " + head);
  assert(filter("name"), "空表也应保留列筛选");
  for (const hook of rt.hooks) if (hook && hook.cleanup) hook.cleanup();
  console.log("DATA UI PASS", domain, "directory/tabs/fields/filter/deleted/system/paging/refresh/errors/index");
}
await exercise("tasks", "wbt", "task");
console.log("DATA UI PASS: 宿主统一数据页（共享 data-view.cjs）覆盖目录/三页签/字段/筛选/软删/系统列/分页/刷新/错误/表索引缓存");
