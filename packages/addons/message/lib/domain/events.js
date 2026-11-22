/**
 * 事件队列消费：别的插件只管往队列推事件，本插件自己订阅并转成消息。
 *
 * 约定（AGENTS 02）：每个域只有**一个**消费入口 `message.onEvent`，宿主把所有订阅到
 * 的事件都投到这里，按 `type` 自己分派——不要为每种事件各开一个 action，否则每加一条
 * 订阅就要改一次 action 清单与文档。origins 必须恰好是 ["plugin"]，ui 与 agent 都调不到。
 */
import { sendMessage } from "./messages.js";

/** 邮件插件在新信落库后推的事件。 */
export const MAIL_SYNCED_EVENT = "mail.messages-synced";

function readString(value, max) {
  return typeof value === "string" ? value.slice(0, max) : "";
}

/** 把 mail.messages-synced 的载荷转成一条消息中心提醒。 */
function notifyMailSynced(api, args) {
  const data = (args && typeof args.payload === "object" && args.payload) || {};
  const messages = Array.isArray(data.messages) ? data.messages.slice(0, 3) : [];
  const latest = messages[0] || {};
  const accountName = readString(data.accountName, 80) || readString(data.accountId, 80) || "邮箱";
  const title = ("新邮件（" + accountName + "）：" + (readString(latest.subject, 200) || "（无主题）")).slice(0, 120);
  const body = messages
    .map((m) => (readString(m.fromName, 80) || readString(m.fromAddr, 120) || "未知发件人") + " · " + (readString(m.subject, 200) || "（无主题）"))
    .join("\n")
    .slice(0, 3000);
  const latestUid = Number(data.latestUid) || Number(data.exists) || 0;
  const accountId = readString(data.accountId, 80);
  const result = sendMessage(api, {
    title: title,
    body: body,
    level: "info",
    source: "mail",
    audience: "user",
    // 同一批新信只提醒一次：uid 最大的那封变了才会生成新键。
    dedupeKey: ("mail:new:" + accountId + ":" + latestUid).slice(0, 120),
    meta: {
      accountId: accountId,
      inserted: Number(data.inserted) || 0,
      // 留事件溯源：出问题时能顺着队列里的那条事件回查。
      eventId: readString(args && args.eventId, 80),
      eventType: readString(args && args.type, 80),
    },
  });
  return {
    ok: true,
    deduped: result.deduped === true,
    messageId: result.message ? result.message.id : null,
  };
}

/** 按事件类型分派：目前只订阅了邮件新信，后续加类型在这里扩展。 */
function handleEvent(api, args) {
  const type = readString(args && args.type, 80);
  if (type === MAIL_SYNCED_EVENT) {
    return Object.assign({ handled: true, type: type }, notifyMailSynced(api, args));
  }
  // 订阅表里的类型都在上面覆盖到；真出现未知类型就明确记一句，别静默吞掉。
  api.log("message addon: 收到未处理的事件类型：" + (type || "(空)"));
  return { ok: true, handled: false, type: type, ignored: true };
}

/** 注册统一事件入口并订阅邮件事件；宿主不支持事件队列时安静跳过。 */
export function registerEventConsumers(api) {
  api.action("message.onEvent", {
    // 只允许插件来源：agent 与界面都调不到，事件只能由宿主队列投递。
    origins: ["plugin"],
    description:
      "内部事件入口（由宿主事件队列投递，不是给 agent/界面用的）：宿主把本插件订阅的所有事件都投到这里，按 args.type 分派。当前处理 mail.messages-synced，把新邮件摘要写成一条消息中心提醒（同一账户同一批新信按 uid 幂等）。",
    input: {
      type: "object",
      properties: {
        eventId: { type: "string", description: "宿主事件 id（记进消息 meta，便于溯源）" },
        type: { type: "string", description: "事件类型，例如 mail.messages-synced" },
        payload: {
          type: "object",
          description:
            "事件载荷，形状由 type 决定；mail.messages-synced 为 accountId / accountName / mailbox / inserted / exists / latestUid / messages[{subject,fromName,fromAddr,uid}]",
        },
      },
    },
    execute: (args) => handleEvent(api, args),
    render: (result) => {
      if (!result || result.ignored) return "已忽略未处理的事件";
      if (result.handled && result.deduped) return "该批新邮件已提醒过（幂等命中）";
      if (result.handled) return "已生成新邮件提醒";
      return "已处理事件";
    },
  });

  if (api.events && typeof api.events.subscribe === "function") {
    try {
      api.events.subscribe(MAIL_SYNCED_EVENT);
    } catch (error) {
      api.log("message addon: 订阅邮件事件失败：" + String((error && error.message) || error));
    }
  } else {
    api.log("message addon: 宿主不支持事件队列，跳过邮件提醒订阅");
  }
}
