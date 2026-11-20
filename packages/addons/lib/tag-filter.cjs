// 共享标签筛选下拉：搜索防抖 + 滚动分页 + 已选置顶 + Esc 关闭。
// 任务、站点、储物三处原本各写一份，交互契约一致（200ms 防抖、每页 20、触底 24px、
// 已选置顶、Esc 关闭、三态文案），差异只在 action、分页字段、class 前缀与文案；
// 这里用配置收敛成一份，业务差异由调用方通过 mapPage / items / text / renderSelected 注入。
//
// 约定：本组件不 import 任何业务域，只依赖 ./filter-checklist.cjs。
"use strict";

var React = require("react");
var h = React.createElement;
var FilterChecklist = require("./filter-checklist.cjs");

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
    var t = text(props);

    // 标签是可选子插件：默认按「可用」渲染，探针失败时保持原样，交给后端降级。
    var availS = React.useState(true);
    var openS = React.useState(false);
    var open = openS[0];
    var setOpen = openS[1];
    var queryS = React.useState("");
    var query = queryS[0];
    var setQuery = queryS[1];
    var rowsS = React.useState([]);
    var rows = rowsS[0];
    var setRows = rowsS[1];
    var totalS = React.useState(0);
    var total = totalS[0];
    var setTotal = totalS[1];
    var pageS = React.useState(0);
    var page = pageS[0];
    var setPage = pageS[1];
    var hasMoreS = React.useState(false);
    var hasMore = hasMoreS[0];
    var setHasMore = hasMoreS[1];
    var loadingS = React.useState(false);
    var loading = loadingS[0];
    var setLoading = loadingS[1];
    var namesS = React.useState({});
    var names = namesS[0];
    var setNames = namesS[1];
    // 搜索/翻页的竞态保护：只接受最后一次请求的结果。
    var seq = React.useRef(0);

    var load = React.useCallback(
      function (q, pageNumber, append) {
        var mine = ++seq.current;
        setLoading(true);
        return api
          .call(conf.action, { text: q || "", pageNumber: pageNumber, pageSize: pageSize })
          .then(function (r) {
            if (mine !== seq.current) return;
            setLoading(false);
            if (!r || !r.ok) return;
            var next = mapPage(r.result || {}, pageNumber);
            setRows(function (prev) {
              if (!append) return next.rows;
              if (!dedupe) return prev.concat(next.rows);
              var seen = {};
              var out = [];
              prev.concat(next.rows).forEach(function (x) {
                var key = String(x.id);
                if (seen[key]) return;
                seen[key] = true;
                out.push(x);
              });
              return out;
            });
            setTotal(next.total);
            setPage(next.page);
            setHasMore(next.hasMore);
            setNames(function (prev) {
              var map = Object.assign({}, prev);
              next.rows.forEach(function (x) {
                map[String(x.id)] = x.name;
              });
              return map;
            });
          })
          .catch(function () {
            if (mine === seq.current) setLoading(false);
          });
      },
      [api],
    );

    // 展开或改搜索词时重取第一页；空关键词不防抖，立刻给出首页。
    React.useEffect(
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
      [open, query, load, props.reloadKey],
    );

    // 子插件是否存在（任务插件的标签是可选的）。
    React.useEffect(
      function () {
        if (!conf.probe) return;
        api
          .call(conf.probe.action || conf.action, conf.probe.args || {})
          .then(function (r) {
            if (r && r.ok) availS[1](!!(conf.probe.available && conf.probe.available(r.result)));
          })
          .catch(function () {});
      },
      [api],
    );

    // 已选标签可能不在当前页甚至不在当前搜索词里，按 id 补名字保证可读。
    React.useEffect(
      function () {
        if (!open || !ids.length || !conf.names) return;
        var wanted = ids.filter(function (id) {
          return !names[String(id)];
        });
        if (!wanted.length) return;
        var args = conf.names.args ? conf.names.args(wanted) : { ids: wanted };
        api
          .call(conf.names.action, args)
          .then(function (r) {
            if (!r || !r.ok) return;
            var map = {};
            ((r.result && r.result.records) || []).forEach(function (x) {
              map[String(x.id)] = x.name;
            });
            if (!Object.keys(map).length) return;
            setNames(function (prev) {
              return Object.assign({}, prev, map);
            });
          })
          .catch(function () {});
      },
      [open, ids.join(",")],
    );

    React.useEffect(
      function () {
        if (!open) return undefined;
        function onKey(e) {
          if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("keydown", onKey);
        return function () {
          document.removeEventListener("keydown", onKey);
        };
      },
      [open],
    );

    function toggle(id) {
      var key = String(id);
      var next = ids.slice();
      var i = next.indexOf(key);
      if (i >= 0) next.splice(i, 1);
      else next.push(key);
      onChange(next);
    }

    if (!enabled(props)) return null;

    var caretNode = typeof caret === "function" ? caret(props, t) : caret;
    var selectedNode = renderSelected
      ? renderSelected({ ids: ids, names: names, toggle: toggle, text: t, classes: classes, h: h })
      : null;

    return h(
      "div",
      { className: classes.root },
      h(
        "button",
        {
          type: "button",
          className: classes.btn + (ids.length ? " " + (classes.btnOn || "on") : ""),
          "aria-expanded": open ? "true" : "false",
          onClick: function (e) {
            if (conf.stopPropagation) e.stopPropagation();
            setOpen(!open);
          },
        },
        icon(props, "tag", 13),
        t.label + (ids.length ? " · " + ids.length : ""),
        caretNode,
      ),
      open
        ? h(
            "div",
            {
              className: classes.menu,
              role: conf.menuRole,
              style: conf.menuStyle,
              onClick: conf.stopPropagation
                ? function (e) {
                    e.stopPropagation();
                  }
                : undefined,
            },
            h(FilterChecklist, {
              beforeHead: selectedNode,
              items: items(rows),
              selected: ids,
              onToggle: toggle,
              query: query,
              onQuery: setQuery,
              title: t.all,
              total: total,
              selectedText: t.selected,
              clearText: t.clear,
              onClear: function () {
                onChange([]);
                setQuery("");
              },
              searchPlaceholder: t.searchPlaceholder,
              loading: loading,
              hasMore: hasMore,
              onLoadMore: function () {
                load(query, (page || 1) + 1, true);
              },
              emptyText: t.empty,
              noMatchText: t.noMatch,
              loadingText: t.loading,
              noMoreText: t.noMore,
            }),
          )
        : null,
    );
  };
};
