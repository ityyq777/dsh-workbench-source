/**
 * 宿主「插件」页的 action：按插件自己在 registerDomain 里声明的 npm 更新来源检查新版本，
 * 并在 DSH 暴露插件管理器时直接调用它完成升级。
 *
 * 为什么不在插件里自己改 profile：profile 的安装记录、pnpm 锁文件与重启时机都归 DSH 管，
 * 插件只声明「我发在哪个包的哪个源上」，安装动作交给 DSH 的 pluginManager（与插件市场同一套
 * 代码路径，含 bundle-in-use 一类保护）。取不到 pluginManager 时降级为：给出可复制的
 * `dsh plugin --profile <profile> add <包>@<版本>` 命令，并明确写「需要重启」。
 *
 * registry 白名单：只认官方 npm registry。声明了别的源就当「不支持自动更新」，不让插件
 * 把用户带去未声明的地方装东西。
 */

/** 官方 npm registry：唯一允许被自动安装的来源。 */
export const OFFICIAL_REGISTRY = "https://registry.npmjs.org";

/** 插件声明的更新来源（与 sdk 的 DomainUpdateSource 对齐，宿主侧不重复导出类型）。 */
export interface AddonUpdateSource {
  source: "npm";
  package: string;
  registry?: string;
  distTag?: string;
}

/** 一条插件记录：声明与安装现状。 */
export interface AddonRow {
  /** 业务域 id，例如 wb-addon-tasks */
  id: string;
  title: string;
  /** 插件自报版本（registerDomain 的 version） */
  version: string;
  /** DSH 里记的已安装版本；取不到时为 null */
  installed: string | null;
  /** 声明的更新来源；没声明或不被接受时为 null */
  update: AddonUpdateSource | null;
  /** 声明有问题时的原因（registry 非官方、缺包名等） */
  problem?: string;
  /** 该插件是否已装进当前 profile（DSH 的 managed 记录里有它） */
  managed: boolean;
}

export interface AddonContext {
  /** 已注册业务域：id -> { def } */
  domains: Map<string, any>;
  /** 取当前插件上下文（用来读 pluginManager 服务）；拿不到服务也允许返回 undefined */
  ctx?: () => any;
}

/** 归一化 registry：去掉尾部斜杠，小写主机名比较。 */
function normalizeRegistry(raw: unknown): string {
  const text = String(raw ?? "").trim();
  if (!text) return OFFICIAL_REGISTRY;
  return text.replace(/\/+$/, "");
}

/** 判断声明的 registry 是否被接受（只允许官方源）。 */
export function registryAllowed(registry: string): boolean {
  return normalizeRegistry(registry) === OFFICIAL_REGISTRY;
}

/**
 * 读取并校验一个插件声明的更新来源。
 * 返回 { update } 或 { problem }，两者互斥；没声明时返回 {}。
 */
export function readUpdateSource(raw: any): { update?: AddonUpdateSource; problem?: string } {
  if (!raw || typeof raw !== "object") return {};
  const source = String(raw.source ?? "").trim();
  const pkg = String(raw.package ?? "").trim();
  if (!source && !pkg) return {};
  if (source !== "npm") return { problem: "只支持 npm 源" };
  if (!pkg) return { problem: "缺少 package（npm 包名）" };
  if (!/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(pkg)) {
    return { problem: "package 不是合法的 npm 包名：" + pkg };
  }
  const registry = normalizeRegistry(raw.registry);
  if (!registryAllowed(registry)) return { problem: "registry 只允许官方源 " + OFFICIAL_REGISTRY + "，声明的是 " + registry };
  const distTag = String(raw.distTag ?? "").trim();
  if (distTag && !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(distTag)) return { problem: "distTag 不合法：" + distTag };
  return { update: { source: "npm", package: pkg, registry: OFFICIAL_REGISTRY, ...(distTag ? { distTag } : {}) } };
}

/**
 * 把插件管理器的问题码翻译成给人看的中文。管理器自己的 reason 是英文长句
 * （例如「installed neither from a registry nor from a Git commit」），直接显示在
 * 页面上等于没解释；中文口径只此一处，原始英文留在 detail 里当悬停提示。
 */
export function problemText(code?: string): string {
  switch (code) {
    case "not-updatable":
      return "本地安装（不是从 npm 装的），不能在这里自动升级";
    case "not-found":
      return "npm 上没有这个包";
    case "network":
      return "连不上 npm registry（网络问题），稍后再试";
    case "refused":
      return "插件管理器拒绝了这次请求";
    default:
      return "查询失败";
  }
}

/**
 * 版本比较：只处理常见的 semver 形态（x.y.z / 预发布尾巴），够判断「有没有更新」。
 * 返回 1 表示 a 比 b 新，-1 表示旧，0 表示相同。
 */
export function compareVersions(a: string, b: string): number {
  const parse = (raw: string) => {
    const text = String(raw ?? "").trim().replace(/^v/, "");
    const dash = text.indexOf("-");
    const core = dash < 0 ? text : text.slice(0, dash);
    const pre = dash < 0 ? "" : text.slice(dash + 1);
    const nums = core.split(".").map((part) => {
      const n = Number.parseInt(part, 10);
      return Number.isFinite(n) ? n : 0;
    });
    while (nums.length < 3) nums.push(0);
    return { nums, pre };
  };
  const left = parse(a);
  const right = parse(b);
  for (let i = 0; i < 3; i += 1) {
    if (left.nums[i] !== right.nums[i]) return left.nums[i] > right.nums[i] ? 1 : -1;
  }
  // 有预发布尾巴的版本比正式版旧（1.0.0-beta < 1.0.0）。
  if (left.pre === right.pre) return 0;
  if (!left.pre) return 1;
  if (!right.pre) return -1;
  return left.pre > right.pre ? 1 : -1;
}

/** 取插件管理器（DSH 的 pluginManager 服务）；没装或不提供就返回 null。 */
function managerOf(ctx: AddonContext): any {
  try {
    const scope = ctx.ctx?.();
    const manager = scope?.get?.("pluginManager");
    if (manager && typeof manager.listVersions === "function" && typeof manager.updateBundle === "function") return manager;
  } catch {
    /* 取不到服务就走降级路径 */
  }
  return null;
}

/** DSH 里这个包名对应的已安装版本；没有记录时返回 null。 */
async function installedOf(manager: any, pkg: string): Promise<string | null> {
  try {
    const bundles = (await manager.listBundles?.()) ?? [];
    const hit = bundles.find((item: any) => item?.name === pkg);
    return hit && hit.installed ? String(hit.version ?? "") || null : null;
  } catch {
    return null;
  }
}

/** 降级命令：用户自己在终端里跑。profile 名字取自 DSH 环境，取不到就用 desktop。 */
function manualCommand(profile: string, pkg: string, version?: string): string {
  const target = version ? `${pkg}@${version}` : pkg;
  return `dsh plugin --profile ${profile} add ${target}`;
}

/** 收集所有声明了更新来源的插件。 */
function rowsOf(ctx: AddonContext): AddonRow[] {
  const rows: AddonRow[] = [];
  for (const rec of ctx.domains.values()) {
    const def = rec?.def ?? {};
    if (!def.id) continue;
    const read = readUpdateSource(def.update);
    rows.push({
      id: String(def.id),
      title: String(def.title ?? def.id),
      version: String(def.version ?? ""),
      installed: null,
      update: read.update ?? null,
      ...(read.problem ? { problem: read.problem } : {}),
      managed: false,
    });
  }
  rows.sort((a, b) => a.id.localeCompare(b.id));
  return rows;
}

/**
 * 造宿主「插件」页的四个 action。deps 里的 ctx 是取服务用的回调，不是插件上下文本身，
 * 这样单测可以直接塞一个假 ctx 进来，不必起真 DSH。
 */
export function createHostAddonActions(ctx: AddonContext) {
  const profileName = () => {
    try {
      return String(ctx.ctx?.()?.profileContext?.name ?? process.env.DSH_PROFILE ?? "desktop");
    } catch {
      return process.env.DSH_PROFILE ?? "desktop";
    }
  };

  /** 把插件声明与 DSH 的安装记录合起来，得到一页的完整数据。 */
  async function snapshot() {
    const manager = managerOf(ctx);
    const rows = rowsOf(ctx);
    const profile = profileName();
    if (!manager) {
      return {
        supported: false,
        manager: false,
        profile,
        addons: rows.map((row) => ({ ...row, command: row.update ? manualCommand(profile, row.update.package, row.installed ?? undefined) : "" })),
        note: "当前环境没有可用的插件管理器，只能给出安装命令；命令执行后需要重启 DSH 才生效。",
      };
    }
    let bundles: any[] = [];
    try {
      bundles = (await manager.listBundles()) ?? [];
    } catch {
      bundles = [];
    }
    const byPackage = new Map<string, any>();
    for (const bundle of bundles) if (bundle?.name) byPackage.set(String(bundle.name), bundle);
    const addons = rows.map((row) => {
      const bundle = row.update ? byPackage.get(row.update.package) : undefined;
      const installed = bundle && bundle.installed ? String(bundle.version ?? "") || null : null;
      // 本地 link / path 装的包管理器不让自动升级（安装来源不是 registry），页面据此给不同文案。
      const source = bundle?.source ? String(bundle.source) : "";
      const local = /^(link|path|file):/i.test(source);
      return {
        ...row,
        installed,
        managed: Boolean(bundle?.installed),
        installSource: source,
        local,
        command: row.update ? manualCommand(profile, row.update.package, installed ?? undefined) : "",
      };
    });
    return { supported: true, manager: true, profile, addons, note: "" };
  }

  /**
   * 直接读官方 registry 的版本列表。
   *
   * 插件管理器对「本地 link/路径安装」的包会拒绝（not-updatable），但用户仍然有权看到
   * 这个插件在 npm 上有哪些历史版本；这里只读 metadata，不下载、不安装。
   */
  async function registryVersions(pkg: string, registry?: string): Promise<any> {
    const base = registry && registryAllowed(registry) ? registry.replace(/\/+$/, "") : OFFICIAL_REGISTRY;
    const url = `${base}/${encodeURIComponent(pkg).replace(/^%40/, "@")}`;
    const res: any = await (globalThis as any).fetch(url, {
      headers: { accept: "application/vnd.npm.install-v1+json, application/json" },
      signal: (globalThis as any).AbortSignal?.timeout?.(8000),
    });
    if (!res || !res.ok) throw new Error(`registry 返回 ${res ? res.status : "无响应"}`);
    const body: any = await res.json();
    const all = body && body.versions && typeof body.versions === "object" ? Object.keys(body.versions) : [];
    const list = all
      .filter((v) => typeof v === "string" && /^\d/.test(v))
      .sort((a, b) => compareVersions(b, a));
    return {
      status: "listed",
      installed: null,
      registry: base,
      versions: list.map((version) => ({ version })),
      source: "registry",
    };
  }

  const list = {
    description: "列出本机已注册的工作台插件：自报版本、DSH 记录的已安装版本、声明的 npm 更新来源，以及取不到插件管理器时可复制的安装命令。",
    input: { type: "object", properties: {}, additionalProperties: false },
    examples: [{}],
    execute: async () => snapshot(),
    render: (result: any) => {
      if (!result.addons.length) return "没有插件声明更新来源";
      return result.addons
        .map((row: any) => `${row.title}（${row.id}）自报 ${row.version || "?"}，已装 ${row.installed ?? "未知"}${row.update ? "，来源 " + row.update.package : "，未声明更新来源"}${row.problem ? "（" + row.problem + "）" : ""}`)
        .join("\n");
    },
  };

  /** 域自己声明的版本号（本地 link 安装时 registry 上可能还没有它）。 */
  function declaredVersion(id: string): string {
    const rec = ctx.domains.get(id);
    const raw = rec?.def?.version;
    return typeof raw === "string" ? raw.trim() : "";
  }

  /**
   * 给版本结果补「已装版本 / 最新版本 / 是否真有新版」。
   * 只看列表第一项不够：本地开发的包常常比 registry 上的新，界面不能把它写成「可升级」。
   */
  function versionSummary(listed: any, installed: string): Record<string, unknown> {
    const first = listed?.versions?.[0]?.version;
    const current = String(listed?.installed || installed || "");
    const latest = first ? String(first) : "";
    return {
      ...(listed || {}),
      installed: current || null,
      latest: latest || null,
      newer: Boolean(latest && current && compareVersions(latest, current) > 0),
    };
  }

  const versions = {
    description: "向 npm 查某个插件比当前已装版本更新的发布版本（只走官方 registry）。",
    input: {
      type: "object",
      properties: {
        id: { type: "string", description: "业务域 id，例如 wb-addon-tasks" },
        package: { type: "string", description: "直接给 npm 包名（插件未声明时手工查）" },
      },
      additionalProperties: false,
    },
    examples: [{ id: "wb-addon-tasks" }],
    execute: async (args: any) => {
      const manager = managerOf(ctx);
      const profile = profileName();
      const target = resolveTarget(ctx, args);
      if (target.error) return { supported: true, status: "refused", problem: "unknown", problemText: target.error, reason: target.error, attempts: [] };
      if (!manager) {
        // 没有插件管理器也能看版本：直接读 registry，切换动作仍只能给可复制的命令。
        try {
          const fallback = await registryVersions(target.package, target.update?.registry);
          return { ...versionSummary(fallback, declaredVersion(target.id)), supported: true, manager: false, canSwitch: false, profile, package: target.package, id: target.id, note: "当前环境没有可用的插件管理器，只能查看版本；切换请复制命令执行。" };
        } catch (error: any) {
          return {
            supported: false,
            profile,
            note: "当前环境没有可用的插件管理器，请用 dsh plugin 命令手动升级。",
            reason: String(error?.message ?? error),
          };
        }
      }
      const options = target.update?.registry ? { registry: target.update.registry } : undefined;
      const listed: any = await manager.listVersions(target.package, options);
      if (listed && listed.status !== "listed") {
        // 本地 link 安装的包管理器一律拒绝升级，但版本列表本身还能从 registry 读出来。
        if (listed.problem === "not-updatable") {
          try {
            const fallback = await registryVersions(target.package, target.update?.registry);
            return { ...versionSummary(fallback, declaredVersion(target.id)), supported: true, problem: listed.problem, problemText: problemText(listed.problem), canSwitch: false, package: target.package, id: target.id };
          } catch (error: any) {
            return {
              supported: true,
              status: "refused",
              problem: "network",
              problemText: problemText("network") + "（" + String(error?.message ?? error) + "）",
              reason: String(error?.message ?? error),
              canSwitch: false,
              package: target.package,
              id: target.id,
            };
          }
        }
        return { supported: true, ...listed, problemText: problemText(listed.problem), package: target.package, id: target.id };
      }
      return { supported: true, canSwitch: true, ...listed, package: target.package, id: target.id };
    },
    render: (result: any) => {
      if (!result.supported) return result.note;
      if (result.status !== "listed") return "查不到可用版本：" + (result.problemText || result.reason || result.problem || "未知原因");
      if (!result.versions?.length) return `${result.package} 已是最新版本 ${result.installed}`;
      return `${result.package} 当前 ${result.installed}，可升级到 ${result.versions.map((v: any) => v.version).join(" / ")}`;
    },
  };

  const check = {
    description: "逐个检查声明了更新来源的插件，报告哪些有新版本。网络失败只影响该条，不整页失败。",
    input: {
      type: "object",
      properties: { ids: { type: "array", items: { type: "string" }, description: "只检查这些域 id；省略检查全部" } },
      additionalProperties: false,
    },
    examples: [{}],
    execute: async (args: any) => {
      const manager = managerOf(ctx);
      const base = await snapshot();
      if (!manager) return { ...base, checked: 0, updates: [], problems: [] };
      const wanted = Array.isArray(args?.ids) && args.ids.length ? new Set(args.ids.map((id: unknown) => String(id))) : null;
      const updates: any[] = [];
      const problems: any[] = [];
      for (const row of base.addons as any[]) {
        if (wanted && !wanted.has(row.id)) continue;
        if (!row.update) continue;
        try {
          const listed = await manager.listVersions(row.update.package, row.update.registry ? { registry: row.update.registry } : undefined);
          if (listed.status !== "listed") {
            problems.push({
              id: row.id,
              package: row.update.package,
              problem: listed.problem,
              problemText: problemText(listed.problem),
              detail: listed.reason,
            });
            continue;
          }
          if (!listed.versions?.length) continue;
          updates.push({
            id: row.id,
            title: row.title,
            package: row.update.package,
            installed: listed.installed,
            latest: listed.versions[0].version,
            versions: listed.versions.map((item: any) => item.version),
          });
        } catch (error: any) {
          problems.push({
            id: row.id,
            package: row.update.package,
            problem: "unknown",
            problemText: problemText("unknown"),
            detail: String(error?.message ?? error),
          });
        }
      }
      return { ...base, checked: (base.addons as any[]).filter((row: any) => row.update && (!wanted || wanted.has(row.id))).length, updates, problems };
    },
    render: (result: any) => {
      if (!result.supported) return result.note;
      if (!result.updates.length) return "所有声明了更新来源的插件都是最新版本" + (result.problems.length ? `（${result.problems.length} 个查不动）` : "");
      return result.updates.map((row: any) => `${row.title}：${row.installed} → ${row.latest}`).join("\n");
    },
  };

  const install = {
    description: "把某个插件升级到指定版本：交给 DSH 插件管理器执行（与插件市场同一条路径，含占用与兼容检查）。返回是否已生效，未生效时明确写「需要重启」。",
    input: {
      type: "object",
      properties: {
        id: { type: "string", description: "业务域 id，例如 wb-addon-tasks" },
        package: { type: "string", description: "直接给 npm 包名（插件未声明时手工升级）" },
        version: { type: "string", description: "要装到的版本；省略就装查到的最新版本" },
      },
      additionalProperties: false,
    },
    examples: [{ id: "wb-addon-tasks" }],
    execute: async (args: any) => {
      const manager = managerOf(ctx);
      const profile = profileName();
      const target = resolveTarget(ctx, args);
      if (target.error) return { changed: false, application: "failed", stage: "install", error: target.error, profile };
      if (!manager) {
        return {
          changed: false,
          application: "manual",
          stage: "install",
          package: target.package,
          command: manualCommand(profile, target.package, args?.version ? String(args.version) : undefined),
          nextStep: "当前环境没有可用的插件管理器：请复制 command 在终端执行，执行完需要重启 DSH。",
        };
      }
      const options = target.update?.registry ? { registry: target.update.registry } : undefined;
      let version = String(args?.version ?? "").trim();
      if (!version) {
        const listed = await manager.listVersions(target.package, options);
        if (listed.status !== "listed" || !listed.versions?.length) {
          return { changed: false, application: "failed", stage: "install", package: target.package, error: listed.reason ?? "没有更新的版本" };
        }
        version = String(listed.versions[0].version);
      }
      const result = await manager.updateBundle(target.package, version, options);
      // updateBundle 的 ChangeResult 嵌在 result 里；这里摊平成一层，前端不必记住嵌套形状。
      const change = result?.result ?? {};
      const applied = change.application;
      return {
        from: result?.from ?? "",
        to: result?.to ?? version,
        step: result?.step ?? "install",
        changed: change.changed === true,
        application: applied,
        restartReason: change.restartReason ?? null,
        error: change.error?.message ?? (change.error ? String(change.error) : null),
        restore: result?.restore ?? null,
        package: target.package,
        version,
        profile,
        restartRequired: applied === "restart-required",
        nextStep:
          applied === "applied"
            ? "已生效：页面会自动重新加载，无需重启。"
            : applied === "restart-required"
              ? "文件已装好，但需要重启 DSH 才会用上新版本。"
              : "升级没有生效：" + (change.error?.message ?? "请查看插件管理器日志"),
      };
    },
    render: (result: any) => {
      if (result.nextStep) return result.nextStep;
      if (result.command) return "手动执行：" + result.command;
      return result.error ? String(result.error) : "升级完成";
    },
  };

  return { "host.addons.list": list, "host.addons.versions": versions, "host.addons.checkUpdates": check, "host.addons.install": install };
}

/** 解析要操作的包：优先按域 id 查声明，其次用调用方直接给的包名（同样只允许官方源）。 */
function resolveTarget(ctx: AddonContext, args: any): { id: string; package: string; update: AddonUpdateSource | null; error?: string } {
  const id = String(args?.id ?? "").trim();
  const given = String(args?.package ?? "").trim();
  if (id) {
    const rec = ctx.domains.get(id);
    if (!rec) return { id, package: given, update: null, error: "没有这个插件域：" + id };
    const read = readUpdateSource(rec.def?.update);
    if (read.problem) return { id, package: given, update: null, error: read.problem };
    if (read.update) {
      if (given && given !== read.update.package) return { id, package: read.update.package, update: read.update, error: "包名与声明不一致（声明的是 " + read.update.package + "）" };
      return { id, package: read.update.package, update: read.update };
    }
  }
  if (!given) return { id, package: "", update: null, error: "需要 id 或 package 之一" };
  // 没声明时按官方源查：不允许把用户带去别的 registry。
  return { id, package: given, update: { source: "npm", package: given, registry: OFFICIAL_REGISTRY } };
}
