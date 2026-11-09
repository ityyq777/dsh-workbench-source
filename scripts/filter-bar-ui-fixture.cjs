// Real client, memory-only requests; no production data or screenshots.
const React=require('react'),h=React.createElement,{createRoot}=require('react-dom/client');
let addon;window.__WB_HOST__={addons:[],registerAddon:a=>addon=a};
require('../packages/addons/tasks/client/client.src.cjs');
window.calls=[];
const api={subscribe:()=>()=>{},call:async(action,args={})=>{
 window.calls.push({action,args});let result=[];
 if(action==='tasks.configGet')result={values:{'ui.defaultTab':8,'list.pageSize':12}};
 if(action==='taskNodes.tree')result=[{id:'1',name:'Test',type:'2',children:[]}];
 if(action==='tasks.list'){const start=((args.pageNumber||1)-1)*(args.pageSize||12);result={total:423,returned:12,truncated:true,records:Array.from({length:Math.min(args.pageSize||12,423-start)},(_,i)=>({id:String(start+i+1),title:'Fixture task '+(start+i+1),status:'2',difficulty:2,priority:0,tags:[]}))};}
 return {ok:true,result};
}};
function App(){const [lang,setLang]=React.useState('zh'),[activity,setActivity]=React.useState(false);
 return h(React.Fragment,null,h('button',{id:'language',onClick:()=>setLang(lang==='zh'?'en':'zh')},'Language'),h('button',{id:'activity',onClick:()=>setActivity(!activity)},'Activity'),h('main',{style:{width:375,maxWidth:'100%'}},h(addon.views.find(v=>v.id==='tasks').component,{key:String(activity),api,lang,viewParams:activity?{activityDate:'2026-11-01',activityType:'done'}:{}})));}
createRoot(document.getElementById('root')).render(h(App));
window.filterEvidence=()=>{
 const bar=document.querySelector('.wbt-filters'),nodes=[...bar.children],boxes=nodes.map(n=>{const r=n.getBoundingClientRect();return {text:n.textContent,x:r.x,y:r.y,right:r.right,bottom:r.bottom};});
 const overlap=boxes.some((a,i)=>boxes.slice(i+1).some(b=>a.x<b.right&&a.right>b.x&&a.y<b.bottom&&a.bottom>b.y));
 return {labels:nodes.map(n=>n.textContent),overlap,width:document.querySelector('main').getBoundingClientRect().width,within:boxes.every(r=>r.right<=bar.getBoundingClientRect().right+1),pager:document.querySelector('.wbt-pager')?.textContent,nextDisabled:document.querySelector('.wbt-pager button:last-child')?.disabled,hint:!!document.querySelector('.wbt-hint'),lastRequest:window.calls.filter(c=>c.action==='tasks.list').at(-1)?.args};
};
