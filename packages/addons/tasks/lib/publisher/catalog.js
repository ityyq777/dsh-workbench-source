/**
 * 斜杠命令目录：`/命令` 页与 `tasks.commands` 的唯一事实来源。
 *
 * 只放元信息（名称、用途、用法、输入提示、示例、字符上限与说明），
 * 命令正文一律由 `buildBrief` 现场生成——例如发布 SOP 正文仍在 brief.js，
 * 目录里不复制一份，避免两处文字随版本漂移。
 *
 * 当前目录为空：`/wb-task-publisher` 已下架（5.5.1），发布任务改在输入区选择
 * 「任务发布者」角色。目录、注册循环与「命令」页都保留，日后要恢复或新增命令，
 * 在 TASK_COMMANDS 里加一条即可，页面与 tasks.commands 自动跟上。
 */
// 目录条目的正文生成函数（buildBrief）由条目自己带上，目录不 import brief.js：
// 发布 SOP 的正文只在 brief.js 维护，这里只做元信息与投影。

/** 只读模板里替换需求与会话 id 的占位符；页面提示「换回你的原话/当前会话 id」即为此。 */
export const TEMPLATE_PLACEHOLDERS = {
  requirement: "{需求描述}",
  sessionId: "<sessionId>",
};

export const TASK_COMMANDS = [
  // 5.5.1 起为空：唯一的斜杠命令 wb-task-publisher 已下架，发布任务改由输入区选择
  // 「任务发布者」角色（roles.js 的 publisher）。保留目录结构与页面，供日后新增命令。
];


/** 按名称取目录条目；找不到返回 undefined。 */
export function findCommand(name) {
  const key = String(name || "");
  return TASK_COMMANDS.find((entry) => entry.name === key);
}

/** 投影成可序列化的纯数据（去掉 buildBrief 等函数），供 tasks.commands 与页面使用。 */
export function commandCatalog() {
  return TASK_COMMANDS.map((entry) => ({
    name: entry.name,
    title: entry.title,
    summary: entry.summary,
    usage: entry.usage,
    inputHint: entry.inputHint,
    attachments: entry.attachments !== false,
    limit: entry.limit ? { field: entry.limit.field, max: entry.limit.max } : null,
    examples: (entry.examples || []).map((item) => item.text),
    notes: entry.notes,
    // 模板由 buildBrief 现场渲染，不另存一份正文：预览时需求与会话 id 用占位符、生成时间用 <生成时间>。
    template: renderTemplate(entry),
  }));
}

/** 用占位符渲染命令正文；没有 buildBrief 的条目没有模板。 */
function renderTemplate(entry) {
  if (typeof entry.buildBrief !== "function") return "";
  return entry.buildBrief({
    requirement: TEMPLATE_PLACEHOLDERS.requirement,
    sessionId: TEMPLATE_PLACEHOLDERS.sessionId,
    preview: true,
  });
}

/**
 * 命令的多行用法说明（空输入时回给用户）：第一行用法，随后示例，末段说明。
 * @param {object} entry TASK_COMMANDS 条目
 * @param {"zh"|"en"} lang 语言
 */
export function usageText(entry, lang) {
  const zh = lang !== "en";
  const pick = (value) => (zh ? value.zh : value.en);
  const lines = [(zh ? "用法：" : "Usage: ") + pick(entry.usage), "", zh ? "示例：" : "Examples:"];
  for (const item of entry.examples || []) lines.push("  " + item.text);
  lines.push("", pick(entry.notes));
  return lines.join("\n");
}
