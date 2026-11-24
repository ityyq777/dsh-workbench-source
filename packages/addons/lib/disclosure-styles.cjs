"use strict";
/**
 * 折叠面板的样式：类名固定为 .wb-disc 系列，与插件前缀无关。
 *
 * 原因与 secret-field 一致：宿主与业务插件共用同一个控件，折叠头的字号、字重、
 * 三角位置必须完全一致，一旦按前缀各生成一份，就又会分叉。颜色全部走主题 token。
 */
module.exports = [
  ".wb-disc{min-width:0;border:0;padding:0;margin:0}",
  // 原生 details/summary 保留键盘与无障碍语义，这里只接管观感：去掉默认三角并铺满整行。
  ".wb-disc>summary{display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12.5px;font-weight:600;line-height:1.6;color:inherit;user-select:none;list-style:none;padding:2px 8px 2px 2px;margin:-2px -8px -2px -2px;border-radius:7px}",
  ".wb-disc>summary::-webkit-details-marker{display:none}",
  ".wb-disc>summary::marker{content:\"\"}",
  ".wb-disc>summary:hover{background:color-mix(in oklab,currentColor 6%,transparent)}",
  ".wb-disc>summary:focus-visible{outline:2px solid var(--wb-accent,var(--dsw-alias-brand-primary,Highlight));outline-offset:2px}",
  ".wb-disc-chev{flex:0 0 auto;width:14px;height:14px;transition:transform 160ms ease}",
  ".wb-disc[open]>summary .wb-disc-chev{transform:rotate(90deg)}",
  ".wb-disc-title{min-width:0;overflow-wrap:anywhere}",
  ".wb-disc-meta{font-weight:400;font-size:12px;color:var(--wb-muted,var(--dsw-alias-label-tertiary,GrayText))}",
  ".wb-disc-body{margin-top:8px;min-width:0;animation:wb-disc-in 160ms ease}",
  "@keyframes wb-disc-in{from{opacity:0;transform:translateY(-2px)}to{opacity:1;transform:none}}",
  "@media(prefers-reduced-motion:reduce){.wb-disc-chev{transition:none}.wb-disc-body{animation:none}}",
].join("\n");
