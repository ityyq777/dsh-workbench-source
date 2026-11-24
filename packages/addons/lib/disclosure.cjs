"use strict";
/**
 * 共享折叠面板：宿主与业务插件共用的 <details> 外壳。
 *
 * 为什么还要包一层：折叠面板此前在 4 个包里各手写一处，只有两处配了样式，
 * 字号/字重/三角位置/hover/focus/展开间距全不一致。控件统一负责观感，
 * 底层仍是原生 <details>/<summary>——Enter/Space 开合、Tab 可达、展开语义都保留。
 *
 * 用法：
 *   var D = require("./disclosure.cjs").createDisclosure(React);
 *   h(D.Disclosure, { title: "参数", meta: "必填 3", defaultOpen: true }, body)
 *   受控：{ open: folds[name] === true, onToggle: (e) => … }
 */
var ChevronRight = require("lucide-react/icons/chevron-right").default;

function createDisclosure(React) {
  var h = React.createElement;

  /**
   * @param props.title     折叠头文案（字符串或节点）
   * @param props.meta      右侧弱化说明（如「参数 · 必填 3」），可省略
   * @param props.open      受控展开态；与 defaultOpen 二选一
   * @param props.defaultOpen 非受控初始展开态
   * @param props.onToggle  透传原生 toggle 事件（读取 e.currentTarget.open 判断方向）
   * @param props.attrs     额外透传到 <details> 的属性（如 data-params-fold、id）
   * @param props.className 附加类名（保留调用方的既有钩子）
   */
  function Disclosure(props) {
    var attrs = Object.assign({ className: ("wb-disc " + (props.className || "")).trim() }, props.attrs || {});
    if (props.open !== undefined) attrs.open = !!props.open;
    else if (props.defaultOpen !== undefined) attrs.open = !!props.defaultOpen;
    if (props.onToggle) attrs.onToggle = props.onToggle;
    return h("details", attrs,
      h("summary", null,
        h(ChevronRight, { className: "wb-disc-chev", "aria-hidden": true, focusable: false }),
        h("span", { className: "wb-disc-title" }, props.title),
        props.meta != null && props.meta !== "" ? h("span", { className: "wb-disc-meta" }, props.meta) : null),
      h("div", { className: "wb-disc-body" }, props.children));
  }

  return { Disclosure: Disclosure, css: require("./disclosure-styles.cjs") };
}

module.exports = { createDisclosure: createDisclosure, css: require("./disclosure-styles.cjs") };
