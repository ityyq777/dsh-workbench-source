/** Real component event regressions; API calls are isolated spies, never production writes. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import RealReact from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
const require = createRequire(import.meta.url), dir = '../packages/addons/tasks/client/';
const copy = require(dir+'copy.cjs');
let state=[], cursor=0, effects=[];
const memo=(fn,deps)=>{const i=cursor++,old=state[i];if(!old||deps.some((v,j)=>v!==old.deps[j]))state[i]={value:fn(),deps};return state[i].value;};
const React={
  createElement:(type,props,...children)=>({type,key:props?.key,props:props||{},children:children.flat(Infinity).filter(x=>x!=null)}),
  useState:v=>{const i=cursor++;if(!(i in state))state[i]=v;return [state[i],v=>state[i]=typeof v==='function'?v(state[i]):v];},
  useId:()=>"date-test", useRef:v=>{const i=cursor++;return state[i] ||= {current:v};}, useMemo:memo,
  useCallback:(fn,deps)=>memo(()=>fn,deps), useEffect:(fn,deps)=>memo(()=>{effects.push(fn);},deps),
};
const walk=n=>n&&typeof n==='object'?[n,...n.children.flatMap(walk)]:[];
const text=n=>n&&typeof n==='object'?n.children.map(text).join(''):String(n??'');
const find=(tree,pred)=>{const n=walk(tree).find(pred);assert.ok(n,'expected control');return n;};
const reset=()=>{state=[];cursor=0;effects=[];};
const render=(C,p)=>{cursor=0;return C(p);};
const flush=async()=>{const jobs=effects;effects=[];jobs.forEach(fn=>fn());for(let i=0;i<12;i++)await Promise.resolve();};
const dirPath='packages/addons/tasks/client/';
function load(name,extra={}) { const mod={exports:{}};runInNewContext(readFileSync(dirPath+name,'utf8'),{module:mod,require:n=>n==='react'?React:extra[n]||require(dir+n.replace('./','')),document:{getElementById(){return true;},addEventListener(){},removeEventListener(){}},Date,isFinite});return mod.exports; }
const dates=load('date-filter.cjs');
assert.equal(dates.validDate('2025-02-29'),false);assert.equal(dates.validDate('2024-02-29'),true);
assert.equal(dates.validDate('2026-04-31'),false);assert.equal(dates.validDate('0000-01-01'),false);
const noop=()=>null,config={useConfig:()=>({ready:true,values:{}})};
const View=require(dir+'tasks-view.cjs')({React,configView:config,COPY:copy,TABS:[{id:8,en:'All'},{id:5,en:'Done'}],allTables:()=>[],treeWalk:()=>[],treeFlat:()=>[],cx:(...s)=>s.join(' '),injectCss:noop,Icon:noop,PathCrumbs:noop,TagFilter:noop});
reset();const calls=[];const props={lang:'en',api:{subscribe:()=>noop,call:async(action,args)=>{calls.push({action,args});return {ok:true,result:action==='tasks.list'?{records:[],total:30,pageable:true}:[]};}}};
const outer=View(props),Body=outer.type;
const draw=()=>render(Body,outer.props),list=()=>calls.filter(c=>c.action==='tasks.list').at(-1).args;
draw();await flush();
find(draw(),n=>n.type==='button'&&text(n)==='All').props.onClick();draw();await flush();
find(draw(),n=>n.type==='button'&&n.children.some(c=>c?.props?.name==='right')).props.onClick();draw();await flush();assert.equal(list().pageNumber,2);
const filter=()=>find(draw(),n=>typeof n.type==='function'&&n.props.value?.from!==undefined);
for(const range of [{from:'2026-11-01',to:''},{from:'',to:'2026-11-09'},{from:'2026-11-01',to:'2026-11-09'},{from:'',to:''}]) {
 filter().props.onChange(range);draw();await flush();assert.equal(list().publishFrom,range.from||undefined);assert.equal(list().publishTo,range.to||undefined);assert.equal(list().pageNumber,1);
}
filter().props.onChange({from:'2026-11-01',to:'2026-11-09'});draw();await flush();
find(draw(),n=>n.type==='input'&&n.props.placeholder===copy.en.search).props.onChange({target:{value:'needle'}});
find(draw(),n=>n.type==='input'&&n.props.placeholder===copy.en.search).props.onKeyDown({key:'Enter'});
find(draw(),n=>n.props.ids&&n.props.onChange).props.onChange(['tag-a']);
find(draw(),n=>n.type==='button'&&text(n)==='Done').props.onClick();draw();await flush();
assert.equal(list().publishFrom,'2026-11-01');assert.equal(list().titleKey,'needle');assert.deepEqual(list().tagIds,['tag-a']);assert.equal(list().tab,5);
find(draw(),n=>n.props['aria-label']===copy.en.refresh).props.onClick();await flush();assert.equal(list().publishTo,'2026-11-09');
outer.props.viewParams={activityDate:'2026-11-09',activityType:'done'};draw();await flush();draw();await flush();assert.equal(list().publishFrom,undefined);assert.equal(list().publishTo,undefined);
reset();const tableOuter=View({...props,viewParams:{tableId:'table-a',groupId:'1'}});render(tableOuter.type,tableOuter.props);await flush();assert.equal(list().tableId,'table-a');assert.equal(list().publishFrom,undefined);assert.equal(list().publishTo,undefined);
for(const lang of ['zh','en']) {
 reset();let changed=[];let p={lang,value:{from:'',to:''},onChange:v=>changed.push(v)};
 let tree=render(dates.DateFilter,p);find(tree,n=>n.props['aria-expanded']===false).props.onClick();tree=render(dates.DateFilter,p);
 const picker=()=>find(render(dates.DateFilter,p),n=>n.props.onCustomChange);
 picker().props.onCustomChange({from:'2026-02-30',to:''});assert.equal(changed.length,0);assert.ok(picker().props.customHint);
 picker().props.onCustomChange({from:'2026-11-09',to:'2026-11-01'});assert.equal(changed.at(-1).from,'2026-11-01');assert.ok(picker().props.customHint.includes(lang==='en'?'swapped':'已交换'));
 picker().props.onCustomClear();assert.equal(changed.at(-1).from,'');
}
const ch=require(dir+'charts.cjs').makeCharts('test-date');
for(const C of [ch.DateRangePicker,ch.RangeSwitch]) {
 const html=renderToStaticMarkup(RealReact.createElement(C,{custom:{from:'2026-11-01',to:'2026-11-09'},today:C===ch.RangeSwitch?'2026-11-08':undefined,customHint:'hint',options:C===ch.RangeSwitch?[{key:'7d',label:'7 days'}]:undefined}));
 assert.ok(html.includes('min="2026-11-01"'));assert.ok(html.includes('role="status"'));assert.ok(html.includes(C===ch.RangeSwitch?'max="2026-11-08"':'max="2026-11-09"'));
 assert.equal(html.includes('7 days'),C===ch.RangeSwitch);assert.equal(html.includes('刷新'),C===ch.RangeSwitch);
}
const fakeCharts=load('charts.cjs').makeCharts('partial');let partialCalls=0,invalidCalls=0;
const partial=fakeCharts.DateRangePicker({custom:{from:'2026-11-01',to:''},onCustomChange:()=>partialCalls++,onInvalidInput:()=>invalidCalls++});
find(partial,n=>n.type==='input').props.onChange({target:{value:'',validity:{badInput:true}}});assert.equal(partialCalls,0);assert.equal(invalidCalls,1);
console.log('TASK DATE UI PASS: single/double/empty, invalid dates, swap notice, AND filters, reset page, refresh/tab preservation, activity navigation, statistics compatibility');
