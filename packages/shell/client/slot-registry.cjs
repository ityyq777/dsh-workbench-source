"use strict";
// 插槽注册表：校验、去重、稳定排序、按插件撤销、错误标记。
// 刻意不依赖 React / DOM，纯数据逻辑，方便在 node 里直接单测（scripts/test-addon-slots.mjs）。
//
// 排序规则只有一条：先按 order 升序，再按 id 的字典序。
// 它保证"谁先安装不影响最终顺序"——这是不用 before/after 锚点的直接原因。

var DEFAULT_ORDER = 100;
var UNKNOWN_OWNER = "unknown";

function idCompare(a, b) {
  // 不用 localeCompare：它受运行时 locale 影响，会让同一批数据在不同机器上顺序不同。
  return a < b ? -1 : a > b ? 1 : 0;
}

module.exports = function createSlotRegistry(catalog, onChange) {
  var bySlot = {}; // slotId -> { [contributionId]: entry }
  var problems = []; // 被拒的贡献：{slot,id,addonId,reason,detail}

  function notify() {
    if (typeof onChange === "function") {
      try { onChange(); } catch (e) { console.error("[dsh-workbench] 插槽变更通知失败", e); }
    }
  }

  function reject(reason, detail) {
    problems.push(Object.assign({ reason: reason }, detail || {}));
    console.error("[dsh-workbench] 插槽贡献被拒绝（" + reason + "）", detail && (detail.slot || "") + "/" + (detail && detail.id || ""), detail && detail.addonId || "");
    return false;
  }

  function add(contrib, addonId) {
    var owner = typeof addonId === "string" && addonId ? addonId : UNKNOWN_OWNER;
    if (!contrib || typeof contrib !== "object") return reject("invalid-contribution", { addonId: owner });
    var slotId = String(contrib.slot || "");
    var id = String(contrib.id || "");
    if (!id) return reject("invalid-id", { slot: slotId, addonId: owner });
    if (typeof contrib.component !== "function") return reject("invalid-component", { slot: slotId, id: id, addonId: owner });
    if (!catalog.has(slotId)) return reject("unknown-slot", { slot: slotId, id: id, addonId: owner });
    var bucket = bySlot[slotId] || (bySlot[slotId] = {});
    if (Object.prototype.hasOwnProperty.call(bucket, id)) return reject("duplicate-id", { slot: slotId, id: id, addonId: owner });
    var order = Number(contrib.order);
    bucket[id] = {
      slot: slotId,
      id: id,
      addonId: owner,
      order: Number.isFinite(order) ? order : DEFAULT_ORDER,
      title: contrib.title === undefined ? null : contrib.title,
      icon: typeof contrib.icon === "function" ? contrib.icon : null,
      component: contrib.component,
      error: null,
    };
    notify();
    return true;
  }

  function addAll(list, addonId) {
    if (!Array.isArray(list)) return 0;
    var accepted = 0;
    for (var i = 0; i < list.length; i += 1) if (add(list[i], addonId)) accepted += 1;
    return accepted;
  }

  function removeAddon(addonId) {
    var removed = 0;
    Object.keys(bySlot).forEach(function (slotId) {
      var bucket = bySlot[slotId];
      Object.keys(bucket).forEach(function (id) {
        if (bucket[id].addonId !== addonId) return;
        delete bucket[id];
        removed += 1;
      });
      if (!Object.keys(bucket).length) delete bySlot[slotId];
    });
    if (removed) notify();
    return removed;
  }

  function markError(slotId, id, error) {
    var bucket = bySlot[slotId];
    if (!bucket || !bucket[id]) return;
    bucket[id].error = String((error && error.message) || error || "unknown");
  }

  function get(slotId) {
    var bucket = bySlot[String(slotId || "")];
    if (!bucket) return [];
    return Object.keys(bucket)
      .map(function (id) { return bucket[id]; })
      .sort(function (a, b) { return a.order === b.order ? idCompare(a.id, b.id) : a.order - b.order; });
  }

  // 诊断快照：不含组件函数，可安全 JSON 化（Slot 的 console.error / 将来的诊断面板用）。
  function describe(slotId) {
    return get(slotId).map(function (entry) {
      return { slot: entry.slot, id: entry.id, addonId: entry.addonId, order: entry.order, title: entry.title, ok: entry.error === null, error: entry.error };
    });
  }

  return {
    add: add,
    addAll: addAll,
    removeAddon: removeAddon,
    markError: markError,
    get: get,
    describe: describe,
    problems: function () { return problems.slice(); },
    clearProblems: function () { problems.length = 0; },
    size: function (slotId) { return get(slotId).length; },
  };
};
