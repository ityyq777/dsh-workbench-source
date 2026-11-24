// 角色管理页交互回归：分组、筛选、来源标、动作名校验与保存。
import assert from "node:assert/strict";
import Module, { createRequire } from "node:module";
import { React, createRenderer, all, textOf, klass } from "../../../../scripts/helpers/test-react.mjs";

const load = Module._load;
Module._load = function (name, ...args) { return name === "react" ? React : load.call(this, name, ...args); };
const View = createRequire(import.meta.url)("./catalog.cjs");
Module._load = load;

const events = {};
globalThis.EventSource = class { addEventListener(key, fn) { events[key] = fn; } };

const pluginRole = {
  id: "tasks/publisher", source: "plugin", domain: "wb-addon-tasks", version: "1.1.0",
  name: "发布者", description: "整理需求的角色",
  instructions: "## 职责\n\n- 先澄清目标\n- 再拆任务\n\n`tasks.create` 只建任务",
  actions: ["tasks.create", "tasks.list", "taskNodes.overview"],
};
const userRole = {
  id: "user:1", source: "user", domain: "user", version: "v1",
  name: "归档员", description: "整理条目", instructions: "- 只做归档", actions: ["tasks.list"],
};
let roles = [pluginRole, userRole];
const ops = [];
const actions = [
  { name: "tasks.create", domain: "wb-addon-tasks", description: "新建任务", origins: ["agent", "ui"] },
  { name: "tasks.list", domain: "wb-addon-tasks", description: "列出任务", origins: ["agent", "ui"] },
  { name: "taskNodes.overview", domain: "wb-addon-tasks", description: "节点概览", origins: ["agent"] },
  { name: "wb.eventList", domain: "wb-shell", description: "事件列表", origins: ["agent"] },
];
const api = {
  get: async (path) => { assert.equal(path, "/role-catalog"); return { ok: true, roles }; },
  post: async (path, args) => {
    if (path === "/domains/wb-shell/actions/actions.list") {
      assert.deepEqual(args, { detail: true });
      return { ok: true, result: { actions } };
    }
    assert.equal(path, "/role-catalog");
    ops.push(args);
    const source = roles.find((role) => role.id === args.id);
    if (args.op === "create" || args.op === "copy") roles = [...roles, { ...(source || args), id: "user:" + ops.length, source: "user", domain: "user" }];
    if (args.op === "update") roles = roles.map((role) => (role === source ? { ...role, ...args } : role));
    if (args.op === "delete") roles = roles.filter((role) => role !== source);
    return { ok: true, roles };
  },
};

const paint = createRenderer();
const props = { api, lang: "zh", head: () => null };
const tree = () => all(paint(View, props));
const settle = async () => { for (let i = 0; i < 3; i += 1) await new Promise((resolve) => setImmediate(resolve)); };
const byName = (name) => tree().find((node) => node.props?.name === name);
const setField = (name, value) => byName(name).props.onChange({ target: { value } });
const buttons = (label) => tree().filter((node) => node.type === "button" && textOf(node) === label);
const click = async (label, index = 0) => {
  const target = buttons(label)[index];
  assert.ok(target, "找不到按钮：" + label);
  assert.ok(!target.props.disabled, "按钮被禁用：" + label);
  await target.props.onClick();
  await settle();
};
const hasClass = (node, name) => klass(node).split(/\s+/).includes(name);
const rows = () => tree().filter((node) => hasClass(node, "wbr-row"));

await settle();
tree();
await settle();
assert.equal(rows().length, 2);
assert.equal(buttons("编辑").length, 0, "未选中角色时不出现编辑按钮");

// 关键字与来源筛选
setField("search", "发布");
tree();
assert.equal(rows().length, 1);
setField("search", "");
setField("source", "user");
tree();
assert.equal(rows().length, 1);
assert.ok(textOf(rows()[0]).includes("归档员"));
setField("source", "");
tree();
assert.equal(rows().length, 2);

// 选中插件角色：指令按 markdown 渲染，动作按域分组
await rows()[0].props.onClick();
tree();
const detail = tree().find((node) => hasClass(node, "wbr-detail"));
const detailText = textOf(detail);
assert.ok(!detailText.includes("## 职责"), "指令不应再出现字面 ##");
assert.ok(detailText.includes("职责") && detailText.includes("先澄清目标"));
assert.ok(detailText.includes("tasks · 2") && detailText.includes("taskNodes · 1"), "动作应按域分组并带数量");
assert.equal(buttons("编辑").length, 0, "插件角色只读");

// 复制插件角色
await click("复制为新角色");
assert.deepEqual(ops.at(-1), { op: "copy", id: "tasks/publisher" });

// 编辑自定义角色：预览、动作勾选与手动补充校验
await rows().find((node) => textOf(node).includes("归档员")).props.onClick();
tree();
await click("编辑");
tree();
assert.equal(byName("name").props.value, "归档员");
assert.equal(buttons("保存")[0].props.disabled, false, "合法动作应可保存");

// 编辑器默认编辑态；切到预览后按 markdown 渲染
await click("预览");
tree();
const preview = tree().find((node) => hasClass(node, "wbr-preview"));
assert.ok(textOf(preview).includes("只做归档"));
assert.ok(!textOf(preview).includes("- 只做归档"), "预览不应出现字面列表符号");
await click("编辑");

// 手动补一个不存在的动作名 → 红字点名且阻止提交
setField("manual", "tasks.nope");
tree();
const unknown = tree().find((node) => hasClass(node, "wbr-unknown"));
assert.ok(textOf(unknown).includes("tasks.nope"), "不存在的动作名要红字点名");
assert.equal(buttons("保存")[0].props.disabled, true, "不存在的动作名必须阻止提交");

// 改成真实动作名后保存成功，提交的动作集去重且与勾选合并
setField("manual", "wb.eventList, wb.eventList");
tree();
assert.equal(buttons("保存")[0].props.disabled, false);
await click("保存");
const saved = ops.at(-1);
assert.equal(saved.op, "update");
assert.equal(saved.id, "user:1");
assert.deepEqual([...saved.actions].sort(), ["tasks.list", "wb.eventList"]);

// 动作目录可按关键字过滤
await click("编辑");
tree();
setField("actionSearch", "事件");
tree();
const checks = tree().filter((node) => String(node.props?.name || "").startsWith("action:"));
assert.deepEqual(checks.map((node) => node.props.name), ["action:wb.eventList"]);

// 删除确认与目录联动
await click("取消");
tree();
await click("删除");
tree();
await click("确认删除");
assert.deepEqual(ops.at(-1), { op: "delete", id: "user:1" });
assert.equal(typeof events["role-catalog"], "function");
console.log("角色管理页通过：分组、筛选、markdown 渲染、动作校验与保存");
