/**
 * 物品插件的配置项：白名单 schema + 本地读写。
 *
 * 配置只存覆盖项，默认值留在代码里；存放位置是已有的 meta 表
 * （键 `config.storage.<id>`），不建新表、不参与云端同步，也不进入备份。
 * 读取永远宽松：表缺失/JSON 坏/取值越界都回退默认值并给出 warnings；
 * 只有 configSet 会抛错（带 id 与原因）。
 */

import { logChange, tableExists, tx } from "../db/db.js";

export const DOMAIN = "storage";
export const SCHEMA_VERSION = 1;
export const SCHEME_TABLE = "storage_config_scheme";
const ACTIVE_KEY = "configScheme.storage.active";
const DEFAULT_SCHEME_NAME = "本机配置";

const GROUPS = [
  { id: "ui", zh: "界面", en: "Interface" },
  { id: "list", zh: "列表", en: "List" },
  { id: "data", zh: "数据", en: "Data" },
];
const option = (value) => ({ value, zh: String(value), en: String(value) });
const ITEMS = [
  {
    id: "list.pageSize",
    group: "list",
    type: "enum",
    default: 16,
    zh: "每页条数",
    en: "Page size",
    values: [8, 16, 24, 32, 48].map(option),
  },
  {
    id: "list.sortColumn",
    group: "list",
    type: "enum",
    default: "update_time",
    zh: "默认排序列",
    en: "Sort column",
    values: ["update_time", "create_time", "name", "brand", "stock", "location"].map(option),
  },
  {
    id: "list.sortOrder",
    group: "list",
    type: "enum",
    default: "desc",
    zh: "排序方向",
    en: "Sort order",
    values: ["asc", "desc"].map(option),
  },
  { id: "ui.bodyMode", group: "ui", type: "enum", default: "markdown", zh: "正文初始显示模式", en: "Initial body display mode",
    hintZh: "新挂载的描述使用此模式，每个正文块可独立切换。", hintEn: "Initial mode for newly mounted descriptions; each block can switch independently.",
    values: [{ value: "markdown", zh: "Markdown 渲染", en: "Rendered Markdown" }, { value: "text", zh: "纯文本", en: "Plain text" }] },
  { id: "ui.confirmDelete", group: "ui", type: "bool", default: true, zh: "删除前确认", en: "Confirm deletion" },
  {
    id: "data.pageSize",
    group: "data",
    type: "enum",
    default: 50,
    zh: "数据每页条数",
    en: "Data page size",
    values: [10, 25, 50, 100, 200].map(option),
  },
  { id: "data.includeDeleted", group: "data", type: "bool", default: false, zh: "包含已删除行", en: "Include deleted" },
  { id: "data.showSystemColumns", group: "data", type: "bool", default: false, zh: "显示系统列", en: "System columns" },
].map((item) => ({ surface: "ui", apply: "mount", ...item }));

const BY_ID = Object.create(null);
for (const item of ITEMS) BY_ID[item.id] = item;

function keyOf(id) {
  return "config." + DOMAIN + "." + id;
}

function ensureMeta(db) {
  if (!tableExists(db, "meta")) {
    db.exec("CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL);");
  }
}

function metaSet(db, key, value) {
  db.prepare("INSERT INTO meta(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").run(
    String(key),
    String(value),
  );
}

function metaDelete(db, key) {
  db.prepare("DELETE FROM meta WHERE k=?").run(String(key));
}

function metaRows(db) {
  try {
    return db.prepare("SELECT k,v FROM meta WHERE k LIKE ?").all("config." + DOMAIN + ".%");
  } catch (e) {
    return [];
  }
}


function optionsOf(item) {
  return (item.values || []).map(function (o) {
    return { value: o.value, zh: o.zh, en: o.en };
  });
}

function publicItem(item) {
  const out = {
    id: item.id,
    group: item.group,
    surface: item.surface,
    apply: item.apply,
    type: item.type,
    default: item.default,
    zh: item.zh,
    en: item.en,
    hintZh: item.hintZh || "",
    hintEn: item.hintEn || "",
  };
  if (item.values) out.options = optionsOf(item);
  if (item.min !== undefined) out.min = item.min;
  if (item.max !== undefined) out.max = item.max;
  return out;
}

/** 校验并规整一个值；失败时抛错（消息里带 id 与原因）。 */
export function coerceValue(item, raw) {
  if (!item) throw new Error("未知配置项：" + String(raw));
  const label = item.id;
  if (raw === undefined) throw new Error("配置项缺少值：" + label);
  if (item.type === "bool") {
    if (typeof raw !== "boolean") throw new Error(label + " 需要布尔值");
    return raw;
  }
  if (item.type === "int") {
    const n = Number(raw);
    if (!Number.isInteger(n)) throw new Error(label + " 需要整数");
    if (item.min !== undefined && n < item.min) throw new Error(label + " 不能小于 " + item.min);
    if (item.max !== undefined && n > item.max) throw new Error(label + " 不能大于 " + item.max);
    return n;
  }
  if (item.type === "enum") {
    const allowed = (item.values || []).map(function (o) {
      return o.value;
    });
    if (allowed.indexOf(raw) < 0) throw new Error(label + " 取值非法：" + JSON.stringify(raw));
    return raw;
  }
  if (item.type === "multi") {
    if (!Array.isArray(raw)) throw new Error(label + " 需要数组");
    const allowed = (item.values || []).map(function (o) {
      return o.value;
    });
    const seen = [];
    for (const v of raw) {
      if (allowed.indexOf(v) < 0) throw new Error(label + " 含非法取值：" + JSON.stringify(v));
      if (seen.indexOf(v) < 0) seen.push(v);
    }
    if (!seen.length) throw new Error(label + " 至少保留一项");
    return seen;
  }
  if (item.type === "string") {
    if (typeof raw !== "string") throw new Error(label + " 需要字符串");
    const max = item.maxLength || 200;
    if (raw.length > max) throw new Error(label + " 不能超过 " + max + " 个字符");
    return raw;
  }
  throw new Error(label + " 的类型不受支持：" + item.type);
}


/** 当前设备选中的方案 id（只存 meta，不同步）。 */
function activeSchemeId(db) {
  if (!tableExists(db, "meta")) return "";
  const row = db.prepare("SELECT v FROM meta WHERE k=?").get("configScheme.storage.active");
  return row ? String(row.v) : "";
}

function ensureSchemeTable(db) {
  db.exec("CREATE TABLE IF NOT EXISTS storage_config_scheme (id TEXT PRIMARY KEY, name TEXT NOT NULL, data TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, deleted_at INTEGER, rev INTEGER NOT NULL DEFAULT 1)");
}

function newSchemeId() {
  return "cs_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function schemeRow(db, id) {
  if (!id || !tableExists(db, "storage_config_scheme")) return null;
  return db.prepare("SELECT * FROM storage_config_scheme WHERE id=? AND deleted_at IS NULL").get(String(id)) || null;
}

function listSchemes(db) {
  if (!tableExists(db, "storage_config_scheme")) return [];
  return db.prepare("SELECT id,name,created_at,updated_at,rev FROM storage_config_scheme WHERE deleted_at IS NULL ORDER BY created_at ASC, id ASC").all().map(function (r) {
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
    const item = BY_ID[id];
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
  const row = db.prepare("SELECT * FROM storage_config_scheme WHERE id=?").get(String(id));
  if (!row) return;
  const op = row.deleted_at === null || row.deleted_at === undefined ? "upsert" : "delete";
  logChange(db, "storage_config_scheme", id, op, origin || "ui", ts);
}

function insertScheme(db, id, name, data, ts) {
  db.prepare("INSERT INTO storage_config_scheme (id,name,data,created_at,updated_at,deleted_at,rev) VALUES(?,?,?,?,?,NULL,1)").run(String(id), String(name), JSON.stringify(data || {}), ts, ts);
}

function writeSchemeData(db, id, data, ts) {
  db.prepare("UPDATE storage_config_scheme SET data=?, updated_at=?, rev=rev+1 WHERE id=? AND deleted_at IS NULL").run(JSON.stringify(data || {}), ts, String(id));
}

function createScheme(db, name, data, origin) {
  const ts = Date.now();
  const id = newSchemeId();
  tx(db, function () {
    insertScheme(db, id, name, data, ts);
    metaSet(db, "configScheme.storage.active", id);
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
    metaDelete(db, "configScheme.storage.active");
  }
  const overrides = Object.create(null);
  const keys = [];
  for (const row of metaRows(db)) {
    const id = String(row.k).slice(("config." + DOMAIN + ".").length);
    const item = BY_ID[id];
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
    metaSet(db, "configScheme.storage.active", id);
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
    metaDelete(db, "configScheme.storage.active");
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
    table: "storage_config_scheme",
    scheme: loaded.scheme,
    schemes: listSchemes(db),
  };
}

function writeValues(db, raw, origin) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("values 需要 { 配置项: 值 } 形式");
  const ids = Object.keys(raw);
  if (!ids.length) throw new Error("没有要保存的配置项");
  const prepared = [];
  for (const id of ids) {
    const item = BY_ID[id];
    if (!item) throw new Error("未知配置项：" + id + "（可用 storage.configOptions 查看全部）");
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
  const values = Object.create(null);
  for (const p of prepared) values[p.id] = p.value;
  return {
    changed: prepared.map(function (r) { return r.id; }),
    values: values,
    state: configState(db),
    updatedAt: ts,
    origin: String(origin || "ui"),
    schemeId: schemeId,
  };
}

function resetValues(db, ids) {
  let targets = ids;
  if (targets === undefined || targets === null || !Array.isArray(targets) || !targets.length) {
    targets = ITEMS.map(function (i) { return i.id; });
  }
  for (const id of targets) {
    if (!BY_ID[id]) throw new Error("未知配置项：" + id);
  }
  const active = activeSchemeId(db);
  const row = active ? schemeRow(db, active) : null;
  if (!row) return { reset: targets, state: configState(db) };
  const data = parseSchemeData(row).data;
  for (const id of targets) delete data[id];
  const ts = Date.now();
  writeSchemeData(db, active, data, ts);
  logScheme(db, active, "ui", ts);
  return { reset: targets, state: configState(db) };
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
  db.prepare("UPDATE storage_config_scheme SET name=?, updated_at=?, rev=rev+1 WHERE id=?").run(normalizeSchemeName(name), ts, String(id));
  logScheme(db, id, "ui", ts);
  return { id: String(id), state: configState(db) };
}

function schemeDelete(db, id) {
  if (!id) throw new Error("缺少方案 id");
  const row = schemeRow(db, id);
  if (!row) throw new Error("配置方案不存在：" + id);
  const ts = Date.now();
  tx(db, function () {
    db.prepare("UPDATE storage_config_scheme SET deleted_at=?, updated_at=?, rev=rev+1 WHERE id=?").run(ts, ts, String(id));
    if (activeSchemeId(db) === String(id)) metaDelete(db, "configScheme.storage.active");
    logScheme(db, id, "ui", ts);
  });
  return { id: String(id), state: configState(db) };
}

function schemeActivate(db, id) {
  if (id === undefined || id === null || id === "") {
    metaDelete(db, "configScheme.storage.active");
    return { id: null, state: configState(db) };
  }
  const row = schemeRow(db, id);
  if (!row) throw new Error("配置方案不存在：" + id);
  metaSet(db, "configScheme.storage.active", String(id));
  return { id: String(id), state: configState(db) };
}

function renderItems(items) {
  return items.join(", ");
}

export function registerConfigActions(api) {
  const db = api.db;
  ensureConfigSchemes(db);

  api.action("storage.configGet", {
    description: "读取物品插件的配置项、当前方案与全部方案；方案参与云端同步与备份，当前选中哪个方案只在本机",
    input: { type: "object", properties: {} },
    execute: function () {
      return configState(db);
    },
    render: function (s) {
      const lines = ["物品配置（" + s.items.length + " 项）"];
      for (const item of s.items)
        lines.push(
          "- " +
            item.id +
            " = " +
            JSON.stringify(s.values[item.id]) +
            (s.overrides[item.id] === undefined ? "（默认）" : ""),
        );
      for (const w of s.warnings || []) lines.push("! " + w.message);
      return lines.join("\n");
    },
  });

  api.action("storage.configSet", {
    description: "保存一项或多项配置到当前方案（白名单校验，整批原子）；未选方案时自动新建「本机配置」方案",
    input: {
      type: "object",
      properties: {
        values: { type: "object", description: "要保存的配置项，键为配置 id、值为新值", additionalProperties: true },
      },
      required: ["values"],
    },
    examples: [{ values: { "list.pageSize": 24, "ui.confirmDelete": true } }],
    execute: function (args, ctx) {
      return writeValues(db, args && args.values, ctx && ctx.origin);
    },
    render: function (r) {
      return "已保存物品配置：" + renderItems(r.changed);
    },
  });

  api.action("storage.configReset", {
    description: "从当前方案里删除配置覆盖项（回到插件默认值）；未选方案时不做任何修改",
    input: {
      type: "object",
      properties: { ids: { type: "array", items: { type: "string" }, description: "要重置的配置 id" } },
    },
    execute: function (args) {
      return resetValues(db, args && args.ids);
    },
    render: function (r) {
      return "已恢复默认：" + renderItems(r.reset);
    },
  });


  api.action("storage.configSchemeCreate", {
    description: "新建配置方案并立即切换过去；from=current 复制当前值，from=default 从插件默认值开始",
    input: { type: "object", properties: { name: { type: "string", description: "方案名称，1–64 个字符" }, from: { type: "string", enum: ["current", "default"] } }, required: ["name"] },
    execute: function (args, ctx) { return schemeCreate(db, args && args.name, args && args.from, ctx && ctx.origin); },
    render: function (r) { return "已新建并启用配置方案：" + r.state.scheme.name; },
  });

  api.action("storage.configSchemeRename", {
    description: "重命名配置方案",
    input: { type: "object", properties: { id: { type: "string" }, name: { type: "string" } }, required: ["id", "name"] },
    execute: function (args) { return schemeRename(db, args && args.id, args && args.name); },
    render: function (r) { return "配置方案已改名：" + r.state.scheme.name; },
  });

  api.action("storage.configSchemeDelete", {
    description: "软删除配置方案；删除的是当前方案时回到「不使用方案」",
    input: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    execute: function (args) { return schemeDelete(db, args && args.id); },
    render: function () { return "配置方案已删除"; },
  });

  api.action("storage.configSchemeActivate", {
    description: "切换当前设备的配置方案；id 传空表示不使用方案、回到插件默认配置",
    input: { type: "object", properties: { id: { type: "string" } } },
    execute: function (args) { return schemeActivate(db, args && args.id); },
    render: function (r) { return r.id ? "已切换配置方案" : "已改为不使用方案（插件默认配置）"; },
  });

  api.action("storage.configOptions", {
    description: "列出可配置项、类型与默认值（给 agent 查 id 用）",
    input: { type: "object", properties: {} },
    execute: function () {
      const s = configState(db);
      return { domain: DOMAIN, groups: s.groups, items: s.items };
    },
    render: function (r) {
      const lines = ["可配置项 " + r.items.length + " 个"];
      for (const item of r.items) {
        lines.push(
          "- " +
            item.id +
            "（" +
            item.type +
            "，" +
            item.surface +
            "）默认 " +
            JSON.stringify(item.default) +
            (item.options
              ? "，可选 " +
                item.options
                  .map(function (o) {
                    return o.value;
                  })
                  .join("/")
              : ""),
        );
      }
      return lines.join("\n");
    },
  });
}

export const CONFIG_GROUPS = GROUPS;
export const CONFIG_ITEMS = ITEMS;
