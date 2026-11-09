"use strict";
module.exports = function (DOMAIN, PREFIX) {
var P = PREFIX + "-data";
var CSS = [
  require("./visual-tokens.cjs"),
  "." + P + "-search:has(.wbi-svg) input{padding-left:30px}." + P + "-search>.wbi-svg{position:absolute;left:10px;top:50%;transform:translateY(-50%)}",
  "." + P + "-btn{transition:background var(--wb-motion),border-color var(--wb-motion)}",
  "@media(max-width:480px){." + P + "-head>." + P + "-btn:has(.wbi-svg){width:32px;height:32px;padding:0;justify-content:center}." + P + "-head>." + P + "-btn:has(.wbi-svg) ." + P + "-btnlabel{display:none}}",
  "." + P + "{--cfg-line:var(--wb-border);--cfg-surface:var(--wb-surface,var(--dsw-alias-bg-layer-1,transparent));--cfg-muted:var(--dsw-alias-label-secondary,color-mix(in oklab,currentColor 62%,transparent));--cfg-faint:var(--dsw-alias-label-tertiary,color-mix(in oklab,currentColor 42%,transparent));--cfg-hover:var(--dsw-alias-interactive-bg-hover,color-mix(in oklab,currentColor 5%,transparent));display:grid;grid-template-columns:216px minmax(0,1fr);gap:16px;width:100%;min-width:0;color:inherit;font-size:13px;align-items:start}",
  "." + P + "-side{position:sticky;top:12px;display:flex;flex-direction:column;gap:3px;border:1px solid var(--cfg-line);border-radius:var(--wb-radius-card);background:var(--cfg-surface);padding:8px;box-shadow:0 1px 2px color-mix(in oklab,currentColor 3%,transparent)}",
  "." + P + "-sidetitle{display:flex;align-items:center;justify-content:space-between;padding:6px 10px 8px;font-size:11px;font-weight:660;letter-spacing:.6px;text-transform:uppercase;color:var(--cfg-faint)}",
  "." + P + "-stab{display:flex;flex-direction:column;gap:3px;align-items:stretch;border:1px solid transparent;background:transparent;border-radius:9px;padding:8px 10px;font:inherit;color:inherit;text-align:left;cursor:pointer;position:relative;transition:background .12s ease,border-color .12s ease}",
  "." + P + "-stab:hover{background:var(--cfg-hover)}",
  "." + P + "-stab:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,currentColor);outline-offset:2px}",
  "." + P + "-stab.on{background:color-mix(in oklab,currentColor 6%,transparent);border-color:var(--cfg-line)}",
  "." + P + "-stab.on::before{content:'';position:absolute;left:-1px;top:9px;bottom:9px;width:2px;border-radius:2px;background:var(--dsw-alias-brand-primary,currentColor)}",
  "." + P + "-stabname{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;line-height:1.4;min-width:0}",
  "." + P + "-stabname span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
  "." + P + "-sidetable{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px;color:var(--cfg-muted);margin-top:3px;letter-spacing:.2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
  "." + P + "-sidecount{margin-left:auto;font-size:10.5px;font-variant-numeric:tabular-nums;color:var(--cfg-muted);background:color-mix(in oklab,currentColor 8%,transparent);border-radius:999px;padding:1px 7px;flex:none}",
  "." + P + "-main{display:flex;flex-direction:column;gap:10px;min-width:0;border:1px solid var(--cfg-line);border-radius:var(--wb-radius-card);background:var(--cfg-surface);padding:14px 16px 12px;box-shadow:0 1px 2px color-mix(in oklab,currentColor 3%,transparent)}",
  "." + P + "-head{display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap}",
  "." + P + "-headmain{min-width:0;flex:1}",
  "." + P + "-head h2{margin:0;font-size:16px;font-weight:660;letter-spacing:.1px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
  "." + P + "-code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;font-weight:500;color:var(--cfg-muted);background:color-mix(in oklab,currentColor 6%,transparent);border-radius:6px;padding:2px 6px}",
  "." + P + "-sub{font-size:11.5px;color:var(--cfg-muted);line-height:1.55;margin-top:4px}",
  "." + P + "-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:2px 0 4px}",
  "." + P + "-search{position:relative;flex:1;min-width:180px;max-width:340px}",
  "." + P + "-search input{width:100%;border:1px solid var(--cfg-line);background:var(--dsw-alias-bg-base,transparent);color:inherit;border-radius:9px;padding:8px 11px;font:inherit;font-size:12.5px;outline:none;transition:border-color .15s ease,box-shadow .15s ease}",
  "." + P + "-search input:hover{border-color:color-mix(in oklab,currentColor 28%,var(--cfg-line))}",
  "." + P + "-search input:focus{border-color:var(--dsw-alias-brand-primary,currentColor);box-shadow:0 0 0 3px color-mix(in oklab,var(--dsw-alias-brand-primary,currentColor) 14%,transparent)}",
  "." + P + "-select{border:1px solid var(--cfg-line);background:var(--dsw-alias-bg-base,transparent);color:inherit;border-radius:9px;padding:7px 10px;font:inherit;font-size:12px;outline:none}",
  "." + P + "-select:focus{border-color:var(--dsw-alias-brand-primary,currentColor);box-shadow:0 0 0 3px color-mix(in oklab,var(--dsw-alias-brand-primary,currentColor) 14%,transparent)}",
  "." + P + "-switch{position:relative;display:inline-flex;align-items:center;gap:7px;cursor:pointer;font-size:12px;color:var(--cfg-muted);user-select:none;padding:4px 2px}",
  "." + P + "-switch input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer}",
  "." + P + "-track{position:relative;width:34px;height:20px;border-radius:999px;background:color-mix(in oklab,currentColor 18%,transparent);transition:background .16s ease;flex:none}",
  "." + P + "-track::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--dsw-alias-label-primary,currentColor);transition:transform .16s ease,background .16s ease}",
  "." + P + "-switch input:checked+." + P + "-track{background:var(--dsw-alias-brand-primary,currentColor)}",
  "." + P + "-switch input:checked+." + P + "-track::after{transform:translateX(14px);background:var(--dsw-alias-label-primary-inverted,var(--dsw-alias-bg-base))}",
  "." + P + "-switch input:focus-visible+." + P + "-track{outline:2px solid var(--dsw-alias-brand-primary,currentColor);outline-offset:2px}",
  "." + P + "-btn{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--cfg-line);background:transparent;color:var(--cfg-muted);border-radius:8px;padding:6px 10px;font:inherit;font-size:11.5px;cursor:pointer;white-space:nowrap;transition:background .12s ease,color .12s ease}",
  "." + P + "-btn:hover{background:var(--cfg-hover);color:var(--dsw-alias-label-primary,inherit)}",
  "." + P + "-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,currentColor);outline-offset:2px}",
  "." + P + "-btn:disabled{opacity:.45;cursor:not-allowed}",
  "." + P + "-btn[aria-busy='true']{opacity:.6}",
  "." + P + "-tablewrap{overflow:auto;max-height:calc(100vh - 300px);border:1px solid var(--cfg-line);border-radius:11px;background:var(--dsw-alias-bg-base,transparent)}",
  "." + P + "-table{border-collapse:separate;border-spacing:0;width:max-content;min-width:100%;font-size:12.5px}",
  "." + P + "-table th{position:sticky;top:0;z-index:2;background:var(--cfg-surface);border-bottom:1px solid var(--cfg-line);padding:0;text-align:left;font-weight:600;white-space:nowrap}",
  "." + P + "-thbtn{display:flex;align-items:baseline;gap:6px;width:100%;border:0;background:transparent;color:inherit;font:inherit;font-size:11.5px;font-weight:660;letter-spacing:.2px;padding:9px 12px;cursor:pointer;text-align:left;white-space:nowrap}",
  "." + P + "-thbtn:hover{background:var(--cfg-hover)}",
  "." + P + "-thbtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,currentColor);outline-offset:-2px}",
  "." + P + "-coltype{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9.5px;font-weight:500;color:var(--cfg-faint);letter-spacing:.3px}",
  "." + P + "-sortmark{color:var(--dsw-alias-brand-primary,currentColor);font-size:10px}",
  "." + P + "-rownum{position:sticky;left:0;z-index:1;background:var(--cfg-surface);color:var(--cfg-faint);text-align:right;font-variant-numeric:tabular-nums;font-size:10.5px;padding:0 8px;width:1%;white-space:nowrap;border-right:1px solid color-mix(in oklab,currentColor 7%,transparent)}",
  "." + P + "-table thead ." + P + "-rownum{z-index:3}",
  "." + P + "-cell{padding:7px 12px;border-bottom:1px solid color-mix(in oklab,currentColor 6%,transparent);max-width:340px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:default;vertical-align:top}",
  "." + P + "-table tbody tr:hover ." + P + "-cell{background:var(--cfg-hover)}",
  "." + P + "-table tbody tr:nth-child(even) ." + P + "-cell,." + P + "-table tbody tr:nth-child(even) ." + P + "-rownum{background:color-mix(in oklab,currentColor 2.5%,transparent)}",
  "." + P + "-cell.num{text-align:right;font-variant-numeric:tabular-nums}",
  "." + P + "-cell.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px}",
  "." + P + "-cell.null{color:var(--cfg-faint);font-style:italic}",
  "." + P + "-cell.json .v{color:var(--dsw-alias-brand-primary,inherit)}",
  "." + P + "-tr.deleted ." + P + "-cell,." + P + "-tr.deleted ." + P + "-rownum{opacity:.55}",
  "." + P + "-tr.deleted ." + P + "-cell .v{text-decoration:line-through;text-decoration-color:color-mix(in oklab,currentColor 35%,transparent)}",
  "." + P + "-delbadge{display:inline-block;margin-left:6px;font-size:9.5px;line-height:1.5;padding:0 5px;border-radius:999px;background:color-mix(in oklab,var(--dsw-alias-state-error-primary,currentColor) 14%,transparent);color:var(--dsw-alias-state-error-primary,inherit);vertical-align:middle}",
  "." + P + "-foot{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-top:2px;font-size:11.5px;color:var(--cfg-muted)}",
  "." + P + "-grow{flex:1}",
  "." + P + "-pageinfo{font-variant-numeric:tabular-nums}",
  "." + P + "-jump{width:56px;border:1px solid var(--cfg-line);background:var(--dsw-alias-bg-base,transparent);color:inherit;border-radius:7px;padding:4px 7px;font:inherit;font-size:11.5px;text-align:right;outline:none}",
  "." + P + "-jump:focus{border-color:var(--dsw-alias-brand-primary,currentColor)}",
  "." + P + "-empty{border:1px dashed var(--cfg-line);border-radius:11px;padding:44px 16px;text-align:center;font-size:12.5px;color:var(--cfg-muted)}",
  "." + P + "-err{display:flex;align-items:center;gap:10px;flex-wrap:wrap;border:1px solid color-mix(in oklab,var(--dsw-alias-state-error-primary,currentColor) 32%,var(--cfg-line));border-radius:10px;padding:9px 12px;color:var(--dsw-alias-state-error-primary,inherit);font-size:12px;line-height:1.5}",
  "." + P + "-skwrap{display:flex;flex-direction:column;gap:1px;padding:2px}",
  "." + P + "-sk{height:26px;border-radius:4px;background:var(--dsw-alias-bg-skeleton,color-mix(in oklab,currentColor 6%,transparent));animation:" + PREFIX + "-data-pulse 1.4s ease-in-out infinite}",
  "@keyframes " + PREFIX + "-data-pulse{0%,100%{opacity:.6}50%{opacity:1}}",
  "." + P + "-toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:40;background:var(--dsw-alias-bg-layer-1,var(--cfg-surface));border:1px solid var(--cfg-line);border-radius:999px;padding:7px 14px;font-size:12px;color:var(--dsw-alias-label-primary,inherit);box-shadow:0 6px 24px color-mix(in oklab,currentColor 18%,transparent)}",
  "." + P + "-mask{position:fixed;inset:0;z-index:30;background:color-mix(in oklab,currentColor 26%,transparent)}",
  "." + P + "-drawer{position:fixed;top:0;right:0;bottom:0;z-index:31;width:min(520px,92vw);display:flex;flex-direction:column;gap:12px;background:var(--dsw-alias-bg-layer-1,var(--cfg-surface));border-left:1px solid var(--cfg-line);box-shadow:-8px 0 28px color-mix(in oklab,currentColor 16%,transparent);padding:18px 20px}",
  "." + P + "-drawer h3{margin:0;font-size:14px;font-weight:660;display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
  "." + P + "-drawer pre{margin:0;flex:1;overflow:auto;border:1px solid var(--cfg-line);border-radius:10px;background:var(--dsw-alias-bg-base,transparent);padding:12px 14px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;line-height:1.65;white-space:pre-wrap;word-break:break-word}",
  "." + P + "-drawerfoot{display:flex;gap:8px;justify-content:flex-end}",
  "." + P + "-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}",
  "@media (max-width:900px){." + P + "{grid-template-columns:minmax(0,1fr)}." + P + "-side{position:static;flex-direction:row;flex-wrap:wrap;gap:6px;padding:6px}." + P + "-sidetitle{display:none}." + P + "-stab{padding:6px 10px;flex:none}." + P + "-sidecount{display:none}." + P + "-tablewrap{max-height:calc(100vh - 260px)}}",
  "@media (prefers-reduced-motion:reduce){." + P + " *,." + P + "-track,." + P + "-track::after,." + P + "-sk,." + P + "-drawer{transition:none;animation:none}}",
  "." + P + "-idxsub{font-size:11.5px;color:var(--cfg-muted);line-height:1.55}",
  "." + P + "-idxsum{display:flex;gap:16px;flex-wrap:wrap;font-size:11.5px;color:var(--cfg-muted)}",
  "." + P + "-idxsum b{font-weight:660;color:var(--dsw-alias-label-primary,inherit);font-variant-numeric:tabular-nums}",
  "." + P + "-idxtable{width:100%;table-layout:fixed}." + P + "-idxtable ." + P + "-cell{white-space:normal;overflow-wrap:anywhere;max-width:none}." + P + "-idxtable th:first-child{width:30%}." + P + "-idxtable th:nth-child(2){width:28%}",
  "." + P + "-idxtags{display:flex;flex-wrap:wrap;gap:4px;max-width:280px}",
  "." + P + "-idxchip{display:inline-block;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;line-height:1.6;border-radius:999px;padding:0 7px;background:color-mix(in oklab,currentColor 7%,transparent);color:var(--cfg-muted);white-space:nowrap}",
  "." + P + "-idxchip.u{background:color-mix(in oklab,var(--dsw-alias-brand-primary,currentColor) 15%,transparent);color:var(--dsw-alias-brand-primary,inherit)}",
  "." + P + "-idxnone{color:var(--cfg-faint)}",
  "." + P + "-frow th{padding:0 8px 6px;border-bottom:1px solid var(--cfg-line)}",
  "." + P + "-fcell{position:relative;display:block;min-width:96px}",
  "." + P + "-finput{width:100%;box-sizing:border-box;border:1px solid transparent;border-radius:6px;background:color-mix(in oklab,currentColor 4%,transparent);color:inherit;font:inherit;font-size:11.5px;padding:3px 18px 3px 6px;min-width:0}",
  "." + P + "-finput:hover{background:color-mix(in oklab,currentColor 7%,transparent)}",
  "." + P + "-finput:focus{outline:none;border-color:var(--dsw-alias-brand-primary,currentColor);background:var(--cfg-surface)}",
  "." + P + "-fclear{position:absolute;right:2px;top:50%;transform:translateY(-50%);border:0;background:transparent;color:var(--cfg-muted);cursor:pointer;font-size:13px;line-height:1;padding:2px 4px;border-radius:4px}",
  "." + P + "-fclear:hover{color:inherit;background:var(--cfg-hover)}",
  "." + P + "-emptycell{padding:22px 12px;text-align:center;color:var(--cfg-muted)}",
  "." + P + " *{box-sizing:border-box}",
  "." + P + "-tabs{display:flex;gap:6px;border-bottom:1px solid var(--cfg-line);padding-bottom:9px}",
  "." + P + "-tabs [aria-selected=true]{background:var(--cfg-hover);color:inherit;font-weight:660}",
  "." + P + "-images{display:flex;gap:5px;align-items:center}",
  "." + P + "-images img{width:36px;height:36px;object-fit:cover;border-radius:5px}",
  "." + P + "-gallery{display:flex;flex-direction:column;gap:12px;overflow:auto;flex:1}",
  "." + P + "-gallery img{width:100%;height:auto;object-fit:contain;border-radius:8px}",
].join("\n");
// Keep other domains unchanged; inventory consumes the common light-button contract.
if (DOMAIN === "storage") {
  var buttons = "." + P + " :is(button)";
  CSS += buttons + "{border:none;background:var(--wb-btn-bg);min-height:var(--wb-btn-size-sm);min-width:var(--wb-btn-size-sm)}" +
    buttons + ":enabled:hover{background:var(--wb-btn-hover-bg)}" +
    buttons + ":enabled:active{background:var(--wb-btn-active-bg)}" +
    buttons + ":disabled{background:var(--wb-btn-bg);color:var(--cfg-muted)}" +
    buttons + ":focus-visible{outline:var(--wb-btn-focus);outline-offset:var(--wb-btn-focus-offset)}" +
    "." + P + "-fcell:has(button) input{padding-right:34px}";
}


function injectCss() {
  if (typeof document === "undefined") return;
  var old = document.getElementById("wb-addon-" + DOMAIN + "-data-css");
  if (old) { old.textContent = CSS; return; }
  var style = document.createElement("style");
  style.id = "wb-addon-" + DOMAIN + "-data-css";
  style.setAttribute("data-wb-addon", "wb-addon-" + DOMAIN);
  style.textContent = CSS;
  document.head.appendChild(style);
}

return injectCss;
};
