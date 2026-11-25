"use strict";
/**
 * 宿主的「数据」与「配置」两个一级视图。
 *
 * 子插件的这两页由各自域提供 dataTables/dataQuery/configGet/configSet；宿主不是
 * 业务插件，对应的元 action 挂在 wb-shell 域下的 wb.* 前缀（见
 * packages/shell/src/actions/host-data.ts）。这里只负责把共享视图接上去：
 * 数据页复用 packages/addons/lib/data-view.cjs，配置页复用共享的开关与数字输入，
 * 不另写一套表格和表单。
 */
var createDataView = require("../../addons/lib/data-view.cjs");
var CloudSettings = require("./cloud-settings.cjs");
var schemes = require("../../addons/lib/config-scheme-bar.cjs");
var SW = require("../../addons/lib/switch.cjs");
var NF = require("../../addons/lib/number-field.cjs");

/**
 * 数据页的目录由宿主 action 下发（wb.dataTables）：宿主内置平台表 + 各业务域声明
 * 或暴露的表，按域分组。页面不再维护一份表名清单——之前这里少了自动化三张表，
 * 与宿主白名单对不上，正是这次收敛掉的问题。
 */
function catalogLoader(api) {
  return api.call("wb.dataTables", {});
}

/** 数据页只读本地配置档位；宿主的「数据」视图不需要落一份展示配置。 */
function useHostDisplayConfig() {
  return { values: { "data.pageSize": 50, "data.showSystemColumns": false, "data.includeDeleted": false }, ready: true };
}

// createDataView 返回的是 { DataView }，这里取组件本身；直接拿工厂返回值当组件会触发
// React #130（元素类型是对象），整页白屏。
var HostDataView = createDataView({
  domain: "wb",
  prefix: "wbh",
  tables: [],
  tablesLoader: catalogLoader,
  useConfig: useHostDisplayConfig,
}).DataView;

function hostApi(api) {
  return {
    call: function (action, args) {
      return api.post("/domains/wb-shell/actions/" + encodeURIComponent(action), args || {});
    },
  };
}

async function configAction(api, action, args, t) {
  var reply = await hostApi(api).call(action, args);
  var body = reply && reply.result !== undefined ? reply.result : reply;
  if (!body || !body.values || reply.ok === false) throw new Error((reply && reply.error) || t("config_read_error"));
  return Object.assign({ ready: true, items: [], overrides: {}, schemes: [] }, body);
}

// 在打开页面时读取一次方案；本次操作的手工调整保留在页面内。
function PreferenceView(props) {
  var React = props.React;
  var state = React.useState(null), prefs = state[0], setPrefs = state[1];
  React.useEffect(function () {
    var active = true;
    configAction(props.api, "wb.configGet", {}, props.t).then(function (data) {
      if (active) setPrefs({ values: data.values });
    }).catch(function (e) {
      if (active) setPrefs({ values: {}, error: String(e.message || e) });
    });
    return function () { active = false; };
  }, []);
  if (!prefs) return React.createElement("div", { className: "wb-msg" }, props.t("loading"));
  return React.createElement(React.Fragment, null,
    prefs.error && React.createElement("div", { className: "wb-err", role: "alert" }, props.t("config_fallback") + " " + prefs.error),
    React.createElement(props.component, Object.assign({}, props, { preferences: prefs.values })));
}

function moduleControl(h, deps, view, item) {
  var ids = view.state.values[item.id];
  var all = !Array.isArray(ids);
  var modules = (deps.addons || []).filter(function (a) { return a.backup && a.backup.export; });
  function save(next) { view.onSave(item.id, next); }
  return h("fieldset", { className: "wbh-modules", disabled: view.busy },
    h("legend", null, deps.t("config_modules")),
    h("label", null, h("input", { type: "checkbox", checked: all, onChange: function (e) {
      save(e.target.checked ? null : modules.map(function (a) { return a.id; }));
    } }), deps.t("config_dynamic_all")),
    modules.map(function (a) { return h("label", { key: a.id }, h("input", {
      type: "checkbox", checked: all || ids.includes(a.id), disabled: all,
      onChange: function (e) { save(e.target.checked ? ids.concat(a.id) : ids.filter(function (id) { return id !== a.id; })); },
    }), a.title || a.id); }));
}

function pageShell(deps, title, desc, body) {
  var jsx = deps.jsx;
  return jsx.jsxs("div", { className: "wb-root", children: [
    jsx.jsxs("div", { className: "wb-inner wb-wide", children: [
      deps.head(title, desc),
      body,
    ] }),
  ] });
}

function dataPage(deps) {
  var jsx = deps.jsx;
  return pageShell(
    deps,
    deps.t("tab_data"),
    deps.t("data_desc"),
    jsx.jsx(HostDataView, { api: hostApi(deps.api), lang: deps.lang }),
  );
}

/**
 * 配置页的纯渲染部分：拿到 state 就直接出界面，方便自测时不用真的发请求。
 * `view` 里带 state/busy/toast 与保存、重置两个回调。
 */
function configBody(deps, view) {
  var jsx = deps.jsx;
  var t = deps.t;
  var h = deps.React.createElement;
  var state = view.state;
  var busy = view.busy;
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
          if (item.id === "backup.moduleIds") {
            control = moduleControl(h, deps, view, item);
          } else if (item.id === "backup.exportFormat") {
            control = h("select", { className: "wb-input", value: state.values[item.id], disabled: busy,
              "aria-label": t("config_format"), onChange: function (e) { view.onSave(item.id, e.target.value); } },
              ["zip", "json", "csv", "txt"].map(function (fmt) { return h("option", { key: fmt, value: fmt }, t("backup_fmt_" + fmt)); }));
          } else if (item.type === "boolean") {
            control = jsx.jsx(SW.Switch, {
              h: h,
              checked: state.values[item.id] === true,
              disabled: busy,
              label: item.label,
              onChange: function (next) { view.onSave(item.id, !!next); },
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
              onCommit: function (next) { view.onSave(item.id, next); },
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
                ? jsx.jsx("button", { type: "button", className: "wb-link", disabled: busy, onClick: function () { view.onReset(item.id); }, children: t("reset_default") })
                : null,
            ] }),
          ] }, item.id);
        }),
      ] }, group);
    });
  }

  return pageShell(deps, t("tab_config"), t("config_desc"), [
    state.ready && !state.error ? jsx.jsx(schemes.SchemeBar, {
      prefix: "wbh", lang: deps.lang, schemes: state.schemes, activeId: state.scheme && state.scheme.id, busy: busy,
      copy: { none: t("config_scheme_none"), defaultHint: t("config_scheme_default"), syncedHint: t("config_scheme_local"),
        confirmDelete: t("config_scheme_delete"), fromDefault: t("config_scheme_from_default") },
      onCreate: function (name, from) { view.onScheme("Create", { name: name, from: from }); },
      onRename: function (id, name) { view.onScheme("Rename", { id: id, name: name }); },
      onDelete: function (id) { view.onScheme("Delete", { id: id }); },
      onActivate: function (id) { view.onScheme("Activate", { id: id }); },
    }, "schemes") : null,
    body,
    jsx.jsx(CloudSettings, { React: deps.React, jsx: jsx, api: deps.api, t: t }, "cloud"),
    view.toast ? jsx.jsx("div", { className: "wb-toast", children: view.toast }) : null,
  ]);
}

function configPage(deps) {
  var React = deps.React;
  var api = deps.api;
  var stateS = React.useState({ ready: false, items: [], values: {}, overrides: {}, error: "" });
  var state = stateS[0], setState = stateS[1];
  var busyS = React.useState(false);
  var busy = busyS[0], setBusy = busyS[1];
  var toastS = React.useState("");
  var toast = toastS[0], setToast = toastS[1];
  React.useEffect(function () {
    var active = true;
    configAction(api, "wb.configGet", {}, deps.t).then(function (data) {
      if (active) setState(data);
    }).catch(function (e) {
      if (active) setState({ ready: true, error: String(e.message || e) });
    });
    return function () { active = false; };
  }, []);

  async function mutate(action, args) {
    setBusy(true);
    try {
      setState(await configAction(api, action, args, deps.t));
      setToast(deps.t("config_saved"));
    } catch (e) { setToast(String(e.message || e)); }
    finally { setBusy(false); }
  }
  return configBody(deps, { state: state, busy: busy, toast: toast,
    onSave: function (id, value) { return mutate("wb.configSet", { values: { [id]: value } }); },
    onReset: function (id) { return mutate("wb.configReset", { ids: [id] }); },
    onScheme: function (verb, args) { return mutate("wb.configScheme" + verb, args); },
  });
}

/**
 * 组件外壳：路由分支渲染 ConfigView，而不是直接调用 configPage()，
 * 否则页面 hooks 会挂到 WorkbenchPage 上，切路由时抛 React #310。
 */
function ConfigView(props) {
  return configPage(props);
}

module.exports = { PreferenceView: PreferenceView, dataPage: dataPage, configPage: configPage, configBody: configBody, ConfigView: ConfigView, DataView: HostDataView, hostApi: hostApi };
