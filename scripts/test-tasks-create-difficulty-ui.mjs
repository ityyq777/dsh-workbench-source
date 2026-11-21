/**
 * 创建弹窗（分阶段版）的难度字段回归：用共享测试宿主展开 StagedDialog，
 * 验证计划步的难度控件参数、未设置提示，以及填好后提交进 tasks.create 的值。
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { React, createRenderer, all, textOf, klass } from './helpers/test-react.mjs';
const require = createRequire(import.meta.url);
const dir = '../packages/addons/tasks/client/';
const copy = require(dir + 'ui/copy.cjs');
const tree = [{ id: 'table', name: 'Table', type: '1' }];
const find = (root, test, label) => {
  const node = all(root).find(test);
  assert.ok(node, 'control exists: ' + (label || ''));
  return node;
};
const byText = (root, text) => find(root, n => n.type === 'button' && textOf(n) === text, text);
let cases = 0;
for (const lang of ['zh', 'en']) for (const source of ['0', '1', '2']) for (const status of [null, '0', '2']) {
  const Create = require(dir + 'modals/create-modal.cjs')({
    React, allTables: () => tree, tagNames: () => [], splitTags: () => [],
    today: () => '2026-11-09', addDays: () => '2026-11-09', hostHasAddon: () => false,
  });
  const paint = createRenderer();
  const calls = [];
  const props = {
    tree, t: copy[lang], source, originTask: { id: 'origin', timelineId: 'line' },
    api: { call: async (action, args) => { calls.push({ action, args }); return { ok: true }; } },
    onCreated() {}, onClose() {},
  };
  const render = () => paint(Create, props);
  // 内容步：填标题；计划字段（状态/优先级/难度/日期）也在这一屏。
  find(render(), n => n.type === 'input' && klass(n) === 'wbt-input', '标题').props.onChange({ target: { value: 'Task' } });
  // 内容步里就有难度控件，未设置时显示提示
  const difficulty = () => find(render(), n => n.type === 'input' && n.props['aria-label'] === copy[lang].difficulty, '难度');
  assert.equal(difficulty().props.value, '0', '新任务难度默认 0');
  assert.ok(textOf(render()).includes(copy[lang].difficultyUnsetHint), '未设置提示可见');
  // 重启来源会锁死状态为「待开始」，其余来源可改。
  const wantStatus = source === '2' ? '0' : status || '0';
  if (source !== '2' && status) {
    find(render(), n => n.type === 'select' && n.props.value === '0', '状态').props.onChange({ target: { value: status } });
  }
  difficulty().props.onChange({ target: { value: '3' } });
  // 一路点「下一步」：遇到任务表选择器就选一次表，走到确认步再点创建。
  let picked = false;
  for (let i = 0; i < 12; i += 1) {
    const primary = find(render(), n => n.type === 'button' && /wbctl-btn-p/.test(klass(n)), '主按钮');
    if (textOf(primary) === copy[lang].create) break;
    const opt = picked ? null : all(render()).find(n => n.props && n.props.role === 'option' && String(n.props['aria-label'] || '').startsWith('Table'));
    if (opt) {
      opt.props.onClick();
      picked = true;
      continue;
    }
    primary.props.onClick();
  }
  find(render(), n => n.type === 'button' && /wbctl-btn-p/.test(klass(n)), '创建').props.onClick();
  for (let i = 0; i < 8; i += 1) await new Promise(r => setTimeout(r, 0));
  const created = calls.find(c => c.action === 'tasks.create');
  assert.ok(created, '调用了 tasks.create');
  assert.equal(created.args.difficulty, 3);
  assert.equal(created.args.status, wantStatus);
  cases += 1;
}
console.log('TASK CREATE DIFFICULTY UI PASS', { cases });
