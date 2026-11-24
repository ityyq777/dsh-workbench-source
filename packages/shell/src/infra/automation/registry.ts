/**
 * 内置自动化规则的内存注册表。
 *
 * 内置规则的定义来自子插件代码（DomainDef.automations），不是用户数据，
 * 因此**不落库、不参与云同步**：注册时写进这张按域组织的 Map，进程重启后
 * 由各域重新注册重建。运行记录（host_automation_run）仍然落库，rule_id 用合成 id
 * `auto:{domainId}:{key}`。
 *
 * 这里只做内存里的数据与调度时间，不认识 SQL、不写 meta：
 *  - 声明校验、用户覆盖（启停/参数）的持久化在 builtin.ts；
 *  - 到点执行在 engine.ts，执行器通过 patchRuntime 回写最近状态与下次时间。
 */

import type { AutomationRule } from "./db.js";
import { nextAt } from "./rule.js";

/** 一条声明在内存里的定义部分（不含用户覆盖与运行状态）。 */
export interface BuiltinDeclRuntime {
  key: string;
  title: string;
  description: string;
  triggerType: string;
  triggerConfig: any;
  actionName: string;
  actionArgs: Record<string, unknown>;
  condition: unknown;
  defaultEnabled: boolean;
  editableArgs: boolean;
}

interface DomainEntry {
  domainId: string;
  version: string;
  /** key → 声明定义；顺序即插件声明顺序。 */
  decls: Map<string, BuiltinDeclRuntime>;
  /** 因声明消失被停用的 key → 原本的启用状态（声明回来时恢复）。 */
  paused: Record<string, boolean>;
  /** 域已卸载：规则保留在内存里（页面标「插件已卸载」），但不再调度。 */
  uninstalled: boolean;
}

/** 域注册表：domainId → 该域的声明与状态。 */
const domains = new Map<string, DomainEntry>();

/** 规则表：合成 id → 规则（含用户覆盖后的启用状态与运行状态）。 */
const rules = new Map<string, AutomationRule>();

/** 合成 id：auto:{domainId}:{key}。 */
export function builtinRuleId(domainId: string, key: string): string {
  return "auto:" + domainId + ":" + key;
}

/** 内置规则的 id 是否属于本注册表。 */
export function isBuiltinId(id: unknown): boolean {
  return String(id || "").startsWith("auto:");
}

/** 某条声明当前的规则对象（没有返回 null）。 */
export function getRule(id: unknown): AutomationRule | null {
  const rule = rules.get(String(id || ""));
  return rule ? Object.assign({}, rule) : null;
}

/** 全部内置规则（拷贝，调用方可自由排序）。 */
export function listRules(): AutomationRule[] {
  return [...rules.values()].map((rule) => Object.assign({}, rule));
}

/** 某域的内置规则条数（能力目录展示用）。 */
export function countRules(domainId: string): number {
  let n = 0;
  for (const rule of rules.values()) if (rule.ownerDomain === domainId) n += 1;
  return n;
}

/** 某域是否已卸载（页面状态判断用）。 */
export function isUninstalled(domainId: string): boolean {
  const entry = domains.get(String(domainId || ""));
  return Boolean(entry && entry.uninstalled);
}

/** 某域当前登记的 key 清单。 */
export function declaredKeys(domainId: string): string[] {
  const entry = domains.get(String(domainId || ""));
  return entry ? [...entry.decls.keys()] : [];
}

/** 某域声明的插件版本（用于提示「内置规则已更新」）。 */
export function declaredVersion(domainId: string): string {
  const entry = domains.get(String(domainId || ""));
  return entry ? entry.version : "";
}

/** 某条声明的 editableArgs（用户能不能改参数）。 */
export function editableArgsOf(domainId: string, key: string): boolean {
  const entry = domains.get(String(domainId || ""));
  const decl = entry && entry.decls.get(String(key || ""));
  return Boolean(decl && decl.editableArgs);
}

/** 注册（或热重载）一个域的全部内置规则；幂等，重复注册只刷新定义。 */
export function registerDomain(input: {
  domainId: string;
  version: string;
  decls: BuiltinDeclRuntime[];
  /** 用户覆盖：enabled / args（来自本机偏好），有则以覆盖为准。 */
  overrides?: Record<string, { enabled?: boolean; args?: Record<string, unknown> }>;
  now: number;
}): { registered: string[]; paused: string[] } {
  const domainId = String(input.domainId || "");
  const previous = domains.get(domainId);
  const entry: DomainEntry = {
    domainId,
    version: String(input.version || ""),
    decls: new Map(),
    paused: previous ? Object.assign({}, previous.paused) : {},
    uninstalled: false,
  };
  const overrides = input.overrides || {};
  const registered: string[] = [];
  const paused: string[] = [];
  const seen = new Set<string>();

  for (const decl of input.decls) {
    entry.decls.set(decl.key, decl);
    seen.add(decl.key);
    const id = builtinRuleId(domainId, decl.key);
    const existing = rules.get(id);
    const override = overrides[decl.key] || null;
    // 启用状态优先级：用户覆盖 > 声明消失前的暂停状态 > 已有状态 > 默认值。
    let enabled: boolean;
    if (override && override.enabled !== undefined) enabled = Boolean(override.enabled);
    else if (Object.prototype.hasOwnProperty.call(entry.paused, decl.key)) enabled = Boolean(entry.paused[decl.key]);
    else if (existing) enabled = existing.enabled;
    else enabled = decl.defaultEnabled;
    const actionArgs = override && override.args ? override.args : decl.actionArgs;
    const createdAt = existing ? existing.createdAt : input.now;
    rules.set(id, {
      id,
      name: decl.title,
      enabled,
      execMode: "action",
      agent: null,
      scheduleId: "",
      triggerType: decl.triggerType,
      triggerConfig: decl.triggerConfig,
      condition: decl.condition,
      actionName: decl.actionName,
      actionArgs,
      // 新声明或上次算过的时间已过去时，按触发器重算一次下次时间。
      nextRunAt: enabled
        ? Number(existing && existing.nextRunAt) || Number(nextAt(decl.triggerType, decl.triggerConfig, input.now)) || 0
        : 0,
      lastRunAt: existing ? existing.lastRunAt : null,
      lastStatus: existing ? existing.lastStatus : "",
      runCount: existing ? existing.runCount : 0,
      errorCount: existing ? existing.errorCount : 0,
      createdAt,
      updatedAt: input.now,
      rev: existing ? existing.rev + 1 : 1,
      origin: "plugin",
      ownerDomain: domainId,
      ruleKey: decl.key,
      originVersion: entry.version,
    });
    registered.push(decl.key);
  }

  // 声明消失：停用并记住原状态，不删（运行记录还要能追溯到规则名）。
  for (const rule of rules.values()) {
    if (rule.ownerDomain !== domainId || seen.has(rule.ruleKey)) continue;
    paused.push(rule.ruleKey);
    if (!Object.prototype.hasOwnProperty.call(entry.paused, rule.ruleKey)) entry.paused[rule.ruleKey] = rule.enabled;
    rule.enabled = false;
    rule.nextRunAt = 0;
    rule.updatedAt = input.now;
  }

  domains.set(domainId, entry);
  return { registered, paused };
}

/** 域卸载：停调度并标「插件已卸载」，但保留规则与运行计数（重装后接回）。 */
export function unregisterDomain(domainId: string): void {
  const entry = domains.get(String(domainId || ""));
  if (entry) entry.uninstalled = true;
  for (const rule of rules.values()) {
    if (rule.ownerDomain !== domainId) continue;
    rule.nextRunAt = 0;
  }
}

/** 某域是否允许调度（未卸载、且 key 仍在声明里）。 */
export function schedulable(rule: AutomationRule): boolean {
  const entry = domains.get(rule.ownerDomain);
  if (!entry || entry.uninstalled) return false;
  return entry.decls.has(rule.ruleKey);
}

/** 到点的内置规则（按 next_run_at 升序）。 */
export function dueRules(at: number, limit: number): AutomationRule[] {
  const out: AutomationRule[] = [];
  for (const rule of rules.values()) {
    if (!rule.enabled || !rule.nextRunAt || rule.nextRunAt > at) continue;
    out.push(rule);
  }
  out.sort((a, b) => a.nextRunAt - b.nextRunAt || String(a.id).localeCompare(String(b.id)));
  return out.slice(0, Math.max(0, limit));
}

/** 事件触发的内置规则。 */
export function eventRules(domainId: string, event: string): AutomationRule[] {
  const out: AutomationRule[] = [];
  for (const rule of rules.values()) {
    if (!rule.enabled || rule.triggerType !== "event") continue;
    const config = rule.triggerConfig || {};
    if (config.domainId !== domainId || config.event !== event) continue;
    out.push(rule);
  }
  return out;
}

/** 回写运行状态与下次时间（执行器调用；不涉及持久化）。 */
export function patchRuntime(
  id: unknown,
  patch: Partial<Pick<AutomationRule, "lastRunAt" | "lastStatus" | "runCount" | "errorCount" | "nextRunAt">> & {
    runCountDelta?: number;
    errorCountDelta?: number;
  },
): void {
  const rule = rules.get(String(id || ""));
  if (!rule) return;
  if (patch.lastRunAt !== undefined) rule.lastRunAt = patch.lastRunAt;
  if (patch.lastStatus !== undefined) rule.lastStatus = patch.lastStatus;
  if (patch.nextRunAt !== undefined) rule.nextRunAt = Number(patch.nextRunAt) || 0;
  if (patch.runCount !== undefined) rule.runCount = patch.runCount;
  if (patch.errorCount !== undefined) rule.errorCount = patch.errorCount;
  if (patch.runCountDelta) rule.runCount += patch.runCountDelta;
  if (patch.errorCountDelta) rule.errorCount += patch.errorCountDelta;
}

/** 用户改启停：只改内存状态，持久化由 builtin.ts 负责。 */
export function setEnabled(id: unknown, enabled: boolean): void {
  const rule = rules.get(String(id || ""));
  if (rule) rule.enabled = Boolean(enabled);
}

/** 用户改参数（仅 editableArgs=true 的规则允许，校验在 builtin.ts/engine）。 */
export function setArgs(id: unknown, args: Record<string, unknown>, edited: boolean): void {
  const rule = rules.get(String(id || ""));
  if (!rule) return;
  rule.actionArgs = args;
  if (edited) rule.rev += 1;
}

/** 把用户覆盖套到已注册的规则上（导入备份后即时生效）。 */
export function applyOverride(
  domainId: string,
  key: string,
  override: { enabled?: boolean; args?: Record<string, unknown> },
): boolean {
  const rule = rules.get(builtinRuleId(domainId, key));
  if (!rule) return false;
  if (override.enabled !== undefined) rule.enabled = Boolean(override.enabled);
  if (override.args) rule.actionArgs = override.args;
  return true;
}

/** 仅供测试与诊断：清空内存注册表（进程内重置）。 */
export function reset(): void {
  domains.clear();
  rules.clear();
}
