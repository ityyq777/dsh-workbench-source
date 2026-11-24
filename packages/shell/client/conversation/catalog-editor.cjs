"use strict";
/**
 * 角色编辑器：指令可编辑/可预览，动作从真实动作目录勾选并支持手动补充，
 * 保存前逐个校验动作名是否存在（写错一个名字，这个角色以后每次调用都会被
 * tool-policy 的精确白名单拒掉，所以这里必须在提交前拦住）。
 */
var React = require("react");
var h = React.createElement;
var common = require("../../../addons/lib/client-common.cjs")("wbr");
var Btn = common.Btn, Field = common.Field, Notice = common.Notice;
var Body = require("../../../addons/lib/markdown.cjs").createBody(React);
var groups = require("./catalog-groups.cjs");

function Editor(props) {
  var draft = props.draft, lang = props.lang === "en";
  var tr = function (zh, en) { return lang ? en : zh; };
  var set = function (patch) { props.setDraft(Object.assign({}, draft, patch)); };
  var tab = React.useState("edit"), view = tab[0], setView = tab[1];
  var pick = React.useState(""), query = pick[0], setQuery = pick[1];
  var catalog = props.catalog;
  var picked = draft.actions || [];
  var manual = groups.parseManual(draft.manual);
  var effective = groups.dedupe(picked.concat(manual));
  var checked = groups.validateActions(effective, catalog);
  var unknown = checked.unknown;

  function toggle(name) {
    var next = picked.indexOf(name) >= 0 ? picked.filter(function (x) { return x !== name; }) : picked.concat([name]);
    set({ actions: next });
  }

  var catalogRows = (catalog || []).filter(function (item) {
    if (!query.trim()) return true;
    return String(item.name + " " + (item.description || "")).toLowerCase().indexOf(query.trim().toLowerCase()) >= 0;
  });
  var table = groups.groupActions(catalogRows.map(function (item) { return item.name; }));
  var byName = Object.create(null);
  (catalog || []).forEach(function (item) { byName[item.name] = item; });

  function actionsPane() {
    return h("section", { className: "wbr-actions" },
      h("div", { className: "wbr-actions-head" },
        h("strong", null, tr("允许的工作台动作", "Allowed workbench actions")),
        h("span", { className: "wbr-count" }, tr("已选 ", "Selected ") + effective.length + tr(" 项", ""))),
      props.catalogError ? h(Notice, { h: h, kind: "warn", text: props.catalogError }) : null,
      h("input", { name: "actionSearch", className: "wbr-input", value: query, placeholder: tr("筛选动作名或说明", "Filter actions"), onChange: function (e) { setQuery(e.target.value); } }),
      h("div", { className: "wbr-actions-groups" }, table.map(function (group) {
        return h("div", { key: group.domain, className: "wbr-actions-group" },
          h("div", { className: "wbr-actions-domain" }, group.domain, h("span", { className: "wbr-count" }, String(group.items.length))),
          group.items.map(function (name) {
            var item = byName[name] || {};
            return h("label", { key: name, className: "wbr-check", title: item.description || name },
              h("input", { type: "checkbox", name: "action:" + name, checked: picked.indexOf(name) >= 0, onChange: function () { toggle(name); } }),
              h("code", null, name));
          }));
      })),
      h(Field, { h: h, label: tr("手动补充动作名（每行一个）", "Extra action names (one per line)"), hint: tr("用于目录里暂未列出、但确实存在的动作", "For actions that are valid but not listed") },
        h("textarea", { name: "manual", className: "wbr-input", rows: 3, value: draft.manual || "", onChange: function (e) { set({ manual: e.target.value }); } })),
      unknown.length ? h("div", { className: "wbr-unknown", role: "alert" },
        h("strong", null, tr("这些动作不存在：", "These actions do not exist: ")),
        h("span", null, unknown.join("、")),
        h("small", null, tr("请改成真实动作名后再保存，否则角色每次调用都会被拒。", "Fix the names before saving, otherwise every call from this role will be rejected."))) : null);
  }

  return h("section", { className: "wb-card wbr-editor" },
    h("div", { className: "wbr-editor-head" },
      h("strong", null, draft.mode === "create" ? tr("新建角色", "New role") : tr("编辑角色", "Edit role")),
      h("small", null, draft.id || "")),
    h(Field, { h: h, label: tr("名称", "Name") },
      h("input", { name: "name", className: "wbr-input", value: draft.name || "", onChange: function (e) { set({ name: e.target.value }); } })),
    h(Field, { h: h, label: tr("职责简介", "Description") },
      h("input", { name: "description", className: "wbr-input", value: draft.description || "", onChange: function (e) { set({ description: e.target.value }); } })),
    h("section", { className: "wbr-instructions" },
      h("div", { className: "wbr-instructions-head" },
        h("strong", null, tr("角色指令", "Instructions")),
        h("div", { className: "wbr-tabs", role: "tablist" },
          h("button", { type: "button", role: "tab", "aria-selected": view === "edit", className: "wbr-tab", onClick: function () { setView("edit"); } }, tr("编辑", "Edit")),
          h("button", { type: "button", role: "tab", "aria-selected": view === "preview", className: "wbr-tab", onClick: function () { setView("preview"); } }, tr("预览", "Preview")))),
      view === "edit"
        ? h("textarea", { name: "instructions", className: "wbr-input", rows: 8, value: draft.instructions || "", onChange: function (e) { set({ instructions: e.target.value }); } })
        : h("div", { className: "wbr-preview" }, (draft.instructions || "").trim() ? h(Body, { text: draft.instructions, mode: "markdown" }) : h("em", null, tr("还没有内容", "Nothing to preview")))),
    actionsPane(),
    h("div", { className: "wb-sec" },
      h(Btn, { h: h, onClick: props.onSave, disabled: props.busy || unknown.length > 0 || !String(draft.name || "").trim() || !String(draft.instructions || "").trim() }, tr("保存", "Save")),
      h(Btn, { h: h, onClick: props.onCancel, disabled: props.busy }, tr("取消", "Cancel"))));
}

module.exports = Editor;
