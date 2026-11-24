#!/usr/bin/env node
/**
 * 角色弹层 / 角色向导的浏览器预览：esbuild 打包真实组件，用桩 fetch 喂一份角色目录，
 * 供人工与截图核对浅色/深色、宽屏/窄屏的版面。
 *
 * 用法：node scripts/role-ui-preview.mjs [端口]
 * 页面参数：view=picker|wizard，theme=light|dark，lang=zh|en，width=wide|mobile。
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";
import { build } from "esbuild";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.argv[2] || 4612);
const OUT = join(ROOT, ".tmp-role-preview");
mkdirSync(OUT, { recursive: true });

const ROLES = [
  {
    id: "tasks/publisher", source: "plugin", domain: "wb-addon-tasks", version: "1.1.0",
    name: "任务发布者", description: "把一段需求整理成任务，补齐验收标准与难度",
    instructions: "## 职责\n\n- 先澄清目标，再拆任务\n- 每周五汇总进度",
    actions: ["tasks.create", "tasks.update", "tasks.list"],
  },
  {
    id: "tasks/archivist", source: "plugin", domain: "wb-addon-tasks", version: "1.1.0",
    name: "任务归档员", description: "定期收拢已完成任务，清理重复标签与滞留草稿",
    instructions: "## 职责\n\n- 先澄清目标，再拆任务\n- 每周五汇总进度",
    actions: ["tasks.list", "tasks.complete", "tags.list"],
  },
  {
    id: "sites/reviewer", source: "plugin", domain: "wb-addon-sites", version: "0.6.2",
    name: "站点巡检员", description: "按周检查站点可达性与描述完整性，把异常写成条目",
    instructions: "## 职责\n\n- 先澄清目标，再拆任务\n- 每周五汇总进度",
    actions: ["sites.list", "sites.update"],
  },
  {
    id: "user:1", source: "user", domain: "user", version: "v1",
    name: "归档员", description: "整理条目",
    instructions: "## 职责\n\n- 先澄清目标，再拆任务\n- 每周五汇总进度",
    actions: ["tasks.list", "tasks.complete"],
  },
  {
    id: "user:2", source: "user", domain: "user", version: "v1",
    name: "Weekly reviewer with a deliberately long name",
    description: "Very long description to check wrapping inside a card row at narrow widths, including CJK 与很长的英文单词 WeeklyReviewerForEverything",
    instructions: "## 职责\n\n- 先澄清目标，再拆任务\n- 每周五汇总进度",
    actions: [],
  },
];

// 动作目录夹具：覆盖多域、40 项以上，用来核对窄屏下动作列表的滚动与「全选/清空本域」。
const DOMAINS = [
  ["tasks", 12], ["tags", 8], ["sites", 10], ["storage", 8], ["wb", 7],
];
// 角色自己引用的真实动作也要在目录里，否则预览页会一直停在「不存在的动作」拦截态。
const REAL = ["tasks.create", "tasks.list", "tasks.complete", "tags.list", "sites.list", "sites.update"];
const ACTIONS = REAL.map((name) => ({
  name, domain: "wb-addon-" + name.split(".")[0], description: "角色已引用的动作", origins: ["agent", "ui"],
})).concat(DOMAINS.flatMap(([domain, count]) => Array.from({ length: count }, (_, i) => ({
  name: domain + ".action" + (i + 1), domain: "wb-addon-" + domain,
  description: domain + " 域的第 " + (i + 1) + " 个动作", origins: ["agent", "ui"],
}))));

const dict = {
  zh: {
    role_title: "工作台角色", role_none: "不使用工作台角色", role_none_desc: "沿用当前 DSH 会话设置",
    role_missing: "角色已不可用，请重新选择", role_next: "选择将从下一轮对话生效。", role_close: "关闭",
    role_retry: "重试", role_error: "无法读取或保存会话设置", role_loading: "读取中…",
    role_search: "搜索角色（名称、域、说明或动作）", role_search_clear: "清空搜索",
    role_search_empty: "没有匹配的角色", role_search_count: "匹配 {shown} / 共 {total} 个角色",
    role_hint: "↑↓ 选择 · Enter 确认 · Esc 关闭",
  },
  en: {
    role_title: "Workbench role", role_none: "No workbench role", role_none_desc: "Use the current DSH session settings",
    role_missing: "Role unavailable. Choose another role.", role_next: "Changes apply to the next turn.", role_close: "Close",
    role_retry: "Retry", role_error: "Could not read or save session settings", role_loading: "Loading…",
    role_search: "Search roles (name, domain, description or action)", role_search_clear: "Clear search",
    role_search_empty: "No matching roles", role_search_count: "{shown} of {total} roles match",
    role_hint: "↑↓ select · Enter confirm · Esc close",
  },
};

const entry = join(OUT, "entry.jsx");
writeFileSync(entry, `import React from "react";
import { createRoot } from "react-dom/client";
import picker from ${JSON.stringify(join(ROOT, "packages/shell/client/conversation/session-role.cjs"))};
import catalog from ${JSON.stringify(join(ROOT, "packages/shell/client/conversation/catalog.cjs"))};
import styles from ${JSON.stringify(join(ROOT, "packages/shell/client/conversation/styles.cjs"))};

var style = document.createElement("style");
style.textContent = Array.isArray(styles) ? styles.join("\\n") : String(styles);
document.head.appendChild(style);

var params = new URLSearchParams(location.search);
var lang = params.get("lang") === "en" ? "en" : "zh";
var theme = params.get("theme") === "dark" ? "dark" : "light";
var width = params.get("width") === "mobile" ? "mobile" : "wide";
var view = params.get("view") === "wizard" ? "wizard" : "picker";
document.documentElement.setAttribute("data-theme", theme);

var dict = window.__WB_DICT__[lang];
var t = function (key) { return dict[key] || key; };
var root = createRoot(document.getElementById("root"));

if (view === "wizard") {
  // 角色管理页：桩掉 api 与 EventSource，让真实页面自己走读目录 → 选中 → 编辑的流程。
  window.EventSource = function () { return { addEventListener: function () {}, close: function () {} }; };
  var roles = window.__WB_ROLES__;
  var api = {
    get: function () { return Promise.resolve({ ok: true, roles: roles }); },
    post: function (path) {
      if (path === "/domains/wb-shell/actions/actions.list") {
        return Promise.resolve({ ok: true, result: { actions: window.__WB_ACTIONS__ } });
      }
      return Promise.resolve({ ok: true, roles: roles });
    },
  };
  var head = function (title, desc) {
    return React.createElement("div", { className: "preview-head" },
      React.createElement("h2", null, title), React.createElement("p", null, desc));
  };
  root.render(React.createElement(catalog, { api: api, lang: lang, head: head }));
  // 选中第一个自定义角色并进入编辑，直接落在向导第一步。
  setTimeout(function () {
    var row = Array.prototype.slice.call(document.querySelectorAll(".wbr-row"))
      .filter(function (node) { return node.textContent.indexOf("user:1") >= 0; })[0];
    if (row) row.click();
    setTimeout(function () {
      var edit = Array.prototype.slice.call(document.querySelectorAll(".wbr-btn"))
        .filter(function (node) { return node.textContent === (lang === "en" ? "Edit" : "编辑"); })[0];
      if (edit) edit.click();
    }, 60);
  }, 60);
} else {
  var roleId = params.get("selected") === "1" ? "tasks/publisher" : null;
  var state = { ok: true, sessionId: "preview", roleId: roleId, roles: window.__WB_ROLES__, unavailable: false };
  window.fetch = function (url, options) {
    if (options && options.method === "POST") {
      var body = JSON.parse(options.body);
      state.roleId = body.roleId;
    }
    return Promise.resolve({ ok: true, json: function () { return Promise.resolve(Object.assign({}, state)); } });
  };
  root.render(React.createElement("div", { className: "preview-composer" },
    React.createElement("span", { className: "preview-hint" }, lang === "en" ? "Workbench role picker" : "工作台角色选择"),
    React.createElement(picker.SessionRole, { sessionId: "preview", t: t, ensureStream: function () {} })));
  setTimeout(function () {
    var trigger = document.querySelector('[aria-haspopup="dialog"]');
    if (trigger) trigger.click();
  }, 80);
}
`);
await build({
  entryPoints: [entry], bundle: true, outfile: join(OUT, "bundle.js"),
  platform: "browser", format: "iife", loader: { ".jsx": "jsx" },
  define: { "process.env.NODE_ENV": '"production"' }, logLevel: "error",
});

// 预览页自己的底色调色板：只模拟 DSH 主题变量，业务样式仍全部取自 styles.cjs。
const PALETTE = `html[data-theme=light]{--wb-card:#fffdf8;--wb-surface:#f5f2ea;--wb-border:#e3e5e9;--wb-line:#e3ddd1;--wb-accent:#0f8f84;--wb-muted:#8a8377;--wb-ok:#2f9e6f;--wb-warn:#b57a15;--wb-danger:#c0453b;--dsw-alias-label-primary:#2a241c;--dsw-alias-label-tertiary:#8a8377;--dsw-alias-border-l2:#e3ddd1;--dsw-alias-bg-layer-1:#fffdf8;--dsw-alias-bg-layer-2:#f5f2ea;--dsw-alias-brand-primary:#0f8f84;--dsw-alias-state-error-primary:#c0453b}
html[data-theme=dark]{--wb-card:#1d1c19;--wb-surface:#151412;--wb-border:#38352f;--wb-line:#2a2824;--wb-accent:#4fd1c0;--wb-muted:#9a938a;--wb-ok:#5cc08c;--wb-warn:#e0a94a;--wb-danger:#e57b70;--dsw-alias-label-primary:#f1ece2;--dsw-alias-label-tertiary:#9a938a;--dsw-alias-border-l2:#2a2824;--dsw-alias-bg-layer-1:#1d1c19;--dsw-alias-bg-layer-2:#151412;--dsw-alias-brand-primary:#4fd1c0;--dsw-alias-state-error-primary:#e57b70}
body{margin:0;font:14px/1.6 -apple-system,system-ui,"PingFang SC",sans-serif;background:var(--wb-surface);color:var(--dsw-alias-label-primary)}
.preview-composer{display:flex;align-items:center;gap:10px;padding:16px}
.preview-hint{font-size:12px;color:var(--wb-muted)}
#root{min-height:100vh}
.preview-head h2{margin:12px 0 2px;font-size:18px}
.preview-head p{margin:0 0 12px;font-size:13px;color:var(--wb-muted)}`;

const frame = `<!doctype html><html lang="zh"><head><meta charset="utf-8" />
<style>${PALETTE}
html[data-width=mobile] body{width:100%}
</style></head><body><div id="root"></div>
<script>window.__WB_ROLES__=${JSON.stringify(ROLES)};window.__WB_ACTIONS__=${JSON.stringify(ACTIONS)};window.__WB_DICT__=${JSON.stringify(dict)};</script>
<script src="bundle.js"></script></body></html>`;
writeFileSync(join(OUT, "frame.html"), frame);

const index = `<!doctype html><html lang="zh"><head><meta charset="utf-8" /><title>角色界面预览</title>
<style>${PALETTE}
body{margin:0;background:var(--wb-surface)}
#bar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:12px 16px;border-bottom:1px solid var(--wb-line)}
#bar button{font:inherit;font-size:12px;border:1px solid var(--wb-line);background:var(--wb-card);color:inherit;border-radius:999px;padding:3px 10px;cursor:pointer}
#bar button[aria-pressed=true]{border-color:var(--wb-accent);color:var(--wb-accent)}
#frame{display:block;width:100%;height:calc(100vh - 58px);border:0}
#mobile{display:none;padding:16px}
</style></head><body>
<div id="bar">
  <span class="preview-hint">主题</span>
  <button data-theme="light">浅色</button><button data-theme="dark">深色</button>
  <span class="preview-hint">语言</span>
  <button data-lang="zh">中文</button><button data-lang="en">English</button>
  <span class="preview-hint">视图</span>
  <button data-view="picker">角色弹层</button><button data-view="wizard">角色向导</button>
  <span class="preview-hint">宽度</span>
  <button data-width="wide">宽屏</button><button data-width="mobile">375</button>
</div>
<iframe id="frame"></iframe>
<script>
var qs = { theme: "light", lang: "zh", width: "wide", view: new URLSearchParams(location.search).get("view") || "picker" };
function paint() {
  document.documentElement.setAttribute("data-theme", qs.theme);
  document.getElementById("frame").src = "frame.html?" + new URLSearchParams(qs).toString();
  document.querySelectorAll("#bar button").forEach(function (b) {
    var kind = b.hasAttribute("data-theme") ? "theme" : b.hasAttribute("data-lang") ? "lang" : b.hasAttribute("data-view") ? "view" : "width";
    b.setAttribute("aria-pressed", String(qs[kind] === b.getAttribute("data-" + kind)));
  });
}
document.querySelectorAll("#bar button").forEach(function (b) {
  b.onclick = function () {
    if (b.getAttribute("data-theme")) qs.theme = b.getAttribute("data-theme");
    if (b.getAttribute("data-lang")) qs.lang = b.getAttribute("data-lang");
    if (b.getAttribute("data-width")) qs.width = b.getAttribute("data-width");
    if (b.getAttribute("data-view")) qs.view = b.getAttribute("data-view");
    // 375 宽度用 iframe 的实际宽度模拟，媒体查询与 fixed 遮罩才会按窄屏生效。
    var frame = document.getElementById("frame");
    var mobile = qs.width === "mobile";
    frame.style.width = mobile ? "375px" : "100%";
    frame.style.margin = mobile ? "0 auto" : "0";
    frame.style.display = "block";
    paint();
  };
});
window.__SET_PREVIEW__ = function (next) { Object.assign(qs, next); window.dispatchEvent(new Event("preview")); };
addEventListener("preview", function () { document.querySelector('#bar button[data-theme="' + qs.theme + '"]').click(); });
paint();
</script></body></html>`;
writeFileSync(join(OUT, "index.html"), index);

const MIME = { html: "text/html; charset=utf-8", js: "text/javascript; charset=utf-8" };
createServer((req, res) => {
  const name = (req.url || "/").split("?")[0].replace(/^\//, "") || "index.html";
  const file = join(OUT, name);
  res.writeHead(200, { "content-type": MIME[name.split(".").pop()] || "application/octet-stream" });
  res.end(readFileSync(file));
}).listen(PORT, "127.0.0.1", () => console.log("role preview: http://127.0.0.1:" + PORT + "/"));
