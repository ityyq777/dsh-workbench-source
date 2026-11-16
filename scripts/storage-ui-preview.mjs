#!/usr/bin/env node
/**
 * 储物记录页的浏览器预览：把「记录」视图打成静态页面，用于核对搜索结果高亮
 * 在浅色 / 深色下的对比度与版式；数据为固定 mock，不连宿主。
 *
 * 用法：node scripts/storage-ui-preview.mjs [端口]
 * 页面钩子：window.__SET_THEME__("light"|"dark")、window.__SEARCH__("抽纸")
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";
import { build } from "esbuild";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.argv[2] || 4622);
const CLIENT = join(ROOT, "packages/addons/storage/client");

const outDir = join(ROOT, ".tmp-storage-preview");
mkdirSync(outDir, { recursive: true });
const entry = join(outDir, "entry.jsx");
writeFileSync(
  entry,
  `import React from "react";
import { createRoot } from "react-dom/client";
import recordsModule from ${JSON.stringify(join(CLIENT, "views/records.cjs"))};
var Records = recordsModule.Records || recordsModule;
import styles from ${JSON.stringify(join(CLIENT, "ui/styles.cjs"))};

var h = React.createElement;
var now = Date.now();
var ITEMS = [
  { id: "it_1", name: "【示例】抽纸", brand: "维达 Tissues", unit: "包", location: "客厅柜子",
    stock: 3, remark: "抽纸快用完了，记得补货", tags: [{ id: "tag_1", name: "日用品" }],
    createTime: now - 86400e3, updateTime: now - 3600e3, imgList: [] },
  { id: "it_2", name: "洗衣液", brand: "蓝月亮", unit: "瓶", location: "阳台",
    stock: 1, remark: "抽纸旁边的架子", tags: [{ id: "tag_2", name: "清洁" }],
    createTime: now - 7200e3, updateTime: now - 600e3, imgList: [] },
];
var api = { call: function (name, args) {
  if (name === "storage.configGet") return Promise.resolve({ ok: true, result: { values: { "ui.bodyMode": "text" } } });
  if (name === "storage.capabilities") return Promise.resolve({ ok: true, result: { capabilities: {} } });
  if (name === "storage.tagOptions") return Promise.resolve({ ok: true, result: { tags: [{ id: "tag_1", name: "日用品", total: 1 }], total: 1 } });
  if (name === "storage.list") {
    var q = String((args && args.text) || "").toLowerCase();
    var hit = q ? ITEMS.filter(function (x) {
      return [x.name, x.brand, x.location, x.remark].some(function (v) { return String(v || "").toLowerCase().indexOf(q) >= 0; });
    }) : ITEMS;
    return Promise.resolve({ ok: true, result: { records: hit, total: hit.length, pages: 1, pageNumber: 1, pageSize: 12 } });
  }
  return Promise.resolve({ ok: true, result: { ok: true } });
} };
var setQueryRef = null;
function App() {
  return h("div", { className: "wbi-root" }, h(Records, { api: api, lang: "zh", title: "记录" }));
}
window.addEventListener("error", function (e) { document.title = "ERR " + (e.message || e); console.error("preview error", e.message); });
window.addEventListener("unhandledrejection", function (e) { document.title = "REJ " + (e.reason && e.reason.message || e.reason); });
try { createRoot(document.getElementById("root")).render(h(App)); } catch (e) { document.getElementById("root").textContent = "THROW " + e.message; }
window.__SEARCH__ = function (text) {
  var input = document.querySelector(".wbi-toolbar input[type=search]");
  if (!input) return "no-input";
  var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(input, text);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  return text;
};
window.__SET_THEME__ = function (mode) { document.documentElement.setAttribute("data-theme", mode); return mode; };
var sheet = document.createElement("style");
sheet.textContent = Array.isArray(styles) ? styles.join(String.fromCharCode(10)) : String(styles || "");
document.head.appendChild(sheet);
`,
);

await build({
  entryPoints: [entry],
  bundle: true,
  outfile: join(outDir, "bundle.js"),
  format: "iife",
  platform: "browser",
  define: { "process.env.NODE_ENV": '"development"' },
  loader: { ".js": "jsx", ".jsx": "jsx" },
  logLevel: "warning",
});

const bundle = readFileSync(join(outDir, "bundle.js"));
const html = `<!doctype html><html data-theme="light"><head><meta charset="utf-8">
<title>储物 · 搜索高亮预览</title>
<style>
:root{--wb-line:#d9dfe6;--wb-surface:#fff;--wb-accent:#2563eb;--wb-hit-bg-base:#2563eb;
--dsw-alias-bg-layer-1:#fff;--dsw-alias-label-secondary:#64748b;--dsw-alias-brand-primary:#2563eb;
--dsw-alias-border-l2:#d9dfe6;--dsw-alias-label-primary-inverted:#fff;--dsw-alias-state-error-primary:#b91c1c;
--wb-btn-bg:#eef2f7;--wb-btn-hover-bg:#e3e9f2;--wb-btn-active-bg:#d8e0ec;--wb-btn-primary-bg:#2563eb;
--wb-btn-danger-fg:#b91c1c;--wb-btn-size-sm:28px;--wb-btn-focus:2px solid #2563eb;--wb-btn-focus-offset:2px;
--wb-description-bg:#f5f8ff;color:#1f2430;background:#fff;font:14px/1.5 system-ui,"PingFang SC",sans-serif}
html[data-theme=dark]{--wb-line:#3a372f;--wb-surface:#1d1c19;--wb-accent:#7aa2f7;--wb-hit-bg-base:#7aa2f7;
--dsw-alias-bg-layer-1:#1d1c19;--dsw-alias-label-secondary:#a8a296;--dsw-alias-brand-primary:#7aa2f7;
--dsw-alias-border-l2:#3a372f;--dsw-alias-label-primary-inverted:#101010;--dsw-alias-state-error-primary:#f87171;
--wb-btn-bg:#2a2823;--wb-btn-hover-bg:#33302a;--wb-btn-active-bg:#3b372f;--wb-btn-primary-bg:#4f7fd9;
--wb-btn-danger-fg:#f87171;--wb-btn-focus:2px solid #7aa2f7;--wb-description-bg:#23221e;color:#ece7dd;background:#1d1c19}
body{margin:0;padding:20px 24px 40px;background:var(--wb-surface);color:inherit}
#root{animation:preview-tick .6s infinite alternate}
@keyframes preview-tick{from{opacity:1}to{opacity:.999}}

</style></head><body><div id="root"></div>
<script src="./bundle.js"></script></body></html>`;

createServer((req, res) => {
  const url = (req.url || "/").split("?")[0];
  if (url === "/bundle.js") {
    res.writeHead(200, { "content-type": "text/javascript" });
    res.end(bundle);
    return;
  }
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(html);
}).listen(PORT, "127.0.0.1", () => {
  console.log("storage preview: http://127.0.0.1:" + PORT + "/");
});

