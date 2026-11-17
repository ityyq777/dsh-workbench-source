/** Isolated in-memory DB: event trend must share the calendar's definitions exactly. */
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { setup } from '../packages/addons/tasks/lib/index.js';
import { EVENTS, EVENT_TYPES, PLAN } from '../packages/addons/tasks/lib/stats/events.js';

const db = new DatabaseSync(':memory:'), actions = new Map();
setup({ db, addon: { version: 'test' }, log() {}, hasDomain: () => false, action: (name, def) => actions.set(name, def) });
const call = (name, args = {}) => actions.get(name).execute(args, { origin: 'agent' });

// 计划口径不能污染事件定义：难度五维与活动总数都依赖 EVENT_TYPES 恰为四类。
assert.deepEqual(EVENT_TYPES, ['publish', 'done', 'shutdown', 'claimed']);
assert.equal(PLAN.key, 'target');
assert.equal(EVENTS.target, undefined, 'PLAN 不得进 EVENTS');

db.exec("INSERT INTO task_node(id,name,type,parent_id,path,created_at,updated_at) VALUES('t1','Table','1','1','/1/',0,0)");
const insert = db.prepare(
  'INSERT INTO task(id,title,status,table_id,publish_date,target_date,done_date,shutdown_date,created_at,updated_at,deleted_at,claimed_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
);
const T = Date.parse('2026-11-10T10:00:00+08:00');
const add = (id, status, publish, target, done = null, shutdown = null, deleted = null, claimed = null) =>
  insert.run(id, id, status, 't1', publish, target, done, shutdown, T, T, deleted, claimed);

add('a', '2', '2026-11-10', '2026-11-12', '2026-11-11', null, null, T); // 完成 + 接取
add('b', '1', '2026-11-10', '2026-11-10', null, '2026-11-12'); // 关闭
add('c', '4', '2026-11-13', '2026-11-13', null, null, null, T); // 已接取未完成
add('gone', '2', '2026-11-10', '2026-11-10', '2026-11-10', null, 123, T); // 已删除，全部不计

const report = call('tasks.statsReport', { range: '30d' });
const buckets = Object.create(null);
for (const row of report.eventTrend) buckets[row.bucket] = row;

assert.equal(report.eventTrend.length, report.trend.length, '事件趋势与旧趋势桶数一致');
assert.deepEqual(report.eventTrendTypes, ['publish', 'done', 'shutdown', 'claimed', 'target']);
assert.equal(Object.prototype.hasOwnProperty.call(buckets['2026-11-10'], 'created'), false, '新序列不混入旧字段');

const expect = {
  // c 的 claimed_at 落在 11-10，所以接取日按 claimed_at 记在 11-10 而不是发布日 11-13。
  '2026-11-10': { publish: 2, done: 0, shutdown: 0, claimed: 2, target: 1 },
  '2026-11-11': { publish: 0, done: 1, shutdown: 0, claimed: 0, target: 0 },
  '2026-11-12': { publish: 0, done: 0, shutdown: 1, claimed: 0, target: 1 },
  '2026-11-13': { publish: 1, done: 0, shutdown: 0, claimed: 0, target: 1 },
};
for (const [day, values] of Object.entries(expect)) {
  for (const [k, n] of Object.entries(values)) assert.equal(buckets[day][k], n, day + ' ' + k);
}

// 口径与年度活动日历完全一致（抽三个维度对比）。
const calendar = call('tasks.activityCalendar', { year: 2026 });
const byDate = Object.create(null);
for (const day of calendar.days) byDate[day.date] = day;
for (const day of Object.keys(expect)) {
  const row = byDate[day];
  if (!row) continue;
  for (const k of ['publish', 'done', 'shutdown', 'claimed', 'target']) assert.equal(buckets[day][k], row[k], '与活动日历一致：' + day + ' ' + k);
}

// 旧趋势卡的三条线语义不变：created 仍是 created_at，done 仍是 done_date 非空。
const trendRow = report.trend.find((row) => row.bucket === '2026-11-11');
assert.equal(trendRow.done, 1, '旧 trend.done 仍按 done_date 计');
assert.equal(report.totals.total, 3, '活动总数只算未删除任务（a/b/c）');

// 空区间不出 NaN，也不缺字段。
const empty = call('tasks.statsReport', { from: '2024-01-01', to: '2024-01-03' });
assert.equal(empty.eventTrend.length, 3);
for (const row of empty.eventTrend) for (const k of ['publish', 'done', 'shutdown', 'claimed', 'target']) assert.equal(row[k], 0);

// 接取必须走 COALESCE 回退：有 claimed_at 用其本地日，没有则用 publish_date（历史任务）。
const fallback = call('tasks.statsReport', { from: '2026-11-10', to: '2026-11-10' });
assert.equal(fallback.eventTrend[0].claimed, 2, 'claimed 走 COALESCE：a 与 c 用 claimed_at 本地日，状态 1 的 b 不计入');

console.log('EVENT TREND PASS: 五序列与活动日历同口径，claimed 走 COALESCE 回退，旧 trend/totals 未受影响');

// ---- 前端：事件趋势卡真实渲染（真组件，API 是桩） ----
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const require = createRequire(import.meta.url), dir = '../packages/addons/tasks/client/';
const charts = require(dir + 'stats/charts.cjs');
let state = [], cursor = 0, effects = [];
const memo = (fn, deps) => { const i = cursor++, old = state[i]; if (!old || deps.some((v, j) => v !== old.deps[j])) state[i] = { value: fn(), deps }; return state[i].value; };
const React = {
  createElement: (type, props, ...children) => ({ type, key: props?.key, props: props || {}, children: children.flat(Infinity).filter((x) => x != null) }),
  useState: (v) => { const i = cursor++; if (!(i in state)) state[i] = v; return [state[i], (n) => { state[i] = typeof n === 'function' ? n(state[i]) : n; }]; },
  useId: () => 'et-test', useRef: (v) => { const i = cursor++; return (state[i] ||= { current: v }); }, useMemo: memo,
  useCallback: (fn, d) => memo(() => fn, d), useEffect: (fn, d) => memo(() => { effects.push(fn); }, d),
};
const walk = (n) => (n && typeof n === 'object' ? [n, ...n.children.flatMap(walk)] : []);
const text = (n) => (n && typeof n === 'object' ? n.children.map(text).join('') : String(n ?? ''));
const reset = () => { state = []; cursor = 0; effects = []; };
const mod = { exports: {} };
let cfgValues = {};
runInNewContext(readFileSync('packages/addons/tasks/client/views/stats.cjs', 'utf8'), {
  module: mod, Date,
  require: (n) => n === 'react' ? React : n === './config.cjs' ? { useConfig: () => ({ ready: true, values: cfgValues }) }
    : n === '../item/ranking-name.cjs' ? require(dir + 'item/ranking-name.cjs')
    : n === '../item/recent-columns.cjs' ? require(dir + 'item/recent-columns.cjs')
    : n === '../stats/list-state.cjs' ? require(dir + 'stats/list-state.cjs')
    : n === '../stats/task-link.cjs' ? require(dir + 'stats/task-link.cjs') : charts,
  document: { addEventListener() {}, removeEventListener() {} },
});
const trendRows = [
  { bucket: '2026-11-10', publish: 3, target: 1, done: 0, shutdown: 0, claimed: 2 },
  { bucket: '2026-11-11', publish: 0, target: 0, done: 2, shutdown: 1, claimed: 0 },
];
for (const lang of ['zh', 'en']) {
  reset();
  const api = { call: async () => ({ result: { totals: { total: 7 }, trend: trendRows, eventTrend: trendRows, range: { from: '2026-11-10', to: '2026-11-11' } } }) };
  const outer = mod.exports.TasksStatsView({ lang, api, onNavigate() {} });
  cursor = 0; outer.type(outer.props); const jobs = effects; effects = []; jobs.forEach((fn) => fn());
  for (let i = 0; i < 12; i += 1) await Promise.resolve();
  cursor = 0; const body = outer.type(outer.props);
  const card = walk(body).find((n) => n && n.key === 'eventTrend');
  assert.ok(card, '事件趋势卡应渲染');
  assert.equal(card.props.span, 12);
  assert.equal(card.props.title, lang === 'en' ? 'Event trend' : '事件趋势', '卡片标题用用户用语');
  assert.match(String(card.props.note || ''), lang === 'en' ? /annual activity/ : /年度活动/, 'note 说明口径来源');
  const trend = walk(card).find((n) => n && Array.isArray(n.props.series));
  assert.deepEqual([...trend.props.series.map((s) => s.key)], ['publish', 'target', 'claimed', 'shutdown', 'done'], '五条曲线顺序：发布/目标/接取/关闭/完成');
  assert.deepEqual([...trend.props.series.map((s) => s.label)], [...(lang === 'en'
    ? ['Published', 'Target', 'Claimed', 'Closed', 'Done'] : ['发布', '目标', '接取', '关闭', '完成'])]);
  assert.equal(new Set(trend.props.series.map((s) => s.color)).size, 5, '五条线颜色互不相同');
  // 换序不换色：颜色跟着含义走，否则读者要重新认一遍颜色。
  const chartColors = charts.makeCharts('wbt').colors;
  assert.deepEqual([...trend.props.series.map((s) => s.key + '=' + s.color)], [
    'publish=' + chartColors[0], 'target=' + chartColors[5], 'claimed=' + chartColors[2],
    'shutdown=' + chartColors[3], 'done=' + chartColors[1],
  ], '序列颜色与含义绑定');
  // 5.2.21 起旧「新增/完成/到期趋势」卡已删除，整页只保留事件趋势一张折线图。
  assert.equal(walk(body).filter((n) => n && n.key === 'trend').length, 0, '旧趋势卡已移除');
  assert.equal(walk(body).filter((n) => n && Array.isArray(n.props.series)).length, 1, '整页只有一张折线图');
  // 配置里关掉该区块后整卡消失。
  cfgValues = { 'stats.sections': ['status'] };
  reset(); const off = mod.exports.TasksStatsView({ lang, api, onNavigate() {} });
  cursor = 0; off.type(off.props); const jobs2 = effects; effects = []; jobs2.forEach((fn) => fn());
  for (let i = 0; i < 12; i += 1) await Promise.resolve();
  cursor = 0; assert.equal(walk(off.type(off.props)).filter((n) => n && n.key === 'eventTrend').length, 0, '区块开关可隐藏事件趋势');
  cfgValues = {};
}
console.log('EVENT TREND UI PASS: 五序列顺序/文案/配色、旧趋势卡已移除、区块开关可隐藏');
