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
 *
 * 版面按 AGENTS「界面红线」：页面撑满可用宽度（不再居中收窄），左列表 + 右详情是
 * 两栏工作区，各自内部滚动（根节点带 wb-fill），窄屏退回单列整页滚动。
 */
var React = require("react");
var h = React.createElement;
var common = require("../../../addons/lib/client-common.cjs")("wbr");
var Notice = common.Notice, Empty = common.Empty, Pill = common.Pill, unwrap = common.unwrap;
var bodyCopy = require("../../../addons/lib/body-copy.cjs");
var BodyMode = require("../../../addons/lib/body-toggle.cjs")(React);
var createBody = require("../../../addons/lib/markdown.cjs").createBody;
var Icon = require("./icons.cjs").Icon;
// 按钮统一走共享按钮控件：图标 + 文字（窄屏由基础样式收成纯图标），自带 aria-label/title。
var Button = require("../../../addons/lib/button.cjs")({ prefix: "wbr", Icon: Icon });
var groups = require("./catalog-groups.cjs");
var Editor = require("./catalog-editor.cjs");
var Body = createBody(React);

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
  // 指令正文只在「渲染」与「纯文本」之间切换，不写全局偏好（共享开关按块受控）。
  var modeState = React.useState("markdown"), mode = modeState[0], setMode = modeState[1];
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
        className: "wbr-input wbr-filter",
        value: filter.source,
        "aria-label": tr("按来源筛选", "Filter by source"),
        onChange: function (e) { setFilter(Object.assign({}, filter, { source: e.target.value })); },
      },
        h("option", { value: "" }, tr("全部来源", "All sources")),
        h("option", { value: "plugin" }, tr("插件角色", "Plugin roles")),
        h("option", { value: "user" }, tr("自定义角色", "Custom roles"))),
      h("select", {
        name: "domain",
        className: "wbr-input wbr-filter",
        value: filter.domain,
        "aria-label": tr("按域筛选", "Filter by domain"),
        onChange: function (e) { setFilter(Object.assign({}, filter, { domain: e.target.value })); },
      },
        h("option", { value: "" }, tr("全部域", "All domains")),
        groups.domainsOf(rows || []).map(function (domain) {
          return h("option", { key: domain, value: domain }, domain);
        })),
      h(Button, {
        icon: "plus", kind: "primary",
        onClick: function () { setDraft(blankDraft()); setDelete(""); },
        disabled: !!draft,
      }, tr("新建角色", "New role")));
  }

  function badge(role) {
    return h(Pill, { h: h, kind: role.source === "user" ? "info" : "" },
      role.source === "user" ? tr("自定义", "Custom") : tr("插件", "Plugin"));
  }

  /** 左栏一行：图标 + 名称 + 元信息，整行都可点，靠 aria-pressed 表示当前角色。 */
  function row(role) {
    return h("button", {
      key: role.id,
      type: "button",
      role: "listitem",
      className: "wbr-item",
      "aria-pressed": role.id === selected,
      onClick: function () { setSelected(role.id); setDraft(null); setDelete(""); },
    },
      h("span", { className: "wbr-item-glyph" },
        h(Icon, { name: role.source === "user" ? "user" : "bot", size: 14 })),
      h("span", { className: "wbr-item-body" },
        h("span", { className: "wbr-item-name" }, role.name),
        h("span", { className: "wbr-item-meta" },
          badge(role),
          h("code", { className: "wbr-item-id", title: role.id }, role.id),
          h("span", { className: "wbr-item-ver" }, "v" + role.version))));
  }

  function list() {
    if (rows === null) return h("div", { className: "wbr-list-note" }, h(Notice, { h: h, text: tr("正在读取角色…", "Loading roles…") }));
    if (!rows.length) return h("div", { className: "wbr-list-note" }, h(Empty, { h: h, text: tr("暂无角色", "No roles") }));
    if (!filtered.length) return h("div", { className: "wbr-list-note" }, h(Empty, { h: h, text: tr("没有匹配的角色，试试清空筛选", "No role matches these filters") }));
    return h("div", { className: "wbr-items", role: "list" }, filtered.map(row));
  }

  function detail() {
    if (!current) {
      return h("article", { className: "wbr-panel wbr-detail is-empty" },
        h(Empty, { h: h, text: tr("从左侧选择一个角色查看详情", "Pick a role on the left") }));
    }
    var editable = current.source === "user";
    return h("article", { className: "wbr-panel wbr-detail" },
      h("header", { className: "wbr-detail-head" },
        h("div", { className: "wbr-detail-title" },
          h("h3", { className: "wbr-detail-name" }, current.name),
          badge(current)),
        h("div", { className: "wbr-detail-meta" },
          h("code", { className: "wbr-detail-id", title: current.id }, current.id),
          h("span", { className: "wbr-chip" }, "v" + current.version),
          h("span", { className: "wbr-chip" }, current.domain || "user"))),
      current.description ? h("p", { className: "wbr-detail-desc" }, current.description) : null,
      h("section", { className: "wbr-section" },
        h("div", { className: "wbr-section-head" },
          h("span", { className: "wbr-section-label" }, tr("角色指令", "Role instructions")),
          h(BodyMode, { mode: mode, onChange: setMode, label: tr("角色指令", "Role instructions"), t: bodyCopy[lang ? "en" : "zh"], Icon: Icon })),
        mode === "text"
          ? h("div", { className: "wb-body-text wbr-section-body" }, current.instructions)
          : h("div", { className: "wbr-section-body" }, h(Body, { text: current.instructions, mode: mode }))),
      h("footer", { className: "wbr-detail-foot" },
        h(Button, { icon: "copy", onClick: function () { mutate({ op: "copy", id: current.id }); }, disabled: busy || !!draft }, tr("复制为新角色", "Duplicate as a new role")),
        editable ? h(Button, { icon: "pencil", onClick: function () { setDraft(draftOf(current)); }, disabled: busy || !!draft }, tr("编辑", "Edit")) : null,
        editable ? h(Button, { icon: "trash-2", kind: "danger", onClick: function () { setDelete(current.id); }, disabled: busy || !!draft }, tr("删除", "Delete")) : null),
      pendingDelete === current.id ? h("div", { className: "wbr-danger-box", role: "group" },
        h("span", null, tr("删除后无法恢复，确定删除此角色？", "This cannot be undone. Delete this role?")),
        h(Button, { icon: "trash-2", kind: "danger", onClick: function () { mutate({ op: "delete", id: current.id }); }, disabled: busy }, tr("确认删除", "Confirm deletion")),
        h(Button, { icon: "x", onClick: function () { setDelete(""); }, disabled: busy }, tr("取消", "Cancel"))) : null);
  }

  return h("div", { className: "wb-root wbr-page" }, h("div", { className: "wb-inner wb-wide wb-stack" },
    props.head(tr("角色管理", "Role management"), tr("按来源与域查看角色：指令可读、可编辑，动作由指令约定而不做限制", "Browse roles by source and domain; instructions are readable and editable, actions are described by the instructions rather than restricted")),
    toolbar(),
    error ? h("div", { role: "alert" }, h(Notice, { h: h, kind: "error", text: error }), h(Button, { icon: "refresh-cw", onClick: refresh }, tr("重新加载", "Reload"))) : null,
    draft
      ? h(Editor, {
        h: h, lang: props.lang, draft: draft, setDraft: setDraft,
        busy: busy, onSave: submit, onCancel: function () { setDraft(null); },
      })
      : h("div", { className: "wbr-split wb-fill" }, h("section", { className: "wbr-panel wbr-list" }, list()), detail())));
}

module.exports = RoleCatalog;
