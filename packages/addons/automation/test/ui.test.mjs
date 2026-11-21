import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const h = React.createElement;
const C = require("../client/ui/common.cjs");
const copy = require("../client/ui/copy.cjs");
const layoutCss = require("../client/ui/layout-styles.cjs");
const styles = require("../client/ui/styles.cjs");
const Rules = require("../client/views/rules.cjs");
const Editor = require("../client/views/rule-editor.cjs");
const Trigger = require("../client/views/trigger-fields.cjs");
const Runs = require("../client/views/runs.cjs");
const Picker = require("../client/views/action-picker.cjs");

const dir = path.join(process.cwd(), "packages/addons/automation/client");
const t = (key, vars) => copy.t("zh", key, vars);
const noop = () => {};

function rulesBody(over) {
  return renderToStaticMarkup(h(Rules.RulesBody, Object.assign({
    h, t, lang: "zh", rows: [], hasRules: false, loading: false, error: "",
    allowed: ["message.send", "tasks.create"], noActions: false, onSettings: noop,
    filters: {}, onFilter: noop, onClear: noop, onNew: noop, onRun: noop,
    onEdit: noop, onToggle: noop, onDelete: noop,
  }, over)));
}

test("规则页空态只渲染一张空态卡，不渲染表格", () => {
  const html = rulesBody({});
  assert.ok(html.includes("wba-empty-card"));
  assert.ok(!html.includes("<table"), "空态不应渲染表格");
  assert.ok(html.includes(t("rules.empty.title")));
});

test("没有启用任何 action 时，空态引导去设置", () => {
  const html = rulesBody({ allowed: [], noActions: true });
  assert.ok(html.includes(t("rules.empty.noActionTitle")));
  assert.ok(html.includes(t("rules.empty.noActionCta")));
  assert.ok(!html.includes(t("rules.empty.body")));
});

test("过滤后为空显示“没有匹配的规则”且仍不渲染表格", () => {
  const html = rulesBody({ hasRules: true, filters: { q: "zzz" } });
  assert.ok(html.includes(t("rules.empty.filtered")));
  assert.ok(!html.includes("<table"));
});

test("加载中渲染骨架，不渲染表格", () => {
  const html = rulesBody({ loading: true });
  assert.ok(html.includes("wba-skel"));
  assert.ok(!html.includes("<table"));
});

test("规则列表渲染六列与图标操作", () => {
  const html = rulesBody({
    hasRules: true,
    rows: [
      { id: "rule_1", name: "每日提醒", enabled: true, triggerType: "schedule", triggerConfig: { kind: "interval", everyMinutes: 90 }, actionName: "message.send", lastRun: { status: "ok", startedAt: 1700000000000 } },
      { id: "rule_2", name: "事件规则", enabled: false, triggerType: "event", triggerConfig: { kind: "event", domainId: "wb-addon-tags", event: "tag.created" }, actionName: "tasks.create", lastRun: null },
    ],
  });
  assert.ok(html.includes("<table"));
  assert.ok(html.includes(t("rules.col.lastRun")));
  assert.ok(html.includes("每 90 分钟"));
  assert.ok(html.includes("事件 wb-addon-tags/tag.created"));
  assert.ok(html.includes("wba-icon-btn"));
  assert.ok(html.includes(t("rules.status.off")));
});

test("规则引用的 action 未启用时标记「未启用」", () => {
  const html = rulesBody({
    hasRules: true,
    allowed: ["tasks.create"],
    rows: [{ id: "rule_9", name: "旧规则", enabled: true, triggerType: "manual", triggerConfig: { kind: "manual" }, actionName: "message.send", lastRun: null }],
  });
  assert.ok(html.includes(t("rules.actionDisabled")));
  assert.ok(html.includes("wba-pill warn"));
});

test("四类触发只渲染各自的字段", () => {
  const base = Rules.emptyForm();
  const render = (kind) => renderToStaticMarkup(h(Trigger.TriggerFields, { h, t, form: Object.assign({}, base, { kind }), set: noop, errs: {} }));
  const interval = render("interval");
  // 数字项走共享数字输入控件：type="text" + inputmode，范围只写在提示里，不在输入期回灌。
  assert.ok(interval.includes("wbctl-num-input"), "间隔分钟用共享数字输入控件");
  assert.match(interval, /inputmode="numeric"/i);
  assert.ok(!interval.includes('type="number"'), "不再使用会回灌边界的 type=number");
  assert.ok(interval.includes(t("trigger.intervalHint")), "范围写成提示文字");
  assert.ok(!interval.includes('type="time"'));
  const daily = render("dailyAt");
  assert.ok(daily.includes('type="time"'));
  assert.ok(daily.includes("wba-chips"));
  assert.ok(!daily.includes('type="number"'));
  assert.ok(!daily.includes("wbctl-num-input"));
  const event = render("event");
  assert.ok(event.includes("wba-domain-hints"));
  assert.ok(event.includes('list="wba-event-hints"'));
  assert.ok(!event.includes('type="time"'));
  const manual = render("manual");
  assert.ok(manual.includes(t("trigger.manualHint")));
  assert.ok(!manual.includes('type="number"'));
  assert.ok(!manual.includes("wbctl-num-input"));
  assert.ok(!manual.includes('type="time"'));
  // 分段器四选一，当前类型 aria-pressed=true
  [["interval", 0], ["dailyAt", 0], ["event", 0], ["manual", 1]].forEach(() => {});
  assert.equal((manual.match(/aria-pressed="true"/g) || []).length, 1);
});

test("切换触发类型保留已填内容：payload 只取当前类型但其它值不丢", () => {
  const form = Object.assign(Rules.emptyForm(), {
    kind: "interval", everyMinutes: 240, time: "07:30", tz: "Asia/Tokyo",
    domainId: "wb-addon-message", event: "message.sent", actionName: "message.send",
  });
  const interval = Editor.buildPayload(form);
  assert.equal(interval.triggerType, "schedule");
  assert.deepEqual(interval.triggerConfig, { kind: "interval", everyMinutes: 240 });
  const daily = Editor.buildPayload(Object.assign({}, form, { kind: "dailyAt" }));
  assert.equal(daily.triggerConfig.time, "07:30");
  assert.equal(daily.triggerConfig.tz, "Asia/Tokyo");
  assert.deepEqual(daily.triggerConfig.weekdays, [1, 2, 3, 4, 5]);
  const evt = Editor.buildPayload(Object.assign({}, form, { kind: "event" }));
  assert.equal(evt.triggerType, "event");
  assert.deepEqual(evt.triggerConfig, { kind: "event", domainId: "wb-addon-message", event: "message.sent" });
  const manual = Editor.buildPayload(Object.assign({}, form, { kind: "manual" }));
  assert.equal(manual.triggerType, "manual");
  // 切回 interval 时原值仍在
  assert.equal(Editor.buildPayload(Object.assign({}, form, { kind: "interval" })).triggerConfig.everyMinutes, 240);
});

test("JSON 非法：红框、错误文案、保存禁用", () => {
  const form = Object.assign(Rules.emptyForm(), { actionArgs: '{"title": ' });
  const html = renderToStaticMarkup(h(Editor.RuleEditor, {
    h, C, t, React, form, initial: form, set: noop, busy: false, actions: ["message.send"], onClose: noop, onSave: noop,
  }));
  assert.ok(html.includes('aria-invalid="true"'));
  assert.ok(html.includes("wba-code err"));
  assert.ok(html.includes(t("editor.jsonInvalid", { msg: "x" }).split("：")[0]));
  assert.ok(html.includes('disabled=""'), "非法 JSON 时保存按钮应禁用");
});

test("合法表单保存按钮可用，条件关闭时 payload.condition 为 null", () => {
  const form = Object.assign(Rules.emptyForm(), { name: "每日提醒", actionName: "message.send", actionArgs: '{"title":"hi"}' });
  const html = renderToStaticMarkup(h(Editor.RuleEditor, {
    h, C, t, React, form, initial: form, set: noop, busy: false, actions: ["message.send"], onClose: noop, onSave: noop,
  }));
  assert.ok(!html.includes('disabled=""'));
  // 编辑器的布尔项改走共享开关：用 role="switch" + aria-checked 表达状态，不再渲染原生 checkbox。
  assert.ok(html.includes('role="switch"'));
  assert.ok(html.includes('aria-checked="true"'));
  assert.ok(html.includes('aria-checked="false"'));
  assert.ok(!html.includes('type="checkbox"'), "布尔项不应再是原生复选框");
  const payload = Editor.buildPayload(form);
  assert.equal(payload.condition, null);
  assert.equal(payload.triggerType, "schedule");
  assert.deepEqual(payload.actionArgs, { title: "hi" });
});

test("未选 action 时保存禁用，空清单下拉给出提示", () => {
  const form = Object.assign(Rules.emptyForm(), { name: "缺 action" });
  const html = renderToStaticMarkup(h(Editor.RuleEditor, {
    h, C, t, React, form, initial: form, set: noop, busy: false, actions: [], onClose: noop, onSave: noop,
  }));
  assert.ok(html.includes(t("editor.noActions")));
  assert.ok(html.includes('disabled=""'));
});

test("action 多选：搜索过滤与按域分组", () => {
  const items = [
    { name: "message.send", domain: "wb-addon-message", description: "发消息" },
    { name: "tasks.create", domain: "wb-addon-tasks", description: "建任务" },
    { name: "sites.create", domain: "wb-addon-sites", description: "建站点" },
  ];
  assert.equal(Picker.filterCatalog(items, "task").length, 1);
  assert.equal(Picker.filterCatalog(items, "建").length, 2);
  assert.equal(Picker.filterCatalog(items, "").length, 3);
  const groups = Picker.groupByDomain(items);
  assert.deepEqual(groups.map((g) => g.domain), ["wb-addon-message", "wb-addon-tasks", "wb-addon-sites"]);
  const html = renderToStaticMarkup(h(Picker.ActionPicker, {
    h, t, React, icon: null, items, selected: ["message.send"], loading: false, error: "", onChange: noop,
  }));
  assert.ok(html.includes("wb-addon-message"));
  assert.ok(html.includes('type="checkbox"'));
  assert.ok(html.includes(t("config.allowed.deniedNote")));
});

test("条件开启但 JSON 非法时同样禁用保存", () => {
  const form = Object.assign(Rules.emptyForm(), { condOn: true, condition: "[]" });
  const html = renderToStaticMarkup(h(Editor.RuleEditor, {
    h, C, t, React, form, initial: form, set: noop, busy: false, actions: ["message.send"], onClose: noop, onSave: noop,
  }));
  assert.ok(html.includes(t("editor.conditionObject")));
  assert.ok(html.includes('disabled=""'));
});

test("编辑器是模态盒子，宽度用 min(760px, calc(100vw - 32px))", () => {
  assert.ok(layoutCss.includes("width:min(760px,calc(100vw - 32px))"));
  assert.ok(layoutCss.includes("max-height:90vh"));
  assert.ok(layoutCss.includes(".wba-modal-foot{position:sticky"));
});

test("运行记录：按规则/状态过滤，空态不渲染表格", () => {
  const rows = [
    { id: "run_1", ruleId: "rule_1", trigger: "schedule", status: "ok", startedAt: 1700000000000, finishedAt: 1700000000300, result: '{"sent":1}', error: "" },
  ];
  const html = renderToStaticMarkup(h(Runs.RunsBody, {
    h, t, lang: "zh", rows, rules: [{ id: "rule_1", name: "每日提醒" }], loading: false, error: "",
    ruleId: "", status: "", expanded: "run_1", ruleName: () => "每日提醒", onRule: noop, onStatus: noop, onExpand: noop,
  }));
  assert.ok(html.includes("300ms"));
  assert.ok(html.includes(t("runs.detail.id")));
  assert.ok(html.includes(t("runs.limitNote")));
  const empty = renderToStaticMarkup(h(Runs.RunsBody, {
    h, t, lang: "zh", rows: [], rules: [], loading: false, error: "", expanded: "", ruleName: () => "", onRule: noop, onStatus: noop, onExpand: noop,
  }));
  assert.ok(empty.includes("wba-empty-card"));
  assert.ok(!empty.includes("<table"));
});

test("i18n 字典 zh/en 全量对称", () => {
  const zh = Object.keys(copy.DICT.zh).sort();
  const en = Object.keys(copy.DICT.en).sort();
  assert.deepEqual(zh, en);
  assert.equal(copy.t("en", "rules.title"), "Rules");
  assert.equal(copy.t("zh", "rules.confirm.delete", { name: "A" }), '删除规则「A」？删除后不可恢复。');
});

test("样式：版式层无字面色值，源码用到的每个 wba-* 类都有定义", () => {
  assert.ok(!/#[0-9a-fA-F]{3,8}\b/.test(layoutCss), "版式层禁止字面色值");
  assert.ok(!/rgba?\(/.test(layoutCss), "版式层禁止 rgba()");
  const files = ["client.src.cjs"].concat(
    fs.readdirSync(path.join(dir, "views")).map((f) => path.join("views", f)),
    fs.readdirSync(path.join(dir, "ui")).map((f) => path.join("ui", f)),
  );
  const used = new Set();
  for (const rel of files) {
    const file = path.join(dir, rel);
    const text = fs.readFileSync(file, "utf8");
    for (const m of text.matchAll(/className:\s*"([^"]+)"/g)) {
      m[1].split(/\s+/).filter((c) => c.startsWith("wba-")).forEach((c) => used.add(c));
    }
  }
  const missing = [...used].filter((c) => !styles.includes("." + c));
  assert.deepEqual(missing, [], "未定义的样式类：" + missing.join(", "));
});

function editorHtml(over) {
  const form = Object.assign(Rules.emptyForm(), over.form || {});
  const rest = Object.assign({}, over);
  delete rest.form;
  return renderToStaticMarkup(h(Editor.RuleEditor, Object.assign({
    h, C, t, React, form, initial: form, set: noop, busy: false,
    actions: ["message.send"], onClose: noop, onSave: noop,
  }, rest, { form })));
}

test("AI 规则编辑器：时间/提示词/目标齐备，payload 是宿主请求结构", () => {
  const form = Object.assign(Rules.emptyForm(), {
    name: "早间摘要", execMode: "agent", prompt: "汇总今天的任务与消息",
    pKind: "daily", pTime: "08:30", pTz: "Asia/Shanghai", targetKind: "new_once",
  });
  const html = editorHtml({ form });
  const modeBtns = html.match(/<button[^>]*data-mode="[^"]+"[^>]*>/g) || [];
  assert.equal(modeBtns.length, 2, "执行方式两个按钮");
  assert.equal(modeBtns.filter((b) => b.includes('aria-pressed="true"')).length, 1, "只能选中一个");
  assert.ok(html.includes(t("editor.mode.agent")));
  assert.ok(html.includes(t("editor.prompt")));
  assert.ok(html.includes('type="time"'));
  assert.ok(html.includes(t("editor.target.new_once")));
  assert.ok(!html.includes('disabled=""'), "合法 AI 表单应可保存");
  const payload = Editor.buildPayload(form);
  assert.equal(payload.execMode, "agent");
  assert.equal(payload.actionName, undefined);
  assert.deepEqual(payload.agent.timing, { kind: "daily", daily: { time: "08:30:00", time_zone: "Asia/Shanghai" } });
  assert.deepEqual(payload.agent.target, { kind: "new_once" });
});

test("AI 规则不渲染条件段：不参与就不显示", () => {
  const html = editorHtml({
    form: Object.assign(Rules.emptyForm(), {
      name: "早间摘要", execMode: "agent", prompt: "p", pKind: "every", targetKind: "new_once",
    }),
  });
  assert.ok(!html.includes(t("editor.section.condition")), "agent 模式不显示条件段标题");
  assert.ok(!html.includes(t("editor.conditionOn")), "agent 模式不显示条件开关");
  assert.ok(!html.includes("由宿主直接投递"), "不显示「填了也没用」的说明");
  for (const dict of [copy.DICT.zh, copy.DICT.en]) {
    assert.equal(dict["editor.section.conditionAgent"], undefined, "不再保留仅 action 模式的条件标题");
    assert.equal(dict["editor.conditionAgentHint"], undefined, "不再保留条件段说明文案");
  }
  const action = editorHtml({ form: Object.assign(Rules.emptyForm(), { name: "x", actionName: "message.send" }) });
  assert.ok(action.includes(t("editor.section.condition")), "action 模式仍显示条件段");
});

test("AI 规则缺少提示词或时间非法时禁用保存", () => {
  const missing = editorHtml({ form: Object.assign(Rules.emptyForm(), { name: "x", execMode: "agent" }) });
  assert.ok(missing.includes(t("editor.promptRequired")));
  assert.ok(missing.includes('disabled=""'));
  const badCron = Object.assign(Rules.emptyForm(), { name: "x", execMode: "agent", prompt: "p", pKind: "cron", pCron: "0 9 * *" });
  assert.ok(editorHtml({ form: badCron }).includes(t("agent.cronHint")));
  assert.equal(Editor.validateForm(badCron, t).valid, false);
  const badRrule = Object.assign(Rules.emptyForm(), { name: "x", execMode: "agent", prompt: "p", pKind: "rrule", pRrule: "FREQ=DAILY" });
  assert.ok(editorHtml({ form: badRrule }).includes(t("agent.rruleHint")));
});

test("执行方式创建后不可切换：已有规则只读", () => {
  const html = editorHtml({ form: Object.assign(Rules.emptyForm(), { id: "rule_1", name: "x", actionName: "message.send" }) });
  const modeBtns = html.match(/<button[^>]*data-mode="[^"]+"[^>]*>/g) || [];
  assert.equal(modeBtns.filter((b) => b.includes('aria-pressed="true"')).length, 1);
  assert.ok(modeBtns.every((b) => b.includes("disabled")), "执行方式按钮全部禁用");
  assert.ok(html.includes(t("editor.mode.locked")));
  assert.ok(html.includes('disabled=""'), "切换按钮应禁用");
});

test("宿主没有 schedule 服务时「交给 AI」不可选并说明原因", () => {
  const html = editorHtml({ form: Object.assign(Rules.emptyForm(), { name: "x", actionName: "message.send" }), agentAvailable: false });
  assert.ok(html.includes(t("editor.mode.agentUnavailable")));
  assert.ok(html.includes(t("editor.mode.locked")) === false, "新规则不显示锁定说明");
});

test("列表里的 AI 规则展示执行方式、宿主状态与投递历史入口", () => {
  const html = rulesBody({
    hasRules: true,
    rows: [{
      id: "rule_a", name: "早间摘要", enabled: true, execMode: "agent", scheduleStatus: "active",
      agent: {
        prompt: "汇总今天的任务",
        timing: { kind: "daily", daily: { time: "08:30:00", time_zone: "Asia/Shanghai" } },
        lastDeliveryAt: 1700000000000,
      },
    }],
  });
  assert.ok(html.includes(t("rules.agentAction")));
  assert.ok(html.includes(t("rules.schedule.active")));
  assert.ok(html.includes("08:30"));
  assert.ok(html.includes(t("rules.history")));
});

test("宿主任务被删的 AI 规则标「宿主任务已删除」且不能立即执行", () => {
  const html = rulesBody({
    hasRules: true,
    rows: [{ id: "rule_m", name: "孤儿规则", enabled: false, execMode: "agent", scheduleMissing: true, agent: { timing: { kind: "every", every_seconds: 3600 } } }],
  });
  assert.ok(html.includes(t("rules.schedule.missing")));
  assert.ok(html.includes('disabled=""'));
});

test("宿主服务不可用或有游离任务时给出提示", () => {
  const offline = rulesBody({ hasRules: true, agentStatus: { available: false } });
  assert.ok(offline.includes(t("rules.agentOffline")));
  const orphans = rulesBody({ hasRules: true, agentStatus: { available: true, orphans: [{ id: "s1" }] } });
  assert.ok(orphans.includes(t("rules.orphans", { n: 1 })));
});

test("AI 规则表单往返：宿主快照能还原字段并拼回请求", () => {
  const rule = {
    id: "rule_a", name: "周报", enabled: true, execMode: "agent",
    agent: {
      prompt: "写本周周报",
      timing: { kind: "weekly", weekly: { time: "18:00:00", time_zone: "Asia/Tokyo", weekdays: [1, 5] } },
      target: { kind: "new", create: { cwd: "/tmp/work", agentPreset: "coder" } },
    },
  };
  const form = Rules.formFromRule(rule);
  assert.equal(form.execMode, "agent");
  assert.equal(form.pKind, "weekly");
  assert.equal(form.pTime, "18:00");
  assert.equal(form.pWeekdays, "1,5");
  assert.equal(form.targetKind, "new");
  const payload = Editor.buildPayload(form);
  assert.equal(payload.id, "rule_a");
  assert.deepEqual(payload.agent.timing.weekly.weekdays, [1, 5]);
  assert.deepEqual(payload.agent.target, { kind: "new", create: { cwd: "/tmp/work", agentPreset: "coder" } });
  // 过滤维度：按执行方式筛
  assert.equal(Rules.filterRules([Object.assign({}, rule)], { mode: "agent" }).length, 1);
  assert.equal(Rules.filterRules([Object.assign({}, rule)], { mode: "action" }).length, 0);
});
