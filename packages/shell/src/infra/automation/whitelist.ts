/**
 * 自动化白名单：硬底线（不可配置）+ 本机允许列表的规范化与校验。
 *
 * 与源码一致：vault / automation / audit 三个域以及任何 delete / backup 类 action
 * 永远不允许被自动化调用，即使写进了配置也会在读取时被清洗掉。
 */

/** 永远不允许被自动化调用的 action（硬底线）。 */
export const DENIED = /^(vault|automation|audit)\.|\.(delete|backup)/i;

/** 给界面展示的硬底线模式清单。 */
export const DENIED_PATTERNS = ["vault.*", "automation.*", "audit.*", "*.delete", "*.backup"];

const SEGMENT = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** 是否命中硬底线。 */
export function isDenied(name: unknown): boolean {
  return DENIED.test(String(name || ""));
}

/** action 名必须是 2–3 段、每段为合法标识符。 */
export function validActionName(name: unknown): boolean {
  const text = String(name || "").trim();
  const parts = text.split(".");
  if (parts.length < 2 || parts.length > 3) return false;
  return parts.every((part) => SEGMENT.test(part));
}

/**
 * 规范化允许列表：去空白、去重、按字母序。
 * strict=true 时遇到非法名或命中硬底线直接抛错（用于写入配置）；
 * strict=false 时静默丢弃（用于读取已有配置，避免脏数据让整页崩掉）。
 */
export function normalizeAllowedList(input: unknown, strict = false): string[] {
  const rows = Array.isArray(input) ? input : [];
  const seen = new Set<string>();
  for (const row of rows) {
    const name = String(row || "").trim();
    if (!name) continue;
    if (isDenied(name)) {
      if (strict) {
        const error = new Error("该 action 不允许被自动化调用：" + name) as Error & { status?: number };
        error.status = 400;
        throw error;
      }
      continue;
    }
    if (!validActionName(name)) {
      if (strict) {
        const error = new Error("action 名称不合法：" + name) as Error & { status?: number };
        error.status = 400;
        throw error;
      }
      continue;
    }
    seen.add(name);
  }
  return Array.from(seen).sort();
}

/** 建规则 / 执行前校验 action 是否可用；返回中文原因或空字符串。 */
export function checkAction(name: unknown, allowed: unknown): string {
  const action = String(name || "").trim();
  if (!action) return "缺少 actionName";
  if (isDenied(action)) return "该 action 不允许被自动化调用：" + action;
  if (!Array.isArray(allowed) || !allowed.includes(action)) return "action 未在设置中启用：" + action;
  return "";
}
