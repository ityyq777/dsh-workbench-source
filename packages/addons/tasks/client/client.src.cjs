// dsh-workbench-tasks 浏览器侧源码。构建：node scripts/build-addon-clients.mjs → lib/client.js
(function () {
  "use strict";

  var host = window.__WB_HOST__;
  if (!host) {
    console.error("[wb-addon-tasks] 宿主桥 window.__WB_HOST__ 不存在，视图未注册");
    module.exports = { name: "dsh-workbench-tasks", inject: [], apply: function () {} };
    return;
  }
  var React = require("react");
  var h = React.createElement;
  var TagFilter = require("./tagfilter.cjs");
  var statsView = require("./stats.cjs");
  var configView = require("./config.cjs");
  var dataView = require("./data.cjs");

  var COPY = {
    zh: {
      title: "任务", search: "搜索任务标题", newTask: "新建任务", tree: "任务树",
      select: "选择", cancelSelect: "退出选择", list: "列表", card: "卡片",
      all: "全部", empty: "这个视图还没有任务", loading: "加载中…",
      error: "操作失败：", save: "保存", cancel: "取消", create: "创建", close: "关闭",
      addGroup: "新建组", addTable: "新建表", rename: "重命名", del: "删除",
      editGroup: "编辑任务组", editTable: "编辑任务表", nodeName: "名称", nodeDesc: "描述（可选）",
      nodeDescPh: "写清这张表是做什么的，以后可按描述关键词检索定位",
      needName: "名称不能为空", nodeDescSave: "描述已保存",
      editTitle: "双击编辑标题（任何状态都可改）",
      deleteConfirm: "确定删除这个节点及其子树？子树中的任务会被软删除。",
      deleteTaskConfirm: "确定删除这条任务吗？删除后不可恢复。",
      batchDelete: "批量删除", batchDeleteConfirm: "确定删除选中的 {n} 条任务吗？删除后不可恢复。", deletePartial: "部分删除失败",
      root: "全部任务组", manager: "管理模式", filterRestarted: "过滤已重启",
      treeSearch: "搜索任务组 / 任务表", treeHint: "点任务表筛选任务；管理模式可拖拽排序、改名或删除",
      groups: "个任务组", tables: "张任务表", treeNoMatch: "没有匹配的节点",
      tags: "标签", tagsHint: "用标签归类（工作/生活/学习/开发 已是标签）", tagPlaceholder: "多个标签用逗号分隔，例如：工作, 开发",
      tagFilter: "标签筛选", allTags: "全部标签", noTags: "暂无标签",
      tagSearchPlaceholder: "搜索标签名称", tagNoMatch: "没有匹配的标签", loadingMore: "加载中…", noMore: "没有更多",
      tagSelected: "已选", tagRemove: "移除",
      untagged: "未打标签", publish: "发布", target: "计划完成", done: "实际完成",
      shutdown: "关闭时间", priority: "优先级", difficulty: "难度", desc: "描述",
      review: "感受", reviewHint: "写下完成时的感受（可选）",
      reviewPlaceholder: "例如：思路很顺 / 卡在接口调试 / 比预想轻松", reviewAdd: "记录感受",
      status: "状态", publishDate: "发布日期", targetDate: "计划完成日期",
      doneDate: "完成日期", shutdownDate: "关闭日期", table: "任务表", titleField: "标题",
      timeline: "时间线", restart: "重启", complete: "完成", shutdownOp: "关闭",
      selected: "已选", selectedTasks: "选中任务", batchTimeline: "归并时间线",
      batchMigrate: "迁移任务表", refresh: "刷新", clear: "清空", truncated: "已截断：只显示前",
      chooseBase: "选择基准任务（使用它的时间线）", chooseTable: "选择目标任务表",
      searchTable: "搜索任务表", noTable: "没有匹配的任务表", baseLabel: "基准任务", targetLabel: "目标任务表",
      batchCount: "已选", hasTimeline: "有时间线", noTimelineTag: "无时间线", group: "任务组",
      timelineTitle: "任务时间线", newTimeline: "新建时间线任务",
      restartTitle: "重启任务", noTimeline: "这条任务还没有时间线",
      confirm: "确定", difficultyHint: "完成任务前请选择难度（0.5–5）",
      emptyTree: "任务树还没有数据", appear: "显示", hide: "隐藏",
      move: "移动到", source: "来源", page: "页", total: "共", items: "条",
      doneSuccess: "已完成", saved: "已保存", created: "已创建", updated: "已更新",
      edit: "编辑", editTitle: "编辑任务", editHintDone: "已完成：标题、描述、感受、难度可改；优先级在完成时已清零。",
      editHintOpen: "未完成：标题、描述、优先级可改；感受与难度要到完成时才填写。",
      deleted: "已删除", needTitle: "标题不能为空", needTable: "请选择任务表",
      needDate: "日期不能为空", needBase: "请选择基准任务", needDifficulty: "请选择难度",
    },
    en: {
      title: "Tasks", search: "Search title", newTask: "New task", tree: "Task tree",
      select: "Select", cancelSelect: "Exit select", list: "List", card: "Cards",
      all: "All", empty: "No tasks in this view", loading: "Loading…",
      error: "Failed: ", save: "Save", cancel: "Cancel", create: "Create", close: "Close",
      addGroup: "New group", addTable: "New table", rename: "Rename", del: "Delete",
      editGroup: "Edit group", editTable: "Edit table", nodeName: "Name", nodeDesc: "Description (optional)",
      nodeDescPh: "Say what this table is for; agents can find it by description keywords",
      needName: "Name is required", nodeDescSave: "Description saved",
      editTitle: "Double-click to rename (any status)",
      deleteConfirm: "Delete this node and its subtree? Tasks under it will be soft-deleted.",
      deleteTaskConfirm: "Delete this task? This cannot be undone.",
      batchDelete: "Delete", batchDeleteConfirm: "Delete {n} selected tasks? This cannot be undone.", deletePartial: "some deletes failed",
      root: "All tasks", manager: "Manage", filterRestarted: "Hide restarted",
      treeSearch: "Search groups / tables", treeHint: "Pick a table to filter tasks; Manage mode allows drag, rename and delete",
      groups: "groups", tables: "tables", treeNoMatch: "No matching node",
      tags: "Tags", tagsHint: "Group tasks with tags (Work/Life/Study/Dev are tags now)", tagPlaceholder: "Comma separated, e.g. Work, Dev",
      tagFilter: "Filter by tag", allTags: "All tags", noTags: "No tags",
      tagSearchPlaceholder: "Search tag name", tagNoMatch: "No matching tag", loadingMore: "Loading…", noMore: "No more",
      tagSelected: "Selected", tagRemove: "Remove",
      untagged: "Untagged", publish: "Published", target: "Target", done: "Done",
      shutdown: "Closed", priority: "Priority", difficulty: "Difficulty", desc: "Description",
      review: "Feeling", reviewHint: "How did it feel to finish? (optional)",
      reviewPlaceholder: "e.g. smooth, stuck on the API, easier than expected", reviewAdd: "Add feeling",
      status: "Status", publishDate: "Publish date", targetDate: "Target date",
      doneDate: "Done date", shutdownDate: "Close date", table: "Task table", titleField: "Title",
      timeline: "Timeline", restart: "Restart", complete: "Complete", shutdownOp: "Close",
      selected: "Selected", selectedTasks: "Selected tasks", batchTimeline: "Merge timeline",
      batchMigrate: "Move table", refresh: "Refresh", clear: "Clear", truncated: "Truncated: showing first",
      searchTable: "Search tables", noTable: "No matching table", baseLabel: "Base task", targetLabel: "Target table",
      batchCount: "Selected", hasTimeline: "has timeline", noTimelineTag: "no timeline", group: "Group",
      chooseBase: "Choose a base task (it supplies the timeline)", chooseTable: "Choose target table",
      timelineTitle: "Task timeline", newTimeline: "New timeline task",
      restartTitle: "Restart task", noTimeline: "No timeline for this task",
      confirm: "OK", difficultyHint: "Pick a difficulty (0.5–5) before completing",
      emptyTree: "Task tree is empty", appear: "Show", hide: "Hide",
      move: "Move to", source: "Source", page: "Page", total: "Total", items: "items",
      doneSuccess: "Completed", saved: "Saved", created: "Created", updated: "Updated",
      edit: "Edit", editTitle: "Edit task", editHintDone: "Completed: title, description, feeling and difficulty can change; priority was cleared on completion.",
      editHintOpen: "Open: title, description and priority can change; feeling and difficulty are filled in when completing.",
      deleted: "Deleted", needTitle: "Title is required", needTable: "Pick a task table",
      needDate: "Date is required", needBase: "Pick a base task", needDifficulty: "Pick a difficulty",
    },
  };

  // 标签是可选子插件：以宿主已安装/启用列表为准；旧宿主没有列表时返回 true，交给后端降级。
  function hostHasAddon(id) {
    var list = host.addons;
    if (!Array.isArray(list)) return true;
    return list.some(function (a) { return a && a.id === id && a.enabled !== false; });
  }

  // 任务不再有「类型」：工作/生活/学习/开发 已迁成标签，按标签筛选。
  var TABS = [
    { id: 0, zh: "紧急任务", en: "Urgent" },
    { id: 5, zh: "已关闭", en: "Closed" },
    { id: 6, zh: "已开启", en: "Active" },
    { id: 7, zh: "已完成", en: "Done" },
    { id: 8, zh: "总览", en: "Overview" },
  ];
  var STATUS = {
    "0": { zh: "已开启", en: "Active", cls: "active" },
    "1": { zh: "已关闭", en: "Closed", cls: "shutdown" },
    "2": { zh: "已完成", en: "Done", cls: "done" },
    "3": { zh: "已重启", en: "Restarted", cls: "restarted" },
  };

  // 任务插件自带 lucide-react 图标；每个图标按需引入，随 client.js 一起打包。
  var ICONS = {
    "plus": require("lucide-react/icons/plus").default,
    "minus": require("lucide-react/icons/minus").default,
    "check": require("lucide-react/icons/check").default,
    "stop": require("lucide-react/icons/square").default,
    "restart": require("lucide-react/icons/rotate-ccw").default,
    "timeline": require("lucide-react/icons/list-tree").default,
    "tree": require("lucide-react/icons/folder-tree").default,
    "search": require("lucide-react/icons/search").default,
    "grid": require("lucide-react/icons/layout-grid").default,
    "list": require("lucide-react/icons/list").default,
    "select": require("lucide-react/icons/square-check-big").default,
    "left": require("lucide-react/icons/chevron-left").default,
    "right": require("lucide-react/icons/chevron-right").default,
    "folder": require("lucide-react/icons/folder").default,
    "folderOpen": require("lucide-react/icons/folder-open").default,
    "table": require("lucide-react/icons/table-2").default,
    "house": require("lucide-react/icons/house").default,
    "folderPlus": require("lucide-react/icons/folder-plus").default,
    "filePlus": require("lucide-react/icons/file-plus").default,
    "pencil": require("lucide-react/icons/pencil").default,
    "trash": require("lucide-react/icons/trash-2").default,
    "close": require("lucide-react/icons/x").default,
    "down": require("lucide-react/icons/chevron-down").default,
    "tag": require("lucide-react/icons/tag").default,
    "clock": require("lucide-react/icons/clock").default,
    "refresh": require("lucide-react/icons/refresh-cw").default,
  };
  // 统一的小尺寸图标调用方式，保持各视图里的 Icon({ name, size }) 不变。
  function Icon(props) {
    var C = ICONS[props.name];
    if (!C) return null;
    return h(C, { size: props.size || 14, strokeWidth: 2, "aria-hidden": "true", className: "wbt-svg" });
  }

  // 计划完成倒计时：按秒刷新，超过计划完成时间后转为「逾期 hh:mm:ss」。
  function Countdown(props) {
    var s = React.useState(Date.now());
    var now = s[0];
    var setNow = s[1];
    React.useEffect(function () {
      var id = setInterval(function () { setNow(Date.now()); }, 1000);
      return function () { clearInterval(id); };
    }, []);
    var diff = props.target - now;
    var over = diff < 0;
    var total = Math.floor(Math.abs(diff) / 1000);
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    var text = (over ? "逾期 " : "") + pad(Math.floor(total / 3600)) + ":" + pad(Math.floor((total % 3600) / 60)) + ":" + pad(total % 60);
    return h("span", {
      className: "wbt-countdown" + (over ? " overdue" : diff < 3600000 ? " soon" : ""),
      title: over ? "已超过计划完成时间" : "距计划完成",
    }, h(Icon, { name: "clock", size: 11 }), h("span", { className: "wbt-cd-num" }, text));
  }

  var CSS = require("./styles.cjs");

  function injectCss() {
    if (typeof document === "undefined") return;
    var old = document.getElementById("wb-addon-tasks-v2-css");
    if (old) { old.textContent = CSS; return; }
    var s = document.createElement("style");
    s.id = "wb-addon-tasks-v2-css";
    s.setAttribute("data-wb-addon", "wb-addon-tasks");
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function cx() {
    return Array.prototype.filter.call(arguments, Boolean).join(" ");
  }
  function addDays(n) {
    var d = new Date();
    d.setDate(d.getDate() + Number(n || 0));
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function daysBetween(dateText) {
    if (!dateText) return null;
    var d = new Date(String(dateText) + "T00:00:00");
    if (Number.isNaN(d.getTime())) return null;
    var n = new Date();
    n.setHours(0, 0, 0, 0);
    return Math.round((d.getTime() - n.getTime()) / 86400000);
  }
  /** "工作, 开发" → ["工作","开发"]（去空、去重，保留顺序）。 */
  function splitTags(text) {
    var out = [];
    String(text || "").split(/[,，]/).forEach(function (x) {
      var v = String(x).trim();
      if (v && out.indexOf(v) < 0) out.push(v);
    });
    return out;
  }
  function tagNames(task) {
    return (task && task.tags ? task.tags : []).map(function (x) { return String(x.name || ""); }).filter(Boolean);
  }
  function statusInfo(id) {
    return STATUS[String(id)] || STATUS["0"];
  }
  function treeFlat(nodes, depth, out) {
    var arr = out || [];
    for (var i = 0; i < (nodes || []).length; i++) {
      var n = nodes[i];
      arr.push({ id: String(n.id), name: n.name, type: String(n.type), depth: depth || 0 });
      if (n.children && n.children.length) treeFlat(n.children, (depth || 0) + 1, arr);
    }
    return arr;
  }
  function treeWalk(nodes, depth, out) {
    var arr = out || [];
    for (var i = 0; i < (nodes || []).length; i++) {
      var n = nodes[i];
      arr.push({ node: n, depth: depth || 0 });
      if (n.children && n.children.length) treeWalk(n.children, (depth || 0) + 1, arr);
    }
    return arr;
  }
  function findFirstTable(nodes) {
    for (var i = 0; i < (nodes || []).length; i++) {
      var n = nodes[i];
      if (String(n.type) === "1") return n;
      var found = findFirstTable(n.children || []);
      if (found) return found;
    }
    return null;
  }
  function findNode(nodes, id) {
    for (var i = 0; i < (nodes || []).length; i++) {
      var n = nodes[i];
      if (String(n.id) === String(id)) return n;
      var found = findNode(n.children || [], id);
      if (found) return found;
    }
    return null;
  }
  function allTables(nodes) {
    return treeFlat(nodes).filter(function (n) { return n.type === "1"; });
  }
  function pClass(n) {
    return n >= 6 ? "high" : n >= 3 ? "mid" : "low";
  }
  function stars(n) {
    var v = Number(n || 0);
    var full = Math.floor(v);
    var half = v - full >= 0.5;
    var out = "";
    for (var i = 0; i < full; i++) out += "★";
    if (half) out += "⯪";
    for (var j = full + (half ? 1 : 0); j < 5; j++) out += "☆";
    return out;
  }

  // 路径图标与任务树保持一致：根=屋、组=文件夹、表=表格。
  function pathIcon(type) {
    var code = String(type);
    return code === "1" ? "table" : code === "2" ? "house" : "folder";
  }

  function PathCrumbs(props) {
    var path = props.path || [];
    if (!path.length) return null;
    return h("div", { className: "wbt-path" }, path.map(function (p, i) {
      return h(React.Fragment, { key: p.id + "-" + i },
        i > 0 ? h("span", { className: "sep", children: "›" }) : null,
        h("button", {
          type: "button",
          title: p.name || p.id,
          onClick: function (e) {
            e.stopPropagation();
            if (props.onPick) props.onPick(p, i, path);
          },
        }, h(Icon, { name: pathIcon(p.type), size: 11 }), h("span", null, p.name || p.id))
      );
    }));
  }

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

    var isDone = String(task.status) === "2";
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
      : h("div", { className: "wbt-title", onDoubleClick: beginTitle, title: t.editTitle }, task.title);

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
      : (task.description ? h("div", { className: "wbt-desc", onDoubleClick: beginDesc }, task.description) : null);


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
      : (task.review ? h("div", { className: "wbt-review", title: isDone ? "双击编辑" + t.review : "", onDoubleClick: isDone ? beginReview : null },
          h("span", { className: "wbt-review-label" }, t.review), task.review) : null);


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

  function TreeNode(props) {
    var node = props.node;
    var t = props.t;
    var expanded = props.expanded;
    var isExpanded = expanded.has(String(node.id));
    var hasKids = node.children && node.children.length > 0;
    var selected = props.selectedTable === String(node.id) || (!props.selectedTable && props.selectedGroup === String(node.id));
    var isTable = String(node.type) === "1";
    var isRoot = String(node.parent) === "0" || String(node.parentId) === "0";
    var pad = 3 + (props.depth || 0) * 15;
    var editing = props.edit && String(props.edit.id) === String(node.id);
    var kids = node.children ? node.children.length : 0;

    function toggle(e) {
      e.stopPropagation();
      props.onToggle(node.id);
    }
    function select() {
      props.onSelect(node);
    }
    function stop(fn) {
      return function (e) { e.stopPropagation(); fn(); };
    }
    function drop(e) {
      e.preventDefault();
      e.stopPropagation();
      var src = props.dragId;
      if (!src || String(src) === String(node.id)) return;
      // 任务组（含没有任何子节点的空组）一律接收为子节点；停到任务表上则作为同级插入
      var asChild = !isTable;
      props.onMove(src, node.id, asChild ? 0 : 2);
    }
    return h("div", null,
      h("div", {
        className: cx("wbt-tree-row", selected && "sel", props.dropId === String(node.id) && "drop"),
        style: { paddingLeft: pad + "px" },
        draggable: props.manager && !isRoot,
        onDragStart: function (e) { props.onDragStart(node.id); },
        onDragOver: function (e) { e.preventDefault(); props.onDragOver(node.id); },
        onDrop: drop,
      },
        isTable || !hasKids
          ? h("span", { className: "wbt-tw void" })
          : h("button", { className: "wbt-tw", "aria-label": node.name, "aria-expanded": !!isExpanded, onClick: toggle }, h(Icon, { name: isExpanded ? "down" : "right", size: 12 })),
        h("span", { className: "wbt-ti" }, h(Icon, { name: isRoot ? "house" : isTable ? "table" : isExpanded ? "folderOpen" : "folder", size: 13 })),
        h("div", { className: "wbt-tn", onClick: select, title: node.description ? node.name + "\n" + node.description : node.name },
          editing ? h("input", {
            className: "wbt-input", style: { padding: "2px 6px", fontSize: "12px", width: "150px" },
            value: props.editName,
            autoFocus: true,
            onClick: function (e) { e.stopPropagation(); },
            onChange: function (e) { props.onEditName(e.target.value); },
            onKeyDown: function (e) {
              if (e.key === "Enter") { e.preventDefault(); props.onRename(node.id, props.editName); }
              if (e.key === "Escape") props.onCancelEdit();
            },
            onBlur: function () { props.onRename(node.id, props.editName); },
          }) : h("span", { className: "nm" }, node.name),
          !editing && node.description ? h("span", { className: "wbt-tdesc" }, String(node.description).replace(/\s+/g, " ")) : null,
          !isTable && hasKids && !editing ? h("span", { className: "wbt-tcnt" }, kids) : null
        ),
        h("div", { className: "wbt-tacts" },
          !isTable ? h("button", { title: t.addGroup, "aria-label": t.addGroup, onClick: stop(function () { props.onAdd(node.id, "0"); }) }, h(Icon, { name: "folderPlus", size: 12 })) : null,
          !isTable ? h("button", { title: t.addTable, "aria-label": t.addTable, onClick: stop(function () { props.onAdd(node.id, "1"); }) }, h(Icon, { name: "filePlus", size: 12 })) : null,
          !isRoot ? h("button", { title: t.rename, "aria-label": t.rename, onClick: stop(function () { props.onEdit(node); }) }, h(Icon, { name: "pencil", size: 12 })) : null,
          props.manager && !isRoot ? h("button", { title: t.del, "aria-label": t.del, className: "wbt-danger", onClick: stop(function () { props.onDelete(node); }) }, h(Icon, { name: "trash", size: 12 })) : null
        )
      ),
      isExpanded && hasKids ? h("div", null, node.children.map(function (kid) {
        return h(TreeNode, Object.assign({}, props, { key: kid.id, node: kid, depth: (props.depth || 0) + 1 }));
      })) : null
    );
  }

  function NodeModal(props) {
    var t = props.t;
    var node = props.node || null;
    var editing = !!node;
    var f = React.useState({
      name: node ? String(node.name || "") : "",
      description: node ? String(node.description || "") : "",
    });
    var form = f[0], setForm = f[1];
    var err = React.useState("");
    var error = err[0], setError = err[1];
    var busy = React.useState(false);
    var isBusy = busy[0], setBusy = busy[1];

    function set(k, v) {
      var next = Object.assign({}, form);
      next[k] = v;
      setForm(next);
    }
    function submit() {
      var name = String(form.name || "").trim();
      if (!name) { setError(t.needName); return; }
      if (name.length > 20) { setError(t.needName); return; }
      setBusy(true);
      setError("");
      var desc = String(form.description || "");
      var req = editing
        ? props.api.call("taskNodes.update", { id: node.id, name: name, description: desc })
        : props.api.call("taskNodes.create", { parentId: props.parentId, type: props.type, name: name, description: desc });
      req.then(function (r) {
        if (!r || !r.ok) { setError((r && r.error) || "failed"); setBusy(false); return; }
        props.onSaved(editing ? "update" : "create");
      }).catch(function (e) { setError(String((e && e.message) || e)); setBusy(false); });
    }

    var isTable = String(node ? node.type : props.type) === "1";
    var title = editing ? (isTable ? t.editTable : t.editGroup) : (isTable ? t.addTable : t.addGroup);
    return h("div", { className: "wbt-modal-mask", onMouseDown: function (e) { if (e.target === e.currentTarget) props.onClose(); } },
      h("div", { className: "wbt-modal" },
        h("div", { className: "wbt-modal-head" }, h("h3", null, title), h("button", { className: "wbt-icon", onClick: props.onClose }, "×")),
        h("div", { className: "wbt-form" },
          h("label", { className: "wbt-field full" }, h("span", null, t.nodeName + " *"),
            h("input", { className: "wbt-input", value: form.name, maxLength: 20, autoFocus: true, onChange: function (e) { set("name", e.target.value); } })),
          h("label", { className: "wbt-field full" }, h("span", null, t.nodeDesc),
            h("textarea", { className: "wbt-textarea", rows: 3, value: form.description, placeholder: t.nodeDescPh, onChange: function (e) { set("description", e.target.value); } }))
        ),
        error ? h("div", { className: "wbt-err" }, error) : null,
        h("div", { className: "wbt-modal-foot" },
          h("button", { className: "wbt-btn ghost", onClick: props.onClose }, t.cancel),
          h("button", { className: "wbt-btn primary", disabled: isBusy, onClick: submit }, isBusy ? "…" : (editing ? t.save : t.create))
        )
      )
    );
  }

  function CreateModal(props) {
    var t = props.t;
    var source = props.source || "0";
    var origin = props.originTask || null;
    var tables = allTables(props.tree);
    var first = props.defaultTableId || (origin && origin.tableId) || (tables[0] && tables[0].id) || "";
    var initTags = origin ? tagNames(origin).join(", ") : "";
    var initTable = origin ? String(origin.tableId || first) : String(first);
    var defaults = props.defaults || {};
    var initPriority = Math.max(1, Math.floor(Number(defaults.priority)) || 1);
    if (!(initPriority >= 1)) initPriority = 1;
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

    function set(k, v) {
      var next = Object.assign({}, form);
      next[k] = v;
      setForm(next);
    }
    function submit() {
      if (!String(form.title).trim()) { setError(t.needTitle); return; }
      if (!form.tableId) { setError(t.needTable); return; }
      if (!form.publishDate || !form.targetDate) { setError(t.needDate); return; }
      setBusy(true); setError("");
      var args = {
        title: String(form.title).trim(),
        description: String(form.description || ""),
        tags: splitTags(form.tags), status: source === "2" ? "0" : String(form.status),
        priority: Number(form.priority) || 0,
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
        source !== "0" && origin ? h("div", { className: "wbt-mhint" }, "来源：" + (origin.title || origin.id) + (source === "2" ? " · 重启链 " + (origin.restartKey || origin.id) : " · 时间线 " + (origin.timelineKey || origin.id))) : null,
        h("div", { className: "wbt-form" },
          h("label", { className: "wbt-field full" }, h("span", null, t.titleField + " *"), h("input", { className: "wbt-input", value: form.title, onChange: function (e) { set("title", e.target.value); }, autoFocus: true })),
          h("label", { className: "wbt-field full" }, h("span", null, t.desc), h("textarea", { className: "wbt-textarea", rows: 2, value: form.description, onChange: function (e) { set("description", e.target.value); } })),
          hostHasAddon("wb-addon-tags") ? h("label", { className: "wbt-field full" }, h("span", null, t.tags), h("input", { className: "wbt-input", value: form.tags, placeholder: t.tagPlaceholder, onChange: function (e) { set("tags", e.target.value); } })) : null,
          h("label", { className: "wbt-field" }, h("span", null, t.status), h("select", { className: "wbt-select", value: source === "2" ? "0" : form.status, disabled: source === "2", onChange: function (e) { set("status", e.target.value); } },
            h("option", { value: "0" }, "已开启"), h("option", { value: "2" }, "已完成"), h("option", { value: "1" }, "已关闭"))),
          h("label", { className: "wbt-field" }, h("span", null, t.priority + "（1–10）"), h("input", { className: "wbt-input", type: "number", min: 1, max: 10, step: 1, disabled: form.status !== "0", value: form.priority, onChange: function (e) { set("priority", e.target.value); } })),
          h("label", { className: "wbt-field" }, h("span", null, t.table + " *"), h("select", { className: "wbt-select", value: form.tableId, onChange: function (e) { set("tableId", e.target.value); } }, tables.map(function (x) { return h("option", { key: x.id, value: x.id }, "　".repeat(x.depth) + x.name); }))),
          h("label", { className: "wbt-field" }, h("span", null, t.publishDate), h("input", { className: "wbt-input", type: "date", value: form.publishDate, onChange: function (e) { set("publishDate", e.target.value); } })),
          h("label", { className: "wbt-field" }, h("span", null, t.targetDate), h("input", { className: "wbt-input", type: "date", value: form.targetDate, onChange: function (e) { set("targetDate", e.target.value); } })),
          (source !== "2" && form.status === "2") ? h("label", { className: "wbt-field" }, h("span", null, t.doneDate), h("input", { className: "wbt-input", type: "date", value: form.doneDate, onChange: function (e) { set("doneDate", e.target.value); } })) : null,
          (source !== "2" && form.status === "2") ? h("label", { className: "wbt-field" }, h("span", null, t.difficulty + "（0–5）"), h("input", { className: "wbt-input", type: "number", min: 0, max: 5, step: 0.5, value: form.difficulty, onChange: function (e) { set("difficulty", e.target.value); } })) : null,
          (source !== "2" && form.status === "1") ? h("label", { className: "wbt-field" }, h("span", null, t.shutdownDate), h("input", { className: "wbt-input", type: "date", value: form.shutdownDate, onChange: function (e) { set("shutdownDate", e.target.value); } })) : null
        ),
        error ? h("div", { className: "wbt-err" }, error) : null,
        h("div", { className: "wbt-modal-foot" },
          h("button", { className: "wbt-btn ghost", onClick: props.onClose }, t.cancel),
          h("button", { className: "wbt-btn primary", disabled: isBusy, onClick: submit }, isBusy ? "…" : t.create)
        )
      )
    );
  }

  function TimelineModal(props) {
    var t = props.t;
    var task = props.task;
    var s = React.useState({ items: [], loading: true, error: "" });
    var state = s[0], setState = s[1];
    React.useEffect(function () {
      props.api.call("tasks.timeline", { timelineKey: task.timelineKey }).then(function (r) {
        if (r && r.ok) setState({ items: Array.isArray(r.result) ? r.result : [], loading: false, error: "" });
        else setState({ items: [], loading: false, error: (r && r.error) || "load failed" });
      }).catch(function (e) { setState({ items: [], loading: false, error: String(e && e.message || e) }); });
    }, [task.timelineKey]);
    var items = state.items;
    var last = items.length ? items[items.length - 1] : task;
    return h("div", { className: "wbt-modal-mask", onMouseDown: function (e) { if (e.target === e.currentTarget) props.onClose(); } },
      h("div", { className: "wbt-modal wide" },
        h("div", { className: "wbt-modal-head" },
          h("h3", null, t.timelineTitle),
          h("button", { className: "wbt-btn", onClick: function () { props.onCreateTimeline(last); } }, "＋ " + t.newTimeline),
          h("button", { className: "wbt-icon", onClick: props.onClose }, "×")
        ),
        state.loading ? h("div", { className: "wbt-mhint" }, t.loading) : state.error ? h("div", { className: "wbt-err" }, t.error + state.error) : (items.length === 0 ? h("div", { className: "wbt-empty" }, t.noTimeline) : h("div", { className: "wbt-timeline" }, items.map(function (x, i) {
          var st = statusInfo(x.status);
          return h("div", { className: "wbt-tl-item", key: x.id },
            h("div", { className: "wbt-tl-rail" }, h("div", { className: "wbt-tl-dot" }), i < items.length - 1 ? h("div", { className: "wbt-tl-line" }) : null),
            h("div", { className: "wbt-tl-body" },
              h("div", { className: "wbt-row" },
                h("span", { className: "wbt-badge " + st.cls }, st.zh),
                h("span", { className: "wbt-tl-title" }, x.title),
                h("span", { className: "wbt-pill" }, "P" + x.priority)
              ),
              h("div", { className: "wbt-tl-meta" },
                h("span", null, "发布 " + (x.publishDate || "-")),
                h("span", null, "计划 " + (x.targetDate || "-")),
                x.doneDate ? h("span", null, "完成 " + x.doneDate) : null,
                x.shutdownDate ? h("span", null, "关闭 " + x.shutdownDate) : null
              ),
              h(PathCrumbs, { path: x.path })
            )
          );
        })))
      )
    );
  }

  function DoneModal(props) {
    var t = props.t;
    var s = React.useState(1);
    var value = s[0], setValue = s[1];
    var rs = React.useState("");
    var review = rs[0], setReview = rs[1];
    var busy = React.useState(false);
    var isBusy = busy[0], setBusy = busy[1];
    return h("div", { className: "wbt-modal-mask", onMouseDown: function (e) { if (e.target === e.currentTarget) props.onClose(); } },
      h("div", { className: "wbt-modal", style: { width: "420px" } },
        h("div", { className: "wbt-modal-head" }, h("h3", null, t.complete + " · " + props.task.title), h("button", { className: "wbt-icon", onClick: props.onClose }, "×")),
        h("div", { className: "wbt-mhint" }, t.difficultyHint),
        h("div", { className: "wbt-row" },
          h("span", { className: "wbt-stars", style: { fontSize: "22px" } }, stars(value)),
          h("input", { type: "range", min: 0.5, max: 5, step: 0.5, value: value, onChange: function (e) { setValue(Number(e.target.value)); }, style: { flex: 1 } }),
          h("b", null, value.toFixed(1))
        ),
        h("label", { className: "wbt-field", style: { marginTop: "12px" } },
          h("span", null, t.review + " · " + t.reviewHint),
          h("textarea", { className: "wbt-textarea", rows: 3, placeholder: t.reviewPlaceholder, value: review, onChange: function (e) { setReview(e.target.value); } })
        ),
        h("div", { className: "wbt-modal-foot" },
          h("button", { className: "wbt-btn ghost", onClick: props.onClose }, t.cancel),
          h("button", { className: "wbt-btn primary", disabled: isBusy, onClick: function () {
            if (!value || value <= 0) return;
            setBusy(true);
            props.api.call("tasks.update", { id: props.task.id, type: "STATUS", status: "2", date: today(), difficulty: value, review: String(review || "") }).then(function (r) {
              setBusy(false);
              if (r && r.ok) props.onDone();
              else props.onError((r && r.error) || "update failed");
            });
          } }, isBusy ? "…" : t.confirm)
        )
      )
    );
  }

  // 任务编辑弹窗：按状态收敛可编辑字段。
  // 未完成（0/1/3）：标题、描述、优先级；感受与难度只在完成时填写。
  // 已完成（2）：标题、描述、感受、难度；优先级完成即清零，不再可改。
  function EditModal(props) {
    var t = props.t;
    var task = props.task;
    var done = String(task.status) === "2";
    var canPriority = !done;
    var fs = React.useState({
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
    function set(k, v) {
      setForm(function (prev) { var next = Object.assign({}, prev); next[k] = v; return next; });
    }
    var titleOk = String(form.title).trim().length > 0;
    function submit() {
      if (!titleOk) { setErr(t.needTitle); return; }
      var patch = { id: task.id, title: String(form.title).trim(), description: String(form.description || "") };
      if (canPriority) {
        var p = Math.round(Number(form.priority));
        if (!isFinite(p)) p = 1;
        if (!Number.isFinite(p)) p = 0;
        patch.priority = Math.max(1, Math.min(10, p));
        // 计划完成日期只处理非空值；留空表示不改动（后端空串会回落到原值）。
        if (String(form.targetDate || "").trim()) patch.targetDate = String(form.targetDate).trim();
      } else {
        patch.review = String(form.review || "");
        patch.difficulty = Math.max(0.5, Math.min(5, Number(form.difficulty) || 0.5));
      }
      setBusy(true);
      setErr("");
      props.api.call("tasks.update", patch).then(function (r) {
        setBusy(false);
        if (r && r.ok) props.onSaved();
        else setErr((r && r.error) || "update failed");
      }).catch(function (e) { setBusy(false); setErr(String((e && e.message) || e)); });
    }
    var st = statusInfo(task.status);
    return h("div", { className: "wbt-modal-mask", onMouseDown: function (e) { if (e.target === e.currentTarget) props.onClose(); } },
      h("div", { className: "wbt-modal" },
        h("div", { className: "wbt-modal-head" },
          h("h3", null, t.editTitle),
          h("span", { className: "wbt-badge " + st.cls }, props.lang === "en" ? st.en : st.zh),
          h("button", { className: "wbt-icon", onClick: props.onClose }, "×")
        ),
        h("div", { className: "wbt-mhint" }, done ? t.editHintDone : t.editHintOpen),
        h("label", { className: "wbt-field" },
          h("span", null, t.titleField + " *"),
          h("input", { className: "wbt-input", value: form.title, autoFocus: true, onChange: function (e) { set("title", e.target.value); } })
        ),
        h("label", { className: "wbt-field" },
          h("span", null, t.desc),
          h("textarea", { className: "wbt-textarea", rows: 4, value: form.description, onChange: function (e) { set("description", e.target.value); } })
        ),
        canPriority ? h("label", { className: "wbt-field" },
          h("span", null, t.targetDate),
          h("input", { className: "wbt-input", type: "date", value: form.targetDate, onChange: function (e) { set("targetDate", e.target.value); } })
        ) : null,
        canPriority ? h("label", { className: "wbt-field" },
          h("span", null, t.priority + "（1–10）"),
          h("input", { className: "wbt-input", type: "number", min: 1, max: 10, step: 1, value: form.priority, onChange: function (e) { set("priority", e.target.value); } })
        ) : h("label", { className: "wbt-field" },
          h("span", null, t.review + " · " + t.reviewHint),
          h("textarea", { className: "wbt-textarea", rows: 3, placeholder: t.reviewPlaceholder, value: form.review, onChange: function (e) { set("review", e.target.value); } })
        ),
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
          h("button", { className: "wbt-btn ghost", onClick: props.onClose }, t.cancel),
          h("button", { className: "wbt-btn primary", disabled: isBusy || !titleOk, onClick: submit }, isBusy ? "…" : t.save)
        )
      )
    );
  }

  function BatchModal(props) {
    var t = props.t;
    var items = props.items || [];
    var mode = props.mode;
    var nodes = props.nodes || [];
    var s = React.useState(mode === "timeline" ? (items[0] && items[0].id) || "" : (props.tables[0] && props.tables[0].id) || "");
    var value = s[0], setValue = s[1];
    var qs = React.useState("");
    var query = qs[0], setQuery = qs[1];
    var busy = React.useState(false);
    var isBusy = busy[0], setBusy = busy[1];
    var err = React.useState("");
    var error = err[0], setError = err[1];

    var kw = query.trim().toLowerCase();
    var picked = null;
    var rows = [];
    if (mode === "timeline") {
      items.forEach(function (x) {
        if (String(x.id) === String(value)) picked = x;
        rows.push(h("label", { key: x.id, className: cx("wbt-bpick wrap", String(value) === String(x.id) && "on") },
          h("input", { type: "radio", name: "wbt-base", checked: String(value) === String(x.id), onChange: function () { setValue(String(x.id)); } }),
          h("span", { className: "wbt-bpick-main" },
            h("span", { className: "wbt-bpick-name" }, x.title),
            h("span", { className: "wbt-bpick-meta" },
              h("code", { title: x.timelineKey || "" }, "timeline " + (x.timelineKey || "-")),
              x.priority !== undefined ? h("span", null, "P" + x.priority) : null
            )
          ),
          h("span", { className: "wbt-bpick-check" }, String(value) === String(x.id) ? h(Icon, { name: "check", size: 13 }) : null)
        ));
      });
    } else {
      var shown = nodes.filter(function (n) { return !kw || String(n.name).toLowerCase().indexOf(kw) >= 0; });
      shown.forEach(function (n) {
        var isTable = n.type === "1";
        if (isTable && String(n.id) === String(value)) picked = n;
        var pad = 2 + n.depth * 15;
        rows.push(h("button", {
          key: String(n.id), type: "button", title: n.name,
          className: cx("wbt-bpick", !isTable && "wbt-bgroup", isTable && String(value) === String(n.id) && "on"),
          style: { paddingLeft: pad + "px", cursor: isTable ? "pointer" : "default" }, disabled: !isTable,
          onClick: isTable ? function () { setValue(String(n.id)); } : null,
        },
          !isTable ? h(Icon, { name: "folder", size: 12 }) : null,
          h("span", { className: "wbt-bpick-main" }, h("span", { className: "wbt-bpick-name" }, n.name)),
          isTable ? h("span", { className: "wbt-bpick-check" }, String(value) === String(n.id) ? h(Icon, { name: "check", size: 13 }) : null) : null
        ));
      });
      if (!shown.length) rows.push(h("div", { key: "empty", className: "wbt-batch-empty" }, t.noTable));
    }

    return h("div", { className: "wbt-modal-mask", onMouseDown: function (e) { if (e.target === e.currentTarget) props.onClose(); } },
      h("div", { className: "wbt-modal batch" },
        h("div", { className: "wbt-modal-head" },
          h("h3", null, mode === "timeline" ? t.batchTimeline : t.batchMigrate),
          h("span", { className: "wbt-badge" }, t.batchCount + " " + items.length),
          h("button", { className: "wbt-icon", onClick: props.onClose }, "×")
        ),
        h("div", { className: "wbt-mhint" }, mode === "timeline" ? t.chooseBase : t.chooseTable),
        mode === "migrate"
          ? h("input", { className: "wbt-input wbt-bpick-name", placeholder: t.searchTable, value: query, onChange: function (e) { setQuery(e.target.value); }, style: { whiteSpace: "normal" } })
          : null,
        h("div", { className: "wbt-batch" }, h("div", { className: "wbt-batch-body" }, rows)),
        h("div", { className: "wbt-batch-sel" },
          mode === "timeline"
            ? h("span", null, t.baseLabel + "：", h("b", null, picked ? picked.title : "-"))
            : h("span", null, t.targetLabel + "：", h("b", null, picked ? picked.name : "-"))
        ),
        error ? h("div", { className: "wbt-err" }, error) : null,
        h("div", { className: "wbt-modal-foot" },
          h("button", { className: "wbt-btn ghost", onClick: props.onClose }, t.cancel),
          h("button", { className: "wbt-btn primary", disabled: isBusy, onClick: function () {
            if (!value) { setError(mode === "timeline" ? t.needBase : t.needTable); return; }
            setBusy(true);
            if (mode === "timeline") {
              var base = null;
              for (var i = 0; i < items.length; i++) if (String(items[i].id) === String(value)) base = items[i];
              if (!base || !base.timelineKey) { setError(t.needBase); setBusy(false); return; }
              props.api.call("tasks.timelineRefactor", { ids: items.map(function (x) { return x.id; }), timelineKey: base.timelineKey }).then(function (r) {
                setBusy(false);
                if (r && r.ok) props.onDone();
                else setError((r && r.error) || "failed");
              });
            } else {
              props.api.call("tasks.migrate", { ids: items.map(function (x) { return x.id; }), tableId: value }).then(function (r) {
                setBusy(false);
                if (r && r.ok) props.onDone();
                else setError((r && r.error) || "failed");
              });
            }
          } }, isBusy ? "…" : t.confirm)
        )
      )
    );
  }

  var CFG_FALLBACK = {
    "ui.defaultTab": 0, "ui.listView": "list", "ui.expandDepth": 2, "ui.confirmDelete": true,
    "list.pageSize": 12, "list.sort": "auto", "list.filterRestarted": true,
    "form.defaultPriority": 1, "form.defaultDifficulty": 1, "form.defaultTargetOffset": 0,
    "stats.range": "30d", "stats.top": 10, "stats.showKpi": true,
    "stats.recentDoneLimit": 10, "stats.recentShutdownLimit": 10,
    "stats.sections": ["trend", "status", "priority", "difficulty", "aging", "overdue", "tables", "groups", "recentDone", "recentShutdown"],
  };

  function TasksView(props) {
    var lang = props.lang === "en" ? "en" : "zh";
    var cfg = configView.useConfig(props.api, CFG_FALLBACK);
    if (!cfg.ready) {
      return h("div", { style: { padding: "48px", textAlign: "center", fontSize: "12.5px", opacity: .6 } }, lang === "en" ? "Loading…" : "载入中…");
    }
    return h(TasksViewBody, Object.assign({}, props, { cfg: cfg.values }));
  }

  function expandedByDepth(nodes, depth) {
    var out = new Set();
    (function walk(list, d) {
      (list || []).forEach(function (n) {
        if (d >= depth || !n.children || !n.children.length) return;
        out.add(String(n.id));
        walk(n.children, d + 1);
      });
    })(nodes, 0);
    return out;
  }

  function TasksViewBody(props) {
    var t = COPY[props.lang === "en" ? "en" : "zh"];
    var api = props.api;
    var cfg = props.cfg || {};
    var cfgTab = Number(cfg["ui.defaultTab"]);
    if ([0, 5, 6, 7, 8].indexOf(cfgTab) < 0) cfgTab = 0;
    var cfgSize = Math.floor(Number(cfg["list.pageSize"]));
    if (!(cfgSize > 0)) cfgSize = 12;
    var cfgDepth = Math.floor(Number(cfg["ui.expandDepth"]));
    if (!(cfgDepth >= 0)) cfgDepth = 2;
    var cfgSort = typeof cfg["list.sort"] === "string" ? cfg["list.sort"] : "auto";
    var cfgConfirm = cfg["ui.confirmDelete"] !== false;

    var treeS = React.useState([]);
    var tree = treeS[0], setTree = treeS[1];
    var expS = React.useState(new Set());
    var expanded = expS[0], setExpanded = expS[1];
    var expInitRef = React.useRef(false);
    var targetS = React.useState({ groupId: "1", tableId: null });
    var target = targetS[0], setTarget = targetS[1];
    var pathS = React.useState([]);
    var currentPath = pathS[0], setCurrentPath = pathS[1];
    var tabS = React.useState(cfgTab);
    var tab = tabS[0], setTab = tabS[1];
    var viewS = React.useState(cfg["ui.listView"] === "card" ? "card" : "list");
    var view = viewS[0], setView = viewS[1];
    var searchS = React.useState("");
    var searchDraft = searchS[0], setSearchDraft = searchS[1];
    var tqS = React.useState("");
    var treeQuery = tqS[0], setTreeQuery = tqS[1];
    var titleS = React.useState("");
    var titleKey = titleS[0], setTitleKey = titleS[1];
    var filterS = React.useState(cfg["list.filterRestarted"] !== false);
    var filterRestarted = filterS[0], setFilterRestarted = filterS[1];
    var tagReloadS = React.useState(0);
    var tagReload = tagReloadS[0], setTagReload = tagReloadS[1];
    var filterTagIdsS = React.useState([]);
    var filterTagIds = filterTagIdsS[0], setFilterTagIds = filterTagIdsS[1];
    var pageS = React.useState(1);
    var pageNumber = pageS[0], setPageNumber = pageS[1];
    var sizeS = React.useState(cfgSize);
    var pageSize = sizeS[0], setPageSize = sizeS[1];
    var dataS = React.useState({ records: [], total: 0, current: 1, size: 0, pageable: false });
    var data = dataS[0], setData = dataS[1];
    var loadingS = React.useState(true);
    var loading = loadingS[0], setLoading = loadingS[1];
    var errorS = React.useState("");
    var error = errorS[0], setError = errorS[1];
    var drawerS = React.useState(false);
    var drawer = drawerS[0], setDrawer = drawerS[1];
    var managerS = React.useState(false);
    var manager = managerS[0], setManager = managerS[1];
    var selModeS = React.useState(false);
    var selectionMode = selModeS[0], setSelectionMode = selModeS[1];
    var selS = React.useState(new Set());
    var selectedIds = selS[0], setSelectedIds = selS[1];
    var selItemsS = React.useState([]);
    var selectedItems = selItemsS[0], setSelectedItems = selItemsS[1];
    var selOpenS = React.useState(false);
    var selectedOpen = selOpenS[0], setSelectedOpen = selOpenS[1];
    var batchS = React.useState(null);
    var batchMode = batchS[0], setBatchMode = batchS[1];
    var createS = React.useState(null);
    var createState = createS[0], setCreateState = createS[1];
    var timelineS = React.useState(null);
    var timelineTask = timelineS[0], setTimelineTask = timelineS[1];
    var doneS = React.useState(null);
    var doneTask = doneS[0], setDoneTask = doneS[1];
    var editTaskS = React.useState(null);
    var editTask = editTaskS[0], setEditTask = editTaskS[1];
    var editS = React.useState(null);
    var edit = editS[0], setEdit = editS[1];
    var nodeModalS = React.useState(null);
    var nodeModal = nodeModalS[0], setNodeModal = nodeModalS[1];
    var editNameS = React.useState("");
    var editName = editNameS[0], setEditName = editNameS[1];
    var dragS = React.useState(null);
    var dragId = dragS[0], setDragId = dragS[1];
    var dropS = React.useState(null);
    var dropId = dropS[0], setDropId = dropS[1];
    var toastS = React.useState("");
    var toast = toastS[0], setToast = toastS[1];
    var refreshRef = React.useRef({});

    function say(msg) { setToast(String(msg || "")); }
    React.useEffect(function () {
      if (!toast) return;
      var id = setTimeout(function () { setToast(""); }, 3200);
      return function () { clearTimeout(id); };
    }, [toast]);

    var treeSearchRef = React.useRef(null);
    React.useEffect(function () {
      if (!drawer) return;
      var id = setTimeout(function () { if (treeSearchRef.current) treeSearchRef.current.focus(); }, 40);
      function onKey(e) { if (e.key === "Escape") setDrawer(false); }
      window.addEventListener("keydown", onKey);
      return function () { clearTimeout(id); window.removeEventListener("keydown", onKey); };
    }, [drawer]);

    var refreshTree = React.useCallback(function () {
      return api.call("taskNodes.tree").then(function (r) {
        if (r && r.ok) {
          var nodes = Array.isArray(r.result) ? r.result : [];
          setTree(nodes);
          if (!expInitRef.current) {
            expInitRef.current = true;
            setExpanded(expandedByDepth(nodes, cfgDepth));
          }
        } else setError((r && r.error) || "tree load failed");
      }).catch(function (e) { setError(String(e && e.message || e)); });
    }, [api]);

    var refreshTagNav = React.useCallback(function () { setTagReload(function (n) { return n + 1; }); }, []);
    var refreshPath = React.useCallback(function (id) {
      if (!id) { setCurrentPath([]); return Promise.resolve(); }
      return api.call("taskNodes.path", { id: id }).then(function (r) {
        if (r && r.ok) setCurrentPath(Array.isArray(r.result) ? r.result : []);
      }).catch(function () {});
    }, [api]);

    var refreshList = React.useCallback(function () {
      setLoading(true);
      return api.call("tasks.list", {
        tab: tab, titleKey: titleKey,
        tableId: target.tableId, groupId: target.tableId ? null : target.groupId,
        pageNumber: pageNumber, pageSize: pageSize,
        filterRestarted: filterRestarted, tagIds: filterTagIds,
        sort: cfgSort === "auto" ? undefined : cfgSort,
      }).then(function (r) {
        setLoading(false);
        if (r && r.ok) {
          setData(r.result || { records: [], total: 0, current: 1, size: 0, pageable: false });
          setError("");
        } else {
          setError((r && r.error) || "list load failed");
        }
      }).catch(function (e) { setLoading(false); setError(String(e && e.message || e)); });
    }, [api, tab, titleKey, target.tableId, target.groupId, pageNumber, pageSize, filterRestarted, filterTagIds, cfgSort]);

    refreshRef.current = { tree: refreshTree, list: refreshList, path: refreshPath, tags: refreshTagNav };

    React.useEffect(function () {
      injectCss();
      refreshTree();
      refreshTagNav();
      refreshPath("1");
    }, [refreshTree, refreshTagNav, refreshPath]);

    React.useEffect(function () {
      refreshList();
    }, [refreshList]);

    React.useEffect(function () {
      var off = api.subscribe(function (p) {
        if (!p) return;
        if (p.event === "tasks-changed") {
          refreshRef.current.list();
          refreshRef.current.tags();
        }
        if (p.event === "task-nodes-changed") {
          refreshRef.current.tree();
          refreshRef.current.path(target.tableId || target.groupId);
        }
      });
      return off;
    }, [api, target.tableId, target.groupId]);

    React.useEffect(function () {
      refreshPath(target.tableId || target.groupId);
    }, [target.tableId, target.groupId, refreshPath]);

    function update(task, patch) {
      var args = Object.assign({ id: task.id }, patch);
      api.call("tasks.update", args).then(function (r) {
        if (r && r.ok) refreshList();
        else say((r && r.error) || "update failed");
      });
    }

    function pickNode(node) {
      if (String(node.type) === "1") setTarget({ groupId: String(node.parent || node.parentId || ""), tableId: String(node.id) });
      else setTarget({ groupId: String(node.id), tableId: null });
      setPageNumber(1);
      setDrawer(false);
    }

    function pickPath(p, i, path) {
      if (String(p.type) === "1") {
        var parent = i > 0 ? path[i - 1] : null;
        setTarget({ groupId: parent ? String(parent.id) : "", tableId: String(p.id) });
      } else {
        setTarget({ groupId: String(p.id), tableId: null });
      }
      setPageNumber(1);
    }

    function toggleExpanded(id) {
      var next = new Set(expanded);
      if (next.has(String(id))) next.delete(String(id)); else next.add(String(id));
      setExpanded(next);
    }

    function addNode(parentId, type) {
      setNodeModal({ parentId: parentId, type: type, node: null });
    }

    function nodeSaved(op) {
      var cur = nodeModal;
      setNodeModal(null);
      if (cur && cur.parentId) {
        var next = new Set(expanded); next.add(String(cur.parentId)); setExpanded(next);
      }
      refreshTree();
      say(op === "create" ? t.created : t.saved);
    }

    function renameNode(id, name) {
      if (!edit || String(edit.id) !== String(id)) return;
      var v = String(name || "").trim();
      if (!v || v === String(edit.name || "")) { setEdit(null); return; }
      api.call("taskNodes.rename", { id: id, name: v }).then(function (r) {
        setEdit(null);
        if (r && r.ok) { refreshTree(); say(t.saved); }
        else say((r && r.error) || "rename failed");
      });
    }

    function deleteTask(task) {
      if (cfgConfirm && !window.confirm(t.deleteTaskConfirm)) return;
      api.call("tasks.delete", { id: task.id }).then(function (r) {
        if (r && r.ok) {
          refreshList();
          refreshTagNav();
          say(t.deleted);
        } else say((r && r.error) || "delete failed");
      });
    }

    function batchDelete() {
      var ids = Array.from(selectedIds);
      if (!ids.length) return;
      if (cfgConfirm && !window.confirm(t.batchDeleteConfirm.replace("{n}", String(ids.length)))) return;
      var ok = 0, fail = 0;
      Promise.all(ids.map(function (id) {
        return api.call("tasks.delete", { id: id }).then(function (r) {
          if (r && r.ok) ok++; else fail++;
          return r;
        }).catch(function () { fail++; return null; });
      })).then(function () {
        clearSelection();
        refreshList();
        refreshTagNav();
        say(fail ? (t.deleted + " " + ok + " · " + t.deletePartial + " " + fail) : (t.deleted + " " + ok));
      });
    }

    function deleteNode(node) {
      if (cfgConfirm && !window.confirm(t.deleteConfirm)) return;
      api.call("taskNodes.delete", { id: node.id }).then(function (r) {
        if (r && r.ok) {
          refreshTree();
          setTarget({ groupId: "1", tableId: null });
          setPageNumber(1);
          say(t.deleted);
        } else say((r && r.error) || "delete failed");
      });
    }

    function moveNode(sourceId, targetId, moveType) {
      setDropId(null); setDragId(null);
      api.call("taskNodes.move", { sourceId: sourceId, targetId: targetId, moveType: moveType }).then(function (r) {
        if (r && r.ok) {
          if (String(moveType) === "0") {
            var next = new Set(expanded); next.add(String(targetId)); setExpanded(next);
          }
          refreshTree(); say(t.updated);
        }
        else say((r && r.error) || "move failed");
      });
    }

    /** 标签筛选：与站点模块一致，按标签 id 多选，命中任一。 */
    function toggleTagId(id) {
      var next = filterTagIds.slice();
      var idx = next.indexOf(String(id));
      if (idx >= 0) next.splice(idx, 1); else next.push(String(id));
      setFilterTagIds(next);
      setPageNumber(1);
    }

    function toggleSelect(id) {
      var next = new Set(selectedIds);
      if (next.has(String(id))) next.delete(String(id)); else next.add(String(id));
      setSelectedIds(next);
    }

    function openSelected() {
      var ids = Array.from(selectedIds);
      if (!ids.length) { say("请先勾选任务"); return; }
      api.call("tasks.selected", { ids: ids }).then(function (r) {
        if (r && r.ok) { setSelectedItems(Array.isArray(r.result) ? r.result : []); setSelectedOpen(true); }
        else say((r && r.error) || "load failed");
      });
    }

    function clearSelection() {
      setSelectedIds(new Set()); setSelectedItems([]); setSelectedOpen(false); setBatchMode(null);
    }

    function batchDone() {
      setBatchMode(null); setSelectedOpen(false); clearSelection(); refreshList(); say(t.updated);
    }

    var tables = allTables(tree);
    var firstTable = findFirstTable(tree);
    var pageable = tab > 4 && tab < 9;
    var totalPages = pageable && data.total ? Math.ceil(data.total / pageSize) : 1;

    var treeProps = {
      t: t, expanded: expanded, selectedTable: target.tableId, selectedGroup: target.groupId,
      manager: manager, dragId: dragId, dropId: dropId, edit: edit, editName: editName,
      onToggle: toggleExpanded, onSelect: pickNode, onAdd: addNode,
      onEdit: function (node) { setNodeModal({ parentId: node.parent || node.parentId, type: node.type, node: node }); },
      onEditName: setEditName, onCancelEdit: function () { setEdit(null); },
      onRename: renameNode, onDelete: deleteNode,
      onDragStart: function (id) { setDragId(String(id)); },
      onDragOver: function (id) { setDropId(String(id)); },
      onMove: moveNode,
    };

    function flatTreeRow(item) {
      var node = item.node;
      var isTable = String(node.type) === "1";
      var selected = String(target.tableId || "") === String(node.id) || (!target.tableId && String(target.groupId || "") === String(node.id));
      return h("div", {
        key: node.id, className: cx("wbt-tree-row", selected && "sel"),
        style: { paddingLeft: (3 + item.depth * 15) + "px" },
      },
        h("span", { className: "wbt-tw void" }),
        h("span", { className: "wbt-ti" }, h(Icon, { name: isTable ? "table" : "folder", size: 13 })),
        h("div", { className: "wbt-tn", onClick: function () { pickNode(node); }, title: node.description ? node.name + "\n" + node.description : node.name },
          h("span", { className: "nm" }, node.name),
          node.description ? h("span", { className: "wbt-tdesc" }, String(node.description).replace(/\s+/g, " ")) : null,
          !isTable && node.children && node.children.length ? h("span", { className: "wbt-tcnt" }, node.children.length) : null
        )
      );
    }

    var flatNodes = treeWalk(tree);
    var rootId = tree.length ? String(tree[0].id) : "";
    var nodeById = {};
    flatNodes.forEach(function (x) { nodeById[String(x.node.id)] = x.node; });
    var curNode = nodeById[String(target.tableId || target.groupId || "")] || null;
    var footGroupId = curNode
      ? (String(curNode.type) === "1" ? String(curNode.parent || curNode.parentId || rootId) : String(curNode.id))
      : rootId;
    var groupCount = 0;
    var tableCount = 0;
    flatNodes.forEach(function (x) { if (String(x.node.type) === "1") tableCount++; else groupCount++; });
    var tq = treeQuery.trim().toLowerCase();
    var treeHits = tq ? flatNodes.filter(function (x) { return String(x.node.name || "").toLowerCase().indexOf(tq) >= 0; }) : [];
    var treeBody = !tree.length
      ? h("div", { className: "wbt-empty" }, t.emptyTree)
      : tq
        ? (treeHits.length ? treeHits.map(flatTreeRow) : h("div", { className: "wbt-empty" }, t.treeNoMatch))
        : tree.map(function (n) {
            return h(TreeNode, Object.assign({}, treeProps, { key: n.id, node: n, depth: 0 }));
          });

    var curDesc = curNode ? String(curNode.description || "") : "";
    var shownCount = data.returned === undefined ? (data.records || []).length : data.returned;
    var filterBar = h("div", { className: "wbt-filters" },
      pageable ? h("span", { className: "wbt-sum" }, t.total + " " + data.total + " " + t.items) : null,
      data.truncated ? h("span", { className: "wbt-hint" }, t.truncated + " " + shownCount + " / " + data.total) : null,
      (tab === 5 || tab === 8) ? h("label", { className: "wbt-check" },
        h("input", { type: "checkbox", checked: filterRestarted, onChange: function (e) { setFilterRestarted(e.target.checked); setPageNumber(1); } }),
        t.filterRestarted) : null
    );

    var listBody = loading
      ? h("div", { className: "wbt-empty" }, t.loading)
      : error
        ? h("div", { className: "wbt-err" }, t.error + error)
        : data.records.length === 0
          ? h("div", { className: "wbt-empty" }, t.empty)
          : h("div", { className: view === "card" ? "wbt-grid" : "wbt-list" }, data.records.map(function (task) {
              return h(TaskItem, {
                key: task.id, task: task, t: t, lang: props.lang, card: view === "card",
                selectionMode: selectionMode, checked: selectedIds.has(String(task.id)),
                onCheck: toggleSelect, update: update, toast: say,
                onEdit: function (x) { setEditTask(x); },
                onDone: function (x) { setDoneTask(x); },
                onRestart: function (x) { setCreateState({ source: "2", originTask: x }); },
                onTimeline: function (x) { setTimelineTask(x); },
                onDelete: deleteTask,
                onPathPick: pickPath,
                onTagPick: toggleTagId,
              });
            }));

    return h("div", { className: "wbt-root" },
      h("div", { className: "wbt-pathrow" },
        h("div", { className: "wbt-tree-slot" },
          h("button", { className: "wbt-btn", onClick: function () { setDrawer(true); refreshTree(); } }, h(Icon, { name: "tree", size: 13 }), t.tree)
        ),
        h(PathCrumbs, { path: currentPath, onPick: pickPath }),
        h("div", { className: "wbt-grow" }),
        h("input", {
          className: "wbt-input wbt-search", placeholder: t.search, value: searchDraft,
          onChange: function (e) { setSearchDraft(e.target.value); },
          onKeyDown: function (e) { if (e.key === "Enter") { setTitleKey(searchDraft); setPageNumber(1); } },
        }),
        h("button", { className: "wbt-btn ghost", title: t.search, "aria-label": t.search, onClick: function () { setTitleKey(searchDraft); setPageNumber(1); } }, h(Icon, { name: "search", size: 14 })),
        h("button", {
          className: "wbt-btn ghost", title: t.refresh, "aria-label": t.refresh, disabled: loading,
          onClick: function () { refreshList(); refreshTagNav(); },
        }, h(Icon, { name: "refresh", size: 13 }), t.refresh),
        h("button", { className: "wbt-btn " + (selectionMode ? "primary" : "ghost"), onClick: function () {
          if (selectionMode) { setSelectionMode(false); clearSelection(); }
          else setSelectionMode(true);
        } }, h(Icon, { name: "select", size: 13 }), selectionMode ? t.cancelSelect : t.select),
        h(TagFilter, { api: api, t: t, Icon: Icon, ids: filterTagIds, reloadKey: tagReload,
          onChange: function (next) { setFilterTagIds(next); setPageNumber(1); } }),
        h("button", { className: "wbt-btn primary", onClick: function () {
          setCreateState({ source: "0", originTask: null, defaultTableId: target.tableId || (firstTable && firstTable.id) });
        } }, h(Icon, { name: "plus", size: 14 }), t.newTask),
        h("button", { className: "wbt-btn ghost", onClick: function () { setView(view === "list" ? "card" : "list"); } }, h(Icon, { name: view === "list" ? "grid" : "list", size: 13 }), view === "list" ? t.card : t.list)
      ),
      curDesc ? h("div", { className: "wbt-tabledesc", title: curDesc }, curDesc.length > 220 ? curDesc.slice(0, 220) + "…" : curDesc) : null,
      h("div", { className: "wbt-body" },
        h("nav", { className: "wbt-nav" }, TABS.map(function (x) {
          var btn = h("button", {
            key: x.id, className: "wbt-tab" + (tab === x.id ? " on" : ""),
            onClick: function () { setTab(x.id); setPageNumber(1); },
          }, t === COPY.zh ? x.zh : x.en);
          if (x.id !== 5) return btn;
          return [h("div", { key: "nav-sep", className: "wbt-nav-sep" }), btn];
        })),
        h("div", { className: "wbt-content" },
          filterBar,
          listBody,
          pageable ? h("div", { className: "wbt-pager" },
            h("button", { className: "wbt-btn ghost", disabled: pageNumber <= 1, onClick: function () { setPageNumber(Math.max(1, pageNumber - 1)); } }, h(Icon, { name: "left", size: 14 })),
            h("span", null, t.page + " " + pageNumber + " / " + totalPages),
            h("select", { className: "wbt-select", value: pageSize, onChange: function (e) { setPageSize(Number(e.target.value)); setPageNumber(1); } },
              [6, 12, 24].map(function (n) { return h("option", { key: n, value: n }, n + " / " + t.page); })),
            h("button", { className: "wbt-btn ghost", disabled: pageNumber >= totalPages, onClick: function () { setPageNumber(Math.min(totalPages, pageNumber + 1)); } }, h(Icon, { name: "right", size: 14 }))
          ) : null
        )
      ),
      selectionMode && selectedIds.size ? h("div", { className: "wbt-selbar" },
        h("b", null, t.selected + " " + selectedIds.size),
        h("button", { className: "wbt-btn", onClick: openSelected }, t.selectedTasks),
        h("button", { className: "wbt-btn", onClick: function () { setBatchMode("timeline"); openSelected(); } }, t.batchTimeline),
        h("button", { className: "wbt-btn", onClick: function () { setBatchMode("migrate"); openSelected(); } }, t.batchMigrate),
        h("button", { className: "wbt-btn wbt-act-del", onClick: batchDelete }, h(Icon, { name: "trash", size: 13 }), t.batchDelete),
        h("button", { className: "wbt-btn ghost", onClick: clearSelection }, t.clear)
      ) : null,
      drawer ? h("div", { className: "wbt-drawer-mask", onMouseDown: function (e) { if (e.target === e.currentTarget) setDrawer(false); } },
        h("div", { className: "wbt-drawer", role: "dialog", "aria-label": t.tree },
          h("div", { className: "wbt-drawer-head" },
            h(Icon, { name: "tree", size: 15 }),
            h("div", { className: "wbt-drawer-title" },
              h("b", null, t.tree),
              h("span", { className: "wbt-drawer-meta" }, groupCount + " " + t.groups + " · " + tableCount + " " + t.tables)
            ),
            h("button", {
              className: "wbt-tool" + (manager ? " on" : ""),
              onClick: function () { setManager(!manager); },
            }, t.manager),
            h("button", { className: "wbt-icon", title: t.close, "aria-label": t.close, onClick: function () { setDrawer(false); } }, h(Icon, { name: "close", size: 15 }))
          ),
          h("div", { className: "wbt-drawer-search" },
            h("input", {
              className: "wbt-input", ref: treeSearchRef, placeholder: t.treeSearch, value: treeQuery,
              onChange: function (e) { setTreeQuery(e.target.value); },
              onKeyDown: function (e) { if (e.key === "Escape") { e.stopPropagation(); setTreeQuery(""); setDrawer(false); } },
            }),
            treeQuery ? h("button", {
              className: "wbt-search-clear", title: t.clear, "aria-label": t.clear,
              onClick: function () { setTreeQuery(""); if (treeSearchRef.current) treeSearchRef.current.focus(); },
            }, h(Icon, { name: "close", size: 13 })) : null
          ),
          h("div", { className: "wbt-drawer-body" }, treeBody),
          h("div", { className: "wbt-drawer-foot" },
            h("div", { className: "wbt-drawer-acts" },
              h("button", { className: "wbt-addbtn", title: t.addGroup, onClick: function () { if (footGroupId) addNode(footGroupId, "0"); } },
                h(Icon, { name: "folderPlus", size: 13 }), t.addGroup),
              h("button", { className: "wbt-addbtn", title: t.addTable, onClick: function () { if (footGroupId) addNode(footGroupId, "1"); } },
                h(Icon, { name: "filePlus", size: 13 }), t.addTable)
            ),
            h("div", { className: "wbt-drawer-hint" }, t.treeHint)
          )
        )
      ) : null,
      createState ? h(CreateModal, {
        key: (createState.source || "0") + "-" + (createState.originTask && createState.originTask.id || ""),
        t: t, api: api, tree: tree, source: createState.source,
        originTask: createState.originTask, defaultTableId: createState.defaultTableId,
        defaults: {
          priority: cfg["form.defaultPriority"], difficulty: cfg["form.defaultDifficulty"],
          targetOffset: cfg["form.defaultTargetOffset"],
        },
        onClose: function () { setCreateState(null); },
        onCreated: function () { setCreateState(null); refreshList(); refreshTree(); say(t.created); },
      }) : null,
      timelineTask ? h(TimelineModal, {
        key: timelineTask.id, t: t, api: api, task: timelineTask,
        onClose: function () { setTimelineTask(null); },
        onCreateTimeline: function (originTask) {
          setTimelineTask(null);
          setCreateState({ source: "1", originTask: originTask, defaultTableId: originTask.tableId });
        },
      }) : null,
      nodeModal ? h(NodeModal, {
        key: "node-" + (nodeModal.node ? nodeModal.node.id : "new"),
        t: t, api: api, node: nodeModal.node, parentId: nodeModal.parentId, type: nodeModal.type,
        onClose: function () { setNodeModal(null); },
        onSaved: nodeSaved,
      }) : null,
      editTask ? h(EditModal, {
        key: "edit-" + editTask.id, t: t, api: api, task: editTask, lang: props.lang,
        onClose: function () { setEditTask(null); },
        onSaved: function () { setEditTask(null); refreshList(); say(t.updated); },
      }) : null,
      doneTask ? h(DoneModal, {
        key: doneTask.id, t: t, api: api, task: doneTask,
        onClose: function () { setDoneTask(null); },
        onDone: function () { setDoneTask(null); refreshList(); say(t.doneSuccess); },
        onError: function (e) { setDoneTask(null); say(e); },
      }) : null,
      (selectedOpen && batchMode) ? h(BatchModal, {
        key: batchMode, t: t, api: api, mode: batchMode, items: selectedItems, tables: tables, nodes: treeFlat(tree),
        onClose: function () { setBatchMode(null); },
        onDone: batchDone,
      }) : null,
      toast ? h("div", { className: "wbt-toast" }, toast) : null
    );
  }

  host.registerAddon({
    id: "wb-addon-tasks",
    version: "2.10.10",
    views: [
      { id: "stats", title: { zh: "统计", en: "Stats" }, component: statsView.TasksStatsView },
      { id: "tasks", title: { zh: "记录", en: "Records" }, component: TasksView },
      { id: "config", title: { zh: "配置", en: "Config" }, component: configView.ConfigView },
      { id: "data", title: { zh: "数据", en: "Data" }, component: dataView.DataView },
    ],
  });

  module.exports = { name: "dsh-workbench-tasks", inject: [], apply: function () {} };
})();
