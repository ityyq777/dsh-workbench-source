"use strict";
/**
 * 插件样式单点注入：把样式模块的返回值规范化后塞进一个 <style>。
 *
 * 为什么需要它：样式模块有两种导出习惯——拼好的字符串，或者字符串数组
 * （`client-base-styles.cjs` 返回数组，很多插件又在数组上 `.concat(...)`）。
 * 直接 `style.textContent = 数组` 会被隐式 `toString()` 成逗号拼接的非法 CSS，
 * 整张样式表只剩第一条规则生效，界面看起来「完全没有样式」。
 * 这个函数统一处理数组/函数/字符串三种形态，并保证同一个 id 只注入一份。
 *
 * 用法：
 *   var injectStyles = require("../../../lib/inject-styles.cjs");
 *   injectStyles({ id: "wb-contacts-style", css: require("./ui/styles.cjs") });
 */
function toCss(value) {
  var v = typeof value === "function" ? value() : value;
  if (Array.isArray(v)) return v.filter(Boolean).join("\n");
  if (v === null || v === undefined) return "";
  return String(v);
}

module.exports = function injectStyles(options) {
  var opts = options || {};
  var css = toCss(opts.css);
  if (typeof document === "undefined" || !document.head) return "";
  var id = opts.id;
  var old = id ? document.getElementById(id) : null;
  if (old) {
    if (old.textContent !== css) old.textContent = css;
    return css;
  }
  var style = document.createElement("style");
  if (id) style.id = id;
  if (opts.addon) style.setAttribute("data-wb-addon", opts.addon);
  style.textContent = css;
  document.head.appendChild(style);
  return css;
};

module.exports.toCss = toCss;
