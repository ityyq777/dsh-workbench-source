"use strict";

// 按钮里只留图标时，文字用视觉隐藏保留给读屏软件（display:none 会让按钮读不出名字）。
var VISUALLY_HIDDEN = "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap";

// 图标 + 文字的组合标签。
// 图标别名写错或漏配时，视图里拿到的是 undefined 组件；直接 h(undefined) 会抛
// React error #130，并由宿主的插槽边界吞成整块「工作区空白」。这里降级为只渲染
// 文字，把「少一个图标」压回局部问题（历史事故：邮件回复工具栏缺别名导致白屏）。
// options.short: 标签只有一两个字时保留文字（图标 + 短标签），其余情况按钮里只留图标。
module.exports = function iconLabel(h, Icon, text, options) {
  var opts = options || {};
  var cls = "wb-icon-label" + (opts.short ? " wb-icon-label-short" : "") + (Icon ? "" : " wb-icon-label-fallback");
  return h("span", { className: cls, title: typeof text === "string" ? text : undefined },
    Icon ? h(Icon, { size: 14, strokeWidth: 2, "aria-hidden": true, focusable: false }) : null,
    h("span", { className: "wb-icon-label-text" }, text));
};

module.exports.styles =
  ".wb-icon-label{display:inline-flex;align-items:center;gap:5px;max-width:100%;vertical-align:middle;text-align:start}"
  + ".wb-icon-label>svg{flex:none}.wb-icon-label>span{min-width:0;overflow-wrap:anywhere}"
  // 按钮里的「图标 + 文字」一律只留图标：图标已经表达含义，中文标签会把按钮撑成两行
  // （窄屏尤其明显，桌面端也一样）。要保留文字就把标签缩到一两个字并用 {short:true}。
  // 图标别名漏配时 iconLabel 会加 wb-icon-label-fallback（只剩文字），那种情况必须保留文字。
  // 视觉隐藏而不是 display:none：按钮只剩图标，但读屏软件仍能念出文案；悬停有 title 提示。
  + "button .wb-icon-label:not(.wb-icon-label-fallback) .wb-icon-label-text{" + VISUALLY_HIDDEN + "}"
  + "button .wb-icon-label.wb-icon-label-short .wb-icon-label-text{position:static;width:auto;height:auto;margin:0;overflow:visible;clip-path:none;white-space:normal}";
