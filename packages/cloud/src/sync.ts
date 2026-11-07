import type { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";

// ───────────────────────────── protocol v2 ─────────────────────────────

export type SyncTableMode = "row" | "tree";
export type SyncPushStatus = "accepted" | "conflict" | "duplicate" | "invalid" | "equal";

export interface SyncErrorExtra {
  retry_after_ms?: number;
  version?: number;
  details?: unknown;
}

/** 可映射为 HTTP 错误的协议异常。 */
export class SyncError extends Error {
  status: number;
  code: string;
  extra: SyncErrorExtra;

  constructor(status: number, code: string, message: string, extra: SyncErrorExtra = {}) {
    super(message);
    this.name = "SyncError";
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

export interface PushItemV2 {
  client_seq: number;
  table_name: string;
  row_id: string;
  op: "upsert" | "delete";
  payload: Record<string, unknown>;
  updated_at: number;
}

export interface PushResultV2 {
  ok: true;
  accepted_up_to: number;
  results: {
    client_seq: number;
    table_name: string;
    row_id: string;
    status: SyncPushStatus;
    error?: string;
    current?: Record<string, unknown>;
  }[];
  server_time: number;
}

const TABLE_RE = /^[a-z][a-z0-9_]{1,63}$/;
const MAX_PUSH_ITEMS = 500;
const MAX_PAYLOAD_BYTES = 1_000_000;
const MAX_FULL_ROWS = 10_000;
const MAX_FULL_BYTES = 16 * 1024 * 1024;
const MAX_SNAPSHOT_ROWS = 20_000;
const MAX_PULL_LIMIT = 1_000;
const SESSION_TTL_MS = 300_000;

function isObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function safeInt(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  return Number.isSafeInteger(n) && n >= 0 ? n : null;
}

/**
 * 稳定 JSON 序列化：对象键排序，用于判断两条 payload 是否语义相同。
 * 输入必须来自 JSON.parse，因此只处理 JSON 值。
 */
export function stableStringify(value: unknown): string {
  if (value === null) return "null";
  const t = typeof value;
  if (t === "string" || t === "boolean" || t === "number") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map((v) => stableStringify(v)).join(",") + "]";
  if (isObject(value)) {
    const keys = Object.keys(value).sort();
    return "{" + keys.map((k) => JSON.stringify(k) + ":" + stableStringify(value[k])).join(",") + "}";
  }
  return "null";
}

function parsePayload(raw: unknown): Record<string, unknown> | null {
  if (typeof raw !== "string" || !raw) return null;
  try {
    const v = JSON.parse(raw);
    return isObject(v) ? v : null;
  } catch {
    return null;
  }
}

function assertTable(table: unknown): string {
  const name = String(table ?? "");
  if (!TABLE_RE.test(name)) {
    throw new SyncError(400, "invalid_table", "invalid table name");
  }
  return name;
}

function cleanupExpiredSessions(db: DatabaseSync, now: number): void {
  db.prepare("DELETE FROM sync_sessions WHERE expires_at<=?").run(now);
}

/** 打开用户级同步会话；同一设备重开覆盖旧会话，其他设备返回 409。 */
export function openSyncSession(
  db: DatabaseSync,
  userId: string,
  deviceId: string,
  protocol: unknown,
  ttlMs = SESSION_TTL_MS,
): {
  session_id: string;
  server_time: number;
  expires_at: number;
  tables: Record<string, { version: number; mode: SyncTableMode }>;
} {
  if (Number(protocol) !== 2) {
    throw new SyncError(426, "protocol_required", "protocol v2 required");
  }
  if (!deviceId || deviceId.length > 200) {
    throw new SyncError(400, "invalid_device", "device_id required");
  }
  const now = Date.now();
  cleanupExpiredSessions(db, now);
  const cur = db
    .prepare("SELECT session_id,device_id,expires_at FROM sync_sessions WHERE user_id=?")
    .get(userId) as { session_id: string; device_id: string; expires_at: number } | undefined;
  if (cur && cur.device_id !== deviceId) {
    throw new SyncError(409, "sync_locked", "another device is syncing", {
      retry_after_ms: Math.max(1, cur.expires_at - now),
    });
  }
  if (cur) db.prepare("DELETE FROM sync_sessions WHERE user_id=?").run(userId);
  const sid = randomUUID();
  const expires = now + Math.max(10_000, Math.min(ttlMs, 600_000));
  db.prepare(
    "INSERT INTO sync_sessions(user_id,session_id,device_id,opened_at,expires_at) VALUES(?,?,?,?,?)",
  ).run(userId, sid, deviceId, now, expires);
  const rows = db
    .prepare("SELECT table_name,version,mode FROM sync_table_state WHERE user_id=?")
    .all(userId) as { table_name: string; version: number; mode: string }[];
  const tables: Record<string, { version: number; mode: SyncTableMode }> = {};
  for (const r of rows) tables[r.table_name] = { version: r.version, mode: r.mode === "tree" ? "tree" : "row" };
  return { session_id: sid, server_time: now, expires_at: expires, tables };
}

/** 校验并续期会话；失败抛 409。 */
export function touchSyncSession(
  db: DatabaseSync,
  userId: string,
  deviceId: string,
  sessionId: unknown,
  ttlMs = SESSION_TTL_MS,
): void {
  const sid = String(sessionId ?? "");
  if (!sid) throw new SyncError(409, "session_required", "session_id required");
  const now = Date.now();
  const s = db
    .prepare("SELECT session_id,device_id,expires_at FROM sync_sessions WHERE user_id=?")
    .get(userId) as { session_id: string; device_id: string; expires_at: number } | undefined;
  if (!s || s.device_id !== deviceId || s.session_id !== sid) {
    throw new SyncError(409, "session_mismatch", "sync session not found");
  }
  if (s.expires_at <= now) {
    db.prepare("DELETE FROM sync_sessions WHERE user_id=?").run(userId);
    throw new SyncError(409, "session_expired", "sync session expired");
  }
  db.prepare("UPDATE sync_sessions SET expires_at=? WHERE user_id=?").run(
    now + Math.max(10_000, Math.min(ttlMs, 600_000)),
    userId,
  );
}

/**
 * v2 push：逐条校验 + 幂等 + 严格 LWW。
 * 入站 updated_at 更大才胜；相等且 payload 不同，服务端已有行胜（返回 conflict）。
 */
export function pushChangesV2(
  db: DatabaseSync,
  userId: string,
  deviceId: string,
  clientEpoch: string,
  sessionId: string,
  items: unknown,
): PushResultV2 {
  if (!Array.isArray(items)) throw new SyncError(400, "invalid_changes", "changes must be an array");
  if (items.length > MAX_PUSH_ITEMS) throw new SyncError(413, "too_many_changes", "too many changes");
  touchSyncSession(db, userId, deviceId, sessionId);
  const epoch = String(clientEpoch ?? "");
  if (!epoch) throw new SyncError(400, "epoch_required", "client_epoch required");

  let acceptedUpTo = 0;
  const results: PushResultV2["results"] = [];
  const accepted: { item: PushItemV2; payload: string; deleted: number }[] = [];

  for (const raw of items) {
    const item = isObject(raw) ? raw : {};
    const clientSeq = safeInt(item.client_seq);
    if (clientSeq === null || clientSeq < 1) {
      results.push({
        client_seq: clientSeq ?? 0,
        table_name: String(item.table_name ?? ""),
        row_id: String(item.row_id ?? ""),
        status: "invalid",
        error: "invalid client_seq",
      });
      continue;
    }
    acceptedUpTo = Math.max(acceptedUpTo, clientSeq);
    const table = String(item.table_name ?? "");
    const rowId = String(item.row_id ?? "");
    const op = item.op === "delete" ? "delete" : item.op === "upsert" ? "upsert" : null;
    const updatedAt = safeInt(item.updated_at);
    const payload = isObject(item.payload) ? item.payload : null;
    let error: string | null = null;
    if (!TABLE_RE.test(table)) error = "invalid table_name";
    else if (!rowId || rowId.length > 200) error = "invalid row_id";
    else if (!op) error = "invalid op";
    else if (updatedAt === null) error = "invalid updated_at";
    else if (!payload) error = "payload must be an object";
    else if (String(payload.id ?? "") !== rowId) error = "payload.id must equal row_id";
    else if (safeInt(payload.updated_at) !== updatedAt) error = "payload.updated_at must equal updated_at";
    if (error || !payload || updatedAt === null || !op) {
      results.push({
        client_seq: clientSeq,
        table_name: table,
        row_id: rowId,
        status: "invalid",
        error: error ?? "invalid change",
      });
      continue;
    }
    const canonical = stableStringify(payload);
    if (Buffer.byteLength(canonical, "utf8") > MAX_PAYLOAD_BYTES) {
      results.push({
        client_seq: clientSeq,
        table_name: table,
        row_id: rowId,
        status: "invalid",
        error: "payload too large",
      });
      continue;
    }

    const dup = db
      .prepare(
        "SELECT 1 FROM change_log WHERE user_id=? AND device_id=? AND client_epoch=? AND client_seq=?",
      )
      .get(userId, deviceId, epoch, clientSeq);
    const cur = db
      .prepare("SELECT payload,updated_at FROM row_states WHERE user_id=? AND table_name=? AND row_id=?")
      .get(userId, table, rowId) as { payload: string | null; updated_at: number } | undefined;
    if (dup) {
      results.push({
        client_seq: clientSeq,
        table_name: table,
        row_id: rowId,
        status: "duplicate",
        current: cur ? parsePayload(cur.payload) ?? undefined : undefined,
      });
      continue;
    }
    if (cur && cur.updated_at > updatedAt) {
      results.push({
        client_seq: clientSeq,
        table_name: table,
        row_id: rowId,
        status: "conflict",
        current: parsePayload(cur.payload) ?? undefined,
      });
      continue;
    }
    if (cur && cur.updated_at === updatedAt) {
      const same = (() => {
        const prev = parsePayload(cur.payload);
        return prev ? stableStringify(prev) === canonical : false;
      })();
      results.push({
        client_seq: clientSeq,
        table_name: table,
        row_id: rowId,
        status: same ? "equal" : "conflict",
        current: parsePayload(cur.payload) ?? undefined,
      });
      continue;
    }
    const deleted = payload.deleted_at !== null && payload.deleted_at !== undefined ? 1 : 0;
    accepted.push({ item: { client_seq: clientSeq, table_name: table, row_id: rowId, op, payload, updated_at: updatedAt }, payload: canonical, deleted });
    results.push({ client_seq: clientSeq, table_name: table, row_id: rowId, status: "accepted" });
  }

  if (accepted.length) {
    db.exec("BEGIN IMMEDIATE");
    try {
      for (const a of accepted) {
        db.prepare(
          "INSERT INTO row_states(user_id,table_name,row_id,payload,deleted,updated_at) VALUES(?,?,?,?,?,?) " +
            "ON CONFLICT(user_id,table_name,row_id) DO UPDATE SET payload=excluded.payload, deleted=excluded.deleted, updated_at=excluded.updated_at",
        ).run(userId, a.item.table_name, a.item.row_id, a.payload, a.deleted, a.item.updated_at);
        db.prepare(
          "INSERT INTO change_log(user_id,device_id,client_epoch,client_seq,table_name,row_id,op,payload,updated_at) VALUES(?,?,?,?,?,?,?,?,?)",
        ).run(
          userId,
          deviceId,
          epoch,
          a.item.client_seq,
          a.item.table_name,
          a.item.row_id,
          a.item.op,
          a.payload,
          a.item.updated_at,
        );
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

  return { ok: true, accepted_up_to: acceptedUpTo, results, server_time: Date.now() };
}

export interface PullEntryV2 {
  server_seq: number;
  device_id: string;
  client_epoch: string;
  table_name: string;
  row_id: string;
  op: string;
  payload: Record<string, unknown> | null;
  updated_at: number;
}

/** v2 pull：按表游标拉取，返回 next_cursors/has_more/min_seq；包含 reset 记录。 */
export function pullChangesV2(
  db: DatabaseSync,
  userId: string,
  deviceId: string,
  sessionId: string,
  cursorsRaw: unknown,
  limitRaw: unknown,
): {
  ok: true;
  entries: PullEntryV2[];
  next_cursors: Record<string, number>;
  has_more: boolean;
  min_seq: number;
  server_time: number;
} {
  touchSyncSession(db, userId, deviceId, sessionId);
  const cursorsIn = isObject(cursorsRaw) ? cursorsRaw : {};
  const cursors: Record<string, number> = {};
  for (const [t, v] of Object.entries(cursorsIn)) {
    if (!TABLE_RE.test(t)) continue;
    const n = safeInt(v);
    if (n !== null) cursors[t] = n;
  }
  const limit = Math.max(1, Math.min(MAX_PULL_LIMIT, safeInt(limitRaw) ?? 200));
  const perTable: PullEntryV2[][] = [];
  for (const [table, cursor] of Object.entries(cursors)) {
    const rows = db
      .prepare(
        "SELECT server_seq,device_id,client_epoch,table_name,row_id,op,payload,updated_at FROM change_log " +
          "WHERE user_id=? AND table_name=? AND server_seq>? ORDER BY server_seq ASC LIMIT ?",
      )
      .all(userId, table, cursor, limit + 1) as Record<string, unknown>[];
    perTable.push(
      rows.map((r) => ({
        server_seq: Number(r.server_seq),
        device_id: String(r.device_id),
        client_epoch: String(r.client_epoch ?? ""),
        table_name: String(r.table_name),
        row_id: String(r.row_id),
        op: String(r.op),
        payload: parsePayload(r.payload),
        updated_at: Number(r.updated_at),
      })),
    );
  }
  const merged = perTable.flat().sort((a, b) => a.server_seq - b.server_seq);
  const entries = merged.slice(0, limit);
  const nextCursors: Record<string, number> = { ...cursors };
  for (const e of entries) nextCursors[e.table_name] = Math.max(nextCursors[e.table_name] ?? 0, e.server_seq);
  let hasMore = merged.length > entries.length;
  if (!hasMore) {
    for (const table of Object.keys(cursors)) {
      const more = db
        .prepare("SELECT 1 FROM change_log WHERE user_id=? AND table_name=? AND server_seq>? LIMIT 1")
        .get(userId, table, nextCursors[table] ?? 0);
      if (more) {
        hasMore = true;
        break;
      }
    }
  }
  const min = db.prepare("SELECT MIN(server_seq) AS n FROM change_log WHERE user_id=?").get(userId) as
    | { n: number | null }
    | undefined;
  return {
    ok: true,
    entries,
    next_cursors: nextCursors,
    has_more: hasMore,
    min_seq: min?.n ?? 0,
    server_time: Date.now(),
  };
}

/** 全量快照：返回该表当前所有行 + 版本 + 最新 cursor。 */
export function snapshotTable(
  db: DatabaseSync,
  userId: string,
  deviceId: string,
  sessionId: string,
  tableRaw: unknown,
): {
  ok: true;
  table_name: string;
  rows: Record<string, unknown>[];
  cursor: number;
  version: number;
  mode: SyncTableMode;
  server_time: number;
} {
  touchSyncSession(db, userId, deviceId, sessionId);
  const table = assertTable(tableRaw);
  db.exec("BEGIN");
  try {
    const rows = db
      .prepare("SELECT payload FROM row_states WHERE user_id=? AND table_name=? ORDER BY row_id ASC")
      .all(userId, table) as { payload: string | null }[];
    if (rows.length > MAX_SNAPSHOT_ROWS) {
      throw new SyncError(413, "snapshot_too_large", "snapshot too large");
    }
    const state = db
      .prepare("SELECT version,mode FROM sync_table_state WHERE user_id=? AND table_name=?")
      .get(userId, table) as { version: number; mode: string } | undefined;
    const cur = db
      .prepare("SELECT MAX(server_seq) AS n FROM change_log WHERE user_id=? AND table_name=?")
      .get(userId, table) as { n: number | null } | undefined;
    const out = {
      ok: true as const,
      table_name: table,
      rows: rows.map((r) => parsePayload(r.payload) ?? {}),
      cursor: cur?.n ?? 0,
      version: state?.version ?? 0,
      mode: (state?.mode === "tree" ? "tree" : "row") as SyncTableMode,
      server_time: Date.now(),
    };
    db.exec("COMMIT");
    return out;
  } catch (e) {
    try {
      db.exec("ROLLBACK");
    } catch {
      /* ignore */
    }
    throw e;
  }
}

/**
 * B 类整表覆盖：base_version 乐观锁；成功则替换 row_states、版本 +1，并写 reset 日志。
 */
export function fullTable(
  db: DatabaseSync,
  userId: string,
  deviceId: string,
  sessionId: string,
  tableRaw: unknown,
  baseVersionRaw: unknown,
  rowsRaw: unknown,
): { ok: true; table_name: string; version: number; cursor: number; server_time: number } {
  touchSyncSession(db, userId, deviceId, sessionId);
  const table = assertTable(tableRaw);
  const baseVersion = safeInt(baseVersionRaw);
  if (baseVersion === null) throw new SyncError(400, "invalid_base_version", "invalid base_version");
  if (!Array.isArray(rowsRaw)) throw new SyncError(400, "invalid_rows", "rows must be an array");
  if (rowsRaw.length > MAX_FULL_ROWS) throw new SyncError(413, "full_too_large", "too many rows");
  const rows: { id: string; payload: string; deleted: number; updated_at: number }[] = [];
  const seen = new Set<string>();
  let bytes = 0;
  for (const raw of rowsRaw) {
    if (!isObject(raw)) throw new SyncError(400, "invalid_row", "row must be an object");
    const id = String(raw.id ?? "");
    const updatedAt = safeInt(raw.updated_at);
    if (!id || id.length > 200 || seen.has(id)) throw new SyncError(400, "invalid_row", "invalid or duplicate row id");
    if (updatedAt === null) throw new SyncError(400, "invalid_row", "invalid row updated_at");
    if (String(raw.id) !== rowIdOf(raw)) throw new SyncError(400, "invalid_row", "row.id mismatch");
    const canonical = stableStringify(raw);
    bytes += Buffer.byteLength(canonical, "utf8");
    if (bytes > MAX_FULL_BYTES) throw new SyncError(413, "full_too_large", "full payload too large");
    seen.add(id);
    rows.push({
      id,
      payload: canonical,
      deleted: raw.deleted_at !== null && raw.deleted_at !== undefined ? 1 : 0,
      updated_at: updatedAt,
    });
  }

  db.exec("BEGIN IMMEDIATE");
  try {
    const state = db
      .prepare("SELECT version FROM sync_table_state WHERE user_id=? AND table_name=?")
      .get(userId, table) as { version: number } | undefined;
    const current = state?.version ?? 0;
    if (current !== baseVersion) {
      throw new SyncError(409, "version_conflict", "table version changed", { version: current });
    }
    db.prepare("DELETE FROM row_states WHERE user_id=? AND table_name=?").run(userId, table);
    const ins = db.prepare(
      "INSERT INTO row_states(user_id,table_name,row_id,payload,deleted,updated_at) VALUES(?,?,?,?,?,?)",
    );
    for (const r of rows) ins.run(userId, table, r.id, r.payload, r.deleted, r.updated_at);
    const nextVersion = current + 1;
    db.prepare(
      "INSERT INTO sync_table_state(user_id,table_name,version,mode,updated_at) VALUES(?,?,?,?,?) " +
        "ON CONFLICT(user_id,table_name) DO UPDATE SET version=excluded.version, mode=excluded.mode, updated_at=excluded.updated_at",
    ).run(userId, table, nextVersion, "tree", Date.now());
    db.prepare(
      "INSERT INTO change_log(user_id,device_id,client_epoch,client_seq,table_name,row_id,op,payload,updated_at) VALUES(?,?,?,?,?,?,?,?,?)",
    ).run(
      userId,
      deviceId,
      "reset-" + randomUUID(),
      0,
      table,
      "*",
      "reset",
      stableStringify({ version: nextVersion }),
      Date.now(),
    );
    const cur = db
      .prepare("SELECT MAX(server_seq) AS n FROM change_log WHERE user_id=? AND table_name=?")
      .get(userId, table) as { n: number | null } | undefined;
    db.exec("COMMIT");
    return { ok: true, table_name: table, version: nextVersion, cursor: cur?.n ?? 0, server_time: Date.now() };
  } catch (e) {
    try {
      db.exec("ROLLBACK");
    } catch {
      /* ignore */
    }
    throw e;
  }
}

function rowIdOf(row: Record<string, unknown>): string {
  return String(row.id ?? "");
}

/** 关闭会话：幂等；success 时记录设备游标与最后同步时间。 */
export function closeSyncSession(
  db: DatabaseSync,
  userId: string,
  deviceId: string,
  sessionId: unknown,
  success: unknown,
  cursorsRaw: unknown,
): { ok: true } {
  const sid = String(sessionId ?? "");
  if (sid) {
    db.prepare("DELETE FROM sync_sessions WHERE user_id=? AND session_id=?").run(userId, sid);
  }
  if (success) {
    const cursors = isObject(cursorsRaw) ? cursorsRaw : {};
    const clean: Record<string, number> = {};
    for (const [t, v] of Object.entries(cursors)) {
      if (!TABLE_RE.test(t)) continue;
      const n = safeInt(v);
      if (n !== null) clean[t] = n;
    }
    db.prepare("UPDATE devices SET last_sync_at=?, cursors=? WHERE id=? AND user_id=?").run(
      Date.now(),
      JSON.stringify(clean),
      deviceId,
      userId,
    );
  }
  return { ok: true };
}
