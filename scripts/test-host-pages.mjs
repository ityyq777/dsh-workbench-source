/**
 * 宿主「数据」「配置」两页的渲染冒烟测试（不启动 DSH）。
 *
 * 背景：`createDataView()` 返回的是 `{ DataView, DOMAIN }`，不是组件本身；
 * 直接把它塞进 jsx 会触发 React #130（元素类型是对象），整个工作台白屏。
 *
 * A. 结构断言：用假 jsx 搭出两页的元素树，逐个节点断言 type 是字符串或函数。
 * B. 真 React 渲染：用 react-dom/server 真渲染加载态、配置就绪态（含开关与数字输入）
 *    与错误态，能抓出 hook 用法、Props 契约这类「假 jsx 看不出」的问题。
 */
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const HostPages = require("../packages/shell/client/host-pages.cjs");
const React = require("react");
const jsxRuntime = require("react/jsx-runtime");
const { renderToString } = require("react-dom/server");

// data-view 在渲染时会把样式挂到 document.head，Node 里给个最小实现。
globalThis.document = globalThis.document || {
  getElementById: () => null,
  createElement: () => ({ setAttribute() {}, appendChild() {}, textContent: "" }),
  head: { appendChild() {} },
};

const fakeJsx = {
  jsx: (type, props, key) => ({ type, props: props || {}, key }),
  jsxs: (type, props, key) => ({ type, props: props || {}, key }),
};

function reactStub() {
  return {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
    useState: (initial) => [typeof initial === "function" ? initial() : initial, () => {}],
    useEffect: () => {},
    useMemo: (fn) => fn(),
    useCallback: (fn) => fn,
    useRef: (v) => ({ current: v }),
    Fragment: "Fragment",
  };
}

function walk(node, visit) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) walk(item, visit);
    return;
  }
  visit(node);
  const children = node.props && node.props.children !== undefined ? node.props.children : node.children;
  walk(children, visit);
}

function assertRenderable(tree, pageName, minNodes = 4) {
  let count = 0;
  walk(tree, (node) => {
    if (node.type === undefined) return;
    count += 1;
    assert.ok(
      typeof node.type === "string" || typeof node.type === "function",
      pageName + " 出现无法渲染的元素类型（" + typeof node.type + "）：" + String(node.type),
    );
  });
  assert.ok(count >= minNodes, pageName + " 应该渲染出元素树，实际仅 " + count + " 个节点");
}

const deps = {
  jsx: fakeJsx,
  React: reactStub(),
  api: { post: async () => ({ ok: true, result: {} }) },
  lang: "zh",
  t: (key) => key,
  head: (title, desc) => fakeJsx.jsx("div", { className: "wb-page-head" }, title + (desc || "")),
};

// A. 结构：加载态两页
assertRenderable(HostPages.dataPage(deps), "数据页");
assertRenderable(HostPages.configPage(deps), "配置页");

const readyState = {
  ready: true,
  items: [
    { id: "audit.recordReads", group: "审计", label: "记录读取", description: "是否记录读操作", type: "boolean" },
    { id: "audit.retentionDays", group: "审计", label: "保留天数", description: "默认 180", type: "number", min: 7, max: 3650, step: 1 },
  ],
  values: { "audit.recordReads": true, "audit.retentionDays": 120 },
  overrides: { "audit.retentionDays": 120 },
  error: "",
};
const noopView = { state: readyState, busy: false, toast: "", onSave: () => {}, onReset: () => {} };
assertRenderable(HostPages.configBody(deps, noopView), "配置页就绪态", 8);

// B. 真 React 渲染
const realDeps = {
  jsx: jsxRuntime,
  React,
  api: { post: async () => ({ ok: true, result: {} }) },
  lang: "zh",
  t: (key) => key,
  head: (title, desc) => React.createElement("div", { className: "wb-page-head" }, title + "|" + (desc || "")),
};

const dataHtml = renderToString(HostPages.dataPage(realDeps));
assert.ok(dataHtml.includes("wbh-data"), "数据页应渲染出共享数据视图：" + dataHtml.slice(0, 200));
assert.ok(dataHtml.includes("wb-page-head"), "数据页应带页头");

const configHtml = renderToString(HostPages.configBody(realDeps, noopView));
assert.ok(configHtml.includes("wbctl-switch"), "配置页应渲染共享开关控件");
assert.ok(configHtml.includes("wbctl-num"), "配置页应渲染共享数字输入");
assert.ok(configHtml.includes('role="switch"'), "开关应是 role=switch");
assert.ok(configHtml.includes('value="120"'), "数字输入应带出当前值");

function ConfigPageWrapper() {
  return HostPages.configPage(realDeps);
}
const loadingHtml = renderToString(React.createElement(ConfigPageWrapper));
assert.ok(loadingHtml.includes("wb-page-head"), "配置页加载态应带页头");

const errorHtml = renderToString(
  HostPages.configBody(realDeps, { state: { ready: true, items: [], values: {}, overrides: {}, error: "读取配置失败" }, busy: false, toast: "", onSave: () => {}, onReset: () => {} }),
);
assert.ok(errorHtml.includes("读取配置失败"), "错误态应显示错误文案");

// 配置页必须以组件外壳交给路由渲染，直接调用会污染 WorkbenchPage 的 hook 链（React #310）。
assert(typeof HostPages.ConfigView === "function", "host-pages 应导出 ConfigView 组件外壳");
assert(
  jsxRuntime.jsx(HostPages.ConfigView, {}).type === HostPages.ConfigView,
  "ConfigView 应能作为组件类型交给 jsx 渲染",
);

// 两个方案重开备份页：默认勾选与导出请求使用同一组模块和格式。
const addons = ["one", "two"].map((id) => ({ id, title: id, backup: { export: true } }));
const backupTab = require("../packages/shell/client/backup-tab.cjs")(reactStub(), fakeJsx).BackupTab;
const previousFetch = globalThis.fetch;
const urls = [];
globalThis.fetch = async (url) => { urls.push(url); return { ok: false, status: 400, json: async () => ({}) }; };
try {
  for (const [ids, fmt, included] of [[null, "zip", ["one", "two"]], [["two", "absent"], "json", ["two"]], [[], "csv", []]]) {
    const beforeOpen = urls.length;
    const tree = backupTab({ addons, t: deps.t, preferences: { "backup.moduleIds": ids, "backup.exportFormat": fmt } });
    const checks = [], radios = [];
    let run;
    walk(tree, (n) => {
      if (n.type === "input" && n.props.type === "checkbox") checks.push(n.props.checked);
      if (n.props?.role === "radio") radios.push(n.props["aria-checked"]);
      if (n.type === "button" && n.props.onClick?.name === "doExport") run = n.props;
    });
    assert.equal(urls.length, beforeOpen, "打开页面不自动导出");
    assert.deepEqual(checks, addons.map((a) => included.includes(a.id)));
    assert.deepEqual(radios, ["zip", "json", "csv", "txt"].map((f) => f === fmt));
    if (included.length) {
      run.onClick();
      assert.equal(urls.at(-1), `/workbench/api/backup/export?modules=${included.join(",")}&format=${fmt}`);
    } else {
      run.onClick();
      assert.equal(urls.length, beforeOpen, "未选择模块时不能提交导出");
    }
  }
} finally { globalThis.fetch = previousFetch; }

// 账号与同步页打开后按方案读取列表；登录、同步与冲突裁决都是写操作，不能随方案自动执行。
const calls = [];
const syncApi = { get: async (path) => { calls.push(path); return path === "/account" ? { logged_in: true } : { ok: true }; }, post() { throw new Error("打开页面时发生写入"); } };
const hooks = { ...reactStub(), useEffect: (fn) => fn() };
const accountTab = require("../packages/shell/client/system-tabs.cjs")(hooks, fakeJsx, () => syncApi).AccountTab;
for (const limit of [7, 20, 100]) {
  accountTab({ t: deps.t, preferences: limit === 20 ? {} : { "cloud.conflictLimit": limit } });
  await Promise.resolve();
  assert.ok(calls.includes("/sync/conflicts?limit=" + limit));
}
assert.ok(configHtml.includes("wbh-cfg-schemes"), "配置页应复用共享方案条");
console.log("HOST PAGES TEST PASS：页面渲染、方案条、备份勾选与实际导出参数、云端冲突查询和手工边界");
