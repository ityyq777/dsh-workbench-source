import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = mkdtempSync(join(tmpdir(), "wb-config-"));
const db = new DatabaseSync(join(dir, "config.db"));
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
function metaKeys() { return db.prepare("SELECT k,v FROM meta WHERE k LIKE 'config.%' ORDER BY k").all(); }

const tags = await load("../packages/addons/tags/lib/index.js", "wb-addon-tags");
const tasks = await load("../packages/addons/tasks/lib/index.js", "wb-addon-tasks", { tags: true });

// 1. 默认值
const g0 = tasks.call("tasks.configGet");
assert(g0.values["list.pageSize"] === 12, "tasks 默认分页应为 12");
assert(g0.values["ui.defaultTab"] === 0, "tasks 默认页签应为 0");
assert(g0.items.length >= 15, "tasks 配置项数量不足：" + g0.items.length);
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

// 5. 服务端读取：每周起始日影响统计分桶
tasks.call("tasks.configSet", { values: { "stats.weekStartsOn": 0 } });
assert(tasks.call("tasks.statsReport", { range: "90d" }).range.weekStartsOn === 0, "周起始日未生效");
tasks.call("tasks.configSet", { values: { "stats.weekStartsOn": 1 } });
assert(tasks.call("tasks.statsReport", { range: "90d" }).range.weekStartsOn === 1, "周起始日未恢复");

// 6. 服务端读取：关掉自动建标签后，未知标签名必须报错
tasks.call("tasks.configSet", { values: { "form.autoCreateTags": false } });
mustThrow(() => tasks.call("tasks.create", { title: "配置测试任务", tags: ["绝不存在的标签"] }), "标签不存在", "未知标签应被拒绝");
const created = tasks.call("tasks.create", { title: "配置测试任务" });
assert(created.id || (created.task && created.task.id), "普通任务应能创建：" + JSON.stringify(created).slice(0, 200));

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

// 9. meta 键名规范
const keys = metaKeys().map((r) => r.k);
assert(keys.every((k) => /^config\.(tasks|tags|sites)\.[a-z]/.test(k)), "meta 键前缀不规范：" + keys.join(","));
assert(keys.length >= 6, "meta 配置键数量异常：" + keys.length);

db.close();
rmSync(dir, { recursive: true, force: true });
console.log("CONFIG TEST PASS", { keys: keys.length, events: events.length });
