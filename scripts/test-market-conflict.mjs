#!/usr/bin/env node
/**
 * 校验 dsh-workbench 各包的 `cordis.patch.yml` 不会再被插件市场判成「和已安装的插件冲突」，
 * 同时不破坏「只装一个子插件也能起来」。
 *
 * 背景（详见 docs/AGENTS规范/03-安装与交付.md）：
 * - 宿主 `dsh-workbench` 是子包的传递依赖，DSH 只把 profile 的直接依赖选进 `dsh.profile.bundles`，
 *   所以单独装一个子插件时宿主不会被自动选入，必须由子插件的 patch 插一行宿主才能加载；
 * - 但插件市场（dsh-market `lib/profile.js` 的 `conflictingEntryIds`）在安装后会把
 *   「新包 patch 里 insert 的 loader id」和「已装 bundle 的 insert id」求交集，命中就整次回滚。
 *   宿主行若写成块式（`- id: workbench` 独占一行），就会被算进每个子包的 insertedIds，
 *   于是任何第二个 workbench 系插件安装必失败 —— 用户报的就是这个；
 * - 因此共享行（宿主行、邮件的保险箱行）写成流式（flow style）：js-yaml 与 DSH 解析结果相同，
 *   市场那套逐行正则认不出来。
 *
 * 例外：自动化兼容保留包（dsh-workbench-automation 0.5.1 起）不插入任何行 —— 它的 patch 插了
 * 必然存活的宿主行，桌面端 removeBundle 就会永远判 `bundle-in-use`，所以这里要求它零行。
 *
 * 本脚本守四条：
 *   1. 每个子包的 patch 仍以 YAML 语义插入宿主行（独立安装可用），邮件仍插入保险箱行；
 *   2. 共享行必须是流式写法（块式会重新引爆市场冲突）；
 *   3. 自动化兼容保留包不得插入任何行（否则桌面端移不掉它）；
 *   4. 各包在市场眼里的 insertedIds 两两不相交（市场装得上）。
 *
 * 用法：
 *   node scripts/test-market-conflict.mjs            # 校验源码树
 *   node scripts/test-market-conflict.mjs --release  # 额外校验 dist/release 发布树
 *
 * 退出码：0 通过；1 有断言失败；2 环境问题。
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const ADDONS = join(ROOT, "packages", "addons");
const SHELL_DIST = join(ROOT, "packages", "shell-dist");
const RELEASE = join(ROOT, "dist", "release", "packages");

/** 共享行 id：这些行由多个包各自插入，市场不允许它们互相看得见。 */
const SHARED_IDS = new Set(["workbench", "workbench-host", "workbench-vault"]);

const failures = [];
function check(ok, message) {
  if (!ok) failures.push(message);
  return ok;
}

/**
 * 极简解析：本仓库的 patch 只有「一个顶层 insert 列表 + 每行一个简单映射」这一种形状，
 * 因此不用引 js-yaml 也能拿到两套 id —— 块式行（市场数得到）与流式行（市场数不到）。
 * @returns {{ blockIds: string[], flowIds: string[] }}
 */
function parseInsertRows(text) {
  const blockIds = [];
  const flowIds = [];
  let insertIndent = null;
  for (const raw of text.split(/\r?\n/u)) {
    if (raw.trim().startsWith("#") || raw.trim() === "") continue;
    const indent = raw.length - raw.trimStart().length;
    if (insertIndent !== null && indent <= insertIndent && !/^\s*-\s/u.test(raw)) insertIndent = null;
    if (/^\s*-\s*insert:\s*$/u.test(raw)) {
      insertIndent = indent;
      continue;
    }
    if (insertIndent === null) continue;
    const flow = /^\s*-\s*\{(?<body>.*)\}\s*$/u.exec(raw);
    if (flow) {
      for (const part of flow.groups.body.split(",")) {
        const hit = /^\s*id:\s*['"]?(?<id>[\w.@/-]+)['"]?\s*$/u.exec(part);
        if (hit) flowIds.push(hit.groups.id);
      }
      continue;
    }
    const block = /^\s*-\s*id:\s*['"]?(?<id>[\w.@/-]+)['"]?\s*$/u.exec(raw);
    if (block) blockIds.push(block.groups.id);
  }
  return { blockIds, flowIds };
}

/** 读包声明的 patch 文件；读不到时返回空数组（调用方自己断言是否该有）。 */
function patchFiles(dir) {
  const manifestPath = join(dir, "package.json");
  if (!existsSync(manifestPath)) return [];
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const declared = manifest.dsh?.bundle?.patch;
  const list = Array.isArray(declared) ? declared : declared ? [declared] : [];
  return list.map((entry) => join(dir, entry)).filter((file) => existsSync(file));
}

function profileDirs() {
  const dir = join(homedir(), ".dsh", "profiles");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .map((name) => join(dir, name))
    .filter((profile) => existsSync(join(profile, "package.json")));
}

/** 已安装的 dsh-market 模块入口；没装就返回 null（脚本降级为结构校验）。 */
function findMarket() {
  for (const profile of profileDirs()) {
    const entry = join(profile, "node_modules", "dshmarket", "lib", "profile.js");
    if (existsSync(entry)) return entry;
  }
  return null;
}

/** 包名对应的自有 loader id：`dsh-workbench` → `workbench`，`dsh-workbench-tasks` → `workbench-tasks`。 */
function ownRowId(packageName) {
  if (packageName === "dsh-workbench" || packageName === "dsh-workbench-host") return "workbench";
  return packageName.startsWith("dsh-workbench-") ? `workbench-${packageName.slice("dsh-workbench-".length)}` : null;
}

/** 不插入任何 loader 行的兼容保留包：插了必存活的行就会被桌面端判 bundle-in-use。 */
const ZERO_ROW_PACKAGES = new Set(["dsh-workbench-automation"]);

/** 一个子包必须仍然插入的共享行。 */
function requiredSharedRows(packageName) {
  if (ZERO_ROW_PACKAGES.has(packageName)) return [];
  const rows = [{ id: "workbench", why: "宿主行：单独装子插件时靠它加载宿主" }];
  if (packageName === "dsh-workbench-mail") {
    rows.push({ id: "workbench-vault", why: "保险箱行：邮件依赖保险箱，邮件自己把它带进来" });
  }
  return rows;
}

/** 待校验的包：源码树始终检查；发布树按需检查（宿主在发布树里叫 dsh-workbench-host）。 */
function collectPackages(includeRelease) {
  const packages = [{ dir: SHELL_DIST, label: "packages/shell-dist", isAddon: false, tree: "source" }];
  for (const name of readdirSync(ADDONS).sort()) {
    const dir = join(ADDONS, name);
    if (!existsSync(join(dir, "package.json"))) continue;
    packages.push({ dir, label: `packages/addons/${name}`, isAddon: true, tree: "source" });
  }
  if (includeRelease) {
    if (!existsSync(RELEASE)) {
      throw new Error("dist/release/packages 不存在：先跑 pnpm build && pnpm dist:shell && pnpm stage:release");
    }
    for (const name of readdirSync(RELEASE).sort()) {
      const dir = join(RELEASE, name);
      if (!existsSync(join(dir, "package.json"))) continue;
      packages.push({ dir, label: `dist/release/packages/${name}`, isAddon: name !== "host", tree: "release" });
    }
  }
  return packages;
}

async function main() {
  const includeRelease = process.argv.includes("--release");
  const marketEntry = findMarket();
  const market = marketEntry ? await import(pathToFileURL(marketEntry).href) : null;

  const report = [];
  const marketIds = new Map();

  for (const { dir, label, isAddon, tree } of collectPackages(includeRelease)) {
    const manifest = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    const files = patchFiles(dir);
    check(files.length > 0, `${label}：package.json 没有声明可读的 dsh.bundle.patch`);

    for (const file of files) {
      const text = readFileSync(file, "utf8");
      const { blockIds, flowIds } = parseInsertRows(text);
      const yamlIds = [...blockIds, ...flowIds];

      // 1. 共享行必须仍以 YAML 语义插入（否则独立安装拿不到宿主。
      if (isAddon) {
        for (const { id, why } of requiredSharedRows(manifest.name)) {
          check(yamlIds.includes(id), `${label}：patch 没有插入 ${id} —— ${why}`);
        }
      }

      // 1b. 兼容保留包必须零行：它插的宿主行必然存活，桌面端就永远移不掉它。
      if (ZERO_ROW_PACKAGES.has(manifest.name)) {
        check(
          yamlIds.length === 0,
          `${label}：兼容保留包不得插入任何 loader 行（现在插了 ${yamlIds.join(", ")}），` +
            "否则桌面端 removeBundle 会判 bundle-in-use 而无法移除",
        );
      }

      // 2. 共享行只能写在流式里：块式行正是市场统计本包 insertedIds 的来源。
      const own = ownRowId(manifest.name);
      if (isAddon) {
        for (const id of blockIds) {
          if (SHARED_IDS.has(id) && id !== own) {
            failures.push(
              `${label}：共享行 ${id} 写成了块式，插件市场会把它算进本包 insertedIds，` +
                `第二个 workbench 系插件安装会被判冲突；改成流式 - { id: ${id}, name: '...' }`,
            );
          }
        }
      }

      // 3. 市场视角：块式行才是它的 insertedIds。真装了 dsh-market 就用它的解析器对拍。
      const marketInserted = market ? market.parsePatchRows(text).insertedIds : blockIds;
      for (const id of marketInserted) {
        check(
          !isAddon || !SHARED_IDS.has(id) || id === own,
          `${label}：市场解析器把共享行 ${id} 算成了本包的 insertedIds（应当是不可见的流式行）`,
        );
      }
      report.push({
        label,
        file: file.slice(ROOT.length),
        yamlIds,
        marketInserted,
        source: market ? "dsh-market" : "本地近似",
      });
      marketIds.set(`${tree}|${label}`, { own: manifest.name, ids: marketInserted, tree });
    }
  }

  // 4. 市场眼里两两不相交 —— 这才是「先装宿主再装子插件 / 子插件之间互装」都不冲突的判据。
  const entries = [...marketIds.entries()];
  for (let i = 0; i < entries.length; i += 1) {
    for (let j = i + 1; j < entries.length; j += 1) {
      const [leftLabel, left] = entries[i];
      const [rightLabel, right] = entries[j];
      // 只在同一棵树内比较：源码树与发布树本来就有同名行，但它们不会同时出现在一个 profile 里。
      if (left.tree !== right.tree) continue;
      const shared = left.ids.filter((id) => right.ids.includes(id));
      check(shared.length === 0, `市场会判冲突：${leftLabel} 与 ${rightLabel} 都 insert 了 ${shared.join(", ")}`);
    }
  }

  for (const row of report) {
    console.log(row.label);
    console.log(`  YAML 语义 insertedIds  : ${row.yamlIds.join(", ") || "（空）"}`);
    console.log(`  市场视角 insertedIds   : ${row.marketInserted.join(", ") || "（空）"}  [${row.source}]`);
  }
  console.log(
    market
      ? `\n市场解析器来源：${marketEntry}`
      : "\n提示：未在 ~/.dsh/profiles/*/node_modules 下找到 dshmarket，市场视角用本地近似解析。",
  );

  if (failures.length > 0) {
    console.error(`\n失败 ${failures.length} 项：`);
    for (const message of failures) console.error(`- ${message}`);
    process.exitCode = 1;
    return;
  }
  console.log("\n通过：共享行仍是流式，各包在市场眼里的 insertedIds 两两不相交。");
}

main().catch((error) => {
  console.error(`脚本自身出错：${error.stack ?? error.message}`);
  process.exitCode = 2;
});
