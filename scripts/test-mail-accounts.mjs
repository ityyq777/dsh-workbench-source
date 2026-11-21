/**
 * 邮箱账户接入：服务商预设 / 失败归类 / 后端 lastMessageAt 与 testAccount / 页面渲染。
 *
 * 两条轨道：能跑的真跑（预设表、归类、内存库、SSR 渲染），跑不了靠源码特征
 * （页面必须走本插件 action、不允许出现裸密码框）。
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRequire } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
import { PROVIDERS, detectProvider, presetFor } from '../packages/addons/mail/lib/domain/providers.js';
import { ERROR_TEXT, classifyProbeError } from '../packages/addons/mail/lib/domain/probe-error.js';
import { ensureSchema } from '../packages/addons/mail/lib/db/db.js';
import { createMail } from '../packages/addons/mail/lib/domain/mail.js';

const require = createRequire(import.meta.url);
const h = React.createElement;
const MAIL = new URL('../packages/addons/mail/', import.meta.url);
const src = (p) => readFileSync(new URL(p, MAIL), 'utf8');

// ---------- 预设表：六类接入路径 ----------
assert.deepEqual(
  PROVIDERS.map((p) => p.id),
  ['qq', 'netease', 'microsoft', 'gmail', 'icloud', 'other'],
  '预设表覆盖 QQ/网易/微软/Gmail/iCloud/其他六类',
);
const qq = presetFor('qq', '');
assert.equal(qq.imapHost, 'imap.qq.com');
assert.equal(qq.imapPort, 993);
assert.equal(qq.imapTls, true);
assert.equal(qq.smtpHost, 'smtp.qq.com');
assert.equal(qq.smtpPort, 465);
const netease = presetFor('netease', 'someone@163.com');
assert.equal(netease.imapHost, 'imap.163.com', '网易主机按域名派生，不写死一条');
assert.equal(presetFor('netease', 'a@126.com').smtpHost, 'smtp.126.com');
const ms = presetFor('microsoft', 'a@outlook.com');
assert.equal(ms.smtpPort, 587);
assert.equal(ms.smtpTls, false, '微软 SMTP 587 走 STARTTLS，隐式 TLS 会握手失败');
assert.equal(presetFor('icloud', 'Me.Name@icloud.com').username, 'Me.Name', 'iCloud 登录名不含 @icloud.com');
assert.equal(presetFor('gmail', 'a@gmail.com').imapHost, 'imap.gmail.com');
assert.equal(detectProvider('123@163.com').id, 'netease');
assert.equal(detectProvider('a@vip.qq.com').id, 'qq', '最长域名命中优先于 qq.com');
assert.equal(detectProvider('a@qq.com').domain, 'qq.com');
assert.equal(detectProvider('a@unknown.test'), null, '陌生域名不给预设，交给「其他」');
assert.equal(detectProvider('not-an-email'), null);

// ---------- 失败归类：四种用户要做的动作必须能区分 ----------
const err = (message, code) => Object.assign(new Error(message), code ? { code } : {});
assert.equal(classifyProbeError(err('IMAP 登录失败：NO [AUTHENTICATIONFAILED] Invalid credentials')), 'auth');
assert.equal(classifyProbeError(err('SMTP 密码 失败：535 5.7.8 Authentication failed')), 'auth');
assert.equal(classifyProbeError(err('getaddrinfo ENOTFOUND imap.qq.com', 'ENOTFOUND')), 'dns');
assert.equal(classifyProbeError(err('connect ECONNREFUSED', 'ECONNREFUSED')), 'refused');
assert.equal(classifyProbeError(err('IMAP 连接超时')), 'timeout');
assert.equal(classifyProbeError(err('unable to verify the first certificate', 'UNABLE_TO_VERIFY_LEAF_SIGNATURE')), 'tls');
assert.equal(classifyProbeError(err('服务器不支持 STARTTLS')), 'starttls');
assert.equal(classifyProbeError(err('莫名其妙的问题')), 'unknown');
// 分段尺寸不一致是结构问题，不是网络问题：要给出「重新同步这封信」这一动作。
assert.equal(classifyProbeError(err('分段长度与服务器声明不符，请重新下载')), 'eframe');
assert.equal(classifyProbeError(Object.assign(new Error('x'), { code: 'EFRAME' })), 'eframe');
assert.ok(ERROR_TEXT.eframe && ERROR_TEXT.eframe.zh && ERROR_TEXT.eframe.en, 'eframe 要有中英文案');

// ---------- 后端：lastMessageAt 由本地邮件派生，testAccount 不再整条抛错 ----------
const db = new DatabaseSync(':memory:');
ensureSchema(db);
const host = { call: async () => ({ result: { secret: 'pw' } }) };
const mail = createMail({ db, host, log: () => {} });
const acc = mail.createAccount({ name: '主邮箱', email: 'me@qq.test', imapHost: '127.0.0.1', imapPort: 1, smtpHost: '127.0.0.1', secretId: 'sec1' });
assert.equal(mail.listAccounts().items[0].lastMessageAt, null, '没有本地来信时 lastMessageAt 为 null');
db.prepare('INSERT INTO mail_message (id,account_id,mailbox,uid,subject,from_addr,date_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)').run('m1', acc.id, 'INBOX', 1, '嗨', 'a@b.test', 1700000000000, 1, 1);
assert.equal(mail.listAccounts().items[0].lastMessageAt, 1700000000000, '最近来信取 MAX(date_at)');
const failed = await mail.testAccount(acc.id).catch((e) => e);
assert.ok(failed && typeof failed === 'object', 'testAccount 连接失败返回结果对象，不抛给调用方');
assert.ok(!failed.ok && typeof failed.errorClass === 'string', '失败结果带 errorClass，界面才能给对应文案');
assert.ok('probeAccount' in mail, 'mail.probeAccount 暴露给 action 层');

// ---------- 动作契约：自检只允许 UI，预设表只读 ----------
const actionsSrc = src('lib/domain/actions.js');
assert.match(actionsSrc, /action\("mail\.providerList"[\s\S]*?execute: \(\) => providerTable\(\)/, '预设表由 mail.providerList 下发，服务端只有一份');
assert.match(actionsSrc, /action\("mail\.accountProbe"[\s\S]*?deny\(ctx\.origin\)/, '自检只允许界面调用');
assert.equal(/action\("mail\.providerList"[\s\S]{0,200}deny\(/.test(actionsSrc), false, '预设表是只读数据，不需要 UI 门禁');

// ---------- 页面：服务商 chip / 账户卡片 / 保险箱门禁 ----------
const C = require('../packages/addons/mail/client/ui/common.cjs');
const SecretField = require('../packages/addons/lib/secret-field.cjs');
const ProviderChips = require('../packages/addons/mail/client/ui/provider-chips.cjs');
const AccountCard = require('../packages/addons/mail/client/ui/account-card.cjs');
const VaultGate = require('../packages/addons/mail/client/ui/vault-gate.cjs');
const AccountForm = require('../packages/addons/mail/client/ui/account-form.cjs');
const table = { providers: PROVIDERS };

const chips = renderToStaticMarkup(h(ProviderChips, { h, lang: 'zh', providers: table, value: 'qq', onPick: () => {} }));
for (const label of ['QQ 邮箱', '网易邮箱', '微软邮箱', 'Gmail', 'iCloud 邮箱', '其他通用邮箱']) assert.ok(chips.includes(label), '选择器列出 ' + label);
assert.ok(chips.includes('role="radio"') && chips.includes('aria-checked="true"'), '选择器用 radio 语义表达选中态');

const card = renderToStaticMarkup(h(AccountCard, {
  h, C, lang: 'zh',
  account: { id: 'a1', name: '工作邮箱', email: 'me@163.com', imapHost: 'imap.163.com', imapPort: 993, smtpHost: 'smtp.163.com', smtpPort: 465, lastMessageAt: 1700000000000 },
  test: { ok: false, errorClass: 'auth' },
}));
assert.ok(card.includes('编辑') && card.includes('测试') && card.includes('删除'), '卡片提供编辑/测试/删除');
assert.ok(card.includes('imap.163.com:993'), '卡片显示实际主机端口');
assert.ok(card.includes('授权码'), '认证失败时给的是授权码提示，不是「网络错误」');

assert.equal(renderToStaticMarkup(h(VaultGate, { h, C, lang: 'zh', vault: 'ready' })), '', '保险箱就绪时不占位');
const locked = renderToStaticMarkup(h(VaultGate, { h, C, lang: 'zh', SecretField, vault: 'locked', pass: '', onPass: () => {} }));
assert.ok(locked.includes('解锁并继续') && locked.includes('wb-secret-field'), '锁定态给解锁入口，口令框走共享明文控件');
const missing = renderToStaticMarkup(h(VaultGate, { h, C, lang: 'zh', SecretField, vault: 'missing', onRetry: () => {} }));
assert.ok(missing.includes('保险箱插件未安装') && missing.includes('重新检测'), '保险箱缺失时给安装引导与重新检测入口');
assert.equal(missing.includes('手填凭据 id'), false, '不再提供手填 secretId 的旁路：授权码只能存保险箱');

const form = renderToStaticMarkup(h(AccountForm, {
  h, React, api: { call: async () => ({}) }, C, lang: 'zh', SecretField, providers: table,
  account: null, onCancel: () => {}, onSaved: () => {},
}));
assert.ok(form.includes('imap.qq.com:993'), '默认 QQ 预设直接填好 IMAP 主机，且摘要里看得见');
assert.ok(form.includes('smtp.qq.com:465'), '默认 QQ 预设直接填好 SMTP 主机，且摘要里看得见');
const other = renderToStaticMarkup(h(AccountForm, {
  h, React, api: { call: async () => ({}) }, C, lang: 'zh', SecretField, providers: table,
  account: { id: 'a2', name: '自定义', email: 'me@corp.test', imapHost: '', imapPort: 993, imapTls: true, smtpHost: '', smtpPort: 465, smtpTls: true, secretId: 'sec9' },
  onCancel: () => {}, onSaved: () => {},
}));
assert.ok(other.includes('IMAP 服务器') && other.includes('登录名'), '陌生域名进入「其他」，展开主机/端口/登录名字段');
// 端口走共享数字输入控件：type=text + inputmode，范围只写成提示（1–65535）。
assert.equal((other.match(/wbctl-num-input/g) || []).length, 2, 'IMAP/SMTP 端口都走共享数字输入控件');
assert.ok(other.includes('1–65535'), '端口范围写成提示文字');
assert.equal(/type="number"/.test(other), false, '端口不再用会回灌边界的 type=number');
const SecretPicker = require('../packages/addons/mail/client/ui/secret-picker.cjs');
const picker = renderToStaticMarkup(h(SecretPicker, {
  h, React, C, api: { call: async () => ({ items: [] }) }, lang: 'zh', vault: 'ready', value: '', onChange: () => {},
}));
assert.ok(picker.includes('选择保险箱凭据'), '凭据选择器未选时显示占位文案');
assert.ok(picker.includes('aria-haspopup="listbox"'), '触发器声明为下拉入口');
const pickerLocked = renderToStaticMarkup(h(SecretPicker, {
  h, React, C, api: { call: async () => ({ items: [] }) }, lang: 'zh', vault: 'locked', value: '', onChange: () => {},
}));
assert.ok(pickerLocked.includes('保险箱已锁定或未初始化'), '保险箱锁定时选择器退化成说明文案');
assert.equal(form.includes('授权码 / 应用密码'), false, '表单里不再有授权码输入框');
assert.equal(form.includes('wb-eye'), false, '表单不再渲染明文切换小眼睛（保险箱口令框除外，vault loading 时不渲染）');
// 预设服务商只让填 @ 前面的本地部分，域名由预设提供；陌生域名才填整条地址。
assert.ok(form.includes('wbml-addr'), '预设服务商把地址拆成本地部分 + 域名');
assert.ok(form.includes('@</span>') || form.includes('wbml-addr-at'), '地址中间有 @ 分隔符');
assert.ok(form.includes('qq.com'), 'QQ 预设直接给出域名');
assert.equal(/placeholder="you@example\.com"/.test(form), false, '预设服务商不再让用户填整条地址');
assert.ok(other.includes('placeholder="you@example.com"'), '「其他」仍填整条地址');
// 编辑已有网易账户：拆出本地部分，域名落在 163.com
const edit163 = renderToStaticMarkup(h(AccountForm, {
  h, React, api: { call: async () => ({}) }, C, lang: 'zh', SecretField, providers: table,
  account: { id: 'a3', name: '网易', email: 'QiSheng0417@163.com', imapHost: 'imap.163.com', imapPort: 993, smtpHost: 'smtp.163.com', smtpPort: 465, secretId: 'sec1' },
  onCancel: () => {}, onSaved: () => {},
}));
assert.ok(edit163.includes('value="QiSheng0417"'), '编辑时本地部分回填到前面的输入框');
assert.ok(edit163.includes('163.com'), '编辑时域名回填 163.com');

assert.ok(form.includes('保存前自检'), '表单提供保存前自检');
// 未选凭据时「保存」与「自检」都置灰，并给一句提示
assert.match(form, /disabled=""[^>]*>保存<\/button>/, '未选凭据时保存按钮禁用');
assert.ok(form.includes('请先在保险箱新建并选择凭据'), '未选凭据时给出提示');

// ---------- 源码特征：只走本插件 action，没有裸密码框 ----------
const formSrc = src('client/ui/account-form.cjs');
for (const action of ['mail.accountProbe', 'mail.accountCreate', 'mail.accountUpdate']) {
  assert.ok(formSrc.includes(action), '表单调用 ' + action);
}
// 0.2.2：不再替用户建凭据，三条写入保险箱的 action 必须从表单里消失
for (const gone of ['vault.secretCreate', 'vault.secretUpdate', 'vault.secretDelete']) {
  // 注释里会提到这三个名字，所以只认真正的调用形态
  assert.equal(formSrc.includes('C.call(api, "' + gone + '"'), false, '表单不再调用 ' + gone);
}
assert.match(formSrc, /secretId: f\.secretId/, '自检与保存都把选中的 secretId 透传给后端');
assert.equal(/type:\s*"password"/.test(formSrc), false, '表单不再出现裸密码框');
assert.equal(/f\.password/.test(formSrc), false, '表单不再持有明文密码字段');
assert.match(formSrc, /NF\.NumberField/, '账户表单的数字项接入共享数字输入控件');
assert.match(formSrc, /portOk\(\)/, '端口非法时保存与自检按钮禁用');
const pickerSrc = src('client/ui/secret-picker.cjs');
assert.ok(pickerSrc.includes('vault.secretList'), '凭据选择器只从 vault.secretList 取数');
assert.match(pickerSrc, /Escape/, 'Esc 能收起选择器');
assert.match(pickerSrc, /mousedown/, '点外部能收起选择器');
assert.match(pickerSrc, /navigateAddon/, '无凭据时提供「去保险箱新建」的跳转');

// ---------- 共享清单：单选变体 ----------
const FilterChecklist = require('../packages/addons/lib/filter-checklist.cjs');
const single = renderToStaticMarkup(h(FilterChecklist, {
  mode: 'single', items: [{ id: 's1', name: 'QQ 授权码', meta: '授权码' }, { id: 's2', name: '网易授权码' }],
  selected: ['s1'], onPick: () => {}, title: '保险箱凭据', total: 2, autoFocus: false, query: 'qq',
}));
assert.ok(single.includes('role="radiogroup"'), '单选变体用 radiogroup 容器');
assert.equal((single.match(/role="radio"/g) || []).length, 2, '每项都是 radio');
assert.ok(single.includes('aria-checked="true"') && single.includes('aria-checked="false"'), '选中态用 aria-checked 表达');
assert.equal(single.includes('wbck-clear'), false, '单选不出现清空按钮');
assert.equal(single.includes('已选'), false, '单选不出现已选计数');
assert.equal(/type="checkbox"/.test(single), false, '单选不渲染 checkbox');
// 默认多选行为不变
const multi = renderToStaticMarkup(h(FilterChecklist, { items: [{ id: 'a', name: 'A' }], selected: ['a'], autoFocus: false, title: '全部', total: 1 }));
assert.ok(multi.includes('type="checkbox"') && multi.includes('已选 1'), '多选行为保持不变');
assert.ok(src('client/views/accounts.cjs').includes('mail.providerList'), '账户页从本插件 action 取服务商预设');
assert.ok(src('client/views/accounts.cjs').includes('mail.accountList'), '账户页从本插件 action 取账户列表');
assert.ok(src('client/views/accounts.cjs').includes('再从保险箱挑一条授权码'), '账户页副标题改成凭据选择口径');
assert.equal(src('client/views/accounts.cjs').includes('填授权码即可'), false, '账户页不再暗示在这里填授权码');

// ---------- 回归：state setter 必须真的声明过 ----------
// 曾经踩过：onPick 里调 setProbe(null)，但 setProbe 从未声明，点 chip 直接抛 ReferenceError，
// 于是「服务商切换不了」。这类错误 eslint 的 no-undef 只对 ESM/脚本生效（这里文件头是 "use strict"
// 的 CJS，且被包在函数里），单测与 SSR 渲染都发现不了，所以在这里补一条静态检查。
const ALLOW_SETTERS = new Set(['setTimeout', 'setInterval', 'setImmediate', 'setAttribute', 'setState']);
function assertSettersDeclared(file) {
  const text = src(file);
  const used = new Set();
  const re = /\b(set[A-Z][A-Za-z0-9_]*)\s*\(/g;
  let m;
  while ((m = re.exec(text))) used.add(m[1]);
  for (const name of used) {
    if (ALLOW_SETTERS.has(name)) continue;
    const declared =
      new RegExp('(?:var|let|const)\\s+' + name + '\\s*=').test(text) ||
      new RegExp('function\\s+' + name + '\\s*\\(').test(text) ||
      new RegExp('\\b' + name + '\\s*[,}]').test(text) ||
      new RegExp('props\\.' + name).test(text);
    assert.ok(declared, `${file} 调用了未声明的 ${name}(`);
  }
}
for (const file of ['client/ui/account-form.cjs', 'client/ui/vault-gate.cjs', 'client/ui/account-card.cjs', 'client/views/accounts.cjs']) {
  assertSettersDeclared(file);
}

console.log('mail accounts: ok');
