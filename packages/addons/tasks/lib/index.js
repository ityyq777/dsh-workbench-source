/**
 * 任务记录业务插件（DSH 原生插件）。
 *
 * 所有业务逻辑都在本地 SQLite 完成；云端只负责备份。
 * 宿主由 dsh-workbench 提供，通过 ctx.workbench.registerDomain 注册。
 */

import { bindClock, ensureSchema } from "./db.js";
import { exportTasksData, importTasksData } from "./backup.js";
import { taskSync } from "./sync.js";
import { registerTaskActions } from "./tasks.js";
import { registerTreeActions } from "./tree.js";
import { registerConfigActions } from "./config.js";
import { registerDataActions } from "./data.js";

export const inject = ["workbench"];

let domainApi = null;
function requireApi() {
  if (!domainApi) throw new Error("任务模块尚未初始化");
  return domainApi;
}

/** 旧 addon 形态的初始化函数，单测/兼容直接调用。 */
export function setup(api) {
  domainApi = api;
  if (typeof api.now === "function") bindClock(api.now);
  ensureSchema(api.db, api.log);
  registerTaskActions(api);
  registerTreeActions(api);
  registerConfigActions(api);
  registerDataActions(api);
  api.log("tasks domain ready", api.addon.version);
}

export function apply(ctx) {
  const host = ctx.workbench;
  if (!host) throw new Error("dsh-workbench 未加载：缺少 workbench 服务");
  ctx.effect(
    () =>
      host.registerDomain({
        id: "wb-addon-tasks",
        title: "任务",
        description: "任务树 + 统计/记录/配置/数据四个视图：紧急/已关闭/进行中/已完成/总览，可按标签筛选，附统计报表与只读数据浏览",
        version: "2.10.2",
        tables: ["task", "task_dep", "task_node"],
        sync: taskSync,
        views: [
          { id: "stats", title: { zh: "统计", en: "Stats" } },
          { id: "tasks", title: { zh: "记录", en: "Records" } },
          { id: "config", title: { zh: "配置", en: "Config" } },
          { id: "data", title: { zh: "数据", en: "Data" } },
        ],
        capability: {
          summary: "记录可执行、可交付的工作项（任务），支持任务树、时间线、重启链与依赖。",
          records: [
            {
              kind: "task",
              title: "任务",
              description: "一个有明确结果的工作项；可以归入任务表、时间线或重启链，并挂标签。",
              when: [
                "一个工作项已经完成，或已经有明确下一步，值得进入工作台继续跟进",
                "用户明确说“记一下 / 建个任务 / 加到工作台 / 以后要做”",
                "会话中发现需要后续处理、但当前不立即完成的动作",
              ],
              notFor: [
                "纯信息查询或一次性问答，没有可执行结果",
                "没有明确标题或完成标准的模糊想法；先描述清楚再记",
              ],
              primaryAction: "tasks.create",
              keyArgs: ["title", "description", "priority", "targetDate", "tags", "tagIds", "dedupeKey"],
              dedupe: "同 dedupeKey 的未删除任务会被复用；自动记录建议使用稳定键，如 dsh-session:<id>。",
              relations: [
                { kind: "taskNode", via: "tableId", description: "需要归组时先查任务表；缺省使用默认任务表。" },
                { kind: "tag", via: "tags / tagIds", description: "用标签做主题归类（工作/生活/学习/开发 已是标签）；传标签名会自动建。" },
              ],
              examples: [
                {
                  purpose: "记录一次已完成的工作项",
                  args: {
                    title: "整理工作台能力清单",
                    description: "梳理各插件 action 与记录边界",
                    tags: ["开发"],
                    priority: 6,
                    targetDate: "2026-11-08",
                  },
                },
              ],
            },
          ],
          fields: [
            { name: "tab", type: "number | \"all\"", description: "列表页签：0=紧急（status=0 且 priority>=6 或 targetDate<=今天+2）、1..4=旧类型页签（按同名标签筛，已弃用）、5=已关闭（默认 SHUTDOWN=1，filterRestarted=false 时看 RESTARTED=3）、6=进行中(0)、7=已完成(2)、8=总览（排除已重启）；缺省或传 all 等于 8" },
            { name: "status", type: "0|1|2|3", description: "0=进行中 ACTIVE、1=已关闭 SHUTDOWN、2=已完成 DONE、3=已重启 RESTARTED（创建时不允许 3）；也接受 open/done。别按“0=未开始”理解：0 是在办" },
            { name: "priority", type: "0..10", description: "数值越大越紧急，不是越小越急；0=未设置、不占紧急页签；>=6 进紧急页签（tab=0）；参数优先级 min/max 同样是数值越大越急；任务改为已完成时自动清零" },
            { name: "difficulty", type: "0..5", description: "完成难度，数值越大越难；留给完成时填写" },
            { name: "sort", type: "string", description: "priority / target（targetDate）/ publish（publishDate）/ updated / created / manual（sort 列）；前缀 - 表示降序，例如 sort=-priority 才是最紧急在前；不传时未分页按 priority 降序，分页（tab 5..8 或传 pageNumber/pageSize）按 publishDate 降序" },
            { name: "order", type: "asc|desc", description: "显式指定排序方向，覆盖 sort 前缀" },
            { name: "targetDate", type: "YYYY-MM-DD", description: "目标日期（截止）；缺省表示未定；targetFrom/targetTo 按它过滤，target<今天且未完成即视为逾期" },
            { name: "publishDate", type: "YYYY-MM-DD", description: "发布日期，缺省为创建当天" },
            { name: "doneDate", type: "YYYY-MM-DD|null", description: "完成日期，改成已完成时自动补今天" },
            { name: "shutdownDate", type: "YYYY-MM-DD|null", description: "关闭日期，改成已关闭时自动补今天" },
            { name: "titleKey", type: "string", description: "关键词，同时模糊匹配标题与描述（OR）" },
            { name: "tableKey", type: "string", description: "任务表关键词，同时匹配表名与表描述" },
            { name: "tableId / groupId", type: "string|number", description: "按任务表 / 任务组过滤；groupId 含义是该组下所有任务表" },
            { name: "tags / tagIds", type: "string[]", description: "写入时是整体替换（会覆盖原有标签，批量套用最危险）；读取时是“命中任一”过滤。tags 传标签名，不存在会自动建" },
            { name: "addTags / removeTags / addTagIds / removeTagIds", type: "string[]", description: "增量加/减标签，保留其余标签；不能与 tags/tagIds 同时传" },
            { name: "pageNumber / pageSize", type: "number", description: "页码从 1 开始，每页默认 12、上限 200；任意 tab 传了就分页" },
            { name: "type", type: "0|1|2|3|4", description: "仅 tasks.update 使用：0=改状态 1=改优先级 2=改标题 3=改描述 4=改感受；这是“更新模式”，不是任务类型（任务没有类型字段，用标签表达）" },
            { name: "review", type: "string", description: "完成后的感受/复盘自由文本，通常随完成一起写入" },
            { name: "range / from / to", type: "7d|30d|90d|365d|all / YYYY-MM-DD", description: "仅统计类 action：range 是快捷区间（缺省 30d），from+to 手动区间是闭区间 [from,to]，两端都含；同时传时以 from/to 为准" },
            { name: "dedupeKey", type: "string", description: "去重键：同键的未删除任务会被复用而不是新建，自动记录建议用 dsh-session:<id>" },
            { name: "source / timelineKey / restartKey", type: "0|1|2 / string", description: "来源：0=普通任务 1=时间线任务 2=重启任务；source=1 需要 timelineKey，source=2 需要 restartKey" },
          ],
          notFor: ["不要用它保存聊天记录、日志或临时笔记"],
          notes: [
            "date 字段均为 YYYY-MM-DD；source=1/2 时分别需要 timelineKey / restartKey。",
            "status 0 进行中 / 1 已关闭 / 2 已完成；不要直接创建 RESTARTED（3）。",
            "任务没有「类型」字段：工作/生活/学习/开发 已迁成同名标签，用 tags 或 tagIds 归类。",
          ],
        },
        setup,
        exportData: () => exportTasksData(requireApi()),
        importData: (raw, _ctx, options) => importTasksData(requireApi(), raw, options),
      }),
    "tasks-domain",
  );
}