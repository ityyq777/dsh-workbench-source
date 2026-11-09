# 仓库约定

执行一类任务后自动执行 git commit；配置了 remote 时再 push。

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

### 本地安装要重装，不是只重启

`~/.dsh/profiles/<profile>/node_modules/` 里是**拷贝安装**的产物，源码改完不重装就
还是旧的。典型症状：`capabilities.list` 报的版本比源码低、新 action 在 `actions.list`
里看不到、`actions.help` 返回的是旧描述。

本次踩坑：`dsh-workbench-tags` 的 `package.json` 已是 1.4.2，但 `lib/tags.js` 还是旧构建，
`tags.update` 根本没注册进去——重启 DSH 也没用，必须重新打包安装该插件。
改完插件的正确姿势：`pnpm build` → 重新安装到 profile → 重启 DSH → 用
`capabilities.list` 核对版本号与 `actionCount`。

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

### 文档同步

`docs/插件功能清单.md` 是给人看的 action 清单，含版本表与 action 表；改 schema 时
把对应行的字段串、枚举描述、必填列一起改，并更新版本表与 action 数。

## 插件市场发布与维护

个人工作台由四个 DSH 原生插件组成，发布链路与市场维护都按本节执行。

### 包与命名

| 用途 | npm 包名 | 源码目录 |
| --- | --- | --- |
| 宿主 | `dsh-workbench-host` | `packages/shell-dist` |
| 任务 | `dsh-workbench-tasks` | `packages/addons/tasks` |
| 标签 | `dsh-workbench-tags` | `packages/addons/tags` |
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
