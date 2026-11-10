/** 工作区实体与任务多对多验收：隔离 SQLite，不触碰真实库。 */
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
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

// 迁移：schema 版本递增，两表存在
assert.equal(env.db.prepare("SELECT v FROM meta WHERE k='task_schema_version'").get().v, '6');
for (const name of ['task_workspace', 'task_workspace_link']) {
  assert.ok(env.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(name), name + ' 表应存在');
}

// CRUD 与目录校验
const ws = env.call('taskWorkspaces.create', { title: 'DSH 仓库', name: 'dsh', description: '本地源码', dir: '/Users/yyq/code/dsh-workbench' }).workspace;
assert.ok(ws.id);
assert.equal(ws.dir, '/Users/yyq/code/dsh-workbench');
assert.throws(() => env.call('taskWorkspaces.create', { title: '坏目录', dir: 'relative/path' }), /绝对路径/);
assert.throws(() => env.call('taskWorkspaces.create', { title: '' }), /title/);
const w2 = env.call('taskWorkspaces.create', { title: '纯逻辑分组' }).workspace;
assert.equal(w2.dir, null);
const win = env.call('taskWorkspaces.create', { title: 'Windows', dir: 'D:\\work\\x' }).workspace;
assert.equal(win.dir, 'D:\\work\\x');

const got = env.call('taskWorkspaces.get', { id: ws.id });
assert.equal(got.workspace.title, 'DSH 仓库');
assert.equal(got.taskCount, 0);
env.call('taskWorkspaces.update', { id: ws.id, title: 'DSH 主仓', dir: null });
assert.equal(env.call('taskWorkspaces.get', { id: ws.id }).workspace.dir, null);
assert.equal(env.call('taskWorkspaces.get', { id: ws.id }).workspace.title, 'DSH 主仓');

// 多对多：任务挂多个工作区，工作区可挂多个任务
const t1 = create('任务一', { workspaceIds: [ws.id, w2.id] });
const t2 = create('任务二', { workspaceIds: [ws.id] });
const t3 = create('任务三');
assert.deepEqual(t1.workspaces.map(w => w.id).sort(), [ws.id, w2.id].sort());
assert.equal(env.call('taskWorkspaces.get', { id: ws.id }).taskCount, 2);
assert.equal(env.call('tasks.get', { id: t1.id }).task.workspaces.length, 2);

// create 带不存在的工作区整体失败
assert.throws(() => create('坏关联', { workspaceIds: ['nope'] }), /工作区不存在/);
assert.equal(env.db.prepare("SELECT COUNT(*) n FROM task WHERE title='坏关联'").get().n, 0);

// 列表筛选：workspaceIds OR / noWorkspace
const byWs = env.call('tasks.list', { workspaceIds: [w2.id] });
assert.deepEqual(byWs.records.map(r => r.id), [t1.id]);
assert.deepEqual(byWs.filter.workspaceIds, [w2.id]);
const none = env.call('tasks.list', { noWorkspace: true });
assert.ok(none.records.some(r => r.id === t3.id));
assert.ok(!none.records.some(r => r.id === t1.id));
assert.throws(() => env.call('tasks.list', { workspaceIds: [ws.id], noWorkspace: true }), /互斥/);

// update 整体替换关联
env.call('tasks.update', { id: t1.id, workspaceIds: [w2.id] });
assert.deepEqual(env.call('tasks.get', { id: t1.id }).task.workspaces.map(w => w.id), [w2.id]);
assert.equal(env.call('taskWorkspaces.get', { id: ws.id }).taskCount, 1);
env.call('tasks.update', { id: t1.id, workspaceIds: [] });
assert.equal(env.call('tasks.get', { id: t1.id }).task.workspaces.length, 0);

// attach/detach 幂等
const att = env.call('taskWorkspaces.attach', { workspaceId: w2.id, taskIds: [t1.id, t1.id, 'missing'] });
assert.equal(att.attached.length, 1);
assert.deepEqual(att.existing, []);
assert.equal(att.failed[0].reason, 'not_found');
const att2 = env.call('taskWorkspaces.attach', { workspaceId: w2.id, taskIds: [t1.id] });
assert.equal(att2.attached.length, 0);
assert.equal(att2.existing.length, 1);
assert.equal(env.call('taskWorkspaces.get', { id: w2.id }).taskCount, 1);
const det = env.call('taskWorkspaces.detach', { workspaceId: w2.id, taskIds: [t1.id, 'nope'] });
assert.deepEqual(det.missing, ['nope']);
assert.equal(env.call('taskWorkspaces.get', { id: w2.id }).taskCount, 0);
assert.equal(env.call('taskWorkspaces.detach', { workspaceId: w2.id, taskIds: [t1.id] }).detached.length, 0);

// 删除任务连带软删 link；删除工作区不影响任务
env.call('taskWorkspaces.attach', { workspaceId: ws.id, taskIds: [t2.id] });
const alive = create('删除工作区时仍存活', { workspaceIds: [ws.id] });
env.call('tasks.delete', { id: t2.id });
assert.equal(env.db.prepare("SELECT COUNT(*) n FROM task_workspace_link WHERE task_id=? AND deleted_at IS NULL").get(t2.id).n, 0);
const preview = env.call('taskWorkspaces.delete', { id: ws.id, dryRun: true });
assert.equal(preview.dryRun, true);
assert.equal(preview.affectedLinks, 1);
assert.deepEqual(preview.taskIds, [alive.id]);
env.call('taskWorkspaces.delete', { id: ws.id });
assert.throws(() => env.call('taskWorkspaces.get', { id: ws.id }), e => e.code === 'WORKSPACE_DELETED');
const t2Row = env.db.prepare('SELECT deleted_at FROM task WHERE id=?').get(t2.id);
assert.ok(t2Row.deleted_at !== null, '删除工作区不应复活已删任务');

// live join：已删工作区的关联不可见
env.call('taskWorkspaces.attach', { workspaceId: w2.id, taskIds: [t1.id] });
env.call('taskWorkspaces.delete', { id: w2.id });
assert.equal(env.call('tasks.get', { id: t1.id }).task.workspaces.length, 0);
assert.equal(env.call('tasks.list', { workspaceIds: [w2.id] }).total, 0);
assert.equal(env.call('tasks.list', { noWorkspace: true }).records.some(r => r.id === t1.id), true);

// 备份往返：导出带两表；旧版本缺键按空数组
const { exportTasksData, importTasksData } = await import('../packages/addons/tasks/lib/infra/backup.js');
const api = { db: env.db, emit() {} };
const backup = exportTasksData(api);
assert.ok(Array.isArray(backup.taskWorkspaces) && backup.taskWorkspaces.length >= 1);
assert.ok(Array.isArray(backup.taskWorkspaceLinks));
const legacy = Object.assign({}, backup, { schemaVersion: 4 });
delete legacy.taskWorkspaces;
delete legacy.taskWorkspaceLinks;
const restored = importTasksData(api, JSON.stringify(legacy), { policy: 'newest' });
assert.equal(restored.ok, true, restored.message);
const round = importTasksData(api, JSON.stringify(backup), { policy: 'newest' });
assert.equal(round.ok, true, round.message);
assert.ok(round.tables.task_workspace, '备份往返应包含 task_workspace 表统计');
const badLink = importTasksData(api, JSON.stringify(Object.assign({}, backup, {
  taskWorkspaceLinks: [{ id: 'bad', workspace_id: 'a', task_id: 'b', created_at: 1, updated_at: 1, deleted_at: null, rev: 1 }],
})), { policy: 'overwrite' });
assert.equal(badLink.ok, false);
assert.match(badLink.message, /WORKSPACE_LINK_ID_MISMATCH/);

// sync 声明：workspace 在 link 前，link normalize 校验 id 规则
const { taskSync } = await import('../packages/addons/tasks/lib/infra/sync.js');
const names = taskSync.tables.map(t => t.name);
assert.ok(names.indexOf('task_workspace') >= 0 && names.indexOf('task_workspace') < names.indexOf('task_workspace_link'));
const linkTable = taskSync.tables.find(t => t.name === 'task_workspace_link');
const normalized = linkTable.normalizeIncoming({ workspace_id: 'w1', task_id: 't1', updated_at: 1 });
assert.equal(normalized.id, 'w1:t1');
assert.throws(() => linkTable.normalizeIncoming({ id: 'x:y', workspace_id: 'w1', task_id: 't1' }), e => e.code === 'WORKSPACE_LINK_ID_MISMATCH');
assert.throws(() => linkTable.normalizeIncoming({ workspace_id: '', task_id: 't1' }), e => e.code === 'WORKSPACE_LINK_INVALID');

console.log('WORKSPACES PASS: crud, dir validation, m:n, replace, cascade, live join, filters, backup, sync');
