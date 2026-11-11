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
const View=require('../packages/addons/tasks/client/views/tasks-view.cjs')({React:R,configView:{useConfig:()=>({ready:true,values:{'ui.defaultTab':0,'ui.listView':'card','list.sort':'difficulty','list.filterRestarted':true}})},COPY:copy,TABS:[],allTables:()=>[],treeWalk:()=>[],treeFlat:()=>[],cx:(...s)=>s.join(' '),injectCss:noop,Icon:noop,PathCrumbs:noop,TagFilter:noop});
const calls=[], outer=View({lang:'en',viewParams:{tableId:'t',groupId:'g',difficultyMissing:true},api:{subscribe:()=>noop,call:async(action,args)=>{calls.push({action,args});return {ok:true,result:action==='tasks.list'?{records:[],total:0}:[]};}}});
cursor=0;outer.type(outer.props);effects.forEach(f=>f());for(let i=0;i<12;i++)await Promise.resolve();
const args=calls.find(c=>c.action==='tasks.list').args;assert.equal(args.tableId,'t');assert.equal(args.groupId,null);assert.deepEqual(args.statuses,[]);assert.ok(!('urgent' in args),'urgent is no longer sent');assert.equal(args.titleKey,'');assert.deepEqual(args.tagIds,[]);assert.equal(args.difficultyMissing,false);assert.equal(args.filterRestarted,undefined);assert.equal(args.sort,undefined);assert.equal(args.pageNumber,1);
// Test reusable outlet cache and scroll restoration through the actual Slot lifecycle.
state=[];cursor=0;effects=[];R.Fragment='fragment';R.useLayoutEffect=R.useEffect;
const mod={exports:{}};const listeners=new Set();runInNewContext(readFileSync('packages/shell/client/view-outlet.cjs','utf8'),{module:mod,require:()=>R,document:{addEventListener:(_,fn)=>listeners.add(fn),removeEventListener:(_,fn)=>listeners.delete(fn)}});
const stats={id:'stats',component:noop,keepAlive:true},tasks={id:'tasks',component:noop};
const outlet=(view)=>{cursor=0;return mod.exports({view,viewProps:{}});};
let out=outlet(stats);const Slot=out.children[0][0].type;outlet(tasks);out=outlet(stats);assert.equal(out.children[0].length,1,'transient task view unmounted');assert.equal(out.children[0][0].props.view,stats);
state=[];cursor=0;effects=[];const node={scrollTop:450,scrollLeft:0,parentElement:null};let slot=Slot({active:true,view:stats,viewProps:{}});slot.props.ref.current=node;effects.splice(0).forEach(fn=>fn());listeners.forEach(fn=>fn());
cursor=0;Slot({active:false,view:stats,viewProps:{}});effects.splice(0).forEach(fn=>fn());node.scrollTop=0;cursor=0;Slot({active:true,view:stats,viewProps:{}});effects.splice(0).forEach(fn=>fn());assert.equal(node.scrollTop,450);
// Actual stats component: request limits, bilingual empty states, legacy response fallback and three equal cards.
const statsPath='packages/addons/tasks/client/views/stats.cjs',statsRequire=createRequire(require.resolve('../'+statsPath));
for(const lang of ['zh','en']) for(const [configured,expected] of [[undefined,10],[7,7],[999,50],[-1,1]]) {
 state=[];cursor=0;effects=[];let fallback;const statsCalls=[];
 const cfg=configured===undefined?{}:{'stats.recentPublishLimit':configured};
 const statsModule={exports:{}};
 runInNewContext(readFileSync(statsPath,'utf8'),{module:statsModule,require:n=>n==='react'?R:n==='./config.cjs'?{useConfig:(_api,f)=>{fallback=f;return {ready:true,values:cfg};}}:statsRequire(n),Date,document:{addEventListener(){},removeEventListener(){}}});
 const root=statsModule.exports.TasksStatsView({lang,api:{call:async(action,args)=>{statsCalls.push({action,args});return {result:{totals:{total:1},lists:{recentPublish:[],recentDone:[],recentShutdown:[]}}};}}});
 assert.equal(fallback['stats.recentPublishLimit'],10);
 const drawStats=()=>{cursor=0;return root.type(root.props);};
 drawStats();effects.splice(0).forEach(fn=>fn());for(let i=0;i<12;i++)await Promise.resolve();
 assert.equal(statsCalls[0].args.recentPublishLimit,expected);
 const walk=n=>n&&typeof n==='object'?[n,...n.children.flat(Infinity).flatMap(walk)]:[];
 const cards=walk(drawStats()).filter(n=>['recentPublish','recentDone','recentShutdown'].includes(n.key));
 assert.deepEqual(cards.map(n=>n.key),['recentPublish','recentDone','recentShutdown']);
 assert.ok(cards.every(n=>n.props.span===4));
 assert.equal(cards[0].props.title,lang==='en'?'Recently published':'最近发布');
 assert.equal(cards[0].props.note,lang==='en'?'Newest publication first':'按发布日期倒序');
 const table=cards[0].children[0];assert.equal(table.props.rows.length,0);
 const emptyHtml=renderToStaticMarkup(React.createElement(table.type,table.props));
 assert.ok(emptyHtml.includes(lang==='en'?'No published tasks yet':'还没有发布的任务'));
 const legacyHtml=renderToStaticMarkup(React.createElement(table.type,{...table.props,rows:[{id:'old',title:'Old',date:'',daysAgo:null,tableDeleted:true}]}));
 assert.ok(legacyHtml.includes('—'));assert.ok(!legacyHtml.includes('NaN'));
 cfg['stats.sections']=['recentDone'];
 assert.equal(walk(drawStats()).filter(n=>n.key==='recentPublish').length,0,'explicit section preference hides publication card');
}
console.log('TASK RECENT UI PASS: publication cards/limits/i18n/legacy fallback, deleted/zero/null/half-star/table semantics/navigation/default filters/host cache/scroll');
