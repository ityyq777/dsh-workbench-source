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
  var domainsView = useLoader(React, api, "wb.eventDomains", {}, []);
  var active =
    tab === "events" ? events : tab === "deliveries" ? deliveries : tab === "domains" ? domainsView : subs;

  React.useEffect(function () {
    setFilter("");
    setPage(1);
  }, [tab]);

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

  // 旧宿主的总览只返回出现过的状态键，这里统一兜底成 0，别让空队列把整页读崩。
  var eventCounts = stats.events || {};
  var deliveryCounts = stats.deliveries || {};
  var countOf = function (bucket, key) {
    var n = bucket[key];
    return typeof n === "number" ? n : 0;
  };
  var body = [];
  body.push(
    jsx.jsx("div", { className: "wbq-stats", children: [
      statPill(jsx, t("queue_queued"), countOf(eventCounts, "queued")),
      statPill(jsx, t("queue_dead"), countOf(eventCounts, "dead") + countOf(deliveryCounts, "dead")),
      statPill(jsx, t("queue_pending"), countOf(deliveryCounts, "pending")),
      statPill(jsx, t("queue_done"), countOf(eventCounts, "done")),
      statPill(jsx, t("queue_subscriptions"), typeof stats.subscriptions === "number" ? stats.subscriptions : 0),
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
  if (tab === "domains") {
    var list = (active.state.data && active.state.data.domains) || [];
    body.push(list.length
      ? jsx.jsx("div", { className: "wbq-domains", children: list.map(function (d) {
          var pub = d.publishes || [];
          var lis = d.listens || [];
          return jsx.jsxs("div", { key: d.domain, className: "wbq-domain", children: [
            jsx.jsxs("div", { className: "wbq-domain-head", children: [
              jsx.jsx("b", { children: d.title }),
              jsx.jsx("code", { className: "wbq-muted", children: d.domain }),
              d.error ? jsx.jsx("span", { className: "wbq-status s-dead", children: t("queue_domain_error") }) : null,
            ] }),
            jsx.jsxs("div", { className: "wbq-domain-row", children: [
              jsx.jsx("span", { className: "wbq-domain-label", children: t("queue_domain_publishes") }),
              pub.length
                ? jsx.jsx("div", { className: "wbq-chips", children: pub.map(function (p) {
                    return jsx.jsxs("span", { key: p.type, className: "wbq-chip", title: p.description || "", children: [
                      jsx.jsx("code", { children: p.type }),
                      jsx.jsx("span", { className: "wbq-muted", children: t("queue_sent") + " " + String(p.sent || 0) }),
                    ] });
                  }) })
                : jsx.jsx("span", { className: "wbq-muted", children: t("queue_no_publish") }),
            ] }),
            jsx.jsxs("div", { className: "wbq-domain-row", children: [
              jsx.jsx("span", { className: "wbq-domain-label", children: t("queue_domain_listens") }),
              lis.length
                ? jsx.jsx("div", { className: "wbq-chips", children: lis.map(function (l) {
                    return jsx.jsxs("span", { key: l.type, className: "wbq-chip" + (l.registered ? "" : " off"), title: l.description || "", children: [
                      jsx.jsx("code", { children: l.type }),
                      jsx.jsx("span", { className: "wbq-muted", children: l.registered ? (l.actions || []).join(", ") : t("queue_not_registered") }),
                    ] });
                  }) })
                : jsx.jsx("span", { className: "wbq-muted", children: t("queue_no_listen") }),
            ] }),
          ] }, d.domain);
        }) })
      : jsx.jsx("div", { className: "wbq-empty", children: t("queue_empty") }));
  } else if (tab === "subscriptions") {
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
  var paging = (tab === "events" || tab === "deliveries") && meta.data && meta.data.pages ? meta.data : null;
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

/**
 * 组件外壳：路由分支必须渲染这个组件，而不是直接调用 queuePage()。
 * 直接调用会把页面自己的 hooks 挂到 WorkbenchPage 的 hook 链上，切路由时
 * hook 数量前后不一致，React 抛 #310（Rendered more hooks than during the previous render）。
 */
function QueueView(props) {
  return queuePage(props);
}

module.exports = { queuePage: queuePage, QueueView: QueueView, readResult: readResult };
