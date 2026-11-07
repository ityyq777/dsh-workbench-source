/**
 * @wb/sdk：DSH 原生业务插件与工作台宿主之间的契约。
 *
 * 四个包：
 *  - dsh-workbench：宿主，提供 workbench 服务与页面；
 *  - dsh-workbench-tasks / tags / sites：业务插件，依赖宿主并用
 *    ctx.workbench.registerDomain() 注册自己的 action / view / 表。
 *
 * 业务插件仍然是普通的 DSH cordis 插件：
 *   export const inject = ["workbench"];
 *   export function apply(ctx) { ctx.workbench.registerDomain({...}); }
 */

export interface DomainViewTitle {
  zh: string;
  en?: string;
}

export interface DomainViewDecl {
  id: string;
  title: string | DomainViewTitle;
}

/** action 执行上下文：宿主注入来源与事件通道。 */
export interface DomainActionContext {
  /** ui/agent 本地写入需要进 change log；sync 回写不进 */
  origin: "ui" | "agent" | "sync";
  /** 广播到本业务域的所有订阅者（SSE -> 浏览器） */
  emit(event: string, data?: unknown): void;
}

export interface DomainActionDef<I = Record<string, unknown>, O = unknown> {
  description?: string;
  /** JSON Schema（给 Workbench tool / 文档用） */
  input?: Record<string, unknown>;
  execute(args: I, ctx: DomainActionContext): O | Promise<O>;
  /** 给 agent 看的文本渲染；缺省 JSON.stringify */
  render?(result: O): string;
  /** 可选调用示例；actions.help 会原样返回，便于 agent 自举 */
  examples?: Record<string, unknown>[];
}

/**
 * 数据导出/导入上下文。
 * 宿主只负责压缩包与路由；业务插件用 version/schemaVersion 自己做兼容校验。
 */
export interface DomainDataContext {
  readonly shellVersion: string;
  /** 备份包格式版本（manifest.formatVersion） */
  readonly formatVersion: number;
  /** 导出时间（ISO 8601），导入时为备份文件里的时间 */
  readonly exportedAt: string;
}

/** 重复 ID 时的导入策略：最新优先（默认）/ 跳过本地已存在 / 强制覆盖。 */
export type DomainImportPolicy = "newest" | "skip" | "overwrite";

export interface DomainImportOptions {
  /** 由宿主按模块传入；缺省按 newest 处理 */
  policy?: DomainImportPolicy;
}

/** 单个业务插件的导入结果；导入失败不应抛到宿主之外。 */
export interface DomainImportReport {
  ok: boolean;
  imported?: number;
  skipped?: number;
  failed?: number;
  message?: string;
}

/** 一行同步数据：业务表的完整行；updated_at 毫秒时间戳。 */
export interface SyncRow {
  id: string;
  updated_at: number;
  created_at?: number;
  deleted_at?: number | null;
  rev?: number;
  [key: string]: unknown;
}

export type SyncMode = "row" | "tree";

/** 树表 reconcile：拿远端快照与本地行，返回要整表覆盖的最终行。 */
export interface SyncReconcileResult {
  rows: SyncRow[];
  /** 需要按行补推的脏表（可选，例如 reconcile 顺带修复了 A 类行） */
  dirtyRowTables?: string[];
}

export interface DomainSyncTable {
  name: string;
  mode: SyncMode;
  /**
   * 仅树表需要：把远端快照合并进本地数据，返回最终整表。
   * second 参数是本地当前行，便于保留本地新节点/修复孤儿。
   */
  reconcile?(remoteRows: SyncRow[], localRows: SyncRow[]): SyncReconcileResult | Promise<SyncReconcileResult>;
  /** 唯一键组合；冲突时用于 lww-tombstone 处理（可选） */
  uniqueKeys?: string[][];
  uniquePolicy?: "lww" | "lww-tombstone";
}

export interface DomainSyncDef {
  tables: DomainSyncTable[];
}

/** 业务插件在 setup 期间拿到的宿主 API（兼容旧 addon 的 setup 形态）。 */
export interface DomainSetupApi {
  readonly addon: { id: string; version: string; dir: string };
  /** 宿主打开的 SQLite（node:sqlite DatabaseSync），事务由业务插件自己组织 */
  readonly db: any;
  readonly shellVersion: string;
  /** 本地写入时钟：已做服务端时钟校准并保证单调递增 */
  now(): number;
  /** 手动标记某张表为脏（可选；一般由 change log 自动判定） */
  markSyncDirty?(table?: string): void;
  /** 某个业务域是否已注册（用于跨插件能力探测，如站点检测标签） */
  hasDomain(id: string): boolean;
  /** 旧名兼容 */
  hasAddon(id: string): boolean;
  /** 注册一个 action（同名再注册会覆盖，热重载友好） */
  action(name: string, def: DomainActionDef): void;
  /** 同 action；保留旧称便于迁移 */
  tool(name: string, def: DomainActionDef): void;
  /** 向本业务域的 SSE 订阅者广播 */
  emit(event: string, data?: unknown): void;
  log(...args: unknown[]): void;
}

/** 业务域定义：DSH 插件 apply() 里交给宿主。 */
export interface DomainDef {
  /** 稳定 id，如 wb-addon-tasks；用于 DOM / action 归属 / 跨插件探测 */
  id: string;
  title: string;
  description?: string;
  version: string;
  /** 声明贡献的表（备份与文档用；建表仍由业务插件负责） */
  tables?: string[];
  /** 同步声明：mode=row 行级 LWW；mode=tree 必须实现 reconcile，整表覆盖 */
  sync?: DomainSyncDef;
  /** UI 视图贡献点：客户端模块注册同名 view 后出现在工作台首页 */
  views?: DomainViewDecl[];
  /** 业务插件自己的建表/注册逻辑；宿主调用并保存返回值作为清理函数 */
  setup?(api: DomainSetupApi): void | (() => void) | Promise<void | (() => void)>;
  /** 导出本插件的业务数据；返回可 JSON 序列化的对象，由宿主写入压缩包。 */
  exportData?(ctx: DomainDataContext): unknown | Promise<unknown>;
  /** 导入本插件负责的数据；raw 是压缩包里的原始文本，插件自行 JSON.parse/校验。 */
  importData?(raw: string, ctx: DomainDataContext, options?: DomainImportOptions): DomainImportReport | Promise<DomainImportReport>;
}

/** 宿主服务：ctx.workbench */
export interface WorkbenchHost {
  readonly db: any;
  readonly shellVersion: string;
  /** 注册业务域；重复 id 会被拒绝。返回注销函数。 */
  registerDomain(def: DomainDef): () => void;
  hasDomain(id: string): boolean;
  /** 已注册业务域（给 HTTP / 客户端用） */
  listDomains(): DomainPublicInfo[];
  /** 执行一个 <namespace>.<action>；返回结果与 agent 文本 */
  invoke(
    action: string,
    args: Record<string, unknown>,
    origin: "ui" | "agent" | "sync",
  ): Promise<{ result: unknown; text: string; domainId: string }>;
  /** action -> 所属 domain */
  actionNames(): { name: string; domainId: string; description?: string }[];
  emit(event: string, data?: unknown): void;
  log(...args: unknown[]): void;
}

export interface DomainPublicInfo {
  id: string;
  title: string;
  description?: string;
  version: string;
  enabled: boolean;
  error: string | null;
  tables: string[];
  views: DomainViewDecl[];
  /** 是否实现数据导出/导入，客户端据此启用备份选项 */
  backup: { export: boolean; import: boolean };
  /** 同步参与方式（给 UI/诊断用） */
  sync: { tables: { name: string; mode: SyncMode }[] };
}

/** 浏览器侧宿主桥（宿主注入到 window.__WB_HOST__）。 */
export interface WbHostBridge {
  react: any;
  jsx: any;
  h: any;
  /** 业务客户端模块注册视图；宿主首页据此生成卡片 */
  registerAddon(mod: WbClientModule): void;
  /** 已注册的业务客户端模块（只读快照） */
  readonly addons: WbClientModule[];
  /** 最近一次客户端加载错误 */
  error(): string | null;
}

/** 业务客户端模块注册的视图。 */
export interface WbClientModule {
  id: string;
  title?: string;
  description?: string;
  version?: string;
  views: {
    id: string;
    title: string | DomainViewTitle;
    component: any;
  }[];
}
