import { registerEntityTimelineActions, TIMELINE_ID_SCHEMA, TIMELINE_ID_REQUIRED } from "./timeline/timeline-actions.js";
import { DIFFICULTY_SCHEMA, DIFFICULTY_GUIDANCE } from "./task/model/task-difficulty.js";
import { TODAY_STATS_DESCRIPTION } from "./stats/stats-today.js";
import { TASK_CREATE_SCHEMA } from './task/write/task-create-schema.js';
import { registerDiscoveryActions, GUIDANCE } from './task/read/task-discovery.js';
import { renderOwnership } from './task/model/task-ownership-path.js';
/**
 * 任务 action：纯本地读写。所有方法都不做网络请求。
 *
 * 兼容旧 addon 的 tasks.list/create/update/complete/delete/stats，
 * 同时提供 docs/09 约定的 tasks.* 全量 action。
 */

import {
  idOf,
} from "./db/db.js";
// task-query 循环依赖仅在调用期读取 tasks 的函数/常量。
import { TASK_FILTER_SCHEMA } from "./task/read/task-search-schema.js";
import { listTasks } from "./task/read/task-query.js";
import { statsReport, renderStats } from "./stats/stats.js";
import { registerTagOptionsAction } from "./tagging/tag-options.js";
import { taskHistory, changelog, renderArray, renderList } from "./task/read/task-view.js";
import { bulkUpdate, bulkCreate, bulkDelete, renderBulkUpdate, renderBulkCreate, renderBulkDelete } from "./task/write/task-bulk.js";
import {
  attachTags,
  tagNavStats,
  migrateLegacyTypes,
} from "./tagging/tagging.js";
import { getTask, outOne } from "./task/model/task-model.js";
import { createTask } from "./task/write/task-create.js";
import { registerTimelineActions, TIMELINE_PAGE_SCHEMA } from "./timeline/task-timelines.js";
import { updateTask } from "./task/write/task-update.js";
import { selectedTasks, timelineTasks, restartTasks, timelineRefactor, migrateTasks, sweepShutdown, stats, removeTask, completeTask, exportTasks, reorderTasks, taskDeps, taskLink, taskUnlink } from "./task/write/task-operations.js";
export { tagMissingNotices, withNotices, STATUSES, STATUS_NAMES, asCode, clampDifficulty, dateArg, getTask, requireTable, saveTaskRow, emitChange, writeChange, checkRequiredDates, currentTaskTagIds, resolveTagPatch, PATCH_FIELDS, DIFF_COLUMNS } from "./task/model/task-model.js";
export { priorityForStatus } from "./task/model/task-priority.js";
export { createTask } from "./task/write/task-create.js";
export function registerTaskActions(api) {
  registerDiscoveryActions(api);
  registerTimelineActions(api);
  registerEntityTimelineActions(api);
  const db = api.db;
  const action = api.action;

  function getTaskAction(args) {
    const id = idOf(args.id || args.taskId);
    if (!id) throw new Error("缺少 id");
    const cur = getTask(db, id);
    if (!cur) throw new Error("任务不存在：" + id);
    const task = outOne(db, cur);
    attachTags(db, api, task);
    return { task: task };
  }

  const PATCH_SCHEMA = {
    type: "object",
    description: "要写入的字段；未列出的字段会被拒绝",
    properties: {
      title: { type: "string" },
      description: { type: "string" },
      review: { type: "string", description: "完成后的感受/复盘（自由文本）" },
      status: { type: ["string", "number"], description: "0=进行中(ACTIVE，也接受 open)、1=已关闭(SHUTDOWN)、2=已完成(DONE，也接受 done)、3=已重启(RESTARTED，创建时不允许)；改成 2 时 priority 自动清零并补 doneDate" },
      priority: { type: "number", description: "1..10 整数，数值越大越紧急（>=6 进「紧急」页签）；已开启任务传 0 会报错；任务改为 SHUTDOWN/DONE 时写入值被忽略并清零" },
      difficulty: DIFFICULTY_SCHEMA,
      publishDate: { type: "string", description: "YYYY-MM-DD" },
      targetDate: { type: "string", description: "YYYY-MM-DD" },
      doneDate: { type: ["string", "null"], description: "YYYY-MM-DD" },
      shutdownDate: { type: ["string", "null"], description: "YYYY-MM-DD" },
      tableId: { type: ["string", "number"], description: "目标任务表 id" },
      sort: { type: "number", description: "手动排序值（配合 tasks.reorder）" },
      tagIds: { type: "array", items: { type: "string" }, description: "用这批标签 id 整体替换当前标签（需要标签域）；id 不存在报错并列出可用标签" },
      tags: { type: "array", items: { type: "string" }, description: "按标签名整体替换；默认自动创建未知名字，form.autoCreateTags=false 时报错并列出可用标签" },
      addTags: { type: "array", items: { type: "string" }, description: "增量添加标签（按名字，未知名字受 form.autoCreateTags 控制），保留各任务原有标签" },
      removeTags: { type: "array", items: { type: "string" }, description: "增量移除标签（按名字），其余标签保留" },
      addTagIds: { type: "array", items: { type: "string" }, description: "增量添加标签 id" },
      removeTagIds: { type: "array", items: { type: "string" }, description: "增量移除标签 id" },
    },
    additionalProperties: false,
  };

  action("tasks.list", {
    description: "统一检索任务：tab（缺省=总览 8 全量，不是紧急 0）/任务表/任务组/关键词（标题、描述、感受）/状态/标签/优先级/目标日期，全部 AND；sort 支持 priority/target/publish/updated/created/manual（前缀 - 表示降序，例如 sort=-priority 是数值越大越紧急的在前）；不传 sort 时未分页按 priority 降序、分页时按 publishDate 降序；返回里带 filter 回显实际生效条件与排序；分页语义：total=筛选后真实总数、returned=本次返回条数、truncated=是否被截断，pageSize 上限 200（超出回显 filter.pageSizeCapped）",
    input: {
      type: "object",
      properties: {
        ...TASK_FILTER_SCHEMA,
        pageNumber: { type: "number", description: "分页页码，从 1 开始；任意 tab 传了即分页（tab 5..8 默认分页）" },
        pageSize: { type: "number", description: "每页条数（默认 12，最大 200）；任意 tab 传了即分页" },
      },
    },
    examples: [{ tab: 8, priorityMin: 6, sort: "-priority", pageSize: 50 }, { tagIds: ["3"], status: "open" }],
    execute: function (args) { return listTasks(db, args || {}, api); },
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
    description: "创建任务必须显式 tableId 或 tablePath（恰好一个），无目标报 TABLE_REQUIRED 且零写入。先 tasks.capabilities/resolveTable 核对职责、完整路径与描述；拿不准询问用户；仅获授权才createMissing+pathDescriptions。source=0 普通任务，1 时间线任务，2 重启任务。date 字段均为 YYYY-MM-DD；重启需优先级 >0（1–10，缺省 1）；关闭/完成自动清零" + GUIDANCE.join(" "),
    input: TASK_CREATE_SCHEMA,
    examples: [{ title: "整理发布清单", tableId: "已核对的任务表id", priority: 7, difficulty: 2, targetDate: "2026-11-10" }],
    execute: function (args, ctx) { return createTask(db, args || {}, ctx.origin, api); },
    render: renderOwnership,
  });

  action("tasks.update", {
    description: "更新单个任务。两种用法：①type 是「更新模式」而不是任务类型（0 状态 / 1 优先级 / 2 标题 / 3 描述 / 4 感受），只有该模式对应的字段生效，其余参数被忽略；②省略 type 直接传字段（含 tags 标签名，tags/tagIds 为整体替换）。批量请用 tasks.bulkUpdate。" + DIFFICULTY_GUIDANCE,
    input: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        taskId: { type: ["string", "number"] },
        type: { type: ["string", "number"], description: "更新模式 0/1/2/3/4（4=感受；不是任务字段；改标签请传 tags 或 tagIds）" },
        status: { type: ["string", "number"], description: "0/ACTIVE、1/SHUTDOWN、2/DONE（改成 DONE 时 priority 自动清零）" },
        date: { type: "string" },
        priority: { type: "number", description: "1..10；目标状态为 1/2 时写入被忽略（恒为 0）；目标状态为 0 时传 0 报错" },
        title: { type: "string" },
        description: { type: "string" },
        review: { type: "string", description: "完成后的感受/复盘（自由文本）；给出时按字段更新，或配合 type=4" },
        difficulty: DIFFICULTY_SCHEMA,
        publishDate: { type: "string" },
        targetDate: { type: "string" },
        doneDate: { type: "string" },
        shutdownDate: { type: "string" },
        tableId: { type: ["string", "number"] },
        sort: { type: "number" },
        tagIds: { type: "array", items: { type: "string" }, description: "用这批标签 id 整体替换当前标签；id 不存在报错并列出可用标签" },
        tags: { type: "array", items: { type: "string" }, description: "按标签名整体替换；默认自动创建未知名字，form.autoCreateTags=false 时报错并列出可用标签" },
        addTags: { type: "array", items: { type: "string" }, description: "增量添加标签名（保留原有标签）；未知名字同样受 form.autoCreateTags 控制" },
        removeTags: { type: "array", items: { type: "string" }, description: "增量移除标签名（保留其他标签）；名字不存在时报错" },
        addTagIds: { type: "array", items: { type: "string" }, description: "增量添加标签 id；id 不存在报错并列出可用标签" },
        removeTagIds: { type: "array", items: { type: "string" }, description: "增量移除标签 id；id 不存在报错" },
      },
    },
    examples: [{ id: "1001", status: "done", difficulty: 3 }, { id: "1001", addTags: ["开发"], difficulty: 2 }],
    execute: function (args, ctx) { return updateTask(db, args || {}, ctx.origin, api); },
    render: r => renderOwnership(r,"已更新"),
  });

  action("tasks.bulkUpdate", {
    description: "按 id 批量更新任务：同一个 patch 原样套用到每个 id；tags/tagIds 是整体替换，会覆盖各任务原有标签，只想加/减标签请用 addTags/addTagIds/removeTags/removeTagIds；dryRun:true 只返回将变更的预览，不写库",
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
      { ids: ["1001", "1002"], patch: { status: "done", priority: 6, difficulty: 3 }, dryRun: true },
      { ids: ["1001", "1002"], patch: { targetDate: "2026-11-15", difficulty: 2 } },
    ],
    execute: function (args, ctx) { return bulkUpdate(db, args || {}, ctx.origin, api); },
    render: renderBulkUpdate,
  });

  action("tasks.bulkCreate", {
    description: "一次创建多条任务，每条必须显式tableId或tablePath（恰好一个）；发现、选择、新路径授权规则与tasks.create完全相同；单事务含新节点、标签、日志、重启，全成或全不成。dryRun:true真校验后回滚，返回wouldCreateNodes及temporaryIds；created仅统计非deduped新任务" + GUIDANCE.join(" "),
    input: {
      type: "object",
      required: ["records"],
      properties: {
        records: {
          type: "array",
          description: "每条字段同 tasks.create",
          items: TASK_CREATE_SCHEMA,
        },
        dryRun: { type: "boolean", description: "true 时只校验预览，不写库、不发事件" },
      },
    },
    examples: [
      { records: [{ title: "任务 A", tableId:"已核对的任务表id", priority: 6, difficulty: 2 }, { title: "任务 B", tableId:"已核对的任务表id", difficulty: 3, targetDate: "2026-11-12" }], dryRun: true },
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

  action("tasks.history", {
    description: "读单个任务的变更历史（来自 sync_change_log，倒序）",
    input: {
      type: "object",
      properties: {
        id: { type: "string" },
        taskId: { type: ["string", "number"] },
        limit: { type: "number", description: "默认 50，最大 500" },
      },
    },
    examples: [{ id: "1001", limit: 20 }],
    execute: function (args) { return taskHistory(db, args || {}); },
    render: function (r) { return "任务 " + r.id + " 变更 " + r.count + " 条"; },
  });

  action("tasks.changelog", {
    description: "增量读变更日志（task / tag_mapping / task_dep），可按 since 与表过滤",
    input: {
      type: "object",
      properties: {
        since: { type: "string", description: "只返回该时间点之后的记录（ISO 或 YYYY-MM-DD）" },
        tables: { type: "array", items: { type: "string" }, description: "默认 task / tag_mapping / task_dep" },
        limit: { type: "number", description: "默认 100，最大 1000" },
      },
    },
    examples: [{ since: "2026-11-07T00:00:00.000Z", limit: 200 }],
    execute: function (args) { return changelog(db, args || {}); },
    render: function (r) { return "变更 " + r.count + " 条" + (r.since ? "（since " + r.since + "）" : ""); },
  });

  action("tasks.export", {
    description: "导出任务：format=json|csv|markdown；非空 ids 优先，否则复用 tasks.list 的过滤条件（含标题、描述、感受关键词）。保持列表默认限制：tab 5..8 默认12条，其它最多500条；不接受分页参数",
    input: {
      type: "object",
      properties: {
        format: { type: "string", enum: ["json", "csv", "markdown"], description: "默认 json" },
        ids: { type: "array", items: { type: "string" } },
        ...TASK_FILTER_SCHEMA,
      },
    },
    examples: [{ format: "csv", tab: 8 }, { format: "markdown", ids: ["1001", "1002"] }],
    execute: function (args) { return exportTasks(db, args || {}, api); },
    render: function (r) { return "已导出 " + r.count + " 条任务（" + r.format + "）"; },
  });

  action("tasks.reorder", {
    description: "按给定 id 顺序重排 sort（默认步长 100）；配合 tasks.list 的 sort=manual 使用；支持 dryRun",
    input: {
      type: "object",
      required: ["ids"],
      properties: {
        ids: { type: "array", items: { type: "string" }, description: "期望的排序，从前往后" },
        step: { type: "number", description: "相邻间隔，默认 100" },
        base: { type: "number", description: "起始值，默认 0" },
        dryRun: { type: "boolean" },
      },
    },
    examples: [{ ids: ["1001", "1002"], step: 100, dryRun: true }],
    execute: function (args, ctx) { return reorderTasks(db, args || {}, ctx.origin, api); },
    render: function (r) { return r.dryRun ? "预览：将重排 " + r.wouldUpdate + " 条任务" : "已重排 " + r.updated + " 条任务"; },
  });

  action("tasks.depends", {
    description: "查看任务依赖：dependsOn（上游）/ blocks（下游）/ blocked（是否被未完成上游阻塞）",
    input: { type: "object", properties: { id: { type: "string" }, taskId: { type: ["string", "number"] } } },
    examples: [{ id: "1001" }],
    execute: function (args) { return taskDeps(db, args || {}); },
    render: function (r) { return "任务 " + r.task.id + " 依赖 " + r.dependsOn.length + " 条，被 " + r.blocks.length + " 条依赖" + (r.blocked ? "（阻塞中）" : ""); },
  });

  action("tasks.link", {
    description: "新增任务依赖：任务 id 阻塞于 dependsOnId（会拒绝自依赖与成环）",
    input: {
      type: "object",
      required: ["id", "dependsOnId"],
      properties: {
        id: { type: "string" },
        dependsOnId: { type: "string" },
      },
    },
    examples: [{ id: "1002", dependsOnId: "1001" }],
    execute: function (args, ctx) { return taskLink(db, args || {}, ctx.origin, api); },
    render: function (r) { return r.linked ? "已建立依赖：" + r.id + " ← " + r.dependsOn : "依赖已存在"; },
  });

  action("tasks.unlink", {
    description: "删除任务依赖（软删）",
    input: {
      type: "object",
      required: ["id", "dependsOnId"],
      properties: {
        id: { type: "string" },
        dependsOnId: { type: "string" },
      },
    },
    examples: [{ id: "1002", dependsOnId: "1001" }],
    execute: function (args, ctx) { return taskUnlink(db, args || {}, ctx.origin, api); },
    render: function (r) { return r.unlinked ? "已删除依赖" : "依赖不存在"; },
  });

  action("tasks.selected", {
    description: "按 id 列表批量取任务",
    input: { type: "object", properties: { ids: { type: "array", items: { type: "string" } } } },
    execute: function (args) { return selectedTasks(db, args || {}); },
    render: function (rows) { return "选中任务 " + rows.length + " 条"; },
  });

  action("tasks.timeline", {
    description: "取某条时间线有效任务，按publishDate/id正序；省略分页参数返回数组，传pageNumber或pageSize返回{records,total,current,size}，默认20条。排除已重启及已删除任务。",
    input: { type: "object", properties: { ...TIMELINE_ID_SCHEMA, ...TIMELINE_PAGE_SCHEMA } },
    execute: function (args) { return timelineTasks(db, args || {}); },
    render: function (r) { return renderArray(Array.isArray(r) ? r : r.records); },
  });

  action("tasks.restart", {
    description: "取某条重启链上的任务",
    input: { type: "object", properties: { restartKey: { type: ["string", "number"] } } },
    execute: function (args) { return restartTasks(db, args || {}); },
    render: renderArray,
  });

  action("tasks.timelineRefactor", {
    description: "把ids指定任务或timelineKeys指定整条时间线归并到timelineKey，ids和timelineKeys互斥。整线模式排除已重启/删除成员，目标必须属于选中keys；无成员key报错。dryRun不写入，返回wouldUpdate真实迁移数；整线回执total/selectedCount含目标已有成员，不返回全量ids，执行返回updated。ids模式兼容原回执。",
    input: {
      type: "object",
      properties: {
        ids: { type: "array", items: { type: "string" } },
        ...TIMELINE_ID_SCHEMA,
        timelineKeys: { type: "array", minItems: 1, items: { type: "string" }, description: "完整选中时间线key，包含目标；与ids互斥，不受list分页上限影响" },
        dryRun: { type: "boolean" },
      },
      anyOf: TIMELINE_ID_REQUIRED,
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
    render: renderBulkUpdate,
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

  action("tasks.tags", {
    description: "标签导航数据：每个标签的任务数（按状态拆分），外加「未打标签」计数。标签域未安装时 available=false",
    input: { type: "object", properties: {} },
    execute: function () {
      return tagNavStats(db, api);
    },
    render: function (r) {
      if (!r.available) return "标签域未安装";
      const parts = r.tags.map(function (t) { return t.name + " " + t.total; });
      parts.push("未打标签 " + r.untagged.total);
      return "标签 " + r.tags.length + " 个：" + parts.join("，");
    },
  });

  registerTagOptionsAction(action, db, api, migrateLegacyTypes);

  action("tasks.stats", {
    description: "任务统计：保留 7 个计数器（today 为今日到期的进行中任务数）；groupBy=tag/tableId/status/priority 时额外返回 groups（可按 from/to 限定 targetDate）；另返回 todayActivity 对象：" + TODAY_STATS_DESCRIPTION,
    input: {
      type: "object",
      properties: {
        groupBy: { type: "string", enum: ["tag", "tableId", "status", "priority"] },
        from: { type: "string", description: "targetDate >= 该日期" },
        to: { type: "string", description: "targetDate <= 该日期" },
      },
    },
    examples: [{ groupBy: "priority" }, { groupBy: "tag", from: "2026-11-01", to: "2026-11-30" }],
    execute: function (args) { return stats(db, args || {}, api); },
    render: function (s) {
      const base = "进行中 " + s.active + " / 已关闭 " + s.shutdown + " / 已完成 " + s.done + " / 已重启 " + s.restarted + " / 逾期 " + s.overdue;
      if (!s.groupBy) return base;
      return base + "\n" + s.groupBy + " 分布：" + s.groups.map(function (g) { return (g.label || g.key || "-") + "=" + g.count; }).join("，");
    },
  });

  action("tasks.statsReport", {
    description: "任务统计报表：总量/状态/标签/优先级/难度、趋势、逾期账龄、近期完成/关闭清单、任务表与任务组排行；另返回 today 对象：" + TODAY_STATS_DESCRIPTION,
    input: {
      type: "object",
      properties: {
        range: { type: "string", enum: ["7d", "30d", "90d", "365d", "all"], description: "默认 30d" },
        from: { type: "string", description: "YYYY-MM-DD，与 to 同时提供" },
        to: { type: "string", description: "YYYY-MM-DD，默认今天" },
        top: { type: "number", description: "排行/明细条数，1–20，默认 10" },
        recentDoneLimit: { type: "number", description: "「最近完成」清单条数，1–50，默认 10" },
        recentShutdownLimit: { type: "number", description: "「最近关闭」清单条数，1–50，默认 10" },
      },
    },
    examples: [{ range: "30d", top: 10 }, { from: "2026-10-01", to: "2026-10-31" }],
    execute: function (args) { return statsReport(db, args || {}, api); },
    render: renderStats,
  });

  action("tasks.delete", {
    description: "软删除单个任务（保留同步墓碑）；批量请用 tasks.bulkDelete",
    input: { type: "object", required: ["id"], properties: { id: { type: "string" }, taskId: { type: ["string", "number"], description: "id 的别名" } } },
    execute: function (args, ctx) { return removeTask(db, args || {}, ctx.origin, api); },
    render: function (r) { return "已删除任务：" + r.id; },
  });

  action("tasks.complete", {
    description: "把任务标记为完成（兼容旧 action）；完成后 priority 自动清零",
    input: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        taskId: { type: ["string", "number"], description: "id 的别名" },
        date: { type: "string", description: "完成日期 YYYY-MM-DD，缺省今天" },
        difficulty: DIFFICULTY_SCHEMA,
      },
    },
    execute: function (args, ctx) { return completeTask(db, args || {}, ctx.origin, api); },
    render: function (r) { return "已完成任务：" + r.task.title; },
  });
}
