// 宿主只读 schema 快照（GET /workbench/api/schema 背后的 schemaSnapshot）：
// 必须与 actions.list(detail=true) 同源、按域过滤、带示例，且绝不执行 action、不写审计。
import assert from "node:assert/strict";
import { createActions } from "../packages/shell/lib/actions/actions.js";

function build() {
  const executed = [];
  const audited = [];
  const def = (id, version) => ({ id, title: id, version, tables: [], sync: { enabled: false } });
  const actions = new Map([
    ["tasks.list", {
      description: "列出任务",
      input: { type: "object", properties: { titleKey: { type: "string" } }, required: [] },
      examples: [{ titleKey: "发布" }],
      execute: (args) => { executed.push(args); return {}; },
    }],
    ["tags.list", {
      description: "列出标签",
      input: { type: "object", properties: {}, required: [] },
    }],
  ]);
  const domains = new Map([
    ["wb-addon-tasks", { def: def("wb-addon-tasks", "3.4.6"), actions: new Map([["tasks.list", actions.get("tasks.list")]]), error: null }],
    ["wb-addon-tags", { def: def("wb-addon-tags", "1.6.12"), actions: new Map([["tags.list", actions.get("tags.list")]]), error: null }],
  ]);
  const api = createActions({
    domains,
    SHELL_VERSION: "0.6.5",
    publicInfo: (rec) => ({
      id: rec.def.id,
      title: rec.def.title,
      version: rec.def.version,
      enabled: rec.error === null,
      error: rec.error,
    }),
    audit: { list: (...args) => { audited.push(args); return {}; }, get: () => null, stats: () => ({}) },
    clock: { now: () => 0 },
    emit: () => {},
    db: null,
  });
  return { api, executed, audited };
}

// 1) 指定域：只返回该域 action 与该域信息，示例随 schema 一起返回。
const one = build();
const tasks = one.api.schemaSnapshot("wb-addon-tasks");
assert.deepEqual(tasks.domains.map((d) => d.id), ["wb-addon-tasks"]);
assert.deepEqual(tasks.actions.map((a) => a.name), ["tasks.list"]);
assert.equal(tasks.shellVersion, "0.6.5");
assert.equal(tasks.domains[0].version, "3.4.6", "版本号来自运行时注册");
assert.deepEqual(tasks.actions[0].examples, [{ titleKey: "发布" }], "示例必须来自 action 定义");
assert.equal(tasks.actions[0].input.properties.titleKey.type, "string");
assert.equal(tasks.actions[0].params[0], "titleKey");

// 2) 不传域：返回全部业务域与宿主元 action，但不含执行副作用。
const all = one.api.schemaSnapshot();
const ids = all.domains.map((d) => d.id);
assert.ok(ids.includes("wb-addon-tasks") && ids.includes("wb-addon-tags"), "应包含全部业务域");
assert.ok(ids.includes("wb-shell"), "应包含宿主元 action 域");
const names = all.actions.map((a) => a.name);
assert.ok(names.includes("tasks.list") && names.includes("tags.list"));
assert.ok(names.includes("audit.list") && names.includes("capabilities.setTaskTarget"), "元 action 也应在快照里");
const metaEntry = all.actions.find((a) => a.name === "audit.list");
assert.equal(metaEntry.domain, "wb-shell");
assert.equal(metaEntry.examples.length, 2, "元 action 的示例来自注册定义");
const noExample = all.actions.find((a) => a.name === "tags.list");
assert.deepEqual(noExample.examples, [], "没有 examples 的 action 返回空数组而不是伪造示例");

// 3) 只读：读取 schema 不能触发任何 execute，也不能写审计。
assert.deepEqual(one.executed, [], "读取 schema 不得执行 action");
assert.deepEqual(one.audited, [], "读取 schema 不得产生审计记录");

// 4) 未知域：返回空集合而不是报错或回退到全部。
const unknown = one.api.schemaSnapshot("wb-addon-missing");
assert.deepEqual(unknown.actions, []);
assert.deepEqual(unknown.domains, []);

console.log("SCHEMA SNAPSHOT TEST PASS: 按域过滤、带示例、无执行副作用");
