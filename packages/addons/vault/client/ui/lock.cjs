"use strict";
var GLYPHS = require("./icons.cjs").ICONS;

/**
 * 未解锁守卫：凭据 / 集合 / 分组三页共用。
 *
 * 解锁状态只由服务端 vault.status 决定——首页解锁、空闲超时自动锁定、首页手动锁定都会改它，
 * 客户端没有本地权威副本，所以这里每 4 秒轻量轮询一次本插件 action（进程内调用，无网络开销）。
 * 页面拿到 locked=true 时必须停手：清空列表与详情、丢弃在途请求的响应，只留一个锁定提示卡。
 */
var POLL_MS = 4000;

function useVaultLock(options) {
  var React = options.React;
  var api = options.api;
  var C = options.C;
  // 轮询间隔允许覆盖：测试把它调到几十毫秒，生产用默认 4 秒。
  var every = Number(options.pollMs) > 0 ? Number(options.pollMs) : Number(obj.POLL_MS) || POLL_MS;
  var st = React.useState({ ready: false, locked: true, initialized: false, error: "" });
  var tick = React.useState(0);

  function read() {
    return C.call(api, "vault.status").then(function (data) {
      // 只有服务端明确说 locked === false 才算解锁；其余（字段缺失、空返回）一律按锁定。
      st[1](function (old) {
        var next = {
          ready: true,
          locked: !(data && data.locked === false),
          initialized: !!(data && data.initialized),
          error: "",
        };
        if (old.ready === next.ready && old.locked === next.locked && old.initialized === next.initialized && !old.error) return old;
        return next;
      });
    }).catch(function (e) {
      // 状态读不到也按锁定处理：宁可多锁一次，也不要在状态不明时把明文列表铺出来。
      st[1](function (old) { return Object.assign({}, old, { ready: true, locked: true, error: C.errText(e) }); });
    });
  }

  React.useEffect(function () {
    var alive = true;
    function poll() { if (alive) read(); }
    poll();
    var timer = setInterval(poll, every);
    // 浏览器里 setInterval 返回数字；Node（单测/SSR 预渲染）返回 Timeout，unref 掉免得挂住进程。
    if (timer && typeof timer.unref === "function") timer.unref();
    return function () { alive = false; clearInterval(timer); };
  }, [tick[0]]);

  return {
    ready: st[0].ready,
    locked: st[0].locked,
    initialized: st[0].initialized,
    error: st[0].error,
    refresh: function () { tick[1](tick[0] + 1); },
  };
}

/** 锁定提示卡：三页共用同一个外观与文案，不渲染任何列表、详情或操作入口。 */
function Panel(props) {
  var h = props.h;
  var C = props.C;
  var en = props.lang === "en";
  return h("div", { className: "wbv" },
    h("div", { className: "wbv-lock-card", role: "status", "aria-live": "polite" },
      h(GLYPHS.lock, { size: 22, strokeWidth: 2, "aria-hidden": "true", className: "wbv-lock-ico" }),
      h("div", { className: "wbv-lock-title" }, en ? "Vault is locked" : "保险箱已锁定"),
      h("div", { className: "wbv-muted" }, en
        ? "Unlock it on the Vault page first; this page recovers automatically once unlocked."
        : "请先在「保险箱」页解锁；解锁后本页会自动恢复列表与详情。"),
      props.error ? h(C.Notice, { h: h, kind: "error", text: props.error }) : null));
}

var obj = { use: useVaultLock, Panel: Panel, POLL_MS: POLL_MS };
module.exports = obj;
