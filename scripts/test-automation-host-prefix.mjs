/**
 * 宿主内置自动化加 host 前缀后的回归测试：两套自动化能互不干扰地共存。
 *
 * 覆盖四件事：
 * 1) 19 个宿主 action 全部叫 host.automation.*，没有残留的 automation.*；
 * 2) 宿主只读写 host_automation_*，新建库里不存在 automation_* 表；
 * 3) 旧库升级：老表数据搬进新表 → 老表改名 automation_*_legacy_<版本> → 重复启动不重复搬；
 * 4) 备份模块 id 改成 wb-shell，老备份里的 wb-addon-automation 模块按别名导回；
 * 5) 检测到插件同装时只记共存日志，不再停掉宿主引擎。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const { openDb } = await import("../packages/core/lib/index.js");
const { registerAutomationActions } = await import("../packages/shell/lib/infra/automation/index.js");
const { canonicalModuleId } = await import("../packages/shell/lib/infra/backup.js");
const { isDenied, DENIED_PATTERNS } = await import("../packages/shell/lib/infra/automation/whitelist.js");

/** 收集宿主注册了哪些 action 名。 */
function registeredNames() {
  const names = [];
  registerAutomationActions({ action: (name) => names.push(name), db: null }, {});
  return names;
}

test("宿主 action 全部带 host 前缀，且没有 automation.* 残留", () => {
  const names = registeredNames();
  assert.equal(names.length, 19, "宿主应有 19 个自动化 action");
  for (const name of names) assert.ok(name.startsWith("host.automation."), "应带 host 前缀：" + name);
  assert.equal(
    names.filter((name) => /^automation\./.test(name)).length,
    0,
    "不得再注册无前缀的 automation.*",
  );
});

test("新建库只有 host_automation_*，没有 automation_* 表", () => {
  const db = openDb(":memory:");
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%automation%'")
    .all()
    .map((row) => row.name)
    .sort();
  assert.deepEqual(tables, ["host_automation_meta", "host_automation_rule", "host_automation_run"]);
  db.close();
});

test("旧库升级：老表搬进新表、老表改名留档、重复启动不重复搬", () => {
  const dir = mkdtempSync(join(tmpdir(), "wb-auto-prefix-"));
  const file = join(dir, "workbench.db");
  // 造一个「旧版」库：只有 automation_* 三张表，各放一条数据。
  {
    const legacy = new DatabaseSync(file);
    legacy.exec(`
      CREATE TABLE automation_rule (
        id TEXT PRIMARY KEY, name TEXT, enabled INTEGER DEFAULT 1,
        trigger_type TEXT, trigger_config TEXT, action_name TEXT, action_args TEXT,
        next_run_at INTEGER, created_at INTEGER, updated_at INTEGER
      );
      CREATE TABLE automation_run (id TEXT PRIMARY KEY, rule_id TEXT, trigger TEXT, status TEXT, started_at INTEGER);
      CREATE TABLE automation_meta (key TEXT PRIMARY KEY, value TEXT);
    `);
    legacy
      .prepare(
        "INSERT INTO automation_rule(id,name,enabled,trigger_type,trigger_config,action_name,action_args,next_run_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)",
      )
      .run("rule_old", "旧规则", 1, "manual", "{}", "tasks.list", "{}", null, 1, 1);
    legacy.prepare("INSERT INTO automation_run(id,rule_id,trigger,status,started_at) VALUES(?,?,?,?,?)").run("run_old", "rule_old", "manual", "ok", 1);
    legacy.prepare("INSERT INTO automation_meta(key,value) VALUES(?,?)").run("allowed-actions", "[]");
    legacy.close();
  }

  const count = (db, table) => db.prepare("SELECT COUNT(*) AS n FROM " + table).get().n;

  const db = openDb(file, "0.17.0");
  assert.equal(count(db, "host_automation_rule"), 1, "旧规则应搬进新表");
  assert.equal(count(db, "host_automation_run"), 1, "旧运行记录应搬进新表");
  assert.equal(count(db, "host_automation_meta"), 1, "旧 meta 应搬进新表");
  assert.equal(db.prepare("SELECT name FROM host_automation_rule WHERE id='rule_old'").get().name, "旧规则");
  // 老表改名留一版，名字带版本号（点号换成下划线）。
  const legacyNames = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'automation\\_%\\_legacy\\_%' ESCAPE '\\'")
    .all()
    .map((row) => row.name)
    .sort();
  assert.deepEqual(legacyNames, [
    "automation_meta_legacy_0_17_0",
    "automation_rule_legacy_0_17_0",
    "automation_run_legacy_0_17_0",
  ]);
  assert.equal(count(db, "automation_rule_legacy_0_17_0"), 1, "老表数据要保留一版");
  db.close();

  // 第二次启动：老表已经改名，不该再搬一次，也不该覆盖新表。
  const again = openDb(file, "0.17.0");
  assert.equal(count(again, "host_automation_rule"), 1, "重复启动不应重复搬");
  assert.equal(count(again, "automation_rule_legacy_0_17_0"), 1);
  again.close();
});

test("备份模块 id 改成 wb-shell，老备份的 wb-addon-automation 仍能导回", () => {
  const source = readFileSync(new URL("../packages/shell/src/index.ts", import.meta.url), "utf8");
  assert.match(source, /id: "wb-shell",\s*\n\s*title: "自动化（宿主内置）"/, "备份模块 id 应是 wb-shell");
  assert.equal(canonicalModuleId("wb-addon-automation"), "wb-shell");
  assert.equal(canonicalModuleId("wb-shell"), "wb-shell");
  assert.equal(canonicalModuleId("tasks"), "tasks");
});

test("硬底线拦住 host.automation.*，界面清单同步", () => {
  assert.equal(isDenied("host.automation.ruleCreate"), true);
  assert.equal(isDenied("automation.ruleCreate"), true);
  assert.equal(isDenied("tasks.list"), false);
  assert.ok(DENIED_PATTERNS.includes("host.automation.*"));
});

test("插件同装时只记日志：宿主引擎不再被停掉", () => {
  const source = readFileSync(new URL("../packages/shell/src/index.ts", import.meta.url), "utf8");
  const block = source.slice(source.indexOf("const timer = setTimeout("), source.indexOf("if (typeof timer.unref"));
  assert.ok(block.includes("domains.has(\"wb-addon-automation\")"), "仍要识别插件是否安装");
  assert.ok(!block.includes("automation.stop()"), "共存分支不得停掉宿主引擎");
  assert.ok(block.includes("两套自动化共存"), "应记一条共存日志");
});
