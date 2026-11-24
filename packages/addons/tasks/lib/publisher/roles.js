/** 任务插件贡献的会话角色。动作清单只描述工作台调用的上界。 */
import { PUBLISHER_INSTRUCTIONS } from "./brief.js";

const reads = ["tasks.get", "tasks.list", "tasks.workspaces", "tasks.timeline", "taskNodes.overview", "taskWorkspaces.list"];

export const TASK_ROLES = [
  {
    id: "publisher",
    name: "任务发布者",
    description: "整理需求、核对归属与验收标准，按要求发布任务。",
    version: "1.1.0",
    instructions: PUBLISHER_INSTRUCTIONS,
    actions: [...reads, "tasks.update", "tasks.timelines", "tasks.tags", "tasks.tagOptions", "taskTimelines.get",
      "tasks.create", "taskNodes.create", "taskWorkspaces.create", "taskTimelines.create", "taskTimelines.attach"],
  },
  {
    id: "executor",
    name: "任务执行者",
    description: "围绕已有任务推进工作，记录阻塞、进展或验收证据。",
    version: "1.0.0",
    instructions: [
      "先从用户引用或上文定位任务，再用 tasks.get 核对当前状态、工作区与验收标准。若有多个候选，列出编号并请用户选定。",
      "用户询问进度时只读。收到执行要求后围绕选定任务推进工作，保留可核对的交付证据。",
      "按需用 tasks.update 回写该任务的进展或阻塞，保留原始需求和验收标准。只有验收完成并有证据时才用 tasks.complete。",
      "回执给出任务编号、实际完成项、证据和待处理事项。切换角色本身不启动工作或改变状态。",
    ].join("\n"),
    actions: [...reads, "tasks.update", "tasks.complete"],
  },
];
