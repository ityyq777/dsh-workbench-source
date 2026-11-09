// Literal, ASCII-case-insensitive matching like SQLite LIKE; React escapes text.
"use strict";
module.exports = function (React) {
  var h = React.createElement;
  return function Highlight(props) {
    var text = props.text == null ? "" : String(props.text);
    var keyword = props.keyword == null ? "" : String(props.keyword);
    if (!keyword) return text;
    // Escape regex syntax rather than treating a user's search as an expression.
    var pattern = keyword.replace(/[.*+?^$\{\}()|[\]\\]/g, "\\$&");
    // Explicit ASCII pairs avoid JS /i Unicode folding (É/é, Σ/σ) absent in SQLite LIKE.
    pattern = pattern.replace(/[a-zA-Z]/g, function (letter) {
      return "[" + letter.toLowerCase() + letter.toUpperCase() + "]";
    });
    var matcher = new RegExp(pattern, "g"), match, end = 0, parts = [];
    while ((match = matcher.exec(text))) {
      if (match.index > end) parts.push(text.slice(end, match.index));
      parts.push(h("mark", { className: "wbt-hit", key: match.index }, match[0]));
      end = match.index + match[0].length;
    }
    if (!parts.length) return text;
    if (end < text.length) parts.push(text.slice(end));
    return parts;
  };
};
