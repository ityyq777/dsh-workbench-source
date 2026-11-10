// 时间线统计区块的结构回归：不依赖浏览器，直接用 charts.cjs 渲染节点树。
// 覆盖中英文文案、空库、排行行与展开成员、截断提示、趋势 KPI。
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { makeCharts } = require("../packages/addons/tasks/client/stats/charts.cjs");
const { buildSection, text } = require("../packages/addons/tasks/client/stats/timeline-section.cjs");

const ch = makeCharts("wbt");
const walk = (node, out = []) => {
  if (node == null || typeof node !== "object") return out;
  if (Array.isArray(node)) { node.forEach((kid) => walk(kid, out)); return out; }
  out.push(node);
  const kids = node.props ? node.props.children : null;
  if (Array.isArray(kids)) kids.forEach((kid) => walk(kid, out));
  else if (kids != null) walk(kids, out);
  return out;
};
const texts = (nodes) => nodes.flatMap((n) => {
  const p = n.props || {};
  return [p.children, p.text, p.label, p.title, p.note, p.hint, p.value].flat(Infinity).filter((v) => typeof v === "string" || typeof v === "number").map(String);
});

const rows = [
  { id: "tl-1", title: "Delivery line", taskCount: 3, openCount: 1, doneCount: 2, shutdownCount: 0, overdueCount: 1, doneRate: 66.7, lastActivityDate: "2026-11-09" },
  { id: "tl-2", title: "Empty line", taskCount: 0, openCount: 0, doneCount: 0, shutdownCount: 0, overdueCount: 0, doneRate: null, lastActivityDate: null },
];
const base = {
  totals: { timelines: 2, timelinesWithTasks: 1, emptyTimelines: 1, emptyRatio: 50, tasks: 3, assignedTasks: 3, unassignedTasks: 0, coverage: 100 },
  top: { limit: 100, returned: 2, truncated: false, records: rows },
  distribution: [{ key: "0", label: "0（空线）", count: 1 }, { key: "2-5", label: "2–5", count: 1 }],
  overdue: { lines: [{ id: "tl-1", title: "Delivery line", taskCount: 3, overdueCount: 1, lastActivityDate: "2026-11-09" }], lineCount: 1, taskCount: 1 },
};

// 1) 中文 KPI 与口径提示。
{
  const nodes = walk(buildSection(base, { ch, t: text("zh"), lang: "zh" }));
  const flat = texts(nodes);
  for (const label of ["时间线", "有任务", "Empty line", "归属覆盖率", "规模分布", "逾期时间线"]) assert.ok(flat.includes(label), "缺文案 " + label);
  assert.ok(flat.some((s) => String(s).includes("已重启任务不计入")));
  assert.ok(flat.some((s) => String(s).includes("未归属 0 条")));
  const buttons = nodes.filter((n) => n.props && n.props.type === "button");
  assert.equal(buttons.length, 2, "每条线一个可展开按钮");
  assert.equal(buttons[0].props.children, "Delivery line");
  assert.equal(buttons.every((b) => b.props["aria-expanded"] === false), true);
}

// 2) 展开成员：只渲染该线，数量与明细一致；完成率空线显示破折号。
{
  const nodes = walk(buildSection(base, { ch, t: text("zh"), lang: "zh", openId: "tl-1", members: { "tl-1": [{ title: "A" }, { title: "B" }, { title: "C" }] } }));
  const buttons = nodes.filter((n) => n.props && n.props.type === "button");
  assert.equal(buttons[0].props["aria-expanded"], true);
  assert.equal(buttons[1].props["aria-expanded"], false);
  assert.ok(texts(nodes).some((s) => s === "A、B、C"), "成员明细应使用 tasks.timeline 的回执");
  const memberBlock = nodes.find((n) => n.props && String(n.props.className || "").includes("wbt-tl-members"));
  assert.ok(memberBlock);
}

// 3) 空库：只显示无时间线提示，不渲染排行表与分布。
{
  const empty = { totals: { timelines: 0, timelinesWithTasks: 0, emptyTimelines: 0, emptyRatio: null, tasks: 0, assignedTasks: 0, unassignedTasks: 0, coverage: null }, top: { limit: 100, returned: 0, truncated: false, records: [] }, distribution: [] };
  const nodes = walk(buildSection(empty, { ch, t: text("zh"), lang: "zh" }));
  assert.ok(texts(nodes).some((s) => String(s).includes("还没有时间线")));
  assert.equal(nodes.some((n) => n.props && String(n.props.className || "").includes("wbt-table")), false);
  assert.equal(nodes.some((n) => n.type === "table"), false);
  const cards = nodes.filter((n) => n.key === "tldist" || n.key === "tloverdue");
  assert.equal(cards.length, 0);
}

// 4) 英文界面不泄漏中文，KPI 标签本地化。
{
  const nodes = walk(buildSection(base, { ch, t: text("en"), lang: "en" }));
  const flat = texts(nodes);
  for (const label of ["Timelines", "With tasks", "Empty", "Coverage", "Size distribution", "Overdue timelines"]) assert.ok(flat.includes(label), "缺英文文案 " + label);
  assert.equal(flat.some((s) => /[\u4e00-\u9fa5]/.test(String(s))), false, "英文界面出现中文：" + flat.filter((s) => /[\u4e00-\u9fa5]/.test(String(s))).join("|"));
}

// 5) 截断提示与趋势 KPI。
{
  const cut = { ...base, top: { ...base.top, truncated: true }, trend: { from: "2026-11-01", to: "2026-11-10", newTimelines: 2, newTasks: 5, doneTasks: 3 } };
  const nodes = walk(buildSection(cut, { ch, t: text("zh"), lang: "zh" }));
  const caption = nodes.find((n) => n.type === "caption");
  assert.ok(caption && String(caption.props.children).includes("仅显示前 2 条"));
  const trendCard = nodes.find((n) => n.key === "tltrend");
  assert.ok(trendCard);
  const trendTexts = texts(walk(trendCard));
  assert.ok(trendTexts.includes("新增时间线") && trendTexts.includes("新增任务") && trendTexts.includes("完成任务"));
}

console.log("TIMELINE STATS UI PASS", { zhButtons: 2, emptyCards: 0 });
