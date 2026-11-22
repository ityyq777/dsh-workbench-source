/**
 * 凭据集合（set）：分组与凭据之间的可复用层。
 * 分组 ──< vault_group_set >── 集合 ──< vault_set_secret >── 凭据
 * 关联表只存引用，增删关系不触发重加密（AAD 不含归属）。
 */
import { groupSetRow, newId, now, setRow, setSecretRow, tx } from "../db/db.js";
import { isSealedAccount, openAccount, sealAccount } from "../infra/crypto.js";

function assertSetName(name) {
  const value = String(name || "").trim();
  if (!value || value.length > 100) throw new Error("集合名称必填，最多 100 字");
  return value;
}

/** 账号可空、可重复：留空即普通集合，有值即账号集合；身份仍由集合 id 承担。 */
function assertSetAccount(account) {
  const value = String(account == null ? "" : account).trim();
  if (value.length > 100) throw new Error("集合账号最多 100 字");
  return value;
}

export function createSets({ db, getDek = () => null }) {
  function dekOrNull() {
    return typeof getDek === "function" ? getDek() : null;
  }

  /**
   * 账号列读写（0.5.0 起）：非空值一律 DEK 加密成 `va1:` 密文，空串保持空串，
   * 「账号集合 / 普通集合」仍按原始列是否为空推导。
   * 锁定态读返回空串并标 accountLocked（界面已有锁定提示）；解密失败同样按锁定处理，
   * 单个坏行不会拖垮整个列表，写操作则要求先解锁。
   */
  function decryptAccount(row) {
    const raw = String(row.account || "");
    if (!raw) return { value: "", locked: false };
    if (!isSealedAccount(raw)) return { value: raw, locked: false };
    const dek = dekOrNull();
    if (!dek) return { value: "", locked: true };
    try {
      return { value: openAccount(dek, raw, row.id), locked: false };
    } catch {
      return { value: "", locked: true };
    }
  }

  /** 明文账号 → 落库值；非空账号必须能拿到 DEK。 */
  function encryptAccount(setId, value) {
    const account = assertSetAccount(value);
    if (!account) return "";
    const dek = dekOrNull();
    if (!dek) throw new Error("保险箱已锁定，无法保存集合账号，请先解锁");
    return sealAccount(dek, account, setId);
  }

  /** 账号列已经是密文时，任何改动（包括清空）都要求先解锁，避免锁定态误删账号。 */
  function assertAccountUnlocked(row) {
    if (isSealedAccount(row.account) && !dekOrNull()) {
      throw new Error("保险箱已锁定，无法更新集合账号，请先解锁");
    }
  }

  /** 集合行 → 对外对象：账号解密，但类型仍按加密前的列是否为空判断。 */
  function setView(row) {
    if (!row) return null;
    const account = decryptAccount(row);
    const view = setRow({ ...row, account: account.value });
    view.type = String(row.account || "") ? "account" : "common";
    view.accountLocked = account.locked;
    return view;
  }

  function setOrThrow(id) {
    const row = db.prepare("SELECT * FROM vault_set WHERE id = ? AND deleted_at IS NULL").get(String(id || ""));
    if (!row) throw new Error("集合不存在：" + id);
    return row;
  }

  function groupName(groupId) {
    const row = db.prepare("SELECT name FROM vault_group WHERE id = ? AND deleted_at IS NULL").get(String(groupId || ""));
    return row ? String(row.name) : "";
  }

  function findSetByName(name) {
    return db.prepare("SELECT * FROM vault_set WHERE name = ? AND deleted_at IS NULL").get(String(name)) || null;
  }

  function touchSet(setId) {
    db.prepare("UPDATE vault_set SET updated_at = ?, rev = rev + 1 WHERE id = ?").run(now(), String(setId));
  }

  /** 幂等建集合；同名（全局唯一）直接复用。 */
  function ensureSet(name, extra = {}) {
    const value = assertSetName(name);
    const existing = findSetByName(value);
    if (existing) return setView(existing);
    const ts = now();
    const id = newId("set");
    try {
      db.prepare(
        "INSERT INTO vault_set(id, name, account, description, color, created_at, updated_at, rev) " +
          "VALUES(?, ?, ?, ?, ?, ?, ?, 1)",
      ).run(
        id,
        value,
        encryptAccount(id, extra.account),
        String(extra.description || ""),
        extra.color ? String(extra.color) : null,
        ts,
        ts,
      );
    } catch (error) {
      if (!String(error && error.message).includes("UNIQUE")) throw error;
      const row = findSetByName(value);
      if (!row) throw error;
      return setView(row);
    }
    return setView(db.prepare("SELECT * FROM vault_set WHERE id = ?").get(id));
  }

  function linkGroupSet(groupId, setId) {
    const gid = String(groupId || "");
    const sid = String(setId || "");
    if (!gid || !sid) throw new Error("groupId 与 setId 必填");
    const existing = db
      .prepare("SELECT * FROM vault_group_set WHERE group_id = ? AND set_id = ? AND deleted_at IS NULL")
      .get(gid, sid);
    if (existing) return { id: existing.id, existing: true };
    const ts = now();
    const id = newId("gs");
    db.prepare(
      "INSERT INTO vault_group_set(id, group_id, set_id, created_at, updated_at, rev) VALUES(?, ?, ?, ?, ?, 1)",
    ).run(id, gid, sid, ts, ts);
    return { id, existing: false };
  }

  function unlinkGroupSet(groupId, setId) {
    const ts = now();
    const info = db
      .prepare(
        "UPDATE vault_group_set SET deleted_at = ?, updated_at = ?, rev = rev + 1 " +
          "WHERE group_id = ? AND set_id = ? AND deleted_at IS NULL",
      )
      .run(ts, ts, String(groupId), String(setId));
    return { ok: true, removed: Number(info.changes || 0) > 0 };
  }

  function linkSecret(setId, secretId) {
    const sid = String(setId || "");
    const kid = String(secretId || "");
    if (!sid || !kid) throw new Error("setId 与 secretId 必填");
    const existing = db
      .prepare("SELECT * FROM vault_set_secret WHERE set_id = ? AND secret_id = ? AND deleted_at IS NULL")
      .get(sid, kid);
    if (existing) return { id: existing.id, existing: true };
    const ts = now();
    const id = newId("ss");
    db.prepare(
      "INSERT INTO vault_set_secret(id, set_id, secret_id, created_at, updated_at, rev) VALUES(?, ?, ?, ?, ?, 1)",
    ).run(id, sid, kid, ts, ts);
    touchSet(sid);
    return { id, existing: false };
  }

  function unlinkSecret(setId, secretId) {
    const ts = now();
    const info = db
      .prepare(
        "UPDATE vault_set_secret SET deleted_at = ?, updated_at = ?, rev = rev + 1 " +
          "WHERE set_id = ? AND secret_id = ? AND deleted_at IS NULL",
      )
      .run(ts, ts, String(setId), String(secretId));
    touchSet(String(setId));
    return { ok: true, removed: Number(info.changes || 0) > 0 };
  }

  /** 旧分组的「<组名> · 默认」集合；迁移与 plugin 写接口共用。 */
  function ensureDefaultSet(groupId) {
    const gid = String(groupId || "");
    if (!gid) throw new Error("groupId 必填");
    const name = (groupName(gid) || gid) + " · 默认";
    const row = ensureSet(name);
    linkGroupSet(gid, row.id);
    return row;
  }

  function setsOfGroup(groupId) {
    const rows = db
      .prepare(
        "SELECT s.* FROM vault_set s JOIN vault_group_set gs ON gs.set_id = s.id " +
          "WHERE gs.group_id = ? AND gs.deleted_at IS NULL AND s.deleted_at IS NULL ORDER BY s.name COLLATE NOCASE",
      )
      .all(String(groupId || ""));
    return rows.map(setView);
  }

  function groupsOfSet(setId) {
    return db
      .prepare(
        "SELECT group_id FROM vault_group_set WHERE set_id = ? AND deleted_at IS NULL ORDER BY group_id",
      )
      .all(String(setId || ""))
      .map((row) => row.group_id);
  }

  function setIdsOfSecret(secretId) {
    return db
      .prepare("SELECT set_id FROM vault_set_secret WHERE secret_id = ? AND deleted_at IS NULL ORDER BY set_id")
      .all(String(secretId || ""))
      .map((row) => row.set_id);
  }

  function secretsOfSet(setId) {
    return db
      .prepare(
        "SELECT k.* FROM vault_secret k JOIN vault_set_secret ss ON ss.secret_id = k.id " +
          "WHERE ss.set_id = ? AND ss.deleted_at IS NULL AND k.deleted_at IS NULL ORDER BY k.name COLLATE NOCASE",
      )
      .all(String(setId || ""));
  }

  function secretCountOfSet(setId) {
    return Number(
      db
        .prepare(
          "SELECT COUNT(*) AS n FROM vault_set_secret ss JOIN vault_secret k ON k.id = ss.secret_id " +
            "WHERE ss.set_id = ? AND ss.deleted_at IS NULL AND k.deleted_at IS NULL",
        )
        .get(String(setId || ""))?.n || 0,
    );
  }

  function listSets(args = {}) {
    const q = String(args.q || "").trim().toLowerCase();
    const where = ["s.deleted_at IS NULL"];
    const params = [];
    if (args.type === "account") where.push("s.account <> ''");
    else if (args.type === "common") where.push("s.account = ''");
    let join = "";
    if (args.groupId) {
      join =
        "JOIN vault_group_set gs ON gs.set_id = s.id AND gs.deleted_at IS NULL AND gs.group_id = ? ";
      params.unshift(String(args.groupId));
    }
    const rows = db
      .prepare(
        "SELECT DISTINCT s.* FROM vault_set s " + join + "WHERE " + where.join(" AND ") + " ORDER BY s.name COLLATE NOCASE",
      )
      .all(...params);
    const items = rows.map((row) => ({
      ...setView(row),
      secretCount: secretCountOfSet(row.id),
      groupIds: groupsOfSet(row.id),
    }));
    // 账号是密文，SQL 的 LIKE 匹配不到；集合量级小，解锁后在内存里统一过滤。
    const filtered = q
      ? items.filter((item) => [item.name, item.account, item.description].join("\n").toLowerCase().includes(q))
      : items;
    return { items: filtered };
  }

  function createSet(args = {}) {
    const name = assertSetName(args.name);
    if (findSetByName(name)) throw new Error("已有同名集合：" + name);
    const ts = now();
    const id = newId("set");
    db.prepare(
      "INSERT INTO vault_set(id, name, account, description, color, created_at, updated_at, rev) " +
        "VALUES(?, ?, ?, ?, ?, ?, ?, 1)",
    ).run(
      id,
      name,
      encryptAccount(id, args.account),
      String(args.description || "").slice(0, 500),
      args.color ? String(args.color) : null,
      ts,
      ts,
    );
    return setView(db.prepare("SELECT * FROM vault_set WHERE id = ?").get(id));
  }

  function updateSet(args = {}) {
    const row = setOrThrow(args.id);
    const name = args.name == null ? row.name : assertSetName(args.name);
    if (name !== row.name && findSetByName(name)) throw new Error("已有同名集合：" + name);
    // 未传 account 时保留原密文，不因改名而重加密；传了就先过锁定检查再加密。
    let account = String(row.account || "");
    if (args.account !== undefined) {
      assertAccountUnlocked(row);
      account = encryptAccount(row.id, args.account);
    }
    const description = args.description == null ? row.description : String(args.description).slice(0, 500);
    const color = args.color === undefined ? row.color : args.color ? String(args.color) : null;
    db.prepare(
      "UPDATE vault_set SET name = ?, account = ?, description = ?, color = ?, updated_at = ?, rev = rev + 1 WHERE id = ?",
    ).run(name, account, description, color, now(), row.id);
    return setView(db.prepare("SELECT * FROM vault_set WHERE id = ?").get(row.id));
  }

  /** 只改集合的账号展示值（站点账号改名时同步），不动名称/描述/颜色。 */
  function updateSetAccount(setId, account) {
    const row = setOrThrow(setId);
    const plain = assertSetAccount(account);
    assertAccountUnlocked(row);
    const current = String(row.account || "");
    if (!plain) {
      if (current !== "") {
        db.prepare("UPDATE vault_set SET account = '', updated_at = ?, rev = rev + 1 WHERE id = ?").run(now(), row.id);
      }
    } else if (decryptAccount(row).value !== plain) {
      db.prepare("UPDATE vault_set SET account = ?, updated_at = ?, rev = rev + 1 WHERE id = ?").run(
        encryptAccount(row.id, plain),
        now(),
        row.id,
      );
    }
    return setView(db.prepare("SELECT * FROM vault_set WHERE id = ?").get(row.id));
  }

  function detachAllLinks(setId) {
    const ts = now();
    db.prepare(
      "UPDATE vault_group_set SET deleted_at = ?, updated_at = ?, rev = rev + 1 WHERE set_id = ? AND deleted_at IS NULL",
    ).run(ts, ts, String(setId));
    db.prepare(
      "UPDATE vault_set_secret SET deleted_at = ?, updated_at = ?, rev = rev + 1 WHERE set_id = ? AND deleted_at IS NULL",
    ).run(ts, ts, String(setId));
  }

  /** 软删集合：只删关联，凭据保留。 */
  function deleteSet(setId) {
    const row = setOrThrow(setId);
    tx(db, () => {
      detachAllLinks(row.id);
      const ts = now();
      db.prepare("UPDATE vault_set SET deleted_at = ?, updated_at = ?, rev = rev + 1 WHERE id = ?").run(ts, ts, row.id);
    });
    return { ok: true };
  }

  /** 软删凭据时同步收回它在所有集合里的关联。 */
  function detachSecretEverywhere(secretId) {
    db.prepare(
      "UPDATE vault_set_secret SET deleted_at = ?, updated_at = ?, rev = rev + 1 WHERE secret_id = ? AND deleted_at IS NULL",
    ).run(now(), now(), String(secretId));
  }

  /** 分组被删除：关联集合整体改挂到新分组，不传则只断开关联。 */
  function relinkGroup(oldGroupId, newGroupId) {
    const gid = String(oldGroupId || "");
    if (!gid) return { moved: 0 };
    const links = db
      .prepare("SELECT set_id FROM vault_group_set WHERE group_id = ? AND deleted_at IS NULL")
      .all(gid);
    if (!newGroupId) {
      db.prepare(
        "UPDATE vault_group_set SET deleted_at = ?, updated_at = ?, rev = rev + 1 WHERE group_id = ? AND deleted_at IS NULL",
      ).run(now(), now(), gid);
      return { moved: 0, unlinked: links.length };
    }
    for (const link of links) linkGroupSet(newGroupId, link.set_id);
    unlinkAllOfGroup(gid);
    return { moved: links.length };
  }

  function unlinkAllOfGroup(groupId) {
    db.prepare(
      "UPDATE vault_group_set SET deleted_at = ?, updated_at = ?, rev = rev + 1 WHERE group_id = ? AND deleted_at IS NULL",
    ).run(now(), now(), String(groupId || ""));
  }

  function getSet(args = {}) {
    const row = setOrThrow(args.id);
    const secrets = secretsOfSet(row.id).map((item) => ({
      id: item.id,
      name: item.name,
      kind: item.kind,
      updatedAt: item.updated_at,
    }));
    return { ...setView(row), groupIds: groupsOfSet(row.id), secrets };
  }

  return {
    ensureSet,
    ensureDefaultSet,
    linkGroupSet,
    unlinkGroupSet,
    linkSecret,
    unlinkSecret,
    setsOfGroup,
    groupsOfSet,
    setIdsOfSecret,
    secretsOfSet,
    secretCountOfSet,
    listSets,
    createSet,
    updateSet,
    updateSetAccount,
    deleteSet,
    detachSecretEverywhere,
    relinkGroup,
    unlinkAllOfGroup,
    getSet,
    groupSetRow,
    setSecretRow,
  };
}
