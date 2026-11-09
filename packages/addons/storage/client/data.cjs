"use strict";
module.exports = require("../../lib/data-view.cjs")({
  domain: "storage",
  prefix: "wbi",
  tables: ["storage"],
  useConfig: require("./config.cjs").useConfig,
  columns: require("./data-columns.cjs"),
});
