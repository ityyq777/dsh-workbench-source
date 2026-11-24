"use strict";
/**
 * 宿主版自动化页的公共层。
 *
 * 三件事必须收在这里，视图才能像原插件那样写：
 * 1) 复用 packages/addons/lib 的共享控件（按钮/字段/提示/空态/加载/数字输入/开关）；
 * 2) 宿主页面拿到的 api 只有 get/post/del，共享控件只认 api.call(action, args)，
 *    这里做一层适配，固定投到宿主 wb-shell 域的元 action；
 * 3) 宿主 locale 是扁平键且不保证插值，这里统一加 auto_ 前缀并展开 {变量}。
 */
var react = require("react");
var createCommon = require("../../../addons/lib/client-common.cjs");
var iconsLib = require("../../../addons/lib/icons.cjs");

// 控件 CSS 前缀沿用原插件的 wba，样式集中在 automation/styles.cjs。
var C = createCommon("wba");

// lucide 图标按需 require，避免把整张图标表打进宿主 client.js。
var ICON_SET = iconsLib.create("wba", {
  "activity": require("lucide-react/icons/activity").default,
  "bot": require("lucide-react/icons/bot").default,
  "calendar-clock": require("lucide-react/icons/calendar-clock").default,
  "clock": require("lucide-react/icons/clock").default,
  "hourglass": require("lucide-react/icons/hourglass").default,
  "repeat": require("lucide-react/icons/repeat").default,
  "send": require("lucide-react/icons/send").default,
  "sparkles": require("lucide-react/icons/sparkles").default,
  "alarm-clock": require("lucide-react/icons/alarm-clock").default,
  "alert-triangle": require("lucide-react/icons/alert-triangle").default,
  "check-circle": require("lucide-react/icons/check-circle").default,
  "database": require("lucide-react/icons/database").default,
  "hand": require("lucide-react/icons/hand").default,
  "history": require("lucide-react/icons/history").default,
  "layers": require("lucide-react/icons/layers").default,
  "list": require("lucide-react/icons/list").default,
  "pencil": require("lucide-react/icons/pencil").default,
  "plus": require("lucide-react/icons/plus").default,
  "play": require("lucide-react/icons/play").default,
  "power": require("lucide-react/icons/power").default,
  "power-off": require("lucide-react/icons/power-off").default,
  "radio": require("lucide-react/icons/radio").default,
  "shield-check": require("lucide-react/icons/shield-check").default,
  "skip-forward": require("lucide-react/icons/skip-forward").default,
  "sliders-horizontal": require("lucide-react/icons/sliders-horizontal").default,
  "timer": require("lucide-react/icons/timer").default,
  "trash-2": require("lucide-react/icons/trash-2").default,
  "x": require("lucide-react/icons/x").default,
  "zap": require("lucide-react/icons/zap").default,
}, { fallback: "zap" });

// 视图里的 icon(name, size) 是可调用函数（返回 React 元素），与共享 Icon 组件并存。
function icon(name, size) {
  return react.createElement(ICON_SET.Icon, { name: name, size: size || 14 });
}
var ICONS = Object.assign({ icon: icon }, ICON_SET);

/**
 * 把宿主的 /workbench/api 客户端包成共享控件认识的 api.call。
 *
 * 宿主把 automation.* 与 wb.* 一起注册在 wb-shell 域的元 action 表里，
 * 所以这里不拼 wb-addon-automation（卸载自动化插件后也要能用）。
 */
function hostApi(api) {
  return {
    call: function (action, args) {
      return api.post("/domains/wb-shell/actions/" + encodeURIComponent(action), args || {});
    },
  };
}

/** 宿主 t(key) → 自动化文案约定：auto_ 前缀 + 点号换下划线 + {name} 插值。 */
function autoT(t) {
  return function (key, vars) {
    // 页面级文案键已带 auto_ 前缀，视图里的键仍是原插件的短键（如 rules.title）。
    var raw = String(key);
    var text = t(raw.indexOf("auto_") === 0 ? raw : "auto_" + raw.replace(/\./g, "_"));
    if (!vars) return text;
    return String(text).replace(/\{(\w+)\}/g, function (m, name) {
      return vars[name] === undefined ? m : String(vars[name]);
    });
  };
}

module.exports = Object.assign({}, C, {
  icons: ICONS,
  hostApi: hostApi,
  autoT: autoT,
});
