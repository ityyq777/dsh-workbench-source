import { AsyncLocalStorage } from "node:async_hooks";
import type { createSessionRoles } from "./roles.js";

// 仅允许已核过语义的读取动作在角色计划模式下使用。未知动作按写处理。
const reads = new Set(["actions.list", "actions.help", "capabilities.list", "capabilities.get", "tasks.list", "tasks.get", "tasks.capabilities", "tasks.resolveTable", "tasks.tagOptions", "tasks.tags", "taskNodes.overview", "taskWorkspaces.list", "taskTimelines.list", "sites.list", "tags.list", "tags.search", "siteNodes.overview"]);

type Roles = ReturnType<typeof createSessionRoles>;
export function createToolPolicy(roles: Roles) {
  const calls = new AsyncLocalStorage<{ agent: any; snapshot: ReturnType<Roles["snapshot"]> }>();
  let plan: { get(agent: any): { active: boolean } } | undefined;
  function allows(name: string) {
    const call = calls.getStore();
    if (!call) return true;
    const { snapshot, agent } = call;
    if (snapshot.roleId && !roles.available(snapshot)) return false;
    if (snapshot.roleId && plan?.get(agent)?.active && !reads.has(name)) return false;
    return !snapshot.roleId || snapshot.role?.actions.includes(name) === true;
  }
  function denied(name: string) { return Object.assign(new Error("本轮工作台角色或计划模式不允许该动作：" + name), {code:"ACTION_ROLE_DENIED"}); }
  return { allows, setPlan(service: typeof plan) { plan = service; },
    check(name: string) { if (!allows(name)) throw denied(name); },
    run<T>(exec: any, fn: () => T) {
      if (!exec?.agent?.session?.id) throw denied("无法核对调用会话");
      return calls.run({ agent: exec?.agent, snapshot: roles.snapshot(exec?.agent) },fn);
    } };
}
