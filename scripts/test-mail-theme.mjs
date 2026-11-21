/** 邮件正文主题适配回归：纸面判定、@media prefers-color-scheme 改写、配色模式与页头切换。
 *
 * 不构建、不连网：直接加载 client/ui/mail-html.cjs，用 vm 沙箱渲染页头控件。
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCjs, createReact } from './data-ui-harness.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

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

const MailHtml = loadCjs(resolve(root, 'packages/addons/mail/client/ui/mail-html.cjs'), deps);
const { detectPaper, rewriteScheme, buildDoc, sanitize } = MailHtml;

const text = (node) => (Array.isArray(node) ? node.map(text).join('') : node && typeof node === 'object' ? text(node.children) : String(node ?? ''));
const walk = (node, out = []) => {
  if (Array.isArray(node)) { node.forEach((n) => walk(n, out)); return out; }
  if (!node || typeof node !== 'object') return out;
  out.push(node);
  walk(node.children, out);
  return out;
};
const tick = () => new Promise((r) => setTimeout(r, 20));
async function settle(page, rounds = 3) {
  let tree = page.render();
  for (let i = 0; i < rounds; i += 1) { await tick(); tree = page.render(); }
  return tree;
}

const LIGHT = { paper: '#ffffff', ink: '#1f2328', line: '#e5e7eb', link: '#0a66c2' };
const DARK = { paper: '#111318', ink: '#e6e8ec', line: '#2a2e37', link: '#7aa2ff' };

// WCAG 对比度，用来验证「文字压在纸面上仍可读」。
function ratio(a, b) {
  const lum = (hex) => {
    const n = hex.replace('#', '');
    const rgb = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
    const ch = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  };
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
const frameDoc = (tree) => walk(tree).find((n) => n.props && n.props.className === 'wbml-htmlframe').props.srcDoc;
const bodyColor = (doc) => ({
  background: /body\{[^}]*background:(#[0-9a-f]{6})/i.exec(doc)[1],
  color: /body\{[^}]*color:(#[0-9a-f]{6})/i.exec(doc)[1],
});

// A. 纸面判定：认得出浅底、深底与「没声明」三种，rgb()/简写也要认。
assert.equal(detectPaper('<table bgcolor="#ffffff"><tr><td>x</td></tr></table>', LIGHT).kind, 'light');
assert.equal(detectPaper('<div style="background-color:#101114">x</div>', LIGHT).kind, 'dark');
assert.equal(detectPaper('<p>hi</p>', DARK).kind, 'unknown');
assert.equal(detectPaper('<body style="background: #f7f8fa">x</body>', LIGHT).kind, 'light');
assert.equal(detectPaper('<table style="background-color:rgb(18,18,20)">x</table>', LIGHT).kind, 'dark');
const unknown = detectPaper('<p>hi</p>', DARK);
assert.equal(unknown.paper, DARK.paper, '没声明就跟随界面主题的纸面');
assert.equal(unknown.ink, DARK.ink, '没声明就跟随界面主题的文字色');

// B. prefers-color-scheme：按应用主题求值，而不是操作系统；嵌套与注释不能破坏 CSS。
const twoBranch = '<style>@media (prefers-color-scheme: dark){p{color:#fff}}@media (prefers-color-scheme: light){p{color:#000}}</style><p>x</p>';
assert.equal(sanitize(twoBranch, { scheme: 'dark' }).html, '<style>p{color:#fff}</style><p>x</p>');
assert.equal(sanitize(twoBranch, { scheme: 'light' }).html, '<style>p{color:#000}</style><p>x</p>');
const nested = '@media (prefers-color-scheme: dark){@media (min-width:600px){p{color:#eee}}}';
assert.equal(rewriteScheme(nested, 'dark'), '@media (min-width:600px){p{color:#eee}}', '嵌套媒体查询要保留内层');
assert.equal(rewriteScheme(nested, 'light'), '', '不匹配的分支整块丢弃');
const comment = '@media (prefers-color-scheme: dark){/* } 不配对 */p{color:#eee}}';
assert.equal(rewriteScheme(comment, 'dark'), '/* } 不配对 */p{color:#eee}', '注释里的括号不参与配平');
const plain = '@media screen and (max-width:600px){p{color:#333}}';
assert.equal(rewriteScheme(plain, 'dark'), plain, '与配色无关的媒体查询原样保留');
assert.equal(rewriteScheme('p{color:red}', 'dark'), 'p{color:red}');

// C. 配色模式：按原信配色时纸面跟邮件走，跟随界面时两者都用界面主题。
const lightMail = '<table bgcolor="#ffffff"><tr><td style="color:#333">发票</td></tr></table>';
const darkMail = '<div style="background-color:#101114"><span style="color:#eee">深色设计</span></div>';
const plainMail = '<p>没有背景声明的正文</p>';

const darkUiLightMail = buildDoc(lightMail, { theme: DARK, scheme: 'dark', mode: 'original' });
assert.deepEqual(bodyColor(darkUiLightMail), { background: '#ffffff', color: '#1f2328' }, '深色界面里浅色邮件保持浅纸面');
assert.match(darkUiLightMail, /color-scheme:light/, '纸面浅就声明 light');
assert.match(darkUiLightMail, /<html class="wbml-dark">/, 'iframe 标出应用主题是深色');
assert.ok(ratio(bodyColor(darkUiLightMail).color, bodyColor(darkUiLightMail).background) >= 4.5, '浅纸面上的文字要够对比度');

const lightUiDarkMail = buildDoc(darkMail, { theme: LIGHT, scheme: 'light', mode: 'original' });
assert.deepEqual(bodyColor(lightUiDarkMail), { background: '#16181d', color: '#e6e8ec' }, '浅色界面里深色邮件保持深纸面');
assert.match(lightUiDarkMail, /color-scheme:dark/, '纸面深就声明 dark');
assert.ok(ratio(bodyColor(lightUiDarkMail).color, bodyColor(lightUiDarkMail).background) >= 4.5);

const plainDark = buildDoc(plainMail, { theme: DARK, scheme: 'dark', mode: 'original' });
assert.deepEqual(bodyColor(plainDark), { background: DARK.paper, color: DARK.ink }, '没声明就跟随界面主题');
assert.ok(ratio(DARK.ink, DARK.paper) >= 4.5);

const plainLight = buildDoc(plainMail, { theme: LIGHT, scheme: 'light', mode: 'original' });
assert.deepEqual(bodyColor(plainLight), { background: LIGHT.paper, color: LIGHT.ink });

const followApp = buildDoc(lightMail, { theme: DARK, scheme: 'dark', mode: 'app' });
assert.deepEqual(bodyColor(followApp), { background: DARK.paper, color: DARK.ink }, '跟随界面主题时不再保留浅纸面');
assert.ok(ratio(DARK.ink, DARK.paper) >= 4.5);

// 主题没传时按老默认兜底，不能崩。
const fallback = buildDoc(lightMail, {});
assert.match(fallback, /background:#ffffff/, '没有主题也得给出纸面色');

// D. 页头切换：默认按原信配色，点一下跟随界面主题，重开同一封还记得上次选择。
const calls = [];
const api = { call: (name, args) => { calls.push({ name, args }); return Promise.resolve({ base64: '' }); } };
function mount(lang, mailId, extra = {}) {
  const rt = createReact();
  return { render: () => rt.mount(MailHtml, { h: rt.React.createElement, React: rt.React, api, html: lightMail, attachments: [], title: '发票', mailId, lang: lang || 'zh', ...extra }) };
}

let page = mount('zh', 'm-1');
let tree = await settle(page);
assert.match(text(tree), /跟随界面主题/, '默认按原信配色，按钮提示可以切换到跟随界面主题');
assert.match(frameDoc(tree), /background:#ffffff/);

const toggle = walk(tree).find((n) => n.props && n.props.onClick && text(n).includes('跟随界面主题'));
toggle.props.onClick();
tree = await settle(page);
assert.match(text(tree), /按原信配色/, '切到跟随界面主题后按钮变成切回原信配色');
// vm 沙箱里没有 document，themeVars() 退到默认浅纸面，因此这里只验证模式切换本身
// （纸面差异由上面 buildDoc 的用例覆盖）。
assert.match(frameDoc(tree), /background:#ffffff/);

// 同一封重开：沿用上次选择（按钮仍显示「按原信配色」= 当前是跟随界面主题）。
page = mount('zh', 'm-1');
tree = await settle(page);
assert.match(text(tree), /按原信配色/, '重开同一封要记住上次的配色选择');

// 另一封不受影响，仍按默认。
page = mount('zh', 'm-2');
tree = await settle(page);
assert.match(text(tree), /跟随界面主题/, '别的邮件不该被上一封的选择带偏');

// 配置项 display.mailTheme=app 时作为默认值（邮件插件文案统一中文，不随 lang 变化）。
page = mount('en', 'm-3', { mailTheme: 'app' });
tree = await settle(page);
assert.match(text(tree), /按原信配色/, '配置默认跟随界面主题时，按钮提示可切回原信配色');

// 再点一次能切回原信配色。
const back = walk(tree).find((n) => n.props && n.props.onClick && text(n).includes('按原信配色'));
back.props.onClick();
tree = await settle(page);
assert.match(text(tree), /跟随界面主题/, '切回原信配色后按钮提示跟随界面主题');

// 外框：纸面与界面主题可能不同色，所以外面垫一层 --wb-card 的留白容器。
assert.equal(walk(tree).filter((n) => n.props && n.props.className === 'wbml-htmlpad').length, 1, '正文外套一层留白容器');
const padSrc = readFileSync(resolve(root, 'packages/addons/mail/client/ui/reader-styles.cjs'), 'utf8');
assert.match(padSrc, /\.wbml-htmlpad\{padding:12px;border:1px solid var\(--wb-line\);border-radius:12px;background:var\(--wb-card\)\}/, '留白容器只用主题 token');
assert.match(padSrc, /\.wbml-htmlframe\{[^}]*border:0/, 'iframe 自己不再描边，交给外框');

console.log('MAIL THEME TEST PASS', JSON.stringify({ papers: ['light', 'dark', 'unknown'], toggled: 'm-1' }));
