"use strict";
/**
 * 配置视图：按 danmaku.configGet 的 groups/items 动态渲染，改动立即写入；
 * 下方附桌面弹幕的运行状态卡片（查询 danmaku.desktop）。
 * useConfig 同时供数据页读取分页配置。
 */
var React = require("react");
var h = React.createElement;
var copy = require("../copy.cjs");

var DOMAIN = "danmaku";
var PHASES = ["stopped", "resolving", "installing", "starting", "running", "retrying", "error"];

function unwrap(r) {
  return r && r.result !== undefined ? r.result : r;
}

function useConfig(api, fallback) {
  var stateS = React.useState({
    ready: false,
    values: Object.assign({}, fallback || {}),
    items: [],
    groups: [],
    overrides: {},
    warnings: [],
    error: "",
  });
  var state = stateS[0];
  var setState = stateS[1];

  React.useEffect(function () {
    var alive = true;
    Promise.resolve(api.call(DOMAIN + ".configGet"))
      .then(function (r) {
        if (!alive) return;
        if (r && r.ok === false) throw new Error((r && r.error) || "load failed");
        var body = unwrap(r);
        if (!body || !body.values) throw new Error("empty config");
        setState({
          ready: true,
          values: Object.assign({}, fallback || {}, body.values),
          items: body.items || [],
          groups: body.groups || [],
          overrides: body.overrides || {},
          warnings: body.warnings || [],
          error: "",
        });
      })
      .catch(function (e) {
        if (!alive) return;
        setState(function (prev) {
          return Object.assign({}, prev, { ready: true, error: String((e && e.message) || e) });
        });
      });
    return function () {
      alive = false;
    };
  }, [api]);

  function setValues(next) {
    if (!next || typeof next !== "object") return;
    setState(function (prev) {
      return Object.assign({}, prev, { values: Object.assign({}, prev.values, next) });
    });
  }

  return Object.assign({}, state, { setValues: setValues });
}

function labelOf(item, lang) {
  return lang === "en" ? item.en || item.zh || item.id : item.zh || item.en || item.id;
}

function hintOf(item, lang) {
  return lang === "en" ? item.hintEn || "" : item.hintZh || "";
}

function useDesktop(api, enabled) {
  var stateS = React.useState({ data: null, error: "" });
  var state = stateS[0];
  var setState = stateS[1];

  React.useEffect(function () {
    if (!enabled) return undefined;
    var alive = true;
    function tick() {
      Promise.resolve(api.call(DOMAIN + ".desktop", { op: "status" }))
        .then(function (r) {
          if (!alive) return;
          if (r && r.ok === false) throw new Error((r && r.error) || "status failed");
          setState({ data: unwrap(r), error: "" });
        })
        .catch(function (e) {
          if (!alive) return;
          setState({ data: null, error: String((e && e.message) || e) });
        });
    }
    tick();
    var timer = window.setInterval(tick, 4000);
    return function () {
      alive = false;
      window.clearInterval(timer);
    };
  }, [api, enabled]);

  return state;
}

function DesktopCard(props) {
  var api = props.api;
  var lang = props.lang;
  var C = copy.pick(lang);
  var state = useDesktop(api, true);
  var busyS = React.useState("");
  var busy = busyS[0];
  var setBusy = busyS[1];
  var sayS = React.useState("");
  var say = sayS[0];
  var setSay = sayS[1];
  var data = state.data || {};

  function op(name) {
    setBusy(name);
    Promise.resolve(api.call(DOMAIN + ".desktop", { op: name }))
      .then(function (r) {
        if (r && r.ok === false) throw new Error((r && r.error) || "failed");
        setSay("");
        return unwrap(r);
      })
      .catch(function (e) {
        setSay(String((e && e.message) || e));
      })
      .then(function () {
        setBusy("");
      });
  }

  var phase = data.phase || "stopped";
  var phaseLabel = C.desktopPhase[phase] || phase;
  var value = function (label, text) {
    return h(
      "div",
      { className: "wbdm-status-cell", key: label },
      h("div", { className: "wbdm-status-label" }, label),
      h("div", { className: "wbdm-status-value" }, text),
    );
  };

  return h(
    "div",
    { className: "wbdm-card", style: { marginTop: 14 } },
    h("div", { className: "wbdm-title", style: { fontSize: 14 } }, C.desktopTitle),
    h("div", { className: "wbdm-hint" }, C.desktopHint),
    state.error ? h("div", { className: "wbdm-notice error" }, state.error) : null,
    h(
      "div",
      { className: "wbdm-status" },
      value("状态", phaseLabel + (data.suppressed ? " · " + C.desktopSuppressed : "")),
      value("协议", copy.fmt(C.desktopProtocol, { n: data.protocol || 1 })),
      value("屏幕", copy.fmt(C.desktopDisplays, { n: data.displays || 0 })),
      value("主题", data.themeSynced ? C.desktopTheme : C.desktopThemeMissing),
    ),
    data.error ? h("div", { className: "wbdm-notice error" }, data.error) : null,
    h(
      "div",
      { className: "wbdm-cfg-actions", style: { marginTop: 8 } },
      h(
        "button",
        {
          type: "button",
          className: "wbdm-btn primary",
          disabled: Boolean(busy),
          onClick: function () {
            op("restart");
          },
        },
        C.desktopRestart,
      ),
      h(
        "button",
        {
          type: "button",
          className: "wbdm-btn",
          disabled: Boolean(busy),
          onClick: function () {
            op("stop");
          },
        },
        C.desktopStop,
      ),
      h(
        "button",
        {
          type: "button",
          className: "wbdm-btn",
          disabled: Boolean(busy),
          onClick: function () {
            op("resume");
          },
        },
        C.desktopResume,
      ),
      say ? h("span", { className: "wbdm-notice error" }, say) : null,
    ),
  );
}

function ConfigView(props) {
  var api = props.api;
  var lang = props.lang;
  var t = props.t;
  var C = copy.pick(lang);
  var cfg = useConfig(api, {});
  var localS = React.useState({});
  var local = localS[0];
  var setLocal = localS[1];
  var toastS = React.useState("");
  var toast = toastS[0];
  var setToast = toastS[1];
  var seqRef = React.useRef(0);
  var aliveRef = React.useRef(true);

  React.useEffect(function () {
    return function () {
      aliveRef.current = false;
    };
  }, []);

  function values() {
    return Object.assign({}, cfg.values, local);
  }

  function toastOnce(text) {
    setToast(text);
    window.setTimeout(function () {
      if (aliveRef.current) setToast("");
    }, 2200);
  }

  function save(id, value) {
    var seq = ++seqRef.current;
    var patch = {};
    patch[id] = value;
    setLocal(function (prev) {
      return Object.assign({}, prev, patch);
    });
    Promise.resolve(api.call(DOMAIN + ".configSet", { values: patch }))
      .then(function (r) {
        if (r && r.ok === false) throw new Error((r && r.error) || C.saveFail);
        var body = unwrap(r) || {};
        if (seq !== seqRef.current) return;
        if (typeof cfg.setValues === "function") cfg.setValues(body.values);
        setLocal({});
        toastOnce(C.saved);
      })
      .catch(function (e) {
        setLocal(function (prev) {
          var next = Object.assign({}, prev);
          delete next[id];
          return next;
        });
        toastOnce(String((e && e.message) || e));
      });
  }

  function resetAll() {
    Promise.resolve(api.call(DOMAIN + ".configReset", {}))
      .then(function (r) {
        if (r && r.ok === false) throw new Error((r && r.error) || C.saveFail);
        var body = unwrap(r) || {};
        if (typeof cfg.setValues === "function") cfg.setValues(body.values);
        seqRef.current += 1;
        setLocal({});
        toastOnce(C.resetDone);
      })
      .catch(function (e) {
        toastOnce(String((e && e.message) || e));
      });
  }

  function control(item) {
    var value = values()[item.id];
    if (item.type === "bool") {
      return h("input", {
        type: "checkbox",
        checked: value === true,
        "aria-label": labelOf(item, lang),
        onChange: function (e) {
          save(item.id, e.target.checked);
        },
      });
    }
    if (item.type === "enum") {
      return h(
        "select",
        {
          className: "wbdm-select",
          value: value === undefined ? "" : String(value),
          "aria-label": labelOf(item, lang),
          onChange: function (e) {
            var hit = (item.values || []).filter(function (option) {
              return String(option.value) === e.target.value;
            })[0];
            save(item.id, hit ? hit.value : e.target.value);
          },
        },
        (item.values || []).map(function (option) {
          return h(
            "option",
            { key: String(option.value), value: String(option.value) },
            lang === "en" ? option.en || option.zh || String(option.value) : option.zh || option.en || String(option.value),
          );
        }),
      );
    }
    if (item.type === "int" || item.type === "number") {
      return h("input", {
        className: "wbdm-input",
        type: "number",
        step: item.type === "number" ? 0.05 : 1,
        min: item.min,
        max: item.max,
        value: value === undefined ? "" : value,
        "aria-label": labelOf(item, lang),
        onChange: function (e) {
          var next = Number(e.target.value);
          if (!isFinite(next)) return;
          save(item.id, next);
        },
      });
    }
    return h("input", {
      className: "wbdm-input",
      type: "text",
      value: value === undefined ? "" : String(value),
      "aria-label": labelOf(item, lang),
      onChange: function (e) {
        save(item.id, e.target.value);
      },
    });
  }

  if (!cfg.ready) return h("div", { className: "wbdm-wrap" }, h("div", { className: "wbdm-empty" }, C.loading));
  if (cfg.error && !cfg.items.length) {
    return h("div", { className: "wbdm-wrap" }, h("div", { className: "wbdm-notice error" }, cfg.error));
  }

  var groups = cfg.groups.length ? cfg.groups : [{ id: "all", zh: "全部", en: "All" }];
  var sections = groups.map(function (group) {
    var items = cfg.items.filter(function (item) {
      return (item.group || "all") === group.id;
    });
    if (!items.length) return null;
    return h(
      "div",
      { className: "wbdm-cfg", key: group.id },
      h("div", { className: "wbdm-cfg-title" }, lang === "en" ? group.en || group.zh : group.zh || group.en),
      h(
        "div",
        { className: "wbdm-cfg-group" },
        items.map(function (item) {
          return h(
            "div",
            { className: "wbdm-field", key: item.id },
            h("label", { className: "wbdm-label" }, labelOf(item, lang)),
            control(item),
            hintOf(item, lang) ? h("div", { className: "wbdm-hint" }, hintOf(item, lang)) : null,
          );
        }),
      ),
    );
  });

  return h(
    "div",
    { className: "wbdm-wrap" },
    h("div", { className: "wbdm-head" }, h("div", { className: "wbdm-title" }, C.configTitle), h("div", { className: "wbdm-sub" }, C.configHint)),
    toast ? h("div", { className: "wbdm-notice ok" }, toast) : null,
    cfg.warnings && cfg.warnings.length
      ? h("div", { className: "wbdm-notice warn" }, cfg.warnings.join("；"))
      : null,
    sections,
    h(
      "div",
      { className: "wbdm-cfg-actions" },
      h(
        "button",
        { type: "button", className: "wbdm-btn", onClick: resetAll },
        C.resetAll,
      ),
    ),
    h(DesktopCard, { api: api, lang: lang, t: t }),
  );
}

module.exports = ConfigView;
module.exports.useConfig = useConfig;
