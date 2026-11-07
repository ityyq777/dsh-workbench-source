/**
 * dsh-workbench：个人工作台 DSH 宿主插件。
 *
 * 只负责平台能力：本地 SQLite、账号/同步、HTTP 桥、SSE、Workbench 工具、
 * 业务域注册中心。任务/标签/站点是独立的 DSH 插件，通过 ctx.workbench
 * 注册自己的 action 与视图，宿主不 import 它们。
 *
 * 契约要点（已验证）：named export name/inject/apply；绝不 default export
 * （cordis-plugin-loader unwrapExports 优先取 exports.default，裸函数会丢具名 inject）。
 */
import { homedir } from "node:os";
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { openDb } from "@wb/core";
import type { DatabaseSync } from "node:sqlite";
import type {
  DomainActionDef,
  DomainDef,
  DomainPublicInfo,
  DomainSetupApi,
  WorkbenchHost,
} from "@wb/sdk";
import { runSyncRound, type CloudClient } from "./sync.js";
import {
  BackupError,
  createBackup,
  importBackup,
  normalizeImportPolicy,
  type BackupDomain,
} from "./backup.js";

export const name = "dsh-workbench";
export const inject = ["webServer", "tools", "connection"];

/** 本地库与云端配置路径（05 文档约定目录）。 */
const WB_HOME = process.env.WB_HOME ?? join(homedir(), ".dsh", "workbench");
const CLOUD_DEFAULT = process.env.WB_CLOUD_URL ?? "http://127.0.0.1:8791";

/** 宿主 API 版本：业务插件用它做兼容判断。 */
export const SHELL_VERSION = "0.4.0";

const DOMAIN_ID_RE = /^[a-z][a-z0-9_-]{2,63}$/;
const ACTION_RE = /^[a-z][a-z0-9_-]*(?:\.[a-z][a-z0-9_-]*)+$/i;

interface WbState {
  db: DatabaseSync;
  creds: { accessToken: string; refreshToken: string; userId: string; deviceId: string } | null;
  cloudUrl: string;
}

interface RegisteredDomain {
  def: DomainDef;
  actions: Map<string, DomainActionDef>;
  error: string | null;
  dispose: (() => void) | null;
}

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
  const domains = new Map<string, RegisteredDomain>();

  const emit = (event: string, data: unknown) => {
    for (const s of subscribers) {
      try {
        s(event, data);
      } catch {
        /* 单个订阅者断开不影响其他订阅者 */
      }
    }
  };
  const log = (...args: unknown[]) => console.warn("[dsh-workbench]", ...args);

  function publicInfo(rec: RegisteredDomain): DomainPublicInfo {
    return {
      id: rec.def.id,
      title: rec.def.title,
      description: rec.def.description,
      version: rec.def.version,
      enabled: rec.error === null,
      error: rec.error,
      tables: rec.def.tables ?? [],
      views: rec.def.views ?? [],
      backup: {
        export: typeof rec.def.exportData === "function",
        import: typeof rec.def.importData === "function",
      },
    };
  }

  function registerAction(rec: RegisteredDomain, action: string, def: DomainActionDef): void {
    if (!ACTION_RE.test(action)) {
      throw new Error("非法 action 名（应形如 tasks.list）：" + action);
    }
    rec.actions.set(action, def);
  }

  function registerDomain(def: DomainDef): () => void {
    if (!def || !DOMAIN_ID_RE.test(String(def.id || ""))) {
      log("registerDomain 非法 id", def && def.id);
      return () => {};
    }
    if (domains.has(def.id)) {
      log("业务域已注册，忽略重复注册", def.id);
      return () => {};
    }
    const rec: RegisteredDomain = { def, actions: new Map(), error: null, dispose: null };
    domains.set(def.id, rec);

    const setupApi: DomainSetupApi = {
      addon: { id: def.id, version: def.version, dir: "" },
      db: state.db,
      shellVersion: SHELL_VERSION,
      hasDomain: (id: string) => domains.has(id),
      hasAddon: (id: string) => domains.has(id),
      action: (name: string, actionDef: DomainActionDef) => registerAction(rec, name, actionDef),
      tool: (name: string, actionDef: DomainActionDef) => registerAction(rec, name, actionDef),
      emit: (event: string, data?: unknown) => emit("domain-event", { domainId: def.id, event, data: data ?? null }),
      log: (...args: unknown[]) => log("[" + def.id + "]", ...args),
    };

    try {
      const result = def.setup?.(setupApi);
      if (result && typeof (result as Promise<unknown>).then === "function") {
        void (result as Promise<void | (() => void)>)
          .then((dispose) => {
            if (typeof dispose === "function") rec.dispose = dispose;
            emit("domains-changed", listDomains());
          })
          .catch((e) => {
            rec.error = String((e && (e as Error).message) || e);
            log("业务域异步初始化失败", def.id, e);
            emit("domains-changed", listDomains());
          });
      } else if (typeof result === "function") {
        rec.dispose = result;
      }
    } catch (e) {
      rec.error = String((e && (e as Error).message) || e);
      log("业务域初始化失败", def.id, e);
    }

    emit("domains-changed", listDomains());
    return () => {
      const live = domains.get(def.id);
      if (live !== rec) return;
      try {
        rec.dispose?.();
      } catch (e) {
        log("业务域清理失败", def.id, e);
      }
      domains.delete(def.id);
      emit("domains-changed", listDomains());
    };
  }

  function listDomains(): DomainPublicInfo[] {
    return [...domains.values()].map(publicInfo);
  }

  function backupDomains(): BackupDomain[] {
    return [...domains.values()].map((rec) => ({ def: rec.def, enabled: rec.error === null, error: rec.error }));
  }

  /** 宿主内置的元 action 归属域（不参与备份，也不是业务插件）。 */
  const META_DOMAIN = "wb-shell";

  /** 旧版 Workbench 顶层 schema 里的“通用字段”，多数 action 并不接受。 */
  const TRAP_FIELDS = ["due_at", "note", "tags", "tagIds", "dirIds", "parentId", "deadline", "start_at", "assignee", "limit"];

  function findActionDef(name: string): { def: DomainActionDef; domainId: string } | null {
    for (const rec of domains.values()) {
      const def = rec.actions.get(name);
      if (def) return { def, domainId: rec.def.id };
    }
    return null;
  }

  function actionParams(def: DomainActionDef): { props: Record<string, any>; required: string[] } {
    const input = (def.input ?? {}) as any;
    const props: Record<string, any> =
      input && typeof input === "object" && input.properties && typeof input.properties === "object"
        ? (input.properties as Record<string, any>)
        : {};
    const required = input && Array.isArray(input.required) ? (input.required as string[]) : [];
    return { props, required: required.filter((key) => Object.prototype.hasOwnProperty.call(props, key)) };
  }

  function actionEntry(name: string, domainId: string, def: DomainActionDef) {
    const { props, required } = actionParams(def);
    return {
      name,
      domain: domainId,
      description: def.description ?? "",
      required,
      params: Object.keys(props),
      input: def.input ?? { type: "object", properties: {} },
    };
  }

  /** actions.list：把已注册 action 的“真实入参”暴露给 agent，避免按顶层通用 schema 猜字段。 */
  function listActionsMeta(args: Record<string, unknown>) {
    const raw = args.domain === undefined || args.domain === null ? "" : String(args.domain).trim();
    const matchDomain = (domainId: string) => !raw || domainId === raw || domainId === "wb-addon-" + raw;
    const matchAction = (name: string, domainId: string) =>
      !raw || matchDomain(domainId) || name === raw || name.split(".")[0] === raw;
    const all: ReturnType<typeof actionEntry>[] = [];
    for (const rec of domains.values()) {
      for (const [name, def] of rec.actions) {
        if (matchAction(name, rec.def.id)) all.push(actionEntry(name, rec.def.id, def));
      }
    }
    const ids = new Set(all.map((a) => a.domain));
    const domainsOut = [...domains.values()]
      .filter((rec) => ids.has(rec.def.id))
      .map((rec) => {
        const info = publicInfo(rec);
        return {
          id: info.id,
          title: info.title,
          version: info.version,
          enabled: info.enabled,
          error: info.error,
          actionCount: rec.actions.size,
        };
      });
    const detail = args.detail === true;
    return {
      shellVersion: SHELL_VERSION,
      domains: domainsOut,
      actions: detail
        ? all
        : all.map((a) => ({ name: a.name, domain: a.domain, description: a.description, required: a.required, params: a.params })),
    };
  }

  function renderActionList(meta: any): string {
    const lines = ["工作台 " + meta.shellVersion + " · " + meta.domains.length + " 个域 · " + meta.actions.length + " 个 action"];
    for (const d of meta.domains) {
      lines.push("", "[" + d.id + "] " + d.title + " v" + d.version + (d.enabled ? "" : "（未启用：" + d.error + "）"));
      for (const a of meta.actions) {
        if (a.domain !== d.id) continue;
        lines.push("  " + a.name + (a.description ? " — " + a.description : ""));
        const params: string[] = a.params ?? [];
        lines.push(
          "    参数：" +
            (params.length
              ? params.map((p) => (a.required.indexOf(p) >= 0 ? p : p + "?")).join(", ")
              : "无（直接调用即可）"),
        );
      }
    }
    lines.push("", '查看完整 JSON Schema 与示例：Workbench({ action: "actions.help", args: { action: "<name>" } })');
    return lines.join("\n");
  }

  /** actions.help：单个 action 的完整 schema + 参数说明 + 示例。 */
  function helpActionMeta(args: Record<string, unknown>) {
    const name = String(args.action ?? args.name ?? "").trim();
    if (!name) throw new Error("缺少 action；先用 actions.list 查看可用 action");
    const found = findActionDef(name);
    if (!found) throw new Error("没有该 action：" + name + "；先用 actions.list 查看可用 action");
    const entry = actionEntry(name, found.domainId, found.def);
    const { props } = actionParams(found.def);
    const params = Object.keys(props).map((key) => ({
      name: key,
      type: Array.isArray(props[key]?.type) ? (props[key].type as string[]).join("|") : (props[key]?.type ?? "any"),
      required: entry.required.indexOf(key) >= 0,
      description: props[key]?.description ?? "",
      enum: props[key]?.enum,
    }));
    return {
      name,
      domain: entry.domain,
      description: entry.description,
      input: entry.input,
      params,
      examples: (found.def as any).examples ?? [],
    };
  }

  function renderActionHelp(help: any): string {
    const lines = [help.name + " · " + help.domain, help.description || "（无描述）", "", "参数："];
    if (!help.params.length) lines.push("  无");
    for (const p of help.params) {
      lines.push(
        "  " + p.name + (p.required ? "*" : "") + " (" + p.type + ")" + (p.description ? " — " + p.description : "") +
          (Array.isArray(p.enum) ? "；可选值：" + p.enum.join(" / ") : ""),
      );
    }
    lines.push("", "JSON Schema：", JSON.stringify(help.input, null, 2));
    if (help.examples.length) {
      lines.push("", "示例：");
      for (const ex of help.examples) {
        lines.push("  Workbench(" + JSON.stringify({ action: help.name, args: ex }) + ")");
      }
    }
    return lines.join("\n");
  }

  function actionNames() {
    const out: { name: string; domainId: string; description?: string }[] = [];
    for (const rec of domains.values()) {
      for (const [action, def] of rec.actions) {
        out.push({ name: action, domainId: rec.def.id, description: def.description });
      }
    }
    out.push({ name: "actions.list", domainId: META_DOMAIN, description: "列出已安装业务域的 action、参数与必填项" });
    out.push({ name: "actions.help", domainId: META_DOMAIN, description: "查看单个 action 的完整 JSON Schema、参数说明与示例" });
    return out;
  }

  async function invoke(action: string, args: Record<string, unknown>, origin: "ui" | "agent" | "sync") {
    if (action === "actions.list") {
      const result = listActionsMeta(args);
      return { result, text: renderActionList(result), domainId: META_DOMAIN };
    }
    if (action === "actions.help") {
      const result = helpActionMeta(args);
      return { result, text: renderActionHelp(result), domainId: META_DOMAIN };
    }
    for (const rec of domains.values()) {
      const def = rec.actions.get(action);
      if (!def) continue;
      const result = await def.execute(args, {
        origin,
        emit: (event, data) => emit("domain-event", { domainId: rec.def.id, event, data: data ?? null }),
      });
      return {
        result,
        text: def.render ? def.render(result) : JSON.stringify(result),
        domainId: rec.def.id,
      };
    }
    throw new Error("没有业务插件注册 action：" + action);
  }

  const host: WorkbenchHost = {
    db: state.db,
    shellVersion: SHELL_VERSION,
    registerDomain,
    hasDomain: (id: string) => domains.has(id),
    listDomains,
    invoke,
    actionNames,
    emit,
    log,
  };
  ctx.provide?.("workbench", host);

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
            const rawBodyOf = async (maxBytes = 64 * 1024 * 1024) => {
              const chunks: Buffer[] = [];
              let total = 0;
              for await (const c of req) {
                const buf = c as Buffer;
                total += buf.length;
                if (total > maxBytes) throw new Error("请求体超过上限（" + Math.round(maxBytes / 1024 / 1024) + "MB）");
                chunks.push(buf);
              }
              return Buffer.concat(chunks);
            };
            const send = (code: number, obj: unknown) => {
              res.writeHead(code, { "content-type": "application/json" });
              res.end(JSON.stringify(obj));
            };

            try {
              if (p === "/events" && m === "GET") {
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

              if (p === "/domains" && m === "GET") {
                return send(200, { ok: true, domains: listDomains(), shellVersion: SHELL_VERSION });
              }

              if (p === "/backup/export" && m === "GET") {
                try {
                  const raw = url.searchParams.get("modules");
                  const ids = raw && raw !== "all" ? raw.split(",").map((x) => x.trim()).filter(Boolean) : null;
                  const backup = await createBackup({ domains: backupDomains(), shellVersion: SHELL_VERSION, moduleIds: ids });
                  res.writeHead(200, {
                    "content-type": "application/zip",
                    "content-disposition": "attachment; filename=\"" + backup.filename + "\"",
                    "content-length": backup.buffer.length,
                    "cache-control": "no-store",
                  });
                  res.end(backup.buffer);
                  return;
                } catch (e) {
                  return send(500, { ok: false, error: String((e && (e as Error).message) || e) });
                }
              }

              if (p === "/backup/import" && m === "POST") {
                try {
                  const buf = await rawBodyOf();
                  const policies: Record<string, string> = {};
                  const rawPolicy = (req.headers as any)?.["x-wb-backup-policy"];
                  if (typeof rawPolicy === "string" && rawPolicy) {
                    try {
                      const parsed = JSON.parse(rawPolicy);
                      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                        for (const key of Object.keys(parsed)) policies[key] = normalizeImportPolicy(parsed[key]);
                      }
                    } catch {
                      // 策略头损坏时按默认 newest 处理，不阻断备份导入
                    }
                  }
                  const result = await importBackup({ buffer: buf, domains: backupDomains(), policies });
                  emit("backup-imported", { summary: result.summary, exportedAt: result.exportedAt });
                  return send(200, result);
                } catch (e) {
                  const err = e as BackupError;
                  const code = err && err.code ? err.code : "invalid";
                  return send(code === "incompatible" ? 422 : 400, {
                    ok: false,
                    code,
                    error: String((e && (e as Error).message) || e),
                  });
                }
              }

              const actionM = /^\/domains\/([^/]+)\/actions\/([^/]+)$/.exec(p);
              if (actionM && m === "POST") {
                const id = decodeURIComponent(actionM[1]);
                const action = decodeURIComponent(actionM[2]);
                const owner = actionNames().find((a) => a.name === action);
                if (!owner || owner.domainId !== id) {
                  return send(404, { ok: false, error: "业务插件未注册该 action：" + action });
                }
                const body = await bodyOf();
                const r = await invoke(action, body, "ui");
                return send(200, { ok: true, result: r.result, text: r.text });
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

  // ── Agent 工具：Workbench（单工具多 action，action 由已注册业务域动态提供）──
  ctx.tools?.register({
    name: "Workbench",
    timeoutMs: 60_000,
    description:
      "个人工作台。action 由已安装业务插件提供（tasks.* / taskNodes.* / tags.* / sites.* / siteTags.* / siteNodes.*），" +
      "宿主另提供 actions.list / actions.help 用于自举：先 actions.list 看有哪些 action，再 actions.help 看真实字段。" +
      "入参统一放进 args；不要再按旧版顶层字段（due_at / tags / parentId 等）猜参数。" +
      "安装或卸载业务插件请使用 DSH 的插件管理，不在本工具里做。",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          description: "action 名，如 actions.list / tasks.list / tasks.create / tags.create / sites.list",
        },
        args: {
          type: "object",
          description: "该 action 的入参对象；字段名与类型以 actions.help 的返回为准",
          additionalProperties: true,
        },
      },
      required: ["action"],
      // 兼容旧调用：未放进 args 的顶层字段仍会被采纳（但会按 action 的真实 schema 校验并提示被忽略项）
      additionalProperties: true,
    },
    output: {
      schema: { type: "object", properties: { text: { type: "string" } } },
      render: (_a: unknown, v: { text: string }) => [{ type: "text" as const, text: v.text }],
    },
    execute: async (args: any) => {
      const raw = String(args.action || "");
      try {
        if (!raw) return { text: "错误：缺少 action（先调用 actions.list）" };
        // 兼容旧工具调用：无命名空间的 list/create/... 映射到 tasks.*
        const action = raw.indexOf(".") >= 0 ? raw : "tasks." + raw;
        const flat: Record<string, unknown> = { ...args };
        delete flat.action;
        const nested = flat.args;
        delete flat.args;

        const payload: Record<string, unknown> = {};
        if (nested && typeof nested === "object" && !Array.isArray(nested)) {
          Object.assign(payload, nested as Record<string, unknown>);
        }
        for (const [key, value] of Object.entries(flat)) {
          if (Object.prototype.hasOwnProperty.call(payload, key) && JSON.stringify(payload[key]) !== JSON.stringify(value)) {
            return { text: "错误：参数 " + key + " 同时出现在 args 和顶层且值不同，请只传一处" };
          }
          payload[key] = value;
        }

        // 旧版 Workbench schema 里有一批“看起来通用、实际没人接”的字段：若该 action 的
        // 真实 schema 不声明它们，就明确提示已忽略，而不是静默丢参。
        const known = new Set<string>();
        const found = findActionDef(action);
        if (found) for (const key of Object.keys(actionParams(found.def).props)) known.add(key);
        const ignored: string[] = [];
        for (const key of TRAP_FIELDS) {
          if (Object.prototype.hasOwnProperty.call(payload, key) && !known.has(key)) {
            ignored.push(key + "=" + JSON.stringify(payload[key]));
            delete payload[key];
          }
        }

        const r = await invoke(action, payload, "agent");
        const warning = ignored.length
          ? "⚠ " + action + " 不接受这些参数，已忽略：\n  " + ignored.join("\n  ") +
            "\n（真实字段名以 actions.help 为准）\n\n"
          : "";
        return { text: warning + r.text };
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
      for (const rec of domains.values()) {
        try {
          rec.dispose?.();
        } catch {
          /* ignore */
        }
      }
      domains.clear();
    },
    "wb-sync-loop",
  );
}
