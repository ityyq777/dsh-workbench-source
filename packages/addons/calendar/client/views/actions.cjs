"use strict";
module.exports = function Actions(props) {
  var h = props.h, React = props.React, api = props.api;
  var C = require("../ui/common.cjs");
  var s = C.useLoad(React, api, "calendar.actionSchema", {}, []);
  var list = (s.data && s.data.actions) || [];
  return h("div", { className: "wbca-page" },
    h("h2", null, "Action 清单"),
    h("p", { className: "wbca-sub" }, "读取 calendar.actionSchema；写操作仅 UI。"),
    s.error ? h(C.Notice, { h: h, kind: "error", text: s.error }) : h("div", { className: "wbca-list" }, list.map(function (a) { return h("div", { key: a.name, className: "wbca-list-row" }, h("div", { className: "wbca-main" }, h("strong", null, a.name), h("span", { className: "wbca-muted" }, a.description || ""))); }))
  );
};
