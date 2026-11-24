/**
 * 宿主事件队列（主 push 模式）。
 *
 * 设计要点：
 *  - push 只做一次落库（host_event + 按订阅生成 host_event_delivery），然后
 *    `setTimeout(drain, 0).unref()` 调度后台分发，**从不 await 消费者**；
 *    消费者的慢、抛错、域未加载都不会冒泡回 push 方。
 *  - 发布与订阅都要先授权：DomainDef.events.publishes / subscriptions 里声明过的类型
 *    才允许 push / subscribe，未声明直接报错（声明本身就是给宿主的清单）。
 *  - 订阅是登记式：插件在 setup 里 `api.events.subscribe(type, action)`，
 *    消费 action 必须是本域已注册（宿主用本域 action 表查 def）、且 `origins` 只允许 plugin 的 action；
 *    宿主以固定 plugin 来源 invoke，ui/agent 调不到它。
 *  - 投递独立成行，单条失败只改自己的状态：指数退避重试，超过上限进 dead
 *    并保留 last_error；同一条事件的其他投递互不影响。
 *  - 进程重启后未完成的投递会由 start() 继续，running 超过阈值的视为失联并重排。
 */
import { randomUUID } from "node:crypto";
import type {
  ActionOrigin,
  DomainActionDef,
  DomainEventDecl,
  DomainEventPushOptions,
  DomainEventsInfo,
  EventDeliveryMode,
  EventQueueStats,
} from "@wb/sdk";

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
  /**
   * 目标域是否已安装/已启用。定向投递时用它过滤：未安装的域直接跳过，
   * 不计投递也不进死信（与「广播无订阅者」口径一致）。
   */
  hasDomain?: (domain: string) => boolean;
  /**
   * 域 id → 本域 onEvent 消费入口。定向投递只按这条映射调用目标，
   * 不看订阅登记表；返回 null 表示该域没有可投递入口。
   */
  resolveOnEvent?: (domain: string) => { domain: string; action: string } | null;
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
  mode: EventDeliveryMode;
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
  /**
   * type -> 发布方声明（只用于两件事：拒绝订阅定向类型、观测面回传 mode/targets）。
   * 声明是推送时的授权清单，订阅登记表不参与定向投递。
   */
  const declaredPublishes = new Map<string, { domain: string; mode: EventDeliveryMode; targets: string[] }>();
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

  /** 登记某个域声明的发布清单：定向类型从此处分得清，订阅时据此拒绝。 */
  function declarePublishes(domain: string, publishes?: DomainEventDecl[]): void {
    for (const item of publishes || []) {
      if (!item || !item.type) continue;
      const mode: EventDeliveryMode = item.mode === "targeted" ? "targeted" : "broadcast";
      const targets = mode === "targeted" && Array.isArray(item.targets) ? item.targets.map(String) : [];
      declaredPublishes.set(String(item.type), { domain, mode, targets });
    }
  }

  /** 定向目标的 onEvent 入口；没注入解析器时退回「域 id.onEvent」的命名约定。 */
  function resolveTarget(domain: string): string | null {
    const hit = options.resolveOnEvent?.(domain);
    if (hit && hit.action) return hit.action;
    if (options.resolveOnEvent) return null;
    return domain + ".onEvent";
  }

  /** 定向收件人：按清单顺序去重；未安装或没有 onEvent 的直接跳过并记日志，不计投递、不进死信。 */
  function targetedSubs(type: string, requested: string[]): Subscription[] {
    const out: Subscription[] = [];
    const seen = new Set<string>();
    for (const raw of requested) {
      const domain = String(raw ?? "").trim();
      if (!domain || seen.has(domain)) continue;
      seen.add(domain);
      if (options.hasDomain && !options.hasDomain(domain)) {
        log("事件定向目标未安装，跳过投递", type, domain);
        continue;
      }
      const action = resolveTarget(domain);
      if (!action) {
        log("事件定向目标没有 onEvent 入口，跳过投递", type, domain);
        continue;
      }
      out.push({ domain, action });
    }
    return out;
  }

  /** 定向清单校验：必须非空且全部在发布方声明的白名单内（白名单是唯一授权边界）。 */
  function validateTargets(type: string, requested: string[], allowed: string[]): void {
    if (!requested.length) {
      throw new Error("定向事件必须指定收件人：传入 options.targets（非空）（事件 " + type + "）");
    }
    const outside = requested.filter((domain) => !allowed.includes(domain));
    if (outside.length) {
      throw new Error(
        "定向投递目标不在发布方声明的白名单内：" + outside.join("、") + "（事件 " + type + "，允许：" + allowed.join("、") + "）",
      );
    }
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
   *
   * 两种投递语义：广播的收件人来自订阅登记表；定向的收件人来自 options.targets，
   * 且必须是发布方声明 targets 的非空子集（白名单即授权边界，越界直接抛错、零落库）。
   * 没有任何收件人时事件直接标记 done，避免长期停留在 queued。
   */
  function push(
    type: string,
    payload: unknown,
    source: string,
    publishes?: DomainEventDecl[],
    options?: DomainEventPushOptions,
  ): { id: string; deliveries: number } {
    const name = String(type ?? "").trim();
    if (!TYPE_RE.test(name)) throw new Error("非法事件类型（小写字母开头，允许数字/._-，最长 80）：" + name);
    // 发布授权：宿主自己不受限，业务域必须先在 DomainDef.events.publishes 里声明。
    const from = String(source || "host");
    const decl = (publishes || []).find((item) => item && item.type === name);
    if (from !== "host" && !decl) {
      throw new Error(
        "事件未声明，不允许发布：" + name + "（先在 " + from + " 的 DomainDef.events.publishes 里声明）",
      );
    }
    const requested = Array.isArray(options?.targets) ? options!.targets!.map(String) : [];
    let mode: EventDeliveryMode = "broadcast";
    if (decl?.mode === "targeted") {
      mode = "targeted";
      const allowed = Array.isArray(decl.targets) ? decl.targets.map(String) : [];
      if (!allowed.length) throw new Error("定向事件声明缺少 targets 白名单：" + name);
      validateTargets(name, requested, allowed);
    } else if (requested.length) {
      // 一个类型只能有一种模式：广播类型不接受收件人清单，避免同一条事件双投。
      throw new Error(
        from === "host"
          ? "宿主定向推送需先把类型声明成 mode: \"targeted\"（事件 " + name + "）"
          : "广播事件不能指定定向目标：" + name + "（先在 " + from + " 的 DomainDef.events.publishes 里声明 mode: \"targeted\"）",
      );
    }
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
    // 收件人必须在事务开始前定下来：校验失败时一行都不许写（零落库）。
    const targets = mode === "targeted" ? targetedSubs(name, requested) : matched(name);
    db.exec("BEGIN IMMEDIATE");
    try {
      db.prepare(
        "INSERT INTO host_event (id, type, source, payload, mode, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      ).run(id, name, from, body, mode, targets.length ? "queued" : "done", ts);
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
    declared?: DomainEventDecl[],
    def?: DomainActionDef | null,
    actionName?: string,
  ): () => void {
    const name = String(type ?? "").trim();
    if (name !== "*" && !TYPE_RE.test(name)) throw new Error("非法事件类型（或使用 \"*\" 订阅全部）：" + name);
    // 定向事件没有「订阅」这回事：收件人由发布方 push 时按白名单点名，任何域都不能靠订阅蹭到。
    const owner = declaredPublishes.get(name);
    if (owner?.mode === "targeted") {
      throw new Error(
        "定向事件不接受订阅：" + name + "（收件人由发布方 " + owner.domain + " 在 push 时用 options.targets 指定）",
      );
    }
    // 监听授权：与发布对称，未在 DomainDef.events.subscriptions 声明的类型订阅不上。
    if (!(declared || []).some((item) => item && item.type === name)) {
      throw new Error(
        "事件未声明，不允许订阅：" + name + "（先在 " + domain + " 的 DomainDef.events.subscriptions 里声明）",
      );
    }
    // 消费入口是每个域唯一的 `<前缀>.onEvent`（前缀由插件自己的 action 命名决定，
    // 例如 domain id 是 wb-addon-message、action 叫 message.onEvent）。插件不按事件
    // 类型各开一个 action，而是拿到 type 自己分派，新增一种订阅不用再改 action 清单。
    const action = String(actionName || domain + ".onEvent");
    if (!ACTION_RE.test(action)) throw new Error("非法消费 action 名（应形如 tasks.onEvent）：" + action);
    if (!def) throw new Error("消费 action 未注册：" + action + "（域内必须提供 onEvent 作为统一事件入口）");
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
        .prepare("SELECT id, type, source, payload, mode, created_at FROM host_event WHERE id = ?")
        .get(row.event_id) as EventRow | undefined;
      if (!event) throw new Error("事件已不存在：" + row.event_id);
      const mode: EventDeliveryMode = event.mode === "targeted" ? "targeted" : "broadcast";
      // 定向投递每次重新解析目标入口：目标可能在这一轮被卸载/热重载改了 action 名，
      // 解析不到就按失败处理（进重试/死信），绝不悄悄改投给别人。
      let action = row.action;
      if (mode === "targeted" && options.resolveOnEvent) {
        const hit = options.resolveOnEvent(row.domain);
        if (!hit) throw new Error("定向投递目标已不可用（未安装或缺少 onEvent 消费入口）：" + row.domain);
        action = hit.action;
      }
      let payload: unknown = null;
      try {
        payload = JSON.parse(event.payload ?? "null");
      } catch {
        payload = event.payload;
      }
      await withTimeout(
        invoke(
          action,
          {
            eventId: event.id,
            deliveryId: row.id,
            type: event.type,
            source: event.source,
            payload,
            createdAt: event.created_at,
            deliveryMode: mode,
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

  /**
   * 事件授权清单与运行对账：声明会推/会收什么 + 真实统计（宿主「事件队列」页的「插件」页签用）。
   * 订阅一律取自队列登记表（谁真订了就是谁），不要求插件再声明一遍，避免两处失真。
   */
  function describe(domain: string, events?: { publishes?: DomainEventDecl[]; subscriptions?: DomainEventDecl[] }): DomainEventsInfo {
    const publishes = (events?.publishes || []).map((decl) => {
      const mode: EventDeliveryMode = decl.mode === "targeted" ? "targeted" : "broadcast";
      const row = db
        .prepare("SELECT COUNT(*) AS n, MAX(created_at) AS lastAt FROM host_event WHERE source = ? AND type = ?")
        .get(domain, decl.type) as { n: number; lastAt: number | null } | undefined;
      const latest = db
        .prepare("SELECT status FROM host_event WHERE source = ? AND type = ? ORDER BY created_at DESC LIMIT 1")
        .get(domain, decl.type) as { status: string } | undefined;
      return {
        type: decl.type,
        description: decl.description,
        mode,
        targets: mode === "targeted" ? (decl.targets || []).map(String) : undefined,
        sent: row?.n ?? 0,
        lastAt: row?.lastAt ?? undefined,
        lastStatus: latest?.status,
      };
    });
    const subs = db
      .prepare("SELECT type, action, created_at FROM host_event_subscription WHERE domain = ? ORDER BY created_at")
      .all(domain) as { type: string; action: string; created_at: number }[];
    const countByStatus = db.prepare(
      "SELECT d.status AS status, COUNT(*) AS n FROM host_event_delivery d JOIN host_event e ON e.id = d.event_id WHERE d.domain = ? AND d.action = ? AND e.mode = 'broadcast' GROUP BY d.status",
    );
    const lastErrorOf = db.prepare(
      "SELECT d.last_error AS last_error FROM host_event_delivery d JOIN host_event e ON e.id = d.event_id WHERE d.domain = ? AND d.action = ? AND e.mode = 'broadcast' AND d.last_error <> '' ORDER BY d.updated_at DESC LIMIT 1",
    );
    const subscriptions = subs.map((row) => {
      const counts: Record<string, number> = {};
      for (const hit of countByStatus.all(domain, row.action) as { status: string; n: number }[]) {
        counts[hit.status] = hit.n;
      }
      const err = lastErrorOf.get(domain, row.action) as { last_error: string } | undefined;
      return {
        type: row.type,
        action: row.action,
        mode: "broadcast" as EventDeliveryMode,
        createdAt: row.created_at,
        done: counts.done ?? 0,
        dead: counts.dead ?? 0,
        pending: counts.pending ?? 0,
        lastError: err?.last_error || undefined,
      };
    });
    const listens = (events?.subscriptions || []).map((decl) => {
      const hits = subscriptions.filter((sub) => sub.type === decl.type);
      return {
        type: decl.type,
        description: decl.description,
        registered: hits.length > 0,
        actions: hits.map((hit) => hit.action),
      };
    });
    // 定向收件对账：别人按白名单点名发给我的事件，与「我订阅的广播」分开展示。
    const receives = (
      db
        .prepare(
          "SELECT e.type AS type, e.source AS source, COUNT(*) AS n, MAX(e.created_at) AS lastAt FROM host_event_delivery d JOIN host_event e ON e.id = d.event_id WHERE d.domain = ? AND e.mode = 'targeted' GROUP BY e.type, e.source ORDER BY lastAt DESC LIMIT 50",
        )
        .all(domain) as { type: string; source: string; n: number; lastAt: number | null }[]
    ).map((row) => ({ type: row.type, from: row.source, delivered: row.n, lastAt: row.lastAt ?? undefined }));
    return { domain, publishes, receives, listens, subscriptions };
  }

  return { push, subscribe, declare: declarePublishes, start, stop, drain, stats, describe };
}

export type EventQueue = ReturnType<typeof createEventQueue>;
