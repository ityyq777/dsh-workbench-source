/**
 * 宿主事件队列自测：不启动 DSH，直接建临时库 + 注入假的 invoke。
 * 覆盖：发布/订阅的声明授权、订阅校验（必须本域已注册 + 仅 plugin 来源）、push 立即返回、
 * 成功投递、失败退避重试与死信、无订阅事件收尾、通配订阅与 plugin 来源，
 * 以及定向投递（白名单授权、目标必填、未安装跳过、禁止订阅、入参 deliveryMode、mode 落库）。
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
  // 已安装的域：vault 有 onEvent 入口，mail 已安装但没提供消费入口，gone 完全没装。
  const installed = new Set(["wb-addon-tasks", "wb-addon-vault", "wb-addon-mail"]);
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
    hasDomain: (domain) => installed.has(domain),
    resolveOnEvent: (domain) =>
      domain === "wb-addon-vault" ? { domain, action: "vault.onEvent" } : null,
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
  // 消费入口固定是 <domain>.onEvent：不在签名里传 action，插件不按事件各开一个入口。
  mustThrow(
    () => queue.subscribe("wb-addon-tasks", "task.created", TASK_SUBS, undefined),
    "onEvent",
    "域里没有 onEvent 入口",
  );
  mustThrow(
    () => queue.subscribe("wb-addon-tasks", "task.created", TASK_SUBS, { origins: ["ui"] }),
    "origins: [\"plugin\"]",
    "ui-only action",
  );
  mustThrow(
    () => queue.subscribe("wb-addon-tasks", "task.created", TASK_SUBS, {}),
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
    () => queue.subscribe("wb-addon-tasks", "task.deleted", TASK_SUBS, taskAction),
    "未声明",
    "未声明的事件不许订阅",
  );

  const unsubscribe = queue.subscribe("wb-addon-tasks", "task.created", TASK_SUBS, taskAction);
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
  queue.subscribe("wb-addon-automation", "*", AUTO_SUBS, { origins: ["plugin"] });
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

  // 定向投递：发布方点名收件人，只按白名单直投目标域的 onEvent，不看订阅登记表
  const VAULT_PUB = [
    { type: "vault.unlocked", mode: "targeted", targets: ["wb-addon-tasks", "wb-addon-vault", "wb-addon-gone"] },
  ];
  queue.declare("wb-addon-vault", VAULT_PUB);

  // 目标必填：定向类型不带收件人清单直接拒绝，且零落库
  const eventsBefore = row("SELECT COUNT(*) AS n FROM host_event").n;
  mustThrow(
    () => queue.push("vault.unlocked", { id: "v0" }, "wb-addon-vault", VAULT_PUB),
    "定向事件必须指定收件人",
    "定向事件必须显式指定收件人",
  );
  assert(row("SELECT COUNT(*) AS n FROM host_event").n === eventsBefore, "校验失败的定向推送不应落库");

  // 白名单即授权边界：点名未授权的域同样拒绝且零落库
  mustThrow(
    () => queue.push("vault.unlocked", {}, "wb-addon-vault", VAULT_PUB, { targets: ["wb-addon-sites"] }),
    "不在发布方声明的白名单内",
    "白名单外的目标",
  );
  assert(row("SELECT COUNT(*) AS n FROM host_event").n === eventsBefore, "越界定向推送不应落库");

  // 定向类型不接受订阅：收件人只能由发布方指定
  mustThrow(
    () => queue.subscribe("wb-addon-tasks", "vault.unlocked", [{ type: "vault.unlocked" }], { origins: ["plugin"] }),
    "定向事件不接受订阅",
    "定向类型禁止订阅",
  );

  // 成功投递：点名两个目标，一个已安装且有入口，另一个点名了但没入口 → 只投有的那条
  const targetedHits = [];
  handler = async (action, args) => {
    targetedHits.push({ action, args });
  };
  const targeted = queue.push("vault.unlocked", { vault: "main" }, "wb-addon-vault", VAULT_PUB, {
    targets: ["wb-addon-vault", "wb-addon-tasks"],
  });
  assert(targeted.deliveries === 1, "已安装但无 onEvent 入口的域名应被跳过，实际投递 " + targeted.deliveries);
  const modeRow = row("SELECT mode FROM host_event WHERE id = ?", targeted.id);
  assert(modeRow.mode === "targeted", "定向事件的 mode 应落库为 targeted，实际 " + modeRow.mode);
  await waitFor(
    () => row("SELECT status FROM host_event_delivery WHERE event_id = ?", targeted.id)?.status === "done",
    "定向投递完成",
  );
  const targetedOnly = targetedHits.filter((hit) => hit.args.type === "vault.unlocked");
  assert(targetedOnly.length === 1 && targetedOnly[0].action === "vault.onEvent", "应投到目标的 onEvent，实际：" + JSON.stringify(targetedHits));
  assert(targetedOnly[0].args.deliveryMode === "targeted", "定向投递入参应带 deliveryMode=targeted");
  assert(calls.at(-1).origin === "plugin", "定向投递同样以 plugin 来源调用");

  // 广播事件照旧：mode 落库为 broadcast，入参 deliveryMode=broadcast
  const broadcastArgs = [];
  handler = async (action, args) => {
    broadcastArgs.push(args);
  };
  const plain = queue.push("mail.received", { id: "m2" }, "wb-addon-mail", MAIL_PUB);
  assert(row("SELECT mode FROM host_event WHERE id = ?", plain.id).mode === "broadcast", "广播事件 mode 应为 broadcast");
  await waitFor(
    () => row("SELECT status FROM host_event_delivery WHERE event_id = ?", plain.id)?.status === "done",
    "广播投递完成",
  );
  assert(broadcastArgs.some((args) => args.deliveryMode === "broadcast"), "广播投递入参应带 deliveryMode=broadcast");

  // 定向目标全部未安装：事件直接 done，不落死信
  const ghost = queue.push("vault.unlocked", { id: "v2" }, "wb-addon-vault", VAULT_PUB, {
    targets: ["wb-addon-gone"],
  });
  assert(ghost.deliveries === 0, "目标未安装时不应生成投递");
  assert(row("SELECT status FROM host_event WHERE id = ?", ghost.id).status === "done", "目标全未安装的事件应直接 done");

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
