/**
 * 事件趋势折线图的交互回归：图例开关 / 量程重算 / 命中索引 / 提示层定位，
 * 以及 Trend 组件渲染出来的结构（图例按钮、命中带、键盘容器）。
 * 纯逻辑在 stats/trend-interaction.cjs，这里既测纯函数也测组件树。
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ix = require('../packages/addons/tasks/client/stats/trend-interaction.cjs');

const series = [
  { key: 'publish', label: '发布', color: 'var(--c0)' },
  { key: 'target', label: '目标', color: 'var(--c5)' },
  { key: 'claimed', label: '接取', color: 'var(--c2)' },
  { key: 'shutdown', label: '关闭', color: 'var(--c3)' },
  { key: 'done', label: '完成', color: 'var(--c1)' },
];
const data = [
  { bucket: '2026-11-10', publish: 20, target: 2, claimed: 1, shutdown: 0, done: 1 },
  { bucket: '2026-11-11', publish: 0, target: 1, claimed: 0, shutdown: 2, done: 1 },
  { bucket: '2026-11-12', publish: 4, target: 0, claimed: 3, shutdown: 0, done: 0 },
];

// ---- 纯逻辑 ----
assert.deepEqual(ix.visibleSeries(series, {}).map((s) => s.key), ['publish', 'target', 'claimed', 'shutdown', 'done'], '默认全显且保持调用方顺序');
assert.deepEqual(ix.visibleSeries(series, { done: true, shutdown: true }).map((s) => s.key), ['publish', 'target', 'claimed'], '隐藏项过滤掉');

assert.equal(ix.rangeMax(data, series, {}), 23, '量程按全部序列最大值的 115% 取整');
assert.equal(ix.rangeMax(data, series, { publish: true }), 4, '隐藏发布后量程按剩余序列重算（3 × 1.15 取整），不再被尖峰撑到 23');
assert.equal(ix.rangeMax([], series, {}), 1, '空数据不出 0 或 NaN');

const toggled = ix.toggle({}, series, 'publish');
assert.deepEqual(toggled.hidden, { publish: true }, '点图例隐藏对应序列');
assert.equal(toggled.blocked, false);
assert.deepEqual(ix.toggle({ publish: true }, series, 'publish').hidden, {}, '再点一次恢复');
const nearlyEmpty = { target: true, claimed: true, shutdown: true, done: true };
assert.equal(ix.toggle(nearlyEmpty, series, 'publish').blocked, true, '最后一条可见序列不能再关');

assert.equal(ix.indexAt(0, 3), 0);
assert.equal(ix.indexAt(0.5, 3), 1);
assert.equal(ix.indexAt(1, 3), 2);
assert.equal(ix.indexAt(-3, 3), 0, '越界夹到左端');
assert.equal(ix.indexAt(9, 3), 2, '越界夹到右端');
assert.equal(ix.indexAt(0.5, 0), 0, '空数据不炸');

assert.equal(ix.moveIndex(null, 1, 5), 0, '还没选过时向右从第一个开始');
assert.equal(ix.moveIndex(null, -1, 5), 4, '还没选过时向左从最后一个开始');
assert.equal(ix.moveIndex(4, 1, 5), 4, '到右端停住，不循环');
assert.equal(ix.moveIndex(0, -1, 5), 0, '到左端停住');

const left = ix.tipAnchor(0, 4.7, 93.7);
assert.equal(left.flip, 'left', '靠左时左对齐，不溢出卡片');
assert.equal(ix.tipAnchor(0.5, 4.7, 93.7).flip, 'center', '中间居中');
assert.equal(ix.tipAnchor(1, 4.7, 93.7).flip, 'right', '靠右时右对齐');
assert.equal(ix.tipTransform('right'), 'translateX(-100%)');
assert.equal(ix.tipTransform('center'), 'translateX(-50%)');
assert.equal(ix.tipTransform('left'), 'translateX(0)');

assert.deepEqual(ix.tipRows(data, series, { publish: true }, 2).map((r) => r.key), ['target', 'claimed', 'shutdown', 'done'], '提示层只列可见序列');
assert.equal(ix.tipRows(data, series, { publish: true }, 2)[1].value, 3, '提示层取到该日期的精确数值');
assert.deepEqual(ix.tipRows(data, series, {}, 99), [], '越界索引返回空');
assert.match(ix.summaryText(data, series, { publish: true }), /^目标 3，接取 4，关闭 2，完成 2$/, '屏幕阅读器汇总只算可见序列');

// ---- 组件树 ----
const React = {
  createElement: (type, props, ...children) => ({ type, key: props?.key, props: props || {}, children: children.flat(Infinity).filter((x) => x != null) }),
  useState: (v) => {
    const i = React.cursor++;
    if (!(i in React.state)) React.state[i] = v;
    return [React.state[i], (n) => { React.state[i] = typeof n === 'function' ? n(React.state[i]) : n; }];
  },
};
React.state = [];
React.cursor = 0;
// charts.cjs 顶部 require("react")，这里把 react 的模块缓存换成上面的桩，
// 否则 Hooks 没有 dispatcher（Cannot read properties of null (reading 'useState')）。
const reactPath = require.resolve('react');
const chartsPath = require.resolve('../packages/addons/tasks/client/stats/charts.cjs');
delete require.cache[chartsPath];
require.cache[reactPath] = { id: reactPath, filename: reactPath, loaded: true, children: [], paths: [], exports: React };
const { makeCharts } = require(chartsPath);
const charts = makeCharts('wbt');
const walk = (n) => (n && typeof n === 'object' && Array.isArray(n.children) ? [n, ...n.children.flatMap(walk)] : []);
const flatText = (n) => (typeof n === 'string' ? n : n && Array.isArray(n.children) ? n.children.map(flatText).join('') : '');

function render() {
  React.cursor = 0;
  return charts.Trend({ data, series, lang: 'zh' });
}

let tree = render();
const legend = walk(tree).filter((n) => n.props && n.props['aria-pressed'] !== undefined);
assert.equal(legend.length, 5, '五条序列各有一个图例按钮');
assert.deepEqual(legend.map(flatText), ['发布', '目标', '接取', '关闭', '完成'], '图例顺序：发布→目标→接取→关闭→完成');
assert.ok(legend.every((n) => n.props.type === 'button'), '图例是可点的按钮');
assert.ok(legend.every((n) => n.props['aria-pressed'] === 'true'), '默认全部按下');

const group = walk(tree).find((n) => n.props && n.props.role === 'group');
assert.ok(group, '可交互时容器是 group 语义');
assert.equal(group.props.tabIndex, 0, 'Tab 能进入图表');
assert.ok(walk(tree).some((n) => n.type === 'svg' && n.props['aria-hidden'] === 'true'), 'SVG 自身对读屏隐藏，语义交给容器');

const bands = walk(tree).filter((n) => n.type === 'rect');
assert.equal(bands.length, data.length, '每个桶一条透明命中带（含原本被跳过的点）');
assert.ok(bands.every((n) => n.props.width > 0 && n.props.height > 0), '命中带都有面积');

assert.equal(walk(tree).filter((n) => n.type === 'polyline').length, 5, '五条折线');
assert.equal(walk(tree).filter((n) => n.type === 'polyline')[0].props.points.split(' ').length, 3, '折线点数与桶数一致');
assert.equal(walk(tree).filter((n) => n.type === 'title').length, 0, '不再靠原生 title 做提示');

// 隐藏「发布」后重渲染：折线与量程都跟着变。
const hidePublish = React.state[0];
parseInt('0', 10);
void hidePublish;
React.state[0] = { publish: true };
tree = render();
assert.equal(walk(tree).filter((n) => n.type === 'polyline').length, 4, '隐藏一条后折线少一条');
const ticks = walk(tree).filter((n) => n.type === 'text' && String(n.children[0]).match(/^\d+$/) && n.props.textAnchor === 'end');
assert.ok(Math.max(...ticks.map((n) => Number(n.children[0]))) <= 4, '量程按可见序列重算（尖峰 20 不再撑到 23）');
const legendOff = walk(tree).filter((n) => n.props && n.props['aria-pressed'] === 'false');
assert.deepEqual(legendOff.map(flatText), ['发布'], '被隐藏的那条 aria-pressed=false');
assert.equal(legendOff[0].props.disabled, false, '不是最后一条，仍可再点');

// 当前日期高亮：命中带触发后出现竖线与放大点。
React.state[1] = 2;
tree = render();
assert.ok(walk(tree).some((n) => String(n.props.className || '').includes('-trend-guide')), '选中日期画竖直参考线');
assert.ok(walk(tree).some((n) => typeof n.props.style === 'object' && String(n.props.className || '').includes('-trend-tip')), '选中日期出现提示层');
const tip = walk(tree).find((n) => String(n.props.className || '').includes('-trend-tip'));
assert.match(String(tip.props.style.left), /%$/, '提示层按容器百分比定位，不依赖 viewBox 缩放');
assert.equal(tip.props.style.pointerEvents, undefined, '提示层不挡鼠标');
assert.ok(walk(tree).some((n) => n.type === 'circle' && n.props.r === 4), '选中的点放大');

console.log('TREND INTERACTION PASS: 图例开关/量程重算/命中带/提示层/键盘容器');
