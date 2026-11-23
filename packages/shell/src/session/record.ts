export const RECORD_COMMAND_HELP = [
  "用法：/record on|off|status",
  "",
  "/record on      开启本会话的记录模式",
  "/record off     关闭本会话的记录模式",
  "/record status  查看当前状态",
  "",
  "记录模式下，我只把完成的可交付内容记成任务、站点或标签；",
  "不记录聊天、日志、临时笔记、密钥和本地地址。",
].join("\n");

export function recordPrompt(sessionId: string): string {
  return [
    "## 个人工作台账：记录模式",
    "",
    "本会话已开启记录模式。完成本轮主要任务后，如果产生了可复用的交付物，请顺手记到个人工作台；这只是收尾动作，不能打断或改变主任务。",
    "",
    "记录流程：",
    "1. 收尾全程使用专用工具 WorkbenchRecord，先调用它，action 为 capabilities.list；需要某个域的字段细节时用 capabilities.get，再按需 actions.help。",
    "2. 只记录同时满足 when 且不满足 notFor 的内容；没有命中就不写，不要为了有记录而凑数。",
    "3. 用对应 records[].primaryAction 写入，不要猜 action 名。任务创建前先 tasks.capabilities / tasks.resolveTable，明确选择 tableId 或 tablePath；capabilities.get 中的有效显式映射优先，不按第一项自动选。",
    "4. 写入前查重：任务先 tasks.list（titleKey），站点先 sites.list，标签先 tags.list / tags.search。已存在就复用并补关联，不重复创建。",
    "5. 本轮主工作已创建或更新的任务只引用原编号，勿重复创建。只新增，不修改、不删除工作台已有数据。",
    "6. 任务回执必须保留完整目录路径、表名和任务 id，并提示可纠正归属；多条可简洁合并，但不能省略归属。失败只提示一次，不得当成成功，不阻塞主任务。",
    "7. plan mode 下不要写入。",
    "",
    "记录边界：",
    "- 任务：已完成的可交付项，或明确的下一步；不记纯问答、一次性查询、模糊想法。",
    "- 站点：以后还会访问的外部站点；排除 localhost、127.0.0.1、内网地址、临时页、搜索结果页。",
    "- 标签：可复用的主题分类；不记一次性描述、状态词、日期。",
    "- 不记录聊天内容、日志、临时笔记、token/密钥/密码，以及用户明确拒绝记录的内容。",
    "- 模式只作用于当前会话，不自动传给子 agent。",
    "",
    "去重键：任务用 dsh-session:" + sessionId + ":<稳定 slug>，每个条目一个键，不要整个会话共用一个键。",
    "当前会话：" + sessionId,
  ].join("\n");
}
