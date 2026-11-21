"use strict";
var createOverlay = require("../../../lib/overlay.cjs");
// 布尔项统一走共享开关控件（lib/switch.cjs）。
var SW = require("../../../lib/switch.cjs");
// 对话框外壳与插件自己的字段/校验分离：外壳统一深浅主题下的遮罩、Esc、Tab 循环与焦点归还。
var EditorOverlay = createOverlay({
  maskClass: "wba-modal",
  dialogClass: "wba-modal-box",
  ariaLabelOf: function (props) {
    var t = props.t;
    return props.form && props.form.id ? t("editor.editTitle") : t("editor.newTitle");
  },
  // 有未保存改动时要先问一次，所以关掉「点遮罩直接关」的默认行为，交给 close()。
  closeOnMask: false,
  autoFocusDialog: false,
});

/** 规则编辑器（模态）：四段表单、JSON 实时校验、未保存关闭确认。 */
var trig = require("./trigger-fields.cjs");
var json = require("./json-editor.cjs");

var EXAMPLES = {
  "message.send": { title: "自动化提醒", body: "规则 {{rule.name}} 已运行" },
  "tasks.create": { title: "来自自动化的跟进", description: "规则 {{rule.name}} 触发" },
  "tags.create": { name: "自动化" },
  "sites.create": { title: "{{item.title}}", url: "{{item.url}}" },
  "connector.sourceRun": { sourceId: "{{event.data.sourceId}}" },
};

function plain(text) {
  var r = json.parseJsonSafe(text);
  if (!r.ok) return { ok: false, error: r.error };
  if (r.value === undefined) return { ok: true, value: {} };
  if (!r.value || typeof r.value !== "object" || Array.isArray(r.value)) return { ok: false, error: "object" };
  return { ok: true, value: r.value };
}

function validateForm(form, t) {
  var errs = {};
  if (!String(form.name || "").trim()) errs.name = t("editor.nameRequired");
  if (!String(form.actionName || "").trim()) errs.actionName = t("editor.actionRequired");
  var args = plain(form.actionArgs);
  if (!args.ok) errs.actionArgs = args.error === "object" ? t("editor.argsObject") : t("editor.jsonInvalid", { msg: args.error });
  var cond = null;
  if (form.condOn) {
    cond = plain(form.condition);
    if (!cond.ok) errs.condition = cond.error === "object" ? t("editor.conditionObject") : t("editor.jsonInvalid", { msg: cond.error });
  }
  if (form.kind === "interval") {
    var n = Number(form.everyMinutes);
    if (!n || n < 1 || n > 10080) errs.everyMinutes = t("trigger.intervalHint");
  }
  if (form.kind === "dailyAt" && !/^\d{2}:\d{2}$/.test(String(form.time || ""))) errs.time = t("trigger.time");
  if (form.kind === "event") {
    if (!String(form.domainId || "").trim()) errs.domainId = t("trigger.domain");
    if (!String(form.event || "").trim()) errs.event = t("trigger.eventName");
  }
  return { errs: errs, valid: Object.keys(errs).length === 0 };
}

function buildPayload(form) {
  var triggerConfig = { kind: form.kind };
  if (form.kind === "interval") triggerConfig.everyMinutes = Number(form.everyMinutes) || 60;
  if (form.kind === "dailyAt") {
    triggerConfig.time = form.time;
    triggerConfig.tz = form.tz;
    triggerConfig.weekdays = trig.daysOf(form.weekdays);
  }
  if (form.kind === "event") {
    triggerConfig.domainId = String(form.domainId || "").trim();
    triggerConfig.event = String(form.event || "").trim();
  }
  var args = plain(form.actionArgs);
  if (!args.ok) throw new Error("actionArgs 不是合法 JSON");
  var condition = null;
  if (form.condOn && String(form.condition || "").trim()) {
    var cond = plain(form.condition);
    if (!cond.ok) throw new Error("条件不是合法 JSON");
    condition = cond.value;
  }
  return {
    id: form.id || undefined,
    name: String(form.name || "").trim(),
    enabled: Boolean(form.enabled),
    triggerType: form.kind === "event" ? "event" : form.kind === "manual" ? "manual" : "schedule",
    triggerConfig: triggerConfig,
    actionName: form.actionName,
    actionArgs: args.value,
    condition: condition,
  };
}

function snapshot(form) {
  try {
    return JSON.stringify(buildPayload(form));
  } catch (e) {
    return JSON.stringify({ name: form.name, actionArgs: form.actionArgs, condition: form.condition, kind: form.kind });
  }
}

function RuleEditor(props) {
  var h = props.h;
  var C = props.C;
  var t = props.t;
  var React = props.React;
  var form = props.form;
  var set = props.set;
  var busy = props.busy;
  var actions = props.actions || [];
  var icon = props.icon;
  var initial = props.initial;
  var validation = validateForm(form, t);
  var errs = validation.errs;
  var exampleS = React.useState(false);
  var touchedS = React.useState(Boolean(form.name));
  var showNameErr = touchedS[0] && Boolean(errs.name);
  var hasActions = actions.length > 0;
  // 编辑老规则时，已停用的 action 仍要出现在下拉里，否则打开就是空值。
  var actionName = !form.actionName || actions.indexOf(form.actionName) !== -1
    ? actions
    : [form.actionName].concat(actions);
  var actionMissing = hasActions && Boolean(form.actionName) && actions.indexOf(form.actionName) === -1;
  var example = EXAMPLES[form.actionName];

  // Esc 与焦点归还由共享外壳负责；这里只锁背景滚动。
  React.useEffect(function () {
    var prev = typeof document !== "undefined" ? document.body.style.overflow : "";
    if (typeof document !== "undefined") document.body.style.overflow = "hidden";
    return function () {
      if (typeof document !== "undefined") document.body.style.overflow = prev;
    };
  });

  function dirty() {
    return snapshot(form) !== snapshot(initial || form);
  }
  function close() {
    if (dirty() && typeof window !== "undefined" && !window.confirm(t("editor.discard"))) return;
    props.onClose();
  }

  return h(EditorOverlay, { t: t, form: form, onClose: close, closeOnMask: false, autoFocus: false },
      h("div", { className: "wba-modal-head" },
        h("h3", null, form.id ? t("editor.editTitle") : t("editor.newTitle")),
        h("button", { type: "button", className: "wba-icon-btn", title: t("common.close"), onClick: close }, icon ? icon("x", 15) : "×")),
      h("div", { className: "wba-modal-body" },
        h("div", { className: "wba-section" },
          h("p", { className: "wba-section-title" }, "① " + t("editor.section.basic")),
          h("div", { className: "wba-grid-3" },
            h("label", { className: "wba-field wba-span-2" },
              h("span", { className: "wba-label" }, t("editor.name")),
              h("input", {
                className: "wba-input" + (showNameErr ? " err" : ""),
                value: form.name,
                placeholder: t("editor.namePh"),
                onChange: function (e) { touchedS[1](true); set("name", e.target.value); },
              }),
              showNameErr ? h("span", { className: "wba-err-text" }, errs.name) : null),
            h("div", { className: "wba-field" },
              h("span", { className: "wba-label" }, t("editor.enabled")),
              h(SW.Switch, {
                h: h,
                checked: Boolean(form.enabled),
                showState: true,
                onText: t("rules.status.on"),
                offText: t("rules.status.off"),
                onChange: function (next) { set("enabled", next); },
              })))),
        h("div", { className: "wba-section" },
          h("p", { className: "wba-section-title" }, "② " + t("editor.section.trigger")),
          h(trig.TriggerFields, { h: h, t: t, form: form, set: set, errs: errs, icon: icon })),
        h("div", { className: "wba-section" },
          h("p", { className: "wba-section-title" }, "③ " + t("editor.section.run")),
          h("div", { className: "wba-inline" },
            h("label", { className: "wba-field" },
              h("span", { className: "wba-label" }, t("editor.action")),
              h("select", {
                className: "wba-input",
                value: form.actionName,
                disabled: !hasActions,
                onChange: function (e) { set("actionName", e.target.value); },
              },
                hasActions
                  ? actionName.map(function (a) { return h("option", { key: a, value: a }, a); })
                  : h("option", { value: "" }, t("editor.noActions"))),
              !hasActions || actionMissing
                ? h("span", { className: "wba-err-text" }, hasActions ? t("rules.actionDisabled") : t("editor.noActionsHint"))
                : null),
            h("span", { className: "wba-grow" }),
            example ? h(C.Btn, { h: h, onClick: function () { exampleS[1](!exampleS[0]); } }, t("editor.showExample")) : null),
          exampleS[0] && example ? h("div", { className: "wba-block" },
            h("span", { className: "wba-label" }, t("editor.exampleTitle")),
            h("pre", { className: "wba-pre" }, JSON.stringify(example, null, 2)),
            h("div", { className: "wba-inline" },
              h(C.Btn, { h: h, onClick: function () {
                if (typeof window !== "undefined" && !window.confirm(t("editor.exampleHint"))) return;
                set("actionArgs", JSON.stringify(example, null, 2));
              } }, t("editor.fillExample")),
              h("span", { className: "wba-grow" }))) : null,
          h(json.JsonEditor, {
            h: h,
            t: t,
            React: React,
            label: "actionArgs",
            hint: t("editor.argsHint"),
            value: form.actionArgs,
            invalid: Boolean(errs.actionArgs),
            error: errs.actionArgs,
            onChange: function (v) { set("actionArgs", v); },
            action: h(C.Btn, { h: h, onClick: function () {
              var next = json.formatJson(form.actionArgs);
              if (next) set("actionArgs", next);
            } }, t("editor.format")),
          })),
        h("div", { className: "wba-section" },
          h("p", { className: "wba-section-title" }, "④ " + t("editor.section.condition")),
          h(SW.Switch, {
            h: h,
            checked: Boolean(form.condOn),
            label: t("editor.conditionOn"),
            onChange: function (next) { set("condOn", next); },
          }),
          h("p", { className: "wba-sub" }, t("editor.conditionHint")),
          form.condOn ? h(json.JsonEditor, {
            h: h,
            t: t,
            React: React,
            small: true,
            vars: false,
            label: "condition",
            value: form.condition,
            invalid: Boolean(errs.condition),
            error: errs.condition,
            onChange: function (v) { set("condition", v); },
          }) : h("p", { className: "wba-sub" }, t("editor.conditionEmpty")))),
      h("div", { className: "wba-modal-foot" },
        h("span", { className: "wba-sub wba-grow" }, validation.valid ? "" : errs.name || errs.actionArgs || errs.condition || t("editor.nameEmptySave")),
        h(C.Btn, { h: h, onClick: close }, t("common.cancel")),
        h(C.Btn, { h: h, kind: "primary", disabled: busy || !validation.valid, onClick: function () { props.onSave(buildPayload(form)); } },
          busy ? t("common.loading") : t("common.save"))));
}

module.exports = { RuleEditor: RuleEditor, buildPayload: buildPayload, validateForm: validateForm, EXAMPLES: EXAMPLES };
