import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { createAgentAccess } from '../../../shell/lib/actions/agent-access.js';
import { registerMailActions } from '../lib/domain/actions.js';

function register() {
  const actions = new Map();
  const handlers = new Proxy({}, { get: (_, method) => (...inputs) => ({ method, inputs }) });
  registerMailActions({ action: (name, def) => actions.set(name, def) }, handlers);
  return actions;
}

const draft = { key: 'remember', accountId: 'a1', to: 'one@test', cc: 'two@test', subject: '主题', text: '正文', mode: 'replyAll', originId: 'origin' };
const send = { accountId: 'a1', to: ['one@test'], cc: ['two@test'], subject: 'Re: 主题', text: '回复', mode: 'reply', originId: 'origin' };
const list = { accountId: 'a1', mailbox: 'Archive', unread: false, q: '%', limit: 3, cursor: 'opaque' };
const page = { mailbox: 'Archive', limit: 4, beforeUid: 20, uidValidity: 42 };

test('每个新参数显式声明并交给对应服务，未声明参数不透传', () => {
  const actions = register();
  const cases = [
    ['mail.messageList', 'messages', list, [list]],
    ['mail.sync', 'sync', { id: 'a1', ...page }, ['a1', page]],
    ['mail.messageMarkRead', 'markRead', { id: 'm', ids: ['m'], read: false }],
    ['mail.messageSend', 'send', send],
    ['mail.messageBody', 'messageBody', { id: 'm', force: false }],
    ['mail.messageMove', 'move', { id: 'm', mailbox: 'Archive' }],
    ['mail.messageDelete', 'remove', { id: 'm' }],
    ['mail.attachmentDownload', 'attachmentDownload', { id: 'att' }],
    ['mail.draftList', 'draftList', {}, []],
    ['mail.draftGet', 'draftGet', { key: 'k' }],
    ['mail.draftSave', 'draftSave', draft],
    ['mail.draftDelete', 'draftDelete', { key: 'k' }],
  ];
  for (const [name, method, args, inputs = [args]] of cases) {
    const def = actions.get(name);
    assert.deepEqual(Object.keys(def.input.properties).sort(), Object.keys(args).sort(), name);
    assert.deepEqual(def.execute({ ...args, extra: 'ignored' }, { origin: 'ui' }), { method, inputs }, name);
  }
  assert.deepEqual(actions.get('mail.messageSend').input.properties.mode.enum, ['new', 'reply', 'replyAll', 'forward']);
  assert.equal(actions.get('mail.sync').input.properties.uidValidity.type, 'integer');
});

test('草稿与附件即使本机已有允许记录仍硬锁；原有发信仍遵守用户的开关', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('CREATE TABLE meta (k TEXT PRIMARY KEY,v TEXT)');
    const access = createAgentAccess(db);
    const actions = register();
    for (const suffix of ['attachmentDownload', 'draftList', 'draftGet', 'draftSave', 'draftDelete']) {
      const name = `mail.${suffix}`, def = actions.get(name);
      db.prepare('INSERT INTO meta(k,v) VALUES(?,?)').run(`config.wb-shell.actionAgent.${name}`, '1');
      assert.equal(access.effective(name, def), false, name);
      assert.throws(() => access.set(name, def, true), /永久禁止/);
      for (const origin of ['agent', 'plugin', 'sync', undefined]) {
        assert.throws(() => def.execute({ id: 'x', key: 'x', origin: 'ui' }, { origin }), /界面/, name);
      }
    }
    const name = 'mail.messageSend', def = actions.get(name);
    assert.equal(access.effective(name, def), false);
    access.set(name, def, true);
    assert.equal(access.effective(name, def), true);
    assert.deepEqual(def.execute(send, { origin: 'agent' }).inputs, [send]);
    assert.throws(() => def.execute(send, { origin: 'plugin' }), /界面/);
  } finally { db.close(); }
});
