// Isolated hook/event regressions: no database, bundle output or production writes.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const require=createRequire(import.meta.url), dir='../packages/addons/tasks/client/';
const model=require(dir+'stats/heatmap-model.cjs');
for(let y=1900;y<=2400;y++){
 const g=model.calendar(y),leap=y%4===0&&(y%100!==0||y%400===0);
 assert.equal(g.days.length,leap?366:365);assert.equal(g.days.at(-1).date,y+'-12-31');
 assert.equal(new Set(g.days.map(d=>d.column+':'+d.row)).size,g.days.length);
 for(const d of g.days)assert.equal(d.row,(new Date(d.date+'T00:00:00Z').getUTCDay()+6)%7+1);
}
assert.equal(model.calendar(2012).weeks,54);
assert.deepEqual([1,2,3,4,6,7,99].map(model.level),[1,2,2,3,3,4,4]);
assert.deepEqual(model.TYPES,['done','publish','shutdown','claimed','target'],'目标排在四类事件之后');
assert.deepEqual(model.FILTER_TYPES,['done','publish','shutdown','claimed'],'活动筛选只认四类事件');
assert.deepEqual(model.activityParams({activityDate:'2024-01-01',activityType:'target'}),{activityDate:'2024-01-01',activityType:'done'},'目标不进活动筛选');
// 未来日期留空只针对四类事件；target 是计划口径，未来日期正是计划的主要形态。
for(const type of model.FILTER_TYPES)assert.equal(model.suppressFuture(type),true,'事件维度抑制未来日期：'+type);
assert.equal(model.suppressFuture('target'),false,'目标维度不抑制未来日期');
assert.equal(model.isFuture('2026-12-01','2026-11-21','done'),true);
assert.equal(model.isFuture('2026-12-01','2026-11-21','target'),false,'目标当前日期之后仍照常显示');
assert.equal(model.isFuture('2026-11-21','2026-11-21','done'),false,'当天不算未来');
assert.deepEqual(model.LEVELS.map(v=>v.label),['1','2–3','4–6','7+']);
for(const [index,entry] of model.LEVELS.entries()){
 assert.equal(model.level(entry.min),index+1);
 if(entry.max!==null)assert.equal(model.level(entry.max),index+1);
 for(const type of model.TYPES)assert.equal(model.background({[type]:entry.min},type),`var(--hm-${type}-${index+1})`);
}
const css=require(dir+'stats/heatmap-styles.cjs');assert.ok(!css.includes('.wbt-hm-levels'));
assert.ok(css.includes('gap:4px'));assert.ok(css.includes('padding-inline-start:12px'));
assert.ok(/--hm-fg-1:/.test(css)&&/--hm-fg-4:/.test(css),'新增方块内文字对比度变量');
assert.ok(css.includes('repeat(7,1fr)')&&css.includes('grid-template-columns:repeat(var(--hm-weeks),minmax(14px,1fr))'),'方块列按容器等分、星期列同步 1fr');
assert.ok(css.includes('aspect-ratio:1'),'方块保持正方形');
assert.ok(!css.includes('min-width:1200px'),'去掉宽屏只拉列不拉块的规则');
assert.ok(css.includes('height:152px'),'骨架按新高度');
// 色板必须由主题 token 派生，禁止写死 hex 与靠 .dark 选择器猜主题。
assert.ok(css.includes('var(--wb-ok')&&css.includes('var(--wb-danger')&&css.includes('var(--wb-warn'),'类型色取自主题语义色');
assert.ok(css.includes('color-mix(in oklab,var(--hm-hue-done)'),'强度档位按主题色混合');
assert.ok(!/\.dark|data-theme=dark|prefers-color-scheme|color-scheme:dark/.test(css),'不再自带深色覆写');
assert.ok(!/#e9ecef|#303740|#568fc7|#d3f0d7/i.test(css),'不再有写死的浅色/深色方块色');
let state=[],cursor=0,effects=[];
const memo=(fn,deps)=>{const i=cursor++,old=state[i];if(!old||deps.some((v,j)=>v!==old.deps[j]))state[i]={value:fn(),deps};return state[i].value;};
const React={createElement:(type,props,...children)=>({type,props:props||{},children:children.flat(Infinity).filter(x=>x!=null)}),useState:v=>{const i=cursor++;if(!(i in state))state[i]=v;return [state[i],v=>state[i]=typeof v==='function'?v(state[i]):v];},useId:()=>"filter-test",useRef:v=>{const i=cursor++;return state[i]||={current:v};},useMemo:memo,useCallback:(fn,deps)=>memo(()=>fn,deps),useEffect:(fn,deps)=>memo(()=>{effects.push(fn);},deps)};
const reset=()=>{state=[];cursor=0;effects=[];},render=(C,p)=>{cursor=0;return C(p);};
const flush=async()=>{const jobs=effects;effects=[];jobs.forEach(fn=>fn());for(let i=0;i<15;i++)await Promise.resolve();};
const walk=n=>n&&typeof n==='object'?[n,...n.children.flatMap(walk)]:[];
const text=n=>n&&typeof n==='object'?n.children.map(text).join(''):String(n??'');
const find=(tree,pred)=>{const n=walk(tree).find(pred);assert.ok(n,'control exists');return n;};
const mod={exports:{}};runInNewContext(readFileSync('packages/addons/tasks/client/stats/heatmap.cjs','utf8'),{module:mod,require:n=>n==='react'?React:createRequire(require.resolve(dir+'stats/heatmap.cjs'))(n),Date,Map});
const Heatmap=mod.exports,y=new Date().getFullYear(),date=y+'-01-01',big=y+'-02-02',zero=y+'-03-03',plan=y+'-12-20',today=model.localDay(new Date());
for(const lang of ['zh','en']){
 reset();let navigation,fail=false;const calls=[];
 const p={lang,onNavigate:(...v)=>navigation=v,api:{call:async(action,args)=>{calls.push(args);if(fail){fail=false;return {ok:false};}return {ok:true,result:{year:args.year,days:args.year===y?[{date,done:2,publish:4,shutdown:7,claimed:3,target:5},{date:big,done:150,publish:4,shutdown:7,claimed:3,target:150},{date:plan,done:1,publish:1,shutdown:1,claimed:1,target:2}]:[]}};}}};
 let v=render(Heatmap,p);assert.ok(text(v).includes(model.COPY[lang].loading));await flush();v=render(Heatmap,p);
 const day=()=>find(render(Heatmap,p),n=>n.props['data-date']===date);
 assert.equal(day().props.title,date+' · '+model.COPY[lang].done+' 2');
 assert.equal(day().props.style.background,'var(--hm-done-2)');
 assert.equal(day().props['data-level'],2);assert.equal(day().props['data-type'],'done');
 const numCell=(d)=>find(render(Heatmap,p),n=>n.props['data-date']===d);
 assert.equal(text(numCell(big)),'99+','三位数收敛为 99+');assert.equal(numCell(big).props['data-level'],4);
 assert.equal(numCell(zero).children.length,0,'0 条不渲染数字');assert.equal(numCell(zero).props['data-level'],0);
 assert.equal(numCell(date).children.length,1);const num=numCell(date).children[0];
 assert.equal(num.props.className,'wbt-hm-num');assert.equal(num.props['aria-hidden'],true);assert.equal(text(num),'2');
 for(const type of model.FILTER_TYPES){find(render(Heatmap,p),n=>n.props.role==='tab'&&text(n)===model.COPY[lang][type]).props.onClick();await flush();v=render(Heatmap,p);assert.equal(calls.length,1);day().props.onClick();assert.equal(navigation[0],'tasks');assert.equal(navigation[1].activityType,type);assert.equal(navigation[1].activityDate,date);
  const legend=find(v,n=>n.props.className==='wbt-hm-intensity');
  assert.equal(legend.props.role,'img');assert.equal(legend.props['aria-label'],model.legendLabel(lang));
  assert.ok(text(legend).startsWith(model.COPY[lang].dailyCount));
  const items=walk(legend).filter(n=>n.props.className==='wbt-hm-intensity-item');assert.equal(items.length,4);
  items.forEach((item,index)=>{assert.equal(text(item),model.LEVELS[index].label);const swatch=find(item,n=>n.props.className==='wbt-hm-swatch');assert.equal(swatch.props['aria-hidden'],true);assert.equal(swatch.props.style.background,`var(--hm-${type}-${index+1})`);});
  if(plan>today){const planCell=find(v,n=>n.props['data-date']===plan);assert.equal(planCell.children.length,0,'事件维度的未来日期仍留空');assert.equal(planCell.props['data-level'],0);assert.ok(planCell.props.title.endsWith(model.COPY[lang].future));assert.equal(planCell.props.className,'wbt-hm-day wbt-hm-future');}
  const tabs=find(v,n=>n.props.role==='tablist');assert.equal(tabs.children.length,5);assert.ok(!walk(tabs).includes(legend));
 }
 // 目标维度：可切、显示数字与图例，但格子不可点、不拼活动筛选，总数换标签。
 find(render(Heatmap,p),n=>n.props.role==='tab'&&text(n)===model.COPY[lang].target).props.onClick();await flush();v=render(Heatmap,p);
 assert.equal(text(numCell(date)),'5','目标格显示计划数');
 assert.equal(day().props.title,date+' · '+model.COPY[lang].target+' 5');
 assert.equal(day().props['aria-disabled'],true,'目标格不可点');
 navigation=null;day().props.onClick();assert.equal(navigation,null,'点目标格不跳转');
 assert.equal(numCell(big).props['data-level'],4,'目标强度档位复用到第四档');
 assert.equal(numCell(big).props.style.background,'var(--hm-target-4)');
 assert.ok(text(v).includes(model.COPY[lang].targetTotal+' · 157'),'目标总数单独统计（5+150+2）');
 if(plan>today){const planCell=find(v,n=>n.props['data-date']===plan);
  assert.equal(text(planCell),'2','目标维度的未来计划日照常显示数字');
  assert.equal(planCell.props['data-level'],2,'目标未来格子仍按强度上色档');
  assert.equal(planCell.props.style.background,'var(--hm-target-2)');
  assert.ok(!planCell.props.className.includes('wbt-hm-future'),'目标未来格子不再标记为留空格');
  assert.equal(planCell.props.title,plan+' · '+model.COPY[lang].target+' 2','目标 tooltip 不追加「未来日期」');
  assert.equal(planCell.props['aria-disabled'],true,'目标格仍不可点击');
  navigation=null;planCell.props.onClick();assert.equal(navigation,null,'点目标未来格不跳转');
 }
 assert.ok(text(v).includes(model.COPY[lang].targetNote),'目标维度给出计划口径说明');
 assert.equal(walk(v).filter(n=>n.props.role==='tab').length,5);
 const claimedTab=walk(v).find(n=>n.props.role==='tab'&&text(n)===model.COPY[lang].claimed);if(claimedTab){claimedTab.props.onClick();await flush();render(Heatmap,p);assert.equal(text(find(render(Heatmap,p),n=>n.props['data-date']===date)),'3');}
 const future=walk(v).find(n=>n.props['data-date']>model.localDay(new Date()));
 if(future){assert.equal(future.children.length,0,'未来日期不渲染数字');assert.equal(future.props['data-level'],0);navigation=null;assert.equal(future.props['aria-disabled'],true);assert.equal(future.props.disabled,undefined);future.props.onClick();assert.equal(navigation,null);}
 find(v,n=>n.props['aria-label']===model.COPY[lang].previous).props.onClick();render(Heatmap,p);await flush();v=render(Heatmap,p);assert.ok(text(v).includes(model.COPY[lang].empty.claimed),'空年份沿用当前维度文案');
 find(v,n=>n.props['aria-label']===model.COPY[lang].next).props.onClick();render(Heatmap,p);await flush();v=render(Heatmap,p);assert.equal(calls.length,2);
 fail=true;find(v,n=>n.props['aria-label']===model.COPY[lang].next).props.onClick();render(Heatmap,p);await flush();v=render(Heatmap,p);assert.ok(text(v).includes(model.COPY[lang].error));
 find(v,n=>n.type==='button'&&text(n)===model.COPY[lang].retry).props.onClick();render(Heatmap,p);await flush();v=render(Heatmap,p);assert.ok(text(v).includes(model.COPY[lang].empty.claimed));assert.equal(calls.length,4);
}
const noop=()=>null,copy=require(dir+'ui/copy.cjs');
const View=require(dir+'views/tasks-view.cjs')({React,configView:{useConfig:()=>({ready:true,values:{'list.filterRestarted':true,'ui.defaultTab':0}})},COPY:copy,TABS:[],allTables:()=>[],treeWalk:()=>[],treeFlat:()=>[],cx:(...s)=>s.join(' '),injectCss:noop,Icon:noop,PathCrumbs:noop,TagFilter:noop});
for(const activityType of model.FILTER_TYPES){
 reset();const calls=[],p={lang:'en',viewParams:{activityDate:date,activityType,tableId:'stale',difficultyMissing:true},api:{subscribe:()=>noop,call:async(action,args)=>{calls.push({action,args});return {ok:true,result:action==='tasks.list'?{records:[],total:0}:[]};}}};
 const outer=View(p),Body=outer.type;render(Body,outer.props);await flush();render(Body,outer.props);await flush();let args=calls.filter(c=>c.action==='tasks.list').at(-1).args;
 assert.equal(args[activityType+'From'],date);assert.equal(args[activityType+'To'],date);assert.deepEqual(args.statuses,activityType==='done'?[2]:activityType==='shutdown'?[1]:[]);assert.ok(!('urgent' in args),'the panel never sends the legacy urgent flag');assert.equal(args.filterRestarted,undefined);assert.equal(args.tableId,null);assert.equal(args.difficultyMissing,false);assert.equal(args.titleKey,'');assert.deepEqual(args.tagIds,[]);
 find(render(Body,outer.props),n=>n.props.kind===activityType&&n.props.value).props.onChange({from:'',to:''});render(Body,outer.props);await flush();args=calls.filter(c=>c.action==='tasks.list').at(-1).args;assert.ok(!('activityDate' in args));assert.ok(!('activityType' in args));
}
console.log('TASK ACTIVITY UI PASS: 501 years, leap/54-week geometry, 5 legend tabs with target plan dimension, in-cell counts (2, 99+, empty 0/future events), future target plans kept visible by type, zh/en, cache/retry/empty, accessible non-clickable target cells, list drilldown and clear');
