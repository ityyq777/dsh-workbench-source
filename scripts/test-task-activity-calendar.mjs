/** Isolated in-memory DB; exercise registered actions, never the installed workbench. */
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { setup } from '../packages/addons/tasks/lib/index.js';
import { activityCalendar } from '../packages/addons/tasks/lib/stats/activity-calendar.js';
const db = new DatabaseSync(':memory:'), actions = new Map();
setup({db, addon:{version:'test'}, log(){}, hasDomain:()=>false, action:(name,def)=>actions.set(name,def)});
const call=(name,args={})=>actions.get(name).execute(args,{origin:'agent'});
const list=args=>call('tasks.list',{tab:'all',filterRestarted:false,...args});
const ids=result=>result.records.map(r=>r.id);
const leap='2024-02-29';
try {
  db.exec("INSERT INTO task_node(id,name,type,parent_id,path,created_at,updated_at) VALUES('calendar','Calendar','1','1','/1/',0,0)");
  const insert=db.prepare('INSERT INTO task(id,title,status,table_id,publish_date,target_date,done_date,shutdown_date,restart_key,created_at,updated_at,deleted_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)');
  const add=(id,status,publish,done=null,shutdown=null,deleted=null,restart=null)=>insert.run(id,id,status,'calendar',publish,leap,done,shutdown,restart,Date.parse('2024-03-01T00:30:00+14:00'),0,deleted);
  add('done-a','2',leap,leap);
  add('done-b','2','2024-01-01',leap);
  add('closed','1',leap,leap,leap);
  add('active-stale','0',leap,leap,leap);
  add('restarted','3',leap,leap,leap,null,'source');
  add('restart-child','2','2024-03-01','2024-03-01',null,null,'source');
  add('deleted','2',leap,leap,null,123);
  add('previous','2','2023-12-31','2023-12-31');
  add('next','1','2025-01-01',null,'2025-01-01');
  add('bad-date','2','2024-02-30','2024-02-30');
  const before=db.prepare('SELECT total_changes() n').get().n;
  const calendar=call('tasks.activityCalendar',{year:2024});
  assert.deepEqual(calendar,{year:2024,days:[
    {date:'2024-01-01',publish:1,done:0,shutdown:0},
    {date:leap,publish:4,done:2,shutdown:1},
    {date:'2024-03-01',publish:1,done:1,shutdown:0},
  ],totals:{publish:6,done:3,shutdown:1,total:10},max:{publish:4,done:2,shutdown:1,total:7}});
  assert.equal(db.prepare('SELECT total_changes() n').get().n,before,'calendar is read-only');
  const recentDone=call('tasks.statsReport',{range:'all',recentDoneLimit:50}).lists.recentDone;
  for(const day of calendar.days) {
    const recentIds=recentDone.filter(row=>row.date===day.date).map(row=>row.id).sort();
    assert.equal(recentIds.length,day.done,'statsReport recentDone matches calendar '+day.date);
    assert.deepEqual(recentIds,ids(list({activityDate:day.date,activityType:'done'})).sort());
  }
  let queries=0;
  activityCalendar({prepare(sql){queries++;assert.match(sql,/GROUP BY/);return db.prepare(sql);}},{year:2024});
  assert.equal(queries,1,'one SQL aggregation, not per-day queries');
  for(const day of calendar.days) for(const type of ['publish','done','shutdown']) {
    const args={activityDate:day.date,activityType:type,sort:'created'};
    const result=list(args);
    assert.equal(result.total,day[type],day.date+' '+type);
    assert.equal(result.filter.activityType,type);
    const exported=call('tasks.export',{tab:'all',filterRestarted:false,...args});
    assert.deepEqual(JSON.parse(exported.content).tasks.map(r=>r.id),ids(result));
  }
  assert.deepEqual(ids(list({activityDate:leap,sort:'created'})),['done-a','done-b']);
  assert.equal(list({activityDate:leap,activityType:'publish',status:'2'}).total,1,'AND with status');
  assert.deepEqual(ids(list({activityDate:leap,titleKey:'done-b'})),['done-b'],'AND with search');
  const page=list({activityDate:leap,activityType:'publish',sort:'created',pageNumber:2,pageSize:2});
  assert.equal(page.total,4);assert.deepEqual(ids(page),['done-a','restarted']);
  assert.deepEqual(call('tasks.activityCalendar',{year:2022}),{year:2022,days:[],totals:{publish:0,done:0,shutdown:0,total:0},max:{publish:0,done:0,shutdown:0,total:0}});
  for(const year of [undefined,null,'2024',2024.5,NaN,Infinity,1899,10000]) assert.throws(()=>call('tasks.activityCalendar',{year}),/year/);
  for(const year of [1900,2000,9999]) assert.equal(call('tasks.activityCalendar',{year}).year,year);
  for(const date of ['',null,'2023-02-29','1900-02-29','2024-04-31','2024-1-01','1899-12-31','10000-01-01',"2024-02-29' OR 1=1 --"]) {
    for(const action of ['tasks.list','tasks.export']) assert.throws(()=>call(action,{activityDate:date}),/activityDate/);
  }
  for(const type of ['all','restart','',null,1]) assert.throws(()=>list({activityDate:leap,activityType:type}),/activityType/);
  assert.throws(()=>list({activityType:'done'}),/activityDate/);
  assert.equal(list({activityDate:'2000-02-29'}).total,0);
  for(const tz of ['Pacific/Kiritimati','America/Los_Angeles','Asia/Shanghai']) {
    process.env.TZ=tz;assert.deepEqual(call('tasks.activityCalendar',{year:2024}),calendar,'stored local dates never shift with timezone');
  }
  const schema=actions.get('tasks.activityCalendar').input;
  assert.deepEqual(schema.required,['year']);assert.equal(schema.properties.year.minimum,1900);assert.equal(schema.properties.year.maximum,9999);
  for(const name of ['tasks.list','tasks.export']) assert.deepEqual(actions.get(name).input.properties.activityType.enum,['publish','done','shutdown']);
  console.log('ACTIVITY CALENDAR PASS: leap/year boundaries, sparse aggregation, status/deletion/restarted records, read-only, timezone, strict validation, list/export consistency, AND filters, sorting/pagination, schema');
} finally { db.close(); }
