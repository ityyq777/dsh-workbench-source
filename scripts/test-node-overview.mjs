import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import * as tasks from "../packages/addons/tasks/lib/index.js";
import * as sites from "../packages/addons/sites/lib/index.js";

function fixture(mod) {
  const db = new DatabaseSync(":memory:");
  const defs = {};
  const api = { db, addon: { version: "test" }, log() {}, emit() {},
    action(name, def) { defs[name] = def; }, hasAddon() { return false; } };
  mod.setup(api);
  return { db, defs, call(name, args = {}) { return defs[name].execute(args, { origin: "test", emit() {} }); } };
}
function flatten(nodes) { return nodes.flatMap(node => [node, ...flatten(node.children)]); }
function captureDomain(mod) {
  let domain;
  mod.apply({ workbench: { registerDomain(value) { domain = value; return () => {}; } }, effect(fn) { fn(); } });
  return domain;
}
function assertQueries(db, fn) {
  let queries = 0;
  const tracked = { prepare(sql) { queries++; assert.match(sql, /^WITH RECURSIVE/); return db.prepare(sql); } };
  const result = fn(tracked);
  assert.equal(queries, 2, "overview must use two batch reads irrespective of tree size");
  return result;
}
const longDescription = "用于存储类任务的规划、开发、验证与维护。".repeat(12) + "尾部边界不能丢失😀";
const t = fixture(tasks);
try {
  t.db.exec("DELETE FROM task; DELETE FROM task_node;");
  const node = t.db.prepare("INSERT INTO task_node(id,name,description,type,parent_id,path,sort,depth,created_at,updated_at,deleted_at) VALUES(?,?,?,?,?,?,?,?,1,?,?)");
  node.run("r", "根", "", "2", "0", "/r/", 0, 0, 10, null);
  node.run("g", "开发", "分组", "0", "r", "/r/g/", 0, 1, 20, null);
  node.run("a", "存储", longDescription, "1", "g", "/r/g/a/", 0, 2, 30, null);
  node.run("b", "空表", "", "1", "g", "/r/g/b/", 1, 2, 40, null);
  node.run("gone", "已删组", "", "0", "r", "/r/gone/", 2, 1, 9999, 1);
  node.run("hidden", "不可见后代", "", "1", "gone", "/r/gone/hidden/", 0, 2, 9999, null);
  const task = t.db.prepare("INSERT INTO task(id,title,table_id,status,publish_date,target_date,created_at,updated_at,deleted_at) VALUES(?, '任务', ?, ?, '2026-11-09', '2026-11-10', 1, ?, ?)");
  for (const status of ["0", "1", "2", "3"]) task.run("t" + status, "a", status, 100 + Number(status), null);
  task.run("deleted", "a", "0", 9999, 1);
  task.run("hidden-task", "hidden", "0", 9999, null);
  task.run("orphan", "missing", "0", 9999, null);
  const before = [t.call("taskNodes.tree"), t.call("taskNodes.children", { id: "g" }), t.call("taskNodes.path", { id: "a" })];
  const result = t.call("taskNodes.overview");
  assert.equal(result.total, 4);
  assert.equal(result.returned, 4);
  assert.equal(result.truncated, false);
  assert.equal(result.descriptionTruncated, false);
  const nodes = new Map(flatten(result.nodes).map(n => [n.id, n]));
  assert.equal(nodes.get("r").count, 4);
  assert.equal(nodes.get("g").count, 4);
  assert.equal(nodes.get("g").directCount, 0);
  assert.equal(nodes.get("a").count, 4);
  assert.equal(nodes.get("a").directCount, 4);
  assert.equal(nodes.get("a").description, longDescription);
  assert.equal(nodes.get("b").count, 0);
  assert.equal(nodes.get("b").lastUpdatedAt, 40);
  assert.equal(nodes.get("g").lastUpdatedAt, 103);
  assert.equal(nodes.get("a").type, "1");
  assert.equal(nodes.get("a").typeName, "table");
  assert.equal(nodes.get("g").canContainRecords, false);
  assert.equal(nodes.get("a").canContainRecords, true);
  assert.deepEqual(nodes.get("a").path.map(n => n.name), ["根", "开发", "存储"]);
  const text = t.defs["taskNodes.overview"].render(result);
  assert.ok(text.includes(longDescription));
  assert.ok(text.includes("不能直接放任务"));
  assert.ok(text.includes("表，可直接放任务；子树 4 个任务"));
  const short = t.call("taskNodes.overview", { maxDescriptionLength: 61 });
  assert.equal(flatten(short.nodes).find(n => n.id === "a").description, Array.from(longDescription).slice(0, 61).join(""));
  assert.equal(short.descriptionTruncated, true);
  assert.equal(short.truncated, false);
  assert.ok(flatten(t.call("taskNodes.overview", { maxDescriptionLength: 0 }).nodes).every(n => n.description === ""));
  for (const invalid of [-1, 1.5, null, "60", Infinity]) assert.throws(() => t.call("taskNodes.overview", { maxDescriptionLength: invalid }), /maxDescriptionLength/);
  assert.deepEqual([t.call("taskNodes.tree"), t.call("taskNodes.children", { id: "g" }), t.call("taskNodes.path", { id: "a" })], before);
  for (let i = 0; i < 150; i++) node.run("many" + i, "表" + i, "", "1", "g", "/r/g/many" + i + "/", i + 2, 2, 1, null);
  const { overview } = await import("../packages/addons/tasks/lib/overview.js");
  const many = assertQueries(t.db, db => overview(db));
  assert.equal(many.total, 154);
  assert.equal(flatten(many.nodes).length, 154);
  assert.equal(many.truncated, false);
  t.db.prepare("UPDATE task_node SET description=? WHERE id='a'").run("😀边界");
  assert.equal(flatten(overview(t.db, { maxDescriptionLength: 1 }).nodes).find(n => n.id === "a").description, "😀");
  t.db.exec("DELETE FROM task; DELETE FROM task_node;");
  assert.deepEqual(overview(t.db), { nodes: [], total: 0, returned: 0, truncated: false, descriptionTruncated: false });
} finally { t.db.close(); }

const s = fixture(sites);
try {
  const node = s.db.prepare("INSERT INTO site_node(id,name,parent_id,path,sort,depth,created_at,updated_at,deleted_at) VALUES(?,?,?,?,0,0,1,?,?)");
  node.run("g", "资料", "0", "/g/", 10, null);
  node.run("a", "文档", "g", "/g/a/", 20, null);
  s.db.prepare("UPDATE site_node SET description=? WHERE id='a'").run(longDescription);
  node.run("b", "工具", "g", "/g/b/", 30, null);
  node.run("empty", "空目录", "0", "/empty/", 40, null);
  node.run("gone", "已删", "0", "/gone/", 9999, 1);
  node.run("hidden", "不可见后代", "gone", "/gone/hidden/", 9999, null);
  const site = s.db.prepare("INSERT INTO site(id,site_name,created_at,updated_at,deleted_at) VALUES(?, '站点', 1, ?, ?)");
  site.run("one", 100, null); site.run("two", 200, null); site.run("deleted", 9999, 1);
  const mapping = s.db.prepare("INSERT INTO site_node_mapping(id,site_id,node_id,created_at,updated_at,deleted_at) VALUES(?,?,?,1,?,?)");
  mapping.run("m1", "one", "a", 110, null);
  mapping.run("m2", "one", "b", 120, null);
  mapping.run("m3", "two", "g", 210, null);
  mapping.run("m4", "deleted", "a", 9999, null);
  mapping.run("m5", "two", "a", 9999, 1);
  mapping.run("m6", "two", "hidden", 9999, null);
  const before = [s.call("siteNodes.tree"), s.call("siteNodes.children", { id: "g" }), s.call("siteNodes.path", { id: "a" })];
  const result = s.call("siteNodes.overview");
  const nodes = new Map(flatten(result.nodes).map(n => [n.id, n]));
  assert.equal(result.total, 4);
  assert.equal(nodes.get("g").count, 2, "same site in sibling directories counts once in parent");
  assert.equal(nodes.get("g").directCount, 1);
  assert.equal(nodes.get("a").count, 1);
  assert.equal(nodes.get("empty").count, 0);
  assert.equal(nodes.get("g").lastUpdatedAt, 210);
  assert.equal(nodes.get("a").lastUpdatedAt, 110);
  assert.equal(nodes.get("a").type, "folder");
  assert.equal(nodes.get("g").canContainRecords, true);
  assert.equal(nodes.get("a").description, longDescription);
  assert.equal(nodes.get("a").descriptionSupported, true);
  assert.ok(s.defs["siteNodes.overview"].render(result).includes(longDescription));
  const short = s.call("siteNodes.overview", { maxDescriptionLength: 61 });
  assert.equal(flatten(short.nodes).find(n => n.id === "a").description, Array.from(longDescription).slice(0, 61).join(""));
  assert.equal(short.descriptionTruncated, true);
  assert.deepEqual(nodes.get("a").path.map(n => n.name), ["资料", "文档"]);
  assert.ok(s.defs["siteNodes.overview"].render(result).includes("子树 2 个站点（去重）"));
  const zero = s.call("siteNodes.overview", { maxDescriptionLength: 0 });
  assert.equal(zero.descriptionTruncated, true);
  assert.ok(flatten(zero.nodes).every(n => n.description === ""));
  assert.throws(() => s.call("siteNodes.overview", { maxDescriptionLength: -1 }), /maxDescriptionLength/);
  assert.deepEqual([s.call("siteNodes.tree"), s.call("siteNodes.children", { id: "g" }), s.call("siteNodes.path", { id: "a" })], before);
  const caps = s.call("sites.capabilities");
  assert.equal(caps.tags, false);
  assert.equal(caps.overviewAction, "siteNodes.overview");
  assert.ok(s.defs["sites.capabilities"].render(caps).includes(caps.placementGuidance));
  const { overview } = await import("../packages/addons/sites/lib/overview.js");
  for (let i = 0; i < 150; i++) node.run("many" + i, "目录" + i, "g", "/g/many" + i + "/", 1, null);
  const many = assertQueries(s.db, db => overview(db));
  assert.equal(many.total, 154);
  assert.equal(flatten(many.nodes).length, 154);
  assert.equal(many.truncated, false);
  s.db.prepare("UPDATE site_node SET description=? WHERE id='a'").run("😀边界");
  assert.equal(flatten(overview(s.db, { maxDescriptionLength: 1 }).nodes).find(n => n.id === "a").description, "😀");
  s.db.exec("DELETE FROM site_node_mapping; DELETE FROM site_node;");
  assert.deepEqual(overview(s.db), { nodes: [], total: 0, returned: 0, truncated: false, descriptionTruncated: false });
} finally { s.db.close(); }
for (const [dir, mod, action] of [["tasks", tasks, "taskNodes.overview"], ["sites", sites, "siteNodes.overview"]]) {
  const domain = captureDomain(mod);
  assert.ok(JSON.stringify(domain.capability).includes(action));
  const pkg = JSON.parse(readFileSync(new URL("../packages/addons/" + dir + "/package.json", import.meta.url), "utf8"));
  assert.ok(pkg.wb.addon.toolActions.includes(action));
}
// Keep corrupt-import recursion tests isolated: a regression is killed after 5s,
// rather than blocking this test runner's SQLite call indefinitely.
const corruptionProbe = `
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { setup as setupSites } from "./packages/addons/sites/lib/index.js";
import { setup as setupTasks } from "./packages/addons/tasks/lib/index.js";
import { importSitesData } from "./packages/addons/sites/lib/backup.js";
import { overview as sitesOverview, renderOverview as sitesRender } from "./packages/addons/sites/lib/overview.js";
import { overview as tasksOverview, renderOverview as tasksRender } from "./packages/addons/tasks/lib/overview.js";
for (const domain of ["sites", "tasks"]) {
  const db = new DatabaseSync(":memory:");
  db.exec("CREATE TABLE sync_change_log (seq INTEGER PRIMARY KEY, table_name TEXT, row_id TEXT, op TEXT, payload TEXT, origin TEXT, updated_at INTEGER)");
  const api = { db, addon: { version: "test" }, log() {}, emit() {}, action() {}, hasAddon() { return false; } };
  (domain === "sites" ? setupSites : setupTasks)(api);
  const rows = [
    ["0", "0"], ["self", "self"], ["cycle-a", "cycle-b"], ["cycle-b", "cycle-a"],
    ["good", "0"], ["child", "good"],
  ];
  if (domain === "sites") {
    const result = importSitesData(api, JSON.stringify({ schemaVersion: 1, sites: [], nodeMappings: [], tagMappings: [],
      nodes: rows.map(([id, parent_id]) => ({ id, name: id, parent_id, path: "/" + id + "/", created_at: 1, updated_at: 1 })),
    }));
    assert.equal(result.ok, true, JSON.stringify(result));
    assert.equal(result.imported, rows.length);
  } else {
    db.exec("DELETE FROM task; DELETE FROM task_node");
    const insert = db.prepare("INSERT INTO task_node(id,name,type,parent_id,path,created_at,updated_at) VALUES(?,?,'0',?,?,1,1)");
    for (const [id, parent] of rows) insert.run(id, id, parent, "/" + id + "/");
  }
  const overview = domain === "sites" ? sitesOverview : tasksOverview;
  const render = domain === "sites" ? sitesRender : tasksRender;
  let queries = 0;
  const tracked = { prepare(sql) { queries++; return db.prepare(sql); } };
  const result = overview(tracked);
  assert.equal(queries, 2);
  assert.equal(result.total, 2);
  assert.equal(result.returned, 2);
  assert.equal(result.truncated, false);
  assert.deepEqual(result.nodes.map(n => n.id), ["good"]);
  assert.deepEqual(result.nodes[0].children.map(n => n.id), ["child"]);
  assert.deepEqual(result.nodes[0].children[0].path.map(n => n.id), ["good", "child"]);
  assert.ok(render(result).includes("child"));
  db.exec("UPDATE " + (domain === "sites" ? "site_node" : "task_node") + " SET parent_id='child' WHERE id='0'");
  assert.deepEqual(overview(db), result, "virtual root back-edge must not change the visible tree");
  db.exec("DELETE FROM " + (domain === "sites" ? "site_node" : "task_node") + " WHERE id IN ('good','child')");
  assert.equal(overview(db).total, 0);
  db.close();
}
console.log("corrupt imports terminate PASS");
`;
const corruption = spawnSync(process.execPath, ["--input-type=module", "-e", corruptionProbe], {
  cwd: new URL("../", import.meta.url), encoding: "utf8", timeout: 5000, killSignal: "SIGKILL",
});
assert.equal(corruption.error, undefined, "corruption probe failed or timed out: " + corruption.error);
assert.equal(corruption.status, 0, corruption.stderr || corruption.stdout);
assert.match(corruption.stdout, /corrupt imports terminate PASS/);
console.log("node overview: descriptions, counts, dedupe, compatibility, capabilities, two-query budget, isolated corrupt imports PASS");
