/** Shared picker contract + actual React markup. Browser entry: ownership-ui-preview.mjs. */
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url), factory=require('../packages/addons/tasks/client/modals/table-picker.cjs');
const tree=[{id:'root',name:'Root',type:'2',children:[{id:'group',name:'Platform',type:'0',children:[{id:'a',name:'Storage',type:'1',description:'职责'.repeat(110)},{id:'b',name:'Tasks',type:'1'}]},{id:'empty',name:'空组',type:'0'},{id:'deleted',name:'Deleted',type:'0',deleted_at:1,children:[{id:'gone',name:'Gone',type:'1'}]}]}];
assert.deepEqual(factory.visible(tree,'root / PLATFORM / TASKS').map(x=>x.id),['b']);
assert.deepEqual(factory.visible(tree,'STORAGE').map(x=>x.id),['a']);
assert.equal(factory.visible(tree,'','b')[0].id,'b');
assert.equal(factory.rows(tree).some(x=>x.id==='gone'),false);
assert.equal(factory.rows(tree).find(x=>x.id==='a').depth,2);
const Picker=factory(React),html=renderToStaticMarkup(React.createElement(Picker,{tree,value:'a',recommended:'b'}));
assert.equal((html.match(/role="option"/g)||[]).length,2);
assert.ok(html.includes('role="listbox"')&&html.includes('aria-activedescendant='));
assert.ok(html.includes('aria-label="Storage，Root / Platform"'));
assert.ok(html.includes('当前上下文建议')&&html.includes('职责'.repeat(110)));
assert.ok(html.includes('目标任务表：Root / Platform / Storage'));
assert.equal((html.match(/aria-selected="true"/g)||[]).length,1);
let state=[],cursor=0,selected='',closed=0;
const Mock={createElement:(type,props,...children)=>({type,props:props||{},children:children.flat(Infinity)}),Fragment:'fragment',
 useState:value=>{const i=cursor++;if(!(i in state))state[i]=value;return [state[i],v=>state[i]=v];},
 useRef:()=>({current:null}),useId:()=> 'picker',useEffect:()=>{}};
const TestPicker=factory(Mock),props={tree,value:'',recommended:'b',onChange:id=>selected=id,onClose:()=>closed++};
const render=()=>{cursor=0;return TestPicker(props);};
const all=n=>n&&typeof n==='object'?[n,...n.children.flatMap(all)]:[];
let node=render();
assert.equal(all(node).filter(n=>n.props.role==='presentation').some(n=>n.props.onClick),false);
const key=k=>{let prevented=false,stopped=false;render().props.onKeyDown({key:k,preventDefault:()=>prevented=true,stopPropagation:()=>stopped=true});assert.ok(prevented&&stopped);};
key('Enter');assert.equal(selected,'b');key('ArrowDown');key('Enter');assert.equal(selected,'a');key('ArrowUp');key('Enter');assert.equal(selected,'b');key('Escape');assert.equal(closed,1);
all(render()).find(n=>n.type==='input').props.onChange({target:{value:'NO MATCH'}});
assert.equal(all(render()).filter(n=>n.props.role==='option').length,0);
assert.equal(all(render()).find(n=>n.props.role==='listbox').props['aria-activedescendant'],undefined);
console.log('TASK TABLE PICKER PASS: paths, search, recommendation, deleted groups, real React ARIA, long description, single selection, keyboard, empty results');
