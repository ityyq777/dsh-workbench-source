/**
 * 工资插件视图预览：把客户端视图渲染成 HTML，供浏览器截图核对浅色/深色观感。
 * 只用于视觉验证，不参与构建；mock 数据与 test-salary-ui.mjs 保持一致。
 */
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import Module from "node:module";

const require = createRequire(import.meta.url);
const ROOT = new URL("../", import.meta.url).pathname;

const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request.startsWith("lucide-react/icons/")) return { default: function StubIcon() { return null; } };
  return origLoad.call(this, request, parent, isMain);
};

const FIELDS = ["basePay", "performancePay", "positionPay", "allowance", "performanceBonus", "otherPay", "holidayOvertime", "sickDeduction", "personalDeduction", "otherDeduction", "grossPay", "pension", "medical", "unemployment", "housingFund", "incomeTax", "postTaxDeduction", "netPay"];
const zero = () => Object.fromEntries(FIELDS.map((key) => [key, 0]));

const records = [
  Object.assign(zero(), { id: "sal_4", payDate: "2026-10-15", cycle: "monthly", basePay: 8800, performancePay: 2200, allowance: 480, performanceBonus: 800, grossPay: 12280, pension: 739.2, medical: 184.8, unemployment: 46.2, housingFund: 462, incomeTax: 175.44, netPay: 10672.36, note: "2026 年 10 月工资条" }),
  Object.assign(zero(), { id: "sal_3", payDate: "2026-09-15", cycle: "monthly", grossPay: 9720, pension: 739.2, medical: 184.8, unemployment: 46.2, housingFund: 462, incomeTax: 98.63, netPay: 8189.17, note: "截图未显示收入构成" }),
  Object.assign(zero(), { id: "sal_2", payDate: "2026-08-15", cycle: "monthly", grossPay: 9640, pension: 739.2, medical: 184.8, unemployment: 46.2, housingFund: 462, incomeTax: 96.24, netPay: 8111.56, note: "截图未显示收入构成" }),
  Object.assign(zero(), { id: "sal_1", payDate: "2026-07-15", cycle: "monthly", basePay: 7040, performancePay: 2200, allowance: 160, grossPay: 9400, pension: 739.2, medical: 184.8, unemployment: 46.2, housingFund: 462, incomeTax: 89.03, netPay: 7878.77, note: "" }),
];

const monthly = [7, 8, 9, 10].map((month) => {
  const item = records[10 - month];
  const social = item.pension + item.medical + item.unemployment + item.housingFund;
  return { month, period: "2026-" + String(month).padStart(2, "0"), records: 1, basePay: item.basePay, performancePay: item.performancePay, netPay: item.netPay, grossPay: item.grossPay, incomeTax: item.incomeTax, socialTotal: social, pension: item.pension, medical: item.medical, unemployment: item.unemployment, housingFund: item.housingFund };
});

const stats = {
  year: 2026, records: 4, months: 4, netTotal: 34851.86, grossTotal: 41040, incomeTaxTotal: 459.34, socialTotal: 5728.8,
  social: { pension: 2956.8, medical: 739.2, unemployment: 184.8, housingFund: 1848 },
  deductionTotal: 6188.14, avgNetPay: 8712.97,
  monthly: Array.from({ length: 12 }, (_, index) => {
    const hit = monthly.find((m) => m.month === index + 1);
    return hit || { month: index + 1, period: "2026-" + String(index + 1).padStart(2, "0"), records: 0, basePay: 0, performancePay: 0, netPay: 0, grossPay: 0, incomeTax: 0, socialTotal: 0, pension: 0, medical: 0, unemployment: 0, housingFund: 0 };
  }),
  latestMonth: {
    month: 10, period: "2026-10", records: 1, netPay: 10672.36, grossPay: 12280, incomeTax: 175.44, socialTotal: 1432.2,
    breakdown: { fields: records[0], income: 12280, preTax: 0, social: 1432.2, tax: 175.44, net: 10672.36 },
  },
  previousMonth: { month: 9, period: "2026-09", records: 1, netPay: 8189.17, grossPay: 9720, incomeTax: 98.63, socialTotal: 1432.2 },
  mom: { amount: 2483.19, percent: 30.32 },
  latest: { id: "sal_4", payDate: "2026-10-15", cycle: "monthly", netPay: 10672.36 },
};

const RESPONSES = {
  "salary.status": { records: 4, latestDate: "2026-10-15", latestNetPay: 10672.36, currentYear: 2026, currentYearNetPay: 34851.86, currentYearRecords: 4, year: 2026, years: [2026] },
  "salary.stats": stats,
  "salary.recordList": { items: records, total: records.length, year: 2026, from: "", to: "" },
  "salary.recordGet": records[0],
};

class Hooks {
  constructor() { this.slots = []; this.deps = []; this.cursor = 0; this.effects = []; this.dirty = false; }
  reset() { this.cursor = 0; this.effects = []; }
  useState(init) {
    const i = this.cursor++;
    if (!(i in this.slots)) this.slots[i] = typeof init === "function" ? init() : init;
    const self = this;
    return [this.slots[i], (value) => { self.slots[i] = typeof value === "function" ? value(self.slots[i]) : value; self.dirty = true; }];
  }
  useEffect(fn, deps) {
    const i = this.cursor++;
    const prev = this.deps[i];
    const changed = !prev || JSON.stringify(prev) !== JSON.stringify(deps);
    this.deps[i] = deps;
    if (changed) this.effects.push(fn);
  }
  useMemo(fn) { return fn(); }
  useCallback(fn) { return fn; }
  useRef(value) { return { current: value }; }
}

function makeReact(hooks) {
  const createElement = (type, props, ...children) => ({ type, props: props || {}, children });
  return {
    createElement,
    useState: (v) => hooks.useState(v), useEffect: (fn, deps) => hooks.useEffect(fn, deps),
    useMemo: (fn) => hooks.useMemo(fn), useCallback: (fn) => hooks.useCallback(fn), useRef: (v) => hooks.useRef(v),
    Fragment: "Fragment", forwardRef: (render) => render,
    createContext: () => ({ Provider: (p) => p, Consumer: () => null }), useContext: () => ({}), useId: () => "id",
  };
}

const api = { call: async (action) => ({ ok: true, result: RESPONSES[action] !== undefined ? RESPONSES[action] : {} }) };

async function renderView(file, extraProps) {
  const component = require(ROOT + "packages/addons/salary/client/" + file);
  const hooks = new Hooks();
  const React = makeReact(hooks);
  let tree = null;
  for (let pass = 0; pass < 5; pass += 1) {
    hooks.dirty = false;
    hooks.reset();
    tree = component({ api, lang: "zh", title: "", React, h: React.createElement, ...(extraProps || {}) });
    for (const effect of hooks.effects) effect();
    await new Promise((resolve) => setTimeout(resolve, 0));
    if (!hooks.dirty) break;
  }
  return tree;
}

const esc = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const VOID = new Set(["input", "img", "br", "hr"]);

function toHtml(tree) {
  if (tree === null || tree === undefined || tree === false || tree === true) return "";
  if (Array.isArray(tree)) return tree.map(toHtml).join("");
  if (typeof tree === "string" || typeof tree === "number") return esc(tree);
  if (typeof tree !== "object") return "";
  if (typeof tree.type === "function") {
    const Inner = tree.type;
    if (Inner === "Fragment") return toHtml(tree.children);
    try {
      const innerHooks = new Hooks();
      const innerReact = makeReact(innerHooks);
      const out = Inner({ ...(tree.props || {}), React: innerReact, h: innerReact.createElement, children: tree.children });
      return toHtml(out);
    } catch (e) {
      return "";
    }
  }
  const tag = tree.type === "Fragment" ? "div" : tree.type;
  const props = tree.props || {};
  const attrs = [];
  if (props.className) attrs.push(' class="' + esc(props.className) + '"');
  if (props.style) {
    const cssText = Object.keys(props.style).map((key) => key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()) + ":" + props.style[key]).join(";");
    attrs.push(' style="' + esc(cssText) + '"');
  }
  if (props.id) attrs.push(' id="' + esc(props.id) + '"');
  // aria-*/role 决定状态样式与可访问性，预览也要如实输出（之前丢了 aria-pressed，选中态画不出来）
  for (const key of Object.keys(props)) {
    if (/^(aria-|role$|data-)/.test(key) && props[key] !== undefined && props[key] !== false) {
      attrs.push(" " + key.toLowerCase() + '="' + esc(String(props[key])) + '"');
    }
  }
  // colspan/rowspan 在真实 DOM 里是 colSpan/rowSpan，预览渲染器要转成小写属性
  for (const key of ["colSpan", "rowSpan"]) {
    if (props[key] !== undefined) attrs.push(" " + key.toLowerCase() + '="' + esc(props[key]) + '"');
  }
  if (tag === "input" || tag === "select" || tag === "textarea") {
    if (props.type) attrs.push(' type="' + esc(props.type) + '"');
    if (props.value !== undefined) attrs.push(' value="' + esc(props.value) + '"');
    if (props.placeholder) attrs.push(' placeholder="' + esc(props.placeholder) + '"');
  }
  if (VOID.has(tag)) return "<" + tag + attrs.join("") + ">";
  let inner = toHtml(tree.children);
  if (tag === "select") {
    inner = (tree.children || []).flat().map((child) => {
      if (!child || typeof child !== "object") return "";
      const childProps = child.props || {};
      return toHtml({ ...child, props: { ...childProps, selected: String(childProps.value) === String(props.value) ? "" : undefined } });
    }).join("");
  }
  if (tag === "option") {
    attrs.push(props.selected !== undefined ? " selected" : "");
    attrs.push(' value="' + esc(props.value === undefined ? "" : props.value) + '"');
  }
  return "<" + tag + attrs.join("") + ">" + inner + "</" + tag + ">";
}

async function main() {
const css = require(ROOT + "packages/addons/salary/client/ui/styles.cjs");
const cssText = Array.isArray(css) ? css.join("\n") : String(css);

const themeVars = {
  light: "--wb-card:#ffffff;--wb-surface:#ffffff;--wb-border:#e2e6ec;--wb-line:#eef0f4;--wb-muted:#6b7280;--wb-accent:#2563eb;--wb-ok:#15803d;--wb-warn:#b45309;--wb-danger:#b91c1c;--wb-text:#0f172a",
  dark: "--wb-card:#161b26;--wb-surface:#111621;--wb-border:#2a3242;--wb-line:#232a38;--wb-muted:#8b94a6;--wb-accent:#5b8cff;--wb-ok:#4ade80;--wb-warn:#fbbf24;--wb-danger:#f87171;--wb-text:#e8ecf4",
};

const recordsHtml = toHtml(await renderView("views/records.cjs"));
const statsHtml = toHtml(await renderView("views/stats.cjs"));
// 第二个统计实例切到「应发」口径，用来核对切换后的柱形高度与数值
const statsGrossHtml = toHtml(await renderView("views/stats.cjs", { initialMetric: "grossPay" }));
const detailHtml = toHtml(await renderView("views/records.cjs", { initialOpenId: "sal_4" }));
const formValues = {};
for (const key of FIELDS) formValues[key] = "";
Object.assign(formValues, { basePay: "8800", performancePay: "2200", allowance: "480", performanceBonus: "800", grossPay: "12280", netPay: "10672.36", pension: "739.2", medical: "184.8", unemployment: "46.2", housingFund: "462", incomeTax: "175.44" });
const formHtml = toHtml(await renderView("views/records.cjs", {
  initialForm: { mode: "edit", id: "sal_4", payDate: "2026-10-15", cycle: "monthly", note: "2026 年 10 月工资条", values: formValues, lockGross: false },
}));

function pane(theme, title, body, extraClass) {
  return `<section class="pane${extraClass ? " " + extraClass : ""}" data-theme="${theme}" style="${themeVars[theme]}">
    <div class="pane-title">${title}</div>
    <div class="pane-body">${body}</div>
  </section>`;
}

const html = `<!doctype html><html lang="zh"><head><meta charset="utf-8"><title>salary preview</title>
<style>
  html,body{margin:0;padding:0;background:#070a12;color:#e8ecf4;font-family:-apple-system,"PingFang SC","Segoe UI",sans-serif}
  .wrap{display:grid;grid-template-columns:1fr;gap:0}
  .pane{padding:18px 22px;border-bottom:1px solid #1d2330;background:var(--wb-bg,#0b1020)}
  .pane[data-theme="light"]{--wb-bg:#f5f7fa;color:#0f172a}
  .pane[data-theme="dark"]{--wb-bg:#0b1020;color:#e8ecf4}
  .pane-title{font:600 11px/1 ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:#7d879b;margin:0 0 10px 2px}
  .pane-body{max-width:none}
  .pane-modal .pane-body{position:relative;min-height:1080px;border-radius:12px;overflow:hidden;border:1px solid #1d2330}
  .pane-modal .wbsal-mask{position:absolute;padding:18px}
  .pane-modal .wbsal-modal{width:100%;margin:0}
  ${cssText}
</style></head><body><div class="wrap">
${pane("light", "light · records", recordsHtml)}
${pane("light", "light · detail", detailHtml)}
${pane("light", "light · stats", statsHtml)}
${pane("light", "light · stats · 应发口径", statsGrossHtml)}
${pane("light", "light · form", formHtml, "pane-modal")}
${pane("dark", "dark · records", detailHtml)}
${pane("dark", "dark · form", formHtml, "pane-modal")}
${pane("dark", "dark · stats", statsHtml)}
${pane("dark", "dark · stats · 应发口径", statsGrossHtml)}
</div></body></html>`;

writeFileSync("/tmp/salary-preview.html", html);
console.log("/tmp/salary-preview.html", html.length);
}

export { Hooks, makeReact, toHtml };

if (process.argv[1] && process.argv[1].endsWith("preview-salary.mjs")) await main();
