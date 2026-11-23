import { createRoleCatalog } from "./catalog.js";
import type { DatabaseSync } from "node:sqlite";
import type { RegisteredDomain } from "../types/host-types.js";

export function sessionKey(id: unknown): string {
  if (typeof id !== "string" || !id.trim() || id.length > 200) throw new Error("会话或消息标识不合法");
  return id.trim();
}

/** 目录跟随业务域的注册周期。会话只保存选择与版本，不保存插件的提示词。 */
export function createSessionRoles(db: DatabaseSync, domains: Map<string, RegisteredDomain>, emit: (type: string, data: unknown) => void) {
  const select = db.prepare("SELECT role_id, role_version FROM session_role WHERE session_id=?");
  const selectMessage = db.prepare("SELECT role_id, role_version FROM session_message_role WHERE session_id=? AND message_id=?");
  const removeMessage = db.prepare("DELETE FROM session_message_role WHERE session_id=? AND message_id=?");
  function config(sid: string) {
    const row = select.get(sid);
    return { roleId: row?.role_id as string || null, version: row?.role_version as string || null };
  }
  const catalog = createRoleCatalog(db, domains, emit);
  const resolve = catalog.resolve;
  function info(sid: string) {
    const cfg = config(sid);
    const roles = catalog.list().map(({ id, domain, name, description, version, source }) => ({ id, domain, name, description, version, source }));
    return { sessionId: sid, ...cfg, unavailable: !!cfg.roleId && resolve(cfg.roleId)?.version !== cfg.version, roles };
  }
  function patch(sid: string, body: { roleId: string | null; sessionId?: string }) {
    sessionKey(sid);
    if (!body || !Object.hasOwn(body, "roleId") || Object.keys(body).some(key => key !== "roleId" && key !== "sessionId")) throw new Error("只接受 sessionId 和 roleId");
    const role = typeof body.roleId === "string" ? resolve(body.roleId) : undefined;
    if (body.roleId !== null && !role) throw new Error("角色不可用，请重新选择");
    db.prepare("INSERT INTO session_role(session_id,role_id,role_version,updated_at) VALUES(?,?,?,?) ON CONFLICT(session_id) DO UPDATE SET role_id=excluded.role_id,role_version=excluded.role_version,updated_at=excluded.updated_at").run(sid,body.roleId,role?.version ?? null,Date.now());
    const result = info(sid);
    emit("session-role", result);
    return result;
  }
  function bindMessageRole(sessionId: string, messageId: string, roleId: string) {
    const sid = sessionKey(sessionId), mid = sessionKey(messageId);
    const role = resolve(roleId);
    if (!role) throw new Error("角色不可用，请重新选择");
    db.prepare("INSERT INTO session_message_role VALUES(?,?,?,?)").run(sid,mid,roleId,role.version);
    return () => { removeMessage.run(sid,mid); };
  }
  type Snapshot = ReturnType<typeof config> & { sid: string; turn: number; messageId: string; once: boolean; role: ReturnType<typeof resolve> };
  const turns = new WeakMap<object, Snapshot>();
  function capture(agent: any, turn: number, messageId: string): Snapshot {
    const sid = String(agent?.session?.id ?? agent?.id ?? "");
    const cfg = config(sid);
    const single = messageId ? selectMessage.get(sid,messageId) : undefined;
    if (single) {
      cfg.roleId = String(single.role_id);
      cfg.version = String(single.role_version);
      removeMessage.run(sid,messageId);
    }
    return { ...cfg, sid, turn, messageId, once: !!single, role: resolve(cfg.roleId) };
  }
  function claim({ agent, message, turn }: any) {
    if (!agent || !Number.isInteger(turn)) return;
    const mid = String(message?.id ?? "");
    const current = turns.get(agent);
    if (!current || current.turn !== turn) turns.set(agent, capture(agent,turn,mid));
    else if (!current.once && selectMessage.get(current.sid,mid)) turns.set(agent,capture(agent,turn,mid));
  }
  function snapshot(agent: any) { return (agent && turns.get(agent)) ?? capture(agent,0,""); }
  function available(s: Snapshot) {
    const live = resolve(s.roleId);
    return !!s.role && !!live && s.version === live.version && (catalog.isUser(s.roleId) || s.role === live);
  }
  function prompt(agent: any) {
    if (!agent) return "";
    const s: Snapshot = snapshot(agent);
    const text = [];
    if (s.roleId) {
      if (!available(s)) return "原选工作台角色已变更，请用户重新选择后再进行业务操作。";
      text.push("## 工作台角色：" + s.role!.name, s.role!.instructions,
        "当前会话：" + s.sid + "；来源用户消息标识：" + (s.messageId || "未知"));
      if (s.once) text.push("用户通过业务命令明确要求在本轮执行该角色流程。此授权仅适用于命令关联的消息。");
    }
    return text.join("\n");
  }
  return { catalog, info, patch, claim, snapshot, available, prompt, bindMessageRole,
    discard: ({agent,message}: any) => { if(agent?.session?.id && message?.id) removeMessage.run(agent.session.id,message.id); } };
}
