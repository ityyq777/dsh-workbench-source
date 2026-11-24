/**
 * 时区与每日触发时间计算；不引第三方依赖。
 *
 * 职责：把「某时区的年月日时分秒」与 UTC 毫秒互转，并计算严格晚于 now 的
 * 下一次每日触发时间（支持 1(周一)..7(周日) 的星期过滤）。
 */

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function formatter(tz: string): Intl.DateTimeFormat {
  let cached = formatterCache.get(tz);
  if (!cached) {
    cached = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    formatterCache.set(tz, cached);
  }
  return cached;
}

/** 某一时刻在指定时区下的日期时间分量。 */
export interface ZoneParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/** UTC 毫秒 → 指定时区的日期时间分量。 */
export function zoneParts(ts: number, tz: string): ZoneParts {
  const parts = formatter(tz).formatToParts(new Date(ts));
  const out: Record<string, number> = {
    year: 0,
    month: 0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
  };
  for (const part of parts) if (part.type !== "literal") out[part.type] = Number(part.value);
  return out as unknown as ZoneParts;
}

function zoneOffset(ts: number, tz: string): number {
  const p = zoneParts(ts, tz);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - ts;
}

function zonedToUtc(year: number, month: number, day: number, hour: number, minute: number, tz: string): number {
  const target = Date.UTC(year, month - 1, day, hour, minute, 0);
  let guess = target;
  for (let i = 0; i < 3; i += 1) {
    const offset = zoneOffset(guess, tz);
    const next = target - offset;
    if (next === guess) break;
    guess = next;
  }
  return guess;
}

/** ISO 星期：1=周一 … 7=周日。 */
export function weekdayOf(year: number, month: number, day: number): number {
  const d = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return ((d + 6) % 7) + 1;
}

/** 返回严格大于 now 的下一次每日触发时间；weekdays 为 1(周一)..7(周日)。 */
export function nextDailyAt(
  nowMs: number,
  time: string,
  tz: string,
  weekdays?: number[] | null,
): number {
  const [hour, minute] = String(time).split(":").map(Number);
  const allowed = Array.isArray(weekdays) && weekdays.length ? new Set(weekdays.map(Number)) : null;
  for (let i = 0; i < 9; i += 1) {
    const dayTs = nowMs + i * 86400000;
    const p = zoneParts(dayTs, tz);
    const wd = weekdayOf(p.year, p.month, p.day);
    if (allowed && !allowed.has(wd)) continue;
    const candidate = zonedToUtc(p.year, p.month, p.day, hour, minute, tz);
    if (candidate > nowMs) return candidate;
  }
  return nowMs + 86400000;
}

/** 时区是否被运行时接受。 */
export function validTimeZone(tz: string): boolean {
  try {
    formatter(String(tz));
    return true;
  } catch {
    return false;
  }
}

/** 本地时间文本：YYYY-MM-DD HH:mm（用于展示与日志）。 */
export function localTimeText(ts: number, tz: string): string {
  const p = zoneParts(ts, tz);
  const pad = (n: number) => String(n).padStart(2, "0");
  return p.year + "-" + pad(p.month) + "-" + pad(p.day) + " " + pad(p.hour) + ":" + pad(p.minute);
}
