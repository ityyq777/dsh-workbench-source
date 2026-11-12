// Real components + real host outlet; all data stays in memory.
const React = require('react'), h = React.createElement;
const {createRoot} = require('react-dom/client');
const Outlet = require('../packages/shell/client/view-outlet.cjs');
let addon;
window.__WB_HOST__ = {addons: [], registerAddon: a => addon = a};
require('../packages/addons/tasks/client/client.src.cjs');
const tree = [{id:'1',name:'全部任务',type:'2',children:[{id:'group',parent:'1',name:'研发组',type:'0',children:[{id:'table',parent:'group',name:'开发',type:'1'}]}]}];
const rows = Array.from({length:24}, (_,i) => ({id:'task'+i,title:['半星任务','零难度任务','未填任务','删表任务'][i%4]+i,difficulty:[2.5,0,null,5][i%4],tableId:i%4===3?null:'table',groupId:i%4===3?null:'group',tableDeleted:i%4===3,tableTitle:i%4===3?'已删除任务表':'开发',date:'2026-11-09',daysAgo:0}));
window.calls=[];
const api={subscribe:()=>()=>{},call:async(action,args={})=>{
 window.calls.push({action,args});let result=[];
 if(action==='tasks.configGet')result={values:{'ui.defaultTab':0,'ui.expandDepth':0,'list.sort':'difficulty','list.filterRestarted':true,'stats.sections':['recentDone','recentShutdown'],'stats.showKpi':false}};
 if(action==='taskNodes.tree')result=tree;
 if(action==='taskNodes.path')result=[tree[0],tree[0].children[0],tree[0].children[0].children[0]];
 if(action==='tasks.statsReport')result={generatedAt:'2026-11-09',totals:{total:24},lists:{recentDone:rows,recentShutdown:rows}};
 if(action==='tasks.list'){window.lastListArgs=args;result={records:[{id:'1',title:'全部该表任务',difficulty:2.5,status:'2',priority:0,tags:[]}],total:1,current:1,pageable:true};}
 return {ok:true,result};
}};
function App(){const [nav,setNav]=React.useState({id:'stats',params:{}});const navigate=(id,params={})=>setNav({id,params});
 return h(React.Fragment,null,h('nav',{style:{position:'fixed',top:0,background:'white',zIndex:5}},h('button',{onClick:()=>navigate('stats')},'返回统计'),h('button',{onClick:()=>navigate('tasks',{difficultyMissing:true})},'未填难度入口')),
 h('main',{id:'preview-scroll',style:{height:'640px',overflow:'auto',marginTop:32}},h(Outlet,{view:addon.views.find(v=>v.id===nav.id),viewProps:{api,lang:'zh',viewParams:nav.params,onNavigate:navigate}})));
}
const style=document.createElement('style');style.textContent='body{margin:20px;font:14px system-ui;color:#222;background:#fafafa}';document.head.appendChild(style);
createRoot(document.getElementById('root')).render(h(App));
