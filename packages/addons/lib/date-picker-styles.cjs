"use strict";
/**
 * 共享日期选择器样式。颜色只用各插件主题令牌（--wb-*），不写死任何色值。
 * 用法：require("../../lib/date-picker-styles.cjs")("wbt")
 */
module.exports = function datePickerStyles(prefix) {
  var p = String(prefix || "wb");
  return [
    ".{p}-dp,.{p}-dr{position:relative;min-width:0}",
    ".{p}-dp-field{display:flex;align-items:center;gap:6px;min-width:0}",
    ".{p}-dp-trigger{display:flex;align-items:center;gap:8px;min-width:0;width:100%;padding:8px 10px;border:1px solid var(--wb-border);border-radius:8px;background:var(--wb-surface);color:var(--wb-text,inherit);font:inherit;text-align:left;cursor:pointer;transition:border-color .15s,box-shadow .15s}",
    ".{p}-dp-trigger:hover{border-color:var(--wb-accent)}",
    ".{p}-dp-trigger:focus-visible{outline:2px solid var(--wb-accent);outline-offset:1px}",
    ".{p}-dp-trigger[disabled]{opacity:.55;cursor:not-allowed}",
    ".{p}-dp-glyph{width:13px;height:13px;flex:none;border:1.5px solid currentColor;border-radius:3px;position:relative;opacity:.72}",
    ".{p}-dp-glyph::before{content:\"\";position:absolute;left:-1.5px;right:-1.5px;top:3px;border-top:1.5px solid currentColor}",
    ".{p}-dp-glyph::after{content:\"\";position:absolute;left:3px;top:-3px;width:1.5px;height:3px;background:currentColor;box-shadow:4px 0 currentColor}",
    ".{p}-dp-value{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-variant-numeric:tabular-nums}",
    ".{p}-dp-value.is-empty{color:var(--wb-muted)}",
    ".{p}-dp-clear{flex:none;width:22px;height:22px;padding:0;border:0;border-radius:50%;background:color-mix(in srgb,var(--wb-muted) 14%,transparent);color:var(--wb-muted);font:inherit;line-height:1;cursor:pointer}",
    ".{p}-dp-clear:hover{color:var(--wb-danger);background:color-mix(in srgb,var(--wb-danger) 16%,transparent)}",
    ".{p}-dp-pop{position:absolute;z-index:40;top:calc(100% + 6px);left:0;width:272px;padding:10px;border:1px solid var(--wb-border);border-radius:12px;background:var(--wb-card);box-shadow:0 16px 40px color-mix(in srgb,var(--wb-text,var(--wb-border)) 18%,transparent);animation:{p}-dp-in .14s ease-out}",
    ".{p}-dp-head{display:flex;align-items:center;gap:6px;margin-bottom:8px}",
    ".{p}-dp-title{flex:1;text-align:center;font-size:13px;font-weight:600;font-variant-numeric:tabular-nums}",
    ".{p}-dp-nav{width:26px;height:26px;padding:0;border:1px solid var(--wb-border);border-radius:7px;background:transparent;color:inherit;font:inherit;line-height:1;cursor:pointer}",
    ".{p}-dp-nav:hover{border-color:var(--wb-accent);color:var(--wb-accent)}",
    ".{p}-dp-weekdays,.{p}-dp-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px}",
    ".{p}-dp-weekdays{margin-bottom:4px;font-size:11px;color:var(--wb-muted);text-align:center}",
    ".{p}-dp-day{min-width:0;height:30px;padding:0;border:0;border-radius:7px;background:transparent;color:inherit;font:inherit;font-variant-numeric:tabular-nums;cursor:pointer}",
    ".{p}-dp-day:hover{background:color-mix(in srgb,var(--wb-accent) 12%,transparent)}",
    ".{p}-dp-day.is-between{background:color-mix(in srgb,var(--wb-accent) 16%,transparent);border-radius:0}",
    ".{p}-dp-day.is-today{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--wb-accent) 55%,transparent)}",
    ".{p}-dp-day.is-on{background:var(--wb-accent);color:var(--wb-on-accent,inherit);font-weight:600}",
    ".{p}-dp-day:disabled{opacity:.35;cursor:not-allowed}",
    ".{p}-dp-day:focus-visible{outline:2px solid var(--wb-accent);outline-offset:-2px}",
    ".{p}-dp-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px;padding-top:8px;border-top:1px solid var(--wb-line)}",
    ".{p}-dp-acts{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}",
    ".{p}-dp-link{padding:4px 8px;border:0;border-radius:6px;background:color-mix(in srgb,var(--wb-muted) 12%,transparent);color:inherit;font:inherit;font-size:12px;cursor:pointer}",
    ".{p}-dp-link:hover{background:color-mix(in srgb,var(--wb-accent) 16%,transparent);color:var(--wb-accent)}",
    ".{p}-dp-hint{margin:6px 0 0;font-size:11px;color:var(--wb-muted)}",
    ".{p}-dp-pop.is-months{width:248px}",
    ".{p}-dp-months{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;margin-bottom:6px}",
    ".{p}-dp-months .{p}-dp-day{height:34px}",
    "@keyframes {p}-dp-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}",
  ].join("\n").replace(/\{p\}/g, p);
};
