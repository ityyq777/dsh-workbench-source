"use strict";
/**
 * 角色编辑器：四步向导（基本信息 → 角色指令 → 允许的动作 → 确认与保存）。
 *
 * 为什么分步：角色配置其实是三个互相独立的决定——叫什么、怎么干、能调什么。
 * 以前平铺在一张卡片里，窄屏要滚好几屏才能看到保存按钮，出错也说不清卡在哪一步。
 * 步骤导航直接用共享控件 lib/stepper.cjs，这里只负责每步的内容、逐步校验、
 * 保存前的全量复核（回到第一个不合格的步骤）和跨步保留的草稿。
 *
 * 动作名校验不能省：写错一个名字，这个角色以后每次调用都会被 tool-policy 的
 * 精确白名单拒掉，所以在离开「允许的动作」这一步之前就要拦住。
 */
var React = require("react");
var h = React.createElement;
var common = require("../../../addons/lib/client-common.cjs")("wbr");
var Btn = common.Btn, Field = common.Field, Notice = common.Notice;
var Body = require("../../../addons/lib/markdown.cjs").createBody(React);
var Steps = require("../../../addons/lib/stepper.cjs").Steps;
var LOCALE = require("../locale.cjs");
var groups = require("./catalog-groups.cjs");

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
function firstFailing(draft, catalog) {
  if (!String(draft.name || "").trim()) return 0;
  if (!String(draft.instructions || "").trim()) return 1;
  var picked = (draft.actions || []).concat(groups.parseManual(draft.manual));
  if (groups.validateActions(picked, catalog).unknown.length) return 2;
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
  var pickState = React.useState(""), query = pickState[0], setQuery = pickState[1];
  var nameRef = React.useRef(null), instructionsRef = React.useRef(null);
  var searchRef = React.useRef(null), saveRef = React.useRef(null);

  var catalog = props.catalog;
  var picked = draft.actions || [];
  var manual = groups.parseManual(draft.manual);
  var effective = groups.dedupe(picked.concat(manual));
  var unknown = groups.validateActions(effective, catalog).unknown;
  var busy = !!props.busy;

  // 切步后把焦点交给这一步的第一个可操作元素，键盘用户不用再 Tab 一轮。
  React.useEffect(function () {
    var refs = [nameRef, instructionsRef, searchRef, saveRef];
    var node = refs[step] && refs[step].current;
    if (node && node.focus) node.focus();
  }, [step]);

  function mark(index, bad) {
    var next = Object.assign({}, invalid);
    if (bad) next[index] = true;
    else delete next[index];
    setInvalid(next);
  }

  function toggle(name) {
    set({ actions: picked.indexOf(name) >= 0 ? picked.filter(function (x) { return x !== name; }) : picked.concat([name]) });
  }

  // 一次勾选/清空整域的动作，40 项以上的目录里不用逐个点。
  function toggleDomain(items, on) {
    var next = picked.slice();
    items.forEach(function (name) {
      var at = next.indexOf(name);
      if (on && at < 0) next.push(name);
      if (!on && at >= 0) next.splice(at, 1);
    });
    set({ actions: next });
  }

  function goBack() {
    setStatus("");
    setStep(Math.max(0, step - 1));
  }

  function blockedText(index) {
    if (index === 0) return t("role_name_required");
    if (index === 1) return t("role_instructions_required");
    return t("role_unknown_hint");
  }

  // 「下一步」只放行当前步；若前面更早的步骤被改坏了（回跳后清空名称），也一并退回。
  function next() {
    var blocked = firstFailing(draft, catalog);
    if (blocked >= 0 && blocked <= step) {
      mark(blocked, true);
      setStatus(blockedText(blocked));
      setStep(blocked);
      return;
    }
    mark(step, false);
    setStatus("");
    var to = Math.min(3, step + 1);
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

  // 保存前全量复核：某一处被清空（或手填了坏动作名）就回到那一步，而不是静默失败。
  function submit() {
    var blocked = firstFailing(draft, catalog);
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
            h("button", { type: "button", role: "tab", "aria-selected": view === "edit", className: "wbr-tab", onClick: function () { setView("edit"); } }, t("role_edit")),
            h("button", { type: "button", role: "tab", "aria-selected": view === "preview", className: "wbr-tab", onClick: function () { setView("preview"); } }, t("role_preview")))),
        view === "edit"
          ? h("textarea", {
            ref: instructionsRef, name: "instructions", className: "wbr-input", rows: 12, value: draft.instructions || "",
            onChange: function (e) { mark(1, false); set({ instructions: e.target.value }); },
          })
          : h("div", { className: "wbr-preview" }, text.trim() ? h(Body, { text: text, mode: "markdown" }) : h("em", null, t("role_preview_empty")))),
      invalid[1] ? h("p", { className: "wbr-field-error", role: "alert" }, t("role_instructions_required")) : null);
  }

  function actionsPane() {
    var catalogRows = (catalog || []).filter(function (item) {
      if (!query.trim()) return true;
      return String(item.name + " " + (item.description || "")).toLowerCase().indexOf(query.trim().toLowerCase()) >= 0;
    });
    var table = groups.groupActions(catalogRows.map(function (item) { return item.name; }));
    var byName = Object.create(null);
    (catalog || []).forEach(function (item) { byName[item.name] = item; });

    return h("div", { className: "wbr-step-pane" },
      h("section", { className: "wbr-actions" },
        h("div", { className: "wbr-actions-head" },
          h("strong", null, t("role_actions_title")),
          h("span", { className: "wbr-count" }, t("role_actions_selected", { n: effective.length }))),
        props.catalogError ? h(Notice, { h: h, kind: "warn", text: props.catalogError }) : null,
        h("input", {
          ref: searchRef, name: "actionSearch", className: "wbr-input", value: query,
          placeholder: t("role_actions_search"),
          onChange: function (e) { setQuery(e.target.value); },
        }),
        h("div", { className: "wbr-actions-groups" }, table.map(function (group) {
          return h("div", { key: group.domain, className: "wbr-actions-group" },
            h("div", { className: "wbr-actions-grouphead" },
              h("span", { className: "wbr-actions-domain" }, group.domain, h("span", { className: "wbr-count" }, String(group.items.length))),
              h("button", { type: "button", className: "wbr-mini", onClick: function () { toggleDomain(group.items, true); } }, t("role_actions_select_all")),
              h("button", { type: "button", className: "wbr-mini", onClick: function () { toggleDomain(group.items, false); } }, t("role_actions_clear"))),
            h("div", { className: "wbr-actions-checks" }, group.items.map(function (name) {
              var item = byName[name] || {};
              return h("label", { key: name, className: "wbr-check", title: item.description || name },
                h("input", { type: "checkbox", name: "action:" + name, checked: picked.indexOf(name) >= 0, onChange: function () { toggle(name); } }),
                h("code", null, name));
            })));
        })),
        h(Field, { h: h, label: t("role_actions_manual"), hint: t("role_actions_manual_hint") },
          h("textarea", {
            name: "manual", className: "wbr-input", rows: 3, value: draft.manual || "",
            onChange: function (e) { mark(2, false); set({ manual: e.target.value }); },
          })),
        unknown.length ? h("div", { className: "wbr-unknown", role: "alert" },
          h("strong", null, t("role_unknown_title")),
          h("span", null, unknown.join("、")),
          h("small", null, t("role_unknown_hint"))) : null));
  }

  function summaryRow(label, value) {
    return h("div", { className: "wbr-summary-row" },
      h("dt", null, label), h("dd", null, value || t("role_summary_empty")));
  }

  function confirmPane() {
    var chips = groups.groupActions(effective);
    return h("div", { className: "wbr-step-pane" },
      h("dl", { className: "wbr-summary" },
        summaryRow(t("role_summary_name"), draft.name),
        summaryRow(t("role_summary_description"), draft.description),
        summaryRow(t("role_summary_actions"), t("role_summary_actions_value", { n: effective.length })),
        summaryRow(t("role_summary_instructions"), t("role_summary_chars", { n: String(draft.instructions || "").trim().length })),
        summaryRow(t("role_summary_effect"), t("role_summary_effect_value"))),
      chips.length ? h("div", { className: "wbr-chips" }, chips.map(function (group) {
        return h("code", { key: group.domain, className: "wbr-chip" }, group.domain + " " + group.items.length);
      })) : null,
      unknown.length ? h("p", { className: "wbr-field-error", role: "alert" },
        t("role_unknown_title") + " " + unknown.join("、")) : null);
  }

  var panes = [basicPane, instructionsPane, actionsPane, confirmPane];
  var labels = ["role_step_basic", "role_step_instructions", "role_step_actions", "role_step_confirm"];
  var steps = labels.map(function (key) { return { key: key, label: t(key) }; });

  return h("section", { className: "wb-card wbr-editor" },
    h("div", { className: "wbr-editor-head" },
      h("strong", null, draft.mode === "create" ? t("role_wizard_new") : t("role_wizard_edit")),
      draft.id ? h("code", null, draft.id) : null),
    h(Steps, {
      h: h, steps: steps, current: step, maxVisited: maxVisited, invalid: invalid,
      disabled: busy, label: t("role_step_label"), onJump: goTo, className: "wbr-steps",
    }),
    panes[step](),
    status ? h("p", { className: "wbr-step-status", role: "status" }, status) : null,
    h("div", { className: "wbr-wizard-foot" },
      h(Btn, { h: h, onClick: props.onCancel, disabled: busy }, t("role_cancel")),
      h("div", { className: "wbr-wizard-nav" },
        step > 0 ? h(Btn, { h: h, onClick: goBack, disabled: busy }, t("role_back")) : null,
        step < 3
          ? h(Btn, { h: h, onClick: next, disabled: busy }, t("role_next_step"))
          : h(Btn, { h: h, onClick: submit, disabled: busy }, t("role_save")))));
}

module.exports = Editor;
module.exports.firstFailing = firstFailing;
