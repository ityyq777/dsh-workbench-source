/**
 * @wb/sdk：子插件（addon）开发契约。
 *
 * addon 是「数据 + 视图 + 工具」三件套：
 *  - package.json 的 `wb.addon` 声明贡献点（manifest）；
 *  - `main` 模块导出 migrations（SQL）与 setup(api)，向宿主注册 action；
 *  - 可选 `client` 浏览器模块，通过 window.__WB_HOST__ 注册视图。
 *
 * 宿主只依赖 manifest 与稳定的 API，不 import addon 的源码。
 */

export interface AddonViewTitle {
  zh: string;
  en?: string;
}

/** `views: ["tasks"]` 简写，或带标题/排序的完整声明。 */
export type AddonViewDecl = string | { id: string; title?: string | AddonViewTitle };

export interface AddonManifest {
  id: string;
  title: string;
  description?: string;
  author?: string;
  version: string;
  minShell: string;
  /** 声明贡献的同步表（用于校验；实际同步白名单由 core 决定） */
  tables: string[];
  /** UI 视图贡献点：客户端模块注册同名 view 后出现在工作台 tab */
  views?: AddonViewDecl[];
  /** 供 Workbench tool 调用的 action 名（全局唯一，建议 <namespace>.<action>） */
  toolActions?: string[];
  /** 客户端模块相对 package 根的路径，如 "lib/client.js"；缺省探测 client.js */
  client?: string;
}

/** action 执行上下文：宿主注入来源与事件通道。 */
export interface AddonActionContext {
  /** ui/agent 本地写入需要进 change log；sync 回写不进 */
  origin: "ui" | "agent" | "sync";
  /** 广播到本 addon 的所有订阅者（SSE -> 浏览器） */
  emit(event: string, data?: unknown): void;
}

export interface AddonActionDef<I = Record<string, unknown>, O = unknown> {
  description?: string;
  /** JSON Schema（给 Workbench tool / 文档用） */
  input?: Record<string, unknown>;
  execute(args: I, ctx: AddonActionContext): O | Promise<O>;
  /** 给 agent 看的文本渲染；缺省 JSON.stringify */
  render?(result: O): string;
}

export interface AddonHostApi {
  readonly addon: { id: string; version: string; dir: string };
  /** 宿主打开的 SQLite（node:sqlite DatabaseSync），事务由 addon 自己组织 */
  readonly db: any;
  readonly shellVersion: string;
  /** 某个子插件是否已安装且启用（用于跨子插件能力探测） */
  hasAddon(id: string): boolean;
  /** 注册一个 action（同名再注册会覆盖，热重载友好） */
  action(name: string, def: AddonActionDef): void;
  /** 同 action；保留旧称便于迁移 */
  tool(name: string, def: AddonActionDef): void;
  /** 向本 addon 的 SSE 订阅者广播 */
  emit(event: string, data?: unknown): void;
  log(...args: unknown[]): void;
}

/** addon 的 Node 侧入口模块形状。 */
export interface AddonModule {
  /** 建表/迁移 SQL，按顺序执行；必须幂等 */
  migrations?: string[];
  setup(api: AddonHostApi): void | Promise<void>;
  dispose?(): void | Promise<void>;
}

/** 浏览器侧宿主桥（壳注入到 window.__WB_HOST__）。 */
export interface WbHostBridge {
  react: any;
  jsx: any;
  h: any;
  registerAddon(mod: AddonClientModule): void;
}

/** addon 客户端模块注册的视图。 */
export interface AddonClientModule {
  id: string;
  version?: string;
  views: {
    id: string;
    title: string | AddonViewTitle;
    component: any;
  }[];
}

/** defineAddon 原样返回，纯类型收窄辅助。 */
export function defineAddon(m: AddonManifest): AddonManifest {
  return m;
}
