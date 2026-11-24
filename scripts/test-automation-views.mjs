/**
 * 宿主自动化页的「每个页签都能真渲染」冒烟测试。
 *
 * 为什么单独有这一份：test-automation-ui.mjs 只逐个渲染 Body 组件里它关心的几个，
 * 概览页的 StatsBody 与整页 AutomationView 都没进过渲染器——结果 stats.cjs 里
 * 一个裸变量 `s`（不在组件作用域内）把概览页整页打崩了，28 个用例全绿也发现不了。
 * 这里补的是「每个页签的代表性 props 都渲染一次」，拦的是 ReferenceError / TypeError
 * 这类渲染期崩溃，不检查具体文案（文案断言仍在 test-automation-ui.mjs）。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const h = React.createElement;

const locale = require("../packages/shell/client/automation/locale.cjs");
const Stats = require("../packages/shell/client/automation/stats.cjs");
const Rules = require("../packages/shell/client/automation/rules.cjs");
const Runs = require("../packages/shell/client/automation/runs.cjs");
const Config = require("../packages/shell/client/automation/config.cjs");
const Page = require("../packages/shell/client/automation-page.cjs");

/** 与 common.cjs 的 autoT 同一套映射：auto_ 前缀 + 点号换下划线 + {变量}。 */
function makeT(lang) {
  const dict = locale[lang] || {};
  return function (key, vars) {
    const raw = String(key);
    const text = dict[raw.indexOf("auto_") === 0 ? raw : "auto_" + raw.replace(/\./g, "_")];
    if (text === undefined) return raw;
    if (!vars) return text;
    return String(text).replace(/\{(\w+)\}/g, (m, name) => (vars[name] === undefined ? m : String(vars[name])));
  };
}
const t = makeT("zh");
const noop = () => {};

/** 图标：真图标表要 lucide，这里给个空 span，只验证调用链不崩。 */
function icon() {
  return h("span", { "aria-hidden": "true" });
}

/** 一个够用的统计结果：字段都与 engine.stats() 对齐。 */
function statsData() {
  return {
    total: 3,
    enabled: 2,
    today: { ok: 5, error: 1, skipped: 2 },
    staleCount: 0,
    userRules: 2,
    builtinRules: 1,
    builtinEnabled: 1,
    builtinDisabled: 0,
    builtinStale: 0,
    builtinUninstalled: 0,
  };
}

/** api 桩：只要求 get/post/del 形状存在，渲染期不会真的发请求。 */
const api = {
  get: () => Promise.resolve({ ok: true, result: {} }),
  post: () => Promise.resolve({ ok: true, result: {} }),
  del: () => Promise.resolve({ ok: true, result: {} }),
};

test("概览页 StatsBody 带统计数据渲染（曾因裸变量 s 整页崩溃）", () => {
  const html = renderToStaticMarkup(
    h(Stats.StatsBody, {
      h,
      t,
      icon,
      s: statsData(),
      actions: ["message.send", "tasks.create"],
      denied: Stats.DENIED,
      onSettings: noop,
    }),
  );
  assert.ok(html.includes("wba-card"), "KPI 卡应渲染");
  // 「按来源」面板的六个计数要真的出现在页面上，而不是渲染中途抛错。
  assert.ok(html.includes("wba-kv"), "按来源面板应渲染");
  assert.equal(html.split("wba-card-num").length - 1, 5, "应有 5 张 KPI 卡");
});

test("概览页 StatsBody 在没有统计结果时也不崩", () => {
  const html = renderToStaticMarkup(
    h(Stats.StatsBody, { h, t, icon, s: null, actions: [], denied: Stats.DENIED, onSettings: noop }),
  );
  assert.ok(html.includes("wba-card"), "空数据也要渲染出 KPI 卡（数值回落 0）");
});

test("规则页 RulesBody 空态与带数据都能渲染", () => {
  const base = {
    h, t, lang: "zh", loading: false, error: "", allowed: ["message.send"], noActions: false,
    onSettings: noop, filters: {}, onFilter: noop, onClear: noop, onNew: noop, onRun: noop,
    onEdit: noop, onToggle: noop, onDelete: noop,
  };
  const empty = renderToStaticMarkup(h(Rules.RulesBody, { ...base, rows: [], hasRules: false }));
  assert.ok(empty.length > 0);
  const rows = [
    {
      id: "auto:wb-addon-mail:daily-unread-digest", name: "内置汇总", enabled: true, execMode: "action",
      triggerType: "schedule", triggerConfig: { kind: "dailyAt", time: "09:00", tz: "Asia/Shanghai" },
      actionName: "mail.messageList", actionArgs: { unread: true }, condition: null, runCount: 2,
      lastStatus: "ok", lastRunAt: Date.now(), nextRunAt: Date.now() + 3600_000,
      origin: "plugin", ownerDomain: "wb-addon-mail", ruleKey: "daily-unread-digest",
      originVersion: "0.9.0", originState: "active", originStateText: "内置规则",
    },
    {
      id: "rule_user_1", name: "用户规则", enabled: false, execMode: "action", triggerType: "interval",
      triggerConfig: { everyMinutes: 30 }, actionName: "message.send", actionArgs: {}, condition: null,
      runCount: 0, lastStatus: "", origin: "user",
    },
  ];
  const full = renderToStaticMarkup(h(Rules.RulesBody, { ...base, rows, hasRules: true }));
  assert.ok(full.includes("wba-table"), "有规则时应渲染表格");
  assert.ok(full.includes("内置汇总"), "内置规则名应出现");
});

test("运行记录页 RunsBody 空态与带数据都能渲染", () => {
  const empty = renderToStaticMarkup(
    h(Runs.RunsBody, { h, t, lang: "zh", rows: [], loading: false, error: "", onRefresh: noop, ruleOrigin: () => "user" }),
  );
  assert.ok(empty.length > 0);
  const rows = [
    {
      id: "run_1", ruleId: "auto:wb-addon-mail:daily-unread-digest", trigger: "manual", status: "error",
      startedAt: Date.now(), finishedAt: Date.now(), result: "", error: "保险箱已锁定",
    },
  ];
  const full = renderToStaticMarkup(
    h(Runs.RunsBody, {
      h, t, lang: "zh", rows, loading: false, error: "", onRefresh: noop,
      ruleOrigin: (id) => (String(id).indexOf("auto:") === 0 ? "plugin" : "user"),
    }),
  );
  assert.ok(full.includes("保险箱已锁定") || full.length > 0);
});

test("设置页 ConfigBody 能渲染（含白名单 chips）", () => {
  const html = renderToStaticMarkup(
    h(Config.ConfigBody, {
      h, React, t, lang: "zh", icon,
      form: { maxRules: 50, perHour: 20, allowedActions: ["message.send", "tasks.create"] },
      catalog: { items: [{ name: "message.send", description: "发消息" }], error: "", loading: false },
      dirty: true, busy: false, saved: false, onChange: noop, onSave: noop,
    }),
  );
  assert.ok(html.includes("wba-panel"), "设置页应渲染出面板");
});

test("整页 AutomationView 四个页签都能挂载渲染", () => {
  // 页签内部数据走 api 桩，静态渲染只出 loading 骨架；
  // 但页面骨架、页签按钮与「数据页去向」提示必须都在。
  const html = renderToStaticMarkup(
    h(Page, { h, React, api, lang: "zh", t, head: (title, desc) => h("div", null, title, desc) }),
  );
  assert.equal(html.split('role="tab"').length - 1, Page.TABS.length, "四个页签按钮都在");
  // 「Action」页签已删：宿主 action 页（route=agent）统一列全部宿主 action。
  assert.equal(Page.TABS.length, 4, "页签只剩 概览/规则/运行记录/设置");
  assert.ok(!Page.TABS.some((x) => x[0] === "actions"), "不应再有 actions 页签");
  for (const [, key] of Page.TABS) {
    assert.ok(html.includes(t(key)), "页签文案 " + key + " 应出现");
  }
});
