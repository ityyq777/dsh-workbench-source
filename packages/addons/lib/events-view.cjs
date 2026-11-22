"use strict";
/**
 * 共享「事件」页视图：展示当前插件**发布**哪些事件、**订阅**哪些事件。
 *
 * 数据来自宿主为每个域自动注册的 `<域>.eventsInfo`（见 packages/shell/src/index.ts）：
 *  - 发布：DomainDef.events.publishes 的声明 + 队列里真实的发出次数/最近状态；
 *  - 订阅：队列登记表 host_event_subscription 的真实记录 + 每条的完成/死信/待投递计数。
 * 所以「订阅」这一栏永远反映运行时事实，插件不需要（也不应该）再声明一遍。
 *
 * 用法（宿主给所有插件自动挂这一页，插件不需要自己 import）：
 *   var createEventsView = require("./events-view.cjs");
 *   var EventsView = createEventsView().EventsView;
 */
var React = require("react");
var h = React.createElement;
var createCommon = require("./client-common.cjs");
var injectStyles = require("./inject-styles.cjs");

var C = createCommon("wbev");

var COPY = {
  zh: {
    head: "事件",
    hint: "运行时数据 · 来自宿主事件队列",
    refresh: "刷新",
    publishTitle: "发布的事件",
    publishHint: "本插件通过 api.events.push 推出，订阅方各自消费",
    subTitle: "订阅的事件",
    subHint: "本插件登记订阅，并由 plugin-only 的消费 action 处理",
    noPublish: "本插件不发布事件",
    noPublishHint: "在 DomainDef.events.publishes 里声明后会出现在这里",
    noSub: "还没有订阅任何事件",
    noSubHint: "在 setup 里调用 api.events.subscribe(type, action) 后会出现在这里",
    sent: function (n) { return "已发 " + n + " 次"; },
    lastAt: "最近",
    never: "还没发过",
    status: "状态",
    consumer: "消费 action",
    done: function (n) { return "成功 " + n; },
    pending: function (n) { return "待投递 " + n; },
    dead: function (n) { return "死信 " + n; },
    lastError: "最近错误",
    loading: "载入中…",
    failed: "读取事件信息失败",
    domain: "域",
  },
  en: {
    head: "Events",
    hint: "Live data from the host event queue",
    refresh: "Refresh",
    publishTitle: "Published events",
    publishHint: "Pushed via api.events.push; each subscriber consumes on its own",
    subTitle: "Subscribed events",
    subHint: "Registered by this addon and handled by a plugin-only action",
    noPublish: "This addon publishes no events",
    noPublishHint: "Declared in DomainDef.events.publishes",
    noSub: "No event subscriptions yet",
    noSubHint: "Call api.events.subscribe(type, action) during setup",
    sent: function (n) { return n + " sent"; },
    lastAt: "Last",
    never: "never sent",
    status: "Status",
    consumer: "Consumer action",
    done: function (n) { return n + " done"; },
    pending: function (n) { return n + " pending"; },
    dead: function (n) { return n + " dead"; },
    lastError: "Last error",
    loading: "Loading…",
    failed: "Failed to load event info",
    domain: "Domain",
  },
};

var STYLES = [
  ".wbev-page{display:flex;flex-direction:column;gap:14px;width:100%}",
  ".wbev-head{display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap}",
  ".wbev-title{font-size:16px;font-weight:680;color:var(--wb-text)}",
  ".wbev-sub{font-size:12px;color:var(--wb-muted);margin-top:2px}",
  ".wbev-head .wbev-spacer{flex:1 1 auto}",
  ".wbev-card{background:var(--wb-card);border:1px solid var(--wb-border);border-radius:10px;padding:12px 14px;display:flex;flex-direction:column;gap:10px}",
  ".wbev-card-head{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}",
  ".wbev-card-title{font-size:13px;font-weight:640;color:var(--wb-text)}",
  ".wbev-card-hint{font-size:12px;color:var(--wb-muted)}",
  ".wbev-row{display:flex;flex-direction:column;gap:4px;padding:8px 0;border-top:1px solid var(--wb-line)}",
  ".wbev-row:first-of-type{border-top:none;padding-top:0}",
  ".wbev-row-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
  ".wbev-type{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:var(--wb-text);background:var(--wb-surface);border:1px solid var(--wb-line);border-radius:6px;padding:1px 6px}",
  ".wbev-desc{font-size:12px;color:var(--wb-muted)}",
  ".wbev-meta{display:flex;gap:10px;flex-wrap:wrap;font-size:12px;color:var(--wb-muted)}",
  ".wbev-ok{color:var(--wb-ok)}",
  ".wbev-warn{color:var(--wb-warn)}",
  ".wbev-danger{color:var(--wb-danger)}",
  ".wbev-empty{font-size:12px;color:var(--wb-muted);padding:6px 0}",
  ".wbev-err{font-size:12px;color:var(--wb-danger)}",
].join("\n");

function createEventsView(options) {
  var opts = options || {};
  injectStyles({ id: "wb-events-view-style", css: STYLES });

  function EventsView(props) {
    var lang = props.lang === "en" ? "en" : "zh";
    var t = COPY[lang];
    var domain = opts.domain || props.addonId;
    var load = C.useLoad(React, props.api, domain + ".eventsInfo", {}, [domain]);
    var data = load.data || { publishes: [], subscriptions: [] };

    function rowOfPublish(item) {
      return h("div", { className: "wbev-row", key: "pub:" + item.type }, [
        h("div", { className: "wbev-row-top" }, [
          h("code", { key: "type", className: "wbev-type" }, item.type),
          h("span", { key: "desc", className: "wbev-desc" }, item.description || ""),
        ]),
        h("div", { className: "wbev-meta" }, [
          h("span", { key: "sent" }, t.sent(item.sent || 0)),
          h("span", { key: "last" }, item.lastAt ? t.lastAt + " · " + C.fmtTime(item.lastAt, lang) : t.never),
          item.lastStatus
            ? h(
                "span",
                {
                  key: "status",
                  className: item.lastStatus === "done" ? "wbev-ok" : item.lastStatus === "dead" ? "wbev-danger" : "wbev-warn",
                },
                item.lastStatus,
              )
            : null,
        ]),
      ]);
    }

    function rowOfSub(item) {
      var dead = Number(item.dead || 0) > 0;
      return h("div", { className: "wbev-row", key: "sub:" + item.type + ":" + item.action }, [
        h("div", { className: "wbev-row-top" }, [h("code", { key: "type", className: "wbev-type" }, item.type)]),
        h("div", { className: "wbev-meta" }, [
          h("span", { key: "label" }, t.consumer + "："),
          h("code", { key: "action", className: "wbev-type" }, item.action),
        ]),
        h("div", { className: "wbev-meta" }, [
          h("span", { key: "done", className: "wbev-ok" }, t.done(item.done || 0)),
          item.pending ? h("span", { key: "pending", className: "wbev-warn" }, t.pending(item.pending)) : null,
          dead ? h("span", { key: "dead", className: "wbev-danger" }, t.dead(item.dead)) : null,
        ]),
        item.lastError ? h("div", { className: "wbev-danger wbev-desc" }, t.lastError + "：" + item.lastError) : null,
      ]);
    }

    function card(title, hint, rows, emptyText, emptyHint, key) {
      return h("div", { key: key, className: "wbev-card" }, [
        h("div", { key: "head", className: "wbev-card-head" }, [
          h("div", { key: "title", className: "wbev-card-title" }, title),
          h("div", { key: "hint", className: "wbev-card-hint" }, hint),
        ]),
        rows.length
          ? rows
          : h("div", { key: "empty", className: "wbev-empty" }, [h("div", { key: "text" }, emptyText), h("div", { key: "hint" }, emptyHint)]),
      ]);
    }

    return h("div", { className: "wbev-page" }, [
      h("div", { key: "head", className: "wbev-head" }, [
        h("div", { key: "titles" }, [
          h("div", { key: "title", className: "wbev-title" }, t.head),
          h("div", { key: "hint", className: "wbev-sub" }, t.hint),
        ]),
        h("div", { key: "spacer", className: "wbev-spacer" }),
        h("div", { key: "refresh" }, C.Btn({ h: h, onClick: load.refresh, title: t.refresh }, t.refresh)),
      ]),
      load.error
        ? h("div", { key: "err", className: "wbev-err" }, t.failed + "：" + load.error)
        : load.loading
          ? h("div", { key: "loading", className: "wbev-empty" }, t.loading)
          : h("div", { key: "body", className: "wbev-page" }, [
              card(t.publishTitle, t.publishHint, (data.publishes || []).map(rowOfPublish), t.noPublish, t.noPublishHint, "publish"),
              card(t.subTitle, t.subHint, (data.subscriptions || []).map(rowOfSub), t.noSub, t.noSubHint, "subscribe"),
            ]),
    ]);
  }

  return { EventsView: EventsView, styles: STYLES };
}

module.exports = createEventsView;
module.exports.createEventsView = createEventsView;
module.exports.styles = STYLES;
