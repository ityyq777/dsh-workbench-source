import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const require=createRequire(import.meta.url), recent=require('../packages/addons/tasks/client/item/recent-columns.cjs');
const charts=require('../packages/addons/tasks/client/stats/charts.cjs').makeCharts('test');
for(const lang of ['zh','en']) {
 let navigation;const columns=recent({colTitle:'Task',colTable:'Table',colDate:'Date',colAgo:'Ago'},lang,(...a)=>navigation=a);
 const difficulty=columns.find(c=>c.key==='difficulty'),table=columns.find(c=>c.key==='tableTitle');
 assert.equal(columns.find(c=>c.key==='date').render({date:''}),'—');
 assert.deepEqual(columns.map(c=>c.key),['title','difficulty','tableTitle','date'],'距今天列已移除，保留任务/难度/任务表/日期四列');
 assert.equal(columns.some(c=>c.key==='daysAgo'),false);
 for(const value of [0,null,undefined])assert.equal(difficulty.render({difficulty:value}),'—');
 const half=renderToStaticMarkup(difficulty.render({difficulty:2.5}));assert.match(half,/★★⯪☆☆/);assert.match(half,/2.5/);
 const live={tableId:'t',groupId:'g',tableTitle:'Table',difficulty:2.5};
 const link=table.render(live);assert.equal(link.type,'button');assert.equal(link.props.type,'button');assert.equal(link.props['aria-label'],lang==='en'?'Open task table: Table':'打开任务表：Table');
 link.props.onClick();assert.deepEqual(navigation,['tasks',{tableId:'t',groupId:'g',allTableTasks:true}]);
 for(const row of [{...live,tableDeleted:true},{...live,tableId:null}]){const html=renderToStaticMarkup(table.render(row));assert.ok(!html.includes('<button'));assert.match(html,lang==='en'?/deleted/:/已删除/);}
 const html=renderToStaticMarkup(React.createElement(charts.DataTable,{columns,rows:[live]}));assert.match(html,/<table/);assert.match(html,/<thead/);assert.match(html,/<tbody/);assert.match(html,/<td/);
}
// Hook harness tests the actual task list request with non-default configuration.
let state=[],cursor=0,effects=[];const memo=(fn,deps)=>{const i=cursor++,old=state[i];if(!old||deps.some((v,j)=>v!==old.deps[j]))state[i]={value:fn(),deps};return state[i].value;};
const R={createElement:(type,props,...children)=>({type,key:props?.key,props:props||{},children}),useState:v=>{const i=cursor++;if(!(i in state))state[i]=v;return[state[i],v=>state[i]=typeof v==='function'?v(state[i]):v];},useId:()=>"filter-test",useRef:v=>{const i=cursor++;return state[i]||={current:v};},useMemo:memo,useCallback:(fn,d)=>memo(()=>fn,d),useEffect:(fn,d)=>memo(()=>{effects.push(fn);},d)};
const noop=()=>null, copy=require('../packages/addons/tasks/client/ui/copy.cjs');
const View=require('../packages/addons/tasks/client/views/tasks-view.cjs')({React:R,configView:{useConfig:()=>({ready:true,values:{'ui.defaultTab':0,'list.sort':'difficulty','list.filterRestarted':true}})},COPY:copy,TABS:[],allTables:()=>[],treeWalk:()=>[],treeFlat:()=>[],cx:(...s)=>s.join(' '),injectCss:noop,Icon:noop,PathCrumbs:noop,TagFilter:noop});
const calls=[], outer=View({lang:'en',viewParams:{tableId:'t',groupId:'g',difficultyMissing:true},api:{subscribe:()=>noop,call:async(action,args)=>{calls.push({action,args});return {ok:true,result:action==='tasks.list'?{records:[],total:0}:[]};}}});
cursor=0;const rendered=outer.type(outer.props);effects.forEach(f=>f());for(let i=0;i<12;i++)await Promise.resolve();
const walkNode=n=>n&&typeof n==='object'?[n].concat((n.children||[]).flat(Infinity).flatMap(walkNode)):[];
const nodes=walkNode(rendered);
assert.ok(!nodes.some(n=>n.props&&/wbt-grid|wbt-card/.test(String(n.props.className||''))),'不应再渲染卡片/网格容器');
assert.equal(copy.zh.card,undefined,'zh 文案不应再有 card');
assert.equal(copy.zh.list,undefined,'zh 文案不应再有 list');
const viewSrc=readFileSync('packages/addons/tasks/client/views/tasks-view.cjs','utf8');
assert.ok(!/wbt-grid|wbt-card|ui\.listView|setView|props\.card/.test(viewSrc),'记录页不应残留卡片模式代码');
const itemSrc=readFileSync('packages/addons/tasks/client/item/task-item.cjs','utf8');
assert.ok(!/wbt-grid|wbt-card|wbt-ops-block|props\.card/.test(itemSrc),'任务条不应残留卡片分支');
assert.ok(/className: "wbt-list"/.test(viewSrc),'列表容器应为 wbt-list');
const args=calls.find(c=>c.action==='tasks.list').args;assert.equal(args.tableId,'t');assert.equal(args.groupId,null);assert.deepEqual(args.statuses,[]);assert.ok(!('urgent' in args),'urgent is no longer sent');assert.equal(args.titleKey,'');assert.deepEqual(args.tagIds,[]);assert.equal(args.difficultyMissing,false);assert.equal(args.filterRestarted,undefined);assert.equal(args.sort,undefined);assert.equal(args.pageNumber,1);
// Test reusable outlet cache and scroll restoration through the actual Slot lifecycle.
state=[];cursor=0;effects=[];R.Fragment='fragment';R.useLayoutEffect=R.useEffect;
const mod={exports:{}};const listeners=new Set();runInNewContext(readFileSync('packages/shell/client/view-outlet.cjs','utf8'),{module:mod,require:()=>R,document:{addEventListener:(_,fn)=>listeners.add(fn),removeEventListener:(_,fn)=>listeners.delete(fn)}});
const stats={id:'stats',component:noop,keepAlive:true},tasks={id:'tasks',component:noop};
const outlet=(view)=>{cursor=0;return mod.exports({view,viewProps:{}});};
let out=outlet(stats);const Slot=out.children[0][0].type;outlet(tasks);out=outlet(stats);assert.equal(out.children[0].length,1,'transient task view unmounted');assert.equal(out.children[0][0].props.view,stats);
state=[];cursor=0;effects=[];const node={scrollTop:450,scrollLeft:0,parentElement:null};let slot=Slot({active:true,view:stats,viewProps:{}});slot.props.ref.current=node;effects.splice(0).forEach(fn=>fn());listeners.forEach(fn=>fn());
cursor=0;Slot({active:false,view:stats,viewProps:{}});effects.splice(0).forEach(fn=>fn());node.scrollTop=0;cursor=0;Slot({active:true,view:stats,viewProps:{}});effects.splice(0).forEach(fn=>fn());assert.equal(node.scrollTop,450);
// Actual stats component: one merged "recent" card with four tabs, limits passed through, legacy fallback.
const statsPath='packages/addons/tasks/client/views/stats.cjs',statsRequire=createRequire(require.resolve('../'+statsPath));
for(const lang of ['zh','en']) for(const [configured,expected] of [[undefined,10],[7,7],[999,50],[-1,1]]) {
 state=[];cursor=0;effects=[];let fallback;const statsCalls=[];
 const cfg=configured===undefined?{}:{'stats.recentClaimedLimit':configured};
 const statsModule={exports:{}};
 runInNewContext(readFileSync(statsPath,'utf8'),{module:statsModule,require:n=>n==='react'?R:n==='./config.cjs'?{useConfig:(_api,f)=>{fallback=f;return {ready:true,values:cfg};}}:statsRequire(n),Date,document:{addEventListener(){},removeEventListener(){}}});
 const rows={recentPublish:{id:'p1',title:'Published',date:'2026-11-13',daysAgo:0,tableTitle:'T',tableId:'t',groupId:'g',difficulty:1},recentDone:{id:'d1',title:'Done',date:'2026-11-12',daysAgo:1,tableTitle:'T',tableId:'t',groupId:'g',difficulty:2},recentShutdown:{id:'s1',title:'Closed',date:'2026-11-11',daysAgo:2,tableTitle:'T',tableId:'t',groupId:'g',difficulty:3},recentClaimed:{id:'c1',title:'Claimed',date:'2026-11-10',daysAgo:3,tableTitle:'T',tableId:'t',groupId:'g',difficulty:4}};
 const api={call:async(action,args)=>{statsCalls.push({action,args});return {result:{totals:{total:1},lists:{recentPublish:[rows.recentPublish],recentDone:[rows.recentDone],recentShutdown:[rows.recentShutdown],recentClaimed:[rows.recentClaimed]}}};}};
 const root=statsModule.exports.TasksStatsView({lang,api});
 assert.equal(fallback['stats.recentClaimedLimit'],10);
 const drawStats=()=>{cursor=0;return root.type(root.props);};
 drawStats();effects.splice(0).forEach(fn=>fn());for(let i=0;i<12;i++)await Promise.resolve();
 assert.equal(statsCalls[0].args.recentClaimedLimit,expected,'claim limit rides the same request');
 const walk=n=>n&&typeof n==='object'?[n,...n.children.flat(Infinity).flatMap(walk)]:[];
 const cards=walk(drawStats()).filter(n=>n&&['recent','recentPublish','recentDone','recentShutdown'].includes(n.key));
 assert.equal(cards.length,1,'the three old lists collapse into one card');
 const card=cards[0];
 assert.equal(card.key,'recent');assert.equal(card.props.span,12);
 assert.equal(card.props.title,lang==='en'?'Recent tasks':'最近任务');
 const tablist=walk(card).find(n=>n&&n.props&&n.props.role==='tablist');
 assert.ok(tablist,'merged card has a tablist');
 assert.equal(tablist.props['aria-label'],lang==='en'?'Recent tasks':'最近任务');
 const tabs=walk(tablist).filter(n=>n&&n.props&&n.props.role==='tab');
 assert.equal(tabs.length,4,'four dimensions');
 assert.deepEqual(tabs.map(b=>b.props.role),['tab','tab','tab','tab']);
 assert.deepEqual(tabs.map(b=>b.children.join('')),lang==='en'?['Published','Completed','Closed','Claimed']:['最近发布','最近完成','最近关闭','最近接取']);
 assert.deepEqual(tabs.map(b=>b.props['aria-selected']),[true,false,false,false],'publish is the default dimension');
 assert.ok(tabs.every(b=>b.props.className==='wbt-dims-tab'&&b.props.type==='button'),'tabs are focusable buttons');
 const expectedRows={publish:'Published',done:'Done',shutdown:'Closed',claimed:'Claimed'};
 for(const [i,key] of ['publish','done','shutdown','claimed'].entries()) {
   if(i>0){tabs[i].props.onClick();const next=walk(drawStats()).find(n=>n&&n.key==='recent');
     assert.deepEqual(walk(next).filter(n=>n&&n.props&&n.props.role==='tab').map(b=>b.props['aria-selected']),[i===0,i===1,i===2,i===3]);}
   const current=walk(drawStats()).find(n=>n&&n.key==='recent');
   const table=walk(current).find(n=>n&&n.props&&Array.isArray(n.props.rows)&&Array.isArray(n.props.columns));
   assert.equal(table.props.rows.length,1,'one row for '+key);
   assert.equal(table.props.rows[0].title,expectedRows[key],'tab switches the list: '+key);
 }
 const last=walk(walk(drawStats()).find(n=>n&&n.key==='recent')).find(n=>n&&n.props&&Array.isArray(n.props.rows)&&Array.isArray(n.props.columns));
 const emptyHtml=renderToStaticMarkup(React.createElement(last.type,{...last.props,rows:[]}));
 assert.ok(emptyHtml.includes(lang==='en'?'No claimed tasks yet (claim time is only recorded after 5.2.15)':'还没有已接取的任务（接取时间只记录 5.2.15 之后的操作）'),'claimed empty state explains the missing history');
 const legacyHtml=renderToStaticMarkup(React.createElement(last.type,{...last.props,rows:[{id:'old',title:'Old',date:'',daysAgo:null,tableDeleted:true}]}));
 assert.ok(legacyHtml.includes('—'));assert.ok(!legacyHtml.includes('NaN'));
 cfg['stats.sections']=['trend'];
 assert.equal(walk(drawStats()).filter(n=>n.key==='recent').length,0,'section preference can hide the merged card');
 cfg['stats.sections']=['recent'];
 assert.equal(walk(drawStats()).filter(n=>n.key==='recent').length,1,'the merged key is the section switch');
}
console.log('TASK RECENT UI PASS: publication cards/limits/i18n/legacy fallback, deleted/zero/null/half-star/table semantics/navigation/default filters/host cache/scroll');
