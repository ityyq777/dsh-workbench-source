/**
 * 宿主事件队列（主 push 模式）。
 *
 * 设计要点：
 *  - push 只做一次落库（host_event + 按订阅生成 host_event_delivery），然后
 *    `setTimeout(drain, 0).unref()` 调度后台分发，**从不 await 消费者**；
 *    消费者的慢、抛错、域未加载都不会冒泡回 push 方。
 *  - 订阅是登记式：插件在 setup 里 `api.events.subscribe(type, action)`，
 *    消费 action 必须是本域已注册（宿主用本域 action 表查 def）、且 `origins` 只允许 plugin 的 action；
 *    宿主以固定 plugin 来源 invoke，ui/agent 调不到它。
 *  - 投递独立成行，单条失败只改自己的状态：指数退避重试，超过上限进 dead
 *    并保留 last_error；同一条事件的其他投递互不影响。
 *  - 进程重启后未完成的投递会由 start() 继续，running 超过阈值的视为失联并重排。
 */
import { randomUUID } from "node:crypto";
import type { ActionOrigin, DomainActionDef, EventQueueStats } from "@wb/sdk";

/** 事件类型：小写开头，允许点/下划线/短横线，如 task.created、mail.received。 */
const TYPE_RE = /^[a-z][a-z0-9_.-]{0,79}$/i;
const ACTION_RE = /^[a-z][a-z0-9_-]*(?:\.[a-z][a-z0-9_-]*)+$/i;

type Subscription = { domain: string; action: string };

export interface EventQueueOptions {
  db: any;
  /** 固定以 plugin 来源执行 action；失败必须是 reject 而不是进程崩溃。 */
  invoke: (action: string, args: Record<string, unknown>, origin: ActionOrigin) => Promise<unknown>;
  log?: (...args: unknown[]) => void;
  now?: () => number;
  /** 单条投递最大尝试次数（含首次）。 */
  maxAttempts?: number;
  /** 首次重试延迟，之后每次翻倍。 */
  retryBaseMs?: number;
  /** 一轮最多取多少条投递。 */
  batchSize?: number;
  /** 单个消费 action 的执行上限，超时按失败处理，避免一条卡死整条队列。 */
  deliveryTimeoutMs?: number;
  /** 后台补扫间隔：捞到期的重试、恢复失联投递。 */
  sweepIntervalMs?: number;
  /** running 超过这个时长视为进程失联，回退 pending 重投。 */
  staleRunningMs?: number;
  /** 终态事件保留时长，超过后清理。 */
  retentionMs?: number;
}

interface DeliveryRow {
  id: string;
  event_id: string;
  domain: string;
  action: string;
  attempts: number;
}

interface EventRow {
  id: string;
  type: string;
  source: string;
  payload: string;
  created_at: number;
}

/**
 * 建事件队列。宿主只创建一份；测试里可以注入假的 invoke 与时钟。
 */
export function createEventQueue(options: EventQueueOptions) {
  const { db, invoke } = options;
  const log = options.log ?? (() => {});
  const now = options.now ?? (() => Date.now());
  const maxAttempts = options.maxAttempts ?? 5;
  const retryBaseMs = options.retryBaseMs ?? 250;
  const batchSize = options.batchSize ?? 20;
  const deliveryTimeoutMs = options.deliveryTimeoutMs ?? 15_000;
  const sweepIntervalMs = options.sweepIntervalMs ?? 500;
  const staleRunningMs = options.staleRunningMs ?? 60_000;
  const retentionMs = options.retentionMs ?? 7 * 24 * 3600 * 1000;

  /** type -> 订阅者；"*" 单独存，一次投递取两者的并集。 */
  const subscribers = new Map<string, Map<string, Subscription>>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let sweep: ReturnType<typeof setInterval> | undefined;
  let draining = false;
  let again = false;
  let lastPrune = 0;

  const subKey = (sub: Subscription) => sub.domain + "\u0000" + sub.action;

  function addSubscriber(type: string, sub: Subscription) {
    let set = subscribers.get(type);
    if (!set) {
      set = new Map();
      subscribers.set(type, set);
    }
    set.set(subKey(sub), sub);
  }

  function dropSubscriber(type: string, sub: Subscription) {
    subscribers.get(type)?.delete(subKey(sub));
  }

  function loadSubscriptions() {
    subscribers.clear();
    const rows = db
      .prepare("SELECT domain, type, action FROM host_event_subscription")
      .all() as { domain: string; type: string; action: string }[];
    for (const row of rows) addSubscriber(row.type, { domain: row.domain, action: row.action });
  }

  function matched(type: string): Subscription[] {
    const out = new Map<string, Subscription>();
    for (const set of [subscribers.get(type), subscribers.get("*")]) {
      if (!set) continue;
      for (const [key, sub] of set) out.set(key, sub);
    }
    return [...out.values()];
  }

  function insertDelivery(eventId: string, sub: Subscription, ts: number) {
    db.prepare(
      "INSERT INTO host_event_delivery (id, event_id, domain, action, status, attempts, next_at, started_at, last_error, updated_at) VALUES (?, ?, ?, ?, 'pending', 0, ?, NULL, NULL, ?)",
    ).run(randomUUID(), eventId, sub.domain, sub.action, ts, ts);
  }

  /**
   * 推一条事件：只落库并调度一次后台 drain，立即返回。
   * 没有订阅者时事件直接标记 done，避免长期停留在 queued。
   */
  function push(type: string, payload: unknown, source: string): { id: string; deliveries: number } {
    const name = String(type ?? "").trim();
    if (!TYPE_RE.test(name)) throw new Error("非法事件类型（小写字母开头，允许数字/._-，最长 80）：" + name);
    let body = "null";
    if (payload !== undefined) {
      try {
        body = JSON.stringify(payload);
      } catch {
        throw new Error("事件 payload 必须可 JSON 序列化：" + name);
      }
      if (typeof body !== "string") throw new Error("事件 payload 必须可 JSON 序列化：" + name);
    }
    const id = randomUUID();
    const ts = now();
    const targets = matched(name);
    db.exec("BEGIN IMMEDIATE");
    try {
      db.prepare("INSERT INTO host_event (id, type, source, payload, status, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
        id,
        name,
        String(source || "host"),
        body,
        targets.length ? "queued" : "done",
        ts,
      );
      for (const sub of targets) insertDelivery(id, sub, ts);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
    if (targets.length) schedule();
    return { id, deliveries: targets.length };
  }

  function subscribe(
    domain: string,
    type: string,
    action: string,
    def?: DomainActionDef | null,
    domainActions?: Map<string, DomainActionDef>,
  ): () => void {
    const name = String(type ?? "").trim();
    if (name !== "*" && !TYPE_RE.test(name)) throw new Error("非法事件类型（或使用 \"*\" 订阅全部）：" + name);
    if (!ACTION_RE.test(String(action ?? ""))) throw new Error("非法消费 action 名（应形如 tasks.onEvent）：" + action);
    // 归属校验：action 名不带域名前缀（插件里本来就叫 message.send 这种），
    // 所以由宿主传入「本域 action 表」，表里查到的 def 必须就是传进来的那个。
    if (!def) throw new Error("消费 action 未注册：" + action);
    if (domainActions && domainActions.get(action) !== def) {
      throw new Error("消费 action 不属于本域（" + domain + " 的 action 表里没有它）：" + action);
    }
    const origins = Array.isArray(def.origins) ? def.origins : [];
    if (origins.length !== 1 || origins[0] !== "plugin") {
      throw new Error(
        "消费 action 必须声明 origins: [\"plugin\"]（只允许插件后台调用，ui/agent 不得消费）：" + action,
      );
    }
    const ts = now();
    db.prepare(
      "INSERT OR REPLACE INTO host_event_subscription (domain, type, action, created_at) VALUES (?, ?, ?, ?)",
    ).run(domain, name, action, ts);
    const sub = { domain, action };
    addSubscriber(name, sub);
    return () => {
      db.prepare("DELETE FROM host_event_subscription WHERE domain = ? AND type = ? AND action = ?").run(
        domain,
        name,
        action,
      );
      dropSubscriber(name, sub);
    };
  }

  function schedule() {
    if (draining) {
      again = true;
      return;
    }
    if (timer) return;
    timer = setTimeout(() => {
      timer = undefined;
      void drain();
    }, 0);
    timer.unref?.();
  }

  function withTimeout(work: Promise<unknown>, ms: number): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const handle = setTimeout(() => reject(new Error("消费 action 执行超时（" + ms + "ms）")), ms);
      handle.unref?.();
      work.then(
        (value) => {
          clearTimeout(handle);
          resolve(value);
        },
        (error) => {
          clearTimeout(handle);
          reject(error);
        },
      );
    });
  }

  function finalizeEvent(eventId: string) {
    const row = db
      .prepare(
        "SELECT SUM(CASE WHEN status IN ('pending', 'running') THEN 1 ELSE 0 END) AS live, SUM(CASE WHEN status = 'dead' THEN 1 ELSE 0 END) AS dead FROM host_event_delivery WHERE event_id = ?",
      )
      .get(eventId) as { live: number | null; dead: number | null };
    if (row.live) return;
    db.prepare("UPDATE host_event SET status = ? WHERE id = ?").run(row.dead ? "dead" : "done", eventId);
  }

  async function deliver(row: DeliveryRow) {
    const ts = now();
    const attempts = row.attempts + 1;
    db.prepare("UPDATE host_event_delivery SET status = 'running', attempts = ?, started_at = ?, updated_at = ? WHERE id = ?").run(
      attempts,
      ts,
      ts,
      row.id,
    );
    try {
      const event = db
        .prepare("SELECT id, type, source, payload, created_at FROM host_event WHERE id = ?")
        .get(row.event_id) as EventRow | undefined;
      if (!event) throw new Error("事件已不存在：" + row.event_id);
      let payload: unknown = null;
      try {
        payload = JSON.parse(event.payload ?? "null");
      } catch {
        payload = event.payload;
      }
      await withTimeout(
        invoke(
          row.action,
          {
            eventId: event.id,
            deliveryId: row.id,
            type: event.type,
            source: event.source,
            payload,
            createdAt: event.created_at,
          },
          "plugin",
        ),
        deliveryTimeoutMs,
      );
      db.prepare("UPDATE host_event_delivery SET status = 'done', updated_at = ?, last_error = NULL WHERE id = ?").run(
        now(),
        row.id,
      );
    } catch (error) {
      const message = String((error as Error)?.message ?? error).slice(0, 500);
      const time = now();
      if (attempts >= maxAttempts) {
        db.prepare("UPDATE host_event_delivery SET status = 'dead', last_error = ?, updated_at = ? WHERE id = ?").run(
          message,
          time,
          row.id,
        );
        log("事件投递进入死信", row.action, message);
      } else {
        const delay = retryBaseMs * 2 ** (attempts - 1);
        db.prepare("UPDATE host_event_delivery SET status = 'pending', next_at = ?, last_error = ?, updated_at = ? WHERE id = ?").run(
          time + delay,
          message,
          time,
          row.id,
        );
      }
    }
    finalizeEvent(row.event_id);
  }

  /** 后台分发：单飞，不抛错；批满了继续下一批。 */
  async function drain(): Promise<void> {
    if (draining) {
      again = true;
      return;
    }
    draining = true;
    try {
      let more = true;
      while (more) {
        more = false;
        const ts = now();
        db.prepare(
          "UPDATE host_event_delivery SET status = 'pending', started_at = NULL, updated_at = ? WHERE status = 'running' AND (started_at IS NULL OR started_at < ?)",
        ).run(ts, ts - staleRunningMs);
        const rows = db
          .prepare(
            "SELECT id, event_id, domain, action, attempts FROM host_event_delivery WHERE status = 'pending' AND next_at <= ? ORDER BY next_at, rowid LIMIT ?",
          )
          .all(ts, batchSize) as DeliveryRow[];
        if (!rows.length) break;
        await Promise.all(rows.map((row) => deliver(row)));
        if (rows.length === batchSize) more = true;
      }
    } catch (error) {
      log("事件队列分发异常", String((error as Error)?.message ?? error));
    } finally {
      draining = false;
      if (again) {
        again = false;
        schedule();
      }
    }
  }

  /** 清理终态事件与投递；失败不影响队列。 */
  function prune() {
    const cutoff = now() - retentionMs;
    try {
      db.prepare(
        "DELETE FROM host_event_delivery WHERE event_id IN (SELECT id FROM host_event WHERE status IN ('done', 'dead') AND created_at < ?)",
      ).run(cutoff);
      db.prepare("DELETE FROM host_event WHERE status IN ('done', 'dead') AND created_at < ?").run(cutoff);
    } catch (error) {
      log("事件队列清理失败", String((error as Error)?.message ?? error));
    }
  }

  function stats(): EventQueueStats {
    const events: Record<string, number> = {};
    for (const row of db.prepare("SELECT status, COUNT(*) AS n FROM host_event GROUP BY status").all() as {
      status: string;
      n: number;
    }[]) {
      events[row.status] = row.n;
    }
    const deliveries: Record<string, number> = {};
    for (const row of db.prepare("SELECT status, COUNT(*) AS n FROM host_event_delivery GROUP BY status").all() as {
      status: string;
      n: number;
    }[]) {
      deliveries[row.status] = row.n;
    }
    const subs = db.prepare("SELECT COUNT(*) AS n FROM host_event_subscription").get() as { n: number };
    return { subscriptions: subs.n, events, deliveries };
  }

  /** 启动补扫：恢复历史订阅、立刻分发一次，之后按间隔补捞重试。 */
  function start() {
    loadSubscriptions();
    prune();
    lastPrune = now();
    void drain();
    if (!sweep) {
      sweep = setInterval(() => {
        if (now() - lastPrune > 3600_000) {
          lastPrune = now();
          prune();
        }
        void drain();
      }, sweepIntervalMs);
      sweep.unref?.();
    }
  }

  function stop() {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
    if (sweep) {
      clearInterval(sweep);
      sweep = undefined;
    }
  }

  return { push, subscribe, start, stop, drain, stats };
}

export type EventQueue = ReturnType<typeof createEventQueue>;
