'use strict';
const C = require('./common.cjs');
const M = require('./compose-model.cjs');
const Editor = require('../views/compose.cjs').Editor;
module.exports = function ReplyTools(p) {
  const {React:R,h,api,message:m} = p;
  const accounts = C.useLoad(R,api,'mail.accountList',{},[]);
  const [mode,setMode] = R.useState(''), [sent,setSent] = R.useState(false);
  const rows = accounts.data && accounts.data.items || [];
  const owner = rows.some(a=>a.id===m.accountId);
  const initial = mode && M.initial(mode,m,p.body || '',rows);
  return h('section',null,h('div',{className:'wbml-actions'},['reply','replyAll','forward'].map(v=>h(C.Btn,{key:v,h,disabled:!owner||(v==='forward'&&!p.bodyReady),onClick:()=>{setSent(false);setMode(v);}},M.labels[v])),mode?h(C.Btn,{h,onClick:()=>setMode('')},'收起草稿'):null),
    h(C.Notice,{h,kind:'error',text:accounts.error}),h(C.Notice,{h,kind:'ok',text:sent?'已发送':''}),
    initial?h(Editor,Object.assign({},p,{key:initial.key,draftKey:initial.key,initial,accounts:rows,onSent:()=>{setMode('');setSent(true);}})):null);
};
