/**
 * 保险箱数据库：只保存密文与 KDF 参数，不保存口令、DEK 或明文。
 * 表结构见 docs/specs/46-连接器与凭据保险箱方案.md 7.3。
 */
export const VAULT_META = "vault_meta";
export const VAULT_SECRET = "vault_secret";

export const VAULT_DDL = [
  "CREATE TABLE IF NOT EXISTS vault_meta (" +
    "key TEXT PRIMARY KEY," +
    "value TEXT NOT NULL," +
    "updated_at INTEGER NOT NULL" +
    ");",
  "CREATE TABLE IF NOT EXISTS vault_secret (" +
    "id TEXT PRIMARY KEY," +
    "name TEXT NOT NULL," +
    "kind TEXT NOT NULL," +
    "meta TEXT NOT NULL DEFAULT '{}'," +
    "ciphertext TEXT NOT NULL," +
    "created_at INTEGER NOT NULL," +
    "updated_at INTEGER NOT NULL," +
    "last_used_at INTEGER," +
    "deleted_at INTEGER," +
    "rev INTEGER NOT NULL DEFAULT 1" +
    ");",
  "CREATE UNIQUE INDEX IF NOT EXISTS uk_vault_secret_name ON vault_secret(name) WHERE deleted_at IS NULL;",
  "CREATE INDEX IF NOT EXISTS idx_vault_secret_kind ON vault_secret(deleted_at, kind);",
];

let clock = null;
let last = 0;

export function bindClock(fn) {
  clock = typeof fn === "function" ? fn : null;
}

export function now() {
  if (clock) return clock();
  const t = Date.now();
  last = t > last ? t : last + 1;
  return last;
}

export function newId(prefix = "sec") {
  let tail = "";
  for (let i = 0; i < 10; i += 1) tail += Math.floor(Math.random() * 36).toString(36);
  return prefix + "_" + now().toString(36) + "_" + tail;
}

export function ensureSchema(db) {
  for (const sql of VAULT_DDL) db.exec(sql);
}

export function metaAll(db) {
  const rows = db.prepare("SELECT key, value FROM vault_meta").all();
  const out = {};
  for (const row of rows) out[row.key] = row.value;
  return out;
}

export function metaGet(db, key) {
  const row = db.prepare("SELECT value FROM vault_meta WHERE key = ?").get(String(key));
  return row ? String(row.value) : null;
}

export function metaSet(db, key, value) {
  db.prepare(
    "INSERT INTO vault_meta(key, value, updated_at) VALUES(?, ?, ?) " +
      "ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
  ).run(String(key), String(value), now());
}

export function metaDel(db, key) {
  db.prepare("DELETE FROM vault_meta WHERE key = ?").run(String(key));
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
    } catch {
      /* ignore */
    }
    throw error;
  }
}

export function secretRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    meta: row.meta || "{}",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastUsedAt: row.last_used_at || null,
    rev: row.rev,
  };
}
