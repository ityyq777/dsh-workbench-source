/** 重启优先级回归：渲染真实抽出的创建弹窗，按分阶段流程派发表单事件。 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { React, createRenderer, all, textOf, klass } from './helpers/test-react.mjs';
const require = createRequire(import.meta.url);
const copy = require('../packages/addons/tasks/client/ui/copy.cjs');
const CreateModal = require('../packages/addons/tasks/client/modals/create-modal.cjs')({ React,
  allTables: () => [{ id: 'table', name: 'Table', depth: 0 }], tagNames: () => [], splitTags: () => [],
  today: () => '2026-11-09', addDays: () => '2026-11-09', hostHasAddon: () => false,
});
const find = (tree, test, label) => {
  const node = all(tree).find(test);
  assert.ok(node, 'control exists: ' + (label || ''));
  return node;
};
const findByText = (tree, text) => find(tree, n => n.type === 'button' && textOf(n) === text, text);

let cases = 0;
function mount(priority, fallback = 1, source = '2', lang = 'zh', timelineId = 'line') {
  const paint = createRenderer();
  const calls = [];
  const props = { tree: [{ id: 'table', name: 'Table', type: '1' }], t: copy[lang], source, originTask: { id: 'origin', tableId: 'table', priority, timelineId }, defaults: { priority: fallback },
    api: { call: async (action, args) => { if (action === 'tasks.capabilities') return { ok: true }; if (action === 'tasks.create') calls.push({ action, args }); return { ok: true }; } }, onCreated() {}, onClose() {} };
  const render = () => paint(CreateModal, props);
  const title = value => find(render(), n => n.type === 'input' && klass(n) === 'wbt-input', '标题').props.onChange({ target: { value } });
  const next = () => findByText(render(), copy[lang].nextStep || '下一步').props.onClick();
  // 共享数字控件展开后就是原生 input：键入只写草稿（不夹取、不提交），与真实交互一致。
  const priorityInput = tree => find(tree, n => n.type === 'input' && n.props['aria-label'] === copy[lang].priority, '优先级');
  const type = value => priorityInput(render()).props.onChange({ target: { value } });
  const submit = tree => find(tree, n => n.type === 'button' && /wbctl-btn-p|wbt-btn primary/.test(klass(n)), '保存');
  // 计划字段（状态/优先级/难度/日期）现在和标题同在第一屏，填好标题就能直接断言优先级。
  function toPlan() {
    title('Restart');
  }
  const errorText = () => { const node = all(render()).find(n => klass(n) === 'wbctl-dialog-err'); return node ? textOf(node) : ''; };
  return { props, calls, render, title, next, priorityInput, submit, type, toPlan, errorText,
    // 一路点到「创建」：中途遇到任务表选择器就选表，之后自动跳过。
    toConfirm() {
      let picked = false;
      for (let i = 0; i < 12; i += 1) {
        if (textOf(submit(render())) === copy[lang].create) return;
        const opt = picked ? null : all(render()).find(n => n.props && n.props.role === 'option' && String(n.props['aria-label'] || '').startsWith('Table'));
        if (opt) {
          opt.props.onClick();
          picked = true;
          continue;
        }
        next();
      }
    }, change(test, value) { find(render(), test).props.onChange({ target: { value } }); } };
}
for (const [original, fallback, expected] of [[7, 1, 7], [0, 1, 1], [0, 6, 6], [0, 0, 1], [0, 99, 10], [0, 'bad', 1]]) {
  const ui = mount(original, fallback);
  ui.toPlan();
  assert.equal(String(ui.priorityInput(ui.render()).props.value), String(expected));
  assert.ok(all(ui.render()).some(n => textOf(n).includes('重启任务需要优先级 1–10，0 仅用于已完成/已关闭')));
  ui.toConfirm();
  ui.submit(ui.render()).props.onClick(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  assert.equal(ui.calls[0].args.priority, expected); assert.equal(ui.calls[0].args.status, '0'); cases++;
}
for (const invalid of ['', '0', '   ', 'bad']) {
  const ui = mount(7);
  ui.toPlan();
  ui.type(invalid);
  let tree = ui.render();
  // 键入什么就显示什么，绝不被悄悄改写。
  assert.equal(String(ui.priorityInput(tree).props.value), String(invalid));
  assert.ok(find(tree, n => n.props.role === 'alert').children.join('').includes('1–10'));
  ui.toConfirm(); // 非法优先级过不了计划步
  assert.ok(ui.errorText().includes('1–10'));
  tree = ui.render();
  ui.submit(tree).props.onClick(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); assert.equal(ui.calls.length, 0, 'invalid input must never call backend');
  ui.type('7'); tree = ui.render();
  assert.equal(String(ui.priorityInput(tree).props.value), '7');
  ui.toConfirm(); // 改对后能继续走
  tree = ui.render();
  assert.equal(ui.errorText(), '');
  assert.equal(ui.submit(tree).props.disabled, false);
  ui.submit(tree).props.onClick(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); assert.equal(ui.calls[0].args.priority, 7); cases++;
}
// 越界与小数不再夹取：原样保留，只提示并要求改对，保存按钮保持禁用。
for (const value of ['99', '-4', '0.5', '6.8']) {
  const ui = mount(7); ui.toPlan(); ui.type(value);
  const tree = ui.render();
  assert.equal(String(ui.priorityInput(tree).props.value), String(value));
  ui.toConfirm(); // 越界/小数同样过不了计划步
  assert.ok(ui.errorText().includes('1–10'));
  ui.submit(ui.render()).props.onClick(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  assert.equal(ui.calls.length, 0, 'out-of-range input must never call backend');
  ui.type('5'); ui.toConfirm(); // 计划步放行
  ui.submit(ui.render()).props.onClick(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  assert.equal(ui.calls[0].args.priority, 5); cases++;
}
for (const status of ['1', '2']) {
  const ui = mount(7, 1, '0'); ui.toPlan(); ui.type('');
  ui.change(n => n.type === 'select' && n.props.value === '0', status);
  ui.toConfirm();
  assert.equal(ui.submit(ui.render()).props.disabled, false);
  ui.submit(ui.render()).props.onClick(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); assert.equal(ui.calls[0].args.priority, 0); cases++;
}
console.log('TASKS RESTART CLIENT PASS { cases: ' + cases + ' }');
