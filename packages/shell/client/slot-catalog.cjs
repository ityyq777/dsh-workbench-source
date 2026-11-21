"use strict";
// 宿主定义的界面插槽目录（白名单）。
// 插件只能往这里列出的插槽贡献组件；未知 id 会被注册表拒绝并报错，避免"悄悄挂不上"。
// 新增插槽必须同时更新 docs/跨插件界面插槽设计.md 与 docs/AGENTS规范/04-UI规范.md。
var SLOTS = [
  {
    id: "item.actions",
    title: { zh: "条目操作", en: "Item actions" },
    description: "列表或详情里针对单条对象的操作按钮，如把一封邮件变成任务。",
    props: { item: "WbItemRef：{kind,id,title?,subtitle?,url?}，由属主填写；kind 带命名空间，如 mail.message" },
  },
  {
    id: "view.toolbar",
    title: { zh: "视图工具条", en: "View toolbar" },
    description: "插件视图顶部工具条上的追加按钮。",
    props: { view: "{addonId, viewId}：当前正在看的插件视图" },
  },
  {
    id: "settings.sections",
    title: { zh: "设置分区", en: "Settings sections" },
    description: "配置页上追加的一段设置块。",
    props: { owner: "string：落点所属插件 id" },
  },
  {
    id: "home.card.footer",
    title: { zh: "首页卡片底部", en: "Home card footer" },
    description: "工作台首页插件卡片底部的一行文字或按钮。",
    props: { card: "{addonId,title}：卡片对应的插件" },
  },
];

var INDEX = {};
SLOTS.forEach(function (slot) { INDEX[slot.id] = slot; });

module.exports = {
  slots: SLOTS,
  has: function (id) { return Object.prototype.hasOwnProperty.call(INDEX, String(id || "")); },
  get: function (id) { return INDEX[String(id || "")] || null; },
  ids: function () { return SLOTS.map(function (s) { return s.id; }); },
};
