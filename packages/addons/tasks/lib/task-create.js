// 与 task-bulk 的循环引用只在调用期取值，顶层不求值。
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
  tableExists,
  timeMs,
} from "./db.js";
// task-query 循环依赖仅在调用期读取 tasks 的函数/常量。
import { TASK_FILTER_SCHEMA } from "./task-search-schema.js";
import { listTasks } from "./task-query.js";
import { statsReport, renderStats } from "./stats.js";
import { registerTagOptionsAction } from "./tag-options.js";
import { configValues } from "./config.js";
import { clampPriority, priorityForStatus, priorityForCreate } from "./task-priority.js";
import { taskHistory, changelog, csvCell, renderArray, renderList } from "./task-view.js";
import { idList, patchOf, diffRow, applyPatchRow, bulkUpdate, bulkCreate, bulkDelete, renderBulkUpdate, renderBulkCreate, renderBulkDelete } from "./task-bulk.js";
import {
  LEGACY_TYPE_TAGS,
  tagsAvailable,
  normalizeTagIds,
  normalizeTagNames,
  requireTagRows,
  availableTagsText,
  tagIdsByNames,
  ensureTagsByNames,
  replaceTaskTags,
  attachTags,
  tagNavStats,
  tagBreakdown,
  migrateLegacyTypes,
} from "./tagging.js";
import { requireKnownTagNames, TAG_DOMAIN_NOTICE, tagMissingNotices, withNotices, STATUSES, STATUS_NAMES, asCode, sourceCode, putTypeCode, clampDifficulty, dateArg, getTask, defaultTable, requireTable, insertTaskRow, saveTaskRow, outOne, emitChange, writeChange, checkRequiredDates, currentTaskTagIds, resolveTagPatch, PATCH_FIELDS, DIFF_COLUMNS } from "./task-model.js";
// 标题不做唯一性校验：允许与其它任务同名，调用方用 id 区分（与标签名唯一是两条规则）。
export function createTask(db, args, origin, api, opts) {
  const title = String(args.title === undefined || args.title === null ? "" : args.title).trim();
  if (!title) throw new Error("title 不能为空");
  const table = args.tableId === undefined || args.tableId === null || args.tableId === ""
    ? defaultTable(db)
    : requireTable(db, args.tableId);
  const dedupeKey = String(args.dedupeKey === undefined || args.dedupeKey === null ? "" : args.dedupeKey).trim() || null;
  if (dedupeKey) {
    const existing = db.prepare(
      "SELECT * FROM task WHERE dedupe_key=? AND deleted_at IS NULL ORDER BY created_at ASC LIMIT 1",
    ).get(dedupeKey);
    if (existing) {
      const task = outOne(db, existing);
      attachTags(db, api, task);
      return withNotices({ id: String(existing.id), task: task, deduped: true, existing: true }, tagMissingNotices(args, tagsAvailable(db, api)));
    }
  }
  const source = sourceCode(args.source);
  let status = asCode(args.status, STATUS_NAMES, STATUSES, "status");
  if (status === null) status = "0";
  if (status === "3") throw new Error("创建任务时不能直接使用 RESTARTED 状态");
  if (source === "2") status = "0";

  const publishDate = dateArg(args.publishDate, "publishDate") || todayStr();
  const targetDate = dateArg(args.targetDate, "targetDate") || publishDate;
  let doneDate = dateArg(args.doneDate, "doneDate");
  let shutdownDate = dateArg(args.shutdownDate, "shutdownDate");
  let difficulty = clampDifficulty(args.difficulty, null);
  let priority = priorityForCreate(status, args.priority, source);

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
  // 关闭/完成的任务同样清零（见 priorityForStatus）；开启任务缺省 P1，不再有「P0 开启」。
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

  const tagIds = args.tagIds === undefined || args.tagIds === null ? null : normalizeTagIds(args.tagIds);
  // 允许直接传标签名（如 ["工作","紧急"]），缺失的标签按名补建。
  const tagNames = normalizeTagNames(args.tags);
  const tagOn = tagsAvailable(db, api);
  if (tagOn) {
    requireKnownTagNames(db, tagNames);
    if (tagIds) requireTagRows(db, tagIds);
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
    priority,
    difficulty,
    review: String(args.review === undefined || args.review === null ? "" : args.review),
    table_id: String(table.id),
    timeline_key: timelineKey || null,
    restart_key: restartKey || null,
    publish_date: publishDate,
    target_date: targetDate,
    done_date: doneDate,
    shutdown_date: shutdownDate,
    sort: Number.isFinite(Number(args.sort)) ? Math.round(Number(args.sort)) : 0,
    dedupe_key: dedupeKey,
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
        const next = Object.assign({}, old, { status: "1", priority: 0, shutdown_date: todayStr(), updated_at: shutdownTs, rev: Number(old.rev) + 1 });
        saveTaskRow(db, next);
        writeChange(db, next, "update", origin, api, shutdownTs);
      }
      const shutdown = db.prepare(
        "SELECT * FROM task WHERE restart_key=? AND status='1' AND deleted_at IS NULL",
      ).all(restartKey);
      for (const old of shutdown) {
        const next = Object.assign({}, old, { status: "3", priority: 0, updated_at: shutdownTs, rev: Number(old.rev) + 1 });
        saveTaskRow(db, next);
        writeChange(db, next, "update", origin, api, shutdownTs);
      }
    }
    insertTaskRow(db, row);
    if ((tagIds || tagNames.length) && tagOn) {
      const all = (tagIds || []).slice();
      for (const tagId of ensureTagsByNames(db, tagNames, ts, origin)) {
        if (all.indexOf(tagId) < 0) all.push(tagId);
      }
      replaceTaskTags(db, id, all, ts, origin);
    }
    writeChange(db, row, "create", origin, api, ts);
  };
  // skipTx 供 bulkCreate 在外层事务里复用；单条创建仍自己开事务。
  if (opts && opts.skipTx) body();
  else tx(db, body);

  const task = outOne(db, row);
  attachTags(db, api, task);
  return withNotices({ id: id, task: task, deduped: false }, tagMissingNotices(args, tagOn));
}
