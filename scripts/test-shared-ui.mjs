/**
 * 共享控件接入覆盖率：13 个插件都必须走 packages/addons/lib/ 里的共享入口，
 * 不允许再各自维护图标表、按钮、骨架屏、对话框外壳。
 *
 * 这个测试是「全量接入」的可核对凭据：新增插件或改装控件时它会直接失败，
 * 而不是靠人工翻一遍目录。
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const ADDONS = join(ROOT, 'packages/addons');

const PLUGINS = readdirSync(ADDONS)
  .filter((name) => name !== 'lib' && statSync(join(ADDONS, name)).isDirectory())
  .filter((name) => existsSync(join(ADDONS, name, 'client')))
  .sort();

assert.equal(PLUGINS.length, 13, '插件数量变了（现在 ' + PLUGINS.length + ' 个），请同步本测试与文档矩阵');

// 共享入口 → 语义。插件至少要接一个，且图标必须走 lib/icons.cjs 工厂。
const SHARED = {
  'lib/client-common.cjs': '按钮/字段/提示/空态/加载',
  'lib/client-base-styles.cjs': '基础样式',
  'lib/icons.cjs': '图标渲染工厂',
  'lib/overlay.cjs': '对话框外壳',
  'lib/tag-filter.cjs': '标签筛选',
  'lib/stats-charts.cjs': '统计图表基件',
  'lib/button.cjs': '按钮工厂',
  'lib/skeleton.cjs': '骨架屏',
  'lib/filter-checklist.cjs': '筛选清单',
  'lib/date-picker.cjs': '日期控件',
  'lib/date-picker-styles.cjs': '日期控件样式',
  'lib/data-view.cjs': '数据页',
  'lib/action-schema-view.cjs': 'Action 页',
};

// 允许保留自研对话框的四处，理由写在 docs/AGENTS规范/04-UI规范.md「控件复用审计」里。
const DIALOG_EXCEPTIONS = new Map([
  ['packages/addons/tasks/client/timeline/task-timeline-modal.cjs', '嵌套子弹窗时 Tab 只在最上层循环'],
  ['packages/addons/tasks/client/views/tasks-view.cjs', '右侧抽屉，不是居中遮罩对话框'],
  ['packages/addons/mail/client/ui/secret-picker.cjs', '锚定弹层（popover），不是遮罩对话框'],
]);

const filesOf = (dir) => {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...filesOf(full));
    else if (/\.(cjs|js)$/.test(entry) && entry !== 'client.js') out.push(full);
  }
  return out;
};

const problems = [];
const rows = [];

for (const plugin of PLUGINS) {
  const files = filesOf(join(ADDONS, plugin, 'client'));
  const sources = files.map((file) => ({ file, rel: relative(ROOT, file), text: readFileSync(file, 'utf8') }));

  const used = Object.keys(SHARED).filter((entry) => sources.some((s) => s.text.includes(entry)));
  if (used.length === 0) problems.push(plugin + '：没有任何共享控件入口');

  // 图标：必须有 ui/icons.cjs，且除它以外不许再出现 lucide 的按需 require。
  const iconEntry = join(ADDONS, plugin, 'client/ui/icons.cjs');
  if (!existsSync(iconEntry)) problems.push(plugin + '：缺少 client/ui/icons.cjs（图标表应走 lib/icons.cjs 工厂）');
  else if (!readFileSync(iconEntry, 'utf8').includes('lib/icons.cjs')) problems.push(plugin + '：ui/icons.cjs 没走 lib/icons.cjs');
  for (const s of sources) {
    if (s.file === iconEntry) continue;
    if (s.text.includes('lucide-react/icons/')) problems.push(s.rel + '：内联 require lucide 图标，应改为读本插件 ui/icons.cjs');
  }

  // 不许再各自实现按钮 / 骨架屏 / 对话框外壳。
  for (const s of sources) {
    if (/function\s+(Button|Skeleton|Modal)\s*\(/.test(s.text)) {
      problems.push(s.rel + '：重复实现 Button/Skeleton/Modal，应改用 lib/button.cjs、lib/skeleton.cjs、lib/overlay.cjs');
    }
    if (/role:\s*"dialog"/.test(s.text) && !DIALOG_EXCEPTIONS.has(s.rel)) {
      problems.push(s.rel + '：自写 role="dialog" 外壳，应改用 lib/overlay.cjs（确属特例请写进例外表与文档）');
    }
  }

  rows.push({ plugin, files: files.length, shared: used });
}

const report = rows.map((r) => r.plugin.padEnd(11) + String(r.files).padStart(3) + ' 个文件  ' + r.shared.join(', '));
console.log('共享控件接入矩阵：');
for (const line of report) console.log('  ' + line);

if (problems.length) {
  console.error('\n共享控件覆盖失败：');
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
console.log('\nSHARED UI COVERAGE PASS: ' + PLUGINS.length + ' 个插件全部接入共享控件');
