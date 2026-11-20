"use strict";
/**
 * 弹幕详情面板：单条弹幕自己的内容、外观、动效与轮播参数。
 * 由 library.cjs 调用，props 里带当前草稿与写回函数，本文件不直接访问 api。
 */
var React = require("react");
var h = React.createElement;

var TONES = ["normal", "accent", "success", "warn", "danger"];

var ICONS = {
  x: require("lucide-react/icons/x").default,
  eye: require("lucide-react/icons/eye").default,
};

function glyph(Icon, size) {
  return h(Icon, { size: size || 14, strokeWidth: 1.8, "aria-hidden": "true" });
}

function numberOrText(value) {
  return value === null || value === undefined ? "" : String(value);
}

module.exports = function renderDetail(props) {
  var C = props.C;
  var detail = props.detail;
  var patch = props.patch;
  var busy = props.busy;

  function set(key, value) {
    var next = {};
    next[key] = value;
    patch(next);
  }

  function toneChip(name) {
    return h(
      "button",
      {
        key: name,
        type: "button",
        className: "wbdm-tone-chip" + (detail.tone === name ? " on" : ""),
        onClick: function () {
          set("tone", name);
        },
      },
      h("span", { className: "wbdm-dot " + name }),
      C.tones[name],
    );
  }

  function numField(key, label, hint, step, min, max) {
    return h(
      "label",
      { className: "wbdm-crow" },
      h(
        "span",
        { className: "wbdm-crow-label" },
        h("span", { className: "wbdm-crow-t" }, label),
        h("span", { className: "wbdm-crow-h" }, hint),
      ),
      h("input", {
        className: "wbdm-input",
        type: "number",
        value: numberOrText(detail[key]),
        min: min,
        max: max,
        step: step,
        placeholder: C.followGlobal,
        onChange: function (e) {
          set(key, e.target.value);
        },
      }),
    );
  }

  function selectField(key, label, options, hint) {
    return h(
      "label",
      { className: "wbdm-crow" },
      h(
        "span",
        { className: "wbdm-crow-label" },
        h("span", { className: "wbdm-crow-t" }, label),
        hint ? h("span", { className: "wbdm-crow-h" }, hint) : null,
      ),
      h(
        "select",
        {
          className: "wbdm-select",
          value: detail[key],
          onChange: function (e) {
            set(key, e.target.value);
          },
        },
        options.map(function (option) {
          return h("option", { key: option.value, value: option.value }, option.label);
        }),
      ),
    );
  }

  function switchField(key, label) {
    return h(
      "label",
      { className: "wbdm-crow" },
      h("span", { className: "wbdm-crow-label" }, h("span", { className: "wbdm-crow-t" }, label)),
      h(
        "span",
        { className: "wbdm-switch" },
        h("input", {
          type: "checkbox",
          checked: Boolean(detail[key]),
          onChange: function () {
            set(key, !detail[key]);
          },
        }),
        h("span", { className: "wbdm-track" }),
        h("span", { className: "wbdm-knob" }),
      ),
    );
  }

  var weights = [{ value: "", label: C.followGlobal }];
  [400, 500, 600, 700].forEach(function (value) {
    weights.push({ value: String(value), label: C.weights[value] });
  });

  var families = Object.keys(C.families).map(function (value) {
    return { value: value, label: C.families[value] };
  });

  var bands = ["", "full", "upper", "lower"].map(function (value) {
    return { value: value, label: C.bands[value] };
  });

  var chances = [1, 2, 3, 4, 5].map(function (n) {
    return { value: String(n), label: "×" + n };
  });

  return h(
    "div",
    {
      className: "wbdm-modal",
      onClick: function (e) {
        if (e.target === e.currentTarget) props.cancel();
      },
    },
    h(
      "div",
      { className: "wbdm-modal-card", role: "dialog", "aria-label": C.detailTitle },
      h(
        "div",
        { className: "wbdm-modal-h" },
        h(
          "div",
          null,
          h("div", { className: "wbdm-modal-t" }, C.detailTitle),
          h("div", { className: "wbdm-modal-s" }, C.detailHint),
        ),
        h(
          "button",
          {
            type: "button",
            className: "wbdm-icon-btn",
            title: C.cancel,
            "aria-label": C.cancel,
            onClick: props.cancel,
          },
          glyph(ICONS.x, 15),
        ),
      ),
      h(
        "div",
        { className: "wbdm-modal-body" },
        h(
          "section",
          { className: "wbdm-section" },
          h("div", { className: "wbdm-section-t" }, C.sectionContent),
          h("textarea", {
            className: "wbdm-textarea",
            value: detail.body,
            maxLength: 100,
            rows: 2,
            onChange: function (e) {
              set("body", e.target.value);
            },
          }),
          h("div", { className: "wbdm-counter" }, String(detail.body.length) + "/100"),
        ),
        h(
          "section",
          { className: "wbdm-section" },
          h("div", { className: "wbdm-section-t" }, C.sectionLook),
          h(
            "div",
            { className: "wbdm-crow" },
            h("span", { className: "wbdm-crow-label" }, h("span", { className: "wbdm-crow-t" }, C.tone)),
            h("div", { className: "wbdm-tones" }, TONES.map(toneChip)),
          ),
          h(
            "label",
            { className: "wbdm-crow" },
            h(
              "span",
              { className: "wbdm-crow-label" },
              h("span", { className: "wbdm-crow-t" }, C.card),
              h("span", { className: "wbdm-crow-h" }, C.cardHint),
            ),
            h(
              "span",
              { className: "wbdm-switch" },
              h("input", {
                type: "checkbox",
                checked: Boolean(detail.card),
                onChange: function () {
                  set("card", !detail.card);
                },
              }),
              h("span", { className: "wbdm-track" }),
              h("span", { className: "wbdm-knob" }),
            ),
          ),
          numField("fontSize", C.fontSize, C.unitPx + " · " + C.followGlobal, 1, 10, 48),
          selectField("fontWeight", C.weight, weights),
          selectField("fontFamily", C.family, families),
          numField("opacity", C.opacity, "0.15–1 · " + C.followGlobal, 0.02, 0.15, 1),
        ),
        h(
          "section",
          { className: "wbdm-section" },
          h("div", { className: "wbdm-section-t" }, C.sectionMotion),
          numField("speed", C.speed, C.unitSpeed + " · " + C.followGlobal, 10, 30, 800),
          selectField("band", C.band, bands, C.bandHint),
        ),
        h(
          "section",
          { className: "wbdm-section" },
          h("div", { className: "wbdm-section-t" }, C.sectionRotate),
          h(
            "label",
            { className: "wbdm-crow" },
            h(
              "span",
              { className: "wbdm-crow-label" },
              h("span", { className: "wbdm-crow-t" }, C.prefix),
              h("span", { className: "wbdm-crow-h" }, C.prefixHint),
            ),
            h("input", {
              className: "wbdm-input",
              type: "text",
              value: detail.prefix,
              maxLength: 8,
              placeholder: "✨",
              onChange: function (e) {
                set("prefix", e.target.value);
              },
            }),
          ),
          selectField("chance", C.chance, chances, C.chanceHint),
          switchField("enabled", C.enable),
        ),
      ),
      h(
        "div",
        { className: "wbdm-modal-foot" },
        h(
          "button",
          {
            type: "button",
            className: "wbdm-btn ghost",
            onClick: props.cancel,
          },
          C.cancel,
        ),
        h(
          "button",
          {
            type: "button",
            className: "wbdm-btn",
            disabled: Boolean(busy),
            onClick: function () {
              props.save(true);
            },
          },
          glyph(ICONS.eye),
          C.saveAndPreview,
        ),
        h(
          "button",
          {
            type: "button",
            className: "wbdm-btn primary",
            disabled: Boolean(busy) || !detail.body.trim(),
            onClick: function () {
              props.save(false);
            },
          },
          busy ? C.saving : C.saveDetail,
        ),
      ),
    ),
  );
};
