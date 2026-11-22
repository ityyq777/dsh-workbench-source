"use strict";
var GLYPHS = require("./ui/icons.cjs").ICONS;

(function () {
  var root = typeof window !== "undefined" ? window : null;
  var host = root && root.__WB_HOST__;
  if (!host || !host.react) {
    if (typeof console !== "undefined") console.error("[dsh-workbench-salary] 宿主前端未就绪");
    module.exports = { name: "dsh-workbench-salary", inject: [], apply: function () {} };
    return;
  }
  var React = host.react;
  var h = host.h;
  var CSS = require("./ui/styles.cjs");
  var ICONS = {
    records: GLYPHS["wallet"],
    stats: GLYPHS["chart-column"],
    data: GLYPHS["database"],
    actions: GLYPHS["list"],
  };
  function Icon(props) { var C = ICONS[props.name] || ICONS.records; return h(C, { size: props.size || 14, strokeWidth: 2, "aria-hidden": "true", className: "wbsal-svg" }); }
  function tabIcon(name) { return function () { return h(Icon, { name: name, size: 14 }); }; }
  function withProps(Inner, title) { return function Wrapped(props) { return h(Inner, { api: props.api, lang: props.lang === "en" ? "en" : "zh", h: h, React: React, title: title }); }; }
  // 样式模块可能返回数组（基础样式层），统一交给共享注入器规范化，避免逗号拼接成非法 CSS。
  var injectStyles = require("../../lib/inject-styles.cjs");
  function ensureStyles() {
    injectStyles({ id: "wb-salary-style", css: CSS, addon: "wb-addon-salary" });
  }
  ensureStyles();
  host.registerAddon({
    id: "wb-addon-salary",
    version: __ADDON_VERSION__,
    icon: GLYPHS["wallet"],
    views: [
      { id: "stats", icon: tabIcon("stats"), title: { zh: "统计", en: "Stats" }, component: withProps(require("./views/stats.cjs"), "统计") },
      { id: "records", icon: tabIcon("records"), title: { zh: "记录", en: "Records" }, component: withProps(require("./views/records.cjs"), "记录") },
      { id: "data", icon: tabIcon("data"), title: { zh: "数据", en: "Data" }, component: withProps(require("./views/data.cjs"), "数据") },
      { id: "actions", icon: tabIcon("actions"), title: { zh: "Action", en: "Actions" }, component: withProps(require("./views/actions.cjs"), "Action") },
    ],
  });
  module.exports = { name: "dsh-workbench-salary", inject: [], apply: function () {} };
})();
