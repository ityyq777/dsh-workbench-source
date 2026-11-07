import type { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { extractTarGz } from "./tar.js";

/**
 * 子插件管理器：云端目录 -> 下载 -> 校验 -> 暂存解包 -> 原子发布 -> 动态加载。
 *
 * 设计约束（04/05/08 文档）：
 *  - 业务数据表归 addon 的 migrations 管，壳不建 tasks；
 *  - 卸载只删代码目录，保留数据库（重装后数据还在）；
 *  - 坏包不拖垮壳：加载失败记录 error 并禁用，可在 UI 卸载/重装。
 */

export interface AddonManifest {
  id: string;
  title: string;
  description?: string;
  author?: string;
  version: string;
  minShell: string;
  tables: string[];
  views?: { id: string; title?: string | { zh: string; en?: string } }[];
  toolActions?: string[];
  client?: string;
}

export interface AddonActionDef {
  description?: string;
  input?: Record<string, unknown>;
  execute: (args: Record<string, unknown>, ctx: { origin: string; emit: (event: string, data?: unknown) => void }) => unknown | Promise<unknown>;
  render?: (result: unknown) => string;
}

interface ActionEntry {
  name: string;
  addonId: string;
  def: AddonActionDef;
}

export interface LoadedAddon {
  id: string;
  version: string;
  dir: string;
  dirName: string;
  enabled: boolean;
  error: string | null;
  manifest: AddonManifest;
  module: any;
  actions: Map<string, AddonActionDef>;
  client: string | null;
  installedAt: number;
  source: Record<string, unknown> | null;
}

interface RegistryEntry {
  id: string;
  version: string;
  dirName: string;
  installedAt: number;
  source?: Record<string, unknown> | null;
}

interface RegistryFile {
  version: 1;
  addons: RegistryEntry[];
}

export interface AddonManagerOptions {
  home: string;
  db: DatabaseSync;
  shellVersion: string;
  cloudUrl: string;
  cloudFetch: (
    path: string,
    init?: { method?: string; body?: string; headers?: Record<string, string> },
  ) => Promise<any>;
  emit: (event: string, payload: unknown) => void;
  logger?: (...args: unknown[]) => void;
}

const ADDON_ID_RE = /^[a-z][a-z0-9_-]{1,63}$/;
const VERSION_RE = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const TABLE_RE = /^[a-z_][a-z0-9_]*$/;
const ACTION_RE = /^[a-z][a-z0-9_-]*(?:\.[a-z][a-z0-9_-]*)+$/i;
const MAX_TARBALL = 20 * 1024 * 1024;

function semverParts(v: string): number[] {
  return v.split("-")[0].split(".").map((n) => Number(n) || 0);
}

function semverLt(a: string, b: string): boolean {
  const pa = semverParts(a);
  const pb = semverParts(b);
  for (let i = 0; i < 3; i += 1) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x < y) return true;
    if (x > y) return false;
  }
  return false;
}

function shortError(e: unknown): string {
  return String((e && (e as Error).message) || e);
}

function normalizeViews(raw: unknown): AddonManifest["views"] {
  if (!Array.isArray(raw)) return [];
  const out: { id: string; title?: string | { zh: string; en?: string } }[] = [];
  for (const item of raw) {
    if (typeof item === "string" && item) {
      out.push({ id: item });
    } else if (item && typeof item === "object" && typeof (item as any).id === "string") {
      out.push({ id: (item as any).id, title: (item as any).title });
    } else {
      throw new Error("manifest.views 非法条目");
    }
  }
  return out;
}

function normalizeManifest(raw: any): AddonManifest {
  if (!raw || typeof raw !== "object") throw new Error("package.json 缺少 wb.addon");
  const id = String(raw.id || "");
  if (!ADDON_ID_RE.test(id)) throw new Error("addon id 非法：" + JSON.stringify(id));
  const version = String(raw.version || "");
  if (!VERSION_RE.test(version)) throw new Error("addon version 非法：" + JSON.stringify(version));
  if (!raw.title) throw new Error("manifest 缺少 title");
  const tables = Array.isArray(raw.tables) ? raw.tables.map(String) : [];
  for (const t of tables) {
    if (!TABLE_RE.test(t)) throw new Error("manifest.tables 非法表名：" + t);
  }
  const toolActions = Array.isArray(raw.toolActions) ? raw.toolActions.map(String) : [];
  for (const a of toolActions) {
    if (!ACTION_RE.test(a)) throw new Error("manifest.toolActions 非法 action：" + a);
  }
  return {
    id,
    title: String(raw.title),
    description: raw.description ? String(raw.description) : undefined,
    author: raw.author ? String(raw.author) : undefined,
    version,
    minShell: raw.minShell ? String(raw.minShell) : "0.0.0",
    tables,
    views: normalizeViews(raw.views),
    toolActions,
    client: raw.client ? String(raw.client) : undefined,
  };
}

function resolveInside(dir: string, rel: string): string {
  if (!rel || rel.startsWith("/") || rel.includes("\\")) {
    throw new Error("addon 路径非法：" + JSON.stringify(rel));
  }
  const abs = resolve(dir, rel);
  if (abs !== dir && !abs.startsWith(dir + sep)) {
    throw new Error("addon 路径逃逸：" + JSON.stringify(rel));
  }
  return abs;
}

export class AddonManager {
  readonly root: string;
  readonly stagingRoot: string;
  private readonly opts: AddonManagerOptions;
  private readonly loaded = new Map<string, LoadedAddon>();
  private readonly actions = new Map<string, ActionEntry>();
  private registry: RegistryFile = { version: 1, addons: [] };

  constructor(opts: AddonManagerOptions) {
    this.opts = opts;
    this.root = join(opts.home, "addons");
    this.stagingRoot = join(this.root, ".staging");
  }

  private log(...args: unknown[]): void {
    if (this.opts.logger) this.opts.logger(...args);
    else console.warn("[addons]", ...args);
  }

  private emit(event: string, payload: unknown): void {
    this.opts.emit(event, payload);
  }

  private ensureDirs(): void {
    mkdirSync(this.root, { recursive: true });
    mkdirSync(this.stagingRoot, { recursive: true });
  }

  private cleanupStaging(): void {
    try {
      const now = Date.now();
      for (const name of readdirSync(this.stagingRoot)) {
        const p = join(this.stagingRoot, name);
        try {
          if (now - statSync(p).mtimeMs > 60 * 60 * 1000) rmSync(p, { recursive: true, force: true });
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* ignore */
    }
  }

  private registryPath(): string {
    return join(this.root, "addons.json");
  }

  private readRegistry(): RegistryFile {
    try {
      const parsed = JSON.parse(readFileSync(this.registryPath(), "utf8"));
      if (parsed && Array.isArray(parsed.addons)) {
        return { version: 1, addons: parsed.addons.filter((e: any) => e && e.id && e.dirName) };
      }
    } catch {
      /* missing or broken: start empty; dirs are still adopted below */
    }
    return { version: 1, addons: [] };
  }

  private saveRegistry(): void {
    const tmp = this.registryPath() + ".tmp";
    writeFileSync(tmp, JSON.stringify(this.registry, null, 2) + "\n");
    renameSync(tmp, this.registryPath());
  }

  private upsertRegistry(entry: RegistryEntry): void {
    this.registry.addons = this.registry.addons.filter((e) => e.id !== entry.id);
    this.registry.addons.push(entry);
    this.saveRegistry();
  }

  private removeRegistry(id: string): void {
    this.registry.addons = this.registry.addons.filter((e) => e.id !== id);
    this.saveRegistry();
  }

  /** 启动时加载 registry + 采纳手工放进 addons/ 的开发目录。 */
  async init(): Promise<void> {
    this.ensureDirs();
    this.cleanupStaging();
    this.registry = this.readRegistry();

    const known = new Set<string>();
    for (const entry of this.registry.addons) {
      known.add(entry.id);
      await this.loadEntry(entry, false);
    }

    // 采纳目录：<id>@<semver>，便于本地开发直接拷贝（不经过云端）
    let adopted = false;
    for (const name of readdirSync(this.root)) {
      if (name === ".staging" || name.endsWith(".json") || name.endsWith(".tmp")) continue;
      if (!/@\d+\.\d+\.\d+/.test(name)) continue;
      const dir = join(this.root, name);
      try {
        if (!statSync(dir).isDirectory()) continue;
        const { manifest } = this.readManifest(dir);
        if (known.has(manifest.id)) continue;
        const entry: RegistryEntry = {
          id: manifest.id,
          version: manifest.version,
          dirName: name,
          installedAt: Date.now(),
          source: { kind: "local-dir" },
        };
        this.registry.addons.push(entry);
        known.add(manifest.id);
        adopted = true;
        await this.loadEntry(entry, false);
      } catch (e) {
        this.log("跳过无法识别的 addon 目录", name, shortError(e));
      }
    }
    if (adopted) this.saveRegistry();
  }

  private readManifest(dir: string): { pkg: any; manifest: AddonManifest } {
    const pkgPath = join(dir, "package.json");
    if (!existsSync(pkgPath)) throw new Error("缺少 package.json：" + dir);
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    const manifest = normalizeManifest(pkg.wb && pkg.wb.addon);
    if (String(pkg.version || "") !== manifest.version) {
      throw new Error("package.version 与 wb.addon.version 不一致：" + pkg.version + " != " + manifest.version);
    }
    return { pkg, manifest };
  }

  private resolveEntryFile(dir: string, pkg: any): string {
    const rel = typeof pkg.main === "string" && pkg.main ? pkg.main : "lib/index.js";
    const abs = resolveInside(dir, rel);
    if (!existsSync(abs)) throw new Error("入口文件不存在：" + rel);
    return abs;
  }

  private resolveClientFile(dir: string, manifest: AddonManifest): string | null {
    if (manifest.client) {
      const abs = resolveInside(dir, manifest.client);
      return existsSync(abs) ? abs : null;
    }
    for (const rel of ["lib/client.js", "client.js"]) {
      const abs = resolveInside(dir, rel);
      if (existsSync(abs)) return abs;
    }
    return null;
  }

  private async loadEntry(entry: RegistryEntry, strict: boolean): Promise<LoadedAddon | null> {
    const dir = join(this.root, entry.dirName);
    this.unload(entry.id);
    try {
      if (!existsSync(join(dir, "package.json"))) throw new Error("目录不存在或不完整：" + entry.dirName);
      const { pkg, manifest } = this.readManifest(dir);
      if (manifest.id !== entry.id) {
        throw new Error("目录中的 addon id 不匹配：" + manifest.id + " != " + entry.id);
      }
      if (manifest.version !== entry.version) {
        throw new Error("目录中的版本不匹配：" + manifest.version + " != " + entry.version);
      }
      if (semverLt(this.opts.shellVersion, manifest.minShell)) {
        throw new Error("需要壳版本 >= " + manifest.minShell + "，当前 " + this.opts.shellVersion);
      }

      const entryFile = this.resolveEntryFile(dir, pkg);
      const clientFile = this.resolveClientFile(dir, manifest);
      const mod = await import(pathToFileURL(entryFile).href + "?v=" + encodeURIComponent(manifest.version + "-" + Date.now()));
      const main = (mod && mod.default && typeof mod.default.setup === "function") ? mod.default : mod;
      if (!main || typeof main.setup !== "function") {
        throw new Error("入口模块必须导出 setup(api)");
      }

      const migrations: string[] = Array.isArray(main.migrations)
        ? main.migrations.map(String)
        : Array.isArray(mod.migrations)
          ? mod.migrations.map(String)
          : [];
      for (const sql of migrations) {
        this.opts.db.exec(sql);
      }

      const localActions = new Map<string, AddonActionDef>();
      const api = this.makeApi(manifest, dir, localActions);
      await main.setup(api);

      const rec: LoadedAddon = {
        id: manifest.id,
        version: manifest.version,
        dir,
        dirName: entry.dirName,
        enabled: true,
        error: null,
        manifest,
        module: main,
        actions: localActions,
        client: clientFile,
        installedAt: entry.installedAt,
        source: entry.source ?? null,
      };

      for (const [name, def] of localActions) {
        const cur = this.actions.get(name);
        if (cur && cur.addonId !== rec.id) {
          throw new Error("action 名称冲突：" + name + " 已被 " + cur.addonId + " 占用");
        }
      }
      for (const [name, def] of localActions) {
        this.actions.set(name, { name, addonId: rec.id, def });
      }

      if (manifest.client && !clientFile) {
        rec.error = "manifest.client 指向的文件不存在：" + manifest.client;
      }
      const missingActions = (manifest.toolActions || []).filter((n) => !localActions.has(n));
      if (missingActions.length) {
        rec.error = (rec.error ? rec.error + "；" : "") + "manifest 声明的 action 未注册：" + missingActions.join(", ");
      }
      this.loaded.set(manifest.id, rec);
      return rec;
    } catch (e) {
      const message = shortError(e);
      this.log("加载失败", entry.id, message);
      // 尽量保留 manifest 供 UI 展示；读取失败则用占位
      let manifest: AddonManifest;
      try {
        manifest = this.readManifest(dir).manifest;
      } catch {
        manifest = {
          id: entry.id,
          title: entry.id,
          version: entry.version,
          minShell: "0.0.0",
          tables: [],
          views: [],
          toolActions: [],
        };
      }
      const rec: LoadedAddon = {
        id: entry.id,
        version: entry.version,
        dir,
        dirName: entry.dirName,
        enabled: false,
        error: message,
        manifest,
        module: null,
        actions: new Map(),
        client: null,
        installedAt: entry.installedAt,
        source: entry.source ?? null,
      };
      this.loaded.set(entry.id, rec);
      if (strict) throw e;
      return rec;
    }
  }

  private makeApi(manifest: AddonManifest, dir: string, actions: Map<string, AddonActionDef>): any {
    const addonId = manifest.id;
    const api = {
      addon: { id: addonId, version: manifest.version, dir },
      db: this.opts.db,
      shellVersion: this.opts.shellVersion,
      action(name: string, def: AddonActionDef): void {
        if (!ACTION_RE.test(name)) throw new Error("action 名非法：" + name);
        if (!def || typeof def.execute !== "function") throw new Error("action 需要 execute 函数：" + name);
        actions.set(name, def);
      },
      tool(name: string, def: AddonActionDef): void {
        api.action(name, def);
      },
      // 注意：必须用箭头函数捕获 manager 的 this；写成方法会让 this 指向 api 对象
      emit: (event: string, data?: unknown): void => {
        this.emit("addon-event", { addonId, event, data: data ?? null });
      },
      log: (...args: unknown[]): void => {
        this.log("[" + addonId + "]", ...args);
      },
    };
    return api;
  }

  private unload(id: string): void {
    const rec = this.loaded.get(id);
    if (!rec) return;
    try {
      if (rec.module && typeof rec.module.dispose === "function") rec.module.dispose();
    } catch (e) {
      this.log("dispose 失败", id, shortError(e));
    }
    for (const name of rec.actions.keys()) {
      const cur = this.actions.get(name);
      if (cur && cur.addonId === id) this.actions.delete(name);
    }
    this.loaded.delete(id);
  }

  list(): Record<string, unknown>[] {
    const out = Array.from(this.loaded.values()).map((a) => ({
      id: a.id,
      title: a.manifest.title,
      description: a.manifest.description ?? "",
      author: a.manifest.author ?? "",
      version: a.version,
      enabled: a.enabled,
      error: a.error,
      tables: a.manifest.tables,
      views: a.manifest.views ?? [],
      toolActions: Array.from(a.actions.keys()).sort(),
      client: a.client ? "/workbench/api/addons/" + encodeURIComponent(a.id) + "/client.js" : null,
      installedAt: a.installedAt,
      source: a.source,
    }));
    out.sort((x, y) => String(x.title).localeCompare(String(y.title)));
    return out;
  }

  json(id: string): Record<string, unknown> | null {
    const found = this.list().find((a) => a.id === id);
    return found ?? null;
  }

  isInstalled(id: string): boolean {
    return this.loaded.has(id);
  }

  actionNames(): { name: string; addonId: string; description: string }[] {
    return Array.from(this.actions.values())
      .map((a) => ({ name: a.name, addonId: a.addonId, description: a.def.description ?? "" }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async invoke(name: string, args: Record<string, unknown>, origin: string): Promise<{ result: unknown; text: string; addonId: string }> {
    const entry = this.actions.get(name);
    if (!entry) throw new Error("没有 action " + name + "（子插件未安装或未注册）");
    const result = await entry.def.execute(args ?? {}, {
      origin,
      emit: (event, data) => this.emit("addon-event", { addonId: entry.addonId, event, data: data ?? null }),
    });
    const text = entry.def.render ? entry.def.render(result) : JSON.stringify(result, null, 2);
    return { result, text, addonId: entry.addonId };
  }

  clientPath(id: string): string | null {
    const rec = this.loaded.get(id);
    return rec && rec.client ? rec.client : null;
  }

  private catalogCachePath(): string {
    return join(this.root, "catalog-cache.json");
  }

  async catalog(): Promise<any> {
    const path = "/v1/catalog/addons?shell=" + encodeURIComponent(this.opts.shellVersion);
    try {
      const r = await this.opts.cloudFetch(path);
      if (r && r.ok) {
        try {
          writeFileSync(this.catalogCachePath(), JSON.stringify({ savedAt: Date.now(), addons: r.addons ?? [] }));
        } catch {
          /* cache best-effort */
        }
        return { ok: true, addons: r.addons ?? [], cached: false };
      }
      throw new Error((r && r.error) || "云端目录不可用");
    } catch (e) {
      try {
        const cached = JSON.parse(readFileSync(this.catalogCachePath(), "utf8"));
        return { ok: true, addons: cached.addons ?? [], cached: true, error: shortError(e) };
      } catch {
        return { ok: false, addons: [], cached: true, error: shortError(e) };
      }
    }
  }

  async install(id: string): Promise<Record<string, unknown>> {
    if (!ADDON_ID_RE.test(id)) throw new Error("addon id 非法：" + id);
    const detail = await this.opts.cloudFetch(
      "/v1/catalog/addons/" + encodeURIComponent(id) + "?shell=" + encodeURIComponent(this.opts.shellVersion),
    );
    if (!detail || !detail.ok || !detail.addon) {
      throw new Error((detail && detail.error) || "云端没有这个子插件：" + id);
    }
    const addon = detail.addon;
    const versions: any[] = Array.isArray(addon.versions) ? addon.versions : [];
    const version = addon.compatible_version || (versions[0] && versions[0].version);
    const meta = versions.find((v) => v.version === version);
    if (!version || !meta) throw new Error("没有与当前壳兼容的版本（shell " + this.opts.shellVersion + "）");
    if (!meta.tarball) throw new Error("catalog 未提供 tarball");

    const url = new URL(meta.tarball, this.opts.cloudUrl.replace(/\/+$/, "") + "/").toString();
    const res = await fetch(url);
    if (!res.ok) throw new Error("下载失败 HTTP " + res.status);
    const length = Number(res.headers.get("content-length") || 0);
    if (length > MAX_TARBALL) throw new Error("包体过大：" + length + " bytes");
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > MAX_TARBALL) throw new Error("包体过大：" + buf.length + " bytes");
    const sha = createHash("sha256").update(buf).digest("hex");
    if (meta.sha256 && sha !== meta.sha256) {
      throw new Error("sha256 校验失败：期望 " + meta.sha256 + "，实际 " + sha);
    }

    this.ensureDirs();
    const staging = join(this.stagingRoot, id + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8));
    mkdirSync(staging, { recursive: true });
    try {
      extractTarGz(buf, staging);
      const { manifest } = this.readManifest(staging);
      if (manifest.id !== id) throw new Error("包内 addon id 不匹配：" + manifest.id);
      if (version && manifest.version !== version) {
        throw new Error("包内版本不匹配：" + manifest.version + " != " + version);
      }
      if (semverLt(this.opts.shellVersion, manifest.minShell)) {
        throw new Error("需要壳版本 >= " + manifest.minShell);
      }

      const dirName = manifest.id + "@" + manifest.version;
      const target = join(this.root, dirName);
      this.unload(id);
      for (const name of readdirSync(this.root)) {
        if (name.startsWith(manifest.id + "@") && name !== dirName) {
          rmSync(join(this.root, name), { recursive: true, force: true });
        }
      }
      if (existsSync(target)) rmSync(target, { recursive: true, force: true });
      renameSync(staging, target);

      const entry: RegistryEntry = {
        id: manifest.id,
        version: manifest.version,
        dirName,
        installedAt: Date.now(),
        source: { kind: "cloud", url, sha256: sha, version },
      };
      this.upsertRegistry(entry);
      await this.loadEntry(entry, false);
      this.emit("addons-changed", this.list());
      return this.json(manifest.id) ?? {};
    } finally {
      rmSync(staging, { recursive: true, force: true });
    }
  }

  async uninstall(id: string): Promise<{ id: string; version: string }> {
    const rec = this.loaded.get(id) ?? null;
    const entry = this.registry.addons.find((e) => e.id === id);
    if (!rec && !entry) throw new Error("未安装：" + id);
    this.unload(id);
    const dirName = (entry && entry.dirName) || (rec && rec.dirName);
    if (dirName) rmSync(join(this.root, dirName), { recursive: true, force: true });
    this.removeRegistry(id);
    this.emit("addons-changed", this.list());
    return { id, version: rec ? rec.version : entry ? entry.version : "" };
  }

  dispose(): void {
    for (const id of Array.from(this.loaded.keys())) this.unload(id);
  }
}
