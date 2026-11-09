// Real client registration + host outlet. No database, network API or storage writes.
const React = require('react'), h = React.createElement;
const {createRoot} = require('react-dom/client');
const Outlet = require('../packages/shell/client/view-outlet.cjs');
let addon;
window.__WB_HOST__ = {addons: [], registerAddon: a => addon = a};
require('../packages/addons/tasks/client/client.src.cjs');
window.calls = [];
window.todayMode = 'normal';
const api = {subscribe: () => () => {}, call: async (action, args = {}) => {
  window.calls.push({action, args});
  if (action === 'tasks.configGet') return {result: {values: {'stats.sections': ['trend'], 'stats.showKpi': false}}};
  if (action === 'tasks.activityCalendar') return {result: {year: args.year, days: [{date: args.year + '-01-01', done: 3, publish: 4, shutdown: 1}]}};
  if (action === 'tasks.statsReport') {
    const today = window.todayMode === 'legacy' ? undefined : window.todayMode === 'empty'
      ? {published: 0, done: 0, shutdown: 0, avgDifficultyDone: null, avgSample: 0, date: '2026-11-08'}
      : {published: 8, done: 3, shutdown: 0, avgDifficultyDone: 2.6666667, avgSample: 3, date: '2026-11-08'};
    return {result: {today, generatedAt: '2026-11-08T22:30:00Z', totals: {total: 8}, trend: []}};
  }
  throw new Error('Unexpected preview action: ' + action);
}};
function App() {
  const [lang, setLang] = React.useState('zh'), [mode, setMode] = React.useState('normal');
  const [dark, setDark] = React.useState(false), [narrow, setNarrow] = React.useState(false);
  React.useEffect(() => {document.body.style.background = dark ? '#181c22' : '#fafafa'; document.body.style.color = dark ? '#ecf0f5' : '#222'; const tokens = {'--dsw-alias-label-primary': dark ? '#ecf0f5' : '#1f2329', '--dsw-alias-label-tertiary': dark ? '#aeb5bf' : '#8f959e', '--dsw-alias-bg-layer-1': dark ? '#242a33' : '#fff', '--dsw-alias-border-l2': dark ? '#414956' : '#e5e6eb'}; Object.entries(tokens).forEach(([key,value]) => document.documentElement.style.setProperty(key,value));}, [dark]);
  function fixture(next) {window.todayMode = next; setMode(next);}
  return h(React.Fragment, null,
    h('nav', null, h('button', {onClick: () => setLang(lang === 'zh' ? 'en' : 'zh')}, '中 / EN'),
      h('button', {onClick: () => setDark(!dark)}, '深浅主题'), h('button', {onClick: () => setNarrow(!narrow)}, '窄屏'),
      h('button', {onClick: () => fixture('normal')}, '有样本'), h('button', {onClick: () => fixture('empty')}, '无样本'),
      h('button', {onClick: () => fixture('legacy')}, '旧后端')),
    h('main', {style: {width: narrow ? '375px' : '100%', maxWidth: '100%', marginTop: 20}},
      narrow ? h('iframe', {title: '375px viewport', src: '/?frame=1', style: {width: '375px', maxWidth: '100%', height: '850px', border: 0}}) : h(Outlet, {key: mode, view: addon.views.find(v => v.id === 'stats'), viewProps: {api, lang}})));
}
const style = document.createElement('style');
style.textContent = 'body{margin:20px;font:14px system-ui}nav{display:flex;gap:8px;flex-wrap:wrap}';
document.head.appendChild(style);
createRoot(document.getElementById('root')).render(h(App));
