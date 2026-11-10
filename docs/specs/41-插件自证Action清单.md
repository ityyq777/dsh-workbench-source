# 41 插件自证 Action 清单（各项自己负责）

## 1. 背景与问题

「Action 清单」页最初读取宿主统一接口 `GET /workbench/api/schema`。这带来两个问题：

- 页面属于各业务插件，却依赖宿主的数据结构；宿主改快照形状会连带改所有插件的页面。
- 插件无法在宿主未加载对应路由时自证清单，页面只能报 `no schema api`。

结论：**清单归各插件自己**。宿主统一接口保留，服务于宿主自身的跨域场景（如调试台、跨域脚本），不再作为插件页面的数据源。

## 2. 设计

每个业务插件在 `setup(api)` 里用 `trackActions(api)` 包一层 `api.action`，把注册过的 action 定义记到本地 `Map`；注册完成后调用 `registerActionSchemaAction(api, defs, domain)`，注册只读 action `<域>.actionSchema`：

- `tasks.actionSchema`（wb-addon-tasks）
- `tags.actionSchema`（wb-addon-tags）
- `sites.actionSchema`（wb-addon-sites）
- `storage.actionSchema`（wb-addon-storage）

返回结构：

```json
{
  "shellVersion": "0.6.5",
  "domains": [{ "id": "wb-addon-tasks", "version": "3.5.1" }],
  "actions": [
    { "name": "tasks.list", "domain": "wb-addon-tasks", "description": "…", "input": { "type": "object", "properties": {} }, "examples": [] }
  ]
}
```

`input` 原样返回注册时的 JSON Schema，`examples` 取自 action 定义的 `examples`；`version` 取 `api.addon.version`，避免与版本号手工同步。

客户端共享视图 `packages/addons/lib/action-schema-view.cjs` 通过 `api.call("<域>.actionSchema")` 取数并解包 `{ ok, result }`，不再调用 `api.schema`。

## 3. 边界

- 只读：不执行 action、不写库、不产生审计记录。
- 插件自证：清单只含本域 action；插件未加载时视图按错误态提示，不伪造空清单。
- 宿主 `GET /workbench/api/schema` 与 `actions.list(detail=true)` 不变，继续用于宿主场景。
- 新增 action 属于 agent 可见 schema 变更，按仓库约定同步版本号与 `docs/插件功能清单.md`。

## 4. 验收

- `pnpm test:action-schema`：四个插件分别注册 `<域>.actionSchema`，快照只含本域、版本取自 `addon.version`、每条含 `input` 与 `examples`；客户端 bundle 不含 `/workbench/api/schema`。
- `pnpm test:addon-actions`：视图渲染、搜索/筛选、错误与空态通过 `api.call` 路径。
- `node scripts/audit-actions.mjs`：五处版本号、schema 与实现一致。
