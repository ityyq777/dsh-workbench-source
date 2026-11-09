import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = mkdtempSync(join(tmpdir(), "wb-config-"));
const db = new DatabaseSync(join(dir, "config.db"));
db.exec("CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL)");
// 标签表存在才算标签域可用（tagsAvailable 同时检查 hasAddon 与表）；本用例要验证标签名校验。
db.exec("CREATE TABLE IF NOT EXISTS tag (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, deleted_at INTEGER, rev INTEGER NOT NULL DEFAULT 1)");
db.exec("CREATE TABLE IF NOT EXISTS tag_mapping (id TEXT PRIMARY KEY, tag_id TEXT NOT NULL, item_id TEXT NOT NULL, item_type TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, deleted_at INTEGER, rev INTEGER NOT NULL DEFAULT 1)");
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
    hasDomain: function (x) { return !!(opts && opts.tags) && x === "wb-addon-tags"; },
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
function metaKeys() { return db.prepare("SELECT k,v FROM meta WHERE k LIKE 'config.%' ORDER BY k").all(); }

const tags = await load("../packages/addons/tags/lib/index.js", "wb-addon-tags");
const tasks = await load("../packages/addons/tasks/lib/index.js", "wb-addon-tasks", { tags: true });

// 1. 默认值
const g0 = tasks.call("tasks.configGet");
assert(g0.values["list.pageSize"] === 12, "tasks 默认分页应为 12");
assert(g0.values["ui.defaultTab"] === 0, "tasks 默认页签应为 0");
assert(g0.values["stats.recentPublishLimit"] === 10, "tasks 最近发布默认应为 10");
assert(g0.values["stats.sections"].includes("recentPublish"), "最近发布默认可见");
assert(g0.items.find(x => x.id === "stats.recentPublishLimit").group === "stats", "最近发布配置归属统计分组");
assert(g0.values["stats.recentDoneLimit"] === 10, "tasks 最近完成默认应为 10");
assert(g0.values["stats.recentShutdownLimit"] === 10, "tasks 最近关闭默认应为 10");
assert(g0.values["ui.confirmDelete"] === true, "tasks 删除确认默认应为 true");
assert(g0.items.length >= 18, "tasks 配置项数量不足：" + g0.items.length);
assert(Object.keys(g0.overrides).length === 0, "初始不应有覆盖项");

// 2. 未知键与越界都必须整批拒绝
mustThrow(() => tasks.call("tasks.configSet", { values: { "no.such.key": 1 } }), "no.such.key", "未知配置项应报错");
mustThrow(() => tasks.call("tasks.configSet", { values: { "list.pageSize": 999 } }), "list.pageSize", "越界分页应报错");
mustThrow(() => tasks.call("tasks.configSet", { values: { "list.pageSize": 24, "nope.key": 1 } }), "nope.key", "整批校验失败应报错");
assert(metaKeys().length === 0, "失败的批次不能写入任何键");
assert(tasks.call("tasks.configGet").values["list.pageSize"] === 12, "失败批次不能留下部分写入");

// 3. 正常写入与读取
const set1 = tasks.call("tasks.configSet", { values: { "list.pageSize": 24, "ui.defaultTab": 5 } });
assert(set1.ok !== false, "configSet 失败");
assert(metaKeys().length === 2, "应写入两个 meta 键，实际 " + metaKeys().length);
const g1 = tasks.call("tasks.configGet");
assert(g1.values["list.pageSize"] === 24 && g1.values["ui.defaultTab"] === 5, "覆盖值未生效");
assert(g1.overrides["list.pageSize"] === 24, "overrides 未标记修改项");
assert(db.prepare("SELECT COUNT(*) AS n FROM sync_change_log").get().n === 0, "配置写入不能进 sync_change_log");

// 4. 恢复默认
tasks.call("tasks.configReset", { ids: ["list.pageSize"] });
assert(tasks.call("tasks.configGet").values["list.pageSize"] === 12, "configReset 未恢复默认");
assert(!("list.pageSize" in tasks.call("tasks.configGet").overrides), "重置后不应再有覆盖项");

// 新发布条数可配置，越界拒绝，重置回默认。
for (const value of [0,51]) mustThrow(() => tasks.call("tasks.configSet", {values:{"stats.recentPublishLimit":value}}), "stats.recentPublishLimit", "最近发布条数越界应报错");
tasks.call("tasks.configSet", {values:{"stats.recentPublishLimit":7}});
assert(tasks.call("tasks.configGet").values["stats.recentPublishLimit"] === 7, "最近发布条数覆盖未生效");
tasks.call("tasks.configReset", {ids:["stats.recentPublishLimit"]});
assert(tasks.call("tasks.configGet").values["stats.recentPublishLimit"] === 10, "最近发布条数重置失败");

// 5. 服务端读取：每周起始日影响统计分桶
tasks.call("tasks.configSet", { values: { "stats.weekStartsOn": 0 } });
assert(tasks.call("tasks.statsReport", { range: "90d" }).range.weekStartsOn === 0, "周起始日未生效");
tasks.call("tasks.configSet", { values: { "stats.weekStartsOn": 1 } });
assert(tasks.call("tasks.statsReport", { range: "90d" }).range.weekStartsOn === 1, "周起始日未恢复");
const rep0 = tasks.call("tasks.statsReport", { range: "90d", recentDoneLimit: 3, recentShutdownLimit: 4 });
assert(Array.isArray(rep0.lists.recentDone), "缺少最近完成清单");
assert(Array.isArray(rep0.lists.recentShutdown), "缺少最近关闭清单");
assert(rep0.lists.recentDone.length <= 3, "最近完成条数未按参数截断");
assert(rep0.lists.recentShutdown.length <= 4, "最近关闭条数未按参数截断");
const rep1 = tasks.call("tasks.statsReport", { range: "90d", recentDoneLimit: 999, recentShutdownLimit: -1 });
assert(rep1.lists.recentDone.length <= 50, "最近完成条数未夹到上限");

const fixtureTableId = tasks.call("taskNodes.create", { parentId: "1", type: "1", name: "配置回归任务表" }).node.id;

// 6. 服务端读取：关掉自动建标签后，未知标签名必须报错
tasks.call("tasks.configSet", { values: { "form.autoCreateTags": false } });
mustThrow(() => tasks.call("tasks.create", { tableId: fixtureTableId, title: "配置测试任务", tags: ["绝不存在的标签"] }), "标签不存在", "未知标签应被拒绝");
const created = tasks.call("tasks.create", { tableId: fixtureTableId, title: "配置测试任务" });
assert(created.id || (created.task && created.task.id), "普通任务应能创建：" + JSON.stringify(created).slice(0, 200));
const newPublication = tasks.call("tasks.statsReport", {range:"90d"}).lists.recentPublish[0];
assert(newPublication.id === String(created.id || created.task.id) && newPublication.daysAgo === 0, "新建任务应出现在最近发布首行且距今天为0");

// 6.1 最近完成 / 最近关闭清单
const doneTask = tasks.call("tasks.create", { tableId: fixtureTableId, title: "完成过的任务", publishDate: "2026-01-01" });
const doneId = String(doneTask.id || (doneTask.task && doneTask.task.id));
tasks.call("tasks.complete", { id: doneId, date: "2026-01-05", difficulty: 2 });
const shutTask = tasks.call("tasks.create", { tableId: fixtureTableId, title: "关闭过的任务", publishDate: "2026-01-01" });
const shutId = String(shutTask.id || (shutTask.task && shutTask.task.id));
tasks.call("tasks.update", { id: shutId, type: "STATUS", status: "1", date: "2026-01-06" });
const rep2 = tasks.call("tasks.statsReport", { range: "90d", recentDoneLimit: 10, recentShutdownLimit: 10 });
assert(rep2.lists.recentDone.some(function (x) { return x.id === doneId; }), "最近完成缺少刚完成的任务");
assert(rep2.lists.recentShutdown.some(function (x) { return x.id === shutId; }), "最近关闭缺少刚关闭的任务");
const doneRow = rep2.lists.recentDone.find(function (x) { return x.id === doneId; });
assert(doneRow.date === "2026-01-05" && doneRow.daysAgo > 0 && doneRow.tableTitle, "最近完成行字段不完整：" + JSON.stringify(doneRow));

// 7. tags：名称上限与沉睡阈值
assert(tags.call("tags.configGet").items.length >= 10, "tags 配置项不足");
tags.call("tags.configSet", { values: { "form.maxNameLength": 8 } });
mustThrow(() => tags.call("tags.create", { name: "九个字符组成的名字" }), "8", "名称超长应被拒绝");
assert(tags.call("tags.create", { name: "八个字符名字" }).ok !== false, "恰好达到上限应允许");
tags.call("tags.configSet", { values: { "stats.staleDays": 30 } });
const tg = tags.call("tags.statsReport", { range: "30d" });
assert(tg && tg.lists && Array.isArray(tg.lists.stale), "tags 统计缺少 stale 列表");

// 8. sites：链接条数上限与默认可绑定
const sites = await load("../packages/addons/sites/lib/index.js", "wb-addon-sites");
assert(sites.call("sites.configGet").items.length >= 13, "sites 配置项不足");
const cfgDir = sites.call("siteNodes.create", { parentId: 0, name: "配置目录" }).node.id;
sites.call("sites.configSet", { values: { "form.maxLinks": 1 } });
mustThrow(() => sites.call("sites.create", { siteName: "配置站点", dirIds: [cfgDir], links: [{ url: "https://a.example" }, { url: "https://b.example" }] }), "1", "链接超限应被拒绝");
sites.call("sites.configSet", { values: { "form.defaultBindable": false } });
const site = sites.call("sites.create", { siteName: "配置站点", dirIds: [cfgDir], links: [{ url: "https://a.example" }] });
assert(site.site && Number(site.site.bindable) === 0, "默认可绑定配置未生效：" + JSON.stringify(site).slice(0, 200));

// 9. storage：本地配置隔离、校验与重置
const storage = await load("../packages/addons/storage/lib/index.js", "wb-addon-storage");
assert(storage.call("storage.configGet").values["list.pageSize"] === 16, "物品默认分页应为 16");
storage.call("storage.configSet", { values: { "list.pageSize": 24 } });
assert(storage.call("storage.configGet").values["list.pageSize"] === 24, "物品配置未保存");
mustThrow(() => storage.call("storage.configSet", { values: { "list.pageSize": 999 } }), "list.pageSize", "物品越界配置必须拒绝");
storage.call("storage.configReset", {});
assert(storage.call("storage.configGet").values["list.pageSize"] === 16, "物品配置重置未恢复默认");
storage.call("storage.configSet", { values: { "ui.confirmDelete": false } });

// 10. meta 键名规范
const keys = metaKeys().map((r) => r.k);
assert(keys.every((k) => /^config\.(tasks|tags|sites|storage)\.[a-z]/.test(k)), "meta 键前缀不规范：" + keys.join(","));
assert(keys.length >= 6, "meta 配置键数量异常：" + keys.length);

db.close();
rmSync(dir, { recursive: true, force: true });
console.log("CONFIG TEST PASS", { keys: keys.length, events: events.length });
