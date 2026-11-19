import { withMailbox } from "./imap-session.js";
import { describeParts, fetchValue } from "./parts-structure.js";
import { decodePartText, decodeTransfer, htmlToText } from "./mime.js";

const MAX_TEXT_TRANSFER = 1024 * 1024;
const MAX_ATTACHMENT_TRANSFER = 32 * 1024 * 1024;
const MAX_TEXT_CHARS = 200000;

async function withStructure(conn, msg, fn) {
  const uid = Number(msg.uid);
  if (!Number.isSafeInteger(uid) || uid < 1) throw new Error("邮件没有有效远端 UID");
  if (!(Number(msg.uid_validity) > 0)) throw new Error("缺少 UIDVALIDITY，请先同步邮件所在文件夹");
  return withMailbox(conn.account, conn.secret, msg.mailbox, async (s) => {
    const response = await s.command(`UID FETCH ${uid} (UID BODYSTRUCTURE)`, { maxLiteralBytes: 256 * 1024, label: "取得邮件结构" });
    const parts = describeParts(fetchValue(response, uid, "BODYSTRUCTURE"));
    return fn(parts, async (part, max) => {
      const partial = part.size > max;
      const response = await s.command(`UID FETCH ${uid} (UID BODY.PEEK[${part.section}]${partial ? `<0.${max}>` : ""})`, { maxLiteralBytes: max, label: "读取邮件分段" });
      const val = fetchValue(response, uid, `BODY[${part.section}]${partial ? "<0>" : ""}`);
      if (val == null || Array.isArray(val)) throw new Error("分段不存在，请重新同步");
      const bytes = Buffer.isBuffer(val) ? val : Buffer.from(val, "latin1");
      if (bytes.length !== Math.min(max, part.size)) throw new Error("分段长度与服务器声明不符，请重新下载");
      return bytes;
    });
  }, Number(msg.uid_validity) || undefined);
}

export function readBodyParts(conn, msg) {
  return withStructure(conn, msg, async (parts, fetch) => {
    const attachments = parts.filter(p => !p.text);
    let budget = MAX_TEXT_TRANSFER, truncated = false;
    const text = [], html = [];
    const textParts = parts.filter(p => p.text).sort((a,b) => Number(a.mime === 'text/html') - Number(b.mime === 'text/html'));
    for (const p of textParts) {
      if (!budget) { truncated = true; break; }
      const bytes = await fetch(p, budget);
      truncated ||= bytes.length < p.size;
      budget -= bytes.length;
      (p.mime === 'text/html' ? html : text).push(decodePartText(p, bytes));
    }
    const htmlText = html.join("\n");
    const full = text.join("\n\n").trim() || htmlToText(htmlText);
    return { text: full.slice(0, MAX_TEXT_CHARS), html: htmlText.slice(0, MAX_TEXT_CHARS), attachments, truncated: truncated || full.length > MAX_TEXT_CHARS };
  });
}

export function readAttachment(conn, msg, stored) {
  return withStructure(conn, msg, async (parts, fetch) => {
    const part = parts.find(p => !p.text && p.section === stored.section && p.mime === stored.mime && p.filename === stored.filename && p.size === stored.size);
    if (!part) throw new Error("附件结构已改变，请重新下载正文再保存");
    if (part.size > MAX_ATTACHMENT_TRANSFER) throw new Error("单附件超过 32 MiB 传输上限，请在原邮箱下载");
    if (!/^(7bit|8bit|binary|base64|quoted-printable)$/i.test(part.encoding)) throw new Error("未知附件传输编码，无法保证文件完整");
    const bytes = decodeTransfer(await fetch(part, MAX_ATTACHMENT_TRANSFER), part.encoding);
    return { filename: part.filename, mime: part.mime, base64: bytes.toString("base64"), size: bytes.length };
  });
}
