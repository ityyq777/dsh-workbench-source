/**
 * 自动化引擎（宿主内置模块）统一出口。
 *
 * 原先由 packages/addons/automation 插件提供的服务端能力现在归宿主：
 * 规则表仍由 core schema 建，action 调用与宿主 schedule 服务由调用方注入。
 */

export {
  createAutomation,
  type AutomationConfig,
  type AutomationEngine,
  type AutomationEngineOptions,
  type AutomationImportResult,
  type AutomationRuleWithLastRun,
  type AutomationStats,
  type RunRuleResult,
} from "./engine.js";

export {
  registerAutomationActions,
  AUTOMATION_DOMAIN,
  type AutomationActionApi,
  type AutomationActionMeta,
} from "./actions.js";

export {
  setClock,
  bindClock,
  now,
  newId,
  parseJson,
  tx,
  ruleRow,
  runRow,
  metaGet,
  metaSet,
  type AutomationRule,
  type AutomationRun,
} from "./db.js";

export {
  zoneParts,
  weekdayOf,
  nextDailyAt,
  validTimeZone,
  localTimeText,
} from "./time.js";

export {
  DENIED,
  DENIED_PATTERNS,
  isDenied,
  validActionName,
  normalizeAllowedList,
  checkAction,
} from "./whitelist.js";

export {
  pickPath,
  render,
  conditionPass,
  normalizeTrigger,
  normalizeCondition,
  normalizeAction,
  nextAt,
  bad,
  plainObject,
  type NormalizedTrigger,
  type NormalizedCondition,
  type NormalizedAction,
} from "./rule.js";

export {
  createActionExecutor,
  type ActionExecutor,
  type ActionExecutorConfig,
  type ActionExecutorDeps,
  type ActionExecuteResult,
  type InvokeFn,
} from "./exec-action.js";

export {
  MAX_PROMPT,
  MAX_TITLE,
  recordSummary,
  createAgentBridge,
  type AgentBridge,
  type AgentSummary,
  type ScheduleEntry,
  type ScheduleHistoryPage,
  type ScheduleRecord,
  type ScheduleService,
  type ScheduleTarget,
  type ScheduleTiming,
} from "./agent-bridge.js";

export {
  TIMING_KINDS,
  TARGET_KINDS,
  normalizeTiming,
  normalizeTarget,
  normalizeAgent,
  createAgentRules,
  type AgentRulesDeps,
} from "./exec-agent.js";
