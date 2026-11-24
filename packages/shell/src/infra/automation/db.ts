/**
 * 自动化域 SQLite 访问层：时钟、id、JSON、事务、行映射与本机 meta。
 *
 * 表结构由宿主 core schema（packages/core/src/schema.ts）提供，本模块**不建表**，
 * 只保留 setClock 让宿主把统一时钟注入进来（原插件用 bindClock(api.now)）。
 */

/** 当前时钟。默认系统时间，宿主可在启动时通过 setClock 换成自己的单调时钟。 */
let clock: () => number = () => Date.now();

/** 绑定宿主时钟。非法入参忽略，保持上一次的时钟。 */
export function setClock(fn: (() => number) | null | undefined): void {
  if (typeof fn === "function") clock = fn;
}

/** 兼容原插件命名：bindClock 与 setClock 等价。 */
export const bindClock = setClock;

/** 当前毫秒时间戳（经宿主时钟）。 */
export function now(): number {
  return Number(clock());
}

/** 生成带前缀的本地 id：prefix_<36 进制时间>_<8 位随机>。 */
export function newId(prefix: string): string {
  return prefix + "_" + now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
}

/** 宽松 JSON 解析：失败返回 fallback，不抛错。 */
export function parseJson<T = any>(raw: unknown, fallback: T): T {
  try {
    return JSON.parse(String(raw)) as T;
  } catch {
    return fallback;
  }
}

/** 手工事务：BEGIN / COMMIT / 失败 ROLLBACK；与源码一致，不使用 IMMEDIATE。 */
export function tx<T>(db: any, fn: () => T): T {
  db.exec("BEGIN");
  try {
    const out = fn();
    db.exec("COMMIT");
    return out;
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      /* ignore */
    }
    throw error;
  }
}

/** 自动化规则（automation_rule 的行映射，对外 camelCase）。 */
export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  execMode: "action" | "agent";
  agent: any;
  scheduleId: string;
  triggerType: string;
  triggerConfig: any;
  condition: any;
  actionName: string;
  actionArgs: any;
  nextRunAt: number;
  lastRunAt: number | null;
  lastStatus: string;
  runCount: number;
  errorCount: number;
  createdAt: number;
  updatedAt: number;
  rev: number;
}

/** 自动化运行记录（automation_run 的行映射，对外 camelCase）。 */
export interface AutomationRun {
  id: string;
  ruleId: string;
  trigger: string;
  status: string;
  startedAt: number;
  finishedAt: number | null;
  result: string;
  error: string;
}

/** automation_rule 行 → 规则对象。 */
export function ruleRow(row: any): AutomationRule {
  return {
    id: row.id,
    name: row.name,
    enabled: Boolean(row.enabled),
    execMode: row.exec_mode === "agent" ? "agent" : "action",
    agent: parseJson(row.agent_json, null),
    scheduleId: row.schedule_id || "",
    triggerType: row.trigger_type,
    triggerConfig: parseJson(row.trigger_config, {}),
    condition: parseJson(row.condition, null),
    actionName: row.action_name,
    actionArgs: parseJson(row.action_args, {}),
    nextRunAt: row.next_run_at || 0,
    lastRunAt: row.last_run_at || null,
    lastStatus: row.last_status,
    runCount: row.run_count || 0,
    errorCount: row.error_count || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    rev: row.rev,
  };
}

/** automation_run 行 → 运行记录对象。 */
export function runRow(row: any): AutomationRun {
  return {
    id: row.id,
    ruleId: row.rule_id,
    trigger: row.trigger,
    status: row.status,
    startedAt: row.started_at,
    finishedAt: row.finished_at || null,
    result: row.result || "",
    error: row.error || "",
  };
}

/** 读 automation_meta；不存在返回 null。 */
export function metaGet(db: any, key: string): string | null {
  const row = db.prepare("SELECT value FROM automation_meta WHERE key=?").get(key);
  return row ? row.value : null;
}

/** 写 automation_meta（upsert）。 */
export function metaSet(db: any, key: string, value: unknown): void {
  db.prepare(
    "INSERT INTO automation_meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
  ).run(String(key), String(value));
}
