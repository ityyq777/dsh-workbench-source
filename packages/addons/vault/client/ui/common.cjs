"use strict";
/** 保险箱客户端公共件：只调用本域 action，不碰宿主统一接口。 */

function unwrap(r) {
  return r && r.result !== undefined ? r.result : r;
}

function call(api, action, args) {
  return Promise.resolve(api.call(action, args || {})).then(unwrap);
}

function errText(e) {
  if (!e) return "操作失败";
  if (typeof e === "string") return e;
  return e.message || e.error || String(e);
}

function fmtTime(ts, lang) {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString(lang === "en" ? "en-US" : "zh-CN", { hour12: false });
  } catch (e) {
    return String(ts);
  }
}

function Btn(props) {
  var h = props.h;
  return h(
    "button",
    {
      type: props.type || "button",
      className: "wbv-btn" + (props.kind ? " " + props.kind : ""),
      disabled: props.disabled,
      onClick: props.onClick,
      title: props.title,
    },
    props.children,
  );
}

function Field(props) {
  var h = props.h;
  return h(
    "label",
    { className: "wbv-field" },
    h("span", { className: "wbv-label" }, props.label),
    props.children,
    props.hint ? h("span", { className: "wbv-hint" }, props.hint) : null,
  );
}

function Notice(props) {
  var h = props.h;
  if (!props.text) return null;
  return h("div", { className: "wbv-notice " + (props.kind || "info") }, props.text);
}

function Empty(props) {
  var h = props.h;
  return h("div", { className: "wbv-empty" }, props.text || "暂无数据");
}

function useLoad(React, api, action, args, deps) {
  var s = React.useState({ loading: true, data: null, error: "" });
  var tick = React.useState(0);
  var refresh = function () { tick[1](tick[0] + 1); };
  React.useEffect(function () {
    var alive = true;
    s[1]({ loading: true, data: null, error: "" });
    call(api, action, args)
      .then(function (data) { if (alive) s[1]({ loading: false, data: data, error: "" }); })
      .catch(function (e) { if (alive) s[1]({ loading: false, data: null, error: errText(e) }); });
    return function () { alive = false; };
  }, (deps || []).concat([tick[0]]));
  return { loading: s[0].loading, data: s[0].data, error: s[0].error, refresh: refresh };
}

module.exports = {
  unwrap: unwrap,
  call: call,
  errText: errText,
  fmtTime: fmtTime,
  Btn: Btn,
  Field: Field,
  Notice: Notice,
  Empty: Empty,
  useLoad: useLoad,
};
