var React = require("react");
var h = React.createElement;
function call(api, name, args) {
  return api.call(name, args || {}).then(function (r) {
    if (!r || r.ok !== true) throw new Error((r && r.error) || "请求失败");
    return r.result;
  });
}
function tr(lang, zh, en) {
  return lang === "en" ? en : zh;
}
function Button(props) {
  return h("button", Object.assign({ type: "button", className: "wbi-btn" }, props), props.children);
}
function ErrorBox(props) {
  return props.error
    ? h("div", { className: "wbi-error", role: "alert" }, String(props.error.message || props.error))
    : null;
}
function safeImage(url) {
  try {
    var u = new URL(url);
    return /^(https?:)$/.test(u.protocol) && !u.username && !u.password ? u.href : "";
  } catch (_) {
    return "";
  }
}
function Modal(props) {
  var ref = React.useRef(null);
  React.useEffect(function () {
    var previous = document.activeElement;
    if (ref.current) ref.current.focus();
    return function () {
      if (previous && previous.isConnected) previous.focus();
    };
  }, []);
  function key(e) {
    if (e.key === "Escape" && props.onClose) props.onClose();
    if (e.key !== "Tab") return;
    var els = ref.current.querySelectorAll(
      "button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href]",
    );
    if (!els.length) {
      e.preventDefault();
      return;
    }
    var first = els[0],
      last = els[els.length - 1];
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
      className: "wbi-mask",
      onMouseDown: function (e) {
        if (e.target === e.currentTarget && props.onClose) props.onClose();
      },
    },
    h(
      "section",
      {
        className: "wbi-modal",
        role: "dialog",
        "aria-modal": true,
        "aria-label": props.title,
        ref: ref,
        tabIndex: -1,
        onKeyDown: key,
      },
      h(
        "header",
        { className: "wbi-row" },
        h("h2", null, props.title),
        h("span", { className: "wbi-grow" }),
        h(Button, { onClick: props.onClose, disabled: !props.onClose, "aria-label": "关闭 / Close" }, "×"),
      ),
      props.children,
    ),
  );
}
module.exports = { h: h, call: call, tr: tr, Button: Button, ErrorBox: ErrorBox, Modal: Modal, safeImage: safeImage };
