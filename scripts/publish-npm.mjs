#!/usr/bin/env node
/**
 * 发布 dist/release/packages 下的四个包到 npm。
 *
 * 默认只做 dry-run（npm publish --dry-run），确认无误后加 --publish。
 * 宿主必须先发布，业务包依赖它的版本。
 *
 * 例：
 *   node scripts/publish-npm.mjs
 *   node scripts/publish-npm.mjs --publish
 *   node scripts/publish-npm.mjs --publish --otp=123456
 *   node scripts/publish-npm.mjs --only=host --publish
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
const tag = argValue("--tag") ?? "latest";

const order = ["host", "tasks", "tags", "sites", "storage", "message"];
const selected = only ? order.filter((x) => x === only) : order;
if (only && selected.length === 0) {
  console.error(`unknown --only=${only}，可选：${order.join(", ")}`);
  process.exit(2);
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
