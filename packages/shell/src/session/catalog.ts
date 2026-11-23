import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { parseDomainRoles, type DomainRoleDef } from "@wb/sdk";
import type { RegisteredDomain } from "../types/host-types.js";

type Entry = DomainRoleDef & { source: "plugin" | "user"; domain: string };
const fields = ["name", "description", "instructions", "actions"];
// 冒号不属于合法业务域标识，用户角色与任何插件角色均不会重名。
const prefix = "user:";

export function createRoleCatalog(db: DatabaseSync, domains: Map<string, RegisteredDomain>, emit: (type: string, value: unknown) => void) {
  const query = db.prepare("SELECT id, version, definition FROM user_role WHERE id=?");
  function fromRow(row: Record<string, unknown>): Entry {
    return { ...JSON.parse(String(row.definition)), id: String(row.id), version: String(row.version), domain: "user", source: "user" };
  }
  function resolve(id: string | null): DomainRoleDef | undefined {
    if (!id) return;
    if (id.startsWith(prefix)) {
      const row = query.get(id);
      return row && fromRow(row);
    }
    const [domainId, localId] = id.split("/");
    const domain = domains.get(domainId);
    if (domain?.error !== null) return;
    return domain.def.roles?.find(role => role.id === localId && domainId + "/" + role.id === id);
  }
  function list(): Entry[] {
    const plugins: Entry[] = [...domains.values()].filter(rec => rec.error === null).flatMap(rec =>
      (rec.def.roles ?? []).map(role => ({ ...role, actions: [...role.actions], id: rec.def.id + "/" + role.id, domain: rec.def.id, source: "plugin" as const })));
    return plugins.concat(db.prepare("SELECT id, version, definition FROM user_role ORDER BY rowid").all().map(fromRow));
  }
  function mutate(input: unknown) {
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("需要角色管理操作");
    const body = input as Record<string, unknown>;
    const op = body.op;
    if (op !== "create" && op !== "copy" && op !== "update" && op !== "delete") throw new Error("无法识别的角色管理操作");
    const allowed = ["op", ...(op === "create" ? [] : ["id"]), ...(op === "delete" ? [] : fields)];
    if (Object.keys(body).some(key => !allowed.includes(key))) throw new Error("角色管理请求包含不支持的字段");
    const id = typeof body.id === "string" ? body.id : "";
    const original = resolve(id);
    if (op !== "create" && !original) throw new Error("角色不存在");
    if ((op === "update" || op === "delete") && !id.startsWith(prefix)) throw new Error("插件角色只读，可以复制后编辑");
    let role: Entry | undefined;
    if (op === "delete") {
      db.prepare("DELETE FROM user_role WHERE id=?").run(id);
    } else {
      if (op === "update" && !fields.some(key => Object.hasOwn(body,key))) throw new Error("未提供要修改的角色字段");
      const defaults = original ? { ...original, name: op === "copy" ? original.name + "（副本）" : original.name } : { actions: [] };
      const version = randomUUID();
      const [definition] = parseDomainRoles("user", [{ ...defaults, ...body, id: "custom", version }]);
      const { name, description, instructions, actions } = definition;
      const content = { name, description, instructions, actions };
      const key = op === "update" ? id : prefix + randomUUID();
      if (op === "update") db.prepare("UPDATE user_role SET version=?,definition=? WHERE id=?").run(version,JSON.stringify(content),key);
      else db.prepare("INSERT INTO user_role(id,version,definition) VALUES(?,?,?)").run(key,version,JSON.stringify(content));
      role = { ...content, id: key, version, domain: "user", source: "user" };
    }
    emit("role-catalog", {op,id:role?.id ?? id});
    return { ...(role ? {role} : {}), roles: list() };
  }
  return { list, resolve, mutate, isUser: (id: string | null) => !!id?.startsWith(prefix) };
}
