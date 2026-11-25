#!/usr/bin/env node
/**
 * 校验自动化的「兼容保留包」仍然是空壳：不插入任何 loader 行、只有一条日志，不注册任何能力。
 *
 * 背景（任务 01a20cb3）：自动化已内化进宿主（21a0987），但市场条目与安装入口要保留。
 * 恢复的 packages/addons/automation 一旦悄悄长出 client、视图、表或 action，
 * 插件数会从 12 变 13，测试与文档口径全部失真；这个脚本把这条红线钉住。
 *
 * 0.5.1 起 patch 改成空 insert：桌面端 removeBundle 把 patch 里 insert 的行与存活条目对拍，
 * 插了宿主行就永远报 bundle-in-use；空 insert 才算真的「可移除」。这条也钉在这里。
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
assert.equal(pkg.version, "0.5.1");
assert.ok(pkg.dsh?.bundle?.patch, "市场硬条件要求 dsh.bundle.patch 存在");
assert.equal(pkg.dsh?.client, undefined, "兼容包不得带 client（否则插件数变 13）");
assert.equal(pkg.main, "lib/index.js");
for (const dir of ["client", "src", "test"]) {
  assert.equal(existsSync(join(DIR, dir)), false, "兼容包不应有 " + dir + " 目录");
}

// patch 必须是「插入列表为空」：插任何行都会被桌面端 removeBundle 判成 bundle-in-use。
const patch = readFileSync(join(DIR, "cordis.patch.yml"), "utf8");
const active = patch.split("\n").filter((line) => line.trim() && !line.trim().startsWith("#"));
assert.deepEqual(active.map((line) => line.trim()), ["- insert: []"], "patch 只应有空 insert，实际：" + active.join(" | "));
// 任何 loader 行（块式 - id: / 流式 - { id: / 无 insert 的裸行）都会让这个包被算进 contributions。
const rowLines = patch
  .split("\n")
  .filter((line) => /^\s*-?\s*(id|name|\{)/u.test(line.trim()) && line.trim() !== "- insert: []");
assert.deepEqual(rowLines, [], "patch 不得插入任何 loader 行，实际：" + rowLines.join(" | "));
assert.ok(/workbench/u.test(patch.split("\n").filter((line) => line.trim() && !line.trim().startsWith("#")).join("\n")) === false,
  "空 insert 里不应再出现宿主行");

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
assert.match(notices[0], /兼容保留包 0\.5\.1/);
// 日志里的宿主版本是运行时从已装宿主读的，这里只校验形状，不钉具体版本。
assert.match(notices[0], /dsh-workbench-host \d+\.\d+\.\d+/);
assert.match(notices[0], /不插入任何插件行/);

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

console.log("AUTOMATION COMPAT PASS: 空壳、零 loader 行（桌面端可移除）、日志含宿主版本、发布树已登记");
