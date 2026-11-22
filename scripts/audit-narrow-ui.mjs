/**
 * 窄屏（≤760px）布局静态核对：找出会被固定宽度撑破的规则，以及没有窄屏收口的组件。
 *
 * 只做静态扫描，不渲染页面；真实观感仍要用预览页 + 无头 Chrome 截图确认。
 * 用法：node scripts/audit-narrow-ui.mjs [--json]
 * 退出码：发现“必须处理”的问题时为 1。
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const argRoot = process.argv.indexOf("--root");
const ROOT =
  argRoot > -1 ? path.resolve(process.argv[argRoot + 1]) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ADDONS = path.join(ROOT, "packages/addons");

const NARROW_LIMIT = 760;
/**
 * 宽屏媒体块的判定上限：≤960px 的媒体块通常就是「窄屏之前那一档」的收口
 * （mail 在 900px 把双栏改成单列、sites 在 860px 折叠侧栏）。
 * 覆盖率只看类名是否出现在这类媒体块里——它只能证明「作者想过窄屏」，
 * 不能证明收口足够，所以仍需预览截图复核。
 */
const COVER_LIMIT = 960;
/** 单个盒子允许的最大固定宽度：超过它，390px 视口就必然溢出（还要扣掉两侧留白）。 */
const WIDTH_BUDGET = 340;
/** 表格在窄屏被强制的最小宽度属于「必须按列裁剪」而不是横滑兜底。 */
const TABLE_MIN_BUDGET = 420;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "lib") continue;
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith(".cjs") || name.endsWith(".js") || name.endsWith(".mjs")) out.push(full);
  }
  return out;
}

/** 把文件里的 CSS 字符串字面量拼起来，去掉 JS 包装，便于按规则扫描。 */
function cssText(file) {
  const raw = readFileSync(file, "utf8");
  const strings = raw.match(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g) || [];
  return strings.map((s) => s.slice(1, -1)).join("\n");
}

/** 收集所有 @media 块（含嵌套花括号的简化处理）与其中的选择器文本。 */
function mediaBlocks(css) {
  const blocks = [];
  const re = /@media[^{]*\{/g;
  let m;
  while ((m = re.exec(css))) {
    const start = m.index + m[0].length;
    let depth = 1;
    let i = start;
    while (i < css.length && depth > 0) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}") depth--;
      i++;
    }
    const head = m[0].slice(0, -1).trim();
    const limit = narrowLimit(head);
    blocks.push({ head, limit, body: css.slice(start, i - 1) });
  }
  return blocks;
}

function narrowLimit(head) {
  const hit = /max-width\s*:\s*(\d+)px/.exec(head);
  if (!hit) return null;
  return Number(hit[1]);
}

/** 选择器里出现的类名，用于判断某条规则在窄屏媒体块里是否有收口。 */
function classesIn(text) {
  const set = new Set();
  for (const m of text.matchAll(/\.([a-zA-Z0-9_-]+)/g)) set.add(m[1]);
  return set;
}

const IGNORE_CLASS = /(?:^|[-_])(sr-only|visually-hidden)$/;

function auditFile(file) {
  const css = cssText(file);
  if (!css.includes("{") || !css.includes("}")) return [];
  const blocks = mediaBlocks(css);
  const narrowClasses = new Set();
  for (const b of blocks) {
    if (b.limit !== null && b.limit <= COVER_LIMIT) {
      for (const c of classesIn(b.body)) narrowClasses.add(c);
    }
  }
  // 规则本身（不在 media 里）也要看：media 外的固定宽度才是窄屏溢出的元凶。
  const outside = css.replace(/@media[^{]*\{/g, "@media-disabled{");
  const issues = [];
  const declRe = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = declRe.exec(outside))) {
    const selector = m[1].trim();
    const body = m[2];
    if (selector.startsWith("@")) continue;
    // 带 max-width 兜底的固定宽度（如 width:560px;max-width:96vw）不会撑破窄屏，跳过。
    if (/max-width\s*:\s*(?:\d+(?:\.\d+)?(?:%|vw)|calc\()/.test(body) || /width\s*:\s*min\(/.test(body)) {
      // 仅当 max-width 不是固定像素值时才认为安全
      if (!/max-width\s*:\s*\d+px/.test(body)) continue;
    }
    // 两列以上的固定栅格：把 minmax(240px,…) 与裸 px 轨道加起来，超过预算就算问题。
    const grid = /grid-template-columns\s*:\s*([^;}]+)/.exec(body);
    if (grid) {
      const tracks = grid[1].split(/\s+/).filter(Boolean);
      const fixed = tracks.reduce((sum, t) => {
        const px = /^minmax\((\d+)px/.exec(t) || /^min\((\d+)px/.exec(t) || /^(\d+)px$/.exec(t);
        return sum + (px ? Number(px[1]) : 0);
      }, 0);
      const classes = [...classesIn(selector)].filter((c) => !IGNORE_CLASS.test(c));
      const covered = classes.some((c) => narrowClasses.has(c));
      if (fixed > WIDTH_BUDGET && classes.length && !covered) {
        issues.push({
          file: path.relative(ROOT, file),
          selector,
          value: fixed,
          kind: "grid-columns",
        });
      }
    }
    const minW = /min-width\s*:\s*(\d+)px/.exec(body);
    const fixW = /(?<!min-|max-)width\s*:\s*(\d+)px/.exec(body);
    const value = minW ? Number(minW[1]) : fixW ? Number(fixW[1]) : null;
    if (value === null) continue;
    const classes = [...classesIn(selector)].filter((c) => !IGNORE_CLASS.test(c));
    if (!classes.length) continue;
    const isTable = /table/.test(selector);
    const budget = isTable ? TABLE_MIN_BUDGET : WIDTH_BUDGET;
    if (value <= budget) continue;
    // 同一元素在别的规则里用 vw/% 收过 max-width 时（如 .wbt-modal.wide 继承
    // .wbt-modal 的 max-width:96vw），固定宽度不会真实溢出。
    const capped = classes.some((c) =>
      new RegExp("\\." + c + "[^{}]*\\{[^}]*max-width\\s*:\\s*[^;}]*vw").test(css),
    );
    if (capped) continue;
    const covered = classes.some((c) => narrowClasses.has(c));
    if (covered) continue;
    issues.push({
      file: path.relative(ROOT, file),
      selector,
      value,
      kind: isTable ? "table-min-width" : minW ? "min-width" : "width",
    });
  }
  return issues;
}

const files = [];
for (const plugin of readdirSync(ADDONS)) {
  const dir = path.join(ADDONS, plugin, "client");
  try {
    walk(dir, files);
  } catch {
    /* 插件没有 client 目录 */
  }
}

const issues = files.flatMap(auditFile);
const byPlugin = new Map();
for (const it of issues) {
  const plugin = it.file.split("/")[2] || "-";
  if (!byPlugin.has(plugin)) byPlugin.set(plugin, []);
  byPlugin.get(plugin).push(it);
}

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ issues }, null, 2));
} else if (!issues.length) {
  console.log("NARROW UI AUDIT PASS: 没有发现超出窄屏预算的固定宽度");
} else {
  for (const [plugin, list] of [...byPlugin].sort()) {
    console.log(`\n${plugin}（${list.length}）`);
    for (const it of list) {
      console.log(`  ${it.kind} ${it.value}px  ${it.selector}`);
      console.log(`    ${it.file}`);
    }
  }
}
process.exit(issues.length ? 1 : 0);
