#!/usr/bin/env node
/**
 * 自动化插件的浏览器预览：用 esbuild 把四个视图（规则/运行记录/概览/设置）
 * 与编辑器模态打进一个静态页面，起在本机，便于核对浅色、深色下的版面与交互。
 * 数据为固定 mock，不连宿主；样式来自 client/ui/styles.cjs 本体。
 *
 * 用法：node scripts/automation-ui-preview.mjs [端口]
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";
import { build } from "esbuild";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.argv[2] || 4620);
const CLIENT = join(ROOT, "packages/addons/automation/client");

const outDir = join(ROOT, ".tmp-automation-preview");
mkdirSync(outDir, { recursive: true });
const entry = join(outDir, "entry.jsx");
writeFileSync(
  entry,
  `import React from "react";
import { createRoot } from "react-dom/client";
import RulesMod from ${JSON.stringify(join(CLIENT, "views/rules.cjs"))};
import RunsView from ${JSON.stringify(join(CLIENT, "views/runs.cjs"))};
import StatsView from ${JSON.stringify(join(CLIENT, "views/stats.cjs"))};
import ConfigView from ${JSON.stringify(join(CLIENT, "views/config.cjs"))};
import EditorMod from ${JSON.stringify(join(CLIENT, "views/rule-editor.cjs"))};
import styles from ${JSON.stringify(join(CLIENT, "ui/styles.cjs"))};
import { Play, Pencil, Power, PowerOff, Trash2, Timer, AlarmClock, Radio, Hand, Zap, Layers, ShieldCheck, SkipForward, AlertTriangle, CheckCircle, X, RefreshCw } from "lucide-react";
import copy from ${JSON.stringify(join(CLIENT, "ui/copy.cjs"))};
import createCommon from ${JSON.stringify(join(ROOT, "packages/addons/lib/client-common.cjs"))};

var h = React.createElement;
var C = createCommon("wba");
var LUCIDE = { play: Play, pencil: Pencil, power: Power, "power-off": PowerOff, "trash-2": Trash2, timer: Timer, "alarm-clock": AlarmClock, radio: Radio, hand: Hand, zap: Zap, layers: Layers, "shield-check": ShieldCheck, "skip-forward": SkipForward, "alert-triangle": AlertTriangle, "check-circle": CheckCircle, x: X, refresh: RefreshCw };
var icon = function (name, size) { var Comp = LUCIDE[name] || Zap; return h(Comp, { size: size || 14, strokeWidth: 2, className: "wba-svg", "aria-hidden": "true" }); };
var now = Date.now();
var RULES = [
  { id: "r-8f2a1c", name: "每日站会提醒", enabled: true, triggerType: "schedule",
    triggerConfig: { kind: "interval", everyMinutes: 90 }, actionName: "message.send",
    actionArgs: { title: "站会", body: "规则 {{rule.name}} 已运行" }, condition: null,
    lastRunAt: now - 3600e3, lastStatus: "ok",
    lastRun: { id: "run-71", ruleId: "r-8f2a1c", trigger: "interval", status: "ok", startedAt: now - 3600e3, finishedAt: now - 3599e3 } },
  { id: "r-2b9d44", name: "周五复盘任务", enabled: false, triggerType: "schedule",
    triggerConfig: { kind: "dailyAt", time: "18:30", tz: "Asia/Shanghai", weekdays: [5] }, actionName: "tasks.create",
    actionArgs: { title: "复盘本周产出" }, condition: { field: "payload.kind", op: "eq", value: "sprint" },
    lastRunAt: now - 86400e3, lastStatus: "error",
    lastRun: { id: "run-70", ruleId: "r-2b9d44", trigger: "dailyAt", status: "error", startedAt: now - 86400e3, finishedAt: now - 86399e3 } },
  { id: "r-6c0e77", name: "事件触发归档", enabled: true, triggerType: "event",
    triggerConfig: { kind: "event", domainId: "wb-addon-tasks", event: "task.created" }, actionName: "tags.create",
    actionArgs: { name: "自动化" }, condition: null, lastRunAt: null, lastStatus: "", lastRun: null },
];
var RUNS = [
  { id: "run-71", ruleId: "r-8f2a1c", trigger: "interval", status: "ok", startedAt: now - 3600e3, finishedAt: now - 3599e3, result: { messageId: "m-1" }, error: "" },
  { id: "run-70", ruleId: "r-2b9d44", trigger: "dailyAt", status: "error", startedAt: now - 86400e3, finishedAt: now - 86399e3, result: null, error: "tasks.create: title 不能为空" },
  { id: "run-69", ruleId: "r-6c0e77", trigger: "event", status: "skipped", startedAt: now - 7200e3, finishedAt: now - 7200e3, result: null, error: "" },
  { id: "run-68", ruleId: "r-8f2a1c", trigger: "manual", status: "ok", startedAt: now - 1800e3, finishedAt: now - 1799e3, result: { ok: true }, error: "" },
];
var STATS = { total: 12, enabled: 9, today: { ok: 5, error: 1, skipped: 2 }, config: { maxRules: 50, perHour: 60 } };
var CONFIG = { maxRules: 50, perHour: 60 };
var ACTIONS = ["message.send", "tasks.create", "tags.create", "sites.create", "connector.sourceRun"];
var api = { call: function (action) {
  if (action === "automation.ruleList") return Promise.resolve({ result: { items: RULES } });
  if (action === "automation.actionOptions") return Promise.resolve({ result: { actions: ACTIONS, triggers: ["interval", "dailyAt", "event", "manual"] } });
  if (action === "automation.runList") return Promise.resolve({ result: { items: RUNS } });
  if (action === "automation.stats") return Promise.resolve({ result: STATS });
  if (action === "automation.configGet") return Promise.resolve({ result: CONFIG });
  return Promise.resolve({ result: { ok: true } });
} };
var VIEWS = { stats: StatsView, rules: RulesMod.default || RulesMod, runs: RunsView, config: ConfigView };
var META = { stats: { title: "概览" }, rules: { title: "规则" }, runs: { title: "运行记录" }, config: { title: "设置" } };
var setViewRef = null;
function App() {
  var st = React.useState("stats");
  var view = st[0];
  setViewRef = st[1];
  window.__VIEW__ = view;
  var V = VIEWS[view];
  return h(V, { key: view, api: api, lang: "zh", h: h, React: React, C: C, title: META[view].title, icon: icon, viewParams: {}, onNavigate: function (id) { st[1](VIEWS[id] ? id : "stats"); } });
}
var sheet = document.createElement("style");
sheet.textContent = styles;
document.head.appendChild(sheet);
createRoot(document.getElementById("root")).render(h(App));
window.__GO__ = function (id) { if (setViewRef) setViewRef(VIEWS[id] ? id : "stats"); };
document.getElementById("tabs").addEventListener("click", function (e) {
  var b = e.target.closest("button[data-view]");
  if (b) window.__GO__(b.getAttribute("data-view"));
});
window.__SET_THEME__ = function (theme) {
  document.documentElement.setAttribute("data-theme", theme);
};
`,
);
await build({
  entryPoints: [entry],
  bundle: true,
  outfile: join(outDir, "bundle.js"),
  platform: "browser",
  format: "iife",
  loader: { ".jsx": "jsx" },
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "error",
});

const TOKENS = {
  light: `--wb-line:#ddd6c8;--wb-border:#ddd6c8;--wb-card:#fffdf8;--wb-surface:#fffdf8;--wb-accent:#0f8f84;--wb-muted:#6d6459;--wb-ok:#1f7a4d;--wb-warn:#9a6410;--wb-danger:#b3372f;--wb-text:#2a241c;--wb-panel:#fffdf9;color-scheme:light;`,
  dark: `--wb-line:#3a3833;--wb-border:#3a3833;--wb-card:#1d1c19;--wb-surface:#1d1c19;--wb-accent:#3fc3b4;--wb-muted:#a09889;--wb-ok:#4cc08a;--wb-warn:#e0a94a;--wb-danger:#e8736a;--wb-text:#e7e1d5;--wb-panel:#1b1a17;color-scheme:dark;`,
};
const page = `<!doctype html>
<html lang="zh" data-theme="light"><head><meta charset="utf-8" />
<title>自动化插件预览</title>
<style>
:root{${TOKENS.light}}
html[data-theme=dark]{${TOKENS.dark}}
html,body{margin:0;background:var(--wb-surface);color:var(--wb-text)}
body{font:14px/1.6 -apple-system,system-ui,"PingFang SC",sans-serif;color:var(--wb-text)}

#root{padding:0;animation:wba-preview-tick .6s infinite alternate}
@keyframes wba-preview-tick{from{opacity:.995}to{opacity:1}}
#tabs{display:flex;gap:8px;align-items:center;padding:10px 12px;border-bottom:1px solid var(--wb-border);position:sticky;top:0;background:var(--wb-card);z-index:50}
#tabs button{font:inherit;padding:4px 10px;border-radius:8px;border:1px solid var(--wb-border);background:transparent;color:inherit;cursor:pointer}
#tabs button:hover{background:color-mix(in oklab, currentColor 8%, transparent)}
</style></head>
<body>
<div id="tabs">
  <button data-view="stats">概览</button>
  <button data-view="rules">规则</button>
  <button data-view="runs">运行记录</button>
  <button data-view="config">设置</button>
  <span style="flex:1"></span>
  <button onclick="__SET_THEME__('light')">浅色</button>
  <button onclick="__SET_THEME__('dark')">深色</button>
</div>
<div id="root"></div>
<script src="/bundle.js"></script>
</body></html>`;

const bundle = join(outDir, "bundle.js");
createServer((req, res) => {
  if (req.url.startsWith("/bundle.js")) {
    res.writeHead(200, { "content-type": "text/javascript; charset=utf-8" });
    res.end(readFileSync(bundle));
    return;
  }
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(page);
}).listen(PORT, "127.0.0.1", () => {
  console.log("automation preview:", `http://127.0.0.1:${PORT}/`);
});
