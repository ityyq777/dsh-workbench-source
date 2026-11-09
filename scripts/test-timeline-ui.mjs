// In-memory React browser fixture. No workspace data or screenshot writes.
// Run: node scripts/test-timeline-ui.mjs --serve, then open the printed URL.
import { build } from 'esbuild';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const copy = require('../packages/addons/tasks/client/copy.cjs');
for (const key of Object.keys(copy.zh).filter(k => k.startsWith('timeline'))) assert.ok(copy.en[key], key);
assert.ok(copy.zh.timelineEmpty.includes('暂未提供创建入口'));
assert.ok(copy.en.timelineEmpty.includes('does not yet provide a creation control'));
assert.ok(!copy.zh.timelineEmpty.includes('source=1') && !copy.en.timelineEmpty.includes('source=1'));
assert.ok(copy.zh.timelineMergeHint.includes('排除已重启和已删除任务'));
assert.ok(copy.en.timelineMergeHint.includes('excluding restarted and deleted tasks'));
const entry = String.raw`
const React = require('react');
const {createRoot} = require('react-dom/client');
let addon;
window.__WB_HOST__ = {registerAddon(value){addon=value},addons:[]};
require('./packages/addons/tasks/client/client.src.cjs');
const calls = [], state = {lang:'zh',dark:false}, h=React.createElement;
let tasks=[];
function resetData(){tasks=Array.from({length:25},(_,i)=>Array.from({length:i===24?1:i===0?45:3},(_,j)=>({id:'task-'+i+'-'+j,timelineKey:'line-'+i,title:'Timeline '+String(i).padStart(2,'0')+' / Task '+String(j).padStart(2,'0'),status:j%2?'2':'0',priority:j%2?0:1,publishDate:'2026-10-'+String(j%28+1).padStart(2,'0'),description:'Fixture description',tableId:'table-1'}))).flat();}
resetData();
function paged(rows,args){return {records:rows.slice((args.pageNumber-1)*args.pageSize,args.pageNumber*args.pageSize),total:rows.length,current:args.pageNumber,size:args.pageSize};}
const api={async call(action,args){
  calls.push({action,args:structuredClone(args)});
  if(action==='tasks.timelines'){
    const rows=Array.from(new Set(tasks.map(x=>x.timelineKey))).map(key=>{const members=tasks.filter(x=>x.timelineKey===key);return {timelineKey:key,title:members[0].title,taskCount:members.length,openCount:members.filter(x=>x.status==='0').length,doneCount:members.filter(x=>x.status==='2').length,lastActivityDate:'2026-11-09'};}).filter(x=>(args.includeSingletons||x.taskCount>1)&&x.title.includes(args.titleKey||''));
    return {ok:true,result:paged(rows,args)};
  }
  if(action==='tasks.timeline')return {ok:true,result:paged(tasks.filter(x=>x.timelineKey===args.timelineKey).sort((a,b)=>a.publishDate.localeCompare(b.publishDate)||a.id.localeCompare(b.id)),args)};
  if(action==='taskNodes.tree')return {ok:true,result:[{id:'table-1',name:'Fixture table',type:'1'}]};
  if(action==='tasks.timelineRefactor'){
    if(args.ids||!args.timelineKeys.includes(args.timelineKey))throw Error('Must merge complete timeline keys');
    const all=tasks.filter(x=>args.timelineKeys.includes(x.timelineKey)),changed=all.filter(x=>x.timelineKey!==args.timelineKey);
    if(!args.dryRun)changed.forEach(x=>x.timelineKey=args.timelineKey);
    return {ok:true,result:{wouldUpdate:changed.length,updated:args.dryRun?0:changed.length,total:all.length}};
  }
  throw Error('Unexpected fixture action: '+action);
}};
const root=createRoot(document.getElementById('root'));
function render(){document.documentElement.dataset.theme=state.dark?'dark':'light'; root.render(h(React.Fragment,null,h('nav',{id:'view-tabs'},addon.views.map(v=>h('span',{key:v.id},v.title[state.lang]))),h(addon.views.find(v=>v.id==='timeline').component,{api,lang:state.lang})));}
window.fixture={calls,addon,get tasks(){return tasks},setLanguage(lang){state.lang=lang;render()},setDark(dark){state.dark=dark;render()}};
render();
const pause=()=>new Promise(r=>setTimeout(r,30));
async function wait(fn){for(let n=0;n<100;n++){if(fn())return;await pause()}throw Error('Timed out: '+fn);}
function check(value,msg){if(!value)throw Error(msg)}
const options=()=>Array.from(document.querySelectorAll('[role=option]'));
const buttons=()=>Array.from(document.querySelectorAll('button'));
function button(text){const b=buttons().find(x=>x.textContent===text);check(b,'Missing button '+text);return b;}
function key(node,value){node.dispatchEvent(new KeyboardEvent('keydown',{key:value,bubbles:true}));}
window.runTimelineTests=async()=>{
 await wait(()=>options().length===20&&document.querySelectorAll('.wbt-timeline-member').length===20);
 check(addon.views.map(v=>v.id).join(',')==='stats,tasks,timeline,config,data','tab order');
 check(addon.version==='3.1.8','version');
 check(calls.filter(x=>x.action==='tasks.timeline'||x.action==='tasks.timelines').every(x=>x.args.pageSize===20),'all reads paged');
 check(!calls[0].args.includeSingletons,'singletons hidden');
 const list=document.querySelector('[role=listbox]');list.scrollTop=300;const before=list.scrollTop;
 options()[5].click();await wait(()=>document.querySelector('h3').textContent.includes('05'));
 check(document.querySelector('[role=listbox]')===list&&list.scrollTop===before,'stable list and scroll');
 options()[5].focus();key(options()[5],'ArrowDown');await pause();check(document.activeElement===options()[6]&&options()[6].getAttribute('aria-current')==='true','down focus and selection');
 key(options()[6],'ArrowUp');await pause();check(document.activeElement===options()[5],'up');
 key(options()[5],'End');await pause();check(document.activeElement===options()[19],'end');
 key(options()[19],'Home');await pause();check(document.activeElement===options()[0],'home');
 await wait(()=>document.querySelectorAll('.wbt-timeline-member').length===20);
 document.querySelector('.wbt-timeline-right [aria-label="下一页"]').click();await wait(()=>document.querySelector('.wbt-timeline-right nav').textContent.includes('2 / 3'));
 check(calls.at(-1).args.pageNumber===2,'member next page');
 document.querySelector('.wbt-timeline-member').click();await wait(()=>document.querySelector('.wbt-modal'));
 check(document.querySelector('.wbt-modal textarea').value==='Fixture description','existing detail control');button('取消').click();await pause();
 button('选择').click();await pause();options()[0].click();options()[1].click();await pause();button('合并 (2)').click();await pause();
 check(!calls.some(x=>x.action==='tasks.timelineRefactor'),'no merge before preview');
 const target=document.querySelector('[role=dialog] select');target.value='line-1';target.dispatchEvent(new Event('change',{bubbles:true}));await pause();
 button('预览合并').click();await wait(()=>buttons().some(b=>b.textContent==='确认合并'));
 check(calls.at(-1).args.dryRun===true,'dry run first');
 check(tasks.filter(x=>x.timelineKey==='line-1').length===3,'preview does not move');
 check(document.querySelector('[role=dialog]').textContent.includes('将移动 45 条'),'preview count');
 button('确认合并').click();await wait(()=>!document.querySelector('[role=dialog]'));
 await wait(()=>!document.querySelector('[role=listbox]').getAttribute('aria-busy').includes('true'));
 check(tasks.filter(x=>x.timelineKey==='line-1').length===48,'whole timeline merged beyond page');
 check(calls.filter(x=>x.action==='tasks.timelineRefactor').every(x=>!x.args.ids&&x.args.timelineKeys.length===2),'no paged ids');
 document.querySelector('.wbt-timeline-left [aria-label="下一页"]').click();await wait(()=>options().length===3);
 const checkbox=document.querySelector('input[type=checkbox]');checkbox.click();await wait(()=>options().length===20);
 document.querySelector('.wbt-timeline-left [aria-label="下一页"]').click();await wait(()=>options().length===4);
 check(options().some(x=>x.textContent.includes('Timeline 24')),'singletons opt in');
 const search=document.querySelector('input[aria-label="搜索时间线标题"]');
 Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(search,'No match');search.dispatchEvent(new Event('input',{bubbles:true}));await pause();
 button('搜索').click();await wait(()=>options().length===0);check(document.body.textContent.includes('暂无匹配的历史时间线')&&!document.body.textContent.includes('source=1'),'historical empty state without automatic creation guidance');
 Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(search,'Timeline 02');search.dispatchEvent(new Event('input',{bubbles:true}));await pause();
 button('搜索').click();await wait(()=>options().length===1);check(options()[0].textContent.includes('Timeline 02'),'search');
 const beforeRefresh=calls.length;button('刷新').click();await wait(()=>calls.length>=beforeRefresh+2);check(calls.slice(beforeRefresh).some(x=>x.action==='tasks.timelines'),'refresh');
 window.fixture.setLanguage('en');await pause();check(document.body.textContent.includes('Single-task timelines'),'English copy');
 window.fixture.setDark(true);await pause();check(getComputedStyle(document.querySelector('.wbt-timeline-view')).color==='rgb(229,231,235)'||getComputedStyle(document.querySelector('.wbt-timeline-view')).color==='rgb(229, 231, 235)','dark inherited foreground');
 return {passed:true,checks:22,requests:calls.length,tabs:addon.views.map(v=>v.id),merged:48};
};
`;
const bundled=await build({stdin:{contents:entry,resolveDir:process.cwd(),loader:'js'},bundle:true,write:false,format:'iife',platform:'browser',logLevel:'silent'});
console.log('Timeline UI bundle and bilingual copy PASS');
if(process.argv.includes('--serve')){
 const server=createServer((req,res)=>{
  if(req.url==='/fixture.js'){res.setHeader('Content-Type','text/javascript');res.end(bundled.outputFiles[0].text);return;}
  res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><head><meta charset="utf-8"><title>Timeline memory fixture</title><style>body{font-family:system-ui;margin:24px;background:#fff;color:#222;--wb-border:#ddd;--wb-radius-sm:6px;--dsw-alias-bg-layer-1:#fff}html[data-theme=dark] body{background:#18181b;color:#e5e7eb;--wb-border:#555;--dsw-alias-bg-layer-1:#27272a}#view-tabs{display:flex;gap:24px;margin-bottom:20px}</style></head><body><div id="root"></div><script src="/fixture.js"></script></body></html>');
 });server.listen(0,'127.0.0.1',()=>console.log('TIMELINE_FIXTURE_URL=http://127.0.0.1:'+server.address().port));
}
