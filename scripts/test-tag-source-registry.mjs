/**
 * 标签域「来源注册」契约测试：
 *  - 内置来源 seed 幂等；注册幂等；重复来源不抛错但标记 conflict；
 *  - 未注册 / 重复来源时 tags.link / tags.unlink 抛带 code 的可读错误；
 *  - 绕过 action 直接写 tag_mapping 也被库层触发器拦截；
 *  - 老库既有 item_type 自动补 legacy；备份导入旧数据不回归；注销保护。
 */
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = mkdtempSync(join(tmpdir(), "wb-tag-source-"));
const mod = await import("../packages/addons/tags/lib/index.js");

function assert(cond, msg) {
  if (!cond) throw new Error("ASSERT: " + msg);
}
function base(d) {
  d.exec(
    "CREATE TABLE IF NOT EXISTS sync_change_log (seq INTEGER PRIMARY KEY AUTOINCREMENT, table_name TEXT NOT NULL, row_id TEXT NOT NULL, op TEXT NOT NULL, payload TEXT, origin TEXT NOT NULL, updated_at INTEGER NOT NULL)",
  );
}
function makeApi(db) {
  const defs = {};
  const events = [];
  const api = {
    db,
    addon: { id: "wb-addon-tags", version: "1.7.1", dir: dir },
    shellVersion: "0.1.0",
    log: function () {},
    emit: function (event, data) { events.push({ event: event, data: data }); },
    action: function (name, def) { defs[name] = def; },
    tool: function () {},
    events: events,
    defs: defs,
  };
  return api;
}
function call(api, name, args) {
  const def = api.defs[name];
  if (!def) throw new Error("未注册的 action：" + name);
  return def.execute(args || {}, { origin: "ui", emit: api.emit });
}
function errOf(fn) {
  try {
    fn();
  } catch (e) {
    return e;
  }
  return null;
}

// ---- 1. 全新库：seed + 注册语义 -----------------------------------------
const db = new DatabaseSync(join(dir, "a.db"));
base(db);
const api = makeApi(db);
mod.setup(api);

let r = call(api, "tags.sources");
assert(r.table === true, "tag_source 表应已创建");
assert(r.total === 3, "应 seed 三个内置来源，实际 " + r.total);
assert(r.conflicts.length === 0, "初始无冲突");
const builtin = r.sources.map(function (s) { return s.source + ":" + s.owners[0].owner; }).sort();
assert(
  JSON.stringify(builtin) === JSON.stringify(["site:wb-addon-sites", "storage:wb-addon-storage", "task:wb-addon-tasks"]),
  "内置来源不符：" + builtin.join(","),
);
assert(r.unregistered.length === 0, "初始无未注册来源");

// seed 幂等：再跑一次 setup 不应新增行
mod.setup(api);
assert(db.prepare("SELECT COUNT(*) AS n FROM tag_source").get().n === 3, "seed 应幂等");

// 同 owner 重复注册：幂等，不算冲突
r = call(api, "tags.registerSource", { source: "task", owner: "wb-addon-tasks" });
assert(r.ok === true && r.existing === true && r.created === false, "同 owner 注册应幂等");
assert(r.conflict === false && r.conflicts.length === 0, "同 owner 不算冲突");

// 不同 owner 抢同一 source：写入成功但返回 conflict，不抛错
r = call(api, "tags.registerSource", { source: "task", owner: "wb-addon-other", title: "另一个任务域" });
assert(r.ok === true && r.created === true, "重复来源仍写入（不抛错）");
assert(r.conflict === true && r.conflicts.length === 1 && r.conflicts[0].owner === "wb-addon-tasks", "应返回冲突方");
assert(/来源标识重复/.test(String(r.message)) && /wb-addon-other/.test(String(r.message)), "冲突文案应含来源与归属：" + r.message);
assert(db.prepare("SELECT COUNT(*) AS n FROM tag_source WHERE source='task' AND deleted_at IS NULL").get().n === 2, "重复行确实落库");

// sources 标出冲突
r = call(api, "tags.sources");
assert(r.conflicts.indexOf("task") >= 0, "sources 应标出重复来源");
const taskRow = r.sources.filter(function (s) { return s.source === "task"; })[0];
assert(taskRow.conflict === true && taskRow.registered === false && taskRow.owners.length === 2, "task 行应标记冲突");

// ---- 2. 重复来源时 action 层门禁 ----------------------------------------
const tagId = call(api, "tags.create", { name: "冲突标签" }).id;
let e = errOf(function () { call(api, "tags.link", { tagIds: [tagId], itemIds: ["t1"], itemType: "task" }); });
assert(e && e.code === "TAG_SOURCE_DUPLICATED", "重复来源 link 应抛 TAG_SOURCE_DUPLICATED，实际 " + (e && e.code));
assert(/来源标识重复/.test(e.message) && /wb-addon-other/.test(e.message), "错误文案应含归属列表：" + e.message);

e = errOf(function () { call(api, "tags.unlink", { itemIds: ["t1"], itemType: "task" }); });
assert(e && e.code === "TAG_SOURCE_DUPLICATED", "重复来源 unlink 也应拦下");

// ---- 3. 未注册来源 ------------------------------------------------------
e = errOf(function () { call(api, "tags.link", { tagIds: [tagId], itemIds: ["d1"], itemType: "device" }); });
assert(e && e.code === "TAG_SOURCE_UNREGISTERED", "未注册来源应抛 TAG_SOURCE_UNREGISTERED，实际 " + (e && e.code));
assert(/标签来源未注册/.test(e.message), "未注册文案：" + e.message);

// 绕过 action 直接写：库层触发器兜底
const ts = Date.now();
e = errOf(function () {
  db.prepare("INSERT INTO tag_mapping(id,tag_id,item_id,item_type,created_at,updated_at,deleted_at,rev) VALUES(?,?,?,?,?,?,NULL,1)")
    .run("raw-m1", tagId, "d1", "device", ts, ts);
});
assert(e, "未注册来源的直接 INSERT 应被触发器拦截");
assert(/标签来源未注册或重复/.test(String(e.message)) && /device/.test(String(e.message)), "触发器错误应含来源标识：" + e.message);
assert(db.prepare("SELECT COUNT(*) AS n FROM tag_mapping WHERE id='raw-m1'").get().n === 0, "被拦截的行不应落库");

// 已注册来源的直接写入照常
db.prepare("INSERT INTO tag_mapping(id,tag_id,item_id,item_type,created_at,updated_at,deleted_at,rev) VALUES(?,?,?,?,?,?,NULL,1)")
  .run("raw-m2", tagId, "s1", "site", ts, ts);
assert(db.prepare("SELECT COUNT(*) AS n FROM tag_mapping WHERE id='raw-m2'").get().n === 1, "已注册来源的直接写入应成功");

// ---- 4. 注销保护与恢复 --------------------------------------------------
e = errOf(function () { call(api, "tags.unregisterSource", { source: "site" }); });
assert(e && e.code === "TAG_SOURCE_IN_USE", "仍有映射时注销应抛 TAG_SOURCE_IN_USE，实际 " + (e && e.code));

r = call(api, "tags.unregisterSource", { source: "task", owner: "wb-addon-other" });
assert(r.removed === 1 && r.missing === false, "注销重复行应移除 1 条");
r = call(api, "tags.sources");
assert(r.conflicts.length === 0, "清理后不应再有冲突");

// 恢复正常后 link 成功
r = call(api, "tags.link", { tagIds: [tagId], itemIds: ["t1"], itemType: "task" });
assert(r.linked === 1, "恢复注册后 link 应成功");
e = errOf(function () { call(api, "tags.unlink", { itemIds: ["t1"], itemType: "task" }); });
assert(!e, "恢复注册后 unlink 应成功：" + (e && e.message));

r = call(api, "tags.unregisterSource", { source: "task", owner: "nope-owner" });
assert(r.removed === 0 && r.missing === true, "注销不存在的归属应为 no-op");

// 直接删注册行模拟「人为破坏」：有映射的来源仍会被列出并标记未注册，写入被拒
r = call(api, "tags.link", { tagIds: [tagId], itemIds: ["st1"], itemType: "storage" });
assert(r.linked === 1, "storage 正常注册时应可写入");
db.prepare("DELETE FROM tag_source WHERE source='storage'").run();
r = call(api, "tags.sources");
assert(r.unregistered.indexOf("storage") >= 0, "删除注册行后 sources 应列出未注册来源");
const stRow = r.sources.filter(function (s) { return s.source === "storage"; })[0];
assert(stRow.mappings === 1 && stRow.owners.length === 0, "未注册来源应带映射数且无归属");
e = errOf(function () { call(api, "tags.link", { tagIds: [tagId], itemIds: ["st2"], itemType: "storage" }); });
assert(e && e.code === "TAG_SOURCE_UNREGISTERED", "被删注册行后应拒绝写入");
// 重新注册恢复
call(api, "tags.registerSource", { source: "storage", owner: "wb-addon-storage" });
r = call(api, "tags.link", { tagIds: [tagId], itemIds: ["st2"], itemType: "storage" });
assert(r.linked === 1, "重新注册后 storage 写入应恢复");

// ---- 5. 参数校验 --------------------------------------------------------
assert(errOf(function () { call(api, "tags.registerSource", { source: "  ", owner: "x" }); }), "空 source 应报错");
assert(errOf(function () { call(api, "tags.registerSource", { source: "bad id", owner: "x" }); }), "非法 source 应报错");
assert(errOf(function () { call(api, "tags.registerSource", { source: "ok", owner: "" }); }), "空 owner 应报错");
assert(errOf(function () { call(api, "tags.registerSource", { source: "x".repeat(33), owner: "x" }); }), "超长 source 应报错");

// ---- 6. 老库兜底：既有 item_type 自动补 legacy ---------------------------
const db2 = new DatabaseSync(join(dir, "b.db"));
base(db2);
db2.exec(
  "CREATE TABLE tag (id TEXT PRIMARY KEY,name TEXT NOT NULL,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL,deleted_at INTEGER,rev INTEGER NOT NULL DEFAULT 1);" +
    "CREATE TABLE tag_mapping (id TEXT PRIMARY KEY,tag_id TEXT NOT NULL,item_id TEXT NOT NULL,item_type TEXT NOT NULL,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL,deleted_at INTEGER,rev INTEGER NOT NULL DEFAULT 1);",
);
db2.prepare("INSERT INTO tag VALUES('t-old','老标签',?,?,NULL,1)").run(ts, ts);
db2.prepare("INSERT INTO tag_mapping VALUES('m-old','t-old','obj-1','device',?,?,NULL,1)").run(ts, ts);
db2.prepare("INSERT INTO tag_mapping VALUES('m-old2','t-old','obj-2','task',?,?,NULL,1)").run(ts, ts);
const api2 = makeApi(db2);
mod.setup(api2);
r = call(api2, "tags.sources");
const legacy = r.sources.filter(function (s) { return s.source === "device"; })[0];
assert(legacy && legacy.registered === true && legacy.owners[0].owner === "legacy", "既有 device 映射应补 legacy 注册");
assert(legacy.mappings === 1, "legacy 来源应统计到 1 条映射");
assert(r.unregistered.length === 0, "老库升级后不应有未注册来源");
// 老数据可继续读写（触发 UPDATE 路径）
db2.prepare("UPDATE tag_mapping SET deleted_at=?, updated_at=?, rev=rev+1 WHERE id='m-old'").run(ts, ts);
assert(db2.prepare("SELECT deleted_at FROM tag_mapping WHERE id='m-old'").get().deleted_at === ts, "老映射仍可更新");
r = call(api2, "tags.link", { tagIds: ["t-old"], itemIds: ["obj-3"], itemType: "device" });
assert(r.linked === 1, "legacy 来源应可继续写入");

// ---- 7. 备份导入：旧 item_type 自动补注册，不整批失败 -------------------
const db3 = new DatabaseSync(join(dir, "c.db"));
base(db3);
const api3 = makeApi(db3);
mod.setup(api3);
const exported = call(api3, "tags.create", { name: "导入标签" });
const backup = JSON.stringify({
  schemaVersion: 1,
  tags: [{ id: "imp-tag", name: "导入标签2", created_at: ts, updated_at: ts, deleted_at: null, rev: 1 }],
  mappings: [
    { id: "imp-m1", tag_id: exported.id, item_id: "x1", item_type: "device", created_at: ts, updated_at: ts, deleted_at: null, rev: 1 },
    { id: "imp-m2", tag_id: "imp-tag", item_id: "x2", item_type: "task", created_at: ts, updated_at: ts, deleted_at: null, rev: 1 },
  ],
});
const importResult = (await import("../packages/addons/tags/lib/infra/backup.js")).importTagsData(api3, backup, { policy: "newest" });
assert(importResult.ok === true, "导入应成功：" + JSON.stringify(importResult));
assert(importResult.failed === 0, "导入不应有失败行");
assert(db3.prepare("SELECT COUNT(*) AS n FROM tag_mapping WHERE id IN ('imp-m1','imp-m2')").get().n === 2, "两条映射都应落库");
const devRows = db3.prepare("SELECT * FROM tag_source WHERE source='device' AND deleted_at IS NULL").all();
assert(devRows.length === 1 && String(devRows[0].owner) === "legacy", "导入的未知 item_type 应补 legacy 注册");

rmSync(dir, { recursive: true, force: true });
console.log("TAG SOURCE REGISTRY PASS: seed idempotent, duplicate conflict, unregistered/duplicated gate, trigger fallback, legacy backfill, import, unregister guard");
