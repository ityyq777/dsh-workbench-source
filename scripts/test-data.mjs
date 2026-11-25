// 数据页下线回归：12 个业务插件不再自带「数据」页，也不再注册 <域>.dataTables / <域>.dataQuery。
// 数据浏览已收敛到宿主统一「数据」页（wb.dataTables / wb.dataQuery），白名单来自各插件
// registerDomain({ tables }) 的表声明——所以这里同时守住「声明仍在、且只声明自己的业务表」。
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = mkdtempSync(join(tmpdir(), "wb-data-"));
const db = new DatabaseSync(join(dir, "data.db"));
db.exec("CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL)");

async function load(rel, id, opts) {
  const defs = {};
  const api = {
    db,
    addon: { id: id, version: "0.0.0", dir },
    shellVersion: "0.0.0",
    log: function () {},
    emit: function () {},
    action: function (name, def) { defs[name] = def; },
    tool: function () {},
    hasAddon: function (x) { return !!(opts && opts.tags) && x === "wb-addon-tags"; },
  };
  const mod = await import(rel);
  mod.setup(api);
  return { has: function (name) { return !!defs[name]; } };
}
function assert(cond, msg) { if (!cond) throw new Error("ASSERT: " + msg); }

// 插件目录名与它使用的 action 前缀（sites/tasks/storage 有多组前缀）。
const PLUGINS = [
  ["calendar", ["calendar"]],
  ["connector", ["connector"]],
  ["contacts", ["contacts"]],
  ["danmaku", ["danmaku"]],
  ["mail", ["mail"]],
  ["message", ["message"]],
  ["salary", ["salary"]],
  ["sites", ["sites", "siteTags", "siteNodes"]],
  ["storage", ["storage"]],
  ["tags", ["tags"]],
  ["tasks", ["tasks", "taskNodes", "taskTimelines"]],
  ["vault", ["vault"]],
];

// 1. 元数据：不再有 data 视图，也没有数据页 action；表声明仍在（宿主数据页的白名单来源）
let declaredTables = 0;
for (const [plugin, prefixes] of PLUGINS) {
  const manifest = JSON.parse(readFileSync(new URL("../packages/addons/" + plugin + "/package.json", import.meta.url), "utf8"));
  const addon = (manifest.wb && manifest.wb.addon) || {};
  assert(Array.isArray(addon.views) && addon.views.indexOf("data") < 0, plugin + " 不应再声明 data 视图");
  const toolActions = addon.toolActions || [];
  for (const prefix of prefixes) {
    for (const suffix of ["dataTables", "dataQuery"]) {
      const name = prefix + "." + suffix;
      assert(toolActions.indexOf(name) < 0, plugin + " 不应再注册 " + name + "（数据浏览走宿主统一数据页）");
    }
  }
  const tables = addon.tables || [];
  assert(tables.length > 0, plugin + " 仍须声明自己的业务表，供宿主统一数据页聚合");
  assert(tables.indexOf("meta") < 0 && !tables.some(function (t) { return String(t).indexOf("sync_") === 0; }), plugin + " 声明了平台表");
  declaredTables += tables.length;
}

// 2. 运行时：装载四个插件，确认它们既没有注册数据页 action，也没把数据页当取数入口
const tags = await load("../packages/addons/tags/lib/index.js", "wb-addon-tags");
const tasks = await load("../packages/addons/tasks/lib/index.js", "wb-addon-tasks", { tags: true });
const sites = await load("../packages/addons/sites/lib/index.js", "wb-addon-sites", { tags: true });
const storage = await load("../packages/addons/storage/lib/index.js", "wb-addon-storage", { tags: true });
for (const [name, mod, prefixes] of [
  ["tags", tags, ["tags"]],
  ["tasks", tasks, ["tasks", "taskNodes", "taskTimelines"]],
  ["sites", sites, ["sites", "siteTags", "siteNodes"]],
  ["storage", storage, ["storage"]],
]) {
  for (const prefix of prefixes) {
    assert(!mod.has(prefix + ".dataTables"), name + " 运行时仍在注册 " + prefix + ".dataTables");
    assert(!mod.has(prefix + ".dataQuery"), name + " 运行时仍在注册 " + prefix + ".dataQuery");
  }
  // 业务 action 仍在（避免把整段注册一起删掉）
  assert(mod.has(prefixes[0] + ".stats") || mod.has(prefixes[0] + ".list") || mod.has(prefixes[0] + ".actionSchema"), name + " 业务 action 缺失");
}

rmSync(dir, { recursive: true, force: true });
console.log("DATA TEST PASS " + JSON.stringify({ plugins: PLUGINS.length, declaredTables: declaredTables, dataViews: 0, dataActions: 0 }));
