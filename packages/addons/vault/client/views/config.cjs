"use strict";
/** 保险箱设置：主口令的说明与修改；0.7.0 起不再有解锁模式与 device key。 */
var C = require("../ui/common.cjs");
var P = require("../ui/page.cjs");
var SecretField = require("../../../lib/secret-field.cjs");

module.exports = function ConfigView(props) {
  var h = props.h;
  var api = props.api;
  var React = props.React;
  var st = React.useState(null);
  var oldPass = React.useState("");
  var newPass = React.useState("");
  var newPass2 = React.useState("");
  var msg = React.useState("");
  var busy = React.useState(false);
  var tick = React.useState(0);
  var show = React.useState({ old: false, next: false, again: false });

  React.useEffect(function () {
    C.call(api, "vault.status").then(function (s) {
      st[1](s);
    }).catch(function (e) { msg[1](C.errText(e)); });
  }, [tick[0]]);

  function run(p) {
    busy[1](true); msg[1]("");
    p.then(function () { busy[1](false); tick[1](tick[0] + 1); })
      .catch(function (e) { busy[1](false); msg[1](C.errText(e)); });
  }

  function changePass() {
    if (newPass[0].length < 12) return msg[1]("新口令至少 12 个字符");
    if (newPass[0] !== newPass2[0]) return msg[1]("两次输入的新口令不一致");
    run(C.call(api, "vault.changePassphrase", { oldPassphrase: oldPass[0], newPassphrase: newPass[0] }));
    oldPass[1](""); newPass[1](""); newPass2[1]("");
  }

  var status = st[0];
  var hint = status && status.passphraseHint ? status.passphraseHint : "尚未生成";

  return h("div", { className: "wbv" },
    h(P.PageHead, {
      h: h,
      title: "保险箱设置",
      sub: "主口令是全保险箱唯一的解锁因子：改口令只重包 DEK，不重新加密凭据。",
      pill: status ? h("span", { className: "wbv-pill" + (status.locked ? " warn" : " ok") }, status.locked ? "已锁定" : "已解锁") : null,
    }),
    h(C.Notice, { h: h, kind: "error", text: msg[0] }),

    h(P.Card, { h: h, title: "主口令是什么" },
      h("p", { className: "wbv-sub" },
        "主口令是你自己记住的那串口令，用来派生密钥包裹保险箱的 DEK（真正加密凭据的密钥）。" +
        "口令本身既不落库也不上云，云端只有 KDF 参数、包裹后的 DEK 与密文，所以忘记口令无法找回。" +
        "同一保险箱在所有设备上必须使用同一个主口令——换设备、重装、换机都是输入它，而不是「重新初始化」。" +
        "如果某台设备显示「口令错误」，99% 是这台设备上输入的主口令与最早的设备不一致。"),
      h("div", { className: "wbv-form-actions" },
        h("span", { className: "wbv-muted wbv-grow" },
          "主口令指纹：" + hint + "（由口令派生的密钥算出，不含口令本身；各设备显示一致即表示是同一个主口令）"),
        h(C.Btn, { h: h, disabled: busy[0] || !status || status.locked, onClick: function () { tick[1](tick[0] + 1); } }, "刷新指纹"))),

    h(P.Card, { h: h, title: "修改主口令" },
      h("p", { className: "wbv-sub" },
        "只重包 DEK 并更新指纹，不会重新加密已有凭据；改完后其它设备下次解锁时用新口令，" +
        "仍用旧口令会提示「主口令已在其它设备修改」。"),
      h("div", { className: "wbv-form-grid" },
        h(C.Field, { h: h, label: "当前口令" },
          h(SecretField, {
            h: h,
            show: show[0].old,
            value: oldPass[0],
            autoComplete: "current-password",
            onChange: function (v) { oldPass[1](v); },
            onToggle: function () { show[1](Object.assign({}, show[0], { old: !show[0].old })); },
          })),
        h(C.Field, { h: h, label: "新口令（至少 12 位）" },
          h(SecretField, {
            h: h,
            show: show[0].next,
            value: newPass[0],
            autoComplete: "new-password",
            onChange: function (v) { newPass[1](v); },
            onToggle: function () { show[1](Object.assign({}, show[0], { next: !show[0].next })); },
          })),
        h(C.Field, { h: h, label: "再输一次新口令" },
          h(SecretField, {
            h: h,
            show: show[0].again,
            value: newPass2[0],
            autoComplete: "new-password",
            onChange: function (v) { newPass2[1](v); },
            onToggle: function () { show[1](Object.assign({}, show[0], { again: !show[0].again })); },
          }))),
      h("div", { className: "wbv-form-actions" },
        h("span", { className: "wbv-grow" }),
        h(C.Btn, { h: h, kind: "primary", disabled: busy[0], onClick: changePass }, "修改口令"))),
  );
};
