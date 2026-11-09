// 纯视图标签渲染；由现有客户端构建链内联，不新增浏览器模块依赖。
module.exports = function createViewTabs(react, pickTitle) {
  var h = react.createElement;
  return function ViewTabs(props) {
    if (props.views.length < 2) return null;
    return h("div", { className: "wb-page-tabs" }, props.views.map(function (view) {
      var title = pickTitle(view.title, props.lang) || view.id;
      var on = props.activeView && view.id === props.activeView.id;
      var Icon = typeof view.icon === "function" ? view.icon : null;
      return h("button", {
        key: view.id,
        type: "button",
        className: "wb-tab" + (on ? " on" : ""),
        "aria-label": title,
        onClick: function () { props.go("addon:" + props.addonId + ":" + view.id); },
      }, Icon ? h("span", {
        "aria-hidden": true,
        style: { display: "inline-flex", verticalAlign: "middle", marginRight: 6 },
      }, h(Icon, { size: 14, strokeWidth: 2, "aria-hidden": true })) : null, title);
    }));
  };
};
