#!/usr/bin/env node
/**
 * 把 dist/release 同步到 GitHub 发布镜像（ityyq777/dsh-workbench）。
 *
 * 主仓库是源码 monorepo，发布镜像只有 dist/release 的产物，两者历史无关；
 * 所以绝不要在源码仓库里 git push 到镜像。本脚本在独立工作区（默认
 * ~/.dsh/workbench/release-mirror）里 checkout 镜像 main、覆盖发布树、提交并推送。
 *
 * 默认只做 dry-run（显示将要提交的变更），确认后加 --publish。
 *
 * 例：
 *   node scripts/publish-github.mjs
 *   node scripts/publish-github.mjs --publish
 *   node scripts/publish-github.mjs --publish --message="release: plugins 0.3.0"
 *
 * token 从 ~/.dsh/workbench/github-token（0600）读取，只通过临时 GIT_ASKPASS
 * 传给 git，不写进 remote URL、git config、argv 或日志。
 */
import { spawnSync } from "node:child_process";
import { chmodSync, cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const releaseRoot = join(root, "dist", "release");
const OWNER = process.env.GITHUB_OWNER ?? "ityyq777";
const REPO = process.env.GITHUB_REPO ?? "dsh-workbench";
const REPO_URL = argValue("--url") ?? `https://github.com/${OWNER}/${REPO}.git`;
const tokenFile = argValue("--token-file") ?? join(homedir(), ".dsh", "workbench", "github-token");
const mirrorDir = argValue("--dir") ?? join(homedir(), ".dsh", "workbench", "release-mirror");
const publish = process.argv.includes("--publish");
const branch = "main";

function argValue(name) {
  const hit = process.argv.find((x) => x === name || x.startsWith(name + "="));
  if (!hit) return undefined;
  if (hit.includes("=")) return hit.slice(hit.indexOf("=") + 1);
  const i = process.argv.indexOf(hit);
  return process.argv[i + 1];
}
function git(args, cwd, env) {
  return spawnSync("git", args, { cwd, encoding: "utf8", env: { ...process.env, ...env } });
}
function gitOk(args, cwd, env) {
  const r = git(args, cwd, env);
  if (r.status !== 0) {
    console.error(`git ${args.join(" ")} 失败：`);
    console.error((r.stderr || r.stdout || "").trim());
    process.exit(r.status || 1);
  }
  return (r.stdout || "").trim();
}

if (!existsSync(join(releaseRoot, "packages", "host", "package.json"))) {
  console.error(`缺少发布树：${releaseRoot}；请先运行 pnpm stage:release`);
  process.exit(2);
}
const hostPkg = JSON.parse(readFileSync(join(releaseRoot, "packages", "host", "package.json"), "utf8"));
const message = argValue("--message") ?? `release: workbench plugins ${hostPkg.version}`;

const token = publish ? readFileSync(tokenFile, "utf8").trim() : "";
if (publish && !token) {
  console.error(`读取不到 GitHub token：${tokenFile}`);
  process.exit(1);
}

// 1. 准备镜像工作区：只放产物，remote 永远用不带凭据的 URL。
if (!existsSync(join(mirrorDir, ".git"))) {
  console.log(`克隆发布镜像到 ${mirrorDir}`);
  const parent = join(mirrorDir, "..");
  rmSync(mirrorDir, { recursive: true, force: true });
  gitOk(["clone", REPO_URL, mirrorDir], parent);
}
gitOk(["remote", "set-url", "origin", REPO_URL], mirrorDir);
gitOk(["fetch", "origin", branch, "--prune"], mirrorDir);
gitOk(["checkout", "-B", branch, `origin/${branch}`], mirrorDir);
gitOk(["reset", "--hard", `origin/${branch}`], mirrorDir);

// 2. 用 dist/release 覆盖工作区（保留 .git），删掉发布树里已不存在的条目。
const sourceEntries = readdirSync(releaseRoot);
for (const name of readdirSync(mirrorDir)) {
  if (name === ".git") continue;
  if (!sourceEntries.includes(name)) rmSync(join(mirrorDir, name), { recursive: true, force: true });
}
for (const name of sourceEntries) {
  rmSync(join(mirrorDir, name), { recursive: true, force: true });
  cpSync(join(releaseRoot, name), join(mirrorDir, name), {
    recursive: true,
    filter: (p) => !/[\\/](node_modules|\.git|\.DS_Store)$/.test(p) && !p.endsWith(".tgz"),
  });
}

// 3. 看差异。
const status = gitOk(["status", "--porcelain"], mirrorDir);
const versions = ["host", "tasks", "tags", "sites", "storage", "message"]
  .map((k) => {
    const p = JSON.parse(readFileSync(join(mirrorDir, "packages", k, "package.json"), "utf8"));
    return `${p.name}@${p.version}`;
  })
  .join(", ");

console.log(`镜像：${OWNER}/${REPO}（${branch}）`);
console.log(`工作区：${mirrorDir}`);
console.log(`发布树版本：${versions}`);
console.log(`mode: ${publish ? "publish" : "dry-run"}`);

if (!status) {
  console.log(`\n与 ${OWNER}/${REPO}@${branch} 无差异，无需推送。`);
  process.exit(0);
}
console.log(`\n将要提交的变更：\n${status}`);

if (!publish) {
  console.log("\ndry-run 结束；确认无误后加 --publish。");
  process.exit(0);
}

// 4. 提交并推送。token 只经临时 askpass 进场，不落盘、不进 argv。
const askDir = mkdtempSync(join(tmpdir(), "wb-git-"));
const askpass = join(askDir, "askpass.sh");
writeFileSync(
  askpass,
  `#!/bin/sh\ncase "$1" in\n  *[Uu]sername*) printf '%s\\n' "${OWNER}" ;;\n  *) printf '%s\\n' "${token}" ;;\nesac\n`,
);
chmodSync(askpass, 0o700);
try {
  const env = { GIT_ASKPASS: askpass, GIT_TERMINAL_PROMPT: "0" };
  gitOk(["add", "-A"], mirrorDir);
  gitOk(["commit", "-m", message], mirrorDir);
  const head = gitOk(["rev-parse", "--short", "HEAD"], mirrorDir);
  gitOk(["push", "origin", `${branch}:${branch}`], mirrorDir, env);
  console.log(`\n已推送 ${head} 到 ${OWNER}/${REPO}@${branch}`);
  console.log(`确认：https://github.com/${OWNER}/${REPO}/commit/${head}`);
} finally {
  rmSync(askDir, { recursive: true, force: true });
}
