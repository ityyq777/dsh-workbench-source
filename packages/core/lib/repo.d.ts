import type { DatabaseSync } from "node:sqlite";
/** 变更来源：ui/agent 本地写要进 change log；sync 回写不进（循环防护，05 文档）。 */
export type WriteOrigin = "ui" | "agent" | "sync";
/** 任务行（DB 形态；tags 为 JSON 字符串）。 */
export interface TaskRow {
    id: string;
    title: string;
    note: string;
    status: string;
    priority: number;
    due_at: number | null;
    tags: string;
    rev: number;
    updated_at: number;
    deleted_at: number | null;
}
/** 创建任务。返回新行 id。 */
export declare function createTask(db: DatabaseSync, input: {
    title: string;
    note?: string;
    priority?: number;
    due_at?: number | null;
    tags?: string[];
}, origin?: WriteOrigin): string;
/** 更新任务字段（rev 自增）。partial 中出现的键才写入。 */
export declare function updateTask(db: DatabaseSync, id: string, patch: Partial<Pick<TaskRow, "title" | "note" | "status" | "priority" | "due_at">> & {
    tags?: string[];
}, origin?: WriteOrigin): boolean;
/** 软删任务（墓碑 + delete 变更条目）。 */
export declare function deleteTask(db: DatabaseSync, id: string, origin?: WriteOrigin): boolean;
/** 列表查询（默认不含墓碑）。 */
export declare function listTasks(db: DatabaseSync, opts?: {
    status?: string;
    includeDeleted?: boolean;
    limit?: number;
}): TaskRow[];
/** 统计摘要（Workbench tool stats / UI 概览共用）。 */
export declare function taskStats(db: DatabaseSync): {
    open: number;
    done: number;
    overdue: number;
    today: number;
};
/**
 * 应用一条远端 upsert（pull 路径）：行级 LWW —— 仅当服务端 updated_at 更大才覆盖；
 * 相等则比 device tiebreak 略过（同刻冲突罕见，demo 以本地为准）。
 * 输方（双方都活跃且内容不同）写 conflict_shadow 供 UI 展示。
 */
export declare function applyRemoteUpsert(db: DatabaseSync, tableName: string, remote: Record<string, unknown>, serverUpdatedAt: number): void;
/** 应用一条远端 delete（pull 路径）：本地打墓碑，不进 change log。 */
export declare function applyRemoteDelete(db: DatabaseSync, tableName: string, rowId: string): void;
/** 读取待推送的变更尾部（seq > afterSeq），按 seq 升序。 */
export declare function pendingChanges(db: DatabaseSync, afterSeq: number, limit?: number): {
    seq: number;
    table_name: string;
    row_id: string;
    op: string;
    payload: string | null;
    origin: string;
    updated_at: number;
}[];
/** 记录已同步水位。 */
export declare function setSyncState(db: DatabaseSync, key: string, value: number): void;
export declare function getSyncState(db: DatabaseSync, key: string): number;
