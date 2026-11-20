"use strict";

import { findLive, liveRows, mapRow, newId, now, tx } from "../db/db.js";

export const TONES = ["normal", "accent", "success", "warn", "danger"];
export const MAX_BODY = 100;
const STEP = 10;

function fail(message) {
  throw new Error(message);
}

function normalizeBody(raw) {
  if (typeof raw !== "string") fail("body 需要字符串");
  const text = raw.replace(/\s+/g, " ").trim();
  if (!text) fail("body 不能为空");
  if (Array.from(text).length > MAX_BODY) fail(`body 不能超过 ${MAX_BODY} 个字符`);
  return text;
}

function readTone(raw, fallback) {
  if (raw === undefined || raw === null) return fallback || "normal";
  if (typeof raw !== "string" || TONES.indexOf(raw) < 0) fail("tone 只接受：" + TONES.join(" / "));
  return raw;
}

export function listItems(db) {
  const rows = liveRows(db).map(mapRow);
  const paused = rows.filter((item) => !item.enabled).length;
  return { items: rows, total: rows.length, paused, enabled: rows.length - paused };
}

function nextOrder(db) {
  const row = db.prepare("SELECT MAX(sort_order) AS m FROM danmaku WHERE deleted_at IS NULL").get();
  const max = Number(row && row.m);
  return (Number.isFinite(max) ? max : 0) + STEP;
}

function assertUnique(db, body, exceptId) {
  const row = db.prepare("SELECT id FROM danmaku WHERE lower(body) = lower(?) AND deleted_at IS NULL").get(body);
  if (row && row.id !== exceptId) fail("这条弹幕已在库里，无需重复添加");
}

export function createItem(db, args) {
  const body = normalizeBody(args.body);
  const tone = readTone(args.tone, "normal");
  assertUnique(db, body, "");
  const ts = now();
  const id = newId("dm");
  const order = nextOrder(db);
  db.prepare(
    "INSERT INTO danmaku(id, body, tone, enabled, sort_order, created_at, updated_at, rev) VALUES(?, ?, ?, 1, ?, ?, ?, 1)",
  ).run(id, body, tone, order, ts, ts);
  return { item: findLive(db, id) };
}

export function updateItem(db, args) {
  const id = String(args.id || "");
  if (!id) fail("id 必填");
  const item = findLive(db, id);
  if (!item) fail("弹幕不存在或已删除");
  const fields = [];
  const params = [];
  if (args.body !== undefined) {
    const body = normalizeBody(args.body);
    assertUnique(db, body, id);
    fields.push("body = ?");
    params.push(body);
  }
  if (args.tone !== undefined) {
    fields.push("tone = ?");
    params.push(readTone(args.tone, item.tone));
  }
  if (args.enabled !== undefined) {
    if (typeof args.enabled !== "boolean") fail("enabled 需要布尔值");
    fields.push("enabled = ?");
    params.push(args.enabled ? 1 : 0);
  }
  if (!fields.length) return { item };
  fields.push("updated_at = ?", "rev = rev + 1");
  params.push(now());
  params.push(id);
  db.prepare("UPDATE danmaku SET " + fields.join(", ") + " WHERE id = ? AND deleted_at IS NULL").run(...params);
  return { item: findLive(db, id) };
}

export function removeItem(db, args) {
  const id = String(args.id || "");
  if (!id) fail("id 必填");
  const item = findLive(db, id);
  if (!item) fail("弹幕不存在或已删除");
  const ts = now();
  db.prepare("UPDATE danmaku SET deleted_at = ?, updated_at = ?, rev = rev + 1 WHERE id = ?").run(ts, ts, id);
  return { id };
}

export function reorderItems(db, args) {
  const ids = Array.isArray(args.ids) ? args.ids.map((id) => String(id)) : [];
  if (!ids.length) fail("ids 必填且不能为空");
  const known = new Map(liveRows(db).map((row) => [row.id, row]));
  const ts = now();
  tx(db, () => {
    ids.forEach((id, index) => {
      if (!known.has(id)) return;
      db.prepare("UPDATE danmaku SET sort_order = ?, updated_at = ?, rev = rev + 1 WHERE id = ?").run(index * STEP, ts, id);
    });
  });
  return listItems(db);
}

export function registerManageActions(api, deps) {
  const db = api.db;

  api.action("danmaku.list", {
    description: "弹幕库列表：按 sort_order 返回未删除的弹幕，以及启用/停用计数",
    input: { type: "object", properties: {}, additionalProperties: false },
    execute: () => listItems(db),
    render: (r) => `弹幕库 ${r.total} 条（启用 ${r.enabled}）`,
  });

  api.action("danmaku.create", {
    description: "新增一条弹幕；同一内容（忽略大小写）在库中唯一，重复会报错",
    input: {
      type: "object",
      properties: {
        body: { type: "string", description: "弹幕内容，空白折叠，最长 100 字" },
        tone: { type: "string", enum: TONES, description: "颜色主题，默认 normal" },
      },
      required: ["body"],
      additionalProperties: false,
    },
    execute: (args) => {
      const out = createItem(db, args);
      deps.changed("create", out.item.id);
      return out;
    },
    render: (r) => `已添加弹幕：${r.item.body}`,
  });

  api.action("danmaku.update", {
    description: "修改一条弹幕的内容、颜色或启停状态；只传要改的字段",
    input: {
      type: "object",
      properties: {
        id: { type: "string", description: "弹幕 id" },
        body: { type: "string", description: "新内容，最长 100 字" },
        tone: { type: "string", enum: TONES, description: "颜色主题" },
        enabled: { type: "boolean", description: "是否参与轮播" },
      },
      required: ["id"],
      additionalProperties: false,
    },
    execute: (args) => {
      const out = updateItem(db, args);
      deps.changed("update", out.item.id);
      return out;
    },
    render: (r) => `已保存弹幕：${r.item.body}`,
  });

  api.action("danmaku.remove", {
    description: "软删除一条弹幕；删除后不再参与轮播，相同内容之后可以重新添加",
    input: {
      type: "object",
      properties: { id: { type: "string", description: "弹幕 id" } },
      required: ["id"],
      additionalProperties: false,
    },
    execute: (args) => {
      const out = removeItem(db, args);
      deps.changed("remove", out.id);
      return out;
    },
    render: (r) => `已删除弹幕 ${r.id}`,
  });

  api.action("danmaku.reorder", {
    description: "按传入的 id 顺序重排弹幕库（决定「按列表顺序」轮播的次序）",
    input: {
      type: "object",
      properties: {
        ids: { type: "array", items: { type: "string" }, description: "完整的目标顺序；未知 id 会被忽略" },
      },
      required: ["ids"],
      additionalProperties: false,
    },
    execute: (args) => {
      const out = reorderItems(db, args);
      deps.changed("reorder", "");
      return out;
    },
    render: (r) => `弹幕顺序已更新，共 ${r.total} 条`,
  });

  api.action("danmaku.preview", {
    description: "立刻让一条弹幕（默认随机一条启用中的）在界面层和桌面层各预览一次，不改库",
    input: {
      type: "object",
      properties: { id: { type: "string", description: "要预览的弹幕 id；省略则随机一条" } },
      additionalProperties: false,
    },
    execute: (args) => {
      const out = deps.player.preview(args.id ? String(args.id) : "");
      if (!out) fail("没有启用中的弹幕可预览");
      return out;
    },
    render: (r) => `已预览：${r.body}`,
  });
}
