/**
 * 事件队列消费：别的插件只管往队列推事件，本插件自己订阅并转成消息。
 *
 * 约定（AGENTS 02）：消费 action 的 origins 必须恰好是 ["plugin"]，
 * 这样 ui 与 agent 都调不到，事件只能由宿主队列投递进来。
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

/** 注册消费 action 并订阅邮件事件；宿主不支持事件队列时安静跳过。 */
export function registerEventConsumers(api) {
  api.action("message.onMailSynced", {
    // 只允许插件来源：agent 与界面都调不到，事件只能由宿主队列投递。
    origins: ["plugin"],
    description:
      "内部消费 action（由宿主事件队列投递，不是给 agent/界面用的）：收到 mail.messages-synced 时，把新邮件摘要写成一条消息中心提醒。同一账户同一批新信按 uid 幂等。",
    input: {
      type: "object",
      properties: {
        eventId: { type: "string", description: "宿主事件 id（记进消息 meta，便于溯源）" },
        type: { type: "string", description: "事件类型，固定为 mail.messages-synced" },
        payload: {
          type: "object",
          description: "邮件插件给的新信摘要：accountId / accountName / mailbox / inserted / exists / latestUid / messages[{subject,fromName,fromAddr,uid}]",
        },
      },
    },
    execute: (args) => notifyMailSynced(api, args),
    render: (result) => (result && result.ok ? (result.deduped ? "该批新邮件已提醒过（幂等命中）" : "已生成新邮件提醒") : "已忽略邮件事件"),
  });

  if (api.events && typeof api.events.subscribe === "function") {
    try {
      api.events.subscribe(MAIL_SYNCED_EVENT, "message.onMailSynced");
    } catch (error) {
      api.log("message addon: 订阅邮件事件失败：" + String((error && error.message) || error));
    }
  } else {
    api.log("message addon: 宿主不支持事件队列，跳过邮件提醒订阅");
  }
}
