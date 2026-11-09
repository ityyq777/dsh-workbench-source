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
  "scripts/test-task-ownership-backend.mjs",
  "scripts/test-task-ownership-concurrency.mjs",
  "scripts/test-task-ownership-ui.mjs",
  "scripts/test-task-table-picker.mjs",
  "scripts/test-ownership-host.mjs",
  "scripts/test-tasks-review.mjs",
  "scripts/test-task-difficulty-backend.mjs",
  "scripts/test-task-recent-backend.mjs",
  "scripts/test-task-activity-calendar.mjs",
  "scripts/test-tasks-activity-ui.mjs",
  "scripts/test-tasks-today-ui.mjs",
  "scripts/test-task-today-stats-backend.mjs",
  "scripts/test-task-recent-ui.mjs",
  "scripts/test-tasks-difficulty-ui.mjs",
  "scripts/test-tasks-search.mjs",
  "scripts/test-tasks-date-ui.mjs",
  "scripts/test-task-publish-range-backend.mjs",
  "scripts/test-task-body.mjs",
  "scripts/test-task-body-react.mjs",
  "scripts/test-task-config-ui.mjs",
  "scripts/test-markdown-performance.mjs",
  "scripts/test-tasks-restart.mjs",
  "scripts/test-tasks-restart-client.mjs",
  "scripts/test-storage-visual.mjs",
  "scripts/test-clients.mjs",
  "packages/shell/client/view-tabs.test.mjs",
  ["packages/shell/client/view-tabs.test.mjs", "--bundle"],
  "scripts/test-data.mjs",
  "scripts/test-data-ui.mjs",
  "scripts/test-tags.mjs",
  "scripts/test-tags-ui.mjs",
  "scripts/test-sites.mjs",
  "scripts/test-node-overview.mjs",
  "scripts/test-site-node-description.mjs",
  "scripts/test-storage.mjs",
  "scripts/test-storage-cards.mjs",
  "scripts/test-storage-bulk.mjs",
  "scripts/test-storage-selection.mjs",
  "scripts/test-backup.mjs",
];

for (const test of tests) {
  console.log("\n=== " + test + " ===");
  const [file, ...args] = Array.isArray(test) ? test : [test];
  const result = spawnSync(process.execPath, [join(root, file), ...args], {
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