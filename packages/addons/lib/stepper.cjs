"use strict";
/**
 * 共享步骤条（Steps）：创建弹窗「分阶段」的导航基座。
 *
 * 背景：13 个插件的表单弹窗此前各写一份字段平铺布局，宽度从 540px 到 960px 不等；
 * 站点自己写了一套 `.wbs-steps` 圆点，其余插件干脆不分步。这里收成一份实现：
 * 只负责「步骤定义 + 当前步 + 已访问/已完成 + 点击回跳 + aria」，
 * 字段、校验与保存流程仍留在各插件里（见 staged-dialog.cjs 的说明）。
 *
 * 使用方式：
 *   var Steps = require("../../../lib/stepper.cjs").Steps;
 *   h(Steps, { h: h, steps: [{ key: "basic", label: "基本信息" }], current: 0, maxVisited: 1, onJump: goTo })
 * 并把 require("../../../lib/stepper.cjs").styles 追加进插件样式表（重复追加无害）。
 *
 * 契约：
 * - 当前步 `aria-current="step"`；未访问的步骤是禁用按钮，不可跳转；
 * - 已访问步骤可点击回跳（`onJump(index)`），回跳后仍保留后续步骤的已填内容；
 * - 颜色只用 `--wb-*` token，深浅色都可用；窄屏自动折行、隐藏提示文字。
 */

// 步骤状态：current 当前 / done 已完成 / visited 已访问（可回跳）/ todo 未访问。
function stepState(index, current, maxVisited) {
  if (index === current) return "current";
  if (index < current) return "done";
  if (index <= maxVisited) return "visited";
  return "todo";
}

function Steps(props) {
  var h = props.h;
  var steps = props.steps || [];
  var current = props.current || 0;
  var maxVisited = props.maxVisited === undefined ? current : props.maxVisited;
  var invalid = props.invalid || {};
  var disabled = !!props.disabled;
  var label = props.label || "步骤";
  return h(
    "nav",
    { className: "wbctl-steps" + (props.className ? " " + props.className : ""), "aria-label": label },
    h(
      "ol",
      { className: "wbctl-step-list" },
      steps.map(function (step, index) {
        var state = stepState(index, current, maxVisited);
        var canJump = !disabled && typeof props.onJump === "function" && state !== "current" && state !== "todo";
        var isInvalid = !!invalid[index] || !!invalid[step.key];
        return h(
          "li",
          { key: step.key || index, className: "wbctl-step-item" },
          h(
            "button",
            {
              type: "button",
              className: "wbctl-step",
              "data-state": state,
              "data-invalid": isInvalid ? "true" : null,
              "aria-current": state === "current" ? "step" : undefined,
              "aria-label": (index + 1) + " · " + step.label + (state === "done" ? "（已完成）" : ""),
              disabled: disabled || state === "todo",
              title: step.hint || "",
              onClick: function () {
                if (canJump) props.onJump(index);
              },
            },
            h("span", { className: "wbctl-step-index", "aria-hidden": "true" }, state === "done" ? "✓" : String(index + 1)),
            h("span", { className: "wbctl-step-label" }, step.label),
            step.hint ? h("span", { className: "wbctl-step-hint" }, step.hint) : null,
            step.optional ? h("span", { className: "wbctl-step-opt" }, "可选") : null,
          ),
        );
      }),
    ),
  );
}

var STYLES = [
  ".wbctl-steps{display:block;min-width:0}",
  ".wbctl-step-list{display:flex;align-items:stretch;gap:6px;list-style:none;margin:0 0 14px;padding:0;min-width:0}",
  ".wbctl-step-item{display:flex;flex:1 1 0;min-width:0}",
  ".wbctl-step{display:flex;align-items:center;gap:7px;flex:1 1 auto;min-width:0;padding:7px 9px;border:1px solid var(--wb-line,var(--wb-border));border-radius:10px;background:transparent;color:var(--wb-muted,inherit);font:inherit;font-size:12px;line-height:1.35;text-align:left;cursor:default;transition:background .14s ease,border-color .14s ease,color .14s ease}",
  ".wbctl-step[data-state=done],.wbctl-step[data-state=visited]{color:inherit;cursor:pointer}",
  ".wbctl-step[data-state=done]{border-color:color-mix(in oklab,var(--wb-ok,var(--wb-accent,#2563eb)) 36%,var(--wb-border))}",
  ".wbctl-step[data-state=current]{border-color:color-mix(in oklab,var(--wb-accent,#2563eb) 58%,var(--wb-border));background:color-mix(in oklab,var(--wb-accent,#2563eb) 8%,transparent);color:inherit;font-weight:600}",
  ".wbctl-step[data-state=visited]:hover,.wbctl-step[data-state=done]:hover{background:color-mix(in oklab,currentColor 7%,transparent)}",
  ".wbctl-step[data-invalid=true]{border-color:var(--wb-danger,#d33)}",
  ".wbctl-step:focus-visible{outline:2px solid var(--wb-accent,#2563eb);outline-offset:2px}",
  ".wbctl-step:disabled{cursor:default;opacity:.72}",
  ".wbctl-step-index{display:inline-flex;align-items:center;justify-content:center;flex:none;width:20px;height:20px;border-radius:50%;font-size:11px;font-variant-numeric:tabular-nums;background:color-mix(in oklab,currentColor 15%,transparent)}",
  ".wbctl-step[data-state=current] .wbctl-step-index{background:var(--wb-accent,#2563eb);color:var(--wb-on-accent,#fff)}",
  ".wbctl-step[data-state=done] .wbctl-step-index{background:color-mix(in oklab,var(--wb-ok,var(--wb-accent,#2563eb)) 20%,transparent);color:var(--wb-ok,var(--wb-accent,#2563eb))}",
  ".wbctl-step-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
  ".wbctl-step-hint{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:400;opacity:.62}",
  ".wbctl-step-opt{flex:none;font-size:10px;font-weight:400;opacity:.55}",
  "@media (max-width:760px){.wbctl-step{padding:6px 7px;font-size:11.5px}.wbctl-step-hint,.wbctl-step-opt{display:none}.wbctl-step-index{width:18px;height:18px;font-size:10px}}",
  "@media (max-width:520px){.wbctl-step-list{gap:4px}.wbctl-step-label{white-space:normal}.wbctl-step{gap:5px}}",
  "@media (prefers-reduced-motion:reduce){.wbctl-step{transition:none}}",
];

module.exports = { Steps: Steps, stepState: stepState, styles: STYLES };
