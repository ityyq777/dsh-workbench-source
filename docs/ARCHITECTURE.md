# 业务目录架构与迁移契约

本方案对应任务 `01a1c018-d6e1-7289-a113-61331801ec1c`。路径映射以 [structure-map.json](../scripts/structure-map.json) 为机器可读清单；下列每行均指定一个现有文件的目标，不以文件名推断新文件职责。tasks、sites、tags、storage 与 shell/src 各范围已执行迁移；全范围目录结构审计通过。完整 E2E 与临时完整包安装验证另行记录，不以结构审计替代。逐文件表保留迁移前文件名与目标路径，文件名链接指向迁移后的实际文件；完整旧路径映射保留在机器可读清单中。

## 目录与依赖方向

|目录|职责|允许依赖它的层|
|---|---|---|
|db/|DDL、通用数据库工具、历史库适配|领域、tree、stats、infra、入口；不得反向依赖 task/domain/timeline/stats 或入口|
|task/model/|任务模型与纯规则|task/read、task/write、timeline、tree、stats、入口|
|task/read/|任务查询、搜索与归属发现|动作聚合与统计|
|task/write/|事务、任务写入与目标校验|动作聚合、领域编排|
|domain/、timeline/、tagging/|各业务实体服务|入口、统计和基础设施适配|
|tree/|目录树模型与写入|领域、入口|
|stats/|统计读取与客户端图形（分别处于各自源码树）|入口、视图|
|infra/|备份、同步、配置、数据页与网络适配|入口|
|views/、modals/、item/|客户端页面、对话框与单项展示|客户端入口与上层UI|
|ui/|客户端通用控件、样式、文案|客户端各模块|
|shell actions/、sync/、types/|宿主动作编排、同步协议、共享类型|宿主入口及相应编排模块|

强制规则：后端源码不得引用 React/React DOM 或任何 client 路径；client 不得导入 lib 后端；db 不得直接或经可解析的本地依赖链依赖 task/domain/timeline/stats。入口负责组合。当前已有允许的调用期循环不借本次搬迁重写业务逻辑；跨层禁用方向必须消除。

每个目录最多12个直接文件（不含显式生成物）；lib/client/src 自身为第1层，a 为第2层，a/b 为第3层，禁止更深。各包根白名单独立定义：tasks/lib 为 index.js、tasks.js，其它 addon/lib 为 index.js，各 addon/client 为 client.src.cjs，shell/src 为 index.ts。addon/lib/client.js 是唯一此处明确豁免的生成 bundle，不扫描其依赖或行数。不能用同名嵌套 client.js 冒充生成物。

## 逐文件迁移表

### tasks/lib

|迁移前文件名（链接到现文件）|迁移后路径|
|---|---|
|[index.js](../packages/addons/tasks/lib/index.js)|`packages/addons/tasks/lib/index.js`|
|[tasks.js](../packages/addons/tasks/lib/tasks.js)|`packages/addons/tasks/lib/tasks.js`|
|[client.js](../packages/addons/tasks/lib/client.js)|`packages/addons/tasks/lib/client.js`（生成物，原位）|
|[db.js](../packages/addons/tasks/lib/db/db.js)|`packages/addons/tasks/lib/db/db.js`|
|[db-core.js](../packages/addons/tasks/lib/db/db-core.js)|`packages/addons/tasks/lib/db/db-core.js`|
|[db-legacy.js](../packages/addons/tasks/lib/db/db-legacy.js)|`packages/addons/tasks/lib/db/db-legacy.js`|
|[task-model.js](../packages/addons/tasks/lib/task/model/task-model.js)|`packages/addons/tasks/lib/task/model/task-model.js`|
|[task-priority.js](../packages/addons/tasks/lib/task/model/task-priority.js)|`packages/addons/tasks/lib/task/model/task-priority.js`|
|[task-difficulty.js](../packages/addons/tasks/lib/task/model/task-difficulty.js)|`packages/addons/tasks/lib/task/model/task-difficulty.js`|
|[task-ownership-path.js](../packages/addons/tasks/lib/task/model/task-ownership-path.js)|`packages/addons/tasks/lib/task/model/task-ownership-path.js`|
|[task-create.js](../packages/addons/tasks/lib/task/write/task-create.js)|`packages/addons/tasks/lib/task/write/task-create.js`|
|[task-create-schema.js](../packages/addons/tasks/lib/task/write/task-create-schema.js)|`packages/addons/tasks/lib/task/write/task-create-schema.js`|
|[task-update.js](../packages/addons/tasks/lib/task/write/task-update.js)|`packages/addons/tasks/lib/task/write/task-update.js`|
|[task-bulk.js](../packages/addons/tasks/lib/task/write/task-bulk.js)|`packages/addons/tasks/lib/task/write/task-bulk.js`|
|[task-operations.js](../packages/addons/tasks/lib/task/write/task-operations.js)|`packages/addons/tasks/lib/task/write/task-operations.js`|
|[task-target.js](../packages/addons/tasks/lib/task/write/task-target.js)|`packages/addons/tasks/lib/task/write/task-target.js`|
|[task-transaction.js](../packages/addons/tasks/lib/task/write/task-transaction.js)|`packages/addons/tasks/lib/task/write/task-transaction.js`|
|[task-query.js](../packages/addons/tasks/lib/task/read/task-query.js)|`packages/addons/tasks/lib/task/read/task-query.js`|
|[task-search-schema.js](../packages/addons/tasks/lib/task/read/task-search-schema.js)|`packages/addons/tasks/lib/task/read/task-search-schema.js`|
|[task-view.js](../packages/addons/tasks/lib/task/read/task-view.js)|`packages/addons/tasks/lib/task/read/task-view.js`|
|[task-publish-filter.js](../packages/addons/tasks/lib/task/read/task-publish-filter.js)|`packages/addons/tasks/lib/task/read/task-publish-filter.js`|
|[task-discovery.js](../packages/addons/tasks/lib/task/read/task-discovery.js)|`packages/addons/tasks/lib/task/read/task-discovery.js`|
|[tree.js](../packages/addons/tasks/lib/tree/tree.js)|`packages/addons/tasks/lib/tree/tree.js`|
|[task-node-write.js](../packages/addons/tasks/lib/tree/task-node-write.js)|`packages/addons/tasks/lib/tree/task-node-write.js`|
|[timeline-actions.js](../packages/addons/tasks/lib/timeline/timeline-actions.js)|`packages/addons/tasks/lib/timeline/timeline-actions.js`|
|[timeline-store.js](../packages/addons/tasks/lib/timeline/timeline-store.js)|`packages/addons/tasks/lib/timeline/timeline-store.js`|
|[timeline-migration.js](../packages/addons/tasks/lib/timeline/timeline-migration.js)|`packages/addons/tasks/lib/timeline/timeline-migration.js`|
|[timeline-sync.js](../packages/addons/tasks/lib/timeline/timeline-sync.js)|`packages/addons/tasks/lib/timeline/timeline-sync.js`|
|[task-timelines.js](../packages/addons/tasks/lib/timeline/task-timelines.js)|`packages/addons/tasks/lib/timeline/task-timelines.js`|
|[stats.js](../packages/addons/tasks/lib/stats/stats.js)|`packages/addons/tasks/lib/stats/stats.js`|
|[stats-today.js](../packages/addons/tasks/lib/stats/stats-today.js)|`packages/addons/tasks/lib/stats/stats-today.js`|
|[activity-calendar.js](../packages/addons/tasks/lib/stats/activity-calendar.js)|`packages/addons/tasks/lib/stats/activity-calendar.js`|
|[overview.js](../packages/addons/tasks/lib/stats/overview.js)|`packages/addons/tasks/lib/stats/overview.js`|
|[tagging.js](../packages/addons/tasks/lib/tagging/tagging.js)|`packages/addons/tasks/lib/tagging/tagging.js`|
|[tag-options.js](../packages/addons/tasks/lib/tagging/tag-options.js)|`packages/addons/tasks/lib/tagging/tag-options.js`|
|[backup.js](../packages/addons/tasks/lib/infra/backup.js)|`packages/addons/tasks/lib/infra/backup.js`|
|[sync.js](../packages/addons/tasks/lib/infra/sync.js)|`packages/addons/tasks/lib/infra/sync.js`|
|[data.js](../packages/addons/tasks/lib/infra/data.js)|`packages/addons/tasks/lib/infra/data.js`|
|[config.js](../packages/addons/tasks/lib/infra/config.js)|`packages/addons/tasks/lib/infra/config.js`|

### tasks/client

|迁移前文件名（链接到现文件）|迁移后路径|
|---|---|
|[client.src.cjs](../packages/addons/tasks/client/client.src.cjs)|`packages/addons/tasks/client/client.src.cjs`|
|[tasks-view.cjs](../packages/addons/tasks/client/views/tasks-view.cjs)|`packages/addons/tasks/client/views/tasks-view.cjs`|
|[stats.cjs](../packages/addons/tasks/client/views/stats.cjs)|`packages/addons/tasks/client/views/stats.cjs`|
|[timeline-view.cjs](../packages/addons/tasks/client/views/timeline-view.cjs)|`packages/addons/tasks/client/views/timeline-view.cjs`|
|[config.cjs](../packages/addons/tasks/client/views/config.cjs)|`packages/addons/tasks/client/views/config.cjs`|
|[data.cjs](../packages/addons/tasks/client/views/data.cjs)|`packages/addons/tasks/client/views/data.cjs`|
|[styles.cjs](../packages/addons/tasks/client/ui/styles.cjs)|`packages/addons/tasks/client/ui/styles.cjs`|
|[copy.cjs](../packages/addons/tasks/client/ui/copy.cjs)|`packages/addons/tasks/client/ui/copy.cjs`|
|[icons.cjs](../packages/addons/tasks/client/ui/icons.cjs)|`packages/addons/tasks/client/ui/icons.cjs`|
|[body-mode.cjs](../packages/addons/tasks/client/ui/body-mode.cjs)|`packages/addons/tasks/client/ui/body-mode.cjs`|
|[date-filter.cjs](../packages/addons/tasks/client/ui/date-filter.cjs)|`packages/addons/tasks/client/ui/date-filter.cjs`|
|[tagfilter.cjs](../packages/addons/tasks/client/ui/tagfilter.cjs)|`packages/addons/tasks/client/ui/tagfilter.cjs`|
|[highlight.cjs](../packages/addons/tasks/client/ui/highlight.cjs)|`packages/addons/tasks/client/ui/highlight.cjs`|
|[task-item.cjs](../packages/addons/tasks/client/item/task-item.cjs)|`packages/addons/tasks/client/item/task-item.cjs`|
|[recent-columns.cjs](../packages/addons/tasks/client/item/recent-columns.cjs)|`packages/addons/tasks/client/item/recent-columns.cjs`|
|[difficulty-field.cjs](../packages/addons/tasks/client/item/difficulty-field.cjs)|`packages/addons/tasks/client/item/difficulty-field.cjs`|
|[create-modal.cjs](../packages/addons/tasks/client/modals/create-modal.cjs)|`packages/addons/tasks/client/modals/create-modal.cjs`|
|[edit-modal.cjs](../packages/addons/tasks/client/modals/edit-modal.cjs)|`packages/addons/tasks/client/modals/edit-modal.cjs`|
|[batch-modal.cjs](../packages/addons/tasks/client/modals/batch-modal.cjs)|`packages/addons/tasks/client/modals/batch-modal.cjs`|
|[table-picker.cjs](../packages/addons/tasks/client/modals/table-picker.cjs)|`packages/addons/tasks/client/modals/table-picker.cjs`|
|[ownership-fields.cjs](../packages/addons/tasks/client/modals/ownership-fields.cjs)|`packages/addons/tasks/client/modals/ownership-fields.cjs`|
|[ownership.cjs](../packages/addons/tasks/client/modals/ownership.cjs)|`packages/addons/tasks/client/modals/ownership.cjs`|
|[task-timeline-modal.cjs](../packages/addons/tasks/client/timeline/task-timeline-modal.cjs)|`packages/addons/tasks/client/timeline/task-timeline-modal.cjs`|
|[timeline-add-members.cjs](../packages/addons/tasks/client/timeline/timeline-add-members.cjs)|`packages/addons/tasks/client/timeline/timeline-add-members.cjs`|
|[timeline-controls.cjs](../packages/addons/tasks/client/timeline/timeline-controls.cjs)|`packages/addons/tasks/client/timeline/timeline-controls.cjs`|
|[timeline-copy.cjs](../packages/addons/tasks/client/timeline/timeline-copy.cjs)|`packages/addons/tasks/client/timeline/timeline-copy.cjs`|
|[timeline-members.cjs](../packages/addons/tasks/client/timeline/timeline-members.cjs)|`packages/addons/tasks/client/timeline/timeline-members.cjs`|
|[timeline-merge.cjs](../packages/addons/tasks/client/timeline/timeline-merge.cjs)|`packages/addons/tasks/client/timeline/timeline-merge.cjs`|
|[timeline-styles.cjs](../packages/addons/tasks/client/timeline/timeline-styles.cjs)|`packages/addons/tasks/client/timeline/timeline-styles.cjs`|
|[charts.cjs](../packages/addons/tasks/client/stats/charts.cjs)|`packages/addons/tasks/client/stats/charts.cjs`|
|[heatmap.cjs](../packages/addons/tasks/client/stats/heatmap.cjs)|`packages/addons/tasks/client/stats/heatmap.cjs`|
|[heatmap-model.cjs](../packages/addons/tasks/client/stats/heatmap-model.cjs)|`packages/addons/tasks/client/stats/heatmap-model.cjs`|
|[heatmap-styles.cjs](../packages/addons/tasks/client/stats/heatmap-styles.cjs)|`packages/addons/tasks/client/stats/heatmap-styles.cjs`|
|[today.cjs](../packages/addons/tasks/client/stats/today.cjs)|`packages/addons/tasks/client/stats/today.cjs`|
|[activity-filter.cjs](../packages/addons/tasks/client/stats/activity-filter.cjs)|`packages/addons/tasks/client/stats/activity-filter.cjs`|

### sites/lib

|迁移前文件名（链接到现文件）|迁移后路径|
|---|---|
|[index.js](../packages/addons/sites/lib/index.js)|`packages/addons/sites/lib/index.js`|
|[client.js](../packages/addons/sites/lib/client.js)|`packages/addons/sites/lib/client.js`（生成物，原位）|
|[db.js](../packages/addons/sites/lib/db/db.js)|`packages/addons/sites/lib/db/db.js`|
|[accounts-model.js](../packages/addons/sites/lib/domain/accounts-model.js)|`packages/addons/sites/lib/domain/accounts-model.js`|
|[accounts.js](../packages/addons/sites/lib/domain/accounts.js)|`packages/addons/sites/lib/domain/accounts.js`|
|[sites-mappings.js](../packages/addons/sites/lib/domain/sites-mappings.js)|`packages/addons/sites/lib/domain/sites-mappings.js`|
|[sites.js](../packages/addons/sites/lib/domain/sites.js)|`packages/addons/sites/lib/domain/sites.js`|
|[vault.js](../packages/addons/sites/lib/domain/vault.js)|`packages/addons/sites/lib/domain/vault.js`|
|[tree.js](../packages/addons/sites/lib/tree/tree.js)|`packages/addons/sites/lib/tree/tree.js`|
|[stats.js](../packages/addons/sites/lib/stats/stats.js)|`packages/addons/sites/lib/stats/stats.js`|
|[overview.js](../packages/addons/sites/lib/stats/overview.js)|`packages/addons/sites/lib/stats/overview.js`|
|[backup.js](../packages/addons/sites/lib/infra/backup.js)|`packages/addons/sites/lib/infra/backup.js`|
|[config.js](../packages/addons/sites/lib/infra/config.js)|`packages/addons/sites/lib/infra/config.js`|
|[data.js](../packages/addons/sites/lib/infra/data.js)|`packages/addons/sites/lib/infra/data.js`|
|[sync.js](../packages/addons/sites/lib/infra/sync.js)|`packages/addons/sites/lib/infra/sync.js`|

### sites/client

|迁移前文件名（链接到现文件）|迁移后路径|
|---|---|
|[client.src.cjs](../packages/addons/sites/client/client.src.cjs)|`packages/addons/sites/client/client.src.cjs`|
|[config.cjs](../packages/addons/sites/client/views/config.cjs)|`packages/addons/sites/client/views/config.cjs`|
|[data.cjs](../packages/addons/sites/client/views/data.cjs)|`packages/addons/sites/client/views/data.cjs`|
|[stats.cjs](../packages/addons/sites/client/views/stats.cjs)|`packages/addons/sites/client/views/stats.cjs`|
|[copy.cjs](../packages/addons/sites/client/ui/copy.cjs)|`packages/addons/sites/client/ui/copy.cjs`|
|[styles.cjs](../packages/addons/sites/client/ui/styles.cjs)|`packages/addons/sites/client/ui/styles.cjs`|
|[tagfilter.cjs](../packages/addons/sites/client/ui/tagfilter.cjs)|`packages/addons/sites/client/ui/tagfilter.cjs`|
|[charts.cjs](../packages/addons/sites/client/stats/charts.cjs)|`packages/addons/sites/client/stats/charts.cjs`|

### tags/lib

|迁移前文件名（链接到现文件）|迁移后路径|
|---|---|
|[index.js](../packages/addons/tags/lib/index.js)|`packages/addons/tags/lib/index.js`|
|[client.js](../packages/addons/tags/lib/client.js)|`packages/addons/tags/lib/client.js`（生成物，原位）|
|[db.js](../packages/addons/tags/lib/db/db.js)|`packages/addons/tags/lib/db/db.js`|
|[tags.js](../packages/addons/tags/lib/domain/tags.js)|`packages/addons/tags/lib/domain/tags.js`|
|[stats.js](../packages/addons/tags/lib/stats/stats.js)|`packages/addons/tags/lib/stats/stats.js`|
|[backup.js](../packages/addons/tags/lib/infra/backup.js)|`packages/addons/tags/lib/infra/backup.js`|
|[config.js](../packages/addons/tags/lib/infra/config.js)|`packages/addons/tags/lib/infra/config.js`|
|[data.js](../packages/addons/tags/lib/infra/data.js)|`packages/addons/tags/lib/infra/data.js`|
|[sync.js](../packages/addons/tags/lib/infra/sync.js)|`packages/addons/tags/lib/infra/sync.js`|

### tags/client

|迁移前文件名（链接到现文件）|迁移后路径|
|---|---|
|[client.src.cjs](../packages/addons/tags/client/client.src.cjs)|`packages/addons/tags/client/client.src.cjs`|
|[config.cjs](../packages/addons/tags/client/views/config.cjs)|`packages/addons/tags/client/views/config.cjs`|
|[data.cjs](../packages/addons/tags/client/views/data.cjs)|`packages/addons/tags/client/views/data.cjs`|
|[stats.cjs](../packages/addons/tags/client/views/stats.cjs)|`packages/addons/tags/client/views/stats.cjs`|
|[charts.cjs](../packages/addons/tags/client/stats/charts.cjs)|`packages/addons/tags/client/stats/charts.cjs`|
|[top-tags.cjs](../packages/addons/tags/client/stats/top-tags.cjs)|`packages/addons/tags/client/stats/top-tags.cjs`|

### storage/lib

|迁移前文件名（链接到现文件）|迁移后路径|
|---|---|
|[index.js](../packages/addons/storage/lib/index.js)|`packages/addons/storage/lib/index.js`|
|[client.js](../packages/addons/storage/lib/client.js)|`packages/addons/storage/lib/client.js`（生成物，原位）|
|[db.js](../packages/addons/storage/lib/db/db.js)|`packages/addons/storage/lib/db/db.js`|
|[storage.js](../packages/addons/storage/lib/domain/storage.js)|`packages/addons/storage/lib/domain/storage.js`|
|[deletion.js](../packages/addons/storage/lib/domain/deletion.js)|`packages/addons/storage/lib/domain/deletion.js`|
|[tags.js](../packages/addons/storage/lib/domain/tags.js)|`packages/addons/storage/lib/domain/tags.js`|
|[backup.js](../packages/addons/storage/lib/infra/backup.js)|`packages/addons/storage/lib/infra/backup.js`|
|[config.js](../packages/addons/storage/lib/infra/config.js)|`packages/addons/storage/lib/infra/config.js`|
|[data.js](../packages/addons/storage/lib/infra/data.js)|`packages/addons/storage/lib/infra/data.js`|

### storage/client

|迁移前文件名（链接到现文件）|迁移后路径|
|---|---|
|[client.src.cjs](../packages/addons/storage/client/client.src.cjs)|`packages/addons/storage/client/client.src.cjs`|
|[config.cjs](../packages/addons/storage/client/views/config.cjs)|`packages/addons/storage/client/views/config.cjs`|
|[data.cjs](../packages/addons/storage/client/views/data.cjs)|`packages/addons/storage/client/views/data.cjs`|
|[stats.cjs](../packages/addons/storage/client/views/stats.cjs)|`packages/addons/storage/client/views/stats.cjs`|
|[records.cjs](../packages/addons/storage/client/views/records.cjs)|`packages/addons/storage/client/views/records.cjs`|
|[config-copy.cjs](../packages/addons/storage/client/ui/config-copy.cjs)|`packages/addons/storage/client/ui/config-copy.cjs`|
|[data-columns.cjs](../packages/addons/storage/client/ui/data-columns.cjs)|`packages/addons/storage/client/ui/data-columns.cjs`|
|[icons.cjs](../packages/addons/storage/client/ui/icons.cjs)|`packages/addons/storage/client/ui/icons.cjs`|
|[selection.cjs](../packages/addons/storage/client/ui/selection.cjs)|`packages/addons/storage/client/ui/selection.cjs`|
|[styles.cjs](../packages/addons/storage/client/ui/styles.cjs)|`packages/addons/storage/client/ui/styles.cjs`|
|[ui.cjs](../packages/addons/storage/client/ui/ui.cjs)|`packages/addons/storage/client/ui/ui.cjs`|
|[card.cjs](../packages/addons/storage/client/item/card.cjs)|`packages/addons/storage/client/item/card.cjs`|
|[editor.cjs](../packages/addons/storage/client/modals/editor.cjs)|`packages/addons/storage/client/modals/editor.cjs`|

### shell/src

|迁移前文件名（链接到现文件）|迁移后路径|
|---|---|
|[index.ts](../packages/shell/src/index.ts)|`packages/shell/src/index.ts`|
|[actions.ts](../packages/shell/src/actions/actions.ts)|`packages/shell/src/actions/actions.ts`|
|[action-output.ts](../packages/shell/src/actions/action-output.ts)|`packages/shell/src/actions/action-output.ts`|
|[capabilities.ts](../packages/shell/src/actions/capabilities.ts)|`packages/shell/src/actions/capabilities.ts`|
|[task-targets.ts](../packages/shell/src/actions/task-targets.ts)|`packages/shell/src/actions/task-targets.ts`|
|[sync.ts](../packages/shell/src/sync/sync.ts)|`packages/shell/src/sync/sync.ts`|
|[sync-conflicts.ts](../packages/shell/src/sync/sync-conflicts.ts)|`packages/shell/src/sync/sync-conflicts.ts`|
|[sync-incoming.ts](../packages/shell/src/sync/sync-incoming.ts)|`packages/shell/src/sync/sync-incoming.ts`|
|[sync-types.ts](../packages/shell/src/sync/sync-types.ts)|`packages/shell/src/sync/sync-types.ts`|
|[sync-values.ts](../packages/shell/src/sync/sync-values.ts)|`packages/shell/src/sync/sync-values.ts`|
|[audit.ts](../packages/shell/src/infra/audit.ts)|`packages/shell/src/infra/audit.ts`|
|[backup.ts](../packages/shell/src/infra/backup.ts)|`packages/shell/src/infra/backup.ts`|
|[network.ts](../packages/shell/src/infra/network.ts)|`packages/shell/src/infra/network.ts`|
|[zip.ts](../packages/shell/src/infra/zip.ts)|`packages/shell/src/infra/zip.ts`|
|[host-types.ts](../packages/shell/src/types/host-types.ts)|`packages/shell/src/types/host-types.ts`|

## 迁移时新增的基础叶模块

下列是从原文件抽出的代码，不改变现有文件的迁移映射：

|新增目标|职责|依赖约束|
|---|---|---|
|`packages/addons/tasks/lib/db/timeline-schema.js`|原样保存 TIMELINE_DDL，由建表代码和时间线存储引用|不得引用领域层|
|`packages/addons/tasks/lib/db/ownership-path.js`|ownershipError 与 pathFromMap 纯函数，原任务模型模块 re-export 保持原 API|不得引用领域层，不执行数据库写入|
|`packages/addons/sites/lib/db/accounts-schema.js`|原样保存 ACCOUNT_DDL 与 EXTERNAL_DDL，由数据库初始化引用，domain/accounts.js re-export 保持原 API|不得引用领域层，不改变 DDL 或数据库结构|

## 迁移前置与顺序

1. 先提交本基建与当前实体任务的完整基线；保存动作 schema、DB schema、测试清单。默认结构审计在旧扁平目录上失败是预期，不能添加永久忽略。
2. tasks/lib：仅作路径搬迁和 import 重写。允许两项最小职责抽取以消除数据库层反向依赖：将 timeline-store.js 中 TIMELINE_DDL 原值移入 db/timeline-schema.js，db-core 与 timeline-store 引用该叶模块；将 ownershipError/pathFromMap 纯函数移入 db/ownership-path.js，原 task/model/task-ownership-path.js re-export 保留 API。两模块均为数据库基础叶模块，不依赖 task/timeline/stats；不得改变 DDL、路径计算或错误语义。task-transaction.js 留 task/write，保留其错误转换逻辑。db-legacy 若依赖上层，逐条核对后将真正的数据库工具归入db，不能加审计白名单。
3. 依次 tasks/client、sites、tags、storage、shell；每域单独提交可回滚；保留原文件名、对外入口、action/schema和数据格式。shell 迁移 src 后 tsc 生成 lib，不能直接移动编译产物。shell-dist 只重建。
4. 重写源码/测试（包括VM require白名单）、打包脚本和现行文档中的精确路径；历史归档不伪造当时行号。对应行数预算仅转移路径，不抬高上限。

## 校验与验收

- `node scripts/audit-structure.mjs` 默认检查全部9个scope，未知/空scope报错；迁移中仅可显式 `--scope tasks/lib` 或逗号列表检查已完成部分。局部成功不代表全仓完成；E2E始终执行默认全扫描。
- `node scripts/test-structure.mjs` 在临时目录构造正反例，验证根白名单、文件数、深度、ESM/re-export/CommonJS/dynamic import依赖方向、注释不误报、未知scope、缺失根、无scope全检查及预算不增长。不得往工作树添加故意违规文件。
- action审计递归扫描lib，不能移动后失明；行数审计递归覆盖.js/.cjs/.mjs/.ts/.tsx并显式排除生成物。冻结预算通过精确映射转移，旧新文件同时存在或目标丢失均报错，不能用重复文件继承预算。
- 每批运行本地ESLint、构建、audit-actions、audit-lines、相应scope结构审计与领域测试；最终运行默认audit:structure与完整E2E。测试数量使用当前脚本清单，不固定为旧任务描述中的46个。行数告警不得增加。
- 结构测试的函数测试与真实CLI退出码均须验证；action列表/schema和DB schema与基线一致。
- 生成完整安装包，验证package.files递归包含所有lib子目录，在临时profile导入入口和加载UI；真实桌面实例安装、重启按会话授权执行，禁止手工拷部分文件。安装验证不可触碰生产DB，发布/push不属于目录重构。

纯路径重构不触发action契约版本升级；若必要兼容边界有语义变化，拆成独立任务，不混入本次迁移。
