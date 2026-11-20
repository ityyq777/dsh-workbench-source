"use strict";
// 弹幕层的样式：宿主页面里的固定层 + 桌面透明窗共用同一套视觉规则（桌面端另行内联）。
// 颜色全部来自 DSH 主题变量，由 mount 侧读出后写到 --wbdm-* 上；这里只给兜底值。
// 视觉目标：像“浮在界面上的气泡”，而不是盖在内容上的卡片——半透明底 + 细边 + 轻阴影。

module.exports = function overlayStyles() {
  return [
    ".wbdm-dm-root{position:fixed;inset:0;z-index:780;pointer-events:none;overflow:hidden;contain:layout paint;-webkit-app-region:no-drag}",
    ".wbdm-dm-root[data-layer=overlay]{position:absolute;inset:0;z-index:20}",
    ".wbdm-dm-field{position:absolute;inset:0;overflow:hidden}",
    ".wbdm-dm-chip{position:absolute;left:0;top:0;display:inline-flex;align-items:center;gap:7px;padding:4px 13px 4px 11px;border-radius:999px;",
    "border:1px solid var(--wbdm-border,rgba(0,0,0,.10));background:var(--wbdm-chip-bg,rgba(255,255,255,.82));",
    "color:var(--wbdm-fg,#1f2328);font-size:var(--wbdm-font-size,15px);font-weight:480;line-height:1.45;white-space:nowrap;letter-spacing:.012em;",
    "opacity:var(--wbdm-opacity,1);box-shadow:0 3px 12px var(--wbdm-shadow,rgba(0,0,0,.10)),0 1px 2px rgba(0,0,0,.06);",
    "backdrop-filter:blur(7px) saturate(1.15);-webkit-backdrop-filter:blur(7px) saturate(1.15);",
    "will-change:transform;backface-visibility:hidden;contain:layout style}",
    ".wbdm-dm-chip .wbdm-dm-dot{width:5px;height:5px;border-radius:50%;background:var(--dot,currentColor);opacity:.85;flex:0 0 auto}",
    ".wbdm-dm-tone-normal{--dot:var(--wbdm-fg,#6b7280)}",
    ".wbdm-dm-tone-accent{--dot:var(--wbdm-accent,#2563eb);color:var(--wbdm-accent,#1d4ed8)}",
    ".wbdm-dm-tone-success{--dot:var(--wbdm-ok,#15803d);color:var(--wbdm-ok,#15803d)}",
    ".wbdm-dm-tone-warn{--dot:var(--wbdm-warn,#b45309);color:var(--wbdm-warn,#b45309)}",
    ".wbdm-dm-tone-danger{--dot:var(--wbdm-danger,#b91c1c);color:var(--wbdm-danger,#b91c1c)}",
    "@media (prefers-reduced-motion: reduce){.wbdm-dm-chip{transition:none}}",
  ];
};
