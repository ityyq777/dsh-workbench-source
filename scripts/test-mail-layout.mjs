/**
 * 邮件列表页布局自检：messages.cjs 里用到的每个 wbml-* 类都必须在样式表里存在，
 * 顺带钉住三栏栅格、吸顶列表头、同步按钮禁用与「点击即出详情」的接线。
 * 这是为了防止再次出现“写了类名但从没写过样式”。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

import { DatabaseSync } from "node:sqlite";
import { ensureSchema } from "../packages/addons/mail/lib/db/db.js";
import { listMessages } from "../packages/addons/mail/lib/domain/list.js";
const require = createRequire(import.meta.url);
const root = process.cwd();
const viewFile = path.join(root, "packages/addons/mail/client/views/messages.cjs");
const view = fs.readFileSync(viewFile, "utf8");
const css = require(path.join(root, "packages/addons/mail/client/ui/styles.cjs"));
const styleText = Array.isArray(css) ? css.join("\n") : String(css);

function classesIn(text) {
  const out = new Set();
  const re = /\bwbml-[a-z0-9-]+/g;
  let m;
  while ((m = re.exec(text))) out.add(m[0]);
  return out;
}

function selectorsIn(cssText) {
  const out = new Set();
  const re = /\.(wbml-[a-z0-9-]+)/g;
  let m;
  while ((m = re.exec(cssText))) out.add(m[1]);
  return out;
}

test("messages.cjs 用到的 wbml-* 类都有样式规则", () => {
  const used = [...classesIn(view)].sort();
  const styled = selectorsIn(styleText);
  const missing = used.filter((c) => !styled.has(c));
  assert.deepEqual(missing, [], "缺样式的类：" + missing.join(", "));
});

test("样式表是三栏栅格 + 900px 单列降级", () => {
  assert.match(styleText, /\.wbml-layout\{[^}]*grid-template-columns:300px minmax\(0,1fr\)/);
  assert.match(styleText, /\.wbml-layout\.has-detail\{[^}]*minmax\(360px,520px\)/);
  assert.match(styleText, /@media \(max-width:900px\)\{[\s\S]{0,600}?\.wbml-layout/);
  assert.match(styleText, /\.wbml-pane-head\{[^}]*position:sticky/);
  assert.match(styleText, /\.wbml-list-row\.unread::before\{[^}]*var\(--wb-accent/);
  // 新增的布局块只走 --wb-* token：掐出这一段，去掉 var() 的兜底色后不应再有硬编码色
  const start = styleText.indexOf(".wbml-layout{");
  const end = styleText.indexOf("@media (max-width:1180px)");
  assert.ok(start > 0 && end > start, "布局样式块定位失败");
  const block = styleText.slice(start, end).replace(/var\([^)]*\)/g, "");
  assert.deepEqual(block.match(/#[0-9a-fA-F]{3,8}/g) || [], []);
});

test("本地游标跨三页，同日同秒与期间新到邮件不会造成漏信或重信", () => {
  const db = new DatabaseSync(":memory:");
  ensureSchema(db);
  const insert = db.prepare(
    "INSERT INTO mail_message (id,account_id,mailbox,uid,date_at,flags,subject,created_at,updated_at) VALUES(?,?,?,?,?,?,?,1,1)",
  );
  for (let uid = 1; uid <= 120; uid++) insert.run("m" + uid, "a", "INBOX", uid, 1000, uid % 2 ? "" : "\\Seen", "100%_");
  insert.run("other", "b", "Archive", 1, 1001, "", "100xy");
  const query = { accountId: "a", mailbox: "INBOX", q: "%_", limit: 50 };
  const first = listMessages(db, query);
  assert.equal(first.items.length, 50);
  assert.throws(() => listMessages(db, { ...query, unread: true, cursor: first.nextCursor }), /游标/);
  insert.run("new", "a", "INBOX", 121, 1002, "", "100%_");
  const second = listMessages(db, { ...query, cursor: first.nextCursor });
  const last = listMessages(db, { ...query, cursor: second.nextCursor });
  assert.equal(second.items.length, 50);
  assert.equal(last.items.length, 20);
  assert.equal(last.hasMore, false);
  assert.equal(last.nextCursor, null);
  assert.equal(new Set([...first.items, ...second.items, ...last.items].map((m) => m.id)).size, 120);
  assert.equal(listMessages(db, { ...query, unread: true, limit: 200 }).items.length, 61);
  assert.throws(() => listMessages(db, { cursor: "garbage" }), /游标/);
  db.close();
});

test("消息页：真实控件事件调用、三栏结构、切换和正文竞态", async () => {
  const Messages = require(viewFile),
    common = require("../packages/addons/mail/client/ui/common.cjs");
  const h = (type, props, ...kids) => ({
    type,
    props: props || {},
    kids: kids.flat(Infinity).filter((x) => x != null),
  });
  const walk = (n) => (typeof n === "object" && n ? [n, ...n.kids.flatMap(walk)] : []);
  const nodes = (n) => walk(tree).filter((x) => x.props.className?.includes(n));
  const button = (s) => walk(tree).find((x) => x.type === common.Btn && x.kids.includes(s));
  let idx = 0,
    slots = [],
    calls = [],
    release,
    tree;
  const React = {
    useState(v) {
      const i = idx++;
      if (!(i in slots)) slots[i] = v;
      return [slots[i], (x) => (slots[i] = typeof x === "function" ? x(slots[i]) : x)];
    },
    useRef(v) {
      const i = idx++;
      return (slots[i] ||= { current: v });
    },
    useEffect() {},
    Fragment: Symbol(),
  };
  const items = [1, 2].map((i) => ({
    id: "m" + i,
    uid: i,
    subject: "S" + i,
    accountId: "a",
    mailbox: "INBOX",
    flags: i === 1 ? "" : "\\Seen",
    fromName: "Alice",
    from: "a@test",
  }));
  const api = {
    async call(n, a) {
      calls.push([n, a]);
      if (n === "mail.messageGet") return items.find((m) => m.id === a.id);
      if (n === "mail.messageBody")
        return a.id === "m1" ? new Promise((r) => (release = r)) : { ok: true, body: "second", attachments: [] };
      if (n === "mail.sync") return { nextBeforeUid: 33, uidValidity: 99, fetched: 2, inserted: 1 };
      return {};
    },
  };
  const prev = common.useLoad;
  common.useLoad = (_R, _api, n, a) => {
    calls.push([n, a]);
    return {
      refresh() {},
      data:
        n === "mail.messageList"
          ? { items, hasMore: !a.cursor, nextCursor: "next" }
          : { items: [{ id: "a", name: "Archive", account_id: "a" }] },
    };
  };
  const settle = async () => {
    for (let i = 0; i < 12; i++) await Promise.resolve();
  };
  try {
    const outer = Messages({ h, React, api });
    let account = "";
    slots = [];
    const render = () => {
      idx = 0;
      tree = outer.type({ ...outer.props, accountId: [account, () => {}] });
    };
    render();
    assert.ok(button("同步最新邮件").props.disabled);
    account = "a";
    slots = [];
    render();
    assert.ok(!button("同步最新邮件").props.disabled);
    button("同步最新邮件").props.onClick();
    await settle();
    render();
    button("从服务器加载更早邮件").props.onClick();
    await settle();
    render();
    assert.deepEqual(calls.filter(([n]) => n === "mail.sync").at(-1)[1], {
      id: "a",
      mailbox: "INBOX",
      limit: 50,
      beforeUid: 33,
      uidValidity: 99,
    });
    const rows = nodes("wbml-list-row");
    assert.ok(rows[0].props.className.includes("unread"));
    assert.ok(!rows[1].props.className.includes("unread"));
    rows[0].props.onClick();
    render();
    const layout = nodes("wbml-layout")[0];
    assert.ok(layout.kids.includes(nodes("wbml-listpane")[0]) && layout.kids.includes(nodes("wbml-detailpane")[0]));
    await settle();
    render();
    nodes("wbml-list-row")[1].props.onClick();
    await settle();
    release({ ok: true, body: "first" });
    await settle();
    render();
    assert.deepEqual(nodes("wbml-body").find((x) => x.type === "pre").kids, ["second"]);
    button("下一页").props.onClick();
    render();
    assert.equal(nodes("wbml-detailpane").length, 0);
    assert.equal(calls.filter(([n]) => n === "mail.messageList").at(-1)[1].cursor, "next");
    const checkbox = walk(tree).find((x) => x.props.type === "checkbox");
    checkbox.props.onChange({ target: { checked: true } });
    render();
    const args = calls.filter(([n]) => n === "mail.messageList").at(-1)[1];
    assert.equal(args.unread, true);
    assert.equal(args.cursor, undefined);
    assert.doesNotMatch(view, /dangerouslySetInnerHTML|innerHTML/);
  } finally {
    common.useLoad = prev;
  }
});
