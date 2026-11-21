/** 邮件配置页回归：内存 API + vm 沙箱渲染，不接触生产库、不构建、不改 profile。
 *
 * 覆盖：配置页按分组渲染十项（含正文配色、同步方式两个枚举）、改一项立即写入、写失败保留
 * 原值并提示、恢复默认调用 configReset、读不到配置时按默认值继续、自动同步运行状态摘要；
 * 远程图片默认加载/拦截两种正文提示。
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCjs, createReact } from './data-ui-harness.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// lucide 图标一律空组件顶替，其余按相对路径真实加载。
const deps = {};
for (const dir of ['packages/addons/mail/client/ui', 'packages/addons/lib']) {
  for (const file of readdirSync(resolve(root, dir))) {
    if (!file.endsWith('.cjs')) continue;
    const code = readFileSync(resolve(root, dir, file), 'utf8');
    for (const m of code.matchAll(/require\("(lucide-react\/icons\/[^"]+)"\)/g)) deps[m[1]] = { default: () => null };
  }
}
deps['lucide-react'] = { icons: {} };
deps.react = createReact().React;

const Config = loadCjs(resolve(root, 'packages/addons/mail/client/views/config.cjs'), deps);
const MailHtml = loadCjs(resolve(root, 'packages/addons/mail/client/ui/mail-html.cjs'), deps);

const text = (node) => (Array.isArray(node) ? node.map(text).join('') : node && typeof node === 'object' ? text(node.children) : String(node ?? ''));
const walk = (node, out = []) => {
  if (Array.isArray(node)) { node.forEach((n) => walk(n, out)); return out; }
  if (!node || typeof node !== 'object') return out;
  out.push(node);
  walk(node.children, out);
  return out;
};
const tick = () => new Promise((r) => setTimeout(r, 20));
async function settle(page, rounds = 5) {
  let tree = page.render();
  for (let i = 0; i < rounds; i += 1) {
    await tick();
    tree = page.render();
  }
  return tree;
}

const ITEMS = [
  { id: 'images.remote', group: 'images', type: 'bool', surface: 'ui', apply: 'mount', default: true, zh: '默认加载远程图片', en: 'Show remote images', hintZh: '打开即按原信显示图片。', hintEn: 'Images load.' },
  { id: 'display.html', group: 'display', type: 'bool', surface: 'ui', apply: 'mount', default: true, zh: '优先原信排版', en: 'Prefer HTML layout', hintZh: '用原文的 HTML 排版显示。', hintEn: 'Render HTML.' },
  { id: 'display.mailTheme', group: 'display', type: 'multi', surface: 'ui', apply: 'mount', default: 'original', values: ['original', 'app'], zh: '正文配色', en: 'Mail colour scheme', hintZh: '按原信配色或跟随界面主题。', hintEn: 'Keep the sender palette or follow the app theme.' },
  { id: 'read.autoSeen', group: 'read', type: 'bool', surface: 'ui', apply: 'mount', default: true, zh: '打开即标为已读', en: 'Mark as read on open', hintZh: '打开即回写已读。', hintEn: 'Mark read.' },
  { id: 'list.pageSize', group: 'list', type: 'int', surface: 'ui', apply: 'mount', default: 20, min: 10, max: 50, zh: '每次加载封数', en: 'Messages per page', hintZh: '一次加载多少封。', hintEn: 'Page size.' },
  { id: 'autosync.enabled', group: 'autosync', type: 'bool', surface: 'ui', apply: 'background', default: true, zh: '自动收取新邮件', en: 'Fetch new mail automatically', hintZh: '后台检查收件箱。', hintEn: 'Check in background.' },
  { id: 'autosync.mode', group: 'autosync', type: 'multi', surface: 'ui', apply: 'background', default: 'interval', values: ['interval', 'idle'], valueLabels: { interval: { zh: '定时循环', en: 'Interval' }, idle: { zh: 'IMAP 推送', en: 'IMAP push (IDLE)' } }, zh: '同步方式', en: 'Sync method', hintZh: '定时连一次或让服务器推送。', hintEn: 'Poll or let the server push.' },
  { id: 'autosync.intervalSec', group: 'autosync', type: 'int', surface: 'ui', apply: 'background', default: 300, min: 60, max: 1800, zh: '定时间隔（秒）', en: 'Interval (seconds)', hintZh: '60–1800 秒。', hintEn: '60–1800 seconds.' },
  { id: 'autosync.notify', group: 'autosync', type: 'bool', surface: 'ui', apply: 'background', default: true, zh: '新邮件通知到消息中心', en: 'Notify new mail in messages', hintZh: '装了消息插件时提醒。', hintEn: 'Notify when installed.' },
];
const GROUPS = [
  { id: 'images', zh: '图片', en: 'Images' },
  { id: 'display', zh: '显示', en: 'Display' },
  { id: 'read', zh: '阅读', en: 'Reading' },
  { id: 'list', zh: '列表', en: 'List' },
  { id: 'autosync', zh: '自动同步', en: 'Auto-sync' },
];

// A. 只读渲染：四项都在，值来自服务端；分组标题按语言。
const defaults = { 'images.remote': true, 'display.html': true, 'display.mailTheme': 'original', 'read.autoSeen': true, 'list.pageSize': 20, 'autosync.enabled': true, 'autosync.mode': 'interval', 'autosync.intervalSec': 300, 'autosync.notify': true };
const syncStatus = { enabled: true, mode: 'interval', intervalSec: 300, running: true, skippedLocked: 0, lastAt: Date.UTC(2026, 10, 21, 6, 30), accounts: [{ id: 'a1', name: '工作', mode: 'interval', connected: true, lastAt: Date.UTC(2026, 10, 21, 6, 30), lastInserted: 2, lastError: '' }] };
const state = { values: Object.assign({}, defaults), overrides: {}, fail: false, failSet: false, calls: [] };
const api = {
  call(name, args) {
    state.calls.push({ name, args });
    if (name === 'mail.configGet') {
      if (state.fail) return Promise.reject(new Error('connection rejected'));
      return Promise.resolve({ domain: 'mail', groups: GROUPS, items: ITEMS, values: state.values, overrides: state.overrides, warnings: [] });
    }
    if (name === 'mail.configSet') {
      if (state.failSet) return Promise.reject(new Error('list.pageSize 需要在 10–50 之间'));
      Object.assign(state.values, args.values);
      Object.assign(state.overrides, args.values);
      return Promise.resolve({ changed: Object.keys(args.values), values: state.values });
    }
    if (name === 'mail.autoSyncStatus') return Promise.resolve(syncStatus);
    if (name === 'mail.configReset') {
      state.values = Object.assign({}, defaults);
      state.overrides = {};
      return Promise.resolve({ reset: ITEMS.map((i) => i.id), values: state.values });
    }
    throw new Error('unexpected action ' + name);
  },
};

// 每次挂载用一份新的运行时：迷你 React 的 hook 槽位按挂载复用了同一个数组，
// 复用会串味（上一次的 ready/values 会被当成新挂载的初值）。
function mountConfig(lang) {
  const rt = createReact();
  return { render: () => rt.mount(Config, { api, lang: lang || 'zh', h: rt.React.createElement, React: rt.React }) };
}

const page = mountConfig('zh');
let tree = await settle(page);
let txt = text(tree);
for (const item of ITEMS) assert.ok(txt.includes(item.zh), '应列出配置项：' + item.id);
for (const group of GROUPS) assert.ok(txt.includes(group.zh), '应有分组标题：' + group.id);
assert.match(txt, /邮件设置/);
assert.equal(walk(tree).filter((n) => n.props && n.props.role === 'switch').length, 5, '五个布尔项各一个开关');
assert.equal(walk(tree).filter((n) => n.props && n.props.type === 'number').length, 2, '两个数字项');
assert.match(txt, /正在运行：定时循环，300s/, '应显示自动同步的运行状态，而不是只显示开关意愿');
const sel = walk(tree).find((n) => n.type === 'select' && n.props['aria-label'] === '正文配色');
assert.ok(sel, '正文配色应渲染成下拉');
assert.equal(sel.props.value, 'original', '默认按原信配色');
assert.equal(JSON.stringify(walk(sel).filter((n) => n.type === 'option').map((n) => n.props.value)), JSON.stringify(['original', 'app']), '两个取值');
assert.match(text(sel), /按原信配色/, '选项用中文标签');

// B. 改一项立即写入：开关走 configSet，成功后台账同步、没有「已改」标记残留错误。
// 共享开关自带「开启/关闭」文案，没有 aria-label 与 onChange 事件：按行上的
// data-config 定位到对应布尔项，再直接触发开关的 onClick。
const switchOf = (id) => walk(walk(tree).find((n) => n.props && n.props['data-config'] === id)).find((n) => n.props && n.props.role === 'switch');
const box = switchOf('images.remote');
assert.ok(box, '默认加载远程图片应渲染成共享开关');
box.props.onClick({ preventDefault: function () {} });
tree = await settle(page);
const setCall = state.calls.filter((c) => c.name === 'mail.configSet').at(-1);
assert.equal(JSON.stringify(setCall.args), JSON.stringify({ values: { 'images.remote': false } }), '开关要立刻落库'); // vm 跨域对象用序列化比较
assert.equal(state.values['images.remote'], false);
assert.match(text(tree), /已保存/, '写入成功后给一次提示');
assert.match(text(tree), /已改/, '改动过的项要能看出来');

// B2. 正文配色下拉的改动也要立即落库。
sel.props.onChange({ target: { value: 'app' } });
tree = await settle(page);
const themeCall = state.calls.filter((c) => c.name === 'mail.configSet').at(-1);
assert.equal(JSON.stringify(themeCall.args), JSON.stringify({ values: { 'display.mailTheme': 'app' } }), '配色选择要立刻落库');
assert.equal(state.values['display.mailTheme'], 'app');

// C. 写失败：保留原值（不静默改成新值），提示错误原因。
state.failSet = true;
const num = walk(tree).find((n) => n.props && n.props.type === 'number');
num.props.onChange({ target: { value: '60' } });
tree = await settle(page);
assert.equal(walk(tree).find((n) => n.props && n.props.type === 'number').props.value, 20, '写失败要回退到落库值');
assert.match(text(tree), /10–50/, '要说明失败原因');
state.failSet = false;

// D. 恢复默认：调 configReset 并把值同步回来。
state.values['display.html'] = false;
tree = await settle(page);
const resetBtn = walk(tree).find((n) => n.props && typeof n.props.onClick === 'function' && text(n).includes('全部恢复默认'));
assert.ok(resetBtn, '应有「全部恢复默认」按钮');
resetBtn.props.onClick();
tree = await settle(page);
assert.ok(state.calls.some((c) => c.name === 'mail.configReset'), '恢复默认要调 configReset');
assert.equal(state.values['display.html'], true);

// E. 读不到配置：不阻塞页面，按默认值继续提示原因。
state.fail = true;
const failPage = mountConfig('zh');
tree = await settle(failPage);
assert.match(text(tree), /connection rejected/, '读失败要给出原因');
state.fail = false;

// F. 英文界面跟随语言。
const enPage = mountConfig('en');
tree = await settle(enPage);
assert.match(text(tree), /Mail settings/);
assert.match(text(tree), /Remote|remote|Show remote images/);

// G. 正文远程图片：默认加载时提示「已加载」且带真实地址；配置关闭时提示拦截并换成占位。
const html = '<p>正文</p><img src="https://img.example.com/logo.png" alt="logo">';
function mountHtml(remoteDefault) {
  const rt = createReact();
  return { render: () => rt.mount(MailHtml, { api, h: rt.React.createElement, React: rt.React, html, attachments: [], title: 't', remoteDefault }) };
}
const onPage = mountHtml(true);
let onTree = await settle(onPage);
assert.match(text(onTree), /已加载远程图片/, '默认加载：说明图片来自发件方');
assert.match(text(onTree), /本次不加载/, '默认加载：按钮是「本次不加载」');
assert.ok(text(walk(onTree).find((n) => n.props && n.props.className === 'wbml-htmlframe').props.srcDoc).includes('https://img.example.com/logo.png'));

const offPage = mountHtml(false);
const offTree = await settle(offPage);
assert.match(text(offTree), /已按设置拦截/, '关闭后：说明已拦截');
assert.match(text(offTree), /显示图片/, '关闭后：按钮是「显示图片」');
const offDoc = walk(offTree).find((n) => n.props && n.props.className === 'wbml-htmlframe').props.srcDoc;
assert.equal(offDoc.includes('img.example.com'), false, '关闭远程图片时正文里不该留真实地址');
assert.match(offDoc, /data:image\/gif;base64/, '要被透明占位替换');
assert.match(offDoc, /img-src data:;/, 'CSP 也要收紧');

// H. 列表与阅读区确实读了这几项配置：读取点集中在 prefs.cjs，服务视图只消费结果。
const prefsSrc = readFileSync(resolve(root, 'packages/addons/mail/client/views/prefs.cjs'), 'utf8');
const messages = readFileSync(resolve(root, 'packages/addons/mail/client/views/messages.cjs'), 'utf8');
for (const key of ['images.remote', 'display.html', 'read.autoSeen', 'list.pageSize']) {
  assert.ok(prefsSrc.includes(key), 'prefs.cjs 应读取 ' + key);
}
assert.match(messages, /limit: pageSize/, '列表分页要用配置封数');
assert.match(messages, /args\.limit = pageSize/, '抓取新信也要用配置封数');
assert.match(messages, /prefs\["read.autoSeen"\] !== false/, '自动已读要受配置控制');
assert.match(messages, /remoteDefault: prefs\["images\.remote"\] !== false/, '正文要传远程图片默认策略');

// readBody：关闭 HTML 时不给 html（回退 <pre>），附件一律剔除内联图。
const prefsApi = loadCjs(resolve(root, 'packages/addons/mail/client/views/prefs.cjs'), deps);
const body = { html: '<b>富文本</b>', body: '纯文本', attachments: [{ inline: true }, { inline: false }] };
const picked = prefsApi.readBody({ 'display.html': true }, body, {});
assert.equal(picked.html, '<b>富文本</b>');
assert.equal(picked.files.length, 1, '内联图不进附件清单');
assert.equal(picked.hasText, true);
assert.equal(prefsApi.readBody({ 'display.html': false }, body, {}).html, '', '关闭 HTML 后不再渲染原文');
assert.equal(prefsApi.clampPageSize(3), 10, '封数下限 10');
assert.equal(prefsApi.clampPageSize(99), 50, '封数上限 50');

console.log('MAIL CONFIG TEST PASS', JSON.stringify({ setCalls: state.calls.filter((c) => c.name === 'mail.configSet').length }));
