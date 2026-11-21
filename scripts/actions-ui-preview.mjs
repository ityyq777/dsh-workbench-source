#!/usr/bin/env node
/**
 * 「Action」页的浏览器预览：无头启动宿主 + 四个业务插件，取运行时注册的
 * action schema（与 GET /workbench/api/schema 同源），再用 esbuild 把共享视图
 * 打成一个静态页面起在本机，供人工/截图核对版面与交互。
 *
 * 用法：node scripts/actions-ui-preview.mjs [端口]
 */
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createServer } from "node:http";
import { build } from "esbuild";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.argv[2] || 4610);

process.env.WB_HOME = mkdtempSync(join(tmpdir(), "wb-actions-ui-"));
let host = null;
const fakeCtx = {
  webServer: { register: () => () => {} },
  tools: { register: () => {} },
  connection: { requestRejection: () => undefined },
  systemPrompt: { section: () => () => {}, getSectionOrder: () => 500 },
  commands: { register: () => () => {} },
  agents: { get: () => undefined },
  provide: (name, value) => { if (name === "workbench") host = value; },
  effect: (fn) => { fn(); },
};
const shell = await import(pathToFileURL(join(ROOT, "packages/shell/lib/index.js")).href);
shell.apply(fakeCtx);
for (const name of ["tasks", "tags", "sites", "storage", "message", "vault"]) {
  const mod = await import(pathToFileURL(join(ROOT, "packages/addons", name, "lib/index.js")).href);
  mod.apply({ workbench: host, effect: fakeCtx.effect });
}
const listed = await host.invoke("actions.list", { detail: true }, "ui");
const caps = await host.invoke("capabilities.list", {}, "agent");
const actions = (listed.result && listed.result.actions) || [];
const domains = (caps.result && caps.result.domains) || [];
const domain = domains.find((d) => d.id === "wb-addon-tasks") || domains[0];
const domainRows = domains.map((d) => ({
  id: d.id,
  title: d.title || d.id,
  version: d.version || "",
  enabled: d.error == null,
  error: d.error || null,
}));
const payloads = {};
for (const d of domains) {
  payloads[d.id] = {
    ok: true,
    readonly: true,
    shellVersion: "0.6.5",
    domains: domainRows,
    actions: actions.filter((a) => a.domain === d.id),
  };
}
// 可选：用一份真实 actionSchema 快照替换某个域的数据（例如保险箱未解锁时预览真实清单）。
// 用法：WB_ACTION_FIXTURE=/tmp/vault-action-schema.json node scripts/actions-ui-preview.mjs
if (process.env.WB_ACTION_FIXTURE) {
  const snap = JSON.parse(readFileSync(process.env.WB_ACTION_FIXTURE, "utf8"));
  const id = snap && snap.domains && snap.domains[0] && snap.domains[0].id;
  if (id) {
    payloads[id] = snap;
    if (!domainRows.some((d) => d.id === id)) {
      domainRows.push({ id, title: id, version: (snap.domains[0].version || ""), enabled: true, error: null });
    }
  }
}
const payload = payloads[domain.id] || { ok: true, readonly: true, shellVersion: "0.6.5", domains: domainRows, actions: [] };

const outDir = join(ROOT, ".tmp-actions-preview");
mkdirSync(outDir, { recursive: true });
const entry = join(outDir, "entry.jsx");
writeFileSync(entry, `import React from "react";
import { createRoot } from "react-dom/client";
import factory from ${JSON.stringify(join(ROOT, "packages/addons/lib/action-schema-view.cjs"))};

var api = {
  schema: function () { return Promise.resolve(window.__WB_SCHEMA__); },
  call: function (name, args) {
    if (name === 'actions.setActionOrigins') {
      var entry = (window.__WB_PAYLOADS__[CURRENT].actions || []).find(x => x.name === args.action);
      if (!entry || !Array.isArray(args.origins)) return Promise.reject(new Error('Invalid preview action'));
      entry.origins = args.origins;
      entry.originsSource = 'meta';
      return Promise.resolve({ result: { action: entry.name, origins: entry.origins, source: 'meta' } });
    }
    var short = String(name || "").split(".")[0];
    var full = short.indexOf("wb-addon-") === 0 ? short : "wb-addon-" + short;
    return Promise.resolve({ result: window.__WB_PAYLOADS__[full] || window.__WB_SCHEMA__ });
  }
};
var CURRENT = ${JSON.stringify(domain.id)};
var view = factory({ domain: CURRENT, prefix: "wbt" });
window.__WB_GO__ = function (id) {
  if (!window.__WB_PAYLOADS__[id]) return false;
  CURRENT = id;
  window.__WB_VIEW__ = view = factory({ domain: id, prefix: "wbt" });
  window.__WB_RENDER__(window.__WB_LANG__ || "zh");
  return true;
};
var root = document.getElementById("root");
window.__WB_VIEW__ = view;
function App() {
  var lang = window.__WB_LANG__ || "zh";
  return React.createElement(view.ActionSchemaView, { api: api, lang: lang });
}
window.__WB_RENDER__ = function (lang) { window.__WB_LANG__ = lang; createRoot(root).render(React.createElement(App)); };
window.__WB_RENDER__("zh");
`);
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
const html = `<!doctype html>
<html lang="zh"><head><meta charset="utf-8" /><title>Action 预览</title>
<style>
html{--wb-card:#fffdf8;--wb-surface:#fffdf8;--wb-border:#e3e5e9;--wb-line:#eee7db;--wb-accent:#0f8f84;--wb-muted:#8a8377;--dsw-alias-label-secondary:#6b655c;--wb-ok:#2f9e6f;--wb-warn:#b57a15;--wb-danger:#c0453b;--dsw-alias-bg-skeleton:#f2f3f5}
html[data-theme=dark]{--wb-card:#1d1c19;--wb-surface:#151412;--wb-border:#38352f;--wb-line:#2a2824;--wb-accent:#4fd1c0;--wb-muted:#9a938a;--dsw-alias-label-secondary:#a9a299;--wb-ok:#5cc08c;--wb-warn:#e0a94a;--wb-danger:#e57b70;--dsw-alias-bg-skeleton:#26241f}
body{margin:0;font:14px/1.6 -apple-system,system-ui,"PingFang SC",sans-serif;background:var(--wb-surface,#f7f4ee);color:var(--dsw-alias-label-secondary,#2a241c)}
#root{padding:18px}#doms{display:flex;gap:8px;flex-wrap:wrap;padding:12px 18px 0}
#doms button{border:1px solid #d8d2c6;background:#fffdf8;border-radius:999px;padding:3px 10px;font-size:12px;cursor:pointer}
#doms button[aria-pressed=true]{border-color:#0f8f84;color:#0f8f84}</style></head>
<body><div id="doms"></div><div id="root"></div>
<script>window.__SET_THEME__ = function (t) { document.documentElement.setAttribute("data-theme", t || "light"); return t; };</script>
<script>window.__WB_PAYLOADS__ = ${JSON.stringify(payloads)};
window.__WB_SCHEMA__ = window.__WB_PAYLOADS__[${JSON.stringify(domain.id)}];
(function(){var box=document.getElementById("doms");
Object.keys(window.__WB_PAYLOADS__).forEach(function(id){
  var b=document.createElement("button");b.textContent=id.replace("wb-addon-","");b.dataset.id=id;
  b.setAttribute("aria-pressed", String(id===${JSON.stringify(domain.id)}));
  b.onclick=function(){ if(window.__WB_GO__(id)){Array.prototype.forEach.call(box.children,function(x){x.setAttribute("aria-pressed",String(x.dataset.id===id));});} };
  box.appendChild(b);});})();</script>
<script src="/bundle.js"></script></body></html>`;

const bundle = readFileSync(join(outDir, "bundle.js"));
createServer((req, res) => {
  if (req.url === "/bundle.js") {
    res.writeHead(200, { "content-type": "text/javascript; charset=utf-8" });
    res.end(bundle);
    return;
  }
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(html);
}).listen(PORT, "127.0.0.1", () => {
  console.log("actions preview:", `http://127.0.0.1:${PORT}/`);
  console.log("domain:", domain.id, "actions:", payload.actions.length);
});
