// 配置方案条：新建/重命名/删除方案与「不使用方案」切换。
// 各插件配置页共用，样式通过 __P__ 前缀注入；只负责交互，数据由调用方读写。
"use strict";

var React = require("react");
var h = React.createElement;

var COPY = {
  zh: {
    title: "配置方案",
    none: "不使用方案（插件默认配置）",
    create: "新建方案",
    rename: "重命名",
    remove: "删除",
    namePlaceholder: "方案名称",
    ok: "确定",
    cancel: "取消",
    current: "当前方案",
    defaultHint: "未选择方案时使用插件默认配置；修改任意设置会自动新建「本机配置」方案。",
    syncedHint: "方案会随云端同步与备份一起走；当前选中哪个方案只保存在本机。",
    confirmDelete: "删除当前方案后会回到插件默认配置，确定删除？",
    createTitle: "新建配置方案",
    renameTitle: "重命名配置方案",
    fromCurrent: "从当前方案复制",
    fromDefault: "从插件默认开始",
  },
  en: {
    title: "Config scheme",
    none: "No scheme (plugin defaults)",
    create: "New scheme",
    rename: "Rename",
    remove: "Delete",
    namePlaceholder: "Scheme name",
    ok: "OK",
    cancel: "Cancel",
    current: "Active scheme",
    defaultHint: "With no scheme selected the plugin defaults apply. Editing any setting creates a local \"My config\" scheme automatically.",
    syncedHint: "Schemes sync to the cloud and travel with backups; which scheme this device uses stays local.",
    confirmDelete: "Deleting the active scheme returns to plugin defaults. Delete it?",
    createTitle: "New config scheme",
    renameTitle: "Rename config scheme",
    fromCurrent: "Copy active scheme",
    fromDefault: "Start from plugin defaults",
  },
};

var styles = [
  ".__P__-cfg-schemes{display:flex;flex-direction:column;gap:10px;padding:13px 16px;border:1px solid var(--cfg-line);border-radius:12px;background:var(--cfg-surface)}",
  ".__P__-cfg-schemes-main{display:flex;align-items:center;gap:10px;flex-wrap:wrap}",
  ".__P__-cfg-schemes-label{font-size:12.5px;font-weight:660;white-space:nowrap}",
  ".__P__-cfg-schemes-select{border:1px solid var(--cfg-line);background:var(--dsw-alias-bg-base,transparent);color:inherit;border-radius:9px;padding:7px 11px;font:inherit;font-size:13px;line-height:1.4;outline:none;min-width:190px;max-width:100%}",
  ".__P__-cfg-schemes-select:focus{border-color:var(--dsw-alias-brand-primary,currentColor);box-shadow:0 0 0 3px color-mix(in oklab,var(--dsw-alias-brand-primary,currentColor) 14%,transparent)}",
  ".__P__-cfg-schemes-actions{display:flex;gap:7px;flex-wrap:wrap}",
  ".__P__-cfg-sbtn{appearance:none;border:1px solid var(--cfg-line);background:transparent;color:inherit;border-radius:8px;padding:5px 11px;font:inherit;font-size:12px;line-height:1.5;cursor:pointer;transition:background .12s ease,border-color .12s ease}",
  ".__P__-cfg-sbtn:hover:not(:disabled){background:var(--cfg-hover);border-color:color-mix(in oklab,currentColor 28%,var(--cfg-line))}",
  ".__P__-cfg-sbtn:disabled{opacity:.5;cursor:default}",
  ".__P__-cfg-sbtn.danger{color:var(--dsw-alias-state-error-primary,inherit)}",
  ".__P__-cfg-schemes-form{display:flex;align-items:center;gap:7px;flex-wrap:wrap}",
  ".__P__-cfg-schemes-input{flex:1 1 180px;min-width:120px;border:1px solid var(--cfg-line);background:var(--dsw-alias-bg-base,transparent);color:inherit;border-radius:8px;padding:6px 10px;font:inherit;font-size:13px;outline:none}",
  ".__P__-cfg-schemes-input:focus{border-color:var(--dsw-alias-brand-primary,currentColor)}",
  ".__P__-cfg-schemes-hint{font-size:11.5px;color:var(--cfg-muted);line-height:1.6}",
];

function SchemeBar(props) {
  var lang = props.lang === "en" ? "en" : "zh";
  var c = COPY[lang];
  var prefix = props.prefix || "wb";
  var cls = function (suffix) { return "." + prefix + "-cfg-" + suffix; };
  var schemes = Array.isArray(props.schemes) ? props.schemes : [];
  var activeId = props.activeId || "";
  var busy = Boolean(props.busy);
  var [editing, setEditing] = React.useState(null);
  var [name, setName] = React.useState("");
  var [from, setFrom] = React.useState("current");

  function begin(mode) {
    var current = schemes.filter(function (s) { return s.id === activeId; })[0];
    setName(mode === "rename" && current ? current.name : "");
    setFrom(current ? "current" : "default");
    setEditing(mode);
  }

  function submit(event) {
    if (event && event.preventDefault) event.preventDefault();
    var value = String(name || "").trim();
    if (!value || busy) return;
    if (editing === "rename") props.onRename(activeId, value);
    else props.onCreate(value, from);
    setEditing(null);
    setName("");
  }

  function remove() {
    if (typeof window !== "undefined" && window.confirm && !window.confirm(c.confirmDelete)) return;
    props.onDelete(activeId);
  }

  return h(
    "div",
    { className: prefix + "-cfg-schemes" },
    h(
      "div",
      { className: prefix + "-cfg-schemes-main" },
      h("span", { className: prefix + "-cfg-schemes-label" }, c.title),
      h(
        "select",
        {
          className: prefix + "-cfg-schemes-select",
          value: activeId,
          disabled: busy,
          onChange: function (event) { props.onActivate(event.target.value || null); },
          "aria-label": c.title,
        },
        h("option", { value: "" }, c.none),
        schemes.map(function (s) { return h("option", { key: s.id, value: s.id }, s.name); })
      ),
      h("span", { className: prefix + "-cfg-schemes-hint" }, activeId ? c.current : "")
    ),
    editing
      ? h(
          "form",
          { className: prefix + "-cfg-schemes-form", onSubmit: submit },
          h("span", { className: prefix + "-cfg-schemes-label" }, editing === "rename" ? c.renameTitle : c.createTitle),
          h("input", {
            className: prefix + "-cfg-schemes-input",
            value: name,
            placeholder: c.namePlaceholder,
            maxLength: 64,
            autoFocus: true,
            disabled: busy,
            onChange: function (event) { setName(event.target.value); },
          }),
          editing === "create" && activeId
            ? h(
                "select",
                { className: prefix + "-cfg-schemes-select", value: from, disabled: busy, onChange: function (event) { setFrom(event.target.value); }, "aria-label": c.createTitle },
                h("option", { value: "current" }, c.fromCurrent),
                h("option", { value: "default" }, c.fromDefault)
              )
            : null,
          h("button", { className: prefix + "-cfg-sbtn", type: "submit", disabled: busy || !String(name || "").trim() }, c.ok),
          h("button", { className: prefix + "-cfg-sbtn", type: "button", disabled: busy, onClick: function () { setEditing(null); } }, c.cancel)
        )
      : h(
          "div",
          { className: prefix + "-cfg-schemes-actions" },
          h("button", { className: prefix + "-cfg-sbtn", type: "button", disabled: busy, onClick: function () { begin("create"); } }, c.create),
          activeId ? h("button", { className: prefix + "-cfg-sbtn", type: "button", disabled: busy, onClick: function () { begin("rename"); } }, c.rename) : null,
          activeId ? h("button", { className: prefix + "-cfg-sbtn danger", type: "button", disabled: busy, onClick: remove }, c.remove) : null
        ),
    h("div", { className: prefix + "-cfg-schemes-hint" }, activeId ? c.syncedHint : c.defaultHint)
  );
}

module.exports = { SchemeBar: SchemeBar, styles: styles, COPY: COPY };
