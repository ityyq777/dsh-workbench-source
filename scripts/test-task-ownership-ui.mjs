/** Actual component event regression; no production DB, installation or generated bundle. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const copy = require('../packages/addons/tasks/client/copy.cjs');
const ownership = require('../packages/addons/tasks/client/ownership.cjs');
let state, cursor, effects, deps;
const React = {
  createElement: (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity).filter(x => x != null) }),
  useState: value => { const i = cursor++; if (!(i in state)) state[i] = value; return [state[i], v => { state[i] = typeof v === 'function' ? v(state[i]) : v; }]; },
  useEffect: (fn, next) => { const i = cursor++; if (!deps[i] || next.some((x, j) => x !== deps[i][j])) { effects.push(fn); deps[i] = next; } },
};
const Create = require('../packages/addons/tasks/client/create-modal.cjs')({ React, tagNames: () => [], splitTags: () => [], today: () => '2026-11-09', addDays: () => '2026-11-09', hostHasAddon: () => false });
const Edit = require('../packages/addons/tasks/client/edit-modal.cjs')(React, () => ({ cls: 'active' }), () => '');
const tree = [{ id: 'root', type: '2', name: '任务根', children: [{ id: 'group', type: '0', name: '插件', children: [
  { id: 'table', type: '1', name: 'storage', description: '存储插件开发职责' },
  { id: 'other', type: '1', name: 'tasks', description: '任务插件开发职责' },
] }] }];
const all = n => n && typeof n === 'object' ? [n, ...n.children.flatMap(all)] : [];
const find = (node, test) => { const result = all(node).find(test); assert.ok(result, 'control exists'); return result; };
function mount(source = '0', component = Create, response = { ok: true, result: { tablePath: '插件/storage' } }) {
  state = []; deps = []; let closed = 0, saved = 0; const calls = [];
  const props = { t: copy.zh, source, tree, defaultTableId: 'table', originTask: { id: 'original', tableId: 'table', priority: 4 },
    task: { id: 'original', title: 'Old', status: '0', tableId: 'table', priority: 4 },
    api: { call: async (action, args) => { if (action === "tasks.capabilities") return { ok: true }; calls.push({ action, args }); return response; } },
    onCreated: () => saved++, onSaved: () => saved++, onClose: () => closed++ };
  const render = () => { cursor = 0; effects = []; const out = component(props); effects.forEach(fn => fn()); return out; };
  const byLabel = label => find(render(), n => n.props['aria-label'] === label);
  const change = (label, value, checked) => byLabel(label).props.onChange({ target: { value, checked } });
  const submit = () => find(render(), n => n.props.className === 'wbt-btn primary');
  const title = value => find(render(), n => n.props.autoFocus).props.onChange({ target: { value } });
  return { props, calls, render, byLabel, change, submit, title, closed: () => closed, saved: () => saved };
}
let cases = 0;
for (const source of ['0', '1', '2']) {
  const ui = mount(source); ui.title('Keep my title');
  assert.equal(ui.byLabel('目标任务表').props.value, ''); assert.equal(ui.submit().props.disabled, true);
  ui.submit().props.onClick(); assert.equal(ui.calls.length, 0);
  assert.ok(JSON.stringify(ui.render()).includes('任务根 / 插件 / storage — 存储插件开发职责'));
  ui.change('目标任务表', 'table'); assert.equal(ui.submit().props.disabled, false);
  ui.submit().props.onClick(); await new Promise(resolve => setImmediate(resolve));
  assert.equal(ui.calls[0].args.tableId, 'table'); assert.equal(ui.calls[0].args.tablePath, undefined);
  assert.equal(ui.calls[0].args.source, source); cases++;
}
{
  const ui = mount(); ui.title('Keep text'); ui.change('目标任务表', 'table'); ui.props.tree = [];
  ui.render(); assert.equal(ui.byLabel('目标任务表').props.value, ''); assert.equal(ui.submit().props.disabled, true);
  assert.ok(JSON.stringify(ui.render()).includes('Keep text')); cases++;
}
for (const cancel of [true, false]) {
  const ui = mount(); ui.title('Create path'); ui.change('没有合适的表？新建节点', undefined, true);
  ui.change('新路径', '插件/新组/新表');
  assert.equal(ui.submit().props.disabled, true);
  ui.change('节点职责 2', '新组的职责'); ui.change('节点职责 3', '新表的职责');
  ui.change('确认新建路径', undefined, true); assert.equal(ui.submit().props.disabled, false);
  assert.equal(ui.calls.length, 0, 'preview and confirmation never write nodes');
  if (cancel) { find(ui.render(), n => n.props.className === 'wbt-btn ghost').props.onClick(); assert.equal(ui.closed(), 1); assert.equal(ui.calls.length, 0); }
  else { ui.submit().props.onClick(); await new Promise(resolve => setImmediate(resolve)); assert.deepEqual(ui.calls[0], { action: 'tasks.create', args: {
    title: 'Create path', description: '', tags: [], status: '0', priority: 1, difficulty: 0, publishDate: '2026-11-09', targetDate: '2026-11-09', source: '0',
    tablePath: ['插件', '新组', '新表'], createMissing: true, pathDescriptions: ['', '新组的职责', '新表的职责'],
  } }); }
  cases++;
}
{
  const ui = mount('0', Create, { ok: false, error: 'TABLE_NOT_FOUND: removed' }); ui.title('Failure keeps title');
  find(ui.render(), n => n.type === 'textarea').props.onChange({ target: { value: 'Failure keeps body' } });
  ui.change('目标任务表', 'table'); ui.submit().props.onClick(); await new Promise(resolve => setImmediate(resolve));
  assert.equal(ui.saved(), 0); assert.equal(ui.byLabel('目标任务表').props.value, '');
  assert.ok(JSON.stringify(ui.render()).includes('Failure keeps body')); cases++;
}
for (const target of ['', 'other']) {
  const ui = mount('0', Edit); if (target) ui.change('目标任务表', target);
  ui.submit().props.onClick(); await new Promise(resolve => setImmediate(resolve)); assert.equal(ui.calls[0].action, 'tasks.update');
  assert.equal(ui.calls[0].args.tableId, target || undefined); assert.equal(ui.calls[0].args.type, undefined); cases++;
}
assert.match(ownership.preview(tree, '插件/storage/child', ['', '', 'desc']).error, /类型冲突/);
assert.match(ownership.preview(tree, '/bad', []).error, /有效路径/);
assert.match(ownership.preview(tree, '插件', []).error, /类型冲突/);
assert.match(ownership.receipt({ deduped: true, tablePath: ['插件', 'storage'] }), /已存在.*插件.*storage/);
for (const badTree of [[], [tree[0], { ...tree[0], id: 'second' }], [{ ...tree[0], deletedAt: 1 }]]) {
  assert.match(ownership.preview(badTree, 'new', ['description']).error, /唯一有效根/); cases++;
}
assert.equal(ownership.preview([tree[0], { ...tree[0], deleted_at: 1 }], 'new', ['description']).error, '');
const ambiguous = structuredClone(tree); ambiguous[0].children.push({ ...ambiguous[0].children[0] });
assert.match(ownership.preview(ambiguous, '插件/new', ['', 'description']).error, /歧义/);
assert.ok(!ownership.receipt({ path: '/root-id/table-id' }).includes('已放入'));
for (const message of ['Unknown action: tasks.capabilities', 'network timeout']) {
  for (const rejects of [false, true]) {
    const ui = mount(); ui.title('Preserve on capability failure'); ui.change('目标任务表', 'table');
    ui.props.api.call = async () => { if (rejects) throw new Error(message); return { ok: false, error: message }; };
    ui.submit().props.onClick(); await new Promise(resolve => setImmediate(resolve));
    const rendered = JSON.stringify(ui.render());
    assert.ok(rendered.includes(message)); assert.ok(rendered.includes('Preserve on capability failure'));
    assert.equal(rendered.includes('完整升级'), message.startsWith('Unknown')); assert.equal(ui.saved(), 0);
    assert.equal(ui.submit().props.disabled, false); cases++;
  }
}
for (const component of [Create, Edit]) {
  const ui = mount('0', component); ui.title('No duplicate'); ui.change('目标任务表', 'table');
  let release, writes = 0;
  ui.props.api.call = (action) => { if (action === 'tasks.capabilities') return Promise.resolve({ ok: true }); writes++; return new Promise(resolve => { release = resolve; }); };
  const button = ui.submit(); button.props.onClick(); button.props.onClick();
  await new Promise(resolve => setImmediate(resolve)); assert.equal(writes, 1);
  assert.equal(ui.submit().props.disabled, true); release({ ok: false, error: 'TABLE_NOT_FOUND: stale' });
  await new Promise(resolve => setImmediate(resolve)); assert.equal(ui.byLabel('目标任务表').props.value, '');
  assert.ok(JSON.stringify(ui.render()).includes('No duplicate')); cases++;
}
for (const component of [Create, Edit]) {
  for (const success of [true, false]) {
    const ui = mount('0', component); ui.title('Keep modal until settled');
    if (component === Create) {
      ui.change('没有合适的表？新建节点', undefined, true); ui.change('新路径', 'new');
      ui.change('节点职责 1', 'new table responsibility'); ui.change('确认新建路径', undefined, true);
    } else ui.change('目标任务表', 'other');
    let releaseCapability, releaseWrite; const requests = [];
    ui.props.api.call = (action, args) => {
      requests.push({ action, args });
      return new Promise(resolve => { if (action === 'tasks.capabilities') releaseCapability = resolve; else releaseWrite = resolve; });
    };
    const before = ui.render();
    const attemptClose = node => {
      const mask = find(node, n => n.props.className === 'wbt-modal-mask');
      const target = {}; mask.props.onMouseDown({ target, currentTarget: target });
      find(node, n => n.props.className === 'wbt-icon').props.onClick();
      find(node, n => n.props.className === 'wbt-btn ghost').props.onClick();
      let prevented = false, stopped = false;
      mask.props.onKeyDownCapture({ key: 'Escape', preventDefault: () => { prevented = true; }, stopPropagation: () => { stopped = true; } });
      assert.equal(prevented && stopped, true); assert.equal(ui.closed(), 0);
    };
    find(before, n => n.props.className === 'wbt-btn primary').props.onClick();
    attemptClose(before); // Same-render closures must consult the synchronous pending lock.
    attemptClose(ui.render());
    assert.equal(find(ui.render(), n => n.props.className === 'wbt-btn ghost').props.disabled, true);
    if (component === Create) {
      assert.deepEqual(requests.map(x => x.action), ['tasks.capabilities']);
      releaseCapability({ ok: true }); await new Promise(resolve => setImmediate(resolve));
      assert.deepEqual(requests.map(x => x.action), ['tasks.capabilities', 'tasks.create']);
      assert.deepEqual(requests[1].args.tablePath, ['new']); attemptClose(ui.render());
    }
    releaseWrite(success ? { ok: true, result: { tablePath: 'new' } } : { ok: false, error: 'write failed' });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(ui.saved(), success ? 1 : 0); assert.equal(ui.closed(), 0);
    if (!success) {
      assert.ok(JSON.stringify(ui.render()).includes('Keep modal until settled'));
      const cancel = find(ui.render(), n => n.props.className === 'wbt-btn ghost');
      assert.equal(cancel.props.disabled, false); cancel.props.onClick(); assert.equal(ui.closed(), 1);
    }
    cases++;
  }
}
console.log('TASK OWNERSHIP UI PASS', { cases, noProductionDatabase: true });
