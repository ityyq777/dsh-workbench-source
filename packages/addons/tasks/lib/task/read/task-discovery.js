import { DIFFICULTY_GUIDANCE } from "../model/task-difficulty.js";
import { createHash } from 'node:crypto';
import { nodeMap } from '../../db/db.js';
import { tagsAvailable } from '../../tagging/tagging.js';
import { ownershipError, pathFromMap } from '../model/task-ownership-path.js';

export const GUIDANCE = [
  DIFFICULTY_GUIDANCE,
  '已有具体开发、修复、设计任务：先核对职责、完整路径与描述，显式 domain→tableId 映射优先，选择后带 tableId 创建。',
  '已确认的新子模块：先核对组/表形态，无合适表且获授权才用 tablePath + createMissing:true + pathDescriptions；不要每条任务新建表。',
  '一次性问答、临时查询不建任务；物品登记走 storage.create，开发 storage 功能才走 tasks。',
  '目标不确定或多候选：展示路径与描述请用户选；唯一候选也仅建议核对，不按第一项、热度或分数自动写入。',
];
export function tableCatalog(db, api) {
  const map = nodeMap(db), tables = [], diagnostics = [];
  const tagDomainAvailable = tagsAvailable(db, api);
  for (const row of map.values()) {
    if (row.deleted_at != null || String(row.type) !== '1') continue;
    let path;
    try { path = pathFromMap(row.id, map); }
    catch (error) { diagnostics.push({ id: String(row.id), code: error.code, message: error.message }); continue; }
    const counts = db.prepare("SELECT COUNT(*) AS total, SUM(CASE WHEN status='0' THEN 1 ELSE 0 END) AS active, MAX(updated_at) AS used FROM task WHERE table_id=? AND deleted_at IS NULL").get(String(row.id));
    const commonTags = tagDomainAvailable ? db.prepare("SELECT g.id,g.name,COUNT(DISTINCT t.id) AS count FROM task t JOIN tag_mapping m ON m.item_type='task' AND m.item_id=t.id AND m.deleted_at IS NULL JOIN tag g ON g.id=m.tag_id AND g.deleted_at IS NULL WHERE t.table_id=? AND t.deleted_at IS NULL GROUP BY g.id,g.name ORDER BY count DESC,g.id ASC LIMIT 5").all(String(row.id)).map(g => ({ id: String(g.id), name: g.name, count: Number(g.count) })) : [];
    tables.push({ id: String(row.id), name: row.name, ...path, description: String(row.description || ''), taskCount: Number(counts.total), activeTaskCount: Number(counts.active || 0), lastUsedAt: counts.used == null ? null : Number(counts.used), lastUsedBasis: 'MAX(updated_at) of non-deleted tasks; not reading/access time', commonTags, commonTagsStatus: tagDomainAvailable ? 'available' : 'unavailable' });
  }
  tables.sort((candidateA,candidateB) => candidateA.id < candidateB.id ? -1 : candidateA.id > candidateB.id ? 1 : 0);
  return { tables, diagnostics, tagDomainAvailable };
}
// 规则 v1：有限停用短语与显式同义词，不声称自然语言语义理解。
export const MATCH_RULE_VERSION = 'terms-v1';
const SYNONYMS = [['存储', 'storage'], ['任务', 'tasks'], ['标签', 'tags'], ['站点', 'sites']];
function termsOf(query) {
  const cleaned = query.toLowerCase().replace(/相关的|相关|的待办|待办|请帮我|帮我|我要|一个|任务$/g, ' ').trim();
  const terms = cleaned.split(/[\s,，。;；]+/).filter(Boolean);
  for (const pair of SYNONYMS) if (pair.some(s => cleaned.includes(s))) for (const s of pair) if (!terms.includes(s)) terms.push(s);
  return terms;
}
export function resolveTable(db, args, api) {
  if (typeof args.query !== 'string' || !args.query.trim()) throw ownershipError('INVALID_QUERY', 'query 必须是非空字符串');
  const query = args.query.trim(), terms = termsOf(query);
  const limit = limitArg(args.limit, 5, 20);
  const catalog = tableCatalog(db, api);
  const candidates = [];
  for (const table of catalog.tables) {
    const matchedOn = [], reasons = [];
    let score = 0;
    if (table.name.toLowerCase() === query.toLowerCase()) { score = 1000; matchedOn.push('nameExact'); reasons.push('表名精确匹配'); }
    for (const [field, text, weight] of [['name', table.name, 100], ['path', table.path, 30], ['description', table.description, 10], ['commonTags', table.commonTags.map(g => g.name).join(' '), 3]]) {
      const hits = terms.filter(term => String(text).toLowerCase().includes(term));
      if (hits.length) { score += weight; matchedOn.push(field); reasons.push(field + ' 词项匹配：' + hits.join('、')); }
    }
    if (score) candidates.push({ ...table, score, matchedOn, reasons });
  }
  candidates.sort((candidateA,candidateB) => candidateB.score-candidateA.score || (candidateB.lastUsedAt || 0)-(candidateA.lastUsedAt || 0) || (candidateA.id < candidateB.id ? -1 : candidateA.id > candidateB.id ? 1 : 0));
  return { candidates: candidates.slice(0,limit), total: candidates.length, truncated: candidates.length > limit, needsSelection: true, matchMethod: 'deterministic-terms', matchRuleVersion: MATCH_RULE_VERSION, diagnostics: catalog.diagnostics, guidance: candidates.length ? GUIDANCE : [...GUIDANCE, '无匹配；请改词或确认新路径后再创建。'] };
}
function limitArg(value, fallback, max) {
  if (value === undefined) return fallback;
  if (!Number.isInteger(value) || value < 1) throw ownershipError('INVALID_LIMIT', 'limit 必须是正整数');
  return Math.min(max, value);
}
export function taskCapabilities(db, args, api) {
  const { tables, diagnostics, tagDomainAvailable } = tableCatalog(db, api);
  const limit = limitArg(args.limit, 50, 200);
  if (args.tableId !== undefined) {
    if (args.cursor !== undefined) throw ownershipError('INVALID_TARGET_OPTIONS', 'tableId 与 cursor 互斥');
    const row = db.prepare('SELECT * FROM task_node WHERE id=? AND deleted_at IS NULL').get(String(args.tableId));
    if (!row) throw ownershipError('TABLE_NOT_FOUND', '任务表不存在：' + args.tableId);
    if (String(row.type) !== '1') throw ownershipError('TARGET_NOT_TABLE', '目标不是任务表：' + args.tableId);
    pathFromMap(row.id, nodeMap(db));
    return { guidance: GUIDANCE, tables: tables.filter(t => t.id === String(args.tableId)), total: 1, nextCursor: null, truncated: false, tagDomainAvailable, diagnostics };
  }
  const fingerprint = createHash('sha256').update(JSON.stringify(tables)).digest('hex');
  let offset = 0;
  if (args.cursor !== undefined) {
    try {
      const cursor = JSON.parse(Buffer.from(args.cursor, 'base64url').toString());
      if (cursor.fingerprint !== fingerprint || !Number.isInteger(cursor.offset) || cursor.offset < 1 || cursor.offset >= tables.length) throw new Error('stale');
      offset = cursor.offset;
    } catch { throw ownershipError('INVALID_CURSOR', '游标已失效，请不带 cursor 重新查询 tasks.capabilities'); }
  }
  const end = Math.min(offset + limit, tables.length);
  return { guidance: GUIDANCE, tables: tables.slice(offset,end), total: tables.length, nextCursor: end < tables.length ? Buffer.from(JSON.stringify({ fingerprint, offset: end })).toString('base64url') : null, truncated: end < tables.length, tagDomainAvailable, diagnostics };
}
export function registerDiscoveryActions(api) {
  api.action('tasks.capabilities', {
    description: '只读任务归属发现：先核对职责、路径再创建。分页不能当作全部表；tableId 精确查询与 cursor 互斥。' + GUIDANCE.join(' '),
    input: { type: 'object', properties: { limit: { type: 'integer', minimum: 1, description: '默认50，最大200' }, cursor: { type: 'string', description: '上一页 nextCursor；失效时重新查询' }, tableId: { type: ['string','number'], description: '精确验证存活任务表与完整祖先链；与cursor互斥' } } },
    execute: args => taskCapabilities(api.db, args || {}, api), render: result => JSON.stringify(result),
  });
  api.action('tasks.resolveTable', {
    description: '只读候选检索，确定性词项匹配（非语义推断），只返回合法任务表；即使唯一候选也需核对，不自动创建。' + GUIDANCE.join(' '),
    input: { type: 'object', required: ['query'], properties: { query: { type: 'string', minLength: 1, description: '任务主题，SQL通配符按文字匹配' }, limit: { type: 'integer', minimum: 1, description: '默认5，最大20' } } },
    execute: args => resolveTable(api.db, args || {}, api), render: result => JSON.stringify(result),
  });
}
