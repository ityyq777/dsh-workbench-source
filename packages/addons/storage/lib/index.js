import { bindClock, ensureSchema } from "./db.js";
import { registerStorageActions } from "./storage.js";
import { registerConfigActions } from "./config.js";
import { registerDataActions } from "./data.js";
import { exportStorageData, importStorageData } from "./backup.js";
export const inject = ["workbench"];
export const storageSync = { tables: [{ name: "storage", mode: "row" }] };
export function setup(api) {
  bindClock(typeof api.now === "function" ? api.now : null);
  ensureSchema(api.db);
  registerStorageActions(api);
  registerConfigActions(api);
  registerDataActions(api);
  api.log("storage domain ready");
}
export function apply(ctx) {
  const host = ctx.workbench;
  if (!host) throw new Error("dsh-workbench 未加载：缺少 workbench 服务");
  let domainApi;
  ctx.effect(
    () =>
      host.registerDomain({
        id: "wb-addon-storage",
        title: "储物",
        description: "储物：记录物品名称、品牌、单位、库存文本、图片URL、备注与可选标签",
        version: "1.4.1",
        tables: ["storage"],
        sync: storageSync,
        backupAfter: ["wb-addon-tags"],
        views: [
          { id: "stats", title: { zh: "统计", en: "Statistics" } },
          { id: "storage", title: { zh: "记录", en: "Records" } },
          { id: "config", title: { zh: "配置", en: "Config" } },
          { id: "data", title: { zh: "数据", en: "Data" } },
        ],
        capability: {
          taskOwnership: { boundary: "物品登记使用 storage.create；开发、修复 storage 功能的工作项使用 tasks.create，不把物品记成任务。", query: "storage" },
          summary: "记录储物条目，库存可为 1~2 等文本；图片只保存HTTP(S) URL，不上传。标签为可选能力。",
          requires: [],
          records: [
            {
              kind: "storage",
              title: "储物",
              description: "储物条目：物品与当前库存文本",
              when: ["用户记录储物条目"],
              notFor: ["库存流水、自动扣减、文件上传"],
              primaryAction: "storage.create",
              keyArgs: ["name", "brand", "unit", "stock", "imgList", "remark", "tagIds"],
              dedupe: "先用 storage.list 按名称查询",
              relations: [{ kind: "tag", via: "tagIds", description: "可选标签，需标签插件启用" }],
              examples: [{ purpose: "记录物品", args: { name: "电池", stock: "1~2", unit: "盒" } }],
            },
          ],
          fields: [
            { name: "name", type: "string", description: "必填物品名称" },
            { name: "stock", type: "string", description: "库存文本，支持范围" },
            { name: "imgList", type: "string[]", description: "HTTP(S)图片URL" },
            { name: "remark", type: "string", description: "保存的备注" },
          ],
          notes: ["标签映射同步归标签域；物品行同步归本域。"],
          warnings: [],
        },
        setup: (api) => {
          domainApi = api;
          setup(api);
        },
        exportData: () => exportStorageData(domainApi),
        importData: (raw, _ctx, options) => importStorageData(domainApi, raw, options),
      }),
    "storage-domain",
  );
}
