import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const createTabs = require('../packages/shell/client/system-tabs.cjs');
const locale = require('../packages/shell/client/locale.cjs').zh;
const slots = []; let cursor = 0; let cleanup; const queue = [];
const react = {
  Fragment: 'fragment',
  useState(value) { const i = cursor++; if (!(i in slots)) slots[i] = value; return [slots[i], next => { slots[i] = typeof next === 'function' ? next(slots[i]) : next; }]; },
  useRef(value) { const i = cursor++; return slots[i] ||= { current: value }; },
  useEffect(fn) { const i = cursor++; if (!(i in slots)) { slots[i] = true; cleanup = fn(); } },
};
const jsx = { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
const originalFetch = globalThis.fetch;
globalThis.fetch = url => new Promise((resolve, reject) => queue.push({ url: new URL(url, 'http://localhost'), resolve, reject }));
const { AuditTab, AccountTab, BackupTab } = createTabs(react, jsx, () => ({}));
assert.equal(typeof AccountTab, 'function'); assert.equal(typeof BackupTab, 'function');
const render = () => { cursor = 0; return AuditTab({ t: key => locale[key] || key }); };
const walk = node => Array.isArray(node) ? node.flatMap(walk) : node && typeof node === 'object' ? [node, ...walk(node.props.children)] : [];
const text = node => Array.isArray(node) ? node.map(text).join('') : node && typeof node === 'object' ? text(node.props.children) : String(node ?? '');
const field = (tree, label) => walk(walk(tree).find(n => n.type === 'label' && text(n).startsWith(label))).find(n => n.type === 'input' || n.type === 'select');
const change = (label, value) => field(render(), label).props.onChange({ target: { value } });
const button = label => walk(render()).find(n => n.type === 'button' && text(n) === label);
const settle = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
const result = (ok, total = 1) => ({ ok: true, page: 1, total, records: total ? [{ id: 'r', at: 1, actor: 'ui', action: 'test.action', ok, args: '{}' }] : [], stats: { total: 1089, failed: 8 } });
const finish = async (job, data) => { job.resolve({ json: async () => data }); await settle(); };
try {
  render(); const initial = queue.shift(); assert.equal(initial.url.searchParams.has('ok'), false);
  await finish(initial, result(true, 1089));
  change('结果', 'false'); const failed = queue.shift(); assert.equal(failed.url.searchParams.get('ok'), 'false');
  assert.equal(walk(render()).filter(n => n.type === 'tbody').length, 0, 'old records disappear during loading');
  change('结果', 'true'); const success = queue.shift();
  await finish(success, result(true, 1081)); await finish(failed, result(false, 8));
  assert.ok(text(render()).includes('共 1081')); assert.ok(!text(render()).includes('✗'));
  assert.ok(text(render()).includes('不受上方筛选影响'));
  change('结果', 'false'); const stale = queue.shift(); change('结果', 'true'); const latest = queue.shift();
  stale.reject(new Error('stale failure')); await settle(); assert.equal(button('…').props.disabled, true);
  await finish(latest, result(true, 1081)); assert.ok(!text(render()).includes('stale failure'));
  for (const [label, key, value] of [['action 前缀','actionPrefix','tasks.'],['入口','actor','agent'],['关键字','q','needle'],['起始日期','since','2026-01-01'],['结束日期','until','2026-12-31']]) {
    change(label, value); const job = queue.shift(); assert.equal(job.url.searchParams.get(key), value); assert.equal(job.url.searchParams.get('page'), '1'); await finish(job, result(true, 0));
  }
  assert.ok(text(render()).includes('当前筛选无记录')); assert.ok(text(render()).includes('结果=只看成功'));
  button('清除筛选').props.onClick(); const cleared = queue.shift(); for (const key of ['ok','actor','q','since','until','actionPrefix']) assert.equal(cleared.url.searchParams.has(key), false);
  await finish(cleared, result(true, 1089)); assert.equal(field(render(), '结果').props.value, '');
  const form = walk(render()).find(n => n.type === 'form'); let prevented = false;
  form.props.onSubmit({ preventDefault() { prevented = true; } }); assert.ok(prevented); await finish(queue.shift(), result(true, 1089));
  button('下一页').props.onClick(); assert.equal(queue[0].url.searchParams.get('page'), '2'); await finish(queue.shift(), { ...result(true, 1089), page: 2 });
  change('结果', 'false'); assert.equal(queue[0].url.searchParams.get('page'), '1'); await finish(queue.shift(), result(false, 8));
  const row = walk(render()).find(n => n.props.className === 'wb-audit-row'); row.props.onKeyDown({ key: 'Enter', preventDefault() {} });
  assert.equal(walk(render()).find(n => n.props.className === 'wb-audit-row').props['aria-expanded'], true);
  change('结果','true'); queue.shift().reject(new Error('latest failure')); await settle();
  assert.ok(text(render()).includes('latest failure')); assert.equal(button('查询').props.disabled, false);
  walk(render()).find(n => n.type === 'form').props.onSubmit({ preventDefault() {} }); await finish(queue.shift(), result(true, 1081));
  change('结果','true'); const unmounted = queue.shift(); cleanup(); const before = JSON.stringify(slots); await finish(unmounted, result(true, 5)); assert.equal(JSON.stringify(slots), before);
  slots.length = 0; render(); assert.equal(queue.shift().url.searchParams.has('ok'), false); cleanup();
  console.log('AUDIT UI PASS: automatic filters, latest response/error/loading, labels, global stats, empty/clear, pagination, submit, row keyboard, unmount and default reset');
} finally { globalThis.fetch = originalFetch; }
