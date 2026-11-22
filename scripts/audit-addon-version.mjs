#!/usr/bin/env node
// 插件版本号单一来源检查。
//
// 首页插件卡片读的是 `registerDomain({ version })`，客户端 `registerAddon({ version })`
// 也各自声明一份。这两个数字曾经手写在源码里，改 package.json 时忘掉就会出现
// 「装的是 5.2.45，卡片显示 5.2.40」。这里把三处钉在一起：
//   1. 服务端 lib/index.js 不许出现 `version: "x.y.z"` 字面量（应从 package.json 读）；
//   2. 客户端 client.src.cjs 不许出现字面量（应由构建注入 __ADDON_VERSION__）；
//   3. 已构建的 lib/client.js 里注册的版本必须等于 package.json。
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const ADDONS_DIR = join(ROOT, "packages/addons");
const problems = [];
const checked = [];

const addons = readdirSync(ADDONS_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .filter((name) => existsSync(join(ADDONS_DIR, name, "package.json")));

for (const name of addons) {
  const dir = join(ADDONS_DIR, name);
  const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  const version = pkg.version;
  const where = `packages/addons/${name}`;

  const server = join(dir, "lib/index.js");
  if (existsSync(server)) {
    const src = readFileSync(server, "utf8");
    const literal = src.match(/version: "\d+\.\d+\.\d+"/);
    if (literal) problems.push(`${where}/lib/index.js 仍有写死的版本号 ${literal[0]}，应改为读 package.json`);
  }

  const clientSrc = join(dir, "client/client.src.cjs");
  if (existsSync(clientSrc)) {
    const src = readFileSync(clientSrc, "utf8");
    const literal = src.match(/version: "\d+\.\d+\.\d+"/);
    if (literal) problems.push(`${where}/client/client.src.cjs 仍有写死的版本号 ${literal[0]}，应改为 __ADDON_VERSION__`);
  }

  const clientBuilt = join(dir, "lib/client.js");
  if (existsSync(clientBuilt)) {
    const built = readFileSync(clientBuilt, "utf8");
    if (!built.includes(`version: "${version}"`)) {
      problems.push(`${where}/lib/client.js 里注册的版本不是 package.json 的 ${version}（产物过期或注入丢失）`);
    }
  }
  checked.push({ addon: name, version });
}

if (problems.length) {
  console.error("ADDON VERSION AUDIT FAIL");
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}
console.log(`ADDON VERSION AUDIT PASS: ${checked.length} 个插件版本号只认 package.json`);
