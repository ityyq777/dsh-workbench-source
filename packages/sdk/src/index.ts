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

/** 全部来源，供默认值与界面多选使用。 */
export const ALL_ACTION_ORIGINS: readonly ActionOrigin[] = ["ui", "plugin", "agent", "sync"];

/** action 执行上下文：宿主注入来源与事件通道。 */
export interface DomainActionContext {
  /** ui/agent 本地写入需要进 change log；sync 回写不进；plugin 是插件后台 */
  origin: ActionOrigin;
  /** 广播到本业务域的所有订阅者（SSE -> 浏览器） */
  emit(event: string, data?: unknown): void;
}

/**
 * 一条已入队事件：宿主/插件 push 后由队列异步投递给订阅方的消费 action。
 * 消费 action 的入参就是这个形状（另加 deliveryId 便于幂等处理）。
 */
export interface DomainEvent {
  eventId: string;
  type: string;
  /** 推事件的来源：业务域 id，宿主自己推的是 "host" */
  source: string;
  payload: unknown;
  createdAt: number;
}

/** 消费 action 的实际入参：事件本身 + 本次投递 id。 */
export interface DomainEventDeliveryArgs extends DomainEvent {
  deliveryId: string;
}

/**
 * 事件总线：push 是「写库即返回」的主 push 模式，不等订阅方执行；
 * 订阅方必须提供一个 `origins: ["plugin"]` 的 action 来消费。
 */
export interface DomainEventBus {
  /** 推一条事件：同步落库后立刻返回，不等任何订阅方执行。 */
  push(type: string, payload?: unknown): { id: string; deliveries: number };
  /**
   * 订阅事件类型（"*" 表示全部）。action 必须是本域已注册的 action，
   * 且 `origins` 只能声明 ["plugin"]；否则立即抛错说明原因。
   */
  subscribe(type: string, action: string): () => void;
  /** 队列现状（事件/投递/订阅计数），给诊断与测试用。 */
  stats(): EventQueueStats;
}

/** 宿主侧队列句柄：宿主只负责 push，不给自己登记消费 action。 */
export interface HostEventPublisher {
  push(type: string, payload?: unknown): { id: string; deliveries: number };
  stats(): EventQueueStats;
}

export interface EventQueueStats {
  subscriptions: number;
  events: Record<string, number>;
  deliveries: Record<string, number>;
}

/**
 * 事件声明：插件在 DomainDef.events 里主动告诉宿主「我会发布 / 我会监听哪些事件」。
 * 这是授权清单而不是展示文案——没声明的类型推不出去、也订阅不上。
 */
export interface DomainEventDecl {
  /** 事件类型，如 mail.messages-synced */
  type: string;
  /** 一句话说明这条事件什么时候发、载荷大概长什么样 */
  description?: string;
}

/** 域事件的声明与运行对账（宿主「事件队列」页的插件一栏用）。 */
export interface DomainEventsInfo {
  domain: string;
  /** 声明发布的类型 + 实际发送统计 */
  publishes: {
    type: string;
    description?: string;
    sent: number;
    lastAt?: number;
    lastStatus?: string;
  }[];
  /** 声明监听的类型；registered=false 表示声明了但这次没真正 subscribe（例如条件不满足） */
  listens: {
    type: string;
    description?: string;
    registered: boolean;
    actions: string[];
  }[];
  /** 队列登记表里的真实订阅（含调用量与最近错误） */
  subscriptions: {
    type: string;
    action: string;
    createdAt: number;
    done: number;
    dead: number;
    pending: number;
    lastError?: string;
  }[];
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
  /**
   * action **本身支持**的调用来源（上界，多选）：ui / plugin / agent / sync。
   * 省略时为 ["ui", "plugin", "agent"]（sync 必须显式声明才会被允许）；
   * 写了就只放行列出的来源，越界调用得到 ACTION_ORIGIN_DENIED，界面也无法开启。
   * 常见写法：只给界面（安全约束）→ ["ui"]；支持 agent 但默认不给 → origins: ["ui", "agent"]
   * 配合 originsDefault: ["ui"]。
   * 界面可以在「Action 页」按 action 在上界内调整（落本机 meta，不进备份与云同步）。
   */
  origins?: ActionOrigin[];
  /**
   * **默认启用**的来源（必须 ⊆ origins）：省略时等于 origins（支持即默认开启）。
   * 用于「支持 agent 但默认不给 agent」这类策略：例如 origins: ["ui", "agent"]、
   * originsDefault: ["ui"]，用户可在界面把 agent 打开。
   */
  originsDefault?: ActionOrigin[];
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
  /**
   * 宿主事件队列：push 立即返回（不等任何订阅方），订阅方由宿主以 plugin 来源
   * 调用登记过的消费 action。订阅与 action 的注册顺序：先注册 action，再 subscribe。
   */
  readonly events: DomainEventBus;
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
  /**
   * 事件授权清单：`publishes` 里的类型才允许 api.events.push，
   * `subscriptions` 里的类型才允许 api.events.subscribe（"*" 也要显式声明）。
   * 宿主「事件队列」页按这份清单对账，未声明的推送与订阅直接报错。
   */
  events?: { publishes?: DomainEventDecl[]; subscriptions?: DomainEventDecl[] };
  /** 同步声明：mode=row 行级 LWW；mode=tree 必须实现 reconcile，整表覆盖 */
  sync?: DomainSyncDef;
  /** UI 视图贡献点：客户端模块注册同名 view 后出现在工作台首页 */
  views?: DomainViewDecl[];
  /**
   * 声明本插件会往哪些界面插槽贡献组件（宿主白名单内的 id，见 WbSlotCatalogEntry）。
   * 只用于能力清单说明缺口：声明了贡献但落点属主没装时，capabilities 会明确写出"无落点"。
   * 真正的渲染由客户端插槽注册表负责，这里不承载组件。
   */
  slots?: string[];
  /**
   * 声明本插件的界面**渲染**哪些插槽（即它会放 <Slot> 落点）。
   * 与 slots 合起来才能回答「谁贡献、谁提供落点」：贡献方声明了但没有任何已启用域提供落点，
   * capabilities 会明确写出"暂无落点，该贡献不会显示"。
   */
  slotHosts?: string[];
  /**
   * 首页栏目 id（宿主定义的枚举，见 /workbench/api/domains 返回的 categories）。
   * 未声明、空串或未知 id 一律落兜底栏目「其他」，宿主打一条日志，不影响注册。
   */
  category?: string;
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
  /**
   * 宿主事件队列（只推不收）：宿主自己产生的事件也走同一条队列，
   * 与业务插件 push 的事件共用持久化、重试与死信策略。push 立即返回。
   */
  readonly events: HostEventPublisher;
  /** action -> 所属 domain */
  actionNames(): { name: string; domainId: string; description?: string }[];
  emit(event: string, data?: unknown): void;
  log(...args: unknown[]): void;
}

/** 首页栏目定义：由宿主给出顺序与中英文名，插件只声明 id。 */
export interface DomainCategoryInfo {
  id: string;
  title: DomainViewTitle;
  /** 兜底栏目：未声明或未知栏目的插件都归入这里 */
  fallback: boolean;
}

export interface DomainPublicInfo {
  id: string;
  title: string;
  /** 宿主解析后的栏目 id；插件未声明或声明未知 id 时是兜底栏目 id */
  category: string;
  description?: string;
  version: string;
  enabled: boolean;
  error: string | null;
  tables: string[];
  views: DomainViewDecl[];
  /** 是否实现数据导出/导入，客户端据此启用备份选项 */
  backup: { export: boolean; import: boolean };
  /** 声明贡献的界面插槽 id（未声明为空数组） */
  slots: string[];
  /** 声明渲染的界面插槽 id（即它提供落点） */
  slotHosts: string[];
  /** 同步参与方式（给 UI/诊断用） */
  sync: { tables: { name: string; mode: SyncMode }[] };
}

/** 宿主声明的界面插槽 id；插件只能往这些槽贡献组件。 */
export type WbSlotId = "item.actions" | "view.toolbar" | "settings.sections" | "home.card.footer";

/** 插槽目录项：宿主给出 id、中英文名、说明与 props 契约。 */
export interface WbSlotCatalogEntry {
  id: WbSlotId | string;
  title: DomainViewTitle;
  description: string;
  /** 渲染时传给贡献组件的 props 形状说明（给人看） */
  props: Record<string, string>;
}

/**
 * 条目引用：item.actions 这类"针对单条对象"的插槽统一用它。
 * 定义在宿主而不是属主，是为了贡献方可移植——同一个按钮能挂到邮件、站点、连接器条目上。
 */
export interface WbItemRef {
  /** 带命名空间的对象类型，如 "mail.message" */
  kind: string;
  id: string;
  title?: string;
  subtitle?: string;
  url?: string;
  /** 属主自用字段；贡献方不得依赖，只可原样透传 */
  [key: string]: unknown;
}

/** 一条插槽贡献：插件向别的插件的界面挂一个组件。 */
export interface WbSlotContribution {
  slot: WbSlotId | string;
  /** 同一插槽内唯一；重复注册后到者被拒，不覆盖 */
  id: string;
  /** 升序；缺省 100。相同 order 按 id 字典序，保证与安装顺序无关 */
  order?: number;
  title?: string | DomainViewTitle;
  icon?: any;
  component: any;
  /** 单独调用 registerSlot 时的归属插件；写在 registerAddon.slots 里可省略 */
  addonId?: string;
}

/** 贡献组件收到的 props。 */
export interface WbSlotRenderProps {
  slot: string;
  ownerId: string | null;
  contributorId: string;
  lang: "zh" | "en";
  t(key: string): string;
  /** 贡献方自己域的 api（跨域写入仍走它自己的 action 与审计） */
  api: any;
  /** 跳到贡献方自己的视图 */
  onNavigate(viewId?: string, params?: Record<string, unknown>): boolean;
  /** item.actions 专用 */
  item?: WbItemRef;
  /** 其它插槽的载荷，按 WbSlotCatalogEntry.props 约定 */
  [key: string]: unknown;
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
  /** 跨插件跳转：跳到某个插件的某个视图，可带视图参数 */
  navigateAddon(addonId: string, viewId?: string, params?: Record<string, unknown>): boolean;
  /** 插槽落点组件：属主插件在自己界面里渲染它 */
  Slot: any;
  /** 宿主插槽目录（白名单） */
  readonly slots: WbSlotCatalogEntry[];
  /** 单独注册贡献；推荐用 registerAddon.slots（卸载插件时能按 addonId 撤销） */
  registerSlot(addonId: string, contrib: WbSlotContribution): boolean;
  registerSlot(contrib: WbSlotContribution): boolean;
  /** 诊断快照 */
  slotContributions(slotId: string): { slot: string; id: string; addonId: string; order: number; title: string | DomainViewTitle | null; ok: boolean; error: string | null }[];
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
  /** 往别的插件界面贡献的组件；声明在这里才能随插件卸载一起撤销。 */
  slots?: WbSlotContribution[];
}
