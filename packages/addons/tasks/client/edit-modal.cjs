// 编辑任务独立组件；依赖由入口注入，保持原有 props 接口，无循环依赖。
"use strict";
module.exports = function createEditModal(React, statusInfo, stars) {
  var h = React.createElement;
  var ownership = require("./ownership.cjs"), fields = require("./ownership-fields.cjs")(React);
  // 任务编辑弹窗：按状态收敛可编辑字段。
  // 未完成（0/1/3）：标题、描述、优先级、感受；难度仅完成可改。
  // 已完成（2）：标题、描述、感受、难度；优先级完成即清零，不再可改。
  function EditModal(props) {
    var t = props.t;
    var task = props.task;
    var done = String(task.status) === "2";
    var canPriority = !done;
    var fs = React.useState({
      tableId: "",
      title: String(task.title || ""),
      description: String(task.description || ""),
      review: String(task.review || ""),
      priority: String(task.priority === null || task.priority === undefined ? 0 : task.priority),
      difficulty: Number(task.difficulty || 0.5),
      targetDate: String(task.targetDate || ""),
    });
    var form = fs[0], setForm = fs[1];
    var bs = React.useState(false);
    var isBusy = bs[0], setBusy = bs[1];
    var es = React.useState("");
    var err = es[0], setErr = es[1];
    var submission = React.useState({ pending: false })[0];
    function requestClose() { if (!submission.pending) props.onClose(); }
    function onModalKey(e) {
      if (e.key !== "Escape") return;
      e.preventDefault(); e.stopPropagation(); requestClose();
    }
    function failed(message) {
      var text = String(message || "update failed");
      if (/TABLE_NOT_FOUND|TARGET_NOT_TABLE|TREE_CORRUPT/.test(text)) set("tableId", "");
      submission.pending = false; setBusy(false); setErr(text);
    }
    React.useEffect(function () {
      if (form.tableId && !ownership.tables(props.tree).some(function (x) { return x.id === form.tableId; })) {
        setForm(function (prev) { return Object.assign({}, prev, { tableId: "" }); });
        setErr("所选目标已失效，已清空；请重新选择纠正目标。");
      }
    }, [props.tree, form.tableId]);
    function set(k, v) {
      setForm(function (prev) { var next = Object.assign({}, prev); next[k] = v; return next; });
    }
    var titleOk = String(form.title).trim().length > 0;
    function submit() {
      if (isBusy || submission.pending) return;
      if (!titleOk) { setErr(t.needTitle); return; }
      var patch = { id: task.id, title: String(form.title).trim(), description: String(form.description || "") };
      if (form.tableId) {
        if (!ownership.tables(props.tree).some(function (x) { return x.id === form.tableId; })) { setErr("目标已失效，请重新选择"); return; }
        patch.tableId = form.tableId;
      }
      if (canPriority) {
        var p = Math.round(Number(form.priority));
        if (!isFinite(p)) p = 1;
        if (!Number.isFinite(p)) p = 0;
        patch.priority = Math.max(1, Math.min(10, p));
        // 计划完成日期只处理非空值；留空表示不改动（后端空串会回落到原值）。
        if (String(form.targetDate || "").trim()) patch.targetDate = String(form.targetDate).trim();
      } else {
        patch.difficulty = Math.max(0.5, Math.min(5, Number(form.difficulty) || 0.5));
      }
      if (String(form.review) !== String(task.review || "")) patch.review = String(form.review);
      submission.pending = true; setBusy(true);
      setErr("");
      props.api.call("tasks.update", patch).then(function (r) {
        setBusy(false);
        if (r && r.ok) props.onSaved(r.result);
        else failed(r && r.error);
      }).catch(function (e) { failed((e && e.message) || e); });
    }
    var st = statusInfo(task.status);
    return h("div", { className: "wbt-modal-mask", onKeyDownCapture: onModalKey, onMouseDown: function (e) { if (e.target === e.currentTarget) requestClose(); } },
      h("div", { className: "wbt-modal" },
        h("div", { className: "wbt-modal-head" },
          h("h3", null, t.editTitle),
          h("span", { className: "wbt-badge " + st.cls }, props.lang === "en" ? st.en : st.zh),
          h("button", { className: "wbt-icon", disabled: isBusy, onClick: requestClose }, "×")
        ),
        h("div", { className: "wbt-mhint" }, done ? t.editHintDone : t.editHintOpen),
        h("div", { className: "wbt-mhint" }, "当前归属：" + ownership.receipt(task)),
        fields({ edit: true, form: form, set: set, tree: props.tree }),
        h("label", { className: "wbt-field" },
          h("span", null, t.titleField + " *"),
          h("input", { className: "wbt-input", value: form.title, autoFocus: true, onChange: function (e) { set("title", e.target.value); } })
        ),
        h("label", { className: "wbt-field" },
          h("span", null, t.desc),
          h("textarea", { className: "wbt-textarea", rows: 4, value: form.description, onChange: function (e) { set("description", e.target.value); } })
        ),
        h("label", { className: "wbt-field" },
          h("span", null, t.review + " · " + t.reviewHint),
          h("textarea", { className: "wbt-textarea", rows: 3, placeholder: t.reviewPlaceholder, value: form.review, onChange: function (e) { set("review", e.target.value); } })
        ),
        canPriority ? h("label", { className: "wbt-field" },
          h("span", null, t.targetDate),
          h("input", { className: "wbt-input", type: "date", value: form.targetDate, onChange: function (e) { set("targetDate", e.target.value); } })
        ) : null,
        canPriority ? h("label", { className: "wbt-field" },
          h("span", null, t.priority + "（1–10）"),
          h("input", { className: "wbt-input", type: "number", min: 1, max: 10, step: 1, value: form.priority, onChange: function (e) { set("priority", e.target.value); } })
        ) : null,
        done ? h("div", { className: "wbt-field" },
          h("span", null, t.difficulty + "（0–5）"),
          h("div", { className: "wbt-row" },
            h("span", { className: "wbt-stars" }, stars(form.difficulty)),
            h("input", { type: "range", min: 0.5, max: 5, step: 0.5, value: form.difficulty, style: { flex: 1 }, onChange: function (e) { set("difficulty", Number(e.target.value)); } }),
            h("b", null, Number(form.difficulty).toFixed(1))
          )
        ) : null,
        err ? h("div", { className: "wbt-err" }, err) : null,
        h("div", { className: "wbt-modal-foot" },
          h("button", { className: "wbt-btn ghost", disabled: isBusy, onClick: requestClose }, t.cancel),
          h("button", { className: "wbt-btn primary", disabled: isBusy || !titleOk, onClick: submit }, isBusy ? "…" : t.save)
        )
      )
    );
  }

  return EditModal;
};
