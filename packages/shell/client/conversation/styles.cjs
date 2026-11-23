// 浮层挂到文档根节点以避开输入框裁剪；主题色随 DSH 切换。
module.exports = `
.wb-role-trigger,.wb-role-mask{--wb-line:var(--dsw-alias-border-l2);--wb-card:var(--dsw-alias-bg-layer-1,Canvas);--wb-surface:var(--dsw-alias-bg-layer-2,Canvas);--wb-accent:var(--dsw-alias-brand-primary,Highlight);--wb-muted:var(--dsw-alias-label-tertiary,GrayText);--wb-danger:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-label-primary,CanvasText)}
.wb-role-trigger,.wb-role-btn{font:inherit;color:inherit;border:1px solid var(--wb-line);cursor:pointer;background:var(--wb-card);border-radius:8px;padding:6px 10px}
.wb-role-trigger{height:28px;max-width:min(32vw,16em);text-overflow:ellipsis;overflow:hidden;white-space:nowrap;border-radius:999px;font-size:12px;padding:0 9px}
.wb-role-trigger:hover,.wb-role-btn:hover:not(:disabled),.wb-role-btn[aria-pressed=true]{border-color:var(--wb-accent);background:color-mix(in oklab,var(--wb-accent) 10%,var(--wb-card))}
.wb-role-trigger:focus-visible,.wb-role-btn:focus-visible,.wb-role-dialog .wbctl-switch:focus-visible{outline:2px solid var(--wb-accent);outline-offset:2px}
.wb-role-btn:disabled{opacity:.5;cursor:wait}
.wb-role-mask{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:12px;background:color-mix(in oklab,var(--dsw-alias-label-primary,CanvasText) 22%,transparent)}
.wb-role-dialog{display:grid;gap:8px;padding:16px;box-sizing:border-box;width:min(100%,24rem);max-height:80dvh;overflow:auto;background:var(--wb-card);border:1px solid var(--wb-line);border-radius:12px;box-shadow:0 8px 32px color-mix(in oklab,var(--wb-muted) 24%,transparent)}
.wb-role-dialog small{display:block;color:var(--wb-muted)}.wb-role-dialog .wb-role-btn[aria-pressed]{display:grid;gap:3px;text-align:start}.wb-role-dialog [role=alert]{color:var(--wb-danger)}
`;
