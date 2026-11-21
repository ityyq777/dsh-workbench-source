/** Restart priority regression: render actual extracted modal and dispatch form events. */
import assert from 'node:assert/strict';
import Module, { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const copy = require('../packages/addons/tasks/client/ui/copy.cjs');
let state = [], cursor = 0;
const React = {
  createElement: (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity).filter(x => x != null) }),
  useEffect() {},
  useState: value => { const i = cursor++; if (!(i in state)) state[i] = value; return [state[i], v => { state[i] = typeof v === 'function' ? v(state[i]) : v; }]; },
  useRef: value => { const i = cursor++; if (!(i in state)) state[i] = { current: value }; return state[i]; },
};
// 共享数字控件在模块顶层 require('react')，测试里用假 React 顶替，避免真 hooks 报错。
const load = Module._load;
Module._load = function (request, parent) {
  if (request === 'react' && parent && /number-field\.cjs$/.test(parent.filename || '')) return React;
  return load.apply(this, arguments);
};
const NF = require('../packages/addons/lib/number-field.cjs');
const CreateModal = require('../packages/addons/tasks/client/modals/create-modal.cjs')({ React,
  allTables: () => [{ id: 'table', name: 'Table', depth: 0 }], tagNames: () => [], splitTags: () => [],
  today: () => '2026-11-09', addDays: () => '2026-11-09', hostHasAddon: () => false,
});
const all = n => n && typeof n === 'object' ? [n, ...n.children.flatMap(all)] : [];
const find = (tree, test) => { const node = all(tree).find(test); assert.ok(node); return node; };
let cases = 0;
function mount(priority, fallback = 1, source = '2', lang = 'zh', timelineId = 'line') {
  state = []; const calls = [];
  const props = { tree: [{ id: 'table', name: 'Table', type: '1' }], t: copy[lang], source, originTask: { id: 'origin', tableId: 'table', priority, timelineId }, defaults: { priority: fallback },
    api: { call: async (action, args) => { if (action === "tasks.capabilities") return { ok: true }; calls.push({ action, args }); return { ok: true }; } }, onCreated() {}, onClose() {} };
  const render = () => { cursor = 0; return CreateModal(props); };
  const change = (test, value) => find(render(), test).props.onChange({ target: { value } });
  const priorityInput = tree => find(tree, n => n.type === NF.NumberField && n.props.max === 10);
  // 直接调用复用的数字控件：键入只写草稿（不夹取、不提交），与真实交互一致。
  const inputOf = node => all(node.type(node.props)).find(n => n.type === 'input' && n.props.onChange);
  const type = value => { inputOf(priorityInput(render())).props.onChange({ target: { value } }); };
  const submit = tree => find(tree, n => n.props.className === 'wbt-btn primary');
  change(n => n.type === 'input' && n.props.autoFocus, 'Restart');
  find(render(), n => typeof n.type === 'function' && n.props.form && n.props.set).props.set('tableId', 'table');
  return { calls, render, change, priorityInput, submit, type };
}
for (const [original, fallback, expected] of [[7, 1, 7], [0, 1, 1], [0, 6, 6], [0, 0, 1], [0, 99, 10], [0, 'bad', 1]]) {
  const ui = mount(original, fallback);
  assert.equal(ui.priorityInput(ui.render()).props.value, expected);
  assert.ok(all(ui.render()).some(n => n.children.includes('重启任务需要优先级 1–10，0 仅用于已完成/已关闭')));
  ui.submit(ui.render()).props.onClick(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  assert.equal(ui.calls[0].args.priority, expected); assert.equal(ui.calls[0].args.status, '0'); cases++;
}
for (const invalid of ['', '0', '   ', 'bad']) {
  const ui = mount(7);
  ui.type(invalid);
  let tree = ui.render();
  // 键入什么就显示什么，绝不被悄悄改写。
  assert.equal(ui.priorityInput(tree).props.value, invalid);
  assert.ok(find(tree, n => n.props.role === 'alert').children[0].includes('1–10'));
  assert.equal(ui.submit(tree).props.disabled, true);
  ui.submit(tree).props.onClick(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); assert.equal(ui.calls.length, 0, 'invalid input must never call backend');
  ui.type('7'); tree = ui.render();
  assert.equal(ui.priorityInput(tree).props.value, '7');
  assert.equal(ui.submit(tree).props.disabled, false);
  assert.equal(all(tree).some(n => n.props.role === 'alert'), false);
  ui.submit(tree).props.onClick(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); assert.equal(ui.calls[0].args.priority, 7); cases++;
}
// 越界与小数不再夹取：原样保留，只提示并要求改对，保存按钮保持禁用。
for (const value of ['99', '-4', '0.5', '6.8']) {
  const ui = mount(7); ui.type(value);
  const tree = ui.render();
  assert.equal(ui.priorityInput(tree).props.value, value);
  assert.equal(ui.submit(tree).props.disabled, true);
  ui.submit(tree).props.onClick(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  assert.equal(ui.calls.length, 0, 'out-of-range input must never call backend');
  ui.type('5'); ui.submit(ui.render()).props.onClick(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  assert.equal(ui.calls[0].args.priority, 5); cases++;
}
for (const status of ['1', '2']) {
  const ui = mount(7, 1, '0'); ui.type('');
  ui.change(n => n.type === 'select' && n.props.value === '0', status);
  assert.equal(ui.submit(ui.render()).props.disabled, false);
  ui.submit(ui.render()).props.onClick(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); assert.equal(ui.calls[0].args.priority, 0); cases++;
}
for (const lang of ['zh', 'en']) for (const source of ['0', '2']) for (const value of ['', '0']) {
  const ui = mount(7, 1, source, lang);
  if (source === '2') assert.ok(all(ui.render()).some(n => n.children.includes(copy[lang].restartPriorityHint)));
  ui.type(value);
  const tree = ui.render();
  assert.equal(find(tree, n => n.props.role === 'alert').children[0], copy[lang][source === '2' ? 'restartPriorityError' : 'activePriorityError']);
  assert.equal(ui.submit(tree).props.disabled, true);
  ui.submit(tree).props.onClick(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); assert.equal(ui.calls.length, 0); cases++;
}
const unlinked = mount(7, 1, '2', 'zh', null);
assert.equal(unlinked.submit(unlinked.render()).props.disabled, true);
unlinked.submit(unlinked.render()).props.onClick();
await Promise.resolve(); await Promise.resolve();
assert.equal(unlinked.calls.length, 0, 'unlinked restart must not mutate any backend state');
assert.ok(all(unlinked.render()).some(n => n.children.includes('请先手动建立并关联时间线，再重启')));
const linked = mount(7); linked.submit(linked.render()).props.onClick();
await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
assert.equal(linked.calls[0].args.restartKey, 'origin');
assert.equal(linked.calls[0].args.timelineId, undefined, 'server inherits relation');
assert.equal(linked.calls[0].args.timelineKey, undefined, 'no self-id fallback');
console.log('TASK RESTART CLIENT PASS', { cases, invalidSubmissionBlocked: true, locales: ['zh', 'en'] });
