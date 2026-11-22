/**
 * 解锁后数据迁移：
 * - 0.2.x → 0.3.0：把「分组直属凭据」收进集合，并把站点专属 kind 收口；
 * - 0.4.x → 0.5.0：把 vault_set.account 的明文全部加密；
 * - 0.5.x → 0.6.0：单值 kind 回填进 vault_secret_kind、旧密文换成不含类型的 AAD、
 *   集合账号转成 kind=account 的凭据，然后删掉 vault_secret.kind 与 vault_set.account 两列。
 * 只有解锁拿到 DEK 后才能重加密，因此入口是 unlock() 成功之后。
 * 每批一个事务：任一步失败回滚、版本号停在原位，下次解锁重试。
 * 0.4.0 起结构升级（account 列）由 ensureSchema 的 migrateV4 补齐，本文件只管数据。
 */
import { SCHEMA_VERSION, hasColumn, headerGet, headerSet, newId, now, tx } from "../db/db.js";
import {
  isSealedAccount,
  legacySecretAad,
  open,
  openAccount,
  seal,
  sealAccount,
  secretAad,
} from "../infra/crypto.js";
import { createSets } from "./sets.js";
import { KINDS } from "./secret-input.js";

const SITE_NAME = /^site\.[^.]+\.([^.]+)\.([^.]+)$/;
const FIELD_KIND = { password: "password", phone: "phone", identity: "id_card" };
const FIELD_LABEL = { password: "密码", phone: "手机号", identity: "身份证号" };

function uniqueSecretName(db, base) {
  let name = base;
  let n = 2;
  while (db.prepare("SELECT 1 FROM vault_secret WHERE name = ? AND deleted_at IS NULL").get(name)) {
    name = base + " #" + n;
    n += 1;
  }
  return name;
}

export function migrateToV3({ db, dek, log = () => {} }) {
  const head = headerGet(db);
  if (!head) return { migrated: false, reason: "uninitialized" };
  if (Number(head.schema_version || 0) >= 3) return { migrated: false, reason: "current" };
  if (!dek) return { migrated: false, reason: "locked" };

  const sets = createSets({ db });
  const hasGroupColumn = hasColumn(db, "vault_secret", "group_id");
  const stats = { groups: 0, sets: 0, linked: 0, converted: 0, orphaned: 0 };

  tx(db, () => {
    const defaultSets = new Map();

    function defaultSetOf(groupId) {
      if (!groupId) return null;
      if (!defaultSets.has(groupId)) {
        const row = sets.ensureDefaultSet(groupId);
        defaultSets.set(groupId, row.id);
        stats.sets += 1;
        stats.groups += 1;
      }
      return defaultSets.get(groupId);
    }

    // 1) 旧分组仍持有的直属凭据 → 「<组名> · 默认」集合
    if (hasGroupColumn) {
      const groupIds = db
        .prepare("SELECT DISTINCT group_id FROM vault_secret WHERE group_id IS NOT NULL AND deleted_at IS NULL")
        .all()
        .map((row) => row.group_id);
      for (const groupId of groupIds) {
        const setId = defaultSetOf(groupId);
        if (!setId) continue;
        const rows = db
          .prepare("SELECT id FROM vault_secret WHERE group_id = ? AND deleted_at IS NULL")
          .all(groupId);
        for (const row of rows) {
          const res = sets.linkSecret(setId, row.id);
          if (!res.existing) stats.linked += 1;
        }
      }

      // 2) 站点专属 kind 收口：解析长名、重加密、并入 accountId 集合
      const siteRows = db
        .prepare("SELECT * FROM vault_secret WHERE kind = 'site-account' AND deleted_at IS NULL")
        .all();
      let orphanSetId = null;
      for (const row of siteRows) {
        const groupId = row.group_id || null;
        const match = SITE_NAME.exec(String(row.name || ""));
        let setId = groupId ? defaultSetOf(groupId) : null;
        let kind = "other";
        let nextName = null;
        let plain = null;
        try {
          plain = open(dek, row.ciphertext, legacySecretAad(row.id, row.name, "site-account"));
        } catch (error) {
          log("迁移失败：无法解密 site-account " + row.id, String(error && error.message));
          stats.orphaned += 1;
          if (!setId) {
            if (!orphanSetId) {
              orphanSetId = sets.ensureSet("迁移收件箱").id;
              stats.sets += 1;
            }
            setId = orphanSetId;
          }
          db.prepare(
            "UPDATE vault_secret SET kind = 'other', updated_at = ?, rev = rev + 1 WHERE id = ?",
          ).run(now(), row.id);
          if (setId) sets.linkSecret(setId, row.id);
          continue;
        }

        if (match) {
          const accountId = match[1];
          const field = match[2];
          kind = FIELD_KIND[field] || "other";
          const base = accountId + " · " + (FIELD_LABEL[field] || "其它");
          nextName = uniqueSecretName(db, base);
          const accountSet = sets.ensureSet(accountId);
          stats.sets += 1;
          if (groupId) sets.linkGroupSet(groupId, accountSet.id);
          setId = accountSet.id;
        } else {
          log("迁移提示：site-account 名称无法解析，归入默认集合", String(row.name));
          nextName = uniqueSecretName(db, String(row.name || row.id).replace(/^site\./, "站点 · "));
        }

        const ciphertext = seal(dek, plain, secretAad(row.id, nextName));
        db.prepare(
          "UPDATE vault_secret SET name = ?, kind = ?, ciphertext = ?, updated_at = ?, rev = rev + 1 WHERE id = ?",
        ).run(nextName, kind, ciphertext, now(), row.id);
        stats.converted += 1;
        if (setId) sets.linkSecret(setId, row.id);
      }
    }

    // 3) 收口：去掉凭据上的单列归属
    if (hasGroupColumn) db.exec("ALTER TABLE vault_secret DROP COLUMN group_id");
    // 只标到 3：账号加密是独立一步（4 → 5），由 migrateAccountsToV5 推进版本。
    headerSet(db, { schema_version: 3 });
  });

  log("保险箱已迁移到 schema 3", JSON.stringify(stats));
  return { migrated: true, ...stats };
}

/**
 * 0.4.x → 0.5.0：把 vault_set.account 的明文加密成 `va1:` 密文。
 * 空账号保持空串（集合类型靠它推导）；已是密文的行跳过，可重复执行。
 * 失败整批回滚，schema_version 停在 4，下次解锁重试。
 */
export function migrateAccountsToV5({ db, dek, log = () => {} }) {
  const head = headerGet(db);
  if (!head) return { migrated: false, reason: "uninitialized" };
  if (Number(head.schema_version || 0) >= 5) return { migrated: false, reason: "current" };
  if (!dek) return { migrated: false, reason: "locked" };
  // 0.2.x/0.3.x 直接升到 0.6.0 时 vault_set 还没有 account 列：没有可加密的账号，只推进版本。
  if (!hasColumn(db, "vault_set", "account")) {
    tx(db, () => headerSet(db, { schema_version: 5 }));
    return { migrated: true, encrypted: 0 };
  }
  let encrypted = 0;
  tx(db, () => {
    const rows = db.prepare("SELECT id, account FROM vault_set WHERE account <> ''").all();
    for (const row of rows) {
      const raw = String(row.account || "");
      if (!raw || isSealedAccount(raw)) continue;
      db.prepare("UPDATE vault_set SET account = ?, updated_at = ?, rev = rev + 1 WHERE id = ?").run(
        sealAccount(dek, raw, row.id),
        now(),
        row.id,
      );
      encrypted += 1;
    }
    headerSet(db, { schema_version: 5 });
  });
  if (encrypted) log("集合账号已加密", encrypted + " 条");
  return { migrated: true, encrypted };
}

/**
 * 0.5.x → 0.6.0：
 * 1) 把 vault_secret.kind 的单值回填成 vault_secret_kind 行；
 * 2) 用旧 AAD（id + name + kind）解开旧密文，换成新 AAD（id + name）重新封装，
 *    这样以后改类型不必重加密；已被 v3 迁移重封过的行按新 AAD 直接通过；
 * 3) 把仍留在 vault_set.account 的登录名转成 kind=account 的凭据并挂回原集合；
 * 4) 删除 vault_secret.kind 与 vault_set.account，vault_set 从此不再区分类型。
 * 整批一个事务：失败回滚且版本停在 5，下次解锁重试。
 */
export function migrateToV6({ db, dek, log = () => {} }) {
  const head = headerGet(db);
  if (!head) return { migrated: false, reason: "uninitialized" };
  if (Number(head.schema_version || 0) >= SCHEMA_VERSION) return { migrated: false, reason: "current" };
  if (!dek) return { migrated: false, reason: "locked" };

  const sets = createSets({ db });
  const secretHasKind = hasColumn(db, "vault_secret", "kind");
  const setHasAccount = hasColumn(db, "vault_set", "account");
  const stats = { secrets: 0, resealed: 0, accounts: 0 };

  const insertKind = db.prepare(
    "INSERT INTO vault_secret_kind(id, secret_id, kind, created_at, updated_at, rev) VALUES(?, ?, ?, ?, ?, 1)",
  );
  const sealSecret = db.prepare(
    "UPDATE vault_secret SET ciphertext = ?, updated_at = ?, rev = rev + 1 WHERE id = ?",
  );
  const insertSecret = secretHasKind
    ? db.prepare(
        "INSERT INTO vault_secret(id, name, kind, meta, ciphertext, created_at, updated_at, rev) " +
          "VALUES(?, ?, 'account', ?, ?, ?, ?, 1)",
      )
    : db.prepare(
        "INSERT INTO vault_secret(id, name, meta, ciphertext, created_at, updated_at, rev) " +
          "VALUES(?, ?, ?, ?, ?, ?, 1)",
      );

  tx(db, () => {
    // 1) + 2) 类型回填与密文换 AAD
    for (const row of db.prepare("SELECT * FROM vault_secret").all()) {
      const rawKind = secretHasKind ? String(row.kind || "") : "";
      const kind = KINDS.indexOf(rawKind) >= 0 ? rawKind : "other";
      insertKind.run(newId("sk"), row.id, kind, row.created_at || now(), now());
      stats.secrets += 1;

      let plain = null;
      let needsSeal = false;
      try {
        plain = open(dek, row.ciphertext, secretAad(row.id, row.name));
      } catch {
        plain = open(dek, row.ciphertext, legacySecretAad(row.id, row.name, kind));
        needsSeal = true;
      }
      if (!needsSeal) continue;
      sealSecret.run(seal(dek, plain, secretAad(row.id, row.name)), now(), row.id);
      stats.resealed += 1;
    }

    // 3) 集合账号 → kind=account 凭据
    if (setHasAccount) {
      const rows = db
        .prepare("SELECT * FROM vault_set WHERE deleted_at IS NULL AND account <> ''")
        .all();
      for (const row of rows) {
        const raw = String(row.account || "");
        const plain = isSealedAccount(raw) ? openAccount(dek, raw, row.id) : raw;
        const name = uniqueSecretName(db, String(row.name) + " · 账号");
        const id = newId("sec");
        const ts = now();
        insertSecret.run(id, name, JSON.stringify({ setName: row.name }), seal(dek, plain, secretAad(id, name)), ts, ts);
        insertKind.run(newId("sk"), id, "account", ts, ts);
        sets.linkSecret(row.id, id);
        stats.accounts += 1;
      }
    }

    // 4) 删列（旧索引先删，否则 SQLite 拒绝 DROP COLUMN）
    if (secretHasKind) {
      db.exec("DROP INDEX IF EXISTS idx_vault_secret_kind");
      db.exec("ALTER TABLE vault_secret DROP COLUMN kind");
    }
    if (setHasAccount) db.exec("ALTER TABLE vault_set DROP COLUMN account");

    headerSet(db, { schema_version: SCHEMA_VERSION });
  });

  if (stats.accounts) log("集合账号已转为账号凭据", stats.accounts + " 条");
  return { migrated: true, ...stats };
}
