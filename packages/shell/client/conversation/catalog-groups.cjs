"use strict";
/**
 * 角色管理页的纯函数层：域归类、列表过滤、动作去重。
 *
 * 单独一层是为了两件事：① 这些规则要能被测试直接单测，不必渲染；
 * ② 页面与编辑器共用同一套域口径。
 */

/** 去重并保持出现顺序。 */
function dedupe(list) {
  var out = [];
  (list || []).forEach(function (raw) {
    var name = String(raw || "").trim();
    if (name && out.indexOf(name) < 0) out.push(name);
  });
  return out;
}

/** 角色所属域的短名：插件角色取 `wb-addon-` 之后的域 id，用户角色统一归 `user`。 */
function domainKey(role) {
  if (!role) return "";
  if (role.source === "user") return "user";
  var raw = String(role.domain || role.id || "");
  return raw.replace(/^wb-addon-/, "").split(/[\/.]/)[0];
}

/** 列表过滤：关键字命中名称/简介/指令/角色 id，来源与域为精确匹配。 */
function filterRoles(rows, filter) {
  var q = String((filter && filter.q) || "").trim().toLowerCase();
  var source = (filter && filter.source) || "";
  var domain = (filter && filter.domain) || "";
  return (rows || []).filter(function (role) {
    if (source && role.source !== source) return false;
    if (domain && domainKey(role) !== domain) return false;
    if (!q) return true;
    var text = [role.name, role.description, role.instructions, role.id].join(" ").toLowerCase();
    return text.indexOf(q) >= 0;
  });
}

/** 可筛选的域清单：插件角色的域来自 id 前缀，用户角色归到 `user`。 */
function domainsOf(rows) {
  var seen = [];
  (rows || []).forEach(function (role) {
    var key = domainKey(role);
    if (key && seen.indexOf(key) < 0) seen.push(key);
  });
  return seen.sort();
}

module.exports = {
  domainKey: domainKey,
  dedupe: dedupe,
  filterRoles: filterRoles,
  domainsOf: domainsOf,
};
