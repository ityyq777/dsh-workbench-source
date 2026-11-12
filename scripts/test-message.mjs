/**
 * 消息插件回归测试（不启动 DSH）：
 * 域注册契约（sync 为空、不参与备份）、发送与校验、幂等去重、收件箱过滤与分页、
 * 标记已读、未读计数、统计口径、数据页只读查询、Action 清单自证、保留期清理。
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const home = mkdtempSync(join(tmpdir(), "wb-message-"));
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

async function expectFail(action, args, needle) {
  let error = null;
  try {
    await call(action, args);
  } catch (e) {
    error = e;
  }
  assert(error, action + " 应该报错");
  assert(String(error.message).includes(needle), action + " 报错文案应含「" + needle + "」，实际：" + error.message);
}

let failed = false;
try {
  const shell = await import("../packages/shell/lib/index.js");
  shell.apply(fakeCtx);
  if (!host) throw new Error("workbench service not provided");
  const message = await import("../packages/addons/message/lib/index.js");
  message.apply({ workbench: host, effect: fakeCtx.effect });

  // 1. 域注册契约：只有一张表，同步为空，不参与备份。
  const domains = host.listDomains();
  const domain = domains.find((d) => d.id === "wb-addon-message");
  assert(domain, "消息域应已注册");
  assert(domain.version === "0.1.0", "版本应为 0.1.0");
  assert(domain.tables.length === 1 && domain.tables[0] === "message", "只声明 message 一张表");
  assert(Array.isArray(domain.sync?.tables) && domain.sync.tables.length === 0, "sync.tables 必须显式为空的");
  assert(domain.backup?.export === false && domain.backup?.import === false, "消息不进备份");
  assert(domain.views.map((v) => v.id).join(",") === "stats,inbox,config,data,actions", "视图顺序固定");

  // 2. 发送：默认值、返回体与清单字段。
  const sent = (await call("message.send", { title: "备份完成", body: "导出 18 个域", level: "success", source: "host" })).result;
  assert(sent.deduped === false, "首次发送不应去重");
  assert(sent.message.title === "备份完成" && sent.message.level === "success", "标题/级别写入");
  assert(sent.message.audience === "all", "audience 默认 all");
  assert(sent.message.read === false && sent.message.readAt === null, "新消息未读");
  const firstId = sent.message.id;

  // 3. 校验：必填、枚举、长度。
  await expectFail("message.send", {}, "title 必填");
  await expectFail("message.send", { title: "   " }, "title 不能为空");
  await expectFail("message.send", { title: "x", level: "fatal" }, "level 只接受");
  await expectFail("message.send", { title: "x".repeat(121) }, "不能超过 120");
  await expectFail("message.send", { title: "x", audience: "nobody" }, "audience 只接受");
  await expectFail("message.send", { title: "x", meta: "y".repeat(2001) }, "不能超过 2000 字节");

  // 4. 幂等去重：同 dedupeKey 只保留一条。
  const d1 = (await call("message.send", { title: "同步失败", level: "error", dedupeKey: "sync-1" })).result;
  const d2 = (await call("message.send", { title: "同步失败（重试）", level: "error", dedupeKey: "sync-1" })).result;
  assert(d2.deduped === true, "同 dedupeKey 应命中已有");
  assert(d2.message.id === d1.message.id, "去重返回同一条");
  assert(d2.message.title === "同步失败", "去重不覆盖原标题");

  // 5. 收件箱：分页、未读过滤、级别/关键词/来源过滤。
  await call("message.send", { title: "磁盘告警", body: "剩余 5%", level: "warning", source: "sites" });
  await call("message.send", { title: "给 agent 的提示", level: "info", audience: "agent" });
  const all = (await call("message.list", { pageSize: 2 })).result;
  assert(all.total === 4, "应有 4 条消息，实际 " + all.total);
  assert(all.records.length === 2 && all.pageNumber === 1, "第一页取 2 条");
  assert(all.records[0].title === "给 agent 的提示", "按创建时间倒序");
  const page2 = (await call("message.list", { pageSize: 2, pageNumber: 2 })).result;
  assert(page2.records.length === 2 && page2.records[0].id !== all.records[0].id, "第二页不重复");
  assert((await call("message.list", { level: "warning" })).result.total === 1, "按级别过滤");
  assert((await call("message.list", { source: "sites" })).result.total === 1, "按来源过滤");
  assert((await call("message.list", { audience: "agent" })).result.total === 1, "按收件人过滤");
  assert((await call("message.list", { text: "磁盘" })).result.total === 1, "关键词命中标题");
  assert((await call("message.list", { text: "导出" })).result.total === 1, "关键词命中正文");

  // 6. 未读计数与标记已读。
  const unread0 = (await call("message.unreadCount", {})).result;
  assert(unread0.unread === 4, "初始 4 条未读，实际 " + unread0.unread);
  assert(unread0.latest && unread0.latest.title === "给 agent 的提示", "最新未读为最后一条");
  const marked = (await call("message.markRead", { ids: [firstId] })).result;
  assert(marked.updated === 1 && marked.unread === 3, "标记单条已读");
  const listed = (await call("message.list", { unreadOnly: true })).result;
  assert(listed.total === 3, "未读过滤应为 3 条");
  const markedAll = (await call("message.markRead", { all: true })).result;
  assert(markedAll.updated === 3 && markedAll.unread === 0, "全部标记已读");
  await expectFail("message.markRead", {}, "需要 ids、all:true 或 before");

  // 7. 统计口径：总量 = 未读 + 已读，趋势覆盖 days 天。
  const stats = (await call("message.stats", { days: 7 })).result;
  assert(stats.totals.total === 4, "统计总量 4");
  assert(stats.totals.unread === 0 && stats.totals.read === 4, "统计未读/已读");
  assert(stats.trend.length === 7, "趋势 7 天");
  assert(stats.trend[stats.trend.length - 1].count === 4, "今天桶应有 4 条");
  assert(stats.byLevel.find((x) => x.level === "error").total === 1, "级别分布含 error 1 条");
  assert(stats.bySource.find((x) => x.source === "sites").total === 1, "来源分布含 sites");
  assert(stats.oldestUnread === null, "全部已读后没有最早未读");

  // 8. 配置：默认值、写入、恢复默认。
  const cfg = (await call("message.configGet", {})).result;
  assert(cfg.values["sound.enabled"] === true, "提示音默认开");
  assert(cfg.values["retention.readDays"] === 30, "已读保留默认 30 天");
  assert(cfg.items.length === 9, "配置项 9 条，实际 " + cfg.items.length);
  const set = (await call("message.configSet", { values: { "sound.enabled": false } })).result;
  assert(set.values["sound.enabled"] === false, "写入后回读为 false");
  assert(set.state.overrides["sound.enabled"] === false, "overrides 记录覆盖项");
  await expectFail("message.configSet", { values: { "quiet.from": "25:99" } }, "需要 HH:MM");
  const reset = (await call("message.configReset", {})).result;
  assert(reset.values["sound.enabled"] === true, "恢复默认后回到 true");

  // 9. 保留期清理：已读且早于 readDays 的消息在下次发送时被物理删除。
  await call("message.configSet", { values: { "retention.readDays": 7 } });
  const db = host.db;
  const old = (await call("message.send", { title: "很久以前的已读" })).result.message;
  await call("message.markRead", { ids: [old.id] });
  db.prepare("UPDATE message SET read_at=? WHERE id=?").run(Date.now() - 8 * 86400000, old.id);
  const afterSend = (await call("message.send", { title: "触发清理" })).result;
  assert(afterSend.pruned >= 1, "应清理至少 1 条过期已读，实际 " + afterSend.pruned);
  const ids = (await call("message.list", { pageSize: 100 })).result.records.map((m) => m.id);
  assert(ids.indexOf(old.id) < 0, "过期已读消息应被物理删除");
  assert(ids.indexOf(firstId) >= 0, "未过期已读消息保留");

  // 10. 数据页：表清单与只读查询（表名白名单）。
  const tables = (await call("message.dataTables", {})).result;
  assert(tables.tables.length === 1 && tables.tables[0].count >= 4, "数据页有一张表且有行数");
  assert(tables.tables[0].columns.some((c) => c.name === "dedupe_key"), "列元信息含 dedupe_key");
  const query = (await call("message.dataQuery", { table: "message", page: 1, pageSize: 2, search: "清理" })).result;
  assert(query.total === 1 && query.rows.length === 1, "只读查询能命中");
  assert(query.columns.length > 0, "查询返回列定义");
  await expectFail("message.dataQuery", { table: "task" }, "未知数据表");

  // 11. Action 清单自证：注册了 10 个 action，且能被 schema 快照读到。
  const schema = (await call("message.actionSchema", {})).result;
  const names = (schema.actions || []).map((a) => a.name);
  for (const name of ["message.send", "message.list", "message.unreadCount", "message.markRead", "message.stats", "message.configGet", "message.configSet", "message.configReset", "message.dataTables", "message.dataQuery", "message.actionSchema"]) {
    assert(names.indexOf(name) >= 0 || name === "message.actionSchema", "actionSchema 应包含 " + name);
  }

  // 12. 子插件调用路径：host.invoke 与 UI 来源同样可用（解耦只靠 action 契约）。
  const viaUi = await host.invoke("message.send", { title: "来自子插件", source: "tasks" }, "ui");
  assert(viaUi.result.message.source === "tasks", "跨插件调用可写入来源");

  console.log("MESSAGE TEST PASS");
  console.log(JSON.stringify({ total: (await call("message.list", {})).result.total, domains: domains.length }, null, 2));
} catch (e) {
  failed = true;
  console.error("MESSAGE TEST FAIL:", e && e.message);
  if (e && e.stack) console.error(e.stack);
} finally {
  for (const fn of cleanups) {
    try {
      fn();
    } catch {
      /* ignore */
    }
  }
  rmSync(home, { recursive: true, force: true });
}
if (failed) process.exit(1);
