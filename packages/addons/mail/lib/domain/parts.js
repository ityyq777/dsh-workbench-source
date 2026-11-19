import { newId, now } from "../db/db.js";
import { readBodyParts, readAttachment } from "../infra/parts.js";
import { classifyProbeError } from "./probe-error.js";

export function createParts({ db, account, password }) {
  const message = (id) => {
    const row = db.prepare("SELECT * FROM mail_message WHERE id=?").get(id);
    if (!row) throw new Error("邮件不存在：" + id);
    return row;
  };
  const attachments = id => db.prepare("SELECT id,filename,mime,size,section FROM mail_attachment WHERE message_id=? ORDER BY rowid").all(id);
  function unchanged(row) {
    const current = message(row.id);
    if (current.uid !== row.uid || current.uid_validity !== row.uid_validity || current.mailbox !== row.mailbox || current.account_id !== row.account_id) throw new Error("邮件位置已改变，请重新打开");
  }
  async function connection(msg) {
    if (!(msg.uid > 0 && msg.uid_validity > 0)) throw new Error("本地邮件没有可确认的远端身份，无法下载分段");
    const a = account(msg.account_id);
    let p;
    try { p = await password(a); }
    catch (e) { throw Object.assign(new Error(String(e.message || e)), { code: "EVAULT" }); }
    return { account: { host: a.imap_host, port: a.imap_port, secure: !!a.imap_tls, user: p.user }, secret: p.secret };
  }
  async function messageBody(input = {}) {
    const id = String(input.id || ""), row = message(id), existing = attachments(id);
    if (row.uid <= 0 || (!input.force && row.body_at && (!row.uid_validity || existing.every(a => a.section)))) {
      return { ok: true, cached: true, body: row.body, preview: row.preview, html: "", attachments: existing, truncated: !!row.body_truncated };
    }
    try {
      const parsed = await readBodyParts(await connection(row), row);
      unchanged(row);
      const preview = parsed.text.replace(/\s+/g, " ").trim().slice(0, 120);
      db.exec("SAVEPOINT mail_body_parts");
      try {
        db.prepare("UPDATE mail_message SET body=?,preview=?,body_truncated=?,body_at=?,updated_at=? WHERE id=?").run(parsed.text, preview, Number(parsed.truncated), now(), now(), id);
        const prior = new Map(attachments(id).map(a => [a.section, a]));
        db.prepare("DELETE FROM mail_attachment WHERE message_id=?").run(id);
        const insert = db.prepare("INSERT INTO mail_attachment(id,message_id,filename,mime,size,section) VALUES(?,?,?,?,?,?)");
        for (const a of parsed.attachments) {
          const old = prior.get(a.section);
          insert.run(old?.filename === a.filename && old.mime === a.mime && old.size === a.size ? old.id : newId("att"), id, a.filename, a.mime, a.size, a.section);
        }
        db.exec("RELEASE mail_body_parts");
      } catch (e) { db.exec("ROLLBACK TO mail_body_parts; RELEASE mail_body_parts"); throw e; }
      return { ok: true, cached: false, body: parsed.text, html: parsed.html, preview, attachments: attachments(id), truncated: parsed.truncated };
    } catch (e) {
      return { ok: false, errorClass: e.code === "EVAULT" ? "vault" : classifyProbeError(e), message: String(e.message || e).slice(0, 240) };
    }
  }
  async function attachmentDownload(input = {}) {
    const stored = db.prepare("SELECT * FROM mail_attachment WHERE id=?").get(String(input.id || ""));
    if (!stored?.section) throw new Error("附件不存在或索引过期，请重新下载正文");
    const row = message(stored.message_id);
    const file = await readAttachment(await connection(row), row, stored);
    unchanged(row);
    return file;
  }
  return { messageBody, attachmentDownload };
}
