// 共享按钮：统一的按钮类名拼装与图标按钮语义（图标按钮补 aria-label 与 title）。
//
// options.prefix 决定类名前缀（wbi-btn 等），options.Icon 由插件注入，避免共享层
// 反向依赖具体业务域或图标集。
"use strict";

var React = require("react");
var h = React.createElement;

module.exports = function createButton(options) {
  var opts = options || {};
  var prefix = opts.prefix;
  var Icon = opts.Icon;

  function Button(props) {
    var attrs = Object.assign({ type: "button", className: prefix + "-btn" }, props);
    delete attrs.icon;
    delete attrs.iconOnly;
    if (props.icon) {
      attrs["aria-label"] = props["aria-label"] || props.children;
      attrs.title = props.title || attrs["aria-label"];
      attrs.className += props.iconOnly ? " " + prefix + "-icon-only" : " " + prefix + "-icon-text";
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
