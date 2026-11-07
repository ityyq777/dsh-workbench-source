# 02 · DSH 插件设计（宿主）

## 身份与打包

- npm 包名：`dsh-workbench`，当前版本 0.3.1。
- 可安装产物由 `node scripts/dist-shell.mjs` 生成到 `packages/shell-dist`，
  该目录是一个自包含包：宿主 lib、内联后的 core、客户端 bundle、cordis patch。
- 目录形态：

```
dsh-workbench/
├── package.json          # main lib/index.js；exports "." 与 "./client"
├── cordis.patch.yml      # insert workbench 行
├── lib/index.js          # cordis 宿主入口
├── lib/sync.js           # 同步循环
├── lib/core/index.js     # @wb/core 内联产物
└── client/client.js      # 浏览器 ModuleLoader bundle
```

- `package.json` 声明 `dsh.bundle.patch` 与 `dsh.client`
  （`platform: "web"`，inject 宿主 UI 包）；DSH 安装器据此激活服务端与客户端两半。

## 服务端入口

```ts
export const name = "dsh-workbench";
export const inject = ["webServer", "tools", "connection"];
export function apply(ctx) {
  // 1. openDb(~/.dsh/workbench/workbench.db)，平台表 + change_log
  // 2. 建立域注册中心，ctx.provide("workbench", host)
  // 3. ctx.webServer.register({ kind:'prefix', path:'/workbench/api', handler })
  // 4. ctx.tools.register({ name:'Workbench', ... })
  // 5. 30s 同步循环；ctx.effect 清理 timer 与所有域 dispose
}
```

要求：`connection` 在宿主 profile 中始终存在，因此放进 inject；若未来面向缺失该服务的
环境，可改为 `ctx.get("connection", true)` 并在请求栅栏处判空。

### 域注册中心

业务插件在自己的 `apply(ctx)` 中调用：

```ts
ctx.effect(() => ctx.workbench.registerDomain({
  id: "wb-addon-tasks",
  title: "任务记录",
  version: "2.1.1",
  tables: ["task", "task_node"],
  views: [{ id: "tasks", title: { zh: "任务记录", en: "Tasks" } }],
  setup(api) {
    api.action("tasks.list", { description, input, execute });
    // ...
  },
}), "tasks-domain");
```

宿主校验域 id（`^[a-z][a-z0-9_-]{2,63}$`）与 action 名（必须含点号），
维护 `domains` Map 并发 `domains-changed`。某个域 setup 抛错时只标记该域
`error`，不拖垮宿主；`invoke` 只路由到已就绪且未出错的域。

### Agent 工具

仍然采用**单工具多 action**，避免工具表爆炸：

```jsonc
{
  "name": "Workbench",
  "description": "个人工作台数据操作；action 由已加载的业务插件提供",
  "parameters": { "action": "tasks.list", "...": "additionalProperties: true" }
}
```

- 带点号的 action 原样分发；不带点号的旧名（如 `list`、`create`）映射到 `tasks.*` 保持兼容。
- `addons.*` 时代的安装/卸载 action 已删除；插件安装交给 DSH。
- 删除/清空类危险 action 若将来加入，沿用 challengeId 确认模式。

## 客户端半边

- 通过 `slots.inject("sidebar.panellist", ...)` + `main` 注册左侧导航与工作台主页面，
  同时通过 `settings.plugins.tab` 打开同一页面；主页是卡片网格，点卡片进入
  业务插件沉浸式全页。UI 细节见 [03](./03-UI设计.md)。
- 宿主客户端先挂载 `window.__WB_HOST__ = { react, jsx, h, addons, registerAddon, ... }`；
  业务插件的 `dsh.client.inject: ["dsh-workbench"]` 保证加载顺序，业务 factory 内直接读取该桥。
- 客户端与宿主通信用**同源 fetch**（`/workbench/api/*`）与 SSE（`/workbench/api/events`）。

## 安装接入

```bash
pnpm build && node scripts/dist-shell.mjs
dsh plugin --profile web add file:$PWD/packages/shell-dist
```

业务插件各自 `dsh.bundle.patch` 同时插入 workbench 行与自身行，因此安装业务插件时
即使没有显式安装宿主，profile 里也会出现宿主依赖并由 Cordis 按 id 折叠为单实例。
卸载最后一个业务插件时，宿主作为其依赖可能被 pnpm 一并移除；这是允许的行为，
数据目录 `~/.dsh/workbench/` 始终保留。

## 版本兼容策略

- 宿主导出 `SHELL_VERSION`（当前 0.3.1），业务 manifest 的 `wb.addon.minShell` 与
  `DomainSetupApi.shellVersion` 都基于它做兼容判断。
- 宿主对可选服务只做**特性探测**（`ctx.get(name, true)`、`typeof ctx.tools?.register`），
  缺失时降级而不是拒绝启动。
- 业务插件升级不要求宿主重启之外的额外操作；DSH 插件页完成替换后会重新 apply。
