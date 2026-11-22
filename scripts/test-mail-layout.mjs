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
const rowFile = path.join(root, "packages/addons/mail/client/views/message-rows.cjs");
const view = fs.readFileSync(viewFile, "utf8");
const rowView = fs.readFileSync(rowFile, "utf8");
const css = require(path.join(root, "packages/addons/mail/client/ui/styles.cjs"));
const SW = require(path.join(root, "packages/addons/lib/switch.cjs"));
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

test("messages.cjs 与 message-rows.cjs 用到的 wbml-* 类都有样式规则", () => {
  const used = [...classesIn(view + "\n" + rowView)].sort();
  const styled = selectorsIn(styleText);
  const missing = used.filter((c) => !styled.has(c));
  assert.deepEqual(missing, [], "缺样式的类：" + missing.join(", "));
});

test("样式表是三栏栅格 + 900px 单列降级", () => {
  assert.match(styleText, /\.wbml-layout\{[^}]*grid-template-columns:300px minmax\(0,1fr\)/);
  assert.match(styleText, /\.wbml-layout\.has-detail\{[^}]*minmax\(360px,520px\)/);
  assert.match(styleText, /@media \(max-width:900px\)\{[\s\S]{0,600}?\.wbml-layout/);
  assert.match(styleText, /\.wbml-pane-head\{[^}]*position:sticky/);
  // 未读/已读不再靠左侧色条，改由状态图标 + 字重 + 颜色三重线索区分
  assert.match(styleText, /\.wbml-st\{[^}]*color:var\(--wb-accent/);
  assert.match(styleText, /\.wbml-list-row\.read \.wbml-st\{[^}]*var\(--wb-muted/);
  assert.match(styleText, /\.wbml-list-row\.unread \.wbml-sender,\.wbml-list-row\.unread \.wbml-subject\{[^}]*font-weight:650/);
  assert.match(styleText, /\.wbml-list-row\.read \.wbml-sender,\.wbml-list-row\.read \.wbml-subject\{[^}]*font-weight:400[^}]*color-mix\(in srgb,currentColor 72%,transparent\)/);
  // 三套行栅格（窄屏两行、中等三列、≥620px 四列）都留出了图标列
  const grids = styleText.match(/grid-template-areas:("{1}|')st /g) || [];
  assert.equal(grids.length, 3, "三套行栅格都要有 st 图标区");
  // 新增的布局块只走 --wb-* token：掐出这一段，去掉 var() 的兜底色后不应再有硬编码色
  const start = styleText.indexOf(".wbml-layout{");
  const end = styleText.indexOf("@media (max-width:1180px)");
  assert.ok(start > 0 && end > start, "布局样式块定位失败");
  const block = styleText.slice(start, end).replace(/var\([^)]*\)/g, "");
  assert.deepEqual(block.match(/#[0-9a-fA-F]{3,8}/g) || [], []);
});

test("邮件行按本地日历显示短日期并优先展示读信发现的附件名", () => {
  const rows = require("../packages/addons/mail/client/views/message-rows.cjs");
  const h = (type, props, ...kids) => ({type, props, kids});
  const now = new Date(2026, 5, 2, 0, 1);
  const items = [now, new Date(2026,5,1,23,59), new Date(2026,4,1), new Date(2025,11,31), NaN].map((date,id) => ({id, dateAt:+date}));
  const opts = {lang:"zh", now, attachmentUpdates:new Map([[0,{hasAttachment:true,attachmentName:"车票.pdf"}]]), sender:()=>"", senderDetail:()=>"", isUnread:()=>false};
  const buttons = rows(h, items, opts).filter(r => r.type === "button");
  assert.deepEqual(buttons.map(r => r.kids.find(k => k?.type === "time").kids[0]), ["00:01", "昨天 23:59", "5/1", "2025/12/31", "—"]);
  assert.equal(buttons[0].kids.find(k => k?.props?.className === "wbml-attachment").kids[1].kids[0], "车票.pdf");
});

test("本地游标跨三页，同日同秒与期间新到邮件不会造成漏信或重信", () => {
  const db = new DatabaseSync(":memory:");
  ensureSchema(db);
  const account = db.prepare("INSERT INTO mail_account (id,name,email,imap_host,smtp_host,created_at,updated_at) VALUES(?,?,?,'imap.test','smtp.test',1,1)");
  for (const id of ['a', 'b']) account.run(id, id, id + '@test');
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
  // 共享控件（icons.label）内部的 h 来自 react，children 在 props 上而不是 kids；
  // 边走边把两种形状都摊平，否则 walk 会在 .flatMap 上抛错（历史遗留的假失败）。
  const kidsOf = (n) => Array.isArray(n.kids) ? n.kids : Array.isArray(n.props?.children) ? n.props.children : n.props?.children != null ? [n.props.children] : [];
  const walk = (n) => (typeof n === "object" && n ? [n, ...kidsOf(n).flatMap(walk)] : []);
  const nodes = (n) => walk(tree).filter((x) => x.props.className?.includes(n));
  const text = (n) => typeof n === "string" ? n : n?.kids?.map(text).join("") || "";
  const button = (s) => walk(tree).find((x) => x.type === common.Btn && text(x) === s);
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
    accountName: "工作邮箱",
    dateAt: new Date(2026, 9, 20 - i, 9, 35).getTime(),
    hasAttachment: i === 1 ? true : null,
  }));
  const api = {
    async call(n, a) {
      calls.push([n, a]);
      if (n === "mail.messageGet") return items.find((m) => m.id === a.id);
      if (n === "mail.messageBody")
        return a.id === "m1" ? new Promise((r) => (release = r)) : { ok: true, body: "second", attachments: [] };
      if (n === "mail.sync") return { nextBeforeUid: 33, uidValidity: 99, fetched: 2, inserted: 1 };
      // 配置决定每次抓取封数与「打开即标已读」：默认 20 封、自动已读开着。
      if (n === "mail.configGet")
        return { domain: "mail", items: [], groups: [], values: { "images.remote": true, "display.html": true, "read.autoSeen": true, "list.pageSize": 20 }, overrides: {} };
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
    assert.deepEqual(nodes("wbml-list-row").map((row) => row.props["data-mail-id"]), ["m1", "m2"]);
    assert.equal(nodes("wbml-date-group").length, 2, "跨本地日期分组");
    assert.ok(nodes("wbml-list-row").every((row) => text(row).includes("工作邮箱")), "汇总列表标识来源");
    assert.equal(nodes("wbml-time").length, 2);
    assert.ok(nodes("wbml-time").every((node) => node.props.dateTime && node.props.title), "短日期保留完整时间");
    assert.equal(calls.filter(([name]) => name === "mail.messageBody").length, 0, "列表不预下载正文");
    const syncIcon = walk(button("同步最新邮件")).find((n) => n.props["aria-hidden"] === true);
    assert.equal(syncIcon?.props.size, 14);
    assert.equal(syncIcon?.props.focusable, false);
    account = "a";
    slots = [];
    render();
    assert.ok(!button("同步最新邮件").props.disabled);
    assert.ok(nodes("wbml-list-row").every((row) => !text(row).includes("工作邮箱")), "指定账户隐藏重复来源");
    // 行首的状态图标每行都有，这里的「附件图标」只看 wbml-attachment 内的 lucide 组件
    const hasClip = (row) => walk(row).some((node) => node.props?.className === "wbml-attachment" &&
      walk(node).some((kid) => typeof kid.type === "object" && kid.type?.$$typeof === Symbol.for("react.forward_ref")));
    assert.deepEqual(nodes("wbml-list-row").map(hasClip), [true, false], "仅缓存确认有附件的邮件展示图标");
    button("同步最新邮件").props.onClick();
    await settle();
    render();
    button("从服务器加载更早邮件").props.onClick();
    await settle();
    render();
    assert.deepEqual(calls.filter(([n]) => n === "mail.sync").at(-1)[1], {
      id: "a",
      mailbox: "INBOX",
      limit: 20, // 配置默认每次 20 封
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
    const expandButton = () => walk(tree).find(n => n.type === "button" && n.props.className?.includes("wbml-expand"));
    const oldBodyRequests = calls.filter(([name]) => name === "mail.messageBody").length;
    expandButton().props.onClick();
    render();
    assert.equal(expandButton().props["aria-pressed"], true);
    assert.match(nodes("wbml-detailpane")[0].props.className, /is-expanded/);
    assert.equal(calls.filter(([name]) => name === "mail.messageBody").length, oldBodyRequests);
    assert.ok(button("上一封").props.disabled);
    assert.ok(!button("下一封").props.disabled);
    button("下一封").props.onClick();
    await settle();
    release({ ok: true, body: "first" });
    await settle();
    render();
    assert.deepEqual(nodes("wbml-body").find((x) => x.type === "pre").kids, ["second"]);
    assert.equal(expandButton().props["aria-pressed"], true);
    button("返回列表").props.onClick();
    render();
    assert.equal(nodes("wbml-detailpane").length, 0);
    nodes("wbml-list-row")[1].props.onClick();
    render();
    assert.equal(expandButton().props["aria-pressed"], false);
    button("下一页").props.onClick();
    render();
    assert.equal(nodes("wbml-detailpane").length, 0);
    assert.equal(calls.filter(([n]) => n === "mail.messageList").at(-1)[1].cursor, "next");
    // 「只看未读」是共享开关组件：这个轻量渲染器不展函数组件，
    // 先取出组件节点再渲染成按钮，然后触发按钮的 onClick。
    const sw = walk(tree).find((x) => x.type === SW.Switch);
    assert.ok(sw, "只看未读应渲染成共享开关");
    SW.Switch(sw.props).props.onClick({ preventDefault: function () {} });
    render();
    const args = calls.filter(([n]) => n === "mail.messageList").at(-1)[1];
    assert.equal(args.unread, true);
    assert.equal(args.cursor, undefined);
    assert.doesNotMatch(view, /dangerouslySetInnerHTML|innerHTML/);
  } finally {
    common.useLoad = prev;
  }
});

test("未读行用闭合信封强调色、已读行用开启信封淡色，图标自带可读语义", () => {
  const rows = require("../packages/addons/mail/client/views/message-rows.cjs");
  const ICONS = require("../packages/addons/mail/client/ui/icons.cjs").ICONS;
  const h = (type, props, ...kids) => ({type, props, kids});
  const now = new Date(2026, 5, 2, 9, 0);
  const items = [
    {id: "u1", dateAt: +now, subject: "未读的主题", preview: "摘要", accountName: "工作邮箱"},
    {id: "r1", dateAt: +now - 60000, subject: "已读的主题", preview: "摘要", accountName: "工作邮箱"},
  ];
  const render = (lang) => rows(h, items, {
    now, lang, showSource: true, attachmentUpdates: new Map(), open() {},
    sender: (m) => m.id === "u1" ? "未读发件人" : "已读发件人", senderDetail: () => "",
    isUnread: (m) => m.id === "u1",
  }).filter((r) => r.type === "button");

  const zh = render("zh");
  assert.equal(zh[0].props.className, "wbml-list-row unread");
  assert.equal(zh[1].props.className, "wbml-list-row read");
  const st = (row) => row.kids[0];
  assert.equal(st(zh[0]).props.className, "wbml-st");
  assert.equal(st(zh[0]).props.role, "img");
  assert.equal(st(zh[0]).props["aria-label"], "未读");
  assert.equal(st(zh[0]).props.title, "未读");
  assert.equal(st(zh[0]).kids[0].type, ICONS.mail, "未读用闭合信封");
  assert.equal(st(zh[1]).props["aria-label"], "已读");
  assert.equal(st(zh[1]).kids[0].type, ICONS["mail-open"], "已读用开启信封");
  // 状态图标与按钮里其他 lucide 图标一样是装饰性的，不能被 Tab 单独聚焦
  assert.equal(st(zh[0]).kids[0].props["aria-hidden"], true);
  assert.equal(st(zh[0]).kids[0].props.size, 14);

  const en = render("en");
  assert.equal(st(en[0]).props["aria-label"], "Unread");
  assert.equal(st(en[1]).props["aria-label"], "Read");
});
