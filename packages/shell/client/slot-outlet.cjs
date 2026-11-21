"use strict";
// 插槽落点组件：属主插件在自己的界面里放一个 <Slot>，宿主把贡献者的组件渲染进去。
//
// 三个保证：
//  1. 没有贡献时渲染 null——不占位、不报错，卸掉贡献方页面照常；
//  2. 每个贡献单独包一层错误边界——一个贡献抛错只消失它自己；
//  3. 贡献晚注册（插件后加载）时自动补渲染。
//
// 依赖由宿主注入，本文件不直接碰全局，便于单测。
module.exports = function createSlotOutlet(react, deps) {
  var h = react.createElement;
  // 错误边界必须存在：这是"一个贡献炸掉不影响别人"的唯一保障，缺了就不能静默降级。
  var Component = react.Component;

  function pickLang(value) { return value === "en" ? "en" : "zh"; }

  function payloadOf(props) {
    var out = {};
    Object.keys(props || {}).forEach(function (key) {
      if (key === "slot" || key === "lang" || key === "t" || key === "ownerId" || key === "children" || key === "key") return;
      out[key] = props[key];
    });
    return out;
  }

  function makeBoundary() {
    function Boundary(props) {
      Component.call(this, props);
      this.state = { failed: false };
      this.componentDidCatch = function (error) {
        this.setState({ failed: true });
        deps.registry.markError(props.slot, props.contribution.id, error);
        console.error("[dsh-workbench] 插槽贡献渲染失败：" + props.slot + "/" + props.contribution.id, error);
      };
    }
    Boundary.prototype = Object.create(Component.prototype);
    Boundary.prototype.constructor = Boundary;
    Boundary.prototype.render = function () {
      return this.state.failed ? null : this.props.children;
    };
    return Boundary;
  }

  var SlotBoundary = makeBoundary();

  function Slot(props) {
    var bump = react.useState(0);
    react.useEffect(function () {
      var off = deps.subscribe(function () { bump[1](function (x) { return x + 1; }); });
      return typeof off === "function" ? off : function () {};
    }, []);
    var entries = deps.registry.get(props.slot);
    if (!entries.length) return null;
    var lang = pickLang(props.lang);
    var t = typeof props.t === "function" ? props.t : function (key) { return key; };
    var payload = payloadOf(props);
    var ownerId = typeof props.ownerId === "string" ? props.ownerId : null;
    return h("span", { className: "wb-slot", "data-slot": props.slot, style: { display: "contents" } },
      entries.map(function (entry) {
        var childProps = Object.assign({}, payload, {
          slot: props.slot,
          ownerId: ownerId,
          contributorId: entry.addonId,
          lang: lang,
          t: t,
          api: deps.apiFor(entry.addonId),
          onNavigate: function (viewId, params) { return deps.navigate(entry.addonId, viewId, params); },
        });
        return h(SlotBoundary, { key: entry.id, slot: props.slot, contribution: entry },
          h(entry.component, childProps));
      }));
  }

  return { Slot: Slot, SlotBoundary: SlotBoundary, payloadOf: payloadOf };
};
