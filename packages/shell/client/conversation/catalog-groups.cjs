"use strict";
/**
 * 角色管理页的纯函数层：过滤、动作分组、动作名校验。
 *
 * 单独一层是为了两件事：① 这些规则要能被测试直接单测，不必渲染；
 * ② 动作清单要按「域.」前缀分组并给出数量，页面与编辑器共用同一套口径。
 */

/** 动作名归属的域前缀：`taskNodes.overview` → `taskNodes`。 */
function domainOf(name) {
  var text = String(name || "");
  var at = text.indexOf(".");
  return at > 0 ? text.slice(0, at) : text;
}

/** 按域前缀分组并排序，组内按名字排序；域内数量由 items.length 给出。 */
function groupActions(names) {
  var order = [], map = Object.create(null);
  (names || []).forEach(function (raw) {
    var name = String(raw || "").trim();
    if (!name) return;
    var domain = domainOf(name);
    if (!map[domain]) {
      map[domain] = [];
      order.push(domain);
    }
    if (map[domain].indexOf(name) < 0) map[domain].push(name);
  });
  order.sort();
  return order.map(function (domain) {
    return { domain: domain, items: map[domain].sort() };
  });
}

/** 去重并保持出现顺序：勾选与手动补充合并成最终动作集。 */
function dedupe(list) {
  var out = [];
  (list || []).forEach(function (raw) {
    var name = String(raw || "").trim();
    if (name && out.indexOf(name) < 0) out.push(name);
  });
  return out;
}

/** 手动输入框（每行一个，也允许逗号）→ 名字数组。 */
function parseManual(text) {
  return dedupe(String(text || "").split(/[\s,，]+/));
}

/**
 * 保存前校验：动作名必须真实存在。
 * 返回 { actions, unknown }；目录尚未加载（null）时不做存在性判断，交给服务端。
 */
function validateActions(names, catalog) {
  var actions = dedupe(names);
  if (!catalog) return { actions: actions, unknown: [] };
  var known = Object.create(null);
  catalog.forEach(function (item) {
    if (item && item.name) known[String(item.name)] = true;
  });
  return {
    actions: actions,
    unknown: actions.filter(function (name) {
      return !known[name];
    }),
  };
}

/** 角色所属域的短名：插件角色取 `wb-addon-` 之后的域 id，用户角色统一归 `user`。 */
function domainKey(role) {
  if (!role) return "";
  if (role.source === "user") return "user";
  var raw = String(role.domain || role.id || "");
  return raw.replace(/^wb-addon-/, "").split(/[\/.]/)[0];
}

/** 列表过滤：关键字命中名称/简介/指令/动作名，来源与域为精确匹配。 */
function filterRoles(rows, filter) {
  var q = String((filter && filter.q) || "").trim().toLowerCase();
  var source = (filter && filter.source) || "";
  var domain = (filter && filter.domain) || "";
  return (rows || []).filter(function (role) {
    if (source && role.source !== source) return false;
    if (domain && domainKey(role) !== domain) return false;
    if (!q) return true;
    var text = [role.name, role.description, role.instructions, (role.actions || []).join(" "), role.id]
      .join(" ")
      .toLowerCase();
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
  domainOf: domainOf,
  domainKey: domainKey,
  groupActions: groupActions,
  dedupe: dedupe,
  parseManual: parseManual,
  validateActions: validateActions,
  filterRoles: filterRoles,
  domainsOf: domainsOf,
};
