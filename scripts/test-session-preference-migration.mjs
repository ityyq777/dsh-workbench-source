/** 用隔离的历史库验证升级范围与重复启动。 */
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { openDb } from "../packages/core/lib/index.js";

const dir = mkdtempSync(join(tmpdir(), "wb-preference-upgrade-"));
try {
  for (const version of ["fresh", "record", "transition"]) {
    const file = join(dir, version + ".db");
    const seed = new DatabaseSync(file);
    seed.exec("CREATE TABLE task(id INTEGER PRIMARY KEY, title TEXT); INSERT INTO task VALUES(42,'旧任务')");
    if (version !== "fresh") {
      seed.exec("CREATE TABLE session_mode(session_id TEXT PRIMARY KEY, enabled INTEGER, updated_at INTEGER); INSERT INTO session_mode VALUES('record',1,10)");
    }
    if (version === "transition") {
      seed.exec(`CREATE TABLE session_role(session_id TEXT PRIMARY KEY, role_id TEXT, role_version TEXT, enabled INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL);
        INSERT INTO session_role VALUES('role','wb-addon-tasks/publisher','1.0.0',1,11), ('record',NULL,NULL,1,10);`);
    }
    seed.close();
    for (let start = 1; start <= 2; start++) {
      const db = openDb(file);
      try {
        assert.equal(db.prepare("SELECT name FROM sqlite_master WHERE name='session_mode'").get(), undefined);
        assert.deepEqual(db.prepare("PRAGMA table_info(session_role)").all().map(row => row.name), ["session_id", "role_id", "role_version", "updated_at"]);
        assert.equal(db.prepare("SELECT title FROM task WHERE id=42").get().title, "旧任务");
        assert.equal(db.prepare("SELECT session_id FROM session_role WHERE session_id='record'").get(), undefined);
        const row = db.prepare("SELECT * FROM session_role WHERE session_id='role'").get();
        if (version === "transition") assert.deepEqual({...row}, {session_id: "role", role_id: "wb-addon-tasks/publisher", role_version: "1.0.0", updated_at: 11});
        else assert.equal(row, undefined);
      } finally { db.close(); }
    }
  }
  console.log("通过：新库、记录模式旧库、过渡版本库均连续启动两次，角色和业务数据保留，旧记录偏好清除。");
} finally { rmSync(dir, {recursive: true, force: true}); }
