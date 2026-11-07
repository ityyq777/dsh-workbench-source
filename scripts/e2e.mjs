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

const root = join(import.meta.dirname, "..");
const tmp = mkdtempSync(join(tmpdir(), "wb-e2e-"));
const home = join(tmp, "home");
mkdirSync(home, { recursive: true });
const cloudData = join(tmp, "cloud");

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

  const host = { react: React, jsx: jsx, registerAddon(m) { calls.push(m); } };
  vm.runInNewContext(readFileSync(join(root, "packages/addons/tasks/lib/client.js"), "utf8"), { window: { __WB_HOST__: host }, console });
  assert.equal(calls.length, 1, "任务子插件未注册视图");
  assert.equal(calls[0].id, "wb-addon-tasks");
  assert.equal(calls[0].views[0].id, "tasks");
  console.log("· 客户端 smoke ok（壳 factory + 子插件注册）");
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
  console.log("· 云端发布 ok");

  const detail = await (await fetch("http://127.0.0.1:" + port + "/v1/catalog/addons/wb-addon-tasks?shell=0.1.0")).json();
  assert.ok(detail.addon.versions[0].tarball, "catalog 详情缺 tarball");
  assert.equal(detail.addon.compatible_version, "2.0.1");
  console.log("· catalog 详情含 tarball + compatible_version");

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
  assert.equal(after.addons[0].version, "2.0.1");
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

  const un = await (await fetch(base + "/addons/wb-addon-tasks", { method: "DELETE" })).json();
  assert.ok(un.ok);
  const gone = await (await fetch(base + "/addons")).json();
  assert.equal(gone.addons.length, 0);
  const failed = await tool.execute({ action: "tasks.list" });
  assert.match(failed.text, /错误/);
  const { DatabaseSync } = await import("node:sqlite");
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

  // 升级：发布 2.0.2，安装后旧版本目录消失、数据保留
  const upDir = join(tmp, "upgrade-tasks");
  cpSync(join(root, "packages/addons/tasks"), upDir, { recursive: true });
  const upPkgPath = join(upDir, "package.json");
  const upPkg = JSON.parse(readFileSync(upPkgPath, "utf8"));
  upPkg.version = "2.0.2";
  upPkg.wb.addon.version = "2.0.2";
  writeFileSync(upPkgPath, JSON.stringify(upPkg, null, 2) + "\n");
  execFileSync(process.execPath, [join(root, "scripts/publish-addon.mjs"), "--dir", upDir, "--server", "http://127.0.0.1:" + port, "--token", "test-token"], { encoding: "utf8" });
  const upInst = await (await fetch(base + "/addons/wb-addon-tasks/install", { method: "POST" })).json();
  assert.ok(upInst.ok, "升级失败: " + JSON.stringify(upInst));
  const upgraded = await (await fetch(base + "/addons")).json();
  assert.equal(upgraded.addons[0].version, "2.0.2");
  const afterUpgrade = await tool.execute({ action: "tasks.list" });
  assert.ok(afterUpgrade.text.includes("e2e 任务"), "升级后数据丢了");
  console.log("· 升级 ok：2.0.1 → 2.0.2，数据保留");

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
