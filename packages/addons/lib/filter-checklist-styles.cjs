// 共享勾选清单（filter-checklist.cjs）的样式：只用主题 token，深浅色通用。
"use strict";

module.exports = [
    ".wbck{display:flex;flex-direction:column;min-width:0}",
    ".wbck-search{padding:0 0 6px}",
    ".wbck-input{width:100%;box-sizing:border-box;font:inherit;font-size:12.5px;padding:6px 9px;border:1px solid var(--wb-border);border-radius:8px;background:var(--wb-surface);color:inherit}",
    ".wbck-input:focus-visible{outline:2px solid var(--wb-accent);outline-offset:1px}",
    ".wbck-input:disabled{opacity:.6;cursor:not-allowed}",
    ".wbck-head{display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--wb-muted);padding:2px 4px 7px}",
    ".wbck-grow{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".wbck-sel{flex:none;color:var(--wb-accent)}",
    ".wbck-clear{appearance:none;flex:none;border:0;background:transparent;color:inherit;border-radius:4px;margin:0;padding:3px 5px;font:inherit;font-size:11.5px;line-height:1;cursor:pointer;opacity:.75}",
    ".wbck-clear:hover:enabled{opacity:1;background:color-mix(in srgb, currentColor 8%, transparent)}",
    ".wbck-clear:focus-visible{outline:2px solid var(--wb-accent);outline-offset:1px}",
    ".wbck-clear:disabled{opacity:.4;cursor:not-allowed}",
    ".wbck-list{max-height:220px;overflow:auto;overscroll-behavior:contain;border:1px solid var(--wb-border);border-radius:10px;padding:2px}",
    ".wbck-opt{display:flex;align-items:center;gap:7px;padding:6px;border-radius:6px;font-size:12.5px;cursor:pointer}",
    ".wbck-opt:hover{background:color-mix(in srgb, currentColor 7%, transparent)}",
    ".wbck-opt.is-on{background:color-mix(in srgb, var(--wb-accent) 10%, transparent)}",
    ".wbck-opt input{margin:0;flex:none;accent-color:var(--wb-accent)}",
    // 单选变体用 button 渲染（role="radio"），这里把浏览器默认按钮样式清掉，视觉与多选行一致。
    '.wbck-opt[role="radio"]{appearance:none;width:100%;box-sizing:border-box;border:0;background:transparent;color:inherit;font:inherit;text-align:left}',
    '.wbck-opt[role="radio"]:disabled{opacity:.55;cursor:not-allowed}',
    '.wbck-opt[role="radio"]:focus-visible{outline:2px solid var(--wb-accent);outline-offset:-2px}',
    ".wbck-nm{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".wbck-meta{margin-left:auto;flex:none;font-size:11.5px;color:var(--wb-muted)}",
    ".wbck-note{font-size:12px;color:var(--wb-muted);padding:8px 6px}",
    ".wbck-more{font-size:11px;color:var(--wb-muted);text-align:center;padding:6px 0 2px;opacity:.8}",
    "@media (max-width:760px){.wbck-list{max-height:200px}}",
];
