"use strict";
var C = require("../ui/common.cjs");
module.exports = function ActionsView(props) {
  var h = props.h, api = props.api, React = props.React;
  var s = C.useLoad(React, api, "connector.actionSchema", {}, []);
  var rows = (s.data && s.data.actions) || [];
  return h("div", { className: "wbc-wrap" },
    h("div", { className: "wbc-head" }, h("div", null, h("h2", { className: "wbc-title" }, "Action 清单"), h("p", { className: "wbc-sub" }, "本插件自证清单，不读宿主统一接口。")), h(C.Btn, { h: h, onClick: s.refresh }, "刷新")),
    s.error ? h(C.Notice, { h: h, kind: "error", text: s.error }) : null,
    s.loading ? h(C.Empty, { h: h, text: "加载中…" }) : h("div", { className: "wbc-card" },
      h("table", { className: "wbc-table" }, h("thead", null, h("tr", null, h("th", null, "action"), h("th", null, "说明"), h("th", null, "必填"))), h("tbody", null, rows.map(function (a) {
        var req = (a.input && a.input.required) || [];
        return h("tr", { key: a.name }, h("td", null, h("code", null, a.name)), h("td", null, a.description), h("td", null, req.join(", ") || "—"));
      }))))
  );
};
