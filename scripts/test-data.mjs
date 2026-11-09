import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = mkdtempSync(join(tmpdir(), "wb-data-"));
const db = new DatabaseSync(join(dir, "data.db"));
db.exec("CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL)");
db.exec("CREATE TABLE IF NOT EXISTS sync_change_log (seq INTEGER PRIMARY KEY AUTOINCREMENT, table_name TEXT NOT NULL, row_id TEXT NOT NULL, op TEXT NOT NULL, payload TEXT, origin TEXT NOT NULL, updated_at INTEGER NOT NULL)");

const events = [];
async function load(rel, id, opts) {
  const defs = {};
  const api = {
    db,
    addon: { id: id, version: "0.0.0", dir },
    shellVersion: "0.0.0",
    log: function () {},
    emit: function (event, data) { events.push({ event, data }); },
    action: function (name, def) { defs[name] = def; },
    tool: function () {},
    hasAddon: function (x) { return !!(opts && opts.tags) && x === "wb-addon-tags"; },
  };
  const mod = await import(rel);
  mod.setup(api);
  return {
    call: function (name, args) { return defs[name].execute(args || {}, { origin: "ui", emit: api.emit }); },
    has: function (name) { return !!defs[name]; },
  };
}
function assert(cond, msg) { if (!cond) throw new Error("ASSERT: " + msg); }
function mustThrow(fn, part, msg) {
  try { fn(); } catch (e) {
    assert(String(e && e.message || e).includes(part), msg + "（实际：" + (e && e.message) + "）");
    return;
  }
  throw new Error("ASSERT: " + msg + "（没有抛错）");
}
function pragmaColumns(table) {
  return db.prepare("PRAGMA table_info(" + table + ")").all().map(function (c) { return c.name; });
}
function snap() {
  return {
    tasks: Number(db.prepare("SELECT COUNT(*) AS n FROM task").get().n),
    nodes: Number(db.prepare("SELECT COUNT(*) AS n FROM task_node").get().n),
    deps: Number(db.prepare("SELECT COUNT(*) AS n FROM task_dep").get().n),
    tags: Number(db.prepare("SELECT COUNT(*) AS n FROM tag").get().n),
    log: Number(db.prepare("SELECT COUNT(*) AS n FROM sync_change_log").get().n),
  };
}

const tags = await load("../packages/addons/tags/lib/index.js", "wb-addon-tags");
const tasks = await load("../packages/addons/tasks/lib/index.js", "wb-addon-tasks", { tags: true });
const sites = await load("../packages/addons/sites/lib/index.js", "wb-addon-sites", { tags: true });

// 1. 表清单必须是本插件负责的表，且不暴露 meta / sync_*
for (const [name, mod, expected] of [
  ["tasks", tasks, ["task", "task_dep", "task_node"]],
  ["tags", tags, ["tag", "tag_mapping"]],
  ["sites", sites, ["site", "site_node", "site_node_mapping", "site_account", "site_account_external"]],
]) {
  const payload = mod.call(name + ".dataTables");
  assert(payload.domain === name, name + " domain 不符");
  const names = payload.tables.map(function (t) { return t.name; });
  assert(JSON.stringify(names) === JSON.stringify(expected), name + " 表清单不符：" + names.join(","));
  assert(names.indexOf("meta") < 0 && !names.some(function (n) { return n.indexOf("sync_") === 0; }), name + " 暴露了平台表");
  for (const t of payload.tables) {
    const actual = pragmaColumns(t.name);
    const declared = t.columns.map(function (c) { return c.name; });
    assert(JSON.stringify(actual) === JSON.stringify(declared), name + "." + t.name + " 列与 PRAGMA 不一致");
    for (const c of t.columns) {
      if (["rev", "created_at", "updated_at", "deleted_at"].indexOf(c.name) >= 0) assert(c.system === true, t.name + "." + c.name + " 应标记为系统列");
      if (c.name === "id") assert(c.kind === "id", t.name + ".id 类型应为 id");
    }
    assert(Number.isFinite(t.count) && t.count >= 0, t.name + " 行数异常");
    assert(Number.isFinite(t.deletedCount) && t.deletedCount >= 0, t.name + " 删除数异常");
  }
}

// 1.1 表索引统计：stats=true 时给出列数/主键/索引/最近写入，且不改变原有字段
{
  const withStats = tasks.call("tasks.dataTables", { stats: true });
  const taskTb = withStats.tables.find(function (t) { return t.name === "task"; });
  assert(taskTb && taskTb.stats, "dataTables(stats=true) 未返回 stats");
  const st = taskTb.stats;
  assert(st.columnCount === pragmaColumns("task").length, "表索引列数不符：" + st.columnCount);
  assert(JSON.stringify(st.primaryKey) === JSON.stringify(["id"]), "表索引主键不符：" + JSON.stringify(st.primaryKey));
  assert(Array.isArray(st.indexes) && st.indexes.length >= 1, "表索引未列出索引：" + JSON.stringify(st.indexes));
  assert(st.indexes.every(function (ix) { return ix.name && Array.isArray(ix.columns) && typeof ix.unique === "boolean"; }), "索引结构不完整");
  assert(Number.isFinite(st.rows) && st.rows >= 0, "表索引行数异常");
  const plain = tasks.call("tasks.dataTables").tables.find(function (t) { return t.name === "task"; });
  assert(plain.stats === undefined, "未传 stats 时不应附带统计（保持响应体轻量）");
  assert(plain.count === taskTb.count, "带统计时行数与常规清单不一致");
  const sitesIndex = sites.call("sites.dataTables", { stats: true });
  const acct = sitesIndex.tables.find(function (t) { return t.name === "site_account"; });
  assert(acct && acct.stats && acct.stats.indexes.length >= 1, "站点账号表未给出索引信息");
}

// 2. 造数据：分页 / 搜索 / 排序
const ids = [];
for (let i = 1; i <= 12; i++) {
  const r = tasks.call("tasks.create", { title: "分页测试 " + (i < 10 ? "0" + i : String(i)) });
  ids.push(r.id);
}
const hit = tasks.call("tasks.create", { title: "进度 100% 达成" }).id;
const plain = tasks.call("tasks.create", { title: "普通任务" }).id;

const p1 = tasks.call("tasks.dataQuery", { table: "task", page: 1, pageSize: 10 });
assert(p1.rows.length === 10, "每页 10 行");
assert(p1.pageSize === 10 && p1.page === 1, "分页回显不符");
assert(p1.total >= 14, "总行数应至少 14，实际 " + p1.total);
assert(p1.pages === Math.ceil(p1.total / 10), "页数计算错误");
assert(p1.columns.every(function (c) { return c.name && c.type !== undefined; }), "列元信息不完整");

const pLast = tasks.call("tasks.dataQuery", { table: "task", page: 999, pageSize: 10 });
assert(pLast.page === pLast.pages, "越界页码应夹到最后一页");
const odd = tasks.call("tasks.dataQuery", { table: "task", page: 1, pageSize: 999 });
assert(odd.pageSize === 200, "pageSize 应就近夹到 200，实际 " + odd.pageSize);

const sorted = tasks.call("tasks.dataQuery", { table: "task", sort: "title", order: "asc", pageSize: 200 });
const titles = sorted.rows.map(function (r) { return r.title; });
const sortedOk = titles.every(function (t, i) { return i === 0 || titles[i - 1] <= t; });
assert(sortedOk, "按 title 升序排序无效");

mustThrow(() => tasks.call("tasks.dataQuery", { table: "sqlite_master" }), "未知数据表", "非法表名必须报错");
mustThrow(() => tasks.call("tasks.dataQuery", { table: "task", sort: "title; DROP TABLE task" }), "未知排序列", "非法排序列必须报错");

// 3. 搜索绑定参数与转义
const pct = tasks.call("tasks.dataQuery", { table: "task", search: "100%", pageSize: 200 });
assert(pct.total === 1 && pct.rows[0].id === hit, "搜索应命中含 100% 的那一行，实际 " + pct.total);
const onlyPct = tasks.call("tasks.dataQuery", { table: "task", search: "%", pageSize: 200 });
assert(onlyPct.total === 1, "% 应按字面量匹配（不能当通配符），实际 " + onlyPct.total);
const noUnderscore = tasks.call("tasks.dataQuery", { table: "task", search: "_", pageSize: 200 });
assert(noUnderscore.total === 0, "_ 应按字面量匹配，实际 " + noUnderscore.total);

// 3.1 逐列筛选：按列包含匹配，与 search/sort 叠加
const byTitle = tasks.call("tasks.dataQuery", { table: "task", filters: { title: "分页测试" }, pageSize: 200 });
assert(byTitle.total === 12 && byTitle.rows.every(function (r) { return r.title.indexOf("分页测试") >= 0; }), "列筛选 title 未生效，实际 " + byTitle.total);
assert(byTitle.filters.length === 1 && byTitle.filters[0].column === "title", "列筛选未回显");
const byTwo = tasks.call("tasks.dataQuery", { table: "task", filters: { title: "分页测试", id: ids[0] }, pageSize: 200 });
assert(byTwo.total === 1 && byTwo.rows[0].id === ids[0], "多列筛选应为 AND，实际 " + byTwo.total);
const emptyFilter = tasks.call("tasks.dataQuery", { table: "task", filters: { title: "  " }, pageSize: 200 });
assert(emptyFilter.total === p1.total, "空字符串筛选应被忽略");
const filteredSorted = tasks.call("tasks.dataQuery", { table: "task", filters: { title: "分页测试" }, sort: "title", order: "asc", pageSize: 200 });
const fTitles = filteredSorted.rows.map(function (r) { return r.title; });
assert(fTitles.every(function (t, i) { return i === 0 || fTitles[i - 1] <= t; }), "列筛选与排序叠加无效");
mustThrow(() => tasks.call("tasks.dataQuery", { table: "task", filters: { "title; DROP TABLE task": "x" } }), "未知筛选列", "非法筛选列必须报错");
mustThrow(() => tasks.call("tasks.dataQuery", { table: "task", filters: ["title"] }), "filters 需要是", "filters 传数组必须报错");

// 4. 软删除与 includeDeleted
const before = tasks.call("tasks.dataTables").tables.find(function (t) { return t.name === "task"; });
tasks.call("tasks.delete", { id: plain });
const after = tasks.call("tasks.dataTables").tables.find(function (t) { return t.name === "task"; });
assert(after.count === before.count - 1, "软删后 count 应减 1");
assert(after.deletedCount === before.deletedCount + 1, "软删后 deletedCount 应加 1");
const hidden = tasks.call("tasks.dataQuery", { table: "task", pageSize: 200 });
assert(!hidden.rows.some(function (r) { return r.id === plain; }), "默认不应返回已删除行");
const shown = tasks.call("tasks.dataQuery", { table: "task", includeDeleted: true, pageSize: 200 });
const delRow = shown.rows.find(function (r) { return r.id === plain; });
assert(!!delRow && delRow.deleted_at !== null && delRow.deleted_at !== undefined, "includeDeleted 应返回带 deleted_at 的行");

// 5. 只读：查询不写库、不产日志
const s0 = snap();
tasks.call("tasks.dataQuery", { table: "task", search: "分页", pageSize: 25 });
tasks.call("tasks.dataQuery", { table: "task_dep", pageSize: 10 });
tags.call("tags.dataQuery", { table: "tag", pageSize: 10 });
sites.call("sites.dataQuery", { table: "site", pageSize: 10 });
const s1 = snap();
assert(s0.tasks === s1.tasks && s0.nodes === s1.nodes && s0.deps === s1.deps && s0.tags === s1.tags, "只读查询改变了数据");
assert(s0.log === s1.log, "只读查询写入了 sync_change_log");

// 6. tags / sites 的最小闭环
const tg = tags.call("tags.create", { name: "数据页标签" });
assert(tags.call("tags.dataQuery", { table: "tag", search: "数据页" }).total === 1, "标签搜索应命中");
const mapped = tags.call("tags.dataQuery", { table: "tag_mapping", pageSize: 10 });
assert(Array.isArray(mapped.rows), "tag_mapping 可查询");
const dirNode = sites.call("siteNodes.create", { parentId: 0, name: "数据页目录" }).node.id;
sites.call("sites.create", { siteName: "数据页站点", dirIds: [dirNode], tagIds: [tg.id], links: [{ url: "https://data.example" }] });
const siteRows = sites.call("sites.dataQuery", { table: "site", search: "数据页", pageSize: 10 });
assert(siteRows.total === 1, "站点搜索应命中，实际 " + siteRows.total);
const nodeRows = sites.call("sites.dataQuery", { table: "site_node", pageSize: 50 });
assert(nodeRows.rows.some(function (r) { return r.name === "数据页目录"; }), "目录表应包含新建目录");
const mappingRows = sites.call("sites.dataQuery", { table: "site_node_mapping", pageSize: 50 });
assert(Array.isArray(mappingRows.rows), "目录映射可查询");

// 7. 表索引页只查本插件：三份 data.cjs 不再跨域 fan-out
for (const plug of ["tasks", "tags", "sites"]) {
  const src = readFileSync(new URL("../packages/addons/" + plug + "/client/data.cjs", import.meta.url), "utf8");
  assert(src.indexOf("ALL_DOMAINS") < 0 && src.indexOf("var DOMAINS = [") < 0, plug + "/data.cjs 仍保留跨插件域列表");
  assert(src.indexOf('d.id + ".dataTables"') < 0, plug + "/data.cjs 仍在按域循环调用 dataTables");
  assert(src.indexOf('api.call(DOMAIN + ".dataTables"') >= 0, plug + "/data.cjs 应只调用本域 dataTables");
  const idxCalls = src.split('api.call(DOMAIN + ".dataTables"').length - 1;
  assert(idxCalls === 2, plug + "/data.cjs 的 dataTables 调用次数应为 2（表目录 + 索引页），实际 " + idxCalls);
  assert(src.indexOf("domainLabel") < 0, plug + "/data.cjs 仍保留域列渲染");
  assert(src.indexOf("idxDomain") < 0, plug + "/data.cjs 仍保留「域」列文案");
}

rmSync(dir, { recursive: true, force: true });
console.log("DATA TEST PASS " + JSON.stringify({ tables: 8, events: events.length, deletionChecked: true }));
