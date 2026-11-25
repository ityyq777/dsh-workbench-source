/**
 * 任务发布者回归：brief 纯函数与发布者角色（5.5.4 起连同「命令」页与命令注册链一起删除）。
 * 纯内存假对象，不连数据库。
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { apply } from "../packages/addons/tasks/lib/index.js";
import { PUBLISHER_INSTRUCTIONS } from "../packages/addons/tasks/lib/publisher/brief.js";
import { buildPublisherBrief } from "../packages/addons/tasks/lib/publisher/brief.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

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

check("真实插件注册角色及职责边界", () => {
  let domain;
  apply({ effect: (register) => register(), workbench: { registerDomain: (value) => { domain = value; } } });
  const [publisher, executor] = domain.roles;
  assert.equal(publisher.id, "publisher");
  assert.equal(executor.id, "executor");
  assert.equal(publisher.instructions, PUBLISHER_INSTRUCTIONS);
  assert.ok(publisher.actions.includes("tasks.create"));
  // 1.1.0 起发布者可以回修自己发布的任务，但仍不能完成与接取。
  assert.ok(publisher.actions.includes("tasks.update"));
  assert.equal(publisher.version, "1.1.0");
  assert.ok(!publisher.actions.includes("tasks.complete"));
  assert.ok(!publisher.actions.includes("tasks.claim"));
  assert.ok(executor.actions.includes("tasks.update"));
  assert.ok(!executor.actions.includes("tasks.create"));
  assert.match(executor.instructions, /询问进度时只读/);
  assert.match(publisher.instructions, /tasks.update 只用于回修本轮自己刚发布的任务/);
});

// 1) brief 必含：原话逐字、五步 SOP、输出格式、边界、sessionId
// 斜杠命令与「命令」页在 5.5.4 已整体删除：文件不存在、不再有 tasks.commands action。
check("命令链已整体删除", () => {
  assert.equal(existsSync(join(ROOT, "packages/addons/tasks/lib/publisher/catalog.js")), false, "catalog.js 应已删除");
  assert.equal(existsSync(join(ROOT, "packages/addons/tasks/lib/publisher/command.js")), false, "command.js 应已删除");
  assert.equal(existsSync(join(ROOT, "packages/addons/tasks/client/views/commands.cjs")), false, "命令页应已删除");
  const lib = readFileSync(join(ROOT, "packages/addons/tasks/lib/index.js"), "utf8");
  assert.ok(!lib.includes("tasks.commands"), "lib/index.js 不应再注册 tasks.commands");
  const client = readFileSync(join(ROOT, "packages/addons/tasks/client/client.src.cjs"), "utf8");
  assert.ok(!client.includes("commands"), "客户端不应再有命令页签");
});

check("brief 结构完整", () => {
  const brief = buildPublisherBrief({
    requirement: "记录页加常用筛选快捷按钮",
    sessionId: "s-abc",
    now: new Date("2026-11-10T03:00:00Z"),
  });
  assert.ok(brief.includes("记录页加常用筛选快捷按钮"));
  assert.ok(brief.includes("用户原话（逐字保留，不要先改写）"));
  for (const step of ["A. 调研现状", "B. 润色与补充", "C. 归属", "D. 时间线", "E. 标签", "F. 发布", "G. 何时停下来问"]) {
    assert.ok(brief.includes(step), "缺少步骤 " + step);
  }
  assert.ok(brief.includes("## 输出格式"));
  assert.ok(brief.includes("## 边界规则"));
  // 边界规则三条：「不改 schema / 不伪造证据」「一次性问答不建任务」「tasks.update 只回修本轮自建任务」：
  // 建节点授权与直接发布口径统一由 SOP C/F 定义，避免同一份 brief 里出现相反指令。
  const boundaryBlock = brief.split("## 边界规则")[1].split("## 会话信息")[0];
  const boundaryLines = boundaryBlock.split("\n").filter((line) => line.startsWith("- "));
  assert.equal(boundaryLines.length, 3, "边界规则应为 3 条");
  assert.ok(boundaryBlock.includes("tasks.update 只用于回修本轮自己刚发布的任务"));
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
  assert.ok(brief.includes('重试沿用原键，后续独立需求另用新键'));
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

  // 标签步骤：独立步骤、按名传参、自动创建、标签域缺失降级、回执与输出格式都写标签
  assert.ok(brief.includes("E. 标签"), "SOP 应有独立的标签步骤");
  assert.equal(brief.indexOf("E. 标签") < brief.indexOf("F. 发布"), true, "标签步骤应在发布之前");
  assert.equal(brief.indexOf("F. 发布") < brief.indexOf("G. 何时停下来问"), true, "停问仍是最后一步");
  assert.ok(brief.includes('tags: [\"标签名\"]'), "应按标签名传参");
  assert.ok(brief.includes("不要用 tagIds"), "不应让 agent 用 tagIds");
  assert.ok(brief.includes("也不必先 tags.create"), "未知标签名不必先建");
  assert.ok(brief.includes("form.autoCreateTags"), "应说明未知标签名由配置决定是否自动创建");
  assert.ok(brief.includes("标签域未安装时仍传 tags"), "标签域缺失时应降级为照常创建");
  assert.ok(brief.includes("不要因此停问、重试或声称已打标"), "标签域缺失不得阻断、重试或虚报");
  assert.ok(brief.includes("业务域、功能面、动作、影响面"), "标签维度应写成可执行建议");
  // 2026-11-12 口径放宽：不再引导先查现有标签、不再给 3–6 的区间，改为自由联想、越多越好
  assert.ok(brief.includes("自由联想"), "标签应鼓励自由联想");
  assert.ok(brief.includes("越多越好"), "标签数量口径应为越多越好");
  assert.ok(brief.includes("通常 5–8 个"), "给出常见区间作为参考而非上限");
  assert.ok(brief.includes("通常 5–8 个，上不封顶"), "不应设置硬上限");
  assert.equal(brief.includes("先取现有标签"), false, "不应再要求先取现有标签");
  assert.equal(brief.includes("tasks.tagOptions 分页"), false, "不应引导分页枚举现有标签");
  assert.equal(brief.includes("4–6 个"), false, "旧的 4–6 区间必须移除");
  assert.equal(brief.includes("优先复用同义标签"), false, "不应以复用现有标签为优先");
  assert.ok(brief.includes("工作区归属、时间线归属、标签（完整名称；新建的单独标出，没标注的视为沿用）"), "创建回执要写标签");
  const fmt3 = brief.split("\n").find((line) => line.startsWith("3. 归属"));
  assert.ok(fmt3.includes("标签") && fmt3.includes("新建的单独标出"), "输出格式第 3 条应包含标签与新建标记");
  const fmt4 = brief.split("\n").find((line) => line.startsWith("4. 发布回执"));
  assert.ok(fmt4.includes("标签") && fmt4.includes("未打标须说明原因"), "输出格式第 4 条应包含标签与未打标原因");
});

// 2) 缺 sessionId / now 时兜底，不抛错
check("brief 兜底", () => {
  const brief = buildPublisherBrief({ requirement: "  x  " });
  assert.ok(brief.includes("sessionId: unknown"));
  assert.ok(brief.includes('重试沿用原键，后续独立需求另用新键'));
  assert.equal(/dsh-session:[A-Za-z0-9_-]+/u.test(brief), false);
});

// 2.1) 预览模式只替换生成时间，正式 brief 的行为不变
check("preview 不影响正式 brief", () => {
  const real = buildPublisherBrief({
    requirement: "把命令页的模板展示补齐",
    sessionId: "session-real-1",
    now: new Date("2026-11-11T08:00:00.000Z"),
  });
  const preview = buildPublisherBrief({ requirement: "{需求描述}", sessionId: "<sessionId>", preview: true });
  assert.ok(real.includes("sessionId: session-real-1"), "正式 brief 应带真实 sessionId");
  assert.ok(real.includes("生成时间: 2026-11-11T08:00:00.000Z"), "正式 brief 应带真实生成时间");
  assert.ok(preview.includes("sessionId: <sessionId>"), "预览应使用占位符 sessionId");
  assert.ok(preview.includes("生成时间: <生成时间>"), "预览应使用占位符生成时间");
  const restored = preview
    .split("{需求描述}").join("把命令页的模板展示补齐")
    .split("<sessionId>").join("session-real-1")
    .split("<生成时间>").join("2026-11-11T08:00:00.000Z");
  assert.equal(restored, real, "预览换回真实值后应与正式 brief 逐字一致");
});

// 10) 工作区规则只落在 SOP C/E，不进「边界规则」，且边界仍是 2 条
check("工作区归属不挤进边界规则", () => {
  const brief = buildPublisherBrief({ requirement: "给记录页加批量接取", sessionId: "s-ws" });
  const boundaryBlock = brief.split("## 边界规则")[1].split("## 会话信息")[0];
  assert.equal(boundaryBlock.includes("workspaceIds"), false, "边界规则不应重复工作区口径");
  assert.equal(boundaryBlock.includes("taskWorkspaces"), false, "边界规则不应重复工作区口径");
  const cStep = brief.split("\n").find((line) => line.startsWith("C. 归属"));
  assert.ok(cStep.includes("taskWorkspaces.list") && cStep.includes("workspaceIds"), "工作区判断应在 SOP C");
  assert.equal(boundaryBlock.includes("tags"), false, "标签口径不应重复写进边界规则");
});

console.log("TASK PUBLISHER PASS:", checks, "checks (roles, no slash command, brief, preview, workspace)");
