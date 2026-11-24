/**
 * 自动化首页卡片的统计口径。
 *
 * 单独成文件的原因：统计要同时读「库里的用户规则」与「内存注册表里的内置规则」，
 * 两套来源合并后字段较多，放在 engine.ts 里会把引擎撑过 600 行。
 *
 * 口径要点：
 *  - total / enabled 把内置规则一起算进去，卡片数字才与列表对得上；
 *  - 来源拆分按 `origin`：用户自定义读库，插件内置读内存；
 *  - 内置规则的状态（已更新 / 已不再声明 / 插件已卸载）按注册表现算。
 */

import type { AutomationRule } from "./db.js";
import { builtinStateOf } from "./builtin.js";
import { checkAction } from "./whitelist.js";
import * as registry from "./registry.js";

/** 首页卡片统计。泛型参数是调用方自己的配置类型（只要求带 allowedActions）。 */
export interface AutomationStats<TConfig extends { allowedActions: string[] } = { allowedActions: string[] }> {
  total: number;
  enabled: number;
  today: Record<string, number>;
  config: TConfig;
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

export function computeStats<TConfig extends { allowedActions: string[] }>(input: {
  db: any;
  now: () => number;
  config: () => TConfig;
  hasDomain: (domainId: string) => boolean;
}): AutomationStats<TConfig> {
  const { db, now, config, hasDomain } = input;
  const builtinAll = registry.listRules();
  const total =
    db.prepare("SELECT COUNT(*) AS n FROM automation_rule WHERE deleted_at IS NULL").get().n + builtinAll.length;
  const enabled =
    db.prepare("SELECT COUNT(*) AS n FROM automation_rule WHERE deleted_at IS NULL AND enabled=1").get().n +
    builtinAll.filter((rule: AutomationRule) => rule.enabled).length;
  const today = now() - 86400000;
  const runs = db.prepare("SELECT status, COUNT(*) AS n FROM automation_run WHERE started_at>=? GROUP BY status").all(today);
  const map: Record<string, number> = {};
  for (const row of runs) map[row.status] = row.n;
  const cfg = config();
  // 用户规则里引用了白名单外的 action：页面要提示「有规则已失效」。
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
  const userRules = db
    .prepare("SELECT COUNT(*) AS n FROM automation_rule WHERE deleted_at IS NULL AND origin='user'")
    .get().n;
  let builtinEnabled = 0;
  let builtinDisabled = 0;
  let builtinStale = 0;
  let builtinUninstalled = 0;
  for (const rule of builtinAll) {
    const state = builtinStateOf(rule, hasDomain);
    if (state === "stale") builtinStale += 1;
    else if (state === "uninstalled") builtinUninstalled += 1;
    else if (rule.enabled) builtinEnabled += 1;
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
    builtinRules: builtinAll.length,
    builtinEnabled,
    builtinDisabled,
    builtinStale,
    builtinUninstalled,
  };
}
