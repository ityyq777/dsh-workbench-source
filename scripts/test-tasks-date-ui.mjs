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
function load(name,extra={}) { const mod={exports:{}};runInNewContext(readFileSync(dirPath+name,'utf8'),{module:mod,require:n=>n==='react'?React:extra[n]||createRequire(require.resolve(dir+name))(n),document:{getElementById(){return true;},addEventListener(){},removeEventListener(){}},Date,isFinite});return mod.exports; }
const dates=load('ui/date-filter.cjs');
assert.equal(dates.validDate('2025-02-29'),false);assert.equal(dates.validDate('2024-02-29'),true);
assert.equal(dates.validDate('2026-04-31'),false);assert.equal(dates.validDate('0000-01-01'),false);
const noop=()=>null,config={useConfig:()=>({ready:true,values:{'ui.defaultTab':8}})};
const View=require(dir+'views/tasks-view.cjs')({React,configView:config,COPY:copy,TABS:[{id:8,en:'All'},{id:5,en:'Done'}],allTables:()=>[],treeWalk:()=>[],treeFlat:()=>[],cx:(...s)=>s.join(' '),injectCss:noop,Icon:noop,PathCrumbs:noop,TagFilter:noop});
reset();const calls=[];const props={lang:'en',api:{subscribe:()=>noop,call:async(action,args)=>{calls.push({action,args});return {ok:true,result:action==='tasks.list'?{records:[],total:30,pageable:true}:[]};}}};
const outer=View(props),Body=outer.type;
const draw=()=>render(Body,outer.props),list=()=>calls.filter(c=>c.action==='tasks.list').at(-1).args;
draw();await flush();
const status=key=>find(draw(),n=>n.props['data-status']===key);
const date=key=>find(draw(),n=>n.props.kind===key&&n.props.value?.from!==undefined);
const change=async(key,edge,value)=>{const control=date(key);control.props.onChange({...control.props.value,[edge.toLowerCase()]:value});draw();await flush();};
assert.equal(status('all').props.checked,true);
status('all').props.onChange();draw();await flush();
find(draw(),n=>n.type==='button'&&n.children.some(c=>c?.props?.name==='right')).props.onClick();draw();await flush();assert.equal(list().pageNumber,2);
await change('publish','From','2026-11-01');assert.equal(list().publishFrom,'2026-11-01');assert.equal(list().publishTo,undefined);assert.equal(list().pageNumber,1);
await change('publish','To','2026-11-09');assert.equal(list().publishTo,'2026-11-09');
await change('publish','From','2026-11-12');assert.equal(list().publishFrom,'2026-11-09');assert.equal(list().publishTo,'2026-11-12');assert.ok(text(draw()).includes('dates swapped'));
await change('publish','From','2026-02-30');assert.equal(list().publishFrom,'2026-11-09');assert.ok(text(draw()).includes('valid date'));
find(draw(),n=>n.type==='input'&&n.props.placeholder===copy.en.search).props.onChange({target:{value:'needle'}});
find(draw(),n=>n.type==='form').props.onSubmit({preventDefault(){}});
find(draw(),n=>n.props.ids&&n.props.onChange).props.onChange(['tag-a']);
status('0').props.onChange();draw();await flush();
assert.equal(status('all').props.checked,false);assert.ok(!date('done','From').props.disabled);assert.ok(!date('shutdown','From').props.disabled);
await change('done','From','2026-11-01');assert.deepEqual(list().statuses,[0,2]);assert.ok(text(draw()).includes('selected automatically'));assert.ok(!date('done','From').props.disabled);
status('urgent').props.onChange();status('3').props.onChange();draw();await flush();assert.deepEqual(list().statuses,[0,2,3]);assert.equal(list().urgent,true);
assert.equal(list().publishFrom,'2026-11-09');assert.equal(list().titleKey,'needle');assert.deepEqual(list().tagIds,['tag-a']);
await change('done','To','2026-11-09');assert.equal(list().doneTo,'2026-11-09');
status('2').props.onChange();draw();await flush();assert.equal(list().doneTo,undefined);assert.ok(!date('done','To').props.disabled);
status('all').props.onChange();draw();await flush();assert.deepEqual(list().statuses,[]);assert.equal(list().urgent,false);
await change('done','From','2026-11-08');assert.deepEqual(list().statuses,[2]);assert.ok(text(draw()).includes('selected automatically'));
status('2').props.onChange();draw();await flush();assert.equal(status('all').props.checked,true);assert.equal(list().doneFrom,undefined);assert.equal(list().doneTo,undefined);
find(draw(),n=>n.props['aria-label']===copy.en.refresh).props.onClick();await flush();assert.equal(list().publishTo,'2026-11-12');
outer.props.viewParams={activityDate:'2026-11-09',activityType:'done'};draw();await flush();draw();await flush();assert.equal(list().publishFrom,undefined);assert.equal(list().publishTo,undefined);assert.equal(list().doneFrom,'2026-11-09');assert.equal(list().doneTo,'2026-11-09');assert.deepEqual(list().statuses,[2]);
reset();const tableOuter=View({...props,viewParams:{tableId:'table-a',groupId:'1'}});render(tableOuter.type,tableOuter.props);await flush();assert.equal(list().tableId,'table-a');assert.equal(list().publishFrom,undefined);assert.equal(list().publishTo,undefined);
for(const lang of ['zh','en']) {
 reset();const changed=[];const p={lang,value:{from:'2026-11-01',to:'2026-11-09'},onChange:v=>changed.push(v)};
 const drawDate=()=>render(dates.DateFilter,p);
 const trigger=()=>find(drawDate(),n=>n.props['aria-expanded']!==undefined);
 assert.equal(trigger().props['aria-expanded'],false);assert.ok(!walk(drawDate()).some(n=>n.props.type==='date'));
 trigger().props.onClick();assert.equal(trigger().props['aria-expanded'],true);
 const day=d=>find(drawDate(),n=>n.props['data-day']===d);
 day('2026-11-09').props.onClick();assert.equal(changed.length,0);
 day('2026-11-01').props.onClick();assert.equal(changed.at(-1).from,'2026-11-01');assert.equal(changed.at(-1).to,'2026-11-09');assert.equal(changed.at(-1).swapped,true);assert.equal(trigger().props['aria-expanded'],false);
 trigger().props.onClick();day('2026-11-05').props.onClick();day('2026-11-05').props.onClick();assert.equal(changed.at(-1).from,changed.at(-1).to);
 trigger().props.onClick();day('2026-11-08').props.onClick();find(drawDate(),n=>n.type==='button'&&text(n)===(lang==='en'?'From this date':'仅起始日期')).props.onClick();assert.equal(changed.at(-1).to,'');
 trigger().props.onClick();find(drawDate(),n=>n.props['aria-label']===(lang==='en'?'Next month':'下个月')).props.onClick();assert.ok(day('2026-12-01'));
 day('2026-12-01').props.onKeyDown({key:'ArrowLeft',preventDefault(){}});assert.ok(day('2026-11-30'));
 find(drawDate(),n=>n.props['aria-label']===(lang==='en'?'Clear time range':'清除时间范围')).props.onClick();assert.equal(changed.at(-1).from,'');assert.equal(changed.at(-1).to,'');
}
const ch=require(dir+'stats/charts.cjs').makeCharts('test-date');
for(const C of [ch.DateRangePicker,ch.RangeSwitch]) {
 const html=renderToStaticMarkup(RealReact.createElement(C,{custom:{from:'2026-11-01',to:'2026-11-09'},today:C===ch.RangeSwitch?'2026-11-08':undefined,customHint:'hint',options:C===ch.RangeSwitch?[{key:'7d',label:'7 days'}]:undefined}));
 assert.ok(html.includes('min="2026-11-01"'));assert.ok(html.includes('role="status"'));assert.ok(html.includes(C===ch.RangeSwitch?'max="2026-11-08"':'max="2026-11-09"'));
 assert.equal(html.includes('7 days'),C===ch.RangeSwitch);assert.equal(html.includes('刷新'),C===ch.RangeSwitch);
}
const fakeCharts=load('stats/charts.cjs').makeCharts('partial');let partialCalls=0,invalidCalls=0;
const partial=fakeCharts.DateRangePicker({custom:{from:'2026-11-01',to:''},onCustomChange:()=>partialCalls++,onInvalidInput:()=>invalidCalls++});
find(partial,n=>n.type==='input').props.onChange({target:{value:'',validity:{badInput:true}}});assert.equal(partialCalls,0);assert.equal(invalidCalls,1);
console.log('TASK DATE UI PASS: single/double/empty, invalid dates, swap notice, AND filters, reset page, refresh/tab preservation, activity navigation, statistics compatibility');
