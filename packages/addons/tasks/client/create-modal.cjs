// 创建/重启表单独立模块；宿主相关工具由入口注入，避免循环依赖。
function initialPriority(source, origin, fallback) {
  var original = Number(origin && origin.priority);
  if (source === "2" && Number.isInteger(original) && original >= 1 && original <= 10) return original;
  var n = Number(fallback);
  return Number.isFinite(n) ? Math.min(10, Math.max(1, Math.floor(n))) : 1;
}
function clampInputPriority(value) {
  if (String(value).trim() === "" || Number(value) === 0 || !Number.isFinite(Number(value))) return value;
  return Math.min(10, Math.max(1, Math.floor(Number(value))));
}
function validatePriority(value, source, t) {
  var n = Number(value);
  return String(value).trim() !== "" && Number.isInteger(n) && n >= 1 && n <= 10 ? "" :
    (source === "2" ? t.restartPriorityError : t.activePriorityError);
}
module.exports = function createModal(deps) {
  var React = deps.React, h = React.createElement;
  var allTables = deps.allTables, tagNames = deps.tagNames, splitTags = deps.splitTags;
  var today = deps.today, addDays = deps.addDays, hostHasAddon = deps.hostHasAddon;
  function CreateModal(props) {
    var t = props.t;
    var source = String(props.source || "0");
    var origin = props.originTask || null;
    var tables = allTables(props.tree);
    var first = props.defaultTableId || (origin && origin.tableId) || (tables[0] && tables[0].id) || "";
    var initTags = origin ? tagNames(origin).join(", ") : "";
    var initTable = origin ? String(origin.tableId || first) : String(first);
    var defaults = props.defaults || {};
    var initPriority = initialPriority(source, origin, defaults.priority);
    var initDifficulty = Math.floor(Number(defaults.difficulty));
    if (!(initDifficulty >= 1)) initDifficulty = 1;
    var initOffset = Math.floor(Number(defaults.targetOffset));
    if (!(initOffset >= 0)) initOffset = 0;
    var f = React.useState({
      title: "", description: "",
      tags: initTags, status: "0", priority: initPriority, difficulty: initDifficulty,
      publishDate: today(), targetDate: addDays(initOffset), doneDate: today(), shutdownDate: today(),
      tableId: initTable,
    });
    var form = f[0], setForm = f[1];
    var busy = React.useState(false);
    var isBusy = busy[0], setBusy = busy[1];
    var err = React.useState("");
    var error = err[0], setError = err[1];
    var active = source === "2" || form.status === "0";
    var priorityError = active ? validatePriority(form.priority, source, t) : "";

    function set(k, v) {
      var next = Object.assign({}, form);
      next[k] = k === "priority" ? clampInputPriority(v) : v;
      setForm(next);
    }
    function submit() {
      if (priorityError || isBusy) return;
      if (!String(form.title).trim()) { setError(t.needTitle); return; }
      if (!form.tableId) { setError(t.needTable); return; }
      if (!form.publishDate || !form.targetDate) { setError(t.needDate); return; }
      setBusy(true); setError("");
      var args = {
        title: String(form.title).trim(),
        description: String(form.description || ""),
        tags: splitTags(form.tags), status: source === "2" ? "0" : String(form.status),
        priority: active ? Number(form.priority) : 0,
        tableId: String(form.tableId),
        publishDate: form.publishDate,
        targetDate: form.targetDate,
        source: source,
      };
      if (source !== "0" && origin) {
        args.timelineKey = String(origin.timelineKey || origin.id);
        args.restartKey = source === "2" ? String(origin.id) : undefined;
      }
      if (args.status === "2") {
        args.doneDate = form.doneDate || today();
        args.difficulty = Number(form.difficulty) || 0;
      }
      if (args.status === "1") args.shutdownDate = form.shutdownDate || today();
      props.api.call("tasks.create", args).then(function (r) {
        if (!r || !r.ok) { setError((r && r.error) || "create failed"); setBusy(false); return; }
        props.onCreated();
      }).catch(function (e) { setError(String(e && e.message || e)); setBusy(false); });
    }

    var title = source === "2" ? t.restartTitle : source === "1" ? t.newTimeline : t.newTask;
    return h("div", { className: "wbt-modal-mask", onMouseDown: function (e) { if (e.target === e.currentTarget) props.onClose(); } },
      h("div", { className: "wbt-modal" },
        h("div", { className: "wbt-modal-head" }, h("h3", null, title), h("button", { className: "wbt-icon", onClick: props.onClose }, "×")),
        source === "2" ? h("div", { className: "wbt-mhint" }, t.restartPriorityHint) : null,
        source !== "0" && origin ? h("div", { className: "wbt-mhint" }, "来源：" + (origin.title || origin.id) + (source === "2" ? " · 重启链 " + (origin.restartKey || origin.id) : " · 时间线 " + (origin.timelineKey || origin.id))) : null,
        h("div", { className: "wbt-form" },
          h("label", { className: "wbt-field full" }, h("span", null, t.titleField + " *"), h("input", { className: "wbt-input", value: form.title, onChange: function (e) { set("title", e.target.value); }, autoFocus: true })),
          h("label", { className: "wbt-field full" }, h("span", null, t.desc), h("textarea", { className: "wbt-textarea", rows: 2, value: form.description, onChange: function (e) { set("description", e.target.value); } })),
          hostHasAddon("wb-addon-tags") ? h("label", { className: "wbt-field full" }, h("span", null, t.tags), h("input", { className: "wbt-input", value: form.tags, placeholder: t.tagPlaceholder, onChange: function (e) { set("tags", e.target.value); } })) : null,
          h("label", { className: "wbt-field" }, h("span", null, t.status), h("select", { className: "wbt-select", value: source === "2" ? "0" : form.status, disabled: source === "2", onChange: function (e) { set("status", e.target.value); } },
            h("option", { value: "0" }, "已开启"), h("option", { value: "2" }, "已完成"), h("option", { value: "1" }, "已关闭"))),
          h("label", { className: "wbt-field" }, h("span", null, t.priority + "（1–10）"), h("input", { className: "wbt-input", type: "number", min: 1, max: 10, step: 1, disabled: !active, "aria-invalid": !!priorityError, "aria-describedby": priorityError ? "wbt-create-priority-error" : undefined, value: form.priority, onChange: function (e) { set("priority", e.target.value); } })),
          h("label", { className: "wbt-field" }, h("span", null, t.table + " *"), h("select", { className: "wbt-select", value: form.tableId, onChange: function (e) { set("tableId", e.target.value); } }, tables.map(function (x) { return h("option", { key: x.id, value: x.id }, "　".repeat(x.depth) + x.name); }))),
          h("label", { className: "wbt-field" }, h("span", null, t.publishDate), h("input", { className: "wbt-input", type: "date", value: form.publishDate, onChange: function (e) { set("publishDate", e.target.value); } })),
          h("label", { className: "wbt-field" }, h("span", null, t.targetDate), h("input", { className: "wbt-input", type: "date", value: form.targetDate, onChange: function (e) { set("targetDate", e.target.value); } })),
          (source !== "2" && form.status === "2") ? h("label", { className: "wbt-field" }, h("span", null, t.doneDate), h("input", { className: "wbt-input", type: "date", value: form.doneDate, onChange: function (e) { set("doneDate", e.target.value); } })) : null,
          (source !== "2" && form.status === "2") ? h("label", { className: "wbt-field" }, h("span", null, t.difficulty + "（0–5）"), h("input", { className: "wbt-input", type: "number", min: 0, max: 5, step: 0.5, value: form.difficulty, onChange: function (e) { set("difficulty", e.target.value); } })) : null,
          (source !== "2" && form.status === "1") ? h("label", { className: "wbt-field" }, h("span", null, t.shutdownDate), h("input", { className: "wbt-input", type: "date", value: form.shutdownDate, onChange: function (e) { set("shutdownDate", e.target.value); } })) : null
        ),
        priorityError ? h("div", { id: "wbt-create-priority-error", className: "wbt-err", role: "alert" }, priorityError) : null,
        error ? h("div", { className: "wbt-err" }, error) : null,
        h("div", { className: "wbt-modal-foot" },
          h("button", { className: "wbt-btn ghost", onClick: props.onClose }, t.cancel),
          h("button", { className: "wbt-btn primary", disabled: isBusy || !!priorityError, onClick: submit }, isBusy ? "…" : t.create)
        )
      )
    );
  }

  return CreateModal;
};
