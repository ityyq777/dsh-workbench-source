"use strict";
var C = require("../ui/common.cjs");
module.exports = function DataView(props) {
  var h = props.h, api = props.api, React = props.React;
  var tS = React.useState(null), tableS = React.useState("connector_source");
  React.useEffect(function () { C.call(api, "connector.dataTables").then(function (r) { tS[1]((r && r.tables) || []); }).catch(function () {}); }, []);
  var tables = tS[0] || [];
  var s = C.useLoad(React, api, "connector.dataQuery", { table: tableS[0], limit: 100 }, [tableS[0]]);
  var rows = (s.data && s.data.rows) || [];
  return h("div", { className: "wbc-wrap" },
    h("div", { className: "wbc-head" }, h("div", null, h("h2", { className: "wbc-title" }, "数据"), h("p", { className: "wbc-sub" }, "只读查看四张表；来源定义参与云同步，其余只在本机。")), h(C.Btn, { h: h, onClick: s.refresh }, "刷新")),
    h("div", { className: "wbc-row" }, h(C.Field, { h: h, label: "表" }, h("select", { value: tableS[0], onChange: function (e) { tableS[1](e.target.value); } }, tables.map(function (t) { return h("option", { key: t.name, value: t.name }, t.name); }))), h("span", { className: "wbc-muted" }, rows.length + " 行（最多 100）")),
    s.error ? h(C.Notice, { h: h, kind: "error", text: s.error }) : null,
    s.loading ? h(C.Empty, { h: h, text: "加载中…" }) : rows.length === 0 ? h(C.Empty, { h: h, text: "这张表还没有数据。" }) : h("div", { className: "wbc-card" },
      h("table", { className: "wbc-table" }, h("thead", null, h("tr", null, Object.keys(rows[0] || {}).map(function (k) { return h("th", { key: k }, k); }))), h("tbody", null, rows.map(function (r, i) {
        return h("tr", { key: i }, Object.keys(rows[0] || {}).map(function (k) { var v = r[k]; return h("td", { key: k }, typeof v === "string" && v.length > 120 ? v.slice(0, 120) + "…" : String(v == null ? "" : v)); }));
      }))))
  );
};
