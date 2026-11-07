/**
 * 端到端验证：云端发布 → 壳安装子插件 → agent 调 action → 卸载 → 数据仍在 → 重装仍在。
 * 运行：node scripts/e2e.mjs（会在随机端口起临时云，测试完清理）
 */
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createServer as createNetServer } from "node:net";
import { spawn, execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import vm from "node:vm";
import { DatabaseSync } from "node:sqlite";

const root = join(import.meta.dirname, "..");
const tmp = mkdtempSync(join(tmpdir(), "wb-e2e-"));
const home = join(tmp, "home");
mkdirSync(home, { recursive: true });
const cloudData = join(tmp, "cloud");
const tasksDir = join(root, "packages/addons/tasks");
const tasksPkg = JSON.parse(readFileSync(join(tasksDir, "package.json"), "utf8"));
const tagsDir = join(root, "packages/addons/tags");
const tagsPkg = JSON.parse(readFileSync(join(tagsDir, "package.json"), "utf8"));
const sitesDir = join(root, "packages/addons/sites");
const sitesPkg = JSON.parse(readFileSync(join(sitesDir, "package.json"), "utf8"));
const baseVersion = tasksPkg.version;
const upgradeVersion = (() => {
  const p = baseVersion.split(".");
  p[2] = String(Number(p[2]) + 1);
  return p.join(".");
})();

async function freePort() {
  const s = createNetServer();
  await new Promise((r) => s.listen(0, "127.0.0.1", r));
  const port = s.address().port;
  await new Promise((r) => s.close(r));
  return port;
}
async function waitFor(fn, label, ms = 20000) {
  const t0 = Date.now();
  for (;;) {
    try {
      if (await fn()) return;
    } catch {
      /* retry */
    }
    if (Date.now() - t0 > ms) throw new Error("timeout waiting for " + label);
    await new Promise((r) => setTimeout(r, 150));
  }
}
function smokeClients() {
  const calls = [];
  let factory = null;
  const window = {
    __ModuleLoader__: { modules: {}, load(m) { factory = m.factory; } },
  };
  const React = {
    useState(v) { return [v, function () {}]; },
    useEffect() {},
    useMemo(f) { return f(); },
    createElement() { return null; },
  };
  const jsx = { jsx() { return null; }, jsxs() { return null; } };
  const require = (id) => (id === "react" ? React : jsx);
  const ctx = { window, console, navigator: { language: "zh-CN" } };
  vm.runInNewContext(readFileSync(join(root, "packages/shell/client/client.js"), "utf8"), ctx);
  assert.ok(factory, "client factory 未注册");
  const exports_ = factory(require);
  assert.equal(exports_.name, "workbench");
  assert.equal(typeof exports_.apply, "function");
  assert.ok(window.__WB_HOST__, "__WB_HOST__ 未安装");
  window.__WB_HOST__.registerAddon({ id: "smoke", views: [{ id: "v", component: function () { return null; } }] });

  const host = { react: React, jsx: jsx, h: React.createElement, registerAddon(m) { calls.push(m); } };
  const documentStub = {
    getElementById() { return null; },
    createElement() { return { id: "", textContent: "", setAttribute() {}, appendChild() {} }; },
    head: { appendChild() {} },
  };
  vm.runInNewContext(readFileSync(join(root, "packages/addons/tasks/lib/client.js"), "utf8"), { window: { __WB_HOST__: host }, console });
  assert.equal(calls.length, 1, "任务子插件未注册视图");
  assert.equal(calls[0].id, "wb-addon-tasks");
  assert.equal(calls[0].views[0].id, "tasks");
  vm.runInNewContext(readFileSync(join(root, "packages/addons/tags/lib/client.js"), "utf8"), { window: { __WB_HOST__: host }, console });
  assert.equal(calls.length, 2, "标签子插件未注册视图");
  assert.equal(calls[1].id, "wb-addon-tags");
  assert.equal(calls[1].views[0].id, "tags");
  vm.runInNewContext(readFileSync(join(root, "packages/addons/sites/lib/client.js"), "utf8"), { window: { __WB_HOST__: host }, console, document: documentStub });
  assert.equal(calls.length, 3, "站点子插件未注册视图");
  assert.equal(calls[2].id, "wb-addon-sites");
  assert.equal(calls[2].views[0].id, "sites");
  console.log("· 客户端 smoke ok（壳 factory + 任务/标签/站点子插件注册）");
}

const port = await freePort();
const cloud = spawn(
  process.execPath,
  [join(root, "packages/cloud/lib/server.js"), "--port", String(port), "--data", cloudData, "--publish-token", "test-token"],
  { stdio: ["ignore", "pipe", "pipe"] },
);
let cloudLog = "";
cloud.stdout.on("data", (d) => (cloudLog += d));
cloud.stderr.on("data", (d) => (cloudLog += d));

let server = null;
try {
  await waitFor(async () => (await fetch("http://127.0.0.1:" + port + "/v1/catalog/addons")).ok, "cloud up");
  const pub = execFileSync(
    process.execPath,
    [join(root, "scripts/publish-addon.mjs"), "--dir", join(root, "packages/addons/tasks"), "--server", "http://127.0.0.1:" + port, "--token", "test-token"],
    { encoding: "utf8" },
  );
  assert.ok(JSON.parse(pub).ok);
  const pubTags = execFileSync(
    process.execPath,
    [join(root, "scripts/publish-addon.mjs"), "--dir", tagsDir, "--server", "http://127.0.0.1:" + port, "--token", "test-token"],
    { encoding: "utf8" },
  );
  assert.ok(JSON.parse(pubTags).ok);
  const pubSites = execFileSync(
    process.execPath,
    [join(root, "scripts/publish-addon.mjs"), "--dir", sitesDir, "--server", "http://127.0.0.1:" + port, "--token", "test-token"],
    { encoding: "utf8" },
  );
  assert.ok(JSON.parse(pubSites).ok);
  console.log("· 云端发布 ok（任务 + 标签 + 站点）");

  const detail = await (await fetch("http://127.0.0.1:" + port + "/v1/catalog/addons/wb-addon-tasks?shell=0.1.0")).json();
  assert.ok(detail.addon.versions[0].tarball, "catalog 详情缺 tarball");
  assert.equal(detail.addon.compatible_version, baseVersion);
  const tagDetail = await (await fetch("http://127.0.0.1:" + port + "/v1/catalog/addons/wb-addon-tags?shell=0.1.0")).json();
  assert.ok(tagDetail.addon.versions[0].tarball, "标签 catalog 详情缺 tarball");
  assert.equal(tagDetail.addon.compatible_version, tagsPkg.version);
  const siteDetail = await (await fetch("http://127.0.0.1:" + port + "/v1/catalog/addons/wb-addon-sites?shell=0.1.0")).json();
  assert.ok(siteDetail.addon.versions[0].tarball, "站点 catalog 详情缺 tarball");
  assert.equal(siteDetail.addon.compatible_version, sitesPkg.version);
  console.log("· catalog 详情含 tarball + compatible_version（任务 + 标签 + 站点）");

  process.env.WB_HOME = home;
  process.env.WB_CLOUD_URL = "http://127.0.0.1:" + port;
  let handler = null;
  let tool = null;
  const disposers = [];
  const ctx = {
    webServer: { register(cfg) { handler = cfg.handler; return function () {}; } },
    tools: { register(t) { tool = t; return function () {}; } },
    connection: { requestRejection() { return undefined; } },
    effect(fn) { const d = fn(); if (typeof d === "function") disposers.push(d); },
  };
  const mod = await import(pathToFileURL(join(root, "packages/shell/lib/index.js")).href + "?e2e=" + Date.now());
  mod.apply(ctx);
  server = createServer((req, res) => {
    Promise.resolve(handler(req, res)).catch((e) => {
      res.statusCode = 500;
      res.end(JSON.stringify({ ok: false, error: String(e && e.message || e) }));
    });
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.address().port + "/workbench/api";
  await waitFor(async () => (await fetch(base + "/addons")).ok, "shell handler");

  const before = await (await fetch(base + "/addons")).json();
  assert.equal(before.addons.length, 0);
  const inst = await (await fetch(base + "/addons/wb-addon-tasks/install", { method: "POST" })).json();
  assert.ok(inst.ok, "安装失败: " + JSON.stringify(inst));
  const after = await (await fetch(base + "/addons")).json();
  assert.equal(after.addons.length, 1);
  assert.equal(after.addons[0].version, baseVersion);
  assert.match(after.addons[0].client, /\/client\.js$/);
  const clientRes = await fetch(base + after.addons[0].client.replace("/workbench/api", ""));
  assert.equal(clientRes.status, 200);
  console.log("· 安装 ok（含 client.js 可下载）");

  const created = await tool.execute({ action: "tasks.create", title: "e2e 任务", priority: 1 });
  assert.match(created.text, /已创建/);
  const listed = await tool.execute({ action: "tasks.list" });
  assert.ok(listed.text.includes("e2e 任务"), "工具读不到刚创建的任务: " + listed.text);
  const viaHttp = await (await fetch(base + "/addons/wb-addon-tasks/actions/tasks.list", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).json();
  assert.ok(viaHttp.ok && viaHttp.result.records.some((t) => t.title === "e2e 任务"));
  console.log("· action 调用 ok（工具 + HTTP 两条路）");

  // 第二个子插件：标签。验证多插件并存、独立 action、client.js、卸载保留数据
  const tagsInst = await (await fetch(base + "/addons/wb-addon-tags/install", { method: "POST" })).json();
  assert.ok(tagsInst.ok, "标签安装失败: " + JSON.stringify(tagsInst));
  const withTags = await (await fetch(base + "/addons")).json();
  assert.equal(withTags.addons.length, 2, "两个子插件未并存");
  const tagsEntry = withTags.addons.find((a) => a.id === "wb-addon-tags");
  assert.ok(tagsEntry, "已装列表缺标签子插件");
  assert.equal(tagsEntry.version, tagsPkg.version);
  const tagClientRes = await fetch(base + tagsEntry.client.replace("/workbench/api", ""));
  assert.equal(tagClientRes.status, 200);
  const tagCreated = await tool.execute({ action: "tags.create", name: "e2e 标签" });
  assert.match(tagCreated.text, /已创建/);
  const tagListed = await tool.execute({ action: "tags.list" });
  assert.ok(tagListed.text.includes("e2e 标签"), "工具读不到刚创建的标签: " + tagListed.text);
  const tagSearched = await tool.execute({ action: "tags.search", text: "e2e" });
  assert.ok(tagSearched.text.includes("e2e 标签"), "标签搜索失败: " + tagSearched.text);
  const tagDup = await tool.execute({ action: "tags.create", name: "e2e 标签" });
  assert.match(tagDup.text, /错误/);
  const tagViaHttp = await (await fetch(base + "/addons/wb-addon-tags/actions/tags.list", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).json();
  assert.ok(tagViaHttp.ok && tagViaHttp.result.records.some((t) => t.name === "e2e 标签"));
  console.log("· 标签安装 + action ok（工具 + HTTP 两条路）");

  // 第三个子插件：站点。验证目录树 action、站点创建、标签/目录关联、卸载保留数据
  const sitesInst = await (await fetch(base + "/addons/wb-addon-sites/install", { method: "POST" })).json();
  assert.ok(sitesInst.ok, "站点安装失败: " + JSON.stringify(sitesInst));
  const withSites = await (await fetch(base + "/addons")).json();
  assert.equal(withSites.addons.length, 3, "三个子插件未并存");
  const sitesEntry = withSites.addons.find((a) => a.id === "wb-addon-sites");
  assert.ok(sitesEntry, "已装列表缺站点子插件");
  assert.equal(sitesEntry.version, sitesPkg.version);
  const siteClientRes = await fetch(base + sitesEntry.client.replace("/workbench/api", ""));
  assert.equal(siteClientRes.status, 200);
  const nodeCreated = await (await fetch(base + "/addons/wb-addon-sites/actions/siteNodes.create", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ parentId: 0, name: "e2e 目录" }) })).json();
  assert.ok(nodeCreated.ok, "目录创建失败: " + JSON.stringify(nodeCreated));
  const nodeId = nodeCreated.result.node.id;
  assert.ok(nodeId, "目录创建缺 id");
  const tagId = tagViaHttp.result.records.find((t) => t.name === "e2e 标签").id;
  const siteCreated = await (await fetch(base + "/addons/wb-addon-sites/actions/sites.create", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ siteName: "e2e 站点", description: "端到端站点", dirIds: [nodeId], tagIds: [tagId], siteLinks: [{ description: "官网", link: "https://example.com", isDefault: true }] }) })).json();
  assert.ok(siteCreated.ok, "站点创建失败: " + JSON.stringify(siteCreated));
  assert.equal(siteCreated.result.site.siteName, "e2e 站点");
  assert.equal(siteCreated.result.site.tags.length, 1);
  const siteViaTool = await tool.execute({ action: "sites.list" });
  assert.ok(siteViaTool.text.includes("e2e 站点"), "工具读不到刚创建的站点: " + siteViaTool.text);
  console.log("· 站点安装 + 目录/站点 action ok（工具 + HTTP 两条路）");

  const sitesUn = await (await fetch(base + "/addons/wb-addon-sites", { method: "DELETE" })).json();
  assert.ok(sitesUn.ok);
  const afterSitesUn = await (await fetch(base + "/addons")).json();
  assert.equal(afterSitesUn.addons.length, 2);
  const sitesFailed = await tool.execute({ action: "sites.list" });
  assert.match(sitesFailed.text, /错误/);
  const rawSites = new DatabaseSync(join(home, "workbench.db"));
  const siteRows = rawSites.prepare("SELECT site_name FROM site WHERE deleted_at IS NULL").all();
  rawSites.close();
  assert.ok(siteRows.some((r) => r.site_name === "e2e 站点"), "卸载站点后数据丢了");
  console.log("· 站点卸载 ok：代码移除、站点数据保留");

  const tagUn = await (await fetch(base + "/addons/wb-addon-tags", { method: "DELETE" })).json();
  assert.ok(tagUn.ok);
  const afterTagUn = await (await fetch(base + "/addons")).json();
  assert.equal(afterTagUn.addons.length, 1);
  const tagFailed = await tool.execute({ action: "tags.list" });
  assert.match(tagFailed.text, /错误/);
  const rawTags = new DatabaseSync(join(home, "workbench.db"));
  const tagRows = rawTags.prepare("SELECT name FROM tag WHERE deleted_at IS NULL").all();
  rawTags.close();
  assert.ok(tagRows.some((r) => r.name === "e2e 标签"), "卸载标签后数据丢了");
  console.log("· 标签卸载 ok：代码移除、标签数据保留");

  const un = await (await fetch(base + "/addons/wb-addon-tasks", { method: "DELETE" })).json();
  assert.ok(un.ok);
  const gone = await (await fetch(base + "/addons")).json();
  assert.equal(gone.addons.length, 0);
  const failed = await tool.execute({ action: "tasks.list" });
  assert.match(failed.text, /错误/);
  const raw = new DatabaseSync(join(home, "workbench.db"));
  const rows = raw.prepare("SELECT title FROM task WHERE deleted_at IS NULL").all();
  raw.close();
  assert.ok(rows.some((r) => r.title === "e2e 任务"), "卸载后数据丢了");
  console.log("· 卸载 ok：代码移除、任务数据保留");

  const reinst = await (await fetch(base + "/addons/wb-addon-tasks/install", { method: "POST" })).json();
  assert.ok(reinst.ok, "重装失败: " + JSON.stringify(reinst));
  const again = await tool.execute({ action: "tasks.list" });
  assert.ok(again.text.includes("e2e 任务"), "重装后数据没回来: " + again.text);
  console.log("· 重装 ok：数据仍在");

  // 升级：发布本地的下一个补丁版本，安装后旧版本目录消失、数据保留
  const upDir = join(tmp, "upgrade-tasks");
  cpSync(join(root, "packages/addons/tasks"), upDir, { recursive: true });
  const upPkgPath = join(upDir, "package.json");
  const upPkg = JSON.parse(readFileSync(upPkgPath, "utf8"));
  upPkg.version = upgradeVersion;
  upPkg.wb.addon.version = upgradeVersion;
  writeFileSync(upPkgPath, JSON.stringify(upPkg, null, 2) + "\n");
  execFileSync(process.execPath, [join(root, "scripts/publish-addon.mjs"), "--dir", upDir, "--server", "http://127.0.0.1:" + port, "--token", "test-token"], { encoding: "utf8" });
  const upInst = await (await fetch(base + "/addons/wb-addon-tasks/install", { method: "POST" })).json();
  assert.ok(upInst.ok, "升级失败: " + JSON.stringify(upInst));
  const upgraded = await (await fetch(base + "/addons")).json();
  assert.equal(upgraded.addons[0].version, upgradeVersion);
  const afterUpgrade = await tool.execute({ action: "tasks.list" });
  assert.ok(afterUpgrade.text.includes("e2e 任务"), "升级后数据丢了");
  console.log("· 升级 ok：" + baseVersion + " → " + upgradeVersion + "，数据保留");

  // 坏包：入口文件缺失，应安装为 disabled 而不是拖垮壳
  const badDir = join(tmp, "broken-addon");
  cpSync(join(root, "packages/addons/tasks"), badDir, { recursive: true });
  const badPkgPath = join(badDir, "package.json");
  const badPkg = JSON.parse(readFileSync(badPkgPath, "utf8"));
  badPkg.name = "wb-addon-broken";
  badPkg.main = "lib/missing.js";
  badPkg.wb.addon.id = "wb-addon-broken";
  badPkg.wb.addon.title = "坏包子插件";
  badPkg.wb.addon.toolActions = [];
  writeFileSync(badPkgPath, JSON.stringify(badPkg, null, 2) + "\n");
  execFileSync(process.execPath, [join(root, "scripts/publish-addon.mjs"), "--dir", badDir, "--server", "http://127.0.0.1:" + port, "--token", "test-token"], { encoding: "utf8" });
  const badInst = await (await fetch(base + "/addons/wb-addon-broken/install", { method: "POST" })).json();
  assert.ok(badInst.ok, "坏包安装请求失败: " + JSON.stringify(badInst));
  const badEntry = badInst.addon || {};
  assert.equal(badEntry.enabled, false, "坏包未被 disable");
  assert.match(String(badEntry.error), /入口文件不存在/);
  const stillOk = await tool.execute({ action: "tasks.list" });
  assert.ok(stillOk.text.includes("e2e 任务"), "坏包影响了已装子插件");
  const badUn = await (await fetch(base + "/addons/wb-addon-broken", { method: "DELETE" })).json();
  assert.ok(badUn.ok);
  console.log("· 坏包 ok：自动 disable，壳与其它子插件不受影响");

  smokeClients();
  for (const d of disposers.reverse()) d();
  console.log("\nE2E PASS");
} catch (e) {
  console.error("\nE2E FAIL:", e);
  if (cloudLog) console.error("--- cloud log ---\n" + cloudLog.slice(-3000));
  process.exitCode = 1;
} finally {
  if (server) await new Promise((r) => server.close(r));
  cloud.kill("SIGTERM");
  await new Promise((r) => setTimeout(r, 200));
  rmSync(tmp, { recursive: true, force: true });
}
