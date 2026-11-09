/**
 * 手写源行数审计：防止单文件重新长成「什么都往里塞」的巨无霸。
 *
 * 规则（2026-11-09 起）：
 *   - 手写源单文件 ≤ 600 行为目标，> 600 告警，> 900 阻断（退出码 1）。
 *   - 生成物不计：packages/addons/*\/lib/client.js（pnpm build:clients 产物）、
 *     packages/shell-dist/**（dist-shell 产物）。
 *
 * 用法：
 *   node scripts/audit-lines.mjs          # 人读报告
 *   node scripts/audit-lines.mjs --json   # 机读
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const budget = JSON.parse(readFileSync(join(ROOT, "scripts/line-budget.json"), "utf8"));
const WARN = budget.warn || 600;
const FAIL = budget.fail || 900;
const ALLOW = budget.budget || {};

const ROOTS = [
  "packages/addons/*/lib",
  "packages/addons/*/client",
  "packages/shell/src",
  "packages/sdk/src",
  "packages/core/src",
];

const SKIP = [
  /\/lib\/client\.js$/, // 构建产物
  /\.d\.ts$/,
];

function expand(pattern) {
  const at = pattern.indexOf("*");
  const head = pattern.slice(0, at);
  const tail = pattern.slice(at + 1);
  const base = join(ROOT, head);
  let dirs = [];
  try {
    dirs = readdirSync(base).filter((name) => {
      try {
        return statSync(join(base, name)).isDirectory();
      } catch {
        return false;
      }
    });
  } catch {
    return [];
  }
  return dirs.map((d) => join(base, d, tail.replace(/^\//, "")));
}

function walk(dir, out) {
  let names = [];
  try {
    names = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of names) {
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(full, out);
    else if (/\.(js|cjs|mjs|ts|tsx)$/.test(name)) out.push(full);
  }
  return out;
}

const files = [];
for (const pattern of ROOTS) for (const dir of expand(pattern)) walk(dir, files);

const rows = [];
for (const file of files) {
  const rel = relative(ROOT, file);
  if (SKIP.some((re) => re.test(rel))) continue;
  const lines = readFileSync(file, "utf8").split("\n").length;
  rows.push({ file: rel, lines });
}
rows.sort((a, b) => b.lines - a.lines);

const over = rows.filter((r) => r.lines > WARN);
const broken = rows.filter((r) => {
  const cap = ALLOW[r.file];
  return cap ? r.lines > cap : r.lines > FAIL;
});

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ warn: WARN, fail: FAIL, files: rows.length, over, broken }, null, 2));
} else {
  console.log(`手写源行数审计：${rows.length} 个文件（目标 ≤${WARN}，上限 ${FAIL}）`);
  if (!over.length) {
    console.log(`  ✓ 全部文件 ≤${WARN} 行`);
  } else {
    for (const r of over) {
      const cap = ALLOW[r.file];
      const mark = broken.includes(r) ? "✗" : "!";
      const tail = cap ? `（预算 ${cap}，不得再涨；目标 ≤${WARN}）` : "";
      console.log(`  ${mark} ${String(r.lines).padStart(5)}  ${r.file}${tail}`);
    }
    console.log(`  合计超出：${over.length} 个文件（其中冻结预算 ${Object.keys(ALLOW).length} 个）`);
  }
}

if (broken.length) {
  console.error(`\n行数审计失败：${broken.length} 个文件超出行数预算，请先拆分（或下调预算）再提交。`);
  process.exitCode = 1;
}
