/**
 * wb-cloud：个人工作台云端（demo 版，06 文档）。
 * node:http + node:sqlite；数据文件与 tarball 目录在 --data 下。
 * 启动：node lib/server.js --port 8791 --data /Users/yyq/.dsh/workbench/cloud
 */
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { openCloudDb } from "./store.js";
import { hashPassword, verifyPassword, issueSession, parseAccessToken, rotateRefresh, revokeDevice } from "./auth.js";
import { pushChanges, pullChanges } from "./sync.js";
import {
  listAddons,
  addonDetail,
  publishVersion,
  yankVersion,
  catalogChanges,
  recordDownload,
  sha256Of,
} from "./catalog.js";
import { uuidv7, monoNow } from "@wb/core";

const argv = process.argv.slice(2);
const argVal = (flag: string, dflt: string) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : dflt;
};
const PORT = Number(argVal("--port", "8791"));
const DATA_DIR = argVal("--data", join(process.env.HOME ?? "/tmp", ".dsh/workbench/cloud"));
mkdirSync(join(DATA_DIR, "dl"), { recursive: true });
const db = openCloudDb(join(DATA_DIR, "cloud.db"));

/** JSON 响应小工具。 */
function json(_res: ServerResponse, code: number, body: unknown): void {
  _res.writeHead(code, { "content-type": "application/json; charset=utf-8" });
  _res.end(JSON.stringify(body));
}

/** 解析请求体为 JSON；兼容 curl 默认 form-urlencoded（demo 容错）。 */
async function bodyJson(req: IncomingMessage): Promise<any> {
  const raw = (await readBody(req)).toString();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    const o: Record<string, string> = {};
    for (const [k, v] of new URLSearchParams(raw)) o[k] = v;
    return o;
  }
}

/** 读请求体（≤16MB；publish 的 base64 tarball 需要余量）。 */
async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let n = 0;
  for await (const c of req) {
    n += (c as Buffer).length;
    if (n > 16 * 1024 * 1024) throw new Error("body too large");
    chunks.push(c as Buffer);
  }
  return Buffer.concat(chunks);
}

/** 与 packages/shell 的 SHELL_VERSION 保持一致：决定 catalog 兼容过滤。 */
const SHELL_VERSION = "0.2.0";
const PUBLISH_TOKEN = argVal("--publish-token", process.env.WB_PUBLISH_TOKEN ?? "");

async function route(req: IncomingMessage, res: ServerResponse, url: URL): Promise<void> {
  const p = url.pathname;
  const m = req.method ?? "GET";

  // ── 认证 ──
  if (p === "/v1/auth/signup" && m === "POST") {
    const b = await bodyJson(req);
    if (!b.email || !b.password) return json(res, 400, { ok: false, error: "email/password required" });
    if (db.prepare("SELECT 1 FROM users WHERE email=?").get(b.email))
      return json(res, 409, { ok: false, error: "email exists" });
    const id = uuidv7();
    db.prepare("INSERT INTO users(id,email,pass_hash,created_at) VALUES(?,?,?,?)").run(
      id,
      b.email,
      await hashPassword(b.password),
      monoNow(),
    );
    const s = await issueSession(db, id, String(b.device_id ?? uuidv7()), b.device_name);
    return json(res, 200, { ok: true, ...s });
  }
  if (p === "/v1/auth/login" && m === "POST") {
    const b = await bodyJson(req);
    const u = db.prepare("SELECT * FROM users WHERE email=?").get(b.email) as
      | { id: string; pass_hash: string }
      | undefined;
    if (!u || !(await verifyPassword(String(b.password), u.pass_hash)))
      return json(res, 401, { ok: false, error: "bad credentials" });
    const s = await issueSession(db, u.id, String(b.device_id ?? uuidv7()), b.device_name);
    return json(res, 200, { ok: true, ...s });
  }
  if (p === "/v1/auth/refresh" && m === "POST") {
    const b = await bodyJson(req);
    const s = rotateRefresh(db, String(b.refresh_token ?? ""));
    return s ? json(res, 200, { ok: true, ...s }) : json(res, 401, { ok: false, error: "invalid or reused refresh" });
  }

  // ── 目录（公开只读）──
  if (p === "/v1/catalog/addons" && m === "GET") {
    return json(res, 200, { ok: true, addons: listAddons(db, url.searchParams.get("shell") ?? SHELL_VERSION) });
  }
  const catDetail = /^\/v1\/catalog\/addons\/([\w.-]+)$/.exec(p);
  if (catDetail && m === "GET") {
    const d = addonDetail(db, catDetail[1], url.searchParams.get("shell") ?? SHELL_VERSION);
    return d ? json(res, 200, { ok: true, addon: d }) : json(res, 404, { ok: false, error: "not found" });
  }
  if (p === "/v1/catalog/changes" && m === "GET") {
    const since = Number(url.searchParams.get("since") ?? 0);
    return json(res, 200, {
      ok: true,
      changes: catalogChanges(db, since, url.searchParams.get("shell") ?? SHELL_VERSION),
      at: Date.now(),
    });
  }
  const dl = /^\/dl\/([\w.-]+)@([\w.-]+)\.tgz$/.exec(p);
  if (dl && m === "GET") {
    const f = join(DATA_DIR, "dl", `${dl[1]}@${dl[2]}.tgz`);
    if (!existsSync(f)) return json(res, 404, { ok: false, error: "no such package" });
    recordDownload(db, dl[1], dl[2]);
    const buf = readFileSync(f);
    res.writeHead(200, { "content-type": "application/gzip", "content-length": String(buf.length) });
    res.end(buf);
    return;
  }

  // ── 发布（demo：简单 token 门；生产走 CI + API key）──
  if (p === "/v1/publish" && m === "POST") {
    if (req.headers["x-publish-token"] !== PUBLISH_TOKEN)
      return json(res, 403, { ok: false, error: "publish token required" });
    const raw = await readBody(req);
    // demo 协议：body = JSON {meta:{...}, tgzBase64:"..."} —— 避免手写 multipart
    let b: any;
    try {
      b = JSON.parse(raw.toString());
    } catch {
      return json(res, 400, { ok: false, error: "invalid JSON body" });
    }
    const meta = b && b.meta ? b.meta : {};
    const id = String(meta.addon_id ?? "");
    const version = String(meta.version ?? "");
    const minShell = String(meta.min_shell ?? "0.1.0");
    // 发布即写入 dl/<id>@<ver>.tgz 路径：id/version 必须先过白名单，防路径穿越
    if (!/^[a-z][a-z0-9_-]*$/i.test(id)) return json(res, 400, { ok: false, error: "invalid addon_id" });
    if (!/^\d+\.\d+\.\d+$/.test(version)) return json(res, 400, { ok: false, error: "invalid version" });
    if (!/^\d+\.\d+\.\d+$/.test(minShell)) return json(res, 400, { ok: false, error: "invalid min_shell" });
    let buf: Buffer;
    try {
      buf = Buffer.from(String(b.tgzBase64 ?? ""), "base64");
    } catch {
      return json(res, 400, { ok: false, error: "invalid tgzBase64" });
    }
    if (buf.length === 0) return json(res, 400, { ok: false, error: "empty tarball" });
    if (buf.length > 12 * 1024 * 1024) return json(res, 413, { ok: false, error: "tarball too large" });
    const file = join(DATA_DIR, "dl", id + "@" + version + ".tgz");
    writeFileSync(file, buf);
    publishVersion(db, {
      ...meta,
      addon_id: id,
      version,
      min_shell: minShell,
      file_size: buf.length,
      sha256: sha256Of(buf),
    });
    return json(res, 200, { ok: true, sha256: sha256Of(buf), tarball: "/dl/" + id + "@" + version + ".tgz" });
  }
  const yankM = /^\/v1\/catalog\/addons\/([\w.-]+)\/yank$/.exec(p);
  if (yankM && m === "POST") {
    if (req.headers["x-publish-token"] !== PUBLISH_TOKEN)
      return json(res, 403, { ok: false, error: "publish token required" });
    const b = await bodyJson(req);
    return yankVersion(db, yankM[1], String(b.version)) ? json(res, 200, { ok: true }) : json(res, 404, { ok: false });
  }

  // ── 以下需要登录 ──
  const auth = parseAccessToken(db, req.headers.authorization as string | undefined);
  if (!auth) return json(res, 401, { ok: false, error: "unauthorized" });

  if (p === "/v1/me" && m === "GET") {
    const u = db.prepare("SELECT id,email,created_at FROM users WHERE id=?").get(auth.userId) as Record<
      string,
      unknown
    >;
    const devices = db.prepare("SELECT id,name,last_cursor FROM devices WHERE user_id=?").all(auth.userId);
    return json(res, 200, { ok: true, user: u, devices });
  }
  const devM = /^\/v1\/devices\/([\w.-]+)$/.exec(p);
  if (devM && m === "DELETE") {
    revokeDevice(db, auth.userId, devM[1]);
    return json(res, 200, { ok: true });
  }
  if (p === "/v1/sync/push" && m === "POST") {
    const b = await bodyJson(req);
    const r = pushChanges(db, auth.userId, auth.deviceId, Array.isArray(b.changes) ? b.changes : []);
    db.prepare("UPDATE devices SET last_cursor=? WHERE user_id=? AND id=?").run(
      Math.max(r.accepted_up_to, 0),
      auth.userId,
      auth.deviceId,
    );
    return json(res, 200, { ok: true, ...r, cursor: serverCursor(auth.userId) });
  }
  if (p === "/v1/sync/pull" && m === "GET") {
    const cursor = Number(url.searchParams.get("cursor") ?? 0);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 500), 2000);
    return json(res, 200, { ok: true, ...pullChanges(db, auth.userId, cursor, limit) });
  }
  return json(res, 404, { ok: false, error: `no route ${m} ${p}` });
}

function serverCursor(userId: string): number {
  const row = db.prepare("SELECT MAX(server_seq) m FROM change_log WHERE user_id=?").get(userId) as {
    m: number | null;
  };
  return row.m ?? 0;
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
    await route(req, res, url);
  } catch (err) {
    json(res, 500, { ok: false, error: String((err as Error).message) });
  }
});
server.listen(PORT, "127.0.0.1", () => {
  console.log(`[wb-cloud] listening http://127.0.0.1:${PORT} data=${DATA_DIR}`);
});
