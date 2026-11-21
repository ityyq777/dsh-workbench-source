/**
 * 测试用极简 React 运行时：展开函数组件、按组件树路径保存 hook 帧，支持事件回调后重绘。
 * 共享控件在模块顶层 require('react')，这里把这层 require 也接管，避免真 hooks 在渲染函数外抛错。
 * 每个 createRenderer() 实例自带一套组件帧，互不串状态（等价于各自独立挂载）。
 */
import Module, { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

let cursor = null;
let effects = [];

export const React = {
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
    const frame = cursor, i = frame.idx++;
    const prev = frame.deps[i];
    if (!prev || !next || next.some((x, j) => x !== prev[j])) { frame.deps[i] = next; effects.push(fn); }
  },
  useLayoutEffect: (fn, next) => React.useEffect(fn, next),
};

const load = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'react' && parent && String(parent.filename || '').includes('/packages/addons/')) return React;
  return load.apply(this, arguments);
};

function expand(node, path, state) {
  if (node == null || typeof node !== 'object') return node;
  if (Array.isArray(node)) return node.map((child, i) => expand(child, path + '/' + i, state));
  if (node.type === 'Fragment') return (node.children || []).map((child, i) => expand(child, path + '/f' + i, state));
  if (typeof node.type === 'function') {
    const name = node.type.displayName || node.type.name || 'C';
    const key = path + '|' + name;
    let frame = state.frames.get(key);
    if (!frame) { frame = { slots: [], deps: [], idx: 0 }; state.frames.set(key, frame); }
    frame.epoch = state.epoch;
    const prev = cursor;
    cursor = frame;
    cursor.idx = 0;
    let out;
    try { out = node.type(node.props); } finally { cursor = prev; }
    return expand(out, key, state);
  }
  const kids = node.children && node.children.length
    ? node.children
    : [].concat(node.props && node.props.children != null ? node.props.children : []).filter(x => x != null);
  return { type: node.type, props: node.props, children: kids.map((child, i) => expand(child, path + '/' + i, state)) };
}

/**
 * 用固定 props 渲染组件；props 可在两次 paint 之间改，组件帧按路径复用，等同 React 的状态保留。
 * 返回展开后的宿主元素树。
 */
export function createRenderer() {
  const state = { frames: new Map(), epoch: 0 };
  return function paint(component, props) {
    state.epoch += 1;
    effects = [];
    const rendered = expand(React.createElement(component, props), 'root', state);
    // 真 React 里弹层关闭就是卸载；这一轮没出现的组件帧直接丢掉。
    for (const [key, frame] of state.frames) if (frame.epoch !== state.epoch) state.frames.delete(key);
    effects.forEach(fn => fn());
    return rendered;
  };
}

export const all = node => (node && typeof node === 'object' ? [node, ...(node.children || []).flatMap(all)] : []);
export const textOf = node => (typeof node === 'string' ? node : node && typeof node === 'object' ? (node.children || []).map(textOf).join('') : '');
export const klass = node => String((node && node.props && node.props.className) || '');
