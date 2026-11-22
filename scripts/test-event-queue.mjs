/**
 * 宿主事件队列自测：不启动 DSH，直接建临时库 + 注入假的 invoke。
 * 覆盖：发布/订阅的声明授权、订阅校验（必须本域已注册 + 仅 plugin 来源）、push 立即返回、
 * 成功投递、失败退避重试与死信、无订阅事件收尾、通配订阅与 plugin 来源。
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const home = mkdtempSync(join(tmpdir(), "wb-eventqueue-"));
let queue = null;
let conn = null;
let handler = async () => {};
const calls = [];

function assert(cond, message) {
  if (!cond) throw new Error("断言失败：" + message);
}

function mustThrow(fn, messageMatch, label) {
  try {
    fn();
  } catch (error) {
    const text = String(error && error.message ? error.message : error);
    assert(text.includes(messageMatch), label + " 报错文案应包含「" + messageMatch + "」，实际：" + text);
    return;
  }
  throw new Error("断言失败：" + label + " 应该抛错");
}

function row(sql, ...args) {
  return conn.prepare(sql).get(...args);
}

async function waitFor(predicate, label, timeoutMs = 2000) {
  const started = Date.now();
  for (;;) {
    if (predicate()) return;
    if (Date.now() - started > timeoutMs) throw new Error("等待超时：" + label);
    await queue.drain();
    await sleep(5);
  }
}

async function main() {
  const { openDb } = await import("../packages/core/lib/db.js");
  const { createEventQueue } = await import("../packages/shell/lib/infra/event-queue.js");
  conn = openDb(join(home, "workbench.db"));
  queue = createEventQueue({
    db: conn,
    invoke: async (action, args, origin) => {
      calls.push({ action, args, origin });
      return handler(action, args);
    },
    log: () => {},
    retryBaseMs: 2,
    maxAttempts: 3,
    sweepIntervalMs: 3600_000,
    deliveryTimeoutMs: 1000,
  });
  queue.start();

  // 订阅校验：必须本域已注册（宿主传本域 action 表）、origins 只能 ["plugin"]
  // 声明即授权：没在这两份清单里的类型推不出去、也订不上。
  const TASK_PUB = [{ type: "task.created" }];
  const TASK_SUBS = [{ type: "task.created" }];
  const SITE_PUB = [{ type: "site.visited" }];
  const MAIL_PUB = [{ type: "mail.received" }];
  const AUTO_SUBS = [{ type: "*" }];
  const taskAction = { origins: ["plugin"] };
  const taskActions = new Map([["wb-addon-tasks.onEvent", taskAction]]);
  mustThrow(
    () => queue.subscribe("wb-addon-tasks", "task.created", "tasks.onEvent", { origins: ["plugin"] }, new Map(), TASK_SUBS),
    "不属于本域",
    "跨域 action",
  );
  mustThrow(
    () => queue.subscribe("wb-addon-tasks", "task.created", "wb-addon-tasks.onEvent", undefined, undefined, TASK_SUBS),
    "未注册",
    "未注册 action",
  );
  mustThrow(
    () => queue.subscribe("wb-addon-tasks", "task.created", "wb-addon-tasks.onEvent", { origins: ["ui"] }, undefined, TASK_SUBS),
    "origins: [\"plugin\"]",
    "ui-only action",
  );
  mustThrow(
    () => queue.subscribe("wb-addon-tasks", "task.created", "wb-addon-tasks.onEvent", {}, undefined, TASK_SUBS),
    "origins: [\"plugin\"]",
    "未声明 origins",
  );

  // 未声明的类型：发布与订阅都要拒绝，且报错要说清去哪个声明里补。
  mustThrow(
    () => queue.push("task.undeclared", {}, "wb-addon-tasks", TASK_PUB),
    "未声明",
    "未声明的事件不许发布",
  );
  mustThrow(
    () => queue.subscribe("wb-addon-tasks", "task.deleted", "wb-addon-tasks.onEvent", taskAction, taskActions, TASK_SUBS),
    "未声明",
    "未声明的事件不许订阅",
  );

  const unsubscribe = queue.subscribe("wb-addon-tasks", "task.created", "wb-addon-tasks.onEvent", taskAction, taskActions, TASK_SUBS);
  assert(row("SELECT COUNT(*) AS n FROM host_event_subscription").n === 1, "订阅应写入 host_event_subscription");

  // 成功投递：消费者拿到事件字段与 deliveryId，来源固定 plugin
  const received = [];
  handler = async (_action, args) => {
    received.push(args);
  };
  const pushed = queue.push("task.created", { id: "t1" }, "wb-addon-tasks", TASK_PUB);
  assert(pushed.deliveries === 1, "应生成一条投递");
  assert(row("SELECT status FROM host_event WHERE id = ?", pushed.id).status === "queued", "push 后事件应为 queued");
  await waitFor(() => row("SELECT status FROM host_event_delivery WHERE event_id = ?", pushed.id).status === "done", "成功投递");
  assert(received.length === 1, "消费者应被调用一次");
  assert(received[0].eventId === pushed.id && received[0].type === "task.created", "事件字段应完整");
  assert(received[0].payload && received[0].payload.id === "t1", "payload 应原样送达");
  assert(calls.every((c) => c.origin === "plugin"), "宿主必须以 plugin 来源调用消费 action");
  assert(row("SELECT status FROM host_event WHERE id = ?", pushed.id).status === "done", "投递完成后事件应为 done");

  // 非阻塞：消费者慢 250ms，push 仍然立刻返回
  handler = async () => {
    await sleep(250);
  };
  const before = Date.now();
  const slow = queue.push("task.created", { id: "t2" }, "wb-addon-tasks", TASK_PUB);
  const elapsed = Date.now() - before;
  assert(elapsed < 80, "push 不应等待消费者（耗时 " + elapsed + "ms）");
  await waitFor(() => row("SELECT status FROM host_event_delivery WHERE event_id = ?", slow.id).status === "done", "慢消费者");

  // 失败重试 + 死信：消费者抛错不影响 push，也不会抛回调用方
  handler = async () => {
    throw new Error("模拟下游失败");
  };
  let failedPush = null;
  try {
    failedPush = queue.push("task.created", { id: "t3" }, "wb-addon-tasks", TASK_PUB);
  } catch (error) {
    throw new Error("消费者失败不应冒泡到 push 方：" + error.message);
  }
  await waitFor(() => row("SELECT status FROM host_event_delivery WHERE event_id = ?", failedPush.id).status === "dead", "死信");
  const dead = row("SELECT attempts, last_error FROM host_event_delivery WHERE event_id = ?", failedPush.id);
  assert(dead.attempts === 3, "应按 maxAttempts 重试到 3 次，实际 " + dead.attempts);
  assert(String(dead.last_error).includes("模拟下游失败"), "死信应保留 last_error");
  assert(row("SELECT status FROM host_event WHERE id = ?", failedPush.id).status === "dead", "全部投递失败后事件应为 dead");

  // 无订阅者：事件直接 done，不残留 queued
  const orphan = queue.push("site.visited", { id: "s1" }, "wb-addon-sites", SITE_PUB);
  assert(orphan.deliveries === 0, "无订阅者时不应生成投递");
  assert(row("SELECT status FROM host_event WHERE id = ?", orphan.id).status === "done", "无订阅事件应直接 done");

  // 通配订阅：任何类型都能收到
  let wildcardHits = 0;
  queue.subscribe("wb-addon-automation", "*", "wb-addon-automation.onEvent", { origins: ["plugin"] }, undefined, AUTO_SUBS);
  handler = async (action) => {
    if (action === "wb-addon-automation.onEvent") wildcardHits += 1;
  };
  queue.push("mail.received", { id: "m1" }, "wb-addon-mail", MAIL_PUB);
  await waitFor(() => wildcardHits === 1, "通配订阅投递");

  // 取消订阅后不再生成投递
  unsubscribe();
  assert(row("SELECT COUNT(*) AS n FROM host_event_subscription WHERE action = 'wb-addon-tasks.onEvent'").n === 0, "取消订阅应删行");
  const afterUnsub = queue.push("task.created", { id: "t4" }, "wb-addon-tasks", TASK_PUB);
  const ownDeliveries = row(
    "SELECT COUNT(*) AS n FROM host_event_delivery WHERE event_id = ? AND domain = 'wb-addon-tasks'",
    afterUnsub.id,
  ).n;
  assert(ownDeliveries === 0, "取消订阅后不应再为该域生成投递（通配订阅者仍应收货）");
  assert(afterUnsub.deliveries === 1, "只剩通配订阅者时投递数应为 1，实际 " + afterUnsub.deliveries);

  const stats = queue.stats();
  assert(stats.subscriptions === 1 && stats.events.done >= 3, "统计应反映订阅与事件状态：" + JSON.stringify(stats));

  console.log("EVENT QUEUE TEST PASS", {
    calls: calls.length,
    stats,
  });
}

try {
  await main();
} catch (error) {
  console.error("EVENT QUEUE TEST FAIL:", error && error.stack ? error.stack : error);
  process.exitCode = 1;
} finally {
  queue?.stop();
  try {
    conn?.close();
  } catch {
    /* ignore */
  }
  rmSync(home, { recursive: true, force: true });
}
