// 创建弹窗「标签」步：搜索过滤 + 勾选清单 + 新标签输入。
// 用共享迷你 React（scripts/helpers/test-react.mjs）按步驱动，断言提交时的 tags 载荷。
import { React, createRenderer, all, textOf, klass } from './helpers/test-react.mjs';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const dir = '/Users/yyq/code/dsh-workbench/packages/addons/tasks/client/';
const copy = require(dir + 'ui/copy.cjs');

const ALL_TAGS = [
  { id: 1, name: '工作', total: 3 },
  { id: 2, name: '开发', total: 5 },
  { id: 3, name: '生活', total: 2 },
];

function mount(options) {
  const opts = options || {};
  const calls = [];
  const api = {
    call: async (name, args) => {
      calls.push({ action: name, args });
      if (name === 'tasks.capabilities') return { ok: true, result: {} };
      if (name === 'tasks.tagOptions') {
        const query = String(args.query || '').trim();
        const rows = query ? ALL_TAGS.filter(t => t.name.includes(query)) : ALL_TAGS;
        return { ok: true, result: { tags: rows, total: rows.length, hasMore: false } };
      }
      if (name === 'tasks.create') return { ok: true, result: { id: 'new-task' } };
      return { ok: true, result: {} };
    },
  };
  const Create = require(dir + 'modals/create-modal.cjs')({
    React,
    allTables: () => [{ id: 'table', name: 'Table', type: '1' }],
    tagNames: () => [],
    splitTags: v => String(v || '').split(',').map(s => s.trim()).filter(Boolean),
    today: () => '2026-11-09',
    addDays: () => '2026-11-09',
    hostHasAddon: () => (opts.hasTags === undefined ? true : opts.hasTags),
  });
  const paint = createRenderer();
  const props = {
    tree: [{ id: 'table', name: 'Table', type: '1' }],
    t: copy.zh,
    source: '0',
    api,
    onCreated() {},
    onClose() {},
  };
  const render = () => paint(Create, props);
  async function settle() { await new Promise(r => setTimeout(r, 260)); }

  const ui = {
    props,
    calls,
    render,
    settle,
    title(v) {
      all(render()).find(n => n.type === 'input' && klass(n) === 'wbt-input', '标题输入').props.onChange({ target: { value: v } });
    },
    primary() {
      return all(render()).find(n => n.type === 'button' && /wbctl-btn-p/.test(klass(n)), '主按钮');
    },
    next() {
      ui.primary().props.onClick();
    },
    // 标签步：标题填好后点一次「下一步」即进入。
    async openTags() {
      ui.title('Tag step');
      ui.next();
      render(); // 先渲染出标签步，effect 才会发起 tagOptions 查询
      await ui.settle();
      render();
    },
    search(value) {
      all(render()).find(n => n.type === 'input' && n.props.type === 'search', '标签搜索框').props.onChange({ target: { value } });
    },
    options() {
      return all(render()).filter(n => klass(n) === 'wbck-opt').map(textOf);
    },
    checkboxes() {
      return all(render()).filter(n => n.type === 'input' && n.props.type === 'checkbox');
    },
    pick(name) {
      // 勾选清单的每一行是 <label class=wbck-opt><input type=checkbox/><span>名字</span></label>，
      // 输入框本身没有文本，所以要按行找再点里面的复选框。
      const row = all(render()).find(n => klass(n) === 'wbck-opt' && textOf(n).includes(name));
      assert.ok(row, '标签清单里应有 ' + name);
      const box = all(row).find(n => n.type === 'input' && n.props.type === 'checkbox');
      assert.ok(box, name + ' 应有复选框');
      box.props.onChange();
    },
    chips() {
      return all(render()).filter(n => klass(n) === 'wbt-tagchip').map(textOf).map(s => s.replace('×', '').trim());
    },
    removeChip(name) {
      all(render()).find(n => klass(n) === 'wbt-tagchip' && textOf(n).includes(name), '标签 chip ' + name).props.onClick();
    },
    draftInput() {
      return all(render()).find(n => n.type === 'input' && n.props['aria-label'] === copy.zh.tagNewPlaceholder, '新标签输入框');
    },
    typeDraft(value) {
      ui.draftInput().props.onChange({ target: { value } });
    },
    submitDraft() {
      ui.draftInput().props.onKeyDown({ key: 'Enter', preventDefault() {} });
    },
    async toConfirm() {
      let picked = false;
      for (let i = 0; i < 12; i += 1) {
        if (textOf(ui.primary()) === copy.zh.create) return;
        const opt = picked ? null : all(render()).find(n => n.props && n.props.role === 'option' && String(n.props['aria-label'] || '').startsWith('Table'));
        if (opt) { opt.props.onClick(); picked = true; continue; }
        ui.next();
      }
      throw new Error('没能走到末步');
    },
    async submit() {
      ui.primary().props.onClick();
      await new Promise(r => setImmediate(r));
    },
    created() {
      return calls.filter(c => c.action === 'tasks.create');
    },
  };
  return ui;
}

let cases = 0;

// 1) 标签步：有搜索框、有清单，清单来自 tasks.tagOptions
{
  const ui = mount();
  await ui.openTags();
  assert.ok(all(ui.render()).some(n => n.props && n.props.type === 'search'), '标签步应有搜索框');
  assert.deepEqual(ui.options(), ['工作', '开发', '生活']);
  assert.equal(ui.chips().length, 0);
  assert.ok(ui.calls.some(c => c.action === 'tasks.tagOptions'), '应查询已有标签');
  cases++;
}

// 2) 输入关键词后只显示匹配项，并带上 query 重新查询
{
  const ui = mount();
  await ui.openTags();
  ui.search('开发');
  ui.render(); // 触发新 query 的 effect
  await ui.settle();
  ui.render();
  assert.deepEqual(ui.options(), ['开发']);
  assert.ok(ui.calls.some(c => c.action === 'tasks.tagOptions' && c.args.query === '开发'));
  cases++;
}

// 3) 勾选标签 → chip 出现、提交带该标签名
{
  const ui = mount();
  await ui.openTags();
  ui.pick('开发');
  assert.deepEqual(ui.chips(), ['开发']);
  assert.ok(all(ui.render()).some(n => klass(n).includes('wbck-opt') && klass(n).includes('is-on') && textOf(n).includes('开发')), '清单里该标签应处于勾选态');
  await ui.toConfirm();
  await ui.submit();
  assert.deepEqual(ui.created()[0].args.tags, ['开发']);
  cases++;
}

// 4) 直接输入新标签名（回车添加），提交时原样带上，未知名字交给后端自动建
{
  const ui = mount();
  await ui.openTags();
  ui.typeDraft('新标签A, 新标签B');
  ui.submitDraft();
  assert.deepEqual(ui.chips(), ['新标签A', '新标签B']);
  await ui.toConfirm();
  await ui.submit();
  assert.deepEqual(ui.created()[0].args.tags, ['新标签A', '新标签B']);
  cases++;
}

// 5) 点 chip 移除；没有标签插件时不出现标签步
{
  const ui = mount();
  await ui.openTags();
  ui.pick('工作');
  ui.pick('生活');
  assert.deepEqual(ui.chips(), ['工作', '生活']);
  ui.removeChip('工作');
  assert.deepEqual(ui.chips(), ['生活']);
  cases++;
}
{
  const ui = mount({ hasTags: false });
  ui.title('No tags step');
  const steps = all(ui.render()).filter(n => klass(n) === 'wbctl-step').map(textOf);
  assert.ok(!steps.some(s => s.includes(copy.zh.stepTags)), '未装标签插件时不应出现标签步');
  assert.ok(!ui.calls.some(c => c.action === 'tasks.tagOptions'), '未装标签插件时不该查标签');
  cases++;
}

console.log('TASK CREATE TAGS UI PASS', { cases });
