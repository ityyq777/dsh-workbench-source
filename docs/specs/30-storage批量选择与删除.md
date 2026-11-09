# 储物批量选择与删除（storage 1.2.0）

对应反馈 `01a1bea1-8552-751f-a13b-03395e746a08`。仅修改 storage，不改变任务模块。

## 交互边界

- 点击 sm「选择」进入空选择态；卡片左上 checkbox、选中描边和底色提供反馈。卡片点击切换选择，拦截图片/标签/备注内部点击；隐藏单卡编辑删除。Shift+点击将锚点到当前卡片设为当前操作的选中/取消状态。
- 底部浮动工具条显示数量、全选本页、退出、删除；零选择时删除禁用。选择工具条以 children 扩展批量操作，不将未来业务耦合到选择 hook。Esc 在未打开确认框且未提交时退出。
- **仅当前页选择**：搜索输入（不用等250ms防抖）、标签、排序字段/方向、页码、每页条数或刷新改变时立即清空选择。scope 同时绑定列表响应与选择；旧请求 cleanup 后不能写入列表，返回旧 scope 也不恢复之前选择。加载阶段无旧卡片可选。
- 删除弹窗冻结 `{id,name}` 目标快照，显示总数和前10名称；不因列表更新改变已确认目标。始终确认，不受 `ui.confirmDelete=false` 影响。取消/关闭不请求后端。危险按钮显式提交。同步 pending ref 与 busy 状态防连击；提交中禁止再次确认、取消及选卡。失败留在弹窗并保留选择，可重试。成功显示 deleted/skipped，退出选择并刷新；最后一页被删空后回到有效页。

## action 契约与事务

`storage.bulkDelete({ids})` 要求 ids 数组，最多500个输入元素（去重前计限）；接受非空字符串与有限数值，统一转字符串并 trim 后按首次出现顺序去重。空数组合法。无效参数在启动事务前拒绝。

返回 `{deleted, skipped, ids}`：deleted 为实际软删除数量；skipped 为去重后不存在或已删除的数量；ids 仅列出实际删除的规范化 ID。重复调用不增加 revision、不重复写日志、不重复发事件。

`lib/deletion.js` 提供事务内单行原语 `deleteRow`，供单删和批删复用。批删使用一个 `BEGIN IMMEDIATE`，在同一时间戳下更新所有有效 storage 行（deleted_at/updated_at/rev）、软删可用标签映射、写同步日志；任何 SQL 或日志写入失败均 ROLLBACK，事务提交后才统一发 storage-changed。sync 来源遵守原日志不回写语义。

标签能力未安装或禁用时保留映射，沿用 storage.delete 行为；可用时只清理本条 storage 的映射，不影响其他域。storage 当前没有父子物品树，不臆造级联实体。无物理删除、无生产库迁移。

## 模块与版本

- `client/records.cjs`：列表请求、scope、批删调度和页面组装。
- `client/card.cjs`：卡片内容与选择态呈现。
- `client/selection.cjs`：选择 hook、工具条及冻结快照确认弹窗。
- `lib/deletion.js`：单行删除原语与批量事务。

以上均少于600行。新增 action 已同步 package toolActions、注册 schema、功能清单；package 两个版本、client 源版本及 lib/index.js 均为1.2.0。客户端产物由构建生成。

## 自动验证

- `node scripts/test-storage-bulk.mjs`：纯内存 SQLite，去重/空值/上限/幂等、两有效+一 missing 返回2/1、已删跳过、可选标签缺失/禁用、外域映射隔离、同步日志、晚期 storage 日志和映射日志失败注入，逐表对比零部分提交，删除最后页及搜索标签分页统计。
- `node scripts/test-storage-selection.mjs`：源码 VM+组件独立 hook/effect cleanup，选择/Shift/卡片拦截、零选择禁用、取消零调用、前10名称、翻页/搜索立即清空、Esc、刷新、失败重试、busy与同步双击保护。
- `node scripts/test-storage.mjs`、`node scripts/test-storage-cards.mjs`：现有 CRUD/schema/卡片回归。

UI 脚本验证状态和事件链，包括旧请求晚到不恢复选择、确认快照不随筛选变化、选3项其中1项已不存在返回 deleted=2/skipped=1。所有删除测试只用内存数据库。真实浏览器验收使用完整安装后的隔离临时实例，已验证取消零请求、传输失败保留选择后重试、17→14→12 条数量回读、筛选/翻页立即清空选择、末页删空回退，以及首次 Esc 只关确认框、第二次退出选择。统计 tab 和标题均为“统计”，控制台无错误；见 [真实验收记录](../../artifacts/storage-bulk-20261109/verification.md)。本轮未做真实窄屏、英文和忙碌时 Esc 验收，不能以组件测试替代这些检查。
