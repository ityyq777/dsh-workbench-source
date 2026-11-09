// Today uses the server's local date and snapshot; never derive it from range or browser time.
var React = require("react"), h = React.createElement;
var COPY = {
  zh: { title: "今日", published: "今日发布", done: "今日完成", shutdown: "今日关闭", average: "平均难度", sample: "样本数", noSample: "无样本", clock: "以服务端当前时间为准" },
  en: { title: "Today", published: "Published today", done: "Completed today", shutdown: "Closed today", average: "Avg difficulty", sample: "samples", noSample: "No samples", clock: "Based on the server's current time" },
};
var css = ".wbt-today h3{margin:0;font-size:14px}.wbt-today-date{display:block;margin:4px 0 12px;font-size:12px;color:var(--dsw-alias-label-tertiary,#8f959e)}";
function Today(props) {
  var data = props.today;
  // An older server has no daily snapshot: omit the card rather than invent zero activity.
  if (!data || typeof data !== "object") return null;
  var lang = props.lang === "en" ? "en" : "zh", t = COPY[lang];
  var sample = Number.isFinite(data.avgSample) && data.avgSample > 0 ? data.avgSample : 0;
  var average = sample && Number.isFinite(data.avgDifficultyDone) ? data.avgDifficultyDone.toFixed(1) : "—";
  var metrics = ["published", "done", "shutdown"].map(function (key) {
    var value = Number.isFinite(data[key]) ? data[key] : 0;
    return { key: key, label: t[key], value: value, aria: lang === "zh" ? t[key] + value + "条" : t[key] + ": " + value + " tasks" };
  });
  metrics.push({ key: "average", label: t.average, value: average,
    aria: t.average + (lang === "zh" ? "" : ": ") + average + ", " + (sample ? t.sample + " " + sample : t.noSample), sample: sample });
  return h("section", { className: "wbt-today", "aria-label": t.title, title: t.clock },
    h("style", null, css), h("h3", null, t.title),
    h("time", { className: "wbt-today-date", dateTime: data.date }, data.date),
    h("div", { className: "wbt-kpis" }, metrics.map(function (metric) {
      return h("div", { key: metric.key, className: "wbt-kpi", role: "group", "aria-label": metric.aria },
        h("div", { className: "wbt-kpi-l", "aria-hidden": true }, metric.label),
        h("div", { className: "wbt-kpi-v", "aria-hidden": true }, metric.value,
          metric.sample !== undefined ? h("span", { className: "wbt-kpi-u" }, "±" + metric.sample) : null));
    })));
}
module.exports = Today;
