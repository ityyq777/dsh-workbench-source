'use strict';
const C = require('../ui/common.cjs');
const M = require('../ui/compose-model.cjs');
const writes = new Map();
function queued(key, operation) {
  const prev = writes.get(key) || Promise.resolve();
  const next = prev.catch(() => {}).then(operation);
  writes.set(key, next);
  next.finally(() => { if (writes.get(key) === next) writes.delete(key); }).catch(() => {});
  return next;
}
function Editor(p) {
  const { h, React:R, api, draftKey:key, accounts } = p;
  const [value, setValue] = R.useState(null), [notice, setNotice] = R.useState('');
  const [busy, setBusy] = R.useState(false), [status, setStatus] = R.useState('');
  const latest = R.useRef(null), pending = R.useRef(null), timer = R.useRef(null), revision = R.useRef(0), locked = R.useRef(false), alive = R.useRef(false);
  function flush() {
    clearTimeout(timer.current);
    const draft = pending.current;
    if (!draft) return writes.get(key) || Promise.resolve();
    pending.current = null;
    const rev = revision.current;
    return queued(key, () => C.call(api,'mail.draftSave',draft)).then(() => {
      if (alive.current && revision.current === rev) setStatus('草稿已保存');
    }, e => {
      if (revision.current === rev) { pending.current = draft; if (alive.current) setStatus('草稿未保存：' + C.errText(e)); }
      throw e;
    });
  }
  R.useEffect(() => {
    let current = true; alive.current = true;
    (writes.get(key) || Promise.resolve()).catch(() => {}).then(() => C.call(api,'mail.draftGet',{key})).then(r => {
      if (!current) return;
      latest.current = r.draft || p.initial;
      setValue(latest.current);
      if (!latest.current) setNotice('草稿已不存在');
    }).catch(e => { if (current) setNotice('草稿读取失败：' + C.errText(e)); });
    const onHide = () => { flush().catch(() => {}); };
    if (typeof window !== 'undefined') window.addEventListener('pagehide',onHide);
    return () => { current = false; alive.current = false; if (typeof window !== 'undefined') window.removeEventListener('pagehide',onHide); onHide(); };
  }, [key]);
  function change(field, v) {
    if (locked.current) return;
    const next = Object.assign({},latest.current,{[field]:v});
    latest.current = next; pending.current = next; revision.current++; setValue(next); setStatus('正在保存草稿…');
    clearTimeout(timer.current); timer.current = setTimeout(() => flush().catch(() => {}),350);
  }
  async function send() {
    if (locked.current) return;
    let sent = false;
    locked.current = true; setBusy(true); setNotice('');
    try {
      const d = latest.current; const seen = new Set();
      const to = M.unique(M.addresses(d.to,true),seen), cc = M.unique(M.addresses(d.cc,true),seen);
      if (!d.accountId || !to.length) throw new Error('请选择账户并填写收件人');
      await flush();
      await C.call(api,'mail.messageSend',{accountId:d.accountId,to,cc,subject:d.subject,text:d.text,mode:d.mode,originId:d.originId});
      sent = true;
      await queued(key,() => C.call(api,'mail.draftDelete',{key}));
      p.onSent();
    } catch (e) { if (alive.current) setNotice((sent ? '邮件已发送，但未能清理草稿，请勿重发：' : '') + C.errText(e)); }
    finally { if (!sent) {locked.current=false; if (alive.current) setBusy(false);} }
  }
  const field = (name,label,area) => h(C.Field,{h,label},h(area?'textarea':'input',{className:'wbml-input',value:value[name],rows:area?8:undefined,disabled:busy,onChange:e=>change(name,e.target.value)}));
  if (!value) return h('p',{role:'status'},notice || '正在读取草稿…');
  return h('div',{className:'wbml-card'},h('strong',null,M.labels[value.mode]),
    h(C.Field,{h,label:'发件账户'},h('select',{className:'wbml-input',value:value.accountId,disabled:busy||value.mode!=='new',onChange:e=>change('accountId',e.target.value)},h('option',{value:''},'请选择'),accounts.map(a=>h('option',{key:a.id,value:a.id},a.name+' <'+a.email+'>')))),
    field('to','收件人'),field('cc','抄送'),field('subject','主题'),field('text','正文',true),
    h(C.Notice,{h,kind:'error',text:notice}),h('div',{className:'wbml-actions'},h(C.Btn,{h,kind:'primary',disabled:busy,onClick:send},busy?'处理中…':'发送'),
    h(C.Btn,{h,disabled:busy||!pending.current,onClick:()=>flush().catch(()=>{})},'保存草稿'),h('span',{role:'status'},status)));
}
function Compose(p) {
  const {h,React:R,api} = p;
  const accounts = C.useLoad(R,api,'mail.accountList',{},[]), drafts = C.useLoad(R,api,'mail.draftList',{},[]);
  const [key,setKey] = R.useState('new'), [reset,setReset] = R.useState(0), [message,setMessage] = R.useState('');
  return h('div',{className:'wbml-page'},h('h2',null,'写信'),h(C.Notice,{h,kind:'ok',text:message}),h(C.Notice,{h,kind:'error',text:accounts.error||drafts.error}),
    h(C.Field,{h,label:'本地草稿'},h('select',{className:'wbml-input',value:key,onChange:e=>{setKey(e.target.value);setMessage('');}},h('option',{value:'new'},'新邮件草稿'),((drafts.data&&drafts.data.items)||[]).filter(d=>d.key!=='new').map(d=>h('option',{key:d.key,value:d.key},M.labels[d.mode]+' · '+(d.subject||'(无主题)'))))),
    h(Editor,Object.assign({},p,{key:key+':'+reset,draftKey:key,initial:key==='new'?M.initial():null,accounts:(accounts.data&&accounts.data.items)||[],onSent:()=>{setMessage('已发送');setKey('new');setReset(n=>n+1);drafts.refresh();}})));
}
module.exports = Compose;
module.exports.Editor = Editor;
