import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { setup, apply, storageSync } from "../packages/addons/storage/lib/index.js";
import { exportStorageData, importStorageData } from "../packages/addons/storage/lib/backup.js";
import { ensureSchema as ensureTagsSchema } from "../packages/addons/tags/lib/db/db.js";
import { exportTagsData, importTagsData } from "../packages/addons/tags/lib/infra/backup.js";
const db = new DatabaseSync(":memory:"),
  defs = {},
  events = [];
let enabled = false;
db.exec(
  "CREATE TABLE sync_change_log(seq INTEGER PRIMARY KEY,table_name TEXT,row_id TEXT,op TEXT,payload TEXT,origin TEXT,updated_at INTEGER)",
);
const api = {
  db,
  action: (name, def) => (defs[name] = def),
  emit: (...args) => events.push(args),
  log: () => {},
  hasAddon: (id) => id === "wb-addon-tags" && enabled,
};
setup(api);
const call = (name, args = {}) => defs[name].execute(args, { origin: "ui" });
const count = (table) => Number(db.prepare("SELECT COUNT(*) n FROM " + table).get().n);
assert.equal(Object.keys(defs).length, 16);
assert.equal(call("storage.capabilities").tags, false);
assert.throws(() => call("storage.create", { name: " " }), /名称/);
assert.throws(() => call("storage.create", { name: "x", stock: 1 }), /字符串/);
assert.throws(() => call("storage.create", { name: "x", imgList: ["javascript:alert(1)"] }), /HTTP/);
assert.throws(() => call("storage.create", { name: "x", tagIds: ["t1"] }), /标签插件/);
const first = call("storage.create", {
  name: "电池",
  brand: "测试品牌",
  unit: "盒",
  stock: "1~2",
  imgList: ["https://example.com/battery.png"],
  remark: "旧备注",
}).storage;
assert.equal(first.stock, "1~2");
assert.equal(call("storage.update", { id: first.id, remark: "新备注" }).storage.remark, "新备注");
assert.equal(call("storage.get", { id: first.id }).imgList.length, 1);
assert.equal(call("storage.list", { text: "新备注" }).total, 1);
assert.equal(call("storage.list", { text: "测试品牌" }).total, 1);
assert.throws(() => call("storage.list", { tagIds: ["t1"] }), /标签插件/);
assert.equal(call("storageTags.search").total, 0);
assert.deepEqual(call("storageTags.byIds", { ids: ["t1"] }), { records: [] });
db.exec(
  "CREATE TABLE tag(id TEXT PRIMARY KEY,name TEXT,created_at INTEGER,updated_at INTEGER,deleted_at INTEGER,rev INTEGER); CREATE TABLE tag_mapping(id TEXT PRIMARY KEY,tag_id TEXT,item_id TEXT,item_type TEXT,created_at INTEGER,updated_at INTEGER,deleted_at INTEGER,rev INTEGER); CREATE UNIQUE INDEX mapping_unique ON tag_mapping(item_type,item_id,tag_id) WHERE deleted_at IS NULL; INSERT INTO tag VALUES('t1','电器',1,1,NULL,1),('t2','耗材',1,1,NULL,1)",
);
enabled = true;
assert.equal(call("storage.capabilities").tags, true);
call("storage.update", { id: first.id, tagIds: ["t1", "t2"] });
assert.equal(call("storage.get", { id: first.id }).tags.length, 2);
assert.equal(call("storage.list", { tagIds: ["t1"] }).total, 1);
assert.equal(call("storageTags.search", { text: "电", pageSize: 1 }).records[0].name, "电器");
assert.equal(call("storageTags.byIds", { ids: ["t1"] }).records.length, 1);
call("storage.update", { id: first.id, tags: ["t1"] });
assert.equal(count("tag_mapping"), 2);
call("storage.update", { id: first.id, tagIds: ["t1", "t2"] });
assert.equal(count("tag_mapping"), 2);
enabled = false;
call("storage.update", { id: first.id, remark: "禁用期间保存", tagIds: [] });
assert.equal(call("storage.get", { id: first.id }).tags.length, 0);
assert.equal(Number(db.prepare("SELECT COUNT(*) n FROM tag_mapping WHERE deleted_at IS NULL").get().n), 2);
enabled = true;
assert.equal(call("storage.get", { id: first.id }).tags.length, 2);
for (let i = 0; i < 20; i++) call("storage.create", { name: "物品" + String(i).padStart(2, "0") });
const page = call("storage.list", { pageNumber: 2, pageSize: 8, sortColumn: "name", sortOrder: "asc" });
assert.equal(page.records.length, 8);
assert.equal(page.total, 21);
assert.equal(page.pages, 3);
assert.equal(call("storage.list", { pageNumber: 999, pageSize: 8 }).current, 3);
assert.throws(() => call("storage.list", { sortColumn: "name;DROP TABLE storage" }), /排序/);
const before = count("storage"),
  logs = count("sync_change_log"),
  ev = events.length;
db.exec("CREATE TRIGGER reject_log BEFORE INSERT ON sync_change_log BEGIN SELECT RAISE(ABORT,'injected failure'); END");
assert.throws(() => call("storage.create", { name: "回滚", tagIds: ["t1"] }), /injected/);
assert.throws(() => call("storage.update", { id: first.id, name: "回滚更新", tagIds: [] }), /injected/);
assert.throws(() => call("storage.delete", { id: first.id }), /injected/);
assert.equal(count("storage"), before);
assert.equal(count("sync_change_log"), logs);
assert.equal(events.length, ev);
assert.equal(call("storage.get", { id: first.id }).name, "电池");
assert.equal(call("storage.get", { id: first.id }).tags.length, 2);
db.exec("DROP TRIGGER reject_log");
const state = call("storage.configGet");
assert.equal(state.items.length, 8);
assert.equal(state.values["ui.bodyMode"], "markdown");
call("storage.configSet", {
  values: {
    "list.pageSize": 24,
    "list.sortColumn": "name",
    "list.sortOrder": "asc",
    "data.pageSize": 25,
    "data.includeDeleted": true,
    "data.showSystemColumns": true,
    "ui.confirmDelete": false,
    "ui.bodyMode": "text",
  },
});
assert.equal(call("storage.list").size, 24);
assert.equal(call("storage.configGet").values["ui.bodyMode"], "text");
assert.throws(() => call("storage.configSet", { values: { "ui.bodyMode": "html" } }), /非法/);
assert.throws(() => call("storage.configSet", { values: { "list.pageSize": 16, unknown: true } }), /未知/);
assert.equal(call("storage.configGet").values["list.pageSize"], 24);
call("storage.configReset");
assert.equal(call("storage.configGet").values["ui.bodyMode"], "markdown");
assert.equal(call("storage.configOptions").domain, "storage");
assert.equal(call("storage.dataTables", { stats: true }).tables[0].stats.rows, 21);
assert.equal(call("storage.dataQuery", { table: "storage", filters: { stock: "1~2" } }).total, 1);
assert.throws(() => call("storage.dataQuery", { table: "tag" }), /未知数据表/);
assert.throws(() => call("storage.dataQuery", { table: "storage", sort: "invalid" }), /未知排序列/);
assert.equal(call("storage.stats").withImages, 1);
assert.equal(call("storage.stats").tagged, 1);
// Export must not capture other domains; import must not overwrite their ids.
db.prepare("INSERT INTO tag_mapping VALUES('foreign','t1','site-1','site',1,1,NULL,1)").run();
const backup = exportStorageData(api);
assert.equal(backup.tagMappings.length, 2);
const foreign = { ...backup.tagMappings[0], id: "foreign", updated_at: Date.now() + 1000 };
let result = importStorageData(api, JSON.stringify({ ...backup, tagMappings: [foreign] }), { policy: "overwrite" });
assert.equal(result.ok, false);
assert.match(result.message, /冲突/);
assert.equal(db.prepare("SELECT item_type FROM tag_mapping WHERE id='foreign'").get().item_type, "site");
const bad = { ...backup, storage: [{ ...backup.storage[0], id: "bad", name: "" }] };
assert.equal(importStorageData(api, JSON.stringify(bad)).ok, false);
assert.equal(importStorageData(api, "{broken").ok, false);
for (const field of ["created_at", "updated_at", "deleted_at"]) {
  const invalidTime = { ...backup, storage: [{ ...backup.storage[0], [field]: Number.MAX_SAFE_INTEGER }] };
  assert.equal(importStorageData(api, JSON.stringify(invalidTime), { policy: "overwrite" }).ok, false);
}
assert.equal(call("storage.get", { id: first.id }).name, "电池");
assert.equal(
  importStorageData(
    api,
    JSON.stringify({ ...backup, tagMappings: [{ ...backup.tagMappings[0], tag_id: "missing" }] }),
    { policy: "overwrite" },
  ).ok,
  false,
);
// Restore into a clean database, with tags restored first.
const db2 = new DatabaseSync(":memory:");
db2.exec(
  "CREATE TABLE sync_change_log(seq INTEGER PRIMARY KEY,table_name TEXT,row_id TEXT,op TEXT,payload TEXT,origin TEXT,updated_at INTEGER)",
);
const api2 = { ...api, db: db2, action: () => {}, emit: () => {} };
setup(api2);
assert.equal(importStorageData(api2, JSON.stringify(backup)).ok, false);
assert.equal(Number(db2.prepare("SELECT COUNT(*) n FROM storage").get().n), 0);
db2.exec(
  "CREATE TABLE tag(id TEXT PRIMARY KEY,name TEXT,deleted_at INTEGER); INSERT INTO tag VALUES('t1','电器',NULL),('t2','耗材',NULL); CREATE TABLE tag_mapping(id TEXT PRIMARY KEY,tag_id TEXT,item_id TEXT,item_type TEXT,created_at INTEGER,updated_at INTEGER,deleted_at INTEGER,rev INTEGER)",
);
result = importStorageData(api2, JSON.stringify(backup));
assert.equal(result.ok, true);
assert.equal(result.imported, 23);
assert.equal(importStorageData(api2, JSON.stringify(backup), { policy: "skip" }).skipped, 23);
assert.equal(importStorageData(api2, JSON.stringify(backup)).skipped, 23);
const incoming = {
  ...backup,
  storage: backup.storage.map((r) => ({ ...r, remark: "新备份", updated_at: r.updated_at + 10000 })),
};
db2.exec("CREATE TRIGGER reject_log BEFORE INSERT ON sync_change_log BEGIN SELECT RAISE(ABORT,'backup rollback'); END");
result = importStorageData(api2, JSON.stringify(incoming));
assert.equal(result.ok, false);
assert.equal(result.imported, 0);
assert.notEqual(db2.prepare("SELECT remark FROM storage LIMIT 1").get().remark, "新备份");
db2.close();
// Real tags import merges t1 into existing t0; storage resolves its snapshot.
const db3 = new DatabaseSync(":memory:");
db3.exec(
  "CREATE TABLE sync_change_log(seq INTEGER PRIMARY KEY,table_name TEXT,row_id TEXT,op TEXT,payload TEXT,origin TEXT,updated_at INTEGER)",
);
ensureTagsSchema(db3, () => {});
const api3 = { ...api, db: db3, action: () => {}, emit: () => {} };
setup(api3);
db3.exec("INSERT INTO tag VALUES('t0','电器',0,0,NULL,1)");
const tagBackup = exportTagsData(api);
assert.equal(tagBackup.mappings.length, 0);
const tagResult = importTagsData(api3, JSON.stringify(tagBackup), { policy: "overwrite" });
assert.equal(tagResult.ok, true);
assert.equal(tagResult.merged, 1);
assert.equal(db3.prepare("SELECT id FROM tag WHERE name='电器'").get().id, "t0");
assert.equal(db3.prepare("SELECT id FROM tag WHERE id='t1'").get(), undefined);
const legacy = { ...backup };
delete legacy.tagReferences;
result = importStorageData(api3, JSON.stringify(legacy));
assert.equal(result.ok, false);
assert.match(result.message, /旧版.*快照/);
assert.equal(db3.prepare("SELECT COUNT(*) n FROM storage").get().n, 0);
result = importStorageData(api3, JSON.stringify(backup));
assert.equal(result.ok, true);
assert.equal(db3.prepare("SELECT tag_id FROM tag_mapping WHERE item_id=? AND tag_id='t0'").get(first.id).tag_id, "t0");
assert.equal(db3.prepare("SELECT COUNT(*) n FROM tag_mapping WHERE tag_id='t1'").get().n, 0);
assert.equal(importStorageData(api3, JSON.stringify(backup)).ok, true);
// A deleted original id must not hide an active relationship after name merging.
db3.exec("INSERT INTO tag VALUES('t1','电器',1,2,2,1)");
assert.equal(importTagsData(api3, JSON.stringify(tagBackup), { policy: "overwrite" }).merged, 1);
assert.equal(db3.prepare("SELECT deleted_at FROM tag WHERE id='t1'").get().deleted_at, 2);
assert.equal(importStorageData(api3, JSON.stringify(backup), { policy: "overwrite" }).ok, true);
assert.equal(db3.prepare("SELECT COUNT(*) n FROM tag_mapping WHERE tag_id='t1'").get().n, 0);
assert.equal(
  db3
    .prepare(
      "SELECT COUNT(*) n FROM tag_mapping m JOIN tag t ON t.id=m.tag_id WHERE m.deleted_at IS NULL AND t.deleted_at IS NULL",
    )
    .get().n,
  2,
);
// Old tags bundles cannot import storage-owned or site-owned mappings.
const oldTags = {
  ...tagBackup,
  mappings: [...backup.tagMappings, { ...backup.tagMappings[0], id: "legacy-site", item_type: "site" }],
};
const mappingCount = db3.prepare("SELECT COUNT(*) n FROM tag_mapping").get().n;
assert.equal(importTagsData(api3, JSON.stringify(oldTags), { policy: "overwrite" }).ok, true);
assert.equal(db3.prepare("SELECT COUNT(*) n FROM tag_mapping").get().n, mappingCount);
// Duplicate canonical relationships reuse the existing target association.
const alternate = { ...backup, tagMappings: backup.tagMappings.map((r) => ({ ...r, id: "alternate-" + r.id })) };
assert.equal(importStorageData(api3, JSON.stringify(alternate), { policy: "overwrite" }).ok, true);
assert.equal(db3.prepare("SELECT COUNT(*) n FROM tag_mapping").get().n, mappingCount);
for (const tagReferences of [
  {},
  [
    { id: "t1", name: "电器" },
    { id: "t1", name: "电器" },
  ],
  [],
]) {
  assert.equal(
    importStorageData(api3, JSON.stringify({ ...backup, tagReferences }), { policy: "overwrite" }).ok,
    false,
  );
}
// Remapping and storage rows also roll back together on a failed mapping log.
const beforeRollback = db3.prepare("SELECT remark FROM storage WHERE id=?").get(first.id).remark;
db3.exec(
  "CREATE TRIGGER reject_mapping_log BEFORE INSERT ON sync_change_log WHEN NEW.table_name='tag_mapping' BEGIN SELECT RAISE(ABORT,'mapped backup rollback'); END",
);
result = importStorageData(api3, JSON.stringify(incoming), { policy: "overwrite" });
assert.equal(result.ok, false);
assert.match(result.message, /mapped backup rollback/);
assert.equal(db3.prepare("SELECT remark FROM storage WHERE id=?").get(first.id).remark, beforeRollback);
db3.close();
// Legacy snapshots still restore safely when original ids exist.
assert.equal(importStorageData(api, JSON.stringify(legacy), { policy: "overwrite" }).ok, true);
assert.equal(call("storage.delete", { id: first.id }).removedTagMappings, 2);
assert.equal(call("storage.get", { id: first.id }), null);
assert.equal(call("storage.delete", { id: first.id }).deleted, false);
assert.equal(call("storage.list").total, 20);
assert.equal(call("storage.stats").tagged, 0);
assert.equal(call("storage.dataQuery", { table: "storage", includeDeleted: true }).total, 21);
assert.equal(call("storage.dataQuery", { table: "storage" }).total, 20);
assert.equal(storageSync.tables.length, 1);
assert.equal(storageSync.tables[0].name, "storage");
let domain;
apply({
  workbench: {
    registerDomain: (def) => {
      domain = def;
      return () => {};
    },
  },
  effect: (fn) => fn(),
});
assert.equal(domain.id, "wb-addon-storage");
assert.equal(domain.version, "1.4.1");
assert.equal(domain.views.find((v) => v.id === "stats").title.zh, "统计");
assert.deepEqual(domain.tables, ["storage"]);
assert.deepEqual(domain.capability.requires, []);
for (const def of Object.values(defs)) for (const key of def.input.required || []) assert.ok(def.input.properties[key]);
db.close();
console.log(
  "PASS storage: CRUD, validation, pagination, tags missing/disabled/recovery, config/data, backups, sync ownership, transactional rollback",
);
