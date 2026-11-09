# 临时 profile 真实浏览器验收（2026-11-09）

## 环境与隔离

- 源码工作区 `/Users/yyq/code/dsh-workbench`；未编辑源文件、未提交。
- 临时 profile `storage-browser-20261109`；DB 使用独立 `WB_HOME=/tmp/dsh-data-ui-20261109/workbench`，未使用常用 profile 数据库。
- 按仓库安装文档完整安装宿主及 storage/tasks/tags/sites，最终构建后再次完整重装，安装 exit 0，五包入口 import 成功。
- 最终运行版本：host 0.5.6 / storage 1.1.0 / tags 1.6.7 / tasks 2.10.11 / sites 1.8.3。capabilities 的 actionCount 分别 15/17/42/39，全部 enabled，warnings 与 missingRequires 均为空。
- 浏览器为 dsh_browser_* 实际临时实例 `http://127.0.0.1:60059/`；图片来自独立本地 60060 fixture 服务。主实例 50120/3080 未重启或操作。

## 共享数据页（首轮完整验证）

真实后端种入 13 个 storage，1 个软删除；另创建标签、任务、站点及目录样例。

| 检查 | 证据 |
|---|---|
| 四域布局 | storage/tag/task/site 均显示左侧表目录、右侧行数据/表索引双 tab；目录表数分别 1/2/3/5 |
| 组合筛选 | 名称 UI验收 + 库存 1~2 返回 4 行：UI验收-10/07/04/多图长备注 |
| 零结果 | 名称 不存在XYZ，断言 共 0 行 通过 |
| 分页 | 每页10，末页 第2/2页，2行（02、长备注） |
| 已删除 | 默认12有效；勾选含已删除后 共13行 |
| 图片 | 两张HTTP图片缩略图及抽屉的 naturalWidth=320、naturalHeight=220 |
| 长备注 | 单击复制、双击展开符合实现；抽屉 pre 全文840字，未截断 |
| 索引/刷新 | 索引显示storage 13行/11列/id主键；刷新按钮可用 |

首轮完成后开发方另修复索引慢请求覆盖导航、切表旧数据残留；上述完整用例早于两项修复。最终重装后，tasks 数据页行/索引tab存在，立即打开索引再回行数据，后续断言仍为行数据且 UI验收任务 可见；console=[]。未额外注入网络延迟复验竞态（开发方负责自动测试）。最终 storage 组合筛选复验期间页面回到DSH首页，未得到断言通过，未把该次计为通过；重新打开工作台完成 tasks smoke。该偶发界面重置根因未确定，无控制台错误。

## 最终储物卡片实测

额外创建无备注/无图/无标签样例，以及超长名称、长品牌、750字备注、两图样例，保留于隔离DB。

| 检查 | 实测 |
|---|---|
| 内容宽1280px | 通过临时DOM宽度设置约束真实 `.wbi-root`；五列，宽244.797/244.812px，卡片scrollWidth=clientWidth，无溢出 |
| viewport768px | 同源iframe加载完整真实GUI和backend；内容715px，两列350.5px，document.scrollWidth=768 |
| viewport360px | 同一个真实iframe缩至360px；内容323px，一列323px，document.scrollWidth=360 |
| 缺省区块 | 无备注样例无 .wb-desc、无图无 .wbi-images、无标签无 .wbi-tags；没有空占位元素 |
| 超长内容 | 名称换行且卡片scrollWidth=clientWidth；备注折叠60px（三行），展开1000px=scrollHeight，再收起成功 |
| 图片展开 | 默认1个图片按钮，展开后2个，aria-expanded=true |
| 操作触达 | 展开/图库更多/编辑/删除高度均32px；Tab后编辑按钮匹配focus-visible且2px实线outline |
| 深色描述 | 临时给真实body设置应用实际CSS选择器 data-ds-dark-theme（非系统主题菜单）；card背景RGB35,35,36，描述合成背景RGB39,41,48，文字RGB249,250,251，WCAG对比度13.8959:1 |
| tasks对照 | 真实任务记录的 .wb-desc 文字“共享数据页结构验证”，12.5px字体、6px 10px padding、相同oklab蓝色7%透明背景，正文继承主文字颜色 |

响应式是实际iframe viewport，不是顶层窗口resize；未声称真实手机或顶层窗口已测。深色验证为实际主题CSS DOM模拟，不代表主题菜单切换测试。

## 可信截图及截图工具局限

仅以下图片已通过 read_image 视觉核对，名称与实际内容相符：

- [最终五列储物卡片，1280内容宽](verified-storage-cards-1280.jpg)
- [标签共享数据页](verified-tags-data.jpg)
- [站点共享数据页](verified-sites-data.jpg)

截图载体存在明显滞后：不同页面调用保存成功但返回此前帧，相同SHA；重复截图有时更新、有时仍旧帧。名为 cards768-confirmed 的原始图实际为1280五列，因此仅按实际内容归档为 verified-storage-cards-1280.jpg。768/360、图片抽屉、长备注抽屉等以DOM读回为证据，不提供未经核对的截图结论。本目录其他 storage-*/tags-data-*/tasks-data-*/sites-data-* PNG 是旧采集，不应交付或视作其文件名所称证据。

## 清理与未验证点

- managed jobs：首轮 `bash-2784566033284d83`、最终 `bash-84f0559e53b74191`（60059），图片 `bash-efa089e6ce814cc1`（60060）全部kill并收集，最终status=killed。
- 本任务浏览器标签已关闭；临时profile和隔离DB保留，便于复现。
- 未做真实移动设备、顶层resize、英文、网络失败/删除失败注入、最终全部四域完整回归；未把自动测试代称为本人浏览器测试。
- 早期storage新增/编辑/搜索/删除/config16/标签跨搜索操作已在前一独立临时DB验证并另行报告，非本次共享数据截图的同批证据。
