"use strict";
module.exports = function Data(props) {
  var h = props.h, React = props.React, api = props.api;
  var C = require("../ui/common.cjs");
  var tables = C.useLoad(React, api, "mail.dataTables", {}, []);
  var table = React.useState("mail_message");
  var rows = C.useLoad(React, api, "mail.dataQuery", { table: table[0], limit: 20 }, [table[0]]);
  var list = (tables.data && tables.data.tables) || [];
  return h("div", { className: "wbm-page" }, h("h2", null, "数据浏览"), h("select", { className: "wbm-input", value: table[0], onChange: function (e) { table[1](e.target.value); } }, list.map(function (t) { return h("option", { key: t.name, value: t.name }, t.name); })),
    rows.error ? h(C.Notice, { h: h, kind: "error", text: rows.error }) : h(C.Json, { h: h, value: (rows.data && rows.data.rows) || [] }));
};
