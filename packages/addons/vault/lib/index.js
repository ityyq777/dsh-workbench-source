/**
 * wb-addon-vault：独立凭据保险箱域。
 * 明文只在 UI reveal 或 plugin lease 时短暂出现；agent 永远拿不到。
 */
import { ensureSchema, bindClock } from "./db/db.js";
import { createVault } from "./domain/vault.js";
import { registerVaultActions } from "./domain/actions.js";

export const name = "dsh-workbench-vault";
export const inject = ["workbench"];

export function apply(ctx) {
  const host = ctx.workbench;
  if (!host) throw new Error("wb-addon-vault 依赖 workbench 宿主");
  ctx.effect(() => host.registerDomain(createDomain(host)), "vault-domain");
}

export function createDomain(host) {
  let vault = null;
  let schemas = [];

  return {
    id: "wb-addon-vault",
    title: "凭据保险箱",
    description: "集中保存密码、应用专用密码与 token；加密落库，agent 只看到掩码。",
    version: "0.1.0",
    tables: ["vault_meta", "vault_secret"],
    sync: { tables: [] },
    views: [
      { id: "status", title: "保险箱", icon: "shield" },
      { id: "secrets", title: "凭据", icon: "key" },
      { id: "config", title: "设置", icon: "sliders" },
      { id: "data", title: "数据", icon: "database" },
      { id: "actions", title: "Action 清单", icon: "list" },
    ],
    capability: {
      summary: "保存连接器/站点需要的密码与 token；只向 UI 或 plugin 租约暴露明文。",
      records: [
        {
          kind: "secret",
          table: "vault_secret",
          title: "凭据",
          description: "一条加密凭据（密码/应用专用密码/token），列表只显示名称与备注。",
          when: ["需要保存邮箱密码或应用专用密码", "连接器要绑定一个 token", "想在 agent 面前隐藏明文"],
          primaryAction: "vault.secretCreate",
        },
      ],
      fields: [
        { name: "name", type: "string", description: "唯一名称" },
        { name: "kind", type: "password|token|app_password|api_key|other", description: "凭据类型" },
        { name: "meta", type: "object", description: "非敏感备注（用户名、URL、过期提醒）" },
      ],
      notFor: ["浏览器密码自动填充", "跨设备同步明文", "给 agent 读取明文"],
      notes: ["vault_meta/vault_secret 不参与云同步，也不导出密文到备份。"],
    },
    setup(api) {
      ensureSchema(api.db);
      bindClock(() => api.now());
      vault = createVault({ db: api.db, log: api.log });
      const register = api.action.bind(api);
      api.action = (actionName, def) => {
        schemas.push({ name: actionName, description: def.description, input: def.input, examples: def.examples });
        register(actionName, def);
      };
      registerVaultActions(api, vault);
      api.action = register;
      const origTool = api.tool.bind(api);
      api.tool = (toolName, def) => origTool(toolName, def);
      api.action("vault.actionSchema", {
        description: "只读：本域 action 清单与输入 schema（插件自证，不读宿主统一接口）。",
        input: { type: "object", properties: {}, additionalProperties: false },
        execute: () => ({ domain: "wb-addon-vault", version: "0.1.0", actions: schemas }),
      });
      void host;
    },
    exportData() {
      return {
        formatVersion: 1,
        exportedAt: new Date().toISOString(),
        note: "保险箱密文与 KDF 参数不进入备份；换机请重新录入凭据。",
        secrets: [],
      };
    },
    importData() {
      return 0;
    },
  };
}
