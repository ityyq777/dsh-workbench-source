import type { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { monoNow } from "@wb/core";

export interface VersionMeta {
  version: string;
  min_shell: string;
  tables: string[];
  views: string[];
  tool_actions: string[];
  file_size: number;
  sha256: string;
}

/** semver 比较（数字段；demo 够用）。 */
export function semverGt(a: string, b: string): boolean {
  const pa = a.split(".").map(Number), pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) > (pb[i] ?? 0)) return true;
    if ((pa[i] ?? 0) < (pb[i] ?? 0)) return false;
  }
  return false;
}

/** 兼容性过滤：min_shell <= shellVersion 的最新未 yank 版本。 */
function latestCompatible(db: DatabaseSync, addonId: string, shellVersion: string | null, yanked: string[]): string | null {
  const rows = db.prepare("SELECT version, min_shell FROM catalog_versions WHERE addon_id=? ORDER BY rowid DESC").all(addonId) as { version: string; min_shell: string }[];
  for (const r of rows) {
    if (yanked.includes(r.version)) continue;
    if (shellVersion && semverGt(r.min_shell, shellVersion)) continue;
    return r.version;
  }
  return null;
}

/** 发布一个版本（tarball 落盘后调用；sha256 由调用方传入校验和）。 */
export function publishVersion(db: DatabaseSync, meta: VersionMeta & { addon_id: string; title: string; description?: string; author?: string }): void {
  const ts = monoNow();
  db.prepare(
    "INSERT INTO catalog_addons(id,title,description,author,latest,created_at,updated_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title, description=excluded.description, author=excluded.author, updated_at=excluded.updated_at",
  ).run(meta.addon_id, meta.title ?? meta.addon_id, meta.description ?? "", meta.author ?? "", meta.version, ts, ts);
  db.prepare(
    "INSERT INTO catalog_versions(addon_id,version,min_shell,tables,views,tool_actions,file_size,sha256,published_at) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(addon_id,version) DO UPDATE SET file_size=excluded.file_size, sha256=excluded.sha256",
  ).run(meta.addon_id, meta.version, meta.min_shell ?? "1.0.0", JSON.stringify(meta.tables ?? []), JSON.stringify(meta.views ?? []), JSON.stringify(meta.tool_actions ?? []), meta.file_size, meta.sha256, ts);
}

/** 列表（服务端做兼容过滤——客户端不实现 semver，04 文档决策）。 */
export function listAddons(db: DatabaseSync, shellVersion: string | null) {
  const addons = db.prepare("SELECT * FROM catalog_addons ORDER BY updated_at DESC").all() as { id: string; title: string; description: string; author: string; latest: string; yanked: string }[];
  return addons.map((a) => {
    const yanked = JSON.parse(a.yanked) as string[];
    const compatible = latestCompatible(db, a.id, shellVersion, yanked);
    return { id: a.id, title: a.title, description: a.description, author: a.author, latest: a.latest, compatible_version: compatible, yanked };
  }).filter((a) => a.compatible_version);
}

/** 详情：含该插件全部可安装版本。 */
export function addonDetail(db: DatabaseSync, id: string, shellVersion: string | null) {
  const a = db.prepare("SELECT * FROM catalog_addons WHERE id=?").get(id) as { id: string; title: string; description: string; author: string; latest: string; yanked: string } | undefined;
  if (!a) return null;
  const yanked = JSON.parse(a.yanked) as string[];
  const versions = (db.prepare("SELECT * FROM catalog_versions WHERE addon_id=? ORDER BY rowid DESC").all(id) as Record<string, unknown>[]).filter((v) => {
    if (yanked.includes(v.version as string)) return false;
    if (shellVersion && semverGt(v.min_shell as string, shellVersion)) return false;
    return true;
  });
  return { ...a, yanked, versions };
}

/** yank 一个版本。 */
export function yankVersion(db: DatabaseSync, id: string, version: string): boolean {
  const a = db.prepare("SELECT yanked FROM catalog_addons WHERE id=?").get(id) as { yanked: string } | undefined;
  if (!a) return false;
  const yanked = new Set(JSON.parse(a.yanked) as string[]);
  yanked.add(version);
  db.prepare("UPDATE catalog_addons SET yanked=?, updated_at=? WHERE id=?").run(JSON.stringify([...yanked]), monoNow(), id);
  return true;
}

/** 增量变更（轮询用）：updated_at 大于 since 的条目。 */
export function catalogChanges(db: DatabaseSync, since: number, shellVersion: string | null) {
  const rows = db.prepare("SELECT id FROM catalog_addons WHERE updated_at>?").all(since) as { id: string }[];
  return rows.map((r) => addonDetail(db, r.id, shellVersion)).filter(Boolean);
}

/** 记录下载并返回计数。 */
export function recordDownload(db: DatabaseSync, id: string, version: string): void {
  db.prepare(
    "INSERT INTO download_stats(addon_id,version,count) VALUES(?,?,1) ON CONFLICT(addon_id,version) DO UPDATE SET count=count+1",
  ).run(id, version);
}

export function sha256Of(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}
