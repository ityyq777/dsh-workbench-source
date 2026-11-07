/**
 * 产出 packages/shell-dist：dsh plugin add file: 可直接安装。
 * @wb/core 的 lib 以相对路径内联（demo 单包分发；正式版发 npm 后改回依赖）。
 */
import { cpSync, readFileSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const out = join(root, "packages", "shell-dist");
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "lib"), { recursive: true });
mkdirSync(join(out, "client"), { recursive: true });

// 宿主编译产物 + core 内联到 node_modules-free 相对导入
cpSync(join(root, "packages", "shell", "lib", "index.js"), join(out, "lib", "index.js"));
cpSync(join(root, "packages", "shell", "lib", "sync.js"), join(out, "lib", "sync.js"));
cpSync(join(root, "packages", "core", "lib"), join(out, "lib", "core"), { recursive: true });
let src = readFileSync(join(out, "lib", "index.js"), "utf8").replaceAll("@wb/core", "./core/index.js");
writeFileSync(join(out, "lib", "index.js"), src);
src = readFileSync(join(out, "lib", "sync.js"), "utf8").replaceAll("@wb/core", "./core/index.js");
writeFileSync(join(out, "lib", "sync.js"), src);

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
