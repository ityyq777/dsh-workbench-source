// 管理页面组件；注入既有宿主依赖，无顶层副作用或循环依赖。
module.exports = function createSystemTabs(react, jsx, useApi) {
function AccountTab(props) {
  var t = props.t;
  var api = useApi();
  var st = react.useState(null); var me = st[0]; var setMe = st[1];
  var st2 = react.useState({ email: "", password: "", signup: false }); var form = st2[0]; var setForm = st2[1];
  var st3 = react.useState(""); var msg = st3[0]; var setMsg = st3[1];
  var st4 = react.useState(false); var syncing = st4[0]; var setSyncing = st4[1];
  var st5 = react.useState(null); var syncStatus = st5[0]; var setSyncStatus = st5[1];
  var st6 = react.useState([]); var conflicts = st6[0]; var setConflicts = st6[1];
  function refreshSync() {
    api.get("/sync/status").then(function (r) { if (r && r.ok) setSyncStatus(r); });
    api.get("/sync/conflicts?limit=20").then(function (r) { setConflicts(r && Array.isArray(r.conflicts) ? r.conflicts : []); });
  }
  function refresh() {
    api.get("/account").then(function (r) {
      setMe(r);
      if (r && r.logged_in) refreshSync();
    });
  }
  react.useEffect(function () { refresh(); }, []);
  react.useEffect(function () {
    if (!me || !me.logged_in) return undefined;
    var es = new EventSource("/workbench/api/events");
    function onSync() { refreshSync(); }
    es.addEventListener("sync-done", onSync);
    es.addEventListener("sync-status", onSync);
    return function () { es.close(); };
  }, [me && me.logged_in]);
  function submit() {
    api.post("/account/login", { email: form.email, password: form.password, signup: form.signup }).then(function (r) {
      setMsg(r.ok ? "" : (r.error || "failed"));
      refresh();
    });
  }
  function resolve(id, action) {
    api.post("/sync/conflicts/" + id + "/resolve", { action: action }).then(function (r) {
      if (!r || !r.ok) setMsg(t("sync_resolve_failed"));
      refreshSync();
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
  var failed = syncStatus && Array.isArray(syncStatus.failed_tables) ? syncStatus.failed_tables : [];
  return jsx.jsxs("div", { className: "wb-stack", children: [
    jsx.jsxs("div", { className: "wb-card", children: [
      jsx.jsxs("div", { children: [t("logged_in_as"), " ", me.user ? me.user.email : "", " (", t("device_name"), ")"] }),
      jsx.jsxs("div", { className: "wb-form", style: { marginTop: 10 }, children: [
        jsx.jsx("button", { className: "wb-btn", disabled: syncing, onClick: function () {
          setSyncing(true);
          api.post("/sync/now").then(function (r) {
            setSyncing(false);
            if (r && r.ok && Array.isArray(r.failed_tables) && r.failed_tables.length) {
              setMsg(t("sync_partial") + ": " + r.failed_tables.join(", "));
            } else {
              setMsg(r && r.ok ? t("sync_ok") + " · " + t("sync_pushed") + " " + r.pushed + " · " + t("sync_pulled") + " " + r.pulled : (r && r.error || "fail"));
            }
            refreshSync();
          });
        }, children: syncing ? "…" : t("sync_now") }),
        jsx.jsx("button", { className: "wb-btn ghost", onClick: function () { api.post("/account/logout").then(refresh); }, children: t("logout") }),
      ] }),
      msg ? jsx.jsx("div", { className: "wb-msg", style: { marginTop: 8 }, children: msg }) : null,
      syncStatus ? jsx.jsxs("div", { className: "wb-sync-status", children: [
        jsx.jsxs("span", { children: [t("sync_last"), ": ", jsx.jsx("b", { children: syncStatus.last_sync_at ? new Date(syncStatus.last_sync_at).toLocaleString() : t("sync_never") })] }),
        jsx.jsxs("span", { children: [t("sync_conflicts"), ": ", jsx.jsx("b", { children: syncStatus.conflicts || 0 })] }),
        failed.length ? jsx.jsxs("span", { children: [t("sync_failed_tables"), ": ", jsx.jsx("b", { children: failed.join(", ") })] }) : null,
        syncStatus.clock_offset ? jsx.jsxs("span", { children: [t("sync_clock"), ": ", jsx.jsx("b", { children: syncStatus.clock_offset + "ms" })] }) : null,
      ] }) : null,
    ] }),
    jsx.jsxs("div", { className: "wb-card", children: [
      jsx.jsxs("div", { className: "wb-sec", children: [
        jsx.jsx("h3", { children: t("sync_conflicts") + " (" + conflicts.length + ")" }),
        jsx.jsx("span", { className: "wb-hint", children: t("sync_conflict_hint") }),
      ] }),
      conflicts.length ? conflicts.map(function (c) {
        return jsx.jsxs("div", { className: "wb-conflict", children: [
          jsx.jsxs("div", { className: "wb-conflict-main", children: [
            jsx.jsx("div", { children: (c.table_name || "") + " · " + (c.row_id || "") }),
            jsx.jsx("div", { className: "wb-conflict-meta", children: (c.kind || "") + (c.server_updated_at ? " · " + new Date(c.server_updated_at).toLocaleString() : "") }),
          ] }),
          jsx.jsxs("div", { className: "wb-conflict-actions", children: [
            jsx.jsx("button", { className: "wb-btn ghost", onClick: function () { resolve(c.id, "keep_local"); }, children: t("sync_keep_local") }),
            jsx.jsx("button", { className: "wb-btn ghost", onClick: function () { resolve(c.id, "keep_server"); }, children: t("sync_keep_server") }),
            jsx.jsx("button", { className: "wb-btn ghost", onClick: function () { resolve(c.id, "dismiss"); }, children: t("sync_dismiss") }),
          ] }),
        ] }, c.id);
      }) : jsx.jsx("div", { className: "wb-msg", children: t("sync_no_conflicts") }),
    ] }),
  ] });
}

function BackupTab(props) {
  var t = props.t;
  var lang = props.lang;
  var addons = props.addons || [];
  var exportable = addons.filter(function (a) { return a && a.backup && a.backup.export; });
  var idsKey = exportable.map(function (a) { return a.id; }).join(",");
  var st = react.useState({}); var selected = st[0]; var setSelected = st[1];
  var st2 = react.useState(""); var busy = st2[0]; var setBusy = st2[1];
  var st3 = react.useState(""); var msg = st3[0]; var setMsg = st3[1];
  var st4 = react.useState(null); var report = st4[0]; var setReport = st4[1];
  var st5 = react.useState(null); var exported = st5[0]; var setExported = st5[1];
  var st6 = react.useState({}); var policies = st6[0]; var setPolicies = st6[1];
  var st7 = react.useState({}); var openConfig = st7[0]; var setOpenConfig = st7[1];
  var fileRef = react.useRef(null);

  react.useEffect(function () {
    setSelected(function (prev) {
      var next = {};
      var changed = false;
      exportable.forEach(function (a) {
        if (prev[a.id]) next[a.id] = true;
        else next[a.id] = true;
        if (!prev[a.id]) changed = true;
      });
      Object.keys(prev).forEach(function (id) {
        if (!exportable.some(function (a) { return a.id === id; })) changed = true;
      });
      return changed ? next : prev;
    });
  }, [idsKey]);

  var allSelected = exportable.length > 0 && exportable.every(function (a) { return selected[a.id]; });
  function toggle(id) {
    var next = Object.assign({}, selected);
    next[id] = !next[id];
    setSelected(next);
  }
  function selectAll(flag) {
    var next = {};
    exportable.forEach(function (a) { next[a.id] = flag; });
    setSelected(next);
  }
  function policyOf(id) { return policies[id] || "newest"; }
  function policyLabel(policy) {
    if (policy === "skip") return t("backup_dup_skip");
    if (policy === "overwrite") return t("backup_dup_overwrite");
    return t("backup_dup_newest");
  }
  function setPolicy(id, value) {
    setPolicies(function (prev) { var next = Object.assign({}, prev); next[id] = value; return next; });
  }
  function toggleConfig(id) {
    setOpenConfig(function (prev) { var next = Object.assign({}, prev); next[id] = !next[id]; return next; });
  }
  function statusLabel(status) {
    if (status === "ok") return t("backup_ok");
    if (status === "partial") return t("backup_partial");
    if (status === "skipped") return t("backup_skipped_status");
    return t("backup_failed_status");
  }
  function doExport() {
    if (busy) return;
    var chosen = exportable.filter(function (a) { return selected[a.id]; });
    var ids = chosen.map(function (a) { return a.id; });
    if (!ids.length) { setMsg(t("backup_select_required")); return; }
    setBusy("export");
    setMsg("");
    setReport(null);
    setExported(null);
    var url = "/workbench/api/backup/export?modules=" + ids.map(encodeURIComponent).join(",");
    fetch(url).then(function (r) {
      if (!r.ok) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          throw new Error((j && j.error) || ("HTTP " + r.status));
        });
      }
      var cd = r.headers.get("content-disposition") || "";
      var m = /filename="?([^";]+)"?/.exec(cd);
      var name = m ? m[1] : "dsh-workbench-backup.zip";
      return r.blob().then(function (blob) {
        var href = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = href;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(href); }, 1500);
        setMsg(t("backup_download_started"));
        var rows = [];
        chosen.forEach(function (a) {
          var tables = a.tables || [];
          if (!tables.length) rows.push({ id: a.id + ":*", table: "—", module: a.title || a.id, version: a.version });
          tables.forEach(function (table) {
            rows.push({ id: a.id + ":" + table, table: table, module: a.title || a.id, version: a.version });
          });
        });
        setExported(rows);
      });
    }).catch(function (e) {
      setMsg(t("backup_export_failed") + ": " + String((e && e.message) || e));
    }).then(function () { setBusy(""); });
  }
  function doImport(ev) {
    var file = ev.target.files && ev.target.files[0];
    ev.target.value = "";
    if (!file || busy) return;
    setBusy("import");
    setMsg("");
    setReport(null);
    var policyMap = {};
    exportable.forEach(function (a) { policyMap[a.id] = policyOf(a.id); });
    fetch("/workbench/api/backup/import", { method: "POST", headers: { "content-type": "application/zip", "x-wb-backup-policy": JSON.stringify(policyMap) }, body: file })
      .then(function (r) {
        if (r.status === 422) {
          return r.json().catch(function () { return {}; }).then(function () {
            setMsg(t("backup_incompatible"));
            return null;
          });
        }
        return r.json().catch(function () { return null; }).then(function (j) {
          if (!r.ok) throw new Error((j && j.error) || ("HTTP " + r.status));
          if (!j) throw new Error(t("backup_invalid"));
          setReport(j);
          setMsg(j.ok ? t("backup_import_done") : t("backup_import_result"));
          return j;
        });
      })
      .catch(function (e) {
        setMsg(t("backup_import_failed") + ": " + String((e && e.message) || e));
      })
      .then(function () { setBusy(""); });
  }
  function moduleCaps(a) {
    var caps = [];
    if (a.backup && a.backup.export) caps.push(t("backup_cap_export"));
    if (a.backup && a.backup.import) caps.push(t("backup_cap_import"));
    return caps.join(" · ");
  }

  return jsx.jsxs("div", { className: "wb-backup", children: [
    jsx.jsxs("div", { className: "wb-card", children: [
      jsx.jsxs("div", { className: "wb-sec", children: [
        jsx.jsx("h3", { children: t("backup_modules") }),
        jsx.jsxs("div", { className: "wb-backup-actions", children: [
          jsx.jsx("button", { className: "wb-btn ghost", disabled: !exportable.length, onClick: function () { selectAll(true); }, children: t("backup_select_all") }),
          jsx.jsx("button", { className: "wb-btn ghost", disabled: !exportable.length, onClick: function () { selectAll(false); }, children: t("backup_clear") }),
        ] }),
      ] }),
      exportable.length
        ? jsx.jsx("div", { className: "wb-stack", style: { marginTop: 10 }, children: exportable.map(function (a) {
            var open = !!openConfig[a.id];
            return jsx.jsxs(react.Fragment, { children: [
              jsx.jsxs("div", { className: "wb-backup-row" + (open ? " open" : ""), children: [
                jsx.jsxs("label", { className: "wb-backup-row-main", children: [
                  jsx.jsx("input", { type: "checkbox", checked: !!selected[a.id], onChange: function () { toggle(a.id); } }),
                  jsx.jsxs("span", { className: "wb-backup-main", children: [
                    jsx.jsxs("span", { className: "wb-backup-name", children: [a.title || a.id, jsx.jsx("span", { className: "wb-badge", children: "v" + (a.version || "?") })] }),
                    jsx.jsx("span", { className: "wb-backup-meta", children: moduleCaps(a) }),
                    a.description ? jsx.jsx("span", { className: "wb-backup-meta", children: a.description }) : null,
                  ] }),
                ] }),
                jsx.jsx("button", {
                  type: "button",
                  className: "wb-backup-gear" + (open ? " active" : ""),
                  title: t("backup_dup_policy"),
                  "aria-label": t("backup_dup_policy"),
                  "aria-expanded": open,
                  onClick: function () { toggleConfig(a.id); },
                  children: "⚙",
                }),
              ] }),
              open ? jsx.jsxs("div", { className: "wb-backup-config", children: [
                jsx.jsx("span", { className: "wb-backup-config-label", children: t("backup_dup_policy") }),
                jsx.jsx("select", {
                  className: "wb-select",
                  value: policyOf(a.id),
                  onChange: function (e) { setPolicy(a.id, e.target.value); },
                  children: [
                    jsx.jsx("option", { value: "newest", children: t("backup_dup_newest") }),
                    jsx.jsx("option", { value: "skip", children: t("backup_dup_skip") }),
                    jsx.jsx("option", { value: "overwrite", children: t("backup_dup_overwrite") }),
                  ],
                }),
                jsx.jsx("span", { className: "wb-backup-note", children: t("backup_dup_hint") }),
              ] }) : null,
            ] }, a.id);
          }) })
        : jsx.jsx("div", { className: "wb-msg", children: t("backup_no_modules") }),
      jsx.jsxs("div", { className: "wb-backup-actions", style: { marginTop: 12 }, children: [
        jsx.jsx("button", { className: "wb-btn", disabled: !!busy || !exportable.length, onClick: doExport, children: busy === "export" ? t("backup_exporting") : t("backup_export") }),
        jsx.jsx("button", { className: "wb-btn ghost", disabled: !!busy, onClick: function () { if (fileRef.current) fileRef.current.click(); }, children: busy === "import" ? t("backup_importing") : t("backup_import") }),
        jsx.jsx("span", { className: "wb-backup-note", children: t("backup_file_hint") }),
      ] }),
      jsx.jsx("input", { ref: fileRef, type: "file", accept: ".zip,application/zip", className: "wb-backup-file", onChange: doImport }),
      msg ? jsx.jsx("div", { className: "wb-msg", style: { textAlign: "left", padding: "10px 0 0", opacity: 0.8 }, children: msg }) : null,
    ] }),
    exported ? jsx.jsxs("div", { className: "wb-card wb-backup-report", children: [
      jsx.jsxs("div", { className: "wb-sec", children: [
        jsx.jsx("h3", { children: t("backup_export_result") }),
        jsx.jsx("span", { className: "wb-hint", children: t("backup_download_started") }),
      ] }),
      jsx.jsx("div", { className: "wb-stack", children: exported.map(function (a) {
        return jsx.jsxs("div", { className: "wb-backup-result-row", children: [
          jsx.jsx("span", { className: "wb-backup-table", children: a.table }),
          jsx.jsxs("span", { className: "wb-backup-meta", children: [a.module, jsx.jsx("span", { className: "wb-badge", children: "v" + (a.version || "?") })] }),
        ] }, a.id);
      }) }),
    ] }) : null,
    report ? jsx.jsxs("div", { className: "wb-card wb-backup-report", children: [
      jsx.jsxs("div", { className: "wb-sec", children: [
        jsx.jsx("h3", { children: t("backup_import_result") }),
        jsx.jsxs("span", { className: "wb-hint", children: [
          t("backup_summary"), ": ",
          t("backup_ok") + " " + report.summary.ok + " · ",
          t("backup_partial") + " " + report.summary.partial + " · ",
          t("backup_failed") + " " + report.summary.failed + " · ",
          t("backup_skipped") + " " + report.summary.skipped,
        ] }),
      ] }),
      jsx.jsxs("div", { className: "wb-backup-meta", children: [
        t("backup_exported_at") + ": " + (report.exportedAt || "?"),
        " · " + t("backup_shell_version") + ": " + (report.shellVersion || "?"),
        " · " + t("backup_format") + ": v" + report.formatVersion,
      ] }),
      jsx.jsx("table", { className: "wb-backup-table", children: [
        jsx.jsxs("thead", { children: [
          jsx.jsxs("tr", { children: [
            jsx.jsx("th", { children: t("backup_detail") }),
            jsx.jsx("th", { children: t("backup_status") }),
            jsx.jsx("th", { children: t("backup_policy") }),
            jsx.jsx("th", { children: t("backup_imported") }),
            jsx.jsx("th", { children: t("backup_skipped") }),
            jsx.jsx("th", { children: t("backup_failed") }),
          ] }),
        ] }),
        jsx.jsxs("tbody", { children: (report.results || []).map(function (r) {
          return jsx.jsxs("tr", { children: [
            jsx.jsxs("td", { children: [
              jsx.jsx("div", { children: r.title || r.id }),
              r.message ? jsx.jsx("div", { className: "wb-backup-meta", children: r.message }) : null,
            ] }),
            jsx.jsx("td", { children: jsx.jsx("span", { className: "wb-backup-status " + r.status, children: statusLabel(r.status) }) }),
            jsx.jsx("td", { className: "wb-backup-meta", children: policyLabel(r.policy) }),
            jsx.jsx("td", { className: "num", children: r.imported || 0 }),
            jsx.jsx("td", { className: "num", children: r.skipped || 0 }),
            jsx.jsx("td", { className: "num", children: r.failed || 0 }),
          ] }, r.id);
        }) }),
      ] }),
    ] }) : null,
  ] });
}

function AuditTab(props) {
  var t = props.t;
  var fst = react.useState({ action: "", actor: "", ok: "", q: "", since: "", until: "" });
  var filters = fst[0]; var setFilters = fst[1];
  var pst = react.useState(1); var page = pst[0]; var setPage = pst[1];
  var zst = react.useState(50); var pageSize = zst[0]; var setPageSize = zst[1];
  var dst = react.useState(null); var data = dst[0]; var setData = dst[1];
  var sst = react.useState(null); var stats = sst[0]; var setStats = sst[1];
  var bst = react.useState(false); var busy = bst[0]; var setBusy = bst[1];
  var est = react.useState(""); var err = est[0]; var setErr = est[1];
  var ost = react.useState(null); var openId = ost[0]; var setOpenId = ost[1];

  var latest = react.useRef(0);
  var currentFilters = react.useRef(filters);
  function query(p, size, filters) {
    var qs = new URLSearchParams();
    if (filters.action) qs.set("actionPrefix", filters.action);
    if (filters.actor) qs.set("actor", filters.actor);
    if (filters.ok !== "") qs.set("ok", filters.ok);
    if (filters.q) qs.set("q", filters.q);
    if (filters.since) qs.set("since", filters.since);
    if (filters.until) qs.set("until", filters.until);
    qs.set("page", String(p));
    qs.set("pageSize", String(size || pageSize));
    qs.set("stats", "1");
    qs.set("rangeDays", "30");
    return qs.toString();
  }
  function load(p, size, selected) {
    var request = ++latest.current;
    setData(null);
    setOpenId(null);
    setPage(p || page);
    setBusy(true);
    setErr("");
    fetch("/workbench/api/audit?" + query(p || page, size, selected || currentFilters.current))
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (request !== latest.current) return;
        if (!j || j.ok === false) throw new Error((j && j.error) || t("audit_load_failed"));
        setData(j);
        setStats(j.stats || null);
        setPage(j.page || 1);
      })
      .catch(function (e) { if (request === latest.current) setErr(String((e && e.message) || e)); })
      .then(function () { if (request === latest.current) setBusy(false); });
  }
  react.useEffect(function () { load(1); return function () { latest.current++; }; }, []);

  function applyFilters(next) {
    currentFilters.current = next;
    setFilters(next);
    load(1, pageSize, next);
  }
  function field(key, value) { applyFilters(Object.assign({}, currentFilters.current, { [key]: value })); }
  function clearFilters() { applyFilters({ action: "", actor: "", ok: "", q: "", since: "", until: "" }); }
  function search() { load(1); }
  function setSize(n) {
    var size = Math.max(10, Math.min(200, Number(n) || 50));
    setPageSize(size);
    load(1, size);
  }
  function fmtTime(ms) {
    try { var d = new Date(Number(ms)); return d.toLocaleString(); } catch (e) { return String(ms); }
  }
  function shortJson(text, limit) {
    if (!text) return "";
    return String(text).length > (limit || 400) ? String(text).slice(0, limit || 400) + "…" : String(text);
  }

  var active = Object.keys(filters).filter(function (key) { return filters[key] !== ""; });
  var labels = { action: "audit_action_prefix", actor: "audit_actor", ok: "audit_ok", q: "audit_q", since: "audit_since", until: "audit_until" };
  function labeled(key, control) { return jsx.jsxs("label", { className: "wb-audit-field", children: [jsx.jsx("span", { children: t(labels[key]) }), control] }, key); }
  var summary = active.map(function (key) { return t(labels[key]) + "=" + (key === "ok" ? t(filters.ok === "true" ? "audit_ok_only" : "audit_fail_only") : filters[key]); }).join(" · ");
  var records = (data && data.records) || [];
  var total = data ? data.total : 0;
  var totalPages = Math.max(1, Math.ceil(total / pageSize));
  var statsText = stats
    ? t("audit_stats") + "：" + totalOf(stats) + " · " + t("audit_failed") + " " + (stats.failed || 0)
    : "";

  function totalOf(s) { return (t("audit_total") + " " + (s.total || 0)); }

  return jsx.jsxs(react.Fragment, { children: [
    jsx.jsxs("div", { className: "wb-card", children: [
      jsx.jsxs("div", { className: "wb-sec", children: [
        jsx.jsx("h3", { children: t("audit_filters") }),
        jsx.jsx("span", { className: "wb-hint", children: statsText }),
      ] }),
      jsx.jsxs("form", { className: "wb-audit-filters", onSubmit: function (e) { e.preventDefault(); search(); }, children: [
        labeled("action", jsx.jsx("input", { className: "wb-input", placeholder: t("audit_action_prefix"), value: filters.action, onChange: function (e) { field("action", e.target.value); } })),
        labeled("actor", jsx.jsx("select", { className: "wb-select", "aria-label": t("audit_actor"), value: filters.actor, onChange: function (e) { field("actor", e.target.value); }, children: [
          jsx.jsx("option", { value: "", children: t("audit_all") + " · " + t("audit_actor") }),
          jsx.jsx("option", { value: "agent", children: "agent" }),
          jsx.jsx("option", { value: "ui", children: "ui" }),
          jsx.jsx("option", { value: "sync", children: "sync" }),
        ] })),
        labeled("ok", jsx.jsx("select", { className: "wb-select", "aria-label": t("audit_ok"), value: filters.ok, onChange: function (e) { field("ok", e.target.value); }, children: [
          jsx.jsx("option", { value: "", children: t("audit_all") + " · " + t("audit_ok") }),
          jsx.jsx("option", { value: "true", children: t("audit_ok_only") }),
          jsx.jsx("option", { value: "false", children: t("audit_fail_only") }),
        ] })),
        labeled("q", jsx.jsx("input", { className: "wb-input", placeholder: t("audit_q"), value: filters.q, onChange: function (e) { field("q", e.target.value); } })),
        labeled("since", jsx.jsx("input", { className: "wb-input", type: "date", title: t("audit_since"), value: filters.since, onChange: function (e) { field("since", e.target.value); } })),
        labeled("until", jsx.jsx("input", { className: "wb-input", type: "date", title: t("audit_until"), value: filters.until, onChange: function (e) { field("until", e.target.value); } })),
        jsx.jsx("button", { className: "wb-btn", type: "submit", disabled: busy, children: busy ? "…" : t("audit_search") }),
        jsx.jsx("button", { className: "wb-btn ghost", type: "button", disabled: busy, onClick: function () { load(page); }, children: t("audit_refresh") }),
      ] }),
      jsx.jsxs("div", { className: "wb-audit-summary", role: "status", "aria-live": "polite", children: [
        jsx.jsx("span", { children: (summary ? t("audit_active") + "：" + summary : t("audit_all")) + " · " + (busy ? t("audit_loading") : err ? t("audit_load_failed") : t("audit_total") + " " + total) }),
        active.length ? jsx.jsx("button", { type: "button", className: "wb-btn ghost", onClick: clearFilters, children: t("audit_clear") }) : null,
      ] }),
      err ? jsx.jsx("div", { className: "wb-err", style: { marginTop: 10 }, children: err }) : null,
      jsx.jsx("div", { className: "wb-hint", style: { marginTop: 10 }, children: t("audit_reads_hint") + " · " + t("audit_retention") }),
    ] }),
    jsx.jsxs("div", { className: "wb-card", children: [
      jsx.jsxs("div", { className: "wb-sec", children: [
        jsx.jsx("h3", { children: t("tab_audit") }),
        jsx.jsx("span", { className: "wb-hint", children: (busy ? t("audit_loading") : err ? t("audit_load_failed") : t("audit_total") + " " + total) + " · " + page + " / " + totalPages + " " + t("audit_page") }),
      ] }),
      records.length
        ? jsx.jsx("div", { style: { overflowX: "auto" }, children: jsx.jsxs("table", { className: "wb-audit-table", children: [
            jsx.jsx("thead", { children: jsx.jsxs("tr", { children: [
              jsx.jsx("th", { children: t("audit_time") }),
              jsx.jsx("th", { children: t("audit_actor") }),
              jsx.jsx("th", { children: t("audit_action") }),
              jsx.jsx("th", { children: t("audit_ok") }),
              jsx.jsx("th", { children: t("audit_target") }),
              jsx.jsx("th", { children: t("audit_duration") }),
            ] }) }),
            jsx.jsx("tbody", { children: records.map(function (r) {
              var open = openId === r.id;
              return jsx.jsxs(react.Fragment, { children: [
                jsx.jsxs("tr", { className: "wb-audit-row", tabIndex: 0, "aria-expanded": open, onKeyDown: function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenId(open ? null : r.id); } }, onClick: function () { setOpenId(open ? null : r.id); }, children: [
                  jsx.jsx("td", { className: "wb-audit-mono", children: fmtTime(r.at) }),
                  jsx.jsx("td", { children: jsx.jsx("span", { className: "wb-badge", children: r.actor }) }),
                  jsx.jsx("td", { className: "wb-audit-mono", children: r.action }),
                  jsx.jsx("td", { children: r.ok ? jsx.jsx("span", { className: "wb-audit-ok", children: "✓" }) : jsx.jsx("span", { className: "wb-audit-fail", children: "✗" }) }),
                  jsx.jsx("td", { className: "wb-audit-mono wb-audit-dim", children: r.target || "—" }),
                  jsx.jsx("td", { className: "wb-audit-dim", children: (r.durationMs || 0) + " ms" }),
                ] }),
                open ? jsx.jsx("tr", { children: jsx.jsx("td", { colSpan: 6, children: jsx.jsxs("div", { children: [
                  r.error ? jsx.jsxs("div", { children: [jsx.jsx("div", { className: "wb-audit-dim", children: t("audit_error") }), jsx.jsx("div", { className: "wb-audit-pre", children: r.error })] }) : null,
                  jsx.jsxs("div", { children: [jsx.jsx("div", { className: "wb-audit-dim", children: t("audit_detail") + " · id=" + r.id }), jsx.jsx("div", { className: "wb-audit-pre", children: shortJson(r.args, 1200) || "{}" }), r.result ? jsx.jsx("div", { className: "wb-audit-pre", children: shortJson(r.result, 1200) }) : null] }),
                ] }) }) }) : null,
              ] }, r.id);
            }) }),
          ] }) })
        : jsx.jsxs("div", { className: "wb-msg", children: [busy ? t("audit_loading") : err ? t("audit_load_failed") : t("audit_empty"), !busy && !err && active.length ? jsx.jsx("button", { className: "wb-btn ghost", onClick: clearFilters, children: t("audit_clear") }) : null] }),
      jsx.jsxs("div", { className: "wb-audit-pager", children: [
        jsx.jsx("button", { className: "wb-btn ghost", disabled: busy || page <= 1, onClick: function () { load(page - 1); }, children: t("audit_prev") }),
        jsx.jsx("button", { className: "wb-btn ghost", disabled: busy || page >= totalPages, onClick: function () { load(page + 1); }, children: t("audit_next") }),
        jsx.jsx("select", { className: "wb-select", "aria-label": t("audit_page_size"), value: String(pageSize), onChange: function (e) { setSize(e.target.value); }, children: [20, 50, 100, 200].map(function (n) { return jsx.jsx("option", { value: String(n), children: n + " / " + t("audit_page") }, n); }) }),
      ] }),
    ] }),
  ] });
}
return { AccountTab, BackupTab, AuditTab };
};
