/** Real component event regressions; API calls are isolated spies, never production writes. */
import assert from 'node:assert/strict';
import Module, { createRequire } from 'node:module';
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
// 共享数字控件在模块顶层 require('react')，这里用同一套假 React 顶替，避免真 hooks 冲突。
const loadModule=Module._load;
Module._load=function(request,parent){if(request==='react'&&parent&&/number-field\.cjs$/.test(parent.filename||''))return React;return loadModule.apply(this,arguments);};
const NF=require('../packages/addons/lib/number-field.cjs');
const walk=n=>n&&typeof n==='object'?[n,...n.children.flatMap(walk)]:[];
const text=n=>n&&typeof n==='object'?n.children.map(text).join(''):String(n??'');
const find=(tree,pred)=>{const n=walk(tree).find(pred);assert.ok(n,'expected control');return n;};
// 真正的 input 在数字控件内部；取出它来驱动键入（控件负责校验与提交，绝不夹取）。
const nfInput=node=>walk(node.type(node.props)).find(n=>n.type==='input'&&n.props.onChange);
const difficultyNode=(tree,lang)=>find(tree,n=>n.type===NF.NumberField&&n.props.ariaLabel===copy[lang].difficulty);
let propsForDifficulty=null;
const reset=()=>{state=[];cursor=0;effects=[];};
// 分阶段弹窗外面套着共享外壳，元素树里只有 Modal/Steps；这里按渲染顺序展开函数组件，
// hooks 仍走本文件的全局序号，所以展开顺序必须与 React 一致（深度优先、先父后子）。
const expandAll=node=>{if(!node||typeof node!=='object')return node;if(Array.isArray(node))return node.map(expandAll);
  if(node.type==='Fragment')return (node.children||[]).map(expandAll);
  if(typeof node.type==='function'){
    // 本文件的假 createElement 把 children 放在元素上、不写进 props；展开时补回去，组件才拿得到。
    const kids=node.children.length?(node.children.length===1?node.children[0]:node.children):undefined;
    return expandAll(node.type(Object.assign({},node.props,{React,children:kids})));
  }
  return Object.assign({},node,{children:(node.children||[]).map(expandAll)});};
const render=(C,p)=>{cursor=0;return C(p);};
const flush=async()=>{const jobs=effects;effects=[];jobs.forEach(fn=>fn());for(let i=0;i<12;i++)await Promise.resolve();};
const tree=[{id:'table',name:'Table',type:'1'}];
const Create=require(dir+'modals/create-modal.cjs')({React,allTables:()=>tree,tagNames:()=>[],splitTags:()=>[],today:()=> '2026-11-09',addDays:()=> '2026-11-09',hostHasAddon:()=>false});
const Edit=require(dir+'modals/edit-modal.cjs')(React,()=>({}),()=> '');
let cases=0;
// 创建弹窗的难度覆盖见 scripts/test-tasks-create-difficulty-ui.mjs（分阶段弹窗需要展开式渲染宿主）。
for(const lang of ['zh','en']) for(const status of ['0','1','2','3']) for(const initial of [null,0,2.5]) {
  reset();let patch;const props={tree,t:copy[lang],task:{id:'task',title:'Task',status,priority:4,difficulty:initial},api:{call:async(_,args)=>{patch=args;return {ok:true};}},onSaved(){}};
  const input=()=>difficultyNode(render(Edit,props),lang);
  const typeIn=value=>nfInput(input()).props.onChange({target:{value}});
  assert.equal(input().props.value,initial||0); typeIn(4);
  assert.ok(text(render(Edit,props)).includes('★★★★☆'));assert.ok(text(render(Edit,props)).includes('4.0'));
  find(render(Edit,props),n=>n.props.className==='wbt-btn primary').props.onClick();await flush();assert.equal(patch.difficulty,4);
  reset();typeIn('');find(render(Edit,props),n=>n.props.className==='wbt-btn primary').props.onClick();await flush();assert.equal(patch.difficulty,0);cases++;
  // 优先级越界只保留原样并禁用保存，绝不夹取后再提交。
  if(status==='2')continue;
  reset();patch=undefined;typeIn(2);
  const prio=()=>find(render(Edit,props),n=>n.type===NF.NumberField&&n.props.max===10);
  nfInput(prio()).props.onChange({target:{value:'11'}});
  assert.equal(prio().props.value,'11');
  assert.equal(find(render(Edit,props),n=>n.props.className==='wbt-btn primary').props.disabled,true);
  find(render(Edit,props),n=>n.props.className==='wbt-btn primary').props.onClick();await flush();
  assert.equal(patch,undefined,'越界优先级不得提交');
  nfInput(prio()).props.onChange({target:{value:'5'}});
  find(render(Edit,props),n=>n.props.className==='wbt-btn primary').props.onClick();await flush();
  if(0){console.log('DBG',JSON.stringify(text(render(Edit,props)).slice(0,400)));}
  assert.equal(patch.priority,5);cases++;
}
// Real React rendering verifies accessible numeric input and stars in both list/card layouts.
const Item=require(dir+'item/task-item.cjs')({React:RealReact,statusInfo:()=>({}),stars:()=> '★★★☆☆',pClass:()=>'',today:()=>'',daysBetween:()=>0,cx:(...s)=>s.filter(Boolean).join(' '),Icon:()=>null,Countdown:()=>null,PathCrumbs:()=>null,Slot:()=>null});
for(const status of ['0','1','2','3'])for(const card of [true,false])for(const difficulty of [null,0,3]) {
  const html=renderToStaticMarkup(RealReact.createElement(Item,{task:{title:'Task',status,difficulty},card,t:copy.en}));
  assert.equal(html.includes('wbt-stars'),difficulty>0);cases++;
}
const config={useConfig:()=>({ready:true,values:{}})};
const charts={makeCharts:()=>new Proxy({colors:[],pct:n=>String(n)},{get:(o,k)=>k in o?o[k]:String(k)})};
const mod={exports:{}};
runInNewContext(readFileSync('packages/addons/tasks/client/views/stats.cjs','utf8'),{module:mod,require:n=>n==='react'?React:n==='./config.cjs'?config:n==='../item/ranking-name.cjs'?require(dir+'item/ranking-name.cjs'):n==='../item/recent-columns.cjs'?require(dir+'item/recent-columns.cjs'):n==='../stats/list-state.cjs'?require(dir+'stats/list-state.cjs'):n==='../stats/task-link.cjs'?require(dir+'stats/task-link.cjs'):charts});
for(const lang of ['zh','en']) {
  reset();let navigation;const props={lang,api:{call:async()=>({result:{totals:{total:5},breakdowns:{priority:[{key:'9',count:4,hidden:false},{key:'0',count:1,hidden:true}],difficulty:[{key:'unset',count:2,hidden:true},{key:'3',count:3}],aging:[{key:'1-7',count:2}]}}})},onNavigate:(...args)=>navigation=args};
  const outer=mod.exports.TasksStatsView(props), Body=outer.type;
  render(Body,outer.props);await flush();const rendered=render(Body,outer.props);
  assert.ok(text(rendered).includes(lang==='en'?'2 tasks without difficulty':'未填难度 2 条'));
  const histogram=walk(rendered).find(n=>n.type==='Histogram'&&n.props.data.some(x=>x.key==='unset'));assert.ok(histogram);assert.equal(histogram.props.data.find(x=>x.key==='unset').label,lang==='en'?'Unset':'未设置');
  find(rendered,n=>n.type==='button'&&text(n).includes(lang==='en'?'Review missing':'查看并补齐')).props.onClick();
  assert.equal(navigation[0],'tasks');assert.equal(navigation[1].difficultyMissing,true);
  // 柱形点击：单值桶映射成同一上下限；未设置桶与「补齐难度」按钮同参数；逾期账龄图不可点击。
  const priorityHist=walk(rendered).find(n=>n.type==='Histogram'&&n.props.data.some(x=>x.key==='9'));
  assert.ok(priorityHist);assert.equal(priorityHist.props.data.some(x=>x.key==='0'),false,'隐藏桶不应画出来');
  assert.equal(typeof priorityHist.props.onSelect,'function');assert.ok(priorityHist.props.selectHint);
  priorityHist.props.onSelect(priorityHist.props.data.find(x=>x.key==='9'));
  assert.equal(JSON.stringify(navigation),JSON.stringify(['tasks',{priorityMin:9,priorityMax:9}]));
  assert.equal(typeof histogram.props.onSelect,'function');
  histogram.props.onSelect({key:'3',count:3});assert.equal(JSON.stringify(navigation),JSON.stringify(['tasks',{difficultyMin:3,difficultyMax:3}]));
  histogram.props.onSelect({key:'0.5',count:1});assert.equal(JSON.stringify(navigation),JSON.stringify(['tasks',{difficultyMin:0.5,difficultyMax:0.5}]));
  histogram.props.onSelect({key:'unset',count:2});assert.equal(JSON.stringify(navigation),JSON.stringify(['tasks',{difficultyMissing:true}]));
  assert.equal(histogram.props.onSelect({key:'x',count:1}),undefined);assert.equal(JSON.stringify(navigation),JSON.stringify(['tasks',{difficultyMissing:true}]),'非法桶不跳转');
  const agingHist=walk(rendered).find(n=>n.type==='Histogram'&&n.props.data.some(x=>String(x.key)==='1-7'));
  if(agingHist)assert.equal(agingHist.props.onSelect,undefined,'逾期账龄图必须保持不可点击');
  cases++;
}
const noop=()=>null;
const View=require(dir+'views/tasks-view.cjs')({React,configView:config,COPY:copy,TABS:[],allTables:()=>[],treeWalk:()=>[],treeFlat:()=>[],cx:(...s)=>s.join(' '),injectCss:noop,Icon:noop,PathCrumbs:noop,TagFilter:noop});
reset();const calls=[];const props={lang:'en',viewParams:{difficultyMissing:true},api:{subscribe:()=>noop,call:async(action,args)=>{calls.push({action,args});return {ok:true,result:action==='tasks.list'?{records:[],total:0}:[]};}}};
const outer=View(props), Body=outer.type;render(Body,outer.props);await flush();
let list=calls.find(c=>c.action==='tasks.list');assert.deepEqual(list.args.statuses,[]);assert.ok(!('urgent' in list.args),'urgent is no longer sent');assert.equal(list.args.difficultyMissing,true);assert.equal(list.args.filterRestarted,undefined);
let rendered=render(Body,outer.props);find(rendered,n=>n.props&&n.props.label===copy.en.difficultyMissing&&typeof n.props.onChange==='function').props.onChange(false);
render(Body,outer.props);await flush();list=calls.filter(c=>c.action==='tasks.list').at(-1);assert.equal(list.args.difficultyMissing,false);assert.equal(list.args.pageNumber,1);
// 统计柱形跳转：只带优先级/难度区间时按「全局范围」清空表、组、搜索词、标签与状态，分页回第 1 页。
for(const viewParams of [{priorityMin:9,priorityMax:9},{difficultyMin:0.5,difficultyMax:0.5}]) {
  reset();const listCalls=[];const p2={lang:'en',viewParams,api:{subscribe:()=>noop,call:async(action,args)=>{listCalls.push({action,args});return {ok:true,result:action==='tasks.list'?{records:[],total:0}:[]};}}};
  const outer2=View(p2),Body2=outer2.type;render(Body2,outer2.props);await flush();
  const list=listCalls.find(c=>c.action==='tasks.list');
  assert.deepEqual(list.args.statuses,[]);assert.equal(list.args.pageNumber,1);
  assert.ok(list.args.tableId==null,'跳转应清空 tableId');assert.ok(list.args.groupId==='1','跳转应回到根分组');
  assert.equal(list.args.titleKey,'');assert.deepEqual(list.args.tagIds,[]);
  assert.equal(list.args.difficultyMissing,false,'跳转应取消「未填难度」勾选');
  for(const key of ['publishFrom','publishTo','doneFrom','doneTo','shutdownFrom','shutdownTo'])assert.ok(list.args[key]==null,'跳转应清空 '+key);
  if(viewParams.priorityMin){assert.equal(list.args.priorityMin,9);assert.equal(list.args.priorityMax,9);assert.equal(list.args.difficultyMin,undefined);}
  else {assert.equal(list.args.difficultyMin,0.5);assert.equal(list.args.difficultyMax,0.5);assert.equal(list.args.priorityMin,undefined);}
}
console.log('TASK DIFFICULTY UI PASS',{cases,filterNavigation:true,barNavigation:true,realReact:RealReact.version});
