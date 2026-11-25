"use strict";
/**
 * 宿主「插件」页：每个工作台插件一行，显示自报版本、DSH 记录的已装版本与声明的 npm 更新来源，
 * 并提供「检查更新」「升级」。所有动作都走宿主 action（host.addons.*），页面只做展示与触发：
 *
 * - 安装由 DSH 的插件管理器执行（和插件市场同一条路径，自带占用与兼容检查），所以这里不再
 *   自己拼 profile、也不碰 node_modules；返回 restart-required 时明确写「需要重启 DSH」。
 * - 环境里没有插件管理器时（例如纯本地调试），降级为显示可复制的 `dsh plugin add` 命令，
 *   同样写清要重启。
 * - 本地 link / 路径安装的包管理器不让自动升级，这里照实写「本地安装」，不把英文原因甩给用户。
 *
 * 单独成文件，避免 client.src.cjs 越过单文件 600 行红线。
 */
var common = require("../../addons/lib/client-common.cjs")("wb");

module.exports = function addonsPage(deps) {
  var jsx = deps.jsx;
  var React = deps.React;
  var api = deps.api;
  var t = deps.t;
  var Btn = common.Btn;
  var Notice = common.Notice;
  var call = common.call;
  var errText = common.errText;

  /** 复制文本：用 navigator.clipboard，失败时退回提示，不静默失败。 */
  function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    } catch (e) { /* 落回下方 */ }
    return Promise.reject(new Error("clipboard unavailable"));
  }

  /** 更新来源：有声明显示包名，没声明/有问题分别给短说明，都不占到正文以外的地方。 */
  function SourceCell(props) {
    var row = props.row;
    if (row.problem) return jsx.jsx("span", { className: "wb-addons-tag bad", title: row.problem, children: t("plugins_problem") });
    if (!row.update) return jsx.jsx("span", { className: "wb-addons-dim", children: t("plugins_no_source") });
    return jsx.jsxs("span", { className: "wb-addons-source", children: [
      jsx.jsx("span", { className: "wb-addons-tag", children: "npm" }),
      jsx.jsx("span", { className: "wb-addons-mono", children: row.update.package }),
    ] });
  }

  /** 版本：自报值与已装值分两行，避免一列里塞三四个数字看不清。 */
  function VersionCell(props) {
    var row = props.row;
    return jsx.jsxs("span", { className: "wb-addons-vers", children: [
      jsx.jsx("span", { className: "wb-addons-mono", children: row.version || "—" }),
      jsx.jsx("span", {
        className: "wb-addons-dim",
        children: (row.installed && row.installed !== row.version ? t("plugins_col_installed") + " " + row.installed : t("plugins_col_installed") + " " + (row.installed || t("plugins_not_installed"))),
      }),
    ] });
  }

  function AddonsBody() {
    var state = React.useState({ loading: true, error: "", data: null });
    var snap = state[0];
    var setSnap = state[1];
    // 每行各自的进度与结果，互不影响：一行查失败不该让整页变红。
    var rowState = React.useState({});
    var rows = rowState[0];
    var setRows = rowState[1];
    var noticeState = React.useState({ kind: "info", text: "" });
    var notice = noticeState[0];
    var setNotice = noticeState[1];

    var load = function () {
      setSnap({ loading: true, error: "", data: null });
      call(api, "host.addons.list", {})
        .then(function (data) { setSnap({ loading: false, error: "", data: data }); })
        .catch(function (e) { setSnap({ loading: false, error: errText(e), data: null }); });
    };
    React.useEffect(function () { load(); }, []);

    function setRow(id, patch) {
      setRows(function (prev) {
        var next = Object.assign({}, prev);
        next[id] = Object.assign({}, prev[id] || {}, patch);
        return next;
      });
    }

    function checkOne(row) {
      setRow(row.id, { busy: "checking", text: "", tone: "" });
      call(api, "host.addons.versions", { id: row.id })
        .then(function (data) {
          if (data && data.status === "listed" && data.versions && data.versions.length) {
            var versions = data.versions.map(function (item) { return String(item.version); });
            var latest = versions[0];
            // 只报告，不自动装：版本列表交给用户自己挑，切换动作要再点一次确认。
            setRow(row.id, {
              busy: "",
              latest: latest,
              canSwitch: data.canSwitch !== false,
              versions: versions,
              pick: versions.indexOf(row.installed || "") >= 0 ? row.installed : latest,
              text: latest !== row.installed ? t("plugins_newer") + " " + latest : t("plugins_latest"),
              tone: latest !== row.installed ? "warn" : "ok",
            });
          } else if (data && data.status === "listed") {
            setRow(row.id, { busy: "", latest: "", text: t("plugins_latest"), tone: "ok" });
          } else {
            setRow(row.id, {
              busy: "",
              text: (data && (data.problemText || data.reason || data.problem)) || t("plugins_failed"),
              detail: (data && data.reason) || "",
              tone: "muted",
            });
          }
        })
        .catch(function (e) { setRow(row.id, { busy: "", text: errText(e), tone: "error" }); });
    }

    function installOne(row, version) {
      setRow(row.id, { busy: "installing", text: "", tone: "" });
      call(api, "host.addons.install", version ? { id: row.id, version: version } : { id: row.id })
        .then(function (data) {
          var text = (data && data.nextStep) || t("plugins_failed");
          var tone = data && data.restartRequired ? "warn" : data && data.changed ? "ok" : "error";
          setRow(row.id, { busy: "", text: text, tone: tone, latest: "" });
          setNotice({ kind: tone, text: row.title + "：" + text });
          // 装完重新读一次列表：已装版本与 managed 状态都变了。
          call(api, "host.addons.list", {})
            .then(function (fresh) { setSnap({ loading: false, error: "", data: fresh }); })
            .catch(function () { /* 列表刷新失败不影响这次的安装结论 */ });
        })
        .catch(function (e) {
          setRow(row.id, { busy: "", text: errText(e), tone: "error" });
          setNotice({ kind: "error", text: row.title + "：" + errText(e) });
        });
    }

    function checkAll() {
      setNotice({ kind: "info", text: t("plugins_checking") });
      call(api, "host.addons.checkUpdates", {})
        .then(function (data) {
          var patch = {};
          var seen = {};
          var updates = (data && data.updates) || [];
          var problems = (data && data.problems) || [];
          updates.forEach(function (item) {
            seen[item.id] = true;
            patch[item.id] = { busy: "", latest: item.latest, text: t("plugins_newer") + " " + item.latest, tone: "warn" };
          });
          problems.forEach(function (item) {
            seen[item.id] = true;
            patch[item.id] = { busy: "", latest: "", text: item.problemText || item.problem || t("plugins_failed"), detail: item.detail || "", tone: "muted" };
          });
          ((data && data.addons) || []).forEach(function (row) {
            if (seen[row.id] || !row.update) return;
            patch[row.id] = { busy: "", latest: "", text: t("plugins_latest"), tone: "ok" };
          });
          if (Object.keys(patch).length) setRows(function (prev) { return Object.assign({}, prev, patch); });
          if (!data || !data.supported) {
            setNotice({ kind: "warn", text: (data && data.note) || t("plugins_manual") });
            return;
          }
          setNotice({
            kind: updates.length ? "warn" : "ok",
            text: updates.length ? t("plugins_updates_found") + " " + updates.length : t("plugins_latest"),
          });
        })
        .catch(function (e) { setNotice({ kind: "error", text: errText(e) }); });
    }

    var list = (snap.data && snap.data.addons) || [];
    var supported = !!(snap.data && snap.data.supported);
    var updatable = list.filter(function (row) { return row.update && supported && !row.local; }).length;

    var bar = jsx.jsxs("div", { className: "wb-addons-bar", children: [
      jsx.jsxs("div", { className: "wb-addons-stats", children: [
        jsx.jsxs("span", { className: "wb-addons-stat", children: [jsx.jsx("b", { children: String(list.length) }), t("plugins_stat_total")] }),
        supported ? jsx.jsxs("span", { className: "wb-addons-stat", children: [jsx.jsx("b", { children: String(updatable) }), t("plugins_stat_updatable")] }) : null,
      ] }),
      jsx.jsx("button", {
        type: "button", className: "wb-btn", onClick: checkAll, disabled: !supported || !list.length,
        children: t("plugins_check_all"),
      }),
    ] });

    var body;
    if (snap.loading) {
      body = jsx.jsx("div", { className: "wb-msg", role: "status", children: t("plugins_loading") });
    } else if (snap.error) {
      body = jsx.jsxs("div", { className: "wb-addons-error", children: [
        jsx.jsx("div", { className: "wb-err", role: "alert", children: snap.error }),
        jsx.jsx(Btn, { h: jsx.jsx, kind: "ghost", children: t("plugins_retry"), onClick: load }),
      ] });
    } else if (!list.length) {
      body = jsx.jsx("div", { className: "wb-msg wb-empty-cta", children: t("plugins_no_source") });
    } else {
      body = jsx.jsxs("div", { className: "wb-addons-tablewrap", children: [
        jsx.jsxs("table", { className: "wb-addons-table", "data-addons-table": "1", children: [
          jsx.jsx("thead", { children: jsx.jsx("tr", { children: [
            jsx.jsx("th", { children: t("plugins_col_name") }),
            jsx.jsx("th", { children: t("plugins_col_version") }),
            jsx.jsx("th", { children: t("plugins_col_source") }),
            jsx.jsx("th", { children: t("plugins_col_status") }),
            jsx.jsx("th", { className: "wb-addons-col-actions", children: t("plugins_col_actions") }),
          ] }) }),
          jsx.jsx("tbody", { children: list.map(function (row) {
            var live = rows[row.id] || {};
            var busy = live.busy === "checking" || live.busy === "installing";
            var actions = [];
            if (row.update && supported) {
              actions.push(jsx.jsx(Btn, {
                h: jsx.jsx, key: "check", kind: "ghost", disabled: busy,
                children: live.busy === "checking" ? t("plugins_checking") : t("plugins_check"),
                onClick: function () { checkOne(row); },
              }));
              if (live.versions && live.versions.length) {
                actions.push(jsx.jsx("select", {
                  className: "wb-addons-vsel",
                  key: "vsel",
                  "aria-label": t("plugins_versions"),
                  value: live.pick || live.versions[0],
                  disabled: busy,
                  onChange: function (e) { setRow(row.id, { pick: e.target.value }); },
                  children: live.versions.map(function (version) {
                    var current = version === row.installed;
                    return jsx.jsx("option", { value: version, children: current ? version + " · " + t("plugins_current") : version, key: version });
                  }),
                }));
                var switchable = live.canSwitch !== false && !busy && (live.pick || live.versions[0]) !== row.installed;
                actions.push(jsx.jsx(Btn, {
                  h: jsx.jsx, key: "install", disabled: !switchable,
                  title: live.canSwitch === false ? t("plugins_local") : "",
                  children: live.busy === "installing" ? t("plugins_installing") : t("plugins_switch"),
                  onClick: function () { installOne(row, live.pick || live.versions[0]); },
                }));
              }
            }
            if (row.command) {
              actions.push(jsx.jsx(Btn, {
                h: jsx.jsx,
                key: "copy",
                kind: "ghost",
                children: row.local ? t("plugins_copy_upgrade") : t("plugins_copy"),
                title: row.command,
                onClick: function () {
                  copyText(row.command).then(function () {
                    setNotice({ kind: "ok", text: t("plugins_copied"), command: row.command });
                  }).catch(function () {
                    // 浏览器不给剪贴板时也要能用：把命令原样显示出来，用户自己选中复制。
                    setNotice({ kind: "warn", text: t("plugins_copy_failed"), command: row.command });
                  });
                },
              }));
            }
            var statusText = live.text || (row.local ? t("plugins_local") : "");
            var tone = live.tone || (row.local ? "muted" : "");
            return jsx.jsxs("tr", { "data-addon-row": row.id, children: [
              jsx.jsxs("td", { children: [
                jsx.jsx("div", { className: "wb-addons-name", children: row.title }),
                jsx.jsx("div", { className: "wb-addons-id", children: row.id }),
              ] }),
              jsx.jsx("td", { children: jsx.jsx(VersionCell, { row: row }) }),
              jsx.jsx("td", { children: jsx.jsx(SourceCell, { row: row }) }),
              jsx.jsx("td", { children: statusText
                ? jsx.jsx("span", { className: "wb-addons-status" + (tone ? " " + tone : ""), title: live.detail || "", "data-addon-status": row.id, children: statusText })
                : jsx.jsx("span", { className: "wb-addons-dim", "data-addon-status": row.id, children: "—" }) }),
              jsx.jsx("td", { className: "wb-addons-col-actions", children: jsx.jsx("div", { className: "wb-actions", children: actions }) }),
            ] }, row.id);
          }) }),
        ] }),
      ] });
    }

    return jsx.jsxs("div", { className: "wb-addons", children: [
      supported ? null : jsx.jsx(Notice, { h: jsx.jsx, kind: "warn", text: (snap.data && snap.data.note) || t("plugins_manual") }),
      bar,
      notice.text ? jsx.jsxs("div", {
        className: "wb-notice " + (notice.kind === "ok" ? "ok" : notice.kind === "warn" ? "warn" : notice.kind === "error" ? "error" : "info"),
        children: [
          jsx.jsx("span", { children: notice.text }),
          notice.command ? jsx.jsx("code", { className: "wb-addons-cmd", children: notice.command }) : null,
        ],
      }) : null,
      body,
    ] });
  }

  return jsx.jsxs("div", { className: "wb-root", children: [
    jsx.jsxs("div", { className: "wb-inner wb-wide", children: [
      deps.head(t("tab_addons"), t("addons_desc")),
      jsx.jsx(AddonsBody, {}),
    ] }),
  ] });
};
