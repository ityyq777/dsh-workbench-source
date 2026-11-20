"use strict";
const Paperclip = require("lucide-react/icons/paperclip").default;

module.exports = function messageRows(h, items, options) {
  const { current, showSource, lang, attachmentUpdates, open, sender, senderDetail, isUnread } = options;
  const locale = lang === "en" ? "en-GB" : "zh-CN";
  const dayFormat = new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" });
  const timeFormat = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const today = new Date(), yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const rows = [];
  let lastDay;
  for (const m of items) {
    const date = new Date(m.dateAt);
    const valid = !!m.dateAt && Number.isFinite(date.getTime());
    const day = valid ? dayFormat.format(date) : "未知日期";
    if (day !== lastDay) {
      let label = day;
      if (day === dayFormat.format(today)) label = lang === "en" ? "Today" : "今天";
      if (day === dayFormat.format(yesterday)) label = lang === "en" ? "Yesterday" : "昨天";
      rows.push(h("h3", { key: "day:" + m.id, className: "wbml-date-group", title: day }, label));
      lastDay = day;
    }
    const active = current?.id === m.id;
    const hasAttachment = attachmentUpdates.get(m.id) ?? m.hasAttachment;
    rows.push(h("button", {
      type: "button", key: m.id, "data-mail-id": m.id, "aria-current": active || undefined,
      title: senderDetail(m) + " · " + (m.subject || "(无主题)"),
      className: "wbml-list-row" + (active ? " on" : "") + (isUnread(m) ? " unread" : ""),
      onClick: () => open(m),
    },
    h("span", { className: "wbml-who" }, h("span", { className: "wbml-sender", title: senderDetail(m) }, sender(m)), showSource && m.accountName ? h("span", { className: "wbml-source", title: m.accountName }, m.accountName) : null),
    h("span", { className: "wbml-line" }, h("span", { className: "wbml-subject" }, m.subject || "(无主题)"), h("span", { className: "wbml-snippet" }, m.preview)),
    hasAttachment === true ? h("span", { className: "wbml-attachment", title: "有附件", role: "img", "aria-label": "有附件" }, h(Paperclip, { size: 14, "aria-hidden": true })) : null,
    h("time", { className: "wbml-time", title: valid ? date.toLocaleString(locale) : day, dateTime: valid ? date.toISOString() : undefined }, valid ? timeFormat.format(date) : "—")));
  }
  return rows;
};
