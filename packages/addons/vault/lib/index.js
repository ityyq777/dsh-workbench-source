/**
 * wb-addon-vault：独立凭据保险箱域。
 * 明文只在 UI reveal 或 plugin lease 时短暂出现；agent 永远拿不到。
 * 0.2.0：分组/关联 + 密文与口令包裹上云，device key 与使用记录留本机。
 */
import { ensureSchema, bindClock } from "./db/db.js";
import { createVault } from "./domain/vault.js";
import { createGroups } from "./domain/groups.js";
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
  let groups = null;
  let schemas = [];

  return {
    id: "wb-addon-vault",
    title: "凭据保险箱",
    description: "集中保存密码、应用专用密码与 token；按分组授权给业务模块，加密落库、密文可同步。",
    version: "0.2.0",
    tables: [
      "vault_header",
      "vault_device",
      "vault_group",
      "vault_secret",
      "vault_binding",
      "vault_subject_type",
      "vault_secret_usage",
    ],
    sync: {
      tables: [
        { name: "vault_header", mode: "row", uniqueKeys: [["id"]], uniquePolicy: "lww" },
        { name: "vault_secret", mode: "row", uniqueKeys: [["id"], ["name"]], uniquePolicy: "lww-tombstone" },
        { name: "vault_group", mode: "row", uniqueKeys: [["id"], ["name"]], uniquePolicy: "lww-tombstone" },
        {
          name: "vault_binding",
          mode: "row",
          uniqueKeys: [["id"], ["subject_type", "subject_id", "group_id"]],
          uniquePolicy: "lww-tombstone",
        },
        { name: "vault_subject_type", mode: "row", uniqueKeys: [["id"], ["type"]], uniquePolicy: "lww-tombstone" },
      ],
    },
    views: [
      { id: "status", title: "保险箱", icon: "shield" },
      { id: "secrets", title: "凭据", icon: "key" },
      { id: "groups", title: "分组与关联", icon: "folder" },
      { id: "config", title: "设置", icon: "sliders" },
      { id: "data", title: "数据", icon: "database" },
      { id: "actions", title: "Action 清单", icon: "list" },
    ],
    capability: {
      summary: "保存连接器/站点需要的密码与 token，按分组授权；明文只向 UI 或 plugin 租约暴露。",
      records: [
        {
          kind: "secret",
          table: "vault_secret",
          title: "凭据",
          description: "一条加密凭据（密码/应用专用密码/token），可归入一个分组，列表只显示名称与备注。",
          when: ["需要保存邮箱密码或应用专用密码", "连接器要绑定一个 token", "想在 agent 面前隐藏明文"],
          primaryAction: "vault.secretCreate",
        },
        {
          kind: "group",
          table: "vault_group",
          title: "凭据分组",
          description: "把多条凭据收成一组，业务对象通过 vault_binding 关联到组，而不是逐条绑定。",
          when: ["一个站点/邮箱要复用多条凭据", "按用途（邮件、订阅、支付）归类"],
          primaryAction: "vault.groupCreate",
        },
      ],
      fields: [
        { name: "name", type: "string", description: "唯一名称" },
        { name: "kind", type: "password|token|app_password|api_key|other", description: "凭据类型" },
        { name: "groupId", type: "string", description: "所属分组，可空" },
        { name: "meta", type: "object", description: "非敏感备注（用户名、URL、过期提醒）" },
      ],
      notFor: ["浏览器密码自动填充", "跨设备同步明文", "给 agent 读取明文"],
      notes: [
        "vault_header/vault_secret/vault_group/vault_binding/vault_subject_type 随云同步；device key 与 last_used_at 只留本机。",
        "同步上去的是 KDF 参数与密文，云端没有口令也解不开；换机重新输入口令即可解锁。",
        "备份仍不导出密文，换机靠同步或重新录入。",
      ],
    },
    setup(api) {
      ensureSchema(api.db);
      bindClock(() => api.now());
      vault = createVault({ db: api.db, log: api.log });
      groups = createGroups({ db: api.db });
      const register = api.action.bind(api);
      api.action = (actionName, def) => {
        schemas.push({ name: actionName, domain: "wb-addon-vault", description: def.description, input: def.input, examples: def.examples });
        register(actionName, def);
      };
      registerVaultActions(api, vault, groups);
      api.action = register;
      const origTool = api.tool.bind(api);
      api.tool = (toolName, def) => origTool(toolName, def);
      api.action("vault.actionSchema", {
        description: "只读：本域 action 清单与输入 schema（插件自证，不读宿主统一接口）。",
        input: { type: "object", properties: {}, additionalProperties: false },
        execute: () => ({ shellVersion: api.shellVersion || "", domains: [{ id: "wb-addon-vault", version: (api.addon && api.addon.version) || "0.2.1" }], actions: schemas }),
      });
      void host;
    },
    exportData() {
      return {
        formatVersion: 1,
        exportedAt: new Date().toISOString(),
        note: "保险箱密文与 KDF 参数不进入备份；换机请重新输入口令（或等云同步），不要靠备份还原密文。",
        secrets: [],
        groups: [],
        bindings: [],
      };
    },
    importData() {
      return 0;
    },
  };
}
