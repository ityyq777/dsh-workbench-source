import type { DatabaseSync } from "node:sqlite";
import { monoNow } from "./db.js";

/** 变更来源：ui/agent 本地写要进 change log；sync 回写不进（循环防护，05 文档）。 */
export type WriteOrigin = "ui" | "agent" | "sync";

/**
 * 平台同步层：只做「表无关」的事情。
 * 具体业务（任务增删改查）属于子插件，壳不 import、不硬编码。
 */

function tableExists(db: DatabaseSync, tableName: string): boolean {
  return Boolean(
    db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(tableName),
  );
}

function stableStringify(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "[" + value.map((v) => stableStringify(v)).join(",") + "]";
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return "{" + Object.keys(obj).sort().map((k) => JSON.stringify(k) + ":" + stableStringify(obj[k])).join(",") + "}";
  }
  return JSON.stringify(value);
}

export function writeConflict(
  db: DatabaseSync,
  tableName: string,
  rowId: string,
  kind: string,
  resolution: string,
  local: Record<string, unknown> | null,
  server: Record<string, unknown> | null,
  serverUpdatedAt: number | null,
  localUpdatedAt: number | null,
): void {
  db.prepare(
    "INSERT INTO conflict_shadow(table_name,row_id,kind,resolution,local_payload,server_payload,server_updated_at,local_updated_at,resolved_at) " +
      "VALUES(?,?,?,?,?,?,?,?,?)",
  ).run(
    tableName,
    rowId,
    kind,
    resolution,
    local ? JSON.stringify(local) : null,
    server ? JSON.stringify(server) : null,
    serverUpdatedAt,
    localUpdatedAt,
    monoNow(),
  );
}

/**
 * 应用一条远端 upsert（pull 路径）：严格行级 LWW。
 *  - 本地 updated_at 更大：保留本地，写 conflict_shadow；
 *  - 相等：payload 相同则幂等，不同则以服务端为准并写 shadow；
 *  - 远端更大：整行替换。
 * 表不存在（对应插件未安装）时直接跳过：数据仍在云端，安装后 snapshot 补回。
 */
export function applyRemoteUpsert(
  db: DatabaseSync,
  tableName: string,
  remote: Record<string, unknown>,
  serverUpdatedAt: number,
): boolean {
  if (!tableExists(db, tableName)) return false;
  const rowId = String(remote.id ?? "");
  if (!rowId) return false;
  const cur = db.prepare("SELECT * FROM " + tableName + " WHERE id=?").get(rowId) as
    | Record<string, unknown>
    | undefined;
  if (cur) {
    const localUpdatedAt = Number(cur.updated_at) || 0;
    if (localUpdatedAt > serverUpdatedAt) {
      writeConflict(db, tableName, rowId, "pull", "local", cur, remote, serverUpdatedAt, localUpdatedAt);
      return false;
    }
    if (localUpdatedAt === serverUpdatedAt && stableStringify(cur) !== stableStringify(remote)) {
      writeConflict(db, tableName, rowId, "pull-equal", "server", cur, remote, serverUpdatedAt, localUpdatedAt);
    }
  }
  const cols = Object.keys(remote);
  // 通用整行替换：先删后插保证列集合与服务端一致（列由业务插件建表，同步方不感知）。
  db.prepare("DELETE FROM " + tableName + " WHERE id=?").run(rowId);
  const placeholders = cols.map(() => "?").join(",");
  db.prepare("INSERT INTO " + tableName + " (" + cols.join(",") + ") VALUES(" + placeholders + ")").run(
    ...cols.map((c) => remote[c] as never),
  );
  return true;
}

/**
 * 应用一条远端墓碑。v2 的 delete 事件带完整行 payload，走同一套 LWW；
 * 旧协议没有 payload 时退化为本地打墓碑（仍用远端事件时间，而不是本机时间）。
 */
export function applyRemoteDelete(
  db: DatabaseSync,
  tableName: string,
  rowId: string,
  remote?: Record<string, unknown> | null,
  serverUpdatedAt?: number,
): boolean {
  if (!tableExists(db, tableName)) return false;
  if (remote && remote.id !== undefined) {
    return applyRemoteUpsert(db, tableName, remote, Number(serverUpdatedAt ?? remote.updated_at ?? Date.now()));
  }
  const ts = Number(serverUpdatedAt ?? Date.now());
  db.prepare("UPDATE " + tableName + " SET deleted_at=?, updated_at=? WHERE id=? AND updated_at<=?").run(
    ts,
    ts,
    rowId,
    ts,
  );
  return true;
}

/** 记录一条死信（单行/单表失败，不阻塞其他表）。 */
export function recordDeadLetter(
  db: DatabaseSync,
  tableName: string,
  rowId: string,
  op: string,
  payload: string | null,
  error: string,
): void {
  const now = monoNow();
  const existing = db
    .prepare("SELECT id,attempts FROM sync_dead_letter WHERE table_name=? AND row_id=? AND op=?")
    .get(tableName, rowId, op) as { id: number; attempts: number } | undefined;
  if (existing) {
    db.prepare("UPDATE sync_dead_letter SET payload=?,error=?,attempts=?,updated_at=? WHERE id=?").run(
      payload,
      error,
      existing.attempts + 1,
      now,
      existing.id,
    );
  } else {
    db.prepare(
      "INSERT INTO sync_dead_letter(table_name,row_id,op,payload,error,attempts,created_at,updated_at) VALUES(?,?,?,?,?,1,?,?)",
    ).run(tableName, rowId, op, payload, error, now, now);
  }
  db.exec(
    "DELETE FROM sync_dead_letter WHERE id NOT IN (SELECT id FROM sync_dead_letter ORDER BY id DESC LIMIT 1000)",
  );
}

/** 读取待推送的变更尾部（seq > afterSeq），按 seq 升序。 */
export function pendingChanges(
  db: DatabaseSync,
  afterSeq: number,
  limit = 200,
): {
  seq: number;
  table_name: string;
  row_id: string;
  op: string;
  payload: string | null;
  origin: string;
  updated_at: number;
}[] {
  return db.prepare("SELECT * FROM sync_change_log WHERE seq>? ORDER BY seq ASC LIMIT ?").all(afterSeq, limit) as never;
}

/** 记录已同步水位（数字；v1 兼容）。 */
export function setSyncState(db: DatabaseSync, key: string, value: number): void {
  setSyncStateText(db, key, String(value));
}

export function getSyncState(db: DatabaseSync, key: string): number {
  const raw = getSyncStateText(db, key);
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

/** 文本水位：账号 id / epoch / 时间戳等统一入口。 */
export function setSyncStateText(db: DatabaseSync, key: string, value: string): void {
  db.prepare("INSERT INTO sync_state(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").run(key, value);
}

export function getSyncStateText(db: DatabaseSync, key: string): string {
  const row = db.prepare("SELECT v FROM sync_state WHERE k=?").get(key) as { v: unknown } | undefined;
  return row && row.v !== null && row.v !== undefined ? String(row.v) : "";
}

export function deleteSyncState(db: DatabaseSync, key: string): void {
  db.prepare("DELETE FROM sync_state WHERE k=?").run(key);
}

/** 供子插件宿主 API 复用：判断表是否存在。 */
export { tableExists };
