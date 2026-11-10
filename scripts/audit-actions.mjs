#!/usr/bin/env node
/**
 * Action schema 一致性审计（只读，不写业务库、不改文件）。
 *
 * DSH 的 agent 主要靠 action 的 input JSON Schema 决定怎么填参数；schema 一旦
 * 落后于实现，agent 就会漏字段、填错值，或者填了以为生效其实实现没读。
 * 本脚本用假的 DSH ctx 无头加载「宿主 + 四个业务插件」，直接读注册出来的
 * schema（不是静态解析），再和实现做交叉检查：
 *
 *   1. 版本漂移：package.json / wb.addon.version / client.src.cjs / lib/index.js /
 *      lib/client.js（构建产物）里的版本号是否一致（运行实例是否有更新可判断）；
 *   2. required 里有 properties 未声明的字段；
 *   3. 声明了但实现里从不出现的参数（填了不生效）；
 *   4. 实现里出现、schema 没声明、又不在兼容别名表里的参数（agent 发现不了）；
 *   5. docs/插件功能清单.md 是否覆盖所有 action。
 *
 * 用法：node scripts/audit-actions.mjs
 * 退出码：0 全部通过；1 有告警。
 */
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { readLibSource } from "./source-files.mjs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ADDONS = ["tasks", "tags", "sites", "storage"];

/**
 * 兼容层别名：实现接受，但故意不写进 schema，避免污染 agent 的填参视野。
 * 新增别名请登记在这里，否则审计会报“实现里出现但未声明”。
 */
const ALIASES = {
  tasks: ["taskId", "dependsOn", "on", "parent", "nodeId"],
  tags: ["tagId", "itemId", "itemIds", "id", "ids", "current", "page", "size", "keyword", "q"],
  sites: ["siteId", "name", "links", "nodeId", "current", "size", "dirId", "titleKey", "sort_column", "sort_order", "parent"],
};

/**
 * 误报白名单：这些名字在实现里是数据库行字段、聚合结果或 sqlite 语句参数，
 * 不是 action 参数。静态扫描无法完全区分，命中即跳过（新增时请写明原因）。
 */
const NON_SCHEMA = new Set([
  "lft", "rgt", "rev", "open", "overdue", "total", "created_at", "updated_at", "deleted_at",
  "values", // tasks.configSet 的内部值对象（该 action 不对 agent 暴露）
  "filter", // 数组用法 args.filter(...)
  "tab", // 4.0.0 起 tab 已移除，实现只读取它以抛 "tab 参数已移除" 并给 statuses 迁移写法
  "filterRestarted", // 同上：只用于识别旧参数并报错，不再声明为可调参数
]);

const problems = [];
const read = (p) => readFileSync(p, "utf8");

// ---- 无头加载插件，拿到真实注册的 schema -------------------------------

export async function loadActions() {
  process.env.WB_HOME = mkdtempSync(join(tmpdir(), "wb-audit-"));
  let host = null;
  const fakeCtx = {
    webServer: { register: () => () => {} },
    tools: { register: () => {} },
    connection: { requestRejection: () => undefined },
    systemPrompt: { section: () => () => {}, getSectionOrder: () => 500 },
    commands: { register: () => () => {} },
    agents: { get: () => undefined },
    provide: (name, value) => { if (name === "workbench") host = value; },
    effect: (fn) => { const d = fn(); if (typeof d !== "function") return; },
  };

  const shell = await import(pathToFileURL(join(ROOT, "packages/shell/lib/index.js")).href);
  shell.apply(fakeCtx);
  if (!host) throw new Error("宿主没有提供 workbench 服务");

  for (const name of ADDONS) {
    const mod = await import(pathToFileURL(join(ROOT, "packages/addons", name, "lib/index.js")).href);
    mod.apply({ workbench: host, effect: fakeCtx.effect });
  }

  const r = await host.invoke("actions.list", { detail: true }, "agent");
  const actions = (r.result && r.result.actions) || [];
  const caps = await host.invoke("capabilities.list", {}, "agent");
  return { actions, capabilities: (caps.result && caps.result.domains) || [] };
}

// ---- 检查 -----------------------------------------------------------------

function versions(addon) {
  const dir = join(ROOT, "packages/addons", addon);
  const pkgPath = join(dir, "package.json");
  if (!existsSync(pkgPath)) return null;
  const pkg = JSON.parse(read(pkgPath));
  const entries = [
    ["package.json version", pkg.version],
    ["package.json wb.addon.version", pkg.wb && pkg.wb.addon && pkg.wb.addon.version],
  ];
  for (const [label, p] of [
    ["client/client.src.cjs", join(dir, "client/client.src.cjs")],
    ["lib/index.js", join(dir, "lib/index.js")],
    ["lib/client.js", join(dir, "lib/client.js")],
  ]) {
    if (!existsSync(p)) continue;
    const m = read(p).match(/version:\s*"([^"]+)"/);
    entries.push([label, m ? m[1] : "(未找到)"]);
  }
  if (new Set(entries.map(([, v]) => v)).size > 1) {
    problems.push(`${addon}: 版本号不一致 → ` + entries.map(([l, v]) => `${l}=${v}`).join("，"));
  }
  return pkg.version;
}

function libSource(addon) {
  const dir = join(ROOT, "packages/addons", addon, "lib");
  if (!existsSync(dir)) return "";
  return readLibSource(dir);
}

/** Array/String 的内建成员，不是 schema 字段。 */
const BUILTINS = new Set([
  "length", "slice", "splice", "indexOf", "lastIndexOf", "push", "pop", "shift", "unshift",
  "split", "join", "map", "reduce", "forEach", "some", "every", "findIndex", "reverse",
  "concat", "includes", "trim", "toString", "toLowerCase", "toUpperCase", "replace", "match",
  "test", "charAt", "substring", "startsWith", "endsWith", "repeat", "padStart", "padEnd",
  "then", "catch", "hasOwnProperty",
]);

/**
 * 实现里从 args 读到的键。除 `args.x` 外还要跟别名（`const input = args || {}`）
 * 与解构（`const { id, name } = args`）——否则会漏判成“声明了没读”。
 */
function argsKeys(src) {
  const keys = new Set();
  // 只跟直接别名：`const input = args || {}`；不跟 `const row = input` 这类二次引用，
  // 否则会把数据库行对象的字段误判成 schema 字段。
  const alias = new Set(["args"]);
  // 属性值（如 const query = args.query）不是 args 对象别名。
  for (const m of src.matchAll(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*args\b(?!\s*(?:\.|\?\.|\[))/g)) alias.add(m[1]);
  for (const v of alias) {
    const esc = v.replace(/\$/g, "\\$");
    for (const m of src.matchAll(new RegExp("\\b" + esc + "\\s*(?:\\?\\.)?\\.\\s*([A-Za-z_$][\\w$]*)", "g"))) {
      if (!BUILTINS.has(m[1])) keys.add(m[1]);
    }
    for (const m of src.matchAll(new RegExp("\\b" + esc + "\\s*\\[\\s*[\"']([A-Za-z_$][\\w$]*)[\"']\\s*\\]", "g"))) {
      keys.add(m[1]);
    }
    const d = src.match(new RegExp("(?:const|let|var)\\s*\\{[^}]*\\}\\s*=\\s*" + esc + "\\b"));
    if (d) {
      for (const m of d[0].matchAll(/([A-Za-z_$][\w$]*)\s*(?::\s*[A-Za-z_$][\w$]*)?\s*[,}]/g)) {
        if (!BUILTINS.has(m[1]) && m[1] !== "const" && m[1] !== "let") keys.add(m[1]);
      }
    }
  }
  return keys;
}

const { actions, capabilities } = await loadActions();

const byDomain = new Map();
for (const a of actions) {
  const entries = byDomain.get(a.domain) || [];
  entries.push(a);
  byDomain.set(a.domain, entries);
}

const summary = [];
for (const addon of ADDONS) {
  const domainId = "wb-addon-" + addon;
  const version = versions(addon);
  const list = byDomain.get(domainId) || [];
  const src = libSource(addon);
  const declaredAll = new Set();
  for (const a of list) {
    const props = Object.keys((a.input && a.input.properties) || {});
    const required = (a.input && a.input.required) || [];
    for (const p of props) declaredAll.add(p);
    for (const r of required) {
      if (props.indexOf(r) < 0) problems.push(`${addon}/${a.name}: required 里的 ${r} 未在 properties 中声明`);
    }
    for (const p of props) {
      if (!argsKeys(src).has(p)) problems.push(`${addon}/${a.name}: 声明了参数 ${p}，但实现从不读 args.${p}（填了不生效）`);
    }
  }
  const aliases = new Set(ALIASES[addon] || []);
  summary.push({ addon, domainId, version, actions: list, declared: declaredAll, src, aliases });
}

// 别名表之外的“实现里有、schema 没声明”的字段
for (const s of summary) {
  for (const k of argsKeys(s.src)) {
    if (s.declared.has(k) || s.aliases.has(k) || NON_SCHEMA.has(k)) continue;
    problems.push(`${s.addon}: 实现读取 args.${k}，但没有任何 action 声明它（agent 发现不了）`);
  }
}

// 能力清单的 primaryAction 必须真实存在
const actionNames = new Set(actions.map((a) => a.name));
for (const d of capabilities) {
  for (const rec of d.records || []) {
    if (rec.primaryAction && !actionNames.has(rec.primaryAction)) {
      problems.push(`${d.id}: 记录类型 ${rec.kind} 的 primaryAction「${rec.primaryAction}」不存在`);
    }
  }
  if (Array.isArray(d.warnings) && d.warnings.length) {
    for (const w of d.warnings) problems.push(`${d.id}: 能力清单告警 ${JSON.stringify(w)}`);
  }
}

// 文档覆盖：只作为提醒，不算失败——文档常常比代码晚一拍，schema 必须同步、文档可以补。
const docGaps = [];
const docPath = join(ROOT, "docs/插件功能清单.md");
if (existsSync(docPath)) {
  const doc = read(docPath);
  for (const a of actions) {
    if (!doc.includes("`" + a.name + "`")) docGaps.push(a.name);
  }
}

// ---- 输出 -----------------------------------------------------------------

console.log("Action schema 审计");
for (const s of summary) {
  console.log(`  ${s.addon.padEnd(6)} v${s.version}  ${String(s.actions.length).padStart(2)} 个 action，声明 ${s.declared.size} 个参数`);
}

if (docGaps.length) {
  console.log("\n文档待补（docs/插件功能清单.md 未列出，不影响退出码）：" + docGaps.join("、"));
}

if (problems.length) {
  console.log("\n发现 " + problems.length + " 个问题：");
  for (const p of problems) console.log("  ✗ " + p);
  process.exitCode = 1;
} else {
  console.log("\n✓ schema 与实现、版本号、文档一致");
}
process.exit(process.exitCode || 0);
