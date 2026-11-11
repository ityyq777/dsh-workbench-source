/** Ownership acceptance uses isolated in-memory SQLite only; no installed profile. */
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { setup } from '../packages/addons/tasks/lib/index.js';
import { reconcileTaskTree } from '../packages/addons/tasks/lib/infra/sync.js';
import { TAG_TABLE_DDL, TAG_INDEX_DDL } from '../packages/addons/tags/lib/db/db.js';
const db = new DatabaseSync(':memory:');
db.exec('CREATE TABLE sync_change_log(id INTEGER PRIMARY KEY,table_name TEXT,row_id TEXT,op TEXT,payload TEXT,origin TEXT,updated_at INTEGER)');
for(const ddl of [...TAG_TABLE_DDL,...TAG_INDEX_DDL]) db.exec(ddl);
const actions=new Map(), events=[];
let tagOn=true;
setup({db,addon:{version:'test'},log(){},hasDomain:()=>tagOn,emit:(...event)=>events.push(event),action:(name,def)=>actions.set(name,def)});
const call=(name,args={})=>actions.get(name).execute(args,{origin:'agent'});
const counts=()=>Object.fromEntries(['task_node','task','task_timeline','task_timeline_link','tag','tag_mapping','sync_change_log'].map(t=>[t,Number(db.prepare('SELECT COUNT(*) AS n FROM '+t).get().n)]));
const snapshot=()=>JSON.stringify({counts:counts(),tasks:db.prepare('SELECT * FROM task ORDER BY id').all(),events});
const fail=(name,args,code)=>{const before=snapshot();assert.throws(()=>call(name,args),code);assert.equal(snapshot(),before,'failed operation is atomic');};
const newArgs={title:'Storage implementation',tablePath:['产品','storage'],createMissing:true,pathDescriptions:['产品开发','物品存储模块开发'],tags:['开发'],dedupeKey:'session:one'};
try {
 fail('tasks.create',{title:'No target'},/TABLE_REQUIRED.*tasks.resolveTable.*tasks.capabilities/);
 fail('tasks.create',{title:'Conflict',tableId:'1',tablePath:'产品'},/TARGET_CONFLICT/);
 fail('tasks.create',{title:'Root',tableId:'1'},/TARGET_NOT_TABLE/);
 fail('tasks.create',{title:'Invalid id',tableId:{}},/INVALID_TARGET_OPTIONS/);
 fail('tasks.create',{title:'Invalid id',tableId:'absent'},/TABLE_NOT_FOUND/);
 for(const source of [1,2]) fail('tasks.create',{title:'Missing timeline/restart target',source},/TABLE_REQUIRED/);
 fail('tasks.create',{title:'Options',tableId:'1',createMissing:true},/INVALID_TARGET_OPTIONS/);
 fail('tasks.create',{title:'Options',tablePath:'a',pathDescriptions:['x']},/INVALID_TARGET_OPTIONS/);
 for(const path of ['/a','a/','a//b','a/../b',[],['x'.repeat(41)],Array(33).fill('a')]) fail('tasks.create',{title:'Bad path',tablePath:path,createMissing:true},/INVALID_PATH/);
 fail('tasks.create',{title:'Missing',tablePath:'missing'},/PATH_NOT_FOUND/);
 fail('tasks.create',{title:'Descriptions',tablePath:['new','leaf'],createMissing:true,pathDescriptions:['good','']},/INVALID_TARGET_OPTIONS/);
 fail('tasks.create',{...newArgs,tagIds:['nonexistent']},/标签/);
 assert.equal(counts().task,0);
 const created=call('tasks.create',newArgs), tableId=created.task.tableId;
 fail('tasks.create',{title:'Group terminal',tablePath:'产品'},/PATH_TYPE_CONFLICT/);
 fail('tasks.create',{title:'Table intermediate',tablePath:'产品/storage/child',createMissing:true,pathDescriptions:['a','b','c']},/PATH_TYPE_CONFLICT/);
 const beforeDuplicate=counts().task_node;
 const repeated=call('tasks.create',{title:'same title allowed',tablePath:'产品/storage',createMissing:true,pathDescriptions:['do not overwrite','do not overwrite']});
 assert.equal(counts().task_node,beforeDuplicate);assert.equal(repeated.createdNodes.length,0);
 assert.equal(repeated.tableDescription,'物品存储模块开发');
 call('tasks.delete',{id:repeated.id});
 assert.equal(created.createdNodes.length,2);assert.equal(created.tablePath,'产品/storage');assert.equal(created.pathSegments.length,3);
 assert.match(actions.get('tasks.create').render(created),new RegExp('产品 / storage'));
 const stable=snapshot();
 const deduped=call('tasks.create',{...newArgs,tablePath:'未创建/另表',pathDescriptions:['new','table']});
 assert.equal(deduped.deduped,true);assert.equal(deduped.tableId,tableId);assert.ok(deduped.notices.some(n=>n.code==='DEDUPE_TARGET_MISMATCH'));assert.equal(snapshot(),stable);
 fail('tasks.create',{title:'Same key missing target',dedupeKey:newArgs.dedupeKey},/TABLE_REQUIRED/);
 fail('tasks.create',{...newArgs,tableId},/TARGET_CONFLICT/);
 fail('tasks.bulkCreate',{records:[{title:'First',tablePath:'批量/表',createMissing:true,pathDescriptions:['a','b'],tags:['batch-tag']},{title:'Second'}]},/TABLE_REQUIRED/);
 fail('tasks.bulkCreate',{records:[{title:'First',tablePath:'批量/表',createMissing:true,pathDescriptions:['a','b'],tags:['batch-tag']},{title:'Second',tableId,priority:0}]},/priority|优先级/);
 const previewBefore=snapshot();
 const preview=call('tasks.bulkCreate',{dryRun:true,records:[{title:'Dry',tablePath:'预演/任务',createMissing:true,pathDescriptions:['preview','tasks'],tags:['preview-tag'],dedupeKey:'dry'}, {title:'Duplicate dry',tablePath:'预演/任务',dedupeKey:'dry'}]});
 assert.equal(snapshot(),previewBefore);assert.equal(preview.wouldCreate,1);assert.equal(preview.deduped,1);assert.equal(preview.wouldCreateNodes.length,2);assert.ok(preview.temporaryIds.length);assert.match(actions.get('tasks.bulkCreate').render(preview),/未写入/);
 fail('tasks.bulkCreate',{dryRun:true,records:[{title:'Invalid tag',tableId,tagIds:['nonexistent']}]},/标签/);
 const batch=call('tasks.bulkCreate',{records:[{title:'one',tableId,dedupeKey:'batch'},{title:'two',tableId,dedupeKey:'batch'}]});
 assert.equal(batch.created,1);assert.equal(batch.deduped,1);
 const original=call('tasks.create',{title:'Original',tableId}).task;
 call('taskTimelines.create',{id:'ownership-restart'});
 call('taskTimelines.attach',{taskId:original.id,timelineId:'ownership-restart'});
 // Failure after the original restart transition, node insert, tag insert and task insert.
 db.exec("CREATE TRIGGER fail_log BEFORE INSERT ON sync_change_log WHEN NEW.table_name='task' AND NEW.op='create' BEGIN SELECT RAISE(ABORT,'injected failure'); END");
 fail('tasks.create',{title:'Restart',tablePath:'原子/重启',createMissing:true,pathDescriptions:['atomic','restart'],source:2,restartKey:original.id,tags:['rollback-tag']},/injected failure/);
 db.exec('DROP TRIGGER fail_log');
 const group=created.pathSegments[1].id;
 fail('taskNodes.create',{parentId:group,type:1,name:'storage'},/PATH_AMBIGUOUS/);
 const other=call('taskNodes.create',{parentId:group,type:1,name:'other',description:'另一个模块'}).node;
 fail('taskNodes.rename',{id:other.id,name:'storage'},/PATH_AMBIGUOUS/);
 fail('taskNodes.update',{id:other.id,name:'storage'},/PATH_AMBIGUOUS/);
 const otherGroup=call('taskNodes.create',{parentId:'1',type:0,name:'otherGroup'}).node;
 const duplicate=call('taskNodes.create',{parentId:otherGroup.id,type:1,name:'storage'}).node;
 fail('taskNodes.move',{sourceId:duplicate.id,targetId:group},/PATH_AMBIGUOUS/);
 call('taskNodes.rename',{id:group,name:'产品改名'});
 assert.equal(call('tasks.get',{id:created.id}).task.tablePath,'产品改名/storage');
 call('taskNodes.move',{sourceId:group,targetId:otherGroup.id});
 assert.equal(call('tasks.get',{id:created.id}).task.tablePath,'otherGroup/产品改名/storage');
 const updated=call('tasks.update',{id:created.id,tableId:other.id});assert.equal(updated.tableId,other.id);assert.ok(updated.pathSegments.length);
 const bulkUpdate=call('tasks.bulkUpdate',{ids:[created.id],patch:{tableId},dryRun:true});assert.equal(bulkUpdate.changes[0].tableId,tableId);assert.match(actions.get('tasks.bulkUpdate').render(bulkUpdate),/未写入/);
 const migrated=call('tasks.migrate',{ids:[created.id],tableId});assert.equal(migrated.tasks[0].tableId,tableId);assert.match(actions.get('tasks.migrate').render(migrated),new RegExp('otherGroup / 产品改名 / storage'));
 const cap=call('tasks.capabilities',{limit:1});assert.equal(cap.tables.length,1);assert.ok(cap.nextCursor);assert.equal(cap.truncated,true);assert.equal(call('tasks.capabilities',{tableId}).tables[0].taskCount,3);
 assert.equal(call('tasks.capabilities',{cursor:cap.nextCursor,limit:1}).tables.length,1);
 fail('tasks.capabilities',{cursor:'garbage'},/INVALID_CURSOR/);
 call('taskNodes.update',{id:tableId,description:'存储代码开发'});
 fail('tasks.capabilities',{cursor:cap.nextCursor},/INVALID_CURSOR/);
 const found=call('tasks.resolveTable',{query:'存储相关的待办'});assert.ok(found.candidates.some(c=>c.id===tableId));assert.equal(found.needsSelection,true);assert.ok(found.candidates[0].reasons.length);
 const miss=call('tasks.resolveTable',{query:'%_\\'});assert.equal(miss.candidates.length,0);assert.equal(miss.noMatch,true);assert.ok(miss.catalogSize>=1);assert.match(miss.notice,/不代表不存在任务表.*张存活任务表/);assert.ok(miss.nextActions.some(a=>a.includes('taskNodes.overview')));assert.ok(miss.nextActions.some(a=>a.includes('tasks.capabilities')));assert.match(miss.evidence,/运行时/);
 const hit=call('tasks.resolveTable',{query:'存储相关的待办'});assert.equal(hit.noMatch,false);assert.ok(hit.catalogSize>=hit.candidates.length);
 const detail=call('tasks.get',{id:created.id});const detailText=actions.get('tasks.get').render(detail);assert.match(detailText,/描述：/);assert.ok(detailText.includes('存储代码开发'),'table description in detail');assert.ok(detailText.includes('归属：otherGroup/产品改名/storage（tableId='));assert.match(detailText,/状态：已开启/);
 assert.match(detailText,/描述：\n\(空\)/);
 const hot=call('tasks.create',{title:'unrelated hot',tablePath:'unrelated',createMissing:true,pathDescriptions:['unrelated task']});
 db.prepare('UPDATE task SET updated_at=? WHERE id=?').run(Date.now()+99999999,hot.id);
 assert.equal(call('tasks.resolveTable',{query:'存储相关的待办'}).candidates[0].id,tableId,'unrelated recency cannot win');
 const exact=call('tasks.resolveTable',{query:'storage'});assert.equal(exact.candidates[0].score>=1000,true);
 tagOn=false;assert.equal(call('tasks.capabilities',{tableId}).tables[0].commonTagsStatus,'unavailable');
 const noTags=call('tasks.bulkCreate',{dryRun:true,records:[{title:'No tags plugin',tableId,tags:['ignored']}]});assert.equal(noTags.notices[0].code,'tag_domain_missing');tagOn=true;
 // Imported duplicate siblings are diagnosed, not silently merged.
 db.prepare('INSERT INTO task_node SELECT ?,name,description,type,parent_id,path,sort,depth,created_at,updated_at,deleted_at,rev FROM task_node WHERE id=?').run('dup-node',tableId);
 fail('tasks.create',{title:'Ambiguous',tablePath:'otherGroup/产品改名/storage'},/PATH_AMBIGUOUS/);
 const syncRows=db.prepare('SELECT * FROM task_node').all();
 assert.throws(()=>reconcileTaskTree([],syncRows),/PATH_AMBIGUOUS.*同步发现/);
 assert.ok(call('tasks.capabilities',{}).tables.some(t=>t.id==='dup-node'),'ordinary discovery remains available for historical duplicate names');
 const softDeleted=syncRows.map(row=>row.id==='dup-node'?{...row,deleted_at:Date.now()}:row);
 assert.ok(reconcileTaskTree([],softDeleted).rows.some(row=>row.id==='dup-node' && row.deleted_at),'tombstone retained without conflict');
 const differentParent=syncRows.map(row=>row.id==='dup-node'?{...row,parent_id:'1'}:row);
 assert.ok(reconcileTaskTree([],differentParent).rows.some(row=>row.id==='dup-node'),'different-parent duplicate names legal');
 const missingParent=syncRows.filter(row=>row.id!=='dup-node').map(row=>row.id===tableId?{...row,parent_id:'absent'}:row);
 assert.ok(reconcileTaskTree([],missingParent).rows.some(row=>row.id===tableId),'existing orphan reconciliation retained');
 db.prepare('DELETE FROM task_node WHERE id=?').run('dup-node');
 assert.ok(reconcileTaskTree([],db.prepare('SELECT * FROM task_node').all()).rows.length);
 // Reconciliation itself may introduce siblings after orphan/cycle recovery.
 const syncNode=(id,name,parent_id,type='1')=>({id,name,parent_id,type,path:'/'+id+'/',sort:0,depth:1,created_at:1,updated_at:1,deleted_at:null,rev:1});
 const syncBase=[syncNode('1','任务','0','2'),syncNode('a','storage','1')];
 for(const tail of [
   [syncNode('b','storage','missing-group')],
   [syncNode('b','storage','deleted-group'),{...syncNode('deleted-group','deleted','1','0'),deleted_at:2}],
   [syncNode('b','storage','cycle'),syncNode('cycle','cycle-group','b','0')],
 ]) {
   const imported=[...syncBase,...tail], originalJson=JSON.stringify(imported);
   assert.throws(()=>reconcileTaskTree([],imported),/PATH_AMBIGUOUS/,'first reconcile must reject recovered sibling collision');
   assert.equal(JSON.stringify(imported),originalJson,'failed reconciliation must preserve input rows');
 }
 const safeOrphan=[...syncBase,syncNode('b','unique','missing-group')];
 const recovered=reconcileTaskTree([],safeOrphan);
 assert.equal(recovered.rows.find(row=>row.id==='b').parent_id,'1');
 assert.ok(reconcileTaskTree([],recovered.rows).rows.length,'noncolliding recovery remains repeatable');
 const slash=call('tasks.create',{title:'slash',tablePath:['slash/name'],createMissing:true,pathDescriptions:['literal slash']});assert.deepEqual(slash.tablePath,['slash/name']);
 // Corrupt ancestry is excluded from discovery and rejected on a targeted write.
 db.prepare('UPDATE task_node SET parent_id=? WHERE id=?').run('missing-parent',other.id);
 fail('tasks.create',{title:'Corrupt',tableId:other.id},/TREE_CORRUPT/);
 assert.ok(call('tasks.capabilities',{}).diagnostics.some(d=>d.id===other.id));
 db.prepare('UPDATE task SET dedupe_key=? WHERE id=?').run(newArgs.dedupeKey,original.id);
 fail('tasks.create',{title:'Duplicate keys',tableId,dedupeKey:newArgs.dedupeKey},/DEDUPE_AMBIGUOUS/);
 // No live table: the notice must distinguish "really no table" from "no domain mapping".
 db.prepare('UPDATE task_node SET deleted_at=?').run(Date.now());
 const none=call('tasks.capabilities',{});assert.equal(none.total,0);assert.match(none.notice,/没有任何存活任务表.*未配置/);
 const miss2=call('tasks.resolveTable',{query:'anything'});assert.equal(miss2.noMatch,true);assert.equal(miss2.catalogSize,0);assert.match(miss2.notice,/不代表不存在任务表/);
 console.log('TASK OWNERSHIP BACKEND PASS: atomic failure, zero-write target errors, full path, ambiguity, dedupe, tags/restart/log rollback, dryRun, discovery and node consistency');
} finally { db.close(); }
