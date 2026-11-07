/**
 * @wb/sdk：子插件（addon）开发契约。
 * addon 是「数据+视图+工具」三件套：manifest 声明贡献点，宿主按声明接线。
 */
export interface AddonManifest {
  id: string;
  title: string;
  description?: string;
  author?: string;
  version: string;
  minShell: string;
  /** 贡献的同步表（列必须与 core schema 对齐；demo 阶段仅 tasks/habits） */
  tables: string[];
  /** UI 贡献点名称（settings.plugins.tab 内注册） */
  views?: string[];
  /** Workbench tool 扩展 action（命名空间 <addonId>.<action>） */
  toolActions?: string[];
}

/** defineAddon 原样返回，纯类型收窄辅助。 */
export function defineAddon(m: AddonManifest): AddonManifest {
  return m;
}
