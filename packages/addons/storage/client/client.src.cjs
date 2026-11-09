// Browser entry; generated output is lib/client.js.
var host = window.__WB_HOST__;
if (host) {
  var styleId = "wb-addon-storage-style";
  if (!document.getElementById(styleId)) {
    var style = document.createElement("style");
    style.id = styleId;
    style.textContent = require("./styles.cjs");
    document.head.appendChild(style);
  }
  host.registerAddon({
    id: "wb-addon-storage",
    version: "1.1.0",
    views: [
      { id: "stats", title: { zh: "储物概览", en: "Storage overview" }, component: require("./stats.cjs").Stats },
      { id: "storage", title: { zh: "记录", en: "Records" }, component: require("./records.cjs").Records },
      { id: "config", title: { zh: "配置", en: "Config" }, component: require("./config.cjs").ConfigView },
      { id: "data", title: { zh: "数据", en: "Data" }, component: require("./data.cjs").DataView },
    ],
  });
} else console.error("[wb-addon-storage] Missing workbench host");
module.exports = { name: "dsh-workbench-storage", inject: [], apply: function () {} };
