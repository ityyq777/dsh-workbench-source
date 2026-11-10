/** 快捷查询预设：args 输出、激活/取消、默认预设与会话记忆、STORE v3 迁移。 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const require = createRequire(import.meta.url), dir = '../packages/addons/tasks/client/';
const copy = require(dir + 'ui/copy.cjs');
let state = [], cursor = 0, effects = [];
const memo = (fn, deps) => { const i = cursor++, old = state[i]; if (!old || deps.some((v, j) => v !== old.deps[j])) state[i] = { value: fn(), deps }; return state[i].value; };
const React = {
  createElement: (type, props, ...children) => ({ type, key: props?.key, props: props || {}, children: children.flat(Infinity).filter(x => x != null) }),
  useState: v => { const i = cursor++; if (!(i in state)) state[i] = v; return [state[i], n => state[i] = typeof n === 'function' ? n(state[i]) : n]; },
  useId: () => 'preset-test', useRef: v => { const i = cursor++; return state[i] ||= { current: v }; }, useMemo: memo,
  useCallback: (fn, deps) => memo(() => fn, deps), useEffect: (fn, deps) => memo(() => { effects.push(fn); }, deps),
};
const walk = n => n && typeof n === 'object' ? [n, ...(n.children || []).flatMap(walk)] : [];
const text = n => n && typeof n === 'object' ? (n.children || []).map(text).join('') : String(n ?? '');
const find = (tree, pred) => { const n = walk(tree).find(pred); assert.ok(n, 'expected control: ' + pred.toString()); return n; };
const reset = () => { state = []; cursor = 0; effects = []; };
const render = (C, p) => { cursor = 0; return C(p); };
const flush = async () => { const jobs = effects; effects = []; jobs.forEach(fn => fn()); for (let i = 0; i < 12; i++) await Promise.resolve(); };
const dirPath = 'packages/addons/tasks/client/';
const storage = new Map();
const sessionStorage = globalThis.sessionStorage = { getItem: k => storage.has(k) ? storage.get(k) : null, setItem: (k, v) => storage.set(k, String(v)), removeItem: k => storage.delete(k) };
function load(name, extra = {}) {
  const mod = { exports: {} };
  runInNewContext(readFileSync(dirPath + name, 'utf8'), {
    module: mod, sessionStorage, console,
    require: n => n === 'react' ? React : extra[n] !== undefined ? extra[n] : createRequire(require.resolve(dir + name))(n),
    document: { getElementById() { return true; }, addEventListener() {}, removeEventListener() {} }, Date, isFinite, navigator,
  });
  return mod.exports;
}
const model = load('views/task-filter-model.cjs');
const dates = load('ui/date-filter.cjs');
const today = dates.today(), yesterday = dates.shift(today, -1), weekAgo = dates.shift(today, -6);
const args = value => JSON.parse(JSON.stringify(model.args(value)));
const cases = [
  ['urgent', { statuses: [0], priorityMin: 8, priorityMax: 10 }],
  ['hard', { statuses: [0, 4], difficultyMin: 4, difficultyMax: 5 }],
  ['overdue', { statuses: [0, 4], targetTo: yesterday }],
  ['dueToday', { statuses: [0, 4], targetFrom: today, targetTo: today }],
  ['recentDone', { statuses: [2], doneFrom: weekAgo, doneTo: today }],
  ['claimed', { statuses: [4] }],
];
assert.deepEqual(JSON.parse(JSON.stringify(model.presets)), cases.map(c => c[0]));
for (const [id, expected] of cases) {
  assert.deepEqual(args(model.presetValue(id)), expected, id + ' args');
  assert.equal(model.activePreset(model.presetValue(id)), id, id + ' derives active state');
}
assert.equal(model.activePreset(model.empty()), '', 'empty filters activate no preset');
assert.equal(model.presetValue('nope'), null);
const urgent = model.presetValue('urgent');
assert.equal(model.activePreset(Object.assign({}, urgent, { difficulty: { min: '4', max: '5' } })), '', 'manual edits drop the highlight');
assert.equal(model.toggle(urgent, '4').priority.min, '8', 'status click keeps the range');
assert.equal(model.all(model.empty()), true);
assert.equal(model.all(urgent), false);
// 目标日期区间独立于状态：填了不会自动勾选状态。
const targeted = model.range(model.empty(), 'target', { from: '', to: yesterday });
assert.deepEqual(JSON.parse(JSON.stringify(targeted.value.statuses)), [], 'target range never selects a status');
assert.equal(targeted.autoSelected, false);
assert.equal(args(targeted.value).targetTo, yesterday);

// 面板：状态区没有 urgent 伪选项，快捷预设可激活/取消。
const panel = require(dir + 'views/task-filter-panel.cjs');
const renderPanel = (value, extra = {}) => { cursor = 0; return panel(React, Object.assign({
  lang: 'zh', value, open: true, id: 'p', hint: '', onHint() {}, onToggle() {}, onChange() {}, difficultyMissing: false, onMissingChange() {},
  search: null, tags: null, missing: null,
}, extra)); };
const plain = renderPanel(model.empty());
assert.equal(walk(plain).some(n => n.props && n.props['data-status'] === 'urgent'), false, 'urgent pseudo status removed');
const presetButtons = walk(plain).filter(n => n.type === 'button' && n.props && n.props['data-preset']);
assert.equal(presetButtons.length, cases.length);
assert.ok(presetButtons.every(b => b.props['aria-pressed'] === false));
assert.ok(text(plain).includes('快捷筛选') && text(plain).includes('目标日期范围'));
const pressed = renderPanel(model.presetValue('claimed'));
const claimed = find(pressed, n => n.props && n.props['data-preset'] === 'claimed');
assert.equal(claimed.props['aria-pressed'], true);
let changed = null, missing = null;
const active = renderPanel(model.presetValue('claimed'), { onChange: v => changed = v, onMissingChange: v => missing = v });
find(active, n => n.props && n.props['data-preset'] === 'claimed').props.onClick();
assert.deepEqual(args(changed), { statuses: [] }, 'clicking the active preset returns to All');
assert.equal(missing, false, 'preset clicks clear difficulty-missing filter');
const cancelled = renderPanel(model.presetValue('urgent'), { onChange: v => changed = v });
find(cancelled, n => n.props && n.props['data-preset'] === 'hard').props.onClick();
assert.deepEqual(args(changed), cases[1][1]);

// STORE：v2 旧键不再读取，v3 保留 target，缺 target 时按空兼容。
assert.equal(model.save(model.presetValue('dueToday'), false, { tableId: 't1' }), undefined);
assert.equal(model.load({ tableId: 't1' }).value.target.to, today, 'target survives save/load');
storage.set('wbt.taskFilters.v2', JSON.stringify({ navigation: '{}', statuses: ['1'] }));
assert.equal(model.load({}), null, 'v2 payload is ignored after the store bump');
const saved = JSON.parse(storage.get('wbt.taskFilters.v3'));
delete saved.target;
storage.set('wbt.taskFilters.v3', JSON.stringify(saved));
assert.deepEqual(JSON.parse(JSON.stringify(model.load({ tableId: 't1' }).value.target)), { from: '', to: '' }, 'missing target falls back to empty');
assert.ok(!JSON.stringify(model.args(model.empty())).includes('urgent'));

// 视图：没有会话记忆时套用 ui.defaultPreset；有记忆时以记忆为准。
function mountView(cfg) {
  const View = require(dir + 'views/tasks-view.cjs')({
    React, configView: { useConfig: () => ({ ready: true, values: cfg }) }, CFG_FALLBACK: cfg, COPY: copy,
    injectCss() {}, allTables: () => [], findFirstTable: () => null, treeWalk: () => [], treeFlat: () => [], cx: (...s) => s.join(' '),
    Icon: () => null, TaskItem: () => null, PathCrumbs: () => null, TagFilter: () => null, TreeNode: () => null,
    CreateModal: () => null, TimelineModal: () => null, NodeModal: () => null, EditModal: () => null, DoneModal: () => null, BatchModal: () => null,
  });
  const calls = [];
  const props = { lang: 'zh', cfg, api: { subscribe: () => () => {}, call: async (action, a) => { calls.push({ action, args: a }); return { ok: true, result: action === 'tasks.list' ? { records: [], total: 0, pageable: false } : [] }; } } };
  reset(); const outer = View(props); reset(); const body = render(outer.type, outer.props);
  return { body, calls, list: () => calls.filter(c => c.action === 'tasks.list').at(-1).args };
}
reset();
const defaulted = mountView({ 'ui.defaultPreset': 'overdue', 'list.pageSize': 12 });
await flush(); await flush();
assert.deepEqual(defaulted.list().statuses, [0, 4], 'default preset applies on open');
assert.equal(defaulted.list().targetTo, yesterday);
assert.equal(find(defaulted.body, n => n.props && n.props['data-preset'] === 'overdue').props['aria-pressed'], true, 'default preset is highlighted');
reset();
storage.set('wbt.taskFilters.v3', JSON.stringify({ navigation: '{}', missing: false, statuses: ['2'], priority: { min: '', max: '' }, difficulty: { min: '', max: '' }, publish: { from: '', to: '' }, done: { from: '', to: '' }, shutdown: { from: '', to: '' }, target: { from: '', to: '' } }));
const remembered = mountView({ 'ui.defaultPreset': 'overdue', 'list.pageSize': 12 });
await flush(); await flush();
assert.deepEqual(remembered.list().statuses, [2], 'session memory wins over the default preset');
storage.clear();
reset();
const unknown = mountView({ 'ui.defaultPreset': 'bogus', 'list.pageSize': 12 });
await flush(); await flush();
assert.deepEqual(unknown.list().statuses, [], 'unknown preset falls back to All');
assert.equal(unknown.list().targetTo, undefined);
console.log('TASK PRESETS PASS: 6 preset args, active/cancel, target range, ui.defaultPreset, STORE v3 migration, panel a11y');
