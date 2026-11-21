// 标签筛选下拉：只是 ./search-picker.cjs 上的标签域适配层。
// 交互契约（200ms 防抖、每页 20、已选置顶、Esc 关闭、三态文案）全部由内核提供，
// 这里只注入 action、分页字段、class 前缀与文案，保持 createTagFilter(options) 的对外契约不变。
//
// 约定：本组件不 import 任何业务域，只依赖 ./search-picker.cjs（其内部再用 ./filter-checklist.cjs）。
"use strict";

var React = require("react");
var h = React.createElement;
var SearchPicker = require("./search-picker.cjs");

module.exports = function createTagFilter(options) {
  var conf = options || {};
  var classes = conf.classes || {};
  var pageSize = conf.pageSize || 20;
  var debounce = conf.debounce === undefined ? 200 : conf.debounce;
  var dedupe = conf.dedupe !== false;
  var mapPage =
    conf.mapPage ||
    function (out, pageNumber) {
      return {
        rows: out.records || [],
        total: out.total || 0,
        page: out.current || pageNumber,
        hasMore: !!out.hasNext,
      };
    };
  var items =
    conf.items ||
    function (rows) {
      return rows.map(function (x) {
        return { id: x.id, name: x.name };
      });
    };
  var text = conf.text || function () { return {}; };
  var icon = conf.icon || function () { return null; };
  var caret = conf.caret === undefined ? "▾" : conf.caret;
  var enabled = conf.enabled || function () { return true; };
  var renderSelected = conf.renderSelected || null;

  return function TagFilter(props) {
    var api = props.api;
    var ids = props.ids || [];
    var onChange = props.onChange || function () {};
    var tx = text(props);
    // 已选项可能不在当前页甚至不在当前搜索词里，按 id 补名字保证 chip 可读。
    var namesS = React.useState({});
    var names = namesS[0];

    function mergeNames(rows) {
      if (!rows || !rows.length) return;
      namesS[1](function (prev) {
        var next = Object.assign({}, prev);
        var changed = false;
        rows.forEach(function (x) {
          if (next[String(x.id)] !== x.name) {
            next[String(x.id)] = x.name;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }

    React.useEffect(
      function () {
        if (!ids.length || !conf.names) return;
        var wanted = ids.filter(function (id) {
          return !names[String(id)];
        });
        if (!wanted.length) return;
        var args = conf.names.args ? conf.names.args(wanted) : { ids: wanted };
        api
          .call(conf.names.action, args)
          .then(function (r) {
            if (!r || !r.ok) return;
            mergeNames((r.result && r.result.records) || []);
          })
          .catch(function () {});
      },
      [ids.join(",")],
    );

    function fetchPage(q, pageNumber) {
      return api
        .call(conf.action, { text: q || "", pageNumber: pageNumber, pageSize: pageSize })
        .then(function (r) {
          if (!r || !r.ok) return { rows: [], total: 0, page: pageNumber, hasMore: false };
          var next = mapPage(r.result || {}, pageNumber);
          mergeNames(next.rows);
          return { rows: items(next.rows), total: next.total, page: next.page, hasMore: next.hasMore };
        });
    }

    function nameOf(id) {
      return names[String(id)] || String(id).slice(0, 6);
    }

    if (!enabled(props)) return null;

    return h(SearchPicker, {
      h: h,
      React: React,
      mode: "multi",
      label: tx.label,
      title: tx.all,
      fetchPage: fetchPage,
      pageSize: pageSize,
      debounce: debounce,
      dedupe: dedupe,
      classes: classes,
      menuRole: conf.menuRole,
      menuStyle: conf.menuStyle,
      stopPropagation: conf.stopPropagation,
      reloadKey: props.reloadKey,
      texts: {
        all: tx.all,
        selected: tx.selected,
        clear: tx.clear,
        searchPlaceholder: tx.searchPlaceholder,
        empty: tx.empty,
        noMatch: tx.noMatch,
        loading: tx.loading,
        noMore: tx.noMore,
      },
      icon: icon(props, "tag", 13),
      caret: typeof caret === "function" ? caret(props) : caret,
      selected: ids,
      onChange: onChange,
      nameOf: nameOf,
      renderSelected: renderSelected
        ? function (ctx) {
            return renderSelected({
              ids: ctx.ids,
              names: names,
              toggle: ctx.toggle,
              text: tx,
              classes: classes,
              h: h,
            });
          }
        : null,
    });
  };
};
