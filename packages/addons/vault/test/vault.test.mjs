import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, existsSync, statSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";

process.env.WB_HOME = mkdtempSync(join(tmpdir(), "wb-vault-test-"));

const { ensureSchema, hasColumn, headerGet, headerSet, deviceGet, deviceSet } = await import("../lib/db/db.js");
const { createVault } = await import("../lib/domain/vault.js");
const { createGroups } = await import("../lib/domain/groups.js");
const { createSets } = await import("../lib/domain/sets.js");
const { registerVaultActions } = await import("../lib/domain/actions.js");
const { KDF_DEFAULT, deriveKey, legacySecretAad, sealAccount, open, seal, secretAad } = await import("../lib/infra/crypto.js");

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
  return { db, vault, groups, actions, run };
}

const PASS = "correct-horse-1";

test("A 模式初始化、加密落库、解锁/失败锁", () => {
  const { db, run } = makeVault();
  run("vault.setup", { passphrase: PASS, mode: "A" });
  const st = run("vault.status");
  assert.equal(st.initialized, true);
  assert.equal(st.locked, false);
  assert.equal(st.unlockMode, "A");
  assert.equal(st.schemaVersion, 6);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM vault_header").get().n, 1);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM vault_device").get().n, 1);

  run("vault.secretCreate", { name: "rss", kinds: ["password"], secret: "s3cret-value", meta: { username: "me" } });
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

  run("vault.secretCreate", { name: "imap", kinds: ["app_password"], secret: "app-pass" });
  run("vault.lock");
  assert.equal(run("vault.status").locked, false, "B 模式 status 应自动解锁");
  const id = run("vault.secretList").items[0].id;
  assert.throws(() => run("vault.secretReveal", { id }), /需要口令/);
  assert.equal(run("vault.secretReveal", { id, passphrase: PASS }).secret, "app-pass");
});

test("plugin lease 可用，ui/agent 不可用；改口令后可解锁", () => {
  const { run, vault } = makeVault();
  run("vault.setup", { passphrase: PASS, mode: "A" });
  run("vault.secretCreate", { name: "token1", kinds: ["token"], secret: "tok-123" });
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
    kinds: ["password"],
    secret: "pw-1",
    groupId,
    meta: { username: "me" },
  }).id;
  run("vault.secretCreate", { name: "imap", kinds: ["app_password"], secret: "pw-2", groupId: otherId });
  assert.equal(run("vault.secretList", { groupId }).items.length, 1);
  assert.equal(run("vault.groupList").items.length, 2);
  const sspai = run("vault.groupList").items.find((g) => g.id === groupId);
  assert.equal(sspai.secretCount, 1);

  run("vault.subjectRegister", { type: "site", title: "站点" }, "plugin");
  const bound = run("vault.bind", { subjectType: "site", subjectId: "site_1", groupId }, "plugin");
  assert.ok(bound.id);
  assert.equal(run("vault.bind", { subjectType: "site", subjectId: "site_1", groupId }, "plugin").existing, true);
  assert.equal(run("vault.bind", { subjectType: "site", subjectId: "site_1", groupId }, "ui").existing, true);

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
    db.prepare("SELECT COUNT(*) AS n FROM vault_group_set WHERE deleted_at IS NULL").get().n,
    0,
    "删组后集合关联应清空",
  );
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM vault_secret").get().n, 2, "凭据本身不随分组删除");
});

test("plugin 写入受绑定约束：按 setName 建集合、按 name 幂等写凭据", () => {
  const { db, run } = makeVault();
  run("vault.setup", { passphrase: PASS, mode: "A" });
  const groupId = run("vault.groupCreate", { name: "站点账号 · 少数派" }).id;
  const otherId = run("vault.groupCreate", { name: "别的组" }).id;
  run("vault.subjectRegister", { type: "site", title: "站点" }, "plugin");
  run("vault.bind", { subjectType: "site", subjectId: "site_1", groupId }, "plugin");

  const base = { subjectType: "site", subjectId: "site_1", setName: "acc_1" };
  const name = "acc_1 · 密码";
  const meta = { siteId: "site_1", accountId: "acc_1", field: "password" };
  const created = run("vault.pluginSecretUpsert", { ...base, name, kinds: ["password"], secret: "pw-a", meta }, "plugin");
  assert.equal(created.created, true);
  const row = db.prepare("SELECT * FROM vault_secret WHERE id = ?").get(created.id);
  assert.ok(row.ciphertext.startsWith("v1:"));
  assert.ok(!row.ciphertext.includes("pw-a"));
  assert.ok(created.setId, "返回值应带集合 id");

  const set = run("vault.pluginSetGet", base, "plugin").set;
  assert.equal(set.name, "acc_1");
  assert.equal(run("vault.setGet", { id: set.id }, "plugin").secrets.length, 1);

  const visible = run("vault.subjectSecrets", { subjectType: "site", subjectId: "site_1" }, "plugin");
  assert.equal(visible.items.length, 1);
  assert.deepEqual(visible.items[0].meta, meta);
  assert.equal(visible.items[0].setId, created.setId, "subject 侧应能拿到集合 id");

  const updated = run("vault.pluginSecretUpsert", { ...base, name, kinds: ["password"], secret: "pw-b", meta }, "plugin");
  assert.equal(updated.created, false);
  assert.equal(updated.id, created.id);
  assert.equal(run("vault.secretReveal", { id: created.id }).secret, "pw-b");
  assert.equal(db.prepare("SELECT rev FROM vault_secret WHERE id = ?").get(created.id).rev, 2);
  assert.equal(run("vault.pluginSetGet", base, "plugin").set.id, created.setId, "setName 复用同一集合");

  assert.throws(
    () => run("vault.pluginSecretUpsert", { subjectType: "site", subjectId: "site_404", setName: "a", name, secret: "pw" }, "plugin"),
    /未绑定任何凭据组/,
  );
  assert.throws(
    () => run("vault.pluginSecretUpsert", { ...base, groupId: otherId, name, secret: "pw" }, "plugin"),
    /未绑定到此对象/,
  );
  assert.throws(
    () => run("vault.pluginSecretUpsert", { ...base, name, secret: "pw" }, "agent"),
    /不允许 agent/,
  );

  // plugin 不能把凭据塞进别人组下的集合
  const foreignSet = run("vault.setCreate", { name: "外部集合" }).id;
  run("vault.groupAttachSet", { groupId: otherId, setId: foreignSet });
  assert.throws(
    () => run("vault.setAttachSecret", { ...base, setId: foreignSet, secretId: created.id }, "plugin"),
    /不属于此对象已绑定的凭据组/,
  );

  assert.equal(run("vault.pluginSecretDelete", { ...base, name }, "plugin").removed, true);
  assert.equal(run("vault.pluginSecretDelete", { ...base, name }, "plugin").removed, false);
  assert.equal(run("vault.subjectSecrets", { subjectType: "site", subjectId: "site_1" }, "plugin").items.length, 0);
});

test("集合 action：增删改、挂载/摘除与权限", () => {
  const { db, run } = makeVault();
  run("vault.setup", { passphrase: PASS, mode: "A" });
  const g1 = run("vault.groupCreate", { name: "组一" }).id;
  const g2 = run("vault.groupCreate", { name: "组二" }).id;
  const set = run("vault.setCreate", { name: "共享集合", description: "给两个组用" });
  assert.ok(set.id);
  assert.throws(() => run("vault.setCreate", { name: "共享集合" }), /同名集合/);

  const setB = run("vault.setCreate", { name: "另一集合" }).id;
  run("vault.groupAttachSet", { groupId: g1, setId: set.id });
  run("vault.groupAttachSet", { groupId: g2, setId: set.id });
  assert.equal(run("vault.groupAttachSet", { groupId: g1, setId: set.id }).existing, true, "重复挂载幂等");
  assert.equal(run("vault.setList", { groupId: g1 }).items.length, 1);
  assert.deepEqual(run("vault.setGet", { id: set.id }).groupIds.sort(), [g1, g2].sort());

  const phoneA = run("vault.secretCreate", { name: "手机号 A", kinds: ["phone"], secret: "13800000001", setId: set.id });
  const phoneB = run("vault.secretCreate", { name: "手机号 B", kinds: ["phone"], secret: "13800000002", setId: set.id });
  assert.equal(run("vault.setGet", { id: set.id }).secrets.length, 2, "同一集合可放两条 phone");
  run("vault.setAttachSecret", { setId: setB, secretId: phoneA.id });
  assert.equal(run("vault.setAttachSecret", { setId: setB, secretId: phoneA.id }).existing, true, "重复挂载幂等");
  assert.equal(run("vault.secretList", { setId: setB }).items.length, 1);
  assert.equal(run("vault.secretList", { groupId: g2 }).items.length, 2);

  assert.equal(run("vault.setDetachSecret", { setId: setB, secretId: phoneA.id }).removed, true);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM vault_secret WHERE deleted_at IS NULL").get().n, 2, "摘除不删凭据");

  run("vault.setDelete", { id: set.id });
  assert.equal(run("vault.setList", {}).items.length, 1);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM vault_secret WHERE deleted_at IS NULL").get().n, 2, "删集合不删凭据");
  assert.equal(run("vault.secretList", { setId: set.id }).items.length, 0);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM vault_group_set WHERE deleted_at IS NULL").get().n, 0);

  // 权限：集合读取 agent 可、写入 agent 不可
  assert.ok(run("vault.setList", {}, "agent").items.length >= 1);
  assert.throws(() => run("vault.setCreate", { name: "agent 建的" }, "agent"), /不允许 agent/);
  assert.throws(() => run("vault.groupAttachSet", { groupId: g1, setId: setB }, "plugin"), /不允许 plugin/);
  assert.ok(Array.isArray(run("vault.setList", {}, "plugin").items), "集合读取对 plugin 开放");
});

test("plugin 写入多类型：按 name 幂等、kinds 原样回读，账号只是普通凭据类型", () => {
  const { run } = makeVault();
  run("vault.setup", { passphrase: PASS, mode: "A" });
  const groupId = run("vault.groupCreate", { name: "邮件账户" }).id;
  run("vault.subjectRegister", { type: "mail", title: "邮箱" }, "plugin");
  run("vault.bind", { subjectType: "mail", subjectId: "mb_1", groupId }, "plugin");

  const base = { subjectType: "mail", subjectId: "mb_1", setName: "me@example.com" };
  const created = run(
    "vault.pluginSecretUpsert",
    { ...base, name: "me@example.com · 密码", kinds: ["app_password"], secret: "pw", meta: { field: "password" } },
    "plugin",
  );
  const set = run("vault.pluginSetGet", base, "plugin").set;
  assert.equal(set.id, created.setId);

  const again = run(
    "vault.pluginSecretUpsert",
    { ...base, name: "me@example.com · 密码", kinds: ["app_password", "other"], secret: "pw2" },
    "plugin",
  );
  assert.equal(again.updated, true);
  const listed = run("vault.secretList", { setId: set.id }).items;
  assert.equal(listed.length, 1);
  assert.deepEqual(listed[0].kinds, ["app_password", "other"], "类型按 KINDS 顺序回读");

  // 账号与密码可以并存于同一条凭据
  const merged = run(
    "vault.pluginSecretUpsert",
    { ...base, name: "组合凭据", kinds: ["password", "account"], secret: "me@example.com" },
    "plugin",
  );
  assert.deepEqual(run("vault.secretList", { setId: set.id }).items.find((x) => x.id === merged.id).kinds, ["password", "account"]);

  // 集合不再维护账号，pluginSetAccount 已下线
  assert.equal(run("vault.pluginSetGet", base, "plugin").set.account, undefined);
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

const KINDS = ["password", "account", "phone", "id_card", "token", "app_password", "api_key", "other"];
const clientKinds = createRequire(import.meta.url)("../client/ui/kinds.cjs");

test("kinds 契约：schema、能力清单与界面标签三处同口径 8 种", async () => {
  const { createDomain } = await import("../lib/index.js");
  const field = createDomain().capability.fields.find((f) => f.name === "kinds");
  assert.match(field.type + " " + field.description, /\baccount\b/);
  assert.match(field.type + " " + field.description, /\bid_card\b/);
  assert.doesNotMatch(field.type + " " + field.description, /site-account/);

  const { actions } = makeVault();
  for (const name of ["vault.secretCreate", "vault.secretUpdate", "vault.pluginSecretUpsert"]) {
    assert.deepEqual(actions.get(name).input.properties.kinds.items.enum, KINDS, name + " 的 kinds 枚举");
  }
  assert.deepEqual(actions.get("vault.secretList").input.properties.kind.enum, KINDS);

  assert.deepEqual(Object.keys(clientKinds.KIND_LABEL), KINDS);
  assert.equal(clientKinds.KIND_LABEL.account, "账号");
  assert.equal(clientKinds.KIND_LABEL.phone, "手机号");
  assert.deepEqual(clientKinds.CREATABLE_KINDS, KINDS);
  assert.deepEqual(clientKinds.kindsOf({ kind: "phone" }), ["phone"], "旧单值兜底");
  assert.deepEqual(clientKinds.kindsText(["account", "password"]), "账号 / 密码");
});

test("集合层：一条凭据进多个集合、一个集合挂多个分组、删除只断关联", () => {
  const { db, run } = makeVault();
  run("vault.setup", { passphrase: PASS, mode: "A" });
  const g1 = run("vault.groupCreate", { name: "组一" }).id;
  const g2 = run("vault.groupCreate", { name: "组二" }).id;
  const created = run("vault.secretCreate", { name: "共用密码", kinds: ["password"], secret: "shared-pw", groupId: g1 });
  assert.ok(created.setId, "按分组写入应自动落进默认集合");

  // 直接建集合 + 关联，P1 没有 action，走 domain 层
  const sets = createSets({ db });
  const setB = sets.ensureSet("共享集合");
  sets.linkSecret(created.setId, created.id);
  sets.linkSecret(setB.id, created.id);
  sets.linkGroupSet(g2, setB.id);

  assert.equal(run("vault.secretList", { setId: setB.id }).items.length, 1);
  assert.equal(run("vault.secretList", { groupId: g2 }).items.length, 1);
  assert.equal(run("vault.secretList", { groupId: g1 }).items.length, 1);
  assert.equal(sets.secretCountOfSet(setB.id), 1);
  assert.equal(run("vault.secretReveal", { id: created.id }).secret, "shared-pw");
  assert.equal(run("vault.lease", { id: created.id, purpose: "t" }, "plugin").setId, created.setId);

  // 幂等
  sets.linkSecret(setB.id, created.id);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM vault_set_secret WHERE deleted_at IS NULL").get().n, 2);

  run("vault.secretDelete", { id: created.id });
  assert.equal(run("vault.secretList", { setId: setB.id }).items.length, 0);
  assert.equal(sets.secretCountOfSet(setB.id), 0, "删凭据后集合不再显示它");
});

test("0.3.x → 0.4.0：启动补 account 列并把 schema_version 升到 4", () => {
  const { db } = makeVault();
  // 还原成 0.3.x 形态：vault_set 没有 account 列，header 停在 3。
  db.exec("DROP TABLE vault_set");
  db.exec(
    "CREATE TABLE vault_set (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', " +
      "color TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, deleted_at INTEGER, " +
      "rev INTEGER NOT NULL DEFAULT 1)",
  );
  db.prepare(
    "INSERT INTO vault_header(id, schema_version, salt, kdf, wrapped_dek, passphrase_rev, created_at, updated_at, rev) " +
      "VALUES(1, 3, 'salt', '{}', 'wrapped', 1, 1, 1, 1)",
  ).run();

  ensureSchema(db);
  assert.equal(headerGet(db).schema_version, 4);
  assert.equal(hasColumn(db, "vault_set", "account"), true);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM vault_set").get().n, 0);
});

test("集合：不再区分类型，账号只是一条 kind=account 的凭据", () => {
  const { run } = makeVault();
  run("vault.setup", { passphrase: PASS, mode: "A" });

  const a = run("vault.setCreate", { name: "工作邮箱 A" });
  const b = run("vault.setCreate", { name: "工作邮箱 B" });
  const c = run("vault.setCreate", { name: "临时归档", description: "旧账号记在描述里" });
  assert.notEqual(a.id, b.id);
  assert.equal(a.account, undefined, "集合不再有账号字段");
  assert.equal(a.type, undefined, "集合不再区分类型");

  assert.equal(run("vault.setList", {}).items.length, 3);
  assert.deepEqual(run("vault.setList", { q: "工作邮箱" }).items.map((i) => i.id).sort(), [a.id, b.id].sort());
  assert.deepEqual(run("vault.setList", { q: "描述" }).items.map((i) => i.id), [c.id]);

  // 账号凭据挂进集合，凭据列表能按类型筛到
  const acc = run("vault.secretCreate", { name: "邮箱账号", kinds: ["account"], secret: "ops@example.com", setId: a.id });
  assert.deepEqual(acc.kinds, ["account"]);
  assert.equal(run("vault.secretList", { kind: "account" }).items.length, 1);
  assert.deepEqual(run("vault.setGet", { id: a.id }).secrets.map((x) => [x.name, x.kinds]), [["邮箱账号", ["account"]]]);

  assert.throws(() => run("vault.setCreate", { name: "工作邮箱 A" }), /已有同名集合/);
  assert.throws(() => run("vault.setCreate", { name: "x".repeat(101) }), /最多 100 字/);
});

test("新建/编辑集合时一并处理凭据：勾已有的一条、填明文新建一条，保存后都挂上", () => {
  const { run } = makeVault();
  run("vault.setup", { passphrase: PASS, mode: "A" });
  const existing = run("vault.secretCreate", { name: "旧授权码", kinds: ["app_password"], secret: "old-code" });

  const created = run("vault.setCreate", {
    name: "工作邮箱 · 凭据",
    account: "ops@example.com",
    secrets: [
      { id: existing.id },
      { name: "新授权码", kinds: ["app_password"], secret: "new-code" },
    ],
  });
  assert.equal(created.secrets.length, 2, "保存集合时一并挂上两条凭据");
  const detail = run("vault.setGet", { id: created.id });
  assert.deepEqual(detail.secrets.map((s) => s.name).sort(), ["新授权码", "旧授权码"]);
  assert.equal(run("vault.secretList", { setId: created.id }).items.length, 2);

  // 编辑集合时追加：同名新凭据按名称幂等（更新后挂上），不会多出一条
  const updated = run("vault.setUpdate", {
    id: created.id,
    secrets: [{ name: "新授权码", kinds: ["app_password"], secret: "rotated" }],
  });
  assert.equal(updated.secrets.length, 1);
  assert.equal(run("vault.setGet", { id: created.id }).secrets.length, 2);

  assert.throws(() => run("vault.setCreate", { name: "坏集合", secrets: [{ id: "nope" }] }), /凭据不存在/);
  assert.throws(
    () => run("vault.setCreate", { name: "坏集合2", secrets: [{ name: "空值", kinds: ["other"], secret: "" }] }),
    /新建凭据「空值」失败/,
  );
});

test("0.2.x → 0.3.0 迁移：分组直属凭据收进默认集合，site-account 收口为通用类型", async () => {
  const { db, run, vault } = makeVault();
  run("vault.setup", { passphrase: PASS, mode: "A" });
  const groupId = run("vault.groupCreate", { name: "站点账号 · 少数派" }).id;

  const head = headerGet(db);
  const kek = deriveKey(PASS, head.salt, JSON.parse(head.kdf));
  const dek = open(kek, head.wrapped_dek, "vault:dek");
  const ts = Date.now();

  // 还原成 0.2.x 形态：补回 kind/group_id 两列并写三行站点专属凭据
  db.exec("ALTER TABLE vault_secret ADD COLUMN kind TEXT NOT NULL DEFAULT 'other'");
  db.exec("ALTER TABLE vault_secret ADD COLUMN group_id TEXT");
  headerSet(db, { schema_version: 2 });
  const rows = [
    ["sec_pw", "site.site_1.acc_1.password", "dev-pass"],
    ["sec_ph", "site.site_1.acc_1.phone", "13800000000"],
    ["sec_id", "site.site_1.acc_1.identity", "110101199001011234"],
  ];
  for (const [id, name, plain] of rows) {
    db.prepare(
      "INSERT INTO vault_secret(id, name, kind, group_id, meta, ciphertext, created_at, updated_at, rev) " +
        "VALUES(?, ?, 'site-account', ?, '{}', ?, ?, ?, 1)",
    ).run(id, name, groupId, seal(dek, plain, legacySecretAad(id, name, "site-account")), ts, ts);
  }

  vault.lock();
  const res = run("vault.unlock", { passphrase: PASS });
  assert.match(String(res.notice || ""), /集合与账号/);
  assert.match(String(res.notice || ""), /凭据类型拆表/);
  assert.equal(headerGet(db).schema_version, 6);
  assert.equal(hasColumn(db, "vault_secret", "group_id"), false, "迁移后应删掉 group_id 列");
  assert.equal(hasColumn(db, "vault_secret", "kind"), false, "0.6.0 起类型拆到 vault_secret_kind");

  const items = run("vault.secretList").items;
  assert.equal(items.length, 3);
  assert.deepEqual(
    new Set(items.map((item) => item.name)),
    new Set(["acc_1 · 密码", "acc_1 · 手机号", "acc_1 · 身份证号"]),
  );
  const kinds = Object.fromEntries(items.map((item) => [item.name, item.kinds]));
  assert.deepEqual(kinds["acc_1 · 密码"], ["password"]);
  assert.deepEqual(kinds["acc_1 · 手机号"], ["phone"]);
  assert.deepEqual(kinds["acc_1 · 身份证号"], ["id_card"]);
  for (const [id, , plain] of rows) assert.equal(run("vault.secretReveal", { id }).secret, plain);

  const sets = createSets({ db });
  const accSet = sets.listSets({}).items.find((item) => item.name === "acc_1");
  assert.ok(accSet, "同一 accountId 的凭据应进同一个集合");
  assert.equal(accSet.secretCount, 3);
  assert.deepEqual(accSet.groupIds, [groupId]);
  const defaultSet = sets.setsOfGroup(groupId).find((item) => item.name === "站点账号 · 少数派 · 默认");
  assert.ok(defaultSet, "旧分组应得到默认集合");

  // 重复解锁不重复迁移
  const before = db.prepare("SELECT COUNT(*) AS n FROM vault_set").get().n;
  vault.lock();
  const again = run("vault.unlock", { passphrase: PASS });
  assert.equal(again.notice, undefined);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM vault_set").get().n, before);
});

test("迁移失败整批回滚，schema_version 停在迁移前", async () => {
  const { db, run, vault } = makeVault();
  run("vault.setup", { passphrase: PASS, mode: "A" });
  const secret = run("vault.secretCreate", { name: "会被卡住的凭据", kinds: ["password"], secret: "pw" });
  // 还原成 0.5.x：类型还没拆表，header 停在 5；预先塞一行同 (secret_id, kind) 的类型行，
  // 迁移回填时撞唯一索引，事务回滚。
  db.prepare("DELETE FROM vault_secret_kind WHERE secret_id = ?").run(secret.id);
  db.prepare(
    "INSERT INTO vault_secret_kind(id, secret_id, kind, created_at, updated_at, rev) VALUES('sk_dup', ?, 'other', ?, ?, 1)",
  ).run(secret.id, Date.now(), Date.now());
  headerSet(db, { schema_version: 5 });

  vault.lock();
  const res = run("vault.unlock", { passphrase: PASS });
  assert.match(String(res.notice || ""), /升级失败，已回滚/);
  assert.equal(headerGet(db).schema_version, 5);
  assert.equal(run("vault.secretReveal", { id: secret.id }).secret, "pw", "回滚后密文仍可读");
});

test("两设备同步：复制同步表后集合、关联与凭据一致", () => {
  const TABLES = [
    "vault_header",
    "vault_secret",
    "vault_group",
    "vault_set",
    "vault_group_set",
    "vault_set_secret",
    "vault_binding",
    "vault_subject_type",
  ];
  const a = makeVault();
  a.run("vault.setup", { passphrase: PASS, mode: "A" });
  const groupId = a.run("vault.groupCreate", { name: "同步组" }).id;
  const setId = a.run("vault.setCreate", { name: "同步集合", description: "跨设备" }).id;
  a.run("vault.groupAttachSet", { groupId, setId });
  a.run("vault.subjectRegister", { type: "site", title: "站点" }, "plugin");
  a.run("vault.bind", { subjectType: "site", subjectId: "site_9", groupId }, "plugin");
  const secret = a.run("vault.secretCreate", { name: "同步密码", kinds: ["password"], secret: "pw-sync", setId });

  // 设备 B：先建空库，再把 A 的同步表整表拷过去（等价宿主同步后的状态）
  const b = makeVault();
  b.run("vault.setup", { passphrase: PASS, mode: "A" });
  b.vault.lock();
  for (const table of TABLES) {
    b.db.exec("DELETE FROM " + table);
    const rows = a.db.prepare("SELECT * FROM " + table).all();
    for (const row of rows) {
      const cols = Object.keys(row);
      b.db
        .prepare(
          "INSERT INTO " + table + "(" + cols.join(",") + ") VALUES(" + cols.map(() => "?").join(",") + ")",
        )
        .run(...cols.map((c) => row[c]));
    }
  }

  const unlocked = b.run("vault.unlock", { passphrase: PASS });
  assert.ok(unlocked);
  assert.equal(b.run("vault.secretReveal", { id: secret.id }).secret, "pw-sync", "同一密文在 B 可显形");
  const setB = b.run("vault.setGet", { id: setId });
  assert.equal(setB.name, "同步集合");
  assert.equal(setB.secrets.length, 1, "集合内凭据随同步一致");
  assert.deepEqual(setB.groupIds, [groupId], "集合与分组关联随同步一致");
  assert.equal(b.run("vault.subjectSecrets", { subjectType: "site", subjectId: "site_9" }, "plugin").items.length, 1);
  assert.equal(b.run("vault.unlock", { passphrase: PASS }).notice, undefined, "同步后的库不触发迁移");
});

test("凭据列表关键字搜索：名称与备注都能命中，不再报 SQL 语法错误", () => {
  const { run } = makeVault();
  run("vault.setup", { passphrase: PASS, mode: "A" });
  run("vault.secretCreate", {
    name: "ID_CARD",
    kinds: ["id_card"],
    secret: "110101199001011234",
    meta: { note: "身份证" },
  });
  run("vault.secretCreate", { name: "rss-token", kinds: ["token"], secret: "tok-abc", meta: { note: "阅读器" } });

  assert.deepEqual(
    run("vault.secretList", { q: "ID_CAR" }, "agent").items.map((i) => i.name),
    ["ID_CARD"],
    "按名称搜索能命中",
  );
  assert.deepEqual(
    run("vault.secretList", { q: "阅读器" }, "agent").items.map((i) => i.name),
    ["rss-token"],
    "按 meta.note 搜索能命中",
  );
  assert.equal(run("vault.secretList", { q: "ID", kind: "token" }, "agent").items.length, 0, "关键字与类型同时生效");
  assert.equal(run("vault.secretList", { q: "ID" }, "agent").items.length, 1);
});

test("锁定后集合与凭据元数据仍可读，只有明文与写操作要解锁", () => {
  const { run, vault } = makeVault();
  run("vault.setup", { passphrase: PASS, mode: "A" });
  const set = run("vault.setCreate", { name: "工作邮箱" });
  run("vault.secretCreate", {
    name: "邮箱密码",
    kinds: ["password", "account"],
    secret: "p@ssw0rd",
    setId: set.id,
  });

  vault.lock();
  assert.equal(run("vault.status").locked, true);

  // 集合名、凭据名与类型都是明文元数据，锁定时照样能列出
  const sets = run("vault.setList", {}).items;
  assert.equal(sets.length, 1);
  assert.equal(sets[0].name, "工作邮箱");
  assert.equal(sets[0].secretCount, 1);

  const detail = run("vault.setGet", { id: set.id });
  assert.equal(detail.secrets.length, 1);
  assert.equal(detail.secrets[0].name, "邮箱密码");
  assert.deepEqual(detail.secrets[0].kinds, ["password", "account"]);

  const secrets = run("vault.secretList", {}).items;
  assert.equal(secrets.length, 1);
  assert.deepEqual(secrets[0].kinds, ["password", "account"]);
  assert.equal(secrets[0].secret, undefined, "列表不应带明文");

  assert.throws(() => run("vault.secretReveal", { id: secrets[0].id }), /锁定/);
  assert.throws(() => run("vault.secretCreate", { name: "另一条", kinds: ["password"], secret: "x" }), /锁定/);
});

test("凭据多类型：一条凭据可属于多个类型，改类型不重加密、改名才重加密", () => {
  const { db, run } = makeVault();
  run("vault.setup", { passphrase: PASS, mode: "A" });

  const created = run("vault.secretCreate", { name: "邮箱", kinds: ["password", "account"], secret: "ops@example.com" });
  assert.deepEqual(created.kinds, ["password", "account"], "按 KINDS 固定顺序回读");
  const before = db.prepare("SELECT ciphertext FROM vault_secret WHERE id = ?").get(created.id).ciphertext;

  assert.equal(run("vault.secretList", { kind: "account" }).items.length, 1, "任一所含类型命中");
  assert.equal(run("vault.secretList", { kind: "password" }).items.length, 1);
  assert.equal(run("vault.secretList", { kind: "token" }).items.length, 0);

  // 只改类型：密文不动，避免无谓重加密
  run("vault.secretUpdate", { id: created.id, kinds: ["account"] });
  const afterKind = db.prepare("SELECT ciphertext FROM vault_secret WHERE id = ?").get(created.id).ciphertext;
  assert.equal(afterKind, before);
  assert.deepEqual(run("vault.secretList", { q: "邮箱" }).items.find((x) => x.id === created.id).kinds, ["account"]);
  assert.equal(run("vault.secretReveal", { id: created.id }).secret, "ops@example.com");

  // 改名要重封装（AAD 绑 name），改完仍可读
  run("vault.secretUpdate", { id: created.id, name: "邮箱（新）" });
  const afterName = db.prepare("SELECT ciphertext FROM vault_secret WHERE id = ?").get(created.id).ciphertext;
  assert.notEqual(afterName, before);
  assert.equal(run("vault.secretReveal", { id: created.id }).secret, "ops@example.com");

  assert.throws(() => run("vault.secretCreate", { name: "空类型", kinds: [], secret: "x" }), /至少要有一个类型/);
  assert.throws(() => run("vault.secretCreate", { name: "坏类型", kinds: ["site-account"], secret: "x" }), /kinds 只能是/);
});

test("5.x → 6.0 迁移：单值类型拆表、旧 AAD 重封装、集合账号转成账号凭据", () => {
  const { db, run, vault } = makeVault();
  run("vault.setup", { passphrase: PASS, mode: "A" });
  const set = run("vault.setCreate", { name: "工作邮箱" });
  const secret = run("vault.secretCreate", { name: "邮箱密码", kinds: ["password"], secret: "pw-old", setId: set.id });

  // 还原成 0.5.x：类型回到单值列、密文用旧 AAD（含类型）、集合重新有明文账号列
  const head = headerGet(db);
  const kek = deriveKey(PASS, head.salt, JSON.parse(head.kdf));
  const dek = open(kek, head.wrapped_dek, "vault:dek");
  db.prepare("DELETE FROM vault_secret_kind").run();
  db.exec("ALTER TABLE vault_secret ADD COLUMN kind TEXT NOT NULL DEFAULT 'password'");
  db.prepare("UPDATE vault_secret SET ciphertext = ?, kind = 'password' WHERE id = ?").run(
    seal(dek, "pw-old", legacySecretAad(secret.id, "邮箱密码", "password")),
    secret.id,
  );
  db.exec("ALTER TABLE vault_set ADD COLUMN account TEXT NOT NULL DEFAULT ''");
  db.prepare("UPDATE vault_set SET account = ? WHERE id = ?").run(sealAccount(dek, "ops@example.com", set.id), set.id);
  headerSet(db, { schema_version: 5 });

  vault.lock();
  const res = run("vault.unlock", { passphrase: PASS });
  assert.match(String(res.notice || ""), /凭据类型拆表/);
  assert.equal(headerGet(db).schema_version, 6);
  assert.equal(hasColumn(db, "vault_secret", "kind"), false);
  assert.equal(hasColumn(db, "vault_set", "account"), false);

  // 旧密文换成新 AAD 后仍可读；类型回到关联表
  assert.equal(run("vault.secretReveal", { id: secret.id }).secret, "pw-old");
  assert.deepEqual(run("vault.secretList", { q: "邮箱密码" }).items.find((x) => x.id === secret.id).kinds, ["password"]);

  // 集合账号转成 kind=account 的凭据，挂在原集合里
  const accounts = run("vault.secretList", { kind: "account" }).items;
  assert.equal(accounts.length, 1);
  assert.equal(accounts[0].name, "工作邮箱 · 账号");
  assert.equal(run("vault.secretReveal", { id: accounts[0].id }).secret, "ops@example.com");
  assert.ok(run("vault.setGet", { id: set.id }).secrets.some((x) => x.id === accounts[0].id));

  // 幂等：再解锁不再提示迁移
  vault.lock();
  assert.equal(String(run("vault.unlock", { passphrase: PASS }).notice || ""), "");
});
