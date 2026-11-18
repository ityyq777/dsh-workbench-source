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
  // 柱状图口径：实发 / 基本工资 / 绩效工资 / 应发，交互方式与任务插件统计页的口径切换一致。
  var METRICS = [
    { key: "netPay", label: "实发" },
    { key: "basePay", label: "基本工资" },
    { key: "performancePay", label: "绩效工资" },
    { key: "grossPay", label: "应发" },
  ];
  var metricState = React.useState(props.initialMetric || "netPay");
  var metric = metricState[0], setMetric = metricState[1];
  var metricLabel = "实发";
  METRICS.forEach(function (m) { if (m.key === metric) metricLabel = m.label; });
  var monthly = (data && data.monthly) || [];
  function metricValue(bucket) { return Number(bucket[metric]) || 0; }
  var maxNet = 1;
  monthly.forEach(function (bucket) { if (metricValue(bucket) > maxNet) maxNet = metricValue(bucket); });
  var topMonth = -1;
  monthly.forEach(function (bucket, i) { if (metricValue(bucket) > 0 && (topMonth < 0 || metricValue(bucket) > metricValue(monthly[topMonth]))) topMonth = i; });

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
          h("h3", null, "月度" + metricLabel + "趋势"),
          h("div", { className: "wbsal-section-tools" },
            h("div", { className: "wbsal-metric", role: "group", "aria-label": "图表统计口径" }, METRICS.map(function (m) {
              return h("button", {
                key: m.key, type: "button", className: m.key === metric ? "on" : "",
                "aria-pressed": m.key === metric,
                onClick: function () { setMetric(m.key); },
              }, m.label);
            })),
            h("span", { className: "wbsal-section-note" }, "最高 " + F.monthLabel(monthly[topMonth] ? monthly[topMonth].period : "") + " · " + F.money(maxNet)))),
        h("div", { className: "wbsal-chart" }, monthly.map(function (bucket, i) {
          var value = metricValue(bucket);
          var ratio = value > 0 ? value / chartMax : 0;
          var height = Math.round(Math.max(ratio * 150, value > 0 ? 6 : 0));
          return h("div", {
            key: bucket.month, className: "wbsal-bar",
            title: bucket.month + " 月 · 基本 " + F.money(bucket.basePay) + " / 绩效 " + F.money(bucket.performancePay) + " / 应发 " + F.money(bucket.grossPay) + " / 实发 " + F.money(bucket.netPay),
          },
            h("div", { className: "wbsal-bar-value" }, value > 0 ? Math.round(value).toLocaleString("zh-CN") : ""),
            h("div", { className: "wbsal-bar-fill" + (i === topMonth ? " top" : ""), style: { height: height + "px" } }),
            h("div", { className: "wbsal-bar-label" }, ""));
        })),
        h("div", { className: "wbsal-axis" }, monthly.map(function (bucket) { return h("span", { key: bucket.month }, bucket.month); })),
        h("div", { className: "wbsal-chart-foot" },
          h("span", { className: "wbsal-legend" }, h("i", null), "有记录月份", h("i", { className: "soft" }), "其他月份"),
          h("span", null, "单位：元 · 按发薪日期归属月份 · 当前口径 " + metricLabel))),

      h("div", { className: "wbsal-card wbsal-section" },
        h("div", { className: "wbsal-section-head" },
          h("h3", null, "五险一金"),
          h("span", null, "年度合计 " + F.money(data.socialTotal) + " · 占应发 " + (data.grossTotal ? Math.round((data.socialTotal / data.grossTotal) * 100) : 0) + "%")),
        h("div", { className: "wbsal-social" }, F.SOCIAL_KEYS.map(function (key) {
          var amount = (data.social && data.social[key]) || 0;
          var share = data.socialTotal ? Math.round((amount / data.socialTotal) * 100) : 0;
          return h("div", { key: key, className: "wbsal-social-item" },
            h("span", null, F.LABELS[key]),
            h("b", null, F.money(amount)),
            h("em", null, "占五险一金 " + share + "%"));
        })),
        h("div", { className: "wbsal-table-wrap", style: { border: 0, marginTop: "12px" } },
          h("table", { className: "wbsal-table" },
            h("thead", null, h("tr", null, ["月份", "养老", "医疗", "失业", "公积金", "合计"].map(function (label) {
              return h("th", { key: label, className: label === "月份" ? "left" : undefined }, label);
            }))),
            h("tbody", null, data.monthly.filter(function (bucket) { return bucket.records > 0; }).map(function (bucket) {
              return h("tr", { key: bucket.month },
                h("td", { className: "left" }, bucket.month + " 月"),
                F.SOCIAL_KEYS.map(function (key) { return h("td", { key: key, className: "wbsal-opt" }, F.money(bucket[key])); }),
                h("td", null, h("b", { className: "wbsal-net" }, F.money(bucket.socialTotal))));
            }))))),

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
    h("div", { className: "wbsal-toolbar wbsal-toolbar-plain" },
      h("div", { className: "wbsal-toolbar-end" },
        h("div", { className: "wbsal-seg" },
          h(C.Btn, { h: h, kind: "ghost", onClick: function () { setYear(Math.max(2000, year - 1)); } }, "‹"),
          h("span", { className: "wbsal-seg-year" }, year + " 年"),
          h(C.Btn, { h: h, kind: "ghost", onClick: function () { setYear(Math.min(2100, year + 1)); } }, "›")))),
    body);
};
