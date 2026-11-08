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

// 账号与保险箱
let accErr = null;
r = call("sites.vault.status", {});
assert(r.enabled === false && r.unlocked === false, "vault starts disabled");

accErr = null;
try { call("sites.accounts.create", { siteId: siteId, accountKey: "k1", password: "p1" }); } catch (e) { accErr = e; }
assert(accErr && accErr.message.indexOf("密码") < 0 && accErr.message.length > 0, "account on deleted site rejected");
assert(accErr.message.indexOf("站点不存在") >= 0, "account on deleted site: " + accErr.message);

r = call("sites.create", { siteName: "账号站点A", dirIds: [lifeId], bindable: 1 });
const accSiteA = r.site.id;
r = call("sites.create", { siteName: "账号站点B", dirIds: [lifeId], bindable: 1 });
const accSiteB = r.site.id;

accErr = null;
try { call("sites.accounts.create", { siteId: accSiteA, accountKey: "k1", password: "secret-1" }); } catch (e) { accErr = e; }
assert(accErr && accErr.message.indexOf("请先设置账号保险箱口令") >= 0, "sensitive without vault rejected");

r = await call("sites.vault.setup", { passphrase: "test-passphrase-123" });
assert(r.enabled === true && r.unlocked === true, "vault setup unlocks");

r = call("sites.accounts.create", {
  siteId: accSiteA, accountKey: "prod-admin", account: "admin",
  password: "secret-1", phoneNumber: "13800138000", identityCard: "110101199001011234", remark: "生产入口",
});
const accA1 = r.id;
assert(r.accountKey === "prod-admin", "account created");
const rawRow = db.prepare("SELECT * FROM site_account WHERE id=?").get(accA1);
assert(String(rawRow.password).indexOf("v1:") === 0, "password stored encrypted");
assert(String(rawRow.phone_number).indexOf("v1:") === 0, "phone stored encrypted");

accErr = null;
try { call("sites.accounts.create", { siteId: accSiteA, accountKey: "prod-admin" }); } catch (e) { accErr = e; }
assert(accErr && accErr.message.indexOf("已存在相同标识") >= 0, "duplicate accountKey rejected");
accErr = null;
try { call("sites.accounts.create", { siteId: accSiteA, accountKey: "  " }); } catch (e) { accErr = e; }
assert(accErr && accErr.message.indexOf("不能为空") >= 0, "blank accountKey rejected");

r = call("sites.accounts.list", { siteId: accSiteA });
assert(r.total === 1, "account listed");
assert(r.accounts[0].password === undefined, "list never returns password");
assert(r.accounts[0].phoneNumber !== "13800138000" && r.accounts[0].phoneNumber.indexOf("*") > 0, "list masks phone");
assert(r.accounts[0].hasPassword === true, "list reports hasPassword");

r = defs["sites.accounts.get"].execute({ id: accA1 }, { origin: "cloud" });
assert(r.masked === true && r.account.password === undefined, "agent get stays masked");
r = call("sites.accounts.get", { id: accA1 });
assert(r.masked === false && r.account.password === "secret-1", "ui get reveals when unlocked");
accErr = null;
try { defs["sites.accounts.reveal"].execute({ id: accA1 }, { origin: "cloud" }); } catch (e) { accErr = e; }
assert(accErr && accErr.message.indexOf("明文仅界面可查看") >= 0, "reveal refused for agent");

// 站点列表带账号数
r = call("sites.list", { text: "账号站点A" });
assert(r.records[0].accountCount === 1, "accountCount on list rows");

// 自建站点关闭外联前先做外联测试
r = call("sites.accounts.create", { siteId: accSiteB, accountKey: "b-admin", account: "badmin", password: "secret-2" });
const accB1 = r.id;
r = call("sites.accounts.link", { nativeAccountId: accA1, externalAccountId: accB1 });
const relId = r.relationId;
assert(relId, "link created");
r = call("sites.accounts.link", { nativeAccountId: accA1, externalAccountId: accB1 });
assert(r.relationId === relId, "link idempotent");
accErr = null;
try { call("sites.accounts.link", { nativeAccountId: accA1, externalAccountId: accA1 }); } catch (e) { accErr = e; }
assert(accErr && accErr.message.indexOf("自己") >= 0, "self link rejected");
r = call("sites.accounts.create", { siteId: accSiteA, accountKey: "local-2" });
accErr = null;
try { call("sites.accounts.link", { nativeAccountId: accA1, externalAccountId: r.id }); } catch (e) { accErr = e; }
assert(accErr && accErr.message.indexOf("同一站点") >= 0, "same-site link rejected");

r = call("sites.accounts.list", { siteId: accSiteA });
const withExt = r.accounts.filter(function (a) { return a.id === accA1; })[0];
assert(withExt.externals.length === 1 && withExt.externals[0].siteName === "账号站点B", "externals listed");

r = call("sites.accounts.cascade", { excludeSiteId: accSiteA });
assert(r.groups.every(function (g) { return g.siteId !== accSiteA; }), "cascade excludes current site");
assert(r.groups.some(function (g) { return g.siteId === accSiteB; }), "cascade includes bindable site");

// bindable 关闭守卫
accErr = null;
try { call("sites.update", { id: accSiteB, bindable: 0 }); } catch (e) { accErr = e; }
assert(accErr && accErr.message.indexOf("外联") >= 0, "bindable guard: " + (accErr && accErr.message));

// 删站守卫
accErr = null;
try { call("sites.delete", { id: accSiteA }); } catch (e) { accErr = e; }
assert(accErr && accErr.message.indexOf("账号") >= 0, "delete site guard: " + (accErr && accErr.message));

// 解除外联 → 允许关闭 bindable
r = call("sites.accounts.unlink", { nativeAccountId: accA1, externalAccountId: accB1 });
assert(r.deleted === true, "unlink ok");
r = call("sites.update", { id: accSiteB, bindable: 0 });
assert(r.site.bindable === 0, "bindable off after unlink");
call("sites.update", { id: accSiteB, bindable: 1 });

// 锁箱后敏感字段写入被拒
call("sites.vault.lock", {});
r = call("sites.vault.status", {});
assert(r.unlocked === false, "locked");
accErr = null;
try { call("sites.accounts.create", { siteId: accSiteA, accountKey: "locked-1", password: "x" }); } catch (e) { accErr = e; }
assert(accErr && accErr.message.indexOf("保险箱") >= 0, "locked vault rejects sensitive write");
accErr = null;
try { await call("sites.vault.unlock", { passphrase: "wrong-passphrase" }); } catch (e) { accErr = e; }
assert(accErr !== null, "wrong passphrase rejected");

// 改口令：旧密文仍可读
r = await call("sites.vault.rekey", { oldPassphrase: "test-passphrase-123", newPassphrase: "new-passphrase-456" });
assert(r.ok !== false, "rekey ok");
r = call("sites.accounts.get", { id: accA1 });
assert(r.masked === false && r.account.password === "secret-1", "rekey keeps data readable");

// 数据页掩码
r = call("sites.dataQuery", { table: "site_account", pageSize: 50 });
const dataRow = r.rows.filter(function (x) { return x.id === accA1; })[0];
assert(dataRow.password === "••••••", "data page masks password");
assert(dataRow.phone_number.indexOf("13800138000") < 0, "data page masks phone");
const dataTables = call("sites.dataTables", {});
assert(dataTables.tables.some(function (t) { return t.name === "site_account"; }), "dataTables has site_account");

// 删除账号：双向清外联
call("sites.accounts.link", { nativeAccountId: accA1, externalAccountId: accB1 });
r = call("sites.accounts.delete", { id: accB1 });
assert(r.deleted === true && r.clearedRelations >= 1, "delete account clears relations");
assert(db.prepare("SELECT COUNT(*) AS n FROM site_account_external WHERE deleted_at IS NULL").get().n === 0, "no live relations left");

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
