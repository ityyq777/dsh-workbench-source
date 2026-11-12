/**
 * 保险箱 action 契约：所有写操作按 origin 门禁，agent 永远拿不到明文。
 */
const KINDS = ["password", "token", "app_password", "api_key", "other"];

function only(ctx, allowed, action) {
  const origin = ctx && ctx.origin ? ctx.origin : "agent";
  if (!allowed.includes(origin)) throw new Error(action + " 不允许 " + origin + " 调用");
}

export function registerVaultActions(api, vault) {
  api.action("vault.status", {
    description: "只读：保险箱是否初始化、是否锁定、解锁模式与凭据数量；不含任何密文。",
    input: { type: "object", properties: {}, additionalProperties: false },
    execute: (_args, ctx) => {
      only(ctx, ["ui", "agent"], "vault.status");
      return vault.status();
    },
  });

  api.action("vault.setup", {
    description: "首次初始化保险箱：设置口令与解锁模式 A/B/C，默认 A（每次启动锁定）。",
    input: {
      type: "object",
      properties: {
        passphrase: { type: "string", description: "主口令，至少 10 个字符" },
        mode: { type: "string", enum: ["A", "B", "C"], description: "解锁模式，默认 A" },
      },
      required: ["passphrase"],
      additionalProperties: false,
    },
    examples: [{ passphrase: "correct horse battery", mode: "A" }],
    execute: (args, ctx) => {
      only(ctx, ["ui"], "vault.setup");
      return vault.setup(args);
    },
  });

  api.action("vault.unlock", {
    description: "用主口令解锁保险箱；连续 5 次失败锁定 5 分钟。",
    input: {
      type: "object",
      properties: { passphrase: { type: "string", description: "主口令" } },
      required: ["passphrase"],
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["ui"], "vault.unlock");
      return vault.unlock(args);
    },
  });

  api.action("vault.lock", {
    description: "立即清除内存中的 DEK；插件后台可用它主动锁定。",
    input: { type: "object", properties: {}, additionalProperties: false },
    execute: (_args, ctx) => {
      only(ctx, ["ui", "plugin"], "vault.lock");
      vault.lock();
      return { ok: true };
    },
  });

  api.action("vault.setUnlockMode", {
    description: "切换解锁模式：A 全锁 / B 自动解锁但查看需口令 / C 自动解锁且查看免口令。",
    input: {
      type: "object",
      properties: {
        mode: { type: "string", enum: ["A", "B", "C"] },
        passphrase: { type: "string", description: "锁定状态下切换 B/C 需要主口令" },
      },
      required: ["mode"],
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["ui"], "vault.setUnlockMode");
      return vault.setUnlockMode(args);
    },
  });

  api.action("vault.changePassphrase", {
    description: "修改主口令：只重包 DEK，不重新加密所有 secret。",
    input: {
      type: "object",
      properties: {
        oldPassphrase: { type: "string" },
        newPassphrase: { type: "string", description: "至少 10 个字符" },
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
    description: "只读：列出凭据名称/类型/备注/最近使用时间，永远不含明文。",
    input: {
      type: "object",
      properties: {
        q: { type: "string", description: "按名称或备注模糊搜索" },
        kind: { type: "string", enum: KINDS },
      },
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["ui", "agent"], "vault.secretList");
      return vault.listSecrets(args);
    },
  });

  api.action("vault.secretCreate", {
    description: "新增凭据；secret 只在内存加密后落库，审计中该字段显示为 ***。",
    input: {
      type: "object",
      properties: {
        name: { type: "string", description: "唯一名称，1–80 字" },
        kind: { type: "string", enum: KINDS },
        secret: { type: "string", description: "明文密码/token，不会落审计" },
        meta: { type: "object", description: "非敏感备注：用户名、URL、过期提醒" },
      },
      required: ["name", "kind", "secret"],
      additionalProperties: false,
    },
    examples: [{ name: "sspai-basic", kind: "password", secret: "app-password", meta: { username: "me" } }],
    execute: (args, ctx) => {
      only(ctx, ["ui"], "vault.secretCreate");
      return vault.createSecret(args);
    },
  });

  api.action("vault.secretUpdate", {
    description: "更新名称/类型/备注或轮换明文；改名称或类型会重加密。",
    input: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        kind: { type: "string", enum: KINDS },
        secret: { type: "string", description: "留空表示不轮换" },
        meta: { type: "object" },
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

  api.action("vault.secretReveal", {
    description: "在界面上显示一条凭据明文；B 模式必须再输口令，agent/plugin 一律拒绝。",
    input: {
      type: "object",
      properties: {
        id: { type: "string" },
        passphrase: { type: "string", description: "B 模式必需" },
      },
      required: ["id"],
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["ui"], "vault.secretReveal");
      return vault.reveal(args);
    },
  });

  api.action("vault.lease", {
    description: "后台插件租用凭据明文，ttl 30–300 秒；只允许 plugin origin，agent/ui 不可调用。",
    input: {
      type: "object",
      properties: {
        id: { type: "string" },
        purpose: { type: "string", description: "用途，写入审计" },
        ttlSeconds: { type: "number", description: "30–300，默认 60" },
      },
      required: ["id"],
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["plugin"], "vault.lease");
      return vault.lease(args);
    },
  });

  api.action("vault.rotateDeviceKey", {
    description: "重写自动解锁的 device key 包裹；B/C 模式可用，需要主口令。",
    input: {
      type: "object",
      properties: { passphrase: { type: "string" } },
      required: ["passphrase"],
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["ui"], "vault.rotateDeviceKey");
      return vault.rotateDeviceKey(args);
    },
  });

  api.action("vault.dataTables", {
    description: "只读：数据页表清单。",
    input: { type: "object", properties: {}, additionalProperties: false },
    execute: (_args, ctx) => {
      only(ctx, ["ui"], "vault.dataTables");
      return {
        tables: [
          {
            name: "vault_secret",
            columns: ["id", "name", "kind", "meta", "ciphertext", "created_at", "updated_at", "last_used_at"],
          },
          { name: "vault_meta", columns: ["key", "value", "updated_at"] },
        ],
      };
    },
  });

  api.action("vault.dataQuery", {
    description: "只读：数据页查询；密文列与 KDF/包裹值一律掩码。",
    input: {
      type: "object",
      properties: {
        table: { type: "string", enum: ["vault_secret", "vault_meta"] },
        limit: { type: "number", description: "默认 50，上限 200" },
        offset: { type: "number", description: "默认 0" },
      },
      required: ["table"],
      additionalProperties: false,
    },
    execute: (args, ctx) => {
      only(ctx, ["ui"], "vault.dataQuery");
      const table = String(args.table);
      const limit = Math.max(1, Math.min(200, Number(args.limit) || 50));
      const offset = Math.max(0, Number(args.offset) || 0);
      if (table === "vault_meta") {
        const rows = api.db.prepare("SELECT key, value, updated_at FROM vault_meta ORDER BY key LIMIT ? OFFSET ?").all(limit, offset);
        return {
          table,
          rows: rows.map((row) => ({
            ...row,
            value: /^(salt|wrapped_dek|wrapped_dek_device|kdf)$/.test(row.key) ? "***" : row.value,
          })),
          limit,
          offset,
        };
      }
      const rows = api.db
        .prepare(
          "SELECT id, name, kind, meta, ciphertext, created_at, updated_at, last_used_at, deleted_at " +
            "FROM vault_secret ORDER BY updated_at DESC LIMIT ? OFFSET ?",
        )
        .all(limit, offset);
      return {
        table,
        rows: rows.map((row) => ({ ...row, ciphertext: "***" })),
        limit,
        offset,
      };
    },
  });
}
