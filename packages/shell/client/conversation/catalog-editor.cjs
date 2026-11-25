"use strict";
/**
 * 角色编辑器：两步向导（基本信息 → 角色指令），第二步底部直接保存。
 *
 * 角色只有两件必填的事：叫什么、怎么干（指令）。中间不再插「参考动作」步（actions 已
 * 不参与权限判定），也不再加「确认与保存」步——摘要读回去的还是刚填的两行字，多一步
 * 只是多一次点击，所以保存直接挂在最后一步上。
 *
 * 每次切换步骤都把焦点交给这一步的第一个可操作元素，键盘用户不用再 Tab 一轮；
 * 保存前做一次全量复核，哪一步被改空了就退回那一步，而不是静默失败。
 */
var React = require("react");
var h = React.createElement;
var common = require("../../../addons/lib/client-common.cjs")("wbr");
var Field = common.Field;
// 按钮统一走共享按钮控件：图标 + 文字（窄屏由基础样式收成纯图标）。
var Icon = require("./icons.cjs").Icon;
var Button = require("../../../addons/lib/button.cjs")({ prefix: "wbr", Icon: Icon });
var Body = require("../../../addons/lib/markdown.cjs").createBody(React);
var Steps = require("../../../addons/lib/stepper.cjs").Steps;
var LOCALE = require("../locale.cjs");

/** 页面文案从宿主字典取；缺键时退回中文，再把 {n} 一类占位填掉。 */
function translator(lang) {
  var dict = LOCALE[lang] || LOCALE.zh;
  return function (key, values) {
    var text = dict[key] || LOCALE.zh[key] || key;
    return values ? String(text).replace(/\{(\w+)\}/g, function (all, name) {
      return name in values ? String(values[name]) : all;
    }) : text;
  };
}

/**
 * 全量复核：返回第一个不合格的步骤下标，全部通过返回 -1。
 * 顺序即步骤顺序，所以「下一步」只看当前步，保存时用它兜底。
 */
function firstFailing(draft) {
  if (!String(draft.name || "").trim()) return 0;
  if (!String(draft.instructions || "").trim()) return 1;
  return -1;
}

function Editor(props) {
  var draft = props.draft;
  var t = translator(props.lang);
  var set = function (patch) { props.setDraft(Object.assign({}, draft, patch)); };

  var stepState = React.useState(0), step = stepState[0], setStep = stepState[1];
  var visitedState = React.useState(0), maxVisited = visitedState[0], setMaxVisited = visitedState[1];
  var invalidState = React.useState({}), invalid = invalidState[0], setInvalid = invalidState[1];
  var statusState = React.useState(""), status = statusState[0], setStatus = statusState[1];
  var tabState = React.useState("edit"), view = tabState[0], setView = tabState[1];
  var nameRef = React.useRef(null), instructionsRef = React.useRef(null), saveRef = React.useRef(null);
  var busy = !!props.busy;

  // 切步后把焦点交给这一步的第一个可操作元素。
  React.useEffect(function () {
    // 回到第一步聚焦名称；第二步聚焦指令输入框（预览态没有输入框就交给保存按钮）。
    var node = step === 0 ? nameRef.current : instructionsRef.current || saveRef.current;
    if (node && node.focus) node.focus();
  }, [step]);

  function mark(index, bad) {
    var next = Object.assign({}, invalid);
    if (bad) next[index] = true;
    else delete next[index];
    setInvalid(next);
  }

  function goBack() {
    setStatus("");
    setStep(Math.max(0, step - 1));
  }

  function blockedText(index) {
    return index === 0 ? t("role_name_required") : t("role_instructions_required");
  }

  // 「下一步」只放行当前步；若前面更早的步骤被改坏了（回跳后清空名称），也一并退回。
  function next() {
    var blocked = firstFailing(draft);
    if (blocked >= 0 && blocked <= step) {
      mark(blocked, true);
      setStatus(blockedText(blocked));
      setStep(blocked);
      return;
    }
    mark(step, false);
    setStatus("");
    var to = Math.min(1, step + 1);
    setStep(to);
    setMaxVisited(Math.max(maxVisited, to));
  }

  // 已访问的步骤可点击回跳；未访问的步骤由 stepper 自己禁用。
  function goTo(index) {
    if (index <= maxVisited) {
      setStatus("");
      setStep(index);
    }
  }

  // 保存前全量复核：某一处被清空就回到那一步，而不是静默失败。
  function submit() {
    var blocked = firstFailing(draft);
    if (blocked >= 0) {
      mark(blocked, true);
      setStatus(blockedText(blocked));
      setStep(blocked);
      return;
    }
    props.onSave();
  }

  function basicPane() {
    return h("div", { className: "wbr-step-pane" },
      h(Field, { h: h, label: t("role_name") },
        h("input", {
          ref: nameRef, name: "name", className: "wbr-input", value: draft.name || "",
          onChange: function (e) { mark(0, false); set({ name: e.target.value }); },
        })),
      invalid[0] ? h("p", { className: "wbr-field-error", role: "alert" }, t("role_name_required")) : null,
      h(Field, { h: h, label: t("role_description") },
        h("input", {
          name: "description", className: "wbr-input", value: draft.description || "",
          onChange: function (e) { set({ description: e.target.value }); },
        })));
  }

  function instructionsPane() {
    var text = String(draft.instructions || "");
    return h("div", { className: "wbr-step-pane" },
      h("section", { className: "wbr-instructions" },
        h("div", { className: "wbr-instructions-head" },
          h("strong", null, t("role_instructions")),
          h("span", { className: "wbr-count" }, t("role_chars", { n: text.trim().length })),
          h("div", { className: "wbr-tabs", role: "tablist" },
            h("button", {
              type: "button", role: "tab", className: "wbr-tab", "aria-selected": view === "edit",
              onClick: function () { setView("edit"); },
            }, h(Icon, { name: "pencil", size: 13 }), h("span", null, t("role_edit"))),
            h("button", {
              type: "button", role: "tab", className: "wbr-tab", "aria-selected": view === "preview",
              onClick: function () { setView("preview"); },
            }, h(Icon, { name: "eye", size: 13 }), h("span", null, t("role_preview"))))),
        view === "edit"
          ? h("textarea", {
            ref: instructionsRef, name: "instructions", className: "wbr-input", rows: 14,
            value: draft.instructions || "",
            onChange: function (e) { mark(1, false); set({ instructions: e.target.value }); },
          })
          : h("div", { className: "wbr-preview" },
            text.trim() ? h(Body, { text: text, mode: "markdown" }) : h("em", null, t("role_preview_empty")))),
      h("p", { className: "wbr-instructions-hint" }, t("role_instructions_hint")),
      invalid[1] ? h("p", { className: "wbr-field-error", role: "alert" }, t("role_instructions_required")) : null);
  }

  var panes = [basicPane, instructionsPane];
  var labels = ["role_step_basic", "role_step_instructions"];
  var steps = labels.map(function (key) { return { key: key, label: t(key) }; });

  return h("section", { className: "wb-card wbr-editor" },
    h("div", { className: "wbr-editor-head" },
      h("strong", null, t(draft.mode === "create" ? "role_wizard_new" : "role_wizard_edit")),
      draft.id ? h("code", null, draft.id) : null),
    h(Steps, {
      h: h, steps: steps, current: step, maxVisited: maxVisited, invalid: invalid,
      disabled: busy, label: t("role_step_label"), onJump: goTo, className: "wbr-steps",
    }),
    panes[step](),
    status ? h("p", { className: "wbr-step-status", role: "alert" }, status) : null,
    h("div", { className: "wbr-wizard-foot" },
      h(Button, { icon: "x", onClick: props.onCancel, disabled: busy }, t("role_cancel")),
      h("div", { className: "wbr-wizard-nav" },
        step > 0 ? h(Button, { icon: "arrow-left", onClick: goBack, disabled: busy }, t("role_back")) : null,
        step < 1
          ? h(Button, { icon: "arrow-right", onClick: next, disabled: busy }, t("role_next_step"))
          : h(Button, { icon: "check", ref: saveRef, onClick: submit, disabled: busy }, t("role_save")))));
}

module.exports = Editor;
module.exports.firstFailing = firstFailing;
