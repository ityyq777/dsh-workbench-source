/**
 * 工资插件客户端冒烟：不启动浏览器，用最小 React hooks 运行时把 5 个视图各渲染两轮，
 * 验证 client.src.cjs 注册形态、样式注入，以及每个视图在「有数据」时不会抛错。
 * 只做结构断言（类名/关键文案），不做像素比对。
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Module from "node:module";

const require = createRequire(import.meta.url);
const ROOT = fileURLToPath(new URL("../", import.meta.url));

// lucide-react 是 ESM 包，这里统一换成占位图标组件即可。
const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request.startsWith("lucide-react/icons/")) return { default: function StubIcon() { return { type: "svg", props: {}, children: [] }; } };
  return origLoad.call(this, request, parent, isMain);
};

const salaryStats = {
  year: 2026, records: 4, months: 4, netTotal: 34851.86, grossTotal: 41040, incomeTaxTotal: 459.34,
  socialTotal: 5728.8, deductionTotal: 6188.14, avgNetPay: 8712.97,
  monthly: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => ({
    month, period: "2026-" + String(month).padStart(2, "0"),
    records: month >= 7 && month <= 10 ? 1 : 0,
    netPay: [7878.77, 8111.56, 8189.17, 10672.36][month - 7] || 0,
    grossPay: [9400, 9640, 9720, 12280][month - 7] || 0,
    incomeTax: [89.03, 96.24, 98.63, 175.44][month - 7] || 0,
    socialTotal: month >= 7 && month <= 10 ? 1432.2 : 0,
  })),
  latestMonth: {
    month: 10, period: "2026-10", records: 1, netPay: 10672.36, grossPay: 12280, incomeTax: 175.44, socialTotal: 1432.2,
    breakdown: {
      fields: {
        basePay: 8800, performancePay: 2200, positionPay: 0, allowance: 480, performanceBonus: 800, otherPay: 0,
        holidayOvertime: 0, sickDeduction: 0, personalDeduction: 0, otherDeduction: 0, grossPay: 12280,
        pension: 739.2, medical: 184.8, unemployment: 46.2, housingFund: 462, incomeTax: 175.44,
        postTaxDeduction: 0, netPay: 10672.36,
      },
      income: 12280, preTax: 0, social: 1432.2, tax: 175.44, net: 10672.36,
    },
  },
  previousMonth: { month: 9, period: "2026-09", records: 1, netPay: 8189.17, grossPay: 9720, incomeTax: 98.63, socialTotal: 1432.2 },
  mom: { amount: 2483.19, percent: 30.32 },
  latest: { id: "sal_x", payDate: "2026-10-15", cycle: "monthly", netPay: 10672.36 },
};

const records = [
  { id: "sal_4", payDate: "2026-10-15", cycle: "monthly", basePay: 8800, performancePay: 2200, positionPay: 0, allowance: 480, performanceBonus: 800, otherPay: 0, holidayOvertime: 0, sickDeduction: 0, personalDeduction: 0, otherDeduction: 0, grossPay: 12280, pension: 739.2, medical: 184.8, unemployment: 46.2, housingFund: 462, incomeTax: 175.44, postTaxDeduction: 0, netPay: 10672.36, note: "2026年10月工资条" },
  { id: "sal_3", payDate: "2026-09-15", cycle: "monthly", basePay: 0, performancePay: 0, positionPay: 0, allowance: 0, performanceBonus: 0, otherPay: 0, holidayOvertime: 0, sickDeduction: 0, personalDeduction: 0, otherDeduction: 0, grossPay: 9720, pension: 739.2, medical: 184.8, unemployment: 46.2, housingFund: 462, incomeTax: 98.63, postTaxDeduction: 0, netPay: 8189.17, note: "" },
];

const RESPONSES = {
  "salary.status": { records: 4, latestDate: "2026-10-15", latestNetPay: 10672.36, currentYear: 2026, currentYearNetPay: 34851.86, currentYearRecords: 4, year: 2026, years: [2026] },
  "salary.stats": salaryStats,
  "salary.recordList": { items: records, total: records.length, year: 2026, from: "", to: "" },
  "salary.recordGet": records[0],
  "salary.dataTables": { tables: [] },
  "salary.dataQuery": { rows: [], columns: [], total: 0 },
  "salary.actionSchema": { actions: [] },
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
    useState: (v) => hooks.useState(v),
    useEffect: (fn, deps) => hooks.useEffect(fn, deps),
    useMemo: (fn) => hooks.useMemo(fn),
    useCallback: (fn) => hooks.useCallback(fn),
    useRef: (v) => hooks.useRef(v),
    Fragment: "Fragment",
    forwardRef: (render) => render,
    createContext: () => ({ Provider: (p) => p, Consumer: () => null }),
    useContext: () => ({}),
    useId: () => "id",
  };
}

/** 两轮渲染：第一轮拿 loading 态，effect 里 api.call 完成后第二轮拿数据态。 */
async function render(component, props, api) {
  const hooks = new Hooks();
  const React = makeReact(hooks);
  let tree = null;
  for (let pass = 0; pass < 4; pass += 1) {
    hooks.dirty = false;
    hooks.reset();
    tree = component({ ...props, React, api });
    for (const effect of hooks.effects) effect();
    await new Promise((resolve) => setTimeout(resolve, 0));
    if (!hooks.dirty) break;
  }
  return tree;
}

function collect(tree, found = new Set()) {
  if (!tree || typeof tree !== "object") return found;
  if (Array.isArray(tree)) {
    for (const item of tree) collect(item, found);
    return found;
  }
  const className = tree.props && tree.props.className;
  if (typeof className === "string") className.split(/\s+/).forEach((name) => name && found.add(name));
  if (typeof tree.type === "function") found.add("[fn]" + (tree.type.name || "anonymous"));
  (tree.children || []).forEach((child) => { if (child !== null && child !== undefined && child !== false) collect(child, found); });
  return found;
}

const HOST = { react: null, h: null, registerAddon(addon) { HOST.addon = addon; } };
const styles = [];
global.window = { __WB_HOST__: HOST };
global.document = { head: { appendChild: (el) => styles.push(el) }, getElementById: () => null, createElement: () => ({ setAttribute() {}, appendChild() {}, textContent: "" }) };

HOST.react = makeReact(new Hooks());
HOST.h = (type, props, ...children) => ({ type, props: props || {}, children });

const clientPath = ROOT + "packages/addons/salary/client/client.src.cjs";
require(clientPath);

const problems = [];
if (!HOST.addon || HOST.addon.id !== "wb-addon-salary") problems.push("client.src.cjs 没有注册 wb-addon-salary");
if (!HOST.addon || !Array.isArray(HOST.addon.views) || HOST.addon.views.length !== 5) problems.push("views 数量不是 5");
const css = styles.map((el) => el.textContent).join("\n");
for (const klass of ["wbsal-page", "wbsal-kpi", "wbsal-record-row", "wbsal-chart", "wbsal-comp", "wbsal-input", "--wb-card", "wbsal-table", "wbsal-ul", "wbsal-card"]) {
  if (!css.includes(klass)) problems.push("样式表缺少 " + klass);
}

const api = { call: async (action) => ({ ok: true, result: RESPONSES[action] !== undefined ? RESPONSES[action] : {} }) };
const checks = [
  ["records", "views/records.cjs", "工资记录", ["wbsal-record-row", "wbsal-kpi", "wbsal-head", "wbsal-month"]],
  ["stats", "views/stats.cjs", "统计", ["wbsal-chart", "wbsal-comp", "wbsal-table"]],
  ["config", "views/config.cjs", "设置", ["wbsal-ul"]],
];
for (const [id, file, title, expected] of checks) {
  const view = HOST.addon.views.find((v) => v.id === id);
  if (!view) { problems.push("缺少视图 " + id); continue; }
  const component = require(ROOT + "packages/addons/salary/client/" + file);
  let tree;
  try {
    tree = await render(component, { api, lang: "zh", title, h: HOST.h }, api);
  } catch (e) {
    problems.push(id + " 渲染抛错：" + (e && e.stack ? e.stack.split("\n")[0] : e));
    continue;
  }
  const found = collect(tree);
  if (process.env.SALARY_DEBUG) console.error(id, [...found].join(" "));
  for (const klass of expected) if (!found.has(klass)) problems.push(id + " 没渲染出 ." + klass);
  if (JSON.stringify(tree).includes("undefined") && id !== "config") problems.push(id + " 渲染结果含 undefined 文本");
}

const bundle = readFileSync(ROOT + "packages/addons/salary/lib/client.js", "utf8");
for (const needle of ['id: "wb-addon-salary"', "version: \"0.1.0\""]) {
  if (!bundle.includes(needle.replace(/"([^"]+)"/g, (m) => m))) {
    const alt = needle.replace(/"([^"]+)"/g, "'$1'");
    if (!bundle.includes(needle) && !bundle.includes(alt)) problems.push("构建产物 lib/client.js 缺少 " + needle);
  }
}

if (problems.length) {
  console.error("工资客户端冒烟失败：");
  for (const p of problems) console.error("  - " + p);
  process.exitCode = 1;
} else {
  console.log("工资客户端冒烟通过：5 个视图注册钩子正常，records/stats/config 在有数据时渲染成功，样式已注入。");
}
