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

let webRoute = null;
let promptSection = null;
let recordCommand = null;
const fakeCtx = {
  webServer: { register: (route) => { webRoute = route; return () => {}; } },
  tools: { register: (def) => { toolDef = def; } },
  connection: { requestRejection: () => undefined },
  systemPrompt: {
    section: (section) => { promptSection = section; return () => {}; },
    getSectionOrder: () => 500,
  },
  commands: { register: (command) => { recordCommand = command; return () => {}; } },
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

  // ── 1b. capabilities.list / capabilities.get：插件能力清单 ──
  const caps = await call("capabilities.list", {});
  assert(caps.result.domains.length === 3, "capabilities.list 域数量不对：" + caps.result.domains.length);
  const taskCap = caps.result.domains.find((d) => d.id === "wb-addon-tasks");
  assert(taskCap && taskCap.records.some((r) => r.kind === "task" && r.primaryAction === "tasks.create"), "任务域缺少 task 能力声明");
  assert(taskCap.source === "declared" && taskCap.warnings.length === 0, "任务域能力声明未通过校验");
  assert(caps.text.includes("tasks.create") && caps.text.includes("任务"), "capabilities.list 文本缺少能力入口");
  const siteOnly = await call("capabilities.list", { kind: "site" });
  assert(siteOnly.result.domains.length === 1 && siteOnly.result.domains[0].id === "wb-addon-sites", "capabilities.list kind 过滤不对");
  const noKind = await call("capabilities.list", { kind: "no-such-kind" });
  assert(noKind.result.domains.length === 0, "capabilities.list 未知 kind 应返回空");

  const capOne = await call("capabilities.get", { domain: "tasks" });
  assert(capOne.result.domain.id === "wb-addon-tasks", "capabilities.get 域解析不对");
  assert(capOne.result.capability.records[0].when.length >= 2, "capabilities.get 缺少记录时机");
  assert(capOne.result.actions.some((a) => a.name === "tasks.create"), "capabilities.get 缺少 action 列表");
  assert(capOne.text.includes("何时记录") && capOne.text.includes("去重"), "capabilities.get 文本不完整");
  let capErr = null;
  try { await call("capabilities.get", { domain: "nope" }); } catch (e) { capErr = e; }
  assert(capErr, "capabilities.get 对未知域未报错");

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

  // ── 5.1 完成感受：STATUS 带 review、REVIEW 单独更新、patch 写入 ──
  const doneWithReview = await call("tasks.update", { id: p9.result.id, type: "STATUS", status: "2", difficulty: 3.5, review: "顺利完成" });
  assert(doneWithReview.result.task.review === "顺利完成", "tasks.update STATUS 未写入 review");
  const reviewEdit = await call("tasks.update", { id: p9.result.id, type: "REVIEW", review: "后来补充：卡在调试" });
  assert(reviewEdit.result.task.review === "后来补充：卡在调试", "tasks.update REVIEW 未更新 review");
  const reviewPatch = await call("tasks.bulkUpdate", { ids: [p9.result.id], patch: { review: "patch 感受" } });
  assert(reviewPatch.result.updated === 1 && (await call("tasks.get", { id: p9.result.id })).result.task.review === "patch 感受", "bulkUpdate patch 未写入 review");
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

  // ── 12b. 统计报表：三个模块的 statsReport ──
  const taskReport = await call("tasks.statsReport", { range: "30d" });
  assert(taskReport.result.totals.total >= 1, "tasks.statsReport totals.total 为空");
  assert(Array.isArray(taskReport.result.trend) && taskReport.result.trend.length >= 1, "tasks.statsReport 缺趋势");
  assert(taskReport.result.breakdowns.status.length >= 1, "tasks.statsReport 缺状态分布");
  assert(taskReport.result.generatedAt, "tasks.statsReport 缺 generatedAt");
  const taskAll = await call("tasks.statsReport", { range: "all" });
  assert(taskAll.result.totals.total >= taskReport.result.totals.total, "tasks.statsReport range=all 计数偏小");
  let rangeErr = null;
  try { await call("tasks.statsReport", { range: "2d" }); } catch (e) { rangeErr = e; }
  assert(rangeErr, "tasks.statsReport 未拒绝非法 range");
  const tagQuick = await call("tags.stats", {});
  assert(tagQuick.result.tags >= 1 && tagQuick.result.mappings >= 1, "tags.stats 计数器为空");
  const tagReport = await call("tags.statsReport", { range: "30d" });
  assert(tagReport.result.totals.tags >= 1 && tagReport.result.totals.mappings >= 1, "tags.statsReport 总数为空");
  assert(tagReport.result.breakdowns.itemTypes.some((x) => x.key === "task"), "tags.statsReport 缺任务类型分布");
  assert(Array.isArray(tagReport.result.rankings.topTags) && tagReport.result.rankings.topTags.length >= 1, "tags.statsReport 缺 Top 标签");
  // ── 13. 其他域未受宿主改动影响 ──
  const tag = await call("tags.create", { name: "native 标签" });
  assert(tag.result.id, "tag not created");
  const node = await call("siteNodes.create", { parentId: "0", name: "native 目录" });
  const site = await call("sites.create", { siteName: "native 站点", dirIds: [node.result.node.id], siteLinks: [] });
  assert(site.result.site.id, "site not created");
  const siteReport = await call("sites.statsReport", { range: "30d" });
  assert(siteReport.result.totals.sites >= 1, "sites.statsReport totals.sites 为空");
  assert(Array.isArray(siteReport.result.lists.duplicates), "sites.statsReport 缺重复 URL 列表");
  assert(Array.isArray(siteReport.result.breakdowns.freshness), "sites.statsReport 缺新鲜度分布");

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
  assert(legacyCols.includes("review"), "旧 task 表未补 review");
  assert(legacy.prepare("SELECT 1 AS x FROM task_dep LIMIT 1").get() === undefined, "旧库升级未创建 task_dep");
  const legacyIndexes = legacy.prepare("PRAGMA index_list(task)").all().map((r) => r.name);
  assert(legacyIndexes.includes("idx_task_sort") && legacyIndexes.includes("idx_task_dedupe"), "旧 task 表索引未补建");
  legacy.close();

  // ── 15. 能力清单 fallback 与 primaryAction 校验 ──
  let fakeDispose = null;
  let badDispose = null;
  try {
    fakeDispose = host.registerDomain({
      id: "wb-addon-fake",
      title: "无能力声明域",
      description: "仅用于 fallback 测试",
      version: "0.0.1",
      setup(api) {
        api.action("fake.create", {
          description: "假写入",
          input: { type: "object", properties: { title: { type: "string" } }, required: ["title"] },
          execute: () => ({ ok: true }),
        });
      },
    });
    const fallback = await call("capabilities.list", {});
    const fake = fallback.result.domains.find((d) => d.id === "wb-addon-fake");
    assert(fake && fake.source === "fallback" && fake.records.length === 0, "未声明 capability 未回退");
    assert(fallback.text.includes("未声明能力清单"), "fallback 文本缺失");
    const fakeDetail = await call("capabilities.get", { domain: "fake" });
    assert(fakeDetail.result.source === "fallback" && fakeDetail.result.actions.some((a) => a.name === "fake.create"), "fallback 域 action 列表缺失");

    badDispose = host.registerDomain({
      id: "wb-addon-badcap",
      title: "坏能力域",
      version: "0.0.1",
      capability: {
        summary: "用于校验 primaryAction",
        records: [
          {
            kind: "thing",
            title: "东西",
            description: "不存在的写入 action",
            when: ["测试"],
            primaryAction: "badcap.create",
          },
        ],
      },
      setup(api) {
        api.action("badcap.other", {
          description: "另一个 action",
          input: { type: "object", properties: {} },
          execute: () => ({}),
        });
      },
    });
    const bad = await call("capabilities.get", { domain: "badcap" });
    assert(bad.result.warnings.some((w) => w.includes("primaryAction 未注册")), "未校验未注册的 primaryAction");
  } finally {
    if (badDispose) badDispose();
    if (fakeDispose) fakeDispose();
  }

  // ── 16. 会话记录模式：命令、动态 section、HTTP 状态 ──
  assert(recordCommand && recordCommand.name === "record", "未注册 /record 命令");
  assert(promptSection && promptSection.name === "workbench:record-mode", "未注册记录模式 prompt section");
  assert(promptSection.order === 510, "记录模式 section 顺序不对：" + promptSection.order);

  const recordSid = "sess-record-native";
  const recordAgent = { id: recordSid, session: { id: recordSid } };
  const context = { agent: recordAgent };
  assert(promptSection.text(context) === "", "记录模式默认不应注入提示");
  let cmdRes = recordCommand.handler({ agent: recordAgent, rawInput: "", attachments: [] });
  assert(cmdRes.kind === "success" && cmdRes.text.includes("/record on"), "/record 帮助不完整");
  cmdRes = recordCommand.handler({ agent: recordAgent, rawInput: "on", attachments: [] });
  assert(cmdRes.kind === "success" && cmdRes.text.includes("已开启"), "/record on 回执不对");
  const onText = promptSection.text(context);
  assert(onText.includes("记录模式") && onText.includes(recordSid), "开启后未注入记录提示");
  assert(onText.includes("dsh-session:" + recordSid), "记录提示缺少按会话去重键");
  cmdRes = recordCommand.handler({ agent: recordAgent, rawInput: "status", attachments: [] });
  assert(cmdRes.text.includes("已开启"), "/record status 未显示已开启");
  cmdRes = recordCommand.handler({ agent: recordAgent, rawInput: "off", attachments: [] });
  assert(cmdRes.kind === "success" && cmdRes.text.includes("已关闭"), "/record off 回执不对");
  assert(promptSection.text(context) === "", "关闭后仍在注入记录提示");
  assert(promptSection.text({ agent: { id: "other-session", session: { id: "other-session" } } }) === "", "记录模式串到了其他会话");
  assert(promptSection.text({}) === "", "无 agent 时不应注入记录提示");

  async function api(method, path, body) {
    let status = 0;
    let payload = null;
    const req = {
      method,
      url: path,
      headers: {},
      async *[Symbol.asyncIterator]() {
        if (body !== undefined) yield Buffer.from(JSON.stringify(body));
      },
    };
    const res = {
      writeHead(code) { status = code; },
      end(text) { payload = JSON.parse(String(text)); },
    };
    await webRoute.handler(req, res);
    return { status, payload };
  }

  const httpSid = "sess-record-http";
  let httpRes = await api("GET", "/workbench/api/record?sessionId=" + httpSid);
  assert(httpRes.status === 200 && httpRes.payload.enabled === false, "GET /record 默认状态不对");
  httpRes = await api("POST", "/workbench/api/record", { sessionId: httpSid, enabled: true });
  assert(httpRes.status === 200 && httpRes.payload.enabled === true, "POST /record 未开启");
  httpRes = await api("GET", "/workbench/api/record?sessionId=" + httpSid);
  assert(httpRes.payload.enabled === true, "GET /record 未读到开启状态");
  const httpText = promptSection.text({ agent: { id: httpSid, session: { id: httpSid } } });
  assert(httpText.includes("记录模式"), "HTTP 开启后未注入记录提示");
  httpRes = await api("POST", "/workbench/api/record", { sessionId: httpSid, enabled: "yes" });
  assert(httpRes.status === 400, "POST /record 未拒绝非布尔 enabled");
  httpRes = await api("POST", "/workbench/api/record", { enabled: true });
  assert(httpRes.status === 400, "POST /record 未拒绝空 sessionId");

  console.log("NATIVE TEST PASS", { domains: domains.length, actions: names.length, home });
} finally {
  for (const fn of cleanups.reverse()) { try { fn(); } catch {} }
  rmSync(home, { recursive: true, force: true });
}
