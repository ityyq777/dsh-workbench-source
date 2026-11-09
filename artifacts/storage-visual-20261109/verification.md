# Storage 1.3.0 / Tasks 2.11.1 真实浏览器验收

2026-11-09。关键功能、最终修复对比度、四视图图标和三宽布局通过；8张主题截图与reduced-motion开启实测未完成，不能声称全部视觉验收通过。无源码编辑/commit，主实例50120/3080及desktop真实DB未操作。

## 安装与隔离

完整五包安装到storage-browser-20261109，WB_HOME=/tmp/dsh-storage-visual-20261109/workbench，端口60059；图片fixture端口60060。初版、按需图标精简版、最终对比度修复版均整包安装并重启。最终storage lib/client.js为174164字节。host0.5.7、tasks2.11.1、tags1.6.7、sites1.9.0、storage1.3.0入口导入成功；最终runtime capabilities host0.5.7，各域版本正确，actions分别43/17/40/16，enabled=true、warnings=[]、missingRequires=[]。

## 重启优先级

- P7原任务重启弹窗预填7，显示1–10提示。清空/0各立即inline error、aria-invalid=true、创建disabled；调用disabled按钮也没有tasks.create请求。恢复8后真实创建，后继01a1bec8-7d55-729d-baba-19378e3e94f7的priority=8，restartKey指向原任务。
- 已完成P0任务，配置默认优先级4真实保存后重启预填4，后继01a1becc-49db-7208-83b0-5911709b5cd1后端priority=4。
- 配置合法的默认0，已完成P0任务重启回退最小1，后继01a1becc-9360-7665-85d8-226bff770ce0后端priority=1。
- 配置数字框在blur提交；工具fill不自动focus，第一次fill后Tab未触发该字段blur，导航导致4未保存，产生名含后继4但priority1的辅助任务。此为测试步骤问题，不列产品缺陷。纠正为focus+blur并看到已保存后，上述正式4/min1结果成立。

## 最终对比度修复

发现旧版dark新增物品按钮白字白底并回传父agent，父修复为inverted foreground token；验证者未改源码。最终实际安装174164字节包。

| 主题 | computed前景 | computed背景 | WCAG对比度 |
| --- | --- | --- | --- |
| light | rgb(255,255,255) | rgb(15,17,21) | 18.8965:1 |
| dark | rgb(53,54,56) | rgb(249,250,251) | 11.5746:1 |

主题通过真实body[data-ds-dark-theme]临时属性切换，非菜单操作。相同JS调用内立即切换主题读样式曾拿到上一主题值，最终采用后续独立调用稳定读数；证据JSON中仅dark-settled和lightSettled为最终主题读数。结束前恢复属性。

## 图标与布局

最终包四视图真实SVG数量：统计6、记录45、配置6、数据6；每个视图四tabs均各1个SVG。记录icon-only编辑/删除均aria-label+title，32px；图片预览62px，有label/title。数据图片预览有aria-label“预览图片：2”，无title，属于可访问名称而非两属性俱全。

统计/记录/配置内容宽360/768/1280时scrollWidth分别等于clientWidth，无根横溢出。记录卡片grid分别1×360、2×377、5×约244.8px；编辑删除按钮32px，360下最右卡片按钮right345<360，toolbar图标按钮最右360，均在容器内。桌面带字按钮34–35px，不是所有按钮严格32px。

数据页真实同源GUI iframe（真实插件backend）验证：

| 视口 | document client/scroll | 数据根client/scroll | 主内容client/scroll |
| --- | --- | --- | --- |
| 360 | 360/360 | 323/323 | 321/321 |
| 768 | 768/768 | 715/715 | 713/713 |
| 1280 | 1280/1280 | 1232/1232 | 998/998 |

曾仅缩数据根容器到360而保留1400视口，scroll=429；该页使用viewport media，改用真实iframe后无根页面横溢出，不列缺陷。iframe已移除。

与tasks对比：共享描述font12.5px/padding6px 10px与7%背景一致（见priority-final.json storageTokens/taskTokens）；tasks重启按钮27.59375px/font12px/radius7px，storage编辑删除升级为32px，不能说所有尺寸完全相同。

## 骨架与动效

仅当前临时页面将storage.list延迟600ms，仍向真实backend发请求。80ms观测真实role=status、aria-busy=true、aria-label“读取中…”；3个wbi-skeleton-card，每卡3个骨架条。恢复fetch后正常载入。浏览器prefers-reduced-motion实际false；CSSOM确认root/card/config/data的reduce规则禁用animation/transition和hover transform，但未切系统偏好做reduce=true实测。

## 可采信截图与限制

- [最终修复dark记录](records-dark-final.png)：最终174164字节包，read_image逐张目视正确storage v1.3.0 dark，新增物品按钮可读。
- [light记录](records-light.png)：此前174124字节精简包，light样式未受后续只改dark前景token影响；已逐张目视。最终light另有computed证据，未再截图。
- 两张原始文件file检查均PNG 1400×808，未把read_image归一化JPEG误当原始编码。
- 未收齐四视图×light/dark8图：过程中多次调用外域变化/部分截图与截图前DOM不一致，来源未确定；父确认自己及其他agent没有浏览器调用。错误stats命名图实为tasks记录，已剔除归档。按父最新要求仅再一次截图成功后停止追图；不锁导航、不将未验证项写PASS。
- 三宽验证主要为DOM尺寸证据；未取得每宽每视图目视截图。未实测reduced-motion开启。最终console=[]。

## 证据与清理

[最终DOM/宽度/对比度/能力原始结果](final-results.json)、[P7校验与原始fixture](priority-initial.json)、[默认4/min1与样式对比](priority-final.json)。临时profile和隔离DB保留复查。

所有本轮启动jobs均已kill并job_output收集，最终status=killed：bash-ea9fc6561a9a4e3c、bash-0a93b50d01364bce、bash-7764882ed3414d2f、图片bash-3df68974642e47bf。job_list无running；唯一临时浏览器标签tab:563425a3-e235-4574-a91a-891f1d6c2c2d已关闭。
