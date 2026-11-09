// Opt-in mounted views retain local state and their scroll ancestors across view tabs.
var React = require("react"), h = React.createElement;
function Slot(props) {
  var root = React.useRef(null), scroll = React.useRef([]);
  React.useLayoutEffect(function () {
    if (!props.active) return;
    var positions = scroll.current.slice();
    function restore() { positions.forEach(function (p) { p.node.scrollTop = p.top; p.node.scrollLeft = p.left; }); }
    restore();
    var frame = typeof requestAnimationFrame === "function" ? requestAnimationFrame(restore) : null;
    function remember() {
      var positions = [], node = root.current;
      while (node) { positions.push({ node: node, top: node.scrollTop, left: node.scrollLeft }); node = node.parentElement; }
      scroll.current = positions;
    }
    document.addEventListener("scroll", remember, true);
    return function () { if (frame !== null) cancelAnimationFrame(frame); document.removeEventListener("scroll", remember, true); };
  }, [props.active]);
  return h("div", { ref: root, hidden: !props.active, "data-view-id": props.view.id },
    h(props.view.component, Object.assign({}, props.viewProps, { active: props.active })));
}
module.exports = function ViewOutlet(props) {
  var kept = React.useRef({});
  if (props.view.keepAlive) kept.current[props.view.id] = props;
  var entries = Object.keys(kept.current).map(function (id) { return kept.current[id]; });
  if (!props.view.keepAlive) entries.push(props);
  return h(React.Fragment, null, entries.map(function (entry) {
    return h(Slot, { key: entry.view.id, view: entry.view, viewProps: entry.viewProps, active: entry.view.id === props.view.id });
  }));
};
