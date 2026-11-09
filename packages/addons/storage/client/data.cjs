"use strict";
module.exports = require("../../lib/data-view.cjs")({
  domain: "storage",
  Icon: require("./icons.cjs").Icon,
  Skeleton: require("./ui.cjs").Skeleton,
  prefix: "wbi",
  tables: ["storage"],
  useConfig: require("./config.cjs").useConfig,
  columns: require("./data-columns.cjs"),
});
