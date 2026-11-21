// 创建/重启表单独立模块；宿主相关工具由入口注入，避免循环依赖。
// 版式走共享分阶段外壳（lib/staged-dialog.cjs + lib/stepper.cjs）：
// 内容（含计划字段）→ 标签 → 任务表 → 时间线 → 工作区 → 确认，
// 每一步只放一组信息，保存前再整体复核。
var NF = require("../../../lib/number-field.cjs");
var staged = require("../../../lib/staged-dialog.cjs");

// 这里只是把「默认值」（配置/来源任务）归一成合法初值，不涉及用户键入；
// 用户键入的值一律原样保留，只在提交时校验。
function initialPriority(source, origin, fallback) {
  var original = Number(origin && origin.priority);
  if (source === "2" && Number.isInteger(original) && original >= 1 && original <= 10) return original;
  var n = Number(fallback);
  return Number.isFinite(n) ? Math.min(10, Math.max(1, Math.floor(n))) : 1;
}
function validatePriority(value, source, t) {
  var n = Number(value);
  return String(value).trim() !== "" && Number.isInteger(n) && n >= 1 && n <= 10 ? "" :
    (source === "2" ? t.restartPriorityError : t.activePriorityError);
}
module.exports = function createModal(deps) {
  var React = deps.React, h = React.createElement;
  var TimelinePicker = require("../timeline/timeline-controls.cjs")(React).Picker;
  var WorkspaceSelect = require("../workspace/workspace-select.cjs")(React).WorkspaceSelect;
  var difficultyField = require("../item/difficulty-field.cjs")(React);
  var ownership = require("./ownership.cjs"), fields = require("./ownership-fields.cjs")(React);
  var DP = require("../../../lib/date-picker.cjs");
  var allTables = deps.allTables, tagNames = deps.tagNames, splitTags = deps.splitTags;
  var today = deps.today, addDays = deps.addDays, hostHasAddon = deps.hostHasAddon;
  // 分阶段对话框：外壳换行、Esc/遮罩关闭与焦点循环都交给共享层，
  // 忙时禁止关闭，避免保存中被 Esc 打断。
  var StagedDialog = staged.createStagedDialog({
    React: React, tag: "div", displayName: "TaskCreateDialog",
    maskClass: "wbt-modal-mask", dialogClass: "wbt-modal",
    header: function (p) {
      return h("div", { className: "wbt-modal-head" },
        h("h3", null, p.title),
        h("button", { type: "button", className: "wbt-icon", disabled: !!p.submitting, onClick: p.onClose, "aria-label": p.closeLabel }, "×"));
    },
    closeOnEscape: function (p) { return !p.submitting; },
    closeOnMask: function (p) { return !p.submitting; },
    // 表选择器内部自己用 Esc 收面板，别把它一起关掉。
    onKeyDown: function (e) {
      if (e.key === "Escape" && e.target && e.target.closest && e.target.closest(".wbt-table-picker")) {
        e.stopPropagation();
        return true;
      }
      return false;
    },
  });
  function CreateModal(props) {
    var t = props.t, tr = require("../timeline/timeline-copy.cjs")(props.t);
    var source = String(props.source || "0");
    var origin = props.originTask || null;
    var tables = ownership.tables(props.tree);
    var initTags = origin ? tagNames(origin).join(", ") : "";
    // 每次打开都重新确认，来源任务及树选择仅作建议。
    var defaults = props.defaults || {};
    var initPriority = initialPriority(source, origin, defaults.priority);
    // 配置里的默认难度同样只做初值归一，用户之后键入的值不再夹取。
    var initDifficulty = Math.max(0, Math.min(5, Number(defaults.difficulty) || 0));
    var initOffset = Math.floor(Number(defaults.targetOffset));
    if (!(initOffset >= 0)) initOffset = 0;
    var f = React.useState({
      title: "", description: "", timelineId: source === "1" && origin ? origin.timelineId || "" : "",
      tags: initTags, status: "0", priority: initPriority, difficulty: initDifficulty,
      publishDate: today(), targetDate: addDays(initOffset), doneDate: today(), shutdownDate: today(),
      tableId: "", newPath: false, tablePath: "", pathDescriptions: [], confirmed: false, workspaceIds: [],
    });
    var form = f[0], setForm = f[1];
    var busy = React.useState(false);
    var isBusy = busy[0], setBusy = busy[1];
    var err = React.useState("");
    var error = err[0], setError = err[1];
    var submission = React.useState({ pending: false })[0];
    function requestClose() { if (!submission.pending) props.onClose(); }
    var active = source === "2" || form.status === "0";
    var priorityError = active ? validatePriority(form.priority, source, t) : "";
    // 难度沿用「留空=未设置」，但非法键入（越界/非数字）只提示、不允许保存。
    var difficultyCheck = NF.validateNumber(form.difficulty, { min: 0, max: 5, step: 0.5, allowEmpty: true, lang: props.lang });

    var plan = ownership.preview(props.tree, form.tablePath, form.pathDescriptions);
    var targetValid = form.newPath ? !plan.error && form.confirmed : tables.some(function (x) { return x.id === form.tableId; });
    React.useEffect(function () {
      if (form.tableId && !tables.some(function (x) { return x.id === form.tableId; })) {
        setForm(function (prev) { return Object.assign({}, prev, { tableId: "" }); });
        setError("目标任务表已失效，请重新选择；已填写内容已保留。");
      }
    }, [props.tree, form.tableId]);
    function setMany(patch) { setForm(function (prev) { return Object.assign({}, prev, patch); }); }
    function set(k, v) {
      var next = Object.assign({}, form);
      next[k] = v;
      setForm(next);
    }
    function failed(message) {
      var text = String(message || "create failed");
      if (/TABLE_NOT_FOUND|TARGET_NOT_TABLE|TREE_CORRUPT/.test(text)) setMany({ tableId: "" });
      setError(text); submission.pending = false; setBusy(false);
    }
    function capabilityError(message) {
      var reason = String(message || "归属能力检查失败");
      var upgrade = /unknown.*action|action.*not.*found|未注册|不存在.*action|未知.*action/i.test(reason);
      return new Error((upgrade ? "归属能力不可用，请完整升级任务插件与宿主并重启；已保留表单。" : "归属能力检查失败，已保留表单：") + reason);
    }
    function submit() {
      if (priorityError || isBusy || submission.pending) return;
      if (!difficultyCheck.ok) { setError(difficultyCheck.error); return; }
      if (source === "2" && !(origin && origin.timelineId)) { setError(tr("请先手动建立并关联时间线，再重启")); return; }
      if (source === "1" && !form.timelineId) { setError(tr("请选择已有时间线")); return; }
      if (!String(form.title).trim()) { setError(t.needTitle); return; }
      if (!targetValid) { setError(form.newPath ? plan.error || "请确认新建路径" : t.needTable); return; }
      if (!form.publishDate || !form.targetDate) { setError(t.needDate); return; }
      submission.pending = true; setBusy(true); setError("");
      var args = {
        title: String(form.title).trim(),
        description: String(form.description || ""),
        tags: splitTags(form.tags), status: source === "2" ? "0" : String(form.status),
        priority: active ? Number(form.priority) : 0,
        difficulty: difficultyCheck.value || 0,
        publishDate: form.publishDate,
        targetDate: form.targetDate,
        source: source === "2" ? "2" : form.timelineId ? "1" : "0",
      };
      if (form.workspaceIds && form.workspaceIds.length) args.workspaceIds = form.workspaceIds.slice();
      if (form.newPath) Object.assign(args, { tablePath: plan.parts, createMissing: true, pathDescriptions: plan.parts.map(function (_, i) { return form.pathDescriptions[i] || ""; }) });
      else args.tableId = String(form.tableId);
      if (source === "2" && origin) args.restartKey = String(origin.id);
      else if (form.timelineId) args.timelineId = form.timelineId;
      if (args.status === "2") {
        args.doneDate = form.doneDate || today();
      }
      if (args.status === "1") args.shutdownDate = form.shutdownDate || today();
      props.api.call("tasks.capabilities", { limit: 1 }).then(function (cap) {
        if (!cap || !cap.ok) throw capabilityError(cap && cap.error);
        return props.api.call("tasks.create", args);
      }, function (e) { throw capabilityError(e && e.message || e); }).then(function (r) {
        if (!r || !r.ok) { failed(r && r.error); return; }
        props.onCreated(r.result);
      }).catch(function (e) { failed(e && e.message || e); });
    }

    var title = source === "2" ? t.restartTitle : source === "1" ? tr("向已有时间线添加任务") : t.newTask;
    var timelineSection = h("div", { className: "wbt-create-tl full" },
      h("div", { className: "wbt-create-tl-head" },
        h("span", null, t.timeline),
        source === "1" ? h("span", { className: "wbt-create-tl-hint" }, tr("向已有时间线添加任务")) : null),
      h(TimelinePicker, { api: props.api, t: t, value: form.timelineId, onChange: function (value) { set("timelineId", value); }, disabled: isBusy })
    );

    // 第一步同时承担「内容」与「计划」：标题、描述、状态、优先级、难度与日期都在这屏。
    function stepContent(h2) {
      return h2("div", { className: "wbctl-form" },
        origin ? h2("div", { className: "wbt-mhint full" },
          "来源：" + (origin.title || origin.id) + (source === "2" ? tr(" · 自动继承原时间线") : "")) : null,
        h2("label", { className: "wbt-field full" }, h2("span", null, t.titleField + " *"),
          h2("input", { className: "wbt-input", value: form.title, onChange: function (e) { set("title", e.target.value); } })),
        h2("label", { className: "wbt-field full" }, h2("span", null, t.desc),
          h2("textarea", { className: "wbt-textarea", rows: 3, value: form.description, onChange: function (e) { set("description", e.target.value); } })),
        source === "2" ? h2("div", { className: "wbt-mhint full" }, t.restartPriorityHint) : null,
        h2("label", { className: "wbt-field" }, h2("span", null, t.status),
          h2("select", { className: "wbt-select", value: source === "2" ? "0" : form.status, disabled: source === "2", onChange: function (e) { set("status", e.target.value); } },
            h2("option", { value: "0" }, "已开启"), h2("option", { value: "2" }, "已完成"), h2("option", { value: "1" }, "已关闭"))),
        h2("div", { className: "wbt-field" }, h2("span", { className: "wbt-field-label" }, t.priority + "（1–10）"),
          h2(NF.NumberField, { h: h2, lang: props.lang, value: form.priority, min: 1, max: 10, integer: true, disabled: !active, hint: false, ariaLabel: t.priority,
            // 键入即写入草稿；合法性由下面的 priorityError 实时判定，绝不回写夹取后的值。
            onDraft: function (raw) { set("priority", raw); },
            onCommit: function (next) { set("priority", String(next)); } })),
        priorityError ? h2("div", { className: "wbt-err full", role: "alert" }, priorityError) : null,
        difficultyField(t, form.difficulty, function (value) { set("difficulty", value); }, "wbt-create-difficulty", props.lang),
        h2("label", { className: "wbt-field" }, h2("span", null, t.publishDate),
          h2(DP.DatePicker, { React: React, h: h2, prefix: "wbt", lang: props.lang, label: t.publishDate, value: form.publishDate, onChange: function (next) { set("publishDate", next); } })),
        h2("label", { className: "wbt-field" }, h2("span", null, t.targetDate),
          h2(DP.DatePicker, { React: React, h: h2, prefix: "wbt", lang: props.lang, label: t.targetDate, value: form.targetDate, onChange: function (next) { set("targetDate", next); } })),
        (source !== "2" && form.status === "2") ? h2("label", { className: "wbt-field" }, h2("span", null, t.doneDate),
          h2(DP.DatePicker, { React: React, h: h2, prefix: "wbt", lang: props.lang, label: t.doneDate, value: form.doneDate, onChange: function (next) { set("doneDate", next); } })) : null,
        (source !== "2" && form.status === "1") ? h2("label", { className: "wbt-field" }, h2("span", null, t.shutdownDate),
          h2(DP.DatePicker, { React: React, h: h2, prefix: "wbt", lang: props.lang, label: t.shutdownDate, value: form.shutdownDate, onChange: function (next) { set("shutdownDate", next); } })) : null);
    }
    // 标签单独一步：草稿仍是一行逗号分隔文本，提交时才 splitTags。
    function stepTags(h2) {
      return h2("div", { className: "wbctl-form" },
        h2("label", { className: "wbt-field full" }, h2("span", null, t.tags),
          h2("input", { className: "wbt-input", value: form.tags, placeholder: t.tagPlaceholder, onChange: function (e) { set("tags", e.target.value); } })),
        h2("p", { className: "wbctl-note" }, t.stepTagsHint));
    }
    function stepTable(h2) {
      return h2("div", { className: "wbctl-form" },
        h2("div", { className: "full" },
          fields({ form: form, set: set, setMany: setMany, tree: props.tree, recommended: props.defaultTableId || (origin && origin.tableId) })));
    }
    function stepTimeline(h2) {
      if (source === "2") {
        return h2("div", { className: "wbctl-form" },
          h2("p", { className: "wbt-mhint full" }, tr("继承来源任务的时间线")),
          !(origin && origin.timelineId) ? h2("p", { className: "wbt-err full", role: "alert" }, tr("请先手动建立并关联时间线，再重启")) : null);
      }
      return h2("div", { className: "wbctl-form" }, timelineSection);
    }
    function stepWorkspace(h2) {
      return h2("div", { className: "wbctl-form" },
        h2(WorkspaceSelect, { api: props.api, lang: props.lang, value: form.workspaceIds, onChange: function (ids) { set("workspaceIds", ids); } }));
    }
    function reviewRow(h2, key, value) {
      return h2("div", { className: "wbctl-review-row" },
        h2("span", { className: "wbctl-review-k" }, key),
        h2("span", { className: "wbctl-review-v" }, value));
    }
    function stepConfirm(h2) {
      var tableText = form.newPath ? plan.parts.join(" / ") : (tables.filter(function (x) { return x.id === form.tableId; })[0] || {}).name || t.needTable;
      var statusText = (source === "2" ? "0" : form.status) === "2" ? "已完成" : (source === "2" ? "0" : form.status) === "1" ? "已关闭" : "已开启";
      var rows = [
        [t.titleField, String(form.title || "").trim() || "（空）"],
        [t.desc, String(form.description || "").trim() || "—"],
        [t.tags, form.tags || "—"],
        [t.timeline, form.timelineId ? form.timelineId : (source === "2" && origin && origin.timelineId ? tr("继承来源任务的时间线") : "无")],
        [t.workspace || "工作区", String((form.workspaceIds || []).length) + " 个"],
        [t.table, tableText],
        [t.status, statusText],
        [t.priority, active ? String(form.priority) : "0（已完成/已关闭清零）"],
        [t.difficulty, String(form.difficulty || 0)],
        [t.publishDate, form.publishDate],
        [t.targetDate, form.targetDate],
      ];
      if ((source === "2" ? "0" : form.status) === "2") rows.push([t.doneDate, form.doneDate || today()]);
      if ((source === "2" ? "0" : form.status) === "1") rows.push([t.shutdownDate, form.shutdownDate || today()]);
      return h2("div", null,
        h2("div", { className: "wbctl-review" }, rows.map(function (row, i) { return reviewRow(h2, row[0], row[1]); })),
        h2("p", { className: "wbctl-note" }, t.confirmHint));
    }

    var steps = [
      {
        key: "content", label: t.stepContent, hint: t.stepContentHint, render: stepContent,
        validate: function () {
          if (!String(form.title).trim()) return t.needTitle;
          if (priorityError) return priorityError;
          if (!difficultyCheck.ok) return difficultyCheck.error;
          if (!form.publishDate || !form.targetDate) return t.needDate;
          return "";
        },
      },
    ];
    if (hostHasAddon("wb-addon-tags")) {
      steps.push({ key: "tags", label: t.stepTags, hint: t.stepTagsHint, render: stepTags });
    }
    steps.push({
      key: "table", label: t.stepTable, hint: t.stepTableHint, render: stepTable,
      validate: function () { return targetValid ? "" : (form.newPath ? plan.error || "请确认新建路径" : t.needTable); },
    });
    steps.push({
      key: "timeline", label: t.stepTimeline, hint: t.stepTimelineHint, render: stepTimeline,
      validate: function () {
        if (source === "2" && !(origin && origin.timelineId)) return tr("请先手动建立并关联时间线，再重启");
        if (source === "1" && !form.timelineId) return tr("请选择已有时间线");
        return "";
      },
    });
    steps.push({ key: "workspace", label: t.stepWorkspace, hint: t.stepWorkspaceHint, render: stepWorkspace });
    steps.push({ key: "confirm", label: t.stepConfirm, hint: t.stepConfirmHint, render: stepConfirm });

    // 结构性不合法（缺标题/缺归属/优先级或难度非法/缺日期）提前反映成末步保存禁用，
    // 别让用户点到最后一步才被弹回去。
    var blocked = !String(form.title).trim() || !targetValid || !!priorityError || !difficultyCheck.ok ||
      !form.publishDate || !form.targetDate;

    return h(StagedDialog, {
      title: title, closeLabel: t.cancel, steps: steps,
      submitting: isBusy, error: error, submitDisabled: blocked,
      onClose: requestClose, onSubmit: submit,
      submitText: t.create, cancelText: t.cancel, nextText: t.nextStep || "下一步", backText: t.prevStep || "上一步",
      stepsLabel: t.createSteps || "创建步骤",
    });
  }

  return CreateModal;
};
