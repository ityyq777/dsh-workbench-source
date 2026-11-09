# 站点账号（site_account / site_account_external）· v2 归档客户端事实盘点

> 用途：供 `docs/specs/_draft/site-phase2-outline.md`（站点模块迁移二期设计）取证。
> 范围：只读盘点 `_archive/sheepone_v2/client/` 与 `_archive/sheepone_v2/*.md`，并对照 DSH 一期站点插件 `packages/addons/sites/`。
> 采集方式：直接阅读源码 + grep 调用点；未运行 App，未连接真实数据库。
> 路径简称：下文 `client/` = `_archive/sheepone_v2/client/`，`方案/历史` = `_archive/sheepone_v2/重构方案.md` / `_archive/sheepone_v2/重构历史.md`。

## 0. 结论摘要（10 条）

1. 账号域在 v2 是**完整落地**的：5 张表全部存在，账号有 Repository / Service / 4 步向导第 3 步 / 只读 Modal / 移动端入口。不是死代码。
2. 一个站点 ↔ 多个账号（`site_account.site_id` 一对多）；**账号只挂在站点上**，与目录、标签、链接三者都没有直接外键关系。
3. `site_account.key` 是业务唯一标识（必填、同站点唯一），`account` 只是登录名（可空），二者不是同一概念（`client/lib/data/models/site/site_models.dart:71-104`）。
4. 敏感字段 `password / phone_number / identity_card` **全链路明文**，v2 是刻意决策而非遗漏（`client/lib/data/repositories/site_account_repository.dart:13`、`方案:2634-2654`、`历史:743`）。
5. 同步口径：`site` / `site_account` / `site_account_external` / `site_node_mapping` 为 **A 类行级同步**，`site_node` 为 **B 类整表覆盖**（`方案:2671`、`方案:2753`、`方案:2767`）。即明文密码会随行级增量上行云端。
6. 云端 `cloud/` 侧**没有任何站点专表**，只有通用 `change_log.payload` / `row_states.payload`（jsonb）；因此"上行即明文 JSON"可确认（`cloud/src/main/resources/db/migration/V1__cloud.sql:35-60`）。
7. 删站语义：存在未删账号时**阻止删站**并提示"请先删除其账号"（v2 修订了旧系统"删站不级联删账号"的缺陷）。
8. 关闭 `bindable` 有前置校验：本站账号被其他站点外联引用时禁止关闭。
9. 实锤 UI 缺陷：账号卡密码行**声称打码、实际渲染明文**（`client/lib/ui/site/site_account_views.dart:264-299`），与 `历史:781` 的"密码圆点掩码"验收描述不符。
10. 一期 DSH 站点插件零账号概念：`packages/addons/sites/lib/` 全库 grep `account` 命中 0 行，DDL 只有 `site` / `site_node` / `site_node_mapping`。账号之外，v2 的其余站点业务 DSH 基本都已覆盖（差异见 §6）。

## 1. 表结构（drift，v2 归档客户端）

### 1.1 公共基础列

`client/lib/data/database/tables/base_columns.dart:18-33`，所有业务表继承：

| 列 | 类型 | 可空 | 默认 | 语义（注释原文） | 定义位置 |
| --- | --- | --- | --- | --- | --- |
| `id` | TEXT | 否 | — | 主键（格式 `${device_id}-${timestamp}-${seq}`） | `base_columns.dart:20` |
| `is_deleted` | INTEGER | 否 | `0` | 软删标记：0=正常 1=已删除 | `base_columns.dart:23` |
| `update_time` | INTEGER | 否 | 无 | 更新时间（毫秒，服务端时钟校准后） | `base_columns.dart:26` |
| `create_time` | INTEGER | 否 | 无 | 创建时间（毫秒） | `base_columns.dart:29` |

`primaryKey => {id}`（`base_columns.dart:31-32`）。注意 `create_time/update_time` **无默认值且非空**，插入必须显式赋值；drift 侧该表无任何二级索引或唯一约束声明。

### 1.2 `site` — A 类表（行级同步）

`client/lib/data/database/tables/business/site_table.dart:1-16`

| 列 | 类型 | 可空 | 默认 | 语义 | 行号 |
| --- | --- | --- | --- | --- | --- |
| `site_name` | TEXT | 否 | 无 | 站点名（旧库默认 `'未命名'`，见 `方案:2634-2654`） | `:11` |
| `description` | TEXT | 是 | — | 一句话描述 | `:12` |
| `bindable` | INTEGER | 否 | `1` | `0=否 1=是`；可被外联（本站账号可被其他站点账号引用） | `:13` |
| `site_link` | TEXT | 是 | — | JSON 数组，元素 `{link, description, isDefault}` | `:14` |

- 类注解原文：`/// A类表：site — 站点`（`:4`），`tableName => 'site'`（`:8`）。
- `site_link` 的解析/序列化唯一出口：`client/lib/data/models/site/site_models.dart:45-55`（`parseSiteLinks` 坏数据静默降级为空列表；`encodeSiteLinks` 走 `JsonUtils.encode`）。
- `isDefault` 单默认约束由 **UI 层**维护（`site_models.dart:22-23` 注释："至多一个 true，UI 层维护互斥"）。

### 1.3 `site_node` — B 类表（整表覆盖同步）

`client/lib/data/database/tables/business/site_node_table.dart:1-13`

| 列 | 类型 | 可空 | 默认 | 语义 | 行号 |
| --- | --- | --- | --- | --- | --- |
| `name` | TEXT | 否 | 无 | 节点名 | `:7` |
| `parent_id` | TEXT | 否 | `'0'` | 父节点 id，`'0'` = 虚拟根（不落库） | `:8` |
| `path` | TEXT | 否 | `''` | 物化路径 `//rootId/parentId/selfId/`（注释为 `/rootId/parentId/selfId/`） | `:9` |
| `sort` | INTEGER | 否 | `0` | 同级排序 | `:10` |
| `depth` | INTEGER | 否 | `0` | 深度 | `:11` |

- 类注解原文：`/// B类表：site_node — 站点树节点（整表覆盖同步）`（`:4`）。
- **无** `tableName` override（drift 默认表名即 `site_node`）。
- **无独立 Repository**：由 `client/lib/data/services/tree_service.dart` 以 `tableName` 参数化复用，与 `task_node` 共用同一套建树/移动/删除逻辑（`历史:748`）。

### 1.4 `site_node_mapping` — A 类表

`client/lib/data/database/tables/business/site_node_mapping_table.dart:1-10`

| 列 | 类型 | 可空 | 默认 | 语义 | 行号 |
| --- | --- | --- | --- | --- | --- |
| `site_id` | TEXT | 否 | 无 | 关联 `site.id` | `:7` |
| `node_id` | TEXT | 否 | 无 | 关联 `site_node.id` | `:8` |

无唯一索引；一对多关系允许"一个站点关联多个目录"，重复行由 `flushMappings` 的 diff 逻辑规避（`client/lib/data/repositories/site_node_mapping_repository.dart:8-13`）。

### 1.5 `site_account` — A 类表

`client/lib/data/database/tables/business/site_account_table.dart:1-19`

| 列 | 类型 | 可空 | 默认 | 语义 | 行号 |
| --- | --- | --- | --- | --- | --- |
| `account` | TEXT | **是** | — | 帐号/登录名 | `:11` |
| `password` | TEXT | **是** | — | 密码（**明文**） | `:12` |
| `phone_number` | TEXT | **是** | — | 手机号（**明文**） | `:13` |
| `identity_card` | TEXT | **是** | — | 身份证（**明文**） | `:14` |
| `key` | TEXT | **是** | — | 业务唯一标识（**库层可空，应用层强制非空**） | `:15` |
| `remark` | TEXT | **是** | — | 备注 | `:16` |
| `site_id` | TEXT | 否 | 无 | 关联 `site.id` | `:17` |

要点（易被设计草案误写，务必按此修正）：
- 除 `site_id` 外**全部列可空**。`docs/specs/_draft/site-phase2-outline.md` 中草案写成 `NOT NULL DEFAULT ''` 是对 v2 的**语义变更**，需在正式设计里显式说明（v2 用 NULL 表示"未填写"，见 `client/lib/data/services/site_service.dart:542-545` 的 `_blankToNull`："保持列语义：未填写存 NULL"）。
- 列名是 `key`（SQLite 关键字，drift 生成时以 quoted 形式处理），不是 `account_key`；草案里的 `account_key` 属于新设计命名。
- **无唯一约束**（表文件无 `@TableIndex`/`uniqueKeys`）；`(site_id, key)` 唯一性只在应用层保证：`SiteService._validateForm` + `SiteAccountRepository.isKeyUnique`（`site_account_repository.dart:128-144`）。
- **无外键约束**，`site_id` 仅语义关联。

### 1.6 `site_account_external` — A 类表

`client/lib/data/database/tables/business/site_account_external_table.dart:1-10`

| 列 | 类型 | 可空 | 默认 | 语义 | 行号 |
| --- | --- | --- | --- | --- | --- |
| `native_account_id` | TEXT | 否 | 无 | 关联 `site_account.id`（引用方） | `:7` |
| `external_account_id` | TEXT | 否 | 无 | 外部系统账号 ID —— **实际语义是"另一站点的一条 `site_account.id`"** | `:8` |

- 注释写"外部系统账号ID"，但实现里 external 也是本地 `site_account.id`（`client/lib/data/services/site_service.dart:495-539` 的 `_assembleAccounts` 用 `accountRepo.getByIds` 回查即证）。迁移文档应改写这条注释，避免"外部系统"被误解为第三方 OAuth/IM 账号。
- 无唯一索引，重复关系由 `replaceForNative` 的全量替换规避。
- 旧系统该表是 INTEGER 自增外键，v2 转 TEXT id，"语义不变：本站账号引用其他站点账号"（`方案:2675-2677`）。

### 1.7 注册与生成物

- `client/lib/data/database/database.dart:40-45`：A 类表列表含 `Site`、`SiteAccount`、`SiteAccountExternal`、`SiteNodeMapping`；B 类列表含 `SiteNode`；文件内注释分别为"A类行级同步表（20张）"（`:40`）与"B类：树形（整表覆盖同步）"（`:28`）。
- 生成物 `client/lib/data/database/database.g.dart`：`$SiteTable`（`:1589`）、`SiteEntry`（`:1811`）、`$SiteAccountTable`（`:2114`，`static const String $name = 'site_account'` 在 `:2252`）、`SiteAccountEntry`（`:2399`）。生成物不手改。

## 2. 账号在 UI 上怎么呈现

### 2.1 入口（3 处，全部收敛到同一个只读 Modal）

| 入口 | 位置 | 形态 |
| --- | --- | --- |
| 桌面列表行操作 | `client/lib/ui/site/site_page.dart:232-262` | 5 枚图标按钮之一：`badge_outlined` → `_openAccounts` |
| 桌面 `_openAccounts` | `site_page.dart:299-308` | `showDialog` → `SiteAccountModal(site: item, onChanged: () {})`，关闭后 `_loadItems()` |
| 移动端详情抽屉 | `site_page.dart:878-903` → `client/lib/ui/site/site_mobile_views.dart` | `SiteMobileDetailSheet` 标题行右侧 `badge` 图标 → 同一个 `SiteAccountModal`；区块"账号"列出 `title=key`、`subtitle=account`、trailing `'↔ ${acc.externals.length}'`（`site_mobile_views.dart:267-284`） |

没有独立的"账号页"路由，也没有跨站点的账号总览。

### 2.2 `SiteAccountModal` —— 只读列表（`client/lib/ui/site/site_account_views.dart:15-149`）

- 组件类型：`AlertDialog`（不是页面，不是全屏 Sheet）。
- 标题：`'${t.site.account.modalTitle} · ${siteName}'` + 右侧账号计数徽标（`:92-118`）；`modalTitle` 中文文案 = "站点账号"（`client/lib/i18n/en_zh.i18n.json` 的 `site.account.modalTitle`）。
- 尺寸：固定 `width: 540, height: 440`（`:120-122`）——小屏会被挤压，是已知 UI 债。
- 数据源：`siteServiceProvider.getAccountList(site.site.id)`（`:41-49`）。
- 空态：`SiteEmptyState(icon: Icons.badge_outlined, message: "该站点暂无账号", hint: "在向导第 3 步中新增账号")`（`:126-130`）。
- 列表：`ListView.separated`，每项 `_AccountInfoCard`，间距 4（`:131-139`）。
- 底部动作：**只有"关闭"**（`:141-146`）—— 该 Modal **不能新增、不能编辑**，只能删除。新增/编辑必须走站点编辑向导第 3 步。

### 2.3 `_AccountInfoCard` —— 单账号只读卡（`site_account_views.dart:152-320`）

展示顺序（空字段自动收起，`:283` 的 `_fieldRow` 对空值返回 `SizedBox.shrink()`）：

| 顺序 | 内容 | 细节 |
| --- | --- | --- |
| 1 | 头像 | `CircleAvatar` 内为 `key[0].toUpperCase()`，key 为空时为 `·`（`:184-195`） |
| 2 | 标题 | `key` 本身（`fontWeight.w700`）（`:197-203`） |
| 3 | 删除 | `IconAction(Icons.delete_outline, color: error)`（`:204-209`） |
| 4 | 帐号 | `_fieldRow(account, copyable: true)` → 可选中 + 复制（`:214-215`） |
| 5 | 密码 | `_passwordRow`（见 §2.4） |
| 6 | 手机号 | `_fieldRow(phoneNumber)`，**不可复制**（`:217`） |
| 7 | 身份证 | `_fieldRow(identityCard)`，**不可复制**（`:218`） |
| 8 | 备注 | 非空时另起一行 `bodySmall`，不可复制（`:219-226`） |
| 9 | 外联 chips | `item.externals` 非空时：`Icons.call_merge` + 每个 `'${siteName} · ${accountKey}'` 的 `tertiaryContainer` 圆角块（`:228-256`） |

复制行为：`Clipboard.setData(ClipboardData(text: realValue ?? value))` + `SnackBar('已复制到剪贴板', 1200ms)`（`:301-315`）。

### 2.4 密码打码（**实现与声明不一致**）

- 声明：`/// 密码行：圆点掩码展示 + 复制（不将明文直接上屏）`（`site_account_views.dart:263`）。
- 实现：`_passwordRow` 以 `'•' * value.length.clamp(1, 14)` 作为 `value` 传入，同时传 `copyable: true, realValue: value`（`:264-273`）；而 `_fieldRow` 的渲染是 `SelectableText(realValue ?? value, ...)`（`:296-299`）。
- 结果：**密码行实际以明文 `SelectableText` 渲染**（`realValue` 覆盖了掩码串），可被直接选中/长按复制；掩码只在 `realValue == null` 时生效，而密码行永远传了 `realValue`。
- 附带：掩码串把密码长度泄露为 `min(len, 14)`（`:269`）。
- 迁移结论：**不能把 v2 的"打码"当作既有安全能力继承**；`历史:781` 记录的"密码圆点掩码 + 复制"验收描述与代码不符。新设计应显式规定：默认掩码、点击/长按才临时显形、复制走独立按钮。

### 2.5 编辑形态：站点 4 步向导第 3 步

`client/lib/ui/site/site_info_editor.dart`（707 行）：

- 步骤定义：1 基础信息 / 2 关联目录 / 3 关联账号 / 4 关联标签（类注解 `:14-25`）。
- 第 3 步 `_buildAccountsStep`（`:266-307`）：`SectionLabel("关联账号")` + 右上 `FilledButton.tonalIcon("新增账号")`（`:271-282`，每点一次 `_form.accounts.add(AccountFormData())`）；空态 `SiteEmptyState(message: "该站点暂无账号", hint: "点击「新增账号」创建一条")`；列表为 `SiteAccountEditCard`，`batchKeys: _batchKeys`、`excludeSiteId: _form.id`（`:294-301`）。
- `_batchKeys` = `{for (final a in _form.accounts) a.key.trim()}`（`:78`）—— 同批重去重集合。
- 单卡 `SiteAccountEditCard`（`site_account_views.dart:327-568`）字段与布局：
  1. `key` 输入框（`TextFormField`，`labelText: "标识（必填）"`，`errorText` = "标识必填且需在该站点内唯一"）+ 右侧删除按钮（`:404-433`）
  2. `account` / `password` 同一 Row（`password` 走 `obscureText: true`，`:449-457`）
  3. `phoneNumber` / `identityCard` 同一 Row，控件为 `Autocomplete<String>`（有候选可下拉，同时保留自由输入，`:539-566`）
  4. `remark`（`maxLines: 2`，`:490-498`）
  5. `SectionLabel("外联账号（引用其他站点）")` + `SiteExternalAccountPicker`（`:499-509`）
- 手机号/身份证候选来源：`masterInfoServiceProvider.getMasterInfo()`，取 `master.phones[].identityCard` 与 `master.identityCards[].cardNumber`（`:363-376`）。**注意此处疑似字段取反**：`_phoneOptions` 取的是 `phones` 元素的 `identityCard` 字段、`_identityOptions` 取的是 `identityCards` 元素的 `cardNumber`，命名与来源交叉（`:367-374`）。本盘点未读 `master_info_table.dart` 的列定义，故仅标注"疑似"，见 §9。
- 保存：`_save()`（`site_info_editor.dart:360-...`）统一交 `SiteService.createSite/updateSite`，校验异常以 `_error` 在 `errorContainer` 语义色展示（`:46`、`:361-370`）。

### 2.6 外联账号选择器

`SiteExternalAccountPicker`（`site_account_views.dart:572-733`）：

- 两级 `DropdownButtonFormField`：站点 → 账号；未选站点时不渲染第二级（`:678-705`）。
- 数据源：`siteService.getCascadeData(excludeSiteId: widget.excludeSiteId)`（`:604-613`）→ 只含 `bindable = 1` 且 `(key ?? '').trim().isNotEmpty()` 的账号（`site_service.dart:205-228`）。
- 选中即追加为 `Chip`（`'${siteName} · ${accountKey}'`），chip 可删（`:710-730`）；按 `option.id` 去重（`:618`）。
- 历史修复：第二级 Dropdown 残留旧值触发框架断言崩溃，修法为两级都加 `ValueKey`（`ValueKey('external-site-${excludeSiteId}')` / `ValueKey('external-account-${_pickedSiteId}')`，`:660`、`:681`；背景见 `历史:807-817`）。

## 3. 敏感字段：明文、同步与标注

### 3.1 明文的证据链

| 证据 | 位置 | 原文 |
| --- | --- | --- |
| 表定义无加密/哈希 | `client/lib/data/database/tables/business/site_account_table.dart:11-16` | 6 个 TEXT 列直接落盘每字段 |
| Repository 注释明示沿用明文 | `client/lib/data/repositories/site_account_repository.dart:13` | `/// 敏感字段（password/phoneNumber/identityCard）沿用旧系统明文口径（方案 10.5.2）。` |
| 旧系统分析结论 | `方案:2634-2654` | `account/password/phone_number/identity_card/remark` **全链路明文，无加密** |
| 用户确认的决策 | `历史:743` | "账号敏感字段（密码/手机号/身份证）沿用旧系统明文口径" |
| 无任何加密依赖参与该域 | 全 `client/lib/data/**` grep 无对该三列的 encrypt/hash 调用 | `flutter_secure_storage` 仅用于登录 token（`历史:76`、`方案:545`） |

即：v2 的密码是**刻意的明文设计**，不是未实现的 TODO。安全性完全依赖"本地 SQLite 文件不外泄"。

### 3.2 同步标注（A 类 / B 类）

| 表 | 类别 | 同步方式 | 标注出处 |
| --- | --- | --- | --- |
| `site` | A 类 | 行级增量（`update_time` 比对） | `site_table.dart:4`、`方案:400`、`方案:2671`、`方案:2767` |
| `site_account` | A 类 | 同上 | `site_account_table.dart:4`、`site_service.dart` 域注释、`方案:2753` |
| `site_account_external` | A 类 | 同上 | `site_account_external_table.dart:4`、`方案:2753` |
| `site_node_mapping` | A 类 | 同上 | `site_node_mapping_table.dart:4`、`方案:2753` |
| `site_node` | **B 类** | 整表覆盖（树形，有全局顺序依赖） | `site_node_table.dart:4`、`方案:425`、`方案:2753` |

- A/B 类的规范定义：`方案:400`（A 类：行级同步表，20 张，无顺序依赖，逐行独立比对）/ `方案:425`（B 类：树形全量覆盖表，2 张 = `task_node` + `site_node`）；范式 DDL 见 `方案:439-494`；算法见 `方案:1919-1968`。
- 客户端实现标注：`database.dart:7`（"业务表（A类：行级同步）"）、`:28`（"B类：树形（整表覆盖同步）"）、`:40`（"A类行级同步表（20张）"）。
- 每个写方法后 `await db.markPending(DbTables.siteAccount, id)` 进入待同步队列（`site_account_repository.dart` 各写方法；同构见 `site_repository.dart:8-11` 注释）。
- 上行后云端落点：`cloud/src/main/resources/db/migration/V1__cloud.sql:35-49`（`change_log.payload jsonb`）、`:51-60`（`row_states.payload jsonb NOT NULL`）。
- **迁移影响**：按 v2 口径，`site_account.password` 的明文会被写进 `change_log.payload` / `row_states.payload` 并长期驻留云端备份。这直接决定二期必须在"是否同步账号表"上先拍板（草案 §3 A/B/C 三方案），且若选 B 方案，加密必须发生在**写本地库之前**（否则 `row_states` 已存明文）。

### 3.3 数据库文件本身的保护（与账号字段相关的旁证）

`方案:1051-1055` 记载各平台"DPAPI / Keychain / Keystore / Web Crypto API 加密"——但该表述面向**登录 token**（`方案:545`："若 token 明文落库，任何人拿到该文件即可冒充用户"）。业务表（含账号密码）不在其保护范围。

## 4. 业务规则与边界（从 UI + Service 代码读出）

| # | 规则 | 证据 |
| --- | --- | --- |
| 1 | 站点名必填，空则 `'站点名称不能为空'` | `site_service.dart:326-356`；UI `site_info_editor.dart:109-118` |
| 2 | 站点至少关联 1 个目录，否则 `'至少关联一个目录'` | `site_service.dart:326-356`；第 2 步空态 `site_info_editor.dart:232-236` |
| 3 | 账号 `key` 必填，空则 `'账号标识（key）不能为空'` | `site_service.dart:326-356`；UI 即时标红 `site_account_views.dart:378-383`、`:415` |
| 4 | 同批提交内 `key` 重复 → `'同批次内账号标识重复：$key'` | `site_service.dart`（`seen.add` 失败）；UI 预检 `site_account_views.dart:381-383` |
| 5 | 库内同站点 `key` 重复 → `'该站点已存在相同标识的账号：${key}'`，取自 `isKeyUnique`（排除自身 id） | `site_service.dart:326-356`、`site_account_repository.dart:128-144` |
| 6 | 密码/帐号/手机/身份证/备注**均可空**，不做格式校验（手机/身份证可自由输入） | 表定义 `site_account_table.dart:11-16`；`_blankToNull` `site_service.dart:542-545`；`Autocomplete` 保留自由输入 `site_account_views.dart:545-566` |
| 7 | **删站前必须清账号**：`hasActiveAccounts` 为真则抛 `SiteHasAccountsException`，UI 提示"无法删除：该站点仍存在账号，请先删除其账号" | `site_service.dart:117-130`、`:549-551`；`site_page.dart:277-296`；i18n `site.delete.blocked` |
| 8 | 删账号 = 双向清外联 + 软删账号，同一事务 | `site_service.dart:193-198`（`externalRepo.deleteRelationsOfAccount` + `accountRepo.softDeleteAccount`） |
| 9 | 外联关系按 native 账号"全量替换"（缺的建、多的软删），保证关系行 id 稳定 | `site_account_external_repository.dart:52-89` |
| 10 | 关闭 `bindable` 前置校验：本站账号被任何外联引用即阻止，提示"该站点的账号正被外联账号引用，请先解除外联关系" | `site_info_editor.dart:84-100`；`site_service.dart:200-202`；`site_account_repository.dart:146-161`；i18n `site.base.bindableBlocked` |
| 11 | 外联选择器**排除自身站点**（不允许同站点账号互引） | `site_info_editor.dart:297`（`excludeSiteId: _form.id`）、`site_account_views.dart:604-613` |
| 12 | 只有 `bindable = 1` 且 `key` 非空的账号能被外联选中 | `site_service.dart:205-228` |
| 13 | 账号编辑不允许换站点（`siteId` 不可变） | `site_account_repository.dart:53` 注释 |
| 14 | 账号列表排序固定为 `create_time` 升序 | `site_account_repository.dart:87-93` |
| 15 | 编辑站点的账号集合按 diff 同步：库里有请求没有 → 清外联 + 软删；带 id → 更新；不带 id → 新增 | `site_service.dart:384-426` |
| 16 | 账号与目录/标签/链接**无直接关系**：账号只挂 `site_id`；链接是 site 级 JSON；标签走 `tag_mapping(item_type='site')`；目录走 `site_node_mapping` | 表定义 + `site_service.dart` 编排 |
| 17 | 目录节点删除只软删子树 + 清 `site_node_mapping`，**不动账号** | `site_service.dart:258-270` |
| 18 | 账号不参与站点列表的搜索/过滤/排序（`SiteItem.accounts` 只用于展示与 Modal 数据） | `site_service.dart:137-172`、`:429-492` |

遗留缺陷（v2 已知、迁移时不必复刻）：

- 密码打码失效（§2.4）。
- `master_info` 手机号/身份证候选来源字段疑似交叉取错（§2.5）。
- `SiteAccountModal` 固定 540×440，移动端可用性差。
- 账号卡手机号/身份证/备注无复制按钮（只有帐号与密码可复制）。
- 无"账号"列表分页/搜索；账号多时只能滚动。

## 5. 数据模型在领域层的形状（供设计文档复用）

| 模型 | 字段 | 位置 |
| --- | --- | --- |
| `AccountFormData` | `String? id`（null=新建）、`String key=''`、`account/password/phoneNumber/identityCard/remark`（可空）、`List<String> externalAccountIds`、`List<ExternalAccountDisplay> externalAccountDisplay` | `client/lib/data/models/site/site_models.dart:71-104` |
| `ExternalAccountDisplay` | `id`（= 被引用账号的 `site_account.id`）、`siteName`、`accountKey` | `site_models.dart:58-68` |
| `SiteAccountItem` | `SiteAccountEntry entry` + `List<ExternalAccountDisplay> externals` | `site_models.dart:159-164` |
| `SiteItem` | `site` + `tags` + `dirs` + `accounts`；`defaultLink` getter | `site_models.dart:167-188` |
| `SiteAccountCascadeGroup` | `siteId`、`siteName`、`List<SiteAccountCascadeOption> accounts` | `site_models.dart:200-210` |
| `SiteAccountCascadeOption` | `id`、`accountKey` | `site_models.dart:213-218` |

服务层用例（`client/lib/data/services/site_service.dart`）：

| 用例 | 行号 | 说明 |
| --- | --- | --- |
| `createSite` | `:56-83` | 校验 → 单事务：建 site / flush 目录映射 / flush 标签映射(`item_type='site'`) / `_upsertAccounts` |
| `updateSite` | `:86-114` | 同上 + `_syncAccounts` |
| `deleteSite` | `:117-130` | 账号守卫 → 软删 site + 清映射 |
| `getSiteList` | `:137-172` | 目录子树 / 标签 / 文本过滤 + 排序（默认 `updateTime desc`） |
| `getAccountList` | `:187-190` | `listBySite` + `_assembleAccounts` |
| `deleteAccount` | `:193-198` | 事务内双向清外联 + 软删 |
| `isSiteExternallyBinded` | `:201-202` | 透传 repo |
| `getCascadeData` | `:205-228` | `bindable=1` 站点 → key 非空账号 |
| `_validateForm` | `:326-356` | 6 条校验（见 §4 #1-#5） |
| `_syncAccounts` | `:388-426` | diff 同步 |
| `_assembleAccounts` | `:495-539` | 外联反查 + 站点名回填 |

Provider 注册：`client/lib/ui/providers/app_providers.dart:71-78`（`siteAccountRepositoryProvider`、`siteAccountExternalRepositoryProvider`）、`:96-97`（注入 `SiteService` 构造，`accountRepo` / `externalRepo`）。

## 6. v2 站点业务 ↔ DSH 一期站点插件（`packages/addons/sites/`）差异

### 6.1 一期已覆盖（无缺口）

| v2 能力 | DSH 对应物 |
| --- | --- |
| `site` 表 4 个业务列 | `site` DDL：`site_name / description / bindable / site_link`（`packages/addons/sites/lib/db/db.js:13-28`） |
| `site_link` JSON + 单默认约束 | `parseLinks/encodeLinks`（`db.js:180-212`，`:206-209` 强制至多一个 `isDefault`）+ `defaultLinkOf`（`db.js:214-221`，无默认标记时兜底取第一条有效链接） |
| `site_node` 树 | `site_node` DDL + `siteNodes.tree/children/multipleChildren/pathChildren/path/create/rename/move/delete`（`lib/tree.js:301-392`） |
| `site_node_mapping` | `site_node_mapping` DDL + 唯一索引 `uk_site_node_mapping`（`db.js:48-61`） |
| 目录删除级联清映射、不删站点 | `siteNodes.delete` 描述与实现（`tree.js:387-392`） |
| 列表过滤：目录子树 / 标签 / 文本 / 排序 | `sites.list`（`lib/sites.js:490-506`，过滤实现 `:157-205`；`resolveSort` `:146-155`） |
| 站点名必填 + 至少一个目录 | `validateSiteName`（`sites.js:214-219`）、`normalizeDirIds`（`:227-237`，"站点至少需要关联一个目录"） |
| `sites.create/update/delete` | `sites.js:515-560` |
| 标签映射（`item_type='site'`） | `siteTags.search / siteTags.byIds`（`sites.js:592-612`） |
| 多目录关联 + 目录路径回显 | `enrichSite`（`lib/sites.js:138-144`）在 `rowSite`（`lib/db.js:225-243`）之上补 `tags` / `dirs` |

### 6.2 一期**没有**对应物（迁移需要新增）

| # | v2 能力 | v2 证据 | DSH 现状 |
| --- | --- | --- | --- |
| 1 | `site_account` 表 + 账号 CRUD | `site_account_table.dart`、`site_account_repository.dart` | `db.js` DDL 仅 3 张表；`lib/` + `client/client.src.cjs` grep `account` **0 命中** |
| 2 | `site_account_external` 表 + 双向级联 + 全量替换 | `site_account_external_repository.dart:22-112` | 无 |
| 3 | 删站守卫（有账号则拒绝删除） | `site_service.dart:117-130` | `sites.delete` 直接软删并清映射（`sites.js:552-560`） |
| 4 | 关闭 `bindable` 的引用守卫 | `site_info_editor.dart:84-100` | `bindable` 只是字段，取值受配置 `form.defaultBindable` 影响（`sites.js:339-342`），无引用校验 |
| 5 | 外联级联选择器（站点 → key 非空账号，排除自身站点） | `site_account_views.dart:572-733` + `site_service.dart:205-228` | 无 |
| 6 | 账号计数徽标 / 只读账号卡 / 外联 chips / 账号复制 | `site_account_views.dart:92-320` | 无 |
| 7 | 站点聚合进 `accounts`（列表行 + 移动卡 + 详情） | `site_models.dart:167-178`、`site_mobile_views.dart:267-284` | `rowSite`（`lib/db.js:225-243`）/ `enrichSite`（`lib/sites.js:138-144`）无 `accounts` 字段 |
| 8 | `master_info`（个人信息）联动：手机号/身份证候选下拉 | `site_account_views.dart:363-376` | 全 `packages/` grep `master_info\|masterInfo` **0 命中**，DSH 无该域 |

### 6.3 反向差异（DSH 有、v2 没有；不属于缺口，但设计文档要避免"对齐 v2"时误删）

- `sites.stats` / `sites.statsReport`（`sites.js:562-590`）、`lib/stats.js`(369 行)、`client/charts.cjs`。
- `lib/backup.js`(238)、`lib/sync.js`(126)、`lib/config.js`(386)：备份/同步/配置域。
- `rev` 乐观并发 + `deleted_at` + `logChange` 变更日志（`db.js` DDL 与 `sites.js:356-363`）。
- 输入长度上限（站点名 200、描述 2000，`sites.js:214-225`）与链接数量上限 `checkLinkLimit`（`sites.js:39-43`，调用点 `:336`）。

## 7. 设计文档中的既定意图（原文要点 + 行号）

### 7.1 `_archive/sheepone_v2/重构方案.md`

| 行号 | 要点 |
| --- | --- |
| 400 | `**A 类：行级同步表**（20 张）—— 无顺序依赖，逐行独立比对` |
| 406-408 | 表映射：`site`→`site`（`site_name/description/bindable/site_link(JSON)`）；`site_account`→`site_account`（`account/password/phone_number/identity_card/key/remark/site_id`）；`site_account_external`→`site_account_external`（`native_account_id/external_account_id`） |
| 425 | `**B 类：树形全量覆盖表**（2 张）—— 存在全局顺序依赖，整表覆盖` |
| 439-494 | A 类 / B 类 / 标签表 DDL 范式；`:494` 注："`site_node` 与 `task_node` 同构，仅去掉 `type` 字段" |
| 1919-1968 | 6.3 A 类行级比对算法 / 6.4 B 类全量覆盖算法 |
| 2147-2148 | 外键：`site_account.site_id → site.id`；`site_account_external.native_account_id / external_account_id → site_account.id` |
| 2634-2654 | 旧系统分析：`site.site_name` 非空默认 `'未命名'`；`bindable` 旧为 CHAR `'0'`/`'1'`；`site_link` 为 `{link, description, isDefault}` 数组；`site_account.key` 非空且同站点业务唯一；`account/password/phone_number/identity_card/remark` **全链路明文，无加密**；`site_account_external` 双向级联删除；接口 `creteSite`/`updateSite`(syncAccounts merge)/`deleteAccount`/`external_binded`/`cascade` |
| 2664-2665 | 旧 UI：`SiteInfoModal` 4 步向导（基础信息/关联目录/关联账号/关联标签）；`SiteAccountModal` 只读卡片（key/account/password/phone/identityCard/remark + 外联标签） |
| 2671 | "5 张 drift 表…已在阶段二建好（3.2.4：前四张 A 类行级同步 + `site_node` B 类整表覆盖）" |
| 2675-2677 | 口径转换：主键自增 INTEGER→TEXT `${deviceId}-${ts}-${seq}`；外联 INTEGER 外键→text id，"语义不变：本站账号引用其他站点账号" |
| 2684 | 账号校验：`key` 非空；同站点内未删行去重（提交时按库校验）；`bindable` 关闭前先查 `external_binded`，被引用则阻止 |
| 2696-2717 | 分层：`SiteAccountRepository`（CRUD/计数/外联校验）、`SiteAccountExternalRepository`（双向级联删 / 按 native 全量替换）；用例表 `createSite/updateSite/deleteAccount/getSiteList/getAccountList/getCascadeData/isSiteExternallyBinded` |
| 2741-2742 | UI：4 步向导细节；账号 Modal = 只读卡片逐行展示 + 单账号删除（双向清外联） |
| 2753 | 架构图：`site* 4 张 A 类行级增量 / site_node B 类整表覆盖 → 云端备份（登录后）` |
| 2763-2764 | 验收：账号 key 非空 + 同站点去重；手机/身份证从个人信息下拉选取；外联账号选择/移除/双向级联删除；`bindable` 关闭时被引用则阻止 |
| 2767 | "同步 | 登录后 4 张 A 类表行级增量、site_node 整表覆盖均推送" |
| 22 | `sheepone-develop-conf/sqls/` 建表语句严重落后于真实数据库（`site` 缺 `bindable`），不可作为依据 |

### 7.2 `_archive/sheepone_v2/重构历史.md`

| 行号 | 要点 |
| --- | --- |
| 73 | 22 张 drift 表：`business/` 20 张 A 类 + 2 张 B 类树形；`ops/` 3 张运维表 |
| 738-745 | 阶段-2 前置决策（用户确认）：**"账号敏感字段（密码/手机号/身份证）沿用旧系统明文口径；删除站点改为「存在未删账号时阻止删除」（修复旧遗留缺陷"删站不级联删账号"）；账号外联（site_account_external）完整迁移；本次完整迁移（数据层 + 全部页面 + 移动端 + i18n + 路由）"**；方案新增 10.5 site 章节 |
| 745 | "八处口径转换与两处规则修订表（MPTT→path 树、TEXT 主键、item_type 字符串口径、删站/删节点语义、明文沿用、缓存不迁移）" |
| 748-765 | 执行清单：`tree_service` 参数化共用 `task_node`/`site_node`；4 个单表 Repository；`tag_mapping.item_type` 走 v2 字符串 `'site'`；`SiteService`；`site_models`；5 个 UI 文件；`site_provider` + `app_providers` 注册 6 个 Provider |
| 767 | `app_router` 注册 `/site`；slang 新增 `site.*` 约 90 个 key 中英双语；抽出 `formatSiteDateTime` |
| 771-787 | 交互精修：`site_ui.dart` 共用件；账号 Modal 带计数徽标；账号卡 = 首字母头像 + key 标题 + 字段两栏 + **密码圆点掩码** + 复制 + 外联 tertiary chips；`flutter analyze` site 域 0 errors / 0 warnings |
| 807-817 | 阶段-31 修复：外联级联第二级 Dropdown 残留旧值 → 框架断言崩溃；修法两级都加 `ValueKey` + 未选站点不渲染第二级 |

### 7.3 既定意图与本次盘点的冲突（必须在正式设计里裁决）

| # | 文档说法 | 代码事实 | 建议处理 |
| --- | --- | --- | --- |
| 1 | `历史:781` "密码圆点掩码" | 实际渲染明文（§2.4） | 设计文档按"打码未实现"立项，不复刻缺陷 |
| 2 | 草案 `site-phase2-outline.md` 把列写成 `NOT NULL DEFAULT ''` | v2 全列可空，空值存 NULL（`_blankToNull`） | 明确这是有意的语义变更，并给出"空串 vs NULL"取值规范 |
| 3 | 草案命名 `account_key` | v2 列名为 `key` | 新表若要改名需在设计中写迁移映射（`key` → `account_key`） |
| 4 | `site_account_external.external_account_id` 注释"外部系统账号ID" | 实为另一条本地 `site_account.id` | 注释/字段名必须改，避免被误读为第三方账号绑定 |
| 5 | 明文口径（`历史:743`） | 云端 `payload jsonb` 会存明文 | 二期若沿用明文，需在设计中显式写"云端可见明文"的风险声明 |

## 8. 对二期设计的直接输入（仅事实推导，不含方案取舍）

1. 二期最小闭环 = 2 张表（`site_account`、`site_account_external`）+ 账号与站点的级联规则；其余 v2 站点业务一期已覆盖（§6.1）。
2. 三条"挂靠规则"必须与账号一起迁，否则语义断裂：删站守卫、`bindable` 关闭守卫、外联双向级联。
3. `key` 是账号的**用户可读主键**（外联 chips 与级联下拉都展示它），`account` 是登录名；两个字段都要保留，不要合并。
4. 账号是站点的一对多从属物，不需要独立的目录/标签归属；`sites.list` 的过滤与排序永远不必关心账号。
5. 敏感字段三项（password/phone/identity）是**同一个决策单元**：要么一起明文本地专用，要么一起在写库前加密；拆开处理会产生"手机号同步、密码不同步"这类无法解释的产品行为。
6. 若要保留"外联引用其他站点账号"的能力，就必须保留 `bindable` 的**引用校验**，否则一期已有的 `bindable` 字段在二期会退化为纯装饰。

## 9. 未能确认的事实

| # | 未确认项 | 原因 | 建议如何补齐 |
| --- | --- | --- | --- |
| 1 | `master_info` 表的真实列名（`phones[].identityCard` 与 `identityCards[].cardNumber` 是否真的交叉取错） | 只读了账号侧调用点，未读 `client/lib/data/database/tables/business/master_info_table.dart` 与 `master_info_service` | 读该表定义 + `getMasterInfo()` 返回模型即可定论；若确为 bug，需在设计中说明"候选来源以身份证/手机号各自字段为准" |
| 2 | v2 运行时真实数据里 `site_account.key` 为 NULL 的行是否存在、如何被外联过滤（`getCascadeData` 已过滤空 key，旧数据是否仍能在 Modal 中展示） | 无数据库样本，只有代码路径 | 若能拿到一份 v2 SQLite 备份，跑 `SELECT count(*) FROM site_account WHERE key IS NULL OR trim(key)=''` |
| 3 | 旧 React 前端（`_archive/sheepone-fronted`）是否有账号入口、是否真为死按钮 | 本次范围限定 v2 归档客户端 + 两份 md | 另一路盘点（`docs/specs/_draft/site-legacy.md`）已覆盖，交叉引用即可 |
| 4 | 旧 Java 后端（`_archive/sheepone-system`）是否已有 `site_account` 实体/接口 | 同上，未读 | 同上 |
| 5 | v2 账号数据是否实际已上行云端、上行量级 | 需真实账号与云端库；本次只读源码 | 查云端 `change_log` 中 `table_name='site_account'` 的条数 |
| 6 | `site_link` 的"单默认互斥"在 v2 UI 的具体实现位置 | 只确认了 `SiteLinkItem.isDefault` 注释与 `_LinkRow` 存在（`site_info_editor.dart:168-173`），未读 `_LinkRow` 完整实现 | 读 `site_info_editor.dart` 中 `_LinkRow` 类（`:617-707`） |
| 7 | DSH 一期是否已有"站点账号"相关规划文档或已废弃分支 | 只读了 `packages/addons/sites/` 现网代码与 `docs/specs/` 目录清单 | 全仓 grep `site_account` / `站点账号`（本次仅在 `docs/specs/_draft/site-phase2-outline.md` 命中） |
| 8 | 账号卡在深色主题/窄屏下的实际渲染 | 未运行 App | 需真机或 Flutter 截图 |

## 附：本次盘点覆盖的文件清单

| 文件 | 行数 | 是否通读 |
| --- | --- | --- |
| `client/lib/data/database/tables/business/site_table.dart` | 16 | 全文 |
| `client/lib/data/database/tables/business/site_node_table.dart` | 13 | 全文 |
| `client/lib/data/database/tables/business/site_node_mapping_table.dart` | 10 | 全文 |
| `client/lib/data/database/tables/business/site_account_table.dart` | 19 | 全文 |
| `client/lib/data/database/tables/business/site_account_external_table.dart` | 10 | 全文 |
| `client/lib/data/database/tables/base_columns.dart` | 33 | 全文 |
| `client/lib/ui/site/site_account_views.dart` | 734 | 全文 |
| `client/lib/ui/site/site_info_editor.dart` | 707 | 前 370 行 + grep 覆盖（`_LinkRow` 未通读） |
| `client/lib/ui/site/site_page.dart` | 904 | 关键段（入口/删除/编辑/账号） |
| `client/lib/ui/site/site_table.dart` | 378 | 关键段（列定义/链接样式/bindable 角标/标签折叠） |
| `client/lib/ui/site/site_mobile_views.dart` | 306 | 关键段（卡片/详情账号区块） |
| `client/lib/ui/site/site_ui.dart` | 193 | 关键段（`tagColorsFor` / `TagChip`） |
| `client/lib/ui/site/site_dir_tree.dart` | 476 | 类注解 + 交互说明（`:11-23`） |
| `client/lib/ui/site/site_time.dart` | 10 | 全文 |
| `client/lib/data/models/site/site_models.dart` | 219 | 全文 |
| `client/lib/data/repositories/site_repository.dart` | 116 | 摘要级 |
| `client/lib/data/repositories/site_account_repository.dart` | 162 | 摘要级 |
| `client/lib/data/repositories/site_account_external_repository.dart` | 113 | 摘要级 |
| `client/lib/data/repositories/site_node_mapping_repository.dart` | 133 | 摘要级 |
| `client/lib/data/services/site_service.dart` | 557 | 摘要级 |
| `client/lib/ui/providers/site_provider.dart` | 22 | 摘要级 |
| `client/lib/ui/providers/app_providers.dart` | — | 注册段 `:71-97` |
| `_archive/sheepone_v2/重构方案.md` | 2767 | site/account 相关段落（§0/§3.2/§6/§10.5） |
| `_archive/sheepone_v2/重构历史.md` | 819 | site 相关段落（阶段-2、阶段-31） |
| `packages/addons/sites/lib/{db,sites,tree}.js` | 325/612/393 | DDL、action 注册、关键实现 |
| `cloud/src/main/resources/db/migration/V1__cloud.sql` | — | `change_log` / `row_states`（`:35-60`） |
