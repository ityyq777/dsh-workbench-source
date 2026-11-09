/** Real action regression in a temporary WB_HOME; never writes the user's database. */
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { priorityForStatus } from '../packages/addons/tasks/lib/tasks.js';
assert.equal(priorityForStatus('0', undefined, 0), 1); // compatibility export
const home = mkdtempSync(join(tmpdir(), 'wb-restart-'));
process.env.WB_HOME = home;
const cleanups = []; let host;
try {
  const shell = await import('../packages/shell/lib/index.js');
  shell.apply({ provide: (_name, value) => { host = value; }, effect: fn => { const cleanup = fn(); if (typeof cleanup === 'function') cleanups.push(cleanup); }, tools: { register() {} }, webServer: { register() {} }, systemPrompt: { section() {}, getSectionOrder: () => 500 }, commands: { register() {} }, agents: { get() {} }, connection: { requestRejection() {} } });
  (await import('../packages/addons/tasks/lib/index.js')).apply({ workbench: host, effect: fn => { const cleanup = fn(); if (typeof cleanup === 'function') cleanups.push(cleanup); } });
  const call = (action, args) => host.invoke(action, args, 'agent');
  const get = async id => (await call('tasks.get', { id })).result.task;

  const original = (await call('tasks.create', { title: 'P7 original', priority: 7 })).result.task;
  const inherited = (await call('tasks.create', { title: 'P7 restart', source: 2, restartKey: original.id, priority: original.priority })).result.task;
  assert.equal(inherited.priority, 7); assert.equal(inherited.status, '0');
  const defaulted = (await call('tasks.create', { title: 'Default restart', source: 2, restartKey: inherited.id })).result.task;
  assert.equal(defaulted.priority, 1);
  await assert.rejects(() => call('tasks.create', { title: 'Invalid restart', source: 2, restartKey: defaulted.id, priority: 0 }), /重启任务.*1–10.*已完成.*已关闭/);
  assert.equal((await get(defaulted.id)).status, '0', 'rejected create has no transition side effect');
  for (const status of ['1', '2']) {
    const active = (await call('tasks.create', { title: 'Transition ' + status, priority: 7 })).result.task;
    const changed = await call('tasks.update', { id: active.id, type: 'STATUS', status });
    assert.ok(changed.result); assert.equal((await get(active.id)).priority, 0);
    const restarted = (await call('tasks.create', { title: 'Restart zero origin', source: 2, restartKey: active.id })).result.task;
    assert.equal(restarted.priority, 1); assert.equal(restarted.status, '0');
  }
  const help = await call('actions.help', { action: 'tasks.create' });
  assert.match(JSON.stringify(help), /重启需优先级 >0/);
  const capabilities = await call('capabilities.get', { domain: 'tasks' });
  assert.match(JSON.stringify(capabilities), /重启需优先级 >0/);
  console.log('TASK RESTART BACKEND PASS', { inherited: 7, missingPriority: 1, zeroRejected: true, closedAndDoneCleared: true, realDatabaseTouched: false });
} finally {
  for (const cleanup of cleanups.reverse()) cleanup();
  assert.ok(resolve(home).startsWith(resolve(tmpdir()) + '/wb-restart-'));
  rmSync(home, { recursive: true, force: true });
}
