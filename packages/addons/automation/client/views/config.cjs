"use strict";
var C = require("../ui/common.cjs");

module.exports = function ConfigView(props) {
  var h = props.h, api = props.api, React = props.React;
  var st = C.useLoad(React, api, "automation.configGet", {}, []);
  var form = React.useState(null);
  var msg = React.useState("");
  React.useEffect(function () { if (st.data) form[1]({ maxRules: st.data.maxRules, perHour: st.data.perHour }); }, [st.data]);
  var f = form[0];
  function set(k, v) { form[1](Object.assign({}, f, (function () { var o = {}; o[k] = v; return o; })())); }
  function save() {
    C.call(api, "automation.configSet", { maxRules: Number(f.maxRules), perHour: Number(f.perHour) })
      .then(function () { msg[1]("已保存"); st.refresh(); })
      .catch(function (e) { msg[1](C.errText(e)); });
  }
  if (st.loading) return h("div", { className: "wba-wrap" }, "加载中…");
  return h("div", { className: "wba-wrap" },
    h("h2", null, "设置"),
    st.error ? h(C.Notice, { h: h, kind: "error", text: st.error }) : null,
    h(C.Notice, { h: h, text: msg[0] }),
    f ? h("div", { className: "wba-panel" },
      h("div", { className: "wba-grid" },
        h(C.Field, { h: h, label: "规则数量上限（1–500）" }, h("input", { className: "wba-input", type: "number", value: f.maxRules, onChange: function (e) { set("maxRules", e.target.value); } })),
        h(C.Field, { h: h, label: "每规则每小时上限（1–600）" }, h("input", { className: "wba-input", type: "number", value: f.perHour, onChange: function (e) { set("perHour", e.target.value); } }))),
      h(C.Btn, { h: h, kind: "primary", onClick: save }, "保存")) : null,
    h("div", { className: "wba-panel" },
      h("h3", null, "运行约束"),
      h("p", null, "定时器每 30 秒检查一次，单次最多执行 3 条到期规则；全局并发 2，超出的定时触发记 skipped。"),
      h("p", null, "事件触发由宿主 domain-event 驱动，订阅 payload 为 {domainId,event,data}；connector 的 item.created 带 sourceId 与 item 摘要，不含正文原文。"),
      h("p", null, "规则可以被备份导入导出，运行记录只在本机。")),
    h("div", { className: "wba-panel" },
      h("h3", null, "示例"),
      h("p", null, "每 60 分钟调用 message.send；参数 title 固定，body 用 {{rule.name}}。"),
      h("p", null, "事件规则：域 wb-addon-connector、事件 item.created，action message.send，参数 title 用 {{item.title}}，url 用 {{item.url}}。")));
};
