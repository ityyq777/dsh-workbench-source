// 归属控件仅编辑本地表单；建节点随 tasks.create 一次提交。
"use strict";
var ownership = require("./ownership.cjs");
module.exports = function (React) {
  var h = React.createElement;
  return function fields(props) {
    var form = props.form, set = props.set, tables = ownership.tables(props.tree);
    var chosen = tables.find(function (x) { return x.id === form.tableId; });
    var recommended = tables.find(function (x) { return x.id === String(props.recommended || ""); });
    var plan = ownership.preview(props.tree, form.tablePath, form.pathDescriptions || []);
    return h("div", { className: "wbt-field full" },
      h("label", null, h("span", null, props.edit ? "纠正归属（可选）" : "目标任务表 *"),
        h("select", { className: "wbt-select", "aria-label": "目标任务表", value: form.tableId, disabled: !!form.newPath,
          onChange: function (e) { set("tableId", e.target.value); } },
          h("option", { value: "" }, props.edit ? "保留当前归属" : "请选择目标任务表"),
          tables.map(function (x) { return h("option", { key: x.id, value: x.id }, x.path + " — " + (x.description || "暂无职责描述")); }))),
      chosen ? h("div", { className: "wbt-mhint" }, chosen.path + "：" + (chosen.description || "暂无职责描述")) : null,
      recommended && !props.edit ? h("div", { className: "wbt-mhint" }, "当前上下文建议：" + recommended.path + "。仅供参考，请自行选择。") : null,
      !props.edit ? h("label", { className: "wbt-check" }, h("input", { type: "checkbox", "aria-label": "没有合适的表？新建节点", checked: !!form.newPath,
        onChange: function (e) { props.setMany({ newPath: e.target.checked, tableId: "", confirmed: false }); } }), "没有合适的表？新建节点") : null,
      form.newPath ? h("div", null,
        h("label", null, "新路径（相对于根；以 / 分隔）", h("input", { className: "wbt-input", "aria-label": "新路径", value: form.tablePath,
          onChange: function (e) { props.setMany({ tablePath: e.target.value, pathDescriptions: [], confirmed: false }); } })),
        h("div", { className: "wbt-mhint" }, "预览：" + (plan.path || "请输入路径") + "。已有节点会复用，提交前不会写入。"),
        plan.nodes.map(function (node, i) { return h("label", { key: i, className: "wbt-field full" },
          h("span", null, (node.existing ? "复用" : "新建") + (node.type === "1" ? "表：" : "组：") + node.name),
          !node.existing ? h("textarea", { className: "wbt-textarea", "aria-label": "节点职责 " + (i + 1), maxLength: 2000, value: form.pathDescriptions[i] || "",
            onChange: function (e) { var values = form.pathDescriptions.slice(); values[i] = e.target.value; props.setMany({ pathDescriptions: values, confirmed: false }); } }) : null); }),
        plan.error ? h("div", { className: "wbt-err", role: "alert" }, plan.error) : null,
        h("label", { className: "wbt-check" }, h("input", { type: "checkbox", "aria-label": "确认新建路径", checked: !!form.confirmed, disabled: !!plan.error,
          onChange: function (e) { set("confirmed", e.target.checked); } }), "确认以上路径与职责，随任务一起提交")) : null
    );
  };
};
