/** 统计页任务标题跳转：taskNavigation 校验、标题按钮渲染与点击参数、降级纯文本。 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const filters = require('../packages/addons/tasks/client/views/task-filter-model.cjs');

const ULID = '01a1d075-641f-777e-9f2a-2cc945b252b3';
assert.equal(filters.taskNavigation({ taskId: ULID }), ULID, 'accepts a full ULID');
assert.equal(filters.taskNavigation({ taskId: '  abc_1-2  ' }), 'abc_1-2', 'trims and keeps allowed characters');
assert.equal(filters.taskNavigation({ taskId: 'a'.repeat(64) }), 'a'.repeat(64), 'accepts 64 characters');
for (const bad of [undefined, null, {}, { taskId: '' }, { taskId: '   ' }, { taskId: 'a'.repeat(65) }, { taskId: 'a b' }, { taskId: 'a#b' }, { taskId: 'id/1' }, { taskId: 123 }]) {
  assert.equal(filters.taskNavigation(bad), null, 'rejects ' + JSON.stringify(bad));
}

const taskTitle = require('../packages/addons/tasks/client/stats/task-link.cjs');
const calls = [];
const nav = (view, params) => calls.push([view, params]);
const render = taskTitle('zh', nav);
const cell = render({ id: 'abc', title: '标题A' });
assert.equal(cell.type, 'button');
assert.equal(cell.props.type, 'button');
assert.equal(cell.props.className, 'wbt-table-link');
assert.equal(cell.props['data-task-id'], 'abc');
assert.equal(cell.props['aria-label'], '按任务 ID 检索：abc');
assert.equal(cell.props.children, '标题A');
cell.props.onClick();
assert.deepEqual(calls, [['tasks', { taskId: 'abc' }]]);
assert.equal(taskTitle('en', nav)({ id: 'abc', title: 'T' }).props['aria-label'], 'Search by task ID: abc');
assert.equal(render({ id: '', title: '无 ID' }), '无 ID', 'row without id stays plain text');
assert.equal(render({ title: '缺字段' }), '缺字段');
assert.equal(taskTitle('zh', null)({ id: 'abc', title: 'x' }), 'x', 'no onNavigate degrades to text');
assert.equal(taskTitle('zh', undefined)({ id: 'abc', title: 'x' }), 'x');

const recentColumns = require('../packages/addons/tasks/client/item/recent-columns.cjs');
const copy = { colTitle: '标题', colTable: '任务表', colDate: '日期' };
const cols = recentColumns(copy, 'zh', nav);
assert.equal(cols.find(c => c.key === 'title').render({ id: 'q1', title: '标题Q' }).type, 'button');
cols.find(c => c.key === 'title').render({ id: 'q1', title: '标题Q' }).props.onClick();
assert.deepEqual(calls.at(-1), ['tasks', { taskId: 'q1' }]);
assert.equal(recentColumns(copy, 'zh', undefined).find(c => c.key === 'title').render({ id: 'q1', title: '标题Q' }), '标题Q');

// 统计页四张清单：逾期表复用同一工厂，最近三张共用 recentCols。
const stats = readFileSync(new URL('../packages/addons/tasks/client/views/stats.cjs', import.meta.url), 'utf8');
assert.ok(stats.includes('render: taskTitle(lang, props.onNavigate)'), 'overdue list uses the shared title factory');
assert.equal((stats.match(/recentColumns\(/g) || []).length, 1, 'recent lists share one column factory');
assert.equal((stats.match(/listProps\(data, "recent/g) || []).length, 3, 'recent publish/done/shutdown tables');
console.log('TASK STATS TASK LINK PASS', { cases: 20, overdue: true, recent: 3, degrade: true });
