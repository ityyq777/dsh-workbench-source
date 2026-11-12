"use strict";
module.exports = function Messages(props) {
  var h = props.h, React = props.React, api = props.api;
  var C = require("../ui/common.cjs");
  var accounts = C.useLoad(React, api, "mail.accountList", {}, []);
  var accountId = React.useState("");
  var list = C.useLoad(React, api, "mail.messageList", { accountId: accountId[0] || undefined, limit: 50 }, [accountId[0]]);
  var sel = React.useState(null);
  var msg = React.useState(null);
  var accs = (accounts.data && accounts.data.items) || [];
  function open(id) { C.call(api, "mail.messageGet", { id: id }).then(function (d) { sel[1](d); }).catch(function (e) { msg[1]({ kind: "error", text: C.errText(e) }); }); }
  function sync() { if (!accountId[0]) { msg[1]({ kind: "error", text: "先选账户" }); return; } C.call(api, "mail.sync", { id: accountId[0], limit: 20 }).then(function (r) { msg[1]({ kind: "ok", text: "抓取 " + r.fetched + " 封，新增 " + r.inserted }); list.refresh(); }).catch(function (e) { msg[1]({ kind: "error", text: C.errText(e) }); }); }
  var items = (list.data && list.data.items) || [];
  return h("div", { className: "wbm-page" },
    h("div", { className: "wbm-head" }, h("div", null, h("h2", null, "邮件"), h("p", { className: "wbm-sub" }, "本地副本；IMAP 只抓信头，密码在保险箱")), h("div", { className: "wbm-row" },
      h("select", { className: "wbm-input", value: accountId[0], onChange: function (e) { accountId[1](e.target.value); sel[1](null); } }, h("option", { value: "" }, "全部账户"), accs.map(function (a) { return h("option", { key: a.id, value: a.id }, a.name); })),
      h(C.Btn, { h: h, onClick: sync }, "同步收件箱"))),
    h(C.Notice, { h: h, text: msg[0] && msg[0].text, kind: msg[0] && msg[0].kind }),
    sel[0] ? h("div", { className: "wbm-card" }, h("div", { className: "wbm-row", style: { justifyContent: "space-between" } }, h("strong", null, sel[0].subject || "(无主题)"), h(C.Btn, { h: h, onClick: function () { sel[1](null); } }, "返回")), h("p", { className: "wbm-muted" }, sel[0].from + " · " + C.fmtTime(sel[0].dateAt, props.lang)), h("pre", { className: "wbm-body" }, sel[0].body || sel[0].preview || "(正文未下载)")) :
      list.loading ? h(C.Empty, { h: h, text: "加载中…" }) : list.error ? h(C.Notice, { h: h, kind: "error", text: list.error }) : items.length === 0 ? h(C.Empty, { h: h, text: "没有本地邮件；先在账户页同步" }) :
        h("div", { className: "wbm-list" }, items.map(function (m) { return h("button", { key: m.id, type: "button", className: "wbm-list-row", onClick: function () { open(m.id); } }, h("div", { className: "wbm-main" }, h("strong", null, m.subject || "(无主题)"), h("span", { className: "wbm-muted" }, m.from + " · " + m.mailbox)), h("span", { className: "wbm-time" }, C.fmtTime(m.dateAt, props.lang))); }))
  );
};
