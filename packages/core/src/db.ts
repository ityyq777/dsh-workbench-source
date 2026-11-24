import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { SCHEMA_SQL } from "./schema.js";

function hasColumn(db: DatabaseSync, table: string, column: string): boolean {
  try {
    const rows = db.prepare("PRAGMA table_info(" + table + ")").all() as { name: string }[];
    return rows.some((row) => row.name === column);
  } catch {
    return false;
  }
}

/** 表是否存在（老库升级判断用）。 */
function hasTable(db: DatabaseSync, table: string): boolean {
  try {
    return Boolean(db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table));
  } catch {
    return false;
  }
}

/** 表的行数；表不存在按 0 处理。 */
function countRows(db: DatabaseSync, table: string): number {
  if (!hasTable(db, table)) return 0;
  try {
    const row = db.prepare("SELECT COUNT(*) AS n FROM " + table).get() as { n: number } | undefined;
    return row ? Number(row.n) || 0 : 0;
  } catch {
    return 0;
  }
}

/** 两张表都有的列（老表可能缺后来补的列，只搬交集，缺的落新表默认值）。 */
function sharedColumns(db: DatabaseSync, from: string, to: string): string[] {
  const pick = (table: string) =>
    (db.prepare("PRAGMA table_info(" + table + ")").all() as { name: string }[]).map((row) => row.name);
  const target = new Set(pick(to));
  return pick(from).filter((name) => target.has(name));
}

/**
 * 宿主内置自动化从 automation_* 改名为 host_automation_*（与业务插件的同名表分开）。
 *
 * 老库升级时：新表还是空的、旧表有数据，就把旧表数据搬过去；随后把旧表改名成
 * automation_rule_legacy_<版本> 留一版，既不丢历史，也不会在下次启动时重复搬。
 * 新表已有数据（新版已经跑过）就只改名，不再覆盖。
 */
function migrateLegacyAutomationTables(db: DatabaseSync, version: string): void {
  const suffix = String(version || "0").replace(/[^0-9A-Za-z]+/g, "_");
  for (const name of ["rule", "run", "meta"]) {
    const legacy = "automation_" + name;
    if (!hasTable(db, legacy)) continue;
    const target = "host_automation_" + name;
    if (countRows(db, target) === 0 && countRows(db, legacy) > 0) {
      const cols = sharedColumns(db, legacy, target);
      if (cols.length) {
        db.exec(
          "INSERT OR IGNORE INTO " + target + "(" + cols.join(",") + ") SELECT " + cols.join(",") + " FROM " + legacy,
        );
      }
    }
    const backup = legacy + "_legacy_" + suffix;
    if (!hasTable(db, backup)) db.exec("ALTER TABLE " + legacy + " RENAME TO " + backup);
  }
}

/** 旧库增量迁移（CREATE TABLE IF NOT EXISTS 不会补列）。 */
function migrateLocalDb(db: DatabaseSync, version: string): void {
  db.exec("BEGIN IMMEDIATE");
  try {
    // 先搬旧表：下面补列 / 建索引都针对新表，搬完老表才有数据。
    migrateLegacyAutomationTables(db, version);
    if (!hasColumn(db, "conflict_shadow", "kind")) {
      db.exec("ALTER TABLE conflict_shadow ADD COLUMN kind TEXT NOT NULL DEFAULT 'pull'");
    }
    if (!hasColumn(db, "conflict_shadow", "resolution")) {
      db.exec("ALTER TABLE conflict_shadow ADD COLUMN resolution TEXT NOT NULL DEFAULT 'server'");
    }
    if (!hasColumn(db, "conflict_shadow", "server_updated_at")) {
      db.exec("ALTER TABLE conflict_shadow ADD COLUMN server_updated_at INTEGER");
    }
    if (!hasColumn(db, "conflict_shadow", "local_updated_at")) {
      db.exec("ALTER TABLE conflict_shadow ADD COLUMN local_updated_at INTEGER");
    }
    // 自动化内化为宿主能力：老库的自动化表缺这三列（插件版后来才加），补列保证规则可读。
    for (const [name, ddl] of [
      ["exec_mode", "TEXT NOT NULL DEFAULT 'action'"],
      ["agent_json", "TEXT NOT NULL DEFAULT ''"],
      ["schedule_id", "TEXT"],
    ] as const) {
      if (!hasColumn(db, "host_automation_rule", name)) {
        db.exec("ALTER TABLE host_automation_rule ADD COLUMN " + name + " " + ddl);
      }
    }
    // 内置自动化规则来源：老库一律回填 user（历史规则都是用户自己建的）。
    for (const [name, ddl] of [
      ["origin", "TEXT NOT NULL DEFAULT 'user'"],
      ["owner_domain", "TEXT"],
      ["rule_key", "TEXT"],
      ["origin_version", "TEXT"],
    ] as const) {
      if (!hasColumn(db, "host_automation_rule", name)) {
        db.exec("ALTER TABLE host_automation_rule ADD COLUMN " + name + " " + ddl);
      }
    }
    // 索引放在补列之后建：刚补上 owner_domain / rule_key 才能建。
    db.exec(
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_host_automation_rule_builtin " +
        "ON host_automation_rule(owner_domain, rule_key) WHERE origin='plugin'",
    );
    db.exec("CREATE INDEX IF NOT EXISTS idx_host_automation_rule_origin ON host_automation_rule(origin)");
    // 事件队列定向投递：老库的事件一律视为广播，补列后对外语义不变。
    if (!hasColumn(db, "host_event", "mode")) {
      db.exec("ALTER TABLE host_event ADD COLUMN mode TEXT NOT NULL DEFAULT 'broadcast'");
    }
    // 旧记录开关退出。仅在检测到过渡版本的列时删除无角色偏好，保留已选角色及其版本。
    if (hasColumn(db, "session_role", "enabled")) {
      db.exec("DELETE FROM session_role WHERE role_id IS NULL");
      db.exec("ALTER TABLE session_role DROP COLUMN enabled");
    }
    db.exec("DROP TABLE IF EXISTS session_mode");
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

/** 打开（或创建）工作台本地库并跑基线 schema。单进程权威，WAL。 */
export function openDb(file: string, version = "0"): DatabaseSync {
  mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(SCHEMA_SQL);
  migrateLocalDb(db, version);
  return db;
}

/** UUIDv7：时间有序主键。demo 简化实现（48bit ms + rand）。 */
export function uuidv7(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const ms = Date.now();
  bytes[0] = (ms / 2 ** 40) & 0xff;
  bytes[1] = (ms / 2 ** 32) & 0xff;
  bytes[2] = (ms / 2 ** 24) & 0xff;
  bytes[3] = (ms / 2 ** 16) & 0xff;
  bytes[4] = (ms / 2 ** 8) & 0xff;
  bytes[5] = ms & 0xff;
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const h = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** 单调化时间戳：防时钟回拨导致的乱序覆盖（07 失败模式清单）。 */
let lastTs = 0;
export function monoNow(): number {
  const wall = Date.now();
  lastTs = Math.max(wall, lastTs + 1);
  return lastTs;
}
