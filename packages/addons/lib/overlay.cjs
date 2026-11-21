// 共享浮层对话框：点遮罩关闭、Esc 关闭、Tab 在对话框内循环、关闭后焦点回到触发处。
//
// 各插件此前各写一份：储物带焦点陷阱与 Esc，站点只做了遮罩点击，键盘用户进出
// 对话框会丢焦点。这里合一，差异用 options 注入（标签名、类名、是否带标题栏）。
//
// 各插件的业务内容（字段、校验、保存流程）仍留在插件里；共享的只是外壳：遮罩、
// 对话框容器、键盘契约与焦点归还。
"use strict";

var defaultReact = require("react");

// 参与焦点循环的可聚焦元素，与浏览器默认 Tab 顺序一致。
var FOCUSABLE = "button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href]";

module.exports = function createOverlay(options) {
  var opts = options || {};
  // React 实例可由调用方注入：插件视图里用宿主给的同一份 React（测试的迷你渲染器
  // 也据此按自己的 hook 实现展开组件），不注入时退回包内 require。
  var React = opts.React || defaultReact;
  var h = React.createElement;
  var tag = opts.tag || "section";
  var maskClass = opts.maskClass;
  var dialogClass = opts.dialogClass;
  var dialogClassOf = opts.dialogClassOf || function () { return ""; };
  var ariaLabelOf = opts.ariaLabelOf || function (props) { return props["aria-label"] || props.title; };
  var ariaLabelledByOf = opts.ariaLabelledByOf || function () { return null; };
  var header = opts.header || null;
  // 关闭条件可按 props 判断：忙时先不关（避免保存中被 Esc 打断）。
  // 调用方也可直接传 props.closeOnEscape / props.closeOnMask 覆盖（布尔）。
  var closeOnEscape = opts.closeOnEscape || function () { return true; };
  var closeOnMask = opts.closeOnMask || function () { return true; };
  var extraKeyDown = opts.onKeyDown || null;
  // 业务自己用 autoFocus 指定首焦点时传 false，避免被外壳抢走。
  var autoFocusDialog = opts.autoFocusDialog !== false;
  var focusableSelector = opts.focusableSelector || FOCUSABLE;

  function Modal(props) {
    // 调用方可以在元素上带 React：插件视图里传宿主 React，测试里的迷你渲染器也据此展开本组件。
    var R = props.React || React;
    var ref = R.useRef(null);

    // 打开时把焦点送进对话框，关闭时还给原来的触发元素（与原生 dialog 一致）。
    R.useEffect(function () {
      var previous = typeof document !== "undefined" ? document.activeElement : null;
      var focusIt = props.autoFocus !== undefined ? props.autoFocus : autoFocusDialog;
      if (focusIt && ref.current) ref.current.focus();
      return function () {
        if (previous && previous.isConnected) previous.focus();
      };
    }, []);

    function onKeyDown(e) {
      if (extraKeyDown && extraKeyDown(e, props, ref)) return;
      if (e.key === "Escape") {
        if (!(props.closeOnEscape !== undefined ? props.closeOnEscape : closeOnEscape(props))) return;
        // 先消费再关闭：React 可能在关闭后立刻替换 document 级监听，避免重复触发。
        e.preventDefault();
        e.stopPropagation();
        if (props.onClose) props.onClose();
        return;
      }
      if (e.key !== "Tab" || !ref.current) return;
      var els = ref.current.querySelectorAll(focusableSelector);
      if (!els.length) {
        e.preventDefault();
        return;
      }
      var first = els[0];
      var last = els[els.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {
        e.preventDefault();
        last.focus();
      }
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    var labelledBy = ariaLabelledByOf(props);
    return h(
      "div",
      {
        className: maskClass,
        onMouseDown: function (e) {
          var allowed = props.closeOnMask !== undefined ? props.closeOnMask : closeOnMask(props);
          if (e.target === e.currentTarget && props.onClose && allowed) props.onClose();
        },
      },
      h(
        tag,
        {
          className: dialogClass + dialogClassOf(props),
          role: "dialog",
          "aria-modal": true,
          "aria-label": labelledBy ? null : ariaLabelOf(props),
          "aria-labelledby": labelledBy || null,
          ref: ref,
          tabIndex: -1,
          onKeyDown: onKeyDown,
        },
        header ? header(props) : null,
        props.children,
      ),
    );
  }

  return Modal;
};
