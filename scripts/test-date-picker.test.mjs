/**
 * 共享日期控件行为测试：值归一、工具函数、四种形态的渲染契约。
 * 用预览脚本里的替身 React（不需要浏览器），任何断言失败都说明共享契约被破坏。
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { Hooks, makeReact, toHtml } from "./preview-salary.mjs";

const require = createRequire(import.meta.url);
const ROOT = new URL("../", import.meta.url).pathname;
const DP = require(ROOT + "packages/addons/lib/date-picker.cjs");
const styles = require(ROOT + "packages/addons/lib/date-picker-styles.cjs");

function render(component, props) {
  const React = makeReact(new Hooks());
  return toHtml(component({ React, h: React.createElement, prefix: "tst", lang: "zh", ...props }));
}

test("日期工具跨月跨年都按 UTC 计算", () => {
  assert.match(DP.todayISO(), /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(DP.shiftDate("2026-12-31", 1), "2027-01-01");
  assert.equal(DP.shiftDate("2026-03-01", -1), "2026-02-28");
  assert.equal(DP.shiftMonth("2026-01", -1), "2025-12");
  assert.equal(DP.shiftMonth("2025-12", 1), "2026-01");
  assert.equal(DP.daysInMonth("2026-02"), 28);
  assert.equal(DP.daysInMonth("2024-02"), 29);
  assert.equal(DP.monthLabel("2026-11"), "2026年11月");
  assert.equal(DP.monthLabel("2026-11", true), "2026-11");
});

test("非法日期不接受，区间反向自动对调", () => {
  assert.equal(DP.validDate("2026-02-30"), false);
  assert.equal(DP.validDate("2026-11-17"), true);
  assert.equal(DP.validDate(""), false);
  assert.deepEqual(DP.normalizeRange({ from: "2026-11-17", to: "2026-11-03" }), { from: "2026-11-03", to: "2026-11-17", swapped: true });
  assert.deepEqual(DP.normalizeRange({ from: "2026-11-03", to: "" }), { from: "2026-11-03", to: "", swapped: false });
});

test("DatePicker 渲染当月天数、选中态与清除按钮", () => {
  const html = render(DP.DatePicker, { value: "2026-11-17", defaultOpen: true, label: "发薪日期" });
  assert.equal((html.match(/data-day="2026-11-/g) || []).length, 30);
  assert.match(html, /class="tst-dp-day is-on" data-day="2026-11-17"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /tst-dp-clear/);
  assert.match(html, /aria-label="发薪日期: 2026-11-17"/);
  assert.match(html, /今天/);
});

test("DatePicker 空值只显示占位，不渲染清除", () => {
  const html = render(DP.DatePicker, { value: "", placeholder: "选择日期" });
  assert.match(html, /tst-dp-value is-empty/);
  assert.doesNotMatch(html, /tst-dp-clear/);
  assert.doesNotMatch(html, /data-day=/);
});

test("RangePicker 标出区间底色与两端", () => {
  const html = render(DP.RangePicker, { value: { from: "2026-11-03", to: "2026-11-05" }, defaultOpen: true });
  assert.match(html, /aria-label="发布时间范围: 2026-11-03 — 2026-11-05"|2026-11-03 — 2026-11-05/);
  assert.equal((html.match(/is-between/g) || []).length, 1, "只有两端之间的 4 号是区间态");
  assert.equal((html.match(/ is-on/g) || []).length, 2, "起止两端各自是选中态");
  assert.match(html, /清除范围/);
});

test("MonthPicker 提供 12 个月格并标记当前值", () => {
  const html = render(DP.MonthPicker, { value: "2026-11", defaultOpen: true });
  assert.equal((html.match(/data-month="2026-\d{2}"/g) || []).length, 12);
  assert.match(html, /data-month="2026-11" aria-pressed="true"/);
  assert.match(html, /本月/);
});

test("InlineCalendar 不渲染触发按钮，直接铺开月历", () => {
  const html = render(DP.InlineCalendar, { value: "2026-11-19" });
  assert.doesNotMatch(html, /tst-dp-trigger/);
  assert.match(html, /tst-dp-grid/);
  assert.match(html, /data-day="2026-11-19"/);
});

test("直接进入统计页也会挂载本插件的共享日历样式", () => {
  const sheets = [];
  globalThis.document = {
    getElementById: id => sheets.find(sheet => sheet.id === id),
    createElement: () => ({}),
    head: { appendChild: sheet => sheets.push(sheet) },
  };
  try {
    for (const [addon, prefix] of [["tasks", "wbt"], ["tags", "wbg"], ["sites", "wbs"]]) {
      require(`${ROOT}packages/addons/${addon}/client/stats/charts.cjs`).makeCharts(prefix);
      assert.ok(document.getElementById(prefix + "-charts-css").textContent.includes(styles(prefix)), addon);
    }
  } finally {
    delete globalThis.document;
  }
});

test("样式只使用主题令牌，不写死颜色", () => {
  for (const prefix of ["wbsal", "wbt", "wbg", "wbs"]) {
    const css = styles(prefix);
    assert.equal(typeof css, "string");
    assert.match(css, new RegExp("\\." + prefix + "-dp-trigger"));
    const fixed = css.replace(/var\(--wb-on-accent,[^)]*\)/g, "").match(/#[0-9a-fA-F]{3,8}\b/g) || [];
    assert.deepEqual(fixed, [], prefix + " 不应出现写死色值（--wb-on-accent 兜底除外）");
    assert.doesNotMatch(css, /rgba?\(/, prefix + " 不应出现固定 rgba");
    assert.match(css, new RegExp("@keyframes " + prefix + "-dp-in"));
  }
});
