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
for (const name of ["tasks", "tags", "sites", "storage", "message"]) {
  const mod = await import(pathToFileURL(join(ROOT, "packages/addons", name, "lib/index.js")).href);
  mod.apply({ workbench: host, effect: fakeCtx.effect });
}
const listed = await host.invoke("actions.list", { detail: true }, "agent");
const caps = await host.invoke("capabilities.list", {}, "agent");
const actions = (listed.result && listed.result.actions) || [];
const domains = (caps.result && caps.result.domains) || [];
const domain = domains.find((d) => d.id === "wb-addon-tasks") || domains[0];
const payload = {
  ok: true,
  readonly: true,
  shellVersion: domains.length ? "0.6.5" : "0.6.5",
  domains: domains.map((d) => ({
    id: d.id,
    title: d.title || d.id,
    version: d.version || "",
    enabled: d.error == null,
    error: d.error || null,
  })),
  actions: actions.filter((a) => a.domain === domain.id),
};

const outDir = join(ROOT, ".tmp-actions-preview");
mkdirSync(outDir, { recursive: true });
const entry = join(outDir, "entry.jsx");
writeFileSync(entry, `import React from "react";
import { createRoot } from "react-dom/client";
import factory from ${JSON.stringify(join(ROOT, "packages/addons/lib/action-schema-view.cjs"))};

var api = { schema: function () { return Promise.resolve(window.__WB_SCHEMA__); } };
var view = factory({ domain: ${JSON.stringify(domain.id)}, prefix: "wbt" });
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
<style>body{margin:0;font:14px/1.6 -apple-system,system-ui,"PingFang SC",sans-serif;background:#f7f4ee;color:#2a241c}
#root{padding:18px}</style></head>
<body><div id="root"></div>
<script>window.__WB_SCHEMA__ = ${JSON.stringify(payload)};</script>
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
