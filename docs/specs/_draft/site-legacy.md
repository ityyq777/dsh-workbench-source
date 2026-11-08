# 站点（site）与站点账号（account）· 遗留业务盘点

> 只读盘点，不改动任何既有文件。范围：`_archive/sheepone-system/`（Java 后端）、`_archive/sheepone-fronted/`（React 前端），
> 旁证：`_archive/sheepone_v2/`（Flutter 重写客户端 + 设计文档）。
> 目的：为《站点模块迁移二期》提供「旧系统到底是什么样」的事实底稿。

---

## 0. 结论速览

| # | 结论 | 强度 |
| --- | --- | --- |
| 1 | **归档后端 `_archive/sheepone-system/` 里没有任何 site 代码**：136 个受控文件里 `grep -rniE "site"` 零命中 | 强（可复现） |
| 2 | 但**「归档里没有」≠「旧系统没有」**：`_archive/sheepone_v2/重构方案.md:2644` 明确引用 `sheepone-system/sheepone-system-bootstrap/.../services/site/SiteService.java`，而该模块在归档中不存在 → 归档后端是**残缺快照** | 强 |
| 3 | 归档后端唯一的 account 形状类 `AccountManager.java` 是**孤儿**（无 `@TableName`、无 mapper/service/controller、零引用） | 强 |
| 4 | 前端 master 检出（2026-01-02）站点功能齐备，但**「账号」按钮是死按钮**（无 `onClick`），向导只有 3 步 | 强 |
| 5 | 前端另有一条分支 `origin/2026_04_20_mutil_platform`（2026-04-25）**完整实现了账号功能**：4 步向导、账号只读 Modal、外联级联、移动端 10 个组件、4 个 `/site_account` 接口 | 强（git 对象可读） |
| 6 | **敏感信息零防护**：密码/手机号/身份证全链路明文，无掩码、无剪贴板、无加密、无日志脱敏；分支根目录 `bugs.txt` 自列 TODO「隐私数据加密」 | 强 |
| 7 | **全仓没有任何 site/site_account 的 DDL 或迁移脚本**；表结构只能从 v2 设计文档反推 | 强 |
| 8 | 一期的「账号按钮是死按钮」结论**只对 master 检出成立**；对分支不成立。二期设计应以分支契约 + v2 文档为准 | 关键修正 |

---

## 1. 盘点范围与方法

### 1.1 目录与文件规模

| 目录 | 内容 | 文件数 | 最后提交 |
| --- | --- | --- | --- |
| `_archive/sheepone-system/` | Java 21 模块（Maven） | 136 受控文件：110 `.java`、16 `.xml`、5 `.yml`、3 `.json`；**0 个 `.sql`/`.kt`/`.properties`** | `d3ec2c7` 2025-04-25 13:37 |
| `_archive/sheepone-fronted/` | React 18 + antd + Vite | `src/` 站点相关 30 个文件 | `693d683` 2026-01-02 20:29（master） |
| `_archive/sheepone-fronted` @`origin/2026_04_20_mutil_platform` | 同一仓库另一分支，嵌套 `sheepone-frontend-web/` | 站点目录 37 个文件（含 `account/`4 个、`mobile/`10 个） | 2026-04-25 |
| `_archive/sheepone_v2/` | Flutter 重写客户端 + `重构方案.md` / `重构历史.md` | — | `d75561b` 2026-09-24 |

### 1.2 使用的检索模式

```sh
# 后端（全树，排除 .git），文件类型白名单
grep -rniE "site"        --include=*.java --include=*.kt --include=*.sql \
     --include=*.yml --include=*.yaml --include=*.xml --include=*.json --include=*.properties
grep -rniE "account|identity|credential|password|passwd|login|username|secret|token"  # 同上
# 前端
grep -rniE "账号|account|密码|身份|身份证|手机号"   src/
grep -rniE "i18n|useTranslation|react-intl|locale|国际化"  src/
grep -rniE "Clipboard|navigator.clipboard|复制|掩码"  src/components/site
# 分支（只读，不切换工作树）
git grep -n "<pattern>" origin/2026_04_20_mutil_platform -- sheepone-frontend-web/src/...
git show origin/2026_04_20_mutil_platform:<path>
```

> 全程使用 `git grep` / `git show` 读取分支内容，**未 checkout、未改动工作树**。

---

## 2. 后端 `_archive/sheepone-system/`：确认无 site 代码

### 2.1 模块清单（`pom.xml:16-24`，共 9 个）

`sheepone-entities-common`、`sheepone-entities-jooq`、`sheepone-entities-mybatis`、`sheepone-tasks`、
`sheepone-monitor`、`sheepone-clock`、`sheepone-storage`、`sheepone-tag`、`sheepone-client-common`

**没有** `sheepone-site`，也**没有** `sheepone-system-bootstrap`、`sheepone-entities`（v2 文档引用的两个模块）。
`pom.xml:7-11` 的 parent 是外部 POM `com.sheepone.webdev:webdev-java:1.0.0`（仓库内不存在）——归档本身不具备独立可构建性。

### 2.2 关键字命中矩阵

| 模式 | 命中数 | 命中位置 | 判定 |
| --- | --- | --- | --- |
| `site`（不分大小写） | **0** | — （`grep` 退出码 1，无任何 stdout） | 无 site 代码 |
| `account` | 2 | `sheepone-entities-mybatis/.../entity/storage/AccountManager.java:20-21` | 孤儿实体，见 2.3 |
| `identity` | 12 | 全部是 jOOQ 生成码里的 `org.jooq.Identity` / `getIdentity()`：`meta/tables/Storage.java:17,57,134,135`、`Tag.java:17,57,109,110`、`TaskNode.java:17,57,139,140`、`Task.java:19,59,171,172` | 自增主键，与「身份」无关 |
| `credential` | **0** | — | 无凭据概念 |
| `password` / `passwd` / `密码` / `secret` / `token` / `login` / `username` | 18 | 仅数据库连接配置：`sheepone-{clock,tag,monitor,tasks,storage}/src/main/resources/application.yml`（`username: root`、`password: 123321`）；`sheepone-entities-jooq/src/test/java/com/sheepone/system/JooqCodeGenerator.java:13` `setJdbcPassword("123321")` | 无业务级登录/密码 |

### 2.3 唯一的 account 形状类：`AccountManager`（孤儿证据链）

`sheepone-entities-mybatis/src/main/java/com/sheepone/system/entity/storage/AccountManager.java`（23 行，`@author Miss.杨`，2025-04-05）：

```java
// :20
public class AccountManager extends BaseEntity {
    private String account;   // :21
    private String password;  // :22
}
```

判定为死代码的四条证据：

1. **无 `@TableName`**：同类 `Storage.java` 有 `@TableName("storage")`，`StorageTagMapping.java` 有 `@TableName("storage_tag_mapping")`，它没有；
2. **无 Mapper**：`mapper/storage/` 下只有 `StorageMapper`、`StorageTagMappingMapper`；
3. **无 Service / Controller**：`sheepone-storage` 的 HTTP 面只有 `/storage` 的 create/update/list，DTO 为 `StorageCreateRequest{name,brand,remark,stock,unit,imgList,tags}`；
4. **零引用**：`grep -rn "AccountManager"` 全树仅命中它自己的第 20 行。

补充：它只有 `account`/`password` 两个字段，**没有** `phoneNumber`/`identityCard`/`key`/`remark`/`siteId`——即使硬接也承载不了旧站点账号的语义。

### 2.4 数据库层：没有 site 表

- jOOQ 注册表 `sheepone-entities-jooq/.../meta/Tables.java`：仅 `STORAGE`(22)、`TAG`(27)、`TASK`(32)、`TASK_NODE`(37)。
- MyBatis 实体：`storage/{AccountManager,Storage,StorageTagMapping}`、`tag/Tag`、`tasks/{Task,TaskNode}`、`clock/ClockHistoryMaximumStatistic`。
- 无 `.sql`、无 Flyway/Liquibase 目录、无 `schema.sql`/`data.sql`。

### 2.5 为什么「后端无 site」不能直接当作事实

`_archive/sheepone_v2/重构方案.md:2643` 给出旧后端 5 张表与 `SiteService` 用例的完整描述，并链接：

```
../sheepone-system/sheepone-system-bootstrap/src/main/java/com/sheepone/system/services/site/SiteService.java
```

该路径下的模块**在归档中不存在**（`ls sheepone-system-bootstrap` → No such file）。
结合归档最后提交时间（2025-04-25）早于前端分支提交（2026-04-25）整整一年，可推断：
**归档的是早期快照，站点/账号的后端实现从未被归档。**

因此二期的旧契约来源只有两处：**前端分支代码**（第 4 节）+ **v2 设计文档 §10.5**（第 7 节）。

---

## 3. 前端 master 检出：站点齐备、账号是死按钮

### 3.1 站点相关文件清单（`_archive/sheepone-fronted/src/`）

| 层 | 文件 | 说明 |
| --- | --- | --- |
| 路由 | `routes.tsx:64-68` | `/site` → `<SiteContextManager><SitePage/></SiteContextManager>` |
| 页面 | `pages/Site.tsx:20-49` | antd `Splitter` 左树（默认 15%，10%~30% 可折叠）+ 右列（TopArea / Table / Pagination / 三个 Modal），高 98vh |
| 组件 | `components/site/SiteDeleteModal.tsx` | 删除确认 |
| | `components/site/info/{SiteInfoModal,SiteInfoSteps,SiteFormBaseInfo,SiteFormDirInfo,SiteFormTagInfo,TagSearch}.tsx` | 3 步向导 |
| | `components/site/table/{SiteTable,SiteTablePagination,SiteTableRowOpToolbox,SiteTableTagFilterInner,SiteTableTagFilterOutter}.tsx` | 列表 |
| | `components/site/top/{SiteTableTopArea,SiteTableTopToolbox,SiteTableTopBreadcrumb,SiteTableTopBreadcrumbItem}.tsx` | 面包屑/工具条 |
| | `components/site/tree/{SiteDirTree,SiteTreeArea,SiteDirTitle,SiteTreeTopToolbox,SiteDirItemOpModal}.tsx` | 目录树 |
| 状态 | `contexts/site/{index,SiteTableContext,SiteTableRowContext,SiteInfoModalContext,SiteDirTreeContext,SiteCurrentDirContext,SiteDeleteModalContext,SiteDirItemOpModalContext}.tsx` | React Context（非 zustand） |
| 类型 | `models/site/{model,request,response,state}.tsx` | 见 3.3 |
| 服务 | `services/siteService.tsx` | 10 个端点，端口 4170 |
| 枚举 | `constants/enums/SiteEnum.tsx` | `SiteInfoModalType`/`SiteDirItemOpType`/`SiteExpandedTableType` |
| 离线 | `offlinedata/siteSources.tsx` | mock 数据 |
| i18n | **无** | `src/` 无任何 i18n 框架，全中文硬编码 |

### 3.2 HTTP 端点（`services/siteService.tsx`，`serverPort = 4170`）

| 方法 | 路径 | 函数 |
| --- | --- | --- |
| POST | `/site` | `createSite` |
| PUT | `/site` | `updateSite` |
| GET | `/site/list` | `getSiteList` |
| PUT | `/site_node/move` | `moveSiteNode` |
| GET | `/site_node/children` | `getNodeDirectChildren` |
| DELETE | `/site_node` | `deleteNode` |
| PUT | `/site_node` | `renameNode` |
| POST | `/site_node` | `createNode` |
| GET | `/site_node/path_children` | `getParentPathChildren` |
| GET | `/site_node/multiple_children` | `getMultipleNodeDirectChildren` |

**没有任何 `/site_account` 端点**——master 检出确实没有账号后端契约。

### 3.3 数据模型（master）

```ts
// models/site/response.tsx
interface SiteItem { id; key; siteName; updateTime; createTime; siteLinks; defaultLink;
                     tags: TagBase[]; dirs: SiteDirNodePath[]; description }   // 无 accounts、无 bindable
// models/site/model.tsx:6-10
interface SiteLinkItem { description; link; isDefault }
// models/site/request.tsx
interface CreateSiteRequest { siteName; siteLinks; tagIds: number[]; dirIds: number[]; description }
```

### 3.4 死按钮证据

`components/site/table/SiteTableRowOpToolbox.tsx:46-53`：

```tsx
<Tooltip title="账号">
    <Button color={AntdColorForStr.Primary} variant="filled" icon={<FileOutlined/>}></Button>
</Tooltip>
```

对比同文件 链接(24-34)、目录(35-45)、编辑(54-69)、删除(70-85) 四个按钮都带 `onClick`，**唯独「账号」没有**。
这是「死按钮」结论的原始证据，成立。

### 3.5 master 检出的其它已知缺陷

| 位置 | 问题 |
| --- | --- |
| `SiteDeleteModal.tsx:15-17` | `onOk` 只关闭弹窗，**不调删除接口**（一期已修） |
| `SiteTable.tsx:272` | `rowSelection={{}}` —— 渲染了选择列但无任何批量动作 |
| `SiteTable.tsx:34` | 列里有 `Table.SELECTION_COLUMN`，选择态从不被消费 |
| `SiteDirTreeContext.tsx:68,74`、`SiteFormDirInfo.tsx:39` | 遗留 `console.log`（打印树节点，非敏感数据） |
| `SiteDirTreeContext.tsx` | `insertNode` 从 `services/tasksService` 导入 `createTaskNode` 去建**任务**节点（跨模块复制粘贴残留，站点 UI 未调用） |
| `services/siteService.tsx` | `getMultipleNodeDirectChildren` 的离线分支误用 `isOfflineDevTask` 开关 |

---

## 4. 决定性发现：账号功能在另一条分支上完整存在

### 4.1 提交时间线（`_archive/sheepone-fronted`）

| commit | 日期 | 标题 |
| --- | --- | --- |
| `7e0d6e6` | 2026-04-25 | `feat(site): 新增外联账号管理和关联账号功能` |
| `2fb72a6` | 2026-04-25 | `feat(site): 重构关联账号管理功能` |
| `86a625a` | 2026-04-25 | `feat(account): 更新站点账户信息卡片UI` |
| `cf9892f` | — | `refactor(store): …`（后续删除/迁移） |

- 三条提交只存在于 `remotes/origin/2026_04_20_mutil_platform`（`git branch -a --contains 7e0d6e6` 仅此一条）；
- 当前 master 工作树 `git ls-files | grep -i account` 为**空** → 代码在 git 对象里，不在检出里；
- 目录结构也不同：分支是 `sheepone-frontend-web/src/...` 嵌套，master 是 `src/...` 平铺。

> 结论：一期「归档前端没实现账号」的判断，是对**当时检出的 master** 成立的；真实旧前端（2026-04-25 的分支）有完整账号模块。二期应以此为准。

### 4.2 分支相对 master 的增量

`sheepone-frontend-web/src/components/site/` 目录分布：
`account/`(4)、`info/`(7)、`mobile/`(10)、`table/`(5)、`top/`(4)、`tree/`(5)、`SiteDeleteModal.tsx`、`index.tsx`。

新增文件：

| 路径（分支内） | 作用 |
| --- | --- |
| `components/site/account/SiteAccountModal.tsx` | 账号只读 Modal（`BaseModal`，60vw，`footer={null}`，空态「暂无帐号信息」） |
| `components/site/account/SiteAccountInfoCard.tsx` | 单账号只读卡片（字段两栏 + 外联列表） |
| `components/site/account/SiteAccountEditCard.tsx` | 向导内单条账号编辑卡（key/帐号/密码/手机/身份证/备注/外联） |
| `components/site/account/index.tsx` | 导出 |
| `components/site/info/SiteFormAccountInfo.tsx` | 向导第 3 步「关联账号」 |
| `components/site/mobile/*`（10 个） | 移动端：`SiteMobileForm`、`SiteMobileFormAccountInfo`、`SiteMobileAccountCard`、`SiteMobileFormBaseInfo` 等 |
| `hooks/query/site/{useSiteAccountListQuery,useSiteAccountCascadeQuery,useSiteAccountMutations,keys}.ts` | react-query 封装 |
| `store/site/siteAccountModal.ts` | zustand store（`openAccountModal(siteId, siteName, accounts)`） |

### 4.3 HTTP 契约（分支 `services/siteService.tsx`）

| 方法 | 路径 | 函数 | 行 |
| --- | --- | --- | --- |
| GET | `/site_account/cascade?excludeSiteId=` | `getSiteAccountCascade` | 176-180 |
| GET | `/site_account/external_binded?siteId=` | `checkSiteExternalBinded` | 188-191 |
| DELETE | `/site_account` | `deleteSiteAccount`（body `{id}`） | 199-202 |
| GET | `/site_account/list?siteId=` | `getSiteAccountList` | 210-213 |
| POST/PUT | `/site` | `createSite`/`updateSite`，payload **内嵌 `accounts`** | 19/32 |

注意：**账号的「增/改」没有独立端点**，走站点 create/update 的 `accounts` 数组整体提交（merge 语义）。

### 4.4 数据模型（分支 `types/models/site/`）

```ts
// model.tsx
interface AccountFormData {         // 请求用
    id?: number                     // 新增无 id，编辑有 id → merge 依据
    key: string; account: string; password: string
    phoneNumber: string; identityCard: string; remark: string
    externalAccountIds: number[]
    externalAccountDisplay?: ExternalAccountDisplay[]   // 仅前端展示，提交前剔除
}
interface ExternalAccountDisplay { id: number; siteName: string; accountKey: string }
interface SiteAccountCascadeOption { id: number; siteName: string; accounts?: AccountCascadeChild[] }
interface AccountCascadeChild { id: number; key: string }

// request.tsx
interface CreateSiteRequest { siteName; siteLinks; tagIds; dirIds; description; bindable: string; accounts: AccountFormData[] }

// response.tsx
interface SiteItem { …, bindable: string, accounts: SiteAccountItem[] }
interface SiteAccountItem {         // 响应
    id: number; key: string; account: string; password: string
    phoneNumber: string; identityCard: string; remark: string
    createTime: string; updateTime: string
    externalAccounts: ExternalAccountDisplay[]
}
interface SiteAccountListResponse { accounts: SiteAccountItem[] }
```

`bindable` 是 `string`（`'0'`/`'1'`），一期插件已按 `INTEGER 0|1` 落地，需要口径转换。

### 4.5 4 步向导与校验

`SiteInfoSteps.tsx` 步骤改为 **基础信息 → 关联目录 → 关联账号 → 关联标签**（`:10` `validateAccountKeys`）：

```ts
// :10-29
const keys = accounts.map(a => a.key?.trim() || '')
if (keys.some(k => k === '')) return 'empty'
if (new Set(keys).size !== keys.length) return 'duplicate'
```

- 空账号列表视为 **valid**（账号可选）；
- 第 3 步 `error` 态直接让步骤条变红。

`SiteFormAccountInfo.tsx:14-46` `computeKeyErrors` 逐条给出 `'empty' | 'duplicate' | null`，用于卡片内联报错；
`SiteInfoModal.tsx:19-…` `filterAccountsForRequest` 在提交前剔除 `externalAccountDisplay`；
`SiteInfoModal.tsx:43-73` 在第 4 步（index 3）统一提交 `bindable` + `accounts`。

`bindable` 门禁（`SiteFormBaseInfo.tsx`）：

```tsx
// :35-44
const handleBindableChange = async (checked: boolean) => {
    // 编辑模式下，从"可外联"变为"不可外联"时需要校验
    if (!checked && … && siteInfoModalState.bindable === '1') {
        const response = await checkSiteExternalBinded(siteInfoModalState.id)
        if (…) message.warning('该站点已被其他账号外联，无法关闭"可被外联"')
```

`SiteAccountEditCard.tsx:222` 外联选择器提示「选择一个可被外联的账号：」——**候选来自 `bindable='1'` 的站点**，与 `/site_account/cascade` 语义一致。

### 4.6 移动端

`components/site/mobile/` 10 个文件，独立一套卡片流 + 步骤表单；账号卡 `SiteMobileAccountCard.tsx:21` 同样是 `{ label: '密码', value: account.password }`（明文）。

### 4.7 行操作按钮的接线

`components/site/table/SiteTableRowOpToolbox.tsx:17` `const { openAccountModal } = useSiteAccountModalContext()`，
`:47` `openAccountModal(siteItem.id, siteItem.siteName)` —— 死按钮在分支上已接通。

---

## 5. 二期候选能力矩阵（问题 3）

| 能力 | 归档证据 | 结论 | 二期建议 |
| --- | --- | --- | --- |
| 账号托管（渲染/增删改） | 分支 `account/` 4 文件 + `SiteFormAccountInfo` + 4 个 `/site_account` 端点 + `SiteAccountItem`/`AccountFormData` | **旧系统有，master 检出无** | 二期主线 |
| 账号外联（native↔external） | 分支 `externalAccountIds`、`ExternalAccountDisplay`、`/site_account/cascade`、`/site_account/external_binded`；v2 文档 §10.5.1 `site_account_external` | **有** | 二期主线（含双向级联删） |
| `bindable`（可被外联开关） | 分支 `SiteFormBaseInfo.tsx:133-142` 开关 + `:35-44` 门禁；一期 `site` 表已有 `bindable` 列 | **有（后端）+ 一期已落库列** | UI 开关 + 门禁要补 |
| 账号 key 唯一性校验 | `SiteInfoSteps.tsx:10`、`SiteFormAccountInfo.tsx:14` | **有（前端）** | 落到 action 层强校验 |
| 链接健康检查 | `grep -niE "健康检查|health"` 在 `components/site`、`siteService.tsx` → **0 命中** | **无** | 不做（无依据） |
| 站点导入/导出 | `grep -niE "导入|导出|import|export"`（排除 ES import 语句）→ **0 命中** | **无** | 不做 |
| 批量操作（批量删/批量改） | `SiteTable.tsx:272` `rowSelection={{}}`、`:34` `SELECTION_COLUMN` | **只有选择列壳子，无动作** | 可选，非迁移项 |
| 外部系统对接（第三方 OAuth/API） | `grep -niE "credential|oauth|token"` 后端 0 命中；分支无 | **无** | 不做 |
| 密码生成器 | `grep -niE "生成密码|随机密码|generatePassword"` → **0 命中** | **无** | 不做 |
| 账号「新增/编辑」独立入口 | 仅内嵌在站点 create/update 的 `accounts` 数组里 | **无独立入口** | 需在 action 层拆细（比旧系统更好） |
| 站点删除时账号处理 | master `SiteDeleteModal.tsx:15-17` 连删除都没接；v2 文档 §10.5.1 记「不级联删账号（旧遗留缺陷）」 | **旧系统有缺陷** | 二期改为「有账号则阻止删除」 |
| 移动端布局 | 分支 `mobile/` 10 文件 | **有**（分支） | 二期不迁（本项目为 Web 工作台） |
| i18n | master `src/` 无 i18n 框架；只有 v2 Flutter 有 `site.account.*` 键 | **旧 React 无** | 沿用现有中文硬编码 |

---

## 6. 敏感信息处理痕迹（问题 4）

### 6.1 旧 React（分支 + master）

| 载体 | 证据 | 明文？ | 掩码 | 复制/剪贴板 | 日志 |
| --- | --- | --- | --- | --- | --- |
| 账号只读卡（桌面） | `account/SiteAccountInfoCard.tsx:33` `{account.password \|\| '-'}` | **明文** | 无 | 无 | 无 |
| 账号只读卡（移动） | `mobile/SiteMobileAccountCard.tsx:21` `{ label: '密码', value: account.password }` | **明文** | 无 | 无 | 无 |
| 账号编辑输入框 | `account/SiteAccountEditCard.tsx:138-142` `BaseInput` + `placeholder="请输入密码"` | **明文输入**（不是 `Input.Password`） | 无 | 无 | 无 |
| 手机号 / 身份证 | 同上，普通 `BaseInput`；手机/身份证下拉候选取自 master_info | **明文** | 无 | 无 | 无 |
| 剪贴板 | `git grep -nE "Clipboard|navigator.clipboard|复制|掩码"` 在 `components/site` + `siteService.tsx` → **0 命中** | — | — | **完全无** | — |
| 加密 | 无任何加解密调用；分支 `bugs.txt` 自列 TODO 一条：**「隐私数据加密」** | — | — | — | — |
| master_info（手机/身份证的主数据） | `components/core/MasterInfoForm.tsx:26-37` 校验正则；提交 `PUT /core/master-info`；`models/core/response.tsx:7-31` `Phone{description,identityCard}`（字段名 identityCard 实际存手机号）、`IdentityCard{cardNumber,description}` | **明文** | 无 | 无 | 无 |

### 6.2 v2 Flutter（重写后，仅作参考）

`_archive/sheepone_v2/client/lib/ui/site/site_account_views.dart`：

- `:263-272` `_passwordRow`：`'•' * value.length.clamp(1, 14)` —— **圆点掩码展示**；
- `:301-311` 复制按钮 `Clipboard.setData(ClipboardData(text: realValue ?? value))` —— 复制的是**真实值**，另带 SnackBar 提示；
- `:456` 编辑表单 `obscureText: true`；
- 手机号/身份证仍是 `SelectableText` 明文（未掩码）。

> 也就是说：**掩码 + 复制是重写后被加上的**，旧 React 从来没有。二期若以「沿用旧口径」为由不做保护，是站不住的——旧系统自己把这件事列成了待办。

---

## 7. 表结构（问题 5）

### 7.1 归档里没有 DDL

- `_archive/sheepone-system/`：**0 个 `.sql`**，无 Flyway/Liquibase，无 `schema.sql`；
- `_archive/sheepone-fronted/`：无 SQL，分支上也没有 `sql/` 目录或含 `site_account` 的 `.md`；
- 全仓（排除 `node_modules`）唯一 SQL 是云端迁移：
  `cloud/src/main/resources/db/migration/V1__cloud.sql` —— 建表为
  `users`(2)、`refresh_tokens`(9)、`access_tokens`(17)、`devices`(25)、`change_log`(35)、`row_states`(51)、`sync_sessions`(62)、`sync_table_state`(71)、`blobs`(80)、`blob_refs`(95)。
  **无 site / site_account**。
  其中 `change_log`(`table_name`,`row_id`,`payload jsonb`) 与 `row_states`(`user_id`,`table_name`,`row_id`,`payload jsonb`,`deleted`) 是**通用行级同步表**，`sync_table_state` 带 `mode`（默认 `row`）——即云端不感知具体业务表，加账号表**无需改云端 schema**，只需进同步白名单。

### 7.2 一期插件现有表（对照用）

`packages/addons/sites/lib/db.js`：`site`(14)、`site_node`(31)、`site_node_mapping`(49)（+ 通用 `meta` 于 `:302`）。
`site` 表已含 `bindable INTEGER NOT NULL DEFAULT 1`，但**没有 account 表**。

### 7.3 旧系统 5 张表（还原，非 DDL）

来源：`_archive/sheepone_v2/重构方案.md:2636-2643`（§10.5.1「后端 5 张表」表）、`:405-409`（§3.2.4 对照表）、
`client/lib/data/database/tables/business/*.dart`（drift 定义）。

| 表 | 定位 | 列（文档口径） | 约束要点 |
| --- | --- | --- | --- |
| `site` | 站点本体 | `site_name`、`description`、`bindable`、`site_link`(JSON 数组 `{link,description,isDefault}`) | `site_name` 非空，默认 `'未命名'`；`bindable` 为 **CHAR `'0'`/`'1'`** |
| `site_node` | 目录树 | `lft`/`rgt`/`tree_id`/`depth`/`parent` | **MPTT**；根节点固定 `id=0` 单树 `TREE_ID=0` |
| `site_account` | 站点账号 | `key`、`account`、`password`、`phone_number`、`identity_card`、`remark`、`site_id` | `key` 非空、**同站点内业务唯一**；敏感字段**全链路明文** |
| `site_account_external` | 账号外联 | `native_account_id`、`external_account_id` | 均指向 `site_account.id`；**双向级联删除** |
| `site_node_mapping` | 站点↔目录 | `site_id`、`node_id` | 增删走 diff flush；节点删除时**不清理**（悬空缺陷） |

drift 定义（v2 客户端，字段类型为 TEXT，已二期化）：
`site_account_table.dart` 的 `account/password/phoneNumber/identityCard/key/remark` 全部 `nullable`，`siteId` 非空；
`site_account_external_table.dart` `nativeAccountId`/`externalAccountId` 均非空。

**未能确认**：`key` 的唯一约束是库级 UNIQUE 还是业务校验；`site_account` 是否有 `create_time`/`update_time`（响应模型里有 `createTime`/`updateTime`，说明后端 DTO 有，但库列不可证）。

---

## 8. 未能确认的事实

1. **旧后端 site 代码是否真实存在过**：只有 v2 文档的路径引用与用例描述作证，归档里没有任何字节；`SiteService.java`、`SiteController.java`、`SiteAccountController.java` 是否真的叫这些名字、方法签名如何，**无法确认**。
2. **`/site_account` 各端点的 HTTP 方法与参数细节**：`getSiteAccountList` 用 GET + query `siteId`；`checkSiteExternalBinded` 用 GET + query；`deleteSiteAccount` 用 **DELETE + body `{id}`**（从 `siteService.tsx:199-202` 推断），body 型 DELETE 是否被后端接受无法确认。
3. **账号的独立增改端点是否存在**：前端只通过站点 create/update 提交 `accounts`，但 `store` 里的 `openAccountModal(siteId, siteName, accounts)` 签名带 `accounts` 参数，暗示曾有「先取后开」的旁路，未找到对应调用方。
4. **`site_account.key` 的唯一性范围**：前端只做「同批去重」与「空值检查」，跨批次（即与库里已存在的记录）是否冲突由后端或 UI 二次校验，证据只有 v2 文档一句「提交时按库校验」。
5. **`bindable` 的字符口径**：前端是 `'0'`/`'1'` 字符串，v2 文档说是 CHAR，一期已落 `INTEGER`；旧库真实类型（CHAR(1) / TINYINT / BIT）无法确认。
6. **`site` 表的默认值**：文档称 `site_name` 默认 `'未命名'`，但归档后端无 DDL，无法核对。
7. **`site_account_external` 是否允许自引用/同站引用**：前端级联选择器用 `excludeSiteId` 排除**自身站点**，但同一站点内的两条账号之间是否允许外联，无证据。
8. **敏感字段是否有过任何形式的脱敏传输**：全链路 `http://` + 明文 JSON（`serverPort = 4170`），未见 TLS 或字段加密。
9. **master 检出的 `siteLinks` 与 `bindable` 的关系**：master 的 `SiteItem` 没有 `bindable`，说明 `bindable` 是随账号功能一起引入的（同一批分支提交），但 `bindable` 是否先于账号存在无法确认。
10. **`_archive/sheepone-fronted` 是否还有更晚的、账号功能合回 master 的版本**：仅有一条分支包含该提交；`origin/master` 停在 2026-01-02。
11. **移动端 10 个组件的完整交互**：仅读了 `SiteMobileAccountCard`、`SiteMobileFormAccountInfo`、`SiteMobileFormBaseInfo` 的片段，未逐一通读。

---

## 9. 对二期的直接输入

### 9.1 对 `site-phase2-outline.md` §1「待确认事实」的回填

| 原问题 | 结论 |
| --- | --- |
| v2 账号表字段与语义 | 见 §7.3：`key`（可读标识/业务唯一键）、`account`、`password`、`phone_number`、`identity_card`、`remark`、`site_id`；全明文 |
| 外联账号映射语义 | `site_account_external(native_account_id → external_account_id)`，**账号到账号的引用而非复制**，双向级联删除；候选来自 `bindable='1'` 站点且 `key` 非空 |
| 账号 UI 的完整交互 | 4 步向导第 3 步批量编辑 + 行操作「账号」→ 只读 Modal 逐条删除；外联为「站点→账号」两段下拉 + 已选 chips |
| 旧前端是否真有账号接口（一期结论说死按钮） | **有**，在 `origin/2026_04_20_mutil_platform`：4 个 `/site_account` 端点 + 站点 create/update 内嵌 `accounts`。master 检出的死按钮只是「该分支未合回」 |
| 后端是否完全无 site 代码 | 归档内**完全无**；但归档是残缺快照，旧后端存在性只能由 v2 文档间接证明 |

### 9.2 需要据此修订的一期文档表述

`docs/specs/11-站点模块迁移方案.md` 的下列表述需要加限定语：

- `:12-13`「归档前端只有站点+目录+链接+标签四块；行内『账号』按钮是死按钮」→ 应补：「限 `_archive/sheepone-fronted` master 检出（2026-01-02）；同日另有分支 `2026_04_20_mutil_platform` 完整实现账号与外联」。
- `:366-367`「`site_account / site_account_external` 与 bindable 交互：归档前端没有实现」→ 同上。
- `:105` 表格行「账号按钮 | 无页面无接口」→ 同上。
- `:90`「行操作：链接、目录、账号（死按钮）、编辑、删除」→ 分支上账号已接通。

> 以上仅记录事实差异，本次盘点**未修改** `11-站点模块迁移方案.md`（约束：只读）。

### 9.3 二期设计的三个硬约束（由盘点推出）

1. **契约以分支为准，不以 master 为准**：字段是 `key/account/password/phoneNumber/identityCard/remark/externalAccountIds` + `bindable:'0'|'1'`。
2. **`bindable` 与账号是一对耦合概念**：没有账号就不该有「可被外联」的意义；关闭 `bindable` 必须先查 `external_binded`。
3. **安全策略不能「沿用旧口径」**：旧系统明文到底，但自己把「隐私数据加密」写进了 `bugs.txt`。二期必须显式决策（掩码展示 / 是否同步 / 是否加密），不能默认继承。

---

## 10. 引用索引

**后端**
- `_archive/sheepone-system/pom.xml:7-11,16-24`
- `_archive/sheepone-system/sheepone-entities-mybatis/src/main/java/com/sheepone/system/entity/storage/AccountManager.java:20-22`
- `_archive/sheepone-system/sheepone-entities-jooq/src/main/java/com/sheepone/system/meta/Tables.java:22,27,32,37`
- `_archive/sheepone-system/sheepone-{clock,tag,monitor,tasks,storage}/src/main/resources/application.yml:4-5,11`

**前端 master（`_archive/sheepone-fronted/`）**
- `src/routes.tsx:64-68`、`src/pages/Site.tsx:20-49`
- `src/components/site/table/SiteTableRowOpToolbox.tsx:46-53`（死按钮）
- `src/components/site/table/SiteTable.tsx:34,272`
- `src/components/site/SiteDeleteModal.tsx:15-17`
- `src/services/siteService.tsx`、`src/models/site/{model,request,response,state}.tsx`
- `src/contexts/site/SiteDirTreeContext.tsx:68,74`、`src/components/site/info/SiteFormDirInfo.tsx:39`

**前端分支（`origin/2026_04_20_mutil_platform`，前缀 `sheepone-frontend-web/src/`）**
- `services/siteService.tsx:176-180,188-191,199-202,210-213`
- `types/models/site/{model,request,response}.tsx`
- `components/site/account/{SiteAccountModal,SiteAccountInfoCard,SiteAccountEditCard}.tsx`（`InfoCard:33`、`EditCard:138-142,222`）
- `components/site/info/{SiteInfoSteps:10-29,SiteFormAccountInfo:14-46,SiteFormBaseInfo:35-44,133-142,SiteInfoModal:19,43-73}`
- `components/site/table/SiteTableRowOpToolbox.tsx:17,47`
- `components/site/mobile/SiteMobileAccountCard.tsx:21`、`mobile/SiteMobileFormAccountInfo.tsx:237-238`
- `store/site/siteAccountModal.ts:14,21,34-37`、`hooks/query/site/useSiteAccountMutations.ts`
- 分支根 `bugs.txt`（「隐私数据加密」TODO）

**v2（`_archive/sheepone_v2/`）**
- `重构方案.md:405-409`（表对照）、`:2146-2149`（外键）、`:2636-2643`（5 张表）、`:2644-2655`（Service 用例）、`:2663-2680`（口径差异）、`:2688-2720`（Repository/Service）、`:2725-2760`（UI）
- `client/lib/data/database/tables/business/site_account_table.dart`、`site_account_external_table.dart`
- `client/lib/ui/site/site_account_views.dart:263-272,301-311,456`
- `重构历史.md:743,750-754,763,782,817`

**云端**
- `cloud/src/main/resources/db/migration/V1__cloud.sql:35-60,71-78`
