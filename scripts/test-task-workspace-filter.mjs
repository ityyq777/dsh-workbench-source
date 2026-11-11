/** 工作区筛选下拉：多选、计数、清空、未关联互斥、空列表、搜索与滚动分页。 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const require = createRequire(import.meta.url), dir = '../packages/addons/tasks/client/';
const copy = require(dir + 'ui/copy.cjs'), t = copy.zh;
let state = [], cursor = 0, effects = [], timers = [];
const memo = (fn, deps) => { const i = cursor++, old = state[i]; if (!old || deps.some((v, j) => v !== old.deps[j])) state[i] = { value: fn(), deps }; return state[i].value; };
const React = {
  createElement: (type, props, ...children) => ({ type, key: props?.key, props: props || {}, children: children.flat(Infinity).filter(x => x != null) }),
  useState: v => { const i = cursor++; if (!(i in state)) state[i] = v; return [state[i], n => state[i] = typeof n === 'function' ? n(state[i]) : n]; },
  useRef: v => { const i = cursor++; return state[i] ||= { current: v }; }, useMemo: memo,
  useCallback: (fn, deps) => memo(() => fn, deps), useEffect: (fn, deps) => memo(() => { effects.push(fn); }, deps),
};
const walk = n => n && typeof n === 'object' ? [n, ...(n.children || []).flatMap(walk)] : [];
const text = n => n && typeof n === 'object' ? (n.children || []).map(text).join('') : String(n ?? '');
const find = (tree, pred) => { const n = walk(tree).find(pred); assert.ok(n, 'expected control: ' + pred.toString()); return n; };
const has = (tree, pred) => walk(tree).some(pred);
const reset = () => { state = []; cursor = 0; effects = []; timers = []; };
const mount = (C, p) => { cursor = 0; return C(p); };
const flush = async () => {
  const jobs = effects; effects = [];
  jobs.forEach(fn => fn());
  while (timers.length) (timers.shift())();
  for (let i = 0; i < 20; i++) await Promise.resolve();
};
function load(name, extra = {}) {
  const mod = { exports: {} };
  runInNewContext(readFileSync('packages/addons/tasks/client/' + name, 'utf8'), {
    module: mod, console, navigator,
    require: n => n === 'react' ? React : extra[n] !== undefined ? extra[n] : createRequire(require.resolve(dir + name))(n),
    document: { getElementById() { return true; }, addEventListener() {}, removeEventListener() {} },
    Date, isFinite,
    setTimeout: fn => { timers.push(fn); return timers.length; }, clearTimeout() {},
  });
  return mod.exports;
}
const Filter = load('ui/workspacefilter.cjs');
const model = load('views/task-filter-model.cjs');
const Icon = () => null;

function api(handler) {
  const calls = [];
  return { calls, call: (action, args) => { calls.push({ action, args }); return Promise.resolve(handler(action, args)); } };
}
const plain = v => JSON.parse(JSON.stringify(v));
const page = (records, total, pageNumber) => ({ ok: true, result: { records, total, pageNumber, pageSize: 20 } });
const ws = (id, title, count) => ({ id, title, taskCount: count });
const props = (over = {}) => Object.assign({ api: api(() => page([], 0, 1)), t, Icon, ids: [], noWorkspace: false,
  onToggle() {}, onToggleNoWorkspace() {}, onClear() {} }, over);

// 1) 收起态：只有一个按钮，不渲染菜单。
reset();
let tree = mount(Filter, props());
await flush();
assert.equal(walk(tree).filter(n => n.type === 'button').length, 1, 'collapsed state renders a single button');
assert.equal(text(tree).includes(t.workspaceFilter), true);
assert.equal(has(tree, n => n.props && n.props.role === 'menu'), false, 'menu stays closed');
assert.equal(find(tree, n => n.type === 'button').props['aria-expanded'], false);

// 2) 展开：按 taskWorkspaces.list 取第一页，候选显示名称与任务数。
reset();
const listApi = api(() => page([ws('w1', 'dsh-workbench 源码', 129), ws('w2', '方案文档', 4)], 2, 1));
const picked = [], toggledNone = [];
tree = mount(Filter, props({ api: listApi, ids: ['w1'], onToggle: id => picked.push(id), onToggleNoWorkspace: () => toggledNone.push(1) }));
await flush();
find(tree, n => n.type === 'button').props.onClick();
tree = mount(Filter, props({ api: listApi, ids: ['w1'], onToggle: id => picked.push(id), onToggleNoWorkspace: () => toggledNone.push(1) }));
await flush();
assert.deepEqual(plain(listApi.calls[0]), { action: 'taskWorkspaces.list', args: { keyword: '', pageNumber: 1, pageSize: 20 } });
assert.equal(find(tree, n => n.type === 'button').props['aria-expanded'], true);
assert.deepEqual(listApi.calls.length, 1, 'opening loads once');
tree = mount(Filter, props({ api: listApi, ids: ['w1'], onToggle: id => picked.push(id), onToggleNoWorkspace: () => toggledNone.push(1) }));
const options = walk(tree).filter(n => n.type === 'label' && n.props && n.props.className === 'wbt-tagopt');
assert.equal(options.length, 2, 'one row per workspace');
assert.equal(has(tree, n => n.props && n.props.className === 'wbt-tagopt wbt-wsnone'), true, 'no-workspace row lives inside the menu');
assert.equal(text(options[0]), 'dsh-workbench 源码129');
assert.equal(text(options[1]), '方案文档4');
assert.equal(options[0].children[0].props.checked, true, 'selected workspace is checked');
assert.equal(text(tree).includes(t.workspaceSelected + ' 1'), true, 'selected count is shown');
assert.equal(text(tree).includes('全部工作区 2'), true, 'total is shown');
// 已选 chip 点击移除、候选勾选切换都回到 model。
find(tree, n => n.type === 'button' && n.props && n.props.className === 'wbt-tagselitem').props.onClick();
assert.deepEqual(picked, ['w1']);
options[1].children[0].props.onChange();
assert.deepEqual(picked, ['w1', 'w2']);

// 3) 未关联工作区：勾选走 onToggleNoWorkspace，计数显示在按钮上。
const none = mount(Filter, props({ api: listApi, ids: [], noWorkspace: true, onToggle: () => {}, onToggleNoWorkspace: () => toggledNone.push(1) }));
assert.equal(text(none).includes(t.workspaceFilter + ' · ' + t.noWorkspace), true);
find(none, n => n.type === 'label' && n.props && n.props.className === 'wbt-tagopt wbt-wsnone').children[0].props.onChange();
assert.equal(toggledNone.length, 1);
assert.equal(find(none, n => n.type === 'label' && n.props && n.props.className === 'wbt-tagopt wbt-wsnone').children[0].props.checked, true);

// 4) 清空：一次清掉已选与未关联，并清空搜索词。
reset();
let cleared = 0;
tree = mount(Filter, props({ api: listApi, ids: ['w1'], noWorkspace: true, onClear: () => cleared++ }));
await flush();
find(tree, n => n.type === 'button').props.onClick();
tree = mount(Filter, props({ api: listApi, ids: ['w1'], noWorkspace: true, onClear: () => cleared++ }));
await flush();
tree = mount(Filter, props({ api: listApi, ids: ['w1'], noWorkspace: true, onClear: () => cleared++ }));
find(tree, n => n.type === 'button' && n.props && n.props.className === 'wbt-mini').props.onClick();
assert.equal(cleared, 1);

// 5) 搜索即时过滤（防抖后按 keyword 请求）。
reset();
const searchApi = api(() => page([ws('w2', '方案文档', 4)], 1, 1));
tree = mount(Filter, props({ api: searchApi }));
await flush();
find(tree, n => n.type === 'button').props.onClick();
tree = mount(Filter, props({ api: searchApi }));
await flush();
find(tree, n => n.type === 'input').props.onChange({ target: { value: '方案' } });
tree = mount(Filter, props({ api: searchApi }));
await flush();
assert.deepEqual(plain(searchApi.calls.at(-1).args), { keyword: '方案', pageNumber: 1, pageSize: 20 });
// 无匹配文案。
assert.equal(text(tree).includes(t.workspaceNoMatch), false, 'non-empty result hides the no-match note');

// 6) 滚动分页：hasMore 用 页码 × 页长 < total 推导。
reset();
let pageNo = 0;
const pagingApi = api((action, args) => {
  pageNo = args.pageNumber;
  return args.pageNumber === 1 ? page([ws('w1', 'A', 1)], 25, 1) : page([ws('w2', 'B', 2)], 25, 2);
});
tree = mount(Filter, props({ api: pagingApi }));
await flush();
find(tree, n => n.type === 'button').props.onClick();
tree = mount(Filter, props({ api: pagingApi }));
await flush();
tree = mount(Filter, props({ api: pagingApi }));
assert.equal(text(tree).includes(t.noMore), false, 'more pages stay available');
find(tree, n => n.props && n.props.className === 'wbt-taglist').props.onScroll({ target: { scrollTop: 200, clientHeight: 100, scrollHeight: 300 } });
tree = mount(Filter, props({ api: pagingApi }));
await flush();
assert.equal(pageNo, 2);
tree = mount(Filter, props({ api: pagingApi }));
assert.equal(walk(tree).filter(n => n.type === 'label' && n.props && n.props.className === 'wbt-tagopt').length, 2);
assert.equal(text(tree).includes(t.noMore), true, 'last page reports no more');

// 7) 空列表、加载失败都有文案。
reset();
tree = mount(Filter, props({ api: api(() => page([], 0, 1)) }));
await flush();
find(tree, n => n.type === 'button').props.onClick();
tree = mount(Filter, props({ api: api(() => page([], 0, 1)) }));
await flush();
tree = mount(Filter, props({ api: api(() => page([], 0, 1)) }));
assert.equal(text(tree).includes(t.noWorkspaces), true, 'empty list note');
reset();
tree = mount(Filter, props({ api: api(() => ({ ok: false, error: 'boom' })) }));
await flush();
find(tree, n => n.type === 'button').props.onClick();
tree = mount(Filter, props({ api: api(() => ({ ok: false, error: 'boom' })) }));
await flush();
tree = mount(Filter, props({ api: api(() => ({ ok: false, error: 'boom' })) }));
assert.equal(text(tree).includes('boom'), true, 'load failure is visible');

// 8) 面板：工作区段落自己渲染下拉，不再平铺复选框。
const panel = require(dir + 'views/task-filter-panel.cjs');
const base = { lang: 'zh', value: model.empty(), open: true, id: 'p', hint: '', onHint() {}, onToggle() {}, onChange() {},
  difficultyMissing: false, onMissingChange() {}, search: null, tags: null, missing: null };
const painted = panel(React, Object.assign({}, base, { api: api(() => page([], 0, 1)), t, Icon }));
assert.equal(has(painted, n => n.props && n.props['data-workspace']), false, 'no tiled workspace checkboxes');
assert.equal(has(painted, n => n.props && n.props.className === 'wbt-filter-group wbt-ws-group'), true, 'group wrapper stays');
const group = walk(painted).find(n => n.props && n.props.className === 'wbt-filter-group wbt-ws-group');
assert.ok(group && group.children.some(c => typeof c.type === 'function' && c.props && c.props.ids), 'dropdown element sits inside the workspace group');
const injected = panel(React, Object.assign({}, base, { workspaces: { type: 'div', props: { className: 'wbt-ws-dd' }, children: [] } }));
assert.equal(has(injected, n => n.props && n.props.className === 'wbt-ws-dd'), true, 'explicit node still wins for old callers');
const bare = panel(React, base);
assert.equal(has(bare, n => n.props && n.props.className === 'wbt-filter-group wbt-ws-group'), false, 'panel survives with no data source');

// 9) 互斥语义仍由 model 负责：选具体工作区取消「未关联」，反之清空列表。
const anyWs = model.toggleNoWorkspace(model.toggleWorkspace(model.empty(), 'w1'));
assert.deepEqual(JSON.parse(JSON.stringify(anyWs.workspaceIds)), [], 'no-workspace clears ids');
assert.equal(anyWs.noWorkspace, true);
const concrete = model.toggleWorkspace(anyWs, 'w2');
assert.equal(concrete.noWorkspace, false, 'picking a workspace clears no-workspace');
assert.deepEqual(JSON.parse(JSON.stringify(concrete.workspaceIds)), ['w2']);

console.log('TASK WORKSPACE FILTER PASS: dropdown list/search/paging, selected chips, clear, no-workspace exclusivity, empty & error notes, panel wiring');
