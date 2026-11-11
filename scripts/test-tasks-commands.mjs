// 「命令」页 + tasks.commands 回归：
// 1) 目录唯一事实来源的形状与去重（catalog.js 不复制 SOP 正文）；
// 2) command.js 按目录注册斜杠命令，空输入/超长/无 followup/附件顺序都走同一套逻辑；
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
const { PUBLISHER_COMMAND, PUBLISHER_USAGE, registerPublisherCommand } = await import(
  "file://" + resolve(ROOT, "packages/addons/tasks/lib/publisher/command.js")
);
const { MAX_REQUIREMENT_LENGTH } = await import(
  "file://" + resolve(ROOT, "packages/addons/tasks/lib/publisher/brief.js")
);

// ── 1. 目录：数组化、字段齐全、名称唯一、正文不双写 ──
assert.ok(Array.isArray(TASK_COMMANDS) && TASK_COMMANDS.length >= 1, "命令目录应为非空数组");
const names = TASK_COMMANDS.map((entry) => entry.name);
assert.equal(new Set(names).size, names.length, "命令名不得重复");
for (const entry of TASK_COMMANDS) {
  assert.match(entry.name, /^[a-z][a-z0-9-]*$/, "命令名只允许小写字母/数字/连字符：" + entry.name);
  for (const lang of ["zh", "en"]) {
    assert.ok(entry.title[lang], entry.name + " 缺 title." + lang);
    assert.ok(entry.summary[lang], entry.name + " 缺 summary." + lang);
    assert.ok(entry.usage[lang], entry.name + " 缺 usage." + lang);
    assert.ok(entry.inputHint[lang], entry.name + " 缺 inputHint." + lang);
    assert.ok(entry.sentText[lang], entry.name + " 缺 sentText." + lang);
    assert.ok(entry.notes[lang], entry.name + " 缺 notes." + lang);
  }
  assert.equal(typeof entry.buildBrief, "function", entry.name + " 必须自己生成正文（buildBrief）");
  assert.ok(entry.examples.length >= 1, entry.name + " 至少给一个示例");
  assert.ok(entry.limit && entry.limit.max > 0, entry.name + " 应有字符上限");
}

// 目录只放元信息：SOP 正文仍在 brief.js，目录源码里不能出现正文骨架。
const catalogSource = readFileSync(resolve(ROOT, "packages/addons/tasks/lib/publisher/catalog.js"), "utf8");
for (const marker of ["## ", "边界规则", "获得授权后再创建", "A. 调研现状", "dedupeKey"]) {
  assert.equal(catalogSource.includes(marker), false, "命令目录不应复制发布模版正文：" + marker);
}

// 投影是纯数据：可直接 JSON 序列化，且不含函数。
const catalog = commandCatalog();
assert.deepEqual(JSON.parse(JSON.stringify(catalog)), catalog, "tasks.commands 返回值必须可 JSON 序列化");
assert.equal(catalog.length, TASK_COMMANDS.length);
for (const item of catalog) {
  assert.equal(Object.keys(item).filter((key) => typeof item[key] === "function").length, 0, "投影不应含函数");
  assert.ok(item.examples.every((text) => typeof text === "string" && text.startsWith("/" + item.name)), "示例应是可复制的完整命令");
}
// 模板：每条命令都带非空只读模板，骨架与占位符齐全，且与正式 brief 同源。
for (const item of catalog) {
  assert.equal(typeof item.template, "string", item.name + " 应带只读模板 template");
  assert.ok(item.template.trim().length > 200, item.name + " 的模板不应为空");
  for (const marker of ["A. 调研现状", "## 输出格式", "## 边界规则", "## 会话信息"]) {
    assert.ok(item.template.includes(marker), item.name + " 的模板缺骨架：" + marker);
  }
  for (const holder of ["{需求描述}", "<sessionId>", "<生成时间>"]) {
    assert.ok(item.template.includes(holder), item.name + " 的模板缺占位符：" + holder);
  }
}
const SAMPLE = catalog[0];
const REAL_SID = "session-real-command-1";
const REAL_REQ = "把命令页的模板展示补齐";
const realBrief = TASK_COMMANDS[0].buildBrief({
  requirement: REAL_REQ,
  sessionId: REAL_SID,
  now: new Date("2026-11-11T08:00:00.000Z"),
});
const restored = SAMPLE.template
  .split("{需求描述}").join(REAL_REQ)
  .split("<sessionId>").join(REAL_SID)
  .split("<生成时间>").join("2026-11-11T08:00:00.000Z");
assert.equal(restored, realBrief, "模板换回真实值后应与正式 brief 逐字一致");
assert.equal(SAMPLE.template.includes(REAL_SID), false, "模板不得泄露真实会话 id");

const publisher = findCommand(PUBLISHER_COMMAND);
assert.ok(publisher, "findCommand 应能按名称取到发布命令");
assert.equal(publisher.limit.max, MAX_REQUIREMENT_LENGTH, "目录上限应与 brief.js 的常量一致");
assert.equal(findCommand("no-such-command"), undefined);

// 用法文案由目录生成：首行用法、含全部示例、末段说明。
assert.equal(PUBLISHER_USAGE, usageText(publisher, "zh"));
assert.ok(PUBLISHER_USAGE.startsWith("用法：/wb-task-publisher <需求描述>"), PUBLISHER_USAGE);
for (const item of publisher.examples) assert.ok(PUBLISHER_USAGE.includes("  " + item.text), "用法应列全示例：" + item.text);
assert.ok(PUBLISHER_USAGE.includes(publisher.notes.zh), "用法应收尾于说明");
assert.ok(!PUBLISHER_USAGE.includes("\n\n\n"), "用法不应出现连续空行");

// ── 2. 注册：按目录逐条注册，handler 行为复用同一套校验 ──
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
const cleanup = registerPublisherCommand({ get: (name) => (name === "commands" ? commands : undefined) });
assert.equal(commands.registered.length, TASK_COMMANDS.length, "目录里每条命令都应注册");
for (const [i, def] of commands.registered.entries()) {
  const entry = TASK_COMMANDS[i];
  assert.equal(def.name, entry.name);
  assert.ok(def.description.includes(entry.summary.zh), "注册描述应包含目录用途");
  assert.equal(def.input.hint, entry.inputHint.zh);
  assert.equal(def.input.attachments, entry.attachments !== false);
  assert.equal(def.recordInput, false, "正文随 followup 进入历史，不重复记命令日志");
}

const def = commands.registered[0];
const usage = def.handler({ agent: null, rawInput: "   " });
assert.equal(usage.kind, "success");
assert.equal(usage.text, usageText(TASK_COMMANDS[0], "zh"), "空输入应回用法说明");

const tooLong = def.handler({ agent: null, rawInput: "x".repeat(MAX_REQUIREMENT_LENGTH + 1) });
assert.equal(tooLong.kind, "error");
assert.ok(tooLong.text.includes("超过 " + MAX_REQUIREMENT_LENGTH + " 字符上限"), tooLong.text);

const noAgent = def.handler({ agent: null, rawInput: "记录页加筛选快捷按钮" });
assert.equal(noAgent.kind, "error");
assert.ok(noAgent.text.includes("没有送出"), noAgent.text);

const sent = [];
const agent = { session: { id: "session-abc" }, followup: (msg) => sent.push(msg) };
const ok = def.handler({ agent, rawInput: "  记录页加筛选快捷按钮  ", attachments: [{ type: "image", url: "a" }, { type: "file", url: "b" }] });
assert.equal(ok.kind, "success");
assert.equal(ok.text, TASK_COMMANDS[0].sentText.zh);
assert.equal(sent.length, 1);
assert.equal(sent[0].role, "user");
assert.equal(sent[0].content[0].type, "image", "附件顺序应原样保留在前");
assert.equal(sent[0].content[1].type, "file");
assert.equal(sent[0].content[2].type, "text");
const brief = sent[0].content[2].text;
assert.ok(brief.includes("记录页加筛选快捷按钮"), "正文应带用户原话");
assert.ok(brief.includes("session-abc"), "正文应带会话 id");
assert.ok(brief.includes("C. 归属"), "正文应是 brief.js 生成的发布 SOP");

const failing = def.handler({ agent: { followup: () => { throw new Error("boom"); } }, rawInput: "x" });
assert.equal(failing.kind, "error");
assert.ok(failing.text.includes("boom"));

cleanup();
assert.equal(commands.disposed.length, TASK_COMMANDS.length, "清理函数应逐条释放注册");

// 没有 commands 服务（ACP / 无 UI）时不报错、不注册。
const silent = registerPublisherCommand({ get: () => undefined });
assert.equal(typeof silent, "function");
assert.equal(registerPublisherCommand(undefined)(), undefined);

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
  assert.ok(text(tree).includes("本插件还没有注册斜杠命令"), "空目录应显示空态");
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
  assert.ok(text(tree).includes("本插件还没有注册斜杠命令"), "重试成功后回到空态");
}

// 正常态：名称、用途、用法、输入、示例、上限、说明与复制按钮。
{
  const fixture = [
    catalog[0],
    Object.assign({}, catalog[0], {
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
  assert.ok(find(tree, (n) => n.type === "code" && text(n) === "/" + PUBLISHER_COMMAND), "命令名应渲染成代码片段");
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
  assert.ok(copies.length >= catalog.length, "用法与示例都应可复制");
  copies[0].props.onClick();
  const copied = await settle(rt);
  assert.ok(text(copied).includes("已复制"), "复制成功后应有反馈");
}

// 初始模式跟随 ui.bodyMode：配置为纯文本时模板直接按文本渲染，仍可切回 Markdown。
{
  const api = { call: () => Promise.resolve({ ok: true, result: { count: 1, commands: catalog } }) };
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
  const api = { call: () => Promise.resolve({ ok: true, result: { count: 1, commands: catalog } }) };
  const rt = await mountWith(api, "zh", { configReady: false });
  const tree = await settle(rt);
  assert.ok(text(tree).includes("正在读取命令目录"), "配置未就绪时应保持加载态");
  assert.equal(walk(tree).some((n) => n.type === "details"), false, "配置未就绪时不渲染模板");
}

// 英文界面取 en 文案。
{
  const api = { call: () => Promise.resolve({ ok: true, result: { count: 1, commands: catalog } }) };
  const rt = await mountWith(api, "en");
  const body = text(await settle(rt));
  assert.ok(body.includes("Commands") && body.includes("Read-only"), body.slice(0, 120));
  assert.ok(body.includes(catalog[0].summary.en), "英文界面应显示 en 用途");
  assert.ok(body.includes("Prompt template"), "英文界面应显示模板折叠区");
}

console.log("TASKS COMMANDS PASS: catalog, template markdown/plain toggle, registration, usage/handler, client view 4 states");
