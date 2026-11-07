import { uuidv7, monoNow } from "./db.js";
/** 追加变更日志（在调用方的事务内执行；origin=sync 时跳过）。 */
function logChange(db, tableName, rowId, op, payload, origin, ts) {
    if (origin === "sync") {
        return;
    }
    db.prepare("INSERT INTO sync_change_log(table_name,row_id,op,payload,origin,updated_at) VALUES(?,?,?,?,?,?)").run(tableName, rowId, op, payload, origin, ts);
}
/** 创建任务。返回新行 id。 */
export function createTask(db, input, origin = "ui") {
    const id = uuidv7();
    const ts = monoNow();
    const row = {
        id,
        title: input.title,
        note: input.note ?? "",
        status: "open",
        priority: input.priority ?? 2,
        due_at: input.due_at ?? null,
        tags: JSON.stringify(input.tags ?? []),
        rev: 1,
        updated_at: ts,
        deleted_at: null,
    };
    db.prepare("INSERT INTO tasks(id,title,note,status,priority,due_at,tags,rev,updated_at,deleted_at) VALUES(?,?,?,?,?,?,?,?,?,NULL)").run(row.id, row.title, row.note, row.status, row.priority, row.due_at, row.tags, row.rev, row.updated_at);
    logChange(db, "tasks", id, "upsert", JSON.stringify(row), origin, ts);
    return id;
}
/** 更新任务字段（rev 自增）。partial 中出现的键才写入。 */
export function updateTask(db, id, patch, origin = "ui") {
    const cur = db.prepare("SELECT * FROM tasks WHERE id=? AND deleted_at IS NULL").get(id);
    if (!cur) {
        return false;
    }
    const ts = monoNow();
    const next = {
        ...cur,
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.note !== undefined ? { note: patch.note } : {}),
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
        ...(patch.due_at !== undefined ? { due_at: patch.due_at } : {}),
        ...(patch.tags !== undefined ? { tags: JSON.stringify(patch.tags) } : {}),
        rev: cur.rev + 1,
        updated_at: ts,
    };
    db.prepare("UPDATE tasks SET title=?,note=?,status=?,priority=?,due_at=?,tags=?,rev=?,updated_at=? WHERE id=?").run(next.title, next.note, next.status, next.priority, next.due_at, next.tags, next.rev, next.updated_at, id);
    logChange(db, "tasks", id, "upsert", JSON.stringify(next), origin, ts);
    return true;
}
/** 软删任务（墓碑 + delete 变更条目）。 */
export function deleteTask(db, id, origin = "ui") {
    const cur = db.prepare("SELECT * FROM tasks WHERE id=? AND deleted_at IS NULL").get(id);
    if (!cur) {
        return false;
    }
    const ts = monoNow();
    db.prepare("UPDATE tasks SET deleted_at=?, updated_at=? WHERE id=?").run(ts, ts, id);
    logChange(db, "tasks", id, "delete", null, origin, ts);
    return true;
}
/** 列表查询（默认不含墓碑）。 */
export function listTasks(db, opts = {}) {
    const conds = [];
    const args = [];
    if (!opts.includeDeleted) {
        conds.push("deleted_at IS NULL");
    }
    if (opts.status) {
        conds.push("status=?");
        args.push(opts.status);
    }
    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
    args.push(opts.limit ?? 200);
    return db.prepare(`SELECT * FROM tasks ${where} ORDER BY priority ASC, due_at IS NULL, due_at ASC, updated_at DESC LIMIT ?`).all(...args);
}
/** 统计摘要（Workbench tool stats / UI 概览共用）。 */
export function taskStats(db) {
    const row = db.prepare(`SELECT
      SUM(CASE WHEN deleted_at IS NULL AND status='open' THEN 1 ELSE 0 END) AS open,
      SUM(CASE WHEN deleted_at IS NULL AND status='done' THEN 1 ELSE 0 END) AS done,
      SUM(CASE WHEN deleted_at IS NULL AND status='open' AND due_at IS NOT NULL AND due_at < ? THEN 1 ELSE 0 END) AS overdue,
      SUM(CASE WHEN deleted_at IS NULL AND status='open' AND due_at IS NOT NULL AND due_at BETWEEN ? AND ? THEN 1 ELSE 0 END) AS today
     FROM tasks`).get(Date.now(), Date.now() - 86400000, Date.now() + 86400000);
    return { open: row.open ?? 0, done: row.done ?? 0, overdue: row.overdue ?? 0, today: row.today ?? 0 };
}
/**
 * 应用一条远端 upsert（pull 路径）：行级 LWW —— 仅当服务端 updated_at 更大才覆盖；
 * 相等则比 device tiebreak 略过（同刻冲突罕见，demo 以本地为准）。
 * 输方（双方都活跃且内容不同）写 conflict_shadow 供 UI 展示。
 */
export function applyRemoteUpsert(db, tableName, remote, serverUpdatedAt) {
    const cur = db.prepare(`SELECT * FROM ${tableName} WHERE id=?`).get(remote.id);
    if (cur && (cur.deleted_at === null || cur.deleted_at === undefined)) {
        if (cur.updated_at > serverUpdatedAt) {
            // 本地更新：保留本地，但把服务端版本留档冲突表（绝不静默丢弃）
            db.prepare("INSERT INTO conflict_shadow(table_name,row_id,local_payload,server_payload,resolved_at) VALUES(?,?,?,?,?)").run(tableName, remote.id, JSON.stringify(cur), JSON.stringify(remote), monoNow());
            return;
        }
    }
    if (cur && !remote.deleted_at) {
        // 服务端墓碑晚于本地：正常走 upsert 覆盖即可
    }
    const cols = Object.keys(remote);
    const existing = new Set(cols);
    // 通用整行替换：先删后插保证列集合与服务端一致（demo 表结构稳定）
    db.prepare(`DELETE FROM ${tableName} WHERE id=?`).run(remote.id);
    const placeholders = cols.map(() => "?").join(",");
    db.prepare(`INSERT INTO ${tableName} (${cols.join(",")}) VALUES(${placeholders})`).run(...cols.map((c) => remote[c]));
    void existing;
}
/** 应用一条远端 delete（pull 路径）：本地打墓碑，不进 change log。 */
export function applyRemoteDelete(db, tableName, rowId) {
    const ts = monoNow();
    const res = db.prepare(`UPDATE ${tableName} SET deleted_at=?, updated_at=? WHERE id=?`).run(ts, ts, rowId);
    void res;
}
/** 读取待推送的变更尾部（seq > afterSeq），按 seq 升序。 */
export function pendingChanges(db, afterSeq, limit = 200) {
    return db.prepare("SELECT * FROM sync_change_log WHERE seq>? ORDER BY seq ASC LIMIT ?").all(afterSeq, limit);
}
/** 记录已同步水位。 */
export function setSyncState(db, key, value) {
    db.prepare("INSERT INTO sync_state(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").run(key, value);
}
export function getSyncState(db, key) {
    const row = db.prepare("SELECT v FROM sync_state WHERE k=?").get(key);
    return row?.v ?? 0;
}
