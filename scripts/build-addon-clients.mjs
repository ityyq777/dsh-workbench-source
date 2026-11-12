#!/usr/bin/env node
// 构建宿主和业务插件客户端：将源模块与 lucide-react 图标打进各自单文件。
// 源码在 client/client.src.cjs（CommonJS 风格，require("react") 由 DSH 模块加载器提供），
// 产物 lib/client.js 是包在 window.__ModuleLoader__.load({ factory }) 里的单文件。
import { build } from "esbuild";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);

const ADDONS = ["tasks", "tags", "sites", "storage", "message"];

function wrapper(id) {
  return {
    banner: {
      js: [
        "// 由 scripts/build-addon-clients.mjs 生成；请修改对应 client/client.src.cjs 后重新构建。",
        "window.__ModuleLoader__ = window.__ModuleLoader__ || { modules: {}, load: function (m) { this.modules[m.id] = m.factory; } };",
        "window.__ModuleLoader__.load({",
        '  id: ' + JSON.stringify(id) + ",",
        "  factory: function (require) {",
        "    var module = { exports: {} };",
        "    var exports = module.exports;",
      ].join("\n"),
    },
    footer: {
      js: "    return module.exports;\n  },\n});",
    },
  };
}

const results = [];
const shellDir = join(ROOT, "packages/shell");
await build({
  entryPoints: [join(shellDir, "client/client.src.cjs")],
  outfile: join(shellDir, "client/client.js"),
  bundle: true, format: "cjs", platform: "browser", target: ["es2020"],
  external: ["react"], legalComments: "none", logLevel: "warning",
  ...wrapper("dsh-workbench"),
});
results.push({ package: "dsh-workbench", version: require(join(shellDir, "package.json")).version });
for (const name of ADDONS) {
  const dir = join(ROOT, "packages/addons", name);
  const pkg = require(join(dir, "package.json"));
  const entry = join(dir, "client/client.src.cjs");
  const outfile = join(dir, "lib/client.js");
  const { banner, footer } = wrapper(pkg.name);
  const out = await build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    write: true,
    format: "cjs",
    platform: "browser",
    target: ["es2020"],
    external: ["react"],
    legalComments: "none",
    logLevel: "warning",
    banner: { js: banner.js },
    footer: { js: footer.js },
  });
  const errors = out.errors?.length ?? 0;
  if (errors) throw new Error(name + " build failed");
  results.push({ addon: name, package: pkg.name, version: pkg.wb?.addon?.version, outfile });
}

console.log(JSON.stringify({ ok: true, clients: results }, null, 2));
