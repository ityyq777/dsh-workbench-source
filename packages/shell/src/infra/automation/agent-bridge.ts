/**
 * 宿主 schedule 服务的桥接层（原 agent.js）。
 *
 * 只做三件事：把工作台的请求结构交给宿主、把宿主错误码翻成中文、
 * 把宿主记录整理成前端要展示的摘要。工作台不直接依赖 dsh-schedule 的实现，
 * 服务通过 createAgentBridge({ getSchedule }) 注入；宿主没加载时统一报错。
 */

import { bad, plainObject } from "./rule.js";

/** 提示词上限，超过直接报错而不是悄悄截断。 */
export const MAX_PROMPT = 4000;
/** 宿主任务标题上限（与 dsh-schedule 的 MAX_TITLE_LENGTH 一致）。 */
export const MAX_TITLE = 120;

/** 宿主错误码 → 中文说明。 */
const MESSAGES: Record<string, string> = {
  invalid_rule: "时间或目标不被宿主接受",
  invalid_prompt: "任务名称或提示词不被宿主接受",
  invalid_timing: "时间设置不被宿主接受",
  unsupported_timezone: "宿主不支持这个时区",
  subagent_session: "目标会话是子代理会话，不能作为投递目标",
  schedule_not_found: "宿主任务已不存在（可能已在「自动化任务」里删除）",
  schedule_conflict: "宿主任务刚被别处修改，请刷新后重试",
  schedule_execution_pending: "该任务正在执行，稍后再试",
  invalid_input: "输入不合法",
};

/** 宿主时间设置请求结构（snake_case，与 dsh-schedule 一致）。 */
export interface ScheduleTiming {
  kind: string;
  [key: string]: unknown;
}

/** 宿主投递目标请求结构。 */
export interface ScheduleTarget {
  kind: string;
  [key: string]: unknown;
}

/** 宿主任务记录（只声明本模块读到的字段，其余原样透传）。 */
export interface ScheduleRecord {
  id?: string;
  title?: string;
  prompt?: string;
  kind?: string;
  scheduledAt?: string;
  [key: string]: unknown;
}

/** 宿主 catalog / create / edit 返回的条目。 */
export interface ScheduleEntry {
  record?: ScheduleRecord;
  status?: string;
  target?: unknown;
  lastDelivery?: { deliveredAt?: string; [key: string]: unknown } | null;
  executionActive?: boolean;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface ScheduleHistoryPage {
  id?: string;
  records?: unknown[];
  earlierRecordsUnavailable?: boolean;
  earlierRecordsPruned?: boolean;
  [key: string]: unknown;
}

/**
 * 宿主 schedule 服务接口（注入）。
 * 与 dsh-schedule 的公开方法保持一致；工作台不依赖它的实现。
 */
export interface ScheduleService {
  create(input: {
    title: string;
    prompt: string;
    timing: ScheduleTiming;
    target: ScheduleTarget;
  }): ScheduleEntry | Promise<ScheduleEntry>;
  edit(input: { id: string; action: "update" | "delete"; patch?: Record<string, unknown> }): any;
  run(input: { id: string }): any;
  catalog(): ScheduleEntry[] | Promise<ScheduleEntry[]>;
  history(input: { id: string; limit: number; before?: string }): ScheduleHistoryPage | Promise<ScheduleHistoryPage>;
  deliveryLimits?(): { newSessionIntervalSeconds?: number; [key: string]: unknown };
}

function text(value: unknown, max: number): string {
  const out = String(value == null ? "" : value).trim();
  return max > 0 ? out.slice(0, max) : out;
}

function positiveInt(value: unknown, fallback: number): number {
  const num = Number(value);
  return Number.isSafeInteger(num) && num > 0 ? num : fallback;
}

/** 前端要展示的宿主任务摘要。 */
export interface AgentSummary {
  scheduleId: string;
  title: string;
  prompt: string;
  kind: string;
  timing: any;
  status: string;
  target: unknown;
  scheduledAt: string;
  lastDeliveryAt: string;
  executionActive: boolean;
  updatedAt: string;
  missing: false;
}

/** 把宿主记录翻成前端要展示的摘要（时间描述由前端按 record 拼）。 */
export function recordSummary(entry: any): AgentSummary | null {
  if (!plainObject(entry)) return null;
  const record = plainObject(entry.record) ? entry.record : {};
  return {
    scheduleId: record.id || "",
    title: record.title || "",
    prompt: record.prompt || "",
    kind: record.kind || "",
    timing: record,
    status: entry.status || "",
    target: entry.target || null,
    scheduledAt: record.scheduledAt || "",
    lastDeliveryAt: entry.lastDelivery && entry.lastDelivery.deliveredAt ? entry.lastDelivery.deliveredAt : "",
    executionActive: Boolean(entry.executionActive),
    updatedAt: entry.updatedAt || "",
    missing: false,
  };
}

/** agent bridge 的公开方法。 */
export interface AgentBridge {
  available(): boolean;
  limits(): {
    available: true;
    minEverySeconds: number;
    maxTitle: number;
    maxPrompt: number;
    newSessionIntervalSeconds: number;
  };
  create(input: {
    title: string;
    prompt: string;
    timing: ScheduleTiming;
    target: ScheduleTarget;
  }): Promise<ScheduleEntry>;
  update(scheduleId: string, patch: Record<string, unknown>): Promise<any>;
  remove(scheduleId: string): Promise<{ removed: boolean }>;
  run(scheduleId: string): Promise<{ status: "missing" | "pending" | "delivered"; entry?: any }>;
  catalog(): Promise<{ ok: boolean; error?: string; map: Map<string, AgentSummary> }>;
  history(
    scheduleId: string,
    limit: unknown,
    before?: string,
  ): Promise<{
    id: string;
    records: unknown[];
    earlierRecordsUnavailable: boolean;
    earlierRecordsPruned: boolean;
  }>;
}

/**
 * 宿主 schedule 桥接。所有方法在宿主没加载 schedule 时统一报错，
 * 由上层决定是拒绝请求（改写规则）还是降级（只读展示）。
 */
export function createAgentBridge({
  getSchedule,
  log = () => {},
}: {
  getSchedule: () => ScheduleService | null | undefined;
  log?: (...args: unknown[]) => void;
}): AgentBridge {
  function service(): ScheduleService {
    const schedule = getSchedule();
    if (!schedule || typeof schedule.create !== "function") {
      throw bad("当前宿主没有加载「自动化任务」服务，无法使用「交给 AI」执行方式（需要 DSH 内置 schedule 插件）");
    }
    return schedule;
  }

  /** 宿主异常 → 中文 400；已经是本模块抛出的错误原样透传。 */
  function wrap(error: unknown): never {
    if (error && Number((error as any).status) > 0) throw error;
    const code = text((error as any) && (error as any).code, 40);
    const known = MESSAGES[code];
    if (!known) throw error;
    const detail = text((error as any) && (error as any).message, 300);
    log("agent schedule " + code + ": " + detail);
    throw bad(known + (detail ? "：" + detail : ""));
  }

  async function call<T>(fn: () => T | Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      return wrap(error);
    }
  }

  return {
    available(): boolean {
      const schedule = getSchedule();
      return Boolean(schedule && typeof schedule.create === "function");
    },
    limits() {
      const schedule = service();
      let newSessionIntervalSeconds = 60;
      try {
        const limits = schedule.deliveryLimits?.();
        if (limits && Number(limits.newSessionIntervalSeconds) > 0) {
          newSessionIntervalSeconds = Number(limits.newSessionIntervalSeconds);
        }
      } catch (error) {
        log("agent deliveryLimits failed: " + ((error as Error) && (error as Error).message));
      }
      return {
        available: true as const,
        minEverySeconds: 60,
        maxTitle: MAX_TITLE,
        maxPrompt: MAX_PROMPT,
        newSessionIntervalSeconds,
      };
    },
    async create(input) {
      const schedule = service();
      return call(() =>
        schedule.create({ title: input.title, prompt: input.prompt, timing: input.timing, target: input.target }),
      );
    },
    async update(scheduleId, patch) {
      const schedule = service();
      const out: any = await call(() => schedule.edit({ id: scheduleId, action: "update", patch }));
      if (out && out.code === "schedule_not_found") throw bad(MESSAGES.schedule_not_found);
      if (out && out.code === "schedule_conflict") throw bad(MESSAGES.schedule_conflict);
      return out;
    },
    async remove(scheduleId) {
      const schedule = service();
      const out: any = await call(() => schedule.edit({ id: scheduleId, action: "delete" }));
      if (out && out.code === "schedule_not_found") return { removed: false };
      return { removed: true };
    },
    async run(scheduleId) {
      const schedule = service();
      const out: any = await call(() => schedule.run({ id: scheduleId }));
      if (out && out.code === "schedule_not_found") return { status: "missing" };
      if (out && out.code === "schedule_execution_pending") return { status: "pending" };
      return { status: "delivered", entry: out };
    },
    /** 全量宿主任务，按 id 建索引；失败返回 {ok:false,error} 而不是抛错。 */
    async catalog() {
      const schedule = service();
      try {
        const entries = await schedule.catalog();
        const map = new Map<string, AgentSummary>();
        for (const entry of Array.isArray(entries) ? entries : []) {
          const summary = recordSummary(entry);
          if (summary && summary.scheduleId) map.set(summary.scheduleId, summary);
        }
        return { ok: true, map };
      } catch (error) {
        log("agent catalog failed: " + ((error as Error) && (error as Error).message));
        return {
          ok: false,
          error: text((error as Error) && (error as Error).message, 300),
          map: new Map<string, AgentSummary>(),
        };
      }
    },
    async history(scheduleId, limit, before) {
      const schedule = service();
      const request: { id: string; limit: number; before?: string } = {
        id: scheduleId,
        limit: Math.min(Math.max(positiveInt(limit, 20), 1), 100),
      };
      if (before) request.before = before;
      const page = await call(() => schedule.history(request));
      return {
        id: (page && page.id) || scheduleId,
        records: Array.isArray(page && page.records) ? page!.records! : [],
        earlierRecordsUnavailable: Boolean(page && page.earlierRecordsUnavailable),
        earlierRecordsPruned: Boolean(page && page.earlierRecordsPruned),
      };
    },
  };
}
