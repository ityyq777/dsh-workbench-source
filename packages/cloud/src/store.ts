import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

/**
 * 云端库 schema（06 文档 demo 版：SQLite 承载）。
 * change_log.server_seq 由应用层用 max+1 在事务内分配（demo 单进程安全）。
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
  PRIMARY KEY(id, user_id)
);

-- 每用户一条逻辑变更流；push 幂等键 (user_id,device_id,client_seq)
CREATE TABLE IF NOT EXISTS change_log (
  server_seq INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  client_seq INTEGER NOT NULL,
  table_name TEXT NOT NULL,
  row_id TEXT NOT NULL,
  op TEXT NOT NULL,
  payload TEXT,
  updated_at INTEGER NOT NULL,
  UNIQUE(user_id, device_id, client_seq)
);
CREATE INDEX IF NOT EXISTS idx_cl_user ON change_log(user_id, server_seq);

-- 行快照（LWW 服务端权威合并结果，供新设备全量拉取）
CREATE TABLE IF NOT EXISTS row_states (
  user_id TEXT NOT NULL,
  table_name TEXT NOT NULL,
  row_id TEXT NOT NULL,
  payload TEXT,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY(user_id, table_name, row_id)
);

-- 目录即服务（04 文档）：版本元数据 + 兼容性判定在服务端
CREATE TABLE IF NOT EXISTS catalog_addons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT '',
  latest TEXT NOT NULL,
  yanked TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS catalog_versions (
  addon_id TEXT NOT NULL,
  version TEXT NOT NULL,
  min_shell TEXT NOT NULL DEFAULT '1.0.0',
  tables TEXT NOT NULL DEFAULT '[]',
  views TEXT NOT NULL DEFAULT '[]',
  tool_actions TEXT NOT NULL DEFAULT '[]',
  file_size INTEGER NOT NULL DEFAULT 0,
  sha256 TEXT NOT NULL DEFAULT '',
  published_at INTEGER NOT NULL,
  PRIMARY KEY(addon_id, version)
);

CREATE TABLE IF NOT EXISTS download_stats (
  addon_id TEXT NOT NULL,
  version TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(addon_id, version)
);
`;

/** 打开（或创建）云端 SQLite 并跑基线。 */
export function openCloudDb(file: string): DatabaseSync {
  mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(CLOUD_SCHEMA);
  return db;
}
