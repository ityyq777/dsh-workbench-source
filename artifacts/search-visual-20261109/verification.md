# Storage 1.3.1 / Tasks 2.12.0 最终隔离浏览器验收

2026-11-09：本批功能验证通过，四张要求画面已逐张核实归档。限制：storage宽度为内容容器宽，非顶层手机视口；active仅CSS规则；双击编辑通过真实DOM派发dblclick而非两次物理指针。未修改源码、提交代码或操作主实例50120/3080及desktop真实DB。

## 安装与真实后端

复用临时profile storage-browser-20261109，使用全新WB_HOME=/tmp/dsh-search-visual-20261109/workbench，端口60059。首轮及Unicode修复后均完整安装宿主+tasks/tags/sites/storage五包，安装exit0，五入口import成功。最终host0.5.7/tasks2.12.0/storage1.3.1/tags1.6.7/sites1.9.0；runtime actions43/16/17/40，全部enabled=true、warnings=[]、missingRequires=[]。

最终安装的tasks client与当前源码构建SHA256完全相同：b2076e7e8b0debe59b798b94d5a0be18c17de56cdbf9c96d7b62cf95170ffe61。fixture均经真实HTTP动作创建，未直接写DB。

## 储物结果

- 12个记录按钮computed border-width=0、height=32px；主新增背景rgb(15,17,21)，其余默认透明。
- 真实hover工具报pointer timeout后，下一次DOM观察确认:hover=true且浅底oklab(... / 0.06)，故未重复操作。
- 键盘Tab使编辑按钮:focus-visible=true，outline rgb(15,17,21) solid 2px，与accent token一致。
- active只验证CSSOM规则使用--wb-btn-active-bg，主按钮使用84%主色；未持续按住实测。
- 库存svg→数量span→单位small，实际x依次递增。空库存badge仅svg+—，不附单位small；下方独立元信息仍保留“单位：盒”。
- 内容容器1280与360宽时scrollWidth=clientWidth，截图分别对应五列网格中的3条记录及窄单列。不是顶层手机视口测试。

## 任务搜索与编辑

三条fixture分别只有title/description/review含HighlightProbe：UI搜索恰好3条，每字段一个红底mark；highlightprobe/HIGHLIGHTPROBE也各3。%/_/反斜线各唯一正确目标1条，不存在词0条，普通负对照未误命中。[ASCII逐次结果](ascii-queries.json)。

列表/卡片两态共六次对mark子节点派发dblclick，分别进入正确title input或description/review textarea，Esc取消。此为浏览器真实组件事件验证，非双次物理指针点击。关闭title命中任务后class=wbt-item wbt-card closed、computed opacity=1；最终列表closed条目同样opacity=1。

Unicode最终包复验：[逐次结果](unicode-queries.json)。fixture一title=Unicode É mixed、description=accent é only、review=É；fixture二title=Unicode Σ mixed、description=greek σ only、review=Σ。搜索é/σ各返回对应1条，只有description小写字符被mark；title/review大写字符不高亮。反向搜索É/Σ各只有title与review两个mark，不高亮description小写字符。最终ASCII HighlightProbe回归仍3条、三字段各一个mark。

## 真实主题与对比度

通过真实body[data-ds-dark-theme]属性切换，独立后续调用确认稳定computed，而非只假定切换成功。未操作用户设置菜单，结束前恢复属性。

|主题|根前景/brand token|mark前景|mark背景|对比度|closed opacity|
|---|---|---|---|---|---|
|light|rgb(15,17,21) / #0f1115|rgb(136,19,55)|rgb(255,228,230)|7.9684:1|1|
|dark|rgb(249,250,251) / #f9fafb|rgb(136,19,55)|rgb(255,228,230)|7.9684:1|1|

mark前景背景均不透明，两态都超过4.5:1。最终console=[]。

## 可采信截图与证据

- [储物1280内容宽](storage-1280.png)
- [储物360内容宽](storage-360.png)
- [任务卡片三字段高亮](tasks-cards.png)：Unicode修复前同版本样式，ASCII行为未变化。
- [最终包任务列表三字段高亮](tasks-list.png)：包含已关闭title命中条目。

四张均read_image目视确认实际内容后归档，原始文件为PNG 1400×808；没有把read_image归一化JPEG当作原始编码。截图工具存在滞后旧帧，原始下载名与画面一度不符，归档按实际画面重新命名；错误主页或错域图未纳入证据。窄图显示的是360内容容器，整幅画布仍1400×808。

[首轮fixture/DOM证据](pre-final-results.json)、[最终runtime/Unicode fixture/主题证据](final-results.json)。最终验证中无新增产品阻断问题。

## 清理

首轮job bash-24594d3eaef441e0在最终复验开始时工具返回unknown job；job_list为空且lsof60059无监听(exit1)，确认无旧端口进程，但无法收集已丢失的job退出状态，不能声称该job已由本次kill成功。

最终新job bash-5ba905a527fd4ca2已job_kill并job_output收集到status=killed。自己的临时浏览器tab已关闭。临时profile及隔离DB保留复查；未终止无关进程。
