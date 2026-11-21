"use strict";

// 图标 + 文字的组合标签。
// 图标别名写错或漏配时，视图里拿到的是 undefined 组件；直接 h(undefined) 会抛
// React error #130，并由宿主的插槽边界吞成整块「工作区空白」。这里降级为只渲染
// 文字，把「少一个图标」压回局部问题（历史事故：邮件回复工具栏缺别名导致白屏）。
module.exports = function iconLabel(h, Icon, text) {
  return h("span", { className: "wb-icon-label" },
    Icon ? h(Icon, { size: 14, strokeWidth: 2, "aria-hidden": true, focusable: false }) : null,
    h("span", null, text));
};

module.exports.styles = ".wb-icon-label{display:inline-flex;align-items:center;gap:5px;max-width:100%;vertical-align:middle;text-align:start}.wb-icon-label>svg{flex:none}.wb-icon-label>span{min-width:0;overflow-wrap:anywhere}";
