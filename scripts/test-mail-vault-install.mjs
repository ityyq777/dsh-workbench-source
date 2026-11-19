#!/usr/bin/env node
/** 在临时 HOME 验证邮件单包安装。可选参数：邮件与保险箱的安装 spec（默认仓库本地包）。 */
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';

const pkg = id => 'file:' + fileURLToPath(new URL(`../packages/addons/${id}`, import.meta.url));
const [mail = pkg('mail'), vault = pkg('vault')] = process.argv.slice(2);
const cli = process.env.DSH_CLI || '/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh';
const scratch = mkdtempSync(join(realpathSync(tmpdir()), 'wb-mail-deps-'));
const dshHome = join(scratch, '.dsh');
const base = { ...process.env, HOME: scratch, DSH_HOME: dshHome };
for (const key of ['DSH_PROFILE_DIR', 'DSH_PROFILE', 'DSH_SESSION_ID', 'DSH_WEB_URL']) delete base[key];
const json = path => JSON.parse(readFileSync(path, 'utf8'));
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const rows = (dump, id) => [...dump.matchAll(new RegExp(`^\\s*- id: ${id}\\s*$`, 'gm'))].length;

async function runtime(profile, env, stage, groupId) {
  const snapshot = join(scratch, `${profile}-${stage}.json`);
  const child = spawn(cli, ['--profile', profile, '--patch', join(scratch, 'observe.yml'), '--port', '0', '--no-open'], { env: { ...env, WB_PROBE: snapshot }, cwd: scratch, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
  const closed = once(child, 'close');
  let output = '';
  for (const pipe of [child.stdout, child.stderr]) pipe.on('data', data => { output = (output + data).slice(-100000); });
  try {
    const deadline = Date.now() + 45000;
    let url;
    while (!(url = output.match(/http:\/\/127\.0\.0\.1:\d+\/\?token=[\w-]+/)?.[0])) {
      if (child.exitCode !== null || Date.now() > deadline) throw Error('临时实例启动失败：' + output.slice(-800).replace(/token=[\w-]+/g, 'token=***'));
      await delay(100);
    }
    const auth = await fetch(url, { redirect: 'manual' });
    const cookie = auth.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');
    assert.ok(cookie, '无法建立临时实例会话');
    const api = async (path, method = 'GET', body = {}) => {
      const res = await fetch(new URL('/workbench/api/' + path, url), { method, headers: { cookie, 'content-type': 'application/json' }, ...(method === 'POST' ? { body: JSON.stringify(body) } : {}) });
      assert.equal(res.status, 200, path);
      const data = await res.json(); assert.equal(data.ok, true, path); return data;
    };
    const seed = stage === 'seed';
    const { domains, shellVersion } = await api('domains');
    const disabled = profile === 'vault-disabled';
    if (disabled) assert(!domains.some(d => d.id === 'wb-addon-vault' && d.enabled && !d.error));
    else {
      assert.deepEqual(domains.map(d => d.id).sort(), seed ? ['wb-addon-vault'] : ['wb-addon-mail', 'wb-addon-vault']);
      for (const d of domains) assert(d.enabled && !d.error && d.views?.length > 0, d.id + ': ' + d.error);
      if (!seed) await api('domains/wb-addon-mail/actions/mail.status', 'POST');
      await api('domains/wb-addon-vault/actions/vault.status', 'POST');
    }
    const expected = seed ? ['workbench', 'workbench-vault'] : ['workbench', 'workbench-mail', 'workbench-vault'];
    let entries = [];
    while (Date.now() <= deadline) {
      try { entries = json(snapshot); } catch { /* 首次盘点尚未生成 */ }
      if (entries.length >= expected.length) break;
      await delay(80);
    }
    assert.deepEqual(entries.map(e => e.id).sort(), expected, '运行中的 Loader 须复用相同 id 的行');
    if (profile === 'vault-first') assert.equal(entries.find(e => e.id === 'workbench-vault').marker, 'keep-existing-vault-config', '生效行必须保留 profile 配置');
    if (disabled) {
      assert.equal(entries.find(e => e.id === 'workbench-vault').disabled, true);
      console.log(`${profile} PASS: 用户禁用的保险箱仍未启动，Loader 行 disabled=true`);
      return;
    }
    const groupName = 'dependency-install-regression';
    if (seed) return (await api('domains/wb-addon-vault/actions/vault.groupCreate', 'POST', { name: groupName })).result.id;
    if (groupId) {
      const { result } = await api('domains/wb-addon-vault/actions/vault.groupList', 'POST', { q: groupName });
      assert.deepEqual(result.items.map(g => [g.id, g.name]), [[groupId, groupName]]);
    }
    console.log(`${profile} PASS: host@${shellVersion}; ` + domains.map(d => `${d.id}@${d.version} (${d.views.length} views)`).join(', ') + '; 独立 Loader 行与 mail.status/vault.status 均通过' + (groupId ? '；生效配置、原分组同 id 均保留' : ''));
  } finally {
    if (child.exitCode === null && child.signalCode === null && child.pid) process.kill(-child.pid, 'SIGTERM');
    await closed;
  }
}

async function scenario(profile, existing) {
  const profileDir = join(dshHome, 'profiles', profile);
  const env = { ...base, WB_HOME: join(scratch, profile + '-data') };
  const run = args => execFileSync(cli, args, { env, cwd: scratch, encoding: 'utf8', timeout: 120000, stdio: ['ignore', 'pipe', 'pipe'] });
  const dump = () => run(['--profile', profile, '--dump-config']);
  const add = spec => run(['plugin', '--profile', profile, 'add', spec]);
  run(['--profile', profile, '--from-default-profile', 'web', '--dump-config']);
  const manifest = () => json(join(profileDir, 'package.json'));
  const patch = join(profileDir, 'cordis.patch.yml');
  let custom, vaultDep, groupId;
  if (existing) {
    add(vault);
    custom = '- id: workbench-vault\n  config:\n    verificationMarker: keep-existing-vault-config\n';
    if (profile === 'vault-disabled') custom += '  disabled: true\n';
    writeFileSync(patch, custom);
    assert.match(dump(), /verificationMarker: keep-existing-vault-config/);
    vaultDep = manifest().dependencies['dsh-workbench-vault']; assert(vaultDep);
    if (profile !== 'vault-disabled') { groupId = await runtime(profile, env, 'seed'); assert(groupId, '临时保险箱分组须构造成功'); }
  }
  const before = manifest().dsh.profile.bundles;
  add(mail);
  assert.deepEqual(manifest().dsh.profile.bundles, [...before, 'dsh-workbench-mail']);
  if (existing) {
    assert.equal(readFileSync(patch, 'utf8'), custom);
    assert.equal(manifest().dependencies['dsh-workbench-vault'], vaultDep);
  } else assert(!manifest().dependencies['dsh-workbench-vault'], '新 profile 不应要求直接安装保险箱');
  const config = dump();
  if (existing) assert.match(config, /verificationMarker: keep-existing-vault-config/);
  await runtime(profile, env, 'installed', groupId);
  for (const id of ['workbench', 'workbench-vault', 'workbench-mail']) assert(rows(config, id) >= 1);
}

try {
  mkdirSync(dshHome, { recursive: true });
  // dump-config 展示 bundle 层；用额外的只读测试探针记录实际 Loader 行与哨兵，不记录其它配置。
  writeFileSync(join(scratch, 'observe.yml'), '- insert:\n    - id: test-observer\n      name: ./observe.cjs\n');
  writeFileSync(join(scratch, 'observe.cjs'), `const fs = require('node:fs');
exports.apply = ctx => { ctx.effect(() => {
  const timer = setInterval(() => { const rows = [...ctx.loader.entries()].filter(e => ['workbench','workbench-vault','workbench-mail'].includes(e.options.id));
  fs.writeFileSync(process.env.WB_PROBE, JSON.stringify(rows.map(e => ({ id:e.options.id, marker:e.options.config?.verificationMarker, disabled:e.options.disabled === true })))); }, 100);
  return () => clearInterval(timer); }); };`);
  await scenario('mail-alone', false);
  await scenario('vault-first', true);
  await scenario('vault-disabled', true);
} finally {
  assert.equal(dirname(realpathSync(scratch)), realpathSync(tmpdir()));
  assert(basename(scratch).startsWith('wb-mail-deps-'));
  rmSync(scratch, { recursive: true, force: true });
}
