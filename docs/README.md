# 个人工作台（Personal Workbench）— 方案总览

> 状态：构思稿 v0.1（M0–M3 demo 已实现并装入 web profile 实测通过；本文档集基于对本机 DSH 安装包与已装社区插件源码的实测调查）。
>
> ## Demo 运行方式
>
> ```bash
> # 云端（demo 用 SQLite + 本机进程）
> node packages/cloud/lib/server.js --port 8791 --data /tmp/wbcloud --publish-token demo-publish
> # 插件构建与安装（把 @wb/core 内联成自包含包）
> pnpm build && node scripts/dist-shell.mjs
> dsh plugin --profile web add file:$PWD/packages/shell-dist
> # 重启 dsh web 后生效；插件注册 Workbench agent 工具与 /workbench/api 前缀
> ```
>
> 实现与设计文档的偏差（v0.2 收敛项）：云端用 node:http 而非 Fastify；子插件发布走 JSON+base64 而非 multipart；插件分发先以 shell-dist 单包内联 @wb/core，正式版再拆 npm 依赖。

## 一句话定位

「个人工作台」是一个 **DSH 宿主插件**，同时自身又是一个 **小型插件平台**：
它有自己的子插件体系（任务记录、习惯打卡……），有自己的安装源；
未登录时数据全部写本机 SQLite，登录后与自建云端双向同步。

```
┌─────────────────────────── DSH (宿主) ───────────────────────────┐
│  slot: settings.plugins.tab / sidebar.right.pane.tab / overlay   │
│  ┌──────────────── 个人工作台 DSH 插件 (客户端壳) ────────────────┐ │
│  │  React UI (jsx-runtime + --dsw-alias-* tokens)                │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐                          │ │
│  │  │ 任务记录 │ │ 习惯打卡 │ │ 更多子插件…                        │ │
│  │  └─────────┘ └─────────┘ └─────────┘  ← 工作台子插件(独立包)   │ │
│  │  本地存储: SQLite (~/.dsh/workbench/workbench.db)              │ │
│  │  Agent 工具: ctx.tools.register → workbench_*                 │ │
│  │  HTTP 桥:  ctx.webServer prefix /workbench/api                │ │
│  └──────────────────────┬────────────────────────────────────────┘ │
└─────────────────────────┼──────────────────────────────────────────┘
                          │ 同步协议 (登录态)
              ┌───────────▼───────────────────────┐
              │  Workbench Cloud (自研)            │
              │  账号/设备/同步 + 子插件安装源目录   │
              │  (catalog API + tarball 分发/发布)  │
              └───────────────────────────────────┘
```

## 文档导航

| 文档                                        | 内容                                                           |
| ------------------------------------------- | -------------------------------------------------------------- |
| [01-总体架构](./01-总体架构.md)             | 三层结构、包拆分、命名、关键决策与备选对比                     |
| [02-DSH插件设计](./02-DSH插件设计.md)       | 宿主半边（cordis 服务）、生命周期、manifest、pulgins.json 接入 |
| [03-UI设计](./03-UI设计.md)                 | 工作台页面布局、slot 用法、React 组件规范、精美度路线          |
| [04-子插件体系](./04-子插件体系.md)         | 工作台自己的插件协议、安装源、「任务记录」示例、操作型子插件   |
| [05-本地存储设计](./05-本地存储设计.md)     | SQLite schema、迁移策略、storageDomain vs 直连 sqlite 取舍     |
| [06-云端设计](./06-云端设计.md)             | 账号体系、同步 API、服务端技术选型                             |
| [07-同步与登录设计](./07-同步与登录设计.md) | 离线优先、变更日志、冲突处理、设备管理、隐私边界               |
| [08-路线图与里程碑](./08-路线图与里程碑.md) | M0~M4 分期交付与验收标准                                       |

## 已验证的宿主事实（方案地基，非猜测）

以下均来自对本机 `@deepseek-ai/dsh` 及已装插件源码的直接观察：

1. 插件 client bundle 运行在共享 React 上（`react/jsx-runtime`），有 CSS Modules 管道；
   `@deepseek-ai/dsh-client-ui-theme` 提供约 114 个 `--dsw-alias-*` 语义令牌（radius/elevation/gradient/font/focus 分类齐全）。
2. slot 贡献 API：`slots.inject(id, register)`；实测存在的 id：
   `settings.plugins.tab`、`settings.plugin.item`、`sidebar.right.pane.tab`、
   `sidebar.panellist`、`shell.overlay`、`plugins.detail.section`、`plugins.bundle.config`。
3. cordis 服务端形态：包导出 `apply(ctx)` + `export const inject = [...]`，清理用 `ctx.effect`。可用服务（按已装插件先例）：
   - `storageDomain`：zod 校验 KV 域，落盘 `<home>/storages/*.json`，backend 可按域名路由（Config.backend + Config.routes）——先例 dsh-prompt。
   - `webServer`：`ctx.webServer.register({ kind:'prefix', path, handler })` 挂同源 HTTP——先例 dsh-db-tool、dsh-prompt。
   - `connection`：`ctx.connection.requestRejection(req)` 返回 401/403 或 undefined，浏览器鉴权栅栏——先例 dsh-db-tool。
   - `tools`：`ctx.tools.register({ name, description, parameters: JSONSchema, timeoutMs })` 注册模型工具——先例 DatabaseManager（单工具多 action 模式）。
   - `sessions` / `settings` / `agents`：会话头（header.cwd）、设置读写——见多个插件 inject。
4. 第三方插件自带安装器是成熟先例：dshmarket 有完整 `lib/install.js`、`catalog-npm.js`、
   `compatibility.js`、`drain-journal.js`（下载→暂存→发布流水线）。原生 sqlite 亦有先例（dsh-db-tool 引用 node:sqlite/better-sqlite3，vendor 目录随包分发预编译件）。
5. 本仓库安装约定：`config/pulgins.json` 清单（npm/git/local 三种 plugin-install-type）+
   每插件 `cordis.patch.yml`（profile 层注入声明）。

## 核心决策速览（详见各分册）

| #   | 决策         | 选择                                                                                                            | 理由                                                                               |
| --- | ------------ | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| D1  | 主体形态     | 一个 DSH 插件（壳）+ N 个工作台子插件（内容）                                                                   | 壳走宿主更新通道；子插件走自己的源，互不阻塞                                       |
| D2  | 本地权威存储 | 直接 better-sqlite3（native 模块随包分发），不走 storageDomain JSON                                             | 同步需要行级变更日志与索引查询，JSON 域承载不了；db-tool 已证明 native/vendor 可行 |
| D3  | 子插件协议   | manifest + JS 动态加载（同 context，约定隔离）；iframe 为强隔离备选                                             | 一期快速做通；视生态再收紧                                                         |
| D4  | 同步模型     | 离线优先 + 每表变更日志（change log table）+ LWW per field                                                      | 任务/打卡类数据冲突面小；CRDT 留作演进                                             |
| D5  | 云端         | Node + Fastify + Postgres，单机可 docker-compose 自托管；**addon 安装源（catalog 服务）部署在云端**，与同步平级 | 与客户端同为 TS；目录上云换来兼容过滤、yank 撤回、发布流水线与统计回路             |
| D6  | 代码库       | `~/code/dsh-workbench` pnpm monorepo                                                                            | 壳、子插件、SDK、云端同仓联调                                                      |
