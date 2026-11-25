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
const syncApi = { get: async (path) => { calls.push(path); return path === "/account" ? { logged_in: true, mode: "shared" } : { ok: true }; }, post() { throw new Error("打开页面时发生写入"); } };
const hooks = { ...reactStub(), useEffect: (fn) => fn() };
const accountTab = require("../packages/shell/client/system-tabs.cjs")(hooks, fakeJsx, () => syncApi).AccountTab;
for (const limit of [7, 20, 100]) {
  accountTab({ t: deps.t, preferences: limit === 20 ? {} : { "cloud.conflictLimit": limit } });
  await Promise.resolve();
  assert.ok(calls.includes("/sync/conflicts?limit=" + limit));
}
// 配置卡读取已保存模式，选择草稿不写入；只有保存按钮提交连接参数。
const CloudSettings = require("../packages/shell/client/cloud-settings.cjs");
assert.ok(configHtml.includes('cloud_settings'), "配置页必须挂载云端类型编辑器");
function mountHooks() {
  const state = [];
  let cursor = 0, first = true;
  const react = { ...reactStub(), useState(initial) {
    const slot = cursor++;
    if (!(slot in state)) state[slot] = initial;
    return [state[slot], next => { state[slot] = typeof next === 'function' ? next(state[slot]) : next; }];
  }, useEffect(fn) { if (first) fn(); } };
  return { react, render(fn) { cursor = 0; const tree = fn(); first = false; return tree; } };
}
function elements(tree, match) { const hits = []; walk(tree, n => { if (match(n)) hits.push(n.props); }); return hits; }
for (const saved of [undefined, 'none', 'private', 'shared']) {
  const mode = saved || 'none', mount = mountHooks(), writes = [];
  const api = { get: async () => ({ ok: true, mode: saved, private: { url: 'https://test.invalid', has_secret: true } }),
    post: async (url, body) => { writes.push({ url, body }); return { ok: true, mode: body.mode }; } };
  const render = () => mount.render(() => CloudSettings({ ...deps, api, React: mount.react }));
  const first = render();
  assert.ok(elements(first, n => n.props?.children === 'cloud_save')[0].disabled);
  await Promise.resolve();
  const loaded = render();
  assert.equal(elements(loaded, n => n.props?.['aria-pressed'] === true)[0].children, 'cloud_mode_' + mode);
  elements(loaded, n => n.props?.children === 'cloud_mode_private')[0].onClick();
  const draft = render();
  assert.equal(elements(draft, n => n.props?.type === 'password')[0].value, '');
  assert.deepEqual(writes, []);
  elements(draft, n => n.props?.children === 'cloud_save')[0].onClick();
  assert.deepEqual(writes, [{ url: '/cloud/config', body: { mode: 'private', private: { url: 'https://test.invalid', secret: '', deviceName: '' } } }]);
}
for (const [mode, logged] of [['none', false], ['private', true], ['shared', false], ['shared', true]]) {
  const mount = mountHooks();
  const api = { get: async path => path === '/account' ? { ok: true, mode, logged_in: logged } : { ok: true }, post() { throw new Error('打开账号页不能发起写入'); } };
  const tab = require('../packages/shell/client/system-tabs.cjs')(mount.react, fakeJsx, () => api).AccountTab;
  let jumped = false;
  const render = () => mount.render(() => tab({ t: deps.t, openConfig() { jumped = true; } }));
  render(); await Promise.resolve(); const page = render();
  assert.equal(elements(page, n => n.type === CloudSettings).length, 0);
  elements(page, n => n.props?.children === 'cloud_open_config')[0].onClick(); assert.ok(jumped);
  for (const [name, visible] of [['login', mode === 'shared' && !logged], ['sync_now', logged], ['logout', mode === 'shared' && logged]])
    assert.equal(elements(page, n => n.type === 'button' && n.props.children === name).length, Number(visible));
}
assert.ok(configHtml.includes("wbh-cfg-schemes"), "配置页应复用共享方案条");
// C. 插件页：路由传进来的是宿主页面的 POST 通道（只有 api.post），必须先经 hostApi 适配。
const addonsPage = require("../packages/shell/client/addons-page.cjs");
assert.equal(typeof HostPages.hostApi, "function", "host-pages 应导出 hostApi 适配器");

const postOnlyApi = { post: async () => ({ ok: true, result: { rows: [{ id: "wb-addon-tasks", title: "任务", version: "5.5.3", installed: "5.5.3", update: { source: "npm", package: "dsh-workbench-tasks" }, managed: true }] } }) };
const adapted = HostPages.hostApi(postOnlyApi);
assert.equal(typeof adapted.call, "function", "hostApi 应把 POST 通道适配出 api.call");
assert.ok(!adapted.post, "hostApi 只暴露 call，避免页面混用两条通道");

// 用真 React 渲染加载态：页面必须在只有 POST 通道的 api 下也能渲染，不能抛 api.call is not a function。
function AddonsPageWrapper() {
  return addonsPage({ jsx: jsxRuntime, React, api: HostPages.hostApi(postOnlyApi), t: (key) => key, lang: "zh", head: (title, desc) => React.createElement("div", { className: "wb-page-head" }, title + "|" + (desc || "")) });
}
const addonsHtml = renderToString(React.createElement(AddonsPageWrapper));
assert.ok(addonsHtml.includes("wb-page-head"), "插件页应带页头");
assert.ok(addonsHtml.includes("wb-addons-bar"), "插件页应渲染统计条（加载态也在）：" + addonsHtml.slice(0, 160));
assert.ok(addonsHtml.includes("wb-addons-stats"), "统计条里要显示已注册插件数");
assert.ok(!addonsHtml.includes("wb-backup-toolbar"), "插件页不应复用备份页的工具栏类名");
// 共享 Btn 只读 props.children（第三个 jsx 参数是 key），漏传会渲染成空按钮——实机踩过一次。
const listHtml = renderToString(React.createElement(AddonsPageWrapper));
assert.ok(!/class="wb-btn[^"]*"><\/button>/.test(listHtml), "插件页不能渲染空按钮：" + listHtml.slice(0, 200));

// 共享 Btn/Notice 必须把子节点放进 props.children：调用方传的 h 可能是 react/jsx-runtime 的 jsx，
// 它的第三个参数是 key，用位置参数传文字会被当成 key 丢掉（宿主插件页的空按钮就是这么来的）。
const wbCommon = require("../packages/addons/lib/client-common.cjs")("wb");
const btnHtml2 = renderToString(jsxRuntime.jsx(wbCommon.Btn, { h: jsxRuntime.jsx, children: "复制命令" }));
assert.ok(btnHtml2.includes("复制命令"), "共享 Btn 在 jsx 运行时下也要渲染文字：" + btnHtml2);
const noticeHtml2 = renderToString(jsxRuntime.jsx(wbCommon.Notice, { h: jsxRuntime.jsx, text: "提示" }));
assert.ok(noticeHtml2.includes("提示"), "共享 Notice 在 jsx 运行时下也要渲染文字：" + noticeHtml2);
const fieldHtml2 = renderToString(jsxRuntime.jsx(wbCommon.Field, { h: jsxRuntime.jsx, label: "名称", children: "内容" }));
assert.ok(fieldHtml2.includes("名称") && fieldHtml2.includes("内容"), "共享 Field 在 jsx 运行时下也要渲染标签与内容：" + fieldHtml2);

console.log("HOST PAGES TEST PASS：页面渲染、插件页、方案条、备份勾选与实际导出参数、云端冲突查询和手工边界");
