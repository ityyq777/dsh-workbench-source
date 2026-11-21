"use strict";
/**
 * 全局消息悬浮按钮的样式。颜色只走 --wb-* 主题 token，不写死色板；
 * 容器 `pointer-events:none`、按钮 `auto`，保证常驻层不吃页面点击。
 * z-index 860：高于弹幕层（780）、低于弹窗（900），提示浮在内容之上但不盖住对话框。
 */
module.exports = function floatStyles() {
  return [
    ".wbm-float-root{position:fixed;inset:0;z-index:860;pointer-events:none;-webkit-app-region:no-drag}",
    ".wbm-float-btn{position:absolute;right:20px;bottom:20px;display:inline-flex;align-items:center;justify-content:center;",
    "width:48px;height:48px;padding:0;border-radius:999px;cursor:pointer;pointer-events:auto;-webkit-app-region:no-drag;",
    "border:1px solid var(--wb-border,rgba(0,0,0,.12));background:var(--wb-card,#fff);color:inherit;",
    "box-shadow:0 6px 18px rgba(0,0,0,.14),0 1px 3px rgba(0,0,0,.08);transition:transform .18s ease,box-shadow .18s ease,background .18s ease}",
    ".wbm-float-btn:hover{transform:translateY(-1px);box-shadow:0 10px 24px rgba(0,0,0,.18)}",
    ".wbm-float-btn:active{transform:translateY(0)}",
    ".wbm-float-btn:focus-visible{outline:2px solid var(--wb-accent,#2563eb);outline-offset:2px}",
    ".wbm-float-btn[data-pos=bottom-left]{left:20px;right:auto}",
    // 页面底部有输入框时抬到它上面，避免压在发送按钮上（没有输入框就贴右下角）。
    ".wbm-float-btn[data-lift]{bottom:var(--wbm-float-lift,76px)}",
    ".wbm-float-btn svg{display:block;width:22px;height:22px}",
    ".wbm-float-badge{position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;padding:0 5px;border-radius:999px;",
    "display:none;align-items:center;justify-content:center;background:var(--wb-danger,#dc2626);color:#fff;",
    "font-size:11px;font-weight:650;line-height:1;font-variant-numeric:tabular-nums;box-shadow:0 0 0 2px var(--wb-card,#fff)}",
    ".wbm-float-btn[data-unread] .wbm-float-badge{display:inline-flex}",
    ".wbm-float-btn[data-pulse=1]{animation:wbm-float-bounce .6s cubic-bezier(.34,1.56,.64,1)}",
    "@keyframes wbm-float-bounce{0%{transform:translateY(0)}35%{transform:translateY(-7px)}70%{transform:translateY(0)}100%{transform:translateY(0)}}",
    "@media (max-width:640px){.wbm-float-btn{width:40px;height:40px;right:12px;bottom:12px}",
    ".wbm-float-btn[data-pos=bottom-left]{left:12px;right:auto}.wbm-float-btn svg{width:19px;height:19px}}",
    // 降低动态偏好：不做位移，只让角标与按钮描边闪一次颜色。
    "@media (prefers-reduced-motion: reduce){.wbm-float-btn[data-pulse=1]{animation:none;border-color:var(--wb-accent,#2563eb)}",
    ".wbm-float-btn{transition:none}}",
  ];
};
