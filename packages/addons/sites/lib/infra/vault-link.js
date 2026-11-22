/**
 * 站点域到凭据保险箱的只读调用桥。
 *
 * 映射表（vault_binding）与凭据本体都归凭据保险箱所有：站点只查「自己关联了哪些分组」，
 * 不读写任何 vault_* 表，也不在站点侧保存账号、登录名或密码。
 */

let bridge = null;

export function bindVault(bridgeFn) {
  bridge = typeof bridgeFn === "function" ? bridgeFn : null;
}

export function vaultInstalled() {
  return Boolean(bridge);
}

function call(action, args) {
  if (!bridge) throw new Error("需要安装凭据保险箱插件（wb-addon-vault）后才能查看关联的凭据分组");
  return Promise.resolve(bridge(action, args || {})).then(function (reply) {
    if (reply && reply.ok === true) return reply.result;
    if (reply && reply.ok === false) throw new Error(reply.error || "凭据保险箱请求失败");
    return reply;
  });
}

/** 该站点关联的分组清单（分组名、颜色、组内凭据数），只读。 */
export async function bindingsOfSite(siteId) {
  const result = await call("vault.bindingsOf", { subjectType: "site", subjectId: String(siteId) });
  return (result && result.items) || [];
}

/** 删除站点后清掉保险箱里的映射，尽力而为：没装保险箱或还没初始化时静默跳过。 */
export async function unbindSite(siteId) {
  if (!bridge) return { removed: 0 };
  try {
    const reply = await bridge("vault.bindingPurge", { subjectType: "site", subjectId: String(siteId) });
    if (reply && reply.ok === true) return reply.result || { removed: 0 };
    return { removed: 0 };
  } catch (error) {
    return { removed: 0 };
  }
}
