"use strict";
/**
 * 新插件的基础样式（wrap/head/card/table/button/field/notice/pill/json 等）。
 *
 * 六个插件原本各复制一份，只差 CSS 前缀。这里按前缀生成同一组规则；
 * 插件特有的页面（日历列表、邮件三栏等）再用 .concat([...]) 追加。
 */
/**
 * 明文切换输入框（lib/secret-field.cjs）的样式：类名固定为 .wb-secret-field /
 * .wb-eye，与插件前缀无关，所以不用 prefix 生成，直接进基础样式表。
 */
var SECRET_FIELD = [
  ".wb-secret-field{position:relative;display:flex;align-items:center;min-width:0}",
  ".wb-secret-field input{flex:1 1 auto;min-width:0;padding-right:34px}",
  ".wb-eye{position:absolute;right:4px;display:inline-flex;align-items:center;justify-content:center;background:transparent;border:0;border-radius:6px;padding:4px;color:var(--wb-muted,#6b7280);cursor:pointer}",
  ".wb-eye:hover:not(:disabled){color:var(--wb-accent,#2563eb);background:color-mix(in srgb, var(--wb-accent,#2563eb) 12%, transparent)}",
  ".wb-eye:focus-visible{outline:2px solid var(--wb-accent,#2563eb);outline-offset:1px}",
  ".wb-eye:disabled{opacity:.45;cursor:not-allowed}",
];

module.exports = function baseStyles(prefix) {
  var p = String(prefix || "wb");
  var s = "." + p;
  return SECRET_FIELD.concat([
    s + "-wrap{display:flex;flex-direction:column;gap:12px;padding:16px;overflow:auto;height:100%;box-sizing:border-box}",
    s + "-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}",
    s + "-title{font-size:16px;font-weight:650;margin:0}",
    s + "-sub{font-size:12px;color:var(--wb-muted,#6b7280);margin:2px 0 0}",
    s + "-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}",
    s + "-card{border:1px solid var(--wb-border,#e5e7eb);border-radius:10px;background:var(--wb-surface,#fff);padding:12px}",
    s + "-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}",
    s + "-kpi{font-size:22px;font-weight:700;line-height:1.2}" + s + "-kpi-label{font-size:12px;color:var(--wb-muted,#6b7280)}",
    s + "-table{width:100%;border-collapse:collapse;font-size:12px}" + s + "-table th," + s + "-table td{padding:7px 8px;border-bottom:1px solid var(--wb-border,#eef0f3);text-align:left;vertical-align:top}",
    s + "-table th{font-weight:600;color:var(--wb-muted,#6b7280);white-space:nowrap}",
    s + "-btn{border:1px solid var(--wb-border,#d1d5db);background:var(--wb-surface,#fff);color:inherit;border-radius:7px;padding:5px 10px;font-size:12px;cursor:pointer}",
    s + "-btn:hover:not(:disabled){border-color:var(--wb-accent,#2563eb)}" + s + "-btn:disabled{opacity:.5;cursor:default}",
    s + "-btn.primary{background:var(--wb-accent,#2563eb);border-color:var(--wb-accent,#2563eb);color:#fff}",
    s + "-btn.danger{color:#b91c1c;border-color:#fecaca}",
    s + "-field{display:flex;flex-direction:column;gap:4px;font-size:12px}" + s + "-label{font-weight:600}",
    s + "-field input," + s + "-field select," + s + "-field textarea{border:1px solid var(--wb-border,#d1d5db);border-radius:7px;padding:6px 8px;font:inherit;background:var(--wb-surface,#fff);color:inherit;min-width:0}",
    s + "-hint{color:var(--wb-muted,#6b7280);font-size:11px}" + s + "-notice{padding:8px 10px;border-radius:8px;font-size:12px;background:#eff6ff;color:#1e40af}",
    s + "-notice.error{background:#fef2f2;color:#b91c1c}" + s + "-notice.ok{background:#ecfdf5;color:#047857}",
    s + "-empty{padding:18px;text-align:center;color:var(--wb-muted,#6b7280);font-size:12px;border:1px dashed var(--wb-border,#e5e7eb);border-radius:8px}",
    s + "-pill{display:inline-block;padding:1px 7px;border-radius:999px;font-size:11px;background:#f3f4f6;color:#374151}",
    s + "-pill.ok{background:#ecfdf5;color:#047857}" + s + "-pill.error{background:#fef2f2;color:#b91c1c}" + s + "-pill.warn{background:#fffbeb;color:#b45309}",
    s + "-json{margin:0;padding:8px;background:#f8fafc;border-radius:8px;font-size:11px;max-height:240px;overflow:auto}",
    s + "-muted{color:var(--wb-muted,#6b7280)}" + s + "-link{color:var(--wb-accent,#2563eb);cursor:pointer;text-decoration:none}",
    s + "-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}",
  ]);
};

/** 只想要明文框样式的插件（vault / sites 等自带样式表）可以直接取这一段。 */
module.exports.secretFieldStyles = SECRET_FIELD;
