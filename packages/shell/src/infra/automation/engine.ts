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
}

/** 导入结果。 */
export interface AutomationImportResult {
  ok: boolean;
  imported: number;
  skipped: number;
  failed: number;
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
}

export function createAutomation({
  db,
  invoke,
  log = () => {},
  getSchedule = () => null,
  now,
}: AutomationEngineOptions): AutomationEngine {
  let timer: ReturnType<typeof setInterval> | null = null;
  let ticking = false;
  const nowFn = now ?? dbNow;

  // 「交给 AI」执行方式：定时与投递交给宿主 schedule，本机只存表单与快照。
  const agent = createAgentBridge({ getSchedule, log });

  // execMode=action 的执行器（条件/频率/并发闸门 + 运行记录）。
  const actionExecutor = createActionExecutor({ db, invoke, log, config, now: nowFn });

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
    return row ? ruleRow(row) : null;
  }

  function listRules(): AutomationRuleWithLastRun[] {
    const rows = db
      .prepare("SELECT * FROM automation_rule WHERE deleted_at IS NULL ORDER BY updated_at DESC LIMIT 200")
      .all();
    return rows.map((row: any) => {
      const last = db
        .prepare("SELECT * FROM automation_run WHERE rule_id=? ORDER BY started_at DESC LIMIT 1")
        .get(row.id);
      return Object.assign(ruleRow(row), { lastRun: last ? runRow(last) : null });
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

  async function updateRule(input: any): Promise<AutomationRule | null> {
    const data = plainObject(input) ? input : {};
    const existing = getRule(data.id);
    if (!existing) throw bad("规则不存在");
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
    return {
      total,
      enabled,
      today: map,
      config: cfg,
      staleCount: stale,
      agentRules: agentRuleCount,
      agentEnabled,
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
      for (const row of due) await actionExecutor.execute(ruleRow(row), "schedule", { at: nowFn() });
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

  function exportData(): { rules: any[] } {
    return {
      rules: listRules().map((rule) => {
        // 宿主任务 id 只在本机有效，导出时去掉，导入时按表单重建。
        const { scheduleId, lastRun, rev, ...rest } = rule;
        return rest;
      }),
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
    let imported = 0;
    let skipped = 0;
    let failed = 0;
    for (const item of rules.slice(0, 500)) {
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
      message: failed ? failed + " 条规则导入失败" : "",
    };
  }

  return {
    config,
    saveConfig,
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
