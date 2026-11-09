/** Registered actions, isolated in-memory SQLite; no installed profile or bundle. */
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { setup } from '../packages/addons/tasks/lib/index.js';
import { renderList } from '../packages/addons/tasks/lib/task-view.js';
const db = new DatabaseSync(':memory:'), actions = new Map();
setup({ db, addon: { version: 'test' }, log() {}, hasDomain: () => false, action: (name, def) => actions.set(name, def) });
const call = (name, args = {}) => actions.get(name).execute(args, { origin: 'agent' });
const base = { tab: 'all', filterRestarted: false, sort: 'publish' };
const list = args => call('tasks.list', { ...base, ...args });
const ids = result => result.records.map(r => r.id);
let cases = 0;
try {
  db.exec("INSERT INTO task_node(id,name,type,parent_id,path,created_at,updated_at) VALUES('pub','Publish','1','1','/1/pub/',0,0),('empty','Empty','0','1','/1/empty/',0,0)");
  const insert = db.prepare('INSERT INTO task(id,title,status,table_id,publish_date,target_date,done_date,priority,created_at,updated_at,deleted_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)');
  const add = (id, publish, status = '0', target = '2024-06-01', deleted = null) => insert.run(id, id, status, 'pub', publish, target, '2024-03-05', 6, 0, 0, deleted);
  add('before', '2024-02-28'); add('start', '2024-02-29', '2');
  add('middle', '2024-03-01', '2', '2024-07-01'); add('end', '2024-03-02');
  add('history', '2024-03-02T23:59:59+08:00', '2'); add('after', '2024-03-03');
  add('deleted', '2024-03-01', '2', '2024-06-01', 123);
  const from = '2024-02-29', to = '2024-03-02';
  for (const [args, expected] of [
    [{}, ['before','start','middle','end','history','after']],
    [{publishFrom:from}, ['start','middle','end','history','after']],
    [{publishTo:to}, ['before','start','middle','end','history']],
    [{publishFrom:from,publishTo:to}, ['start','middle','end','history']],
  ]) {
    const result = list(args); assert.deepEqual(ids(result), expected); assert.equal(result.total, expected.length);
    const exported = call('tasks.export', {...base,...args});
    assert.deepEqual(JSON.parse(exported.content).tasks.map(t=>t.id), expected);
    assert.deepEqual(exported.filter, result.filter); cases++;
  }
  for (const empty of ['', null, undefined]) {
    const result = list({publishFrom:empty,publishTo:empty}); assert.equal(result.total,6);
    assert.equal(result.filter.publishFrom,undefined); assert.equal(result.filter.publishTo,undefined); cases++;
  }
  assert.deepEqual(ids(list({publishFrom:to,publishTo:to})),['end','history']);
  assert.equal(list({publishFrom:'2025-01-01'}).total,0);
  for (const field of ['publishFrom','publishTo']) for (const bad of ['2023-02-29','1900-02-29','2024-04-31','2024-13-01','2024-00-01','2024-01-00','2024-1-01','0000-01-01','10000-01-01','2024-03-01T00:00:00',' 2024-03-01',' ',1,{},false]) {
    for (const action of ['tasks.list','tasks.export']) assert.throws(()=>call(action,{[field]:bad}),new RegExp(field)); cases++;
  }
  for (const valid of ['0001-01-01','1899-12-31','2000-02-29','2024-02-29','9999-12-31']) assert.equal(list({publishFrom:valid}).filter.publishFrom,valid);
  const reversed = {publishFrom:to,publishTo:from};
  const notice = {code:'publish_range_swapped',field:'publishFrom/publishTo',message:'发布日期起始晚于终止，已交换',publishFrom:from,publishTo:to};
  for (const extra of [{},{titleKey:'absent'},{groupId:'empty'}]) {
    const result=list({...reversed,...extra});
    assert.deepEqual(result.notices,[notice]); assert.equal(result.filter.publishFrom,from); assert.equal(result.filter.publishTo,to);
    assert.match(renderList(result),/发布日>=2024-02-29.*发布日<=2024-03-02/);
    for(const format of ['json','csv','markdown']) {
      const exported=call('tasks.export',{...base,...reversed,...extra,format});
      assert.deepEqual(exported.notices,[notice]); assert.deepEqual(exported.filter,result.filter); assert.equal(exported.count,result.total);
    } cases++;
  }
  assert.equal(list({publishFrom:from,publishTo:to}).notices,undefined);
  const and = {publishFrom:from,publishTo:to,targetFrom:'2024-06-01',targetTo:'2024-06-01',activityDate:'2024-03-05',activityType:'done',status:'2',tableId:'pub',titleKey:'history'};
  assert.deepEqual(ids(list(and)),['history']);
  assert.deepEqual(JSON.parse(call('tasks.export',{...base,...and}).content).tasks.map(t=>t.id),['history']);
  assert.equal(list({...and,activityDate:'2024-03-06'}).total,0);
  const paged=[];
  for(const pageNumber of [1,2]) {
    const page=list({...reversed,pageNumber,pageSize:2}); assert.equal(page.total,4); assert.equal(page.returned,2);
    assert.deepEqual(page.notices,[notice]); paged.push(...ids(page));
  }
  assert.deepEqual(paged,ids(list(reversed)));
  const exact=call('tasks.export',{ids:['before'],publishFrom:'invalid'}); assert.equal(exact.count,1); assert.equal(exact.filter,undefined);
  const tags=list({...reversed,tagIds:['missing']});
  assert.deepEqual(tags.notices.map(n=>n.code),['publish_range_swapped','tag_domain_missing']);
  for(const action of ['tasks.list','tasks.export']) for(const field of ['publishFrom','publishTo']) {
    assert.ok(actions.get(action).input.properties[field]); assert.ok(!actions.get(action).input.required?.includes(field));
  }
  console.log('PUBLISH RANGE PASS: '+cases+' combinations/validation cases; real dates, history timestamps, swap notices/filter, empty group/results, target/activity AND, pagination, all export formats, ids precedence, schema');
} finally { db.close(); }
