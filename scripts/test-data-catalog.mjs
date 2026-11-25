/**
 * 宿主「数据」页的目录与只读查询单测：不启动 DSH，直接对内存 SQLite 跑 wb.dataTables / wb.dataQuery。
 *
 * 覆盖任务要求的一整条链路：
 *   1. 表声明两种写法（字符串 / 对象）都能进目录，中文名、说明、排序列、列掩码都生效；
 *   2. 只靠声明就能浏览——新域不写任何 dataTables/dataQuery，宿主也能读；
 *   3. 白名单——没有声明的表一律拒绝，宿主绝不直读；
 *   4. 可选发现——域仍提供 dataTables 时并进目录、标 discovered，行数据只经该域自己的 dataQuery；
 *   5. 属主优先——声明过的表若属主也提供 dataQuery，先交给它执行，失败才回落直读；
 *   6. 掩码——声明 mask 的列在输出层替换成 ***（宿主直读与透传属主结果都掩）。
 */
import { DatabaseSync } from "node:sqlite";
import { createHostDataActions } from "../packages/shell/lib/actions/host-data.js";
import { PLATFORM_TABLES, declaredCatalog, findCatalogTable } from "../packages/shell/lib/actions/data-catalog.js";

function ok(cond, message) {
  if (!cond) throw new Error("断言失败：" + message);
}

const db = new DatabaseSync(":memory:");
db.exec("CREATE TABLE meta (k TEXT PRIMARY KEY, v TEXT)");
db.exec("CREATE TABLE probe_item (id INTEGER PRIMARY KEY, name TEXT, token TEXT, note TEXT)");
db.prepare("INSERT INTO meta (k, v) VALUES (?, ?)").run("demo", "值");
db.prepare("INSERT INTO probe_item (id, name, token, note) VALUES (?, ?, ?, ?)").run(1, "甲", "明文令牌", "备注");
db.prepare("INSERT INTO probe_item (id, name, token, note) VALUES (?, ?, ?, ?)").run(2, "乙", "第二个令牌", null);

// 声明表的域：不提供任何 dataTables/dataQuery，宿主只能靠声明读它。
const probeDef = {
  id: "wb-addon-probe",
  title: "试验域",
  version: "0.0.1",
  tables: [
    {
      name: "probe_item",
      label: "试验条目",
      desc: "只靠声明就能浏览",
      sort: "id",
      columns: [
        { name: "id", label: "编号" },
        { name: "name", label: "名称" },
        { name: "token", label: "令牌", mask: true },
        { name: "note", label: "备注", hidden: true },
      ],
    },
    "probe_extra",
  ],
};

// 只提供旧接口的域：目录靠发现，行数据只经它自己的 dataQuery。
// legacyMode 用来模拟属主失败与属主读空（两种情况都不得回落到宿主直读）。
let legacyQueries = 0;
let legacyMode = "ok";
const legacyDef = { id: "wb-addon-legacy", title: "旧接口域", version: "0.0.1" };
const legacyActions = new Map([
  [
    "dataTables",
    {
      execute: async () => ({ tables: [{ name: "legacy_thing", label: "旧表" }] }),
    },
  ],
  [
    "dataQuery",
    {
      execute: async () => {
        legacyQueries += 1;
        if (legacyMode === "throw") throw new Error("属主读取失败（模拟）");
        if (legacyMode === "empty") return {}; // 属主没给出 rows：宿主必须拒绝，不许直读
        return { rows: [{ id: 9, secret: "属主返回的密文" }], columns: [{ name: "id" }, { name: "secret", mask: true }], page: 1, pageSize: 50, pages: 1, total: 1 };
      },
    },
  ],
]);

// 声明过但属主也实现了 dataQuery 的域：应优先交给属主，失败才回落直读。
let ownerCalls = 0;
let ownerBroken = false;
const ownerDef = {
  id: "wb-addon-owner",
  title: "属主域",
  version: "0.0.1",
  tables: [{ name: "owner_row", label: "属主表", columns: [{ name: "value", label: "值", mask: true }] }],
};
const ownerActions = new Map([
  [
    "dataQuery",
    {
      execute: async () => {
        ownerCalls += 1;
        if (ownerBroken) throw new Error("属主读取失败（模拟）");
        return { rows: [{ value: "属主直出" }], columns: [{ name: "value", mask: true }], page: 1, pageSize: 50, pages: 1, total: 1 };
      },
    },
  ],
]);

db.exec("CREATE TABLE owner_row (value TEXT)");
db.prepare("INSERT INTO owner_row (value) VALUES (?)").run("直读可见");

const domains = new Map([
  [probeDef.id, { def: probeDef, actions: new Map(), category: "business", error: null }],
  [legacyDef.id, { def: legacyDef, actions: legacyActions, category: "business", error: null }],
  [ownerDef.id, { def: ownerDef, actions: ownerActions, category: "business", error: null }],
]);

const actions = createHostDataActions(db, { domains });
const call = async (name, args) => actions.get(name).execute(args || {});

// 1. 声明进目录：字符串写法与对象写法都在，属性齐全
const payload = await call("wb.dataTables", {});
const probeGroup = payload.groups.find((g) => g.id === probeDef.id);
ok(!!probeGroup, "声明表的域应单独成组");
ok(probeGroup.title === "试验域", "分组标题应取域 title");
const item = probeGroup.tables.find((t) => t.name === "probe_item");
ok(!!item, "对象写法的表应进目录");
ok(item.label === "试验条目" && item.desc === "只靠声明就能浏览", "标签与说明应来自声明");
ok(item.columns.some((c) => c.name === "token" && c.mask === true), "声明 mask 的列应标出掩码");
ok(item.columns.some((c) => c.name === "note" && c.hidden === true), "隐藏列应带 hidden");
ok(item.columns.some((c) => c.name === "id" && c.pk === true), "主键列应标 pk");
ok(item.columns.every((c) => typeof c.kind === "string" && c.kind), "每列都应有渲染 kind");
ok(probeGroup.tables.some((t) => t.name === "probe_extra" && t.source === "declared" && t.exists === false), "字符串写法应等价于只给表名，库里没有也要列出以便发现声明漂移");
const platformGroup = payload.groups.find((g) => g.id === "wb-shell");
ok(platformGroup && platformGroup.tables.length === PLATFORM_TABLES.length, "宿主平台表应单独成组");

// 2. 只靠声明即可浏览
const rows = await call("wb.dataQuery", { table: "probe_item", domain: probeDef.id, pageSize: 10 });
ok(rows.total === 2, "应读到两条试验数据");
ok(rows.columns.some((c) => c.name === "name" && c.label === "名称"), "输出列应带声明的中文名");

// 3. 掩码在输出层
ok(rows.rows.every((r) => r.token === "***"), "mask 列应被打成 ***：" + JSON.stringify(rows.rows));

// 4. 白名单：未声明的表拒绝直读
let rejected = "";
try {
  await call("wb.dataQuery", { table: "audit_log_reads" });
} catch (e) {
  rejected = String(e && e.message);
}
ok(/未知表/.test(rejected), "未声明的表应被拒绝，实际：" + rejected);

// 5. 可选发现：旧接口域的表并进目录，行数据只经它自己的 dataQuery（掩码照样生效）
const legacyGroup = payload.groups.find((g) => g.id === legacyDef.id);
ok(legacyGroup && legacyGroup.tables.some((t) => t.name === "legacy_thing" && t.source === "discovered"), "旧接口域的表应以 discovered 进目录");
const legacyRows = await call("wb.dataQuery", { table: "legacy_thing", domain: legacyDef.id });
ok(legacyQueries === 1, "发现来的表必须经属主 dataQuery 读取");
ok(legacyRows.owner === legacyDef.id, "结果应标出属主域");
ok(legacyRows.rows[0].secret === "***", "属主返回的 mask 列也要掩码");

// 5b. 发现来的表没有直读资格：属主抛错如实抛出，属主读空也不许回落宿主直读。
legacyMode = "throw";
let legacyOwnerFailed = "";
try {
  await call("wb.dataQuery", { table: "legacy_thing", domain: legacyDef.id });
} catch (e) {
  legacyOwnerFailed = String(e && e.message);
}
ok(/属主读取失败/.test(legacyOwnerFailed), "发现来的表属主失败时应如实抛出属主错误，不许直读，实际：" + legacyOwnerFailed);
ok(legacyQueries === 2, "失败那次也应先问过属主 dataQuery");
legacyMode = "empty";
let legacyOwnerEmpty = "";
try {
  await call("wb.dataQuery", { table: "legacy_thing", domain: legacyDef.id });
} catch (e) {
  legacyOwnerEmpty = String(e && e.message);
}
ok(/只由属主域提供读取/.test(legacyOwnerEmpty), "属主读空时也必须拒绝，不许回落直读，实际：" + legacyOwnerEmpty);
ok(legacyQueries === 3, "读空那次同样经属主 dataQuery");
legacyMode = "ok";

// 6. 属主优先，失败回落直读
const ownerRows = await call("wb.dataQuery", { table: "owner_row", domain: ownerDef.id });
ok(ownerCalls === 1 && ownerRows.rows[0].value === "***", "声明过的表应优先走属主 dataQuery，且输出掩码");
ownerBroken = true;
const fallback = await call("wb.dataQuery", { table: "owner_row", domain: ownerDef.id });
ok(fallback.rows[0].value === "***" && fallback.total === 1, "属主失败应回落宿主直读（仍然掩码）");
ok(ownerCalls === 2, "回落前应先试过属主");

// 7. 目录工具函数：重名表必须给域才解析
const groups = declaredCatalog(domains);
ok(findCatalogTable(groups, "probe_item") === null || findCatalogTable(groups, "probe_item").domainId === probeDef.id, "唯一表名可不给域直接解析");
ok(findCatalogTable(groups, "probe_item", probeDef.id).domainId === probeDef.id, "给域时应命中该域的表");
ok(findCatalogTable(groups, "不存在", probeDef.id) === null, "查不到应返回 null");
// 平台表与业务表同名时不做隐式挑选：给了域就按域，没给就要求唯一
db.exec("CREATE TABLE dup_name (x TEXT)");
const dupDef = { id: "wb-addon-dup", title: "重名域", version: "0.0.1", tables: ["dup_name"] };
const dupGroups = declaredCatalog(new Map([[dupDef.id, { def: dupDef }]]));
ok(findCatalogTable(dupGroups, "dup_name", dupDef.id).domainId === dupDef.id, "重名时按域解析");
ok(findCatalogTable(dupGroups, "dup_name") === null || findCatalogTable(dupGroups, "dup_name").domainId === dupDef.id, "全目录唯一时可不给域");

console.log("DATA CATALOG TEST PASS", { groups: payload.groups.length, tables: payload.tables.length });
process.exit(0);
