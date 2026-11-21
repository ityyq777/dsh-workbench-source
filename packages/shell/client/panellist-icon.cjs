/** 侧栏「工作台」入口图标。
 *
 * 取 lucide `layout-dashboard` 的几何（一大三小）：既能读出「工作台」的含义，也避开四等分
 * 方块——那是「更多」入口的造型，同一列里撞形就分不清。这里内联绘制而不 require lucide：
 * 宿主外壳每多引一个图标会连带打进 8 个运行时辅助模块（约 12KB），而形状与它完全一致。
 * size 由插槽透传（默认 20），描边固定 1.5，与相邻入口的视觉重量对齐。
 */
"use strict";

module.exports = function PanellistIcon(h) {
  return function Icon(props) {
    var size = (props && props.size) || 20;
    return h(
      "svg",
      { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 1.5, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" },
      h("rect", { x: 3, y: 3, width: 7, height: 9, rx: 1 }),
      h("rect", { x: 14, y: 3, width: 7, height: 5, rx: 1 }),
      h("rect", { x: 14, y: 12, width: 7, height: 9, rx: 1 }),
      h("rect", { x: 3, y: 16, width: 7, height: 5, rx: 1 }),
    );
  };
};
