import { actionErrorText } from "../actions/action-output.js";
export function installWorkbenchTools(ctx: any, { findActionDef, actionParams, invoke, policy, sessionRoles }: any) {
  const TRAP_FIELDS = ["due_at", "note", "tags", "tagIds", "dirIds", "parentId", "deadline", "start_at", "assignee", "limit"];
  function definition(record: boolean) {
  // ── Agent 工具：Workbench（单工具多 action，action 由已注册业务域动态提供）──
  return {
    name: record ? "WorkbenchRecord" : "Workbench",
    timeoutMs: 60_000,
    description: record ? "收尾记录可复用交付物。仅允许查询、已声明的新增与关联动作。" :
      "个人工作台。action 由已安装业务插件提供（tasks.* / taskNodes.* / tags.* / sites.* / siteTags.* / siteNodes.*），" +
      "宿主另提供 capabilities.list / capabilities.get 查看各插件记录什么、任务归属显式配置及首选 action；capabilities.setTaskTarget 配置 domain→tableId。" +
      "物品用 storage.create，开发工作用 tasks.create；创建任务前用 tasks.capabilities / tasks.resolveTable 明确目标，不能默认第一张表。" +
      "actions.list / actions.help 用于自举：先 actions.list 看有哪些 action，再 actions.help 看真实字段。" +
      "审计留痕可直接查 audit.list / audit.get / audit.stats（本机行为账本：谁在何时调了什么、成功与否，参数已脱敏）。" +
      "入参统一放进 args；不要再按旧版顶层字段（due_at / tags / parentId 等）猜参数。" +
      "被本机在 Action 页关闭 agent 访问的 action 不会出现在 actions.list 中，直接调用返回 ACTION_AGENT_DISABLED（界面仍可正常使用）；" +
      "安装或卸载业务插件请使用 DSH 的插件管理，不在本工具里做。",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          description: "action 名，如 capabilities.list / capabilities.get / actions.list / tasks.list / tasks.create / tags.create / sites.list",
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
    execute: async (args: any, exec?: any) => {
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

        const r = await policy.run(exec,record,() => invoke(action, payload, "agent"));
        const warning = ignored.length
          ? "⚠ " + action + " 不接受这些参数，已忽略：\n  " + ignored.join("\n  ") +
            "\n（真实字段名以 actions.help 为准）\n\n"
          : "";
        return { text: warning + r.text };
      } catch (e) {
        return { text: "错误：" + actionErrorText(e) };
      }
    },
  };
  }
  ctx.tools?.register(definition(true), { when: ({ agent }: any) => sessionRoles.snapshot(agent).enabled });
  ctx.tools?.register(definition(false));
}
