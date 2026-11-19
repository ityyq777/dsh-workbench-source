"use strict";

module.exports = function iconLabel(h, Icon, text) {
  return h("span", { className: "wb-icon-label" },
    h(Icon, { size: 14, strokeWidth: 2, "aria-hidden": true, focusable: false }),
    h("span", null, text));
};

module.exports.styles = ".wb-icon-label{display:inline-flex;align-items:center;gap:5px;max-width:100%;vertical-align:middle;text-align:start}.wb-icon-label>svg{flex:none}.wb-icon-label>span{min-width:0;overflow-wrap:anywhere}";
