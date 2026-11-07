/**
 * dsh-workbench：个人工作台 DSH 宿主插件。
 * 契约要点（已验证）：named export name/inject/apply；绝不 default export
 * （cordis-plugin-loader unwrapExports 优先取 exports.default，裸函数会丢具名 inject）。
 */
import { homedir } from "node:os";
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { openDb, createTask, updateTask, deleteTask, listTasks, taskStats } from "@wb/core";
import type { DatabaseSync } from "node:sqlite";
import { runSyncRound, type CloudClient } from "./sync.js";

export const name = "dsh-workbench";
export const inject = ["webServer", "tools", "connection"];

/** 本地库与云端配置路径（05 文档约定目录）。 */
const WB_HOME = process.env.WB_HOME ?? join(homedir(), ".dsh", "workbench");
const CLOUD_DEFAULT = process.env.WB_CLOUD_URL ?? "http://127.0.0.1:8791";

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
    if (state.creds) headers.authorization = `Bearer ${state.creds.accessToken}`;
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

            if (p === "/events" && m === "GET") {
              // SSE：任务变更 / 同步状态推送给 UI
              res.writeHead(200, {
                "content-type": "text/event-stream",
                "cache-control": "no-cache",
                connection: "keep-alive",
              });
              const sub: Subscriber = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
              subscribers.add(sub);
              req.on?.("close", () => subscribers.delete(sub));
              return;
            }
            if (p === "/tasks" && m === "GET") {
              return send(200, {
                ok: true,
                tasks: listTasks(state.db, { status: url.searchParams.get("status") ?? undefined }),
                stats: taskStats(state.db),
              });
            }
            if (p === "/tasks" && m === "POST") {
              const b = await bodyOf();
              const id = createTask(state.db, b, "ui");
              emit("tasks-changed", { id });
              return send(200, { ok: true, id });
            }
            const taskM = /^\/tasks\/([\w-]+)$/.exec(p);
            if (taskM && m === "PATCH") {
              const ok = updateTask(state.db, taskM[1], await bodyOf(), "ui");
              if (ok) emit("tasks-changed", { id: taskM[1] });
              return send(ok ? 200 : 404, { ok });
            }
            if (taskM && m === "DELETE") {
              const ok = deleteTask(state.db, taskM[1], "ui");
              if (ok) emit("tasks-changed", { id: taskM[1] });
              return send(ok ? 200 : 404, { ok });
            }
            if (p === "/sync/now" && m === "POST") {
              if (!state.creds) return send(400, { ok: false, error: "not logged in" });
              const client: CloudClient = {
                push: (changes) => cloudFetch("/v1/sync/push", { method: "POST", json: { changes } }),
                pull: (cursor) => cloudFetch(`/v1/sync/pull?cursor=\${cursor}`),
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
            if (p === "/catalog" && m === "GET") {
              const r = await cloudFetch("/v1/catalog/addons");
              return send(200, r);
            }
            return send(404, { ok: false, error: `no route ${m} ${p}` });
          },
        },
        "workbench-http",
      ),
    "workbench-http",
  );

  // ── Agent 工具：Workbench（单工具多 action，仿 DatabaseManager）──
  ctx.tools?.register({
    name: "Workbench",
    timeoutMs: 30_000,
    description:
      "个人工作台数据操作（当前为内置任务记录 addon）。action：list/create/update/complete/delete/stats。所有写入进入同步队列，离线可用。",
    parameters: {
      type: "object",
      properties: {
        action: { enum: ["list", "create", "update", "complete", "delete", "stats"], description: "操作类型" },
        id: { type: "string", description: "任务 id（update/complete/delete）" },
        title: { type: "string", description: "标题（create）" },
        note: { type: "string" },
        status: { type: "string", enum: ["open", "doing", "done"] },
        priority: { type: "number", description: "1 高 2 中 3 低" },
        due_at: { type: "number", description: "到期毫秒时间戳" },
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
      const db = state.db;
      switch (args.action) {
        case "list": {
          const rows = listTasks(db, { status: args.status, limit: args.limit });
          return {
            text:
              rows
                .map(
                  (t) =>
                    `${t.id.slice(0, 8)} [P${t.priority}][${t.status}] ${t.title}${t.due_at ? ` due ${new Date(t.due_at).toLocaleDateString("zh-CN")}` : ""} ${JSON.parse(t.tags).join(",")}`,
                )
                .join("\n") || "（空）",
          };
        }
        case "create": {
          if (!args.title) return { text: "错误：create 需要 title" };
          const id = createTask(
            db,
            { title: args.title, note: args.note, priority: args.priority, due_at: args.due_at, tags: args.tags },
            "agent",
          );
          emit("tasks-changed", { id });
          return { text: `已创建任务 ${id.slice(0, 8)}：${args.title}` };
        }
        case "update": {
          const patch: Record<string, unknown> = {};
          for (const k of ["title", "note", "status", "priority", "due_at", "tags"])
            if (args[k] !== undefined) patch[k] = args[k];
          const ok = updateTask(db, String(args.id), patch, "agent");
          if (ok) emit("tasks-changed", { id: args.id });
          return { text: ok ? `已更新 ${String(args.id).slice(0, 8)}` : "未找到任务" };
        }
        case "complete": {
          const ok = updateTask(db, String(args.id), { status: "done" }, "agent");
          if (ok) emit("tasks-changed", { id: args.id });
          return { text: ok ? `已完成 ${String(args.id).slice(0, 8)}` : "未找到任务" };
        }
        case "delete": {
          const ok = deleteTask(db, String(args.id), "agent");
          if (ok) emit("tasks-changed", { id: args.id });
          return { text: ok ? `已删除 ${String(args.id).slice(0, 8)}` : "未找到任务" };
        }
        case "stats": {
          const s = taskStats(db);
          return { text: `进行中 ${s.open} · 已完成 ${s.done} · 逾期 ${s.overdue} · 今日到期 ${s.today}` };
        }
        default:
          return { text: "未知 action" };
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
          pull: (cursor) => cloudFetch(`/v1/sync/pull?cursor=\${cursor}`),
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
    },
    "wb-sync-loop",
  );
}
