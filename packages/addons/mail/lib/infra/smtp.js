/** 最小 SMTP 客户端：隐式 TLS / STARTTLS、AUTH LOGIN、纯文本正文。 */
import { randomUUID } from "node:crypto";
import net from "node:net";
import tls from "node:tls";

function connect(host, port, secure, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const socket = secure ? tls.connect({ host, port, servername: host }) : net.connect({ host, port });
    const timer = setTimeout(() => { socket.destroy(); reject(new Error("SMTP 连接超时")); }, timeout);
    const onErr = (e) => { clearTimeout(timer); reject(e); };
    socket.once("error", onErr);
    socket.once(secure ? "secureConnect" : "connect", () => { clearTimeout(timer); socket.off("error", onErr); resolve(socket); });
  });
}

function reader(socket) {
  let buf = '', lines = [], pending = null, failure = null;
  const replies = [];
  function wake() {
    if (!pending || (!replies.length && !failure)) return;
    const { resolve, reject, timer } = pending; pending = null; clearTimeout(timer);
    if (replies.length) resolve(replies.shift()); else reject(failure);
  }
  function fail(e) { failure = failure || e; wake(); }
  function data(chunk) {
    buf += chunk.toString('utf8');
    let idx;
    while ((idx = buf.indexOf('\r\n')) >= 0) {
      const line = buf.slice(0,idx); buf = buf.slice(idx+2);
      const m = /^(\d{3})([- ]|$)/.exec(line);
      if (!m || (lines.length && !lines[0].startsWith(m[1]))) { fail(new Error('SMTP 多行响应格式错误')); return; }
      lines.push(line);
      if (m[2] !== '-') { replies.push(lines); lines = []; wake(); }
    }
  }
  const close = () => fail(new Error('SMTP 连接关闭'));
  socket.on('data',data).on('error',fail).on('close',close);
  const read = (timeout=15000) => new Promise((resolve,reject) => {
    const timer = setTimeout(() => { pending = null; reject(new Error('SMTP 响应超时')); },timeout);
    pending = {resolve,reject,timer}; wake();
  });
  read.detach = () => socket.off('data',data).off('error',fail).off('close',close);
  return read;
}

function code(batch) {
  if (!batch || !batch.length) return 0;
  const last = batch[batch.length - 1] || "";
  const m = /^(\d{3})/.exec(last);
  return m ? Number(m[1]) : 0;
}

async function expect(read, ok, label) {
  const batch = await read();
  const c = code(batch);
  if (!ok.includes(c)) throw new Error(label + " 失败：" + (batch || []).join(" | "));
  return batch;
}

/**
 * 只做「连得上 + 认证得过」的探测：走到 AUTH LOGIN 成功就 QUIT，不发信。
 * 保存前的自检用它，避免为了验证凭据真的发一封邮件出去。
 */
export async function probeSmtp(account, password, timeout = 15000) {
  let socket = await connect(account.host, account.port, !!account.secure, timeout);
  let read = reader(socket);
  const cmd = async (line, ok, label) => { socket.write(line + "\r\n"); return expect(read, ok, label); };
  try {
    await expect(read, [220], "SMTP 问候");
    let ehlo = await cmd("EHLO dsh-workbench", [250], "EHLO");
    if (!account.secure) {
      const caps = (ehlo || []).join("\n").toUpperCase();
      if (!caps.includes("STARTTLS")) throw new Error("服务器不支持 STARTTLS");
      await cmd("STARTTLS", [220], "STARTTLS");
      read.detach();
      socket = tls.connect({ socket, servername: account.host });
      read = reader(socket);
      ehlo = await cmd("EHLO dsh-workbench", [250], "EHLO(TLS)");
    }
    const caps = (ehlo || []).join("\n").toUpperCase();
    let auth = false;
    if (caps.includes("AUTH") && account.user) {
      await cmd("AUTH LOGIN", [334], "AUTH LOGIN");
      await cmd(Buffer.from(account.user).toString("base64"), [334], "SMTP 用户名");
      await cmd(Buffer.from(password || "").toString("base64"), [235], "SMTP 密码");
      auth = true;
    }
    try { await cmd("QUIT", [221], "QUIT"); } catch { /* 忽略 */ }
    return { ok: true, auth };
  } finally {
    socket.destroy();
  }
}

export async function sendMail(account, password, msg) {
  let socket = await connect(account.host, account.port, !!account.secure);
  let read = reader(socket);
  try {
  await expect(read, [220], "SMTP 问候");
  const cmd = async (line, ok, label) => { socket.write(line + "\r\n"); return expect(read, ok, label); };
  let ehlo = await cmd("EHLO dsh-workbench", [250], "EHLO");
  if (!account.secure) {
    const caps = (ehlo || []).join("\n").toUpperCase();
    if (!caps.includes("STARTTLS")) throw new Error("服务器不支持 STARTTLS");
    await cmd("STARTTLS", [220], "STARTTLS");
    read.detach();
      socket = tls.connect({ socket, servername: account.host });
    read = reader(socket);
    ehlo = await cmd("EHLO dsh-workbench", [250], "EHLO(TLS)");
  }
  const caps = (ehlo || []).join("\n").toUpperCase();
  if (caps.includes("AUTH") && account.user) {
    await cmd("AUTH LOGIN", [334], "AUTH LOGIN");
    await cmd(Buffer.from(account.user).toString("base64"), [334], "SMTP 用户名");
    await cmd(Buffer.from(password || "").toString("base64"), [235], "SMTP 密码");
  }
  const from = msg.from || account.user;
  const addressOK = (addr) => /^[^\s<>,;@\x00-\x1f]+@[^\s<>,;@\x00-\x1f]+$/.test(addr);
  if (![from, ...msg.to, ...(msg.cc || [])].every(addressOK)) { socket.destroy(); throw new Error('邮箱地址格式无效'); }
  await cmd("MAIL FROM:<" + from + ">", [250], "MAIL FROM");
  for (const addr of [].concat(msg.to || [], msg.cc || []).filter(Boolean)) await cmd("RCPT TO:<" + addr + ">", [250, 251], "RCPT TO");
  await cmd("DATA", [354], "DATA");
  const { data, messageId } = encodeMessage(from, msg);
  socket.write(data + '.\r\n');
  await expect(read, [250], "DATA 结束");
  try { await cmd("QUIT", [221], "QUIT"); } catch { /* 忽略 */ }
  return { sent: true, messageId };
  } finally { socket.destroy(); }
}

export function encodeMessage(from, msg) {
  const messageId = '<' + randomUUID() + '@dsh-workbench>';
  const validId = /^<[^<>@\s\x00-\x1f]+@[^<>@\s\x00-\x1f]+>$/;
  const refs = String(msg.references || '').split(/ +/).filter(id => validId.test(id));
  const headers = [
    'Message-ID: ' + messageId,
    validId.test(msg.inReplyTo) ? 'In-Reply-To: ' + msg.inReplyTo : '',
    refs.length ? 'References: ' + refs.join('\r\n ') : '',
    'From: ' + from, 'To: ' + msg.to.join(', '), msg.cc && msg.cc.length ? 'Cc: ' + msg.cc.join(', ') : '',
    'Subject: =?UTF-8?B?' + Buffer.from(msg.subject || '(无主题)').toString('base64') + '?=',
    'Date: ' + new Date().toUTCString(), 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=utf-8', 'Content-Transfer-Encoding: base64',
  ];
  const body = Buffer.from(msg.text || '').toString('base64').match(/.{1,76}/g) || [];
  return { messageId, data: headers.filter(Boolean).join('\r\n') + '\r\n\r\n' + body.join('\r\n') + '\r\n' };
}
