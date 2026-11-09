/** Delayed config requests: real component, retained hooks, no production persistence. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const storage = new Map();
globalThis.window = Object.assign(new EventTarget(), { localStorage: { getItem: k => storage.get(k), setItem: (k,v) => storage.set(k,v) }, confirm: () => true });
const pref = require('../packages/addons/lib/body-mode.cjs');
let slots = [], cursor = 0, effects = [], cleanups = [];
const React = {
  createElement(type, props, ...children) { return {type,props:props||{},children:children.flat(Infinity).filter(v=>v!=null)}; },
  useState(initial) { const i=cursor++; if(!(i in slots))slots[i]=initial;return [slots[i],v=>slots[i]=typeof v==='function'?v(slots[i]):v]; },
  useRef(value) { const i=cursor++;return slots[i] ||= {current:value}; },
  useCallback(fn,deps) { const i=cursor++,old=slots[i];if(!old||deps.some((v,j)=>v!==old.deps[j]))slots[i]={fn,deps};return slots[i].fn; },
  useEffect(fn,deps) { const i=cursor++,old=slots[i];if(!old||deps.some((v,j)=>v!==old.deps[j])){slots[i]={deps};effects.push(fn);} },
};
const module={exports:{}};
runInNewContext(readFileSync('packages/addons/tasks/client/config.cjs','utf8'),{module,window,require:n=>n==='react'?React:pref});
const Config=module.exports.ConfigView;
const walk=n=>Array.isArray(n)?n.flatMap(walk):n&&typeof n==='object'?[n,...walk(n.children)]:[];
const text=n=>Array.isArray(n)?n.map(text).join(''):n&&typeof n==='object'?text(n.children):String(n??'');
let server='markdown', calls=[], queue=[];
const snapshot=()=>({values:{'ui.bodyMode':server},overrides:{'ui.bodyMode':server},items:[{id:'ui.bodyMode',group:'ui',type:'enum',zh:'模式',en:'Mode',options:[{value:'markdown'},{value:'text'}]}],groups:[{id:'ui',en:'UI'}]});
const api={call(name,args){calls.push({name,args});return new Promise((resolve,reject)=>queue.push({name,args,resolve,reject}));}};
const render=()=>{cursor=0;const tree=Config({api,lang:'en'});const jobs=effects;effects=[];jobs.forEach(fn=>{const cleanup=fn();if(cleanup)cleanups.push(cleanup);});return tree;};
const settle=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
const complete=async()=>{const job=queue.shift();assert.ok(job);if(job.name.endsWith('configSet'))server=job.args.values['ui.bodyMode'];if(job.name.endsWith('configReset'))server='markdown';job.resolve({ok:true,result:job.name.endsWith('configGet')?snapshot():{state:snapshot()}});await settle();};
const select=tree=>walk(tree).find(n=>n.type==='select');
const buttons=tree=>walk(tree).filter(n=>n.type==='button');
render();await settle();await complete();let tree=render();
const staleSelect=select(tree), staleReset=buttons(tree).find(n=>n.props.title), staleResetAll=buttons(tree).find(n=>!n.props.title);
// Simulate text then Markdown before React renders and a reset attempting to overtake them.
staleSelect.props.onChange({target:{value:'text'}});staleSelect.props.onChange({target:{value:'markdown'}});staleReset.props.onClick();staleResetAll.props.onClick();
await settle();assert.equal(queue.length,1,'only first request reaches server; no later response can overtake it');
assert.equal(queue[0].args.values['ui.bodyMode'],'text');tree=render();assert.equal(select(tree).props.disabled,true);assert.ok(buttons(tree).every(n=>n.props.disabled));
await complete();tree=render();assert.equal(server,'text');assert.equal(select(tree).props.value,'text');assert.equal(pref.get(),'text');assert.equal(select(tree).props.disabled,false);
// Once unlocked, a later choice persists and becomes the global value.
select(tree).props.onChange({target:{value:'markdown'}});await settle();await complete();tree=render();assert.equal(server,'markdown');assert.equal(pref.get(),'markdown');
select(tree).props.onChange({target:{value:'text'}});await settle();await complete();tree=render();
const beforeReset=select(tree);buttons(tree).find(n=>n.props.title).props.onClick();beforeReset.props.onChange({target:{value:'text'}});buttons(tree).find(n=>!n.props.title).props.onClick();
await settle();assert.equal(queue.length,1);assert.ok(queue[0].name.endsWith('configReset'));assert.equal(queue[0].args.ids[0],'ui.bodyMode');assert.equal(select(render()).props.disabled,true);
await complete();tree=render();assert.equal(server,'markdown');assert.equal(pref.get(),'markdown');
buttons(tree).find(n=>!n.props.title).props.onClick();beforeReset.props.onChange({target:{value:'text'}});await settle();assert.equal(queue.length,1);assert.equal(queue[0].args.ids,undefined);await complete();tree=render();
// Failed writes release the lock and restore the last confirmed value.
select(tree).props.onChange({target:{value:'text'}});await settle();queue.shift().reject(new Error('offline'));await settle();tree=render();assert.equal(select(tree).props.disabled,false);assert.equal(select(tree).props.value,'markdown');assert.equal(pref.get(),'markdown');assert.ok(text(tree).includes('offline'));
select(tree).props.onChange({target:{value:'text'}});await settle();await complete();tree=render();assert.equal(server,'text');assert.equal(pref.get(),'text');
// Synchronous API failure also releases the lock.
const originalCall=api.call;api.call=()=>{throw new Error('sync failure');};select(tree).props.onChange({target:{value:'markdown'}});await settle();tree=render();assert.equal(select(tree).props.disabled,false);assert.ok(text(tree).includes('sync failure'));api.call=originalCall;
// An unmounted view may finish its server write but must not broadcast over a new view.
select(tree).props.onChange({target:{value:'markdown'}});await settle();cleanups.forEach(fn=>fn());pref.set('text');await complete();assert.equal(pref.get(),'text','unmounted response cannot replace current global preference');
// Toolbar has the same synchronous guard, including two old handlers in one render.
slots=[];effects=[];const Control=require('../packages/addons/tasks/client/body-mode.cjs')(React);cursor=0;
const ctl=Control({api,t:require('../packages/addons/tasks/client/copy.cjs').en});effects.forEach(fn=>fn());effects=[];
const toggles=walk(ctl).filter(n=>n.type==='button');toggles[0].props.onClick();toggles[1].props.onClick();await settle();assert.equal(queue.length,1);assert.equal(queue[0].args.values['ui.bodyMode'],'markdown');await complete();
cursor=0;let toolbar=Control({api:{call(){throw new Error('sync toolbar');}},t:require('../packages/addons/tasks/client/copy.cjs').en});walk(toolbar).filter(n=>n.type==='button')[1].props.onClick();await settle();cursor=0;toolbar=Control({api,t:require('../packages/addons/tasks/client/copy.cjs').en});assert.ok(walk(toolbar).filter(n=>n.type==='button').every(n=>!n.props.disabled),'toolbar unlocks after synchronous API exception');
delete globalThis.window;
console.log('TASK CONFIG UI PASS: delayed writes, stale toggle/reset handlers, disabled controls, persistence ordering, failure recovery, toolbar guard');
