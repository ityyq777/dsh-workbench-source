"use strict";
/** 凭据库：全局列表 + 搜索/类型筛选 + 所属集合；明文只在 reveal 弹层里出现。 */
var C = require("../ui/common.cjs");

var K = require("../ui/kinds.cjs");
var KIND_LABEL = K.KIND_LABEL;

module.exports = function SecretsView(props) {
  var h = props.h;
  var api = props.api;
  var lang = props.lang || "zh";
  var React = props.React;

  var listS = React.useState({ loading: true, rows: [], error: "" });
  var qS = React.useState("");
  var kindS = React.useState("");
  var statusS = React.useState(null);
  var setsS = React.useState([]);
  var formS = React.useState(emptyForm());
  var editingS = React.useState(false);
  var busyS = React.useState(false);
  var msgS = React.useState("");
  var revealS = React.useState(null);

  var rows = listS[0].rows;

  function load() {
    listS[1](function (old) { return Object.assign({}, old, { loading: true }); });
    Promise.all([
      C.call(api, "vault.secretList", { q: qS[0], kind: kindS[0] || undefined }),
      C.call(api, "vault.status").catch(function () { return null; }),
      C.call(api, "vault.setList", {}).catch(function () { return { items: [] }; }),
    ]).then(function (r) {
      listS[1]({ loading: false, rows: (r[0] && (r[0].items || r[0].secrets)) || [], error: "" });
      statusS[1](r[1]);
      setsS[1]((r[2] && r[2].items) || []);
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
    formS[1]({
      id: row.id,
      name: row.name,
      kind: row.kind,
      secret: "",
      setIds: (row.setIds || []).slice(),
      username: meta.username || "",
      url: meta.url || "",
    });
    editingS[1](true);
    msgS[1]("");
  }

  function toggleSet(id) {
    var cur = formS[0].setIds || [];
    var next = cur.indexOf(id) >= 0 ? cur.filter(function (x) { return x !== id; }) : cur.concat([id]);
    formS[1](Object.assign({}, formS[0], { setIds: next }));
  }

  function save() {
    var f = formS[0];
    if (!f.name.trim()) return msgS[1]("名称不能为空");
    if (!f.id && !f.secret) return msgS[1]("新增凭据必须填写明文");
    busyS[1](true); msgS[1]("");
    var meta = { username: f.username, url: f.url };
    var picked = f.setIds || [];
    var payload = {
      id: f.id || undefined,
      name: f.name.trim(),
      kind: f.kind,
      secret: f.secret || undefined,
      meta: meta,
    };
    if (!f.id && picked.length) payload.setId = picked[0];
    var p = f.id
      ? C.call(api, "vault.secretUpdate", payload)
      : C.call(api, "vault.secretCreate", payload);
    p.then(function (r) {
      var createdId = (r && r.id) || f.id;
      return syncSets(createdId, f.setIds || [], f.id ? rowSetIds(f.id) : []).then(function () {
        busyS[1](false); editingS[1](false); formS[1](emptyForm()); load();
      });
    }).catch(function (e) { busyS[1](false); msgS[1](C.errText(e)); });
  }

  function rowSetIds(id) {
    for (var i = 0; i < rows.length; i += 1) if (rows[i].id === id) return (rows[i].setIds || []).slice();
    return [];
  }

  function syncSets(secretId, next, prev) {
    var added = next.filter(function (x) { return prev.indexOf(x) < 0; });
    var removed = prev.filter(function (x) { return next.indexOf(x) < 0; });
    var jobs = added.map(function (setId) {
      return C.call(api, "vault.setAttachSecret", { setId: setId, secretId: secretId });
    }).concat(removed.map(function (setId) {
      return C.call(api, "vault.setDetachSecret", { setId: setId, secretId: secretId });
    }));
    return Promise.all(jobs);
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

  var setIndex = {};
  setsS[0].forEach(function (s) { setIndex[s.id] = s.name; });

  return h("div", { className: "wbv" },
    h("div", { className: "wbv-row" },
      h("h2", { className: "wbv-grow" }, "凭据库"),
      h("input", {
        className: "wbv-search",
        placeholder: "搜索名称、备注或集合",
        value: qS[0],
        onChange: function (e) { qS[1](e.target.value); },
        onKeyDown: function (e) { if (e.key === "Enter") load(); },
      }),
      h("select", {
        value: kindS[0],
        onChange: function (e) { kindS[1](e.target.value); setTimeout(load, 0); },
      }, h("option", { value: "" }, "全部类型"),
        K.CREATABLE_KINDS.map(function (k) { return h("option", { key: k, value: k }, KIND_LABEL[k]); })),
      h(C.Btn, { h: h, onClick: load }, "刷新"),
      h(C.Btn, { h: h, kind: "primary", onClick: startCreate }, "新增凭据")),
    h("p", { className: "wbv-muted" }, "凭据按「集合」组织：一条凭据可以进多个集合，一个集合可以挂到多个分组。明文只在本机解锁后可见。"),
    h(C.Notice, { h: h, kind: "error", text: listS[0].error || msgS[0] }),
    listS[0].loading ? h(C.Empty, { h: h, text: "读取中…" }) :
      rows.length === 0 ? h("div", { className: "wbv-empty-card" },
        h("div", { className: "wbv-empty-title" }, qS[0] || kindS[0] ? "没有匹配的凭据" : "还没有凭据"),
        h("div", { className: "wbv-muted" }, qS[0] || kindS[0] ? "换个关键词或类型试试。" : "新增一条后，把它加入集合；站点账号会自动用账号 id 作为集合名。"),
        h("div", { className: "wbv-row" }, h(C.Btn, { h: h, kind: "primary", onClick: startCreate }, "新增凭据"))) :
      h("table", { className: "wbv-table" },
        h("thead", null, h("tr", null, ["名称", "类型", "所属集合", "备注", "最近使用", "操作"].map(function (x) { return h("th", { key: x }, x); }))),
        h("tbody", null, rows.map(function (row) {
          var meta = {};
          try { meta = JSON.parse(row.meta || "{}"); } catch (e) { meta = {}; }
          var chips = (row.setIds || []).map(function (id) {
            return h("span", { key: id, className: "wbv-chip" }, setIndex[id] || id);
          });
          return h("tr", { key: row.id },
            h("td", null, h("strong", null, row.name), h("div", { className: "wbv-muted" }, row.id)),
            h("td", null, h("span", { className: "wbv-pill" }, KIND_LABEL[row.kind] || row.kind)),
            h("td", null, chips.length ? h("div", { className: "wbv-chips" }, chips) : h("span", { className: "wbv-muted" }, "未加入集合")),
            h("td", null, [meta.username, meta.url].filter(Boolean).join(" · ") || "—"),
            h("td", null, C.fmtTime(row.lastUsedAt, lang)),
            h("td", null, h("div", { className: "wbv-inline" },
              h(C.Btn, { h: h, kind: "ghost", onClick: function () { reveal(row); } }, "查看"),
              h(C.Btn, { h: h, kind: "ghost", onClick: function () { startEdit(row); } }, "编辑"),
              h(C.Btn, { h: h, kind: "ghost", onClick: function () { del(row); } }, "删除"))));
        }))),
    editingS[0] ? h("div", { className: "wbv-modal", onClick: function () { editingS[1](false); } },
      h("div", { className: "wbv-modal-box", onClick: function (e) { e.stopPropagation(); } },
        h("h3", null, formS[0].id ? "编辑凭据" : "新增凭据"),
        h(C.Field, { h: h, label: "名称" }, h("input", { value: formS[0].name, onChange: function (e) { formS[1](Object.assign({}, formS[0], { name: e.target.value })); } })),
        h(C.Field, { h: h, label: "类型" },
          h("select", { value: formS[0].kind, onChange: function (e) { formS[1](Object.assign({}, formS[0], { kind: e.target.value })); } },
            K.CREATABLE_KINDS.map(function (k) { return h("option", { key: k, value: k }, KIND_LABEL[k]); }))),
        h(C.Field, { h: h, label: formS[0].id ? "新明文（留空不轮换）" : "明文" },
          h("input", { type: "password", autoComplete: "new-password", value: formS[0].secret, placeholder: formS[0].id ? "不修改请留空" : "密码 / 手机号 / 证件号 / token", onChange: function (e) { formS[1](Object.assign({}, formS[0], { secret: e.target.value })); } })),
        h(C.Field, { h: h, label: "所属集合（可多选）", hint: setsS[0].length ? "勾选后保存时同步挂载/摘除" : "还没有集合，可先在「集合」页新建" },
          setsS[0].length ? h("div", { className: "wbv-check-list" }, setsS[0].map(function (s) {
            var on = (formS[0].setIds || []).indexOf(s.id) >= 0;
            return h("label", { key: s.id, className: "wbv-check" },
              h("input", { type: "checkbox", checked: on, onChange: function () { toggleSet(s.id); } }),
              h("span", { className: "wbv-dot", style: { background: s.color || "var(--wb-accent)" } }),
              h("span", null, s.name),
              h("span", { className: "wbv-muted" }, " · " + (s.secretCount || 0) + " 条"));
          })) : h("span", { className: "wbv-muted" }, "—")),
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
  return { id: "", name: "", kind: "password", secret: "", setIds: [], username: "", url: "" };
}
