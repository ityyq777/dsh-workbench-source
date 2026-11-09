# Tasks 2.11.0 四状态感受真实浏览器验收

日期：2026-11-09。仅使用临时profile storage-browser-20261109、WB_HOME=/tmp/dsh-storage-bulk-20261109/workbench、端口60059。主实例50120/3080和desktop profile未操作，未修改源码或提交。完整安装五包，入口import全部成功。运行capabilities：host0.5.6；tasks2.11.0/action43；sites1.9.0/action40；storage1.2.0/action16；tags1.6.7/action17。各域enabled=true、warnings=[]、missingRequires=[]。

## 四状态结果

全部通过真实任务编辑入口验证，创建4条fixture及1条重启后继辅助任务。已重启状态通过source=2的真实重启链生成，未直接改数据库。

| 状态 | 弹窗字段顺序 | 保存后重开+后端读回 | 清空后重开+后端读回 | 截图 |
| --- | --- | --- | --- | --- |
| 0 已开启 | 标题、描述、感受、计划完成日期、优先级 | 一致 | 均为空字符串 | [已开启](active.png) |
| 1 已关闭 | 标题、描述、感受、计划完成日期、优先级 | 一致 | 均为空字符串 | [已关闭](closed.png) |
| 2 已完成 | 标题、描述、感受、难度；无优先级输入 | 一致 | 均为空字符串 | [已完成](done.png) |
| 3 已重启 | 标题、描述、感受、计划完成日期、优先级 | 一致 | 均为空字符串 | [已重启](restarted.png) |

四状态各执行填写→保存→重开→核对、清空→保存→重开→核对，共8次实际UI保存；每次均调用真实tasks.get确认review值。感受框均位于描述下方。全部截图逐张read_image目视核实正确状态、字段和填写内容；归档后file确认四张均实际PNG、1400×808。截图为填写状态，不冒称截图本身证明保存。

[原始回读与能力清单](results.json)包含四fixture ID和每次saved/backend/cleared/backendCleared结果。最终console为空。

## 限制与过程事实

- 开始导航时出现本轮操作序列外页面切换：已观察任务总览后，下一调用到储物数据页。父agent确认无其他浏览器代理调用；来源未确定。重新映射后在稳定页面用短连续操作完成，未锁定或拦截用户导航。不能将此归因于产品或用来解释全部历史回退。
- 关闭/重启状态优先级框显示0，而标签写1–10；此次需求明确非done显示优先级，感受保存与清空不受影响。优先级交互语义不是本轮验收范围。
- 未验证英文、移动端、异常保存失败或任务卡片双击感受入口；本轮范围是编辑弹窗四状态保存/清空。

## 清理

最终managed job bash-4c42ff2ee3bb41af已kill并job_output收集，状态killed；本任务唯一临时浏览器标签已关闭，job_list无running。此前保留的storage job bash-240e27f6e8484af3在本轮开始已unknown且job_list=[]，60059无监听，无法补收其退出记录；没有杀其他进程。初始storage job bash-b6d00f732cda4952已在上一轮kill/collect。临时profile与隔离DB保留作可复查数据。
