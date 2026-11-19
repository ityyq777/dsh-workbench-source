/**
 * action 的「agent 可调用」开关：本机覆盖 + 声明默认值。
 *
 * 三条硬约束：
 * 1. 只存在本机宿主库的 meta 表（沿用 config.<domain>.<id> 覆盖项范式），
 *    不建业务表、不进备份、不参与云同步 —— 换一台电脑就是默认值；
 * 2. 默认值来自 action 定义：没写 agentEnabled 视为允许，写 false 视为默认关闭；
 * 3. 只有界面（origin=ui）能改，agent 既不能改也不可能给自己解锁。
 */
import type { DatabaseSync } from "node:sqlite";
import type { DomainActionDef } from "@wb/sdk";

/** meta 键前缀：一个 action 一行，值只允许 "1"（开）/ "0"（关）。 */
export const AGENT_ACCESS_KEY_PREFIX = "config.wb-shell.actionAgent.";

/**
 * 永久锁死的 action：无论 meta 怎么写都不允许 agent 调用。
 * 开关自身必须在里面，否则「先解锁开关、再解锁一切」就绕过了整套限制。
 */
export const AGENT_LOCKED_ACTIONS = new Set<string>(["actions.setAgentAccess"]);

export function agentAccessKey(action: string): string {
  return AGENT_ACCESS_KEY_PREFIX + action;
}

const ON_VALUES = new Set(["1", "true", "on", "yes"]);
const OFF_VALUES = new Set(["0", "false", "off", "no"]);

/**
 * 读本机覆盖。返回 failed=true 表示「读不到/值无效」，调用方必须按关闭处理（fail closed）：
 * 数据库故障时宁可 agent 调不到，也不能把用户关掉的 action 静默放行。
 * db 为空只出现在纯 schema 测试里，此时按「没有覆盖」回默认值。
 */
function readOverride(db: DatabaseSync | null | undefined, action: string): { value: boolean | null; failed: boolean } {
  if (!db) return { value: null, failed: false };
  try {
    const row = db.prepare("SELECT v FROM meta WHERE k = ?").get(agentAccessKey(action)) as { v?: string } | undefined;
    const raw = row && row.v !== undefined && row.v !== null ? String(row.v).trim().toLowerCase() : "";
    if (raw === "") return { value: null, failed: false };
    if (ON_VALUES.has(raw)) return { value: true, failed: false };
    if (OFF_VALUES.has(raw)) return { value: false, failed: false };
    return { value: null, failed: true };
  } catch {
    return { value: null, failed: true };
  }
}

function writeMeta(db: DatabaseSync, key: string, value: string | null): void {
  if (value === null) {
    db.prepare("DELETE FROM meta WHERE k = ?").run(key);
    return;
  }
  db.prepare("INSERT INTO meta(k, v) VALUES(?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").run(key, value);
}

export interface AgentAccessResult {
  /** 生效值：true 表示 agent 可以调用 */
  agentEnabled: boolean;
  /** 值的来源：meta=本机覆盖，declared=action 定义的默认值 */
  source: "meta" | "declared";
}

export function createAgentAccess(db: DatabaseSync) {
  /**
   * 硬锁：安全约束，agent 永远不可调用、界面也不能打开。
   * 两个来源：宿主内置的永久锁定清单，或 action 自己声明 agentLocked:true。
   */
  function locked(action: string, def?: DomainActionDef | null): boolean {
    return AGENT_LOCKED_ACTIONS.has(action) || Boolean(def && def.agentLocked === true);
  }

  /** action 定义的默认值：没声明 agentEnabled 就是允许 agent 调用；硬锁恒为关闭。 */
  function declaredValue(action: string, def?: DomainActionDef | null): boolean {
    if (locked(action, def)) return false;
    return !def || def.agentEnabled !== false;
  }

  /** 本机覆盖；没写过返回 null，读失败/值无效返回 failed（调用方按关闭处理）。 */
  function override(action: string): { value: boolean | null; failed: boolean } {
    return readOverride(db, action);
  }

  /** 生效值：硬锁恒为 false；读不到覆盖时 fail closed；最后才是声明默认值。 */
  function effective(action: string, def?: DomainActionDef | null): boolean {
    if (locked(action, def)) return false;
    const own = override(action);
    if (own.failed) return false;
    return own.value === null ? declaredValue(action, def) : own.value;
  }

  /** 改开关：硬锁直接拒绝；与声明默认值相同时删掉覆盖行（不留脏 meta），否则写 "1"/"0"。 */
  function set(action: string, def: DomainActionDef | null | undefined, agentEnabled: boolean): AgentAccessResult {
    if (locked(action, def)) {
      throw new Error("该 action 的 agent 调用被永久禁止（安全约束），界面也不能解锁：" + action);
    }
    const base = declaredValue(action, def);
    if (agentEnabled === base) {
      writeMeta(db, agentAccessKey(action), null);
      return { agentEnabled: base, source: "declared" };
    }
    writeMeta(db, agentAccessKey(action), agentEnabled ? "1" : "0");
    return { agentEnabled, source: "meta" };
  }

  return { locked, declaredValue, override, effective, set };
}
