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
  useState(value) { const f=active,i=f.i++; if (!(i in f.slots)) f.slots[i]=typeof value==='function'?value():value; return [f.slots[i], v=>{ f.slots[i]=typeof v==='function'?v(f.slots[i]):v; dirty=true; }]; },
  useRef(value) { const f=active,i=f.i++; return f.slots[i] ||= { current:value }; },
  useEffect(fn,deps=[]) { const f=active,i=f.i++,old=f.slots[i]; if (!old || deps.some((v,j)=>v!==old.deps[j])) effects.push(()=>{old?.cleanup?.();f.slots[i]={deps,cleanup:fn()};}); }
};
const styles=[]; let addon;
const document={head:{appendChild:s=>styles.push(s.textContent)},getElementById:()=>null,
  createElement:()=>({setAttribute(){}}),addEventListener(){},removeEventListener(){},activeElement:null};
const context={module:{exports:{}},window:{__WB_HOST__:{registerAddon:a=>addon=a}},document,URL,
  require:n=>{assert.equal(n,'react');return React;},setTimeout:()=>1,clearTimeout(){},console};
const production = buildSync({ entryPoints: ['packages/addons/storage/client/client.src.cjs'], bundle: true, write: false,
  metafile: true, format: 'cjs', platform: 'browser', target: ['es2020'], external: ['react'], legalComments: 'none', logLevel: 'silent' });
const productionBytes = production.outputFiles[0].contents.length;
assert.ok(productionBytes < 250_000, 'storage entry must stay below 250KB unminified; got ' + productionBytes);
const iconInputs = Object.keys(production.metafile.inputs).filter(p => p.includes('/lucide-react/') && p.includes('/icons/'));
assert.ok(iconInputs.length > 0 && iconInputs.length <= 30, 'bundle only the selected glyphs and aliases, got ' + iconInputs.length);
runInNewContext(production.outputFiles[0].text, context);
console.log('Storage memory bundle:', productionBytes, 'bytes;', iconInputs.length, 'icon modules');
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
    name.endsWith('list')?{records:[item],total:24,pages:2}:{};
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
  if(v.id==='storage'){
    const button=label=>all().find(n=>n.type==='button'&&(text(n)===label||n.props['aria-label']===label));
    const latest=()=>calls.filter(c=>c.name==='storage.list').at(-1).args;
    const stock=cls('wbi-stock')[0].children.flat(Infinity).filter(Boolean);
    assert.equal(stock[0].type,'svg','stock starts with the actual SVG, not a number or unit');
    assert.match(stock[0].props.className,/lucide-package(?:\s|$)/,'use the package glyph, not a substitute icon');
    assert.ok(all(stock[0]).some(n=>n.type==='path'),'package SVG includes actual geometry');
    assert.deepEqual(stock.slice(1).map(text),['0','box'],'zero and unit follow the package glyph');
    assert.ok(button('New item').props.className.includes('wbi-primary'));
    button('Descending ↓').props.onClick();render();await settle();
    assert.equal(latest().sortOrder,'asc','sort button changes list request');
    button('Next').props.onClick();render();await settle();
    assert.equal(latest().pageNumber,2,'pager requests the next page');
    cls('wbi-chip').find(n=>n.type==='button').props.onClick();render();await settle();
    assert.equal(latest().tagIds[0],'tag','chip filters real request');
    assert.equal(latest().pageNumber,1,'filter resets pagination');
    button('Clear tag filter').props.onClick();render();await settle();
    assert.equal(latest().tagIds,undefined,'clear removes filter');
    button('Edit Test inventory').props.onClick();render();await settle();
    assert.ok(all().some(n=>n.props.role==='dialog'),'edit still opens editor');
  }
  root=v.icon;frames.clear();render();assert.equal(all().filter(n=>n.type==='svg').length,1,'tab icon renders');
}
assert.ok(calls.some(c=>c.name==='storage.dataTables'),'data adapter calls shared data API');
const css=styles.join(String.fromCharCode(10));
for(const token of ['--wb-radius-card','--wb-space-md','--wb-border','--wb-description-bg','--wb-motion:140ms'])assert.ok(css.includes(token),token);
assert.ok(css.includes("@container storage (max-width:480px)"));assert.match(css,/wbi-btn-label{display:none/);
assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/animation:none!important/);
assert.match(css,/wbi-icon-only{width:32px;height:32px/);
// Assert the loaded CSS contract, including selectors shared by all rendered button families.
const rule=selector=>[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(m=>m[1].trim().split(',').map(s=>s.trim()).includes(selector)).map(m=>m[2]).join(';');
assert.match(css,/--wb-btn-bg:transparent/);
assert.match(css,/--wb-btn-hover-bg:color-mix\(in oklab,currentColor 6%,transparent\)/);
assert.match(css,/--wb-btn-active-bg:color-mix\(in oklab,currentColor 11%,transparent\)/);
assert.match(css,/--wb-btn-size-sm:32px/);
assert.match(css,/--wb-btn-focus:2px solid var\(--dsw-alias-brand-primary,#2563eb\)/);
assert.match(css,/--wb-btn-focus-offset:2px/);
for(const selector of ['.wbi-btn','.wbi-image','.wbi-cfg-btn','.wbi-data :is(button)']){
  assert.match(rule(selector),/border:none/);
  assert.match(rule(selector),/background:var\(--wb-btn-bg\)/);
  assert.match(rule(selector+':enabled:hover'),/background:var\(--wb-btn-hover-bg\)/);
  assert.match(rule(selector+':enabled:active'),/background:var\(--wb-btn-active-bg\)/);
  assert.match(rule(selector+':focus-visible'),/outline:var\(--wb-btn-focus\);outline-offset:var\(--wb-btn-focus-offset\)/);
}
assert.match(rule('.wbi-btn.wbi-primary'),/color:var\(--dsw-alias-label-primary-inverted,#fff\)/);
assert.match(rule('.wbi-btn.wbi-primary:enabled:hover'),/var\(--wb-btn-primary-bg\)/);
assert.match(rule('.wbi-btn.wbi-danger:enabled:hover'),/color:var\(--wb-btn-danger-fg\)/);
assert.equal(rule('.wbi-danger'),'','danger does not color idle buttons red');
assert.doesNotMatch(rule('.wbi-chip'),/background:/,'chips use the same transparent base');
assert.match(rule('.wbi-stock'),/display:inline-flex;align-items:center;gap:5px/);
assert.equal(rule('.wbi-stock .wbi-svg'),'','stock spacing must not treat its icon as a separator');
assert.doesNotMatch(rule('.wbi-btn'),/border:1px solid/);
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
