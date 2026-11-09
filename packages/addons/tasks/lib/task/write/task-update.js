// 与 task-bulk 的循环引用只在调用期取值，顶层不求值。
import {
  now,
  idOf,
  todayStr,
} from "../../db/db.js";
// task-query 循环依赖仅在调用期读取 tasks 的函数/常量。
import { priorityForStatus } from "../model/task-priority.js";
import {
  tagsAvailable,
  replaceTaskTags,
  attachTags,
} from "../../tagging/tagging.js";
import { tagMissingNotices, withNotices, STATUSES, STATUS_NAMES, asCode, putTypeCode, clampDifficulty, dateArg, getTask, requireTable, saveTaskRow, outOne, writeChange, checkRequiredDates, resolveTagPatch } from "../model/task-model.js";
import { taskTransaction } from './task-transaction.js';
import { ownershipFields } from '../model/task-ownership-path.js';
export function updateTask(db, args, origin, api, opts) {
  if (!opts?.skipTx) return taskTransaction(db, api, buffered => updateTask(db,args,origin,buffered,{skipTx:true}));
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
      if (args.review !== undefined) next.review = String(args.review === null ? "" : args.review);
      if (next.done_date < String(cur.publish_date)) throw new Error("doneDate 不能早于 publishDate");
    } else if (next.status === "1") {
      next.shutdown_date = date || todayStr();
      if (next.shutdown_date < String(cur.publish_date)) throw new Error("shutdownDate 不能早于 publishDate");
    }
  } else if (type === "1") {
    next.priority = priorityForStatus(next.status, args.priority, Number(cur.priority) || 1);
  } else if (type === "2") {
    const title = String(args.title === undefined || args.title === null ? "" : args.title).trim();
    if (!title) throw new Error("title 不能为空");
    next.title = title;
  } else if (type === "3") {
    next.description = String(args.description === undefined || args.description === null ? "" : args.description);
  } else if (type === "4") {
    next.review = String(args.review === undefined || args.review === null ? "" : args.review);
  } else {
    if (args.title !== undefined) {
      const title = String(args.title === null ? "" : args.title).trim();
      if (!title) throw new Error("title 不能为空");
      next.title = title;
    }
    if (args.description !== undefined) next.description = String(args.description === null ? "" : args.description);
    if (args.review !== undefined) next.review = String(args.review === null ? "" : args.review);
    if (args.status !== undefined) next.status = asCode(args.status, STATUS_NAMES, STATUSES, "status");
    if (args.priority !== undefined) next.priority = priorityForStatus(next.status, args.priority, Number(cur.priority) || 1);
    if (args.difficulty !== undefined) next.difficulty = clampDifficulty(args.difficulty, null);
    if (args.publishDate !== undefined) next.publish_date = dateArg(args.publishDate, "publishDate") || String(cur.publish_date);
    if (args.targetDate !== undefined) next.target_date = dateArg(args.targetDate, "targetDate") || String(cur.target_date);
    if (args.doneDate !== undefined) next.done_date = dateArg(args.doneDate, "doneDate");
    if (args.shutdownDate !== undefined) next.shutdown_date = dateArg(args.shutdownDate, "shutdownDate");
    if (args.tableId !== undefined) {
      const table = requireTable(db, args.tableId);
      next.table_id = String(table.id);
    }
    if (args.sort !== undefined) {
      const sort = Number(args.sort);
      if (!Number.isFinite(sort)) throw new Error("sort 必须是数字");
      next.sort = Math.round(sort);
    }
  }

  if (next.status === "2" && next.done_date === null) next.done_date = todayStr();
  if (next.status === "2" && (next.difficulty === null || next.difficulty === undefined)) next.difficulty = 0;
  // 优先级不变量兜底：非开启状态一律 P0；开启状态不允许 P0（历史数据回落到 P1）。
  if (next.status !== "0") next.priority = 0;
  else if (!next.priority) next.priority = 1;
  if (next.status === "1" && next.shutdown_date === null) next.shutdown_date = todayStr();
  checkRequiredDates(next);
  next.updated_at = ts;
  next.rev = Number(cur.rev) + 1;
  const wantsTagWrite = args.tagIds !== undefined || args.tags !== undefined
    || args.addTagIds !== undefined || args.addTags !== undefined
    || args.removeTagIds !== undefined || args.removeTags !== undefined;
  const tagWritable = tagsAvailable(db, api);
  const desiredTags = wantsTagWrite && tagWritable ? resolveTagPatch(db, next, args, ts, origin, false) : null;
  saveTaskRow(db, next);
  if (desiredTags) replaceTaskTags(db, String(next.id), desiredTags, ts, origin);
  writeChange(db, next, "update", origin, api, ts);
  const task = outOne(db, next);
  attachTags(db, api, task);
  return withNotices({ task: task, ...ownershipFields(task) }, tagMissingNotices(args, tagWritable));
}
