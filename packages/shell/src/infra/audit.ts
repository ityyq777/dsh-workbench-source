/**
 * 审计日志：本机行为账本（设计见 docs/specs/23-审计日志设计.md）。
 *
 * 采集点在宿主唯一的 action 分发函数 invoke()：业务 action 成功/失败各记一条；
 * 只读 action 默认不记；audit.* 自身不记（避免递归）。
 *
 * 三条硬约束：
 * 1. 审计写入失败绝不影响业务调用 —— record() 内部吞掉所有异常；
 * 2. 永不落明文敏感值 —— 键名命中密码/token/保险箱等规则时值替换为 ***；
 * 3. 不参与同步与备份 —— audit_log 是平台表，不登记进任何业务域的 tables。
 */
import type { DatabaseSync } from "node:sqlite";

export const AUDIT_LIMITS = {
  /** 保留期（天），可用 meta.audit.retentionDays 覆盖 */
  retentionDays: 90,
  /** 单字段文本上限 */
  maxText: 2000,
  /** 参数整体 JSON 上限 */
  maxArgs: 12_000,
  /** 结果摘要上限 */
  maxResult: 4_000,
  /** 默认页大小与上限 */
  pageSize: 50,
  maxPageSize: 200,
  /** 每写入多少条做一次惰性清理 */
  pruneEvery: 200,
};

/** 敏感键名：命中即脱敏。宁可多脱，不可漏脱。 */
const SECRET_KEY =
  /(pass(word|wd)?|pwd|token|secret|credential|authorization|cookie|api[_-]?key|access[_-]?key|private[_-]?key|vault|encrypted|seed[_-]?phrase)/i;

/** 只读 action：最后一段命中即视为读，默认不记。 */
const READ_SUFFIX = new Set([
  "list",
  "get",
  "search",
  "stats",
  "statsreport",
  "help",
  "report",
  "history",
  "changelog",
  "timeline",
  "timelinerefactor",
  "preview",
  "tree",
  "schema",
  "nav",
  "breakdown",
  "export",
  "data",
  "config",
  "configget",
  "view",
]);

/** 从参数里挑一个「目标」，让一行日志能被人快速定位到记录。 */
const TARGET_KEYS = [
  "id",
  "ids",
  "taskId",
  "siteId",
  "tagId",
  "nodeId",
  "tableId",
  "titleKey",
  "name",
  "title",
];

export interface AuditWriteInput {
  action: string;
  domain: string;
  actor: string;
  ok: boolean;
  error?: string | null;
  args?: unknown;
  result?: unknown;
  durationMs?: number;
  at?: number;
  /** 直接覆盖只读跳过逻辑（导入、迁移等需要强制留痕时用） */
  force?: boolean;
}

export interface AuditListQuery {
  action?: string;
  actionPrefix?: string;
  actor?: string;
  domain?: string;
  ok?: boolean | number | string;
  q?: string;
  target?: string;
  since?: number | string;
  until?: number | string;
  page?: number | string;
  pageSize?: number | string;
}

export interface AuditRow {
  id: number;
  at: number;
  actor: string;
  action: string;
  domain: string;
  ok: number;
  error: string | null;
  target: string | null;
  args: string | null;
  result: string | null;
  duration_ms: number;
}

export function isReadAction(action: string): boolean {
  const tail = String(action || "")
    .toLowerCase()
    .split(".")
    .pop() as string;
  return READ_SUFFIX.has(tail || "");
}

/** 递归脱敏：敏感键名换 ***，长字符串截断，深度/宽度封顶。 */
export function redactValue(value: unknown, depth = 0): unknown {
  if (depth > 6) return "[max-depth]";
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    return value.length > AUDIT_LIMITS.maxText
      ? value.slice(0, AUDIT_LIMITS.maxText) + "…(" + value.length + " chars)"
      : value;
  }
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "bigint") return String(value);
  if (typeof value === "function") return "[function]";
  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => redactValue(item, depth + 1));
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    let count = 0;
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (count++ >= 60) {
        out["…"] = "更多字段已省略";
        break;
      }
      out[key] = SECRET_KEY.test(key) ? "***" : redactValue(item, depth + 1);
    }
    return out;
  }
  return String(value);
}

/** 序列化脱敏后的值；超长时改为 truncated 包装，绝不写半截 JSON。 */
export function encodeAuditJson(value: unknown, limit = AUDIT_LIMITS.maxArgs): string | null {
  if (value === undefined) return null;
  let json: string;
  try {
    json = JSON.stringify(redactValue(value));
  } catch {
    return JSON.stringify("[unserializable]");
  }
  if (json === undefined || json === "null") return null;
  if (json.length <= limit) return json;
  return JSON.stringify({ truncated: true, chars: json.length, preview: json.slice(0, limit) });
}

export function auditTargetOf(args: unknown): string | null {
  if (!args || typeof args !== "object" || Array.isArray(args)) return null;
  const obj = args as Record<string, unknown>;
  for (const key of TARGET_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const value = obj[key];
    if (typeof value === "string" || typeof value === "number") {
      const text = String(value).trim();
      if (text) return key + "=" + text.slice(0, 120);
    }
    if (Array.isArray(value) && value.length) {
      const text = value
        .slice(0, 5)
        .map((x) => String(x))
        .join(",");
      if (text) return key + "=" + text.slice(0, 120);
    }
  }
  return null;
}

function getMeta(db: DatabaseSync, key: string): string {
  try {
    const row = db.prepare("SELECT v FROM meta WHERE k = ?").get(key) as { v?: string } | undefined;
    return row && row.v !== undefined && row.v !== null ? String(row.v) : "";
  } catch {
    return "";
  }
}

export function setAuditMeta(db: DatabaseSync, key: string, value: string): void {
  db.prepare(
    "INSERT INTO meta(k, v) VALUES(?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v",
  ).run(key, String(value));
}

/** 把毫秒时间戳或 YYYY-MM-DD 归一成毫秒；endOfDay 用于 until。 */
function toMillis(value: number | string | undefined, endOfDay = false): number | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const text = String(value).trim();
  if (/^\d+$/.test(text)) return Number(text);
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (dateOnly) {
    const ms = Date.UTC(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3]),
      endOfDay ? 23 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 999 : 0,
    );
    return Number.isFinite(ms) ? ms : null;
  }
  const parsed = Date.parse(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function clampInt(value: unknown, fallback: number, min: number, max: number): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function recordOf(row: AuditRow): Record<string, unknown> {
  return {
    id: row.id,
    at: row.at,
    time: new Date(Number(row.at)).toISOString(),
    actor: row.actor,
    action: row.action,
    domain: row.domain,
    ok: Number(row.ok) === 1,
    error: row.error,
    target: row.target,
    args: row.args,
    result: row.result,
    durationMs: Number(row.duration_ms),
  };
}

export class AuditLog {
  private db: DatabaseSync;
  private now: () => number;
  private writes = 0;

  constructor(db: DatabaseSync, now: () => number) {
    this.db = db;
    this.now = now;
  }

  ensureSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        at          INTEGER NOT NULL,
        actor       TEXT    NOT NULL,
        action      TEXT    NOT NULL,
        domain      TEXT    NOT NULL,
        ok          INTEGER NOT NULL,
        error       TEXT,
        target      TEXT,
        args        TEXT,
        result      TEXT,
        duration_ms INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_audit_at     ON audit_log(at);
      CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
      CREATE INDEX IF NOT EXISTS idx_audit_ok     ON audit_log(ok);
    `);
  }

  /** 是否记录只读 action（默认关闭，meta.audit.recordReads=1 打开）。 */
  recordsReads(): boolean {
    const raw = getMeta(this.db, "audit.recordReads").trim().toLowerCase();
    return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
  }

  retentionDays(): number {
    const raw = Number(getMeta(this.db, "audit.retentionDays"));
    return Number.isFinite(raw) && raw > 0 ? Math.min(3650, Math.floor(raw)) : AUDIT_LIMITS.retentionDays;
  }

  /** 写一条审计；任何失败都吞掉并返回 null，绝不影响业务。 */
  record(input: AuditWriteInput): number | null {
    try {
      const action = String(input.action || "").trim();
      if (!action) return null;
      // 自举元 action 与审计自身不记
      if (action.startsWith("audit.") || action.startsWith("actions.") || action.startsWith("capabilities.")) {
        return null;
      }
      if (!input.force && isReadAction(action) && !this.recordsReads()) return null;
      const at = Number.isFinite(Number(input.at)) ? Number(input.at) : this.now();
      const error =
        input.error && String(input.error).length > AUDIT_LIMITS.maxText
          ? String(input.error).slice(0, AUDIT_LIMITS.maxText) + "…"
          : input.error
            ? String(input.error)
            : null;
      const info = this.db
        .prepare(
          `INSERT INTO audit_log(at, actor, action, domain, ok, error, target, args, result, duration_ms)
           VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          at,
          String(input.actor || "other").slice(0, 40),
          action.slice(0, 120),
          String(input.domain || "").slice(0, 120),
          input.ok ? 1 : 0,
          error,
          auditTargetOf(input.args),
          encodeAuditJson(input.args, AUDIT_LIMITS.maxArgs),
          encodeAuditJson(input.result, AUDIT_LIMITS.maxResult),
          Math.max(0, Math.floor(Number(input.durationMs) || 0)),
        );
      this.writes += 1;
      if (this.writes % AUDIT_LIMITS.pruneEvery === 0) {
        try {
          this.prune(this.retentionDays());
        } catch {
          /* 惰性清理失败不影响写入 */
        }
      }
      return Number(info.lastInsertRowid);
    } catch {
      return null;
    }
  }

  list(query: AuditListQuery = {}): {
    records: Record<string, unknown>[];
    total: number;
    returned: number;
    page: number;
    pageSize: number;
    pageable: true;
  } {
    const where: string[] = [];
    const params: unknown[] = [];
    const action = query.action ? String(query.action).trim() : "";
    if (action) {
      where.push("action = ?");
      params.push(action);
    }
    const prefix = query.actionPrefix ? String(query.actionPrefix).trim() : "";
    if (prefix) {
      where.push("action LIKE ?");
      params.push(prefix.replace(/[%_]/g, (m) => "\\" + m) + "%");
    }
    const actor = query.actor ? String(query.actor).trim() : "";
    if (actor) {
      where.push("actor = ?");
      params.push(actor);
    }
    const domain = query.domain ? String(query.domain).trim() : "";
    if (domain) {
      where.push("domain = ?");
      params.push(domain);
    }
    if (query.ok !== undefined && query.ok !== null && query.ok !== "") {
      const raw = String(query.ok).toLowerCase();
      const ok = raw === "1" || raw === "true" || raw === "yes" ? 1 : raw === "0" || raw === "false" || raw === "no" ? 0 : null;
      if (ok !== null) {
        where.push("ok = ?");
        params.push(ok);
      }
    }
    const q = query.q ? String(query.q).trim() : "";
    if (q) {
      where.push("(action LIKE ? OR target LIKE ? OR error LIKE ?)");
      const like = "%" + q.replace(/[%_]/g, (m) => "\\" + m) + "%";
      params.push(like, like, like);
    }
    const target = query.target ? String(query.target).trim() : "";
    if (target) {
      where.push("target LIKE ?");
      params.push("%" + target.replace(/[%_]/g, (m) => "\\" + m) + "%");
    }
    const since = toMillis(query.since);
    if (since !== null) {
      where.push("at >= ?");
      params.push(since);
    }
    const until = toMillis(query.until, true);
    if (until !== null) {
      where.push("at <= ?");
      params.push(until);
    }
    const whereSql = where.length ? " WHERE " + where.join(" AND ") : "";
    const page = clampInt(query.page, 1, 1, 100_000);
    const pageSize = clampInt(query.pageSize, AUDIT_LIMITS.pageSize, 1, AUDIT_LIMITS.maxPageSize);
    const totalRow = this.db
      .prepare("SELECT COUNT(*) AS n FROM audit_log" + whereSql)
      .get(...(params as never[])) as { n?: number } | undefined;
    const total = Number(totalRow && totalRow.n ? totalRow.n : 0);
    const rows = this.db
      .prepare(
        "SELECT * FROM audit_log" + whereSql + " ORDER BY at DESC, id DESC LIMIT ? OFFSET ?",
      )
      .all(...(params as never[]), pageSize, (page - 1) * pageSize) as unknown as AuditRow[];
    return {
      records: rows.map(recordOf),
      total,
      returned: rows.length,
      page,
      pageSize,
      pageable: true,
    };
  }

  get(id: number | string): Record<string, unknown> | null {
    const row = this.db.prepare("SELECT * FROM audit_log WHERE id = ?").get(Number(id)) as
      | AuditRow
      | undefined;
    return row ? recordOf(row) : null;
  }

  stats(rangeDays: number | string = 30): Record<string, unknown> {
    const days = clampInt(rangeDays, 30, 1, 3650);
    const since = this.now() - days * 86_400_000;
    const totals = this.db
      .prepare("SELECT COUNT(*) AS n, COALESCE(SUM(CASE WHEN ok = 0 THEN 1 ELSE 0 END), 0) AS failed FROM audit_log WHERE at >= ?")
      .get(since) as { n?: number; failed?: number } | undefined;
    const byAction = this.db
      .prepare(
        `SELECT action, COUNT(*) AS n, COALESCE(SUM(CASE WHEN ok = 0 THEN 1 ELSE 0 END), 0) AS failed
         FROM audit_log WHERE at >= ? GROUP BY action ORDER BY n DESC, action ASC LIMIT 30`,
      )
      .all(since) as unknown as { action: string; n: number; failed: number }[];
    const byActor = this.db
      .prepare(
        `SELECT actor, COUNT(*) AS n FROM audit_log WHERE at >= ? GROUP BY actor ORDER BY n DESC LIMIT 10`,
      )
      .all(since) as unknown as { actor: string; n: number }[];
    const byDay = this.db
      .prepare(
        `SELECT strftime('%Y-%m-%d', at / 1000, 'unixepoch', 'localtime') AS day,
                COUNT(*) AS n, COALESCE(SUM(CASE WHEN ok = 0 THEN 1 ELSE 0 END), 0) AS failed
         FROM audit_log WHERE at >= ? GROUP BY day ORDER BY day DESC LIMIT 60`,
      )
      .all(since) as unknown as { day: string; n: number; failed: number }[];
    return {
      rangeDays: days,
      since,
      total: Number(totals && totals.n ? totals.n : 0),
      failed: Number(totals && totals.failed ? totals.failed : 0),
      byAction: byAction.map((r) => ({ action: r.action, count: Number(r.n), failed: Number(r.failed) })),
      byActor: byActor.map((r) => ({ actor: r.actor, count: Number(r.n) })),
      byDay: byDay.map((r) => ({ day: r.day, count: Number(r.n), failed: Number(r.failed) })),
    };
  }

  prune(retentionDays?: number | string): { deleted: number; retentionDays: number; cutoff: number } {
    const days =
      retentionDays === undefined || retentionDays === null || retentionDays === ""
        ? this.retentionDays()
        : clampInt(retentionDays, this.retentionDays(), 1, 3650);
    const cutoff = this.now() - days * 86_400_000;
    const info = this.db.prepare("DELETE FROM audit_log WHERE at < ?").run(cutoff);
    return { deleted: Number(info.changes || 0), retentionDays: days, cutoff };
  }
}
