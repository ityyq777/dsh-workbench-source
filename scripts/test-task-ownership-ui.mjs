/**
 * 实际组件事件回归；不碰生产库、安装或生成产物。
 * 创建弹窗已改成共享分阶段外壳（lib/staged-dialog.cjs），这里用一个极简 React 运行时
 * 展开函数组件、按组件树路径保存 hook 帧，再按步骤点击「下一步」驱动断言。
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const copy = require('../packages/addons/tasks/client/ui/copy.cjs');
const ownership = require('../packages/addons/tasks/client/modals/ownership.cjs');

// ---- 极简 React 运行时：函数组件展开 + 路径级 hook 帧 ----
const React = {
  // 与 React 一致：children 同时进 props.children（组件内部会读它），元素本身也留一份便于遍历。
  createElement: (type, props, ...children) => {
    const kids = children.flat(Infinity).filter(x => x != null);
    const next = Object.assign({}, props || {});
    if (kids.length) next.children = kids.length === 1 ? kids[0] : kids;
    return { type, props: next, children: kids };
  },
  Fragment: 'Fragment',
  useId: () => 'uid-1',
  useState: init => {
    // 闭包里必须锁住本帧：事件回调执行时全局 cursor 早已还原。
    const frame = cursor, i = frame.idx++;
    if (!(i in frame.slots)) frame.slots[i] = typeof init === 'function' ? init() : init;
    return [frame.slots[i], v => { frame.slots[i] = typeof v === 'function' ? v(frame.slots[i]) : v; }];
  },
  useRef: init => {
    const frame = cursor, i = frame.idx++;
    if (!(i in frame.slots)) frame.slots[i] = { current: init === undefined ? null : init };
    return frame.slots[i];
  },
  useMemo: fn => fn(),
  useCallback: fn => fn,
  useEffect: (fn, next) => {
    const i = cursor.idx++;
    const prev = cursor.deps[i];
    if (!prev || !next || next.some((x, j) => x !== prev[j])) { cursor.deps[i] = next; effects.push(fn); }
  },
  useLayoutEffect: (fn, next) => React.useEffect(fn, next),
};

let frames, cursor, effects, epoch;

// 这些共享控件自己 require 真实 react，展开会触发 Invalid hook call；按叶子处理，直接读它们的 props。
const leafs = new Set();
for (const mod of [
  '../packages/addons/lib/number-field.cjs', '../packages/addons/lib/switch.cjs',
  '../packages/addons/lib/date-picker.cjs', '../packages/addons/lib/client-common.cjs',
  '../packages/addons/lib/button.cjs', '../packages/addons/lib/icons.cjs',
  '../packages/addons/lib/filter-checklist.cjs', '../packages/addons/lib/skeleton.cjs',
]) {
  const exports = require(mod);
  (function collect(value) {
    if (typeof value === 'function') leafs.add(value);
    else if (value && typeof value === 'object') Object.keys(value).forEach(k => collect(value[k]));
  })(exports);
}

function frameAt(key) {
  let f = frames.get(key);
  if (!f) { f = { slots: [], deps: [], idx: 0 }; frames.set(key, f); }
  f.epoch = epoch;
  return f;
}

function expand(node, path) {
  if (node == null || typeof node !== 'object') return node;
  if (Array.isArray(node)) return node.map((c, i) => expand(c, path + '/' + i));
  if (node.type === 'Fragment') return (node.children || []).map((c, i) => expand(c, path + '/f' + i));
  if (typeof node.type === 'function' && leafs.has(node.type)) {
    return { type: node.type, props: node.props, children: [] };
  }
  if (typeof node.type === 'function') {
    const name = node.type.displayName || node.type.name || 'C';
    const key = path + '|' + name;
    const prev = cursor;
    cursor = frameAt(key);
    cursor.idx = 0;
    let out;
    try { out = node.type(node.props); } finally { cursor = prev; }
    return expand(out, key);
  }
  const kids = node.children && node.children.length ? node.children : [].concat(node.props && node.props.children != null ? node.props.children : []).filter(x => x != null);
  return { type: node.type, props: node.props, children: kids.map((c, i) => expand(c, path + '/' + i)) };
}

const all = n => (n && typeof n === 'object' ? [n, ...(n.children || []).flatMap(all)] : []);
const textOf = n => (typeof n === 'string' ? n : n && typeof n === 'object' ? (n.children || []).map(textOf).join('') : '');
const klass = n => String((n && n.props && n.props.className) || '');

function find(tree, test, label) {
  const node = all(tree).find(test);
  assert.ok(node, 'control exists: ' + (label || ''));
  return node;
}
function findByText(tree, text) {
  return find(tree, n => n.type === 'button' && textOf(n) === text, text);
}
function findByLabel(tree, label) {
  return find(tree, n => n.props && n.props['aria-label'] === label, label);
}

const Create = require('../packages/addons/tasks/client/modals/create-modal.cjs')({
  React, tagNames: () => [], splitTags: () => [], today: () => '2026-11-09', addDays: () => '2026-11-09', hostHasAddon: () => false,
});
const Edit = require('../packages/addons/tasks/client/modals/edit-modal.cjs')(React, () => ({ cls: 'active' }), () => '');
const tree = [{ id: 'root', type: '2', name: '任务根', children: [{ id: 'group', type: '0', name: '插件', children: [
  { id: 'table', type: '1', name: 'storage', description: '存储插件开发职责' },
  { id: 'other', type: '1', name: 'tasks', description: '任务插件开发职责' },
] }] }];

function mount(opts = {}) {
  frames = new Map(); epoch = 0;
  const component = opts.component || Create;
  let closed = 0, saved = 0; const calls = [];
  const props = {
    t: copy.zh, source: opts.source || '0', tree, defaultTableId: 'table', lang: 'zh',
    originTask: { id: 'original', tableId: 'table', priority: 4, timelineId: 'line' },
    task: { id: 'original', title: 'Old', status: '0', tableId: 'table', priority: 4 },
    api: { call: async (action, args) => {
      if (action === 'tasks.capabilities') return { ok: true };
      // 只记录写操作；选择器挂载时读时间线/工作区属于噪声。
      if (action === 'tasks.create' || action === 'tasks.update') calls.push({ action, args });
      return opts.response || { ok: true, result: { tablePath: '插件/storage' } };
    } },
    onCreated: () => saved++, onSaved: () => saved++, onClose: () => closed++,
  };
  function paint() {
    epoch += 1; effects = [];
    const prev = cursor;
    cursor = frameAt('root'); cursor.idx = 0;
    let out;
    try { out = component(props); } finally { cursor = prev; }
    const rendered = expand(out, 'root');
    // 真 React 里弹层关闭就是卸载；这一轮没出现的组件帧直接丢掉。
    for (const [key, frame] of frames) if (frame.epoch !== epoch) frames.delete(key);
    effects.forEach(fn => fn());
    return rendered;
  }
  const ui = {
    props, calls, paint,
    closed: () => closed,
    saved: () => saved,
    node: () => paint(),
    error: () => { const node = all(paint()).find(n => klass(n) === 'wbctl-dialog-err'); return node ? textOf(node) : ''; },
    title(value) { findByTextless(paint(), 'input', 'wbt-input').props.onChange({ target: { value } }); },
    description(value) { findByTextless(paint(), 'textarea').props.onChange({ target: { value } }); },
    next() { findByText(paint(), copy.zh.nextStep || '下一步').props.onClick(); },
    // 步骤数随开关（标签步是否出现）变化，测试一律「点到主按钮变成创建为止」。
    toConfirm() {
      for (let i = 0; i < 12; i += 1) {
        const btn = ui.primary();
        if (textOf(btn) === copy.zh.create) return;
        btn.props.onClick();
      }
      throw new Error('没能走到确认步');
    },
    primary() { return find(paint(), n => n.type === 'button' && /wbctl-btn-p|wbt-btn primary/.test(klass(n)), '主按钮'); },
    submit() { return ui.primary().props.onClick(); },
    stepper() { return find(paint(), n => klass(n) === 'wbctl-steps', '步骤条'); },
    openTablePicker() { findByText(paint(), '选择目标任务表').props.onClick(); },
    changeTablePicker() { findByText(paint(), '更换任务表').props.onClick(); },
    chooseTable(prefix) {
      find(paint(), n => n.props && n.props.role === 'option' && String(n.props['aria-label'] || '').startsWith(prefix), '任务表选项 ' + prefix).props.onClick();
    },
    switchByText(text) {
      // 共享开关是叶子组件：直接调用它的 onChange 模拟点按。
      return find(paint(), n => n.props && typeof n.props.onChange === 'function' && String(n.props.label || '').includes(text), '开关 ' + text);
    },
    inputByAria(label) { return findByLabel(paint(), label); },
    cancel() { findByText(paint(), copy.zh.cancel).props.onClick(); },
  };
  return ui;
}

function findByTextless(tree, type, cls) {
  return find(tree, n => n.type === type && (!cls || klass(n) === cls), type + ' ' + (cls || ''));
}

let cases = 0;
// 1) 归属：选表前不能前进，选表后提交带 tableId / source
for (const source of ['0', '1', '2']) {
  const ui = mount({ source });
  ui.title('Keep my title');
  ui.next();
  ui.next(); // 归属步缺表，停在本步并报错
  assert.match(ui.error(), /表/);
  assert.equal(ui.calls.length, 0);
  assert.equal(ownership.tables(ui.props.tree)[0].path, '任务根 / 插件 / storage');
  ui.openTablePicker();
  ui.chooseTable('storage，');
  ui.toConfirm();
  assert.equal(ui.primary().props.disabled, false);
  ui.submit();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(ui.calls[0].args.tableId, 'table');
  assert.equal(ui.calls[0].args.tablePath, undefined);
  assert.equal(ui.calls[0].args.source, source);
  cases++;
}
// 2) 树变化：失效的选择被清空，内容保留，主按钮再次禁用
{
  const ui = mount();
  ui.title('Keep text');
  ui.next();
  ui.openTablePicker();
  ui.chooseTable('storage，');
  ui.toConfirm();
  ui.props.tree = [];
  const rendered = ui.paint();
  assert.equal(ui.primary().props.disabled, true);
  assert.ok(JSON.stringify(rendered).includes('Keep text'));
  cases++;
}
// 3) 新建节点路径：预览与确认后才提交，取消关闭
for (const cancel of [true, false]) {
  const ui = mount();
  ui.title('Create path');
  ui.next();
  ui.switchByText('没有合适的表？新建节点').props.onChange(true);
  ui.inputByAria('新路径').props.onChange({ target: { value: '插件/新组/新表' } });
  ui.inputByAria('节点职责 2').props.onChange({ target: { value: '新组的职责' } });
  ui.inputByAria('节点职责 3').props.onChange({ target: { value: '新表的职责' } });
  ui.next();
  assert.match(ui.error(), /路径|确认|表/, '未确认新建路径时停在归属步');
  ui.switchByText('确认以上路径与职责').props.onChange(true);
  ui.toConfirm();
  assert.equal(ui.calls.length, 0, '预览与确认都不写节点');
  if (cancel) {
    ui.cancel();
    assert.equal(ui.closed(), 1);
    assert.equal(ui.calls.length, 0);
  } else {
    ui.submit();
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(ui.calls[0], { action: 'tasks.create', args: {
      title: 'Create path', description: '', tags: [], status: '0', priority: 1, difficulty: 0, publishDate: '2026-11-09', targetDate: '2026-11-09', source: '0',
      tablePath: ['插件', '新组', '新表'], createMissing: true, pathDescriptions: ['', '新组的职责', '新表的职责'],
    } });
  }
  cases++;
}
// 4) 失败：保留标题与正文，选择被清空，错误显示
{
  const ui = mount({ response: { ok: false, error: 'TABLE_NOT_FOUND: removed' } });
  ui.title('Failure keeps title');
  ui.description('Failure keeps body');
  ui.next();
  ui.openTablePicker();
  ui.chooseTable('storage，');
  ui.toConfirm();
  ui.submit();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(ui.saved(), 0);
  assert.match(ui.error(), /TABLE_NOT_FOUND/);
  assert.ok(JSON.stringify(ui.paint()).includes('Failure keeps body'));
  cases++;
}
// 5) 编辑弹窗仍是单页表单：换表走选择器，提交 tasks.update
for (const target of ['', 'tasks，']) {
  const ui = mount({ component: Edit });
  if (target) { ui.changeTablePicker(); ui.chooseTable(target); }
  ui.submit();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(ui.calls[0].action, 'tasks.update');
  assert.equal(ui.calls[0].args.tableId, target ? 'other' : undefined);
  assert.equal(ui.calls[0].args.type, undefined);
  cases++;
}
assert.match(ownership.preview(tree, '插件/storage/child', ['', '', 'desc']).error, /类型冲突/);
console.log('TASK OWNERSHIP UI PASS { cases: ' + cases + ' }');
