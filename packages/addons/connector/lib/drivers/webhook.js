/**
 * Webhook driver：外部系统 POST 到 /workbench/hooks/connector/inbound?source=<id>。
 * token 从 vault 租用，不写进 config；默认只允许本机回环。
 */
import { createHash } from "node:crypto";

function hash(text) {
  return createHash("sha1").update(String(text)).digest("hex").slice(0, 24);
}

function text(value, max) {
  return String(value == null ? "" : value).slice(0, max);
}

export const webhookDriver = {
  id: "webhook",
  title: "Webhook",
  secretFields: ["token"],
  configFields: [
    { name: "allowPublic", label: "允许非回环访问（需反代）", type: "boolean", default: false },
    { name: "header", label: "token 请求头", type: "text", default: "x-webhook-token" },
  ],
  validate(config) {
    return { allowPublic: Boolean(config.allowPublic), header: String(config.header || "x-webhook-token").toLowerCase() };
  },
  async fetch() {
    return { items: [], cursor: "", meta: { push: true } };
  },
  parseHook({ req, secret, source }) {
    const header = String((source.config && source.config.header) || "x-webhook-token").toLowerCase();
    const provided = String(req.headers[header] || req.query.token || "");
    if (!secret || provided.length !== String(secret).length || provided !== String(secret)) {
      throw new Error("webhook token 无效");
    }
    const raw = Buffer.from(req.body || []).toString("utf8");
    if (raw.length > 256 * 1024) throw new Error("webhook body 超过 256KB");
    let data;
    try {
      data = JSON.parse(raw || "{}");
    } catch {
      data = { title: raw.slice(0, 200), body: raw };
    }
    const title = text(data.title || data.subject || "Webhook 消息", 200) || "Webhook 消息";
    const body = text(data.body || data.content || data.text || "", 20000);
    const url = text(data.url || data.link || "", 2000);
    const externalId = text(data.id || data.guid || "", 120) || hash(raw).slice(0, 24);
    return {
      externalId,
      title,
      url,
      summary: body.slice(0, 2000),
      content: body,
      author: text(data.author || data.from || "", 200),
      publishedAt: Number(data.publishedAt || data.timestamp || 0) || null,
      raw: raw.slice(0, 20000),
    };
  },
};
