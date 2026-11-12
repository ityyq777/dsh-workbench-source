// 宿主客户端源码；既有 esbuild 链生成 client.js 原生单文件。
"use strict";
var react = require("react");
var jsx = require("react/jsx-runtime");
var h = react.createElement;
var NS = "workbench";

var LOCALE = require("./locale.cjs");

var CSS = require("./styles.cjs");

// ── 子插件宿主桥（必须在任何 addon client.js 之前就位）──
var registry = new Map();     // addonId -> AddonClientModule
var listeners = new Set();    // 子插件事件订阅者
var apiCache = new Map();
var addonState = { addons: [], loaded: false, shellVersion: "" };
var storeListeners = new Set();
var cloudStatusListeners = new Set();
var recordModes = {};         // sessionId -> enabled
var recordListeners = new Set();
var stream = null;
var lastAddonError = null;

function setRecordMode(sessionId, enabled) {
  if (!sessionId) return;
  recordModes[sessionId] = !!enabled;
  recordListeners.forEach(function (fn) { try { fn(sessionId, !!enabled); } catch (e) { console.error(e); } });
}

function notifyStore() {
  storeListeners.forEach(function (fn) { try { fn(); } catch (e) { console.error(e); } });
}
function notifyCloudStatus() {
  cloudStatusListeners.forEach(function (fn) { try { fn(); } catch (e) { console.error(e); } });
}
function broadcast(payload) {
  listeners.forEach(function (fn) { try { fn(payload); } catch (e) { console.error(e); } });
}
function apiFor(id) {
  var cached = apiCache.get(id);
  if (cached) return cached;
  var api = {
    call: function (action, args) {
      // 跨插件调用：action 带域前缀（如 tags.dataTables 由任务域的数据页调用）时路由到目标域，
      // 否则一律按当前插件域处理，避免把 tags.* 发到 tasks 域的路径上（会 404）。
      var targetId = id;
      var name = String(action || "");
      var dot = name.indexOf(".");
      if (dot > 0) {
        var hinted = "wb-addon-" + name.slice(0, dot);
        if (hinted !== id && registry.has(hinted)) targetId = hinted;
      }
      return fetch("/workbench/api/domains/" + encodeURIComponent(targetId) + "/actions/" + encodeURIComponent(action), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(args || {}),
      }).then(function (r) { return r.json(); })
        .catch(function (e) { return { ok: false, error: String((e && e.message) || e) }; });
    },
    // 只读 schema 快照：宿主 /workbench/api/schema 与 actions.list(detail=true) 同源，
    // 供工作台 Action 页渲染运行时注册；不走 action 执行链路，也不会产生审计记录。
    schema: function (domain) {
      var q = domain ? "?domain=" + encodeURIComponent(domain) : "";
      return fetch("/workbench/api/schema" + q)
        .then(function (r) { return r.json(); })
        .catch(function (e) { return { ok: false, error: String((e && e.message) || e) }; });
    },
    subscribe: function (fn) { listeners.add(fn); return function () { listeners.delete(fn); }; },
  };
  apiCache.set(id, api);
  return api;
}
function registerAddon(mod) {
  if (!mod || typeof mod.id !== "string" || !Array.isArray(mod.views)) {
    console.error("[dsh-workbench] registerAddon 参数不合法", mod);
    return;
  }
  registry.set(mod.id, mod);
  notifyStore();
}
function setAddons(list) {
  addonState.addons = Array.isArray(list) ? list : [];
  addonState.loaded = true;
  var alive = {};
  addonState.addons.forEach(function (a) { alive[a.id] = a; });
  registry.forEach(function (_m, id) { if (!alive[id]) registry.delete(id); });
  notifyStore();
}
function refreshAddons() {
  return fetch("/workbench/api/domains")
    .then(function (r) { return r.json(); })
    .then(function (j) { if (j && j.domains) { addonState.shellVersion = j.shellVersion || addonState.shellVersion; setAddons(j.domains); } return j; })
    .catch(function (e) { console.warn("[dsh-workbench] 读取业务插件失败", e); return null; });
}
function ensureStream() {
  if (stream) return;
  stream = new EventSource("/workbench/api/events");
  stream.addEventListener("domains-changed", function (e) {
    try { setAddons(JSON.parse(e.data)); } catch (err) { console.warn(err); }
  });
  stream.addEventListener("domain-event", function (e) {
    try { broadcast(JSON.parse(e.data)); } catch (err) { console.warn(err); }
  });
  stream.addEventListener("record-mode", function (e) {
    try {
      var payload = JSON.parse(e.data);
      if (payload && payload.sessionId) setRecordMode(payload.sessionId, payload.enabled);
    } catch (err) { console.warn(err); }
  });
  stream.addEventListener("sync-done", notifyCloudStatus);
  stream.addEventListener("account-changed", notifyCloudStatus);
}
function useAddonStore() {
  var st = react.useState(0);
  var bump = st[1];
  react.useEffect(function () {
    ensureStream();
    var fn = function () { bump(function (x) { return x + 1; }); };
    storeListeners.add(fn);
    if (!addonState.loaded) refreshAddons();
    return function () { storeListeners.delete(fn); };
  }, []);
  return addonState;
}

window.__WB_HOST__ = {
  react: react,
  jsx: jsx,
  h: h,
  registerAddon: registerAddon,
  get addons() { return addonState.addons; },
  error: function () { return lastAddonError; },
};

function useApi() {
  var base = "/workbench/api";
  return react.useMemo(function () {
    return {
      get: function (p) { return fetch(base + p).then(function (r) { return r.json(); }); },
      post: function (p, b) { return fetch(base + p, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b || {}) }).then(function (r) { return r.json(); }); },
      del: function (p) { return fetch(base + p, { method: "DELETE" }).then(function (r) { return r.json(); }); },
    };
  }, []);
}
function useCloudStatus() {
  var api = useApi();
  var st = react.useState(null);
  var status = st[0]; var setStatus = st[1];
  react.useEffect(function () {
    var alive = true;
    function load() {
      api.get("/sync/status").then(function (r) {
        if (alive && r && r.ok) setStatus(r);
      }).catch(function () { /* 网络异常时保留上一次已知状态 */ });
    }
    load();
    var timer = setInterval(load, 15000);
    function onVisible() {
      if (typeof document !== "undefined" && document.visibilityState === "visible") load();
    }
    if (typeof document !== "undefined") document.addEventListener("visibilitychange", onVisible);
    cloudStatusListeners.add(load);
    return function () {
      alive = false;
      clearInterval(timer);
      if (typeof document !== "undefined") document.removeEventListener("visibilitychange", onVisible);
      cloudStatusListeners.delete(load);
    };
  }, [api]);
  return status;
}

function cloudView(status, t) {
  if (!status) return { kind: "local", label: t("cloud_checking"), hint: t("cloud_checking_hint") };
  var failed = Array.isArray(status.failed_tables) ? status.failed_tables : [];
  if (!status.logged_in) return { kind: "local", label: t("cloud_local"), hint: t("cloud_local_hint") };
  if (status.running) return { kind: "syncing", label: t("cloud_syncing"), hint: t("cloud_syncing_hint") };
  if (status.cloud && status.cloud.reachable === false) return { kind: "off", label: t("cloud_offline"), hint: t("cloud_offline_hint") };
  if (!status.last_sync_at) return { kind: "warn", label: t("cloud_never"), hint: t("cloud_never_hint") };
  if (status.last_sync_ok === false || failed.length) return { kind: "warn", label: t("cloud_sync_failed"), hint: t("cloud_sync_failed_hint") };
  return { kind: "on", label: t("cloud_online"), hint: t("cloud_online_hint") };
}

function cloudTitle(view, status, t) {
  var parts = [view.hint];
  if (status && status.logged_in) {
    parts.push(t("sync_last") + ": " + (status.last_sync_at ? new Date(status.last_sync_at).toLocaleString() : t("sync_never")));
    if (status.conflicts) parts.push(t("sync_conflicts") + ": " + status.conflicts);
    var failed = Array.isArray(status.failed_tables) ? status.failed_tables : [];
    if (failed.length) parts.push(t("sync_failed_tables") + ": " + failed.join(", "));
    if (status.last_sync_error) parts.push(status.last_sync_error);
    if (status.cloud && status.cloud.error) parts.push(status.cloud.error);
  }
  return parts.join(" · ");
}

function CloudStatusPill(props) {
  var t = props.t;
  var status = useCloudStatus();
  var view = cloudView(status, t);
  var title = cloudTitle(view, status, t);
  return jsx.jsxs("button", {
    type: "button",
    className: "wb-cloud " + view.kind,
    onClick: props.onOpen,
    title: title,
    "aria-label": t("cloud_status") + ": " + view.label + " — " + view.hint + " · " + t("cloud_open"),
    "data-cloud-state": view.kind,
    children: [
      jsx.jsx("span", { className: "wb-cloud-dot" }),
      jsx.jsx("span", { className: "wb-cloud-label", children: view.label }),
    ],
  });
}

function pickTitle(title, lang) {
  if (!title) return "";
  if (typeof title === "string") return title;
  return title[lang] || title.zh || title.en || "";
}
function currentLang() {
  var raw = (document && document.documentElement && document.documentElement.lang) || (typeof navigator !== "undefined" && navigator.language) || "zh";
  return String(raw).toLowerCase().indexOf("zh") === 0 ? "zh" : "en";
}

var systemTabs = require("./system-tabs.cjs")(react, jsx, useApi);
var AccountTab = systemTabs.AccountTab;
var BackupTab = systemTabs.BackupTab;
var AuditTab = systemTabs.AuditTab;
var ViewTabs = require("./view-tabs.cjs")(react, pickTitle);
var ViewOutlet = require("./view-outlet.cjs");

function ensureCss() {
  if (typeof document === "undefined") return;
  if (document.getElementById("wb-css")) return;
  var s = document.createElement("style");
  s.id = "wb-css";
  s.setAttribute("data-plugin-css", NS);
  s.textContent = CSS;
  document.head.appendChild(s);
}

function SearchPanel(props) {
  var api = props.api;
  var st = react.useState("");
  var rs = react.useState([]);
  var bs = react.useState(false);
  var es = react.useState("");
  var os = react.useState(false);
  var inputRef = react.useRef(null);
  var q = st[0];
  var results = rs[0];
  var loading = bs[0];
  var error = es[0];
  var open = os[0];
  var t = props.t;

  react.useEffect(function () {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && String(e.key).toLowerCase() === "k") {
        e.preventDefault();
        os[1](true);
        setTimeout(function () { if (inputRef.current) inputRef.current.focus(); }, 0);
      }
      if (e.key === "Escape") os[1](false);
    }
    document.addEventListener("keydown", onKey);
    return function () { document.removeEventListener("keydown", onKey); };
  }, []);

  react.useEffect(function () {
    var text = String(q || "").trim();
    if (!text) { rs[1]([]); es[1](""); return; }
    var alive = true;
    bs[1](true); es[1]("");
    var timer = setTimeout(function () {
      api.post("/domains/wb-shell/actions/search.query", { q: text, limit: 20 })
        .then(function (j) {
          if (!alive) return;
          var data = (j && j.result) || j || {};
          rs[1](data.items || []);
          if (data.partial) es[1](t("search_partial") + ": " + (data.failed || []).join("、"));
        })
        .catch(function (e) { if (alive) es[1](String((e && e.message) || e)); })
        .then(function () { if (alive) bs[1](false); });
    }, 220);
    return function () { alive = false; clearTimeout(timer); };
  }, [q]);

  function pick(hit) {
    os[1](false);
    st[1]("");
    if (hit.url) {
      window.open(hit.url, "_blank", "noopener,noreferrer");
      return;
    }
    var addon = (props.addons || []).filter(function (a) { return a.id === hit.domainId; })[0];
    if (addon) props.go("addon:" + addon.id + ":" + (hit.view || ""));
  }

  return jsx.jsxs("div", { className: "wb-search-wrap", children: [
    jsx.jsxs("div", { className: "wb-search-bar", children: [
      jsx.jsx("span", { className: "wb-search-icon", children: "⌕" }),
      jsx.jsx("input", {
        ref: inputRef,
        className: "wb-search-input",
        value: q,
        placeholder: t("search_placeholder"),
        onFocus: function () { os[1](true); },
        onChange: function (e) { st[1](e.target.value); os[1](true); },
        onKeyDown: function (e) { if (e.key === "Enter" && results.length) pick(results[0]); },
      }),
      jsx.jsx("kbd", { className: "wb-search-kbd", children: "⌘K" }),
    ] }),
    open && String(q || "").trim()
      ? jsx.jsxs("div", { className: "wb-search-panel", children: [
        loading ? jsx.jsx("div", { className: "wb-search-empty", children: t("searching") }) : null,
        error ? jsx.jsx("div", { className: "wb-search-empty", children: error }) : null,
        !loading && !error && results.length === 0 ? jsx.jsx("div", { className: "wb-search-empty", children: t("search_none") }) : null,
        results.map(function (hit) {
          var addon = (props.addons || []).filter(function (a) { return a.id === hit.domainId; })[0];
          var title = addon ? (addon.title || addon.id) : hit.domainId;
          return jsx.jsxs("button", { type: "button", className: "wb-search-hit", onClick: function () { pick(hit); }, children: [
            jsx.jsx("span", { className: "wb-search-domain", children: title }),
            jsx.jsxs("span", { className: "wb-search-hit-main", children: [
              jsx.jsx("span", { className: "wb-search-hit-title", children: hit.title }),
              hit.snippet ? jsx.jsx("span", { className: "wb-search-hit-snippet", children: hit.snippet }) : null,
            ] }),
          ] }, hit.domainId + ":" + hit.id);
        }),
      ] })
      : null,
  ] });
}

function WorkbenchPage(props) {
  var t = props.t;
  var store = useAddonStore();
  var rs = react.useState("home"); var route = rs[0]; var setRoute = rs[1];
  var navigation = react.useState({}); var viewParams = navigation[0];
  var lang = currentLang();
  var api = useApi();
  react.useEffect(function () { ensureCss(); }, []);

  var addons = (store.addons || []).filter(function (a) { return a && a.enabled; });
  var currentAddon = null;
  if (route.indexOf("addon:") === 0) {
    var parts = route.split(":");
    var wanted = parts[1] || "";
    addons.forEach(function (a) { if (a.id === wanted) currentAddon = a; });
  }
  var mod = currentAddon ? registry.get(currentAddon.id) : null;
  var clientViews = mod && Array.isArray(mod.views) ? mod.views : [];
  var manifestViews = currentAddon && Array.isArray(currentAddon.views) ? currentAddon.views : [];
  var viewList = clientViews.length ? clientViews : manifestViews;
  var wantedView = route.indexOf("addon:") === 0 ? (route.split(":")[2] || "") : "";
  var activeView = null;
  viewList.forEach(function (v) { if (v.id === wantedView) activeView = v; });
  if (!activeView && viewList.length) activeView = viewList[0];

  function go(next, params) { navigation[1](params || {}); setRoute(next); }
  function navigateView(viewId, params) {
    if (currentAddon && viewList.some(function (v) { return v.id === viewId; })) {
      go("addon:" + currentAddon.id + ":" + viewId, params);
    }
  }
  function cardIcon(id, title) {
    var m = registry.get(id) || registry.get("wb-addon-" + id);
    if (m && m.icon) return h(m.icon, { size: 18, strokeWidth: 1.9, "aria-hidden": "true" });
    return String(title || "?").slice(0, 1);
  }
  function openAddon(a) {
    var m = registry.get(a.id);
    var v = (m && m.views && m.views[0]) || (a.views && a.views[0]) || null;
    go("addon:" + a.id + ":" + (v && v.id ? v.id : ""));
  }
  function pageHead(title, desc) {
    return jsx.jsxs("div", { className: "wb-page-head", children: [
      jsx.jsx("div", { className: "wb-page-top", children: [
        jsx.jsx("button", { className: "wb-back", onClick: function () { go("home"); }, children: "← " + t("back_home") }),
      ] }),
      jsx.jsxs("div", { className: "wb-page-title", children: [
        jsx.jsx("span", { className: "wb-home-icon", children: cardIcon(a.id, title) }),
        jsx.jsx("h2", { children: title }),
      ] }),
      desc ? jsx.jsx("div", { className: "wb-page-desc", children: desc }) : null,
    ] });
  }
  function addonCard(a) {
    var m = registry.get(a.id);
    var v = (m && m.views && m.views[0]) || (a.views && a.views[0]) || null;
    var title = a.title || pickTitle(v && v.title, lang) || a.id;
    var count = (m && m.views ? m.views.length : (a.views ? a.views.length : 0));
    return jsx.jsxs("button", { type: "button", className: "wb-home-card" + (a.error ? " dim" : ""), onClick: function () { openAddon(a); }, children: [
      jsx.jsxs("div", { className: "wb-home-top", children: [
        jsx.jsx("span", { className: "wb-home-icon", children: cardIcon(a.id, a.title || title) }),
        jsx.jsx("span", { className: "wb-badge", children: "v" + (a.version || "?") }),
      ] }),
      jsx.jsx("div", { className: "wb-home-title", children: title }),
      jsx.jsx("div", { className: "wb-home-desc", children: a.description || (count > 1 ? count + " " + t("views") : "") }),
      a.error ? jsx.jsx("div", { className: "wb-err", children: t("addon_error") + ": " + a.error }) : null,
      jsx.jsxs("div", { className: "wb-home-foot", children: [
        jsx.jsx("span", { children: count ? count + " " + t("views") : "" }),
        jsx.jsx("b", { children: t("open") + " →" }),
      ] }),
    ] }, a.id);
  }
  function systemCard(key, icon, title, desc) {
    return jsx.jsxs("button", { type: "button", className: "wb-home-card", onClick: function () { go(key); }, children: [
      jsx.jsxs("div", { className: "wb-home-top", children: [
        jsx.jsx("span", { className: "wb-home-icon", children: cardIcon(key, icon) }),
      ] }),
      jsx.jsx("div", { className: "wb-home-title", children: title }),
      jsx.jsx("div", { className: "wb-home-desc", children: desc }),
      jsx.jsxs("div", { className: "wb-home-foot", children: [
        jsx.jsx("span", { children: "" }),
        jsx.jsx("b", { children: t("open") + " →" }),
      ] }),
    ] }, key);
  }

  if (route === "backup") {
    return jsx.jsxs("div", { className: "wb-root", children: [
      jsx.jsxs("div", { className: "wb-inner wb-wide", children: [pageHead(t("tab_backup"), t("backup_desc")), jsx.jsx(BackupTab, { t: t, lang: lang, addons: addons })] }),
    ] });
  }
  if (route === "audit") {
    return jsx.jsxs("div", { className: "wb-root", children: [
      jsx.jsxs("div", { className: "wb-inner wb-wide", children: [pageHead(t("tab_audit"), t("audit_desc")), jsx.jsx(AuditTab, { t: t })] }),
    ] });
  }
  if (route === "account") {
    return jsx.jsxs("div", { className: "wb-root", children: [
      jsx.jsxs("div", { className: "wb-inner wb-wide", children: [pageHead(t("tab_account"), t("account_desc")), jsx.jsx(AccountTab, { t: t })] }),
    ] });
  }
  if (currentAddon) {
    var canRender = activeView && typeof activeView.component === "function";
    var addonTitle = currentAddon.title || pickTitle(activeView && activeView.title, lang) || currentAddon.id;
    return jsx.jsxs("div", { className: "wb-root wb-immersive", children: [
      jsx.jsxs("div", { className: "wb-immersive-bar", children: [
        jsx.jsx("button", { className: "wb-back", onClick: function () { go("home"); }, children: "← " + t("back_home") }),
        jsx.jsxs("div", { className: "wb-immersive-title", children: [
          jsx.jsx("span", { className: "wb-home-icon", children: cardIcon(currentAddon.id, addonTitle) }),
          jsx.jsx("span", { children: addonTitle }),
          jsx.jsx("span", { className: "wb-badge", children: "v" + (currentAddon.version || "?") }),
        ] }),
        jsx.jsx("div", { className: "wb-grow" }),
        jsx.jsx(ViewTabs, { views: viewList, activeView: activeView, addonId: currentAddon.id, lang: lang, go: go }),
      ] }),
      jsx.jsxs("div", { className: "wb-immersive-main", children: [
        jsx.jsxs("div", { className: "wb-inner wb-wide", children: [
          currentAddon.error
            ? jsx.jsx("div", { className: "wb-card", children: jsx.jsx("div", { className: "wb-err", children: t("addon_error") + ": " + currentAddon.error }) })
            : canRender
              ? jsx.jsx(ViewOutlet, { view: activeView, viewProps: { api: apiFor(currentAddon.id), lang: lang, addonId: currentAddon.id, t: t, viewParams: viewParams, onNavigate: navigateView } }, currentAddon.id)
              : !viewList.length
                ? jsx.jsx("div", { className: "wb-card", children: jsx.jsx("div", { className: "wb-msg", children: t("no_views") }) })
                : jsx.jsx("div", { className: "wb-card", children: jsx.jsx("div", { className: "wb-page-loading", children: jsx.jsx("div", { className: "wb-msg", style: { padding: "4px 0" }, children: lastAddonError ? t("addon_unavailable") + " · " + lastAddonError : t("addon_loading") }) }) }),
        ] }),
      ] }),
    ] });
  }

  return jsx.jsxs("div", { className: "wb-root", children: [
    jsx.jsxs("div", { className: "wb-inner", children: [
      jsx.jsxs("div", { className: "wb-hero", children: [
        jsx.jsxs("div", { children: [jsx.jsx("h2", { children: t("title") }), jsx.jsx("span", { className: "wb-tag", children: t("tagline") })] }),
        jsx.jsx(CloudStatusPill, { t: t, onOpen: function () { go("account"); } }),
      ] }),
      jsx.jsx(SearchPanel, { api: api, addons: addons, go: go, t: t }),
      addons.length
        ? jsx.jsx("div", { className: "wb-home-grid", children: addons.map(addonCard) })
        : jsx.jsx("div", { className: "wb-card", children: jsx.jsx("div", { className: "wb-msg wb-empty-cta", children: t("no_installed") }) }),
      jsx.jsxs("div", { className: "wb-sec", children: [
        jsx.jsx("h3", { children: t("manage") }),
        jsx.jsx("span", { className: "wb-hint", children: t("home_hint") }),
      ] }),
      jsx.jsxs("div", { className: "wb-home-grid manage", children: [
        systemCard("backup", "backup", t("tab_backup"), t("backup_desc")),
        systemCard("audit", "audit", t("tab_audit"), t("audit_desc")),
        systemCard("account", "account", t("tab_account"), t("account_desc")),
      ] }),
    ] }),
  ] });
}

var RecordToggle = function (props) {
  var sid = props && props.sessionId;
  var st = react.useState(false); var on = st[0]; var setOn = st[1];
  var bst = react.useState(false); var busy = bst[0]; var setBusy = bst[1];
  var est = react.useState(""); var err = est[0]; var setErr = est[1];
  var t = props && props.t;

  react.useEffect(function () {
    if (!sid) return;
    var fn = function (changed, value) { if (changed === sid) setOn(!!value); };
    recordListeners.add(fn);
    ensureStream();
    fetch("/workbench/api/record?sessionId=" + encodeURIComponent(sid))
      .then(function (r) { return r.json(); })
      .then(function (j) { if (j && j.ok) setRecordMode(sid, !!j.enabled); })
      .catch(function () { /* 宿主不可达时保持关闭态，不打扰输入 */ });
    return function () { recordListeners.delete(fn); };
  }, [sid]);

  function toggle() {
    if (!sid || busy) return;
    setBusy(true); setErr("");
    fetch("/workbench/api/record", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId: sid, enabled: !on }),
    })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.ok) throw new Error((j && j.error) || "request failed");
        setRecordMode(sid, !!j.enabled);
      })
      .catch(function (e) { var msg = String((e && e.message) || e); setErr(msg); try { console.warn("[dsh-workbench] record toggle failed:", msg); } catch (_) {} })
      .then(function () { setBusy(false); });
  }

  if (!sid) return null;
  var label = busy ? t("record_busy") : err ? t("record_failed_short") : on ? t("record_on") : t("record_off");
  var title = err ? t("record_error") + ": " + err : on ? t("record_on_title") : t("record_off_title");
  return h("button", {
    type: "button",
    className: "wb-record-pill" + (on ? " on" : "") + (err ? " err" : ""),
    onClick: toggle,
    disabled: busy,
    title: title,
    "aria-label": t("record_label") + ": " + label,
    "aria-pressed": on ? "true" : "false",
  },
    h("span", { className: "wb-record-dot" }),
    h("span", { className: "wb-record-label", children: label })
  );
};

var exports_ = {
  name: NS,
  inject: ["slots", "locale", "theme"],
  apply: function (ctx) {
    try {
      ensureCss();
      var PanellistIcon = function () {
        return h("svg", { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" },
          h("rect", { x: 3, y: 3, width: 7, height: 7, rx: 1 }),
          h("rect", { x: 14, y: 3, width: 7, height: 7, rx: 1 }),
          h("rect", { x: 3, y: 14, width: 7, height: 7, rx: 1 }),
          h("rect", { x: 14, y: 14, width: 7, height: 7, rx: 1 })
        );
      };
      ctx.effect(function () { return ctx.locale.register(NS, LOCALE); }, "wb-locale");
      var t = ctx.locale.bind(NS);
      ctx.slots.inject("sidebar.panellist", function () {
        return ctx.slots.register(
          { name: "sidebar.panellist", id: NS, order: 62, label: function () { return t("nav"); } },
          function () { return h(PanellistIcon, {}); }
        );
      });
      ctx.slots.inject("main", function () {
        return ctx.slots.register(
          { name: "main", key: NS, locale: NS, inject: function () { return { t: t }; } },
          function () { try { return jsx.jsx(WorkbenchPage, { t: t }); } catch (e) { window.__wbSlotErr = String((e && e.stack) || e); throw e; } }
        );
      });
      ctx.slots.inject("settings.plugins.tab", function () {
        return ctx.slots.register(
          { name: "settings.plugins.tab", id: NS, order: 65, label: function () { return t("nav"); }, locale: NS, inject: function () { return { t: t }; } },
          function () { return h(WorkbenchPage, { t: t }); }
        );
      });
      ctx.slots.inject("conversation.input.left", function () {
        return ctx.slots.register(
          { name: "conversation.input.left", id: NS + "-record", order: 40, label: function () { return t("record_label"); } },
          function (props) { return h(RecordToggle, { sessionId: props && props.sessionId, t: t }); }
        );
      });
    } catch (e) { console.error("[dsh-workbench] apply crashed:", e, e && e.stack); throw e; }
  },
};
module.exports = exports_;
