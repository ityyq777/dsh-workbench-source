"use strict";
/** 设置页：数据概览、口径说明与当前状态。 */
module.exports = function Config(props) {
  var h = props.h, React = props.React, api = props.api;
  var C = require("../ui/common.cjs");
  var F = require("../ui/fields.cjs");
  var s = C.useLoad(React, api, "salary.status", {}, []);
  var data = s.data || {};
  return h("div", { className: "wbsal-page" },
    h("div", { className: "wbsal-head" }, h("h2", null, "设置与说明")),
    s.error ? h(C.Notice, { h: h, kind: "error", text: s.error })
      : h("div", { className: "wbsal-kpis" },
        h("div", { className: "wbsal-card wbsal-kpi" }, h("span", null, "记录数"), h("strong", null, s.loading ? "—" : data.records), h("em", null, "笔（软删除不计）")),
        h("div", { className: "wbsal-card wbsal-kpi" }, h("span", null, "最近一笔"), h("strong", { className: "wbsal-num" }, data.latestDate || "—"), h("em", null, s.loading ? "" : F.money(data.latestNetPay) + " 元")),
        h("div", { className: "wbsal-card wbsal-kpi" }, h("span", null, (data.currentYear || new Date().getFullYear()) + " 年累计"), h("strong", null, s.loading ? "—" : F.money(data.currentYearNetPay)), h("em", null, (data.currentYearRecords || 0) + " 笔"))),
    h("div", { className: "wbsal-card" },
      h("h3", null, "口径"),
      h("ul", { className: "wbsal-ul" },
        h("li", null, "时间维度是发薪日期（YYYY-MM-DD），日结、月结都用同一个日期维度；cycle 只作分类。"),
        h("li", null, "应发税前 = 收入合计（基本+绩效+岗位+补贴+绩效奖惩+其他+法定假期加班）− 税前扣款（病假+事假+其他扣款）。"),
        h("li", null, "实发 = 应发 − 养老 − 医疗 − 失业 − 公积金 − 个税 − 税后扣除。"),
        h("li", null, "应发与实发默认按明细推导；只记得汇总值时可以直接填，保存后以传入值为准。"),
        h("li", null, "同一天允许多笔（日结多班次/补发）；统计按日期所属月份求和。"),
        h("li", null, "删除是软删除：记录不再出现在列表与统计，但仍在数据库中，备份会包含。"))),
    h("div", { className: "wbsal-card" },
      h("h3", null, "边界"),
      h("ul", { className: "wbsal-ul" },
        h("li", null, "只在本机 SQLite 保存，不参与云同步；备份由宿主负责。"),
        h("li", null, "不存姓名、工号等身份信息；不做工资条 OCR。"),
        h("li", null, "不做报销、支出与多公司并行核算（支出请用 storage）。"),
        h("li", null, "agent 可以新增、修改、软删除工资记录，用于口述录入。"))),
    h("div", { className: "wbsal-card" }, h("h3", null, "当前状态"), h(C.Json, { h: h, value: data }))
  );
};
