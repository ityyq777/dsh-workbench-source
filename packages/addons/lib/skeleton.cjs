// 共享骨架屏：三张占位卡片，供数据页首屏加载时占位。
//
// 各插件原本各自手写骨架结构，类名前缀与文案参数化后共用一份。
"use strict";

var React = require("react");
var h = React.createElement;

/**
 * options.prefix   类名前缀（如 wbi）
 * options.text     (lang) => 读屏文案，默认「读取中…/Loading…」
 */
module.exports = function createSkeleton(options) {
  var opts = options || {};
  var prefix = opts.prefix;
  var text = opts.text || function (lang) { return lang === "en" ? "Loading…" : "读取中…"; };

  return function Skeleton(props) {
    var label = props.label || text(props.lang);
    return h(
      "div",
      { className: prefix + "-root " + prefix + "-grid " + prefix + "-skeleton", role: "status", "aria-label": label, "aria-busy": true },
      h("span", { className: prefix + "-sr" }, label),
      [0, 1, 2].map(function (i) {
        return h(
          "div",
          { key: i, className: prefix + "-card " + prefix + "-skeleton-card", "aria-hidden": true },
          h("div", { className: prefix + "-sk" }),
          h("div", { className: prefix + "-sk" }),
          h("div", { className: prefix + "-sk" }),
        );
      }),
    );
  };
};
