"use strict";
/**
 * 全局消息悬浮入口：任意页面右下角的常驻按钮。
 *
 * 数据流刻意不自己开 SSE——提示音模块（notify/notifier.cjs）已经订阅
 * `GET /workbench/api/events`，这里用它的 `subscribe()` 共用同一条事件流，
 * 否则会出现双连接与重复声音。计数以服务端为准：
 *   - 初始：message.unreadCount
 *   - message.created：+1，并按 id 去重
 *   - message.read：用事件里的 unread 覆写
 *   - 页面从隐藏转可见：重拉一次，纠正漏事件
 */

var styles = require("./style.cjs");
var buttons = require("./button.cjs");

var DOMAIN = "wb-addon-message";
var BASE = "/workbench/api";
var STYLE_ID = "wb-message-float-style";
var ADDON_ID = "wb-addon-message";
var INBOX_VIEW = "inbox";

function readLang(doc) {
  var attr = doc && doc.documentElement && doc.documentElement.getAttribute("lang");
  return attr && attr.toLowerCase().indexOf("en") === 0 ? "en" : "zh";
}

function injectStyles(doc) {
  if (!doc || !doc.head || doc.getElementById(STYLE_ID)) return;
  var style = doc.createElement("style");
  style.id = STYLE_ID;
  style.textContent = styles().join("");
  doc.head.appendChild(style);
}

function makeCall(fetchImpl) {
  return function call(action, args) {
    return fetchImpl(BASE + "/domains/" + DOMAIN + "/actions/" + action, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(args || {}),
    })
      .then(function (res) { return res.json(); })
      .then(function (body) { return body && body.result !== undefined ? body.result : body; });
  };
}

/**
 * @param {{doc?: Document, win?: Window, fetchImpl?: Function, host?: Object, notifier?: Object}} [options]
 */
function createMount(options) {
  var opts = options || {};
  var doc = opts.doc || (typeof document !== "undefined" ? document : null);
  var win = opts.win || (typeof window !== "undefined" ? window : null);
  var host = opts.host || (win && win.__WB_HOST__) || null;
  var notifier = opts.notifier || null;
  var fetchImpl = opts.fetchImpl || (win && win.fetch ? win.fetch.bind(win) : null);
  var call = fetchImpl ? makeCall(fetchImpl) : null;

  var state = {
    mounted: false,
    root: null,
    btn: null,
    unsubscribe: null,
    seen: new Set(),
    count: 0,
    enabled: true,
    position: "bottom-right",
    onVisible: null,
  };

  function hostOverlay() {
    return doc && doc.querySelector ? doc.querySelector("[data-shell-overlay]") : null;
  }

  // 底部输入区：DSH 的会话输入框固定在主区底部，浮层直接贴底会压在发送按钮上。
  // 找不到就保持贴底，找到就把按钮抬到它上方（高度按实际测量，夹在 48–140px）。
  function liftAboveComposer() {
    if (!state.btn || !doc || typeof doc.querySelector !== "function") return;
    var composer = doc.querySelector("[data-shell-composer], .dsh-composer, [contenteditable=true], .wb-composer");
    if (!composer || typeof composer.getBoundingClientRect !== "function") {
      state.btn.el.removeAttribute("data-lift");
      return;
    }
    var rect = composer.getBoundingClientRect();
    var height = rect && rect.height > 0 ? rect.height : 0;
    if (!height) {
      state.btn.el.removeAttribute("data-lift");
      return;
    }
    var lift = Math.min(Math.max(Math.round(height + 12), 48), 140);
    state.btn.el.setAttribute("data-lift", "1");
    state.btn.el.style.setProperty("--wbm-float-lift", lift + "px");
  }

  function place() {
    if (!state.root || !doc) return;
    var target = hostOverlay() || doc.body;
    if (target && state.root.parentNode !== target) target.appendChild(state.root);
  }

  function applyConfig(values) {
    if (!values) return;
    if (values["float.enabled"] !== undefined) state.enabled = values["float.enabled"] !== false;
    if (values["float.position"]) state.position = values["float.position"];
    if (!state.btn) return;
    state.btn.setPosition(state.position);
    liftAboveComposer();
    state.btn.el.style.display = state.enabled ? "" : "none";
    if (!state.enabled) {
      state.count = 0;
      state.btn.setCount(0);
    }
    place();
  }

  function applyCount(next) {
    state.count = next > 0 ? Math.floor(next) : 0;
    if (state.btn) state.btn.setCount(state.count);
    return state.count;
  }

  function activate() {
    if (host && typeof host.navigateAddon === "function") {
      try {
        if (host.navigateAddon(ADDON_ID, INBOX_VIEW) !== false) return;
      } catch (e) {
        /* 旧宿主可能只接受一个参数，落到下面的提示 */
      }
    }
    if (typeof console !== "undefined" && console.info) {
      console.info("[dsh-workbench-message] 当前宿主不支持跳转到消息收件箱，请在左侧导航打开「消息」");
    }
  }

  function onEvent(event, data) {
    if (!state.btn || !state.mounted) return;
    if (event === "config") {
      applyConfig(data && data.values);
      return;
    }
    if (event === "message.read") {
      // 服务端权威值：标记已读的响应里带着最新未读数。
      if (data && typeof data.unread === "number") applyCount(data.unread);
      return;
    }
    if (event !== "message.created") return;
    var message = data && data.message;
    if (!message || !message.id) return;
    if (state.seen.has(message.id)) return;
    state.seen.add(message.id);
    if (state.seen.size > 500) state.seen.clear();
    applyCount(state.count + 1);
    if (state.btn) state.btn.pulse();
  }

  function refreshCount() {
    if (!call) return Promise.resolve(state.count);
    return call("message.unreadCount", {})
      .then(function (body) {
        var unread = body && typeof body.unread === "number" ? body.unread : null;
        return unread === null ? state.count : applyCount(unread);
      })
      .catch(function () { return state.count; });
  }

  function loadConfig() {
    if (!call) return Promise.resolve(state.enabled);
    return call("message.configGet", {})
      .then(function (body) {
        applyConfig(body && body.values);
        return state.enabled;
      })
      .catch(function () { return state.enabled; });
  }

  function mount() {
    if (state.mounted || !doc) return state;
    injectStyles(doc);

    var root = doc.createElement("div");
    root.className = "wbm-float-root";
    root.setAttribute("data-message-float", "1");

    var btn = buttons.createButton({ doc: doc, lang: readLang(doc), onActivate: activate });
    root.appendChild(btn.el);
    state.root = root;
    state.btn = btn;
    state.mounted = true;
    place();
    liftAboveComposer();

    if (notifier && typeof notifier.subscribe === "function") state.unsubscribe = notifier.subscribe(onEvent);
    if (win && typeof win.addEventListener === "function") {
      state.onVisible = function () {
        if (doc.visibilityState === "visible") refreshCount();
      };
      win.addEventListener("visibilitychange", state.onVisible);
    }

    loadConfig().then(function () {
      // 关闭悬浮入口时不必再拉未读数。
      if (state.enabled) refreshCount();
    });
    return state;
  }

  function destroy() {
    if (state.unsubscribe) state.unsubscribe();
    state.unsubscribe = null;
    if (win && state.onVisible && typeof win.removeEventListener === "function") {
      win.removeEventListener("visibilitychange", state.onVisible);
    }
    state.onVisible = null;
    if (state.btn) state.btn.destroy();
    if (state.root && state.root.parentNode) state.root.parentNode.removeChild(state.root);
    state.btn = null;
    state.root = null;
    state.mounted = false;
  }

  return {
    mount: mount,
    destroy: destroy,
    refreshCount: refreshCount,
    applyConfig: applyConfig,
    readState: function () {
      return {
        mounted: state.mounted,
        count: state.count,
        enabled: state.enabled,
        position: state.position,
        seen: state.seen.size,
      };
    },
  };
}

module.exports = { createMount: createMount, STYLE_ID: STYLE_ID, DOMAIN: DOMAIN };
