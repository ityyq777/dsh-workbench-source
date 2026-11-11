/** 任务手动排序移除：新库、旧库升级、关系保留、同步和目录排序回归。 */
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { ensureSchema, childrenOf } from "../packages/addons/tasks/lib/db/db.js";
import { taskSync, reconcileTaskTree } from "../packages/addons/tasks/lib/infra/sync.js";

function columns(db, table) {
  return db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
}
function verifySchema(db) {
  assert(!columns(db, "task").includes("sort"), "task.sort must be absent");
  assert(columns(db, "task_node").includes("sort"), "task_node.sort must remain");
  const indexes = db.prepare("PRAGMA index_list(task)").all().map((r) => r.name);
  assert(!indexes.includes("idx_task_sort"), "idx_task_sort must be absent");
  assert(indexes.includes("idx_task_dedupe"), "unrelated task index must remain");
  assert(db.prepare("PRAGMA index_list(task_node)").all().some((r) => r.name === "idx_task_node_sort"));
  assert.equal(db.prepare("SELECT v FROM meta WHERE k='task_schema_version'").get().v, "6");
  assert(!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='task_dep'").get(), "task_dep must be dropped");
}
function snapshot(db) {
  return Object.fromEntries(["task", "task_node", "task_timeline", "task_timeline_link", "tag_mapping"].map((table) => [
    table, db.prepare(`SELECT * FROM ${table} ORDER BY id`).all().map((row) => {
      const clean = { ...row };
      if (table === "task") delete clean.sort;
      return clean;
    }),
  ]));
}

const db = new DatabaseSync(":memory:");
try {
  ensureSchema(db);
  verifySchema(db);
  // 模拟上一版真实差异：有 sort、对应索引，非零排序值，业务行及关联。
  db.exec(`
    ALTER TABLE task ADD COLUMN sort INTEGER NOT NULL DEFAULT 0;
    CREATE INDEX idx_task_sort ON task(sort);
    UPDATE meta SET v='2' WHERE k='task_schema_version';
    INSERT INTO task_node(id,name,type,parent_id,path,sort,depth,created_at,updated_at,rev)
      VALUES('table-z','排序在前','1','1','/1/table-z/',10,1,100,200,2),
            ('table-a','排序在后','1','1','/1/table-a/',20,1,100,200,2);
    INSERT INTO task(id,title,description,status,priority,difficulty,review,table_id,timeline_key,restart_key,publish_date,target_date,done_date,shutdown_date,dedupe_key,created_at,updated_at,deleted_at,rev,sort)
      VALUES('task-a','保留任务','正文','0',7,2.5,'复盘','table-z','line-1',NULL,'2026-11-01','2026-11-10',NULL,NULL,'dedupe-a',100,200,NULL,4,500),
            ('task-b','软删任务','仍需保留','2',0,NULL,'','table-a',NULL,'task-a','2026-11-02','2026-11-09','2026-11-08',NULL,NULL,101,201,202,3,-100);
    CREATE TABLE task_dep(id TEXT PRIMARY KEY,task_id TEXT,depends_on_id TEXT,created_at INTEGER,updated_at INTEGER,deleted_at INTEGER,rev INTEGER);
    INSERT INTO task_dep VALUES('dep-1','task-a','task-b',100,200,NULL,2);
    INSERT INTO task_timeline VALUES('line-1','独立时间线','描述',100,200,NULL,2);
    INSERT INTO task_timeline_link VALUES('task-a','task-a','line-1',100,200,NULL,2);
    CREATE TABLE tag_mapping(id TEXT PRIMARY KEY,item_id TEXT,item_type TEXT,tag_id TEXT);
    INSERT INTO tag_mapping VALUES('mapping-1','task-a','task','tag-1');
  `);
  const before = snapshot(db);
  ensureSchema(db);
  verifySchema(db);
  assert.deepEqual(snapshot(db), before, "migration changed task contents, tombstones, nodes or relations");
  assert.equal(db.prepare("PRAGMA integrity_check").get().integrity_check, "ok");
  ensureSchema(db);
  verifySchema(db);
  assert.deepEqual(snapshot(db), before, "second migration must be idempotent");

  const siblings = childrenOf(db, "1", false).filter((n) => n.id.startsWith("table-"));
  assert.deepEqual(siblings.map((n) => n.id), ["table-z", "table-a"], "directory reads must retain sort order, not ID order");
  const treeRows = db.prepare("SELECT * FROM task_node").all();
  const reconciled = reconcileTaskTree(treeRows, []).rows.filter((n) => n.id.startsWith("table-"));
  assert(reconciled.find((n) => n.id === "table-z").sort < reconciled.find((n) => n.id === "table-a").sort, "tree sync must retain directory ordering");

  const incoming = { ...before.task[0], sort: 999, updated_at: 500 };
  const normalize = taskSync.tables.find((t) => t.name === "task").normalizeIncoming;
  const normalized = normalize({ db, row: incoming, local: before.task[0] });
  assert(!("sort" in normalized), "legacy sync must discard task.sort before SQL writes");
  assert.equal(incoming.sort, 999, "normalization must not mutate incoming payload");
  assert.equal(normalized.title, incoming.title);
  assert.equal(normalized.timeline_key, "line-1", "sync must preserve authoritative timeline relation");
  const fields = Object.keys(normalized);
  db.prepare(`UPDATE task SET ${fields.map((field) => `${field}=?`).join(",")} WHERE id=?`).run(...fields.map((field) => normalized[field]), incoming.id);
  assert.equal(db.prepare("SELECT updated_at FROM task WHERE id=?").get(incoming.id).updated_at, 500);
  console.log("TASK SORT REMOVAL PASS: fresh schema, migration preservation/idempotence, legacy sync, directory order");
} finally {
  db.close();
}

// 更早版本同时缺 review/dedupe_key 且仍有 type：重建路径也不能重新引入 sort。
const legacy = new DatabaseSync(":memory:");
try {
  legacy.exec(`
    CREATE TABLE task(id TEXT PRIMARY KEY,title TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT '0',type TEXT NOT NULL DEFAULT '0',priority INTEGER NOT NULL DEFAULT 0,
      difficulty REAL,table_id TEXT NOT NULL,timeline_key TEXT,restart_key TEXT,publish_date TEXT NOT NULL,
      target_date TEXT NOT NULL,done_date TEXT,shutdown_date TEXT,created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,deleted_at INTEGER,rev INTEGER NOT NULL DEFAULT 1,sort INTEGER NOT NULL DEFAULT 0);
    CREATE INDEX idx_task_sort ON task(sort);
    INSERT INTO task(id,title,priority,table_id,publish_date,target_date,created_at,updated_at,sort)
      VALUES('old-task','旧 type 任务',5,'old-table','2026-11-01','2026-11-02',100,200,400);
    CREATE TABLE task_node(id TEXT PRIMARY KEY,name TEXT NOT NULL,type TEXT NOT NULL,
      parent_id TEXT NOT NULL DEFAULT '0',path TEXT NOT NULL,sort INTEGER NOT NULL DEFAULT 0,
      depth INTEGER NOT NULL DEFAULT 0,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL,
      deleted_at INTEGER,rev INTEGER NOT NULL DEFAULT 1);
    INSERT INTO task_node(id,name,type,parent_id,path,sort,depth,created_at,updated_at)
      VALUES('1','任务','0','0','/1/',0,0,100,200),('old-table','旧目录','1','1','/1/old-table/',30,1,100,200);
  `);
  ensureSchema(legacy);
  verifySchema(legacy);
  assert(!columns(legacy, "task").includes("type"));
  assert(columns(legacy, "task").includes("review"));
  assert(columns(legacy, "task").includes("dedupe_key"));
  assert.equal(legacy.prepare("SELECT title FROM task WHERE id='old-task'").get().title, "旧 type 任务");
  assert.equal(legacy.prepare("SELECT sort FROM task_node WHERE id='old-table'").get().sort, 30);
  ensureSchema(legacy);
  verifySchema(legacy);
  assert.equal(legacy.prepare("SELECT COUNT(*) AS n FROM task").get().n, 1);
  console.log("TASK SORT REMOVAL PASS: older type-column rebuild");
} finally {
  legacy.close();
}
