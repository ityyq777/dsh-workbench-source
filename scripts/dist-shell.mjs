/**
 * 产出 packages/shell-dist：dsh plugin add file: 可直接安装。
 * 内联 core 与 SDK 的运行时产物，保证安装后无需解析工作区依赖。
 */
import { cpSync, readFileSync, writeFileSync, rmSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

const root = join(import.meta.dirname, "..");
const out = join(root, "packages", "shell-dist");
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "lib"), { recursive: true });
mkdirSync(join(out, "client"), { recursive: true });

// 整体复制宿主编译产物（addons.js / tar.js / sync.js / index.js 一个都别漏），core 内联为 lib/core
cpSync(join(root, "packages", "shell", "lib"), join(out, "lib"), { recursive: true });
cpSync(join(root, "packages", "core", "lib"), join(out, "lib", "core"), { recursive: true });

// 角色注册使用 SDK 的运行时校验，独立安装时需一并带入。
cpSync(join(root, "packages", "sdk", "lib"), join(out, "lib", "sdk"), { recursive: true });

function inlinePackages(dir) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) {
      inlinePackages(p);
      continue;
    }
    if (!name.name.endsWith(".js")) continue;
    const src = readFileSync(p, "utf8");
    const rewritten = src.replace(/(["'])@wb\/(core|sdk)\1/g, (_, quote, pkg) => {
      const path = relative(dirname(p), join(out, "lib", pkg, "index.js")).split(sep).join("/");
      return quote + (path.startsWith(".") ? path : "./" + path) + quote;
    });
    if (rewritten !== src) writeFileSync(p, rewritten);
  }
}
inlinePackages(join(out, "lib"));

// 客户端 bundle 与插件元数据
cpSync(join(root, "packages", "shell", "client", "client.js"), join(out, "client", "client.js"));
cpSync(join(root, "packages", "shell", "cordis.patch.yml"), join(out, "cordis.patch.yml"));
const pkg = JSON.parse(readFileSync(join(root, "packages", "shell", "package.json"), "utf8"));
delete pkg.dependencies;
delete pkg.devDependencies;
delete pkg.scripts;
pkg.main = "lib/index.js";
writeFileSync(join(out, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
console.log("shell-dist ready:", out);
