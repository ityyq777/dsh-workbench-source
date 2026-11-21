"use strict";
/**
 * 全插件唯一的布尔开关控件。
 *
 * 以前 13 个插件里散着 5 套「checkbox + 滑轨」实现（tasks/tags/sites/storage 的
 * `*-cfg-switch`、mail 的 `wbml-switch`、danmaku 的 `wbdm-switch`、automation 的
 * `wba-switch`、data-view 的 `.P-switch`），DOM、尺寸、配色各不相同；message 的设置页
 * 布尔项干脆还是原生复选框。这里收成一份：按钮 + `role="switch"`，类名固定为
 * `wbctl-*`（与插件 CSS 前缀无关，避免再被复制成带前缀的私有类）。
 *
 * 使用方式：
 *   var SW = require("../../../lib/switch.cjs");
 *   h(SW.Switch, { h: h, checked: !!value, disabled: locked, onChange: function (next) { save(id, next); } })
 * 并把 SW.styles 追加进插件样式表（重复追加无害，规则完全一致）。
 */
var SWITCH_STYLES = [
  ".wbctl-switch{display:inline-flex;align-items:center;gap:7px;min-height:24px;padding:2px;border:0;background:transparent;font:inherit;font-size:12px;color:var(--wb-muted,#6b7280);cursor:pointer;user-select:none;border-radius:999px}",
  ".wbctl-switch-track{position:relative;display:inline-flex;align-items:center;box-sizing:border-box;width:34px;height:20px;padding:2px;border-radius:999px;background:color-mix(in oklab,currentColor 22%,transparent);transition:background .16s ease;flex:none}",
  ".wbctl-switch-knob{display:block;width:16px;height:16px;border-radius:50%;background:var(--wb-card,#fff);box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .16s ease}",
  ".wbctl-switch[aria-checked=true]{color:var(--wb-accent,#2563eb)}",
  ".wbctl-switch[aria-checked=true] .wbctl-switch-track{background:var(--wb-accent,#2563eb)}",
  ".wbctl-switch[aria-checked=true] .wbctl-switch-knob{transform:translateX(14px)}",
  ".wbctl-switch:hover:not(:disabled) .wbctl-switch-track{outline:1px solid var(--wb-accent,#2563eb)}",
  ".wbctl-switch:focus-visible{outline:2px solid var(--wb-accent,#2563eb);outline-offset:2px}",
  ".wbctl-switch:disabled{opacity:.45;cursor:not-allowed}",
  ".wbctl-switch-text{white-space:nowrap}",
  "@media (prefers-reduced-motion:reduce){.wbctl-switch-track,.wbctl-switch-knob{transition:none}}",
];

function Switch(props) {
  var h = props.h;
  var on = props.checked === true || props.checked === "true";
  var disabled = !!props.disabled;
  var text = props.label;
  if (props.showState) text = on ? props.onText || "开" : props.offText || "关";
  return h(
    "button",
    {
      type: "button",
      role: "switch",
      "aria-checked": on ? "true" : "false",
      className: "wbctl-switch" + (props.className ? " " + props.className : ""),
      disabled: disabled,
      title: props.title,
      "aria-label": text ? undefined : props.ariaLabel,
      onClick: function (e) {
        e.preventDefault();
        if (disabled) return;
        if (typeof props.onChange === "function") props.onChange(!on);
      },
    },
    h(
      "span",
      { className: "wbctl-switch-track", "aria-hidden": "true" },
      h("span", { className: "wbctl-switch-knob" })
    ),
    text ? h("span", { className: "wbctl-switch-text" }, text) : null
  );
}

module.exports = { Switch: Switch, styles: SWITCH_STYLES };
