"use strict";
// 工作台图标：内联 SVG，避免依赖图标包和标题首字占位。
module.exports = function (h) {
    var ICONS = {
      tasks: [["path", { d: "M9 11l3 3L22 4" }], ["path", { d: "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" }]],
      tags: [["path", { d: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" }], ["circle", { cx: 7, cy: 7, r: 1 }]],
      sites: [["circle", { cx: 12, cy: 12, r: 10 }], ["path", { d: "M2 12h20" }], ["path", { d: "M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20" }]],
      storage: [["path", { d: "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" }], ["path", { d: "M3.3 7l8.7 5 8.7-5" }], ["path", { d: "M12 22V12" }]],
      message: [["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }]],
      vault: [["path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }], ["circle", { cx: 12, cy: 11, r: 2 }], ["path", { d: "M12 13v3" }]],
      connector: [["path", { d: "M4 11a9 9 0 0 1 9 9" }], ["path", { d: "M4 4a16 16 0 0 1 16 16" }], ["circle", { cx: 5, cy: 19, r: 1 }]],
      automation: [["path", { d: "M13 2L3 14h9l-1 8 10-12h-9z" }]],
      contacts: [["path", { d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }], ["circle", { cx: 9, cy: 7, r: 4 }], ["path", { d: "M23 21v-2a4 4 0 0 0-3-3.87" }]],
      calendar: [["rect", { x: 3, y: 4, width: 18, height: 18, rx: 2 }], ["path", { d: "M16 2v4M8 2v4M3 10h18" }]],
      mail: [["rect", { x: 2, y: 4, width: 20, height: 16, rx: 2 }], ["path", { d: "M22 7l-10 7L2 7" }]],
      backup: [["ellipse", { cx: 12, cy: 5, rx: 9, ry: 3 }], ["path", { d: "M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5" }], ["path", { d: "M3 12c0 1.7 4 3 9 3s9-1.3 9-3" }]],
      audit: [["path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }], ["path", { d: "M9 12l2 2 4-4" }]],
      account: [["path", { d: "M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6-1.6A4 4 0 0 0 6 19z" }]],
    };
    function iconFor(id) {
      var spec = ICONS[String(id || "").replace(/^wb-addon-/, "")];
      if (!spec) return null;
      return h("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" },
        spec.map(function (item, i) { var attrs = Object.assign({ key: i }, item[1]); return h(item[0], attrs); }));
    }
    function cardIcon(id, title) { return iconFor(id) || String(title || "?").slice(0, 1); }
  return cardIcon;
};
