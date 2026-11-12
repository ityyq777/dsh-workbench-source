/** check-profile-sync.mjs 验收：临时目录造「一致 / 版本落后 / 缺包 / 入口 import 失败」等 profile，断言输出与退出码。 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("./check-profile-sync.mjs", import.meta.url));
const TMP = mkdtempSync(join(tmpdir(), "wb-profile-sync-"));
const FIXTURES = [];

const SOURCE_PKGS = [
  { dir: "packages/shell-dist", name: "dsh-workbench", version: "1.0.0" },
  { dir: "packages/addons/tasks", name: "dsh-workbench-tasks", version: "2.0.0", addon: true },
  { dir: "packages/addons/tags", name: "dsh-workbench-tags", version: "3.0.0", addon: true },
  { dir: "packages/addons/sites", name: "dsh-workbench-sites", version: "4.0.0", addon: true },
  { dir: "packages/addons/storage", name: "dsh-workbench-storage", version: "5.0.0", addon: true },
  { dir: "packages/addons/message", name: "dsh-workbench-message", version: "6.0.0", addon: true },
  { dir: "packages/addons/vault", name: "dsh-workbench-vault", version: "7.0.0", addon: true },
  { dir: "packages/addons/connector", name: "dsh-workbench-connector", version: "8.0.0", addon: true },
  { dir: "packages/addons/automation", name: "dsh-workbench-automation", version: "9.0.0", addon: true },
  { dir: "packages/addons/contacts", name: "dsh-workbench-contacts", version: "10.0.0", addon: true },
  { dir: "packages/addons/calendar", name: "dsh-workbench-calendar", version: "11.0.0", addon: true },
  { dir: "packages/addons/mail", name: "dsh-workbench-mail", version: "12.0.0", addon: true },
];

function writeFile(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function writeJson(path, value) {
  writeFile(path, JSON.stringify(value, null, 2));
}

function makeSource(root, { versions = {}, addonVersions = {} } = {}) {
  for (const pkg of SOURCE_PKGS) {
    const version = versions[pkg.name] || pkg.version;
    const manifest = { name: pkg.name, version, type: "module" };
    if (pkg.addon) manifest.wb = { addon: { version: addonVersions[pkg.name] || version } };
    writeJson(join(root, pkg.dir, "package.json"), manifest);
  }
  return root;
}

function makeProfile(root, { versions = {}, missing = [], broken = [], publishedHostName = false } = {}) {
  const names = publishedHostName ? { "dsh-workbench": "dsh-workbench-host" } : {};
  const deps = {};
  for (const pkg of SOURCE_PKGS) {
    const name = names[pkg.name] || pkg.name;
    if (missing.includes(pkg.name)) continue;
    const version = versions[pkg.name] || pkg.version;
    const manifest = { name, version, type: "module" };
    if (pkg.addon) manifest.wb = { addon: { version } };
    writeJson(join(root, "node_modules", name, "package.json"), manifest);
    writeFile(
      join(root, "node_modules", name, "lib/index.js"),
      broken.includes(pkg.name) ? 'throw new Error("半套源码：缺依赖模块");\n' : "export const ready = true;\n",
    );
    deps[name] = `file:/nonexistent/local-packages/fixture/${pkg.dir}`;
  }
  writeJson(join(root, "package.json"), { name: "dsh-profile-fixture", private: true, dependencies: deps });
  return root;
}

function makeFixture(name, sourceOptions, profileOptions) {
  const base = join(TMP, name);
  const source = makeSource(join(base, "source"), sourceOptions);
  const profile = makeProfile(join(base, "profile"), profileOptions);
  FIXTURES.push(base);
  return { source, profile };
}

function run({ source, profile }, extra = []) {
  const result = spawnSync(process.execPath, [SCRIPT, "--source", source, "--profile-dir", profile, "--json", ...extra], {
    encoding: "utf8",
  });
  let payload = null;
  try {
    payload = JSON.parse(result.stdout);
  } catch {
    payload = null;
  }
  return { status: result.status, payload, stdout: result.stdout, stderr: result.stderr };
}

try {
  // 1) 一致：退出码 0，全包通过，宿主命中的是源码包名
  {
    const fixture = makeFixture("consistent");
    const { status, payload } = run(fixture);
    assert.equal(status, 0, "一致场景应退出 0");
    assert.equal(payload.ok, true);
    assert.equal(payload.packages.length, 12);
    assert.ok(payload.packages.every((pkg) => pkg.ok && pkg.importOk === true));
    assert.equal(payload.packages[0].name, "dsh-workbench");
    assert.match(payload.packages[0].via, /^file:/, "应回显安装源");
  }

  // 2) 版本落后：退出码 1，指出具体包与两侧版本
  {
    const fixture = makeFixture("behind", {}, { versions: { "dsh-workbench-tasks": "1.9.9" } });
    const { status, payload } = run(fixture);
    assert.equal(status, 1, "版本落后应退出 1");
    assert.equal(payload.ok, false);
    const tasks = payload.packages.find((pkg) => pkg.key === "tasks");
    assert.equal(tasks.ok, false);
    assert.equal(tasks.sourceVersion, "2.0.0");
    assert.equal(tasks.installedVersion, "1.9.9");
    assert.equal(payload.packages.filter((pkg) => pkg.key !== "tasks").every((pkg) => pkg.ok), true);
  }

  // 3) 缺包：退出码 2，环境错误
  {
    const fixture = makeFixture("missing", {}, { missing: ["dsh-workbench-tags"] });
    const { status, payload } = run(fixture);
    assert.equal(status, 2, "缺包应退出 2");
    assert.equal(payload.ok, false);
    assert.ok(payload.errors.some((error) => error.code === "PROFILE_PACKAGE_MISSING"));
  }

  // 4) 入口 import 失败：退出码 1，且 --skip-import 能跳过冒烟回到 0
  {
    const fixture = makeFixture("broken-import", {}, { broken: ["dsh-workbench-storage"] });
    const failed = run(fixture);
    assert.equal(failed.status, 1, "入口 import 失败应退出 1");
    const storage = failed.payload.packages.find((pkg) => pkg.key === "storage");
    assert.equal(storage.importOk, false);
    assert.match(storage.importError, /半套源码/);
    const skipped = run(fixture, ["--skip-import"]);
    assert.equal(skipped.status, 0, "--skip-import 应跳过冒烟");
    assert.ok(skipped.payload.packages.every((pkg) => pkg.importOk === null));
  }

  // 5) profile 目录不存在：退出码 2，不抛栈
  {
    const { source, profile } = makeFixture("absent");
    rmSync(profile, { recursive: true, force: true });
    const { status, payload, stderr } = run({ source, profile });
    assert.equal(status, 2);
    assert.ok(payload.errors.some((error) => error.code === "PROFILE_DIR_MISSING"));
    assert.doesNotMatch(stderr, /at .*check-profile-sync\.mjs:\d+/, "不应输出调用栈");
  }

  // 6) 发布名宿主：优先命中 dsh-workbench-host
  {
    const fixture = makeFixture("published-host", {}, { publishedHostName: true });
    const { status, payload } = run(fixture);
    assert.equal(status, 0);
    assert.equal(payload.packages[0].name, "dsh-workbench-host");
  }

  // 7) 源码自身 version 与 wb.addon.version 不一致：退出码 2
  {
    const fixture = makeFixture("source-inconsistent", { addonVersions: { "dsh-workbench-sites": "4.0.1" } }, {});
    const { status, payload } = run(fixture);
    assert.equal(status, 2);
    assert.ok(payload.errors.some((error) => error.code === "SOURCE_MANIFEST_INCONSISTENT"));
  }

  console.log("✓ check-profile-sync：7 个场景通过（一致 / 版本落后 / 缺包 / 冒烟失败 / 目录缺失 / 发布名宿主 / 源码清单自洽）");
} finally {
  for (const dir of FIXTURES) rmSync(dir, { recursive: true, force: true });
}
