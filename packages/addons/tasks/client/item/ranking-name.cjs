// 排行名称使用原生按钮，保留表格语义及键盘操作。
var React = require("react"), h = React.createElement;
module.exports = function rankingName(t, lang, onNavigate, kind) {
  var en = lang === "en", table = kind === "table";
  return { key: "title", label: t.colName, render: function (row) {
    if (!row.id || row.id === "__missing__" || row.id === "__ungrouped__") {
      return h("span", { title: en ? "Deleted task table / unfiled; cannot open" : "已删除任务表/未归档，无法打开" }, row.title);
    }
    if (typeof onNavigate !== "function") return row.title;
    return h("button", {
      type: "button", className: "wbt-table-link",
      "aria-label": (en ? (table ? "Open task table: " : "Open task group: ") : (table ? "打开任务表：" : "打开任务组：")) + row.title,
      onClick: function () {
        onNavigate("tasks", table
          ? { tableId: String(row.id), groupId: row.groupId == null ? null : String(row.groupId), allTableTasks: true }
          : { groupId: String(row.id), tableId: null });
      },
    }, row.title);
  } };
};
