import { Hooks, makeReact, toHtml } from "./preview-salary.mjs";
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire(import.meta.url);
const DP = require("../packages/addons/lib/date-picker.cjs");
const base = require("../packages/addons/lib/client-base-styles.cjs")("wbt");
const tasksCss = require("../packages/addons/tasks/client/ui/styles.cjs");
const charts = require("../packages/addons/tasks/client/stats/charts.cjs");
const ch = charts.makeCharts("wbt");
const chartsCss = ch.css || "";
const tokens = ":root{--wb-bg:#0b1020;--wb-card:#151c2e;--wb-surface:#1b2336;--wb-border:#2a3450;--wb-line:#232c44;--wb-text:#e6ebf5;--wb-muted:#8f9bb3;--wb-accent:#5b8cff;--wb-ok:#3fb950;--wb-warn:#d29922;--wb-danger:#f85149;--wb-on-accent:#fff}";
const hooks = new Hooks();
const React = makeReact(hooks);
const h = React.createElement;
const picker = () => h(DP.RangePicker, { React, h, prefix: "wbt", lang: "zh", label: "自定义日期范围", defaultOpen: true, value: { from: "2026-11-03", to: "2026-11-17" }, clearable: false });
const tree = h("div", { className: "wbt-stoolbar" },
  h("div", { className: "wbt-seg", role: "group" }, ["近 7 天", "近 30 天", "近 90 天", "近 1 年", "全部"].map((t, i) => h("button", { key: t, type: "button", className: i === 1 ? "wbt-on" : "" }, t))),
  h("div", { className: "wbt-range", role: "group" }, picker()),
  h("button", { type: "button", className: "wbt-ghost" }, "刷新"),
  h("span", { className: "wbt-muted" }, "截至 19:20"));
const body = toHtml(tree);
fs.writeFileSync("/tmp/wbt-picker-real.html", `<!doctype html><meta charset=utf-8><style>${tokens}</style><style>${base}</style><style>${tasksCss}</style><style>${chartsCss}</style><body style="padding:24px;background:var(--wb-bg)"><div style="max-width:1500px">${body}</div></body>`);
console.log("ok");
