// 宿主内建页面的语义图标：路由 id → lucide 组件，逐一 require。
//
// 逐图标 require 而不是 require("lucide-react")：宿主 client.js 与 12 个插件共用
// 同一份构建链，整张图标表会让宿主包明显变大；这里只收首页「工作台管理」入口
// 与对应页头用到的那几个（两份用同一张表，卡片与页头不会各画各的）。
// 新增宿主页面时在这里补一行，并把 manageCards 的兜底字符换成新路由 id。
"use strict";

var ICONS = {
  roles: require("lucide-react/icons/user-cog").default,
  agent: require("lucide-react/icons/shield-check").default,
  agentList: require("lucide-react/icons/bot").default,
  queue: require("lucide-react/icons/inbox").default,
  automation: require("lucide-react/icons/zap").default,
  data: require("lucide-react/icons/database").default,
  config: require("lucide-react/icons/sliders-horizontal").default,
  backup: require("lucide-react/icons/hard-drive-download").default,
  audit: require("lucide-react/icons/scroll-text").default,
  account: require("lucide-react/icons/refresh-cw").default,
};

/** 取宿主内建页面的图标组件；未登记的路由返回 null，交给调用方继续兜底。 */
function hostIcon(key) {
  return (key && ICONS[key]) || null;
}

module.exports = { ICONS: ICONS, hostIcon: hostIcon };
