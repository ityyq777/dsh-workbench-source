// 校验任务/标签/站点三个业务插件每个标签页都注册了标题左侧图标：
// 直接加载各自 lib/client.js，用最小宿主桥拿到 views[]，再逐个渲染 icon 组件。
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createContext, runInContext } from "node:vm";
import { fileURLToPath } from "node:url";
import { createReact } from "./data-ui-harness.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ADDONS = [
  { dir: "packages/addons/tasks", version: "tasks" },
  { dir: "packages/addons/tags", version: "tags" },
  { dir: "packages/addons/sites", version: "sites" },
];
const EXPECTED = { stats: "chart", config: "settings", data: "database" };

function loadAddon(dir) {
  const { React } = createReact();
  const iconCalls = [];
  const sandbox = createContext({
    console,
    document: { getElementById: () => true, createElement: () => ({ appendChild() {}, style: {} }), head: { appendChild() {} } },
  });
  sandbox.window = sandbox;
  sandbox.__WB_HOST__ = undefined;
  const host = sandbox.__WB_HOST__ = { addons: [], registerAddon: (addon) => { sandbox.__REGISTERED__ = addon; } };
  void host;
  const requireStub = (name) => {
    if (name === "react") return React;
    if (name === "react/jsx-runtime") return { jsx: (type, props) => React.createElement(type, props) };
    if (name.startsWith("lucide-react/icons/")) {
      const Stub = (props) => { iconCalls.push(props); return React.createElement("svg", props); };
      Stub.displayName = name.slice("lucide-react/icons/".length);
      return { default: Stub };
    }
    if (name.startsWith("./")) {
      // 视图组件不在本测试的关注范围内，给出可渲染的空组件占位。
      return new Proxy({}, { get: (target, key) => (key === "__esModule" ? true : () => null) });
    }
    throw new Error("Unexpected runtime dependency: " + name);
  };
  runInContext(readFileSync(resolve(root, dir, "lib/client.js"), "utf8"), sandbox);
  const mod = sandbox.__ModuleLoader__.modules["dsh-workbench-" + dir.split("/").pop()];
  assert.ok(mod, dir + " 的 lib/client.js 未注册到模块加载器");
  const factory = mod(requireStub);
  return { addon: sandbox.__REGISTERED__, addonModule: factory };
}

for (const item of ADDONS) {
  const name = item.dir.split("/").pop();
  const { addon } = loadAddon(item.dir);
  assert.ok(addon, name + " 未注册视图");
  for (const view of addon.views) {
    assert.equal(typeof view.icon, "function", name + " 的「" + view.id + "」标签页缺少 icon 组件");
    const node = view.icon({ size: 14 });
    assert.ok(node && typeof node === "object", name + " 的「" + view.id + "」icon 组件没有返回元素");
    assert.equal(node.props.size, 14, name + " 的「" + view.id + "」图标尺寸应为 14");
    assert.equal(typeof node.props.name, "string", name + " 的「" + view.id + "」图标没有给出图标名");
    if (EXPECTED[view.id]) assert.equal(node.props.name, EXPECTED[view.id], name + " 的「" + view.id + "」图标语义应统一");
  }
  if (addon.views.some((v) => v.id === "timeline")) {
    const timeline = addon.views.find((v) => v.id === "timeline").icon({});
    const records = addon.views.find((v) => v.id === "tasks").icon({});
    assert.notEqual(timeline.props.name, records.props.name, "任务时间线应使用独立图标");
  }
}
console.log("ADDON TAB ICONS PASS: tasks/tags/sites 每个标签页都有 14px 左侧图标，统计/配置/数据语义统一");
