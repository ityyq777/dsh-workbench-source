"use strict";
// Shared read-only data browser. Adapters supply only domain, config and column hooks.
var React = require("react");
var h = React.createElement;
var COPY = require("./data-copy.cjs");
module.exports = function createDataView(options) {
var DOMAIN = options.domain;
function icon(name) { return options.Icon ? h(options.Icon, { name: name }) : null; }
var P = options.prefix + "-data";
var configView = { useConfig: options.useConfig };
var columnHooks = options.columns || {};
var injectCss = require("./data-style.cjs")(DOMAIN, options.prefix);
var CFG_FALLBACK = {
  "data.pageSize": 50,
  "data.showSystemColumns": false,
  "data.includeDeleted": false,
};

var PAGE_SIZES = [10, 25, 50, 100, 200];

function unwrap(r) {
  return r && r.result !== undefined ? r.result : r;
}

function fmt(template, vars) {
  return String(template).replace(/\{(\w+)\}/g, function (m, key) {
    return vars[key] === undefined ? m : String(vars[key]);
  });
}

function pad2(n) { return n < 10 ? "0" + n : String(n); }

function timeText(ms) {
  var d = new Date(Number(ms));
  if (!Number.isFinite(d.getTime())) return String(ms);
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) + " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes());
}

function looksJson(value) {
  var text = String(value).trim();
  if (!text || (text[0] !== "{" && text[0] !== "[")) return false;
  try { JSON.parse(text); return true; } catch (e) { return false; }
}

function rawText(value, col) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function DataView(props) {
  var api = props.api;
  var lang = props.lang === "en" ? "en" : "zh";
  var t = Object.assign({}, COPY[lang], { indexSub: fmt(COPY[lang].indexSub, { tables: options.tables.join(" / "), domain: DOMAIN }) });
  var cfgWrap = configView.useConfig(api, CFG_FALLBACK);
  var cfg = cfgWrap.values;

  var tablesS = React.useState(null);
  var tables = tablesS[0], setTables = tablesS[1];
  var activeS = React.useState("");
  var active = activeS[0], setActive = activeS[1];
  var dataS = React.useState(null);
  var data = dataS[0], setData = dataS[1];
  var loadingS = React.useState(false);
  var loadingRows = loadingS[0], setLoadingRows = loadingS[1];
  var loadingTablesS = React.useState(true);
  var loadingTables = loadingTablesS[0], setLoadingTables = loadingTablesS[1];
  var errorS = React.useState("");
  var error = errorS[0], setError = errorS[1];
  var pageS = React.useState(1);
  var page = pageS[0], setPage = pageS[1];
  var sizeS = React.useState(0);
  var pageSize = sizeS[0], setPageSize = sizeS[1];
  var sortS = React.useState("");
  var sort = sortS[0], setSort = sortS[1];
  var orderS = React.useState("desc");
  var order = orderS[0], setOrder = orderS[1];
  var searchDraftS = React.useState("");
  var searchDraft = searchDraftS[0], setSearchDraft = searchDraftS[1];
  var searchS = React.useState("");
  var search = searchS[0], setSearch = searchS[1];
  var filterDraftS = React.useState({});
  var filterDraft = filterDraftS[0], setFilterDraft = filterDraftS[1];
  var filtersS = React.useState({});
  var filters = filtersS[0], setFilters = filtersS[1];
  var includeDeletedS = React.useState(null);
  var includeDeletedRaw = includeDeletedS[0], setIncludeDeleted = includeDeletedS[1];
  var showSystemS = React.useState(null);
  var showSystemRaw = showSystemS[0], setShowSystem = showSystemS[1];
  var drawerS = React.useState(null);
  var drawer = drawerS[0], setDrawer = drawerS[1];
  var toastS = React.useState("");
  var toast = toastS[0], setToast = toastS[1];
  var filtersKey = JSON.stringify(filters);
  var reqRef = React.useRef(0);
  var toastTimer = React.useRef(null);
  var refreshS = React.useState(0);
  function refresh() { loadTables(); refreshS[1](function (n) { return n + 1; }); }

  var indexReqRef = React.useRef(0);
  var indexS = React.useState(null);
  var index = indexS[0], setIndex = indexS[1];
  var indexBusyS = React.useState(false);
  var indexBusy = indexBusyS[0], setIndexBusy = indexBusyS[1];
  var cfgSize = Number(cfg["data.pageSize"]) || 50;
  var size = pageSize || (PAGE_SIZES.indexOf(cfgSize) >= 0 ? cfgSize : 50);
  var includeDeleted = includeDeletedRaw === null ? cfg["data.includeDeleted"] === true : includeDeletedRaw;
  var showSystem = showSystemRaw === null ? cfg["data.showSystemColumns"] === true : showSystemRaw;

  function say(text) {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(function () { setToast(""); }, 1600);
  }

  function loadTables() {
    setLoadingTables(true);
    Promise.resolve(api.call(DOMAIN + ".dataTables"))
      .then(function (r) {
        if (r && r.ok === false) throw new Error((r && r.error) || t.loadFail);
        var body = unwrap(r);
        if (!body || !Array.isArray(body.tables)) throw new Error(t.loadFail);
        setTables(body.tables);
        setError("");
        if (!active && body.tables.length) setActive(body.tables[0].name);
      })
      .catch(function (e) { setError(String((e && e.message) || e) || t.loadFail); })
      .then(function () { setLoadingTables(false); });
  }

  React.useEffect(function () {
    injectCss();
    loadTables();
    return function () { indexReqRef.current++; if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  function selectTable(name) {
    if (name === active) return;
    reqRef.current++;
    setActive(name);
    setData(null);
    setDrawer(null);
    setError("");
    setLoadingRows(true);
    setPage(1);
    setSort("");
    setOrder("desc");
    setSearch("");
    setSearchDraft("");
    setFilterDraft({});
    setFilters({});
  }

  React.useEffect(function () {
    if (searchDraft === search) return undefined;
    var timer = setTimeout(function () {
      setSearch(searchDraft);
      setPage(1);
    }, 280);
    return function () { clearTimeout(timer); };
  }, [searchDraft]);

  React.useEffect(function () {
    if (JSON.stringify(filterDraft) === JSON.stringify(filters)) return undefined;
    var timer = setTimeout(function () {
      setFilters(filterDraft);
      setPage(1);
    }, 280);
    return function () { clearTimeout(timer); };
  }, [filterDraft]);

  React.useEffect(function () {
    if (!active || !cfgWrap.ready || index) return undefined;
    var req = ++reqRef.current;
    setLoadingRows(true);
    var args = { table: active, page: page, pageSize: size, order: order, includeDeleted: includeDeleted };
    if (sort) args.sort = sort;
    if (search) args.search = search;
    if (Object.keys(filters).length) args.filters = filters;
    Promise.resolve(api.call(DOMAIN + ".dataQuery", args))
      .then(function (r) {
        if (req !== reqRef.current) return;
        if (r && r.ok === false) throw new Error((r && r.error) || t.queryFail);
        var body = unwrap(r);
        if (!body) throw new Error(t.queryFail);
        setData(body);
        setError("");
        if (body.page !== page) setPage(body.page);
      })
      .catch(function (e) {
        if (req !== reqRef.current) return;
        setError(String((e && e.message) || e) || t.queryFail);
      })
      .then(function () { if (req === reqRef.current) setLoadingRows(false); });
    return function () { reqRef.current++; };
  }, [active, page, size, sort, order, search, includeDeleted, cfgWrap.ready, filtersKey, refreshS[0], !!index]);

  React.useEffect(function () {
    if (!drawer) return undefined;
    function onKey(e) { if (e.key === "Escape") setDrawer(null); }
    document.addEventListener("keydown", onKey);
    return function () { document.removeEventListener("keydown", onKey); };
  }, [drawer]);

  var current = null;
  if (tables) {
    for (var i = 0; i < tables.length; i++) if (tables[i].name === active) current = tables[i];
  }

  /** 只拉本插件自己的 dataTables(stats=true)，索引页与左侧目录同口径。 */
  function leaveIndex() {
    indexReqRef.current++;
    setIndex(null);
    setIndexBusy(false);
    setError("");
  }

  function loadIndex() {
    reqRef.current++;
    setError("");
    var req = ++indexReqRef.current;
    setIndex([]);
    setIndexBusy(true);
    Promise.resolve(api.call(DOMAIN + ".dataTables", { stats: true }))
      .then(function (r) {
        if (req !== indexReqRef.current) return;
        if (r && r.ok === false) throw new Error(r.error || t.loadFail);
        var payload = unwrap(r) || {};
        var rows = (payload.tables || []).map(function (tb) { return { table: tb, stats: tb.stats || null }; });
        setIndex(rows);
        setError("");
        setIndexBusy(false);
      })
      .catch(function (e) {
        if (req !== indexReqRef.current) return;
        setError(String(e.message || e));
        setIndex([]);
        setIndexBusy(false);
      });
  }

  function renderIndex() {
    var row = (index || []).filter(function (r) { return r.table.name === active; })[0];
    var tb = row ? row.table : current;
    var st = row && row.stats;
    var indexes = st ? st.indexes || [] : [];
    var hasExtra = indexes.some(function (ix) { return ix.origin !== "pk"; });
    var count = st && st.rows !== undefined ? st.rows : tb && tb.count;
    return h("div", { className: P + "-idx" },
      h("div", { className: P + "-head" },
        h("div", { className: P + "-headmain" },
          h("h2", null, icon("database"), tableLabel(tb), h("span", { className: P + "-code" }, active)),
          h("div", { className: P + "-idxsub" }, t.indexSub)),
        h("button", {
          type: "button", className: P + "-btn", "aria-label": t.refresh, title: t.refresh, "aria-busy": indexBusy ? "true" : "false",
          onClick: function () { loadIndex(); },
        }, icon("refresh"), h("span", { className: P + "-btnlabel" }, t.refresh))),
      st ? h("div", { className: P + "-idxsum" },
        h("span", null, t.idxRows, " ", h("b", null, String(count))),
        h("span", null, t.idxCols, " ", h("b", null, String(st.columnCount === undefined ? (tb.columns || []).length : st.columnCount))),
        h("span", null, fmt(t.idxCount, { n: indexes.length }))) : null,
      indexBusy
        ? options.Skeleton ? h(options.Skeleton, { lang: lang, label: t.loading }) : h("div", { className: P + "-empty", role: "status", "aria-busy": "true" }, t.loading)
        : !st ? h("div", { className: P + "-empty" }, t.idxEmpty)
        : !hasExtra ? h("div", { className: P + "-empty" }, t.idxNoExtra)
        : h("div", { className: P + "-tablewrap" },
          h("table", { className: P + "-table " + P + "-idxtable" },
            h("thead", null, h("tr", null,
              [t.idxName, t.idxColumns, t.idxType, t.idxSource, t.idxRows].map(function (label) {
                return h("th", { scope: "col", key: label }, h("span", { className: P + "-thbtn" }, label));
              }))),
            h("tbody", null, indexes.map(function (ix) {
              return h("tr", { className: P + "-tr", key: ix.name },
                h("td", { className: P + "-cell mono" }, ix.name),
                h("td", { className: P + "-cell mono" }, (ix.columns || []).join(", ") || t.idxNone),
                h("td", { className: P + "-cell" }, ix.origin === "pk" ? t.idxKey : ix.unique ? t.idxUnique : t.idxNormal),
                h("td", { className: P + "-cell" }, /^sqlite_autoindex_/.test(ix.name) ? t.idxAuto : t.idxCreated),
                h("td", { className: P + "-cell num", title: t.idxRowsHelp }, String(count)));
            })))));
  }

  function tableLabel(tb) {
    if (!tb || !tb.label) return "";
    return lang === "en" ? (tb.label.en || tb.label.zh) : (tb.label.zh || tb.label.en);
  }

  function colLabel(col) {
    if (!col.label) return col.name;
    return lang === "en" ? (col.label.en || col.label.zh) : (col.label.zh || col.label.en);
  }

  function visibleColumns() {
    var cols = data && data.columns ? data.columns.map(function (col) {
      var hook = columnHooks[col.name];
      return hook && hook.kind ? Object.assign({}, col, { kind: hook.kind, type: hook.type || col.type }) : col;
    }) : [];
    return cols.filter(function (c) { return showSystem || !c.system; });
  }

  function toggleSort(name) {
    if (sort !== name) { setSort(name); setOrder("desc"); return; }
    if (order === "desc") { setOrder("asc"); return; }
    setSort("");
    setOrder("desc");
  }

  function ariaSort(name) {
    if (sort !== name) return "none";
    return order === "asc" ? "ascending" : "descending";
  }

  function copyCell(value) {
    var text = value === null || value === undefined ? "" : String(value);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text);
      else {
        var ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
      }
      say(t.copied);
    } catch (e) { /* 复制失败不打断浏览 */ }
  }

  function cellText(col, value) {
    if (value === null || value === undefined) return null;
    if (col.kind === "bool") return value ? t.yes : t.no;
    if (col.kind === "timestamp") return timeText(value);
    return String(value);
  }

  function cellClass(col, value) {
    var cls = P + "-cell";
    if (value === null || value === undefined) return cls + " null";
    if (col.kind === "number") return cls + " num";
    if (col.kind === "id" || col.kind === "path") return cls + " mono";
    if (col.kind === "text" && looksJson(value)) return cls + " json";
    return cls;
  }

  function cellTitle(col, value) {
    if (value === null || value === undefined) return t.nullText;
    if (col.kind === "timestamp") return String(value);
    if (col.kind === "bool") return value ? "1" : "0";
    return String(value);
  }

  function renderCell(row, col) {
    var value = row[col.name];
    var hook = columnHooks[col.name];
    function openDetail() {
      setDrawer({ column: colLabel(col), name: col.name, row: (data.page - 1) * data.pageSize + row.__i + 1, value: value });
    }
    var text = cellText(col, value);
    var content;
    if (text === null) content = h("span", { className: "v" }, t.nullText);
    else if (text === "") content = h("span", { className: "v" }, '""');
    else content = h("span", { className: "v" }, text);
    if (hook && hook.render) content = hook.render({ value: value, row: row, col: col, lang: lang, prefix: P, openDetail: openDetail });
    return h("td", {
      key: col.name,
      className: cellClass(col, value),
      title: cellTitle(col, value),
      onClick: function () { copyCell(value); },
      onDoubleClick: openDetail,
    }, content);
  }

  function activeFilterCount() {
    var n = 0;
    for (var k in filters) if (Object.prototype.hasOwnProperty.call(filters, k)) n++;
    return n;
  }

  function filterCell(col) {
    var val = filterDraft[col.name] === undefined ? "" : filterDraft[col.name];
    return h("th", { key: col.name, scope: "col", className: P + "-fth" },
      h("span", { className: P + "-fcell" },
        h("input", {
          className: P + "-finput",
          type: "search",
          value: val,
          placeholder: t.filterCol,
          "aria-label": t.filterCol + " " + colLabel(col),
          title: colLabel(col) + " · " + t.filterCol,
          onChange: function (e) {
            var v = e.target.value;
            setFilterDraft(function (prev) {
              var next = Object.assign({}, prev);
              if (v) next[col.name] = v;
              else delete next[col.name];
              return next;
            });
          },
        }),
        val ? h("button", {
          type: "button", className: P + "-fclear", title: t.filterClear,
          "aria-label": t.filterClear + " " + colLabel(col),
          onClick: function () {
            setFilterDraft(function (prev) {
              var next = Object.assign({}, prev);
              delete next[col.name];
              return next;
            });
          },
        }, "×") : null));
  }

  function renderRows() {
    if (loadingRows && !data && options.Skeleton) return h(options.Skeleton, { lang: lang, label: t.loading });
    if (loadingRows && !data) {
      return h("div", { className: P + "-skwrap", "aria-busy": "true" },
        h("span", { className: P + "-sr" }, t.loading),
        [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { return h("div", { key: i, className: P + "-sk" }); }));
    }
    if (error) {
      return h("div", { className: P + "-err", role: "alert" },
        h("span", null, t.queryFail + error),
        h("button", { type: "button", className: P + "-btn", onClick: refresh }, t.retry));
    }
    if (!data) return h("div", { className: P + "-empty" }, t.empty);
    var cols = visibleColumns();
    var rows = data.rows || [];
    var narrowing = !!search || activeFilterCount() > 0;
    return h("div", { className: P + "-tablewrap" },
      h("table", { className: P + "-table" },
        h("thead", null,
          h("tr", null,
            h("th", { className: P + "-rownum", scope: "col" }, "#"),
            cols.map(function (col) {
              return h("th", { key: col.name, scope: "col", "aria-sort": ariaSort(col.name) },
                h("button", {
                  type: "button", className: P + "-thbtn", title: colLabel(col) + " · " + col.type,
                  onClick: function () { toggleSort(col.name); },
                },
                  h("span", null, colLabel(col)),
                  h("span", { className: P + "-coltype" }, String(col.type || "").toLowerCase()),
                  sort === col.name ? h("span", { className: P + "-sortmark", "aria-hidden": "true" }, order === "asc" ? "▲" : "▼") : null));
            })),
          h("tr", { className: P + "-frow" },
            h("th", { className: P + "-rownum", scope: "col" }, ""),
            cols.map(filterCell))),
        h("tbody", null, rows.length ? rows.map(function (row, idx) {
          row.__i = idx;
          var deleted = row.deleted_at !== null && row.deleted_at !== undefined;
          return h("tr", { key: row.id || idx, className: P + "-tr" + (deleted ? " deleted" : "") },
            h("td", { className: P + "-rownum" }, (data.page - 1) * data.pageSize + idx + 1),
            cols.map(function (col) {
              var cell = renderCell(row, col);
              if (deleted && col.name === "id") {
                return React.cloneElement(cell, { key: col.name }, cell.props.children, h("span", { className: P + "-delbadge" }, t.deleted));
              }
              return cell;
            }));
        }) : h("tr", null, h("td", { className: P + "-emptycell", colSpan: cols.length + 1 }, narrowing ? t.noRows : t.empty)))));
  }

  function renderFoot() {
    var pages = data ? data.pages : 1;
    var total = data ? data.total : 0;
    return h("div", { className: P + "-foot" },
      h("span", null, fmt(t.total, { n: total })),
      h("span", { className: P + "-grow" }),
      h("button", { type: "button", className: P + "-btn", disabled: !data || page <= 1, onClick: function () { setPage(Math.max(1, page - 1)); } }, "‹ " + t.prev),
      h("span", { className: P + "-pageinfo" }, fmt(t.pageInfo, { page: data ? data.page : 1, pages: pages })),
      h("button", { type: "button", className: P + "-btn", disabled: !data || page >= pages, onClick: function () { setPage(Math.min(pages, page + 1)); } }, t.next + " ›"),
      h("input", {
        className: P + "-jump", type: "number", min: 1, max: pages, "aria-label": t.jump,
        onKeyDown: function (e) { if (e.key === "Enter") { var n = Math.floor(Number(e.target.value)); if (n >= 1) setPage(Math.min(pages, n)); } },
      }),
      h("span", null, fmt(t.queryTime, { n: data ? data.queryMs : 0 })));
  }

  if (!tables && loadingTables && options.Skeleton) return h(options.Skeleton, { lang: lang, label: t.loading });
  if (!tables && loadingTables) {
    return h("div", { className: P + "-skwrap", "aria-busy": "true" }, h("span", { className: P + "-sr" }, t.loading), [0, 1, 2, 3].map(function (i) { return h("div", { key: i, className: P + "-sk" }); }));
  }
  if (!tables) {
    return h("div", { className: P + "-err", role: "alert" }, h("span", null, t.loadFail), h("button", { type: "button", className: P + "-btn", onClick: loadTables }, t.retry));
  }
  if (!tables.length) return h("div", { className: P + "-empty" }, t.emptyTable);

  return h("div", { className: P },
    h("div", { className: P + "-side" },
      h("div", { className: P + "-sidetitle" }, h("span", null, icon("table"), t.tables), h("span", null, String(tables.length))),
      tables.map(function (tb) {
        return h("button", {
          key: tb.name, type: "button", className: P + "-stab" + (tb.name === active ? " on" : ""),
          "aria-pressed": tb.name === active, onClick: function () { selectTable(tb.name); },
        },
          h("span", { className: P + "-stabname" },
            h("span", null, tableLabel(tb)),
            h("span", { className: P + "-sidecount" }, String(tb.count))),
          h("span", { className: P + "-sidetable" }, tb.name));
      })),
    h("div", { className: P + "-main" },
      h("div", { className: P + "-tabs", role: "tablist", "aria-label": t.title },
        h("button", { type: "button", role: "tab", className: P + "-btn", "aria-selected": !index, onClick: leaveIndex }, icon("list"), lang === "en" ? "Row data" : "行数据"),
        h("button", { type: "button", role: "tab", className: P + "-btn", "aria-selected": !!index, onClick: loadIndex }, icon("database"), t.index)),
      index && error ? h("div", { className: P + "-err", role: "alert" }, error) : null,
      index ? renderIndex() : [
      h("div", { className: P + "-head" },
        h("div", { className: P + "-headmain" },
          h("h2", null, icon("database"), tableLabel(current), h("span", { className: P + "-code" }, active)),
          h("div", { className: P + "-sub" },
            current ? fmt(t.rowCount, { n: current.count }) : "",
            current && current.deletedCount ? " · " + fmt(t.deletedCount, { n: current.deletedCount }) : "",
            " · " + t.subtitle)),
        h("button", {
          type: "button", className: P + "-btn", "aria-label": t.refresh, title: t.refresh, "aria-busy": loadingRows ? "true" : "false",
          onClick: refresh,
        }, icon("refresh"), h("span", { className: P + "-btnlabel" }, t.refresh))),
      h("div", { className: P + "-toolbar" },
        h("div", { className: P + "-search" }, icon("search"),
          h("input", {
            type: "search", value: searchDraft, placeholder: t.search, "aria-label": t.search,
            onChange: function (e) { setSearchDraft(e.target.value); },
          })),
        h("label", { className: P + "-switch" },
          h("input", { type: "checkbox", checked: includeDeleted, onChange: function (e) { setIncludeDeleted(e.target.checked); setPage(1); } }),
          h("span", { className: P + "-track" }), h("span", null, t.includeDeleted)),
        h("label", { className: P + "-switch" },
          h("input", { type: "checkbox", checked: showSystem, onChange: function (e) { setShowSystem(e.target.checked); } }),
          h("span", { className: P + "-track" }), h("span", null, t.showSystem)),
        h("span", { className: P + "-grow" }),
        h("label", { style: { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "var(--cfg-muted)" } },
          h("span", null, t.pageSize),
          h("select", {
            className: P + "-select", value: size,
            onChange: function (e) { setPageSize(Number(e.target.value)); setPage(1); },
          }, PAGE_SIZES.map(function (n) { return h("option", { key: n, value: n }, String(n)); })))),
      renderRows(),
      renderFoot()]),
    drawer ? h("div", null,
      h("div", { className: P + "-mask", onClick: function () { setDrawer(null); } }),
      h("aside", { className: P + "-drawer", role: "dialog", "aria-modal": "true", "aria-label": drawer.column },
        h("h3", null, fmt(t.drawerTitle, { column: drawer.column, row: drawer.row }), h("span", { className: P + "-code" }, drawer.name)),
        columnHooks[drawer.name] && columnHooks[drawer.name].detail
          ? columnHooks[drawer.name].detail({ value: drawer.value, lang: lang, prefix: P })
          : h("pre", null, drawerText(drawer.value)),
        h("div", { className: P + "-drawerfoot" },
          h("button", { type: "button", className: P + "-btn", onClick: function () { copyCell(drawer.value); } }, t.copy),
          h("button", { type: "button", className: P + "-btn", onClick: function () { setDrawer(null); } }, t.close)))) : null,
    toast ? h("div", { className: P + "-toast", role: "status" }, toast) : null);
}

function drawerText(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "string" && looksJson(value)) {
    try { return JSON.stringify(JSON.parse(value), null, 2); } catch (e) { return value; }
  }
  if (typeof value === "object") {
    try { return JSON.stringify(value, null, 2); } catch (e) { return String(value); }
  }
  return String(value);
}

return { DataView: DataView, DOMAIN: DOMAIN };
};
