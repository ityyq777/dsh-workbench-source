/**
 * 保险箱密码学：scrypt 派生 KEK，AES-256-GCM 包裹 DEK / 加密 secret。
 * 密文格式与 sites 现有实现一致：v1:<b64 iv>:<b64 tag>:<b64 ct>。
 */
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scryptSync,
} from "node:crypto";
import { existsSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const KDF_DEFAULT = { N: 32768, r: 8, p: 1, keylen: 32 };

export function deriveKey(passphrase, salt, kdf = KDF_DEFAULT) {
  const N = Number(kdf.N) || KDF_DEFAULT.N;
  const r = Number(kdf.r) || KDF_DEFAULT.r;
  const p = Number(kdf.p) || KDF_DEFAULT.p;
  return scryptSync(String(passphrase), Buffer.from(salt, "base64"), Number(kdf.keylen) || 32, {
    N,
    r,
    p,
    maxmem: 128 * 1024 * 1024,
  });
}

export function seal(key, plaintext, aad = "") {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  if (aad) cipher.setAAD(Buffer.from(aad, "utf8"));
  const ct = Buffer.concat([cipher.update(Buffer.from(plaintext)), cipher.final()]);
  const tag = cipher.getAuthTag();
  return "v1:" + iv.toString("base64") + ":" + tag.toString("base64") + ":" + ct.toString("base64");
}

export function open(key, payload, aad = "") {
  const parts = String(payload || "").split(":");
  if (parts.length !== 4 || parts[0] !== "v1") throw new Error("密文格式不支持");
  const iv = Buffer.from(parts[1], "base64");
  const tag = Buffer.from(parts[2], "base64");
  const ct = Buffer.from(parts[3], "base64");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  if (aad) decipher.setAAD(Buffer.from(aad, "utf8"));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]);
}

/**
 * 凭据密文的 AAD：只绑 id 与名称。
 * 0.6.0 起类型不再是单值，也不参与 AAD——改类型只动 vault_secret_kind，不重加密；
 * 而改名称仍会重加密，因为 AAD 里有 name。
 */
export function secretAad(id, name) {
  return "vault:" + String(id) + ":" + String(name);
}

/** 0.5.x 及以前的 AAD（含单值 kind），只在 5 → 6 迁移里用来解开旧密文。 */
export function legacySecretAad(id, name, kind) {
  return "vault:" + String(id) + ":" + String(name) + ":" + String(kind);
}

/**
 * 集合账号密文（vault_set.account，0.5.0 引入，0.6.0 起下线）：
 * 6.0 的迁移要把存量账号转成 kind=account 的凭据，这里只保留解旧值的能力。
 */
export const ACCOUNT_PREFIX = "va1:";

export function setAccountAad(setId) {
  return "vault:set:account:" + String(setId);
}

export function sealAccount(dek, plaintext, setId) {
  return ACCOUNT_PREFIX + seal(dek, plaintext, setAccountAad(setId));
}

export function openAccount(dek, payload, setId) {
  const raw = String(payload || "");
  if (!raw.startsWith(ACCOUNT_PREFIX)) throw new Error("账号密文格式不支持");
  return open(dek, raw.slice(ACCOUNT_PREFIX.length), setAccountAad(setId));
}

export function isSealedAccount(value) {
  return String(value || "").startsWith(ACCOUNT_PREFIX);
}

export function wbHome() {
  return process.env.WB_HOME || join(homedir(), ".dsh", "workbench");
}

/**
 * 主口令一致性指纹：由 KEK 派生的 8 位十六进制，只用来核对两台设备是不是同一个主口令。
 * 不含口令本身，也不能反推 KEK 或 DEK；换了口令指纹自然变化。
 */
export function passphraseFingerprint(kek) {
  return createHash("sha256").update(kek).update("vault:passphrase-fingerprint").digest("hex").slice(0, 8);
}

/**
 * 0.6.x 及更早版本会在本机落一把 device key（$WB_HOME/vault-device.key）。
 * 0.7.0 起设备 key 下线，旧文件留着等于多一份无用密钥，启动时清掉。
 */
export function removeLegacyDeviceKey() {
  const path = join(wbHome(), "vault-device.key");
  if (!existsSync(path)) return false;
  rmSync(path, { force: true });
  return true;
}
