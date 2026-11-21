"use strict";
/**
 * 配置视图：按 mail.configGet 返回的 items/groups 动态渲染。
 * 改一项立即写入（mail.configSet），失败保留原值并提示；「全部恢复默认」调
 * mail.configReset。useConfig 同时给邮件视图读「默认加载远程图片」等策略。
 */
module.exports = function Config(props) {
  var h = props.h;
  var React = props.React;
  var api = props.api;
  var lang = props.lang === "en" ? "en" : "zh";
  var C = require("../ui/common.cjs");
  var icons = require("../ui/icons.cjs");
  var cfg = module.exports.useConfig(React, api);
  var toastS = React.useState("");
  var toast = toastS[0];
  var setToast = toastS[1];
  var localS = React.useState({});
  var local = localS[0];
  var setLocal = localS[1];
  // 连续改动会产生并发写入：只让最后一次回包改写权威值。
  var seqRef = React.useRef(0);

  function values() {
    return Object.assign({}, cfg.values, local);
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
      return h(
        "label",
        { className: "wbml-switch" },
        h("input", {
          type: "checkbox",
          checked: value === true,
          "aria-label": labelOf(item),
          onChange: function (e) {
            save(item.id, e.target.checked);
          },
        }),
        h("span", { className: "wbml-switch-text" }, value === true ? (lang === "en" ? "On" : "开启") : lang === "en" ? "Off" : "关闭"),
      );
    }
    if (item.type === "int" || item.type === "number") {
      return h(
        "span",
        { className: "wbml-numwrap" },
        h("input", {
          className: "wbml-input wbml-num",
          type: "number",
          min: item.min,
          max: item.max,
          step: 1,
          value: value === undefined ? "" : value,
          "aria-label": labelOf(item),
          onChange: function (e) {
            var next = Number(e.target.value);
            if (!Number.isFinite(next) || next === value) return;
            save(item.id, next);
          },
        }),
        item.min !== undefined || item.max !== undefined
          ? h("span", { className: "wbml-muted" }, (item.min === undefined ? "" : item.min) + "–" + (item.max === undefined ? "" : item.max))
          : null,
      );
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

  if (cfg.error) return h("div", { className: "wbml-page" }, h(C.Notice, { h: h, kind: "warn", text: cfg.error }));
  if (!cfg.ready) return h("div", { className: "wbml-page" }, h(C.Empty, { h: h, text: lang === "en" ? "Loading settings…" : "正在读取配置…" }));
  if (!cfg.items.length) return h("div", { className: "wbml-page" }, h(C.Empty, { h: h, text: lang === "en" ? "No settings available." : "暂无可配置项。" }));

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
        h("p", { className: "wbml-sub" }, lang === "en" ? "Changes apply immediately and are stored on this machine only (not synced, not backed up)." : "改动即时生效，只存在本机 meta 表（不进同步、不进备份）。"),
      ),
      h(C.Btn, { h: h, onClick: resetAll }, h(icons.Icon, { name: "refresh-cw", size: 13 }), h("span", null, lang === "en" ? "Restore defaults" : "全部恢复默认")),
    ),
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
  return Object.assign({}, state, { setValues: setValues });
};
