/** 专用宿主归属集成测试：只使用临时 WB_HOME，不访问安装实例。 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const home = mkdtempSync(join(tmpdir(), "wb-ownership-host-"));
process.env.WB_HOME = home;
const cleanups = [];
let host, tool, route;
const ctx = {
  webServer: { register(value) { route = value; return () => {}; } },
  provide(name, value) { if (name === "workbench") host = value; },
  tools: { register(value) { tool = value; } },
  effect(fn) { const cleanup = fn(); if (typeof cleanup === "function") cleanups.push(cleanup); },
};
const call = (action, args = {}) => host.invoke(action, args, "agent");
const text = async (action, args = {}) => (await tool.execute({ action, args })).text;
try {
  const shell = await import("../packages/shell/lib/index.js");
  const packageVersion = JSON.parse(readFileSync(new URL("../packages/shell/package.json", import.meta.url), "utf8")).version;
  assert.equal(shell.SHELL_VERSION, packageVersion, "宿主运行时版本必须与 package.json 一致");
  shell.apply(ctx);
  assert.equal(host.shellVersion, packageVersion);
  const listed = await call("capabilities.list");
  assert.equal(listed.result.shellVersion, packageVersion);
  assert.ok(listed.text.startsWith("工作台 " + packageVersion + " · "));
  for (const name of ["storage", "sites"]) {
    (await import("../packages/addons/" + name + "/lib/index.js")).apply({ workbench: host, effect: ctx.effect });
  }
  assert.equal((await call("capabilities.get", { domain: "storage" })).result.shellVersion, packageVersion);
  const cap = async (domain = "storage") => (await call("capabilities.get", { domain })).result.capability.taskOwnership;
  assert.equal((await cap()).status, "unconfigured");
  assert.match(await text("capabilities.get", { domain: "storage" }), /storage.create/);
  assert.match(await text("capabilities.get", { domain: "storage" }), /tasks.create/);
  assert.match(await text("capabilities.setTaskTarget", { domain: "storage", tableId: "x" }), /TASKS_UNAVAILABLE/);
  assert.equal((await cap()).configured, false);
  (await import("../packages/addons/tasks/lib/index.js")).apply({ workbench: host, effect: ctx.effect });
  assert.ok(host.listDomains().every(d => d.enabled), "插件必须启用");
  const root = host.db.prepare("SELECT id FROM task_node WHERE parent_id='0' AND deleted_at IS NULL").get().id;
  const group = (await call("taskNodes.create", { parentId: root, type: "0", name: "宿主归属测试" })).result.node.id;
  const table = (await call("taskNodes.create", { parentId: group, type: "1", name: "物品插件开发", description: "只收录插件开发" })).result.node.id;
  const mapping = await call("capabilities.setTaskTarget", { domain: "storage", tableId: table });
  assert.equal(mapping.result.configured, true);
  assert.equal(String(mapping.result.tableId), String(table));
  assert.match(mapping.text, /宿主归属测试.*物品插件开发/);
  assert.equal(mapping.result.description, "只收录插件开发");
  assert.equal((await cap("sites")).configured, false, "配置不跨域");
  assert.ok(!host.listDomains().some(d => d.id === "wb-addon-tags"));
  assert.equal((await cap()).configured, true, "缺 tags 不阻断归属发现");
  const count = host.db.prepare("SELECT COUNT(*) AS n FROM task_node").get().n;
  const invalid = await text("capabilities.setTaskTarget", { domain: "storage", tableId: group });
  assert.match(invalid, /错误/);
  assert.equal((await cap()).tableId, String(table), "失败不能覆盖有效映射");
  host.db.prepare("UPDATE task_node SET name='已改名' WHERE id=?").run(table);
  assert.match(await text("capabilities.get", { domain: "storage" }), /已改名/);
  host.db.prepare("UPDATE task_node SET deleted_at=1 WHERE id=?").run(group);
  const stale = await cap();
  assert.equal(stale.status, "invalid");
  assert.equal(stale.tableId, null);
  assert.equal(stale.configuredTableId, String(table));
  assert.match(stale.message, /未配置/);
  assert.equal(stale.nextActions[0].action, "tasks.resolveTable");
  assert.equal(host.db.prepare("SELECT COUNT(*) AS n FROM task_node").get().n, count, "发现不得自动造表");
  const clear = await call("capabilities.setTaskTarget", { domain: "storage", tableId: null });
  assert.equal(clear.result.status, "unconfigured");
  assert.match(await text("capabilities.setTaskTarget", { domain: "storage" }), /TABLE_REQUIRED/);
  assert.match(await text("capabilities.setTaskTarget", { domain: "no-such-domain", tableId: null }), /DOMAIN_NOT_FOUND/);
  const help = await call("actions.help", { action: "capabilities.setTaskTarget" });
  assert.deepEqual(help.result.input.required, ["domain", "tableId"]);
  assert.deepEqual(help.result.input.properties.tableId.type, ["string", "number", "null"]);
  const singleHelp = await call("actions.help", { action: "tasks.create" });
  assert.ok(singleHelp.result.input.oneOf);
  assert.match(singleHelp.text, /args 必须恰好满足一个分支/);
  const bulkHelp = await call("actions.help", { action: "tasks.bulkCreate" });
  assert.ok(bulkHelp.text.includes("args.records[] 必须恰好满足一个分支"));
  const error = await text("tasks.create", { title: "缺少表不得创建" });
  assert.match(error, /TABLE_REQUIRED/);
  assert.match(error, /nextActions/);
  assert.match(error, /tasks.resolveTable/);
  assert.ok(!error.includes("已创建任务"));
  const stop = host.registerDomain({
    id: "wb-addon-fixture", title: "fixture", version: "1.0.0",
    setup(api) { api.action("fixture.fail", { input: { type: "object", properties: {} }, execute() {
      const e = new Error("独立错误消息"); e.code = "FIXTURE_CODE";
      e.details = { candidates: [{ id: "chosen", path: "根 / 候选" }], example: { action: "tasks.resolveTable", args: { query: "归属" } } };
      throw e;
    } }); },
  });
  const detailText = await text("fixture.fail");
  for (const fragment of ["独立错误消息", "FIXTURE_CODE", "candidates", "根 / 候选", "example", "tasks.resolveTable"]) assert.ok(detailText.includes(fragment));
  let status, response;
  await route.handler({ url: "/workbench/api/domains/wb-addon-fixture/actions/fixture.fail", method: "POST", async *[Symbol.asyncIterator]() { yield Buffer.from("{}"); } }, {
    writeHead(code) { status = code; }, end(body) { response = JSON.parse(body); },
  });
  assert.equal(status, 500);
  assert.equal(response.ok, false);
  assert.equal(response.error, detailText.slice("错误：".length), "UI RPC 与 Workbench 错误详情一致且不伪装成功");
  stop();
  (await import("../packages/addons/tags/lib/index.js")).apply({ workbench: host, effect: ctx.effect });
  assert.match((await call("capabilities.get", { domain: "tags" })).text, /tags.create/);
  assert.match((await call("capabilities.get", { domain: "sites" })).text, /sites.create/);
  console.log("PASS host ownership: mapping validation/rename/invalid/clear, missing plugins, oneOf help, Workbench details");
} finally {
  for (const cleanup of cleanups.reverse()) cleanup();
  rmSync(home, { recursive: true, force: true });
}
