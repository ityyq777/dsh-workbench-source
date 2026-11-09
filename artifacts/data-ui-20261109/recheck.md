# Storage 1.1.0 只读复验

使用已安装临时 profile `storage-browser-20261109`；未构建、重装或修改源码。隔离 WB_HOME=/tmp/dsh-data-ui-20261109/workbench，临时端口60059；主实例50120/3080未触碰。

## 实际次数和结果

- 同一次数据页会话完成3次筛选结果断言：名称UI验收 + 库存1~2 → 4行；名称不存在XYZ + 库存空 → 0行；恢复前一组合 → 4行。三次断言均通过。后两次由临时fetch包装器记录真实storage.dataQuery HTTP200，首次数量断言通过但尚未安装fetch包装器，不声称已捕获该次HTTP状态。
- 索引→行数据切回尝试1次。两次工具点击均捕获匹配目标的trusted click；之后出现本轮工具序列外的trusted页签输入（记录、配置、数据、储物概览），来源未确定；最终4行断言失败时页面实际已在概览，故该次结果受并发交互影响，不能作为自动导航缺陷证据。未执行额外3轮，也不把它计为通过。
- 捕获的HTTP响应均200；console为空，window.__WB_HOST__.error()为null，未捕获slotError。
- 已安装宿主client/client.js第1198–1216行将工作台注册到main slot；未找到Escape/onClose/togglePanel关闭处理。不排除DSH框架层行为，不将此静态搜索作为无缺陷证明。

## 结论与边界

本轮未复现原来的自动回DSH首页现象。保留原偶发记录，不推断已经修复，也不能推断全部历史现象均由并发输入导致。当前索引切回验证受工具序列外输入干扰；停止继续点击，不覆盖可能的人工操作。

诊断原始事件和HTTP结果保存在[diagnostic-evidence.json](/tmp/dsh-data-ui-20261109/diagnostic-evidence.json)，不含认证token。当前受管测试job为`bash-7c9bbb12424b4d37`，收尾终止并收集结果；临时profile和DB留待后续1.2验收。截图归档后续先用file确认真实编码并保留对应后缀。
