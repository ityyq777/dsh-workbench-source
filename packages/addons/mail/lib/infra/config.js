/**
 * 邮件插件的配置项：白名单 schema + 本地读写。
 *
 * 与消息、自动化等插件同一套范式：配置只存覆盖项，默认值留在代码里；存放位置是宿主的
 * meta 表（键 `config.mail.<id>`），不建新表、不进同步、不进备份。账户与密码类信息
 * 一律不进这里——凭据仍由保险箱托管。
 * 读取永远宽松（表缺失/JSON 坏/取值越界都回退默认值并给 warnings），只有写入会抛错。
 *
 * `apply` 声明生效时机：`mount` 要等视图重新挂载才生效；`background` 写完就由后台重新排期
 * （自动同步用），界面不必刷新。
 */

export const DOMAIN = "mail";
export const SCHEMA_VERSION = 1;
export const SCHEME_TABLE = "mail_config_scheme";
const ACTIVE_KEY = "configScheme.mail.active";
const DEFAULT_SCHEME_NAME = "本机配置";
function ensureMeta(db) {
  if (!tableExists(db, "meta")) db.exec("CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL);");
}

const GROUPS = [
  { id: "images", zh: "图片", en: "Images" },
  { id: "display", zh: "显示", en: "Display" },
  { id: "read", zh: "阅读", en: "Reading" },
  { id: "list", zh: "列表", en: "List" },
  { id: "autosync", zh: "自动同步", en: "Auto-sync" },
  { id: "debug", zh: "诊断", en: "Diagnostics" },
];

const ITEMS = [
  {
    id: "images.remote", group: "images", type: "bool", surface: "ui", apply: "mount", default: true,
    zh: "默认加载远程图片", en: "Show remote images",
    hintZh: "打开即按原信显示图片；关闭后图片换成占位，每封可临时点「显示图片」。注意加载远程图片会让发件方知道你何时、从哪个 IP 读了这封信。",
    hintEn: "Images load as the sender wrote them. When off, images are blocked and you can reveal them per mail. Loading remote images tells the sender when and from which IP you read it.",
  },
  {
    id: "display.html", group: "display", type: "bool", surface: "ui", apply: "mount", default: true,
    zh: "优先原信排版", en: "Prefer HTML layout",
    hintZh: "用原文的 HTML 排版显示（沙箱内渲染，样式不外泄）；关闭后统一按纯文本显示。",
    hintEn: "Render the original HTML inside a sandbox; turn off to always show plain text.",
  },
  {
    id: "display.mailTheme", group: "display", type: "multi", surface: "ui", apply: "mount", default: "original",
    values: ["original", "app"],
    zh: "正文配色", en: "Mail colour scheme",
    hintZh: "original 表示按发件方原设计配色（浅色邮件用浅纸面、深色邮件用深色纸面）；app 表示正文跟随界面主题。单封邮件也可以在阅读区页头临时切换。",
    hintEn: "original keeps the sender's own colour scheme; app follows the app theme. Each mail can also be toggled in the reader header.",
  },
  {
    id: "read.autoSeen", group: "read", type: "bool", surface: "ui", apply: "mount", default: true,
    zh: "打开即标为已读", en: "Mark as read on open",
    hintZh: "打开一封信即回写已读；关闭后需要手动点「标为已读」。",
    hintEn: "Opening a mail marks it read; when off you mark it read manually.",
  },
  {
    id: "list.pageSize", group: "list", type: "int", surface: "ui", apply: "mount", default: 20, min: 10, max: 50,
    zh: "每次加载封数", en: "Messages per page",
    hintZh: "列表一次加载多少封，也作为每次抓取新信的封数（10–50）。",
    hintEn: "How many mails load at a time and how many are fetched per sync (10–50).",
  },
  {
    id: "autosync.enabled", group: "autosync", type: "bool", surface: "ui", apply: "background", default: true,
    zh: "自动收取新邮件", en: "Fetch new mail automatically",
    hintZh: "默认开启：邮件插件在后台按下面的方式检查收件箱，发现新信就抓取信头并提醒。保险箱锁着时不会执行——后台同步不需要、也不会保存你的密码明文。",
    hintEn: "On by default: the mail add-on checks the inbox in the background and fetches new messages. Nothing runs while the credential vault is locked; the background never caches your password.",
  },
  {
    id: "autosync.mode", group: "autosync", type: "multi", surface: "ui", apply: "background", default: "interval",
    values: ["interval", "idle"],
    valueLabels: {
      interval: { zh: "定时循环", en: "Interval" },
      idle: { zh: "IMAP 推送", en: "IMAP push (IDLE)" },
    },
    zh: "同步方式", en: "Sync method",
    hintZh: "定时循环：每隔一段时间连一次服务器，兼容所有邮箱；IMAP 推送：保持一条长连接让服务器主动通知，收信更快，但少数服务商不支持或会掐断连接。",
    hintEn: "Interval reconnects every few minutes and works everywhere; IMAP push keeps one long-lived connection so the server tells us immediately (a few providers do not support it).",
  },
  {
    id: "autosync.intervalSec", group: "autosync", type: "int", surface: "ui", apply: "background", default: 300, min: 60, max: 1800,
    zh: "定时间隔（秒）", en: "Interval (seconds)",
    hintZh: "定时循环的间隔，60–1800 秒。太短会被服务商限流；IMAP 推送模式下它仍是兜底检查周期。",
    hintEn: "Seconds between checks, 60–1800. Very short intervals may be throttled; in IMAP push mode this stays as a safety net.",
  },
  {
    id: "autosync.notify", group: "autosync", type: "bool", surface: "ui", apply: "background", default: true,
    zh: "新邮件通知（推事件给订阅方）", en: "Publish new mail events for subscribers",
    hintZh: "自动抓到的新邮件会推一条事件进宿主事件队列，订阅了该事件的消息插件会留一条提醒（同一批新信只提醒一次）。",
    hintEn: "Each batch of new mail is pushed onto the host event queue; any subscriber (e.g. the messages add-on) turns it into one notice.",
  },
  {
    id: "debug.fetch", group: "debug", type: "bool", surface: "ui", apply: "mount", default: false,
    zh: "记录正文取数细节", en: "Log body fetch details",
    hintZh: "打开后，读取正文分段时会把 section、服务器声明尺寸、实际字节数与响应 key 打到宿主日志，用于排查「正文下载失败」。默认关闭。",
    hintEn: "When on, every body segment logs its section, declared size, actual bytes and response key. Off by default.",
  },
];

const BY_ID = new Map(ITEMS.map((item) => [item.id, item]));

/** 枚举项的中文/英文标签：界面与回执都从这里取，避免两处各写一份。 */
export function valueLabels(item, id) {
  const labels = (item && item.valueLabels) || {};
  return labels[id] || { zh: id, en: id };
}

// 配置写入后要让后台重新排期（例如把间隔从 5 分钟改成 15 分钟），
// 由装配层注册回调，配置模块本身不反向依赖自动同步。
const changeListeners = [];

export function onConfigChange(fn) {
  if (typeof fn !== "function") throw new Error("onConfigChange 需要函数");
  changeListeners.push(fn);
  return function () {
    const index = changeListeners.indexOf(fn);
    if (index >= 0) changeListeners.splice(index, 1);
  };
}

function notifyChange(changed) {
  for (const fn of changeListeners.slice()) {
    try {
      fn(changed);
    } catch {
      // 回调失败不影响配置已落盘的事实，丢弃异常即可。
    }
  }
}

function label(item) {
  return item.zh + "（" + item.id + "）";
}

function coerceValue(item, raw) {
  if (item.type === "bool") {
    if (typeof raw !== "boolean") throw new Error(label(item) + " 需要 true/false");
    return raw;
  }
  if (item.type === "multi") {
    const value = String(raw == null ? "" : raw);
    if (!Array.isArray(item.values) || !item.values.includes(value)) {
      throw new Error(label(item) + " 只能是 " + (item.values || []).join(" / "));
    }
    return value;
  }
  if (item.type === "int" || item.type === "number") {
    const value = Number(raw);
    if (!Number.isFinite(value)) throw new Error(label(item) + " 需要数字");
    const min = item.min === undefined ? -Infinity : item.min;
    const max = item.max === undefined ? Infinity : item.max;
    if (value < min || value > max) throw new Error(label(item) + " 需要在 " + min + "–" + max + " 之间");
    return item.type === "int" ? Math.round(value) : value;
  }
  throw new Error(label(item) + " 的类型不受支持：" + item.type);
}

function tableExists(db, name) {
  try {
    return !!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(String(name));
  } catch {
    return false;
  }
}

function tx(db, fn) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      /* ignore rollback failure */
    }
    throw error;
  }
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
  const row = db.prepare("SELECT v FROM meta WHERE k=?").get("configScheme.mail.active");
  return row ? String(row.v) : "";
}

function ensureSchemeTable(db) {
  db.exec("CREATE TABLE IF NOT EXISTS mail_config_scheme (id TEXT PRIMARY KEY, name TEXT NOT NULL, data TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, deleted_at INTEGER, rev INTEGER NOT NULL DEFAULT 1)");
}

function newSchemeId() {
  return "cs_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function schemeRow(db, id) {
  if (!id || !tableExists(db, "mail_config_scheme")) return null;
  return db.prepare("SELECT * FROM mail_config_scheme WHERE id=? AND deleted_at IS NULL").get(String(id)) || null;
}

function listSchemes(db) {
  if (!tableExists(db, "mail_config_scheme")) return [];
  return db.prepare("SELECT id,name,created_at,updated_at,rev FROM mail_config_scheme WHERE deleted_at IS NULL ORDER BY created_at ASC, id ASC").all().map(function (r) {
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
  const data = {};
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
  const row = db.prepare("SELECT * FROM mail_config_scheme WHERE id=?").get(String(id));
  if (!row) return;
  const op = row.deleted_at === null || row.deleted_at === undefined ? "upsert" : "delete";
  db.prepare("INSERT INTO sync_change_log(table_name,row_id,op,payload,origin,updated_at) VALUES(?,?,?,?,?,?)").run("mail_config_scheme", String(id), op, JSON.stringify(row), origin || "ui", Number(ts) || Date.now());
}

function insertScheme(db, id, name, data, ts) {
  db.prepare("INSERT INTO mail_config_scheme (id,name,data,created_at,updated_at,deleted_at,rev) VALUES(?,?,?,?,?,NULL,1)").run(String(id), String(name), JSON.stringify(data || {}), ts, ts);
}

function writeSchemeData(db, id, data, ts) {
  db.prepare("UPDATE mail_config_scheme SET data=?, updated_at=?, rev=rev+1 WHERE id=? AND deleted_at IS NULL").run(JSON.stringify(data || {}), ts, String(id));
}

function createScheme(db, name, data, origin) {
  const ts = Date.now();
  const id = newSchemeId();
  tx(db, function () {
    insertScheme(db, id, name, data, ts);
    metaSet(db, "configScheme.mail.active", id);
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
    metaDelete(db, "configScheme.mail.active");
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
    metaSet(db, "configScheme.mail.active", id);
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
  const overrides = {};
  const values = {};
  const warnings = [];
  for (const item of ITEMS) values[item.id] = item.default;
  const active = activeSchemeId(db);
  if (!active) return { values: values, overrides: overrides, warnings: warnings, scheme: null };
  const row = schemeRow(db, active);
  if (!row) {
    metaDelete(db, "configScheme.mail.active");
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
    table: "mail_config_scheme",
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
    valueLabels: item.valueLabels,
  };
}

export function writeConfig(db, raw, origin) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("values 需要 { 配置项: 值 } 形式");
  const ids = Object.keys(raw);
  if (!ids.length) throw new Error("没有要保存的配置项");
  const prepared = [];
  for (const id of ids) {
    const item = BY_ID.get(id);
    if (!item) throw new Error("未知配置项：" + id + "（可用 mail.configGet 查看全部）");
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
  notifyChange(prepared.map((row) => row.id));
  return {
    changed: prepared.map((row) => row.id),
    values: loadConfig(db).values,
    warnings: loadConfig(db).warnings,
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
  if (!row) return { reset: targets.slice(), values: loadConfig(db).values, warnings: loadConfig(db).warnings, state: configState(db) };
  const data = parseSchemeData(row).data;
  for (const id of targets) delete data[id];
  const ts = Date.now();
  writeSchemeData(db, active, data, ts);
  logScheme(db, active, "ui", ts);
  notifyChange(targets.slice());
  return { reset: targets.slice(), values: loadConfig(db).values, warnings: loadConfig(db).warnings, state: configState(db) };
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
  db.prepare("UPDATE mail_config_scheme SET name=?, updated_at=?, rev=rev+1 WHERE id=?").run(normalizeSchemeName(name), ts, String(id));
  logScheme(db, id, "ui", ts);
  return { id: String(id), state: configState(db) };
}

function schemeDelete(db, id) {
  if (!id) throw new Error("缺少方案 id");
  const row = schemeRow(db, id);
  if (!row) throw new Error("配置方案不存在：" + id);
  const ts = Date.now();
  tx(db, function () {
    db.prepare("UPDATE mail_config_scheme SET deleted_at=?, updated_at=?, rev=rev+1 WHERE id=?").run(ts, ts, String(id));
    if (activeSchemeId(db) === String(id)) metaDelete(db, "configScheme.mail.active");
    logScheme(db, id, "ui", ts);
  });
  return { id: String(id), state: configState(db) };
}

function schemeActivate(db, id) {
  if (id === undefined || id === null || id === "") {
    metaDelete(db, "configScheme.mail.active");
    return { id: null, state: configState(db) };
  }
  const row = schemeRow(db, id);
  if (!row) throw new Error("配置方案不存在：" + id);
  metaSet(db, "configScheme.mail.active", String(id));
  return { id: String(id), state: configState(db) };
}

export function registerConfigActions(api) {
  const db = api.db;
  ensureConfigSchemes(db);
  const action = api.action;
  action("mail.configGet", {
    description: "只读：邮件插件的配置项定义、当前值、当前方案与全部方案（远程图片、HTML 排版、打开即已读、每次加载封数、自动同步）",
    input: { type: "object", properties: {}, additionalProperties: false },
    execute: () => configState(api.db),
    render: (r) =>
      "邮件配置 " + Object.keys(r.values || {}).length + " 项；覆盖 " + Object.keys(r.overrides || {}).length + " 项" +
      (r.warnings && r.warnings.length ? "；warnings " + r.warnings.length : "") + "。",
  });
  action("mail.configSet", {
    description: "写入邮件插件的配置覆盖项（类型与范围校验，越界抛错）；配置写入当前方案，方案参与云端同步与备份，但从不含账户凭据",
    input: {
      type: "object",
      properties: {
        values: { type: "object", description: "要写入的配置项，如 {\"images.remote\": false, \"list.pageSize\": 30}" },
      },
      required: ["values"],
    },
    examples: [{ purpose: "关闭远程图片并改成每次 30 封", args: { values: { "images.remote": false, "list.pageSize": 30 } } }],
    execute: (args, ctx) => writeConfig(api.db, args.values, ctx && ctx.origin),
    render: (r) => "已更新邮件配置：" + (r.changed || []).join("、"),
  });
  action("mail.configReset", {
    description: "从当前方案里清除邮件配置覆盖项；不传 ids 表示全部重置",
    input: {
      type: "object",
      properties: { ids: { type: "array", items: { type: "string" }, description: "要重置的配置项 id 列表" } },
    },
    execute: (args) => resetConfig(api.db, args.ids),
    render: (r) => "已重置 " + (r.reset || []).length + " 个邮件配置项。",
  });


  api.action("mail.configSchemeCreate", {
    description: "新建配置方案并立即切换过去；from=current 复制当前值，from=default 从插件默认值开始",
    input: { type: "object", properties: { name: { type: "string", description: "方案名称，1–64 个字符" }, from: { type: "string", enum: ["current", "default"] } }, required: ["name"] },
    execute: function (args, ctx) { return schemeCreate(db, args && args.name, args && args.from, ctx && ctx.origin); },
    render: function (r) { return "已新建并启用配置方案：" + r.state.scheme.name; },
  });

  api.action("mail.configSchemeRename", {
    description: "重命名配置方案",
    input: { type: "object", properties: { id: { type: "string" }, name: { type: "string" } }, required: ["id", "name"] },
    execute: function (args) { return schemeRename(db, args && args.id, args && args.name); },
    render: function (r) { return "配置方案已改名：" + r.state.scheme.name; },
  });

  api.action("mail.configSchemeDelete", {
    description: "软删除配置方案；删除的是当前方案时回到「不使用方案」",
    input: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    execute: function (args) { return schemeDelete(db, args && args.id); },
    render: function () { return "配置方案已删除"; },
  });

  api.action("mail.configSchemeActivate", {
    description: "切换当前设备的配置方案；id 传空表示不使用方案、回到插件默认配置",
    input: { type: "object", properties: { id: { type: "string" } } },
    execute: function (args) { return schemeActivate(db, args && args.id); },
    render: function (r) { return r.id ? "已切换配置方案" : "已改为不使用方案（插件默认配置）"; },
  });


}
