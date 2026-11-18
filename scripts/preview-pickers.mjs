/**
 * 共享日期控件预览：把 DatePicker / RangePicker / MonthPicker / InlineCalendar
 * 四种形态渲染成 HTML（浅色 + 深色），用于目视核对主题跟随与弹层样式。
 * 只做视觉验证，不参与构建。
 */
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { Hooks, makeReact, toHtml } from "./preview-salary.mjs";

const require = createRequire(import.meta.url);
const ROOT = new URL("../", import.meta.url).pathname;
const DP = require(ROOT + "packages/addons/lib/date-picker.cjs");
const base = require(ROOT + "packages/addons/lib/client-base-styles.cjs")("wbsal");
const dpCss = require(ROOT + "packages/addons/lib/date-picker-styles.cjs")("wbsal");

function render(component, props) {
  const hooks = new Hooks();
  const React = makeReact(hooks);
  const tree = component({ React, h: React.createElement, prefix: "wbsal", lang: "zh", ...props });
  return toHtml(tree);
}

const single = render(DP.DatePicker, { value: "2026-11-17", defaultOpen: true, label: "发薪日期" });
const empty = render(DP.DatePicker, { value: "", label: "目标日期" });
const range = render(DP.RangePicker, { value: { from: "2026-11-03", to: "2026-11-17" }, defaultOpen: true, label: "发布时间范围" });
const month = render(DP.MonthPicker, { value: "2026-11", defaultOpen: true, label: "归档月份" });
const inline = render(DP.InlineCalendar, { value: "2026-11-19", label: "日历" });

const theme = {
  light: "--wb-card:#ffffff;--wb-surface:#ffffff;--wb-border:#e2e6ec;--wb-line:#eef0f4;--wb-muted:#6b7280;--wb-accent:#2563eb;--wb-ok:#15803d;--wb-warn:#b45309;--wb-danger:#b91c1c;--wb-text:#0f172a",
  dark: "--wb-card:#161b26;--wb-surface:#111621;--wb-border:#2a3242;--wb-line:#232a38;--wb-muted:#8b94a6;--wb-accent:#5b8cff;--wb-ok:#4ade80;--wb-warn:#fbbf24;--wb-danger:#f87171;--wb-text:#e8ecf4",
};
const card = (title, body) => `<div class="card"><div class="card-title">${title}</div><div class="card-body">${body}</div></div>`;
const pane = (key, label) => `<section class="pane" data-theme="${key}" style="${theme[key]}">
  <div class="pane-title">${label}</div>
  <div class="grid">
    ${card("DatePicker · 选一个日期", single)}
    ${card("DatePicker · 空值", empty)}
    ${card("RangePicker · 起止区间", range)}
    ${card("MonthPicker · 按月", month)}
    ${card("InlineCalendar · 内联月历", inline)}
  </div>
</section>`;

const html = `<!doctype html><html lang="zh"><head><meta charset="utf-8"><title>date pickers</title>
<style>
  html,body{margin:0;background:#070a12;color:#e8ecf4;font-family:-apple-system,"PingFang SC","Segoe UI",sans-serif}
  .pane{padding:20px 24px 120px;border-bottom:1px solid #1d2330;background:var(--wb-bg,#0b1020)}
  .pane[data-theme="light"]{--wb-bg:#f5f7fa;color:#0f172a}
  .pane[data-theme="dark"]{--wb-bg:#0b1020;color:#e8ecf4}
  .pane-title{font:600 11px/1 ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:#7d879b;margin:0 0 12px 2px}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;align-items:start}
  .card{border:1px solid var(--wb-border);border-radius:12px;background:var(--wb-card);padding:14px}
  .card-title{font-size:11.5px;color:var(--wb-muted);margin-bottom:10px}
  .card-body{min-height:60px}
  ${Array.isArray(base) ? base.join("\n") : String(base)}
  ${dpCss}
</style></head><body>
${pane("light", "light")}
${pane("dark", "dark")}
</body></html>`;
writeFileSync("/tmp/pickers-preview.html", html);
console.log("/tmp/pickers-preview.html", html.length);
