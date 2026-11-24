// 浮层挂到文档根节点以避开输入框裁剪；主题色随 DSH 切换。
module.exports = `
.wb-role-trigger,.wb-role-mask{--wb-line:var(--dsw-alias-border-l2);--wb-card:var(--dsw-alias-bg-layer-1,Canvas);--wb-surface:var(--dsw-alias-bg-layer-2,Canvas);--wb-accent:var(--dsw-alias-brand-primary,Highlight);--wb-muted:var(--dsw-alias-label-tertiary,GrayText);--wb-danger:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-label-primary,CanvasText)}
.wb-role-trigger,.wb-role-btn{font:inherit;color:inherit;border:1px solid var(--wb-line);cursor:pointer;background:var(--wb-card);border-radius:8px;padding:6px 10px}
.wb-role-trigger{height:28px;max-width:min(32vw,16em);text-overflow:ellipsis;overflow:hidden;white-space:nowrap;border-radius:999px;font-size:12px;padding:0 9px}
.wb-role-trigger:hover,.wb-role-btn:hover:not(:disabled),.wb-role-btn[aria-pressed=true]{border-color:var(--wb-accent);background:color-mix(in oklab,var(--wb-accent) 10%,var(--wb-card))}
.wb-role-trigger:focus-visible,.wb-role-btn:focus-visible{outline:2px solid var(--wb-accent);outline-offset:2px}
.wb-role-btn:disabled{opacity:.5;cursor:wait}
.wb-role-mask{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:12px;background:color-mix(in oklab,var(--dsw-alias-label-primary,CanvasText) 22%,transparent)}
.wb-role-dialog{display:grid;gap:8px;padding:16px;box-sizing:border-box;width:min(100%,24rem);max-height:80dvh;overflow:auto;background:var(--wb-card);border:1px solid var(--wb-line);border-radius:12px;box-shadow:0 8px 32px color-mix(in oklab,var(--wb-muted) 24%,transparent)}
.wb-role-dialog small{display:block;color:var(--wb-muted)}.wb-role-dialog .wb-role-btn[aria-pressed]{display:grid;gap:3px;text-align:start}.wb-role-dialog [role=alert]{color:var(--wb-danger)}
`;

// 角色管理页：共享控件用 wbr 前缀，基础样式从 addons/lib 生成，页面布局只用主题 token。
var ROLES_BASE = require("../../../addons/lib/client-base-styles.cjs")("wbr").join("\n");
module.exports += "\n" + ROLES_BASE + `
.wbr-input,.wbr-select{border:1px solid var(--wb-line);border-radius:8px;padding:7px 10px;font:inherit;font-size:13px;background:transparent;color:inherit;min-width:0;outline:none}
.wbr-input:focus,.wbr-select:focus{border-color:var(--wb-accent)}
.wbr-toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.wbr-search{flex:1 1 260px;min-width:0}
.wbr-select{flex:0 0 auto}
.wbr-split{display:grid;grid-template-columns:minmax(240px,340px) minmax(0,1fr);gap:14px;align-items:start}
.wbr-list{min-width:0;display:flex;flex-direction:column;gap:8px}
.wbr-rows{display:flex;flex-direction:column;gap:6px;max-height:min(70dvh,720px);overflow:auto;padding-right:2px}
.wbr-row{display:flex;flex-direction:column;gap:4px;text-align:start;background:transparent;color:inherit;font:inherit;border:1px solid var(--wb-line);border-radius:10px;padding:9px 10px;cursor:pointer}
.wbr-row:hover{border-color:var(--wb-accent);background:color-mix(in oklab,var(--wb-accent) 7%,transparent)}
.wbr-row[aria-pressed=true]{border-color:var(--wb-accent);background:color-mix(in oklab,var(--wb-accent) 12%,transparent)}
.wbr-row:focus-visible{outline:2px solid var(--wb-accent);outline-offset:2px}
.wbr-row-name{font-weight:600;font-size:13px;overflow-wrap:anywhere}
.wbr-row-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:11px;color:var(--wb-muted)}
.wbr-row-meta code{font-size:11px;overflow-wrap:anywhere}
.wbr-row-counts{display:flex;flex-direction:column;gap:2px;font-size:11.5px;color:var(--wb-muted)}
.wbr-row-counts small{color:var(--wb-muted);opacity:.85}
.wbr-detail{border:1px solid var(--wb-border);border-radius:12px;background:var(--wb-surface);padding:14px;display:flex;flex-direction:column;gap:10px;min-width:0}
.wbr-detail-empty{padding:0;border:0;background:transparent}
.wbr-detail-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.wbr-detail-head strong{font-size:15px}
.wbr-detail-head code{font-size:11.5px;color:var(--wb-muted);overflow-wrap:anywhere}
.wbr-detail-head small{font-size:11.5px;color:var(--wb-muted)}
.wbr-detail-desc{margin:0;font-size:13px;line-height:1.6;overflow-wrap:anywhere}
.wbr-detail-actions{display:flex;flex-direction:column;gap:8px}
.wbr-detail-group{display:flex;flex-direction:column;gap:5px}
.wbr-detail-domain{font-size:11.5px;color:var(--wb-muted);font-weight:600}
.wbr-chips{display:flex;gap:6px;flex-wrap:wrap}
.wbr-chip{font-size:11.5px;line-height:1.5;padding:2px 7px;border-radius:6px;border:1px solid var(--wb-line);background:color-mix(in oklab,currentColor 4%,transparent);white-space:nowrap}
.wbr-editor{display:flex;flex-direction:column;gap:10px}
.wbr-editor-head{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.wbr-editor-head small{color:var(--wb-muted);font-size:11.5px}
.wbr-instructions{display:flex;flex-direction:column;gap:6px}
.wbr-instructions-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.wbr-tabs{display:inline-flex;gap:2px;border:1px solid var(--wb-line);border-radius:8px;padding:2px}
.wbr-tab{font:inherit;font-size:12px;border:0;background:transparent;color:inherit;padding:3px 9px;border-radius:6px;cursor:pointer}
.wbr-tab[aria-selected=true]{background:color-mix(in oklab,var(--wb-accent) 14%,transparent);color:var(--wb-accent)}
.wbr-tab:focus-visible{outline:2px solid var(--wb-accent);outline-offset:1px}
.wbr-preview{border:1px dashed var(--wb-line);border-radius:8px;padding:8px 10px;min-height:3em;font-size:13px;line-height:1.6;overflow-wrap:anywhere}
.wbr-actions{display:flex;flex-direction:column;gap:8px;border:1px solid var(--wb-line);border-radius:10px;padding:10px}
.wbr-actions-head{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.wbr-count{font-size:11.5px;color:var(--wb-muted);font-weight:400}
.wbr-actions-groups{display:flex;flex-direction:column;gap:8px;max-height:min(46dvh,420px);overflow:auto}
.wbr-actions-group{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.wbr-actions-domain{flex:0 0 100%;font-size:11.5px;font-weight:600;color:var(--wb-muted);display:flex;gap:6px}
.wbr-check{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;border:1px solid var(--wb-line);border-radius:6px;padding:2px 7px;cursor:pointer}
.wbr-check:has(input:checked){border-color:var(--wb-accent);background:color-mix(in oklab,var(--wb-accent) 10%,transparent)}
.wbr-check:focus-within{outline:2px solid var(--wb-accent);outline-offset:1px}
.wbr-check code{font-size:11.5px}
.wbr-unknown{display:flex;flex-direction:column;gap:3px;font-size:12px;color:var(--wb-danger)}
.wbr-unknown small{color:var(--wb-muted)}
@media(max-width:760px){
  .wbr-split{grid-template-columns:minmax(0,1fr)}
  .wbr-rows{max-height:none}
  .wbr-actions-groups{max-height:none}
}
`;
