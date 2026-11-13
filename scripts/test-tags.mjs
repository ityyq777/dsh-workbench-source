import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = mkdtempSync(join(tmpdir(), "wb-tags-"));
function base(d) {
  d.exec("CREATE TABLE IF NOT EXISTS sync_change_log (seq INTEGER PRIMARY KEY AUTOINCREMENT, table_name TEXT NOT NULL, row_id TEXT NOT NULL, op TEXT NOT NULL, payload TEXT, origin TEXT NOT NULL, updated_at INTEGER NOT NULL)");
}
const db = new DatabaseSync(join(dir, "tags.db"));
base(db);
const events = [];
const defs = {};
const api = {
  db,
  addon: { id: "wb-addon-tags", version: "1.0.0", dir: dir },
  shellVersion: "0.1.0",
  log: function () {},
  emit: function (event, data) { events.push({ event: event, data: data }); },
  action: function (name, def) { defs[name] = def; },
  tool: function () {},
};
const mod = await import("../packages/addons/tags/lib/index.js");
mod.setup(api);

function call(name, args) {
  return defs[name].execute(args, { origin: "ui", emit: api.emit });
}
function assert(cond, msg) {
  if (!cond) throw new Error("ASSERT: " + msg);
}

let r = call("tags.create", { name: "工作" });
assert(r.tag.name === "工作", "create returns row");
const firstId = r.id;
call("tags.create", { name: "生活" });
r = call("tags.list", { pageNumber: 1, pageSize: 18 });
assert(r.total === 2 && r.records.length === 2, "list 2");
assert(r.records[0].name === "生活", "list order updated desc");
r = call("tags.search", { text: "工" });
assert(r.total === 1 && r.records[0].name === "工作", "search zh");
r = call("tags.list", { text: "work" });
assert(r.total === 0, "search no match");
let dup = call("tags.create", { name: "工作" });
assert(dup.id === firstId && dup.existing === true, "duplicate create is idempotent (returns existing id)");
assert(call("tags.list", {}).total === 2, "duplicate create does not add a row");
r = call("tags.update", { id: firstId, name: "工作台" });
assert(r.changed && r.tag.name === "工作台", "rename tag");
let clash = null;
try { call("tags.update", { id: firstId, name: "生活" }); } catch (e) { clash = e; }
assert(clash && /已存在/.test(clash.message), "rename to an existing name rejected");
r = call("tags.update", { id: firstId, name: "工作台" });
assert(r.changed === false && r.tag.name === "工作台", "rename with same name is a no-op");
let rawDup = null;
try {
  const rawTs = Date.now();
  db.prepare("INSERT INTO tag(id,name,created_at,updated_at,deleted_at,rev) VALUES('dup-raw','生活',?,?,NULL,1)").run(rawTs, rawTs);
} catch (e) { rawDup = e; }
assert(rawDup && /UNIQUE/.test(String(rawDup.message)), "uk_tag_name unique index enforced");
let noId = null;
try { call("tags.update", { name: "x" }); } catch (e) { noId = e; }
assert(noId, "update without id rejected");
let missingTag = null;
try { call("tags.update", { id: "nope", name: "x" }); } catch (e) { missingTag = e; }
assert(missingTag, "update unknown tag rejected");
let renameBlank = null;
try { call("tags.update", { id: dup.id, name: "  " }); } catch (e) { renameBlank = e; }
assert(renameBlank, "rename to blank rejected");
let blank = null;
try { call("tags.create", { name: "   " }); } catch (e) { blank = e; }
assert(blank, "blank rejected");

const ts = Date.now();
db.prepare("INSERT INTO tag_mapping(id,tag_id,item_id,item_type,created_at,updated_at,deleted_at,rev) VALUES(?,?,?,?,?,?,NULL,1)").run("m1", firstId, "s1", "site", ts, ts);
r = call("tags.delete", { id: firstId });
assert(r.deleted && r.removedMappings === 1, "delete cascade mapping");
r = call("tags.byIds", { ids: [firstId] });
assert(r.records.length === 0, "deleted tag hidden");
const mapRow = db.prepare("SELECT * FROM tag_mapping WHERE id=?").get("m1");
assert(mapRow && mapRow.deleted_at, "mapping soft deleted");
const logRows = db.prepare("SELECT * FROM sync_change_log WHERE table_name IN ('tag','tag_mapping')").all();
assert(logRows.length >= 4, "change log rows");
r = call("tags.create", { name: "工作" });
assert(r.tag.name === "工作" && r.existing !== true, "recreate same name after soft delete");
r = call("tags.list", {});
assert(r.total === 2, "list after recreate");
r = call("tags.byIds", { ids: [r.records[0].id] });
assert(r.records.length === 1, "byIds");

// 存量重名合并：setup 时按名字并成一条，映射改挂保留者
const db3 = new DatabaseSync(join(dir, "dup.db"));
base(db3);
db3.exec("CREATE TABLE tag(id TEXT PRIMARY KEY,name TEXT,created_at INTEGER,updated_at INTEGER,deleted_at INTEGER,rev INTEGER)");
db3.exec("CREATE TABLE tag_mapping(id TEXT PRIMARY KEY,tag_id TEXT,item_id TEXT,item_type TEXT,created_at INTEGER,updated_at INTEGER,deleted_at INTEGER,rev INTEGER)");
const ts3 = Date.now();
db3.prepare("INSERT INTO tag VALUES('keep','重名',?,?,NULL,1)").run(ts3 - 1000, ts3 - 1000);
db3.prepare("INSERT INTO tag VALUES('dupe','重名',?,?,NULL,1)").run(ts3, ts3);
db3.prepare("INSERT INTO tag_mapping VALUES('m-keep','keep','s1','site',?,?,NULL,1)").run(ts3, ts3);
db3.prepare("INSERT INTO tag_mapping VALUES('m-dupe-same','dupe','s1','site',?,?,NULL,1)").run(ts3, ts3);
db3.prepare("INSERT INTO tag_mapping VALUES('m-dupe-other','dupe','s2','site',?,?,NULL,1)").run(ts3, ts3);
const defs3 = {};
const api3 = { db: db3, addon: { id: "wb-addon-tags", version: "1.0.0", dir: dir }, shellVersion: "0.1.0", log: function () {}, emit: function () {}, action: function (n, d) { defs3[n] = d; }, tool: function () {} };
mod.setup(api3);
const alive3 = db3.prepare("SELECT * FROM tag WHERE deleted_at IS NULL").all();
assert(alive3.length === 1 && alive3[0].id === "keep", "重名标签合并后只留 created_at 最早的一条");
assert(db3.prepare("SELECT * FROM tag WHERE id='dupe'").get().deleted_at, "重复标签软删保留墓碑");
assert(db3.prepare("SELECT * FROM tag_mapping WHERE id='m-dupe-other'").get().tag_id === "keep", "映射改挂到保留者");
assert(db3.prepare("SELECT * FROM tag_mapping WHERE id='m-dupe-same'").get().deleted_at, "同对象重复映射被软删");

// 备份导入：不同 id 同名时按名字合并，不留两条活跃标签
const backupMod = await import("../packages/addons/tags/lib/infra/backup.js");
const payload = JSON.stringify({
  schemaVersion: 1,
  tags: [
    { id: "imp-a", name: "导入重复", created_at: ts3, updated_at: ts3, deleted_at: null, rev: 1 },
    { id: "imp-b", name: "导入重复", created_at: ts3 + 1, updated_at: ts3 + 1, deleted_at: null, rev: 1 },
  ],
  mappings: [
    { id: "im-a", tag_id: "imp-a", item_id: "x1", item_type: "task", created_at: ts3, updated_at: ts3, deleted_at: null, rev: 1 },
    { id: "im-b", tag_id: "imp-b", item_id: "x2", item_type: "task", created_at: ts3, updated_at: ts3, deleted_at: null, rev: 1 },
  ],
});
const imp = backupMod.importTagsData(api, payload, { policy: "newest" });
assert(imp.ok && imp.imported === 3, "导入：两条标签去重成一条 + 两条映射：" + JSON.stringify(imp));
assert(db.prepare("SELECT COUNT(*) AS n FROM tag WHERE name='导入重复' AND deleted_at IS NULL").get().n === 1, "导入后同名标签只有一条");
assert(db.prepare("SELECT tag_id FROM tag_mapping WHERE id='im-b'").get().tag_id === "imp-a", "导入映射改挂到保留标签");

// v2 表迁移
const db2 = new DatabaseSync(join(dir, "v2.db"));
base(db2);
db2.exec("CREATE TABLE tag(id TEXT PRIMARY KEY,name TEXT,is_deleted INTEGER,update_time INTEGER,create_time INTEGER)");
db2.exec("CREATE TABLE tag_mapping(id TEXT PRIMARY KEY,tag_id TEXT,item_id TEXT,item_type TEXT,is_deleted INTEGER,create_time INTEGER,update_time INTEGER)");
db2.exec("INSERT INTO tag VALUES('old1','旧标签',0,1000,900)");
db2.exec("INSERT INTO tag_mapping VALUES('oldm1','old1','site1','site',0,900,1000)");
const defs2 = {};
const api2 = { db: db2, addon: { id: "wb-addon-tags", version: "1.0.0", dir: dir }, shellVersion: "0.1.0", log: function () {}, emit: function () {}, action: function (n, d) { defs2[n] = d; }, tool: function () {} };
mod.setup(api2);
r = defs2["tags.list"].execute({}, { origin: "ui" });
assert(r.total === 1 && r.records[0].name === "旧标签", "v2 migrate tag");
const tables = db2.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().map(function (x) { return x.name; });
assert(tables.some(function (n) { return n.indexOf("tag_legacy_v2_") === 0; }), "v2 old table kept");
const cols = db2.prepare("PRAGMA table_info(tag)").all().map(function (x) { return x.name; });
assert(cols.indexOf("updated_at") >= 0 && cols.indexOf("deleted_at") >= 0, "v2 table rebuilt");
const map2 = db2.prepare("SELECT * FROM tag_mapping").get();
assert(map2 && map2.tag_id === "old1", "v2 mapping copied");

// 独立 Top 100 限额：真实 SQLite 聚合，不改变沉睡/最近使用条数。
const statsDb = new DatabaseSync(":memory:");
const statsDefs = {};
mod.setup({ ...api, db: statsDb, action: (name, def) => { statsDefs[name] = def; } });
const report = (args = {}) => statsDefs["tags.statsReport"].execute(args);
assert(report({ topTagsLimit: 100 }).rankings.topTags.length === 0, "empty Top 100");
const stamp = Date.now() - 100 * 86400000;
const insertTag = statsDb.prepare("INSERT INTO tag(id,name,created_at,updated_at,deleted_at,rev) VALUES(?,?,?,?,NULL,1)");
const insertMap = statsDb.prepare("INSERT INTO tag_mapping(id,tag_id,item_id,item_type,created_at,updated_at,deleted_at,rev) VALUES(?,?,?,'task',?,?,NULL,1)");
for (let i = 0; i < 105; i++) {
  const id = "rank-" + String(i).padStart(3, "0");
  insertTag.run(id, "排行" + i, stamp, stamp);
  for (let n = 0; n < i; n++) insertMap.run(id + "-" + n, id, "item-" + n, stamp, stamp);
}
const hundred = report({ top: 5, topTagsLimit: 100 });
assert(hundred.rankings.topTags.length === 100, "Top 100 must return 100, not 20");
assert(hundred.rankings.topTags[0].count === 104 && hundred.rankings.topTags[99].count === 5, "Top 100 descending count and cutoff");
assert(hundred.lists.stale.length === 5 && hundred.lists.recent.length === 5, "independent limit preserves top=5 lists");
const legacy = report({ top: 999 });
assert(legacy.rankings.topTags.length === 100 && legacy.lists.stale.length === 20 && legacy.lists.recent.length === 10, "legacy limits preserved");
assert(report().rankings.topTags.length === 100, "Top tags default 100");
for (const [value, expected] of [[999, 105], [-1, 1], [0, 1], [2.9, 2], ["bad", 100]]) {
  assert(report({ topTagsLimit: value }).rankings.topTags.length === expected, "limit normalization " + value);
}
statsDb.prepare("UPDATE tag SET deleted_at=? WHERE id='rank-104'").run(Date.now());
assert(report({ topTagsLimit: 100 }).rankings.topTags[0].count === 103, "deleted tags excluded");
assert(statsDefs["tags.statsReport"].input.properties.topTagsLimit, "new limit declared in schema");
// 超过 200 条后确认上限与并列 id 顺序。
for (let i = 105; i < 215; i++) {
  const id = "rank-" + String(i).padStart(3, "0");
  insertTag.run(id, "排行" + i, stamp, stamp);
}
const capped = report({ top: 100, topTagsLimit: 999 });
assert(capped.rankings.topTags.length === 200, "API upper bound 200");
assert(capped.lists.stale.length === 20 && capped.lists.recent.length === 10, "top=100 preserves lists caps");
const tied = capped.rankings.topTags.filter((row) => row.count === 0).map((row) => row.id);
assert(tied.join() === tied.slice().sort().join(), "ties ordered by id ascending");
assert(report({ top: 5 }).rankings.topTags.length === 100, "Top default independent of top");
// 未知对象类型：归入「其他」时也要给出去重对象数，不能恒为 0。
// 来源注册门禁（tags 1.7.1）：直接写 tag_mapping 前必须先把 item_type 注册成唯一来源。
statsDefs["tags.registerSource"].execute({ source: "device", owner: "wb-addon-fixture" });
statsDb.prepare("INSERT INTO tag_mapping(id,tag_id,item_id,item_type,created_at,updated_at,deleted_at,rev) VALUES(?,?,?,'device',?,?,NULL,1)").run("other-a", "rank-000", "dev-1", stamp, stamp);
statsDb.prepare("INSERT INTO tag_mapping(id,tag_id,item_id,item_type,created_at,updated_at,deleted_at,rev) VALUES(?,?,?,'device',?,?,NULL,1)").run("other-b", "rank-000", "dev-2", stamp, stamp);
const otherType = report({ topTagsLimit: 100 }).breakdowns.itemTypes.find(function (row) { return row.key === "other"; });
assert(otherType && otherType.mappings === 2 && otherType.items === 2, "unknown types keep distinct items: " + JSON.stringify(otherType));
assert(report().warnings.some(function (w) { return w.code === "item_type_unknown"; }), "unknown type warning missing");
statsDb.close();

// 可核算样本：储物 A 挂 X/Y、储物 B 挂 X，跨类型同 ID、空标签、已删关联分别核对口径。
const sampleDb = new DatabaseSync(":memory:");
const sampleDefs = {};
mod.setup({ ...api, db: sampleDb, action: (name, def) => { sampleDefs[name] = def; } });
const sample = (args = {}) => sampleDefs["tags.statsReport"].execute(Object.assign({ range: "all" }, args));
sampleDb.exec("CREATE TABLE storage(id TEXT PRIMARY KEY,deleted_at INTEGER)");
sampleDb.exec("CREATE TABLE task(id TEXT PRIMARY KEY,deleted_at INTEGER)");
for (const id of ["sA", "sB", "sEmpty"]) sampleDb.prepare("INSERT INTO storage VALUES(?,NULL)").run(id);
sampleDb.prepare("INSERT INTO task VALUES('sA',NULL)").run();
const nowTs = Date.now();
for (const tagId of ["tX", "tY"])
  sampleDb.prepare("INSERT INTO tag(id,name,created_at,updated_at,deleted_at,rev) VALUES(?,?,?,?,NULL,1)").run(tagId, tagId === "tX" ? "X" : "Y", nowTs, nowTs);
let seq = 0;
const link = (tagId, itemId, itemType, deleted) =>
  sampleDb.prepare("INSERT INTO tag_mapping(id,tag_id,item_id,item_type,created_at,updated_at,deleted_at,rev) VALUES(?,?,?,?,?,?,?,1)")
    .run("m" + ++seq, tagId, itemId, itemType, nowTs, nowTs, deleted || null);
link("tX", "sA", "storage");
link("tY", "sA", "storage");
link("tX", "sB", "storage");
let rep = sample();
let types = Object.fromEntries(rep.breakdowns.itemTypes.map((row) => [row.key, row]));
assert(types.storage.mappings === 3 && types.storage.items === 2, "储物示例关联/对象口径错误：" + JSON.stringify(types.storage));
assert(rep.totals.items === 2 && rep.totals.mappings === 3, "储物样本总量错误");
let counts = Object.fromEntries(rep.rankings.topTags.map((row) => [row.name, row.count]));
assert(counts.X === 2 && counts.Y === 1, "储物标签次数错误：" + JSON.stringify(counts));
assert(types.storage.label === "物品", "储物类型名应为物品");
// 跨类型同 ID：任务 sA 再挂 X，对象按 (item_type,item_id) 去重，不能并入储物。
link("tX", "sA", "task");
rep = sample();
types = Object.fromEntries(rep.breakdowns.itemTypes.map((row) => [row.key, row]));
assert(types.storage.items === 2 && types.task.items === 1, "跨类型同 ID 被误合并：" + JSON.stringify(types));
assert(rep.totals.items === 3, "跨类型对象总数应为 3");
counts = Object.fromEntries(rep.rankings.topTags.map((row) => [row.name, row.count]));
assert(counts.X === 3, "跨类型后 X 应贡献 3 次，实际 " + counts.X);
// 已删关联：物品 B 移除 X 后按当前存量统计。
sampleDb.prepare("UPDATE tag_mapping SET deleted_at=? WHERE tag_id='tX' AND item_id='sB' AND item_type='storage'").run(Date.now());
rep = sample();
types = Object.fromEntries(rep.breakdowns.itemTypes.map((row) => [row.key, row]));
assert(types.storage.mappings === 2 && types.storage.items === 1, "移除关联后储物统计未更新：" + JSON.stringify(types.storage));
assert(rep.totals.items === 2 && rep.totals.used === 2, "移除关联后对象/已用标签未更新");
counts = Object.fromEntries(rep.rankings.topTags.map((row) => [row.name, row.count]));
assert(counts.X === 2 && counts.Y === 1, "移除关联后次数未更新：" + JSON.stringify(counts));
sampleDb.close();

console.log("TAGS TEST PASS", { events: events.length, tables: tables.length });
db.close();
db2.close();
rmSync(dir, { recursive: true, force: true });
