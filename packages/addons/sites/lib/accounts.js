/**
 * 站点账号（site_account）与账号外联（site_account_external）。
 *
 * 设计见 docs/specs/22-站点模块迁移二期.md：
 * - 敏感列 password / phone_number / identity_card 在写库前加密（vault.js），同步上行的是密文；
 * - agent（origin !== "ui"）永远只能看到掩码；明文只在界面进程 + 保险箱解锁时经 sites.accounts.get 返回；
 * - 三条挂靠规则：删站守卫、bindable 关闭守卫、删账号双向清外联。
 */

import { now, newId, idOf, tx, logChange, SITE_TABLE } from "./db.js";
import {
  encryptField,
  decryptField,
  isEncrypted,
  maskSecret,
  maskMiddle,
  requireKey,
  vaultEnabled,
  vaultStatus,
  setupVault,
  unlockVault,
  lockVault,
  rekeyVault,
} from "./vault.js";

export const ACCOUNT_TABLE = "site_account";
export const EXTERNAL_TABLE = "site_account_external";

const MAX_KEY = 60;
const MAX_ACCOUNT = 200;
const MAX_REMARK = 2000;
const MAX_PHONE = 40;
const MAX_IDENTITY = 40;

export const ACCOUNT_DDL = [
  "CREATE TABLE IF NOT EXISTS site_account (" +
    "id TEXT PRIMARY KEY," +
    "site_id TEXT NOT NULL," +
    "account_key TEXT NOT NULL DEFAULT ''," +
    "account TEXT NOT NULL DEFAULT ''," +
    "password TEXT NOT NULL DEFAULT ''," +
    "phone_number TEXT NOT NULL DEFAULT ''," +
    "identity_card TEXT NOT NULL DEFAULT ''," +
    "remark TEXT NOT NULL DEFAULT ''," +
    "created_at INTEGER NOT NULL," +
    "updated_at INTEGER NOT NULL," +
    "deleted_at INTEGER," +
    "rev INTEGER NOT NULL DEFAULT 1" +
    ");",
  "CREATE INDEX IF NOT EXISTS idx_site_account_site ON site_account(site_id);",
  "CREATE INDEX IF NOT EXISTS idx_site_account_key ON site_account(site_id, account_key);",
];

export const EXTERNAL_DDL = [
  "CREATE TABLE IF NOT EXISTS site_account_external (" +
    "id TEXT PRIMARY KEY," +
    "native_account_id TEXT NOT NULL," +
    "external_account_id TEXT NOT NULL," +
    "created_at INTEGER NOT NULL," +
    "updated_at INTEGER NOT NULL," +
    "deleted_at INTEGER," +
    "rev INTEGER NOT NULL DEFAULT 1" +
    ");",
  "CREATE INDEX IF NOT EXISTS idx_sae_native ON site_account_external(native_account_id);",
  "CREATE INDEX IF NOT EXISTS idx_sae_external ON site_account_external(external_account_id);",
];

/* ------------------------------------------------------------------ 读取 */

function liveAccount(db, id) {
  return db
    .prepare("SELECT * FROM " + ACCOUNT_TABLE + " WHERE id=? AND deleted_at IS NULL")
    .get(String(id));
}

function siteOf(db, siteId) {
  return db.prepare("SELECT * FROM " + SITE_TABLE + " WHERE id=? AND deleted_at IS NULL").get(String(siteId));
}

function textOf(value, max, label) {
  const s = value == null ? "" : String(value).trim();
  if (s.length > max) throw new Error(label + "最多 " + max + " 个字符");
  return s;
}

function keyOf(value) {
  const s = textOf(value, MAX_KEY, "账号标识");
  if (!s) throw new Error("账号标识（accountKey）不能为空");
  return s;
}

function assertKeyUnique(db, siteId, key, exceptId) {
  const row = db
    .prepare(
      "SELECT id FROM " + ACCOUNT_TABLE + " WHERE site_id=? AND account_key=? AND deleted_at IS NULL AND id<>?",
    )
    .get(String(siteId), String(key), String(exceptId || ""));
  if (row) throw new Error("该站点已存在相同标识的账号：" + key);
}

/** 外联关系（未删除）中，native 账号都还在某个站点里。 */
function externalRefsOfSite(db, siteId) {
  return db
    .prepare(
      "SELECT e.id, e.native_account_id, e.external_account_id, n.site_id AS native_site, n.account_key AS native_key, n.deleted_at AS native_deleted" +
        " FROM " + EXTERNAL_TABLE + " e JOIN " + ACCOUNT_TABLE + " n ON n.id=e.native_account_id" +
        " JOIN " + ACCOUNT_TABLE + " t ON t.id=e.external_account_id" +
        " WHERE e.deleted_at IS NULL AND t.site_id=? AND t.deleted_at IS NULL AND n.deleted_at IS NULL",
    )
    .all(String(siteId));
}

function countAccounts(db, siteId) {
  const row = db
    .prepare("SELECT COUNT(*) AS n FROM " + ACCOUNT_TABLE + " WHERE site_id=? AND deleted_at IS NULL")
    .get(String(siteId));
  return Number(row ? row.n : 0);
}

/** 删站守卫：站点仍有未删除账号时拒绝删除。 */
export function assertNoAccounts(db, siteId) {
  const n = countAccounts(db, siteId);
  if (n > 0) throw new Error("无法删除：该站点仍存在 " + n + " 个账号，请先删除其账号");
}

/** bindable 关闭守卫：本站账号被其他站点外联引用时拒绝关闭。 */
export function assertBindableUnused(db, siteId) {
  const refs = externalRefsOfSite(db, siteId);
  if (refs.length) {
    throw new Error("该站点的账号正被外联账号引用（" + refs.length + " 处），请先解除外联关系");
  }
}

function externalsOf(db, accountId, opts) {
  const rows = db
    .prepare(
      "SELECT e.id, e.external_account_id, a.account_key, a.site_id, s.site_name" +
        " FROM " + EXTERNAL_TABLE + " e" +
        " JOIN " + ACCOUNT_TABLE + " a ON a.id=e.external_account_id" +
        " JOIN " + SITE_TABLE + " s ON s.id=a.site_id" +
        " WHERE e.native_account_id=? AND e.deleted_at IS NULL AND a.deleted_at IS NULL",
    )
    .all(String(accountId));
  return rows.map((r) => ({
    relationId: String(r.id),
    accountId: String(r.external_account_id),
    accountKey: String(r.account_key || ""),
    siteId: String(r.site_id),
    siteName: String(r.site_name || ""),
  }));
}

function outAccount(db, row, opts) {
  const reveal = Boolean(opts && opts.reveal);
  const hasPassword = Boolean(row.password);
  const hasPhone = Boolean(row.phone_number);
  const hasIdentity = Boolean(row.identity_card);
  // 掩码必须基于明文才能有意义；锁定时不解密，只说明「已保存」。
  const unlocked = vaultStatus(db).unlocked;
  const phone = hasPhone && unlocked ? decryptField(db, row.phone_number) : "";
  const identity = hasIdentity && unlocked ? decryptField(db, row.identity_card) : "";
  const lockedTip = "已保存";
  const base = {
    id: String(row.id),
    siteId: String(row.site_id),
    accountKey: String(row.account_key || ""),
    account: String(row.account || ""),
    hasPassword: hasPassword,
    hasPhone: hasPhone,
    hasIdentity: hasIdentity,
    phoneNumber: hasPhone ? (unlocked ? maskMiddle(phone) : lockedTip) : "",
    identityCard: hasIdentity ? (unlocked ? maskMiddle(identity) : lockedTip) : "",
    remark: String(row.remark || ""),
    externals: externalsOf(db, row.id),
    createdAt: Number(row.created_at) || 0,
    updatedAt: Number(row.updated_at) || 0,
  };
  if (!reveal) return base;
  return Object.assign(base, {
    password: decryptField(db, row.password),
    phoneNumber: decryptField(db, row.phone_number),
    identityCard: decryptField(db, row.identity_card),
  });
}

export function listAccounts(db, siteId, opts) {
  const site = siteOf(db, siteId);
  if (!site) throw new Error("站点不存在：" + (siteId || "(空)"));
  const rows = db
    .prepare("SELECT * FROM " + ACCOUNT_TABLE + " WHERE site_id=? AND deleted_at IS NULL ORDER BY created_at ASC, id ASC")
    .all(String(site.id));
  return {
    siteId: String(site.id),
    siteName: String(site.site_name || ""),
    total: rows.length,
    accounts: rows.map((row) => outAccount(db, row, opts)),
    vault: vaultStatus(db),
  };
}

/* ------------------------------------------------------------------ 写入 */

/** 敏感字段写入：空串表示清空；非空必须保险箱解锁。 */
function sealSensitive(db, value, label) {
  const s = value == null ? "" : String(value);
  if (!s) return "";
  if (s.length > Math.max(MAX_PHONE, MAX_IDENTITY)) throw new Error(label + "过长");
  requireKey(db);
  return encryptField(db, s);
}

function insertRelation(db, nativeId, externalId, ts, origin) {
  const existing = db
    .prepare(
      "SELECT * FROM " + EXTERNAL_TABLE + " WHERE native_account_id=? AND external_account_id=? AND deleted_at IS NULL",
    )
    .get(String(nativeId), String(externalId));
  if (existing) return String(existing.id);
  const row = {
    id: newId(),
    native_account_id: String(nativeId),
    external_account_id: String(externalId),
    created_at: ts,
    updated_at: ts,
    deleted_at: null,
    rev: 1,
  };
  db.prepare(
    "INSERT INTO " + EXTERNAL_TABLE + "(id,native_account_id,external_account_id,created_at,updated_at,deleted_at,rev) VALUES(?,?,?,?,?,?,?)",
  ).run(row.id, row.native_account_id, row.external_account_id, ts, ts, null, 1);
  logChange(db, EXTERNAL_TABLE, row.id, "create", row, origin, ts);
  return row.id;
}

function assertLinkable(db, nativeId, externalId) {
  if (String(nativeId) === String(externalId)) throw new Error("不能把账号外联到自己");
  const native = liveAccount(db, nativeId);
  if (!native) throw new Error("引用方账号不存在：" + nativeId);
  const external = liveAccount(db, externalId);
  if (!external) throw new Error("被引用账号不存在：" + externalId);
  if (String(native.site_id) === String(external.site_id)) throw new Error("不能外联同一站点内的账号");
  const targetSite = siteOf(db, external.site_id);
  if (!targetSite) throw new Error("被引用账号所属站点不存在");
  if (Number(targetSite.bindable) === 0) throw new Error("被引用站点已关闭外联（bindable=0），不能作为外联目标");
  if (!String(external.account_key || "").trim()) throw new Error("被引用账号没有标识（accountKey），不能作为外联目标");
  return { native, external };
}

/** 整体替换某账号的外联集合。 */
function replaceExternals(db, nativeId, ids, ts, origin) {
  const wanted = new Set((ids || []).map((v) => String(v)));
  const current = db
    .prepare("SELECT * FROM " + EXTERNAL_TABLE + " WHERE native_account_id=? AND deleted_at IS NULL")
    .all(String(nativeId));
  for (const row of current) {
    if (!wanted.has(String(row.external_account_id))) {
      db.prepare("UPDATE " + EXTERNAL_TABLE + " SET deleted_at=?, updated_at=?, rev=rev+1 WHERE id=?").run(ts, ts, String(row.id));
      logChange(db, EXTERNAL_TABLE, String(row.id), "delete", null, origin, ts);
    }
  }
  for (const id of wanted) {
    const exists = db
      .prepare(
        "SELECT id FROM " + EXTERNAL_TABLE + " WHERE native_account_id=? AND external_account_id=? AND deleted_at IS NULL",
      )
      .get(String(nativeId), id);
    if (exists) continue;
    assertLinkable(db, nativeId, id);
    insertRelation(db, nativeId, id, ts, origin);
  }
}

export function createAccount(db, args, origin) {
  const siteId = String(idOf(args.siteId));
  const site = siteOf(db, siteId);
  if (!site) throw new Error("站点不存在：" + (siteId || "(空)"));
  const key = keyOf(args.accountKey);
  assertKeyUnique(db, siteId, key, "");
  const account = textOf(args.account, MAX_ACCOUNT, "登录名");
  const remark = textOf(args.remark, MAX_REMARK, "备注");
  const incoming = ["password", "phoneNumber", "identityCard"].some(
    (name) => args[name] !== undefined && String(args[name]).length > 0,
  );
  if (incoming && !vaultEnabled(db)) throw new Error("请先设置账号保险箱口令（sites.vault.setup）再填写敏感字段");
  const password = sealSensitive(db, args.password, "密码");
  const phone = sealSensitive(db, args.phoneNumber, "手机号");
  const identity = sealSensitive(db, args.identityCard, "身份证");
  const ts = now();
  const id = newId();
  tx(db, function () {
    db.prepare(
      "INSERT INTO " + ACCOUNT_TABLE +
        "(id,site_id,account_key,account,password,phone_number,identity_card,remark,created_at,updated_at,deleted_at,rev) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
    ).run(id, siteId, key, account, password, phone, identity, remark, ts, ts, null, 1);
    logChange(db, ACCOUNT_TABLE, id, "create", {
      id: id,
      site_id: siteId,
      account_key: key,
      account: account,
      remark: remark,
      created_at: ts,
      updated_at: ts,
      deleted_at: null,
      rev: 1,
    }, origin, ts);
    if (Array.isArray(args.externalAccountIds)) replaceExternals(db, id, args.externalAccountIds, ts, origin);
  });
  return { id: id, accountKey: key };
}

export function updateAccount(db, args, origin) {
  const id = String(idOf(args.id));
  const existing = liveAccount(db, id);
  if (!existing) throw new Error("账号不存在：" + (id || "(空)"));
  if (args.siteId !== undefined && String(idOf(args.siteId)) !== String(existing.site_id)) {
    throw new Error("账号不能更换所属站点");
  }
  const key = args.accountKey !== undefined ? keyOf(args.accountKey) : String(existing.account_key || "");
  if (key !== String(existing.account_key || "")) assertKeyUnique(db, existing.site_id, key, id);
  const account = args.account !== undefined ? textOf(args.account, MAX_ACCOUNT, "登录名") : String(existing.account || "");
  const remark = args.remark !== undefined ? textOf(args.remark, MAX_REMARK, "备注") : String(existing.remark || "");
  const patch = { account_key: key, account: account, remark: remark, updated_at: now(), rev: Number(existing.rev) + 1 };
  if (args.password !== undefined) patch.password = sealSensitive(db, args.password, "密码");
  if (args.phoneNumber !== undefined) patch.phone_number = sealSensitive(db, args.phoneNumber, "手机号");
  if (args.identityCard !== undefined) patch.identity_card = sealSensitive(db, args.identityCard, "身份证");
  const ts = patch.updated_at;
  tx(db, function () {
    db.prepare(
      "UPDATE " + ACCOUNT_TABLE +
        " SET account_key=?, account=?, remark=?, password=?, phone_number=?, identity_card=?, updated_at=?, rev=rev+1 WHERE id=?",
    ).run(
      patch.account_key,
      patch.account,
      patch.remark,
      patch.password !== undefined ? patch.password : String(existing.password || ""),
      patch.phone_number !== undefined ? patch.phone_number : String(existing.phone_number || ""),
      patch.identity_card !== undefined ? patch.identity_card : String(existing.identity_card || ""),
      ts,
      id,
    );
    logChange(db, ACCOUNT_TABLE, id, "upsert", Object.assign({}, existing, patch), origin, ts);
    if (Array.isArray(args.externalAccountIds)) replaceExternals(db, id, args.externalAccountIds, ts, origin);
  });
  return { ok: true, id: id };
}

export function deleteAccount(db, args, origin) {
  const id = String(idOf(args.id));
  const existing = liveAccount(db, id);
  if (!existing) return { ok: true, deleted: false, missing: true };
  const ts = now();
  let cleared = 0;
  tx(db, function () {
    const rels = db
      .prepare(
        "SELECT * FROM " + EXTERNAL_TABLE + " WHERE deleted_at IS NULL AND (native_account_id=? OR external_account_id=?)",
      )
      .all(id, id);
    for (const rel of rels) {
      db.prepare("UPDATE " + EXTERNAL_TABLE + " SET deleted_at=?, updated_at=?, rev=rev+1 WHERE id=?").run(ts, ts, String(rel.id));
      logChange(db, EXTERNAL_TABLE, String(rel.id), "delete", null, origin, ts);
      cleared++;
    }
    db.prepare("UPDATE " + ACCOUNT_TABLE + " SET deleted_at=?, updated_at=?, rev=rev+1 WHERE id=?").run(ts, ts, id);
    logChange(db, ACCOUNT_TABLE, id, "delete", null, origin, ts);
  });
  return { ok: true, deleted: true, clearedRelations: cleared };
}

export function linkAccounts(db, args, origin) {
  const nativeId = String(idOf(args.nativeAccountId));
  const externalId = String(idOf(args.externalAccountId));
  assertLinkable(db, nativeId, externalId);
  const ts = now();
  let relId = "";
  tx(db, function () {
    relId = insertRelation(db, nativeId, externalId, ts, origin);
  });
  return { ok: true, relationId: relId };
}

export function unlinkAccounts(db, args, origin) {
  const nativeId = String(idOf(args.nativeAccountId));
  const externalId = String(idOf(args.externalAccountId));
  const row = db
    .prepare(
      "SELECT * FROM " + EXTERNAL_TABLE + " WHERE native_account_id=? AND external_account_id=? AND deleted_at IS NULL",
    )
    .get(nativeId, externalId);
  if (!row) return { ok: true, deleted: false, missing: true };
  const ts = now();
  tx(db, function () {
    db.prepare("UPDATE " + EXTERNAL_TABLE + " SET deleted_at=?, updated_at=?, rev=rev+1 WHERE id=?").run(ts, ts, String(row.id));
    logChange(db, EXTERNAL_TABLE, String(row.id), "delete", null, origin, ts);
  });
  return { ok: true, deleted: true };
}

export function cascadeGroups(db, args) {
  const exclude = args && args.excludeSiteId !== undefined ? String(idOf(args.excludeSiteId)) : "";
  const rows = db
    .prepare(
      "SELECT a.id, a.account_key, a.site_id, s.site_name FROM " + ACCOUNT_TABLE + " a" +
        " JOIN " + SITE_TABLE + " s ON s.id=a.site_id" +
        " WHERE a.deleted_at IS NULL AND s.deleted_at IS NULL AND s.bindable=1 AND TRIM(a.account_key)<>''" +
        " ORDER BY s.site_name ASC, a.account_key ASC",
    )
    .all();
  const groups = [];
  const index = new Map();
  for (const row of rows) {
    const siteId = String(row.site_id);
    if (exclude && siteId === exclude) continue;
    if (!index.has(siteId)) {
      const group = { siteId: siteId, siteName: String(row.site_name || ""), accounts: [] };
      index.set(siteId, group);
      groups.push(group);
    }
    index.get(siteId).accounts.push({ id: String(row.id), accountKey: String(row.account_key || "") });
  }
  return { total: groups.length, groups: groups };
}

export function getAccount(db, id, origin) {
  const row = liveAccount(db, id);
  if (!row) throw new Error("账号不存在：" + (id || "(空)"));
  const reveal = String(origin || "") === "ui" && vaultStatus(db).unlocked;
  if (!reveal) {
    const base = outAccount(db, row, { reveal: false });
    return { account: base, masked: true, reason: "明文仅界面可查看；请在界面解锁保险箱后查看" };
  }
  return { account: outAccount(db, row, { reveal: true }), masked: false };
}

/** 明文仅界面可用：用于「显形/复制」，不解锁则抛错。 */
export function revealAccount(db, id, origin) {
  if (String(origin || "") !== "ui") throw new Error("明文仅界面可查看");
  const row = liveAccount(db, id);
  if (!row) throw new Error("账号不存在：" + (id || "(空)"));
  return {
    id: String(row.id),
    password: decryptField(db, row.password),
    phoneNumber: decryptField(db, row.phone_number),
    identityCard: decryptField(db, row.identity_card),
  };
}

/* --------------------------------------------------------------- 渲染文本 */

function renderAccounts(r) {
  if (!r || !r.accounts) return "站点不存在";
  const lines = ["站点账号 · " + r.siteName + "（" + r.total + " 个）"];
  for (const a of r.accounts) {
    const bits = [a.accountKey];
    if (a.account) bits.push("登录名=" + a.account);
    if (a.hasPassword) bits.push("密码=已保存");
    if (a.hasPhone) bits.push("手机=" + (a.phoneNumber || "已保存"));
    if (a.hasIdentity) bits.push("证件=" + (a.identityCard || "已保存"));
    if (a.externals.length) bits.push("外联=" + a.externals.map((x) => x.siteName + " · " + x.accountKey).join("，"));
    lines.push("- " + bits.join(" · "));
  }
  if (!r.accounts.length) lines.push("（暂无账号）");
  return lines.join("\n");
}

/* --------------------------------------------------------------- 注册 */

export function registerAccountActions(api) {
  const db = api.db;
  const action = api.action;

  action("sites.accounts.list", {
    description: "列出某站点的账号（密码与证件/手机号均为掩码；明文只在界面解锁后经 sites.accounts.get 返回）",
    input: {
      type: "object",
      properties: { siteId: { type: ["string", "number"], description: "站点 id，必填" } },
      required: ["siteId"],
    },
    execute: function (args) { return listAccounts(db, args.siteId, {}); },
    render: renderAccounts,
  });

  action("sites.accounts.get", {
    description:
      "取单个账号。敏感字段（password/phoneNumber/identityCard）仅在界面调用且账号保险箱已解锁时返回明文；agent 调用只返回掩码与 masked:true。",
    input: {
      type: "object",
      properties: { id: { type: ["string", "number"], description: "账号 id，必填" } },
      required: ["id"],
    },
    execute: function (args, ctx) { return getAccount(db, args.id, ctx && ctx.origin); },
    render: function (r) {
      if (!r || !r.account) return "账号不存在";
      const a = r.account;
      const head = a.accountKey + (a.account ? "（" + a.account + "）" : "");
      return r.masked ? head + " · 敏感字段已掩码（仅界面可见）" : head + " · 密码=" + (a.password ? "已保存（明文已返回）" : "未填写");
    },
  });

  action("sites.accounts.reveal", {
    description: "【仅界面】返回账号敏感字段明文，用于显形与复制；agent 调用一律拒绝。调用前需解锁保险箱。",
    input: {
      type: "object",
      properties: { id: { type: ["string", "number"], description: "账号 id，必填" } },
      required: ["id"],
    },
    execute: function (args, ctx) { return revealAccount(db, args.id, ctx && ctx.origin); },
    render: function () { return "已返回明文（仅界面）"; },
  });

  action("sites.accounts.create", {
    description:
      "为站点新增账号。accountKey 必填且同站点内唯一；password/phoneNumber/identityCard 写库前加密，需要先设置并解锁账号保险箱；externalAccountIds 为外联账号 id 列表（可空）。",
    input: {
      type: "object",
      properties: {
        siteId: { type: ["string", "number"] },
        accountKey: { type: "string", description: "站点内唯一标识，必填，≤60 字" },
        account: { type: "string", description: "登录名，可空" },
        password: { type: "string", description: "敏感：加密存储，需保险箱解锁" },
        phoneNumber: { type: "string", description: "敏感：加密存储，需保险箱解锁" },
        identityCard: { type: "string", description: "敏感：加密存储，需保险箱解锁" },
        remark: { type: "string", description: "备注，可空，≤2000 字" },
        externalAccountIds: { type: "array", items: { type: ["string", "number"] }, description: "外联账号 id 列表" },
      },
      required: ["siteId", "accountKey"],
    },
    execute: function (args, ctx) { return createAccount(db, args, ctx && ctx.origin); },
    render: function (r) { return "账号已创建：" + r.accountKey; },
  });

  action("sites.accounts.update", {
    description:
      "更新账号字段。accountKey 变更需保持同站点唯一；siteId 不可更改；password/phoneNumber/identityCard 传空串表示清空、传值表示重设（需保险箱解锁）；externalAccountIds 给定时整体替换外联集合。",
    input: {
      type: "object",
      properties: {
        id: { type: ["string", "number"] },
        accountKey: { type: "string" },
        account: { type: "string" },
        password: { type: "string" },
        phoneNumber: { type: "string" },
        identityCard: { type: "string" },
        remark: { type: "string" },
        externalAccountIds: { type: "array", items: { type: ["string", "number"] } },
      },
      required: ["id"],
    },
    execute: function (args, ctx) { return updateAccount(db, args, ctx && ctx.origin); },
    render: function () { return "账号已更新"; },
  });

  action("sites.accounts.delete", {
    description: "删除账号（软删），并双向清除其外联关系（同一事务）。",
    input: {
      type: "object",
      properties: { id: { type: ["string", "number"] } },
      required: ["id"],
    },
    execute: function (args, ctx) { return deleteAccount(db, args, ctx && ctx.origin); },
    render: function (r) {
      return r && r.deleted === false ? "账号不存在（可能已删除）" : "账号已删除" + (r && r.clearedRelations ? "，清除外联 " + r.clearedRelations + " 条" : "");
    },
  });

  action("sites.accounts.link", {
    description: "建立外联：nativeAccountId 引用 externalAccountId。两端必须是不同站点、被引用账号有 accountKey、且被引用站点 bindable=1。重复调用幂等。",
    input: {
      type: "object",
      properties: {
        nativeAccountId: { type: ["string", "number"] },
        externalAccountId: { type: ["string", "number"] },
      },
      required: ["nativeAccountId", "externalAccountId"],
    },
    execute: function (args, ctx) { return linkAccounts(db, args, ctx && ctx.origin); },
    render: function (r) { return "外联已建立（" + r.relationId + "）"; },
  });

  action("sites.accounts.unlink", {
    description: "解除外联关系；关系不存在时返回 ok（幂等）。",
    input: {
      type: "object",
      properties: {
        nativeAccountId: { type: ["string", "number"] },
        externalAccountId: { type: ["string", "number"] },
      },
      required: ["nativeAccountId", "externalAccountId"],
    },
    execute: function (args, ctx) { return unlinkAccounts(db, args, ctx && ctx.origin); },
    render: function (r) { return r && r.deleted ? "外联已解除" : "外联关系不存在"; },
  });

  action("sites.accounts.cascade", {
    description: "外联候选：按站点分组返回可被外联的账号（站点 bindable=1 且账号有 accountKey），可用 excludeSiteId 排除当前站点。",
    input: {
      type: "object",
      properties: { excludeSiteId: { type: ["string", "number"] } },
    },
    execute: function (args) { return cascadeGroups(db, args || {}); },
    render: function (r) {
      const lines = ["外联候选：" + r.total + " 个站点"];
      for (const g of r.groups) lines.push("- " + g.siteName + "：" + g.accounts.map((a) => a.accountKey).join("，"));
      return lines.join("\n");
    },
  });

  action("sites.vault.status", {
    description: "账号保险箱状态：是否已设置口令、是否已解锁、空闲锁定时长。不返回任何密钥材料。",
    input: { type: "object", properties: {} },
    execute: function () { return vaultStatus(db); },
    render: function (r) {
      if (!r.enabled) return "账号保险箱：未设置口令（填写密码/手机号/身份证前需先设置）";
      return "账号保险箱：" + (r.unlocked ? "已解锁（剩余 " + Math.round(r.remainingMs / 1000) + " 秒）" : "已锁定");
    },
  });

  action("sites.vault.setup", {
    description: "首次设置账号保险箱口令（≥8 位）。口令经 scrypt 派生密钥，密钥不落库、不同步；口令丢失则敏感字段永久不可读。",
    input: {
      type: "object",
      properties: { passphrase: { type: "string", description: "口令，≥8 位" } },
      required: ["passphrase"],
    },
    execute: async function (args) { return setupVault(db, args.passphrase); },
    render: function () { return "账号保险箱已设置并解锁"; },
  });

  action("sites.vault.unlock", {
    description: "用口令解锁账号保险箱（密钥只存在内存，空闲自动锁定）。",
    input: {
      type: "object",
      properties: { passphrase: { type: "string" } },
      required: ["passphrase"],
    },
    execute: async function (args) { return unlockVault(db, args.passphrase); },
    render: function () { return "账号保险箱已解锁"; },
  });

  action("sites.vault.lock", {
    description: "立即锁定账号保险箱（清空内存密钥）。",
    input: { type: "object", properties: {} },
    execute: function () { lockVault(); return vaultStatus(db); },
    render: function () { return "账号保险箱已锁定"; },
  });

  action("sites.vault.rekey", {
    description: "更换账号保险箱口令：校验原口令后，用新密钥重新加密全部敏感列（单事务）。",
    input: {
      type: "object",
      properties: {
        oldPassphrase: { type: "string" },
        newPassphrase: { type: "string", description: "新口令，≥8 位" },
      },
      required: ["oldPassphrase", "newPassphrase"],
    },
    execute: async function (args, ctx) {
      return rekeyVault(db, args.oldPassphrase, args.newPassphrase);
    },
    render: function () { return "口令已更换，敏感字段已用新密钥重新加密"; },
  });
}

/** 供数据页判断某列是否需要掩码。 */
export const SENSITIVE_COLUMNS = new Set(["password", "phone_number", "identity_card"]);

/** 掩码工具复用（数据页/渲染）。 */
export { maskSecret, maskMiddle, isEncrypted };
