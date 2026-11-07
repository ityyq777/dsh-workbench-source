/**
 * DSH 原生插件形态的本地自测（不启动 DSH）。
 * 覆盖：宿主域注册中心 / 业务插件 apply 注册 / action 调用 /
 *       actions.list|help 自描述 / Workbench 假字段告警 / tasks 批量与 dryRun。
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const home = mkdtempSync(join(tmpdir(), "wb-native-"));
process.env.WB_HOME = home;
const cleanups = [];
let host = null;
let toolDef = null;

const fakeCtx = {
  webServer: { register: () => () => {} },
  tools: { register: (def) => { toolDef = def; } },
  connection: { requestRejection: () => undefined },
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

try {
  const shell = await import("../packages/shell/lib/index.js");
  shell.apply(fakeCtx);
  if (!host) throw new Error("workbench service not provided");
  assert(toolDef && toolDef.name === "Workbench", "Workbench tool 未注册");

  const tasks = await import("../packages/addons/tasks/lib/index.js");
  tasks.apply({ workbench: host, effect: fakeCtx.effect });
  const tags = await import("../packages/addons/tags/lib/index.js");
  tags.apply({ workbench: host, effect: fakeCtx.effect });
  const sites = await import("../packages/addons/sites/lib/index.js");
  sites.apply({ workbench: host, effect: fakeCtx.effect });

  const domains = host.listDomains();
  console.log("domains:", domains.map((d) => d.id + "@" + d.version + (d.enabled ? "" : "!" + d.error)).join(", "));
  const names = host.actionNames().map((a) => a.name);
  for (const n of ["tasks.list", "tasks.create", "tags.list", "sites.list", "siteNodes.children", "actions.list", "actions.help"]) {
    assert(names.includes(n), "missing action " + n);
  }
  for (const n of ["tasks.get", "tasks.bulkUpdate", "tasks.bulkCreate", "tasks.bulkDelete"]) {
    assert(names.includes(n), "missing action " + n);
  }

  // ── 1. actions.list / actions.help：agent 自举 ──
  const meta = await call("actions.list", { domain: "tasks" });
  assert(meta.result.actions.length >= 16, "actions.list 域过滤数量不对：" + meta.result.actions.length);
  assert(meta.result.actions.every((a) => a.domain === "wb-addon-tasks"), "actions.list 域过滤串域");
  const createdMeta = meta.result.actions.find((a) => a.name === "tasks.create");
  assert(createdMeta && createdMeta.params.includes("targetDate"), "actions.list 缺少真实字段 targetDate");
  assert(!createdMeta.params.includes("due_at"), "actions.list 仍暴露假字段 due_at");
  assert(meta.text.includes("tasks.bulkUpdate"), "actions.list 文本缺少 action");

  const detail = await call("actions.list", { domain: "tasks", detail: true });
  const detailCreate = detail.result.actions.find((a) => a.name === "tasks.create");
  assert(detailCreate.input && detailCreate.input.properties.title, "detail:true 未返回 input schema");

  const help = await call("actions.help", { action: "tasks.bulkUpdate" });
  assert(help.result.params.some((p) => p.name === "dryRun" && p.required === false), "actions.help 缺少 dryRun");
  assert(Array.isArray(help.result.examples) && help.result.examples.length >= 2, "actions.help 缺少示例");
  assert(help.text.includes("dryRun"), "actions.help 文本缺少 dryRun");
  let helpErr = null;
  try { await call("actions.help", { action: "tasks.nope" }); } catch (e) { helpErr = e; }
  assert(helpErr, "actions.help 对未知 action 未报错");

  // ── 2. Workbench 工具：args 合并 + 假字段告警 ──
  const viaArgs = await toolDef.execute({ action: "tasks.create", args: { title: "嵌套参数任务", priority: 4 } });
  assert(viaArgs.text.includes("嵌套参数任务"), "args 嵌套参数未生效：" + viaArgs.text);
  const trap = await toolDef.execute({ action: "tasks.create", args: { title: "假字段任务" }, due_at: 1700000000, tags: ["x"], parentId: "1" });
  assert(trap.text.startsWith("⚠"), "假字段未告警：" + trap.text);
  assert(trap.text.includes("due_at") && trap.text.includes("tags") && trap.text.includes("parentId"), "假字段告警不完整：" + trap.text);
  const trapList = await call("tasks.list", { titleKey: "假字段任务" });
  assert(trapList.result.records.length === 1, "假字段任务未创建成功");
  const conflict = await toolDef.execute({ action: "tasks.create", args: { title: "A" }, title: "B" });
  assert(conflict.text.includes("错误"), "args 与顶层冲突未报错");

  // ── 3. 基础 CRUD ──
  const created = await call("tasks.create", { title: "native 测试任务", priority: 5, publishDate: today(-2), targetDate: today(-1) });
  const id = created.result.id;
  const list = await call("tasks.list", {});
  assert(list.result.records.some((t) => t.id === id), "task not listed");
  const got = await call("tasks.get", { id });
  assert(got.result.task.id === id && got.result.task.title === "native 测试任务", "tasks.get 未取到任务");
  let getErr = null;
  try { await call("tasks.get", { id: "no-such-task" }); } catch (e) { getErr = e; }
  assert(getErr, "tasks.get 对不存在 id 未报错");

  // ── 4. list 过滤与排序 ──
  const p9 = await call("tasks.create", { title: "P9 任务", priority: 9, targetDate: today(3) });
  const filtered = await call("tasks.list", { status: "0", priorityMin: 8, sort: "-priority" });
  assert(filtered.result.records.length === 1 && filtered.result.records[0].id === p9.result.id, "priorityMin 过滤不对：" + JSON.stringify(filtered.result.records.map((t) => t.title)));
  const byTarget = await call("tasks.list", { status: "0", targetFrom: today(-1), targetTo: today(0) });
  assert(byTarget.result.records.some((t) => t.id === id), "targetFrom/targetTo 过滤漏了昨天到期的任务");

  // ── 5. bulkUpdate：dryRun 不落库，real 落库 ──
  const updateDry = await call("tasks.bulkUpdate", { ids: [id, p9.result.id], patch: { status: "done", priority: 7 }, dryRun: true });
  assert(updateDry.result.dryRun === true && updateDry.result.wouldUpdate === 2, "bulkUpdate dryRun 预览数量不对");
  assert((await call("tasks.get", { id })).result.task.status === "0", "bulkUpdate dryRun 污染了数据");
  const updateReal = await call("tasks.bulkUpdate", { ids: [id, p9.result.id], patch: { status: "done", priority: 7 } });
  assert(updateReal.result.updated === 2, "bulkUpdate real 数量不对");
  const afterUpdate = await call("tasks.get", { id });
  assert(afterUpdate.result.task.status === "2" && afterUpdate.result.task.priority === 7, "bulkUpdate 未写入");
  let bulkErr = null;
  try { await call("tasks.bulkUpdate", { ids: ["no-such"], patch: { priority: 1 } }); } catch (e) { bulkErr = e; }
  assert(bulkErr, "bulkUpdate 对不存在 id 未报错");
  const skipped = await call("tasks.bulkUpdate", { ids: ["no-such", id], patch: { priority: 3 }, skipMissing: true });
  assert(skipped.result.updated === 1 && skipped.result.missing.length === 1, "skipMissing 未生效");
  let patchErr = null;
  try { await call("tasks.bulkUpdate", { ids: [id], patch: { due_at: 1 } }); } catch (e) { patchErr = e; }
  assert(patchErr, "bulkUpdate 未拒绝未知 patch 字段");

  // ── 6. bulkCreate / bulkDelete ──
  const createDry = await call("tasks.bulkCreate", { records: [{ title: "预览A" }, { title: "预览B" }], dryRun: true });
  assert(createDry.result.dryRun === true && createDry.result.wouldCreate === 2, "bulkCreate dryRun 数量不对");
  assert((await call("tasks.list", { titleKey: "预览A" })).result.records.length === 0, "bulkCreate dryRun 污染了数据");
  const createReal = await call("tasks.bulkCreate", { records: [{ title: "批量A" }, { title: "批量B" }] });
  assert(createReal.result.created === 2, "bulkCreate real 数量不对");
  const idsBulk = createReal.result.tasks.map((t) => t.id);
  const deleteDry = await call("tasks.bulkDelete", { ids: idsBulk, dryRun: true });
  assert(deleteDry.result.wouldDelete === 2 && deleteDry.result.items.length === 2, "bulkDelete dryRun 清单不对");
  assert((await call("tasks.get", { id: idsBulk[0] })).result.task.id === idsBulk[0], "bulkDelete dryRun 删了数据");
  const deleteReal = await call("tasks.bulkDelete", { ids: idsBulk });
  assert(deleteReal.result.deleted === 2, "bulkDelete real 数量不对");
  let goneErr = null;
  try { await call("tasks.get", { id: idsBulk[0] }); } catch (e) { goneErr = e; }
  assert(goneErr, "bulkDelete 未软删除任务");

  // ── 7. sweepShutdown dryRun ──
  const overdue = await call("tasks.create", { title: "逾期任务", priority: 1, publishDate: today(-3), targetDate: today(-2) });
  const sweepDry = await call("tasks.sweepShutdown", { dryRun: true });
  assert(sweepDry.result.dryRun === true && sweepDry.result.wouldUpdate >= 1, "sweepShutdown dryRun 未命中到期任务");
  assert(sweepDry.result.items.some((t) => t.id === overdue.result.id), "sweepShutdown dryRun 清单缺少到期任务");
  assert((await call("tasks.get", { id: overdue.result.id })).result.task.status === "0", "sweepShutdown dryRun 改了状态");

  // ── 8. 标签关联（tags.link/unlink/itemsOf）与任务标签 ──
  const tagA = await call("tags.create", { name: "P6" });
  const tagB = await call("tags.create", { name: "本周" });
  const linkRes = await call("tags.link", { tagIds: [tagA.result.id, tagB.result.id], itemIds: [id, p9.result.id], itemType: "task" });
  assert(linkRes.result.linked === 4, "tags.link 关联数量不对：" + linkRes.result.linked);
  const linkAgain = await call("tags.link", { tagIds: [tagA.result.id], itemIds: [id], itemType: "task" });
  assert(linkAgain.result.linked === 0 && linkAgain.result.skipped === 1, "tags.link 未跳过已存在映射");
  const itemsOf = await call("tags.itemsOf", { itemType: "task", itemIds: [id] });
  assert(itemsOf.result.items.length === 1 && itemsOf.result.items[0].tags.length === 2, "tags.itemsOf 未返回两个标签");
  const tagged = await call("tasks.get", { id });
  assert(tagged.result.task.tags && tagged.result.task.tags.length === 2, "tasks.get 未聚合标签");
  const byTag = await call("tasks.list", { tagIds: [tagA.result.id], tab: 8 });
  assert(byTag.result.records.length >= 2, "tasks.list tagIds 过滤漏了任务");
  const unlinkRes = await call("tags.unlink", { tagIds: [tagA.result.id], itemIds: [id], itemType: "task" });
  assert(unlinkRes.result.unlinked === 1, "tags.unlink 数量不对");
  const itemsOf2 = await call("tags.itemsOf", { itemType: "task", itemIds: [id] });
  assert(itemsOf2.result.items[0].tags.length === 1, "tags.unlink 未解除关联");

  // ── 9. dedupeKey 幂等创建 ──
  const d1 = await call("tasks.create", { title: "幂等任务", dedupeKey: "native-dedupe-1", tagIds: [tagB.result.id] });
  assert(d1.result.deduped === false && d1.result.task.tags.length === 1, "create 时 tagIds 未生效");
  const d2 = await call("tasks.create", { title: "幂等任务副本", dedupeKey: "native-dedupe-1" });
  assert(d2.result.deduped === true && d2.result.id === d1.result.id, "dedupeKey 未命中已有任务");

  // ── 10. 任务依赖 ──
  const up = await call("tasks.create", { title: "上游任务" });
  const down = await call("tasks.create", { title: "下游任务" });
  const linkedDep = await call("tasks.link", { id: down.result.id, dependsOnId: up.result.id });
  assert(linkedDep.result.linked === true, "tasks.link 未建立依赖");
  const depView = await call("tasks.depends", { id: down.result.id });
  assert(depView.result.dependsOn.length === 1 && depView.result.blocked === true, "tasks.depends 未显示阻塞");
  const depAgain = await call("tasks.link", { id: down.result.id, dependsOnId: up.result.id });
  assert(depAgain.result.linked === false && depAgain.result.existing === true, "重复 link 未返回 existing");
  let cycleErr = null;
  try { await call("tasks.link", { id: up.result.id, dependsOnId: down.result.id }); } catch (e) { cycleErr = e; }
  assert(cycleErr && String(cycleErr.message).includes("循环"), "未拒绝循环依赖");
  const unlinked = await call("tasks.unlink", { id: down.result.id, dependsOnId: up.result.id });
  assert(unlinked.result.unlinked === true, "tasks.unlink 未删除依赖");
  const depAfter = await call("tasks.depends", { id: down.result.id });
  assert(depAfter.result.dependsOn.length === 0 && depAfter.result.blocked === false, "unlink 后仍显示依赖");

  // ── 11. 手动排序 ──
  const ra = await call("tasks.create", { title: "排序A" });
  const rb = await call("tasks.create", { title: "排序B" });
  const reorderDry = await call("tasks.reorder", { ids: [rb.result.id, ra.result.id], dryRun: true });
  assert(reorderDry.result.wouldUpdate === 2 && (await call("tasks.get", { id: rb.result.id })).result.task.sort === 0, "reorder dryRun 污染了 sort");
  const reorderReal = await call("tasks.reorder", { ids: [rb.result.id, ra.result.id], step: 100 });
  assert(reorderReal.result.updated === 2, "reorder 未更新");
  assert((await call("tasks.get", { id: rb.result.id })).result.task.sort === 0, "reorder 首位 sort 不对");
  assert((await call("tasks.get", { id: ra.result.id })).result.task.sort === 100, "reorder 次位 sort 不对");
  const manual = await call("tasks.list", { tab: 8, sort: "manual", pageSize: 200 });
  const sortedIds = manual.result.records.map((t) => t.id);
  assert(sortedIds.indexOf(rb.result.id) < sortedIds.indexOf(ra.result.id), "sort=manual 顺序不对");

  // ── 12. 历史 / 变更日志 / 导出 / 分组统计 ──
  const hist = await call("tasks.history", { id, limit: 20 });
  assert(hist.result.count >= 1 && hist.result.entries.some((e) => e.op === "create"), "tasks.history 缺少 create 记录");
  const change = await call("tasks.changelog", { limit: 5 });
  assert(change.result.count >= 1 && change.result.count <= 5, "tasks.changelog 条数不对");
  const expJson = await call("tasks.export", { ids: [id], format: "json" });
  const parsed = JSON.parse(expJson.result.content);
  assert(parsed.count === 1 && parsed.tasks[0].id === id, "tasks.export json 内容不对");
  const expCsv = await call("tasks.export", { ids: [id], format: "csv" });
  assert(expCsv.result.content.startsWith("id,title,"), "tasks.export csv 表头不对");
  const expMd = await call("tasks.export", { ids: [id], format: "markdown" });
  assert(expMd.result.content.includes("| id | 标题 |"), "tasks.export markdown 表头不对");
  const grouped = await call("tasks.stats", { groupBy: "status" });
  assert(grouped.result.groupBy === "status" && grouped.result.groups.length >= 1, "stats groupBy 未返回分组");
  const sum = grouped.result.groups.reduce((n, g) => n + g.count, 0);
  assert(sum >= 1, "stats groupBy 计数为空");
  const groupedType = await call("tasks.stats", { groupBy: "type" });
  assert(groupedType.result.groups.length >= 1, "stats groupBy=type 失败");

  // ── 13. 其他域未受宿主改动影响 ──
  const tag = await call("tags.create", { name: "native 标签" });
  assert(tag.result.id, "tag not created");
  const node = await call("siteNodes.create", { parentId: "0", name: "native 目录" });
  const site = await call("sites.create", { siteName: "native 站点", dirIds: [node.result.node.id], siteLinks: [] });
  assert(site.result.site.id, "site not created");

  // ── 14. 旧版 task 表升级：先补 sort/dedupe_key，再建索引 ──
  const legacy = new DatabaseSync(":memory:");
  legacy.exec(
    "CREATE TABLE task (id TEXT PRIMARY KEY,title TEXT NOT NULL,description TEXT NOT NULL DEFAULT ''," +
      "status TEXT NOT NULL DEFAULT '0',type TEXT NOT NULL DEFAULT '0',priority INTEGER NOT NULL DEFAULT 0," +
      "difficulty REAL,table_id TEXT NOT NULL,timeline_key TEXT,restart_key TEXT,publish_date TEXT NOT NULL," +
      "target_date TEXT NOT NULL,done_date TEXT,shutdown_date TEXT,created_at INTEGER NOT NULL," +
      "updated_at INTEGER NOT NULL,deleted_at INTEGER,rev INTEGER NOT NULL DEFAULT 1);",
  );
  legacy.exec(
    "CREATE TABLE task_node (id TEXT PRIMARY KEY,name TEXT NOT NULL,type TEXT NOT NULL," +
      "parent_id TEXT NOT NULL DEFAULT '0',path TEXT NOT NULL,sort INTEGER NOT NULL DEFAULT 0," +
      "depth INTEGER NOT NULL DEFAULT 0,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL," +
      "deleted_at INTEGER,rev INTEGER NOT NULL DEFAULT 1);",
  );
  const { ensureSchema: ensureTaskSchema } = await import("../packages/addons/tasks/lib/db.js");
  ensureTaskSchema(legacy, null);
  const legacyCols = legacy.prepare("PRAGMA table_info(task)").all().map((c) => c.name);
  assert(legacyCols.includes("sort") && legacyCols.includes("dedupe_key"), "旧 task 表未补 sort/dedupe_key");
  assert(legacy.prepare("SELECT 1 AS x FROM task_dep LIMIT 1").get() === undefined, "旧库升级未创建 task_dep");
  const legacyIndexes = legacy.prepare("PRAGMA index_list(task)").all().map((r) => r.name);
  assert(legacyIndexes.includes("idx_task_sort") && legacyIndexes.includes("idx_task_dedupe"), "旧 task 表索引未补建");
  legacy.close();

  console.log("NATIVE TEST PASS", { domains: domains.length, actions: names.length, home });
} finally {
  for (const fn of cleanups.reverse()) { try { fn(); } catch {} }
  rmSync(home, { recursive: true, force: true });
}
