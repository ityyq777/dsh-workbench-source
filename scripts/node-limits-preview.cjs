// Memory-only browser acceptance: captures actual components passed to TasksView.
const React=require('react'), h=React.createElement;
const {createRoot}=require('react-dom/client');
window.__WB_HOST__={registerAddon(){},addons:[]};
require('../packages/addons/tasks/client/client.src.cjs');
const {NodeModal,TreeNode,PathCrumbs}=window.nodeComponents;
const Fields=require('../packages/addons/tasks/client/modals/ownership-fields.cjs')(React);
const Picker=require('../packages/addons/tasks/client/modals/table-picker.cjs')(React);
const copy=require('../packages/addons/tasks/client/ui/copy.cjs').zh;
const name='名称Name'.repeat(6)+'尾End';
const tree=[{id:'root',name:'根',type:'2',children:[{id:'group',name,type:'0',children:[{id:'table',name,type:'1'}]}]}];
window.calls=[];
const api={call:async(action,args)=>{window.calls.push({action,args});return {ok:true};}};
function App(){
 const [mode,setMode]=React.useState(''),[receipt,setReceipt]=React.useState('');
 const [form,setForm]=React.useState({newPath:true,tablePath:name,pathDescriptions:['职责'],tableId:'',confirmed:false});
 const patch=value=>setForm({...form,...value});
 return h('div',{className:'wbt-root',style:{padding:8}},
  h('div',null,h('button',{onClick:()=>setMode('create')},'新建节点'),h('button',{onClick:()=>setMode('edit')},'编辑节点')),
  h('output',null,receipt),
  h(TreeNode,{node:tree[0].children[0],t:copy,expanded:new Set(),onSelect(){},onToggle(){},onAdd(){}}),
  h(PathCrumbs,{path:[{id:'group',name,type:'0'},{id:'table',name,type:'1'}]}),
  h(Picker,{tree,value:'table',onChange(){}}),
  h(Fields,{tree,form,set:(k,v)=>patch({[k]:v}),setMany:patch}),
  mode?h(NodeModal,{t:copy,api,parentId:'root',type:'0',node:mode==='edit'?{id:'group',name,type:'0'}:null,onClose:()=>setMode(''),onSaved:()=>{setReceipt('已保存 '+window.calls.at(-1).args.name);setMode('');}}):null);
}
const style=document.createElement('style');style.textContent=require('../packages/addons/tasks/client/ui/styles.cjs')+'body{margin:0;font:14px system-ui}';document.head.appendChild(style);
createRoot(document.getElementById('root')).render(h(App));
