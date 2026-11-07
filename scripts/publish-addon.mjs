/**
 * 把子插件目录打包并发布到 wb-cloud：
 *   pnpm publish:addon --dir packages/addons/tasks --server http://127.0.0.1:8791 --token dev-publish-token
 * token 缺省读 WB_PUBLISH_TOKEN。
 */
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createHash } from "node:crypto";
import { packAddonDir } from "./lib/tar.mjs";

const argv = process.argv.slice(2);
const argVal = (flag, dflt) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : dflt;
};
const dir = resolve(argVal("--dir", "packages/addons/tasks"));
const server = argVal("--server", process.env.WB_CLOUD_URL || "http://127.0.0.1:8791").replace(/\/+$/, "");
const token = argVal("--token", process.env.WB_PUBLISH_TOKEN || "dev-publish-token");

const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
const meta = pkg["wb.addon"] || pkg.wb?.addon;
if (!meta) {
  console.error("package.json 缺少 wb.addon：" + dir);
  process.exit(1);
}
const buf = packAddonDir(dir);
const body = {
  meta: {
    addon_id: meta.id,
    version: meta.version,
    title: meta.title || meta.id,
    description: meta.description || "",
    author: meta.author || "",
    min_shell: meta.minShell || "0.1.0",
    tables: meta.tables || [],
    views: meta.views || [],
    tool_actions: meta.toolActions || [],
  },
  tgzBase64: buf.toString("base64"),
};
const res = await fetch(server + "/v1/publish", {
  method: "POST",
  headers: { "content-type": "application/json", "x-publish-token": token },
  body: JSON.stringify(body),
});
const text = await res.text();
if (!res.ok) {
  console.error("发布失败 HTTP " + res.status + ": " + text);
  process.exit(1);
}
console.log(JSON.stringify({ server, ...JSON.parse(text), size: buf.length, sha256: createHash("sha256").update(buf).digest("hex") }, null, 2));
