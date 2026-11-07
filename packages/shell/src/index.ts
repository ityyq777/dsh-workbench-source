/**
 * dsh-workbench：个人工作台 DSH 宿主插件。
 * 契约要点（已验证）：named export name/inject/apply；绝不 default export
 * （cordis-plugin-loader unwrapExports 优先取 exports.default，裸函数会丢具名 inject）。
 *
 * 本版把「任务记录」彻底改成子插件：壳只提供数据库、同步、SSE、addon 生命周期。
 */
import { homedir } from "node:os";
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { openDb } from "@wb/core";
import type { DatabaseSync } from "node:sqlite";
import { runSyncRound, type CloudClient } from "./sync.js";
import { AddonManager } from "./addons.js";

export const name = "dsh-workbench";
export const inject = ["webServer", "tools", "connection"];

/** 本地库与云端配置路径（05 文档约定目录）。 */
const WB_HOME = process.env.WB_HOME ?? join(homedir(), ".dsh", "workbench");
const CLOUD_DEFAULT = process.env.WB_CLOUD_URL ?? "http://127.0.0.1:8791";

/** 壳 API 版本：子插件 manifest.minShell 与云端兼容过滤都用它。 */
const SHELL_VERSION = "0.1.0";

interface WbState {
  db: DatabaseSync;
  creds: { accessToken: string; refreshToken: string; userId: string; deviceId: string } | null;
  cloudUrl: string;
}

/** 读登录凭据（demo：明文 JSON 于 0600 文件；生产 keychain）。 */
function loadCreds(): WbState["creds"] {
  try {
    return JSON.parse(readFileSync(join(WB_HOME, "cloud-creds.json"), "utf8"));
  } catch {
    return null;
  }
}

function saveCreds(creds: WbState["creds"] | null): void {
  mkdirSync(WB_HOME, { recursive: true });
  if (creds) {
    writeFileSync(join(WB_HOME, "cloud-creds.json"), JSON.stringify(creds), { mode: 0o600 });
  } else if (existsSync(join(WB_HOME, "cloud-creds.json"))) {
    rmSync(join(WB_HOME, "cloud-creds.json"));
  }
}

/** SSE 订阅者集合（UI 实时刷新）。 */
type Subscriber = (event: string, data: unknown) => void;

export function apply(ctx: any): void {
  const state: WbState = { db: openDb(join(WB_HOME, "workbench.db")), creds: loadCreds(), cloudUrl: CLOUD_DEFAULT };
  const subscribers = new Set<Subscriber>();
  const emit = (event: string, data: unknown) => {
    for (const s of subscribers) s(event, data);
  };

  /** 云端 fetch 封装（带 access token；401 时尝试 refresh 一次）。 */
  async function cloudFetch(path: string, init?: RequestInit & { json?: unknown }, retry = true): Promise<any> {
    const headers: Record<string, string> = {
      "content-type": "application/json",
      ...(init?.headers as Record<string, string>),
    };
    if (state.creds) headers.authorization = "Bearer " + state.creds.accessToken;
    const res = await fetch(state.cloudUrl + path, {
      ...init,
      headers,
      body: init?.json ? JSON.stringify(init.json) : init?.body,
    });
    if (res.status === 401 && retry && state.creds?.refreshToken) {
      const r = await fetch(state.cloudUrl + "/v1/auth/refresh", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ refresh_token: state.creds.refreshToken }),
      }).then((x) => x.json());
      if (r.ok) {
        state.creds = {
          accessToken: r.accessToken,
          refreshToken: r.refreshToken,
          userId: r.userId,
          deviceId: r.deviceId,
        };
        saveCreds(state.creds);
        return cloudFetch(path, init, false);
      }
      state.creds = null;
      saveCreds(null);
    }
    return res.json();
  }

  const manager = new AddonManager({
    home: WB_HOME,
    db: state.db,
    shellVersion: SHELL_VERSION,
    cloudUrl: state.cloudUrl,
    cloudFetch: (path, init) => cloudFetch(path, init),
    emit,
    logger: (...args: unknown[]) => console.warn("[dsh-workbench]", ...args),
  });

  void manager
    .init()
    .then(() => emit("addons-changed", manager.list()))
    .catch((e) => console.warn("[dsh-workbench] addon init failed:", e));

  // ── HTTP：/workbench/api/*（同域 cookie 之外的连接门由 host connection.requestRejection 兜底）──
  ctx.effect?.(
    () =>
      ctx.webServer?.register(
        {
          kind: "prefix" as const,
          path: "/workbench/api",
          handler: async (req: any, res: any) => {
            const rejection = ctx.connection?.requestRejection?.(req);
            if (rejection !== undefined) {
              res.statusCode = rejection;
              res.end(JSON.stringify({ ok: false, error: "connection rejected" }));
              return;
            }
            const url = new URL(req.url ?? "", "http://local");
            const p = url.pathname.replace(/^\/workbench\/api/, "");
            const m = req.method ?? "GET";
            const bodyOf = async () => {
              const chunks: Buffer[] = [];
              for await (const c of req) chunks.push(c as Buffer);
              try {
                return JSON.parse(Buffer.concat(chunks).toString() || "{}");
              } catch {
                return {};
              }
            };
            const send = (code: number, obj: unknown) => {
              res.writeHead(code, { "content-type": "application/json" });
              res.end(JSON.stringify(obj));
            };

            try {
              if (p === "/events" && m === "GET") {
                // SSE：addon 事件 / 安装态 / 同步状态推送给 UI
                res.writeHead(200, {
                  "content-type": "text/event-stream",
                  "cache-control": "no-cache",
                  connection: "keep-alive",
                });
                const sub: Subscriber = (event, data) =>
                  res.write("event: " + event + "\ndata: " + JSON.stringify(data) + "\n\n");
                subscribers.add(sub);
                req.on?.("close", () => subscribers.delete(sub));
                return;
              }

              if (p === "/addons" && m === "GET") {
                return send(200, { ok: true, addons: manager.list(), shellVersion: SHELL_VERSION });
              }
              if (p === "/addons/catalog" && m === "GET") {
                return send(200, await manager.catalog());
              }
              // 兼容旧 UI/脚本
              if (p === "/catalog" && m === "GET") {
                return send(200, await manager.catalog());
              }

              const clientM = /^\/addons\/([^/]+)\/client\.js$/.exec(p);
              if (clientM && m === "GET") {
                const id = decodeURIComponent(clientM[1]);
                const file = manager.clientPath(id);
                if (!file) return send(404, { ok: false, error: "addon 没有客户端模块" });
                const code = readFileSync(file);
                res.writeHead(200, {
                  "content-type": "text/javascript; charset=utf-8",
                  "cache-control": "no-store",
                });
                res.end(code);
                return;
              }

              const installM = /^\/addons\/([^/]+)\/install$/.exec(p);
              if (installM && m === "POST") {
                const id = decodeURIComponent(installM[1]);
                const addon = await manager.install(id);
                return send(200, { ok: true, addon });
              }

              const actionM = /^\/addons\/([^/]+)\/actions\/([^/]+)$/.exec(p);
              if (actionM && m === "POST") {
                const id = decodeURIComponent(actionM[1]);
                const action = decodeURIComponent(actionM[2]);
                const owner = manager.actionNames().find((a) => a.name === action);
                if (!owner || owner.addonId !== id) {
                  return send(404, { ok: false, error: "子插件未注册该 action：" + action });
                }
                const body = await bodyOf();
                const r = await manager.invoke(action, body, "ui");
                return send(200, { ok: true, result: r.result, text: r.text });
              }

              const delM = /^\/addons\/([^/]+)$/.exec(p);
              if (delM && m === "DELETE") {
                const id = decodeURIComponent(delM[1]);
                const r = await manager.uninstall(id);
                return send(200, { ok: true, ...r });
              }

              if (p === "/sync/now" && m === "POST") {
                if (!state.creds) return send(400, { ok: false, error: "not logged in" });
                const client: CloudClient = {
                  push: (changes) => cloudFetch("/v1/sync/push", { method: "POST", json: { changes } }),
                  pull: (cursor) => cloudFetch("/v1/sync/pull?cursor=" + cursor),
                };
                const r = await runSyncRound(state.db, client, state.creds.deviceId);
                emit("sync-done", r);
                return send(200, { ok: true, ...r });
              }
              if (p === "/account" && m === "GET") {
                if (!state.creds) return send(200, { ok: true, logged_in: false });
                const me = await cloudFetch("/v1/me");
                return send(200, { ok: true, logged_in: true, user: me.user, devices: me.devices });
              }
              if (p === "/account/login" && m === "POST") {
                const b = await bodyOf();
                const deviceId = state.creds?.deviceId ?? "shell-" + Math.random().toString(36).slice(2, 10);
                const r = await cloudFetch(b.signup ? "/v1/auth/signup" : "/v1/auth/login", {
                  method: "POST",
                  json: { email: b.email, password: b.password, device_id: deviceId, device_name: "DSH Web" },
                });
                if (r.ok) {
                  state.creds = {
                    accessToken: r.accessToken,
                    refreshToken: r.refreshToken,
                    userId: r.userId,
                    deviceId: r.deviceId,
                  };
                  saveCreds(state.creds);
                  emit("account-changed", { logged_in: true });
                }
                return send(r.ok ? 200 : 401, r);
              }
              if (p === "/account/logout" && m === "POST") {
                state.creds = null;
                saveCreds(null);
                emit("account-changed", { logged_in: false });
                return send(200, { ok: true });
              }

              return send(404, { ok: false, error: "no route " + m + " " + p });
            } catch (e) {
              return send(500, { ok: false, error: String((e && (e as Error).message) || e) });
            }
          },
        },
        "workbench-http",
      ),
    "workbench-http",
  );

  // ── Agent 工具：Workbench（单工具多 action，action 由已装 addon 动态提供）──
  ctx.tools?.register({
    name: "Workbench",
    timeoutMs: 60_000,
    description:
      "个人工作台。action 由已安装子插件提供（任务记录示例：tasks.list/tasks.create/tasks.update/tasks.complete/tasks.delete/tasks.stats），" +
      "另有 addons.list / addons.install / addons.uninstall 管理子插件（安装=云端下载代码，卸载=本地删代码但保留数据）。",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          description: "action 名，如 tasks.list / tasks.create / addons.install / addons.uninstall",
        },
        addon_id: { type: "string", description: "子插件 id（addons.install/addons.uninstall）" },
        id: { type: "string", description: "记录 id（tasks.update/complete/delete）" },
        title: { type: "string" },
        note: { type: "string" },
        status: { type: "string", enum: ["open", "done"] },
        priority: { type: "number", description: "1 高 2 中 3 低" },
        due_at: { type: ["number", "null"], description: "到期毫秒时间戳" },
        tags: { type: "array", items: { type: "string" } },
        limit: { type: "number" },
      },
      required: ["action"],
    },
    output: {
      schema: { type: "object", properties: { text: { type: "string" } } },
      render: (_a: unknown, v: { text: string }) => [{ type: "text" as const, text: v.text }],
    },
    execute: async (args: any) => {
      const raw = String(args.action || "");
      try {
        if (raw === "addons.list") {
          const rows = manager.list();
          if (!rows.length) return { text: "（尚未安装任何子插件）" };
          return {
            text: rows
              .map((a: any) => "- " + a.id + "@" + a.version + "：" + a.title + (a.error ? "（异常：" + a.error + "）" : ""))
              .join("\n"),
          };
        }
        if (raw === "addons.install") {
          const id = String(args.addon_id || args.id || "");
          if (!id) return { text: "错误：addons.install 需要 addon_id" };
          const addon: any = await manager.install(id);
          return { text: "已安装 " + id + "@" + addon.version + (addon.error ? "（加载有误：" + addon.error + "）" : "") };
        }
        if (raw === "addons.uninstall") {
          const id = String(args.addon_id || args.id || "");
          if (!id) return { text: "错误：addons.uninstall 需要 addon_id" };
          await manager.uninstall(id);
          return { text: "已卸载 " + id + "（本地数据保留，重装后仍在）" };
        }

        // 兼容旧工具调用：无命名空间的 list/create/... 先映射到 tasks.*
        const name = raw.indexOf(".") >= 0 ? raw : "tasks." + raw;
        const payload: Record<string, unknown> = { ...args };
        delete payload.action;
        delete payload.addon_id;
        const r = await manager.invoke(name, payload, "agent");
        return { text: r.text };
      } catch (e) {
        return { text: "错误：" + String((e && (e as Error).message) || e) };
      }
    },
  });

  // ── 后台同步循环：30s 周期 + 登录后立即一轮（07 文档）──
  let timer: ReturnType<typeof setInterval> | undefined;
  const startLoop = () => {
    if (timer) clearInterval(timer);
    timer = setInterval(async () => {
      if (!state.creds) return;
      try {
        const client: CloudClient = {
          push: (changes) => cloudFetch("/v1/sync/push", { method: "POST", json: { changes } }),
          pull: (cursor) => cloudFetch("/v1/sync/pull?cursor=" + cursor),
        };
        const r = await runSyncRound(state.db, client, state.creds.deviceId);
        if (r.pushed || r.pulled) emit("sync-done", r);
      } catch {
        /* 离线静默（指数退避在 demo 省略） */
      }
    }, 30_000);
  };
  startLoop();
  ctx.effect?.(
    () => () => {
      if (timer) clearInterval(timer);
      manager.dispose();
    },
    "wb-sync-loop",
  );
}
