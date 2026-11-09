// 独立只读组件验收页：无数据库调用；Ctrl-C 关闭。
import { build } from 'esbuild';
import { createServer } from 'node:http';
const source = String.raw`
const React = require('react'), h=React.createElement;
const {createRoot}=require('react-dom/client');
const icons=require('lucide-react');
const Icon=({name,size})=>h(name==='pilcrow'?icons.Pilcrow:icons.CodeXml,{size});
const copy=require('./packages/addons/tasks/client/ui/copy.cjs');
const desc=require('./packages/addons/lib/description.cjs');
require('./packages/addons/tags/client/charts.cjs').makeCharts('wbg');
const Top=require('./packages/addons/tags/client/top-tags.cjs').TopTags;
const Task=require('./packages/addons/tasks/client/item/task-item.cjs')({React,statusInfo:()=>({zh:'开启',en:'Active',cls:'active'}),stars:()=>'',pClass:()=> 'low',today:()=> '2026-11-09',daysBetween:()=>1,cx:(...x)=>x.filter(Boolean).join(' '),Icon,Countdown:()=>null,PathCrumbs:()=>null});
const style=document.createElement('style');style.textContent=require('./packages/addons/tasks/client/ui/styles.cjs')+desc.css+'body{margin:24px;font:14px system-ui;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}.controls{display:flex;gap:12px;margin-bottom:20px}.samples{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.wbt-item{border:1px solid var(--wb-border);padding:12px}.storage{margin-top:24px}.wbg-top-card{max-width:420px}';document.head.appendChild(style);
const text='# Markdown 标题\n\n**重点** 与 *强调*，搜索 needle\n换行保留\n\n- 列表 needle\n  - 子项\n\n> 引用内容\n\n[安全链接](https://example.com)\n[javascript](javascript:alert(1))\n\n'+String.fromCharCode(96).repeat(3)+'\nconst raw = "**literal**";\n'+String.fromCharCode(96).repeat(3);
function App(){const [lang,L]=React.useState('zh'),[dark,D]=React.useState(false),[count,C]=React.useState(100),[page,P]=React.useState('body'),[selected,S]=React.useState('');
React.useEffect(()=>{const v={'--dsw-alias-bg-base':dark?'#16191f':'#fff','--dsw-alias-bg-layer-1':dark?'#212630':'#fff','--dsw-alias-label-primary':dark?'#e7eaf0':'#20242c','--dsw-alias-label-secondary':dark?'#aeb5c2':'#657080','--dsw-alias-border-l2':dark?'#414957':'#ddd','--wb-border':dark?'#414957':'#ddd','--wb-radius-sm':'6px','--dsw-alias-brand-primary':'#278cbd'};Object.entries(v).forEach(([k,v])=>document.documentElement.style.setProperty(k,v));},[dark]);
return h(React.Fragment,null,h('div',{className:'controls'},h('button',{onClick:()=>P(page==='body'?'tags':'body')},'切换页面'),h('button',{onClick:()=>L(lang==='zh'?'en':'zh')},'English / 中文'),h('button',{onClick:()=>D(!dark)},'深浅主题'),h('button',{onClick:()=>C(count===100?12:100)},'100 / 12'),h('output',null,selected)),page==='body'?h('main',null,h('div',{className:'samples wbt-root'},['A','B','C'].map(id=>h(Task,{key:id,card:true,lang,t:copy[lang],keyword:'needle',task:{id,title:id+' 独立正文样例',description:text,review:'**感受** needle\n第二行\n第三行\n第四行',status:'0',tags:[]},onEdit(){},update(){}}))),h('section',{className:'storage'},h('h2',null,'Storage'),h(desc.Description,{text,lang}))):h('div',{className:'wbg-stats'},h(Top,{lang,total:count,rows:Array.from({length:count},(_,i)=>({id:String(i),name:'标签 '+(i+1)+' · 长名称截断与可读性验证',count:300-i*2})),onSelect:r=>S(r.name)})));}
createRoot(document.getElementById('root')).render(h(App));
`;
const output=await build({stdin:{contents:source,resolveDir:process.cwd(),loader:'js'},bundle:true,write:false,format:'iife',define:{'process.env.NODE_ENV':'"development"'}});
const html='<!doctype html><html lang="zh"><meta charset="utf-8"><title>正文与标签榜隔离验收</title><div id="root"></div><script src="/app.js"></script></html>';
createServer((req,res)=>{const js=req.url==='/app.js';res.setHeader('content-type',js?'application/javascript':'text/html; charset=utf-8');res.end(js?output.outputFiles[0].text:html);}).listen(0,'127.0.0.1',function(){console.log('Preview http://127.0.0.1:'+this.address().port);});
