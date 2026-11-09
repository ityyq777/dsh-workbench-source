import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {renderToStaticMarkup} from 'react-dom/server';
const require=createRequire(import.meta.url), ranking=require('../packages/addons/tasks/client/item/ranking-name.cjs');
for(const lang of ['zh','en']) for(const kind of ['table','group']) {
 let nav; const col=ranking({colName:'Name'},lang,(...args)=>nav=args,kind);
 const button=col.render({id:'123',groupId:'456',title:'Example'});
 assert.equal(button.type,'button');assert.equal(button.props.type,'button');
 assert.equal(button.props['aria-label'],(lang==='en'?(kind==='table'?'Open task table: ':'Open task group: '):(kind==='table'?'打开任务表：':'打开任务组：'))+'Example');
 button.props.onClick();assert.deepEqual(nav,['tasks',kind==='table'?{tableId:'123',groupId:'456',allTableTasks:true}:{groupId:'123',tableId:null}]);
 for(const id of ['__missing__','__ungrouped__',null]) {const html=renderToStaticMarkup(col.render({id,title:'Missing'}));assert.ok(!html.includes('<button'));assert.match(html,/title=/);}
 assert.equal(ranking({colName:'Name'},lang,null,kind).render({id:'1',title:'Example'}),'Example');
}
// Exercise actual list state, including navigation into an already mounted view.
let state=[],cursor=0,effects=[];
const memo=(fn,deps)=>{const i=cursor++,old=state[i];if(!old||deps.some((v,j)=>v!==old.deps[j]))state[i]={value:fn(),deps};return state[i].value;};
const R={createElement:(type,props,...children)=>({type,props:props||{},children}),useState:v=>{const i=cursor++;if(!(i in state))state[i]=v;return[state[i],v=>state[i]=typeof v==='function'?v(state[i]):v];},useId:()=>"ranking-test",useRef:v=>{const i=cursor++;return state[i]||={current:v};},useMemo:memo,useCallback:(fn,d)=>memo(()=>fn,d),useEffect:(fn,d)=>memo(()=>{effects.push(fn);},d)};
const noop=()=>null,calls=[];
const api={subscribe:()=>noop,call:async(action,args)=>{calls.push({action,args});return {ok:true,result:action==='tasks.list'?{records:[],total:0}:[]};}};
const View=require('../packages/addons/tasks/client/views/tasks-view.cjs')({React:R,configView:{useConfig:()=>({ready:true,values:{'ui.defaultTab':0,'list.sort':'difficulty','list.filterRestarted':true}})},COPY:require('../packages/addons/tasks/client/ui/copy.cjs'),allTables:()=>[],treeWalk:()=>[],treeFlat:()=>[],cx:(...x)=>x.join(' '),injectCss:noop,Icon:noop,PathCrumbs:noop,TagFilter:noop});
async function render(viewParams){for(let pass=0;pass<3;pass++){cursor=0;const out=View({lang:'en',viewParams,api});out.type(out.props);effects.splice(0).forEach(f=>f());for(let i=0;i<12;i++)await Promise.resolve();}return calls.filter(c=>c.action==='tasks.list').at(-1).args;}
let args=await render({groupId:'group-1',tableId:null});
assert.equal(args.groupId,'group-1');assert.equal(args.tableId,null);assert.deepEqual(args.statuses,[]);assert.equal(args.sort,undefined);
args=await render({tableId:'table-2',groupId:null,allTableTasks:true});
assert.equal(args.tableId,'table-2');assert.equal(args.groupId,null);assert.equal(args.pageNumber,1);assert.deepEqual(args.statuses,[]);
args=await render({groupId:'group-3',tableId:null});
assert.equal(args.groupId,'group-3');assert.equal(args.tableId,null);assert.deepEqual(args.tagIds,[]);assert.equal(args.titleKey,'');assert.equal(args.difficultyMissing,false);
console.log('RANKING UI PASS: bilingual native buttons, unavailable nodes, group/table navigation and mounted-view changes');
