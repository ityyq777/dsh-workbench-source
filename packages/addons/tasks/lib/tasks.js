/**
 * 任务 action：纯本地读写。所有方法都不做网络请求。
 *
 * 兼容旧 addon 的 tasks.list/create/update/complete/delete/stats，
 * 同时提供 docs/09 约定的 tasks.* 全量 action。
 */

import {
  now,
  newId,
  idOf,
  todayStr,
  addDays,
  dateText,
  tx,
  logChange,
  taskOut,
  nodeMap,
  pathForTable,
} from "./db.js";

const STATUSES = ["0", "1", "2", "3"];
const TASK_TYPES = ["0", "1", "2", "3"];
const SOURCES = { TASK_TABLE: "0", TASK_TIMELINE: "1", TASK_RESTART: "2" };
const PUT_TYPES = { STATUS: "0", PRIORITY: "1", TITLE: "2", DESCRIPTION: "3" };
const TABS = {
  EMERGENCY: 0, WORK: 1, LIFE: 2, STUDY: 3, DEV: 4,
  SHUTDOWN: 5, ACTIVE: 6, DONE: 7, OVERVIEW: 8,
};
const TYPE_NAMES = { WORK: "0", LIFE: "1", STUDY: "2", DEV: "3" };
const STATUS_NAMES = { ACTIVE: "0", SHUTDOWN: "1", DONE: "2", RESTARTED: "3", open: "0", done: "2" };

function asCode(value, names, allowed, label) {
  if (value === undefined || value === null || value === "") return null;
  let s = String(value);
  if (names && names[s] !== undefined) s = names[s];
  if (allowed.indexOf(s) < 0) throw new Error(label + " 取值非法：" + value);
  return s;
}

function sourceCode(value) {
  if (value === undefined || value === null || value === "") return "0";
  if (SOURCES[String(value)] !== undefined) return SOURCES[String(value)];
  const s = String(value);
  if (["0", "1", "2"].indexOf(s) < 0) throw new Error("source 取值非法：" + value);
  return s;
}

function putTypeCode(value) {
  if (value === undefined || value === null || value === "") return null;
  if (PUT_TYPES[String(value)] !== undefined) return PUT_TYPES[String(value)];
  const s = String(value);
  if (["0", "1", "2", "3"].indexOf(s) < 0) throw new Error("type 取值非法：" + value);
  return s;
}

function tabCode(value) {
  if (value === undefined || value === null || value === "") return 0;
  if (TABS[String(value)] !== undefined) return TABS[String(value)];
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 8) throw new Error("tab 取值非法：" + value);
  return Math.floor(n);
}

function clampPriority(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error("priority 必须是数字");
  const v = Math.round(n);
  if (v < 0 || v > 10) throw new Error("priority 必须在 0..10");
  return v;
}

function clampDifficulty(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error("difficulty 必须是数字");
  if (n < 0 || n > 5) throw new Error("difficulty 必须在 0..5");
  return n;
}

function dateArg(value, label) {
  if (value === undefined || value === null || value === "") return null;
  const d = dateText(value);
  if (!d) throw new Error(label + " 不是有效日期：" + value);
  return d;
}

function getTask(db, id) {
  const key = idOf(id);
  if (!key) return null;
  return db.prepare("SELECT * FROM task WHERE id=? AND deleted_at IS NULL").get(key) || null;
}

function defaultTable(db) {
  const row = db.prepare(
    "SELECT * FROM task_node WHERE type='1' AND deleted_at IS NULL ORDER BY depth ASC, sort ASC LIMIT 1",
  ).get();
  if (!row) throw new Error("还没有任务表，请先在任务树中新建任务表");
  return row;
}

function requireTable(db, tableId) {
  const key = idOf(tableId);
  if (!key) throw new Error("tableId 不能为空");
  const row = db.prepare("SELECT * FROM task_node WHERE id=? AND deleted_at IS NULL").get(key);
  if (!row) throw new Error("任务表不存在：" + key);
  if (String(row.type) !== "1") throw new Error("目标节点不是任务表：" + key);
  return row;
}

function insertTaskRow(db, row) {
  db.prepare(
    "INSERT INTO task(id,title,description,status,type,priority,difficulty,table_id,timeline_key,restart_key,publish_date,target_date,done_date,shutdown_date,created_at,updated_at,deleted_at,rev) " +
      "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
  ).run(
    String(row.id),
    String(row.title),
    String(row.description || ""),
    String(row.status),
    String(row.type),
    Number(row.priority || 0),
    row.difficulty === undefined ? null : row.difficulty,
    String(row.table_id),
    row.timeline_key === undefined ? null : row.timeline_key,
    row.restart_key === undefined ? null : row.restart_key,
    String(row.publish_date),
    String(row.target_date),
    row.done_date === undefined ? null : row.done_date,
    row.shutdown_date === undefined ? null : row.shutdown_date,
    Number(row.created_at),
    Number(row.updated_at),
    row.deleted_at === undefined ? null : row.deleted_at,
    Number(row.rev || 1),
  );
}

function saveTaskRow(db, row) {
  db.prepare(
    "UPDATE task SET title=?,description=?,status=?,type=?,priority=?,difficulty=?,table_id=?,timeline_key=?,restart_key=?,publish_date=?,target_date=?,done_date=?,shutdown_date=?,updated_at=?,deleted_at=?,rev=? WHERE id=?",
  ).run(
    String(row.title),
    String(row.description || ""),
    String(row.status),
    String(row.type),
    Number(row.priority || 0),
    row.difficulty === undefined ? null : row.difficulty,
    String(row.table_id),
    row.timeline_key === undefined ? null : row.timeline_key,
    row.restart_key === undefined ? null : row.restart_key,
    String(row.publish_date),
    String(row.target_date),
    row.done_date === undefined ? null : row.done_date,
    row.shutdown_date === undefined ? null : row.shutdown_date,
    Number(row.updated_at),
    row.deleted_at === undefined ? null : row.deleted_at,
    Number(row.rev || 1),
    String(row.id),
  );
}

function outOne(db, row) {
  return taskOut(row, nodeMap(db));
}

function emitChange(api, id, op, kind) {
  api.emit(kind || "tasks-changed", { id: String(id), op: op });
}

function writeChange(db, row, op, origin, api, ts, kind) {
  logChange(db, "task", row.id, op, op === "delete" ? null : row, origin, ts);
  emitChange(api, row.id, op, kind);
}

function checkRequiredDates(row) {
  if (!row.publish_date) throw new Error("publishDate 不能为空");
  if (!row.target_date) throw new Error("targetDate 不能为空");
  if (row.target_date < row.publish_date) throw new Error("targetDate 不能早于 publishDate");
  if (row.done_date && row.done_date < row.publish_date) throw new Error("doneDate 不能早于 publishDate");
  if (row.shutdown_date && row.shutdown_date < row.publish_date) throw new Error("shutdownDate 不能早于 publishDate");
}

function createTask(db, args, origin, api, opts) {
  const title = String(args.title === undefined || args.title === null ? "" : args.title).trim();
  if (!title) throw new Error("title 不能为空");
  const table = args.tableId === undefined || args.tableId === null || args.tableId === ""
    ? defaultTable(db)
    : requireTable(db, args.tableId);
  const source = sourceCode(args.source);
  let status = asCode(args.status, STATUS_NAMES, STATUSES, "status");
  if (status === null) status = "0";
  if (status === "3") throw new Error("创建任务时不能直接使用 RESTARTED 状态");
  if (source === "2") status = "0";

  const type = asCode(args.type, TYPE_NAMES, TASK_TYPES, "type") || "0";
  const publishDate = dateArg(args.publishDate, "publishDate") || todayStr();
  const targetDate = dateArg(args.targetDate, "targetDate") || publishDate;
  let doneDate = dateArg(args.doneDate, "doneDate");
  let shutdownDate = dateArg(args.shutdownDate, "shutdownDate");
  let difficulty = clampDifficulty(args.difficulty, null);
  let priority = clampPriority(args.priority, 0);

  if (status === "0") {
    if (difficulty !== null) {
      /* ACTIVE 也允许保留难度，兼容直接调用 */
    }
  } else if (status === "2") {
    if (!doneDate) doneDate = todayStr();
    if (difficulty === null) difficulty = 0;
    if (doneDate < publishDate) throw new Error("doneDate 不能早于 publishDate");
  } else if (status === "1") {
    if (!shutdownDate) shutdownDate = todayStr();
    if (shutdownDate < publishDate) throw new Error("shutdownDate 不能早于 publishDate");
  }
  if (targetDate < publishDate) throw new Error("targetDate 不能早于 publishDate");

  let timelineKey = idOf(args.timelineKey);
  let restartKey = idOf(args.restartKey || args.originTaskId);
  if (source === "1") {
    if (!timelineKey) throw new Error("时间线任务必须提供 timelineKey");
  }
  if (source === "2") {
    if (!restartKey) throw new Error("重启任务必须提供 restartKey（原任务 id）");
    const originTask = getTask(db, restartKey);
    if (!originTask) throw new Error("原任务不存在：" + restartKey);
    if (!timelineKey) timelineKey = idOf(originTask.timeline_key) || restartKey;
  }

  const id = newId();
  if (source === "0") {
    timelineKey = id;
    restartKey = id;
  } else if (source === "1") {
    restartKey = id;
  } else {
    restartKey = restartKey;
  }

  const ts = now();
  const row = {
    id,
    title,
    description: String(args.description === undefined || args.description === null ? "" : args.description),
    status,
    type,
    priority,
    difficulty,
    table_id: String(table.id),
    timeline_key: timelineKey || null,
    restart_key: restartKey || null,
    publish_date: publishDate,
    target_date: targetDate,
    done_date: doneDate,
    shutdown_date: shutdownDate,
    created_at: ts,
    updated_at: ts,
    deleted_at: null,
    rev: 1,
  };
  checkRequiredDates(row);

  const body = function () {
    if (source === "2") {
      const active = db.prepare(
        "SELECT * FROM task WHERE restart_key=? AND status='0' AND deleted_at IS NULL",
      ).all(restartKey);
      const shutdownTs = now();
      for (const old of active) {
        const next = Object.assign({}, old, { status: "1", shutdown_date: todayStr(), updated_at: shutdownTs, rev: Number(old.rev) + 1 });
        saveTaskRow(db, next);
        writeChange(db, next, "update", origin, api, shutdownTs);
      }
      const shutdown = db.prepare(
        "SELECT * FROM task WHERE restart_key=? AND status='1' AND deleted_at IS NULL",
      ).all(restartKey);
      for (const old of shutdown) {
        const next = Object.assign({}, old, { status: "3", updated_at: shutdownTs, rev: Number(old.rev) + 1 });
        saveTaskRow(db, next);
        writeChange(db, next, "update", origin, api, shutdownTs);
      }
    }
    insertTaskRow(db, row);
    writeChange(db, row, "create", origin, api, ts);
  };
  // skipTx 供 bulkCreate 在外层事务里复用；单条创建仍自己开事务。
  if (opts && opts.skipTx) body();
  else tx(db, body);

  return { id: id, task: outOne(db, row) };
}

function updateTask(db, args, origin, api) {
  const id = idOf(args.id || args.taskId);
  const cur = getTask(db, id);
  if (!cur) throw new Error("任务不存在：" + (id || "(空)"));
  const ts = now();
  const next = Object.assign({}, cur);
  const type = putTypeCode(args.type);

  if (type === "0") {
    if (args.status === undefined) throw new Error("STATUS 更新缺少 status");
    next.status = asCode(args.status, STATUS_NAMES, STATUSES, "status");
    const date = dateArg(args.date || args.doneDate || args.shutdownDate, "date");
    if (next.status === "2") {
      next.done_date = date || todayStr();
      next.difficulty = clampDifficulty(args.difficulty, cur.difficulty === null ? 0 : Number(cur.difficulty));
      if (next.done_date < String(cur.publish_date)) throw new Error("doneDate 不能早于 publishDate");
    } else if (next.status === "1") {
      next.shutdown_date = date || todayStr();
      if (next.shutdown_date < String(cur.publish_date)) throw new Error("shutdownDate 不能早于 publishDate");
    }
  } else if (type === "1") {
    next.priority = clampPriority(args.priority, Number(cur.priority));
  } else if (type === "2") {
    const title = String(args.title === undefined || args.title === null ? "" : args.title).trim();
    if (!title) throw new Error("title 不能为空");
    next.title = title;
  } else if (type === "3") {
    next.description = String(args.description === undefined || args.description === null ? "" : args.description);
  } else {
    if (args.title !== undefined) {
      const title = String(args.title === null ? "" : args.title).trim();
      if (!title) throw new Error("title 不能为空");
      next.title = title;
    }
    if (args.description !== undefined) next.description = String(args.description === null ? "" : args.description);
    if (args.status !== undefined) next.status = asCode(args.status, STATUS_NAMES, STATUSES, "status");
    if (args.priority !== undefined) next.priority = clampPriority(args.priority, Number(cur.priority));
    if (args.type !== undefined && args.type !== null) next.type = asCode(args.type, TYPE_NAMES, TASK_TYPES, "type");
    if (args.difficulty !== undefined) next.difficulty = clampDifficulty(args.difficulty, null);
    if (args.publishDate !== undefined) next.publish_date = dateArg(args.publishDate, "publishDate") || String(cur.publish_date);
    if (args.targetDate !== undefined) next.target_date = dateArg(args.targetDate, "targetDate") || String(cur.target_date);
    if (args.doneDate !== undefined) next.done_date = dateArg(args.doneDate, "doneDate");
    if (args.shutdownDate !== undefined) next.shutdown_date = dateArg(args.shutdownDate, "shutdownDate");
    if (args.tableId !== undefined) {
      const table = requireTable(db, args.tableId);
      next.table_id = String(table.id);
    }
  }

  if (next.status === "2" && next.done_date === null) next.done_date = todayStr();
  if (next.status === "2" && (next.difficulty === null || next.difficulty === undefined)) next.difficulty = 0;
  if (next.status === "1" && next.shutdown_date === null) next.shutdown_date = todayStr();
  checkRequiredDates(next);
  next.updated_at = ts;
  next.rev = Number(cur.rev) + 1;
  saveTaskRow(db, next);
  writeChange(db, next, "update", origin, api, ts);
  return { task: outOne(db, next) };
}

/** bulk* 系列允许直接写的字段（与 tasks.update 的自由字段一致）。 */
const PATCH_FIELDS = [
  "title", "description", "status", "type", "priority", "difficulty",
  "publishDate", "targetDate", "doneDate", "shutdownDate", "tableId",
];

const DIFF_COLUMNS = [
  ["title", "title"], ["description", "description"], ["status", "status"], ["type", "type"],
  ["priority", "priority"], ["difficulty", "difficulty"], ["tableId", "table_id"],
  ["publishDate", "publish_date"], ["targetDate", "target_date"],
  ["doneDate", "done_date"], ["shutdownDate", "shutdown_date"],
];

function idList(argsIds) {
  const ids = Array.isArray(argsIds) ? argsIds.map(function (x) { return idOf(x); }).filter(Boolean) : [];
  const seen = new Set();
  const out = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

function patchOf(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("patch 必须是对象");
  const patch = {};
  for (const key of Object.keys(raw)) {
    if (PATCH_FIELDS.indexOf(key) >= 0) patch[key] = raw[key];
  }
  const unknown = Object.keys(raw).filter(function (k) { return PATCH_FIELDS.indexOf(k) < 0; });
  if (unknown.length) throw new Error("patch 含不支持的字段：" + unknown.join(", ") + "（可用：" + PATCH_FIELDS.join(", ") + "）");
  if (!Object.keys(patch).length) throw new Error("patch 不能为空");
  return patch;
}

function diffRow(before, after) {
  const out = {};
  for (const pair of DIFF_COLUMNS) {
    const a = before[pair[1]];
    const b = after[pair[1]];
    if (String(a === undefined ? null : a) !== String(b === undefined ? null : b)) {
      out[pair[0]] = { from: a === undefined ? null : a, to: b === undefined ? null : b };
    }
  }
  return out;
}

/**
 * 按 patch 生成下一版任务行（不落库）。
 * 不复用 updateTask：它的 type 参数是“更新模式”，与任务字段 type 冲突。
 */
function applyPatchRow(db, cur, patch, ts) {
  const next = Object.assign({}, cur);
  if ("title" in patch) {
    const title = String(patch.title === null || patch.title === undefined ? "" : patch.title).trim();
    if (!title) throw new Error("title 不能为空");
    next.title = title;
  }
  if ("description" in patch) next.description = String(patch.description === null || patch.description === undefined ? "" : patch.description);
  if ("status" in patch) next.status = asCode(patch.status, STATUS_NAMES, STATUSES, "status");
  if ("type" in patch) next.type = asCode(patch.type, TYPE_NAMES, TASK_TYPES, "type") || String(cur.type);
  if ("priority" in patch) next.priority = clampPriority(patch.priority, Number(cur.priority));
  if ("difficulty" in patch) next.difficulty = clampDifficulty(patch.difficulty, null);
  if ("tableId" in patch) next.table_id = String(requireTable(db, patch.tableId).id);
  if ("publishDate" in patch) next.publish_date = dateArg(patch.publishDate, "publishDate") || String(cur.publish_date);
  if ("targetDate" in patch) next.target_date = dateArg(patch.targetDate, "targetDate") || String(cur.target_date);
  if ("doneDate" in patch) next.done_date = dateArg(patch.doneDate, "doneDate");
  if ("shutdownDate" in patch) next.shutdown_date = dateArg(patch.shutdownDate, "shutdownDate");
  if (next.status === "2" && !next.done_date) next.done_date = todayStr();
  if (next.status === "2" && (next.difficulty === null || next.difficulty === undefined)) next.difficulty = 0;
  if (next.status === "1" && !next.shutdown_date) next.shutdown_date = todayStr();
  checkRequiredDates(next);
  next.updated_at = ts;
  next.rev = Number(cur.rev) + 1;
  return next;
}

function bulkUpdate(db, args, origin, api) {
  const ids = idList(args.ids);
  if (!ids.length) throw new Error("ids 不能为空");
  const patch = patchOf(args.patch);
  const dryRun = args.dryRun === true;
  const skipMissing = args.skipMissing === true;
  const ts = now();
  const changes = [];
  const missing = [];
  const plan = function () {
    for (const id of ids) {
      const cur = getTask(db, id);
      if (!cur) {
        if (skipMissing) {
          missing.push(id);
          continue;
        }
        throw new Error("任务不存在：" + id + "（可用 skipMissing:true 忽略）");
      }
      const next = applyPatchRow(db, cur, patch, ts);
      changes.push({ id: id, changes: diffRow(cur, next) });
      if (!dryRun) {
        saveTaskRow(db, next);
        writeChange(db, next, "update", origin, api, ts);
      }
    }
  };
  if (dryRun) plan();
  else tx(db, plan);
  return {
    dryRun: dryRun,
    updated: dryRun ? 0 : changes.length,
    wouldUpdate: dryRun ? changes.length : undefined,
    changes: changes,
    missing: missing,
  };
}

function bulkCreate(db, args, origin, api) {
  const records = Array.isArray(args.records) ? args.records : [];
  if (!records.length) throw new Error("records 不能为空");
  const dryRun = args.dryRun === true;
  if (dryRun) {
    // 真校验、真 id、但不落库：开事务跑一遍再回滚；用空 emit 避免给 UI 推送假事件。
    const silentApi = { emit: function () {} };
    db.exec("BEGIN IMMEDIATE");
    try {
      const created = records.map(function (rec) {
        return createTask(db, rec || {}, origin, silentApi, { skipTx: true });
      });
      db.exec("ROLLBACK");
      return {
        dryRun: true,
        created: 0,
        wouldCreate: created.length,
        tasks: created.map(function (c) { return c.task; }),
      };
    } catch (e) {
      try {
        db.exec("ROLLBACK");
      } catch {
        /* ignore */
      }
      throw e;
    }
  }
  const created = tx(db, function () {
    return records.map(function (rec) {
      return createTask(db, rec || {}, origin, api, { skipTx: true });
    });
  });
  return {
    dryRun: false,
    created: created.length,
    tasks: created.map(function (c) { return c.task; }),
  };
}

function bulkDelete(db, args, origin, api) {
  const ids = idList(args.ids);
  if (!ids.length) throw new Error("ids 不能为空");
  const dryRun = args.dryRun === true;
  const skipMissing = args.skipMissing === true;
  const ts = now();
  const deleted = [];
  const missing = [];
  const items = [];
  const plan = function () {
    for (const id of ids) {
      const cur = getTask(db, id);
      if (!cur) {
        if (skipMissing) {
          missing.push(id);
          continue;
        }
        throw new Error("任务不存在：" + id + "（可用 skipMissing:true 忽略）");
      }
      deleted.push(id);
      items.push({ id: id, title: String(cur.title || "") });
      if (!dryRun) {
        const next = Object.assign({}, cur, { deleted_at: ts, updated_at: ts, rev: Number(cur.rev) + 1 });
        saveTaskRow(db, next);
        logChange(db, "task", next.id, "delete", null, origin, ts);
        emitChange(api, next.id, "delete");
      }
    }
  };
  if (dryRun) plan();
  else tx(db, plan);
  return {
    dryRun: dryRun,
    deleted: dryRun ? 0 : deleted.length,
    wouldDelete: dryRun ? deleted.length : undefined,
    ids: deleted,
    items: items,
    missing: missing,
  };
}

function renderBulkUpdate(r) {
  const lines = [r.dryRun ? "预览：将更新 " + r.wouldUpdate + " 条任务（未写库）" : "已更新 " + r.updated + " 条任务"];
  for (const c of r.changes) {
    const parts = Object.keys(c.changes).map(function (k) {
      return k + " " + String(c.changes[k].from) + "→" + String(c.changes[k].to);
    });
    lines.push("- " + c.id + (parts.length ? "：" + parts.join("，") : "（无变化）"));
  }
  if (r.missing && r.missing.length) lines.push("跳过不存在的 id：" + r.missing.join(", "));
  return lines.join("\n");
}

function renderBulkCreate(r) {
  const lines = [r.dryRun ? "预览：将创建 " + r.wouldCreate + " 条任务（未写库）" : "已创建 " + r.created + " 条任务"];
  for (const t of r.tasks) lines.push("- " + t.title + "（id=" + t.id + "）");
  return lines.join("\n");
}

function renderBulkDelete(r) {
  const lines = [r.dryRun ? "预览：将删除 " + r.wouldDelete + " 条任务（未写库）" : "已删除 " + r.deleted + " 条任务"];
  for (const it of r.items) lines.push("- " + it.title + "（id=" + it.id + "）");
  if (r.missing && r.missing.length) lines.push("跳过不存在的 id：" + r.missing.join(", "));
  return lines.join("\n");
}

function listTasks(db, args) {
  const tab = tabCode(args.tab);
  const where = ["t.deleted_at IS NULL"];
  const params = [];

  if (args.titleKey !== undefined && String(args.titleKey).trim() !== "") {
    const key = String(args.titleKey).trim().replace(/[\\%_]/g, "\\$&");
    where.push("t.title LIKE ? ESCAPE '\\'");
    params.push("%" + key + "%");
  }

  const tableId = idOf(args.tableId);
  const groupId = idOf(args.groupId);
  if (tableId && tableId !== "0") {
    requireTable(db, tableId);
    where.push("t.table_id=?");
    params.push(tableId);
  } else if (groupId && groupId !== "0") {
    const group = db.prepare("SELECT * FROM task_node WHERE id=? AND deleted_at IS NULL").get(groupId);
    if (!group) throw new Error("任务组不存在：" + groupId);
    const prefix = String(group.path || "") + "%";
    const tables = db.prepare("SELECT id FROM task_node WHERE type='1' AND deleted_at IS NULL AND path LIKE ?").all(prefix);
    if (!tables.length) {
      return { records: [], current: 1, size: 0, total: 0, pageable: false };
    }
    where.push("t.table_id IN (" + tables.map(function () { return "?"; }).join(",") + ")");
    for (const t of tables) params.push(String(t.id));
  }

  const filterRestarted = args.filterRestarted === undefined ? true : Boolean(args.filterRestarted);
  let checkedTypes = Array.isArray(args.checkedTypes) ? args.checkedTypes.map(String) : [];
  if (checkedTypes.length === 0) checkedTypes = TASK_TYPES.slice();
  for (const c of checkedTypes) {
    if (TASK_TYPES.indexOf(c) < 0) throw new Error("checkedTypes 取值非法：" + c);
  }

  // 额外过滤：与 tab/tableId/groupId 条件是 AND 关系。
  if (args.status !== undefined && args.status !== null && args.status !== "") {
    where.push("t.status=?");
    params.push(asCode(args.status, STATUS_NAMES, STATUSES, "status"));
  }
  const priorityMin = clampPriority(args.priorityMin, null);
  if (priorityMin !== null) {
    where.push("t.priority>=?");
    params.push(priorityMin);
  }
  const priorityMax = clampPriority(args.priorityMax, null);
  if (priorityMax !== null) {
    where.push("t.priority<=?");
    params.push(priorityMax);
  }
  const targetFrom = dateArg(args.targetFrom, "targetFrom");
  if (targetFrom) {
    where.push("t.target_date>=?");
    params.push(targetFrom);
  }
  const targetTo = dateArg(args.targetTo, "targetTo");
  if (targetTo) {
    where.push("t.target_date<=?");
    params.push(targetTo);
  }

  if (tab === 0) {
    where.push("(t.priority >= 6 OR t.target_date <= ?)");
    where.push("t.status='0'");
    params.push(addDays(todayStr(), 2));
  } else if (tab >= 1 && tab <= 4) {
    where.push("t.status='0'");
    where.push("t.type=?");
    params.push(String(tab - 1));
  } else if (tab === 5) {
    where.push(filterRestarted ? "t.status='1'" : "t.status='3'");
  } else if (tab === 6) {
    where.push("t.status='0'");
  } else if (tab === 7) {
    where.push("t.status='2'");
  } else if (tab === 8) {
    if (filterRestarted) where.push("t.status!='3'");
  }

  if (tab >= 5) {
    where.push("t.type IN (" + checkedTypes.map(function () { return "?"; }).join(",") + ")");
    for (const c of checkedTypes) params.push(c);
  }

  const pageable = tab > 4 && tab < 9;
  let pageNumber = 1;
  let pageSize = 0;
  let limitSql = "";
  if (pageable) {
    pageNumber = Math.max(1, Math.floor(Number(args.pageNumber) || 1));
    pageSize = Math.max(1, Math.min(200, Math.floor(Number(args.pageSize) || 12)));
    limitSql = " LIMIT ? OFFSET ?";
  } else {
    limitSql = " LIMIT 500";
  }

  const SORTS = {
    priority: "t.priority", target: "t.target_date", publish: "t.publish_date",
    updated: "t.updated_at", created: "t.created_at",
  };
  let order = "";
  if (args.sort !== undefined && args.sort !== null && String(args.sort).trim() !== "") {
    let key = String(args.sort).trim();
    let dir = "ASC";
    if (key.charAt(0) === "-") {
      dir = "DESC";
      key = key.slice(1);
    }
    const col = SORTS[key];
    if (!col) throw new Error("sort 取值非法：" + args.sort + "（可用 priority / target / publish / updated / created，前缀 - 表示降序）");
    if (args.order !== undefined && String(args.order).trim() !== "") {
      const o = String(args.order).trim().toUpperCase();
      if (o !== "ASC" && o !== "DESC") throw new Error("order 只能是 asc 或 desc");
      dir = o;
    }
    order = " ORDER BY " + col + " " + dir + ", t.id " + dir;
  } else {
    order = pageable
      ? " ORDER BY t.publish_date DESC, t.id DESC"
      : " ORDER BY t.priority DESC, t.target_date ASC, t.publish_date DESC, t.id ASC";
  }
  const base = " FROM task t WHERE " + where.join(" AND ");
  const total = db.prepare("SELECT COUNT(*) AS n" + base).get(...params).n;
  const queryParams = params.slice();
  if (pageable) {
    queryParams.push(pageSize, (pageNumber - 1) * pageSize);
  }
  const rows = db.prepare("SELECT t.*" + base + order + limitSql).all(...queryParams);
  const map = nodeMap(db);
  const records = rows.map(function (r) {
    return taskOut(r, map);
  });
  return {
    records,
    current: pageable ? pageNumber : 1,
    size: records.length,
    total: pageable ? total : records.length,
    pageable,
  };
}

function selectedTasks(db, args) {
  const ids = Array.isArray(args.ids) ? args.ids.map(String) : [];
  if (!ids.length) return [];
  const marks = ids.map(function () { return "?"; }).join(",");
  const rows = db.prepare("SELECT * FROM task WHERE deleted_at IS NULL AND id IN (" + marks + ")").all(...ids);
  const map = nodeMap(db);
  return rows.map(function (r) { return taskOut(r, map); });
}

function timelineTasks(db, args) {
  const key = idOf(args.timelineKey);
  if (!key) return [];
  const rows = db.prepare("SELECT * FROM task WHERE timeline_key=? AND status!='3' AND deleted_at IS NULL ORDER BY publish_date ASC, id ASC").all(key);
  const map = nodeMap(db);
  return rows.map(function (r) { return taskOut(r, map); });
}

function restartTasks(db, args) {
  const key = idOf(args.restartKey);
  if (!key) return [];
  const rows = db.prepare("SELECT * FROM task WHERE restart_key=? AND deleted_at IS NULL ORDER BY publish_date ASC, id ASC").all(key);
  const map = nodeMap(db);
  return rows.map(function (r) { return taskOut(r, map); });
}

function timelineRefactor(db, args, origin, api) {
  const ids = Array.isArray(args.ids) ? args.ids.map(String) : [];
  const key = idOf(args.timelineKey);
  if (!ids.length) throw new Error("ids 不能为空");
  if (!key) throw new Error("timelineKey 不能为空");
  const dryRun = args.dryRun === true;
  const ts = now();
  const changed = [];
  const plan = function () {
    for (const id of ids) {
      const cur = getTask(db, id);
      if (!cur) throw new Error("任务不存在：" + id);
      changed.push(id);
      if (dryRun) continue;
      const next = Object.assign({}, cur, { timeline_key: key, updated_at: ts, rev: Number(cur.rev) + 1 });
      saveTaskRow(db, next);
      writeChange(db, next, "update", origin, api, ts);
    }
  };
  if (dryRun) plan();
  else tx(db, plan);
  return dryRun
    ? { dryRun: true, updated: 0, wouldUpdate: changed.length, ids: changed, timelineKey: key }
    : { updated: changed.length, ids: changed, timelineKey: key };
}

function migrateTasks(db, args, origin, api) {
  const ids = Array.isArray(args.ids) ? args.ids.map(String) : [];
  if (!ids.length) throw new Error("ids 不能为空");
  const table = requireTable(db, args.tableId);
  const dryRun = args.dryRun === true;
  const ts = now();
  const changed = [];
  const plan = function () {
    for (const id of ids) {
      const cur = getTask(db, id);
      if (!cur) throw new Error("任务不存在：" + id);
      changed.push(id);
      if (dryRun) continue;
      const next = Object.assign({}, cur, { table_id: String(table.id), updated_at: ts, rev: Number(cur.rev) + 1 });
      saveTaskRow(db, next);
      writeChange(db, next, "update", origin, api, ts);
    }
  };
  if (dryRun) plan();
  else tx(db, plan);
  return dryRun
    ? { dryRun: true, updated: 0, wouldUpdate: changed.length, ids: changed, tableId: String(table.id) }
    : { updated: changed.length, ids: changed, tableId: String(table.id) };
}

function sweepShutdown(db, args, origin, api) {
  const day = dateArg(args.date, "date") || todayStr();
  const rows = db.prepare(
    "SELECT * FROM task WHERE status='0' AND target_date<=? AND deleted_at IS NULL",
  ).all(day);
  const dryRun = args.dryRun === true;
  const ts = now();
  const ids = [];
  const items = rows.map(function (cur) {
    return { id: String(cur.id), title: String(cur.title || ""), targetDate: cur.target_date || null };
  });
  if (dryRun) return { dryRun: true, updated: 0, wouldUpdate: rows.length, ids: rows.map(function (r) { return String(r.id); }), items: items, date: day };
  tx(db, function () {
    for (const cur of rows) {
      const next = Object.assign({}, cur, { status: "1", shutdown_date: day, updated_at: ts, rev: Number(cur.rev) + 1 });
      saveTaskRow(db, next);
      writeChange(db, next, "update", origin, api, ts);
      ids.push(String(cur.id));
    }
  });
  return { updated: ids.length, ids: ids, items: items, date: day };
}

function stats(db) {
  const day = todayStr();
  const row = db.prepare(
    "SELECT " +
      "SUM(CASE WHEN status='0' AND deleted_at IS NULL THEN 1 ELSE 0 END) AS active, " +
      "SUM(CASE WHEN status='1' AND deleted_at IS NULL THEN 1 ELSE 0 END) AS shutdown, " +
      "SUM(CASE WHEN status='2' AND deleted_at IS NULL THEN 1 ELSE 0 END) AS done, " +
      "SUM(CASE WHEN status='3' AND deleted_at IS NULL THEN 1 ELSE 0 END) AS restarted, " +
      "SUM(CASE WHEN status='0' AND deleted_at IS NULL AND target_date<? THEN 1 ELSE 0 END) AS overdue, " +
      "SUM(CASE WHEN status='0' AND deleted_at IS NULL AND target_date=? THEN 1 ELSE 0 END) AS today " +
      "FROM task",
  ).get(day, day);
  return {
    open: row.active || 0,
    active: row.active || 0,
    shutdown: row.shutdown || 0,
    done: row.done || 0,
    restarted: row.restarted || 0,
    overdue: row.overdue || 0,
    today: row.today || 0,
  };
}

function removeTask(db, args, origin, api) {
  const cur = getTask(db, args.id || args.taskId);
  if (!cur) throw new Error("任务不存在：" + (args.id || args.taskId));
  const ts = now();
  const next = Object.assign({}, cur, { deleted_at: ts, updated_at: ts, rev: Number(cur.rev) + 1 });
  saveTaskRow(db, next);
  logChange(db, "task", next.id, "delete", null, origin, ts);
  emitChange(api, next.id, "delete");
  return { ok: true, id: String(next.id) };
}

function completeTask(db, args, origin, api) {
  return updateTask(db, {
    id: args.id || args.taskId,
    type: "STATUS",
    status: "2",
    date: args.date || todayStr(),
    difficulty: args.difficulty === undefined ? 0 : args.difficulty,
  }, origin, api);
}

function renderArray(rows) {
  const list = Array.isArray(rows) ? rows : [];
  return renderList({ records: list, total: list.length });
}

function renderList(result) {
  const lines = ["任务 " + result.records.length + " 条（total " + result.total + "）"];
  for (const t of result.records) {
    const mark = t.status === "2" ? "[x]" : t.status === "1" ? "[-]" : t.status === "3" ? "[~]" : "[ ]";
    const path = (t.path || []).map(function (p) { return p.name; }).join(" / ");
    lines.push("- " + mark + " " + t.title + "（P" + t.priority + "，target " + (t.targetDate || "-") + "，id=" + t.id + (path ? "，" + path : "") + "）");
  }
  return lines.join("\n");
}

export function registerTaskActions(api) {
  const db = api.db;
  const action = api.action;

  function getTaskAction(args) {
    const id = idOf(args.id || args.taskId);
    if (!id) throw new Error("缺少 id");
    const cur = getTask(db, id);
    if (!cur) throw new Error("任务不存在：" + id);
    return { task: outOne(db, cur) };
  }

  const PATCH_SCHEMA = {
    type: "object",
    description: "要写入的字段；未列出的字段会被拒绝",
    properties: {
      title: { type: "string" },
      description: { type: "string" },
      status: { type: ["string", "number"], description: "0/ACTIVE、1/SHUTDOWN、2/DONE、3/RESTARTED；也接受 open/done" },
      type: { type: ["string", "number"], description: "任务类型 0 工作 / 1 生活 / 2 学习 / 3 开发" },
      priority: { type: "number", description: "0..10" },
      difficulty: { type: ["number", "null"], description: "0..5" },
      publishDate: { type: "string", description: "YYYY-MM-DD" },
      targetDate: { type: "string", description: "YYYY-MM-DD" },
      doneDate: { type: ["string", "null"], description: "YYYY-MM-DD" },
      shutdownDate: { type: ["string", "null"], description: "YYYY-MM-DD" },
      tableId: { type: ["string", "number"], description: "目标任务表 id" },
    },
    additionalProperties: false,
  };

  action("tasks.list", {
    description: "按 tab/任务表/任务组/标题/状态/优先级/目标日期筛选任务；sort 支持 priority/target/publish/updated/created（前缀 - 降序）",
    input: {
      type: "object",
      properties: {
        tab: { type: ["number", "string"], description: "0 紧急 / 1 工作 / 2 生活 / 3 学习 / 4 开发 / 5 已关闭 / 6 进行中 / 7 已完成 / 8 总览（默认 0）" },
        titleKey: { type: "string", description: "标题模糊匹配" },
        tableId: { type: ["string", "number", "null"], description: "只看某个任务表" },
        groupId: { type: ["string", "number", "null"], description: "只看某个任务组下的所有任务表" },
        pageNumber: { type: "number", description: "tab 5..8 分页页码，从 1 开始" },
        pageSize: { type: "number", description: "tab 5..8 每页条数（默认 12，最大 200）" },
        filterRestarted: { type: "boolean", description: "已关闭 tab 默认 true：true 看 SHUTDOWN，false 看 RESTARTED" },
        checkedTypes: { type: "array", items: { type: "string" }, description: "任务类型过滤（0..3）" },
        status: { type: ["string", "number"], description: "直接按状态过滤（与 tab 条件 AND）" },
        priorityMin: { type: "number", description: "最低优先级（含）" },
        priorityMax: { type: "number", description: "最高优先级（含）" },
        targetFrom: { type: "string", description: "targetDate >= 该日期" },
        targetTo: { type: "string", description: "targetDate <= 该日期" },
        sort: { type: "string", description: "priority / target / publish / updated / created；前缀 - 表示降序" },
        order: { type: "string", enum: ["asc", "desc"], description: "配合 sort 指定方向" },
      },
    },
    examples: [{ tab: 8, priorityMin: 6, sort: "-priority", pageSize: 50 }],
    execute: function (args) { return listTasks(db, args || {}); },
    render: renderList,
  });

  action("tasks.get", {
    description: "按 id 取单个任务（含任务树路径）",
    input: {
      type: "object",
      properties: {
        id: { type: "string", description: "任务 id" },
        taskId: { type: ["string", "number"], description: "id 的别名" },
      },
    },
    examples: [{ id: "1001" }],
    execute: function (args) { return getTaskAction(args || {}); },
    render: function (r) { return "任务：" + r.task.title + "（id=" + r.task.id + "，status=" + r.task.status + "，P" + r.task.priority + "）"; },
  });

  action("tasks.create", {
    description: "创建任务；source=0 普通任务，1 时间线任务，2 重启任务。date 字段均为 YYYY-MM-DD",
    input: {
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        tableId: { type: ["string", "number"], description: "任务表 id，缺省用默认任务表" },
        type: { type: ["string", "number"], description: "0 工作 / 1 生活 / 2 学习 / 3 开发" },
        status: { type: ["string", "number"], description: "0/1/2（不能直接创建 RESTARTED）" },
        priority: { type: "number", description: "0..10" },
        difficulty: { type: ["number", "null"], description: "0..5" },
        publishDate: { type: "string", description: "YYYY-MM-DD，缺省今天" },
        targetDate: { type: "string", description: "YYYY-MM-DD，缺省同 publishDate" },
        doneDate: { type: "string" },
        shutdownDate: { type: "string" },
        source: { type: ["string", "number"], description: "0 普通 / 1 时间线 / 2 重启" },
        timelineKey: { type: ["string", "number"], description: "source=1 必填" },
        restartKey: { type: ["string", "number"], description: "source=2 必填：原任务 id" },
        originTaskId: { type: ["string", "number"], description: "restartKey 的别名" },
      },
    },
    examples: [{ title: "整理发布清单", priority: 7, targetDate: "2026-11-10" }],
    execute: function (args, ctx) { return createTask(db, args || {}, ctx.origin, api); },
    render: function (r) { return "已创建任务：" + r.task.title + "（id=" + r.id + "）"; },
  });

  action("tasks.update", {
    description: "更新单个任务。两种用法：①type 作为更新模式（0 状态/1 优先级/2 标题/3 描述）；②省略 type 直接传字段。批量请用 tasks.bulkUpdate",
    input: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        taskId: { type: ["string", "number"] },
        type: { type: ["string", "number"], description: "更新模式 0/1/2/3（不是任务类型；要改任务类型请省略 type 传字段或改完再更新）" },
        status: { type: ["string", "number"] },
        date: { type: "string" },
        priority: { type: "number" },
        title: { type: "string" },
        description: { type: "string" },
        difficulty: { type: ["number", "null"] },
        publishDate: { type: "string" },
        targetDate: { type: "string" },
        doneDate: { type: "string" },
        shutdownDate: { type: "string" },
        tableId: { type: ["string", "number"] },
      },
    },
    examples: [{ id: "1001", status: "done" }],
    execute: function (args, ctx) { return updateTask(db, args || {}, ctx.origin, api); },
    render: function (r) { return "已更新任务：" + r.task.title + "（id=" + r.task.id + "）"; },
  });

  action("tasks.bulkUpdate", {
    description: "按 id 批量更新任务（同一 patch）；dryRun:true 只返回将变更的预览，不写库",
    input: {
      type: "object",
      required: ["ids", "patch"],
      properties: {
        ids: { type: "array", items: { type: "string" }, description: "任务 id 列表" },
        patch: PATCH_SCHEMA,
        dryRun: { type: "boolean", description: "true 时只预览，不写库、不发事件" },
        skipMissing: { type: "boolean", description: "true 时忽略不存在的 id（默认报错）" },
      },
    },
    examples: [
      { ids: ["1001", "1002"], patch: { status: "done", priority: 6 }, dryRun: true },
      { ids: ["1001", "1002"], patch: { targetDate: "2026-11-15" } },
    ],
    execute: function (args, ctx) { return bulkUpdate(db, args || {}, ctx.origin, api); },
    render: renderBulkUpdate,
  });

  action("tasks.bulkCreate", {
    description: "一次创建多条任务（单事务，全成或全不成）；dryRun:true 只校验预览，不写库",
    input: {
      type: "object",
      required: ["records"],
      properties: {
        records: {
          type: "array",
          description: "每条字段同 tasks.create",
          items: { type: "object", additionalProperties: true },
        },
        dryRun: { type: "boolean", description: "true 时只校验预览，不写库、不发事件" },
      },
    },
    examples: [
      { records: [{ title: "任务 A", priority: 6 }, { title: "任务 B", targetDate: "2026-11-12" }], dryRun: true },
    ],
    execute: function (args, ctx) { return bulkCreate(db, args || {}, ctx.origin, api); },
    render: renderBulkCreate,
  });

  action("tasks.bulkDelete", {
    description: "按 id 批量软删除任务（保留同步墓碑）；dryRun:true 只返回将删除的清单",
    input: {
      type: "object",
      properties: {
        ids: { type: "array", items: { type: "string" }, description: "任务 id 列表" },
        dryRun: { type: "boolean", description: "true 时只预览，不写库" },
        skipMissing: { type: "boolean", description: "true 时忽略不存在的 id（默认报错）" },
      },
      required: ["ids"],
    },
    examples: [{ ids: ["1001", "1002"], dryRun: true }],
    execute: function (args, ctx) { return bulkDelete(db, args || {}, ctx.origin, api); },
    render: renderBulkDelete,
  });

  action("tasks.selected", {
    description: "按 id 列表批量取任务",
    input: { type: "object", properties: { ids: { type: "array", items: { type: "string" } } } },
    execute: function (args) { return selectedTasks(db, args || {}); },
    render: function (rows) { return "选中任务 " + rows.length + " 条"; },
  });

  action("tasks.timeline", {
    description: "取某条时间线上的任务",
    input: { type: "object", properties: { timelineKey: { type: ["string", "number"] } } },
    execute: function (args) { return timelineTasks(db, args || {}); },
    render: renderArray,
  });

  action("tasks.restart", {
    description: "取某条重启链上的任务",
    input: { type: "object", properties: { restartKey: { type: ["string", "number"] } } },
    execute: function (args) { return restartTasks(db, args || {}); },
    render: renderArray,
  });

  action("tasks.timelineRefactor", {
    description: "把一批任务归并到同一条时间线；dryRun:true 只返回将影响的 id",
    input: {
      type: "object",
      properties: {
        ids: { type: "array", items: { type: "string" } },
        timelineKey: { type: ["string", "number"] },
        dryRun: { type: "boolean" },
      },
    },
    execute: function (args, ctx) { return timelineRefactor(db, args || {}, ctx.origin, api); },
    render: function (r) {
      return r.dryRun ? "预览：将归并 " + r.wouldUpdate + " 条任务到时间线 " + r.timelineKey : "已归并 " + r.updated + " 条任务到时间线 " + r.timelineKey;
    },
  });

  action("tasks.migrate", {
    description: "把一批任务迁移到另一个任务表；dryRun:true 只返回将影响的 id",
    input: {
      type: "object",
      properties: {
        ids: { type: "array", items: { type: "string" } },
        tableId: { type: ["string", "number"] },
        dryRun: { type: "boolean" },
      },
    },
    execute: function (args, ctx) { return migrateTasks(db, args || {}, ctx.origin, api); },
    render: function (r) {
      return r.dryRun ? "预览：将迁移 " + r.wouldUpdate + " 条任务到任务表 " + r.tableId : "已迁移 " + r.updated + " 条任务到任务表 " + r.tableId;
    },
  });

  action("tasks.sweepShutdown", {
    description: "把 targetDate 已过的 ACTIVE 任务批量关闭（默认今天）；dryRun:true 先看会影响哪些任务",
    input: {
      type: "object",
      properties: {
        date: { type: "string", description: "截止日期 YYYY-MM-DD，默认今天" },
        dryRun: { type: "boolean", description: "true 时只返回将关闭的任务清单" },
      },
    },
    examples: [{ dryRun: true }, { date: "2026-11-07" }],
    execute: function (args, ctx) { return sweepShutdown(db, args || {}, ctx.origin, api); },
    render: function (r) {
      if (r.dryRun) {
        const lines = ["预览：将关闭 " + r.wouldUpdate + " 条到期任务（" + r.date + "）"];
        for (const it of r.items) lines.push("- " + it.title + "（target " + it.targetDate + "，id=" + it.id + "）");
        return lines.join("\n");
      }
      return "已关闭 " + r.updated + " 条到期任务（" + r.date + "）";
    },
  });

  action("tasks.stats", {
    description: "任务统计：进行中 / 已关闭 / 已完成 / 已重启 / 逾期 / 今天到期",
    input: { type: "object", properties: {} },
    execute: function () { return stats(db); },
    render: function (s) { return "进行中 " + s.active + " / 已关闭 " + s.shutdown + " / 已完成 " + s.done + " / 已重启 " + s.restarted + " / 逾期 " + s.overdue; },
  });

  action("tasks.delete", {
    description: "软删除单个任务（保留同步墓碑）；批量请用 tasks.bulkDelete",
    input: { type: "object", properties: { id: { type: "string" } } },
    execute: function (args, ctx) { return removeTask(db, args || {}, ctx.origin, api); },
    render: function (r) { return "已删除任务：" + r.id; },
  });

  action("tasks.complete", {
    description: "把任务标记为完成（兼容旧 action）",
    input: { type: "object", properties: { id: { type: "string" }, difficulty: { type: "number" } } },
    execute: function (args, ctx) { return completeTask(db, args || {}, ctx.origin, api); },
    render: function (r) { return "已完成任务：" + r.task.title; },
  });
}
