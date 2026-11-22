"use strict";
// Action 页的样式：清单 + agent 开关，沿用工作台主题 token，深浅色自动适配。
// 响应式分两档：≤760px（窗口收窄 / 平板）与 ≤420px（手机）。窄屏把五列参数表改成
// 「参数卡片」网格：名称、类型、必填挤一行，约束与说明各占整行；工具栏改成分栏布局。
module.exports = function (PREFIX, DOMAIN) {
  var P = PREFIX + "-as";
  var hairline = "1px solid color-mix(in oklab,currentColor 8%,transparent)";
  var CSS = [
    "." + P + "{display:flex;flex-direction:column;gap:12px;width:100%;min-width:0;font-size:13px;color:inherit}",
    "." + P + "-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
    "." + P + "-title{font-size:15px;font-weight:660;margin:0}",
    "." + P + "-badge{display:inline-flex;align-items:center;gap:4px;max-width:100%;border:1px solid var(--wb-border,#e3e5e9);border-radius:999px;padding:1px 8px;font-size:11px;color:var(--dsw-alias-label-secondary,currentColor);font-variant-numeric:tabular-nums;overflow-wrap:anywhere}",
    "." + P + "-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px}",
    "." + P + "-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
    "." + P + "-search{position:relative;flex:1 1 220px;min-width:0;display:flex;align-items:center}",
    "." + P + "-search input{width:100%;border:1px solid var(--wb-border,#e3e5e9);border-radius:8px;background:var(--wb-surface,var(--dsw-alias-bg-layer-1,transparent));color:inherit;font:inherit;padding:6px 10px 6px 30px}",
    "." + P + "-search input:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4f6ef7);outline-offset:1px}",
    "." + P + "-search .wbi-svg{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--dsw-alias-label-tertiary,inherit)}",
    "." + P + " select{border:1px solid var(--wb-border,#e3e5e9);border-radius:8px;background:var(--wb-surface,var(--dsw-alias-bg-layer-1,transparent));color:inherit;font:inherit;padding:6px 8px;max-width:100%}",
    "." + P + " select:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4f6ef7);outline-offset:1px}",
    "." + P + "-list{display:flex;flex-direction:column;gap:8px}",
    "." + P + "-card{border:1px solid var(--wb-border,#e3e5e9);border-radius:10px;padding:10px 12px;background:var(--wb-surface,var(--dsw-alias-bg-layer-1,transparent));display:flex;flex-direction:column;gap:8px;min-width:0}",
    "." + P + "-cardhead{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:start;gap:8px}",
    "." + P + "-cardmeta{display:flex;align-items:center;flex-wrap:wrap;gap:8px;min-width:0;min-height:24px}",
    "." + P + "-cardhead code{font-weight:640;overflow-wrap:anywhere;min-width:0}",
    "." + P + "-hintline{margin:0;color:var(--dsw-alias-label-tertiary,inherit);font-size:11.5px;line-height:1.5}",
    "." + P + "-origins{display:inline-flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end;min-width:0}",
    "." + P + "-origins-label{font-size:11px;color:var(--wb-muted);white-space:nowrap}",
    "." + P + "-origin{display:inline-flex;align-items:center;gap:4px;font-size:11.5px;color:var(--wb-muted);cursor:pointer;user-select:none}",
    // 该 action 本身不支持的来源：整项置灰、不可点，示意「不是没开，是开不了」。
    "." + P + "-origin-off{opacity:.55;cursor:not-allowed}",
    "." + P + "-origin input[type=checkbox]{width:13px;height:13px;margin:0;accent-color:var(--wb-accent);cursor:inherit}",
    "." + P + "-origin input[type=checkbox]:focus-visible{outline:2px solid var(--wb-accent);outline-offset:2px}",
    "." + P + "-locked{border-color:var(--wb-warn,#b7791f);color:var(--wb-warn,#b7791f)}",
    "." + P + "-desc{margin:0;color:var(--dsw-alias-label-secondary,inherit);line-height:1.55;font-size:12.5px;overflow-wrap:anywhere}",
    // 搜索命中：用品牌色透明度叠加而不是写死浅色，深浅主题都可读；继承文字颜色、不覆盖 ::selection。
    "." + P + " mark." + P + "-hit{background:color-mix(in oklab,var(--dsw-alias-brand-primary,#4f6ef7) 22%,transparent);color:inherit;border-radius:2px;padding:0;font:inherit;box-decoration-break:clone;-webkit-box-decoration-break:clone}",
    "." + P + "-table{width:100%;border-collapse:collapse;font-size:12px;table-layout:auto}",
    "." + P + "-table th{text-align:left;font-weight:620;font-size:11px;letter-spacing:.4px;text-transform:uppercase;color:var(--dsw-alias-label-tertiary,inherit);padding:4px 8px 4px 0;white-space:nowrap}",
    "." + P + "-table td{padding:4px 8px 4px 0;vertical-align:top;border-top:" + hairline + ";line-height:1.5;overflow-wrap:anywhere}",
    "." + P + "-req{color:var(--dsw-alias-state-error-primary,#d9534f);font-weight:620}",
    "." + P + "-opt{color:var(--dsw-alias-label-tertiary,inherit)}",
    "." + P + "-none{color:var(--dsw-alias-label-tertiary,inherit);font-size:12px}",
    "." + P + "-example{position:relative;display:flex;flex-direction:column;gap:4px;min-width:0}",
    "." + P + "-examplehead{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}",
    "." + P + "-pre{margin:0;padding:8px 10px;border-radius:8px;background:var(--dsw-alias-bg-skeleton,#f2f3f5);color:inherit;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;line-height:1.5;overflow:auto;max-height:280px;white-space:pre-wrap;word-break:break-word}",
    "." + P + "-copy{border:1px solid var(--wb-border,#e3e5e9);border-radius:7px;background:transparent;color:inherit;font:inherit;font-size:11.5px;padding:2px 8px;cursor:pointer}",
    "." + P + "-copy:hover{background:var(--dsw-alias-interactive-bg-hover,color-mix(in oklab,currentColor 5%,transparent))}",
    "." + P + "-copy:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4f6ef7);outline-offset:2px}",
    "." + P + " details>summary{cursor:pointer;font-size:11.5px;color:var(--dsw-alias-label-secondary,inherit);width:max-content}",
    "." + P + " details>summary:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4f6ef7);outline-offset:2px}",
    // 参数折叠面板：折叠时只留一行「参数 · 必填 n」，展开后与表格之间留一点气口。
    "." + P + "-params{min-width:0}",
    "." + P + "-params>summary{user-select:none;max-width:100%}",
    "." + P + "-params[open]>summary{margin-bottom:6px}",
    "." + P + "-empty{padding:24px;text-align:center;border:1px dashed var(--wb-border,#e3e5e9);border-radius:10px;color:var(--dsw-alias-label-tertiary,inherit)}",
    "." + P + "-error{padding:12px;border:1px solid var(--dsw-alias-state-error-primary,#d9534f);border-radius:10px;color:var(--dsw-alias-state-error-primary,#d9534f);display:flex;gap:10px;align-items:center;flex-wrap:wrap;overflow-wrap:anywhere}",
    "." + P + "-toast{position:sticky;bottom:8px;align-self:flex-start;border-radius:999px;padding:3px 10px;background:var(--dsw-alias-bg-skeleton,#f2f3f5);font-size:11.5px;max-width:100%}",
    // 窄屏：五列参数表压成一列会丢失列名、且 table 布局按最小内容宽度撑破容器，
    // 这里整体改成块级网格：每行 = 名称 / 类型 / 必填 + 约束行 + 说明行，行间用细线分隔。
    "@media(max-width:760px){"
      + "." + P + "-toolbar{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;align-items:end}"
      + "." + P + "-search{grid-column:1/-1}"
      + "." + P + "-toolbar>label{display:flex;flex-direction:column;align-items:stretch;gap:4px;min-width:0}"
      + "." + P + "-toolbar select{width:100%;min-width:0}"
      + "." + P + "-cardhead{grid-template-columns:minmax(0,1fr);row-gap:6px}"
      + "." + P + "-origins{justify-content:flex-start}"
      + "." + P + "-table{display:block}"
      + "." + P + "-table thead{display:none}"
      + "." + P + "-table tbody{display:block}"
      + "." + P + "-table tr{display:grid;grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:\"name type need\" \"extra extra extra\" \"desc desc desc\";column-gap:8px;padding:9px 0;border-top:" + hairline + "}"
      + "." + P + "-table tr:first-child{border-top:0;padding-top:2px}"
      + "." + P + "-table tr:last-child{padding-bottom:2px}"
      + "." + P + "-table td{display:block;border:0;padding:0;min-width:0}"
      + "." + P + "-table td:empty{display:none}"
      + "." + P + "-pname{grid-area:name;font-weight:640}"
      + "." + P + "-ptype{grid-area:type;justify-self:start;align-self:center;color:var(--dsw-alias-label-tertiary,inherit)}"
      + "." + P + "-pneed{grid-area:need;justify-self:end;align-self:center;font-size:11px;line-height:1.6;white-space:nowrap}"
      + "." + P + "-pextra{grid-area:extra;margin-top:3px;color:var(--dsw-alias-label-secondary,inherit);line-height:1.55}"
      + "." + P + "-pdesc{grid-area:desc;margin-top:3px;color:var(--dsw-alias-label-secondary,inherit);line-height:1.55}"
      + "}",
    // 中等宽度（521–760px）三个筛选项正好排成一行，避免第三项独占一行显得参差。
    "@media(min-width:521px) and (max-width:760px){"
      + "." + P + "-toolbar{grid-template-columns:repeat(3,minmax(0,1fr))}"
      + "}",
    "@media(max-width:420px){"
      + "." + P + "-toolbar{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}"
      + "." + P + "-card{padding:10px}"
      + "." + P + "-table tr{padding:8px 0}"
      + "}",
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
