# 与 Cypht 的对照笔记

> 把 `_archive/cypht-master/`（Cypht 2.x：PHP 多用户 webmail，40 个模块、288 个 PHP 文件约 9.2 万行、约 2.3 万行前端 JS、19 种语言）当成一个成熟标本，取它在**插件组合**和**邮件域**上的做法，对照本仓库（14 个 addon 包、约 5.7 万行、105 个测试脚本）判断该学什么、不必学什么。
>
> 一句话结论：**我们的底座更收敛，缺的是两件事——插件之间能插进对方的界面，以及把"承诺"绑到测试上；邮件域缺标签、保存搜索、定时发送和可发现的快捷键。**

## 1. 先划清边界：两个系统不是一类东西

| 维度 | Cypht | 本仓库 |
| --- | --- | --- |
| 形态 | 多用户 Web 邮件客户端，浏览器 + 服务端会话 | 单机单用户工作台，DSH 插件 |
| 语言/运行时 | PHP 8.1+ / PDO / 多数据库 | Node + `node:sqlite` / cjs 客户端 |
| 扩展模型 | 模块集（40 个），配置里用逗号串启用 | npm 包 + DSH 安装，package.json 声明依赖 |
| 数据 | 业务实体存在 user_config 里，随 session 序列化 | 业务表 + meta 键值，迁移与备份显式 |
| 界面 | 服务端拼字符串（output 模块），AJAX 换片段 | React（宿主注入）+ cjs 视图模块 |
| 组合方式 | `add_handler/add_output` 挂到命名锚点 | 插件整块注册视图 + action |

结论：Cypht 的 handler/output 管线、session 里的 user_config、三套数据库 schema、CSRF/origin 校验，都是"多用户 Web 应用"的解法。我们是单机单用户、SQLite、插件由 DSH 托管，**照搬会直接带来架构税**。下面只挑跨得过来的部分。

## 2. 我们的底子其实更强的地方（先说清，避免学跑偏）

- **action schema 类型化 + agent 可见性三态**（`agentEnabled` / `agentLocked` / 本机覆盖）+ 审计账本。Cypht 对应物是 `modules/*/setup.php` 里的 `allowed_post` / `allowed_get` 白名单——只到 PHP filter 常量，没有结构化 schema，也没有"谁能调"的概念。
- **schema 驱动配置**：类型、范围、中英文、提示、越界回退默认值（`packages/addons/tags/lib/infra/config.js`）。Cypht 的设置是 97 个 `add_output('settings', ...)` 各自拼 `<tr>`，校验散在 97 个 `process_*_setting` handler 里。
- **跨域搜索**：provider 并行、500ms 超时、部分失败透出、⌘K 入口（`packages/shell/src/infra/search.ts`、`packages/shell/client/client.src.cjs:273`）。
- **单一 SQLite + 迁移 + 备份/导入导出 + 云同步 + 结构与行数审计**（`scripts/audit-structure.mjs`、`scripts/audit-lines.mjs`）。
- **测试密度**：105 个脚本、77 个 npm 测试入口、UI 预览夹具。Cypht 是 86 个 PHPUnit 文件 + 15 个 Selenium 脚本。

## 3. 该学的，按投入产出排序

### P0-1 政策登记表：让"承诺"能被脚本校验

Cypht 的做法（`docs/policy-cases.json`、`docs/policy-cases.schema.json`、`scripts/validate_policy_cases.php`）：17 条 policy，每条声明 `id / title / description / tests[] / cases[]`，`tests` 必须指名 PHPUnit 的"类::方法"；validator 校验 JSON Schema、policy 与 case 的 id 唯一、且引用的测试真的存在。文档还明确写了准入标准：**不登记每个单测，只登记"用户、运维、收件人或安全评审可以依赖的行为"**。

我们的现状：`AGENTS.md` 和 `docs/AGENTS规范/` 里全是文字承诺——"agent 只见掩码"、"卸载只删代码不删数据"、"单附件 32 MiB"、"hook 仅本机"、"sync 冲突保留两侧"——测试确实存在，但没人能一眼回答"这条承诺由谁在守、退了谁报警"。

建议：`docs/policies.json`（同构 schema）+ `scripts/audit-policies.mjs`（校验 schema、id 唯一、`tests[]` 指向的脚本与用例真实存在，并能一键把登记的用例跑一遍）。种子只挑"错了会出事"的 6 条：vault 掩码、不可逆动作的确认语义、附件上限、hook 回环限制、同步冲突保留、agent 硬锁。

成本约半天到一天；收益是以后每次改代码都能回答"哪条承诺会退"。

### P0-2 插槽：能力已经通了，界面还是孤岛

Cypht 的组合力全部来自 `add_handler(页面, 名字, 启用, 所属模块, 锚点名, before|after)` 和 `add_output(...)`：97 处 `add_output('settings', ...)` 把 40 个模块的设置拼进同一个设置页；`add_module_to_all_pages` 让快捷键这类横切能力一次挂到所有页面。更狠的一点在 `lib/module.php` 末尾——`Hm_Handler_` / `Hm_Output_` 空类可以**顶掉**别的模块的贡献，等于留了一个"覆盖别人"的口子。

我们的现状：`ctx.workbench.invoke()` 已经能让插件调用别的域的 action（`packages/sdk/src/index.ts:312`），但客户端只能 `registerAddon({ views: [...] })` **整块**注册视图（`packages/sdk/src/index.ts:358`），没有"往别人的视图里塞一段"的机制。结果就是：在邮件里看到一封要跟进的信，没有"转成任务"的按钮；标签也用不到邮件上——**能力互联，界面各自为政**。

建议：宿主定义**命名插槽**，插件注册贡献 `{ slot, id, order, component }`；宿主按 order 稳定排序、每个贡献包 ErrorBoundary（一个插件崩不拖垮整页）、样式只允许主题 token。先开三个真用得上的：`item.actions`（列表项/详情页动作条）、`view.toolbar`（视图工具条）、`settings.sections`（配置页分段）。**只做 order 排序，不做 before/after 相邻依赖链**——那是 Cypht 里最贵、最难读的那部分复杂度。

### P1-1 邮件与工作台打通（用户感知最强）

Cypht 的 `modules/tags` 把标签挂在 IMAP 邮件上：本地仓储 + IMAP keyword 双写，移动邮件时跟着同步。

我们的邮件插件：`mail_message` 已经存了 `message_id` / `references` / `thread_refs`（`packages/addons/mail/lib/db/db.js:28`），但 `grep tag` 在邮件插件里一处都没有；标签域早已存在，被 tasks / sites / storage 使用。

建议（靠 P0-2 的插槽落地，不需要新表）：邮件项动作条 =「打标签 / 转任务 / 加入日历 / 存为站点」。四个动作都是 `invoke` 已有能力的组合，`tag_mapping` 增加 `mail` 类型即可。

### P1-2 保存的搜索

Cypht 有 `modules/saved_searches`（存查询参数，菜单直达）和 `modules/advanced_search`（按来源勾选、否定词、时间范围）。

我们：`search.query` 接受 `domains` 过滤参数，但界面只发全量；结果不能保存。

建议：一个 `search_saved`（宿主 meta 表足够）+ 首页与 ⌘K 里的"我的搜索"，再补一条"每天跑这个搜索 → 推消息"，直接复用自动化插件。这一步把搜索从"找东西"变成"订阅"。

### P1-3 快捷键要可发现、可改

Cypht 的 `modules/keyboard_shortcuts` 把键位存进用户设置、注入页面，配一张帮助页和编辑页。

我们只有 ⌘K（`packages/shell/client/client.src.cjs:273`）；`packages/addons/mail/client/views/folder-shortcuts.cjs` 是"常用文件夹按钮"，不是键盘。

建议：宿主 keymap 服务 + 插件 `registerKeybinding`（带冲突检测），`?` 弹出当前视图可用键位。成本小，体感提升明显。

### P2-1 定时发送：概念比实现重要

Cypht 的实现其实很薄——`modules/scheduled_sends/setup.php` 只做"伪文件夹 + 重排控件"，真正投递靠别处。真正值得抄的是**状态语义**：已排期 / 发送中 / 服务器已收 / 本地未留档。我们的投递记录（`packages/addons/mail/lib/db/delivery.js`）已经有后两档，补一档"已排期"即可，触发交给自动化插件。

### P2-2 高亮规则

Cypht 的 `modules/highlights`：按账户、flag、发件人给列表行加文字色或底色。对多账户统一收件箱很实用——一眼分出这封信来自哪个账户。成本是一条规则表 + 列表行的样式类；注意不得写死颜色，只能用主题 token。

### P2-3 统一"来源"抽象（想清楚再做）

Cypht 的 imap / github / feeds / wordpress / nasa 都实现同一套 source，共用消息列表、搜索、历史。我们的邮件、连接器条目、自动化通知是三套。

建议：先在**搜索**和**通知收件箱**层面统一（provider 本来就是这个形状），不要为了统一去动邮件的存储结构。

### P3 每个插件写"行为与边界"

Cypht 每个模块都有 README，写清做什么、依赖哪个模块、加了哪些设置、有什么安全影响。我们发布时由 `scripts/stage-release.mjs:293` 用 package.json 现场生成 README，因此没有地方写这类说明——现在散在 `docs/邮件使用指南.md` 里。

建议：每个插件维护一段 markdown 片段（不可逆动作、agent 边界、失败语义），发布时拼进 README。顺带补上 Cypht 缺的那一环：它的模块前置依赖只写在 README 里（"advanced_search 依赖 imap，请先启用 imap"），等于没校验；我们用 package.json 的 dependencies 做对了，这点别退回去。

## 4. 不必学的

- **handler/output 管线 + before/after 依赖链**：字符串拼接时代的组合方式，顺序靠人眼维护；我们的 action + invoke 更直白。
- **业务实体存 session/user_config**（`lib/repository.php`）：整库靠 session 序列化落盘，与我们的 SQLite 是两代做法。
- **多数据库与三套 schema**（`database/mysql_schema.sql` 等）、session 四后端、redis/memcached 缓存、docker-compose、install.php 向导。
- **CSRF / origin 校验那一套**（`lib/module.php` 的 `validate_origin`）：本机回环 + hook 回环限制已经覆盖。
- **每模块自带 site.js/site.css 且无构建**：全局命名空间污染；我们的 cjs + 构建产物更干净。
- **它自己的短板也别学**：Cypht 没有线程/会话视图（全仓 `grep thread` 只命中信头解析）。我们已经存了 `message_id`/`references`，做线程视图反而是差异点。

## 5. 如果只做三件事

1. **政策登记表 + 6 条种子**（半天，长期收益最高）。
2. **3 个插槽 + 第一个真实用例「邮件 → 任务 / 邮件打标签」**（2–3 天，用户能感知）。
3. **保存的搜索接到自动化**（1–2 天，把搜索变成订阅）。

## 6. 证据索引

| 结论 | 出处 |
| --- | --- |
| 模块用命名锚点拼装页面 | `_archive/cypht-master/modules/tags/setup.php`、`modules/core/setup.php:75-89` |
| 空类可覆盖别的模块贡献 | `_archive/cypht-master/lib/module.php`（文件末尾 `Hm_Output_` / `Hm_Handler_`） |
| 设置页由 97 处贡献拼成 | `_archive/cypht-master/modules/*/setup.php` 中的 `add_output('settings', ...)` |
| 输入输出白名单（未结构化） | `_archive/cypht-master/modules/tags/setup.php` 返回值 |
| 政策登记表与校验器 | `_archive/cypht-master/docs/policy-cases.json`、`scripts/validate_policy_cases.php` |
| 标签双写 IMAP | `_archive/cypht-master/modules/tags/handler_modules.php`、`hm-tags.php` |
| 定时发送实现很薄 | `_archive/cypht-master/modules/scheduled_sends/setup.php` |
| 插件间可互调 action | `packages/sdk/src/index.ts:312` |
| 客户端只能整块注册视图 | `packages/sdk/src/index.ts:358` |
| 跨域搜索已实现 | `packages/shell/src/infra/search.ts`、`packages/shell/client/client.src.cjs:273` |
| 邮件已存线程字段但无标签 | `packages/addons/mail/lib/db/db.js:28` |
| README 由发布脚本生成 | `scripts/stage-release.mjs:293` |
