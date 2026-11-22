"use strict";
/** 基础样式见 packages/addons/lib/client-base-styles.cjs；这里补联系人专用的窄屏列裁剪。 */
var BASE = require("../../../lib/client-base-styles.cjs")("wbct");

var OWN = `
/* 窄屏：联系方式列可换行，组织/分组/更新时间按列裁剪，操作按钮换行不撑宽。 */
@media (max-width:600px) {
  /* 基础表格是 width:max-content，窄屏三列要压回 100%，否则操作列被推到屏幕外。 */
  .wbct-table { width: 100%; min-width: 0; }
  .wbct-c-org, .wbct-c-groups, .wbct-c-updated { display: none; }
  .wbct-table th, .wbct-table td { padding-left: 8px; padding-right: 8px; }
  .wbct-c-contact .wbct-muted { overflow-wrap: anywhere; }
  .wbct-row { flex-wrap: wrap; gap: 4px; }
}
`;

module.exports = (Array.isArray(BASE) ? BASE.join("\n") : String(BASE)) + OWN;
