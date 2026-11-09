// Batch dialog extracted to keep the registration entry below its line budget.
"use strict";
module.exports = function (React, cx, Icon) {
  var h = React.createElement, Picker = require("./table-picker.cjs")(React);
  function BatchModal(props) {
    var t = props.t;
    var items = props.items || [];
    var mode = props.mode;
    var trigger = React.useRef(typeof document === "undefined" ? null : document.activeElement);
    React.useEffect(function () { return function () { if (trigger.current) trigger.current.focus(); }; }, []);
    var s = React.useState(mode === "timeline" ? (items[0] && items[0].id) || "" : "");
    var value = s[0], setValue = s[1];
    var busy = React.useState(false);
    var isBusy = busy[0], setBusy = busy[1];
    var err = React.useState("");
    var error = err[0], setError = err[1];

    var picked = null;
    var rows = [];
    if (mode === "timeline") {
      items.forEach(function (x) {
        if (String(x.id) === String(value)) picked = x;
        rows.push(h("label", { key: x.id, className: cx("wbt-bpick wrap", String(value) === String(x.id) && "on") },
          h("input", { type: "radio", name: "wbt-base", checked: String(value) === String(x.id), onChange: function () { setValue(String(x.id)); } }),
          h("span", { className: "wbt-bpick-main" },
            h("span", { className: "wbt-bpick-name" }, x.title),
            h("span", { className: "wbt-bpick-meta" },
              h("code", { title: x.timelineKey || "" }, "timeline " + (x.timelineKey || "-")),
              x.priority !== undefined ? h("span", null, "P" + x.priority) : null
            )
          ),
          h("span", { className: "wbt-bpick-check" }, String(value) === String(x.id) ? h(Icon, { name: "check", size: 13 }) : null)
        ));
      });
    }

    return h("div", { className: "wbt-modal-mask", onMouseDown: function (e) { if (e.target === e.currentTarget) props.onClose(); } },
      h("div", { className: "wbt-modal batch" },
        h("div", { className: "wbt-modal-head" },
          h("h3", null, mode === "timeline" ? t.batchTimeline : t.batchMigrate),
          h("span", { className: "wbt-badge" }, t.batchCount + " " + items.length),
          h("button", { className: "wbt-icon", onClick: props.onClose }, "×")
        ),
        h("div", { className: "wbt-mhint" }, mode === "timeline" ? t.chooseBase : t.chooseTable),
        mode === "migrate" ? h(Picker, { tree: props.tree, value: value, onChange: setValue, onClose: props.onClose }) : h(React.Fragment, null,
          h("div", { className: "wbt-batch" }, h("div", { className: "wbt-batch-body" }, rows)),
          h("div", { className: "wbt-batch-sel" }, t.baseLabel + "：" + (picked ? picked.title : "-"))),
        error ? h("div", { className: "wbt-err" }, error) : null,
        h("div", { className: "wbt-modal-foot" },
          h("button", { className: "wbt-btn ghost", onClick: props.onClose }, t.cancel),
          h("button", { className: "wbt-btn primary", disabled: isBusy || !value || (mode === "migrate" && !require("./ownership.cjs").tables(props.tree).some(function (n) { return n.id === value; })), onClick: function () {
            if (!value) { setError(mode === "timeline" ? t.needBase : t.needTable); return; }
            setBusy(true);
            if (mode === "timeline") {
              var base = null;
              for (var i = 0; i < items.length; i++) if (String(items[i].id) === String(value)) base = items[i];
              if (!base || !base.timelineKey) { setError(t.needBase); setBusy(false); return; }
              props.api.call("tasks.timelineRefactor", { ids: items.map(function (x) { return x.id; }), timelineKey: base.timelineKey }).then(function (r) {
                setBusy(false);
                if (r && r.ok) props.onDone();
                else setError((r && r.error) || "failed");
              });
            } else {
              props.api.call("tasks.migrate", { ids: items.map(function (x) { return x.id; }), tableId: value }).then(function (r) {
                setBusy(false);
                if (r && r.ok) props.onDone();
                else setError((r && r.error) || "failed");
              });
            }
          } }, isBusy ? "…" : t.confirm)
        )
      )
    );
  }

  return BatchModal;
};
