// Actual React components and host outlet; fixtures and requests stay in memory.
const React=require('react'), h=React.createElement, {createRoot}=require('react-dom/client');
const Outlet=require('../packages/shell/client/view-outlet.cjs');
let addon; window.__WB_HOST__={addons:[],registerAddon:a=>addon=a};
require('../packages/addons/tasks/client/client.src.cjs');
const year=new Date().getFullYear(), date=year+'-03-14';
window.calls=[]; window.calendarFailure=false;
const api={subscribe:()=>()=>{},call:async(action,args={})=>{
 window.calls.push({action,args}); let result=[];
 if(action==='tasks.configGet')result={values:{'ui.defaultTab':0,'list.filterRestarted':true,'stats.sections':['recentDone'],'stats.showKpi':false}};
 if(action==='taskNodes.tree')result=[{id:'1',name:'全部任务',type:'2',children:[]}];
 if(action==='tasks.statsReport')result={generatedAt:date,totals:{total:10},lists:{recentDone:[{id:'a',title:'完成日期核对',date,daysAgo:1,difficulty:2,tableTitle:'开发'}]}};
 if(action==='tasks.activityCalendar'){
   await new Promise(r=>setTimeout(r,180));
   if(window.calendarFailure){window.calendarFailure=false;return {ok:false,error:'preview failure'};}
   const days=args.year===year?[{date:args.year+'-01-01',done:1,publish:7,shutdown:0,claimed:2,target:1},{date:args.year+'-01-02',done:3,publish:1,shutdown:2,claimed:1,target:4},{date:args.year+'-01-03',done:5,publish:2,shutdown:4,claimed:0,target:9},{date:args.year+'-01-04',done:8,publish:4,shutdown:7,claimed:3,target:12},{date,done:2,publish:1,shutdown:3,claimed:1,target:5},{date:args.year+'-12-31',done:1,publish:1,shutdown:1,claimed:0,target:2},{date:args.year+'-06-18',done:0,publish:0,shutdown:0,claimed:0,target:3}]:args.year===2024?[{date:'2024-02-29',done:1,publish:0,shutdown:0,claimed:0,target:1}]:[];
   result={year:args.year,days,totals:{done:20,publish:16,shutdown:17,claimed:7,target:36,total:60},max:{done:8,publish:7,shutdown:7,claimed:3,target:12,total:22}};
 }
 if(action==='tasks.list'){window.lastListArgs=args;result={records:args.activityDate?[{id:'a',title:'活动日期 '+args.activityDate+' / '+args.activityType,status:'2',priority:0,difficulty:2,tags:[]}]:[],total:args.activityDate?1:0,current:1,pageable:true};}
 return {ok:true,result};
}};
function App(){const [nav,setNav]=React.useState({id:'stats',params:{}}),[lang,setLang]=React.useState('zh'),[dark,setDark]=React.useState(false),[narrow,setNarrow]=React.useState(false);
 const navigate=(id,params={})=>setNav({id,params});
 React.useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'light';document.body.style.background=dark?'#181c22':'#fafafa';document.body.style.color=dark?'#ecf0f5':'#222';},[dark]);
 return h(React.Fragment,null,h('nav',null,h('button',{onClick:()=>navigate('stats')},'返回统计'),h('button',{onClick:()=>setLang(lang==='zh'?'en':'zh')},'中 / EN'),h('button',{onClick:()=>setDark(!dark)},'深浅主题'),h('button',{onClick:()=>setNarrow(!narrow)},'窄屏'),h('button',{onClick:()=>{window.calendarFailure=true;}},'下一次请求失败')),
 h('main',{style:{width:narrow?'375px':'100%',maxWidth:'100%',marginTop:20}},h(Outlet,{view:addon.views.find(v=>v.id===nav.id),viewProps:{api,lang,viewParams:nav.params,onNavigate:navigate}})));
}
const style=document.createElement('style');
style.textContent=[
 'body{margin:20px;font:14px system-ui;background:#fafafa;color:#222}',
 'nav{display:flex;gap:8px;flex-wrap:wrap}',
 ':root{--wb-surface:#ffffff;--wb-border:#e3e5e8;--wb-muted:#6b7280;--wb-accent:#2563eb;--wb-ok:#18a058;--wb-warn:#d48806;--wb-danger:#e5484d;--wbt-surface:#ffffff;--wbt-line:#e3e5e8;--wbt-accent:#0f8f84;--wbt-text:#1f2329;--wb-text:#1f2329}',
 ':root[data-theme=dark]{--wb-surface:#1d1c19;--wb-border:#3a3833;--wb-muted:#a8a29a;--wb-accent:#5b9dff;--wb-ok:#43c07a;--wb-warn:#e0a63c;--wb-danger:#f0646a;--wbt-surface:#1d1c19;--wbt-line:#3a3833;--wbt-accent:#3fbfb0;--wbt-text:#ecf0f5;--wb-text:#ecf0f5}',
 ':root[data-theme=dark] body{background:#12110f;color:#ecf0f5}'
].join('\n');
document.head.appendChild(style);
createRoot(document.getElementById('root')).render(h(App));
