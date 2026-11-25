/**
 * dsh-workbench：个人工作台 DSH 宿主插件。
 *
 * 只负责平台能力：本地 SQLite、账号/同步、HTTP 桥、SSE、Workbench 工具、
 * 业务域注册中心。任务/标签/站点是独立的 DSH 插件，通过 ctx.workbench
 * 注册自己的 action 与视图，宿主不 import 它们。
 *
 * 契约要点（已验证）：named export name/inject/apply；绝不 default export
 * （cordis-plugin-loader unwrapExports 优先取 exports.default，裸函数会丢具名 inject）。
 */
import { homedir } from "node:os";
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { openDb, setSyncStateText } from "@wb/core";
import { parseDomainRoles } from "@wb/sdk";
import { createSessionRoles } from "./session/roles.js";
import type {
  DomainActionDef,
  DomainDef,
  DomainPublicInfo,
  DomainSetupApi,
  SearchProvider,
  WorkbenchHost,
} from "@wb/sdk";
import {
  SyncClock,
} from "./sync/sync.js";
import { AuditLog } from "./infra/audit.js";
import {
  type BackupDomain,
} from "./infra/backup.js";

import type { WbState, RegisteredDomain } from "./types/host-types.js";
import { createActions } from "./actions/actions.js";
import { createAutomation, registerAutomationActions } from "./infra/automation/index.js";
import { createEventQueue } from "./infra/event-queue.js";
import { createAgentRun } from "./actions/agent-run.js";
import { installNetwork } from "./infra/network.js";
import { clearDatabase, clearHostFiles } from "./infra/data-clear.js";
import { createSearch } from "./infra/search.js";
import { FALLBACK_CATEGORY_ID, resolveCategory } from "./infra/categories.js";
import {
  applyCloudConfigPatch,
  cloudConfigFingerprint,
  cloudUrlForConfig,
  credsForConfig,
  loadCloudConfig,
  publicCloudConfig,
  resetCloudSync,
  saveCloudConfig,
  type CloudConfig,
} from "./infra/cloud-config.js";

export const name = "dsh-workbench";
export const inject = ["webServer", "tools", "connection"];

/** 本地库与云端配置路径（05 文档约定目录）。 */
const WB_HOME = process.env.WB_HOME ?? join(homedir(), ".dsh", "workbench");
const CLOUD_DEFAULT = process.env.WB_CLOUD_URL ?? "http://127.0.0.1:8791";

/**
 * 宿主 API 版本：业务插件用它做兼容判断，也是界面与备份 manifest 里显示的版本。
 * 必须与 packages/shell/package.json 的 version 一致（test:ownership-host 会拦）。
 */
export const SHELL_VERSION = "0.17.6";

const DOMAIN_ID_RE = /^[a-z][a-z0-9_-]{2,63}$/;
const ACTION_RE = /^[a-z][a-z0-9_-]*(?:\.[a-z][a-z0-9_-]*)+$/i;


function loadCreds(): WbState["creds"] {
  try {
    const creds = JSON.parse(readFileSync(join(WB_HOME, "cloud-creds.json"), "utf8"));
    if (![creds?.accessToken, creds?.userId, creds?.deviceId].every(v => typeof v === "string" && v.trim())) return null;
    return creds;
  } catch {
    return null;
  }
}

function saveCreds(creds: WbState["creds"] | null): void {
  mkdirSync(WB_HOME, { recursive: true });
  if (creds) {
    writeFileSync(join(WB_HOME, "cloud-creds.json"), JSON.stringify(creds), { mode: 0o600 });
  } else if (existsSync(join(WB_HOME, "cloud-creds.json"))) {
    rmSync(join(WB_HOME, "cloud-creds.json"));
  }
}

/** SSE 订阅者集合（UI 实时刷新）。 */
type Subscriber = (event: string, data: unknown) => void;

export function apply(ctx: any): void {
  // 云端类型先于同步：私人云端用配置里的密钥合成凭据，共享云端沿用登录令牌。
  const sharedCreds = loadCreds();
  const initialConfig = loadCloudConfig(WB_HOME, CLOUD_DEFAULT, sharedCreds);
  const state: WbState = {
    db: openDb(join(WB_HOME, "workbench.db"), SHELL_VERSION),
    creds: credsForConfig(initialConfig, sharedCreds),
    cloudUrl: cloudUrlForConfig(initialConfig),
    cloudConfig: initialConfig,
  };
  const subscribers = new Set<Subscriber>();
  const domains = new Map<string, RegisteredDomain>();
  const clock = new SyncClock();

  const eventListeners = new Map<string, Set<(data: unknown) => void>>();
  const emit = (event: string, data: unknown) => {
    for (const s of subscribers) {
      try {
        s(event, data);
      } catch {
        /* 单个订阅者断开不影响其他订阅者 */
      }
    }
    for (const key of [event, "*"]) {
      const set = eventListeners.get(key);
      if (!set) continue;
      for (const listener of set) {
        try {
          listener(data);
        } catch {
          /* 单个插件监听器出错不影响其它监听器 */
        }
      }
    }
  };
  const sessionRoles = createSessionRoles(state.db, domains, emit);
  ctx.on?.("agent/inbox/claimed", sessionRoles.claim);
  ctx.on?.("agent/inbox/discarded", sessionRoles.discard);
  const log = (...args: unknown[]) => console.warn("[dsh-workbench]", ...args);

  // ── 跨域搜索：插件注册 provider，宿主只聚合，不读业务表 ──
  const searchProviders = new Map<string, SearchProvider>();
  function registerSearchProvider(provider: SearchProvider): () => void {
    const id = String(provider?.domainId || "");
    if (!id || typeof provider.search !== "function") {
      log("registerSearchProvider 参数不合法", provider);
      return () => {};
    }
    searchProviders.set(id, provider);
    return () => {
      if (searchProviders.get(id) === provider) searchProviders.delete(id);
    };
  }
  const search = createSearch(searchProviders, (...args: unknown[]) => log(...args));
  // 审计日志：本机行为账本；表初始化与过期清理失败都不应影响宿主启动。
  const audit = new AuditLog(state.db, () => clock.now());
  try {
    audit.ensureSchema();
    audit.prune();
  } catch (e) {
    log("审计日志初始化失败", e);
  }

  function publicInfo(rec: RegisteredDomain): DomainPublicInfo {
    return {
      id: rec.def.id,
      title: rec.def.title,
      category: rec.category,
      description: rec.def.description,
      version: rec.def.version,
      enabled: rec.error === null,
      error: rec.error,
      // tables 保持「表名数组」这个老口径；声明对象形式统一在 tableDefs 里给出。
      tables: (rec.def.tables ?? []).map((t: any) => (typeof t === "string" ? t : t?.name)).filter(Boolean),
      tableDefs: (rec.def.tables ?? [])
        .map((t: any) => (typeof t === "string" ? { name: t } : t))
        .filter((t: any) => t && t.name),
      views: rec.def.views ?? [],
      slots: rec.def.slots ?? [],
      slotHosts: rec.def.slotHosts ?? [],
      sync: {
        tables:
          rec.def.sync?.tables?.map((t) => ({ name: t.name, mode: t.mode })) ??
          (rec.def.tables ?? []).map((t: any) => ({ name: typeof t === "string" ? t : String(t?.name ?? ""), mode: "row" as const })).filter((t: any) => t.name),
      },
      backup: {
        export: typeof rec.def.exportData === "function",
        import: typeof rec.def.importData === "function",
      },
    };
  }

  // host.agentRun 要用 DSH 的会话服务，但服务是在后面 installService 才拿到的：
  // 这里先给一个可写的持有者，action 定义通过闭包读它，拿到服务前后都能工作。
  const sessionScope: { value: any } = { value: null };
  const agentRun = createAgentRun({ getSessionController: () => sessionScope.value });

  // 队列实例要在 createActions 之后才建（分发要用固定 plugin 来源的 invoke）：
  // 先给 action 层一个可写持有者，「事件队列」页读授权清单与重投都从这里取。
  const queueRef: { value: any } = { value: null };

  // ── 自动化（宿主内置）──
  // 引擎与 19 个 automation.* action 都归宿主：action 挂 wb-shell 元 action 表，
  // 页面在宿主客户端（client/automation-page.cjs）。旧的 wb-addon-automation 插件
  // 若仍安装，下面 startAutomation 会做双跑防护，只让其中一份引擎运行。
  const invokeRef: { value: any } = {
    value: async () => {
      throw new Error("自动化引擎在 action 分发就绪前被调用");
    },
  };
  const getSchedule = () => {
    try {
      const svc = typeof ctx.get === "function" ? ctx.get("schedule", false) : null;
      return svc && typeof svc.create === "function" ? svc : null;
    } catch {
      return null;
    }
  };
  const automation = createAutomation({
    db: state.db,
    invoke: (name: string, args?: Record<string, unknown>) => invokeRef.value(name, args ?? {}, "plugin"),
    log,
    getSchedule,
    now: () => clock.now(),
    // 内置规则的调度状态依赖「域是否仍安装」；卸载后立刻停跑。
    hasDomain: (id: string) => domains.has(id),
    // 内置规则豁免白名单，调用另留一条可读日志（正式审计由 invoke 统一记）。
    audit: (entry: { action: string; domain: string; ok: boolean; error?: string }) =>
      log("[automation]", entry.domain, entry.action, entry.ok ? "ok" : "failed", entry.error || ""),
  });
  /** automation.* 的 DomainActionDef：先收集，再随 createActions 一起进 META_ACTIONS。 */
  const automationDefs = new Map<string, DomainActionDef>();
  registerAutomationActions(
    {
      action: (actionName: string, def: DomainActionDef) => automationDefs.set(actionName, def),
      call: (actionName: string, args?: Record<string, unknown>) => invokeRef.value(actionName, args ?? {}, "plugin"),
      db: state.db,
      shellVersion: SHELL_VERSION,
    },
    automation,
  );

  const { invoke, actionNames, installTool, schemaSnapshot } = createActions({
    domains,
    SHELL_VERSION,
    publicInfo,
    audit,
    clock,
    emit,
    db: state.db,
    search,
    sessionRoles,
    extraMetaActions: [["host.agentRun", agentRun], ...automationDefs.entries()],
    builtinAutomations: (domainId: string) => automation.builtinCount(domainId),
    // 插件更新要读 DSH 的 pluginManager 服务，只能从插件上下文里取；这里只传取值回调。
    pluginCtx: () => ctx,
    queueRef,
  });

  invokeRef.value = invoke;

  // 宿主事件队列：push 写库即返回，订阅方的消费 action 由后台 drain 异步分发。
  // 必须在 createActions 之后建，因为分发要用它固定 plugin 来源的 invoke。
  const eventQueue = createEventQueue({
    db: state.db,
    invoke,
    log,
    // 定向投递只按「已安装的域 + 它的 onEvent 入口」投，未安装的直接跳过（不落死信）。
    hasDomain: (id: string) => domains.has(id),
    resolveOnEvent: (id: string) => {
      const rec = domains.get(id);
      if (!rec) return null;
      const hit = [...rec.actions.keys()].find((name) => name.endsWith(".onEvent"));
      return hit ? { domain: id, action: hit } : null;
    },
  });
  queueRef.value = eventQueue;
  const hostEvents = {
    push: (type: string, payload?: unknown, options?: { targets?: string[] }) =>
      eventQueue.push(type, payload, "host", undefined, options),
    stats: () => eventQueue.stats(),
  };

  function registerAction(rec: RegisteredDomain, action: string, def: DomainActionDef): void {
    if (!ACTION_RE.test(action)) {
      throw new Error("非法 action 名（应形如 tasks.list）：" + action);
    }
    rec.actions.set(action, def);
  }

  function registerDomain(def: DomainDef): () => void {
    if (!def || !DOMAIN_ID_RE.test(String(def.id || ""))) {
      log("registerDomain 非法 id", def && def.id);
      return () => {};
    }
    if (domains.has(def.id)) {
      log("业务域已注册，忽略重复注册", def.id);
      return () => {};
    }
    // 栏目只做归组：未声明 / 空串 / 未知 id 落兜底栏目并打一条日志，不阻断注册。
    const category = resolveCategory(def.category);
    if (category.status === "missing") {
      log("业务域未声明首页栏目，已归入兜底栏目", def.id, FALLBACK_CATEGORY_ID);
    } else if (category.status === "unknown") {
      log("业务域声明了未知栏目 id，已归入兜底栏目", def.id, category.declared, "→", FALLBACK_CATEGORY_ID);
    }
    def = { ...def, roles: parseDomainRoles(def.id, def.roles) };
    const rec: RegisteredDomain = { def, category: category.id, actions: new Map(), hooks: new Map(), error: null, dispose: null };
    domains.set(def.id, rec);
    // 声明即登记：定向类型从这里能被认出（订阅拒绝、观测面回传 mode/targets 都要用）。
    eventQueue.declare(def.id, def.events?.publishes);
    // 声明即授权：内置自动化规则在这里落成可调度规则。校验失败的声明整条拒绝且不落库，
    // 域本身继续注册——坏规则不该让整个插件不可用。
    if (Array.isArray(def.automations) && def.automations.length) {
      try {
        automation.registerBuiltin({
          domainId: def.id,
          domainVersion: def.version,
          decls: def.automations,
          subscriptions: def.events?.subscriptions,
        });
      } catch (e) {
        log("内置自动化规则注册失败（该域声明的规则未生效）：", def.id, (e && (e as Error).message) || e);
      }
    }

    const setupApi: DomainSetupApi = {
      addon: { id: def.id, version: def.version, dir: "" },
      db: state.db,
      shellVersion: SHELL_VERSION,
      hasDomain: (id: string) => domains.has(id),
      hasAddon: (id: string) => domains.has(id),
      action: (name: string, actionDef: DomainActionDef) => registerAction(rec, name, actionDef),
      tool: (name: string, actionDef: DomainActionDef) => registerAction(rec, name, actionDef),
      call: (action: string, args?: Record<string, unknown>) =>
        invoke(action, args ?? {}, "plugin"),
      on: (event: string, listener: (data: unknown) => void) => {
        const key = String(event || "*");
        let set = eventListeners.get(key);
        if (!set) {
          set = new Set();
          eventListeners.set(key, set);
        }
        set.add(listener);
        return () => {
          set!.delete(listener);
        };
      },
      registerHook: (name: string, handler) => {
        if (!/^[a-z][a-z0-9_-]{1,40}$/.test(String(name || ""))) {
          throw new Error("非法 hook 名（小写字母开头，允许数字/_/-）：" + name);
        }
        rec.hooks.set(String(name), handler);
      },
      registerSearchProvider,
      emit: (event: string, data?: unknown) => emit("domain-event", { domainId: def.id, event, data: data ?? null }),
      events: {
        // 发布与订阅都以 DomainDef.events 的声明为授权清单：没声明直接报错。
        push: (type: string, payload?: unknown, options?: { targets?: string[] }) =>
          eventQueue.push(type, payload, def.id, def.events?.publishes, options),
        // 订阅不用指定 action：宿主统一投到本域唯一的 `<前缀>.onEvent`，插件按事件的
        // type 自己分派。前缀不等同于 domain id（wb-addon-message → message.onEvent），
        // 所以从本域 action 表里找出那个 onEvent。
        subscribe: (type: string) => {
          const hit = [...rec.actions.entries()].find(([name]) => name.endsWith(".onEvent"));
          return eventQueue.subscribe(
            def.id,
            type,
            def.events?.subscriptions,
            hit ? hit[1] : null,
            hit ? hit[0] : undefined,
          );
        },
        stats: () => eventQueue.stats(),
      },
      now: () => clock.now(),
      markSyncDirty: (table?: string) => {
        if (table) setSyncStateText(state.db, "dirty:" + def.id + ":" + table, String(clock.now()));
      },
      log: (...args: unknown[]) => log("[" + def.id + "]", ...args),
    };

    try {
      const result = def.setup?.(setupApi);
      if (result && typeof (result as Promise<unknown>).then === "function") {
        void (result as Promise<void | (() => void)>)
          .then((dispose) => {
            if (typeof dispose === "function") rec.dispose = dispose;
            emit("domains-changed", listDomains());
          })
          .catch((e) => {
            rec.error = String((e && (e as Error).message) || e);
            log("业务域异步初始化失败", def.id, e);
            emit("domains-changed", listDomains());
          });
      } else if (typeof result === "function") {
        rec.dispose = result;
      }
    } catch (e) {
      rec.error = String((e && (e as Error).message) || e);
      log("业务域初始化失败", def.id, e);
    }

    emit("domains-changed", listDomains());
    return () => {
      const live = domains.get(def.id);
      if (live !== rec) return;
      try {
        rec.dispose?.();
      } catch (e) {
        log("业务域清理失败", def.id, e);
      }
      // 内置规则随域卸载停调度（行保留，重装后同 key 幂等接回）。
      automation.unregisterBuiltin(def.id);
      domains.delete(def.id);
      emit("domains-changed", listDomains());
    };
  }

  function listDomains(): DomainPublicInfo[] {
    return [...domains.values()].map(publicInfo);
  }

  function backupDomains(): BackupDomain[] {
    const out: BackupDomain[] = [...domains.values()].map((rec) => ({
      def: rec.def,
      enabled: rec.error === null,
      error: rec.error,
    }));
    // 自动化内化后不再有独立域，但规则要跟着备份走：补一个宿主内置的导出模块。
    // 模块 id 用 wb-shell（与宿主元 action 域名一致）；旧备份里的 wb-addon-automation
    // 模块在导入侧按别名映射到这里，规则不会丢。
    out.push({
      def: automationBackupDomain(),
      enabled: true,
      error: null,
    });
    return out;
  }

  /** 宿主内置「自动化」备份模块：只导出规则，运行记录留在本机。 */
  function automationBackupDomain(): DomainDef {
    return {
      id: "wb-shell",
      title: "自动化（宿主内置）",
      description: "定时、域事件或手动触发白名单 action；规则随备份迁移，运行记录只在本机",
      version: SHELL_VERSION,
      category: "auto",
      tables: ["host_automation_rule", "host_automation_run", "host_automation_meta"],
      sync: { tables: [] },
      exportData: () => automation.exportData(),
      importData: (payload: string | Record<string, unknown>) => automation.importData(payload),
    } as unknown as DomainDef;
  }


  const host: WorkbenchHost = {
    db: state.db,
    shellVersion: SHELL_VERSION,
    registerDomain,
    bindMessageRole: sessionRoles.bindMessageRole,
    hasDomain: (id: string) => domains.has(id),
    listDomains,
    call: (action: string, args?: Record<string, unknown>) => invoke(action, args ?? {}, "plugin"),
    invoke: (action: string, args: Record<string, unknown>, _origin?: unknown) =>
      invoke(action, args ?? {}, "plugin"),
    on: (event: string, listener: (data: unknown) => void) => {
      const key = String(event || "*");
      let set = eventListeners.get(key);
      if (!set) {
        set = new Set();
        eventListeners.set(key, set);
      }
      set.add(listener);
      return () => {
        set!.delete(listener);
      };
    },
    registerSearchProvider,
    actionNames,
    emit,
    events: hostEvents,
    log,
  };
  ctx.provide?.("workbench", host);
  eventQueue.start();
  ctx.effect?.(
    () => () => eventQueue.stop(),
    "wb-event-queue",
  );

  // 自动化的域事件触发：监听宿主统一 domain-event（{domainId,event,data}），
  // 与插件版 api.on("domain-event") 等价；监听器出错不影响其它监听器。
  {
    const key = "domain-event";
    let set = eventListeners.get(key);
    if (!set) {
      set = new Set();
      eventListeners.set(key, set);
    }
    set.add((data: unknown) => {
      try {
        automation.onEvent(data);
      } catch (e) {
        log("自动化事件触发失败", e);
      }
    });
  }

  // 引擎启动 + 共存检查：业务插件是在宿主 apply 之后才注册域的，所以延迟一拍再确认
  // 旧插件是否仍安装。两套自动化现在各用各的 action 名（host.automation.* 对 automation.*）
  // 与各自的表（host_automation_* 对 automation_*），可以同时运行，不再互相停引擎。
  automation.start();
  ctx.effect?.(
    () => () => automation.stop(),
    "wb-automation",
  );
  {
    const timer = setTimeout(() => {
      if (domains.has("wb-addon-automation")) {
        log(
          "检测到同时安装了自动化插件（wb-addon-automation 域）：两套自动化共存，" +
            "插件规则由插件引擎执行、宿主规则由宿主引擎执行，各自只读写自己的表",
        );
        return;
      }
      log("automation 已内化为宿主能力", SHELL_VERSION);
    }, 4000);
    if (typeof timer.unref === "function") timer.unref();
  }

  // ── 会话角色：按当前轮次组装系统提示 ──
  const trackOn = (scope: any, dispose: unknown) => {
    if (typeof dispose === "function" && typeof scope.effect === "function") scope.effect(() => dispose);
  };
  const installService = (deps: string[], fn: (scope: any) => void) => {
    if (typeof ctx.inject === "function") {
      try {
        ctx.inject(deps, fn);
        return;
      } catch (e) {
        log("注入服务失败", deps.join(","), e);
      }
    }
    try {
      fn(ctx);
    } catch (e) {
      log("安装会话服务失败", deps.join(","), e);
    }
  };

  // 「新建 agent 会话」用的会话控制器：宿主没加载时为 null，action 调用会给明确报错。
  installService(["sessionController"], (scope) => {
    const controller = scope.sessionController;
    sessionScope.value = controller && typeof controller.create === "function" ? controller : null;
  });

  installService(["systemPrompt"], (scope) => {
    const sp = scope.systemPrompt;
    if (!sp || typeof sp.section !== "function") return;
    let order = 510;
    try {
      order = sp.getSectionOrder("PLAN_POLICY") + 10;
    } catch {
      /* 老版本没有命名 order 时退回 510 */
    }
    const dispose = sp.section({
      name: "workbench:session-role",
      order,
      text: (context: any) => {
        return sessionRoles.prompt(context?.agent);
      },
    });
    trackOn(scope, dispose);
  });

  // 切换云端后要立刻首轮同步，但 runSync 由 installNetwork 返回，用占位函数打破循环引用。
  let runSyncHolder: (() => Promise<unknown>) | null = null;
  /** 应用界面提交的云端配置：保存、重建凭据、目标变化时清空同步进度。 */
  function applyCloudConfig(body: any): Record<string, unknown> {
    const next: CloudConfig = applyCloudConfigPatch(state.cloudConfig, body);
    const changed = cloudConfigFingerprint(next) !== cloudConfigFingerprint(state.cloudConfig);
    saveCloudConfig(WB_HOME, next);
    state.cloudConfig = next;
    state.cloudUrl = cloudUrlForConfig(next);
    state.creds = credsForConfig(next, loadCreds());
    if (changed) {
      try {
        resetCloudSync(state.db);
      } catch (e) {
        log("清空同步进度失败", e);
      }
    }
    emit("account-changed", { logged_in: Boolean(state.creds), mode: next.mode });
    if (changed && state.creds && runSyncHolder) {
      void runSyncHolder().catch((e) => log("切换云端后首轮同步失败", e));
    }
    return publicCloudConfig(next);
  }

  /**
   * 清空本机数据：业务表、插件配置、同步游标与云端连接全部重置到初始状态。
   * 只删行不删表，业务域持有的是同一个 DatabaseSync 句柄，清空后仍可继续写入；
   * 云端连接文件删除后回到默认「仅本机」，后台同步循环因 creds 为空自动停摆。
   */
  function clearAllData(): Record<string, unknown> {
    const result = clearDatabase(state.db);
    const files = clearHostFiles(WB_HOME);
    const next = loadCloudConfig(WB_HOME, CLOUD_DEFAULT, null);
    state.cloudConfig = next;
    state.cloudUrl = cloudUrlForConfig(next);
    state.creds = null;
    emit("account-changed", { logged_in: false, mode: next.mode });
    emit("domains-changed", listDomains());
    emit("data-cleared", { tables: result.tables, rows: result.rows });
    log("已清空本机数据", result.tables + " 张表 / " + result.rows + " 行", files.join(",") || "无状态文件");
    return { ...result, files, cloud: publicCloudConfig(next) };
  }

  const { runSync } = installNetwork({ ctx, state, saveCreds, clock, domains, emit, subscribers, listDomains, SHELL_VERSION, sessionRoles, audit, backupDomains, actionNames, invoke, log, schemaSnapshot, applyCloudConfig, publicCloudConfig, clearAllData });
  runSyncHolder = runSync;
  installTool(ctx);

  // ── 后台同步循环：30s 周期；登录后立即一轮；离线静默 ──
  let timer: ReturnType<typeof setInterval> | undefined;
  const startLoop = () => {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      if (!state.creds) return;
      void runSync().catch((e) => log("后台同步失败", String((e && (e as Error).message) || e)));
    }, 30_000);
  };
  startLoop();
  ctx.effect?.(
    () => () => {
      if (timer) clearInterval(timer);
      for (const rec of domains.values()) {
        try {
          rec.dispose?.();
        } catch {
          /* ignore */
        }
      }
      domains.clear();
    },
    "wb-sync-loop",
  );
}
