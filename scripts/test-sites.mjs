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

// 账号与保险箱（1.11.0：敏感字段整体交给 vault，站点不再有敏感列）
let accErr = null;
r = await call("vault.status", {});
assert(r.initialized === false && r.locked === true, "vault starts uninitialized");

accErr = null;
try { await call("sites.accounts.create", { siteId: siteId, accountKey: "k1", password: "p1" }); } catch (e) { accErr = e; }
assert(accErr && accErr.message.indexOf("站点不存在") >= 0, "account on deleted site: " + (accErr && accErr.message));

r = call("sites.create", { siteName: "账号站点A", dirIds: [lifeId], bindable: 1 });
const accSiteA = r.site.id;
r = call("sites.create", { siteName: "账号站点B", dirIds: [lifeId], bindable: 1 });
const accSiteB = r.site.id;

accErr = null;
try { await call("sites.accounts.create", { siteId: accSiteA, accountKey: "k1", password: "secret-1" }); } catch (e) { accErr = e; }
assert(accErr && accErr.message.indexOf("主口令") >= 0, "sensitive without vault setup rejected: " + (accErr && accErr.message));

r = await call("vault.setup", { passphrase: "test-passphrase-123", mode: "A" });
assert(r.ok === true && r.cloudSync === true && r.unlockMode === "A", "vault setup ok");
r = await call("vault.unlock", { passphrase: "test-passphrase-123" });
assert(r.ok !== false, "vault unlock ok");

accErr = null;
try { await call("sites.accounts.create", { siteId: accSiteA, accountKey: "k1", password: "secret-1" }); } catch (e) { accErr = e; }
assert(accErr && accErr.message.indexOf("尚未关联凭据组") >= 0, "sensitive without group binding rejected: " + (accErr && accErr.message));
assert(db.prepare("SELECT COUNT(*) AS n FROM site_account WHERE account_key='k1'").get().n === 0, "failed sensitive write leaves no half account");

r = await call("vault.groupCreate", { name: "站点账号 · 账号站点A" });
const groupA = r.id;
await call("vault.bind", { subjectType: "site", subjectId: accSiteA, groupId: groupA });
r = await call("vault.bindingsOf", { subjectType: "site", subjectId: accSiteA });
assert(r.items.length === 1 && r.items[0].groupId === groupA, "site bound to group");

r = await call("sites.accounts.create", {
  siteId: accSiteA, accountKey: "prod-admin", account: "admin",
  password: "secret-1", phoneNumber: "13800138000", identityCard: "110101199001011234", remark: "生产入口",
});
const accA1 = r.id;
assert(r.accountKey === "prod-admin", "account created");
const rawRow = db.prepare("SELECT * FROM site_account WHERE id=?").get(accA1);
assert(!("password" in rawRow) && !("phone_number" in rawRow), "site_account has no sensitive columns");
const secretsA1 = db.prepare("SELECT * FROM vault_secret WHERE deleted_at IS NULL AND name LIKE ?").all("site." + accSiteA + "." + accA1 + ".%");
assert(secretsA1.length === 3, "three secrets stored in vault");
assert(secretsA1.every(function (x) { return String(x.ciphertext).indexOf("v1:") === 0; }), "secrets encrypted");
assert(!secretsA1.some(function (x) { return String(x.ciphertext).indexOf("secret-1") >= 0; }), "no plaintext in ciphertext");

accErr = null;
try { await call("sites.accounts.create", { siteId: accSiteA, accountKey: "prod-admin" }); } catch (e) { accErr = e; }
assert(accErr && accErr.message.indexOf("已存在相同标识") >= 0, "duplicate accountKey rejected");
accErr = null;
try { await call("sites.accounts.create", { siteId: accSiteA, accountKey: "  " }); } catch (e) { accErr = e; }
assert(accErr && accErr.message.indexOf("不能为空") >= 0, "blank accountKey rejected");

r = await call("sites.accounts.list", { siteId: accSiteA });
assert(r.total === 1, "account listed");
assert(r.accounts[0].password === undefined, "list never returns password");
assert(r.accounts[0].phoneNumber === "已保存", "list never returns phone plaintext");
assert(r.accounts[0].hasPassword && r.accounts[0].hasPhone && r.accounts[0].hasIdentity, "list reports has flags");

r = await defs["sites.accounts.get"].execute({ id: accA1 }, { origin: "cloud" });
assert(r.masked === true && r.secretIds === undefined, "agent get stays masked");
assert(r.account.password === undefined && r.account.phoneNumber === "已保存", "agent never gets plaintext");
r = await call("sites.accounts.get", { id: accA1 });
assert(r.masked === true && r.secretIds && r.secretIds.password, "ui get returns secret ids");
r = await call("vault.secretReveal", { id: r.secretIds.password });
assert(r.secret === "secret-1", "reveal through vault");

// 站点列表带账号数
r = call("sites.list", { text: "账号站点A" });
assert(r.records[0].accountCount === 1, "accountCount on list rows");

// 站点 B：同站点账号归一组
r = await call("vault.groupCreate", { name: "站点账号 · 账号站点B" });
const groupB = r.id;
await call("vault.bind", { subjectType: "site", subjectId: accSiteB, groupId: groupB });
r = await call("sites.accounts.create", { siteId: accSiteB, accountKey: "b-admin", account: "badmin", password: "secret-2" });
const accB1 = r.id;
r = call("sites.accounts.link", { nativeAccountId: accA1, externalAccountId: accB1 });
const relId = r.relationId;
assert(relId, "link created");
r = call("sites.accounts.link", { nativeAccountId: accA1, externalAccountId: accB1 });
assert(r.relationId === relId, "link idempotent");
accErr = null;
try { call("sites.accounts.link", { nativeAccountId: accA1, externalAccountId: accA1 }); } catch (e) { accErr = e; }
assert(accErr && accErr.message.indexOf("自己") >= 0, "self link rejected");
r = await call("sites.accounts.create", { siteId: accSiteA, accountKey: "local-2" });
accErr = null;
try { call("sites.accounts.link", { nativeAccountId: accA1, externalAccountId: r.id }); } catch (e) { accErr = e; }
assert(accErr && accErr.message.indexOf("同一站点") >= 0, "same-site link rejected");

r = await call("sites.accounts.list", { siteId: accSiteA });
const withExt = r.accounts.filter(function (a) { return a.id === accA1; })[0];
assert(withExt.externals.length === 1 && withExt.externals[0].siteName === "账号站点B", "externals listed");

r = call("sites.accounts.cascade", { excludeSiteId: accSiteA });
assert(r.groups.every(function (g) { return g.siteId !== accSiteA; }), "cascade excludes current site");
assert(r.groups.some(function (g) { return g.siteId === accSiteB; }), "cascade includes bindable site");

accErr = null;
try { call("sites.update", { id: accSiteB, bindable: 0 }); } catch (e) { accErr = e; }
assert(accErr && accErr.message.indexOf("外联") >= 0, "bindable guard: " + (accErr && accErr.message));

accErr = null;
try { call("sites.delete", { id: accSiteA }); } catch (e) { accErr = e; }
assert(accErr && accErr.message.indexOf("账号") >= 0, "delete site guard: " + (accErr && accErr.message));

r = call("sites.accounts.unlink", { nativeAccountId: accA1, externalAccountId: accB1 });
assert(r.deleted === true, "unlink ok");
r = call("sites.update", { id: accSiteB, bindable: 0 });
assert(r.site.bindable === 0, "bindable off after unlink");
call("sites.update", { id: accSiteB, bindable: 1 });

// 锁箱后敏感字段写入被拒
await call("vault.lock", {});
r = await call("vault.status", {});
assert(r.locked === true, "locked");
accErr = null;
try { await call("sites.accounts.create", { siteId: accSiteA, accountKey: "locked-1", password: "x" }); } catch (e) { accErr = e; }
assert(accErr && accErr.message.indexOf("保险箱") >= 0, "locked vault rejects sensitive write");
accErr = null;
try { await call("vault.unlock", { passphrase: "wrong-passphrase" }); } catch (e) { accErr = e; }
assert(accErr !== null, "wrong passphrase rejected");
await call("vault.unlock", { passphrase: "test-passphrase-123" });

// 改口令：旧密文仍可读
r = await call("vault.changePassphrase", { oldPassphrase: "test-passphrase-123", newPassphrase: "new-passphrase-456" });
assert(r.ok !== false, "change passphrase ok");
r = await call("sites.accounts.get", { id: accA1 });
r = await call("vault.secretReveal", { id: r.secretIds.password });
assert(r.secret === "secret-1", "passphrase change keeps data readable");

// 数据页：敏感列已不在表里
r = call("sites.dataQuery", { table: "site_account", pageSize: 50 });
const dataRow = r.rows.filter(function (x) { return x.id === accA1; })[0];
assert(dataRow && !("password" in dataRow) && !("phone_number" in dataRow), "data page has no sensitive columns");
const dataTables = call("sites.dataTables", {});
assert(dataTables.tables.some(function (t) { return t.name === "site_account"; }), "dataTables has site_account");

// 删除账号：双向清外联 + 尽力清理凭据
call("sites.accounts.link", { nativeAccountId: accA1, externalAccountId: accB1 });
r = await call("sites.accounts.delete", { id: accB1 });
assert(r.deleted === true && r.clearedRelations >= 1, "delete account clears relations");
assert(db.prepare("SELECT COUNT(*) AS n FROM site_account_external WHERE deleted_at IS NULL").get().n === 0, "no live relations left");
const leftLive = db.prepare("SELECT COUNT(*) AS n FROM vault_secret WHERE deleted_at IS NULL AND name LIKE ?").get("site." + accSiteB + "." + accB1 + ".%");
assert(leftLive.n === 0, "account secrets soft deleted");

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
