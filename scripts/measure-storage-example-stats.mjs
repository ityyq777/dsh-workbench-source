/** Design-only measurement; never imports production modules or writes the database.
 * Node >=22.13 (node:sqlite). Run:
 * node scripts/measure-storage-example-stats.mjs --as-of=2026-11-09T12:30:00+08:00
 * Optional --db=/absolute/path --include-deleted --range=7|30|90|all --self-test
 * Fixed Asia/Shanghai calendar boundaries for this reproducible study (UTC+08, no DST).
 * Only 【示例】 storage rows and their live tags are read; URLs/remarks/IDs never printed.
 */
import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { homedir } from 'node:os';
import { resolve } from 'node:path';

const DAY = 86400000, OFFSET = 8 * 3600000;
const norm = (v) => String(v ?? '').normalize('NFKC').trim();
const number = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;
const units = ['瓶', '袋', '支', '盒', '包', '本', '卷', '个', '块'];
export function parseStock(raw, rawUnit) {
  const text = norm(raw), unit = norm(rawUnit);
  const result = (kind, lower, upper = lower) => ({ kind, lower, upper, exact: lower === upper });
  const atom = (s) => {
    if (s === '半' + unit && unit) return 0.5;
    const n = unit && s.endsWith(unit) ? s.slice(0, -unit.length) : s;
    return number.test(n) && Number.isFinite(Number(n)) ? Number(n) : null;
  };
  if (!text) return { kind: 'empty', exact: false };
  if (/^0\(待补充\)$/.test(text)) return result('annotatedZero', 0);
  const range = text.match(/^((?:0|[1-9]\d*)(?:\.\d+)?)\s*[~～-]\s*((?:0|[1-9]\d*)(?:\.\d+)?)$/);
  if (range) {
    const [a, b] = [Number(range[1]), Number(range[2])];
    if (a <= b && Number.isFinite(b)) return result('range', a, b);
    return { kind: 'invalidRange', exact: false };
  }
  const parts = text.split('+').map((s) => s.trim());
  const values = parts.map(atom);
  if (values.every((v) => v !== null) && Number.isFinite(values.reduce((a, b) => a + b, 0))) {
    return result(parts.length > 1 ? 'compound' : text.startsWith('半') ? 'half' : 'numeric', values.reduce((a, b) => a + b, 0));
  }
  return { kind: 'unrecognized', exact: false };
}
function selfTest() {
  for (const [s, u, kind, lower, upper] of [
    ['12', '支', 'numeric', 12, 12], ['1~2', '个', 'range', 1, 2],
    ['半包', '包', 'half', .5, .5], ['1瓶＋半瓶', '瓶', 'compound', 1.5, 1.5],
    ['0（待补充）', '副', 'annotatedZero', 0, 0], ['3~1', '个', 'invalidRange'],
    ['1瓶+半包', '瓶', 'unrecognized'], ['-1', '个', 'unrecognized'],
    ['', '个', 'empty'], ['约2', '个', 'unrecognized'], ['半瓶', '包', 'unrecognized'],
  ]) {
    const p = parseStock(s, u); assert.equal(p.kind, kind); assert.equal(p.lower, lower); assert.equal(p.upper, upper);
  }
  assert.equal(startDay(Date.parse('2026-11-08T16:00:00Z')), Date.parse('2026-11-08T16:00:00Z'));
  console.log('self-test: 11 parser cases and Shanghai day boundary passed (no DB opened)');
}
const dayKey = (ms) => new Date(ms + OFFSET).toISOString().slice(0, 10);
const startDay = (ms) => Math.floor((ms + OFFSET) / DAY) * DAY - OFFSET;
const validTime = (ms) => typeof ms === 'number' && Number.isFinite(ms) && ms > 0;
function bucket(ms, kind) {
  const d = new Date(ms + OFFSET);
  if (kind === 'month') return d.toISOString().slice(0, 7);
  if (kind === 'week') return dayKey(startDay(ms) - ((d.getUTCDay() + 6) % 7) * DAY);
  return dayKey(ms);
}
function counts(values) {
  const map = new Map(); for (const v of values) if (v) map.set(v, (map.get(v) || 0) + 1);
  return [...map].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count || (a.label < b.label ? -1 : a.label > b.label ? 1 : 0));
}
const args = process.argv.slice(2);
for (const arg of args) if (!/^(--db=.+|--as-of=.+|--range=(7|30|90|all)|--include-deleted|--self-test)$/.test(arg)) throw Error('Unknown argument: ' + arg);
if (args.includes('--self-test')) selfTest();
else {
  const value = (key, fallback) => args.find((a) => a.startsWith('--' + key + '='))?.split('=').slice(1).join('=') ?? fallback;
  const asOfText = value('as-of', '2026-11-09T12:30:00+08:00');
  if (!/(Z|[+-]\d{2}:\d{2})$/.test(asOfText)) throw Error('--as-of requires an explicit time zone');
  const asOf = Date.parse(asOfText); if (!Number.isFinite(asOf)) throw Error('Invalid --as-of');
  const range = value('range', 'all'), includeDeleted = args.includes('--include-deleted');
  const from = range === 'all' ? null : startDay(asOf) - (Number(range) - 1) * DAY;
  const inRange = (ms) => validTime(ms) && ms <= asOf && (from === null || ms >= from);
  const db = new DatabaseSync(resolve(value('db', homedir() + '/.dsh/workbench/workbench.db')), { readOnly: true });
  let rows, tags;
  try {
    // A read transaction fixes both SELECTs to the same SQLite snapshot; COMMIT writes no data.
    db.exec('BEGIN');
    rows = db.prepare("SELECT id,name,brand,unit,stock,img_list,CASE WHEN trim(remark)='' THEN 0 ELSE 1 END AS has_remark,created_at,updated_at,deleted_at FROM storage WHERE substr(name,1,4)='【示例】' ORDER BY name,id").all();
    assert.equal(rows.length, 16, 'Expected exactly 16 【示例】 rows; stop instead of widening scope');
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('tag','tag_mapping')").all();
    tags = tables.length === 2 ? db.prepare("SELECT DISTINCT s.id AS item_id,t.id AS tag_id,t.name FROM storage s JOIN tag_mapping m ON m.item_id=s.id AND m.item_type='storage' JOIN tag t ON t.id=m.tag_id WHERE substr(s.name,1,4)='【示例】' AND m.deleted_at IS NULL AND t.deleted_at IS NULL").all() : null;
    db.exec('COMMIT');
  } finally { db.close(); }
  const selected = rows.filter((r) => includeDeleted || r.deleted_at === null);
  const ids = new Set(selected.map((r) => r.id));
  const liveTags = tags?.filter((t) => ids.has(t.item_id));
  const tagGroups = new Map();
  for (const t of liveTags || []) { const g = tagGroups.get(t.tag_id) || { name: t.name, ids: new Set() }; g.ids.add(t.item_id); tagGroups.set(t.tag_id, g); }
  const imageInfo = (raw) => {
    try { const a = JSON.parse(raw); if (!Array.isArray(a)) return { count: 0, invalid: true };
      const valid = a.filter((x) => { try { const u = new URL(x); return typeof x === 'string' && ['http:', 'https:'].includes(u.protocol) && !u.username && !u.password; } catch { return false; } });
      return { count: valid.length, invalid: valid.length !== a.length };
    } catch { return { count: 0, invalid: true }; }
  };
  const measured = selected.map((r) => ({ ...r, parsed: parseStock(r.stock, r.unit), image: imageInfo(r.img_list) }));
  const pct = (n) => selected.length ? +(100 * n / selected.length).toFixed(2) : null;
  const exact = measured.filter((r) => r.parsed.exact), recognized = measured.filter((r) => r.parsed.lower !== undefined);
  const groups = counts(measured.map((r) => norm(r.unit)));
  const sumByUnit = groups.map(({ label: unit, count }) => {
    const rr = recognized.filter((r) => norm(r.unit) === unit);
    return { unit, records: count, recognized: rr.length, exactRecords: rr.filter((r) => r.parsed.exact).length, exactSubtotal: rr.filter((r) => r.parsed.exact).reduce((n, r) => n + r.parsed.lower, 0), lower: rr.reduce((n, r) => n + r.parsed.lower, 0), upper: rr.reduce((n, r) => n + r.parsed.upper, 0) };
  });
  const names = counts(measured.map((r) => norm(r.name).toLowerCase())).filter((r) => r.count > 1);
  const recent = measured.filter((r) => inRange(r.updated_at)).sort((a,b) => b.updated_at-a.updated_at || a.id.localeCompare(b.id)).slice(0,10).map((r) => ({ name:r.name, updatedAt:new Date(r.updated_at).toISOString() }));
  const unavailable = (reason) => ({ value: null, reason });
  const evidence = measured.map((r) => ({ name:r.name, brand:norm(r.brand), unit:norm(r.unit), stock:r.stock, parsed:r.parsed, images:r.image.count, hasRemark:!!r.has_remark, createdAt:r.created_at, updatedAt:r.updated_at, deleted:r.deleted_at!==null }));
  const report = {
    meta: { scope:'name prefix 【示例】 only', sourceRows:rows.length, asOf:asOfText, timeZone:'Asia/Shanghai', range, from:from===null?null:new Date(from).toISOString(), includeDeleted, parserVersion:1, evidenceSha256:createHash('sha256').update(JSON.stringify({evidence,tags:[...tagGroups.values()].map((g)=>({name:g.name,count:g.ids.size})).sort((a,b)=>a.name.localeCompare(b.name))})).digest('hex') },
    current: { total:selected.length, deleted:selected.filter((r)=>r.deleted_at!==null).length, brands:counts(measured.map((r)=>norm(r.brand))), units:groups,
      tagged:liveTags===undefined?null:new Set(liveTags.map((t)=>t.item_id)).size,
      tagCoverage:liveTags===undefined?null:pct(new Set(liveTags.map((t)=>t.item_id)).size),
      topTags:liveTags===undefined?null:[...tagGroups.values()].map((g)=>({name:g.name,count:g.ids.size})).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name)),
      withImages:measured.filter((r)=>r.image.count>0).length, imageCoverage:pct(measured.filter((r)=>r.image.count>0).length), multiImage:measured.filter((r)=>r.image.count>1).length, multiImageCoverage:pct(measured.filter((r)=>r.image.count>1).length),
      missingBrand:measured.filter((r)=>!norm(r.brand)).length, missingUnit:measured.filter((r)=>!norm(r.unit)).length, missingImages:measured.filter((r)=>!r.image.count).length, invalidImages:measured.filter((r)=>r.image.invalid).length, missingRemark:measured.filter((r)=>!r.has_remark).length,
      duplicateGroups:names.length, duplicateRecords:names.reduce((n,r)=>n+r.count,0), duplicateList:names,
      stale90:measured.filter((r)=>validTime(r.updated_at)&&r.updated_at<=asOf-90*DAY).length,
      staleList:measured.filter((r)=>validTime(r.updated_at)&&r.updated_at<=asOf-90*DAY).map((r)=>({name:r.name,days:Math.floor((asOf-r.updated_at)/DAY)})),
      updateAge:counts(measured.filter((r)=>validTime(r.updated_at)&&r.updated_at<=asOf).map((r)=>{const d=(asOf-r.updated_at)/DAY;return d<30?'0–29天':d<90?'30–89天':d<180?'90–179天':'180天及以上';})),
      invalidTimes:measured.filter((r)=>!validTime(r.created_at)||!validTime(r.updated_at)||r.created_at>asOf||r.updated_at>asOf||r.updated_at<r.created_at).length },
    time: { newInRange:measured.filter((r)=>inRange(r.created_at)).length, weeklyCreated:counts(measured.filter((r)=>inRange(r.created_at)).map((r)=>bucket(r.created_at,'week'))), monthlyCreated:counts(measured.filter((r)=>inRange(r.created_at)).map((r)=>bucket(r.created_at,'month'))), recent },
    textExperiment: { classes:counts(measured.map((r)=>r.parsed.kind)), recognized:recognized.length, recognizedPct:pct(recognized.length), exact:exact.length, exactPct:pct(exact.length), requiresRangeChoice:recognized.filter((r)=>!r.parsed.exact).length, unrecognized:measured.filter((r)=>r.parsed.lower===undefined).map((r)=>({name:r.name,stock:r.stock,reason:r.parsed.kind})), candidateZero:exact.filter((r)=>r.parsed.lower===0).length, sumByUnit, proposedNineUnitsCoverage:pct(measured.filter((r)=>units.includes(norm(r.unit))).length), outsideNineUnits:groups.filter((r)=>!units.includes(r.label)) },
    requiresNewFields: { confirmedStockByUnit:unavailable('stock_qty absent; text results are candidates only'), lowStock:unavailable('stock_qty/min_stock absent'), outOfStock:unavailable('stock_qty absent; candidateZero is not confirmed'), unquantifiedRecords:unavailable('stock_qty absent; migration would initialize all 16 to NULL'), unsetThreshold:unavailable('min_stock absent; migration would initialize all 16 to NULL'), categories:unavailable('category_id absent'), locations:unavailable('location_id absent'), lowByCategory:unavailable('category_id/stock_qty/min_stock absent') },
    examples:evidence,
  };
  console.log(JSON.stringify(report,null,2));
}
