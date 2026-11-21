/**
 * 工作台首页栏目表：栏目由宿主统一定义（顺序、中英文名、兜底项），
 * 业务插件在 registerDomain 时只声明 category id，不重复定义文案与样式。
 *
 * 兼容面约定：栏目 id 一旦发布只能新增，不能改名；确需改名要在 resolveCategory
 * 里加别名映射。旧插件包（未声明 category）与写了未知 id 的插件一律落兜底栏目，
 * 只打一条日志，不阻断注册。
 */
import type { DomainCategoryInfo } from "@wb/sdk";

export interface HomeCategoryDef {
  id: string;
  /** 中文栏目名 */
  title: string;
  /** 英文栏目名 */
  titleEn: string;
  /** 兜底栏目：未声明或未知栏目的插件都归入这里；有且只有一个 */
  fallback?: boolean;
}

/** 栏目顺序即首页展示顺序。 */
export const HOME_CATEGORIES: readonly HomeCategoryDef[] = [
  { id: "work", title: "工作与计划", titleEn: "Work & Planning" },
  { id: "comm", title: "沟通与消息", titleEn: "Communication" },
  { id: "assets", title: "资产与资料", titleEn: "Assets & Docs" },
  { id: "finance", title: "财务", titleEn: "Finance" },
  { id: "auto", title: "自动化与集成", titleEn: "Automation & Integrations" },
  { id: "other", title: "其他", titleEn: "Other", fallback: true },
];

/** 兜底栏目 id。 */
export const FALLBACK_CATEGORY_ID = "other";

const KNOWN_CATEGORY_IDS = new Set(HOME_CATEGORIES.map((c) => c.id));

export type CategoryResolution =
  | { id: string; status: "ok" }
  | { id: string; status: "missing" }
  | { id: string; status: "unknown"; declared: string };

/**
 * 把插件声明的栏目解析成宿主认可的 id。
 * - 命中：原样返回；
 * - 未声明 / 空串 / 非字符串：落兜底，status=missing；
 * - 未知 id：落兜底，status=unknown（调用方据此打日志）。
 */
export function resolveCategory(raw: unknown): CategoryResolution {
  const declared = typeof raw === "string" ? raw.trim() : "";
  if (!declared) return { id: FALLBACK_CATEGORY_ID, status: "missing" };
  if (KNOWN_CATEGORY_IDS.has(declared)) return { id: declared, status: "ok" };
  return { id: FALLBACK_CATEGORY_ID, status: "unknown", declared };
}

/** /workbench/api/domains 返回的栏目定义（含中英文名与兜底标记）。 */
export function publicCategories(): DomainCategoryInfo[] {
  return HOME_CATEGORIES.map((c) => ({
    id: c.id,
    title: c.titleEn ? { zh: c.title, en: c.titleEn } : { zh: c.title },
    fallback: c.fallback === true,
  }));
}
