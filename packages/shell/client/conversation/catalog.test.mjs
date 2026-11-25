// 角色管理页交互回归：筛选、来源标、markdown 详情、三步向导与保存。
// 重点回归一件事：界面不再出现「参考动作」——角色对动作的期望只写在指令里。
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
const api = {
  get: async (path) => { assert.equal(path, "/role-catalog"); return { ok: true, roles }; },
  post: async (path, args) => {
    assert.equal(path, "/role-catalog", "除角色目录外不应再请求别的接口（尤其动作目录）");
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
const rows = () => tree().filter((node) => hasClass(node, "wbr-item"));
const stepNodes = () => tree().filter((node) => hasClass(node, "wbctl-step"));
const jump = async (index) => {
  const target = stepNodes()[index];
  assert.ok(target, "找不到步骤：" + index);
  assert.ok(!target.props.disabled, "步骤不可点：" + index);
  await target.props.onClick();
  await settle();
};
const paneName = (name) => tree().filter((node) => node.props?.name === name);
const bodyText = () => textOf(tree().find((node) => hasClass(node, "wbr-split")) || { props: { children: [] } });

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

// 选中插件角色：指令按 markdown 渲染，且详情里不再列动作
await rows()[0].props.onClick();
tree();
const detail = tree().find((node) => hasClass(node, "wbr-detail"));
const detailText = textOf(detail);
assert.ok(!detailText.includes("## 职责"), "指令不应再出现字面 ##");
assert.ok(detailText.includes("职责") && detailText.includes("先澄清目标"));
assert.ok(!tree().some((node) => hasClass(node, "wbr-detail-actions")), "详情不再列动作清单");
assert.equal(buttons("编辑").length, 0, "插件角色只读");
assert.ok(!textOf(tree()[0]).includes("参考动作"), "页面不出现「参考动作」");

// 复制插件角色
await click("复制为新角色");
assert.deepEqual(ops.at(-1), { op: "copy", id: "tasks/publisher" });

// 编辑自定义角色：两步向导，逐 step 校验、跨 step 保留草稿
await rows().find((node) => textOf(node).includes("归档员")).props.onClick();
tree();
await click("编辑");
tree();
const wizardSteps = stepNodes();
assert.equal(wizardSteps.length, 2, "向导只有两步（基本信息 / 角色指令），不再有确认步");
assert.equal(wizardSteps[0].props["aria-current"], "step", "首步为当前步");
assert.equal(wizardSteps[1].props.disabled, true, "未访问的步骤不可跳转");
assert.equal(byName("name").props.value, "归档员");

// 名称清空后「下一步」被拦住，红字点名，且不进入第二步
setField("name", "");
await click("下一步");
tree();
assert.ok(textOf(tree().find((node) => hasClass(node, "wbr-field-error"))).includes("名称"));
assert.equal(paneName("instructions").length, 0, "校验未过时不该渲染下一步");
setField("name", "归档员");
await click("下一步");
tree();
assert.equal(byName("instructions").props.value, "- 只做归档");

// 第二步：编辑/预览切换，预览按 markdown 渲染；提醒动作的提示语在
await click("预览");
tree();
const preview = tree().find((node) => hasClass(node, "wbr-preview"));
assert.ok(textOf(preview).includes("只做归档"));
assert.ok(!textOf(preview).includes("- 只做归档"), "预览不应出现字面列表符号");
assert.match(textOf(tree().find((node) => hasClass(node, "wbr-instructions-hint"))), /提示不是白名单/);
await click("编辑");

// 指令清空同样拦住：最后一步的保存键被换成「下一步」，校验不过就不放行
setField("instructions", "");
await click("保存");
tree();
assert.equal(buttons("保存").length, 1, "保存键始终在最后一步");
assert.ok(textOf(tree().find((node) => hasClass(node, "wbr-field-error"))).includes("指令"));
assert.equal(ops.length, 1, "校验未过时不该发请求");
setField("instructions", "- 只做归档");

// 回跳到第一步改简介，再跳到第二步：草稿要跨 step 保留
await jump(0);
tree();
setField("description", "整理与归档");
await jump(1);
tree();
assert.equal(byName("description") === undefined, true, "第二步不渲染第一步字段");
assert.ok(!tree().some((node) => hasClass(node, "wbr-summary")), "不再有确认摘要");
assert.ok(!tree().some((node) => String(node.props?.name || "").startsWith("action:")), "不再渲染动作勾选");

// 最后一步直接保存：只提交名称/简介/指令，原有 actions 原样带回
assert.equal(buttons("保存")[0].props.disabled, false);
await click("保存");
const saved = ops.at(-1);
assert.equal(saved.op, "update");
assert.equal(saved.id, "user:1");
assert.equal(saved.description, "整理与归档");
assert.deepEqual(saved.actions, ["tasks.list"], "界面不再编辑 actions，旧值原样保留");

// 新建角色：默认两步、无动作步
await click("新建角色");
tree();
assert.equal(stepNodes().length, 2);
setField("name", "巡检员");
await click("下一步");
tree();
setField("instructions", "- 提醒使用 tasks.list 查看任务");
await click("保存");
const created = ops.at(-1);
assert.equal(created.op, "create");
assert.equal(created.name, "巡检员");
assert.deepEqual(created.actions, [], "新建角色不带任何动作");

// 删除确认与目录联动
await rows().find((node) => textOf(node).includes("归档员")).props.onClick();
tree();
await click("删除");
tree();
await click("确认删除");
assert.deepEqual(ops.at(-1), { op: "delete", id: "user:1" });
assert.equal(typeof events["role-catalog"], "function");
console.log("角色管理页通过：筛选、markdown 详情、两步向导、无参考动作与确认步、保存");
