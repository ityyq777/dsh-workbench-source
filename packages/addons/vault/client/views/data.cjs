"use strict";
/** 数据页：只读查看两张表，密文与 KDF 值由后端掩码。 */
var C = require("../ui/common.cjs");

module.exports = function DataView(props) {
  var h = props.h;
  var api = props.api;
  var React = props.React;
  var tableS = React.useState("vault_secret");
  var dataS = React.useState({ loading: false, data: null, error: "" });
  var tablesS = React.useState([]);

  React.useEffect(function () {
    C.call(api, "vault.dataTables").then(function (r) { tablesS[1]((r && r.tables) || []); }).catch(function () {});
  }, []);

  function load(table) {
    tableS[1](table);
    dataS[1]({ loading: true, data: null, error: "" });
    C.call(api, "vault.dataQuery", { table: table, limit: 50 }).then(function (data) {
      dataS[1]({ loading: false, data: data, error: "" });
    }).catch(function (e) { dataS[1]({ loading: false, data: null, error: C.errText(e) }); });
  }

  React.useEffect(function () { load("vault_secret"); }, []);

  var d = dataS[0].data;
  var cols = d && d.rows && d.rows.length ? Object.keys(d.rows[0]) : [];
  return h("div", { className: "wbv" },
    h("h2", null, "数据"),
    h("p", { className: "wbv-muted" }, "保险箱不参与云同步；密文列与 KDF/包裹值固定显示为 ***。"),
    h("div", { className: "wbv-tabs" },
      ["vault_secret", "vault_meta"].map(function (t) {
        return h("button", { key: t, type: "button", className: "wbv-tab" + (tableS[0] === t ? " on" : ""), onClick: function () { load(t); } }, t);
      }),
      h("span", { className: "wbv-grow" }),
      h(C.Btn, { h: h, onClick: function () { load(tableS[0]); } }, "刷新")),
    h(C.Notice, { h: h, kind: "error", text: dataS[0].error }),
    dataS[0].loading ? h(C.Empty, { h: h, text: "读取中…" }) :
      !d || !d.rows || d.rows.length === 0 ? h(C.Empty, { h: h, text: "没有数据" }) :
      h("div", { style: { overflowX: "auto" } },
        h("table", { className: "wbv-table" },
          h("thead", null, h("tr", null, cols.map(function (c) { return h("th", { key: c }, c); }))),
          h("tbody", null, d.rows.map(function (row, i) {
            return h("tr", { key: i }, cols.map(function (c) {
              var v = row[c];
              return h("td", { key: c }, v === null || v === undefined ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v));
            }));
          })))),
    h("p", { className: "wbv-muted" }, "表：" + (tablesS[0].map(function (t) { return t.name; }).join(" / ") || "—")));
};
