import type { DatabaseSync } from "node:sqlite";
import type { DomainDef, DomainActionDef } from "@wb/sdk";
export interface WbState {
  db: DatabaseSync;
  creds: { accessToken: string; refreshToken: string; userId: string; deviceId: string } | null;
  cloudUrl: string;
}

export interface RegisteredDomain {
  def: DomainDef;
  actions: Map<string, DomainActionDef>;
  error: string | null;
  dispose: (() => void) | null;
}
export type Subscriber = (event: string, data: unknown) => void;
