/**
 * 产出 packages/shell-dist：dsh plugin add file: 可直接安装。
 * 内联 core 与 SDK 的运行时产物，保证安装后无需解析工作区依赖。
 */
import { cpSync, readFileSync, writeFileSync, rmSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

const root = join(import.meta.dirname, "..");
const out = join(root, "packages", "shell-dist");
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "lib"), { recursive: true });
mkdirSync(join(out, "client"), { recursive: true });

// 增量编译可能留下已删除模块的输出。发行包只收录当前源码对应的产物。
for (const pkg of ["shell", "core", "sdk"]) {
  const base = join(root, "packages", pkg);
  const lib = join(base, "lib");
  const dest = pkg === "shell" ? join(out, "lib") : join(out, "lib", pkg);
  cpSync(lib, dest, { recursive: true, filter(path) {
    const rel = relative(lib, path);
    if (!/\.(?:js|d\.ts)(?:\.map)?$/.test(rel)) return true;
    return existsSync(join(base, "src", rel.replace(/\.(?:d\.ts|js)(?:\.map)?$/, ".ts")));
  } });
}

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
