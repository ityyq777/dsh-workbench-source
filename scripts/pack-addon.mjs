/**
 * 把子插件目录打成可发布的 tgz：pnpm pack:addon --dir packages/addons/tasks [--out xxx.tgz]
 * 产物缺省：<repo>/dist/<addon_id>@<version>.tgz
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { createHash } from "node:crypto";
import { packAddonDir } from "./lib/tar.mjs";

const argv = process.argv.slice(2);
const argVal = (flag, dflt) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : dflt;
};
const dir = resolve(argVal("--dir", "packages/addons/tasks"));
const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
const meta = pkg["wb.addon"] || pkg.wb?.addon;
if (!meta || !meta.id || !meta.version) {
  console.error("package.json 缺少 wb.addon {id,version}：" + dir);
  process.exit(1);
}
const buf = packAddonDir(dir);
const out = resolve(argVal("--out", join("dist", meta.id + "@" + meta.version + ".tgz")));
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, buf);
const sha = createHash("sha256").update(buf).digest("hex");
console.log(JSON.stringify({ id: meta.id, version: meta.version, file: out, size: buf.length, sha256: sha }, null, 2));
