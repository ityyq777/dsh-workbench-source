// 「Action」共享视图的信息层级回归：每个 action 卡片只保留「参数数 / 必填」两个 badge，
// 域名只在页头出现一次（历史问题：card() 里逐条重复渲染 domain badge，39 条就重复 39 次）。
// 这里用三个真实域的 actionSchema 输出（任务 / 站点 / 保险箱）跑同一份共享视图。
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createReact } from "./data-ui-harness.mjs";

const require = createRequire(import.meta.url);
const { readFileSync } = require("node:fs");
const { dirname, resolve } = require("node:path");
const { createContext, runInContext } = require("node:vm");
const { fileURLToPath } = require("node:url");

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const VIEW_SRC = resolve(ROOT, "packages/addons/lib/action-schema-view.cjs");

function loadView(React) {
  const sandbox = createContext({ console, Promise, Set, Map, JSON, Object, Array, String, Number, Error, RegExp, Date });
  const cache = new Map();
  function loadOnce(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const mod = { exports: {} };
    cache.set(file, mod);
    const requireStub = (name) => {
      if (name === "react") return React;
      if (name.startsWith("./")) return loadOnce(resolve(dirname(file), name));
      throw new Error("Unexpected runtime dependency: " + name);
    };
    runInContext("(function (module, exports, require) {" + readFileSync(file, "utf8") + "\n})", sandbox)(
      mod, mod.exports, requireStub,
    );
    return mod.exports;
  }
  return loadOnce(VIEW_SRC);
}

const kids = (node) => {
  const c = node && node.props ? node.props.children : null;
  return c == null ? [] : Array.isArray(c) ? c.flat(Infinity).filter((x) => x != null) : [c];
};
const walk = (n) => (n && typeof n === "object" ? [n, ...kids(n).flatMap(walk)] : []);
const text = (n) => {
  if (n == null || typeof n === "boolean") return "";
  if (typeof n === "string" || typeof n === "number") return String(n);
  return kids(n).map(text).join(" ");
};
const hasClass = (n, cls) => String((n.props && n.props.className) || "").split(/\s+/).includes(cls);
const findAll = (tree, fn) => walk(tree).filter(fn);

async function renderSchema(schema) {
  const rt = createReact();
  const view = loadView(rt.React)({ domain: schema.domains[0].id, prefix: "wbt" });
  const api = {
    call: (name) => {
      const short = schema.domains[0].id.replace(/^wb-addon-/, "");
      assert.equal(name, short + ".actionSchema", "只读本域 actionSchema");
      return Promise.resolve({ ok: true, result: schema });
    },
  };
  rt.mount(view.ActionSchemaView, { api, lang: "zh" });
  await new Promise((r) => setImmediate(r));
  return rt.rerender();
}

function assertCards(tree, domain) {
  const heads = findAll(tree, (n) => hasClass(n, "wbt-as-cardhead"));
  assert.ok(heads.length > 5, domain + " 应渲染多张卡片，实际 " + heads.length);
  for (const head of heads) {
    const badges = findAll(head, (n) => hasClass(n, "wbt-as-badge")).map((n) => text(n).trim());
    assert.equal(badges.some((b) => b.includes("wb-addon")), false, domain + " 卡片内不得重复域名：" + badges.join(" | "));
    assert.ok(badges.length >= 1 && badges.length <= 2, domain + " 卡片只保留参数数与必填：" + badges.join(" | "));
  }
  const body = text(tree);
  const hits = (body.match(new RegExp(domain, "g")) || []).length;
  assert.equal(hits, 1, domain + " 全页只应在页头出现一次，实际 " + hits + " 次");
}

// 1) 保险箱：真实域启动（39 个 action，与界面「39 / 39」一致）
{
  process.env.WB_HOME = process.env.WB_HOME || "/tmp/wb-action-badge";
  const { DatabaseSync } = await import("node:sqlite");
  const { createDomain } = await import("../packages/addons/vault/lib/index.js");
  const db = new DatabaseSync(":memory:");
  const domain = createDomain({ addons: { register() {} }, sync: { tables: [] }, now: () => Date.now() });
  const actions = new Map();
  domain.setup({
    db, now: () => Date.now(), log() {}, tool() {}, hasDomain: () => false,
    action: (n, def) => actions.set(n, def),
    addon: { version: "0.3.4" }, shellVersion: "0.7.0",
  });
  const schema = actions.get("vault.actionSchema").execute({}, { origin: "agent" });
  assert.equal(schema.domains[0].version, "0.3.4");
  assert.ok(schema.actions.length >= 39, "保险箱应返回完整 action 清单");
  assertCards(await renderSchema(schema), "wb-addon-vault");
}

// 2) 任务 / 站点：内存启动，验证共享视图对其它域同样生效
for (const [mod, version] of [["tasks", "5.2.17"], ["sites", "1.12.1"]]) {
  const { setup } = await import(`../packages/addons/${mod}/lib/index.js`);
  const { DatabaseSync } = await import("node:sqlite");
  const db = new DatabaseSync(":memory:");
  const actions = new Map();
  setup({
    db, now: () => Date.now(), log() {}, tool() {}, hasDomain: () => false,
    action: (n, def) => actions.set(n, def),
    addon: { version }, shellVersion: "0.7.0",
  });
  const domainId = "wb-addon-" + mod;
  const schema = actions.get(mod + ".actionSchema").execute({}, { origin: "agent" });
  assert.equal(schema.domains[0].id, domainId);
  assertCards(await renderSchema(schema), domainId);
}

console.log("ACTION PAGE BADGE PASS: vault/tasks/sites 卡片不再重复域名，域名仅页头一次");
