/**
 * 难度分布五维切换的回归测试（不启动 DSH）。
 * 覆盖：all 保持存量口径、done/publish/claimed/shutdown 与年度活动同口径、
 *       区间边界、未设置桶、非法维度报错、维度回显、单日口径与活动日历对账。
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const home = mkdtempSync(join(tmpdir(), "wb-diff-dim-"));
process.env.WB_HOME = home;
const cleanups = [];
let host = null;

const fakeCtx = {
  webServer: { register: () => () => {} },
  tools: { register: () => {} },
  connection: { requestRejection: () => undefined },
  systemPrompt: { section: () => () => {}, getSectionOrder: () => 500 },
  commands: { register: () => () => {} },
  agents: { get: () => undefined },
  provide: (name, value) => { if (name === "workbench") host = value; },
  effect: (fn) => { const d = fn(); if (typeof d === "function") cleanups.push(d); },
};

function assert(cond, message) {
  if (!cond) throw new Error("断言失败：" + message);
}

async function call(action, args) {
  return host.invoke(action, args || {}, "agent");
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function today(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + (offsetDays || 0));
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

function binsOf(report) {
  const out = Object.create(null);
  for (const bin of (report.breakdowns && report.breakdowns.difficulty) || []) out[bin.key] = bin.count;
  return out;
}

function sumBins(report) {
  return ((report.breakdowns && report.breakdowns.difficulty) || []).reduce((n, bin) => n + bin.count, 0);
}

let failed = false;
try {
  const shell = await import("../packages/shell/lib/index.js");
  shell.apply(fakeCtx);
  if (!host) throw new Error("workbench service not provided");
  const tasks = await import("../packages/addons/tasks/lib/index.js");
  tasks.apply({ workbench: host, effect: fakeCtx.effect });

  const tableId = (await call("taskNodes.create", { parentId: "1", type: "1", name: "难度口径任务表" })).result.node.id;
  const base = { tableId, publishDate: today(-40) };
  // a：40 天前发布、10 天前完成（难度 3）——30 天口径只进 done
  const a = (await call("tasks.create", Object.assign({}, base, {
    title: "a 完成于 10 天前", difficulty: 3, status: "2", doneDate: today(-10),
  }))).result.id;
  // b：5 天前发布、仍开启（难度 3）——30 天口径只进 publish
  await call("tasks.create", { tableId, title: "b 5 天前发布", difficulty: 3, publishDate: today(-5) });
  // c：3 天前发布、2 天前关闭（难度 5）——30 天口径只进 shutdown
  await call("tasks.create", { tableId, title: "c 2 天前关闭", difficulty: 5, publishDate: today(-3), status: "1", shutdownDate: today(-2) });
  // d：1 天前发布、未填难度——未设置桶在 all/publish 下都要出现
  await call("tasks.create", { tableId, title: "d 未填难度", publishDate: today(-1) });
  // e：120 天前发布、150 天前完成（难度 1）——30 天口径全都不进，但 claimed 按发布日期近似也超出区间
  await call("tasks.create", { tableId, title: "e 很久以前完成", difficulty: 1, publishDate: today(-200), status: "2", doneDate: today(-150) });
  // f：20 天前发布、6 天前完成（难度 2）——done 与 claimed（近似发布日）都进 30 天
  const f = (await call("tasks.create", { tableId, title: "f 6 天前完成", difficulty: 2, publishDate: today(-20), status: "2", doneDate: today(-6) })).result.id;

  const all = (await call("tasks.statsReport", { range: "all" })).result;
  const allBins = binsOf(all);
  assert(all.breakdowns.difficultyDimension === "all", "默认维度应为 all，实际：" + all.breakdowns.difficultyDimension);
  assert(allBins["3"] === 2, "存量口径难度 3 应为 2（a、b）：" + allBins["3"]);
  assert(allBins["5"] === 1 && allBins["2"] === 1 && allBins["1"] === 1, "存量口径各难度计数不对：" + JSON.stringify(allBins));
  assert(allBins.unset === 1, "存量口径未设置应为 1：" + allBins.unset);
  assert(sumBins(all) === 6, "存量口径合计应为 6：" + sumBins(all));

  const done = (await call("tasks.statsReport", { range: "30d", dimension: "done" })).result;
  const doneBins = binsOf(done);
  assert(done.breakdowns.difficultyDimension === "done", "维度回显应为 done");
  assert(doneBins["3"] === 1 && doneBins["2"] === 1, "done 维度应为难度 3/2 各 1：" + JSON.stringify(doneBins));
  assert(sumBins(done) === 2, "done 维度合计应为 2：" + sumBins(done));
  assert(doneBins.unset === 0, "done 维度没有未设难度任务：" + doneBins.unset);

  const publish = (await call("tasks.statsReport", { range: "30d", dimension: "publish" })).result;
  const publishBins = binsOf(publish);
  assert(publishBins["3"] === 1 && publishBins["5"] === 1 && publishBins["2"] === 1, "publish 维度明细不对：" + JSON.stringify(publishBins));
  assert(publishBins.unset === 1, "publish 维度应保留未设置桶：" + publishBins.unset);
  assert(sumBins(publish) === 4, "publish 维度合计应为 4（b/c/d/f）：" + sumBins(publish));

  const claimed = (await call("tasks.statsReport", { range: "30d", dimension: "claimed" })).result;
  const claimedBins = binsOf(claimed);
  assert(claimedBins["2"] === 1, "claimed 维度应只计 f（按发布日期近似）：" + JSON.stringify(claimedBins));
  assert(sumBins(claimed) === 1, "claimed 维度合计应为 1：" + sumBins(claimed));

  const shutdown = (await call("tasks.statsReport", { range: "30d", dimension: "shutdown" })).result;
  const shutdownBins = binsOf(shutdown);
  assert(shutdownBins["5"] === 1, "shutdown 维度应只计 c：" + JSON.stringify(shutdownBins));
  assert(sumBins(shutdown) === 1, "shutdown 维度合计应为 1：" + sumBins(shutdown));

  // 区间边界：只取 b 的发布日那一天
  const day = today(-5);
  const publishDay = (await call("tasks.statsReport", { from: day, to: day, dimension: "publish" })).result;
  const publishDayBins = binsOf(publishDay);
  assert(publishDayBins["3"] === 1 && sumBins(publishDay) === 1, "单日 publish 应只计 b：" + JSON.stringify(publishDayBins));

  // 与年度活动日历对账：同一单日的 done 数必须一致
  const year = Number(day.slice(0, 4));
  const calendar = (await call("tasks.activityCalendar", { year })).result;
  const dayRow = (calendar.days || []).find((row) => row.date === today(-10));
  const doneDay = (await call("tasks.statsReport", { from: today(-10), to: today(-10), dimension: "done" })).result;
  assert(dayRow && dayRow.done === sumBins(doneDay), "done 单日口径与活动日历不一致：" + JSON.stringify(dayRow) + " / " + sumBins(doneDay));

  // 非法维度直接报错，不做静默回退
  let threw = false;
  try {
    await call("tasks.statsReport", { range: "30d", dimension: "yesterday" });
  } catch (e) {
    threw = /dimension/.test(String(e && e.message));
  }
  assert(threw, "非法 dimension 应报错");

  // 已知任务仍可用：完成日期与列表筛选一致
  const listDone = (await call("tasks.list", { statuses: [2], pageSize: 1 })).result;
  assert(listDone.total === 3, "已完成任务应为 a/e/f 三条：" + listDone.total);
  assert(String(a) && String(f), "创建的任务 id 应存在");

  console.log("DIFFICULTY DIMENSIONS TEST PASS", JSON.stringify({
    stock: sumBins(all), done: sumBins(done), publish: sumBins(publish), claimed: sumBins(claimed), shutdown: sumBins(shutdown),
  }));
} catch (error) {
  failed = true;
  console.error("DIFFICULTY DIMENSIONS TEST FAIL:", error && error.message);
} finally {
  for (const fn of cleanups.reverse()) {
    try { fn(); } catch { /* ignore */ }
  }
  rmSync(home, { recursive: true, force: true });
}
process.exitCode = failed ? 1 : 0;
