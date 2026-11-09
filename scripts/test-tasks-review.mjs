/** Feedback 01a1bea8: isolated component events + real actions in a temporary WB_HOME. */
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const require = createRequire(import.meta.url);
const copy = require('../packages/addons/tasks/client/copy.cjs');
let state = [], cursor = 0;
const React = {
  createElement: (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity).filter(x => x != null) }),
  useState: value => { const i = cursor++; if (!(i in state)) state[i] = value; return [state[i], v => { state[i] = typeof v === 'function' ? v(state[i]) : v; }]; },
  useEffect() {}, useRef: () => ({ current: null }),
};
const render = (C, props) => { cursor = 0; return C(props); };
const all = node => node && typeof node === 'object' ? [node, ...node.children.flatMap(all)] : [];
const find = (node, predicate) => { const hit = all(node).find(predicate); assert.ok(hit, 'expected UI control'); return hit; };
const sandbox = { window: { __WB_HOST__: { registerAddon() {} } }, module: {}, console,
  require: name => name === 'react' ? React : ['./edit-modal.cjs', './create-modal.cjs', './task-item.cjs', './tasks-view.cjs'].includes(name) ? require('../packages/addons/tasks/client/' + name.slice(2)) : {},
};
const source = readFileSync('packages/addons/tasks/client/client.src.cjs', 'utf8');
runInNewContext(source.replace('  host.registerAddon({', '  window.test = { TaskItem, DoneModal, EditModal }; host.registerAddon({'), sandbox);
const { TaskItem, DoneModal, EditModal } = sandbox.window.test;
let cases = 0;
for (const lang of ['zh', 'en']) for (const status of ['0', '1', '2', '3']) {
  const task = { id: 'fixture', title: 'Task', description: 'Description', status, review: 'existing', priority: 4, difficulty: 2 };
  for (const next of ['changed', '', 'existing']) {
    state = []; const calls = [];
    const props = { task, t: copy[lang], lang, api: { call: async (action, patch) => { calls.push({ action, patch }); return { ok: true }; } }, onSaved() {}, onClose() {} };
    let tree = render(EditModal, props);
    const textareas = all(tree).filter(n => n.type === 'textarea');
    assert.equal(textareas.length, 2); assert.equal(textareas[0].props.value, 'Description'); assert.equal(textareas[1].props.value, 'existing');
    assert.equal(all(tree).some(n => n.props.type === 'range'), status === '2');
    assert.equal(all(tree).some(n => n.props.type === 'number'), status !== '2');
    textareas[1].props.onChange({ target: { value: next } }); tree = render(EditModal, props);
    find(tree, n => n.props.className === 'wbt-btn primary').props.onClick(); await Promise.resolve();
    const patch = calls[0].patch;
    assert.equal(Object.hasOwn(patch, 'review'), next !== 'existing');
    if (next !== 'existing') assert.equal(patch.review, next);
    assert.equal(Object.hasOwn(patch, 'difficulty'), status === '2');
    assert.equal(Object.hasOwn(patch, 'priority'), status !== '2'); cases++;
  }
  for (const card of [false, true]) {
    state = []; const calls = [];
    const props = { task, card, lang, t: copy[lang], update: (_task, patch) => calls.push(patch) };
    let tree = render(TaskItem, props);
    find(tree, n => n.props.className === 'wbt-review').props.onDoubleClick();
    tree = render(TaskItem, props);
    find(tree, n => n.type === 'textarea').props.onChange({ target: { value: '' } });
    tree = render(TaskItem, props); find(tree, n => n.type === 'textarea').props.onBlur();
    assert.equal(calls[0].type, 'REVIEW'); assert.equal(calls[0].review, ''); cases++;
  }
}
state = []; let completed;
const doneProps = { task: { id: 'fixture', title: 'Task', review: 'keep on completion' }, t: copy.en,
  api: { call: async (_action, args) => { completed = args; return { ok: true }; } }, onDone() {} };
find(render(DoneModal, doneProps), n => n.props.className === 'wbt-btn primary').props.onClick();
await Promise.resolve(); assert.equal(completed.review, 'keep on completion');
// Only this temporary directory is used; no profile installation or real database access.
const home = mkdtempSync(join(tmpdir(), 'wb-review-'));
process.env.WB_HOME = home;
const cleanups = []; let host;
try {
  const shell = await import('../packages/shell/lib/index.js');
  shell.apply({ provide: (_name, value) => { host = value; }, effect: fn => { const cleanup = fn(); if (typeof cleanup === 'function') cleanups.push(cleanup); }, tools: { register() {} }, webServer: { register() {} }, systemPrompt: { section() {}, getSectionOrder: () => 500 }, commands: { register() {} }, agents: { get() {} }, connection: { requestRejection() {} } });
  (await import('../packages/addons/tasks/lib/index.js')).apply({ workbench: host, effect: fn => { const cleanup = fn(); if (typeof cleanup === 'function') cleanups.push(cleanup); } });
  const call = (action, args) => host.invoke(action, args, 'agent');
  const get = async id => (await call('tasks.get', { id })).result.task;
  for (const status of ['0', '1', '2', '3']) {
    const id = (await call('tasks.create', { title: 'Review ' + status, status: status === '3' ? '0' : status })).result.id;
    if (status === '3') await call('tasks.create', { title: 'Review successor', source: 2, restartKey: id });
    for (const type of ['REVIEW', '4']) for (const review of ['some feeling', '']) {
      await call('tasks.update', { id, type, review });
      const task = await get(id); assert.equal(task.review, review); assert.equal(task.status, status); cases++;
    }
  }
  const id = (await call('tasks.create', { title: 'Retain', review: 'preserved' })).result.id;
  await call('tasks.update', { id, type: 'STATUS', status: '2', difficulty: 2 });
  assert.equal((await get(id)).review, 'preserved');
  await call('tasks.create', { title: 'Restarted successor', source: 2, restartKey: id });
  assert.equal((await get(id)).status, '2'); assert.equal((await get(id)).review, 'preserved');
  await call('tasks.update', { id, type: 'STATUS', status: '0' });
  assert.equal((await get(id)).review, 'preserved');
  await call('tasks.update', { id, type: 'REVIEW', review: '' }); assert.equal((await get(id)).review, '');
  console.log('TASKS REVIEW PASS', { cases, completionAndRestart: true, realDatabaseTouched: false });
} finally {
  for (const cleanup of cleanups.reverse()) cleanup();
  assert.ok(resolve(home).startsWith(resolve(tmpdir()) + '/wb-review-'));
  rmSync(home, { recursive: true, force: true });
}
