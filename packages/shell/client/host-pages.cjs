"use strict";
/**
 * 宿主的「数据」与「配置」两个一级视图。
 *
 * 子插件的这两页由各自域提供 dataTables/dataQuery/configGet/configSet；宿主不是
 * 业务插件，对应的元 action 挂在 wb-shell 域下的 wb.* 前缀（见
 * packages/shell/lib/actions/host-data.js）。这里只负责把共享视图接上去：
 * 数据页复用 packages/addons/lib/data-view.cjs，配置页复用共享的开关与数字输入，
 * 不另写一套表格和表单。
 */
var createDataView = require("../../addons/lib/data-view.cjs");
var SW = require("../../addons/lib/switch.cjs");
var NF = require("../../addons/lib/number-field.cjs");

var HOST_TABLES = ["meta", "sync_change_log", "conflict_shadow", "sync_dead_letter", "sync_state", "session_mode", "audit_log"];

/** 数据页只读本地配置档位；宿主的「数据」视图不需要落一份展示配置。 */
function useHostDisplayConfig() {
  return { values: { "data.pageSize": 50, "data.showSystemColumns": false, "data.includeDeleted": false }, ready: true };
}

var HostDataView = createDataView({
  domain: "wb",
  prefix: "wbh",
  tables: HOST_TABLES,
  useConfig: useHostDisplayConfig,
});

function hostApi(api) {
  return {
    call: function (action, args) {
      return api.post("/domains/wb-shell/actions/" + encodeURIComponent(action), args || {});
    },
  };
}

function dataPage(deps) {
  var jsx = deps.jsx;
  var api = deps.api;
  var lang = deps.lang;
  var head = deps.head;
  var t = deps.t;
  return jsx.jsxs("div", { className: "wb-root", children: [
    jsx.jsxs("div", { className: "wb-inner wb-wide", children: [
      head(t("tab_data"), t("data_desc")),
      jsx.jsx(HostDataView, { api: hostApi(api), lang: lang }),
    ] }),
  ] });
}

function configPage(deps) {
  var jsx = deps.jsx;
  var React = deps.React;
  var api = deps.api;
  var t = deps.t;
  var head = deps.head;
  var h = deps.React.createElement;
  var stateS = React.useState({ ready: false, items: [], values: {}, overrides: {}, error: "" });
  var state = stateS[0], setState = stateS[1];
  var busyS = React.useState(false);
  var busy = busyS[0], setBusy = busyS[1];
  var toastS = React.useState("");
  var toast = toastS[0], setToast = toastS[1];
  var host = hostApi(api);

  function load() {
    Promise.resolve(host.call("wb.configGet"))
      .then(function (r) {
        var body = r && r.result !== undefined ? r.result : r;
        if (r && r.ok === false) throw new Error((r && r.error) || "读取配置失败");
        if (!body || !body.values) throw new Error("读取配置失败");
        setState({ ready: true, items: body.items || [], values: body.values, overrides: body.overrides || {}, error: "" });
      })
      .catch(function (e) {
        setState({ ready: true, items: [], values: {}, overrides: {}, error: String((e && e.message) || e) });
      });
  }

  React.useEffect(function () { load(); }, []);

  function save(id, value) {
    setBusy(true);
    var patch = {};
    patch[id] = value;
    Promise.resolve(host.call("wb.configSet", { values: patch }))
      .then(function (r) {
        if (r && r.ok === false) throw new Error((r && r.error) || "保存失败");
        var body = r && r.result !== undefined ? r.result : r;
        setState(function (prev) {
          return Object.assign({}, prev, { values: body.values, overrides: body.overrides });
        });
        setToast("已保存：" + id);
        setTimeout(function () { setToast(""); }, 1600);
      })
      .catch(function (e) { setToast("保存失败：" + String((e && e.message) || e)); })
      .then(function () { setBusy(false); });
  }

  function reset(id) {
    setBusy(true);
    Promise.resolve(host.call("wb.configReset", { ids: [id] }))
      .then(function (r) {
        if (r && r.ok === false) throw new Error((r && r.error) || "重置失败");
        var body = r && r.result !== undefined ? r.result : r;
        setState(function (prev) {
          return Object.assign({}, prev, { values: body.values, overrides: body.overrides });
        });
        setToast("已恢复默认：" + id);
        setTimeout(function () { setToast(""); }, 1600);
      })
      .catch(function (e) { setToast("重置失败：" + String((e && e.message) || e)); })
      .then(function () { setBusy(false); });
  }

  var body;
  if (state.error) body = jsx.jsx("div", { className: "wb-err", children: state.error });
  else if (!state.ready) body = jsx.jsx("div", { className: "wb-msg", children: t("loading") });
  else {
    var groups = [];
    state.items.forEach(function (item) {
      var group = item.group || "通用";
      if (groups.indexOf(group) < 0) groups.push(group);
    });
    body = groups.map(function (group) {
      return jsx.jsxs("div", { className: "wb-card", children: [
        jsx.jsx("div", { className: "wb-card-head", children: jsx.jsx("h3", { children: group }) }),
        state.items.filter(function (item) { return (item.group || "通用") === group; }).map(function (item) {
          var overridden = state.overrides[item.id] !== undefined;
          var control;
          if (item.type === "boolean") {
            control = jsx.jsx(SW.Switch, {
              h: h,
              checked: state.values[item.id] === true,
              disabled: busy,
              label: item.label,
              onChange: function (next) { save(item.id, !!next); },
            });
          } else {
            control = jsx.jsx(NF.NumberField, {
              h: h,
              lang: deps.lang,
              integer: true,
              value: state.values[item.id],
              min: item.min,
              max: item.max,
              step: item.step || 1,
              disabled: busy,
              label: item.label,
              onCommit: function (next) { save(item.id, next); },
            });
          }
          return jsx.jsxs("div", { className: "wbh-config-row", children: [
            jsx.jsxs("div", { className: "wbh-config-text", children: [
              jsx.jsx("div", { className: "wbh-config-label", children: item.label }),
              jsx.jsx("div", { className: "wb-hint", children: item.description || "" }),
            ] }),
            jsx.jsxs("div", { className: "wbh-config-ctl", children: [
              control,
              overridden
                ? jsx.jsx("button", { type: "button", className: "wb-link", disabled: busy, onClick: function () { reset(item.id); }, children: t("reset_default") })
                : null,
            ] }),
          ] }, item.id);
        }),
      ] }, group);
    });
  }

  return jsx.jsxs("div", { className: "wb-root", children: [
    jsx.jsxs("div", { className: "wb-inner wb-wide", children: [
      head(t("tab_config"), t("config_desc")),
      body,
      toast ? jsx.jsx("div", { className: "wb-toast", children: toast }) : null,
    ] }),
  ] });
}

module.exports = { dataPage: dataPage, configPage: configPage };
