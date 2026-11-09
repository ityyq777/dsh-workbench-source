// In-memory production entry bundle + component behavior. Never writes generated files or real DBs.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildSync } from "esbuild";
import { runInNewContext } from "node:vm";
const bundle = entry => buildSync({ entryPoints: [entry], bundle: true, write: false,
  format: "cjs", platform: "browser", external: ["react"], logLevel: "silent" }).outputFiles[0].text;
let active, dirty, effects, tree, root, props;
const frames = new Map();
const React = {
  createElement(type, p, ...children) { return { type, props: { ...p, children }, children }; },
  Fragment: "fragment", forwardRef: fn => p => fn(p, null),
  createContext: value => ({ value }), useContext: c => c.value,
  useMemo(fn,deps=[]) { const f=active,i=f.i++,old=f.slots[i]; if(!old||deps.some((v,j)=>v!==old.deps[j])) f.slots[i]={deps,value:fn()}; return f.slots[i].value; },
  useCallback(fn,deps) { return React.useMemo(()=>fn,deps); },
  useState(value) { const f=active,i=f.i++; if (!(i in f.slots)) f.slots[i]=value; return [f.slots[i], v=>{ f.slots[i]=typeof v==='function'?v(f.slots[i]):v; dirty=true; }]; },
  useRef(value) { const f=active,i=f.i++; return f.slots[i] ||= { current:value }; },
  useEffect(fn,deps=[]) { const f=active,i=f.i++,old=f.slots[i]; if (!old || deps.some((v,j)=>v!==old.deps[j])) effects.push(()=>{old?.cleanup?.();f.slots[i]={deps,cleanup:fn()};}); }
};
const styles=[]; let addon;
const document={head:{appendChild:s=>styles.push(s.textContent)},getElementById:()=>null,
  createElement:()=>({setAttribute(){}}),addEventListener(){},removeEventListener(){},activeElement:null};
const context={module:{exports:{}},window:{__WB_HOST__:{registerAddon:a=>addon=a}},document,URL,
  require:n=>{assert.equal(n,'react');return React;},setTimeout:()=>1,clearTimeout(){},console};
runInNewContext(bundle('packages/addons/storage/client/client.src.cjs'), context);
function expand(n,path='r') {
  if(Array.isArray(n))return n.map((v,i)=>expand(v,path+'/'+(v?.props?.key??i)));
  if(!n||typeof n!=='object')return n;
  if(typeof n.type==='function'){const key=path+':'+n.type.name;active=frames.get(key)||{slots:[],i:0};frames.set(key,active);active.i=0;return expand(n.type(n.props),key);}
  return {...n,children:expand(n.children,path)};
}
function render(){let guard=0;do{dirty=false;effects=[];tree=expand(React.createElement(root,props));for(const e of effects)e();}while(dirty&&++guard<30);assert.ok(guard<30);}
async function settle(){for(let i=0;i<20;i++){await Promise.resolve();if(dirty)render();}}
function all(n=tree,out=[]){if(Array.isArray(n))n.forEach(v=>all(v,out));else if(n&&typeof n==='object'){out.push(n);all(n.children,out);}return out;}
function text(n){return Array.isArray(n)?n.map(text).join(''):n&&typeof n==='object'?text(n.children):String(n??'');}
const cls=c=>all().filter(n=>(n.props.className||'').split(' ').includes(c));
const calls=[];
const item={id:'one',name:'Test inventory',stock:'0',brand:'Maker',unit:'box',tags:[{id:'tag',name:'Tag'}],imgList:['https://example.test/a.png','https://example.test/b.png']};
const api={async call(name,args){calls.push({name,args});const values={};
  const result=name.endsWith('configGet')?{values,items:[{id:'list.pageSize',group:'list',type:'number',zh:'分页',en:'Page size',default:12}],groups:[{id:'list',zh:'列表',en:'List'}],overrides:{}}:
    name.endsWith('capabilities')?{tags:true}:name.endsWith('stats')?{total:1,tagged:1,withImages:1,recent:[item]}:
    name.endsWith('dataTables')?{tables:[{name:'storage',count:1,columns:[{name:'name',type:'TEXT'}]}]}:
    name.endsWith('dataList')?{rows:[item],total:1,columns:[{name:'name',type:'TEXT'}]}:
    name.endsWith('list')?{records:[item],total:1,pages:1}:{};
  return {ok:true,result};}};
assert.deepEqual(Array.from(addon.views,v=>v.id),['stats','storage','config','data']);
for(const v of addon.views){
  frames.clear();root=v.component;props={api,lang:'en'};render();
  assert.equal(cls('wbi-skeleton-card').length,3,v.id+' initial loading has three cards');
  await settle();
  const icons=all().filter(n=>n.type==='svg');assert.ok(icons.length>=3,v.id+' has at least three actual SVG icons');
  for(const svg of icons){assert.ok([11,14,16,48].includes(Number(svg.props.width)));assert.equal(svg.props.strokeWidth,2);assert.equal(svg.props['aria-hidden'],true);}
  for(const n of all().filter(n=>n.type==='button'&&(n.props.className||'').includes('wbi-icon'))){
    assert.ok(n.props['aria-label'],v.id+' labeled action');assert.ok(n.props.title,v.id+' titled action');
    if(n.props.className.includes('wbi-icon-only'))assert.equal(text(n),'');
  }
  const refresh=all().find(n=>n.type==="button"&&text(n)==="Refresh");
  assert.ok(refresh,v.id+" refresh control"); const before=calls.length; refresh.props.onClick(); await settle();
  assert.ok(calls.length>before,v.id+" refresh invokes real component callback");
  root=v.icon;frames.clear();render();assert.equal(all().filter(n=>n.type==='svg').length,1,'tab icon renders');
}
assert.ok(calls.some(c=>c.name==='storage.dataTables'),'data adapter calls shared data API');
const css=styles.join(String.fromCharCode(10));
for(const token of ['--wb-radius-card','--wb-space-md','--wb-border','--wb-description-bg','--wb-motion:140ms'])assert.ok(css.includes(token),token);
assert.ok(css.includes("@container storage (max-width:480px)"));assert.match(css,/wbi-btn-label{display:none/);
assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/animation:none!important/);
assert.match(css,/wbi-icon-only{width:32px;height:32px/);
// Run the established gallery/selection regression scenarios against real bundled lucide.
const lucideCode=bundle('packages/addons/storage/client/icons.cjs');
const iconModule={exports:{}};runInNewContext(lucideCode,{module:iconModule,require:()=>React});
for(const [name,size,expected] of [["box",48,14],["box",99,14],["empty",48,48],["tag",11,11]]){
  root=iconModule.exports.Icon;props={name,size};frames.clear();render();
  assert.equal(Number(all().find(n=>n.type==="svg").props.width),expected,"only empty states allow 48px");
}
assert.ok(readFileSync("packages/addons/tasks/client/styles.cjs","utf8").includes("visual-tokens.cjs"));
await import("./test-storage-cards.mjs");
await import("./test-storage-selection.mjs");
console.log('PASS storage visual: real bundle/SVG, four views and tabs, labels, tokens, skeletons, gallery and selection regressions');
