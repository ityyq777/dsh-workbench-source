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
const R={createElement:(type,props,...children)=>({type,props:props||{},children}),useState:v=>{const i=cursor++;if(!(i in state))state[i]=v;return[state[i],v=>state[i]=typeof v==='function'?v(state[i]):v];},useId:()=>"filter-test",useRef:v=>{const i=cursor++;return state[i]||={current:v};},useMemo:memo,useCallback:(fn,d)=>memo(()=>fn,d),useEffect:(fn,d)=>memo(()=>{effects.push(fn);},d)};
const noop=()=>null, copy=require('../packages/addons/tasks/client/ui/copy.cjs');
const View=require('../packages/addons/tasks/client/views/tasks-view.cjs')({React:R,configView:{useConfig:()=>({ready:true,values:{'ui.defaultTab':0,'ui.listView':'card','list.sort':'difficulty','list.filterRestarted':true}})},COPY:copy,TABS:[],allTables:()=>[],treeWalk:()=>[],treeFlat:()=>[],cx:(...s)=>s.join(' '),injectCss:noop,Icon:noop,PathCrumbs:noop,TagFilter:noop});
const calls=[], outer=View({lang:'en',viewParams:{tableId:'t',groupId:'g',difficultyMissing:true},api:{subscribe:()=>noop,call:async(action,args)=>{calls.push({action,args});return {ok:true,result:action==='tasks.list'?{records:[],total:0}:[]};}}});
cursor=0;outer.type(outer.props);effects.forEach(f=>f());for(let i=0;i<12;i++)await Promise.resolve();
const args=calls.find(c=>c.action==='tasks.list').args;assert.equal(args.tableId,'t');assert.equal(args.groupId,null);assert.deepEqual(args.statuses,[]);assert.equal(args.urgent,false);assert.equal(args.titleKey,'');assert.deepEqual(args.tagIds,[]);assert.equal(args.difficultyMissing,false);assert.equal(args.filterRestarted,undefined);assert.equal(args.sort,undefined);assert.equal(args.pageNumber,1);
// Test reusable outlet cache and scroll restoration through the actual Slot lifecycle.
state=[];cursor=0;effects=[];R.Fragment='fragment';R.useLayoutEffect=R.useEffect;
const mod={exports:{}};const listeners=new Set();runInNewContext(readFileSync('packages/shell/client/view-outlet.cjs','utf8'),{module:mod,require:()=>R,document:{addEventListener:(_,fn)=>listeners.add(fn),removeEventListener:(_,fn)=>listeners.delete(fn)}});
const stats={id:'stats',component:noop,keepAlive:true},tasks={id:'tasks',component:noop};
const outlet=(view)=>{cursor=0;return mod.exports({view,viewProps:{}});};
let out=outlet(stats);const Slot=out.children[0][0].type;outlet(tasks);out=outlet(stats);assert.equal(out.children[0].length,1,'transient task view unmounted');assert.equal(out.children[0][0].props.view,stats);
state=[];cursor=0;effects=[];const node={scrollTop:450,scrollLeft:0,parentElement:null};let slot=Slot({active:true,view:stats,viewProps:{}});slot.props.ref.current=node;effects.splice(0).forEach(fn=>fn());listeners.forEach(fn=>fn());
cursor=0;Slot({active:false,view:stats,viewProps:{}});effects.splice(0).forEach(fn=>fn());node.scrollTop=0;cursor=0;Slot({active:true,view:stats,viewProps:{}});effects.splice(0).forEach(fn=>fn());assert.equal(node.scrollTop,450);
console.log('TASK RECENT UI PASS: deleted/zero/null/half-star/table semantics/navigation/default filters/host cache/scroll');
