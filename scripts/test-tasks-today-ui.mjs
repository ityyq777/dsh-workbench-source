// Real React markup and stats interaction regressions; no live API or persisted writes.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const require = createRequire(import.meta.url);
const Today = require('../packages/addons/tasks/client/stats/today.cjs');
const snapshot = {published: 8, claimed: 5, done: 3, shutdown: 0, avgDifficultyDone: 3, avgSample: 2, date: '2000-01-02'};
const markup = (today, lang) => renderToStaticMarkup(React.createElement(Today, {today, lang}));
for (const lang of ['zh', 'en']) {
  const html = markup(snapshot, lang);
  assert.equal((html.match(/role="group"/g) || []).length, 5);
  assert.ok(html.includes(lang === 'zh' ? '今日接取5条' : 'Claimed today: 5 tasks'));
  assert.ok(html.includes(lang === 'zh' ? '今日完成3条' : 'Completed today: 3 tasks'));
  assert.ok(html.includes(lang === 'zh' ? '今日关闭0条' : 'Closed today: 0 tasks'));
  assert.ok(html.includes('>3.0<span'));
  assert.ok(html.includes('>±2</span>'));
  assert.ok(html.includes('aria-description="2000-01-02"'));
  assert.ok(html.includes('aria-label="' + (lang === 'zh' ? '今日' : 'Today') + '"'));
  assert.doesNotMatch(html, /<h3|<time|wbt-today-date|wbt-today h3/);
  assert.equal((html.match(/class="wbt-kpi"/g) || []).length, 5);
  assert.doesNotMatch(html.replace(/<style>.*?style>/g, '').replace(/<[^>]+>/g, ''), /2000-01-02/);
  assert.ok(html.includes(lang === 'zh' ? '以服务端当前时间为准' : 'Based on the server'));
  const empty = markup({...snapshot, avgSample: 0, avgDifficultyDone: null}, lang);
  assert.ok(empty.includes('>—<span'));
  assert.ok(empty.includes(lang === 'zh' ? '无样本' : 'No samples'));
  assert.ok(markup({...snapshot, avgDifficultyDone: 2.66667}, lang).includes('>2.7<span'));
  assert.equal(markup(undefined, lang), '');
  assert.equal(markup(5, lang), '');
}
let states = [], cursor = 0, effects = [];
const memo = (fn, deps) => {const i = cursor++, old = states[i]; if (!old || deps.some((v,j) => v !== old.deps[j])) states[i] = {value: fn(), deps}; return states[i].value;};
const fakeReact = {
  createElement: (type, props, ...children) => ({type, key: props?.key, props: props || {}, children: children.flat(Infinity).filter(v => v != null)}),
  useState: value => {const i = cursor++; if (!(i in states)) states[i] = value; return [states[i], v => states[i] = typeof v === 'function' ? v(states[i]) : v];},
  useRef: value => {const i = cursor++; return states[i] ||= {current: value};},
  useMemo: memo, useCallback: (fn, deps) => memo(() => fn, deps), useEffect: (fn, deps) => memo(() => effects.push(fn), deps),
};
const config = {useConfig: () => ({ready: true, values: {'stats.sections': [], 'stats.showKpi': false}})};
const charts = {makeCharts: () => new Proxy({colors: [], pct: String}, {get: (o,k) => k in o ? o[k] : String(k)})};
const mod = {exports: {}};
runInNewContext(readFileSync('packages/addons/tasks/client/views/stats.cjs', 'utf8'), {module: mod, require: name => name === 'react' ? fakeReact : name === './config.cjs' ? config : name === '../stats/charts.cjs' ? charts : name === '../stats/today.cjs' ? Today : name === '../stats/heatmap.cjs' ? 'Heatmap' : name === '../item/ranking-name.cjs' ? require('../packages/addons/tasks/client/item/ranking-name.cjs') : require('../packages/addons/tasks/client/item/recent-columns.cjs')});
const calls = [];
const api = {call: async (action, args) => {calls.push({action, args}); return {result: {today: snapshot, totals: {total: 0}}};}};
const outer = mod.exports.TasksStatsView({api, lang: 'zh'});
const render = () => {cursor = 0; return outer.type(outer.props);};
const flush = async () => {const pending = effects; effects = []; pending.forEach(fn => fn()); for (let i=0;i<12;i++) await Promise.resolve();};
render(); await flush();
let view = render();
assert.equal(view.children[0].type, Today);
assert.equal(view.children[1].type, 'Heatmap');
assert.equal(view.children[2].type, 'RangeSwitch');
assert.equal(view.children[0].props.today, snapshot);
view.children[2].props.onChange('7d'); render(); await flush(); view = render();
assert.equal(calls.at(-1).args.range, '7d');
assert.equal(view.children[0].props.today, snapshot);
view.children[2].props.onCustomChange({from: '1999-01-01', to: '1999-01-02'}); render(); await flush(); view = render();
assert.equal(calls.at(-1).args.from, '1999-01-01');
assert.equal(view.children[0].props.today.date, '2000-01-02');
console.log('TODAY UI PASS: bilingual metrics (5 cards incl. claimed), precision, zero, empty, legacy, server date, order and range independence');
