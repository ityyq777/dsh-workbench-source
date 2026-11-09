/** Isolated SQLite regression: no profile, server, or production database. */
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { SCHEMA_SQL } from '../packages/core/lib/schema.js';
import { createSchema } from '../packages/addons/tasks/lib/db/db-core.js';
import { exportTasksData, importTasksData } from '../packages/addons/tasks/lib/infra/backup.js';
import { taskSync } from '../packages/addons/tasks/lib/infra/sync.js';
import { activeTimeline } from '../packages/addons/tasks/lib/timeline/timeline-store.js';
import { applyIncoming } from '../packages/shell/lib/sync-incoming.js';
import { resolveConflict } from '../packages/shell/lib/sync-conflicts.js';
import { SyncEngine, SyncClock } from '../packages/shell/lib/sync.js';
import { writeConflict, applyRemoteUpsert } from '../packages/core/lib/repo.js';
const all=[];
function api() { const db=new DatabaseSync(':memory:');all.push(db);db.exec(SCHEMA_SQL);createSchema(db);return {db,emit(){},hasDomain(){return false;}}; }
const stamp={created_at:10,updated_at:20,deleted_at:null,rev:1};
const entity=(id,extra={})=>({id,title:'Timeline '+id,description:'',...stamp,...extra});
const task=(id,key=null,extra={})=>({id,title:'Task '+id,timeline_key:key,...stamp,...extra});
const link=(id,timeline_id,extra={})=>({id,task_id:id,timeline_id,...stamp,...extra});
const put=(a,body,policy='newest')=>importTasksData(a,JSON.stringify(body),{policy});
const base={schemaVersion:2,tasks:[task('t','e'),task('dead','old',{deleted_at:25})],taskNodes:[],taskDeps:[],taskTimelines:[entity('e'),entity('old',{deleted_at:25})],taskTimelineLinks:[link('t','e'),link('dead','old',{deleted_at:25})],timelineMigrationRecords:[{k:'task_timeline_migration:hash',v:'{"migrationVersion":1}'}]};
const logCount=a=>a.db.prepare('SELECT count(*) n FROM sync_change_log').get().n;
const snapshot=a=>JSON.stringify({data:exportTasksData(a),logs:a.db.prepare('SELECT * FROM sync_change_log').all()});
try {
 const a=api(); assert.equal(put(a,base).ok,true); const exported=exportTasksData(a);
 const b=api();assert.equal(put(b,exported).ok,true);assert.deepEqual(exportTasksData(b),exported);
 for(const policy of ['newest','skip','overwrite']) { const before=snapshot(b);assert.equal(put(b,exported,policy).imported,0);assert.equal(snapshot(b),before); }
 const legacy=api();const v1={schemaVersion:1,tasks:[task('001','001'),task('empty',''),task('unknown','not-here')],taskNodes:[]};
 const migrated=put(legacy,v1);assert.equal(migrated.ok,true);assert.equal(migrated.timelineCandidates.length,2);assert.equal(exportTasksData(legacy).taskTimelines.length,0);assert.equal(exportTasksData(legacy).taskTimelineLinks.length,0);assert.equal(legacy.db.prepare('SELECT timeline_key FROM task WHERE id=?').get('empty').timeline_key,'');
 const before=snapshot(a);assert.equal(put(a,{...base,taskTimelineLinks:[link('t','absent',{updated_at:99})]}).ok,false);assert.equal(snapshot(a),before);
 assert.equal(put(a,{...base,taskTimelineLinks:[{...link('t','e'),id:'random'}]}).ok,false);assert.equal(snapshot(a),before);
 a.db.exec("CREATE TRIGGER fail_import BEFORE INSERT ON sync_change_log WHEN NEW.table_name='task_timeline_link' BEGIN SELECT RAISE(ABORT,'injected'); END");
 const update={...base,taskTimelines:[entity('e',{title:'changed',updated_at:80})],taskTimelineLinks:[link('t','e',{updated_at:80})]};
 assert.equal(put(a,update).rolledBack,true);assert.equal(snapshot(a),before);a.db.exec('DROP TRIGGER fail_import');
 // A newer local task may be skipped while its imported membership still changes.
 const projection=api();assert.equal(put(projection,{schemaVersion:1,tasks:[task('p',null,{updated_at:100,rev:7})],taskNodes:[]}).ok,true);
 const membership={schemaVersion:2,tasks:[task('p',null)],taskNodes:[],taskDeps:[],taskTimelines:[entity('pe',{updated_at:80})],taskTimelineLinks:[link('p','pe',{updated_at:90})]};
 const projectionLogs=logCount(projection);assert.equal(put(projection,membership).ok,true);
 let projected=projection.db.prepare('SELECT * FROM task WHERE id=?').get('p');assert.equal(projected.timeline_key,'pe');assert.equal(projected.updated_at,101);assert.equal(projected.rev,8);
 assert.equal(logCount(projection),projectionLogs+3);assert.deepEqual(JSON.parse(projection.db.prepare("SELECT payload FROM sync_change_log WHERE table_name='task' ORDER BY seq DESC LIMIT 1").get().payload),{...projected});
 for(const policy of ['newest','overwrite','overwrite']) {const stable=snapshot(projection);assert.equal(put(projection,membership,policy).ok,true);assert.equal(snapshot(projection),stable);}
 const entityDelete={schemaVersion:2,tasks:[],taskNodes:[],taskDeps:[],taskTimelines:[entity('pe',{updated_at:200,deleted_at:200})],taskTimelineLinks:[]};
 const preDelete=snapshot(projection);projection.db.exec("CREATE TRIGGER fail_projection BEFORE INSERT ON sync_change_log WHEN NEW.table_name='task' BEGIN SELECT RAISE(ABORT,'projection log failed'); END");
 assert.equal(put(projection,entityDelete).rolledBack,true);assert.equal(snapshot(projection),preDelete);projection.db.exec('DROP TRIGGER fail_projection');
 assert.equal(put(projection,entityDelete).ok,true);projected=projection.db.prepare('SELECT * FROM task WHERE id=?').get('p');assert.equal(projected.timeline_key,null);assert.equal(projected.updated_at,201);assert.equal(projected.rev,9);
 const stableDelete=snapshot(projection);assert.equal(put(projection,entityDelete).ok,true);assert.equal(snapshot(projection),stableDelete);
 const entityRestore={...entityDelete,taskTimelines:[entity('pe',{updated_at:300})]};assert.equal(put(projection,entityRestore).ok,true);
 const linkDelete={...entityDelete,taskTimelines:[],taskTimelineLinks:[link('p','pe',{updated_at:400,deleted_at:400})]};assert.equal(put(projection,linkDelete).ok,true);
 projected=projection.db.prepare('SELECT * FROM task WHERE id=?').get('p');assert.equal(projected.timeline_key,null);assert.equal(projected.updated_at,401);assert.equal(projected.rev,11);
 const projectionCopy=api(),projectionBackup=exportTasksData(projection);assert.equal(put(projectionCopy,projectionBackup).ok,true);assert.deepEqual(exportTasksData(projectionCopy),projectionBackup);
 const sync=api(),def=name=>taskSync.tables.find(t=>t.name===name);
 const incoming=(name,row)=>applyIncoming(sync.db,def(name),row,row.updated_at);
 incoming('task_timeline_link',link('later','future'));assert.equal(activeTimeline(sync.db,'later'),null);
 put(sync,{schemaVersion:1,tasks:[task('later','unknown')],taskNodes:[]}); // unknown references rejected atomically on backup
 assert.equal(sync.db.prepare('SELECT * FROM task WHERE id=?').get('later'),undefined);
 incoming('task_timeline',entity('future'));const seed=api();put(seed,{schemaVersion:1,tasks:[task('later','unknown')],taskNodes:[]});
 incoming('task',exportTasksData(seed).tasks[0]);assert.equal(activeTimeline(sync.db,'later').id,'future');
 assert.equal(sync.db.prepare('SELECT timeline_key FROM task WHERE id=?').get('later').timeline_key,'future');assert.equal(logCount(sync),0);
 assert.equal(JSON.parse(sync.db.prepare('SELECT v FROM meta WHERE k LIKE ?').get('task_timeline_migration:sync-candidate:%').v).timelineKey,'unknown');
 const candidateCount=()=>sync.db.prepare('SELECT count(*) n FROM meta WHERE k LIKE ?').get('task_timeline_migration:sync-candidate:%').n;
 const beforeOmitted=candidateCount(),omitted={...sync.db.prepare('SELECT * FROM task WHERE id=?').get('later'),updated_at:30};delete omitted.timeline_key;
 incoming('task',omitted);assert.equal(candidateCount(),beforeOmitted);assert.equal(sync.db.prepare('SELECT timeline_key FROM task WHERE id=?').get('later').timeline_key,'future');
 const unlinked=api();put(unlinked,{schemaVersion:1,tasks:[task('unlinked','pending')],taskNodes:[]});const noKey={...exportTasksData(unlinked).tasks[0],updated_at:30};delete noKey.timeline_key;
 applyIncoming(unlinked.db,def('task'),noKey,30);assert.equal(unlinked.db.prepare('SELECT timeline_key FROM task').get().timeline_key,'pending');
 assert.throws(()=>incoming('task_timeline_link',{...link('later','future'),id:'random'}),/ID_MISMATCH/);
 incoming('task_timeline',entity('future',{updated_at:90,deleted_at:90}));assert.equal(activeTimeline(sync.db,'later'),null);assert.equal(sync.db.prepare('SELECT timeline_key FROM task').get().timeline_key,null);
 const tombBackup=exportTasksData(sync),tombRestore=api();assert.equal(put(tombRestore,tombBackup).ok,true);assert.deepEqual(exportTasksData(tombRestore),tombBackup);assert.equal(activeTimeline(tombRestore.db,'later'),null);
 incoming('task_timeline',entity('future',{updated_at:100}));assert.equal(activeTimeline(sync.db,'later').id,'future');
 const keep=sync.db.prepare('SELECT * FROM task_timeline WHERE id=?').get('future');
 assert.throws(()=>applyIncoming(sync.db,{...def('task_timeline'),afterApply(){throw Error('hook failure');}},entity('future',{updated_at:200}),200),/hook failure/);assert.deepEqual(sync.db.prepare('SELECT * FROM task_timeline WHERE id=?').get('future'),keep);
 assert.throws(()=>applyRemoteUpsert(sync.db,'task_timeline',{id:'future',updated_at:200},200),/NOT NULL/);assert.deepEqual(sync.db.prepare('SELECT * FROM task_timeline WHERE id=?').get('future'),keep);
 const invalid={...link('later','future'),id:'invalid'};
 writeConflict(sync.db,'task_timeline_link','invalid','pull','local',invalid,invalid,30,20);
 const conflict=sync.db.prepare('SELECT id FROM conflict_shadow WHERE row_id=?').get('invalid').id;
 assert.throws(()=>resolveConflict(sync.db,conflict,'keep_server',30,[{id:'tasks',sync:taskSync}]),/ID_MISMATCH/);assert.ok(sync.db.prepare('SELECT id FROM conflict_shadow WHERE id=?').get(conflict));
 const engine=new SyncEngine({db:sync.db,domains:[{id:'tasks',sync:taskSync}],transport:{},clock:new SyncClock(),userId:'u',deviceId:'d',epoch:'e'});
 engine.applyEntry('task_timeline_link',{domainId:'tasks',table:def('task_timeline_link')},{op:'delete',row_id:'later',payload:null,updated_at:500});
 assert.equal(activeTimeline(sync.db,'later'),null);assert.equal(sync.db.prepare('SELECT timeline_key FROM task').get().timeline_key,null);
 assert.equal(sync.db.prepare('SELECT deleted_at FROM task_timeline_link').get().deleted_at,500);
 console.log('timeline backup/sync: roundtrip, tombstones, v1 candidates, policies, rollback, stable IDs, out-of-order and conflict hooks passed');
} finally {for(const db of all)db.close();}
