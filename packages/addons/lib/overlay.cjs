// 共享浮层对话框：点遮罩关闭、Esc 关闭、Tab 在对话框内循环、关闭后焦点回到触发处。
//
// 各插件此前各写一份：储物带焦点陷阱与 Esc，站点只做了遮罩点击，键盘用户进出
// 对话框会丢焦点。这里合一，差异用 options 注入（标签名、类名、是否带标题栏）。
"use strict";

var React = require("react");
var h = React.createElement;

// 参与焦点循环的可聚焦元素，与浏览器默认 Tab 顺序一致。
var FOCUSABLE = "button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href]";

module.exports = function createOverlay(options) {
  var opts = options || {};
  var tag = opts.tag || "section";
  var maskClass = opts.maskClass;
  var dialogClass = opts.dialogClass;
  var dialogClassOf = opts.dialogClassOf || function () { return ""; };
  var ariaLabelOf = opts.ariaLabelOf || function (props) { return props["aria-label"] || props.title; };
  var header = opts.header || null;

  function Modal(props) {
    var ref = React.useRef(null);

    // 打开时把焦点送进对话框，关闭时还给原来的触发元素（与原生 dialog 一致）。
    React.useEffect(function () {
      var previous = typeof document !== "undefined" ? document.activeElement : null;
      if (ref.current) ref.current.focus();
      return function () {
        if (previous && previous.isConnected) previous.focus();
      };
    }, []);

    function onKeyDown(e) {
      if (e.key === "Escape") {
        // 先消费再关闭：React 可能在关闭后立刻替换 document 级监听，避免重复触发。
        e.preventDefault();
        e.stopPropagation();
        if (props.onClose) props.onClose();
        return;
      }
      if (e.key !== "Tab" || !ref.current) return;
      var els = ref.current.querySelectorAll(FOCUSABLE);
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

    return h(
      "div",
      {
        className: maskClass,
        onMouseDown: function (e) {
          if (e.target === e.currentTarget && props.onClose) props.onClose();
        },
      },
      h(
        tag,
        {
          className: dialogClass + dialogClassOf(props),
          role: "dialog",
          "aria-modal": true,
          "aria-label": ariaLabelOf(props),
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
