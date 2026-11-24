/** 业务域提供的会话角色。宿主从注册来源派生完整角色标识。 */
export interface DomainRoleDef {
  /** 域内唯一的小写标识。 */
  id: string;
  name: string;
  description: string;
  /** 角色规则版本，供宿主标记当前会话的选择。 */
  version: string;
  /** 仅当用户选择此角色时，宿主才向模型提供这些业务规则。 */
  instructions: string;
  /**
   * 本角色**参考**用的工作台动作名，只供角色管理页展示与按动作名检索。
   * 它不构成权限：选了角色也能调任意 action，真正约束该做什么的是 instructions。
   * 省略即空数组，插件可以只为角色写指令。
   */
  actions?: string[];
}

const ROLE_ID = /^[a-z][a-z0-9_-]*$/;
const ACTION_NAME = /^[a-z][a-z0-9_-]*(?:\.[a-z][a-z0-9_-]*)+$/i;

/** 校验 JavaScript 插件的角色声明，复制已识别字段以隔离注册后的改动。 */
export function parseDomainRoles(domainId: string, value: unknown): DomainRoleDef[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error(domainId + ".roles 必须是数组");
  const ids = new Set<string>();
  return Array.from(value, (role, index) => {
    const path = domainId + ".roles[" + index + "]";
    if (!role || typeof role !== "object" || Array.isArray(role)) throw new Error(path + " 必须是对象");
    function text(key: string): string {
      const raw = role[key];
      if (typeof raw !== "string" || !raw.trim()) throw new Error(path + "." + key + " 必须是非空字符串");
      return raw.trim();
    }
    const id = text("id");
    if (!ROLE_ID.test(id)) throw new Error(path + ".id 必须是域内小写标识，且以字母开头");
    if (ids.has(id)) throw new Error(path + ".id 重复：" + id);
    ids.add(id);
    // actions 可选：只为展示与检索保留，缺省按空数组处理，不阻止注册。
    if (role.actions !== undefined && !Array.isArray(role.actions)) throw new Error(path + ".actions 必须是数组");
    const actions = Array.from(role.actions ?? [], (action) => {
      if (typeof action !== "string" || !ACTION_NAME.test(action) || action.trim() !== action) {
        throw new Error(path + ".actions 需要完整的动作名，如 tasks.list");
      }
      return action;
    });
    return { id, name: text("name"), description: text("description"), version: text("version"), instructions: text("instructions"), actions: [...new Set(actions)] };
  });
}
