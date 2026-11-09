# 工作台正文与 Top100 标签验收

2026-11-09。版本：host 0.6.1 / tasks 3.1.1 / tags 1.6.10 / storage 1.4.1。

## 范围

- Top100 标签替代旧榜，左列独立卡片，右列保留统计；topTagsLimit 默认100、最大200，UI取100；稳定按次数、最近使用、ID排序。旧沉睡/最近列表继续独立限制。榜单单Tab停靠点、方向键移动、28px行、sticky表头、卡内滚动，点击进入标签名称搜索。
- 描述/感受各块独立Markdown/纯文本切换，不写全局偏好；重挂载使用各插件配置初始值。储物描述同步。
- 标题移到块外，11.5px/600、4px间距、aria-labelledby唯一关联。24px无边框按钮当前态图标、双语可访问名称。编辑只走统一面板，遵循用户不增加双击编辑的要求。

## 自动验证

- pnpm build、dist-shell、audit-actions、audit-lines 通过。schema零问题；行数审计仅既有sites 1259行冻结告警。构建保留既有copy重复键告警。
- pnpm test:e2e 全通过（包含任务归属、搜索、Markdown安全/真实React、配置、重启、储物、客户端、标签、站点、数据与备份）。
- native/tags/sites/clients/task-body/task-body-react/storage/storage-cards/storage-visual 均通过。标签UI16项通过；215标签后端数据验证默认100/最大200及稳定排序。
- 修复新增储物配置后的测试计数/版本预期，以及host运行版本常量，最终回归退出0。

## 浏览器验证

独立样例使用 scripts/body-top-ui-preview.mjs，真实React组件，无数据库写入：
- A描述切text后任务按钮状态为 false,true,true,true,true,true；B感受切text后为 false,true,true,false,true,true。重挂载七个任务/储物按钮全部回到true。
- 七处aria-labelledby均能定位标题；按钮计算宽高24×24；javascript链接数量0。
- 100行：rowHeight28，scroll clientHeight517/scrollHeight2828，tabIndex0仅1个。12行：364/364，无溢出和空行。
- 中文浅色、英文深色及100/12条榜单截图见同目录。截图为组件验收样例，不代表生产数据。

完整临时profile wb-ui-1109：通过桌面CLI安装全包，使用新的版本化源路径规避file缓存；四个入口import通过，四份客户端与源码构建逐字节相同。启动后首页显示tasks3.1.1/tags1.6.10/storage1.4.1。真实库79标签，左榜79行/卡内滚动517/2240；点击首行“文档处理平台”后记录页输入该词并显示1条结果，验证宿主导航契约。wb-real-tags-1109.png为真实临时实例截图。未向业务库写测试样例。

## 交付边界

仅源码完成及临时实例安装验证；未安装到当前桌面profile，未重启用户主实例，未发布npm/市场。临时服务在收尾关闭。移动端及完整屏幕阅读器朗读未实测；无障碍关联和键盘机制通过DOM/组件测试验证。

## 对应原任务

归属：全部任务组 / DeepseekHarness / 插件开发 / dsh-workbench / 开发任务表。
- 01a1bf53-91ac-7efd-bd87-8b84f3942522：Top100标签榜。
- 01a1bf44-e67b-7980-96b0-cbde1787a270：独立Markdown切换。
- 01a1bf42-79cb-7ecc-aac8-9a6ea43f9cc7：块外小标题。
