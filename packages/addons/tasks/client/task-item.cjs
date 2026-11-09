// 列表与卡片共用任务正文/内联编辑；依赖从入口注入，不引用入口。
"use strict";
module.exports = function (deps) {
  var React = deps.React, h = React.createElement;
  var Highlight = require("./highlight.cjs")(React);
  var statusInfo = deps.statusInfo, stars = deps.stars, pClass = deps.pClass;
  var today = deps.today, daysBetween = deps.daysBetween, cx = deps.cx;
  var Icon = deps.Icon, Countdown = deps.Countdown, PathCrumbs = deps.PathCrumbs;
  function TaskItem(props) {
    var t = props.t;
    var task = props.task;
    var st = statusInfo(task.status);
    var stName = props.lang === "en" ? st.en : st.zh;
    var myTags = task.tags || [];
    var isActive = String(task.status) === "0";
    var titleState = React.useState(null);
    var editingTitle = titleState[0], setEditingTitle = titleState[1];
    var descState = React.useState(null);
    var editingDesc = descState[0], setEditingDesc = descState[1];
    var revState = React.useState(null);
    var editingReview = revState[0], setEditingReview = revState[1];
    var titleRef = React.useRef(null);
    var descRef = React.useRef(null);
    var revRef = React.useRef(null);

    React.useEffect(function () {
      if (editingTitle !== null && titleRef.current) titleRef.current.focus();
    }, [editingTitle]);
    React.useEffect(function () {
      if (editingDesc !== null && descRef.current) descRef.current.focus();
    }, [editingDesc]);
    React.useEffect(function () {
      if (editingReview !== null && revRef.current) revRef.current.focus();
    }, [editingReview]);

    function beginTitle() {
      // 任何状态（进行中/已关闭/已完成/重启）都允许改标题。
      setEditingTitle(String(task.title || ""));
    }
    function saveTitle() {
      if (editingTitle === null) return;
      var v = String(editingTitle).trim();
      if (!v) {
        props.toast(t.needTitle);
        setEditingTitle(null);
        return;
      }
      if (v !== String(task.title || "")) props.update(task, { type: "TITLE", title: v });
      setEditingTitle(null);
    }
    function beginDesc() {
      if (!isActive) return;
      setEditingDesc(String(task.description || ""));
    }
    function saveDesc() {
      if (editingDesc === null) return;
      if (String(editingDesc) !== String(task.description || "")) {
        props.update(task, { type: "DESCRIPTION", description: String(editingDesc) });
      }
      setEditingDesc(null);
    }
    function beginReview() {
      setEditingReview(String(task.review || ""));
    }
    function saveReview() {
      if (editingReview === null) return;
      if (String(editingReview) !== String(task.review || "")) {
        props.update(task, { type: "REVIEW", review: String(editingReview) });
      }
      setEditingReview(null);
    }

    var countdown = String(task.status) === "0" ? daysBetween(task.targetDate) : null;
    var cdTarget = String(task.status) === "0" && task.targetDate ? new Date(String(task.targetDate) + "T23:59:59").getTime() : NaN;
    var tagNodes = myTags.map(function (tag) {
      return h("span", {
        key: "tag-" + String(tag.id), className: "wbt-tag", title: tag.name,
        onClick: props.onTagPick ? function (e) { e.stopPropagation(); props.onTagPick(String(tag.id)); } : null,
      }, "#" + tag.name);
    });
    var meta = [];
    if (task.publishDate) meta.push(h("span", { key: "p" }, h("b", null, t.publish), " ", task.publishDate));
    if (String(task.status) === "0" && task.targetDate) {
      meta.push(h("span", { key: "g" }, h("b", null, t.target), " ", task.targetDate,
        Number.isFinite(cdTarget) ? h(Countdown, { target: cdTarget }) : null));
    } else if (String(task.status) === "2") {
      if (task.targetDate) meta.push(h("span", { key: "g" }, h("b", null, t.target), " ", task.targetDate));
      if (task.doneDate) meta.push(h("span", { key: "d" }, h("b", null, t.done), " ", task.doneDate));
      meta.push(h("span", { key: "s", className: "wbt-stars", children: stars(task.difficulty) + " " + Number(task.difficulty || 0).toFixed(1) }));
    } else {
      if (task.targetDate) meta.push(h("span", { key: "g" }, h("b", null, t.target), " ", task.targetDate));
      if (task.shutdownDate) meta.push(h("span", { key: "s" }, h("b", null, t.shutdown), " ", task.shutdownDate));
    }

    var ops = [];
    ops.push(h("button", {
      key: "edit", className: "wbt-icon", title: t.edit, "aria-label": t.edit,
      onClick: function () { props.onEdit(task); },
    }, h(Icon, { name: "pencil", size: 14 })));
    if (isActive) {
      ops.push(h("button", { key: "p+", className: "wbt-icon", title: t.priority + " +1", onClick: function () { if (Number(task.priority) < 10) props.update(task, { type: "PRIORITY", priority: Math.max(1, Number(task.priority) + 1) }); } }, h(Icon, { name: "plus", size: 14 })));
      ops.push(h("button", { key: "p-", className: "wbt-icon", title: t.priority + " -1", onClick: function () { if (Number(task.priority) > 1) props.update(task, { type: "PRIORITY", priority: Number(task.priority) - 1 }); } }, h(Icon, { name: "minus", size: 14 })));
      ops.push(h("button", { key: "done", className: "wbt-btn wbt-act-done", onClick: function () { props.onDone(task); } }, h(Icon, { name: "check", size: 14 }), t.complete));
      ops.push(h("button", { key: "shut", className: "wbt-btn wbt-act-close", onClick: function () { props.update(task, { type: "STATUS", status: "1", date: today() }); } }, h(Icon, { name: "stop", size: 14 }), t.shutdownOp));
    }
    ops.push(h("button", { key: "restart", className: "wbt-btn ghost", onClick: function () { props.onRestart(task); } }, h(Icon, { name: "restart", size: 14 }), t.restart));
    ops.push(h("button", { key: "timeline", className: "wbt-btn ghost", onClick: function () { props.onTimeline(task); } }, h(Icon, { name: "timeline", size: 14 }), t.timeline));
    if (props.onDelete) {
      ops.push(h("button", {
        key: "del", className: "wbt-icon wbt-danger", title: t.del, "aria-label": t.del,
        onClick: function () { props.onDelete(task); },
      }, h(Icon, { name: "trash", size: 14 })));
    }

    var titleNode = editingTitle !== null
      ? h("input", {
          ref: titleRef, className: "wbt-input", style: { fontSize: "13px", padding: "4px 7px" },
          value: editingTitle,
          onChange: function (e) { setEditingTitle(e.target.value); },
          onKeyDown: function (e) {
            if (e.key === "Enter") { e.preventDefault(); saveTitle(); }
            if (e.key === "Escape") setEditingTitle(null);
          },
          onBlur: saveTitle,
        })
      : h("div", { className: "wbt-title", onDoubleClick: beginTitle, title: t.editTitle }, h(Highlight, { text: task.title, keyword: props.keyword }));

    var descNode = editingDesc !== null
      ? h("textarea", {
          ref: descRef, className: "wbt-textarea", rows: 2,
          value: editingDesc,
          onChange: function (e) { setEditingDesc(e.target.value); },
          onKeyDown: function (e) {
            if (e.key === "Escape") setEditingDesc(null);
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); saveDesc(); }
          },
          onBlur: saveDesc,
        })
      : (task.description ? h("div", { className: "wbt-desc wb-desc", onDoubleClick: beginDesc }, h(Highlight, { text: task.description, keyword: props.keyword })) : null);


    var reviewNode = editingReview !== null
      ? h("textarea", {
          ref: revRef, className: "wbt-textarea", rows: 2, placeholder: t.reviewPlaceholder,
          value: editingReview,
          onChange: function (e) { setEditingReview(e.target.value); },
          onKeyDown: function (e) {
            if (e.key === "Escape") setEditingReview(null);
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); saveReview(); }
          },
          onBlur: saveReview,
        })
      : (task.review ? h("div", { className: "wbt-review", title: t.editReview, onDoubleClick: beginReview },
          h("span", { className: "wbt-review-label" }, t.review), h(Highlight, { text: task.review, keyword: props.keyword })) : null);


    // 信息层级：标题 → 标签/时间/路径（元信息区）→ [卡片] 操作按钮 → 描述 → 复核。
    // 列表态操作按钮仍在标题行右侧；两种形态共用同一套节点，避免两套布局再次跑偏。
    var line1 = h("div", { className: "wbt-line1" },
      String(task.status) === "0"
        ? h("span", { className: "wbt-prio " + pClass(task.priority), children: "P" + task.priority })
        : h("span", { className: "wbt-prio low", title: t.priority + " 0", children: "—" }),
      h("span", { className: "wbt-badge " + st.cls, children: stName }),
      titleNode
    );
    var opsNode = h("div", { className: cx("wbt-ops", props.card && "wbt-ops-block"), key: "ops" }, ops);
    var tagBlock = tagNodes.length ? h("div", { className: "wbt-tags", key: "tags" }, tagNodes) : null;
    var metaBlock = meta.length ? h("div", { className: "wbt-foot", key: "meta" }, h("div", { className: "wbt-meta" }, meta)) : null;
    var pathBlock = (task.path && task.path.length) ? h("div", { className: "wbt-taskpath", key: "path" }, h(PathCrumbs, { path: task.path, t: t, onPick: props.onPathPick })) : null;
    var metaZone = (tagBlock || metaBlock || pathBlock)
      ? h("div", { className: "wbt-metazone", key: "metazone" }, tagBlock, metaBlock, pathBlock)
      : null;

    return h("div", { className: cx("wbt-item", props.card && "wbt-card", String(task.status) === "1" && "closed") },
      props.selectionMode ? h("input", { type: "checkbox", className: "wbt-check", checked: !!props.checked, onChange: function () { props.onCheck(task.id); } }) : null,
      h("div", { className: "wbt-main" },
        h("div", { className: "wbt-chead" }, line1, props.card ? null : opsNode),
        metaZone,
        props.card ? opsNode : null,
        descNode,
        reviewNode
      )
    );
  }

  return TaskItem;
};
