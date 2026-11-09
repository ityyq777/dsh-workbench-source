// Opaque capsule base keeps label contrast independent of the surrounding theme.
module.exports = `
.wb-body-label{float:left;position:relative;z-index:1;margin:1px 6px 0 0;padding:1px 4px;border-radius:4px;font-size:11px;font-weight:600;letter-spacing:.06em;line-height:1.6;color:#234783;background:color-mix(in srgb,#5b7fd6 8%,#fff);white-space:nowrap}
.wb-body-label.wb-review-label{color:#154d43;background:color-mix(in srgb,var(--wbt-accent,#11a89b) 8%,#fff)}
.wb-markdown{white-space:normal;min-width:0;overflow-wrap:anywhere}.wb-markdown:after{content:'';display:table;clear:both}
.wb-markdown p{margin:0 0 6px;white-space:pre-wrap}.wb-markdown>:last-child{margin-bottom:0}
.wb-markdown h1,.wb-markdown h2,.wb-markdown h3,.wb-markdown h4,.wb-markdown h5,.wb-markdown h6{margin:6px 0;font-weight:650;line-height:1.6}
.wb-markdown>:first-child{margin-top:0}.wb-markdown h1{font-size:16px}.wb-markdown h2{font-size:15px}.wb-markdown h3{font-size:14px}.wb-markdown h4,.wb-markdown h5,.wb-markdown h6{font-size:13px}
.wb-markdown ul,.wb-markdown ol{margin:4px 0;padding-left:24px;display:flow-root}.wb-markdown li{margin:1px 0}
.wb-markdown blockquote{border-left:2px solid currentColor;padding-left:9px;margin:4px 0;display:flow-root}
.wb-markdown pre{white-space:pre-wrap;overflow-wrap:anywhere;padding:8px;border-radius:6px;background:color-mix(in srgb,currentColor 7%,transparent);display:flow-root;margin:5px 0}
.wb-markdown code,.wb-body-text{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.wb-markdown code{background:color-mix(in srgb,currentColor 7%,transparent);border-radius:3px;padding:1px 3px}.wb-markdown pre code{padding:0;background:none}
.wb-markdown a{color:inherit;text-decoration:underline}.wb-markdown hr{border:0;border-top:1px solid currentColor;opacity:.3;clear:both}
.wb-body-text{white-space:pre-wrap;overflow-wrap:anywhere}.wb-body-text:after{content:'';display:table;clear:both}
.wb-body-section{min-width:0;overflow-anchor:none}
.wb-body-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;padding-left:12px;min-height:24px}
.wb-body-heading .wb-body-label{float:none;margin:0;padding:0;border-radius:0;background:none;color:inherit;font-size:11.5px;font-weight:600;letter-spacing:.06em;opacity:.72}
.wb-body-toggle{display:inline-flex;align-items:center;justify-content:center;flex:none;width:24px;height:24px;border:0;background:transparent;color:inherit;padding:0;border-radius:4px;cursor:pointer;opacity:.7}
.wb-body-toggle:hover{opacity:1;background:color-mix(in srgb,currentColor 5%,transparent)}
.wb-body-toggle:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#2563eb);outline-offset:2px}
.wb-body-toggle-icon{display:flex;animation:wb-body-icon-in 140ms ease-out}
@keyframes wb-body-icon-in{from{opacity:0}to{opacity:1}}
@media(prefers-reduced-motion:reduce){.wb-body-toggle-icon{animation:none}}
.wbt-item.closed:has(.wb-body-label){opacity:1}
`;
