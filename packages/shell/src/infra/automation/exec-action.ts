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
      "INSERT INTO automation_run(id,rule_id,trigger,status,started_at,finished_at,result,error) VALUES(?,?,?,?,?,?,?,?)",
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
    if (status === "skipped") {
      db.prepare("UPDATE automation_rule SET last_run_at=?, last_status=? WHERE id=?").run(
        finished,
        status,
        rule.id,
      );
      return;
    }
    const errorInc = status === "error" ? 1 : 0;
    db.prepare(
      "UPDATE automation_rule SET last_run_at=?, last_status=?, run_count=run_count+1, error_count=error_count+? WHERE id=?",
    ).run(finished, status, errorInc, rule.id);
  }

  /** 定时触发后把下一次运行时间推到未来。 */
  function setNext(rule: AutomationRule): void {
    if (rule.triggerType !== "schedule") return;
    db.prepare("UPDATE automation_rule SET next_run_at=? WHERE id=?").run(
      nextAt(rule.triggerType, rule.triggerConfig, now()),
      rule.id,
    );
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
      .prepare("SELECT COUNT(*) AS n FROM automation_run WHERE rule_id=? AND started_at>=? AND status!='skipped'")
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
    // 执行时复核：配置收紧后，老规则立即停跑而不是继续调用。
    const allowedNow = config().allowedActions;
    if (checkAction(rule.actionName, allowedNow)) {
      record(rule, trigger, "skipped", "", "action 未启用：" + rule.actionName, now());
      if (trigger === "schedule") setNext(rule);
      return { skipped: true, reason: "disabled" };
    }
    active += 1;
    const started = now();
    try {
      const args = render(rule.actionArgs, context);
      const response: any = await invoke(rule.actionName, args, "plugin");
      const result = JSON.stringify(response && response.result !== undefined ? response.result : response);
      record(rule, trigger, "ok", result, "", started);
      return { ok: true };
    } catch (error) {
      const message = String((error && (error as Error).message) || error);
      record(rule, trigger, "error", "", message, started);
      log("automation " + rule.name + " failed: " + message);
      return { ok: false, error: message };
    } finally {
      active -= 1;
      if (trigger === "schedule") setNext(rule);
    }
  }

  return { execute, activeCount: () => active };
}
