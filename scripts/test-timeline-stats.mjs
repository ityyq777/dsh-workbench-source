/** Timeline stats acceptance uses isolated in-memory SQLite only; no installed profile. */
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { setup } from '../packages/addons/tasks/lib/index.js';

const db = new DatabaseSync(':memory:');
db.exec('CREATE TABLE sync_change_log(id INTEGER PRIMARY KEY,table_name TEXT,row_id TEXT,op TEXT,payload TEXT,origin TEXT,updated_at INTEGER)');
const actions = new Map();
setup({ db, addon: { version: 'test' }, log() {}, hasDomain: () => false, emit() {}, action: (name, def) => actions.set(name, def) });
const call = (name, args = {}) => actions.get(name).execute(args, { origin: 'agent' });
const stats = (args = {}) => call('tasks.timelineStats', args);
const line = (title) => call('taskTimelines.create', { title }).timeline.id;
const tableId = () => call('tasks.capabilities', {}).tables[0].id;
const task = (title) => call('tasks.create', { title, tableId: tableId() }).id;
const attach = (taskId, timelineId) => call('taskTimelines.attach', { taskId, timelineId });
const sum = (rows, key) => rows.reduce((acc, row) => acc + row[key], 0);

// 1. 空库：全 0、比率为 null，不报错。
{
  const r = stats();
  assert.deepEqual(
    { timelines: r.totals.timelines, tasks: r.totals.tasks, assigned: r.totals.assignedTasks, empty: r.totals.emptyTimelines },
    { timelines: 0, tasks: 0, assigned: 0, empty: 0 },
  );
  assert.equal(r.totals.coverage, null);
  assert.equal(r.totals.emptyRatio, null);
  assert.equal(r.top.returned, 0);
  assert.equal(sum(r.distribution, 'count'), 0);
  assert.equal(r.invariants.assignedPlusUnassigned, true);
  assert.equal(r.invariants.linesPlusEmpty, true);
}

const tA = line('线 A');
const tB = line('空线 B');
const free = task('未归属任务');
const a1 = task('A1'); attach(a1, tA);
const a2 = task('A2'); attach(a2, tA);

// 2. 有任务线 / 空线 / 归属与覆盖率。
{
  const r = stats();
  assert.equal(r.totals.timelines, 2);
  assert.equal(r.totals.timelinesWithTasks, 1);
  assert.equal(r.totals.emptyTimelines, 1);
  assert.equal(r.totals.emptyRatio, 50);
  assert.equal(r.totals.tasks, 3);
  assert.equal(r.totals.assignedTasks, 2);
  assert.equal(r.totals.unassignedTasks, 1);
  assert.equal(r.totals.coverage, 66.7);
  assert.equal(r.top.records[0].taskCount, 2);
  assert.equal(r.top.records[0].openCount, 2);
  assert.equal(r.top.records[0].doneRate, 0);
  assert.equal(r.distribution.find((b) => b.key === '0').count, 1);
  assert.equal(r.distribution.find((b) => b.key === '2-5').count, 1);
  assert.equal(sum(r.distribution, 'count'), r.totals.timelines);
  assert.equal(r.invariants.assignedPlusUnassigned, true);
  assert.equal(r.invariants.linesPlusEmpty, true);
  void free;
}

// 3. 并列数量按 id 升序；排行榜与分布不受 topLimit 截断影响。
const tC = line('线 C');
const c1 = task('C1'); attach(c1, tC);
{
  const r = stats({ topLimit: 1 });
  assert.equal(r.top.returned, 1);
  assert.equal(r.top.truncated, true);
  assert.equal(r.top.records[0].taskCount, 2);
  assert.equal(r.totals.timelinesWithTasks, 2);
  const full = stats();
  const tied = full.top.records.filter((x) => x.taskCount === 1);
  assert.equal(tied.length, 1);
  const both = full.top.records.map((x) => x.id);
  assert.deepEqual(both, [...both].sort());
}

// 4. 成员移出 → 线变空线，任务回到未归属。
{
  call('taskTimelines.detach', { taskId: c1 });
  const r = stats();
  assert.equal(r.totals.emptyTimelines, 2);
  assert.equal(r.totals.assignedTasks, 2);
  assert.equal(r.totals.unassignedTasks, 2);
  assert.equal(r.top.records.some((x) => x.id === tC), false);
}

// 5. 任务完成/关闭计入状态构成，不再计入进行中。
{
  call('tasks.complete', { id: a1 });
  const r = stats();
  const row = r.top.records.find((x) => x.id === tA);
  assert.equal(row.doneCount, 1);
  assert.equal(row.openCount, 1);
  assert.equal(row.doneRate, 50);
}

// 6. 已完成任务删除后线变空；删除时间线不计入总数。
{
  call('tasks.delete', { id: a1 });
  call('tasks.delete', { id: a2 });
  let r = stats();
  const row = r.totals;
  assert.equal(row.emptyTimelines >= 2, true);
  call('taskTimelines.delete', { timelineId: tB });
  r = stats();
  assert.equal(r.top.records.some((x) => x.id === tB), false);
  assert.equal(r.totals.timelines, r.totals.timelinesWithTasks + r.totals.emptyTimelines);
  assert.equal(r.invariants.linesPlusEmpty, true);
}

// 7. 已重启任务退出有效成员，重启副本继承原归属；移出副本后线变空。
{
  const tD = line('重启线');
  const d1 = task('将重启');
  attach(d1, tD);
  const restarted = call('tasks.create', { title: '重启副本', source: 2, restartKey: d1, tableId: tableId() }).id;
  const r = stats();
  const row = r.top.records.find((x) => x.id === tD);
  assert.equal(row.taskCount, 1);
  assert.equal(db.prepare('SELECT status FROM task WHERE id=?').get(d1).status, '3');
  assert.equal(r.totals.tasks, db.prepare("SELECT COUNT(*) AS n FROM task WHERE deleted_at IS NULL AND status!='3'").get().n);
  assert.equal(r.totals.assignedTasks, db.prepare("SELECT COUNT(*) AS n FROM task_timeline_link l JOIN task t ON t.id=l.task_id JOIN task_timeline e ON e.id=l.timeline_id WHERE l.deleted_at IS NULL AND e.deleted_at IS NULL AND t.deleted_at IS NULL AND t.status!='3'").get().n);
  call('taskTimelines.detach', { taskId: restarted });
  const after = stats();
  assert.equal(after.top.records.some((x) => x.id === tD), false);
  assert.equal(after.totals.emptyTimelines, after.totals.timelines - after.totals.timelinesWithTasks);
}

// 8. 超过 100 条时间线：全量聚合、Top 截断、总数与分布不受截断影响。
{
  const make = db.prepare("INSERT INTO task_timeline(id,title,description,created_at,updated_at,rev) VALUES (?,?,?,?,?,1)");
  const link = db.prepare("INSERT INTO task_timeline_link(id,task_id,timeline_id,created_at,updated_at,rev) VALUES (?,?,?,?,?,1)");
  const now = Date.now();
  for (let i = 0; i < 105; i++) {
    const tid = 'bulk-line-' + String(i).padStart(3, '0');
    make.run(tid, '批量线 ' + i, '', now, now);
    const created = call('tasks.create', { title: '批量任务 ' + i, tableId: tableId() }).id;
    link.run('bulk-link-' + i, created, tid, now, now);
  }
  const r = stats();
  assert.equal(r.top.returned, 100);
  assert.equal(r.top.truncated, true);
  assert.equal(r.totals.timelines, 108);
  assert.equal(r.totals.timelinesWithTasks >= 100, true);
  assert.equal(r.totals.timelinesWithTasks > r.top.returned, true);
  assert.equal(sum(r.distribution, 'count'), r.totals.timelines);
  assert.equal(r.invariants.assignedPlusUnassigned, true);
  assert.equal(r.invariants.linesPlusEmpty, true);
  const counts = r.top.records.map((x) => x.taskCount);
  assert.deepEqual(counts, [...counts].sort((x, y) => y - x));
}

// 9. 趋势：只统计范围内事件；反序自动交换。
{
  const r = stats({ from: '2000-01-01', to: '2000-01-31' });
  assert.equal(r.trend.newTimelines, 0);
  assert.equal(r.trend.newTasks, 0);
  assert.equal(r.trend.doneTasks, 0);
  const now = new Date().toISOString().slice(0, 10);
  const r2 = stats({ from: now, to: now });
  assert.equal(r2.trend.newTasks >= 1, true);
  const reversed = stats({ from: now, to: '2000-01-01' });
  assert.equal(reversed.trend.swapped, true);
  assert.equal(reversed.trend.from, '2000-01-01');
}

// 10. 参数校验：非法 topLimit / 单边范围 / 非法日期明确报错。
assert.throws(() => stats({ topLimit: 0 }), /topLimit 必须是 1\.\.100 的整数/);
assert.throws(() => stats({ topLimit: 101 }), /topLimit 必须是 1\.\.100 的整数/);
assert.throws(() => stats({ from: '2026-01-01' }), /同时提供/);
assert.throws(() => stats({ from: '2026-13-01', to: '2026-01-01' }), /必须是 YYYY-MM-DD|不是有效日期/);

// 11. 渲染摘要包含三个必需指标。
{
  const r = stats();
  const text = actions.get('tasks.timelineStats').render(r);
  assert.match(text, /时间线 \d+ 条（有任务 \d+、空线 \d+/);
  assert.match(text, /已归属 \/ \d+ 未归属/);
}

db.close();
console.log('TIMELINE STATS PASS: empty db, empty/single line, order stability, detach/complete/delete/restart, top100 truncation, invariants, trend and validation');
