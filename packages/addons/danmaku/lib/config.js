"use strict";
// 配置项定义与读写：配置不建表，沿用宿主 meta 表的 `config.<domain>.<id>` 键。

import { tableExists } from "./db/db.js";

export const DOMAIN = "wb-addon-danmaku";
export const SCHEMA_VERSION = 1;

export const GROUPS = [
  { id: "player", zh: "播放", en: "Playback" },
  { id: "look", zh: "外观", en: "Appearance" },
  { id: "desktop", zh: "桌面", en: "Desktop" },
];

export const ITEMS = [
  {
    id: "enabled",
    group: "player",
    type: "bool",
    surface: "ui",
    apply: "runtime",
    default: true,
    zh: "启用弹幕",
    en: "Enabled",
    hintZh: "关掉后界面层和桌面层都不再出现弹幕，库里的内容保留。",
    hintEn: "Turns off both the in-app and desktop layers; the library is kept.",
  },
  {
    id: "surface",
    group: "player",
    type: "enum",
    surface: "ui",
    apply: "runtime",
    default: "dsh",
    zh: "显示位置",
    en: "Surface",
    values: [
      { value: "dsh", zh: "仅 DSH 窗口", en: "DSH window only" },
      { value: "desktop", zh: "仅桌面", en: "Desktop only" },
      { value: "both", zh: "DSH 窗口 + 桌面", en: "Both" },
      { value: "none", zh: "都不显示", en: "Nowhere" },
    ],
    hintZh: "DSH 窗口层始终跟随应用；选「桌面」或「两端」会启动独立透明窗覆盖所有屏幕，首次可能需要下载 Electron 运行时。",
    hintEn: "The DSH layer follows the app window; Desktop or Both starts a transparent always-on-top layer (may download the Electron runtime on first use).",
  },
  {
    id: "intervalMs",
    group: "player",
    type: "int",
    surface: "ui",
    apply: "runtime",
    default: 1400,
    min: 400,
    max: 10000,
    zh: "出现间隔（毫秒）",
    en: "Interval (ms)",
    hintZh: "两条弹幕之间的间隔；库越小越密。",
    hintEn: "Gap between two danmaku; a small library feels denser.",
  },
  {
    id: "order",
    group: "player",
    type: "enum",
    surface: "ui",
    apply: "runtime",
    default: "shuffle",
    zh: "轮播顺序",
    en: "Order",
    values: [
      { value: "shuffle", zh: "随机（每轮不重复）", en: "Shuffle (no repeat per round)" },
      { value: "sequence", zh: "按列表顺序", en: "List order" },
    ],
    hintZh: "随机模式用洗牌袋：一轮内每条只出现一次。",
    hintEn: "Shuffle uses a bag: each line appears once per round.",
  },
  {
    id: "speed",
    group: "look",
    type: "int",
    surface: "ui",
    apply: "runtime",
    default: 150,
    min: 40,
    max: 500,
    zh: "滚动速度（像素/秒）",
    en: "Speed (px/s)",
    hintZh: "速度恒定，长句停留更久，不会被「挤快」。",
    hintEn: "Constant speed, so longer lines take longer to cross.",
  },
  {
    id: "lanes",
    group: "look",
    type: "int",
    surface: "ui",
    apply: "runtime",
    default: 7,
    min: 1,
    max: 12,
    zh: "泳道数",
    en: "Lanes",
    hintZh: "同时最多这么多行；屏幕矮时会自动压缩行高。",
    hintEn: "How many rows can be in flight; lane height shrinks on short screens.",
  },
  {
    id: "band",
    group: "look",
    type: "enum",
    surface: "ui",
    apply: "runtime",
    default: "full",
    zh: "分布区域",
    en: "Band",
    values: [
      { value: "full", zh: "整屏", en: "Whole screen" },
      { value: "upper", zh: "上半屏", en: "Upper half" },
      { value: "lower", zh: "下半屏", en: "Lower half" },
    ],
    hintZh: "只想当氛围时用整屏；不想压住内容时用上半屏或下半屏。",
    hintEn: "Whole screen is ambient; a half band keeps content readable.",
  },
  {
    id: "fontSize",
    group: "look",
    type: "int",
    surface: "ui",
    apply: "runtime",
    default: 15,
    min: 11,
    max: 28,
    zh: "字号（像素）",
    en: "Font size (px)",
    hintZh: "配合透明度使用，桌面层会一起跟随。",
    hintEn: "Works with opacity; the desktop layer follows too.",
  },
  {
    id: "opacity",
    group: "look",
    type: "number",
    surface: "ui",
    apply: "runtime",
    default: 0.92,
    min: 0.2,
    max: 1,
    zh: "不透明度",
    en: "Opacity",
    hintZh: "0.2 很淡，1 完全不透明。",
    hintEn: "0.2 is faint, 1 is fully opaque.",
  },
  {
    id: "motion",
    group: "look",
    type: "enum",
    surface: "ui",
    apply: "runtime",
    default: "auto",
    zh: "动效",
    en: "Motion",
    values: [
      { value: "auto", zh: "跟随系统（减少动态时静止淡出）", en: "Follow system (fade when reduced motion)" },
      { value: "off", zh: "直接淡出", en: "Always fade" },
    ],
    hintZh: "系统开启「减少动态效果」时，弹幕改为原地淡入淡出。",
    hintEn: "With reduced motion, lines fade in place instead of flying.",
  },
  {
    id: "pauseOnInput",
    group: "look",
    type: "bool",
    surface: "ui",
    apply: "runtime",
    default: true,
    zh: "打字时暂停",
    en: "Pause while typing",
    hintZh: "在输入框里打字时暂停，停手 3 秒或移开焦点后自动继续；只是点一下输入框不会暂停。",
    hintEn: "Pauses while you type, resumes 3s after you stop or when focus leaves. Clicking an input alone does not pause.",
  },
  {
    id: "desktopDisplays",
    group: "desktop",
    type: "enum",
    surface: "ui",
    apply: "desktop",
    default: "all",
    zh: "覆盖屏幕",
    en: "Displays",
    values: [
      { value: "all", zh: "全部屏幕", en: "All displays" },
      { value: "primary", zh: "仅主屏", en: "Primary only" },
    ],
    hintZh: "每块屏幕开一个透明窗，均置顶、鼠标穿透。修改后自动重启桌面层。",
    hintEn: "One transparent window per display; restart applies changes.",
  },
];

const ITEM_BY_ID = new Map(ITEMS.map((item) => [item.id, item]));

export const SCHEME_TABLE = "danmaku_config_scheme";
const ACTIVE_KEY = "configScheme.danmaku.active";
const DEFAULT_SCHEME_NAME = "本机配置";

function ensureMeta(db) {
  if (!tableExists(db, "meta")) db.exec("CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL);");
}

function tx(db, fn) {
  db.exec("BEGIN IMMEDIATE");
  try { const out = fn(); db.exec("COMMIT"); return out; }
  catch (error) { try { db.exec("ROLLBACK"); } catch { /* ignore */ } throw error; }
}

function coerceValue(item, raw) {
  const got = coerce(item, raw);
  if (got.warning) throw new Error(got.warning);
  return got.value;
}

function keyOf(id) {
  return `config.${DOMAIN}.${id}`;
}

function metaRows(db) {
  if (!tableExists(db, "meta")) return [];
  return db.prepare(`SELECT k, v FROM meta WHERE k LIKE 'config.${DOMAIN}.%'`).all();
}

function metaSet(db, key, value) {
  db.prepare("INSERT INTO meta(k, v) VALUES(?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").run(key, String(value));
}

function metaDelete(db, key) {
  db.prepare("DELETE FROM meta WHERE k = ?").run(key);
}

function coerce(item, raw) {
  if (raw === undefined || raw === null) return { value: item.default, warning: "" };
  if (item.type === "bool") {
    if (typeof raw === "boolean") return { value: raw };
    const text = String(raw).toLowerCase();
    if (text === "true" || text === "1" || text === "on") return { value: true };
    if (text === "false" || text === "0" || text === "off") return { value: false };
    return { value: item.default, warning: `${item.id}: 需要布尔值` };
  }
  if (item.type === "int" || item.type === "number") {
    const num = Number(raw);
    if (!Number.isFinite(num)) return { value: item.default, warning: `${item.id}: 需要数字` };
    const min = item.min === undefined ? num : item.min;
    const max = item.max === undefined ? num : item.max;
    const bounded = Math.min(max, Math.max(min, num));
    return { value: item.type === "int" ? Math.round(bounded) : bounded };
  }
  if (item.type === "enum") {
    const allowed = (item.values || []).map((option) => option.value);
    return allowed.includes(raw) ? { value: raw } : { value: item.default, warning: `${item.id}: 取值不在选项内` };
  }
  return { value: String(raw) };
}

export function publicItem(item) {
  return {
    id: item.id,
    group: item.group,
    type: item.type,
    surface: item.surface,
    default: item.default,
    min: item.min,
    max: item.max,
    values: item.values,
    zh: item.zh,
    en: item.en,
    hintZh: item.hintZh,
    hintEn: item.hintEn,
  };
}


/** 当前设备选中的方案 id（只存 meta，不同步）。 */
function activeSchemeId(db) {
  if (!tableExists(db, "meta")) return "";
  const row = db.prepare("SELECT v FROM meta WHERE k=?").get("configScheme.danmaku.active");
  return row ? String(row.v) : "";
}

function ensureSchemeTable(db) {
  db.exec("CREATE TABLE IF NOT EXISTS danmaku_config_scheme (id TEXT PRIMARY KEY, name TEXT NOT NULL, data TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, deleted_at INTEGER, rev INTEGER NOT NULL DEFAULT 1)");
}

function newSchemeId() {
  return "cs_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function schemeRow(db, id) {
  if (!id || !tableExists(db, "danmaku_config_scheme")) return null;
  return db.prepare("SELECT * FROM danmaku_config_scheme WHERE id=? AND deleted_at IS NULL").get(String(id)) || null;
}

function listSchemes(db) {
  if (!tableExists(db, "danmaku_config_scheme")) return [];
  return db.prepare("SELECT id,name,created_at,updated_at,rev FROM danmaku_config_scheme WHERE deleted_at IS NULL ORDER BY created_at ASC, id ASC").all().map(function (r) {
    return { id: String(r.id), name: String(r.name), createdAt: r.created_at, updatedAt: r.updated_at, rev: r.rev };
  });
}

function normalizeSchemeName(name) {
  const s = String(name === undefined || name === null ? "" : name).trim();
  if (!s) throw new Error("方案名称不能为空");
  if (s.length > 64) throw new Error("方案名称不能超过 64 个字符");
  return s;
}

/** 方案 data 只存覆盖项；坏 JSON/未知项/越界都退化为 warning。 */
function parseSchemeData(row) {
  const data = Object.create(null);
  const warnings = [];
  let raw;
  try {
    raw = JSON.parse(String((row && row.data) || "{}"));
  } catch (e) {
    warnings.push({ code: "config_bad_json", message: "配置方案内容不是合法 JSON，已回退默认" });
    return { data: data, warnings: warnings };
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    warnings.push({ code: "config_bad_json", message: "配置方案内容不是对象，已回退默认" });
    return { data: data, warnings: warnings };
  }
  for (const id of Object.keys(raw)) {
    const item = ITEM_BY_ID.get(id);
    if (!item) {
      warnings.push({ code: "config_unknown_key", id: id, message: "未知配置项已忽略：" + id });
      continue;
    }
    try { data[id] = coerceValue(item, raw[id]); }
    catch (e) { warnings.push({ code: "config_invalid", id: id, message: String((e && e.message) || e) + "，已回退默认" }); }
  }
  return { data: data, warnings: warnings };
}

function logScheme(db, id, origin, ts) {
  if (!tableExists(db, "sync_change_log")) return;
  const row = db.prepare("SELECT * FROM danmaku_config_scheme WHERE id=?").get(String(id));
  if (!row) return;
  const op = row.deleted_at === null || row.deleted_at === undefined ? "upsert" : "delete";
  db.prepare("INSERT INTO sync_change_log(table_name,row_id,op,payload,origin,updated_at) VALUES(?,?,?,?,?,?)").run("danmaku_config_scheme", String(id), op, JSON.stringify(row), origin || "ui", Number(ts) || Date.now());
}

function insertScheme(db, id, name, data, ts) {
  db.prepare("INSERT INTO danmaku_config_scheme (id,name,data,created_at,updated_at,deleted_at,rev) VALUES(?,?,?,?,?,NULL,1)").run(String(id), String(name), JSON.stringify(data || {}), ts, ts);
}

function writeSchemeData(db, id, data, ts) {
  db.prepare("UPDATE danmaku_config_scheme SET data=?, updated_at=?, rev=rev+1 WHERE id=? AND deleted_at IS NULL").run(JSON.stringify(data || {}), ts, String(id));
}

function createScheme(db, name, data, origin) {
  const ts = Date.now();
  const id = newSchemeId();
  tx(db, function () {
    insertScheme(db, id, name, data, ts);
    metaSet(db, "configScheme.danmaku.active", id);
    logScheme(db, id, origin, ts);
  });
  return id;
}

/** 旧版本直接写在 meta 里的覆盖项，首次加载时收进一个方案，避免升级丢设置。 */
function ensureConfigSchemes(db) {
  ensureMeta(db);
  ensureSchemeTable(db);
  const active = activeSchemeId(db);
  if (active) {
    if (schemeRow(db, active)) return active;
    metaDelete(db, "configScheme.danmaku.active");
  }
  const overrides = Object.create(null);
  const keys = [];
  for (const row of metaRows(db)) {
    const id = String(row.k).slice(("config." + DOMAIN + ".").length);
    const item = ITEM_BY_ID.get(id);
    if (!item) continue;
    try {
      overrides[id] = coerceValue(item, JSON.parse(String(row.v)));
      keys.push(row.k);
    } catch (e) { /* 坏值留给读取阶段报 warning */ }
  }
  if (!keys.length) return "";
  const ts = Date.now();
  const id = newSchemeId();
  tx(db, function () {
    insertScheme(db, id, "本机原有配置", overrides, ts);
    metaSet(db, "configScheme.danmaku.active", id);
    for (const k of keys) metaDelete(db, k);
    logScheme(db, id, "migration", ts);
  });
  return id;
}

function ensureActiveScheme(db, name) {
  ensureSchemeTable(db);
  const active = activeSchemeId(db);
  if (active && schemeRow(db, active)) return active;
  return createScheme(db, name || "本机配置", {}, "ui");
}


/**
 * 读取配置：默认值 ← 当前方案的覆盖项，再附 warnings。
 * 坏 JSON、非法值、未知/已废弃 id 都不会抛错。
 */
export function loadConfig(db) {
  const overrides = Object.create(null);
  const values = Object.create(null);
  const warnings = [];
  for (const item of ITEMS) values[item.id] = item.default;
  const active = activeSchemeId(db);
  if (!active) return { values: values, overrides: overrides, warnings: warnings, scheme: null };
  const row = schemeRow(db, active);
  if (!row) {
    metaDelete(db, "configScheme.danmaku.active");
    return { values: values, overrides: overrides, warnings: warnings, scheme: null };
  }
  const parsed = parseSchemeData(row);
  for (const id of Object.keys(parsed.data)) {
    overrides[id] = parsed.data[id];
    values[id] = parsed.data[id];
  }
  for (const warning of parsed.warnings) warnings.push(warning);
  return {
    values: values,
    overrides: overrides,
    warnings: warnings,
    scheme: { id: String(row.id), name: String(row.name), updatedAt: row.updated_at },
  };
}

export function configValues(db) {
  return loadConfig(db).values;
}

export function configState(db) {
  const loaded = loadConfig(db);
  return {
    domain: DOMAIN,
    schemaVersion: SCHEMA_VERSION,
    groups: GROUPS,
    items: ITEMS.map(publicItem),
    values: loaded.values,
    overrides: loaded.overrides,
    warnings: loaded.warnings,
    table: "danmaku_config_scheme",
    scheme: loaded.scheme,
    schemes: listSchemes(db),
  };
}

export function schemeCreate(db, name, from, origin) {
  const source = from === "default" ? {} : loadConfig(db).overrides;
  const id = createScheme(db, name, source, origin);
  return { id: id, state: configState(db) };
}

export function schemeRename(db, id, name) {
  if (!id) throw new Error("缺少方案 id");
  const row = schemeRow(db, id);
  if (!row) throw new Error("配置方案不存在：" + id);
  const ts = Date.now();
  db.prepare("UPDATE danmaku_config_scheme SET name=?, updated_at=?, rev=rev+1 WHERE id=?").run(normalizeSchemeName(name), ts, String(id));
  logScheme(db, id, "ui", ts);
  return { id: String(id), state: configState(db) };
}

export function schemeDelete(db, id) {
  if (!id) throw new Error("缺少方案 id");
  const row = schemeRow(db, id);
  if (!row) throw new Error("配置方案不存在：" + id);
  const ts = Date.now();
  tx(db, function () {
    db.prepare("UPDATE danmaku_config_scheme SET deleted_at=?, updated_at=?, rev=rev+1 WHERE id=?").run(ts, ts, String(id));
    if (activeSchemeId(db) === String(id)) metaDelete(db, "configScheme.danmaku.active");
    logScheme(db, id, "ui", ts);
  });
  return { id: String(id), state: configState(db) };
}

export function schemeActivate(db, id) {
  if (id === undefined || id === null || id === "") {
    metaDelete(db, "configScheme.danmaku.active");
    return { id: null, state: configState(db) };
  }
  const row = schemeRow(db, id);
  if (!row) throw new Error("配置方案不存在：" + id);
  metaSet(db, "configScheme.danmaku.active", String(id));
  return { id: String(id), state: configState(db) };
}

export function itemById(id) {
  return ITEM_BY_ID.get(id) || null;
}

export function writeConfig(db, patch, origin) {
  if (!patch || typeof patch !== "object") throw new Error("values 必须是对象");
  const prepared = [];
  for (const [id, raw] of Object.entries(patch)) {
    const item = ITEM_BY_ID.get(id);
    if (!item) continue;
    prepared.push({ id, value: coerceValue(item, raw) });
  }
  if (!prepared.length) return { changed: [], state: configState(db) };
  const ts = Date.now();
  const schemeId = ensureActiveScheme(db, "本机配置");
  const row = schemeRow(db, schemeId);
  if (!row) throw new Error("配置方案不存在，请重新选择方案");
  const data = parseSchemeData(row).data;
  const changed = [];
  for (const entry of prepared) {
    if (JSON.stringify(data[entry.id]) === JSON.stringify(entry.value)) continue;
    data[entry.id] = entry.value;
    changed.push(entry.id);
  }
  if (changed.length) {
    writeSchemeData(db, schemeId, data, ts);
    logScheme(db, schemeId, origin, ts);
  }
  return { changed, state: configState(db), schemeId };
}

export function resetConfig(db, ids) {
  const targets = Array.isArray(ids) && ids.length ? ids : ITEMS.map((item) => item.id);
  const active = activeSchemeId(db);
  const row = active ? schemeRow(db, active) : null;
  if (!row) return { reset: targets.slice(), state: configState(db) };
  const data = parseSchemeData(row).data;
  for (const id of targets) if (ITEM_BY_ID.has(id)) delete data[id];
  const ts = Date.now();
  writeSchemeData(db, active, data, ts);
  logScheme(db, active, "ui", ts);
  return { reset: targets.slice(), state: configState(db) };
}
