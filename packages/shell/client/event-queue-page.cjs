"use strict";
/**
 * 宿主的「事件队列」一级视图。
 *
 * 队列是宿主平台能力（见 packages/shell/src/infra/event-queue.ts），读/运维接口是
 * wb-shell 域下的 wb.event* 元 action（见 packages/shell/src/actions/host-events.ts）。
 * 这页只做三件事：看事件、看投递与订阅、对失败的投递重投或清理历史。
 * 不提供「手工造事件」：那会让队列变成绕过业务逻辑的旁路。
 *
 * 版式：顶部健康条 + 指标块（排队/待投递/已完成/死信/订阅），中间「类型分布 + 最近事件」
 * 两块速览，下面才是可切换的明细表。所有颜色走主题 token，浅色与深色都要能看。
 */
var PAGE_SIZE = 50;

var STATUS_LABEL = {
  queued: "排队中",
  pending: "待投递",
  running: "执行中",
  done: "已完成",
  dead: "死信",
};

var MODE_LABEL = { broadcast: "广播", targeted: "定向" };

var MODE_LABEL_EN = { broadcast: "broadcast", targeted: "targeted" };

var STATUS_LABEL_EN = {
  queued: "queued",
  pending: "pending",
  running: "running",
  done: "done",
  dead: "dead",
};

function statusText(lang, status) {
  var table = lang === "en" ? STATUS_LABEL_EN : STATUS_LABEL;
  return table[status] || status;
}

function modeText(lang, mode) {
  var table = lang === "en" ? MODE_LABEL_EN : MODE_LABEL;
  return table[mode] || table.broadcast;
}

function modeBadge(jsx, lang, mode) {
  var m = mode === "targeted" ? "targeted" : "broadcast";
  return jsx.jsx("span", { className: "wbq-mode m-" + m, children: modeText(lang, m) });
}

function pad2(x) {
  return x < 10 ? "0" + x : String(x);
}

function timeText(value) {
  var n = Number(value);
  if (!n) return "—";
  var d = new Date(n);
  if (Number.isNaN(d.getTime())) return "—";
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) + " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
}

/** 只要时分秒：自动刷新开着时，用户看的是「这一眼是不是新的」。 */
function clockText(value) {
  var d = new Date(Number(value) || 0);
  if (Number.isNaN(d.getTime())) return "—";
  return pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
}

/** 「3 分钟前」这类相对时间：运维看队列，相对时间比绝对时间更容易判断新旧。 */
function agoText(t, value, now) {
  var ts = Number(value);
  if (!ts) return "—";
  var diff = Math.max(0, Number(now || Date.now()) - ts);
  var minute = 60000;
  var hour = 3600000;
  var day = 86400000;
  if (diff < minute) return t("queue_ago_just");
  if (diff < hour) return t("queue_ago_min").replace("{n}", String(Math.floor(diff / minute)));
  if (diff < day) return t("queue_ago_hour").replace("{n}", String(Math.floor(diff / hour)));
  return t("queue_ago_day").replace("{n}", String(Math.floor(diff / day)));
}

// 宿主的 action 路由回的是 { ok, result, text }，页面必须先取 result 再读字段。
// 直接把整包当数据用，stats.events 就是 undefined，页面会崩在 stats.events.queued 上。
function readResult(res) {
  if (res && res.ok === false) throw new Error(String(res.error || "请求失败"));
  if (res && res.result !== undefined) return res.result;
  return res;
}

function useLoader(React, api, action, args, deps) {
  var state = React.useState({ loading: true, error: "", data: null });
  var value = state[0];
  var set = state[1];
  var tick = React.useState(0);
  var bump = tick[1];
  React.useEffect(function () {
    var alive = true;
    set(function (prev) {
      return { loading: true, error: prev.error, data: prev.data };
    });
    api
      .post("/domains/wb-shell/actions/" + encodeURIComponent(action), args || {})
      .then(readResult)
      .then(function (data) {
        if (alive) set({ loading: false, error: "", data: data });
      })
      .catch(function (e) {
        if (alive) set({ loading: false, error: String((e && e.message) || e), data: null });
      });
    return function () {
      alive = false;
    };
  }, deps.concat([tick[0]]));
  return { state: value, reload: function () { bump(function (n) { return n + 1; }); } };
}

function metricTile(jsx, label, value, tone) {
  return jsx.jsxs("div", { key: label, className: "wbq-metric" + (tone ? " t-" + tone : ""), children: [
    jsx.jsx("span", { className: "wbq-metric-label", children: label }),
    jsx.jsx("b", { className: "wbq-metric-value", children: String(value || 0) }),
  ] });
}

/** 状态徽标：小圆点 + 文案，比纯文字更能在表格里一眼分辨。 */
function statusBadge(jsx, lang, status) {
  return jsx.jsxs("span", { className: "wbq-badge s-" + status, children: [
    jsx.jsx("i", { className: "wbq-badge-dot", "aria-hidden": "true" }),
    statusText(lang, status),
  ] });
}

function typeBars(jsx, t, types) {
  if (!types.length) return jsx.jsx("div", { className: "wbq-hint", children: t("queue_no_types") });
  var max = Math.max.apply(null, types.map(function (x) { return Number(x.count) || 0 })) || 1;
  return jsx.jsx("div", { className: "wbq-bars", children: types.slice(0, 6).map(function (item) {
    var count = Number(item.count) || 0;
    var pct = Math.max(4, Math.round((count / max) * 100));
    return jsx.jsxs("div", { key: item.type, className: "wbq-bar-row", children: [
      jsx.jsx("code", { className: "wbq-bar-name", title: item.type, children: item.type }),
      jsx.jsx("span", { className: "wbq-bar-track", children: jsx.jsx("i", { className: "wbq-bar-fill", style: { width: pct + "%" } }) }),
      jsx.jsx("b", { className: "wbq-bar-count", children: String(count) }),
    ] }, item.type);
  }) });
}

function panel(jsx, title, extra, body) {
  return jsx.jsxs("section", { className: "wbq-panel", children: [
    jsx.jsxs("header", { className: "wbq-panel-head", children: [
      jsx.jsx("b", { children: title }),
      extra ? jsx.jsx("span", { className: "wbq-muted", children: extra }) : null,
    ] }),
    body,
  ] });
}

function tableWrap(jsx, head, rows) {
  return jsx.jsx("div", { className: "wbq-table-wrap", children: jsx.jsxs("table", { className: "wbq-table", children: [
    jsx.jsx("thead", { children: jsx.jsx("tr", { children: head }) }),
    jsx.jsx("tbody", { children: rows }),
  ] }) });
}

function emptyState(jsx, t, hint) {
  return jsx.jsxs("div", { className: "wbq-empty", children: [
    jsx.jsx("span", { className: "wbq-empty-mark", "aria-hidden": "true" }),
    jsx.jsx("b", { children: t("queue_empty") }),
    jsx.jsx("span", { className: "wbq-empty-hint", children: hint || t("queue_empty_hint") }),
  ] });
}

function loadingRows(jsx, t, cols) {
  return jsx.jsx("div", { className: "wbq-loading", role: "status", "aria-label": t("queue_loading"), children: [0, 1, 2].map(function (i) {
    return jsx.jsx("div", { key: i, className: "wbq-loading-row", "aria-hidden": "true", children: [0, 1, 2, Math.max(1, cols - 3)].map(function (c) {
      return jsx.jsx("span", { key: c, className: "wbq-loading-bar" });
    }) });
  }) });
}

function queuePage(deps) {
  var jsx = deps.jsx;
  var React = deps.React;
  var api = deps.api;
  var t = deps.t;
  var lang = deps.lang;

  var tabState = React.useState("events");
  var tab = tabState[0];
  var setTab = tabState[1];
  var filterState = React.useState("");
  var filter = filterState[0];
  var setFilter = filterState[1];
  // 状态与投递方式是两维过滤：广播/定向是正交选项，不能和状态挤在一个枚举里。
  var modeState = React.useState("");
  var modeFilter = modeState[0];
  var setModeFilter = modeState[1];
  var pageState = React.useState(1);
  var page = pageState[0];
  var setPage = pageState[1];
  var noteState = React.useState("");
  var note = noteState[0];
  var setNote = noteState[1];
  var autoState = React.useState(false);
  var auto = autoState[0];
  var setAuto = autoState[1];
  var clockState = React.useState(0);
  var updatedAt = clockState[0];
  var setUpdatedAt = clockState[1];

  var overview = useLoader(React, api, "wb.eventOverview", {}, []);
  var events = useLoader(React, api, "wb.eventList", { status: filter || undefined, mode: modeFilter || undefined, page: page, pageSize: PAGE_SIZE }, [filter, modeFilter, page]);
  var deliveries = useLoader(React, api, "wb.eventDeliveryList", { status: filter || undefined, mode: modeFilter || undefined, page: page, pageSize: PAGE_SIZE }, [filter, modeFilter, page]);
  var subs = useLoader(React, api, "wb.eventSubscriptionList", {}, []);
  var domainsView = useLoader(React, api, "wb.eventDomains", {}, []);
  var active =
    tab === "events" ? events : tab === "deliveries" ? deliveries : tab === "domains" ? domainsView : subs;

  React.useEffect(function () {
    setFilter("");
    setModeFilter("");
    setPage(1);
  }, [tab]);

  // 队列是活的：运维盯着排障时希望它自己动，而不是每看一次点一次刷新。
  // 默认关闭，避免无谓轮询；开启后每 5 秒重取总览与当前页签。
  React.useEffect(function () {
    if (!auto) return undefined;
    var timer = setInterval(function () {
      overview.reload();
      active.reload();
    }, 5000);
    return function () {
      clearInterval(timer);
    };
  }, [auto, tab]);

  React.useEffect(function () {
    if (!active.state.loading && !active.state.error) setUpdatedAt(Date.now());
  }, [active.state.loading, active.state.error]);

  function reload() {
    overview.reload();
    if (tab === "subscriptions") subs.reload();
    else if (tab === "deliveries") deliveries.reload();
    else if (tab === "domains") domainsView.reload();
    else events.reload();
  }

  function replay(delivery) {
    if (!window.confirm(t("queue_replay_confirm"))) return;
    api
      .post("/domains/wb-shell/actions/wb.eventReplay", { deliveryId: delivery.id })
      .then(readResult)
      .then(function () {
        setNote(t("queue_replay_ok"));
        reload();
      })
      .catch(function (e) {
        setNote(String((e && e.message) || e));
      });
  }

  function cleanup() {
    if (!window.confirm(t("queue_cleanup_confirm"))) return;
    api
      .post("/domains/wb-shell/actions/wb.eventCleanup", { olderThanDays: 7 })
      .then(readResult)
      .then(function (r) {
        setNote(t("queue_cleanup_ok") + " " + String((r && r.deleted) || 0));
        reload();
      })
      .catch(function (e) {
        setNote(String((e && e.message) || e));
      });
  }

  var stats = overview.state.data || { events: {}, deliveries: {}, subscriptions: 0 };
  var tabs = [
    ["domains", t("queue_tab_domains")],
    ["events", t("queue_tab_events")],
    ["deliveries", t("queue_tab_deliveries")],
    ["subscriptions", t("queue_tab_subscriptions")],
  ];
  var filters = tab === "events" ? ["queued", "done", "dead"] : tab === "deliveries" ? ["pending", "running", "done", "dead"] : [];
  var modes = tab === "events" || tab === "deliveries" ? ["", "broadcast", "targeted"] : [];

  // 旧宿主的总览只返回出现过的状态键，这里统一兜底成 0，别让空队列把整页读崩。
  var eventCounts = stats.events || {};
  var deliveryCounts = stats.deliveries || {};
  var countOf = function (bucket, key) {
    var n = bucket[key];
    return typeof n === "number" ? n : 0;
  };
  var queued = countOf(eventCounts, "queued");
  var pending = countOf(deliveryCounts, "pending") + countOf(deliveryCounts, "running");
  var done = countOf(eventCounts, "done");
  var dead = countOf(eventCounts, "dead") + countOf(deliveryCounts, "dead");
  var subscriptions = typeof stats.subscriptions === "number" ? stats.subscriptions : 0;

  var types = Array.isArray(stats.types) ? stats.types : [];
  var typeTotal = types.reduce(function (sum, item) { return sum + (Number(item.count) || 0); }, 0);
  var health = dead > 0 ? "dead" : queued + pending > 0 ? "busy" : "idle";
  var healthText = health === "dead" ? t("queue_health_dead") : health === "busy" ? t("queue_health_busy") : t("queue_health_idle");
  var healthHint = health === "dead" ? t("queue_health_dead_hint") : health === "busy" ? t("queue_health_busy_hint") : t("queue_health_idle_hint");

  var body = [];

  // 1. 健康条 + 指标块。
  body.push(
    jsx.jsxs("section", { className: "wbq-hero", children: [
      jsx.jsxs("div", { className: "wbq-hero-top", children: [
        jsx.jsxs("div", { className: "wbq-health", children: [
          jsx.jsx("span", { className: "wbq-dot h-" + health, "aria-hidden": "true" }),
          jsx.jsxs("div", { className: "wbq-health-text", children: [
            jsx.jsx("b", { children: healthText }),
            jsx.jsx("span", { className: "wbq-muted", children: healthHint }),
          ] }),
        ] }),
        jsx.jsxs("div", { className: "wbq-hero-actions", children: [
          updatedAt
            ? jsx.jsx("span", { className: "wbq-updated", children: t("queue_updated_at").replace("{t}", clockText(updatedAt)) })
            : null,
          jsx.jsx("button", {
            type: "button",
            className: "wbq-filter" + (auto ? " on" : ""),
            "aria-pressed": auto,
            onClick: function () { setAuto(!auto); },
            children: t("queue_auto"),
          }),
          jsx.jsx("button", { type: "button", className: "wb-btn ghost", onClick: reload, children: t("queue_refresh") }),
          tab === "events" || tab === "deliveries"
            ? jsx.jsx("button", { type: "button", className: "wb-btn danger", onClick: cleanup, children: t("queue_cleanup") })
            : null,
        ] }),
      ] }),
      jsx.jsxs("div", { className: "wbq-stats", children: [
        metricTile(jsx, t("queue_queued"), queued, queued ? "warn" : ""),
        metricTile(jsx, t("queue_pending"), pending, pending ? "warn" : ""),
        metricTile(jsx, t("queue_done"), done, "ok"),
        metricTile(jsx, t("queue_dead"), dead, dead ? "danger" : ""),
        metricTile(jsx, t("queue_subscriptions"), subscriptions, ""),
      ] }),
    ] }),
  );

  // 2. 速览：类型分布 + 最近事件。
  var recent = ((events.state.data && events.state.data.items) || []).slice(0, 4);
  var now = Date.now();
  body.push(
    jsx.jsxs("div", { className: "wbq-insight", children: [
      panel(jsx, t("queue_types"), typeTotal ? t("queue_total_events").replace("{n}", String(typeTotal)) : "", typeBars(jsx, t, types)),
      panel(
        jsx,
        t("queue_recent"),
        recent.length ? t("queue_total_events").replace("{n}", String(recent.length)) : "",
        recent.length
          ? jsx.jsx("ul", { className: "wbq-recent", children: recent.map(function (r, i) {
              return jsx.jsxs("li", { key: i, className: "wbq-recent-item", children: [
                jsx.jsx("code", { className: "wbq-recent-type", title: r.type, children: r.type }),
                statusBadge(jsx, lang, r.status),
                jsx.jsx("time", { className: "wbq-muted", title: timeText(r.created_at), children: agoText(t, r.created_at, now) }),
              ] });
            }) })
          : jsx.jsx("div", { className: "wbq-hint", children: t("queue_empty") }),
      ),
    ] }),
  );

  // 3. 工具栏：页签 + 状态过滤（用分段小按钮，比下拉更容易扫）。
  body.push(
    jsx.jsxs("div", { className: "wbq-toolbar", children: [
      jsx.jsx("div", { className: "wbq-tabs", role: "tablist", children: tabs.map(function (item) {
        return jsx.jsx("button", {
          key: item[0],
          type: "button",
          role: "tab",
          "aria-selected": tab === item[0],
          className: "wbq-tab" + (tab === item[0] ? " on" : ""),
          onClick: function () { setTab(item[0]); },
          children: item[1],
        });
      }) }),
      filters.length
        ? jsx.jsx("div", { className: "wbq-filters", children: [""].concat(filters).map(function (s) {
            var label = s ? statusText(lang, s) : t("queue_all_status");
            var on = filter === s;
            return jsx.jsx("button", {
              key: s || "all",
              type: "button",
              className: "wbq-filter" + (on ? " on" : "") + (s ? " s-" + s : ""),
              "aria-pressed": on,
              onClick: function () { setFilter(s); setPage(1); },
              children: label,
            });
          }) })
        : null,
      modes.length
        ? jsx.jsx("div", { className: "wbq-filters wbq-mode-filters", children: modes.map(function (m) {
            var on = modeFilter === m;
            return jsx.jsx("button", {
              key: m || "all",
              type: "button",
              className: "wbq-filter kw" + (on ? " on" : ""),
              "aria-pressed": on,
              onClick: function () { setModeFilter(m); setPage(1); },
              children: m ? modeText(lang, m) : t("queue_all_modes"),
            });
          }) })
        : null,
    ] }),
  );
  if (note) body.push(jsx.jsx("div", { className: "wbq-note", role: "status", children: note }));
  if (active.state.error) body.push(jsx.jsx("div", { className: "wbq-note err", role: "alert", children: active.state.error }));

  var rows = (active.state.data && active.state.data.items) || [];
  var showing = active.state.loading && !rows.length;

  if (tab === "domains") {
    var list = (active.state.data && active.state.data.domains) || [];
    if (showing) body.push(loadingRows(jsx, t, 2));
    else body.push(list.length
      ? jsx.jsx("div", { className: "wbq-domains", children: list.map(function (d) {
          var pub = d.publishes || [];
          var recv = d.receives || [];
          var lis = d.listens || [];
          return jsx.jsxs("article", { key: d.domain, className: "wbq-domain" + (d.error ? " has-error" : ""), children: [
            jsx.jsxs("header", { className: "wbq-domain-head", children: [
              jsx.jsx("b", { className: "wbq-domain-title", children: d.title }),
              jsx.jsx("code", { className: "wbq-domain-id", children: d.domain }),
              d.error ? jsx.jsx("span", { className: "wbq-badge s-dead", children: t("queue_domain_error") }) : null,
            ] }),
            jsx.jsxs("div", { className: "wbq-domain-row", children: [
              jsx.jsx("span", { className: "wbq-domain-label", children: t("queue_domain_publishes") }),
              pub.length
                ? jsx.jsx("div", { className: "wbq-chips", children: pub.map(function (p) {
                    return jsx.jsxs("span", { key: p.type, className: "wbq-chip", title: p.description || "", children: [
                      jsx.jsx("code", { children: p.type }),
                      modeBadge(jsx, lang, p.mode),
                      p.mode === "targeted" && (p.targets || []).length
                        ? jsx.jsx("em", { className: "wbq-chip-meta", children: (p.targets || []).join(", ") })
                        : null,
                      jsx.jsx("em", { className: "wbq-chip-meta", children: t("queue_sent") + " " + String(p.sent || 0) }),
                    ] });
                  }) })
                : jsx.jsx("span", { className: "wbq-hint", children: t("queue_no_publish") }),
            ] }),
            jsx.jsxs("div", { className: "wbq-domain-row", children: [
              jsx.jsx("span", { className: "wbq-domain-label", children: t("queue_domain_receives") }),
              recv.length
                ? jsx.jsx("div", { className: "wbq-chips", children: recv.map(function (r) {
                    return jsx.jsxs("span", { key: r.type + "@" + r.from, className: "wbq-chip", children: [
                      jsx.jsx("code", { children: r.type }),
                      jsx.jsx("em", { className: "wbq-chip-meta", children: r.from + " · " + String(r.delivered || 0) }),
                    ] });
                  }) })
                : jsx.jsx("span", { className: "wbq-hint", children: t("queue_no_receive") }),
            ] }),
            jsx.jsxs("div", { className: "wbq-domain-row", children: [
              jsx.jsx("span", { className: "wbq-domain-label", children: t("queue_domain_listens") }),
              lis.length
                ? jsx.jsx("div", { className: "wbq-chips", children: lis.map(function (l) {
                    return jsx.jsxs("span", { key: l.type, className: "wbq-chip" + (l.registered ? "" : " off"), title: l.description || "", children: [
                      jsx.jsx("code", { children: l.type }),
                      jsx.jsx("em", { className: "wbq-chip-meta", children: l.registered ? (l.actions || []).join(", ") : t("queue_not_registered") }),
                    ] });
                  }) })
                : jsx.jsx("span", { className: "wbq-hint", children: t("queue_no_listen") }),
            ] }),
          ] }, d.domain);
        }) })
      : emptyState(jsx, t, t("queue_empty_domains")));
  } else if (tab === "subscriptions") {
    if (showing) body.push(loadingRows(jsx, t, 4));
    else body.push(rows.length
      ? tableWrap(jsx, [
          jsx.jsx("th", { key: "d", children: t("queue_domain") }),
          jsx.jsx("th", { key: "t", children: t("queue_event_type") }),
          jsx.jsx("th", { key: "a", children: t("queue_action") }),
          jsx.jsx("th", { key: "c", children: t("queue_created") }),
        ], rows.map(function (r, i) {
          return jsx.jsxs("tr", { children: [
            jsx.jsx("td", { className: "wbq-cell-strong", children: r.domain }),
            jsx.jsx("td", { children: jsx.jsx("code", { children: r.type }) }),
            jsx.jsx("td", { children: jsx.jsx("code", { children: r.action }) }),
            jsx.jsx("td", { className: "wbq-cell-time", title: timeText(r.created_at), children: timeText(r.created_at) }),
          ] }, i);
        }))
      : emptyState(jsx, t, t("queue_empty_subs")));
  } else if (tab === "deliveries") {
    if (showing) body.push(loadingRows(jsx, t, 8));
    else body.push(rows.length
      ? tableWrap(jsx, [
          jsx.jsx("th", { key: "t", children: t("queue_event_type") }),
          jsx.jsx("th", { key: "m", children: t("queue_mode") }),
          jsx.jsx("th", { key: "d", children: t("queue_domain") }),
          jsx.jsx("th", { key: "a", children: t("queue_action") }),
          jsx.jsx("th", { key: "s", children: t("queue_status") }),
          jsx.jsx("th", { key: "n", children: t("queue_attempts") }),
          jsx.jsx("th", { key: "x", children: t("queue_next_at") }),
          jsx.jsx("th", { key: "e", children: t("queue_last_error") }),
          jsx.jsx("th", { key: "o", children: "" }),
        ], rows.map(function (r, i) {
          return jsx.jsxs("tr", { className: r.status === "dead" ? "is-dead" : "", children: [
            jsx.jsx("td", { children: jsx.jsx("code", { children: r.event_type || "—" }) }),
            jsx.jsx("td", { children: modeBadge(jsx, lang, r.delivery_mode) }),
            jsx.jsx("td", { className: "wbq-cell-strong", children: r.domain }),
            jsx.jsx("td", { children: jsx.jsx("code", { children: r.action }) }),
            jsx.jsx("td", { children: statusBadge(jsx, lang, r.status) }),
            jsx.jsx("td", { className: "wbq-cell-num", children: String(r.attempts || 0) }),
            jsx.jsx("td", { className: "wbq-cell-time", children: r.status === "done" ? "—" : timeText(r.next_at) }),
            jsx.jsx("td", { className: "wbq-err", children: r.last_error || "—" }),
            jsx.jsx("td", { className: "wbq-cell-action", children: r.status === "dead" || (r.status === "pending" && r.last_error)
              ? jsx.jsx("button", { type: "button", className: "wb-btn ghost wbq-replay", onClick: function () { replay(r); }, children: t("queue_replay") })
              : null }),
          ] }, i);
        }))
      : emptyState(jsx, t, t("queue_empty_deliveries")));
  } else {
    if (showing) body.push(loadingRows(jsx, t, 5));
    else body.push(rows.length
      ? tableWrap(jsx, [
          jsx.jsx("th", { key: "t", children: t("queue_event_type") }),
          jsx.jsx("th", { key: "s", children: t("queue_source") }),
          jsx.jsx("th", { key: "m", children: t("queue_mode") }),
          jsx.jsx("th", { key: "st", children: t("queue_status") }),
          jsx.jsx("th", { key: "c", children: t("queue_created") }),
          jsx.jsx("th", { key: "p", children: t("queue_payload") }),
        ], rows.map(function (r, i) {
          return jsx.jsxs("tr", { children: [
            jsx.jsx("td", { children: jsx.jsx("code", { children: r.type }) }),
            jsx.jsx("td", { className: "wbq-cell-strong", children: r.source }),
            jsx.jsx("td", { children: modeBadge(jsx, lang, r.mode) }),
            jsx.jsx("td", { children: statusBadge(jsx, lang, r.status) }),
            jsx.jsx("td", { className: "wbq-cell-time", title: timeText(r.created_at), children: agoText(t, r.created_at, now) }),
            jsx.jsx("td", { className: "wbq-payload", children: jsx.jsx("code", { title: r.payload || "", children: r.payload || "—" }) }),
          ] }, i);
        }))
      : emptyState(jsx, t, t("queue_empty_events")));
  }

  var meta = (tab === "subscriptions" ? subs : tab === "deliveries" ? deliveries : events).state;
  var paging = (tab === "events" || tab === "deliveries") && meta.data && meta.data.pages ? meta.data : null;
  if (paging) {
    body.push(jsx.jsxs("div", { className: "wbq-pager", children: [
      jsx.jsx("button", { type: "button", className: "wb-btn ghost", disabled: page <= 1, onClick: function () { setPage(page - 1); }, children: t("queue_prev") }),
      jsx.jsx("span", { className: "wbq-muted", children: page + " / " + paging.pages + " · " + paging.total }),
      jsx.jsx("button", { type: "button", className: "wb-btn ghost", disabled: page >= paging.pages, onClick: function () { setPage(page + 1); }, children: t("queue_next") }),
    ] }));
  }

  return jsx.jsxs("div", { className: "wb-root", children: [
    jsx.jsxs("div", { className: "wb-inner wb-wide", children: [
      deps.head(t("tab_queue"), t("queue_desc")) || null,
      jsx.jsx("div", { className: "wbq", children: body }),
    ] }),
  ] });
}

/**
 * 组件外壳：路由分支必须渲染这个组件，而不是直接调用 queuePage()。
 * 直接调用会把页面自己的 hooks 挂到 WorkbenchPage 的 hook 链上，切路由时
 * hook 数量前后不一致，React 抛 #310（Rendered more hooks than during the previous render）。
 */
function QueueView(props) {
  return queuePage(props);
}

module.exports = { queuePage: queuePage, QueueView: QueueView, readResult: readResult, agoText: agoText, clockText: clockText, statusText: statusText };
