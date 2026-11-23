"use strict";
/**
 * 宿主系统页的零散渲染逻辑（两个来源权限页 + 首页「工作台管理」入口卡片）。
 *
 * 1. 宿主 action 页：复用 addons 的共享 Action 页（域固定 wb-shell），列出宿主自己
 *    提供的元 action，来源由共享视图调 actions.setActionOrigins 修改；宿主这里只负责
 *    把页面壳、语言和 wb-shell 的 action 端点接上。
 * 2. Agent 权限清单页：只读，跨域列出「生效来源包含 agent」的全部 action，供一眼看清
 *    agent 现在能动什么；不提供任何写操作。
 *
 * 单独成文件是为了让 client.src.cjs 守住单文件 600 行红线，别把挂载逻辑再塞回去。
 */
var common = require("../../addons/lib/client-common.cjs")("wb");
var createActionSchemaView = require("../../addons/lib/action-schema-view.cjs");

/**
 * 渲染「Agent 权限」整页。deps: { jsx, t, lang, api, head }。
 * head(title, desc) 由宿主传入（含返回首页按钮与标题栏），保持与其它系统页一致。
 */
function agentAccessPage(deps) {
  var jsx = deps.jsx;
  var t = deps.t;
  var lang = deps.lang;
  var api = deps.api;
  var View = createActionSchemaView({ domain: "wb-shell", source: "actions.list", prefix: "wb" }).ActionSchemaView;
  // 宿主页没有业务插件的 apiFor，直接走 wb-shell 的 action 端点；跨域由宿主按 action 前缀路由。
  var hostApi = {
    call: function (action, args) {
      return api.post("/domains/wb-shell/actions/" + encodeURIComponent(action), args || {});
    },
  };
  return jsx.jsxs("div", { className: "wb-root", children: [
    jsx.jsxs("div", { className: "wb-inner wb-wide", children: [
      deps.head(t("tab_agent"), t("agent_desc")),
      jsx.jsx(View, { api: hostApi, lang: lang }),
    ] }),
  ] });
}

/**
 * 渲染「Agent 权限清单」整页（只读）。deps: { jsx, React, t, lang, api, head }。
 * 数据源是宿主 actions.list（跨域），客户端只做筛选与排序，不改任何状态。
 */
function agentListPage(deps) {
  var jsx = deps.jsx;
  var React = deps.React;
  var t = deps.t;
  var lang = deps.lang;
  var api = deps.api;
  var hostApi = {
    call: function (action, args) {
      return api.post("/domains/wb-shell/actions/" + encodeURIComponent(action), args || {});
    },
  };

  function AgentListBody() {
    var state = React.useState({ loading: true, error: "", actions: [] });
    var snap = state[0], setSnap = state[1];
    var qState = React.useState("");
    var q = qState[0], setQ = qState[1];
    var domainState = React.useState("");
    var domainPick = domainState[0], setDomainPick = domainState[1];

    React.useEffect(function () {
      var alive = true;
      common.call(hostApi, "actions.list", { detail: true }).then(function (result) {
        if (!alive) return;
        var list = result && result.actions;
        if (!Array.isArray(list) || list.some(function (a) { return !a || !a.name || !a.domain || !Array.isArray(a.origins); })) throw new Error(t("agent_list_invalid"));
        setSnap({ loading: false, error: "", actions: list });
      }).catch(function (error) {
        if (!alive) return;
        setSnap({ loading: false, error: (error && error.message) || String(error), actions: [] });
      });
      return function () { alive = false; };
    }, []);

    // agent 视角口径：生效来源里包含 agent（声明不支持或被本机关掉的都不算）。
    var opened = snap.actions.filter(function (a) {
      return Array.isArray(a.origins) && a.origins.indexOf("agent") >= 0;
    });
    var domains = [];
    opened.forEach(function (a) { if (a.domain && domains.indexOf(a.domain) < 0) domains.push(a.domain); });
    domains.sort();
    if (domainPick && domains.indexOf(domainPick) < 0) domains.unshift(domainPick);
    var rows = opened.filter(function (a) {
      if (domainPick && a.domain !== domainPick) return false;
      if (!q.trim()) return true;
      var text = [a.name, a.domain, a.description].join(" ").toLowerCase();
      return text.indexOf(q.trim().toLowerCase()) >= 0;
    });

    var head = !snap.loading && !snap.error && jsx.jsx("div", { className: "wb-audit-summary", role: "status", "aria-live": "polite", children: [
      jsx.jsx("span", { children: t("agent_list_count").replace("{n}", String(rows.length)).replace("{all}", String(opened.length)).replace("{d}", String(domains.length)) }),
      jsx.jsx("span", { className: "wb-audit-dim", children: t("agent_list_readonly") }),
    ] });

    var filters = jsx.jsxs("div", { className: "wb-audit-filters", children: [
      jsx.jsxs("label", { className: "wb-audit-field", children: [
        jsx.jsx("span", { children: t("agent_list_search") }),
        jsx.jsx("input", { className: "wb-input", type: "search", "data-agent-search": "1", placeholder: t("agent_list_search_ph"), value: q, onChange: function (e) { setQ(e.target.value); } }),
      ] }),
      jsx.jsxs("label", { className: "wb-audit-field", children: [
        jsx.jsx("span", { children: t("agent_list_domain") }),
        jsx.jsxs("select", { className: "wb-select", "data-agent-domain": "1", value: domainPick, onChange: function (e) { setDomainPick(e.target.value); }, children: [
          jsx.jsx("option", { value: "", children: t("agent_list_all_domains") }),
          domains.map(function (d) { return jsx.jsx("option", { value: d, children: d }, d); }),
        ] }),
      ] }),
    ] });

    var body;
    if (snap.loading) body = jsx.jsx("div", { className: "wb-msg", role: "status", children: t("agent_list_loading") });
    else if (snap.error) body = jsx.jsx("div", { className: "wb-err", role: "alert", children: snap.error });
    else if (!rows.length) body = jsx.jsx("div", { className: "wb-msg wb-empty-cta", children: t(opened.length ? "agent_list_no_match" : "agent_list_empty") });
    else {
      body = jsx.jsx("div", { style: { overflowX: "auto" }, children: jsx.jsxs("table", { className: "wb-audit-table", "data-agent-list": "1", children: [
        jsx.jsx("thead", { children: jsx.jsx("tr", { children: [
          jsx.jsx("th", { children: t("agent_list_col_action") }),
          jsx.jsx("th", { children: t("agent_list_col_domain") }),
          jsx.jsx("th", { children: t("agent_list_col_desc") }),
          jsx.jsx("th", { children: t("agent_list_col_origins") }),
        ] }) }),
        jsx.jsx("tbody", { children: rows.map(function (a) {
          var declared = Array.isArray(a.originsDeclared) ? a.originsDeclared : a.origins;
          var narrow = Array.isArray(declared) && declared.length < 4;
          return jsx.jsxs("tr", { "data-agent-row": a.name, children: [
            jsx.jsx("td", { className: "wb-audit-mono", children: a.name }),
            jsx.jsx("td", { className: "wb-audit-dim", children: a.domain || "—" }),
            jsx.jsx("td", { children: a.description || "—" }),
            jsx.jsx("td", { children: jsx.jsxs("span", { className: "wb-audit-mono", children: [
              (a.origins || []).join(" · "),
              narrow ? jsx.jsx("span", { className: "wb-audit-dim", children: "  (" + t("agent_list_narrow") + " " + declared.join("/") + ")" }) : null,
            ] }) }),
          ] }, a.name);
        }) }),
      ] }) });
    }

    return jsx.jsxs("div", { children: [filters, head, body] });
  }

  return jsx.jsxs("div", { className: "wb-root", children: [
    jsx.jsxs("div", { className: "wb-inner wb-wide", children: [
      deps.head(t("tab_agent_list"), t("agent_list_desc")),
      jsx.jsx(AgentListBody, {}),
    ] }),
  ] });
}

/**
 * 首页「工作台管理」的入口卡片。deps: { t, systemCard }，顺序即展示顺序。
 */
function manageCards(deps) {
  var t = deps.t;
  var card = deps.systemCard;
  return [
    card("agent", "agent", t("tab_agent"), t("agent_desc")),
    card("agentList", "agent", t("tab_agent_list"), t("agent_list_desc")),
    card("queue", "队", t("tab_queue"), t("queue_desc")),
    card("data", "数", t("tab_data"), t("data_desc")),
    card("config", "配", t("tab_config"), t("config_desc")),
    card("backup", "backup", t("tab_backup"), t("backup_desc")),
    card("audit", "audit", t("tab_audit"), t("audit_desc")),
    card("account", "account", t("tab_account"), t("account_desc")),
  ];
}

module.exports = { agentAccessPage: agentAccessPage, agentListPage: agentListPage, manageCards: manageCards };
