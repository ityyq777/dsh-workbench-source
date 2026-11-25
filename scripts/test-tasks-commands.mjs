// 「命令」页 + tasks.commands 回归（5.5.1：/wb-task-publisher 已下架）：
// 1) 目录唯一事实来源为空数组、不再出现已下架命令名（catalog.js 不复制 SOP 正文）；
// 2) command.js 空目录不注册、不探测 commands 服务、不抛错（注册循环保留给日后命令）；
// 3) 客户端页面只用本插件 action tasks.commands 取数，加载/错误/空/正常四态与重试可用。
// 运行：node scripts/test-tasks-commands.mjs（构建后连 lib/client.js 由 test:clients 覆盖）。
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createContext, runInContext } from "node:vm";
import { createReact } from "./data-ui-harness.mjs";

const require = createRequire(import.meta.url);
const { readFileSync } = require("node:fs");
const { dirname, resolve } = require("node:path");
const { fileURLToPath } = require("node:url");

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const VIEW_SRC = resolve(ROOT, "packages/addons/tasks/client/views/commands.cjs");
const CLIENT_SRC = resolve(ROOT, "packages/addons/tasks/client/client.src.cjs");

const { TASK_COMMANDS, commandCatalog, findCommand, usageText } = await import(
  "file://" + resolve(ROOT, "packages/addons/tasks/lib/publisher/catalog.js")
);
const { registerPublisherCommand } = await import(
  "file://" + resolve(ROOT, "packages/addons/tasks/lib/publisher/command.js")
);

// ── 1. 目录：5.5.1 起为空，页面与 action 仍派生自同一份目录 ──
assert.ok(Array.isArray(TASK_COMMANDS), "命令目录应保持数组形态（可以为空）");
assert.equal(TASK_COMMANDS.length, 0, "5.5.1 起不再提供任何斜杠命令");

// 目录源码（去掉注释，注释里保留「为什么下架」的说明）不能残留已下架的命令名，也不能复制 SOP 正文。
const catalogSource = readFileSync(resolve(ROOT, "packages/addons/tasks/lib/publisher/catalog.js"), "utf8");
const catalogCode = catalogSource.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
assert.equal(catalogCode.includes("wb-task-publisher"), false, "目录里不得再出现已下架的命令名");
assert.equal(catalogCode.includes("## "), false, "命令目录不应复制发布模版正文");

// 投影是纯数据：空目录返回空数组，仍可直接 JSON 序列化。
const catalog = commandCatalog();
assert.deepEqual(catalog, [], "tasks.commands 的 commands 应为空数组");
assert.deepEqual(JSON.parse(JSON.stringify(catalog)), catalog, "tasks.commands 返回值必须可 JSON 序列化");

// 已下架的命令查不到；用法渲染器保留给日后新增命令。
assert.equal(findCommand("wb-task-publisher"), undefined, "已下架的命令不应再被 findCommand 取到");
assert.equal(findCommand("no-such-command"), undefined);

// 投影与用法文案仍对「日后新增的命令」成立：临时塞一条样例，断言后清空。
const SAMPLE_ENTRY = {
  name: "wb-sample",
  title: { zh: "样例命令", en: "Sample command" },
  summary: { zh: "样例用途", en: "Sample purpose" },
  usage: { zh: "/wb-sample <参数>", en: "/wb-sample <arg>" },
  inputHint: { zh: "<参数>", en: "<arg>" },
  attachments: true,
  limit: { field: { zh: "参数", en: "arg" }, max: 100 },
  examples: [{ text: "/wb-sample 示例参数" }],
  notes: { zh: "样例说明", en: "Sample notes" },
  sentText: { zh: "已送出", en: "Sent" },
  buildBrief: () => "A. 调研现状\n## 输出格式\n## 边界规则\n## 会话信息\n{需求描述}<sessionId><生成时间>",
};
TASK_COMMANDS.push(SAMPLE_ENTRY);
const projected = commandCatalog();
TASK_COMMANDS.pop();
assert.equal(projected.length, 1);
assert.deepEqual(JSON.parse(JSON.stringify(projected)), projected, "投影必须可 JSON 序列化");
assert.equal(Object.keys(projected[0]).filter((key) => typeof projected[0][key] === "function").length, 0, "投影不应含函数");
assert.deepEqual(projected[0].examples, ["/wb-sample 示例参数"], "示例应投影成字符串数组");
assert.equal(projected[0].template, SAMPLE_ENTRY.buildBrief(), "模板由 buildBrief 现场渲染");
assert.equal(projected[0].limit.max, 100);

const sampleUsage = usageText(SAMPLE_ENTRY, "zh");
assert.ok(sampleUsage.startsWith("用法：/wb-sample <参数>"), sampleUsage);
assert.ok(sampleUsage.includes("  /wb-sample 示例参数"), "用法应列全示例");
assert.ok(sampleUsage.includes(SAMPLE_ENTRY.notes.zh), "用法应收尾于说明");
assert.ok(!sampleUsage.includes("\n\n\n"), "用法不应出现连续空行");
assert.ok(usageText(SAMPLE_ENTRY, "en").startsWith("Usage: /wb-sample <arg>"));

// ── 2. 注册：空目录不注册、不探测服务、不抛错 ──
function fakeCommands() {
  const registered = [];
  const disposed = [];
  return {
    registered,
    disposed,
    register(def) {
      registered.push(def);
      const id = def.name;
      return () => disposed.push(id);
    },
  };
}

const commands = fakeCommands();
let probes = 0;
const cleanup = registerPublisherCommand({
  workbench: { bindMessageRole: () => () => {} },
  get: (name) => {
    probes++;
    return name === "commands" ? commands : undefined;
  },
});
assert.equal(typeof cleanup, "function", "空目录也要返回可调用的清理函数");
assert.equal(commands.registered.length, 0, "空目录不应注册任何命令");
assert.equal(probes, 0, "空目录连 commands 服务都不应探测");
assert.equal(cleanup(), undefined);

// 没有 commands 服务、没有 ctx、服务探测抛错：都不报错也不注册。
for (const ctx of [undefined, {}, { get: () => undefined }, { get() { throw new Error("no service"); } }]) {
  const dispose = registerPublisherCommand(ctx);
  assert.equal(typeof dispose, "function");
  assert.equal(dispose(), undefined);
}

// 客户端源码必须注册「命令」页签，且位于「数据」与「Action」之间、走本插件 action。
const clientSource = readFileSync(CLIENT_SRC, "utf8");
const dataAt = clientSource.indexOf('id: "data"');
const commandsAt = clientSource.indexOf('id: "commands"');
const actionsAt = clientSource.indexOf('id: "actions"');
assert.ok(dataAt > 0 && commandsAt > dataAt && actionsAt > commandsAt, "「命令」页签应位于「数据」之后、「Action」之前");
assert.ok(!clientSource.includes("api.schema("), "页面不得走宿主统一 schema 接口");
assert.ok(readFileSync(VIEW_SRC, "utf8").includes('api.call("tasks.commands"'), "视图应自己调用 tasks.commands");
assert.equal(
  readFileSync(VIEW_SRC, "utf8").includes("require("),
  false,
  "视图保持零 require，共享正文组件由入口注入",
);
assert.match(
  clientSource,
  /views\/commands\.cjs"\)\(\{[\s\S]*?Body: require\("\.\.\/\.\.\/lib\/markdown\.cjs"\)/,
  "入口应把共享 Markdown 正文组件注入命令页",
);

// 页面渲染用的样命令：目录已空，但「命令」页仍要渲染任何 future 命令，故用固定样例。
const VIEW_FIXTURE = {
  name: "wb-sample",
  title: { zh: "样例命令", en: "Sample command" },
  summary: { zh: "样例命令的用途", en: "Purpose of the sample command" },
  usage: { zh: "/wb-sample <参数>", en: "/wb-sample <arg>" },
  inputHint: { zh: "<参数>", en: "<arg>" },
  attachments: true,
  limit: { field: { zh: "参数", en: "arg" }, max: 100 },
  examples: ["/wb-sample 示例参数"],
  notes: { zh: "样例命令说明", en: "Sample command notes" },
  template: "A. 调研现状\n## 输出格式\n## 边界规则\n## 会话信息\n{需求描述}<sessionId><生成时间>",
};

// ── 3. 页面四态 ──
// 共享正文组件由客户端入口注入；这里用真实 markdown/body-toggle 覆盖渲染与切换，
// Icon 用轻量替身，避免测试加载器认识 lucide。
function loadDeps(React, opts) {
  const o = opts || {};
  const markdown = require(resolve(ROOT, "packages/addons/lib/markdown.cjs"));
  return {
    React,
    Icon: function StubIcon(props) { return React.createElement("span", { "data-icon": props.name }); },
    Body: markdown.createBody(React),
    BodyMode: require(resolve(ROOT, "packages/addons/lib/body-toggle.cjs"))(React),
    // 折叠面板共享控件：与客户端入口注入的一致性（视图本身保持零 require）。
    Disclosure: require(resolve(ROOT, "packages/addons/lib/disclosure.cjs")).createDisclosure(React).Disclosure,
    bodyStyles: require(resolve(ROOT, "packages/addons/lib/body-styles.cjs")),
    bodyCopy: require(resolve(ROOT, "packages/addons/lib/body-copy.cjs")),
    useConfig: () => ({
      ready: o.configReady !== false,
      values: { "ui.bodyMode": o.bodyMode === "text" ? "text" : "markdown" },
    }),
  };
}
function loadView(React, opts) {
  const sandbox = createContext({
    console, Promise, Set, Map, JSON, Object, Array, String, Number, Error, RegExp, Date,
    setTimeout: (fn) => { fn(); return 0; },
    navigator: { clipboard: { writeText: async () => {} } },
  });
  const mod = { exports: {} };
  runInContext("(function (module, exports, require) {" + readFileSync(VIEW_SRC, "utf8") + "\n})", sandbox)(
    mod, mod.exports, () => { throw new Error("view should not require anything"); },
  );
  return mod.exports(loadDeps(React, opts)).CommandsView;
}

// 渲染树里 props.children 保留的是未展开的元素，children 才是 harness 展开后的子节点；
// 文本/查找必须走 children，否则嵌套组件里的文字取不到。
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

async function settle(rt) {
  for (let i = 0; i < 6; i++) {
    await Promise.resolve();
    rt.rerender();
  }
  return rt.tree;
}

async function mountWith(api, lang, opts) {
  const rt = createReact();
  const View = loadView(rt.React, opts);
  rt.mount(View, { api, lang: lang || "zh" });
  return rt;
}

// 加载中：promise 未 resolve 前显示占位，不发请求之外的动作。
{
  let resolveCall;
  const calls = [];
  const api = { call: (name, args) => { calls.push([name, args]); return new Promise((r) => { resolveCall = r; }); } };
  const rt = await mountWith(api);
  assert.ok(text(rt.tree).includes("正在读取命令目录"), "首屏应是加载态");
  resolveCall({ ok: true, result: { count: 0, commands: [] } });
  const tree = await settle(rt);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], "tasks.commands");
  assert.deepEqual(JSON.parse(JSON.stringify(calls[0][1])), {});
  assert.ok(text(tree).includes("本插件不提供斜杠命令"), "空目录应显示空态");
  assert.ok(text(tree).includes("任务发布者」角色"), "空态应指出去输入区选角色发布任务");
}

// 错误态 + 重试：action 不可用时降级，重试再次调用同一 action。
{
  const calls = [];
  let fail = true;
  const api = {
    call: (name) => {
      calls.push(name);
      return fail ? Promise.reject(new Error("no such action")) : Promise.resolve({ ok: true, result: { count: 0, commands: [] } });
    },
  };
  const rt = await mountWith(api);
  let tree = await settle(rt);
  assert.ok(text(tree).includes("命令目录加载失败"), "错误态应标明失败");
  assert.ok(text(tree).includes("no such action"), "错误态应带原因");
  const retry = find(tree, (n) => n.type === "button" && text(n).includes("重试"));
  assert.ok(retry, "错误态需要重试按钮");
  fail = false;
  retry.props.onClick();
  tree = await settle(rt);
  assert.equal(calls.length >= 2, true, "重试应再次调用 action");
  assert.ok(text(tree).includes("本插件不提供斜杠命令"), "重试成功后回到空态");
}

// 正常态：名称、用途、用法、输入、示例、上限、说明与复制按钮。
{
  const fixture = [
    VIEW_FIXTURE,
    Object.assign({}, VIEW_FIXTURE, {
      name: "wb-other-command",
      title: { zh: "另一条命令", en: "Another command" },
      summary: { zh: "第二条命令的用途", en: "Purpose of the second command" },
      usage: { zh: "/wb-other-command <参数>", en: "/wb-other-command <arg>" },
      examples: ["/wb-other-command 示例参数"],
    }),
  ];
  const api = { call: () => Promise.resolve({ ok: true, result: { count: fixture.length, commands: fixture } }) };
  const rt = await mountWith(api, "zh");
  const tree = await settle(rt);
  const body = text(tree);
  assert.ok(body.includes("2 条命令"), "应显示命令条数");
  for (const item of fixture) {
    assert.ok(body.includes("/" + item.name), "应显示命令名：" + item.name);
    assert.ok(body.includes(item.summary.zh), "应显示用途：" + item.name);
    assert.ok(body.includes(item.usage.zh), "应显示用法：" + item.name);
    assert.ok(body.includes(item.examples[0]), "应显示示例：" + item.name);
    assert.ok(body.includes("最多 " + item.limit.max + " 字符"), "应显示字符上限");
    assert.ok(body.includes(item.notes.zh), "应显示说明：" + item.name);
  }
  assert.ok(find(tree, (n) => n.type === "code" && text(n) === "/" + VIEW_FIXTURE.name), "命令名应渲染成代码片段");
  // 提示词模板：默认折叠，正文与描述/感受同款（Markdown 渲染 + 逐块纯文本切换）。
  const details = walk(tree).filter((n) => n.type === "details");
  assert.equal(details.length, fixture.length, "每条命令都应有「提示词模板」折叠区");
  assert.ok(details.every((n) => !n.props.open), "模板应默认折叠");
  assert.ok(body.includes("提示词模板"), "折叠区标题应可见");
  assert.ok(body.includes("<sessionId>"), "折叠区应有占位符说明");
  assert.equal(
    walk(tree).some((n) => String((n.props && n.props.className) || "").includes("wbt-cmd-pre")),
    false,
    "模板正文不再用固定纯文本 pre 渲染",
  );
  const md = walk(tree).filter((n) => String((n.props && n.props.className) || "").split(" ").includes("wb-markdown"));
  assert.equal(md.length, fixture.length, "默认按 Markdown 渲染每条模板");
  const h2Before = walk(tree).filter((n) => n.type === "h2").length;
  assert.ok(h2Before >= fixture.length, "Markdown 模板应渲染出标题");
  const toggles = walk(tree).filter((n) => n.type === "button" && /(^|\s)wb-body-toggle(\s|$)/.test(String((n.props && n.props.className) || "")));
  assert.equal(toggles.length, fixture.length, "每条模板都应有显示模式切换");
  assert.ok(String(toggles[0].props.title).includes("提示词模板"), "切换按钮应说明所属字段");
  assert.equal(toggles[0].props["aria-pressed"], true, "Markdown 模式下切换按钮应处于按下态");
  toggles[0].props.onClick({ stopPropagation() {} });
  const plain = await settle(rt);
  assert.ok(
    walk(plain).some((n) => String((n.props && n.props.className) || "").split(" ").includes("wb-body-text")),
    "切换后应使用纯文本块渲染",
  );
  assert.ok(walk(plain).filter((n) => n.type === "h2").length < h2Before, "切换为纯文本后不应再有 Markdown 标题");
  assert.equal(
    walk(tree).some((n) => n.type === "input" || n.type === "textarea" || n.type === "select"),
    false,
    "模板区不得出现可编辑控件",
  );
  const copies = walk(tree).filter((n) => n.type === "button" && text(n) === "复制");
  assert.ok(copies.length >= fixture.length, "用法与示例都应可复制");
  copies[0].props.onClick();
  const copied = await settle(rt);
  assert.ok(text(copied).includes("已复制"), "复制成功后应有反馈");
}

// 初始模式跟随 ui.bodyMode：配置为纯文本时模板直接按文本渲染，仍可切回 Markdown。
{
  const api = { call: () => Promise.resolve({ ok: true, result: { count: 1, commands: [VIEW_FIXTURE] } }) };
  const rt = await mountWith(api, "zh", { bodyMode: "text" });
  let tree = await settle(rt);
  assert.equal(walk(tree).some((n) => n.type === "h2"), false, "配置为纯文本时不应渲染 Markdown 标题");
  assert.ok(
    walk(tree).some((n) => String((n.props && n.props.className) || "").split(" ").includes("wb-body-text")),
    "配置为纯文本时应使用 wb-body-text",
  );
  const toggle = find(tree, (n) => n.type === "button" && /(^|\s)wb-body-toggle(\s|$)/.test(String((n.props && n.props.className) || "")));
  assert.ok(toggle, "纯文本下也应有切换按钮");
  assert.equal(toggle.props["aria-pressed"], false);
  toggle.props.onClick({ stopPropagation() {} });
  tree = await settle(rt);
  assert.ok(walk(tree).some((n) => n.type === "h2"), "切回 Markdown 应恢复标题");
}

// 配置未就绪时先留在加载态，不渲染空目录或旧内容。
{
  const api = { call: () => Promise.resolve({ ok: true, result: { count: 1, commands: [VIEW_FIXTURE] } }) };
  const rt = await mountWith(api, "zh", { configReady: false });
  const tree = await settle(rt);
  assert.ok(text(tree).includes("正在读取命令目录"), "配置未就绪时应保持加载态");
  assert.equal(walk(tree).some((n) => n.type === "details"), false, "配置未就绪时不渲染模板");
}

// 英文界面取 en 文案。
{
  const api = { call: () => Promise.resolve({ ok: true, result: { count: 1, commands: [VIEW_FIXTURE] } }) };
  const rt = await mountWith(api, "en");
  const body = text(await settle(rt));
  assert.ok(body.includes("Commands") && body.includes("Read-only"), body.slice(0, 120));
  assert.ok(body.includes(VIEW_FIXTURE.summary.en), "英文界面应显示 en 用途");
  assert.ok(body.includes("Prompt template"), "英文界面应显示模板折叠区");
}

console.log("TASKS COMMANDS PASS: 空目录 + 已下架命令名清除 + 空目录不注册 + client view 4 states");
