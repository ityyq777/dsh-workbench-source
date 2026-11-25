/**
 * wb-addon-vault：独立凭据保险箱域。
 * 明文只在 UI reveal 或 plugin lease 时短暂出现；agent 永远拿不到。
 * 0.3.0：集合层（分组 ⊃ 集合 ⊃ 凭据）+ 七种通用凭据类型；密文与口令包裹上云，使用记录留本机。
 * 0.3.1：凭据表单明文支持小眼睛临时显示；主口令/删除确认改用应用内弹层（桌面端不支持 window.prompt）。
 * 0.3.3：备注两栏合并为单个「备注」（meta.note）；新建分组改弹窗并可直接勾选集合。
 * 0.3.4：集合选择改用共享 filter-checklist（关键字搜索 + 滚动分页），任务/站点/储物标签筛选同步复用。
 * 0.3.6：口令输入框统一用共享的明文切换控件（lib/secret-field.cjs），初始化页主/确认口令、解锁页与口令弹层都能点小眼睛看明文，各自独立切换。
 * 0.3.5：修复「保存凭据后列表不新增」——客户端 unwrap 对 ok:false 抛错、锁定态在凭据页提示并可内联解锁、写成功后无条件刷新列表。
 * 0.5.0：集合账号也加密——vault_set.account 改成 DEK 加密的 `va1:` 密文（AAD 绑定集合 id），本地库、同步与备份里都不再有登录名明文；锁定态读不到账号，写入账号需先解锁；schema_version 4 → 5 在解锁后迁移。
 * 0.6.0：账号本身也是一种凭据（kind=account），类型从 vault_secret.kind 单列拆到 vault_secret_kind 关联表，一条凭据可同时有多种类型；集合不再区分账号/普通，存量集合账号在解锁后转成 kind=account 的凭据；AAD 只绑 id 与名称，改类型不再重加密。
 * 0.6.1：标签页「集合与账号」改名「集合」；「集合」与「数据」页在锁定态整页让位（只留锁定提示卡，不渲染集合/凭据/表清单，也不发起列表与取数请求）。
 * 0.7.0：主口令成为唯一解锁因子——device key 与 A/B/C 解锁模式下线；header 增 passphrase_fp 指纹，
 *        便于各设备核对是否同一个主口令；schema_version 7（vault_device 去掉 device key 与模式列）。
 */
import { ensureSchema, bindClock } from "./db/db.js";
import { createRequire } from "node:module";

// 版本号只认 package.json：首页插件卡读的就是这里注册的 version。
const ADDON_VERSION = createRequire(import.meta.url)("../package.json").version;
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
    description: "集中保存密码、授权码与 token；按分组授权给业务模块，加密落库、密文可同步。",
    version: ADDON_VERSION,
    // 更新来源：宿主「插件」页按它查新版本并安装（只认官方 npm registry）。
    update: { source: "npm", package: "dsh-workbench-vault" },
    category: "assets",
    // 表声明：名字之外还给出中文名与掩码列。宿主统一「数据」页按这份声明只读浏览，
    // 密文列一律在输出层打码（掩码口径只此一处，不再有插件侧的 dataQuery）。
    tables: [
      {
        name: "vault_header",
        label: "保险箱头",
        desc: "主口令指纹、盐值与包裹的密钥",
        sort: "id",
        columns: [
          { name: "salt", label: "盐值", mask: true },
          { name: "wrapped_dek", label: "包裹的密钥", mask: true },
          { name: "passphrase_fp", label: "主口令指纹" },
        ],
      },
      "vault_device",
      "vault_group",
      {
        name: "vault_secret",
        label: "凭据",
        desc: "名称、元信息与加密后的密文",
        sort: "created_at",
        columns: [
          { name: "name", label: "名称" },
          { name: "ciphertext", label: "密文", mask: true },
          { name: "meta", label: "元信息" },
        ],
      },
      "vault_set",
      "vault_secret_kind",
      "vault_group_set",
      "vault_set_secret",
      "vault_binding",
      "vault_subject_type",
      "vault_secret_usage",
    ],
    // 事件授权清单：解锁成功后通知订阅方（邮件插件据此立刻同步一轮）。
    events: {
      publishes: [
        { type: "vault.unlocked", description: "保险箱解锁成功：只需知道「刚解开」的插件订阅它，载荷带 at 时间戳" },
      ],
    },
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
        { name: "vault_set", mode: "row", uniqueKeys: [["id"], ["name"]], uniquePolicy: "lww-tombstone" },
        {
          name: "vault_secret_kind",
          mode: "row",
          uniqueKeys: [["id"], ["secret_id", "kind"]],
          uniquePolicy: "lww-tombstone",
        },
        {
          name: "vault_group_set",
          mode: "row",
          uniqueKeys: [["id"], ["group_id", "set_id"]],
          uniquePolicy: "lww-tombstone",
        },
        {
          name: "vault_set_secret",
          mode: "row",
          uniqueKeys: [["id"], ["set_id", "secret_id"]],
          uniquePolicy: "lww-tombstone",
        },
      ],
    },
    // 贡献声明：保险箱往「条目操作」插槽里挂「凭据分组」（见 client/views/slot-bind-site-groups.cjs）。
    // 站点用 slotHosts 提供落点；站点没装时 capabilities 会写「暂无落点」，不会静默不显示。
    slots: ["item.actions"],
    views: [
      { id: "status", title: "保险箱", icon: "shield" },
      { id: "secrets", title: "凭据", icon: "key" },
      { id: "sets", title: "集合", icon: "layers" },
      { id: "groups", title: "分组与关联", icon: "folder" },
      { id: "config", title: "设置", icon: "sliders" },
      { id: "actions", title: "Action 清单", icon: "list" },
    ],
    capability: {
      summary:
        "保存连接器/站点需要的密码、手机号、证件号与 token；分组挂集合，集合只装凭据，账号本身也是一条凭据（kind=account），一条凭据可同时有多种类型，明文只向 UI 或 plugin 租约暴露。",
      records: [
        {
          kind: "set",
          table: "vault_set",
          title: "集合",
          description:
            "凭据容器，一个集合能挂到多个分组，也能装多条凭据，删除只断关联；不再区分账号/普通集合，账号作为 kind=account 的凭据放入集合。",
          when: ["同一个业务账号要复用多条凭据", "一份凭据要给多个分组使用"],
          primaryAction: "vault.setList",
        },
        {
          kind: "secret",
          table: "vault_secret",
          title: "凭据",
          description: "一条加密凭据（密码/账号/手机号/证件号/token），可同时有多个类型，可加入多个集合，列表只显示名称、类型与备注。",
          when: ["需要保存邮箱密码或授权码", "连接器要绑定一个 token", "想在 agent 面前隐藏明文"],
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
        {
          name: "kinds",
          type: "string[]",
          description: "凭据类型，至少一个，可多选：password/account/phone/id_card/token/app_password/api_key/other（account=账号/登录名）",
        },
        { name: "groupId", type: "string", description: "所属分组，可空；写入时自动挂到该组的默认集合" },
        { name: "setId", type: "string", description: "直接指定所属集合，优先于 groupId" },
        { name: "meta", type: "object", description: "非敏感备注（用户名、URL、过期提醒）" },
      ],
      notFor: ["浏览器密码自动填充", "跨设备同步明文", "给 agent 读取明文"],
      notes: [
        "主口令是保险箱唯一的解锁因子：口令本身不落库、不上云，上云的只是用它包裹后的 DEK；所有设备都必须输入同一个主口令，指纹（passphraseHint）可用来核对。",
        "vault_header/vault_secret/vault_group/vault_set/vault_group_set/vault_set_secret/vault_binding/vault_subject_type 随云同步；last_used_at 与空闲超时只留本机。",
        "同步上去的是 KDF 参数与密文，云端没有口令也解不开；换机重新输入同一个主口令即可解锁。",
        "备份仍不导出密文，换机靠同步或重新录入。",
        "旧版分组的直属凭据在首次解锁时迁移进「<组名> · 默认」集合；站点专属类型收口为通用类型。",
        "0.5.0 起集合账号曾用 DEK 加密在 vault_set.account；0.6.0 起该列取消，存量账号在解锁后转成 kind=account 的凭据。",
        "0.6.0 起类型存在 vault_secret_kind 关联表，一条凭据可多类型；AAD 只绑 id 与名称，改类型/归属不重加密，改名称才重加密；schema_version 升到 6 时在解锁后自动迁移，两端插件都升到 0.6.0 才能正确读写。",
        "0.6.1 起界面上标签页只叫「集合」；「集合」与「数据」页在保险箱未解锁时不显示任何集合、凭据或表数据，只显示锁定提示卡。",
        "0.7.0 起只用主口令解锁（不再有 device key 与自动解锁模式）；忘记主口令无法恢复，只能重新录入凭据；各设备的主口令必须一致，状态页显示的 8 位指纹可用来核对。",
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
        execute: () => ({ shellVersion: api.shellVersion || "", domains: [{ id: "wb-addon-vault", version: (api.addon && api.addon.version) || "0.3.6" }], actions: schemas }),
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
