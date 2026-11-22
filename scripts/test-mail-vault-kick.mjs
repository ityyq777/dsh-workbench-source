/**
 * 保险箱解锁 → 邮件即时同步（不启动 DSH、不连 IMAP）：
 * 1. 邮件插件注册 plugin-only 的 mail.onVaultUnlocked 并订阅 vault.unlocked；
 * 2. 事件到达后消费 action 被执行、能读到返回体，且没有账户时不打服务器；
 * 3. 保险箱侧在解锁成功后推事件（静态断言；真口令路径由保险箱自己的测试覆盖）。
 */
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const home = mkdtempSync(join(tmpdir(), "wb-mail-vault-"));
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

  const mail = await import("../packages/addons/mail/lib/index.js");
  mail.apply({ workbench: host, effect: fakeCtx.effect });

  // 1. 消费 action 存在、只允许插件来源。
  const schema = (await host.invoke("mail.actionSchema", {})).result;
  const entry = schema.actions.find((a) => a.name === "mail.onVaultUnlocked");
  assert(entry, "邮件应注册 mail.onVaultUnlocked");
  assert(
    Array.isArray(entry.origins) && entry.origins.length === 1 && entry.origins[0] === "plugin",
    "消费 action 的 origins 必须恰好是 [\"plugin\"]，实际：" + JSON.stringify(entry.origins),
  );

  const stats = host.events.stats();
  assert(Number(stats.subscriptions) >= 1, "邮件应已订阅 vault.unlocked");

  // 2. 推解锁事件：没有账户时应正常返回、不打服务器，投递最终 done。
  host.events.push("vault.unlocked", { at: Date.now() });
  const done = await waitFor(() => {
    const s = host.events.stats();
    return s.deliveries && (s.deliveries.pending || 0) === 0 && (s.deliveries.done || 0) >= 1 ? s : null;
  }, "解锁事件应被消费完");

  const status = (await host.invoke("mail.autoSyncStatus", {})).result;
  assert(Array.isArray(status.accounts), "即时同步后仍能读自动同步状态");
  assert(status.accounts.length === 0, "测试库没有邮箱账户");

  // 3. 保险箱侧在解锁成功后推事件。
  const vaultActions = readFileSync(new URL("../packages/addons/vault/lib/domain/actions.js", import.meta.url), "utf8");
  assert(vaultActions.includes('api.events.push("vault.unlocked"'), "保险箱解锁成功后应推 vault.unlocked 事件");

  console.log("MAIL VAULT KICK TEST PASS (deliveries done=" + (done.deliveries.done || 0) + ")");
} catch (error) {
  failed = true;
  console.error("MAIL VAULT KICK TEST FAIL: " + String((error && error.stack) || error));
} finally {
  for (const fn of cleanups.reverse()) {
    try { fn(); } catch { /* 收尾失败不影响结论 */ }
  }
  try { rmSync(home, { recursive: true, force: true }); } catch { /* 临时目录清不掉也不影响结论 */ }
}
process.exit(failed ? 1 : 0);
