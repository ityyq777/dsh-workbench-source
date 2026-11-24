/**
 * 内置自动化规则：子插件在 DomainDef.automations 里声明，宿主注册后自动建成
 * 可调度规则（声明即授权），并区分 user / plugin 两种来源。
 *
 * 三条红线：
 * 1. 内置规则只允许调用**声明方本域**的 action；跨域声明在注册阶段直接报错、零落库。
 *    理由：内置规则可豁免用户白名单，跨域就等于任何插件都能点燃别的插件。
 * 2. trigger.kind=event 的事件类型必须已在 DomainDef.events.subscriptions 声明，不新开口子。
 * 3. 内置规则的 trigger / action / condition 由代码决定，用户只能启停（editableArgs 时还能改参数）。
 *
 * 模块只做纯数据操作，调度由 engine 按 origin 分叉。
 */

import { metaGet, metaSet, now as dbNow, parseJson, type AutomationRule } from "./db.js";
import { bad, nextAt, normalizeCondition, normalizeTrigger, plainObject } from "./rule.js";
import { validActionName } from "./whitelist.js";

/** 内置规则的 id 前缀：auto:{domainId}:{key}。 */
export function builtinRuleId(domainId: string, key: string): string {
  return "auto:" + domainId + ":" + key;
}

/** 声明登记（automation_meta 的 builtin:<domain>）：keys 用于识别「声明已被删除」。 */
interface BuiltinRegistry {
  version: string;
  keys: string[];
  /** key → { editableArgs, args } —— 导出覆盖与「参数是否被用户改过」都要用。 */
  decls: Record<string, { editableArgs: boolean; args: string }>;
  /** 因声明消失被停用的 key → 原来的启用状态（声明回来时恢复）。 */
  paused: Record<string, boolean>;
  updatedAt: number;
}

/** 读声明登记；没有返回 null。 */
export function readRegistry(db: any, domainId: string): BuiltinRegistry | null {
  const raw = metaGet(db, "builtin:" + domainId);
  if (!raw) return null;
  const parsed = parseJson<any>(raw, null);
  if (!plainObject(parsed) || !Array.isArray(parsed.keys)) return null;
  return {
    version: String(parsed.version || ""),
    keys: parsed.keys.map(String),
    decls: plainObject(parsed.decls) ? parsed.decls : {},
    paused: plainObject(parsed.paused) ? parsed.paused : {},
    updatedAt: Number(parsed.updatedAt) || 0,
  };
}

/** 写声明登记。 */
function writeRegistry(db: any, domainId: string, reg: BuiltinRegistry): void {
  metaSet(db, "builtin:" + domainId, JSON.stringify(reg));
}

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

/** 单条声明的规范化结果。 */
interface NormalizedDecl {
  key: string;
  title: string;
  description: string;
  triggerType: string;
  triggerConfig: any;
  actionName: string;
  actionArgs: Record<string, unknown>;
  condition: unknown;
  enabled: boolean;
  editableArgs: boolean;
}

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
  // 但仍然校验参数结构与体积，避免把脏数据写进规则表。
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
    enabled: raw.defaultEnabled !== false,
    editableArgs: raw.editableArgs === true,
  };
}

/** 注册结果：新建/更新的键与因声明消失被停用的键。 */
export interface BuiltinRegisterResult {
  registered: string[];
  paused: string[];
}

/**
 * 注册一个域的全部内置规则（幂等）。
 *
 * 重复注册只更新定义与 origin_version，不动 id 与运行计数；声明消失的旧规则
 * enabled=0 并记进 registry.paused（声明回来时恢复原来的启用状态），不物理删除。
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
  const version = String(input.domainVersion || "");
  const subs = (Array.isArray(input.subscriptions) ? input.subscriptions : []).map((row: any) =>
    typeof row === "string" ? row : String((row && row.type) || ""),
  );
  const list = Array.isArray(input.decls) ? input.decls : [];
  const previous = readRegistry(db, domainId);
  const reg: BuiltinRegistry = {
    version,
    keys: [],
    decls: {},
    paused: previous ? previous.paused : {},
    updatedAt: now(),
  };
  const registered: string[] = [];
  const paused: string[] = [];
  const seen = new Set<string>();

  for (const raw of list) {
    const decl = normalizeDecl(raw, domainId, subs);
    if (seen.has(decl.key)) throw bad("内置规则 key 重复：" + decl.key);
    seen.add(decl.key);
    reg.keys.push(decl.key);
    reg.decls[decl.key] = { editableArgs: decl.editableArgs, args: JSON.stringify(decl.actionArgs) };
    upsertBuiltinRule(db, domainId, version, decl, previous, now);
    registered.push(decl.key);
  }

  // 声明消失：停用但不删除，运行记录仍可追溯。
  const existing = db
    .prepare("SELECT id, rule_key, enabled FROM automation_rule WHERE origin='plugin' AND owner_domain=? AND deleted_at IS NULL")
    .all(domainId) as any[];
  for (const row of existing) {
    const key = String(row.rule_key || "");
    if (seen.has(key)) continue;
    paused.push(key);
    if (!Object.prototype.hasOwnProperty.call(reg.paused, key)) reg.paused[key] = Boolean(row.enabled);
    if (row.enabled) {
      db.prepare("UPDATE automation_rule SET enabled=0, next_run_at=NULL, updated_at=?, rev=rev+1 WHERE id=?").run(
        now(),
        row.id,
      );
    }
  }
  writeRegistry(db, domainId, reg);
  return { registered, paused };
}

/** 单条内置规则的 upsert：id 稳定，用户改过的参数不被覆盖。 */
function upsertBuiltinRule(
  db: any,
  domainId: string,
  version: string,
  decl: NormalizedDecl,
  previous: BuiltinRegistry | null,
  now: () => number,
): void {
  const id = builtinRuleId(domainId, decl.key);
  const row = db
    .prepare("SELECT * FROM automation_rule WHERE origin='plugin' AND owner_domain=? AND rule_key=?")
    .get(domainId, decl.key) as any;
  const ts = now();
  const condition = decl.condition ? JSON.stringify(decl.condition) : "";
  const argsJson = JSON.stringify(decl.actionArgs);
  if (!row) {
    const next = decl.enabled ? nextAt(decl.triggerType, decl.triggerConfig, ts) : null;
    db.prepare(
      "INSERT INTO automation_rule(id,name,enabled,trigger_type,trigger_config,condition,action_name,action_args," +
        "next_run_at,created_at,updated_at,exec_mode,origin,owner_domain,rule_key,origin_version) " +
        "VALUES(?,?,?,?,?,?,?,?,?,?,?,'action','plugin',?,?,?)",
    ).run(
      id,
      decl.title,
      decl.enabled ? 1 : 0,
      decl.triggerType,
      JSON.stringify(decl.triggerConfig),
      condition,
      decl.actionName,
      argsJson,
      next,
      ts,
      ts,
      domainId,
      decl.key,
      version,
    );
    return;
  }
  // 用户改过参数（editableArgs）时保留用户版本，只刷新定义元信息。
  const userEditedArgs = isArgsEdited(db, domainId, decl.key);
  const enabled = resolveEnabled(row.enabled, decl, previous);
  const next = enabled ? nextAt(decl.triggerType, decl.triggerConfig, ts) : null;
  db.prepare(
    "UPDATE automation_rule SET name=?, enabled=?, trigger_type=?, trigger_config=?, condition=?, action_name=?, " +
      "action_args=?, next_run_at=?, origin_version=?, updated_at=?, rev=rev+1 WHERE id=?",
  ).run(
    decl.title,
    enabled ? 1 : 0,
    decl.triggerType,
    JSON.stringify(decl.triggerConfig),
    condition,
    decl.actionName,
    userEditedArgs ? row.action_args : argsJson,
    next,
    version,
    ts,
    row.id,
  );
}

/** 启用状态：默认沿用已有；曾被我们因声明消失停用过的，声明回来时恢复原状。 */
function resolveEnabled(current: number, decl: NormalizedDecl, previous: BuiltinRegistry | null): boolean {
  const wasPaused = previous && Object.prototype.hasOwnProperty.call(previous.paused, decl.key);
  if (wasPaused) return Boolean(previous!.paused[decl.key]);
  return Boolean(current);
}

/** 用户是否覆盖过参数（记在 registry 的 __edited 集合里，避免多加一列）。 */
function isArgsEdited(db: any, domainId: string, key: string): boolean {
  const raw = metaGet(db, "builtin-edited:" + domainId);
  const list = parseJson<string[]>(raw, []);
  return Array.isArray(list) && list.indexOf(key) >= 0;
}

/** 标记用户覆盖过参数（editableArgs=true 的内置规则）。 */
export function markArgsEdited(db: any, domainId: string, key: string): void {
  const raw = metaGet(db, "builtin-edited:" + domainId);
  const list = Array.isArray(parseJson<string[]>(raw, [])) ? parseJson<string[]>(raw, []) : [];
  if (list.indexOf(key) < 0) list.push(key);
  metaSet(db, "builtin-edited:" + domainId, JSON.stringify(list));
}

/** 该内置规则是否允许用户改参数。 */
export function builtinEditableArgs(db: any, rule: AutomationRule): boolean {
  if (rule.origin !== "plugin") return false;
  const reg = readRegistry(db, rule.ownerDomain);
  if (!reg) return false;
  const decl = reg.decls[rule.ruleKey];
  return Boolean(decl && decl.editableArgs);
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
 * - uninstalled：声明域已不在宿主（卸载/未加载），停调度；
 * - stale：域在，但本次注册没有这个 key（声明被删除），停调度；
 * - updated：域版本与规则记录的 origin_version 不一致（提示去看变更），照常跑；
 * - active：正常。
 */
export function builtinStateOf(
  db: any,
  rule: AutomationRule,
  hasDomain: (id: string) => boolean,
): BuiltinOriginState {
  if (rule.origin !== "plugin") return "active";
  if (!hasDomain(rule.ownerDomain)) return "uninstalled";
  const reg = readRegistry(db, rule.ownerDomain);
  if (!reg || reg.keys.indexOf(rule.ruleKey) < 0) return "stale";
  if (reg.version && rule.originVersion && reg.version !== rule.originVersion) return "updated";
  return "active";
}

/** 内置规则是否还应该被调度（卸载/声明消失的都不跑）。 */
export function builtinSchedulable(db: any, rule: AutomationRule, hasDomain: (id: string) => boolean): boolean {
  if (rule.origin !== "plugin") return true;
  const state = builtinStateOf(db, rule, hasDomain);
  return state === "active" || state === "updated";
}

/** 给规则对象补上来源状态（页面用；不落库）。 */
export function decorateOrigin(db: any, rule: any, hasDomain: (id: string) => boolean): any {
  if (!rule) return rule;
  const state = builtinStateOf(db, rule, hasDomain);
  return Object.assign({}, rule, { originState: state, originStateText: ORIGIN_STATE_TEXT[state] });
}

/** 某域当前的内置规则条数（能力目录用）。 */
export function countBuiltinRules(db: any, domainId: string): number {
  try {
    const row = db
      .prepare("SELECT COUNT(*) AS n FROM automation_rule WHERE origin='plugin' AND owner_domain=? AND deleted_at IS NULL")
      .get(domainId);
    return (row && row.n) || 0;
  } catch {
    return 0;
  }
}

/** 域卸载：只记录状态，规则行保留（重装后同 key 幂等接回）。 */
export function unregisterBuiltinRules(db: any, domainId: string, now: () => number = dbNow): void {
  db.prepare("UPDATE automation_rule SET next_run_at=NULL, updated_at=? WHERE origin='plugin' AND owner_domain=? AND deleted_at IS NULL").run(
    now(),
    domainId,
  );
}

/** 导出内置规则的「用户覆盖」：启用状态与参数覆盖；规则定义属于代码，不进备份。 */
export function exportBuiltinOverrides(db: any): any[] {
  const rows = db
    .prepare("SELECT * FROM automation_rule WHERE origin='plugin' AND deleted_at IS NULL ORDER BY owner_domain, rule_key")
    .all() as any[];
  const out: any[] = [];
  for (const row of rows) {
    const reg = readRegistry(db, row.owner_domain);
    const declArgs = reg && reg.decls[row.rule_key] ? reg.decls[row.rule_key].args : "";
    const edited = isArgsEdited(db, row.owner_domain, row.rule_key);
    const item: any = { ownerDomain: row.owner_domain, ruleKey: row.rule_key, enabled: Boolean(row.enabled) };
    if (edited && declArgs && declArgs !== row.action_args) item.actionArgs = parseJson(row.action_args, {});
    out.push(item);
  }
  return out;
}

/** 导入内置规则覆盖；插件没装时覆盖先记着，等插件回来再落地。 */
export function importBuiltinOverrides(
  db: any,
  list: unknown,
  hasDomain: (id: string) => boolean,
  now: () => number = dbNow,
): number {
  const rows = Array.isArray(list) ? list : [];
  let applied = 0;
  for (const raw of rows.slice(0, 500)) {
    if (!plainObject(raw)) continue;
    const domainId = String(raw.ownerDomain || "");
    const key = String(raw.ruleKey || "");
    if (!domainId || !key) continue;
    const row = db
      .prepare("SELECT * FROM automation_rule WHERE origin='plugin' AND owner_domain=? AND rule_key=?")
      .get(domainId, key) as any;
    if (!row) {
      // 插件未安装：先记成待生效覆盖，声明回来时由 registerBuiltinRules 读取。
      const pendingRaw = metaGet(db, "builtin-pending:" + domainId);
      const pending = parseJson<any[]>(pendingRaw, []);
      const next = (Array.isArray(pending) ? pending : []).filter((item: any) => item && item.ruleKey !== key);
      next.push(raw);
      metaSet(db, "builtin-pending:" + domainId, JSON.stringify(next));
      continue;
    }
    const enabled = raw.enabled === undefined ? Boolean(row.enabled) : Boolean(raw.enabled);
    const args = plainObject(raw.actionArgs) ? raw.actionArgs : null;
    if (args) {
      db.prepare("UPDATE automation_rule SET action_args=?, updated_at=?, rev=rev+1 WHERE id=?").run(
        JSON.stringify(args),
        now(),
        row.id,
      );
      markArgsEdited(db, domainId, key);
    }
    db.prepare("UPDATE automation_rule SET enabled=?, next_run_at=?, updated_at=?, rev=rev+1 WHERE id=?").run(
      enabled ? 1 : 0,
      enabled ? nextAt(row.trigger_type, parseJson(row.trigger_config, {}), now()) : null,
      now(),
      row.id,
    );
    applied += 1;
    if (!hasDomain(domainId)) continue;
  }
  return applied;
}

/** 应用某域待生效的覆盖（registerBuiltinRules 之后调用）。 */
export function applyPendingOverrides(db: any, domainId: string, now: () => number = dbNow): number {
  const raw = metaGet(db, "builtin-pending:" + domainId);
  const pending = parseJson<any[]>(raw, []);
  if (!Array.isArray(pending) || !pending.length) return 0;
  const accepted = pending.filter((item) => item && item.ruleKey);
  metaSet(db, "builtin-pending:" + domainId, "[]");
  const applied = importBuiltinOverrides(db, accepted, () => true, now);
  return applied;
}
