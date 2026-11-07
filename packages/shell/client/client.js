// dsh-workbench 客户端：React 组件注入 settings.plugins.tab。
// 与宿主打包器产物同构：window.__ModuleLoader__.load({id, factory})；require 由宿主提供 react/jsx-runtime。
(function () {
  window.__ModuleLoader__ = window.__ModuleLoader__ || { modules: {}, load: function (m) { this.modules[m.id] = m.factory; } };
  window.__ModuleLoader__.load({
    id: "dsh-workbench/client",
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
          due: "截止日期", create: "创建", empty: "暂无任务，先记一条？",
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
          due: "Due date", create: "Create", empty: "No tasks yet — add one?",
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
        ".wb-root{display:flex;flex-direction:column;gap:14px;height:100%;min-height:0;color:var(--dsw-alias-text-primary,#e8e8e8)}",
        ".wb-head{display:flex;align-items:baseline;gap:12px}",
        ".wb-head h2{margin:0;font-size:16px;font-weight:600}",
        ".wb-tag{font-size:12px;color:var(--dsw-alias-text-tertiary,#888)}",
        ".wb-tabs{display:flex;gap:6px;border-bottom:1px solid var(--dsw-alias-border,#333);padding-bottom:8px}",
        ".wb-tab{border:none;background:transparent;color:inherit;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:13px}",
        ".wb-tab.on{background:var(--dsw-alias-bg-selected,#2b2b2b);color:var(--dsw-alias-text-primary,#fff)}",
        ".wb-card{background:var(--dsw-alias-bg-base,#1e1e1e);border:1px solid var(--dsw-alias-border,#333);border-radius:12px;padding:14px}",
        ".wb-form{display:flex;flex-wrap:wrap;gap:8px;align-items:center}",
        ".wb-input,.wb-select{background:var(--dsw-alias-bg-input,#111);color:inherit;border:1px solid var(--dsw-alias-border,#3a3a3a);border-radius:8px;padding:7px 10px;font-size:13px}",
        ".wb-btn{background:var(--dsw-alias-accent,#3b82f6);color:#fff;border:none;border-radius:8px;padding:7px 14px;cursor:pointer;font-size:13px}",
        ".wb-btn.ghost{background:transparent;border:1px solid var(--dsw-alias-border,#444);color:inherit}",
        ".wb-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px;overflow:auto}",
        ".wb-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border:1px solid var(--dsw-alias-border,#2f2f2f);border-radius:10px;background:var(--dsw-alias-bg-base,#202020)}",
        ".wb-item.done .wb-t{text-decoration:line-through;opacity:.55}",
        ".wb-p{font-size:11px;padding:2px 7px;border-radius:99px;border:1px solid currentColor}",
        ".wb-p1{color:#ef4444}.wb-p2{color:#f59e0b}.wb-p3{color:#6b7280}",
        ".wb-t{flex:1;font-size:13px}",
        ".wb-due{font-size:11px;color:var(--dsw-alias-text-tertiary,#888)}",
        ".wb-due.bad{color:#ef4444}",
        ".wb-stat{display:flex;gap:18px;font-size:12px;color:var(--dsw-alias-text-secondary,#aaa)}",
        ".wb-check{cursor:pointer;width:16px;height:16px;accent-color:var(--dsw-alias-accent,#3b82f6)}",
        ".wb-del{background:none;border:none;color:var(--dsw-alias-text-tertiary,#777);cursor:pointer;font-size:14px}",
        ".wb-msg{font-size:12px;color:var(--dsw-alias-text-secondary,#999)}",
        ".wb-msg.err{color:#ef4444}",
        ".wb-addon{display:flex;justify-content:space-between;align-items:center;gap:10px}",
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

      function TasksTab(t) {
        var api = useApi();
        var st = react.useState([]); var tasks = st[0]; var setTasks = st[1];
        var st2 = react.useState(null); var stats = st2[0]; var setStats = st2[1];
        var st3 = react.useState(""); var title = st3[0]; var setTitle = st3[1];
        var st4 = react.useState(2); var prio = st4[0]; var setPrio = st4[1];
        var st5 = react.useState(""); var due = st5[0]; var setDue = st5[1];
        var refresh = react.useCallback(function () {
          api.get("/tasks").then(function (r) { if (r.ok) { setTasks(r.tasks); setStats(r.stats); } });
        }, [api]);
        react.useEffect(refresh, [refresh]);
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
        return jsx.jsxs("div", { className: "wb-card", children: [
          jsx.jsxs("div", { className: "wb-form", style: { marginBottom: 12 }, children: [
            jsx.jsx("input", { className: "wb-input", style: { flex: 1, minWidth: 160 }, placeholder: t("task_title"), value: title, onChange: function (e) { setTitle(e.target.value); }, onKeyDown: function (e) { if (e.key === "Enter") add(); } }),
            jsx.jsxs("select", { className: "wb-select", value: prio, onChange: function (e) { setPrio(e.target.value); }, children: [
              jsx.jsx("option", { value: 1, children: t("p1") }), jsx.jsx("option", { value: 2, children: t("p2") }), jsx.jsx("option", { value: 3, children: t("p3") })] }),
            jsx.jsx("input", { className: "wb-input", type: "date", value: due, onChange: function (e) { setDue(e.target.value); }, title: t("due") }),
            jsx.jsx("button", { className: "wb-btn", onClick: add, children: t("create") }),
          ] }),
          jsx.jsx("ul", { className: "wb-list", children: tasks.length === 0 ? jsx.jsx("li", { className: "wb-msg", children: t("empty") }) : tasks.map(function (tk) {
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
          stats ? jsx.jsxs("div", { className: "wb-stat", style: { marginTop: 10 }, children: [
            jsx.jsxs("span", { children: [stats.open, " ", t("stats_open")] }),
            jsx.jsxs("span", { children: [stats.done, " ", t("stats_done")] }),
            stats.overdue ? jsx.jsxs("span", { style: { color: "#ef4444" }, children: [stats.overdue, " ", t("stats_overdue")] }) : null,
          ] }) : null,
        ] });
      }

      function AccountTab(t) {
        var api = useApi();
        var st = react.useState(null); var me = st[0]; var setMe = st[1];
        var st2 = react.useState({ email: "", password: "", signup: false }); var form = st2[0]; var setForm = st2[1];
        var st3 = react.useState(""); var msg = st3[0]; var setMsg = st3[1];
        var st4 = react.useState(false); var syncing = st4[0]; var setSyncing = st4[1];
        var refresh = react.useCallback(function () { api.get("/account").then(function (r) { setMe(r); }); }, [api]);
        react.useEffect(refresh, [refresh]);
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

      function AddonsTab(t) {
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

      function WorkbenchPage(t) {
        var st = react.useState("tasks"); var tab = st[0]; var setTab = st[1];
        react.useEffect(function () {
          if (document.getElementById("wb-css")) return;
          var s = document.createElement("style"); s.id = "wb-css"; s.setAttribute("data-plugin-css", NS); s.textContent = CSS;
          document.head.appendChild(s);
        }, []);
        return jsx.jsxs("div", { className: "wb-root", children: [
          jsx.jsxs("div", { className: "wb-head", children: [jsx.jsx("h2", { children: t("title") }), jsx.jsx("span", { className: "wb-tag", children: t("tagline") })] }),
          jsx.jsxs("div", { className: "wb-tabs", children: [
            ["tasks", "account", "addons"].map(function (k) {
              return jsx.jsx("button", { className: "wb-tab" + (tab === k ? " on" : ""), onClick: function () { setTab(k); }, children: t("tab_" + k) }, k);
            }),
          ] }),
          tab === "tasks" ? TasksTab(t) : tab === "account" ? AccountTab(t) : AddonsTab(t),
        ] });
      }

      var exports_ = {
        name: NS,
        inject: ["slots", "locale", "theme"],
        apply: function (ctx) {
          ctx.effect(function () { return ctx.locale.register(NS, LOCALE); }, "wb-locale");
          var t = ctx.locale.bind(NS);
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
