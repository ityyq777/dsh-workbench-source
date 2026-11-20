"use strict";
// 弹幕层的样式：宿主页面里的固定层 + 桌面透明窗共用同一套视觉规则（桌面端另行内联）。
// 颜色全部来自 DSH 主题变量，由 mount 侧读出后写到 --wbdm-* 上；这里只给兜底值。

module.exports = function overlayStyles() {
  return [
    ".wbdm-dm-root{position:fixed;inset:0;z-index:780;pointer-events:none;overflow:hidden;contain:layout paint;-webkit-app-region:no-drag}",
    ".wbdm-dm-root[data-layer=overlay]{position:absolute;inset:0;z-index:20}",
    ".wbdm-dm-field{position:absolute;inset:0;overflow:hidden}",
    ".wbdm-dm-chip{position:absolute;left:0;top:0;display:inline-flex;align-items:center;gap:7px;padding:3px 11px;border-radius:999px;",
    "border:1px solid var(--wbdm-border,rgba(0,0,0,.14));background:var(--wbdm-chip-bg,color-mix(in srgb, var(--wbdm-bg,#fff) 90%, transparent));",
    "color:var(--wbdm-fg,#111827);font-size:var(--wbdm-font-size,15px);line-height:1.4;white-space:nowrap;letter-spacing:.01em;",
    "opacity:var(--wbdm-opacity,1);box-shadow:0 1px 4px var(--wbdm-shadow,rgba(0,0,0,.12));will-change:transform;backface-visibility:hidden;",
    "contain:layout style}",
    ".wbdm-dm-chip .wbdm-dm-dot{width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.5;flex:0 0 auto}",
    ".wbdm-dm-tone-normal{color:var(--wbdm-fg,#111827)}",
    ".wbdm-dm-tone-accent{color:var(--wbdm-accent,#2563eb);border-color:var(--wbdm-accent,#2563eb)}",
    ".wbdm-dm-tone-success{color:var(--wbdm-ok,#15803d);border-color:var(--wbdm-ok,#15803d)}",
    ".wbdm-dm-tone-warn{color:var(--wbdm-warn,#b45309);border-color:var(--wbdm-warn,#b45309)}",
    ".wbdm-dm-tone-danger{color:var(--wbdm-danger,#b91c1c);border-color:var(--wbdm-danger,#b91c1c)}",
    "@media (prefers-reduced-motion: reduce){.wbdm-dm-chip{transition:none}}",
  ];
};
