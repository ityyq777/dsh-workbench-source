// Controlled per-block toggle; never writes global preferences.
module.exports = function (React) {
  var h = React.createElement;
  return function BodyMode(props) {
    var plain = props.mode === "text", t = props.t;
    var label = t.bodyModeToggle.replace("{field}", props.label).replace("{current}", t[plain ? "plainText" : "markdown"]).replace("{target}", t[plain ? "markdown" : "plainText"]);
    return h("button", {
      type: "button", className: "wb-body-toggle" + (props.className ? " " + props.className : ""), title: label, "aria-label": label,
      "aria-pressed": !plain,
      onClick: function (e) { e.stopPropagation(); props.onChange(plain ? "markdown" : "text"); }
    }, h("span", { key: props.mode, className: "wb-body-toggle-icon", "aria-hidden": true }, h(props.Icon, { name: plain ? "pilcrow" : "code-2", size: 14 })));
  };
};
