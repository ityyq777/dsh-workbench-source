/**
 * 宿主自己的「数据」与「配置」两个视图的 action。
 *
 * 子插件各自注册 <domain>.dataTables / dataQuery / configGet / configSet，
 * 宿主不是业务插件、也不进备份，所以这几项统一挂在 wb-shell 元 action 名下的
 * wb.* 前缀，供宿主页面与 agent 用同一套 schema 发现链路读取。
 */
import { setAuditMeta } from "../infra/audit.js";

import { activeScheme, atomic, loadStore, preferenceItems, preferenceValue, saveStore, schemeActions, writableScheme } from "./backup-schemes.js";

const DOMAIN = "wb";
const PAGE_SIZES = [10, 25, 50, 100, 200];
const MAX_SEARCH = 100;

/**
 * 宿主自有平台表白名单。列 packages/core/lib/schema.js 里的平台表、审计表，
 * 以及内化进宿主的自动化三张表；其余业务表归各自插件，宿主页面不越权浏览。
 */
const TABLES = [
  { name: "meta", label: "键值（meta）", sort: "k", desc: "本机配置与元数据" },
  { name: "sync_change_log", label: "变更日志", sort: "seq", desc: "未推送尾部即待同步队列" },
  { name: "conflict_shadow", label: "冲突留档", sort: "id", desc: "LWW 输方版本留档" },
  { name: "sync_dead_letter", label: "同步死信", sort: "id", desc: "单行/单表连续失败" },
  { name: "sync_state", label: "同步水位", sort: "k", desc: "水位、时钟、最后状态" },
  { name: "session_role", label: "会话角色", sort: "session_id", desc: "只影响本机当前会话" },
  { name: "audit_log", label: "审计日志", sort: "id", desc: "action 调用账本" },
  { name: "host_event", label: "事件队列", sort: "created_at", desc: "push 进来的事件（queued/done/dead）" },
  { name: "host_event_delivery", label: "事件投递", sort: "updated_at", desc: "按订阅拆出的投递：pending/running/done/dead" },
  { name: "host_event_subscription", label: "事件订阅", sort: "domain", desc: "哪个域用哪个 plugin-only action 消费哪类事件" },
  { name: "automation_rule", label: "自动化规则", sort: "created_at", desc: "触发条件 + 已启用 action（或交给 AI 的提示词）" },
  { name: "automation_run", label: "自动化运行记录", sort: "started_at", desc: "每次触发的成败与错误，仅本机" },
  { name: "automation_meta", label: "自动化设置", sort: "key", desc: "可调用 action 白名单等本机配置" },
];

const TABLE_BY_NAME = new Map(TABLES.map((t) => [t.name, t]));

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
  try {
    return db.prepare("PRAGMA table_info(" + name + ")").all();
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

function tablesPayload(db: any): any {
  const tables = TABLES.filter((t) => hasTable(db, t.name)).map((t) => ({
    name: t.name,
    label: t.label,
    desc: t.desc,
    count: countOf(db, t.name),
    columns: columnsOf(db, t.name).map((c: any) => ({
      name: c.name,
      type: c.type || "",
      pk: !!c.pk,
      notNull: !!c.notnull,
    })),
  }));
  return { domain: DOMAIN, tables };
}

function queryPayload(db: any, args: any): any {
  const name = String(args.table || "");
  const spec = TABLE_BY_NAME.get(name);
  if (!spec || !hasTable(db, name)) throw new Error("未知宿主表：" + name);
  const columns = columnsOf(db, name);
  const names = columns.map((c: any) => c.name);
  const pageSize = pickPageSize(args.pageSize);
  const search = typeof args.search === "string" ? args.search.trim().slice(0, MAX_SEARCH) : "";
  const sort = names.indexOf(String(args.sort || "")) >= 0 ? String(args.sort) : spec.sort;
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
  for (const [column, value] of Object.entries(filters).slice(0, 20)) {
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
    columns: columns.map((c: any) => ({ name: c.name, type: c.type || "", label: c.name, system: !!c.pk })),
    rows,
    page,
    pageSize,
    pages,
    total,
    sort,
    order,
    search,
  };
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

/** 把宿主的数据/配置 action 并进元 action 表（wb-shell 域，不进备份）。 */
export function createHostDataActions(db: any): Map<string, any> {
  return new Map<string, any>([
    ...schemeActions(db, () => configState(db)),
    [
      "wb.dataTables",
      {
        description: "列出宿主自己维护的平台表（meta、同步日志/死信/水位、会话记录模式、审计日志）的行数与列元信息；只读，供宿主「数据」视图使用。",
        input: { type: "object", properties: {} },
        examples: [{}],
        execute: () => tablesPayload(db),
        render: (r: any) => r.tables.map((t: any) => t.name + " " + t.count + " 行").join("、"),
      },
    ],
    [
      "wb.dataQuery",
      {
        description: "只读分页查询宿主平台表：表名白名单、可排序、可关键字过滤与逐列筛选。业务表请用各自插件域的 dataQuery。",
        input: {
          type: "object",
          required: ["table"],
          properties: {
            table: { type: "string", enum: TABLES.map((t) => t.name), description: "宿主平台表名" },
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
        examples: [{ table: "audit_log", pageSize: 20 }, { table: "sync_dead_letter", search: "mail" }],
        execute: (args: any) => queryPayload(db, args || {}),
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
