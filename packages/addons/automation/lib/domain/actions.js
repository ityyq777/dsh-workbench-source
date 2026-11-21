/** automation action 注册：写操作仅 UI，读操作允许 agent。 */
import { DENIED_PATTERNS, isDenied } from "./whitelist.js";

const TABLE_WHITELIST = {
  automation_rule: ["id", "name", "enabled", "trigger_type", "last_status", "run_count", "error_count", "next_run_at", "updated_at"],
  automation_run: ["id", "rule_id", "trigger", "status", "started_at", "finished_at", "error"],
};

function deny(origin, allow) {
  if (!allow.includes(origin)) {
    const error = new Error("该操作只允许 " + allow.join("/") + " 调用");
    error.status = 403;
    throw error;
  }
}

export function registerActions(api, engine) {
  const defs = [];
  const action = (name, def) => {
    defs.push({ name, domain: "wb-addon-automation", description: def.description || "", input: def.input || { type: "object", properties: {} }, examples: def.examples || [] });
    api.action(name, def);
  };

  action("automation.status", {
    description: "自动化域状态：规则数量、启用数、今日运行与配置",
    input: { type: "object", properties: {} },
    execute: () => engine.stats(),
  });

  action("automation.ruleList", {
    description: "列出自动化规则及最近一次运行",
    input: { type: "object", properties: {} },
    execute: () => ({ items: engine.listRules() }),
  });

  action("automation.ruleGet", {
    description: "读取一条规则详情",
    input: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    execute: (args) => engine.getRule(args.id),
  });

  action("automation.ruleCreate", {
    agentEnabled: false,
    description: "创建规则；写操作仅 UI",
    input: {
      type: "object",
      properties: {
        name: { type: "string" },
        enabled: { type: "boolean" },
        triggerType: { type: "string", enum: ["schedule", "event", "manual"] },
        triggerConfig: { type: "object" },
        condition: { type: "object" },
        actionName: { type: "string" },
        actionArgs: { type: "object" },
      },
      required: ["name", "actionName"],
    },
    execute: (args, ctx) => {
      deny(ctx.origin, ["ui", "agent"]);
      return engine.createRule({
        name: args.name,
        enabled: args.enabled,
        triggerType: args.triggerType,
        triggerConfig: args.triggerConfig,
        condition: args.condition,
        actionName: args.actionName,
        actionArgs: args.actionArgs,
      });
    },
  });

  action("automation.ruleUpdate", {
    agentEnabled: false,
    description: "局部更新规则；写操作仅 UI",
    input: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        enabled: { type: "boolean" },
        triggerType: { type: "string", enum: ["schedule", "event", "manual"] },
        triggerConfig: { type: "object" },
        condition: { type: "object" },
        actionName: { type: "string" },
        actionArgs: { type: "object" },
      },
      required: ["id"],
    },
    execute: (args, ctx) => {
      deny(ctx.origin, ["ui", "agent"]);
      return engine.updateRule({
        id: args.id,
        name: args.name,
        enabled: args.enabled,
        triggerType: args.triggerType,
        triggerConfig: args.triggerConfig,
        condition: args.condition,
        actionName: args.actionName,
        actionArgs: args.actionArgs,
      });
    },
  });

  action("automation.ruleDelete", {
    agentEnabled: false,
    description: "软删规则；仅 UI",
    input: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    execute: (args, ctx) => {
      deny(ctx.origin, ["ui", "agent"]);
      return engine.deleteRule(args.id);
    },
  });

  action("automation.ruleRun", {
    agentEnabled: false,
    description: "立即执行一次规则；仍受白名单、条件和频率限制",
    input: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    execute: (args, ctx) => {
      deny(ctx.origin, ["ui", "agent"]);
      return engine.runRule(args.id, "manual", {});
    },
  });

  action("automation.runList", {
    description: "运行记录列表",
    input: { type: "object", properties: { ruleId: { type: "string" }, limit: { type: "number" } } },
    execute: (args) => ({ items: engine.runList({ ruleId: args.ruleId, limit: args.limit }) }),
  });

  action("automation.runGet", {
    description: "单条运行记录",
    input: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    execute: (args) => engine.runGet(args.id),
  });

  action("automation.stats", {
    description: "首页卡片统计",
    input: { type: "object", properties: {} },
    execute: () => engine.stats(),
  });

  action("automation.configGet", {
    description: "读取自动化配置",
    input: { type: "object", properties: {} },
    execute: () => engine.config(),
  });

  action("automation.configSet", {
    agentEnabled: false,
    description: "修改最大规则数、每小时上限与允许调用的 action；仅 UI",
    input: {
      type: "object",
      properties: {
        maxRules: { type: "number" },
        perHour: { type: "number" },
        allowedActions: { type: "array", items: { type: "string" } },
      },
    },
    execute: (args, ctx) => {
      deny(ctx.origin, ["ui", "agent"]);
      const patch = {};
      if (args && args.maxRules !== undefined) patch.maxRules = args.maxRules;
      if (args && args.perHour !== undefined) patch.perHour = args.perHour;
      if (args && args.allowedActions !== undefined) patch.allowedActions = args.allowedActions;
      return engine.saveConfig(patch);
    },
  });

  action("automation.actionOptions", {
    description: "本机已启用的 action 清单、硬底线与触发类型",
    input: { type: "object", properties: {} },
    execute: () => ({ actions: engine.config().allowedActions, denied: DENIED_PATTERNS, triggers: ["interval", "dailyAt", "event", "manual"] }),
  });

  action("automation.actionCatalog", {
    description: "列出宿主全部可被自动化调用的 action（过滤硬底线与 automation 自身）",
    input: { type: "object", properties: {} },
    execute: async () => {
      try {
        const res = await api.call("actions.list", {}, "plugin");
        const rows = Array.isArray(res && res.actions) ? res.actions : [];
        const items = rows
          .map((row) => ({
            name: String((row && row.name) || ""),
            domain: String((row && row.domain) || ""),
            description: String((row && row.description) || ""),
            agentEnabled: !(row && row.agentEnabled === false),
          }))
          .filter((row) => row.name && !isDenied(row.name))
          .sort((a, b) => a.name.localeCompare(b.name));
        return { items, error: "" };
      } catch (error) {
        // actions.list 不可用时退化为空候选，设置页仍可手动添加。
        return { items: [], error: String((error && error.message) || error) };
      }
    },
  });

  action("automation.actionSchema", {
    description: "自证 action 清单与输入 schema（供 Action 页读取）",
    input: { type: "object", properties: {} },
    execute: () => ({ shellVersion: api.shellVersion || "", domains: [{ id: "wb-addon-automation", version: (api.addon && api.addon.version) || "0.2.0" }], actions: defs }),
  });

  action("automation.dataTables", {
    description: "数据表白名单与列",
    input: { type: "object", properties: {} },
    execute: () => ({ tables: Object.keys(TABLE_WHITELIST), columns: TABLE_WHITELIST }),
  });

  action("automation.dataQuery", {
    agentEnabled: false,
    description: "只读查询白名单表；仅 UI",
    input: {
      type: "object",
      properties: { table: { type: "string" }, limit: { type: "number" }, offset: { type: "number" } },
      required: ["table"],
    },
    execute: (args, ctx) => {
      deny(ctx.origin, ["ui", "agent"]);
      const table = String(args.table || "");
      if (!TABLE_WHITELIST[table]) throw new Error("表不在白名单：" + table);
      const limit = Math.max(1, Math.min(200, Number(args.limit) || 50));
      const offset = Math.max(0, Number(args.offset) || 0);
      const cols = TABLE_WHITELIST[table].join(",");
      return { table, rows: api.db.prepare("SELECT " + cols + " FROM " + table + " ORDER BY rowid DESC LIMIT ? OFFSET ?").all(limit, offset) };
    },
  });
}
