import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { setup } from "../packages/addons/storage/lib/index.js";
const db = new DatabaseSync(":memory:"), defs = {}, events = [];
let tags = false;
db.exec("CREATE TABLE sync_change_log(seq INTEGER PRIMARY KEY,table_name TEXT,row_id TEXT,op TEXT,payload TEXT,origin TEXT,updated_at INTEGER)");
setup({ db, action: (n,d) => defs[n]=d, emit: (...a) => events.push(a), log() {}, hasAddon: () => tags });
const call = (n,a={}, origin="ui") => defs[n].execute(a,{origin});
const make = name => call("storage.create",{name}).storage.id;
const bulk = ids => call("storage.bulkDelete",{ids});
const count = () => db.prepare("SELECT COUNT(*) n FROM sync_change_log").get().n;
assert.deepEqual(defs["storage.bulkDelete"].input.required,["ids"]);
assert.equal(defs["storage.bulkDelete"].input.properties.ids.maxItems,500);
for (const ids of [undefined,null,"x",[null],[{}],[" "],[false],[Infinity],Array(501).fill("a")]) assert.throws(()=>bulk(ids),/ids/);
assert.deepEqual(bulk([]),{deleted:0,skipped:0,ids:[]});
const a=make("A"), b=make("B"), dead=make("Dead");
call("storage.delete",{id:dead});
let logs=count(), ev=events.length;
assert.deepEqual(bulk([a,a," "+b+" ",dead,"missing","missing"]),{deleted:2,skipped:2,ids:[a,b]});
assert.equal(count()-logs,2); assert.equal(events.length-ev,1);
logs=count(); ev=events.length;
assert.deepEqual(bulk([a,b,dead]),{deleted:0,skipped:3,ids:[]});
assert.equal(count(),logs); assert.equal(events.length,ev);
db.exec("CREATE TABLE tag(id TEXT PRIMARY KEY,name TEXT,deleted_at INTEGER); INSERT INTO tag VALUES('tag','Test',NULL); CREATE TABLE tag_mapping(id TEXT PRIMARY KEY,tag_id TEXT,item_id TEXT,item_type TEXT,created_at INTEGER,updated_at INTEGER,deleted_at INTEGER,rev INTEGER)");
tags=true;
const c=make("C"), d=make("D");
for(const id of [c,d]) call("storage.update",{id,tagIds:["tag"]});
db.prepare("INSERT INTO tag_mapping VALUES('foreign','tag',?,'site',1,1,NULL,1)").run(c);
const snapshot=()=>JSON.stringify([db.prepare("SELECT * FROM storage ORDER BY id").all(),db.prepare("SELECT * FROM tag_mapping ORDER BY id").all(),db.prepare("SELECT * FROM sync_change_log ORDER BY seq").all()]);
for(const condition of ["NEW.table_name='storage' AND NEW.row_id='"+d+"'", "NEW.table_name='tag_mapping' AND json_extract(NEW.payload,'$.item_id')='"+d+"'"]) {
  const before=snapshot(); ev=events.length;
  db.exec("CREATE TRIGGER fail_log BEFORE INSERT ON sync_change_log WHEN "+condition+" BEGIN SELECT RAISE(ABORT,'bulk rollback'); END");
  assert.throws(()=>bulk([c,d]),/bulk rollback/);
  assert.equal(snapshot(),before); assert.equal(events.length,ev);
  db.exec("DROP TRIGGER fail_log");
}
logs=count();
assert.deepEqual(bulk([c,d,dead]),{deleted:2,skipped:1,ids:[c,d]});
assert.equal(count()-logs,4);
for(const row of db.prepare("SELECT * FROM sync_change_log WHERE seq>(SELECT MAX(seq)-4 FROM sync_change_log)").all()) {
  const payload=JSON.parse(row.payload); assert.ok(payload.deleted_at); assert.equal(row.op,"delete"); assert.ok(payload.rev>1);
}
assert.equal(db.prepare("SELECT deleted_at FROM tag_mapping WHERE id='foreign'").get().deleted_at,null);
const e=make("E"); call("storage.update",{id:e,tagIds:["tag"]}); tags=false;
bulk([e]); assert.equal(db.prepare("SELECT deleted_at FROM tag_mapping WHERE item_id=?").get(e).deleted_at,null);
const f=make("F"); logs=count(); call("storage.bulkDelete",{ids:[f]},"sync"); assert.equal(count(),logs);
// Page boundary and list/search/tag consistency use the real action implementations.
tags=true;
for(let i=0;i<5;i++) call("storage.create",{name:"Page "+i,tagIds:["tag"]});
const args={pageSize:4,pageNumber:2,text:"Page",tagIds:["tag"]};
const last=call("storage.list",args); assert.equal(last.records.length,1);
bulk(last.records.map(r=>r.id));
const after=call("storage.list",args); assert.equal(after.current,1); assert.equal(after.pages,1); assert.equal(after.total,4);
assert.equal(call("storage.list",{text:"Page"}).total,4);
assert.equal(call("storage.list",{tagIds:["tag"]}).total,4);
db.close(); console.log("PASS storage bulk: validation, dedupe, idempotency, logs, mappings, two late-failure rollback paths, optional tags, sync origin, pagination/search/filter");
