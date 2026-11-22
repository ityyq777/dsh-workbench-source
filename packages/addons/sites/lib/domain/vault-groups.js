/**
 * 站点关联的凭据分组（只读查询）。
 *
 * 映射表 vault_binding 归凭据保险箱所有：绑定/解绑都在保险箱页操作，站点这边只提供
 * 「这个站点关联了哪些分组」的查询，方便列表、详情与 agent 看到关联结果。
 * 站点自己不再保存账号、登录名或任何凭据字段。
 */

import { bindingsOfSite, vaultInstalled } from "../infra/vault-link.js";

const SITE_TABLE = "site";

export function registerVaultGroupActions(api) {
  const db = api.db;

  api.action("sites.vaultGroups", {
    description: "查询某站点关联的凭据分组（映射表由凭据保险箱维护，这里只读）；未安装保险箱时返回 installed=false。",
    input: {
      type: "object",
      properties: { siteId: { type: ["string", "number"], description: "站点 id，必填" } },
      required: ["siteId"],
    },
    execute: async function (args) {
      const id = String(args.siteId === undefined || args.siteId === null ? "" : args.siteId).trim();
      if (!id) throw new Error("siteId 不能为空");
      const row = db.prepare("SELECT id FROM " + SITE_TABLE + " WHERE id=? AND deleted_at IS NULL").get(id);
      if (!row) throw new Error("站点不存在：" + id);
      if (!vaultInstalled()) return { installed: false, siteId: id, items: [] };
      const bound = (await bindingsOfSite(id)) || [];
      return {
        installed: true,
        siteId: id,
        items: bound.map(function (item) {
          return {
            id: String(item.groupId),
            name: item.groupName || "",
            color: item.groupColor || null,
            secretCount: Number(item.secretCount || 0),
            updatedAt: item.updatedAt || null,
          };
        }),
      };
    },
    render: function (r) {
      if (!r || !r.installed) return "未安装凭据保险箱，站点没有关联任何凭据分组";
      if (!r.items.length) return "该站点尚未关联凭据分组";
      return r.items.map(function (g) {
        return "- " + (g.name || g.id) + "（凭据 " + g.secretCount + " 条）";
      }).join("\n");
    },
  });
}
