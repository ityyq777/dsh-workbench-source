"use strict";
/**
 * 全插件唯一的数字输入控件。
 *
 * 以前各插件直接写 `<input type="number" min=… max=…>`，还常常「每次按键就保存」，
 * 后端再把值静默夹回边界，于是用户刚打到第三位就被换回 1 或 500，完全没法输入。
 *
 * 这里的原则是「输入自由、校验后置」：
 *   1. 用 `type="text"` + `inputMode`，丢掉原生步进箭头和 min/max 回灌；
 *   2. 范围只作为提示文字显示，不限制键入；
 *   3. 非法或越界时显示红字，并且**不改写**用户输入，也不提交给 onCommit；
 *   4. 只在失焦 / 回车时提交一次合法值，避免半截数字被保存。
 *
 * 类名固定为 `wbctl-num*`（与插件 CSS 前缀无关，避免再被复制成带前缀的私有类）。
 *
 * 使用方式：
 *   var NF = require("../../../lib/number-field.cjs");
 *   h(NF.NumberField, { h: h, lang: lang, value: value, min: 1, max: 500, integer: true,
 *                       onCommit: function (next) { save(id, next); } })
 * 并把 NF.styles 追加进插件样式表（重复追加无害，规则完全一致）。
 *
 * 纯校验逻辑（表单整体校验、测试、后端同规则提示）用 `validateNumber(raw, opts)`。
 */
var React = require("react");

var NUM = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;

var TEXT = {
  zh: {
    required: "请填写数字",
    invalid: "请输入数字",
    integer: "需要是整数",
    min: "不能小于 {min}",
    max: "不能大于 {max}",
    range: "需要在 {min}–{max} 之间",
    step: "需要是 {step} 的倍数",
    unit: "单位",
  },
  en: {
    required: "Please enter a number",
    invalid: "Please enter a number",
    integer: "Must be a whole number",
    min: "Must be at least {min}",
    max: "Must be at most {max}",
    range: "Must be between {min} and {max}",
    step: "Must be a multiple of {step}",
    unit: "unit",
  },
};

function messages(lang) {
  return lang === "en" ? TEXT.en : TEXT.zh;
}

function fill(text, vars) {
  return String(text).replace(/\{(\w+)\}/g, function (m, key) {
    return vars && vars[key] !== undefined ? String(vars[key]) : m;
  });
}

/**
 * 校验一个原始输入串。
 * opts: { min, max, step, integer, allowEmpty, lang }
 * 返回 { ok, value, error }；ok=false 时 value 为 null，error 是可直接展示的文案。
 */
function validateNumber(raw, opts) {
  var o = opts || {};
  var M = messages(o.lang);
  var text = raw === null || raw === undefined ? "" : String(raw).trim();
  if (text === "") {
    return o.allowEmpty ? { ok: true, value: null, error: "" } : { ok: false, value: null, error: M.required };
  }
  if (!NUM.test(text)) return { ok: false, value: null, error: M.invalid };
  var n = Number(text);
  if (!isFinite(n)) return { ok: false, value: null, error: M.invalid };
  if (o.integer && Math.round(n) !== n) return { ok: false, value: null, error: M.integer };
  var hasMin = o.min !== undefined && o.min !== null && o.min !== "";
  var hasMax = o.max !== undefined && o.max !== null && o.max !== "";
  if (hasMin && hasMax && n >= o.min && n <= o.max) {
    // 在范围内，继续检查步长
  } else if (hasMin && hasMax) {
    return { ok: false, value: null, error: fill(M.range, { min: o.min, max: o.max }) };
  } else if (hasMin && n < o.min) {
    return { ok: false, value: null, error: fill(M.min, { min: o.min }) };
  } else if (hasMax && n > o.max) {
    return { ok: false, value: null, error: fill(M.max, { max: o.max }) };
  }
  if (o.step && Number(o.step) > 0) {
    var q = n / Number(o.step);
    if (Math.abs(q - Math.round(q)) > 1e-9) {
      return { ok: false, value: null, error: fill(M.step, { step: o.step }) };
    }
  }
  return { ok: true, value: n, error: "" };
}

/** 把 min/max/step 渲染成一句范围提示，例如「1–500，整数」。 */
function rangeHint(opts, lang) {
  var o = opts || {};
  var M = messages(lang);
  var en = lang === "en";
  var hasMin = o.min !== undefined && o.min !== null && o.min !== "";
  var hasMax = o.max !== undefined && o.max !== null && o.max !== "";
  var parts = [];
  if (hasMin && hasMax) parts.push(String(o.min) + "–" + String(o.max));
  else if (hasMin) parts.push((en ? "≥ " : "≥ ") + String(o.min));
  else if (hasMax) parts.push((en ? "≤ " : "≤ ") + String(o.max));
  if (o.integer) parts.push(en ? "whole numbers" : "整数");
  else if (o.step && Number(o.step) > 0) parts.push((en ? "step " : "步长 ") + String(o.step));
  return parts.join(en ? ", " : "，");
}

function NumberField(props) {
  var h = props.h || React.createElement;
  var lang = props.lang;
  var M = messages(lang);
  var text = props.value === null || props.value === undefined ? "" : String(props.value);
  var draftS = React.useState(text);
  var draft = draftS[0];
  var setDraft = draftS[1];
  var focusS = React.useState(false);
  var focused = focusS[0];
  var setFocused = focusS[1];
  var errS = React.useState("");
  var err = errS[0];
  var setErr = errS[1];
  var lastRef = React.useRef(text);
  // Esc 撤销时用这个标记跳过紧随其后的 blur 提交（否则会把撤销前的草稿又提交一次）。
  var skipBlurRef = React.useRef(false);

  // 外部值变化（保存成功、切换条目）时回填；正在输入时不动，避免光标跳走。
  React.useEffect(
    function () {
      if (focused) return;
      if (lastRef.current === text) return;
      lastRef.current = text;
      setDraft(text);
      setErr("");
    },
    [text, focused]
  );

  function commit(raw) {
    var r = validateNumber(raw, props);
    if (!r.ok) {
      setErr(r.error);
      if (typeof props.onValidChange === "function") props.onValidChange(false, r.error);
      return false;
    }
    setErr("");
    if (typeof props.onValidChange === "function") props.onValidChange(true, "");
    var cur = props.value === null || props.value === undefined ? null : Number(props.value);
    if (r.value !== cur) {
      lastRef.current = r.value === null ? "" : String(r.value);
      if (typeof props.onCommit === "function") props.onCommit(r.value);
    }
    return true;
  }

  var hint = props.hint !== undefined ? props.hint : rangeHint(props, lang);
  var shown = props.hint === false ? "" : hint;

  return h(
    "span",
    { className: "wbctl-num" + (props.wide ? " is-wide" : "") + (props.className ? " " + props.className : "") },
    h(
      "span",
      { className: "wbctl-num-box" },
      h("input", {
        className: "wbctl-num-input" + (err ? " is-invalid" : ""),
        type: "text",
        inputMode: props.integer || Number(props.step) === 1 ? "numeric" : "decimal",
        value: draft,
        disabled: !!props.disabled,
        placeholder: props.placeholder,
        title: props.title,
        "aria-label": props.ariaLabel,
        "aria-invalid": err ? "true" : undefined,
        onFocus: function () {
          setFocused(true);
        },
        onChange: function (e) {
          setDraft(e.target.value);
          if (err) setErr("");
          if (typeof props.onDraft === "function") props.onDraft(e.target.value);
        },
        onBlur: function () {
          setFocused(false);
          if (skipBlurRef.current) {
            skipBlurRef.current = false;
            return;
          }
          // 回车分支只负责失焦，提交统一在 onBlur 里做一次，避免重复保存。
          commit(draft);
        },
        onKeyDown: function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            if (e.target && e.target.blur) e.target.blur();
          } else if (e.key === "Escape") {
            e.preventDefault();
            skipBlurRef.current = true;
            setDraft(text);
            setErr("");
            if (e.target && e.target.blur) e.target.blur();
          }
        },
      }),
      props.unit ? h("span", { className: "wbctl-num-unit" }, props.unit) : null
    ),
    err
      ? h("span", { className: "wbctl-num-err", role: "alert" }, err)
      : shown
        ? h("span", { className: "wbctl-num-hint" }, shown)
        : null
  );
}

var NUMBER_STYLES = [
  ".wbctl-num{display:inline-flex;flex-direction:column;gap:3px;min-width:0;max-width:100%}",
  ".wbctl-num.is-wide{display:flex;width:100%}",
  ".wbctl-num-box{display:inline-flex;align-items:center;gap:6px;min-width:0}",
  ".wbctl-num-input{box-sizing:border-box;width:96px;min-width:0;padding:6px 9px;border:1px solid var(--wb-line,rgba(127,127,127,.35));border-radius:6px;background:var(--wb-surface,var(--wb-card,transparent));color:inherit;font:inherit;font-size:13px;font-variant-numeric:tabular-nums;transition:border-color .14s ease,outline-color .14s ease}",
  ".wbctl-num-input:hover:not(:disabled){border-color:var(--wb-border,var(--wb-line))}",
  ".wbctl-num-input:focus{outline:2px solid color-mix(in oklab,var(--wb-accent,#2563eb) 55%,transparent);outline-offset:1px;border-color:var(--wb-accent,#2563eb)}",
  ".wbctl-num-input.is-invalid{border-color:var(--wb-danger,#dc2626)}",
  ".wbctl-num-input.is-invalid:focus{outline-color:color-mix(in oklab,var(--wb-danger,#dc2626) 55%,transparent)}",
  ".wbctl-num-input:disabled{opacity:.5;cursor:not-allowed}",
  ".wbctl-num-unit{color:var(--wb-muted,inherit);font-size:12px;white-space:nowrap}",
  ".wbctl-num-hint{color:var(--wb-muted,inherit);font-size:11px;line-height:1.4}",
  ".wbctl-num-err{color:var(--wb-danger,#dc2626);font-size:11px;line-height:1.4}",
  "@media (prefers-reduced-motion:reduce){.wbctl-num-input{transition:none}}",
];

module.exports = {
  NumberField: NumberField,
  validateNumber: validateNumber,
  rangeHint: rangeHint,
  messages: messages,
  styles: NUMBER_STYLES,
};
