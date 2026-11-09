"use strict";
/**
 * 数据页：左侧表清单 + 右侧只读表格。
 *
 * 只依赖两个 action：<domain>.dataTables / <domain>.dataQuery；
 * 表名、列名全部来自服务端，客户端不做任何拼接查询。
 * 样式只用主题 token，模板由三份 data.cjs 共用（tags / wbg 替换）。
 */

var React = require("react");
var h = React.createElement;
var configView = require("./config.cjs");

var DOMAIN = "tags";
var PREFIX = "wbg";
var P = PREFIX + "-data";

var CFG_FALLBACK = {
  "data.pageSize": 50,
  "data.showSystemColumns": false,
  "data.includeDeleted": false,
};

var PAGE_SIZES = [10, 25, 50, 100, 200];

var COPY = {
  zh: {
    title: "数据",
    subtitle: "只读浏览本插件负责的表；系统列与已删除行默认隐藏",
    tables: "表",
    rows: "行",
    deleted: "已删除",
    rowCount: "共 {n} 行",
    deletedCount: "其中 {n} 行已删除",
    search: "搜索所有文本列…",
    pageSize: "每页",
    includeDeleted: "含已删除",
    showSystem: "系统列",
    refresh: "刷新",
    loading: "载入中…",
    empty: "这张表还没有数据",
    emptyTable: "没有可展示的表",
    loadFail: "数据服务不可用（插件版本过旧？）",
    retry: "重试",
    queryFail: "查询失败：",
    noRows: "没有匹配的行",
    prev: "上一页",
    next: "下一页",
    pageInfo: "第 {page} / {pages} 页",
    jump: "跳转",
    total: "共 {n} 行",
    copied: "已复制",
    copy: "复制",
    close: "关闭",
    drawerTitle: "{column} · 第 {row} 行",
    nullText: "NULL",
    emptyText: "空",
    yes: "是",
    no: "否",
    json: "JSON",
    queryTime: "{n} ms",
    sortAsc: "升序",
    sortDesc: "降序",
    filterCol: "筛选…",
    filterClear: "清除筛选",
    index: "表索引",
    indexSub: "本插件负责的表（tag / tag_mapping）：行数、列数、主键、索引与最近写入（只读）",
    idxTable: "表",
    idxRows: "行数",
    idxCols: "列数",
    idxKey: "主键",
    idxIndexes: "索引",
    idxLastWrite: "最近写入",
    idxNone: "无",
    idxEmpty: "没有可统计的表",
    idxTables: "表",
    idxAt: "统计时间",
  },
  en: {
    title: "Data",
    subtitle: "Read-only view of this plugin's tables; system and deleted rows are hidden by default",
    tables: "Tables",
    rows: "rows",
    deleted: "deleted",
    rowCount: "{n} rows",
    deletedCount: "{n} deleted",
    search: "Search all text columns…",
    pageSize: "Rows",
    includeDeleted: "Deleted",
    showSystem: "System",
    refresh: "Refresh",
    loading: "Loading…",
    empty: "This table has no rows yet",
    emptyTable: "No tables to show",
    loadFail: "Data service unavailable (plugin too old?)",
    retry: "Retry",
    queryFail: "Query failed: ",
    noRows: "No matching rows",
    prev: "Previous",
    next: "Next",
    pageInfo: "Page {page} / {pages}",
    jump: "Jump",
    total: "{n} rows",
    copied: "Copied",
    copy: "Copy",
    close: "Close",
    drawerTitle: "{column} · row {row}",
    nullText: "NULL",
    emptyText: "empty",
    yes: "Yes",
    no: "No",
    json: "JSON",
    queryTime: "{n} ms",
    sortAsc: "ascending",
    sortDesc: "descending",
    filterCol: "Filter…",
    filterClear: "Clear filter",
    index: "Table index",
    indexSub: "Tables owned by Tags (tag / tag_mapping): rows, columns, primary key, indexes and last write (read-only)",
    idxTable: "Table",
    idxRows: "Rows",
    idxCols: "Cols",
    idxKey: "Primary key",
    idxIndexes: "Indexes",
    idxLastWrite: "Last write",
    idxNone: "—",
    idxEmpty: "No tables to index",
    idxTables: "Tables",
    idxAt: "Generated",
  },
};

var COLUMN_TYPE_ORDER = { id: 1, path: 2, text: 3, number: 4, bool: 4, date: 5, timestamp: 6 };

var CSS = [
  "." + P + "{--cfg-line:var(--wb-line,var(--dsw-alias-border-l2,color-mix(in oklab,currentColor 16%,transparent)));--cfg-surface:var(--wb-surface,var(--dsw-alias-bg-layer-1,transparent));--cfg-muted:var(--dsw-alias-label-secondary,color-mix(in oklab,currentColor 62%,transparent));--cfg-faint:var(--dsw-alias-label-tertiary,color-mix(in oklab,currentColor 42%,transparent));--cfg-hover:var(--dsw-alias-interactive-bg-hover,color-mix(in oklab,currentColor 5%,transparent));display:grid;grid-template-columns:216px minmax(0,1fr);gap:16px;width:100%;min-width:0;color:inherit;font-size:13px;align-items:start}",
  "." + P + "-side{position:sticky;top:12px;display:flex;flex-direction:column;gap:3px;border:1px solid var(--cfg-line);border-radius:14px;background:var(--cfg-surface);padding:8px;box-shadow:0 1px 2px color-mix(in oklab,currentColor 3%,transparent)}",
  "." + P + "-sidetitle{display:flex;align-items:center;justify-content:space-between;padding:6px 10px 8px;font-size:11px;font-weight:660;letter-spacing:.6px;text-transform:uppercase;color:var(--cfg-faint)}",
  "." + P + "-stab{display:flex;flex-direction:column;gap:3px;align-items:stretch;border:1px solid transparent;background:transparent;border-radius:9px;padding:8px 10px;font:inherit;color:inherit;text-align:left;cursor:pointer;position:relative;transition:background .12s ease,border-color .12s ease}",
  "." + P + "-stab:hover{background:var(--cfg-hover)}",
  "." + P + "-stab:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,currentColor);outline-offset:2px}",
  "." + P + "-stab.on{background:color-mix(in oklab,currentColor 6%,transparent);border-color:var(--cfg-line)}",
  "." + P + "-stab.on::before{content:'';position:absolute;left:-1px;top:9px;bottom:9px;width:2px;border-radius:2px;background:var(--dsw-alias-brand-primary,currentColor)}",
  "." + P + "-stabname{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;line-height:1.4;min-width:0}",
  "." + P + "-stabname span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
  "." + P + "-sidetable{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px;color:var(--cfg-muted);margin-top:3px;letter-spacing:.2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
  "." + P + "-sidecount{margin-left:auto;font-size:10.5px;font-variant-numeric:tabular-nums;color:var(--cfg-muted);background:color-mix(in oklab,currentColor 8%,transparent);border-radius:999px;padding:1px 7px;flex:none}",
  "." + P + "-main{display:flex;flex-direction:column;gap:10px;min-width:0;border:1px solid var(--cfg-line);border-radius:14px;background:var(--cfg-surface);padding:14px 16px 12px;box-shadow:0 1px 2px color-mix(in oklab,currentColor 3%,transparent)}",
  "." + P + "-head{display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap}",
  "." + P + "-headmain{min-width:0;flex:1}",
  "." + P + "-head h2{margin:0;font-size:16px;font-weight:660;letter-spacing:.1px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
  "." + P + "-code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;font-weight:500;color:var(--cfg-muted);background:color-mix(in oklab,currentColor 6%,transparent);border-radius:6px;padding:2px 6px}",
  "." + P + "-sub{font-size:11.5px;color:var(--cfg-muted);line-height:1.55;margin-top:4px}",
  "." + P + "-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:2px 0 4px}",
  "." + P + "-search{position:relative;flex:1;min-width:180px;max-width:340px}",
  "." + P + "-search input{width:100%;border:1px solid var(--cfg-line);background:var(--dsw-alias-bg-base,transparent);color:inherit;border-radius:9px;padding:8px 11px;font:inherit;font-size:12.5px;outline:none;transition:border-color .15s ease,box-shadow .15s ease}",
  "." + P + "-search input:hover{border-color:color-mix(in oklab,currentColor 28%,var(--cfg-line))}",
  "." + P + "-search input:focus{border-color:var(--dsw-alias-brand-primary,currentColor);box-shadow:0 0 0 3px color-mix(in oklab,var(--dsw-alias-brand-primary,currentColor) 14%,transparent)}",
  "." + P + "-select{border:1px solid var(--cfg-line);background:var(--dsw-alias-bg-base,transparent);color:inherit;border-radius:9px;padding:7px 10px;font:inherit;font-size:12px;outline:none}",
  "." + P + "-select:focus{border-color:var(--dsw-alias-brand-primary,currentColor);box-shadow:0 0 0 3px color-mix(in oklab,var(--dsw-alias-brand-primary,currentColor) 14%,transparent)}",
  "." + P + "-switch{position:relative;display:inline-flex;align-items:center;gap:7px;cursor:pointer;font-size:12px;color:var(--cfg-muted);user-select:none;padding:4px 2px}",
  "." + P + "-switch input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer}",
  "." + P + "-track{position:relative;width:34px;height:20px;border-radius:999px;background:color-mix(in oklab,currentColor 18%,transparent);transition:background .16s ease;flex:none}",
  "." + P + "-track::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--dsw-alias-label-primary,currentColor);transition:transform .16s ease,background .16s ease}",
  "." + P + "-switch input:checked+." + P + "-track{background:var(--dsw-alias-brand-primary,currentColor)}",
  "." + P + "-switch input:checked+." + P + "-track::after{transform:translateX(14px);background:var(--dsw-alias-label-primary-inverted,var(--dsw-alias-bg-base))}",
  "." + P + "-switch input:focus-visible+." + P + "-track{outline:2px solid var(--dsw-alias-brand-primary,currentColor);outline-offset:2px}",
  "." + P + "-btn{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--cfg-line);background:transparent;color:var(--cfg-muted);border-radius:8px;padding:6px 10px;font:inherit;font-size:11.5px;cursor:pointer;white-space:nowrap;transition:background .12s ease,color .12s ease}",
  "." + P + "-btn:hover{background:var(--cfg-hover);color:var(--dsw-alias-label-primary,inherit)}",
  "." + P + "-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,currentColor);outline-offset:2px}",
  "." + P + "-btn:disabled{opacity:.45;cursor:not-allowed}",
  "." + P + "-btn[aria-busy='true']{opacity:.6}",
  "." + P + "-tablewrap{overflow:auto;max-height:calc(100vh - 300px);border:1px solid var(--cfg-line);border-radius:11px;background:var(--dsw-alias-bg-base,transparent)}",
  "." + P + "-table{border-collapse:separate;border-spacing:0;width:max-content;min-width:100%;font-size:12.5px}",
  "." + P + "-table th{position:sticky;top:0;z-index:2;background:var(--cfg-surface);border-bottom:1px solid var(--cfg-line);padding:0;text-align:left;font-weight:600;white-space:nowrap}",
  "." + P + "-thbtn{display:flex;align-items:baseline;gap:6px;width:100%;border:0;background:transparent;color:inherit;font:inherit;font-size:11.5px;font-weight:660;letter-spacing:.2px;padding:9px 12px;cursor:pointer;text-align:left;white-space:nowrap}",
  "." + P + "-thbtn:hover{background:var(--cfg-hover)}",
  "." + P + "-thbtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,currentColor);outline-offset:-2px}",
  "." + P + "-coltype{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9.5px;font-weight:500;color:var(--cfg-faint);letter-spacing:.3px}",
  "." + P + "-sortmark{color:var(--dsw-alias-brand-primary,currentColor);font-size:10px}",
  "." + P + "-rownum{position:sticky;left:0;z-index:1;background:var(--cfg-surface);color:var(--cfg-faint);text-align:right;font-variant-numeric:tabular-nums;font-size:10.5px;padding:0 8px;width:1%;white-space:nowrap;border-right:1px solid color-mix(in oklab,currentColor 7%,transparent)}",
  "." + P + "-table thead .rownum{z-index:3}",
  "." + P + "-cell{padding:7px 12px;border-bottom:1px solid color-mix(in oklab,currentColor 6%,transparent);max-width:340px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:default;vertical-align:top}",
  "." + P + "-table tbody tr:hover .cell{background:var(--cfg-hover)}",
  "." + P + "-table tbody tr:nth-child(even) .cell,." + P + "-table tbody tr:nth-child(even) .rownum{background:color-mix(in oklab,currentColor 2.5%,transparent)}",
  "." + P + "-cell.num{text-align:right;font-variant-numeric:tabular-nums}",
  "." + P + "-cell.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px}",
  "." + P + "-cell.null{color:var(--cfg-faint);font-style:italic}",
  "." + P + "-cell.json .v{color:var(--dsw-alias-brand-primary,inherit)}",
  "." + P + "-tr.deleted .cell,." + P + "-tr.deleted .rownum{opacity:.55}",
  "." + P + "-tr.deleted .cell .v{text-decoration:line-through;text-decoration-color:color-mix(in oklab,currentColor 35%,transparent)}",
  "." + P + "-delbadge{display:inline-block;margin-left:6px;font-size:9.5px;line-height:1.5;padding:0 5px;border-radius:999px;background:color-mix(in oklab,var(--dsw-alias-state-error-primary,currentColor) 14%,transparent);color:var(--dsw-alias-state-error-primary,inherit);vertical-align:middle}",
  "." + P + "-foot{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-top:2px;font-size:11.5px;color:var(--cfg-muted)}",
  "." + P + "-grow{flex:1}",
  "." + P + "-pageinfo{font-variant-numeric:tabular-nums}",
  "." + P + "-jump{width:56px;border:1px solid var(--cfg-line);background:var(--dsw-alias-bg-base,transparent);color:inherit;border-radius:7px;padding:4px 7px;font:inherit;font-size:11.5px;text-align:right;outline:none}",
  "." + P + "-jump:focus{border-color:var(--dsw-alias-brand-primary,currentColor)}",
  "." + P + "-empty{border:1px dashed var(--cfg-line);border-radius:11px;padding:44px 16px;text-align:center;font-size:12.5px;color:var(--cfg-muted)}",
  "." + P + "-err{display:flex;align-items:center;gap:10px;flex-wrap:wrap;border:1px solid color-mix(in oklab,var(--dsw-alias-state-error-primary,currentColor) 32%,var(--cfg-line));border-radius:10px;padding:9px 12px;color:var(--dsw-alias-state-error-primary,inherit);font-size:12px;line-height:1.5}",
  "." + P + "-skwrap{display:flex;flex-direction:column;gap:1px;padding:2px}",
  "." + P + "-sk{height:26px;border-radius:4px;background:var(--dsw-alias-bg-skeleton,color-mix(in oklab,currentColor 6%,transparent));animation:" + PREFIX + "-data-pulse 1.4s ease-in-out infinite}",
  "@keyframes " + PREFIX + "-data-pulse{0%,100%{opacity:.6}50%{opacity:1}}",
  "." + P + "-toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:40;background:var(--dsw-alias-bg-layer-1,var(--cfg-surface));border:1px solid var(--cfg-line);border-radius:999px;padding:7px 14px;font-size:12px;color:var(--dsw-alias-label-primary,inherit);box-shadow:0 6px 24px color-mix(in oklab,currentColor 18%,transparent)}",
  "." + P + "-mask{position:fixed;inset:0;z-index:30;background:color-mix(in oklab,currentColor 26%,transparent)}",
  "." + P + "-drawer{position:fixed;top:0;right:0;bottom:0;z-index:31;width:min(520px,92vw);display:flex;flex-direction:column;gap:12px;background:var(--dsw-alias-bg-layer-1,var(--cfg-surface));border-left:1px solid var(--cfg-line);box-shadow:-8px 0 28px color-mix(in oklab,currentColor 16%,transparent);padding:18px 20px}",
  "." + P + "-drawer h3{margin:0;font-size:14px;font-weight:660;display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
  "." + P + "-drawer pre{margin:0;flex:1;overflow:auto;border:1px solid var(--cfg-line);border-radius:10px;background:var(--dsw-alias-bg-base,transparent);padding:12px 14px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;line-height:1.65;white-space:pre-wrap;word-break:break-word}",
  "." + P + "-drawerfoot{display:flex;gap:8px;justify-content:flex-end}",
  "." + P + "-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}",
  "@media (max-width:900px){." + P + "{grid-template-columns:minmax(0,1fr)}." + P + "-side{position:static;flex-direction:row;flex-wrap:wrap;gap:6px;padding:6px}." + P + "-sidetitle{display:none}." + P + "-stab{padding:6px 10px;flex:none}." + P + "-sidecount{display:none}." + P + "-tablewrap{max-height:calc(100vh - 260px)}}",
  "@media (prefers-reduced-motion:reduce){." + P + "-track,." + P + "-track::after,." + P + "-sk,." + P + "-drawer{transition:none;animation:none}}",
  "." + P + "-idxsub{font-size:11.5px;color:var(--cfg-muted);line-height:1.55}",
  "." + P + "-idxsum{display:flex;gap:16px;flex-wrap:wrap;font-size:11.5px;color:var(--cfg-muted)}",
  "." + P + "-idxsum b{font-weight:660;color:var(--dsw-alias-label-primary,inherit);font-variant-numeric:tabular-nums}",
  "." + P + "-idxname{font-size:12.5px;font-weight:600}",
  "." + P + "-idxtags{display:flex;flex-wrap:wrap;gap:4px;max-width:280px}",
  "." + P + "-idxchip{display:inline-block;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;line-height:1.6;border-radius:999px;padding:0 7px;background:color-mix(in oklab,currentColor 7%,transparent);color:var(--cfg-muted);white-space:nowrap}",
  "." + P + "-idxchip.u{background:color-mix(in oklab,var(--dsw-alias-brand-primary,currentColor) 15%,transparent);color:var(--dsw-alias-brand-primary,inherit)}",
  "." + P + "-idxnone{color:var(--cfg-faint)}",
  "." + P + "-frow th{padding:0 8px 6px;border-bottom:1px solid var(--cfg-line)}",
  "." + P + "-fcell{position:relative;display:block;min-width:96px}",
  "." + P + "-finput{width:100%;box-sizing:border-box;border:1px solid transparent;border-radius:6px;background:color-mix(in oklab,currentColor 4%,transparent);color:inherit;font:inherit;font-size:11.5px;padding:3px 18px 3px 6px;min-width:0}",
  "." + P + "-finput:hover{background:color-mix(in oklab,currentColor 7%,transparent)}",
  "." + P + "-finput:focus{outline:none;border-color:var(--dsw-alias-brand-primary,currentColor);background:var(--cfg-surface)}",
  "." + P + "-fclear{position:absolute;right:2px;top:50%;transform:translateY(-50%);border:0;background:transparent;color:var(--cfg-muted);cursor:pointer;font-size:13px;line-height:1;padding:2px 4px;border-radius:4px}",
  "." + P + "-fclear:hover{color:inherit;background:var(--cfg-hover)}",
  "." + P + "-emptycell{padding:22px 12px;text-align:center;color:var(--cfg-muted)}",
].join("\n").split("wbg").join(PREFIX);

function injectCss() {
  if (typeof document === "undefined") return;
  var old = document.getElementById("wb-addon-" + DOMAIN + "-data-css");
  if (old) { old.textContent = CSS; return; }
  var style = document.createElement("style");
  style.id = "wb-addon-" + DOMAIN + "-data-css";
  style.setAttribute("data-wb-addon", "wb-addon-" + DOMAIN);
  style.textContent = CSS;
  document.head.appendChild(style);
}

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
  var t = COPY[lang];
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
    return function () { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  React.useEffect(function () {
    if (!active) return;
    setPage(1);
    setSort("");
    setOrder("desc");
    setSearch("");
    setSearchDraft("");
    setFilterDraft({});
    setFilters({});
  }, [active]);

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
    if (!active || !cfgWrap.ready) return undefined;
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
    return undefined;
  }, [active, page, size, sort, order, search, includeDeleted, cfgWrap.ready, filtersKey]);

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
  function loadIndex() {
    setIndexBusy(true);
    Promise.resolve(api.call(DOMAIN + ".dataTables", { stats: true }))
      .then(function (r) {
        var payload = unwrap(r) || {};
        var rows = (payload.tables || []).map(function (tb) { return { table: tb, stats: tb.stats || null }; });
        setIndex(rows);
        setIndexBusy(false);
      })
      .catch(function () {
        setIndex([]);
        setIndexBusy(false);
      });
  }

  function toggleIndex() {
    if (index) { setIndex(null); return; }
    loadIndex();
  }

  function renderIndex() {
    var rows = index || [];
    var totalRows = rows.reduce(function (n, r) { return n + (r.stats && Number(r.stats.rows) || 0); }, 0);
    return h("div", { className: P + "-idx" },
      h("div", { className: P + "-head" },
        h("div", { className: P + "-headmain" },
          h("h2", null, t.index, h("span", { className: P + "-code" }, "index")),
          h("div", { className: P + "-idxsub" }, t.indexSub)),
        h("button", {
          type: "button", className: P + "-btn", "aria-busy": indexBusy ? "true" : "false",
          onClick: function () { loadIndex(); },
        }, t.refresh)),
      h("div", { className: P + "-idxsum" },
        h("span", null, t.idxTables, " ", h("b", null, String(rows.length))),
        h("span", null, t.idxRows, " ", h("b", null, String(totalRows)))),
      indexBusy && !rows.length
        ? h("div", { className: P + "-empty" }, t.loading)
        : !rows.length
          ? h("div", { className: P + "-empty" }, t.idxEmpty)
          : h("div", { className: P + "-tablewrap" },
            h("table", { className: P + "-table" },
              h("thead", null, h("tr", null,
                h("th", { scope: "col" }, h("span", { className: P + "-thbtn" }, t.idxTable)),
                h("th", { scope: "col" }, h("span", { className: P + "-thbtn" }, t.idxRows)),
                h("th", { scope: "col" }, h("span", { className: P + "-thbtn" }, t.idxCols)),
                h("th", { scope: "col" }, h("span", { className: P + "-thbtn" }, t.idxKey)),
                h("th", { scope: "col" }, h("span", { className: P + "-thbtn" }, t.idxIndexes)),
                h("th", { scope: "col" }, h("span", { className: P + "-thbtn" }, t.idxLastWrite)))),
              h("tbody", null, rows.map(function (row) {
                var st = row.stats || {};
                var pk = (st.primaryKey || []).join(", ");
                var indexes = st.indexes || [];
                return h("tr", { className: P + "-tr", key: row.table.name },
                  h("td", { className: P + "-cell" },
                    h("div", { className: P + "-idxname" }, tableLabel(row.table)),
                    h("div", { className: P + "-sidetable" }, row.table.name)),
                  h("td", { className: P + "-cell num" }, String(st.rows === undefined ? row.table.count : st.rows)),
                  h("td", { className: P + "-cell num" }, String(st.columnCount || (row.table.columns || []).length)),
                  h("td", { className: P + "-cell" }, pk
                    ? h("span", { className: P + "-idxchip u" }, pk)
                    : h("span", { className: P + "-idxnone" }, t.idxNone)),
                  h("td", { className: P + "-cell" }, h("div", { className: P + "-idxtags" }, indexes.length
                    ? indexes.map(function (ix) {
                      return h("span", {
                        key: ix.name, title: ix.name + " (" + (ix.columns || []).join(", ") + ")",
                        className: P + "-idxchip" + (ix.unique ? " u" : ""),
                      }, (ix.columns || []).join(",") || ix.name);
                    })
                    : h("span", { className: P + "-idxnone" }, t.idxNone))),
                  h("td", { className: P + "-cell mono" }, st.lastWrite
                    ? timeText(st.lastWrite.at)
                    : h("span", { className: P + "-idxnone" }, t.idxNone)));
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
    var cols = data && data.columns ? data.columns : [];
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
    var text = cellText(col, value);
    var content;
    if (text === null) content = h("span", { className: "v" }, t.nullText);
    else if (text === "") content = h("span", { className: "v" }, '""');
    else content = h("span", { className: "v" }, text);
    return h("td", {
      key: col.name,
      className: cellClass(col, value),
      title: cellTitle(col, value),
      onClick: function () { copyCell(value); },
      onDoubleClick: function () {
        setDrawer({ column: colLabel(col), name: col.name, row: (data.page - 1) * data.pageSize + row.__i + 1, value: value });
      },
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
    if (loadingRows && !data) {
      return h("div", { className: P + "-skwrap", "aria-busy": "true" },
        h("span", { className: P + "-sr" }, t.loading),
        [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { return h("div", { key: i, className: P + "-sk" }); }));
    }
    if (error) {
      return h("div", { className: P + "-err", role: "alert" },
        h("span", null, t.queryFail + error),
        h("button", { type: "button", className: P + "-btn", onClick: loadTables }, t.retry));
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

  if (!tables && loadingTables) {
    return h("div", { className: P + "-skwrap", "aria-busy": "true" }, h("span", { className: P + "-sr" }, t.loading), [0, 1, 2, 3].map(function (i) { return h("div", { key: i, className: P + "-sk" }); }));
  }
  if (!tables) {
    return h("div", { className: P + "-err", role: "alert" }, h("span", null, t.loadFail), h("button", { type: "button", className: P + "-btn", onClick: loadTables }, t.retry));
  }
  if (!tables.length) return h("div", { className: P + "-empty" }, t.emptyTable);

  return h("div", { className: P },
    h("div", { className: P + "-side" },
      h("div", { className: P + "-sidetitle" }, h("span", null, t.tables), h("span", null, String(tables.length))),
      tables.map(function (tb) {
        return h("button", {
          key: tb.name, type: "button", className: P + "-stab" + (tb.name === active ? " on" : ""),
          "aria-pressed": tb.name === active, onClick: function () { setActive(tb.name); },
        },
          h("span", { className: P + "-stabname" },
            h("span", null, tableLabel(tb)),
            h("span", { className: P + "-sidecount" }, String(tb.count))),
          h("span", { className: P + "-sidetable" }, tb.name),
          tb.deletedCount ? h("span", { className: P + "-sidetable" }, tb.deletedCount + " " + t.deleted) : null);
      }),
      h("button", {
        type: "button", className: P + "-stab" + (index ? " on" : ""),
        "aria-pressed": !!index, onClick: toggleIndex,
      },
        h("span", { className: P + "-stabname" },
          h("span", null, t.index),
          h("span", { className: P + "-sidecount" }, index ? String(index.length) : "")),
        h("span", { className: P + "-sidetable" }, "index"))),
    h("div", { className: P + "-main" },
      index ? renderIndex() : [
      h("div", { className: P + "-head" },
        h("div", { className: P + "-headmain" },
          h("h2", null, tableLabel(current), h("span", { className: P + "-code" }, active)),
          h("div", { className: P + "-sub" },
            current ? fmt(t.rowCount, { n: current.count }) : "",
            current && current.deletedCount ? " · " + fmt(t.deletedCount, { n: current.deletedCount }) : "",
            " · " + t.subtitle)),
        h("button", {
          type: "button", className: P + "-btn", "aria-busy": loadingRows ? "true" : "false",
          onClick: function () { loadTables(); setPage(page); setSort(sort); setSearch(search); },
        }, t.refresh)),
      h("div", { className: P + "-toolbar" },
        h("div", { className: P + "-search" },
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
        h("pre", null, drawerText(drawer.value)),
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

module.exports = { DataView: DataView, DOMAIN: DOMAIN };
