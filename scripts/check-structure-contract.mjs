#!/usr/bin/env node
/** Offline structural-refactor guard. Only the explicit baseline and a disposable WB_HOME are written.
 * node scripts/check-structure-contract.mjs --save /tmp/wb-structure-863a7e8.json
 * node scripts/check-structure-contract.mjs [--check] [/tmp/wb-structure-863a7e8.json]
 * Rebuild the host before checking changes to TypeScript sources. No audit script is imported.
 */
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_BASELINE = '/tmp/wb-structure-863a7e8.json';
const ADDONS = ['tasks', 'tags', 'sites', 'storage'];

function options(argv) {
  const mode = argv[0] === '--save' ? 'save' : 'check';
  if (argv[0] === '--save' || argv[0] === '--check') argv = argv.slice(1);
  if (argv.length > 1 || argv.some(arg => arg.startsWith('--')) || (mode === 'save' && !argv[0])) {
    throw new Error('Usage: check-structure-contract.mjs --save <baseline> | [--check] [baseline]');
  }
  return { mode, file: resolve(argv[0] ?? DEFAULT_BASELINE) };
}

// Sort object keys only: schema arrays (examples, tuples, enum order) remain part of the contract.
function canonical(value, temporaryHome) {
  if (Array.isArray(value)) return value.map(item => canonical(item, temporaryHome));
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key], temporaryHome)]));
  if (typeof value === 'string' && temporaryHome) return value.split(temporaryHome).join('<WB_HOME>');
  return value;
}
const by = key => (a, b) => String(a[key]) < String(b[key]) ? -1 : String(a[key]) > String(b[key]) ? 1 : 0;

async function capture() {
  const previousHome = process.env.WB_HOME;
  const home = mkdtempSync(join(tmpdir(), 'wb-structure-contract-'));
  process.env.WB_HOME = home; // Must precede dynamic import: the host captures this at module evaluation.
  const cleanups = [];
  let host;
  const ctx = {
    webServer: { register: () => () => {} },
    tools: { register: () => () => {} },
    connection: { requestRejection: () => undefined },
    systemPrompt: { section: () => () => {}, getSectionOrder: () => 500 },
    commands: { register: () => () => {} },
    agents: { get: () => undefined },
    provide(name, value) { if (name === 'workbench') host = value; },
    effect(fn) { const dispose = fn(); if (typeof dispose === 'function') cleanups.push(dispose); },
  };
  try {
    const shell = await import(pathToFileURL(join(ROOT, 'packages/shell/lib/index.js')).href);
    await shell.apply(ctx);
    if (!host) throw new Error('Host did not provide workbench');
    for (const name of ADDONS) {
      const addon = await import(pathToFileURL(join(ROOT, 'packages/addons', name, 'lib/index.js')).href);
      await addon.apply({ workbench: host, effect: ctx.effect });
    }
    const domains = host.listDomains();
    if (domains.length !== ADDONS.length || domains.some(domain => !domain.enabled || domain.error)) {
      throw new Error('All four addons must load: ' + JSON.stringify(domains));
    }
    const actionNames = host.actionNames().sort(by('name'));
    const response = await host.invoke('actions.list', { detail: true }, 'agent');
    const actionsList = response.result;
    if (!Array.isArray(actionsList?.actions) || !actionsList.actions.length) throw new Error('actions.list returned no detailed actions');
    actionsList.actions.sort(by('name'));
    actionsList.domains.sort(by('id'));
    // Exclude rootpage and seeded business rows: those are runtime storage, not schema contracts.
    const sqliteMaster = host.db.prepare("SELECT type,name,tbl_name,sql FROM sqlite_master WHERE type IN ('table','index') ORDER BY type,name").all();
    return canonical({ formatVersion: 1, actionNames, actionsList, sqliteMaster }, home);
  } finally {
    const errors = [];
    for (const cleanup of cleanups.reverse()) { try { await cleanup(); } catch (error) { errors.push(error); } }
    try { host?.db.close(); } catch (error) { errors.push(error); }
    if (previousHome === undefined) delete process.env.WB_HOME; else process.env.WB_HOME = previousHome;
    // home is the exact absolute directory returned by mkdtempSync above, never a user-selected path.
    try { rmSync(home, { recursive: true, force: true }); } catch (error) { errors.push(error); }
    if (errors.length) throw new AggregateError(errors, 'Contract capture shutdown failed');
  }
}

function differences(expected, actual, path = '$', out = []) {
  if (JSON.stringify(expected) === JSON.stringify(actual)) return out;
  const expectedObject = expected !== null && typeof expected === 'object';
  const actualObject = actual !== null && typeof actual === 'object';
  if (expectedObject && actualObject && Array.isArray(expected) === Array.isArray(actual)) {
    for (const key of [...new Set([...Object.keys(expected), ...Object.keys(actual)])].sort()) differences(expected[key], actual[key], path + '[' + JSON.stringify(key) + ']', out);
  } else out.push({ path, expected, actual });
  return out;
}

try {
  const { mode, file } = options(process.argv.slice(2));
  const actual = await capture();
  if (mode === 'save') {
    // Never silently overwrite a known-good baseline. Baselines contain full schemas; keep private.
    writeFileSync(file, JSON.stringify(actual, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    console.log('Structure contract saved: ' + file);
  } else {
    const expected = canonical(JSON.parse(readFileSync(file, 'utf8')));
    if (expected.formatVersion !== 1) throw new Error('Unsupported baseline formatVersion');
    const changes = differences(expected, actual);
    if (changes.length) {
      for (const change of changes.slice(0, 30)) console.error(JSON.stringify(change));
      throw new Error('Structure contract changed: ' + changes.length + ' field differences (showing at most 30)');
    }
    console.log('Structure contract PASS: ' + file);
  }
  console.log(JSON.stringify({ actionNames: actual.actionNames.length, detailedActions: actual.actionsList.actions.length, tables: actual.sqliteMaster.filter(row => row.type === 'table').length, indexes: actual.sqliteMaster.filter(row => row.type === 'index').length }));
} catch (error) {
  console.error(error.stack ?? String(error));
  process.exitCode = 1; // Never force exit: leaked timers must remain visible to the test runner.
}
