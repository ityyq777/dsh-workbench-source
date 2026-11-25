/**
 * 数据页表结构：把 PRAGMA table_info 的结果翻成前端能直接渲染的列元信息。
 *
 * 为什么要单独一份：数据页的「字段」页签要在空表上也能列出完整表头，
 * 只靠行数据推列（旧兼容层做法）在 0 行时会退化成一个「#」列。
 * vault.dataTables / vault.dataQuery 统一从这里取列，契约与
 * packages/addons/tags/lib/infra/data.js 保持一致：
 * { name, type, kind, label, system, pk, notnull, defaultValue }。
 */

/** 数据页允许浏览的表（顺序即左侧目录顺序），带中文名。 */
export const DATA_TABLES = [
  { name: "vault_secret", label: { zh: "凭据", en: "Secrets" } },
  { name: "vault_secret_kind", label: { zh: "凭据类型", en: "Secret kinds" } },
  { name: "vault_group", label: { zh: "分组", en: "Groups" } },
  { name: "vault_binding", label: { zh: "分组关联", en: "Bindings" } },
  { name: "vault_set", label: { zh: "集合", en: "Sets" } },
  { name: "vault_group_set", label: { zh: "集合分组", en: "Group sets" } },
  { name: "vault_set_secret", label: { zh: "集合成员", en: "Set secrets" } },
];

/** 列的中文名：表内含义一致就直接按列名映射。 */
const COLUMN_LABEL = {
  id: "标识",
  name: "名称",
  meta: "元信息",
  ciphertext: "密文",
  created_at: "创建时间",
  updated_at: "更新时间",
  deleted_at: "删除时间",
  rev: "修订号",
  description: "说明",
  color: "颜色",
  subject_type: "对象类型",
  subject_id: "对象标识",
  group_id: "分组",
  secret_id: "凭据",
  kind: "类型",
  set_id: "集合",
  account: "账号",
  passphrase_fp: "主口令指纹",
  schema_version: "结构版本",
  cipher: "密文",
  iv: "初始向量",
  salt: "盐值",
  dek_wrapped: "包裹的密钥",
};

/** 系统列：由库或同步维护，不是用户填写的字段。 */
const SYSTEM_COLUMNS = new Set(["id", "created_at", "updated_at", "deleted_at", "rev"]);

function kindOf(name, type) {
  if (name === "id" || /_id$/.test(name)) return "id";
  if (/_at$/.test(name)) return "timestamp";
  const upper = String(type || "").toUpperCase();
  if (/INT|REAL|NUM|DOUB|FLOA|DEC/.test(upper)) return /BOOL/i.test(upper) ? "bool" : "number";
  return "text";
}

function labelOf(name) {
  return COLUMN_LABEL[name] || name;
}

/**
 * 读一张表的列元信息。
 * notnull 用 0/1（SQLite 原值）暴露，defaultValue 为缺省表达式字符串或 null，
 * 前端只在至少一列声明了它们时才渲染「可空 / 默认值」两列，避免宽表噪音。
 */
export function columnsOf(db, table) {
  const rows = db.prepare("PRAGMA table_info(" + String(table) + ")").all();
  return rows.map((row) => ({
    name: row.name,
    type: String(row.type || "").toUpperCase() || "TEXT",
    kind: kindOf(row.name, row.type),
    label: labelOf(row.name),
    system: SYSTEM_COLUMNS.has(row.name),
    pk: Number(row.pk) > 0,
    notnull: Number(row.notnull) || 0,
    defaultValue: row.dflt_value === null || row.dflt_value === undefined ? null : String(row.dflt_value),
  }));
}

/** 行数：数据页目录与索引页都用它，含软删行（浏览页可切换是否隐藏）。 */
export function countOf(db, table) {
  const row = db.prepare("SELECT COUNT(*) AS n FROM " + String(table)).get();
  return Number((row && row.n) || 0);
}

/** 索引摘要：索引页的「索引」段落，origin 为 pk 的即主键。 */
export function indexesOf(db, table) {
  const list = db.prepare("PRAGMA index_list(" + String(table) + ")").all();
  return list.map((ix) => {
    const cols = db.prepare("PRAGMA index_info(" + JSON.stringify(ix.name) + ")").all();
    return {
      name: ix.name,
      columns: cols.map((c) => c.name),
      unique: Boolean(ix.unique),
      origin: ix.origin === "pk" ? "pk" : ix.origin === "u" ? "unique" : "created",
    };
  });
}

/** 表清单里每张表的结构摘要（stats=true 时返回，供索引页使用）。 */
export function statsOf(db, table) {
  return {
    rows: countOf(db, table),
    columnCount: columnsOf(db, table).length,
    indexes: indexesOf(db, table),
  };
}

export function dataTableNames() {
  return DATA_TABLES.map((tb) => tb.name);
}
