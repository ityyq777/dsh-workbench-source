/** Restart priority regression: render actual extracted modal and dispatch form events. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const copy = require('../packages/addons/tasks/client/ui/copy.cjs');
let state = [], cursor = 0;
const React = {
  createElement: (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity).filter(x => x != null) }),
  useEffect() {},
  useState: value => { const i = cursor++; if (!(i in state)) state[i] = value; return [state[i], v => { state[i] = typeof v === 'function' ? v(state[i]) : v; }]; },
};
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
  const priorityInput = tree => find(tree, n => n.props.type === 'number' && n.props.max === 10);
  const submit = tree => find(tree, n => n.props.className === 'wbt-btn primary');
  change(n => n.type === 'input' && n.props.autoFocus, 'Restart');
  find(render(), n => typeof n.type === 'function' && n.props.form && n.props.set).props.set('tableId', 'table');
  return { calls, render, change, priorityInput, submit };
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
  ui.change(n => n.props.type === 'number', invalid);
  let tree = ui.render();
  assert.equal(ui.priorityInput(tree).props.value, invalid);
  assert.equal(ui.priorityInput(tree).props['aria-invalid'], true);
  assert.ok(find(tree, n => n.props.role === 'alert').children[0].includes('1–10'));
  assert.equal(ui.submit(tree).props.disabled, true);
  ui.submit(tree).props.onClick(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); assert.equal(ui.calls.length, 0, 'invalid input must never call backend');
  ui.change(n => n.props.type === 'number', '7'); tree = ui.render();
  assert.equal(ui.submit(tree).props.disabled, false);
  assert.equal(all(tree).some(n => n.props.role === 'alert'), false);
  ui.submit(tree).props.onClick(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); assert.equal(ui.calls[0].args.priority, 7); cases++;
}
for (const [value, expected] of [['99', 10], ['-4', 1], ['0.5', 1], ['6.8', 6]]) {
  const ui = mount(7); ui.change(n => n.props.type === 'number', value);
  assert.equal(ui.priorityInput(ui.render()).props.value, expected);
  ui.submit(ui.render()).props.onClick(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); assert.equal(ui.calls[0].args.priority, expected); cases++;
}
for (const status of ['1', '2']) {
  const ui = mount(7, 1, '0'); ui.change(n => n.props.type === 'number', '');
  ui.change(n => n.type === 'select' && n.props.value === '0', status);
  assert.equal(ui.submit(ui.render()).props.disabled, false);
  ui.submit(ui.render()).props.onClick(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); assert.equal(ui.calls[0].args.priority, 0); cases++;
}
for (const lang of ['zh', 'en']) for (const source of ['0', '2']) for (const value of ['', '0']) {
  const ui = mount(7, 1, source, lang);
  if (source === '2') assert.ok(all(ui.render()).some(n => n.children.includes(copy[lang].restartPriorityHint)));
  ui.change(n => n.props.type === 'number', value);
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
