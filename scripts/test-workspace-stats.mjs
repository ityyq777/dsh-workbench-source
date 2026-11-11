/**
 * 统计报表的工作区维度回归测试（不启动 DSH）。
 * 覆盖：多对多重复计数、未关联工作区、零任务工作区、已删关联、已删工作区、
 *       重启任务不计开启/完成/逾期，以及排行数字与 tasks.list 同口径。
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const home = mkdtempSync(join(tmpdir(), "wb-ws-stats-"));
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

function today(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + (offsetDays || 0));
  return d.toISOString().slice(0, 10);
}

let failed = false;
try {
  const shell = await import("../packages/shell/lib/index.js");
  shell.apply(fakeCtx);
  if (!host) throw new Error("workbench service not provided");
  const tasks = await import("../packages/addons/tasks/lib/index.js");
  tasks.apply({ workbench: host, effect: fakeCtx.effect });

  const tableId = (await call("taskNodes.create", { parentId: "1", type: "1", name: "工作区统计任务表" })).result.node.id;
  const wsA = (await call("taskWorkspaces.create", { title: "工作区 A" })).result.workspace.id;
  const wsB = (await call("taskWorkspaces.create", { title: "工作区 B" })).result.workspace.id;
  const wsC = (await call("taskWorkspaces.create", { title: "工作区 C（零任务）" })).result.workspace.id;
  const wsD = (await call("taskWorkspaces.create", { title: "工作区 D（待删）" })).result.workspace.id;

  const t1 = (await call("tasks.create", { tableId, title: "A 开启逾期", publishDate: today(-5), targetDate: today(-3), workspaceIds: [wsA] })).result.id;
  const t2 = (await call("tasks.create", { tableId, title: "AB 已完成", workspaceIds: [wsA, wsB] })).result.id;
  await call("tasks.complete", { id: t2 });
  const t3 = (await call("tasks.create", { tableId, title: "未关联", priority: 3 })).result.id;
  const t4 = (await call("tasks.create", { tableId, title: "B 开启", workspaceIds: [wsB] })).result.id;
  const t5 = (await call("tasks.create", { tableId, title: "A 后解绑", workspaceIds: [wsA] })).result.id;
  await call("taskWorkspaces.detach", { workspaceId: wsA, taskIds: [t5] });
  const t6 = (await call("tasks.create", { tableId, title: "D 删除后回落", workspaceIds: [wsD] })).result.id;
  await call("taskWorkspaces.delete", { id: wsD });
  // 重启链：旧任务转 status=3，新任务继承 restartKey；两者都还在工作区 A。
  // 重启要求原任务先有时间线归属，所以先建空线再 attach。
  const tl = (await call("taskTimelines.create", { title: "重启链时间线" })).result.timeline.id;
  const t7 = (await call("tasks.create", { tableId, title: "重启链 v1", workspaceIds: [wsA] })).result.id;
  await call("taskTimelines.attach", { taskId: t7, timelineId: tl });
  const t7b = (await call("tasks.create", { tableId, title: "重启链 v2", source: 2, restartKey: t7, timelineId: tl, workspaceIds: [wsA] })).result.id;

  const report = (await call("tasks.statsReport", { range: "all", top: 20 })).result;
  const rankings = report.rankings || {};
  const spaces = rankings.workspaces || [];
  const byId = Object.fromEntries(spaces.map((w) => [String(w.id), w]));
  const none = rankings.noWorkspace;

  assert(Array.isArray(spaces), "rankings.workspaces 应为数组");
  assert(none && none.id === "__none__", "rankings.noWorkspace 缺失或 id 不对");
  assert(!byId[wsD], "已删除工作区不应出现在排行");
  assert(byId[wsC] && byId[wsC].total === 0, "零任务工作区应保留零计数桶");

  const a = byId[wsA];
  assert(a && a.total === 4, "工作区 A 应计 4 条任务（t1/t2/重启链两条，t5 已解绑）：" + (a && a.total));
  assert(a.open === 2 && a.done === 1 && a.overdue === 1, "工作区 A 构成不对：" + JSON.stringify(a));
  assert(a.completion === 0.25, "工作区 A 完成率应为 1/4：" + a.completion);
  const b = byId[wsB];
  assert(b && b.total === 2 && b.open === 1 && b.done === 1, "工作区 B 构成不对：" + JSON.stringify(b));

  // 多对多：t2 同时计入 A/B，各工作区合计大于任务总数
  // t2 同时挂在 A/B：各工作区合计 = 有归属任务数 + 重复计数，未关联任务不进来。
  const sum = spaces.reduce((n, w) => n + w.total, 0);
  const linked = report.totals.total - none.total;
  assert(sum === linked + 1, "多对多合计应等于有归属任务数 + 重复计数：" + sum + " / " + linked);
  assert(none.total === 3, "未关联工作区应为 3 条（t3 + 解绑的 t5 + 工作区被删的 t6）：" + none.total);
  assert(none.open === 3 && none.done === 0, "未关联工作区构成不对：" + JSON.stringify(none));

  // 与列表同口径
  const listA = (await call("tasks.list", { workspaceIds: [wsA], pageSize: 1 })).result;
  assert(listA.total === a.total, "工作区 A 排行与 tasks.list 不一致：" + a.total + " / " + listA.total);
  const listB = (await call("tasks.list", { workspaceIds: [wsB], pageSize: 1 })).result;
  assert(listB.total === b.total, "工作区 B 排行与 tasks.list 不一致：" + b.total + " / " + listB.total);
  const listNone = (await call("tasks.list", { noWorkspace: true, pageSize: 1 })).result;
  assert(listNone.total === none.total, "未关联工作区排行与 tasks.list 不一致：" + none.total + " / " + listNone.total);

  // 重启任务只进 total，不进 open/done/overdue
  assert(a.open + a.done < a.total, "重启任务不应计入开启/完成");
  const restartOld = (await call("tasks.get", { id: t7 })).result;
  const oldStatus = String((restartOld.task || restartOld).status);
  assert(oldStatus === "3", "重启链旧任务状态应为 3，实际：" + oldStatus);
  const restartNew = (await call("tasks.get", { id: t7b })).result;
  assert(String((restartNew.task || restartNew).status) === "0", "重启链新任务应为开启");

  // 空库场景：换一个没有任务的库不现实，这里验证「无工作区」分支靠 noWorkspace 单独成立
  assert(!spaces.some((w) => w.id === "__none__"), "未关联工作区不应混进 workspaces 排行");

  // 未关联互斥校验顺手回归
  let mutualErr = null;
  try { await call("tasks.list", { workspaceIds: [wsA], noWorkspace: true }); } catch (e) { mutualErr = e; }
  assert(mutualErr, "workspaceIds 与 noWorkspace 同时传应报错");

  console.log("WORKSPACE STATS PASS");
} catch (error) {
  failed = true;
  console.error("WORKSPACE STATS FAIL:", error && error.message ? error.message : error);
  if (error && error.stack) console.error(error.stack.split("\n").slice(1, 4).join("\n"));
} finally {
  for (const fn of cleanups.reverse()) { try { fn(); } catch { /* ignore */ } }
  try { rmSync(home, { recursive: true, force: true }); } catch { /* ignore */ }
  if (failed) process.exitCode = 1;
}
