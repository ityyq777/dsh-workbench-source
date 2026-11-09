// Explicit entity controls shared by task dialogs and the timeline navigation.
"use strict";
function result(r) { if (!r || !r.ok) throw Error(r && r.error || "请求失败"); return r.result; }
module.exports = function (React) {
  var h = React.createElement;
  function Picker(p) {
    var tr = require("./timeline-copy.cjs")(p.t);
    var ds = React.useState({ records: [], total: 0 }), data = ds[0], setData = ds[1];
    var ps = React.useState(1), page = ps[0], setPage = ps[1];
    var qs = React.useState(""), query = qs[0], setQuery = qs[1];
    var es = React.useState(""), error = es[0], setError = es[1];
    var bs = React.useState(false), busy = bs[0], setBusy = bs[1];
    var rs = React.useState(0), retry = rs[0], setRetry = rs[1];
    React.useEffect(function () {
      var cancelled = false; setBusy(true); setError("");
      p.api.call("tasks.timelines", { includeSingletons: true, titleKey: query, pageNumber: page, pageSize: 20 }).then(result).then(function (r) {
        if (!cancelled) { setData(r); setBusy(false); }
      }).catch(function (e) { if (!cancelled) { setError(String(e.message || e)); setBusy(false); } });
      return function () { cancelled = true; };
    }, [p.api, page, query, retry]);
    return h("div", { className: "wbt-timeline-picker" },
      h("label", { className: "wbt-field" }, tr("搜索已有时间线"), h("input", { className: "wbt-input", value: query, onChange: function (e) { setQuery(e.target.value); setPage(1); } })),
      h("select", { className: "wbt-select", "aria-label": tr("选择已有时间线"), value: p.value || "", disabled: p.disabled || busy, onChange: function (e) { p.onChange(e.target.value); } },
        h("option", { value: "" }, tr("不关联时间线")),
        p.value && !data.records.some(function (x) { return (x.timelineId || x.timelineKey) === p.value; }) ? h("option", { value: p.value }, p.title || tr("已选时间线")) : null,
        data.records.map(function (x) { var id = x.timelineId || x.timelineKey; return h("option", { key: id, value: id }, (x.title || tr("未命名时间线")) + " · " + x.taskCount + tr(" 个任务")); })),
      h("div", { className: "wbt-timeline-pager" }, h("button", { type: "button", className: "wbt-btn", disabled: busy || page <= 1, onClick: function () { setPage(page - 1); } }, tr("上一页")),
        h("span", null, page + " / " + Math.max(1, Math.ceil(data.total / 20))),
        h("button", { type: "button", className: "wbt-btn", disabled: busy || page * 20 >= data.total, onClick: function () { setPage(page + 1); } }, tr("下一页"))),
      error ? h("div", { role: "alert" }, error, h("button", { type: "button", onClick: function () { setRetry(retry + 1); } }, tr("重试"))) : null);
  }
  function Editor(p) {
    var tr = require("./timeline-copy.cjs")(p.t);
    var item = p.item, pending = React.useRef(false);
    var ts = React.useState(item && item.title || ""), title = ts[0], setTitle = ts[1];
    var ds = React.useState(item && item.description || ""), description = ds[0], setDescription = ds[1];
    var bs = React.useState(false), busy = bs[0], setBusy = bs[1];
    var es = React.useState(""), error = es[0], setError = es[1];
    function save() {
      if (pending.current) return; pending.current = true; setBusy(true); setError("");
      var args = { title: title, description: description };
      if (item) args.timelineId = item.timelineId || item.timelineKey || item.id;
      p.api.call(item ? "taskTimelines.update" : "taskTimelines.create", args).then(result).then(function (r) { p.onSaved(r.timeline); }).catch(function (e) { pending.current = false; setError(String(e.message || e)); setBusy(false); });
    }
    return h("div", { className: "wbt-modal-mask", onKeyDown: function (e) { if (e.key === "Escape" && !busy) p.onClose(); } }, h("div", { className: "wbt-modal", role: "dialog", "aria-modal": true, "aria-label": item ? tr("编辑时间线") : tr("新建时间线") },
      h("div", { className: "wbt-modal-head" }, h("h3", null, item ? tr("编辑时间线") : tr("新建时间线"))),
      h("label", { className: "wbt-field" }, tr("时间线标题"), h("input", { className: "wbt-input", autoFocus: true, value: title, placeholder: tr("未命名时间线"), onChange: function (e) { setTitle(e.target.value); } })),
      h("label", { className: "wbt-field" }, tr("时间线描述"), h("textarea", { className: "wbt-textarea", value: description, onChange: function (e) { setDescription(e.target.value); } })),
      error ? h("p", { role: "alert", className: "wbt-err" }, error) : null,
      h("div", { className: "wbt-modal-foot" }, h("button", { className: "wbt-btn", disabled: busy, onClick: p.onClose }, tr("取消")), h("button", { className: "wbt-btn primary", disabled: busy, onClick: save }, busy ? tr("保存中…") : tr("保存时间线")))));
  }
  return { Picker: Picker, Editor: Editor, result: result };
};
