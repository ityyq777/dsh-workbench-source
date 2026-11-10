/** 各业务插件自证的 action 清单：<域>.actionSchema 必须由插件自己注册并返回本域 schema，不依赖宿主统一接口。 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { setup as setupTasks } from '../packages/addons/tasks/lib/index.js';
import { setup as setupTags } from '../packages/addons/tags/lib/index.js';
import { setup as setupSites } from '../packages/addons/sites/lib/index.js';
import { setup as setupStorage } from '../packages/addons/storage/lib/index.js';

const SYNC_DDL = 'CREATE TABLE IF NOT EXISTS sync_change_log(id INTEGER PRIMARY KEY,table_name TEXT,row_id TEXT,op TEXT,payload TEXT,origin TEXT,updated_at INTEGER)';

function boot(setup, version) {
  const db = new DatabaseSync(':memory:');
  db.exec(SYNC_DDL);
  const actions = new Map();
  const api = {
    db,
    addon: { version },
    log() {},
    hasDomain: () => false,
    emit() {},
    action: (name, def) => actions.set(name, def),
  };
  setup(api);
  return { db, actions, call: (name, args = {}) => actions.get(name).execute(args, { origin: 'agent' }) };
}

const cases = [
  { module: 'tasks', domain: 'wb-addon-tasks', version: '9.9.1', boot: () => boot(setupTasks, '9.9.1'), sample: 'tasks.list' },
  { module: 'tags', domain: 'wb-addon-tags', version: '9.9.2', boot: () => boot(setupTags, '9.9.2'), sample: 'tags.list' },
  { module: 'sites', domain: 'wb-addon-sites', version: '9.9.3', boot: () => boot(setupSites, '9.9.3'), sample: 'sites.list' },
  { module: 'storage', domain: 'wb-addon-storage', version: '9.9.4', boot: () => boot(setupStorage, '9.9.4'), sample: 'storage.list' },
];

for (const c of cases) {
  const env = c.boot();
  const name = c.module + '.actionSchema';
  const def = env.actions.get(name);
  assert.ok(def, name + ' 必须由插件自己注册');
  assert.equal(typeof def.execute, 'function', name + ' 必须是真实 action');
  const snap = env.call(name);
  assert.equal(snap.domains.length, 1, name + ' 只返回本域');
  assert.equal(snap.domains[0].id, c.domain);
  assert.equal(snap.domains[0].version, c.version, name + ' 版本取自插件 addon.version');
  assert.ok(Array.isArray(snap.actions) && snap.actions.length > 5, name + ' 应返回完整清单');
  assert.ok(snap.actions.some((a) => a.name === c.sample), name + ' 应包含 ' + c.sample);
  assert.ok(snap.actions.some((a) => a.name === name), name + ' 应把自己也列出来');
  for (const a of snap.actions) {
    assert.equal(a.domain, c.domain, a.name + ' 的域必须是本域');
    assert.equal(typeof a.name, 'string');
    assert.equal(typeof a.description, 'string');
    assert.ok(a.input && typeof a.input === 'object', a.name + ' 必须带参数 schema');
    assert.ok(Array.isArray(a.examples), a.name + ' 必须带 examples 数组');
  }
  // 清单里不允许出现别的域的 action
  assert.equal(snap.actions.filter((a) => a.domain !== c.domain).length, 0);
}

// 客户端页面只调用本域 action，不再走宿主统一 schema 接口
const view = readFileSync(new URL('../packages/addons/lib/action-schema-view.cjs', import.meta.url), 'utf8');
assert.ok(view.includes('.actionSchema'), '共享视图应通过本域 actionSchema 取数');
assert.ok(!view.includes('api.schema'), '共享视图不得再调用宿主统一 schema 接口');
for (const m of ['tasks', 'tags', 'sites', 'storage']) {
  const bundle = readFileSync(new URL('../packages/addons/' + m + '/lib/client.js', import.meta.url), 'utf8');
  assert.ok(bundle.includes('.actionSchema'), m + ' 客户端 bundle 应调用本域 actionSchema');
  assert.ok(!bundle.includes('/workbench/api/schema'), m + ' 客户端 bundle 不得直连宿主 schema 路由');
}

console.log('ADDON ACTION SCHEMA ACTIONS PASS: tasks/tags/sites/storage self-served');
