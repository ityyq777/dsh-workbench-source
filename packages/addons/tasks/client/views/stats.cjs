// 任务统计视图：一次拉取 tasks.statsReport，区块化渲染。
var React = require("react");
var h = React.createElement;
var charts = require("../stats/charts.cjs");
var configView = require("./config.cjs");
var recentColumns = require("../item/recent-columns.cjs");
var Heatmap = require("../stats/heatmap.cjs");
var Today = require("../stats/today.cjs");

var COPY = {
  zh: {
    title: "任务统计", range7: "近 7 天", range30: "近 30 天", range90: "近 90 天", range365: "近 1 年", rangeAll: "全部",
    refresh: "刷新", asOf: "截至", retry: "重试", loadFail: "统计服务未就绪，请升级插件后重试",
    rangeFrom: "起始日期", rangeTo: "终止日期", rangeClear: "清除自定义范围",
    rangeCustom: "自定义日期范围", rangeIncomplete: "请选择完整的起始与终止日期",
    rangeInvalid: "起始日期不能晚于终止日期",
    total: "总任务", active: "进行中", overdue: "逾期", completion: "完成率",
    dueToday: "今日到期", dueNext7: "未来 7 天到期", newInRange: "范围内新增", avgCycle: "平均完成周期",
    days: "天", current: "当前", inRange: "范围内", ofTotal: "占总量", ofActive: "占进行中",
    trend: "新增 / 完成 / 到期趋势", trendNote: "按自然日 / 周 / 月分桶",
    created: "新增", done: "完成", due: "到期",
    status: "状态构成", statusNote: "当前存量",
    priority: "优先级分布", priorityNote: "当前存量；不含已关闭/已完成",
    difficulty: "难度分布", difficultyNote: "当前存量；包含未设置", difficultyMissing: "未填难度 {n} 条", difficultyMissingLink: "查看并补齐难度",
    aging: "逾期账龄", agingNote: "当前逾期任务",
    overdueList: "逾期清单", overdueNote: "按账龄降序",
    tables: "任务表排行", tablesNote: "按进行中 + 逾期权重",
    groups: "任务组排行", groupsNote: "一级任务组",
    colName: "名称", colTotal: "总数", colOpen: "进行中", colOverdue: "逾期", colDone: "已完成", colRate: "完成率",
    colTitle: "任务", colTarget: "计划完成", colAge: "逾期天数", colTable: "任务表",
    recentDone: "最近完成", recentDoneNote: "按完成日期倒序", recentShutdown: "最近关闭", recentShutdownNote: "按关闭日期倒序",
    colDate: "日期", colAgo: "距今天", noRecentDone: "还没有已完成的任务", noRecentShutdown: "还没有已关闭的任务",
    noOverdue: "没有逾期任务", noData: "还没有任务。在「记录」里创建后，这里会自动汇总",
    open: "进行中", shutdown: "已关闭", restarted: "已重启",
  },
  en: {
    title: "Task stats", range7: "7 days", range30: "30 days", range90: "90 days", range365: "1 year", rangeAll: "All",
    refresh: "Refresh", asOf: "As of", retry: "Retry", loadFail: "Stats service not ready. Upgrade the plugin and retry.",
    rangeFrom: "Start date", rangeTo: "End date", rangeClear: "Clear custom range",
    rangeCustom: "Custom date range", rangeIncomplete: "Pick both start and end dates",
    rangeInvalid: "Start date must not be after end date",
    total: "Tasks", active: "Active", overdue: "Overdue", completion: "Completion",
    dueToday: "Due today", dueNext7: "Due next 7d", newInRange: "New in range", avgCycle: "Avg cycle",
    days: "d", current: "Current", inRange: "In range", ofTotal: "of total", ofActive: "of active",
    trend: "Created / done / due trend", trendNote: "Bucketed by day / week / month",
    created: "Created", done: "Done", due: "Due",
    status: "Status", statusNote: "Current",
    priority: "Priority", priorityNote: "Current; excludes closed/completed",
    difficulty: "Difficulty", difficultyNote: "Current; includes unset", difficultyMissing: "{n} tasks without difficulty", difficultyMissingLink: "Review missing difficulty",
    aging: "Overdue aging", agingNote: "Current overdue",
    overdueList: "Overdue list", overdueNote: "Oldest first",
    tables: "Task tables", tablesNote: "Weighted by active + overdue",
    groups: "Task groups", groupsNote: "First-level groups",
    colName: "Name", colTotal: "Total", colOpen: "Active", colOverdue: "Overdue", colDone: "Done", colRate: "Completion",
    colTitle: "Task", colTarget: "Target", colAge: "Days late", colTable: "Table",
    recentDone: "Recently completed", recentDoneNote: "Newest completion first", recentShutdown: "Recently closed", recentShutdownNote: "Newest closure first",
    colDate: "Date", colAgo: "Days ago", noRecentDone: "No completed tasks yet", noRecentShutdown: "No closed tasks yet",
    noOverdue: "No overdue tasks", noData: "No tasks yet. Create one in Tasks and the summary appears here.",
    open: "Active", shutdown: "Closed", restarted: "Restarted",
  },
};

var RANGES = ["7d", "30d", "90d", "365d", "all"];

// 优先级 0（已关闭/已完成）不画；难度未设置保留并提供补齐入口。
function visibleBins(list) {
  return (list || []).filter(function (b) { return !b.hidden; });
}

var CFG_FALLBACK = { "stats.range": "30d", "stats.top": 10, "stats.showKpi": true, "stats.recentDoneLimit": 10, "stats.recentShutdownLimit": 10 };

function TasksStatsView(props) {
  var lang = props.lang === "en" ? "en" : "zh";
  var cfg = configView.useConfig(props.api, CFG_FALLBACK);
  if (!cfg.ready) {
    return h("div", { style: { padding: "48px", textAlign: "center", fontSize: "12.5px", opacity: .6 } }, lang === "en" ? "Loading…" : "载入中…");
  }
  return h(TasksStatsBody, Object.assign({}, props, { cfg: cfg.values }));
}

function TasksStatsBody(props) {
  var lang = props.lang === "en" ? "en" : "zh";
  var t = COPY[lang];
  var api = props.api;
  var cfg = props.cfg || {};
  var cfgRange = RANGES.indexOf(cfg["stats.range"]) >= 0 ? cfg["stats.range"] : "30d";
  var cfgTop = Math.floor(Number(cfg["stats.top"]));
  if (!(cfgTop >= 5)) cfgTop = 10;
  if (cfgTop > 20) cfgTop = 20;
  var cfgSections = Array.isArray(cfg["stats.sections"]) ? cfg["stats.sections"] : null;
  function sectionOn(key) { return !cfgSections || cfgSections.indexOf(key) >= 0; }
  var ch = React.useMemo(function () { return charts.makeCharts("wbt"); }, []);
  var rangePair = React.useState(cfgRange);
  var range = rangePair[0], setRange = rangePair[1];
  var dataPair = React.useState(null);
  var data = dataPair[0], setData = dataPair[1];
  var errPair = React.useState("");
  var err = errPair[0], setErr = errPair[1];
  var loadPair = React.useState(true);
  var loading = loadPair[0], setLoading = loadPair[1];
  var req = React.useRef(0);
  var customPair = React.useState(null);
  var custom = customPair[0], setCustom = customPair[1];
  var todayDay = React.useMemo(function () {
    var d = new Date();
    function p(n) { return String(n).padStart(2, "0"); }
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }, []);
  var customFrom = custom && custom.from ? custom.from : "";
  var customTo = custom && custom.to ? custom.to : "";
  var customOk = !!(customFrom && customTo && customFrom <= customTo);
  var customHint = "";
  if (!customOk && (customFrom || customTo)) {
    customHint = customFrom && customTo ? t.rangeInvalid : t.rangeIncomplete;
  }

  function cfgLimit(key) {
    var n = Number(cfg[key]);
    if (!Number.isFinite(n)) return 10;
    return Math.max(1, Math.min(50, Math.floor(n)));
  }

  var load = React.useCallback(function (silent) {
    // 起止日期只填了一半或顺序颠倒时先不发请求，保留上一份结果，避免闪回预设范围。
    if ((customFrom || customTo) && !customOk) return Promise.resolve();
    var id = ++req.current;
    if (!silent) setLoading(true);
    var args = {
      top: cfgTop,
      recentDoneLimit: cfgLimit("stats.recentDoneLimit"),
      recentShutdownLimit: cfgLimit("stats.recentShutdownLimit"),
    };
    if (customOk) { args.from = customFrom; args.to = customTo; } else { args.range = range; }
    return Promise.resolve(api.call("tasks.statsReport", args))
      .then(function (r) { return r && r.result !== undefined ? r.result : r; })
      .then(function (d) {
        if (id !== req.current) return;
        setData(d); setErr("");
      })
      .catch(function (e) {
        if (id !== req.current) return;
        setErr(String((e && e.message) || e || "load failed"));
      })
      .then(function () { if (id === req.current) setLoading(false); });
  }, [api, range, customOk, customFrom, customTo, cfgTop, cfg]);

  React.useEffect(function () { if (props.active !== false) load(true); }, [load, props.active]);

  React.useEffect(function () {
    if (props.active === false || !api || typeof api.subscribe !== "function") return undefined;
    var timer = null;
    var pending = false;
    var off = api.subscribe(function (payload) {
      var ev = payload && payload.event;
      if (ev !== "tasks-changed" && ev !== "task-nodes-changed") return;
      if (typeof document !== "undefined" && document.visibilityState && document.visibilityState !== "visible") {
        pending = true;
        return;
      }
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () { load(true); }, 800);
    });
    function onVisible() {
      if (typeof document !== "undefined" && document.visibilityState === "visible" && pending) {
        pending = false;
        load(true);
      }
    }
    if (typeof document !== "undefined") document.addEventListener("visibilitychange", onVisible);
    return function () {
      if (timer) clearTimeout(timer);
      if (typeof document !== "undefined") document.removeEventListener("visibilitychange", onVisible);
      if (typeof off === "function") off();
    };
  }, [api, load, props.active]);

  var options = RANGES.map(function (key) {
    return { key: key, label: t["range" + (key === "all" ? "All" : key.replace("d", ""))] };
  });

  var children = [];
  if (!data && loading) children.push(h(ch.Skeleton, { key: "sk" }));
  if (!data && !loading && err) {
    children.push(h(ch.Card, { key: "err", span: 12 }, h(ch.Empty, { text: t.loadFail })));
  }
  if (data) {
    var totals = data.totals || {};
    var rates = data.rates || {};
    var b = data.breakdowns || {};
    children.push(h("div", { key: "kpi", className: "wbt-kpis" },
      h(ch.Kpi, { label: t.total, value: totals.total, hint: t.current, lang: lang }),
      h(ch.Kpi, { label: t.active, value: totals.active, hint: t.ofTotal + " " + ch.pct(totals.total ? totals.active / totals.total : 0), lang: lang }),
      h(ch.Kpi, { label: t.overdue, value: totals.overdue, hint: t.ofActive + " " + ch.pct(rates.overdue), tone: totals.overdue > 0 ? "danger" : "", lang: lang }),
      h(ch.Kpi, { label: t.completion, value: ch.pct(rates.completion), hint: totals.done + " / " + totals.total, tone: "ok", lang: lang }),
      h(ch.Kpi, { label: t.dueToday, value: totals.dueToday, hint: t.current, tone: totals.dueToday > 0 ? "warn" : "", lang: lang }),
      h(ch.Kpi, { label: t.dueNext7, value: totals.dueNext7, hint: t.current, lang: lang }),
      h(ch.Kpi, { label: t.newInRange, value: totals.newInRange, hint: t.inRange, lang: lang }),
      h(ch.Kpi, { label: t.avgCycle, value: rates.avgCycleDays === null || rates.avgCycleDays === undefined ? "—" : rates.avgCycleDays, unit: t.days, hint: t.inRange, lang: lang }),
    ));

    if (totals.total === 0) {
      children.push(h(ch.Card, { key: "empty", span: 12 }, h(ch.Empty, { text: t.noData })));
    } else {
      children.push(h(ch.Card, { key: "trend", span: 8, title: t.trend, note: t.trendNote },
        h(ch.Trend, {
          data: data.trend || [], lang: lang,
          series: [
            { key: "created", label: t.created, color: ch.colors[0] },
            { key: "done", label: t.done, color: ch.colors[1] },
            { key: "due", label: t.due, color: ch.colors[2] },
          ],
        })));
      var statusData = (b.status || []).filter(function (s) { return Object.prototype.hasOwnProperty.call(ch.statusColors, s.key); }).map(function (s) {
        return { key: s.key, label: String(s.key) === "0" ? t.open : String(s.key) === "1" ? t.shutdown : t.colDone, count: s.count, color: ch.statusColors[s.key] };
      });
      var statusTotal = statusData.reduce(function (sum, s) { return sum + Number(s.count || 0); }, 0);
      children.push(h(ch.Card, { key: "status", span: 4, title: t.status, note: t.statusNote },
        h(ch.Donut, {
          data: statusData,
          total: statusTotal, lang: lang, centerLabel: t.total,
          aria: t.total + " " + statusTotal + "; " + statusData.map(function (s) { return s.label + " " + s.count; }).join("; "),
        })));

      children.push(h(ch.Card, { key: "priority", span: 6, title: t.priority, note: t.priorityNote },
        h(ch.Histogram, { data: visibleBins(b.priority), lang: lang, color: ch.colors[0] })));
      var missingBin = (b.difficulty || []).find(function (bin) { return bin.key === "unset"; });
      children.push(h(ch.Card, { key: "difficulty", span: 6, title: t.difficulty, note: t.difficultyNote },
        h(ch.Histogram, { data: (b.difficulty || []).map(function (bin) { return bin.key === "unset" ? Object.assign({}, bin, { label: lang === "en" ? "Unset" : "未设置" }) : bin; }), lang: lang, color: ch.colors[4] }),
        h("p", null, t.difficultyMissing.replace("{n}", String(missingBin ? missingBin.count : 0)), " ",
          typeof props.onNavigate === "function" ? h("button", { type: "button", className: "wbt-btn ghost", onClick: function () { props.onNavigate("tasks", { difficultyMissing: true }); } }, t.difficultyMissingLink) : null)));

      children.push(h(ch.Card, { key: "aging", span: 6, title: t.aging, note: t.agingNote },
        h(ch.Histogram, { data: data.aging || [], lang: lang, color: ch.colors[2] })));
      children.push(h(ch.Card, { key: "overdue", span: 6, title: t.overdueList, note: t.overdueNote },
        h(ch.DataTable, {
          rows: (data.lists && data.lists.overdue) || [], lang: lang, empty: t.noOverdue,
          columns: [
            { key: "title", label: t.colTitle },
            { key: "targetDate", label: t.colTarget },
            { key: "daysOverdue", label: t.colAge, num: true },
            { key: "tableTitle", label: t.colTable },
          ],
        })));

      children.push(h(ch.Card, { key: "tables", span: 6, title: t.tables, note: t.tablesNote },
        h(ch.DataTable, {
          rows: (data.rankings && data.rankings.tables) || [], lang: lang,
          columns: [
            { key: "title", label: t.colName },
            { key: "total", label: t.colTotal, num: true },
            { key: "open", label: t.colOpen, num: true },
            { key: "overdue", label: t.colOverdue, num: true },
            { key: "completion", label: t.colRate, num: true, render: function (r) { return ch.pct(r.completion); } },
          ],
        })));
      children.push(h(ch.Card, { key: "groups", span: 6, title: t.groups, note: t.groupsNote },
        h(ch.DataTable, {
          rows: (data.rankings && data.rankings.groups) || [], lang: lang,
          columns: [
            { key: "title", label: t.colName },
            { key: "total", label: t.colTotal, num: true },
            { key: "open", label: t.colOpen, num: true },
            { key: "overdue", label: t.colOverdue, num: true },
            { key: "completion", label: t.colRate, num: true, render: function (r) { return ch.pct(r.completion); } },
          ],
        })));

      var recentCols = recentColumns(t, lang, props.onNavigate);
      children.push(h(ch.Card, { key: "recentDone", span: 6, title: t.recentDone, note: t.recentDoneNote },
        h(ch.DataTable, { rows: (data.lists && data.lists.recentDone) || [], lang: lang, empty: t.noRecentDone, columns: recentCols })));
      children.push(h(ch.Card, { key: "recentShutdown", span: 6, title: t.recentShutdown, note: t.recentShutdownNote },
        h(ch.DataTable, { rows: (data.lists && data.lists.recentShutdown) || [], lang: lang, empty: t.noRecentShutdown, columns: recentCols })));
    }
    children.push(h(ch.Warnings, { key: "warn", items: data.warnings || [] }));
  }

  children = children.filter(function (node) {
    var k = node && node.key;
    if (!k || k === "sk" || k === "err" || k === "warn" || k === "empty") return true;
    if (k === "kpi") return cfg["stats.showKpi"] !== false;
    return sectionOn(k);
  });

  return h("div", { className: "wbt-stats" },
    h(Today, { today: data && data.today, lang: lang }),
    h(Heatmap, { api: api, lang: lang, active: props.active, onNavigate: props.onNavigate }),
    h(ch.RangeSwitch, {
      options: options, value: customFrom || customTo ? null : range,
      onChange: function (key) { setCustom(null); setRange(key); },
      custom: { from: customFrom, to: customTo },
      onCustomChange: function (next) { setCustom({ from: next.from || "", to: next.to || "" }); },
      onCustomClear: function () { setCustom(null); },
      customHint: customHint, today: todayDay,
      fromLabel: t.rangeFrom, toLabel: t.rangeTo, clearLabel: t.rangeClear, customAria: t.rangeCustom,
      onRefresh: function () { load(false); },
      loading: loading, generatedAt: data && data.generatedAt, refreshLabel: t.refresh, timeLabel: t.asOf,
    }),
    err && data ? h(ch.ErrorBar, { message: err, onRetry: function () { load(false); }, retryLabel: t.retry }) : null,
    h("div", { className: "wbt-sgrid" }, children),
  );
}

module.exports = { TasksStatsView: TasksStatsView };
