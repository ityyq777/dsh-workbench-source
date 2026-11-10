/**
 * `/wb-task-publisher` 的 brief 构造：把用户原话与发布 SOP 拼成一条
 * 模型可见的用户消息。纯函数，不依赖 ctx，便于单测。
 */

/** 需求正文长度上限：超过时让用户拆分或改用附件，不静默截断。 */
export const MAX_REQUIREMENT_LENGTH = 8000;

const SOP_STEPS = [
  "A. 调研现状，不要默认这是代码工作：按需求类型看页面、数据、文档、流程或既有任务；只有需求明确是代码改动时才看仓库。结论必须区分「用户说的 / 我查到的 / 我推测的」，并给出可核对证据（页面位置、数据口径、任务 id；代码类才给 路径:行号）。",
  "B. 润色与补充：标题写成「动词 + 对象 + 结果」；补齐背景、现状、目标、范围与非目标、验收标准、风险与依赖、计划完成日期、难度（0.5 步进）、优先级。用户没说的关键项标注「待确认」，不擅自扩大范围，不把推测写成事实。",
  "C. 归属（任务表 + 工作区）：先调用 taskNodes.overview 拿全量任务树，按职责选择任务表；出现多个候选必须问用户，禁止按热度、第一个候选或分数自动选择。没有合适节点时给出建议路径、命名与理由，获得授权后再创建。再调用 taskWorkspaces.list（默认按 updated_at 倒序，候选多时 pageSize 用到 100）取工作区，结合任务职责与工作区的 title/name/description/dir 判断归属，合法结果只有三种：不关联工作区、关联一个、关联多个。没有合适候选或关系不清楚时标「待确认」并提问，禁止按名称相似或列表第一条自动挂；需要新建工作区时先征得用户同意，不要擅自调用 taskWorkspaces.create。创建任务时把确认的工作区 id 传进 tasks.create 的 workspaceIds（整体替换语义，任一 id 非法会让整次创建回滚）。历史任务只作线索，不作现行规则。",
  "D. 时间线：判断现有时间线是否匹配、是否需要新建、能否与历史任务形成同一条线 / 重启链（restartKey）/ 后续任务。没有合适时间线就明确写「无时间线归属」，不要为了凑线硬挂。",
  "E. 发布：先调用 tasks.list 以标题关键词查重；创建时 source 用 0，dedupeKey 用「dsh-session:」前缀拼接 sessionId（用户手写发布可用自定义键），并把 C 步确认的 workspaceIds 一起传入。创建回执必须给出任务 id、任务表路径、工作区归属、时间线归属与计划完成日期，并给用户一屏摘要，不要原样贴 action JSON。",
  "F. 何时停下来问：归属有歧义、信息互相冲突、查重命中、需要新建节点或任务表时，先给草案并提问，不创建；信息齐全且归属唯一时直接发布。",
];

// 建节点/建表的授权与「何时可以直接发布」只由 SOP 的 C/F 两步定义，边界规则里不再重复，
// 否则两处口径会互相打架（F 说信息齐全就直接发，边界说必须先停下要授权）。
const BOUNDARIES = [
  "不要改 tasks.create / tasks.update 的 schema 与业务语义，也不要为了完成流程伪造数据或证据。",
  "一次性问答、临时查询不建任务；物品登记走 storage.create，只有开发/修复工作项才进任务表。",
];

function textOf(value) {
  return typeof value === "string" ? value : "";
}

/** 构造送进下一轮模型的 brief 文本。 */
export function buildPublisherBrief({ requirement, sessionId, now } = {}) {
  const raw = textOf(requirement);
  const sid = textOf(sessionId).trim() || "unknown";
  const stamp = now instanceof Date && !Number.isNaN(now.getTime()) ? now.toISOString() : new Date().toISOString();
  return [
    "请按任务发布 SOP 处理下面这条需求，并在本轮结束时给出发布结果或明确的待确认问题。",
    "",
    "## 用户原话（逐字保留，不要先改写）",
    raw.trim(),
    "",
    "## 本轮角色与产出目标",
    "你是任务发布助手：把用户的一句话需求整理成可执行、可核对、可追踪的任务，再决定是否发布。产出是「润色后的任务草案 + 归属与时间线判断 + 发布结果或待确认问题」，不是直接改代码。",
    "",
    "## 发布 SOP（按顺序执行）",
    ...SOP_STEPS,
    "",
    "## 输出格式",
    "1. 现状调研：三条以内，标注证据来源；没有证据就写「未核实」。",
    "2. 任务草案：标题、背景、目标、范围与非目标、验收标准、优先级、难度、计划完成日期。",
    "3. 归属与时间线：任务表完整路径（含 tableId）、工作区归属（无工作区，或名称 + id 列表）、时间线归属或「无时间线归属」、理由。",
    "4. 发布回执或待确认问题：已发布时给任务 id、路径、工作区归属（无工作区时写明「无工作区」，多个时列全名称与 id）、时间线、完成日期；未发布时给需要用户拍板的具体问题。",
    "",
    "## 边界规则",
    ...BOUNDARIES.map((line) => "- " + line),
    "",
    "## 会话信息",
    "sessionId: " + sid,
    // 不要把 dsh-session: 前缀和裸 sessionId 连写：DSH 会把 "dsh-session:<base64url>" 当会话引用 URI，
    // 裸 id 不是合法 payload，会让下一轮在模型调用前就解析失败。这里只描述拼法，由模型自行组装。
    "dedupeKey 建议: 用 \"dsh-session:\" 前缀拼接上面的 sessionId（前缀后接的是会话 id 本身）",
    "生成时间: " + stamp,
  ].join("\n");
}
