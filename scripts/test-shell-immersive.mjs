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
// 1. 从宿主 chrome（macOS 顶部 48px、Windows 标题栏）下方开始，而不是自己再压一层 padding。
assert.match(immersive, /top:var\(--dsh-frame-top-clearance,0px\)/, "全屏页必须从宿主 chrome 下沿开始");
assert.match(immersive, /bottom:0/, "全屏页应铺到底部");
assert.doesNotMatch(immersive, /inset:0/, "不用 inset:0，否则会盖住窗口拖拽区");
assert.doesNotMatch(immersive, /padding:var\(--dsh-frame-top-clearance/, "旧写法用 padding 让位，内容区仍会压住拖拽区");
assert.match(immersive, /-webkit-app-region:no-drag/, "全屏页根节点必须 no-drag，否则 Electron 把点击当拖窗口");
// `.wb-immersive` 与 `.wb-root` 同元素，必须显式清掉普通页的 24/28px 内边距，否则工具栏内缩 24px。
assert.match(immersive, /padding:0/, "全屏页必须清掉 .wb-root 的页面内边距");

// 2. 工具栏空白段仍可拖窗口，工具栏里的控件必须能点。
const bar = rule(styles, ".wb-immersive-bar");
assert.match(bar, /-webkit-app-region:drag/, "工具栏空白段应为 drag 区（与宿主 chrome 行一致）");
assert.match(
  styles,
  /\.wb-immersive-bar button[^{]*\{[^}]*-webkit-app-region:no-drag/,
  "工具栏内的按钮必须 no-drag，否则返回首页点不动",
);

// 3. 窄屏分支不能把 padding 让位写法加回来。
assert.doesNotMatch(styles, /\.wb-immersive\{padding:var\(--dsh-frame-top-clearance/, "窄屏分支不得回退到 padding 让位");

// 4. 构建产物要带上同样的三条规则，避免源码改了、安装的 client.js 还是旧的。
for (const marker of ["-webkit-app-region:no-drag", "-webkit-app-region:drag", "top:var(--dsh-frame-top-clearance,0px)"]) {
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
