"use strict";
/**
 * 弹幕插件客户端入口：
 * 1) 立刻把整个 DSH 窗口的弹幕层挂到 body（不依赖 React、也不依赖工作台视图是否打开）；
 * 2) 注册弹幕库/配置/数据/Action 四个视图。
 */
var styles = require("./styles.cjs");
var overlay = require("./overlay/mount.cjs");

var STYLE_ID = "wbdm-styles";

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  var style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = styles().join("\n");
  (document.head || document.documentElement).appendChild(style);
}

injectStyles();
if (document.body) overlay.mount();
else document.addEventListener("DOMContentLoaded", function () {
  overlay.mount();
});

var host = window.__WB_HOST__;
if (!host || !host.react) {
  console.error("[danmaku] workbench host 未就绪，视图不可用");
  module.exports = { name: "dsh-workbench-danmaku", inject: [], apply: function () {} };
} else {
  var React = host.react;
  var tab = function (name) {
    return require("lucide-react/icons/" + name).default;
  };

  host.registerAddon({
    id: "wb-addon-danmaku",
    version: "0.1.0",
    icon: tab("megaphone"),
    views: [
      {
        id: "library",
        icon: tab("list"),
        title: { zh: "弹幕库", en: "Library" },
        component: require("./views/library.cjs"),
      },
      {
        id: "config",
        icon: tab("settings"),
        title: { zh: "配置", en: "Settings" },
        component: require("./views/config.cjs"),
      },
      {
        id: "data",
        icon: tab("database"),
        title: { zh: "数据", en: "Data" },
        component: require("./views/data.cjs"),
      },
      {
        id: "actions",
        icon: tab("play"),
        title: { zh: "Action", en: "Actions" },
        component: require("./views/actions.cjs"),
      },
    ],
  });

  void React;
  module.exports = { name: "dsh-workbench-danmaku", inject: [], apply: function () {} };
}
