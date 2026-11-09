import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { DatabaseSync } from 'node:sqlite';
import { ensureSchema } from '../packages/addons/tasks/lib/db/db.js';
import { statsReport } from '../packages/addons/tasks/lib/stats/stats.js';

const db = new DatabaseSync(':memory:');
try {
  ensureSchema(db, () => {});
  const insert = db.prepare("INSERT INTO task(id,title,table_id,status,publish_date,target_date,created_at,updated_at,deleted_at) VALUES(?,?,?,?,'2026-11-09','2026-11-09',?,?,?)");
  for (const [id,status,deleted] of [['a','0',null],['b','2',null],['c','2',null],['r','3',null],['deleted','1',1]]) insert.run(id,id,'fixture',status,1,1,deleted);
  const before = db.prepare('SELECT total_changes() n').get().n;
  const report = statsReport(db, { range: 'all' });
  assert.deepEqual(report.breakdowns.status.map(s => [s.key,s.count]), [['0',1],['1',0],['2',2]]);
  assert.equal(report.totals.restarted,1);
  assert.equal(report.totals.total,4,'other KPI totals retain their existing meaning');
  assert.equal(db.prepare('SELECT total_changes() n').get().n,before);
} finally { db.close(); }

let fixture, hook;
const React = {
  createElement: (type,props,...children) => ({type,props:props||{},key:props?.key,children:children.flat(Infinity)}),
  useMemo: fn => fn(), useCallback: fn => fn, useEffect: () => {}, useRef: value => ({current:value}),
  useState: value => [++hook === 2 ? fixture : value, () => {}],
};
function load(path, dependencies) {
  const module = {exports:{}};
  vm.runInNewContext(readFileSync(new URL(path,import.meta.url),'utf8'), {module,require: name => {assert(name in dependencies,name);return dependencies[name];},Intl,Date,console});
  return module.exports;
}
const charts = load('../packages/addons/tasks/client/stats/charts.cjs', {react:React});
const view = load('../packages/addons/tasks/client/views/stats.cjs', {
  react:React, '../stats/charts.cjs':charts, './config.cjs':{useConfig:()=>({ready:true,values:{}})},
  '../item/recent-columns.cjs':()=>[], '../item/ranking-name.cjs':()=>({key:'title'}), '../stats/heatmap.cjs':()=>null, '../stats/today.cjs':()=>null,
});
function nodes(node) { return node && typeof node==='object' ? [node,...(node.children||[]).flatMap(nodes)] : []; }
for (const lang of ['zh','en']) for (const counts of [[0,2,3],[2,0,3],[0,0,0]]) {
  // Shuffled legacy payload proves colors follow keys, and restarted never leaks into the chart.
  fixture={totals:{total:99,restarted:94},breakdowns:{status:['2','3','0','1'].map(key=>({key,label:'legacy-'+key,count:key==='3'?94:counts[Number(key)]}))}};
  hook=0;
  const outer=view.TasksStatsView({lang,api:{}});
  const body=outer.type(outer.props);
  const card=nodes(body).find(n=>n.key==='status');
  assert(card);
  const donut=card.children[0];
  const total=counts.reduce((a,b)=>a+b,0);
  assert.equal(donut.props.total,total);
  assert.equal(donut.props.data.length,3);
  assert(!donut.props.data.some(s=>s.key==='3'));
  assert(donut.props.aria.includes((lang==='en'?'Tasks':'总任务')+' '+total));
  assert(!/legacy|Restarted|已重启/.test(donut.props.aria));
  const rendered=nodes(donut.type(donut.props));
  const segments=rendered.filter(n=>n.type==='circle'&&n.props.strokeDasharray);
  const dots=rendered.filter(n=>n.props.className==='wbt-dot');
  assert.equal(dots.length,3,'zero values retain their legend');
  assert.equal(segments.length,counts.filter(Boolean).length,'zero values consume no arc');
  for(const d of donut.props.data) {
    const token={'0':'business','1':'error','2':'success'}[d.key];
    assert(d.color.includes('--dsw-alias-state-'+token+'-primary'));
    const segment=segments.find(n=>n.key===d.key);
    if(d.count) assert.equal(segment.props.stroke,d.color);
    assert(dots.some(n=>n.props.style.background===d.color));
  }
  if(total) assert(Math.abs(segments.reduce((sum,n)=>sum+Number(n.props.strokeDasharray.split(' ')[0]),0)-2*Math.PI*68)<1e-8);
}
console.log('STATUS CHART PASS: read-only three-state backend, preserved KPI counts, reordered/legacy data, zero legends, full circle, semantic colors and bilingual accessible totals');
