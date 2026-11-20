/** 时间线成员预览：只读预览复用列表卡片，动作按钮与列表同一批弹窗（内存库 + 渲染/源码断言）。 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRequire } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
import { setup } from '../packages/addons/tasks/lib/index.js';

const require = createRequire(import.meta.url);
const src = (p) => readFileSync(new URL('../packages/addons/tasks/' + p, import.meta.url), 'utf8');
const h = React.createElement;

// ---------- 后端：tasks.timeline 与列表同口径带上 tags/workspaces ----------
const db = new DatabaseSync(':memory:');
db.exec('CREATE TABLE sync_change_log(id INTEGER PRIMARY KEY,table_name TEXT,row_id TEXT,op TEXT,payload TEXT,origin TEXT,updated_at INTEGER)');
const actions = new Map();
const api = { hasDomain: () => true, emit() {} };
setup({ db, addon: { version: 'test' }, log() {}, hasDomain: (name) => String(name).includes('tags'), emit() {}, action: (name, def) => actions.set(name, def) });
const call = (name, args = {}) => actions.get(name).execute(args, { origin: 'agent' });
const tableId = () => call('tasks.capabilities', {}).tables[0].id;
const timelineId = call('taskTimelines.create', { title: '预览线' }).timeline.id;
const taskId = call('tasks.create', { title: '预览任务', tableId: tableId(), tags: ['预览标签'] }).id;
call('taskTimelines.attach', { taskId, timelineId });

const paged = call('tasks.timeline', { timelineKey: timelineId, pageNumber: 1, pageSize: 20 });
const row = paged.records.find((r) => String(r.id) === String(taskId));
assert.ok(row, '成员任务出现在 tasks.timeline 结果里');
assert.ok(Array.isArray(row.workspaces), '每条任务都带 workspaces 数组，卡片才有一致的工作区行');
assert.equal(Object.hasOwn(row, 'tags'), false, '标签域表不存在时省略 tags，不假装「没有标签」');
const plain = call('tasks.timeline', { timelineKey: timelineId });
assert.ok(Array.isArray(plain) && plain.length === 1 && Array.isArray(plain[0].workspaces), '非分页返回数组也带 workspaces');
void api;

// ---------- 预览面板：弹窗壳 + 原样复用卡片 ----------
const stubTask = { id: 't1', title: '预览任务', status: '0', priority: 2 };
const seen = [];
function TaskItemStub(props) {
  seen.push(props);
  return h('div', { className: 'wbt-item-stub' }, 'card:' + props.task.title);
}
const TaskPreview = require('../packages/addons/tasks/client/modals/task-preview.cjs')(React, TaskItemStub);
const copy = require('../packages/addons/tasks/client/ui/copy.cjs');
const t = copy.zh;
const closed = [];
const cardProps = { task: stubTask, t, lang: 'zh', keyword: '', update() {}, onEdit() {}, onDone() {}, onRestart() {}, onTimeline() {}, onDelete() {} };
const tree = TaskPreview({ t, lang: 'zh', task: stubTask, cardProps, onClose: () => closed.push('x') });
const html = renderToStaticMarkup(tree);
assert.ok(html.includes('role="dialog"'), '预览是 dialog');
assert.ok(html.includes('aria-labelledby="wbt-preview-title"'), 'dialog 通过 aria-labelledby 关联标题');
assert.ok(html.includes('id="wbt-preview-title"'));
assert.ok(html.includes('aria-modal="true"'));
assert.ok(html.includes('wbt-modal wide'), '宽版弹窗，窄屏靠 96vw 收缩');
assert.ok(html.includes('card:预览任务'), '内容就是列表那张卡片组件');
assert.equal(seen.length, 1);
assert.deepEqual(seen[0], cardProps, '卡片 props 原样透传（含全部动作回调），预览不另做一套');

// 只有一个关闭入口：右上角 ×；底部不再重复一个「关闭」按钮，焦点落在 × 上
assert.equal((html.match(/aria-label="关闭"/g) || []).length, 1, '整块面板只有一个关闭控件');
assert.ok(!html.includes('wbt-modal-foot'), '底部不再有重复的关闭按钮');
assert.ok(/aria-label="关闭"[^>]*autofocus/.test(html.replace(/\/?>/g, '>')) || html.includes('autofocus'), '打开后焦点落在 × 上');

// Esc 与遮罩关闭：外壳统一交给 lib/overlay.cjs，预览只负责传 onClose
const previewSrcText = src('client/modals/task-preview.cjs');
assert.match(previewSrcText, /require\("\.\.\/\.\.\/\.\.\/lib\/overlay\.cjs"\)/, '预览复用共享弹窗外壳');
assert.match(previewSrcText, /maskClass: "wbt-modal-mask"/, '遮罩类名由插件注入');
assert.match(previewSrcText, /autoFocusDialog: false/, '外壳不抢关闭按钮的首焦点');
const overlaySrc = readFileSync(new URL('../packages/addons/lib/overlay.cjs', import.meta.url), 'utf8');
assert.match(overlaySrc, /e\.key === "Escape"/, '共享外壳负责 Esc');
assert.match(overlaySrc, /e\.target === e\.currentTarget/, '共享外壳负责点遮罩关闭');
assert.match(overlaySrc, /e\.key !== "Tab"/, '共享外壳负责 Tab 循环');
void closed;

// ---------- 源码契约：时间线页把卡片动作接到同一批弹窗 ----------
const view = src('client/views/timeline-view.cjs');
assert.match(view, /var TaskPreview = require\("\.\.\/modals\/task-preview\.cjs"\)\(React, deps\.TaskItem\)/, '预览直接复用 TaskItem，不再有第二套卡片');
assert.match(view, /h\(TaskPreview, \{[\s\S]*?cardProps: \{/, '预览接收卡片 props');
for (const key of ['update: updateTask', 'onEdit:', 'onDone:', 'onRestart:', 'onTimeline:', 'onDelete: removeTask']) {
  assert.ok(view.includes(key), '卡片动作已接线：' + key);
}
assert.match(view, /tasks\.delete/);
assert.match(view, /window\.confirm\(t\.deleteTaskConfirm\)/);
assert.match(view, /h\(deps\.DoneModal,/, '完成动作复用列表页的完成弹窗');
assert.match(view, /h\(deps\.TimelineModal,/, '时间线动作复用列表页的时间线弹窗');
assert.match(view, /h\(deps\.CreateModal,/, '重启复用新建弹窗');
assert.match(view, /h\(deps\.EditModal,/, '编辑仍走编辑表单');
assert.match(view, /detailTrigger\.current\.focus/, '关闭后焦点回到成员行');
assert.doesNotMatch(view, /hideOps/, '不再有「预览专用」的卡片分支');

const rows = src('client/timeline/timeline-member-rows.cjs');
assert.match(rows, /点击预览任务：/);
assert.match(rows, /Click to preview task: /);

const item = src('client/item/task-item.cjs');
assert.doesNotMatch(item, /hideOps/, '卡片只有一个版本');
assert.match(item, /var opsNode = h\("div", \{ className: "wbt-ops", key: "ops" \}, ops\);/, '卡片操作按钮始终渲染');

assert.equal(t.timelineOrder, '按发布时间正序排列，点击任务打开预览');
assert.equal(copy.en.timelineOrder, 'Oldest publication first. Click a task to open a preview.');
assert.equal(t.previewLabel, '任务预览');

// ---------- 滚动收敛：只有内容区滚动，头部固定；样式限定在 .wbt-preview 作用域内 ----------
const styles = require('../packages/addons/tasks/client/ui/styles.cjs');
const sheet = [].concat(styles).join('\n');
assert.match(sheet, /\.wbt-preview\{overflow:hidden\}/, '预览壳自己不再滚动');
assert.match(
  sheet,
  /\.wbt-preview-body\{flex:1;min-height:0;overflow:auto/,
  '滚动下推到内容区（flex:1 + min-height:0 才能让子元素真正可滚）',
);
assert.match(sheet, /\.wbt-preview-body\{flex:1;min-height:0;overflow:auto[^}]*scrollbar-color:color-mix\(in oklab,var\(--wbt-line\)/, '滚动条颜色跟随主题 token');
assert.match(sheet, /\.wbt-preview-body::-webkit-scrollbar-thumb\{background-color:color-mix\(in oklab,var\(--wbt-line\)/, 'WebKit 滚动条同样走主题 token');
assert.match(sheet, /\.wbt-modal\{width:560px;max-width:96vw;max-height:90vh;overflow:auto/, '通用弹窗壳的滚动规则保持不变');
assert.ok(!/\.wbt-modal\{[^}]*overflow:hidden/.test(sheet), '没有为预览改掉通用 .wbt-modal 的滚动');
assert.match(sheet, /\.wbt-preview-head\{flex:none\}/, '标题栏不参与压缩');

const entry = src('client/client.src.cjs');
assert.match(entry, /timeline-view\.cjs"\)\(\{ React: React, COPY: COPY, injectCss: injectCss, statusInfo: statusInfo, configView: configView, CFG_FALLBACK: CFG_FALLBACK, TaskItem: TaskItem, EditModal: EditModal, DoneModal: DoneModal, TimelineModal: TimelineModal, CreateModal: CreateModal \}/, '入口注入预览所需依赖');

// ---------- 时间线弹窗内部：成员点击同样只开预览，弹窗不卸载 ----------
const modal = src('client/timeline/task-timeline-modal.cjs');
assert.match(modal, /refreshKey/, '弹窗接受刷新令牌，预览里改完任务能只重拉成员');
assert.match(modal, /按发布时间正序排列，点击任务打开预览/, '分页文案与时间线页一致');
assert.match(modal, /if \(p\.refreshKey\) setRevision/, '刷新令牌只递增 revision，不重挂弹窗');

const tasksView = src('client/views/tasks-view.cjs');
assert.match(tasksView, /onOpen: openTimelinePreview/, '记录页成员点击走预览');
assert.match(tasksView, /refreshKey: timelineReload/, '记录页把刷新令牌接到弹窗');
assert.doesNotMatch(tasksView, /setTimelineTask\(null\); setEditTask/, '记录页不再点成员直接进编辑面板');
assert.ok(
  tasksView.indexOf('h(TimelineModal, {') < tasksView.indexOf('h(TaskPreview, {'),
  '预览渲染在时间线弹窗之后，才叠在它上面（Esc 只关最上层）',
);
assert.match(tasksView, /trigger\.focus\(\{ preventScroll: true \}\)/, '关闭预览后焦点回到被点的成员行');
for (const key of ['onEdit:', 'onDone:', 'onRestart:', 'onTimeline:', 'onDelete: deletePreviewTask']) {
  assert.ok(tasksView.includes(key), '预览动作已接线：' + key);
}

assert.doesNotMatch(view, /setTimelineTask\(null\); setEditTask/, '时间线页弹窗同样不再直接进编辑面板');
assert.match(view, /refreshKey: refresh/, '时间线页把刷新令牌接到弹窗');
assert.ok(
  view.indexOf('h(deps.TimelineModal, {') < view.indexOf('h(TaskPreview, {'),
  '时间线页的预览也叠在弹窗之后',
);
assert.match(view, /function openPreview\(member\)/, '两处共用同一个预览打开函数');

// Tab 陷阱：预览自己的控件循环，键盘焦点不跑到下层弹窗
assert.match(previewSrcText, /createOverlay\(\{/, '预览用共享外壳工厂');
assert.match(overlaySrc, /querySelectorAll\(focusableSelector\)/, 'Tab 只在当前对话框内可聚焦控件间循环');

console.log('tasks timeline preview: ok');
