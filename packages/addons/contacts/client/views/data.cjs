"use strict";
var C = require("../ui/common.cjs");
module.exports = function DataView(props) {
  var h = props.h, api = props.api, React = props.React;
  var meta = C.useLoad(React, api, "contacts.dataTables", {}, []);
  var table = React.useState("contact"); var limit = React.useState(50); var offset = React.useState(0);
  var q = C.useLoad(React, api, "contacts.dataQuery", { table: table[0], limit: limit[0], offset: offset[0] }, [table[0], limit[0], offset[0]]);
  var rows = (q.data && q.data.rows) || [];
  var cols = rows.length ? Object.keys(rows[0]) : ((meta.data && meta.data.columns && meta.data.columns[table[0]]) || []);
  return h("div", { className: "wbct-wrap" },
    h("h2", null, "数据"),
    h("div", { className: "wbct-row" },
      h("select", { className: "wbct-input", value: table[0], onChange: function (e) { table[1](e.target.value); offset[1](0); } }, ((meta.data && meta.data.tables) || []).map(function (t) { return h("option", { key: t, value: t }, t); })),
      h("input", { className: "wbct-input", type: "number", value: limit[0], onChange: function (e) { limit[1](Number(e.target.value) || 50); } }),
      h("input", { className: "wbct-input", type: "number", value: offset[0], onChange: function (e) { offset[1](Number(e.target.value) || 0); } })),
    q.error ? h(C.Notice, { h: h, kind: "error", text: q.error }) : null,
    h("div", { className: "wbct-table-wrap" }, h("table", { className: "wbct-table" },
      h("thead", null, h("tr", null, cols.map(function (c) { return h("th", { key: c }, c); }))),
      h("tbody", null, rows.map(function (r, i) { return h("tr", { key: i }, cols.map(function (c) { return h("td", { key: c }, r[c] == null ? "—" : String(r[c])); })); })))));
};
