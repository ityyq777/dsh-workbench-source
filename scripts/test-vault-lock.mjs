/** 保险箱未解锁守卫回归：内存库 + vm 沙箱渲染，不接触生产库、不构建、不改 profile。 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDomain } from '../packages/addons/vault/lib/index.js';
import { loadCjs, createReact } from './data-ui-harness.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ---- 1. 真实 vault 域，内存库：初始化 + 一条凭据，随后可锁可解 -------------------------------
const db = new DatabaseSync(':memory:');
const actions = new Map();
const domain = createDomain({});
domain.setup({
  db,
  now: () => Date.now(),
  log() {},
  action(name, def) {
    actions.set(name, def);
  },
  tool() {},
  addon: { version: 'test' },
  shellVersion: 'test',
});
const rawCall = (name, args) => actions.get(name).execute(args || {}, { origin: 'ui' });
const api = { call: (name, args) => Promise.resolve(rawCall(name, args)) };

const pass = 'correct horse battery';
rawCall('vault.setup', { passphrase: pass, mode: 'A' });
rawCall('vault.secretCreate', { name: 'p1', kind: 'password', secret: 's3cret' });
assert.equal(rawCall('vault.status').locked, false, '初始化后默认解锁');

// ---- 2. 沙箱渲染：lucide 图标一律用空组件顶替，其余按相对路径真实加载 -------------------------
const lucideDeps = {};
for (const dir of ['packages/addons/vault/client/ui', 'packages/addons/lib']) {
  for (const file of readdirSync(resolve(root, dir))) {
    if (!file.endsWith('.cjs')) continue;
    const code = readFileSync(resolve(root, dir, file), 'utf8');
    for (const match of code.matchAll(/require\("(lucide-react\/icons\/[^"]+)"\)/g)) lucideDeps[match[1]] = { default: () => null };
  }
}
lucideDeps['lucide-react'] = { icons: {} };
// 共享组件模块级 require("react") 用同一个沙箱 React 实例（只有真正渲染时才走 hook）。
lucideDeps.react = createReact().React;

const Lock = loadCjs(resolve(root, 'packages/addons/vault/client/ui/lock.cjs'), lucideDeps);
Lock.POLL_MS = 10; // 测试把 4 秒轮询压到 10ms，验证「锁定会主动传播到页面」

// 页面里的 require("../ui/lock.cjs") 直接注入上面这份实例：loadCjs 每次调用都有独立沙箱缓存，
// 否则测试改的 POLL_MS 落不到页面实际用的那份模块上。
const pageDeps = { ...lucideDeps, "../ui/lock.cjs": Lock };
function mountView(file, extraProps = {}) {
  const rt = createReact();
  const View = loadCjs(resolve(root, file), pageDeps);
  const props = { api, lang: 'zh', h: rt.React.createElement, React: rt.React, ...extraProps };
  return { rt, View, props, render: () => rt.mount(View, props) };
}

const text = node => (Array.isArray(node) ? node.map(text).join('') : node && typeof node === 'object' ? text(node.children) : String(node ?? ''));
const classes = node => {
  if (Array.isArray(node)) return node.flatMap(classes);
  if (!node || typeof node !== 'object') return [];
  const own = typeof node.props?.className === 'string' ? [node.props.className] : [];
  return own.concat(classes(node.children));
};
const tick = () => new Promise(r => setTimeout(r, 25));
/** 迷你 React 不会自动重渲染：反复 render + 等微任务，直到状态稳定。 */
async function settle(page, rounds = 5) {
  let tree = page.render();
  for (let i = 0; i < rounds; i += 1) {
    await tick();
    tree = page.render();
  }
  return tree;
}

// A. 已解锁：凭据页正常列出数据。
const secrets = mountView('packages/addons/vault/client/views/secrets.cjs');
let tree = await settle(secrets);
assert.match(text(tree), /p1/, '解锁时应列出凭据');
assert.equal(text(tree).includes('保险箱已锁定'), false, '解锁时不显示锁定提示');

// B. 服务端锁定后，页面在下一次轮询自行收起列表，只留锁定提示。
rawCall('vault.lock');
tree = await settle(secrets);
assert.match(text(tree), /保险箱已锁定/, '锁定后显示提示卡');
assert.equal(text(tree).includes('p1'), false, '锁定后不再渲染任何凭据行');
assert.equal(classes(tree).some(c => c.includes('wbv-table')), false, '锁定后不渲染表格');
assert.match(text(tree), /请先在「保险箱」页解锁/);

// C. 未解锁就打开分组页：直接是提示卡，不发列表请求。
let listedWhileLocked = 0;
const countingApi = {
  call(name, args) {
    if (name === 'vault.setList' || name === 'vault.groupList' || name === 'vault.secretList') listedWhileLocked += 1;
    return api.call(name, args);
  },
};
{
  const page = mountView('packages/addons/vault/client/views/groups.cjs', { api: countingApi });
  const lockedTree = await settle(page);
  assert.match(text(lockedTree), /保险箱已锁定/, '分组页锁定时给提示卡');
  assert.equal(classes(lockedTree).some(c => c.includes('wbv-table') || c.includes('wbv-split')), false, '分组页锁定时不渲染列表/分栏');
}
assert.equal(listedWhileLocked, 0, '锁定期间不请求列表接口');

// C2. 集合页锁定态整页让位：集合名、描述与凭据名同样是业务信息，既不渲染也不请求。
{
  let listedWhileSetsLocked = 0;
  const setsCountingApi = {
    call(name, args) {
      if (['vault.setList', 'vault.setGet', 'vault.secretList', 'vault.groupList'].includes(name)) listedWhileSetsLocked += 1;
      return api.call(name, args);
    },
  };
  const page = mountView('packages/addons/vault/client/views/sets.cjs', { api: setsCountingApi });
  const lockedTree = await settle(page);
  assert.match(text(lockedTree), /保险箱已锁定/, '集合页锁定时给提示卡');
  assert.equal(classes(lockedTree).some(c => c.includes('wbv-split')), false, '集合页锁定时不渲染列表/分栏');
  assert.equal(text(lockedTree).includes('集合'), false, '集合页锁定时不出现集合文案');
  assert.equal(listedWhileSetsLocked, 0, '集合页锁定时不请求列表/详情');
}

// C3. 数据页锁定态整页让位：不渲染数据浏览器，也不请求表清单/行数据。
{
  let dataCalls = 0;
  const dataApi = {
    call(name, args) {
      if (name.startsWith('vault.data')) dataCalls += 1;
      return api.call(name, args);
    },
  };
  const page = mountView('packages/addons/vault/client/views/data.cjs', { api: dataApi });
  const lockedTree = await settle(page);
  assert.match(text(lockedTree), /保险箱已锁定/, '数据页锁定时给提示卡');
  assert.equal(classes(lockedTree).some(c => c.includes('wbv-data')), false, '数据页锁定时不渲染数据浏览器');
  assert.equal(dataCalls, 0, '数据页锁定时不请求数据');
}

// D. 迟到的响应不许回填：集合页请求发出后立刻锁定，响应晚到也要被丢弃。
rawCall('vault.unlock', { passphrase: pass });
let releaseSetList = null;
let deferOnce = true;
const slowApi = {
  call(name, args) {
    if (name === 'vault.setList' && deferOnce) {
      deferOnce = false;
      return new Promise(resolve => { releaseSetList = () => resolve({ items: [{ id: 's-late', name: '迟到的集合' }] }); });
    }
    return api.call(name, args);
  },
};
const sets = mountView('packages/addons/vault/client/views/sets.cjs', { api: slowApi });
await settle(sets);
assert.equal(typeof releaseSetList, 'function', '集合页解锁后确实发出了列表请求');
rawCall('vault.lock');
await settle(sets); // 轮询已把页面切到锁定态
releaseSetList();
const lateTree = await settle(sets);
assert.equal(text(lateTree).includes('迟到的集合'), false, '锁定后到达的响应不得回填列表');
assert.match(text(lateTree), /保险箱已锁定/);

// E. 重新解锁后自动恢复（不需要用户点刷新）。
rawCall('vault.unlock', { passphrase: pass });
const recovered = await settle(sets);
assert.equal(text(recovered).includes('保险箱已锁定'), false, '解锁后提示卡消失');
assert.equal(text(recovered).includes('读取集合…'), false, '解锁后重新发起了列表请求并完成');
assert.equal(text(recovered).includes('迟到的集合'), false, '丢弃的那份迟到响应不会借着解锁复活');
assert.match(text(recovered), /还没有集合/, '解锁后展示的是真实后端结果');

// F. 源码契约：凭据/集合/分组/数据页都接守卫，锁定时不保留明文/弹窗/列表状态。
for (const file of ['secrets', 'groups', 'sets', 'data']) {
  const code = readFileSync(resolve(root, 'packages/addons/vault/client/views/' + file + '.cjs'), 'utf8');
  assert.match(code, /require\("\.\.\/ui\/lock\.cjs"\)/, file + ' 必须接入 ui/lock.cjs');
  assert.match(code, /if \(!guard\.ready\)/, file + ' 状态未就绪先给占位');
  assert.match(code, /if \(guard\.locked\) return h\(Lock\.Panel/, file + ' 锁定只渲染提示卡');
  if (file !== 'data') assert.match(code, /inflight\.seq !== seq/, file + ' 在途响应必须能作废');
}
const setsCode = readFileSync(resolve(root, 'packages/addons/vault/client/views/sets.cjs'), 'utf8');
assert.doesNotMatch(setsCode, /var readOnly = guard\.locked;/, '集合页不再保留只读列表分支');
assert.match(setsCode, /load\(\);\n  \}, \[guard\.ready, guard\.locked\]\);/, '集合页解锁后才加载列表');
for (const clear of ['listS[1]({ loading: false, items: [], error: "" })', 'detailS[1]({ setId: "", secrets: [], groups: [], error: "" })', 'draftS[1](null)', 'pickS[1]([])', 'delS[1](null)']) {
  assert.ok(setsCode.includes(clear), '集合页锁定时必须清空：' + clear);
}
const dataCode = readFileSync(resolve(root, 'packages/addons/vault/client/views/data.cjs'), 'utf8');
assert.match(dataCode, /if \(guard\.locked\) return h\(Lock\.Panel/, '数据页锁定只渲染提示卡');
assert.match(dataCode, /return h\(Inner, props\);/, '数据页解锁后才渲染共享数据浏览器');
const secretsCode = readFileSync(resolve(root, 'packages/addons/vault/client/views/secrets.cjs'), 'utf8');
for (const clear of ['revealS[1](null)', 'unlockS[1](null)', 'editingS[1](false)', 'showSecretS[1](false)']) {
  assert.ok(secretsCode.includes(clear), '锁定时必须清空：' + clear);
}
const groupsCode = readFileSync(resolve(root, 'packages/addons/vault/client/views/groups.cjs'), 'utf8');
for (const clear of ['openS[1](null)', 'createS[1](null)', 'delS[1](null)']) assert.ok(groupsCode.includes(clear), '锁定时必须收起：' + clear);

// 页面里的 10ms 轮询在测试结束前仍会触发，直接结束进程，避免关库后再被轮询读到。
console.log('VAULT LOCK PASS: 凭据/集合/分组/数据页未解锁只给提示卡、锁定时清空列表/详情/弹窗且不发请求、迟到响应不回填、重新解锁自动恢复');
process.exit(0);
