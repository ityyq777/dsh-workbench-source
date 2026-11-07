// dsh-workbench 客户端：宿主壳 + 子插件动态视图容器。
// 子插件浏览器代码由 /workbench/api/addons/<id>/client.js 提供，运行时注册到 window.__WB_HOST__。
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
          nav: "个人工作台", title: "个人工作台", tagline: "离线优先 · 子插件按需安装",
          tab_account: "账号与同步", tab_addons: "子插件",
          addons_installed: "已安装的子插件", addons_cloud: "云端目录",
          install: "安装", upgrade: "升级", installed: "已安装", uninstall: "卸载",
          confirm_uninstall: "确认卸载", installing: "正在安装…", refresh: "刷新目录",
          no_installed: "还没有安装子插件——去云端目录装一个「任务记录」试试",
          no_catalog: "云端目录为空或不可达", catalog_loading: "正在读取云端目录…",
          cached_notice: "云端不可达，显示上次缓存的目录", install_failed: "安装失败",
          uninstall_failed: "卸载失败", load_failed: "客户端加载失败", data_kept: "卸载只删代码，数据保留；重装后数据仍在",
          addon_error: "加载异常", source_cloud: "云端", source_local: "本地目录",
          version: "版本", latest: "最新", shell_version: "壳版本", delete: "删除",
          login: "登录", signup: "注册", email: "邮箱", password: "密码", logout: "退出登录",
          logged_in_as: "已登录", not_logged_in: "未登录——数据仅存本机 SQLite",
          sync_now: "立即同步", sync_pushed: "推送", sync_pulled: "拉取", device_name: "本设备",
        },
        en: {
          nav: "Workbench", title: "Personal Workbench", tagline: "Offline-first · installable addons",
          tab_account: "Account & Sync", tab_addons: "Addons",
          addons_installed: "Installed addons", addons_cloud: "Cloud catalog",
          install: "Install", upgrade: "Update", installed: "Installed", uninstall: "Uninstall",
          confirm_uninstall: "Confirm uninstall", installing: "Installing…", refresh: "Refresh catalog",
          no_installed: "No addons yet — install Tasks from the cloud catalog",
          no_catalog: "Catalog is empty or unreachable", catalog_loading: "Loading catalog…",
          cached_notice: "Cloud unreachable — showing the cached catalog", install_failed: "Install failed",
          uninstall_failed: "Uninstall failed", load_failed: "client failed to load", data_kept: "Uninstall removes code only; data is kept and reappears after reinstall",
          addon_error: "load error", source_cloud: "cloud", source_local: "local dir",
          version: "version", latest: "latest", shell_version: "shell", delete: "Delete",
          login: "Login", signup: "Sign up", email: "Email", password: "Password", logout: "Log out",
          logged_in_as: "Signed in", not_logged_in: "Not signed in — data stays local",
          sync_now: "Sync now", sync_pushed: "pushed", sync_pulled: "pulled", device_name: "This device",
        },
      };

      // 样式：只用宿主 --dsw-* token，深浅主题自适应（03 文档）
      var CSS = [
        ".wb-root{--wb-line:var(--dsw-alias-border-l2,color-mix(in oklab,currentColor 16%,transparent));--wb-surface:color-mix(in oklab,currentColor 4%,transparent);display:flex;flex-direction:column;height:100%;box-sizing:border-box;overflow:auto;color:inherit;font-size:13px;background:var(--dsw-alias-bg-layer-2,color-mix(in oklab,currentColor 4%,transparent));padding:24px 28px}",
        ".wb-inner{display:flex;flex-direction:column;gap:16px;width:100%;max-width:1040px;margin:0 auto}",
        ".wb-hero{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap}",
        ".wb-hero h2{margin:0;font-size:18px;font-weight:650;letter-spacing:.2px}",
        ".wb-tag{font-size:12px;opacity:.62;margin-top:4px;display:block;line-height:1.5}",
        ".wb-tabs{display:flex;gap:6px;border-bottom:1px solid var(--wb-line);margin-bottom:2px}",
        ".wb-tab{border:none;background:transparent;color:inherit;opacity:.6;padding:9px 14px;cursor:pointer;font-size:13px;border-bottom:2px solid transparent;margin-bottom:-1px;transition:opacity .15s ease,border-color .15s ease}",
        ".wb-tab:hover{opacity:.9}",
        ".wb-tab.on{opacity:1;border-bottom-color:var(--dsw-alias-accent,#11a89b);font-weight:600}",
        ".wb-card{background:var(--wb-surface);border:1px solid var(--wb-line);border-radius:12px;padding:14px 16px}",
        ".wb-form{display:flex;gap:8px;align-items:center;background:var(--wb-surface);border:1px solid var(--wb-line);border-radius:12px;padding:10px;flex-wrap:wrap}",
        ".wb-input,.wb-select{background:transparent;color:inherit;border:1px solid var(--wb-line);border-radius:8px;padding:8px 11px;font-size:13px;outline:none;transition:border-color .15s ease}",
        ".wb-input:focus,.wb-select:focus{border-color:var(--dsw-alias-accent,#11a89b)}",
        ".wb-btn{background:var(--dsw-alias-accent,#11a89b);color:#fff;border:none;border-radius:8px;padding:8px 16px;cursor:pointer;font-size:13px;font-weight:600;transition:filter .15s ease}",
        ".wb-btn:hover{filter:brightness(1.08)}",
        ".wb-btn:disabled{opacity:.55;cursor:default;filter:none}",
        ".wb-btn.ghost{background:transparent;border:1px solid var(--wb-line);color:inherit;font-weight:400;opacity:.8}",
        ".wb-btn.danger{background:transparent;border:1px solid #e5484d;color:#e5484d;font-weight:500}",
        ".wb-sec{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:2px 0 0}",
        ".wb-sec h3{margin:0;font-size:13px;font-weight:650;letter-spacing:.2px}",
        ".wb-sec .wb-hint{font-size:11.5px;opacity:.5}",
        ".wb-addon{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:12px 14px;border:1px solid var(--wb-line);border-radius:10px;background:var(--wb-surface)}",
        ".wb-addon+.wb-addon{margin-top:8px}",
        ".wb-addon-main{min-width:0;display:flex;flex-direction:column;gap:2px}",
        ".wb-addon-title{font-weight:600;font-size:13.5px}",
        ".wb-addon-meta{font-size:11.5px;opacity:.52;margin-top:3px;line-height:1.5;word-break:break-word}",
        ".wb-addon-desc{font-size:12px;opacity:.66;margin-top:2px;line-height:1.5}",
        ".wb-actions{display:flex;gap:6px;align-items:center;flex:none;flex-wrap:wrap;justify-content:flex-end}",
        ".wb-badge{font-size:10.5px;padding:2px 7px;border-radius:999px;border:1px solid var(--wb-line);opacity:.7;margin-left:6px;white-space:nowrap}",
        ".wb-err{font-size:12px;color:#e5484d;margin-top:4px;line-height:1.5;word-break:break-word}",
        ".wb-msg{font-size:12.5px;opacity:.55;padding:20px 0;text-align:center;line-height:1.6}",
        ".wb-empty-cta{padding:26px 14px}",
        ".wb-stack{display:flex;flex-direction:column;gap:10px}",
      ].join("\n");

      // ── 子插件宿主桥（必须在任何 addon client.js 之前就位）──
      var registry = new Map();     // addonId -> AddonClientModule
      var listeners = new Set();    // 子插件事件订阅者
      var apiCache = new Map();
      var addonState = { addons: [], loaded: false, shellVersion: "" };
      var storeListeners = new Set();
      var stream = null;
      var loads = new Map();        // "id@version" -> Promise
      var lastAddonError = null;

      function notifyStore() {
        storeListeners.forEach(function (fn) { try { fn(); } catch (e) { console.error(e); } });
      }
      function broadcast(payload) {
        listeners.forEach(function (fn) { try { fn(payload); } catch (e) { console.error(e); } });
      }
      function apiFor(id) {
        var cached = apiCache.get(id);
        if (cached) return cached;
        var api = {
          call: function (action, args) {
            return fetch("/workbench/api/addons/" + encodeURIComponent(id) + "/actions/" + encodeURIComponent(action), {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(args || {}),
            }).then(function (r) { return r.json(); })
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
      function loadScript(url, key) {
        if (loads.has(key)) return loads.get(key);
        var p = new Promise(function (resolve) {
          var s = document.createElement("script");
          s.src = url;
          s.async = true;
          s.onload = function () { resolve({ ok: true }); };
          s.onerror = function () {
            s.remove();
            // 某些宿主 CSP 会拦 <script>，退回动态 import（同源模块）
            import(url).then(function () { resolve({ ok: true }); })
              .catch(function (e) { resolve({ ok: false, error: String((e && e.message) || e) }); });
          };
          document.head.appendChild(s);
        });
        loads.set(key, p);
        return p;
      }
      function loadClients() {
        addonState.addons.forEach(function (a) {
          if (!a || !a.enabled || !a.client) return;
          var key = a.id + "@" + (a.version || "0");
          if (loads.has(key)) return;
          var url = a.client + (a.client.indexOf("?") >= 0 ? "&" : "?") + "v=" + encodeURIComponent(key);
          loadScript(url, key).then(function (r) {
            if (!r.ok) {
              lastAddonError = a.id + ": " + (r.error || "load error");
              console.warn("[dsh-workbench] 子插件客户端加载失败", a.id, r.error);
            } else {
              lastAddonError = null;
            }
            notifyStore();
          });
        });
      }
      function setAddons(list) {
        addonState.addons = Array.isArray(list) ? list : [];
        addonState.loaded = true;
        var alive = {};
        addonState.addons.forEach(function (a) { alive[a.id] = a; });
        registry.forEach(function (_m, id) { if (!alive[id]) registry.delete(id); });
        loads.forEach(function (_p, key) { if (!alive[key.split("@")[0]]) loads.delete(key); });
        loadClients();
        notifyStore();
      }
      function refreshAddons() {
        return fetch("/workbench/api/addons")
          .then(function (r) { return r.json(); })
          .then(function (j) { if (j && j.addons) { addonState.shellVersion = j.shellVersion || addonState.shellVersion; setAddons(j.addons); } return j; })
          .catch(function (e) { console.warn("[dsh-workbench] 读取已装子插件失败", e); return null; });
      }
      function ensureStream() {
        if (stream) return;
        stream = new EventSource("/workbench/api/events");
        stream.addEventListener("addons-changed", function (e) {
          try { setAddons(JSON.parse(e.data)); } catch (err) { console.warn(err); }
        });
        stream.addEventListener("addon-event", function (e) {
          try { broadcast(JSON.parse(e.data)); } catch (err) { console.warn(err); }
        });
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
      function pickTitle(title, lang) {
        if (!title) return "";
        if (typeof title === "string") return title;
        return title[lang] || title.zh || title.en || "";
      }
      function currentLang() {
        var raw = (document && document.documentElement && document.documentElement.lang) || (typeof navigator !== "undefined" && navigator.language) || "zh";
        return String(raw).toLowerCase().indexOf("zh") === 0 ? "zh" : "en";
      }

      function AccountTab(props) {
        var t = props.t;
        var api = useApi();
        var st = react.useState(null); var me = st[0]; var setMe = st[1];
        var st2 = react.useState({ email: "", password: "", signup: false }); var form = st2[0]; var setForm = st2[1];
        var st3 = react.useState(""); var msg = st3[0]; var setMsg = st3[1];
        var st4 = react.useState(false); var syncing = st4[0]; var setSyncing = st4[1];
        function refresh() { api.get("/account").then(function (r) { setMe(r); }); }
        react.useEffect(function () { refresh(); }, []);
        function submit() {
          api.post("/account/login", { email: form.email, password: form.password, signup: form.signup }).then(function (r) {
            setMsg(r.ok ? "" : (r.error || "failed"));
            refresh();
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
            msg ? jsx.jsx("div", { className: "wb-err", style: { marginTop: 8 }, children: msg }) : null,
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

      function AddonsTab(props) {
        var t = props.t;
        var api = useApi();
        var store = useAddonStore();
        var installed = store.addons || [];
        var cs = react.useState(null); var catalog = cs[0]; var setCatalog = cs[1];
        var ls = react.useState(true); var loading = ls[0]; var setLoading = ls[1];
        var ms = react.useState(""); var msg = ms[0]; var setMsg = ms[1];
        var bs = react.useState(""); var busy = bs[0]; var setBusy = bs[1];
        var ks = react.useState(""); var confirmId = ks[0]; var setConfirmId = ks[1];

        function loadCatalog() {
          setLoading(true);
          api.get("/addons/catalog").then(function (r) {
            setCatalog(r);
            setLoading(false);
          }).catch(function (e) {
            setCatalog({ ok: false, error: String((e && e.message) || e) });
            setLoading(false);
          });
        }
        react.useEffect(function () { loadCatalog(); }, [api]);

        function install(id) {
          if (busy) return;
          setBusy(id); setMsg(""); setConfirmId("");
          api.post("/addons/" + encodeURIComponent(id) + "/install").then(function (r) {
            setBusy("");
            if (!r.ok) { setMsg(t("install_failed") + ": " + (r.error || "")); return; }
            refreshAddons();
            loadCatalog();
          }).catch(function (e) { setBusy(""); setMsg(t("install_failed") + ": " + String((e && e.message) || e)); });
        }
        function uninstall(id) {
          if (busy) return;
          if (confirmId !== id) { setConfirmId(id); setMsg(""); return; }
          setBusy(id); setConfirmId("");
          api.del("/addons/" + encodeURIComponent(id)).then(function (r) {
            setBusy("");
            if (!r.ok) { setMsg(t("uninstall_failed") + ": " + (r.error || "")); return; }
            refreshAddons();
          }).catch(function (e) { setBusy(""); setMsg(t("uninstall_failed") + ": " + String((e && e.message) || e)); });
        }

        var installedMap = {};
        installed.forEach(function (a) { installedMap[a.id] = a; });

        return jsx.jsxs("div", { className: "wb-stack", children: [
          jsx.jsxs("div", { className: "wb-sec", children: [
            jsx.jsx("h3", { children: t("addons_installed") }),
            jsx.jsx("span", { className: "wb-hint", children: installed.length + " / " + t("shell_version") + " " + (store.shellVersion || "") }),
          ] }),
          installed.length === 0
            ? jsx.jsx("div", { className: "wb-card", children: jsx.jsx("div", { className: "wb-msg wb-empty-cta", children: t("no_installed") }) })
            : jsx.jsx("div", { children: installed.map(function (a) {
                return jsx.jsxs("div", { className: "wb-addon", children: [
                  jsx.jsxs("div", { className: "wb-addon-main", children: [
                    jsx.jsxs("div", { className: "wb-addon-title", children: [
                      a.title || a.id,
                      jsx.jsx("span", { className: "wb-badge", children: "v" + a.version }),
                      a.source && a.source.kind ? jsx.jsx("span", { className: "wb-badge", children: a.source.kind === "cloud" ? t("source_cloud") : t("source_local") }) : null,
                    ] }),
                    jsx.jsx("div", { className: "wb-addon-meta", children: a.id }),
                    a.description ? jsx.jsx("div", { className: "wb-addon-desc", children: a.description }) : null,
                    a.error ? jsx.jsx("div", { className: "wb-err", children: t("addon_error") + ": " + a.error }) : null,
                  ] }),
                  jsx.jsxs("div", { className: "wb-actions", children: [
                    jsx.jsx("button", {
                      className: "wb-btn danger",
                      disabled: !!busy,
                      onClick: function () { uninstall(a.id); },
                      children: busy === a.id ? t("installing") : (confirmId === a.id ? t("confirm_uninstall") : t("uninstall")),
                    }),
                  ] }),
                ] }, a.id);
              }) }),
          jsx.jsx("div", { className: "wb-sec", style: { marginTop: 8 }, children: [
            jsx.jsx("h3", { children: t("addons_cloud") }),
            jsx.jsx("button", { className: "wb-btn ghost", onClick: loadCatalog, disabled: loading, children: loading ? "…" : t("refresh") }),
          ] }),
          msg ? jsx.jsx("div", { className: "wb-err", children: msg }) : null,
          catalog && catalog.cached ? jsx.jsx("div", { className: "wb-hint", children: t("cached_notice") }) : null,
          !catalog || loading
            ? jsx.jsx("div", { className: "wb-card", children: jsx.jsx("div", { className: "wb-msg", children: t("catalog_loading") }) })
            : (!catalog.addons || catalog.addons.length === 0)
              ? jsx.jsx("div", { className: "wb-card", children: jsx.jsx("div", { className: "wb-msg", children: catalog.error || t("no_catalog") }) })
              : jsx.jsx("div", { children: catalog.addons.map(function (a) {
                  var have = installedMap[a.id];
                  var target = a.compatible_version || a.latest;
                  var canInstall = !!target;
                  var needInstall = !have;
                  var needUpgrade = have && target && have.version !== target;
                  return jsx.jsxs("div", { className: "wb-addon", children: [
                    jsx.jsxs("div", { className: "wb-addon-main", children: [
                      jsx.jsxs("div", { className: "wb-addon-title", children: [
                        a.title || a.id,
                        jsx.jsx("span", { className: "wb-badge", children: "v" + (target || "?") }),
                        have ? jsx.jsx("span", { className: "wb-badge", children: t("installed") + " v" + have.version }) : null,
                      ] }),
                      a.description ? jsx.jsx("div", { className: "wb-addon-desc", children: a.description }) : null,
                      jsx.jsx("div", { className: "wb-addon-meta", children: [a.id, a.author ? " · " + a.author : "", a.latest ? " · " + t("latest") + " v" + a.latest : ""].join("") }),
                    ] }),
                    jsx.jsxs("div", { className: "wb-actions", children: [
                      needInstall ? jsx.jsx("button", { className: "wb-btn", disabled: !canInstall || !!busy, onClick: function () { install(a.id); }, children: busy === a.id ? t("installing") : t("install") }) : null,
                      needUpgrade ? jsx.jsx("button", { className: "wb-btn", disabled: !!busy, onClick: function () { install(a.id); }, children: busy === a.id ? t("installing") : t("upgrade") }) : null,
                      !needInstall && !needUpgrade ? jsx.jsx("span", { className: "wb-hint", children: t("installed") }) : null,
                    ] }),
                  ] }, a.id);
                }) }),
          jsx.jsx("div", { className: "wb-hint", children: t("data_kept") }),
        ] });
      }

      function WorkbenchPage(props) {
        var t = props.t;
        var store = useAddonStore();
        var ts = react.useState(null); var tab = ts[0]; var setTab = ts[1];
        var lang = currentLang();
        react.useEffect(function () {
          if (document.getElementById("wb-css")) return;
          var s = document.createElement("style");
          s.id = "wb-css";
          s.setAttribute("data-plugin-css", NS);
          s.textContent = CSS;
          document.head.appendChild(s);
        }, []);

        var views = [];
        (store.addons || []).forEach(function (a) {
          if (!a.enabled) return;
          var m = registry.get(a.id);
          if (!m) return;
          (m.views || []).forEach(function (v) {
            views.push({ key: a.id + ":" + v.id, title: v.title, component: v.component, addon: a });
          });
        });
        var known = tab === "account" || tab === "addons" || views.some(function (v) { return v.key === tab; });
        var active = known ? tab : (views.length ? views[0].key : "addons");
        var current = null;
        views.forEach(function (v) { if (v.key === active) current = v; });

        return jsx.jsxs("div", { className: "wb-root", children: [
          jsx.jsxs("div", { className: "wb-inner", children: [
            jsx.jsx("div", { className: "wb-hero", children: jsx.jsxs("div", { children: [jsx.jsx("h2", { children: t("title") }), jsx.jsx("span", { className: "wb-tag", children: t("tagline") })] }) }),
            jsx.jsxs("div", { className: "wb-tabs", children: [
              views.map(function (v) {
                return jsx.jsx("button", { className: "wb-tab" + (active === v.key ? " on" : ""), onClick: function () { setTab(v.key); }, children: pickTitle(v.title, lang) }, v.key);
              }),
              jsx.jsx("button", { className: "wb-tab" + (active === "account" ? " on" : ""), onClick: function () { setTab("account"); }, children: t("tab_account") }, "account"),
              jsx.jsx("button", { className: "wb-tab" + (active === "addons" ? " on" : ""), onClick: function () { setTab("addons"); }, children: t("tab_addons") }, "addons"),
            ] }),
            active === "account"
              ? jsx.jsx(AccountTab, { t: t })
              : active === "addons"
                ? jsx.jsx(AddonsTab, { t: t })
                : current
                  ? jsx.jsx(current.component, { api: apiFor(current.addon.id), lang: lang, addonId: current.addon.id, t: t })
                  : jsx.jsx(AddonsTab, { t: t }),
          ] }),
        ] });
      }

      var exports_ = {
        name: NS,
        inject: ["slots", "locale", "theme"],
        apply: function (ctx) {
          try {
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
          } catch (e) { console.error("[dsh-workbench] apply crashed:", e, e && e.stack); throw e; }
        },
      };
      return exports_;
    },
  });
})();