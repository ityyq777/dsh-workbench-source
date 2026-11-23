/**
 * 数据清空自测（不启动 DSH，全程临时 WB_HOME，不碰桌面数据）。
 *
 * 覆盖：
 *  - 确认词不对时返回 400，数据原样保留
 *  - 清空业务表、插件配置、同步元数据与云端连接文件
 *  - 清空后回到「仅本机 + 未登录」，同一 DatabaseSync 句柄还能继续写入
 *  - 重复清空幂等
 */
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const home = mkdtempSync(join(tmpdir(), "wb-clear-"));
process.env.WB_HOME = home;
// 预置一份私人云端配置与凭据：清空后必须回到默认仅本机且未登录。
writeFileSync(join(home, "cloud-config.json"), JSON.stringify({ mode: "private", private: { url: "http://127.0.0.1:8792", secret: "secret-0123456789abcdef", deviceId: "shell-clear", deviceName: "DSH Web" } }));
writeFileSync(join(home, "cloud-creds.json"), JSON.stringify({ accessToken: "secret-0123456789abcdef", refreshToken: "", userId: "private-owner", deviceId: "shell-clear" }));

const cleanups = [];
let host = null;
let handler = null;

const fakeCtx = {
  webServer: {
    register: (route) => {
      if (route && route.kind === "prefix" && route.path === "/workbench/api") handler = route.handler;
      return () => {};
    },
  },
  tools: { register: () => {} },
  connection: { requestRejection: () => undefined },
  provide: (name, value) => { if (name === "workbench") host = value; },
  effect: (fn) => { const d = fn(); if (typeof d === "function") cleanups.push(d); },
};

function makeRes() {
  return {
    status: 0,
    headers: {},
    body: Buffer.alloc(0),
    writeHead(status, headers) {
      this.status = status;
      this.headers = headers || {};
    },
    end(chunk) {
      this.body = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk === undefined ? "" : String(chunk));
    },
  };
}

async function call(method, path, body) {
  const req = {
    method,
    url: path,
    headers: body ? { "content-type": "application/json" } : {},
    async *[Symbol.asyncIterator]() {
      if (body) yield Buffer.from(JSON.stringify(body));
    },
  };
  const res = makeRes();
  await handler(req, res);
  try { return { status: res.status, json: JSON.parse(res.body.toString("utf8")) }; } catch { return { status: res.status, json: null }; }
}

function count(table) {
  return Number(host.db.prepare('SELECT COUNT(*) AS n FROM "' + table + '"').get().n);
}

try {
  const shell = await import("../packages/shell/lib/index.js");
  shell.apply(fakeCtx);
  if (!host) throw new Error("workbench service not provided");
  if (!handler) throw new Error("workbench HTTP handler not registered");

  for (const id of ["storage", "tasks", "tags", "sites"]) {
    const addon = await import("../packages/addons/" + id + "/lib/index.js");
    addon.apply({ workbench: host, effect: fakeCtx.effect });
  }

  // 造数据：任务表、任务、标签、站点、物品，外加一条同步游标。
  const tableId = (await host.invoke("taskNodes.create", { parentId: "1", type: "1", name: "清空测试表" }, "agent")).result.node.id;
  await host.invoke("tasks.create", { tableId, title: "清空测试任务", priority: 5 }, "agent");
  const tag = (await host.invoke("tags.create", { name: "清空测试标签" }, "agent")).result;
  const node = (await host.invoke("siteNodes.create", { parentId: "0", name: "清空测试目录" }, "agent")).result.node;
  await host.invoke("sites.create", { siteName: "清空测试站点", dirIds: [node.id], tagIds: [tag.id] }, "agent");
  await host.invoke("storage.create", { name: "清空测试物品", stock: "1" }, "agent");
  host.db.prepare("INSERT INTO sync_state(k, v) VALUES('probe.cursor', '42')").run();
  host.db.prepare("INSERT INTO sync_change_log(seq, table_name, row_id, op, payload, origin, updated_at) VALUES(900001, 'tasks', 'x', 'upsert', '{}', 'local', 1)").run();

  const before = {
    tasks: count("task"),
    tags: count("tag"),
    sites: count("site"),
    storage: count("storage"),
    syncState: count("sync_state"),
  };
  for (const [name, n] of Object.entries(before)) {
    if (!n) throw new Error("fixture 数据缺失：" + name);
  }
  console.log("清空前：", JSON.stringify(before));

  // 1) 确认词不对 → 400，数据不动。
  const wrong = await call("POST", "/workbench/api/data/clear", { confirm: "清空" });
  if (wrong.status !== 400 || wrong.json.code !== "confirm_required") {
    throw new Error("确认词校验失败：" + wrong.status + " " + JSON.stringify(wrong.json));
  }
  if (count("task") !== before.tasks) throw new Error("拒绝清空后数据被改动");
  console.log("确认词校验 ok:", wrong.json.error);

  // 2) 正确确认 → 200，返回清空规模与实际删除的状态文件。
  const cleared = await call("POST", "/workbench/api/data/clear", { confirm: "清空全部数据" });
  if (cleared.status !== 200 || !cleared.json.ok) throw new Error("清空失败：" + cleared.status + " " + JSON.stringify(cleared.json));
  if (!(cleared.json.rows >= before.tasks)) throw new Error("rows 少于已写入数据：" + cleared.json.rows);
  const files = cleared.json.files || [];
  for (const name of ["cloud-config.json", "cloud-creds.json"]) {
    if (!files.includes(name)) throw new Error("未删除状态文件：" + name);
    if (existsSync(join(home, name))) throw new Error("状态文件仍在磁盘上：" + name);
  }
  console.log("清空回执 ok:", JSON.stringify({ tables: cleared.json.tables, rows: cleared.json.rows, files }));

  // 3) 所有表都归零（含宿主元数据、审计与同步表）。
  const tables = host.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map((r) => r.name);
  for (const table of tables) {
    const n = count(table);
    if (n !== 0) throw new Error("表未清空：" + table + " 还有 " + n + " 行");
  }
  console.log("全表清空 ok:", tables.length, "张表");

  // 4) 回到仅本机 + 未登录，同步凭据已清空。
  const account = await call("GET", "/workbench/api/account");
  if (account.json.logged_in !== false) throw new Error("清空后仍显示已登录");
  const cloud = await call("GET", "/workbench/api/cloud/config");
  if (cloud.json.mode !== "none") throw new Error("清空后云端模式不是 none：" + cloud.json.mode);
  if (cloud.json.logged_in !== false) throw new Error("清空后云端配置仍带凭据");
  console.log("云端连接已重置 ok:", cloud.json.mode, JSON.stringify(cloud.json.private));

  // 5) 重复清空幂等（此刻库里仍然全空）。
  const again = await call("POST", "/workbench/api/data/clear", { confirm: "清空全部数据" });
  if (again.status !== 200 || again.json.rows !== 0) throw new Error("重复清空不幂等：" + JSON.stringify(again.json));
  if (again.json.files.length !== 0) throw new Error("重复清空仍报告删除了文件：" + JSON.stringify(again.json.files));
  console.log("重复清空幂等 ok");

  // 6) 同一个库句柄还能继续写入（业务域 setup 只跑一次，不能换连接）。
  host.db.prepare("INSERT INTO meta(k, v) VALUES('probe.after_clear', '1')").run();
  if (count("meta") !== 1) throw new Error("清空后库句柄不可写");
  console.log("清空后库句柄可写 ok");

  console.log("数据清空测试全部通过");
} finally {
  for (const fn of cleanups.reverse()) {
    try { fn(); } catch { /* ignore */ }
  }
  rmSync(home, { recursive: true, force: true });
}
