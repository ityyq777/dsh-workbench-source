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
const backupMod = await import("../packages/addons/tags/lib/backup.js");
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

console.log("TAGS TEST PASS", { events: events.length, tables: tables.length });
db.close();
db2.close();
rmSync(dir, { recursive: true, force: true });
