/**
 * 宿主「数据」页的目录聚合与只读查询。
 *
 * 目录由三部分组成：
 *   1. 宿主内置平台表（PLATFORM_TABLES，写死在这里而不是散在页面里）；
 *   2. 业务域在 DomainDef.tables 里声明的表——这是宿主直读的白名单来源；
 *   3. 可选发现：域仍提供 dataTables 时，把它列出来的表并进目录，但**只读得到**
 *      走该域自己的 dataQuery（未声明的表不进白名单，宿主绝不直读）。
 *
 * 只读与掩码都在这一层收口：SQL 只拼 SELECT，列名只认 PRAGMA 的真实列，
 * 声明了 mask 的列在输出前统一替换成 ***（插件返回的行也会再过一遍）。
 */
import type { DomainTableDecl, DomainTableColumnDecl } from "@wb/sdk";

/** 目录里的一个表项。 */
export interface CatalogTable {
  name: string;
  /** 中文展示名；缺省用表名 */
  label?: string;
  desc?: string;
  sort?: string;
  readonly?: boolean;
  columns?: Array<string | DomainTableColumnDecl>;
  /** 属主域 id；宿主内置表固定为 wb-shell */
  domainId: string;
  /** declared=域声明过（宿主可直读）；discovered=只由插件 dataTables 暴露 */
  source: "declared" | "discovered";
}

/** 左侧目录树的一个分组（宿主内置一组，每个声明了表的域一组）。 */
export interface CatalogGroup {
  id: string;
  title: string;
  tables: CatalogTable[];
}

/** 宿主内置平台表：列 shell 自己的库、审计、同步、事件队列与自动化运行记录。 */
export const PLATFORM_TABLES: DomainTableDecl[] = [
  { name: "meta", label: "键值（meta）", sort: "k", desc: "本机配置与元数据", columns: [{ name: "k", label: "键" }, { name: "v", label: "值" }] },
  { name: "sync_change_log", label: "变更日志", sort: "seq", desc: "未推送尾部即待同步队列" },
  { name: "conflict_shadow", label: "冲突留档", sort: "id", desc: "LWW 输方版本留档" },
  { name: "sync_dead_letter", label: "同步死信", sort: "id", desc: "单行/单表连续失败" },
  { name: "sync_state", label: "同步水位", sort: "k", desc: "水位、时钟、最后状态" },
  { name: "session_role", label: "会话角色", sort: "session_id", desc: "只影响本机当前会话" },
  { name: "audit_log", label: "审计日志", sort: "id", desc: "action 调用账本" },
  { name: "host_event", label: "事件队列", sort: "created_at", desc: "push 进来的事件（queued/done/dead）" },
  { name: "host_event_delivery", label: "事件投递", sort: "updated_at", desc: "按订阅拆出的投递：pending/running/done/dead" },
  { name: "host_event_subscription", label: "事件订阅", sort: "domain", desc: "哪个域用哪个 plugin-only action 消费哪类事件" },
  { name: "host_automation_rule", label: "自动化规则", sort: "created_at", desc: "触发条件 + 已启用 action（或交给 AI 的提示词）" },
  { name: "host_automation_run", label: "自动化运行记录", sort: "started_at", desc: "每次触发的成败与错误，仅本机" },
  { name: "host_automation_meta", label: "自动化设置", sort: "key", desc: "可调用 action 白名单等本机配置" },
];

const TABLE_NAME_RE = /^[A-Za-z_][A-Za-z0-9_]{0,63}$/;
const HOST_DOMAIN = "wb-shell";

/** 把声明的表归一成对象形式；字符串写法等价于只给名字。非法名字直接丢弃。 */
export function normalizeTableDecl(raw: string | DomainTableDecl): CatalogTable | null {
  const decl: DomainTableDecl = typeof raw === "string" ? { name: raw } : raw || ({} as DomainTableDecl);
  const name = String(decl.name ?? "").trim();
  if (!TABLE_NAME_RE.test(name)) return null;
  const columns: Array<string | DomainTableColumnDecl> = [];
  for (const col of Array.isArray(decl.columns) ? decl.columns : []) {
    const item = typeof col === "string" ? { name: col } : col;
    const colName = String(item?.name ?? "").trim();
    if (!TABLE_NAME_RE.test(colName)) continue;
    columns.push(typeof col === "string" ? colName : { ...item, name: colName });
  }
  const out: CatalogTable = { name, domainId: HOST_DOMAIN, source: "declared" };
  if (decl.label) out.label = String(decl.label);
  if (decl.desc) out.desc = String(decl.desc);
  if (decl.sort && TABLE_NAME_RE.test(String(decl.sort))) out.sort = String(decl.sort);
  if (decl.readonly) out.readonly = true;
  if (columns.length) out.columns = columns;
  return out;
}

/** 一个域声明的表：字符串与对象混写都接受，重名只留第一条。 */
export function declaredTablesOf(domainId: string, tables: unknown): CatalogTable[] {
  const out: CatalogTable[] = [];
  const seen = new Set<string>();
  for (const raw of Array.isArray(tables) ? tables : []) {
    const entry = normalizeTableDecl(raw as any);
    if (!entry || seen.has(entry.name)) continue;
    seen.add(entry.name);
    entry.domainId = domainId;
    out.push(entry);
  }
  return out;
}

/**
 * 只靠声明就能得到的目录：宿主内置一组 + 每个声明了表的域一组。
 * 可选发现（域自己的 dataTables）由调用方补进对应分组。
 */
export function declaredCatalog(domains: Map<string, { def: { id: string; title: string; tables?: unknown } }>): CatalogGroup[] {
  const groups: CatalogGroup[] = [];
  const platform = declaredTablesOf(HOST_DOMAIN, PLATFORM_TABLES);
  if (platform.length) groups.push({ id: HOST_DOMAIN, title: "宿主平台表", tables: platform });
  for (const rec of domains.values()) {
    const declared = declaredTablesOf(rec.def.id, rec.def.tables);
    if (declared.length) groups.push({ id: rec.def.id, title: rec.def.title || rec.def.id, tables: declared });
  }
  return groups;
}

/** 把可选发现的表并进目录：未声明的按 discovered 记，已声明的只补 label 不覆盖来源。 */
export function mergeDiscovered(groups: CatalogGroup[], domainId: string, title: string, tables: unknown): void {
  const list: any[] = Array.isArray(tables) ? tables : [];
  if (!list.length) return;
  let group = groups.filter((g) => g.id === domainId)[0];
  if (!group) {
    group = { id: domainId, title: title || domainId, tables: [] };
    groups.push(group);
  }
  for (const raw of list) {
    const name = String(raw?.name ?? "").trim();
    if (!TABLE_NAME_RE.test(name)) continue;
    const hit = group.tables.filter((t) => t.name === name)[0];
    if (hit) {
      if (!hit.label && raw?.label) hit.label = typeof raw.label === "string" ? raw.label : raw.label.zh || raw.label.en;
      continue;
    }
    const entry: CatalogTable = { name, domainId, source: "discovered" };
    if (raw?.label) entry.label = typeof raw.label === "string" ? raw.label : raw.label.zh || raw.label.en;
    if (raw?.desc) entry.desc = String(raw.desc);
    group.tables.push(entry);
  }
}

/** 按 (表, 域) 查目录项；不给域时要求表名在全目录里唯一。 */
export function findCatalogTable(groups: CatalogGroup[], name: string, domainId?: string): CatalogTable | null {
  const hits: CatalogTable[] = [];
  for (const g of groups) for (const t of g.tables) if (t.name === name) hits.push(t);
  if (!hits.length) return null;
  if (domainId) return hits.filter((t) => t.domainId === domainId)[0] ?? null;
  return hits.length === 1 ? hits[0] : null;
}

/** 声明的列元信息：按列名索引，供宿主把真实列与中文名/掩码对齐。 */
export function columnDecls(table: CatalogTable): Map<string, DomainTableColumnDecl> {
  const map = new Map<string, DomainTableColumnDecl>();
  for (const col of Array.isArray(table.columns) ? table.columns : []) {
    const item = typeof col === "string" ? { name: col } : col;
    if (item?.name) map.set(String(item.name), item as DomainTableColumnDecl);
  }
  return map;
}

const TEXT_TYPES = /CHAR|CLOB|TEXT/i;
const NUM_TYPES = /INT|REAL|FLOA|DOUB|NUM|DEC/i;

/** 由列名与声明类型猜渲染用的 kind（与业务插件数据页的口径一致）。 */
export function kindOf(name: string, type: string): string {
  if (/^(id|.*_id)$/i.test(name)) return "id";
  if (/_(at|time)$|^created_at$|^updated_at$/i.test(name)) return "timestamp";
  if (/^(deleted_at|.*_at)$/i.test(name) && !/^(created|updated)/i.test(name)) return "timestamp";
  if (TEXT_TYPES.test(type)) return "text";
  if (NUM_TYPES.test(type)) return "number";
  if (/BLOB/i.test(type)) return "text";
  return "text";
}

/** 去掉换行等控制字符，避免 SQL 里拼进奇怪的东西（列名本来也只来自 PRAGMA）。 */
export function safeIdent(name: string): string {
  return TABLE_NAME_RE.test(name) ? name : "";
}
