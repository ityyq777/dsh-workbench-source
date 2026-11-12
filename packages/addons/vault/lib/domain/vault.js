/**
 * 保险箱核心：KDF 包裹 DEK、DEK 加密 secret，DEK 只在内存。
 * A/B/C 三种 unlock_mode 共用同一套表；切换失败保持原模式。
 */
import { randomBytes } from "node:crypto";
import {
  KDF_DEFAULT,
  deriveKey,
  open,
  readDeviceKey,
  removeDeviceKey,
  seal,
  secretAad,
  writeDeviceKey,
} from "../infra/crypto.js";
import {
  metaAll,
  metaDel,
  metaGet,
  metaSet,
  newId,
  now,
  secretRow,
  tx,
} from "../db/db.js";

const KINDS = new Set(["password", "token", "app_password", "api_key", "other"]);
const MODES = new Set(["A", "B", "C"]);
const META_BAD = /(pass(word|wd)?|pwd|token|secret|api[_-]?key|private[_-]?key|credential)/i;

function parseKdf(raw) {
  try {
    const value = JSON.parse(String(raw || "{}"));
    return { ...KDF_DEFAULT, ...value };
  } catch {
    return { ...KDF_DEFAULT };
  }
}

function parseJson(raw, fallback) {
  try {
    return JSON.parse(String(raw));
  } catch {
    return fallback;
  }
}

function validateMode(mode) {
  const value = String(mode || "").toUpperCase();
  if (!MODES.has(value)) throw new Error("unlockMode 必须是 A/B/C");
  return value;
}

function assertPassphrase(passphrase) {
  const value = String(passphrase || "");
  if (value.length < 10) throw new Error("口令至少 10 个字符");
  return value;
}

function assertSecretName(name) {
  const value = String(name || "").trim();
  if (!value || value.length > 80) throw new Error("名称必填，最多 80 字");
  return value;
}

function assertKind(kind) {
  const value = String(kind || "other");
  if (!KINDS.has(value)) throw new Error("kind 必须是 password/token/app_password/api_key/other");
  return value;
}

function assertMeta(meta) {
  if (meta == null) return "{}";
  if (typeof meta !== "object" || Array.isArray(meta)) throw new Error("meta 必须是对象");
  for (const [key, value] of Object.entries(meta)) {
    if (META_BAD.test(key) && value !== "" && value != null) {
      throw new Error("meta 不能保存密码/token 等敏感值：" + key);
    }
  }
  const text = JSON.stringify(meta);
  if (text.length > 4000) throw new Error("meta 最多 4000 字节");
  return text;
}

export function createVault({ db, log = () => {} }) {
  const state = {
    dek: null,
    lastActivity: 0,
    failures: 0,
    lockUntil: 0,
  };

  function initialized() {
    return Boolean(metaGet(db, "schema_version"));
  }

  function touch() {
    if (!state.dek) return;
    const idle = Number(metaGet(db, "idle_timeout_sec") || "900");
    if (idle > 0 && state.lastActivity && now() - state.lastActivity > idle * 1000) {
      lock();
      throw new Error("保险箱已因空闲锁定");
    }
    state.lastActivity = now();
  }

  function lock() {
    state.dek = null;
    state.lastActivity = 0;
  }

  function requireUnlocked() {
    touch();
    if (!state.dek) throw new Error("保险箱已锁定，请先解锁");
    return state.dek;
  }

  function wrapForPassphrase(passphrase, salt, dek) {
    const kek = deriveKey(passphrase, salt, parseKdf(metaGet(db, "kdf")));
    return seal(kek, dek, "vault:dek");
  }

  function checkPassphrase(passphrase) {
    const salt = metaGet(db, "salt");
    const wrapped = metaGet(db, "wrapped_dek");
    if (!salt || !wrapped) throw new Error("保险箱未初始化");
    try {
      const kek = deriveKey(String(passphrase || ""), salt, parseKdf(metaGet(db, "kdf")));
      open(kek, wrapped, "vault:dek");
      return true;
    } catch {
      throw new Error("口令错误");
    }
  }

  function tryAutoUnlock() {
    if (state.dek || !initialized()) return false;
    if (metaGet(db, "auto_unlock") !== "1") return false;
    const mode = metaGet(db, "unlock_mode") || "A";
    if (mode !== "B" && mode !== "C") return false;
    const wrapped = metaGet(db, "wrapped_dek_device");
    const deviceKey = readDeviceKey();
    if (!wrapped || !deviceKey) return false;
    try {
      state.dek = open(deviceKey, wrapped, "vault:device");
      state.lastActivity = now();
      metaSet(db, "last_unlock_at", String(now()));
      return true;
    } catch (error) {
      log("自动解锁失败", String(error && error.message));
      return false;
    }
  }

  function status() {
    if (initialized()) {
      tryAutoUnlock();
      if (state.dek) {
        try {
          touch();
        } catch {
          /* 空闲锁定由 touch 处理，status 只回报 */
        }
      }
    }
    const count = initialized()
      ? Number(db.prepare("SELECT COUNT(*) AS n FROM vault_secret WHERE deleted_at IS NULL").get()?.n || 0)
      : 0;
    return {
      initialized: initialized(),
      locked: !state.dek,
      unlockMode: metaGet(db, "unlock_mode") || "A",
      revealPolicy: metaGet(db, "reveal_policy") || "session",
      autoUnlock: metaGet(db, "auto_unlock") === "1",
      idleTimeoutSec: Number(metaGet(db, "idle_timeout_sec") || "900"),
      secretCount: count,
      lastUnlockAt: Number(metaGet(db, "last_unlock_at") || "0") || null,
    };
  }

  function setup(args = {}) {
    if (initialized()) throw new Error("保险箱已初始化");
    const passphrase = assertPassphrase(args.passphrase);
    const mode = validateMode(args.mode || "A");
    const salt = randomBytes(16);
    const dek = randomBytes(32);
    const kdf = { ...KDF_DEFAULT };
    const kek = deriveKey(passphrase, salt.toString("base64"), kdf);
    const wrapped = seal(kek, dek, "vault:dek");
    const ts = now();
    const deviceKey = mode === "A" ? null : randomBytes(32);
    const wrappedDevice = deviceKey ? seal(deviceKey, dek, "vault:device") : null;

    tx(db, () => {
      metaSet(db, "schema_version", "1");
      metaSet(db, "salt", salt.toString("base64"));
      metaSet(db, "kdf", JSON.stringify(kdf));
      metaSet(db, "wrapped_dek", wrapped);
      metaSet(db, "unlock_mode", mode);
      metaSet(db, "auto_unlock", mode === "A" ? "0" : "1");
      metaSet(db, "reveal_policy", mode === "B" ? "passphrase" : "session");
      metaSet(db, "idle_timeout_sec", "900");
      metaSet(db, "created_at", String(ts));
      metaSet(db, "last_unlock_at", String(ts));
      if (wrappedDevice) metaSet(db, "wrapped_dek_device", wrappedDevice);
    });
    if (deviceKey) writeDeviceKey(deviceKey);
    state.dek = dek;
    state.lastActivity = ts;
    return { ok: true, unlockMode: mode };
  }

  function unlock(args = {}) {
    if (!initialized()) throw new Error("保险箱未初始化");
    if (state.dek) {
      state.lastActivity = now();
      return { ok: true };
    }
    if (state.lockUntil > now()) {
      const left = Math.ceil((state.lockUntil - now()) / 1000);
      throw new Error("口令错误次数过多，请 " + left + " 秒后重试");
    }
    const passphrase = String(args.passphrase || "");
    const salt = metaGet(db, "salt");
    const wrapped = metaGet(db, "wrapped_dek");
    try {
      const kek = deriveKey(passphrase, salt, parseKdf(metaGet(db, "kdf")));
      state.dek = open(kek, wrapped, "vault:dek");
      state.failures = 0;
      state.lastActivity = now();
      metaSet(db, "last_unlock_at", String(now()));
      return { ok: true };
    } catch {
      state.failures += 1;
      if (state.failures >= 5) {
        state.failures = 0;
        state.lockUntil = now() + 5 * 60 * 1000;
      }
      throw new Error("口令错误");
    }
  }

  function listSecrets(args = {}) {
    const q = String(args.q || "").trim();
    const kind = String(args.kind || "").trim();
    const where = ["deleted_at IS NULL"];
    const params = [];
    if (q) {
      where.push("(name LIKE ? OR meta LIKE ?)");
      params.push("%" + q + "%", "%" + q + "%");
    }
    if (kind) {
      where.push("kind = ?");
      params.push(kind);
    }
    const rows = db
      .prepare("SELECT * FROM vault_secret WHERE " + where.join(" AND ") + " ORDER BY updated_at DESC")
      .all(...params);
    return {
      items: rows.map((row) => ({
        ...secretRow(row),
        meta: parseJson(row.meta, {}),
      })),
    };
  }

  function createSecret(args = {}) {
    const dek = requireUnlocked();
    const name = assertSecretName(args.name);
    const kind = assertKind(args.kind);
    const secret = String(args.secret ?? "");
    if (!secret) throw new Error("secret 不能为空");
    const meta = assertMeta(args.meta);
    const id = newId("sec");
    const ts = now();
    const ciphertext = seal(dek, secret, secretAad(id, name, kind));
    try {
      db.prepare(
        "INSERT INTO vault_secret(id, name, kind, meta, ciphertext, created_at, updated_at, rev) " +
          "VALUES(?, ?, ?, ?, ?, ?, ?, 1)",
      ).run(id, name, kind, meta, ciphertext, ts, ts);
    } catch (error) {
      const msg = String(error && error.message);
      if (msg.includes("UNIQUE")) throw new Error("已有同名 secret：" + name);
      throw error;
    }
    return { id, ok: true };
  }

  function updateSecret(args = {}) {
    const dek = requireUnlocked();
    const id = String(args.id || "");
    const row = db.prepare("SELECT * FROM vault_secret WHERE id = ? AND deleted_at IS NULL").get(id);
    if (!row) throw new Error("secret 不存在：" + id);
    const name = args.name == null ? row.name : assertSecretName(args.name);
    const kind = args.kind == null ? row.kind : assertKind(args.kind);
    const meta = args.meta == null ? row.meta : assertMeta(args.meta);
    let ciphertext = row.ciphertext;
    if (args.secret != null && String(args.secret) !== "") {
      ciphertext = seal(dek, String(args.secret), secretAad(id, name, kind));
    } else if (name !== row.name || kind !== row.kind) {
      const plain = open(dek, row.ciphertext, secretAad(id, row.name, row.kind));
      ciphertext = seal(dek, plain, secretAad(id, name, kind));
    }
    const ts = now();
    try {
      db.prepare(
        "UPDATE vault_secret SET name = ?, kind = ?, meta = ?, ciphertext = ?, updated_at = ?, rev = rev + 1 WHERE id = ?",
      ).run(name, kind, meta, ciphertext, ts, id);
    } catch (error) {
      const msg = String(error && error.message);
      if (msg.includes("UNIQUE")) throw new Error("已有同名 secret：" + name);
      throw error;
    }
    return { ok: true };
  }

  function deleteSecret(args = {}) {
    requireUnlocked();
    const id = String(args.id || "");
    const ts = now();
    const info = db.prepare(
      "UPDATE vault_secret SET deleted_at = ?, updated_at = ?, rev = rev + 1 WHERE id = ? AND deleted_at IS NULL",
    ).run(ts, ts, id);
    if (!info.changes) throw new Error("secret 不存在：" + id);
    return { ok: true };
  }

  function reveal(args = {}) {
    const dek = requireUnlocked();
    const id = String(args.id || "");
    const mode = metaGet(db, "unlock_mode") || "A";
    const policy = metaGet(db, "reveal_policy") || "session";
    if (mode === "B" || policy === "passphrase") {
      const passphrase = String(args.passphrase || "");
      if (!passphrase) throw new Error("当前模式查看凭据需要口令");
      checkPassphrase(passphrase);
    }
    const row = db.prepare("SELECT * FROM vault_secret WHERE id = ? AND deleted_at IS NULL").get(id);
    if (!row) throw new Error("secret 不存在：" + id);
    const secret = open(dek, row.ciphertext, secretAad(row.id, row.name, row.kind)).toString("utf8");
    db.prepare("UPDATE vault_secret SET last_used_at = ? WHERE id = ?").run(now(), id);
    return { secret, id: row.id, name: row.name, kind: row.kind };
  }

  function lease(args = {}) {
    const dek = requireUnlocked();
    const id = String(args.id || "");
    const ttl = Math.max(30, Math.min(300, Number(args.ttlSeconds) || 60));
    const row = db.prepare("SELECT * FROM vault_secret WHERE id = ? AND deleted_at IS NULL").get(id);
    if (!row) throw new Error("secret 不存在：" + id);
    const secret = open(dek, row.ciphertext, secretAad(row.id, row.name, row.kind)).toString("utf8");
    db.prepare("UPDATE vault_secret SET last_used_at = ? WHERE id = ?").run(now(), id);
    return { secret, name: row.name, kind: row.kind, expiresAt: now() + ttl * 1000, purpose: String(args.purpose || "") };
  }

  function changePassphrase(args = {}) {
    requireUnlocked();
    const oldPassphrase = String(args.oldPassphrase || "");
    checkPassphrase(oldPassphrase);
    const next = assertPassphrase(args.newPassphrase);
    const salt = randomBytes(16);
    const kek = deriveKey(next, salt.toString("base64"), KDF_DEFAULT);
    const wrapped = seal(kek, state.dek, "vault:dek");
    metaSet(db, "salt", salt.toString("base64"));
    metaSet(db, "kdf", JSON.stringify(KDF_DEFAULT));
    metaSet(db, "wrapped_dek", wrapped);
    return { ok: true };
  }

  function setUnlockMode(args = {}) {
    if (!initialized()) throw new Error("保险箱未初始化");
    const mode = validateMode(args.mode);
    const before = {
      unlock_mode: metaGet(db, "unlock_mode"),
      auto_unlock: metaGet(db, "auto_unlock"),
      reveal_policy: metaGet(db, "reveal_policy"),
      wrapped_dek_device: metaGet(db, "wrapped_dek_device"),
    };
    try {
      if (!state.dek) {
        if (!args.passphrase) throw new Error("保险箱已锁定，切换模式需要口令");
        unlock({ passphrase: args.passphrase });
      }
      if (mode === "A") {
        removeDeviceKey();
        metaDel(db, "wrapped_dek_device");
        metaSet(db, "unlock_mode", "A");
        metaSet(db, "auto_unlock", "0");
        metaSet(db, "reveal_policy", "session");
      } else {
        const deviceKey = readDeviceKey() || randomBytes(32);
        const wrapped = seal(deviceKey, state.dek, "vault:device");
        writeDeviceKey(deviceKey);
        metaSet(db, "wrapped_dek_device", wrapped);
        metaSet(db, "unlock_mode", mode);
        metaSet(db, "auto_unlock", "1");
        metaSet(db, "reveal_policy", mode === "B" ? "passphrase" : "session");
      }
      return { ok: true, unlockMode: mode };
    } catch (error) {
      for (const [key, value] of Object.entries(before)) {
        if (value == null) metaDel(db, key);
        else metaSet(db, key, value);
      }
      throw error;
    }
  }

  function rotateDeviceKey(args = {}) {
    if (!initialized()) throw new Error("保险箱未初始化");
    const mode = metaGet(db, "unlock_mode") || "A";
    if (mode === "A") throw new Error("A 模式没有 device key");
    if (!state.dek) throw new Error("保险箱已锁定");
    checkPassphrase(String(args.passphrase || ""));
    const deviceKey = randomBytes(32);
    const wrapped = seal(deviceKey, state.dek, "vault:device");
    writeDeviceKey(deviceKey);
    metaSet(db, "wrapped_dek_device", wrapped);
    return { ok: true };
  }

  function exportData() {
    return {
      formatVersion: 1,
      exportedAt: new Date(now()).toISOString(),
      secrets: [],
      note: "保险箱密文不进入备份；换机请重新录入凭据。",
    };
  }

  function importData() {
    return { ok: true, imported: 0, skipped: 0, failed: 0, message: "保险箱不导入密文" };
  }

  return {
    status,
    setup,
    unlock,
    lock,
    listSecrets,
    createSecret,
    updateSecret,
    deleteSecret,
    reveal,
    lease,
    changePassphrase,
    setUnlockMode,
    rotateDeviceKey,
    exportData,
    importData,
    initialized,
    metaAll: () => metaAll(db),
    mode: () => metaGet(db, "unlock_mode") || "A",
  };
}
