// 共享勾选清单组件测试：结构、三态文案、已选与禁用、触底阈值。
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const FilterChecklist = require("./filter-checklist.cjs");
const { nearBottom } = FilterChecklist;

const h = React.createElement;

function html(props) {
    return renderToStaticMarkup(h(FilterChecklist, Object.assign({ autoFocus: false }, props)));
}

test("清单：头部显示标题与总数，已选时出现计数与清空", () => {
    const out = html({
        items: [
            { id: "a", name: "Alpha", meta: "3 条" },
            { id: "b", name: "Beta" },
        ],
        selected: ["a"],
        title: "全部集合",
        total: 7,
        selectedText: "已选",
        clearText: "清空",
    });
    assert.match(out, /全部集合 · 7/);
    assert.match(out, /已选 1/);
    assert.match(out, /清空/);
    assert.match(out, /Alpha/);
    assert.match(out, /3 条/);
    // 已选项带 is-on 且是选中态，未选的不带
    assert.equal((out.match(/wbck-opt is-on/g) || []).length, 1);
    assert.equal((out.match(/checked=""/g) || []).length, 1);
});

test("清单：未选且无搜索词时不显示清空", () => {
    const out = html({ items: [{ id: "a", name: "Alpha" }], selected: [], total: 1 });
    assert.doesNotMatch(out, /wbck-clear/);
});

test("清单：三种空态文案互斥（加载 / 无匹配 / 全空）", () => {
    const loading = html({ items: [], loading: true, loadingText: "加载中…", emptyText: "还没有集合" });
    assert.match(loading, /加载中…/);
    assert.doesNotMatch(loading, /还没有集合/);

    const miss = html({ items: [], query: "xyz", noMatchText: "没有匹配的集合", emptyText: "还没有集合" });
    assert.match(miss, /没有匹配的集合/);
    assert.doesNotMatch(miss, /还没有集合/);

    const empty = html({ items: [], emptyText: "还没有集合" });
    assert.match(empty, /还没有集合/);
    assert.match(empty, /role="status"/);
});

test("清单：hasMore 时不显示尾行，加载完显示传进来的尾行文案", () => {
    const more = html({ items: [{ id: "a", name: "A" }], hasMore: true, noMoreText: "没有更多" });
    assert.doesNotMatch(more, /wbck-more/);

    const done = html({ items: [{ id: "a", name: "A" }], hasMore: false, noMoreText: "没有更多" });
    assert.match(done, /wbck-more/);
    assert.match(done, /没有更多/);

    const none = html({ items: [{ id: "a", name: "A" }], hasMore: false, noMoreText: "" });
    assert.doesNotMatch(none, /wbck-more/);
});

test("清单：loading 时尾行是加载文案，且列表标记 aria-busy", () => {
    const out = html({ items: [{ id: "a", name: "A" }], loading: true, loadingText: "加载中…" });
    assert.match(out, /加载中…/);
    assert.match(out, /aria-busy="true"/);
});

test("清单：disabled 时搜索框与勾选框全部禁用", () => {
    const out = html({ items: [{ id: "a", name: "A" }], selected: ["a"], disabled: true, query: "q" });
    const inputs = out.match(/<input[^>]*>/g) || [];
    assert.equal(inputs.length, 2);
    inputs.forEach((tag) => assert.match(tag, /disabled=""/));
});

test("清单：beforeHead 插在搜索框与头部之间", () => {
    const out = html({ items: [{ id: "a", name: "A" }], beforeHead: h("div", { className: "mine" }, "已选块") });
    assert.ok(out.indexOf("wbck-input") < out.indexOf("已选块"));
    assert.ok(out.indexOf("已选块") < out.indexOf("wbck-head"));
});

test("nearBottom：距底部 24px 内算触底，默认阈值生效", () => {
    assert.equal(nearBottom({ scrollTop: 100, clientHeight: 100, scrollHeight: 220 }), true);
    assert.equal(nearBottom({ scrollTop: 50, clientHeight: 100, scrollHeight: 220 }), false);
    assert.equal(nearBottom({ scrollTop: 80, clientHeight: 100, scrollHeight: 220 }, 40), true);
    assert.equal(nearBottom(null), false);
});
