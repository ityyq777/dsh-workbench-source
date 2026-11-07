# 02 · DSH 插件设计（壳）

## 身份与打包

- npm 包名：`dsh-workbench`（发布后加入本仓库 `config/pulgins.json`，
  `plugin-install-type: "npm"`，`op_scope: []` 通用）。
- 结构对齐已验证先例（dsh-db-tool / dsh-prompt / progress-tick）：

```
dsh-workbench/
├── package.json          # exports: "."（host）与 "./client"
├── index.js              # cordis host 半边
├── client/client.js      # 浏览器侧 bundle（React，ModuleLoader 形态）
├── cordis.patch.yml      # - insert: [{ id: workbench, name: 'dsh-workbench', config: { enabled: true } }]
└── locale/*.json         # zh/en 文案
```

- `package.json` 的 `dsh.client` 声明 inject 依赖（宿主 UI 包）与 `platform: "web"`；
  `dsh.bundle.patch` 指向 cordis.patch.yml。

## host 半边（index.js）

```ts
export const name = "dsh-workbench";
// 注意教训（db-tool 注释原话）：不要把不确定存在的服务写进 inject —— 硬依赖缺失会让 fiber 永久 pending。
export const inject = ["webServer", "sessions", "tools"];
// connection / settings 用可选读取 ctx.get('connection', true)。

export function apply(ctx) {
  // 1. 打开本地库：core.openDb(~/.dsh/workbench/workbench.db)，跑迁移（见 05）
  // 2. addon 注册中心：扫描 ~/.dsh/workbench/addons/，校验 manifest，装载贡献点
  // 3. HTTP 桥：ctx.webServer.register({ kind:'prefix', path:'/workbench/api', handler })
  //    handler 顶层先过 ctx.connection?.requestRejection(req)（对齐 db-tool 鉴权栅栏写法）
  // 4. Agent 工具：ctx.tools.register({ name:'Workbench', ...单工具多 action })
  // 5. 生命周期清理全部挂 ctx.effect(fn, 'wb-*')
}
```

### Agent 工具设计（操作型插件能力的载体）

采用 DatabaseManager 验证过的 **单工具多 action** 模式，避免工具表爆炸：

```jsonc
{
  "name": "Workbench",
  "description": "个人工作台数据操作：任务记录/习惯打卡等 addon 提供的实体。写操作只经本地权威库。",
  "parameters": {
    "action": "list_addons | query | create | update | complete | stats",
    "...": "各 action 的参数对象",
  },
}
```

权限姿态：默认 rw（个人数据、本机进程）；删除整批/清空类 action 走
challengeId 确认流（照抄 db-tool 的危险操作模式）。addon 可向工具表贡献
schema 片段，壳合并成一份 parameters JSONSchema。

## client 半边

- 通过 `slots.inject("settings.plugins.tab", ...)` 注册「个人工作台」tab（主页面）；
  通过 `sidebar.right.pane.tab` 提供快速面板（今日任务速览）；
  `shell.overlay` 留给命令面板式快捷操作。UI 细节见 [03](./03-UI设计.md)。
- client 与 host 通信用**同源 fetch**（`/workbench/api/*`）——这是 dsh-prompt
  注释里明确记录的低风险路线（ctx.remote 在第三方 profile 内无先例）。

## 与宿主安装的接入（person-dsh 仓库侧改动）

1. `config/pulgins.json` 新增条目（pulgin-install/plugin-key/plugin-describtion/op_scope/adapt_version 齐全）；
2. `handlers/` 增加注册处理器（`type: community`，绑定 npm 包 `dsh-workbench`），
   配置参数放 `config/handlers.json`；遵循三阶段契约 validate/preflight/run；
3. 数据目录 `~/.dsh/workbench/` 首启自建，卸载保留（对齐"卸载不清理"惯例）。

## 版本兼容策略

- 每版本记录 `adapt_version`（仅记录不参与安装逻辑，清单约定）；
- 壳对宿主 API 只做**特性探测**（ctx.get(name, true)、typeof ctx.tools?.register），
  缺失时降级为"仅本地 UI、无 agent 工具"而不是拒绝启动。
