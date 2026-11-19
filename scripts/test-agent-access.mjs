import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

// 两次启动使用同一临时库，不读取用户的权限设置或业务数据。
const home = mkdtempSync(join(tmpdir(), 'wb-agent-access-'));
process.env.WB_HOME = home;
const shell = await import('../packages/shell/lib/index.js');
const tags = await import('../packages/addons/tags/lib/index.js');
const contacts = await import('../packages/addons/contacts/lib/index.js');
function boot() {
  const cleanups = [];
  let host, tool, route;
  const ctx = {
    webServer: { register: r => { if (r.path === '/workbench/api') route = r; return () => {}; } }, tools: { register: def => { tool = def; } },
    connection: { requestRejection() {} }, provide: (name, value) => { if (name === 'workbench') host = value; },
    effect: fn => { const d = fn(); if (typeof d === 'function') cleanups.push(d); },
  };
  shell.apply(ctx);
  for (const addon of [tags, contacts]) addon.apply({ workbench: host, effect: ctx.effect });
  async function call(name, args = {}, origin = 'agent') {
    if (origin === 'plugin') return (await host.invoke(name, args)).result;
    if (origin === 'agent') {
      const { text } = await tool.execute({ action: name, args });
      if (text.startsWith('错误')) throw new Error(text);
      return text;
    }
    const owner = host.actionNames().find(x => x.name === name).domainId;
    let result;
    await route.handler({ method: 'POST', url: '/workbench/api/domains/' + owner + '/actions/' + name,
      headers: {}, async *[Symbol.asyncIterator]() { yield Buffer.from(JSON.stringify(args)); } },
    { writeHead() {}, end(text) { result = JSON.parse(text); } });
    if (!result.ok) throw new Error(result.error);
    return result.result;
  }
  return { call, tool, close: () => cleanups.reverse().forEach(fn => fn()) };
}
const action = 'tags.create', setter = 'actions.setAgentAccess';
let env, db;
try {
  env = boot();
  db = new DatabaseSync(join(home, 'workbench.db'));
  const count = () => db.prepare('SELECT COUNT(*) AS n FROM sync_change_log').get().n;
  const set = (enabled, origin = 'ui') => env.call(setter, { action, agentEnabled: enabled }, origin);
  const entries = async (name, origin) => (await env.call(name, {}, origin)).actions;
  assert.equal((await entries('actions.list', 'ui')).find(x => x.name === action).agentEnabled, true);
  const contact = 'contacts.create';
  assert.equal((await entries('contacts.actionSchema', 'ui')).find(x => x.name === contact).agentEnabled, false);
  await assert.rejects(env.call(contact, { name: '默认禁止' }), /ACTION_AGENT_DISABLED/);
  await env.call(setter, { action: contact, agentEnabled: true }, 'ui');
  await env.call(contact, { name: '手动开放后可用' });
  await assert.rejects(env.call(contact, { name: '其他来源不被放开' }, 'plugin'));
  await env.call(setter, { action: contact, agentEnabled: false }, 'ui');
  await assert.rejects(env.call(contact, { name: '恢复默认' }), /ACTION_AGENT_DISABLED/);
  const initial = count();
  await set(false);
  assert.equal(count(), initial);
  assert.equal((await entries('tags.actionSchema', 'ui')).find(x => x.name === action).agentEnabled, false);
  for (const list of ['tags.actionSchema', 'actions.list']) assert(!(await env.call(list)).includes(action));
  await assert.rejects(env.call('actions.help', { action }));
  await assert.rejects(env.call(action, { name: '不应创建' }), /ACTION_AGENT_DISABLED/);
  assert.match((await env.tool.execute({ action, args: { name: '工具也不应创建' } })).text, /ACTION_AGENT_DISABLED/);
  await assert.rejects(set(true, 'agent'));
  await assert.rejects(env.call(setter, { action: setter, agentEnabled: true }, 'ui'));
  await assert.rejects(env.call(setter, { action, agentEnabled: 'false' }, 'ui'));
  assert.equal(count(), initial);
  await env.call(action, { name: '界面可创建' }, 'ui');
  const audit = (await env.call('audit.list', { action }, 'ui')).records;
  assert(audit.some(x => x.actor === 'ui' && x.ok));
  assert(audit.some(x => x.actor === 'agent' && !x.ok));
  env.close(); env = boot();
  await assert.rejects(env.call(action, { name: '跨重启仍关闭' }), /ACTION_AGENT_DISABLED/);
  const beforeRestore = count();
  await set(true);
  assert.equal(count(), beforeRestore);
  await env.call(action, { name: '恢复后可创建' });
  console.log('PASS: 实际工具、宿主与本域发现、UI 不受限、权限不可自授、审计、重启持久化、无同步写入');
} finally {
  db?.close(); env?.close();
  if (dirname(home) === tmpdir() && home.split('/').pop().startsWith('wb-agent-access-')) rmSync(home, { recursive: true, force: true });
}
