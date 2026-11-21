/**
 * 「新建任务」弹窗预览：渲染真实 CreateModal（source=0），供浏览器截图核对视觉层级。
 * 只用于视觉验证，不参与构建；mock 数据只覆盖本弹窗用到的 action。
 *
 * 用法：node scripts/preview-create-modal.mjs --theme light --out /tmp/create-light.html
 */
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import Module from "node:module";
import { Hooks, makeReact, toHtml } from "./preview-salary.mjs";

const require = createRequire(import.meta.url);
const ROOT = new URL("../", import.meta.url).pathname;

// 共享组件与插件的迷你 React 注入：模块顶层 require("react") 的组件要转发到当前 hooks。
let ACTIVE = null;
const reactStub = {
  useState: (...args) => ACTIVE.useState(...args),
  useEffect: (...args) => ACTIVE.useEffect(...args),
  useMemo: (fn) => fn(),
  useCallback: (fn) => fn,
  useRef: (value) => ACTIVE.useRef(value),
  useLayoutEffect: (...args) => ACTIVE.useEffect(...args),
  createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
  Fragment: "Fragment",
};
const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request.startsWith("lucide-react/icons/")) return { default: function StubIcon() { return null; } };
  if (request === "react") return reactStub;
  return origLoad.call(this, request, parent, isMain);
};

const argOf = (name, fallback) => {
  const index = process.argv.indexOf("--" + name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
};
const theme = argOf("theme", "light");
const out = argOf("out", "/tmp/create-modal-" + theme + ".html");

const COPY = require("../packages/addons/tasks/client/ui/copy.cjs");
const uiCss = require("../packages/addons/tasks/client/ui/styles.cjs");
const timelineCss = require("../packages/addons/tasks/client/timeline/timeline-styles.cjs");
const baseCss = require("../packages/addons/lib/client-base-styles.cjs")("wbt");

const TREE = [{
  id: "1", name: "全部任务组", type: "2", children: [{
    id: "g-dsh", name: "DeepseekHarness", type: "0", children: [{
      id: "g-plugin", name: "插件开发", type: "0", children: [{
        id: "g-wb", name: "dsh-workbench", type: "0", children: [
          { id: "t-dev", name: "开发任务表", type: "1", description: "跨插件通用开发表" },
          { id: "t-task", name: "dsh-workbench-task", type: "1", description: "tasks 插件专属表" },
        ],
      }],
    }],
  }],
}];

// 20 条时间线：正好一页，用来验证列表限高与分页。
const timelines = Array.from({ length: 20 }, (_, i) => ({
  timelineId: "tl-" + (i + 1),
  title: "工作台全模块 UI 重做".replace("全模块", "第 " + (i + 1) + " 期"),
  taskCount: 3 + i,
}));

const api = {
  call: async (action) => {
    if (action === "tasks.timelines") return { ok: true, result: { records: timelines, total: 47 } };
    if (action === "taskWorkspaces.list") {
      return {
        ok: true,
        result: {
          records: [
            { id: "01a1c98a-5bb8-7942-8611-c9b1f7ef2259", title: "dsh-workbench 源码", dir: "/Users/yyq/code/dsh-workbench", description: "工作台仓库", taskCount: 128 },
            { id: "ws-2", title: "工资插件", dir: "/Users/yyq/code/dsh-workbench/packages/addons/salary", description: "", taskCount: 6 },
          ],
        },
      };
    }
    return { ok: true, result: {} };
  },
};

function splitTags(text) {
  const out = [];
  String(text || "").split(/[,，]/).forEach((x) => {
    const v = String(x).trim();
    if (v && out.indexOf(v) < 0) out.push(v);
  });
  return out;
}
const today = () => "2026-11-21";
const addDays = (n) => {
  const d = new Date("2026-11-21T00:00:00");
  d.setDate(d.getDate() + Number(n || 0));
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
};

const CreateModal = require("../packages/addons/tasks/client/modals/create-modal.cjs")({
  React: makeReact(new Hooks()), // 占位，真正渲染时用当前 hooks 重建
  allTables: () => [],
  tagNames: () => [],
  splitTags,
  today,
  addDays,
  hostHasAddon: () => true,
});

async function render() {
  const hooks = new Hooks();
  const React = makeReact(hooks);
  // create-modal 在工厂阶段就取 React，所以按当前 hooks 重新构造一次。
  const Modal = require("../packages/addons/tasks/client/modals/create-modal.cjs")({
    React,
    allTables: () => [],
    tagNames: () => [],
    splitTags,
    today,
    addDays,
    hostHasAddon: () => true,
  });
  let html = "";
  for (let pass = 0; pass < 12; pass += 1) {
    hooks.dirty = false;
    hooks.reset();
    ACTIVE = React;
    const tree = Modal({
      t: COPY.zh,
      lang: "zh",
      api,
      tree: TREE,
      source: "0",
      defaults: { priority: 5, difficulty: 1.5, targetOffset: 3 },
      onClose: () => {},
      onCreated: () => {},
    });
    // 嵌套函数组件在 toHtml 里才执行，所以每次都要先转成 HTML 再跑副作用收集到的 effect，
    // 否则列表与工作区的异步数据永远落不到 DOM 上。
    html = toHtml(tree);
    for (const effect of hooks.effects) effect();
    await new Promise((resolve) => setTimeout(resolve, 15));
    if (hooks.dirty) continue;
    if (pass >= 2) break;
  }
  return html;
}

const body = await render();
const tokens = theme === "dark"
  ? ":root{--wb-bg:#141311;--wb-card:#1d1c19;--wb-surface:#232220;--wb-border:#3a3833;--wb-line:#332f28;--wb-text:#e7e1d5;--wb-muted:#a09889;--wb-accent:#11a89b;--wb-ok:#54b06b;--wb-warn:#d8a13a;--wb-danger:#e2645c;--dsw-alias-bg-base:#141311;--dsw-alias-bg-layer-1:#1d1c19;--dsw-alias-brand-primary:#11a89b;--dsw-alias-label-primary:#e7e1d5;--dsw-alias-label-secondary:#a09889;--dsw-alias-border-l2:#3a3833}"
  : ":root{--wb-bg:#faf7f1;--wb-card:#fffdf8;--wb-surface:#f4f0e8;--wb-border:#ddd6c8;--wb-line:#e6e0d4;--wb-text:#2a241c;--wb-muted:#6d6459;--wb-accent:#11a89b;--wb-ok:#2f8f52;--wb-warn:#b07514;--wb-danger:#c0392b;--dsw-alias-bg-base:#faf7f1;--dsw-alias-bg-layer-1:#fffdf8;--dsw-alias-brand-primary:#11a89b;--dsw-alias-label-primary:#2a241c;--dsw-alias-label-secondary:#6d6459;--dsw-alias-border-l2:#ddd6c8}";
const html = `<!doctype html><meta charset=utf-8><title>新建任务弹窗（${theme}）</title>
<style>${tokens}</style>
<style>html,body{margin:0;height:100%;background:var(--wb-bg);color:var(--wb-text);font-family:system-ui,-apple-system,"PingFang SC",sans-serif}${baseCss}</style>
<style>${uiCss}</style>
<style>${timelineCss}</style>
<body data-theme="${theme}"><div class="wbt-root">${body}</div></body>`;
writeFileSync(out, html);
console.log("wrote", out, "bytes", html.length);
