"use strict";
/** 分组与关联：vault 持有引用，业务模块用自身标识注册；这里只做管理与查看。 */
var C = require("../ui/common.cjs");

module.exports = function GroupsView(props) {
  var h = props.h;
  var api = props.api;
  var lang = props.lang || "zh";
  var React = props.React;

  var listS = React.useState({ loading: true, rows: [], error: "" });
  var msgS = React.useState("");
  var busyS = React.useState(false);
  var formS = React.useState({ name: "", description: "" });
  var openS = React.useState(null); // { group, items, loading, error }
  var setsS = React.useState([]);
  var delS = React.useState(null); // { row, moveTo }

  function load() {
    listS[1](function (old) { return Object.assign({}, old, { loading: true }); });
    Promise.all([
      C.call(api, "vault.groupList"),
      C.call(api, "vault.setList", {}).catch(function () { return { items: [] }; }),
    ]).then(function (r) {
      listS[1]({ loading: false, rows: (r[0] && r[0].items) || [], error: "" });
      setsS[1]((r[1] && r[1].items) || []);
    }).catch(function (e) {
      listS[1]({ loading: false, rows: [], error: C.errText(e) });
    });
  }

  React.useEffect(function () { load(); }, []);

  function create() {
    var f = formS[0];
    if (!f.name.trim()) return msgS[1]("组名不能为空");
    busyS[1](true); msgS[1]("");
    C.call(api, "vault.groupCreate", { name: f.name.trim(), description: f.description.trim() }).then(function () {
      busyS[1](false); formS[1]({ name: "", description: "" }); load();
    }).catch(function (e) { busyS[1](false); msgS[1](C.errText(e)); });
  }

  // 桌面端 webview 不支持 window.prompt，删除分组用应用内确认弹层（可选接收分组）。
  function remove(row) { delS[1]({ row: row, moveTo: "" }); }
  function confirmRemove() {
    var d = delS[0];
    if (!d) return;
    busyS[1](true); msgS[1]("");
    C.call(api, "vault.groupDelete", { id: d.row.id, moveTo: d.moveTo || undefined }).then(function () {
      busyS[1](false); delS[1](null);
      if (openS[0] && openS[0].group.id === d.row.id) openS[1](null);
      load();
    }).catch(function (e) { busyS[1](false); msgS[1](C.errText(e)); });
  }

  function open(row) {
    openS[1]({ group: row, items: [], loading: true, error: "" });
    C.call(api, "vault.subjectsOf", { groupId: row.id }).then(function (r) {
      openS[1]({ group: row, items: (r && r.items) || [], loading: false, error: "" });
    }).catch(function (e) {
      openS[1]({ group: row, items: [], loading: false, error: C.errText(e) });
    });
  }

  function setsOfGroup(row) {
    return setsS[0].filter(function (set) { return (set.groupIds || []).indexOf(row.id) >= 0; });
  }

  function toggleSet(row, set) {
    var linked = (set.groupIds || []).indexOf(row.id) >= 0;
    busyS[1](true); msgS[1]("");
    var call = linked
      ? C.call(api, "vault.groupDetachSet", { groupId: row.id, setId: set.id })
      : C.call(api, "vault.groupAttachSet", { groupId: row.id, setId: set.id });
    call.then(function () {
      busyS[1](false);
      setsS[1](function (old) {
        return old.map(function (item) {
          if (item.id !== set.id) return item;
          var ids = (item.groupIds || []).slice();
          var i = ids.indexOf(row.id);
          if (linked && i >= 0) ids.splice(i, 1);
          if (!linked && i < 0) ids.push(row.id);
          return Object.assign({}, item, { groupIds: ids });
        });
      });
      load();
    }).catch(function (e) { busyS[1](false); msgS[1](C.errText(e)); });
  }

  return h("div", { className: "wbv" },
    h("div", { className: "wbv-row" },
      h("h2", { className: "wbv-grow" }, "分组与关联"),
      h(C.Btn, { h: h, onClick: load }, "刷新")),
    h("p", { className: "wbv-muted" },
      "业务模块（站点、连接器等）把自己的对象关联到分组，再按组取用组内凭据；关联引用保存在保险箱，不要求模块依赖 sites。"),
    h(C.Notice, { h: h, kind: "error", text: listS[0].error || msgS[0] }),

    h("div", { className: "wbv-card wbv-row" },
      h(C.Field, { h: h, label: "新分组名称" },
        h("input", { value: formS[0].name, placeholder: "如 少数派 / 工作邮箱", onChange: function (e) { formS[1](Object.assign({}, formS[0], { name: e.target.value })); } })),
      h(C.Field, { h: h, label: "描述" },
        h("input", { value: formS[0].description, placeholder: "可选", onChange: function (e) { formS[1](Object.assign({}, formS[0], { description: e.target.value })); } })),
      h("div", { style: { alignSelf: "flex-end" } },
        h(C.Btn, { h: h, kind: "primary", disabled: busyS[0], onClick: create }, busyS[0] ? "创建中…" : "新建分组"))),

    listS[0].loading ? h(C.Empty, { h: h, text: "读取分组…" }) :
      listS[0].rows.length === 0 ? h(C.Empty, { h: h, text: "还没有分组。先建一个组，再把凭据放进去。" }) :
      h("table", { className: "wbv-table" },
        h("thead", null, h("tr", null, ["分组", "描述", "集合", "凭据", "关联对象", "操作"].map(function (x) { return h("th", { key: x }, x); }))),
        h("tbody", null, listS[0].rows.map(function (row) {
          return h("tr", { key: row.id },
            h("td", null, h("strong", null, row.name), h("div", { className: "wbv-muted" }, row.id)),
            h("td", null, row.description || "—"),
            h("td", null, setsOfGroup(row).length ? h("div", { className: "wbv-chips" }, setsOfGroup(row).map(function (set) {
              return h("span", { key: set.id, className: "wbv-chip" }, set.name);
            })) : h("span", { className: "wbv-muted" }, "未挂集合")),
            h("td", null, row.secretCount || 0),
            h("td", null, row.bindingCount || 0),
            h("td", null, h("div", { className: "wbv-inline" },
              h(C.Btn, { h: h, kind: "ghost", onClick: function () { open(row); } }, "查看关联"),
              h(C.Btn, { h: h, kind: "ghost", onClick: function () { remove(row); } }, "删除"))));
        }))),

    delS[0] ? h("div", { className: "wbv-modal", onClick: function () { if (!busyS[0]) delS[1](null); } },
      h("div", { className: "wbv-modal-box", onClick: function (e) { e.stopPropagation(); } },
        h("h3", null, "删除分组「" + delS[0].row.name + "」？"),
        h("p", { className: "wbv-sub" }, "只删除分组与集合、关联对象的绑定，凭据与集合本身都保留。"),
        h(C.Field, { h: h, label: "组内集合改挂到", hint: "留空表示从所有分组移出（集合与凭据不删）" },
          h("select", { value: delS[0].moveTo, disabled: busyS[0], onChange: function (e) { delS[1]({ row: delS[0].row, moveTo: e.target.value }); } },
            h("option", { value: "" }, "不转移（移出分组）"),
            listS[0].rows.filter(function (g) { return g.id !== delS[0].row.id; }).map(function (g) {
              return h("option", { key: g.id, value: g.id }, g.name);
            }))),
        h("div", { className: "wbv-row", style: { justifyContent: "flex-end" } },
          h(C.Btn, { h: h, disabled: busyS[0], onClick: function () { delS[1](null); } }, "取消"),
          h(C.Btn, { h: h, kind: "danger", disabled: busyS[0], onClick: confirmRemove }, busyS[0] ? "删除中…" : "确认删除")))) : null,

    openS[0] ? h("div", { className: "wbv-modal", onClick: function () { openS[1](null); } },
      h("div", { className: "wbv-modal-box", onClick: function (e) { e.stopPropagation(); } },
        h("h3", null, "「" + openS[0].group.name + "」的关联对象"),
        h("div", { className: "wbv-sub" }, "挂载集合（勾选即挂载，取消即摘除，只改关联不动凭据）"),
        h("div", { className: "wbv-check-list" }, setsS[0].length ? setsS[0].map(function (set) {
          var on = (set.groupIds || []).indexOf(openS[0].group.id) >= 0;
          return h("label", { key: set.id, className: "wbv-check" },
            h("input", { type: "checkbox", checked: on, disabled: busyS[0], onChange: function () { toggleSet(openS[0].group, set); } }),
            h("span", { className: "wbv-dot", style: { background: set.color || "var(--wb-accent)" } }),
            h("span", null, set.name),
            h("span", { className: "wbv-muted" }, " · " + (set.secretCount || 0) + " 条"));
        }) : h("span", { className: "wbv-muted" }, "还没有集合")),
        openS[0].loading ? h(C.Empty, { h: h, text: "读取中…" }) :
          openS[0].error ? h(C.Notice, { h: h, kind: "error", text: openS[0].error }) :
          openS[0].items.length === 0 ? h(C.Empty, { h: h, text: "还没有模块关联到这个分组。" }) :
          h("table", { className: "wbv-table" },
            h("thead", null, h("tr", null, ["类型", "对象 id", "标题"].map(function (x) { return h("th", { key: x }, x); }))),
            h("tbody", null, openS[0].items.map(function (item, i) {
              return h("tr", { key: i },
                h("td", null, item.subjectType),
                h("td", null, item.subjectId),
                h("td", null, item.title || "—"));
            }))),
        h("div", { className: "wbv-row" },
          h("span", { className: "wbv-muted wbv-grow" }, "关联由业务模块通过 vault.bind 注册；这里只读。"),
          h(C.Btn, { h: h, onClick: function () { openS[1](null); } }, "关闭")))) : null);
};
