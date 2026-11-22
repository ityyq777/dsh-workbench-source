/**
 * 邮件 → 消息走事件队列的解耦回归（不启动 DSH）：
 * 1. 消息插件注册 plugin-only 消费 action 并订阅 mail.messages-synced；
 * 2. agent / ui 来源调不到消费 action；
 * 3. 宿主推事件后消息落库、同一批新信幂等、uid 变化才新增；
 * 4. 邮件插件不再判断消息插件是否安装、不再直调 message.send。
 */
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const home = mkdtempSync(join(tmpdir(), "wb-mail-queue-"));
process.env.WB_HOME = home;
const cleanups = [];
let host = null;

const fakeCtx = {
  webServer: { register: () => () => {} },
  tools: { register: () => {} },
  connection: { requestRejection: () => undefined },
  systemPrompt: { section: () => () => {}, getSectionOrder: () => 500 },
  commands: { register: () => () => {} },
  agents: { get: () => undefined },
  provide: (name, value) => { if (name === "workbench") host = value; },
  effect: (fn) => { const d = fn(); if (typeof d === "function") cleanups.push(d); },
};

function assert(cond, message) {
  if (!cond) throw new Error("断言失败：" + message);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitFor(fn, message, timeoutMs) {
  const deadline = Date.now() + (timeoutMs || 3000);
  for (;;) {
    const hit = await fn();
    if (hit) return hit;
    if (Date.now() > deadline) throw new Error("等待超时：" + message);
    await sleep(20);
  }
}

let failed = false;
try {
  const shell = await import("../packages/shell/lib/index.js");
  shell.apply(fakeCtx);
  if (!host) throw new Error("workbench service not provided");
  assert(host.events && typeof host.events.push === "function", "宿主应提供 host.events.push");

  const message = await import("../packages/addons/message/lib/index.js");
  message.apply({ workbench: host, effect: fakeCtx.effect });

  // 1. 消费 action 存在且只允许插件来源。
  const domains = host.listDomains();
  const messageDomain = domains.find((d) => d.id === "wb-addon-message");
  assert(messageDomain, "消息域应已注册");
  const stats = host.events.stats ? host.events.stats() : { subscriptions: 1 };
  assert(Number(stats.subscriptions) >= 1, "消息插件应已订阅至少一个事件");

  const schema = (await host.invoke("message.actionSchema", {})).result;
  const entry = schema.actions.find((a) => a.name === "message.onMailSynced");
  assert(entry, "消费 action 应出现在 Action 清单里");
  assert(
    Array.isArray(entry.origins) && entry.origins.length === 1 && entry.origins[0] === "plugin",
    "消费 action 的 origins 必须恰好是 [\"plugin\"]，实际：" + JSON.stringify(entry.origins),
  );

  // 2. 宿主推事件 → 消息落库。
  const payload = {
    accountId: "acc-1",
    accountName: "12306@rails.com.cn",
    mailbox: "INBOX",
    inserted: 2,
    exists: 120,
    latestUid: 9001,
    messages: [
      { subject: "网易邮箱账号安全通知", fromName: "我的网易邮箱", fromAddr: "no-reply@163.com", uid: 9001 },
      { subject: "上一封", fromName: "某人", fromAddr: "a@b.test", uid: 9000 },
    ],
  };
  host.events.push("mail.messages-synced", payload);
  const created = await waitFor(async () => {
    const listed = await host.invoke("message.list", { source: "mail", text: "新邮件" }, "agent");
    return listed.result.records[0] || null;
  }, "邮件事件应生成一条消息");
  assert(created.source === "mail", "消息来源应为 mail");
  assert(created.title.includes("12306@rails.com.cn"), "标题带账户名，实际：" + created.title);
  assert(created.title.includes("网易邮箱账号安全通知"), "标题带最新一封主题，实际：" + created.title);
  assert(created.body.includes("我的网易邮箱"), "正文带发件人，实际：" + created.body);

  // 3. 同一批新信幂等；uid 变了才新增。
  host.events.push("mail.messages-synced", payload);
  await sleep(150);
  const again = await host.invoke("message.list", { source: "mail" }, "agent");
  assert(again.result.records.length === 1, "同一 latestUid 不应重复提醒，实际 " + again.result.records.length + " 条");

  host.events.push("mail.messages-synced", Object.assign({}, payload, { latestUid: 9002, messages: [{ subject: "新的一封", fromName: "某人", uid: 9002 }] }));
  const second = await waitFor(async () => {
    const listed = await host.invoke("message.list", { source: "mail" }, "agent");
    return listed.result.records.length >= 2 ? listed.result.records : null;
  }, "uid 变化后应新增一条提醒");
  assert(second.length === 2, "uid 变化后应有两条，实际 " + second.length);

  // 4. 邮件侧已解耦：不再判断消息插件、不再直调 message.send，改为推队列事件。
  const autoSync = readFileSync(new URL("../packages/addons/mail/lib/domain/auto-sync.js", import.meta.url), "utf8");
  assert(!autoSync.includes('hasDomain("wb-addon-message")'), "mail 不应再判断消息插件是否安装");
  assert(!autoSync.includes('"message.send"'), "mail 不应再直调 message.send");
  assert(autoSync.includes('api.events.push("mail.messages-synced"'), "mail 应把新信事件推给队列");

  console.log("MAIL MESSAGE QUEUE TEST PASS");
} catch (error) {
  failed = true;
  console.error("MAIL MESSAGE QUEUE TEST FAIL: " + String((error && error.stack) || error));
} finally {
  for (const fn of cleanups.reverse()) {
    try { fn(); } catch { /* 收尾失败不影响结论 */ }
  }
  try { rmSync(home, { recursive: true, force: true }); } catch { /* 临时目录清不掉也不影响结论 */ }
}
process.exit(failed ? 1 : 0);
