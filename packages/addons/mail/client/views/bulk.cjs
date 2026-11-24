"use strict";
const React = require("react");
const C = require("../ui/common.cjs");
// 失败原因折叠走共享控件（原生 details + 统一折叠头）。
const Disclosure = require("../../../lib/disclosure.cjs").createDisclosure(React).Disclosure;
const icons = require("../ui/icons.cjs");
const labels = { trash: "移入废纸篓", read: "标为已读" };
const remote = m => Boolean(m?.id && m.accountId && m.mailbox && m.uid > 0 && m.uidValidity > 0);
const unread = m => !/\\Seen\b/i.test(String(m.flags || ""));

function snapshot(items, kind, checked) {
  const result = new Map();
  for (const m of items) {
    if (!remote(m) || (kind === "trash" ? !checked.has(m.id) : !unread(m))) continue;
    result.set(m.id, Object.freeze({ id: m.id, accountId: m.accountId, accountName: m.accountName || m.accountId,
      subject: m.subject || "(无主题)", mailbox: m.mailbox, uid: m.uid, uidValidity: m.uidValidity }));
  }
  return [...result.values()];
}

async function executeBatch(api, kind, targets, active) {
  const done = [], failed = [];
  for (const item of targets) {
    if (!active()) break;
    try {
      const m = await C.call(api, "mail.messageGet", { id: item.id });
      if (!active()) break;
      if (!remote(m) || ["id", "accountId", "mailbox", "uid", "uidValidity"].some(k => m[k] !== item[k])) {
        throw new Error("邮件位置或远端身份已变化，请刷新列表");
      }
      if (kind === "read" && unread(m)) {
        const ack = await C.call(api, "mail.messageMarkRead", { id: item.id, read: true });
        if (ack?.updated !== 1) throw new Error("未收到已读回执");
      } else if (kind === "trash") {
        const ack = await C.call(api, "mail.messageDelete", { id: item.id });
        if (ack?.trashed !== true) throw new Error("未收到移入废纸篓回执");
      }
      done.push(item.id);
    } catch (error) { failed.push({ item, error: C.errText(error) }); }
  }
  return { done, failed };
}

function accountCounts(targets, accounts) {
  const counts = new Map();
  for (const m of targets) {
    const name = accounts.find(a => a.id === m.accountId)?.email || m.accountName;
    const entry = counts.get(m.accountId) || { name, count: 0 };
    counts.set(m.accountId, { name, count: entry.count + 1 });
  }
  return [...counts.values()].map(({ name, count }) => `${name} ${count} 封`).join("、");
}

function useBulk({ React, h, api, items, scope, accounts, blocked, refresh }) {
  const [, setRev] = React.useState(0);
  const ref = React.useRef(null), mounted = React.useRef(true);
  React.useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  if (!ref.current || ref.current.scope !== scope) ref.current = { scope, checked: new Set(), selecting: false };
  const state = ref.current;
  const active = () => mounted.current && ref.current === state;
  const redraw = () => setRev(v => v + 1);
  const available = items.filter(remote);
  const selected = available.filter(m => state.checked.has(m.id));
  const button = (text, onClick, disabled) => h(C.Btn, { h, onClick, disabled }, text);
  function prepare(kind) {
    if (blocked || state.running || ref.current !== state) return;
    const targets = snapshot(items, kind, state.checked);
    if (!targets.length) return;
    state.plan = { kind, targets, done: 0 };
    redraw();
  }
  async function run() {
    const plan = state.plan;
    if (!plan || blocked || state.running || ref.current !== state) return;
    state.running = true;
    redraw();
    const result = await executeBatch(api, plan.kind, plan.targets, active);
    if (!active()) return;
    state.running = false;
    state.checked.clear();
    state.selecting = false;
    state.plan = null;
    state.report = { kind: plan.kind, done: plan.done + result.done.length, failed: result.failed };
    if (result.done.length) refresh(plan.kind, result.done);
    redraw();
  }
  const plan = state.plan, report = state.report;
  // 说明/确认类内容才占整行；日常按钮交给列表头同一行渲染（tools），不再整行独占。
  const confirm = plan ? [
    h("strong", { key: "ask" }, `确认将 ${plan.targets.length} 封邮件${labels[plan.kind]}？`),
    h("span", { key: "who" }, accountCounts(plan.targets, accounts)),
    h(C.Btn, { key: "go", h: h, onClick: run, disabled: blocked || state.running },
      state.running ? "正在处理…" : "确认" + labels[plan.kind]),
    h(C.Btn, { key: "cancel", h: h, onClick: () => { state.plan = null; redraw(); }, disabled: state.running }, "取消"),
  ] : null;
  const tools = plan ? null : [
    h(C.Btn, { key: "pick", h: h, disabled: blocked || !available.length, onClick: () => { state.selecting = !state.selecting; state.checked.clear(); redraw(); } },
      icons.label("square-check", state.selecting ? "退出选择" : "选择邮件")),
    state.selecting && button(selected.length && selected.length === available.length ? "清除选择" : "本页全选", () => {
      state.checked = selected.length === available.length ? new Set() : new Set(available.map(m => m.id)); redraw();
    }, blocked || !available.length),
    state.selecting && h(C.Btn, { key: "trash", h: h, disabled: blocked || !selected.length, onClick: () => prepare("trash") },
      icons.label("trash-2", `移入废纸篓（${selected.length}）`)),
    h(C.Btn, { key: "read", h: h, disabled: blocked || !available.some(unread), onClick: () => prepare("read") },
      icons.label("check-check", "全部标为已读")),
    state.selecting && items.length > available.length
      ? h("span", { key: "hint", className: "wbml-muted" }, "本地副本或远端身份未确认的邮件不可选择")
      : null,
  ];
  const reportNode = report ? h("div", { className: "wbml-bulk-report", role: "status" },
    `${labels[report.kind]}：成功 ${report.done} 封，失败 ${report.failed.length} 封`,
    report.failed.length > 0 && h(Disclosure, { title: "查看失败原因" },
      report.failed.map(({item, error}) => h("div", { key: item.id }, `${item.accountName} · ${item.subject}：${error}`))),
    report.failed.length > 0 && button("仅重试失败项", () => { state.plan = { kind: report.kind, targets: report.failed.map(f => f.item), done: report.done }; redraw(); }, blocked),
    button("收起结果", () => { state.report = null; redraw(); })) : null;
  const toolbar = (confirm || reportNode) ? h("div", { className: "wbml-bulk" }, ...(confirm || []), reportNode) : null;
  function wrapRow(m, row) {
    if (!state.selecting) return row;
    return h("div", { className: "wbml-bulk-row", key: m.id },
      h("input", { type: "checkbox", "aria-label": "选择邮件：" + (m.subject || "(无主题)"), checked: state.checked.has(m.id),
        disabled: blocked || !remote(m) || !!plan, onChange: e => {
          if (e.target.checked) state.checked.add(m.id); else state.checked.delete(m.id);
          redraw();
        } }), row);
  }
  return { wrapRow, locked: () => !!state.plan, tools, toolbar };
}
function updateSearch(server, kind, ids, unreadOnly) {
  const done = new Set(ids);
  const items = server.data.items.flatMap(m => {
    if (!done.has(m.id)) return [m];
    if (kind === "trash" || unreadOnly) return [];
    return [{ ...m, flags: unread(m) ? `${m.flags || ""} \\Seen`.trim() : m.flags }];
  });
  return { ...server, data: { ...server.data, items } };
}
module.exports = { snapshot, executeBatch, useBulk, updateSearch };
