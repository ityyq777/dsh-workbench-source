# 仓库约定

执行一类任务后自动执行 git commit；默认只进行 commit 不进行 push，等待用户明确指定后再 push。

**一律用中文**：代码中的注释（含文件头、函数说明、行内说明、TODO/待办）与 git commit 信息
都写中文。commit 标题与正文均用中文说明改动及原因；代码标识符、包名、API 名和必要的技术
术语可保留原文，不要硬译或中英混排。

本文件只保留**不可妥协的红线**和规范索引。按维度展开的细则统一放在
[`docs/AGENTS规范/`](docs/AGENTS规范/)，执行对应任务前先读对应文档。

## 界面红线

以下四条是用户明确提出的 UI 要求，改布局、新增插件视图、调整主题时必须遵守。

1. **业务视图不要两侧留白**。模块页容器（`wbc-wrap`、`wbv`、`wba-wrap`、`wbct-wrap`、
   `wbca-wrap`、`wbm-wrap`、`wbm-page` 一类）不得用 `max-width` + `margin:0 auto`
   居中收窄；宽度撑满可用区域，只保留统一内边距。需要限制阅读宽度时，限制正文段落，
   不要收窄整个视图。
2. **桌面端顶栏只有一层，并直接占满系统标题栏区域**。macOS（`html[data-platform=darwin]`）
   不再预留 `--dsh-frame-top-clearance: 48px` 的垂直空白：`.wb-immersive` 与
   `.wb-immersive-bar` 的 `padding-top` 只保留 8px，顶栏背景从 `y=0` 连续覆盖；
   左侧用 `padding-left: max(88px, calc(12px + var(--dsh-frame-leading-clearance, 0px)))`
   避开红绿灯与 leading 控件。Windows 仍把 `--dsh-frame-top-clearance`（caption 高度）
   并入 `.wb-immersive-bar` 的 `padding-top`。顶栏内**不得**声明
   `-webkit-app-region: drag`，否则原生拖拽区会先于 DOM 命中，吞掉页面控件点击；
   窗口拖动交给桌面端标题栏。视图标签（`.wb-page-tabs`）必须并进同一行顶栏。
3. **样式必须跟随 DSH 主题**。颜色、边框、阴影、遮罩只能来自主题 token
   （`--wb-card`、`--wb-border`、`--wb-line`、`--wb-surface`、`--wb-accent`、
   `--wb-muted`、`--wb-ok`、`--wb-warn`、`--wb-danger`，由 DSH 主题变量派生）；
   禁止写死 `#fff`、`#000`、`#2563eb` 一类固定色，禁止为单个模块另建色板。
   新增组件必须同时验证浅色、深色下的背景、文字、边框与 hover/focus/disabled。
4. **先复用共享组件，不要复制**。新增或改造插件视图前，先查 `packages/addons/lib/`：
   数据页用 `data-view.cjs`，Action 页用 `action-schema-view.cjs`，按钮/字段/提示/空态/
   加载用 `client-common.cjs`，基础样式用 `client-base-styles.cjs`，标签筛选用
   `tag-filter.cjs`，统计图表用 `stats-charts.cjs`，图标用 `icons.cjs`，对话框外壳用
   `overlay.cjs`，图标按钮与骨架屏用 `button.cjs`/`skeleton.cjs`，布尔开关用
   `switch.cjs`（多选清单仍用原生 checkbox），数字输入用 `number-field.cjs`（范围只作
   提示、非法红字且不提交，禁止 `type="number"` 与输入期夹取）。两个以上插件出现的同类 UI 必须抽到
   `packages/addons/lib/`，禁止整段复制后只改 CSS 前缀。共享组件用 `domain`、`prefix`、
   `tables`、`Icon` 等参数接收上下文，不得 import 具体业务域；业务专属
   布局留在插件内，通过参数或样式追加扩展。例外：lucide 图标必须由各插件自己 require，
   不要合成一张总表，否则每个包都会打进所有插件的图标。

详细实现、验证步骤和常见错误见
[`04-UI规范.md`](docs/AGENTS规范/04-UI规范.md)。

## 其他硬红线

- **交付必须核对 profile**：改插件后先 `pnpm build && pnpm dist:shell`，用带版本标识的完整
  安装源装进目标 profile，再跑 `pnpm audit:profile`；安装命令成功不等于已生效，进程未重载
  时必须明确写“仍需重启”。见 [`03-安装与交付.md`](docs/AGENTS规范/03-安装与交付.md)。
- **schema 是契约**：声明了就必须真读，读到了就必须声明；agent 可见的 schema 变化要同步
  五处版本号、能力清单、文档与测试。见
  [`02-ActionSchema与页面数据.md`](docs/AGENTS规范/02-ActionSchema与页面数据.md)。
- **共享控件全覆盖**：13 个插件的图标、对话框外壳、按钮、骨架屏、标签筛选、统计图表基件
  必须走 `packages/addons/lib/`；图标表按插件保留（体积原因），但渲染逻辑只准一份。改控件后
  跑 `pnpm test:shared-ui`，它会拦住回退到自研 `Button`/`Skeleton`/`Modal` 或内联 lucide
  require 的改动。见 [`04-UI规范.md`](docs/AGENTS规范/04-UI规范.md)。
- **单文件与目录**：手写源单文件目标 ≤600 行（>600 告警、>900 失败），每目录 ≤12 个文件、
  深度 ≤3，数据库基础层不得反向依赖业务层。见
  [`01-代码风格与目录.md`](docs/AGENTS规范/01-代码风格与目录.md)。
- **插件页面自证数据源**：业务页面只用本插件注册的 action 取数，不走宿主统一接口。
  见 [`02-ActionSchema与页面数据.md`](docs/AGENTS规范/02-ActionSchema与页面数据.md)。
- **跨插件界面只能走插槽**：想让别的插件界面出现入口，用 `registerAddon({ slots: [...] })`
  贡献到宿主白名单插槽（`item.actions` / `view.toolbar` / `settings.sections` / `home.card.footer`），
  禁止改对方代码或整页嵌套；属主**不得内建来源解析**（不许写 `MAIL_REF`/`SITE_REF` 这类分支，
  来源一方贡献自己的「回到原处」）；改完跑 `pnpm test:slots`（插槽 id 打错不会报错，只会永不显示）。
  见 [`04-UI规范.md`](docs/AGENTS规范/04-UI规范.md) 与 [`跨插件界面插槽设计.md`](docs/跨插件界面插槽设计.md)。
- **子插件共享行必须流式**：`cordis.patch.yml` 里指向宿主/保险箱的共享行（`workbench`、
  `workbench-host`、`workbench-vault`）必须写成 `- { id: workbench, name: 'dsh-workbench' }`
  这种流式单行，不能写成块式、也不能删掉；块式会被插件市场算进该子插件的 insertedIds，
  装第二个 workbench 系插件时就判「和已安装的插件冲突」并整次回滚（先装 vault 再装 mail
  同样会踩）。改完跑 `node scripts/test-market-conflict.mjs`，安装顺序见
  [`03-安装与交付.md`](docs/AGENTS规范/03-安装与交付.md)。
- **发布用官方 npm registry**，发布顺序 host → tasks → tags → sites；GitHub token、npm token
  只存本机 0600 私有文件。见
  [`05-发布与插件市场.md`](docs/AGENTS规范/05-发布与插件市场.md)。

## 规范索引

| 文档                                                                  | 覆盖内容                                                             | 何时读                             |
| --------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------- |
| [`01-代码风格与目录.md`](docs/AGENTS规范/01-代码风格与目录.md)           | ESLint/格式化、目录分层与纯路径迁移、单文件规模与拆分                | 写代码、迁目录、拆文件前           |
| [`02-ActionSchema与页面数据.md`](docs/AGENTS规范/02-ActionSchema与页面数据.md) | Action schema 硬规则、改完必跑、文档同步、插件页面自证数据源    | 增删改 action、写插件页面时        |
| [`03-安装与交付.md`](docs/AGENTS规范/03-安装与交付.md)                   | profile 版本核对、本地重装、桌面端 CLI、避免手工拷一半                | 交付插件、改客户端、准备重启前     |
| [`04-UI规范.md`](docs/AGENTS规范/04-UI规范.md)                           | 全宽、桌面端顶栏、主题跟随、共享组件复用、跨插件插槽、响应式与实机验证 | 改布局、样式、图标、主题、写插件视图、加跨插件入口时 |
| [`05-发布与插件市场.md`](docs/AGENTS规范/05-发布与插件市场.md)           | 版本升级、构建发布树、npm 发布、GitHub 镜像、市场收录                | 发版、更新市场条目时               |
| [`06-仓库结构与cloud子模块.md`](docs/AGENTS规范/06-仓库结构与cloud子模块.md) | 宿主与 cloud 子模块的提交、构建、部署关系                        | 改云端代码、更新子模块时           |
