/** Registered actions against isolated SQLite; never writes a production database. */
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { setup } from '../packages/addons/tasks/lib/index.js';
import { addDays, todayStr } from '../packages/addons/tasks/lib/db/db.js';
import { renderList } from '../packages/addons/tasks/lib/task/read/task-view.js';
const db = new DatabaseSync(':memory:'), actions = new Map();
setup({ db, addon: { version: 'test' }, log() {}, hasDomain: () => false, action: (name, def) => actions.set(name, def) });
const call = (name, args = {}) => actions.get(name).execute(args, { origin: 'agent' });
const list = args => call('tasks.list', { sort: 'created', pageSize: 200, ...args });
const ids = result => result.records.map(r => r.id).sort();
const day = '2026-07-01';
try {
  db.exec("INSERT INTO task_node(id,name,type,parent_id,path,created_at,updated_at) VALUES('filters','Filters','1','1','/1/filters/',0,0),('empty','Empty','0','1','/1/empty/',0,0)");
  const insert = db.prepare('INSERT INTO task(id,title,status,table_id,publish_date,target_date,done_date,shutdown_date,priority,created_at,updated_at,deleted_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)');
  const add = (id, status, priority = 1, target = '9999-12-31', publish = day, done = day, shutdown = day, deleted = null) => insert.run(id, id, String(status), 'filters', publish, target, done, shutdown, priority, 0, 0, deleted);
  add('active', 0); add('urgent-priority', 0, 6); add('urgent-date', 0, 1, addDays(todayStr(), 2));
  add('not-urgent-date', 0, 5, addDays(todayStr(), 3));
  add('closed', 1, 9); add('done-a', 2, 9); add('done-b', 2, 1, '9999-12-31', '2026-06-30');
  add('restarted', 3, 9); add('deleted', 2, 9, day, day, day, day, 123);
  add('done-no-date', 2, 1, '9999-12-31', day, null);
  const all = ['active','urgent-priority','urgent-date','not-urgent-date','closed','done-a','done-b','restarted','done-no-date'].sort();
  for (const args of [{ statuses: [] }, { urgent: false }, { statuses: [], urgent: false, tab: 5 }, { statuses: [], tab: 'invalid', filterRestarted: true }]) {
    const result = list(args); assert.deepEqual(ids(result), all); assert.deepEqual(result.filter.statuses, []); assert.equal(result.filter.urgent, false);
    assert.equal(result.filter.tab, 8); assert.equal(result.filter.tabGiven, undefined); assert.equal(result.filter.filterRestarted, undefined);
  }
  assert.deepEqual(ids(list({ statuses: [3], filterRestarted: true, tab: 7 })), ['restarted']);
  assert.deepEqual(ids(list({ statuses: [1, 3, 1] })), ['closed','restarted']);
  assert.deepEqual(list({ statuses: [1, 3, 1] }).filter.statuses, [1, 3]);
  assert.deepEqual(ids(list({ urgent: true })), ['urgent-date','urgent-priority']);
  assert.deepEqual(ids(list({ statuses: [1, 3], urgent: true })), ['closed','restarted','urgent-date','urgent-priority']);
  assert.equal(list({ statuses: [0], urgent: true }).total, 4, 'OR does not duplicate urgent active tasks');
  assert.equal(list({ statuses: [1, 2], status: 3 }).total, 0, 'legacy direct status stays AND');
  for (const statuses of [null, '2', 2, {}, ['2'], [4], [-1], [1.2], [false]]) for (const action of ['tasks.list','tasks.export']) assert.throws(() => call(action, { statuses }), /statuses/);
  for (const urgent of [null, 'false', 0, 1, {}]) for (const action of ['tasks.list','tasks.export']) assert.throws(() => call(action, { urgent }), /urgent/);
  for (const [tab, expected] of [[0,['urgent-date','urgent-priority']], [5,['closed']], [6,['active','not-urgent-date','urgent-date','urgent-priority']], [7,['done-a','done-b','done-no-date']]]) assert.deepEqual(ids(list({ tab })), expected);
  assert.deepEqual(ids(list({ tab: 5, filterRestarted: false })), ['restarted']);
  assert.equal(list({ tab: 8 }).total, all.length - 1); assert.equal(list({ tab: 'all', filterRestarted: false }).total, all.length);
  for (const tab of [1, 2, 3, 4]) { assert.equal(list({ tab }).total, 0); assert.equal(list({ tab, statuses: [3] }).total, 1); }
  const calendar = call('tasks.activityCalendar', { year: 2026 });
  for (const cell of calendar.days) for (const kind of ['publish','done','shutdown']) {
    const args = { statuses: kind === 'done' ? [2] : kind === 'shutdown' ? [1] : [], [kind + 'From']: cell.date, [kind + 'To']: cell.date };
    const result = list(args); assert.equal(result.total, cell[kind], 'heatmap same-day count ' + kind);
    assert.equal(list({ activityDate: cell.date, activityType: kind, tab: 'all', filterRestarted: false }).total, result.total, 'legacy activity same count');
    const exported = call('tasks.export', args); assert.equal(exported.count, result.total); assert.deepEqual(JSON.parse(exported.content).tasks.map(t => t.id).sort(), ids(result));
  }
  assert.deepEqual(ids(list({ statuses: [0,1,2,3], doneFrom: day, doneTo: day })), ['done-a','done-b'], 'stale done dates in other statuses excluded');
  assert.deepEqual(ids(list({ statuses: [], shutdownFrom: day, shutdownTo: day })), ['closed'], 'stale shutdown dates excluded');
  assert.deepEqual(ids(list({ statuses: [2], publishFrom: day, publishTo: day, doneFrom: day, doneTo: day })), ['done-a']);
  assert.equal(list({ statuses: [1,2], publishFrom: day, doneFrom: day, shutdownFrom: day }).total, 0, 'all three groups AND');
  assert.equal(list({ statuses: [2], doneFrom: day, activityDate: '2026-07-02' }).total, 0, 'activity AND remains supported');
  assert.equal(list({ statuses: [2], doneFrom: day, titleKey: 'done-b', tableId: 'filters' }).total, 1);
  for (const kind of ['publish','done','shutdown']) {
    const fromKey = kind + 'From', toKey = kind + 'To';
    const next = '2026-07-02', prev = '2026-06-30';
    assert.equal(list({ statuses: [], [fromKey]: next }).total, 0);
    assert.equal(list({ statuses: [], [toKey]: prev }).total, kind === 'publish' ? 1 : 0);
    for (const empty of ['', null, undefined]) assert.equal(list({ statuses: [], [fromKey]: empty, [toKey]: empty }).total, all.length);
    for (const field of [fromKey, toKey]) for (const bad of ['2023-02-29','1900-02-29','2024-04-31','2024-13-01','2024-00-01','2024-01-00','2024-1-01','0000-01-01','10000-01-01','2024-03-01T00:00:00',' 2024-03-01',' ',1,{},false]) {
      for (const action of ['tasks.list','tasks.export']) assert.throws(() => call(action, { [field]: bad }), new RegExp(field));
    }
    for (const valid of ['0001-01-01','1899-12-31','2000-02-29','2024-02-29','9999-12-31']) assert.equal(list({ [fromKey]: valid }).filter[fromKey], valid);
    const reversed = { statuses: [], [fromKey]: next, [toKey]: prev };
    for (const extra of [{}, { titleKey: 'absent' }, { groupId: 'empty' }]) {
      const result = list({ ...reversed, ...extra });
      assert.equal(result.filter[fromKey], prev); assert.equal(result.filter[toKey], next);
      assert.deepEqual(result.notices, [{ code: kind + '_range_swapped', field: fromKey + '/' + toKey, message: { publish: '发布', done: '完成', shutdown: '关闭' }[kind] + '日期起始晚于终止，已交换', [fromKey]: prev, [toKey]: next }]);
      for (const format of ['json','csv','markdown']) {
        const exported = call('tasks.export', { ...reversed, ...extra, format });
        assert.equal(exported.count, result.total); assert.deepEqual(exported.notices, result.notices);
        assert.equal(exported.filter[fromKey], prev); assert.equal(exported.filter[toKey], next);
      }
    }
  }
  const notices = list({ statuses: [], publishFrom: '2026-07-02', publishTo: day, doneFrom: '2026-07-02', doneTo: day, shutdownFrom: '2026-07-02', shutdownTo: day });
  assert.deepEqual(notices.notices.map(n => n.code), ['publish_range_swapped','done_range_swapped','shutdown_range_swapped']);
  const page = list({ statuses: [2], doneFrom: day, pageSize: 1, pageNumber: 2 }); assert.equal(page.total, 2); assert.equal(page.returned, 1);
  assert.equal(call('tasks.export', { statuses: [2], doneFrom: day }).count, 2);
  assert.equal(call('tasks.export', { ids: ['active'], statuses: 'invalid', doneFrom: 'invalid' }).count, 1, 'explicit ids still bypass filters');
  for (const action of ['tasks.list','tasks.export']) for (const field of ['statuses','urgent','doneFrom','doneTo','shutdownFrom','shutdownTo']) assert.ok(actions.get(action).input.properties[field], action + ' declares ' + field);
  assert.match(renderList(list({ statuses: [2], doneFrom: day })), /状态多选=2.*完成日>=2026-07-01/);
  assert.match(renderList(list({ statuses: [1], shutdownTo: day })), /关闭日<=2026-07-01/);
  // Legacy timestamp values use the same date-prefix rule as publish ranges.
  add('done-timestamp', 2, 1, '9999-12-31', day, day + 'T23:59:59+08:00');
  add('closed-timestamp', 1, 1, '9999-12-31', day, null, day + 'T23:59:59+08:00');
  assert.equal(list({ statuses: [], doneFrom: day, doneTo: day }).total, 3);
  assert.equal(list({ statuses: [], shutdownFrom: day, shutdownTo: day }).total, 2);
  console.log('MULTI FILTER PASS: statuses/urgent OR, legacy tab/activity, all dates AND, strict validation, swaps/filter/notices, heatmap counts, export/schema, paging and timestamps');
} finally { db.close(); }
