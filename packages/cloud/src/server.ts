/**
 * wb-cloud：个人工作台云端（demo 版，06 文档）。
 * node:http + node:sqlite；数据文件在 --data 下。
 * 启动：node lib/server.js --port 8791 --data /Users/yyq/.dsh/workbench/cloud
 */
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { join } from "node:path";
import { openCloudDb } from "./store.js";
import { hashPassword, verifyPassword, issueSession, parseAccessToken, rotateRefresh, revokeDevice } from "./auth.js";
import {
  pushChangesV2,
  pullChangesV2,
  openSyncSession,
  snapshotTable,
  fullTable,
  closeSyncSession,
  SyncError,
} from "./sync.js";
import { uuidv7, monoNow } from "@wb/core";

const argv = process.argv.slice(2);
const argVal = (flag: string, dflt: string) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : dflt;
};
const PORT = Number(argVal("--port", "8791"));
const DATA_DIR = argVal("--data", join(process.env.HOME ?? "/tmp", ".dsh/workbench/cloud"));
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

/** 读请求体（≤16MB；树表 full 上限 16MB）。 */
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

  // ── 以下需要登录 ──
  const auth = parseAccessToken(db, req.headers.authorization as string | undefined);
  if (!auth) return json(res, 401, { ok: false, error: "unauthorized" });

  if (p === "/v1/me" && m === "GET") {
    const u = db.prepare("SELECT id,email,created_at FROM users WHERE id=?").get(auth.userId) as Record<
      string,
      unknown
    >;
    const devices = db.prepare("SELECT id,name,last_sync_at,cursors FROM devices WHERE user_id=?").all(auth.userId);
    return json(res, 200, { ok: true, user: u, devices });
  }
  const devM = /^\/v1\/devices\/([\w.-]+)$/.exec(p);
  if (devM && m === "DELETE") {
    revokeDevice(db, auth.userId, devM[1]);
    return json(res, 200, { ok: true });
  }
  // ── 同步 protocol v2 ──
  if (p === "/v1/sync/open" && m === "POST") {
    const b = await bodyJson(req);
    const deviceId = String(b.device_id ?? auth.deviceId);
    return json(res, 200, {
      ok: true,
      ...openSyncSession(db, auth.userId, deviceId, b.protocol),
    });
  }
  if (p === "/v1/sync/push" && m === "POST") {
    const b = await bodyJson(req);
    return json(res, 200, {
      ...pushChangesV2(
        db,
        auth.userId,
        auth.deviceId,
        String(b.client_epoch ?? ""),
        String(b.session_id ?? ""),
        b.changes,
      ),
    });
  }
  if (p === "/v1/sync/pull" && m === "POST") {
    const b = await bodyJson(req);
    return json(res, 200, {
      ...pullChangesV2(
        db,
        auth.userId,
        auth.deviceId,
        String(b.session_id ?? ""),
        b.cursors,
        b.limit,
      ),
    });
  }
  if (p === "/v1/sync/snapshot" && m === "POST") {
    const b = await bodyJson(req);
    return json(res, 200, {
      ...snapshotTable(db, auth.userId, auth.deviceId, String(b.session_id ?? ""), b.table),
    });
  }
  if (p === "/v1/sync/full" && m === "POST") {
    const b = await bodyJson(req);
    return json(res, 200, {
      ...fullTable(
        db,
        auth.userId,
        auth.deviceId,
        String(b.session_id ?? ""),
        b.table,
        b.base_version,
        b.rows,
      ),
    });
  }
  if (p === "/v1/sync/close" && m === "POST") {
    const b = await bodyJson(req);
    return json(res, 200, {
      ...closeSyncSession(
        db,
        auth.userId,
        auth.deviceId,
        b.session_id,
        b.success,
        b.cursors,
      ),
    });
  }
  return json(res, 404, { ok: false, error: `no route ${m} ${p}` });
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
    await route(req, res, url);
  } catch (err) {
    if (err instanceof SyncError) {
      json(res, err.status, { ok: false, code: err.code, error: err.message, ...err.extra });
      return;
    }
    json(res, 500, { ok: false, error: String((err as Error).message) });
  }
});
server.listen(PORT, "127.0.0.1", () => {
  console.log(`[wb-cloud] listening http://127.0.0.1:${PORT} data=${DATA_DIR}`);
});
