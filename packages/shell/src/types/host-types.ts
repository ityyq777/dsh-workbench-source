import type { DatabaseSync } from "node:sqlite";
import type { DomainDef, DomainActionDef, DomainHookHandler } from "@wb/sdk";
export interface WbState {
  db: DatabaseSync;
  creds: { accessToken: string; refreshToken: string; userId: string; deviceId: string } | null;
  cloudUrl: string;
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
