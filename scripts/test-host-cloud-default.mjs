// 通过宿主启动入口、SQLite 和真实 HTTP 路由验证默认模式与重新加载；出站请求只交给本地桩。
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const home = mkdtempSync(join(realpathSync(tmpdir()), 'wb-cloud-default-'));
process.env.WB_HOME = home;
const accessToken = randomUUID();
const secret = randomUUID();
const requests = [];
const fetchBefore = globalThis.fetch;
globalThis.fetch = async (url, options) => { requests.push({ url: String(url), authorized: new Headers(options?.headers).has("authorization") }); return Response.json({ ok: true }); };
const shell = await import('../packages/shell/lib/index.js');
let handler;
let cleanup = [];
function stop() { for (const dispose of cleanup.reverse()) dispose(); cleanup = []; }
function boot() {
  stop();
  shell.apply({
    webServer: { register(route) { handler = route.handler; return () => {}; } }, tools: { register() {} },
    connection: { requestRejection() {} }, provide() {}, effect(fn) { const dispose = fn(); if (typeof dispose === 'function') cleanup.push(dispose); },
  });
}
async function call(path, body) {
  let status, result;
  await handler({ method: body ? 'POST' : 'GET', url: '/workbench/api/' + path, headers: {}, async *[Symbol.asyncIterator]() { if (body) yield Buffer.from(JSON.stringify(body)); } },
    { writeHead(code) { status = code; }, end(chunk) { const text = String(chunk); assert.ok(!text.includes(accessToken) && !text.includes(secret), '路由响应须脱敏'); result = JSON.parse(text); } });
  assert.equal(status, 200);
  return result;
}
const file = join(home, 'cloud-config.json');
const credsFile = join(home, 'cloud-creds.json');
async function check(mode, loggedIn) { const cfg = await call('cloud/config'); assert.equal(cfg.mode, mode); assert.equal(cfg.logged_in, loggedIn); }
try {
  boot();
  await check('none', false);
  await call('account'); await call('sync/status'); await call('cloud/test', {});
  assert.equal(requests.length, 0); assert.equal(existsSync(file), false);
  writeFileSync(credsFile, '{}'); boot(); await check('none', false);
  writeFileSync(credsFile, JSON.stringify({ accessToken, refreshToken: '', deviceId: 'device', userId: 'user' }), { mode: 0o600 });
  boot(); await check('shared', true);
  writeFileSync(file, '{'); boot(); await check('none', false);
  writeFileSync(file, JSON.stringify({ mode: 'unknown' })); boot(); await check('none', false);
  await call('cloud/config', { mode: 'shared' }); boot(); await check('shared', true);
  const beforeProbe = requests.length;
  await call('cloud/test', { mode: 'private', private: { url: 'https://new.invalid' } });
  assert.deepEqual(requests.slice(beforeProbe).filter(r => new URL(r.url).hostname === 'new.invalid'), [{ url: 'https://new.invalid/v1/health', authorized: false }], '新地址仅探测健康状态');
  await call('cloud/config', { mode: 'private', private: { url: 'https://private.invalid', secret } });
  boot(); await check('private', true);
  await call('cloud/config', { mode: 'none' }); boot(); await check('none', false);
  console.log('云端启动模式与真实路由回归通过');
} finally {
  stop(); globalThis.fetch = fetchBefore;
  if (dirname(realpathSync(home)) === realpathSync(tmpdir()) && home.includes('/wb-cloud-default-')) rmSync(home, { recursive: true, force: true });
}
