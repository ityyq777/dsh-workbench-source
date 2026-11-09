"use strict";
module.exports = [
  '.wbt-timeline-view{padding:20px;color:inherit;height:100%;box-sizing:border-box;overflow:auto}',
  '.wbt-timeline-toolbar,.wbt-timeline-search,.wbt-timeline-pager{display:flex;align-items:center;gap:10px}',
  '.wbt-timeline-toolbar{margin-bottom:16px}.wbt-timeline-toolbar h2{font-size:18px;margin:0 auto 0 0}',
  '.wbt-timeline-columns{display:grid;grid-template-columns:minmax(260px,34%) minmax(0,1fr);gap:20px}',
  '.wbt-timeline-left,.wbt-timeline-right{min-width:0;border:1px solid var(--wbt-line,rgba(128,128,128,.3));border-radius:10px;padding:14px}',
  '.wbt-timeline-single{display:flex;align-items:center;gap:8px;margin:14px 0;font-size:13px}',
  '.wbt-timeline-search input{min-width:0;flex:1}.wbt-timeline-list{height:48vh;min-height:220px;overflow:auto;overscroll-behavior:contain}',
  '.wbt-timeline-option{padding:12px 10px;border:2px solid transparent;border-bottom:2px solid var(--wbt-line,rgba(128,128,128,.3));cursor:pointer;border-radius:6px;display:flex;flex-direction:column;gap:7px;overflow-wrap:anywhere}',
  '.wbt-timeline-option span{font-size:12px;opacity:.8}.wbt-timeline-option.current{border:2px solid var(--wbt-accent,#6366f1);background:rgba(99,102,241,.08)}',
  '.wbt-timeline-option:focus-visible,.wbt-timeline-member:focus-visible{outline:3px solid var(--wbt-accent,#6366f1);outline-offset:-3px}',
  '.wbt-timeline-pager{justify-content:space-between;margin-top:14px;font-size:12px}.wbt-timeline-right h3{margin-top:0;overflow-wrap:anywhere}.wbt-timeline-right>p{font-size:13px;opacity:.8}',
  '.wbt-timeline-members{padding-left:24px;margin:0;max-height:58vh;overflow:auto}.wbt-timeline-members li{padding:0 0 12px 6px}',
  '.wbt-timeline-member{display:flex;width:100%;flex-wrap:wrap;align-items:center;gap:10px;text-align:left;padding:12px;border:1px solid var(--wbt-line,rgba(128,128,128,.3));border-radius:8px;color:inherit;background:transparent;cursor:pointer}',
  '.wbt-timeline-member strong{flex:1;min-width:100px;overflow-wrap:anywhere}.wbt-timeline-member time{font-size:12px;opacity:.8}',
  '@media(max-width:720px){.wbt-timeline-columns{grid-template-columns:1fr}.wbt-timeline-list{height:260px}.wbt-timeline-toolbar{flex-wrap:wrap}}'
].join('\n');
