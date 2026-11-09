// Browser-only statistics fixture: actual addon and React, memory API, no production writes.
const React=require('react'),h=React.createElement,{createRoot}=require('react-dom/client');
let addon;window.__WB_HOST__={addons:[],registerAddon:a=>addon=a};
require('../packages/addons/tasks/client/client.src.cjs');
const row={id:'table-1',title:'开发任务表',groupId:'group-1',total:179,open:23,overdue:2,completion:.865};
const recent=[{id:'task-1',title:'今天发布的任务',date:'2026-11-09',daysAgo:0,difficulty:2.5,tableId:'table-1',groupId:'group-1',tableTitle:'开发任务表'}, {id:'task-2',title:'历史任务',date:'',daysAgo:null,difficulty:0,tableDeleted:true,tableTitle:'已删除任务表'}];
const report={totals:{total:179,active:23,done:155,overdue:2},rates:{completion:.865},rankings:{tables:[row,{...row,id:'__missing__',title:'已删除任务表'}],groups:[{...row,id:'group-1',title:'文档处理平台'},{...row,id:'__ungrouped__',title:'未归档'}]},lists:{recentPublish:recent,recentDone:recent,recentShutdown:recent,overdue:[{title:'逾期任务',targetDate:'2026-11-01',daysOverdue:8,tableTitle:'开发任务表'}]}};
window.calls=[];window.navigation=[];
const api={subscribe:()=>()=>{},call:async(action,args={})=>{window.calls.push({action,args});let result=[];
 if(action==='tasks.configGet')result={values:{}};
 if(action==='tasks.statsReport')result=report;
 if(action==='tasks.activityCalendar')result={year:args.year,days:[]};
 if(action==='tasks.list')result={records:[],total:179};
 if(action==='taskNodes.tree')result=[{id:'group-1',name:'文档处理平台',type:'2',children:[{id:'table-1',name:'开发任务表',type:'3',children:[]}]}];
 return {ok:true,result};}};
function App(){const [lang,setLang]=React.useState(new URLSearchParams(location.search).get('lang')||'zh'),[view,setView]=React.useState('stats'),[params,setParams]=React.useState({});
 const navigate=(name,p)=>{window.navigation.push([name,p]);setParams(p);setView(name);};
 return h(React.Fragment,null,h('button',{id:'language',onClick:()=>setLang(lang==='zh'?'en':'zh')},'Language'),h('button',{id:'stats',onClick:()=>setView('stats')},'Stats'),h(addon.views.find(v=>v.id===view).component,{key:view,api,lang,viewParams:params,onNavigate:navigate}));}
createRoot(document.getElementById('root')).render(h(App));
