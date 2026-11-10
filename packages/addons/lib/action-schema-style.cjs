"use strict";
// Action 页的样式：只读清单，沿用工作台主题 token，深浅色自动适配。
module.exports = function (PREFIX, DOMAIN) {
  var P = PREFIX + "-as";
  var CSS = [
    "." + P + "{display:flex;flex-direction:column;gap:12px;width:100%;min-width:0;font-size:13px;color:inherit}",
    "." + P + "-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
    "." + P + "-title{font-size:15px;font-weight:660;margin:0}",
    "." + P + "-badge{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--wb-border,#e3e5e9);border-radius:999px;padding:1px 8px;font-size:11px;color:var(--dsw-alias-label-secondary,currentColor);font-variant-numeric:tabular-nums}",
    "." + P + "-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px}",
    "." + P + "-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
    "." + P + "-search{position:relative;flex:1 1 220px;min-width:0;display:flex;align-items:center}",
    "." + P + "-search input{width:100%;border:1px solid var(--wb-border,#e3e5e9);border-radius:8px;background:var(--wb-surface,var(--dsw-alias-bg-layer-1,transparent));color:inherit;font:inherit;padding:6px 10px 6px 30px}",
    "." + P + "-search input:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4f6ef7);outline-offset:1px}",
    "." + P + "-search .wbi-svg{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--dsw-alias-label-tertiary,inherit)}",
    "." + P + " select{border:1px solid var(--wb-border,#e3e5e9);border-radius:8px;background:var(--wb-surface,var(--dsw-alias-bg-layer-1,transparent));color:inherit;font:inherit;padding:6px 8px}",
    "." + P + " select:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4f6ef7);outline-offset:1px}",
    "." + P + "-list{display:flex;flex-direction:column;gap:8px}",
    "." + P + "-card{border:1px solid var(--wb-border,#e3e5e9);border-radius:10px;padding:10px 12px;background:var(--wb-surface,var(--dsw-alias-bg-layer-1,transparent));display:flex;flex-direction:column;gap:8px;min-width:0}",
    "." + P + "-cardhead{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
    "." + P + "-cardhead code{font-weight:640}",
    "." + P + "-desc{margin:0;color:var(--dsw-alias-label-secondary,inherit);line-height:1.55;font-size:12.5px}",
    // 搜索命中：用品牌色透明度叠加而不是写死浅色，深浅主题都可读；继承文字颜色、不覆盖 ::selection。
    "." + P + " mark." + P + "-hit{background:color-mix(in oklab,var(--dsw-alias-brand-primary,#4f6ef7) 22%,transparent);color:inherit;border-radius:2px;padding:0;font:inherit;box-decoration-break:clone;-webkit-box-decoration-break:clone}",
    "." + P + "-table{width:100%;border-collapse:collapse;font-size:12px;table-layout:auto}",
    "." + P + "-table th{text-align:left;font-weight:620;font-size:11px;letter-spacing:.4px;text-transform:uppercase;color:var(--dsw-alias-label-tertiary,inherit);padding:4px 8px 4px 0;white-space:nowrap}",
    "." + P + "-table td{padding:4px 8px 4px 0;vertical-align:top;border-top:1px solid color-mix(in oklab,currentColor 8%,transparent);line-height:1.5}",
    "." + P + "-req{color:var(--dsw-alias-state-error-primary,#d9534f);font-weight:620}",
    "." + P + "-opt{color:var(--dsw-alias-label-tertiary,inherit)}",
    "." + P + "-none{color:var(--dsw-alias-label-tertiary,inherit);font-size:12px}",
    "." + P + "-example{position:relative;display:flex;flex-direction:column;gap:4px}",
    "." + P + "-examplehead{display:flex;align-items:center;justify-content:space-between;gap:8px}",
    "." + P + "-pre{margin:0;padding:8px 10px;border-radius:8px;background:var(--dsw-alias-bg-skeleton,#f2f3f5);color:inherit;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;line-height:1.5;overflow:auto;max-height:280px;white-space:pre-wrap;word-break:break-word}",
    "." + P + "-copy{border:1px solid var(--wb-border,#e3e5e9);border-radius:7px;background:transparent;color:inherit;font:inherit;font-size:11.5px;padding:2px 8px;cursor:pointer}",
    "." + P + "-copy:hover{background:var(--dsw-alias-interactive-bg-hover,color-mix(in oklab,currentColor 5%,transparent))}",
    "." + P + "-copy:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4f6ef7);outline-offset:2px}",
    "." + P + " details>summary{cursor:pointer;font-size:11.5px;color:var(--dsw-alias-label-secondary,inherit);width:max-content}",
    "." + P + " details>summary:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4f6ef7);outline-offset:2px}",
    "." + P + "-empty{padding:24px;text-align:center;border:1px dashed var(--wb-border,#e3e5e9);border-radius:10px;color:var(--dsw-alias-label-tertiary,inherit)}",
    "." + P + "-error{padding:12px;border:1px solid var(--dsw-alias-state-error-primary,#d9534f);border-radius:10px;color:var(--dsw-alias-state-error-primary,#d9534f);display:flex;gap:10px;align-items:center}",
    "." + P + "-toast{position:sticky;bottom:8px;align-self:flex-start;border-radius:999px;padding:3px 10px;background:var(--dsw-alias-bg-skeleton,#f2f3f5);font-size:11.5px}",
    "@media(max-width:600px){" + "." + P + "-table thead{display:none}" + "." + P + "-table td{display:block;border-top:0;padding:2px 0}" + "." + P + "-table tr{display:block;border-top:1px solid color-mix(in oklab,currentColor 8%,transparent);padding:4px 0}}",
  ].join("\n");
  return function injectCss() {
    if (typeof document === "undefined") return;
    var id = "wb-addon-" + DOMAIN + "-actions-css";
    var old = document.getElementById(id);
    if (old) { old.textContent = CSS; return; }
    var style = document.createElement("style");
    style.id = id;
    style.setAttribute("data-wb-addon", "wb-addon-" + DOMAIN);
    style.textContent = CSS;
    document.head.appendChild(style);
  };
};
