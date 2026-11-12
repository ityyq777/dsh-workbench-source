#!/usr/bin/env node
/**
 * 核对「profile 已安装版本 == 源码版本」。
 *
 * 背景：插件是拷贝安装进 profile 的，源码改了、构建跑了，profile 里可能仍是旧拷贝；
 * 只重启只会重载旧代码。人工五步容易漏，这里把其中「回读 package.json + 入口冒烟」脚本化。
 *
 * 用法：
 *   node scripts/check-profile-sync.mjs                       # 读 DSH_PROFILE / DSH_PROFILE_DIR
 *   node scripts/check-profile-sync.mjs --profile desktop     # 指定 profile
 *   node scripts/check-profile-sync.mjs --profile-dir ~/.dsh/profiles/desktop
 *   node scripts/check-profile-sync.mjs --skip-import --json
 *
 * 退出码：0 全部一致；1 版本不一致或入口 import 失败；2 参数/环境错误。
 *
 * 不自动安装、不自动构建、不自动重启：脚本只核对，修复仍走 AGENTS.md 的交付流程。
 */
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

/** 源码侧包清单；host 在源码里叫 dsh-workbench，发布名是 dsh-workbench-host。 */
const PACKAGES = [
  { key: "host", label: "宿主", dir: "packages/shell-dist", names: ["dsh-workbench-host", "dsh-workbench"], addon: false },
  { key: "tasks", label: "任务", dir: "packages/addons/tasks", names: ["dsh-workbench-tasks"], addon: true },
  { key: "tags", label: "标签", dir: "packages/addons/tags", names: ["dsh-workbench-tags"], addon: true },
  { key: "sites", label: "站点", dir: "packages/addons/sites", names: ["dsh-workbench-sites"], addon: true },
  { key: "storage", label: "储物", dir: "packages/addons/storage", names: ["dsh-workbench-storage"], addon: true },
  { key: "message", label: "消息", dir: "packages/addons/message", names: ["dsh-workbench-message"], addon: true },
  { key: "vault", label: "保险箱", dir: "packages/addons/vault", names: ["dsh-workbench-vault"], addon: true },
  { key: "connector", label: "连接器", dir: "packages/addons/connector", names: ["dsh-workbench-connector"], addon: true },
  { key: "automation", label: "自动化", dir: "packages/addons/automation", names: ["dsh-workbench-automation"], addon: true },
  { key: "contacts", label: "联系人", dir: "packages/addons/contacts", names: ["dsh-workbench-contacts"], addon: true },
  { key: "calendar", label: "日历", dir: "packages/addons/calendar", names: ["dsh-workbench-calendar"], addon: true },
  { key: "mail", label: "邮件", dir: "packages/addons/mail", names: ["dsh-workbench-mail"], addon: true },
];

const EXIT_OK = 0;
const EXIT_DIFF = 1;
const EXIT_ENV = 2;

function parseArgs(argv) {
  const opts = { profile: "", profileDir: "", source: ROOT, skipImport: false, json: false, help: false };
  const take = (i, flag) => {
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) throw new UsageError(`参数 ${flag} 需要一个值`);
    return value;
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--profile") opts.profile = take(i++, "--profile");
    else if (arg === "--profile-dir") opts.profileDir = take(i++, "--profile-dir");
    else if (arg === "--source") opts.source = take(i++, "--source");
    else if (arg === "--skip-import") opts.skipImport = true;
    else if (arg === "--json") opts.json = true;
    else if (arg === "--help" || arg === "-h") opts.help = true;
    else throw new UsageError(`未知参数 ${arg}`);
  }
  return opts;
}

class UsageError extends Error {}

function expandHome(input) {
  if (input === "~") return homedir();
  if (input.startsWith("~/")) return join(homedir(), input.slice(2));
  return input;
}

function resolveTargets(opts) {
  const profile = opts.profile || process.env.DSH_PROFILE || "desktop";
  const fromEnv = process.env.DSH_PROFILE_DIR || "";
  const profileDir = resolve(expandHome(opts.profileDir || fromEnv || join(homedir(), ".dsh", "profiles", profile)));
  const source = resolve(expandHome(opts.source || ROOT));
  return { profile, profileDir, source };
}

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function readManifest(dir) {
  const file = join(dir, "package.json");
  if (!existsSync(file)) return null;
  try {
    return readJson(file);
  } catch (error) {
    throw new UsageError(`无法解析 ${file}: ${error.message}`);
  }
}

function displayWidth(text) {
  let width = 0;
  for (const char of String(text)) {
    width += /[\u1100-\u115f\u2e80-\ua4cf\ua960-\ua97f\uac00-\ud7a3\uf900-\ufaff\ufe10-\ufe19\ufe30-\ufe6f\uff00-\uff60\uffe0-\uffe6]/.test(char) ? 2 : 1;
  }
  return width;
}

function pad(text, width) {
  const value = String(text ?? "");
  return value + " ".repeat(Math.max(0, width - displayWidth(value)));
}

/** 从 profile 根 package.json 的 dependencies 里取安装源描述。 */
function readInstallSpec(profileDir, name) {
  const manifest = readManifest(profileDir);
  const deps = manifest?.dependencies || {};
  const value = deps[name];
  if (typeof value !== "string") return "";
  return value;
}

/** `file:`/`link:` 指向的目录是否还存在（只提示，不因缺失判失败）。 */
function installSourceExists(spec) {
  const match = /^(?:file|link):(.+)$/.exec(spec || "");
  if (!match) return null;
  return existsSync(resolve(expandHome(match[1])));
}

function collectSource(sourceRoot) {
  const errors = [];
  const packages = [];
  for (const pkg of PACKAGES) {
    const dir = join(sourceRoot, pkg.dir);
    const manifest = readManifest(dir);
    if (!manifest) {
      errors.push({ code: "SOURCE_MISSING", message: `源码缺包：${dir}/package.json 不存在（先 pnpm build && pnpm dist:shell？）` });
      continue;
    }
    const version = String(manifest.version || "").trim();
    if (!version) {
      errors.push({ code: "SOURCE_VERSION_MISSING", message: `源码包 ${pkg.name || pkg.dir} 没有 version 字段` });
      continue;
    }
    if (pkg.addon) {
      const addonVersion = String(manifest.wb?.addon?.version || "").trim();
      if (addonVersion !== version) {
        errors.push({
          code: "SOURCE_MANIFEST_INCONSISTENT",
          message: `源码包 ${manifest.name} 的 version=${version} 与 wb.addon.version=${addonVersion || "(空)"} 不一致`,
        });
        continue;
      }
    }
    packages.push({ ...pkg, sourceName: manifest.name, sourceVersion: version });
  }
  return { packages, errors };
}

async function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`✗ ${error.message}`);
    console.error("用法：node scripts/check-profile-sync.mjs [--profile <name>] [--profile-dir <path>] [--source <dir>] [--skip-import] [--json]");
    process.exitCode = EXIT_ENV;
    return;
  }
  if (opts.help) {
    console.log("用法：node scripts/check-profile-sync.mjs [--profile <name>] [--profile-dir <path>] [--source <dir>] [--skip-import] [--json]");
    return;
  }

  const { profile, profileDir, source } = resolveTargets(opts);
  const errors = [];
  const warnings = [];
  const rows = [];

  const sourceResult = collectSource(source);
  errors.push(...sourceResult.errors);

  if (!existsSync(profileDir)) {
    errors.push({ code: "PROFILE_DIR_MISSING", message: `profile 目录不存在：${profileDir}` });
    return finish({ opts, profile, profileDir, source, rows, errors, warnings });
  }
  const modulesDir = join(profileDir, "node_modules");
  if (!existsSync(modulesDir)) {
    errors.push({ code: "PROFILE_NODE_MODULES_MISSING", message: `profile 缺少 node_modules：${modulesDir}` });
    return finish({ opts, profile, profileDir, source, rows, errors, warnings });
  }

  for (const pkg of sourceResult.packages) {
    const row = {
      key: pkg.key,
      label: pkg.label,
      sourceName: pkg.sourceName,
      sourceVersion: pkg.sourceVersion,
      installedName: "",
      installedVersion: "",
      dir: "",
      via: "",
      sourceExists: null,
      manifestOk: true,
      importOk: null,
      importError: "",
      ok: false,
    };
    let hit = null;
    for (const name of pkg.names) {
      const dir = join(modulesDir, name);
      if (existsSync(join(dir, "package.json"))) {
        hit = { name, dir };
        break;
      }
    }
    if (!hit) {
      errors.push({ code: "PROFILE_PACKAGE_MISSING", message: `profile 未安装 ${pkg.names.join(" / ")}（${profileDir}）` });
      rows.push(row);
      continue;
    }
    row.installedName = hit.name;
    row.dir = hit.dir;
    row.via = readInstallSpec(profileDir, hit.name);
    row.sourceExists = installSourceExists(row.via);
    if (row.sourceExists === false) warnings.push(`${hit.name} 的安装源 ${row.via} 已不存在（版本仍可能对得上，只提示）`);
    try {
      const manifest = readManifest(hit.dir);
      row.installedVersion = String(manifest?.version || "").trim();
      if (pkg.addon) {
        const addonVersion = String(manifest?.wb?.addon?.version || "").trim();
        if (addonVersion !== row.installedVersion) {
          row.manifestOk = false;
          errors.push({
            code: "PROFILE_MANIFEST_INCONSISTENT",
            message: `已安装 ${hit.name} 的 version=${row.installedVersion || "(空)"} 与 wb.addon.version=${addonVersion || "(空)"} 不一致`,
          });
        }
      }
    } catch (error) {
      errors.push({ code: "PROFILE_MANIFEST_BROKEN", message: error.message });
    }

    if (!opts.skipImport) {
      const entry = join(hit.dir, "lib/index.js");
      try {
        if (!existsSync(entry)) throw new Error(`入口不存在：${entry}`);
        await import(pathToFileURL(entry).href);
        row.importOk = true;
      } catch (error) {
        row.importOk = false;
        row.importError = String(error?.message || error).split("\n")[0];
      }
    }

    row.ok = row.installedVersion !== "" && row.installedVersion === row.sourceVersion;
    rows.push(row);
  }

  return finish({ opts, profile, profileDir, source, rows, errors, warnings });
}

function finish({ opts, profile, profileDir, source, rows, errors, warnings }) {
  const importFailed = rows.filter((row) => row.importOk === false);
  const mismatched = rows.filter((row) => row.installedVersion && !row.ok);
  const ok = errors.length === 0 && rows.length === PACKAGES.length && mismatched.length === 0 && importFailed.length === 0;
  const exitCode = errors.length > 0 ? EXIT_ENV : ok ? EXIT_OK : EXIT_DIFF;

  if (opts.json) {
    const payload = {
      ok,
      exitCode,
      profile,
      profileDir,
      source,
      skipImport: opts.skipImport,
      packages: rows.map((row) => ({
        key: row.key,
        name: row.installedName || row.sourceName,
        sourceName: row.sourceName,
        sourceVersion: row.sourceVersion,
        installedVersion: row.installedVersion,
        ok: row.ok,
        via: row.via,
        sourceExists: row.sourceExists,
        importOk: row.importOk,
        importError: row.importError,
      })),
      errors,
      warnings,
    };
    console.log(JSON.stringify(payload, null, 2));
    process.exitCode = exitCode;
    return;
  }

  console.log(`profile：${profile}（${profileDir}）`);
  console.log(`源码：${source}`);
  console.log("");
  const head = ["包", "源码版本", "已安装版本", "版本", "入口", "安装源"];
  const table = rows.map((row) => [
    row.label,
    row.sourceVersion || "-",
    row.installedVersion || "(缺失)",
    row.ok ? "一致" : "不一致",
    opts.skipImport ? "跳过" : row.importOk === false ? "失败" : "通过",
    row.via || "-",
  ]);
  const widths = head.map((cell, index) => Math.max(displayWidth(cell), ...table.map((line) => displayWidth(line[index]))));
  const line = (cells) => cells.map((cell, index) => pad(cell, widths[index])).join("  ").trimEnd();
  console.log(line(head));
  console.log(widths.map((width) => "-".repeat(width)).join("  "));
  for (const cells of table) console.log(line(cells));

  for (const row of importFailed) console.log(`\n✗ ${row.installedName} 入口 import 失败：${row.importError}`);
  for (const row of mismatched) {
    console.log(`\n✗ ${row.installedName}：源码 ${row.sourceVersion}，已安装 ${row.installedVersion}，需重新构建安装`);
  }
  for (const error of errors) console.log(`\n✗ ${error.message}`);
  for (const warning of warnings) console.log(`\n! ${warning}`);

  console.log("");
  if (ok) console.log("✓ profile 已安装版本与源码一致");
  else if (exitCode === EXIT_ENV) console.log("✗ 参数或环境错误，未能完成核对");
  else console.log("✗ 存在差异：按 AGENTS.md 交付流程重新构建并安装到该 profile");
  process.exitCode = exitCode;
}

await main();
