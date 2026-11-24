/**
 * 内置规则内存化的行为测试。
 *
 * 三条不变量：
 * 1) 注册内置规则只写内存，不往 host_automation_rule / host_automation_meta 落内置定义；
 * 2) 用户的启停与参数覆盖是「本机偏好」，重启后仍在（重建引擎再注册一次即可对上）；
 * 3) 老库里的内置规则行会被迁成偏好并删除，用户自建规则零变化。
 */
import { test } from "node:test";
import assert from "node:assert/strict";

const { openDb } = await import("../packages/core/lib/index.js");
const { createAutomation } = await import("../packages/shell/lib/infra/automation/index.js");
const registry = await import("../packages/shell/lib/infra/automation/registry.js");

const DECL = {
  key: "daily-unread-digest",
  title: "每天 09:00 汇总未读邮件",
  trigger: { kind: "dailyAt", time: "09:00", tz: "Asia/Shanghai" },
  action: { name: "mail.messageList", args: { unread: true, limit: 20 } },
  defaultEnabled: true,
  editableArgs: true,
};

function makeEngine(db, domains = ["wb-addon-mail"]) {
  const calls = [];
  const engine = createAutomation({
    db,
    invoke: async (action, args) => {
      calls.push({ action, args });
      return { result: { ok: true } };
    },
    hasDomain: (id) => domains.indexOf(id) >= 0,
  });
  return { engine, calls };
}

function register(engine, decls = [DECL]) {
  return engine.registerBuiltin({
    domainId: "wb-addon-mail",
    domainVersion: "0.6.5",
    decls,
    subscriptions: [{ type: "mail.messages-synced" }],
  });
}

function countRow(db, sql, params = []) {
  return db.prepare(sql).get(...params).n;
}

test("注册只进内存：规则表与 meta 都不留内置定义", () => {
  registry.reset();
  const db = openDb(":memory:");
  const { engine } = makeEngine(db);
  const out = register(engine);
  assert.equal(out.registered.length, 1);
  assert.equal(countRow(db, "SELECT COUNT(*) AS n FROM host_automation_rule WHERE origin='plugin'"), 0);
  assert.equal(countRow(db, "SELECT COUNT(*) AS n FROM host_automation_meta WHERE key LIKE 'builtin%'"), 0);
  // 规则确实可查、可调度。
  const rule = engine.getRule("auto:wb-addon-mail:daily-unread-digest");
  assert.ok(rule);
  assert.equal(rule.origin, "plugin");
  assert.equal(rule.ownerDomain, "wb-addon-mail");
  assert.equal(rule.enabled, true);
});

test("启停与参数覆盖写成本机偏好，重启后仍生效", async () => {
  registry.reset();
  const db = openDb(":memory:");
  const first = makeEngine(db);
  register(first.engine);
  const id = "auto:wb-addon-mail:daily-unread-digest";
  await first.engine.updateRule({ id, enabled: false, actionArgs: { unread: true, limit: 5 } });
  const meta = db.prepare("SELECT value FROM host_automation_meta WHERE key=?").get("builtin-overrides:wb-addon-mail");
  assert.ok(meta, "覆盖要写进本机偏好");
  assert.equal(countRow(db, "SELECT COUNT(*) AS n FROM host_automation_rule WHERE origin='plugin'"), 0);

  // 模拟进程重启：内存清空，同一个库上重新注册。
  registry.reset();
  const second = makeEngine(db);
  register(second.engine);
  const rule = second.engine.getRule(id);
  assert.equal(rule.enabled, false, "停用状态重启后保持");
  assert.deepEqual(rule.actionArgs, { unread: true, limit: 5 }, "用户改过的参数重启后保持");
});

test("老库迁移：内置行迁成偏好后删除，用户规则一条不动", () => {
  registry.reset();
  const db = openDb(":memory:");
  const now = Date.now();
  db.prepare(
    "INSERT INTO host_automation_rule(id,name,enabled,trigger_type,trigger_config,action_name,action_args,next_run_at,created_at,updated_at,origin,owner_domain,rule_key,origin_version) " +
      "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
  ).run(
    "auto:wb-addon-mail:daily-unread-digest",
    "旧内置规则",
    0,
    "schedule",
    JSON.stringify(DECL.trigger),
    "mail.messageList",
    JSON.stringify({ unread: true, limit: 3 }),
    null,
    now,
    now,
    "plugin",
    "wb-addon-mail",
    "daily-unread-digest",
    "0.6.4",
  );
  db.prepare(
    "INSERT INTO host_automation_rule(id,name,enabled,trigger_type,trigger_config,action_name,action_args,next_run_at,created_at,updated_at) " +
      "VALUES(?,?,?,?,?,?,?,?,?,?)",
  ).run("rule_user", "我的规则", 1, "schedule", '{"kind":"interval","everyMinutes":30}', "mail.messageList", "{}", null, now, now);
  db.prepare("INSERT INTO host_automation_meta(key,value) VALUES(?,?)").run(
    "builtin:wb-addon-mail",
    JSON.stringify({ version: "0.6.4", keys: ["daily-unread-digest"] }),
  );

  // 建引擎即触发迁移。
  const { engine } = makeEngine(db);
  assert.equal(countRow(db, "SELECT COUNT(*) AS n FROM host_automation_rule WHERE origin='plugin'"), 0, "旧内置行应被删除");
  assert.equal(countRow(db, "SELECT COUNT(*) AS n FROM host_automation_meta WHERE key LIKE 'builtin:%'"), 0);
  assert.equal(countRow(db, "SELECT COUNT(*) AS n FROM host_automation_rule WHERE id='rule_user'"), 1, "用户规则不动");

  register(engine);
  const rule = engine.getRule("auto:wb-addon-mail:daily-unread-digest");
  assert.equal(rule.enabled, false, "老库里停用的内置规则迁移后仍停用");
  assert.deepEqual(rule.actionArgs, { unread: true, limit: 3 }, "老库里的参数覆盖应迁成本机偏好");
});

test("三种触发都能到点执行，运行记录落合成 id", async () => {
  registry.reset();
  const db = openDb(":memory:");
  const { engine, calls } = makeEngine(db);
  engine.saveConfig({ allowedActions: ["mail.messageList"] });
  register(engine, [
    { ...DECL, key: "interval-rule", trigger: { kind: "interval", everyMinutes: 30 } },
    { ...DECL, key: "daily-rule" },
    { ...DECL, key: "event-rule", trigger: { kind: "event", event: "mail.messages-synced" } },
  ]);
  // 把两条定时规则的到点时间改到过去，模拟时间推进。
  for (const rule of engine.listRules()) {
    if (rule.triggerType !== "event") registry.patchRuntime(rule.id, { nextRunAt: Date.now() - 1000 });
  }
  await engine.tick();
  assert.equal(countRow(db, "SELECT COUNT(*) AS n FROM host_automation_run"), 2, "两条定时规则都该跑");
  const runIds = db.prepare("SELECT DISTINCT rule_id FROM host_automation_run").all().map((row) => row.rule_id);
  assert.ok(runIds.every((id) => String(id).indexOf("auto:wb-addon-mail:") === 0), "运行记录落在合成 id 上");

  // 事件触发：注册了 event 声明的域收到同名事件时执行。
  engine.onEvent({ domainId: "wb-addon-mail", event: "mail.messages-synced", data: {} });
  assert.ok(calls.length >= 3, "事件触发的内置规则也应执行");
});

test("秒级间隔：everySeconds 声明能算出 20 秒后的下次时间", () => {
  registry.reset();
  const db = openDb(":memory:");
  const { engine } = makeEngine(db);
  const before = Date.now();
  register(engine, [{ ...DECL, key: "fast-fetch", trigger: { kind: "interval", everySeconds: 20 } }]);
  const rule = engine.getRule("auto:wb-addon-mail:fast-fetch");
  assert.ok(rule.nextRunAt >= before + 15000, "下次时间应在 20 秒后");
  assert.ok(rule.nextRunAt <= before + 25000);
  // 越界值直接拒绝，不落注册表。
  assert.throws(
    () => register(engine, [{ ...DECL, key: "too-fast", trigger: { kind: "interval", everySeconds: 1 } }]),
    /间隔需为 5–604800 秒/,
  );
});

test("云同步面看不到内置规则：自动化表不进任何插件的同步清单", async () => {
  const fs = await import("node:fs");
  const networkTs = fs.readFileSync(new URL("../packages/shell/src/infra/network.ts", import.meta.url), "utf8");
  const indexTs = fs.readFileSync(new URL("../packages/shell/src/index.ts", import.meta.url), "utf8");
  // 同步只遍历已注册业务域（插件 DomainDef），宿主的自动化备份伪域不在其中。
  assert.ok(networkTs.indexOf("domains.values()") >= 0, "同步清单只来自己注册的域");
  assert.ok(!/registerDomain\(\s*(function\s+)?automationBackupDomain/.test(indexTs), "备份伪域不得被注册成真实域");
  // 没有任何业务插件的表清单里出现自动化三张表。
  const dir = new URL("../packages/addons/", import.meta.url);
  let hits = 0;
  for (const name of fs.readdirSync(dir)) {
    const file = new URL(name + "/lib/index.js", dir);
    if (!fs.existsSync(file)) continue;
    const src = fs.readFileSync(file, "utf8");
    for (const line of src.split("\n")) {
      if (/tables:\s*\[/.test(line) && /automation_/.test(line)) hits += 1;
    }
  }
  assert.equal(hits, 0, "插件不得把自动化表放进自己的同步清单");
});
