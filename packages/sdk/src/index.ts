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
}

/** 业务插件在 setup 期间拿到的宿主 API（兼容旧 addon 的 setup 形态）。 */
export interface DomainSetupApi {
  readonly addon: { id: string; version: string; dir: string };
  /** 宿主打开的 SQLite（node:sqlite DatabaseSync），事务由业务插件自己组织 */
  readonly db: any;
  readonly shellVersion: string;
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
  /** 声明贡献的同步表（宿主汇总后用于备份；建表仍由业务插件负责） */
  tables?: string[];
  /** UI 视图贡献点：客户端模块注册同名 view 后出现在工作台首页 */
  views?: DomainViewDecl[];
  /** 业务插件自己的建表/注册逻辑；宿主调用并保存返回值作为清理函数 */
  setup?(api: DomainSetupApi): void | (() => void) | Promise<void | (() => void)>;
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
