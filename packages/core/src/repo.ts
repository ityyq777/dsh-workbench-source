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

/**
 * 应用一条远端 upsert（pull 路径）：行级 LWW —— 仅当服务端 updated_at 更大才覆盖；
 * 相等则以本地为准。输方（本地更新）写 conflict_shadow 供 UI 展示。
 * 表不存在（对应 addon 尚未安装）时直接跳过：数据仍在云端，安装后下次 pull 会补回。
 */
export function applyRemoteUpsert(
  db: DatabaseSync,
  tableName: string,
  remote: Record<string, unknown>,
  serverUpdatedAt: number,
): void {
  if (!tableExists(db, tableName)) {
    return;
  }
  const cur = db.prepare("SELECT * FROM " + tableName + " WHERE id=?").get(remote.id as string) as
    | Record<string, unknown>
    | undefined;
  if (cur && (cur.deleted_at === null || cur.deleted_at === undefined)) {
    if (Number(cur.updated_at) > serverUpdatedAt) {
      db.prepare(
        "INSERT INTO conflict_shadow(table_name,row_id,local_payload,server_payload,resolved_at) VALUES(?,?,?,?,?)",
      ).run(tableName, remote.id as string, JSON.stringify(cur), JSON.stringify(remote), monoNow());
      return;
    }
  }
  const cols = Object.keys(remote);
  // 通用整行替换：先删后插保证列集合与服务端一致（demo 表结构稳定）
  db.prepare("DELETE FROM " + tableName + " WHERE id=?").run(remote.id as string);
  const placeholders = cols.map(() => "?").join(",");
  db.prepare("INSERT INTO " + tableName + " (" + cols.join(",") + ") VALUES(" + placeholders + ")").run(
    ...cols.map((c) => remote[c] as never),
  );
}

/** 应用一条远端 delete（pull 路径）：本地打墓碑，不进 change log；表不存在则跳过。 */
export function applyRemoteDelete(db: DatabaseSync, tableName: string, rowId: string): void {
  if (!tableExists(db, tableName)) {
    return;
  }
  const ts = monoNow();
  db.prepare("UPDATE " + tableName + " SET deleted_at=?, updated_at=? WHERE id=?").run(ts, ts, rowId);
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

/** 记录已同步水位。 */
export function setSyncState(db: DatabaseSync, key: string, value: number): void {
  db.prepare("INSERT INTO sync_state(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").run(key, value);
}

export function getSyncState(db: DatabaseSync, key: string): number {
  const row = db.prepare("SELECT v FROM sync_state WHERE k=?").get(key) as { v: number } | undefined;
  return row?.v ?? 0;
}

/** 供子插件宿主 API 复用：判断表是否存在。 */
export { tableExists };
