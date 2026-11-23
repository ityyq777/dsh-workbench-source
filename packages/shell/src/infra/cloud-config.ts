/**
 * 云端类型配置：私人云端与共享云端的共用外观。
 *
 * 配置写在云端配置文件中（0600），只记录“连哪一种云、连到哪里、用什么凭据”；
 * 共享云端的账号令牌仍单独保存在 cloud-creds.json，私人云端不落账号令牌，
 * 而是把访问密钥合成为同步凭据。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import type { CloudCreds } from "../types/host-types.js";

export type CloudMode = "none" | "private" | "shared";

export interface PrivateCloud {
  /** 服务端地址，已规范化为 origin（可带路径前缀）。 */
  url: string;
  /** 访问密钥，至少 16 位。 */
  secret: string;
  /** 本机在这台私人云端上的设备标识。 */
  deviceId: string;
  deviceName: string;
}

export interface CloudConfig {
  mode: CloudMode;
  /** 共享云端地址，仅 mode === "shared" 时使用。 */
  sharedUrl: string;
  private: PrivateCloud;
}

/** 私人云端只有一个固定用户。 */
export const PRIVATE_USER_ID = "private-owner";
/** 访问密钥最小长度，与服务端校验保持一致。 */
export const MIN_SECRET_LENGTH = 16;
export const CLOUD_CONFIG_FILE = "cloud-config.json";

const MODES: CloudMode[] = ["none", "private", "shared"];

export function isCloudMode(value: unknown): value is CloudMode {
  return typeof value === "string" && (MODES as string[]).includes(value);
}

/** 规范化服务端地址：补协议、去掉结尾斜杠、只允许 http/https。 */
export function normalizeUrl(raw: unknown): string {
  const text = String(raw ?? "").trim();
  if (!text) throw new Error("服务端地址不能为空");
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : "http://" + text;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    throw new Error("服务端地址不合法：" + text);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("服务端地址只支持 http:// 与 https://");
  }
  return url.origin + url.pathname.replace(/\/+$/, "");
}

function newDeviceId(): string {
  return "shell-" + randomUUID().replace(/-/g, "").slice(0, 10);
}

function readPrivate(input: Partial<PrivateCloud> | undefined, previous: PrivateCloud): PrivateCloud {
  const url = input?.url !== undefined ? normalizeUrl(input.url) : previous.url;
  let secret = previous.secret;
  // 前端只在用户改动密钥时回传；空串表示沿用原值。
  if (typeof input?.secret === "string" && input.secret !== "") secret = input.secret.trim();
  const deviceId =
    typeof input?.deviceId === "string" && input.deviceId.trim() ? input.deviceId.trim() : previous.deviceId || newDeviceId();
  const deviceName =
    typeof input?.deviceName === "string" && input.deviceName.trim() ? input.deviceName.trim() : previous.deviceName;
  return { url, secret, deviceId, deviceName };
}

function emptyConfig(sharedUrl: string): CloudConfig {
  return {
    mode: "none",
    sharedUrl,
    private: { url: "", secret: "", deviceId: newDeviceId(), deviceName: "DSH Web" },
  };
}

/**
 * 读取云端配置。旧版本没有该文件：只要登录过共享云端就按 shared 迁移，
 * 其余情况默认仅本机使用。配置文件损坏时也回到仅本机，以免误连云端。
 */
export function loadCloudConfig(home: string, sharedUrl: string, legacyCreds: CloudCreds | null): CloudConfig {
  const fallback = emptyConfig(sharedUrl);
  const file = join(home, CLOUD_CONFIG_FILE);
  if (!existsSync(file)) {
    return { ...fallback, mode: legacyCreds ? "shared" : fallback.mode };
  }
  let raw: Partial<CloudConfig> = {};
  try {
    raw = JSON.parse(readFileSync(file, "utf8")) || {};
  } catch {
    raw = {};
  }
  const mode = isCloudMode(raw.mode) ? raw.mode : fallback.mode;
  let configSharedUrl = fallback.sharedUrl;
  try {
    if (raw.sharedUrl) configSharedUrl = normalizeUrl(raw.sharedUrl);
  } catch {
    configSharedUrl = fallback.sharedUrl;
  }
  let privateSettings = fallback.private;
  try {
    privateSettings = readPrivate(raw.private, fallback.private);
  } catch {
    privateSettings = fallback.private;
  }
  return { mode, sharedUrl: configSharedUrl, private: privateSettings };
}

export function saveCloudConfig(home: string, config: CloudConfig): void {
  mkdirSync(home, { recursive: true });
  writeFileSync(join(home, CLOUD_CONFIG_FILE), JSON.stringify(config, null, 2), { mode: 0o600 });
}

/** 指纹只覆盖“换了就要重同步”的字段。 */
export function cloudConfigFingerprint(config: CloudConfig): string {
  return [config.mode, config.sharedUrl, config.private.url, config.private.secret, config.private.deviceId].join("\n");
}

/** 当前配置对应的同步凭据；共享云端仍读 cloud-creds.json。 */
export function credsForConfig(config: CloudConfig, sharedCreds: CloudCreds | null): CloudCreds | null {
  if (config.mode === "private") {
    if (config.private.secret.length < MIN_SECRET_LENGTH) return null;
    return {
      accessToken: config.private.secret,
      refreshToken: "",
      userId: PRIVATE_USER_ID,
      deviceId: config.private.deviceId,
    };
  }
  if (config.mode === "shared") return sharedCreds;
  return null;
}

export function cloudUrlForConfig(config: CloudConfig): string {
  return config.mode === "private" ? config.private.url : config.sharedUrl;
}

/** 返回给界面的配置：密钥只回传“是否已设置”，绝不回传明文。 */
export function publicCloudConfig(config: CloudConfig): Record<string, unknown> {
  return {
    mode: config.mode,
    shared_url: config.sharedUrl,
    private: {
      url: config.private.url,
      device_id: config.private.deviceId,
      device_name: config.private.deviceName,
      has_secret: config.private.secret.length >= MIN_SECRET_LENGTH,
    },
  };
}

/**
 * 校验界面提交的配置并合并出新的完整配置。
 * 非法输入抛 Error，由调用方转成 400。
 */
export function applyCloudConfigPatch(base: CloudConfig, body: any): CloudConfig {
  const mode = body?.mode === undefined ? base.mode : body.mode;
  if (!isCloudMode(mode)) throw new Error("云端类型只能是 none/private/shared");

  let sharedUrl = base.sharedUrl;
  if (body?.sharedUrl !== undefined) sharedUrl = normalizeUrl(body.sharedUrl);

  const privateSettings = readPrivate(body?.private, base.private);
  if (mode === "private") {
    if (!privateSettings.url) throw new Error("私人云端必须填写服务端地址");
    if (privateSettings.secret.length < MIN_SECRET_LENGTH) {
      throw new Error("访问密钥至少 " + MIN_SECRET_LENGTH + " 位");
    }
  }
  return { mode, sharedUrl, private: privateSettings };
}

/**
 * 云端目标变化后清空同步进度：账号/设备/密钥不同，旧游标与冲突记录不再有意义。
 * 只删同步元数据，不动业务数据。
 */
export function resetCloudSync(db: DatabaseSync): void {
  db.exec(
    "DELETE FROM sync_state;" +
      "DELETE FROM conflict_shadow;" +
      "DELETE FROM sync_dead_letter;",
  );
}
