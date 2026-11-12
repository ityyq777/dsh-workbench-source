"use strict";
// 工作台图标：与任务插件一致，按需引入 lucide-react，随 client.js 一起打包。
var h = require("react").createElement;
var ICONS = {
  tasks: require("lucide-react/icons/list-checks").default,
  tags: require("lucide-react/icons/tag").default,
  sites: require("lucide-react/icons/globe").default,
  storage: require("lucide-react/icons/package").default,
  message: require("lucide-react/icons/message-square").default,
  vault: require("lucide-react/icons/shield-check").default,
  connector: require("lucide-react/icons/rss").default,
  automation: require("lucide-react/icons/zap").default,
  contacts: require("lucide-react/icons/users").default,
  calendar: require("lucide-react/icons/calendar-days").default,
  mail: require("lucide-react/icons/mail").default,
  backup: require("lucide-react/icons/database").default,
  audit: require("lucide-react/icons/clipboard-check").default,
  account: require("lucide-react/icons/cloud").default,
};
module.exports = function cardIcon(id, title) {
  var C = ICONS[String(id || "").replace(/^wb-addon-/, "")];
  if (C) return h(C, { size: 18, strokeWidth: 1.9, "aria-hidden": "true" });
  return String(title || "?").slice(0, 1);
};
