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
  for (const args of [{ statuses: [] }, { urgent: false }, { statuses: [], urgent: false }]) {
    const result = list(args); assert.deepEqual(ids(result), all); assert.deepEqual(result.filter.statuses, []); assert.equal(result.filter.urgent, false);
    assert.equal(result.filter.tab, undefined); assert.equal(result.filter.filterRestarted, undefined);
  }
  assert.deepEqual(ids(list({ statuses: [3] })), ['restarted']);
  assert.deepEqual(ids(list({ statuses: [1, 3, 1] })), ['closed','restarted']);
  assert.deepEqual(list({ statuses: [1, 3, 1] }).filter.statuses, [1, 3]);
  assert.deepEqual(ids(list({ urgent: true })), ['urgent-date','urgent-priority']);
  assert.deepEqual(ids(list({ statuses: [1, 3], urgent: true })), ['closed','restarted','urgent-date','urgent-priority']);
  assert.equal(list({ statuses: [0], urgent: true }).total, 4, 'OR does not duplicate urgent active tasks');
  assert.equal(list({ statuses: [1, 2], status: 3 }).total, 0, 'legacy direct status stays AND');
  for (const statuses of [null, '2', 2, {}, ['2'], [5], [-1], [1.2], [false]]) for (const action of ['tasks.list','tasks.export']) assert.throws(() => call(action, { statuses }), /statuses/);
  assert.equal(list({ statuses: [4] }).total, 0, 'claimed status accepted even with no rows');
  for (const urgent of [null, 'false', 0, 1, {}]) for (const action of ['tasks.list','tasks.export']) assert.throws(() => call(action, { urgent }), /urgent/);
  // 旧页签参数已移除：必须报错并给出 statuses 迁移写法，而不是静默按旧语义过滤。
  for (const [tab, hint] of [[0, /priorityMin=8/], [1, /tags:\['工作'\]/], [5, /statuses:\[1\]/], [7, /statuses:\[2\]/], [8, /statuses:\[\]/], [9, /statuses:\[4\]/]]) {
    for (const action of ['tasks.list','tasks.export']) assert.throws(() => call(action, { tab }), /tab 参数已移除/);
    assert.throws(() => list({ tab }), hint);
  }
  assert.throws(() => list({ tab: 'all' }), /tab 参数已移除/);
  assert.throws(() => list({ tab: 99 }), /tab 参数已移除/);
  for (const action of ['tasks.list','tasks.export']) assert.throws(() => call(action, { filterRestarted: false }), /filterRestarted 参数已移除/);
  assert.deepEqual(ids(list({ statuses: [1] })), ['closed']);
  assert.equal(list({}).total, all.length);
  assert.equal(list({ statuses: [] }).total, all.length);
  const calendar = call('tasks.activityCalendar', { year: 2026 });
  for (const cell of calendar.days) for (const kind of ['publish','done','shutdown']) {
    const args = { statuses: kind === 'done' ? [2] : kind === 'shutdown' ? [1] : [], [kind + 'From']: cell.date, [kind + 'To']: cell.date };
    const result = list(args); assert.equal(result.total, cell[kind], 'heatmap same-day count ' + kind);
    assert.equal(list({ activityDate: cell.date, activityType: kind, statuses: [] }).total, result.total, 'activity day scoped to all statuses matches aggregated cell');
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
  // 难度/优先级区间：NULL 视作 0，下界为 0 时把未填难度的任务一并算入。
  const setDifficulty = (id, value) => db.prepare('UPDATE task SET difficulty=? WHERE id=?').run(value, id);
  setDifficulty('active', null); setDifficulty('urgent-priority', 3); setDifficulty('not-urgent-date', 0);
  setDifficulty('closed', 5); setDifficulty('done-a', 2.5); setDifficulty('done-b', null);
  const oracle = sql => db.prepare('SELECT id FROM task WHERE deleted_at IS NULL AND ' + sql).all().map(r => r.id).sort();
  const difficulty = args => ids(list({ statuses: [], ...args }));
  assert.deepEqual(difficulty({ difficultyMin: 3, difficultyMax: 5 }), oracle("difficulty BETWEEN 3 AND 5"), 'min>0 excludes unset and lower half steps');
  assert.deepEqual(difficulty({ difficultyMax: 3 }), oracle("(difficulty IS NULL OR difficulty<=3)"), 'upper bound counts NULL as 0');
  assert.deepEqual(difficulty({ difficultyMin: 0, difficultyMax: 3 }), oracle("(difficulty IS NULL OR difficulty BETWEEN 0 AND 3)"), 'explicit 0 lower bound keeps NULL');
  assert.deepEqual(difficulty({ difficultyMin: 0 }), oracle("(difficulty IS NULL OR difficulty>=0)"), 'lower bound 0 keeps everything');
  assert.deepEqual(difficulty({ difficultyMin: 2.5 }), oracle("difficulty>=2.5"), 'half steps are accepted');
  const upper = difficulty({ difficultyMax: 3 });
  assert.ok(upper.includes('active') && upper.includes('done-b'), 'unset difficulty is inside a 0-based upper bound');
  assert.ok(!upper.includes('closed'), 'difficulty 5 stays outside an upper bound of 3');
  assert.ok(!difficulty({ difficultyMin: 3 }).includes('active'), 'unset difficulty is outside a positive lower bound');
  assert.equal(list({ statuses: [], difficultyMin: 3 }).filter.difficultyMin, 3);
  assert.equal(list({ statuses: [], difficultyMax: 3 }).filter.difficultyMax, 3);
  assert.equal(list({ statuses: [] }).filter.difficultyMin, undefined, 'no echo without the parameter');
  // 优先级区间与「紧急」口径：6–10 是前端快捷条件，走后端 priorityMin/Max。
  assert.deepEqual(ids(list({ statuses: [], priorityMin: 6, priorityMax: 10 })), oracle("priority BETWEEN 6 AND 10"), 'priority range independent of status');
  assert.deepEqual(ids(list({ statuses: [0], priorityMin: 6, priorityMax: 10 })), ids(list({ statuses: [0], priorityMin: 6 })).filter(id => db.prepare('SELECT priority FROM task WHERE id=?').get(id).priority <= 10), 'urgent shortcut is priority AND statuses');
  const legacyUrgent = ids(list({ statuses: [0], urgent: true }));
  assert.ok(legacyUrgent.includes('urgent-date') && legacyUrgent.includes('active'), 'legacy urgent ORs statuses with the due-date rule');
  assert.ok(!ids(list({ statuses: [0], priorityMin: 6, priorityMax: 10 })).includes('urgent-date'), 'priority shortcut drops the due-date rule');
  assert.equal(list({ statuses: [], priorityMin: 4, priorityMax: 8 }).filter.priorityMax, 8);
  for (const bad of [6, -1, 5.5, -0.5, 'abc', {}]) for (const action of ['tasks.list','tasks.export']) assert.throws(() => call(action, { difficultyMax: bad }), /difficultyMax/);
  for (const bad of [11, -1, 'abc', {}]) for (const action of ['tasks.list','tasks.export']) assert.throws(() => call(action, { priorityMin: bad }), /priorityMin/);
  assert.equal(list({ statuses: [], priorityMin: 1.5 }).filter.priorityMin, 2, 'priority keeps its historical rounding');
  for (const action of ['tasks.list','tasks.export']) for (const field of ['priorityMin','priorityMax','difficultyMin','difficultyMax']) assert.ok(actions.get(action).input.properties[field], action + ' declares ' + field);
  assert.match(renderList(list({ statuses: [], priorityMin: 6, difficultyMin: 3 })), /P>=6.*难度>=3/);
  assert.match(renderList(list({ statuses: [], difficultyMin: 2, difficultyMax: 4 })), /难度2–4/);
  console.log('MULTI FILTER PASS: statuses/urgent OR, legacy tab/activity, all dates AND, strict validation, swaps/filter/notices, heatmap counts, export/schema, paging and timestamps');
} finally { db.close(); }
