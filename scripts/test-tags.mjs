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
let dup = null;
try { call("tags.create", { name: "工作" }); } catch (e) { dup = e; }
assert(dup && dup.message.indexOf("已存在") >= 0, "duplicate rejected");
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
assert(r.tag.name === "工作", "recreate same name after soft delete");
r = call("tags.list", {});
assert(r.total === 2, "list after recreate");
r = call("tags.byIds", { ids: [r.records[0].id] });
assert(r.records.length === 1, "byIds");

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
