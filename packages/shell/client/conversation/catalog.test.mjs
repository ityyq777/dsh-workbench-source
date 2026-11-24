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
const stepNodes = () => tree().filter((node) => hasClass(node, "wbctl-step"));
const jump = async (index) => {
  const target = stepNodes()[index];
  assert.ok(target, "找不到步骤：" + index);
  assert.ok(!target.props.disabled, "步骤不可点：" + index);
  await target.props.onClick();
  await settle();
};
const paneName = (name) => tree().filter((node) => node.props?.name === name);

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

// 编辑自定义角色：走四步向导，逐 step 校验、跨 step 保留草稿
await rows().find((node) => textOf(node).includes("归档员")).props.onClick();
tree();
await click("编辑");
tree();
const wizardSteps = stepNodes();
assert.equal(wizardSteps.length, 4, "向导应有 4 步");
assert.equal(wizardSteps[0].props["aria-current"], "step", "首步为当前步");
assert.equal(wizardSteps[1].props.disabled, true, "未访问的步骤不可跳转");
assert.equal(byName("name").props.value, "归档员");

// 名称清空后「下一步」被拦住，红字点名，且不进入第二步
setField("name", "");
await click("下一步");
tree();
assert.ok(textOf(tree().find((node) => hasClass(node, "wbr-field-error"))).includes("名称"));
assert.equal(paneName("instructions").length, 0, "校验未过时不该渲染第二步");
setField("name", "归档员");
await click("下一步");
tree();
assert.equal(byName("instructions").props.value, "- 只做归档");

// 第二步：编辑/预览切换，预览按 markdown 渲染
await click("预览");
tree();
const preview = tree().find((node) => hasClass(node, "wbr-preview"));
assert.ok(textOf(preview).includes("只做归档"));
assert.ok(!textOf(preview).includes("- 只做归档"), "预览不应出现字面列表符号");
await click("编辑");

// 指令清空同样拦住
setField("instructions", "");
await click("下一步");
tree();
assert.equal(paneName("actionSearch").length, 0, "指令为空时不该进入动作步");
setField("instructions", "- 只做归档");
await click("下一步");
tree();

// 第三步：手动补一个不存在的动作名 → 红字点名且拦住继续
setField("manual", "tasks.nope");
tree();
const unknown = tree().find((node) => hasClass(node, "wbr-unknown"));
assert.ok(textOf(unknown).includes("tasks.nope"), "不存在的动作名要红字点名");
await click("下一步");
tree();
assert.equal(paneName("manual").length, 1, "还有坏动作名时应留在动作步");

// 回跳到第一步改简介，再跳回来：草稿要跨 step 保留
await jump(0);
tree();
setField("description", "整理与归档");
await jump(2);
tree();
assert.equal(byName("manual").props.value, "tasks.nope", "回跳不应丢草稿");
await jump(0);
tree();
assert.equal(byName("description").props.value, "整理与归档", "第一步的改动要保留");
await jump(2);
tree();

// 改成真实动作名后继续到确认步，摘要给出动作数与指令长度
setField("manual", "wb.eventList, wb.eventList");
tree();
await click("下一步");
tree();
const summary = tree().find((node) => hasClass(node, "wbr-summary"));
assert.ok(textOf(summary).includes("已选 2 项"), "摘要应给出最终动作数");
assert.ok(textOf(summary).includes("6 字"), "摘要应给出指令长度");

// 确认步保存：动作集去重且与勾选合并，简介一并提交
assert.equal(buttons("保存")[0].props.disabled, false);
await click("保存");
const saved = ops.at(-1);
assert.equal(saved.op, "update");
assert.equal(saved.id, "user:1");
assert.equal(saved.description, "整理与归档");
assert.deepEqual([...saved.actions].sort(), ["tasks.list", "wb.eventList"]);

// 重新打开向导：动作目录可按关键字过滤
await click("编辑");
tree();
await click("下一步");
tree();
await click("下一步");
tree();
setField("actionSearch", "事件");
tree();
const checks = tree().filter((node) => String(node.props?.name || "").startsWith("action:"));
assert.deepEqual(checks.map((node) => node.props.name), ["action:wb.eventList"]);

// 「全选 / 清空本域」一次改动整组
await click("清空本域");
tree();
const eventCheck = tree().find((node) => node.props?.name === "action:wb.eventList");
assert.equal(eventCheck.props.checked, false, "清空本域后该域动作全部取消勾选");

// 删除确认与目录联动
await click("取消");
tree();
await click("删除");
tree();
await click("确认删除");
assert.deepEqual(ops.at(-1), { op: "delete", id: "user:1" });
assert.equal(typeof events["role-catalog"], "function");
console.log("角色管理页通过：分组、筛选、markdown 渲染、分步校验与保存");
