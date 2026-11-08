// 任务统计视图：一次拉取 tasks.statsReport，区块化渲染。
var React = require("react");
var h = React.createElement;
var charts = require("./charts.cjs");

var COPY = {
  zh: {
    title: "任务统计", range7: "近 7 天", range30: "近 30 天", range90: "近 90 天", range365: "近 1 年", rangeAll: "全部",
    refresh: "刷新", asOf: "截至", retry: "重试", loadFail: "统计服务未就绪，请升级插件后重试",
    total: "总任务", active: "进行中", overdue: "逾期", completion: "完成率",
    dueToday: "今日到期", dueNext7: "未来 7 天到期", newInRange: "范围内新增", avgCycle: "平均完成周期",
    days: "天", current: "当前", inRange: "范围内", ofTotal: "占总量", ofActive: "占进行中",
    trend: "新增 / 完成 / 到期趋势", trendNote: "按自然日 / 周 / 月分桶",
    created: "新增", done: "完成", due: "到期",
    status: "状态构成", statusNote: "当前存量",
    type: "类型 × 状态", typeNote: "当前存量",
    priority: "优先级分布", priorityNote: "当前存量",
    difficulty: "难度分布", difficultyNote: "当前存量",
    aging: "逾期账龄", agingNote: "当前逾期任务",
    overdueList: "逾期清单", overdueNote: "按账龄降序",
    tables: "任务表排行", tablesNote: "按进行中 + 逾期权重",
    groups: "任务组排行", groupsNote: "一级任务组",
    colName: "名称", colTotal: "总数", colOpen: "进行中", colOverdue: "逾期", colDone: "已完成", colRate: "完成率",
    colTitle: "任务", colTarget: "计划完成", colAge: "逾期天数", colTable: "任务表",
    noOverdue: "没有逾期任务", noData: "还没有任务。在「任务记录」里创建后，这里会自动汇总",
    open: "进行中", shutdown: "已关闭", restarted: "已重启",
  },
  en: {
    title: "Task stats", range7: "7 days", range30: "30 days", range90: "90 days", range365: "1 year", rangeAll: "All",
    refresh: "Refresh", asOf: "As of", retry: "Retry", loadFail: "Stats service not ready. Upgrade the plugin and retry.",
    total: "Tasks", active: "Active", overdue: "Overdue", completion: "Completion",
    dueToday: "Due today", dueNext7: "Due next 7d", newInRange: "New in range", avgCycle: "Avg cycle",
    days: "d", current: "Current", inRange: "In range", ofTotal: "of total", ofActive: "of active",
    trend: "Created / done / due trend", trendNote: "Bucketed by day / week / month",
    created: "Created", done: "Done", due: "Due",
    status: "Status", statusNote: "Current",
    type: "Type × status", typeNote: "Current",
    priority: "Priority", priorityNote: "Current",
    difficulty: "Difficulty", difficultyNote: "Current",
    aging: "Overdue aging", agingNote: "Current overdue",
    overdueList: "Overdue list", overdueNote: "Oldest first",
    tables: "Task tables", tablesNote: "Weighted by active + overdue",
    groups: "Task groups", groupsNote: "First-level groups",
    colName: "Name", colTotal: "Total", colOpen: "Active", colOverdue: "Overdue", colDone: "Done", colRate: "Completion",
    colTitle: "Task", colTarget: "Target", colAge: "Days late", colTable: "Table",
    noOverdue: "No overdue tasks", noData: "No tasks yet. Create one in Tasks and the summary appears here.",
    open: "Active", shutdown: "Closed", restarted: "Restarted",
  },
};

var RANGES = ["7d", "30d", "90d", "365d", "all"];

function TasksStatsView(props) {
  var lang = props.lang === "en" ? "en" : "zh";
  var t = COPY[lang];
  var api = props.api;
  var ch = React.useMemo(function () { return charts.makeCharts("wbt"); }, []);
  var rangePair = React.useState("30d");
  var range = rangePair[0], setRange = rangePair[1];
  var dataPair = React.useState(null);
  var data = dataPair[0], setData = dataPair[1];
  var errPair = React.useState("");
  var err = errPair[0], setErr = errPair[1];
  var loadPair = React.useState(true);
  var loading = loadPair[0], setLoading = loadPair[1];
  var req = React.useRef(0);

  var load = React.useCallback(function (silent) {
    var id = ++req.current;
    if (!silent) setLoading(true);
    return Promise.resolve(api.call("tasks.statsReport", { range: range, top: 10 }))
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
  }, [api, range]);

  React.useEffect(function () { load(false); }, [load]);

  React.useEffect(function () {
    if (!api || typeof api.subscribe !== "function") return undefined;
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
  }, [api, load]);

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
      children.push(h(ch.Card, { key: "status", span: 4, title: t.status, note: t.statusNote },
        h(ch.Donut, {
          data: (b.status || []).map(function (s, i) {
            return { key: s.key, label: s.label, count: s.count, color: i === 1 ? "var(--dsw-alias-text-tertiary,#8f959e)" : ch.colors[i] };
          }),
          total: totals.total, lang: lang, centerLabel: t.total,
          aria: (b.status || []).map(function (s) { return s.label + " " + s.count; }).join("，"),
        })));

      children.push(h(ch.Card, { key: "type", span: 6, title: t.type, note: t.typeNote },
        h(ch.StackedRows, {
          rows: (b.type || []).map(function (x) {
            return { key: x.key, label: x.label, total: x.total, parts: { open: x.open, done: x.done, shutdown: x.shutdown, restarted: x.restarted } };
          }),
          keys: [
            { key: "open", label: t.open, color: ch.colors[0] },
            { key: "done", label: t.done, color: ch.colors[1] },
            { key: "shutdown", label: t.shutdown, color: "var(--dsw-alias-text-tertiary,#8f959e)" },
            { key: "restarted", label: t.restarted, color: ch.colors[2] },
          ],
          lang: lang,
        })));
      children.push(h(ch.Card, { key: "priority", span: 3, title: t.priority, note: t.priorityNote },
        h(ch.Histogram, { data: b.priority || [], lang: lang, color: ch.colors[0] })));
      children.push(h(ch.Card, { key: "difficulty", span: 3, title: t.difficulty, note: t.difficultyNote },
        h(ch.Histogram, { data: b.difficulty || [], lang: lang, color: ch.colors[4] })));

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
    }
    children.push(h(ch.Warnings, { key: "warn", items: data.warnings || [] }));
  }

  return h("div", { className: "wbt-stats" },
    h(ch.RangeSwitch, {
      options: options, value: range, onChange: setRange, onRefresh: function () { load(false); },
      loading: loading, generatedAt: data && data.generatedAt, refreshLabel: t.refresh, timeLabel: t.asOf,
    }),
    err && data ? h(ch.ErrorBar, { message: err, onRetry: function () { load(false); }, retryLabel: t.retry }) : null,
    h("div", { className: "wbt-sgrid" }, children),
  );
}

module.exports = { TasksStatsView: TasksStatsView };
