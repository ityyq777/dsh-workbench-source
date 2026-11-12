"use strict";
var C = require("../ui/common.cjs");

module.exports = function StatsView(props) {
  var h = props.h, api = props.api, React = props.React;
  var st = C.useLoad(React, api, "automation.status", {}, []);
  var opts = C.useLoad(React, api, "automation.actionOptions", {}, []);
  if (st.loading) return h("div", { className: "wba-wrap" }, "加载中…");
  if (st.error) return h("div", { className: "wba-wrap" }, h(C.Notice, { h: h, kind: "error", text: st.error }));
  var s = st.data || {};
  var today = s.today || {};
  return h("div", { className: "wba-wrap" },
    h("div", { className: "wba-head" }, h("h2", null, "自动化"), h(C.Btn, { h: h, onClick: st.refresh }, "刷新")),
    h("div", { className: "wba-cards" },
      h("div", { className: "wba-card" }, h("div", { className: "wba-card-num" }, s.total || 0), h("div", null, "规则总数")),
      h("div", { className: "wba-card" }, h("div", { className: "wba-card-num" }, s.enabled || 0), h("div", null, "已启用")),
      h("div", { className: "wba-card" }, h("div", { className: "wba-card-num" }, today.ok || 0), h("div", null, "今日成功")),
      h("div", { className: "wba-card" }, h("div", { className: "wba-card-num" }, today.error || 0), h("div", null, "今日失败")),
      h("div", { className: "wba-card" }, h("div", { className: "wba-card-num" }, today.skipped || 0), h("div", null, "今日跳过"))),
    h("div", { className: "wba-panel" },
      h("h3", null, "能做什么"),
      h("p", null, "按固定间隔、每天固定时间、域事件或手动运行，调用白名单 action；参数支持模板与条件。"),
      h("p", null, "每规则每小时上限 " + ((s.config && s.config.perHour) || 60) + " 次，规则上限 " + ((s.config && s.config.maxRules) || 50) + " 条；超限或并发已满会记为 skipped。"),
      h("p", { className: "wba-muted" }, "不允许调用 vault.*、automation.*、audit.* 或任何 delete/backup action。")),
    h("div", { className: "wba-panel" },
      h("h3", null, "白名单"),
      opts.loading ? "加载中…" : h("div", { className: "wba-pills" }, (opts.data && opts.data.actions || []).map(function (a) { return h(C.Pill, { h: h, key: a }, a); }))));
};
