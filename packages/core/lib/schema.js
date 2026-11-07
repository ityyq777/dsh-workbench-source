/**
 * 工作台本地库 schema（05 文档落地版）。
 * 每个实体表统一 rev/updated_at/deleted_at 三列 —— 同步的前提。
 * demo 阶段 node:sqlite（Node>=22.5），无原生编译依赖。
 */
export const SCHEMA_SQL = `
PRAGMA journal_mode=WAL;

CREATE TABLE IF NOT EXISTS meta (
  k TEXT PRIMARY KEY, v TEXT NOT NULL
);

-- 任务记录 addon 的表
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  priority INTEGER NOT NULL DEFAULT 2,
  due_at INTEGER,
  tags TEXT NOT NULL DEFAULT '[]',
  rev INTEGER NOT NULL DEFAULT 1,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_tasks_open ON tasks(due_at)
  WHERE deleted_at IS NULL AND status='open';

CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cadence TEXT NOT NULL DEFAULT 'daily',
  checkins TEXT NOT NULL DEFAULT '{}',
  rev INTEGER NOT NULL DEFAULT 1,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);

-- 通用变更日志：写事务内追加；未推送尾部即待同步队列
CREATE TABLE IF NOT EXISTS sync_change_log (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  row_id TEXT NOT NULL,
  op TEXT NOT NULL,
  payload TEXT,
  origin TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 冲突展示（LWW 输方的服务端版本留档，绝不静默吞数据）
CREATE TABLE IF NOT EXISTS conflict_shadow (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  row_id TEXT NOT NULL,
  local_payload TEXT,
  server_payload TEXT,
  resolved_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_state (
  k TEXT PRIMARY KEY, v INTEGER NOT NULL
);
`;
/** 参与同步的表清单（core 权威定义；addon manifest 声明只是校验用） */
export const SYNCED_TABLES = new Set(["tasks", "habits"]);
