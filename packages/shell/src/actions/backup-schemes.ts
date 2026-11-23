import { randomUUID } from "node:crypto";

/** 方案正文与激活指针同存一项本机元数据，写入方在事务内完成读改写。 */
const KEY = "wb.localBackupSchemes";
type Values = Record<string, unknown>;
type Scheme = { id: string; name: string; overrides: Values };
type Store = { activeId: string | null; schemes: Scheme[] };
const formats = ["zip", "json", "csv", "txt"];
export const preferenceItems = [
  { id: "backup.exportFormat", type: "select", group: "数据备份", label: "默认导出格式", description: "打开备份页时使用的导出格式。", default: "zip", options: formats },
  { id: "backup.moduleIds", type: "modules", group: "数据备份", label: "默认备份模块", description: "未指定时选中全部可导出的模块，空列表表示不预选模块。", default: null },
  { id: "cloud.conflictLimit", type: "number", group: "云端", label: "冲突列表条数", description: "云端同步页显示的最近冲突记录上限。", default: 20, min: 1, max: 100, step: 1 },
];
export function preferenceValue(id: string, raw: unknown): unknown {
  if (id === "backup.exportFormat" && typeof raw === "string" && formats.includes(raw)) return raw;
  if (id === "cloud.conflictLimit" && typeof raw === "number" && Number.isInteger(raw) && raw >= 1 && raw <= 100) return raw;
  if (id === "backup.moduleIds") {
    if (raw === null) return null;
    if (Array.isArray(raw) && raw.length <= 256 && raw.every(v => typeof v === "string" && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/.test(v))) return [...new Set(raw)];
  }
  throw new Error("无效的宿主偏好值：" + id);
}
export function loadStore(db: any): Store {
  const row = db.prepare("SELECT v FROM meta WHERE k=?").get(KEY);
  return row ? JSON.parse(row.v) : { activeId: null, schemes: [] };
}
export function saveStore(db: any, store: Store) {
  db.prepare("INSERT INTO meta(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").run(KEY, JSON.stringify(store));
}
export function activeScheme(store: Store) { return store.schemes.find(s => s.id === store.activeId); }
function add(store: Store, name: string, overrides: Values) {
  const scheme = { id: randomUUID(), name, overrides: { ...overrides } };
  store.schemes.push(scheme);
  store.activeId = scheme.id;
  return scheme;
}
export function writableScheme(store: Store) { return activeScheme(store) ?? add(store, "本机配置", {}); }
export function atomic<T>(db: any, run: () => T): T {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = run();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
export function schemeActions(db: any, snapshot: () => any): Map<string, any> {
  function mutation(description: string, properties: Values, required: string[], mutate: (s: Store, a: any) => void) {
    return { description, origins: ["ui", "plugin", "agent"], input: { type: "object", properties, required, additionalProperties: false },
      execute: (args: any) => atomic(db, () => {
        const store = loadStore(db);
        mutate(store, args || {});
        saveStore(db, store);
        return snapshot();
      }) };
  }
  const id = { type: "string", minLength: 1 }, name = { type: "string", minLength: 1, maxLength: 100 };
  function scheme(store: Store, id: unknown) {
    const found = store.schemes.find(s => s.id === id);
    if (!found) throw new Error("找不到宿主配置方案");
    return found;
  }
  function title(raw: unknown) {
    if (typeof raw !== "string" || !raw.trim() || raw.length > 100) throw new Error("方案名称须为 1–100 字");
    return raw.trim();
  }
  return new Map([
    ["wb.configSchemeCreate", mutation("新建并激活本机备份偏好方案。from=current 复制当前方案，default 从默认值开始。", { name, from: { type: "string", enum: ["current", "default"] } }, ["name"], (s, a) => {
      if (a.from !== undefined && a.from !== "current" && a.from !== "default") throw new Error("未知方案来源");
      add(s, title(a.name), a.from === "default" ? {} : activeScheme(s)?.overrides ?? {});
    })],
    ["wb.configSchemeRename", mutation("重命名本机备份偏好方案。", { id, name }, ["id", "name"], (s, a) => { scheme(s, a.id).name = title(a.name); })],
    ["wb.configSchemeDelete", mutation("删除本机备份偏好方案。删除当前方案后使用默认备份偏好。", { id }, ["id"], (s, a) => {
      const found = scheme(s, a.id);
      s.schemes = s.schemes.filter(v => v !== found);
      if (s.activeId === found.id) s.activeId = null;
    })],
    ["wb.configSchemeActivate", mutation("切换本机备份偏好方案。省略 id 或传空值回到默认偏好。", { id: { type: ["string", "null"] } }, [], (s, a) => {
      s.activeId = a.id == null || a.id === "" ? null : scheme(s, a.id).id;
    })],
  ]);
}
