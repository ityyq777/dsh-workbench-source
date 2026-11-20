/**
 * 信头解码回归：RFC 2047（B/Q、多段拼接、GBK/Big5/UTF-8、未知 charset）与地址拆分。
 * 同时验证写入侧（parseHeaders）、老库 migration 与历史行回填。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";

const { decodeWords, decodeWordsInfo, hasEncodedWord, parseAddress, displayName } = await import(
  "../packages/addons/mail/lib/infra/mime-word.js"
);
const { parseHeaders } = await import("../packages/addons/mail/lib/infra/imap.js");
const { ensureSchema, messageRow } = await import("../packages/addons/mail/lib/db/db.js");
const { createMail } = await import("../packages/addons/mail/lib/domain/mail.js");

const gbkChinese = Buffer.from([0xd6, 0xd0, 0xce, 0xc4]).toString("base64"); // 「中文」
const utf8Hello = Buffer.from("你好").toString("base64");

test("RFC 2047：B 编码 GBK / UTF-8 都能解成中文", () => {
  assert.equal(decodeWords("=?gbk?B?" + gbkChinese + "?="), "中文");
  assert.equal(decodeWords("=?GBK?B?" + gbkChinese + "?="), "中文");
  assert.equal(decodeWords("=?UTF-8?B?" + utf8Hello + "?="), "你好");
  assert.equal(decodeWords("=?utf-8?b?" + utf8Hello + "?="), "你好");
});

test("RFC 2047：Q 编码、下划线转空格、=XX 转义", () => {
  assert.equal(decodeWords("=?utf-8?Q?=E4=BD=A0=E5=A5=BD?="), "你好");
  assert.equal(decodeWords("=?utf-8?Q?hello_world?="), "hello world");
  assert.equal(decodeWords("=?iso-8859-1?Q?caf=E9?="), "café");
});

test("RFC 2047：相邻多段编码只拼接、不丢内部空格", () => {
  const qq = "=?utf-8?Q?=E4=BD=A0=E5=A5=BD_?= =?utf-8?Q?=E4=B8=96=E7=95=8C?=";
  assert.equal(decodeWords(qq), "你好 世界");
  assert.equal(decodeWords("=?utf-8?B?" + utf8Hello + "?= =?utf-8?B?" + utf8Hello + "?="), "你好你好");
  // 多段之间允许折行空白（信头折叠）
  assert.equal(decodeWords("=?utf-8?B?" + utf8Hello + "?=\r\n =?utf-8?B?" + utf8Hello + "?="), "你好你好");
});

test("RFC 2047：纯文本前缀与未知 charset 保留原串、不抛错", () => {
  assert.equal(decodeWords("[ACTION REQUIRED] =?utf-8?B?" + utf8Hello + "?="), "[ACTION REQUIRED] 你好");
  const raw = "=?x-unknown?B?" + gbkChinese + "?=";
  const info = decodeWordsInfo(raw);
  assert.equal(info.text, raw);
  assert.deepEqual(info.unknown, ["x-unknown"]);
  assert.equal(decodeWords(raw), raw);
  assert.equal(hasEncodedWord("=?utf-8?B?" + utf8Hello + "?="), true);
  assert.equal(hasEncodedWord("普通主题"), false);
});

test("地址：三种形式 + 引号 + 编码名 + 名称等于地址时降级", () => {
  assert.deepEqual(parseAddress('"Steam Support" <noreply@steampowered.com>'), { name: "Steam Support", address: "noreply@steampowered.com" });
  assert.deepEqual(parseAddress("GitHub <noreply@github.com>"), { name: "GitHub", address: "noreply@github.com" });
  assert.deepEqual(parseAddress("12306@rails.com.cn"), { name: "", address: "12306@rails.com.cn" });
  assert.deepEqual(parseAddress("=?utf-8?B?" + utf8Hello + "?= <a@b.com>"), { name: "你好", address: "a@b.com" });
  assert.equal(displayName(parseAddress('"Steam Support" <noreply@steampowered.com>')), "Steam Support");
  assert.equal(displayName(parseAddress("12306@rails.com.cn")), "12306@rails.com.cn");
  const dup = parseAddress('"12306@rails.com.cn" <12306@rails.com.cn>');
  assert.equal(displayName(dup), "12306@rails.com.cn");
  assert.equal(displayName(parseAddress("")), "");
});

test("写入侧：parseHeaders 产出解码主题与拆好的发件人", () => {
  const subject = "=?gbk?B?" + gbkChinese + "?= 通知";
  const head = [
    "Subject: " + subject,
    "From: " + "=?utf-8?B?" + utf8Hello + "?= <noreply@rails.com.cn>",
    "To: =?gbk?B?" + gbkChinese + "?= <me@test>",
    "Date: Tue, 17 Nov 2026 10:00:00 +0800",
  ].join("\r\n");
  const block = head + "\r\n\r\n";
  const text = "* 1 FETCH (UID 42 BODY[HEADER.FIELDS (SUBJECT FROM TO CC DATE)] {" + Buffer.byteLength(block) + "}\r\n" + block + ")\r\n";
  const items = parseHeaders(text);
  assert.equal(items.length, 1);
  assert.equal(items[0].uid, 42);
  assert.equal(items[0].subject, "中文 通知");
  assert.equal(items[0].from, "noreply@rails.com.cn");
  assert.equal(items[0].fromName, "你好");
  assert.ok(items[0].to.indexOf("中文") >= 0);
});

test("老库 migration：缺 from_name 时补列，messageRow 透出 fromName", () => {
  const db = new DatabaseSync(":memory:");
  db.exec(
    "CREATE TABLE mail_message (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, mailbox TEXT NOT NULL, uid INTEGER NOT NULL, message_id TEXT NOT NULL DEFAULT '', subject TEXT NOT NULL DEFAULT '', from_addr TEXT NOT NULL DEFAULT '', to_addr TEXT NOT NULL DEFAULT '', cc_addr TEXT NOT NULL DEFAULT '', date_at INTEGER NOT NULL, preview TEXT NOT NULL DEFAULT '', body TEXT NOT NULL DEFAULT '', flags TEXT NOT NULL DEFAULT '', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)",
  );
  ensureSchema(db);
  const cols = db.prepare("PRAGMA table_info(mail_message)").all().map((c) => c.name);
  assert.ok(cols.indexOf("from_name") >= 0);
  db.prepare("INSERT INTO mail_message (id,account_id,mailbox,uid,from_addr,from_name,date_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)").run("m1", "a1", "INBOX", 1, "x@y.z", "X", 1, 1, 1);
  const row = messageRow(db.prepare("SELECT * FROM mail_message WHERE id='m1'").get());
  assert.equal(row.from, "x@y.z");
  assert.equal(row.fromName, "X");
});

test("历史行回填：解主题、把发件人拆成地址 + 名称，且重复调用不再改", () => {
  const db = new DatabaseSync(":memory:");
  ensureSchema(db);
  const host = { call: async () => ({ result: { secret: "pw" } }) };
  const m = createMail({ db, host, log: () => {} });
  db.prepare("INSERT INTO mail_account (id,name,email,imap_host,smtp_host,created_at,updated_at) VALUES (?,?,?,?,?,?,?)").run("acc", "历史账户", "me@test", "imap.test", "smtp.test", 1, 1);
  db.prepare(
    "INSERT INTO mail_message (id,account_id,mailbox,uid,subject,from_addr,to_addr,date_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
  ).run("old1", "acc", "INBOX", 7, "=?gbk?B?" + gbkChinese + "?=", '"12306@rails.com.cn" <12306@rails.com.cn>', "=?gbk?B?" + gbkChinese + "?= <me@test>", 1000, 1000, 1000);
  assert.equal(m.backfillHeaders(), 1);
  const row = messageRow(db.prepare("SELECT * FROM mail_message WHERE id='old1'").get());
  assert.equal(row.subject, "中文");
  assert.equal(row.from, "12306@rails.com.cn");
  assert.equal(row.fromName, "12306@rails.com.cn");
  assert.ok(row.to.indexOf("中文") >= 0);
  assert.equal(m.backfillHeaders(), 0, "第二次不应再改");
  assert.equal(m.messages({}).items[0].hasAttachment, null);
  db.prepare("INSERT INTO mail_attachment (id,message_id,filename) VALUES (?,?,?)").run("att1", "old1", "report.pdf");
  assert.equal(m.messages({}).items[0].hasAttachment, true);
  assert.equal(m.messages({}).items[0].fromName, "12306@rails.com.cn");
});
