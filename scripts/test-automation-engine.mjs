/**
 * 自动化引擎（宿主内置）行为测试。
 *
 * 原 packages/addons/automation/test/automation.test.mjs 搬到宿主后：
 * 建表改由 @wb/core 的 openDb（宿主平台表 automation_rule/run/meta），
 * 引擎改为 packages/shell/src/infra/automation，调用入口从 host.call 换成 invoke。
 */
import { test } from "node:test";
import assert from "node:assert/strict";

const { openDb } = await import("../packages/core/lib/index.js");
const { createAutomation } = await import("../packages/shell/lib/infra/automation/index.js");

const DEFAULT_ALLOW = ["message.send", "tasks.create", "tags.create", "sites.create", "connector.sourceRun"];

// 允许清单默认空，测试按需显式启用，避免依赖隐式授权。
function make(allow = DEFAULT_ALLOW, options = {}) {
  // 宿主平台表由 core schema 建：自动化三张表已内化进 @wb/core。
  const db = openDb(":memory:");
  const calls = [];
  const invoke = async (action, args) => {
    calls.push({ action, args });
    return { result: { ok: true, action } };
  };
  const engine = createAutomation({
    db,
    invoke,
    getSchedule: options.getSchedule || (() => null),
    hasDomain: options.hasDomain || (() => true),
  });
  if (allow.length) engine.saveConfig({ allowedActions: allow });
  return { db, engine, calls };
}

/** 宿主 schedule 的替身：只实现工作台用到的六个方法。 */
function makeSchedule() {
  const tasks = new Map();
  const created = [];
  let seq = 0;
  const stamp = () => "2030-01-01T09:00:00Z";
  return {
    created,
    tasks,
    async create(request) {
      const id = "sched_" + ++seq;
      const entry = {
        status: "active",
        target: request.target || { kind: "new_once" },
        record: { id, kind: request.timing.kind, title: request.title, prompt: request.prompt, scheduledAt: stamp() },
        updatedAt: "2030-01-01T00:00:00Z",
      };
      tasks.set(id, entry);
      created.push(request);
      return entry;
    },
    async edit(request) {
      const entry = tasks.get(request.id);
      if (!entry) return { id: request.id, code: "schedule_not_found" };
      if (request.action === "delete") {
        tasks.delete(request.id);
        return { id: request.id, action: "delete" };
      }
      const patch = request.patch || {};
      if (patch.title) entry.record.title = patch.title;
      if (patch.prompt) entry.record.prompt = patch.prompt;
      if (patch.active === false) entry.status = "paused";
      if (patch.active === true) entry.status = "active";
      return entry;
    },
    async catalog() {
      return [...tasks.values()];
    },
    async run(request) {
      const entry = tasks.get(request.id);
      if (!entry) return { id: request.id, code: "schedule_not_found" };
      return entry;
    },
    async history(request) {
      return { id: request.id, records: [{ deliveredAt: stamp() }], earlierRecordsUnavailable: false, earlierRecordsPruned: false };
    },
    deliveryLimits() {
      return { newSessionIntervalSeconds: 60 };
    },
  };
}

const wait = () => new Promise((resolve) => setTimeout(resolve, 20));

const AGENT = {
  prompt: "汇总今天的任务并提醒我",
  timing: { kind: "daily", daily: { time: "09:00", time_zone: "Asia/Shanghai" } },
  target: { kind: "new_once" },
};

test("手动规则渲染模板并调用白名单 action", async () => {
  const { engine, calls } = make();
  const rule = await engine.createRule({
    name: "问候",
    triggerType: "manual",
    actionName: "message.send",
    actionArgs: { title: "Hi {{item.title}}", body: "规则 {{rule.name}}" },
  });
  const out = await engine.runRule(rule.id, "manual", { item: { title: "世界" } });
  assert.equal(out.ok, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].action, "message.send");
  assert.equal(calls[0].args.title, "Hi 世界");
  assert.equal(calls[0].args.body, "规则 问候");
  assert.equal(engine.stats().total, 1);
});

test("条件不满足记 skipped 且不调用 action", async () => {
  const { engine, calls } = make();
  const rule = await engine.createRule({
    name: "只有高优先级",
    triggerType: "manual",
    actionName: "message.send",
    actionArgs: { title: "x" },
    condition: { field: "event.item.title", op: "contains", value: "重要" },
  });
  const out = await engine.runRule(rule.id, "manual", { item: { title: "普通" } });
  assert.equal(out.skipped, true);
  assert.equal(calls.length, 0);
  assert.equal(engine.runList({})[0].status, "skipped");
});

test("事件规则按 domainId/event 匹配", async () => {
  const { engine, calls } = make();
  await engine.createRule({
    name: "连接器新内容",
    triggerType: "event",
    triggerConfig: { kind: "event", domainId: "wb-addon-connector", event: "item.created" },
    actionName: "message.send",
    actionArgs: { title: "{{item.title}}", body: "{{item.url}}" },
  });
  engine.onEvent({ domainId: "other", event: "item.created", data: { item: { title: "no" } } });
  engine.onEvent({ domainId: "wb-addon-connector", event: "item.created", data: { item: { title: "新闻", url: "https://e.test" } } });
  await wait();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].args.title, "新闻");
});

test("拒绝 vault 与删除类 action", async () => {
  const { engine } = make();
  await assert.rejects(engine.createRule({ name: "坏", actionName: "vault.secretReveal" }), /不允许/);
  await assert.rejects(engine.createRule({ name: "坏", actionName: "tasks.delete" }), /不允许/);
  await assert.rejects(engine.createRule({ name: "坏", actionName: "unknown.action" }), /未在设置中启用/);
});

test("默认不允许任何 action，勾选后才能创建规则", async () => {
  const { engine } = make([]);
  assert.deepEqual(engine.config().allowedActions, []);
  await assert.rejects(engine.createRule({ name: "空", actionName: "message.send" }), /未在设置中启用/);
  engine.saveConfig({ allowedActions: ["message.send"] });
  const rule = await engine.createRule({ name: "勾选后", triggerType: "manual", actionName: "message.send" });
  assert.equal(rule.actionName, "message.send");
});

test("允许清单去重排序，硬底线与非法名写入被拒", () => {
  const { engine } = make([]);
  const saved = engine.saveConfig({ allowedActions: ["tasks.create", "message.send", "tasks.create"] });
  assert.deepEqual(saved.allowedActions, ["message.send", "tasks.create"]);
  assert.throws(() => engine.saveConfig({ allowedActions: ["vault.secretReveal"] }), /不允许/);
  assert.throws(() => engine.saveConfig({ allowedActions: ["automation.ruleRun"] }), /不允许/);
  assert.throws(() => engine.saveConfig({ allowedActions: ["not a name"] }), /不合法/);
  assert.throws(() => engine.saveConfig({ allowedActions: ["tasks.delete"] }), /不允许/);
});

test("收紧配置后老规则执行记 skipped 且不调用 action", async () => {
  const { engine, calls } = make();
  const rule = await engine.createRule({ name: "老规则", triggerType: "manual", actionName: "message.send", actionArgs: { title: "x" } });
  engine.saveConfig({ allowedActions: [] });
  const out = await engine.runRule(rule.id);
  assert.equal(out.skipped, true);
  assert.equal(out.reason, "disabled");
  assert.equal(calls.length, 0);
  assert.equal(engine.runList({})[0].status, "skipped");
  assert.equal(engine.stats().staleCount, 1);
});

test("导出只含规则，导入按 id 跳过", async () => {
  const { engine } = make();
  const rule = await engine.createRule({ name: "导出", triggerType: "manual", actionName: "message.send" });
  const out = engine.exportData();
  assert.equal(out.rules.length, 1);
  assert.equal(out.runs, undefined);
  // 宿主交给域的是一段 JSON 文本，导入必须能解析字符串。
  const imported = await engine.importData(JSON.stringify(out));
  assert.equal(imported.imported, 0);
  assert.equal(imported.skipped, 1);
  assert.ok(rule.id);
});

test("导入新机器的规则会重新创建", async () => {
  const source = make();
  await source.engine.createRule({ name: "要去备份的", triggerType: "manual", actionName: "message.send", actionArgs: { title: "x" } });
  const exported = await source.engine.exportData();
  const target = make();
  const report = await target.engine.importData(JSON.stringify(exported));
  assert.equal(report.imported, 1);
  assert.equal(target.engine.listRules().length, 1);
});

test("定时规则到期后执行并重算下一次", async () => {
  const { db, engine, calls } = make();
  const rule = await engine.createRule({ name: "定时", triggerType: "interval", triggerConfig: { kind: "interval", everyMinutes: 60 }, actionName: "message.send", actionArgs: { title: "tick" } });
  db.prepare("UPDATE automation_rule SET next_run_at=? WHERE id=?").run(Date.now() - 1000, rule.id);
  await engine.tick();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].args.title, "tick");
  const after = db.prepare("SELECT next_run_at,last_status FROM automation_rule WHERE id=?").get(rule.id);
  assert.ok(after.next_run_at > Date.now());
  assert.equal(after.last_status, "ok");
});

test("AI 规则把定时交给宿主并保留本地快照", async () => {
  const schedule = makeSchedule();
  const { engine, calls } = make(DEFAULT_ALLOW, { getSchedule: () => schedule });
  const rule = await engine.createRule({ name: "每日汇总", execMode: "agent", agent: AGENT });
  assert.equal(rule.execMode, "agent");
  assert.ok(rule.scheduleId);
  assert.equal(schedule.created.length, 1);
  assert.equal(schedule.created[0].title, "每日汇总");
  assert.equal(schedule.created[0].prompt, AGENT.prompt);
  assert.equal(schedule.created[0].timing.kind, "daily");
  // AI 规则不进本地执行队列，也不会调用 workbench action。
  assert.equal(calls.length, 0);
  const live = await engine.listRulesLive();
  assert.equal(live[0].scheduleStatus, "active");
  assert.equal(live[0].enabled, true);
  assert.equal(live[0].agent.scheduledAt, "2030-01-01T09:00:00Z");
});

test("宿主没有 schedule 时拒绝创建 AI 规则", async () => {
  const { engine } = make();
  await assert.rejects(engine.createRule({ name: "无宿主", execMode: "agent", agent: AGENT }), /自动化任务/);
  assert.equal(engine.listRules().length, 0);
});

test("AI 规则校验时间与提示词", async () => {
  const schedule = makeSchedule();
  const { engine } = make(DEFAULT_ALLOW, { getSchedule: () => schedule });
  await assert.rejects(
    engine.createRule({ name: "太快", execMode: "agent", agent: { ...AGENT, timing: { kind: "every", every_seconds: 30 } } }),
    /不能小于 1 分钟/,
  );
  await assert.rejects(engine.createRule({ name: "空", execMode: "agent", agent: { ...AGENT, prompt: "  " } }), /提示词/);
  await assert.rejects(
    engine.createRule({ name: "无星期", execMode: "agent", agent: { ...AGENT, timing: { kind: "weekly", weekly: { time: "09:00", time_zone: "Asia/Shanghai", weekdays: [] } } } }),
    /至少选择一个星期/,
  );
  assert.equal(schedule.created.length, 0);
});

test("AI 规则暂停、立即执行与删除都转发给宿主", async () => {
  const schedule = makeSchedule();
  const { engine } = make(DEFAULT_ALLOW, { getSchedule: () => schedule });
  const rule = await engine.createRule({ name: "转发", execMode: "agent", agent: AGENT });
  const paused = await engine.updateRule({ id: rule.id, enabled: false });
  assert.equal(paused.enabled, false);
  assert.equal(schedule.tasks.get(rule.scheduleId).status, "paused");
  const out = await engine.runRule(rule.id);
  assert.equal(out.ok, true);
  assert.equal(out.delivered, true);
  await engine.deleteRule(rule.id);
  assert.equal(schedule.tasks.has(rule.scheduleId), false);
  assert.equal(engine.listRules().length, 0);
});

test("AI 规则不能切换执行方式", async () => {
  const schedule = makeSchedule();
  const { engine } = make(DEFAULT_ALLOW, { getSchedule: () => schedule });
  const rule = await engine.createRule({ name: "锁定", execMode: "agent", agent: AGENT });
  await assert.rejects(engine.updateRule({ id: rule.id, execMode: "action" }), /不能切换执行方式/);
});

test("宿主任务被删除后列表标记为缺失", async () => {
  const schedule = makeSchedule();
  const { engine } = make(DEFAULT_ALLOW, { getSchedule: () => schedule });
  const rule = await engine.createRule({ name: "丢任务", execMode: "agent", agent: AGENT });
  schedule.tasks.delete(rule.scheduleId);
  const live = await engine.listRulesLive();
  assert.equal(live[0].scheduleMissing, true);
  assert.equal(live[0].enabled, false);
});

// ── 内置自动化规则（DomainDef.automations）──

/** 一条邮件域内置规则：每天 09:00 汇总未读，只读 mail.messageList。 */
const MAIL_DECL = {
  key: "daily-unread-digest",
  title: "每天 09:00 汇总未读邮件",
  trigger: { kind: "dailyAt", time: "09:00", tz: "Asia/Shanghai" },
  action: { name: "mail.messageList", args: { unread: true, limit: 20 } },
  defaultEnabled: true,
  editableArgs: true,
};

/** 带内置规则的引擎：域 wb-addon-mail 视为已安装。 */
function makeBuiltin(options = {}) {
  const ctx = make(options.allow || DEFAULT_ALLOW, options);
  const installed = new Set(options.installed || ["wb-addon-mail"]);
  // hasDomain 在 make 里注入，这里换成一个可变的集合，模拟卸载/重装。
  return Object.assign(ctx, { installed });
}

/** 注册 mail 域的内置规则（默认带 mail.messages-synced 订阅声明）。 */
function registerMail(ctx, decls = [MAIL_DECL], version = "0.6.5") {
  return ctx.engine.registerBuiltin({
    domainId: "wb-addon-mail",
    domainVersion: version,
    decls,
    subscriptions: [{ type: "mail.messages-synced" }],
  });
}

test("内置规则注册即建规则：稳定 id、标记来源、重复注册幂等", () => {
  const ctx = make();
  const out = registerMail(ctx);
  assert.deepEqual(out.registered, ["daily-unread-digest"]);
  const rules = ctx.engine.listRules();
  assert.equal(rules.length, 1);
  const rule = rules[0];
  assert.equal(rule.id, "auto:wb-addon-mail:daily-unread-digest");
  assert.equal(rule.origin, "plugin");
  assert.equal(rule.ownerDomain, "wb-addon-mail");
  assert.equal(rule.ruleKey, "daily-unread-digest");
  assert.equal(rule.enabled, true);
  assert.equal(rule.triggerType, "schedule");
  assert.equal(rule.triggerConfig.kind, "dailyAt");
  assert.equal(rule.actionName, "mail.messageList");
  assert.equal(rule.originState, "active");

  registerMail(ctx);
  assert.equal(ctx.engine.listRules().length, 1);
  assert.equal(ctx.db.prepare("SELECT COUNT(*) AS n FROM automation_rule").get().n, 1);
});

test("内置规则只能调用本域 action：跨域声明直接报错且不落库", () => {
  const ctx = make();
  assert.throws(
    () =>
      registerMail(ctx, [
        { ...MAIL_DECL, key: "cross", action: { name: "tasks.create", args: { title: "x" } } },
      ]),
    /只能调用声明方本域 action/,
  );
  assert.equal(ctx.db.prepare("SELECT COUNT(*) AS n FROM automation_rule").get().n, 0);
});

test("事件触发的内置规则必须已在 DomainDef.events.subscriptions 声明", () => {
  const ctx = make();
  assert.throws(
    () =>
      registerMail(ctx, [
        { ...MAIL_DECL, key: "on-sync", trigger: { kind: "event", event: "mail.messages-deleted" } },
      ]),
    /未在 DomainDef\.events\.subscriptions 声明/,
  );
  // 声明过的类型可以用，且事件触发落成 domainId + event。
  registerMail(ctx, [
    { ...MAIL_DECL, key: "on-sync", trigger: { kind: "event", event: "mail.messages-synced" } },
  ]);
  const rule = ctx.engine.listRules().find((r) => r.ruleKey === "on-sync");
  assert.equal(rule.triggerType, "event");
  assert.deepEqual(rule.triggerConfig, { kind: "event", domainId: "wb-addon-mail", event: "mail.messages-synced" });
});

test("内置规则可停用，重启后启用状态保持；定义字段不可改、不可删", async () => {
  const ctx = make();
  registerMail(ctx);
  const rule = ctx.engine.listRules()[0];
  // 用户停用
  const off = await ctx.engine.updateRule({ id: rule.id, enabled: false });
  assert.equal(off.enabled, false);
  // 重启引擎（同一库）后重新声明：状态保持停用
  const again = createAutomation({ db: ctx.db, invoke: async () => ({ result: {} }), hasDomain: () => true });
  registerMail({ engine: again });
  assert.equal(again.listRules()[0].enabled, false);
  // 触发方式 / action / 条件不可改
  await assert.rejects(
    again.updateRule({ id: rule.id, triggerConfig: { kind: "interval", everyMinutes: 5 } }),
    /内置规则由插件声明，不能修改 triggerConfig/,
  );
  await assert.rejects(again.updateRule({ id: rule.id, actionName: "mail.accountList" }), /不能修改 actionName/);
  await assert.rejects(again.updateRule({ id: rule.id, condition: { field: "a", op: "eq", value: 1 } }), /不能修改 condition/);
  // editableArgs 允许改参数
  const changed = await again.updateRule({ id: rule.id, actionArgs: { unread: true, limit: 5 } });
  assert.deepEqual(changed.actionArgs, { unread: true, limit: 5 });
  // 不能删
  await assert.rejects(again.deleteRule(rule.id), /内置规则由插件声明，不能删除/);
});

test("内置规则可手动运行：执行入口只调本域 action", async () => {
  const ctx = make();
  registerMail(ctx);
  const rule = ctx.engine.listRules()[0];
  const out = await ctx.engine.runRule(rule.id);
  assert.equal(out.ok, true);
  assert.equal(ctx.calls.length, 1);
  assert.equal(ctx.calls[0].action, "mail.messageList");
  assert.equal(ctx.calls[0].args.limit, 20);
});

test("声明消失时停用并标「插件已不再声明」，重新声明后恢复原启用状态", () => {
  const ctx = make();
  registerMail(ctx, [MAIL_DECL]);
  const out = ctx.engine.registerBuiltin({
    domainId: "wb-addon-mail",
    domainVersion: "0.6.5",
    decls: [],
    subscriptions: [],
  });
  assert.deepEqual(out.paused, ["daily-unread-digest"]);
  const stale = ctx.engine.listRules()[0];
  assert.equal(stale.enabled, false);
  assert.equal(stale.originState, "stale");
  // 重新声明：恢复停用前的启用状态
  registerMail(ctx, [MAIL_DECL]);
  const back = ctx.engine.listRules()[0];
  assert.equal(back.enabled, true);
  assert.equal(back.originState, "active");
});

test("插件卸载后内置规则不再调度并标「插件已卸载」", async () => {
  const ctx = make();
  let installed = true;
  const engine = createAutomation({
    db: ctx.db,
    invoke: async (action, args) => {
      ctx.calls.push({ action, args });
      return { result: { ok: true } };
    },
    hasDomain: () => installed,
  });
  registerMail({ engine });
  const rule = engine.listRules()[0];
  // 把下次运行时间改到过去，触发一次 tick
  ctx.db.prepare("UPDATE automation_rule SET next_run_at=0 WHERE id=?").run(rule.id);
  await engine.tick();
  assert.equal(ctx.calls.length, 1);
  installed = false;
  ctx.db.prepare("UPDATE automation_rule SET next_run_at=0 WHERE id=?").run(rule.id);
  await engine.tick();
  assert.equal(ctx.calls.length, 1, "卸载后不应再调度");
  const off = engine.listRules()[0];
  assert.equal(off.originState, "uninstalled");
});

test("备份只导出内置规则的定义外覆盖：启用状态与参数可导入生效", async () => {
  const ctx = make();
  registerMail(ctx);
  const rule = ctx.engine.listRules()[0];
  await ctx.engine.updateRule({ id: rule.id, enabled: false, actionArgs: { unread: true, limit: 3 } });
  const dump = ctx.engine.exportData();
  assert.equal(dump.rules.length, 0, "内置规则定义不进备份");
  assert.equal(dump.builtin.length, 1);
  assert.equal(dump.builtin[0].ownerDomain, "wb-addon-mail");
  assert.equal(dump.builtin[0].enabled, false);
  assert.deepEqual(dump.builtin[0].actionArgs, { unread: true, limit: 3 });

  // 新库：先导入（插件没装时覆盖保留），再注册声明，覆盖自动生效。
  const fresh = openDb(":memory:");
  const engine2 = createAutomation({ db: fresh, invoke: async () => ({ result: {} }), hasDomain: () => true });
  const result = await engine2.importData({ rules: [], builtin: dump.builtin });
  assert.equal(result.builtinApplied, 0);
  registerMail({ engine: engine2 });
  const restored = engine2.listRules()[0];
  assert.equal(restored.enabled, false);
  assert.deepEqual(restored.actionArgs, { unread: true, limit: 3 });
});

test("旧库升级后所有规则 origin 回填 user，统计按来源拆分", () => {
  const ctx = make();
  // 模拟历史用户规则：省略 origin，落库走默认值。
  ctx.db
    .prepare(
      "INSERT INTO automation_rule(id,name,enabled,trigger_type,trigger_config,action_name,action_args,next_run_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)",
    )
    .run("rule_old", "老规则", 1, "manual", '{"kind":"manual"}', "mail.messageList", "{}", null, 1, 1);
  const old = ctx.engine.listRules().find((r) => r.id === "rule_old");
  assert.equal(old.origin, "user");
  assert.equal(old.ownerDomain, "");
  registerMail(ctx);
  const stats = ctx.engine.stats();
  assert.equal(stats.userRules, 1);
  assert.equal(stats.builtinRules, 1);
  assert.equal(stats.builtinEnabled, 1);
});
