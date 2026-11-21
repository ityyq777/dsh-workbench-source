"use strict";
/**
 * 凭据保险箱锁定守卫（共享版）：保险箱自己的三页与依赖凭据的业务插件（邮件）共用一份实现。
 *
 * 解锁状态只由服务端 vault.status 决定——首页解锁、空闲超时自动锁定、首页手动锁定都会改它，
 * 客户端没有本地权威副本，所以这里每 4 秒轻量轮询一次本机 action（进程内调用，无网络开销）。
 * 页面拿到 locked=true 时必须停手：清空列表与详情、丢弃在途请求的响应，只留一张锁定提示卡。
 *
 * 各插件用 create() 绑定自己的 CSS 前缀、图标与默认文案，再在页面里 use()/Panel 渲染；
 * 图标必须由插件自己传（lucide 只准插件自己 require），共享层不引图标库，也不引 react。
 */
var POLL_MS = 4000;

function create(options) {
  var cfg = options || {};
  var prefix = String(cfg.prefix || "wb");
  var wrapClass = String(cfg.wrapClass || prefix);
  var lock = {
    POLL_MS: Number(cfg.pollMs) > 0 ? Number(cfg.pollMs) : POLL_MS,
    prefix: prefix,
    use: use,
    Panel: Panel,
    styles: styles,
  };

  /**
   * 轮询解锁状态；字段缺失、空返回、调用报错一律按锁定处理（fail-closed）。
   * 返回 { ready, locked, initialized, error, refresh }，页面据 locked 停手。
   */
  function use(opts) {
    var React = opts.React;
    var api = opts.api;
    var C = opts.C;
    // 轮询间隔允许覆盖：测试把它调到几十毫秒，生产用默认 4 秒。
    var every = Number(opts.pollMs) > 0 ? Number(opts.pollMs) : Number(lock.POLL_MS) || POLL_MS;
    var action = opts.action || "vault.status";
    var st = React.useState({ ready: false, locked: true, initialized: false, error: "" });
    var tick = React.useState(0);

    function read() {
      return C.call(api, action).then(function (data) {
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

  /** 锁定提示卡：不渲染任何列表、详情或操作入口，只给一条解锁出路。 */
  function Panel(props) {
    var h = props.h;
    var C = props.C;
    var lang = props.lang === "en" ? "en" : "zh";
    var Icon = props.Icon || cfg.Icon || null;
    function pick(custom, fallback) {
      var v = custom !== undefined ? custom : fallback;
      if (v && typeof v === "object") return v[lang] || v.zh || v.en || "";
      return v || "";
    }
    return h("div", { className: props.wrapClass || wrapClass },
      h("div", { className: prefix + "-lock-card", role: "status", "aria-live": "polite" },
        Icon ? h(Icon, { size: 22, strokeWidth: 2, "aria-hidden": "true", className: prefix + "-lock-ico" }) : null,
        h("div", { className: prefix + "-lock-title" }, pick(props.title, cfg.title)),
        h("div", { className: prefix + "-muted" }, pick(props.hint, cfg.hint)),
        props.error ? h(C.Notice, { h: h, kind: "error", text: props.error }) : null));
  }

  /** 锁卡片的基础样式：颜色全部来自 --wb-* token，插件再按自己的前缀引入。 */
  function styles() {
    return [
      "." + prefix + "-lock-card{max-width:560px;margin:28px auto;padding:26px 24px;border:1px solid var(--wb-border);border-radius:12px;background:var(--wb-card);display:flex;flex-direction:column;gap:8px;align-items:flex-start}",
      "." + prefix + "-lock-ico{color:var(--wb-muted)}",
      "." + prefix + "-lock-title{font-size:15px;font-weight:600}",
    ];
  }

  return lock;
}

module.exports = { create: create, POLL_MS: POLL_MS };
