"use strict";
/**
 * 宿主「自动化」视图：单入口页签式页面。
 *
 * 四个页签：概览 / 规则 / 运行记录 / 设置。
 * - 原来插件里的「数据」页签已删除：automation_rule / automation_run / automation_meta
 *   并入了宿主平台表，数据浏览统一走宿主「数据」页签；
 * - 原来的「Action」页签也删了：automation.* 注册在 wb-shell 域，宿主的「宿主 action 权限」
 *   页（route=agent，数据源 actions.list）已经把全部宿主 action 连同参数、允许来源列在一起，
 *   这里再挂一份只读清单只是重复入口；
 * - action 名仍是 automation.*，见 common.cjs 的 hostApi；
 * - 所有文案来自宿主 locale（auto_ 前缀），颜色只用主题 token。
 */
var C = require("./automation/common.cjs");
var icons = C.icons;
var stats = require("./automation/stats.cjs");
// stats 模块本身即 StatsView 组件。
var StatsView = stats.StatsView || stats;
var rules = require("./automation/rules.cjs");
var runs = require("./automation/runs.cjs");
var config = require("./automation/config.cjs");

/** 页签定义：[key, 文案键, 图标名]。 */
var TABS = [
  ["overview", "stats.title", "activity"],
  ["rules", "rules.title", "list"],
  ["runs", "runs.title", "history"],
  ["config", "config.title", "sliders-horizontal"],
];

/**
 * 页面组件。props：
 * jsx/React（宿主注入）、api（/workbench/api 客户端）、lang、t（宿主文案）、
 * head(title, desc)（宿主统一页头）。
 */
module.exports = function AutomationView(props) {
  var h = props.h;
  var React = props.React;
  var t = C.autoT(props.t);
  // 视图只认 api.call；宿主页面实际拿到的是 get/post/del。
  var api = C.hostApi(props.api);
  var tabS = React.useState("overview");
  var tab = tabS[0];
  var newS = React.useState(false);
  var wantNew = newS[0];

  // 「新建」交接：先切到规则页并请求打开编辑器，下一拍就复位，
  // 这样之后从别的页签回到规则页不会又弹一次。
  React.useEffect(function () {
    if (!wantNew) return undefined;
    var timer = setTimeout(function () { newS[1](false); }, 0);
    return function () { clearTimeout(timer); };
  }, [wantNew]);

  function openTab(key) {
    tabS[1](key);
  }

  function onNavigate(name) {
    if (name === "rules") {
      newS[1](true);
      openTab("rules");
      return;
    }
    if (name === "config") openTab("config");
  }

  var body;
  if (tab === "rules") {
    body = h(rules, { h: h, api: api, React: React, lang: props.lang, t: t, icon: icons.icon, viewParams: wantNew ? { new: true } : null });
  } else if (tab === "runs") {
    body = h(runs, { h: h, api: api, React: React, lang: props.lang, t: t, icon: icons.icon });
  } else if (tab === "config") {
    body = h(config, { h: h, api: api, React: React, lang: props.lang, t: t, icon: icons.icon });
  } else {
    body = h(StatsView, { h: h, api: api, React: React, lang: props.lang, t: t, icon: icons.icon, onNavigate: onNavigate });
  }

  return h("div", { className: "wb-root" },
    h("div", { className: "wb-auto" },
      props.head(t("auto_page_title"), t("auto_page_desc")),
      h("div", { className: "wb-tabs", role: "tablist" },
        TABS.map(function (item) {
          var active = tab === item[0];
          return h("button", {
            key: item[0],
            type: "button",
            role: "tab",
            "aria-selected": active,
            className: "wb-tab" + (active ? " on" : ""),
            onClick: function () { openTab(item[0]); },
          },
            h("span", { className: "wba-inline" }, icons.icon(item[2], 13), t(item[1])));
        })),
      body));
};

module.exports.TABS = TABS;
