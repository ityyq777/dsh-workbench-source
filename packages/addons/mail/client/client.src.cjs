"use strict";
var GLYPHS = require("./ui/icons.cjs").ICONS;

(function () {
  var root = typeof window !== "undefined" ? window : null;
  var host = root && root.__WB_HOST__;
  if (!host || !host.react) { module.exports = { name: "dsh-workbench-mail", inject: [], apply: function () {} }; return; }
  var React = host.react; var h = host.h; var CSS = require("./ui/styles.cjs");
  var I = { mail: GLYPHS["mail"], send: GLYPHS["send"], users: GLYPHS["users"], db: GLYPHS["database"], list: GLYPHS["list"] };
  function Icon(p) { var C = I[p.name] || I.mail; return h(C, { size: 14, strokeWidth: 2, className: "wbg-svg" }); }
  function tab(n) { return function () { return h(Icon, { name: n }); }; }
  function withProps(Inner, title) { return function (p) { return h(Inner, { api: p.api, lang: p.lang === "en" ? "en" : "zh", h: h, React: React, title: title }); }; }
  // 邮件数据视图统一过保险箱门禁：锁定期间不挂载视图，切页与轮询都拿不到任何邮件字段。
  var C = require("./ui/common.cjs"); var Gate = require("./ui/lock-gate.cjs");
  function gated(Inner, title) { return Gate.gate(withProps(Inner, title), h, React, C); }
  if (typeof document !== "undefined" && document.head && !document.getElementById("wb-mail-style")) { var s = document.createElement("style"); s.id = "wb-mail-style"; s.textContent = CSS; document.head.appendChild(s); }
  host.registerAddon({ id: "wb-addon-mail", version: "0.5.2",
    icon: GLYPHS["mail"], views: [
    { id: "messages", icon: tab("mail"), title: { zh: "邮件", en: "Messages" }, component: gated(require("./views/messages.cjs"), "邮件") },
    { id: "compose", icon: tab("send"), title: { zh: "写信", en: "Compose" }, component: gated(require("./views/compose.cjs"), "写信") },
    { id: "accounts", icon: tab("users"), title: { zh: "账户", en: "Accounts" }, component: gated(require("./views/accounts.cjs"), "账户") },
    { id: "data", icon: tab("db"), title: { zh: "数据", en: "Data" }, component: gated(require("./views/data.cjs"), "数据") },
    { id: "actions", icon: tab("list"), title: { zh: "Action", en: "Actions" }, component: withProps(require("./views/actions.cjs"), "Action") },
  ] });
  module.exports = { name: "dsh-workbench-mail", inject: [], apply: function () {} };
})();
