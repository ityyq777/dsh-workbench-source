#!/usr/bin/env node
/**
 * 端到端测试入口：按顺序运行原生插件、客户端模块、标签、站点、备份测试。
 *
 * 运行前先构建：pnpm build && node scripts/dist-shell.mjs
 * 运行：node scripts/e2e.mjs
 */
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const tests = [
  "scripts/test-native.mjs",
  "scripts/test-clients.mjs",
  "scripts/test-tags.mjs",
  "scripts/test-sites.mjs",
  "scripts/test-backup.mjs",
];

for (const test of tests) {
  console.log("\n=== " + test + " ===");
  const result = spawnSync(process.execPath, [join(root, test)], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env },
  });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error("E2E FAIL: " + test + " (exit " + result.status + ")");
    process.exit(result.status || 1);
  }
}

console.log("\nE2E PASS");