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

  function load() {
    listS[1](function (old) { return Object.assign({}, old, { loading: true }); });
    C.call(api, "vault.groupList").then(function (r) {
      listS[1]({ loading: false, rows: (r && r.items) || [], error: "" });
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

  function remove(row) {
    var others = listS[0].rows.filter(function (g) { return g.id !== row.id; });
    var hint = others.length
      ? "输入接收凭据的分组 id（留空表示移出分组）：\n" + others.map(function (g) { return g.id + "  " + g.name; }).join("\n")
      : "组内凭据将移出分组。";
    var moveTo = window.prompt("删除分组「" + row.name + "」？\n" + hint, "");
    if (moveTo === null) return;
    busyS[1](true); msgS[1]("");
    C.call(api, "vault.groupDelete", { id: row.id, moveTo: moveTo.trim() || undefined }).then(function () {
      busyS[1](false); if (openS[0] && openS[0].group.id === row.id) openS[1](null); load();
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
        h("thead", null, h("tr", null, ["分组", "描述", "凭据", "关联对象", "操作"].map(function (x) { return h("th", { key: x }, x); }))),
        h("tbody", null, listS[0].rows.map(function (row) {
          return h("tr", { key: row.id },
            h("td", null, h("strong", null, row.name), h("div", { className: "wbv-muted" }, row.id)),
            h("td", null, row.description || "—"),
            h("td", null, row.secretCount || 0),
            h("td", null, row.bindingCount || 0),
            h("td", null, h("div", { className: "wbv-inline" },
              h(C.Btn, { h: h, kind: "ghost", onClick: function () { open(row); } }, "查看关联"),
              h(C.Btn, { h: h, kind: "ghost", onClick: function () { remove(row); } }, "删除"))));
        }))),

    openS[0] ? h("div", { className: "wbv-modal", onClick: function () { openS[1](null); } },
      h("div", { className: "wbv-modal-box", onClick: function (e) { e.stopPropagation(); } },
        h("h3", null, "「" + openS[0].group.name + "」的关联对象"),
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
