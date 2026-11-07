import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = mkdtempSync(join(tmpdir(), "wb-sites-"));
const db = new DatabaseSync(join(dir, "sites.db"));
db.exec("CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL)");
db.exec("CREATE TABLE IF NOT EXISTS sync_change_log (seq INTEGER PRIMARY KEY AUTOINCREMENT, table_name TEXT NOT NULL, row_id TEXT NOT NULL, op TEXT NOT NULL, payload TEXT, origin TEXT NOT NULL, updated_at INTEGER NOT NULL)");
const tagDdl = [
  "CREATE TABLE tag (id TEXT PRIMARY KEY,name TEXT NOT NULL,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL,deleted_at INTEGER,rev INTEGER NOT NULL DEFAULT 1)",
  "CREATE TABLE tag_mapping (id TEXT PRIMARY KEY,tag_id TEXT NOT NULL,item_id TEXT NOT NULL,item_type TEXT NOT NULL,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL,deleted_at INTEGER,rev INTEGER NOT NULL DEFAULT 1)",
];
for (const sql of tagDdl) db.exec(sql);
const now = Date.now();
db.prepare("INSERT INTO tag(id,name,created_at,updated_at,deleted_at,rev) VALUES(?,?,?,?,NULL,1)").run("tag-work", "工作", now, now);
db.prepare("INSERT INTO tag(id,name,created_at,updated_at,deleted_at,rev) VALUES(?,?,?,?,NULL,1)").run("tag-life", "生活", now, now);

const events = [];
const defs = {};
let tagAddon = true;
const api = {
  db,
  addon: { id: "wb-addon-sites", version: "1.0.0", dir },
  shellVersion: "0.1.0",
  log: function () {},
  emit: function (event, data) { events.push({ event, data }); },
  action: function (name, def) { defs[name] = def; },
  tool: function () {},
  hasAddon: function (id) { return id === "wb-addon-tags" && tagAddon; },
};
const mod = await import("../packages/addons/sites/lib/index.js");
mod.setup(api);

function call(name, args) {
  return defs[name].execute(args || {}, { origin: "ui", emit: api.emit });
}
function assert(cond, msg) {
  if (!cond) throw new Error("ASSERT: " + msg);
}

// 目录树
let r = call("siteNodes.create", { parentId: 0, name: "工作" });
const workId = r.node.id;
r = call("siteNodes.create", { parentId: workId, name: "后端" });
const backendId = r.node.id;
r = call("siteNodes.create", { parentId: 0, name: "生活" });
const lifeId = r.node.id;
assert(call("siteNodes.children", { id: 0 }).length === 2, "root children");
assert(call("siteNodes.children", { id: 0 })[0].children.length === 0, "lazy children are empty arrays");
const levels = call("siteNodes.pathChildren", { id: backendId });
assert(levels.length === 3 && levels[0].id === "0", "pathChildren levels");
assert(call("siteNodes.path", { id: backendId }).map(function (n) { return n.name; }).join("/") === "工作/后端", "node path names");

// 创建站点
r = call("sites.create", {
  siteName: "MDN",
  description: "Web 文档",
  siteLinks: [{ description: "主站", link: "https://developer.mozilla.org", isDefault: true }, { description: "中文", link: "https://developer.mozilla.org/zh-CN" }],
  dirIds: [backendId],
  tagIds: ["tag-work"],
});
const siteId = r.site.id;
assert(r.site.siteName === "MDN", "create site");
assert(r.site.defaultLink === "https://developer.mozilla.org", "default link");
assert(r.site.dirs.length === 1 && r.site.dirs[0].path.length === 2, "dirs path");
assert(r.site.tags.length === 1 && r.site.tags[0].name === "工作", "tags attached");

r = call("sites.list", { nodeId: 0, pageNumber: 1, pageSize: 16 });
assert(r.total === 1 && r.records.length === 1, "list root");
r = call("sites.list", { nodeId: workId });
assert(r.total === 1, "list ancestor subtree");
r = call("sites.list", { nodeId: lifeId });
assert(r.total === 0, "list other subtree");
r = call("sites.list", { text: "mozilla" });
assert(r.total === 0, "text does not search links");
r = call("sites.list", { text: "web" });
assert(r.total === 1, "text searches description");
r = call("sites.list", { tagIds: ["tag-work"] });
assert(r.total === 1, "tag filter");
r = call("sites.list", { tagIds: ["tag-life"] });
assert(r.total === 0, "tag filter no match");

// 更新：换目录、去标签
r = call("sites.update", { id: siteId, siteName: "MDN 文档", dirIds: [workId], tagIds: [] });
assert(r.site.siteName === "MDN 文档", "update name");
assert(r.site.dirs.length === 1 && r.site.dirs[0].id === workId, "update dirs");
assert(r.site.tags.length === 0, "remove tags");
let tm = db.prepare("SELECT * FROM tag_mapping WHERE item_type='site' AND item_id=?").all(siteId);
assert(tm.length === 1 && tm[0].deleted_at, "tag mapping soft deleted");

// 重新加标签应复用软删行
r = call("sites.update", { id: siteId, tagIds: ["tag-work"] });
assert(r.site.tags.length === 1, "re-add tag");
tm = db.prepare("SELECT * FROM tag_mapping WHERE item_type='site' AND item_id=?").all(siteId);
assert(tm.length === 1 && !tm[0].deleted_at, "tag mapping revived");

// 移动子树
r = call("siteNodes.move", { sourceId: backendId, targetId: lifeId, moveType: 0 });
assert(r.ok, "move node");
const moved = call("siteNodes.path", { id: backendId }).map(function (n) { return n.name; }).join("/");
assert(moved === "生活/后端", "moved path");
r = call("sites.get", { id: siteId });
assert(r.dirs[0].path.map(function (n) { return n.name; }).join("/") === "工作", "site stays in old dir");

// 删除目录：站点不删，映射清理
r = call("siteNodes.delete", { id: workId });
assert(r.deletedNodes === 1 && r.removedMappings === 1, "delete node subtree + mappings");
assert(call("sites.get", { id: siteId }) !== null, "site kept after node delete");
r = call("sites.list", { nodeId: workId });
assert(r.total === 0, "deleted node not listed");

// 删除站点
r = call("sites.delete", { id: siteId });
assert(r.deleted === true, "delete site");
assert(call("sites.list", {}).total === 0, "deleted site hidden");
const siteRow = db.prepare("SELECT * FROM site WHERE id=?").get(siteId);
assert(siteRow && siteRow.deleted_at, "site soft deleted");

// 标签搜索
r = call("siteTags.search", { text: "工" });
assert(r.total === 1 && r.records[0].name === "工作", "siteTags.search");
r = call("siteTags.byIds", { ids: ["tag-work", "tag-life"] });
assert(r.records.length === 2, "siteTags.byIds");

// 标签子插件卸载后：能力关闭、列表不再返回标签、表单传入的 tagIds 被忽略
r = call("sites.capabilities");
assert(r.tags === true, "capabilities.tags true when tags addon installed");
tagAddon = false;
r = call("sites.capabilities");
assert(r.tags === false, "capabilities.tags false when tags addon uninstalled");
r = call("sites.create", { siteName: "无标签站点", dirIds: [lifeId], tagIds: ["tag-work"] });
const noTagSiteId = r.site.id;
assert(r.site.tags.length === 0, "create ignores tagIds when tags addon uninstalled");
assert(call("sites.get", { id: noTagSiteId }).tags.length === 0, "get hides tags when tags addon uninstalled");
assert(db.prepare("SELECT COUNT(*) AS n FROM tag_mapping WHERE item_id=? AND deleted_at IS NULL").get(noTagSiteId).n === 0, "no tag mapping written");
r = call("siteTags.search", { text: "工" });
assert(r.total === 0, "siteTags.search empty when tags addon uninstalled");
tagAddon = true;
r = call("sites.capabilities");
assert(r.tags === true, "capabilities.tags back after tags addon enabled");

// 校验
let err = null;
try { call("sites.create", { siteName: "  ", dirIds: [lifeId] }); } catch (e) { err = e; }
assert(err && err.message.indexOf("不能为空") >= 0, "blank site name rejected");
err = null;
try { call("sites.create", { siteName: "x", dirIds: ["missing"] }); } catch (e) { err = e; }
assert(err && err.message.indexOf("目录不存在") >= 0, "missing dir rejected");

const logs = db.prepare("SELECT * FROM sync_change_log WHERE table_name IN ('site','site_node','site_node_mapping','tag_mapping')").all();
assert(logs.length >= 10, "change log rows");
assert(events.some(function (e) { return e.event === "sites-changed"; }), "emit sites-changed");
assert(events.some(function (e) { return e.event === "site-nodes-changed"; }), "emit site-nodes-changed");

console.log("SITES TEST PASS", { events: events.length, logs: logs.length, tables: db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().length });
db.close();
rmSync(dir, { recursive: true, force: true });
