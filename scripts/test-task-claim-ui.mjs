/** 接取 UI 结构验收：批量动作回执映射 + 客户端文案/入口存在性（不依赖浏览器）。 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const claimBatch = require('../packages/addons/tasks/client/views/claim-batch.cjs');
const copy = require('../packages/addons/tasks/client/ui/copy.cjs');
const t = copy.zh;
assert.equal(t.claimSelected, '接取选中');

const fake = result => ({ call: () => Promise.resolve({ result }) });
const mixed = await claimBatch(fake({ claimed: [{ id: 'a' }], counts: { claimed: 1, alreadyClaimed: 1, notClaimable: 0, notFound: 1, deleted: 0, busy: 0 } }), ['a', 'b', 'c'], t);
assert.deepEqual(mixed.ok, ['a']);
assert.match(mixed.message, /成功 1 条/);
assert.match(mixed.message, /失败 2 条/);
assert.match(mixed.message, /已被接取 1/);
assert.match(mixed.message, /不存在 1/);

const all = await claimBatch(fake({ claimed: [{ id: 'a' }, { id: 'b' }], counts: { claimed: 2 } }), ['a', 'b'], t);
assert.match(all.message, /已接取 2 条任务/);
const bare = await claimBatch({ call: () => Promise.resolve({ claimed: [{ id: 'x' }], counts: { claimed: 1 } }) }, ['x'], t);
assert.deepEqual(bare.ok, ['x']);
const broken = await claimBatch({ call: () => Promise.reject(new Error('boom')) }, ['x'], t);
assert.equal(broken.message, 'boom');

const state = { ids: new Set(['a', 'b']), said: [], refreshed: 0, cleared: 0 };
const run = claimBatch.makeClaimSelected({
  api: fake({ claimed: [{ id: 'a' }], counts: { claimed: 1, alreadyClaimed: 1 } }), t,
  ids: () => Array.from(state.ids), setIds: next => { state.ids = next; },
  clear: () => { state.cleared++; }, say: m => state.said.push(m),
  refreshList: () => { state.refreshed++; }, refreshTagNav: () => { state.refreshed++; },
});
run();
await new Promise(r => setTimeout(r, 10));
assert.deepEqual(Array.from(state.ids), ['b'], '失败项保留勾选');
assert.equal(state.cleared, 0);
assert.equal(state.refreshed, 2);
assert.match(state.said[0], /已被接取 1/);

const src = p => readFileSync(new URL('../packages/addons/tasks/' + p, import.meta.url), 'utf8');
assert.match(src('client/client.src.cjs'), /"4": \{ zh: "已接取", en: "Claimed", cls: "claimed" \}/);
assert.match(src('client/client.src.cjs'), /id: 9, zh: "已接取", en: "Claimed"/);
assert.match(src('client/views/task-filter-panel.cjs'), /\["4",en\?"Claimed":"已接取"\]/);
assert.match(src('client/views/selection-bar.cjs'), /p\.claimSelected/);
assert.match(src('client/views/task-filter-model.cjs'), /9:"4"/);
assert.match(src('client/views/task-filter-model.cjs'), /\^\[0-4\]\$/);
assert.match(src('client/item/task-item.cjs'), /var openLike = String\(task\.status\) === "0" \|\| String\(task\.status\) === "4";/);
assert.match(src('lib/task/read/task-view.js'), /"4": "已接取"/);
assert.match(src('lib/task/read/task-view.js'), /\[>\]/);
assert.doesNotMatch(src('client/views/tasks-view.cjs'), /window\.confirm\(t\.claimSummary/);

console.log('TASK CLAIM UI PASS: batch summary mapping, keep-failed-selection, badge/tab/filter/openLike wiring');
