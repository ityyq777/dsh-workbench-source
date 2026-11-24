/**
 * execMode=agent 的执行：「交给 AI」规则。
 *
 * 负责把表单输入规范化为宿主 ScheduleTiming / ScheduleTarget 请求结构，
 * 以及本地规则行与宿主任务之间的登记、对账与能力探测。
 *
 * 宿主 schedule 的适配与错误码翻译在 agent-bridge.ts；本模块只通过注入的
 * AgentBridge 调用，不直接 require 宿主模块。
 */

import type { AutomationRule } from "./db.js";
import { newId, now as dbNow } from "./db.js";
import {
  MAX_PROMPT,
  type AgentBridge,
  type ScheduleRecord,
  type ScheduleTarget,
  type ScheduleTiming,
} from "./agent-bridge.js";
import { bad, plainObject } from "./rule.js";

/** 宿主支持且工作台表单开放的时间类型。 */
export const TIMING_KINDS = ["every", "daily", "weekly", "cron", "rrule", "at", "after"] as const;
/** 投递目标类型。 */
export const TARGET_KINDS = ["new_once", "new", "session"] as const;

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TZ_RE = /^(UTC|[A-Za-z][A-Za-z0-9_+-]*(?:\/[A-Za-z0-9_+-]+)+)$/;
const CRON_RE = /^\s*\S+\s+\S+\s+\S+\s+\S+\s+\S+\s*$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

function text(value: unknown, max: number): string {
  const out = String(value == null ? "" : value).trim();
  return max > 0 ? out.slice(0, max) : out;
}

function positiveInt(value: unknown, fallback: number): number {
  const num = Number(value);
  return Number.isSafeInteger(num) && num > 0 ? num : fallback;
}

/** 规范化时间设置，返回宿主 ScheduleTiming 请求结构（snake_case）。 */
export function normalizeTiming(raw: any): ScheduleTiming {
  if (!plainObject(raw)) throw bad("AI 规则需要填写时间设置");
  const kind = text(raw.kind, 16);
  if (!(TIMING_KINDS as readonly string[]).includes(kind)) throw bad("不支持的时间类型：" + (kind || "空"));
  if (kind === "every") {
    const seconds = positiveInt(raw.every_seconds, 0);
    if (seconds < 60) throw bad("间隔不能小于 1 分钟");
    if (seconds > 30 * 86400) throw bad("间隔不能超过 30 天");
    return { kind, every_seconds: seconds };
  }
  if (kind === "after") {
    const seconds = positiveInt(raw.after_seconds, 0);
    if (!seconds) throw bad("延迟秒数必须是正整数");
    if (seconds > 365 * 86400) throw bad("延迟不能超过一年");
    return { kind, after_seconds: seconds };
  }
  if (kind === "at") {
    const at = raw.at;
    if (typeof at === "string" && ISO_RE.test(at.trim())) return { kind, at: at.trim() };
    if (plainObject(at)) {
      const date = text(at.date, 10);
      const time = text(at.time, 8);
      const zone = text(at.time_zone, 64);
      if (!DATE_RE.test(date) || !TIME_RE.test(time) || !TZ_RE.test(zone)) {
        throw bad("一次性时间需要合法的日期、时间和时区");
      }
      return { kind, at: { date, time: time.length === 5 ? time + ":00" : time, time_zone: zone } };
    }
    throw bad("一次性时间需要 ISO 字符串或 {date,time,time_zone}");
  }
  if (kind === "daily") {
    const daily = plainObject(raw.daily) ? raw.daily : {};
    const time = text(daily.time, 8);
    const zone = text(daily.time_zone, 64);
    if (!TIME_RE.test(time) || !TZ_RE.test(zone)) throw bad("每天执行需要合法的 HH:MM 与时区");
    return { kind, daily: { time: time.length === 5 ? time + ":00" : time, time_zone: zone } };
  }
  if (kind === "weekly") {
    const weekly = plainObject(raw.weekly) ? raw.weekly : {};
    const time = text(weekly.time, 8);
    const zone = text(weekly.time_zone, 64);
    const days: number[] = Array.isArray(weekly.weekdays)
      ? Array.from(new Set<number>(weekly.weekdays.map((day: any) => Number(day))))
          .filter((day) => Number.isInteger(day) && day >= 1 && day <= 7)
          .sort((a, b) => a - b)
      : [];
    if (!TIME_RE.test(time) || !TZ_RE.test(zone)) throw bad("每周执行需要合法的 HH:MM 与时区");
    if (!days.length) throw bad("每周执行至少选择一个星期");
    return {
      kind,
      weekly: { time: time.length === 5 ? time + ":00" : time, time_zone: zone, weekdays: days },
    };
  }
  if (kind === "cron") {
    const cron = plainObject(raw.cron) ? raw.cron : {};
    const expression = text(cron.expression, 120);
    const zone = text(cron.time_zone, 64);
    if (!CRON_RE.test(expression)) throw bad("cron 需要 5 段表达式：分 时 日 月 周");
    if (!TZ_RE.test(zone)) throw bad("cron 需要合法时区");
    return { kind, cron: { expression: expression.replace(/\s+/g, " "), time_zone: zone } };
  }
  const rrule = text(raw.rrule, 2000);
  if (!/^DTSTART[^\n]*\nRRULE:/i.test(rrule.replace(/\r\n/g, "\n"))) {
    throw bad("rrule 需要一行 DTSTART 和一行 RRULE");
  }
  return { kind: "rrule", rrule: rrule.replace(/\r\n/g, "\n") };
}

/** 规范化投递目标，返回宿主 ScheduleTargetRequest。 */
export function normalizeTarget(raw: any): ScheduleTarget {
  if (raw == null || raw === "") return { kind: "new_once" };
  if (!plainObject(raw)) throw bad("投递目标格式不正确");
  const kind = text(raw.kind, 16) || "new_once";
  if (!(TARGET_KINDS as readonly string[]).includes(kind)) throw bad("不支持的投递目标：" + kind);
  if (kind === "session") {
    const sessionId = text(raw.sessionId, 200);
    if (!sessionId) throw bad("投递到已有会话需要填写会话 id");
    return { kind, sessionId };
  }
  const create = plainObject(raw.create) ? raw.create : {};
  const spec: Record<string, string> = {};
  const cwd = text(create.cwd, 500);
  const preset = text(create.agentPreset, 120);
  if (cwd) spec.cwd = cwd;
  if (preset) spec.agentPreset = preset;
  return Object.keys(spec).length ? { kind, create: spec } : { kind };
}

/** 校验一条 AI 规则的可编辑部分，返回 {prompt, timing, target}。 */
export function normalizeAgent(raw: any): {
  prompt: string;
  timing: ScheduleTiming;
  target: ScheduleTarget;
} {
  if (!plainObject(raw)) throw bad("AI 规则需要提示词与时间设置");
  const prompt = text(raw.prompt, 0);
  if (!prompt) throw bad("AI 规则需要填写提示词（投递给 agent 的指令）");
  if (prompt.length > MAX_PROMPT) throw bad("提示词不能超过 " + MAX_PROMPT + " 字");
  return { prompt, timing: normalizeTiming(raw.timing), target: normalizeTarget(raw.target) };
}

/** 「交给 AI」规则模块依赖。 */
export interface AgentRulesDeps {
  db: any;
  agent: AgentBridge;
  log?: (...args: unknown[]) => void;
  getRule: (id: unknown) => AutomationRule | null;
  listRules: () => any[];
  /** 可选的本地时钟；缺省用 db.ts 的宿主时钟。 */
  now?: () => number;
}

/**
 * 「交给 AI」规则：宿主任务的登记、对账与能力探测；本地表只存快照。
 */
export function createAgentRules({ db, agent, log = () => {}, getRule, listRules, now = dbNow }: AgentRulesDeps) {
  /** 拉一次宿主 catalog，把状态与快照回写到规则；不动 updated_at，避免打乱本机排序。 */
  async function listRulesLive() {
    const rules = listRules();
    if (!rules.some((rule) => rule.execMode === "agent" && rule.scheduleId)) return rules;
    const catalog = await agent.catalog();
    if (!catalog.ok) return rules.map((rule) => Object.assign(rule, { agentOnline: false }));
    return rules.map((rule) => {
      if (rule.execMode !== "agent") return rule;
      const live = catalog.map.get(rule.scheduleId);
      if (!live) {
        db.prepare("UPDATE automation_rule SET enabled=0, next_run_at=NULL WHERE id=? AND enabled=1").run(rule.id);
        return Object.assign(rule, {
          enabled: false,
          scheduleMissing: true,
          agentOnline: true,
          scheduleStatus: "missing",
        });
      }
      const prev = plainObject(rule.agent) ? rule.agent : {};
      const snapshot = {
        ...prev,
        title: live.title || rule.name,
        prompt: live.prompt || prev.prompt || "",
        kind: live.kind || prev.kind || "",
        timing: prev.timing || null,
        target: live.target || prev.target || { kind: "new_once" },
        status: live.status,
        scheduledAt: live.scheduledAt,
        lastDeliveryAt: live.lastDeliveryAt || "",
        executionActive: live.executionActive,
      };
      const nextRunAt = live.scheduledAt ? Date.parse(live.scheduledAt) || null : null;
      if (JSON.stringify(snapshot) !== JSON.stringify(prev) || rule.nextRunAt !== nextRunAt) {
        db.prepare("UPDATE automation_rule SET enabled=?, agent_json=?, next_run_at=? WHERE id=?").run(
          live.status === "active" ? 1 : 0,
          JSON.stringify(snapshot),
          nextRunAt,
          rule.id,
        );
      }
      return Object.assign(rule, {
        name: live.title || rule.name,
        enabled: live.status === "active",
        agent: snapshot,
        agentOnline: true,
        scheduleMissing: false,
        scheduleStatus: live.status,
        nextRunAt,
      });
    });
  }

  /** 新建「交给 AI」规则：先建宿主任务，再落本地行；本地失败则回滚宿主任务。 */
  async function createAgentRule(data: any, name: string) {
    const agentConfig = normalizeAgent(data.agent);
    const entry = await agent.create({
      title: name,
      prompt: agentConfig.prompt,
      timing: agentConfig.timing,
      target: agentConfig.target,
    });
    const record: ScheduleRecord = plainObject(entry && entry.record) ? entry.record! : {};
    const scheduleId = String(record.id || "");
    if (!scheduleId) throw bad("宿主没有返回任务 id，规则未保存");
    const status = String((entry && entry.status) || "active");
    const snapshot = {
      ...agentConfig,
      title: name,
      kind: record.kind || agentConfig.timing.kind,
      status,
      scheduledAt: record.scheduledAt || "",
      lastDeliveryAt: (entry && entry.lastDelivery && entry.lastDelivery.deliveredAt) || "",
      executionActive: Boolean(entry && entry.executionActive),
    };
    const nextRunAt = record.scheduledAt ? Date.parse(record.scheduledAt) || null : null;
    const id = newId("rule");
    const ts = now();
    try {
      db.prepare(
        "INSERT INTO automation_rule(id,name,enabled,exec_mode,agent_json,schedule_id,trigger_type,trigger_config,condition,action_name,action_args,next_run_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      ).run(
        id,
        name,
        status === "active" ? 1 : 0,
        "agent",
        JSON.stringify(snapshot),
        scheduleId,
        "agent",
        JSON.stringify({ kind: "agent", timing: agentConfig.timing, target: agentConfig.target }),
        "",
        "",
        "{}",
        nextRunAt,
        ts,
        ts,
      );
    } catch (error) {
      // 本地写失败就把刚建好的宿主任务删掉，避免留下看不见的孤儿任务。
      try {
        await agent.remove(scheduleId);
      } catch (cleanupError) {
        log("回滚宿主任务失败：" + ((cleanupError as Error) && (cleanupError as Error).message));
      }
      throw error;
    }
    return getRule(id);
  }

  /** 编辑「交给 AI」规则：只把真正变化的字段发成宿主 patch，空 patch 直接返回。 */
  async function updateAgentRule(existing: any, data: any, name: string) {
    if (!existing.scheduleId) throw bad("规则还没有关联宿主任务，请删除后重建");
    const prev = plainObject(existing.agent) ? existing.agent : {};
    const next = data.agent ? normalizeAgent(data.agent) : normalizeAgent(prev);
    const enabled = data.enabled == null ? existing.enabled : data.enabled !== false;
    const patch: Record<string, unknown> = {};
    if (name !== existing.name) patch.title = name;
    if (next.prompt !== prev.prompt) patch.prompt = next.prompt;
    if (JSON.stringify(next.timing) !== JSON.stringify(prev.timing)) patch.timing = next.timing;
    if (JSON.stringify(next.target) !== JSON.stringify(prev.target)) patch.target = next.target;
    if (enabled !== existing.enabled) patch.active = enabled;
    if (!Object.keys(patch).length) return existing;
    const out: any = await agent.update(existing.scheduleId, patch);
    const record = plainObject(out && out.record) ? out.record! : {};
    const status = String((out && out.status) || prev.status || "active");
    const snapshot = {
      ...prev,
      prompt: next.prompt,
      timing: next.timing,
      target: next.target,
      title: name,
      kind: record.kind || prev.kind || next.timing.kind,
      status,
      scheduledAt: record.scheduledAt || prev.scheduledAt || "",
      lastDeliveryAt: (out && out.lastDelivery && out.lastDelivery.deliveredAt) || prev.lastDeliveryAt || "",
      executionActive: Boolean(out && out.executionActive),
    };
    const nextRunAt = record.scheduledAt ? Date.parse(record.scheduledAt) || null : null;
    db.prepare(
      "UPDATE automation_rule SET name=?,enabled=?,agent_json=?,trigger_config=?,next_run_at=?,updated_at=?,rev=rev+1 WHERE id=?",
    ).run(
      name,
      status === "active" ? 1 : 0,
      JSON.stringify(snapshot),
      JSON.stringify({ kind: "agent", timing: snapshot.timing, target: snapshot.target }),
      nextRunAt,
      now(),
      existing.id,
    );
    return getRule(existing.id);
  }

  /** 宿主能力与「未纳入工作台」的任务：判断能不能用 AI 执行方式，并给出提示。 */
  async function agentStatus() {
    if (!agent.available()) {
      return {
        available: false,
        minEverySeconds: 60,
        maxTitle: 120,
        newSessionIntervalSeconds: 60,
        tasks: 0,
        orphans: [] as any[],
      };
    }
    let limits: any = { available: true, minEverySeconds: 60, maxTitle: 120, newSessionIntervalSeconds: 60 };
    try {
      limits = agent.limits();
    } catch (error) {
      log("读取宿主限制失败：" + ((error as Error) && (error as Error).message));
    }
    const known = new Set(
      db
        .prepare(
          "SELECT schedule_id FROM automation_rule WHERE deleted_at IS NULL AND schedule_id IS NOT NULL AND schedule_id!=''",
        )
        .all()
        .map((row: any) => row.schedule_id),
    );
    const catalog = await agent.catalog();
    const orphans = catalog.ok
      ? [...catalog.map.values()]
          .filter((entry) => !known.has(entry.scheduleId))
          .slice(0, 50)
          .map((entry) => ({
            scheduleId: entry.scheduleId,
            title: entry.title,
            kind: entry.kind,
            status: entry.status,
            scheduledAt: entry.scheduledAt,
          }))
      : [];
    return { ...limits, tasks: catalog.ok ? catalog.map.size : 0, orphans };
  }

  function agentHistory(scheduleId: string, limit?: number, before?: string) {
    return agent.history(scheduleId, limit, before);
  }

  return { listRulesLive, createAgentRule, updateAgentRule, agentStatus, agentHistory };
}
