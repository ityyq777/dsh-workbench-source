import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { ensureSchema, insertNode, rowNode } from "../packages/addons/sites/lib/db/db.js";
import { registerSiteTreeActions } from "../packages/addons/sites/lib/tree/tree.js";
import { exportSitesData, importSitesData } from "../packages/addons/sites/lib/infra/backup.js";
import { reconcileSiteTree, siteSync } from "../packages/addons/sites/lib/infra/sync.js";
import { SyncEngine } from "../packages/shell/lib/sync.js";

// Entire suite uses isolated in-memory databases; no profile or network access.
const databases = [];
function database() {
  const db = new DatabaseSync(":memory:");
  databases.push(db);
  db.exec("CREATE TABLE sync_change_log(seq INTEGER PRIMARY KEY AUTOINCREMENT, table_name TEXT, row_id TEXT, op TEXT, payload TEXT, origin TEXT, updated_at INTEGER)");
  db.exec("CREATE TABLE sync_state(k TEXT PRIMARY KEY, v TEXT NOT NULL)");
  return db;
}
function apiFor(db) {
  const defs = {};
  const api = { db, emit() {}, action(name, def) { defs[name] = def; } };
  registerSiteTreeActions(api);
  return { api, defs, call(name, args = {}) { return defs[name].execute(args, { origin: "ui" }); } };
}
const long = "  目录描述全文：中文 😀\n<标签> & Markdown **原文**\n".repeat(500) + " 尾部保留  ";
try {
  const old = database();
  old.exec("CREATE TABLE site_node(id TEXT PRIMARY KEY,name TEXT NOT NULL,parent_id TEXT NOT NULL DEFAULT '0',path TEXT NOT NULL,sort INTEGER NOT NULL DEFAULT 0,depth INTEGER NOT NULL DEFAULT 0,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL,deleted_at INTEGER,rev INTEGER NOT NULL DEFAULT 1,legacy_extra TEXT)");
  old.exec("INSERT INTO site_node VALUES('old','旧目录','0','/old/',3,0,11,22,NULL,7,'保留额外列'),('deleted','已删','old','/old/deleted/',2,1,12,23,24,9,'墓碑也保留')");
  const before = old.prepare("SELECT * FROM site_node ORDER BY id").all();
  ensureSchema(old);
  ensureSchema(old);
  assert.deepEqual(old.prepare("SELECT * FROM site_node ORDER BY id").all().map(row => ({ ...row })), before.map(row => ({ ...row, description: "" })));
  const column = old.prepare("PRAGMA table_info(site_node)").all().filter(row => row.name === "description");
  assert.equal(column.length, 1);
  assert.equal(column[0].type, "TEXT");
  assert.equal(column[0].notnull, 1);
  assert.equal(column[0].dflt_value, "''");
  old.prepare("UPDATE site_node SET description=? WHERE id='old'").run(long);
  ensureSchema(old);
  assert.equal(old.prepare("SELECT description FROM site_node WHERE id='old'").get().description, long);
  assert.equal(rowNode(before[0]).description, "");

  const db = database();
  ensureSchema(db);
  const { api, defs, call } = apiFor(db);
  for (const name of ["siteNodes.create", "siteNodes.rename"]) {
    assert.equal(defs[name].input.properties.description.type, "string");
    assert.ok(!defs[name].input.required?.includes("description"));
  }
  const created = call("siteNodes.create", { name: "目录", description: long });
  const id = created.node.id;
  assert.equal(created.node.description, long);
  assert.ok(defs["siteNodes.create"].render(created).includes(long));
  assert.equal(call("siteNodes.create", { name: "默认" }).node.description, "");
  assert.equal(db.prepare("SELECT description FROM site_node WHERE id=?").get(id).description, long);
  const child = call("siteNodes.create", { name: "子目录", parentId: id, description: "子描述" }).node;
  assert.equal(call("siteNodes.tree")[0].description, long);
  assert.equal(call("siteNodes.tree")[0].children[0].description, "子描述");
  assert.equal(call("siteNodes.children", { id: "0" })[0].description, long);
  assert.equal(call("siteNodes.multipleChildren", { ids: [id] })[0].children[0].description, "子描述");
  assert.equal(call("siteNodes.pathChildren", { id: child.id })[0].children[0].description, long);
  assert.ok(defs["siteNodes.tree"].render(call("siteNodes.tree")).includes(long));
  let result = call("siteNodes.rename", { id, name: "新名" });
  assert.equal(result.node.description, long, "omission preserves description");
  assert.ok(defs["siteNodes.rename"].render(result).includes(long));
  result = call("siteNodes.rename", { id, name: "新名", description: "" });
  assert.equal(result.node.description, "");
  assert.equal(db.prepare("SELECT description FROM site_node WHERE id=?").get(id).description, "");
  assert.equal(call("siteNodes.rename", { id, name: "新名", description: "" }).unchanged, true);
  result = call("siteNodes.rename", { id, description: long });
  assert.equal(result.node.name, "未命名", "preserve legacy omitted-name behavior");
  assert.equal(result.node.description, long);
  const logged = JSON.parse(db.prepare("SELECT payload FROM sync_change_log WHERE row_id=? ORDER BY seq DESC LIMIT 1").get(id).payload);
  assert.equal(logged.description, long);

  const exported = exportSitesData(api);
  assert.equal(exported.nodes.find(row => row.id === id).description, long);
  const restored = database();
  ensureSchema(restored);
  const restoredApi = apiFor(restored).api;
  assert.equal(importSitesData(restoredApi, JSON.stringify(exported)).ok, true);
  assert.deepEqual(exportSitesData(restoredApi), exported, "backup roundtrip includes full text");
  assert.equal(importSitesData(restoredApi, JSON.stringify(exported), { policy: "skip" }).imported, 0);
  const legacy = structuredClone(exported);
  for (const row of legacy.nodes) delete row.description;
  const legacyDb = database();
  ensureSchema(legacyDb);
  assert.equal(importSitesData(apiFor(legacyDb).api, JSON.stringify(legacy)).ok, true);
  assert.ok(legacyDb.prepare("SELECT description FROM site_node").all().every(row => row.description === ""));
  assert.equal(importSitesData(restoredApi, JSON.stringify(legacy), { policy: "overwrite" }).ok, true);
  assert.equal(restored.prepare("SELECT description FROM site_node WHERE id=?").get(id).description, "");
  assert.equal(JSON.parse(restored.prepare("SELECT payload FROM sync_change_log WHERE row_id=? ORDER BY seq DESC LIMIT 1").get(id).payload).description, "");
  assert.equal(importSitesData(restoredApi, JSON.stringify(exported), { policy: "overwrite" }).ok, true);
  assert.equal(restored.prepare("SELECT description FROM site_node WHERE id=?").get(id).description, long);

  const local = db.prepare("SELECT * FROM site_node WHERE id=?").get(id);
  const newer = { ...local, name: "远端新名", updated_at: local.updated_at + 100 };
  delete newer.description;
  let merged = reconcileSiteTree([newer], [local]).rows;
  assert.equal(merged[0].description, long, "old remote omitting description preserves local full text");
  assert.equal(merged[0].name, "远端新名");
  assert.equal(reconcileSiteTree([{ ...newer, description: "" }], [local]).rows[0].description, "");
  assert.equal(reconcileSiteTree([newer], []).rows[0].description, "");
  const tombstone = { ...newer, id: "tomb", deleted_at: newer.updated_at, description: long };
  assert.equal(reconcileSiteTree([tombstone], []).rows[0].description, long);
  const remote = { ...newer, description: long + "远端", parent_id: "missing", path: "/broken/" };
  const syncDb = database();
  ensureSchema(syncDb);
  insertNode(syncDb, local);
  let pushed;
  const engine = new SyncEngine({
    db: syncDb, domains: [{ id: "sites", sync: siteSync }], userId: "test", deviceId: "test", epoch: "test",
    clock: { now: () => 1 },
    transport: {
      async snapshot() { return { rows: [remote, tombstone], version: 1 }; },
      async full(request) { pushed = request.rows; return { version: 2, cursor: 1 }; },
    },
  });
  // Exercise actual host reconcile -> replaceRows -> full-save transport with an offline fake.
  await engine.syncTreeTable("site_node", { domainId: "sites", table: siteSync.tables.find(t => t.name === "site_node") }, 1);
  assert.equal(syncDb.prepare("SELECT description FROM site_node WHERE id=?").get(id).description, remote.description);
  assert.equal(syncDb.prepare("SELECT parent_id FROM site_node WHERE id=?").get(id).parent_id, "0");
  assert.equal(syncDb.prepare("SELECT description FROM site_node WHERE id='tomb'").get().description, long);
  assert.equal(pushed.find(row => row.id === id).description, remote.description);
  assert.deepEqual(reconcileSiteTree(pushed, pushed).rows, pushed, "sync convergence is idempotent");
  console.log("PASS site node description: migration, actions/render/schema, backup, actual host tree save (offline)");
} finally {
  for (const db of databases) db.close();
}
