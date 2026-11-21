/** 共享选择器内核回归：本地候选过滤、多选/单选、远端适配（tag-filter）分页取数。
 *
 * 用 scripts/data-ui-harness.mjs 的迷你 React 跑真实 hook/effect，不接触浏览器与构建产物。
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolve } from 'node:path';
import { loadCjs, createReact } from './data-ui-harness.mjs';

const root = resolve(import.meta.dirname, '..');

const text = (node) =>
  Array.isArray(node)
    ? node.map(text).join('')
    : node && typeof node === 'object'
      ? text(node.children || node.props?.children)
      : String(node ?? '');

function findByClass(node, needle) {
  if (Array.isArray(node)) {
    for (const child of node) {
      const hit = findByClass(child, needle);
      if (hit) return hit;
    }
    return null;
  }
  if (!node || typeof node !== 'object') return null;
  if (typeof node.props?.className === 'string' && node.props.className.includes(needle)) return node;
  return findByClass(node.children || node.props?.children, needle);
}

function findInput(node) {
  if (Array.isArray(node)) {
    for (const child of node) {
      const hit = findInput(child);
      if (hit) return hit;
    }
    return null;
  }
  if (!node || typeof node !== 'object') return null;
  if (node.type === 'input') return node;
  return findInput(node.children || node.props?.children);
}

const ITEMS = [
  { id: 'a', name: 'phone2', meta: '手机号' },
  { id: 'b', name: 'phone1', meta: '手机号' },
  { id: 'c', name: 'id', meta: '身份证号' },
  { id: 'd', name: 'QiSheng0417@163.com', meta: '授权码' },
];

function mountPicker(over) {
  const rt = createReact();
  const h = rt.React.createElement;
  const SearchPicker = loadCjs(resolve(root, 'packages/addons/lib/search-picker.cjs'), { react: rt.React });
  const state = { selected: ['a'], changes: [] };
  const props = Object.assign(
    {
      h,
      React: rt.React,
      mode: 'multi',
      label: '凭据',
      items: ITEMS,
      selected: state.selected,
      classes: { root: 'wbsp', btn: 'wbsp-btn', menu: 'wbsp-menu' },
      texts: { all: '全部凭据', searchPlaceholder: '搜索凭据', empty: '还没有凭据', noMatch: '没有匹配的凭据' },
      onChange(next) {
        state.changes.push(next);
        state.selected = next;
        rt.props.selected = next;
        rt.rerender();
      },
    },
    over || {},
  );
  rt.props = props;
  rt.mount(SearchPicker, props);
  return { rt, state, open: () => (findByClass(rt.tree, 'wbsp-btn').props.onClick({ stopPropagation() {} }), rt.rerender()) };
}

test('默认收起：只有触发按钮，没有清单', () => {
  const { rt } = mountPicker();
  assert.match(text(rt.tree), /凭据/);
  assert.equal(findByClass(rt.tree, 'wbck'), null, '未展开时不应渲染清单');
});

test('展开后列出全部候选，输入关键字即时过滤（中文 meta 与大小写无关）', () => {
  const { rt, open } = mountPicker();
  open();
  assert.ok(findByClass(rt.tree, 'wbck'), '展开后应渲染清单');
  assert.ok(text(rt.tree).includes('phone2') && text(rt.tree).includes('QiSheng0417@163.com'));

  findInput(findByClass(rt.tree, 'wbck-input')).props.onChange({ target: { value: '手机' } });
  rt.rerender();
  assert.ok(text(rt.tree).includes('phone2'), '中文 meta 命中');
  assert.equal(text(rt.tree).includes('身份证号'), false, '不匹配项应被过滤掉');

  findInput(findByClass(rt.tree, 'wbck-input')).props.onChange({ target: { value: 'qisheng' } });
  rt.rerender();
  assert.ok(text(rt.tree).includes('QiSheng0417@163.com'), '英文按小写包含匹配');
});

test('多选：再点已选项会从已选中移除', () => {
  const { rt, state, open } = mountPicker();
  open();
  const option = findByClass(rt.tree, 'wbck-opt');
  const checkbox = findInput(option);
  checkbox.props.onChange({});
  assert.deepEqual(state.changes.at(-1), [], '取消勾选应把 id 从已选中移除');
});

test('多选：勾选新项会追加 id', () => {
  const { rt, state, open } = mountPicker({ selected: [] });
  open();
  const option = findByClass(rt.tree, 'wbck-opt');
  findInput(option).props.onChange({});
  assert.deepEqual(state.changes.at(-1), ['a']);
});

test('单选：点选即回调并收起', () => {
  const picked = [];
  const { rt, open } = mountPicker({ mode: 'single', selected: [], onPick: (id) => picked.push(id) });
  open();
  findByClass(rt.tree, 'wbck-opt').props.onClick({});
  assert.deepEqual(picked, ['a']);
  rt.rerender();
  assert.equal(findByClass(rt.tree, 'wbck'), null, '单选后应收起');
});

test('tag-filter 适配层：展开即按页取数，勾选回传 id', async () => {
  const rt = createReact();
  const h = rt.React.createElement;
  const createTagFilter = loadCjs(resolve(root, 'packages/addons/lib/tag-filter.cjs'), { react: rt.React });
  const calls = [];
  const api = {
    call(name, args) {
      calls.push({ name, args });
      return Promise.resolve({
        ok: true,
        result: { tags: [{ id: 't1', name: '前端' }, { id: 't2', name: '发布' }], total: 2, pageNumber: args.pageNumber, hasMore: false },
      });
    },
  };
  const TagFilter = createTagFilter({
    action: 'tasks.tagOptions',
    classes: { root: 'wbt-tagfilter', btn: 'wbt-btn ghost', btnOn: 'on', menu: 'wbt-tagmenu' },
    text: () => ({ label: '标签', all: '全部标签', selected: '已选', clear: '清空', searchPlaceholder: '搜索标签' }),
    items: (rows) => rows.map((x) => ({ id: x.id, name: x.name })),
    mapPage: (out, pageNumber) => ({
      rows: out.tags || [],
      total: out.total || 0,
      page: out.pageNumber || pageNumber,
      hasMore: !!out.hasMore,
    }),
  });
  let changed = null;
  const props = { h, React: rt.React, api, ids: [], onChange: (next) => { changed = next; } };
  rt.mount(TagFilter, props);
  assert.match(text(rt.tree), /标签/);
  findByClass(rt.tree, 'wbt-btn').props.onClick({ stopPropagation() {} });
  rt.rerender();
  await new Promise((r) => setTimeout(r, 10));
  rt.rerender();
  assert.ok(
    calls.some((c) => c.name === 'tasks.tagOptions' && c.args.pageNumber === 1),
    '展开后应取第一页',
  );
  assert.ok(text(rt.tree).includes('前端'), '取回的行应渲染出来');
  findInput(findByClass(rt.tree, 'wbck-opt')).props.onChange({});
  assert.deepEqual(changed, ['t1']);
});
