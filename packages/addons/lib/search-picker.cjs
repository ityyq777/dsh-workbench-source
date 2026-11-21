// 共享「关键字搜索 + 下拉选择」内核：单选/多选、防抖、滚动分页、已选置顶、Esc 关闭、
// 三态文案，以及已选条目的 chip 回显。标签筛选（./tag-filter.cjs）与保险箱的凭据选择
// 都跑在这一份实现上，业务差异只通过 props / 配置注入。
//
// 约定：
// - 本文件不 import 任何业务域，只依赖 ./filter-checklist.cjs；
// - 候选来源二选一：items（本地数组，本地过滤）或 fetchPage(query, page)（远端分页）；
// - 外壳 class 由调用方传 classes 决定（沿用各插件既有下拉样式），本文件不写死配色。
"use strict";

var React = require("react");
var h = React.createElement;
var FilterChecklist = require("./filter-checklist.cjs");

var DEFAULT_TEXTS = {
  all: "全部",
  selected: "已选",
  clear: "清空",
  searchPlaceholder: "搜索",
  empty: "暂无数据",
  noMatch: "没有匹配项",
  loading: "加载中…",
  noMore: "没有更多",
};

function asText(x) {
  return String(x == null ? "" : x).toLowerCase();
}

/** 本地候选：按 name/meta 做大小写无关的包含匹配；分页交给固定高度滚动区。 */
function filterLocal(items, query) {
  var q = String(query || "").trim();
  if (!q) return items;
  var needle = asText(q);
  return items.filter(function (x) {
    return asText(x.name).indexOf(needle) >= 0 || asText(x.meta).indexOf(needle) >= 0;
  });
}

/** 远端分页 + 防抖 + 竞态保护；返回的 load 供触底加载复用。 */
function useRemoteSource(conf) {
  // hook 一律走宿主传入的 React：测试用的迷你宿主没有全局 current owner。
  var RT = conf.React || React;
  var open = conf.open;
  var query = conf.query;
  var fetchPage = conf.fetchPage;
  var pageSize = conf.pageSize;
  var debounce = conf.debounce;
  var dedupe = conf.dedupe;
  var mapPage = conf.mapPage;
  var reloadKey = conf.reloadKey;

  var rowsS = RT.useState([]);
  var totalS = RT.useState(0);
  var pageS = RT.useState(0);
  var moreS = RT.useState(false);
  var loadS = RT.useState(false);
  var seq = RT.useRef ? RT.useRef(0) : { current: 0 };

  function load(q, pageNumber, append) {
    var mine = ++seq.current;
    loadS[1](true);
    return Promise.resolve(fetchPage(q, pageNumber))
      .then(function (raw) {
        if (mine !== seq.current) return;
        loadS[1](false);
        var next = mapPage ? mapPage(raw, pageNumber) : raw || {};
        var list = next.rows || [];
        rowsS[1](function (prev) {
          if (!append) return list;
          var joined = dedupe === false ? prev.concat(list) : prev.concat(list);
          if (dedupe === false) return joined;
          var seen = {};
          return joined.filter(function (x) {
            var key = String(x.id);
            if (seen[key]) return false;
            seen[key] = true;
            return true;
          });
        });
        totalS[1](typeof next.total === "number" ? next.total : list.length);
        pageS[1](next.page || pageNumber);
        moreS[1](!!next.hasMore);
      })
      .catch(function () {
        if (mine === seq.current) loadS[1](false);
      });
  }

  RT.useEffect(
    function () {
      if (!open) return undefined;
      var timer = setTimeout(
        function () {
          load(query, 1, false);
        },
        query ? debounce : 0,
      );
      return function () {
        clearTimeout(timer);
      };
    },
    [open, query, reloadKey],
  );

  return {
    rows: rowsS[0],
    total: totalS[0],
    page: pageS[0],
    hasMore: moreS[0],
    loading: loadS[0],
    loadQuery: load,
    reset: function () {
      seq.current += 1;
      rowsS[1]([]);
      totalS[1](0);
      pageS[1](0);
      moreS[1](false);
      loadS[1](false);
    },
  };
}

function SearchPicker(props) {
  var RT = props.React || React;
  var texts = Object.assign({}, DEFAULT_TEXTS, props.texts || {});
  var classes = props.classes || {};
  var mode = props.mode === "single" ? "single" : "multi";
  var disabled = props.disabled === true;
  var selected = (props.selected || []).map(String);
  var items = props.items || null;
  var fetchPage = props.fetchPage || null;
  var pageSize = props.pageSize || 20;
  var debounce = props.debounce === undefined ? 200 : props.debounce;
  var allItems = items || [];
  var openS = RT.useState(false);
  var open = openS[0];
  var queryS = RT.useState("");
  var query = queryS[0];
  var boxRef = RT.useRef ? RT.useRef(null) : { current: null };

  var remote = fetchPage ? useRemoteSource({
    React: RT,
    open: open,
    query: query,
    fetchPage: fetchPage,
    pageSize: pageSize,
    debounce: debounce,
    dedupe: props.dedupe,
    mapPage: props.mapPage,
    reloadKey: props.reloadKey,
  }) : null;

  var rows = remote ? remote.rows : filterLocal(allItems, query);
  var loading = remote ? remote.loading : false;
  var total = remote ? remote.total : rows.length;
  var hasMore = remote ? remote.hasMore : false;

  RT.useEffect(function () {
    if (!open || typeof document === "undefined") return undefined;
    function onDown(e) {
      var box = boxRef.current;
      if (box && !box.contains(e.target)) openS[1](false);
    }
    function onKey(e) {
      if (e.key === "Escape") openS[1](false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return function () {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function commit(next) {
    if (props.onChange) props.onChange(next);
  }

  function toggle(id) {
    if (disabled) return;
    var key = String(id);
    if (mode === "single") {
      openS[1](false);
      if (props.onPick) props.onPick(key, rowOf(key));
      commit([key]);
      return;
    }
    var next = selected.slice();
    var i = next.indexOf(key);
    if (i >= 0) next.splice(i, 1);
    else next.push(key);
    commit(next);
  }

  function rowOf(id) {
    var hit = rows.filter(function (x) {
      return String(x.id) === String(id);
    })[0];
    if (hit) return hit;
    return (allItems || []).filter(function (x) {
      return String(x.id) === String(id);
    })[0] || null;
  }

  var label = props.label || texts.all;
  var caret = props.caret === undefined ? "▾" : props.caret;
  var count = selected.length;
  var chips = props.renderSelected
    ? props.renderSelected({ ids: selected, toggle: toggle, nameOf: props.nameOf || rowOf, texts: texts })
    : null;

  return h("div", { className: classes.root, ref: boxRef },
    h("button", {
      type: "button",
      className: classes.btn + (count ? " " + (classes.btnOn || "is-on") : ""),
      "aria-haspopup": "dialog",
      "aria-expanded": open ? "true" : "false",
      disabled: disabled,
      onClick: function (e) {
        if (props.stopPropagation) e.stopPropagation();
        openS[1](!open);
      },
    },
      props.icon ? props.icon : null,
      label + (count ? " · " + count : ""),
      typeof caret === "function" ? caret : caret),
    chips,
    open
      ? h("div", {
          className: classes.menu,
          role: props.menuRole,
          style: props.menuStyle,
          onClick: props.stopPropagation
            ? function (e) {
                e.stopPropagation();
              }
            : undefined,
        },
          h(FilterChecklist, {
            mode: mode,
            items: rows,
            selected: selected,
            onToggle: toggle,
            onPick: toggle,
            query: query,
            onQuery: queryS[1],
            title: props.title || label,
            total: total,
            selectedText: texts.selected,
            clearText: texts.clear,
            onClear: function () {
              commit([]);
              queryS[1]("");
            },
            searchPlaceholder: texts.searchPlaceholder,
            loading: loading,
            hasMore: hasMore,
            onLoadMore: remote
              ? function () {
                  remote.loadQuery(query, (remote.page || 1) + 1, true);
                }
              : undefined,
            emptyText: texts.empty,
            noMatchText: texts.noMatch,
            loadingText: texts.loading,
            noMoreText: texts.noMore,
            groupLabel: props.title || label,
            autoFocus: props.autoFocus,
            beforeHead: props.beforeHead || null,
          }),
          props.footer || null)
      : null);
}

module.exports = SearchPicker;
module.exports.filterLocal = filterLocal;
module.exports.DEFAULT_TEXTS = DEFAULT_TEXTS;
