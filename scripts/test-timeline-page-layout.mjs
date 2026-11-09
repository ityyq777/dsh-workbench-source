import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const split = require('../packages/addons/tasks/client/timeline/timeline-title.cjs');
const createRows = require('../packages/addons/tasks/client/timeline/timeline-member-rows.cjs');
const css = require('../packages/addons/tasks/client/timeline/timeline-styles.cjs');
assert.deepEqual(split(' 文档平台 | 技术与需求 '), { eyebrow: '文档平台', title: '技术与需求' });
assert.deepEqual(split('Group | Parent ｜ Title'), { eyebrow: 'Group | Parent', title: 'Title' });
assert.deepEqual(split('plain |'), { eyebrow: '', title: 'plain |' });
const statusInfo = () => ({ zh: '完成', en: 'Done', cls: 'done' });
const rows = Array.from({ length: 20 }, (_, i) => ({ id: String(i), title: 'Member ' + i, status: '2', publishDate: '2026-11-09' }));
const MemberRows = createRows(React, statusInfo);
const html = renderToStaticMarkup(React.createElement(MemberRows, { rows, lang: 'zh', onOpen() {}, onRemove() {}, disabled: true }));
assert.equal((html.match(/class="wbt-timeline-member-row"/g) || []).length, 20);
assert.equal((html.match(/aria-label="从时间线移出：Member/g) || []).length, 20);
assert.equal((html.match(/dateTime="2026-11-09"/g) || []).length, 20);
assert.ok(!html.includes('☑'));
const english = renderToStaticMarkup(React.createElement(MemberRows, { rows: rows.slice(0, 1), lang: 'en' }));
assert.ok(english.includes('Done'));
assert.ok(!english.includes('wbt-timeline-remove'));
const fakeReact = { createElement: (type, props, ...children) => ({ type, props: props || {}, children: children.flat() }) };
let opened, removed;
const tree = createRows(fakeReact, statusInfo)({ rows: rows.slice(0, 1), onOpen: (task, event) => { opened = [task, event]; }, onRemove: task => { removed = task; } });
const nodes = tree.children[0].children;
const event = { currentTarget: {} };
nodes.find(n => n.props.className === 'wbt-timeline-member').props.onClick(event);
nodes.find(n => n.props.className === 'wbt-timeline-remove').props.onClick(event);
assert.equal(opened[0], rows[0]); assert.equal(opened[1], event); assert.equal(removed, rows[0]);
assert.ok(css.includes('min-height:40px'));
assert.ok(css.includes('var(--wbt-accent) 8%,transparent'));
assert.ok(css.includes('button:is(.wbt-timeline-member,.wbt-timeline-remove,.wbt-timeline-id)'));
assert.ok(!css.includes('rgba('));
assert.ok(!css.includes('48vh') && !css.includes('58vh'));
// Render the actual timeline view with settled read state; exercise shared Highlight output.
const COPY = require('../packages/addons/tasks/client/ui/copy.cjs');
function searchHtml(query, records, lang = 'zh') {
  let index = 0;
  const state = { 0: query, 4: { records, total: records.length }, 5: false };
  const R = { ...React, useState(value) { const i = index++; return [i in state ? state[i] : value, () => {}]; }, useRef: () => ({current:null}), useEffect() {} };
  const View = require('../packages/addons/tasks/client/views/timeline-view.cjs')({React:R,COPY,statusInfo,injectCss() {}});
  return renderToStaticMarkup(React.createElement(View,{api:{},lang}));
}
const record = { timelineKey:'a',title:'Alpha %_(',description:'Description ALPHA %_( <b>\nNot in excerpt',taskCount:2,openCount:2,doneCount:0 };
for (const query of ['alpha','%_(']) {
  const out = searchHtml(query,[record]);
  assert.equal((out.match(/<mark class="wbt-hit">/g)||[]).length,2);
  assert.match(out,/class="wbt-timeline-excerpt"/);
  assert.ok(!out.includes('<b>'),'description is escaped text');
}
assert.equal((searchHtml('',[record]).match(/<mark /g)||[]).length,0);
assert.ok(!searchHtml('',[{...record,description:null}]).includes('<span class="wbt-timeline-excerpt"'));
assert.ok(searchHtml('$&',[]).includes('“$&amp;”'),'replacement tokens remain literal escaped text');
assert.ok(searchHtml('missing',[]).includes('没有找到包含 “missing” 的时间线'));
assert.ok(searchHtml('missing',[],'en').includes('No timelines contain “missing”.'));
assert.ok(searchHtml('',[]).includes(COPY.zh.timelineEmpty));
assert.ok(!searchHtml('',[]).includes('没有找到包含'));
console.log('Timeline page PASS: shared rows, theme contracts, title/description highlights, literal queries and distinct empty results');
