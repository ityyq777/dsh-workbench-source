"use strict";
var GLYPHS = require("./ui/icons.cjs").ICONS;

(function () {
  var root = typeof window !== "undefined" ? window : null;
  var host = root && root.__WB_HOST__;
  if (!host || !host.react) {
    if (typeof console !== "undefined") console.error("[dsh-workbench-calendar] 宿主前端未就绪");
    module.exports = { name: "dsh-workbench-calendar", inject: [], apply: function () {} };
    return;
  }
  var React = host.react;
  var h = host.h;
  var CSS = require("./ui/styles.cjs");
  var ICONS = {
    calendar: GLYPHS["calendar-days"],
    grid: GLYPHS["calendar"],
    sliders: GLYPHS["sliders-horizontal"],
    database: GLYPHS["database"],
    list: GLYPHS["list"],
  };
  function Icon(props) { var C = ICONS[props.name] || ICONS.calendar; return h(C, { size: props.size || 14, strokeWidth: 2, "aria-hidden": "true", className: "wbg-svg" }); }
  function tabIcon(name) { return function () { return h(Icon, { name: name, size: 14 }); }; }
  function withProps(Inner, title) { return function Wrapped(props) { return h(Inner, { api: props.api, lang: props.lang === "en" ? "en" : "zh", h: h, React: React, title: title }); }; }
  // 样式模块可能返回数组（基础样式层），交给共享注入器规范化，避免逗号拼接成非法 CSS。
  var injectStyles = require("../../lib/inject-styles.cjs");
  function ensureStyles() {
    injectStyles({ id: "wb-calendar-style", css: CSS, addon: "wb-addon-calendar" });
  }
  ensureStyles();
  host.registerAddon({
    id: "wb-addon-calendar",
    version: __ADDON_VERSION__,
    icon: GLYPHS["calendar-days"],
    views: [
      { id: "events", icon: tabIcon("calendar"), title: { zh: "日程", en: "Agenda" }, component: withProps(require("./views/events.cjs"), "日程") },
      { id: "calendars", icon: tabIcon("grid"), title: { zh: "日历", en: "Calendars" }, component: withProps(require("./views/calendars.cjs"), "日历") },
      { id: "config", icon: tabIcon("sliders"), title: { zh: "设置", en: "Settings" }, component: withProps(require("./views/config.cjs"), "设置") },
      { id: "data", icon: tabIcon("database"), title: { zh: "数据", en: "Data" }, component: withProps(require("./views/data.cjs"), "数据") },
      { id: "actions", icon: tabIcon("list"), title: { zh: "Action", en: "Actions" }, component: withProps(require("./views/actions.cjs"), "Action") },
    ],
  });
  module.exports = { name: "dsh-workbench-calendar", inject: [], apply: function () {} };
})();
