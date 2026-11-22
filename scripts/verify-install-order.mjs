#!/usr/bin/env node
/**
 * 复现并验证「安装顺序」不再触发冲突：在全新 profile 里按用户踩坑的顺序装
 * 先宿主、再子插件、再第二个子插件（含 vault → mail 这条踩坑顺序），每步都读
 * profile 与 dump-config 断言结果。
 *
 * 背景：宿主 `dsh-workbench` 是子包的传递依赖，DSH 只把 profile 的直接依赖选进
 * `dsh.profile.bundles`，所以单独装子插件时宿主不会被自动选入，必须由子插件的 patch
 * 插一行宿主（见 docs/AGENTS规范/03-安装与交付.md）。子插件的宿主行若写成块式，
 * 插件市场会把它算进该子插件的 insertedIds，第二个 workbench 系插件一装就被判
 * 「和已安装的插件冲突」并整次回滚。本脚本验证改过 patch 之后，三种顺序都能装上。
 *
 * 用法：
 *   node scripts/verify-install-order.mjs                      # 用 dist/release 发布树安装（file:）
 *   node scripts/verify-install-order.mjs --npm                # 用 npm 上的正式包安装
 *   node scripts/verify-install-order.mjs --keep               # 保留临时 profile 便于手工看
 *   node scripts/verify-install-order.mjs --cli <dsh 可执行文件>
 *
 * 退出码：0 通过；1 有断言失败；2 参数/环境错误。
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PROFILES = join(homedir(), ".dsh", "profiles");
const RELEASE = join(ROOT, "dist", "release", "packages");
const DEFAULT_CLI = "/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh";

const failures = [];
function check(ok, message) {
  if (!ok) failures.push(message);
  return ok;
}

function parseArgs(argv) {
  const opts = { cli: process.env.DSH_CLI || DEFAULT_CLI, npm: false, source: false, keep: false, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--cli") opts.cli = argv[++i];
    else if (arg === "--npm") opts.npm = true;
    else if (arg === "--source") opts.source = true;
    else if (arg === "--keep") opts.keep = true;
    else if (arg === "--help" || arg === "-h") opts.help = true;
    else throw new Error(`未知参数 ${arg}`);
  }
  return opts;
}

function run(cli, args) {
  return execFileSync(cli, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

/** 安装源：--source 用源码目录（依赖是 file:，不需要 registry），默认用发布树，--npm 用 registry。 */
function specOf(name, opts) {
  if (opts.npm) return name === "host" ? "dsh-workbench-host" : `dsh-workbench-${name}`;
  if (opts.source) {
    return `file:${name === "host" ? join(ROOT, "packages", "shell-dist") : join(ROOT, "packages", "addons", name)}`;
  }
  const dir = join(RELEASE, name);
  if (!existsSync(join(dir, "package.json"))) {
    throw new Error(`发布树里没有 ${name}：先跑 pnpm build && pnpm dist:shell && pnpm stage:release`);
  }
  return `file:${dir}`;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log("用法：node scripts/verify-install-order.mjs [--source|--npm] [--keep] [--cli <dsh>]");
    return;
  }
  if (!existsSync(opts.cli)) throw new Error(`找不到 dsh 可执行文件：${opts.cli}`);

  const stamp = Date.now().toString(36).slice(-5);
  const profile = `wb-order-${stamp}`;
  const profileDir = join(PROFILES, profile);

  // 1) 全新 profile：与用户手工建 profile 的路径一致。
  rmSync(profileDir, { recursive: true, force: true });
  try {
    run(opts.cli, ["--profile", profile, "--from-default-profile", "web", "--dump-config"]);
  } catch (error) {
    console.error(`创建 profile 失败：${String(error.stdout || error.message).slice(0, 400)}`);
    process.exitCode = 2;
    return;
  }
  console.log(`临时 profile：${profileDir}`);

  // 2) 按用户踩坑的顺序安装：宿主 → 第一个子插件 → 第二个子插件。
  const steps = [
    { title: "先装宿主", spec: specOf("host", opts), expectBundles: ["host"], expectRows: ["workbench"] },
    { title: "再装 tasks", spec: specOf("tasks", opts), expectBundles: ["host", "tasks"], expectRows: ["workbench", "workbench-tasks"] },
    {
      title: "再装 sites",
      spec: specOf("sites", opts),
      expectBundles: ["host", "tasks", "sites"],
      expectRows: ["workbench", "workbench-tasks", "workbench-sites"],
    },
    // 用户踩过的第二个坑：mail 的 patch 里还有一行保险箱（workbench-vault），
    // 先装 vault 再装 mail 时两行共享行不能互相判冲突。
    {
      title: "再装 vault",
      spec: specOf("vault", opts),
      expectBundles: ["host", "tasks", "sites", "vault"],
      expectRows: ["workbench", "workbench-tasks", "workbench-sites", "workbench-vault"],
    },
    {
      title: "再装 mail",
      spec: specOf("mail", opts),
      expectBundles: ["host", "tasks", "sites", "vault", "mail"],
      expectRows: ["workbench", "workbench-tasks", "workbench-sites", "workbench-vault", "workbench-mail"],
    },
  ];

  for (const step of steps) {
    try {
      const out = run(opts.cli, ["plugin", "--profile", profile, "add", step.spec]);
      console.log(`\n[${step.title}] 安装成功：${out.trim().split("\n").slice(-1)[0]}`);
    } catch (error) {
      check(false, `${step.title}：安装失败 ${String(error.stdout || error.message).slice(0, 400)}`);
      continue;
    }

    const manifest = readJson(join(profileDir, "package.json"));
    const bundles = manifest.dsh?.profile?.bundles ?? [];
    // 源码目录里的宿主包还叫 dsh-workbench，发布树与 npm 上叫 dsh-workbench-host。
    const expectedNames = step.expectBundles.map((key) => {
      if (key !== "host") return `dsh-workbench-${key}`;
      return opts.source ? "dsh-workbench" : "dsh-workbench-host";
    });
    const missing = expectedNames.filter((name) => !bundles.includes(name));
    check(missing.length === 0, `${step.title}：bundles 缺 ${missing.join("、")}（实际 ${bundles.join(" + ")}）`);

    const config = run(opts.cli, ["--profile", profile, "--dump-config"]);
    const missingRows = step.expectRows.filter((id) => !new RegExp(`-\\s+id:\\s*${id}\\s*$`, "m").test(config));
    check(missingRows.length === 0, `${step.title}：dump-config 缺插件行 ${missingRows.join("、")}`);
    console.log(`  bundles：${bundles.join(" + ")}`);
    console.log(`  插件行：${step.expectRows.join(" + ")}`);
  }

  if (!opts.keep) rmSync(profileDir, { recursive: true, force: true });

  if (failures.length > 0) {
    console.error(`\n失败 ${failures.length} 项：`);
    for (const message of failures) console.error(`- ${message}`);
    process.exitCode = 1;
    return;
  }
  console.log("\n通过：先宿主、后两个子插件，三种顺序都装得上且插件行齐全。");
}

main().catch((error) => {
  console.error(`脚本自身出错：${error.stack ?? error.message}`);
  process.exitCode = 2;
});
