// 「工作区」页回归：
// 1) 页签顺序（时间线 → 工作区 → 配置）与 package.json 的 views 清单一致；
// 2) 工作区页只用本插件 taskWorkspaces.* 取数，加载/错误/空/正常四态、新建/编辑/删除与重试可用；
// 3) 点任务数能带着 workspaceIds 跳到记录页，筛选模型认这个导航参数。
// 运行：node scripts/test-tasks-workspace-view.mjs
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createContext, runInContext } from "node:vm";
import { createReact } from "./data-ui-harness.mjs";

const require = createRequire(import.meta.url);
const { readFileSync } = require("node:fs");
const { dirname, resolve } = require("node:path");
const { fileURLToPath } = require("node:url");

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const VIEW_SRC = resolve(ROOT, "packages/addons/tasks/client/views/workspace-view.cjs");
const CLIENT_SRC = resolve(ROOT, "packages/addons/tasks/client/client.src.cjs");
const PKG = JSON.parse(readFileSync(resolve(ROOT, "packages/addons/tasks/package.json"), "utf8"));

const filters = require("../packages/addons/tasks/client/views/task-filter-model.cjs");

// ── 1. 页签顺序与清单 ──
const clientSource = readFileSync(CLIENT_SRC, "utf8");
const timelineAt = clientSource.indexOf('id: "timeline"');
const workspaceAt = clientSource.indexOf('id: "workspace"');
const configAt = clientSource.indexOf('id: "config"');
assert.ok(timelineAt > 0 && workspaceAt > timelineAt && configAt > workspaceAt, "「工作区」页签应位于「时间线」之后、「配置」之前");
assert.ok(clientSource.includes('icon: tabIcon("folder")'), "工作区页签应复用 folder 图标");
assert.match(clientSource, /require\("\.\/views\/workspace-view\.cjs"\)/, "客户端应加载工作区视图");
assert.ok(!clientSource.includes("api.schema("), "页面不得走宿主统一 schema 接口");
const viewSource = readFileSync(VIEW_SRC, "utf8");
for (const name of ["taskWorkspaces.list", "taskWorkspaces.create", "taskWorkspaces.update", "taskWorkspaces.delete"]) {
  assert.ok(viewSource.includes('"' + name + '"'), "视图应自己调用 " + name);
}
assert.deepEqual(
  PKG.wb.addon.views,
  ["stats", "tasks", "timeline", "workspace", "config", "data", "commands", "actions"],
  "package.json 的 wb.addon.views 必须与实际页签一致",
);

// ── 2. 筛选模型支持工作区导航 ──
const nav = filters.navigation({ workspaceIds: ["w1", "w2"] });
assert.ok(nav, "workspaceIds 导航应被识别");
assert.deepEqual(nav.workspaceIds, ["w1", "w2"]);
assert.equal(nav.noWorkspace, false);
assert.deepEqual(filters.args(nav).workspaceIds, ["w1", "w2"]);
const noWs = filters.navigation({ noWorkspace: true });
assert.ok(noWs && noWs.noWorkspace === true, "noWorkspace 导航应被识别");
assert.equal(filters.args(noWs).noWorkspace, true);
assert.equal(filters.navigation({}), null, "空参数不是导航");
assert.equal(filters.navigation({ workspaceIds: [] }), null, "空数组不是导航");
assert.equal(filters.all(filters.empty()), true, "空筛选仍是全部");

// ── 3. 页面四态与增删改 ──
function loadView(React) {
  const sandbox = createContext({
    console, Promise, Set, Map, JSON, Object, Array, String, Number, Error, RegExp, Date,
    // toast 的自动消失用定时器；测试里不触发，便于断言反馈文案。
    setTimeout: () => 0,
    clearTimeout: () => {},
  });
  const mod = { exports: {} };
  runInContext("(function (module, exports, require) {" + viewSource + "\n})", sandbox)(
    mod, mod.exports, () => { throw new Error("view should not require anything"); },
  );
  return mod.exports({ React }).WorkspaceView;
}

const kids = (node) => {
  const c = node ? (node.children !== undefined ? node.children : node.props && node.props.children) : null;
  return c == null ? [] : Array.isArray(c) ? c.flat(Infinity).filter((x) => x != null) : [c];
};
const walk = (n) => (n && typeof n === "object" ? [n, ...kids(n).flatMap(walk)] : []);
const text = (n) => {
  if (n == null || typeof n === "boolean") return "";
  if (typeof n === "string" || typeof n === "number") return String(n);
  return kids(n).map(text).join(" ");
};
const find = (tree, fn) => walk(tree).find(fn);
const button = (tree, label) => find(tree, (n) => n.type === "button" && text(n).includes(label));
const input = (tree, label) => find(tree, (n) => (n.type === "input" || n.type === "textarea") && n.props && n.props["aria-label"] === label);

async function settle(rt) {
  for (let i = 0; i < 8; i++) {
    await Promise.resolve();
    rt.rerender();
  }
  return rt.tree;
}

const FIXTURE = {
  id: "w1",
  title: "dsh-workbench 插件开发",
  name: "workbench",
  dir: "/Users/yyq/code/dsh-workbench",
  description: "本仓库的会话目录",
  taskCount: 3,
};

function makeApi(overrides = {}) {
  const calls = [];
  let handlers = {
    "taskWorkspaces.list": () => ({ records: [FIXTURE], total: 1, returned: 1 }),
    "taskWorkspaces.create": () => ({ workspace: { id: "w2", title: "新工作区" }, taskCount: 0 }),
    "taskWorkspaces.update": () => ({ workspace: FIXTURE }),
    "taskWorkspaces.delete": () => ({ id: "w1", affectedLinks: 3, affectedTasks: 3 }),
    ...overrides,
  };
  return {
    calls,
    setHandler(name, fn) { handlers[name] = fn; },
    subscribe() { return () => {}; },
    call(name, args) {
      calls.push([name, args]);
      const handler = handlers[name];
      if (!handler) return Promise.reject(new Error("no such action: " + name));
      try {
        return Promise.resolve({ ok: true, result: handler(args) });
      } catch (e) {
        return Promise.reject(e);
      }
    },
  };
}

async function mount(api, extra = {}) {
  const rt = createReact();
  const View = loadView(rt.React);
  rt.mount(View, { api, lang: "zh", ...extra });
  return rt;
}

// 加载态 → 正常态：标题、目录、描述、任务数。
{
  let ready;
  const api = makeApi();
  const pending = new Promise((r) => { ready = r; });
  api.call = (name, args) => { api.calls.push([name, args]); return pending.then(() => ({ ok: true, result: { records: [FIXTURE] } })); };
  const rt = await mount(api);
  assert.ok(text(rt.tree).includes("正在读取工作区"), "首屏应是加载态");
  ready();
  const tree = await settle(rt);
  const body = text(tree);
  assert.equal(api.calls[0][0], "taskWorkspaces.list", "首屏应读工作区列表");
  assert.ok(body.includes("dsh-workbench 插件开发"), "应显示标题");
  assert.ok(body.includes("/Users/yyq/code/dsh-workbench"), "应显示目录");
  assert.ok(body.includes("本仓库的会话目录"), "应显示描述");
  assert.ok(body.includes("3 个任务"), "应显示任务数");
  assert.ok(body.includes("共 1 个"), "应显示总数");
}

// 空态。
{
  const api = makeApi({ "taskWorkspaces.list": () => ({ records: [] }) });
  const rt = await mount(api);
  assert.ok(text(await settle(rt)).includes("还没有工作区"), "空列表应显示空态");
}

// 错误态 + 重试。
{
  let fail = true;
  const api = makeApi();
  api.setHandler("taskWorkspaces.list", () => { if (fail) throw new Error("db locked"); return { records: [FIXTURE] }; });
  const rt = await mount(api);
  let tree = await settle(rt);
  assert.ok(text(tree).includes("工作区加载失败"), "错误态应标明失败");
  assert.ok(text(tree).includes("db locked"), "错误态应带原因");
  fail = false;
  button(tree, "重试").props.onClick();
  tree = await settle(rt);
  assert.ok(text(tree).includes("dsh-workbench 插件开发"), "重试成功后应显示列表");
}

// 点任务数跳到记录页，带 workspaceIds。
{
  const seen = [];
  const api = makeApi();
  const rt = await mount(api, { onNavigate: (...args) => seen.push(args) });
  const tree = await settle(rt);
  const countButton = find(tree, (n) => n.type === "button" && text(n).trim() === "3 个任务");
  assert.ok(countButton, "任务数应是可点按钮");
  countButton.props.onClick();
  assert.deepEqual(JSON.parse(JSON.stringify(seen)), [["tasks", { workspaceIds: ["w1"] }]], "点任务数应带上工作区筛选跳记录页");
}

// 新建：打开表单 → 校验标题 → 保存 → 重新拉列表。
{
  const api = makeApi();
  const rt = await mount(api);
  let tree = await settle(rt);
  button(tree, "新建工作区").props.onClick();
  tree = await settle(rt);
  assert.ok(input(tree, "标题 *"), "应打开新建表单");
  button(tree, "保存").props.onClick();
  tree = await settle(rt);
  assert.ok(text(tree).includes("标题不能为空"), "空标题应拦截");
  input(tree, "标题 *").props.onChange({ target: { value: " 新工作区 " } });
  input(tree, "目录（本机绝对路径，可空）").props.onChange({ target: { value: "relative/dir" } });
  tree = await settle(rt);
  button(tree, "保存").props.onClick();
  tree = await settle(rt);
  assert.ok(text(tree).includes("目录必须是本机绝对路径"), "相对目录应拦截：" + text(tree));
  input(tree, "目录（本机绝对路径，可空）").props.onChange({ target: { value: "/tmp/ws" } });
  input(tree, "描述（可空）").props.onChange({ target: { value: "说明" } });
  tree = await settle(rt);
  button(tree, "保存").props.onClick();
  tree = await settle(rt);
  const createCall = api.calls.find(([name]) => name === "taskWorkspaces.create");
  assert.ok(createCall, "应调用 taskWorkspaces.create");
  assert.deepEqual(JSON.parse(JSON.stringify(createCall[1])), { title: "新工作区", name: "", dir: "/tmp/ws", description: "说明" });
  assert.ok(text(tree).includes("已创建工作区"), "成功后应有反馈");
  assert.ok(text(tree).includes("dsh-workbench 插件开发"), "应重新拉取列表");
}

// 编辑：表单带原值，保存走 update 并带 id。
{
  const api = makeApi();
  const rt = await mount(api);
  let tree = await settle(rt);
  button(tree, "编辑").props.onClick();
  tree = await settle(rt);
  const titleInput = input(tree, "标题 *");
  assert.equal(titleInput.props.value, FIXTURE.title, "编辑表单应预填标题");
  assert.equal(input(tree, "目录（本机绝对路径，可空）").props.value, FIXTURE.dir, "编辑表单应预填目录");
  input(tree, "标题 *").props.onChange({ target: { value: "改名后的工作区" } });
  tree = await settle(rt);
  button(tree, "保存").props.onClick();
  tree = await settle(rt);
  const updateCall = api.calls.find(([name]) => name === "taskWorkspaces.update");
  assert.ok(updateCall, "应调用 taskWorkspaces.update");
  assert.equal(updateCall[1].id, "w1");
  assert.equal(updateCall[1].title, "改名后的工作区");
  assert.equal(updateCall[1].dir, FIXTURE.dir);
  assert.ok(text(tree).includes("已更新工作区"), "更新后应有反馈");
}

// 删除：先说明影响的任务数，确认后按 id 删除并刷新。
{
  const api = makeApi();
  const rt = await mount(api);
  let tree = await settle(rt);
  button(tree, "删除").props.onClick();
  tree = await settle(rt);
  const ask = text(tree);
  assert.ok(ask.includes("关联了 3 个任务"), "删除确认应说明会影响的任务数：" + ask);
  assert.ok(ask.includes("任务本身不会被删除"), "删除确认应说明任务不会被删");
  assert.equal(api.calls.some(([name]) => name === "taskWorkspaces.delete"), false, "未确认前不应删除");
  button(tree, "取消").props.onClick();
  tree = await settle(rt);
  assert.equal(api.calls.some(([name]) => name === "taskWorkspaces.delete"), false, "取消后不应删除");
  button(tree, "删除").props.onClick();
  tree = await settle(rt);
  button(tree, "确认删除").props.onClick();
  tree = await settle(rt);
  const delCall = api.calls.find(([name]) => name === "taskWorkspaces.delete");
  assert.deepEqual(JSON.parse(JSON.stringify(delCall[1])), { id: "w1" });
  assert.ok(text(tree).includes("已删除工作区"), "删除后应有反馈");
  assert.ok(api.calls.filter(([name, args]) => name === "taskWorkspaces.list" && args.pageSize === 100).length >= 2, "删除后应重新拉列表");
}

// 订阅事件后自动刷新（改名/删除/任务挂接都会发事件）。
{
  let off = null;
  const listeners = [];
  const api = makeApi();
  api.subscribe = (fn) => { listeners.push(fn); off = fn; return () => { off = null; }; };
  const rt = await mount(api);
  await settle(rt);
  const before = api.calls.length;
  assert.equal(typeof off, "function", "应订阅宿主事件");
  off({ event: "task-workspaces-changed" });
  await settle(rt);
  assert.ok(api.calls.length > before, "工作区变化应触发重新拉取");
}

// 英文界面取 en 文案。
{
  const api = makeApi();
  const rt = createReact();
  const View = loadView(rt.React);
  rt.mount(View, { api, lang: "en" });
  const body = text(await settle(rt));
  assert.ok(body.includes("Workspaces") && body.includes("New workspace"), body.slice(0, 120));
  assert.ok(body.includes("3 tasks"), "英文界面应显示任务数");
}

console.log("TASKS WORKSPACE VIEW PASS: tab order, filter navigation, list/create/edit/delete, 4 states");
