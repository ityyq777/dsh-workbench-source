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
    s + "-btn.primary{background:var(--wb-accent,#2563eb);border-color:var(--wb-accent,#2563eb);color:var(--dsw-alias-label-primary-inverted,#fff)}",
    s + "-btn.danger{color:var(--wb-danger,#b91c1c);border-color:color-mix(in oklab,var(--wb-danger,#b91c1c) 35%,transparent)}",
    s + "-field{display:flex;flex-direction:column;gap:4px;font-size:12px}" + s + "-label{font-weight:600}",
    s + "-field input," + s + "-field select," + s + "-field textarea{border:1px solid var(--wb-border,#d1d5db);border-radius:7px;padding:6px 8px;font:inherit;background:var(--wb-surface,#fff);color:inherit;min-width:0}",
    s + "-hint{color:var(--wb-muted,#6b7280);font-size:11px}" + s + "-notice{padding:8px 10px;border-radius:8px;font-size:12px;background:color-mix(in oklab,var(--wb-accent,#2563eb) 9%,transparent);color:var(--dsw-alias-label-primary,inherit)}",
    s + "-notice.error{background:color-mix(in oklab,var(--wb-danger,#b91c1c) 10%,transparent);color:var(--wb-danger,#b91c1c)}" + s + "-notice.ok{background:color-mix(in oklab,var(--wb-ok,#047857) 10%,transparent);color:var(--wb-ok,#047857)}",
    s + "-empty{padding:18px;text-align:center;color:var(--wb-muted,#6b7280);font-size:12px;border:1px dashed var(--wb-border,#e5e7eb);border-radius:8px}",
    s + "-pill{display:inline-block;padding:1px 7px;border-radius:999px;font-size:11px;background:color-mix(in oklab,currentColor 7%,transparent);color:inherit}",
    s + "-pill.ok{background:color-mix(in oklab,var(--wb-ok,#047857) 12%,transparent);color:var(--wb-ok,#047857)}" + s + "-pill.error{background:color-mix(in oklab,var(--wb-danger,#b91c1c) 12%,transparent);color:var(--wb-danger,#b91c1c)}" + s + "-pill.warn{background:color-mix(in oklab,var(--wb-warn,#b45309) 14%,transparent);color:var(--wb-warn,#b45309)}",
    s + "-json{margin:0;padding:8px;background:color-mix(in oklab,currentColor 4%,transparent);border-radius:8px;font-size:11px;max-height:240px;overflow:auto}",
    s + "-muted{color:var(--wb-muted,#6b7280)}" + s + "-link{color:var(--wb-accent,#2563eb);cursor:pointer;text-decoration:none}",
    s + "-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}",
    // 窄屏：页面容器不再自带左右内边距（宿主的 .wb-immersive-main 已经给过），
    // 卡片与栅格收紧，把宽度尽量留给内容——窄屏下两侧留白比桌面更影响可读性。
    "@media(max-width:760px){" + s + "-wrap{padding:0 0 8px;gap:10px}"
      + s + "-card{padding:12px;border-radius:10px}"
      + s + "-grid{grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px}"
      + s + "-form{grid-template-columns:minmax(0,1fr)}"
      + s + "-title{font-size:15px}"
      // 图标 + 文字按钮在窄屏收成图标按钮：中文标签很容易被挤成两行（「返回首页」「同步最新邮件」）。
      // Button 组件（lib/button.cjs）已经给这类按钮加了 aria-label/title，去掉文字不失可访问性。
      + s + "-btn." + s + "-icon-text ." + s + "-btn-label{display:none}"
      + s + "-btn." + s + "-icon-text{padding-left:8px;padding-right:8px}"
      // 走 iconLabel() 塞进按钮的「图标 + 文字」同样收成图标按钮（消息工具栏、自动化规则条等）。
      + "button .wb-icon-label-text{display:none}"
      // 基础表格在窄屏改成「按内容宽度 + 外层横向滚动」，避免多列表格被压成一列两个字。
      + s + "-table-wrap{overflow-x:auto;max-width:100%}"
      + s + "-table{width:max-content;min-width:100%}"
      + "}"
      // 手机宽度：再压一档内边距，横向零浪费。
      + "@media(max-width:420px){" + s + "-wrap{padding:0 0 6px}"
      + s + "-card{padding:10px}"
      + s + "-grid{grid-template-columns:repeat(auto-fit,minmax(120px,1fr))}"
      + "}",
  ]);
};

/** 只想要明文框样式的插件（vault / sites 等自带样式表）可以直接取这一段。 */
module.exports.secretFieldStyles = SECRET_FIELD;
