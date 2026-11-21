"use strict";
/**
 * 分阶段弹窗外壳：把「步骤条 + 当前步内容 + 上一页/下一页/保存」收成一份实现。
 *
 * 与 overlay.cjs 的分工：
 * - overlay.cjs 管遮罩、Esc、Tab 焦点环、关闭后焦点归还；
 * - 本文件在它之上管「分步」：步骤状态、逐步校验、跨步回跳、提交前全量复核、错误定位；
 * - 步骤的业务内容（字段、取值、保存请求）仍由插件以 `steps[i].render(h)` 注入，
 *   这里不 import 任何业务域，因此 13 个插件都能用同一份。
 *
 * 用法（插件侧）：
 *   var staged = require("../../../lib/staged-dialog.cjs");
 *   var StagedDialog = staged.createStagedDialog({ React: React, maskClass: "xxx-mask", dialogClass: "xxx-modal", header: ... });
 *   h(StagedDialog, {
 *     steps: [{ key: "basic", label: "基本信息", hint: "名称与描述", render: function (h) {...}, validate: function () { return ""; } }],
 *     submitting: busy, onClose: close, onSubmit: submit, submitText: "创建",
 *   })
 * 并把 require("../../../lib/staged-dialog.cjs").styles 追加进插件样式表。
 *
 * 校验契约：`steps[i].validate()` 返回非空字符串即「该步不通过」，返回空串/undefined 通过；
 * 点「下一步」只校验当前步，点「保存」从第一步起全量校验，第一处不通过就把用户送回那一步。
 */
var defaultReact = require("react");
var overlayFactory = require("./overlay.cjs");
var stepper = require("./stepper.cjs");

// 逐步校验的契约被收成两个纯函数，方便单测直接验行为（外壳里的状态机只调用它们）：
// validateStep 返回非空字符串 = 该步不通过；firstFailing 按顺序找第一处不通过的步骤。
function validateStep(step) {
  if (!step || typeof step.validate !== "function") return "";
  var message = step.validate();
  return message ? String(message) : "";
}

function firstFailing(steps) {
  var list = steps || [];
  for (var i = 0; i < list.length; i += 1) {
    var message = validateStep(list[i]);
    if (message) return { index: i, key: list[i] && list[i].key, message: message };
  }
  return null;
}

function createStagedDialog(options) {
  var opts = options || {};
  var React = opts.React || defaultReact;
  var h = React.createElement;
  // 共享外壳自带宽高与纵向布局，插件只传自己的遮罩/对话框类名做皮肤。
  var dialogClass = ((opts.dialogClass || "") + " wbctl-dialog").trim();
  var Overlay = overlayFactory(
    Object.assign({}, opts, {
      React: React,
      dialogClass: dialogClass,
      // 首焦点由外壳送进对话框，字段由 focusStep 负责，避免打开瞬间落进第一个输入框。
      autoFocusDialog: opts.autoFocusDialog !== false,
    }),
  );

  function StagedDialog(props) {
    var R = props.React || React;
    var steps = props.steps || [];
    var count = steps.length;
    var busy = !!props.submitting || !!props.busy;

    var indexState = R.useState(props.initialStep || 0);
    var rawIndex = indexState[0];
    var setIndex = indexState[1];
    var index = count === 0 ? 0 : Math.min(Math.max(rawIndex, 0), count - 1);

    var visitedState = R.useState(props.initialStep || 0);
    var maxVisited = count === 0 ? 0 : Math.min(Math.max(visitedState[0], index), count - 1);
    var setMaxVisited = visitedState[1];

    var errorState = R.useState("");
    var stepError = errorState[0];
    var setStepError = errorState[1];

    var invalidState = R.useState({});
    var invalid = invalidState[0];
    var setInvalid = invalidState[1];

    var bodyRef = R.useRef(null);
    var mounted = R.useRef(true);

    function runValidate(step) {
      return validateStep(step);
    }

    function markInvalid(i, bad) {
      setInvalid(function (prev) {
        var next = Object.assign({}, prev);
        if (bad) next[i] = true;
        else delete next[i];
        return next;
      });
    }

    function focusBody() {
      var el = bodyRef.current;
      if (el && typeof el.focus === "function") el.focus();
    }

    // 步骤切换后把焦点送到内容区顶部，键盘用户不会停在上一页的按钮上。
    R.useEffect(
      function () {
        if (!mounted.current) return;
        focusBody();
      },
      [index],
    );
    R.useEffect(function () {
      mounted.current = true;
      return function () {
        mounted.current = false;
      };
    }, []);

    function goTo(i) {
      if (busy || i < 0 || i >= count) return;
      setIndex(i);
      if (i > maxVisited) setMaxVisited(i);
      setStepError("");
    }

    function fail(i, message) {
      markInvalid(i, true);
      goTo(i);
      setStepError(message);
      focusBody();
    }

    function next() {
      if (busy) return;
      var message = runValidate(steps[index]);
      if (message) {
        fail(index, message);
        return;
      }
      markInvalid(index, false);
      goTo(Math.min(index + 1, count - 1));
    }

    function back() {
      if (busy || index === 0) return;
      goTo(index - 1);
    }

    function jump(i) {
      if (busy || i > maxVisited) return;
      goTo(i);
    }

    function submit() {
      if (busy) return;
      var bad = firstFailing(steps);
      if (bad) {
        fail(bad.index, bad.message);
        return;
      }
      for (var i = 0; i < count; i++) markInvalid(i, false);
      setStepError("");
      if (typeof props.onSubmit === "function") props.onSubmit();
    }

    function cancel() {
      if (busy) return;
      if (typeof props.onClose === "function") props.onClose();
    }

    var current = steps[index];
    var isLast = index >= count - 1;
    var saveText = props.submitText || "保存";
    var shownError = stepError || props.error || "";

    return h(
      Overlay,
      props,
      count > 1
        ? h(stepper.Steps, {
            h: h,
            steps: steps.map(function (step) {
              return { key: step.key, label: step.label, hint: step.hint, optional: step.optional };
            }),
            current: index,
            maxVisited: maxVisited,
            onJump: jump,
            invalid: invalid,
            disabled: busy,
            label: props.stepsLabel || "创建步骤",
          })
        : null,
      h(
        "div",
        {
          className: "wbctl-dialog-body" + (props.bodyClassName ? " " + props.bodyClassName : ""),
          ref: bodyRef,
          tabIndex: -1,
        },
        current ? current.render(h, props) : null,
      ),
      props.footerExtra || null,
      shownError ? h("div", { className: "wbctl-dialog-err", role: "alert" }, shownError) : null,
      h(
        "div",
        { className: "wbctl-dialog-foot" },
        count > 1 ? h("span", { className: "wbctl-dialog-progress" }, index + 1 + " / " + count) : null,
        props.footerNote ? h("span", { className: "wbctl-dialog-note" }, props.footerNote) : null,
        h("span", { className: "wbctl-dialog-spacer" }),
        index > 0
          ? h(
              "button",
              { type: "button", className: "wbctl-btn", onClick: back, disabled: busy },
              props.backText || "上一步",
            )
          : null,
        h("button", { type: "button", className: "wbctl-btn", onClick: cancel, disabled: busy }, props.cancelText || "取消"),
        h(
          "button",
          {
            type: "button",
            className: "wbctl-btn wbctl-btn-p",
            onClick: isLast ? submit : next,
            // submitDisabled 只作用于末步的保存：插件据此把「结构性不合法」（JSON 语法、无可选 action）
            // 提前反映成禁用态，避免用户点到保存才被弹回第一步。
            disabled: busy || (isLast && !!props.submitDisabled),
          },
          busy ? saveText + "中…" : isLast ? saveText : props.nextText || "下一步",
        ),
      ),
    );
  }

  StagedDialog.displayName = opts.displayName || "StagedDialog";
  return StagedDialog;
}

var STYLES = [
  // 宽表单：内容多时给足横向空间，窄屏留 16px 边距后铺满。
  ".wbctl-dialog{width:min(880px,calc(100vw - 32px));max-height:min(92vh,760px);display:flex;flex-direction:column;overflow:hidden}",
  ".wbctl-dialog-body{flex:1 1 auto;min-height:0;overflow:auto;overscroll-behavior:contain;padding:2px 2px 10px;outline:none}",
  ".wbctl-dialog-body:focus-visible{outline:none}",
  ".wbctl-dialog-foot{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding-top:10px;margin-top:10px;border-top:1px solid var(--wb-line,var(--wb-border))}",
  ".wbctl-dialog-progress{font-size:11.5px;color:var(--wb-muted,#666);font-variant-numeric:tabular-nums}",
  ".wbctl-dialog-note{font-size:11.5px;color:var(--wb-muted,#666);min-width:0}",
  ".wbctl-dialog-spacer{flex:1 1 auto}",
  ".wbctl-dialog-err{margin-top:8px;padding:7px 10px;border-radius:8px;border:1px solid color-mix(in oklab,var(--wb-danger,#d33) 45%,transparent);background:color-mix(in oklab,var(--wb-danger,#d33) 8%,transparent);color:var(--wb-danger,#d33);font-size:12px}",
  ".wbctl-btn{padding:6px 14px;border:1px solid var(--wb-border,#d0d5dd);border-radius:8px;background:var(--wb-card,#fff);color:inherit;font:inherit;font-size:12.5px;cursor:pointer}",
  ".wbctl-btn:hover:not(:disabled){background:color-mix(in oklab,currentColor 7%,transparent)}",
  ".wbctl-btn:focus-visible{outline:2px solid var(--wb-accent,#2563eb);outline-offset:2px}",
  ".wbctl-btn:disabled{opacity:.55;cursor:default}",
  ".wbctl-btn.wbctl-btn-p{background:var(--wb-accent,#2563eb);border-color:transparent;color:var(--wb-on-accent,#fff)}",
  ".wbctl-btn.wbctl-btn-p:hover:not(:disabled){background:color-mix(in oklab,var(--wb-accent,#2563eb) 86%,#000)}",
  // 确认步：键值对清单，各插件共用，避免再各写一套只读摘要。\n  ".wbctl-review{display:flex;flex-direction:column;border:1px solid var(--wb-line,var(--wb-border));border-radius:10px;overflow:hidden}",\n  ".wbctl-review-row{display:grid;grid-template-columns:96px minmax(0,1fr);gap:10px;padding:8px 12px;font-size:12.5px;background:var(--wb-surface,transparent)}",\n  ".wbctl-review-row+.wbctl-review-row{border-top:1px solid var(--wb-line,var(--wb-border))}",\n  ".wbctl-review-k{color:var(--wb-muted,inherit);font-size:11.5px;line-height:1.6}",\n  ".wbctl-review-v{min-width:0;word-break:break-word;line-height:1.6}",\n  ".wbctl-note{margin:10px 0 0;font-size:11.5px;color:var(--wb-muted,inherit)}",\n  // 两列字段布局：内容多的弹窗不再单列拉长，窄屏回落单列。
  ".wbctl-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 14px}",
  ".wbctl-form>.full{grid-column:1/-1}",
  "@media (max-width:760px){.wbctl-dialog{width:calc(100vw - 16px);max-height:94vh}.wbctl-form{grid-template-columns:1fr}.wbctl-form>.full{grid-column:auto}}",
  "@media (prefers-reduced-motion:reduce){.wbctl-btn{transition:none}}",
];

module.exports = {
  createStagedDialog: createStagedDialog,
  validateStep: validateStep,
  firstFailing: firstFailing,
  styles: STYLES,
};
