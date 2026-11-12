"use strict";
var C = require("../ui/common.cjs");

module.exports = function ActionsView(props) {
  var h = props.h, api = props.api, React = props.React;
  var st = C.useLoad(React, api, "automation.actionSchema", {}, []);
  var opts = C.useLoad(React, api, "automation.actionOptions", {}, []);
  var names = (st.data && st.data.actions) || [];
  return h("div", { className: "wba-wrap" },
    h("div", { className: "wba-head" }, h("h2", null, "Action"), h(C.Btn, { h: h, onClick: st.refresh }, "刷新")),
    h(C.Notice, { h: h, kind: "info", text: "清单由 automation.actionSchema 自证，不读宿主 schema 接口。" }),
    st.error ? h(C.Notice, { h: h, kind: "error", text: st.error }) : null,
    h("div", { className: "wba-panel" },
      h("h3", null, "可被规则调用"),
      h("div", { className: "wba-pills" }, ((opts.data && opts.data.actions) || []).map(function (a) { return h(C.Pill, { h: h, key: a, kind: "ok" }, a); }))),
    h("div", { className: "wba-panel" },
      h("h3", null, "已注册 action（" + names.length + "）"),
      h("ul", { className: "wba-list" }, names.map(function (n) { return h("li", { key: n }, h("code", null, n)); }))));
};
