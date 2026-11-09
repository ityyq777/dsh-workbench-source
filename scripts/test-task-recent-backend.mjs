import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { ensureSchema } from '../packages/addons/tasks/lib/db/db.js';
import { statsReport } from '../packages/addons/tasks/lib/stats/stats.js';
const db = new DatabaseSync(':memory:');
try {
  ensureSchema(db, () => {});
  // 历史库允许 NULL 发布日；只在内存 fixture 放宽此列，覆盖旧数据兼容。
  const taskSchema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='task'").get().sql;
  db.exec('DROP TABLE task');
  db.exec(taskSchema.replace('publish_date TEXT NOT NULL','publish_date TEXT'));
  const now = Date.now();
  db.prepare("INSERT INTO task_node (id,name,type,parent_id,path,created_at,updated_at) VALUES ('recent-group','Group','0','1','/1/',?,?)").run(now,now);
  db.prepare("INSERT INTO task_node (id,name,type,parent_id,path,created_at,updated_at) VALUES ('recent-table','Recent table','1','recent-group','/1/recent-group/',?,?)").run(now,now);
  const insert = db.prepare('INSERT INTO task (id,title,status,table_id,difficulty,publish_date,target_date,done_date,shutdown_date,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
  for (const status of ['1','2']) for (const [i, difficulty] of [null,0,0.5,3,5].entries()) {
    insert.run(status+'-'+i, 'Recent '+i, status, 'recent-table', difficulty, '2026-11-01','2026-11-09','2026-11-09','2026-11-09',now,now);
  }
  insert.run('missing','Orphan','2','missing-table',2,'2026-11-01','2026-11-09','2026-11-09',null,now,now);
  const before = db.prepare('SELECT total_changes() AS n').get().n;
  const report = statsReport(db, {range:'30d'});
  for (const [key,status] of [['recentDone','2'],['recentShutdown','1']]) {
    for (const [i, expected] of [0,0,0.5,3,5].entries()) {
      const row = report.lists[key].find(r => r.id === status+'-'+i);
      assert.equal(row.difficulty,expected);
      assert.equal(row.tableId,'recent-table'); assert.equal(row.groupId,'recent-group');
      assert.equal(row.tableDeleted,false); assert.equal(row.tableTitle,'Recent table');
    }
  }
  const orphan = report.lists.recentDone.find(r=>r.id==='missing');
  assert.equal(orphan.tableDeleted,true); assert.equal(orphan.tableId,null); assert.equal(orphan.groupId,null);
  assert.equal(orphan.tableTitle,'已删除任务表');
  assert.equal(db.prepare('SELECT total_changes() AS n').get().n,before,'report remains read-only');
  // 发布清单不限状态，与统计区间无关；空日期排末尾，日期相同再按更新时间和 id 倒序。
  const d = new Date(), today = [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
  for (const status of ['0','1','2','3']) insert.run('publish-'+status,'Published '+status,status,'recent-table',2.5,today,today,null,null,now,now+10);
  insert.run('publish-newest','Newest','0','recent-table',null,today,today,null,null,now,now+20);
  insert.run('legacy-null','Old null','0','recent-table',null,null,today,null,null,now,now+100);
  insert.run('legacy-empty','Old empty','3','missing-table',0,'',today,null,null,now,now+100);
  insert.run('deleted-publish','Deleted','0','recent-table',3,'9999-12-31',today,null,null,now,now);
  db.prepare("UPDATE task SET deleted_at=? WHERE id='deleted-publish'").run(now);
  const beforePublish = db.prepare('SELECT total_changes() AS n').get().n;
  const published = statsReport(db,{from:'2000-01-01',to:'2000-01-02',recentPublishLimit:50}).lists.recentPublish;
  assert.equal(published[0].id,'publish-newest'); assert.equal(published[0].date,today); assert.equal(published[0].daysAgo,0);
  assert.deepEqual(published.filter(r=>/^publish-[0-3]$/.test(r.id)).map(r=>r.id),['publish-3','publish-2','publish-1','publish-0']);
  const livePublish = published.find(r=>r.id==='publish-2');
  assert.equal(livePublish.difficulty,2.5); assert.equal(livePublish.tableId,'recent-table'); assert.equal(livePublish.groupId,'recent-group');
  assert.equal(livePublish.tableDeleted,false); assert.equal(livePublish.tableTitle,'Recent table');
  assert.ok(!published.some(r=>r.id==='deleted-publish'));
  assert.deepEqual(new Set(published.slice(-2).map(r=>r.id)),new Set(['legacy-null','legacy-empty']));
  for (const row of published.slice(-2)) { assert.equal(row.date,''); assert.equal(row.daysAgo,null); }
  assert.equal(published.find(r=>r.id==='legacy-empty').tableDeleted,true);
  assert.equal(statsReport(db,{}).lists.recentPublish.length,10);
  assert.equal(statsReport(db,{recentPublishLimit:-1}).lists.recentPublish.length,1);
  assert.equal(statsReport(db,{recentPublishLimit:2.9}).lists.recentPublish.length,2);
  assert.equal(statsReport(db,{recentPublishLimit:'bad'}).lists.recentPublish.length,10);
  assert.equal(db.prepare('SELECT total_changes() AS n').get().n,beforePublish,'publish report remains read-only');
  for (let i=0;i<55;i++) insert.run('limit-'+i,'Limit','0','recent-table',1,today,today,null,null,now,now);
  assert.equal(statsReport(db,{recentPublishLimit:999}).lists.recentPublish.length,50);
  db.prepare("UPDATE task_node SET deleted_at=? WHERE id='recent-table'").run(now);
  const deleted = statsReport(db, {range:'all',recentDoneLimit:2,recentShutdownLimit:1});
  assert.equal(deleted.lists.recentDone.length,2); assert.equal(deleted.lists.recentShutdown.length,1);
  assert.ok(deleted.lists.recentShutdown.every(r=>r.tableDeleted && r.tableId===null));
  console.log('RECENT BACKEND PASS: both statuses, null/zero/half stars, table navigation, deleted/orphan tables, limits, read-only');
} finally { db.close(); }
