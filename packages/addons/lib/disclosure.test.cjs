// 共享折叠面板组件测试：native details 结构、受控/非受控、插槽、样式无写死色值。
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const lib = require("./disclosure.cjs");

const h = React.createElement;
const D = lib.createDisclosure(React).Disclosure;

function html(props, children) {
  return renderToStaticMarkup(h(D, props, children === undefined ? h("p", null, "正文") : children));
}

test("默认收起，折叠头含标题与 chevron，正文在 body 容器里", () => {
  const out = html({ title: "参数" });
  assert.match(out, /^<details class="wb-disc">/);
  assert.match(out, /<summary>/);
  assert.match(out, /wb-disc-chev/);
  assert.match(out, /wb-disc-title">参数</);
  assert.match(out, /wb-disc-body"><p>正文<\/p>/);
  assert.ok(!/<details[^>]*open/.test(out), "默认不应展开");
});

test("非受控：defaultOpen 直接展开，extra attrs 透传到 details", () => {
  const out = html({ title: "原始", defaultOpen: true, attrs: { "data-params-fold": "tasks.list" }, className: "wbt-cmd-template" });
  assert.match(out, /<details class="wb-disc wbt-cmd-template" data-params-fold="tasks\.list" open="">/);
});

test("受控：open 决定展开态，onToggle 原样挂在 details 上", () => {
  const calls = [];
  const open = html({ title: "参数", open: true, onToggle: (event) => calls.push(event) });
  assert.match(open, /open=""/);
  const closed = html({ title: "参数", open: false, onToggle: () => {} });
  assert.ok(!/<details[^>]*open/.test(closed));
});

test("计数插槽：meta 渲染为弱化说明，空值不渲染", () => {
  assert.match(html({ title: "参数", meta: "必填 3" }), /wb-disc-meta">必填 3</);
  assert.ok(!html({ title: "参数", meta: "" }).includes("wb-disc-meta"));
});

test("样式：去掉默认三角、chevron 旋转、只用主题 token", () => {
  const css = lib.css;
  assert.match(css, /\.wb-disc>summary\{[^}]*list-style:none/);
  assert.match(css, /::-webkit-details-marker\{display:none\}/);
  assert.match(css, /\.wb-disc\[open\]>summary \.wb-disc-chev\{transform:rotate\(90deg\)\}/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.ok(!/#fff(?:fff)?\b|#000(?:000)?\b|#2563eb|#4f6ef7/.test(css), "新增样式不得写死颜色");
});

test("键盘与无障碍：仍是原生 summary，chevron 对辅助技术隐藏", () => {
  const out = html({ title: "难度说明" });
  assert.match(out, /<summary>/);
  assert.match(out, /aria-hidden="true"/);
  assert.ok(!/<div[^>]*(role="button"|tabindex)/.test(out), "不应自造按钮角色");
});
