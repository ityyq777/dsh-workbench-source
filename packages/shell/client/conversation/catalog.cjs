"use strict";
/**
 * 角色管理页（宿主 route "roles"）。
 *
 * 职责边界：页面只管「读目录、筛选、看详情、编辑提交」。指令的 markdown 渲染复用
 * packages/addons/lib/description.cjs（内部走有界的 markdown.cjs，不引第三方包），
 * 过滤与域分组复用同目录的 catalog-groups.cjs，编辑器在 catalog-editor.cjs。
 *
 * 角色不限制动作：这一页既不再拉动作目录，也不再让用户勾选 action。角色对动作的
 * 期望写在角色指令（SOP）里，由模型自己遵守；写进草稿的 actions 原样带回，
 * 只是为了不把已有角色数据抹掉。
 */
var React = require("react");
var h = React.createElement;
var common = require("../../../addons/lib/client-common.cjs")("wbr");
var Btn = common.Btn, Notice = common.Notice, Empty = common.Empty, Pill = common.Pill, unwrap = common.unwrap;
var Description = require("../../../addons/lib/description.cjs").Description;
var groups = require("./catalog-groups.cjs");
var Editor = require("./catalog-editor.cjs");

var endpoint = "/role-catalog";

function catalogRows(response) {
  var value = unwrap(response);
  if (!Array.isArray(value && value.roles)) throw new Error("Invalid role catalog");
  return value.roles;
}

function blankDraft() {
  return { mode: "create", id: "", name: "", description: "", instructions: "", actions: [] };
}

function draftOf(role) {
  return {
    mode: "update",
    id: role.id,
    name: role.name || "",
    description: role.description || "",
    instructions: role.instructions || "",
    actions: (role.actions || []).slice(),
  };
}

/** 提交载荷：actions 只是原样带上已有值，界面不再编辑它。 */
function payloadOf(draft) {
  return {
    op: draft.mode,
    ...(draft.id ? { id: draft.id } : {}),
    name: String(draft.name || "").trim(),
    description: String(draft.description || "").trim(),
    instructions: String(draft.instructions || "").trim(),
    actions: groups.dedupe(draft.actions || []),
  };
}

function RoleCatalog(props) {
  var lang = props.lang === "en";
  var tr = function (zh, en) { return lang ? en : zh; };
  var rowsState = React.useState(null), rows = rowsState[0], setRows = rowsState[1];
  var errorState = React.useState(""), error = errorState[0], setError = errorState[1];
  var filterState = React.useState({ q: "", source: "", domain: "" }), filter = filterState[0], setFilter = filterState[1];
  var selectState = React.useState(""), selected = selectState[0], setSelected = selectState[1];
  var draftState = React.useState(null), draft = draftState[0], setDraft = draftState[1];
  var deleteState = React.useState(""), pendingDelete = deleteState[0], setDelete = deleteState[1];
  var busyState = React.useState(false), busy = busyState[0], setBusy = busyState[1];
  var lock = React.useRef(false), sequence = React.useRef(0);

  async function refresh() {
    var req = ++sequence.current;
    try {
      var next = catalogRows(await props.api.get(endpoint));
      if (req !== sequence.current) return;
      setRows(next);
      setError("");
    } catch (e) {
      if (req === sequence.current) setError(e.message);
    }
  }

  React.useEffect(function () {
    refresh();
    var stream = new EventSource("/workbench/api/events");
    var events = ["role-catalog", "domains-changed", "open"];
    events.forEach(function (event) { stream.addEventListener(event, refresh); });
    return function () {
      ++sequence.current;
      stream.close();
    };
  }, []);

  async function mutate(payload) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      var next = catalogRows(await props.api.post(endpoint, payload));
      ++sequence.current;
      setRows(next);
      setDraft(null);
      setDelete("");
    } catch (e) {
      setError(e.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  function submit() {
    mutate(payloadOf(draft));
  }

  var filtered = groups.filterRoles(rows || [], filter);
  var current = (rows || []).filter(function (role) { return role.id === selected; })[0] || null;

  function toolbar() {
    return h("div", { className: "wbr-toolbar" },
      h("input", {
        name: "search",
        className: "wbr-input wbr-search",
        value: filter.q,
        placeholder: tr("搜索名称、简介或指令", "Search name, description or instructions"),
        "aria-label": tr("搜索角色", "Search roles"),
        onChange: function (e) { setFilter(Object.assign({}, filter, { q: e.target.value })); },
      }),
      h("select", {
        name: "source",
        className: "wbr-input wbr-select",
        value: filter.source,
        "aria-label": tr("按来源筛选", "Filter by source"),
        onChange: function (e) { setFilter(Object.assign({}, filter, { source: e.target.value })); },
      },
        h("option", { value: "" }, tr("全部来源", "All sources")),
        h("option", { value: "plugin" }, tr("插件角色", "Plugin roles")),
        h("option", { value: "user" }, tr("自定义角色", "Custom roles"))),
      h("select", {
        name: "domain",
        className: "wbr-input wbr-select",
        value: filter.domain,
        "aria-label": tr("按域筛选", "Filter by domain"),
        onChange: function (e) { setFilter(Object.assign({}, filter, { domain: e.target.value })); },
      },
        h("option", { value: "" }, tr("全部域", "All domains")),
        groups.domainsOf(rows || []).map(function (domain) {
          return h("option", { key: domain, value: domain }, domain);
        })),
      h(Btn, { h: h, onClick: function () { setDraft(blankDraft()); setDelete(""); }, disabled: !!draft }, tr("新建角色", "New role")));
  }

  function badge(role) {
    return h(Pill, { h: h, kind: role.source === "user" ? "info" : "" },
      role.source === "user" ? tr("自定义", "Custom") : tr("插件", "Plugin"));
  }

  function list() {
    if (rows === null) return h(Notice, { h: h, text: tr("正在读取角色…", "Loading roles…") });
    if (!rows.length) return h(Empty, { h: h, text: tr("暂无角色", "No roles") });
    if (!filtered.length) return h(Empty, { h: h, text: tr("没有匹配的角色，试试清空筛选", "No role matches these filters") });
    return h("div", { className: "wbr-rows", role: "list" }, filtered.map(function (role) {
      return h("button", {
        key: role.id,
        type: "button",
        role: "listitem",
        className: "wbr-row" + (role.id === selected ? " on" : ""),
        "aria-pressed": role.id === selected,
        onClick: function () { setSelected(role.id); setDraft(null); setDelete(""); },
      },
        h("span", { className: "wbr-row-name" }, role.name),
        h("span", { className: "wbr-row-meta" }, badge(role), h("code", null, role.id), h("small", null, "v" + role.version)));
    }));
  }

  function detail() {
    if (!current) return h("div", { className: "wbr-detail wbr-detail-empty" }, h(Empty, { h: h, text: tr("从左侧选择一个角色查看详情", "Pick a role on the left") }));
    var editable = current.source === "user";
    return h("article", { className: "wbr-detail" },
      h("header", { className: "wbr-detail-head" },
        h("strong", null, current.name),
        badge(current),
        h("code", null, current.id),
        h("small", null, "v" + current.version + " · " + (current.domain || "user"))),
      current.description ? h("p", { className: "wbr-detail-desc" }, current.description) : null,
      h(Description, { text: current.instructions, lang: props.lang, bodyMode: "markdown" }),
      h("div", { className: "wb-sec" },
        h(Btn, { h: h, onClick: function () { mutate({ op: "copy", id: current.id }); }, disabled: busy || !!draft }, tr("复制为新角色", "Duplicate as a new role")),
        editable ? h(Btn, { h: h, onClick: function () { setDraft(draftOf(current)); }, disabled: busy || !!draft }, tr("编辑", "Edit")) : null,
        editable ? h(Btn, { h: h, onClick: function () { setDelete(current.id); }, disabled: busy || !!draft }, tr("删除", "Delete")) : null),
      pendingDelete === current.id ? h("div", { className: "wb-sec" },
        tr("确定删除此角色？", "Delete this role?"),
        h(Btn, { h: h, onClick: function () { mutate({ op: "delete", id: current.id }); }, disabled: busy }, tr("确认删除", "Confirm deletion")),
        h(Btn, { h: h, onClick: function () { setDelete(""); }, disabled: busy }, tr("取消", "Cancel"))) : null);
  }

  return h("div", { className: "wb-root" }, h("div", { className: "wb-inner wb-wide wb-stack" },
    props.head(tr("角色管理", "Role management"), tr("按来源与域查看角色：指令可读、可编辑，动作由指令约定而不做限制", "Browse roles by source and domain; instructions are readable and editable, actions are described by the instructions rather than restricted")),
    toolbar(),
    error ? h("div", { role: "alert" }, h(Notice, { h: h, kind: "error", text: error }), h(Btn, { h: h, onClick: refresh }, tr("重新加载", "Reload"))) : null,
    draft
      ? h(Editor, {
        h: h, lang: props.lang, draft: draft, setDraft: setDraft,
        busy: busy, onSave: submit, onCancel: function () { setDraft(null); },
      })
      : h("div", { className: "wbr-split" }, h("div", { className: "wbr-list" }, list()), detail())));
}

module.exports = RoleCatalog;
