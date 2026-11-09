// Resolve legacy timeline associations without inventing a line for an unlinked task.
"use strict";
module.exports = function timelineMembers(api, task) {
  var key = task.timelineKey == null ? "" : String(task.timelineKey).trim();
  if (!key) return Promise.resolve([]);
  return api.call("tasks.timeline", { timelineKey: key }).then(function (response) {
    if (!response || !response.ok) throw new Error(response && response.error || "load failed");
    var items = Array.isArray(response.result) ? response.result : [];
    // Old normal tasks used their own id as a placeholder timeline key.
    if (items.length === 1 && key === String(task.id) && String(items[0].id) === String(task.id)) return [];
    return items;
  });
};
