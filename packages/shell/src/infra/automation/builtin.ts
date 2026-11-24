/**
 * 内置自动化规则：声明校验、用户覆盖持久化与来源状态。
 *
 * 规则定义**只活在内存**（registry.ts），不写 automation_rule、不参与云同步；
 * 用户对内置规则的启停与参数覆盖属于「本机偏好」，只写 automation_meta
 * （宿主域的 sync.tables 已把它排除在同步之外）。
 *
 * 三条红线：
 * 1. 内置规则只允许调用**声明方本域**的 action；跨域声明在注册阶段直接报错、零写入。
 *    理由：内置规则可豁免用户白名单，跨域就等于任何插件都能点燃别的插件。
 * 2. trigger.kind=event 的事件类型必须已在 DomainDef.events.subscriptions 声明，不新开口子。
 * 3. 内置规则的 trigger / action / condition 由代码决定，用户只能启停（editableArgs 时还能改参数）。
 */

import { metaGet, metaSet, now as dbNow, parseJson, type AutomationRule } from "./db.js";
import { bad, normalizeCondition, normalizeTrigger, plainObject } from "./rule.js";
import { validActionName } from "./whitelist.js";
import * as registry from "./registry.js";

export { builtinRuleId, isBuiltinId } from "./registry.js";

/** 声明方的本域前缀：wb-addon-mail → mail.（同时接受带 wb-addon- 的完整前缀）。 */
function ownDomainPrefixes(domainId: string): string[] {
  const short = String(domainId || "").replace(/^wb-addon-/, "");
  const out = [short + "."];
  if (domainId && domainId !== short) out.push(String(domainId) + ".");
  return out;
}

/** action 是否属于该域（内置规则的唯一授权边界）。 */
export function actionBelongsTo(domainId: string, action: string): boolean {
  const name = String(action || "");
  return ownDomainPrefixes(domainId).some((prefix) => name.startsWith(prefix) && name.length > prefix.length);
}

const KEY_RE = /^[a-z][a-z0-9_-]{0,40}$/i;

/** 单条声明的规范化结果（内存定义，与 registry.BuiltinDeclRuntime 同形）。 */
type NormalizedDecl = registry.BuiltinDeclRuntime;

/**
 * 校验并规范化一条声明；任何不合规都抛错（调用方决定是否整域跳过）。
 * subscriptions 为该域已声明监听的类型清单，event 触发必须落在里面。
 */
function normalizeDecl(raw: any, domainId: string, subs: string[]): NormalizedDecl {
  if (!plainObject(raw)) throw bad("内置自动化声明必须是对象");
  const key = String(raw.key || "").trim();
  if (!KEY_RE.test(key)) throw bad("内置规则 key 不合法（小写字母开头，允许数字/_/-，≤41 字）：" + key);
  const title = String(raw.title || "").trim().slice(0, 120);
  if (!title) throw bad("内置规则缺少 title：" + key);
  const triggerInput = plainObject(raw.trigger) ? raw.trigger : {};
  const kind = String(triggerInput.kind || "");
  if (kind !== "interval" && kind !== "dailyAt" && kind !== "event") {
    throw bad("内置规则 trigger.kind 只支持 interval / dailyAt / event：" + key);
  }
  let triggerType: string;
  let triggerConfig: any;
  if (kind === "event") {
    const event = String(triggerInput.event || "").trim();
    if (!event) throw bad("内置规则事件触发需要 trigger.event：" + key);
    if (subs.indexOf(event) < 0) {
      throw bad("内置规则事件未在 DomainDef.events.subscriptions 声明：" + event + "（" + key + "）");
    }
    triggerType = "event";
    triggerConfig = { kind: "event", domainId, event };
  } else {
    const normalized = normalizeTrigger({
      triggerType: "schedule",
      triggerConfig:
        kind === "interval"
          ? { kind: "interval", everyMinutes: triggerInput.everyMinutes }
          : { kind: "dailyAt", time: triggerInput.time, tz: triggerInput.tz, weekdays: triggerInput.weekdays },
    });
    triggerType = normalized.triggerType;
    triggerConfig = normalized.config;
  }
  const actionInput = plainObject(raw.action) ? raw.action : {};
  const actionName = String(actionInput.name || "").trim();
  if (!validActionName(actionName)) throw bad("内置规则 action.name 不合法：" + key);
  if (!actionBelongsTo(domainId, actionName)) {
    throw bad(
      "内置规则只能调用声明方本域 action：规则 " +
        key +
        " 声明了 " +
        actionName +
        "，但它的域是 " +
        domainId +
        "（跨域调用会绕过用户白名单，已拒绝）",
    );
  }
  // 内置规则由插件自己声明，等价于插件调用自己，因此豁免白名单与硬底线；
  // 但仍然校验参数结构与体积，避免把脏数据塞进内存。
  const actionArgs = actionInput.args == null ? {} : actionInput.args;
  if (!plainObject(actionArgs)) throw bad("内置规则 action.args 必须是对象：" + key);
  if (JSON.stringify(actionArgs).length > 20000) throw bad("内置规则 action.args 超过 20KB：" + key);
  const condition = normalizeCondition(raw.condition);
  return {
    key,
    title,
    description: String(raw.description || "").slice(0, 500),
    triggerType,
    triggerConfig,
    actionName,
    actionArgs: actionArgs as Record<string, unknown>,
    condition,
    defaultEnabled: raw.defaultEnabled !== false,
    editableArgs: raw.editableArgs === true,
  };
}

/** 一个域的用户覆盖：key → { enabled?, args? }。 */
export type BuiltinOverrides = Record<string, { enabled?: boolean; args?: Record<string, unknown> }>;

const OVERRIDE_PREFIX = "builtin-overrides:";
/** 老版本的 meta 键：内存化之后不再使用，迁移时清掉。 */
const LEGACY_META_PREFIX = ["builtin:", "builtin-edited:", "builtin-pending:"];

/** 读某域的用户覆盖（本机偏好）。 */
export function readOverrides(db: any, domainId: string): BuiltinOverrides {
  const parsed = parseJson<any>(metaGet(db, OVERRIDE_PREFIX + domainId), null);
  if (!plainObject(parsed)) return {};
  const out: BuiltinOverrides = {};
  for (const key of Object.keys(parsed)) {
    const item = parsed[key];
    if (!plainObject(item)) continue;
    const next: { enabled?: boolean; args?: Record<string, unknown> } = {};
    if (item.enabled !== undefined) next.enabled = Boolean(item.enabled);
    if (plainObject(item.args)) next.args = item.args as Record<string, unknown>;
    if (next.enabled !== undefined || next.args) out[key] = next;
  }
  return out;
}

/** 写某域的用户覆盖；空对象时删除该键，别在 meta 里留空壳。 */
export function writeOverrides(db: any, domainId: string, overrides: BuiltinOverrides): void {
  const key = OVERRIDE_PREFIX + domainId;
  if (!Object.keys(overrides).length) {
    db.prepare("DELETE FROM automation_meta WHERE key=?").run(key);
    return;
  }
  metaSet(db, key, JSON.stringify(overrides));
}

/** 记一条用户覆盖（启停或参数）。 */
function patchOverride(db: any, domainId: string, key: string, patch: { enabled?: boolean; args?: Record<string, unknown> }): void {
  const overrides = readOverrides(db, domainId);
  const current = overrides[key] || {};
  const next = Object.assign({}, current, patch);
  overrides[key] = next;
  writeOverrides(db, domainId, overrides);
}

/** 注册结果：新建/更新的键与因声明消失被停用的键。 */
export interface BuiltinRegisterResult {
  registered: string[];
  paused: string[];
}

/**
 * 注册一个域的全部内置规则（幂等、只写内存）。
 *
 * 重复注册只刷新定义与 origin_version，不动 id 与运行计数；声明消失的旧规则
 * 停用并记进 paused（声明回来时恢复原来的启用状态），不物理删除。
 */
export function registerBuiltinRules(input: {
  db: any;
  domainId: string;
  domainVersion: string;
  decls: unknown;
  subscriptions?: string[];
  log?: (...args: unknown[]) => void;
  now?: () => number;
}): BuiltinRegisterResult {
  const db = input.db;
  const now = input.now || dbNow;
  const domainId = String(input.domainId || "");
  const subs = (Array.isArray(input.subscriptions) ? input.subscriptions : []).map((row: any) =>
    typeof row === "string" ? row : String((row && row.type) || ""),
  );
  const list = Array.isArray(input.decls) ? input.decls : [];
  const decls: NormalizedDecl[] = [];
  const seen = new Set<string>();
  for (const raw of list) {
    const decl = normalizeDecl(raw, domainId, subs);
    if (seen.has(decl.key)) throw bad("内置规则 key 重复：" + decl.key);
    seen.add(decl.key);
    decls.push(decl);
  }
  return registry.registerDomain({
    domainId,
    version: String(input.domainVersion || ""),
    decls,
    overrides: readOverrides(db, domainId),
    now: now(),
  });
}

/** 域卸载：停调度并标「插件已卸载」，规则与运行计数保留（重装后幂等接回）。 */
export function unregisterBuiltinRules(_db: any, domainId: string): void {
  registry.unregisterDomain(domainId);
}

/** 内置规则的当前状态；用户规则恒为 active。 */
export type BuiltinOriginState = "active" | "updated" | "stale" | "uninstalled";

/** 状态文案（页面直接显示）。 */
export const ORIGIN_STATE_TEXT: Record<BuiltinOriginState, string> = {
  active: "内置规则",
  updated: "内置规则已更新",
  stale: "插件已不再声明",
  uninstalled: "插件已卸载",
};

/**
 * 计算内置规则状态：
 * - uninstalled：声明域已卸载（或还没在本次进程里注册过），停调度；
 * - stale：域在，但本次注册没有这个 key（声明被删除），停调度；
 * - updated：域版本与规则记录的 origin_version 不一致（提示去看变更），照常跑；
 * - active：正常。
 */
export function builtinStateOf(rule: AutomationRule, hasDomain: (id: string) => boolean): BuiltinOriginState {
  if (rule.origin !== "plugin") return "active";
  if (!hasDomain(rule.ownerDomain) || registry.isUninstalled(rule.ownerDomain)) return "uninstalled";
  const keys = registry.declaredKeys(rule.ownerDomain);
  if (keys.indexOf(rule.ruleKey) < 0) return "stale";
  const version = registry.declaredVersion(rule.ownerDomain);
  if (version && rule.originVersion && version !== rule.originVersion) return "updated";
  return "active";
}

/** 内置规则是否还应该被调度（卸载/声明消失的都不跑）。 */
export function builtinSchedulable(rule: AutomationRule, hasDomain: (id: string) => boolean): boolean {
  if (rule.origin !== "plugin") return true;
  if (!registry.schedulable(rule)) return false;
  const state = builtinStateOf(rule, hasDomain);
  return state === "active" || state === "updated";
}

/** 给规则对象补上来源状态（页面用；不落库）。 */
export function decorateOrigin(rule: any, hasDomain: (id: string) => boolean): any {
  if (!rule) return rule;
  const state = builtinStateOf(rule, hasDomain);
  return Object.assign({}, rule, { originState: state, originStateText: ORIGIN_STATE_TEXT[state] });
}

/** 某域当前的内置规则条数（能力目录用）。 */
export function countBuiltinRules(_db: any, domainId: string): number {
  return registry.countRules(domainId);
}

/** 该内置规则是否允许用户改参数（声明了 editableArgs）。 */
export function builtinEditableArgs(rule: AutomationRule): boolean {
  if (rule.origin !== "plugin") return false;
  return registry.editableArgsOf(rule.ownerDomain, rule.ruleKey);
}

/** 用户改启停：改内存状态并写本机覆盖。 */
export function setBuiltinEnabled(db: any, rule: AutomationRule, enabled: boolean, now: number = dbNow()): void {
  registry.setEnabled(rule.id, enabled);
  patchOverride(db, rule.ownerDomain, rule.ruleKey, { enabled: Boolean(enabled) });
  registry.patchRuntime(rule.id, { nextRunAt: enabled ? now : 0 });
}

/** 用户改参数（仅 editableArgs 的规则；调用方已做权限校验）。 */
export function setBuiltinArgs(
  db: any,
  rule: AutomationRule,
  args: Record<string, unknown>,
  now: number = dbNow(),
): void {
  registry.setArgs(rule.id, args, true);
  patchOverride(db, rule.ownerDomain, rule.ruleKey, { args });
  registry.patchRuntime(rule.id, { lastStatus: rule.lastStatus, nextRunAt: now });
}

/** 导出内置规则的「用户覆盖」：启用状态与参数；规则定义属于代码，不进备份。 */
export function exportBuiltinOverrides(db: any): any[] {
  const out: any[] = [];
  const rows = db
    .prepare("SELECT key,value FROM automation_meta WHERE key LIKE ?")
    .all(OVERRIDE_PREFIX + "%") as { key: string; value: string }[];
  for (const row of rows) {
    const domainId = String(row.key).slice(OVERRIDE_PREFIX.length);
    if (!domainId) continue;
    const overrides = parseJson<BuiltinOverrides>(row.value, {});
    if (!plainObject(overrides)) continue;
    for (const key of Object.keys(overrides)) {
      const item = overrides[key];
      if (!plainObject(item)) continue;
      const entry: any = { ownerDomain: domainId, ruleKey: key };
      if (item.enabled !== undefined) entry.enabled = Boolean(item.enabled);
      if (item.args) entry.actionArgs = item.args;
      if (entry.enabled === undefined && !entry.actionArgs) continue;
      out.push(entry);
    }
  }
  out.sort((a, b) =>
    a.ownerDomain === b.ownerDomain ? String(a.ruleKey).localeCompare(String(b.ruleKey)) : String(a.ownerDomain).localeCompare(String(b.ownerDomain)),
  );
  return out;
}

/**
 * 导入内置规则覆盖：写成本机偏好；插件已注册时立刻生效，没注册的等它回来再套。
 * 返回记录下来的覆盖条数（定义本身不迁移，所以这里不是「新建了几条规则」）。
 */
export function importBuiltinOverrides(db: any, list: unknown): number {
  const rows = Array.isArray(list) ? list : [];
  let applied = 0;
  for (const raw of rows.slice(0, 500)) {
    if (!plainObject(raw)) continue;
    const domainId = String(raw.ownerDomain || "");
    const key = String(raw.ruleKey || "");
    if (!domainId || !key) continue;
    const patch: { enabled?: boolean; args?: Record<string, unknown> } = {};
    if (raw.enabled !== undefined) patch.enabled = Boolean(raw.enabled);
    if (plainObject(raw.actionArgs)) patch.args = raw.actionArgs as Record<string, unknown>;
    if (patch.enabled === undefined && !patch.args) continue;
    patchOverride(db, domainId, key, patch);
    registry.applyOverride(domainId, key, patch);
    applied += 1;
  }
  return applied;
}

/**
 * 把内置规则从数据库迁到内存（旧版本写过 automation_rule 的 plugin 行）。
 *
 * 幂等：plugin 行先读成用户覆盖（启用状态与参数），再删除；老的 meta 登记
 * （builtin:/builtin-edited:/builtin-pending:）一并清掉。返回清理的行数。
 */
export function migrateLegacyBuiltins(db: any, log?: (...args: unknown[]) => void): number {
  let rows: any[] = [];
  try {
    rows = db
      .prepare("SELECT * FROM automation_rule WHERE origin='plugin'")
      .all() as any[];
  } catch {
    return 0;
  }
  for (const row of rows) {
    const domainId = String(row.owner_domain || "");
    const key = String(row.rule_key || "");
    if (!domainId || !key) continue;
    const patch: { enabled?: boolean; args?: Record<string, unknown> } = {};
    if (row.enabled !== undefined) patch.enabled = Boolean(row.enabled);
    const args = parseJson<any>(row.action_args, null);
    if (plainObject(args)) patch.args = args;
    if (patch.enabled !== undefined || patch.args) patchOverride(db, domainId, key, patch);
  }
  if (rows.length) {
    db.prepare("DELETE FROM automation_rule WHERE origin='plugin'").run();
    log?.("[automation] 已把 " + rows.length + " 条内置规则从数据库迁到内存注册表（启用状态与参数转为本机偏好）");
  }
  for (const prefix of LEGACY_META_PREFIX) {
    try {
      db.prepare("DELETE FROM automation_meta WHERE key LIKE ?").run(prefix + "%");
    } catch {
      /* 老库没有 meta 表：忽略 */
    }
  }
  return rows.length;
}
