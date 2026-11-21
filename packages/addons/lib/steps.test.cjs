// 共享步骤条与分阶段弹窗外壳测试：步骤状态、可回跳/禁用、逐步校验与提交前全量复核。
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const stepper = require("./stepper.cjs");
const staged = require("./staged-dialog.cjs");

const h = React.createElement;

function stepsHtml(props) {
  return renderToStaticMarkup(h(stepper.Steps, Object.assign({ h: h }, props)));
}

// 数出某个 data-state 出现几次，用来断言「哪几步处于什么状态」。
function countState(html, state) {
  return (html.match(new RegExp('data-state="' + state + '"', "g")) || []).length;
}

test("步骤状态：当前/已完成/已访问/未访问四态按索引判定", () => {
  assert.equal(stepper.stepState(1, 1, 2), "current");
  assert.equal(stepper.stepState(0, 1, 2), "done");
  assert.equal(stepper.stepState(2, 1, 2), "visited");
  assert.equal(stepper.stepState(3, 1, 2), "todo");
});

test("步骤条：当前步带 aria-current，已完成步显示 ✓，未访问步禁用", () => {
  const out = stepsHtml({
    steps: [{ key: "a", label: "内容" }, { key: "b", label: "归属" }, { key: "c", label: "确认" }],
    current: 1,
    maxVisited: 2,
    onJump: function () {},
    label: "创建步骤",
  });
  assert.match(out, /aria-label="创建步骤"/);
  assert.equal(countState(out, "current"), 1);
  assert.equal(countState(out, "done"), 1);
  assert.equal(countState(out, "visited"), 1);
  assert.equal(countState(out, "todo"), 0);
  assert.match(out, /aria-current="step"/);
  assert.match(out, /✓/);
  assert.match(out, /2 \/ 3|2 · 归属/);
});

test("步骤条：invalid 支持按索引或步骤 key 标红，optional 标注可选", () => {
  const byIndex = stepsHtml({
    steps: [{ key: "a", label: "内容" }, { key: "b", label: "归属" }],
    current: 1,
    maxVisited: 1,
    invalid: [true],
  });
  assert.equal((byIndex.match(/data-invalid="true"/g) || []).length, 1);
  const byKey = stepsHtml({
    steps: [{ key: "a", label: "内容" }, { key: "b", label: "标签", optional: true }],
    current: 1,
    maxVisited: 1,
    invalid: { a: true },
  });
  assert.equal((byKey.match(/data-invalid="true"/g) || []).length, 1);
  assert.match(byKey, /可选/);
});

test("步骤条：整体 disabled 时所有步骤按钮禁用", () => {
  const out = stepsHtml({
    steps: [{ key: "a", label: "一" }, { key: "b", label: "二" }],
    current: 0,
    maxVisited: 1,
    disabled: true,
  });
  assert.equal((out.match(/disabled=""/g) || []).length, 2);
});

test("逐步校验：没有 validate 视为通过，返回字符串即不通过", () => {
  assert.equal(staged.validateStep({ key: "a" }), "");
  assert.equal(staged.validateStep({ key: "a", validate: function () {} }), "");
  assert.equal(staged.validateStep({ key: "a", validate: function () { return ""; } }), "");
  assert.equal(staged.validateStep({ key: "a", validate: function () { return "名称不能为空"; } }), "名称不能为空");
});

test("提交前全量复核：返回第一处不通过的步骤，全通过返回 null", () => {
  const steps = [
    { key: "a", validate: function () { return ""; } },
    { key: "b", validate: function () { return "金额不合法"; } },
    { key: "c", validate: function () { return "条件不合法"; } },
  ];
  assert.deepEqual(staged.firstFailing(steps), { index: 1, key: "b", message: "金额不合法" });
  assert.equal(staged.firstFailing([{ key: "a" }, { key: "b", validate: function () { return ""; } }]), null);
});

test("分阶段弹窗：非末步渲染「下一步」，末步才渲染保存文案与进度", () => {
  const Dialog = staged.createStagedDialog({ maskClass: "x-mask", dialogClass: "x-modal" });
  const steps = [
    { key: "a", label: "内容", render: function (hh) { return hh("p", null, "第一步内容"); } },
    { key: "b", label: "确认", render: function (hh) { return hh("p", null, "第二步内容"); } },
  ];
  const first = renderToStaticMarkup(
    h(Dialog, { steps: steps, onClose: function () {}, onSubmit: function () {}, submitText: "创建" }),
  );
  assert.match(first, /第一步内容/);
  assert.doesNotMatch(first, /第二步内容/);
  assert.match(first, /下一步/);
  assert.match(first, /1 \/ 2/);
  assert.doesNotMatch(first, /创建\b(?!中)/);

  const last = renderToStaticMarkup(
    h(Dialog, { steps: steps, initialStep: 1, onClose: function () {}, onSubmit: function () {}, submitText: "保存" }),
  );
  assert.match(last, /第二步内容/);
  assert.match(last, /上一步/);
  assert.match(last, /保存/);
  assert.match(last, /2 \/ 2/);
});

test("分阶段弹窗：错误信息走 role=alert，提交中按钮全部禁用", () => {
  const Dialog = staged.createStagedDialog({ maskClass: "y-mask", dialogClass: "y-modal" });
  const out = renderToStaticMarkup(
    h(Dialog, {
      steps: [{ key: "a", label: "内容", render: function (hh) { return hh("p", null, "内容"); } }],
      submitting: true,
      error: "名称不能为空",
      onClose: function () {},
      onSubmit: function () {},
      submitText: "保存",
    }),
  );
  assert.match(out, /role="alert"/);
  assert.match(out, /名称不能为空/);
  assert.equal((out.match(/disabled=""/g) || []).length, 2);
});

test("分阶段弹窗：单步表单不渲染步骤条", () => {
  const Dialog = staged.createStagedDialog({ maskClass: "z-mask", dialogClass: "z-modal" });
  const out = renderToStaticMarkup(
    h(Dialog, {
      steps: [{ key: "only", label: "仅一步", render: function (hh) { return hh("p", null, "字段"); } }],
      onClose: function () {},
      onSubmit: function () {},
    }),
  );
  assert.doesNotMatch(out, /wbctl-steps/);
  assert.match(out, /字段/);
});
