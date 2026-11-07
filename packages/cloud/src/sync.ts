import type { DatabaseSync } from "node:sqlite";
import { SYNCED_TABLES } from "@wb/core";

export interface PushItem {
  client_seq: number;
  table_name: string;
  row_id: string;
  op: "upsert" | "delete";
  payload: string | null;
  updated_at: number;
}

/**
 * push：按 (device_id, client_seq) 幂等；逐条 server LWW 合并进 row_states，
 * 同时追加 change_log（pull 数据源）。返回 accepted_up_to 与冲突行。
 */
export function pushChanges(db: DatabaseSync, userId: string, deviceId: string, items: PushItem[]): { accepted_up_to: number; conflicts: string[] } {
  let acceptedUpTo = 0;
  const conflicts: string[] = [];
  for (const item of items) {
    if (!SYNCED_TABLES.has(item.table_name)) {
      continue; // 未知表忽略（协议向前兼容）
    }
    // 幂等：同 (user,device,client_seq) 已入库则跳过但仍计入水位
    const dup = db.prepare(
      "SELECT 1 FROM change_log WHERE user_id=? AND device_id=? AND client_seq=?",
    ).get(userId, deviceId, item.client_seq);
    if (!dup) {
      db.prepare(
        "INSERT INTO change_log(user_id,device_id,client_seq,table_name,row_id,op,payload,updated_at) VALUES(?,?,?,?,?,?,?,?)",
      ).run(userId, deviceId, item.client_seq, item.table_name, item.row_id, item.op, item.payload, item.updated_at);
    }
    // 行快照 LWW 合并
    const cur = db.prepare(
      "SELECT updated_at FROM row_states WHERE user_id=? AND table_name=? AND row_id=?",
    ).get(userId, item.table_name, item.row_id) as { updated_at: number } | undefined;
    if (!cur || item.updated_at >= cur.updated_at) {
      if (item.op === "upsert" && item.payload) {
        db.prepare(
          "INSERT INTO row_states(user_id,table_name,row_id,payload,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(user_id,table_name,row_id) DO UPDATE SET payload=excluded.payload, updated_at=excluded.updated_at",
        ).run(userId, item.table_name, item.row_id, item.payload, item.updated_at);
      } else if (item.op === "delete") {
        // 墓碑：payload 置 null 保留 updated_at 前进
        db.prepare(
          "INSERT INTO row_states(user_id,table_name,row_id,payload,updated_at) VALUES(?,?,?,NULL,?) ON CONFLICT(user_id,table_name,row_id) DO UPDATE SET payload=NULL, updated_at=excluded.updated_at",
        ).run(userId, item.table_name, item.row_id, item.updated_at);
      }
    } else {
      conflicts.push(`${item.table_name}:${item.row_id}`);
    }
    acceptedUpTo = Math.max(acceptedUpTo, item.client_seq);
  }
  return { accepted_up_to: acceptedUpTo, conflicts };
}

/** pull：返回 (cursor, cursor+limit] 的变更流 + 新游标。 */
export function pullChanges(db: DatabaseSync, userId: string, cursor: number, limit = 500): { entries: { server_seq: number; device_id: string; table_name: string; row_id: string; op: string; payload: string | null; updated_at: number }[]; next_cursor: number } {
  const entries = db.prepare(
    "SELECT server_seq, device_id, table_name, row_id, op, payload, updated_at FROM change_log WHERE user_id=? AND server_seq>? ORDER BY server_seq ASC LIMIT ?",
  ).all(userId, cursor, limit) as never;
  const list = entries as { server_seq: number }[];
  return { entries: entries as never, next_cursor: list.length ? list[list.length - 1].server_seq : cursor };
}
