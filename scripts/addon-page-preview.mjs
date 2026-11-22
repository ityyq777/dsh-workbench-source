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
  vault: {
    // 只关心布局，给一个已解锁状态与三条凭据即可。
    "vault.status": { locked: false, initialized: true },
    "vault.setList": { items: [{ id: "set1", name: "生产环境" }, { id: "set2", name: "个人" }] },
    "vault.secretList": { items: [
      { id: "k1", name: "GitHub Token", kind: "token", setIds: ["set1"], meta: JSON.stringify({ note: "CI 拉取私有仓库" }), lastUsedAt: 1795300000000 },
      { id: "k2", name: "数据库密码", kind: "password", setIds: ["set1", "set2"], meta: JSON.stringify({ note: "只读账号，季度轮换" }) },
      { id: "k3", name: "个人 API Key", kind: "apikey", setIds: [], meta: "{}" },
    ] },
  },
  salary: {
    "salary.status": {},
    "salary.recordList": { items: [
      { id: "r1", payDate: "2026-11-15", incomePeriod: "2026-11", cycle: "monthly", employmentType: "regular", netPay: 12800, grossPay: 16000, incomeTax: 320, note: "" },
      { id: "r2", payDate: "2026-10-15", incomePeriod: "2026-10", cycle: "monthly", employmentType: "regular", netPay: 12400, grossPay: 16000, incomeTax: 300, note: "含季度奖金" },
      { id: "r3", payDate: "2026-09-20", incomePeriod: "2026-09", cycle: "daily", employmentType: "probation", netPay: 5200, grossPay: 6800, incomeTax: 90, note: "试用期按日结" },
    ], total: 3 },
  },
  mail: {
    "mail.configGet": { values: {} },
    "mail.accountList": { items: [{ id: "a1", name: "工作邮箱", address: "me@example.com", email: "me@example.com" }] },
    "mail.mailboxList": { items: [
      { name: "INBOX", label: "收件箱", total: 3, unread: 1 },
      { name: "Sent", label: "已发送", total: 2, unread: 0 },
    ] },
    "mail.messageList": { items: [
      { id: "m1", accountId: "a1", mailbox: "INBOX", uid: 1, subject: "周会纪要：Q4 排期与人力分配", from: "li.na@example.com", fromName: "李娜", date: "2026-11-20", unread: true, snippet: "附件是本周排期，麻烦周四前确认。" },
      { id: "m2", accountId: "a1", mailbox: "INBOX", uid: 2, subject: "Design review notes for the narrow layout pass", from: "wang.qiang@example.com", fromName: "王强", date: "2026-11-19", unread: false, snippet: "See the attached screenshots for 320px behaviour." },
      { id: "m3", accountId: "a1", mailbox: "INBOX", uid: 3, subject: "账单：十一月云服务费用", from: "billing@example.com", fromName: "云服务账单", date: "2026-11-18", unread: false, snippet: "共计 ¥128.40，将在 11-25 自动扣款。" },
    ], nextCursor: null },
  },
  storage: {
    // 统计页只用到计数与最近更新；库存是文字，不做求和。
    "storage.stats": { total: 3, tagged: 2, withImages: 1, recent: [
      { id: "i1", name: "螺丝刀套装", stock: "2", unit: "套" },
      { id: "i2", name: "A4 打印纸", stock: "500", unit: "张" },
      { id: "i3", name: "Type-C 数据线", stock: "3", unit: "根" },
    ] },
    "storage.list": { items: [
      { id: "i1", name: "螺丝刀套装", stock: "2", unit: "套", tags: ["工具"], createTime: "2026-11-01" },
      { id: "i2", name: "A4 打印纸", stock: "500", unit: "张", tags: ["耗材"], createTime: "2026-11-05" },
      { id: "i3", name: "Type-C 数据线", stock: "3", unit: "根", tags: [], createTime: "2026-11-10" },
    ] },
    "storage.capabilities": { kinds: ["item", "tag"] },
    "storage.configGet": { values: {} },
  },
  calendar: {
    "calendar.list": { items: [{ id: "e1", title: "周会", startAt: 1795300000000, endAt: 1795303600000, allDay: false, location: "会议室 A" }, { id: "e2", title: "体检", startAt: 1795386400000, endAt: 1795386400000, allDay: true }] },
  },
};

// 邮件等页面会先查保险箱状态；默认给“已解锁”，各插件自带同名 fixture 时以自带为准。
const fixtures = Object.assign({ "vault.status": { locked: false, initialized: true } }, FIXTURES[plugin] || {});
// storage 等插件的 ui.call 走 {ok, result} 信封，预览按插件名决定是否补外壳。
const envelope = new Set(["storage"]).has(plugin);

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
  // 少数插件的 ui.call 走 {ok, result} 信封（如 storage 的 wbi），预览按插件名补齐外壳。
  var envelope = ${JSON.stringify(envelope)};
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
        v = {};
      }
      return Promise.resolve(envelope ? { ok: true, result: v } : v);
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
