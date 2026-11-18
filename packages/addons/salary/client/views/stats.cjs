"use strict";
/** 统计页：年度切换、KPI、12 月柱状图、环比、最近月构成、月度明细。 */
module.exports = function Stats(props) {
  var h = props.h, React = props.React, api = props.api;
  var C = require("../ui/common.cjs");
  var F = require("../ui/fields.cjs");
  var yearState = React.useState(new Date().getFullYear());
  var year = yearState[0], setYear = yearState[1];
  var load = C.useLoad(React, api, "salary.stats", { year: year }, [year]);
  var data = load.data;
  var monthly = (data && data.monthly) || [];
  var maxNet = 1;
  monthly.forEach(function (bucket) { if (bucket.netPay > maxNet) maxNet = bucket.netPay; });
  var topMonth = -1;
  monthly.forEach(function (bucket, i) { if (bucket.netPay > 0 && (topMonth < 0 || bucket.netPay > monthly[topMonth].netPay)) topMonth = i; });

  function signed(amount) {
    var n = Number(amount) || 0;
    return (n > 0 ? "+" : n < 0 ? "-" : "") + F.money(Math.abs(n));
  }
  function kpi(label, value, sub) {
    return h("div", { className: "wbsal-card wbsal-kpi" }, h("span", null, label), h("strong", null, value), h("em", null, sub));
  }
  function compRows(keys, total, deduction) {
    var rows = keys.filter(function (key) { return (data.latestMonth.breakdown.fields[key] || 0) !== 0; });
    if (rows.length === 0) return null;
    return h("div", { className: "wbsal-comp" }, rows.map(function (key) {
      var amount = data.latestMonth.breakdown.fields[key] || 0;
      var percent = total ? Math.max(2, Math.min(100, Math.round((Math.abs(amount) / total) * 100))) : 0;
      return h("div", { key: key, className: "wbsal-comp-row" },
        h("span", null, F.LABELS[key]),
        h("div", { className: "wbsal-comp-track" }, h("div", { className: "wbsal-comp-fill" + (deduction ? " deduction" : ""), style: { width: percent + "%" } })),
        h("span", { className: "wbsal-comp-value" }, h("b", null, F.money(amount)), " · " + percent + "%"));
    }));
  }

  var body;
  if (load.loading) body = h(C.Empty, { h: h, text: "加载中…" });
  else if (load.error) body = h(C.Notice, { h: h, kind: "error", text: load.error });
  else if (!data || data.records === 0) {
    body = h("div", { className: "wbsal-empty" },
      h("div", null, year + " 年还没有工资记录；换个年份，或先去工资记录页记一笔"));
  } else {
    var latestBreakdown = data.latestMonth && data.latestMonth.breakdown;
    var deductionTotal = latestBreakdown ? latestBreakdown.preTax + latestBreakdown.social + latestBreakdown.tax : 0;
    var prevNet = 0;
    var tableRows = [];
    monthly.forEach(function (bucket) {
      if (bucket.records === 0) return;
      tableRows.push({ bucket: bucket, prev: prevNet });
      prevNet = bucket.netPay;
    });
    var chartMax = Math.max(1, maxNet);
    body = h("div", { className: "wbsal-section" },
      h("div", { className: "wbsal-kpis" },
        kpi("年度实发合计", F.money(data.netTotal), data.records + " 笔 · 覆盖 " + data.months + " 个月"),
        kpi("月均实发", F.money(data.avgNetPay), "按有记录的月份平均"),
        kpi("年度应发", F.money(data.grossTotal), "税前"),
        kpi("年度个税", F.money(data.incomeTaxTotal), "工资薪金预扣"),
        kpi("年度社保公积金", F.money(data.socialTotal), "养老 / 医疗 / 失业 / 公积金")),

      h("div", { className: "wbsal-card wbsal-section" },
        h("div", { className: "wbsal-section-head" },
          h("h3", null, "月度实发趋势"),
          h("span", null, "最高 " + F.monthLabel(monthly[topMonth] ? monthly[topMonth].period : "") + " · " + F.money(maxNet))),
        h("div", { className: "wbsal-chart" }, monthly.map(function (bucket, i) {
          var ratio = bucket.netPay > 0 ? bucket.netPay / chartMax : 0;
          var height = Math.round(Math.max(ratio * 150, bucket.netPay > 0 ? 6 : 0));
          return h("div", {
            key: bucket.month, className: "wbsal-bar",
            title: bucket.month + " 月 · 实发 " + F.money(bucket.netPay) + " / 应发 " + F.money(bucket.grossPay) + " / 个税 " + F.money(bucket.incomeTax),
          },
            h("div", { className: "wbsal-bar-value" }, bucket.netPay > 0 ? Math.round(bucket.netPay).toLocaleString("zh-CN") : ""),
            h("div", { className: "wbsal-bar-fill" + (i === topMonth ? " top" : ""), style: { height: height + "px" } }),
            h("div", { className: "wbsal-bar-label" }, ""));
        })),
        h("div", { className: "wbsal-axis" }, monthly.map(function (bucket) { return h("span", { key: bucket.month }, bucket.month); })),
        h("div", { className: "wbsal-chart-foot" },
          h("span", { className: "wbsal-legend" }, h("i", null), "有记录月份", h("i", { className: "soft" }), "其他月份"),
          h("span", null, "单位：元 · 按发薪日期归属月份"))),

      h("div", { className: "wbsal-kpis" },
        kpi("环比", data.mom ? signed(data.mom.amount) : "—",
          data.mom ? (data.mom.percent === null ? "上月为 0" : (data.mom.percent > 0 ? "+" : "") + data.mom.percent + "% · 最近两个月") : "至少需要两个月记录"),
        kpi("最近月份", data.latestMonth ? F.monthLabel(data.latestMonth.period) : "—", data.latestMonth ? data.latestMonth.records + " 笔" : ""),
        kpi("最近一笔", data.latest ? data.latest.payDate : "—", data.latest ? (data.latest.cycle === "daily" ? "日结" : "月结") + " · " + F.money(data.latest.netPay) : "")),

      data.latestMonth ? h("div", { className: "wbsal-card wbsal-section" },
        h("div", { className: "wbsal-section-head" },
          h("h3", null, F.monthLabel(data.latestMonth.period) + " 收入与扣款构成"),
          h("span", null, "共 " + data.latestMonth.records + " 笔")),
        h("div", { className: "wbsal-comp-grid" },
          h("div", null,
            h("div", { className: "wbsal-group-title" }, "收入项 · 合计 " + F.money(latestBreakdown.income)),
            compRows(F.INCOME_KEYS, latestBreakdown.income, false)),
          h("div", null,
            h("div", { className: "wbsal-group-title" }, "扣款项 · 合计 " + F.money(deductionTotal)),
            compRows(F.PRETAX_KEYS.concat(F.SOCIAL_KEYS, F.TAX_KEYS), deductionTotal, true)))) : null,

      h("div", { className: "wbsal-card wbsal-section" },
        h("div", { className: "wbsal-section-head" },
          h("h3", null, "月度明细"),
          h("span", null, "点击月份可在工资记录页查看对应记录")),
        h("div", { className: "wbsal-table-wrap", style: { border: 0 } },
          h("table", { className: "wbsal-table" },
            h("thead", null, h("tr", null, ["月份", "笔数", "应发", "实发", "社保公积金", "个税", "环比"].map(function (label) { return h("th", { key: label }, label); }))),
            h("tbody", null, tableRows.map(function (entry) {
              var bucket = entry.bucket;
              var diff = entry.prev ? bucket.netPay - entry.prev : 0;
              return h("tr", { key: bucket.month },
                h("td", { className: "left" }, bucket.month + " 月"),
                h("td", null, bucket.records),
                h("td", null, F.money(bucket.grossPay)),
                h("td", null, h("b", { className: "wbsal-net" }, F.money(bucket.netPay))),
                h("td", { className: "wbsal-opt" }, F.money(bucket.socialTotal)),
                h("td", { className: "wbsal-opt" }, F.money(bucket.incomeTax)),
                h("td", null, entry.prev ? signed(diff) : "—"));
            }))))));
  }

  return h("div", { className: "wbsal-page" },
    h("header", { className: "wbsal-head" },
      h("div", { className: "wbsal-head-main" },
        h("div", { className: "wbsal-eyebrow" }, "Salary stats"),
        h("h2", null, "统计"),
        h("p", { className: "wbsal-sub" }, "按发薪日期归属月份聚合；日结多笔自动合并")),
      h("div", { className: "wbsal-seg" },
        h(C.Btn, { h: h, kind: "ghost", onClick: function () { setYear(Math.max(2000, year - 1)); } }, "‹"),
        h("span", { className: "wbsal-seg-year" }, year + " 年"),
        h(C.Btn, { h: h, kind: "ghost", onClick: function () { setYear(Math.min(2100, year + 1)); } }, "›"))),
    body);
};
