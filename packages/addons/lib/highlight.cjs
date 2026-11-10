"use strict";
// 共享关键词高亮：按字面量匹配、只折叠 ASCII 大小写（与 SQLite LIKE 口径一致），
// 命中片段包成 <mark class="<prefix>-hit">，由调用方在自己的样式表里给这个类配色。
// 使用方：任务记录页 / 时间线页（prefix=wbt）与四个插件的 Action 页（prefix=<插件前缀>-as）。
// 只做渲染，不参与过滤：过滤的 haystack 由调用方决定，两边口径必须一致。
//
// createHighlight(prefix) 返回 Highlight 组件；同一函数上挂着 Highlight.hit(text, keyword)，
// 供需要「直接取片段」的场景（同步渲染的视图测试）调用，两者共用一套匹配规则。
module.exports = function (React) {
  var h = React.createElement;

  /** 把用户输入编译成「字面量 + 显式 ASCII 大小写对」的正则源，避免把搜索词当表达式。 */
  function sourceOf(keyword) {
    var pattern = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // 显式 ASCII 对避免 JS /i 的 Unicode 折叠（É/é、Σ/σ），SQLite LIKE 不做这种折叠。
    return pattern.replace(/[a-zA-Z]/g, function (letter) {
      return "[" + letter.toLowerCase() + letter.toUpperCase() + "]";
    });
  }

  /**
   * @param {string} prefix 类名前缀，如 "wbt" → mark 的 className 为 "wbt-hit"
   * @returns {Function} Highlight 组件，附带 .hit(text, keyword) 纯渲染函数
   */
  return function createHighlight(prefix) {
    var className = String(prefix || "wb") + "-hit";

    /** text 与 keyword 都转字符串；keyword 为空或没有命中时原样返回 text。 */
    function hit(rawText, rawKeyword) {
      var text = rawText == null ? "" : String(rawText);
      var keyword = rawKeyword == null ? "" : String(rawKeyword);
      if (!keyword) return text;
      var matcher, match, end = 0, parts = [];
      try {
        matcher = new RegExp(sourceOf(keyword), "g");
      } catch (error) {
        // 理论上不会触发（输入已转义）；退化成本文字符串，不阻断渲染。
        return text;
      }
      while ((match = matcher.exec(text))) {
        if (match.index > end) parts.push(text.slice(end, match.index));
        parts.push(h("mark", { className: className, key: match.index }, match[0]));
        end = match.index + match[0].length;
        if (!match[0]) matcher.lastIndex += 1;
      }
      if (!parts.length) return text;
      if (end < text.length) parts.push(text.slice(end));
      return parts;
    }

    function Highlight(props) {
      return hit(props.text, props.keyword);
    }
    Highlight.hit = hit;
    return Highlight;
  };
};
