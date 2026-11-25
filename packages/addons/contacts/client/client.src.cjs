"use strict";
var GLYPHS = require("./ui/icons.cjs").ICONS;

// 联系人客户端：联系人 / 分组 / 导入导出 / 设置 / 数据 / Action 六个视图。
(function () {
  var root = typeof window !== "undefined" ? window : null;
  var host = root && root.__WB_HOST__;
  if (!host || !host.react) {
    if (typeof console !== "undefined") console.error("[dsh-workbench-contacts] 宿主前端未就绪");
    module.exports = { name: "dsh-workbench-contacts", inject: [], apply: function () {} };
    return;
  }
  var React = host.react;
  var h = host.h;
  var CSS = require("./ui/styles.cjs");
  var ICONS = {
    users: GLYPHS["users"],
    folder: GLYPHS["folder"],
    upload: GLYPHS["upload"],
    sliders: GLYPHS["sliders-horizontal"],
    list: GLYPHS["list"],
  };
  function Icon(props) { var C = ICONS[props.name] || ICONS.users; return h(C, { size: props.size || 14, strokeWidth: 2, "aria-hidden": "true", className: "wbg-svg" }); }
  function tabIcon(name) { return function () { return h(Icon, { name: name, size: 14 }); }; }
  function withProps(Inner, title) { return function Wrapped(props) { return h(Inner, { api: props.api, lang: props.lang === "en" ? "en" : "zh", h: h, React: React, title: title }); }; }
  // 样式模块可能返回数组（基础样式层），交给共享注入器规范化，避免逗号拼接成非法 CSS。
  var injectStyles = require("../../lib/inject-styles.cjs");
  function ensureStyles() {
    injectStyles({ id: "wb-contacts-style", css: CSS, addon: "wb-addon-contacts" });
  }
  ensureStyles();
  host.registerAddon({
    id: "wb-addon-contacts",
    version: __ADDON_VERSION__,
    icon: GLYPHS["users"],
    views: [
      { id: "contacts", icon: tabIcon("users"), title: { zh: "联系人", en: "Contacts" }, component: withProps(require("./views/contacts.cjs"), "联系人") },
      { id: "groups", icon: tabIcon("folder"), title: { zh: "分组", en: "Groups" }, component: withProps(require("./views/groups.cjs"), "分组") },
      { id: "importExport", icon: tabIcon("upload"), title: { zh: "导入导出", en: "Import / Export" }, component: withProps(require("./views/importExport.cjs"), "导入导出") },
      { id: "config", icon: tabIcon("sliders"), title: { zh: "设置", en: "Settings" }, component: withProps(require("./views/config.cjs"), "设置") },
      { id: "actions", icon: tabIcon("list"), title: { zh: "Action", en: "Actions" }, component: withProps(require("./views/actions.cjs"), "Action") },
    ],
  });
  module.exports = { name: "dsh-workbench-contacts", inject: [], apply: function () {} };
})();
