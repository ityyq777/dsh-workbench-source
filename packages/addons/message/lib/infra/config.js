/**
 * 消息插件的配置项：白名单 schema + 本地读写。
 *
 * 与四个业务插件同一套范式：配置只存覆盖项，默认值留在代码里；存放位置是宿主的
 * meta 表（键 `config.message.<id>`），不建新表、不进同步、不进备份。
 * 读取永远宽松（表缺失/JSON 坏/取值越界都回退默认值并给 warnings），只有写入会抛错。
 */

import { tableExists, tx } from "../db/db.js";

export const DOMAIN = "message";
export const SCHEMA_VERSION = 1;
export const SCHEME_TABLE = "message_config_scheme";
const ACTIVE_KEY = "configScheme.message.active";
function ensureMeta(db) {
  if (!tableExists(db, "meta")) db.exec("CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL);");
}
const DEFAULT_SCHEME_NAME = "本机配置";

const GROUPS = [
  { id: "sound", zh: "提示音", en: "Sound" },
  { id: "quiet", zh: "免打扰", en: "Quiet hours" },
  { id: "retention", zh: "保留期", en: "Retention" },
  { id: "list", zh: "列表", en: "List" },
  { id: "float", zh: "悬浮入口", en: "Floating button" },
];

const ITEMS = [
  {
    id: "sound.enabled", group: "sound", type: "bool", surface: "ui", apply: "mount", default: true,
    zh: "新消息提示音", en: "Sound for new messages",
    hintZh: "关闭后收到新消息不再发声（未读数照常增加）", hintEn: "When off, new messages stay silent (unread count still grows)",
  },
  {
    id: "sound.volume", group: "sound", type: "number", surface: "ui", apply: "mount", default: 0.4, min: 0, max: 1,
    zh: "音量", en: "Volume",
    hintZh: "0 到 1 之间，默认 0.4", hintEn: "Between 0 and 1, default 0.4",
  },
  {
    id: "sound.whileHidden", group: "sound", type: "bool", surface: "ui", apply: "mount", default: false,
    zh: "窗口不在前台也响", en: "Play while hidden",
    hintZh: "关闭时只在工作台可见时发声，避免后台突然响", hintEn: "When off, only sound while the workbench is visible",
  },
  {
    id: "quiet.enabled", group: "quiet", type: "bool", surface: "ui", apply: "mount", default: false,
    zh: "启用免打扰", en: "Enable quiet hours",
    hintZh: "开启后时间段内不发声，消息照常入库", hintEn: "Inside the window messages are stored silently",
  },
  {
    id: "quiet.from", group: "quiet", type: "time", surface: "ui", apply: "mount", default: "22:00",
    zh: "免打扰开始", en: "Quiet from",
    hintZh: "24 小时制 HH:MM；跨零点自动按夜间区间处理", hintEn: "24h HH:MM; windows crossing midnight are handled",
  },
  {
    id: "quiet.to", group: "quiet", type: "time", surface: "ui", apply: "mount", default: "08:00",
    zh: "免打扰结束", en: "Quiet until",
    hintZh: "等于开始时间表示全天免打扰", hintEn: "Same as start means all day",
  },
  {
    id: "quiet.levels", group: "quiet", type: "multi", surface: "ui", apply: "mount", default: ["warning", "error"],
    zh: "免打扰仍响的级别", en: "Levels that still sound",
    hintZh: "默认只放行警告与错误", hintEn: "By default only warning and error are let through",
    values: [
      { value: "info", zh: "提示", en: "Info" },
      { value: "success", zh: "成功", en: "Success" },
      { value: "warning", zh: "警告", en: "Warning" },
      { value: "error", zh: "错误", en: "Error" },
    ],
  },
  {
    id: "retention.readDays", group: "retention", type: "int", surface: "api", apply: "api", default: 30, min: 0, max: 3650,
    zh: "已读保留天数", en: "Keep read messages (days)",
    hintZh: "已读消息超过该天数自动清理；未读永不按时间清理，0 表示不按时间清理", hintEn: "Read messages older than this are pruned; unread never expires by time, 0 disables",
  },
  {
    id: "float.enabled", group: "float", type: "bool", surface: "ui", apply: "mount", default: true,
    zh: "显示消息悬浮入口", en: "Show floating message button",
    hintZh: "任意页面右下角常驻消息按钮，带未读角标；关闭后该按钮立即隐藏", hintEn: "A persistent message button in the corner with unread badge; turning it off hides it",
  },
  {
    id: "float.position", group: "float", type: "enum", surface: "ui", apply: "mount", default: "bottom-right",
    zh: "悬浮入口位置", en: "Floating position",
    hintZh: "右下角默认避开输入区；与其它浮层冲突时可换到左下角", hintEn: "Bottom right avoids the input area; switch to bottom left when it collides",
    values: [
      { value: "bottom-right", zh: "右下角", en: "Bottom right" },
      { value: "bottom-left", zh: "左下角", en: "Bottom left" },
    ],
  },
  {
    id: "float.customPos", group: "float", type: "string", surface: "ui", apply: "mount", default: "", maxLength: 32,
    zh: "自定义位置", en: "Custom position",
    hintZh: "拖拽后自动写入「rx,ry」归一化中心；清空即回到默认角，一般无需手改",
    hintEn: "Written after a drag as normalized center \"rx,ry\"; clear it to return to the default corner",
  },
  {
    id: "float.idleSeconds", group: "float", type: "int", surface: "ui", apply: "mount", default: 3, min: 0, max: 60,
    zh: "空闲多久贴边收起（秒）", en: "Idle seconds before edge collapse",
    hintZh: "0 表示不自动收起；只在按钮靠近左右边缘时生效", hintEn: "0 disables; only applies near the left or right edge",
  },
  {
    id: "float.edgeSnap", group: "float", type: "bool", surface: "ui", apply: "mount", default: true,
    zh: "靠近边缘自动半隐藏", en: "Auto collapse at the edge",
    hintZh: "关闭后空闲也不会贴边，按钮始终完整显示", hintEn: "When off the button never collapses at the edge",
  },
  {
    id: "list.pageSize", group: "list", type: "enum", surface: "ui", apply: "mount", default: 20,
    zh: "每页条数", en: "Page size",
    hintZh: "收件箱每页显示多少条", hintEn: "Messages per page in Inbox",
    values: [
      { value: 12, zh: "12 条", en: "12" },
      { value: 20, zh: "20 条", en: "20" },
      { value: 50, zh: "50 条", en: "50" },
    ],
  },
];

const BY_ID = new Map(ITEMS.map((item) => [item.id, item]));

function label(item) {
  return item.zh + "（" + item.id + "）";
}

function coerceValue(item, raw) {
  if (item.type === "bool") {
    if (typeof raw !== "boolean") throw new Error(label(item) + " 需要 true/false");
    return raw;
  }
  if (item.type === "int" || item.type === "number") {
    const value = Number(raw);
    if (!Number.isFinite(value)) throw new Error(label(item) + " 需要数字");
    const min = item.min === undefined ? -Infinity : item.min;
    const max = item.max === undefined ? Infinity : item.max;
    if (value < min || value > max) throw new Error(label(item) + " 需要在 " + min + "–" + max + " 之间");
    return item.type === "int" ? Math.round(value) : value;
  }
  if (item.type === "enum") {
    const values = (item.values || []).map((option) => option.value);
    const hit = values.indexOf(raw);
    if (hit < 0) throw new Error(label(item) + " 只接受：" + values.join(" / "));
    return values[hit];
  }
  if (item.type === "multi") {
    if (!Array.isArray(raw)) throw new Error(label(item) + " 需要数组");
    const values = (item.values || []).map((option) => option.value);
    const seen = [];
    for (const entry of raw) {
      if (values.indexOf(entry) < 0) throw new Error(label(item) + " 含未知取值：" + entry);
      if (seen.indexOf(entry) < 0) seen.push(entry);
    }
    return seen;
  }
  if (item.type === "time") {
    if (typeof raw !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(raw)) throw new Error(label(item) + " 需要 HH:MM");
    return raw;
  }
  if (item.type === "string") {
    if (typeof raw !== "string") throw new Error(label(item) + " 需要字符串");
    const max = item.maxLength || 200;
    if (raw.length > max) throw new Error(label(item) + " 不能超过 " + max + " 个字符");
    return raw;
  }
  throw new Error(label(item) + " 的类型不受支持：" + item.type);
}

function metaRows(db) {
  if (!tableExists(db, "meta")) return [];
  try {
    return db.prepare("SELECT k,v FROM meta WHERE k LIKE ?").all("config." + DOMAIN + ".%");
  } catch {
    return [];
  }
}

function metaSet(db, key, value) {
  db.prepare("INSERT INTO meta(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").run(String(key), String(value));
}

function metaDelete(db, key) {
  db.prepare("DELETE FROM meta WHERE k=?").run(String(key));
}

function keyOf(id) {
  return "config." + DOMAIN + "." + id;
}


/** 当前设备选中的方案 id（只存 meta，不同步）。 */
function activeSchemeId(db) {
  if (!tableExists(db, "meta")) return "";
  const row = db.prepare("SELECT v FROM meta WHERE k=?").get("configScheme.message.active");
  return row ? String(row.v) : "";
}

function ensureSchemeTable(db) {
  db.exec("CREATE TABLE IF NOT EXISTS message_config_scheme (id TEXT PRIMARY KEY, name TEXT NOT NULL, data TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, deleted_at INTEGER, rev INTEGER NOT NULL DEFAULT 1)");
}

function newSchemeId() {
  return "cs_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function schemeRow(db, id) {
  if (!id || !tableExists(db, "message_config_scheme")) return null;
  return db.prepare("SELECT * FROM message_config_scheme WHERE id=? AND deleted_at IS NULL").get(String(id)) || null;
}

function listSchemes(db) {
  if (!tableExists(db, "message_config_scheme")) return [];
  return db.prepare("SELECT id,name,created_at,updated_at,rev FROM message_config_scheme WHERE deleted_at IS NULL ORDER BY created_at ASC, id ASC").all().map(function (r) {
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
    const item = BY_ID.get(id);
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
  const row = db.prepare("SELECT * FROM message_config_scheme WHERE id=?").get(String(id));
  if (!row) return;
  const op = row.deleted_at === null || row.deleted_at === undefined ? "upsert" : "delete";
  db.prepare("INSERT INTO sync_change_log(table_name,row_id,op,payload,origin,updated_at) VALUES(?,?,?,?,?,?)").run("message_config_scheme", String(id), op, JSON.stringify(row), origin || "ui", Number(ts) || Date.now());
}

function insertScheme(db, id, name, data, ts) {
  db.prepare("INSERT INTO message_config_scheme (id,name,data,created_at,updated_at,deleted_at,rev) VALUES(?,?,?,?,?,NULL,1)").run(String(id), String(name), JSON.stringify(data || {}), ts, ts);
}

function writeSchemeData(db, id, data, ts) {
  db.prepare("UPDATE message_config_scheme SET data=?, updated_at=?, rev=rev+1 WHERE id=? AND deleted_at IS NULL").run(JSON.stringify(data || {}), ts, String(id));
}

function createScheme(db, name, data, origin) {
  const ts = Date.now();
  const id = newSchemeId();
  tx(db, function () {
    insertScheme(db, id, name, data, ts);
    metaSet(db, "configScheme.message.active", id);
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
    metaDelete(db, "configScheme.message.active");
  }
  const overrides = Object.create(null);
  const keys = [];
  for (const row of metaRows(db)) {
    const id = String(row.k).slice(("config." + DOMAIN + ".").length);
    const item = BY_ID.get(id);
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
    metaSet(db, "configScheme.message.active", id);
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
    metaDelete(db, "configScheme.message.active");
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
    table: "message_config_scheme",
    scheme: loaded.scheme,
    schemes: listSchemes(db),
  };
}

function publicItem(item) {
  return {
    id: item.id,
    group: item.group,
    type: item.type,
    surface: item.surface,
    apply: item.apply,
    default: item.default,
    zh: item.zh,
    en: item.en,
    hintZh: item.hintZh,
    hintEn: item.hintEn,
    min: item.min,
    max: item.max,
    values: item.values,
  };
}

export function writeConfig(db, raw, origin) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("values 需要 { 配置项: 值 } 形式");
  const ids = Object.keys(raw);
  if (!ids.length) throw new Error("没有要保存的配置项");
  const prepared = [];
  for (const id of ids) {
    const item = BY_ID.get(id);
    if (!item) throw new Error("未知配置项：" + id + "（可用 message.configGet 查看全部）");
    prepared.push({ id: id, value: coerceValue(item, raw[id]) });
  }
  const ts = Date.now();
  const schemeId = ensureActiveScheme(db, "本机配置");
  const row = schemeRow(db, schemeId);
  if (!row) throw new Error("配置方案不存在，请重新选择方案");
  const data = parseSchemeData(row).data;
  for (const item of prepared) data[item.id] = item.value;
  writeSchemeData(db, schemeId, data, ts);
  logScheme(db, schemeId, origin, ts);
  return {
    changed: prepared.map((row) => row.id),
    values: loadConfig(db).values,
    state: configState(db),
    schemeId: schemeId,
  };
}

export function resetConfig(db, ids) {
  const targets = Array.isArray(ids) && ids.length ? ids : ITEMS.map((item) => item.id);
  for (const id of targets) {
    if (!BY_ID.has(id)) throw new Error("未知配置项：" + id);
  }
  const active = activeSchemeId(db);
  const row = active ? schemeRow(db, active) : null;
  if (!row) return { reset: targets.slice(), values: loadConfig(db).values, state: configState(db) };
  const data = parseSchemeData(row).data;
  for (const id of targets) delete data[id];
  const ts = Date.now();
  writeSchemeData(db, active, data, ts);
  logScheme(db, active, "ui", ts);
  return { reset: targets.slice(), values: loadConfig(db).values, state: configState(db) };
}

function schemeCreate(db, name, from, origin) {
  const source = from === "default" ? {} : loadConfig(db).overrides;
  const id = createScheme(db, name, source, origin);
  return { id: id, state: configState(db) };
}

function schemeRename(db, id, name) {
  if (!id) throw new Error("缺少方案 id");
  const row = schemeRow(db, id);
  if (!row) throw new Error("配置方案不存在：" + id);
  const ts = Date.now();
  db.prepare("UPDATE message_config_scheme SET name=?, updated_at=?, rev=rev+1 WHERE id=?").run(normalizeSchemeName(name), ts, String(id));
  logScheme(db, id, "ui", ts);
  return { id: String(id), state: configState(db) };
}

function schemeDelete(db, id) {
  if (!id) throw new Error("缺少方案 id");
  const row = schemeRow(db, id);
  if (!row) throw new Error("配置方案不存在：" + id);
  const ts = Date.now();
  tx(db, function () {
    db.prepare("UPDATE message_config_scheme SET deleted_at=?, updated_at=?, rev=rev+1 WHERE id=?").run(ts, ts, String(id));
    if (activeSchemeId(db) === String(id)) metaDelete(db, "configScheme.message.active");
    logScheme(db, id, "ui", ts);
  });
  return { id: String(id), state: configState(db) };
}

function schemeActivate(db, id) {
  if (id === undefined || id === null || id === "") {
    metaDelete(db, "configScheme.message.active");
    return { id: null, state: configState(db) };
  }
  const row = schemeRow(db, id);
  if (!row) throw new Error("配置方案不存在：" + id);
  metaSet(db, "configScheme.message.active", String(id));
  return { id: String(id), state: configState(db) };
}

export function registerConfigActions(api) {
  const db = api.db;
  ensureConfigSchemes(db);
  const action = api.action;
  action("message.configGet", {
    description: "只读：消息插件的配置项定义、当前值、覆盖项、当前方案与全部方案（含提示音、免打扰、保留期、悬浮入口与列表分页）",
    input: { type: "object", properties: {}, additionalProperties: false },
    execute: () => configState(api.db),
    render: (r) =>
      "消息配置 " + Object.keys(r.values || {}).length + " 项；覆盖 " + Object.keys(r.overrides || {}).length + " 项" +
      (r.warnings && r.warnings.length ? "；warnings " + r.warnings.length : "") + "。",
  });
  action("message.configSet", {
    description: "写入配置覆盖项（值会做类型与范围校验，越界抛错）；配置写入当前方案，方案参与云端同步与备份",
    input: {
      type: "object",
      properties: {
        values: { type: "object", description: "要写入的配置项，如 {\"sound.enabled\": false, \"quiet.from\": \"22:30\"}" },
      },
      required: ["values"],
    },
    examples: [{ purpose: "关闭提示音并设置免打扰", args: { values: { "sound.enabled": false, "quiet.enabled": true, "quiet.from": "22:30" } } }],
    execute: (args, ctx) => writeConfig(api.db, args.values, ctx && ctx.origin),
    render: (r) => "已更新消息配置：" + (r.changed || []).join("、"),
  });
  action("message.configReset", {
    description: "从当前方案里清除配置覆盖项；不传 ids 表示全部重置",
    input: {
      type: "object",
      properties: { ids: { type: "array", items: { type: "string" }, description: "要重置的配置项 id 列表" } },
    },
    execute: (args) => resetConfig(api.db, args.ids),
    render: (r) => "已重置 " + (r.reset || []).length + " 个配置项。",
  });


  api.action("message.configSchemeCreate", {
    description: "新建配置方案并立即切换过去；from=current 复制当前值，from=default 从插件默认值开始",
    input: { type: "object", properties: { name: { type: "string", description: "方案名称，1–64 个字符" }, from: { type: "string", enum: ["current", "default"] } }, required: ["name"] },
    execute: function (args, ctx) { return schemeCreate(db, args && args.name, args && args.from, ctx && ctx.origin); },
    render: function (r) { return "已新建并启用配置方案：" + r.state.scheme.name; },
  });

  api.action("message.configSchemeRename", {
    description: "重命名配置方案",
    input: { type: "object", properties: { id: { type: "string" }, name: { type: "string" } }, required: ["id", "name"] },
    execute: function (args) { return schemeRename(db, args && args.id, args && args.name); },
    render: function (r) { return "配置方案已改名：" + r.state.scheme.name; },
  });

  api.action("message.configSchemeDelete", {
    description: "软删除配置方案；删除的是当前方案时回到「不使用方案」",
    input: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    execute: function (args) { return schemeDelete(db, args && args.id); },
    render: function () { return "配置方案已删除"; },
  });

  api.action("message.configSchemeActivate", {
    description: "切换当前设备的配置方案；id 传空表示不使用方案、回到插件默认配置",
    input: { type: "object", properties: { id: { type: "string" } } },
    execute: function (args) { return schemeActivate(db, args && args.id); },
    render: function (r) { return r.id ? "已切换配置方案" : "已改为不使用方案（插件默认配置）"; },
  });


}
