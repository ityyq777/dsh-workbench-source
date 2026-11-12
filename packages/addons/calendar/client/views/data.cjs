"use strict";
module.exports = function Data(props) {
  var h = props.h, React = props.React, api = props.api;
  var C = require("../ui/common.cjs");
  var tables = C.useLoad(React, api, "calendar.dataTables", {}, []);
  var table = React.useState("calendar");
  var limit = React.useState(20);
  var rows = C.useLoad(React, api, "calendar.dataQuery", { table: table[0], limit: Number(limit[0]) || 20 }, [table[0], limit[0]]);
  var list = (tables.data && tables.data.tables) || [];
  return h("div", { className: "wbca-page" },
    h("h2", null, "数据浏览"),
    h("div", { className: "wbca-row" },
      h("select", { className: "wbca-input", value: table[0], onChange: function (e) { table[1](e.target.value); } }, list.map(function (t) { return h("option", { key: t.name, value: t.name }, t.name); })),
      h("input", { className: "wbca-input", type: "number", min: 1, max: 100, value: limit[0], onChange: function (e) { limit[1](e.target.value); } })),
    rows.error ? h(C.Notice, { h: h, kind: "error", text: rows.error }) : h(C.Json, { h: h, value: (rows.data && rows.data.rows) || [] })
  );
};
