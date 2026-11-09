// Real React components and memory-only API; no host or database writes.
const React = require('react'), h = React.createElement;
const {createRoot} = require('react-dom/client');
const copy = require('../packages/addons/tasks/client/ui/copy.cjs').zh;
const ownership = require('../packages/addons/tasks/client/modals/ownership.cjs');
const Create = require('../packages/addons/tasks/client/modals/create-modal.cjs')({React, tagNames:()=>[], splitTags:()=>[], today:()=> '2026-11-09', addDays:()=> '2026-11-09', hostHasAddon:()=>false});
const Edit = require('../packages/addons/tasks/client/modals/edit-modal.cjs')(React,()=>({zh:'已开启',cls:'active'}),()=> '');
const Batch = require('../packages/addons/tasks/client/modals/batch-modal.cjs')(React,(...x)=>x.filter(Boolean).join(' '),()=>null);
const long = '描述支持自动换行且不裁切。'.repeat(20);
const tree = [{id:'root',type:'2',name:'任务根',children:[{id:'group',type:'0',name:'研发平台 Platform',children:[{id:'old',type:'1',name:'Storage',description:'存储插件职责'},{id:'nested',type:'0',name:'跨团队协作与客户端交互专项',children:[{id:'target',type:'1',name:'Tasks',description:long}]}]},{id:'empty',type:'0',name:'空组不可选'}]}];
window.calls=[]; window.previewTree=tree;
let task={id:'task',title:'测试任务',status:'0',priority:2,tableId:'old'};
const api={call:async(action,args)=>{window.calls.push({action,args}); if(action==='tasks.capabilities')return {ok:true,result:{}};
 if(action==='tasks.update'||action==='tasks.create') {task={...task,...args};return {ok:true,result:{...task,tablePath:ownership.tables(tree).find(x=>x.id===task.tableId)?.path}};} return {ok:true,result:{count:1}};}};
function App(){const [mode,setMode]=React.useState(''),[receipt,setReceipt]=React.useState(''),[dark,setDark]=React.useState(false);
 const close=()=>setMode(''),saved=r=>{setReceipt(ownership.receipt(r));close();};
 return h('div',{className:'wbt',style:{color:dark?'#eee':'#222',background:dark?'#181a20':'#fff',minHeight:'100vh','--wbt-line':dark?'#555':'#ddd','--wbt-accent':'#818cf8','--wbt-bg':dark?'#181a20':'#fff','--wbt-fg':dark?'#eee':'#222'}},
 h('nav',null,...['新建','编辑','批量迁移'].map((x,i)=>h('button',{key:x,onClick:()=>setMode(['create','edit','batch'][i])},x)),h('button',{onClick:()=>setDark(!dark)},'切换主题')),
 h('output',null,receipt),mode==='create'?h(Create,{t:copy,tree,api,defaultTableId:'target',onClose:close,onCreated:saved}):null,
 mode==='edit'?h(Edit,{t:copy,tree,task,api,onClose:close,onSaved:saved}):null,
 mode==='batch'?h(Batch,{t:copy,tree,api,items:[task],mode:'migrate',onClose:close,onDone:()=>{setReceipt('批量迁移完成');close();}}):null);
}
const style=document.createElement('style');style.textContent=require('../packages/addons/tasks/client/ui/styles.cjs')+'body{margin:0;font:14px system-ui}nav{padding:16px}';document.head.appendChild(style);
createRoot(document.getElementById('root')).render(h(App));
