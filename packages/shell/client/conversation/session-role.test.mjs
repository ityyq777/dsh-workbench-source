// 输入区角色选择弹层：关键词过滤、按动作名检索、置顶出口、空态与键盘行为。
import assert from "node:assert/strict";
import test from "node:test";
import Module, { createRequire } from "node:module";
import { React, createRenderer, all, textOf, klass } from "../../../../scripts/helpers/test-react.mjs";

// 弹层是 createPortal 到 body 的浮层；测试里把 portal 拉平，直接断言树结构。
const load = Module._load;
Module._load = function (name, ...args) {
  if (name === "react") return React;
  if (name === "react-dom") return { createPortal: (node) => node };
  return load.call(this, name, ...args);
};
const Picker = createRequire(import.meta.url)("./session-role.cjs");
Module._load = load;

globalThis.document = { body: {}, activeElement: null };

const publisher = {
  id: "tasks/publisher", source: "plugin", domain: "wb-addon-tasks", version: "1.1.0",
  name: "任务发布者", description: "整理需求并发布任务", instructions: "",
  actions: ["tasks.create", "tasks.update", "tasks.list"],
};
const archivist = {
  id: "user:1", source: "user", domain: "user", version: "v1",
  name: "归档员", description: "整理条目", instructions: "",
  actions: ["tasks.list", "tasks.complete"],
};
const dict = {
  role_title: "工作台角色", role_none: "不使用工作台角色", role_none_desc: "沿用当前 DSH 会话设置",
  role_missing: "角色已不可用，请重新选择", role_next: "选择将从下一轮对话生效。", role_close: "关闭",
  role_retry: "重试", role_error: "无法读取或保存会话设置", role_loading: "读取中…",
  role_search: "搜索角色", role_search_clear: "清空搜索", role_search_empty: "没有匹配的角色",
  role_search_count: "匹配 {shown} / 共 {total} 个角色",
};
const t = (key) => dict[key] || key;

let roles = [publisher, archivist];
let saved = [];
let roleId = null;

globalThis.fetch = async (url, options) => {
  if (options && options.method === "POST") {
    const body = JSON.parse(options.body);
    saved.push(body);
    roleId = body.roleId;
    return { ok: true, json: async () => ({ ok: true, sessionId: body.sessionId, roleId: body.roleId, roles, unavailable: false }) };
  }
  assert.match(String(url), /^\/workbench\/api\/session-role\?sessionId=/);
  return { ok: true, json: async () => ({ ok: true, sessionId: "s1", roleId, roles, unavailable: false }) };
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const buttons = (tree) => all(tree).filter((n) => n.type === "button");
const byText = (tree, label) => buttons(tree).find((n) => textOf(n).includes(label));
const search = (tree) => all(tree).find((n) => n.type === "input" && n.props.type === "search");
const count = (tree) => all(tree).find((n) => klass(n).split(/\s+/).includes("wb-role-count"));

// 组件用 Fragment 同时挂触发按钮与 portal，测试里包一层容器便于遍历。
const wrap = (tree) => (Array.isArray(tree) ? { type: "div", props: {}, children: tree } : tree);

async function mount() {
  const render = createRenderer();
  const props = { sessionId: "s1", t, ensureStream: () => {} };
  const paint = () => wrap(render(Picker.SessionRole, props));
  paint();
  await flush();
  let tree = paint();
  // 打开弹层：触发按钮在已选中角色时显示角色名，所以按 aria-haspopup 找更稳。
  buttons(tree).find((n) => n.props["aria-haspopup"] === "dialog").props.onClick();
  tree = paint();
  return { paint, tree };
}

test("打开弹层即可输入，命中项与计数跟随关键词，置顶出口不受过滤", async () => {
  const { paint, tree } = await mount();
  assert.ok(search(tree), "弹层里应有搜索输入框");
  assert.equal(textOf(tree).includes("任务发布者"), true);
  const input = search(tree);
  input.props.onChange({ target: { value: "发布" } });
  const filtered = paint();
  assert.equal(textOf(filtered).includes("任务发布者"), true);
  assert.equal(textOf(filtered).includes("归档员"), false, "不命中的角色应被过滤掉");
  assert.equal(textOf(filtered).includes("不使用工作台角色"), true, "取消选择的出口必须始终可见");
  assert.equal(textOf(count(filtered)), "匹配 1 / 共 2 个角色");
});

test("多关键词按 AND 生效，大小写不敏感，未命中给空态与清空按钮", async () => {
  const { paint } = await mount();
  search(paint()).props.onChange({ target: { value: "任务 发布" } });
  let tree = paint();
  assert.equal(textOf(tree).includes("任务发布者"), true);
  assert.equal(textOf(tree).includes("归档员"), false);
  search(tree).props.onChange({ target: { value: "TASKS.UPDATE" } });
  tree = paint();
  assert.equal(textOf(tree).includes("任务发布者"), true, "动作名也应可检索，且大小写不敏感");
  search(tree).props.onChange({ target: { value: "发布 归档" } });
  tree = paint();
  assert.equal(textOf(tree).includes("没有匹配的角色"), true);
  assert.ok(byText(tree, "清空搜索"), "空态应带清空搜索按钮");
  assert.equal(textOf(count(tree)), "匹配 0 / 共 2 个角色");
});

test("可以按动作名倒查角色，命中片段用 mark 高亮", async () => {
  const { paint } = await mount();
  search(paint()).props.onChange({ target: { value: "tasks.update" } });
  const tree = paint();
  assert.equal(textOf(tree).includes("任务发布者"), true);
  assert.equal(textOf(tree).includes("归档员"), false);
  assert.equal(all(tree).filter((n) => n.type === "mark").length, 0, "只命中动作名时界面上没有可高亮的片段");
  search(tree).props.onChange({ target: { value: "发布" } });
  const next = paint();
  const marks = all(next).filter((n) => n.type === "mark");
  assert.ok(marks.length >= 1, "命中片段应有 mark");
  assert.equal(marks.every((n) => klass(n).split(/\s+/).includes("wb-role-mark")), true);
  assert.equal(marks.map(textOf).join("").includes("发布"), true, "名称命中应被高亮");
});

test("Esc 有搜索词时先清空，无搜索词时关闭；关闭即卸载弹层", async () => {
  const { paint } = await mount();
  search(paint()).props.onChange({ target: { value: "发布" } });
  let tree = paint();
  const esc = { key: "Escape", preventDefault() {} };
  search(tree).props.onKeyDown(esc);
  tree = paint();
  assert.ok(search(tree), "有搜索词时 Esc 只清空，弹层仍在");
  assert.equal(search(tree).props.value, "");
  assert.equal(textOf(tree).includes("归档员"), true, "清空后恢复全量");
  search(tree).props.onKeyDown(esc);
  tree = paint();
  assert.equal(search(tree), undefined, "无搜索词时 Esc 关闭弹层");
});

test("Enter 在只剩一条命中时直接选中并保存，被过滤项不在树里", async () => {
  const { paint } = await mount();
  search(paint()).props.onChange({ target: { value: "归档" } });
  const tree = paint();
  assert.equal(textOf(tree).includes("任务发布者"), false, "被过滤掉的项不应渲染，避免焦点落到隐藏项");
  search(tree).props.onKeyDown({ key: "Enter", preventDefault() {} });
  await flush();
  paint();
  assert.equal(saved.length, 1);
  assert.equal(saved[0].roleId, "user:1");
});

test("选中已生效的角色仍是关闭弹层，不发保存请求", async () => {
  roleId = "user:1";
  const { paint } = await mount();
  const tree = paint();
  // 触发按钮也会显示已选角色名，这里按 aria-pressed 区分列表项。
  const option = buttons(tree).find((n) => n.props["aria-pressed"] !== undefined && textOf(n).includes("归档员"));
  assert.equal(option.props["aria-pressed"], true, "当前角色应有选中态");
  const before = saved.length;
  option.props.onClick();
  await flush();
  const after = paint();
  assert.equal(saved.length, before);
  assert.equal(search(after), undefined);
  roleId = null;
});

test("splitHits 合并重叠命中区间，多关键词不重复包裹", () => {
  assert.deepEqual(Picker.splitHits("任务发布者", ["发布"]), [
    { text: "任务", hit: false }, { text: "发布", hit: true }, { text: "者", hit: false },
  ]);
  assert.deepEqual(Picker.splitHits("tasks.update", ["tasks", "update"]), [
    { text: "tasks", hit: true }, { text: ".", hit: false }, { text: "update", hit: true },
  ]);
  assert.deepEqual(Picker.splitHits("abc", []), [{ text: "abc", hit: false }]);
  assert.deepEqual(Picker.tokensOf("  发布   任务 "), ["发布", "任务"]);
});
