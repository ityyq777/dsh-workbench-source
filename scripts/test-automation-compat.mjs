#!/usr/bin/env node
/**
 * 校验自动化的「兼容保留包」仍然是空壳：只有宿主行、只有一条日志，不注册任何能力。
 *
 * 背景（任务 01a20cb3）：自动化已内化进宿主（21a0987），但市场条目与安装入口要保留。
 * 恢复的 packages/addons/automation 一旦悄悄长出 client、视图、表或 action，
 * 插件数会从 12 变 13，测试与文档口径全部失真；这个脚本把这条红线钉住。
 *
 * 用法：node scripts/test-automation-compat.mjs
 * 退出码：0 通过；1 断言失败。
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DIR = join(ROOT, "packages/addons/automation");
const pkg = JSON.parse(readFileSync(join(DIR, "package.json"), "utf8"));

assert.equal(pkg.name, "dsh-workbench-automation");
assert.equal(pkg.version, "0.5.0");
assert.ok(pkg.dsh?.bundle?.patch, "市场硬条件要求 dsh.bundle.patch 存在");
assert.equal(pkg.dsh?.client, undefined, "兼容包不得带 client（否则插件数变 13）");
assert.equal(pkg.main, "lib/index.js");
for (const dir of ["client", "src", "test"]) {
  assert.equal(existsSync(join(DIR, dir)), false, "兼容包不应有 " + dir + " 目录");
}

// patch 只允许插入宿主行，且必须是流式单行（块式会被市场算进 insertedIds 而判冲突）。
const patch = readFileSync(join(DIR, "cordis.patch.yml"), "utf8");
const active = patch.split("\n").filter((line) => line.trim() && !line.trim().startsWith("#"));
assert.equal(active.length, 2, "patch 只应有 insert: 与一行流式宿主行，实际：" + active.join(" | "));
assert.equal(active[0].trim(), "- insert:");
assert.equal(active[1].trim(), "- { id: workbench, name: 'dsh-workbench' }");
assert.ok(/- id: workbench(\s|$)/m.test(patch) === false, "宿主行必须是流式，不能是块式");

// 源码里不得出现建域、建表、注册 action 的调用。
const source = readFileSync(join(DIR, "lib/index.js"), "utf8");
for (const banned of ["host.registerDomain(", "api.ensureSchema(", "CREATE TABLE", "api.action(", "api.registerAddon(", "api.events."]) {
  assert.equal(source.includes(banned), false, "兼容包不得调用 " + banned);
}

// 运行一次：只打日志，不碰宿主任何服务。
const notices = [];
const originalInfo = console.info;
console.info = (...args) => notices.push(args.join(" "));
const hostCalls = [];
const workbench = new Proxy({}, { get: (_t, key) => (...args) => { hostCalls.push(String(key)); return args; } });
try {
  const mod = await import(pathToFileURL(join(DIR, "lib/index.js")).href);
  assert.deepEqual(mod.inject, ["workbench"]);
  mod.apply({ workbench, effect: () => undefined });
} finally {
  console.info = originalInfo;
}
assert.deepEqual(hostCalls, [], "apply 不得调用 workbench 的任何方法，实际：" + hostCalls.join(","));
assert.equal(notices.length, 1);
assert.match(notices[0], /已内置于宿主/);
assert.match(notices[0], /兼容保留包 0\.5\.0/);
assert.match(notices[0], /dsh-workbench-host 0\.17\.0/);

// 发布树登记：ADDON_META 与市场草稿都要有它，且文案写明内化版本。
const stage = readFileSync(join(ROOT, "scripts/stage-release.mjs"), "utf8");
assert.ok(stage.includes("automation: {"), "stage-release 的 ADDON_META 必须登记 automation");
assert.match(stage, /自 dsh-workbench-host 0\.17\.0 起已内置于宿主/);
const drafting = join(ROOT, "dist/release/marketplace/ityyq777__dsh-workbench--packages-automation.yml");
if (existsSync(drafting)) {
  const yml = readFileSync(drafting, "utf8");
  assert.match(yml, /packages\/automation/);
  assert.match(yml, /dsh-workbench-host 0\.17\.0/);
}

console.log("AUTOMATION COMPAT PASS: 空壳、仅宿主行、日志含宿主版本、发布树已登记");
