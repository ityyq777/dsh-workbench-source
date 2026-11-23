import { AsyncLocalStorage } from "node:async_hooks";
import type { RegisteredDomain } from "../types/host-types.js";
import type { createSessionRoles } from "./roles.js";

// 仅允许已核过语义的读取动作在收尾及计划模式下使用。未知动作按写处理。
const reads = new Set(["actions.list", "actions.help", "capabilities.list", "capabilities.get", "tasks.list", "tasks.get", "tasks.capabilities", "tasks.resolveTable", "tasks.tagOptions", "tasks.tags", "taskNodes.overview", "taskWorkspaces.list", "taskTimelines.list", "sites.list", "tags.list", "tags.search", "siteNodes.overview"]);

type Roles = ReturnType<typeof createSessionRoles>;
export function createToolPolicy(roles: Roles, domains: Map<string,RegisteredDomain>) {
  const calls = new AsyncLocalStorage<{ agent: any; record: boolean; snapshot: ReturnType<Roles["snapshot"]> }>();
  let plan: { get(agent: any): { active: boolean } } | undefined;
  function allows(name: string) {
    const call = calls.getStore();
    if (!call) return true;
    const { snapshot, agent, record } = call;
    if (snapshot.roleId && !roles.available(snapshot)) return false;
    if ((snapshot.roleId || record || snapshot.enabled) && plan?.get(agent)?.active && !reads.has(name)) return false;
    if (!record) return !snapshot.roleId || snapshot.role?.actions.includes(name) === true;
    if (!snapshot.enabled || !agent) return false;
    if (reads.has(name) || name === "tags.link") return true;
    if (!name.endsWith(".create")) return false;
    return [...domains.values()].some(rec => !rec.error && rec.actions.has(name) && rec.def.capability?.records?.some(r => r.primaryAction === name));
  }
  function denied(name: string) { return Object.assign(new Error("本轮工作台角色、记录或计划模式不允许该动作：" + name), {code:"ACTION_ROLE_DENIED"}); }
  return { allows, setPlan(service: typeof plan) { plan = service; },
    check(name: string) { if (!allows(name)) throw denied(name); },
    run<T>(exec: any, record: boolean, fn: () => T) {
      if (!exec?.agent?.session?.id) throw denied("无法核对调用会话");
      return calls.run({ agent: exec?.agent, snapshot: roles.snapshot(exec?.agent), record },fn);
    } };
}
