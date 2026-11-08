// tasks 配置页与配置读取辅助。构建：node scripts/build-addon-clients.mjs
// 配置存在本机 meta 表，不参与云端同步，也不进入备份。
var React = require("react");
var h = React.createElement;

var DOMAIN = "tasks";
var PREFIX = "wbt";

var COPY = {
  zh: {
    title: "配置", note: "这些偏好只保存在本机，不参与云端同步",
    loading: "读取配置中…", loadFail: "配置服务未就绪（插件版本过旧？）",
    retry: "重试", saveFail: "保存失败：", saved: "已保存", saving: "保存中…",
    reset: "恢复默认", resetAll: "全部恢复默认", resetting: "恢复中…",
    modified: "已修改", defaultValue: "默认", allDefault: "全部使用默认值",
    on: "开", off: "关", empty: "没有可配置项", confirmResetAll: "确定把全部配置恢复默认值？",
    min: "最小", max: "最大",
  },
  en: {
    title: "Config", note: "Preferences stay on this machine; they are not synced to the cloud",
    loading: "Loading config…", loadFail: "Config service not ready (plugin too old?)",
    retry: "Retry", saveFail: "Save failed: ", saved: "Saved", saving: "Saving…",
    reset: "Reset", resetAll: "Reset all", resetting: "Resetting…",
    modified: "Modified", defaultValue: "Default", allDefault: "All defaults",
    on: "On", off: "Off", empty: "Nothing to configure", confirmResetAll: "Reset every setting to its default?",
    min: "Min", max: "Max",
  },
};

var CSS = [
  ".__P__-cfg{display:flex;flex-direction:column;gap:14px;font-size:13px;color:inherit;min-height:0}",
  ".__P__-cfg-head h2{margin:0;font-size:16px;font-weight:680}",
  ".__P__-cfg-note{font-size:12px;opacity:.58;margin-top:4px;line-height:1.6}",
  ".__P__-cfg-group{border:1px solid var(--dsw-alias-border-l2,color-mix(in oklab,currentColor 16%,transparent));border-radius:12px;overflow:hidden}",
  ".__P__-cfg-gtitle{padding:9px 14px;font-size:12px;font-weight:650;letter-spacing:.3px;opacity:.72;background:color-mix(in oklab,currentColor 3%,transparent);border-bottom:1px solid var(--dsw-alias-border-l2,color-mix(in oklab,currentColor 12%,transparent))}",
  ".__P__-cfg-row{display:flex;gap:16px;align-items:center;padding:11px 14px;border-top:1px solid color-mix(in oklab,currentColor 8%,transparent)}",
  ".__P__-cfg-row:first-of-type{border-top:none}",
  ".__P__-cfg-label{flex:1;min-width:0}",
  ".__P__-cfg-name{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:600}",
  ".__P__-cfg-id{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;opacity:.45}",
  ".__P__-cfg-hint{font-size:11.5px;opacity:.58;line-height:1.5;margin-top:3px}",
  ".__P__-cfg-control{display:flex;align-items:center;gap:8px;flex:none;max-width:46%}",
  ".__P__-cfg-select,.__P__-cfg-input{border:1px solid var(--dsw-alias-border-l2,color-mix(in oklab,currentColor 18%,transparent));background:transparent;color:inherit;border-radius:8px;padding:6px 9px;font-size:12.5px;outline:none;min-width:120px;max-width:100%}",
  ".__P__-cfg-select:focus,.__P__-cfg-input:focus{border-color:var(--dsw-alias-brand-primary,#11a89b)}",
  ".__P__-cfg-switch{display:inline-flex;align-items:center;gap:7px;cursor:pointer;font-size:12.5px}",
  ".__P__-cfg-switch input{width:16px;height:16px;accent-color:var(--dsw-alias-brand-primary,#11a89b);cursor:pointer}",
  ".__P__-cfg-multi{display:flex;flex-wrap:wrap;gap:6px 12px;justify-content:flex-end;max-width:420px}",
  ".__P__-cfg-multi label{display:inline-flex;align-items:center;gap:5px;font-size:12px;cursor:pointer;white-space:nowrap}",
  ".__P__-cfg-multi input{width:14px;height:14px;accent-color:var(--dsw-alias-brand-primary,#11a89b)}",
  ".__P__-cfg-chip{font-size:10.5px;padding:1px 7px;border-radius:999px;background:color-mix(in oklab,var(--dsw-alias-brand-primary,#11a89b) 14%,transparent);color:var(--dsw-alias-brand-primary,#11a89b);font-weight:600}",
  ".__P__-cfg-btn{border:1px solid var(--dsw-alias-border-l2,color-mix(in oklab,currentColor 18%,transparent));background:transparent;color:inherit;border-radius:8px;padding:5px 9px;font-size:11.5px;cursor:pointer;white-space:nowrap}",
  ".__P__-cfg-btn:hover{border-color:var(--dsw-alias-brand-primary,#11a89b)}",
  ".__P__-cfg-btn:disabled{opacity:.5;cursor:not-allowed}",
  ".__P__-cfg-foot{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:12px;opacity:.72}",
  ".__P__-cfg-grow{flex:1}",
  ".__P__-cfg-loading,.__P__-cfg-empty{border:1px dashed var(--dsw-alias-border-l2,color-mix(in oklab,currentColor 16%,transparent));border-radius:12px;padding:34px 16px;text-align:center;font-size:12.5px;opacity:.6}",
  ".__P__-cfg-error{border:1px solid color-mix(in oklab,#e5484d 42%,transparent);border-radius:10px;padding:10px 13px;color:#e5484d;font-size:12.5px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}",
  ".__P__-cfg-status{font-size:11.5px;opacity:.62;min-height:16px}",
  ".__P__-cfg-status.err{color:#e5484d;opacity:1}",
  "@media (max-width:760px){.__P__-cfg-row{flex-direction:column;align-items:stretch;gap:8px}.__P__-cfg-control{max-width:none;justify-content:flex-start}.__P__-cfg-multi{justify-content:flex-start}}",
].join("\n");

function injectCss() {
  if (typeof document === "undefined") return;
  var old = document.getElementById("wb-addon-" + DOMAIN + "-config-css");
  if (old) { old.textContent = CSS; return; }
  var s = document.createElement("style");
  s.id = "wb-addon-" + DOMAIN + "-config-css";
  s.setAttribute("data-wb-addon", "wb-addon-" + DOMAIN);
  s.textContent = CSS;
  document.head.appendChild(s);
}

function unwrap(r) {
  return r && r.result !== undefined ? r.result : r;
}

function optionLabel(opt, lang) {
  return lang === "en" ? String(opt.en || opt.zh || opt.value) : String(opt.zh || opt.en || opt.value);
}

function sameValue(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * 读取配置并在挂载时给出可用的默认值。
 * 返回 { ready, values, items, groups, overrides, state, error }。
 */
function useConfig(api, fallback) {
  var fb = fallback || {};
  var stateS = React.useState({
    ready: false, values: Object.assign({}, fb), items: [], groups: [], overrides: {}, error: "", state: null,
  });
  var state = stateS[0], setState = stateS[1];
  React.useEffect(function () {
    var alive = true;
    Promise.resolve(api.call(DOMAIN + ".configGet"))
      .then(function (r) {
        if (!alive) return;
        var body = unwrap(r);
        if (r && r.ok === false) throw new Error((r && r.error) || "load failed");
        if (!body || !body.values) throw new Error("empty config");
        setState({
          ready: true, values: Object.assign({}, fb, body.values), items: body.items || [],
          groups: body.groups || [], overrides: body.overrides || {}, error: "", state: body,
        });
      })
      .catch(function (e) {
        if (!alive) return;
        setState({
          ready: true, values: Object.assign({}, fb), items: [], groups: [], overrides: {},
          error: String((e && e.message) || e), state: null,
        });
      });
    return function () { alive = false; };
  }, [api]);
  return state;
}

function ConfigView(props) {
  var api = props.api;
  var lang = props.lang === "en" ? "en" : "zh";
  var t = COPY[lang];
  var loadS = React.useState(true);
  var loading = loadS[0], setLoading = loadS[1];
  var stateS = React.useState(null);
  var state = stateS[0], setState = stateS[1];
  var errS = React.useState("");
  var err = errS[0], setErr = errS[1];
  var noticeS = React.useState({ id: "", text: "", error: false });
  var notice = noticeS[0], setNotice = noticeS[1];
  var savingS = React.useState("");
  var savingId = savingS[0], setSavingId = savingS[1];
  var draftsS = React.useState({});
  var drafts = draftsS[0], setDrafts = draftsS[1];
  var busyS = React.useState(false);
  var busy = busyS[0], setBusy = busyS[1];

  React.useEffect(function () { injectCss(); }, []);

  var load = React.useCallback(function () {
    setLoading(true);
    return Promise.resolve(api.call(DOMAIN + ".configGet"))
      .then(function (r) {
        var body = unwrap(r);
        if (r && r.ok === false) throw new Error((r && r.error) || "load failed");
        setState(body || null);
        setErr("");
        setLoading(false);
      })
      .catch(function (e) {
        setErr(String((e && e.message) || e));
        setLoading(false);
      });
  }, [api]);

  React.useEffect(function () { load(); }, [load]);

  function setValueLocal(id, value) {
    setState(function (prev) {
      if (!prev) return prev;
      var values = Object.assign({}, prev.values);
      values[id] = value;
      var overrides = Object.assign({}, prev.overrides);
      overrides[id] = value;
      return Object.assign({}, prev, { values: values, overrides: overrides });
    });
  }

  function save(id, value) {
    var prevState = state;
    setSavingId(id);
    setNotice({ id: id, text: t.saving, error: false });
    setValueLocal(id, value);
    return Promise.resolve(api.call(DOMAIN + ".configSet", { values: (function () { var o = {}; o[id] = value; return o; })() }))
      .then(function (r) {
        var body = unwrap(r);
        if (r && r.ok === false) throw new Error((r && r.error) || "save failed");
        setSavingId("");
        if (body && body.state) setState(body.state);
        setNotice({ id: id, text: t.saved, error: false });
      })
      .catch(function (e) {
        setSavingId("");
        if (prevState) setState(prevState);
        setNotice({ id: id, text: t.saveFail + String((e && e.message) || e), error: true });
      });
  }

  function resetItem(id) {
    var prevState = state;
    setBusy(true);
    setNotice({ id: id, text: t.resetting, error: false });
    return Promise.resolve(api.call(DOMAIN + ".configReset", { ids: [id] }))
      .then(function (r) {
        var body = unwrap(r);
        if (r && r.ok === false) throw new Error((r && r.error) || "reset failed");
        setBusy(false);
        if (body && body.state) setState(body.state);
        setNotice({ id: id, text: t.defaultValue, error: false });
      })
      .catch(function (e) {
        setBusy(false);
        if (prevState) setState(prevState);
        setNotice({ id: id, text: String((e && e.message) || e), error: true });
      });
  }

  function resetAll() {
    if (typeof window !== "undefined" && window.confirm && !window.confirm(t.confirmResetAll)) return;
    var prevState = state;
    setBusy(true);
    setNotice({ id: "", text: t.resetting, error: false });
    Promise.resolve(api.call(DOMAIN + ".configReset", {}))
      .then(function (r) {
        var body = unwrap(r);
        if (r && r.ok === false) throw new Error((r && r.error) || "reset failed");
        setBusy(false);
        if (body && body.state) setState(body.state);
        setNotice({ id: "", text: t.allDefault, error: false });
      })
      .catch(function (e) {
        setBusy(false);
        if (prevState) setState(prevState);
        setNotice({ id: "", text: String((e && e.message) || e), error: true });
      });
  }

  function commitDraft(item) {
    var raw = drafts[item.id];
    if (raw === undefined) return;
    var next = String(raw).trim();
    setDrafts(function (prev) {
      var copy = Object.assign({}, prev);
      delete copy[item.id];
      return copy;
    });
    if (next === "") return;
    var value = Number(next);
    if (!Number.isFinite(value)) return;
    if (sameValue(value, state.values[item.id])) return;
    save(item.id, value);
  }

  function renderControl(item) {
    var value = state.values[item.id];
    var label = lang === "en" ? item.en : item.zh;
    if (item.type === "bool") {
      return h("label", { className: PREFIX + "-cfg-switch" },
        h("input", {
          type: "checkbox", checked: value === true,
          onChange: function (e) { save(item.id, e.target.checked); },
        }),
        h("span", null, value === true ? t.on : t.off)
      );
    }
    if (item.type === "enum") {
      return h("select", {
        className: PREFIX + "-cfg-select", value: String(value),
        onChange: function (e) {
          var hit = (item.options || []).filter(function (o) { return String(o.value) === e.target.value; })[0];
          if (hit) save(item.id, hit.value);
        },
      }, (item.options || []).map(function (o) {
        return h("option", { key: String(o.value), value: String(o.value) }, optionLabel(o, lang));
      }));
    }
    if (item.type === "int") {
      var draft = drafts[item.id] !== undefined ? drafts[item.id] : String(value);
      return h("input", {
        className: PREFIX + "-cfg-input", type: "number", value: draft,
        min: item.min, max: item.max, "aria-label": label,
        onChange: function (e) {
          var v = e.target.value;
          setDrafts(function (prev) { var c = Object.assign({}, prev); c[item.id] = v; return c; });
        },
        onBlur: function () { commitDraft(item); },
        onKeyDown: function (e) { if (e.key === "Enter") { e.preventDefault(); commitDraft(item); } },
      });
    }
    if (item.type === "multi") {
      var picked = Array.isArray(value) ? value : [];
      return h("div", { className: PREFIX + "-cfg-multi" }, (item.options || []).map(function (o) {
        var on = picked.indexOf(o.value) >= 0;
        return h("label", { key: String(o.value) },
          h("input", {
            type: "checkbox", checked: on,
            onChange: function () {
              var next = picked.slice();
              if (on) {
                if (next.length <= 1) return;
                next = next.filter(function (x) { return x !== o.value; });
              } else next.push(o.value);
              save(item.id, next);
            },
          }),
          h("span", null, optionLabel(o, lang))
        );
      }));
    }
    return h("input", {
      className: PREFIX + "-cfg-input", type: "text", defaultValue: value === undefined ? "" : String(value),
      onBlur: function (e) { if (!sameValue(e.target.value, value)) save(item.id, e.target.value); },
    });
  }

  var body = [];
  if (loading && !state) body.push(h("div", { key: "loading", className: PREFIX + "-cfg-loading" }, t.loading));
  if (!loading && err && !state) {
    body.push(h("div", { key: "err", className: PREFIX + "-cfg-error" },
      h("span", null, t.loadFail + " " + err),
      h("button", { type: "button", className: PREFIX + "-cfg-btn", onClick: load }, t.retry)
    ));
  }
  if (state) {
    var items = state.items || [];
    var groups = state.groups || [];
    var byGroup = {};
    items.forEach(function (item) { (byGroup[item.group] = byGroup[item.group] || []).push(item); });
    var order = groups.length ? groups : Object.keys(byGroup).map(function (id) { return { id: id, zh: id, en: id }; });
    order.forEach(function (g) {
      var list = byGroup[g.id] || [];
      if (!list.length) return;
      body.push(h("section", { key: "g-" + g.id, className: PREFIX + "-cfg-group" },
        h("div", { className: PREFIX + "-cfg-gtitle" }, lang === "en" ? g.en : g.zh),
        list.map(function (item) {
          var overridden = state.overrides && state.overrides[item.id] !== undefined;
          var isSaving = savingId === item.id;
          return h("div", { key: item.id, className: PREFIX + "-cfg-row" },
            h("div", { className: PREFIX + "-cfg-label" },
              h("div", { className: PREFIX + "-cfg-name" },
                h("span", null, lang === "en" ? item.en : item.zh),
                overridden ? h("span", { className: PREFIX + "-cfg-chip" }, t.modified) : null,
                isSaving ? h("span", { className: PREFIX + "-cfg-chip" }, t.saving) : null
              ),
              h("div", { className: PREFIX + "-cfg-id" }, item.id),
              h("div", { className: PREFIX + "-cfg-hint" }, lang === "en" ? item.hintEn : item.hintZh)
            ),
            h("div", { className: PREFIX + "-cfg-control" },
              renderControl(item),
              overridden ? h("button", {
                type: "button", className: PREFIX + "-cfg-btn", disabled: busy,
                onClick: function () { resetItem(item.id); }, title: t.reset,
              }, t.reset) : null
            )
          );
        })
      ));
    });
    if (!items.length && !loading) body.push(h("div", { key: "empty", className: PREFIX + "-cfg-empty" }, t.empty));
    var anyOverride = Object.keys(state.overrides || {}).length > 0;
    body.push(h("div", { key: "foot", className: PREFIX + "-cfg-foot" },
      h("span", { className: PREFIX + "-cfg-note" }, t.note),
      h("span", { className: PREFIX + "-cfg-grow" }),
      anyOverride ? h("button", { type: "button", className: PREFIX + "-cfg-btn", disabled: busy, onClick: resetAll }, busy ? t.resetting : t.resetAll) : null
    ));
    var warn = (state.warnings || []).filter(function (w) { return w && w.message; });
    if (warn.length) {
      body.push(h("div", { key: "warn", className: PREFIX + "-cfg-error" },
        h("span", null, warn.map(function (w) { return w.message; }).join("；"))
      ));
    }
  }
  if (notice.text) {
    body.push(h("div", { key: "notice", className: PREFIX + "-cfg-status" + (notice.error ? " err" : "") }, notice.text));
  }

  return h("div", { className: PREFIX + "-cfg" },
    h("div", { className: PREFIX + "-cfg-head" },
      h("h2", null, t.title),
      h("div", { className: PREFIX + "-cfg-note" }, t.note)
    ),
    body
  );
}

module.exports = { ConfigView: ConfigView, useConfig: useConfig, DOMAIN: DOMAIN };
