// 共享按钮：统一的按钮类名拼装与图标按钮语义（图标按钮补 aria-label 与 title）。
//
// options.prefix 决定类名前缀（wbi-btn 等），options.Icon 由插件注入，避免共享层
// 反向依赖具体业务域或图标集。
//
// 类名是可叠加的：基础类 + kind（primary/danger）+ 调用方附加的 className + 图标变体。
// 早期实现用 Object.assign 让 props.className 直接顶掉基础类，页面再传 kind 或样式修饰
// 就会把 wbr-btn 之类的基础类丢掉，按钮退化成浏览器默认样式，所以这里统一拼装。
"use strict";

var React = require("react");
var h = React.createElement;

module.exports = function createButton(options) {
  var opts = options || {};
  var prefix = opts.prefix;
  var Icon = opts.Icon;

  function Button(props) {
    var attrs = Object.assign({}, props, { type: props.type || "button" });
    var classes = [prefix + "-btn"];
    if (props.kind) classes.push(props.kind);
    if (props.className) classes.push(props.className);
    if (props.icon) classes.push(props.iconOnly ? prefix + "-icon-only" : prefix + "-icon-text");
    attrs.className = classes.filter(Boolean).join(" ");
    delete attrs.icon;
    delete attrs.iconOnly;
    delete attrs.kind;
    // 图标按钮的文字进 span，窄屏由基础样式隐藏文字、桌面端保留「图标 + 文字」。
    if (props.icon) {
      attrs["aria-label"] = props["aria-label"] || (typeof props.children === "string" ? props.children : undefined);
      attrs.title = props.title || attrs["aria-label"];
    }
    return h(
      "button",
      attrs,
      props.icon ? h(Icon, { name: props.icon }) : null,
      props.iconOnly ? null : props.icon ? h("span", { className: prefix + "-btn-label" }, props.children) : props.children,
    );
  }

  return Button;
};
