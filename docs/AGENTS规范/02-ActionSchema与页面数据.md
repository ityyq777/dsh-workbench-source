# Action schema 与页面数据

> 从根 `AGENTS.md` 拆出的 schema 契约、文档同步与页面取数规范。


这一节不是文档洁癖：agent 调用工作台时，唯一能看到的就是每个 action 的 schema
（`actions.help` 里的 `input`、描述、`required`、示例）。schema 写错或写漏，agent
就会传错参、传了不生效，或者干脆不敢传——**大部分时间都是 DSH 读 schema 填参数的**。
所以 schema 是和实现同等的契约，改实现必须同步改 schema。

## Action schema 与能力清单

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


## 文档同步

`docs/插件功能清单.md` 是给人看的 action 清单，含版本表与 action 表；改 schema 时
把对应行的字段串、枚举描述、必填列一起改，并更新版本表与 action 数。

## 插件页面必须自证数据源，不许走宿主统一接口

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

