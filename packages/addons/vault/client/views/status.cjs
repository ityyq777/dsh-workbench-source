"use strict";
/**
 * 保险箱首页：初始化 / 解锁 / 状态概览 / 快速锁定。
 *
 * 0.7.0 起只有主口令一种解锁因子：初始化、解锁、状态三个分支都围绕同一份主口令说明，
 * 不再有模式切换弹层。
 */
var GLYPHS = require("../ui/icons.cjs").ICONS;
var C = require("../ui/common.cjs");
var P = require("../ui/page.cjs");
var iconLabel = require("../../../lib/icon-label.cjs");
var SecretField = require("../../../lib/secret-field.cjs");

var Lock = GLYPHS["lock"];
var Unlock = GLYPHS["lock-open"];
var ShieldPlus = GLYPHS["shield-plus"];

module.exports = function StatusView(props) {
  var h = props.h;
  var api = props.api;
  var lang = props.lang || "zh";
  var React = props.React;

  var st = React.useState({ loading: true, data: null, error: "" });
  var status = st[0].data;
  var error = st[0].error;
  var busy = React.useState(false);
  var pass = React.useState("");
  var pass2 = React.useState("");
  var msg = React.useState("");
  var showMainS = React.useState(false);
  var showConfirmS = React.useState(false);
  var showUnlockS = React.useState(false);
  var refreshTick = React.useState(0);
  var refresh = function () {
    refreshTick[1](refreshTick[0] + 1);
  };

  React.useEffect(function () {
    var alive = true;
    C.call(api, "vault.status").then(function (data) {
      if (alive) st[1]({ loading: false, data: data, error: "" });
    }).catch(function (e) {
      if (alive) st[1]({ loading: false, data: null, error: C.errText(e) });
    });
    return function () {
      alive = false;
    };
  }, [refreshTick[0]]);

  function run(fn) {
    busy[1](true);
    msg[1]("");
    return fn().then(function () {
      pass[1]("");
      pass2[1]("");
      busy[1](false);
      refresh();
    }).catch(function (e) {
      msg[1](C.errText(e));
      busy[1](false);
    });
  }

  function pageHead(title, sub, extra) {
    return h(P.PageHead, { h: h, title: title, sub: sub, actions: extra });
  }

  if (st[0].loading) {
    return h("div", { className: "wbv" },
      pageHead("凭据保险箱", "正在读取保险箱状态…"),
      h(C.Empty, { h: h, text: "正在读取保险箱状态…" }));
  }

  if (error) {
    return h("div", { className: "wbv" },
      pageHead("凭据保险箱", "读取状态失败，可以重试；口令与凭据不会因此丢失。"),
      h(C.Notice, { h: h, kind: "error", text: error }),
      h("div", { className: "wbv-row" }, h(C.Btn, { h: h, onClick: refresh }, iconLabel(h, GLYPHS["refresh-cw"], "重试"))),
      );
  }

  if (!status || !status.initialized) {
    return h("div", { className: "wbv" },
      pageHead("初始化凭据保险箱", "口令只用于派生密钥，不会落库；忘记口令无法恢复已保存的凭据。"),
      h(C.Notice, { h: h, kind: "info", text: "主口令是保险箱唯一的钥匙：不落库、不上云，忘记后无法恢复已保存的凭据；创建后请在所有设备上使用同一个主口令。" }),
      h(P.Card, { h: h, title: "创建保险箱" },
        h("div", { className: "wbv-form-grid" },
          h(C.Field, { h: h, label: "主口令（至少 12 位）", hint: "用于派生密钥，请自行妥善保存" },
            h(SecretField, {
              h: h,
              autoComplete: "new-password",
              ariaLabel: "主口令",
              value: pass[0],
              show: showMainS[0],
              onChange: pass[1],
              onToggle: function () { showMainS[1](!showMainS[0]); },
            })),
          h(C.Field, { h: h, label: "确认口令" },
            h(SecretField, {
              h: h,
              autoComplete: "new-password",
              ariaLabel: "确认口令",
              value: pass2[0],
              show: showConfirmS[0],
              onChange: pass2[1],
              onToggle: function () { showConfirmS[1](!showConfirmS[0]); },
            })),
        ),
        h(C.Notice, { h: h, kind: "error", text: msg[0] }),
        h("div", { className: "wbv-form-actions" },
          h("span", { className: "wbv-grow" }),
          h(C.Btn, { h: h, kind: "primary", disabled: busy[0], onClick: function () {
            if (pass[0].length < 12) return msg[1]("口令至少 12 个字符");
            if (pass[0] !== pass2[0]) return msg[1]("两次输入不一致");
            run(function () { return C.call(api, "vault.setup", { passphrase: pass[0] }); });
          } }, iconLabel(h, ShieldPlus, busy[0] ? "初始化中…" : "创建保险箱")))),
      );
  }

  if (status.locked) {
    return h("div", { className: "wbv" },
      pageHead("保险箱已锁定", "输入主口令解锁。解锁状态只保存在当前进程内存，空闲超时会自动锁定。"),
      h(P.Card, { h: h, title: "解锁" },
        h("div", { className: "wbv-form-grid" },
          h(C.Field, { h: h, label: "主口令" },
            h(SecretField, {
              h: h,
              autoComplete: "current-password",
              ariaLabel: "主口令",
              value: pass[0],
              show: showUnlockS[0],
              onChange: pass[1],
              onToggle: function () { showUnlockS[1](!showUnlockS[0]); },
            }))),
        h("div", { className: "wbv-form-actions" },
          h("span", { className: "wbv-grow wbv-muted" }, "连续失败 5 次会锁定 5 分钟；主口令与其它设备不一致时同样报「口令错误」。"),
          h(C.Btn, { h: h, kind: "primary", disabled: busy[0], onClick: function () {
            if (!pass[0]) return msg[1]("请输入口令");
            run(function () { return C.call(api, "vault.unlock", { passphrase: pass[0] }); });
          } }, iconLabel(h, Unlock, busy[0] ? "解锁中…" : "解锁")))),
      h(C.Notice, { h: h, kind: "error", text: msg[0] }),
      );
  }

  return h("div", { className: "wbv" },
    pageHead("凭据保险箱", "明文只在本机解锁后可见；下方是概况与快捷操作。", [
      h(C.Pill, { h: h, kind: "ok", key: "state" }, iconLabel(h, Unlock, "已解锁")),
      h(C.Btn, { h: h, key: "lock", onClick: function () { run(function () { return C.call(api, "vault.lock"); }); } }, iconLabel(h, Lock, "立即锁定")),
    ]),
    h("div", { className: "wbv-stats" },
      h(P.Stat, { h: h, label: "凭据数量", value: status.secretCount || 0 }),
      h(P.Stat, { h: h, label: "分组数量", value: status.groupCount || 0 }),
      h(P.Stat, { h: h, label: "主口令指纹", value: status.passphraseHint || "—", hint: "各设备显示一致即同一个主口令" }),
      h(P.Stat, { h: h, label: "上次解锁", value: C.fmtTime(status.lastUnlockAt, lang) })),
    h(C.Notice, { h: h, kind: "info", text: "主口令指纹 " + (status.passphraseHint || "—") + "：由主口令派生，用来核对各设备是否同一个口令；agent 只能看到名称和备注，查看明文必须由你在界面上操作。" }),
    h(C.Notice, { h: h, kind: "error", text: msg[0] }),
  );
};

