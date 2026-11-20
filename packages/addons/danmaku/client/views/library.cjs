"use strict";
/**
 * 弹幕库视图：增删改、启停、排序、预览。
 * 版式与其他插件对齐：顶部 hero + 指标卡，下面是「添加」和「清单」两张卡片。
 */
var React = require("react");
var h = React.createElement;
var copy = require("../copy.cjs");

var TONES = ["normal", "accent", "success", "warn", "danger"];
var MAX_LEN = 100;

var ICONS = {
  up: require("lucide-react/icons/arrow-up").default,
  down: require("lucide-react/icons/arrow-down").default,
  eye: require("lucide-react/icons/eye").default,
  trash: require("lucide-react/icons/trash-2").default,
  check: require("lucide-react/icons/check").default,
  x: require("lucide-react/icons/x").default,
  plus: require("lucide-react/icons/plus").default,
  megaphone: require("lucide-react/icons/megaphone").default,
};

function glyph(Icon, size) {
  return h(Icon, { size: size || 14, strokeWidth: 1.8, "aria-hidden": "true" });
}

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

  function kpi(label, value) {
    return h(
      "div",
      { className: "wbdm-kpi", key: label },
      h("div", { className: "wbdm-kpi-v" }, String(value)),
      h("div", { className: "wbdm-kpi-l" }, label),
    );
  }

  var enabledCount = Math.max(0, list.total - list.paused);

  var hero = h(
    "div",
    { className: "wbdm-hero" },
    h(
      "div",
      { className: "wbdm-hero-main" },
      h("div", { className: "wbdm-title" }, C.title),
      h("div", { className: "wbdm-sub" }, C.hint),
    ),
    h(
      "div",
      { className: "wbdm-kpis" },
      kpi(C.kpiTotal, list.total),
      kpi(C.kpiEnabled, enabledCount),
      kpi(C.kpiPaused, list.paused),
    ),
  );

  function toneChip(key) {
    return h(
      "button",
      {
        key: key,
        type: "button",
        className: "wbdm-tone" + (tone === key ? " on" : ""),
        onClick: function () {
          setTone(key);
        },
      },
      h("span", { className: "wbdm-dot " + key }),
      C.tones[key],
    );
  }

  var compose = h(
    "div",
    { className: "wbdm-card" },
    h("div", { className: "wbdm-card-h" }, h("span", { className: "wbdm-card-t" }, C.add)),
    h(
      "div",
      { className: "wbdm-compose" },
      h("textarea", {
        className: "wbdm-textarea",
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
        { className: "wbdm-compose-bar" },
        h(
          "div",
          { className: "wbdm-tones" },
          h("span", { className: "wbdm-tone-label" }, C.tone),
          TONES.map(toneChip),
        ),
        h("span", { className: "wbdm-counter" }, copy.fmt(C.charCount, { n: draft.length })),
        h(
          "button",
          {
            type: "button",
            className: "wbdm-btn primary",
            disabled: Boolean(busy) || !draft.trim(),
            onClick: submitCreate,
          },
          glyph(ICONS.plus),
          busy === "create" ? C.adding : C.add,
        ),
      ),
    ),
  );

  var empty = h(
    "div",
    { className: "wbdm-empty-card" },
    h("span", { className: "wbdm-empty-icon" }, glyph(ICONS.megaphone, 17)),
    h("div", null, C.empty),
    h("div", null, C.addPlaceholder),
  );

  var rows = list.items.map(function (item, index) {
    var editing = edit.id === item.id;
    var bodyCell = editing
      ? h("input", {
          className: "wbdm-item-edit",
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

    var ops = editing
      ? [
          h(
            "button",
            {
              key: "save",
              type: "button",
              className: "wbdm-icon-btn",
              title: C.save,
              "aria-label": C.save,
              onClick: function () {
                saveEdit(item);
              },
            },
            glyph(ICONS.check),
          ),
          h(
            "button",
            {
              key: "cancel",
              type: "button",
              className: "wbdm-icon-btn",
              title: C.cancel,
              "aria-label": C.cancel,
              onClick: function () {
                setEdit({ id: "", text: "" });
              },
            },
            glyph(ICONS.x),
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
              disabled: index === 0,
              onClick: function () {
                move(index, -1);
              },
            },
            glyph(ICONS.up),
          ),
          h(
            "button",
            {
              key: "down",
              type: "button",
              className: "wbdm-icon-btn",
              title: C.moveDown,
              "aria-label": C.moveDown,
              disabled: index === list.items.length - 1,
              onClick: function () {
                move(index, 1);
              },
            },
            glyph(ICONS.down),
          ),
          h(
            "button",
            {
              key: "eye",
              type: "button",
              className: "wbdm-icon-btn",
              title: C.preview,
              "aria-label": C.preview,
              onClick: function () {
                preview(item);
              },
            },
            glyph(ICONS.eye),
          ),
          h(
            "button",
            {
              key: "edit",
              type: "button",
              className: "wbdm-icon-btn",
              title: C.edit,
              "aria-label": C.edit,
              onClick: function () {
                startEdit(item);
              },
            },
            glyph(require("lucide-react/icons/pencil").default),
          ),
          h(
            "button",
            {
              key: "del",
              type: "button",
              className: "wbdm-icon-btn danger",
              title: C.remove,
              "aria-label": C.remove,
              onClick: function () {
                remove(item);
              },
            },
            glyph(ICONS.trash),
          ),
        ];

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
        h("span", { className: "wbdm-track" }),
        h("span", { className: "wbdm-knob" }),
      ),
      h(
        "span",
        { className: "wbdm-tag" },
        h("span", { className: "wbdm-dot " + (item.tone || "normal") }),
        C.tones[item.tone] || item.tone,
      ),
      bodyCell,
      h("div", { className: "wbdm-ops" }, ops),
    );
  });

  var listCard = h(
    "div",
    { className: "wbdm-card" },
    h(
      "div",
      { className: "wbdm-card-h" },
      h("span", { className: "wbdm-card-t" }, C.tabs.library),
      h(
        "span",
        { className: "wbdm-card-s" },
        copy.fmt(C.stats, { total: list.total, enabled: enabledCount, paused: list.paused }),
      ),
    ),
    list.loading
      ? h("div", { className: "wbdm-empty" }, C.loading)
      : list.error
        ? h(
            "div",
            { className: "wbdm-notice error" },
            list.error,
            " ",
            h(
              "button",
              {
                type: "button",
                className: "wbdm-link",
                onClick: function () {
                  refresh();
                },
              },
              C.retry,
            ),
          )
        : list.items.length
          ? h("div", { className: "wbdm-list" }, rows)
          : empty,
  );

  return h(
    "div",
    { className: "wbdm-wrap" },
    hero,
    say ? h("div", { className: "wbdm-notice ok" }, say) : null,
    compose,
    listCard,
  );
}

module.exports = LibraryView;
