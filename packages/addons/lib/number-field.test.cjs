// 共享数字输入控件测试：自由输入、红字提示、只在合法时提交。
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const NF = require("./number-field.cjs");

const h = React.createElement;

function html(props) {
  return renderToStaticMarkup(h(NF.NumberField, Object.assign({ h: h, lang: "zh" }, props)));
}

test("校验：空值默认报错，allowEmpty 时放行", () => {
  assert.equal(NF.validateNumber("", {}).ok, false);
  assert.equal(NF.validateNumber("", {}).error, "请填写数字");
  assert.deepEqual(NF.validateNumber("  ", { allowEmpty: true }), { ok: true, value: null, error: "" });
});

test("校验：非法字符与整数约束", () => {
  assert.equal(NF.validateNumber("12a", {}).error, "请输入数字");
  assert.equal(NF.validateNumber("1.5", { integer: true }).error, "需要是整数");
  assert.equal(NF.validateNumber("3", { integer: true }).ok, true);
});

test("校验：范围越界只报错，不夹取", () => {
  assert.equal(NF.validateNumber("0", { min: 1, max: 500 }).error, "需要在 1–500 之间");
  assert.equal(NF.validateNumber("1000", { min: 1, max: 500 }).error, "需要在 1–500 之间");
  assert.deepEqual(NF.validateNumber("500", { min: 1, max: 500 }), { ok: true, value: 500, error: "" });
  assert.equal(NF.validateNumber("0", { min: 1 }).error, "不能小于 1");
  assert.equal(NF.validateNumber("9", { max: 5 }).error, "不能大于 5");
});

test("校验：步长与英文文案", () => {
  assert.equal(NF.validateNumber("0.3", { min: 0, max: 5, step: 0.5 }).error, "需要是 0.5 的倍数");
  assert.equal(NF.validateNumber("2.5", { min: 0, max: 5, step: 0.5 }).ok, true);
  assert.equal(NF.validateNumber("abc", { lang: "en" }).error, "Please enter a number");
  assert.equal(NF.validateNumber("9", { max: 5, lang: "en" }).error, "Must be at most 5");
});

test("提示：范围渲染为可读文案", () => {
  assert.equal(NF.rangeHint({ min: 1, max: 500, integer: true }, "zh"), "1–500，整数");
  assert.equal(NF.rangeHint({ min: 0, step: 0.01 }, "zh"), "≥ 0，步长 0.01");
  assert.equal(NF.rangeHint({ max: 1440 }, "en"), "≤ 1440");
});

test("渲染：文本输入 + inputMode，范围作为提示而不是限制", () => {
  const out = html({ value: 60, min: 1, max: 500, integer: true });
  assert.match(out, /type="text"/);
  assert.match(out, /inputMode="numeric"/);
  assert.doesNotMatch(out, /type="number"/);
  assert.doesNotMatch(out, /min="1"/);
  assert.match(out, /wbctl-num-hint/);
  assert.match(out, /1–500，整数/);
});

test("渲染：小数输入用 decimal，带单位", () => {
  const out = html({ value: 2.5, min: 0, max: 5, step: 0.5, unit: "分钟" });
  assert.match(out, /inputMode="decimal"/);
  assert.match(out, /wbctl-num-unit/);
  assert.match(out, /分钟/);
});

test("渲染：禁用与自定义提示", () => {
  const out = html({ value: "", disabled: true, hint: "仅管理员可改" });
  assert.match(out, /disabled/);
  assert.match(out, /仅管理员可改/);
});
