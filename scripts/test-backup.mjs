/**
 * 备份导出/导入自测（不启动 DSH）。
 *
 * 通过宿主真正的 /workbench/api/backup/* 路由跑：
 *  - 导出 zip、manifest 模块清单与模块选择
 *  - 导入恢复被硬删的数据
 *  - 备份格式版本不兼容返回 422
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const home = mkdtempSync(join(tmpdir(), "wb-backup-"));
process.env.WB_HOME = home;
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
    headers: {},
    async *[Symbol.asyncIterator]() {
      if (body) yield body;
    },
  };
  const res = makeRes();
  await handler(req, res);
  return res;
}

function parseJson(res) {
  try { return JSON.parse(res.body.toString("utf8")); } catch { return null; }
}

try {
  const shell = await import("../packages/shell/lib/index.js");
  shell.apply(fakeCtx);
  if (!host) throw new Error("workbench service not provided");
  if (!handler) throw new Error("workbench HTTP handler not registered");

  const tasks = await import("../packages/addons/tasks/lib/index.js");
  tasks.apply({ workbench: host, effect: fakeCtx.effect });
  const tags = await import("../packages/addons/tags/lib/index.js");
  tags.apply({ workbench: host, effect: fakeCtx.effect });
  const sites = await import("../packages/addons/sites/lib/index.js");
  sites.apply({ workbench: host, effect: fakeCtx.effect });

  const domains = host.listDomains();
  if (domains.length !== 3) throw new Error("expected 3 domains, got " + domains.length);
  for (const d of domains) {
    if (!d.backup || !d.backup.export || !d.backup.import) throw new Error("missing backup capability: " + d.id);
  }

  const created = await host.invoke("tasks.create", { title: "备份验收任务", priority: 7 }, "agent");
  const taskId = created.result.id;
  const tag = await host.invoke("tags.create", { name: "备份验收标签" }, "agent");
  const node = await host.invoke("siteNodes.create", { parentId: "0", name: "备份验收目录" }, "agent");
  const site = await host.invoke("sites.create", {
    siteName: "备份验收站点",
    dirIds: [node.result.node.id],
    tagIds: [tag.result.id],
    siteLinks: [{ description: "官网", link: "https://example.com", isDefault: true }],
  }, "agent");

  const exported = await call("GET", "/workbench/api/backup/export?modules=all");
  if (exported.status !== 200) throw new Error("export failed: " + exported.status + " " + exported.body.toString());
  if (!/application\/zip/.test(String(exported.headers["content-type"]))) throw new Error("export content-type is not zip");
  const zip = await import("../packages/shell/lib/zip.js");
  const files = zip.zipRead(exported.body);
  const manifest = JSON.parse(files.get("manifest.json").toString("utf8"));
  if (manifest.kind !== "dsh-workbench-backup") throw new Error("bad manifest kind");
  if (manifest.formatVersion !== 1) throw new Error("bad manifest formatVersion");
  if (manifest.shellVersion !== shell.SHELL_VERSION) throw new Error("bad manifest shellVersion");
  if (manifest.modules.length !== 3) throw new Error("expected 3 modules, got " + manifest.modules.length);
  for (const m of manifest.modules) {
    if (!files.has(m.file)) throw new Error("missing module file " + m.file);
  }
  console.log("export ok:", manifest.modules.map((m) => m.id + "@" + m.version).join(", "));

  const onlyTasks = await call("GET", "/workbench/api/backup/export?modules=wb-addon-tasks");
  if (onlyTasks.status !== 200) throw new Error("selected export failed");
  const onlyFiles = zip.zipRead(onlyTasks.body);
  const onlyManifest = JSON.parse(onlyFiles.get("manifest.json").toString("utf8"));
  if (onlyManifest.modules.length !== 1 || onlyManifest.modules[0].id !== "wb-addon-tasks") {
    throw new Error("module selection failed");
  }
  console.log("selection ok:", onlyManifest.modules[0].id);

  const imported = await call("POST", "/workbench/api/backup/import", exported.body);
  if (imported.status !== 200) throw new Error("import failed: " + imported.status + " " + imported.body.toString());
  const report = parseJson(imported);
  if (!report || !report.ok || report.summary.ok !== 3) throw new Error("import report not ok: " + JSON.stringify(report));
  console.log("import ok:", report.summary);

  const db = new DatabaseSync(join(home, "workbench.db"));
  db.exec("DELETE FROM task");
  db.close();
  const empty = await host.invoke("tasks.list", {}, "agent");
  if (empty.result.records.some((t) => t.id === taskId)) throw new Error("task should be gone after delete");
  const restored = await call("POST", "/workbench/api/backup/import", exported.body);
  if (restored.status !== 200) throw new Error("restore import failed");
  const restoredList = await host.invoke("tasks.list", {}, "agent");
  if (!restoredList.result.records.some((t) => t.id === taskId)) throw new Error("task was not restored");
  console.log("restore ok:", taskId);

  const tamperedFiles = [];
  for (const [name, data] of files) {
    if (name === "manifest.json") {
      const bad = JSON.parse(data.toString("utf8"));
      bad.formatVersion = 2;
      tamperedFiles.push({ name, data: Buffer.from(JSON.stringify(bad), "utf8") });
    } else {
      tamperedFiles.push({ name, data });
    }
  }
  const incompatible = await call("POST", "/workbench/api/backup/import", zip.zipCreate(tamperedFiles));
  if (incompatible.status !== 422) throw new Error("expected 422, got " + incompatible.status);
  const bad = parseJson(incompatible);
  if (!bad || bad.code !== "incompatible") throw new Error("expected incompatible code");
  console.log("incompatible guard ok:", incompatible.status);

  const siteList = await host.invoke("sites.list", {}, "agent");
  if (!siteList.result.records.some((s) => s.id === site.result.site.id)) throw new Error("site not listed");
  console.log("BACKUP TEST PASS", { modules: manifest.modules.length, home });
} finally {
  for (const fn of cleanups.reverse()) { try { fn(); } catch {} }
  rmSync(home, { recursive: true, force: true });
}
