# Storage 1.2.0 真实临时实例验收

2026-11-09。主实例50120/3080及desktop profile未操作。临时profile storage-browser-20261109，独立WB_HOME=/tmp/dsh-storage-bulk-20261109/workbench，端口60059。完整安装host/tasks/tags/sites/storage，导入烟测成功；初次运行capabilities：host0.5.6、storage1.2.0/action16、tags1.6.7/action17、tasks2.10.11/action42、sites1.8.3/action39，warnings和missingRequires均空。全部17条物品为新建隔离fixture。

## 通过项

- 零选择删除禁用；勾选17/16/15三条、卡片点击切换选择正常。3张卡片selected类、1px实线描边和灰底，未选卡白底；选择态卡片无编辑/删除按钮。工具条全选/退出/删除高度均32px；原生checkbox本身13px，整张卡片可点击，不能将checkbox本体说成32px。
- 确认框显示3名称和总数。最终版本点击精确取消按钮后bulkDelete捕获记录为空、3选择保留。
- 一次受控客户端传输失败注入（仅拦截下一次bulkDelete返回HTTP500，不是SQLite事务故障）：弹窗显示错误，3选择保留，真实storage.list仍17条。移除一次性注入后重试真实后端HTTP200，deleted=3/skipped=0；列表14条，选择模式与弹窗退出，提示已删除3条跳过0。
- 搜索改变后1.0ms事件循环回读已选0（早于250ms防抖）；翻页后1.2ms回读已选0、旧卡片0。最初requestAnimationFrame等待在后台浏览器超时，改用setTimeout(0)测量，未据此报产品故障。
- 14条/12每页的末页2条，全选后确认deleted=2/skipped=0；自动回到12条物品·1/1，12卡片、上下页均禁用，选择与弹窗退出。真实后端总数12。
- 修复前干净单次Esc会同时关闭确认框并退出选择（工作台仍在）。修复后完整重装重启：首次Esc仅关modal且保留3选中，第二次Esc退出选择，工作台仍在，PASS。
- 修复后统计tab和统计页h2均为“统计”。最终console为空。

## 截图

两张均通过目视核对，且归档前后file确认PNG，1400×808。截图工具曾返回滞后帧，未采用那些文件作为证据。

- [选中三条及工具条](selected-three.png)
- [三条冻结名称确认框](confirm-three.png)

## 边界与过程记录

- dsh_browser_do默认autoDismiss会在点击取消之前自动关闭弹窗，再模糊匹配“取消选择”；这次受工具干扰的尝试不算产品缺陷。之后禁用autoDismiss并使用已观察精确控件。
- 并行构建期间，未重装的临时页面统计名称和组件状态发生变化，存在热更新干扰。父agent暂停构建后完整重装重启继续，通过项以稳定实例为准；不推断全部历史回退的原因。
- 未在此轮真实浏览器单独注入事务失败、skipped目标不存在、忙碌时Esc、Shift区间选择、英文文案和窄屏；对应自动测试由父agent负责，不冒称已做。
- HTTP原始证据：[results.json](/tmp/dsh-storage-bulk-20261109/results.json)。
- 初始job bash-b6d00f732cda4952已kill/collect。最终job bash-240e27f6e8484af3曾留供后续tasks验收；后续开始时已不在任务注册表，60059无监听，无法补收退出记录。后续新建的任务验收进程已kill/collect，临时标签页已关闭，详见[任务验收清理记录](../tasks-feeling-20261109/verification.md)。
