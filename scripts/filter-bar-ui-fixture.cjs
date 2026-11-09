// Real React and memory-only API; no production data or saved screenshots.
const React=require('react'),h=React.createElement,{createRoot}=require('react-dom/client');
const Heatmap=require('../packages/addons/tasks/client/stats/heatmap.cjs');
let addon;window.__WB_HOST__={addons:[],registerAddon:a=>addon=a};
require('../packages/addons/tasks/client/client.src.cjs');
window.calls=[];
const api={subscribe:()=>()=>{},call:async(action,args={})=>{
 window.calls.push({action,args});let result=[];
 if(action==='tasks.configGet')result={values:{'ui.defaultTab':8,'list.pageSize':12}};
 if(action==='taskNodes.tree')result=[{id:'1',name:'Test',type:'2',children:[]}];
 if(action==='tasks.activityCalendar')result={year:args.year,days:[{date:args.year+'-01-01',done:2,publish:3,shutdown:1}]};
 if(action==='tasks.list'){const start=((args.pageNumber||1)-1)*(args.pageSize||12);result={total:423,returned:12,truncated:true,records:Array.from({length:Math.min(args.pageSize||12,423-start)},(_,i)=>({id:String(start+i+1),title:'Fixture task '+(start+i+1),status:'2',difficulty:2,priority:0,tags:[]}))};}
 return {ok:true,result};
}};
function App(){const [lang,setLang]=React.useState('zh'),[params,setParams]=React.useState(new URLSearchParams(location.search).has('persist')?{}:{tableId:'stale'}),[visible,setVisible]=React.useState(true);
 window.navigateFixture=setParams;
 const tools=h(React.Fragment,null,h('button',{id:'language',onClick:()=>setLang(lang==='zh'?'en':'zh')},'Language'),h('button',{id:'mount-toggle',onClick:()=>setVisible(v=>!v)},'Toggle task view'));
 const view=visible?h(addon.views.find(v=>v.id==='tasks').component,{api,lang,viewParams:params}):h('div',null,'Other view');
 if(new URLSearchParams(location.search).has('host')) return h('div',{className:'wb-inner wb-wide'},h('div',{className:'wb-page-tabs'},tools),h('div',{'data-view-id':'tasks'},view));
 return h(React.Fragment,null,tools,h('main',null,view),h(Heatmap,{api,lang,onNavigate:(_,p)=>setParams(p)}));}
createRoot(document.getElementById('root')).render(h(App));
window.filterEvidence=()=>{
 const panel=document.querySelector('.wbt-filter-panel'),content=document.querySelector('.wbt-filter-content'),rect=panel.getBoundingClientRect();
 return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,panelWidth:rect.width,position:getComputedStyle(panel).position,overflowY:getComputedStyle(panel).overflowY,maxHeight:getComputedStyle(panel).maxHeight,panelHeight:panel.clientHeight,scrollHeight:panel.scrollHeight,collapsed:getComputedStyle(content).display==='none',pager:document.querySelector('.wbt-pager')?.textContent,lastRequest:window.calls.filter(c=>c.action==='tasks.list').at(-1)?.args};
};
