/** Daily activity contract: in-memory SQLite only; no live workbench writes. */
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { ensureSchema, todayStr } from '../packages/addons/tasks/lib/db/db.js';
import { registerTaskActions } from '../packages/addons/tasks/lib/tasks.js';

const db = new DatabaseSync(':memory:');
try {
  ensureSchema(db, () => {});
  const definitions = new Map();
  registerTaskActions({ db, action: (name, def) => definitions.set(name, def) });
  const call = (name, args = {}) => definitions.get(name).execute(args);
  const date = todayStr();
  const empty = { date, published: 0, done: 0, shutdown: 0, claimed: 0, avgDifficultyDone: null, avgSample: 0 };
  assert.deepEqual(call('tasks.statsReport').today, empty);
  assert.deepEqual(call('tasks.stats').todayActivity, empty);
  assert.equal(call('tasks.stats').today, 0);

  let serial = 0;
  const insert = (patch = {}) => {
    const row = { id: String(++serial), status: '0', difficulty: null, publish: '2000-01-01', done: null, shutdown: null, claimed: null, deleted: null, ...patch };
    db.prepare('INSERT INTO task(id,title,table_id,status,priority,difficulty,publish_date,target_date,done_date,shutdown_date,claimed_at,deleted_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
      .run(row.id, 'daily fixture', 'fixture-table', row.status, 1, row.difficulty, row.publish, date, row.done, row.shutdown, row.claimed, row.deleted, Date.now(), Date.now());
  };
  // Publication counts all current statuses, including restarted; stored timestamps keep their literal date.
  for (const status of ['0', '1', '2', '3']) insert({ status, publish: date + 'T23:59:59-12:00' });
  insert({ status: '2', done: date, difficulty: 1 });
  insert({ status: '2', done: date + ' 09:15:00', difficulty: 2 });
  insert({ status: '2', done: date + 'T23:59:59Z', difficulty: 2 });
  insert({ status: '2', done: date, difficulty: 0 });
  insert({ status: '2', done: date, difficulty: null });
  insert({ status: '1', shutdown: date });
  insert({ status: '1', shutdown: date + ' 23:59:59' });
  // Stale event dates on other current statuses must not count as completed/closed today.
  for (const status of ['0', '1', '3']) insert({ status, done: date, difficulty: 5 });
  for (const status of ['0', '2', '3']) insert({ status, shutdown: date, difficulty: 5 });
  insert({ status: '2', publish: date, done: date, difficulty: 5, deleted: 1 });
  insert({ status: '1', publish: date, shutdown: date, deleted: 1 });
  insert({ status: '2', done: '2000-01-01 12:00:00', difficulty: 5 });
  insert({ status: '1', shutdown: '2000-01-01T12:00:00Z' });
  // 接取日优先用 claimed_at（本地日）；已接取同样按 COALESCE 兜底计入。
  insert({ status: '2', done: '2000-01-01', claimed: Date.parse(date + 'T12:00:00') });
  insert({ status: '4', claimed: Date.parse(date + 'T23:30:00') });
  insert({ status: '4', claimed: Date.parse('2000-01-01T12:00:00'), deleted: 1 });
  const expected = { date, published: 4, done: 5, shutdown: 2, claimed: 3, avgDifficultyDone: 1.7, avgSample: 3 };
  const before = db.prepare('SELECT total_changes() AS n').get().n;
  for (const args of [{}, ...['7d', '30d', '90d', '365d', 'all'].map(range => ({ range })), { from: '2000-01-01', to: '2000-01-02' }]) {
    assert.deepEqual(call('tasks.statsReport', args).today, expected, JSON.stringify(args));
  }
  const stats = call('tasks.stats');
  assert.deepEqual(stats.todayActivity, expected);
  assert.equal(typeof stats.today, 'number', 'legacy today remains the due-today counter');
  assert.equal(stats.today, stats.active);
  const grouped = call('tasks.stats', { groupBy: 'status', from: '2000-01-01', to: '2000-01-02' });
  assert.deepEqual(grouped.groups, []);
  assert.deepEqual(grouped.todayActivity, expected);
  for (const key of ['open', 'active', 'shutdown', 'done', 'restarted', 'overdue', 'today']) assert.equal(grouped[key], stats[key]);
  assert.equal(db.prepare('SELECT total_changes() AS n').get().n, before, 'statistics remain read-only');

  db.prepare("UPDATE task SET difficulty=0 WHERE status='2' AND difficulty>0").run();
  assert.deepEqual(call('tasks.statsReport').today, { ...expected, avgDifficultyDone: null, avgSample: 0 });
  db.prepare("UPDATE task SET difficulty=NULL WHERE status='2'").run();
  assert.deepEqual(call('tasks.stats').todayActivity, { ...expected, avgDifficultyDone: null, avgSample: 0 });
  for (const name of ['tasks.stats', 'tasks.statsReport']) {
    const description = definitions.get(name).description;
    for (const term of ['published', 'done', 'shutdown', 'avgDifficultyDone', 'avgSample', 'difficulty>0', 'null', 'range/from/to', '软删除', '服务端本地日期']) assert.ok(description.includes(term), name + ': ' + term);
  }
  console.log('TODAY STATS BACKEND PASS: timestamps, all publication statuses, current event status, soft deletion, positive-only rounded average, null/zero samples, independent ranges, legacy counters/groups, read-only and action contracts');
} finally {
  db.close();
}
