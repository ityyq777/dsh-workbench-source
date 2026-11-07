import type { DatabaseSync } from "node:sqlite";
import { pendingChanges, applyRemoteUpsert, applyRemoteDelete, getSyncState, setSyncState } from "@wb/core";

/** 云端客户端的最小接口（fetch 封装在宿主注入）。 */
export interface CloudClient {
  push(changes: unknown[]): Promise<{ accepted_up_to: number; conflicts: string[]; cursor: number }>;
  pull(cursor: number): Promise<{ entries: { server_seq: number; device_id: string; table_name: string; row_id: string; op: string; payload: string | null; updated_at: number }[]; next_cursor: number }>;
}

/**
 * 一轮完整同步：push 本地尾部 → pull 远端流。
 * 循环防护：applyRemote* 不写 change log（origin=sync 语义内建）。
 * 返回本轮统计供 UI/SSE 展示。
 */
export async function runSyncRound(db: DatabaseSync, client: CloudClient, deviceId: string): Promise<{ pushed: number; pulled: number }> {
  const afterKey = `push_after:${deviceId}`;
  const afterSeq = getSyncState(db, afterKey);
  let pushed = 0;
  const changes = pendingChanges(db, afterSeq, 200);
  if (changes.length) {
    const res = await client.push(
      changes.map((c) => ({ client_seq: c.seq, table_name: c.table_name, row_id: c.row_id, op: c.op, payload: c.payload, updated_at: c.updated_at })),
    );
    // 幂等水位：accepted_up_to 之前的本地条目全部视为已送达
    setSyncState(db, afterKey, Math.max(afterSeq, res.accepted_up_to));
    pushed = changes.filter((c) => c.seq <= res.accepted_up_to).length;
  }
  let pulled = 0;
  const pullKey = `pull_cursor:${deviceId}`;
  let cursor = getSyncState(db, pullKey);
  for (;;) {
    const page = await client.pull(cursor);
    for (const e of page.entries) {
      if (e.device_id === deviceId) {
        continue; // 自己的回声跳过（demo 简化；生产按 origin 过滤）
      }
      if (e.op === "upsert" && e.payload) {
        applyRemoteUpsert(db, e.table_name, JSON.parse(e.payload), e.updated_at);
      } else if (e.op === "delete") {
        applyRemoteDelete(db, e.table_name, e.row_id);
      }
      pulled++;
    }
    if (!page.next_cursor || page.next_cursor === cursor) break;
    cursor = page.next_cursor;
    setSyncState(db, pullKey, cursor);
    if (page.entries.length < 500) break;
  }
  return { pushed, pulled };
}
