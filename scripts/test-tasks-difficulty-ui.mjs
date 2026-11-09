/** Real component event regressions; API calls are isolated spies, never production writes. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import RealReact from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
const require = createRequire(import.meta.url), dir = '../packages/addons/tasks/client/';
const copy = require(dir+'ui/copy.cjs');
let state=[], cursor=0, effects=[];
const memo=(fn,deps)=>{const i=cursor++,old=state[i];if(!old||deps.some((v,j)=>v!==old.deps[j]))state[i]={value:fn(),deps};return state[i].value;};
const React={
  createElement:(type,props,...children)=>({type,key:props?.key,props:props||{},children:children.flat(Infinity).filter(x=>x!=null)}),
  useState:v=>{const i=cursor++;if(!(i in state))state[i]=v;return [state[i],v=>state[i]=typeof v==='function'?v(state[i]):v];},
  useId:()=>"filter-test",useRef:v=>{const i=cursor++;return state[i] ||= {current:v};}, useMemo:memo,
  useCallback:(fn,deps)=>memo(()=>fn,deps), useEffect:(fn,deps)=>memo(()=>{effects.push(fn);},deps),
};
const walk=n=>n&&typeof n==='object'?[n,...n.children.flatMap(walk)]:[];
const text=n=>n&&typeof n==='object'?n.children.map(text).join(''):String(n??'');
const find=(tree,pred)=>{const n=walk(tree).find(pred);assert.ok(n,'expected control');return n;};
const reset=()=>{state=[];cursor=0;effects=[];};
const render=(C,p)=>{cursor=0;return C(p);};
const flush=async()=>{const jobs=effects;effects=[];jobs.forEach(fn=>fn());for(let i=0;i<12;i++)await Promise.resolve();};
const tree=[{id:'table',name:'Table',type:'1'}];
const Create=require(dir+'modals/create-modal.cjs')({React,allTables:()=>tree,tagNames:()=>[],splitTags:()=>[],today:()=> '2026-11-09',addDays:()=> '2026-11-09',hostHasAddon:()=>false});
const Edit=require(dir+'modals/edit-modal.cjs')(React,()=>({}),()=> '');
let cases=0;
for(const lang of ['zh','en']) for(const source of ['0','1','2']) for(const status of ['0','2']) {
  reset();const calls=[];const props={tree,t:copy[lang],source,originTask:{id:'origin',timelineId:'line'},api:{call:async(action,args)=>{calls.push({action,args});return {ok:true};}},onCreated(){}};
  const change=(pred,value)=>find(render(Create,props),pred).props.onChange({target:{value}});
  assert.equal(find(render(Create,props),n=>n.props['aria-label']===copy[lang].difficulty).props.value,0);
  assert.ok(text(render(Create,props)).includes(copy[lang].difficultyUnsetHint));
  change(n=>n.props.autoFocus,'Task');
  find(render(Create,props),n=>typeof n.type==='function'&&n.props.form&&n.props.set).props.set('tableId','table');
  if(source!=='2')change(n=>n.type==='select'&&n.props.value==='0',status);
  change(n=>n.props['aria-label']===copy[lang].difficulty,3);
  find(render(Create,props),n=>n.props.className==='wbt-btn primary').props.onClick();await flush();
  assert.equal(calls.find(c=>c.action==='tasks.create').args.difficulty,3);cases++;
}
for(const lang of ['zh','en']) for(const status of ['0','1','2','3']) for(const initial of [null,0,2.5]) {
  reset();let patch;const props={tree,t:copy[lang],task:{id:'task',title:'Task',status,difficulty:initial},api:{call:async(_,args)=>{patch=args;return {ok:true};}},onSaved(){}};
  const input=()=>find(render(Edit,props),n=>n.props['aria-label']===copy[lang].difficulty);
  assert.equal(input().props.value,initial||0); input().props.onChange({target:{value:4}});
  assert.ok(text(render(Edit,props)).includes('★★★★☆'));assert.ok(text(render(Edit,props)).includes('4.0'));
  find(render(Edit,props),n=>n.props.className==='wbt-btn primary').props.onClick();await flush();assert.equal(patch.difficulty,4);
  reset();input().props.onChange({target:{value:''}});find(render(Edit,props),n=>n.props.className==='wbt-btn primary').props.onClick();await flush();assert.equal(patch.difficulty,0);cases++;
}
// Real React rendering verifies accessible numeric input and stars in both list/card layouts.
const Item=require(dir+'item/task-item.cjs')({React:RealReact,statusInfo:()=>({}),stars:()=> '★★★☆☆',pClass:()=>'',today:()=>'',daysBetween:()=>0,cx:(...s)=>s.filter(Boolean).join(' '),Icon:()=>null,Countdown:()=>null,PathCrumbs:()=>null});
for(const status of ['0','1','2','3'])for(const card of [true,false])for(const difficulty of [null,0,3]) {
  const html=renderToStaticMarkup(RealReact.createElement(Item,{task:{title:'Task',status,difficulty},card,t:copy.en}));
  assert.equal(html.includes('wbt-stars'),difficulty>0);cases++;
}
const config={useConfig:()=>({ready:true,values:{}})};
const charts={makeCharts:()=>new Proxy({colors:[],pct:n=>String(n)},{get:(o,k)=>k in o?o[k]:String(k)})};
const mod={exports:{}};
runInNewContext(readFileSync('packages/addons/tasks/client/views/stats.cjs','utf8'),{module:mod,require:n=>n==='react'?React:n==='./config.cjs'?config:n==='../item/ranking-name.cjs'?require(dir+'item/ranking-name.cjs'):n==='../item/recent-columns.cjs'?require(dir+'item/recent-columns.cjs'):charts});
for(const lang of ['zh','en']) {
  reset();let navigation;const props={lang,api:{call:async()=>({result:{totals:{total:5},breakdowns:{difficulty:[{key:'unset',count:2,hidden:true},{key:'3',count:3}]}}})},onNavigate:(...args)=>navigation=args};
  const outer=mod.exports.TasksStatsView(props), Body=outer.type;
  render(Body,outer.props);await flush();const rendered=render(Body,outer.props);
  assert.ok(text(rendered).includes(lang==='en'?'2 tasks without difficulty':'未填难度 2 条'));
  const histogram=walk(rendered).find(n=>n.type==='Histogram'&&n.props.data.some(x=>x.key==='unset'));assert.ok(histogram);assert.equal(histogram.props.data.find(x=>x.key==='unset').label,lang==='en'?'Unset':'未设置');
  find(rendered,n=>n.type==='button'&&text(n).includes(lang==='en'?'Review missing':'查看并补齐')).props.onClick();
  assert.equal(navigation[0],'tasks');assert.equal(navigation[1].difficultyMissing,true);cases++;
}
const noop=()=>null;
const View=require(dir+'views/tasks-view.cjs')({React,configView:config,COPY:copy,TABS:[],allTables:()=>[],treeWalk:()=>[],treeFlat:()=>[],cx:(...s)=>s.join(' '),injectCss:noop,Icon:noop,PathCrumbs:noop,TagFilter:noop});
reset();const calls=[];const props={lang:'en',viewParams:{difficultyMissing:true},api:{subscribe:()=>noop,call:async(action,args)=>{calls.push({action,args});return {ok:true,result:action==='tasks.list'?{records:[],total:0}:[]};}}};
const outer=View(props), Body=outer.type;render(Body,outer.props);await flush();
let list=calls.find(c=>c.action==='tasks.list');assert.deepEqual(list.args.statuses,[]);assert.equal(list.args.urgent,false);assert.equal(list.args.difficultyMissing,true);assert.equal(list.args.filterRestarted,undefined);
let rendered=render(Body,outer.props);const filter=find(rendered,n=>n.type==='label'&&text(n).includes(copy.en.difficultyMissing));find(filter,n=>n.type==='input').props.onChange({target:{checked:false}});
render(Body,outer.props);await flush();list=calls.filter(c=>c.action==='tasks.list').at(-1);assert.equal(list.args.difficultyMissing,false);assert.equal(list.args.pageNumber,1);
console.log('TASK DIFFICULTY UI PASS',{cases,filterNavigation:true,realReact:RealReact.version});
