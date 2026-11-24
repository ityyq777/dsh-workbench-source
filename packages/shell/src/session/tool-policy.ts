import { AsyncLocalStorage } from "node:async_hooks";
import type { createSessionRoles } from "./roles.js";

// 仅允许已核过语义的读取动作在角色计划模式下使用。未知动作按写处理。
const reads = new Set(["actions.list", "actions.help", "capabilities.list", "capabilities.get", "tasks.list", "tasks.get", "tasks.capabilities", "tasks.resolveTable", "tasks.tagOptions", "tasks.tags", "taskNodes.overview", "taskWorkspaces.list", "taskTimelines.list", "sites.list", "tags.list", "tags.search", "siteNodes.overview"]);

type Roles = ReturnType<typeof createSessionRoles>;
/**
 * 每次工具调用的准入判定。
 *
 * 角色只决定「模型读到哪套规则」，**不再决定能调哪些动作**：角色的 actions 只是给
 * 界面展示与按动作名检索用的参考清单，真正约束该做什么的写在 instructions 里。
 * 所以这里只剩两条硬拦截：角色版本失效（要用户重选）与计划模式只读。
 */
export function createToolPolicy(roles: Roles) {
  const calls = new AsyncLocalStorage<{ agent: any; snapshot: ReturnType<Roles["snapshot"]> }>();
  let plan: { get(agent: any): { active: boolean } } | undefined;
  function allows(name: string) {
    const call = calls.getStore();
    if (!call) return true;
    const { snapshot, agent } = call;
    if (snapshot.roleId && !roles.available(snapshot)) return false;
    if (snapshot.roleId && plan?.get(agent)?.active && !reads.has(name)) return false;
    return true;
  }
  function rejection(name: string) {
    const call = calls.getStore();
    if (call?.snapshot.roleId && !roles.available(call.snapshot)) {
      return Object.assign(new Error("当前工作台角色已变更，请重新选择后再调用该动作：" + name), { code: "ACTION_ROLE_STALE" });
    }
    return Object.assign(new Error("计划模式下只读，不允许该动作：" + name), { code: "ACTION_PLAN_READ_ONLY" });
  }
  return { allows, setPlan(service: typeof plan) { plan = service; },
    check(name: string) { if (!allows(name)) throw rejection(name); },
    run<T>(exec: any, fn: () => T) {
      if (!exec?.agent?.session?.id) throw Object.assign(new Error("无法核对调用会话"), { code: "ACTION_ROLE_STALE" });
      return calls.run({ agent: exec?.agent, snapshot: roles.snapshot(exec?.agent) },fn);
    } };
}
