"use strict";
/**
 * 宿主系统页的零散渲染逻辑（「Agent 权限」页 + 首页「工作台管理」入口卡片）。
 *
 * Agent 权限页直接复用 addons 的共享 Action 页：数据源是 actions.list（域固定
 * wb-shell），每个 action 的开关由共享视图调 actions.setAgentAccess，宿主这里
 * 只负责把页面壳、语言和 wb-shell 的 action 端点接上。
 *
 * 单独成文件是为了让 client.src.cjs 守住单文件 600 行红线，别把挂载逻辑再塞回去。
 */
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
 * 首页「工作台管理」的入口卡片。deps: { t, systemCard }，顺序即展示顺序。
 */
function manageCards(deps) {
  var t = deps.t;
  var card = deps.systemCard;
  return [
    card("agent", "agent", t("tab_agent"), t("agent_desc")),
    card("backup", "backup", t("tab_backup"), t("backup_desc")),
    card("audit", "audit", t("tab_audit"), t("audit_desc")),
    card("account", "account", t("tab_account"), t("account_desc")),
  ];
}

module.exports = { agentAccessPage: agentAccessPage, manageCards: manageCards };
