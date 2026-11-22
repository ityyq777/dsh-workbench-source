"use strict";
/**
 * 宿主的「事件队列」一级视图。
 *
 * 队列是宿主平台能力（见 packages/shell/src/infra/event-queue.ts），读/运维接口是
 * wb-shell 域下的 wb.event* 元 action（见 packages/shell/src/actions/host-events.ts）。
 * 这页只做三件事：看事件、看投递与订阅、对失败的投递重投或清理历史。
 * 不提供「手工造事件」：那会让队列变成绕过业务逻辑的旁路。
 */
var PAGE_SIZE = 50;

var STATUS_LABEL = {
  queued: "排队中",
  pending: "待投递",
  running: "执行中",
  done: "已完成",
  dead: "死信",
};

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

function timeText(value) {
  var n = Number(value);
  if (!n) return "—";
  var d = new Date(n);
  if (Number.isNaN(d.getTime())) return "—";
  var pad = function (x) {
    return x < 10 ? "0" + x : String(x);
  };
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
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

function statPill(jsx, label, value) {
  return jsx.jsxs("span", { key: label, className: "wbq-pill", children: [
    jsx.jsx("span", { className: "wbq-pill-label", children: label }),
    jsx.jsx("b", { children: String(value || 0) }),
  ] });
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
  var pageState = React.useState(1);
  var page = pageState[0];
  var setPage = pageState[1];
  var noteState = React.useState("");
  var note = noteState[0];
  var setNote = noteState[1];

  var overview = useLoader(React, api, "wb.eventOverview", {}, []);
  var events = useLoader(React, api, "wb.eventList", { status: filter || undefined, page: page, pageSize: PAGE_SIZE }, [filter, page]);
  var deliveries = useLoader(React, api, "wb.eventDeliveryList", { status: filter || undefined, page: page, pageSize: PAGE_SIZE }, [filter, page]);
  var subs = useLoader(React, api, "wb.eventSubscriptionList", {}, []);
  var active = tab === "events" ? events : tab === "deliveries" ? deliveries : subs;

  React.useEffect(function () {
    setFilter("");
    setPage(1);
  }, [tab]);

  function reload() {
    overview.reload();
    if (tab === "subscriptions") subs.reload();
    else if (tab === "deliveries") deliveries.reload();
    else events.reload();
  }

  function replay(delivery) {
    if (!window.confirm(t("queue_replay_confirm"))) return;
    api
      .post("/domains/wb-shell/actions/wb.eventReplay", { deliveryId: delivery.id })
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
    ["events", t("queue_tab_events")],
    ["deliveries", t("queue_tab_deliveries")],
    ["subscriptions", t("queue_tab_subscriptions")],
  ];
  var filters = tab === "events" ? ["queued", "done", "dead"] : tab === "deliveries" ? ["pending", "running", "done", "dead"] : [];

  var body = [];
  body.push(
    jsx.jsx("div", { className: "wbq-stats", children: [
      statPill(jsx, t("queue_queued"), stats.events.queued),
      statPill(jsx, t("queue_dead"), (stats.events.dead || 0) + (stats.deliveries.dead || 0)),
      statPill(jsx, t("queue_pending"), stats.deliveries.pending),
      statPill(jsx, t("queue_done"), stats.events.done),
      statPill(jsx, t("queue_subscriptions"), stats.subscriptions),
    ] }),
  );
  body.push(
    jsx.jsx("div", { className: "wbq-toolbar", children: [
      jsx.jsx("div", { className: "wbq-tabs", children: tabs.map(function (item) {
        return jsx.jsx(
          "button",
          { key: item[0], type: "button", className: "wb-btn ghost" + (tab === item[0] ? " on" : ""), onClick: function () { setTab(item[0]); } },
          item[1],
        );
      }) }),
      filters.length
        ? jsx.jsx("select", {
            key: "filter",
            className: "wbq-select",
            value: filter,
            onChange: function (e) { setFilter(e.target.value); setPage(1); },
            children: [jsx.jsx("option", { key: "all", value: "", children: t("queue_all_status") })].concat(
              filters.map(function (s) { return jsx.jsx("option", { key: s, value: s, children: statusText(lang, s) }); }),
            ),
          })
        : null,
      jsx.jsx("button", { key: "refresh", type: "button", className: "wb-btn ghost", onClick: reload, children: t("queue_refresh") }),
      tab === "events" || tab === "deliveries"
        ? jsx.jsx("button", { key: "cleanup", type: "button", className: "wb-btn danger", onClick: cleanup, children: t("queue_cleanup") })
        : null,
    ] }),
  );
  if (note) body.push(jsx.jsx("div", { className: "wbq-note", children: note }));
  if (active.state.error) body.push(jsx.jsx("div", { className: "wbq-note err", children: active.state.error }));

  var rows = (active.state.data && active.state.data.items) || [];
  if (tab === "subscriptions") {
    body.push(rows.length
      ? jsx.jsx("div", { className: "wbq-table-wrap", children: jsx.jsxs("table", { className: "wbq-table", children: [
          jsx.jsx("thead", { children: jsx.jsx("tr", { children: [
            jsx.jsx("th", { children: t("queue_domain") }),
            jsx.jsx("th", { children: t("queue_event_type") }),
            jsx.jsx("th", { children: t("queue_action") }),
            jsx.jsx("th", { children: t("queue_created") }),
          ] }) }),
          jsx.jsx("tbody", { children: rows.map(function (r, i) {
            return jsx.jsxs("tr", { children: [
              jsx.jsx("td", { children: r.domain }),
              jsx.jsx("td", { children: jsx.jsx("code", { children: r.type }) }),
              jsx.jsx("td", { children: jsx.jsx("code", { children: r.action }) }),
              jsx.jsx("td", { children: timeText(r.created_at) }),
            ] }, i);
          }) }),
        ] }) })
      : jsx.jsx("div", { className: "wbq-empty", children: t("queue_empty") }));
  } else if (tab === "deliveries") {
    body.push(rows.length
      ? jsx.jsx("div", { className: "wbq-table-wrap", children: jsx.jsxs("table", { className: "wbq-table", children: [
          jsx.jsx("thead", { children: jsx.jsx("tr", { children: [
            jsx.jsx("th", { children: t("queue_event_type") }),
            jsx.jsx("th", { children: t("queue_domain") }),
            jsx.jsx("th", { children: t("queue_action") }),
            jsx.jsx("th", { children: t("queue_status") }),
            jsx.jsx("th", { children: t("queue_attempts") }),
            jsx.jsx("th", { children: t("queue_next_at") }),
            jsx.jsx("th", { children: t("queue_last_error") }),
            jsx.jsx("th", { children: "" }),
          ] }) }),
          jsx.jsx("tbody", { children: rows.map(function (r, i) {
            return jsx.jsxs("tr", { children: [
              jsx.jsx("td", { children: jsx.jsx("code", { children: r.event_type || "—" }) }),
              jsx.jsx("td", { children: r.domain }),
              jsx.jsx("td", { children: jsx.jsx("code", { children: r.action }) }),
              jsx.jsx("td", { children: jsx.jsx("span", { className: "wbq-status s-" + r.status, children: statusText(lang, r.status) }) }),
              jsx.jsx("td", { children: String(r.attempts || 0) }),
              jsx.jsx("td", { children: r.status === "done" ? "—" : timeText(r.next_at) }),
              jsx.jsx("td", { className: "wbq-err", children: r.last_error || "—" }),
              jsx.jsx("td", { children: r.status === "dead" || (r.status === "pending" && r.last_error)
                ? jsx.jsx("button", { type: "button", className: "wb-btn ghost", onClick: function () { replay(r); }, children: t("queue_replay") })
                : null }),
            ] }, i);
          }) }),
        ] }) })
      : jsx.jsx("div", { className: "wbq-empty", children: t("queue_empty") }));
  } else {
    body.push(rows.length
      ? jsx.jsx("div", { className: "wbq-table-wrap", children: jsx.jsxs("table", { className: "wbq-table", children: [
          jsx.jsx("thead", { children: jsx.jsx("tr", { children: [
            jsx.jsx("th", { children: t("queue_event_type") }),
            jsx.jsx("th", { children: t("queue_source") }),
            jsx.jsx("th", { children: t("queue_status") }),
            jsx.jsx("th", { children: t("queue_created") }),
            jsx.jsx("th", { children: t("queue_payload") }),
          ] }) }),
          jsx.jsx("tbody", { children: rows.map(function (r, i) {
            return jsx.jsxs("tr", { children: [
              jsx.jsx("td", { children: jsx.jsx("code", { children: r.type }) }),
              jsx.jsx("td", { children: r.source }),
              jsx.jsx("td", { children: jsx.jsx("span", { className: "wbq-status s-" + r.status, children: statusText(lang, r.status) }) }),
              jsx.jsx("td", { children: timeText(r.created_at) }),
              jsx.jsx("td", { className: "wbq-payload", children: jsx.jsx("code", { children: r.payload || "" }) }),
            ] }, i);
          }) }),
        ] }) })
      : jsx.jsx("div", { className: "wbq-empty", children: t("queue_empty") }));
  }

  var meta = (tab === "subscriptions" ? subs : tab === "deliveries" ? deliveries : events).state;
  var paging = meta.data && meta.data.pages ? meta.data : null;
  if (paging) {
    body.push(jsx.jsx("div", { className: "wbq-pager", children: [
      jsx.jsx("button", { type: "button", className: "wb-btn ghost", disabled: page <= 1, onClick: function () { setPage(page - 1); }, children: t("queue_prev") }),
      jsx.jsx("span", { className: "wbq-muted", children: page + " / " + paging.pages + " · " + paging.total }),
      jsx.jsx("button", { type: "button", className: "wb-btn ghost", disabled: page >= paging.pages, onClick: function () { setPage(page + 1); }, children: t("queue_next") }),
    ] }));
  }
  if (active.state.loading) body.push(jsx.jsx("div", { className: "wbq-muted", children: t("queue_loading") }));

  return jsx.jsxs("div", { className: "wb-root", children: [
    jsx.jsxs("div", { className: "wb-inner wb-wide", children: [
      deps.head(t("tab_queue"), t("queue_desc")) || null,
      jsx.jsx("div", { className: "wbq", children: body }),
    ] }),
  ] });
}

module.exports = { queuePage: queuePage };
