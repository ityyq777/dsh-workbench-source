// dsh-workbench-tasks 浏览器侧源码。构建：node scripts/build-addon-clients.mjs → lib/client.js
var React = require("react");
var h = React.createElement;

(function () {
  "use strict";

  var host = window.__WB_HOST__;
  if (!host) {
    console.error("[wb-addon-tasks] 宿主桥 window.__WB_HOST__ 不存在，视图未注册");
    return { name: "dsh-workbench-tasks", inject: [], apply: function () {} };
  }
  var React = require("react");
  var h = React.createElement;
  var statsView = require("./stats.cjs");

  var COPY = {
    zh: {
      title: "记录", search: "搜索任务标题", newTask: "新建任务", tree: "任务树",
      select: "筛选", cancelSelect: "退出筛选", list: "列表", card: "卡片",
      all: "全部", empty: "这个视图还没有任务", loading: "加载中…",
      error: "操作失败：", save: "保存", cancel: "取消", create: "创建", close: "关闭",
      addGroup: "新建组", addTable: "新建表", rename: "重命名", del: "删除",
      deleteConfirm: "确定删除这个节点及其子树？子树中的任务会被软删除。",
      root: "全部任务组", manager: "管理模式", filterRestarted: "过滤已重启",
      treeSearch: "搜索任务组 / 任务表", treeHint: "点任务表筛选任务；管理模式可拖拽排序、改名或删除",
      groups: "个任务组", tables: "张任务表", treeNoMatch: "没有匹配的节点",
      tags: "标签", tagsHint: "用标签归类（工作/生活/学习/开发 已是标签）", tagPlaceholder: "多个标签用逗号分隔，例如：工作, 开发",
      tagFilter: "标签筛选", allTags: "全部标签", noTags: "暂无标签",
      untagged: "未打标签", publish: "发布", target: "计划完成", done: "实际完成",
      shutdown: "关闭时间", priority: "优先级", difficulty: "难度", desc: "描述",
      review: "感受", reviewHint: "写下完成时的感受（可选）",
      reviewPlaceholder: "例如：思路很顺 / 卡在接口调试 / 比预想轻松", reviewAdd: "记录感受",
      status: "状态", publishDate: "发布日期", targetDate: "计划完成日期",
      doneDate: "完成日期", shutdownDate: "关闭日期", table: "任务表", titleField: "标题",
      timeline: "时间线", restart: "重启", complete: "完成", shutdownOp: "关闭",
      selected: "已选", selectedTasks: "选中任务", batchTimeline: "归并时间线",
      batchMigrate: "迁移任务表", refresh: "刷新", clear: "清空",
      chooseBase: "选择基准任务（使用它的时间线）", chooseTable: "选择目标任务表",
      timelineTitle: "任务时间线", newTimeline: "新建时间线任务",
      restartTitle: "重启任务", noTimeline: "这条任务还没有时间线",
      confirm: "确定", difficultyHint: "完成任务前请选择难度（0.5–5）",
      emptyTree: "任务树还没有数据", appear: "显示", hide: "隐藏",
      move: "移动到", source: "来源", page: "页", total: "共", items: "条",
      doneSuccess: "已完成", saved: "已保存", created: "已创建", updated: "已更新",
      deleted: "已删除", needTitle: "标题不能为空", needTable: "请选择任务表",
      needDate: "日期不能为空", needBase: "请选择基准任务", needDifficulty: "请选择难度",
    },
    en: {
      title: "Records", search: "Search title", newTask: "New task", tree: "Task tree",
      select: "Select", cancelSelect: "Exit select", list: "List", card: "Cards",
      all: "All", empty: "No tasks in this view", loading: "Loading…",
      error: "Failed: ", save: "Save", cancel: "Cancel", create: "Create", close: "Close",
      addGroup: "New group", addTable: "New table", rename: "Rename", del: "Delete",
      deleteConfirm: "Delete this node and its subtree? Tasks under it will be soft-deleted.",
      root: "All tasks", manager: "Manage", filterRestarted: "Hide restarted",
      treeSearch: "Search groups / tables", treeHint: "Pick a table to filter tasks; Manage mode allows drag, rename and delete",
      groups: "groups", tables: "tables", treeNoMatch: "No matching node",
      tags: "Tags", tagsHint: "Group tasks with tags (Work/Life/Study/Dev are tags now)", tagPlaceholder: "Comma separated, e.g. Work, Dev",
      tagFilter: "Filter by tag", allTags: "All tags", noTags: "No tags",
      untagged: "Untagged", publish: "Published", target: "Target", done: "Done",
      shutdown: "Closed", priority: "Priority", difficulty: "Difficulty", desc: "Description",
      review: "Feeling", reviewHint: "How did it feel to finish? (optional)",
      reviewPlaceholder: "e.g. smooth, stuck on the API, easier than expected", reviewAdd: "Add feeling",
      status: "Status", publishDate: "Publish date", targetDate: "Target date",
      doneDate: "Done date", shutdownDate: "Close date", table: "Task table", titleField: "Title",
      timeline: "Timeline", restart: "Restart", complete: "Complete", shutdownOp: "Close",
      selected: "Selected", selectedTasks: "Selected tasks", batchTimeline: "Merge timeline",
      batchMigrate: "Move table", refresh: "Refresh", clear: "Clear",
      chooseBase: "Choose a base task (it supplies the timeline)", chooseTable: "Choose target table",
      timelineTitle: "Task timeline", newTimeline: "New timeline task",
      restartTitle: "Restart task", noTimeline: "No timeline for this task",
      confirm: "OK", difficultyHint: "Pick a difficulty (0.5–5) before completing",
      emptyTree: "Task tree is empty", appear: "Show", hide: "Hide",
      move: "Move to", source: "Source", page: "Page", total: "Total", items: "items",
      doneSuccess: "Completed", saved: "Saved", created: "Created", updated: "Updated",
      deleted: "Deleted", needTitle: "Title is required", needTable: "Pick a task table",
      needDate: "Date is required", needBase: "Pick a base task", needDifficulty: "Pick a difficulty",
    },
  };

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
  };
  // 统一的小尺寸图标调用方式，保持各视图里的 Icon({ name, size }) 不变。
  function Icon(props) {
    var C = ICONS[props.name];
    if (!C) return null;
    return h(C, { size: props.size || 14, strokeWidth: 2, "aria-hidden": "true", className: "wbt-svg" });
  }

  var CSS = [
    ".wbt-root{--wbt-line:var(--dsw-alias-border-l2,color-mix(in oklab,currentColor 16%,transparent));--wbt-surface:var(--dsw-alias-bg-layer-1,color-mix(in oklab,currentColor 4%,transparent));--wbt-bg:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base,#fff));--wbt-accent:var(--dsw-alias-brand-primary,#11a89b);display:flex;flex-direction:column;gap:10px;min-height:0;color:inherit;font-size:13px}",
    ".wbt-pathrow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:0 0 2px}",
    ".wbt-tree-slot{flex:0 0 138px;width:138px;margin-right:6px;display:flex;align-items:center}",
    ".wbt-grow{flex:1;min-width:0}",
    ".wbt-btn{border:1px solid var(--wbt-line);background:var(--wbt-surface);color:inherit;border-radius:8px;padding:6px 11px;font-size:12.5px;cursor:pointer;white-space:nowrap;line-height:1.3;display:inline-flex;align-items:center;gap:5px}",
    ".wbt-svg{display:block;flex:none}",
    ".wbt-btn:hover{border-color:var(--wbt-accent)}",
    ".wbt-btn.primary{background:var(--wbt-accent);border-color:var(--wbt-accent);color:var(--dsw-alias-label-primary-inverted,#fff);font-weight:600}",
    ".wbt-btn.ghost{background:transparent}",
    ".wbt-btn.danger{color:var(--dsw-alias-state-error-primary,#e5484d);border-color:color-mix(in oklab,var(--dsw-alias-state-error-primary,#e5484d) 45%,transparent)}",
    ".wbt-btn:disabled{opacity:.5;cursor:not-allowed}",
    ".wbt-input,.wbt-select,.wbt-textarea{border:1px solid var(--wbt-line);background:transparent;color:inherit;border-radius:8px;padding:7px 10px;font-size:13px;outline:none;min-width:0}",
    ".wbt-input:focus,.wbt-select:focus,.wbt-textarea:focus{border-color:var(--wbt-accent)}",
    ".wbt-input:focus-visible,.wbt-select:focus-visible,.wbt-textarea:focus-visible{outline:none !important;border-color:var(--wbt-accent) !important;box-shadow:0 0 0 3px color-mix(in oklab,var(--wbt-accent) 18%,transparent) !important}",
    ".wbt-btn:focus-visible,.wbt-icon:focus-visible,.wbt-tw:focus-visible,.wbt-tool:focus-visible,.wbt-tab:focus-visible,.wbt-tacts button:focus-visible,.wbt-addbtn:focus-visible,.wbt-search-clear:focus-visible{outline:2px solid color-mix(in oklab,var(--wbt-accent) 55%,transparent);outline-offset:1px}",
    ".wbt-search{width:220px;max-width:46vw}",
    ".wbt-body{display:flex;gap:14px;align-items:flex-start;min-height:0;flex:1}",
    ".wbt-nav{display:flex;flex-direction:column;gap:2px;flex:0 0 138px;width:138px;padding:3px 0;border-right:1px solid var(--wbt-line)}",
    ".wbt-content{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px}",
    ".wbt-nav-sep{height:1px;background:var(--wbt-line);margin:5px 9px;opacity:.7}",
    ".wbt-tab{display:flex;align-items:center;text-align:left;width:100%;border:none;background:transparent;color:inherit;opacity:.62;border-radius:8px;padding:8px 10px;cursor:pointer;font-size:12.5px;line-height:1.35;transition:background .12s ease,color .12s ease,opacity .12s ease}",
    ".wbt-tab:hover{opacity:1;background:color-mix(in oklab,currentColor 7%,transparent)}",
    ".wbt-tab.on{opacity:1;font-weight:650;background:color-mix(in oklab,var(--wbt-accent) 15%,transparent);color:var(--wbt-accent);box-shadow:inset 2px 0 0 var(--wbt-accent)}",
    ".wbt-filters{display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:12px;opacity:.85}",
    ".wbt-check{display:inline-flex;align-items:center;gap:4px;cursor:pointer;white-space:nowrap}",
    ".wbt-check input{accent-color:var(--wbt-accent)}",
    ".wbt-crumb{display:flex;align-items:center;gap:3px;flex-wrap:wrap;font-size:12px;opacity:.8}",
    ".wbt-crumb button{border:none;background:none;color:inherit;cursor:pointer;padding:2px 4px;border-radius:5px;font-size:12px}",
    ".wbt-crumb button:hover{background:color-mix(in oklab,currentColor 9%,transparent)}",
    ".wbt-crumb .sep{opacity:.35}",
    ".wbt-list{display:flex;flex-direction:column;gap:7px;min-height:0}",
    ".wbt-item{display:flex;gap:12px;align-items:flex-start;border:1px solid var(--wbt-line);border-radius:12px;background:var(--wbt-surface);padding:11px 13px;min-height:0;transition:border-color .14s ease,box-shadow .14s ease}",
    ".wbt-item:hover{border-color:color-mix(in oklab,var(--wbt-accent) 30%,var(--wbt-line));box-shadow:0 2px 10px rgba(20,30,40,.05)}",
    ".wbt-item.closed{opacity:.62}",
    ".wbt-item.closed .wbt-title{text-decoration:line-through}",
    ".wbt-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}",
    ".wbt-line1{display:flex;align-items:center;gap:6px;min-width:0;flex-wrap:wrap}",
    ".wbt-title{font-weight:620;font-size:14px;line-height:1.38;letter-spacing:.1px;word-break:break-word}",
    ".wbt-desc{font-size:12.5px;opacity:.66;line-height:1.55;word-break:break-word;white-space:pre-wrap;max-width:80ch}",
    ".wbt-foot{display:flex;align-items:center;gap:6px 12px;flex-wrap:wrap;margin-top:1px}",
    ".wbt-meta{display:flex;gap:4px 12px;flex-wrap:wrap;font-size:11.5px;opacity:.64;font-variant-numeric:tabular-nums}",
    ".wbt-meta b{font-weight:560;opacity:.9;margin-right:1px}",
    ".wbt-add-desc{border:none;background:none;color:inherit;font:inherit;font-size:12px;line-height:1;opacity:.3;padding:2px 4px;border-radius:5px;cursor:pointer;flex:none}",
    ".wbt-add-desc:hover{opacity:.85;background:color-mix(in oklab,currentColor 7%,transparent)}",
    ".wbt-path{display:flex;gap:3px;flex-wrap:wrap;align-items:center;font-size:11.5px;opacity:.58}",
    ".wbt-taskpath{display:flex;align-items:center;gap:6px;margin-top:3px;min-width:0}",
    ".wbt-taskpath .wbt-path{flex:1 1 auto;flex-wrap:nowrap;overflow:hidden;min-width:0;gap:0;opacity:.52;-webkit-mask-image:linear-gradient(90deg,#000 91%,transparent);mask-image:linear-gradient(90deg,#000 91%,transparent)}",
    ".wbt-taskpath .wbt-path button{white-space:nowrap}",
    ".wbt-taskpath .wbt-path .sep{margin:0 1px;opacity:.4}",
    ".wbt-review{margin-top:5px;font-size:12.5px;line-height:1.6;white-space:pre-wrap;word-break:break-word;max-width:80ch;padding:6px 10px;border-radius:0 8px 8px 0;border-left:2px solid color-mix(in oklab,var(--wbt-accent) 42%,transparent);background:color-mix(in oklab,var(--wbt-accent) 6%,transparent)}",
    ".wbt-review-label{font-size:11px;letter-spacing:.04em;opacity:.72;margin-right:5px;font-weight:560}",
    ".wbt-review-add{margin-top:2px;align-self:flex-start;border:none;background:none;color:inherit;font:inherit;font-size:11.5px;padding:2px 3px;border-radius:5px;cursor:pointer;opacity:.42}",
    ".wbt-review-add:hover{opacity:.9;background:color-mix(in oklab,currentColor 7%,transparent)}",
    ".wbt-path button{border:none;background:none;color:inherit;padding:2px 3px;border-radius:5px;cursor:pointer;font-size:11.5px}",
    ".wbt-path button:hover{background:color-mix(in oklab,currentColor 8%,transparent);text-decoration:underline}",
    ".wbt-prio{font-size:10px;font-weight:650;padding:2px 6px;border-radius:999px;border:none;background:color-mix(in oklab,currentColor 12%,transparent);opacity:.92;flex:none;font-variant-numeric:tabular-nums}",
    ".wbt-prio.high{color:var(--dsw-alias-state-error-primary,#d93a40)}.wbt-prio.mid{color:var(--dsw-alias-state-warn-primary,#cf6512)}.wbt-prio.low{color:var(--dsw-alias-label-tertiary,#77839a)}",
    ".wbt-tag{font-size:11.5px;line-height:1.5;padding:0 6px;border-radius:999px;background:color-mix(in oklab,var(--wbt-accent) 12%,transparent);color:var(--wbt-accent);cursor:pointer;white-space:nowrap}",
    ".wbt-tag:hover{background:color-mix(in oklab,var(--wbt-accent) 22%,transparent)}",
    ".wbt-tags{display:flex;flex-wrap:wrap;align-items:center;gap:5px;margin-top:5px}",
    ".wbt-tagfilter{position:relative;display:flex;align-items:center;gap:5px;min-width:0}",
    ".wbt-tagfilter .wbt-btn.on{border-color:var(--wbt-accent);color:var(--wbt-accent);background:color-mix(in oklab,var(--wbt-accent) 12%,transparent)}",
    ".wbt-tagmenu{position:absolute;z-index:60;top:calc(100% + 6px);right:0;width:236px;max-height:320px;overflow:auto;padding:8px;border-radius:10px;border:1px solid var(--wbt-line);box-shadow:0 14px 34px rgba(26,20,12,.2);background-color:var(--wbt-bg);background-image:linear-gradient(var(--wbt-bg),var(--wbt-bg)),linear-gradient(var(--wbt-bg),var(--wbt-bg));-webkit-backdrop-filter:blur(24px) saturate(1.4);backdrop-filter:blur(24px) saturate(1.4)}",
    ".wbt-tagmenu-head{display:flex;align-items:center;gap:6px;font-size:11px;opacity:.6;padding:2px 4px 7px}",
    ".wbt-tagopt{display:flex;align-items:center;gap:7px;padding:6px;border-radius:6px;cursor:pointer;font-size:12.5px}",
    ".wbt-tagopt:hover{background:color-mix(in oklab,currentColor 7%,transparent)}",
    ".wbt-tagopt input{margin:0;accent-color:var(--wbt-accent)}",
    ".wbt-mini{appearance:none;border:0;background:transparent;color:inherit;border-radius:4px;cursor:pointer;font-size:11.5px;line-height:1;padding:3px 5px;font-family:inherit;opacity:.7}",
    ".wbt-mini:hover{background:color-mix(in oklab,currentColor 8%,transparent);opacity:1}",
    ".wbt-note{font-size:11.5px;opacity:.6;padding:6px}",
    ".wbt-tagcnt{font-size:10.5px;opacity:.55;font-variant-numeric:tabular-nums;margin-left:auto}",
    ".wbt-tagnm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".wbt-badge{font-size:10.5px;padding:1px 6px;border-radius:999px;border:none;background:color-mix(in oklab,currentColor 9%,transparent);opacity:.86;white-space:nowrap}",
    ".wbt-badge::before{content:\"\";display:inline-block;width:5px;height:5px;border-radius:50%;background:currentColor;margin-right:4px;vertical-align:1px;opacity:.8}",
    ".wbt-badge.active{color:var(--dsw-alias-brand-primary,#0b8a7f)}",
    ".wbt-badge.done{color:var(--dsw-alias-state-success-primary,#2f9e44)}",
    ".wbt-badge.shutdown{color:var(--dsw-alias-label-tertiary,#7d8698)}.wbt-badge.restarted{color:var(--dsw-alias-state-business-primary,#7048e8)}",
    ".wbt-ops{display:flex;gap:3px;align-items:center;flex-wrap:wrap;flex:none;padding-top:1px}",
    ".wbt-icon{border:none;background:color-mix(in oklab,currentColor 5%,transparent);color:inherit;width:24px;height:24px;border-radius:6px;cursor:pointer;font-size:12.5px;line-height:1;display:inline-flex;align-items:center;justify-content:center;flex:none;opacity:.7;padding:0}",
    ".wbt-icon:hover{opacity:1;background:color-mix(in oklab,var(--wbt-accent) 13%,transparent);color:var(--wbt-accent)}",
    ".wbt-icon.danger:hover{background:color-mix(in oklab,var(--dsw-alias-state-error-primary,#e5484d) 12%,transparent);color:var(--dsw-alias-state-error-primary,#e5484d)}",
    ".wbt-ops .wbt-btn{border-color:transparent;background:transparent;padding:5px 8px;font-size:12px;border-radius:7px;opacity:.72}",
    ".wbt-ops .wbt-btn:hover{opacity:1;background:color-mix(in oklab,currentColor 7%,transparent)}",
    ".wbt-ops .wbt-act-done{color:var(--dsw-alias-state-success-primary,#1f8a4c);background:color-mix(in oklab,var(--dsw-alias-state-success-primary,#2f9e44) 10%,transparent);opacity:.96}",
    ".wbt-ops .wbt-act-done:hover{background:color-mix(in oklab,var(--dsw-alias-state-success-primary,#2f9e44) 16%,transparent)}",
    ".wbt-ops .wbt-act-close{color:var(--dsw-alias-state-error-primary,#b4434a)}",
    ".wbt-ops .wbt-act-close:hover{background:color-mix(in oklab,var(--dsw-alias-state-error-primary,#e5484d) 10%,transparent)}",
    ".wbt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:9px}",
    ".wbt-card{display:flex;flex-direction:column;gap:6px;min-height:150px}",
    ".wbt-card .wbt-ops{margin-top:auto}",
    ".wbt-empty{border:1px dashed var(--wbt-line);border-radius:11px;padding:34px 12px;text-align:center;opacity:.5;font-size:12.5px}",
    ".wbt-err{font-size:12.5px;color:var(--dsw-alias-state-error-primary,#e5484d);line-height:1.5}",
    ".wbt-pager{display:flex;gap:8px;align-items:center;justify-content:flex-end;font-size:12px;opacity:.8;flex-wrap:wrap}",
    ".wbt-drawer-mask{position:fixed;inset:0;z-index:800;display:flex;background:rgba(26,20,12,.26);animation:wbt-fade .16s ease}",
    ".wbt-drawer{width:392px;max-width:94vw;height:100%;display:flex;flex-direction:column;background-color:var(--wbt-bg);background-image:linear-gradient(var(--wbt-bg),var(--wbt-bg)),linear-gradient(var(--wbt-bg),var(--wbt-bg)),linear-gradient(var(--wbt-bg),var(--wbt-bg));-webkit-backdrop-filter:blur(30px) saturate(1.4);backdrop-filter:blur(30px) saturate(1.4);border-right:1px solid var(--wbt-line);box-shadow:0 24px 70px rgba(26,20,12,.3);animation:wbt-slide .18s ease}",
    ".wbt-drawer-head{display:flex;align-items:center;gap:8px;padding:14px 16px 10px}",
    ".wbt-drawer-head>.wbt-svg{opacity:.7}",
    ".wbt-drawer-title{display:flex;align-items:baseline;gap:8px;flex:1;min-width:0}",
    ".wbt-drawer-title b{font-size:14px;font-weight:650;letter-spacing:.2px}",
    ".wbt-drawer-meta{font-size:11px;opacity:.5;white-space:nowrap;font-variant-numeric:tabular-nums}",
    ".wbt-tool{border:1px solid var(--wbt-line);background:color-mix(in oklab,currentColor 3%,transparent);color:inherit;font:inherit;font-size:11.5px;line-height:1;padding:5px 9px;border-radius:7px;cursor:pointer;opacity:.7;white-space:nowrap;flex:none}",
    ".wbt-tool:hover{opacity:.9;background:color-mix(in oklab,currentColor 7%,transparent)}",
    ".wbt-tool.on{opacity:1;border-color:color-mix(in oklab,var(--wbt-accent) 48%,transparent);background:color-mix(in oklab,var(--wbt-accent) 14%,transparent);color:var(--wbt-accent);font-weight:600}",
    ".wbt-drawer-search{padding:0 14px 8px;display:flex;align-items:center;gap:6px}",
    ".wbt-search-clear{flex:none;width:26px;height:26px;border:none;background:color-mix(in oklab,currentColor 6%,transparent);color:inherit;border-radius:7px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;opacity:.6;padding:0}",
    ".wbt-search-clear:hover{opacity:1;background:color-mix(in oklab,currentColor 11%,transparent)}",
    ".wbt-drawer-search .wbt-input{width:100%;box-sizing:border-box;padding:6px 9px;font-size:12.5px;border-radius:8px;background:color-mix(in oklab,currentColor 4%,transparent)}",
    ".wbt-drawer-body{flex:1;overflow:auto;padding:2px 8px 18px}",
    ".wbt-drawer-foot{display:flex;flex-direction:column;gap:7px;padding:10px 14px 12px;border-top:1px solid var(--wbt-line)}",
    ".wbt-drawer-acts{display:flex;gap:6px}",
    ".wbt-addbtn{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--wbt-line);background:color-mix(in oklab,currentColor 3%,transparent);color:inherit;font:inherit;font-size:11.5px;line-height:1;padding:7px 11px;border-radius:8px;cursor:pointer;opacity:.78;transition:opacity .12s ease,background .12s ease,border-color .12s ease,color .12s ease}",
    ".wbt-addbtn:hover{opacity:1;border-color:color-mix(in oklab,var(--wbt-accent) 42%,transparent);color:var(--wbt-accent);background:color-mix(in oklab,var(--wbt-accent) 10%,transparent)}",
    ".wbt-drawer-hint{font-size:10.5px;opacity:.45;line-height:1.55}",
    ".wbt-tree-row{display:flex;align-items:center;gap:1px;border-radius:8px;padding:0 4px 0 2px;height:30px;position:relative}",
    ".wbt-tree-row:hover{background:color-mix(in oklab,currentColor 6%,transparent)}",
    ".wbt-tree-row.sel{background:color-mix(in oklab,var(--wbt-accent) 13%,transparent)}",
    ".wbt-tree-row.sel::before{content:\"\";position:absolute;left:-4px;top:7px;bottom:7px;width:2.5px;border-radius:2px;background:var(--wbt-accent)}",
    ".wbt-tree-row.sel .nm{color:var(--wbt-accent);font-weight:620}",
    ".wbt-tree-row.drop{outline:1px dashed var(--wbt-accent);outline-offset:-1px}",
    ".wbt-tw{width:16px;height:30px;border:none;background:none;color:inherit;cursor:pointer;opacity:.45;flex:none;display:inline-flex;align-items:center;justify-content:center;padding:0}",
    ".wbt-tw:hover{opacity:.9}",
    ".wbt-tw.void{visibility:hidden;cursor:default}",
    ".wbt-ti{display:inline-flex;align-items:center;justify-content:center;width:16px;flex:none;opacity:.55}",
    ".wbt-tree-row.sel .wbt-ti{opacity:.95}",
    ".wbt-tn{flex:1;min-width:0;height:100%;display:flex;align-items:center;gap:5px;cursor:pointer;font-size:12.5px}",
    ".wbt-tn .nm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".wbt-tcnt{font-size:10px;opacity:.38;font-variant-numeric:tabular-nums;flex:none}",
    ".wbt-tacts{display:flex;gap:0;opacity:0;flex:none;transition:opacity .12s ease}",
    ".wbt-tree-row:hover .wbt-tacts{opacity:1}",
    ".wbt-tacts button{border:none;background:none;color:inherit;cursor:pointer;width:23px;height:23px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;opacity:.5;padding:0}",
    ".wbt-tacts button:hover{background:color-mix(in oklab,currentColor 11%,transparent);opacity:.95}",
    ".wbt-tacts button.wbt-danger:hover{color:var(--dsw-alias-state-error-primary,#e5484d);background:color-mix(in oklab,var(--dsw-alias-state-error-primary,#e5484d) 12%,transparent)}",
    "@keyframes wbt-fade{from{opacity:0}to{opacity:1}}",
    "@keyframes wbt-slide{from{transform:translateX(-14px);opacity:.5}to{transform:none;opacity:1}}",
    ".wbt-modal-mask{position:fixed;inset:0;background:rgba(0,0,0,.28);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px}",
    ".wbt-modal{width:560px;max-width:96vw;max-height:90vh;overflow:auto;background-color:var(--wbt-bg);background-image:linear-gradient(var(--wbt-bg),var(--wbt-bg)),linear-gradient(var(--wbt-bg),var(--wbt-bg)),linear-gradient(var(--wbt-bg),var(--wbt-bg));-webkit-backdrop-filter:blur(30px) saturate(1.4);backdrop-filter:blur(30px) saturate(1.4);border:1px solid var(--wbt-line);border-radius:14px;box-shadow:0 20px 60px rgba(26,20,12,.3);padding:15px 17px;display:flex;flex-direction:column;gap:11px}",
    ".wbt-modal.wide{width:820px}",
    ".wbt-modal-head{display:flex;align-items:center;gap:8px}",
    ".wbt-modal-head h3{margin:0;font-size:14.5px;font-weight:650;flex:1}",
    ".wbt-form{display:grid;grid-template-columns:1fr 1fr;gap:9px}",
    ".wbt-field{display:flex;flex-direction:column;gap:4px;font-size:12px;min-width:0}",
    ".wbt-field.full{grid-column:1 / -1}",
    ".wbt-field>span{opacity:.62;font-size:11.5px}",
    ".wbt-modal-foot{display:flex;gap:8px;justify-content:flex-end;align-items:center;margin-top:2px}",
    ".wbt-timeline{display:flex;flex-direction:column;gap:0;margin:2px 0}",
    ".wbt-tl-item{display:flex;gap:9px;min-height:40px}",
    ".wbt-tl-rail{width:12px;display:flex;flex-direction:column;align-items:center;flex:none}",
    ".wbt-tl-dot{width:8px;height:8px;border-radius:50%;background:var(--wbt-accent);margin-top:5px}",
    ".wbt-tl-line{width:1px;flex:1;background:var(--wbt-line)}",
    ".wbt-tl-body{padding:0 0 10px;min-width:0;flex:1}",
    ".wbt-tl-title{font-weight:600;font-size:12.5px}",
    ".wbt-tl-meta{font-size:11px;opacity:.58;display:flex;gap:7px;flex-wrap:wrap;margin-top:2px}",
    ".wbt-selbar{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:900;display:flex;gap:8px;align-items:center;background-color:var(--wbt-bg);background-image:linear-gradient(var(--wbt-bg),var(--wbt-bg)),linear-gradient(var(--wbt-bg),var(--wbt-bg)),linear-gradient(var(--wbt-bg),var(--wbt-bg));-webkit-backdrop-filter:blur(30px) saturate(1.4);backdrop-filter:blur(30px) saturate(1.4);border:1px solid var(--wbt-line);box-shadow:0 10px 34px rgba(26,20,12,.24);border-radius:12px;padding:8px 11px;max-width:94vw;flex-wrap:wrap}",
    ".wbt-toast{position:fixed;left:50%;bottom:70px;transform:translateX(-50%);z-index:1100;background:var(--dsw-alias-toast-bg,#1f2328);color:var(--dsw-alias-toast-label,#fff);border-radius:9px;padding:8px 14px;font-size:12.5px;box-shadow:0 8px 24px rgba(0,0,0,.25);max-width:90vw;text-align:center}",
    ".wbt-stars{color:var(--dsw-alias-state-warn-primary,#f59f00);font-size:11px;letter-spacing:.5px;white-space:nowrap}",
    ".wbt-sum{display:flex;gap:5px;flex-wrap:wrap;font-size:11px;opacity:.55}",
    ".wbt-nowrap{white-space:nowrap}",
    ".wbt-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}",
    ".wbt-split{display:flex;gap:12px;align-items:flex-start}",
    ".wbt-col{flex:1;min-width:0}",
    ".wbt-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px}",
    ".wbt-pill{font-size:11px;padding:2px 7px;border-radius:999px;background:color-mix(in oklab,var(--wbt-accent) 12%,transparent);color:var(--wbt-accent)}",
    ".wbt-hint{font-size:11.5px;opacity:.55;line-height:1.5}",
    ".wbt-danger{color:var(--dsw-alias-state-error-primary,#e5484d)}",
    "@media (max-width:760px){.wbt-body{flex-direction:column;gap:8px}.wbt-nav{flex-direction:row;width:100%;flex:0 0 auto;overflow-x:auto;border-right:none;border-bottom:1px solid var(--wbt-line);padding:0 0 6px}.wbt-tab{width:auto;white-space:nowrap;padding:6px 9px}.wbt-tab.on{box-shadow:inset 0 -2px 0 var(--wbt-accent)}.wbt-nav-sep{width:1px;height:18px;flex:none;margin:auto 4px}.wbt-tree-slot{flex:0 0 auto;width:auto;margin-right:0}.wbt-pathrow .wbt-search{flex:1 1 160px;max-width:none}}",
    "@media (max-width:640px){.wbt-form{grid-template-columns:1fr}.wbt-drawer{width:94vw}.wbt-search{width:100%}.wbt-item{padding:9px}.wbt-ops{width:100%;justify-content:flex-end}}",
  ].join("\n");

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

  function PathCrumbs(props) {
    var path = props.path || [];
    if (!path.length) return null;
    return h("div", { className: "wbt-path" }, path.map(function (p, i) {
      return h(React.Fragment, { key: p.id + "-" + i },
        i > 0 ? h("span", { className: "sep", children: "›" }) : null,
        h("button", {
          type: "button",
          onClick: function (e) {
            e.stopPropagation();
            if (props.onPick) props.onPick(p, i, path);
          },
        }, p.name || p.id)
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
      if (!isActive) return;
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
        countdown !== null ? h("span", { className: countdown <= 1 ? "wbt-danger" : "", children: "（" + (countdown < 0 ? "已逾期" : "剩 " + countdown + " 天") + "）" }) : null));
    } else if (String(task.status) === "2") {
      if (task.targetDate) meta.push(h("span", { key: "g" }, h("b", null, t.target), " ", task.targetDate));
      if (task.doneDate) meta.push(h("span", { key: "d" }, h("b", null, t.done), " ", task.doneDate));
      meta.push(h("span", { key: "s", className: "wbt-stars", children: stars(task.difficulty) + " " + Number(task.difficulty || 0).toFixed(1) }));
    } else {
      if (task.targetDate) meta.push(h("span", { key: "g" }, h("b", null, t.target), " ", task.targetDate));
      if (task.shutdownDate) meta.push(h("span", { key: "s" }, h("b", null, t.shutdown), " ", task.shutdownDate));
    }

    var ops = [];
    if (isActive) {
      ops.push(h("button", { key: "p+", className: "wbt-icon", title: t.priority + " +1", onClick: function () { if (task.priority < 10) props.update(task, { type: "PRIORITY", priority: Number(task.priority) + 1 }); } }, h(Icon, { name: "plus", size: 14 })));
      ops.push(h("button", { key: "p-", className: "wbt-icon", title: t.priority + " -1", onClick: function () { if (task.priority > 0) props.update(task, { type: "PRIORITY", priority: Number(task.priority) - 1 }); } }, h(Icon, { name: "minus", size: 14 })));
      ops.push(h("button", { key: "done", className: "wbt-btn wbt-act-done", onClick: function () { props.onDone(task); } }, h(Icon, { name: "check", size: 14 }), t.complete));
      ops.push(h("button", { key: "shut", className: "wbt-btn wbt-act-close", onClick: function () { props.update(task, { type: "STATUS", status: "1", date: today() }); } }, h(Icon, { name: "stop", size: 14 }), t.shutdownOp));
    }
    ops.push(h("button", { key: "restart", className: "wbt-btn ghost", onClick: function () { props.onRestart(task); } }, h(Icon, { name: "restart", size: 14 }), t.restart));
    ops.push(h("button", { key: "timeline", className: "wbt-btn ghost", onClick: function () { props.onTimeline(task); } }, h(Icon, { name: "timeline", size: 14 }), t.timeline));

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
      : h("div", { className: "wbt-title", onDoubleClick: beginTitle, title: isActive ? "双击编辑标题" : "" }, task.title);

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

    var addDesc = !task.description && isActive && editingDesc === null
      ? h("button", { key: "add-desc", className: "wbt-add-desc", title: t.desc, onClick: beginDesc }, "＋")
      : null;

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

    var addReview = isDone && !task.review && editingReview === null
      ? h("button", { key: "add-review", className: "wbt-review-add", onClick: beginReview }, "＋ " + t.reviewAdd)
      : null;

    return h("div", { className: cx("wbt-item", props.card && "wbt-card", String(task.status) === "1" && "closed") },
      props.selectionMode ? h("input", { type: "checkbox", className: "wbt-check", checked: !!props.checked, onChange: function () { props.onCheck(task.id); } }) : null,
      h("div", { className: "wbt-main" },
        h("div", { className: "wbt-line1" },
          h("span", { className: "wbt-prio " + pClass(task.priority), children: "P" + task.priority }),
          h("span", { className: "wbt-badge " + st.cls, children: stName }),
          titleNode,
          addDesc
        ),
        descNode,
        reviewNode,
        addReview,
        tagNodes.length ? h("div", { className: "wbt-tags", key: "tags" }, tagNodes) : null,
        h("div", { className: "wbt-foot" }, meta.length ? h("div", { className: "wbt-meta", key: "meta" }, meta) : null),
        task.path && task.path.length ? h("div", { className: "wbt-taskpath" }, h(PathCrumbs, { key: "path", path: task.path, t: t, onPick: props.onPathPick })) : null
      ),
      h("div", { className: "wbt-ops" }, ops)
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
      var asChild = !isTable && isExpanded;
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
        h("div", { className: "wbt-tn", onClick: select, title: node.name },
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

  function CreateModal(props) {
    var t = props.t;
    var source = props.source || "0";
    var origin = props.originTask || null;
    var tables = allTables(props.tree);
    var first = props.defaultTableId || (origin && origin.tableId) || (tables[0] && tables[0].id) || "";
    var initTags = origin ? tagNames(origin).join(", ") : "";
    var initTable = origin ? String(origin.tableId || first) : String(first);
    var f = React.useState({
      title: "", description: "",
      tags: initTags, status: "0", priority: 1, difficulty: 1,
      publishDate: today(), targetDate: today(), doneDate: today(), shutdownDate: today(),
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
        source !== "0" && origin ? h("div", { className: "wbt-hint" }, "来源：" + (origin.title || origin.id) + (source === "2" ? " · 重启链 " + (origin.restartKey || origin.id) : " · 时间线 " + (origin.timelineKey || origin.id))) : null,
        h("div", { className: "wbt-form" },
          h("label", { className: "wbt-field full" }, h("span", null, t.titleField + " *"), h("input", { className: "wbt-input", value: form.title, onChange: function (e) { set("title", e.target.value); }, autoFocus: true })),
          h("label", { className: "wbt-field full" }, h("span", null, t.desc), h("textarea", { className: "wbt-textarea", rows: 2, value: form.description, onChange: function (e) { set("description", e.target.value); } })),
          h("label", { className: "wbt-field full" }, h("span", null, t.tags), h("input", { className: "wbt-input", value: form.tags, placeholder: t.tagPlaceholder, onChange: function (e) { set("tags", e.target.value); } })),
          h("label", { className: "wbt-field" }, h("span", null, t.status), h("select", { className: "wbt-select", value: source === "2" ? "0" : form.status, disabled: source === "2", onChange: function (e) { set("status", e.target.value); } },
            h("option", { value: "0" }, "已开启"), h("option", { value: "2" }, "已完成"), h("option", { value: "1" }, "已关闭"))),
          h("label", { className: "wbt-field" }, h("span", null, t.priority + "（0–10）"), h("input", { className: "wbt-input", type: "number", min: 0, max: 10, value: form.priority, onChange: function (e) { set("priority", e.target.value); } })),
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
        state.loading ? h("div", { className: "wbt-hint" }, t.loading) : state.error ? h("div", { className: "wbt-err" }, t.error + state.error) : (items.length === 0 ? h("div", { className: "wbt-empty" }, t.noTimeline) : h("div", { className: "wbt-timeline" }, items.map(function (x, i) {
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
        h("div", { className: "wbt-hint" }, t.difficultyHint),
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

  function BatchModal(props) {
    var t = props.t;
    var items = props.items || [];
    var mode = props.mode;
    var s = React.useState(mode === "timeline" ? (items[0] && items[0].id) || "" : (props.tables[0] && props.tables[0].id) || "");
    var value = s[0], setValue = s[1];
    var busy = React.useState(false);
    var isBusy = busy[0], setBusy = busy[1];
    var err = React.useState("");
    var error = err[0], setError = err[1];
    return h("div", { className: "wbt-modal-mask", onMouseDown: function (e) { if (e.target === e.currentTarget) props.onClose(); } },
      h("div", { className: "wbt-modal" },
        h("div", { className: "wbt-modal-head" }, h("h3", null, mode === "timeline" ? t.batchTimeline : t.batchMigrate), h("button", { className: "wbt-icon", onClick: props.onClose }, "×")),
        h("div", { className: "wbt-hint" }, mode === "timeline" ? t.chooseBase : t.chooseTable),
        mode === "timeline"
          ? h("div", { className: "wbt-list" }, items.map(function (x) {
              return h("label", { key: x.id, className: "wbt-check", style: { padding: "6px 2px" } },
                h("input", { type: "radio", name: "base", checked: String(value) === String(x.id), onChange: function () { setValue(String(x.id)); } }),
                h("span", null, x.title + "（timeline " + (x.timelineKey || "-") + "）")
              );
            }))
          : h("select", { className: "wbt-select", value: value, onChange: function (e) { setValue(e.target.value); } }, props.tables.map(function (x) {
              return h("option", { key: x.id, value: x.id }, "　".repeat(x.depth) + x.name);
            })),
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

  function TasksView(props) {
    var t = COPY[props.lang === "en" ? "en" : "zh"];
    var api = props.api;

    var treeS = React.useState([]);
    var tree = treeS[0], setTree = treeS[1];
    var expS = React.useState(new Set(["1", "2"]));
    var expanded = expS[0], setExpanded = expS[1];
    var targetS = React.useState({ groupId: "1", tableId: null });
    var target = targetS[0], setTarget = targetS[1];
    var pathS = React.useState([]);
    var currentPath = pathS[0], setCurrentPath = pathS[1];
    var tabS = React.useState(0);
    var tab = tabS[0], setTab = tabS[1];
    var viewS = React.useState("list");
    var view = viewS[0], setView = viewS[1];
    var searchS = React.useState("");
    var searchDraft = searchS[0], setSearchDraft = searchS[1];
    var tqS = React.useState("");
    var treeQuery = tqS[0], setTreeQuery = tqS[1];
    var titleS = React.useState("");
    var titleKey = titleS[0], setTitleKey = titleS[1];
    var filterS = React.useState(true);
    var filterRestarted = filterS[0], setFilterRestarted = filterS[1];
    var tagNavS = React.useState({ available: false, tags: [], untagged: { total: 0 } });
    var tagNav = tagNavS[0], setTagNav = tagNavS[1];
    var filterTagIdsS = React.useState([]);
    var filterTagIds = filterTagIdsS[0], setFilterTagIds = filterTagIdsS[1];
    var tagMenuS = React.useState(false);
    var tagMenu = tagMenuS[0], setTagMenu = tagMenuS[1];
    var pageS = React.useState(1);
    var pageNumber = pageS[0], setPageNumber = pageS[1];
    var sizeS = React.useState(12);
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
    var editS = React.useState(null);
    var edit = editS[0], setEdit = editS[1];
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
        if (r && r.ok) setTree(Array.isArray(r.result) ? r.result : []);
        else setError((r && r.error) || "tree load failed");
      }).catch(function (e) { setError(String(e && e.message || e)); });
    }, [api]);

    var refreshTagNav = React.useCallback(function () {
      return api.call("tasks.tags").then(function (r) {
        if (r && r.ok) setTagNav(r.result || { available: false, tags: [], untagged: { total: 0 } });
      }).catch(function () {});
    }, [api]);

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
      }).then(function (r) {
        setLoading(false);
        if (r && r.ok) {
          setData(r.result || { records: [], total: 0, current: 1, size: 0, pageable: false });
          setError("");
        } else {
          setError((r && r.error) || "list load failed");
        }
      }).catch(function (e) { setLoading(false); setError(String(e && e.message || e)); });
    }, [api, tab, titleKey, target.tableId, target.groupId, pageNumber, pageSize, filterRestarted, filterTagIds]);

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
      api.call("taskNodes.create", { parentId: parentId, type: type }).then(function (r) {
        if (r && r.ok) {
          var next = new Set(expanded); next.add(String(parentId)); setExpanded(next);
          refreshTree();
          say(t.created);
        } else say((r && r.error) || "create failed");
      });
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

    function deleteNode(node) {
      if (!window.confirm(t.deleteConfirm)) return;
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
        if (r && r.ok) { refreshTree(); say(t.updated); }
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
      onEdit: function (node) { setEdit({ id: node.id, name: node.name }); setEditName(node.name); },
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
        h("div", { className: "wbt-tn", onClick: function () { pickNode(node); }, title: node.name },
          h("span", { className: "nm" }, node.name),
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

    var filterBar = h("div", { className: "wbt-filters" },
      pageable ? h("span", { className: "wbt-sum" }, t.total + " " + data.total + " " + t.items) : null,
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
                onDone: function (x) { setDoneTask(x); },
                onRestart: function (x) { setCreateState({ source: "2", originTask: x }); },
                onTimeline: function (x) { setTimelineTask(x); },
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
        h("button", { className: "wbt-btn " + (selectionMode ? "primary" : "ghost"), onClick: function () {
          if (selectionMode) { setSelectionMode(false); clearSelection(); }
          else setSelectionMode(true);
        } }, h(Icon, { name: "select", size: 13 }), selectionMode ? t.cancelSelect : t.select),
        tagNav.available && tagNav.tags.length ? h("div", { className: "wbt-tagfilter" },
          h("button", {
            className: "wbt-btn ghost" + (filterTagIds.length ? " on" : ""),
            "aria-expanded": tagMenu ? "true" : "false",
            onClick: function () { setTagMenu(!tagMenu); },
          }, h(Icon, { name: "tag", size: 13 }), t.tagFilter + (filterTagIds.length ? " · " + filterTagIds.length : ""), h(Icon, { name: "down", size: 12 })),
          tagMenu ? h("div", { className: "wbt-tagmenu", role: "menu" },
            h("div", { className: "wbt-tagmenu-head" },
              h("span", null, t.allTags),
              h("span", { className: "wbt-grow" }),
              h("button", { className: "wbt-mini", onClick: function () { setFilterTagIds([]); setPageNumber(1); } }, t.clear)
            ),
            tagNav.tags.length ? tagNav.tags.map(function (x) {
              var on = filterTagIds.indexOf(String(x.id)) >= 0;
              return h("label", { key: x.id, className: "wbt-tagopt" },
                h("input", { type: "checkbox", checked: on, onChange: function () { toggleTagId(String(x.id)); } }),
                h("span", { className: "wbt-tagnm" }, x.name),
                h("span", { className: "wbt-tagcnt" }, x.total)
              );
            }) : h("div", { className: "wbt-note" }, t.noTags)
          ) : null
        ) : null,
        h("button", { className: "wbt-btn primary", onClick: function () {
          setCreateState({ source: "0", originTask: null, defaultTableId: target.tableId || (firstTable && firstTable.id) });
        } }, h(Icon, { name: "plus", size: 14 }), t.newTask),
        h("button", { className: "wbt-btn ghost", onClick: function () { setView(view === "list" ? "card" : "list"); } }, h(Icon, { name: view === "list" ? "grid" : "list", size: 13 }), view === "list" ? t.card : t.list)
      ),
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
      doneTask ? h(DoneModal, {
        key: doneTask.id, t: t, api: api, task: doneTask,
        onClose: function () { setDoneTask(null); },
        onDone: function () { setDoneTask(null); refreshList(); say(t.doneSuccess); },
        onError: function (e) { setDoneTask(null); say(e); },
      }) : null,
      (selectedOpen && batchMode) ? h(BatchModal, {
        key: batchMode, t: t, api: api, mode: batchMode, items: selectedItems, tables: tables,
        onClose: function () { setBatchMode(null); },
        onDone: batchDone,
      }) : null,
      toast ? h("div", { className: "wbt-toast" }, toast) : null
    );
  }

  host.registerAddon({
    id: "wb-addon-tasks",
    version: "2.6.0",
    views: [
      { id: "stats", title: { zh: "统计", en: "Stats" }, component: statsView.TasksStatsView },
      { id: "tasks", title: { zh: "记录", en: "Records" }, component: TasksView },
    ],
  });

  module.exports = { name: "dsh-workbench-tasks", inject: [], apply: function () {} };
})();
