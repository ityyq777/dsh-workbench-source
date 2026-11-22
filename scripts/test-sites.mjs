import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
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
function hostCall(name, args) {
  const def = defs[name];
  if (!def) return Promise.reject(new Error("action 未注册：" + name));
  return Promise.resolve()
    .then(function () { return def.execute(args || {}, { origin: "plugin", emit: api.emit }); })
    .then(function (result) { return { ok: true, result: result }; })
    .catch(function (error) { return { ok: false, error: error && error.message ? error.message : String(error) }; });
}
api.call = hostCall;

const mod = await import("../packages/addons/sites/lib/index.js");
mod.setup(api);

const vaultMod = await import("../packages/addons/vault/lib/index.js");
const vaultDomain = vaultMod.createDomain({});
vaultDomain.setup({
  db: db,
  addon: { id: "wb-addon-vault", version: "0.2.0", dir: dir },
  shellVersion: "0.1.0",
  log: function () {},
  emit: function () {},
  action: function (name, def) { defs[name] = def; },
  tool: function () {},
  now: function () { return Date.now(); },
  call: hostCall,
  hasAddon: function () { return false; },
});

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

// 删除站点（会顺带清理保险箱分组绑定，因此是异步接口）
r = await call("sites.delete", { id: siteId });
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
// 未装标签插件时传 tagIds 必须报可读错误，而不是静默丢弃（与任务域同一套语义）
let taglessErr = null;
try {
  call("sites.create", { siteName: "无标签站点", dirIds: [lifeId], tagIds: ["tag-work"] });
} catch (e) {
  taglessErr = e;
}
assert(taglessErr && /标签域未安装/.test(taglessErr.message), "create with tagIds rejected when tags addon uninstalled");
r = call("sites.create", { siteName: "无标签站点", dirIds: [lifeId] });
const noTagSiteId = r.site.id;
assert(r.site.tags.length === 0, "create without tagIds keeps working when tags addon uninstalled");
assert(call("sites.get", { id: noTagSiteId }).tags.length === 0, "get hides tags when tags addon uninstalled");
assert(db.prepare("SELECT COUNT(*) AS n FROM tag_mapping WHERE item_id=? AND deleted_at IS NULL").get(noTagSiteId).n === 0, "no tag mapping written");
r = call("siteTags.search", { text: "工" });
assert(r.total === 0, "siteTags.search empty when tags addon uninstalled");
tagAddon = true;
r = call("sites.capabilities");
assert(r.tags === true, "capabilities.tags back after tags addon enabled");

// 1.13.0：站点下线账号实体，只保留「查关联的凭据分组」
assert(!defs["sites.accounts.list"] && !defs["sites.accounts.create"], "accounts actions removed");
assert(defs["sites.vaultGroups"], "sites.vaultGroups registered");
assert(
  db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('site_account','site_account_external')").all().length === 0,
  "account tables dropped",
);

r = call("sites.create", { siteName: "分组站点A", dirIds: [lifeId] });
const accSiteA = r.site.id;
r = call("sites.create", { siteName: "分组站点B", dirIds: [lifeId] });
const accSiteB = r.site.id;

r = call("sites.list", { text: "分组站点A" });
assert(r.records[0].accountCount === undefined, "list no longer reports accountCount");

let accErr = null;
try { await call("sites.vaultGroups", {}); } catch (e) { accErr = e; }
assert(accErr && accErr.message.indexOf("siteId") >= 0, "siteId required");
accErr = null;
try { await call("sites.vaultGroups", { siteId: "missing-site" }); } catch (e) { accErr = e; }
assert(accErr && accErr.message.indexOf("站点不存在") >= 0, "missing site rejected");

r = await call("sites.vaultGroups", { siteId: accSiteA });
assert(r.installed === true && r.items.length === 0, "no groups bound yet");

await call("vault.setup", { passphrase: "test-passphrase-123", mode: "A" });
await call("vault.unlock", { passphrase: "test-passphrase-123" });

r = await call("vault.groupCreate", { name: "分组站点A · 主账号" });
const groupA = r.id;
await call("vault.bind", { subjectType: "site", subjectId: accSiteA, groupId: groupA });
r = await call("vault.groupCreate", { name: "分组站点A · 备账号" });
const groupA2 = r.id;
await call("vault.bind", { subjectType: "site", subjectId: accSiteA, groupId: groupA2 });

r = await call("sites.vaultGroups", { siteId: accSiteA });
assert(r.items.length === 2, "one site can link multiple groups: " + r.items.length);
assert(r.items.some(function (g) { return g.id === groupA && g.name === "分组站点A · 主账号"; }), "group name returned");
assert(r.items.every(function (g) { return g.secretCount === 0; }), "secretCount starts at zero");

await call("vault.secretCreate", { name: "分组站点A · 主账号 · 密码", kind: "password", secret: "s1", groupId: groupA });
r = await call("sites.vaultGroups", { siteId: accSiteA });
const withSecrets = r.items.filter(function (g) { return g.id === groupA; })[0];
assert(withSecrets && withSecrets.secretCount === 1, "secretCount reflects group secrets");

await call("vault.unbind", { subjectType: "site", subjectId: accSiteA, groupId: groupA2 });
r = await call("sites.vaultGroups", { siteId: accSiteA });
assert(r.items.length === 1 && r.items[0].id === groupA, "unbind reflected on site side");

// 锁箱只影响明文，分组名与凭据数本来就只读，查询不受影响
await call("vault.lock", {});
r = await call("sites.vaultGroups", { siteId: accSiteA });
assert(r.items.length === 1, "group query works while vault locked");
await call("vault.unlock", { passphrase: "test-passphrase-123" });

await call("vault.bind", { subjectType: "site", subjectId: accSiteB, groupId: groupA });
r = await call("sites.vaultGroups", { siteId: accSiteB });
assert(r.items.length === 1 && r.items[0].id === groupA, "second site can share the same group");

// 删站点：软删 + 清掉保险箱里的 subject 绑定（分组本身保留）
r = await call("sites.delete", { id: accSiteB });
assert(r.deleted === true && r.removedBindings === 1, "delete site purges bindings: " + (r && r.removedBindings));
assert(
  db.prepare("SELECT COUNT(*) AS n FROM vault_binding WHERE subject_type='site' AND subject_id=?").get(accSiteB).n === 0,
  "binding rows purged",
);
accErr = null;
try { await call("sites.vaultGroups", { siteId: accSiteB }); } catch (e) { accErr = e; }
assert(accErr && accErr.message.indexOf("站点不存在") >= 0, "deleted site has no groups query");

// 数据页：账号表已下线
const dataTables = call("sites.dataTables", {});
assert(!dataTables.tables.some(function (t) { return t.name === "site_account"; }), "dataTables no site_account");
accErr = null;
try { call("sites.dataQuery", { table: "site_account", pageSize: 50 }); } catch (e) { accErr = e; }
assert(accErr && accErr.message.indexOf("未知数据表") >= 0, "dataQuery rejects removed table: " + (accErr && accErr.message));

// 声明表：DomainDef.tables 与 package.json 只能列本域自建的表，tag_mapping 归标签域独占
const domainDefs = [];
mod.apply({
  workbench: { registerDomain: function (def) { domainDefs.push(def); return function () {}; } },
  effect: function (fn) { fn(); },
});
assert(domainDefs.length === 1, "registerDomain called once");
assert(
  domainDefs[0].tables.join(",") === "site,site_node,site_node_mapping",
  "DomainDef.tables 不含 tag_mapping: " + domainDefs[0].tables.join(","),
);
const sitesPkg = JSON.parse(readFileSync(new URL("../packages/addons/sites/package.json", import.meta.url), "utf8"));
assert(
  sitesPkg.wb.addon.tables.join(",") === "site,site_node,site_node_mapping",
  "package.json wb.addon.tables 同步收敛: " + sitesPkg.wb.addon.tables.join(","),
);

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
