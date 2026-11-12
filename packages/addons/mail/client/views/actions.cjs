"use strict";
module.exports = function Actions(props) {
  var h = props.h, React = props.React, api = props.api;
  var C = require("../ui/common.cjs");
  var s = C.useLoad(React, api, "mail.actionSchema", {}, []);
  var list = (s.data && s.data.actions) || [];
  return h("div", { className: "wbm-page" }, h("h2", null, "Action 清单"), h("p", { className: "wbm-sub" }, "邮件写操作与同步仅 UI"), s.error ? h(C.Notice, { h: h, kind: "error", text: s.error }) : h("div", { className: "wbm-list" }, list.map(function (a) { return h("div", { key: a.name, className: "wbm-list-row" }, h("div", { className: "wbm-main" }, h("strong", null, a.name), h("span", { className: "wbm-muted" }, a.description || ""))); })));
};
