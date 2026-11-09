/** Search feedback regression: temporary DB only; no browser/build/profile mutation. */
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { TASK_FILTER_SCHEMA } from '../packages/addons/tasks/lib/task-search-schema.js';
const require = createRequire(import.meta.url);
let state = [], cursor = 0;
const React = {
  createElement(type, props, ...children) { return { type, props: props || {}, children: children.flat(Infinity).filter(x => x != null) }; },
  useState(value) { const i = cursor++; if (!(i in state)) state[i] = value; return [state[i], v => { state[i] = v; }]; },
  useRef: () => ({ current: null }), useEffect() {},
};
const Highlight = require('../packages/addons/tasks/client/highlight.cjs')(React);
const all = n => Array.isArray(n) ? n.flatMap(all) : n && typeof n === 'object' ? [n, ...n.children.flatMap(all)] : [];
const text = n => Array.isArray(n) ? n.map(text).join('') : n && typeof n === 'object' ? text(n.children) : String(n ?? '');
const find = (n, cls) => { const found = all(n).find(x => x.props.className === cls); assert.ok(found, cls); return found; };
const expand = n => Array.isArray(n) ? n.map(expand) : n && typeof n === "object" ? typeof n.type === "function" ? expand(n.type(n.props)) : { ...n, children: n.children.map(expand) } : n;
let cases = 0;
for (const keyword of ['%', '_', '\\', '.*+?^$' + '{}()|[]', '中文', 'AbC', '<img src=x onerror=alert(1)>']) {
  const source = 'before ' + keyword + ' and ' + keyword.toUpperCase() + ' after';
  const output = Highlight({ text: source, keyword });
  assert.equal(text(output), source);
  assert.equal(all(output).filter(n => n.type === 'mark').length, 2);
  assert.ok(all(output).every(n => n.type === 'mark' && !n.props.dangerouslySetInnerHTML && !n.props.onDoubleClick)); cases++;
}
assert.equal(Highlight({ text: 'plain', keyword: '' }), 'plain');
assert.equal(Highlight({ text: 'plain', keyword: 'absent' }), 'plain');
assert.equal(Highlight({ text: null, keyword: 'x' }), '');
for (const [upper, lower] of [['É', 'é'], ['Σ', 'σ']]) {
  assert.equal(Highlight({ text: upper, keyword: lower }), upper);
  assert.equal(Highlight({ text: lower, keyword: upper }), lower);
  const mixed = Highlight({ text: upper + ' AbC ' + lower, keyword: 'abc' });
  assert.equal(text(mixed), upper + ' AbC ' + lower);
  assert.equal(all(mixed).filter(n => n.type === 'mark').length, 1); cases++;
}
const TaskItem = require('../packages/addons/tasks/client/task-item.cjs')({ React,
  statusInfo: () => ({ zh: '开启', en: 'Active', cls: 'active' }), stars: () => '', pClass: () => 'low',
  today: () => '2026-11-09', daysBetween: () => 1, cx: (...x) => x.filter(Boolean).join(' '),
  Icon() {}, Countdown() {}, PathCrumbs() {},
});
const copy = require('../packages/addons/tasks/client/copy.cjs');
for (const card of [false, true]) for (const [field, cls, patchType] of [
  ['title', 'wbt-title', 'TITLE'], ['description', 'wbt-desc wb-desc', 'DESCRIPTION'], ['review', 'wbt-review', 'REVIEW'],
]) {
  state = []; const calls = [];
  const task = { id: 'fixture', title: 'plain', description: 'plain', review: 'plain', status: '0', priority: 1, [field]: 'start AbC end' };
  const props = { task, card, keyword: 'abc', t: copy.zh, update: (_task, patch) => calls.push(patch) };
  const render = () => { cursor = 0; return TaskItem(props); };
  const node = find(render(), cls);
  const child = node.children.find(n => n && typeof n === 'object' && typeof n.type === 'function');
  const hit = expand(child);
  assert.equal(all(hit).filter(n => n.type === 'mark').length, 1);
  // All three text areas and their search highlights are read-only.
  assert.ok(all(hit).every(n => !n.props.onClick && !n.props.onDoubleClick));
  assert.equal(node.props.onDoubleClick, undefined); assert.equal(node.props.title, undefined);
  assert.ok(!all(render()).some(n => n.type === 'textarea' || n.type === 'input'));
  assert.deepEqual(calls, []); cases++;
}
const css = readFileSync('packages/addons/tasks/client/styles.cjs', 'utf8');
const color = name => css.match(new RegExp(name + ':#([0-9a-f]{6})'))[1];
const lum = hex => hex.match(/../g).map(x => parseInt(x, 16) / 255).map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4).reduce((s, x, i) => s + x * [.2126, .7152, .0722][i], 0);
const contrast = (lum(color('--wbt-hit-bg')) + .05) / (lum(color('--wbt-hit-fg')) + .05);
assert.ok(contrast >= 4.5);
assert.ok(css.includes('.wbt-root .wbt-item.closed:has(mark.wbt-hit){opacity:1}'));
const entry = readFileSync('packages/addons/tasks/client/tasks-view.cjs', 'utf8');
assert.ok(entry.includes('keyword: titleKey.trim()'), 'highlight follows submitted search, not draft');
const home = mkdtempSync(join(tmpdir(), 'wb-search-')); process.env.WB_HOME = home;
const cleanups = []; let host;
try {
  (await import('../packages/shell/lib/index.js')).apply({ provide: (_name, value) => { host = value; }, effect: fn => { const c = fn(); if (typeof c === 'function') cleanups.push(c); }, tools: { register() {} }, webServer: { register() {} }, systemPrompt: { section() {}, getSectionOrder: () => 500 }, commands: { register() {} }, agents: { get() {} }, connection: { requestRejection() {} } });
  (await import('../packages/addons/tasks/lib/index.js')).apply({ workbench: host, effect: fn => { const c = fn(); if (typeof c === 'function') cleanups.push(c); } });
  const call = async (action, args) => { const r = await host.invoke(action, args, 'agent'); assert.ok(!r.isError && r.result !== undefined, JSON.stringify(r)); return r.result; };
  const fixtureTableId = (await call('taskNodes.create', { parentId: '1', type: '1', name: '检索回归任务表' })).node.id;
  const ids = [];
  for (const field of ['title', 'description', 'review']) ids.push((await call('tasks.create', { tableId: fixtureTableId, title: 'plain', [field]: 'UniqueNeedle', priority: 6 })).id);
  await call('tasks.create', { tableId: fixtureTableId, title: 'decoy' });
  for (const pageNumber of [1, 2, 3]) {
    const page = await call('tasks.list', { titleKey: 'uniqueneedle', pageSize: 1, pageNumber });
    assert.equal(page.total, 3); assert.equal(page.returned, 1); assert.ok(ids.includes(page.records[0].id));
  }
  const exported = await call('tasks.export', { titleKey: 'uniqueneedle' });
  assert.deepEqual(JSON.parse(exported.content).tasks.map(t => t.id).sort(), ids.sort());
  const exactIds = await call('tasks.export', { ids: [ids[0]], titleKey: 'absent' }); assert.equal(exactIds.count, 1);
  const data = await call('tasks.dataQuery', { table: 'task', search: 'uniqueneedle' }); assert.equal(data.total, 3);
  const byId = await call('tasks.dataQuery', { table: 'task', search: ids[0] }); assert.equal(byId.total, 1, 'all TEXT column search remains supported');
  for (const keyword of ['%', '_', '\\', '.*+?^$' + '{}()|[]', '中文', '<script>alert(1)</script>']) {
    const id = (await call('tasks.create', { tableId: fixtureTableId, title: 'literal fixture', review: keyword })).id;
    const result = await call('tasks.list', { titleKey: keyword }); assert.equal(result.total, 1); assert.equal(result.records[0].id, id);
    assert.equal((await call('tasks.export', { titleKey: keyword })).count, 1);
    assert.equal((await call('tasks.dataQuery', { table: 'task', search: keyword })).total, 1); cases++;
  }
  assert.equal((await call('tasks.list', { titleKey: '   ' })).total, 10);
  assert.equal((await call('tasks.list', { titleKey: 'absent' })).total, 0);
  for (let i = 0; i < 13; i++) await call('tasks.create', { tableId: fixtureTableId, title: 'cap fixture', review: 'CapNeedle', priority: 6 });
  const capped = await call('tasks.list', { titleKey: 'capneedle' });
  assert.equal(capped.total, 13); assert.equal(capped.returned, 12); assert.equal(capped.truncated, true);
  assert.equal((await call('tasks.export', { titleKey: 'capneedle' })).count, 12);
  assert.equal((await call('tasks.export', { titleKey: 'capneedle', tab: 0 })).count, 13);
  assert.equal((await call('tasks.export', { titleKey: 'capneedle', priorityMin: 7 })).count, 0);
  for (const [upper, lower] of [['É', 'é'], ['Σ', 'σ']]) {
    const id = (await call('tasks.create', { tableId: fixtureTableId, title: upper, description: lower, review: upper })).id;
    await call('tasks.create', { tableId: fixtureTableId, title: upper, description: upper, review: upper });
    const result = await call('tasks.list', { titleKey: lower });
    assert.equal(result.total, 1); assert.equal(result.records[0].id, id);
    for (const card of [false, true]) {
      state = []; cursor = 0;
      const tree = TaskItem({ task: result.records[0], card, keyword: lower, t: copy.zh, update() {} });
      for (const [cls, expectedHits, original] of [['wbt-title', 0, upper], ['wbt-desc wb-desc', 1, lower], ['wbt-review', 0, upper]]) {
        const child = find(tree, cls).children.find(n => n && typeof n.type === 'function');
        const output = expand(child);
        assert.equal(text(output), original);
        assert.equal(all(output).filter(n => n.type === 'mark').length, expectedHits);
      }
    }
    cases++;
  }
  for (const action of ['tasks.list', 'tasks.export']) {
    const help = await call('actions.help', { action });
    const serialized = JSON.stringify(help); assert.ok(serialized.includes('感受'));
    for (const key of Object.keys(TASK_FILTER_SCHEMA)) assert.ok(serialized.includes('"' + key + '"'), action + ':' + key);
  }
  console.log('TASK SEARCH PASS', { cases, contrast: contrast.toFixed(2), listTotal: 3, exportAndData: true, realDatabaseTouched: false });
} finally {
  for (const cleanup of cleanups.reverse()) cleanup();
  assert.ok(resolve(home).startsWith(resolve(tmpdir()) + '/wb-search-')); rmSync(home, { recursive: true, force: true });
}
