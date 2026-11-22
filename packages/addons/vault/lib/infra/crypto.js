/**
 * 保险箱密码学：scrypt 派生 KEK，AES-256-GCM 包裹 DEK / 加密 secret。
 * 密文格式与 sites 现有实现一致：v1:<b64 iv>:<b64 tag>:<b64 ct>。
 */
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

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

export function secretAad(id, name, kind) {
  return "vault:" + String(id) + ":" + String(name) + ":" + String(kind);
}

/**
 * 集合账号（vault_set.account）：0.5.0 起与凭据一样用 DEK 加密落库，
 * 云端与本地库都不再出现登录名/邮箱明文。
 * 空账号仍存空串——集合类型（账号集合 / 普通集合）靠它是否为空推导。
 * 前缀独立于 `v1:`，旧明文字段即便以 "v1:" 开头也不会被误判成密文。
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

export function deviceKeyPath() {
  return join(wbHome(), "vault-device.key");
}

export function readDeviceKey() {
  const path = deviceKeyPath();
  if (!existsSync(path)) return null;
  const buf = readFileSync(path);
  return buf.length === 32 ? buf : null;
}

export function writeDeviceKey(key) {
  const path = deviceKeyPath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, key, { mode: 0o600 });
  chmodSync(path, 0o600);
}

export function removeDeviceKey() {
  const path = deviceKeyPath();
  if (existsSync(path)) rmSync(path);
}
