"use strict";
/**
 * 新插件的客户端公共件工厂。
 *
 * 六个插件原本各自复制了一份 Btn/Field/Notice/Empty/Pill/Json/useLoad，
 * 唯一差异是 CSS 前缀（wbv/wbc/wba/wbct/wbca/wbm）。这里只保留一份实现，
 * 由各插件传入自己的前缀；样式仍由各插件 client/ui/styles.cjs 提供。
 */
module.exports = function createCommon(prefix) {
  var p = String(prefix || "wb");

  /**
   * 解包宿主 /workbench/api 的 {ok,result,text}。
   *
   * 这里必须对 ok:false 抛错：服务端拒绝（锁定、权限、schema、重名）返回的是
   * HTTP 500 + {ok:false,error}，以前原样返回给调用方，导致各插件写的 .catch
   * 全成死代码，界面上「保存成功」却什么都没发生。⚠️ 只判顶层 ok，业务结果
   * 自己的 ok 字段嵌在 result 里，不受影响。
   */
  function unwrap(r) {
    if (r && r.ok === false) {
      var error = new Error(r.error || r.message || "操作失败");
      if (r.code !== undefined) error.code = r.code;
      error.payload = r;
      throw error;
    }
    return r && r.result !== undefined ? r.result : r;
  }

  function call(api, action, args) {
    return Promise.resolve(api.call(action, args || {})).then(unwrap);
  }

  function errText(e) {
    if (!e) return "操作失败";
    if (typeof e === "string") return e;
    return e.message || e.error || String(e);
  }

  function fmtTime(ts, lang) {
    if (!ts) return "—";
    try {
      return new Date(ts).toLocaleString(lang === "en" ? "en-US" : "zh-CN", { hour12: false });
    } catch (e) {
      return String(ts);
    }
  }

  function Btn(props) {
    var h = props.h;
    return h(
      "button",
      {
        type: props.type || "button",
        className: p + "-btn" + (props.kind ? " " + props.kind : ""),
        disabled: props.disabled,
        onClick: props.onClick,
        title: props.title,
      },
      props.children,
    );
  }

  function Field(props) {
    var h = props.h;
    return h(
      "label",
      { className: p + "-field" },
      h("span", { className: p + "-label" }, props.label),
      props.children,
      props.hint ? h("span", { className: p + "-hint" }, props.hint) : null,
    );
  }

  function Notice(props) {
    var h = props.h;
    if (!props.text) return null;
    return h("div", { className: p + "-notice " + (props.kind || "info") }, props.text);
  }

  function Empty(props) {
    var h = props.h;
    return h("div", { className: p + "-empty" }, props.text || "暂无数据");
  }

  function Pill(props) {
    var h = props.h;
    return h("span", { className: p + "-pill " + (props.kind || "") }, props.children);
  }

  function Json(props) {
    var h = props.h;
    var text;
    try {
      text = JSON.stringify(props.value, null, 2);
    } catch (e) {
      text = String(props.value);
    }
    return h("pre", { className: p + "-json" }, text);
  }

  function useLoad(React, api, action, args, deps) {
    var s = React.useState({ loading: true, data: null, error: "" });
    var tick = React.useState(0);
    var refresh = function () {
      tick[1](tick[0] + 1);
    };
    React.useEffect(
      function () {
        var alive = true;
        s[1]({ loading: true, data: null, error: "" });
        call(api, action, args)
          .then(function (data) {
            if (alive) s[1]({ loading: false, data: data, error: "" });
          })
          .catch(function (e) {
            if (alive) s[1]({ loading: false, data: null, error: errText(e) });
          });
        return function () {
          alive = false;
        };
      },
      (deps || []).concat([tick[0]]),
    );
    return { loading: s[0].loading, data: s[0].data, error: s[0].error, refresh: refresh };
  }

  return {
    unwrap: unwrap,
    call: call,
    errText: errText,
    fmtTime: fmtTime,
    Btn: Btn,
    Field: Field,
    Notice: Notice,
    Empty: Empty,
    Pill: Pill,
    Json: Json,
    useLoad: useLoad,
  };
};
