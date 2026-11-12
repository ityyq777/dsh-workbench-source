"use strict";
/** 凭据列表与增删改查；明文只在 reveal 弹层里出现。 */
var C = require("../ui/common.cjs");

var KIND_LABEL = {
  password: "密码",
  token: "Token",
  app_password: "应用专用密码",
  api_key: "API Key",
  other: "其它",
};

module.exports = function SecretsView(props) {
  var h = props.h;
  var api = props.api;
  var lang = props.lang || "zh";
  var React = props.React;

  var listS = React.useState({ loading: true, rows: [], error: "" });
  var qS = React.useState("");
  var statusS = React.useState(null);
  var formS = React.useState(emptyForm());
  var editingS = React.useState(false);
  var busyS = React.useState(false);
  var msgS = React.useState("");
  var revealS = React.useState(null);

  var rows = listS[0].rows;

  function load() {
    listS[1](function (old) { return Object.assign({}, old, { loading: true }); });
    Promise.all([
      C.call(api, "vault.secretList", { q: qS[0] }),
      C.call(api, "vault.status").catch(function () { return null; }),
    ]).then(function (r) {
      listS[1]({ loading: false, rows: (r[0] && (r[0].items || r[0].secrets)) || [], error: "" });
      statusS[1](r[1]);
    }).catch(function (e) {
      listS[1]({ loading: false, rows: [], error: C.errText(e) });
    });
  }

  React.useEffect(function () { load(); }, []);

  function startCreate() {
    formS[1](emptyForm());
    editingS[1](true);
    msgS[1]("");
  }

  function startEdit(row) {
    var meta = {};
    try { meta = JSON.parse(row.meta || "{}"); } catch (e) { meta = {}; }
    formS[1]({ id: row.id, name: row.name, kind: row.kind, secret: "", username: meta.username || "", url: meta.url || "" });
    editingS[1](true);
    msgS[1]("");
  }

  function save() {
    var f = formS[0];
    if (!f.name.trim()) return msgS[1]("名称不能为空");
    if (!editingS[0]) return;
    if (!f.id && !f.secret) return msgS[1]("新增凭据必须填写明文");
    busyS[1](true); msgS[1]("");
    var meta = { username: f.username, url: f.url };
    var p = f.id
      ? C.call(api, "vault.secretUpdate", { id: f.id, name: f.name.trim(), kind: f.kind, secret: f.secret || undefined, meta: meta })
      : C.call(api, "vault.secretCreate", { name: f.name.trim(), kind: f.kind, secret: f.secret, meta: meta });
    p.then(function () {
      busyS[1](false); editingS[1](false); formS[1](emptyForm()); load();
    }).catch(function (e) { busyS[1](false); msgS[1](C.errText(e)); });
  }

  function del(row) {
    if (!window.confirm("删除凭据「" + row.name + "」？绑定它的连接器会失效。")) return;
    busyS[1](true); msgS[1]("");
    C.call(api, "vault.secretDelete", { id: row.id }).then(function () {
      busyS[1](false); load();
    }).catch(function (e) { busyS[1](false); msgS[1](C.errText(e)); });
  }

  function reveal(row) {
    msgS[1]("");
    var mode = statusS[0] && statusS[0].unlockMode;
    var passphrase;
    if (mode === "B") {
      passphrase = window.prompt("B 模式下查看凭据需要再次输入主口令：");
      if (passphrase === null) return;
    }
    busyS[1](true);
    C.call(api, "vault.secretReveal", { id: row.id, passphrase: passphrase }).then(function (r) {
      busyS[1](false); revealS[1]({ name: row.name, secret: r.secret });
    }).catch(function (e) { busyS[1](false); msgS[1](C.errText(e)); });
  }

  return h("div", { className: "wbv" },
    h("div", { className: "wbv-row" },
      h("h2", { className: "wbv-grow" }, "凭据"),
      h("input", { style: { maxWidth: "220px" }, placeholder: "搜索名称或备注", value: qS[0], onChange: function (e) { qS[1](e.target.value); } }),
      h(C.Btn, { h: h, onClick: load }, "搜索"),
      h(C.Btn, { h: h, kind: "primary", onClick: startCreate }, "新增凭据")),
    h(C.Notice, { h: h, kind: "error", text: listS[0].error || msgS[0] }),
    listS[0].loading ? h(C.Empty, { h: h, text: "读取中…" }) :
      rows.length === 0 ? h(C.Empty, { h: h, text: "还没有凭据。新增一条后，可把它绑定给连接器。" }) :
      h("table", { className: "wbv-table" },
        h("thead", null, h("tr", null, ["名称", "类型", "备注", "最近使用", "操作"].map(function (x) { return h("th", { key: x }, x); }))),
        h("tbody", null, rows.map(function (row) {
          var meta = {};
          try { meta = JSON.parse(row.meta || "{}"); } catch (e) { meta = {}; }
          return h("tr", { key: row.id },
            h("td", null, h("strong", null, row.name)),
            h("td", null, h("span", { className: "wbv-pill" }, KIND_LABEL[row.kind] || row.kind)),
            h("td", null, [meta.username, meta.url].filter(Boolean).join(" · ") || "—"),
            h("td", null, C.fmtTime(row.lastUsedAt, lang)),
            h("td", null, h("div", { className: "wbv-inline" },
              h(C.Btn, { h: h, kind: "ghost", onClick: function () { reveal(row); } }, "查看"),
              h(C.Btn, { h: h, kind: "ghost", onClick: function () { startEdit(row); } }, "编辑"),
              h(C.Btn, { h: h, kind: "ghost", onClick: function () { del(row); } }, "删除"))));
        }))),
    editingS[0] ? h("div", { className: "wbv-modal" },
      h("div", { className: "wbv-modal-box" },
        h("h3", null, formS[0].id ? "编辑凭据" : "新增凭据"),
        h(C.Field, { h: h, label: "名称" }, h("input", { value: formS[0].name, onChange: function (e) { formS[1](Object.assign({}, formS[0], { name: e.target.value })); } })),
        h(C.Field, { h: h, label: "类型" },
          h("select", { value: formS[0].kind, onChange: function (e) { formS[1](Object.assign({}, formS[0], { kind: e.target.value })); } },
            Object.keys(KIND_LABEL).map(function (k) { return h("option", { key: k, value: k }, KIND_LABEL[k]); }))),
        h(C.Field, { h: h, label: formS[0].id ? "新明文（留空不轮换）" : "明文" },
          h("input", { type: "password", autoComplete: "new-password", value: formS[0].secret, placeholder: formS[0].id ? "不修改请留空" : "密码 / token", onChange: function (e) { formS[1](Object.assign({}, formS[0], { secret: e.target.value })); } })),
        h(C.Field, { h: h, label: "备注用户名" }, h("input", { value: formS[0].username, onChange: function (e) { formS[1](Object.assign({}, formS[0], { username: e.target.value })); } })),
        h(C.Field, { h: h, label: "备注 URL" }, h("input", { value: formS[0].url, onChange: function (e) { formS[1](Object.assign({}, formS[0], { url: e.target.value })); } })),
        h(C.Notice, { h: h, kind: "error", text: msgS[0] }),
        h("div", { className: "wbv-row" },
          h("span", { className: "wbv-grow" }),
          h(C.Btn, { h: h, onClick: function () { editingS[1](false); } }, "取消"),
          h(C.Btn, { h: h, kind: "primary", disabled: busyS[0], onClick: save }, busyS[0] ? "保存中…" : "保存")))) : null,
    revealS[0] ? h("div", { className: "wbv-modal", onClick: function () { revealS[1](null); } },
      h("div", { className: "wbv-modal-box", onClick: function (e) { e.stopPropagation(); } },
        h("h3", null, "凭据明文 · " + revealS[0].name),
        h("div", { className: "wbv-secret" }, revealS[0].secret),
        h("div", { className: "wbv-row" },
          h(C.Btn, { h: h, onClick: function () {
            if (navigator.clipboard) navigator.clipboard.writeText(revealS[0].secret).then(function () { msgS[1]("已复制"); });
          } }, "复制"),
          h("span", { className: "wbv-grow" }),
          h(C.Btn, { h: h, onClick: function () { revealS[1](null); } }, "关闭")))) : null);
};

function emptyForm() {
  return { id: "", name: "", kind: "password", secret: "", username: "", url: "" };
}
