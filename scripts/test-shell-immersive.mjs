/**
 * 全屏页（immersive）与宿主窗口拖拽区的契约测试。
 *
 * 背景：DSH 桌面端把窗口顶部若干行标记为 `-webkit-app-region: drag`。Electron 的拖拽区
 * 按图层几何计算，覆盖在 drag 区之上、又没有声明 no-drag 的元素，点击会被当成拖窗口，
 * 于是「← 返回首页」按钮收不到 click，用户被困在全屏页里。
 * 这里锁定修复后的三条约束：全屏页从宿主 chrome 下方开始、根节点 no-drag、
 * 工具栏空白段 drag 而工具栏内的控件 no-drag。
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const styles = readFileSync(join(root, "packages/shell/client/styles.cjs"), "utf8");
const clientSrc = readFileSync(join(root, "packages/shell/client/client.src.cjs"), "utf8");
const bundle = readFileSync(join(root, "packages/shell/client/client.js"), "utf8");

function rule(source, selector) {
  const start = source.indexOf(selector + "{");
  assert.ok(start >= 0, `缺少规则 ${selector}`);
  const end = source.indexOf("}", start);
  return source.slice(start, end + 1);
}

const immersive = rule(styles, ".wb-immersive");
// 1. 全屏页铺满整个窗口（用户要求保持全屏），顶部靠 padding 让开宿主 chrome。
assert.match(immersive, /position:fixed/, "全屏页必须是固定定位");
assert.match(immersive, /inset:0/, "全屏页必须铺满整个窗口");
assert.match(immersive, /height:100vh/, "全屏页高度应为视口高度");
assert.match(immersive, /padding:var\(--dsh-frame-top-clearance,0px\) 0 0/, "顶部用 padding 让开宿主 chrome，其余三边不留白");
assert.match(immersive, /-webkit-app-region:no-drag/, "全屏页根节点必须 no-drag，否则 Electron 把点击当拖窗口");

// 2. 工具栏空白段仍可拖窗口，工具栏里的控件必须能点。
const bar = rule(styles, ".wb-immersive-bar");
assert.match(bar, /-webkit-app-region:drag/, "工具栏空白段应为 drag 区（与宿主 chrome 行一致）");
assert.match(
  styles,
  /\.wb-immersive-bar button[^{]*\{[^}]*-webkit-app-region:no-drag/,
  "工具栏内的按钮必须 no-drag，否则返回首页点不动",
);

// 3. 窄屏分支同样保持全屏与顶部让位，且根节点仍 no-drag。
assert.match(styles, /@media \(max-width:760px\)\{[^\n]*\.wb-immersive\{padding:var\(--dsh-frame-top-clearance,0px\) 0 0\}/, "窄屏分支不得丢顶部让位");

// 4. 构建产物要带上同样的三条规则，避免源码改了、安装的 client.js 还是旧的。
for (const marker of ["-webkit-app-region:no-drag", "-webkit-app-region:drag", "padding:var(--dsh-frame-top-clearance,0px) 0 0"]) {
  assert.ok(bundle.includes(marker), `client.js 缺少标记 ${marker}，请先 pnpm build:clients`);
}

// 5. 两个返回入口（普通页头 / 全屏页工具栏）都必须回到首页。
assert.equal(
  clientSrc.match(/className: "wb-back", onClick: function \(\) \{ go\("home"\); \}/g)?.length,
  2,
  "pages 的返回按钮与全屏页返回按钮都应调用 go(\"home\")",
);
assert.match(clientSrc, /className: "wb-root wb-immersive"/);

console.log("SHELL IMMERSIVE PASS: 全屏页不再覆盖窗口拖拽区，返回首页可点击");
