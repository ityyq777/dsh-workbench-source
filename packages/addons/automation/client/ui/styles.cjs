"use strict";
/** 自动化插件样式：共享基础件（前缀 wba） + 本插件版式层 + 共享开关控件。 */
// 布尔开关外观走 lib/switch.cjs 的 wbctl-* 规则，重复追加无害。
var SW = require("../../../lib/switch.cjs");
module.exports =
  require("../../../lib/client-base-styles.cjs")("wba").join("\n") +
  "\n" +
  require("./layout-styles.cjs") +
  "\n" +
  SW.styles.join("\n");
