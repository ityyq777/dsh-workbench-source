// Source-level UI integration: stable per-component hook frames, deterministic timers and API.
import assert from "node:assert/strict";
import { loadLucideReact } from "./storage-visual-test-runtime.mjs";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { runInNewContext } from "node:vm";
let active, dirty=false, effects=[], tree;
const frames=new Map(), listeners=new Set(), timers=new Map(), cache=new Map();
let timerId=0;
const React={
  createElement(type,props,...children){return {type,props:{...props,children},children};},
  useState(initial){ const f=active,i=f.i++; if(!(i in f.slots)) f.slots[i]=initial; return [f.slots[i],v=>{f.slots[i]=typeof v==='function'?v(f.slots[i]):v;dirty=true;}]; },
  useRef(initial){const f=active,i=f.i++;return f.slots[i] ||= {current:initial};},
  useEffect(fn,deps){const f=active,i=f.i++,old=f.slots[i];if(!old||deps.some((v,j)=>v!==old.deps[j]))effects.push(()=>{old?.cleanup?.();f.slots[i]={deps,cleanup:fn()};});}
};
const document={activeElement:null,addEventListener:(n,f)=>listeners.add(f),removeEventListener:(n,f)=>listeners.delete(f)};
function load(file){file=resolve(file);if(cache.has(file))return cache.get(file).exports;const module={exports:{}};cache.set(file,module);runInNewContext(readFileSync(file,'utf8'),{module,URL,document,
  setTimeout:fn=>{timers.set(++timerId,fn);return timerId;},clearTimeout:id=>timers.delete(id),
  require:n=>n==='react'?React:n==='lucide-react'?loadLucideReact(React):load(resolve(dirname(file),n))},{filename:file});return module.exports;}
const {Records}=load('packages/addons/storage/client/records.cjs');
let seen;
function expand(n,path='root'){
 if(Array.isArray(n))return n.map((v,i)=>expand(v,path+'/'+(v?.props?.key??i)));
 if(!n||typeof n!=='object')return n;
 if(typeof n.type==='function') {const key=path+':'+n.type.name;seen.add(key);const f=frames.get(key)||{slots:[],i:0};frames.set(key,f);f.i=0;active=f;return expand(n.type(n.props),key);}
 return {...n,children:expand(n.children,path)};
}
const calls=[];let rows=Array.from({length:13},(_,i)=>({id:'r'+i,name:'物品'+String(i).padStart(2,'0'),tags:[{id:'t',name:'标签'}]}));
let fail=false, hold=false, resolveBulk, holdList=false;const pendingLists=[];
const api={async call(name,args={}){
 calls.push({name,args:JSON.parse(JSON.stringify(args))});
 let result;
 if(name==='storage.configGet')result={values:{'list.pageSize':12,'ui.confirmDelete':false}};
 else if(name==='storage.capabilities')result={tags:true};
 else if(name==='storage.list') {const filtered=rows.filter(r=>r.name.includes(args.text||''));const pages=Math.max(1,Math.ceil(filtered.length/args.pageSize)),current=Math.min(args.pageNumber,pages);result={records:filtered.slice((current-1)*args.pageSize,current*args.pageSize),total:filtered.length,pages,current};}
 else if(name==='storage.bulkDelete') {if(hold)await new Promise(r=>resolveBulk=r);if(fail)return {ok:false,error:'injected deletion failure'};const ids=args.ids.filter(id=>rows.some(r=>r.id===id));rows=rows.filter(r=>!ids.includes(r.id));result={deleted:ids.length,skipped:args.ids.length-ids.length,ids};}
 else throw Error('Unexpected action '+name);
 if(name==='storage.list'&&holdList)return new Promise(resolve=>pendingLists.push(()=>resolve({ok:true,result})));
 return {ok:true,result};
}};
function render(){let guard=0;do{dirty=false;effects=[];seen=new Set();tree=expand(React.createElement(Records,{api,lang:'zh'}));for(const [k,f]of frames)if(!seen.has(k)){for(const slot of f.slots)slot?.cleanup?.();frames.delete(k);}for(const fn of effects)fn();}while(dirty&&++guard<30);assert.ok(guard<30);}
async function settle(){for(let i=0;i<12;i++){await Promise.resolve();if(dirty||!tree)render();}}
function all(n=tree,out=[]){if(Array.isArray(n)){n.forEach(v=>all(v,out));return out;}if(n&&typeof n==='object'){out.push(n);all(n.children,out);}return out;}
function text(n){return Array.isArray(n)?n.map(text).join(''):n&&typeof n==='object'?text(n.children):String(n??'');}
function button(label){const n=all().find(n=>n.type==='button'&&text(n)===label);assert.ok(n,'button '+label);return n;}
async function click(label){const n=button(label);assert.ok(!n.props.disabled,label+' enabled');n.props.onClick();await settle();}
const checks=()=>all().filter(n=>n.type==='input'&&n.props.type==='checkbox');
async function check(i,shift=false){checks()[i].props.onClick({stopPropagation(){},shiftKey:shift});await settle();}
const bulkCalls=()=>calls.filter(c=>c.name==='storage.bulkDelete');
function escapeEvent(){return {key:'Escape',defaultPrevented:false,stopped:false,
 preventDefault(){this.defaultPrevented=true;},stopPropagation(){this.stopped=true;}};}
async function modalEscape(){
 const event=escapeEvent();all().find(n=>n.props.role==='dialog').props.onKeyDown(event);
 // Model a synchronous React flush before the native document phase.
 await settle();assert.ok(event.defaultPrevented,'modal prevents Escape default');assert.ok(event.stopped,'modal stops Escape propagation');
 // Even if another dispatcher forwards it, the new document listener must respect cancellation.
 for(const fn of [...listeners])fn(event);await settle();return event;
}
await settle();assert.equal(checks().length,0);await click('选择');assert.equal(checks().length,12);assert.ok(button('删除').props.disabled);
await check(0);await check(2,true);assert.equal(checks().filter(n=>n.props.checked).length,3);
// Card-body capture changes selection and suppresses nested edit/image/tag behavior.
const card=all().find(n=>n.type==='article');let stopped=false;
card.props.onClickCapture({target:{},preventDefault(){},stopPropagation(){stopped=true;},shiftKey:false});await settle();assert.ok(stopped);assert.equal(checks().filter(n=>n.props.checked).length,2);
await click('删除');assert.ok(all().some(n=>n.props.role==='dialog'));await modalEscape();
assert.ok(!all().some(n=>n.props.role==='dialog'));assert.equal(checks().filter(n=>n.props.checked).length,2,'first Escape closes modal and preserves selection');assert.equal(bulkCalls().length,0);
for(const fn of [...listeners])fn(escapeEvent());await settle();assert.equal(checks().length,0,'second Escape exits selection');
await click('选择');await check(0);await check(2);await click('删除');await click('取消');assert.equal(bulkCalls().length,0);
await click('全选本页');await click('删除');const dialog=all().find(n=>n.props.role==='dialog');assert.equal(all(dialog).filter(n=>n.type==='li').length,10);assert.match(text(dialog),/共 12 条/);await click('取消');
await click('下一页');assert.equal(checks().length,1);assert.ok(button('删除').props.disabled);await check(0);await click('上一页');assert.equal(checks().filter(n=>n.props.checked).length,0);
await check(0);const search=all().find(n=>n.props.type==='search');search.props.onChange({target:{value:'物品01'}});render();assert.ok(button('删除').props.disabled);for(const fn of [...timers.values()])fn();timers.clear();await settle();assert.equal(checks().length,1);await check(0);
for(const fn of [...listeners])fn({key:'Escape'});await settle();assert.equal(checks().length,0);
await click('选择');await click('全选本页');await click('刷新');assert.ok(button('删除').props.disabled);
await click('全选本页');await click('删除');fail=true;await click('确认删除');assert.match(text(tree),/injected deletion failure/);assert.equal(checks().filter(n=>n.props.checked).length,1);
fail=false;hold=true;const confirm=button('确认删除');confirm.props.onClick();confirm.props.onClick();await settle();assert.equal(bulkCalls().length,2,'one failed attempt, one pending retry');assert.ok(button('删除中…').props.disabled);assert.ok(button('取消').props.disabled);
await modalEscape();assert.ok(all().some(n=>n.props.role==='dialog'),'busy Escape cannot close modal');assert.equal(checks().filter(n=>n.props.checked).length,1,'busy Escape preserves selection');assert.equal(bulkCalls().length,2);
resolveBulk();await settle();assert.equal(checks().length,0);assert.match(text(tree),/已删除 1 条，跳过 0/);assert.equal(rows.length,12);
// Race: old page response must not restore cards/selection after a newer filter response.
const searchAgain=()=>all().find(n=>n.props.type==='search');
async function searchFor(value){searchAgain().props.onChange({target:{value}});render();for(const fn of [...timers.values()])fn();timers.clear();await settle();}
holdList=true;await searchFor('物品');assert.equal(pendingLists.length,1);
holdList=false;await searchFor('物品02');await click('选择');await check(0);
pendingLists.shift()();await settle();assert.equal(checks().length,1);assert.equal(checks().filter(n=>n.props.checked).length,1);assert.match(checks()[0].props['aria-label'],/物品02/);
await searchFor('物品');assert.equal(checks().filter(n=>n.props.checked).length,0);
await check(0);await check(1);await check(2);await click('删除');
const snapshotNames=all(all().find(n=>n.props.role==='dialog')).filter(n=>n.type==='li').map(text);
const removedId=rows[0].id;rows=rows.filter(r=>r.id!==removedId);
// A background filter change does not replace the confirmation target snapshot.
await searchFor('物品12');assert.deepEqual(all(all().find(n=>n.props.role==='dialog')).filter(n=>n.type==='li').map(text),snapshotNames);
hold=false;await click('确认删除');assert.match(text(tree),/已删除 2 条，跳过 1/);assert.equal(bulkCalls().at(-1).args.ids.length,3);
console.log('PASS storage selection UI: enter/exit/Esc, range, card capture, disabled states, cancel, first ten, page-only, immediate search reset, refresh, failure/retry, duplicate submit');
