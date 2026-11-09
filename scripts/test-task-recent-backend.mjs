import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { ensureSchema } from '../packages/addons/tasks/lib/db/db.js';
import { statsReport } from '../packages/addons/tasks/lib/stats/stats.js';
const db = new DatabaseSync(':memory:');
try {
  ensureSchema(db, () => {});
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
  db.prepare("UPDATE task_node SET deleted_at=? WHERE id='recent-table'").run(now);
  const deleted = statsReport(db, {range:'all',recentDoneLimit:2,recentShutdownLimit:1});
  assert.equal(deleted.lists.recentDone.length,2); assert.equal(deleted.lists.recentShutdown.length,1);
  assert.ok(deleted.lists.recentShutdown.every(r=>r.tableDeleted && r.tableId===null));
  console.log('RECENT BACKEND PASS: both statuses, null/zero/half stars, table navigation, deleted/orphan tables, limits, read-only');
} finally { db.close(); }
