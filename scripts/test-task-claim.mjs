/** 接取状态与 CAS claim/claimBatch/grab 验收：隔离 SQLite，不触碰真实库。 */
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setup } from '../packages/addons/tasks/lib/index.js';

function boot(db) {
  db.exec('CREATE TABLE IF NOT EXISTS sync_change_log(id INTEGER PRIMARY KEY,table_name TEXT,row_id TEXT,op TEXT,payload TEXT,origin TEXT,updated_at INTEGER)');
  const actions = new Map(), events = [];
  setup({ db, addon: { version: 'test' }, log() {}, hasDomain: () => false, emit: (...e) => events.push(e), action: (n, d) => actions.set(n, d) });
  return { db, actions, events, call: (name, args = {}) => actions.get(name).execute(args, { origin: 'agent' }) };
}

const env = boot(new DatabaseSync(':memory:'));
const tableId = env.db.prepare("SELECT id FROM task_node WHERE type='1' AND deleted_at IS NULL ORDER BY id LIMIT 1").get().id;
const create = (title, extra) => env.call('tasks.create', Object.assign({ title, tableId, priority: 7, targetDate: '2026-12-31' }, extra)).task;
const row = id => env.db.prepare('SELECT * FROM task WHERE id=?').get(id);

// 状态机元数据
assert.equal(env.db.prepare("SELECT v FROM meta WHERE k='task_schema_version'").get().v, '4');

// update/bulkUpdate 不允许直接写 4
const u1 = create('直接写四');
assert.throws(() => env.call('tasks.update', { id: u1.id, status: 4 }), /CLAIM_REQUIRED|tasks\.claim/);
assert.throws(() => env.call('tasks.bulkUpdate', { ids: [u1.id], patch: { status: 4 } }), /claimBatch/);
assert.equal(row(u1.id).status, '0');

// 单条接取：保留优先级，写 owner/token
const a = create('接取对象');
const claimed = env.call('tasks.claim', { id: a.id, owner: 'agent:s1' });
assert.equal(claimed.claimed, true);
assert.equal(claimed.previousStatus, '0');
assert.equal(claimed.task.status, '4');
assert.equal(claimed.task.priority, 7);
assert.equal(claimed.task.claimedBy, 'agent:s1');
assert.ok(claimed.claimToken && claimed.task.claimToken);
assert.equal(row(a.id).owner, 'agent:s1');
assert.equal(env.events.at(-1)[0], 'tasks-changed');

// 重复接取/终态/不存在
assert.throws(() => env.call('tasks.claim', { id: a.id }), e => e.code === 'TASK_NOT_CLAIMABLE' && e.status === '4');
const done = create('已完成');
env.call('tasks.update', { id: done.id, status: 2, difficulty: 1 });
assert.throws(() => env.call('tasks.claim', { id: done.id }), e => e.code === 'TASK_NOT_CLAIMABLE');
assert.throws(() => env.call('tasks.claim', { id: 'missing-task' }), e => e.code === 'TASK_NOT_FOUND');
assert.throws(() => env.call('tasks.claim', { id: '' }), /id 不能为空/);

// ABA：带错 token 的写被拒绝，带当前 token 的写成功
assert.throws(() => env.call('tasks.update', { id: a.id, title: '越权', claimToken: 'wrong' }), e => e.code === 'TASK_CLAIM_LOST');
env.call('tasks.update', { id: a.id, title: '合法改名', claimToken: claimed.claimToken });
assert.equal(row(a.id).title, '合法改名');

// 4→2：允许，清空接取字段且 priority=0
env.call('tasks.update', { id: a.id, status: 2, difficulty: 2, claimToken: claimed.claimToken });
const finished = row(a.id);
assert.equal(finished.status, '2');
assert.equal(Number(finished.priority), 0);
assert.equal(finished.owner, null);
assert.equal(finished.claimed_at, null);
assert.equal(finished.claim_token, null);

// 4→1：允许
const b = create('将被关闭');
const cb = env.call('tasks.claim', { id: b.id });
env.call('tasks.update', { id: b.id, status: 1 });
assert.equal(row(b.id).status, '1');
assert.equal(row(b.id).owner, null);
assert.ok(cb.claimToken);

// 1/2/3 → 4 拒绝
const shut = create('已关闭任务');
env.call('tasks.update', { id: shut.id, status: 1 });
assert.throws(() => env.call('tasks.claim', { id: shut.id }), e => e.code === 'TASK_NOT_CLAIMABLE' && e.status === '1');

// 批量：混合成功/已被接取/不存在/已删除，不抛错；dryRun 不写库
const m1 = create('批一'), m2 = create('批二'), m3 = create('批三');
env.call('tasks.claim', { id: m2.id });
env.call('tasks.delete', { id: m3.id });
const beforeDry = env.db.prepare("SELECT COUNT(*) AS n FROM task WHERE status='4'").get().n;
const dry = env.call('tasks.claimBatch', { ids: [m1.id, m2.id, 'missing-x', m3.id], dryRun: true });
assert.equal(dry.dryRun, true);
assert.equal(dry.requested, 4);
assert.equal(dry.claimed.length, 1);
assert.deepEqual(dry.failed.map(f => f.reason).sort(), ['already_claimed', 'deleted', 'not_found'].sort());
assert.equal(env.db.prepare("SELECT COUNT(*) AS n FROM task WHERE status='4'").get().n, beforeDry);
const batchEvents = env.events.length;
const batch = env.call('tasks.claimBatch', { ids: [m1.id, m2.id, 'missing-x', m3.id, m1.id], owner: 'agent:batch' });
assert.equal(batch.requested, 4, 'ids 去重');
assert.equal(batch.claimed.length, 1);
assert.equal(batch.claimed[0].task.claimedBy, 'agent:batch');
assert.deepEqual(batch.counts, { claimed: 1, alreadyClaimed: 1, notClaimable: 0, notFound: 1, deleted: 1, busy: 0 });
assert.equal(env.events.length, batchEvents + 1, '整批只发一次聚合事件');
assert.equal(env.events.at(-1)[1].op, 'claimBatch');
assert.equal(batch.failed.find(f => f.reason === 'already_claimed').status, '4');
assert.equal(env.db.prepare("SELECT COUNT(*) AS n FROM sync_change_log WHERE table_name='task' AND row_id=?").get(m1.id).n, 2);

// grab：从 0 抢、从 4 覆盖并换 token、终态拒绝
const g = create('被抢任务');
const first = env.call('tasks.grab', { id: g.id, owner: 'agent:a', reason: '用户要求接手' });
assert.equal(first.previousStatus, '0');
assert.equal(first.previousOwner, null);
const second = env.call('tasks.grab', { id: g.id, owner: 'agent:b' });
assert.equal(second.previousStatus, '4');
assert.equal(second.previousOwner, 'agent:a');
assert.notEqual(second.claimToken, first.claimToken);
assert.equal(row(g.id).owner, 'agent:b');
assert.throws(() => env.call('tasks.grab', { id: shut.id }), e => e.code === 'TASK_NOT_CLAIMABLE');
assert.throws(() => env.call('tasks.grab', { id: 'missing-y' }), e => e.code === 'TASK_NOT_FOUND');

// 重启语义：已接取视作已开启，转关闭并清空接取字段
const r = create('重启链');
env.call('tasks.claim', { id: r.id });
env.call('taskTimelines.create', { id: 'tl-restart' });
env.call('taskTimelines.attach', { taskId: r.id, timelineId: 'tl-restart' });
const restarted = env.call('tasks.create', { title: '重启后', tableId, source: 2, restartKey: r.id, targetDate: '2026-12-31' });
assert.equal(row(r.id).status, '3', '旧任务被重启链推进到已重启');
assert.equal(row(r.id).owner, null);
assert.equal(restarted.task.status, '0');

// 列表/统计口径
const limited = env.call('tasks.list', { statuses: [4] });
assert.ok(limited.records.every(t => t.status === '4'));
assert.ok(limited.records.some(t => t.id === g.id));

assert.throws(() => env.call('tasks.list', { statuses: [5] }), /statuses 必须是/);
const stats = env.call('tasks.statsReport', {});
assert.ok(stats.totals.claimed >= 1);
const dist = stats.breakdowns.status.find(x => x.key === '4');
assert.ok(dist && dist.label === '已接取' && dist.count === stats.totals.claimed);
assert.equal(stats.totals.active, env.db.prepare("SELECT COUNT(*) AS n FROM task WHERE deleted_at IS NULL AND status='0'").get().n);

// 两条连接并发抢同一条：恰好一个成功
const dir = mkdtempSync(join(tmpdir(), 'claim-cas-'));
const file = join(dir, 'cas.db');
const one = boot(new DatabaseSync(file));
const two = boot(new DatabaseSync(file));
one.db.exec('PRAGMA busy_timeout=5000');
two.db.exec('PRAGMA busy_timeout=5000');
const casTable = one.db.prepare("SELECT id FROM task_node WHERE type='1' AND deleted_at IS NULL ORDER BY id LIMIT 1").get().id;
const target = one.call('tasks.create', { title: '并发目标', tableId: casTable, targetDate: '2026-12-31' }).task;
const outcomes = [one, two].map(e => {
  try { e.call('tasks.claim', { id: target.id, owner: 'agent:c' }); return 'claimed'; }
  catch (error) { return error.code || error.message; }
});
assert.equal(outcomes.filter(x => x === 'claimed').length, 1, '恰好一个连接抢到');
assert.equal(outcomes.filter(x => x === 'TASK_NOT_CLAIMABLE').length, 1, '另一个拿到不可接取');
assert.equal(Number(one.db.prepare('SELECT COUNT(*) AS n FROM task WHERE id=? AND status=?').get(target.id, '4').n), 1);
rmSync(dir, { recursive: true, force: true });

console.log('TASK CLAIM PASS: schema v4, CAS claim, duplicate/terminal guards, ABA token, batch mix+dryRun+single event, grab overwrite, restart, list/stats scope, cross-connection CAS');
