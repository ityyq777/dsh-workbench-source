// 预览面板的隔离预览：用真实 task-preview.cjs + 真实 styles.cjs，卡片换成一张超长占位内容，
// 用来核对「只让内容区滚动、标题栏与 × 固定不动」以及浅/深色下的滚动条。
// 用法：node scripts/tasks-preview-scroll-preview.mjs [端口=4632]
//   /?theme=light|dark&scroll=0|1|end   scroll 参数会把内容区滚到指定位置后截图
"use strict";

import { createServer } from "node:http";
import { createRequire } from "node:module";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.argv[2] || 4632);

const entry = `
import React from "react";
import { createRoot } from "react-dom/client";
const COPY = require("./packages/addons/tasks/client/ui/copy.cjs");
const styles = require("./packages/addons/tasks/client/ui/styles.cjs");
const TaskPreview = require("./packages/addons/tasks/client/modals/task-preview.cjs")(React, LongCard);

// 占位卡片：模拟真实卡片在被长描述/多标签撑开时的样子
function LongCard(props) {
  const t = props.t;
  const rows = [];
  for (let i = 1; i <= 26; i++) {
    rows.push(
      React.createElement("p", { key: i, style: { margin: "0 0 7px", fontSize: "12.5px", lineHeight: "1.7" } },
        "第 " + i + " 段说明：这是一段用来把内容区撑长的正文，用来确认滚动条只出现在内容区，标题栏和右上角关闭按钮不会跟着滚走。")
    );
  }
  return React.createElement("div", { className: "wbt-item" },
    React.createElement("div", { className: "wbt-item-line1" },
      React.createElement("span", { className: "wbt-p" }, "P2"),
      React.createElement("span", { className: "wbt-status" }, t.lang === "en" ? "Active" : "进行中"),
      React.createElement("span", { className: "wbt-title" }, "滚动收敛验证：超长描述的预览面板")
    ),
    React.createElement("div", { style: { display: "block", width: "100%" } }, rows),
    React.createElement("div", { className: "wbt-id" }, "任务 ID · 01a1e74b-bccf-7a75-aa42-49b01c253238")
  );
}

const theme = new URLSearchParams(location.search).get("theme") || "light";
const scrollTo = new URLSearchParams(location.search).get("scroll") || "0";
document.documentElement.dataset.theme = theme;

const style = document.createElement("style");
style.textContent = (Array.isArray(styles) ? styles : [styles]).join("\\n") + \`
  html,body{margin:0;height:100%}
  body{background:\${theme === "dark" ? "#141414" : "#f4f6f8"};color:\${theme === "dark" ? "#eee" : "#222"}}
  .wbt-root{--wbt-line:\${theme === "dark" ? "#3a3a3a" : "#e5e6eb"};--wbt-accent:#11a89b;--wbt-bg:\${theme === "dark" ? "#1c1c1c" : "#fff"};padding:0}
  .wbt-modal-mask{background:\${theme === "dark" ? "rgba(0,0,0,.55)" : "rgba(0,0,0,.28)"}}
\`;
document.head.appendChild(style);

const t = COPY.zh;
const cardProps = { task: { id: "01a1e74b-bccf-7a75-aa42-49b01c253238", title: "预览面板收尾：滚动收敛与关闭入口" }, t, lang: "zh", keyword: "", update() {}, onEdit() {}, onDone() {}, onRestart() {}, onTimeline() {}, onDelete() {} };

const host = document.createElement("div");
host.className = "wbt-root";
host.style.height = "100%";
document.body.appendChild(host);

createRoot(host).render(
  React.createElement(TaskPreview, {
    t,
    task: cardProps.task,
    cardProps,
    onClose() {},
  })
);

// 等 React 提交后再滚动，供 headless Chrome 截图
setTimeout(() => {
  const body = document.querySelector(".wbt-preview-body");
  if (!body) return;
  if (scrollTo === "1") body.scrollTop = 420;
  else if (scrollTo === "end") body.scrollTop = body.scrollHeight;
  const head = document.querySelector(".wbt-preview-head");
  const btn = head && head.querySelector("button");
  const report = document.createElement("div");
  report.id = "scroll-report";
  report.style.cssText = "position:fixed;left:8px;bottom:8px;font:12px/1.4 monospace;background:#fff;color:#000;padding:4px 6px;border-radius:4px;z-index:9999";
  report.textContent =
    "bodyScrollTop=" + Math.round(body.scrollTop) +
    " bodyScrollable=" + (body.scrollHeight > body.clientHeight + 1) +
    " headTop=" + Math.round(head.getBoundingClientRect().top) +
    " btnVisible=" + (btn ? btn.getBoundingClientRect().top >= 0 : false) +
    " modalOverflowY=" + getComputedStyle(document.querySelector(".wbt-preview")).overflowY +
    " pageScrollY=" + (document.documentElement.scrollHeight > window.innerHeight + 1);
  if (new URLSearchParams(location.search).get("debug")) document.body.appendChild(report);
  document.title = report.textContent;
}, 600);
`;

const output = await build({
  stdin: { contents: entry, resolveDir: root, loader: "js" },
  bundle: true,
  write: false,
  format: "iife",
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
});

if (process.argv.includes("--check")) {
  console.log("preview bundle ok:", output.outputFiles[0].text.length, "bytes");
  process.exit(0);
}

const html = `<!doctype html><html lang="zh"><meta charset="utf-8"><title>tasks preview</title><body><script src="/app.js"></script></body></html>`;

createServer((req, res) => {
  const js = (req.url || "").startsWith("/app.js");
  res.setHeader("content-type", js ? "application/javascript" : "text/html; charset=utf-8");
  res.end(js ? output.outputFiles[0].text : html);
}).listen(port, () => console.log("preview on http://127.0.0.1:" + port));
