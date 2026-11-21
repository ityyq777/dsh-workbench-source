# 57 · 布尔控件统一为开关，并抽出共享 Switch 组件

> 状态：已实施（2026-11-21）。
> 目标版本：13 个插件各一个 patch + 宿主 shell `0.8.5`。
> 关联：[04-UI规范](../AGENTS规范/04-UI规范.md)、[01-代码风格与目录](../AGENTS规范/01-代码风格与目录.md)。

## 0. 一句话结论

盘点发现「布尔值」被写成了复选框，而且开关本身有 5 套私有实现；本次把布尔开关收敛成
`packages/addons/lib/switch.cjs` 一份实现（`role="switch"` 按钮 + 主题 token 样式），13 个插件
的布尔项全部接入，**多选清单继续用原生 checkbox**。

## 1. 盘点结论（改动前）

| 形态 | 位置 | 判定 |
| --- | --- | --- |
| 私有开关（`-cfg-switch`/`-cfg-track`） | `tasks`/`tags`/`sites`/`storage` 的 `client/views/config.cjs` | 视觉已是开关，但四份复制 → 收敛 |
| 私有开关 `wbml-switch` | `mail/client/ui/styles.cjs`、`mail/client/views/config.cjs` | 收敛 |
| 私有开关 `wbdm-switch`/`wbdm-track`/`wbdm-knob` | `danmaku/client/styles.cjs` 与三个视图 | 收敛 |
| 私有开关 `wba-switch` | `automation/client/ui/layout-styles.cjs`、`rule-editor.cjs` | 收敛 |
| 私有开关 `.P-switch` | `lib/data-style.cjs`（数据页布尔筛选） | 收敛 |
| 原生复选框承载布尔 | `message` 设置页 bool 与收件箱「仅未读」、`mail` 5 个 bool 与 TLS 行、「只看未读」、`shell` 登录 `signup`、`tasks` 的「未填难度」「单条时间线」与两处新建路径确认 | 改成开关 |
| 多选复选框 | 标签/分组/成员/状态筛选、选择模式、全选、`action-picker`、附件、收件人、工作区清单、备份多选 | **保持 checkbox** |

## 2. 共享组件契约

`packages/addons/lib/switch.cjs` 导出 `{ Switch, styles }`：

- `Switch({ h, checked, disabled, label, showState, onText, offText, title, ariaLabel, className, onChange })`
  渲染 `<button type="button" role="switch" aria-checked>` + `.wbctl-switch-track` + `.wbctl-switch-knob`，
  点击 `preventDefault()` 后回调 `onChange(!checked)`。
- 有可见文案（`label` 或 `showState` 的开/关文本）时不再输出 `aria-label`，避免重复朗读。
- `styles` 是固定类名 CSS，颜色只取 `--wb-muted/--wb-accent/--wb-card`（含 `color-mix` 回退），
  自带 `:focus-visible`、`:disabled`、`prefers-reduced-motion`。
- `client-common.cjs` 额外暴露 `Switch` 与 `switchStyles`，插件按自身前缀取用。

样式注入位置：插件样式表末尾 `.concat(SW.styles)`。`automation` 例外——它的
`client/ui/layout-styles.cjs` 被 `test/ui.test.mjs:228` 约束「版式层不得出现 hex/rgba」，
而共享样式含 `#2563eb/#fff` 兜底，所以注入点是真正下发的 `client/ui/styles.cjs`。

## 3. 落地范围

- 迁移：`lib/data-view.cjs`（含 `lib/data-style.cjs` 删 `.P-switch`）、tasks、tags、sites、storage、
  message、mail、danmaku、automation、shell。
- 删除的死样式：`-cfg-switch`/`-cfg-track`（4 处）、`wbml-switch`/`wbml-switch-text`、
  `wbdm-switch`/`wbdm-track`/`wbdm-knob`（7 条）、`wba-switch`、`.P-switch`，以及
  `tasks/client/timeline/timeline-styles.cjs` 里 `.wbt-timeline-single` 的两条规则。
- 测试：`test-data-ui`、`test-tasks-date-ui`、`test-timeline-ui`、`test-tasks-difficulty-ui`、
  `test-mail-config`、`test-mail-layout`、`test-message-config-state` 改按 `role="switch"` 定位；
  `automation/test/ui.test.mjs` 新增 `aria-checked` 两态断言。

## 4. 验收

`pnpm test:shared-ui`（13 插件全覆盖）、`test:data-ui`、`test:clients`、`test:config`、
mail/message/storage/tags/sites/timeline/task-config-ui 全绿；`eslint` 干净；`pnpm build` +
`pnpm dist:shell` + 装进 desktop profile + `pnpm audit:profile` 一致。
