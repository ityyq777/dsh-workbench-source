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
  // 缺任务表 / 时间线 / 工作区不再停问：agent 自行补齐，只在回执说明
  assert.equal(brief.includes("获得授权后再创建"), false, "SOP C 不应再要求建节点前授权");
  assert.ok(brief.includes("直接调用 taskNodes.create"), "SOP C 应允许自行建组/建表");
  assert.ok(brief.includes("不必等用户确认"), "SOP C 的建节点不需要再确认");
  assert.ok(brief.includes("只有确有新职能域才新建上级组"), "建组仍受职能域约束");
  assert.ok(brief.includes("不得为单条任务建整条组层级"), "不得为单条任务建整条组层级");
  assert.ok(brief.includes("信息齐全且归属唯一时直接发布"), "SOP F 的直接发布口径必须保留");
  assert.ok(brief.includes("只有三种情况先给草案并提问"), "SOP F 应把停问条件收敛为三种");
  assert.ok(brief.includes("缺任务表 / 时间线 / 工作区不属于停问条件"), "SOP F 不应再为缺归属停问");
  for (const reason of ["任务表多候选且职责相当", "信息互相冲突", "查重命中同主题任务"]) {
    assert.ok(brief.includes(reason), "SOP F 的停问条件应包含：" + reason);
  }
  assert.ok(brief.includes("非代码") === false || brief.includes("只有需求明确是代码改动时才看仓库"));
  assert.ok(brief.includes("sessionId: s-abc"));
  assert.ok(brief.includes('用 "dsh-session:" 前缀拼接上面的 sessionId'));
  // 回归：正文里不能出现 dsh-session: 紧跟裸 id 的串，会被 DSH 当会话引用 URI 解析
  assert.equal(/dsh-session:[A-Za-z0-9_-]+/u.test(brief), false, "brief 不得包含裸 dsh-session 引用");
  assert.ok(brief.includes("2026-11-10T03:00:00.000Z"));
  // 工作区归属：与任务表归属同属 SOP C，且回执要写清
  assert.ok(brief.includes("C. 归属（任务表 + 工作区）"), "SOP C 应同时覆盖任务表与工作区");
  assert.ok(brief.includes("taskWorkspaces.list"), "SOP C 应先列工作区候选");
  assert.ok(brief.includes("workspaceIds"), "SOP C/E 应说明创建时传 workspaceIds");
  assert.ok(brief.includes("pageSize 用到 100"), "工作区候选应允许取满 100 条");
  for (const outcome of ["不关联工作区", "关联一个", "关联多个"]) {
    assert.ok(brief.includes(outcome), "SOP C 应明确合法归属结果：" + outcome);
  }
  assert.ok(brief.includes("禁止按名称相似或列表第一条自动挂"), "不得自动挑第一个工作区");
  assert.equal(brief.includes("不要擅自调用 taskWorkspaces.create"), false, "缺工作区应自行创建，不再要授权");
  assert.ok(brief.includes("就用 taskWorkspaces.create 建一个再挂"), "缺工作区时按目录判断自行创建");
  assert.ok(brief.includes("整体替换语义"), "workspaceIds 是整体替换");
  assert.ok(brief.includes("工作区归属"), "输出格式与回执应包含工作区归属");
  assert.ok(brief.includes("无工作区时写明「无工作区」"), "回执要写「无工作区」");
  assert.ok(brief.includes("多个时列全名称与 id"), "多工作区回执要列全名称与 id");
  // 自建通道与回执段
  assert.ok(brief.includes("taskTimelines.create"), "SOP D 应允许自建时间线");
  assert.ok(brief.includes("2 个及以上任务的链条"), "SOP D 应说明何时开新时间线");
  assert.ok(brief.includes("本次自建"), "回执与输出格式应包含「本次自建」段");
  assert.equal(brief.split("本次自建").length - 1 >= 3, true, "E 步与输出格式都要写「本次自建」");
  assert.ok(brief.includes("本次自建：无"), "没有自建时要写「本次自建：无」");
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

// 10) 工作区规则只落在 SOP C/E，不进「边界规则」，且边界仍是 2 条
check("工作区归属不挤进边界规则", () => {
  const brief = buildPublisherBrief({ requirement: "给记录页加批量接取", sessionId: "s-ws" });
  const boundaryBlock = brief.split("## 边界规则")[1].split("## 会话信息")[0];
  assert.equal(boundaryBlock.includes("workspaceIds"), false, "边界规则不应重复工作区口径");
  assert.equal(boundaryBlock.includes("taskWorkspaces"), false, "边界规则不应重复工作区口径");
  const cStep = brief.split("\n").find((line) => line.startsWith("C. 归属"));
  assert.ok(cStep.includes("taskWorkspaces.list") && cStep.includes("workspaceIds"), "工作区判断应在 SOP C");
});

console.log("TASK PUBLISHER PASS:", checks, "checks (brief, registration, empty, attachments, too long, no-commands, followup, workspace)");
