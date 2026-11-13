/**
 * 全屏页（immersive）与宿主窗口拖拽区的契约测试。
 *
 * 背景：DSH 桌面端把窗口顶部若干行标记为 `-webkit-app-region: drag`。Electron 的拖拽区
 * 按图层几何计算，覆盖在 drag 区之上、又没有声明 no-drag 的元素，点击会被当成拖窗口，
 * 于是「← 返回首页」按钮收不到 click，用户被困在全屏页里。
 *
 * 顶栏形态在 0.7.0 变过一次（见 AGENTS.md「界面红线」第 2 条）：全屏页仍然铺满整个窗口，
 * 但不再靠 `top` 让开宿主的标题栏区域，而是从 `y=0` 连续覆盖、把系统标题栏高度并进
 * 工具栏的 `padding-top`；工具栏整体 no-drag，窗口拖动交给桌面端标题栏。
 * 本测试锁定这一版约束，避免退回「顶栏留白 + 工具栏 drag」的旧形态。
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
// 1. 全屏页铺满整个窗口，根节点 no-drag（否则 Electron 把点击当拖窗口）。
assert.match(immersive, /position:fixed/, "全屏页必须是固定定位");
assert.match(immersive, /inset:0/, "全屏页必须铺满整个窗口");
assert.match(immersive, /height:100vh/, "全屏页高度应为视口高度");
assert.match(immersive, /padding:0/, "全屏页自身不留白，顶部让位交给工具栏的 padding-top");
assert.match(immersive, /-webkit-app-region:no-drag/, "全屏页根节点必须 no-drag，否则 Electron 把点击当拖窗口");

// 2. 工具栏占满系统标题栏区域：标题栏高度并进 padding-top，且工具栏不得声明 drag
//    （原生拖拽区会先于 DOM 命中，吞掉页面控件点击）。
const bar = rule(styles, ".wb-immersive-bar");
assert.match(bar, /padding:calc\(\d+px \+ var\(--dsh-frame-top-clearance,0px\)\)/, "工具栏 padding-top 应并入系统标题栏高度");
assert.match(bar, /-webkit-app-region:no-drag/, "工具栏必须 no-drag，拖动窗口交给桌面端标题栏");
assert.doesNotMatch(bar, /-webkit-app-region:drag\b/, "工具栏内不得声明 -webkit-app-region: drag");
assert.match(
  styles,
  /\.wb-immersive-bar button[^{]*\{[^}]*-webkit-app-region:no-drag/,
  "工具栏内的按钮必须 no-drag，否则返回首页点不动",
);

// 3. macOS 不再预留 48px 垂直空白：顶栏 padding-top 只留 8px，左侧避开红绿灯。
assert.match(
  styles,
  /html\[data-platform=darwin\][^{]*\.wb-immersive-bar\{padding-top:8px;padding-left:max\(88px,/,
  "macOS 顶栏应从 y=0 连续覆盖，左侧让开红绿灯",
);

// 4. 窄屏分支同样不留白，工具栏仍是 no-drag。
assert.match(
  styles,
  /@media \(max-width:760px\)\{[^\n]*\.wb-immersive-bar\{padding:calc\(\d+px \+ var\(--dsh-frame-top-clearance,0px\)\)/,
  "窄屏分支的工具栏仍应并入系统标题栏高度",
);
assert.doesNotMatch(styles, /\.wb-immersive\{padding:var\(--dsh-frame-top-clearance/, "不得退回顶栏留白的旧形态");

// 5. 构建产物要带上同样的规则，避免源码改了、安装的 client.js 还是旧的。
for (const marker of ["-webkit-app-region:no-drag", ".wb-immersive{position:fixed;inset:0"]) {
  assert.ok(bundle.includes(marker), `client.js 缺少标记 ${marker}，请先 pnpm build:clients`);
}

// 6. 两个返回入口（普通页头 / 全屏页工具栏）都必须回到首页。
assert.equal(
  clientSrc.match(/className: "wb-back", onClick: function \(\) \{ go\("home"\); \}/g)?.length,
  2,
  "pages 的返回按钮与全屏页返回按钮都应调用 go(\"home\")",
);
assert.match(clientSrc, /className: "wb-root wb-immersive"/);

console.log("SHELL IMMERSIVE PASS: 全屏页从 y=0 覆盖、工具栏 no-drag，返回首页可点击");
