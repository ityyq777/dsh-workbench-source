/**
 * 产出 packages/shell-dist：dsh plugin add file: 可直接安装。
 * @wb/core 的 lib 以相对路径内联（demo 单包分发；正式版发 npm 后改回依赖）。
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

function inlineCore(dir) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) {
      inlineCore(p);
      continue;
    }
    if (!name.name.endsWith(".js")) continue;
    const src = readFileSync(p, "utf8");
    if (!src.includes("@wb/core")) continue;
    const corePath = relative(dirname(p), join(out, "lib", "core", "index.js")).split(sep).join("/");
    writeFileSync(p, src.replaceAll("@wb/core", corePath.startsWith(".") ? corePath : "./" + corePath));
  }
}
inlineCore(join(out, "lib"));

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
