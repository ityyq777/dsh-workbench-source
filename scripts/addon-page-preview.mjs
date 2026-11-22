/**
 * 通用插件页面预览：把真实构建产物（packages/addons/<插件>/lib/client.js）挂进假宿主，
 * 用假 api 数据渲染任意插件的任意视图，供窄屏（320/390/618…）截图核对。
 *
 * 为什么不用各插件自己的预览脚本：那些只覆盖少数页面，没写预览的插件（contacts/tags/
 * connector/calendar/mail…）就无从核对。构建产物是 window.__ModuleLoader__ 的工厂模块，
 * 只要给出 __WB_HOST__ 与 require 垫片就能直接跑起来。
 *
 * 用法：
 *   node scripts/addon-page-preview.mjs <插件> [--view <视图 id>] [--port 4700]
 *   node scripts/addon-page-preview.mjs contacts --view contacts --port 4700
 * 页面参数：?theme=light|dark&lang=zh|en&w=<iframes 宽度>（w 省略时整页铺满）。
 */
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const plugin = process.argv[2];
if (!plugin) {
  console.error("用法：node scripts/addon-page-preview.mjs <插件> [--view <id>] [--port <port>]");
  process.exit(2);
}
const viewArg = (() => {
  const i = process.argv.indexOf("--view");
  return i > -1 ? process.argv[i + 1] : "";
})();
const portArg = (() => {
  const i = process.argv.indexOf("--port");
  return i > -1 ? Number(process.argv[i + 1]) : 4700;
})();

const bundlePath = path.join(ROOT, "packages/addons", plugin, "lib/client.js");
let bundle;
try {
  bundle = readFileSync(bundlePath, "utf8");
} catch {
  console.error(`找不到构建产物 ${path.relative(ROOT, bundlePath)}，先跑 pnpm build`);
  process.exit(2);
}

/** 各插件的假数据：key 为 action 名，值是返回数据或函数。 */
const FIXTURES = {
  contacts: {
    "contacts.status": { contacts: 3, groups: 2, fields: 5 },
    "contacts.list": {
      items: [
        { id: "c1", name: "张伟", org: "海图科技", title: "产品经理", birthday: "1990-04-12", note: "同学", groups: ["g1"], fields: [{ kind: "phone", value: "13800000001" }, { kind: "email", value: "zhangwei@example.com" }] },
        { id: "c2", name: "李娜", org: "独立设计", title: "设计师", birthday: "", note: "合作过两次项目，偏好邮件沟通，回复较慢", groups: ["g2"], fields: [{ kind: "email", value: "lina@example.com" }] },
        { id: "c3", name: "王强", org: "", title: "", birthday: "", note: "", groups: [], fields: [{ kind: "phone", value: "13900000003" }] },
      ],
    },
    "contacts.groupList": { items: [{ id: "g1", name: "同学", color: "#2563eb", contactCount: 1 }, { id: "g2", name: "合作方", color: "#0f9d8f", contactCount: 1 }] },
    "contacts.fieldList": { items: [{ id: "f1", kind: "phone", label: "手机" }, { id: "f2", kind: "email", label: "邮箱" }] },
  },
  tags: {
    "tags.status": { tags: 3, links: 9 },
    "tags.list": { items: [{ id: "t1", name: "重要", color: "#e5484d", count: 4 }, { id: "t2", name: "工作", color: "#2563eb", count: 3 }, { id: "t3", name: "待整理", color: "", count: 2 }] },
  },
  connector: {
    "connector.status": { sources: 2, runs: 4 },
    "connector.sourceList": { items: [{ id: "s1", name: "本地目录", kind: "fs", enabled: true }, { id: "s2", name: "Webhook", kind: "http", enabled: false }] },
    "connector.itemList": { items: [{ id: "i1", sourceId: "s1", title: "设计稿备份", size: 2400000, updatedAt: 1795300000000 }, { id: "i2", sourceId: "s2", title: "周报推送", size: 1200, updatedAt: 1795200000000 }] },
  },
  calendar: {
    "calendar.list": { items: [{ id: "e1", title: "周会", startAt: 1795300000000, endAt: 1795303600000, allDay: false, location: "会议室 A" }, { id: "e2", title: "体检", startAt: 1795386400000, endAt: 1795386400000, allDay: true }] },
  },
};

const fixtures = FIXTURES[plugin] || {};

const css = path.join(ROOT, "packages/shell/client/styles.cjs");
const shellCss = (() => {
  try {
    const req = createRequire(import.meta.url);
    const val = req(css);
    return Array.isArray(val) ? val.join("\n") : String(val || "");
  } catch (e) {
    console.warn("宿主样式加载失败：", e && e.message);
    return "";
  }
})();

const page = (theme, lang, width) => `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<title>${plugin} preview</title>
<style>${shellCss}
html,body{margin:0;padding:0}
body{margin:0;background:var(--wb-bg,#f5f7fa);color:var(--wb-text,#0f172a)}
html[data-theme="dark"] body{background:#0b1020;color:#e8ecf4}
#stage{min-height:100vh}
${width ? `#stage{width:${width}px;margin:0 auto;border-left:1px solid var(--wb-line,#e5e7eb);border-right:1px solid var(--wb-line,#e5e7eb)}` : ""}
</style></head>
<body data-theme="${theme}"><div id="stage"></div>
<script src="/react.js"></script>
<script>
// 假宿主：插件 bundle 在加载时就要求 host.react / host.h / registerAddon（部分插件还要 Slot/ addons）。
window.__WB_HOST__ = {
  react: window.React,
  h: window.React.createElement,
  registerAddon: function (cfg) { window.__ADDON__ = cfg; },
  addons: {},
  Slot: function () { return null; },
  on: function () {},
  emit: function () {},
};
</script>
<script src="/plugin.js"></script>
<script>
(async function () {
  var hostApi = ${JSON.stringify(fixtures)};
  var api = {
    // 有的视图会订阅宿主事件（api.subscribe），预览里给个不触发的空实现。
    subscribe: function () { return function () {}; },
    unsubscribe: function () {},
    on: function () { return function () {}; },
    emit: function () {},
    call: function (action, args) {
      var v = hostApi[action];
      if (typeof v === "function") v = v(args);
      if (v === undefined) {
        // 预览缺数据时记一行日志，便于用 err.mjs 查出这个视图到底要哪些 action。
        console.log("[fixture-missing] " + action + " " + JSON.stringify(args || null));
        return Promise.resolve({});
      }
      return Promise.resolve(v);
    },
  };
  var loader = window.__ModuleLoader__;
  var factory = loader && loader.modules && loader.modules[${JSON.stringify("dsh-workbench-" + plugin)}] ||
    (loader && loader.modules && Object.values(loader.modules)[0]);
  if (!factory) { document.getElementById("stage").textContent = "模块没有注册：找不到 loader 工厂"; return; }
  factory(function (name) {
    if (name === "react") return React;
    if (name === "react-dom") return ReactDOM;
    if (name.indexOf("lucide-react") === 0) return { default: function I() { return null; } };
    throw new Error("预览未提供模块：" + name);
  });
  var addon = window.__ADDON__;
  if (!addon) { document.getElementById("stage").textContent = "registerAddon 没有被调用"; return; }
  var viewId = ${JSON.stringify(viewArg)};
  var view = (addon.views || []).filter(function (v) { return !viewId || v.id === viewId; })[0];
  if (!view) { document.getElementById("stage").textContent = "没有这个视图：" + viewId + "，可选 " + (addon.views || []).map(function (v) { return v.id; }).join(","); return; }
  var props = {
    React: React, ReactDOM: ReactDOM, h: React.createElement, api: api, lang: ${JSON.stringify(lang)},
    active: true, theme: ${JSON.stringify(theme)},
  };
  // 套一层宿主外壳（.wb-root > .wb-immersive > .wb-immersive-main > .wb-inner），
  // 这样截到的是带页面内边距的真实效果，而不是贴边渲染的假象。
  var frame = React.createElement(
    "div",
    { className: "wb-root" },
    React.createElement(
      "div",
      { className: "wb-immersive" },
      React.createElement(
        "div",
        { className: "wb-immersive-main" },
        React.createElement("div", { className: "wb-inner wb-wide" }, React.createElement(view.component, props)),
      ),
    ),
  );
  ReactDOM.createRoot(document.getElementById("stage")).render(frame);
})();
</script>
</body></html>`;

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1");
  if (url.pathname === "/plugin.js") {
    res.writeHead(200, { "content-type": "text/javascript; charset=utf-8" });
    res.end(bundle);
    return;
  }
  if (url.pathname === "/react.js") {
    const out = await build({
      stdin: {
        contents: `import React from "react"; import ReactDOM from "react-dom/client"; window.React = React; window.ReactDOM = ReactDOM;`,
        resolveDir: ROOT,
        loader: "js",
      },
      bundle: true,
      write: false,
      format: "iife",
      platform: "browser",
      define: { "process.env.NODE_ENV": '"development"' },
    });
    res.writeHead(200, { "content-type": "text/javascript; charset=utf-8" });
    res.end(out.outputFiles[0].text);
    return;
  }
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(page(url.searchParams.get("theme") === "dark" ? "dark" : "light", url.searchParams.get("lang") === "en" ? "en" : "zh", Number(url.searchParams.get("w")) || 0));
});

server.listen(portArg, () => {
  console.log(`preview http://127.0.0.1:${portArg}/?theme=light  view=${viewArg || "全部"}`);
});
