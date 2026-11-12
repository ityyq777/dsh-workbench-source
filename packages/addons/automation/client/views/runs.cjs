"use strict";
var C = require("../ui/common.cjs");

module.exports = function RunsView(props) {
  var h = props.h, api = props.api, React = props.React;
  var ruleId = React.useState("");
  var sel = React.useState(null);
  var page = React.useState(0);
  var list = C.useLoad(React, api, "automation.runList", { ruleId: ruleId[0] || undefined, limit: 100 }, [ruleId[0], page[0]]);
  var rules = C.useLoad(React, api, "automation.ruleList", {}, []);
  var rows = (list.data && list.data.items) || [];
  return h("div", { className: "wba-wrap" },
    h("div", { className: "wba-head" }, h("h2", null, "运行记录"), h(C.Btn, { h: h, onClick: list.refresh }, "刷新")),
    h("div", { className: "wba-row" },
      h(C.Field, { h: h, label: "按规则筛选" },
        h("select", { className: "wba-input", value: ruleId[0], onChange: function (e) { ruleId[1](e.target.value); } },
          h("option", { value: "" }, "全部规则"),
          (rules.data && rules.data.items || []).map(function (r) { return h("option", { key: r.id, value: r.id }, r.name); })))),
    list.error ? h(C.Notice, { h: h, kind: "error", text: list.error }) : null,
    rows.length === 0 && !list.loading ? h(C.Empty, { h: h, text: "还没有运行记录" }) : null,
    h("div", { className: "wba-table-wrap" },
      h("table", { className: "wba-table" },
        h("thead", null, h("tr", null, ["规则", "触发", "状态", "开始", "耗时", "结果"].map(function (x) { return h("th", { key: x }, x); }))),
        h("tbody", null, rows.map(function (r) {
          var rule = (rules.data && rules.data.items || []).filter(function (x) { return x.id === r.ruleId; })[0];
          return h("tr", { key: r.id, onClick: function () { sel[1](r); } },
            h("td", null, rule ? rule.name : r.ruleId),
            h("td", null, r.trigger),
            h("td", null, h(C.Pill, { h: h, kind: r.status === "ok" ? "ok" : r.status === "error" ? "error" : "" }, r.status)),
            h("td", null, C.fmtTime(r.startedAt, props.lang)),
            h("td", null, r.finishedAt ? ((r.finishedAt - r.startedAt) / 1000).toFixed(1) + "s" : "—"),
            h("td", { className: "wba-ellipsis" }, r.error || r.result || "—"));
        })))),
    sel[0] ? h("div", { className: "wba-panel" },
      h("div", { className: "wba-head" }, h("h3", null, "运行详情"), h(C.Btn, { h: h, onClick: function () { sel[1](null); } }, "关闭")),
      h("div", { className: "wba-kv" }, h("b", null, "id"), h("code", null, sel[0].id), h("b", null, "错误"), h("span", null, sel[0].error || "—")),
      h(C.Json, { h: h, value: sel[0] })) : null);
};
