/** 多关键词检索回归：内存 SQLite，只读断言，不碰生产库、不构建、不改 profile。 */
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { setup } from '../packages/addons/tasks/lib/index.js';
import { listTasks } from '../packages/addons/tasks/lib/task/read/task-query.js';
import { TASK_FILTER_SCHEMA } from '../packages/addons/tasks/lib/task/read/task-search-schema.js';

const db = new DatabaseSync(':memory:'), actions = new Map();
const api = { addon: { version: 'test' }, log() {}, hasDomain: () => false, action: (name, def) => actions.set(name, def) };
setup({ db, ...api });
const call = (name, args = {}) => actions.get(name).execute(args, { origin: 'agent' });
const ids = result => result.records.map(r => r.id).sort();
const day = '2026-07-01';

/** 让某条 SQL 在参数里出现标记词时报错，用来验证「单个关键词失败不拖垮其它分组」。 */
function boomOn(base, marker) {
  return new Proxy(base, {
    get(target, prop) {
      if (prop !== 'prepare') {
        const value = Reflect.get(target, prop);
        return typeof value === 'function' ? value.bind(target) : value;
      }
      return sql => {
        const stmt = target.prepare(sql);
        const guard = args => { if (args.some(v => String(v).includes(marker))) throw new Error('模拟单关键词查询失败'); };
        return {
          get: (...args) => { guard(args); return stmt.get(...args); },
          all: (...args) => { guard(args); return stmt.all(...args); },
        };
      };
    },
  });
}

try {
  db.exec("INSERT INTO task_node(id,name,type,parent_id,path,created_at,updated_at) VALUES('t1','T1','1','1','/1/t1/',0,0)");
  const insert = db.prepare(
    'INSERT INTO task(id,title,description,status,table_id,publish_date,target_date,priority,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)',
  );
  const add = (id, title, description = '', status = '0') => insert.run(id, title, description, status, 't1', day, '9999-12-31', 3, 0, 0);
  add('a1', '统计页热力图', '年度活动');
  add('a2', '热力图颜色', '四档强度');
  add('a3', '统计页折线', '趋势图');
  add('b1', '无关任务', 'nothing');
  add('b2', 'shared-word alpha', 'shared-word beta');
  const all = ['a1', 'a2', 'a3', 'b1', 'b2'];

  // 1) 字符串关键词：行为与旧版一致，且返回结构里没有 groups。
  assert.deepEqual(ids(call('tasks.list', { titleKey: '统计页', sort: 'created', pageSize: 200 })), ['a1', 'a3']);
  assert.deepEqual(ids(call('tasks.list', { titleKey: '  ', sort: 'created', pageSize: 200 })), all, '空白字符串等于不筛');
  const single = call('tasks.list', { titleKey: '热力图', sort: 'created', pageSize: 200 });
  assert.equal(single.groups, undefined, '单关键词不产生分组');
  assert.deepEqual(ids(single), ['a1', 'a2']);

  // 2) 数组关键词：分组顺序与输入一致，各组自带 records/total/filter。
  const multi = call('tasks.list', { titleKey: ['统计页', '热力图', '不存在的词'], statuses: [], sort: 'created', pageSize: 2 });
  assert.deepEqual(multi.keywords, ['统计页', '热力图', '不存在的词']);
  assert.equal(multi.groups.length, 3);
  assert.deepEqual(multi.groups.map(g => g.keyword), ['统计页', '热力图', '不存在的词']);
  assert.deepEqual(multi.groups[0].records.map(r => r.id).sort(), ['a1', 'a3']);
  assert.equal(multi.groups[0].total, 2);
  assert.equal(multi.groups[0].filter.titleKey, '统计页');
  assert.equal(multi.groups[0].filter.pageSize, 2, '分组保留各自分页元数据');
  assert.deepEqual(multi.groups[1].records.map(r => r.id).sort(), ['a1', 'a2']);
  assert.deepEqual(multi.groups[2].records, [], '零命中给空结果而不是报错');
  assert.equal(multi.groups[2].total, 0);
  assert.equal(multi.total, 4, 'top.total 是各分组 total 之和');
  assert.equal(multi.returned, 4);
  assert.deepEqual(multi.filter, { multiKeyword: true, keywords: ['统计页', '热力图', '不存在的词'], pageNumber: 1, pageSize: 2 });

  // 3) 同一任务命中多个词时出现在每个对应分组。
  const shared = call('tasks.list', { titleKey: ['alpha', 'beta'], statuses: [], pageSize: 200 });
  assert.deepEqual(shared.groups[0].records.map(r => r.id), ['b2']);
  assert.deepEqual(shared.groups[1].records.map(r => r.id), ['b2']);

  // 4) 分页在每组独立生效：pageSize=1 时第一组只回 1 条但 total 仍是 2。
  const paged = call('tasks.list', { titleKey: ['统计页', '热力图'], statuses: [], sort: 'created', pageNumber: 1, pageSize: 1 });
  assert.equal(paged.groups[0].returned, 1);
  assert.equal(paged.groups[0].total, 2);
  assert.equal(paged.groups[0].truncated, true);

  // 5) 参数校验：空数组、空白项、超限、重复都要在查询前报错。
  for (const bad of [[], [''], ['ok', '   '], [null, 'x'], Array.from({ length: 11 }, (_, i) => 'k' + i), ['dup', 'dup']]) {
    assert.throws(() => call('tasks.list', { titleKey: bad }), /titleKey/, JSON.stringify(bad).slice(0, 40));
  }
  assert.throws(() => call('tasks.export', { titleKey: ['统计页'] }), /只支持 tasks.list/, '导出不接受数组');
  assert.equal(call('tasks.export', { titleKey: '统计页', format: 'json' }).count, 2, '导出仍接受字符串');

  // 6) 单个关键词失败：该组带 failed/error，其余分组照常返回，notices 能定位是哪个词。
  const broken = listTasks(boomOn(db, '模拟失败词'), { titleKey: ['统计页', '模拟失败词'], statuses: [], pageSize: 200 }, api);
  assert.equal(broken.groups[0].keyword, '统计页');
  assert.equal(broken.groups[0].failed, undefined);
  assert.deepEqual(broken.groups[0].records.map(r => r.id).sort(), ['a1', 'a3']);
  assert.equal(broken.groups[1].keyword, '模拟失败词');
  assert.equal(broken.groups[1].failed, true);
  assert.deepEqual(broken.groups[1].records, []);
  assert.match(broken.groups[1].error, /模拟单关键词查询失败/);
  assert.equal(broken.notices.length, 1);
  assert.equal(broken.notices[0].code, 'keyword_failed');
  assert.equal(broken.notices[0].keyword, '模拟失败词');

  // 7) schema 契约：titleKey 同时接受 string 与 array。
  assert.deepEqual(TASK_FILTER_SCHEMA.titleKey.type, ['string', 'array']);
  assert.equal(TASK_FILTER_SCHEMA.titleKey.items.type, 'string');
  assert.match(TASK_FILTER_SCHEMA.titleKey.description, /最多 10 个/);
  assert.match(TASK_FILTER_SCHEMA.titleKey.description, /tasks\.export/);
} finally {
  db.close();
}
console.log('TASK MULTI KEYWORD PASS: 字符串口径不变、数组按输入顺序分组、跨词重复命中、零命中、每组独立分页、空/空白/超限/重复校验、导出拒绝数组、单关键词失败隔离与 keyword_failed 定位');
