/** 邮件保险箱门禁回归：内存 API + vm 沙箱渲染，不接触生产库、不构建、不改 profile。
 *
 * 覆盖：锁定态只出锁定卡、视图不挂载、不发分页请求；解锁后 4 秒内自动恢复；
 * 再次锁定会收回内容；状态读不到时按锁定处理（fail-closed）。
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCjs, createReact } from './data-ui-harness.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// lucide 图标一律用空组件顶替，其余按相对路径真实加载。
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

const C = loadCjs(resolve(root, 'packages/addons/lib/client-common.cjs'), deps)('wbml');
const Gate = loadCjs(resolve(root, 'packages/addons/mail/client/ui/lock-gate.cjs'), deps);
Gate.lock.POLL_MS = 10; // 把 4 秒轮询压到 10ms，验证锁定会自动传播到页面

const text = (node) => (Array.isArray(node) ? node.map(text).join('') : node && typeof node === 'object' ? text(node.children) : String(node ?? ''));
const classes = (node) => {
  if (Array.isArray(node)) return node.flatMap(classes);
  if (!node || typeof node !== 'object') return [];
  const own = typeof node.props?.className === 'string' ? [node.props.className] : [];
  return own.concat(classes(node.children));
};
const tick = () => new Promise((r) => setTimeout(r, 25));
async function settle(page, rounds = 5) {
  let tree = page.render();
  for (let i = 0; i < rounds; i += 1) {
    await tick();
    tree = page.render();
  }
  return tree;
}

// 服务端状态：locked 由测试改写；calls 记录所有 action 调用，用来断言「锁定期间不发请求」。
const state = { locked: true, fail: false, calls: [] };
const api = {
  call(name) {
    state.calls.push(name);
    if (name !== 'vault.status') return Promise.resolve({ items: [], hasMore: false });
    if (state.fail) return Promise.reject(new Error('connection rejected'));
    return Promise.resolve({ locked: state.locked, initialized: true });
  },
};

// 被门禁包裹的视图：真实视图会挂载并请求列表；锁定时它一次都不该被渲染。
let innerRenders = 0;
let listRequests = 0;
function mountInline() {
  const rt = createReact();
  function Inner(props) {
    innerRenders += 1;
    props.React.useEffect(() => {
      listRequests += 1;
      props.api.call('mail.messageList', {});
    }, []);
    return props.h('div', { className: 'wbml-page' }, '收件箱：第一封邮件的主题');
  }
  const Guarded = Gate.gate(Inner, rt.React.createElement, rt.React, C);
  const props = { api, lang: 'zh', h: rt.React.createElement, React: rt.React };
  return { render: () => rt.mount(Guarded, props) };
}

// A. 保险箱锁定：只有锁定卡，视图不挂载，列表接口零请求。
state.locked = true;
const page = mountInline();
let tree = await settle(page);
assert.match(text(tree), /保险箱已锁定/, '锁定态应显示提示卡');
assert.match(text(tree), /锁定期间不显示发件人、主题、正文与附件/, '邮件页要说明锁定范围');
assert.equal(text(tree).includes('收件箱'), false, '锁定态不渲染任何邮件内容');
assert.equal(classes(tree).some((c) => c.includes('wbml-layout') || c.includes('wbml-table')), false, '锁定态不渲染列表/分栏');
assert.equal(innerRenders, 0, '锁定态组件根本不挂载');
assert.equal(listRequests, 0, '锁定态不发分页请求');
assert.equal(state.calls.filter((n) => n === 'mail.messageList').length, 0);

// B. 解锁：轮询发现未锁定后自动恢复，不需要刷新页面。
state.locked = false;
tree = await settle(page);
assert.match(text(tree), /收件箱：第一封邮件的主题/, '解锁后恢复列表');
assert.equal(text(tree).includes('保险箱已锁定'), false, '解锁后收起提示卡');
assert.ok(listRequests >= 1, '解锁后视图挂载并请求列表');

// C. 再次锁定：内容收回，视图不再渲染（轮询发现后最多再渲染一帧）。
const rendersAfterUnlock = innerRenders;
state.locked = true;
tree = await settle(page);
assert.match(text(tree), /保险箱已锁定/, '再次锁定后收回内容');
assert.equal(text(tree).includes('收件箱'), false);
const settled = innerRenders;
assert.ok(settled - rendersAfterUnlock <= 1, '锁定后视图只可能收尾一帧');
await settle(page);
assert.equal(innerRenders, settled, '锁定态之后视图不再渲染');

// D. 状态读不到：按锁定处理，并把错误挂在卡片上。
state.fail = true;
tree = await settle(page);
assert.match(text(tree), /保险箱已锁定/);
assert.match(text(tree), /connection rejected/, '读不到状态时展示原因');

// E. 锁定卡文案跟随语言。
state.fail = false;
const en = createReact();
const enPage = await (async () => {
  function Inner(props) { return props.h('div', null, 'INBOX'); }
  const Guarded = Gate.gate(Inner, en.React.createElement, en.React, C);
  return { render: () => en.mount(Guarded, { api, lang: 'en', h: en.React.createElement, React: en.React }) };
})();
const enTree = await settle(enPage);
assert.match(text(enTree), /The vault is locked/);

console.log('MAIL VAULT GATE TEST PASS', JSON.stringify({ listRequests, innerRenders: rendersAfterUnlock }));
