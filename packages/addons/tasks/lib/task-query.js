/** 列表查询。与 tasks.js 的循环依赖只在函数调用期读取，顶层不求值。 */
import { idOf, addDays, todayStr, nodeMap, taskOut } from "./db.js";
import { asCode, STATUS_NAMES, STATUSES, requireTable, dateArg, withNotices, tagMissingNotices } from "./tasks.js";
import { activityFilter } from "./activity-calendar.js";
import { clampPriority } from "./task-priority.js";
import { LEGACY_TYPE_TAGS, tagsAvailable, normalizeTagIds, normalizeTagNames, tagIdsByNames, attachTags, migrateLegacyTypes } from "./tagging.js";

/**
 * 列表分页：0 紧急（未完成 + 高优先级）、1..4 是旧「类型」页签，保留为同名
 * 标签筛选（工作/生活/学习/开发），5..8 是状态页签。
 */
const TABS = {
  EMERGENCY: 0, WORK: 1, LIFE: 2, STUDY: 3, DEV: 4,
  SHUTDOWN: 5, ACTIVE: 6, DONE: 7, OVERVIEW: 8,
};
function tabCode(value) {
  if (value === undefined || value === null || value === "") return 0;
  if (TABS[String(value)] !== undefined) return TABS[String(value)];
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 8) throw new Error("tab 取值非法：" + value);
  return Math.floor(n);
}

export function listTasks(db, args, api) {
  const activity = activityFilter(args.activityDate, args.activityType);
  // 第一次打开列表时把旧「类型」补成标签；幂等，失败不阻断列表。
  try {
    migrateLegacyTypes(db, api, "migrate");
  } catch (e) {
    /* ignore */
  }
  const rawTab = args.tab;
  const tabAll = rawTab === undefined || rawTab === null || String(rawTab).trim() === ""
    || /^(all|\*)$/i.test(String(rawTab).trim());
  const tab = tabAll ? 8 : tabCode(rawTab);
  const where = ["t.deleted_at IS NULL"];
  const params = [];
  const listNotices = [];
  if (activity) { where.push(activity.sql); params.push(...activity.params); }

  const titleKey = args.titleKey === undefined || args.titleKey === null ? "" : String(args.titleKey).trim();
  if (titleKey) {
    const key = titleKey.replace(/[\\%_]/g, "\\$&");
    where.push("(t.title LIKE ? ESCAPE '\\' OR t.description LIKE ? ESCAPE '\\' OR t.review LIKE ? ESCAPE '\\')");
    params.push("%" + key + "%", "%" + key + "%", "%" + key + "%");
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
      return withNotices({ records: [], current: 1, size: null, total: 0, returned: 0, truncated: false, pageable: false, pageSize: null }, listNotices);
    }
    where.push("t.table_id IN (" + tables.map(function () { return "?"; }).join(",") + ")");
    for (const t of tables) params.push(String(t.id));
  }

  const tableKey = args.tableKey === undefined || args.tableKey === null ? "" : String(args.tableKey).trim();
  if (tableKey) {
    const key = tableKey.replace(/[\\%_]/g, "\\$&");
    where.push(
      "EXISTS (SELECT 1 FROM task_node n WHERE n.id=t.table_id AND n.deleted_at IS NULL AND (n.name LIKE ? ESCAPE '\\' OR n.description LIKE ? ESCAPE '\\'))",
    );
    params.push("%" + key + "%", "%" + key + "%");
  }

  const filterRestarted = args.filterRestarted === undefined ? true : Boolean(args.filterRestarted);
  // 旧前端的 checkedTypes（0..3）仍接受，按旧类型名映射成标签过滤。
  const checkedTypes = Array.isArray(args.checkedTypes) ? args.checkedTypes.map(String) : [];
  for (const c of checkedTypes) {
    if (!(c in LEGACY_TYPE_TAGS)) throw new Error("checkedTypes 取值非法：" + c);
  }
  const tagAvailable = tagsAvailable(db, api);
  let filterTagIds = normalizeTagIds(args.tagIds);
  const filterTagNames = normalizeTagNames(args.tags);
  for (const c of checkedTypes) {
    const name = LEGACY_TYPE_TAGS[c];
    if (filterTagNames.indexOf(name) < 0) filterTagNames.push(name);
  }
  if (filterTagNames.length) {
    if (!tagAvailable) {
      // 可选能力缺失：不报错，按「筛不到任何任务」处理，并在回执里说明原因。
      listNotices.push(tagMissingNotices({ tags: [] }, false)[0]);
      where.push("1=0");
    }
    const resolved = tagAvailable ? tagIdsByNames(db, filterTagNames) : { ids: [] };
    for (const id of resolved.ids) if (filterTagIds.indexOf(id) < 0) filterTagIds.push(id);
    if (!resolved.ids.length) where.push("1=0");
  }

  // 额外过滤：与 tab/tableId/groupId 条件是 AND 关系。
  if (args.status !== undefined && args.status !== null && args.status !== "") {
    where.push("t.status=?");
    params.push(asCode(args.status, STATUS_NAMES, STATUSES, "status"));
  }
  const difficultyMissing = args.difficultyMissing === true;
  if (difficultyMissing) where.push("(t.difficulty IS NULL OR t.difficulty=0)");
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
  if (filterTagIds.length && !tagAvailable) {
    if (!listNotices.length) listNotices.push(tagMissingNotices({ tags: [] }, false)[0]);
    where.push("1=0");
  } else if (filterTagIds.length) {
    where.push("EXISTS (SELECT 1 FROM tag_mapping tm WHERE tm.item_type='task' AND tm.item_id=t.id AND tm.deleted_at IS NULL AND tm.tag_id IN (" + filterTagIds.map(function () { return "?"; }).join(",") + "))");
    for (const id of filterTagIds) params.push(id);
  }

  if (tab === 0) {
    where.push("(t.priority >= 6 OR t.target_date <= ?)");
    where.push("t.status='0'");
    params.push(addDays(todayStr(), 2));
  } else if (tab >= 1 && tab <= 4) {
    // 旧「类型」页签（兼容旧客户端）：只按同名标签筛；task.type 列已删除，标签域缺失时无结果。
    where.push("t.status='0'");
    const legacy = tagAvailable
      ? db.prepare(
        "SELECT id FROM tag WHERE name=? AND deleted_at IS NULL ORDER BY created_at ASC LIMIT 1",
      ).get(LEGACY_TYPE_TAGS[String(tab - 1)])
      : null;
    if (legacy) {
      where.push("EXISTS (SELECT 1 FROM tag_mapping tm WHERE tm.item_type='task' AND tm.item_id=t.id AND tm.deleted_at IS NULL AND tm.tag_id=?)");
      params.push(String(legacy.id));
    } else {
      where.push("1=0");
    }
  } else if (tab === 5) {
    where.push(filterRestarted ? "t.status='1'" : "t.status='3'");
  } else if (tab === 6) {
    where.push("t.status='0'");
  } else if (tab === 7) {
    where.push("t.status='2'");
  } else if (tab === 8) {
    if (filterRestarted) where.push("t.status!='3'");
  }

  // 分页语义（2026-11-08 明确化）：
  // - pageSize 夹在 1..200，请求值超出时按上限截断并在 filter.pageSize 回显实际值；
  // - total 永远是筛选后的真实总数（不受 LIMIT 影响），returned 是本页实际返回条数；
  // - 未分页时最多返回 MAX_UNPAGED 条，被截断时 truncated=true。
  const MAX_PAGE_SIZE = 200;
  const MAX_UNPAGED = 500;
  const wantPaging = args.pageNumber !== undefined || args.pageSize !== undefined;
  const pageable = (tab > 4 && tab < 9) || wantPaging;
  let pageNumber = 1;
  let pageSize = 0;
  let limitSql = "";
  let pageSizeRequested = null;
  if (pageable) {
    pageNumber = Math.max(1, Math.floor(Number(args.pageNumber) || 1));
    const rawSize = Number(args.pageSize);
    pageSizeRequested = Number.isFinite(rawSize) && rawSize > 0 ? Math.floor(rawSize) : null;
    pageSize = Math.max(1, Math.min(MAX_PAGE_SIZE, pageSizeRequested || 12));
    limitSql = " LIMIT ? OFFSET ?";
  } else {
    limitSql = " LIMIT " + MAX_UNPAGED;
  }

  const SORTS = {
    priority: "t.priority", target: "t.target_date", publish: "t.publish_date",
    updated: "t.updated_at", created: "t.created_at", manual: "t.sort",
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
    if (!col) throw new Error("sort 取值非法：" + args.sort + "（可用 priority / target / publish / updated / created / manual，前缀 - 表示降序）");
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
  attachTags(db, api, records);
  const TAB_TITLES = { 0: "紧急", 5: "已关闭", 6: "进行中", 7: "已完成", 8: "总览" };
  const returned = records.length;
  const truncated = returned < total;
  const filter = {
    tab: tab,
    tabTitle: TAB_TITLES[tab] || ("类型页签 " + tab),
    pageNumber: pageable ? pageNumber : 1,
    pageSize: pageable ? pageSize : null,
    pageable: pageable,
    totalPages: pageable && pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1,
    total: total,
    returned: returned,
    truncated: truncated,
  };
  // 请求的 pageSize 超过上限时明确回显被截断，别让调用方以为按 500 取了 500 条。
  if (pageable && pageSizeRequested !== null && pageSizeRequested > pageSize) {
    filter.pageSizeRequested = pageSizeRequested;
    filter.pageSizeCapped = true;
  }
  if (activity) { filter.activityDate = activity.date; filter.activityType = activity.type; }
  if (titleKey) filter.titleKey = titleKey;
  if (tableId && tableId !== "0") filter.tableId = tableId;
  if (tableKey) filter.tableKey = tableKey;
  if (groupId && groupId !== "0") filter.groupId = groupId;
  if (args.status !== undefined && args.status !== null && args.status !== "") filter.status = String(args.status);
  if (filterTagIds.length) filter.tagIds = filterTagIds.slice();
  if (filterTagNames.length) filter.tags = filterTagNames.slice();
  if (difficultyMissing) filter.difficultyMissing = true;
  if (priorityMin !== null) filter.priorityMin = priorityMin;
  if (priorityMax !== null) filter.priorityMax = priorityMax;
  if (targetFrom) filter.targetFrom = targetFrom;
  if (targetTo) filter.targetTo = targetTo;
  if (args.sort) filter.sort = String(args.sort) + (args.order ? " " + String(args.order) : "");
  if (!filterRestarted && (tab === 5 || tab === 8)) filter.filterRestarted = false;
  if (!tabAll) filter.tabGiven = true;
  return withNotices({
    records,
    current: pageable ? pageNumber : 1,
    size: pageable ? pageSize : returned,
    total: total,
    returned: returned,
    truncated: truncated,
    pageable,
    pageSize: pageable ? pageSize : null,
    filter,
  }, listNotices);
}
