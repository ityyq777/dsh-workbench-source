// Browser-only integration fixture: every action mutates memory, never production data.
const React = require('react'), {createRoot} = require('react-dom/client');
const h = React.createElement, copy = require('../packages/addons/tasks/client/ui/copy.cjs');
let addon;
window.__WB_HOST__ = {registerAddon(value){addon=value},addons:[]};
require('../packages/addons/tasks/client/client.src.cjs');
const TaskTimeline = require('../packages/addons/tasks/client/timeline/task-timeline-modal.cjs')(React);
const Create = require('../packages/addons/tasks/client/modals/create-modal.cjs')({React, tagNames:()=>[], splitTags:()=>[], today:()=> '2026-11-09', addDays:()=> '2026-11-09', hostHasAddon:()=>false});
const tree=[{id:'table-1',type:'1',name:'Fixture table'}], calls=[];
let lines=[],tasks=[],nextId=0,mode='timeline',language='zh',target='ordinary',dark=false;
function reset(){
 nextId=0;lines=Array.from({length:25},(_,i)=>({id:'line-'+i,timelineId:'line-'+i,timelineKey:'line-'+i,title:'Timeline '+String(i).padStart(2,'0'),description:'Description '+i}));
 tasks=lines.flatMap((line,i)=>Array.from({length:i===24?1:i===0?45:3},(_,j)=>({id:'task-'+i+'-'+j,timelineId:line.id,title:line.title+' / Task '+String(j).padStart(2,'0'),status:j%2?'2':'0',priority:3,publishDate:'2026-10-'+String(j%28+1).padStart(2,'0'),targetDate:'2026-11-09',description:'Fixture description',tableId:'table-1'})));
 lines.push({id:'empty',timelineId:'empty',timelineKey:'empty',title:'Empty line',description:''},{id:'self',timelineId:'self',timelineKey:'self',title:'Self single',description:''});
 tasks.push({id:'ordinary',title:'Ordinary task',timelineId:null,status:'0',priority:3,tableId:'table-1'},{id:'self',title:'Self singleton task',timelineId:'self',status:'0',priority:3,tableId:'table-1'});
 calls.length=0;
}
reset();
function projected(task){const line=lines.find(x=>x.id===task.timelineId);return {...task,timelineId:line?.id||null,timelineKey:line?.id||null,timelineTitle:line?.title||null,timelineDescription:line?.description||null};}
function paged(rows,args){const page=args.pageNumber||1,size=args.pageSize||20;return {records:rows.slice((page-1)*size,page*size),total:rows.length,current:page,size};}
const api={async call(action,args){
 calls.push({action,args:structuredClone(args)});
 if(action==='tasks.timelines')return {ok:true,result:paged(lines.map(line=>{const members=tasks.filter(x=>x.timelineId===line.id&&x.status!=='3');return {...line,taskCount:members.length,openCount:members.filter(x=>x.status==='0').length,doneCount:members.filter(x=>x.status==='2').length,lastActivityDate:'2026-11-09'};}).filter(x=>(args.includeSingletons||x.taskCount>=2)&&x.title.toLowerCase().includes((args.titleKey||'').toLowerCase())),args)};
 if(action==='tasks.get')return {ok:true,result:{task:projected(tasks.find(x=>x.id===args.id))}};
 if(action==='tasks.list')return {ok:true,result:paged(tasks.filter(x=>x.status!=='3'&&x.title.includes(args.titleKey||'')).map(projected),args)};
 if(action==='tasks.timeline'){const rows=tasks.filter(x=>x.timelineId===(args.timelineId||args.timelineKey)&&x.status!=='3').sort((a,b)=>(a.publishDate||'').localeCompare(b.publishDate||'')||a.id.localeCompare(b.id)).map(projected);return {ok:true,result:args.pageNumber?paged(rows,args):rows};}
 if(action==='taskNodes.tree')return {ok:true,result:tree};
 if(action==='tasks.capabilities')return {ok:true,result:{}};
 if(action==='taskTimelines.create'){const id='new-'+(++nextId),line={id,timelineId:id,timelineKey:id,title:args.title.trim()||'未命名时间线',description:args.description||''};lines.push(line);return {ok:true,result:{timeline:line}};}
 if(action==='taskTimelines.update'){const line=lines.find(x=>x.id===args.timelineId);Object.assign(line,{title:args.title,description:args.description});return {ok:true,result:{timeline:line,changed:true}};}
 if(action==='taskTimelines.attach'||action==='taskTimelines.detach'){const task=tasks.find(x=>x.id===args.taskId);if(action.endsWith('attach')&&!lines.some(x=>x.id===args.timelineId))throw Error('TIMELINE_NOT_FOUND');task.timelineId=action.endsWith('detach')?null:args.timelineId;return {ok:true,result:{taskId:task.id,timelineId:task.timelineId}};}
 if(action==='taskTimelines.delete'){const affected=tasks.filter(x=>x.timelineId===args.timelineId);if(!args.dryRun){affected.forEach(x=>x.timelineId=null);lines=lines.filter(x=>x.id!==args.timelineId);}return {ok:true,result:{affectedTasks:affected.length}};}
 if(action==='tasks.timelineRefactor'){const id=args.timelineId||args.timelineKey;if(!lines.some(x=>x.id===id))throw Error('TIMELINE_NOT_FOUND');const selected=tasks.filter(x=>args.ids?args.ids.includes(x.id):args.timelineKeys.includes(x.timelineId)&&x.status!=='3'),changed=selected.filter(x=>x.timelineId!==id);if(!args.dryRun)changed.forEach(x=>x.timelineId=id);return {ok:true,result:{wouldUpdate:changed.length,updated:args.dryRun?0:changed.length,total:selected.length}};}
 if(action==='tasks.create'){let line=args.timelineId||null;if(args.source==='2'){const old=tasks.find(x=>x.id===args.restartKey);if(!old.timelineId)throw Error('TIMELINE_REQUIRED_FOR_RESTART');line=old.timelineId;old.status='3';}const task={...args,id:'created-task-'+(++nextId),timelineId:line};tasks.push(task);return {ok:true,result:{task:projected(task)}};}
 throw Error('Unexpected fixture action: '+action);
}};
const root=createRoot(document.getElementById('root'));
function render(){const t=copy[language],task=projected(tasks.find(x=>x.id===target));document.documentElement.dataset.theme=dark?'dark':'light';root.render(h(React.Fragment,null,
 h('nav',{id:'view-tabs'},addon.views.map(v=>h('span',{key:v.id},v.title[language]))),
 h('nav',{id:'fixture-tools'},h('button',{onClick:()=>show('task','ordinary')},'Fixture ordinary'),h('button',{onClick:()=>show('restart','ordinary')},'Fixture restart'),h('button',{onClick:()=>show('timeline')},'Fixture timelines')),
 mode==='timeline'?h(addon.views.find(x=>x.id==='timeline').component,{key:'timeline-'+language,api,lang:language}):
 mode==='task'?h(TaskTimeline,{key:'task-'+target,api,t,task,onClose:()=>show('timeline'),onChanged:()=>{},onCreateTimeline:()=>{}}):
 h(Create,{key:'restart-'+target,api,t,source:'2',originTask:task,tree,onClose:()=>show('timeline'),onCreated:()=>show('timeline')})))}
function show(next,id){mode=next;if(id)target=id;render()}
window.fixture={calls,get tasks(){return tasks},get lines(){return lines},show,setLanguage(lang){language=lang;render()},setDark(value){dark=value;render()}};
render();
const pause=()=>new Promise(r=>setTimeout(r,20));
async function wait(fn){for(let i=0;i<150;i++){if(fn())return;await pause()}throw Error('Timed out: '+fn)}
const buttons=()=>Array.from(document.querySelectorAll('button')),options=()=>Array.from(document.querySelectorAll('[role=option]'));
function check(value,message){if(!value)throw Error(message)}
function button(text){const b=buttons().find(x=>x.textContent===text);check(b,'Missing button: '+text);return b}
async function click(text){button(text).click();await pause()}
async function fill(selector,value){const node=document.querySelector(selector);check(node,'Missing field: '+selector);const setter=Object.getOwnPropertyDescriptor(node.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:node.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set;setter.call(node,value);node.dispatchEvent(new Event(node.tagName==='SELECT'?'change':'input',{bubbles:true}));await pause()}
window.runTimelineTests=async()=>{
 let checks=0;const ok=(v,m)=>{check(v,m);checks++};
 await wait(()=>options().length===20&&document.querySelectorAll('.wbt-timeline-member').length===20);
 ok(addon.version==='3.2.0','client version');ok(calls[0].args.includeSingletons===true,'empty and singleton default');
 const list=document.querySelector('[role=listbox]');list.scrollTop=200;const scroll=list.scrollTop;options()[5].click();await pause();ok(document.querySelector('[role=listbox]')===list&&list.scrollTop===scroll,'stable list');
 options()[5].focus();options()[5].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));await pause();ok(document.activeElement===options()[6],'keyboard selection');
 options()[0].click();await wait(()=>document.querySelectorAll('.wbt-timeline-member').length===20);document.querySelector('.wbt-timeline-right [aria-label="下一页"]').click();await wait(()=>document.querySelector('.wbt-timeline-right nav').textContent.includes('2 / 3'));ok(calls.at(-1).args.pageNumber===2,'member pagination');
 await click('选择');options()[0].click();options()[1].click();await pause();await click('合并 (2)');await fill('[role=dialog] select','line-1');await click('预览合并');await wait(()=>buttons().some(x=>x.textContent==='确认合并'));ok(tasks.filter(x=>x.timelineId==='line-1').length===3,'preview read only');await click('确认合并');await wait(()=>!document.querySelector('[role=dialog]'));ok(tasks.filter(x=>x.timelineId==='line-1').length===48,'whole-line merge past page');
 await click('新建时间线');await fill('[role=dialog] input','Manual empty');await fill('[role=dialog] textarea','Independent description');await click('保存时间线');await wait(()=>!document.querySelector('[role=dialog]')&&document.querySelector('.wbt-timeline-right h3').textContent==='Manual empty');
 const line=lines.find(x=>x.title==='Manual empty');ok(!!line,'manual create');ok(tasks.every(x=>x.timelineId!==line.id),'create never attaches');ok(document.querySelector('.wbt-timeline-right').textContent.includes('暂无可显示成员'),'empty entity detail');
 await click('添加已有任务');await fill('[aria-label="搜索已有任务"]','Ordinary task');await wait(()=>document.querySelectorAll('[role=dialog] input[type=checkbox]').length===1);document.querySelector('[role=dialog] input[type=checkbox]').click();await pause();await click('关联任务 (1)');await wait(()=>!document.querySelector('[role=dialog]')&&document.querySelectorAll('.wbt-timeline-member').length===1);ok(tasks.find(x=>x.id==='ordinary').timelineId===line.id&&document.querySelector('.wbt-timeline-right h3').textContent==='Manual empty','top-level attach preserves out-of-page entity');await click('移出时间线');await wait(()=>document.querySelector('.wbt-timeline-right').textContent.includes('暂无可显示成员'));ok(tasks.find(x=>x.id==='ordinary').timelineId===null,'top-level detach preserves empty entity');
 await click('编辑时间线');await fill('[role=dialog] input','Renamed line');await fill('[role=dialog] textarea','Edited description');await click('保存时间线');await wait(()=>!document.querySelector('[role=dialog]'));ok(line.title==='Renamed line'&&line.description==='Edited description','entity metadata');
 show('task','ordinary');await wait(()=>document.body.textContent.includes('没有关联时间线'));ok(!tasks.find(x=>x.id==='ordinary').timelineId,'ordinary task unlinked');
 // Picker lists both empty and singleton entities across pages, without requesting filtered aggregation.
 await click('下一页');await wait(()=>document.querySelector('.wbt-timeline-picker select option[value="empty"]'));ok(!!document.querySelector('.wbt-timeline-picker select option[value="self"]'),'picker includes singleton on second page');ok(document.querySelector('.wbt-timeline-picker select option[value="empty"]').textContent.includes('0 个任务'),'picker includes empty line');
 await fill('.wbt-timeline-picker input','Renamed line');await wait(()=>document.querySelector('.wbt-timeline-picker select option[value="'+line.id+'"]'));
 await fill('.wbt-timeline-picker select',line.id);ok(!tasks.find(x=>x.id==='ordinary').timelineId,'select alone never attaches');await click('关联所选时间线');await wait(()=>document.querySelector('h4')?.textContent==='Renamed line');ok(tasks.find(x=>x.id==='ordinary').timelineId===line.id,'explicit association');
 show('restart','ordinary');await wait(()=>document.querySelector('.wbt-form input'));
 await fill('.wbt-form input','Restarted task');
 // Target ownership uses the real table-picker UI.
 await click('选择目标任务表');
 const tableOption=Array.from(document.querySelectorAll('[role=option]')).find(x=>x.textContent.includes('Fixture table'));check(tableOption,'table option');tableOption.click();await pause();
 await click('创建');await wait(()=>mode==='timeline');const restarted=tasks.find(x=>x.title==='Restarted task');ok(restarted.timelineId===line.id,'restart inherits entity');ok(tasks.find(x=>x.id==='ordinary').status==='3','old task restarted');const createCall=calls.findLast(x=>x.action==='tasks.create');ok(createCall.args.restartKey==='ordinary'&&!('timelineId'in createCall.args)&&!('timelineKey'in createCall.args),'restart does not choose another line');
 show('task',restarted.id);await wait(()=>document.querySelector('h4'));await click('移出时间线');await wait(()=>document.body.textContent.includes('没有关联时间线'));ok(restarted.timelineId===null,'detach');
 const count=tasks.length,writes=calls.filter(x=>x.action==='tasks.create').length;show('restart',restarted.id);await pause();ok(document.body.textContent.includes('请先手动建立并关联时间线，再重启'),'unlinked restart guidance');ok(button('创建').disabled,'unlinked restart disabled');button('创建').click();await pause();ok(tasks.length===count&&calls.filter(x=>x.action==='tasks.create').length===writes,'unlinked restart zero writes');
 show('task','self');await wait(()=>document.querySelector('h4'));ok(document.querySelector('h4').textContent==='Self single'&&document.body.textContent.includes('Self singleton task'),'self-id singleton visible');
 show('timeline');await wait(()=>options().length===20);await fill('input[aria-label="搜索时间线标题"]','Renamed line');await click('搜索');await wait(()=>options().length===1&&document.querySelector('.wbt-timeline-right h3').textContent==='Renamed line');
 const before=tasks.length;await click('删除时间线');ok(lines.includes(line),'delete confirmation first');await click('确认删除时间线');await wait(()=>!lines.includes(line));ok(tasks.length===before&&tasks.find(x=>x.id==='ordinary').timelineId===null,'delete retains tasks and detaches hidden history');
 window.fixture.setLanguage('en');await wait(()=>buttons().some(x=>x.textContent==='New timeline'));ok(document.body.textContent.includes('Include empty and single-task timelines'),'English labels');await click('New timeline');ok(document.querySelector('[role=dialog]').textContent.includes('Timeline title'),'English editor');await click('Cancel');
 window.fixture.setDark(true);await pause();ok(getComputedStyle(document.querySelector('.wbt-timeline-view')).color.replaceAll(' ','')==='rgb(229,231,235)','dark foreground');
 return {passed:true,checks,requests:calls.length,tasksPreserved:tasks.length,noProductionDatabase:true,noScreenshots:true};
};
