/**
 * 任务插件注册的斜杠命令：把用户原话、附件交给单次绑定角色的下一轮。
 * 命令本身不建任务、不写业务数据；无 commands 服务（ACP/无 UI）时静默跳过。
 *
 * 命令的元信息与正文生成函数都在 catalog.js：这里只做注册循环，
 * 新增命令时改目录即可，不用再写一遍 register 调用。
 *
 * 5.5.1 起目录为空（`/wb-task-publisher` 下架，改用输入区角色入口），
 * 注册循环保留：目录为空时直接返回空清理函数，不碰 commands 服务、不抛错。
 */
import { TASK_COMMANDS, usageText } from "./catalog.js";

function newMessageId() {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return "msg-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

/** 取当前会话 id；用于绑定命令生成的消息。 */
function sessionIdOf(agent) {
  return String((agent && agent.session && agent.session.id) || (agent && agent.id) || "");
}

/** 注册目录里的全部命令，返回清理函数。目录为空或 commands 服务缺失时返回空清理函数且不报错。 */
export function registerPublisherCommand(ctx) {
  // 目录为空：没有任何命令要注册，连服务都不去探测（无 UI 环境也不会报错）。
  if (!Array.isArray(TASK_COMMANDS) || TASK_COMMANDS.length === 0) return () => {};

  let commands;
  try {
    commands = ctx && typeof ctx.get === "function" ? ctx.get("commands") : undefined;
  } catch {
    commands = undefined;
  }
  if (!commands || typeof commands.register !== "function") return () => {};

  const disposes = TASK_COMMANDS.map((entry) =>
    commands.register({
      name: entry.name,
      description: entry.title.zh + "：" + entry.summary.zh,
      input: { hint: entry.inputHint.zh, attachments: entry.attachments !== false },
      // 正文由 followup 带入模型历史，命令日志里不再重复记一遍。
      recordInput: false,
      handler: ({ agent, rawInput, attachments } = {}) => {
        const requirement = typeof rawInput === "string" ? rawInput : "";
        if (!requirement.trim()) {
          return { kind: "success", text: usageText(entry, "zh") };
        }
        const limit = entry.limit;
        if (limit && requirement.length > limit.max) {
          return {
            kind: "error",
            text:
              limit.field.zh + "约 " + requirement.length + " 字符，超过 " + limit.max +
              " 字符上限。请精简需求，或把长材料作为附件随命令发送。",
          };
        }
        if (!agent || typeof agent.followup !== "function") {
          return { kind: "error", text: "当前会话无法接收下一轮消息，" + entry.title.zh + "引导没有送出。" };
        }
        const host = ctx.workbench;
        const sessionId = sessionIdOf(agent);
        if (!sessionId || typeof host?.bindMessageRole !== "function") {
          return { kind: "error", text: "当前会话无法绑定单次发布角色，请检查工作台宿主版本和会话状态。" };
        }
        const id = newMessageId();
        const content = [...(Array.isArray(attachments) ? attachments : []), { type: "text", text: requirement }];
        let cancel;
        try {
          cancel = host.bindMessageRole(sessionId, id, entry.roleId);
          agent.followup({ id, role: "user", content, source: { kind: "user" } });
        } catch (error) {
          cancel?.();
          const message = error && error.message ? error.message : String(error);
          return { kind: "error", text: entry.title.zh + "引导送入失败：" + message };
        }
        return { kind: "success", text: entry.sentText.zh };
      },
    }),
  );
  return () => {
    for (const dispose of disposes) if (typeof dispose === "function") dispose();
  };
}
