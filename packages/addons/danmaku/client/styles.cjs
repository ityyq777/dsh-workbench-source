"use strict";
// 弹幕插件页面样式：基础件复用共享样式，这里只追加弹幕库与配置页的专属规则。

var baseStyles = require("../../lib/client-base-styles.cjs");
var overlayStyle = require("./overlay/style.cjs");

module.exports = function styles() {
  return baseStyles("wbdm")
    .concat(overlayStyle())
    .concat([
      ".wbdm-lib{display:flex;flex-direction:column;gap:10px}",
      ".wbdm-compose{display:flex;gap:8px;align-items:flex-start;flex-wrap:wrap}",
      ".wbdm-compose textarea{flex:1 1 320px;min-height:38px;resize:vertical;line-height:1.45}",
      ".wbdm-counter{font-size:11px;color:var(--wb-muted,#6b7280);white-space:nowrap;align-self:center}",
      ".wbdm-list{display:flex;flex-direction:column;border:1px solid var(--wb-border,#e5e7eb);border-radius:10px;overflow:hidden;background:var(--wb-surface,#fff)}",
      ".wbdm-item{display:flex;gap:10px;align-items:center;padding:9px 12px;border-bottom:1px solid var(--wb-border,#eef0f3);min-width:0}",
      ".wbdm-item:last-child{border-bottom:0}",
      ".wbdm-item.off .wbdm-body{color:var(--wb-muted,#6b7280);text-decoration:line-through}",
      ".wbdm-order{font-size:11px;color:var(--wb-muted,#6b7280);min-width:22px;text-align:right}",
      ".wbdm-body{flex:1 1 auto;min-width:0;overflow-wrap:anywhere;font-size:13px}",
      ".wbdm-body input{width:100%;font:inherit;padding:4px 6px;border-radius:6px;border:1px solid var(--wb-border,#d1d5db);background:var(--wb-surface,#fff);color:inherit}",
      ".wbdm-actions{display:flex;gap:4px;align-items:center;flex-wrap:wrap}",
      ".wbdm-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:6px;border:1px solid transparent;background:transparent;color:var(--wb-muted,#6b7280);cursor:pointer}",
      ".wbdm-icon-btn:hover:not(:disabled){color:var(--wb-accent,#2563eb);border-color:var(--wb-border,#e5e7eb);background:color-mix(in srgb, var(--wb-accent,#2563eb) 8%, transparent)}",
      ".wbdm-icon-btn:disabled{opacity:.35;cursor:default}",
      ".wbdm-switch{display:inline-flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;user-select:none}",
      ".wbdm-cfg{display:flex;flex-direction:column;gap:14px}",
      ".wbdm-cfg-group{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px}",
      ".wbdm-cfg-title{font-size:12px;font-weight:650;color:var(--wb-muted,#6b7280);letter-spacing:.02em}",
      ".wbdm-cfg-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}",
      ".wbdm-status{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}",
      ".wbdm-status-cell{border:1px solid var(--wb-border,#e5e7eb);border-radius:8px;padding:8px 10px;background:var(--wb-surface,#fff);min-width:0}",
      ".wbdm-status-label{font-size:11px;color:var(--wb-muted,#6b7280)}",
      ".wbdm-status-value{font-size:13px;font-weight:600;overflow-wrap:anywhere}",
      ".wbdm-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}",
    ]);
};

module.exports.baseStyles = baseStyles;
