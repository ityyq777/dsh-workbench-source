// Publication range UI; API state only receives real calendar dates in ascending order.
var React = require("react"), h = React.createElement;
var charts = require("./charts.cjs").makeCharts("wbt-date");
var Icon = require("./icons.cjs").Icon;
function validDate(value) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  var d = new Date(value + "T00:00:00Z");
  return isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value && value.slice(0, 4) !== "0000";
}
function normalize(value) {
  var from = value.from || "", to = value.to || "";
  if (!validDate(from) || !validDate(to)) return null;
  return from && to && from > to ? {from:to,to:from,swapped:true} : {from:from,to:to,swapped:false};
}
function label(value, en) {
  var from = value.from.slice(5), to = value.to.slice(5);
  return from && to ? from + "–" + to : from ? from + (en ? " onward" : "起") : to ? (en ? "Until " : "至") + to : en ? "Time range" : "时间范围";
}
function DateFilter(props) {
  var en = props.lang === "en", value = props.value;
  var openS = React.useState(false), open = openS[0], setOpen = openS[1];
  var hintS = React.useState(""), hint = hintS[0], setHint = hintS[1];
  var root = React.useRef(null), trigger = React.useRef(null), id = React.useId();
  React.useEffect(function () {
    if (!open) return;
    function outside(e) { if (root.current && !root.current.contains(e.target)) setOpen(false); }
    function key(e) { if (e.key === "Escape") { e.preventDefault(); setOpen(false); if (trigger.current) trigger.current.focus(); } }
    document.addEventListener("pointerdown", outside); document.addEventListener("keydown", key);
    return function () { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", key); };
  }, [open]);
  React.useEffect(function () { setHint(""); }, [props.lang]);
  function clear() { setHint(""); props.onChange({from:"",to:""}); }
  function change(next) {
    var normalized = normalize(next);
    if (!normalized) { setHint(en ? "Enter a valid date" : "请输入有效日期"); return; }
    setHint(normalized.swapped ? (en ? "Start was after end; dates swapped" : "起始晚于终止，已交换") : "");
    props.onChange({from:normalized.from,to:normalized.to});
  }
  return h("div", {ref:root, className:"wbt-publication-filter", style:{position:"relative",display:"inline-flex",alignItems:"center"}},
    h("button", {type:"button",ref:trigger,className:"wbt-btn " + (value.from || value.to ? "primary" : "ghost"),
      "aria-expanded":open,"aria-controls":id,title:en ? "Publication time" : "发布时间",onClick:function(){setOpen(!open);}}, h(Icon, {name:"calendar"}), h("span", {className:"wbt-date-label"}, label(value,en))),
    value.from || value.to ? h("button", {type:"button",className:"wbt-date-clear","aria-label":en ? "Clear time range" : "清除时间范围",onClick:clear}, "×") : null,
    open ? h("div", {id:id,role:"group","aria-label":en ? "Publication time" : "发布时间",className:"wbt-date-popover"},
      h(charts.DateRangePicker, {custom:value,onCustomChange:change,onCustomClear:clear,
        onInvalidInput:function(){setHint(en ? "Enter a valid date" : "请输入有效日期");},
        fromLabel:en ? "Publication start date" : "发布起始日期",toLabel:en ? "Publication end date" : "发布终止日期",
        customAria:en ? "Publication date range" : "发布时间范围",clearLabel:en ? "Clear time range" : "清除时间范围",customHint:hint})) : null);
}
module.exports = {DateFilter:DateFilter,normalize:normalize,label:label,validDate:validDate};
