// 站点统计页图表：基件统一由 lib/stats-charts.cjs 提供，这里只注入站点用到的图标表。
"use strict";

var lib = require("../../../lib/stats-charts.cjs");

var ICONS = {
  "refresh": require("lucide-react/icons/refresh-cw").default,
  "globe": require("lucide-react/icons/globe").default,
  "link": require("lucide-react/icons/link-2").default,
  "tag": require("lucide-react/icons/tag").default,
  "pie": require("lucide-react/icons/pie-chart").default,
  "folder": require("lucide-react/icons/folder-tree").default,
  "unlink": require("lucide-react/icons/unlink").default,
  "layers": require("lucide-react/icons/layers").default,
  "plus": require("lucide-react/icons/plus").default,
};

module.exports = {
  colors: lib.colors,
  makeCharts: function (prefix) {
    return lib.makeCharts(prefix, { icons: ICONS });
  },
};
