/**
 * `/wb-task-publisher` 斜杠命令：把「用户原话 + 发布 SOP」送进下一轮模型。
 * 命令本身不建任务、不写业务数据；无 commands 服务（ACP/无 UI）时静默跳过。
 */
import { buildPublisherBrief, MAX_REQUIREMENT_LENGTH } from "./brief.js";

export const PUBLISHER_COMMAND = "wb-task-publisher";

export const PUBLISHER_USAGE = [
  "用法：/wb-task-publisher <需求描述>",
  "",
  "示例：",
  "  /wb-task-publisher 记录页筛选栏加一组常用筛选快捷按钮",
  "  /wb-task-publisher 时间线页支持按成员任务状态过滤（可附截图）",
  "",
  "命令会把你的原话与发布 SOP 送入下一轮模型：先调研现状，再润色、判归属与时间线、查重，最后才创建任务。可以在需求后附截图或文档。",
].join("\n");

function newMessageId() {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return "msg-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

/** 取当前会话 id；拿不到时用 unknown，仅用于 dedupeKey 提示。 */
function sessionIdOf(agent) {
  return String((agent && agent.session && agent.session.id) || (agent && agent.id) || "");
}

/**
 * 注册发布命令，返回清理函数。commands 服务缺失时返回空清理函数且不报错。
 * @param {object} ctx 插件上下文
 * @returns {() => void}
 */
export function registerPublisherCommand(ctx) {
  let commands;
  try {
    commands = ctx && typeof ctx.get === "function" ? ctx.get("commands") : undefined;
  } catch {
    commands = undefined;
  }
  if (!commands || typeof commands.register !== "function") return () => {};

  const dispose = commands.register({
    name: PUBLISHER_COMMAND,
    description: "按调研、润色、归属、时间线、查重的固定流程发布任务",
    input: { hint: "<需求描述，可附截图/文档>", attachments: true },
    // 正文由 followup 带入模型历史，命令日志里不再重复记一遍。
    recordInput: false,
    handler: ({ agent, rawInput, attachments } = {}) => {
      const requirement = typeof rawInput === "string" ? rawInput.trim() : "";
      if (requirement.length === 0) {
        return { kind: "success", text: PUBLISHER_USAGE };
      }
      if (requirement.length > MAX_REQUIREMENT_LENGTH) {
        return {
          kind: "error",
          text:
            "需求描述约 " + requirement.length + " 字符，超过 " + MAX_REQUIREMENT_LENGTH +
            " 字符上限。请精简需求，或把长材料作为附件随命令发送。",
        };
      }
      if (!agent || typeof agent.followup !== "function") {
        return { kind: "error", text: "当前会话无法接收下一轮消息，发布引导没有送出。" };
      }
      const brief = buildPublisherBrief({
        requirement,
        sessionId: sessionIdOf(agent),
        now: new Date(),
      });
      const extra = Array.isArray(attachments) ? attachments : [];
      const content = extra.length > 0
        ? [...extra, { type: "text", text: brief }]
        : [{ type: "text", text: brief }];
      try {
        agent.followup({ id: newMessageId(), role: "user", content, source: { kind: "user" } });
      } catch (error) {
        const message = error && error.message ? error.message : String(error);
        return { kind: "error", text: "发布引导送入失败：" + message };
      }
      return { kind: "success", text: "已把发布引导送入下一轮：先调研现状，再润色、判归属与时间线、查重，最后发布。" };
    },
  });
  return typeof dispose === "function" ? dispose : () => {};
}
