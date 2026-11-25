/**
 * 保险箱 action 契约：所有写操作按 origin 门禁，agent 永远拿不到明文。
 * 分组与关联对 plugin 开放，业务模块用自身标识注册，不需要依赖 sites。
 */
import { KINDS } from "./secret-input.js";
import { registerSetActions } from "./actions-sets.js";
import { DATA_TABLES, columnsOf, countOf, statsOf, dataTableNames } from "./data-schema.js";

function only(ctx, allowed, action) {
  const origin = ctx && ctx.origin ? ctx.origin : "agent";
  if (!allowed.includes(origin)) throw new Error(action + " 不允许 " + origin + " 调用");
}

export function registerVaultActions(api, vault, groups) {
  // 复用 vault 里那份带 getDek 的集合实例：账号读写要 DEK，另建一份会永远判定为锁定。
  const sets = vault.sets;
  api.action("vault.status", {
    description: "只读：保险箱是否初始化、是否锁定、主口令指纹、凭据/分组数量与同步状态；不含任何密文。",
    input: { type: "object", properties: {}, additionalProperties: false },
    execute: (_args, ctx) => {
      only(ctx, ["ui", "agent", "plugin"], "vault.status");
      return vault.status();
    },
  });

  api.action("vault.setup", {
    origins: ["ui"],
    description:
      "首次初始化保险箱：设置主口令。主口令是全保险箱唯一的解锁因子，所有设备必须用同一个；" +
      "口令本身不落库、不上云，上云的只是用它包裹后的 DEK。",
    input: {
      type: "object",
      properties: {
        passphrase: { type: "string", description: "主口令，至少 12 个字符；请在所有设备上使用同一个" },
      },
      required: ["passphrase"],
      additionalProperties: false,
    },
    examples: [{ passphrase: "correct horse battery staple" }],
    execute: (args, ctx) => {
      only(ctx, ["ui"], "vault.setup");
      return vault.setup(args);
    },
  });

  api.action("vault.unlock", {
    origins: ["ui"],
    description: "用主口令解锁保险箱；连续 5 次失败锁定 5 分钟。",
    input: {
      type: "object",
      properties: { passphrase: { type: "string", description: "主口令" } },
      required: ["passphrase"],
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["ui"], "vault.unlock");
      const result = vault.unlock(args);
      // 解锁成功后推一条事件：订阅方（如邮件插件）可以立刻同步一次，
      // 不必等自己的定时器。推送失败不影响解锁本身。
      if (api.events && typeof api.events.push === "function") {
        try {
          api.events.push("vault.unlocked", { at: Date.now() });
        } catch (error) {
          api.log("vault: 推解锁事件失败", String((error && error.message) || error));
        }
      }
      return result;
    },
  });

  api.action("vault.lock", {
    origins: ["ui", "plugin"],
    description: "立即清除内存中的 DEK；插件后台可用它主动锁定。",
    input: { type: "object", properties: {}, additionalProperties: false },
    execute: (_args, ctx) => {
      only(ctx, ["ui", "plugin"], "vault.lock");
      vault.lock();
      return { ok: true };
    },
  });

  api.action("vault.changePassphrase", {
    origins: ["ui"],
    description: "修改主口令：只重包 DEK 并让 passphrase_rev 加一，不重新加密所有 secret。",
    input: {
      type: "object",
      properties: {
        oldPassphrase: { type: "string" },
        newPassphrase: { type: "string", description: "至少 12 个字符" },
      },
      required: ["oldPassphrase", "newPassphrase"],
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["ui"], "vault.changePassphrase");
      return vault.changePassphrase(args);
    },
  });

  api.action("vault.secretList", {
    description: "只读：列出凭据名称/类型集合/集合归属/备注/最近使用时间，永远不含明文；kind 命中多类型凭据的任一类型。",
    input: {
      type: "object",
      properties: {
        q: { type: "string", description: "按名称或备注模糊搜索" },
        kind: { type: "string", enum: KINDS, description: "按类型过滤：多类型凭据只要包含该类型即命中" },
        groupId: { type: "string", description: "只看某个分组（经集合关联）" },
        setId: { type: "string", description: "只看某个凭据集合" },
      },
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["ui", "agent"], "vault.secretList");
      return vault.listSecrets(args);
    },
  });

  api.action("vault.secretCreate", {
    origins: ["ui"],
    description: "新增凭据；secret 只在内存加密后落库，审计中该字段显示为 ***。",
    input: {
      type: "object",
      properties: {
        name: { type: "string", description: "唯一名称，1–100 字" },
        kinds: {
          type: "array",
          items: { type: "string", enum: KINDS },
          description: "凭据类型，至少一个，可多选（如 account + password）；按固定顺序落库",
        },
        secret: { type: "string", description: "明文密码/token，不会落审计" },
        meta: { type: "object", description: "非敏感备注：用户名、URL、过期提醒" },
        groupId: { type: "string", description: "所属分组，可空；写入时自动挂到该组的默认集合" },
        setId: { type: "string", description: "直接指定凭据集合，优先于 groupId" },
      },
      required: ["name", "kinds", "secret"],
      additionalProperties: false,
    },
    examples: [{ name: "sspai-basic", kinds: ["account", "password"], secret: "app-password", meta: { username: "me" } }],
    execute: (args, ctx) => {
      only(ctx, ["ui"], "vault.secretCreate");
      return vault.createSecret(args);
    },
  });

  api.action("vault.secretUpdate", {
    origins: ["ui"],
    description: "更新名称/类型/备注或轮换明文；改名称会重加密，改类型与归属不会。",
    input: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        kinds: {
          type: "array",
          items: { type: "string", enum: KINDS },
          description: "替换整组类型，至少一个；不传表示不改",
        },
        secret: { type: "string", description: "留空表示不轮换" },
        meta: { type: "object" },
        groupId: { type: "string", description: "再挂到某个分组的默认集合（不改动已有集合）" },
        setId: { type: "string", description: "指定集合；P2 起可用" },
      },
      required: ["id"],
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["ui"], "vault.secretUpdate");
      return vault.updateSecret(args);
    },
  });

  api.action("vault.secretDelete", {
    origins: ["ui"],
    description: "软删除凭据；已绑定它的连接器会在下次运行时提示凭据失效。",
    input: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["ui"], "vault.secretDelete");
      return vault.deleteSecret(args);
    },
  });

  registerSetActions({ api, sets, groups, vault, only, KINDS });

  api.action("vault.secretReveal", {
    origins: ["ui"],
    description: "在界面上显示一条凭据明文；必须已用主口令解锁，agent/plugin 一律拒绝。",
    input: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["ui"], "vault.secretReveal");
      return vault.reveal(args);
    },
  });

  api.action("vault.lease", {
    origins: ["plugin"],
    description: "后台插件租用凭据明文，ttl 30–300 秒；只允许 plugin origin，传 subject 时校验绑定。",
    input: {
      type: "object",
      properties: {
        id: { type: "string" },
        purpose: { type: "string", description: "用途，写入审计" },
        ttlSeconds: { type: "number", description: "30–300，默认 60" },
        subjectType: { type: "string", description: "调用方业务类型；与 subjectId 一起校验绑定" },
        subjectId: { type: "string", description: "调用方业务对象 id" },
      },
      required: ["id"],
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["plugin"], "vault.lease");
      return vault.lease(args);
    },
  });

  api.action("vault.groupList", {
    description: "只读：分组列表（含凭据数、关联对象数）；不含密文。",
    input: {
      type: "object",
      properties: { q: { type: "string", description: "按组名/描述搜索" } },
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["ui", "agent", "plugin"], "vault.groupList");
      return groups.groupList(args);
    },
  });

  api.action("vault.groupCreate", {
    origins: ["ui"],
    description: "新建凭据分组；组名唯一。",
    input: {
      type: "object",
      properties: {
        name: { type: "string", description: "1–60 字" },
        description: { type: "string" },
        color: { type: "string", description: "可选色标" },
      },
      required: ["name"],
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["ui"], "vault.groupCreate");
      return groups.groupCreate(args);
    },
  });

  api.action("vault.groupUpdate", {
    origins: ["ui"],
    description: "改名/描述/色标；不改动组内凭据的密文。",
    input: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        description: { type: "string" },
        color: { type: "string" },
      },
      required: ["id"],
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["ui"], "vault.groupUpdate");
      return groups.groupUpdate(args);
    },
  });

  api.action("vault.groupDelete", {
    origins: ["ui"],
    description: "软删除分组：组内凭据移到 moveTo，未指定则移出分组；组上的绑定一并软删。",
    input: {
      type: "object",
      properties: {
        id: { type: "string" },
        moveTo: { type: "string", description: "可选，接收凭据的分组 id" },
      },
      required: ["id"],
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["ui"], "vault.groupDelete");
      return groups.groupDelete(args);
    },
  });

  api.action("vault.subjectRegister", {
    origins: ["plugin"],
    description: "业务插件注册自己的关联类型（幂等），供组详情页显示可读标题。",
    input: {
      type: "object",
      properties: {
        type: { type: "string", description: "小写标识，如 site" },
        title: { type: "string", description: "展示名，如 站点" },
        description: { type: "string" },
      },
      required: ["type", "title"],
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["plugin"], "vault.subjectRegister");
      return groups.subjectRegister(args);
    },
  });

  api.action("vault.bind", {
    origins: ["ui", "plugin"],
    description: "把业务对象关联到凭据分组（重复绑定幂等）；vault 不校验对象是否存在。",
    input: {
      type: "object",
      properties: {
        subjectType: { type: "string" },
        subjectId: { type: "string" },
        groupId: { type: "string" },
      },
      required: ["subjectType", "subjectId", "groupId"],
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["ui", "plugin"], "vault.bind");
      return groups.bind(args);
    },
  });

  api.action("vault.unbind", {
    origins: ["ui", "plugin"],
    description: "解除一个业务对象与分组的关联（软删）。",
    input: {
      type: "object",
      properties: {
        subjectType: { type: "string" },
        subjectId: { type: "string" },
        groupId: { type: "string" },
      },
      required: ["subjectType", "subjectId", "groupId"],
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["ui", "plugin"], "vault.unbind");
      return groups.unbind(args);
    },
  });

  api.action("vault.bindingsOf", {
    description: "只读：某个业务对象关联了哪些分组（含组名、凭据数）。",
    input: {
      type: "object",
      properties: { subjectType: { type: "string" }, subjectId: { type: "string" } },
      required: ["subjectType", "subjectId"],
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["ui", "agent", "plugin"], "vault.bindingsOf");
      return groups.bindingsOf(args);
    },
  });

  api.action("vault.subjectsOf", {
    description: "只读：某个分组关联了哪些业务对象。",
    input: {
      type: "object",
      properties: {
        groupId: { type: "string" },
        limit: { type: "number" },
        offset: { type: "number" },
      },
      required: ["groupId"],
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["ui", "agent"], "vault.subjectsOf");
      return groups.subjectsOf(args);
    },
  });

  api.action("vault.subjectSecrets", {
    origins: ["plugin"],
    description: "后台插件只读：某个业务对象经分组可见的凭据清单（不含明文），拿到 id 后再 lease。",
    input: {
      type: "object",
      properties: { subjectType: { type: "string" }, subjectId: { type: "string" } },
      required: ["subjectType", "subjectId"],
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["plugin"], "vault.subjectSecrets");
      return groups.subjectSecrets(args);
    },
  });

  api.action("vault.bindingPurge", {
    origins: ["plugin"],
    description: "插件卸载/业务对象删除时清理自己的绑定引用（硬删）。",
    input: {
      type: "object",
      properties: { subjectType: { type: "string" }, subjectId: { type: "string" } },
      required: ["subjectType"],
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["plugin"], "vault.bindingPurge");
      return groups.bindingPurge(args);
    },
  });

  api.action("vault.syncStatus", {
    description: "只读：同步 schema 版本、口令修订号与同步表清单；不含密文，冲突列表在宿主同步页。",
    input: { type: "object", properties: {}, additionalProperties: false },
    execute: (_args, ctx) => {
      only(ctx, ["ui", "agent"], "vault.syncStatus");
      const status = vault.status();
      return {
        schemaVersion: status.schemaVersion,
        passphraseRev: status.passphraseRev,
        cloudSync: true,
        tables: ["vault_header", "vault_secret", "vault_secret_kind", "vault_group", "vault_binding", "vault_subject_type", "vault_set_secret", "vault_group_set", "vault_set"],
        localOnly: ["vault_device", "vault_secret_usage"],
        pending: null,
        conflicts: null,
        note: "同步状态与冲突在宿主的同步页查看；设备本地状态与使用记录不上云，主口令本身永不上云。",
      };
    },
  });

  api.action("vault.dataTables", {
    origins: ["ui"],
    description:
      "只读：数据页表清单。columns 为完整列元信息（含中文名、类型、主键、可空与缺省值），" +
      "空表也能列出全部字段；stats=true 时附行数与索引摘要，口径与 tags/tasks 数据页一致。",
    input: {
      type: "object",
      properties: {
        stats: { type: "boolean", description: "是否附带行数与索引摘要，默认 false" },
      },
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["ui"], "vault.dataTables");
      const withStats = Boolean(args && args.stats);
      return {
        tables: DATA_TABLES.map((tb) => {
          const table = {
            name: tb.name,
            label: tb.label,
            columns: columnsOf(api.db, tb.name),
            count: countOf(api.db, tb.name),
          };
          if (withStats) table.stats = statsOf(api.db, tb.name);
          return table;
        }),
      };
    },
  });

  api.action("vault.dataQuery", {
    origins: ["ui"],
    description:
      "只读：数据页查询；密文列一律掩码。返回 columns（完整列元信息）与 page/pageSize/pages/total，" +
      "分页参数同时接受 page/pageSize 与 limit/offset 两种写法。",
    input: {
      type: "object",
      properties: {
        table: { type: "string", enum: dataTableNames() },
        page: { type: "number", description: "页码，从 1 开始" },
        pageSize: { type: "number", description: "每页行数，默认 50，上限 200" },
        limit: { type: "number", description: "兼容旧调用：每页行数，默认 50，上限 200" },
        offset: { type: "number", description: "兼容旧调用：行偏移，默认 0" },
      },
      required: ["table"],
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["ui"], "vault.dataQuery");
      const table = String(args.table);
      if (!dataTableNames().includes(table)) throw new Error("不支持的数据表：" + table);
      const limit = Math.max(1, Math.min(200, Number(args.pageSize) || Number(args.limit) || 50));
      const offset =
        args.page !== undefined && args.page !== null
          ? Math.max(0, (Math.max(1, Number(args.page) || 1) - 1) * limit)
          : Math.max(0, Number(args.offset) || 0);
      const columns = columnsOf(api.db, table);
      const total = countOf(api.db, table);
      const page = Math.floor(offset / limit) + 1;
      const rows =
        table === "vault_secret"
          ? api.db
              .prepare(
                "SELECT id, name, meta, ciphertext, created_at, updated_at, deleted_at, rev " +
                  "FROM vault_secret ORDER BY updated_at DESC LIMIT ? OFFSET ?",
              )
              .all(limit, offset)
          : api.db
              .prepare("SELECT * FROM " + table + " ORDER BY updated_at DESC LIMIT ? OFFSET ?")
              .all(limit, offset);
      return {
        table,
        columns,
        // 密文列不论哪条路径都掩码：浏览页永远不展示明文。
        rows: rows.map((row) => (Object.prototype.hasOwnProperty.call(row, "ciphertext") ? { ...row, ciphertext: "***" } : row)),
        page,
        pageSize: limit,
        pages: Math.max(1, Math.ceil(total / limit)),
        total,
        limit,
        offset,
      };
    },
  });
}
