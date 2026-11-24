/**
 * 纯规则计算：字段取值、参数模板替换、条件判断，以及创建/更新规则时的
 * 触发、条件、action 参数校验与下次运行时间计算。
 *
 * 本模块不碰数据库、不发请求，便于单独测试；SQL 与执行流程在 engine /
 * exec-action 中。
 */

import { nextDailyAt, validTimeZone } from "./time.js";
import { checkAction } from "./whitelist.js";

/** 支持的条件运算符。 */
const OPS = new Set(["eq", "neq", "contains", "gt", "lt"]);

const SEGMENT = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** 400 错误：带 status 让宿主 HTTP 层按业务错误返回。 */
export function bad(message: string): Error & { status: number } {
  const error = new Error(message) as Error & { status: number };
  error.status = 400;
  return error;
}

/** 是否普通对象（排除 null、数组）。 */
export function plainObject(value: unknown): boolean {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** 字段路径：最多 3 段，每段为标识符，禁止原型链关键字。 */
function assertPath(path: unknown): string[] {
  const text = String(path || "").trim();
  const parts = text.split(".");
  if (
    !text ||
    parts.length > 3 ||
    parts.some((p) => !SEGMENT.test(p) || p === "__proto__" || p === "prototype" || p === "constructor")
  ) {
    throw bad("字段路径不合法：" + text);
  }
  return parts;
}

/** 按 a.b.c 读取嵌套字段；不存在返回 undefined（不会沿原型链取）。 */
export function pickPath(root: any, path: unknown): any {
  const parts = assertPath(path);
  let cur = root;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    if (!Object.prototype.hasOwnProperty.call(cur, part)) return undefined;
    cur = cur[part];
  }
  return cur;
}

/** 参数模板替换：字符串里的 {{a.b}} 从 context 取值；数组/对象递归，深度受 50 限制。 */
export function render(value: any, context: any): any {
  if (typeof value === "string") {
    return value.replace(/\{\{\s*([A-Za-z0-9_.]+)\s*\}\}/g, (_: string, path: string) => {
      const got = pickPath(context, path);
      if (got == null) return "";
      return typeof got === "object" ? JSON.stringify(got).slice(0, 2000) : String(got);
    });
  }
  if (Array.isArray(value)) return value.slice(0, 50).map((item) => render(item, context));
  if (plainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value).slice(0, 50)) {
      if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
      out[key] = render((value as any)[key], context);
    }
    return out;
  }
  return value;
}

/** 条件判断；没有条件视为通过，条件结构非法视为不通过。 */
export function conditionPass(condition: any, context: any): boolean {
  if (!condition) return true;
  if (!plainObject(condition) || !condition.field) return false;
  if (!OPS.has(condition.op)) return false;
  const left = pickPath(context, condition.field);
  const right = condition.value;
  if (condition.op === "eq") return left === right;
  if (condition.op === "neq") return left !== right;
  if (condition.op === "contains")
    return String(left == null ? "" : left).includes(String(right == null ? "" : right));
  if (right == null || left == null) return false;
  if (condition.op === "gt") return Number(left) > Number(right);
  return Number(left) < Number(right);
}

/** 规范化后的触发配置。 */
export interface NormalizedTrigger {
  triggerType: "schedule" | "event" | "manual";
  config: any;
}

/** 规范化后的条件。 */
export interface NormalizedCondition {
  field: string;
  op: string;
  value: any;
}

/** 规范化后的 action 调用。 */
export interface NormalizedAction {
  action: string;
  actionArgs: Record<string, unknown>;
}

/** 校验并规范化触发方式：interval / dailyAt / event / manual。 */
export function normalizeTrigger(input: any): NormalizedTrigger {
  const config = plainObject(input.triggerConfig) ? input.triggerConfig : {};
  const kind = config.kind || input.triggerType || "manual";
  if (kind === "interval") {
    const every = Number(config.everyMinutes);
    if (!Number.isInteger(every) || every < 1 || every > 10080) throw bad("间隔需为 1–10080 分钟");
    return { triggerType: "schedule", config: { kind: "interval", everyMinutes: every } };
  }
  if (kind === "dailyAt") {
    const time = String(config.time || "");
    if (!/^\d{2}:\d{2}$/.test(time)) throw bad("每日时间格式应为 HH:MM");
    const [h, m] = time.split(":").map(Number);
    if (h > 23 || m > 59) throw bad("每日时间不合法");
    const tz = String(config.tz || "Asia/Shanghai");
    if (!validTimeZone(tz)) throw bad("时区不合法：" + tz);
    const weekdays =
      Array.isArray(config.weekdays) && config.weekdays.length
        ? config.weekdays.map(Number)
        : [1, 2, 3, 4, 5, 6, 7];
    if (weekdays.some((d: number) => !Number.isInteger(d) || d < 1 || d > 7)) throw bad("weekdays 需为 1–7");
    return { triggerType: "schedule", config: { kind: "dailyAt", time, tz, weekdays } };
  }
  if (kind === "event") {
    const domainId = String(config.domainId || "");
    const event = String(config.event || "");
    if (!domainId || !event) throw bad("事件规则需要 domainId 与 event");
    return { triggerType: "event", config: { kind: "event", domainId, event } };
  }
  if (kind === "manual") return { triggerType: "manual", config: { kind: "manual" } };
  throw bad("未知触发类型：" + kind);
}

/** 校验并规范化条件；空值返回 null，字符串按 JSON 解析。 */
export function normalizeCondition(input: any): NormalizedCondition | null {
  let raw = input;
  if (raw == null || raw === "") return null;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    try {
      raw = JSON.parse(trimmed);
    } catch {
      throw bad("条件必须是 JSON 对象");
    }
  }
  if (!plainObject(raw) || !raw.field || !OPS.has(raw.op)) throw bad("条件需要 field 与 op(eq/neq/contains/gt/lt)");
  assertPath(raw.field);
  return { field: String(raw.field), op: String(raw.op), value: raw.value };
}

/** 校验 action 是否在白名单内，并检查参数对象与 20KB 上限。 */
export function normalizeAction(name: unknown, args: unknown, allowed: unknown): NormalizedAction {
  const action = String(name || "").trim();
  const problem = checkAction(action, allowed);
  if (problem) throw bad(problem);
  const actionArgs = args == null ? {} : args;
  if (!plainObject(actionArgs)) throw bad("actionArgs 必须是对象");
  const json = JSON.stringify(actionArgs);
  if (json.length > 20000) throw bad("actionArgs 超过 20KB");
  return { action, actionArgs: actionArgs as Record<string, unknown> };
}

/** 计算下次运行时间；事件/手动触发返回 null。 */
export function nextAt(triggerType: string, config: any, from: number): number | null {
  if (triggerType === "schedule") {
    if (config.kind === "interval") return from + config.everyMinutes * 60000;
    if (config.kind === "dailyAt") return nextDailyAt(from, config.time, config.tz, config.weekdays);
  }
  return null;
}
