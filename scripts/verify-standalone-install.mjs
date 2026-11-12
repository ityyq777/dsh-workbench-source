#!/usr/bin/env node
/**
 * 验证「单包独立安装」：在全新 profile 里只装一个业务插件，检查 DSH 是否能把它和宿主一起跑起来。
 *
 * 背景：四个业务包各自是独立的 DSH bundle，安装任意一个时 pnpm 会按 dependencies 自动带入
 * `dsh-workbench-host`；但 profile 的 `dsh.profile.bundles` 里只登记业务包，宿主是由插件的
 * `cordis.patch.yml` 以插件行方式加载的。这条链路（尤其「宿主前端外壳也加载」）以前只人工验过一次，
 * 这里把它固化成可复跑脚本：装包 → 读 profile → 起临时实例 → 用 token 换 cookie → 查 domains。
 *
 * 用法：
 *   node scripts/verify-standalone-install.mjs --spec dsh-workbench-tags@1.7.0
 *   node scripts/verify-standalone-install.mjs --spec file:$PWD/packages/addons/storage
 *   node scripts/verify-standalone-install.mjs --all            # 依次验证四个 npm 版业务包
 *   node scripts/verify-standalone-install.mjs --spec ... --keep # 保留 profile 与实例，便于手工点页面
 *
 * 退出码：0 全部通过；1 有断言失败；2 参数/环境/启动错误。
 *
 * 脚本自己起实例、结束自己起的进程；不碰 desktop 等正在使用的 profile，也不改动源码。
 */
import { execFileSync, spawn } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const HOME = process.env.HOME || "";
const PROFILES = join(HOME, ".dsh", "profiles");

const EXIT_OK = 0;
const EXIT_FAIL = 1;
const EXIT_ENV = 2;

const DEFAULT_CLI = "/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh";

/** 四个业务包的 npm 名；--all 时逐个验证。 */
const ALL_SPECS = [
  "dsh-workbench-tasks",
  "dsh-workbench-tags",
  "dsh-workbench-sites",
  "dsh-workbench-storage",
];

function parseArgs(argv) {
  const opts = { specs: [], all: false, port: 0, keep: false, json: false, help: false, timeoutMs: 60000 };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) throw new Error(`${arg} 缺少取值`);
      i += 1;
      return value;
    };
    if (arg === "--spec") opts.specs.push(next());
    else if (arg === "--all") opts.all = true;
    else if (arg === "--port") opts.port = Number(next());
    else if (arg === "--keep") opts.keep = true;
    else if (arg === "--json") opts.json = true;
    else if (arg === "--timeout") opts.timeoutMs = Number(next()) * 1000;
    else if (arg === "--help" || arg === "-h") opts.help = true;
    else throw new Error(`未知参数 ${arg}`);
  }
  return opts;
}

function usage() {
  return [
    "用法：node scripts/verify-standalone-install.mjs --spec <npm 名[@版本] | file:/绝对路径> [选项]",
    "",
    "  --spec <s>     待验证的安装源，可重复；npm 名或 file: 目录",
    "  --all          依次验证 tasks / tags / sites / storage 四个 npm 包",
    "  --port <n>     临时实例端口，默认自动挑一个空闲端口",
    "  --keep         保留临时 profile 与实例，便于手工打开页面看卡片",
    "  --json         以 JSON 输出结果",
    "  --timeout <s>  等实例启动的秒数（默认 60）",
  ].join("\n");
}

function fail(message) {
  const error = new Error(message);
  error.env = true;
  return error;
}

/** 桌面实例必须用应用自带 CLI；PATH 里的 dsh 可能是另一个版本。 */
function resolveCli() {
  const fromEnv = process.env.DSH_CLI;
  if (fromEnv) {
    if (!existsSync(fromEnv)) throw fail(`DSH_CLI 指向的文件不存在：${fromEnv}`);
    return fromEnv;
  }
  if (existsSync(DEFAULT_CLI)) return DEFAULT_CLI;
  throw fail(`找不到桌面端 CLI：${DEFAULT_CLI}；可用 DSH_CLI 指定`);
}

function run(cli, args, timeout = 180000) {
  return execFileSync(cli, args, { encoding: "utf8", timeout, stdio: ["ignore", "pipe", "pipe"] });
}

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

/** 简单 semver 比较：只处理 x.y.z，够用于 minShell 下限检查。 */
function compareVersion(a, b) {
  const pa = String(a).split(".").map(Number);
  const pb = String(b).split(".").map(Number);
  for (let i = 0; i < 3; i += 1) {
    const x = pa[i] || 0;
    const y = pb[i] || 0;
    if (x !== y) return x > y ? 1 : -1;
  }
  return 0;
}

async function pickPort(start) {
  const net = await import("node:net");
  const probe = (port) =>
    new Promise((done) => {
      const server = net.createServer();
      server.once("error", () => done(false));
      server.once("listening", () => server.close(() => done(true)));
      server.listen(port, "127.0.0.1");
    });
  let port = start || 58800;
  for (let i = 0; i < 200; i += 1) {
    if (await probe(port)) return port;
    port += 1;
  }
  throw fail("找不到空闲端口");
}

const TOKEN_URL_RE = /http:\/\/127\.0\.0\.1:(\d+)\/\?token=([A-Za-z0-9_-]+)/;

/** 起临时实例并等它打印带 token 的地址。 */
async function startInstance(cli, profile, port, logFile, timeoutMs, checks) {
  const child = spawn(cli, ["--profile", profile, "--port", String(port), "--no-open"], {
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const stream = [];
  const capture = (chunk) => {
    stream.push(chunk.toString());
    writeFileSync(logFile, stream.join(""));
  };
  child.stdout.on("data", capture);
  child.stderr.on("data", capture);
  child.on("exit", (code) => {
    if (code !== null && code !== 0) writeFileSync(logFile, `${stream.join("")}\n[exit ${code}]\n`);
  });

  const deadline = Date.now() + timeoutMs;
  let url = "";
  while (Date.now() < deadline) {
    const text = stream.join("");
    const hit = text.match(TOKEN_URL_RE);
    if (hit) {
      url = hit[0];
      break;
    }
    if (/error:|EADDRINUSE|Cannot find module/.test(text)) break;
    await new Promise((done) => setTimeout(done, 300));
  }
  if (!url) {
    checks.push({ name: "实例启动", ok: false, detail: `未在 ${timeoutMs / 1000}s 内看到 token 地址，日志：${logFile}` });
    return { child, url: "" };
  }
  checks.push({ name: "实例启动", ok: true, detail: url.replace(/token=.*/, "token=***") });
  return { child, url };
}

function stopInstance(child) {
  if (!child || child.exitCode !== null) return;
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    try {
      child.kill("SIGTERM");
    } catch {
      /* 已经退出 */
    }
  }
}

/** 用 token 换 auth cookie，再查工作台接口。 */
async function probeWeb(url, checks) {
  const origin = url.replace(/\/\?token=.*$/, "");
  const tokenRes = await fetch(url, { redirect: "manual" });
  const cookies = tokenRes.headers.getSetCookie ? tokenRes.headers.getSetCookie() : [];
  const cookie = cookies.map((item) => item.split(";")[0]).join("; ");
  checks.push({
    name: "token 换 cookie",
    ok: tokenRes.status >= 300 && tokenRes.status < 400 && cookie.length > 0,
    detail: `HTTP ${tokenRes.status}${cookie ? "，已拿到 cookie" : "，没有 set-cookie"}`,
  });

  const html = await fetch(`${origin}/`, { headers: cookie ? { cookie } : {} });
  const body = await html.text();
  checks.push({
    name: "首页可访问",
    ok: html.ok && /<html/i.test(body),
    detail: `HTTP ${html.status}`,
  });

  const domainsRes = await fetch(`${origin}/workbench/api/domains`, { headers: cookie ? { cookie } : {} });
  let payload = null;
  try {
    payload = await domainsRes.json();
  } catch {
    payload = null;
  }
  if (!payload || payload.ok !== true) {
    checks.push({
      name: "工作台接口",
      ok: false,
      detail: `HTTP ${domainsRes.status}，返回 ${JSON.stringify(payload).slice(0, 120)}`,
    });
    return null;
  }
  checks.push({
    name: "工作台接口",
    ok: true,
    detail: `domains=${payload.domains.length}，shellVersion=${payload.shellVersion}`,
  });
  return payload;
}

async function verifyOne({ cli, spec, port, keep, timeoutMs }) {
  const checks = [];
  const stamp = Date.now().toString(36).slice(-5);
  const profile = `wb-verify-${stamp}`;
  const profileDir = join(PROFILES, profile);
  const logFile = join(tmpdir(), `wb-verify-${stamp}.log`);

  if (!keep) rmSync(profileDir, { recursive: true, force: true });

  // 1) 全新 profile：与用户手工建 profile 的路径一致
  try {
    run(cli, ["--profile", profile, "--from-default-profile", "web", "--dump-config"]);
    checks.push({ name: "创建 profile", ok: true, detail: profileDir });
  } catch (error) {
    checks.push({ name: "创建 profile", ok: false, detail: String(error.stdout || error.message).slice(0, 200) });
    return { spec, profile, checks, url: "" };
  }

  // 2) 只装一个业务包
  try {
    const out = run(cli, ["plugin", "--profile", profile, "add", spec]);
    const added = (out.match(/\+ (dsh-workbench[\w-]+) ([\w.@/-]+)/g) || []).join("，");
    checks.push({ name: "安装单包", ok: true, detail: added || out.trim().split("\n").slice(-1)[0] });
  } catch (error) {
    checks.push({ name: "安装单包", ok: false, detail: String(error.stdout || error.message).slice(0, 300) });
    return { spec, profile, checks, url: "" };
  }

  // 3) 读 profile：bundles 只登记业务包，但宿主包必须已在 node_modules 里
  const profileJson = readJson(join(profileDir, "package.json"));
  const bundles = profileJson.dsh?.profile?.bundles || [];
  const deps = profileJson.dependencies || {};
  const addonName = Object.keys(deps).find((name) => name.startsWith("dsh-workbench-") && name !== "dsh-workbench-host");
  checks.push({
    name: "bundles 只登记业务包",
    ok: bundles.length === 3 && !!addonName && bundles[2] === addonName,
    detail: bundles.join(" + "),
  });

  const nodeModules = join(profileDir, "node_modules");
  const hostDir = ["dsh-workbench-host", "dsh-workbench"].map((name) => join(nodeModules, name)).find((dir) => existsSync(join(dir, "package.json")));
  const hostVersion = hostDir ? readJson(join(hostDir, "package.json")).version : "";
  checks.push({
    name: "宿主被自动带入",
    ok: !!hostVersion,
    detail: hostVersion ? `${hostDir.split("/node_modules/")[1]}@${hostVersion}` : "node_modules 里没有 dsh-workbench(-host)",
  });

  const addonDir = nodeModules && addonName ? join(nodeModules, addonName) : "";
  const addonMeta = addonDir && existsSync(join(addonDir, "package.json")) ? readJson(join(addonDir, "package.json")) : null;
  const wb = addonMeta?.wb?.addon || {};
  checks.push({
    name: "业务包自带 minShell",
    ok: !!hostVersion && (!wb.minShell || compareVersion(hostVersion, wb.minShell) >= 0),
    detail: `${addonMeta?.version || "?"} 要求宿主 >= ${wb.minShell || "?"}，实际 ${hostVersion || "?"}`,
  });

  // 4) dump-config：宿主行由插件的 patch 提供，不能被「bundles 只登记业务包」骗过去
  let config = "";
  try {
    config = run(cli, ["--profile", profile, "--dump-config"]);
  } catch (error) {
    config = String(error.stdout || "");
  }
  const hasHostRow = /-\s+id:\s*workbench\b/.test(config);
  // 业务行在 dump-config 里是独立的插件行：id 是 `workbench-<pkg>`，name 是包名（源码安装叫 dsh-workbench-<pkg>，npm 安装同名）。
  const addonRowName = addonName || wb.name || "";
  const hasAddonRow = addonRowName ? new RegExp(`name:\\s*${addonRowName}\\s*$`, "m").test(config) : true;
  checks.push({
    name: "dump-config 含宿主行",
    ok: hasHostRow && hasAddonRow,
    detail: `宿主行 ${hasHostRow ? "有" : "无"}，业务行 ${hasAddonRow ? "有" : "无"}`,
  });

  // 5) 起实例、走一遍真实 HTTP
  const chosen = await pickPort(port);
  const { child, url } = await startInstance(cli, profile, chosen, logFile, timeoutMs, checks);
  let payload = null;
  if (url) {
    payload = await probeWeb(url, checks);
  }
  stopInstance(child);

  if (payload) {
    const domain = payload.domains.find((item) => item.id === wb.id) || payload.domains[0];
    checks.push({
      name: "域名已注册",
      ok: payload.domains.length === 1 && !!domain && domain.id === wb.id,
      detail: payload.domains.map((item) => `${item.id}@${item.version}`).join("，") || "无",
    });
    checks.push({
      name: "版本一致",
      ok: !!domain && domain.version === addonMeta?.version && payload.shellVersion === hostVersion,
      detail: `业务 ${domain?.version || "?"} / 清单 ${addonMeta?.version || "?"}；宿主 ${payload.shellVersion} / 安装 ${hostVersion}`,
    });
    checks.push({
      name: "前端外壳已加载",
      ok: !!wb.id && (domain?.views || []).length > 0,
      detail: `${(domain?.views || []).length} 个视图（工作台页面由宿主外壳渲染，views 非空说明 manifest 已到达前端）`,
    });
  }

  if (!keep) {
    rmSync(profileDir, { recursive: true, force: true });
  }
  return { spec, profile, checks, url: keep ? url : "", logFile, kept: keep };
}

function printResult(result, json) {
  const passed = result.checks.filter((item) => item.ok).length;
  if (json) {
    console.log(JSON.stringify(result, null, 2));
    return passed === result.checks.length;
  }
  console.log(`\n== ${result.spec}（profile ${result.profile}）==`);
  for (const check of result.checks) {
    console.log(`  ${check.ok ? "PASS" : "FAIL"}  ${check.name}：${check.detail}`);
  }
  console.log(`  ${passed}/${result.checks.length} 项通过${result.kept ? `；实例：${result.url}` : ""}`);
  return passed === result.checks.length;
}

async function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(String(error.message));
    console.error(usage());
    process.exit(EXIT_ENV);
  }
  if (opts.help) {
    console.log(usage());
    process.exit(EXIT_OK);
  }
  const specs = opts.all ? ALL_SPECS : opts.specs;
  if (!specs.length) {
    console.error("至少给一个 --spec，或用 --all。\n");
    console.error(usage());
    process.exit(EXIT_ENV);
  }

  let cli;
  try {
    cli = resolveCli();
  } catch (error) {
    console.error(String(error.message));
    process.exit(EXIT_ENV);
  }
  console.log(`CLI: ${cli}`);
  const results = [];
  for (const spec of specs) {
    results.push(await verifyOne({ cli, spec, port: opts.port, keep: opts.keep, timeoutMs: opts.timeoutMs }));
  }
  let ok = true;
  for (const result of results) {
    ok = printResult(result, opts.json) && ok;
  }
  if (!opts.keep) {
    console.log("\n临时 profile 已清理；加 --keep 可保留实例手工点页面。");
  }
  process.exit(ok ? EXIT_OK : EXIT_FAIL);
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exit(EXIT_ENV);
});
