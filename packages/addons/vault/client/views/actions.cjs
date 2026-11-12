"use strict";
/** Action 清单页：调用本域 vault.actionSchema，不读宿主统一接口。 */
var C = require("../ui/common.cjs");

module.exports = function ActionsView(props) {
  var h = props.h;
  var api = props.api;
  var React = props.React;
  var s = React.useState({ loading: true, data: null, error: "" });
  var q = React.useState("");

  React.useEffect(function () {
    C.call(api, "vault.actionSchema").then(function (data) {
      s[1]({ loading: false, data: data, error: "" });
    }).catch(function (e) { s[1]({ loading: false, data: null, error: C.errText(e) }); });
  }, []);

  var data = s[0].data;
  var list = (data && data.actions) || [];
  if (q[0]) list = list.filter(function (a) { return (a.name + " " + (a.description || "")).toLowerCase().indexOf(q[0].toLowerCase()) >= 0; });

  return h("div", { className: "wbv" },
    h("div", { className: "wbv-row" },
      h("h2", { className: "wbv-grow" }, "Action 清单"),
      h("input", { style: { maxWidth: "220px" }, placeholder: "过滤", value: q[0], onChange: function (e) { q[1](e.target.value); } })),
    h("p", { className: "wbv-muted" }, "共 " + ((data && data.actions) || []).length + " 个 action；schema 是 agent 唯一可见的契约。"),
    h(C.Notice, { h: h, kind: "error", text: s[0].error }),
    s[0].loading ? h(C.Empty, { h: h, text: "读取中…" }) :
      list.length === 0 ? h(C.Empty, { h: h, text: "没有匹配的 action" }) :
      h("div", { style: { display: "flex", flexDirection: "column", gap: "8px" } },
        list.map(function (a) {
          return h("details", { key: a.name, className: "wbv-card" },
            h("summary", { style: { cursor: "pointer" } }, h("code", null, a.name), h("span", { className: "wbv-muted" }, " — " + (a.description || ""))),
            h("pre", { className: "wbv-code", style: { marginTop: "8px" } }, JSON.stringify(a.input || {}, null, 2)));
        })));
};
