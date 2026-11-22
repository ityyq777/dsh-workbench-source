"use strict";
/**
 * 配置视图：按 mail.configGet 返回的 items/groups 动态渲染。
 * 改一项立即写入（mail.configSet），失败保留原值并提示；「全部恢复默认」调
 * mail.configReset。useConfig 同时给邮件视图读「默认加载远程图片」等策略。
 */
// 配置方案选择条与它的样式：useConfig 在模块级也要用，故放在模块作用域。
var SB = require("../../../lib/config-scheme-bar.cjs");
// 方案条复用共享样式；补齐它依赖的 --cfg-* 变量，取值全部来自主题 token。
var SCHEME_CSS = [
  ".wbml-page{--cfg-line:var(--wb-border,var(--dsw-alias-border-l2,color-mix(in oklab,currentColor 16%,transparent)));--cfg-surface:var(--wb-surface,var(--dsw-alias-bg-layer-1,transparent));--cfg-muted:var(--wb-muted,var(--dsw-alias-label-secondary,color-mix(in oklab,currentColor 62%,transparent)));--cfg-hover:var(--dsw-alias-interactive-bg-hover,color-mix(in oklab,currentColor 5%,transparent))}",
].concat(SB.styles).join("\n").split("__P__").join("wbml");

module.exports = function Config(props) {
  var h = props.h;
  var React = props.React;
  var api = props.api;
  var lang = props.lang === "en" ? "en" : "zh";
  var C = require("../ui/common.cjs");
  var icons = require("../ui/icons.cjs");
  // 布尔项统一使用共享开关控件。
  var SW = require("../../../lib/switch.cjs");
  // 数字项统一使用共享数字输入控件（范围只作提示，非法红字且不提交）。
  var NF = require("../../../lib/number-field.cjs");
  var cfg = module.exports.useConfig(React, api);
  var toastS = React.useState("");
  var toast = toastS[0];
  var setToast = toastS[1];
  var localS = React.useState({});
  var local = localS[0];
  var setLocal = localS[1];
  // 方案操作期间锁住方案条，避免连续点击产生并发写入。
  var schemeBusyS = React.useState(false);
  var schemeBusy = schemeBusyS[0];
  var setSchemeBusy = schemeBusyS[1];
  var schemeNote =
    lang === "en"
      ? "Schemes sync with the cloud and travel with backups; which scheme this device uses stays local."
      : "配置方案会随云端同步与备份；当前选中哪个方案只保存在本机。";
  // 连续改动会产生并发写入：只让最后一次回包改写权威值。
  var seqRef = React.useRef(0);
  // 自动同步的真实运行状态（开关只是意愿：保险箱锁着时它并不在跑），单独取一次展示。
  var syncS = React.useState(null);
  var sync = syncS[0];
  var setSync = syncS[1];

  function values() {
    return Object.assign({}, cfg.values, local);
  }
  React.useEffect(
    function () {
      if (!api) return undefined;
      var alive = true;
      C.call(api, "mail.autoSyncStatus", {})
        .then(function (r) {
          if (alive) setSync(r);
        })
        .catch(function () {
          if (alive) setSync(null);
        });
      return function () {
        alive = false;
      };
    },
    [api],
  );
  function syncSummary() {
    if (!sync) return "";
    var en = lang === "en";
    if (!sync.enabled) return en ? "Auto-sync is off; nothing is fetched in the background." : "自动同步已关闭，后台不会收取新邮件。";
    var mode = sync.mode === "idle" ? (en ? "IMAP push" : "IMAP 推送") : en ? "Interval" : "定时循环";
    var head = (en ? "Running: " : "正在运行：") + mode;
    if (sync.mode !== "idle") head += "，" + sync.intervalSec + "s";
    if (sync.lastAt) {
      var when = new Date(sync.lastAt);
      head += (en ? " · last " : " · 上次 ") + when.toLocaleTimeString(en ? "en-US" : "zh-CN");
    }
    if (sync.skippedLocked) {
      head += en
        ? " · skipped " + sync.skippedLocked + " time(s) because the vault is locked"
        : " · 因保险箱锁定跳过 " + sync.skippedLocked + " 次";
    }
    var failed = (sync.accounts || []).filter(function (a) {
      return a.lastError;
    });
    if (failed.length) head += (en ? " · " : " · ") + (en ? failed.length + " account(s) failing" : failed.length + " 个账户同步失败");
    return head;
  }
  function toastOnce(text) {
    setToast(text);
    setTimeout(function () {
      setToast("");
    }, 2000);
  }
  function labelOf(item) {
    return lang === "en" ? item.en || item.zh || item.id : item.zh || item.en || item.id;
  }
  function hintOf(item) {
    return lang === "en" ? item.hintEn || "" : item.hintZh || "";
  }
  function dropLocal(id, value) {
    setLocal(function (prev) {
      if (!(id in prev) || JSON.stringify(prev[id]) !== JSON.stringify(value)) return prev;
      var next = Object.assign({}, prev);
      delete next[id];
      return next;
    });
  }
  function save(id, value) {
    var seq = ++seqRef.current;
    var patch = {};
    patch[id] = value;
    setLocal(function (prev) {
      return Object.assign({}, prev, patch);
    });
    return C.call(api, "mail.configSet", { values: patch })
      .then(function (r) {
        if (seq !== seqRef.current) return r;
        if (r && r.values) cfg.setValues(r.values);
        setLocal({});
        toastOnce(lang === "en" ? "Saved" : "已保存");
      })
      .catch(function (e) {
        dropLocal(id, value);
        toastOnce(C.errText(e));
      });
  }
  // 方案操作：不做乐观更新，成功后用服务端返回的 state 整体替换。
  function schemeCall(action, args) {
    setSchemeBusy(true);
    return C.call(api, "mail." + action, args || {})
      .then(function (body) {
        var next = (body && body.state) || body;
        if (next && typeof cfg.setBody === "function") {
          cfg.setBody(next);
          // 方案已换，作废还没落地的单条写入，避免旧回包盖回新方案的值。
          seqRef.current += 1;
          setLocal({});
        }
        toastOnce(lang === "en" ? "Saved" : "已保存");
      })
      .catch(function (e) { toastOnce(C.errText(e)); })
      .then(function () { setSchemeBusy(false); });
  }
  function resetAll() {
    C.call(api, "mail.configReset", {})
      .then(function (r) {
        if (r && r.values) cfg.setValues(r.values);
        seqRef.current += 1;
        setLocal({});
        toastOnce(lang === "en" ? "Restored defaults" : "已恢复默认");
      })
      .catch(function (e) {
        toastOnce(C.errText(e));
      });
  }
  function multiLabel(item, v) {
    var table = item.valueLabels || {};
    var hit = table[v];
    if (hit) return lang === "en" ? hit.en || hit.zh : hit.zh;
    if (v === "original") return lang === "en" ? "Original design" : "按原信配色";
    if (v === "app") return lang === "en" ? "Follow app theme" : "跟随界面主题";
    return v;
  }

  function control(item) {
    var value = values()[item.id];
    if (item.type === "bool") {
      // 开关自带状态文案：中文「开启/关闭」，英文 On/Off。
      return h(SW.Switch, {
        h: h,
        checked: value === true,
        showState: true,
        onText: lang === "en" ? "On" : "开启",
        offText: lang === "en" ? "Off" : "关闭",
        onChange: function (next) {
          save(item.id, next);
        },
      });
    }
    if (item.type === "int" || item.type === "number") {
      // int 要求整数，number 允许小数（如不透明度）；范围交给控件提示文字。
      return h(NF.NumberField, {
        h: h,
        lang: lang,
        value: value === undefined ? "" : value,
        min: item.min,
        max: item.max,
        integer: item.type === "int",
        ariaLabel: labelOf(item),
        onCommit: function (next) {
          save(item.id, next);
        },
      });
    }
    if (item.type === "multi" && Array.isArray(item.values)) {
      // 枚举项（例如正文配色 original/app）用下拉，改一项立即写入。
      return h(
        "select",
        {
          className: "wbml-input wbml-select",
          value: value === undefined ? item.default : value,
          "aria-label": labelOf(item),
          onChange: function (e) { save(item.id, e.target.value); },
        },
        item.values.map(function (v) {
          return h("option", { key: v, value: v }, multiLabel(item, v));
        }),
      );
    }
    return h("span", { className: "wbml-muted" }, String(value === undefined ? "" : value));
  }

  // 方案条：标题说明之后、分组之前。
  function schemeBar() {
    return h(SB.SchemeBar, {
      key: "schemes", lang: lang, prefix: "wbml",
      schemes: (cfg.state && cfg.state.schemes) || [],
      activeId: cfg.state && cfg.state.scheme ? cfg.state.scheme.id : "",
      busy: schemeBusy,
      onActivate: function (id) { schemeCall("configSchemeActivate", { id: id || "" }); },
      onCreate: function (name, from) { schemeCall("configSchemeCreate", { name: name, from: from || "current" }); },
      onRename: function (id, name) { schemeCall("configSchemeRename", { id: id, name: name }); },
      onDelete: function (id) { schemeCall("configSchemeDelete", { id: id }); },
    });
  }

  if (cfg.error) return h("div", { className: "wbml-page" }, h(C.Notice, { h: h, kind: "warn", text: cfg.error }));
  if (!cfg.ready) return h("div", { className: "wbml-page" }, h(C.Empty, { h: h, text: lang === "en" ? "Loading settings…" : "正在读取配置…" }));
  if (!cfg.items.length) {
    return h(
      "div",
      { className: "wbml-page" },
      h("h2", null, lang === "en" ? "Mail settings" : "邮件设置"),
      schemeBar(),
      h(C.Empty, { h: h, text: lang === "en" ? "No settings available." : "暂无可配置项。" }),
    );
  }

  var groups = cfg.groups.length ? cfg.groups : [{ id: "", zh: "", en: "" }];
  var overrides = cfg.overrides || {};
  return h(
    "div",
    { className: "wbml-page wbml-config" },
    h(
      "div",
      { className: "wbml-head" },
      h(
        "div",
        null,
        h("h2", null, lang === "en" ? "Mail settings" : "邮件设置"),
        h("p", { className: "wbml-sub" }, schemeNote),
      ),
      h(C.Btn, { h: h, onClick: resetAll }, h(icons.Icon, { name: "refresh-cw", size: 13 }), h("span", null, lang === "en" ? "Restore defaults" : "全部恢复默认")),
    ),
    syncSummary() ? h("p", { className: "wbml-sync-status", role: "status" }, syncSummary()) : null,
    schemeBar(),

    groups.map(function (group) {
      var items = cfg.items.filter(function (item) {
        return item.group === group.id;
      });
      if (!items.length) return null;
      return h(
        "section",
        { className: "wbml-cfg-group", key: group.id || "all" },
        group.zh || group.en ? h("h3", null, lang === "en" ? group.en || group.zh : group.zh || group.en) : null,
        items.map(function (item) {
          var overridden = Object.prototype.hasOwnProperty.call(overrides, item.id);
          return h(
            "div",
            { className: "wbml-cfg-row", key: item.id, "data-config": item.id },
            h(
              "div",
              { className: "wbml-cfg-main" },
              h(
                "span",
                { className: "wbml-cfg-label" },
                labelOf(item),
                overridden ? h("span", { className: "wbml-cfg-badge", title: lang === "en" ? "Changed from default" : "已改动" }, lang === "en" ? "changed" : "已改") : null,
              ),
              hintOf(item) ? h("span", { className: "wbml-cfg-hint" }, hintOf(item)) : null,
            ),
            h("div", { className: "wbml-cfg-ctl" }, control(item)),
          );
        }),
      );
    }),
    toast ? h("div", { className: "wbml-toast", role: "status" }, toast) : null,
  );
};

module.exports.useConfig = function useConfig(React, api, fallback) {
  var fb = fallback || {};
  var s = React.useState({ ready: false, values: Object.assign({}, fb), items: [], groups: [], overrides: {}, error: "", seq: 0 });
  var state = s[0];
  React.useEffect(function () {
    if (typeof document !== "undefined") {
      var old = document.getElementById("wb-addon-mail-config-scheme-css");
      if (old) {
        // 热更新时同步新样式，避免旧样式残留。
        old.textContent = SCHEME_CSS;
      } else {
        var el = document.createElement("style");
        el.id = "wb-addon-mail-config-scheme-css";
        el.textContent = SCHEME_CSS;
        document.head.appendChild(el);
      }
    }
    var alive = true;
    require("../ui/common.cjs")
      .call(api, "mail.configGet")
      .then(function (body) {
        if (!alive) return;
        var values = Object.assign({}, fb, (body && body.values) || {});
        s[1]({
          ready: true,
          values: values,
          items: (body && body.items) || [],
          groups: (body && body.groups) || [],
          overrides: (body && body.overrides) || {},
          error: "",
          state: body,
          seq: 0,
        });
      })
      .catch(function (e) {
        // 读不到配置时按默认值继续用，不让设置页的错误拖垮邮件列表。
        if (!alive) return;
        s[1]({ ready: true, values: Object.assign({}, fb), items: [], groups: [], overrides: {}, error: require("../ui/common.cjs").errText(e), seq: 0 });
      });
    return function () {
      alive = false;
    };
  }, []);
  function setValues(next) {
    if (!next || typeof next !== "object") return;
    s[1](function (prev) {
      return Object.assign({}, prev, { values: Object.assign({}, prev.values, next) });
    });
  }
  function setBody(body) {
    if (!body) return;
    s[1]({
      ready: true,
      values: Object.assign({}, fb, body.values || {}),
      items: body.items || [],
      groups: body.groups || [],
      overrides: body.overrides || {},
      error: "",
      state: body,
    });
  }
  return Object.assign({}, state, { setValues: setValues, setBody: setBody });
};
