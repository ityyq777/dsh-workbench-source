/**
 * 工资插件客户端冒烟：不启动浏览器，用最小 React hooks 运行时把 4 个视图各渲染两轮，
 * 验证 client.src.cjs 注册形态、样式注入，以及每个视图在「有数据」时不会抛错。
 * 只做结构断言（类名/关键文案），不做像素比对。
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Module from "node:module";
import assert from "node:assert/strict";

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
    basePay: [7040, 0, 0, 8800][month - 7] || 0,
    performancePay: [2200, 0, 0, 2200][month - 7] || 0,
    allowance: [160, 0, 0, 480][month - 7] || 0,
    performanceBonus: [0, 0, 0, 800][month - 7] || 0,
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
  // 年度/季度/同比/分布：与后端口径一一对应，缺了统计页会退化成空态。
  yearly: [
    { bucket: "2025", count: 1, netTotal: 7000, grossTotal: 8000, netMax: 7000, grossMax: 8000, netAvg: 7000, grossAvg: 8000 },
    { bucket: "2026", count: 4, netTotal: 34851.86, grossTotal: 41040, netMax: 10672.36, grossMax: 12280, netAvg: 8712.97, grossAvg: 10260 },
  ],
  quarterly: [
    { bucket: "2025-Q4", count: 1, netTotal: 7000, grossTotal: 8000, netMax: 7000, grossMax: 8000, netAvg: 7000, grossAvg: 8000 },
    { bucket: "2026-Q3", count: 3, netTotal: 24179.5, grossTotal: 28760, netMax: 8189.17, grossMax: 9720, netAvg: 8059.83, grossAvg: 9586.67 },
    { bucket: "2026-Q4", count: 1, netTotal: 10672.36, grossTotal: 12280, netMax: 10672.36, grossMax: 12280, netAvg: 10672.36, grossAvg: 12280 },
  ],
  priorYear: 2025,
  priorMonthly: Array.from({ length: 12 }, (_, i) => ({
    month: i + 1, records: i === 8 ? 1 : 0, netPay: i === 8 ? 7000 : 0, grossPay: i === 8 ? 8000 : 0,
  })),
  distribution: [
    { key: "lt5k", label: "5k 以下", lower: 0, upper: 5000, count: 0 },
    { key: "5to8k", label: "5k–8k", lower: 5000, upper: 8000, count: 1 },
    { key: "8to12k", label: "8k–12k", lower: 8000, upper: 12000, count: 3 },
    { key: "12to20k", label: "12k–20k", lower: 12000, upper: 20000, count: 0 },
    { key: "gte20k", label: "20k 以上", lower: 20000, upper: null, count: 0 },
  ],
  peakMonth: { month: 10, period: "2026-10", netPay: 10672.36 },
  lowestMonth: { month: 7, period: "2026-07", netPay: 7878.77 },
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
async function render(component, props, api, hooks = new Hooks()) {
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
// 记一笔/编辑工资的弹窗外壳由 lib/staged-dialog.cjs（内含 overlay.cjs）渲染（本测试的迷你 React
// 不展开函数组件，所以改成对源码契约的断言：外壳工厂 + 插件自己的 mask/dialog 类名）。
{
  const recordsSrc = require("node:fs").readFileSync(ROOT + "packages/addons/salary/client/views/records.cjs", "utf8");
  for (const needle of ['lib/staged-dialog.cjs', 'createStagedDialog({', 'maskClass: "wbsal-mask"', 'dialogClass: "wbsal-modal"', 'onClose: saving ? null : closeForm']) {
    if (!recordsSrc.includes(needle)) problems.push("records.cjs 没接入共享弹窗外壳：" + needle);
  }
}
if (!HOST.addon || HOST.addon.id !== "wb-addon-salary") problems.push("client.src.cjs 没有注册 wb-addon-salary");
if (!HOST.addon || !Array.isArray(HOST.addon.views) || HOST.addon.views.length !== 4) problems.push("views 数量不是 4");
const css = styles.map((el) => el.textContent).join("\n");
for (const klass of ["wbsal-page", "wbsal-kpi", "wbsal-record-row", "wbsal-chart", "wbsal-comp", "wbsal-input", "--wb-card", "wbsal-card", "wbsal-metric", "wbsal-mask", "wbsal-form-modal", "wbsal-linechart", "wbsal-series", "wbsal-social-foot"]) {
  if (!css.includes(klass)) problems.push("样式表缺少 " + klass);
}

const api = { call: async (action, args) => ({ ok: true, result: action === "salary.stats"
  ? { ...salaryStats, year: args.year, basis: args.basis }
  : RESPONSES[action] ?? {} }) };
const checks = [
  ["records", "views/records.cjs", "工资记录", ["wbsal-record-row", "wbsal-toolbar", "wbsal-toolbar-end", "wbsal-month"]],
  ["stats", "views/stats.cjs", "统计", ["wbsal-chart", "wbsal-comp", "wbsal-metric", "wbsal-linechart", "wbsal-series"]],
];
for (const [id, file, title, expected] of checks) {
  const view = HOST.addon.views.find((v) => v.id === id);
  if (!view) { problems.push("缺少视图 " + id); continue; }
  const component = require(ROOT + "packages/addons/salary/client/" + file);
  let tree;
  // 用例参数在分步渲染复核时要复用，提到 try 外面。
  const extra = id === "records"
    ? { initialForm: { mode: "create", id: "", payDate: "2026-11-17", cycle: "monthly", note: "2026年10月工资", values: require(ROOT + "packages/addons/salary/client/ui/fields.cjs").blankValues(), lockGross: false } }
    : {};
  try {
    tree = await render(component, Object.assign({ api, lang: "zh", title, h: HOST.h }, extra), api);
  } catch (e) {
    problems.push(id + " 渲染抛错：" + (e && e.stack ? e.stack.split("\n")[0] : e));
    continue;
  }
  const found = collect(tree);
  if (process.env.SALARY_DEBUG) console.error(id, [...found].join(" "));
  if (id === "records") {
    // 金额输入已统一走共享数字控件：按分步进、留空表示不填、只有绩效奖惩允许负数。
    const NF = require(ROOT + "packages/addons/lib/number-field.cjs");
    const F = require(ROOT + "packages/addons/salary/client/ui/fields.cjs");
    // 弹窗已改成分步：金额项分布在「金额明细」第 2 步与「汇总」第 3 步，
    // 所以按步逐个渲染再合并统计，仍是「每个金额项都换成共享数字控件」的同一断言。
    const nodes = [];
    const walkNodes = function (node) {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) { node.forEach(walkNodes); return; }
      if (node.type === NF.NumberField) nodes.push(node);
      (node.children || []).forEach(walkNodes);
    };
    // 弹窗正文由步骤自由函数提供，不渲染就看不到金额控件，这里直接把金额步的 render(hh) 调出来统计。
    const findStaged = function (node) {
      if (!node || typeof node !== "object") return null;
      if (Array.isArray(node)) { for (const item of node) { const hit = findStaged(item); if (hit) return hit; } return null; }
      if (node.props && Array.isArray(node.props.steps)) return node;
      for (const child of node.children || []) { const hit = findStaged(child); if (hit) return hit; }
      return null;
    };
    const staged = findStaged(tree);
    assert.ok(staged, "工资弹窗走共享分阶段外壳");
    for (const stepIndex of [1, 2]) walkNodes(staged.props.steps[stepIndex].render(HOST.h));
    assert.equal(nodes.length, F.KEYS.length, "每个金额项都换成共享数字控件");
    for (const node of nodes) {
      assert.equal(node.props.step, 0.01, "金额按分步进");
      assert.equal(node.props.allowEmpty, true, "留空表示不填");
      assert.equal(node.props.hint, false, "金额格不重复显示范围提示");
      assert.ok(node.props.ariaLabel, "金额格保留无障碍标签");
      if (node.props.ariaLabel === F.LABELS.performanceBonus) assert.equal(node.props.min, undefined, "绩效奖惩允许负数");
      else assert.equal(node.props.min, 0, "其余金额不允许负数");
    }
    const recordsSrc = readFileSync(ROOT + "packages/addons/salary/client/views/records.cjs", "utf8");
    assert.ok(!/type:\s*"number"/.test(recordsSrc), "records.cjs 不再用原生 number 输入");
    assert.ok(recordsSrc.includes("firstBadAmount"), "保存前逐项复核金额合法性");
    assert.ok(recordsSrc.includes("moneyInvalid"), "存在非法金额时禁用保存");
  }
  for (const klass of expected) if (!found.has(klass)) problems.push(id + " 没渲染出 ." + klass);
  if (JSON.stringify(tree).includes("undefined")) problems.push(id + " 渲染结果含 undefined 文本");
}

// 折线已换成 packages/addons/lib/stats-charts.cjs 的共享 Trend：
// 迷你 React 不展开函数组件，所以这里直接取 Trend 节点的 props 来核对系列、
// 可见性与悬停下标，画笔内部的十字线/热区由共享件自己保证。
const charts = require(ROOT + "packages/addons/lib/stats-charts.cjs");
// primitives() 每次调用都产生新的闭包，不能靠引用相等找节点，按组件名识别。
const componentNamed = (tree, name, found = []) => {
  if (Array.isArray(tree)) { tree.forEach((node) => componentNamed(node, name, found)); return found; }
  if (!tree || typeof tree !== "object") return found;
  if (typeof tree.type === "function" && tree.type.name === name) found.push(tree);
  (tree.children || []).forEach((child) => componentNamed(child, name, found));
  return found;
};
const trendNodes = (tree) => componentNamed(tree, "Trend");
function nodeOf(tree, predicate, found = []) {
  if (Array.isArray(tree)) { tree.forEach((node) => nodeOf(node, predicate, found)); return found; }
  if (!tree || typeof tree !== "object") return found;
  if (predicate(tree)) found.push(tree);
  (tree.children || []).forEach((child) => nodeOf(child, predicate, found));
  return found;
}
const statsComp = require(ROOT + "packages/addons/salary/client/views/stats.cjs");
const fixedApi = api;
function locate(tree, predicate) {
  if (Array.isArray(tree)) return tree.map((node) => locate(node, predicate)).find(Boolean);
  if (!tree || typeof tree !== "object") return undefined;
  return predicate(tree) ? tree : locate(tree.children, predicate);
}

// 切换统计时，在新请求返回前不展示上一口径的图表。
const statsHooks = new Hooks();
const statsProps = { lang: "zh", h: HOST.h };
const arrivalTree = await render(statsComp, statsProps, api, statsHooks);
locate(arrivalTree, (node) => node.type === "button" && node.children[0] === "按所属月").props.onClick();
statsHooks.reset();
const switchingTree = statsComp({ ...statsProps, React: makeReact(statsHooks), api });
assert.equal(collect(switchingTree).has("wbsal-chart"), false);
// 执行本次渲染排入的 effect，让所属口径请求完成。
for (const effect of statsHooks.effects) effect();
await new Promise((resolve) => setTimeout(resolve, 0));
const incomeTree = await render(statsComp, statsProps, api, statsHooks);
assert.equal(collect(incomeTree).has("wbsal-chart"), true);

const baseProps = { api: fixedApi, lang: "zh", title: "统计", h: HOST.h };
const allTrends = trendNodes(await render(statsComp, baseProps, fixedApi));
if (allTrends.length !== 5) problems.push("统计页应有 5 张趋势图（年度/季度/月度/社保/同比），实际 " + allTrends.length);
const trendWith = (list, key) => list.find((node) => (node.props.series || []).some((s) => s.key === key));
const tonesOf = (node) => (node.props.series || []).map((s) => s.className);
const monthlyTrend = trendWith(allTrends, "netPay");
const yearlyTrend = trendWith(allTrends, "total");
const socialTrend = trendWith(allTrends, "deductTotal");
const yoyTrend = trendWith(allTrends, "now");
if (!monthlyTrend) problems.push("月度趋势应复用共享 Trend 并包含实发系列");
if (!yearlyTrend) problems.push("年度趋势应复用共享 Trend 且三条线 key 为 total/max/avg");
if (!socialTrend) problems.push("社保与个税应复用共享 Trend 并包含合计系列 deductTotal");
if (!yoyTrend) problems.push("同比对照应复用共享 Trend 且两条线 key 为 now/prior");
if (monthlyTrend && tonesOf(monthlyTrend).join(",") !== "s1,s2,s3,s4,s5,s6") {
  problems.push("月度六条线应依次挂 s1..s6 色调，实际 " + tonesOf(monthlyTrend).join(","));
}
if (yearlyTrend) {
  const keys = (yearlyTrend.props.series || []).map((s) => s.key).join(",");
  if (keys !== "total,max,avg") problems.push("年度趋势三条线应为 合计/单笔最高/单笔均值，实际 " + keys);
  if ((yearlyTrend.props.data || []).length !== salaryStats.yearly.length) problems.push("年度趋势应按后端 yearly 出点");
}
if (socialTrend) {
  const keys = (socialTrend.props.series || []).map((s) => s.key);
  if (!keys.includes("pension") || !keys.includes("incomeTax") || keys[keys.length - 1] !== "deductTotal") {
    problems.push("社保与个税系列应为 五项 + 个税 + 合计，实际 " + keys.join(","));
  }
  const sum = (socialTrend.props.series || []).find((s) => s.key === "deductTotal");
  if (sum && sum.className !== "sum") problems.push("合计线应挂 sum 色调（虚线样式），实际 " + sum.className);
}
if (yoyTrend) {
  const labels = (yoyTrend.props.series || []).map((s) => s.label);
  if (!labels.includes("2026 年") || !labels.includes("2025 年")) problems.push("同比两条线应写今年与去年年份，实际 " + labels.join(","));
}
for (const node of allTrends) {
  if (typeof node.props.format !== "function") problems.push("趋势图应传入金额格式化函数");
  if (node.props.showLegend !== false) problems.push("趋势图图例应由插件自己的开关渲染，不应重复画共享图例");
}

// 系列开关：初始隐藏项要透传到共享 Trend 的 visible。
const hiddenMonthly = trendWith(trendNodes(await render(statsComp, {
  ...baseProps, initialVisible: { basePay: false, performancePay: false },
}, fixedApi)), "netPay");
if (!hiddenMonthly) problems.push("隐藏基本/绩效后月度趋势仍应渲染");
else {
  const vis = hiddenMonthly.props.visible || {};
  if (vis.basePay !== false) problems.push("取消勾选后 Trend.visible.basePay 应为 false");
  if (vis.performancePay !== false) problems.push("取消勾选后 Trend.visible.performancePay 应为 false");
  if (vis.netPay === false) problems.push("取消勾选基本/绩效不应连带隐藏实发");
}
const hiddenSocial = trendWith(trendNodes(await render(statsComp, {
  ...baseProps, initialSocialVisible: { pension: false, medical: false },
}, fixedApi)), "deductTotal");
if (!hiddenSocial) problems.push("隐藏养老/医疗后社保趋势仍应渲染");
else {
  const vis = hiddenSocial.props.visible || {};
  if (vis.pension !== false || vis.medical !== false) problems.push("取消勾选后 Trend.visible 应带上 pension/medical = false");
  if (vis.deductTotal === false) problems.push("取消勾选养老/医疗不应连带隐藏合计");
  if (vis.unemployment === false) problems.push("未关失业时失业线应保持可见");
}

// 全部关掉时给出恢复提示（提示由插件渲染，不是共享件内部）。
const allOff = collect(await render(statsComp, {
  ...baseProps,
  initialVisible: { netPay: false, grossPay: false, basePay: false, performancePay: false, allowance: false, performanceBonus: false },
}, fixedApi));
if (!allOff.has("wbsal-chart-hint")) problems.push("六条线全关后应渲染 .wbsal-chart-hint 提示");

// 悬停：插件自己画提示卡，共享 Trend 负责热区与十字线。
const hoverTree = await render(statsComp, { ...baseProps, initialHover: 10 }, fixedApi);
const hoverClasses = collect(hoverTree);
for (const cls of ["wbsal-tip", "wbsal-tip-row", "wbsal-legend", "wbsal-metric", "wbsal-series", "wbsal-linechart"]) {
  if (!hoverClasses.has(cls)) problems.push("悬停某月后应渲染 ." + cls);
}
if (!JSON.stringify(hoverTree).includes("2026年10月")) problems.push("悬停提示卡应显示月份标题");
const hoverTrend = trendWith(trendNodes(hoverTree), "netPay");
if (hoverTrend) {
  const active = hoverTrend.props.active;
  const activeRow = active === null || active === undefined ? null : (hoverTrend.props.data || [])[active];
  if (!activeRow || activeRow.month !== 10) problems.push("悬停 10 月应把该月在折线下标透传给共享 Trend（active），实际 " + active);
  if (typeof hoverTrend.props.onHover !== "function") problems.push("共享 Trend 应接管热区事件（onHover）");
}
const chartSrc = readFileSync(ROOT + "packages/addons/lib/stats-charts.cjs", "utf8");
for (const cls of ["-trend-hit", "-trend-slot", "-trend-cross"]) {
  if (!chartSrc.includes(cls)) problems.push("共享 Trend 应带热区/十字线类名 " + cls);
}

// 单笔分布走共享直方图。
const distNodes = componentNamed(await render(statsComp, baseProps, fixedApi), "Histogram");
if (distNodes.length !== 1) problems.push("单笔分布应复用共享 Histogram，实际 " + distNodes.length + " 个");
else if ((distNodes[0].props.data || []).length !== salaryStats.distribution.length) problems.push("直方图应按后端 distribution 出档");

const pkgVersion = JSON.parse(readFileSync(ROOT + "packages/addons/salary/package.json", "utf8")).version;
const bundle = readFileSync(ROOT + "packages/addons/salary/lib/client.js", "utf8");
for (const needle of ['id: "wb-addon-salary"', 'version: "' + pkgVersion + '"']) {
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
  const F = require("../packages/addons/salary/client/ui/fields.cjs");
assert.equal(F.incomePeriod("2026-11-17"), "2026-10", "所属月份应为上一个自然月");
assert.equal(F.incomePeriod("2026-01-15"), "2025-12", "1 月发薪应归属上一年 12 月");
assert.equal(F.defaultNote("2026-11-17", "monthly"), "2026年10月工资", "月结默认备注应写所属月份");
assert.equal(F.defaultNote("2026-11-17", "daily"), "", "日结不套用上月工资备注");
console.log("工资客户端冒烟通过：4 个视图注册钩子正常，records/stats 在有数据时渲染成功，样式已注入。");
}
