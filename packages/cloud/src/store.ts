import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

/**
 * 云端库 schema（06 文档：SQLite 单进程）。
 *
 * protocol v2 的变更：
 *  - change_log 增加 client_epoch，幂等键改为 (user,device,epoch,client_seq)；
 *  - row_states 增加 deleted，payload 始终保存完整行（含墓碑）；
 *  - 新增 sync_sessions（用户级会话锁）与 sync_table_state（B 类树表版本）。
 *
 * 旧库由 migrateCloudDb() 原地迁移，迁移可重复执行。
 */
export const CLOUD_SCHEMA = `
PRAGMA journal_mode=WAL;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  pass_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  replaced_by TEXT
);

CREATE TABLE IF NOT EXISTS devices (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT,
  last_cursor INTEGER NOT NULL DEFAULT 0,
  last_sync_at INTEGER,
  cursors TEXT NOT NULL DEFAULT '{}',
  PRIMARY KEY(id, user_id)
);

-- 每用户一条逻辑变更流；v2 幂等键 (user_id,device_id,client_epoch,client_seq)
CREATE TABLE IF NOT EXISTS change_log (
  server_seq INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  client_epoch TEXT NOT NULL DEFAULT '',
  client_seq INTEGER NOT NULL,
  table_name TEXT NOT NULL,
  row_id TEXT NOT NULL,
  op TEXT NOT NULL,
  payload TEXT,
  updated_at INTEGER NOT NULL,
  UNIQUE(user_id, device_id, client_epoch, client_seq)
);
CREATE INDEX IF NOT EXISTS idx_cl_user ON change_log(user_id, server_seq);
CREATE INDEX IF NOT EXISTS idx_cl_user_table_seq ON change_log(user_id, table_name, server_seq);

-- 行快照（LWW 服务端权威合并结果，供新设备全量拉取）
CREATE TABLE IF NOT EXISTS row_states (
  user_id TEXT NOT NULL,
  table_name TEXT NOT NULL,
  row_id TEXT NOT NULL,
  payload TEXT,
  deleted INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY(user_id, table_name, row_id)
);
CREATE INDEX IF NOT EXISTS idx_row_states_table
  ON row_states(user_id, table_name, updated_at);

-- 用户级会话锁；单进程 SQLite 下用表实现
CREATE TABLE IF NOT EXISTS sync_sessions (
  user_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  device_id TEXT NOT NULL,
  opened_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

-- B 类表版本；A 类表首次 full 时也会写入 mode=full
CREATE TABLE IF NOT EXISTS sync_table_state (
  user_id TEXT NOT NULL,
  table_name TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 0,
  mode TEXT NOT NULL DEFAULT 'row',
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, table_name)
);

`;

function hasColumn(db: DatabaseSync, table: string, column: string): boolean {
  try {
    const rows = db.prepare("PRAGMA table_info(" + table + ")").all() as { name: string }[];
    return rows.some((r) => r.name === column);
  } catch {
    return false;
  }
}

/** 旧库迁移：v1 -> v2；可重复执行。 */
export function migrateCloudDb(db: DatabaseSync): void {
  db.exec("BEGIN IMMEDIATE");
  try {
    if (!hasColumn(db, "devices", "last_sync_at")) {
      db.exec("ALTER TABLE devices ADD COLUMN last_sync_at INTEGER");
    }
    if (!hasColumn(db, "devices", "cursors")) {
      db.exec("ALTER TABLE devices ADD COLUMN cursors TEXT NOT NULL DEFAULT '{}'");
    }
    if (!hasColumn(db, "row_states", "deleted")) {
      db.exec("ALTER TABLE row_states ADD COLUMN deleted INTEGER NOT NULL DEFAULT 0");
    }
    // v1 的墓碑 payload=NULL；迁移成完整墓碑 JSON，deleted=1。
    db.exec(
      "UPDATE row_states SET payload=json_object('id',row_id,'deleted_at',updated_at,'updated_at',updated_at,'rev',0) " +
        "WHERE payload IS NULL",
    );
    db.exec(
      "UPDATE row_states SET deleted=CASE WHEN payload IS NULL THEN 1 " +
        "WHEN json_extract(payload,'$.deleted_at') IS NOT NULL THEN 1 ELSE 0 END",
    );
    if (!hasColumn(db, "change_log", "client_epoch")) {
      db.exec("ALTER TABLE change_log RENAME TO change_log_v1");
      db.exec(`
        CREATE TABLE change_log (
          server_seq INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          device_id TEXT NOT NULL,
          client_epoch TEXT NOT NULL DEFAULT '',
          client_seq INTEGER NOT NULL,
          table_name TEXT NOT NULL,
          row_id TEXT NOT NULL,
          op TEXT NOT NULL,
          payload TEXT,
          updated_at INTEGER NOT NULL,
          UNIQUE(user_id, device_id, client_epoch, client_seq)
        );
        CREATE INDEX IF NOT EXISTS idx_cl_user ON change_log(user_id, server_seq);
        CREATE INDEX IF NOT EXISTS idx_cl_user_table_seq ON change_log(user_id, table_name, server_seq);
        INSERT INTO change_log(user_id,device_id,client_epoch,client_seq,table_name,row_id,op,payload,updated_at)
          SELECT user_id,device_id,'',client_seq,table_name,row_id,op,payload,updated_at FROM change_log_v1;
        DROP TABLE change_log_v1;
      `);
    }
    db.exec("COMMIT");
  } catch (e) {
    try {
      db.exec("ROLLBACK");
    } catch {
      /* ignore */
    }
    throw e;
  }
}

/** 打开（或创建）云端 SQLite 并跑基线/迁移。 */
export function openCloudDb(file: string): DatabaseSync {
  mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(CLOUD_SCHEMA);
  migrateCloudDb(db);
  return db;
}
