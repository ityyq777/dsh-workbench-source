/**
 * 邮件列表页布局自检：messages.cjs 里用到的每个 wbml-* 类都必须在样式表里存在，
 * 顺带钉住三栏栅格、吸顶列表头、同步按钮禁用与「点击即出详情」的接线。
 * 这是为了防止再次出现“写了类名但从没写过样式”。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = process.cwd();
const viewFile = path.join(root, "packages/addons/mail/client/views/messages.cjs");
const view = fs.readFileSync(viewFile, "utf8");
const css = require(path.join(root, "packages/addons/mail/client/ui/styles.cjs"));
const styleText = Array.isArray(css) ? css.join("\n") : String(css);

function classesIn(text) {
  const out = new Set();
  const re = /\bwbml-[a-z0-9-]+/g;
  let m;
  while ((m = re.exec(text))) out.add(m[0]);
  return out;
}

function selectorsIn(cssText) {
  const out = new Set();
  const re = /\.(wbml-[a-z0-9-]+)/g;
  let m;
  while ((m = re.exec(cssText))) out.add(m[1]);
  return out;
}

test("messages.cjs 用到的 wbml-* 类都有样式规则", () => {
  const used = [...classesIn(view)].sort();
  const styled = selectorsIn(styleText);
  const missing = used.filter((c) => !styled.has(c));
  assert.deepEqual(missing, [], "缺样式的类：" + missing.join(", "));
});

test("样式表是三栏栅格 + 900px 单列降级", () => {
  assert.match(styleText, /\.wbml-layout\{[^}]*grid-template-columns:300px minmax\(0,1fr\)/);
  assert.match(styleText, /\.wbml-layout\.has-detail\{[^}]*minmax\(360px,520px\)/);
  assert.match(styleText, /@media \(max-width:900px\)\{[\s\S]{0,600}?\.wbml-layout/);
  assert.match(styleText, /\.wbml-pane-head\{[^}]*position:sticky/);
  assert.match(styleText, /\.wbml-list-row\.unread::before\{[^}]*var\(--wb-accent/);
  // 新增的布局块只走 --wb-* token：掐出这一段，去掉 var() 的兜底色后不应再有硬编码色
  const start = styleText.indexOf(".wbml-layout{");
  const end = styleText.indexOf("@media (max-width:1180px)");
  assert.ok(start > 0 && end > start, "布局样式块定位失败");
  const block = styleText.slice(start, end).replace(/var\([^)]*\)/g, "");
  assert.deepEqual(block.match(/#[0-9a-fA-F]{3,8}/g) || [], []);
});

test("三栏结构：详情栏与列表栏同级、点击即渲染阅读面板", () => {
  assert.match(view, /className: "wbml-layout" \+ \(current \? " has-detail" : ""\)/);
  assert.match(view, /className: "wbml-pane wbml-listpane"/);
  assert.match(view, /className: "wbml-pane wbml-detailpane"/);
  assert.match(view, /onClick: function \(\) \{ open\(m\); \}/);
  // 详情面板不能挂在列表行末尾：两个 pane 必须是 layout 的直接子节点
  assert.match(view, /wbml-state-box" \}, body\)\),\s*current \? h\("section", \{ className: "wbml-pane wbml-detailpane"/);
});

test("同步按钮与账户选择绑定：未选账户时禁用并给说明", () => {
  assert.match(view, /var canSync = !!accountId\[0\];/);
  assert.match(view, /kind: "primary", disabled: !canSync/);
  assert.match(view, /选择具体账户后可同步/);
  assert.doesNotMatch(view, /先在左侧选择一个账户/);
  // 未读态必须按 flags 里的 \Seen 判定：mail_message 没有 seen 列，m.seen 永远是 undefined
  assert.match(view, /function isUnread\(m\) \{ return !\/\\\\Seen\/\.test/);
  assert.doesNotMatch(view, /m\.seen/);
  assert.match(view, /mail\.messageMarkRead/);
});

test("状态容器不抽走布局骨架", () => {
  assert.match(view, /className: "wbml-state-box" \}, body\)/);
  for (const text of ["加载中…", "还没有账户", "没有本地邮件"]) {
    assert.ok(view.indexOf(text) >= 0, "缺状态文案：" + text);
  }
});

test("正文按需下载接线：打开即拉、失败可重试、HTML 不直塞主文档", () => {
  assert.match(view, /mail\.messageBody/);
  assert.match(view, /正文下载中…/);
  assert.match(view, /正文下载失败：/);
  assert.match(view, /重试/);
  assert.match(view, /重新下载正文/);
  assert.doesNotMatch(view, /dangerouslySetInnerHTML|innerHTML/);
});
