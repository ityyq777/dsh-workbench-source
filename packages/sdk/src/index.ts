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

/** action 调用来源：plugin 是插件后台调用，不能伪装成 ui。 */
export type ActionOrigin = "ui" | "agent" | "sync" | "plugin";

/** action 执行上下文：宿主注入来源与事件通道。 */
export interface DomainActionContext {
  /** ui/agent 本地写入需要进 change log；sync 回写不进；plugin 是插件后台 */
  origin: ActionOrigin;
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

/** 同步入站钩子：同步执行，与写行处于同一事务；抛错会回滚并由宿主记录死信。 */
export interface SyncIncomingContext {
  db: DomainSetupApi["db"];
  row: SyncRow;
  local: SyncRow | null;
}

export interface DomainSyncTable {
  normalizeIncoming?(context: SyncIncomingContext): SyncRow;
  afterApply?(context: SyncIncomingContext): void;
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

/** 跨域搜索：一条命中。宿主只做聚合与排序，不跨域读表。 */
export interface SearchHit {
  id: string;
  title: string;
  snippet?: string;
  /** 外部链接；有则客户端可直接打开 */
  url?: string;
  /** 命中时间（毫秒），用于同分排序 */
  at?: number;
  /** 打开命中时优先进入的视图 id */
  view?: string;
  [key: string]: unknown;
}

/** 跨域搜索提供者：插件在 setup 注册，宿主并行调用。 */
export interface SearchProvider {
  domainId: string;
  search(q: string, opts: { limit: number }): SearchHit[] | Promise<SearchHit[]>;
}

export interface SearchQueryResult {
  q: string;
  items: (SearchHit & { domainId: string; score: number })[];
  domains: string[];
  partial: boolean;
  failed: string[];
  tookMs: number;
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
  /** 以固定 plugin origin 调用其它域的 action；不能指定 origin，避免伪装 ui。 */
  call(action: string, args?: Record<string, unknown>): Promise<{ result: unknown; text: string; domainId: string }>;
  /** 订阅宿主事件；返回取消函数。 */
  on(event: string, listener: (data: unknown) => void): () => void;
  /** 注册一个外部 HTTP hook，路径为 /workbench/hooks/<domain>/<name>。 */
  registerHook(name: string, handler: DomainHookHandler): void;
  /** 注册跨域搜索提供者；不注册就不参与聚合。返回注销函数。 */
  registerSearchProvider(provider: SearchProvider): () => void;
  /** 同 action；保留旧称便于迁移 */
  tool(name: string, def: DomainActionDef): void;
  /** 向本业务域的 SSE 订阅者广播 */
  emit(event: string, data?: unknown): void;
  log(...args: unknown[]): void;
}

/** 一条记录类型声明：告诉 agent 这个业务域“记录什么、什么时候记、怎么记”。 */
export interface DomainRecordCapability {
  /** 记录类型，与业务域实体一致，如 task / site / tag */
  kind: string;
  /** 给 agent 看的中文名，如“任务” */
  title: string;
  /** 一句话说明这个类型是什么 */
  description: string;
  /** 应该记录的时机；一条一句，便于 agent 判断 */
  when: string[];
  /** 不应该记录的时机；用于抑制误记 */
  notFor?: string[];
  /** 首选写入 action，必须是本域已注册的 action，如 tasks.create */
  primaryAction: string;
  /** 该 action 的关键参数名，按推荐填写顺序 */
  keyArgs?: string[];
  /** 幂等/去重说明；没有内置去重时明确写出如何查重 */
  dedupe?: string;
  /** 与其它记录类型的关系 */
  relations?: DomainRecordRelation[];
  /** 可直接套用的调用示例 */
  examples?: DomainRecordExample[];
}

/** 记录类型之间的关系（如 task 通过 tagIds 关联 tag）。 */
export interface DomainRecordRelation {
  kind: string;
  via: string;
  description: string;
}

/** 可直接套用的调用示例；action 固定为对应记录的 primaryAction。 */
export interface DomainRecordExample {
  purpose?: string;
  args: Record<string, unknown>;
}

/** 业务域能力清单：插件向 DSH 声明自己负责记录什么。 */
export interface DomainTaskOwnership {
  /** 本域业务记录与开发工作项的职责边界，不包含任何环境特定表 id。 */
  boundary: string;
  /** 未配置时的确定性候选检索词；不是自动路由规则。 */
  query: string;
}

export interface DomainCapability {
  /** 宿主通过 capabilities.setTaskTarget 显式配置开发工作项归属，读取时校验实际表。 */
  taskOwnership?: DomainTaskOwnership;
  /** 一句话说明这个域负责记录什么 */
  summary: string;
  /** 该域可记录的对象类型 */
  records: DomainRecordCapability[];
  /** 整个域不适合做什么 */
  notFor?: string[];
  /** 其它需要 agent 知道的约束（日期格式、状态码、依赖等） */
  notes?: string[];
}

/** 外部 hook 请求；body 已按上限读入内存。 */
export interface DomainHookRequest {
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string | string[] | undefined>;
  remoteAddress?: string;
  body: Uint8Array;
}

export interface DomainHookResponse {
  status?: number;
  headers?: Record<string, string>;
  /** 对象按 JSON 返回；字符串原样返回；Buffer/Uint8Array 作为二进制。 */
  body?: unknown;
}

export type DomainHookHandler = (req: DomainHookRequest) => DomainHookResponse | Promise<DomainHookResponse>;

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
  /** 能力清单：声明本域记录什么、首选 action；缺省时宿主回退到 description + action 列表 */
  capability?: DomainCapability;
  /** 业务插件自己的建表/注册逻辑；宿主调用并保存返回值作为清理函数 */
  setup?(api: DomainSetupApi): void | (() => void) | Promise<void | (() => void)>;
  /** 导出本插件的业务数据；返回可 JSON 序列化的对象，由宿主写入压缩包。 */
  exportData?(ctx: DomainDataContext): unknown | Promise<unknown>;
  /** 导入排序依赖：备份清单中存在的这些域须先尝试导入；不要求安装，也不保证其导入成功。循环依赖在任何写入前拒绝。 */
  backupAfter?: string[];
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
  /** 以固定 plugin origin 执行一个 <namespace>.<action>；不接收 origin 参数。 */
  call(action: string, args?: Record<string, unknown>): Promise<{ result: unknown; text: string; domainId: string }>;
  /** 兼容旧名；同样固定 plugin origin，忽略调用方传入的 origin。 */
  invoke(
    action: string,
    args: Record<string, unknown>,
    origin?: ActionOrigin,
  ): Promise<{ result: unknown; text: string; domainId: string }>;
  /** 订阅宿主事件；返回取消函数。 */
  on(event: string, listener: (data: unknown) => void): () => void;
  /** 注册跨域搜索提供者；不注册就不参与聚合。返回注销函数。 */
  registerSearchProvider(provider: SearchProvider): () => void;
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
    /** 可选函数组件；宿主传 size=14、strokeWidth=2、aria-hidden=true。非函数忽略；lucide forwardRef 请包函数。 */
    icon?: any;
  }[];
}
