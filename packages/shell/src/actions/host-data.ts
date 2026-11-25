/**
 * 宿主自己的「数据」与「配置」两个视图的 action。
 *
 * 数据页的目录来自声明：宿主内置平台表（见 data-catalog.ts 的 PLATFORM_TABLES）
 * 加上各业务域 DomainDef.tables 里声明的表。声明过的表名就是宿主直读的白名单；
 * 某个域仍然提供自己的 dataTables/dataQuery 时，宿主的查询优先交给它执行，
 * 它失败再回落到直读（这样「可选发现」的第三方表也能浏览，但宿主绝不直读未声明的表）。
 *
 * 配置页仍然只读写宿主本机 meta，与业务插件无关。
 */
import { setAuditMeta } from "../infra/audit.js";
import { declaredCatalog, mergeDiscovered, findCatalogTable, columnDecls, kindOf, safeIdent, PLATFORM_TABLES } from "./data-catalog.js";

import { activeScheme, atomic, loadStore, preferenceItems, preferenceValue, saveStore, schemeActions, writableScheme } from "./backup-schemes.js";

const DOMAIN = "wb";
const PAGE_SIZES = [10, 25, 50, 100, 200];
const MAX_SEARCH = 100;

/**
 * 宿主直读白名单 = 声明过的表名（宿主内置平台表 + 业务域声明的表）。
 * 表名只用来和 sqlite_master 对账，SQL 里的标识符另有 safeIdent 校验。
 */
const PLATFORM_NAMES = PLATFORM_TABLES.map((t) => t.name);

/** 配置项白名单：只暴露宿主自己维护、且允许从界面改的 meta 键。 */
const CONFIG_ITEMS = [
  {
    id: "audit.recordReads",
    type: "boolean",
    defaultValue: false,
    min: 0,
    max: 0,
    step: 0,
    group: "审计",
    label: "记录只读 action",
    description: "关闭时只记录写操作与被拦截的调用；打开后审计量会明显变大。",
  },
  {
    id: "audit.retentionDays",
    type: "number",
    defaultValue: 180,
    min: 7,
    max: 3650,
    step: 1,
    group: "审计",
    label: "审计保留天数",
    description: "超出保留期的记录在写入时惰性清理，最长 3650 天。",
  },
];

const CONFIG_BY_ID = new Map(CONFIG_ITEMS.map((item) => [item.id, item]));

function pickPageSize(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 50;
  let best = PAGE_SIZES[0];
  for (const size of PAGE_SIZES) if (Math.abs(size - n) < Math.abs(best - n)) best = size;
  return best;
}

function likeEscape(text: unknown): string {
  return String(text).replace(/[\\%_]/g, (ch) => "\\" + ch);
}

function toPlain(row: any): any {
  if (!row) return row;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(row)) out[key] = row[key];
  return out;
}

function hasTable(db: any, name: string): boolean {
  try {
    return !!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(name);
  } catch {
    return false;
  }
}

function columnsOf(db: any, name: string): any[] {
  const ident = safeIdent(name);
  if (!ident) return [];
  try {
    return db.prepare("PRAGMA table_info(" + ident + ")").all();
  } catch {
    return [];
  }
}

function countOf(db: any, name: string): number {
  try {
    return Number(db.prepare("SELECT COUNT(*) AS n FROM " + name).get().n) || 0;
  } catch {
    return 0;
  }
}

/** 列元信息：真实结构 + 声明里的中文名/隐藏/掩码，字段页签与行数据共用一份。 */
function columnMeta(table: any, columns: any[]): any[] {
  const decls = columnDecls(table);
  return columns.map((c: any) => {
    const decl = decls.get(c.name);
    return {
      name: c.name,
      type: c.type || "",
      label: decl?.label || c.name,
      kind: kindOf(c.name, c.type || ""),
      pk: !!c.pk,
      notNull: !!c.notnull,
      defaultValue: c.dflt_value === undefined || c.dflt_value === null ? null : String(c.dflt_value),
      system: !!c.pk,
      hidden: !!decl?.hidden,
      mask: !!decl?.mask,
    };
  });
}

/**
 * 带行数与列元信息的表项。声明过的表即使库里还没有也照样列出（exists=false），
 * 这样「声明与库结构不一致」在界面上就是可见的，而不是悄悄少一行。
 */
function tableView(db: any, table: any): any {
  const exists = hasTable(db, table.name);
  const columns = exists ? columnsOf(db, table.name) : [];
  return {
    name: table.name,
    label: table.label || table.name,
    desc: table.desc || "",
    sort: table.sort || "rowid",
    domain: table.domainId,
    source: table.source,
    readonly: table.readonly !== false,
    exists,
    count: exists ? countOf(db, table.name) : null,
    columns: columnMeta(table, columns),
  };
}

/** 目录：声明优先，域还提供 dataTables 时并进来（标 discovered），宿主命中不到就只信声明。 */
async function tablesPayload(db: any, ctx: HostDataContext): Promise<any> {
  const groups = declaredCatalog(ctx.domains);
  for (const rec of ctx.domains.values()) {
    if (rec.def.id === "wb-shell") continue;
    const discover = rec.actions.get("dataTables");
    if (!discover) continue;
    try {
      const out: any = await discover.execute({}, { origin: "ui", domainId: rec.def.id } as any);
      const list = Array.isArray(out?.tables) ? out.tables : [];
      mergeDiscovered(groups, rec.def.id, rec.def.title || rec.def.id, list);
    } catch {
      // 发现失败不影响别的分组：它只是「可选发现」，不是目录来源。
    }
  }
  const flat: any[] = [];
  const shaped: any[] = [];
  for (const group of groups) {
    const tables = group.tables.map((t: any) => tableView(db, t)).filter(Boolean);
    if (!tables.length) continue;
    shaped.push({ id: group.id, title: group.title, tables });
    for (const t of tables) flat.push(Object.assign({}, t, { group: group.id, groupTitle: group.title }));
  }
  return { domain: DOMAIN, groups: shaped, tables: flat, count: flat.length, whitelist: PLATFORM_NAMES.length };
}

/** 声明了 mask 的列在输出层统一打码；插件自己返回的行也会再走一遍这里。 */
function maskRows(rows: any[], columns: any[]): any[] {
  const masked = columns.filter((c) => c.mask).map((c) => c.name);
  if (!masked.length || !Array.isArray(rows)) return rows;
  return rows.map((row) => {
    if (!row || typeof row !== "object") return row;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(row)) out[key] = masked.indexOf(key) >= 0 && row[key] !== null ? "***" : row[key];
    return out;
  });
}

/** 属主域自己的 dataQuery：声明过也优先用它，保持插件对「自己数据怎么读」的解释权。 */
async function queryViaOwner(rec: any, args: any): Promise<any> {
  const action = rec.actions.get("dataQuery");
  if (!action) return null;
  const out: any = await action.execute(args, { origin: "ui", domainId: rec.def.id } as any);
  const payload: any = out && typeof out === "object" ? out : {};
  if (!Array.isArray(payload.rows)) return null;
  const columns = Array.isArray(payload.columns) ? payload.columns : [];
  return Object.assign({}, payload, {
    domain: DOMAIN,
    table: String(args.table),
    owner: rec.def.id,
    rows: maskRows(payload.rows, columns),
  });
}

function directQueryPayload(db: any, table: any, args: any): any {
  const name = safeIdent(table.name);
  if (!name) throw new Error("表名不合法：" + table.name);
  if (!hasTable(db, name)) throw new Error("表 " + table.name + " 已声明但库里不存在（声明与库结构不一致）");
  const columns = columnsMetaOf(db, table);
  const names = columns.map((c: any) => c.name);
  const pageSize = pickPageSize(args.pageSize);
  const search = typeof args.search === "string" ? args.search.trim().slice(0, MAX_SEARCH) : "";
  const sort = names.indexOf(String(args.sort || "")) >= 0 ? String(args.sort) : (table.sort && names.indexOf(table.sort) >= 0 ? table.sort : names[0]);
  const order = String(args.order || "desc").toLowerCase() === "asc" ? "asc" : "desc";

  const where: string[] = [];
  const params: unknown[] = [];
  if (search) {
    const textCols = columns.filter((c: any) => String(c.type).toUpperCase() === "TEXT");
    if (textCols.length) {
      where.push("(" + textCols.map((c: any) => c.name + " LIKE ? ESCAPE '\\'").join(" OR ") + ")");
      const hit = "%" + likeEscape(search) + "%";
      for (let i = 0; i < textCols.length; i += 1) params.push(hit);
    }
  }
  const filters = args.filters && typeof args.filters === "object" ? args.filters : {};
  for (const [column, value] of Object.entries(filters as Record<string, unknown>).slice(0, 20)) {
    if (names.indexOf(column) < 0) continue;
    if (value === undefined || value === null || value === "") continue;
    where.push("CAST(" + column + " AS TEXT) LIKE ? ESCAPE '\\'");
    params.push("%" + likeEscape(String(value)) + "%");
  }
  const whereSql = where.length ? " WHERE " + where.join(" AND ") : "";

  const total = Number(db.prepare("SELECT COUNT(*) AS n FROM " + name + whereSql).get(...params).n) || 0;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  let page = Math.floor(Number(args.page)) || 1;
  if (page < 1) page = 1;
  if (page > pages) page = pages;

  const rows = db
    .prepare("SELECT * FROM " + name + whereSql + " ORDER BY " + sort + " " + order.toUpperCase() + " LIMIT ? OFFSET ?")
    .all(...params, pageSize, (page - 1) * pageSize)
    .map(toPlain);

  return {
    domain: DOMAIN,
    table: name,
    owner: table.domainId,
    columns,
    rows: maskRows(rows, columns),
    page,
    pageSize,
    pages,
    total,
    sort,
    order,
    search,
  };
}

/** 目录项 + 真实列 = 输出列（掩码、中文名、主键、默认值都在这里对齐）。 */
function columnsMetaOf(db: any, table: any): any[] {
  return columnMeta(table, columnsOf(db, table.name));
}

/**
 * 查询入口：先查目录（命中白名单或发现项），属主域有 dataQuery 就交给它，
 * 失败或没实现才由宿主直读——但直读只对**声明过**的表开放。
 */
/** 域 id 容错：允许写短名（vault）也允许写全名（wb-addon-vault）。 */
function resolveDomain(ctx: HostDataContext, raw: string): any {
  const key = String(raw || "").trim();
  if (!key) return null;
  const direct = ctx.domains.get(key);
  if (direct) return direct;
  const full = "wb-addon-" + key;
  if (ctx.domains.get(full)) return ctx.domains.get(full);
  for (const rec of ctx.domains.values()) {
    if (rec.def.id.replace(/^wb-addon-/, "") === key) return rec;
  }
  return null;
}

async function queryPayload(db: any, args: any, ctx: HostDataContext): Promise<any> {
  const name = String(args.table || "").trim();
  const domainId = args.domain ? String(args.domain).trim() : "";
  const groups = declaredCatalog(ctx.domains);
  let table = findCatalogTable(groups, name, domainId || undefined);
  if (!table) {
    // 未声明：只可能是「域自己暴露的表」——向该域问一次 dataTables，问不到就拒绝。
    const owner = domainId ? resolveDomain(ctx, domainId) : null;
    const discover = owner ? owner.actions.get("dataTables") : null;
    if (discover) {
      try {
        const out: any = await discover.execute({}, { origin: "ui", domainId: owner.def.id } as any);
        mergeDiscovered(groups, owner.def.id, owner.def.title || owner.def.id, out?.tables);
        table = findCatalogTable(groups, name, owner.def.id);
      } catch {
        table = null;
      }
    }
  }
  if (!table) throw new Error("未知表：" + (name || "(空)") + (domainId ? "（域 " + domainId + "）" : "") + "；宿主只浏览声明过或属主显式暴露的表");
  const rec = ctx.domains.get(table.domainId) ?? null;
  if (rec) {
    try {
      const viaOwner = await queryViaOwner(rec, args);
      if (viaOwner) return viaOwner;
    } catch (e) {
      // 属主自己失败时回落到直读；未声明的表没有回落资格，错误如实抛出。
      if (table.source !== "declared") throw e;
    }
  }
  if (table.source !== "declared") throw new Error("表 " + table.name + " 只由属主域提供读取，属主未返回数据");
  return directQueryPayload(db, table, args);
}

function readMetaValue(db: any, item: any): { value: unknown; overridden: boolean } {
  let raw = "";
  try {
    const row = db.prepare("SELECT v FROM meta WHERE k = ?").get(item.id);
    raw = row && row.v !== undefined && row.v !== null ? String(row.v) : "";
  } catch {
    raw = "";
  }
  if (raw === "") return { value: item.defaultValue, overridden: false };
  if (item.type === "boolean") {
    const text = raw.trim().toLowerCase();
    return { value: text === "1" || text === "true" || text === "yes" || text === "on", overridden: true };
  }
  const num = Number(raw);
  const value = Number.isFinite(num) ? Math.min(item.max, Math.max(item.min, Math.floor(num))) : item.defaultValue;
  return { value, overridden: true };
}

function configState(db: any): any {
  const values: Record<string, unknown> = {};
  const overrides: Record<string, unknown> = {};
  for (const item of CONFIG_ITEMS) {
    const read = readMetaValue(db, item);
    values[item.id] = read.value;
    if (read.overridden) overrides[item.id] = read.value;
  }
  const store = loadStore(db);
  const current = activeScheme(store);
  for (const item of preferenceItems) values[item.id] = item.default;
  Object.assign(values, current?.overrides);
  Object.assign(overrides, current?.overrides);
  return {
    domain: DOMAIN,
    items: [...CONFIG_ITEMS.map((item) => ({
      id: item.id,
      type: item.type,
      group: item.group,
      label: item.label,
      description: item.description,
      default: item.defaultValue,
      min: item.min,
      max: item.max,
      step: item.step,
    })), ...preferenceItems],
    groups: ["审计", "数据备份", "云端"].map(id => ({ id, label: id })),
    scheme: current ? { id: current.id, name: current.name } : null,
    schemes: store.schemes.map(({ id, name }) => ({ id, name })),
    values,
    overrides,
    disclaimer: "这里只改本机 meta，不影响子插件配置与云端同步内容。",
  };
}

function coerceValue(item: any, value: unknown): unknown {
  if (item.type === "boolean") {
    if (typeof value === "boolean") return value;
    const text = String(value === undefined || value === null ? "" : value).trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(text)) return true;
    if (["0", "false", "no", "off", ""].includes(text)) return false;
    throw new Error("配置项 " + item.id + " 只能是 true/false");
  }
  const num = Number(value);
  if (!Number.isFinite(num)) throw new Error("配置项 " + item.id + " 必须是数字");
  const floor = Math.floor(num);
  if (floor < item.min || floor > item.max) {
    throw new Error("配置项 " + item.id + " 必须在 " + item.min + "–" + item.max + " 之间");
  }
  return floor;
}

function writeValues(db: any, values: unknown): any {
  if (!values || typeof values !== "object") throw new Error("values 必须是对象");
  const entries = Object.entries(values as Record<string, unknown>);
  if (!entries.length) throw new Error("没有要保存的配置项");
  const changed: Array<{ id: string; value: unknown }> = [];
  return atomic(db, () => {
    const store = loadStore(db);
    let preferencesChanged = false;
    for (const [id, raw] of entries) {
      const item = CONFIG_BY_ID.get(id);
      if (item) {
        const value = coerceValue(item, raw);
        setAuditMeta(db, id, item.type === "boolean" ? (value ? "1" : "0") : String(value));
        changed.push({ id, value });
      } else {
        if (!preferenceItems.some(item => item.id === id)) throw new Error("未知宿主配置项：" + id);
        const value = preferenceValue(id, raw);
        writableScheme(store).overrides[id] = value;
        preferencesChanged = true;
        changed.push({ id, value });
      }
    }
    if (preferencesChanged) saveStore(db, store);
    return Object.assign(configState(db), { changed });
  });
}

function resetValues(db: any, ids: unknown): any {
  if (ids !== undefined && !Array.isArray(ids)) throw new Error("ids 必须是数组");
  const reset = Array.isArray(ids) && ids.length ? ids.map(String) : [...CONFIG_ITEMS, ...preferenceItems].map(item => item.id);
  return atomic(db, () => {
    const store = loadStore(db);
    const scheme = activeScheme(store);
    for (const id of reset) {
      if (CONFIG_BY_ID.has(id)) db.prepare("DELETE FROM meta WHERE k = ?").run(id);
      else if (!preferenceItems.some(item => item.id === id)) throw new Error("未知宿主配置项：" + id);
      else if (scheme) delete scheme.overrides[id];
    }
    if (scheme) saveStore(db, store);
    return Object.assign(configState(db), { reset });
  });
}

/** 数据页要用到的宿主上下文：已注册域表（声明 + 可选发现 + 属主 dataQuery 都从它取）。 */
export interface HostDataContext {
  domains: Map<string, any>;
}

/** 把宿主的数据/配置 action 并进元 action 表（wb-shell 域，不进备份）。 */
export function createHostDataActions(db: any, ctx: HostDataContext = { domains: new Map() }): Map<string, any> {
  return new Map<string, any>([
    ...schemeActions(db, () => configState(db)),
    [
      "wb.dataTables",
      {
        description: "列出宿主数据页的目录：宿主内置平台表 + 各业务域声明或暴露的表，按域分组，带行数与列元信息（中文名、主键、默认值、掩码）。只读，供宿主「数据」视图使用。",
        input: { type: "object", properties: {} },
        examples: [{}],
        execute: () => tablesPayload(db, ctx),
        render: (r: any) => r.groups.map((g: any) => g.title + "：" + g.tables.map((t: any) => t.name + "(" + (t.count === null ? "?" : t.count) + " 行)").join("、")).join("；"),
      },
    ],
    [
      "wb.dataQuery",
      {
        description: "只读分页查询数据页目录里的任意表（宿主平台表或业务域声明的表）：表名必须命中声明目录，可排序、可关键字过滤与逐列筛选。属主域自己提供 dataQuery 时优先交给它执行。",
        input: {
          type: "object",
          required: ["table"],
          properties: {
            table: { type: "string", description: "表名，必须在 wb.dataTables 的目录里" },
            domain: { type: "string", description: "属主域 id（表名在全目录重名时必须给），如 wb-addon-vault" },
            page: { type: "number", description: "页码，从 1 开始，越界自动夹取" },
            pageSize: { type: "number", enum: PAGE_SIZES, description: "每页条数，默认 50" },
            sort: { type: "string", description: "排序列名，必须是该表真实列；默认主键列" },
            order: { type: "string", enum: ["asc", "desc"], description: "排序方向，默认 desc" },
            search: { type: "string", description: "关键字，匹配所有 TEXT 列，最长 100 字" },
            filters: {
              type: "object",
              description: "逐列值筛选：{列名: 值}，按包含匹配，与其他条件 AND",
              additionalProperties: { type: "string" },
            },
          },
        },
        examples: [{ table: "audit_log", pageSize: 20 }, { table: "vault_group", domain: "wb-addon-vault" }, { table: "sync_dead_letter", search: "mail" }],
        execute: (args: any) => queryPayload(db, args || {}, ctx),
        render: (r: any) => r.table + " 第 " + r.page + "/" + r.pages + " 页，共 " + r.total + " 行",
      },
    ],
    [
      "wb.configGet",
      {
        description: "读取全局审计设置、本机备份与云端显示偏好、方案列表和当前方案。",
        input: { type: "object", properties: {} },
        examples: [{}],
        execute: () => configState(db),
        render: (s: any) => "宿主配置：" + s.items.map((item: any) => item.id + "=" + JSON.stringify(s.values[item.id])).join("、"),
      },
    ],
    [
      "wb.configSet",
      {
        description: "保存一项或多项宿主本机配置（整批原子）。审计项保持全局，备份与云端显示偏好写入当前方案，无方案时自动创建本机配置。",
        input: {
          type: "object",
          properties: {
            values: {
              type: "object",
              description: "要保存的配置项，键为配置 id、值为新值",
              properties: {
                "audit.recordReads": { description: "全局审计开关，支持布尔值与旧开关文本" },
                "audit.retentionDays": { description: "全局审计保留天数，7–3650" },
                "backup.exportFormat": { type: "string", enum: ["zip", "json", "csv", "txt"] },
                "backup.moduleIds": { type: ["array", "null"], maxItems: 256, items: { type: "string", pattern: "^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$" }, description: "null 动态全选，空数组不预选" },
                "cloud.conflictLimit": { type: "integer", minimum: 1, maximum: 100 },
              },
              additionalProperties: false,
            },
          },
          required: ["values"],
        },
        examples: [{ values: { "audit.retentionDays": 90 } }],
        execute: (args: any) => writeValues(db, args && args.values),
        render: (r: any) => "已保存宿主配置：" + r.changed.map((c: any) => c.id + "=" + JSON.stringify(c.value)).join("、"),
      },
    ],
    [
      "wb.configReset",
      {
        description: "删除宿主本机配置覆盖项，回到默认值；不传 ids 时重置全部。",
        input: {
          type: "object",
          properties: { ids: { type: "array", items: { type: "string" }, description: "要重置的配置 id" } },
        },
        execute: (args: any) => resetValues(db, args && args.ids),
        render: (r: any) => "已恢复默认：" + r.reset.join("、"),
      },
    ],
  ]);
}
