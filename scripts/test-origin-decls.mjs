#!/usr/bin/env node
// 校验「声明来源 ⊇ 执行期 guard 允许的来源」。
//
// 背景：origins 是 action 的声明上界，execute 里的 only(ctx, [...]) 是第二道门。
// 两者必须一致——声明少了，guard 里写着的来源永远调不通（2026-11-21 的教训：
// vault.lease 被误写成只给 ui，导致邮件同步取不到凭据，报「不允许 plugin 来源调用」）。
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ORDER = ["ui", "plugin", "agent", "sync"];
const ROOT = new URL("../packages/addons/", import.meta.url).pathname;

function actionFiles() {
  const out = [];
  for (const addon of readdirSync(ROOT).sort()) {
    const dir = join(ROOT, addon, "lib", "domain");
    let names = [];
    try {
      names = readdirSync(dir).filter((n) => /^actions.*\.js$/.test(n));
    } catch {
      continue;
    }
    for (const name of names.sort()) out.push({ addon, file: join(dir, name) });
  }
  return out;
}

function entries(src) {
  const found = [];
  const re = /api\.action\(\s*"([\w.\-]+)"\s*,\s*\{/g;
  let match;
  while ((match = re.exec(src))) {
    const name = match[1];
    const start = match.index;
    const next = src.indexOf("api.action(", match.index + 8);
    const seg = src.slice(start, next < 0 ? start + 4000 : next);
    const decl = /origins:\s*\[([^\]]*)\]/.exec(seg);
    const guard = /only\(ctx,\s*\[([^\]]*)\]/.exec(seg);
    if (!guard) continue;
    const list = (group) =>
      group
        .split(",")
        .map((item) => item.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);
    found.push({ name, declared: decl ? list(decl[1]) : null, guard: list(guard[1]) });
  }
  return found;
}

const problems = [];
let checked = 0;
for (const { addon, file } of actionFiles()) {
  for (const item of entries(readFileSync(file, "utf8"))) {
    checked += 1;
    const declared = item.declared ?? ORDER.filter((o) => o !== "sync");
    const missing = item.guard.filter((origin) => !declared.includes(origin));
    if (missing.length) {
      problems.push(
        `${addon} ${item.name}：execute 允许 ${item.guard.join("/")}，但声明只有 ${declared.join("/")}（缺 ${missing.join("/")}）`,
      );
    }
  }
}

if (problems.length) {
  console.error("来源声明与执行期 guard 不一致：");
  for (const line of problems) console.error("  - " + line);
  process.exit(1);
}
console.log(`ORIGIN DECLS OK（${checked} 个带 guard 的 action）`);
