"use strict";
// 弹幕库的表结构与基础工具（node:sqlite DatabaseSync）。

export const DANMAKU_DDL = [
  `CREATE TABLE IF NOT EXISTS danmaku (
    id TEXT PRIMARY KEY,
    body TEXT NOT NULL,
    tone TEXT NOT NULL DEFAULT 'normal',
    enabled INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER,
    rev INTEGER NOT NULL DEFAULT 1
  )`,
];

export const DANMAKU_INDEX_DDL = [
  "CREATE INDEX IF NOT EXISTS idx_danmaku_live ON danmaku(deleted_at, sort_order, id)",
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_danmaku_body ON danmaku(body) WHERE deleted_at IS NULL",
];

let clock = null;
let last = 0;

export function bindClock(fn) {
  clock = typeof fn === "function" ? fn : null;
}

export function now() {
  const raw = clock ? Number(clock()) : Date.now();
  const value = Number.isFinite(raw) ? raw : Date.now();
  last = value > last ? value : last + 1;
  return last;
}

export function newId(prefix) {
  return `${prefix}_${now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function tableExists(db, name) {
  try {
    return Boolean(db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?").get(name));
  } catch (error) {
    return false;
  }
}

export function ensureSchema(db, log) {
  for (const ddl of DANMAKU_DDL) db.exec(ddl);
  for (const ddl of DANMAKU_INDEX_DDL) {
    try {
      db.exec(ddl);
    } catch (error) {
      if (log) log("danmaku index skipped", String((error && error.message) || error));
    }
  }
}

export function tx(db, fn) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const value = fn();
    db.exec("COMMIT");
    return value;
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch (rollbackError) {
      /* 事务可能已结束 */
    }
    throw error;
  }
}

export function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    body: row.body,
    tone: row.tone,
    enabled: row.enabled === 1,
    sortOrder: Number(row.sort_order) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    rev: row.rev,
  };
}

export function liveRows(db) {
  return db.prepare("SELECT * FROM danmaku WHERE deleted_at IS NULL ORDER BY sort_order ASC, id ASC").all();
}

export function findLive(db, id) {
  const row = db.prepare("SELECT * FROM danmaku WHERE id = ? AND deleted_at IS NULL").get(id);
  return mapRow(row);
}
