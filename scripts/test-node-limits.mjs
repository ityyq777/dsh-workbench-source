/** Node/ownership boundaries on an isolated in-memory DB and real registered schemas. */
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { setup } from '../packages/addons/tasks/lib/index.js';
import { parseTablePath } from '../packages/addons/tasks/lib/task/model/task-ownership-path.js';
import ownership from '../packages/addons/tasks/client/modals/ownership.cjs';
import limits from '../packages/addons/tasks/shared/tree/limits.cjs';
const db = new DatabaseSync(':memory:'), actions = new Map(), events = [];
db.exec('CREATE TABLE sync_change_log(id INTEGER PRIMARY KEY,table_name TEXT,row_id TEXT,op TEXT,payload TEXT,origin TEXT,updated_at INTEGER)');
setup({db,addon:{version:'test'},log(){},hasDomain:()=>false,emit:(...event)=>events.push(event),action:(name,def)=>actions.set(name,def)});
const call=(name,args)=>actions.get(name).execute(args,{origin:'agent'});
const snapshot=()=>JSON.stringify({nodes:db.prepare('SELECT * FROM task_node ORDER BY id').all(),tasks:db.prepare('SELECT * FROM task ORDER BY id').all(),log:db.prepare('SELECT * FROM sync_change_log').all(),events});
const reject=(action,args,pattern)=>{const before=snapshot();assert.throws(()=>call(action,args),pattern);assert.equal(snapshot(),before);};
const tree=[{id:'root',type:'2',name:'根',children:[]}];
try {
 assert.deepEqual(limits,{NAME_MAX:40,PATH_MAX:32,PATH_LEN_MAX:2048});
 for(const name of ['a'.repeat(40),'中'.repeat(40),'中A'.repeat(20),'😀'.repeat(20)]) {
  const group=call('taskNodes.create',{parentId:'1',type:'0',name}).node;
  assert.equal(group.name,name);
  const node=call('taskNodes.create',{parentId:group.id,type:'1',name}).node;
  reject('taskNodes.create',{parentId:group.id,type:'1',name},/PATH_AMBIGUOUS/);
  reject('taskNodes.create',{parentId:group.id,type:'1',name:name+'x'},/40/);
  for(const action of ['taskNodes.rename','taskNodes.update']) {
   reject(action,{id:node.id,name:name+'x'},/40/);
   call(action,{id:node.id,name:'short'});
   assert.equal(call(action,{id:node.id,name}).node.name,name);
  }
  assert.deepEqual(parseTablePath([name,name]),[name,name]);
  assert.equal(ownership.preview(tree,name,['职责']).error,'');
  assert.match(ownership.preview(tree,name+'x',['职责']).error,/40/);
  assert.equal(call('tasks.create',{title:'existing path',tablePath:[name,name]}).tableId,node.id);
 }
 const long='混合x'.repeat(13)+'末';
 assert.equal(long.length,40);
 const created=call('tasks.create',{title:'implicit nodes',tablePath:['implicit',long],createMissing:true,pathDescriptions:['组职责','表职责']});
 assert.equal(created.createdNodes.length,2);
 reject('tasks.create',{title:'invalid implicit',tablePath:['rollback',long+'x'],createMissing:true,pathDescriptions:['组','表']},/INVALID_PATH/);
 const bulk=call('tasks.bulkCreate',{records:[{title:'bulk implicit',tablePath:['bulk',long],createMissing:true,pathDescriptions:['组','表']}]});
 assert.equal(bulk.created,1);
 reject('tasks.bulkCreate',{records:[{title:'rollback first',tableId:created.tableId},{title:'bad',tablePath:[long+'x'],createMissing:true,pathDescriptions:['表']}]},/INVALID_PATH/);
 const slash=call('tasks.create',{title:'slash array',tablePath:['slash/group',long],createMissing:true,pathDescriptions:['组','表']});
 assert.equal(call('tasks.create',{title:'same slash',tablePath:['slash/group',long]}).tableId,slash.tableId);
 assert.equal(parseTablePath(Array(32).fill(long)).length,32);
 assert.throws(()=>parseTablePath(Array(33).fill('a')),/32/);
 const padded=' '.repeat(2047)+'x';
 assert.deepEqual(parseTablePath(padded),['x']);
 assert.deepEqual(parseTablePath([padded]),['x']);
 assert.throws(()=>parseTablePath(padded+' '),/2048/);
 assert.throws(()=>parseTablePath([padded+' ']),/2048/);
 assert.equal(ownership.preview(tree,padded,['职责']).error,'');
 assert.match(ownership.preview(tree,padded+' ',['职责']).error,/2048/);
 assert.equal(ownership.preview(tree,Array(32).fill('a').join('/'),Array(32).fill('职责')).error,'');
 assert.match(ownership.preview(tree,Array(33).fill('a').join('/'),Array(33).fill('职责')).error,/32/);
 for(const path of ['/a','a/','a//b','a/./b','a/../b',[],[42]]) assert.throws(()=>parseTablePath(path),/INVALID_PATH/);
 for(const action of ['taskNodes.create','taskNodes.rename','taskNodes.update']) {
  const schema=actions.get(action).input.properties.name;
  assert.equal(schema.maxLength,40);assert.match(schema.description,/40/);
 }
 for(const schema of [actions.get('tasks.create').input,actions.get('tasks.bulkCreate').input.properties.records.items]) {
  const path=schema.properties.tablePath;
  assert.equal(path.maxLength,2048);assert.equal(path.maxItems,32);assert.equal(path.items.maxLength,40);assert.match(path.description,/每段40/);
 }
 console.log('NODE LIMITS PASS: create/rename/update/implicit/bulk, 40 accepts 41 rejects (ASCII/CJK/mixed/UTF-16), atomic errors, slash arrays, duplicates, 32/33 and 2048/2049, schemas and UI path parity');
} finally { db.close(); }
