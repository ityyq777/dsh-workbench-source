#!/usr/bin/env node
/**
 * 凭据保险箱的浏览器预览：把凭据库 / 集合 / 分组三个视图打成静态页面，
 * 用于核对浅色、深色下的版面与交互；数据为固定 mock，不连宿主，样式取自 client/ui/styles.cjs。
 *
 * 用法：node scripts/vault-ui-preview.mjs [端口]
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";
import { build } from "esbuild";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.argv[2] || 4621);
const CLIENT = join(ROOT, "packages/addons/vault/client");

const outDir = join(ROOT, ".tmp-vault-preview");
mkdirSync(outDir, { recursive: true });
const entry = join(outDir, "entry.jsx");
writeFileSync(
  entry,
  `import React from "react";
import { createRoot } from "react-dom/client";
import SecretsView from ${JSON.stringify(join(CLIENT, "views/secrets.cjs"))};
import SetsView from ${JSON.stringify(join(CLIENT, "views/sets.cjs"))};
import GroupsView from ${JSON.stringify(join(CLIENT, "views/groups.cjs"))};
import styles from ${JSON.stringify(join(CLIENT, "ui/styles.cjs"))};
import { ShieldCheck, KeyRound, Folder, Layers, SlidersHorizontal, Database, List } from "lucide-react";
import createCommon from ${JSON.stringify(join(ROOT, "packages/addons/lib/client-common.cjs"))};

var h = React.createElement;
var C = createCommon("wbv");
var ICONS = { shield: ShieldCheck, key: KeyRound, folder: Folder, layers: Layers, sliders: SlidersHorizontal, database: Database, list: List };
var icon = function (name, size) { var Comp = ICONS[name] || ShieldCheck; return h(Comp, { size: size || 14, strokeWidth: 2, className: "wbv-svg", "aria-hidden": "true" }); };
var now = Date.now();
var SETS = [
  { id: "set_1", name: "acc_1", description: "少数派主账号", color: "", secretCount: 3, groupIds: ["g_1"], createdAt: now, updatedAt: now },
  { id: "set_2", name: "工作邮箱", description: "SMTP 与 IMAP 共用", color: "", secretCount: 2, groupIds: ["g_1", "g_2"], createdAt: now, updatedAt: now },
  { id: "set_3", name: "运维 token", description: "", color: "", secretCount: 0, groupIds: [], createdAt: now, updatedAt: now },
];
var SECRETS = [
  { id: "sec_1", name: "acc_1 · 密码", kind: "password", meta: JSON.stringify({ username: "me", url: "https://sspai.com" }), setIds: ["set_1"], lastUsedAt: now - 3600e3 },
  { id: "sec_2", name: "acc_1 · 手机号", kind: "phone", meta: "{}", setIds: ["set_1"], lastUsedAt: 0 },
  { id: "sec_3", name: "acc_1 · 身份证号", kind: "id_card", meta: "{}", setIds: ["set_1"], lastUsedAt: 0 },
  { id: "sec_4", name: "工作邮箱 · 密码", kind: "app_password", meta: JSON.stringify({ username: "work@example.com" }), setIds: ["set_2"], lastUsedAt: now - 86400e3 },
  { id: "sec_5", name: "GitHub token", kind: "token", meta: "{}", setIds: [], lastUsedAt: 0 },
];
var GROUPS = [
  { id: "g_1", name: "站点账号 · 少数派", description: "少数派站点", secretCount: 5, bindingCount: 1, setCount: 2 },
  { id: "g_2", name: "工作邮箱", description: "", secretCount: 2, bindingCount: 0, setCount: 1 },
];
var STATUS = { unlocked: true, unlockMode: "A", deviceKey: true, createdAt: now };
var api = { call: function (action, args) {
  if (action === "vault.secretList") return Promise.resolve({ result: { items: SECRETS } });
  if (action === "vault.setList") return Promise.resolve({ result: { items: SETS } });
  if (action === "vault.groupList") return Promise.resolve({ result: { items: GROUPS } });
  if (action === "vault.status") return Promise.resolve({ result: STATUS });
  if (action === "vault.secretReveal") return Promise.resolve({ result: { secret: "hunter2-demo" } });
  if (action === "vault.subjectsOf") return Promise.resolve({ result: { items: [{ subjectType: "site", subjectId: "site_1", title: "少数派" }] } });
  if (action === "vault.setGet") return Promise.resolve({ result: { id: args.id, name: "acc_1", secrets: SECRETS.slice(0, 3), groupIds: ["g_1"] } });
  return Promise.resolve({ result: { ok: true } });
} };
var VIEWS = { secrets: SecretsView, sets: SetsView, groups: GroupsView };
var META = { secrets: "凭据库", sets: "集合", groups: "分组与关联" };
var setViewRef = null;
function App() {
  var st = React.useState("secrets");
  var view = st[0];
  setViewRef = st[1];
  var V = VIEWS[view];
  return h(V, { key: view, api: api, lang: "zh", h: h, React: React, C: C, title: META[view], icon: icon });
}
var sheet = document.createElement("style");
sheet.textContent = Array.isArray(styles) ? styles.join("\\n") : String(styles || "");
document.head.appendChild(sheet);
createRoot(document.getElementById("root")).render(h(App));
window.__GO__ = function (id) { if (setViewRef) setViewRef(VIEWS[id] ? id : "secrets"); };
document.getElementById("tabs").addEventListener("click", function (e) {
  var b = e.target.closest("button[data-view]");
  if (b) window.__GO__(b.getAttribute("data-view"));
});
window.__SET_THEME__ = function (theme) { document.documentElement.setAttribute("data-theme", theme); };
window.__OPEN__ = function (text) {
  var b = Array.prototype.slice.call(document.querySelectorAll("button")).filter(function (x) { return (x.textContent || "").trim() === (text || "新增凭据"); })[0];
  if (b) b.click();
  return Boolean(b);
};
window.__EYE__ = function () {
  var b = document.querySelector(".wbv-eye");
  if (b) b.click();
  return Boolean(b);
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
<title>凭据保险箱预览</title>
<style>
:root{${TOKENS.light}}
html[data-theme=dark]{${TOKENS.dark}}
html,body{margin:0;background:var(--wb-surface);color:var(--wb-text)}
body{font:14px/1.6 -apple-system,system-ui,"PingFang SC",sans-serif;color:var(--wb-text)}
#root{padding:16px;animation:wbv-preview-tick .6s infinite alternate}
@keyframes wbv-preview-tick{from{opacity:.995}to{opacity:1}}
#tabs{display:flex;gap:8px;align-items:center;padding:10px 12px;border-bottom:1px solid var(--wb-border);position:sticky;top:0;background:var(--wb-card);z-index:50}
#tabs button{font:inherit;padding:4px 10px;border-radius:8px;border:1px solid var(--wb-border);background:transparent;color:inherit;cursor:pointer}
#tabs button:hover{background:color-mix(in oklab, currentColor 8%, transparent)}
</style></head>
<body>
<div id="tabs">
  <button data-view="secrets">凭据库</button>
  <button data-view="sets">集合</button>
  <button data-view="groups">分组与关联</button>
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
  console.log("vault preview:", `http://127.0.0.1:${PORT}/`);
});
