// 共享勾选清单：搜索框 + 头部计数/清空 + 固定高度滚动列表 + 触底加载 + 三态文案。
// 纯展示组件，不依赖任何域的 action：数据、分页与搜索都由调用方提供。
// 任务/站点/储物的标签筛选与保险箱建组弹窗的集合选择共用这一份实现。
"use strict";

var React = require("react");
var h = React.createElement;

// 触底阈值与三处标签筛选保持同一口径（24px）。
var NEAR = 24;

function nearBottom(el, threshold) {
    if (!el) return false;
    var gap = Number(threshold);
    if (!isFinite(gap) || gap < 0) gap = NEAR;
    return el.scrollTop + el.clientHeight >= el.scrollHeight - gap;
}

function FilterChecklist(props) {
    var items = props.items || [];
    var selected = props.selected || [];
    var disabled = props.disabled === true;
    var loading = props.loading === true;
    var hasMore = props.hasMore === true;
    var query = props.query || "";
    var total = typeof props.total === "number" ? props.total : items.length;
    var title = props.title || "全部";
    var selectedText = props.selectedText || "已选";
    var clearText = props.clearText || "清空";
    var searchPlaceholder = props.searchPlaceholder || "搜索";
    var emptyText = props.emptyText || "暂无数据";
    var noMatchText = props.noMatchText || "没有匹配项";
    var loadingText = props.loadingText || "加载中…";
    var noMoreText = typeof props.noMoreText === "string" ? props.noMoreText : "没有更多";
    var onToggle = props.onToggle || function () {};
    var onQuery = props.onQuery || function () {};
    var onLoadMore = props.onLoadMore;
    var onClear = props.onClear || function () {};

    function toggle(id) {
        if (disabled) return;
        onToggle(id);
    }

    function scroll(e) {
        if (disabled || loading || !hasMore || !onLoadMore) return;
        if (nearBottom(e.currentTarget)) onLoadMore();
    }

    var head = h("div", { className: "wbck-head" },
        h("span", { className: "wbck-grow" }, title + (total ? " · " + total : "")),
        selected.length ? h("span", { className: "wbck-sel" }, selectedText + " " + selected.length) : null,
        (selected.length || query) ? h("button", {
            type: "button",
            className: "wbck-clear",
            disabled: disabled,
            onClick: function () {
                if (disabled) return;
                onClear();
            },
        }, clearText) : null);

    var body;
    if (!items.length) {
        body = h("div", { className: "wbck-note", role: "status" }, loading ? loadingText : (query ? noMatchText : emptyText));
    } else {
        body = items.map(function (x) {
            var on = selected.indexOf(String(x.id)) >= 0;
            return h("label", { key: x.id, className: "wbck-opt" + (on ? " is-on" : "") },
                h("input", {
                    type: "checkbox",
                    checked: on,
                    disabled: disabled,
                    onChange: function () { toggle(x.id); },
                }),
                h("span", { className: "wbck-nm", title: x.name }, x.name),
                x.meta ? h("span", { className: "wbck-meta" }, x.meta) : null);
        });
        var more = loading ? loadingText : (hasMore ? "" : noMoreText);
        if (more) body = body.concat([h("div", { key: "__more", className: "wbck-more", role: "status" }, more)]);
    }

    return h("div", { className: "wbck", "data-role": "checklist" },
        h("div", { className: "wbck-search" },
            h("input", {
                type: "search",
                autoFocus: props.autoFocus !== false,
                className: "wbck-input",
                placeholder: searchPlaceholder,
                "aria-label": searchPlaceholder,
                value: query,
                disabled: disabled,
                onChange: function (e) { onQuery(e.target.value); },
            })),
        props.beforeHead || null,
        head,
        h("div", {
            className: "wbck-list",
            onScroll: scroll,
            "aria-busy": loading ? "true" : "false",
        }, body));
}

module.exports = FilterChecklist;
module.exports.nearBottom = nearBottom;
