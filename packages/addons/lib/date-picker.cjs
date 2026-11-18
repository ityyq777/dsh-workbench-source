"use strict";
/**
 * 共享日期控件家族（样式跟随主题，颜色只用 --wb-* 令牌）：
 *
 *   DatePicker      选一个日期        （月历弹层，工资发薪日、任务截止日）
 *   RangePicker     选一段起止日期    （任务筛选：先选开始、再选结束，可只留一端）
 *   MonthPicker     选一个月份        （按月筛选/归档）
 *   InlineCalendar  直接铺开的月历    （日历类页面，不弹层）
 *
 * 背景：任务、工资、标签、站点原来各写一份日历，差异只在 CSS 前缀，行为却各写一遍。
 * 现在只保留这一份实现，插件用 prefix 传入自己的前缀（wbt/wbsal/wbg/wbs），样式来自
 * lib/date-picker-styles.cjs。值统一是 UTC 下的 `YYYY-MM-DD`（月份为 `YYYY-MM`）。
 *
 * React 从 props.React 取（宿主视图本来就注入 React/h），取不到才退回真实 react，
 * 这样预览与冒烟测试可以用替身 React 渲染，不必启动浏览器。
 */
var ReactDefault = require("react");
var MONTH_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function pad(n) { return String(n).padStart(2, "0"); }
function todayISO() {
  var d = new Date();
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}
function validDate(value) {
  if (!value) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  var d = new Date(value + "T00:00:00Z");
  return isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value && value.slice(0, 4) !== "0000";
}
function toUTC(iso) { return new Date(iso + "T00:00:00Z"); }
function shiftDate(iso, days) {
  var d = toUTC(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
function shiftMonth(month, delta) {
  var d = toUTC(month + "-01");
  d.setUTCMonth(d.getUTCMonth() + delta);
  return d.toISOString().slice(0, 7);
}
function monthKey(iso) { return (iso || todayISO()).slice(0, 7); }
function monthLabel(month, en) {
  return en ? month.slice(0, 4) + "-" + month.slice(5) : month.slice(0, 4) + "年" + Number(month.slice(5)) + "月";
}
function daysInMonth(month) {
  return new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5)), 0)).getUTCDate();
}
function normalizeRange(value) {
  var from = value && validDate(value.from) ? value.from : "";
  var to = value && validDate(value.to) ? value.to : "";
  if (from && to && from > to) return { from: to, to: from, swapped: true };
  return { from: from, to: to, swapped: false };
}
function clampDay(iso, min, max) {
  if (min && iso < min) return false;
  if (max && iso > max) return false;
  return true;
}

/** 取本组件的 React 与 createElement：优先用调用方注入的，方便测试替身。 */
function ctx(props) {
  var R = (props && props.React) || ReactDefault;
  return { R: R, h: (props && props.h) || R.createElement };
}

function usePopover(R, open, setOpen, root) {
  R.useEffect(function () {
    if (!open) return undefined;
    function onDoc(ev) { if (root.current && !root.current.contains(ev.target)) setOpen(false); }
    function onKey(ev) { if (ev.key === "Escape") setOpen(false); }
    if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
      document.addEventListener("mousedown", onDoc);
      document.addEventListener("keydown", onKey);
      return function () {
        document.removeEventListener("mousedown", onDoc);
        document.removeEventListener("keydown", onKey);
      };
    }
    return undefined;
  }, [open]);
}

function Calendar(props) {
  var h = props.h, p = props.prefix, en = props.lang === "en";
  var month = props.month, cells = [];
  var offset = toUTC(month + "-01").getUTCDay();
  var count = daysInMonth(month);
  var i;
  for (i = 0; i < offset; i++) cells.push(h("span", { key: "e" + i, "aria-hidden": "true" }));
  for (i = 1; i <= count; i++) {
    var day = month + "-" + pad(i);
    var disabled = !clampDay(day, props.min, props.max);
    var selected = props.isSelected ? props.isSelected(day) : false;
    var between = props.isBetween ? props.isBetween(day) : false;
    cells.push(h("button", {
      key: day, type: "button", disabled: disabled, "data-day": day,
      "aria-label": day, "aria-pressed": selected, "aria-current": day === todayISO() ? "date" : undefined,
      className: p + "-dp-day" + (selected ? " is-on" : "") + (between ? " is-between" : "") + (day === todayISO() ? " is-today" : ""),
      onClick: props.onPick.bind(null, day),
      onKeyDown: function (ev) {
        var delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[ev.key];
        if (!delta) return;
        ev.preventDefault();
        var next = shiftDate(ev.currentTarget.getAttribute("data-day"), delta);
        if (clampDay(next, props.min, props.max)) props.onMove(monthKey(next), next);
      },
    }, i));
  }
  return h("div", { className: p + "-dp-cal", role: "group", "aria-label": en ? "Calendar" : "日历" },
    h("div", { className: p + "-dp-head" },
      h("button", { type: "button", className: p + "-dp-nav", "aria-label": en ? "Previous month" : "上个月", onClick: function () { props.onMove(shiftMonth(month, -1), ""); } }, "‹"),
      h("strong", { className: p + "-dp-title", "aria-live": "polite" }, monthLabel(month, en)),
      h("button", { type: "button", className: p + "-dp-nav", "aria-label": en ? "Next month" : "下个月", onClick: function () { props.onMove(shiftMonth(month, 1), ""); } }, "›")),
    h("div", { className: p + "-dp-weekdays", "aria-hidden": "true" },
      (en ? ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] : ["日", "一", "二", "三", "四", "五", "六"]).map(function (w) {
        return h("span", { key: w }, w);
      })),
    h("div", { className: p + "-dp-grid" }, cells));
}

function DatePicker(props) {
  var c = ctx(props), R = c.R, h = c.h;
  var p = props.prefix, en = props.lang === "en";
  var value = validDate(props.value) ? props.value : "";
  var openS = R.useState(!!props.defaultOpen), open = openS[0], setOpen = openS[1];
  var monthS = R.useState(monthKey(value || props.max || todayISO())), month = monthS[0], setMonth = monthS[1];
  var root = R.useRef(null);
  usePopover(R, open, setOpen, root);
  function pick(day) { if (props.onChange) props.onChange(day); setOpen(false); }
  function toggle() {
    setMonth(monthKey(validDate(props.value) ? props.value : (props.max || todayISO())));
    setOpen(!open);
  }
  return h("div", { className: p + "-dp" + (props.className ? " " + props.className : ""), ref: root },
    h("div", { className: p + "-dp-field" },
      h("button", {
        type: "button", className: p + "-dp-trigger", disabled: !!props.disabled, "aria-haspopup": "dialog", "aria-expanded": open,
        "aria-label": (props.label ? props.label + ": " : "") + (value || props.placeholder || (en ? "Pick a date" : "选择日期")),
        onClick: toggle,
      },
        h("span", { className: p + "-dp-glyph", "aria-hidden": "true" }),
        h("span", { className: p + "-dp-value" + (value ? "" : " is-empty") }, value || props.placeholder || (en ? "Pick a date" : "选择日期"))),
      value && !props.disabled && props.clearable !== false
        ? h("button", { type: "button", className: p + "-dp-clear", "aria-label": en ? "Clear date" : "清除日期", onClick: function () { if (props.onChange) props.onChange(""); } }, "×")
        : null),
    open ? h("div", { className: p + "-dp-pop", role: "dialog", "aria-modal": "false", "aria-label": props.label || (en ? "Pick a date" : "选择日期") },
      h(Calendar, { h: h, prefix: p, lang: props.lang, month: month, min: props.min, max: props.max, onMove: function (m) { setMonth(m); }, isSelected: function (d) { return d === value; }, onPick: pick }),
      h("div", { className: p + "-dp-foot" },
        h("button", { type: "button", className: p + "-dp-link", onClick: function () { pick(todayISO()); } }, en ? "Today" : "今天"),
        props.min || props.max ? h("span", { className: p + "-dp-hint" }, [props.min, props.max].filter(Boolean).join(" — ")) : null)) : null);
}

function RangePicker(props) {
  var c = ctx(props), R = c.R, h = c.h;
  var p = props.prefix, en = props.lang === "en";
  var range = normalizeRange(props.value);
  var from = range.from, to = range.to;
  var openS = R.useState(!!props.defaultOpen), open = openS[0], setOpen = openS[1];
  var startS = R.useState(""), start = startS[0], setStart = startS[1];
  var monthS = R.useState(monthKey(from || to || props.max || todayISO())), month = monthS[0], setMonth = monthS[1];
  var root = R.useRef(null);
  usePopover(R, open, setOpen, root);
  function apply(next) {
    if (typeof props.onChange === "function") props.onChange(normalizeRange(next));
    setStart("");
    setOpen(false);
  }
  function pick(day) {
    if (!start) { setStart(day); return; }
    apply({ from: start, to: day });
  }
  function toggle() {
    setStart("");
    setMonth(monthKey(from || to || props.max || todayISO()));
    setOpen(!open);
  }
  var summary = from && to ? from + " — " + to : from ? from + (en ? " onward" : " 起") : to ? (en ? "Until " : "截至 ") + to : (props.placeholder || (en ? "Choose date range" : "选择日期范围"));
  return h("div", { className: p + "-dr" + (props.className ? " " + props.className : ""), ref: root },
    h("div", { className: p + "-dp-field" },
      h("button", {
        type: "button", className: p + "-dp-trigger", "aria-haspopup": "dialog", "aria-expanded": open,
        "aria-label": (props.label || (en ? "Date range" : "日期范围")) + ": " + summary,
        onClick: toggle,
      },
        h("span", { className: p + "-dp-glyph", "aria-hidden": "true" }),
        h("span", { className: p + "-dp-value" + (from || to ? "" : " is-empty") }, summary)),
      (from || to) && props.clearable !== false
        ? h("button", { type: "button", className: p + "-dp-clear", "aria-label": en ? "Clear range" : "清除范围", onClick: function () { apply({ from: "", to: "" }); } }, "×")
        : null),
    open ? h("div", { className: p + "-dp-pop", role: "dialog", "aria-modal": "false", "aria-label": props.label || (en ? "Date range" : "日期范围") },
      h(Calendar, {
        h: h, prefix: p, lang: props.lang, month: month, min: props.min, max: props.max,
        onMove: function (m) { setMonth(m); },
        isSelected: function (d) { return start ? d === start : d === from || d === to; },
        isBetween: function (d) { return start ? start < d && d < (to || "") : !!(from && to && d > from && d < to); },
        onPick: pick,
      }),
      h("p", { className: p + "-dp-hint", role: "status" },
        start ? (en ? "Start " + start + " · pick the end date" : "起始 " + start + " · 请选择结束日期")
          : (en ? "Pick start, then end date" : "先选开始日期，再选结束日期")),
      start ? h("div", { className: p + "-dp-acts" },
        h("button", { type: "button", className: p + "-dp-link", onClick: function () { apply({ from: start, to: "" }); } }, en ? "Only start" : "仅起始日期"),
        h("button", { type: "button", className: p + "-dp-link", onClick: function () { apply({ from: "", to: start }); } }, en ? "Only end" : "仅截止日期")) : null,
      h("div", { className: p + "-dp-foot" },
        h("button", { type: "button", className: p + "-dp-link", onClick: function () { setOpen(false); setStart(""); } }, en ? "Cancel" : "取消"))) : null);
}

function MonthPicker(props) {
  var c = ctx(props), R = c.R, h = c.h;
  var p = props.prefix, en = props.lang === "en";
  var value = /^\d{4}-\d{2}$/.test(props.value || "") ? props.value : "";
  var base = value || monthKey(props.max || todayISO());
  var openS = R.useState(!!props.defaultOpen), open = openS[0], setOpen = openS[1];
  var yearS = R.useState(Number(base.slice(0, 4))), year = yearS[0], setYear = yearS[1];
  var root = R.useRef(null);
  usePopover(R, open, setOpen, root);
  function pick(month) { if (props.onChange) props.onChange(month); setOpen(false); }
  var months = [];
  for (var m = 1; m <= 12; m++) {
    var key = year + "-" + pad(m);
    months.push(h("button", {
      key: key, type: "button", "data-month": key, "aria-pressed": key === value,
      className: p + "-dp-day" + (key === value ? " is-on" : "") + (key === monthKey(todayISO()) ? " is-today" : ""),
      onClick: pick.bind(null, key),
    }, en ? MONTH_EN[m - 1] : m + "月"));
  }
  return h("div", { className: p + "-dp" + (props.className ? " " + props.className : ""), ref: root },
    h("div", { className: p + "-dp-field" },
      h("button", {
        type: "button", className: p + "-dp-trigger", "aria-haspopup": "dialog", "aria-expanded": open,
        "aria-label": (props.label || (en ? "Pick a month" : "选择月份")) + ": " + (value ? monthLabel(value, en) : ""),
        onClick: function () { setYear(Number((value || base).slice(0, 4))); setOpen(!open); },
      },
        h("span", { className: p + "-dp-glyph", "aria-hidden": "true" }),
        h("span", { className: p + "-dp-value" + (value ? "" : " is-empty") }, value ? monthLabel(value, en) : (props.placeholder || (en ? "Pick a month" : "选择月份")))),
      value && props.clearable !== false
        ? h("button", { type: "button", className: p + "-dp-clear", "aria-label": en ? "Clear month" : "清除月份", onClick: function () { if (props.onChange) props.onChange(""); } }, "×")
        : null),
    open ? h("div", { className: p + "-dp-pop is-months", role: "dialog", "aria-modal": "false", "aria-label": props.label || (en ? "Pick a month" : "选择月份") },
      h("div", { className: p + "-dp-head" },
        h("button", { type: "button", className: p + "-dp-nav", "aria-label": en ? "Previous year" : "上一年", onClick: function () { setYear(year - 1); } }, "‹"),
        h("strong", { className: p + "-dp-title", "aria-live": "polite" }, en ? String(year) : year + "年"),
        h("button", { type: "button", className: p + "-dp-nav", "aria-label": en ? "Next year" : "下一年", onClick: function () { setYear(year + 1); } }, "›")),
      h("div", { className: p + "-dp-months" }, months),
      h("div", { className: p + "-dp-foot" },
        h("button", { type: "button", className: p + "-dp-link", onClick: function () { pick(monthKey(todayISO())); } }, en ? "This month" : "本月"),
        h("button", { type: "button", className: p + "-dp-link", onClick: function () { setOpen(false); } }, en ? "Cancel" : "取消"))) : null);
}

/** 内联日历：卡片里直接铺开一个月，不弹层（日历类页面/看板常用）。 */
function InlineCalendar(props) {
  var c = ctx(props), R = c.R, h = c.h;
  var p = props.prefix;
  var value = validDate(props.value) ? props.value : "";
  var monthS = R.useState(monthKey(props.month || value || props.max || todayISO())), month = monthS[0], setMonth = monthS[1];
  return h("div", { className: p + "-dp is-inline" },
    h(Calendar, {
      h: h, prefix: p, lang: props.lang, month: month, min: props.min, max: props.max,
      onMove: function (m) { setMonth(m); if (props.onMonthChange) props.onMonthChange(m); },
      isSelected: function (d) { return d === value; },
      isBetween: props.isBetween,
      onPick: function (d) { if (props.onChange) props.onChange(d); },
    }),
    props.footer ? h("div", { className: p + "-dp-foot" }, props.footer) : null);
}

module.exports = {
  DatePicker: DatePicker,
  RangePicker: RangePicker,
  MonthPicker: MonthPicker,
  InlineCalendar: InlineCalendar,
  todayISO: todayISO,
  validDate: validDate,
  shiftDate: shiftDate,
  shiftMonth: shiftMonth,
  normalizeRange: normalizeRange,
  monthLabel: monthLabel,
  daysInMonth: daysInMonth,
};
