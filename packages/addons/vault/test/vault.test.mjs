import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, existsSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.WB_HOME = mkdtempSync(join(tmpdir(), "wb-vault-test-"));

const { ensureSchema } = await import("../lib/db/db.js");
const { createVault } = await import("../lib/domain/vault.js");
const { registerVaultActions } = await import("../lib/domain/actions.js");

function makeVault() {
  const db = new DatabaseSync(":memory:");
  ensureSchema(db);
  const vault = createVault({ db });
  const actions = new Map();
  registerVaultActions({ db, now: () => Date.now(), action: (name, def) => actions.set(name, def) }, vault);
  const run = (name, args = {}, origin = "ui") => actions.get(name).execute(args, { origin });
  return { db, vault, run };
}

const PASS = "correct-horse-1";

test("A 模式初始化、加密落库、解锁/失败锁", () => {
  const { db, vault, run } = makeVault();
  run("vault.setup", { passphrase: PASS, mode: "A" });
  let st = run("vault.status");
  assert.equal(st.initialized, true);
  assert.equal(st.locked, false);
  assert.equal(st.unlockMode, "A");

  run("vault.secretCreate", { name: "rss", kind: "password", secret: "s3cret-value", meta: { username: "me" } });
  const row = db.prepare("SELECT * FROM vault_secret").get();
  assert.ok(row.ciphertext.startsWith("v1:"));
  assert.ok(!row.ciphertext.includes("s3cret-value"));
  assert.ok(!JSON.stringify(row).includes("s3cret-value"));

  const listed = run("vault.secretList", {}, "agent");
  assert.equal(listed.items.length, 1);
  assert.equal(listed.items[0].name, "rss");
  assert.equal(listed.items[0].ciphertext, undefined);

  assert.equal(run("vault.secretReveal", { id: row.id }).secret, "s3cret-value");
  assert.throws(() => run("vault.secretReveal", { id: row.id }, "agent"), /不允许 agent/);

  run("vault.lock");
  assert.equal(run("vault.status").locked, true);
  assert.throws(() => vault.unlock({ passphrase: "wrong-pass-1" }), /口令错误/);
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
  const st = run("vault.status");
  assert.equal(st.locked, false, "B 模式 status 应自动解锁");
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
