/**
 * 保险箱数据库：只保存密文与 KDF 参数，不保存口令、DEK 或明文。
 * 0.2.0 起拆表：vault_header（单行、参与同步）+ vault_device（本机）+ 使用记录。
 * 表结构见 docs/specs/46-连接器与凭据保险箱方案.md 7.3。
 */
export const VAULT_HEADER = "vault_header";
export const VAULT_DEVICE = "vault_device";
export const VAULT_GROUP = "vault_group";
export const VAULT_SECRET = "vault_secret";
export const VAULT_SET = "vault_set";
export const VAULT_GROUP_SET = "vault_group_set";
export const VAULT_SET_SECRET = "vault_set_secret";
export const VAULT_BINDING = "vault_binding";
export const VAULT_SUBJECT_TYPE = "vault_subject_type";
export const VAULT_SECRET_USAGE = "vault_secret_usage";
export const VAULT_META_LEGACY = "vault_meta_legacy";

/**
 * 0.3.0 起：集合层（set）与两张多对多关联表；schema_version 3。
 * 0.4.0 起：集合加可选 account 列；0.5.0 起该列改为密文；二者都已在 0.6.0 下线。
 * 0.6.0 起：凭据类型改为多值（vault_secret_kind），集合不再区分账号/普通；schema_version 6。
 *           vault_secret 去掉单值 kind 列、vault_set 去掉 account 列，都需要 DEK 在解锁后迁移。
 * 0.7.0 起：只保留主口令一种解锁因子，设备 key 与 A/B/C 模式下线；schema_version 7。
 *           vault_header 增 passphrase_fp（主口令一致性指纹，不含口令与密钥）；
 *           vault_device 去掉 device key 与模式的四列，只留本机空闲超时与解锁时间。
 */
export const SCHEMA_VERSION = 7;

export const VAULT_DDL = [
  "CREATE TABLE IF NOT EXISTS vault_header (" +
    "id INTEGER PRIMARY KEY CHECK (id = 1)," +
    "schema_version INTEGER NOT NULL DEFAULT 3," +
    "salt TEXT NOT NULL," +
    "kdf TEXT NOT NULL," +
    "wrapped_dek TEXT NOT NULL," +
    "passphrase_fp TEXT NOT NULL DEFAULT ''," +
    "passphrase_rev INTEGER NOT NULL DEFAULT 1," +
    "created_at INTEGER NOT NULL," +
    "updated_at INTEGER NOT NULL," +
    "rev INTEGER NOT NULL DEFAULT 1" +
    ");",
  "CREATE TABLE IF NOT EXISTS vault_device (" +
    "id TEXT PRIMARY KEY," +
    "idle_timeout_sec INTEGER NOT NULL DEFAULT 900," +
    "last_unlock_at INTEGER," +
    "passphrase_rev_seen INTEGER NOT NULL DEFAULT 0," +
    "created_at INTEGER NOT NULL," +
    "updated_at INTEGER NOT NULL," +
    "rev INTEGER NOT NULL DEFAULT 1" +
    ");",
  "CREATE TABLE IF NOT EXISTS vault_group (" +
    "id TEXT PRIMARY KEY," +
    "name TEXT NOT NULL," +
    "description TEXT NOT NULL DEFAULT ''," +
    "color TEXT," +
    "created_at INTEGER NOT NULL," +
    "updated_at INTEGER NOT NULL," +
    "deleted_at INTEGER," +
    "rev INTEGER NOT NULL DEFAULT 1" +
    ");",
  "CREATE UNIQUE INDEX IF NOT EXISTS uk_vault_group_name ON vault_group(name) WHERE deleted_at IS NULL;",
  "CREATE TABLE IF NOT EXISTS vault_secret (" +
    "id TEXT PRIMARY KEY," +
    "name TEXT NOT NULL," +
    "meta TEXT NOT NULL DEFAULT '{}'," +
    "ciphertext TEXT NOT NULL," +
    "created_at INTEGER NOT NULL," +
    "updated_at INTEGER NOT NULL," +
    "deleted_at INTEGER," +
    "rev INTEGER NOT NULL DEFAULT 1" +
    ");",
  "CREATE UNIQUE INDEX IF NOT EXISTS uk_vault_secret_name ON vault_secret(name) WHERE deleted_at IS NULL;",
  "CREATE TABLE IF NOT EXISTS vault_secret_kind (" +
    "id TEXT PRIMARY KEY," +
    "secret_id TEXT NOT NULL," +
    "kind TEXT NOT NULL," +
    "created_at INTEGER NOT NULL," +
    "updated_at INTEGER NOT NULL," +
    "deleted_at INTEGER," +
    "rev INTEGER NOT NULL DEFAULT 1" +
    ");",
  "CREATE UNIQUE INDEX IF NOT EXISTS uk_vault_secret_kind ON vault_secret_kind(secret_id, kind) WHERE deleted_at IS NULL;",
  "CREATE INDEX IF NOT EXISTS idx_vault_secret_kind_secret ON vault_secret_kind(secret_id);",
  "CREATE TABLE IF NOT EXISTS vault_set (" +
    "id TEXT PRIMARY KEY," +
    "name TEXT NOT NULL," +
    "description TEXT NOT NULL DEFAULT ''," +
    "color TEXT," +
    "created_at INTEGER NOT NULL," +
    "updated_at INTEGER NOT NULL," +
    "deleted_at INTEGER," +
    "rev INTEGER NOT NULL DEFAULT 1" +
    ");",
  "CREATE UNIQUE INDEX IF NOT EXISTS uk_vault_set_name ON vault_set(name) WHERE deleted_at IS NULL;",
  "CREATE TABLE IF NOT EXISTS vault_group_set (" +
    "id TEXT PRIMARY KEY," +
    "group_id TEXT NOT NULL," +
    "set_id TEXT NOT NULL," +
    "created_at INTEGER NOT NULL," +
    "updated_at INTEGER NOT NULL," +
    "deleted_at INTEGER," +
    "rev INTEGER NOT NULL DEFAULT 1" +
    ");",
  "CREATE UNIQUE INDEX IF NOT EXISTS uk_vault_group_set ON vault_group_set(group_id, set_id) WHERE deleted_at IS NULL;",
  "CREATE INDEX IF NOT EXISTS idx_vault_group_set_group ON vault_group_set(group_id);",
  "CREATE INDEX IF NOT EXISTS idx_vault_group_set_set ON vault_group_set(set_id);",
  "CREATE TABLE IF NOT EXISTS vault_set_secret (" +
    "id TEXT PRIMARY KEY," +
    "set_id TEXT NOT NULL," +
    "secret_id TEXT NOT NULL," +
    "created_at INTEGER NOT NULL," +
    "updated_at INTEGER NOT NULL," +
    "deleted_at INTEGER," +
    "rev INTEGER NOT NULL DEFAULT 1" +
    ");",
  "CREATE UNIQUE INDEX IF NOT EXISTS uk_vault_set_secret ON vault_set_secret(set_id, secret_id) WHERE deleted_at IS NULL;",
  "CREATE INDEX IF NOT EXISTS idx_vault_set_secret_set ON vault_set_secret(set_id);",
  "CREATE INDEX IF NOT EXISTS idx_vault_set_secret_secret ON vault_set_secret(secret_id);",
  "CREATE TABLE IF NOT EXISTS vault_binding (" +
    "id TEXT PRIMARY KEY," +
    "subject_type TEXT NOT NULL," +
    "subject_id TEXT NOT NULL," +
    "group_id TEXT NOT NULL," +
    "created_at INTEGER NOT NULL," +
    "updated_at INTEGER NOT NULL," +
    "deleted_at INTEGER," +
    "rev INTEGER NOT NULL DEFAULT 1" +
    ");",
  "CREATE UNIQUE INDEX IF NOT EXISTS uk_vault_binding ON vault_binding(subject_type, subject_id, group_id) WHERE deleted_at IS NULL;",
  "CREATE INDEX IF NOT EXISTS idx_vault_binding_subject ON vault_binding(subject_type, subject_id);",
  "CREATE INDEX IF NOT EXISTS idx_vault_binding_group ON vault_binding(group_id);",
  "CREATE TABLE IF NOT EXISTS vault_subject_type (" +
    "id TEXT PRIMARY KEY," +
    "type TEXT NOT NULL," +
    "title TEXT NOT NULL," +
    "description TEXT NOT NULL DEFAULT ''," +
    "updated_at INTEGER NOT NULL," +
    "rev INTEGER NOT NULL DEFAULT 1" +
    ");",
  "CREATE UNIQUE INDEX IF NOT EXISTS uk_vault_subject_type ON vault_subject_type(type);",
  "CREATE TABLE IF NOT EXISTS vault_secret_usage (" +
    "secret_id TEXT PRIMARY KEY," +
    "last_used_at INTEGER NOT NULL" +
    ");",
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

export function hasColumn(db, table, column) {
  return tableExists(db, table) && columnNames(db, table).includes(String(column));
}

export function tableExists(db, table) {
  return Boolean(db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(String(table)));
}

export function columnNames(db, table) {
  return db.prepare("PRAGMA table_info(" + String(table) + ")").all().map((row) => row.name);
}

export function ensureSchema(db) {
  for (const sql of VAULT_DDL) db.exec(sql);
  migrateV1(db);
  migrateV4(db);
  migrateV7(db);
}

/**
 * 0.6.x → 0.7.0：主口令成为唯一解锁因子（纯结构升级，不需要 DEK）。
 * - vault_header 补 passphrase_fp；旧库解一次锁后由 unlock 回填。
 * - vault_device 只剩本机空闲超时与解锁时间：设备 key、unlock_mode、auto_unlock、
 *   reveal_policy 四列重建表时丢弃；device key 密文随之消失，不影响已同步的密文。
 * 只处理已经到 6 的库；更旧的库先走解锁时的数据迁移，由 runMigration 末尾再补这一步。
 */
export function migrateV7(db) {
  const head = headerGet(db);
  if (!head) return;
  const version = Number(head.schema_version || 0);
  if (version < 6 || version >= 7) return;
  tx(db, () => {
    if (!hasColumn(db, "vault_header", "passphrase_fp")) {
      db.exec("ALTER TABLE vault_header ADD COLUMN passphrase_fp TEXT NOT NULL DEFAULT ''");
    }
    if (tableExists(db, "vault_device")) {
      db.exec(
        "CREATE TABLE vault_device_next (" +
          "id TEXT PRIMARY KEY," +
          "idle_timeout_sec INTEGER NOT NULL DEFAULT 900," +
          "last_unlock_at INTEGER," +
          "passphrase_rev_seen INTEGER NOT NULL DEFAULT 0," +
          "created_at INTEGER NOT NULL," +
          "updated_at INTEGER NOT NULL," +
          "rev INTEGER NOT NULL DEFAULT 1" +
          ")",
      );
      db.exec(
        "INSERT INTO vault_device_next(id, idle_timeout_sec, last_unlock_at, passphrase_rev_seen, created_at, updated_at, rev) " +
          "SELECT id, idle_timeout_sec, last_unlock_at, passphrase_rev_seen, created_at, updated_at, rev FROM vault_device",
      );
      db.exec("DROP TABLE vault_device");
      db.exec("ALTER TABLE vault_device_next RENAME TO vault_device");
    }
    headerSet(db, { schema_version: 7 });
  });
}

/**
 * 0.3.x → 0.4.0：给 vault_set 补 account 列（纯结构升级，不需要 DEK）。
 * 只把已经到 3 的库升到 4；schema_version=2 的旧库仍由解锁后的 migrateToV3 整批迁移，
 * 否则会跳过 0.3.0 的数据搬家，只剩空壳结构。
 * 4 → 5 需要 DEK 才能把明文账号加密，因此不在启动时升版本，交给解锁后的账号迁移。
 */
export function migrateV4(db) {
  const head = headerGet(db);
  if (!head) return;
  const version = Number(head.schema_version || 0);
  if (version < 3 || version >= 4) return;
  if (tableExists(db, "vault_set") && !hasColumn(db, "vault_set", "account")) {
    db.exec("ALTER TABLE vault_set ADD COLUMN account TEXT NOT NULL DEFAULT ''");
  }
  headerSet(db, { schema_version: 4 });
}

/**
 * 0.1.0 → 0.2.0：vault_meta(KV) 拆成单行 vault_header + 本机 vault_device，
 * last_used_at 搬到 vault_secret_usage。幂等；不改密文本体，解锁前也能跑。
 */
export function migrateV1(db) {
  if (!tableExists(db, "vault_meta")) return;
  if (headerGet(db)) return;
  const rows = db.prepare("SELECT key, value FROM vault_meta").all();
  if (!rows.length) return;
  const meta = {};
  for (const row of rows) meta[row.key] = String(row.value);
  if (!meta.schema_version || !meta.salt || !meta.wrapped_dek) return;

  tx(db, () => {
    ensureGroupColumn(db);
    const ts = Number(meta.created_at) || now();
    db.prepare(
      "INSERT INTO vault_header(id, schema_version, salt, kdf, wrapped_dek, passphrase_rev, created_at, updated_at, rev) " +
        "VALUES(1, 2, ?, ?, ?, 1, ?, ?, 1)",
    ).run(meta.salt, meta.kdf || "{}", meta.wrapped_dek, ts, now());
    // 0.7.0 起设备行只保留本机解锁时间与空闲超时；旧 meta 里的 device key 与模式字段直接丢弃。
    db.prepare(
      "INSERT INTO vault_device(id, idle_timeout_sec, last_unlock_at, passphrase_rev_seen, created_at, updated_at, rev) " +
        "VALUES('local', ?, ?, 1, ?, ?, 1)",
    ).run(Number(meta.idle_timeout_sec) || 900, Number(meta.last_unlock_at) || null, ts, now());
    db.exec(
      "INSERT INTO vault_secret_usage(secret_id, last_used_at) " +
        "SELECT id, last_used_at FROM vault_secret WHERE last_used_at IS NOT NULL",
    );
    db.exec("ALTER TABLE vault_meta RENAME TO " + VAULT_META_LEGACY);
  });
}

function ensureGroupColumn(db) {
  if (!tableExists(db, "vault_secret")) return;
  if (!columnNames(db, "vault_secret").includes("group_id")) {
    db.exec("ALTER TABLE vault_secret ADD COLUMN group_id TEXT");
  }
}

export function headerGet(db) {
  return db.prepare("SELECT * FROM vault_header WHERE id = 1").get() || null;
}

export function headerSet(db, patch = {}) {
  const cur = headerGet(db) || {};
  const next = {
    schema_version: patch.schema_version ?? cur.schema_version ?? SCHEMA_VERSION,
    salt: patch.salt ?? cur.salt,
    kdf: patch.kdf ?? cur.kdf,
    wrapped_dek: patch.wrapped_dek ?? cur.wrapped_dek,
    passphrase_fp: patch.passphrase_fp ?? cur.passphrase_fp ?? "",
    passphrase_rev: patch.passphrase_rev ?? cur.passphrase_rev ?? 1,
    created_at: cur.created_at ?? patch.created_at ?? now(),
    updated_at: now(),
    rev: Number(cur.rev || 0) + 1,
  };
  db.prepare(
    "INSERT INTO vault_header(id, schema_version, salt, kdf, wrapped_dek, passphrase_fp, passphrase_rev, created_at, updated_at, rev) " +
      "VALUES(1, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
      "ON CONFLICT(id) DO UPDATE SET schema_version = excluded.schema_version, salt = excluded.salt, " +
      "kdf = excluded.kdf, wrapped_dek = excluded.wrapped_dek, passphrase_fp = excluded.passphrase_fp, " +
      "passphrase_rev = excluded.passphrase_rev, updated_at = excluded.updated_at, rev = excluded.rev",
  ).run(
    next.schema_version,
    next.salt,
    next.kdf,
    next.wrapped_dek,
    next.passphrase_fp,
    next.passphrase_rev,
    next.created_at,
    next.updated_at,
    next.rev,
  );
  return next;
}

export function deviceGet(db) {
  return db.prepare("SELECT * FROM vault_device WHERE id = 'local'").get() || null;
}

export function deviceSet(db, patch = {}) {
  const cur = deviceGet(db) || {};
  const next = {
    idle_timeout_sec: patch.idle_timeout_sec ?? cur.idle_timeout_sec ?? 900,
    last_unlock_at: patch.last_unlock_at !== undefined ? patch.last_unlock_at : cur.last_unlock_at ?? null,
    passphrase_rev_seen: patch.passphrase_rev_seen ?? cur.passphrase_rev_seen ?? 0,
    created_at: cur.created_at ?? patch.created_at ?? now(),
    updated_at: now(),
    rev: Number(cur.rev || 0) + 1,
  };
  db.prepare(
    "INSERT INTO vault_device(id, idle_timeout_sec, last_unlock_at, passphrase_rev_seen, created_at, updated_at, rev) " +
      "VALUES('local', ?, ?, ?, ?, ?, ?) " +
      "ON CONFLICT(id) DO UPDATE SET idle_timeout_sec = excluded.idle_timeout_sec, " +
      "last_unlock_at = excluded.last_unlock_at, passphrase_rev_seen = excluded.passphrase_rev_seen, " +
      "updated_at = excluded.updated_at, rev = excluded.rev",
  ).run(
    next.idle_timeout_sec,
    next.last_unlock_at,
    next.passphrase_rev_seen,
    next.created_at,
    next.updated_at,
    next.rev,
  );
  return next;
}

export function touchUsage(db, secretId) {
  db.prepare(
    "INSERT INTO vault_secret_usage(secret_id, last_used_at) VALUES(?, ?) " +
      "ON CONFLICT(secret_id) DO UPDATE SET last_used_at = excluded.last_used_at",
  ).run(String(secretId), now());
}

export function usageMap(db) {
  const out = {};
  for (const row of db.prepare("SELECT secret_id, last_used_at FROM vault_secret_usage").all()) {
    out[row.secret_id] = row.last_used_at;
  }
  return out;
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

export function secretRow(row, usage = {}) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    kinds: Array.isArray(row.kinds) ? row.kinds : [],
    meta: row.meta || "{}",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastUsedAt: usage[row.id] || null,
    rev: row.rev,
  };
}

export function setRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    color: row.color || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    rev: row.rev,
  };
}

export function groupSetRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    groupId: row.group_id,
    setId: row.set_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    rev: row.rev,
  };
}

export function setSecretRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    setId: row.set_id,
    secretId: row.secret_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    rev: row.rev,
  };
}

export function groupRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    color: row.color || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    rev: row.rev,
  };
}

export function bindingRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    groupId: row.group_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    rev: row.rev,
  };
}
