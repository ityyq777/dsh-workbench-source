"use strict";
module.exports = function (React) {
  var h = React.createElement, controls = require("./timeline-controls.cjs")(React);
  return function TaskTimelineModal(p) {
    var tr = require("./timeline-copy.cjs")(p.t);
    var ts = React.useState(p.task), task = ts[0], setTask = ts[1];
    var ms = React.useState([]), members = ms[0], setMembers = ms[1];
    var es = React.useState(""), error = es[0], setError = es[1];
    var bs = React.useState(true), busy = bs[0], setBusy = bs[1];
    var vs = React.useState(""), value = vs[0], setValue = vs[1];
    var ns = React.useState(false), creating = ns[0], setCreating = ns[1];
    var rs = React.useState(0), revision = rs[0], setRevision = rs[1];
    React.useEffect(function () {
      var cancelled = false; setBusy(true); setError("");
      p.api.call("tasks.get", { id: p.task.id }).then(controls.result).then(function (r) {
        var current = r.task;
        if (cancelled) return; setTask(current);
        return require("./timeline-members.cjs")(p.api, current).then(function (rows) { if (!cancelled) { setMembers(rows); setBusy(false); } });
      }).catch(function (e) { if (!cancelled) { setError(String(e.message || e)); setBusy(false); } });
      return function () { cancelled = true; };
    }, [p.api, p.task.id, revision]);
    function change(action, args) {
      if (busy) return; setBusy(true); setError("");
      p.api.call(action, args).then(controls.result).then(function () { setValue(""); setRevision(revision + 1); if (p.onChanged) p.onChanged(); }).catch(function (e) { setError(String(e.message || e)); setBusy(false); });
    }
    return h("div", { className: "wbt-modal-mask" }, h("div", { className: "wbt-modal wide", role: "dialog", "aria-modal": true, "aria-label": tr("任务时间线") },
      h("div", { className: "wbt-modal-head" }, h("h3", null, tr("任务时间线")), h("button", { className: "wbt-icon", onClick: p.onClose }, "×")),
      error ? h("p", { className: "wbt-err", role: "alert" }, error, h("button", { onClick: function () { setRevision(revision + 1); } }, tr("重试"))) : busy ? h("p", null, tr("加载中…")) : task.timelineId ? h(React.Fragment, null,
        h("h4", { title: task.timelineId }, task.timelineTitle || tr("未命名时间线")), h("p", null, task.timelineDescription || tr("暂无描述")),
        h("button", { className: "wbt-btn", disabled: busy, onClick: function () { change("taskTimelines.detach", { taskId: task.id }); } }, tr("移出时间线")),
        h("button", { className: "wbt-btn", onClick: function () { p.onCreateTimeline(task); } }, tr("添加新任务")),
        members.length ? h("ol", { className: "wbt-timeline-members" }, members.map(function (x) { return h("li", { key: x.id }, x.title, " · ", x.publishDate || ""); })) : h("p", null, tr("暂无可显示成员"))) : h("p", { className: "wbt-empty" }, tr("没有关联时间线")),
      h(controls.Picker, { api: p.api, t: p.t, value: value, onChange: setValue, disabled: busy }),
      h("div", { className: "wbt-modal-foot" },
        h("button", { className: "wbt-btn", disabled: busy, onClick: function () { setCreating(true); } }, tr("新建时间线")),
        h("button", { className: "wbt-btn primary", disabled: busy || !value, onClick: function () { change("taskTimelines.attach", { taskId: task.id, timelineId: value }); } }, tr("关联所选时间线")))),
      creating ? h(controls.Editor, { api: p.api, t: p.t, onClose: function () { setCreating(false); }, onSaved: function (line) { setCreating(false); setValue(line.timelineId || line.id || line.timelineKey); } }) : null);
  };
};
