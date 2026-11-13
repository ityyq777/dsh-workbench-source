/**
 * 标签来源注册：业务域（task / storage / site）接入契约测试。
 *
 * 覆盖：
 *  1. 三个业务域启动后各自登记了自己的来源（owner 正确、恰好一条）；
 *  2. 重复来源（被别的归属抢占）时，三个域写入标签都报统一可读文案 + code=TAG_SOURCE_DUPLICATED；
 *  3. 来源被注销后，写入报「标签来源未注册，无法操作」+ code=TAG_SOURCE_UNREGISTERED；
 *  4. 恢复注册后写入恢复正常（门禁不误伤正常路径）。
 *
 * 用法：node scripts/test-tag-source-adopt.mjs
 * 说明：宿主注册中心一个进程只能装载一次，因此每个场景各起一个子进程。
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const MODE_ENV = "WB_TAG_SOURCE_MODE";
const self = fileURLToPath(import.meta.url);

function assert(cond, message) {
  if (!cond) throw new Error("断言失败：" + message);
}

async function loadHost(modules) {
  const home = mkdtempSync(join(tmpdir(), "wb-tag-source-adopt-"));
  process.env.WB_HOME = home;
  let host = null;
  const fakeCtx = {
    webServer: { register: () => () => {} },
    tools: { register: () => {} },
    connection: { requestRejection: () => undefined },
    systemPrompt: { section: () => () => {}, getSectionOrder: () => 500 },
    commands: { register: () => () => {} },
    agents: { get: () => undefined },
    provide: (name, value) => { if (name === "workbench") host = value; },
    effect: (fn) => { fn(); },
  };
  const shell = await import("../packages/shell/lib/index.js");
  shell.apply(fakeCtx);
  if (!host) throw new Error("workbench service not provided");
  for (const name of modules) {
    const plugin = await import("../packages/addons/" + name + "/lib/index.js");
    plugin.apply({ workbench: host, effect: fakeCtx.effect });
  }
  const call = (action, args) => host.invoke(action, args || {}, "agent");
  return { home, host, call };
}

async function errorOf(promise) {
  try {
    await promise;
  } catch (e) {
    return e;
  }
  return null;
}

function assertReadable(e, action, needle) {
  assert(e, action + " 应报错但没有");
  const text = String((e && e.message) || e);
  assert(text.includes(needle), action + " 报错文案缺少「" + needle + "」：" + text);
  assert(!/SQL logic error/.test(text), action + " 抛的是底层 SQL 错误：" + text);
  return e;
}

/** 三个业务域 + 标签域一起装载，并准备好写入所需的业务对象。 */
async function loadAll() {
  const ctx = await loadHost(["tags", "tasks", "storage", "sites"]);
  const { host, call } = ctx;
  const domains = host.listDomains().map((d) => d.id);
  for (const id of ["wb-addon-tags", "wb-addon-tasks", "wb-addon-storage", "wb-addon-sites"]) {
    assert(domains.includes(id), "未装载 " + id);
  }
  const tag = (await call("tags.create", { name: "来源测试标签" })).result.id;
  const table = (await call("taskNodes.create", { parentId: "1", type: "1", name: "来源测试任务表" })).result.node.id;
  const storage = (await call("storage.create", { name: "来源测试物品", stock: "1" })).result.storage.id;
  const dir = (await call("siteNodes.create", { parentId: 0, name: "来源测试目录" })).result.node.id;
  return { ...ctx, tag, table, storage, dir };
}

function sourceRows(host, source) {
  return host.db
    .prepare("SELECT owner FROM tag_source WHERE source=? AND deleted_at IS NULL ORDER BY created_at, id")
    .all(source)
    .map((r) => String(r.owner));
}

async function scenarioSeed() {
  const { home, host, call } = await loadAll();
  const sources = (await call("tags.sources")).result;
  assert(sources.table === true, "tag_source 应已创建");
  for (const [source, owner] of [["task", "wb-addon-tasks"], ["storage", "wb-addon-storage"], ["site", "wb-addon-sites"]]) {
    const owners = sourceRows(host, source);
    assert(owners.length === 1 && owners[0] === owner, source + " 应有且仅有 " + owner + " 一条注册，实际 " + JSON.stringify(owners));
  }
  assert(sources.conflicts.length === 0, "正常启动不应有冲突");
  // 业务域重复启动（幂等）：再 apply 一遍不应新增行
  const tasks = await import("../packages/addons/tasks/lib/index.js");
  const before = host.db.prepare("SELECT COUNT(*) AS n FROM tag_source").get().n;
  const { ensureTaskTagSource } = await import("../packages/addons/tasks/lib/tagging/tagging.js");
  ensureTaskTagSource(host.db, () => {});
  void tasks;
  assert(host.db.prepare("SELECT COUNT(*) AS n FROM tag_source").get().n === before, "重复登记不应新增行");
  rmSync(home, { recursive: true, force: true });
  console.log("TAG SOURCE ADOPT PASS { scenario: seed, sources: 3 }");
}

async function scenarioDuplicate() {
  const { home, host, call, tag, table, storage, dir } = await loadAll();
  // 另一个归属抢注 task 来源
  const reg = (await call("tags.registerSource", { source: "task", owner: "wb-addon-intruder" })).result;
  assert(reg.conflict === true, "抢注应回执 conflict");
  assert(sourceRows(host, "task").length === 2, "抢注后应有两条活跃注册");

  const taskErr = assertReadable(
    await errorOf(call("tasks.create", { tableId: table, title: "重复来源任务", tagIds: [tag] })),
    "tasks.create",
    "标签来源标识重复",
  );
  assert(taskErr.code === "TAG_SOURCE_DUPLICATED", "tasks 错误码应为 TAG_SOURCE_DUPLICATED，实际 " + taskErr.code);
  assert(/请先清理 tag_source 中的重复注册/.test(taskErr.message), "tasks 文案缺少处置建议：" + taskErr.message);

  await call("tags.registerSource", { source: "storage", owner: "wb-addon-intruder" });
  const storageErr = assertReadable(
    await errorOf(call("storage.update", { id: storage, tagIds: [tag] })),
    "storage.update",
    "标签来源标识重复",
  );
  assert(storageErr.code === "TAG_SOURCE_DUPLICATED", "storage 错误码应为 TAG_SOURCE_DUPLICATED");
  assert(/来源：storage/.test(storageErr.message), "storage 文案应带来源标识：" + storageErr.message);

  // 站点同理（另起一条来源重复）
  await call("tags.registerSource", { source: "site", owner: "wb-addon-intruder" });
  const siteErr = assertReadable(
    await errorOf(call("sites.create", { siteName: "重复来源站点", siteLinks: ["https://example.com"], dirIds: [dir], tagIds: [tag] })),
    "sites.create",
    "标签来源标识重复",
  );
  assert(siteErr.code === "TAG_SOURCE_DUPLICATED", "sites 错误码应为 TAG_SOURCE_DUPLICATED");

  // 不带标签的写入不受影响
  const plain = await call("tasks.create", { tableId: table, title: "无标签任务" });
  assert(plain.result.id, "不带标签时 tasks.create 应正常");

  rmSync(home, { recursive: true, force: true });
  console.log("TAG SOURCE ADOPT PASS { scenario: duplicate, domains: 3 }");
}

async function scenarioUnregistered() {
  const { home, host, call, tag, table, storage, dir } = await loadAll();
  // 人为删掉注册行，模拟来源未注册
  host.db.prepare("DELETE FROM tag_source WHERE source=?").run("task");
  host.db.prepare("DELETE FROM tag_source WHERE source=?").run("storage");
  host.db.prepare("DELETE FROM tag_source WHERE source=?").run("site");

  const taskErr = assertReadable(
    await errorOf(call("tasks.create", { tableId: table, title: "未注册任务", tagIds: [tag] })),
    "tasks.create",
    "标签来源未注册",
  );
  assert(taskErr.code === "TAG_SOURCE_UNREGISTERED", "tasks 错误码应为 TAG_SOURCE_UNREGISTERED，实际 " + taskErr.code);
  assert(/来源：task/.test(taskErr.message), "文案应带来源标识：" + taskErr.message);

  const storageErr = assertReadable(
    await errorOf(call("storage.update", { id: storage, tagIds: [tag] })),
    "storage.update",
    "标签来源未注册",
  );
  assert(storageErr.code === "TAG_SOURCE_UNREGISTERED", "storage 错误码应为 TAG_SOURCE_UNREGISTERED");

  const siteErr = assertReadable(
    await errorOf(call("sites.create", { siteName: "未注册站点", siteLinks: ["https://example.org"], dirIds: [dir], tagIds: [tag] })),
    "sites.create",
    "标签来源未注册",
  );
  assert(siteErr.code === "TAG_SOURCE_UNREGISTERED", "sites 错误码应为 TAG_SOURCE_UNREGISTERED");

  // 重新注册后恢复正常
  for (const [source, owner] of [["task", "wb-addon-tasks"], ["storage", "wb-addon-storage"], ["site", "wb-addon-sites"]]) {
    await call("tags.registerSource", { source, owner });
  }
  const ok = await call("tasks.create", { tableId: table, title: "恢复后任务", tagIds: [tag] });
  assert(ok.result.id && (ok.result.task.tagIds || []).includes(tag), "恢复注册后应能写入标签");
  const upd = await call("storage.update", { id: storage, tagIds: [tag] });
  assert((upd.result.storage.tagIds || []).includes(tag), "恢复注册后储物标签应写入");
  const site = await call("sites.create", { siteName: "恢复后站点", siteLinks: ["https://example.net"], dirIds: [dir], tagIds: [tag] });
  assert(site.result.site && (site.result.site.tagIds || []).includes(tag), "恢复注册后站点标签应写入");

  rmSync(home, { recursive: true, force: true });
  console.log("TAG SOURCE ADOPT PASS { scenario: unregistered, domains: 3 }");
}

async function scenarioNoTagSource() {
  // 标签域是 1.7.0（没有 tag_source 表）时的降级：业务域照常工作，不报错。
  const { home, host, call } = await loadHost(["tasks"]);
  void host;
  const table = (await call("taskNodes.create", { parentId: "1", type: "1", name: "无来源表任务表" })).result.node.id;
  const created = await call("tasks.create", { tableId: table, title: "无来源表任务" });
  assert(created.result.id, "没有 tag_source 表时 tasks.create 应正常");
  rmSync(home, { recursive: true, force: true });
  console.log("TAG SOURCE ADOPT PASS { scenario: no-tag-source }");
}

const SCENARIOS = {
  seed: scenarioSeed,
  duplicate: scenarioDuplicate,
  unregistered: scenarioUnregistered,
  "no-tag-source": scenarioNoTagSource,
};

if (process.env[MODE_ENV]) {
  const fn = SCENARIOS[process.env[MODE_ENV]];
  if (!fn) throw new Error("未知场景：" + process.env[MODE_ENV]);
  await fn();
  process.exit(0);
} else {
  let failed = 0;
  const names = Object.keys(SCENARIOS);
  for (const name of names) {
    const r = spawnSync(process.execPath, [self], {
      env: { ...process.env, [MODE_ENV]: name },
      encoding: "utf8",
    });
    if (r.status === 0) {
      console.log((r.stdout || "").trim());
    } else {
      failed += 1;
      console.error("[" + name + "] FAILED\n" + (r.stdout || "").trim() + "\n" + (r.stderr || "").trim());
    }
  }
  if (failed) {
    console.error("TAG SOURCE ADOPT FAILED (" + failed + "/" + names.length + ")");
    process.exit(1);
  }
  console.log("TAG SOURCE ADOPT PASS { scenarios: " + names.length + " }");
}
