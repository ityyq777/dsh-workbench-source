/** Two real SQLite connections, same temporary database: no production profile. */
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { setup } from '../packages/addons/tasks/lib/index.js';
import { createTask } from '../packages/addons/tasks/lib/task-create.js';
const apiFor=db=>({db,addon:{version:'test'},log(){},hasDomain:()=>false,emit(){},action(){}});
if (!isMainThread) {
 const db=new DatabaseSync(workerData.file);
 db.exec('PRAGMA busy_timeout='+workerData.timeout);
 try {
  parentPort.postMessage({ok:true,result:createTask(db,{title:'Concurrent',tablePath:'parallel/shared',createMissing:true,pathDescriptions:['concurrent work','shared task table'],dedupeKey:workerData.dedupeKey},'agent',apiFor(db))});
 } catch(error) { parentPort.postMessage({ok:false,code:error.code,message:error.message,details:error.details}); }
 finally { db.close(); }
} else {
 const home=mkdtempSync(join(tmpdir(),'wb-ownership-concurrent-')), file=join(home,'test.sqlite');
 const db=new DatabaseSync(file);
 db.exec('CREATE TABLE sync_change_log(id INTEGER PRIMARY KEY,table_name TEXT,row_id TEXT,op TEXT,payload TEXT,origin TEXT,updated_at INTEGER)');
 setup(apiFor(db));
 const worker=(dedupeKey,timeout=5000)=>new Promise((resolve,reject)=>{
  const child=new Worker(new URL(import.meta.url),{workerData:{file,dedupeKey,timeout}});
  let result;
  child.on('message',value=>{result=value;});child.on('error',reject);
  child.on('exit',code=>code===0 ? resolve(result) : reject(new Error('Worker exit '+code)));
 });
 try {
  const results=await Promise.all([worker('shared-key'),worker('shared-key')]);
  assert.ok(results.every(r=>r.ok),JSON.stringify(results));
  assert.equal(results.filter(r=>r.result.deduped).length,1);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM task').get().n,1);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM task_node WHERE name IN ('parallel','shared')").get().n,2);
  const firstTable=results[0].result.tableId;
  const nonDedupe=await Promise.all([worker(''),worker('')]);
  assert.ok(nonDedupe.every(r=>r.ok));assert.ok(nonDedupe.every(r=>r.result.tableId===firstTable));
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM task').get().n,3);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM task_node WHERE name IN ('parallel','shared')").get().n,2);
  const before=db.prepare('SELECT COUNT(*) AS n FROM sync_change_log').get().n;
  db.exec('BEGIN IMMEDIATE');
  const busy=await worker('busy',0);
  assert.equal(busy.code,'DATABASE_BUSY');assert.equal(busy.details.retryable,true);assert.match(busy.message,/未执行本次写入/);
  db.exec('ROLLBACK');
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM sync_change_log').get().n,before);
  console.log('TASK OWNERSHIP CONCURRENCY PASS: same-path reuse, single deduped task, no-key repeated tasks, busy retry diagnostic');
 } finally {
  db.close();
  assert.ok(resolve(home).startsWith(resolve(tmpdir())+'/wb-ownership-concurrent-'));
  rmSync(home,{recursive:true,force:true});
 }
}
