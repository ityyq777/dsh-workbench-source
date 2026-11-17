"use strict";
/** 基础样式 + 邮件列表/阅读面板/账户卡片专属规则。 */
module.exports = require("../../../lib/client-base-styles.cjs")("wbm").concat([
  ".wbm-page{display:flex;flex-direction:column;gap:12px;padding:16px;overflow:auto;height:100%;box-sizing:border-box}",
  ".wbm-input{border:1px solid var(--wb-border,#d1d5db);border-radius:7px;padding:6px 8px;font:inherit;background:var(--wb-surface,#fff);color:inherit;min-width:120px}",
  ".wbm-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}",
  ".wbm-list{display:flex;flex-direction:column;gap:2px}",
  ".wbm-list-row{display:flex;align-items:center;gap:10px;padding:8px;border:0;border-bottom:1px solid var(--wb-border,#eef0f3);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}",
  ".wbm-main{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}",
  ".wbm-time{font-size:11px;color:var(--wb-muted,#6b7280);white-space:nowrap}",
  ".wbm-body{white-space:pre-wrap;font:inherit;font-size:13px;line-height:1.6;margin:8px 0 0}",
  ".wbm-icon-btn{border:0;background:transparent;color:var(--wb-muted,#6b7280);font-size:16px;cursor:pointer;padding:2px 6px}",
  /* 服务商选择器 */
  ".wbm-chips{display:flex;flex-wrap:wrap;gap:6px}",
  ".wbm-chip{border:1px solid var(--wb-border,#d1d5db);background:var(--wb-surface,#fff);color:inherit;border-radius:999px;padding:4px 12px;font-size:12px;cursor:pointer}",
  ".wbm-chip:hover{border-color:var(--wb-accent,#2563eb)}",
  ".wbm-chip:focus-visible{outline:2px solid var(--wb-accent,#2563eb);outline-offset:1px}",
  ".wbm-chip.on{background:var(--wb-accent,#2563eb);border-color:var(--wb-accent,#2563eb);color:var(--wb-on-accent,#fff)}",
  /* 账户表单 */
  ".wbm-acct-form{display:flex;flex-direction:column;gap:10px;border:1px solid var(--wb-border,#e5e7eb);border-radius:10px;background:var(--wb-surface,#fff);padding:12px}",
  ".wbm-acct-head{display:flex;align-items:center;justify-content:space-between;gap:8px}",
  ".wbm-acct-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}",
  ".wbm-acct-foot{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}",
  ".wbm-check{display:flex;align-items:center;gap:6px;font-size:12px;padding-top:18px}",
  ".wbm-hint-line{margin:0;font-size:11px;line-height:1.6;color:var(--wb-muted,#6b7280)}",
  /* 保险箱门禁 */
  ".wbm-gate-wrap{display:flex;flex-direction:column;gap:8px}",
  ".wbm-gate{border:1px solid var(--wb-warn,#f59e0b);border-radius:9px;padding:10px;display:flex;flex-direction:column;gap:8px;background:color-mix(in srgb, var(--wb-warn,#f59e0b) 8%, transparent)}",
  ".wbm-gate-title{font-size:13px;font-weight:650}",
  ".wbm-gate-text{margin:0;font-size:12px;line-height:1.6;color:var(--wb-muted,#6b7280)}",
  ".wbm-gate-row{max-width:320px}",
  /* 账户卡片 */
  ".wbm-cards{display:flex;flex-direction:column;gap:8px}",
  ".wbm-cards .wbm-card{display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap}",
  ".wbm-card-main{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}",
  ".wbm-card-title{font-size:13px;font-weight:650}",
  ".wbm-card-sub{font-size:12px}",
  ".wbm-card-meta{font-size:11px;color:var(--wb-muted,#6b7280)}",
  ".wbm-card-actions{display:flex;gap:6px;flex-wrap:wrap}",
  ".wbm-card-result{display:flex;align-items:center;gap:6px;flex:1 0 100%;font-size:12px;line-height:1.6}",
  ".wbm-acct-form > .wbm-btn{align-self:flex-start}",
  /* 基础 pill / danger 按钮用固定浅色，深色主题下自己按主题 token 重算一次 */
  ".wbm-card-result .wbm-pill.ok{background:color-mix(in srgb,var(--wb-ok,#047857) 16%,transparent);color:var(--wb-ok,#047857)}",
  ".wbm-card-result .wbm-pill.error{background:color-mix(in srgb,var(--wb-danger,#b91c1c) 16%,transparent);color:var(--wb-danger,#b91c1c)}",
  ".wbm-card-actions .wbm-btn.danger{color:var(--wb-danger,#b91c1c);border-color:color-mix(in srgb,var(--wb-danger,#b91c1c) 45%,transparent)}",
]).join("\n");
