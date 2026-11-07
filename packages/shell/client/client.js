// dsh-workbench 客户端：React 组件注入 settings.plugins.tab。
// 与宿主打包器产物同构：window.__ModuleLoader__.load({id, factory})；require 由宿主提供 react/jsx-runtime。
(function () {
  window.__ModuleLoader__ = window.__ModuleLoader__ || { modules: {}, load: function (m) { this.modules[m.id] = m.factory; } };
  window.__ModuleLoader__.load({
    id: "dsh-workbench",
    factory: function (require) {
      "use strict";
      var react = require("react");
      var jsx = require("react/jsx-runtime");
      var h = react.createElement;
      var NS = "workbench";

      var LOCALE = {
        zh: {
          nav: "个人工作台", title: "个人工作台", tagline: "离线优先 · 登录即同步",
          tab_tasks: "任务记录", tab_account: "账号与同步", tab_addons: "子插件",
          new_task: "新建任务", task_title: "任务标题", priority: "优先级", p1: "高", p2: "中", p3: "低",
          due: "截止日期", create: "创建", empty: "还没有任务 — 在上方输入框记一条",
          open: "进行中", doing: "稍后", done: "已完成", overdue_badge: "逾期",
          stats_open: "待办", stats_done: "完成", stats_overdue: "逾期",
          login: "登录", signup: "注册", email: "邮箱", password: "密码", logout: "退出登录",
          logged_in_as: "已登录", not_logged_in: "未登录——数据仅存本机 SQLite",
          sync_now: "立即同步", sync_pushed: "推送", sync_pulled: "拉取", device_name: "本设备",
          addons_from_cloud: "云端目录中的子插件", install: "安装", installed: "已安装", coming_soon: "demo：安装通道开发中",
        },
        en: {
          nav: "Workbench", title: "Personal Workbench", tagline: "Offline-first · Sync on login",
          tab_tasks: "Tasks", tab_account: "Account & Sync", tab_addons: "Addons",
          new_task: "New task", task_title: "Task title", priority: "Priority", p1: "High", p2: "Medium", p3: "Low",
          due: "Due date", create: "Create", empty: "Nothing here yet — add a task above",
          open: "Open", doing: "Doing", done: "Done", overdue_badge: "overdue",
          stats_open: "open", stats_done: "done", stats_overdue: "overdue",
          login: "Login", signup: "Sign up", email: "Email", password: "Password", logout: "Log out",
          logged_in_as: "Signed in", not_logged_in: "Not signed in — data stays local",
          sync_now: "Sync now", sync_pushed: "pushed", sync_pulled: "pulled", device_name: "This device",
          addons_from_cloud: "Addons from cloud catalog", install: "Install", installed: "Installed", coming_soon: "demo: install channel in progress",
        },
      };

      // 样式：只用宿主 --dsw-* token，深浅主题自适应（03 文档）
      var CSS = [
        ".wb-root{display:flex;flex-direction:column;gap:0;height:100%;min-height:0;color:var(--dsw-alias-text-primary,#e8e8e8);max-width:880px;margin:0 auto;width:100%;padding:28px 24px 40px;box-sizing:border-box}",
        ".wb-hero{display:flex;align-items:baseline;gap:12px;margin-bottom:14px}",
        ".wb-hero h2{margin:0;font-size:22px;font-weight:700;letter-spacing:.5px}",
        ".wb-tag{font-size:12px;color:var(--dsw-alias-text-tertiary,#888)}",
        ".wb-tabs{display:flex;gap:4px;border-bottom:1px solid var(--dsw-alias-border,#333);padding-bottom:0;margin-bottom:14px}",
        ".wb-tab{border:none;background:transparent;color:var(--dsw-alias-text-secondary,#999);padding:9px 16px;cursor:pointer;font-size:14px;border-bottom:2px solid transparent;margin-bottom:-1px;border-radius:0;transition:color .15s}",
        ".wb-tab:hover{color:var(--dsw-alias-text-primary,#eee)}",
        ".wb-tab.on{background:transparent;color:var(--dsw-alias-accent,#3b82f6);border-bottom-color:var(--dsw-alias-accent,#3b82f6);font-weight:600}",
        ".wb-card{background:var(--dsw-alias-bg-base,#1e1e1e);border:1px solid var(--dsw-alias-border,#333);border-radius:14px;padding:18px}",
        ".wb-form{display:flex;gap:8px;align-items:stretch;background:var(--dsw-alias-bg-base,#1e1e1e);border:1px solid var(--dsw-alias-border,#333);border-radius:14px;padding:10px;margin-bottom:16px}",
        ".wb-input,.wb-select{background:var(--dsw-alias-bg-input,#141414);color:inherit;border:1px solid var(--dsw-alias-border,#3a3a3a);border-radius:9px;padding:9px 12px;font-size:13px;outline:none;transition:border-color .15s}",
        ".wb-input:focus,.wb-select:focus{border-color:var(--dsw-alias-accent,#3b82f6)}",
        ".wb-btn{background:var(--dsw-alias-accent,#3b82f6);color:#fff;border:none;border-radius:9px;padding:9px 18px;cursor:pointer;font-size:13px;font-weight:600;transition:filter .15s}",
        ".wb-btn:hover{filter:brightness(1.12)}",
        ".wb-btn.ghost{background:transparent;border:1px solid var(--dsw-alias-border,#444);color:inherit;font-weight:400}",
        ".wb-cardlist{background:var(--dsw-alias-bg-base,#1e1e1e);border:1px solid var(--dsw-alias-border,#333);border-radius:14px;padding:12px}"
        ,".wb-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;overflow:auto}",
        ".wb-item{display:flex;align-items:center;gap:12px;padding:13px 16px;border:1px solid var(--dsw-alias-border,#2f2f2f);border-radius:12px;background:var(--dsw-alias-bg-base,#202020);transition:border-color .15s}",
        ".wb-item:hover{border-color:var(--dsw-alias-border-strong,#4a4a4a)}",
        ".wb-item.done{opacity:.6}",
        ".wb-item.done .wb-t{text-decoration:line-through}",
        ".wb-p{font-size:11px;padding:3px 9px;border-radius:99px;font-weight:600;min-width:34px;text-align:center}",
        ".wb-p1{color:#ff6b6b;background:rgba(255,107,107,.12)}",
        ".wb-p2{color:#f5a623;background:rgba(245,166,35,.12)}",
        ".wb-p3{color:#8a93a2;background:rgba(138,147,162,.12)}",
        ".wb-t{flex:1;font-size:14px;line-height:1.4}",
        ".wb-due{font-size:11px;color:var(--dsw-alias-text-tertiary,#888)}",
        ".wb-due.bad{color:#ff6b6b;font-weight:600}",
        ".wb-stats{display:flex;gap:10px;margin-top:14px}",
        ".wb-stat{flex:1;background:var(--dsw-alias-bg-base,#1e1e1e);border:1px solid var(--dsw-alias-border,#333);border-radius:12px;padding:12px 16px;display:flex;flex-direction:column;gap:2px}",
        ".wb-stat b{font-size:20px;font-weight:700}",
        ".wb-stat span{font-size:11px;color:var(--dsw-alias-text-tertiary,#888)}",
        ".wb-stat.open b{color:var(--dsw-alias-accent,#3b82f6)}",
        ".wb-stat.done b{color:#4ade80}",
        ".wb-stat.late b{color:#ff6b6b}",
        ".wb-check{cursor:pointer;width:17px;height:17px;accent-color:var(--dsw-alias-accent,#3b82f6);flex:none}",
        ".wb-del{background:none;border:none;color:var(--dsw-alias-text-tertiary,#666);cursor:pointer;font-size:15px;padding:4px;border-radius:6px;flex:none}",
        ".wb-del:hover{color:#ff6b6b;background:rgba(255,107,107,.1)}",
        ".wb-msg{font-size:13px;color:var(--dsw-alias-text-secondary,#999);padding:26px 0;text-align:center}",
        ".wb-empty-cta{padding:34px 0}",
        ".wb-addon{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:13px 16px;border:1px solid var(--dsw-alias-border,#2f2f2f);border-radius:12px;background:var(--dsw-alias-bg-base,#202020)}",
        ".wb-addon+.wb-addon{margin-top:8px}",
        ".wb-addon-meta{font-size:11px;color:var(--dsw-alias-text-tertiary,#888);margin-top:3px}",
      ].join("\n");

      function useApi() {
        var base = "/workbench/api";
        return react.useMemo(function () {
          return {
            get: function (p) { return fetch(base + p).then(function (r) { return r.json(); }); },
            post: function (p, b) { return fetch(base + p, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b || {}) }).then(function (r) { return r.json(); }); },
            patch: function (p, b) { return fetch(base + p, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(b) }).then(function (r) { return r.json(); }); },
            del: function (p) { return fetch(base + p, { method: "DELETE" }).then(function (r) { return r.json(); }); },
          };
        }, []);
      }

      function TasksTab(props) { var t = props.t;
        var api = useApi();
        var st = react.useState([]); var tasks = st[0]; var setTasks = st[1];
        var st2 = react.useState(null); var stats = st2[0]; var setStats = st2[1];
        var st3 = react.useState(""); var title = st3[0]; var setTitle = st3[1];
        var st4 = react.useState(2); var prio = st4[0]; var setPrio = st4[1];
        var st5 = react.useState(""); var due = st5[0]; var setDue = st5[1];
        function refresh() {
          api.get("/tasks").then(function (r) { if (r.ok) { setTasks(r.tasks); setStats(r.stats); } });
        }
        react.useEffect(function () { refresh(); }, []);
        // SSE：任意来源（agent 工具/其它窗口）的变更实时到达
        react.useEffect(function () {
          var es = new EventSource("/workbench/api/events");
          es.addEventListener("tasks-changed", refresh);
          es.addEventListener("sync-done", refresh);
          return function () { es.close(); };
        }, [refresh]);
        function add() {
          if (!title.trim()) return;
          api.post("/tasks", { title: title.trim(), priority: Number(prio), due_at: due ? new Date(due + "T23:59:59").getTime() : null }).then(function () { setTitle(""); setDue(""); refresh(); });
        }
        var now = Date.now();
        return jsx.jsxs("div", { children: [
          jsx.jsxs("div", { className: "wb-form", children: [
            jsx.jsx("input", { className: "wb-input", style: { flex: 1, minWidth: 160 }, placeholder: t("task_title"), value: title, onChange: function (e) { setTitle(e.target.value); }, onKeyDown: function (e) { if (e.key === "Enter") add(); } }),
            jsx.jsxs("select", { className: "wb-select", value: prio, onChange: function (e) { setPrio(e.target.value); }, children: [
              jsx.jsx("option", { value: 1, children: t("p1") }), jsx.jsx("option", { value: 2, children: t("p2") }), jsx.jsx("option", { value: 3, children: t("p3") })] }),
            jsx.jsx("input", { className: "wb-input", type: "date", value: due, onChange: function (e) { setDue(e.target.value); }, title: t("due") }),
            jsx.jsx("button", { className: "wb-btn", onClick: add, children: t("create") }),
          ] }),
          jsx.jsx("ul", { className: "wb-list wb-cardlist", children: tasks.length === 0 ? jsx.jsx("li", { className: "wb-msg wb-empty-cta", children: t("empty") }) : tasks.map(function (tk) {
            var done = tk.status === "done";
            var bad = !done && tk.due_at && tk.due_at < now;
            return jsx.jsxs("li", { className: "wb-item" + (done ? " done" : ""), children: [
              jsx.jsx("input", { className: "wb-check", type: "checkbox", checked: done, onChange: function () { api.patch("/tasks/" + tk.id, { status: done ? "open" : "done" }).then(refresh); } }),
              jsx.jsx("span", { className: "wb-p wb-p" + tk.priority, children: "P" + tk.priority }),
              jsx.jsx("span", { className: "wb-t", children: tk.title }),
              tk.due_at ? jsx.jsx("span", { className: "wb-due" + (bad ? " bad" : ""), children: new Date(tk.due_at).toLocaleDateString("zh-CN") + (bad ? " · " + t("overdue_badge") : "") }) : null,
              jsx.jsx("button", { className: "wb-del", title: "delete", onClick: function () { api.del("/tasks/" + tk.id).then(refresh); }, children: "✕" }),
            ] }, tk.id);
          }) }),
          stats ? jsx.jsxs("div", { className: "wb-stats", children: [
            jsx.jsxs("div", { className: "wb-stat open", children: [jsx.jsx("b", { children: stats.open }), jsx.jsx("span", { children: t("stats_open") })] }),
            jsx.jsxs("div", { className: "wb-stat done", children: [jsx.jsx("b", { children: stats.done }), jsx.jsx("span", { children: t("stats_done") })] }),
            jsx.jsxs("div", { className: "wb-stat late", children: [jsx.jsx("b", { children: stats.overdue || 0 }), jsx.jsx("span", { children: t("stats_overdue") })] }),
          ] }) : null,
        ] });
      }

      function AccountTab(props) { var t = props.t;
        var api = useApi();
        var st = react.useState(null); var me = st[0]; var setMe = st[1];
        var st2 = react.useState({ email: "", password: "", signup: false }); var form = st2[0]; var setForm = st2[1];
        var st3 = react.useState(""); var msg = st3[0]; var setMsg = st3[1];
        var st4 = react.useState(false); var syncing = st4[0]; var setSyncing = st4[1];
        react.useEffect(function () { api.get("/account").then(function (r) { setMe(r); }); }, []);
        function refresh() { api.get("/account").then(function (r) { setMe(r); }); }
        function submit() {
          api.post("/account/login", { email: form.email, password: form.password, signup: form.signup }).then(function (r) {
            setMsg(r.ok ? "" : (r.error || "failed")); refresh();
          });
        }
        if (!me) return jsx.jsx("div", { className: "wb-card", children: jsx.jsx("span", { className: "wb-msg", children: "…" }) });
        if (!me.logged_in) {
          return jsx.jsxs("div", { className: "wb-card", children: [
            jsx.jsx("div", { className: "wb-msg", style: { marginBottom: 10 }, children: t("not_logged_in") }),
            jsx.jsxs("div", { className: "wb-form", children: [
              jsx.jsx("input", { className: "wb-input", placeholder: t("email"), value: form.email, onChange: function (e) { setForm(Object.assign({}, form, { email: e.target.value })); } }),
              jsx.jsx("input", { className: "wb-input", type: "password", placeholder: t("password"), value: form.password, onChange: function (e) { setForm(Object.assign({}, form, { password: e.target.value })); }, onKeyDown: function (e) { if (e.key === "Enter") submit(); } }),
              jsx.jsx("label", { className: "wb-msg", children: jsx.jsxs("span", { children: [
                jsx.jsx("input", { type: "checkbox", checked: form.signup, onChange: function (e) { setForm(Object.assign({}, form, { signup: e.target.checked })); } }), " ", t("signup") ] }) }),
              jsx.jsx("button", { className: "wb-btn", onClick: submit, children: form.signup ? t("signup") : t("login") }),
            ] }),
            msg ? jsx.jsx("div", { className: "wb-msg err", style: { marginTop: 8 }, children: msg }) : null,
          ] });
        }
        return jsx.jsxs("div", { className: "wb-card", children: [
          jsx.jsxs("div", { children: [t("logged_in_as"), " ", me.user ? me.user.email : "", " (", t("device_name"), ")"] }),
          jsx.jsxs("div", { className: "wb-form", style: { marginTop: 10 }, children: [
            jsx.jsx("button", { className: "wb-btn", disabled: syncing, onClick: function () { setSyncing(true); api.post("/sync/now").then(function (r) { setSyncing(false); setMsg(r.ok ? t("sync_pushed") + " " + r.pushed + " · " + t("sync_pulled") + " " + r.pulled : (r.error || "fail")); }); }, children: syncing ? "…" : t("sync_now") }),
            jsx.jsx("button", { className: "wb-btn ghost", onClick: function () { api.post("/account/logout").then(refresh); }, children: t("logout") }),
          ] }),
          msg ? jsx.jsx("div", { className: "wb-msg", style: { marginTop: 8 }, children: msg }) : null,
        ] });
      }

      function AddonsTab(props) { var t = props.t;
        var api = useApi();
        var st = react.useState([]); var addons = st[0]; var setAddons = st[1];
        react.useEffect(function () { api.get("/catalog").then(function (r) { if (r.ok) setAddons(r.addons || []); }); }, [api]);
        return jsx.jsxs("div", { className: "wb-card", children: [
          jsx.jsx("div", { className: "wb-msg", style: { marginBottom: 10 }, children: t("addons_from_cloud") }),
          addons.length === 0 ? jsx.jsx("div", { className: "wb-msg", children: "—" }) : addons.map(function (a) {
            return jsx.jsxs("div", { className: "wb-addon", style: { padding: "8px 0", borderTop: "1px solid var(--dsw-alias-border,#2c2c2c)" }, children: [
              jsx.jsxs("div", { children: [jsx.jsx("b", { children: a.title }), jsx.jsxs("div", { className: "wb-msg", children: [a.description, " · v", a.compatible_version] })] }),
              jsx.jsx("button", { className: "wb-btn ghost", title: t("coming_soon"), children: t("install") }),
            ] }, a.id);
          }),
        ] });
      }

      function WorkbenchPage(props) { var t = props.t;
        var st = react.useState("tasks"); var tab = st[0]; var setTab = st[1];
        react.useEffect(function () {
          if (document.getElementById("wb-css")) return;
          var s = document.createElement("style"); s.id = "wb-css"; s.setAttribute("data-plugin-css", NS); s.textContent = CSS;
          document.head.appendChild(s);
        }, []);
        return jsx.jsxs("div", { className: "wb-root", children: [
          jsx.jsxs("div", { className: "wb-hero", children: [jsx.jsx("h2", { children: t("title") }), jsx.jsx("span", { className: "wb-tag", children: t("tagline") })] }),
          jsx.jsxs("div", { className: "wb-tabs", children: [
            ["tasks", "account", "addons"].map(function (k) {
              return jsx.jsx("button", { className: "wb-tab" + (tab === k ? " on" : ""), onClick: function () { setTab(k); }, children: t("tab_" + k) }, k);
            }),
          ] }),
          tab === "tasks" ? jsx.jsx(TasksTab, { t: t }) : tab === "account" ? jsx.jsx(AccountTab, { t: t }) : jsx.jsx(AddonsTab, { t: t }),
        ] });
      }

      var exports_ = {
        name: NS,
        inject: ["slots", "locale", "theme"],
        apply: function (ctx) {
          var PanellistIcon = function (props) {
            return h("svg", { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" },
              h("rect", { x: 3, y: 3, width: 7, height: 7, rx: 1 }),
              h("rect", { x: 14, y: 3, width: 7, height: 7, rx: 1 }),
              h("rect", { x: 3, y: 14, width: 7, height: 7, rx: 1 }),
              h("rect", { x: 14, y: 14, width: 7, height: 7, rx: 1 })
            );
          };
          ctx.effect(function () { return ctx.locale.register(NS, LOCALE); }, "wb-locale");
          var t = ctx.locale.bind(NS);
          // 左侧栏一级入口(图标)与右侧整页:与 进度播报/上下文洞察 同一套 slot 契约。
          ctx.slots.inject("sidebar.panellist", function () {
            return ctx.slots.register(
              { name: "sidebar.panellist", id: NS, order: 62, label: function () { return t("nav"); } },
              function () { return h(PanellistIcon, {}); }
            );
          });
          ctx.slots.inject("main", function () {
            return ctx.slots.register(
              { name: "main", key: NS, locale: NS, inject: function () { return { t: t }; } },
              function () { return jsx.jsx(WorkbenchPage, { t: t }); }
            );
          });
          // 设置页里保留一个入口 tab,便于从设置跳转。
          ctx.slots.inject("settings.plugins.tab", function () {
            return ctx.slots.register(
              { name: "settings.plugins.tab", id: NS, order: 65, label: function () { return t("nav"); }, locale: NS, inject: function () { return { t: t }; } },
              function () { return h(WorkbenchPage, { t: t }); }
            );
          });
        },
      };
      return exports_;
    },
  });
})();
