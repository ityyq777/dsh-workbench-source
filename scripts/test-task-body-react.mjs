/** Real React DOM server regression: void-node constraints, escaping and card integration. */
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { createBody } = require('../packages/addons/lib/markdown.cjs');
const Highlight = require('../packages/addons/tasks/client/ui/highlight.cjs')(React);
const Body = createBody(React, Highlight), h = React.createElement;
// Confirm this renderer catches the exact shape accepted by the old permissive mocks.
for (const tag of ['br', 'hr']) assert.throws(() => renderToStaticMarkup(h(tag, {}, [])), /self-closing tag/);
const fixture = ['# Heading', '', 'first needle', 'second line', '', '---', '', '**bold** and *italic*', '', '- item', '  - nested', '', '> quoted', '', '[needle](https://example.test/needle)', '', '<img src=x onerror=alert(1)>'].join('\n');
const html = renderToStaticMarkup(h(Body, { text: fixture, keyword: 'needle' }));
assert.ok(html.includes('<br/>'), 'hard newline renders a real void br');
assert.ok(html.includes('<hr/>'), 'separator renders a real void hr');
for (const tag of ['h1','strong','em','ul','li','blockquote','a']) assert.ok(html.includes('<'+tag), tag);
assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
assert.ok(!html.includes('<img'), 'raw HTML cannot create a DOM image');
assert.ok(html.includes('href="https://example.test/needle"'));
assert.ok(html.includes('rel="noopener noreferrer nofollow"'));
assert.equal((html.match(/<mark/g)||[]).length, 2, 'leaf highlights render through real React');
const plain = renderToStaticMarkup(h(Body, { text: 'a\nb\n\n---', mode: 'text' }));
assert.ok(!plain.includes('<br') && !plain.includes('<hr'));assert.ok(plain.includes('a\nb\n\n---'));
const tick = String.fromCharCode(96), fence = tick.repeat(3);
const literal = renderToStaticMarkup(h(Body, { text: fence+'\n**raw**\n---\n'+fence }));
assert.ok(literal.includes('<pre><code>**raw**\n---</code></pre>'));assert.ok(!literal.includes('<hr'));
const inspect = node => { if (!React.isValidElement(node)) return; if (node.type === 'br' || node.type === 'hr') assert.equal(Object.hasOwn(node.props,'children'),false); React.Children.forEach(node.props.children, inspect); };
inspect(Body({text:fixture}));
const copy = require('../packages/addons/tasks/client/ui/copy.cjs');
const Task = require('../packages/addons/tasks/client/item/task-item.cjs')({React,statusInfo:()=>({zh:'开启',en:'Active',cls:'active'}),stars:()=>'',pClass:()=> 'low',today:()=> '2026-11-09',daysBetween:()=>1,cx:(...x)=>x.filter(Boolean).join(' '),Icon:()=>null,Countdown:()=>null,PathCrumbs:()=>null});
for (const card of [true,false]) for (const lang of ['zh','en']) {
  const output=renderToStaticMarkup(h(Task,{card,lang,t:copy[lang],keyword:'needle',task:{id:'fixture',title:'Title',description:fixture,review:'reflection needle\nnext line\n\n---',status:'0',tags:[]},update(){}}));
  assert.equal((output.match(/<br\/>/g)||[]).length,2);
  assert.equal((output.match(/<hr\/>/g)||[]).length,2);
  assert.ok(output.includes(lang==='en'?'Reflection':'感受'));
  assert.ok(!output.includes('<textarea') && !output.includes('wb-body-edit') && !output.includes('wb-source-hint'));
  assert.ok(!output.includes('Double-click') && !output.includes('双击'));
}
const EditModal = require('../packages/addons/tasks/client/modals/edit-modal.cjs')(React,()=>({zh:'开启',en:'Active',cls:'active'}),()=> '');
for (const lang of ['zh','en']) for (const status of ['0','1','2','3']) {
  const panel = renderToStaticMarkup(h(EditModal,{lang,t:copy[lang],task:{id:'fixture',title:'Raw <title>',description:'**raw** <script>literal</script>',review:'*raw reflection*',status},tree:[],onClose(){}}));
  assert.ok(panel.includes('value="Raw &lt;title&gt;"'));
  assert.ok(panel.includes('**raw** &lt;script&gt;literal&lt;/script&gt;</textarea>'));
  assert.ok(panel.includes('*raw reflection*</textarea>'));
  assert.equal((panel.match(/<textarea/g)||[]).length,2);
}
// 任务 ID 只出现在记录页卡片最下方，弹窗内不再重复。
const ULID = '01a1d070c5db7579ad833f6d3904189b';
const readSrc = (rel) => readFileSync(new URL('../' + rel, import.meta.url), 'utf8');
const styles = readSrc('packages/addons/tasks/client/ui/styles.cjs');
const itemSrc = readSrc('packages/addons/tasks/client/item/task-item.cjs');
for (const lang of ['zh', 'en']) {
  const label = lang === 'en' ? 'Task ID' : '任务 ID';
  const panel = renderToStaticMarkup(h(EditModal, { lang, t: copy[lang], task: { id: ULID, title: 'Title', description: '', review: '', status: '0' }, tree: [], onClose() {} }));
  assert.ok(!panel.includes('wbt-modal-id'), 'modal no longer renders the id line');
  assert.ok(!panel.includes(ULID), 'modal shows no task id at all');
  const card = renderToStaticMarkup(h(Task, { lang, t: copy[lang], task: { id: ULID, title: 'Title', description: 'Body', review: 'Review', status: '0', tags: [] }, update() {} }));
  assert.ok(card.includes(label + ' \u00b7 ' + ULID), 'card bottom shows the full task id');
  assert.equal((card.match(/wbt-item-id/g) || []).length, 1, 'exactly one id line per card');
  assert.ok(card.indexOf('wbt-review') < card.indexOf('wbt-item-id'), 'id line sits below the review body');
  assert.ok(card.includes('title="' + ULID + '"'), 'id line keeps the raw id as title');
  const noId = renderToStaticMarkup(h(Task, { lang, t: copy[lang], task: { id: '', title: 'No id', description: '', review: '', status: '0', tags: [] }, update() {} }));
  assert.ok(!noId.includes('wbt-item-id'), 'empty id renders no line');
}
assert.ok(/\.wbt-item-id\{[^}]*user-select:text/.test(styles), 'id line is selectable');
assert.ok(/\.wbt-item-id\{[^}]*overflow-wrap:anywhere/.test(styles), 'id line wraps instead of overflowing');
assert.ok(/\.wbt-item-id\{[^}]*font-family:ui-monospace/.test(styles), 'id line uses a monospace face');
assert.ok(!styles.includes('.wbt-modal-id'), 'dead modal id style removed');
assert.ok(/className: "wbt-item-id"/.test(itemSrc) && /stopPropagation/.test(itemSrc), 'card id click does not bubble to edit/select');
const Description = require('../packages/addons/lib/description.cjs').Description;
const storage=renderToStaticMarkup(h(Description,{text:fixture,lang:'en'}));
assert.ok(storage.includes('<br/>')&&storage.includes('<hr/>'));assert.ok(storage.includes('Description'));
const repeated = renderToStaticMarkup(h(React.Fragment, null, ...[0,1].map(i => h(Task, { key:i, lang:'en', t:copy.en, task:{id:'same',title:'Same',description:'Body',review:'Review',status:'0',tags:[]}, update(){} })), h(Description,{text:'Storage',lang:'en'})));
const ids = [...repeated.matchAll(/ id="([^"]+)"/g)].map(m=>m[1]);
const refs = [...repeated.matchAll(/aria-labelledby="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,5); assert.equal(new Set(ids).size,5); assert.deepEqual(refs,ids);
assert.ok(storage.includes('lucide-code'));
assert.ok(storage.includes('aria-pressed="true"'));
const storageText=renderToStaticMarkup(h(Description,{text:'**raw**',bodyMode:'text',lang:'en'}));
assert.ok(storageText.includes('lucide-pilcrow')); assert.ok(storageText.includes('aria-pressed="false"')); assert.ok(storageText.includes('**raw**'));
console.log('TASK BODY REAL REACT PASS', {version:React.version,voidElements:['br','hr'],taskCards:4,storage:true,escaping:true,highlight:true,cardTaskId:true});
