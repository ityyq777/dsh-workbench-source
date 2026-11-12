# 仓库约定

执行一类任务后自动执行 git commit；默认只进行commit不进行push，等待用户明确指定后再push。

commit 信息使用中文：提交标题与正文均用中文说明改动及原因；代码标识符、包名和必要的技术术语可保留原文。

## ESLint 与格式化

- 修改 JS/TS（含 `.js`、`.mjs`、`.cjs`、`.ts`、`.tsx`）后，必须使用项目本地 ESLint 工具检查相关文件。
- 对本次修改的文件运行 `pnpm exec eslint <文件路径...> --fix` 自动清理未使用的 ES import，再运行 `pnpm exec eslint <文件路径...>` 确认无问题；全量检查用 `pnpm lint`，全量清理用 `pnpm lint:fix`。
- 工作区有其他未提交改动时，优先针对本次文件执行，不要将其他人的业务修改混入提交。全量检查发现历史问题时如实报告，不要关闭规则或添加忽略来掩盖。
- 规则与扫描范围见 `eslint.config.mjs`：覆盖手写源码和脚本，排除生成物、归档及 cloud 子模块。addon 的 `lib` 多数是手写源码，不能整体忽略。
- 当前只启用 `unused-imports/no-unused-imports`，支持类型导入；不会清理 CommonJS `require()` 或普通未使用变量。ESLint 清理不能替代构建和相关业务测试。
- 自动修复可能删除整条未使用的 import。模块若需要执行初始化副作用，应明确写成 `import "./setup.js"`，并复查修复 diff。
- 排版交给 Prettier，配置为支持详细注释的 `.prettierrc.json5`；不要再创建同名的 JSON 配置造成配置选择歧义。

## 目录分层与纯路径迁移

业务目录按 [架构约定](docs/ARCHITECTURE.md) 和 `scripts/structure-map.json` 逐文件归属管理。业务源码不得继续堆在 `lib/` 或 `client/` 根目录；根目录仅保留各包显式白名单入口及构建产物。每目录最多 12 个文件，以 `lib/`、`client/` 或宿主 `src/` 为第 1 层，目录深度不超过 3 层。数据库基础层不得反向依赖任务、统计或时间线业务层，服务端源码不得依赖 React 或客户端源码。

修改目录后运行 `pnpm audit:structure`，同步重写模块引用、测试模拟加载器、预览脚本和文档路径；不得靠忽略目录或保留旧根目录转发文件规避审计。宿主 `lib/` 与 `shell-dist/` 为生成物，应迁移 `src/` 后重新构建，不直接搬产物。每个业务域独立提交和验证；纯路径搬迁保持动作、schema 与 DB 结构不变，可使用 `scripts/check-structure-contract.mjs` 对比迁移前的私有基线。安装必须使用完整包，验证嵌套文件及入口导入。

## 仓库结构与 cloud 子模块

本仓库是宿主源码仓库；云端 Java 服务通过 `cloud/` 子模块引用，指向
`https://gitee.com/yang7it/dsh-workbench-cloud.git`（GitHub 镜像：
`https://github.com/ityyq777/dsh-workbench-cloud`），分支 `main`。

- 不要在本仓库复制云端源码，也不要再单独 clone 一个云端工作区。
- 新 clone 用 `git clone --recurse-submodules`；已有工作区用
  `git submodule update --init --recursive cloud` 初始化。
- 更新子模块：`pnpm cloud:update`；构建云端：`pnpm cloud:build`。
- 改云端代码：先在 `cloud/` 内提交并推送云端仓库，再回宿主提交 `cloud` 的
  gitlink（`git add cloud && git commit`）。只提交云端不提交宿主，宿主会继续指向旧 commit。
- 服务器部署可以单独 clone 云端仓库，也可以 clone 宿主后初始化子模块；两种方式产物相同。
- `cloud/target/` 是构建产物，不要提交；由云端仓库自己的 `.gitignore` 忽略。

## Action schema 与能力清单维护

这一节不是文档洁癖：agent 调用工作台时，唯一能看到的就是每个 action 的 schema
（`actions.help` 里的 `input`、描述、`required`、示例）。schema 写错或写漏，agent
就会传错参、传了不生效，或者干脆不敢传——**大部分时间都是 DSH 读 schema 填参数的**。
所以 schema 是和实现同等的契约，改实现必须同步改 schema。

### 硬规则

1. **声明了就必须真读**。`input.properties` 里出现的字段，实现里必须能读到并生效；
   声明了却不生效，agent 会以为传了有用，排查成本极高。
2. **读到了就必须声明**。实现接受 `args.x`（含别名如 `args.taskId`、`args.nodeId`）
   就必须写进 schema，或者在宿主兼容层的别名表里显式登记；否则 agent 永远发现不了。
3. **`required` 必须和实现一致**。实现会抛错的必填项，schema 里必须 `required`；
   反过来 schema 写的必填，实现也不能悄悄放过。
4. **描述必须写真实取值**。枚举型参数的描述要和代码常量一致（例：`PUT_TYPES` 有
   `0/1/2/3/4` 时，描述就不能只写 0~3）；有副作用的 action（软删除、级联清理、
   写 meta 表）要在描述里说清。
5. **agent 可见的 schema 变化必须升版本号**。新增/改名/删除参数、改 `required`、
   改枚举，都算对 agent 的破坏性变更，四处版本号一起改：
   `package.json` 的 `version` 与 `wb.addon.version`、`client/client.src.cjs`、
   `lib/index.js`（`lib/client.js` 是产物，跑 `pnpm build:clients` 重建）。
6. **能力清单（capabilities）要跟着走**。新增记录域或桌面卡片时，
   `records[].primaryAction` 必须指向真实存在的 action，`warnings` 必须为空。

### 改完必跑

```sh
pnpm build:clients              # lib/client.js 是产物，版本号要跟 client.src.cjs 一致
node scripts/audit-actions.mjs  # schema ↔ 实现 ↔ 版本号 ↔ 文档 四向核对，必须零问题
node scripts/audit-lines.mjs    # 手写源行数：>600 告警、>900 阻断（生成物不计）
pnpm test:native && pnpm test:tags && pnpm test:sites
```

`scripts/audit-actions.mjs` 无头加载宿主与三个插件，直接拿真实注册的 schema 做比对：

- 版本漂移：五处版本号必须一致；
- `required` 字段是否都在 `properties` 里；
- 声明了但实现从不读的参数；
- 实现读了但没声明、也没登记在别名表里的参数；
- `capabilities` 的 `primaryAction` 是否都存在、`warnings` 是否为空；
- 文档覆盖只作提醒（文档会晚一拍，schema 不能）。

新增兼容别名时改脚本里的 `ALIASES`；静态扫描确有误报的字段改 `NON_SCHEMA`，
并在注释里写清原因，不要为了让脚本变绿而放宽规则。

### 交付前必须核对「profile 已安装版本 == 源码版本」（每个 agent 都走）

只改源码、只重启，用户看到的仍然是旧版本：profile 里是**拷贝安装**的产物，重启只是重载
那次拷贝。2026-11-10 踩坑：源码已经到 tasks 5.2.0 / tags 1.7.0 / sites 1.10.0 /
storage 1.5.0，desktop profile 里还是 5.1.3 / 1.6.13 / 1.9.4 / 1.4.3，用户重启后界面
毫无变化，还以为是代码没生效。

改完插件代码，交付前按顺序做完，并在回复里给出各步结果：

1. `pnpm build && pnpm dist:shell`：把源码构建成 `packages/shell-dist` 与各插件 `lib/client.js`；
2. 准备**带版本标识的完整安装源**：`~/.dsh/workbench/local-packages/<标识>/packages/`
   下放 `shell-dist` 与 `addons/{tasks,tags,sites,storage}`，用
   `rsync -a --exclude node_modules` 整目录复制，保持 `file:../../shell-dist` 的相对结构；
3. 用桌面端 CLI 装进 `$DSH_PROFILE`（见下一节），加 `--force`；
4. 跑 `pnpm audit:profile`：脚本会读源码 `packages/{shell-dist,addons/*}/package.json`，回读
   `$DSH_PROFILE_DIR/node_modules/<包>/package.json` 逐包比对版本，对五个包入口各做一次
   `import()` 冒烟，并打印 profile 的 `file:` 安装源；退出码 0 一致、1 版本差异或冒烟失败、
   2 参数/缺包/环境错误。`--skip-import` 跳过冒烟，`--json` 给 agent/CI 读，
   `--profile` / `--profile-dir` 显式指定实例（默认读 `DSH_PROFILE` / `DSH_PROFILE_DIR`）；
5. 重启后 `capabilities.list` 报的版本号与源码一致，才算「当前实例已安装」。

脚本化核对：`pnpm audit:profile`（实现 `scripts/check-profile-sync.mjs`，自测
`pnpm test:profile-sync`）。它只核对磁盘与入口 import，**不自动安装/构建/重启**，也读不到
进程内运行版本——第 5 步仍需重启后看 `capabilities.list`。

不允许的结论：「源码好了，重启就行」「安装命令成功，所以已经生效」。安装命令退出成功
不代表内容更新，必须回读 profile 里的 `package.json` 与产物文件；磁盘已更新但进程未重载时，
明确写「仍需重启」，不能声称运行中已可见。

### 本地安装要重装，不是只重启

`~/.dsh/profiles/<profile>/node_modules/` 里是**拷贝安装**的产物，源码改完不重装就
还是旧的。典型症状：`capabilities.list` 报的版本比源码低、新 action 在 `actions.list`
里看不到、`actions.help` 返回的是旧描述。

本次踩坑：`dsh-workbench-tags` 的 `package.json` 已是 1.4.2，但 `lib/tags.js` 还是旧构建，
`tags.update` 根本没注册进去——重启 DSH 也没用，必须重新打包安装该插件。
改完插件的正确姿势：`pnpm build` → 重新安装到 profile → 重启 DSH → 用
`capabilities.list` 核对版本号与 `actionCount`。

### 桌面实例必须使用桌面端 CLI 安装

先读取 `DSH_PROFILE`、`DSH_PROFILE_DIR` 确认用户当前实例；不要把临时 profile 的安装验证当作已安装到用户实例。新增插件仅提交源码、重启应用不会自动安装。交付时明确区分「源码完成」「临时实例验证」「当前实例已安装」，用户要求当前实例可用时要完成对应 profile 的安装。

macOS 桌面版使用应用附带的 CLI，不要直接调用 PATH 中 npm 安装的 `dsh`：

```sh
DESKTOP_DSH="/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh"
"$DESKTOP_DSH" --help
"$DESKTOP_DSH" plugin --profile desktop add \
  "file:$PWD/packages/shell-dist" \
  "file:$PWD/packages/addons/tags" \
  "file:$PWD/packages/addons/storage" --force
```

以上为 storage 的安装示例；按实际目标调整 profile、安装位置及包列表，先完成构建。普通 `dsh plugin --profile desktop ...` 会报 `profile "desktop" is managed exclusively by the Electron application`；这表示选错 CLI，不是需要绕过限制或手改 profile。不要仅凭两个 CLI 帮助文字相似就认为它们相同。

安装后核对目标 profile 的包版本、bundle 清单和入口 import；重启/重新加载后再用 `capabilities.list` 核对运行中版本与 actionCount。磁盘安装成功但进程尚未重载时，明确说明仍需重启，不能声称运行中插件已可见。

本地 `file:` 依赖可能复用旧内容：本次 `add --force` 和 `update --force` 均退出成功，但已安装宿主仍为 0.5.5、标签仍为 1.6.5。必须读目标 `node_modules/<包>/package.json` 核实；版本未更新时，准备新的、带版本标识的完整安装源，再通过桌面 CLI 安装。保留包间相对依赖目录结构；不要直接挑文件覆盖 profile。本次使用 `~/.dsh/workbench/local-packages/storage-1.0.0/packages/` 下的完整 `shell-dist` 与 `addons/tags`，最终核实为 0.5.6 / 1.6.6。

### 不要手工「拷一半」插件目录（高频事故）

拷贝安装是按 `package.json` 的 `files` 把整个目录复制过去的。开发期如果只手工
`cp`/`rsync` 了一部分文件（比如改了 `lib/tasks.js` 只拷这一个文件），profile 里就会
出现**半套源码**：主文件已经 `import "./task-options.js"`，但目标目录没有这个文件。

后果不是「某个 action 报错」，而是**整个插件加载失败、从工作台彻底消失**：
`ERR_MODULE_NOT_FOUND` 发生在模块求值阶段，宿主会跳过该 addon，
`capabilities.list` 里只剩别的插件，用户看到的就是「插件不见了」。

本次踩坑（2026-11-09）：tasks 插件在 profile 里只有 11 个文件，缺
`db-core.js` / `db-legacy.js` / `tag-options.js`，重启后任务域整体消失；补全文件后
不重启仍然不出现，因为失败的加载结果在进程内是缓存住的。

规矩：

1. 拆文件/新增 `lib/*.js`、`client/*.cjs` 之后，**重新安装该插件**，不要手工挑文件拷；
2. 真要手工同步，必须整目录 `rsync -a --delete <pkg>/lib/ <profile>/…/<pkg>/lib/`，
   并顺带同步 `package.json`；
3. 同步后在 profile 目录做一次导入冒烟：
   `node --input-type=module -e 'await import("./node_modules/dsh-workbench-tasks/lib/index.js")'`，
   四个包入口都能 import 才算装好；
4. 改完必须重启 DSH 再验证，进程内不会因为文件补齐而自动重载失败的插件。

### 单文件规模

手写源（`packages/**/src/**`、`packages/addons/*/lib/*.js`、`packages/addons/*/client/*.src.cjs`）
单文件目标 ≤ 600 行；`scripts/audit-lines.mjs` 在 > 600 时告警、> 900 时失败。
超限不是「凑巧长」，通常是职责混在一起：读写、迁移、渲染、注册动作挤在同一个文件里。

**超过 600 行就要拆，不是「以后有空再说」**。文件一旦越线，再加功能时必须先在同一个
提交里把它拆开；`scripts/line-budget.json` 里的冻结额度是「只许降、不许升」的上限，
不是目标——往冻结文件里新增行数会直接被 `audit-lines.mjs` 判失败。

拆分红线：

1. 新增功能不要写进已经超限的文件，先抽出新模块再落地；
2. 碰一个超限文件时，优先顺手拆一刀（读/写分离、渲染与注册分离、schema 与迁移分离），
   拆完把 `line-budget.json` 的上限下调到新行数；文件回到 600 以内就删除该条目；
3. 一次只拆一个文件、一个提交，便于回滚；
4. 拆完立刻跑该插件相关测试（任务：`test:native test:data test:nodeps test:config`；
   站点：`test:sites test:data`），再跑 `audit-actions.mjs` 确认导出面没变；
5. 循环依赖只允许「两边都只在调用期取函数、顶层不求值」这一种形态，并在文件头注释写明；
6. 保留旧文件的导出面（`export * from "./xxx.js"`），调用方不需要跟着改；
7. 生成物（`lib/client.js`、`shell-dist/**`）不参与行数统计，也不要手改。

常见切法：lib 按「纯函数/模型层 ↔ action 注册」分，client 按「样式、文案、子视图」分，
三份同源文件（三份 `client/data.cjs`）优先抽公共组件而不是各拆各的。

待拆清单与建议切法见 `docs/specs/26-大文件拆分清单.md`。

### 模块页布局与桌面端顶栏

这两条是用户明确提出的界面红线，改布局或新增插件视图时必须遵守：

1. **业务视图不要两侧留白**。模块页容器（`wbc-wrap`、`wbv`、`wba-wrap`、`wbct-wrap`、
   `wbca-wrap`、`wbm-wrap`、`wbm-page` 一类）不得用 `max-width` + `margin:0 auto`
   居中收窄；宽度撑满可用区域，只保留统一内边距。需要限制阅读宽度时，限制正文段落，
   不要收窄整个视图。
2. **桌面端顶栏只有一层，并直接占满系统标题栏区域**。macOS（`html[data-platform=darwin]`）
   不再预留 `--dsh-frame-top-clearance: 48px` 的垂直空白：`.wb-immersive` 与
   `.wb-immersive-bar` 的 `padding-top` 只保留 8px，顶栏背景从 y=0 连续覆盖；
   左侧用 `padding-left: max(88px, calc(12px + var(--dsh-frame-leading-clearance, 0px)))`
   避开红绿灯与 leading 控件。Windows 仍把 `--dsh-frame-top-clearance`（caption 高度）
   并入 `.wb-immersive-bar` 的 `padding-top`。顶栏内**不得**声明
   `-webkit-app-region: drag`，否则原生拖拽区会先于 DOM 命中，吞掉页面控件点击；
   窗口拖动交给桌面端标题栏。视图标签（`.wb-page-tabs`）必须并进同一行顶栏。
3. 验证不能只看普通浏览器：浏览器里 `--dsh-frame-top-clearance` 与
   `--dsh-frame-leading-clearance` 默认为 `0`，会掩盖桌面端问题。改完要分别模拟
   `data-platform=darwin`（clearance 48px、leading 120px）与 Windows（clearance 32px）
   截图，并在独立 profile 实机确认浅色、深色都只有一层顶栏，且任务树顶部控件可点击。

### 文档同步

`docs/插件功能清单.md` 是给人看的 action 清单，含版本表与 action 表；改 schema 时
把对应行的字段串、枚举描述、必填列一起改，并更新版本表与 action 数。

### 插件页面必须自证数据源，不许走宿主统一接口

宿主提供 `GET /workbench/api/schema`、`api.schema(domain)`、`capabilities.*`、
`actions.list` 这类**跨域统一接口**，用途是宿主自己的调试台、agent 发现与跨插件编排；
它们不是业务插件页面取数的捷径。

业务页面归各业务插件自己，取数也只能用**本插件注册的 action**：

1. 需要运行时信息（清单、统计、配置快照等）时，在插件 `setup(api)` 里注册自己的只读
   action，例如 `tasks.actionSchema`、`tags.actionSchema`、`sites.actionSchema`、
   `storage.actionSchema`；页面用 `api.call("<域>.xxx")` 调用本域 action，
   不要 `api.schema()` 或直连宿主路由。
2. 统一接口只服务宿主场景，不要求每个插件都提供某个页面；插件没加载时，页面按错误态
   降级，不伪造空数据、也不回退去问宿主。
3. 新增这类 action 同样是 agent 可见的 schema 变更：同步五处版本号、`docs/插件功能清单.md`
   与对应测试（参照 `test:action-schema`）。
4. 判据很简单：**这个页面删掉宿主对应路由后还能不能用**。不能，就是踩了这条线。

历史教训：`Action 清单` 页最初读宿主 `GET /workbench/api/schema`，升级后宿主缺路由时
整页报 `no schema api`；后改为各插件注册 `<域>.actionSchema` 自证清单，宿主接口保留但
不再是这些页面的数据源。设计见 `docs/specs/41-插件自证Action清单.md`。

## 插件市场发布与维护

个人工作台由四个 DSH 原生插件组成，发布链路与市场维护都按本节执行。

### 包与命名

| 用途 | npm 包名                | 源码目录                  |
| ---- | ----------------------- | ------------------------- |
| 宿主 | `dsh-workbench-host`  | `packages/shell-dist`   |
| 任务 | `dsh-workbench-tasks` | `packages/addons/tasks` |
| 标签 | `dsh-workbench-tags`  | `packages/addons/tags`  |
| 站点 | `dsh-workbench-sites` | `packages/addons/sites` |

- 源码内宿主仍叫 `dsh-workbench`；npm 上该名字已被无关项目占用，对外发布名必须是
  `dsh-workbench-host`。不要在源码里直接改名，统一由 `scripts/stage-release.mjs` 改写。
- 业务包通过 `dependencies` 依赖 `dsh-workbench-host`，安装任意业务插件会自动带宿主。
- 源码仓库：`https://github.com/ityyq777/dsh-workbench-source`（origin，唯一开发入口）。
- 对外发布仓库：`https://github.com/ityyq777/dsh-workbench`（发布镜像，不是源码仓库）。
- 市场列表仓库：`https://github.com/awesome-dsh-plugin/awesome-dsh-plugin`；
  市场页面是 dshmarket.com。

### 版本升级

发布前同步修改：

1. 对应 `packages/addons/<name>/package.json` 的 `version` 与 `wb.addon.version`；
2. 对应 `packages/addons/<name>/client/client.src.cjs` 里 `registerAddon` 的 `version`
   （`lib/client.js` 是 `pnpm build:clients` 的产物，不要直接改）；
3. 宿主版本改 `packages/shell/package.json`，业务包依赖范围按需调整；
4. 文档中的版本引用（docs/04、docs/09、docs/10、docs/11 等）。

### 本地校验

```sh
pnpm build
node scripts/dist-shell.mjs
pnpm test:native
pnpm test:clients
pnpm test:tags
pnpm test:sites
pnpm test:e2e
```

涉及界面或安装链路的改动，还要重启一个临时 profile 实例做真实加载验证，不要重启
正在使用的 3080 主实例。

### 生成发布树

```sh
pnpm stage:release
```

输出在 `dist/release/`：

- `packages/host`、`packages/tasks`、`packages/tags`、`packages/sites`；
- 四份 `marketplace/*.yml` 草稿；
- 根 README、LICENSE。

检查 `package.json` 的 name/dependencies/files/dsh.client.inject，确认宿主 id、patch name、
业务包依赖都已改写为 `dsh-workbench-host`。

### npm 发布

- 必须用官方 registry：`https://registry.npmjs.org`；本机默认 npmmirror，不要用默认值发布。
- 首次需要：`npm login --registry=https://registry.npmjs.org`。
- 发布顺序固定：host → tasks → tags → sites；业务包依赖宿主。
- 先 dry-run：

```sh
pnpm publish:npm
```

- 正式发布：

```sh
pnpm publish:npm -- --publish
# 有 2FA 时
pnpm publish:npm -- --publish --otp=123456
```

- 已存在的同名版本会被脚本跳过，不要为了重发而改版本号以外的元数据。
- 账号处于安全管控时不得尝试绕过；等限制解除后再发布。

### 更新 GitHub 发布镜像

发布镜像只放 `dist/release` 的产物，不直接编辑：

1. `pnpm stage:release`；
2. `pnpm publish:github`（dry-run，列出差异），确认后 `pnpm publish:github -- --publish`；
   脚本在 `~/.dsh/workbench/release-mirror` 里同步、提交（默认
   `release: workbench plugins <host 版本>`）并推送；
3. 源码仓库与镜像历史无关，**不要在源码目录里 `git push` 到镜像**（源码仓库只配置
   自己的 origin，不配置镜像 remote）；
4. 确认市场要求的 topic 存在：`dsh-plugin`（以及 `deepseek-harness` 等）；
5. 确认 `packages/<name>/package.json` 可通过 raw.githubusercontent.com 读取。

GitHub token 放在 `~/.dsh/workbench/github-token`（0600），只在推送时读取；
不得写入仓库、日志或对话。git 推送时不要把 token 持久化进 remote URL 或 git config。

### 插件市场收录与维护

- 一插件一个文件：`data/plugins/<owner>__<repo>.yml`；README 由脚本生成，不要手改 README。
- 本仓库是 monorepo：`url` 指向 `/tree/main/packages/<sub>`，`name` 用
  `ityyq777/dsh-workbench#<sub>`，文件名用
  `ityyq777__dsh-workbench--packages-<sub>.yml`。
- 必填字段：`url`、`name`、`category`、`description.en`；中文描述可选。
- 每个 PR 最多 3 个 entry，四个插件拆两个 PR：
  1. host + tasks + tags
  2. sites
- 收录硬条件：
  - 仓库 `package.json` 声明 `dsh.bundle`；
  - 仓库创建满 1 天（CI 会自动重跑放行）；
  - 仓库带 `dsh-plugin` topic；
  - 真实可用代码，不是纯聚合包。
- 版本升级不需要改市场 YAML；市场读取仓库中的 package.json 与 npm 版本。
- 新增插件时才需要新增 YAML 并提 PR；发布前先跑市场仓库的
  `scripts/check-submission.mjs`。

### 发布完成检查

- npm 四个版本可查询：`npm view <pkg> version --registry=https://registry.npmjs.org`；
- 全新临时 profile 用 npm 包名安装 tasks，确认宿主被自动解析；
- 首页出现对应卡片，视图可打开；
- 市场页面能搜到插件；
- 记录发布版本与日期到 `docs/14-发布与插件市场.md`。

### 安全

- GitHub token、npm token 只存本机私有文件，权限 0600；
- 不打印、不提交、不写进文档；
- token 一旦出现在对话、日志或提交中，发布完成后立即轮换。
