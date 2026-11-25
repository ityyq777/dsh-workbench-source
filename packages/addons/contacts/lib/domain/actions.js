/** 联系人 action：写操作仅 UI，读操作允许 agent。 */
function deny(origin) { if (origin !== "ui" && origin !== "agent") { const e = new Error("该操作只允许在界面中执行"); e.status = 403; throw e; } }

export function registerContactActions(api, engine) {
  const defs = [];
  const action = (name, def) => {
    defs.push({ name, domain: "wb-addon-contacts", description: def.description || "", input: def.input || { type: "object", properties: {} }, examples: def.examples || [] });
    api.action(name, def);
  };
  action("contacts.status", { description: "联系人统计", input: { type: "object", properties: {} }, execute: () => engine.stats() });
  action("contacts.list", {
    description: "联系人列表，可按关键词或分组过滤",
    input: { type: "object", properties: { q: { type: "string" }, groupId: { type: "string" }, limit: { type: "number" }, offset: { type: "number" } } },
    execute: (args) => engine.list({ q: args.q, groupId: args.groupId, limit: args.limit, offset: args.offset }),
  });
  action("contacts.get", { description: "联系人详情（含字段与分组）", input: { type: "object", properties: { id: { type: "string" } }, required: ["id"] }, execute: (args) => engine.one(args.id) });
  action("contacts.create", {
    origins: ["ui", "agent"],
    originsDefault: ["ui"],
    description: "新建联系人；仅 UI",
    input: { type: "object", properties: { name: { type: "string" }, org: { type: "string" }, title: { type: "string" }, note: { type: "string" }, birthday: { type: "string" }, fields: { type: "array" }, groups: { type: "array" } }, required: ["name"] },
    execute: (args, ctx) => { deny(ctx.origin); return engine.create({ name: args.name, org: args.org, title: args.title, note: args.note, birthday: args.birthday, fields: args.fields, groups: args.groups }); },
  });
  action("contacts.update", {
    origins: ["ui", "agent"],
    originsDefault: ["ui"],
    description: "更新联系人；仅 UI",
    input: { type: "object", properties: { id: { type: "string" }, name: { type: "string" }, org: { type: "string" }, title: { type: "string" }, note: { type: "string" }, birthday: { type: "string" }, fields: { type: "array" }, groups: { type: "array" } }, required: ["id"] },
    execute: (args, ctx) => { deny(ctx.origin); return engine.update({ id: args.id, name: args.name, org: args.org, title: args.title, note: args.note, birthday: args.birthday, fields: args.fields, groups: args.groups }); },
  });
  action("contacts.delete", { origins: ["ui", "agent"],
    originsDefault: ["ui"], description: "软删除联系人；仅 UI", input: { type: "object", properties: { id: { type: "string" } }, required: ["id"] }, execute: (args, ctx) => { deny(ctx.origin); return engine.remove(args.id); } });
  action("contacts.search", { description: "按姓名/组织/字段搜索联系人", input: { type: "object", properties: { q: { type: "string" }, limit: { type: "number" } }, required: ["q"] }, execute: (args) => engine.search(args.q, { limit: args.limit }) });
  action("contacts.groupList", { description: "分组列表与人数", input: { type: "object", properties: {} }, execute: () => ({ items: engine.groups() }) });
  action("contacts.groupCreate", { origins: ["ui", "agent"],
    originsDefault: ["ui"], description: "新建分组；仅 UI", input: { type: "object", properties: { name: { type: "string" }, color: { type: "string" } }, required: ["name"] }, execute: (args, ctx) => { deny(ctx.origin); return engine.createGroup({ name: args.name, color: args.color }); } });
  action("contacts.groupDelete", { origins: ["ui", "agent"],
    originsDefault: ["ui"], description: "删除分组；仅 UI", input: { type: "object", properties: { id: { type: "string" } }, required: ["id"] }, execute: (args, ctx) => { deny(ctx.origin); return engine.deleteGroup(args.id); } });
  action("contacts.importVcf", { origins: ["ui", "agent"],
    originsDefault: ["ui"], description: "导入 vCard 文本；仅 UI", input: { type: "object", properties: { text: { type: "string" } }, required: ["text"] }, execute: (args, ctx) => { deny(ctx.origin); return engine.importVcf(args.text); } });
  action("contacts.exportVcf", { description: "导出 vCard 文本，可指定 id 列表", input: { type: "object", properties: { ids: { type: "array" } } }, execute: (args) => engine.exportVcf(args.ids) });
  action("contacts.actionSchema", { description: "本域 action 清单与输入 schema", input: { type: "object", properties: {} }, execute: () => ({ shellVersion: api.shellVersion || "", domains: [{ id: "wb-addon-contacts", version: (api.addon && api.addon.version) || "0.1.0" }], actions: defs }) });
}
