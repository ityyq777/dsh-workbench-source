# 任务归属引导真实页面验收准备

状态：只准备，未安装或启动旧bundle、未创建DB fixture。等待父agent最终build信号；不修改源码、不提交。

## 隔离安装

前轮没有持久安装脚本，是通过managed bash逐条执行。已复核README安装方式和前轮完整安装命令：五个包使用绝对file路径整包--force安装，不能挑文件拷贝。新profile task-ownership-20261109；新WB_HOME=/tmp/dsh-task-ownership-20261109/workbench。最终信号后以dsh task-ownership-20261109 --from-default-profile web --help初始化，完整安装shell-dist及tasks/tags/sites/storage，核对五入口import、源码/安装client SHA256及runtime capabilities。启动使用managed background job和--no-open --port60059，先核对端口无人监听；记录jobId，不启用普通后台shell。

主实例50120/3080及当前GUI、desktop真实DB均不动。新profile设置/默认树不假设与旧profile一致。只经该实例真实动作创建fixture，先查最终actions.help，不猜开发中的新参数；不得加载生产插件做只读检查。

## Fixture与步骤

1. 两组各含同名共享名称表，职责不同；甲组另有纠正目标表；显式目标创建一个P7来源任务。路径/描述便于证实完整面包屑可区分，组不可选。
2. 普通/时间线/重启逐入口打开，确认目标初始为空且未选无法提交；来源/当前树仅提示，不算用户已选。填写标题/描述/感受后手动选完整路径与职责，提交回执和真实tasks.get归属一致。
3. 新路径逐段职责空值应阻断；完整路径、组/末表类型、描述及明确确认可见。取消新路径/取消任务后通过真实读动作比对节点和任务无新增。
4. 中段既有TABLE冲突，错误保留标题/描述/感受和可恢复目标选择。只在本临时页一次拦截tasks.create为HTTP500（不转发），检查正文保留且无写入，恢复fetch再提交真实成功；与真实后端冲突用例区分。
5. 选择目标后通过本隔离实例动作删除该测试表并触发树刷新，目标清空并提示，不自动回退。单独新建临时目标，避免影响其余fixture。
6. 成功toast/详情显示实际完整归属，编辑任务改到纠正目标，真实tasks.get核对tableId/tablePath/pathSegments/description；只改标题应保留原归属。
7. 少量可信截图：初始空目标、完整路径与职责、新路径确认、成功/纠正归属。逐张read_image核对；遇旧帧或导航变化短步重映射，不锁用户导航，不反复追图。

所有dsh_browser交互先映射，do使用autoDismiss:false。报告区分实际UI、真实backend回读与注入失败、未测项，不代替父agent的事务/批量/备份同步测试。

## 需要父agent提供

最终build/dist完成信号与预期host/tasks及其他包版本/actionCount；若实现入口或正式schema与规范不同，请说明最终采用接口及剩余限制。验证期间尽量暂停client rebuild，减少bundle自动变化。无需生产安装、无需额外用户授权。

## 清理

最终kill并collect所有本轮managed jobs，确认status；关闭自己的tab，恢复浏览器hook/临时样式。若job登记已丢失，核对测试端口并如实记录，不能伪称成功收集。当前job_list为空。临时profile/隔离DB留复查。
