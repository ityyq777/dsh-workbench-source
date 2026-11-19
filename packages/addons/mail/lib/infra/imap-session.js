import net from "node:net";
import tls from "node:tls";
import { once } from "node:events";

export function quote(s) {
  if (/[\r\n\0]/.test(String(s))) throw new Error("IMAP 参数含非法字符");
  return '"' + String(s).replace(/["\\]/g, "\\$&") + '"';
}
export function uid(n) {
  n = Number(n);
  if (!Number.isInteger(n) || n < 1 || n > 4294967295) throw new Error("IMAP UID 无效");
  return n;
}
// Read protocol lines and binary literals separately; body bytes cannot complete a command.
function channel(socket) {
  const iter = socket.iterator({ destroyOnReturn: false });
  let buf = Buffer.alloc(0),
    seq = 0;
  async function fill() {
    const { value, done } = await iter.next();
    if (done) throw new Error("IMAP 连接关闭");
    buf = buf.length ? Buffer.concat([buf, value]) : value;
  }
  async function line() {
    let i;
    while ((i = buf.indexOf("\r\n")) < 0) {
      if (buf.length > 8 * 1024 * 1024) throw new Error("IMAP 响应行过大");
      await fill();
    }
    const out = buf.toString("latin1", 0, i);
    buf = buf.subarray(i + 2);
    return out;
  }
  async function literal(n) {
    const parts = [];
    while (n) {
      if (!buf.length) await fill();
      const size = Math.min(buf.length, n);
      parts.push(buf.subarray(0, size));
      buf = buf.subarray(size);
      n -= size;
    }
    return Buffer.concat(parts);
  }
  async function command(cmd, { label = "请求", maxLiteralBytes = 1024 * 1024, continuations = [] } = {}) {
    if (/[\r\n\0]/.test(cmd)) throw new Error("IMAP 命令格式错误");
    const tag = "a" + ++seq;
    socket.write(tag + " " + cmd + "\r\n");
    let continuation = 0;
    const lines = [],
      literals = [];
    let total = 0,
      textBytes = 0;
    for (;;) {
      const text = await line();
      lines.push(text);
      textBytes += text.length + 2;
      if (textBytes > 16 * 1024 * 1024) throw new Error("IMAP 响应过大");
      if (/^\+(?: |$)/.test(text)) {
        if (continuation >= continuations.length) throw new Error("IMAP 请求了意外续传");
        socket.write(continuations[continuation++] + "\r\n");
        continue;
      }
      if (text.startsWith(tag + " ")) {
        if (!/^\S+ OK\b/i.test(text)) throw new Error("IMAP " + label + "失败");
        if (continuation !== continuations.length) throw new Error("IMAP 搜索请求未完整发送");
        return { lines, literals };
      }
      if (/^\* BYE\b/i.test(text)) throw new Error("IMAP 服务器关闭连接");
      const m = /\{(\d+)\}$/.exec(text);
      if (m) {
        const n = Number(m[1]);
        total += n;
        if (total > maxLiteralBytes)
          throw Object.assign(new Error("邮件内容超过单封上限"), {
            code: "EMBODYTOOLARGE",
            size: total,
            limit: maxLiteralBytes,
          });
        literals.push(await literal(n));
      }
    }
  }
  return {
    command,
    line,
    release: async () => {
      if (buf.length) throw new Error("STARTTLS 响应异常");
      await iter.return();
    },
  };
}
export async function withSession(account, password, fn) {
  const host = account.host,
    port = account.port;
  let socket;
  const timeout = () => socket.destroy(new Error("IMAP 连接超时"));
  const options = {
    host,
    port,
    servername: net.isIP(host) ? undefined : host,
    rejectUnauthorized: true,
    minVersion: "TLSv1.2",
  };
  try {
    socket = account.secure ? tls.connect(options) : net.connect({ host, port });
    socket.setTimeout(15000, timeout);
    await once(socket, account.secure ? "secureConnect" : "connect");
    let s = channel(socket);
    const greeting = await s.line();
    if (!/^\* (OK|PREAUTH)\b/i.test(greeting)) throw new Error("IMAP 问候失败");
    if (!account.secure) {
      await s.command("STARTTLS", { label: "STARTTLS 升级" });
      await s.release();
      socket = tls.connect({ ...options, socket });
      socket.setTimeout(15000, timeout);
      await once(socket, "secureConnect");
      s = channel(socket);
    }
    if (!account.secure || !/^\* PREAUTH\b/i.test(greeting))
      await s.command("LOGIN " + quote(account.user) + " " + quote(password), { label: "登录" });
    return await fn(s);
  } finally {
    socket?.destroy();
  }
}
export function withMailbox(account, password, mailbox, fn, expectedUidValidity, readOnly = false) {
  return withSession(account, password, async (s) => {
    const { lines } = await s.command((readOnly ? "EXAMINE " : "SELECT ") + quote(mailbox), { label: "打开文件夹" });
    const text = lines.join("\n");
    s.uidValidity = Number(/\[UIDVALIDITY (\d+)\]/i.exec(text)?.[1]);
    if (!s.uidValidity || (expectedUidValidity != null && s.uidValidity !== Number(expectedUidValidity)))
      throw new Error("文件夹 UIDVALIDITY 已变化或未知，请重新同步");
    const count = /^\* (\d+) EXISTS\b/im.exec(text);
    if (!count) throw new Error("IMAP 文件夹未返回邮件数");
    s.exists = Number(count[1]);
    return fn(s);
  });
}
