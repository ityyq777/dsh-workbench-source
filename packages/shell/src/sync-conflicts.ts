import type { DatabaseSync } from "node:sqlite";
import type { SyncRow } from "@wb/sdk";
import type { SyncDomain } from "./sync-types.js";
import { applyIncoming, incomingTransaction } from "./sync-incoming.js";
import { parseObject, stableStringify } from "./sync-values.js";

export function listConflicts(db: DatabaseSync, limit = 100): Record<string, unknown>[] {
  return db.prepare("SELECT * FROM conflict_shadow ORDER BY id DESC LIMIT ?").all(Math.max(1, Math.min(500, Number(limit) || 100))) as Record<string, unknown>[];
}
/** Domain declarations are required for domain-specific validation during manual resolution. */
export function resolveConflict(db: DatabaseSync, id: number, action: "keep_local" | "keep_server" | "dismiss", now: number, domains: SyncDomain[] = []): boolean {
  return incomingTransaction(db, () => {
    const shadow = db.prepare("SELECT * FROM conflict_shadow WHERE id=?").get(id);
    if (!shadow) return false;
    if (action === "dismiss") { db.prepare("DELETE FROM conflict_shadow WHERE id=?").run(id); return true; }
    const name = String(shadow.table_name);
    const table = domains.flatMap(d => d.sync?.tables ?? []).find(t => t.name === name) ?? {name,mode:"row" as const};
    const row = parseObject(action === "keep_server" ? shadow.server_payload : shadow.local_payload) as SyncRow | null;
    if (!row) return false;
    if (row.id !== shadow.row_id) throw new Error("SYNC_ROW_ID_MISMATCH");
    if (action === "keep_local") {
      row.updated_at = Math.max(Number(row.updated_at) || 0, Number(shadow.server_updated_at) || 0, now) + 1;
      row.rev = (Number(row.rev) || 1) + 1;
    }
    if (!applyIncoming(db, table, row, Number(row.updated_at) || now, undefined, true)) return false;
    if (action === "keep_local") {
      const stored = db.prepare("SELECT * FROM " + name + " WHERE id=?").get(row.id);
      db.prepare("INSERT INTO sync_change_log(table_name,row_id,op,payload,origin,updated_at) VALUES(?,?,?,?,?,?)")
        .run(name, row.id, row.deleted_at == null ? "upsert" : "delete", stableStringify(stored), "conflict-resolve", row.updated_at);
    }
    db.prepare("DELETE FROM conflict_shadow WHERE id=?").run(id);
    return true;
  });
}
