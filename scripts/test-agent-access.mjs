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
const action = 'tags.create', contact = 'contacts.create', setter = 'actions.setActionOrigins';
let env, db;
try {
  env = boot();
  db = new DatabaseSync(join(home, 'workbench.db'));
  const count = () => db.prepare('SELECT COUNT(*) AS n FROM sync_change_log').get().n;
  const set = (origins, target = action, origin = 'ui') => env.call(setter, { action: target, origins }, origin);
  const entries = async (name, origin) => (await env.call(name, {}, origin)).actions;
  const find = (list, name) => list.find(x => x.name === name);
  // 插件路径直接把 Error 抛出来（带 code），工具路径把 code 拼进文本：两种都认。
  const denied = async (promise) => {
    try { await promise; } catch (error) { return error; }
    throw new Error('期望被 ACTION_ORIGIN_DENIED 拦下，但调用成功了');
  };
  const isDenied = (error) =>
    !!error && (error.code === 'ACTION_ORIGIN_DENIED' || /ACTION_ORIGIN_DENIED/.test(String(error.message)));

  // 1) 声明默认值：没写 origins 的默认放行 ui/plugin/agent（sync 要显式声明）；写了 ["ui"] 的只给界面。
  assert.deepEqual(find(await entries('actions.list', 'ui'), action).origins, ['ui', 'plugin', 'agent']);
  // contacts 这类「写操作」：本身支持 agent，但默认只给界面（originsDefault）。
  const contactEntry = find(await entries('contacts.actionSchema', 'ui'), contact);
  assert.deepEqual(contactEntry.origins, ['ui']);
  assert.deepEqual(contactEntry.originsDeclared, ['ui', 'agent']);
  assert.deepEqual(contactEntry.originsDefault, ['ui']);
  assert.ok(isDenied(await denied(env.call(contact, { name: '默认禁止 agent' }))));
  // 插件来源不在声明上界里：数组闸门先拦。
  assert.ok(isDenied(await denied(env.call(contact, { name: '插件也调不动' }, 'plugin'))));

  // 2) 支持 agent 但默认关闭：界面可以打开，打开后 agent 能过数组闸门（域内规则仍生效）。
  await set(['ui', 'agent'], contact);
  assert.deepEqual(find(await entries('contacts.actionSchema', 'ui'), contact).origins, ['ui', 'agent']);
  // 上界之外仍然配不进去（contacts 只声明了 ui/agent，sync 越界）。
  await assert.rejects(env.call(setter, { action: contact, origins: ['ui', 'sync'] }, 'ui'), /不支持/);
  await set(['ui'], contact);
  assert.deepEqual(find(await entries('contacts.actionSchema', 'ui'), contact).origins, ['ui']);

  // 3) 收窄 tags.create：只给界面，agent 从此在发现与调用两条路上都看不到它；权限改动不写同步。
  const initial = count();
  await set(['ui'], action);
  assert.equal(count(), initial);
  assert.deepEqual(find(await entries('tags.actionSchema', 'ui'), action).origins, ['ui']);
  for (const list of ['tags.actionSchema', 'actions.list']) assert(!(await env.call(list)).includes(action));
  await assert.rejects(env.call('actions.help', { action }));
  // 默认声明里没有 sync：想放开同步同样越界。
  await assert.rejects(env.call(setter, { action, origins: ['ui', 'sync'] }, 'ui'), /不支持/);
  assert.ok(isDenied(await denied(env.call(action, { name: '不应创建' }))));
  assert.match((await env.tool.execute({ action, args: { name: '工具也不应创建' } })).text, /ACTION_ORIGIN_DENIED/);

  // 4) 权限不可自授：agent 改不了任何 action 的来源；来源设置自身的数组被钉死为 ui。
  await assert.rejects(set(['ui', 'agent'], action, 'agent'));
  await assert.rejects(set(['ui', 'agent'], setter));
  await assert.rejects(set([], action));
  assert.equal(count(), initial);

  // 5) 界面自身不受影响；被拦的调用留下审计。
  await env.call(action, { name: '界面可创建' }, 'ui');
  const audit = (await env.call('audit.list', { action }, 'ui')).records;
  assert(audit.some(x => x.actor === 'ui' && x.ok));
  assert(audit.some(x => x.actor === 'agent' && !x.ok));

  // 6) 覆盖存在本机 meta：重启后仍生效。
  env.close(); env = boot();
  assert.ok(isDenied(await denied(env.call(action, { name: '跨重启仍关闭' }))));
  const beforeRestore = count();
  await set(['ui', 'plugin', 'agent'], action);
  assert.equal(count(), beforeRestore);
  await env.call(action, { name: '恢复后可创建' });
  console.log('PASS: 来源数组默认值、工具与发现过滤、界面可放开/收窄、权限不可自授、审计、重启持久化、无同步写入');
} finally {
  db?.close(); env?.close();
  if (dirname(home) === tmpdir() && home.split('/').pop().startsWith('wb-agent-access-')) rmSync(home, { recursive: true, force: true });
}
