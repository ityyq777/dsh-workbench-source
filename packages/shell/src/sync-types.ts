import type { DomainSyncTable, SyncRow } from "@wb/sdk";

/** 宿主侧同步域的最小视图（不 import 任何业务插件）。 */
export interface SyncDomain {
  id: string;
  tables?: string[];
  sync?: { tables: DomainSyncTable[] };
}

export interface SyncTableBinding {
  domainId: string;
  table: DomainSyncTable;
}

export interface SyncOpenResult {
  session_id: string;
  server_time: number;
  expires_at: number;
  tables: Record<string, { version: number; mode: "row" | "tree" }>;
}

export interface SyncPushResponse {
  ok: true;
  accepted_up_to: number;
  results: {
    client_seq: number;
    table_name: string;
    row_id: string;
    status: "accepted" | "conflict" | "duplicate" | "invalid" | "equal";
    error?: string;
    current?: Record<string, unknown>;
  }[];
  server_time: number;
}

export interface SyncPullEntry {
  server_seq: number;
  device_id: string;
  client_epoch: string;
  table_name: string;
  row_id: string;
  op: string;
  payload: Record<string, unknown> | null;
  updated_at: number;
}

export interface SyncPullResponse {
  ok: true;
  entries: SyncPullEntry[];
  next_cursors: Record<string, number>;
  has_more: boolean;
  min_seq: number;
  server_time: number;
}

export interface SyncSnapshotResponse {
  ok: true;
  table_name: string;
  rows: SyncRow[];
  cursor: number;
  version: number;
  mode: "row" | "tree";
  server_time?: number;
}

export interface SyncFullResponse {
  ok: true;
  table_name: string;
  version: number;
  cursor: number;
  server_time: number;
}

/** 宿主注入的协议客户端；index.ts 用 cloudFetch 实现。 */
export interface SyncTransport {
  open(protocol: number, deviceId: string): Promise<SyncOpenResult>;
  push(body: Record<string, unknown>): Promise<SyncPushResponse>;
  pull(body: Record<string, unknown>): Promise<SyncPullResponse>;
  snapshot(body: Record<string, unknown>): Promise<SyncSnapshotResponse>;
  full(body: Record<string, unknown>): Promise<SyncFullResponse>;
  close(body: Record<string, unknown>): Promise<{ ok: true }>;
}

