import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, existsSync, statSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.WB_HOME = mkdtempSync(join(tmpdir(), "wb-vault-test-"));

const { ensureSchema, headerGet, deviceGet, deviceSet } = await import("../lib/db/db.js");
const { createVault } = await import("../lib/domain/vault.js");
const { createGroups } = await import("../lib/domain/groups.js");
const { registerVaultActions } = await import("../lib/domain/actions.js");
const { KDF_DEFAULT, deriveKey, seal, secretAad } = await import("../lib/infra/crypto.js");

function makeVault() {
  const db = new DatabaseSync(":memory:");
  ensureSchema(db);
  const vault = createVault({ db });
  const groups = createGroups({ db });
  const actions = new Map();
  registerVaultActions(
    { db, now: () => Date.now(), action: (name, def) => actions.set(name, def) },
    vault,
    groups,
  );
  const run = (name, args = {}, origin = "ui") => actions.get(name).execute(args, { origin });
  return { db, vault, groups, run };
}

const PASS = "correct-horse-1";

test("A 模式初始化、加密落库、解锁/失败锁", () => {
  const { db, run } = makeVault();
  run("vault.setup", { passphrase: PASS, mode: "A" });
  const st = run("vault.status");
  assert.equal(st.initialized, true);
  assert.equal(st.locked, false);
  assert.equal(st.unlockMode, "A");
  assert.equal(st.schemaVersion, 2);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM vault_header").get().n, 1);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM vault_device").get().n, 1);

  run("vault.secretCreate", { name: "rss", kind: "password", secret: "s3cret-value", meta: { username: "me" } });
  const row = db.prepare("SELECT * FROM vault_secret").get();
  assert.ok(row.ciphertext.startsWith("v1:"));
  assert.ok(!row.ciphertext.includes("s3cret-value"));
  assert.ok(!JSON.stringify(row).includes("s3cret-value"));

  const listed = run("vault.secretList", {}, "agent");
  assert.equal(listed.items.length, 1);
  assert.equal(listed.items[0].name, "rss");
  assert.equal(listed.items[0].ciphertext, undefined);
  assert.equal(listed.items[0].lastUsedAt, null);

  assert.equal(run("vault.secretReveal", { id: row.id }).secret, "s3cret-value");
  assert.equal(run("vault.secretList").items[0].lastUsedAt > 0, true);
  assert.throws(() => run("vault.secretReveal", { id: row.id }, "agent"), /不允许 agent/);

  run("vault.lock");
  assert.equal(run("vault.status").locked, true);
  assert.throws(() => run("vault.unlock", { passphrase: "wrong-pass-1" }), /口令错误/);
  run("vault.unlock", { passphrase: PASS });
  assert.equal(run("vault.status").locked, false);
});

test("B 模式 device key 自动解锁，reveal 仍要口令", () => {
  process.env.WB_HOME = mkdtempSync(join(tmpdir(), "wb-vault-test-b-"));
  const { run } = makeVault();
  run("vault.setup", { passphrase: PASS, mode: "B" });
  const keyPath = join(process.env.WB_HOME, "vault-device.key");
  assert.equal(existsSync(keyPath), true);
  assert.equal(statSync(keyPath).mode & 0o777, 0o600);

  run("vault.secretCreate", { name: "imap", kind: "app_password", secret: "app-pass" });
  run("vault.lock");
  assert.equal(run("vault.status").locked, false, "B 模式 status 应自动解锁");
  const id = run("vault.secretList").items[0].id;
  assert.throws(() => run("vault.secretReveal", { id }), /需要口令/);
  assert.equal(run("vault.secretReveal", { id, passphrase: PASS }).secret, "app-pass");
});

test("plugin lease 可用，ui/agent 不可用；改口令后可解锁", () => {
  const { run, vault } = makeVault();
  run("vault.setup", { passphrase: PASS, mode: "A" });
  run("vault.secretCreate", { name: "token1", kind: "token", secret: "tok-123" });
  const id = run("vault.secretList").items[0].id;
  assert.equal(run("vault.lease", { id, purpose: "test" }, "plugin").secret, "tok-123");
  assert.throws(() => run("vault.lease", { id }, "ui"), /不允许 ui/);
  assert.throws(() => run("vault.lease", { id }, "agent"), /不允许 agent/);

  run("vault.changePassphrase", { oldPassphrase: PASS, newPassphrase: "next-pass-22" });
  run("vault.lock");
  assert.throws(() => run("vault.unlock", { passphrase: PASS }), /口令错误/);
  run("vault.unlock", { passphrase: "next-pass-22" });
  assert.equal(run("vault.status").locked, false);
  assert.deepEqual(vault.exportData().secrets, []);
});

test("分组、关联与按组可见凭据", () => {
  const { db, run } = makeVault();
  run("vault.setup", { passphrase: PASS, mode: "A" });
  const groupId = run("vault.groupCreate", { name: "sspai", description: "少数派账号" }).id;
  const otherId = run("vault.groupCreate", { name: "mail" }).id;
  assert.throws(() => run("vault.groupCreate", { name: "sspai" }), /同名分组/);

  const secId = run("vault.secretCreate", {
    name: "sspai-basic",
    kind: "password",
    secret: "pw-1",
    groupId,
    meta: { username: "me" },
  }).id;
  run("vault.secretCreate", { name: "imap", kind: "app_password", secret: "pw-2", groupId: otherId });
  assert.equal(run("vault.secretList", { groupId }).items.length, 1);
  assert.equal(run("vault.groupList").items.length, 2);
  const sspai = run("vault.groupList").items.find((g) => g.id === groupId);
  assert.equal(sspai.secretCount, 1);

  run("vault.subjectRegister", { type: "site", title: "站点" }, "plugin");
  const bound = run("vault.bind", { subjectType: "site", subjectId: "site_1", groupId }, "plugin");
  assert.ok(bound.id);
  assert.equal(run("vault.bind", { subjectType: "site", subjectId: "site_1", groupId }, "plugin").existing, true);
  assert.throws(() => run("vault.bind", { subjectType: "site", subjectId: "site_1", groupId }, "ui"), /不允许 ui/);

  const bindings = run("vault.bindingsOf", { subjectType: "site", subjectId: "site_1" }, "agent");
  assert.equal(bindings.items.length, 1);
  assert.equal(bindings.items[0].groupName, "sspai");
  assert.equal(bindings.items[0].secretCount, 1);

  const visible = run("vault.subjectSecrets", { subjectType: "site", subjectId: "site_1" }, "plugin");
  assert.deepEqual(visible.items.map((item) => item.id), [secId]);
  assert.equal(visible.items[0].ciphertext, undefined);

  assert.equal(run("vault.lease", { id: secId, subjectType: "site", subjectId: "site_1" }, "plugin").secret, "pw-1");
  assert.throws(
    () => run("vault.lease", { id: secId, subjectType: "site", subjectId: "site_404" }, "plugin"),
    /未绑定任何凭据组/,
  );

  run("vault.unbind", { subjectType: "site", subjectId: "site_1", groupId }, "plugin");
  assert.equal(run("vault.bindingsOf", { subjectType: "site", subjectId: "site_1" }).items.length, 0);

  run("vault.groupDelete", { id: otherId, moveTo: groupId });
  assert.equal(run("vault.secretList", { groupId }).items.length, 2);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM vault_group WHERE deleted_at IS NOT NULL").get().n, 1);
  run("vault.groupDelete", { id: groupId });
  assert.equal(
    db.prepare("SELECT COUNT(*) AS n FROM vault_secret WHERE group_id IS NOT NULL").get().n,
    0,
    "删组后凭据应移出分组",
  );
});

test("并发改口令：LWW + 提示", () => {
  const { db, run } = makeVault();
  run("vault.setup", { passphrase: PASS, mode: "A" });
  run("vault.changePassphrase", { oldPassphrase: PASS, newPassphrase: "second-pass-2" });
  // 模拟另一台设备已用新口令、而本机 device 记录还停在第 1 版
  deviceSet(db, { passphrase_rev_seen: 1 });
  run("vault.lock");
  assert.throws(() => run("vault.unlock", { passphrase: PASS }), /口令已在其他设备修改/);
  const ok = run("vault.unlock", { passphrase: "second-pass-2" });
  assert.match(String(ok.notice || ""), /口令已在其他设备修改/);
  assert.equal(headerGet(db).passphrase_rev, 2);
  assert.equal(deviceGet(db).passphrase_rev_seen, 2);
});

test("0.1.0 的 vault_meta 迁移到 header/device/usage", () => {
  const db = new DatabaseSync(":memory:");
  db.exec(
    "CREATE TABLE vault_meta(key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at INTEGER NOT NULL)",
  );
  db.exec(
    "CREATE TABLE vault_secret(id TEXT PRIMARY KEY, name TEXT NOT NULL, kind TEXT NOT NULL, meta TEXT NOT NULL DEFAULT '{}', " +
      "ciphertext TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, last_used_at INTEGER, " +
      "deleted_at INTEGER, rev INTEGER NOT NULL DEFAULT 1)",
  );
  const salt = randomBytes(16);
  const dek = randomBytes(32);
  const kek = deriveKey(PASS, salt.toString("base64"), KDF_DEFAULT);
  const wrapped = seal(kek, dek, "vault:dek");
  const ts = 1700000000000;
  const put = db.prepare("INSERT INTO vault_meta(key, value, updated_at) VALUES(?, ?, ?)");
  put.run("schema_version", "1", ts);
  put.run("salt", salt.toString("base64"), ts);
  put.run("kdf", JSON.stringify(KDF_DEFAULT), ts);
  put.run("wrapped_dek", wrapped, ts);
  put.run("unlock_mode", "A", ts);
  put.run("auto_unlock", "0", ts);
  put.run("reveal_policy", "session", ts);
  put.run("idle_timeout_sec", "900", ts);
  put.run("created_at", String(ts), ts);
  put.run("last_unlock_at", String(ts), ts);
  db.prepare(
    "INSERT INTO vault_secret(id, name, kind, meta, ciphertext, created_at, updated_at, last_used_at, rev) " +
      "VALUES(?, ?, ?, ?, ?, ?, ?, ?, 3)",
  ).run("sec_old", "legacy", "password", "{}", seal(dek, "old-secret", secretAad("sec_old", "legacy", "password")), ts, ts, ts + 5);

  ensureSchema(db);
  assert.equal(headerGet(db).salt, salt.toString("base64"));
  assert.equal(deviceGet(db).unlock_mode, "A");
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM vault_secret_usage").get().n, 1);
  assert.equal(db.prepare("SELECT 1 FROM sqlite_master WHERE name = 'vault_meta'").get(), undefined);
  assert.ok(db.prepare("SELECT 1 FROM sqlite_master WHERE name = 'vault_meta_legacy'").get());
  ensureSchema(db); // 幂等

  const vault = createVault({ db });
  const actions = new Map();
  registerVaultActions(
    { db, now: () => Date.now(), action: (name, def) => actions.set(name, def) },
    vault,
    createGroups({ db }),
  );
  const run = (name, args = {}, origin = "ui") => actions.get(name).execute(args, { origin });
  assert.throws(() => run("vault.unlock", { passphrase: "short" }), /口令错误/);
  run("vault.unlock", { passphrase: PASS });
  const items = run("vault.secretList").items;
  assert.equal(items.length, 1);
  assert.equal(items[0].name, "legacy");
  assert.equal(items[0].lastUsedAt, ts + 5);
  assert.equal(run("vault.secretReveal", { id: "sec_old" }).secret, "old-secret");
});
