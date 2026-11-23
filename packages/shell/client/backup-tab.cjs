// 数据备份页：模块勾选 + 导出格式（zip/json/csv/txt）+ 拖拽导入 + 结果回执。
// 组件独立成文件，避免 system-tabs.cjs 继续膨胀；依赖由 createSystemTabs 注入。
module.exports = function createBackupTab(react, jsx) {
  var FORMATS = [
    { value: "zip", name: "backup_fmt_zip", hint: "backup_fmt_zip_hint" },
    { value: "json", name: "backup_fmt_json", hint: "backup_fmt_json_hint" },
    { value: "csv", name: "backup_fmt_csv", hint: "backup_fmt_csv_hint" },
    { value: "txt", name: "backup_fmt_txt", hint: "backup_fmt_txt_hint" },
  ];

  // 行内 SVG：壳体客户端不引图标库，这里只保留备份页需要的三个。
  function icon(name) {
    var paths = {
      gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4 0a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9c.2.63.75 1.08 1.41 1.14H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z",
      download: "M12 3v11m0 0 4.2-4.2M12 14 7.8 9.8M4 16.5V18a2.5 2.5 0 0 0 2.5 2.5h11A2.5 2.5 0 0 0 20 18v-1.5",
      upload: "M12 16V5m0 0 4.2 4.2M12 5 7.8 9.2M4 16.5V18a2.5 2.5 0 0 0 2.5 2.5h11A2.5 2.5 0 0 0 20 18v-1.5",
    };
    return jsx.jsx("svg", {
      className: "wb-backup-icon",
      viewBox: "0 0 24 24",
      width: 16,
      height: 16,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.7,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      children: jsx.jsx("path", { d: paths[name] || paths.gear }),
    });
  }

  function BackupTab(props) {
    var t = props.t;
    var addons = props.addons || [];
    var exportable = addons.filter(function (a) { return a && a.backup && a.backup.export; });
    var preferences = props.preferences || {};
    var preferredIds = preferences["backup.moduleIds"];
    var stSel = react.useState({}); var selected = stSel[0]; var setSelected = stSel[1];
    var stBusy = react.useState(""); var busy = stBusy[0]; var setBusy = stBusy[1];
    var stMsg = react.useState(null); var msg = stMsg[0]; var setMsg = stMsg[1];
    var stReport = react.useState(null); var report = stReport[0]; var setReport = stReport[1];
    var stExported = react.useState(null); var exported = stExported[0]; var setExported = stExported[1];
    var stPolicies = react.useState({}); var policies = stPolicies[0]; var setPolicies = stPolicies[1];
    var stOpen = react.useState({}); var openConfig = stOpen[0]; var setOpenConfig = stOpen[1];
    var stFormat = react.useState(preferences["backup.exportFormat"] || "zip"); var format = stFormat[0]; var setFormat = stFormat[1];
    var stDrag = react.useState(false); var dragging = stDrag[0]; var setDragging = stDrag[1];
    var stClearPhrase = react.useState(""); var clearPhrase = stClearPhrase[0]; var setClearPhrase = stClearPhrase[1];
    var stClearMsg = react.useState(null); var clearMsg = stClearMsg[0]; var setClearMsg = stClearMsg[1];
    var stClearDone = react.useState(null); var clearDone = stClearDone[0]; var setClearDone = stClearDone[1];
    var fileRef = react.useRef(null);

    function isSelected(id) {
      if (Object.hasOwn(selected, id)) return selected[id];
      return !Array.isArray(preferredIds) || preferredIds.includes(id);
    }
    var chosen = exportable.filter(function (a) { return isSelected(a.id); });
    var allSelected = exportable.length > 0 && chosen.length === exportable.length;
    function toggle(id) {
      var next = Object.assign({}, selected);
      next[id] = !isSelected(id);
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
    // 清空确认词必须与宿主 CLEAR_CONFIRM 完全一致，服务端还会再校验一次。
  var CLEAR_PHRASE = "清空全部数据";
  var clearArmed = clearPhrase.trim() === CLEAR_PHRASE;
  function doClear() {
    if (!clearArmed || busy) return;
    setBusy("clear");
    setClearMsg(null);
    fetch("/workbench/api/data/clear", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ confirm: clearPhrase.trim() }),
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (data) { return { status: res.status, data: data }; });
    }).then(function (r) {
      setBusy("");
      var d = r.data || {};
      if (r.status === 200 && d.ok) {
        setClearDone(d);
        setClearPhrase("");
        return;
      }
      var text = d.code === "sync_running" ? t("clear_sync_busy") : (d.error || t("clear_failed"));
      setClearMsg(text);
    }).catch(function (e) {
      setBusy("");
      setClearMsg(String((e && e.message) || e));
    });
  }

  function statusLabel(status) {
      if (status === "ok") return t("backup_ok");
      if (status === "partial") return t("backup_partial");
      if (status === "skipped") return t("backup_skipped_status");
      return t("backup_failed_status");
    }
    function formatName(value) {
      var hit = FORMATS.filter(function (f) { return f.value === value; })[0];
      return hit ? t(hit.name) : value;
    }

    function doExport() {
      if (busy) return;
      var ids = chosen.map(function (a) { return a.id; });
      if (!ids.length) { setMsg({ kind: "err", text: t("backup_select_required") }); return; }
      setBusy("export");
      setMsg(null);
      setReport(null);
      setExported(null);
      var url = "/workbench/api/backup/export?modules=" + ids.map(encodeURIComponent).join(",") + "&format=" + encodeURIComponent(format);
      fetch(url).then(function (r) {
        if (!r.ok) {
          return r.json().catch(function () { return {}; }).then(function (j) {
            throw new Error((j && j.error) || ("HTTP " + r.status));
          });
        }
        var cd = r.headers.get("content-disposition") || "";
        var m = /filename="?([^";]+)"?/.exec(cd);
        var name = m ? m[1] : "dsh-workbench-export." + format;
        return r.blob().then(function (blob) {
          var href = URL.createObjectURL(blob);
          var a = document.createElement("a");
          a.href = href;
          a.download = name;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(function () { URL.revokeObjectURL(href); }, 1500);
          setMsg({ kind: "ok", text: t("backup_download_started") });
          var rows = [];
          chosen.forEach(function (a) {
            var tables = a.tables || [];
            if (!tables.length) rows.push({ id: a.id + ":*", table: t("backup_no_tables"), module: a.title || a.id, version: a.version });
            tables.forEach(function (table) {
              rows.push({ id: a.id + ":" + table, table: table, module: a.title || a.id, version: a.version });
            });
          });
          setExported({ format: format, filename: name, size: blob.size, rows: rows, moduleCount: chosen.length });
        });
      }).catch(function (e) {
        setMsg({ kind: "err", text: t("backup_export_failed") + "：" + String((e && e.message) || e) });
      }).then(function () { setBusy(""); });
    }

    function doImportFile(file) {
      if (!file || busy) return;
      setBusy("import");
      setMsg(null);
      setReport(null);
      var policyMap = {};
      exportable.forEach(function (a) { policyMap[a.id] = policyOf(a.id); });
      fetch("/workbench/api/backup/import", { method: "POST", headers: { "content-type": "application/zip", "x-wb-backup-policy": JSON.stringify(policyMap) }, body: file })
        .then(function (r) {
          if (r.status === 422) {
            return r.json().catch(function () { return {}; }).then(function () {
              setMsg({ kind: "err", text: t("backup_incompatible") });
              return null;
            });
          }
          return r.json().catch(function () { return null; }).then(function (j) {
            if (!r.ok) throw new Error((j && j.error) || ("HTTP " + r.status));
            if (!j) throw new Error(t("backup_invalid"));
            setReport(j);
            setMsg({ kind: j.ok ? "ok" : "err", text: j.ok ? t("backup_import_done") : t("backup_import_result") });
            return j;
          });
        })
        .catch(function (e) {
          setMsg({ kind: "err", text: t("backup_import_failed") + "：" + String((e && e.message) || e) });
        })
        .then(function () { setBusy(""); });
    }
    function doImport(ev) {
      var file = ev.target.files && ev.target.files[0];
      ev.target.value = "";
      doImportFile(file);
    }
    function onDrop(ev) {
      ev.preventDefault();
      setDragging(false);
      var file = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
      doImportFile(file);
    }
    function moduleCaps(a) {
      var caps = [];
      if (a.backup && a.backup.export) caps.push(t("backup_cap_export"));
      if (a.backup && a.backup.import) caps.push(t("backup_cap_import"));
      return caps.join(" · ");
    }

    return jsx.jsxs("div", { className: "wb-backup", children: [
      jsx.jsxs("div", { className: "wb-card wb-backup-overview", children: [
        jsx.jsxs("div", { className: "wb-backup-overview-main", children: [
          jsx.jsx("div", { className: "wb-backup-overview-title", children: t("backup_modules") }),
          jsx.jsx("div", { className: "wb-backup-overview-sub", children: t("backup_selected_count").replace("{n}", String(chosen.length)).replace("{all}", String(exportable.length)) }),
        ] }),
        jsx.jsxs("div", { className: "wb-backup-toolbar", children: [
          jsx.jsx("button", { type: "button", className: "wb-btn ghost", disabled: !exportable.length || allSelected, onClick: function () { selectAll(true); }, children: t("backup_select_all") }),
          jsx.jsx("button", { type: "button", className: "wb-btn ghost", disabled: !chosen.length, onClick: function () { selectAll(false); }, children: t("backup_clear") }),
        ] }),
      ] }),

      jsx.jsxs("div", { className: "wb-backup-layout", children: [
        jsx.jsxs("section", { className: "wb-card wb-backup-modules", children: [
          jsx.jsxs("div", { className: "wb-sec", children: [
            jsx.jsx("h3", { children: t("backup_modules_title") }),
            jsx.jsx("span", { className: "wb-hint", children: t("backup_modules_hint") }),
          ] }),
          exportable.length
            ? jsx.jsx("div", { className: "wb-backup-list", children: exportable.map(function (a) {
                var open = !!openConfig[a.id];
                var sel = isSelected(a.id);
                var tables = a.tables || [];
                return jsx.jsxs("div", { className: "wb-backup-item" + (sel ? " on" : ""), children: [
                  jsx.jsxs("div", { className: "wb-backup-row" + (open ? " open" : ""), children: [
                    jsx.jsxs("label", { className: "wb-backup-row-main", children: [
                      jsx.jsx("input", { type: "checkbox", checked: sel, onChange: function () { toggle(a.id); } }),
                      jsx.jsxs("span", { className: "wb-backup-main", children: [
                        jsx.jsxs("span", { className: "wb-backup-name", children: [a.title || a.id, jsx.jsx("span", { className: "wb-badge", children: "v" + (a.version || "?") })] }),
                        jsx.jsx("span", { className: "wb-backup-meta", children: moduleCaps(a) }),
                        tables.length
                          ? jsx.jsx("span", { className: "wb-backup-tables", children: tables.map(function (tb) {
                              return jsx.jsx("span", { className: "wb-backup-chip", children: tb }, tb);
                            }) })
                          : jsx.jsx("span", { className: "wb-backup-meta", children: t("backup_no_tables") }),
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
                      children: icon("gear"),
                    }),
                  ] }),
                  open ? jsx.jsxs("div", { className: "wb-backup-config", children: [
                    jsx.jsx("span", { className: "wb-backup-config-label", children: t("backup_dup_policy") }),
                    jsx.jsx("select", {
                      className: "wb-select",
                      "aria-label": t("backup_dup_policy"),
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
        ] }),

        jsx.jsxs("aside", { className: "wb-backup-side", children: [
          jsx.jsxs("section", { className: "wb-card wb-backup-panel", children: [
            jsx.jsxs("div", { className: "wb-sec", children: [
              jsx.jsx("h3", { children: t("backup_export_title") }),
              jsx.jsx("span", { className: "wb-hint", children: formatName(format) }),
            ] }),
            jsx.jsx("div", { className: "wb-backup-formats", role: "radiogroup", "aria-label": t("backup_export_format"), children: FORMATS.map(function (f) {
              var on = format === f.value;
              return jsx.jsxs("button", {
                type: "button",
                role: "radio",
                "aria-checked": on,
                className: "wb-backup-format" + (on ? " on" : ""),
                onClick: function () { setFormat(f.value); },
                children: [
                  jsx.jsxs("span", { className: "wb-backup-format-head", children: [
                    jsx.jsx("span", { className: "wb-backup-format-name", children: t(f.name) }),
                    on ? jsx.jsx("span", { className: "wb-backup-format-check", children: "✓" }) : null,
                  ] }),
                  jsx.jsx("span", { className: "wb-backup-format-desc", children: t(f.hint) }),
                ],
              }, f.value);
            }) }),
            jsx.jsxs("button", { type: "button", className: "wb-btn wb-backup-go", disabled: !!busy || !exportable.length, onClick: doExport, children: [
              icon("download"),
              jsx.jsx("span", { children: busy === "export" ? t("backup_exporting") : t("backup_export") }),
            ] }),
            jsx.jsx("p", { className: "wb-backup-note", children: t("backup_readonly_hint") }),
          ] }),
          jsx.jsxs("section", { className: "wb-card wb-backup-panel", children: [
            jsx.jsx("div", { className: "wb-sec", children: jsx.jsx("h3", { children: t("backup_import_title") }) }),
            jsx.jsxs("p", { className: "wb-backup-note", children: [
              t("backup_dup_policy"), " · ", policyLabel("newest"),
              exportable.filter(function (a) { return policyOf(a.id) !== "newest"; }).map(function (a) {
                return jsx.jsx("span", { children: " · " + (a.title || a.id) + "：" + policyLabel(policyOf(a.id)) }, a.id);
              }),
            ] }),
            jsx.jsxs("label", {
              className: "wb-backup-drop" + (dragging ? " drag" : ""),
              onDragOver: function (ev) { ev.preventDefault(); setDragging(true); },
              onDragLeave: function () { setDragging(false); },
              onDrop: onDrop,
              children: [
                jsx.jsx("input", { ref: fileRef, type: "file", accept: ".zip,application/zip", className: "wb-backup-file", onChange: doImport }),
                icon("upload"),
                jsx.jsx("span", { className: "wb-backup-drop-title", children: busy === "import" ? t("backup_importing") : t("backup_import_drop") }),
                jsx.jsx("span", { className: "wb-backup-drop-sub", children: t("backup_import_drop_sub") }),
              ],
            }),
            jsx.jsx("p", { className: "wb-backup-note", children: t("backup_import_hint") }),
          ] }),
        ] }),
      ] }),

      msg ? jsx.jsx("div", { className: "wb-backup-msg " + msg.kind, role: "status", "aria-live": "polite", children: msg.text }) : null,

      exported ? jsx.jsxs("div", { className: "wb-card wb-backup-report", children: [
        jsx.jsxs("div", { className: "wb-sec", children: [
          jsx.jsx("h3", { children: t("backup_export_result") }),
          jsx.jsx("span", { className: "wb-hint", children: formatName(exported.format) }),
        ] }),
        jsx.jsxs("div", { className: "wb-backup-file-line", children: [
          jsx.jsx("span", { className: "wb-backup-file-name", children: exported.filename }),
          jsx.jsx("span", { className: "wb-backup-meta", children: Math.max(1, Math.round(exported.size / 1024)) + " KB · " + exported.rows.length + " " + t("backup_table_unit") }),
        ] }),
        jsx.jsx("div", { className: "wb-backup-stack", children: exported.rows.map(function (a) {
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
            t("backup_summary"), "：",
            t("backup_ok") + " " + report.summary.ok + " · ",
            t("backup_partial") + " " + report.summary.partial + " · ",
            t("backup_failed") + " " + report.summary.failed + " · ",
            t("backup_skipped") + " " + report.summary.skipped,
          ] }),
        ] }),
        jsx.jsxs("div", { className: "wb-backup-meta", children: [
          t("backup_exported_at") + "：" + (report.exportedAt || "?"),
          " · " + t("backup_shell_version") + "：" + (report.shellVersion || "?"),
          " · " + t("backup_format") + "：v" + report.formatVersion,
        ] }),
        jsx.jsx("div", { className: "wb-backup-table-wrap", children: jsx.jsx("table", { className: "wb-backup-table", children: [
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
        ] }) }),
      ] }) : null,

      jsx.jsxs("section", { className: "wb-card wb-danger", children: [
        jsx.jsxs("div", { className: "wb-sec", children: [
          jsx.jsx("h3", { children: t("clear_title") }),
          jsx.jsx("span", { className: "wb-hint", children: t("clear_scope_hint") }),
        ] }),
        jsx.jsx("p", { className: "wb-danger-desc", children: t("clear_desc") }),
        jsx.jsx("ul", { className: "wb-danger-scope", children: [
          jsx.jsx("li", { children: t("clear_scope_data") }),
          jsx.jsx("li", { children: t("clear_scope_config") }),
          jsx.jsx("li", { children: t("clear_scope_sync") }),
          jsx.jsx("li", { children: t("clear_scope_cloud") }),
        ] }),
        clearDone ? jsx.jsxs("div", { className: "wb-danger-done", role: "status", "aria-live": "polite", children: [
          jsx.jsxs("div", { className: "wb-danger-done-text", children: [
            t("clear_done") + "：" + t("clear_done_counts").replace("{tables}", String(clearDone.tables || 0)).replace("{rows}", String(clearDone.rows || 0)),
          ] }),
          jsx.jsx("div", { className: "wb-danger-done-sub", children: t("clear_done_sub") }),
          jsx.jsx("button", { type: "button", className: "wb-btn", onClick: function () { window.location.reload(); }, children: t("clear_reload") }),
        ] }) : jsx.jsxs("div", { className: "wb-danger-action", children: [
          jsx.jsxs("label", { className: "wb-danger-label", children: [
            t("clear_confirm_label"),
            jsx.jsx("code", { className: "wb-danger-phrase", children: CLEAR_PHRASE }),
          ] }),
          jsx.jsxs("div", { className: "wb-danger-row", children: [
            jsx.jsx("input", {
              className: "wb-input",
              value: clearPhrase,
              placeholder: t("clear_phrase_placeholder"),
              autoComplete: "off",
              onChange: function (e) { setClearPhrase(e.target.value); if (clearMsg) setClearMsg(null); },
              onKeyDown: function (e) { if (e.key === "Enter") doClear(); },
            }),
            jsx.jsxs("button", {
              type: "button",
              className: "wb-btn danger",
              disabled: !clearArmed || busy === "clear",
              onClick: doClear,
              children: busy === "clear" ? t("clear_running") : t("clear_action"),
            }),
          ] }),
          clearMsg ? jsx.jsx("div", { className: "wb-danger-msg", role: "alert", children: clearMsg }) : null,
          jsx.jsx("p", { className: "wb-danger-note", children: t("clear_note") }),
        ] }),
      ] }),
    ] });
  }

  return { BackupTab: BackupTab };
};
