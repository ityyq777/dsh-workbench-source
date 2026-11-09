# 任务归属自动化验收记录

2026-11-09，最终后端稳定及弹窗关闭保护修复后的源码。

## 构建与版本

完整 build、客户端重建及 dist-shell 通过。host 0.6.0、SDK 0.2.0、tasks 3.0.0、tags 1.6.8、sites 1.9.1、storage 1.3.2。四业务域 actions 分别为 45/17/40/16，含宿主合计 127。宿主 package、导出常量、运行服务及 capabilities list/get 版本一致性专测通过。

## 最终命令与结果

`node scripts/e2e.mjs && node scripts/test-config.mjs && node scripts/test-nodeps.mjs && node scripts/audit-actions.mjs && node scripts/audit-lines.mjs` 整体退出码 0。

- e2e：包括后端归属、真实 SQLite 双连接并发、UI 22 组、宿主归属映射、review 56 组、search 23 组、restart、客户端、四域数据、标签/站点/储物、备份还原，全部通过。
- 并发：同路径只建一套节点、同 key 只建一任务、无 key 同标题可重复、写锁忙返回可重试诊断且不新增同步日志。
- 事务：无目标零写；节点、任务、标签、重启、同步日志中途失败全部回滚；dryRun 无持久写入或事件；去重不另建空路径。
- UI：普通/时间线/重启初始空目标；完整路径职责展示；失效清空；失败保留正文；预检与写入期间遮罩、关闭按钮、取消及 Escape 均受同步 pending 锁保护。
- config 与三个缺可选插件场景通过。
- action schema、版本与文档审计零问题。
- 源行数审计退出码 0，仅保留 sites 客户端原冻结 1259 行告警，无额度增长。

## 同步边界修复复验

14:44 后补充最终 ordered 树的同级重名检查：缺失父节点、软删父节点和不可达循环组件挂根后产生碰撞时，首次 reconcile 即返回 PATH_AMBIGUOUS，输入 JSON 不变；无碰撞孤儿保持既有归根行为。修复后重新运行后端专测、backup 和 git diff --check，整体退出码 0。

## 范围与限制

测试使用内存库或临时目录，没有迁移生产历史任务。并发保障限同一本地 SQLite 库；跨设备同名冲突报告后需人工处理。真实浏览器、最终安装和提交证据独立记录，本文件不代替其验收。
