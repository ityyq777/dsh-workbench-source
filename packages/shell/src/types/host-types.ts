import type { DatabaseSync } from "node:sqlite";
import type { DomainDef, DomainActionDef, DomainHookHandler } from "@wb/sdk";
import type { CloudConfig } from "../infra/cloud-config.js";
/** 同步凭据：共享云端来自登录令牌，私人云端由访问密钥合成。 */
export interface CloudCreds {
  accessToken: string;
  refreshToken: string;
  userId: string;
  deviceId: string;
}
export interface WbState {
  db: DatabaseSync;
  creds: CloudCreds | null;
  cloudUrl: string;
  /** 当前选择的云端类型与连接配置。 */
  cloudConfig: CloudConfig;
}

export interface RegisteredDomain {
  def: DomainDef;
  /** 宿主解析后的首页栏目 id（未声明或未知 id 已归入兜底栏目） */
  category: string;
  actions: Map<string, DomainActionDef>;
  hooks: Map<string, DomainHookHandler>;
  error: string | null;
  dispose: (() => void) | null;
}
export type Subscriber = (event: string, data: unknown) => void;
