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
  const trap = await toolDef.execute({ action: "tasks.create", args: { title: "假字段任务" }, due_at: 1700000000, assignee: "me", parentId: "1" });
  assert(trap.text.startsWith("⚠"), "假字段未告警：" + trap.text);
  assert(trap.text.includes("due_at") && trap.text.includes("assignee") && trap.text.includes("parentId"), "假字段告警不完整：" + trap.text);
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

  // ── 4.1 检索可用性：默认 tab、筛选回显、关键词搜描述、任意 tab 分页、标签增量 ──
  const noTab = await call("tasks.list", {});
  assert(noTab.result.filter.tab === 8 && noTab.result.filter.tabGiven !== true, "未传 tab 时应按总览（8）检索：" + JSON.stringify(noTab.result.filter));
  assert(noTab.text.startsWith("筛选："), "tasks.list 未回显筛选条件：" + noTab.text.split("\n")[0]);
  assert(noTab.text.includes("tab=8"), "筛选回显缺少 tab：" + noTab.text.split("\n")[0]);
  const descTask = await call("tasks.create", { title: "描述检索源", description: "正文里藏着一个独特词 zeta-flag" });
  const byDesc = await call("tasks.list", { titleKey: "zeta-flag" });
  assert(byDesc.result.records.length === 1 && byDesc.result.records[0].id === descTask.result.id, "titleKey 未匹配描述：" + JSON.stringify(byDesc.result.records.map((t) => t.title)));
  const pagedAll = await call("tasks.list", { status: "0", pageNumber: 1, pageSize: 2 });
  assert(pagedAll.result.filter.pageable === true && pagedAll.result.records.length <= 2, "非 tab5..8 传 pageSize 未分页");
  assert(pagedAll.result.filter.pageSize === 2, "分页参数未回显");
  assert(pagedAll.result.returned === pagedAll.result.records.length, "分页未回显 returned");
  assert(typeof pagedAll.result.truncated === "boolean", "分页未回显 truncated");
  const capped = await call("tasks.list", { status: "0", pageNumber: 1, pageSize: 9999 });
  assert(capped.result.pageSize === 200 && capped.result.filter.pageSizeCapped === true, "pageSize 超上限未按 200 截断并回显");
  const unpagedAll = await call("tasks.list", { tab: 1, status: "0" });
  assert(unpagedAll.result.pageSize === null && unpagedAll.result.returned === unpagedAll.result.records.length && unpagedAll.result.truncated === false, "未分页的 pageSize/returned/truncated 不对");
  // 标题允许重复：同名创建不判重，靠 id 区分
  const dupTitleA = await call("tasks.create", { title: "同名任务-契约" });
  const dupTitleB = await call("tasks.create", { title: "同名任务-契约" });
  assert(dupTitleA.result.id !== dupTitleB.result.id, "同名标题被错误判重");
  const dupTitleList = await call("tasks.list", { titleKey: "同名任务-契约" });
  assert(dupTitleList.result.records.length === 2, "同名标题任务应各自存在：" + dupTitleList.result.records.length);
  const mergeTask = await call("tasks.create", { title: "标签增量任务" });
  await call("tasks.update", { id: mergeTask.result.id, addTags: ["增量A"] });
  await call("tasks.update", { id: mergeTask.result.id, addTags: ["增量B"], removeTags: ["增量A"] });
  const tagNames = ((await call("tasks.get", { id: mergeTask.result.id })).result.task.tags || []).map((x) => x.name);
  assert(tagNames.includes("增量B") && !tagNames.includes("增量A"), "addTags/removeTags 增量语义不对：" + JSON.stringify(tagNames));
  await call("tasks.update", { id: mergeTask.result.id, addTags: ["增量C"] });
  const keptNames = ((await call("tasks.get", { id: mergeTask.result.id })).result.task.tags || []).map((x) => x.name);
  assert(keptNames.includes("增量B") && keptNames.includes("增量C"), "addTags 覆盖了原有标签：" + JSON.stringify(keptNames));
  let mergeErr = null;
  try { await call("tasks.update", { id: mergeTask.result.id, tags: ["X"], addTags: ["Y"] }); } catch (e) { mergeErr = e; }
  assert(mergeErr, "整体替换与增量标签同时传入未被拒绝");
  const bulkMerge = await call("tasks.bulkUpdate", { ids: [mergeTask.result.id, descTask.result.id], patch: { addTags: ["批量增量"] } });
  assert(bulkMerge.result.updated === 2, "bulkUpdate 增量标签数量不对");
  const bulkMerged = (await call("tasks.get", { id: descTask.result.id })).result.task.tags.map((x) => x.name);
  assert(bulkMerged.includes("批量增量"), "bulkUpdate addTags 未生效：" + JSON.stringify(bulkMerged));

  // ── 4.2 任务表描述：写入/清空/按描述检索/列表带表信息/备份往返 ──
  const nodeCreated = await call("taskNodes.create", { parentId: "1", type: "1", name: "描述表A", description: "这张表专做 zeta-table 关键词定位" });
  const descTableId = nodeCreated.result.node.id;
  assert(nodeCreated.result.node.description.includes("zeta-table"), "新建表时 description 未保存");
  const picked = await call("tasks.create", { title: "描述表里的任务", tableId: descTableId });
  const byTableKey = await call("tasks.list", { tableKey: "zeta-table" });
  assert(byTableKey.result.records.some((t) => t.id === picked.result.id), "tasks.list tableKey 未按表描述命中任务");
  assert(byTableKey.result.filter.tableKey === "zeta-table", "tableKey 未回显");
  const rec = byTableKey.result.records.find((t) => t.id === picked.result.id);
  assert(rec.tableName === "描述表A" && rec.tableDescription.includes("zeta-table"), "任务记录未带所属表名与描述：" + JSON.stringify([rec.tableName, rec.tableDescription]));
  const byDescNode = await call("taskNodes.search", { keyword: "zeta-table" });
  assert(byDescNode.result.nodes.length === 1 && byDescNode.result.nodes[0].id === descTableId, "taskNodes.search 未按描述命中表");
  assert(Array.isArray(byDescNode.result.nodes[0].tasks) && byDescNode.result.nodes[0].tasks.some((x) => x.id === picked.result.id), "taskNodes.search 未返回命中表下的任务");
  assert(byDescNode.result.nodes[0].taskCount >= 1, "taskNodes.search 未统计任务数");
  const byNameNode = await call("taskNodes.search", { keyword: "描述表A" });
  assert(byNameNode.result.nodes.some((n) => n.id === descTableId), "taskNodes.search 未按名称命中表");
  const renamed = await call("taskNodes.update", { id: descTableId, name: "描述表B" });
  assert(renamed.result.node.name === "描述表B" && renamed.result.node.description.includes("zeta-table"), "taskNodes.update 改名时丢了描述");
  const descOnly = await call("taskNodes.update", { id: descTableId, description: "只改描述 alpha-beta" });
  assert(descOnly.result.node.description === "只改描述 alpha-beta" && descOnly.result.node.name === "描述表B", "taskNodes.update 只改描述时改了名称");
  const cleared = await call("taskNodes.update", { id: descTableId, description: "" });
  assert(cleared.result.node.description === "", "taskNodes.update 传空串未清空描述");
  const noChange = await call("taskNodes.update", { id: descTableId, name: "描述表B" });
  assert(noChange.result.changed === false, "taskNodes.update 空更新未返回 changed=false");
  try { await call("taskNodes.update", { id: descTableId }); assert(false, "taskNodes.update 无字段未报错"); } catch (e) { /* 预期 */ }
  await call("taskNodes.update", { id: descTableId, description: "备份往返描述 omega" });
  const nodeData = await call("tasks.dataQuery", { table: "task_node", search: "omega" });
  assert((nodeData.result.rows || []).some((r) => String(r.description || "").includes("omega")), "数据页查询未带出表描述列");

  // ── 4.3 自描述契约：字段字典、方向、默认值必须与实现一致 ──
  const capTasks = await call("capabilities.get", { domain: "tasks" });
  const fieldMap = new Map((capTasks.result.capability.fields || []).map((f) => [f.name, f]));
  assert(fieldMap.size >= 8, "capabilities.get 未返回任务字段字典：" + fieldMap.size);
  assert(/越大越紧急/.test(fieldMap.get("priority").description), "priority 字段未写明方向（数值越大越紧急）");
  assert(/0\.\.10/.test(fieldMap.get("priority").type || ""), "priority 字段未写明取值范围：" + fieldMap.get("priority").type);
  assert(/0=进行中|0=进行中/.test(fieldMap.get("status").description), "status 字段未写明 0 的含义");
  assert(/缺省/.test(fieldMap.get("tab").description) && /8/.test(fieldMap.get("tab").description), "tab 字段未写明缺省值");
  assert(/闭区间/.test(fieldMap.get("range / from / to").description), "range/from/to 未写明闭区间语义");
  assert(capTasks.text.includes("字段字典"), "capabilities.get 文本未渲染字段字典");
  for (const domain of ["tags", "sites"]) {
    const capOther = await call("capabilities.get", { domain });
    assert((capOther.result.capability.fields || []).length >= 4, domain + " 未声明字段字典");
  }

  const sortField = await call("actions.help", { action: "tasks.list" });
  assert(/越大越紧急/.test(sortField.text), "tasks.list 描述未写明优先级方向");
  assert(/缺省=总览/.test(sortField.text), "tasks.list 描述未写明 tab 缺省");
  const bulkHelp = await call("actions.help", { action: "tasks.bulkUpdate" });
  assert(/整体替换/.test(bulkHelp.text) && /addTags/.test(bulkHelp.text), "tasks.bulkUpdate 描述未提示整体替换风险");
  const updHelp = await call("actions.help", { action: "tasks.update" });
  assert(/更新模式/.test(updHelp.text), "tasks.update 描述未说明 type 是更新模式");

  // 默认 tab=8 与排序方向必须与描述一致
  const defaultList = await call("tasks.list", {});
  assert(defaultList.result.filter.tab === 8, "tasks.list 不传 tab 的默认值不是 8：" + defaultList.result.filter.tab);
  const lowP = await call("tasks.create", { title: "契约排序-低优先", priority: 3 });
  const highP = await call("tasks.create", { title: "契约排序-高优先", priority: 9 });
  const descSort = await call("tasks.list", { titleKey: "契约排序", sort: "-priority" });
  assert(descSort.result.records[0].id === highP.result.id, "sort=-priority 未把数值大的排在前面");
  assert(/越大越紧急/.test(descSort.text), "排序回显未说明方向：" + descSort.text.split("\n")[0]);
  const ascSort = await call("tasks.list", { titleKey: "契约排序", sort: "priority" });
  assert(ascSort.result.records[0].id === lowP.result.id, "sort=priority 升序不对");

  // bulkUpdate 的 tags 整体替换语义（先给两条不同标签，再用同一 patch 覆盖）
  const cTagA = await call("tags.create", { name: "契约标签A" });
  const cTagB = await call("tags.create", { name: "契约标签B" });
  const cTagC = await call("tags.create", { name: "契约标签C" });
  await call("tasks.update", { id: lowP.result.id, tagIds: [cTagA.result.id] });
  await call("tasks.update", { id: highP.result.id, tagIds: [cTagB.result.id] });
  await call("tasks.bulkUpdate", { ids: [lowP.result.id, highP.result.id], patch: { tagIds: [cTagC.result.id] } });
  const afterBulk = await call("tags.itemsOf", { itemType: "task", itemIds: [lowP.result.id, highP.result.id] });
  assert(afterBulk.result.items.every((it) => it.tags.length === 1 && it.tags[0].id === String(cTagC.result.id)), "bulkUpdate tagIds 不是整体替换语义：" + JSON.stringify(afterBulk.result.items.map((it) => it.tags.map((x) => x.id))));
  await call("tasks.bulkUpdate", { ids: [lowP.result.id, highP.result.id], patch: { addTagIds: [cTagA.result.id] } });
  const afterAdd = await call("tags.itemsOf", { itemType: "task", itemIds: [lowP.result.id, highP.result.id] });
  assert(afterAdd.result.items.every((it) => it.tags.length === 2 && it.tags.some((x) => x.id === String(cTagA.result.id))), "addTagIds 未保留原有标签：" + JSON.stringify(afterAdd.result.items.map((it) => it.tags.map((x) => x.id))));

  // ── 4.4 标签写入校验：未知名字按开关自动创建或报错并列出可用标签 ──
  await call("tasks.configReset", {}); // 回到默认：form.autoCreateTags=true
  const autoTag = await call("tasks.create", { title: "标签校验-自动建", tags: ["自动建标签X"] });
  const allTags = await call("tags.list", {});
  const tagNamesNow = (allTags.result.records || []).map((x) => x.name);
  assert(tagNamesNow.includes("自动建标签X"), "默认配置下未知标签名未自动创建：" + JSON.stringify(tagNamesNow));

  await call("tasks.configSet", { values: { "form.autoCreateTags": false } });
  let tvNameErr = null;
  try {
    await call("tasks.create", { title: "标签校验-应失败", tags: ["不存在标签Y"] });
  } catch (e) { tvNameErr = e; }
  assert(tvNameErr, "form.autoCreateTags=false 时未知标签名未报错");
  assert(/标签不存在/.test(tvNameErr.message) && /不存在标签Y/.test(tvNameErr.message), "报错未指出缺失的标签名：" + tvNameErr.message);
  assert(/可用标签/.test(tvNameErr.message) && /自动建标签X/.test(tvNameErr.message), "报错未列出可用标签：" + tvNameErr.message);
  assert(/form\.autoCreateTags/.test(tvNameErr.message), "报错未提示开关：" + tvNameErr.message);

  // 已存在的名字在开关关闭时仍可写入
  await call("tasks.create", { title: "标签校验-已存在", tags: ["自动建标签X"] });

  // 按 id 写入：id 不存在必须报错并列出可用标签（即使开关打开，也不会按 id 造标签）
  let tvIdErr = null;
  try {
    await call("tasks.create", { title: "标签校验-坏 id", tagIds: ["not-a-real-tag-id"] });
  } catch (e) { tvIdErr = e; }
  assert(tvIdErr && /标签 id 不存在/.test(tvIdErr.message), "未知 tagIds 未报错：" + (tvIdErr && tvIdErr.message));
  assert(/可用标签/.test(tvIdErr.message), "未知 tagIds 报错未列出可用标签：" + tvIdErr.message);

  // 批量写入口共用同一套校验，且失败时整批回滚
  const btBefore = (await call("tasks.list", { titleKey: "标签校验-批量" })).result.records.length;
  let tvBulkErr = null;
  try {
    await call("tasks.bulkCreate", { records: [{ title: "标签校验-批量 A", tags: ["自动建标签X"] }, { title: "标签校验-批量 B", tags: ["不存在标签Z"] }] });
  } catch (e) { tvBulkErr = e; }
  assert(tvBulkErr && /标签不存在/.test(tvBulkErr.message), "bulkCreate 未校验未知标签名");
  const btAfter = (await call("tasks.list", { titleKey: "标签校验-批量" })).result.records.length;
  assert(btAfter === btBefore, "bulkCreate 校验失败后仍写入了部分任务：" + btBefore + " -> " + btAfter);

  const tkForBulk = await call("tasks.create", { title: "标签校验-批量更新" });
  let tvBuErr = null;
  try {
    await call("tasks.bulkUpdate", { ids: [tkForBulk.result.id], patch: { tags: ["不存在标签W"] } });
  } catch (e) { tvBuErr = e; }
  assert(tvBuErr && /标签不存在/.test(tvBuErr.message), "bulkUpdate 未校验未知标签名");
  let tvDryErr = null;
  try {
    await call("tasks.bulkUpdate", { ids: [tkForBulk.result.id], patch: { tags: ["不存在标签V"] }, dryRun: true });
  } catch (e) { tvDryErr = e; }
  assert(tvDryErr && /标签不存在/.test(tvDryErr.message), "bulkUpdate dryRun 跳过了标签校验");

  // 关掉开关后重新打开，未知名字恢复自动创建
  await call("tasks.configReset", { ids: ["form.autoCreateTags"] });
  await call("tasks.create", { title: "标签校验-恢复自动", tags: ["恢复后标签R"] });
  const tagsAfterReset = (await call("tags.list", {})).result.records.map((x) => x.name);
  assert(tagsAfterReset.includes("恢复后标签R"), "重置开关后未知标签名未恢复自动创建");

  // ── 5. bulkUpdate：dryRun 不落库，real 落库 ──
  const updateDry = await call("tasks.bulkUpdate", { ids: [id, p9.result.id], patch: { status: "done", priority: 7 }, dryRun: true });
  assert(updateDry.result.dryRun === true && updateDry.result.wouldUpdate === 2, "bulkUpdate dryRun 预览数量不对");
  assert((await call("tasks.get", { id })).result.task.status === "0", "bulkUpdate dryRun 污染了数据");
  assert(updateDry.result.changes.every((c) => c.changes.priority && c.changes.priority.to === 0), "bulkUpdate 改成 DONE 时优先级未清零：" + JSON.stringify(updateDry.result.changes));
  const updateReal = await call("tasks.bulkUpdate", { ids: [id, p9.result.id], patch: { status: "done", priority: 7 } });
  assert(updateReal.result.updated === 2, "bulkUpdate real 数量不对");
  const afterUpdate = await call("tasks.get", { id });
  assert(afterUpdate.result.task.status === "2" && afterUpdate.result.task.priority === 0, "已完成任务优先级应为 0，实际 " + afterUpdate.result.task.priority);

  // ── 5.0 已完成任务优先级自动清零：创建、单条更新、已完成后再加优先级都不例外 ──
  const doneOnCreate = await call("tasks.create", { title: "直接建成就完成", status: "2", priority: 9 });
  assert(doneOnCreate.result.task.priority === 0, "创建时就是 DONE 也应清零优先级");
  const bumpDone = await call("tasks.update", { id: doneOnCreate.result.id, type: "PRIORITY", priority: 8 });
  assert(bumpDone.result.task.priority === 0, "已完成任务不该能加回优先级");
  const reopened = await call("tasks.update", { id: doneOnCreate.result.id, type: "STATUS", status: "0" });
  assert(reopened.result.task.status === "0", "已完成后可以重新激活");
  const reprioritized = await call("tasks.update", { id: doneOnCreate.result.id, type: "PRIORITY", priority: 6 });
  assert(reprioritized.result.task.priority === 6, "重新激活后可以设置优先级");
  const recompleted = await call("tasks.update", { id: doneOnCreate.result.id, type: "STATUS", status: "2" });
  assert(recompleted.result.task.priority === 0, "再次完成后优先级应清零");

  // ── 5.1 完成感受：STATUS 带 review、REVIEW 单独更新、patch 写入 ──
  const doneWithReview = await call("tasks.update", { id: p9.result.id, type: "STATUS", status: "2", difficulty: 3.5, review: "顺利完成" });
  assert(doneWithReview.result.task.review === "顺利完成", "tasks.update STATUS 未写入 review");
  const reviewEdit = await call("tasks.update", { id: p9.result.id, type: "REVIEW", review: "后来补充：卡在调试" });
  assert(reviewEdit.result.task.review === "后来补充：卡在调试", "tasks.update REVIEW 未更新 review");
  const reviewPatch = await call("tasks.bulkUpdate", { ids: [p9.result.id], patch: { review: "patch 感受" } });
  assert(reviewPatch.result.updated === 1 && (await call("tasks.get", { id: p9.result.id })).result.task.review === "patch 感受", "bulkUpdate patch 未写入 review");

  // ── 5.2 标题重命名：任何状态都能改 ──
  const renameDone = await call("tasks.update", { id: p9.result.id, type: "TITLE", title: "已完成也能改名" });
  assert(renameDone.result.task.title === "已完成也能改名" && renameDone.result.task.status === "2", "done 任务不能重命名");
  const closed = await call("tasks.create", { title: "待关闭任务", priority: 2 });
  await call("tasks.update", { id: closed.result.id, type: "STATUS", status: "1" });
  const renameClosed = await call("tasks.update", { id: closed.result.id, type: "TITLE", title: "已关闭也能改名" });
  assert(renameClosed.result.task.title === "已关闭也能改名" && renameClosed.result.task.status === "1", "shutdown 任务不能重命名");
  const restart = await call("tasks.create", { title: "重启链新任务", source: 2, restartKey: closed.result.id });
  assert((await call("tasks.get", { id: closed.result.id })).result.task.status === "3", "重启后原任务未标记 RESTARTED");
  const renameRestarted = await call("tasks.update", { id: closed.result.id, type: "TITLE", title: "重启任务也能改名" });
  assert(renameRestarted.result.task.title === "重启任务也能改名", "restarted 任务不能重命名");
  assert(restart.result.task.status === "0", "重启产出任务状态不对");
  const freeRename = await call("tasks.update", { id: id, title: "自由字段改名" });
  assert(freeRename.result.task.title === "自由字段改名", "省略 type 直接传 title 未生效");
  let blankTitle = null;
  try { await call("tasks.update", { id: id, type: "TITLE", title: "  " }); } catch (e) { blankTitle = e; }
  assert(blankTitle, "空标题未被拒绝");
  let missingIdErr = null;
  try { await call("tasks.bulkUpdate", { ids: ["no-such"], patch: { priority: 1 } }); } catch (e) { missingIdErr = e; }
  assert(missingIdErr, "bulkUpdate 对不存在 id 未报错");
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
  const groupedTag = await call("tasks.stats", { groupBy: "tag" });
  assert(Array.isArray(groupedTag.result.groups) && groupedTag.result.groupBy === "tag", "stats groupBy=tag 失败");

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
  // 自定义起止日期：闭区间 [from, to]，两端都计入
  const pad2 = (n) => String(n).padStart(2, "0");
  const dayOf = (d) => d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  const todayD = new Date();
  const back2D = new Date(todayD.getFullYear(), todayD.getMonth(), todayD.getDate() - 2);
  const dayFrom = dayOf(back2D);
  const dayTo = dayOf(todayD);
  const custom = await call("tasks.statsReport", { from: dayFrom, to: dayTo });
  assert(custom.result.range.from === dayFrom && custom.result.range.to === dayTo, "tasks.statsReport 未回显自定义 from/to");
  assert(custom.result.trend.length === 3, "自定义区间应为闭区间：3 天应产生 3 个趋势点");
  assert(custom.result.trend[0].bucket === dayFrom && custom.result.trend[2].bucket === dayTo, "自定义区间首尾日期不算入区间");
  const customTag = await call("tags.statsReport", { from: dayFrom, to: dayTo });
  assert(customTag.result.range.from === dayFrom && customTag.result.range.to === dayTo, "tags.statsReport 未接受 from/to");
  assert(customTag.result.trend.length === 3, "tags 自定义区间应为闭区间");
  const customSite = await call("sites.statsReport", { from: dayFrom, to: dayTo });
  assert(customSite.result.range.from === dayFrom && customSite.result.range.to === dayTo, "sites.statsReport 未接受 from/to");
  assert(customSite.result.trend.length === 3, "sites 自定义区间应为闭区间");
  let customOrderErr = null;
  try { await call("tasks.statsReport", { from: dayTo, to: dayFrom }); } catch (e) { customOrderErr = e; }
  assert(customOrderErr, "from 晚于 to 应被拒绝");
  let customHalfErr = null;
  try { await call("tags.statsReport", { from: dayFrom }); } catch (e) { customHalfErr = e; }
  assert(customHalfErr, "只提供 from 应被拒绝");
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

  // ── 15.5 历史数据：ensureSchema 一次性把已完成任务的优先级清零 ──
  {
    const { ensureSchema } = await import("../packages/addons/tasks/lib/db.js");
    const raw = new DatabaseSync(":memory:");
    ensureSchema(raw, () => {});
    const stamp = Date.now();
    raw.prepare(
      "INSERT INTO task(id,title,description,status,priority,difficulty,review,table_id,timeline_key,restart_key,publish_date,target_date,done_date,shutdown_date,sort,dedupe_key,created_at,updated_at,deleted_at,rev) " +
        "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    ).run("t-done", "历史已完成任务", "", "2", 8, null, "", "1", null, null, "2026-11-01", "2026-11-02", "2026-11-02", null, 0, null, stamp, stamp, null, 1);
    // 模拟升级前的库：老数据还没扫过，清掉标记让 ensureSchema 再跑一次迁移。
    raw.prepare("DELETE FROM meta WHERE k='done_priority_cleared'").run();
    const migrated = ensureSchema(raw, () => {});
    assert(migrated.donePriorityCleared === 1, "迁移报告未记录清零条数：" + JSON.stringify(migrated));
    assert(Number(raw.prepare("SELECT priority FROM task WHERE id='t-done'").get().priority) === 0, "历史已完成任务优先级未清零");
    assert(raw.prepare("SELECT v FROM meta WHERE k='done_priority_cleared'").get(), "清零标记未写入 meta");
    raw.close();
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
