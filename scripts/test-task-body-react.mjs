/** Real React DOM server regression: void-node constraints, escaping and card integration. */
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { createBody } = require('../packages/addons/lib/markdown.cjs');
const Highlight = require('../packages/addons/tasks/client/highlight.cjs')(React);
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
const copy = require('../packages/addons/tasks/client/copy.cjs');
const Task = require('../packages/addons/tasks/client/task-item.cjs')({React,statusInfo:()=>({zh:'开启',en:'Active',cls:'active'}),stars:()=>'',pClass:()=> 'low',today:()=> '2026-11-09',daysBetween:()=>1,cx:(...x)=>x.filter(Boolean).join(' '),Icon:()=>null,Countdown:()=>null,PathCrumbs:()=>null});
for (const card of [true,false]) for (const lang of ['zh','en']) {
  const output=renderToStaticMarkup(h(Task,{card,lang,t:copy[lang],keyword:'needle',task:{id:'fixture',title:'Title',description:fixture,review:'reflection needle\nnext line\n\n---',status:'0',tags:[]},update(){}}));
  assert.equal((output.match(/<br\/>/g)||[]).length,2);
  assert.equal((output.match(/<hr\/>/g)||[]).length,2);
  assert.ok(output.includes(lang==='en'?'Reflection':'感受'));
  assert.ok(!output.includes('<textarea') && !output.includes('wb-body-edit') && !output.includes('wb-source-hint'));
  assert.ok(!output.includes('Double-click') && !output.includes('双击'));
}
const EditModal = require('../packages/addons/tasks/client/edit-modal.cjs')(React,()=>({zh:'开启',en:'Active',cls:'active'}),()=> '');
for (const lang of ['zh','en']) for (const status of ['0','1','2','3']) {
  const panel = renderToStaticMarkup(h(EditModal,{lang,t:copy[lang],task:{id:'fixture',title:'Raw <title>',description:'**raw** <script>literal</script>',review:'*raw reflection*',status},tree:[],onClose(){}}));
  assert.ok(panel.includes('value="Raw &lt;title&gt;"'));
  assert.ok(panel.includes('**raw** &lt;script&gt;literal&lt;/script&gt;</textarea>'));
  assert.ok(panel.includes('*raw reflection*</textarea>'));
  assert.equal((panel.match(/<textarea/g)||[]).length,2);
}
const Description = require('../packages/addons/lib/description.cjs').Description;
const storage=renderToStaticMarkup(h(Description,{text:fixture,lang:'en'}));
assert.ok(storage.includes('<br/>')&&storage.includes('<hr/>'));assert.ok(storage.includes('Description'));
console.log('TASK BODY REAL REACT PASS', {version:React.version,voidElements:['br','hr'],taskCards:4,storage:true,escaping:true,highlight:true});
