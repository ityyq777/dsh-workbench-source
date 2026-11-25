// 浮层挂到文档根节点以避开输入框裁剪；主题色随 DSH 切换。
module.exports = `
.wb-role-trigger,.wb-role-mask{--wb-line:var(--dsw-alias-border-l2);--wb-card:var(--dsw-alias-bg-layer-1,Canvas);--wb-surface:var(--dsw-alias-bg-layer-2,Canvas);--wb-accent:var(--dsw-alias-brand-primary,Highlight);--wb-muted:var(--dsw-alias-label-tertiary,GrayText);--wb-danger:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-label-primary,CanvasText)}
.wb-role-trigger,.wb-role-btn{font:inherit;color:inherit;border:1px solid var(--wb-line);cursor:pointer;background:var(--wb-card);border-radius:8px;padding:6px 10px}
.wb-role-trigger{height:28px;max-width:min(32vw,16em);text-overflow:ellipsis;overflow:hidden;white-space:nowrap;border-radius:999px;font-size:12px;padding:0 9px}
.wb-role-trigger:hover{border-color:var(--wb-accent)}
.wb-role-trigger:focus-visible,.wb-role-btn:focus-visible{outline:2px solid var(--wb-accent);outline-offset:2px}
.wb-role-btn:disabled,.wb-role-option:disabled,.wb-role-none:disabled,.wb-role-close:disabled{opacity:.5;cursor:wait}
.wb-role-mask{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:12px;background:color-mix(in oklab,var(--dsw-alias-label-primary,CanvasText) 22%,transparent)}
.wb-role-dialog{display:flex;flex-direction:column;gap:12px;padding:16px;box-sizing:border-box;width:min(100%,26rem);max-height:86dvh;overflow:auto;background:var(--wb-card);border:1px solid var(--wb-line);border-radius:12px;box-shadow:0 8px 32px color-mix(in oklab,var(--wb-muted) 24%,transparent)}
.wb-role-head{display:flex;flex-direction:column;gap:4px}
.wb-role-title{margin:0;font-size:14px;font-weight:600;line-height:1.4}
.wb-role-sub{margin:0;font-size:11.5px;line-height:1.5;color:var(--wb-muted)}
.wb-role-note{margin:0;font-size:11.5px;line-height:1.5;color:var(--wb-muted)}
.wb-role-error{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:12px;line-height:1.5;color:var(--wb-danger)}
.wb-role-retry{font:inherit;font-size:11.5px;padding:2px 8px;border:1px solid currentColor;border-radius:6px;background:transparent;color:inherit;cursor:pointer}
.wb-role-retry:hover:not(:disabled){background:color-mix(in oklab,currentColor 10%,transparent)}
.wb-role-search{box-sizing:border-box;width:100%;font:inherit;font-size:13px;color:inherit;background:var(--wb-surface);border:1px solid var(--wb-line);border-radius:10px;padding:8px 10px;outline:none}
.wb-role-search:focus{border-color:var(--wb-accent)}
.wb-role-search::placeholder{color:var(--wb-muted)}
.wb-role-count{font-size:11.5px;color:var(--wb-muted);font-variant-numeric:tabular-nums}
.wb-role-list{display:flex;flex-direction:column;gap:8px;max-height:min(52dvh,24rem);overflow:auto;overscroll-behavior:contain}
.wb-role-option{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:start;gap:10px;box-sizing:border-box;width:100%;text-align:start;padding:9px 10px;border-radius:10px;border:1px solid var(--wb-line);background:var(--wb-card);font:inherit;color:inherit;cursor:pointer}
.wb-role-option:hover:not(:disabled){background:var(--wb-surface)}
.wb-role-option[aria-pressed=true]{border-color:var(--wb-accent);background:color-mix(in oklab,var(--wb-accent) 8%,var(--wb-card));box-shadow:inset 2px 0 0 var(--wb-accent)}
.wb-role-option[aria-pressed=true]:hover:not(:disabled){background:color-mix(in oklab,var(--wb-accent) 12%,var(--wb-card))}
.wb-role-option:focus-visible{outline:2px solid var(--wb-accent);outline-offset:2px}
.wb-role-option-icon{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:6px;background:color-mix(in oklab,var(--wb-muted) 14%,transparent);color:var(--wb-muted)}
.wb-role-option[aria-pressed=true] .wb-role-option-icon{background:color-mix(in oklab,var(--wb-accent) 16%,transparent);color:var(--wb-accent)}
.wb-role-option-text{display:flex;flex-direction:column;gap:2px;min-width:0}
.wb-role-option-name{font-size:13.5px;font-weight:500;line-height:1.4;overflow-wrap:anywhere}
.wb-role-option-meta{display:flex;flex-wrap:wrap;gap:2px 8px;font-size:11.5px;line-height:1.45;color:var(--wb-muted)}
.wb-role-option-domain{opacity:.9}
.wb-role-option-desc{overflow-wrap:anywhere}
.wb-role-option-check{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;color:var(--wb-accent)}
.wb-role-mark{background:color-mix(in oklab,var(--wb-accent) 24%,transparent);color:inherit;border-radius:3px;padding:0 1px}
.wb-role-empty{display:flex;gap:8px;align-items:center;flex-wrap:wrap;color:var(--wb-muted);font-size:12px}
.wb-role-clear{border:1px solid var(--wb-line);background:var(--wb-card);color:inherit;font:inherit;font-size:12px;border-radius:8px;padding:3px 8px;cursor:pointer}
.wb-role-clear:hover{border-color:var(--wb-accent)}
.wb-role-clear:focus-visible{outline:2px solid var(--wb-accent);outline-offset:2px}
.wb-role-sep{height:1px;margin:0;border:0;background:var(--wb-line)}
.wb-role-none{display:flex;align-items:center;gap:8px;flex-wrap:wrap;box-sizing:border-box;width:100%;text-align:start;padding:8px 10px;border-radius:10px;border:1px dashed var(--wb-line);background:transparent;color:var(--wb-muted);font:inherit;font-size:12px;cursor:pointer}
.wb-role-none:hover:not(:disabled){background:var(--wb-surface);color:inherit}
.wb-role-none[aria-pressed=true]{border-style:solid;border-color:var(--wb-accent);background:color-mix(in oklab,var(--wb-accent) 8%,var(--wb-card));color:inherit;box-shadow:inset 2px 0 0 var(--wb-accent)}
.wb-role-none:focus-visible{outline:2px solid var(--wb-accent);outline-offset:2px}
.wb-role-none-icon{display:inline-flex;align-items:center}
.wb-role-none-name{font-weight:500}
.wb-role-none-desc{font-size:11px;font-weight:400;color:var(--wb-muted)}
.wb-role-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.wb-role-hint{font-size:11px;color:var(--wb-muted)}
.wb-role-close{font:inherit;font-size:12px;padding:4px 10px;border:1px solid var(--wb-line);border-radius:8px;background:transparent;color:var(--wb-muted);cursor:pointer;margin-inline-start:auto}
.wb-role-close:hover:not(:disabled){border-color:var(--wb-accent);color:inherit}
.wb-role-close:focus-visible{outline:2px solid var(--wb-accent);outline-offset:2px}
@media (max-width:480px){
  .wb-role-dialog{width:100%;max-height:92dvh;padding:14px;gap:10px}
  .wb-role-list{max-height:60dvh}
  .wb-role-option{padding:8px 9px}
}
`;

// 角色管理页：共享控件用 wbr 前缀，基础样式从 addons/lib 生成，页面布局只用主题 token。
var ROLES_BASE = require("../../../addons/lib/client-base-styles.cjs")("wbr").join("\n");
// 步骤条是共享控件（lib/stepper.cjs），样式跟控件一起引入，避免页面再手写一套步进样式。
var STEPS_BASE = require("../../../addons/lib/stepper.cjs").styles.join("\n");
// 指令正文复用共享 markdown 正文与「渲染/纯文本」开关（lib/markdown.cjs + body-toggle.cjs），
// 样式跟共享件一起引入，页面不再自己实现正文排版。
var DESC_BASE = require("../../../addons/lib/body-styles.cjs") + require("../../../addons/lib/visual-tokens.cjs");
module.exports += "\n" + ROLES_BASE + "\n" + STEPS_BASE + "\n" + DESC_BASE + `
.wbr-page{--wb-description-bg:color-mix(in oklab,var(--wb-accent) 7%,transparent);--wb-description-line:color-mix(in oklab,var(--wb-accent) 34%,transparent)}
/* 分栏工作区：列表与详情各自滚动，整块高度交给页面（宿主为带 wb-fill 的页面保留可用高度）。 */
/* 界面红线：业务视图撑满可用宽度，不靠 max-width + margin auto 居中收窄。 */
.wbr-page>.wb-inner{max-width:none}
/* 分栏工作区才需要纵向占满；编辑器展开时高度交回整页滚动。 */
.wbr-page>.wb-inner:has(.wbr-split){flex:1 1 auto;min-height:0}
.wbr-toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:10px 12px;border:1px solid var(--wb-border);border-radius:12px;background:var(--wb-card)}
.wbr-input,.wbr-select{border:1px solid var(--wb-line);border-radius:8px;padding:7px 10px;font:inherit;font-size:13px;background:var(--wb-surface);color:inherit;min-width:0;outline:none}
.wbr-input:focus,.wbr-select:focus{border-color:var(--wb-accent)}
.wbr-input::placeholder{color:var(--wb-muted)}
.wbr-search{flex:1 1 220px}
.wbr-filter{flex:0 0 auto}
.wbr-split{display:grid;grid-template-columns:minmax(220px,300px) minmax(0,1fr);gap:14px;flex:1 1 auto;min-height:0;align-items:stretch}
.wbr-panel{display:flex;flex-direction:column;min-height:0;min-width:0;border:1px solid var(--wb-border);border-radius:12px;background:var(--wb-card);overflow:hidden}
.wbr-items{display:flex;flex-direction:column;gap:4px;flex:1 1 auto;min-height:0;overflow:auto;padding:8px;overscroll-behavior:contain}
.wbr-list-note{padding:14px 12px}
/* 列表行：整行是按钮，网格排布让文字严格左对齐（共享基础样式里 .wbr-row 会把子项居中，这里不用那个类名）。 */
.wbr-item{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:start;gap:9px;text-align:start;border:1px solid transparent;border-radius:10px;background:transparent;color:inherit;font:inherit;padding:8px 9px;cursor:pointer;transition:background .12s ease,border-color .12s ease}
.wbr-item:hover{border-color:var(--wb-line);background:var(--wb-surface)}
.wbr-item[aria-pressed=true]{border-color:var(--wb-accent);background:color-mix(in oklab,var(--wb-accent) 10%,var(--wb-card))}
.wbr-item:focus-visible{outline:2px solid var(--wb-accent);outline-offset:1px}
.wbr-item-glyph{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:7px;background:color-mix(in oklab,var(--wb-muted) 14%,transparent);color:var(--wb-muted)}
.wbr-item[aria-pressed=true] .wbr-item-glyph{background:color-mix(in oklab,var(--wb-accent) 16%,transparent);color:var(--wb-accent)}
.wbr-item-body{display:flex;flex-direction:column;gap:3px;min-width:0}
.wbr-item-name{font-size:13px;font-weight:600;line-height:1.4;overflow-wrap:anywhere}
.wbr-item-meta{display:flex;align-items:center;gap:6px;min-width:0;font-size:11px;color:var(--wb-muted)}
.wbr-item-id{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px}
.wbr-item-ver{flex:none;font-variant-numeric:tabular-nums}
.wbr-detail{gap:12px;padding:16px;overflow:auto;overscroll-behavior:contain}
.wbr-detail.is-empty{align-items:center;justify-content:center;color:var(--wb-muted)}
.wbr-detail-head{display:flex;flex-direction:column;gap:6px;padding-bottom:12px;border-bottom:1px solid var(--wb-line)}
.wbr-detail-title{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}
.wbr-detail-name{margin:0;font-size:16px;font-weight:650;line-height:1.35;overflow-wrap:anywhere}
.wbr-detail-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0;font-size:11.5px;color:var(--wb-muted)}
.wbr-detail-id{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11.5px}
.wbr-chip{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:999px;border:1px solid var(--wb-line);background:var(--wb-surface);font-size:11px;line-height:1.6;font-variant-numeric:tabular-nums}
.wbr-detail-desc{margin:0;padding-left:10px;border-left:2px solid color-mix(in oklab,var(--wb-accent) 40%,transparent);font-size:12.5px;line-height:1.65;color:var(--wb-muted);overflow-wrap:anywhere}
/* 正文小节：标题行自带「渲染/纯文本」开关，避免图标孤零零挂在内容右侧。 */
.wbr-section{display:flex;flex-direction:column;gap:6px;min-width:0;flex:1 1 auto}
.wbr-section-head{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:24px}
.wbr-section-head .wb-body-toggle{opacity:1;width:24px;height:24px;border:1px solid var(--wb-line);background:var(--wb-surface);color:var(--wb-muted)}
.wbr-section-head .wb-body-toggle:hover{color:inherit;border-color:var(--wb-accent)}
.wbr-section-label{font-size:11.5px;font-weight:600;letter-spacing:.06em;color:var(--wb-muted)}
.wbr-section-body{font-size:13px;line-height:1.7;min-width:0;overflow-wrap:anywhere}
.wbr-detail-foot{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:auto;padding-top:12px;border-top:1px solid var(--wb-line)}
.wbr-detail-foot .wbr-btn.danger{margin-inline-start:auto}
/* 按钮一律「图标 + 文字」：桌面端两者都在，窄屏由基础样式把文字收进读屏（图标仍表意）。 */
.wbr-page .wbr-btn,.wbr-editor .wbr-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;line-height:1.5}
.wbr-page .wbr-btn>svg,.wbr-editor .wbr-btn>svg{flex:none}
.wbr-danger-box{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px 12px;border:1px solid color-mix(in oklab,var(--wb-danger) 40%,transparent);border-radius:10px;background:color-mix(in oklab,var(--wb-danger) 8%,transparent);font-size:12.5px;line-height:1.5}
.wbr-danger-box>span{flex:1 1 200px}
.wbr-editor{display:flex;flex-direction:column;gap:12px;flex:0 0 auto}
.wbr-steps .wbctl-step-list{margin:0}
.wbr-step-pane{display:flex;flex-direction:column;gap:10px;min-width:0}
.wbr-field-error{margin:0;font-size:12px;color:var(--wb-danger)}
.wbr-step-status{margin:0;font-size:12px;color:var(--wb-muted)}
.wbr-editor-head{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.wbr-editor-head code{color:var(--wb-muted);font-size:11.5px;overflow-wrap:anywhere}
.wbr-instructions{display:flex;flex-direction:column;gap:6px}
.wbr-instructions-hint{margin:0;font-size:11.5px;line-height:1.5;color:var(--wb-muted)}
.wbr-instructions-head{display:flex;align-items:center;justify-content:flex-start;gap:8px;flex-wrap:wrap}
.wbr-instructions-head .wbr-tabs{margin-inline-start:auto}
.wbr-tabs{display:inline-flex;gap:2px;border:1px solid var(--wb-line);border-radius:8px;padding:2px}
.wbr-tab{display:inline-flex;align-items:center;gap:4px;font:inherit;font-size:12px;border:0;background:transparent;color:inherit;padding:3px 9px;border-radius:6px;cursor:pointer}
.wbr-tab>svg{flex:none}
.wbr-tab[aria-selected=true]{background:color-mix(in oklab,var(--wb-accent) 14%,transparent);color:var(--wb-accent)}
.wbr-tab:focus-visible{outline:2px solid var(--wb-accent);outline-offset:1px}
.wbr-preview{border:1px dashed var(--wb-line);border-radius:8px;padding:8px 10px;min-height:3em;font-size:13px;line-height:1.6;overflow-wrap:anywhere}
.wbr-count{font-size:11.5px;color:var(--wb-muted);font-weight:400}
.wbr-wizard-foot{display:flex;align-items:center;gap:8px;flex-wrap:wrap;border-top:1px solid var(--wb-line);padding-top:10px}
.wbr-wizard-nav{display:flex;gap:8px;margin-inline-start:auto}
@media(max-width:900px){
  /* 窄屏退回单列：高度交给整页滚动，两栏不再各自滚动。 */
  .wbr-page>.wb-inner:has(.wbr-split){flex:0 0 auto;min-height:0}
  .wbr-split{grid-template-columns:minmax(0,1fr);flex:0 0 auto;gap:12px}
  .wbr-items{overflow:visible;max-height:52vh}
  .wbr-detail{overflow:visible}
}
@media(max-width:520px){
  .wbr-toolbar{padding:8px}
  .wbr-search{flex:1 1 100%}
  .wbr-filter{flex:1 1 auto}
  .wbr-wizard-foot{gap:6px}
  /* 窄屏不挤压步骤名：每步给最小宽度，整条步骤栏横向滚动。 */
  /* 窄屏：步骤条允许换行折行，优先保证三步都完整可见；真放不下才横向滚动。 */
  .wbr-steps .wbctl-step-list{overflow-x:auto;padding-bottom:2px;flex-wrap:wrap}
  .wbr-steps .wbctl-step-item{flex:1 1 30%;min-width:0}
  .wbr-steps .wbctl-step{min-width:0;width:100%}
  .wbr-steps .wbctl-step-label{white-space:normal;overflow-wrap:anywhere}
  .wbr-detail-head{gap:4px}
}
`;
