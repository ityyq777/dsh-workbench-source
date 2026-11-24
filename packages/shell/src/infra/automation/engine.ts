/**
 * 自动化引擎：规则的 CRUD、定时扫描、域事件触发、手动运行与导入导出。
 *
 * 与业务插件版 createAutomation 行为等价；对外方法名保持不变（listRules /
 * createRule / updateRule / deleteRule / runRule / start / stop / onEvent /
 * exportData / importData / stats 等）。
 *
 * 依赖全部注入：db、invoke（宿主 action 调用入口）、getSchedule（宿主
 * 「自动化任务」服务）、log 与可选时钟。本模块不 import 任何宿主实现。
 */

import {
  metaGet,
  metaSet,
  newId,
  now as dbNow,
  parseJson,
  ruleRow,
  runRow,
  type AutomationRule,
  type AutomationRun,
} from "./db.js";
import { createActionExecutor, type ActionExecuteResult, type InvokeFn } from "./exec-action.js";
import { createAgentRules } from "./exec-agent.js";
import { createAgentBridge, type ScheduleService } from "./agent-bridge.js";
import {
  bad,
  nextAt,
  normalizeAction,
  normalizeCondition,
  normalizeTrigger,
  plainObject,
} from "./rule.js";
import { checkAction, normalizeAllowedList } from "./whitelist.js";
import {
  applyPendingOverrides,
  builtinEditableArgs,
  builtinSchedulable,
  builtinStateOf,
  countBuiltinRules,
  decorateOrigin,
  exportBuiltinOverrides,
  importBuiltinOverrides,
  markArgsEdited,
  registerBuiltinRules,
  unregisterBuiltinRules,
  type BuiltinRegisterResult,
} from "./builtin.js";

/** 本机配置默认值（与源码完全一致）。 */
const DEFAULT_CONFIG = { maxRules: 50, perHour: 60, allowedActions: [] as string[] };

/** 自动化本机配置。 */
export interface AutomationConfig {
  maxRules: number;
  perHour: number;
  allowedActions: string[];
}

/** 规则 + 最近一次运行（列表页口径）。 */
export interface AutomationRuleWithLastRun extends AutomationRule {
  lastRun: AutomationRun | null;
}

/** 首页卡片统计。 */
export interface AutomationStats {
  total: number;
  enabled: number;
  today: Record<string, number>;
  config: AutomationConfig;
  staleCount: number;
  agentRules: number;
  agentEnabled: number;
  /** 用户自定义规则条数 */
  userRules: number;
  /** 插件内置规则条数 */
  builtinRules: number;
  builtinEnabled: number;
  builtinDisabled: number;
  /** 声明已消失 / 插件已卸载的内置规则条数 */
  builtinStale: number;
  builtinUninstalled: number;
}

/** 导入结果。 */
export interface AutomationImportResult {
  ok: boolean;
  imported: number;
  skipped: number;
  failed: number;
  /** 应用到的内置规则覆盖条数（启用状态/参数），定义本身不迁移 */
  builtinApplied?: number;
  message: string;
}

/** runRule 的返回值：action 执行结果或「交给 AI」的投递结果。 */
export type RunRuleResult =
  | ActionExecuteResult
  | { ok: true; delivered: true }
  | { skipped: true; reason: "busy" };

/** createAutomation 的依赖。 */
export interface AutomationEngineOptions {
  db: any;
  /** 宿主 action 调用入口。 */
  invoke: InvokeFn;
  log?: (...args: unknown[]) => void;
  /** 宿主「自动化任务」服务；没加载时返回 null。 */
  getSchedule?: () => ScheduleService | null | undefined;
  /** 可选的本地时钟；缺省用 db.ts 的宿主时钟。 */
  now?: () => number;
  /** 判断域是否仍安装（内置规则的调度与状态都靠它） */
  hasDomain?: (id: string) => boolean;
  /** 审计入口：内置规则豁免白名单，调用必须留痕 */
  audit?: (entry: { action: string; domain: string; ok: boolean; args?: unknown; error?: string }) => void;
}

/** createAutomation 返回的引擎。 */
export interface AutomationEngine {
  config(): AutomationConfig;
  saveConfig(patch?: Record<string, any>): AutomationConfig;
  getRule(id: unknown): AutomationRule | null;
  listRules(): AutomationRuleWithLastRun[];
  createRule(input: any): Promise<AutomationRule | null>;
  updateRule(input: any): Promise<AutomationRule | null>;
  deleteRule(id: unknown): Promise<{ id: string; deleted: boolean }>;
  runRule(id: unknown, trigger?: string, payload?: any): Promise<RunRuleResult>;
  runList(input?: any): AutomationRun[];
  runGet(id: unknown): AutomationRun | null;
  stats(): AutomationStats;
  tick(): Promise<void>;
  onEvent(event: any): void;
  start(): void;
  stop(): void;
  exportData(): { rules: any[] };
  importData(payload: any): Promise<AutomationImportResult>;
  listRulesLive(): Promise<any[]>;
  agentStatus(): Promise<any>;
  agentHistory(scheduleId: any, limit?: any, before?: any): Promise<any>;
  /** 注册某域声明的内置规则（幂等）；返回新建/更新与因声明消失停用的 key。 */
  registerBuiltin(input: {
    domainId: string;
    domainVersion: string;
    decls: unknown;
    subscriptions?: any[];
  }): BuiltinRegisterResult;
  /** 域注销：内置规则停止调度（行保留，重装后同 key 接回）。 */
  unregisterBuiltin(domainId: string): void;
  /** 某域内置规则条数（能力目录用）。 */
  builtinCount(domainId: string): number;
}

export function createAutomation({
  db,
  invoke,
  log = () => {},
  getSchedule = () => null,
  now,
  hasDomain = () => true,
  audit = () => {},
}: AutomationEngineOptions): AutomationEngine {
  let timer: ReturnType<typeof setInterval> | null = null;
  let ticking = false;
  const nowFn = now ?? dbNow;

  // 「交给 AI」执行方式：定时与投递交给宿主 schedule，本机只存表单与快照。
  const agent = createAgentBridge({ getSchedule, log });

  // execMode=action 的执行器（条件/频率/并发闸门 + 运行记录）。
  const actionExecutor = createActionExecutor({ db, invoke, log, config, now: nowFn, audit });

  // 「交给 AI」规则的宿主登记与对账单独成模块，规则引擎只负责 action 模式。
  const agentRules = createAgentRules({ db, agent, log, getRule, listRules, now: nowFn });

  function config(): AutomationConfig {
    const raw = metaGet(db, "config");
    const parsed = raw ? parseJson(raw, {}) : {};
    const next: any = Object.assign({}, DEFAULT_CONFIG, plainObject(parsed) ? parsed : {});
    // 读取时静默清洗，保证老数据或手改配置不会让页面直接报错。
    next.allowedActions = normalizeAllowedList(next.allowedActions, false);
    return next as AutomationConfig;
  }

  function saveConfig(patch?: Record<string, any>): AutomationConfig {
    const next: any = Object.assign({}, config(), patch);
    next.maxRules = Math.max(1, Math.min(500, Number(next.maxRules) || DEFAULT_CONFIG.maxRules));
    next.perHour = Math.max(1, Math.min(600, Number(next.perHour) || DEFAULT_CONFIG.perHour));
    if (patch && Object.prototype.hasOwnProperty.call(patch, "allowedActions")) {
      next.allowedActions = normalizeAllowedList(patch.allowedActions, true);
    }
    metaSet(db, "config", JSON.stringify(next));
    return next as AutomationConfig;
  }

  function getRule(id: unknown): AutomationRule | null {
    const row = db.prepare("SELECT * FROM automation_rule WHERE id=? AND deleted_at IS NULL").get(String(id || ""));
    return row ? decorateOrigin(db, ruleRow(row), hasDomain) : null;
  }

  function listRules(): AutomationRuleWithLastRun[] {
    const rows = db
      .prepare("SELECT * FROM automation_rule WHERE deleted_at IS NULL ORDER BY updated_at DESC LIMIT 200")
      .all();
    return rows.map((row: any) => {
      const last = db
        .prepare("SELECT * FROM automation_run WHERE rule_id=? ORDER BY started_at DESC LIMIT 1")
        .get(row.id);
      return decorateOrigin(db, Object.assign(ruleRow(row), { lastRun: last ? runRow(last) : null }), hasDomain);
    });
  }

  async function createRule(input: any): Promise<AutomationRule | null> {
    const data = plainObject(input) ? input : {};
    const name = String(data.name || "").trim().slice(0, 80);
    if (!name) throw bad("规则名称不能为空");
    if (listRules().length >= config().maxRules) throw bad("规则数量已达上限");
    if (data.execMode === "agent") return agentRules.createAgentRule(data, name);
    const trigger = normalizeTrigger(data);
    const action = normalizeAction(data.actionName, data.actionArgs, config().allowedActions);
    const condition = normalizeCondition(data.condition);
    const id = newId("rule");
    const ts = nowFn();
    const next = data.enabled === false ? null : nextAt(trigger.triggerType, trigger.config, ts);
    db.prepare(
      "INSERT INTO automation_rule(id,name,enabled,trigger_type,trigger_config,condition,action_name,action_args,next_run_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
    ).run(
      id,
      name,
      data.enabled === false ? 0 : 1,
      trigger.triggerType,
      JSON.stringify(trigger.config),
      condition ? JSON.stringify(condition) : "",
      action.action,
      JSON.stringify(action.actionArgs),
      next,
      ts,
      ts,
    );
    return getRule(id);
  }

  /**
   * 内置规则的更新：只放行 enabled 与（声明了 editableArgs 时的）actionArgs。
   * 其它字段即使与现值相同也不强制报错，但一旦不同就必须拒绝，避免界面误以为能改。
   */
  async function updateBuiltinRule(existing: AutomationRule, data: any): Promise<AutomationRule | null> {
    const guard: Array<[string, unknown]> = [
      ["name", existing.name],
      ["execMode", existing.execMode],
      ["triggerType", existing.triggerType],
      ["triggerConfig", existing.triggerConfig],
      ["actionName", existing.actionName],
      ["condition", existing.condition],
    ];
    for (const [key, current] of guard) {
      if (!Object.prototype.hasOwnProperty.call(data, key) || data[key] === undefined) continue;
      if (JSON.stringify(data[key]) !== JSON.stringify(current)) {
        throw bad("内置规则由插件声明，不能修改 " + key + "（只能启用/停用" +
          (builtinEditableArgs(db, existing) ? "或调整参数" : "") + "）");
      }
    }
    const enabled = data.enabled === undefined ? existing.enabled : data.enabled !== false;
    const editable = builtinEditableArgs(db, existing);
    if (data.actionArgs !== undefined && !editable) {
      throw bad("该内置规则不允许修改参数（插件未声明 editableArgs）");
    }
    const ts = nowFn();
    const next = enabled ? nextAt(existing.triggerType, existing.triggerConfig, ts) : null;
    if (data.actionArgs !== undefined) {
      const args = plainObject(data.actionArgs) ? data.actionArgs : {};
      if (JSON.stringify(args).length > 20000) throw bad("actionArgs 超过 20KB");
      db.prepare("UPDATE automation_rule SET action_args=?, updated_at=?, rev=rev+1 WHERE id=?").run(
        JSON.stringify(args),
        ts,
        existing.id,
      );
      markArgsEdited(db, existing.ownerDomain, existing.ruleKey);
    }
    db.prepare("UPDATE automation_rule SET enabled=?, next_run_at=?, updated_at=?, rev=rev+1 WHERE id=?").run(
      enabled ? 1 : 0,
      next,
      ts,
      existing.id,
    );
    return getRule(existing.id);
  }

  async function updateRule(input: any): Promise<AutomationRule | null> {
    const data = plainObject(input) ? input : {};
    const existing = getRule(data.id);
    if (!existing) throw bad("规则不存在");
    // 内置规则：trigger / action / condition 由插件代码决定，用户只能启停（可按声明改参数）。
    if (existing.origin === "plugin") return updateBuiltinRule(existing, data);
    if (data.execMode && data.execMode !== existing.execMode) {
      throw bad("规则创建后不能切换执行方式，请新建一条规则");
    }
    const name = String((data.name == null ? existing.name : data.name) || "")
      .trim()
      .slice(0, 80);
    if (!name) throw bad("规则名称不能为空");
    if (existing.execMode === "agent") return agentRules.updateAgentRule(existing, data, name);
    const merged: any = Object.assign({}, existing, data);
    const trigger = normalizeTrigger({ triggerType: merged.triggerType, triggerConfig: merged.triggerConfig });
    const action = normalizeAction(merged.actionName, merged.actionArgs, config().allowedActions);
    const condition = normalizeCondition(merged.condition);
    const enabled = merged.enabled !== false;
    const ts = nowFn();
    const next = enabled ? nextAt(trigger.triggerType, trigger.config, ts) : null;
    db.prepare(
      "UPDATE automation_rule SET name=?,enabled=?,trigger_type=?,trigger_config=?,condition=?,action_name=?,action_args=?,next_run_at=?,updated_at=?,rev=rev+1 WHERE id=?",
    ).run(
      name,
      enabled ? 1 : 0,
      trigger.triggerType,
      JSON.stringify(trigger.config),
      condition ? JSON.stringify(condition) : "",
      action.action,
      JSON.stringify(action.actionArgs),
      next,
      ts,
      existing.id,
    );
    return getRule(existing.id);
  }

  async function deleteRule(id: unknown): Promise<{ id: string; deleted: boolean }> {
    const existing = getRule(id);
    if (!existing) throw bad("规则不存在");
    if (existing.origin === "plugin") {
      throw bad("内置规则由插件声明，不能删除；不需要时关闭启用开关即可");
    }
    if (existing.scheduleId) {
      try {
        await agent.remove(existing.scheduleId);
      } catch (error) {
        // 宿主任务删不掉（服务未加载/权限）时仍然删本地规则，避免页面卡住。
        log("删除宿主任务失败：" + (error && (error as Error).message));
      }
    }
    db.prepare(
      "UPDATE automation_rule SET enabled=0, deleted_at=?, next_run_at=NULL, updated_at=?, rev=rev+1 WHERE id=?",
    ).run(nowFn(), nowFn(), existing.id);
    return { id: existing.id, deleted: true };
  }

  async function runRule(id: unknown, trigger = "manual", payload?: any): Promise<RunRuleResult> {
    const rule = getRule(id);
    if (!rule) throw bad("规则不存在");
    if (rule.execMode === "agent") {
      if (!rule.scheduleId) throw bad("规则还没有关联宿主任务，请删除后重建");
      const out = await agent.run(rule.scheduleId);
      if (out.status === "missing") throw bad("宿主任务已不存在（可能已在「自动化任务」里删除）");
      if (out.status === "pending") return { skipped: true, reason: "busy" };
      return { ok: true, delivered: true };
    }
    return actionExecutor.execute(rule, trigger, payload);
  }

  function runList(input?: any): AutomationRun[] {
    const ruleId = input && input.ruleId ? String(input.ruleId) : "";
    const limit = Math.max(1, Math.min(200, Number(input && input.limit) || 50));
    const rows = ruleId
      ? db.prepare("SELECT * FROM automation_run WHERE rule_id=? ORDER BY started_at DESC LIMIT ?").all(ruleId, limit)
      : db.prepare("SELECT * FROM automation_run ORDER BY started_at DESC LIMIT ?").all(limit);
    return rows.map(runRow);
  }

  function runGet(id: unknown): AutomationRun | null {
    const row = db.prepare("SELECT * FROM automation_run WHERE id=?").get(String(id || ""));
    return row ? runRow(row) : null;
  }

  function stats(): AutomationStats {
    const total = db.prepare("SELECT COUNT(*) AS n FROM automation_rule WHERE deleted_at IS NULL").get().n;
    const enabled = db
      .prepare("SELECT COUNT(*) AS n FROM automation_rule WHERE deleted_at IS NULL AND enabled=1")
      .get().n;
    const today = nowFn() - 86400000;
    const runs = db
      .prepare("SELECT status, COUNT(*) AS n FROM automation_run WHERE started_at>=? GROUP BY status")
      .all(today);
    const map: Record<string, number> = {};
    for (const row of runs) map[row.status] = row.n;
    const cfg = config();
    const stale = db
      .prepare("SELECT action_name FROM automation_rule WHERE deleted_at IS NULL AND exec_mode='action'")
      .all()
      .filter((row: any) => checkAction(row.action_name, cfg.allowedActions)).length;
    const agentRuleCount = db
      .prepare("SELECT COUNT(*) AS n FROM automation_rule WHERE deleted_at IS NULL AND exec_mode='agent'")
      .get().n;
    const agentEnabled = db
      .prepare("SELECT COUNT(*) AS n FROM automation_rule WHERE deleted_at IS NULL AND exec_mode='agent' AND enabled=1")
      .get().n;
    // 来源拆分：用户自定义与插件内置分开计数，概览按来源展示。
    const userRules = db
      .prepare("SELECT COUNT(*) AS n FROM automation_rule WHERE deleted_at IS NULL AND origin='user'")
      .get().n;
    const builtinRows = db
      .prepare("SELECT * FROM automation_rule WHERE deleted_at IS NULL AND origin='plugin'")
      .all() as any[];
    let builtinEnabled = 0;
    let builtinDisabled = 0;
    let builtinStale = 0;
    let builtinUninstalled = 0;
    for (const row of builtinRows) {
      const state = builtinStateOf(db, ruleRow(row), hasDomain);
      if (state === "stale") builtinStale += 1;
      else if (state === "uninstalled") builtinUninstalled += 1;
      else if (row.enabled) builtinEnabled += 1;
      else builtinDisabled += 1;
    }
    return {
      total,
      enabled,
      today: map,
      config: cfg,
      staleCount: stale,
      agentRules: agentRuleCount,
      agentEnabled,
      userRules,
      builtinRules: builtinRows.length,
      builtinEnabled,
      builtinDisabled,
      builtinStale,
      builtinUninstalled,
    };
  }

  async function tick(): Promise<void> {
    if (ticking) return;
    ticking = true;
    try {
      const due = db
        .prepare(
          "SELECT * FROM automation_rule WHERE deleted_at IS NULL AND enabled=1 AND exec_mode='action' AND next_run_at IS NOT NULL AND next_run_at<=? ORDER BY next_run_at ASC LIMIT 3",
        )
        .all(nowFn());
      // 卸载/声明消失的内置规则不调度，避免插件不在时仍打点。
      const runnable = due
        .map((row: any) => ruleRow(row))
        .filter((rule: AutomationRule) => builtinSchedulable(db, rule, hasDomain))
        .slice(0, 3);
      for (const rule of runnable) await actionExecutor.execute(rule, "schedule", { at: nowFn() });
    } finally {
      ticking = false;
    }
  }

  function onEvent(event: any): void {
    if (!plainObject(event) || !event.domainId || !event.event) return;
    const rows = db
      .prepare(
        "SELECT * FROM automation_rule WHERE deleted_at IS NULL AND enabled=1 AND trigger_type='event' LIMIT 200",
      )
      .all();
    for (const row of rows) {
      const rule = ruleRow(row);
      if (!builtinSchedulable(db, rule, hasDomain)) continue;
      if (rule.triggerConfig.domainId === event.domainId && rule.triggerConfig.event === event.event) {
        void actionExecutor.execute(rule, "event", event.data || {});
      }
    }
  }

  function start(): void {
    if (timer) return;
    timer = setInterval(() => void tick(), 30000);
    if (typeof timer.unref === "function") timer.unref();
  }

  function stop(): void {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function exportData(): { rules: any[]; builtin: any[] } {
    return {
      // 内置规则的定义属于插件代码，不进备份；只导出用户覆盖（启用状态与参数）。
      rules: listRules()
        .filter((rule) => rule.origin !== "plugin")
        .map((rule) => {
          // 宿主任务 id 只在本机有效，导出时去掉，导入时按表单重建。
          const { scheduleId, lastRun, rev, ...rest } = rule;
          return rest;
        }),
      builtin: exportBuiltinOverrides(db),
    };
  }

  async function importData(payload: any): Promise<AutomationImportResult> {
    let data: any = payload;
    if (typeof payload === "string") {
      try {
        data = JSON.parse(payload);
      } catch {
        return { ok: false, imported: 0, skipped: 0, failed: 0, message: "备份内容不是合法 JSON" };
      }
    }
    const rules = data && Array.isArray(data.rules) ? data.rules : [];
    // 内置规则的覆盖先应用（插件没装时记成待生效，装回来再落地）。
    const builtinApplied = data && data.builtin !== undefined
      ? importBuiltinOverrides(db, data.builtin, hasDomain, nowFn)
      : 0;
    let imported = 0;
    let skipped = 0;
    let failed = 0;
    for (const item of rules.slice(0, 500)) {
      // 老备份里若混进内置规则的定义，直接跳过：它以插件代码为准。
      if (item && item.origin === "plugin") {
        skipped += 1;
        continue;
      }
      if (!item || !item.id || getRule(item.id)) {
        skipped += 1;
        continue;
      }
      try {
        // AI 规则会在这里重新向宿主登记一次任务（宿主任务 id 不可迁移）。
        await createRule(item);
        imported += 1;
      } catch (error) {
        failed += 1;
        log("导入规则失败 " + item.id + "：" + (error && (error as Error).message));
      }
    }
    return {
      ok: failed === 0,
      imported,
      skipped,
      failed,
      builtinApplied,
      message: failed ? failed + " 条规则导入失败" : "",
    };
  }

  function registerBuiltin(input: {
    domainId: string;
    domainVersion: string;
    decls: unknown;
    subscriptions?: any[];
  }): BuiltinRegisterResult {
    const out = registerBuiltinRules({
      db,
      domainId: input.domainId,
      domainVersion: input.domainVersion,
      decls: input.decls,
      subscriptions: input.subscriptions,
      log,
      now: nowFn,
    });
    const applied = applyPendingOverrides(db, input.domainId, nowFn);
    if (applied) log("内置规则的用户覆盖已生效", input.domainId, applied);
    if (out.registered.length) log("内置自动化规则已注册", input.domainId, out.registered.join(","));
    if (out.paused.length) log("内置自动化规则声明已消失，已停用", input.domainId, out.paused.join(","));
    return out;
  }

  function unregisterBuiltin(domainId: string): void {
    unregisterBuiltinRules(db, domainId, nowFn);
  }

  return {
    config,
    saveConfig,
    registerBuiltin,
    unregisterBuiltin,
    builtinCount: (domainId: string) => countBuiltinRules(db, domainId),
    getRule,
    listRules,
    createRule,
    updateRule,
    deleteRule,
    runRule,
    runList,
    runGet,
    stats,
    tick,
    onEvent,
    start,
    stop,
    exportData,
    importData,
    listRulesLive: () => agentRules.listRulesLive(),
    agentStatus: () => agentRules.agentStatus(),
    agentHistory: (scheduleId: any, limit?: any, before?: any) =>
      agentRules.agentHistory(scheduleId, limit, before),
  };
}
