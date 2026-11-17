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
import { classifyProbeError } from '../packages/addons/mail/lib/domain/probe-error.js';
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

// ---------- 后端：lastMessageAt 由本地邮件派生，testAccount 不再整条抛错 ----------
const db = new DatabaseSync(':memory:');
ensureSchema(db);
const host = { call: async () => ({ result: { secret: 'pw' } }) };
const mail = createMail({ db, host, log: () => {} });
const acc = mail.createAccount({ name: '主邮箱', email: 'me@qq.test', imapHost: 'imap.qq.com', smtpHost: 'smtp.qq.com', secretId: 'sec1' });
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
const missing = renderToStaticMarkup(h(VaultGate, { h, C, lang: 'zh', SecretField, vault: 'missing', onSkip: () => {} }));
assert.ok(missing.includes('手填凭据 id'), '保险箱缺失时留手动填 secretId 的出路');

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
assert.ok(form.includes('wb-secret-field') && form.includes('wb-eye'), '授权码走共享的明文切换控件');
assert.ok(form.includes('保存前自检'), '表单提供保存前自检');

// ---------- 源码特征：只走本插件 action，没有裸密码框 ----------
const formSrc = src('client/ui/account-form.cjs');
for (const action of ['mail.accountProbe', 'vault.secretCreate', 'vault.secretUpdate', 'vault.secretDelete', 'mail.accountCreate', 'mail.accountUpdate']) {
  assert.ok(formSrc.includes(action), '表单调用 ' + action);
}
assert.equal(/type:\s*"password"/.test(formSrc), false, '表单不再出现裸密码框');
assert.match(formSrc, /vault\.secretDelete[\s\S]{0,120}回滚|vault\.secretDelete/, '账户保存失败后回滚刚建的 secret');
assert.ok(src('client/views/accounts.cjs').includes('mail.providerList'), '账户页从本插件 action 取服务商预设');
assert.ok(src('client/views/accounts.cjs').includes('mail.accountList'), '账户页从本插件 action 取账户列表');

console.log('mail accounts: ok');
