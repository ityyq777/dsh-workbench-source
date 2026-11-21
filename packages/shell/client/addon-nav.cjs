"use strict";
// 跨插件跳转：把「页面内路由」与「先切面板、挂载后再跳」两种情形收在一处，
// 免得宿主客户端入口越堆越长（audit:lines 对手写源有行数目标）。
//
// 背景：工作台的路由状态是 WorkbenchPage 的局部 state，页面没挂载时（聊天页、设置页）
// 没有任何钩子能跳转。外壳提供了 ctx.layout.selectPanel(id)，可以先把工作台面板切到前台，
// 跳转目标暂存起来，等页面挂载后由它自己消费。
module.exports = function createAddonNav() {
  var hook = null; // WorkbenchPage 挂载期间登记：在当前页面内路由
  var layout = null; // 外壳布局服务：跨页跳转靠它切面板
  var pending = null; // 面板未挂载时的跳转目标

  return {
    setLayout: function (api) { layout = api && typeof api.selectPanel === "function" ? api : null; },

    // 返回注销函数：页面卸载时钩子必须清掉，否则会往已卸载的 state 里写路由。
    setHook: function (fn) {
      hook = typeof fn === "function" ? fn : null;
      return function () { if (hook === fn) hook = null; };
    },

    // 取出待办（取完即清）；没有就返回 null。
    takePending: function () { var want = pending; pending = null; return want; },

    /// 返回是否真的跳了。addonId 必填，viewId 为空时落到插件首页视图。
    /// params 是视图参数（如 {messageId}），面板未挂载时一并暂存。
    navigate: function (panelId, addonId, viewId, params) {
      if (!addonId) return false;
      var id = String(addonId);
      var vid = viewId ? String(viewId) : "";
      var extra = params && typeof params === "object" ? params : null;
      // 1) 工作台页面已挂载：页面内路由即可，不折腾面板。
      if (hook && hook(id, vid, extra) !== false) return true;
      // 2) 未挂载：记待办 + 切面板；面板挂载后由 WorkbenchPage 消费。
      pending = { addonId: id, viewId: vid, params: extra };
      if (layout) {
        try { layout.selectPanel(panelId); return true; } catch (e) { /* 面板未注册：保持原地 */ }
      }
      pending = null;
      return false;
    },
  };
};
