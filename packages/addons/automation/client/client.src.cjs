"use strict";
// 自动化客户端：概览 / 规则 / 运行记录 / 设置 / 数据 / Action 六个视图。
(function () {
  var root = typeof window !== "undefined" ? window : null;
  var host = root && root.__WB_HOST__;
  if (!host || !host.react) {
    if (typeof console !== "undefined") console.error("[dsh-workbench-automation] 宿主前端未就绪");
    module.exports = { name: "dsh-workbench-automation", inject: [], apply: function () {} };
    return;
  }
  var React = host.react;
  var h = host.h;
  var CSS = require("./ui/styles.cjs");
  var ICONS = {
    activity: require("lucide-react/icons/activity").default,
    zap: require("lucide-react/icons/zap").default,
    history: require("lucide-react/icons/history").default,
    sliders: require("lucide-react/icons/sliders-horizontal").default,
    database: require("lucide-react/icons/database").default,
    list: require("lucide-react/icons/list").default,
  };
  function Icon(props) { var C = ICONS[props.name] || ICONS.zap; return h(C, { size: props.size || 14, strokeWidth: 2, "aria-hidden": "true", className: "wbg-svg" }); }
  function tabIcon(name) { return function () { return h(Icon, { name: name, size: 14 }); }; }
  function withProps(Inner, title) { return function Wrapped(props) { return h(Inner, { api: props.api, lang: props.lang === "en" ? "en" : "zh", h: h, React: React, title: title }); }; }
  function ensureStyles() {
    if (typeof document === "undefined" || !document.head) return;
    if (document.getElementById("wb-automation-style")) return;
    var style = document.createElement("style");
    style.id = "wb-automation-style";
    style.textContent = CSS;
    document.head.appendChild(style);
  }
  ensureStyles();
  host.registerAddon({
    id: "wb-addon-automation",
    version: "0.1.0",
    views: [
      { id: "stats", icon: tabIcon("activity"), title: { zh: "概览", en: "Overview" }, component: withProps(require("./views/stats.cjs"), "概览") },
      { id: "rules", icon: tabIcon("zap"), title: { zh: "规则", en: "Rules" }, component: withProps(require("./views/rules.cjs"), "规则") },
      { id: "runs", icon: tabIcon("history"), title: { zh: "运行记录", en: "Runs" }, component: withProps(require("./views/runs.cjs"), "运行记录") },
      { id: "config", icon: tabIcon("sliders"), title: { zh: "设置", en: "Settings" }, component: withProps(require("./views/config.cjs"), "设置") },
      { id: "data", icon: tabIcon("database"), title: { zh: "数据", en: "Data" }, component: withProps(require("./views/data.cjs"), "数据") },
      { id: "actions", icon: tabIcon("list"), title: { zh: "Action", en: "Actions" }, component: withProps(require("./views/actions.cjs"), "Action") },
    ],
  });
  module.exports = { name: "dsh-workbench-automation", inject: [], apply: function () {} };
})();
