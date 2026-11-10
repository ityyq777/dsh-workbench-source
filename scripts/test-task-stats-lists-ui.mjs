// 统计清单能力降级回归：缺键/未声明 ≠ 空数组。
// 覆盖 listState 判定、DataTable 缺键提示、后端 capabilities 标记与中英文案。
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { DatabaseSync } from "node:sqlite";
import { setup } from "../packages/addons/tasks/lib/index.js";

const require = createRequire(import.meta.url);
const { listState, missingText, LISTS } = require("../packages/addons/tasks/client/stats/list-state.cjs");
const { makeCharts } = require("../packages/addons/tasks/client/stats/charts.cjs");

// 1) 后端完全没给 lists：缺键，必须判为能力降级。
assert.equal(listState({ totals: {} }, "recentPublish").missing, true);
// 2) lists 在、但没有这个键：仍然缺。
assert.equal(listState({ lists: {} }, "recentPublish").missing, true);
// 3) capabilities 声明了清单但未包含该键：缺，即使键存在也不渲染伪空态。
assert.equal(listState({ lists: { recentPublish: [] }, capabilities: { lists: ["overdue"] } }, "recentPublish").missing, true);
// 4) 声明包含且数组为空：真正的空态。
{
  const st = listState({ lists: { recentPublish: [] }, capabilities: { lists: LISTS } }, "recentPublish");
  assert.equal(st.missing, false);
  assert.deepEqual(st.rows, []);
}
// 5) 旧后端没有 capabilities 字段：按键存在性判断，不误报降级。
assert.equal(listState({ lists: { recentPublish: [{ id: "1" }] } }, "recentPublish").missing, false);
assert.deepEqual(listState({ lists: { recentPublish: [{ id: "1" }] } }, "recentPublish").rows, [{ id: "1" }]);

// 6) 每个清单都在 LISTS 白名单里，未知键直接报错，避免静默渲染。
for (const key of ["overdue", "recentPublish", "recentDone", "recentShutdown"]) assert.ok(LISTS.includes(key));
assert.throws(() => listState({ lists: {} }, "recentUnknown"), /unknown list/);

// 7) 中英文提示都包含清单名，且不出现「还没有」这类空态措辞。
for (const lang of ["zh", "en"]) {
  for (const key of LISTS) {
    const text = missingText(lang, key);
    assert.ok(text.includes(key), lang + " 提示应包含清单名 " + key);
    assert.equal(/还没有|No .* yet/.test(text), false);
  }
}
assert.ok(missingText("zh", "recentPublish").includes("版本可能不一致"));
assert.ok(missingText("en", "recentPublish").includes("versions may differ"));

// 8) DataTable：missing 优先于空数组，渲染诊断提示；键存在但为空才显示空态文案。
const ch = makeCharts("wbt");
const renderToText = (node) => JSON.stringify(node);
{
  const missingNode = ch.DataTable({ rows: [], missing: true, missingText: "接口未返回该清单", columns: [] });
  assert.equal(missingNode.type, ch.Missing);
  assert.ok(renderToText(missingNode).includes("接口未返回该清单"));
  assert.equal(ch.Missing({ text: "诊断提示" }).props.className.includes("wbt-missing"), true);
  const emptyNode = ch.DataTable({ rows: [], missing: false, empty: "还没有发布的任务", columns: [] });
  assert.equal(emptyNode.type, "div");
  assert.ok(renderToText(emptyNode).includes("还没有发布的任务"));
  const rowNode = ch.DataTable({ rows: [{ id: "1", title: "任务" }], missing: false, columns: [{ key: "title", label: "任务" }] });
  assert.ok(renderToText(rowNode).includes("任务"));
}
assert.equal(typeof ch.Missing, "function");

// 9) 后端 statsReport 自带 capabilities.lists，覆盖全部清单。
{
  const db = new DatabaseSync(":memory:");
  db.exec("CREATE TABLE sync_change_log(id INTEGER PRIMARY KEY,table_name TEXT,row_id TEXT,op TEXT,payload TEXT,origin TEXT,updated_at INTEGER)");
  const actions = new Map();
  setup({ db, addon: { version: "test" }, log() {}, hasDomain: () => false, emit() {}, action: (name, def) => actions.set(name, def) });
  const report = actions.get("tasks.statsReport").execute({}, { origin: "agent" });
  assert.deepEqual(report.capabilities.lists, LISTS);
  for (const key of LISTS) assert.equal(Object.prototype.hasOwnProperty.call(report.lists, key), true, "缺清单 " + key);
  db.close();
}

console.log("TASK STATS LISTS UI PASS", { lists: LISTS.length });
