/**
 * 站点域到凭据保险箱的调用桥。
 *
 * sites 不持有任何密钥，也不直接读写 vault_* 表；所有动作走 vault 的 plugin 接口。
 * 桥在 setup 时由 index.js 注入（api.call 固定 plugin origin）。
 */

let bridge = null;

export function bindVault(bridgeFn) {
  bridge = typeof bridgeFn === "function" ? bridgeFn : null;
}

export function vaultInstalled() {
  return Boolean(bridge);
}

function call(action, args) {
  if (!bridge) throw new Error("需要安装凭据保险箱插件（wb-addon-vault）后才能保存密码/手机号/证件号");
  return Promise.resolve(bridge(action, args || {})).then(function (reply) {
    if (reply && reply.ok === true) return reply.result;
    if (reply && reply.ok === false) throw new Error(reply.error || "凭据保险箱请求失败");
    return reply;
  });
}

export async function vaultStatus() {
  if (!bridge) {
    return { installed: false, enabled: false, unlocked: false, initialized: false, locked: true };
  }
  const status = await call("vault.status", {});
  return {
    installed: true,
    enabled: Boolean(status.initialized),
    unlocked: !status.locked,
    initialized: Boolean(status.initialized),
    locked: Boolean(status.locked),
    unlockMode: status.unlockMode,
    idleMinutes: Math.round((Number(status.idleTimeoutSec) || 900) / 60),
    remainingMs: Number(status.idleTimeoutSec) > 0 && !status.locked ? Number(status.idleTimeoutSec) * 1000 : 0,
    passphraseMinLength: 12,
  };
}

export async function requireVault() {
  let status;
  try {
    status = await vaultStatus();
  } catch (error) {
    throw new Error("凭据保险箱不可用：" + (error && error.message ? error.message : String(error)));
  }
  if (!status.installed) throw new Error("需要安装凭据保险箱插件（wb-addon-vault）后才能保存密码/手机号/证件号");
  if (!status.initialized) throw new Error("请先在凭据保险箱里设置主口令，再保存密码/手机号/证件号");
  if (status.locked) throw new Error("凭据保险箱已锁定，请先解锁后再保存密码/手机号/证件号");
  return status;
}

/** 站点这一「类凭据」对应的组；未关联时给出可操作的中文错误。 */
export async function groupOfSite(siteId) {
  const result = await call("vault.bindingsOf", { subjectType: "site", subjectId: String(siteId) });
  const item = (result && result.items && result.items[0]) || null;
  if (!item) throw new Error("本站点尚未关联凭据组：请先在站点详情里创建并关联「站点账号」凭据组");
  return String(item.groupId);
}

export function fieldName(siteId, accountId, field) {
  return "site." + String(siteId) + "." + String(accountId) + "." + String(field);
}

/** 该站点经分组可见的凭据清单（不含明文）。 */
export async function secretsOfSite(siteId) {
  const result = await call("vault.subjectSecrets", { subjectType: "site", subjectId: String(siteId) });
  return (result && result.items) || [];
}

export async function upsertField(siteId, accountId, field, value) {
  const groupId = await groupOfSite(siteId);
  return call("vault.pluginSecretUpsert", {
    subjectType: "site",
    subjectId: String(siteId),
    groupId,
    name: fieldName(siteId, accountId, field),
    kind: "site-account",
    secret: String(value),
    meta: { siteId: String(siteId), accountId: String(accountId), field: String(field) },
  });
}

export async function deleteField(siteId, accountId, field) {
  const groupId = await groupOfSite(siteId);
  return call("vault.pluginSecretDelete", {
    subjectType: "site",
    subjectId: String(siteId),
    groupId,
    name: fieldName(siteId, accountId, field),
  });
}

/** 列表/详情用：按 meta.accountId 聚合字段与 secret id。 */
export async function flagsOfSite(siteId) {
  const map = new Map();
  if (!vaultInstalled()) return map;
  let items = [];
  try {
    items = await secretsOfSite(siteId);
  } catch {
    return map;
  }
  for (const item of items) {
    const meta = item && item.meta && typeof item.meta === "object" ? item.meta : {};
    const accountId = String(meta.accountId || "");
    const field = String(meta.field || "");
    if (!accountId || !field) continue;
    if (!map.has(accountId)) map.set(accountId, { fields: new Set(), ids: {} });
    map.get(accountId).fields.add(field);
    map.get(accountId).ids[field] = String(item.id || "");
  }
  return map;
}
