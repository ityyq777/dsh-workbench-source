"use strict";
/** 基础样式见 packages/addons/lib/client-base-styles.cjs；这里补联系人专用的窄屏列裁剪。 */
var BASE = require("../../../lib/client-base-styles.cjs")("wbct");

var OWN = `
/* 联系方式：桌面端一行多段，窄屏一项一行。 */
.wbct-fields { display: flex; flex-wrap: wrap; gap: 2px 10px; }
.wbct-field { overflow-wrap: break-word; }

/* 窄屏：联系方式列可换行，组织/分组/更新时间按列裁剪，操作按钮换行不撑宽。 */
@media (max-width:600px) {
  /* 基础表格是 width:max-content，窄屏三列要压回 100%，否则操作列被推到屏幕外。 */
  .wbct-table { width: 100%; min-width: 0; }
  .wbct-c-org, .wbct-c-groups, .wbct-c-updated { display: none; }
  .wbct-table th, .wbct-table td { padding-left: 8px; padding-right: 8px; }
  .wbct-c-contact .wbct-muted { overflow-wrap: break-word; }
  /* 联系方式一项一行，长邮箱才不会被拆成两截。 */
  .wbct-fields { flex-direction: column; gap: 2px; }
  .wbct-row { flex-wrap: wrap; gap: 4px; }
  /* 姓名列不换行，避免「张伟」被拆成竖排；操作按钮保持一行并收窄内边距。 */
  .wbct-c-name { white-space: nowrap; padding-right: 10px; }
  .wbct-c-act .wbct-row { flex-wrap: nowrap; gap: 4px; }
  .wbct-c-act .wbct-btn { padding-left: 8px; padding-right: 8px; }
}
`;

module.exports = (Array.isArray(BASE) ? BASE.join("\n") : String(BASE)) + OWN;
