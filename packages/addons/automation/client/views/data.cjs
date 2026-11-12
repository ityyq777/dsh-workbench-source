"use strict";
var C = require("../ui/common.cjs");

module.exports = function DataView(props) {
  var h = props.h, api = props.api, React = props.React;
  var meta = C.useLoad(React, api, "automation.dataTables", {}, []);
  var table = React.useState("");
  var limit = React.useState(50);
  var offset = React.useState(0);
  var q = C.useLoad(React, api, "automation.dataQuery", { table: table[0] || "automation_rule", limit: limit[0], offset: offset[0] }, [table[0], limit[0], offset[0]]);
  var tables = (meta.data && meta.data.tables) || [];
  var rows = (q.data && q.data.rows) || [];
  var cols = rows.length ? Object.keys(rows[0]) : ((meta.data && meta.data.columns && meta.data.columns[table[0] || "automation_rule"]) || []);
  return h("div", { className: "wba-wrap" },
    h("div", { className: "wba-head" }, h("h2", null, "数据"), h(C.Btn, { h: h, onClick: q.refresh }, "刷新")),
    h(C.Notice, { h: h, kind: "info", text: "只读白名单列，按 rowid 倒序；不接受任意 SQL。" }),
    h("div", { className: "wba-row" },
      h(C.Field, { h: h, label: "表" }, h("select", { className: "wba-input", value: table[0], onChange: function (e) { table[1](e.target.value); offset[1](0); } },
        [""].concat(tables).map(function (t) { return h("option", { key: t || "none", value: t }, t || "选择表"); }))),
      h(C.Field, { h: h, label: "limit" }, h("input", { className: "wba-input", type: "number", value: limit[0], onChange: function (e) { limit[1](Number(e.target.value) || 50); } })),
      h(C.Field, { h: h, label: "offset" }, h("input", { className: "wba-input", type: "number", value: offset[0], onChange: function (e) { offset[1](Number(e.target.value) || 0); } }))),
    q.error ? h(C.Notice, { h: h, kind: "error", text: q.error }) : null,
    h("div", { className: "wba-table-wrap" },
      h("table", { className: "wba-table" },
        h("thead", null, h("tr", null, cols.map(function (c) { return h("th", { key: c }, c); }))),
        h("tbody", null, rows.map(function (r, i) {
          return h("tr", { key: i }, cols.map(function (c) {
            return h("td", { key: c }, r[c] == null ? "—" : String(r[c]));
          }));
        }))
      )
    )
  );
};
