"use strict";
var C = require("../ui/common.cjs");
module.exports = function ActionsView(props) {
  var h = props.h, api = props.api, React = props.React;
  var st = C.useLoad(React, api, "contacts.actionSchema", {}, []);
  var names = (st.data && st.data.actions) || [];
  return h("div", { className: "wbct-wrap" },
    h("h2", null, "Action"),
    h(C.Notice, { h: h, kind: "info", text: "清单由 contacts.actionSchema 自证。" }),
    st.error ? h(C.Notice, { h: h, kind: "error", text: st.error }) : null,
    h("ul", { className: "wbct-list" }, names.map(function (n) { return h("li", { key: n }, h("code", null, n)); })));
};
