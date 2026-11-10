/**
 * /wb-task-publisher 回归：brief 纯函数、命令注册、空参数、超长、附件顺序、无 commands 服务。
 * 纯内存假对象，不连数据库。
 */
import assert from "node:assert/strict";
import { buildPublisherBrief, MAX_REQUIREMENT_LENGTH } from "../packages/addons/tasks/lib/publisher/brief.js";
import { registerPublisherCommand, PUBLISHER_USAGE, PUBLISHER_COMMAND } from "../packages/addons/tasks/lib/publisher/command.js";

let checks = 0;
function check(name, fn) {
  try {
    fn();
    checks++;
  } catch (error) {
    console.error("FAIL:", name);
    throw error;
  }
}

function fakeCommands() {
  const defs = new Map();
  let disposed = 0;
  return {
    defs,
    register(def) {
      defs.set(def.name, def);
      return () => {
        disposed++;
      };
    },
    disposed: () => disposed,
  };
}

function fakeCtx(commands) {
  return { get: (name) => (name === "commands" ? commands : undefined) };
}

function fakeAgent(sessionId) {
  const calls = [];
  return {
    calls,
    session: { id: sessionId || "session-1" },
    followup(message) {
      calls.push(message);
    },
  };
}

// 1) brief 必含：原话逐字、五步 SOP、输出格式、边界、sessionId
check("brief 结构完整", () => {
  const brief = buildPublisherBrief({
    requirement: "记录页加常用筛选快捷按钮",
    sessionId: "s-abc",
    now: new Date("2026-11-10T03:00:00Z"),
  });
  assert.ok(brief.includes("记录页加常用筛选快捷按钮"));
  assert.ok(brief.includes("用户原话（逐字保留，不要先改写）"));
  for (const step of ["A. 调研现状", "B. 润色与补充", "C. 归属", "D. 时间线", "E. 发布", "F. 何时停下来问"]) {
    assert.ok(brief.includes(step), "缺少步骤 " + step);
  }
  assert.ok(brief.includes("## 输出格式"));
  assert.ok(brief.includes("## 边界规则"));
  // 边界规则只保留「不改 schema / 不伪造证据」与「一次性问答不建任务」两条：
  // 建节点授权与直接发布口径统一由 SOP C/F 定义，避免同一份 brief 里出现相反指令。
  const boundaryBlock = brief.split("## 边界规则")[1].split("## 会话信息")[0];
  const boundaryLines = boundaryBlock.split("\n").filter((line) => line.startsWith("- "));
  assert.equal(boundaryLines.length, 2, "边界规则应只剩 2 条");
  assert.equal(brief.includes("不要自动建任务表或任务节点"), false);
  assert.equal(brief.includes("不做无人值守的全自动发布"), false);
  assert.ok(brief.includes("获得授权后再创建"), "SOP C 的建节点授权口径必须保留");
  assert.ok(brief.includes("信息齐全且归属唯一时直接发布"), "SOP F 的直接发布口径必须保留");
  assert.ok(brief.includes("非代码") === false || brief.includes("只有需求明确是代码改动时才看仓库"));
  assert.ok(brief.includes("sessionId: s-abc"));
  assert.ok(brief.includes('用 "dsh-session:" 前缀拼接上面的 sessionId'));
  // 回归：正文里不能出现 dsh-session: 紧跟裸 id 的串，会被 DSH 当会话引用 URI 解析
  assert.equal(/dsh-session:[A-Za-z0-9_-]+/u.test(brief), false, "brief 不得包含裸 dsh-session 引用");
  assert.ok(brief.includes("2026-11-10T03:00:00.000Z"));
});

// 2) 缺 sessionId / now 时兜底，不抛错
check("brief 兜底", () => {
  const brief = buildPublisherBrief({ requirement: "  x  " });
  assert.ok(brief.includes("sessionId: unknown"));
  assert.ok(brief.includes('用 "dsh-session:" 前缀拼接上面的 sessionId'));
  assert.equal(/dsh-session:[A-Za-z0-9_-]+/u.test(brief), false);
});

// 3) 注册：名称、描述、input、recordInput=false、handler 返回用法
check("注册与空参数", () => {
  const commands = fakeCommands();
  const dispose = registerPublisherCommand(fakeCtx(commands));
  const def = commands.defs.get(PUBLISHER_COMMAND);
  assert.ok(def, "未注册命令");
  assert.equal(def.recordInput, false);
  assert.equal(def.input.attachments, true);
  assert.match(def.input.hint, /需求描述/);
  assert.ok(def.description.length > 0);
  const agent = fakeAgent();
  const result = def.handler({ agent, rawInput: "   " });
  assert.equal(result.kind, "success");
  assert.equal(result.text, PUBLISHER_USAGE);
  assert.equal(agent.calls.length, 0, "空参数不应触发 followup");
  dispose();
  assert.equal(commands.disposed(), 1, "disposer 应转发到 commands.register 的清理函数");
});

// 4) 正常参数：followup 一次，内容含原话与 SOP，消息结构正确
check("正常发布引导", () => {
  const commands = fakeCommands();
  registerPublisherCommand(fakeCtx(commands));
  const def = commands.defs.get(PUBLISHER_COMMAND);
  const agent = fakeAgent("sess-9");
  const result = def.handler({ agent, rawInput: "给时间线页加状态过滤" });
  assert.equal(result.kind, "success");
  assert.match(result.text, /已把发布引导送入下一轮/);
  assert.equal(agent.calls.length, 1);
  const msg = agent.calls[0];
  assert.equal(msg.role, "user");
  assert.equal(msg.source.kind, "user");
  assert.ok(typeof msg.id === "string" && msg.id.length > 0);
  assert.equal(msg.content.length, 1);
  assert.equal(msg.content[0].type, "text");
  assert.ok(msg.content[0].text.includes("给时间线页加状态过滤"));
  assert.ok(msg.content[0].text.includes("## 发布 SOP"));
});

// 5) 附件在文本之前，顺序保持
check("附件顺序", () => {
  const commands = fakeCommands();
  registerPublisherCommand(fakeCtx(commands));
  const def = commands.defs.get(PUBLISHER_COMMAND);
  const agent = fakeAgent();
  const att1 = { type: "image", url: "a.png" };
  const att2 = { type: "file", name: "b.txt" };
  def.handler({ agent, rawInput: "需求", attachments: [att1, att2] });
  const msg = agent.calls[0];
  assert.equal(msg.content.length, 3);
  assert.deepEqual(msg.content[0], att1);
  assert.deepEqual(msg.content[1], att2);
  assert.equal(msg.content[2].type, "text");
  assert.ok(msg.content[2].text.includes("需求"));
});

// 6) 超长返回 error，不 followup
check("超长需求", () => {
  const commands = fakeCommands();
  registerPublisherCommand(fakeCtx(commands));
  const def = commands.defs.get(PUBLISHER_COMMAND);
  const agent = fakeAgent();
  const result = def.handler({ agent, rawInput: "a".repeat(MAX_REQUIREMENT_LENGTH + 1) });
  assert.equal(result.kind, "error");
  assert.match(result.text, /字符上限/);
  assert.equal(agent.calls.length, 0);
});

// 7) 无 commands 服务：不报错、返回可调用 disposer
check("无 commands 服务", () => {
  const dispose = registerPublisherCommand({ get: () => undefined });
  assert.equal(typeof dispose, "function");
  dispose();
  const dispose2 = registerPublisherCommand({});
  assert.equal(typeof dispose2, "function");
});

// 8) get 抛错时静默跳过
check("commands 探测抛错", () => {
  const dispose = registerPublisherCommand({ get() { throw new Error("no service"); } });
  assert.equal(typeof dispose, "function");
});

// 9) agent 不支持 followup 时返回 error
check("agent 不支持 followup", () => {
  const commands = fakeCommands();
  registerPublisherCommand(fakeCtx(commands));
  const def = commands.defs.get(PUBLISHER_COMMAND);
  const result = def.handler({ agent: {}, rawInput: "需求" });
  assert.equal(result.kind, "error");
  assert.match(result.text, /无法接收下一轮消息/);
});

console.log("TASK PUBLISHER PASS:", checks, "checks (brief, registration, empty, attachments, too long, no-commands, followup)");
