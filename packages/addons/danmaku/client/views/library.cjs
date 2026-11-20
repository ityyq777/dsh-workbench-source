"use strict";
/**
 * 弹幕库视图：增删改、启停、排序、预览。
 * 交互参考标签插件：行内编辑、二次确认删除、写入后重新拉取权威列表。
 */
var React = require("react");
var h = React.createElement;
var copy = require("../copy.cjs");

var TONES = ["normal", "accent", "success", "warn", "danger"];
var MAX_LEN = 100;

function unwrap(r) {
  return r && r.result !== undefined ? r.result : r;
}

function errText(e, fallback) {
  return String((e && e.message) || e || fallback);
}

function payloadOf(r) {
  if (!r) throw new Error("empty response");
  if (r.ok === false) throw new Error(r.error || "request failed");
  return unwrap(r);
}

function LibraryView(props) {
  var api = props.api;
  var lang = props.lang;
  var C = copy.pick(lang);

  var listS = React.useState({ loading: true, error: "", items: [], total: 0, paused: 0 });
  var list = listS[0];
  var setList = listS[1];

  var draftS = React.useState("");
  var draft = draftS[0];
  var setDraft = draftS[1];

  var toneS = React.useState("normal");
  var tone = toneS[0];
  var setTone = toneS[1];

  var busyS = React.useState("");
  var busy = busyS[0];
  var setBusy = busyS[1];

  var editS = React.useState({ id: "", text: "" });
  var edit = editS[0];
  var setEdit = editS[1];

  var sayS = React.useState("");
  var say = sayS[0];
  var setSay = sayS[1];

  var aliveRef = React.useRef(true);

  function notify(text) {
    setSay(text);
    window.setTimeout(function () {
      if (aliveRef.current) setSay("");
    }, 2400);
  }

  var refresh = React.useCallback(function () {
    return api
      .call("danmaku.list", {})
      .then(payloadOf)
      .then(function (body) {
        if (!aliveRef.current) return;
        setList({
          loading: false,
          error: "",
          items: (body && body.items) || [],
          total: (body && body.total) || 0,
          paused: (body && body.paused) || 0,
        });
      })
      .catch(function (e) {
        if (!aliveRef.current) return;
        setList(function (prev) {
          return Object.assign({}, prev, { loading: false, error: errText(e, C.loadFail) });
        });
      });
  }, [api]);

  React.useEffect(function () {
    aliveRef.current = true;
    refresh();
    var off = null;
    if (api && typeof api.subscribe === "function") {
      off = api.subscribe(function (message) {
        if (message && message.domainId === "wb-addon-danmaku") refresh();
      });
    }
    return function () {
      aliveRef.current = false;
      if (typeof off === "function") off();
    };
  }, [refresh]);

  function act(name, args, after) {
    setBusy(name);
    return api
      .call("danmaku." + name, args || {})
      .then(payloadOf)
      .then(function (body) {
        if (typeof after === "function") after(body);
        return refresh();
      })
      .catch(function (e) {
        notify(errText(e, C.loadFail));
      })
      .then(function () {
        if (aliveRef.current) setBusy("");
      });
  }

  function submitCreate() {
    var text = draft.trim();
    if (!text) return;
    act("create", { body: text, tone: tone }, function () {
      setDraft("");
      notify(C.added);
    });
  }

  function startEdit(item) {
    setEdit({ id: item.id, text: item.body });
  }

  function saveEdit(item) {
    var text = edit.text.trim();
    if (!text) return;
    act("update", { id: item.id, body: text }, function () {
      setEdit({ id: "", text: "" });
      notify(C.saved);
    });
  }

  function toggle(item) {
    act("update", { id: item.id, enabled: !item.enabled });
  }

  function remove(item) {
    if (!window.confirm(C.confirmRemove)) return;
    act("remove", { id: item.id }, function () {
      notify(C.removed);
    });
  }

  function move(index, delta) {
    var items = list.items.slice();
    var target = index + delta;
    if (target < 0 || target >= items.length) return;
    var moved = items.splice(index, 1)[0];
    items.splice(target, 0, moved);
    setList(Object.assign({}, list, { items: items }));
    act("reorder", {
      ids: items.map(function (item) {
        return item.id;
      }),
    });
  }

  function preview(item) {
    act("preview", { id: item.id }, function () {
      notify(C.previewing);
    });
  }

  var header = h(
    "div",
    { className: "wbdm-head" },
    h("div", { className: "wbdm-title" }, C.title),
    h("div", { className: "wbdm-sub" }, C.hint),
  );

  var stats = h(
    "div",
    { className: "wbdm-muted" },
    copy.fmt(C.stats, { total: list.total, enabled: list.total - list.paused, paused: list.paused }),
  );

  var compose = h(
    "div",
    { className: "wbdm-compose" },
    h("textarea", {
      className: "wbdm-field",
      value: draft,
      maxLength: MAX_LEN,
      placeholder: C.addPlaceholder,
      rows: 2,
      onChange: function (e) {
        setDraft(e.target.value);
      },
      onKeyDown: function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (!busy) submitCreate();
        }
      },
    }),
    h(
      "div",
      { className: "wbdm-actions" },
      h("span", { className: "wbdm-counter" }, copy.fmt(C.charCount, { n: draft.length })),
      h(
        "select",
        {
          className: "wbdm-select",
          value: tone,
          "aria-label": C.tone,
          onChange: function (e) {
            setTone(e.target.value);
          },
        },
        TONES.map(function (key) {
          return h("option", { key: key, value: key }, C.tones[key]);
        }),
      ),
      h(
        "button",
        {
          type: "button",
          className: "wbdm-btn primary",
          disabled: Boolean(busy) || !draft.trim(),
          onClick: submitCreate,
        },
        busy === "create" ? C.adding : C.add,
      ),
    ),
  );

  var rows = list.items.map(function (item, index) {
    var editing = edit.id === item.id;
    var bodyCell = editing
      ? h("input", {
          className: "wbdm-input",
          value: edit.text,
          maxLength: MAX_LEN,
          autoFocus: true,
          onChange: function (e) {
            setEdit({ id: item.id, text: e.target.value });
          },
          onKeyDown: function (e) {
            if (e.key === "Enter") saveEdit(item);
            if (e.key === "Escape") setEdit({ id: "", text: "" });
          },
        })
      : h("span", { className: "wbdm-body", title: item.body }, item.body);

    return h(
      "div",
      { key: item.id, className: "wbdm-item" + (item.enabled ? "" : " off") },
      h("span", { className: "wbdm-order" }, String(index + 1)),
      h(
        "label",
        { className: "wbdm-switch", title: item.enabled ? C.disable : C.enable },
        h("input", {
          type: "checkbox",
          checked: Boolean(item.enabled),
          onChange: function () {
            toggle(item);
          },
        }),
      ),
      h("span", { className: "wbdm-pill wbdm-tone-" + (item.tone || "normal") }, C.tones[item.tone] || item.tone),
      bodyCell,
      h(
        "div",
        { className: "wbdm-actions" },
        editing
          ? [
              h(
                "button",
                {
                  key: "save",
                  type: "button",
                  className: "wbdm-btn primary",
                  onClick: function () {
                    saveEdit(item);
                  },
                },
                C.save,
              ),
              h(
                "button",
                {
                  key: "cancel",
                  type: "button",
                  className: "wbdm-btn",
                  onClick: function () {
                    setEdit({ id: "", text: "" });
                  },
                },
                C.cancel,
              ),
            ]
          : [
              h(
                "button",
                {
                  key: "up",
                  type: "button",
                  className: "wbdm-icon-btn",
                  title: C.moveUp,
                  "aria-label": C.moveUp,
                  disabled: index === 0 || Boolean(busy),
                  onClick: function () {
                    move(index, -1);
                  },
                },
                "\u2191",
              ),
              h(
                "button",
                {
                  key: "down",
                  type: "button",
                  className: "wbdm-icon-btn",
                  title: C.moveDown,
                  "aria-label": C.moveDown,
                  disabled: index === list.items.length - 1 || Boolean(busy),
                  onClick: function () {
                    move(index, 1);
                  },
                },
                "\u2193",
              ),
              h(
                "button",
                {
                  key: "edit",
                  type: "button",
                  className: "wbdm-btn",
                  onClick: function () {
                    startEdit(item);
                  },
                },
                C.edit,
              ),
              h(
                "button",
                {
                  key: "preview",
                  type: "button",
                  className: "wbdm-btn",
                  disabled: Boolean(busy),
                  onClick: function () {
                    preview(item);
                  },
                },
                C.preview,
              ),
              h(
                "button",
                {
                  key: "remove",
                  type: "button",
                  className: "wbdm-btn danger",
                  disabled: Boolean(busy),
                  onClick: function () {
                    remove(item);
                  },
                },
                C.remove,
              ),
            ],
      ),
    );
  });

  var content;
  if (list.loading) content = h("div", { className: "wbdm-empty" }, C.loading);
  else if (list.error) {
    content = h(
      "div",
      { className: "wbdm-notice error" },
      list.error,
      h(
        "button",
        {
          type: "button",
          className: "wbdm-btn",
          style: { marginLeft: 8 },
          onClick: refresh,
        },
        C.retry,
      ),
    );
  } else if (!list.items.length) content = h("div", { className: "wbdm-empty" }, C.empty);
  else content = h("div", { className: "wbdm-list" }, rows);

  return h(
    "div",
    { className: "wbdm-wrap wbdm-lib" },
    header,
    stats,
    compose,
    say ? h("div", { className: "wbdm-notice ok" }, say) : null,
    content,
  );
}

module.exports = LibraryView;
