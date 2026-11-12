/**
 * 消息配置页的状态回填：configSet 成功后以服务端 values 为准，
 * 连续拖动时旧回包不得覆盖新值，失败回退并提示。
 * 这是「音量拉高又回弹」的回归测试（修复前第 2、3 组会失败）。
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const file = 'packages/addons/message/client/views/config.cjs';
let state = [];
let cursor = 0;
let effects = [];

function memo(fn, deps) {
  const index = cursor++;
  const old = state[index];
  if (!old || !deps || deps.some((value, slot) => value !== old.deps[slot])) state[index] = { value: fn(), deps };
  return state[index].value;
}

const React = {
  createElement: (type, props, ...children) => ({ type, key: props?.key, props: props || {}, children: children.flat(Infinity).filter((x) => x != null) }),
  useState: (value) => {
    const index = cursor++;
    if (!(index in state)) state[index] = value;
    return [state[index], (next) => { state[index] = typeof next === 'function' ? next(state[index]) : next; }];
  },
  useRef: (value) => {
    const index = cursor++;
    state[index] ||= { current: value };
    return state[index];
  },
  useMemo: memo,
  useCallback: (fn, deps) => memo(() => fn, deps),
  useEffect: (fn, deps) => memo(() => { effects.push(fn); }, deps),
};

const walk = (node) => (node && typeof node === 'object' ? [node, ...(node.children || []).flatMap(walk)] : []);
const text = (node) => (node && typeof node === 'object' ? (node.children || []).map(text).join('') : String(node ?? ''));
const find = (tree, pred) => {
  const hit = walk(tree).find(pred);
  assert.ok(hit, 'expected node: ' + pred.toString());
  return hit;
};
const flush = async () => {
  const jobs = effects;
  effects = [];
  jobs.forEach((fn) => fn());
  for (let i = 0; i < 12; i++) await Promise.resolve();
};

const ITEMS = [
  { id: 'sound.enabled', group: 'sound', type: 'bool', zh: '新消息提示音', default: true },
  { id: 'sound.volume', group: 'sound', type: 'number', zh: '音量', min: 0, max: 1, default: 0.4 },
  { id: 'list.pageSize', group: 'list', type: 'enum', zh: '分页', default: 20, values: [{ value: 20, zh: '20 条' }, { value: 50, zh: '50 条' }] },
];
const GROUPS = [{ id: 'sound', zh: '提示音' }, { id: 'list', zh: '列表' }];

const configView = (() => {
  const sandboxModule = { exports: {} };
  runInNewContext(readFileSync(file, 'utf8'), {
    module: sandboxModule,
    console,
    React,
    require: (name) => {
      if (name === 'react') return React;
      if (name.includes('notifier')) return { refreshConfig() {}, preview() {} };
      throw new Error('unexpected require: ' + name);
    },
    document: { addEventListener() {}, removeEventListener() {} },
    window: { EventSource: function () {} },
    setTimeout: () => 0,
  });
  return sandboxModule.exports;
})();

function makeApi(options = {}) {
  const calls = [];
  let volume = options.volume === undefined ? 0.4 : options.volume;
  const pendings = [];
  const api = {
    calls,
    pendings,
    call(name, args) {
      calls.push({ name, args });
      if (name === 'message.configGet') {
        return Promise.resolve({ ok: true, result: { values: { 'sound.enabled': true, 'sound.volume': volume, 'list.pageSize': 20 }, items: ITEMS, groups: GROUPS, overrides: {} } });
      }
      if (name !== 'message.configSet') throw new Error('unexpected call ' + name);
      const patch = args.values;
      if (options.defer) {
        return new Promise((resolve, reject) => {
          pendings.push({ patch, resolve, reject, apply() { volume = patch['sound.volume'] ?? volume; resolve({ ok: true, result: { changed: Object.keys(patch), values: { 'sound.enabled': true, 'sound.volume': volume, 'list.pageSize': 20 } } }); } });
        });
      }
      if (options.failNext) {
        options.failNext -= 1;
        return Promise.resolve({ ok: false, error: '音量需要在 0 到 1 之间' });
      }
      volume = patch['sound.volume'] ?? volume;
      return Promise.resolve({ ok: true, result: { changed: Object.keys(patch), values: { 'sound.enabled': true, 'sound.volume': volume, 'list.pageSize': 20 } } });
    },
  };
  return api;
}

const t = { saved: '已保存', loadFail: '消息加载失败', loading: '加载中', noData: '无数据', resetAll: '全部恢复默认', preview: '试听', configHint: '', quietNote: '', readDaysNote: '' };
const render = (api) => {
  cursor = 0;
  return configView.ConfigView({ api, lang: 'zh', t, Icon: null });
};
const slider = (tree) => find(tree, (node) => node.props && node.props['aria-label'] === '音量');
const volumeField = (tree) => find(tree, (node) => node.props && node.props['data-config'] === 'sound.volume');
const percent = (tree) => find(volumeField(tree), (node) => node.props && node.props.className === 'wbm-note').children.join('');

// 1. 初始：40% 与 0.4。
{
  const api = makeApi();
  let tree = render(api);
  assert.equal(text(tree).includes('加载中'), true, '首次渲染是加载态');
  await flush();
  tree = render(api);
  assert.equal(slider(tree).props.value, 0.4);
  assert.equal(percent(tree), '40%');
}

// 2. 拉到 80%：立即乐观显示，回包后仍停在 80%（修复前会回弹到 0.4）。
{
  const api = makeApi();
  render(api);
  await flush();
  let tree = render(api);
  slider(tree).props.onChange({ target: { value: '0.8' } });
  tree = render(api);
  assert.equal(slider(tree).props.value, 0.8, '拖动后立即显示新值');
  assert.equal(percent(tree), '80%');
  await flush();
  tree = render(api);
  assert.equal(api.calls.filter((call) => call.name === 'message.configSet').length, 1, '只发一次写入');
  assert.equal(JSON.stringify(api.calls[1].args), JSON.stringify({ values: { 'sound.volume': 0.8 } }));
  assert.equal(slider(tree).props.value, 0.8, '回包后保持新值，不回弹');
  assert.equal(percent(tree), '80%');
  assert.equal(text(tree).includes('已保存'), true);
}

// 3. 连续拖动：旧回包晚到也不能覆盖新值。
{
  const api = makeApi({ defer: true });
  render(api);
  await flush();
  let tree = render(api);
  slider(tree).props.onChange({ target: { value: '0.6' } });
  tree = render(api);
  slider(tree).props.onChange({ target: { value: '0.9' } });
  tree = render(api);
  assert.equal(slider(tree).props.value, 0.9);
  api.pendings[1].apply(); // 最后一次先回
  await flush();
  tree = render(api);
  assert.equal(slider(tree).props.value, 0.9, '最新回包落地');
  api.pendings[0].apply(); // 旧回包后到
  await flush();
  tree = render(api);
  assert.equal(slider(tree).props.value, 0.9, '旧回包不覆盖新值');
  assert.equal(percent(tree), '90%');
}

// 4. 写入失败：回退到服务端值并给出提示。
{
  const api = makeApi({ failNext: 1 });
  render(api);
  await flush();
  let tree = render(api);
  slider(tree).props.onChange({ target: { value: '1' } });
  tree = render(api);
  assert.equal(slider(tree).props.value, 1, '失败前先乐观显示');
  await flush();
  tree = render(api);
  assert.equal(slider(tree).props.value, 0.4, '失败后回退旧值');
  assert.equal(text(tree).includes('音量需要在 0 到 1 之间'), true, '失败要有可读提示');
}

// 5. 边界：0 与 100%。
{
  const api = makeApi({ volume: 1 });
  render(api);
  await flush();
  let tree = render(api);
  assert.equal(percent(tree), '100%');
  slider(tree).props.onChange({ target: { value: '0' } });
  tree = render(api);
  assert.equal(percent(tree), '0%');
  await flush();
  tree = render(api);
  assert.equal(slider(tree).props.value, 0);
  assert.equal(percent(tree), '0%');
}

console.log('MESSAGE CONFIG STATE PASS: 5 groups');
