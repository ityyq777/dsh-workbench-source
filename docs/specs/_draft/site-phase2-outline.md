# 站点模块迁移二期 · 设计草稿（写作中）

> 状态：草稿。事实盘点由两个子任务并行产出：
> `docs/specs/_draft/site-account-v2.md`（v2 Flutter 客户端与账号模型）、
> `docs/specs/_draft/site-legacy.md`（sheepone-system 后端 + sheepone-fronted 前端残留业务）。
> 本文待盘点结论回来后合并成正式设计文档 `docs/specs/22-站点模块迁移二期.md`。

## 0. 范围与原则（已定）

- 本期**只做设计与分期计划，不做旧数据导入**（用户明确要求）。
- 一期已交付：site / site_node / site_node_mapping / tag_mapping、目录树、链接、标签、统计、配置、数据页。
- 二期候选：站点账号体系（site_account / site_account_external）、账号与外联、账号在 UI 中的列表与编辑、以及盘点后发现的其他残留业务。
- 敏感信息（密码、身份证、手机号）是本次设计的核心风险点，必须先定安全与同步策略，再谈字段与 UI。

## 1. 事实（盘点结论，详见 `site-legacy.md` / `site-account-v2.md`）

> **关键修正**：一期「归档里没有 site 后端、账号按钮是死按钮」只对 `_archive/sheepone-fronted` 的
> master 检出（2026-01-02）成立。同仓库分支 `origin/2026_04_20_mutil_platform`（2026-04-25）
> 已完整实现账号 + 外联 + 移动端，代码在 git 对象里、不在检出里。二期契约以该分支为准，
> 并用 `git show` 只读取样，不 checkout。

| 问题 | 结论 |
| --- | --- |
| 旧后端是否有 site 代码 | `_archive/sheepone-system/` 全树 `grep -rniE "site"` 零命中（136 文件）；`AccountManager.java` 是孤儿（无 @TableName/mapper/controller）；但 `重构方案.md:2644` 引用了不存在的 `sheepone-system-bootstrap/.../site/SiteService.java` → 归档是残缺快照（后端停在 2025-04-25） |
| 旧前端账号接口 | 分支上：`GET /site_account/list?siteId`、`GET /site_account/cascade?excludeSiteId`、`GET /site_account/external_binded?siteId`、`DELETE /site_account`；**增改无独立端点**，走 POST/PUT `/site` 的 `accounts` 数组（merge 语义） |
| 账号字段 | `AccountFormData{id?,key,account,password,phoneNumber,identityCard,remark,externalAccountIds,externalAccountDisplay?}`；`key` 同站唯一；站点 `bindable:'0'\|'1'` |
| 外联语义 | `site_account_external(native_account_id→external_account_id)`，双向级联删；关闭 bindable 前先查 external_binded 并阻止 |
| 向导 | 4 步：基础 / 目录 / **账号** / 标签；账号 key 非空且同批去重 |
| 敏感信息现状 | 旧前端**零防护**（`SiteAccountInfoCard.tsx:33` 密码明文渲染、`SiteAccountEditCard.tsx:138` 普通输入框、无复制/掩码/加密），分支根 `bugs.txt` 自列 TODO「隐私数据加密」；v2 Flutter 重写时才加了圆点掩码 + Clipboard |
| 表结构来源 | 全仓无 site DDL；旧 5 张表只能从 `重构方案.md:2636-2643` 还原（site/site_node MPTT/site_account/site_account_external/site_node_mapping） |
| 云端是否要改 | 不需要：`change_log`/`row_states` 是通用行级同步表，账号表进同步白名单即可 |
| 二期候选但无证据 | 链接健康检查 / 导入导出 / 批量操作（仅 `rowSelection={{}}` 空壳）/ 密码生成 / 第三方对接 —— 建议不做 |
| 文档勘误 | `docs/specs/11-站点模块迁移方案.md` 的 `:12-13`、`:90`、`:105`、`:366-367` 需加「限 master 检出」限定语 |

## 2. 数据模型草案（待盘点后定稿）

```sql
-- 语义对齐 v2：除 site_id 外全部可空（空值存 NULL，不写 ''），列名沿用 snake_case
-- 命名映射：v2 的 `key` → 本仓 `account_key`（避免 SQL 关键字冲突），v2 `account` 保持 `account`
CREATE TABLE IF NOT EXISTS site_account (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  account_key TEXT,        -- v2: key，业务唯一标识，同站唯一（应用层保证），必填语义
  account TEXT,            -- 登录名
  password TEXT,           -- 见 §3：默认不进云同步
  phone_number TEXT,
  identity_card TEXT,
  remark TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  rev INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS site_account_external (
  id TEXT PRIMARY KEY,
  native_account_id TEXT NOT NULL,    -- → site_account.id（本库本地账号）
  external_account_id TEXT NOT NULL,  -- → 另一条 site_account.id（本库另一站点的账号），不是第三方系统 ID
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  rev INTEGER NOT NULL DEFAULT 1
);
```

要点：
- 一条站点可有多个账号（一对多），账号不挂在目录上。
- 外联是**本库账号 → 本库另一站点账号**的引用，不是复制、也不是第三方系统 ID；双向级联删除。
- 三条挂靠守卫必须一起实现：删站前若有未删账号 → 拒绝（v2 `SiteHasAccountsException`）；关闭 `bindable` 前若被外联引用 → 拒绝；删账号时双向清外联。
- v2 是 A 类行级同步表；若选择「同步 + 加密」，加密必须发生在写本地库之前（云端 `change_log.payload` 只存密文）。

## 3. 安全与同步策略（需拍板）

| 方案 | 优点 | 代价 |
| --- | --- | --- |
| A. 账号表本地专用，不进云同步 | 最简单，密码不出本机 | 多设备不同步，换机丢失 |
| B. 账号表同步，密码列加密后再同步 | 跨设备可用 | 需要密钥管理（设备密钥/口令派生），否则形同明文 |
| C. 账号表同步，密码列不参与同步（只同步账号名等） | 折中 | 换设备需要手工补密码，语义要写清楚 |

倾向：**先做 A（本地专用）**，把 `site_account` 放在 `siteSync.tables` 之外，UI 明确标注「账号仅保存在本机」。等到有设备密钥方案再升级到 B。密码字段展示一律掩码 + 点击复制 + 不写日志。

## 4. API 草案（待定稿）

```
sites.accounts.list      { siteId }            → { accounts: [...] , externals: [...] }
sites.accounts.create    { siteId, account, password?, phoneNumber?, identityCard?, accountKey?, remark? }
sites.accounts.update    { id, ...同上 }
sites.accounts.delete    { id }                → 软删 + 清外联映射
sites.accounts.link      { nativeAccountId, externalAccountId }
sites.accounts.unlink    { nativeAccountId, externalAccountId }
sites.accounts.cascade   { }                   → 可外联站点 → 其账号（account_key 非空）
```

## 5. UI 草案

- 记录页行操作增加「账号 N」按钮，展开子表或弹窗列出账号（只读列表），支持编辑/删除。
- 新建/编辑站点表单增加「账号」步骤（旧 v2 是向导第 3 步）。
- 外联用两段下拉（站点 → 账号），只展示 `account_key` 非空的账号。

## 6. 分期计划（草案）

1. 阶段一：差异矩阵与设计评审（本文）。
2. 阶段二：数据模型 + 本地 CRUD + 数据页/配置接入（不含 UI）。
3. 阶段三：记录页账号入口与编辑弹窗。
4. 阶段四：外联关系与级联选择器。
5. 阶段五（可选）：加密与跨设备同步。

## 7. 未决问题

- 密码是否允许为空（有些站点只存账号名）？
- `account_key` 与 `account` 的关系：key 是登录名还是展示标签？
- 删除站点时账号是级联软删还是保留孤儿？
- 外联是否允许指向同一站点的账号？
