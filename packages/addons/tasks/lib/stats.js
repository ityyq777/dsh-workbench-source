// 任务统计报表：只读聚合，不写库、不发事件。
// 契约见 docs/specs/18-统计报表设计.md §4。

import { tagsAvailable, tagBreakdown } from "./tagging.js";
import { configValues } from "./config.js";

const STATUS_LABELS = {
  "0": "进行中",
  "1": "已关闭",
  "2": "已完成",
  "3": "已重启",
};

function pad(n) {
  return String(n).padStart(2, "0");
}
function dayStr(d) {
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}
function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function addDays(d, n) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
}
function parseDay(value) {
  const s = String(value || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const p = s.split("-").map(Number);
  const d = new Date(p[0], p[1] - 1, p[2]);
  if (d.getFullYear() !== p[0] || d.getMonth() !== p[1] - 1 || d.getDate() !== p[2]) return null;
  return d;
}
function diffDays(from, to) {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / 86400000);
}
function round(n, digits) {
  if (!Number.isFinite(n)) return 0;
  const f = Math.pow(10, digits === undefined ? 1 : digits);
  return Math.round(n * f) / f;
}

function resolveRange(db, args) {
  const today = startOfDay(new Date());
  let from;
  let to = today;
  if (args.from || args.to) {
    if (!args.from || !args.to) throw new Error("from 与 to 必须同时提供");
    from = parseDay(args.from);
    to = parseDay(args.to);
    if (!from || !to) throw new Error("from/to 必须是合法的 YYYY-MM-DD 日期");
    if (from > to) throw new Error("from 不能晚于 to");
  } else {
    const range = String(args.range || "30d");
    if (["7d", "30d", "90d", "365d", "all"].indexOf(range) < 0) {
      throw new Error("不支持的时间范围：" + range);
    }
    if (range === "all") {
      const row = db.prepare(
        "SELECT date(MIN(created_at)/1000,'unixepoch','localtime') AS d FROM task WHERE deleted_at IS NULL",
      ).get();
      const earliest = row && row.d ? parseDay(row.d) : null;
      from = earliest || addDays(today, -29);
    } else {
      from = addDays(today, -(parseInt(range, 10) - 1));
    }
  }
  const days = diffDays(from, to) + 1;
  const bucket = days <= 120 ? "day" : days <= 730 ? "week" : "month";
  const cfg = configValues(db);
  const weekStartsOn = Number(cfg["stats.weekStartsOn"]) === 0 ? 0 : 1;
  return { from: dayStr(from), to: dayStr(to), days: days, bucket: bucket, weekStartsOn: weekStartsOn };
}

function bucketKeys(range) {
  const from = parseDay(range.from);
  const to = parseDay(range.to);
  const keys = [];
  const index = Object.create(null);
  for (let d = from; d <= to; d = addDays(d, 1)) {
    let key;
    if (range.bucket === "week") {
      const ws = Number(range.weekStartsOn) === 0 ? 0 : 1;
      const wd = (d.getDay() - ws + 7) % 7;
      key = dayStr(addDays(d, -wd));
    } else if (range.bucket === "month") {
      key = dayStr(d).slice(0, 7);
    } else {
      key = dayStr(d);
    }
    if (!(key in index)) {
      index[key] = keys.length;
      keys.push(key);
    }
  }
  return { keys: keys, index: index };
}

function bucketOf(day, range) {
  const d = parseDay(day);
  if (!d) return "";
  if (range.bucket === "week") {
    const ws = Number(range.weekStartsOn) === 0 ? 0 : 1;
    const wd = (d.getDay() - ws + 7) % 7;
    return dayStr(addDays(d, -wd));
  }
  if (range.bucket === "month") return day.slice(0, 7);
  return day;
}

function loadNodes(db) {
  const rows = db.prepare(
    "SELECT id,name,parent_id,path FROM task_node WHERE deleted_at IS NULL",
  ).all();
  const map = Object.create(null);
  for (const row of rows) map[String(row.id)] = row;
  return map;
}

function nodePathTitle(node, map) {
  if (!node) return "";
  const segments = String(node.path || "").split("/").filter(Boolean);
  const names = [];
  for (const id of segments) {
    const n = map[id];
    if (n) names.push(String(n.name));
  }
  return names.length ? names.join(" / ") : String(node.name || "");
}

function groupOf(node, map) {
  if (!node) return null;
  const segments = String(node.path || "").split("/").filter(Boolean);
  if (segments.length >= 2 && segments[0] === "1") {
    const gid = segments.length >= 3 ? segments[1] : segments[1];
    return map[gid] || null;
  }
  let cur = node;
  let guard = 0;
  while (cur && String(cur.parent_id) !== "1" && guard < 50) {
    cur = map[String(cur.parent_id)];
    guard += 1;
  }
  if (cur && String(cur.id) === "1") return null;
  return cur || null;
}

function zeroTrend(range) {
  const keys = bucketKeys(range).keys;
  return keys.map(function (key) {
    return { bucket: key, created: 0, done: 0, due: 0 };
  });
}

function fillTrend(trend, range, field, rows) {
  const index = bucketKeys(range).index;
  for (const row of rows) {
    const key = bucketOf(String(row.d || ""), range);
    if (!(key in index)) continue;
    trend[index[key]][field] += Number(row.n || 0);
  }
}

export function statsReport(db, args, api) {
  const input = args || {};
  const range = resolveRange(db, input);
  const top = Math.max(1, Math.min(20, Number(input.top) || 10));
  const today = dayStr(startOfDay(new Date()));
  const tomorrow = dayStr(addDays(startOfDay(new Date()), 1));
  const next7 = dayStr(addDays(startOfDay(new Date()), 7));
  const warnings = [];

  const total = Number(db.prepare("SELECT COUNT(*) AS n FROM task WHERE deleted_at IS NULL").get().n || 0);
  const statusRows = db.prepare(
    "SELECT status, COUNT(*) AS n FROM task WHERE deleted_at IS NULL GROUP BY status",
  ).all();
  const statusCount = Object.create(null);
  for (const row of statusRows) statusCount[String(row.status)] = Number(row.n || 0);
  const active = statusCount["0"] || 0;
  const shutdown = statusCount["1"] || 0;
  const done = statusCount["2"] || 0;
  const restarted = statusCount["3"] || 0;

  const overdue = Number(db.prepare(
    "SELECT COUNT(*) AS n FROM task WHERE deleted_at IS NULL AND status='0' AND target_date IS NOT NULL AND target_date<>'' AND target_date<?",
  ).get(today).n || 0);
  const dueToday = Number(db.prepare(
    "SELECT COUNT(*) AS n FROM task WHERE deleted_at IS NULL AND status='0' AND target_date=?",
  ).get(today).n || 0);
  const dueNext7 = Number(db.prepare(
    "SELECT COUNT(*) AS n FROM task WHERE deleted_at IS NULL AND status='0' AND target_date>=? AND target_date<=?",
  ).get(tomorrow, next7).n || 0);

  const trend = zeroTrend(range);
  fillTrend(trend, range, "created", db.prepare(
    "SELECT date(created_at/1000,'unixepoch','localtime') AS d, COUNT(*) AS n FROM task " +
      "WHERE deleted_at IS NULL AND date(created_at/1000,'unixepoch','localtime') BETWEEN ? AND ? GROUP BY d",
  ).all(range.from, range.to));
  fillTrend(trend, range, "done", db.prepare(
    "SELECT done_date AS d, COUNT(*) AS n FROM task WHERE deleted_at IS NULL AND done_date IS NOT NULL AND done_date<>'' " +
      "AND done_date BETWEEN ? AND ? GROUP BY done_date",
  ).all(range.from, range.to));
  fillTrend(trend, range, "due", db.prepare(
    "SELECT target_date AS d, COUNT(*) AS n FROM task WHERE deleted_at IS NULL AND target_date IS NOT NULL AND target_date<>'' " +
      "AND target_date BETWEEN ? AND ? GROUP BY target_date",
  ).all(range.from, range.to));
  const newInRange = trend.reduce(function (n, row) { return n + row.created; }, 0);
  const doneInRange = trend.reduce(function (n, row) { return n + row.done; }, 0);

  const cycleRow = db.prepare(
    "SELECT AVG(julianday(done_date) - julianday(date(created_at/1000,'unixepoch','localtime'))) AS v FROM task " +
      "WHERE deleted_at IS NULL AND status='2' AND done_date IS NOT NULL AND done_date<>'' AND done_date BETWEEN ? AND ?",
  ).get(range.from, range.to);
  const leadRow = db.prepare(
    "SELECT AVG(julianday(done_date) - julianday(publish_date)) AS v FROM task " +
      "WHERE deleted_at IS NULL AND status='2' AND done_date IS NOT NULL AND done_date<>'' AND done_date BETWEEN ? AND ? " +
      "AND publish_date IS NOT NULL AND publish_date<>''",
  ).get(range.from, range.to);

  const doneMissing = Number(db.prepare(
    "SELECT COUNT(*) AS n FROM task WHERE deleted_at IS NULL AND status='2' AND (done_date IS NULL OR done_date='')",
  ).get().n || 0);
  if (doneMissing > 0) {
    warnings.push({
      code: "done_date_missing",
      message: doneMissing + " 个已完成任务缺少完成日期，未计入完成趋势与周期均值",
    });
  }

  // 任务不再有「类型」；分组改看标签。多标签任务会出现在多个分组里，总和可能大于任务数。
  const tagStats = tagBreakdown(db, api);
  if (!tagsAvailable(db, api)) {
    warnings.push({ code: "tag_domain_missing", message: "标签域未安装，标签分组不可用" });
  }

  const priorityRows = db.prepare(
    "SELECT priority, COUNT(*) AS n FROM task WHERE deleted_at IS NULL GROUP BY priority",
  ).all();
  const priorityBins = [
    { key: "0", label: "未设置", count: 0 },
    { key: "low", label: "1–3", count: 0 },
    { key: "mid", label: "4–6", count: 0 },
    { key: "high", label: "7–8", count: 0 },
    { key: "urgent", label: "9–10", count: 0 },
  ];
  for (const row of priorityRows) {
    const p = Number(row.priority);
    const n = Number(row.n || 0);
    if (p <= 0) priorityBins[0].count += n;
    else if (p <= 3) priorityBins[1].count += n;
    else if (p <= 6) priorityBins[2].count += n;
    else if (p <= 8) priorityBins[3].count += n;
    else priorityBins[4].count += n;
  }

  const difficultyRows = db.prepare(
    "SELECT difficulty, COUNT(*) AS n FROM task WHERE deleted_at IS NULL GROUP BY difficulty",
  ).all();
  const difficultyBins = [
    { key: "0-1", label: "0–1", count: 0 },
    { key: "1-2", label: "1–2", count: 0 },
    { key: "2-3", label: "2–3", count: 0 },
    { key: "3-4", label: "3–4", count: 0 },
    { key: "4-5", label: "4–5", count: 0 },
  ];
  let difficultyUnset = 0;
  for (const row of difficultyRows) {
    const n = Number(row.n || 0);
    if (row.difficulty === null || row.difficulty === undefined || Number(row.difficulty) <= 0) {
      difficultyUnset += n;
      continue;
    }
    const d = Number(row.difficulty);
    if (d <= 1) difficultyBins[0].count += n;
    else if (d <= 2) difficultyBins[1].count += n;
    else if (d <= 3) difficultyBins[2].count += n;
    else if (d <= 4) difficultyBins[3].count += n;
    else difficultyBins[4].count += n;
  }
  if (difficultyUnset > 0) {
    difficultyBins.push({ key: "unset", label: "未设置", count: difficultyUnset });
  }

  const overdueRows = db.prepare(
    "SELECT id,title,target_date,table_id FROM task WHERE deleted_at IS NULL AND status='0' " +
      "AND target_date IS NOT NULL AND target_date<>'' AND target_date<? ORDER BY target_date ASC, id ASC LIMIT ?",
  ).all(today, Math.min(top, 10));
  const nodeMap = loadNodes(db);
  const overdueList = overdueRows.map(function (row) {
    const table = nodeMap[String(row.table_id)];
    return {
      id: String(row.id),
      title: String(row.title || ""),
      targetDate: String(row.target_date || ""),
      daysOverdue: Math.max(0, diffDays(parseDay(String(row.target_date)), startOfDay(new Date()))),
      tableTitle: table ? String(table.name) : "已删除任务表",
    };
  });

  const agingBins = [
    { key: "1-3", label: "1–3 天", count: 0 },
    { key: "4-7", label: "4–7 天", count: 0 },
    { key: "8-14", label: "8–14 天", count: 0 },
    { key: "15-30", label: "15–30 天", count: 0 },
    { key: "30+", label: ">30 天", count: 0 },
  ];
  const agingRows = db.prepare(
    "SELECT target_date FROM task WHERE deleted_at IS NULL AND status='0' AND target_date IS NOT NULL AND target_date<>'' AND target_date<?",
  ).all(today);
  for (const row of agingRows) {
    const age = Math.max(1, diffDays(parseDay(String(row.target_date)), startOfDay(new Date())));
    if (age <= 3) agingBins[0].count += 1;
    else if (age <= 7) agingBins[1].count += 1;
    else if (age <= 14) agingBins[2].count += 1;
    else if (age <= 30) agingBins[3].count += 1;
    else agingBins[4].count += 1;
  }

  const allTasks = db.prepare(
    "SELECT id,status,target_date,table_id FROM task WHERE deleted_at IS NULL",
  ).all();
  const tableAgg = Object.create(null);
  const groupAgg = Object.create(null);
  for (const row of allTasks) {
    const tableId = row.table_id === null || row.table_id === undefined ? "" : String(row.table_id);
    const tableNode = tableId ? nodeMap[tableId] : null;
    const tableKey = tableNode ? tableId : "__missing__";
    if (!tableAgg[tableKey]) {
      tableAgg[tableKey] = {
        id: tableKey,
        title: tableNode ? String(tableNode.name) : (tableId ? "已删除任务表" : "未归档"),
        path: tableNode ? nodePathTitle(tableNode, nodeMap) : "",
        total: 0, open: 0, overdue: 0, done: 0,
      };
    }
    const t = tableAgg[tableKey];
    t.total += 1;
    if (String(row.status) === "0") t.open += 1;
    if (String(row.status) === "2") t.done += 1;
    if (String(row.status) === "0" && row.target_date && String(row.target_date) < today) t.overdue += 1;

    const groupNode = groupOf(tableNode, nodeMap);
    const groupKey = groupNode ? String(groupNode.id) : "__ungrouped__";
    if (!groupAgg[groupKey]) {
      groupAgg[groupKey] = {
        id: groupKey,
        title: groupNode ? String(groupNode.name) : "未归档",
        total: 0, open: 0, overdue: 0, done: 0,
      };
    }
    const g = groupAgg[groupKey];
    g.total += 1;
    if (String(row.status) === "0") g.open += 1;
    if (String(row.status) === "2") g.done += 1;
    if (String(row.status) === "0" && row.target_date && String(row.target_date) < today) g.overdue += 1;
  }
  function rank(list) {
    return list.map(function (item) {
      item.completion = item.total > 0 ? round(item.done / item.total, 3) : 0;
      return item;
    }).sort(function (a, b) {
      return (b.open + b.overdue) - (a.open + a.overdue) || b.total - a.total;
    }).slice(0, top);
  }

  const totals = {
    total: total,
    active: active,
    shutdown: shutdown,
    done: done,
    restarted: restarted,
    overdue: overdue,
    dueToday: dueToday,
    dueNext7: dueNext7,
    newInRange: newInRange,
  };
  const rates = {
    completion: total > 0 ? round(done / total, 3) : 0,
    overdue: active > 0 ? round(overdue / active, 3) : 0,
    restart: total > 0 ? round(restarted / total, 3) : 0,
    shutdown: total > 0 ? round(shutdown / total, 3) : 0,
    avgLeadDays: leadRow && Number.isFinite(Number(leadRow.v)) ? round(Number(leadRow.v), 1) : null,
    avgCycleDays: cycleRow && Number.isFinite(Number(cycleRow.v)) ? round(Number(cycleRow.v), 1) : null,
  };

  return {
    generatedAt: Date.now(),
    range: range,
    totals: totals,
    rates: rates,
    breakdowns: {
      status: ["0", "1", "2", "3"].map(function (key) {
        return { key: key, label: STATUS_LABELS[key], count: statusCount[key] || 0 };
      }),
      tags: tagStats.rows,
      priority: priorityBins,
      difficulty: difficultyBins,
    },
    trend: trend,
    aging: agingBins,
    rankings: {
      tables: rank(Object.keys(tableAgg).map(function (k) { return tableAgg[k]; })),
      groups: rank(Object.keys(groupAgg).map(function (k) { return groupAgg[k]; })),
    },
    lists: { overdue: overdueList },
    warnings: warnings,
  };
}

export function renderStats(r) {
  if (!r || !r.totals) return "任务统计暂无数据";
  const t = r.totals;
  return "任务 " + t.total + " 个：进行中 " + t.active + "、已完成 " + t.done + "、已关闭 " + t.shutdown +
    "、已重启 " + t.restarted + "；逾期 " + t.overdue + "；近 " + r.range.days + " 天完成 " +
    r.trend.reduce(function (n, x) { return n + x.done; }, 0) + "、新增 " + t.newInRange + "。";
}
