"use strict";
/**
 * 集合与账号页：集合可复用（挂多个分组、装多条凭据），并可标一个账号；
 * 新建/编辑时先选类型：「账号集合」才显示账号输入，「普通集合」不绑定账号，条目只按 id 区分。
 * 页面骨架与弹层外壳分别来自 ui/page.cjs、ui/dialog.cjs。
 */
var C = require("../ui/common.cjs");
var P = require("../ui/page.cjs");
var K = require("../ui/kinds.cjs");
var Lock = require("../ui/lock.cjs");
var Dialog = require("../ui/dialog.cjs").Dialog;
var ConfirmDialog = require("../ui/dialog.cjs").ConfirmDialog;
var GLYPHS = require("../ui/icons.cjs").ICONS;

var Layers = GLYPHS["layers"];

module.exports = function SetsView(props) {
  var h = props.h;
  var api = props.api;
  var lang = props.lang || "zh";
  var React = props.React;

  var listS = React.useState({ loading: true, items: [], error: "" });
  var secretsS = React.useState([]);
  var groupsS = React.useState([]);
  var activeS = React.useState(null); // { set, loading }
  var detailS = React.useState({ setId: "", secrets: [], groups: [], error: "" });
  var qS = React.useState("");
  var typeS = React.useState(""); // "" | account | common
  var msgS = React.useState("");
  var busyS = React.useState(false);
  var draftS = React.useState(null); // { id?, name, account, description, color }
  var pickS = React.useState([]); // 待加入集合的凭据 id
  var delS = React.useState(null); // { set } 删除确认
  // 未解锁守卫：锁定期间三个列表接口都不发；在途响应按序号作废，避免迟到的明文回填。
  var guard = Lock.use({ api: api, C: C, React: React });
  var inflight = React.useState({ seq: 0 })[0];

  function load() {
    if (guard.locked) {
      listS[1]({ loading: false, items: [], error: "" });
      return;
    }
    var seq = (inflight.seq += 1);
    listS[1](function (old) { return Object.assign({}, old, { loading: true }); });
    Promise.all([
      C.call(api, "vault.setList", { q: qS[0], type: typeS[0] || undefined }),
      C.call(api, "vault.secretList", {}),
      C.call(api, "vault.groupList", {}),
    ]).then(function (r) {
      if (inflight.seq !== seq) return;
      listS[1]({ loading: false, items: (r[0] && r[0].items) || [], error: "" });
      secretsS[1]((r[1] && (r[1].items || r[1].secrets)) || []);
      groupsS[1]((r[2] && r[2].items) || []);
      if (activeS[0]) return open(activeS[0]).then(null, function () {});
    }).catch(function (e) {
      if (inflight.seq !== seq) return;
      listS[1]({ loading: false, items: [], error: C.errText(e) });
    });
  }

  // 锁定时清空列表、选中行、详情、草稿与待选凭据；解锁后自动重载。
  React.useEffect(function () {
    if (!guard.ready) return;
    inflight.seq += 1;
    if (guard.locked) {
      listS[1]({ loading: false, items: [], error: "" });
      secretsS[1]([]);
      groupsS[1]([]);
      activeS[1](null);
      detailS[1]({ setId: "", secrets: [], groups: [], error: "" });
      draftS[1](null);
      pickS[1]([]);
      delS[1](null);
      msgS[1]("");
      return;
    }
    load();
  }, [guard.ready, guard.locked]);

  function secretName(id) {
    for (var i = 0; i < secretsS[0].length; i += 1) if (secretsS[0][i].id === id) return secretsS[0][i].name;
    return id;
  }

  function open(row) {
    if (guard.locked) return null;
    activeS[1](row);
    detailS[1]({ setId: row.id, secrets: [], groups: [], error: "" });
    var seq = (inflight.seq += 1);
    return C.call(api, "vault.setGet", { id: row.id }).then(function (r) {
      if (inflight.seq !== seq) return;
      detailS[1]({ setId: row.id, secrets: (r && r.secrets) || [], groups: (r && r.groupIds) || [], error: "" });
    }).catch(function (e) {
      if (inflight.seq !== seq) return;
      detailS[1]({ setId: row.id, secrets: [], groups: [], error: C.errText(e) });
    });
  }

  function startCreate() {
    draftS[1]({ name: "", type: "common", account: "", description: "", color: "" });
    msgS[1]("");
  }

  function startEdit(set) {
    draftS[1]({
      id: set.id,
      name: set.name,
      type: set.type === "account" ? "account" : "common",
      account: set.account || "",
      description: set.description || "",
      color: set.color || "",
    });
    msgS[1]("");
  }

  // 类型决定是否需要账号：账号集合必须填账号，普通集合保存时清空账号。
  function saveDraft() {
    var d = draftS[0];
    if (!d || !String(d.name || "").trim()) return msgS[1]("集合名不能为空");
    var isAccount = d.type === "account";
    var account = isAccount ? String(d.account || "").trim() : "";
    if (isAccount && !account) return msgS[1]("账号集合需要填写账号；账号留空请改选普通集合");
    busyS[1](true); msgS[1]("");
    var body = {
      name: String(d.name).trim(),
      account: account,
      description: d.description || "",
      color: d.color || "",
    };
    var req = d.id
      ? C.call(api, "vault.setUpdate", Object.assign({ id: d.id }, body))
      : C.call(api, "vault.setCreate", body);
    req.then(function () {
      busyS[1](false); draftS[1](null); load();
    }).catch(function (e) {
      busyS[1](false);
      msgS[1](C.errText(e));
    });
  }

  function removeSet(set) {
    delS[1]({ set: set });
  }

  function confirmRemoveSet() {
    var d = delS[0];
    if (!d) return;
    busyS[1](true); msgS[1]("");
    C.call(api, "vault.setDelete", { id: d.set.id }).then(function () {
      busyS[1](false); delS[1](null); activeS[1](null); load();
    }).catch(function (e) {
      busyS[1](false);
      msgS[1](C.errText(e));
    });
  }

  function detach(secretId) {
    busyS[1](true); msgS[1]("");
    C.call(api, "vault.setDetachSecret", { setId: activeS[0].id, secretId: secretId }).then(function () {
      busyS[1](false); open(activeS[0]); load();
    }).catch(function (e) {
      busyS[1](false);
      msgS[1](C.errText(e));
    });
  }

  function attachPicked() {
    if (!pickS[0].length) return;
    busyS[1](true); msgS[1]("");
    var jobs = pickS[0].map(function (secretId) {
      return C.call(api, "vault.setAttachSecret", { setId: activeS[0].id, secretId: secretId });
    });
    Promise.all(jobs).then(function () {
      busyS[1](false); pickS[1]([]); open(activeS[0]); load();
    }).catch(function (e) {
      busyS[1](false);
      msgS[1](C.errText(e));
    });
  }

  function toggleGroup(groupId, on) {
    busyS[1](true); msgS[1]("");
    var action = on ? "vault.groupAttachSet" : "vault.groupDetachSet";
    C.call(api, action, { groupId: groupId, setId: activeS[0].id }).then(function () {
      busyS[1](false); open(activeS[0]); load();
    }).catch(function (e) {
      busyS[1](false);
      msgS[1](C.errText(e));
    });
  }

  var items = listS[0].items.filter(function (set) {
    var q = qS[0].trim();
    if (!q) return true;
    return (set.name || "").indexOf(q) >= 0
      || (set.account || "").indexOf(q) >= 0
      || (set.description || "").indexOf(q) >= 0;
  });
  var detail = detailS[0];
  var inSet = {};
  detail.secrets.forEach(function (s) { inSet[s.id] = true; });
  var candidates = secretsS[0].filter(function (s) { return !inSet[s.id]; });

  if (!guard.ready) return h("div", { className: "wbv" }, h(C.Empty, { h: h, text: "正在读取保险箱状态…" }));
  if (guard.locked) return h(Lock.Panel, { h: h, C: C, lang: lang, error: guard.error });

  var active = activeS[0];
  var secretColumns = [
    { key: "name", label: "名称" },
    { key: "kind", label: "类型" },
    { key: "updated", label: "更新时间" },
    { key: "ops", label: "操作", align: "right" },
  ];

  return h("div", { className: "wbv" },
    h(P.PageHead, {
      h: h,
      title: "集合与账号",
      sub: "一个集合可以标一个账号（可重复、可留空），并挂到多个分组、装多条凭据；删除集合只断关联，不删凭据。",
      actions: [
        h(C.Btn, { h: h, key: "refresh", onClick: load }, "刷新"),
        h(C.Btn, { h: h, key: "create", kind: "primary", onClick: startCreate }, "新建集合与账号"),
      ],
    }),
    h(P.Toolbar, { h: h },
      h(P.Input, {
        h: h,
        className: "wbv-search",
        placeholder: "搜索集合名、账号或描述",
        "aria-label": "搜索集合与账号",
        value: qS[0],
        onChange: function (e) { qS[1](e.target.value); },
      }),
      h(P.Select, {
        h: h,
        "aria-label": "按集合类型筛选",
        value: typeS[0],
        onChange: function (e) { typeS[1](e.target.value); load(); },
      },
        h("option", { value: "" }, "全部类型"),
        h("option", { value: "account" }, "账号集合"),
        h("option", { value: "common" }, "普通集合")),
      h("span", { className: "wbv-toolbar-tail" }),
      h("span", { className: "wbv-muted" }, listS[0].loading ? "读取中…" : items.length + " 个集合")),
    h(C.Notice, { h: h, kind: "error", text: listS[0].error || msgS[0] }),

    h("div", { className: "wbv-split" },
      h("div", { className: "wbv-list" },
        listS[0].loading
          ? h(C.Empty, { h: h, text: "读取集合…" })
          : items.length === 0
            ? h(P.EmptyState, {
                h: h,
                icon: Layers,
                title: qS[0] || typeS[0] ? "没有匹配的集合与账号" : "还没有集合与账号",
                hint: qS[0] || typeS[0] ? "换个关键词或类型试试。" : "新建一个后，可以把账号、凭据和分组都挂进来。",
              }, h(C.Btn, { h: h, kind: "primary", onClick: startCreate }, "新建集合与账号"))
            : items.map(function (set) {
                var on = active && active.id === set.id;
                return h("button", {
                  key: set.id,
                  type: "button",
                  className: "wbv-item" + (on ? " on" : ""),
                  onClick: function () { open(set); },
                },
                  h("div", { className: "wbv-item-top" },
                    h("span", { className: "wbv-dot", style: set.color ? { background: set.color } : null }),
                    h("span", { className: "wbv-item-title" }, set.name),
                    h("span", { className: "wbv-pill" }, set.type === "account" ? "账号集合" : "普通集合"),
                    h("span", { className: "wbv-grow" }),
                    h("span", { className: "wbv-pill" }, (set.secretCount || 0) + " 条")),
                  h("div", { className: "wbv-item-sub" },
                    (set.account ? "账号 " + set.account : "未填账号")
                      + " · " + (set.description || "—")
                      + " · " + (set.groupIds || []).length + " 个分组"));
              })),

      h(P.Card, { h: h },
        !active
          ? h(C.Empty, { h: h, text: "左侧选一个集合，查看凭据与分组。" })
          : h(React.Fragment, null,
              h("div", { className: "wbv-card-head" },
                h("h3", { className: "wbv-card-title" }, active.name),
                h("div", { className: "wbv-card-actions" },
                  h(C.Btn, { h: h, onClick: function () { startEdit(active); } }, "编辑"),
                  h(C.Btn, { h: h, kind: "danger", onClick: function () { removeSet(active); } }, "删除集合"))),
              h("div", { className: "wbv-muted", style: { marginBottom: "10px" } },
                (active.type === "account" ? "账号集合" : "普通集合")
                  + " · 账号：" + (active.account || "未填")),
              detail.error ? h(C.Notice, { h: h, kind: "error", text: detail.error }) : null,
              h("div", { className: "wbv-label" }, "集合内凭据"),
              detail.secrets.length === 0
                ? h("div", { className: "wbv-muted" }, "还没有凭据。")
                : h(P.DataTable, {
                    h: h,
                    label: "集合内凭据",
                    columns: secretColumns,
                    rows: detail.secrets,
                    renderRow: function (s) {
                      return h("tr", { key: s.id },
                        h("td", null, h("div", { className: "wbv-cell-main" }, s.name)),
                        h("td", null, h("span", { className: "wbv-pill" }, K.KIND_LABEL[s.kind] || s.kind)),
                        h("td", null, C.fmtTime(s.updatedAt, lang)),
                        h("td", null, h("div", { className: "wbv-actions" },
                          h(C.Btn, { h: h, kind: "ghost", onClick: function () { detach(s.id); } }, "移出"))));
                    },
                  }),
              h("div", { className: "wbv-card-title", style: { marginTop: "14px" } }, "加入凭据"),
              h("div", { className: "wbv-row" },
                h(P.Select, {
                  h: h,
                  value: "",
                  "aria-label": "选择要加入的凭据",
                  onChange: function (e) { var v = e.target.value; if (v) pickS[1](pickS[0].concat([v])); e.target.value = ""; },
                },
                  h("option", { value: "" }, candidates.length ? "选择要加入的凭据…" : "没有可加入的凭据"),
                  candidates.map(function (s) { return h("option", { key: s.id, value: s.id }, s.name + "（" + (K.KIND_LABEL[s.kind] || s.kind) + "）"); })),
                pickS[0].length ? h("span", { className: "wbv-chips" }, pickS[0].map(function (id) {
                  return h("span", { className: "wbv-chip", key: id },
                    h("span", null, secretName(id)),
                    h("button", { type: "button", className: "wbv-btn ghost", onClick: function () { pickS[1](pickS[0].filter(function (x) { return x !== id; })); } }, "×"));
                })) : null,
                h("span", { className: "wbv-grow" }),
                h(C.Btn, { h: h, kind: "primary", disabled: !pickS[0].length || busyS[0], onClick: attachPicked }, "加入 " + (pickS[0].length || ""))),

              h("div", { className: "wbv-card-title", style: { marginTop: "14px" } }, "挂靠分组"),
              h("div", { className: "wbv-chips" },
                groupsS[0].length === 0 ? h("span", { className: "wbv-muted" }, "还没有分组。") :
                  groupsS[0].map(function (g) {
                    var on = detail.groups.indexOf(g.id) >= 0;
                    return h("label", { key: g.id, className: "wbv-chip", style: { cursor: "pointer" } },
                      h("input", { type: "checkbox", checked: on, disabled: busyS[0], onChange: function (e) { toggleGroup(g.id, e.target.checked); } }),
                      h("span", null, g.name));
                  }))))),

    draftS[0] ? h(Dialog, {
      h: h,
      React: React,
      title: draftS[0].id ? "编辑集合与账号" : "新建集合与账号",
      titleId: "wbv-set-form-title",
      busy: busyS[0],
      onClose: busyS[0] ? null : function () { draftS[1](null); },
      closeOnEscape: !busyS[0],
      closeOnMask: !busyS[0],
      autoFocus: false,
    },
      h("div", { className: "wbv-modal-body" },
        h(C.Field, { h: h, label: "集合名" },
          h(P.Input, {
            h: h,
            autoFocus: true,
            value: draftS[0].name,
            placeholder: "如 acc_1 / 工作邮箱",
            onChange: function (e) { draftS[1](Object.assign({}, draftS[0], { name: e.target.value })); },
          })),
        h(C.Field, { h: h, label: "集合类型", hint: "账号集合可标一个账号；普通集合不绑定账号" },
          h(P.Select, {
            h: h,
            "aria-label": "选择集合类型",
            value: draftS[0].type,
            onChange: function (e) {
              var type = e.target.value === "account" ? "account" : "common";
              draftS[1](Object.assign({}, draftS[0], { type: type, account: type === "common" ? "" : draftS[0].account }));
            },
          },
            h("option", { value: "account" }, "账号集合"),
            h("option", { value: "common" }, "普通集合"))),
        draftS[0].type === "account"
          ? h(C.Field, { h: h, label: "账号", hint: "可重复，不同条目只按 id 区分；一个集合只标一个账号" },
              h(P.Input, {
                h: h,
                value: draftS[0].account,
                placeholder: "如 ops@example.com",
                onChange: function (e) { draftS[1](Object.assign({}, draftS[0], { account: e.target.value })); },
              }))
          : null,
        h(C.Field, { h: h, label: "描述" },
          h(P.Input, {
            h: h,
            value: draftS[0].description,
            placeholder: "可选",
            onChange: function (e) { draftS[1](Object.assign({}, draftS[0], { description: e.target.value })); },
          })),
        h(C.Field, { h: h, label: "颜色（可选，主题 token 名或色值）", hint: "留空使用主题强调色；建议填 --wb-accent 一类 token" },
          h(P.Input, {
            h: h,
            value: draftS[0].color,
            placeholder: "如 --wb-accent",
            onChange: function (e) { draftS[1](Object.assign({}, draftS[0], { color: e.target.value })); },
          })),
        h(C.Notice, { h: h, kind: "error", text: msgS[0] })),
      h("div", { className: "wbv-modal-foot" },
        h("span", { className: "wbv-grow" }),
        h(C.Btn, { h: h, disabled: busyS[0], onClick: function () { draftS[1](null); } }, "取消"),
        h(C.Btn, { h: h, kind: "primary", disabled: busyS[0], onClick: saveDraft }, busyS[0] ? "保存中…" : "保存"))) : null,

    delS[0] ? h(ConfirmDialog, {
      h: h,
      React: React,
      title: "删除集合「" + delS[0].set.name + "」？",
      message: "只解除与凭据、分组的关联，凭据本身保留。",
      confirmText: "确认删除",
      busyText: "删除中…",
      busy: busyS[0],
      onCancel: function () { if (!busyS[0]) delS[1](null); },
      onConfirm: confirmRemoveSet,
    }) : null);
};
