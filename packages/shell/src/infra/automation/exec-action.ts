/**
 * execMode=action 的执行：条件、频率、并发三道闸门通过后，把 actionArgs
 * 做模板替换并调用宿主 action（固定 plugin 来源），最后落运行记录。
 *
 * 只依赖注入进来的 db / invoke / config / now，不直接 import 宿主模块。
 */

import type { ActionOrigin } from "@wb/sdk";
import { newId, now as dbNow, type AutomationRule } from "./db.js";
import { conditionPass, nextAt, render } from "./rule.js";
import { checkAction } from "./whitelist.js";
import { actionBelongsTo } from "./builtin.js";

/** 引擎侧 action 调用入口：宿主 invoke 的等价物（plugin 来源）。 */
export type InvokeFn = (
  action: string,
  args: Record<string, unknown>,
  origin?: ActionOrigin,
) => unknown | Promise<unknown>;

/** 执行器需要的配置子集。 */
export interface ActionExecutorConfig {
  perHour: number;
  allowedActions: string[];
}

/** 执行器依赖。 */
export interface ActionExecutorDeps {
  db: any;
  invoke: InvokeFn;
  log?: (...args: unknown[]) => void;
  config: () => ActionExecutorConfig;
  /** 可选的本地时钟；缺省用 db.ts 的宿主时钟。 */
  now?: () => number;
  /** 内置规则豁免白名单，调用必须留痕 */
  audit?: (entry: { action: string; domain: string; ok: boolean; args?: unknown; error?: string }) => void;
  /**
   * 内置规则的状态回写：它们不落 host_automation_rule（定义在内存注册表），
   * 所以「最近运行/计数/下次时间」不能直接 UPDATE 表，交给引擎写内存。
   */
  track?: (rule: AutomationRule, patch: {
    lastRunAt?: number;
    lastStatus?: string;
    runCountDelta?: number;
    errorCountDelta?: number;
    nextRunAt?: number;
  }) => void;
}

/** 一次执行的返回值（与源码一致）。 */
export type ActionExecuteResult =
  | { skipped: true; reason: "condition" | "rate" | "busy" | "disabled" }
  | { ok: true }
  | { ok: false; error: string };

export interface ActionExecutor {
  execute(rule: AutomationRule, trigger: string, payload?: any): Promise<ActionExecuteResult>;
  /** 当前正在执行的 action 数量（上限 2），供测试/诊断。 */
  activeCount(): number;
}

export function createActionExecutor({
  db,
  invoke,
  log = () => {},
  config,
  now = dbNow,
  audit = () => {},
  track = () => {},
}: ActionExecutorDeps): ActionExecutor {
  /** 正在执行的 action 数；源码上限为 2。 */
  let active = 0;

  /** 写一条运行记录，并回写规则的最近状态/计数。 */
  function record(
    rule: AutomationRule,
    trigger: string,
    status: string,
    result: unknown,
    error: unknown,
    startedAt: number,
  ): void {
    const finished = now();
    db.prepare(
      "INSERT INTO host_automation_run(id,rule_id,trigger,status,started_at,finished_at,result,error) VALUES(?,?,?,?,?,?,?,?)",
    ).run(
      newId("run"),
      rule.id,
      trigger,
      status,
      startedAt,
      finished,
      String(result || "").slice(0, 4000),
      String(error || "").slice(0, 1000),
    );
    if (rule.origin === "plugin") {
      // 内置规则只在内存里记账；跳过的运行不算计数（与用户规则口径一致）。
      track(rule, {
        lastRunAt: finished,
        lastStatus: status,
        runCountDelta: status === "skipped" ? 0 : 1,
        errorCountDelta: status === "error" ? 1 : 0,
      });
      return;
    }
    if (status === "skipped") {
      db.prepare("UPDATE host_automation_rule SET last_run_at=?, last_status=? WHERE id=?").run(
        finished,
        status,
        rule.id,
      );
      return;
    }
    const errorInc = status === "error" ? 1 : 0;
    db.prepare(
      "UPDATE host_automation_rule SET last_run_at=?, last_status=?, run_count=run_count+1, error_count=error_count+? WHERE id=?",
    ).run(finished, status, errorInc, rule.id);
  }

  /** 定时触发后把下一次运行时间推到未来。 */
  function setNext(rule: AutomationRule): void {
    if (rule.triggerType !== "schedule") return;
    const next = nextAt(rule.triggerType, rule.triggerConfig, now());
    if (rule.origin === "plugin") {
      track(rule, { nextRunAt: Number(next) || 0 });
      return;
    }
    db.prepare("UPDATE host_automation_rule SET next_run_at=? WHERE id=?").run(next, rule.id);
  }

  async function execute(rule: AutomationRule, trigger: string, payload?: any): Promise<ActionExecuteResult> {
    const context = {
      event: payload || {},
      item: (payload && payload.item) || {},
      rule: { id: rule.id, name: rule.name },
      now: now(),
    };
    if (!conditionPass(rule.condition, context)) {
      record(rule, trigger, "skipped", "", "条件不满足", now());
      if (trigger === "schedule") setNext(rule);
      return { skipped: true, reason: "condition" };
    }
    const since = now() - 3600000;
    const used = db
      .prepare("SELECT COUNT(*) AS n FROM host_automation_run WHERE rule_id=? AND started_at>=? AND status!='skipped'")
      .get(rule.id, since).n;
    if (used >= config().perHour) {
      record(rule, trigger, "skipped", "", "超过每小时上限", now());
      if (trigger === "schedule") setNext(rule);
      return { skipped: true, reason: "rate" };
    }
    if (active >= 2) {
      record(rule, trigger, "skipped", "", "并发已满", now());
      if (trigger === "schedule") setNext(rule);
      return { skipped: true, reason: "busy" };
    }
    // 内置规则：只允许调声明方本域 action（注册时已校验，这里再兜一道），
    // 且豁免用户白名单——等价于插件调用自己，调用另记审计。
    if (rule.origin === "plugin") {
      if (!actionBelongsTo(rule.ownerDomain, rule.actionName)) {
        record(rule, trigger, "skipped", "", "内置规则跨域调用被拒绝：" + rule.actionName, now());
        if (trigger === "schedule") setNext(rule);
        return { skipped: true, reason: "disabled" };
      }
    } else {
      // 执行时复核：配置收紧后，老规则立即停跑而不是继续调用。
      const allowedNow = config().allowedActions;
      if (checkAction(rule.actionName, allowedNow)) {
        record(rule, trigger, "skipped", "", "action 未启用：" + rule.actionName, now());
        if (trigger === "schedule") setNext(rule);
        return { skipped: true, reason: "disabled" };
      }
    }
    active += 1;
    const started = now();
    try {
      const args = render(rule.actionArgs, context);
      const response: any = await invoke(rule.actionName, args, "plugin");
      const result = JSON.stringify(response && response.result !== undefined ? response.result : response);
      record(rule, trigger, "ok", result, "", started);
      if (rule.origin === "plugin") {
        audit({ action: rule.actionName, domain: rule.ownerDomain, ok: true, args });
      }
      return { ok: true };
    } catch (error) {
      const message = String((error && (error as Error).message) || error);
      record(rule, trigger, "error", "", message, started);
      if (rule.origin === "plugin") {
        audit({ action: rule.actionName, domain: rule.ownerDomain, ok: false, args: rule.actionArgs, error: message });
      }
      log("automation " + rule.name + " failed: " + message);
      return { ok: false, error: message };
    } finally {
      active -= 1;
      if (trigger === "schedule") setNext(rule);
    }
  }

  return { execute, activeCount: () => active };
}
