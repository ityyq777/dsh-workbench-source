# Markdown / 前缀标签 / 数据索引验收计划

状态：仅准备；等待父 agent 稳定 build 信号后才安装和启动。2026-11-09 14:57 使用 sqlite3 -readonly 读取指定三个完整需求，exit0；未加载生产插件，未写生产数据库。

## 边界与环境
新临时 profile body-markdown-data-index-20261109，WB_HOME=/tmp/dsh-body-markdown-data-index-20261109/workbench。真实宿主+tasks/tags/sites/storage整包安装，核对版本、actionCount、warnings及源码/安装包哈希。临时实例 managed background job，记录jobId；不操作主50120/3080/当前GUI，不安装desktop。结束kill、collect输出、关闭本任务tab。无源码修改。

## A. Markdown 与全局模式（需求01a1bf0f-6fb8-7609-999f-76e37ba63fee）
1. 干净profile首次默认markdown；任务列表/卡片两字段与储物共享描述使用fixture样本。检查h1–h6层级、段落、硬换行、粗斜体、inline code、fenced code原样、无序/有序嵌套一层、引用、分隔线及链接。未知/残缺语法和空白不得崩溃。
2. DOM确认安全链接仅http/https/mailto，target=_blank，rel含noopener noreferrer nofollow；javascript/data无可点击链接，raw HTML为字面量，无script/img注入、不触发标记。不点击外链、不发邮件。实现的React节点/无innerHTML/cache契约以只读源码检查及父单测补证，不能仅凭截图宣称证明。
3. M/T真实控件title/aria-pressed正确且两字段同步；text显示Markdown源码、等宽字体、换行保留。切视图、刷新、重启同一临时实例检查持久化；配置默认值双向作用与localStorage回退另测，记录持久化范围。储物共用渲染要求必须检查。
4. 双击正文和显式编辑入口均能编辑原始Markdown；链接/列表存在时仍有可靠入口；textarea有Markdown提示；前缀标签自身双击不进编辑。保存回读源字符串。
5. 搜索HeadingProbe/ListProbe/QuoteProbe/BoldProbe：解析后文本叶子高亮、结构不损坏；纯文本模式回归。CodeProbe行为按明确契约记录。
6. 20KB文本、未闭合代码、空描述/感受不报错；统计渲染耗时作为观测，不杜撰缓存命中。

## B. 双语胶囊前缀（需求01a1bf02-4631-752b-bc25-782ad0fa30e7）
列表/卡片任务描述与感受、储物Description检查真实文本节点，中文描述/感受，英文Description/Reflection；标签不可由中文伪元素生成。计算样式11px、600、letter spacing .06em、4px圆角、1–4px内边距、语义底色，首行baseline和三行以上换行布局。浅/深主题按实际合成背景计算标签对比度≥4.5:1；不可仅比较CSS rgba字面值。无重复读屏描述，无标签点击编辑。截图覆盖任务list/card、storage、English及light/dark，并逐张read_image核实真实内容（截图工具曾有旧帧）。

## C. 四插件数据索引（需求01a1bef7-6129-707c-acf0-6e2cc150c150）
逐个tasks/tags/sites/storage：左栏仅真实表，中文+英文两行，不含表索引伪项；仅一表插件也一致。右侧行数据/表索引tab切换保持当前选择。
索引tab仅当前表，每索引一行，列为索引名/列顺序/类型主键唯一普通/来源自动/行数；顶部当前表名、行数、列数、共N索引。切表同步刷新，以network验证不重复拉全表（table参数或缓存均可）。
task必须覆盖done_date/created_at/dedupe_key/sort/status/target_date/restart_key/timeline_key/updated_at/table_id单列索引；task_dep联合(task_id,depends_on_id)必须一行且顺序正确。SQLite自动索引来源、唯一/普通文字清楚；长索引名换行不撑宽；仅主键无额外索引显示指定空态。不能造假宣称存在未找到的空索引表；必要时与父协调隔离fixture。
截图至少task索引与task_dep索引各一张；四域左栏DOM快照和网络证据。

## 夹具与交付
fixture-plan.json仅设计，尚未写入。创建通过真实action并显式选测试表，schema先查；任务依赖通过真实接口，生产schema不改。保存精简DOM/API/网络证据、截图、完整验收报告，区分PASS/FAIL/未覆盖，记录最终安装源与hash、版本及job清理。

## 待父稳定build信号后确认
父14:58明确实现契约：tasks3.1.0/storage1.4.0/tags1.6.9/sites1.9.2。共享模块同源localStorage；CustomEvent同页跨bundle同步，storage event跨tab；任务挂载configGet权威配置，configSet持久；storage独立无tasks时默认markdown并读取localStorage。待稳定build后验证：任务切M/T→储物同步、储物切换→任务同步、同源双tab事件同步、刷新与重启后的权威配置一致性；隔离环境注入一次configSet失败，核实明确失败反馈和实际模式/持久值，不把localStorage临时成功误报服务端保存成功；配置字段和英文路径以真实schema核对。storage无tasks情形需单独隔离profile才能验证，不卸载主实例插件。空索引/长索引fixture视真实元数据决定。
