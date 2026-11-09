// Shared body treatment: inherit primary text rather than the metadata's muted color.
var React = require("react"), h = React.createElement;
var Body = require("./markdown.cjs").createBody(React);
var preference = require("./body-mode.cjs");
var css = require("./body-styles.cjs") + `
.wb-desc{margin-top:4px;font-size:12.5px;line-height:1.6;white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;max-width:100%;min-width:0;box-sizing:border-box;padding:6px 10px;border-radius:0 8px 8px 0;border-left:2px solid color-mix(in oklab,#5b7fd6 34%,transparent);background:color-mix(in oklab,#5b7fd6 7%,transparent);color:inherit}
.wb-desc-text{display:block}.wb-desc-clamped{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}
.wb-desc-toggle{display:block;border:1px solid transparent;background:transparent;color:inherit;font:inherit;font-size:12px;min-width:32px;min-height:32px;padding:3px 6px;border-radius:6px;cursor:pointer;white-space:normal}
.wb-desc-toggle:hover{background:color-mix(in oklab,currentColor 8%,transparent)}.wb-desc-toggle:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#2563eb);outline-offset:2px}
`;
function Description(props) {
  var mode = preference.useMode(React);
  var text = props.text == null ? "" : String(props.text);
  var expanded = React.useState(false), overflow = React.useState(false), ref = React.useRef(null);
  React.useEffect(function () {
    expanded[1](false);
  }, [text]);
  React.useEffect(function () {
    var node = ref.current;
    if (!node) return;
    function measure() {
      // Only measure the collapsed layout; expanded height must not hide the collapse button.
      if (!expanded[0]) overflow[1](node.scrollHeight > node.clientHeight + 1);
    }
    measure();
    var observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (observer) observer.observe(node);
    return function () { if (observer) observer.disconnect(); };
  }, [text, expanded[0], mode]);
  if (!text.trim()) return null;
  return h("div", { className: "wb-desc" },
    h("div", { ref: ref, className: "wb-desc-text" + (expanded[0] ? "" : " wb-desc-clamped") },
      h("span", { className: "wb-body-label", onDoubleClick: function (e) { e.stopPropagation(); } }, props.lang === "en" ? "Description" : "描述"),
      h(Body, { text: text, mode: mode })),
    overflow[0] || expanded[0] ? h("button", {
      type: "button", className: "wb-desc-toggle", "aria-expanded": expanded[0],
      onClick: function () { expanded[1](!expanded[0]); }
    }, props.lang === "en" ? (expanded[0] ? "Collapse" : "Expand") : (expanded[0] ? "收起" : "展开")) : null);
}
module.exports = { css: css, Description: Description };
