"use strict";
/**
 * 明文切换输入框（小眼睛）：默认 type=password，点眼睛临时切 text。
 *
 * 只影响视觉，不改变加密与 reveal 边界；show / onToggle 由调用方持有，
 * 这样同一个页面里的多个口令框可以各自独立切换。
 *
 * props:
 *   h                         createElement（各插件注入）
 *   value / onChange(v)       受控值
 *   placeholder
 *   show / onToggle()         是否显示明文、切换回调
 *   id / name / autoComplete / autoFocus / disabled
 *   inputClassName            透传给 input（站点用 wbs-input 保持既有尺寸）
 *   className                 透传给外层容器
 *   ariaLabel                 输入框的无障碍名
 *   onKeyDown                 透传给 input（口令弹层用它接回车确认）
 *   showLabel / hideLabel     眼睛按钮文案，默认「显示明文 / 隐藏明文」
 */
var Eye = require("lucide-react/icons/eye").default;
var EyeOff = require("lucide-react/icons/eye-off").default;

function SecretField(props) {
  var h = props.h;
  var show = Boolean(props.show);
  var label = show ? (props.hideLabel || "隐藏明文") : (props.showLabel || "显示明文");
  var Ico = show ? EyeOff : Eye;

  function toggle(e) {
    // type=button + preventDefault：按钮在 form 里也不会提交，且不冒泡到弹层。
    e.preventDefault();
    e.stopPropagation();
    var box = e.currentTarget && e.currentTarget.parentNode;
    if (props.onToggle) props.onToggle();
    var input = box && box.querySelector ? box.querySelector("input") : null;
    if (!input || !input.focus) return;
    // 切换后把焦点与光标送回输入框，用户可以直接接着打字。
    input.focus();
    var end = String(input.value == null ? "" : input.value).length;
    if (input.setSelectionRange) {
      try { input.setSelectionRange(end, end); } catch (err) { /* number 等类型不支持选区 */ }
    }
  }

  return h("div", { className: "wb-secret-field" + (props.className ? " " + props.className : "") },
    h("input", {
      type: show ? "text" : "password",
      className: props.inputClassName || undefined,
      id: props.id || undefined,
      name: props.name || undefined,
      autoComplete: props.autoComplete || "new-password",
      autoFocus: props.autoFocus ? true : undefined,
      spellCheck: false,
      disabled: props.disabled ? true : undefined,
      "aria-label": props.ariaLabel || undefined,
      value: props.value == null ? "" : props.value,
      placeholder: props.placeholder || undefined,
      onChange: function (e) { if (props.onChange) props.onChange(e.target.value); },
      onKeyDown: props.onKeyDown || undefined,
    }),
    h("button", {
      type: "button",
      className: "wb-eye",
      title: label,
      "aria-label": label,
      "aria-pressed": show ? "true" : "false",
      tabIndex: props.disabled ? -1 : undefined,
      onClick: toggle,
    }, h(Ico, { size: 15, strokeWidth: 2, "aria-hidden": "true" })));
}

module.exports = SecretField;
