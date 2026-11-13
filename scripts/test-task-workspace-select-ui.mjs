/** 编辑/新建弹窗的工作区选择器：token 化列表、选中态、长目录省略、四态文案。 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const require = createRequire(import.meta.url), dir = '../packages/addons/tasks/client/';
let state = [], cursor = 0, effects = [];
const memo = (fn, deps) => { const i = cursor++, old = state[i]; if (!old || deps.some((v, j) => v !== old.deps[j])) state[i] = { value: fn(), deps }; return state[i].value; };
const React = {
  createElement: (type, props, ...children) => ({ type, key: props?.key, props: props || {}, children: children.flat(Infinity).filter(x => x != null) }),
  useState: v => { const i = cursor++; if (!(i in state)) state[i] = v; return [state[i], n => state[i] = typeof n === 'function' ? n(state[i]) : n]; },
  useRef: v => { const i = cursor++; return state[i] ||= { current: v }; }, useMemo: memo,
  useCallback: (fn, deps) => memo(() => fn, deps), useEffect: (fn, deps) => memo(() => { effects.push(fn); }, deps),
};
const walk = n => n && typeof n === 'object' ? [n, ...(n.children || []).flatMap(walk)] : [];
const text = n => n && typeof n === 'object' ? (n.children || []).map(text).join('') : String(n ?? '');
const has = (tree, pred) => walk(tree).some(pred);
const plain = v => JSON.parse(JSON.stringify(v));
const reset = () => { state = []; cursor = 0; effects = []; };
const mount = (C, p) => { cursor = 0; return C(p); };
const flush = async () => { const jobs = effects; effects = []; jobs.forEach(fn => fn()); for (let i = 0; i < 20; i++) await Promise.resolve(); };
function load(name) {
  const mod = { exports: {} };
  runInNewContext(readFileSync('packages/addons/tasks/client/' + name, 'utf8'), {
    module: mod, console, navigator,
    require: n => n === 'react' ? React : createRequire(require.resolve(dir + name))(n),
    document: { getElementById() { return true; }, addEventListener() {}, removeEventListener() {} },
    Date, isFinite, setTimeout: fn => { fn(); return 1; }, clearTimeout() {},
  });
  return mod.exports;
}
const Select = load('workspace/workspace-select.cjs')(React).WorkspaceSelect;
const css = readFileSync(new URL('../packages/addons/tasks/client/ui/styles.cjs', import.meta.url), 'utf8');
const LONG_DIR = '/Users/yyq/code/dsh-workbench/packages/addons/tasks/client/workspace/very/deep/directory/that/never/ends';
const ws = (id, title, count, dir) => ({ id, title, taskCount: count, dir });

function api(result) {
  const calls = [];
  return { calls, call: (action, args) => { calls.push({ action, args }); return Promise.resolve(result(action, args)); } };
}
const ok = records => () => ({ ok: true, result: { records } });
const props = (over = {}) => Object.assign({ api: api(ok([])), lang: 'zh', value: [], onChange() {} }, over);

// 1) 取数与列表结构：一次 pageSize 100，listbox + option 语义。
reset();
const listApi = api(ok([ws('w1', 'dsh-workbench 源码', 129, LONG_DIR), ws('w2', '方案文档', 4, '')]));
let tree = mount(Select, props({ api: listApi, value: ['w1'] }));
await flush();
tree = mount(Select, props({ api: listApi, value: ['w1'] }));
assert.deepEqual(plain(listApi.calls[0]), { action: 'taskWorkspaces.list', args: { pageSize: 100 } });
assert.equal(listApi.calls.length, 1, 'loads once');
const list = walk(tree).find(n => n.props && n.props.className === 'wbt-wslist');
assert.ok(list, 'renders .wbt-wslist');
assert.equal(list.props.role, 'listbox');
assert.equal(list.props['aria-multiselectable'], 'true');
const options = walk(tree).filter(n => n.type === 'button' && /wbt-wsopt/.test(n.props.className));
assert.equal(options.length, 2, 'one button per workspace');
assert.ok(options.every(o => o.props.type === 'button' && o.props.role === 'option'), 'native buttons keep Enter/Space working');

// 2) 选中态：accent 类 + aria-selected + ✓，未选中行没有勾。
const on = options.find(o => o.props['aria-selected'] === true);
assert.ok(on, 'selected option is marked');
assert.ok(on.props.className.includes('wbt-wsopt on'));
assert.ok(text(on).includes('\u2713'), 'selected row shows a check mark');
const check = walk(on).find(n => n.props && n.props.className === 'wbt-wsopt-check');
assert.equal(check.props['aria-hidden'], true, 'check mark is decorative');
const off = options.find(o => o.props['aria-selected'] === false);
assert.ok(!text(off).includes('\u2713'), 'unselected row shows no check');

// 3) 长目录：包在 code[title] 里、单行省略；名称同理。
const code = walk(on).find(n => n.type === 'code' && n.props.title === LONG_DIR);
assert.ok(code, 'directory lives in code[title]');
assert.equal(text(code), LONG_DIR);
const name = walk(on).find(n => n.props && n.props.className === 'wbt-wsopt-name');
assert.equal(text(name), 'dsh-workbench 源码');
const meta = walk(on).find(n => n.props && n.props.className === 'wbt-wsopt-meta');
assert.equal(text(meta), '129' + LONG_DIR, 'meta keeps the count then the directory');

// 4) 样式规则存在且只用主题 token（防止回退成浏览器原生按钮）。
for (const sel of ['.wbt-wslist{', '.wbt-wsopt{', '.wbt-wsopt:hover', '.wbt-wsopt.on{', '.wbt-wsopt:focus-visible', '.wbt-wsopt-title{', '.wbt-wsopt-meta code{', '.wbt-wsrow{', '.wbt-wscreate{']) {
  assert.ok(css.includes(sel), 'missing rule ' + sel);
}
const wsRules = css.split('\n').filter(l => /\.wbt-ws(list|opt|row|create|hint)/.test(l)).join('\n');
assert.ok(wsRules.trim(), 'workspace rules found');
assert.ok(!/#[0-9a-f]{3,8}\b/i.test(wsRules), 'workspace rules use no hard-coded hex');
assert.ok(!/rgb\(/i.test(wsRules), 'workspace rules use no hard-coded rgb');
assert.ok(wsRules.includes('var(--wbt-accent)') && wsRules.includes('var(--wbt-line)'), 'workspace rules use theme tokens');
assert.ok(/\.wbt-wslist\{[^}]*max-height:200px/.test(css), 'list caps at 200px and scrolls');
assert.ok(/\.wbt-wsopt-name\{[^}]*text-overflow:ellipsis/.test(css), 'title truncates instead of widening the dialog');
assert.ok(/\.wbt-wsopt-meta code\{[^}]*text-overflow:ellipsis/.test(css), 'directory truncates');

// 5) 搜索过滤 + 无匹配文案。
reset();
const searchApi = api(ok([ws('w1', 'dsh-workbench 源码', 129, LONG_DIR), ws('w2', '方案文档', 4, '')]));
tree = mount(Select, props({ api: searchApi }));
await flush();
tree = mount(Select, props({ api: searchApi }));
const input = walk(tree).find(n => n.type === 'input' && n.props.placeholder === '搜索工作区');
assert.equal(input.props['aria-label'], '搜索工作区');
input.props.onChange({ target: { value: '方案' } });
tree = mount(Select, props({ api: searchApi }));
const filtered = walk(tree).filter(n => n.type === 'button' && /wbt-wsopt/.test(n.props.className));
assert.equal(filtered.length, 1, 'keyword narrows the list');
input.props.onChange({ target: { value: '不存在的工作区' } });
tree = mount(Select, props({ api: searchApi }));
assert.equal(walk(tree).filter(n => n.type === 'button' && /wbt-wsopt/.test(n.props.className)).length, 0);
assert.ok(text(tree).includes('没有匹配的工作区'), 'empty search shows the dedicated hint');

// 6) 加载 / 失败 / 未关联 三种状态共用 hint 与 err 类。
reset();
let pending;
const slowApi = { call: () => new Promise(r => { pending = r; }) };
tree = mount(Select, props({ api: slowApi }));
assert.ok(text(tree).includes('加载中…'), 'loading hint');
assert.ok(walk(tree).find(n => n.props && n.props.className === 'wbt-hint'), 'loading uses .wbt-hint');
reset();
const failApi = api(() => ({ ok: false, error: 'boom' }));
tree = mount(Select, props({ api: failApi }));
await flush();
tree = mount(Select, props({ api: failApi }));
assert.ok(walk(tree).find(n => n.props && n.props.className === 'wbt-err'), 'failure uses .wbt-err');
assert.ok(text(tree).includes('工作区列表加载失败'));
reset();
tree = mount(Select, props({ api: api(ok([])) }));
await flush();
tree = mount(Select, props({ api: api(ok([])) }));
assert.ok(text(tree).includes('未关联工作区'), 'no selection hint');
assert.ok(text(tree).includes('没有匹配的工作区'), 'empty list hint');

// 7) 交互不回退：点候选回传 id 数组，chip 上的 × 移除。
reset();
const changes = [];
const pickApi = api(ok([ws('w1', 'A', 1, ''), ws('w2', 'B', 2, '')]));
tree = mount(Select, props({ api: pickApi, value: ['w1'], onChange: v => changes.push(v) }));
await flush();
tree = mount(Select, props({ api: pickApi, value: ['w1'], onChange: v => changes.push(v) }));
const second = walk(tree).filter(n => n.type === 'button' && /wbt-wsopt/.test(n.props.className))[1];
second.props.onClick();
assert.deepEqual(plain(changes), [['w1', 'w2']], 'adding toggles on');
const chipRemove = walk(tree).find(n => n.type === 'button' && n.props.className === 'wbt-icon');
chipRemove.props.onClick();
assert.deepEqual(plain(changes[1]), [], 'chip × removes');

console.log('TASK WORKSPACE SELECT UI PASS', { options: options.length, states: 4, longDir: LONG_DIR.length });
