#!/usr/bin/env node
/**
 * 发布 dist/release/packages 下的全部包到 npm（宿主 + 所有业务插件）。
 *
 * 默认只做 dry-run（npm publish --dry-run），确认无误后加 --publish。
 * 宿主必须先发布，业务包依赖它的版本。
 * 发布前会比对发布树与源码版本；不一致说明 stage-release 之后源码又升了版本，
 * 直接发布会把旧包当最新版发出去，因此默认拦截（确认要用旧快照时加 --allow-drift）。
 *
 * 例：
 *   node scripts/publish-npm.mjs
 *   node scripts/publish-npm.mjs --publish
 *   node scripts/publish-npm.mjs --publish --otp=123456
 *   node scripts/publish-npm.mjs --only=host --publish
 *   node scripts/publish-npm.mjs --publish --allow-drift
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const releaseRoot = join(root, "dist", "release", "packages");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const registry = argValue("--registry") ?? "https://registry.npmjs.org";
const otp = argValue("--otp");
const only = argValue("--only");
const publish = process.argv.includes("--publish");
const allowDrift = process.argv.includes("--allow-drift");
const tag = argValue("--tag") ?? "latest";

const order = releaseOrder();
const selected = only ? order.filter((x) => x === only) : order;
if (only && selected.length === 0) {
  console.error(`unknown --only=${only}，可选：${order.join(", ")}`);
  process.exit(2);
}

// 发布树是 stage-release 时刻的快照：之后源码再升版本，这里就是旧包。
// 发出去会变成「npm 上不是最新」，所以默认拦下来，要求先重建发布树。
if (!allowDrift) {
  const drift = versionDrift();
  if (drift.length > 0) {
    console.error("发布树与源码版本不一致，拒绝发布：");
    for (const d of drift) console.error(`  ${d.name}：发布树 ${d.release} / 源码 ${d.source}`);
    console.error("\n先重建发布树再发布：");
    console.error("  pnpm build && pnpm dist:shell && pnpm stage:release");
    console.error("确认要用这份旧快照时才加 --allow-drift。");
    process.exit(3);
  }
}

/** 逐个比对 dist/release/packages/<key> 与源码 package.json 的版本号。 */
function versionDrift() {
  const drift = [];
  for (const key of selected) {
    const releaseFile = join(releaseRoot, key, "package.json");
    if (!existsSync(releaseFile)) continue;
    const sourceFile =
      key === "host"
        ? join(root, "packages", "shell", "package.json")
        : join(root, "packages", "addons", key, "package.json");
    if (!existsSync(sourceFile)) continue;
    const released = JSON.parse(readFileSync(releaseFile, "utf8"));
    const source = JSON.parse(readFileSync(sourceFile, "utf8"));
    if (released.version !== source.version) {
      drift.push({ name: released.name ?? key, release: released.version, source: source.version });
    }
  }
  return drift;
}

/** 发布顺序以 stage-release 校验的 release.json 为准；缺失时拒绝猜测依赖顺序。 */
function releaseOrder() {
  const manifestFile = join(root, "dist", "release", "release.json");
  if (existsSync(manifestFile)) {
    const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
    if (Array.isArray(manifest.packages) && manifest.packages.length > 0) return manifest.packages;
  }
  throw new Error("缺少有效的 release.json 发布顺序，请先重新生成发布树");
}

function argValue(name) {
  const hit = process.argv.find((x) => x === name || x.startsWith(name + "="));
  if (!hit) return undefined;
  if (hit.includes("=")) return hit.slice(hit.indexOf("=") + 1);
  const i = process.argv.indexOf(hit);
  return process.argv[i + 1];
}
function run(args, cwd) {
  return spawnSync(npm, args, {
    cwd,
    stdio: "inherit",
    env: { ...process.env, npm_config_registry: registry },
  });
}
function npmView(spec) {
  const r = spawnSync(npm, ["view", spec, "version", "--registry", registry], {
    encoding: "utf8",
    env: { ...process.env, npm_config_registry: registry },
  });
  if (r.status !== 0) return null;
  return r.stdout.trim() || null;
}

const packages = [];
for (const key of selected) {
  const dir = join(releaseRoot, key);
  const pkgFile = join(dir, "package.json");
  if (!existsSync(pkgFile)) {
    console.error(`缺少发布目录：${dir}；请先运行 node scripts/stage-release.mjs`);
    process.exit(2);
  }
  const pkg = JSON.parse(readFileSync(pkgFile, "utf8"));
  packages.push({ key, dir, pkg });
}

console.log(`npm registry: ${registry}`);
console.log(`mode: ${publish ? "publish" : "dry-run"}，dist-tag: ${tag}`);

if (publish) {
  const who = spawnSync(npm, ["whoami", "--registry", registry], {
    encoding: "utf8",
    env: { ...process.env, npm_config_registry: registry },
  });
  if (who.status !== 0) {
    console.error("npm 未登录。请先运行：");
    console.error(`  npm login --registry=${registry}`);
    process.exit(1);
  }
  console.log(`logged in as: ${who.stdout.trim()}`);
}

for (const item of packages) {
  const spec = `${item.pkg.name}@${item.pkg.version}`;
  console.log(`\n=== ${spec}`);
  const existing = npmView(spec);
  if (existing) {
    console.log(`已存在 ${spec}，跳过`);
    continue;
  }
  const args = ["publish", "--access", "public", "--tag", tag, "--registry", registry];
  if (!publish) args.push("--dry-run");
  if (otp) args.push("--otp", otp);
  const r = run(args, item.dir);
  if (r.status !== 0) {
    console.error(`${spec} ${publish ? "发布" : "dry-run"} 失败，退出码 ${r.status}`);
    process.exit(r.status || 1);
  }
  if (publish) console.log(`已发布 ${spec}`);
}

console.log(publish ? "\n全部完成。" : "\ndry-run 全部完成；确认无误后加 --publish。");
