/**
 * 宿主「事件队列」页的 action。
 *
 * 队列是宿主平台能力，不属于任何业务插件，所以这些接口同样挂在 wb-shell 元 action 名下的
 * wb.event* 前缀（与 wb.dataTables / wb.configGet 同构），界面与 agent 走同一套 schema。
 *
 * 只做读与两类运维动作：重投单条投递、清理已终结的历史事件。不做「凭空造事件」，
 * 否则队列会变成手工触发下游的旁路。
 */
const PAGE_SIZES = [20, 50, 100, 200];
const EVENT_STATUS = ["queued", "done", "dead"];
const DELIVERY_STATUS = ["pending", "running", "done", "dead"];
const MAX_PREVIEW = 200;

const EVENT_COLUMNS = "id, type, source, mode, status, created_at, payload";
const MODES = ["broadcast", "targeted"];
const DELIVERY_COLUMNS =
  "id, event_id, domain, action, status, attempts, next_at, started_at, last_error, updated_at";

function clampPage(value: unknown, pages: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.min(Math.max(Math.trunc(n), 1), Math.max(pages, 1));
}

function sizeOf(value: unknown): number {
  const n = Number(value);
  return (PAGE_SIZES as number[]).includes(n) ? n : 50;
}

function preview(text: unknown): string {
  const s = typeof text === "string" ? text : String(text ?? "");
  return s.length > MAX_PREVIEW ? s.slice(0, MAX_PREVIEW) + "…" : s;
}

function paging(total: number, page: number, pageSize: number) {
  return { page, pageSize, total, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

function whereOf(
  filters: Array<[string, unknown]>,
  allowed: string[],
  prefix = "",
): { sql: string; params: unknown[] } {
  const parts: string[] = [];
  const params: unknown[] = [];
  for (const [column, value] of filters) {
    if (value === undefined || value === null || value === "") continue;
    if (!allowed.includes(column)) continue;
    parts.push(prefix + column + " = ?");
    params.push(String(value));
  }
  return { sql: parts.length ? " WHERE " + parts.join(" AND ") : "", params };
}

const EVENT_STATUSES = ["queued", "done", "dead"];
const DELIVERY_STATUSES = ["pending", "running", "done", "dead"];

function overview(db: any) {
  // 每个状态先落 0 再累加：空队列时不能只返回空对象，
  // 否则页面读 stats.events.queued 会拿到 undefined 而整页崩掉。
  const events: Record<string, number> = {};
  for (const status of EVENT_STATUSES) events[status] = 0;
  for (const row of db.prepare("SELECT status, COUNT(*) AS n FROM host_event GROUP BY status").all() as any[]) {
    events[row.status] = row.n;
  }
  const deliveries: Record<string, number> = {};
  for (const status of DELIVERY_STATUSES) deliveries[status] = 0;
  for (const row of db
    .prepare("SELECT status, COUNT(*) AS n FROM host_event_delivery GROUP BY status")
    .all() as any[]) {
    deliveries[row.status] = row.n;
  }
  const modes: Record<string, number> = { broadcast: 0, targeted: 0 };
  for (const row of db.prepare("SELECT mode, COUNT(*) AS n FROM host_event GROUP BY mode").all() as any[]) {
    modes[row.mode] = row.n;
  }
  const subs = db.prepare("SELECT COUNT(*) AS n FROM host_event_subscription").get() as any;
  const types = db
    .prepare("SELECT type, COUNT(*) AS n FROM host_event GROUP BY type ORDER BY n DESC LIMIT 12")
    .all() as any[];
  return {
    events,
    deliveries,
    modes,
    subscriptions: subs?.n ?? 0,
    types: types.map((row) => ({ type: row.type, count: row.n })),
  };
}

function listEvents(db: any, args: any) {
  const pageSize = sizeOf(args.pageSize);
  const filter = whereOf(
    [
      ["status", args.status],
      ["type", args.type],
      ["source", args.source],
      ["mode", args.mode],
    ],
    ["status", "type", "source", "mode"],
  );
  const total =
    (db.prepare("SELECT COUNT(*) AS n FROM host_event" + filter.sql).get(...filter.params) as any)?.n ?? 0;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = clampPage(args.page, pages);
  const rows = db
    .prepare(
      "SELECT " + EVENT_COLUMNS + " FROM host_event" + filter.sql + " ORDER BY created_at DESC LIMIT ? OFFSET ?",
    )
    .all(...filter.params, pageSize, (page - 1) * pageSize) as any[];
  return {
    items: rows.map((row) => Object.assign({}, row, { payload: preview(row.payload) })),
    ...paging(total, page, pageSize),
  };
}

function listDeliveries(db: any, args: any) {
  const pageSize = sizeOf(args.pageSize);
  // 投递方式存在事件行上：过滤要连事件表，所以投递表自己的列必须带 d. 前缀，否则 status 有歧义。
  const filter = whereOf(
    [
      ["status", args.status],
      ["domain", args.domain],
    ],
    ["status", "domain"],
    "d.",
  );
  const mode = (MODES as string[]).includes(String(args.mode)) ? String(args.mode) : "";
  const where = filter.sql
    ? filter.sql + (mode ? " AND e.mode = ?" : "")
    : mode
      ? " WHERE e.mode = ?"
      : "";
  const params = mode ? [...filter.params, mode] : filter.params;
  const from = " FROM host_event_delivery d LEFT JOIN host_event e ON e.id = d.event_id";
  const total = (db.prepare("SELECT COUNT(*) AS n" + from + where).get(...params) as any)?.n ?? 0;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = clampPage(args.page, pages);
  const rows = db
    .prepare(
      "SELECT d." +
        DELIVERY_COLUMNS.replace(/\s*,\s*/g, ", d.") +
        ", e.type AS event_type, e.mode AS delivery_mode" +
        from +
        where +
        " ORDER BY d.updated_at DESC LIMIT ? OFFSET ?",
    )
    .all(...params, pageSize, (page - 1) * pageSize) as any[];
  return { items: rows, ...paging(total, page, pageSize) };
}

function listSubscriptions(db: any) {
  const rows = db
    .prepare("SELECT domain, type, action, created_at FROM host_event_subscription ORDER BY domain, type")
    .all() as any[];
  return { items: rows, total: rows.length };
}

/** 重投：把一条终态投递退回队列；事件本身若已 dead 也拉回 queued。 */
function replayDelivery(db: any, queueRef: { value: any }, args: any) {
  const id = String(args.deliveryId || "");
  if (!id) throw new Error("缺少 deliveryId");
  const row = db
    .prepare("SELECT id, event_id, status FROM host_event_delivery WHERE id = ?")
    .get(id) as any;
  if (!row) throw new Error("投递不存在：" + id);
  if (row.status === "done") throw new Error("该投递已成功，不需要重投");
  if (row.status === "running") throw new Error("该投递正在执行，稍后再试");
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare(
      "UPDATE host_event_delivery SET status = 'pending', attempts = 0, next_at = ?, started_at = NULL, last_error = '', updated_at = ? WHERE id = ?",
    ).run(Date.now(), Date.now(), id);
    db.prepare("UPDATE host_event SET status = 'queued' WHERE id = ? AND status <> 'queued'").run(row.event_id);
    db.exec("COMMIT");
  } catch (e) {
    try {
      db.exec("ROLLBACK");
    } catch {
      /* ignore */
    }
    throw e;
  }
  const queue = queueRef.value;
  if (queue && typeof queue.drain === "function") void queue.drain();
  return { ok: true, deliveryId: id, eventId: row.event_id };
}

/** 清理：只删已经终结（done/dead）的事件，连同它们的投递；默认 7 天前。 */
function cleanupEvents(db: any, args: any) {
  const days = Number(args.olderThanDays);
  const keepDays = Number.isFinite(days) && days > 0 ? Math.min(days, 365) : 7;
  const before = Date.now() - keepDays * 24 * 3600 * 1000;
  const events = db
    .prepare("SELECT COUNT(*) AS n FROM host_event WHERE status IN ('done','dead') AND created_at < ?")
    .get(before) as any;
  const total = events?.n ?? 0;
  if (!total) return { deleted: 0, olderThanDays: keepDays };
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare(
      "DELETE FROM host_event_delivery WHERE event_id IN (SELECT id FROM host_event WHERE status IN ('done','dead') AND created_at < ?)",
    ).run(before);
    db.prepare("DELETE FROM host_event WHERE status IN ('done','dead') AND created_at < ?").run(before);
    db.exec("COMMIT");
  } catch (e) {
    try {
      db.exec("ROLLBACK");
    } catch {
      /* ignore */
    }
    throw e;
  }
  return { deleted: total, olderThanDays: keepDays };
}

/** 插件一栏：每个域声明的发布/监听事件 + 运行对账（未声明的推不出去，所以清单就是全貌）。 */
function domainsPayload(domains: Map<string, any>, queueRef: { value: any }) {
  const queue = queueRef.value;
  if (!queue || typeof queue.describe !== "function") return { domains: [] };
  const items = [...domains.values()]
    .filter((rec) => rec && rec.def && rec.def.id)
    .map((rec) => {
      const info = queue.describe(rec.def.id, rec.def.events);
      return {
        domain: rec.def.id,
        title: rec.def.title || rec.def.id,
        description: rec.def.description || "",
        publishes: info.publishes,
        receives: info.receives || [],
        listens: info.listens,
        subscriptions: info.subscriptions,
        error: rec.error || "",
      };
    })
    .sort((a, b) => String(a.title).localeCompare(String(b.title), "zh"));
  return { domains: items };
}

/** 把事件队列的读/运维 action 并进元 action 表。 */
export function createHostEventActions(
  db: any,
  queueRef: { value: any },
  domains: Map<string, any>,
): Map<string, any> {
  return new Map([
    [
      "wb.eventOverview",
      {
        description:
          "事件队列总览：事件与投递按状态计数、订阅数、按类型的事件量。只读，供宿主「事件队列」页顶部统计。",
        input: { type: "object", properties: {} },
        examples: [{}],
        execute: () => overview(db),
        render: (r: any) =>
          "事件 " +
          Object.entries(r.events).map(([k, v]) => k + "=" + v).join("、") +
          "；投递 " +
          Object.entries(r.deliveries).map(([k, v]) => k + "=" + v).join("、"),
      },
    ],
    [
      "wb.eventList",
      {
        description:
          "分页列出事件（type/source/mode/status/时间/payload 预览），可按状态、类型、来源、投递方式过滤，按时间倒序。",
        input: {
          type: "object",
          properties: {
            status: { type: "string", enum: EVENT_STATUS, description: "事件状态" },
            type: { type: "string", description: "事件类型，精确匹配" },
            source: { type: "string", description: "推送方：域 id 或 host" },
            mode: { type: "string", enum: MODES, description: "投递方式：broadcast 广播 / targeted 定向" },
            page: { type: "number", description: "页码，从 1 开始，越界自动夹取" },
            pageSize: { type: "number", enum: PAGE_SIZES, description: "每页条数，默认 50" },
          },
        },
        examples: [{ status: "dead", pageSize: 20 }, { type: "mail.messages-synced" }],
        execute: (args: any) => listEvents(db, args || {}),
        render: (r: any) => "事件 第 " + r.page + "/" + r.pages + " 页，共 " + r.total + " 条",
      },
    ],
    [
      "wb.eventDeliveryList",
      {
        description:
          "分页列出投递（按收件人拆出的下游任务）：状态、投递方式、尝试次数、下次重试时间、最近错误，可按状态、域、投递方式过滤。",
        input: {
          type: "object",
          properties: {
            status: { type: "string", enum: DELIVERY_STATUS, description: "投递状态" },
            domain: { type: "string", description: "收件域 id" },
            mode: { type: "string", enum: MODES, description: "投递方式：broadcast 广播 / targeted 定向" },
            page: { type: "number", description: "页码，从 1 开始，越界自动夹取" },
            pageSize: { type: "number", enum: PAGE_SIZES, description: "每页条数，默认 50" },
          },
        },
        examples: [{ status: "dead", pageSize: 20 }],
        execute: (args: any) => listDeliveries(db, args || {}),
        render: (r: any) => "投递 第 " + r.page + "/" + r.pages + " 页，共 " + r.total + " 条",
      },
    ],
    [
      "wb.eventSubscriptionList",
      {
        description: "列出当前所有事件订阅（域、事件类型、消费 action），即队列的实际登记表。",
        input: { type: "object", properties: {} },
        examples: [{}],
        execute: () => listSubscriptions(db),
        render: (r: any) =>
          r.items.length ? r.items.map((x: any) => x.domain + " ← " + x.type + " via " + x.action).join("\n") : "没有订阅",
      },
    ],
    [
      "wb.eventDomains",
      {
        description:
          "按插件列出事件授权清单与运行对账：声明发布的类型（含投递方式与定向白名单）及实发统计、定向收到的事件、声明监听的类型与是否已登记、真实订阅与投递计数。",
        input: { type: "object", properties: {} },
        examples: [{}],
        execute: () => domainsPayload(domains, queueRef),
        render: (r: any) =>
          r.domains
            .map(
              (d: any) =>
                d.title +
                "：" +
                (d.publishes
                  .map((p: any) => "发布 " + p.type + (p.mode === "targeted" ? "(定向→" + (p.targets || []).join(",") + ")" : ""))
                  .join("、") || "无发布") +
                " / " +
                (d.receives.map((r: any) => "定向收件 " + r.type + "(来自 " + r.from + ")").join("、") || "无定向收件") +
                " / " +
                (d.listens.map((l: any) => "监听 " + l.type + (l.registered ? "" : "(未登记)")).join("、") || "无监听"),
            )
            .join("\n"),
      },
    ],
    [
      "wb.eventReplay",
      {
        description:
          "重投一条未成功的投递（pending/running 之外）：把尝试次数与错误清空重新排队，若事件已 dead 一并拉回 queued。",
        input: {
          type: "object",
          required: ["deliveryId"],
          properties: { deliveryId: { type: "string", description: "投递 id（见 wb.eventDeliveryList）" } },
        },
        origins: ["ui", "plugin"],
        examples: [{ deliveryId: "00000000-0000-0000-0000-000000000000" }],
        execute: (args: any) => replayDelivery(db, queueRef, args || {}),
        render: (r: any) => "已重新排队：" + r.deliveryId,
      },
    ],
    [
      "wb.eventCleanup",
      {
        description: "清理已经终结（done/dead）的历史事件及其投递，默认保留最近 7 天，最多 365 天。",
        input: {
          type: "object",
          properties: { olderThanDays: { type: "number", description: "保留天数，默认 7，范围 1–365" } },
        },
        origins: ["ui", "plugin"],
        examples: [{ olderThanDays: 7 }],
        execute: (args: any) => cleanupEvents(db, args || {}),
        render: (r: any) => "已清理 " + r.deleted + " 条（保留最近 " + r.olderThanDays + " 天）",
      },
    ],
  ]);
}
