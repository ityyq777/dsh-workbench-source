// Small, bounded Markdown subset. Cache excludes search highlights; no HTML injection.
"use strict";
var cache = new Map(), cacheChars = 0;
function node(tag, children, props) { return { tag: tag, children: children, props: props || {} }; }
function inline(text, depth) {
  if ((depth || 0) > 8) return [text];
  var out = [], re = /(\\[\\\x60*\[\]#!_>+-]|!?\[[^\[\]\n]+\]\([^\s)\[\]]*\)|\x60[^\x60\n]+\x60|\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g, at = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > at) out.push(text.slice(at, m.index));
    var s = m[0], link = /^\[([^\]]+)\]\(([^)]*)\)$/.exec(s);
    if (s[0] === '\\') out.push(s.slice(1));
    else if (link && /^(https?:\/\/|mailto:)[^\s\u0000-\u001f\u007f]+$/i.test(link[2]))
      out.push(node('a', inline(link[1], (depth || 0) + 1), { href: link[2], target: '_blank', rel: 'noopener noreferrer nofollow' }));
    else if (s[0] === '[' || s[0] === '!') out.push(s);
    else if (s[0] === '\x60') out.push(node('code', [s.slice(1, -1)]));
    else if (s.slice(0, 2) === '**') out.push(node('strong', inline(s.slice(2, -2), (depth || 0) + 1)));
    else out.push(node('em', inline(s.slice(1, -1), (depth || 0) + 1)));
    at = re.lastIndex;
  }
  if (at < text.length) out.push(text.slice(at));
  return out;
}
function blocks(lines, depth) {
  var out = [], i = 0;
  function listMatch(s) { return /^( *)([-+*]|\d+\.) +(.+)$/.exec(s); }
  function special(s) { return /^\s*$|^\x60\x60\x60|^#{1,6} +|^> ?|^\s*(?:---+|\*\*\*+|___+)\s*$/.test(s) || listMatch(s); }
  while (i < lines.length) {
    var line = lines[i], m;
    if (!line.trim()) { i++; continue; }
    if (/^\x60\x60\x60/.test(line)) {
      var end = i + 1;
      while (end < lines.length && !/^\x60\x60\x60\s*$/.test(lines[end])) end++;
      if (end === lines.length) { out.push(node('p', [lines.slice(i).join('\n')])); break; }
      out.push(node('pre', [node('code', [lines.slice(i + 1, end).join('\n')])])); i = end + 1; continue;
    }
    if ((m = /^(#{1,6}) +(.+)$/.exec(line))) { out.push(node('h' + m[1].length, inline(m[2]))); i++; continue; }
    if (/^\s*(?:---+|\*\*\*+|___+)\s*$/.test(line)) { out.push(node('hr', [])); i++; continue; }
    if (/^> ?/.test(line) && depth < 2) {
      var quote = [];
      while (i < lines.length && /^> ?/.test(lines[i])) quote.push(lines[i++].replace(/^> ?/, ''));
      out.push(node('blockquote', blocks(quote, depth + 1))); continue;
    }
    if ((m = listMatch(line)) && depth < 2) {
      var base = m[1].length, ordered = /\d/.test(m[2]), items = [], start = parseInt(m[2], 10);
      while (i < lines.length) {
        m = listMatch(lines[i]);
        if (!m || m[1].length !== base || /\d/.test(m[2]) !== ordered) break;
        var children = inline(m[3]), nested = []; i++;
        while (i < lines.length && (m = listMatch(lines[i])) && m[1].length > base) nested.push(lines[i++].slice(base + 2));
        if (nested.length) children = children.concat(blocks(nested, depth + 1));
        items.push(node('li', children));
      }
      out.push(node(ordered ? 'ol' : 'ul', items, ordered ? { start: start } : {})); continue;
    }
    var paragraph = [line]; i++;
    while (i < lines.length && !special(lines[i])) paragraph.push(lines[i++]);
    var parts = [];
    paragraph.forEach(function (s, j) {
      if (j) parts.push(node('br', []));
      var children = inline(s);
      for (var k = 0; k < children.length; k++) parts.push(children[k]);
    });
    out.push(node('p', parts));
  }
  return out;
}
function parse(text, mode) {
  text = String(text == null ? '' : text); mode = mode === 'text' ? 'text' : 'markdown';
  var key = mode + ':' + text;
  if (cache.has(key)) return cache.get(key);
  var ast = mode === 'text' ? [text] : blocks(text.replace(/\r\n?/g, '\n').split('\n'), 0);
  if (text.length <= 100000) {
    while (cache.size >= 100 || cacheChars + key.length > 1000000) { var first = cache.keys().next().value; cacheChars -= first.length; cache.delete(first); }
    cache.set(key, ast); cacheChars += key.length;
  }
  return ast;
}
function createBody(React, Highlight) {
  var h = React.createElement;
  return function Body(props) {
    function render(items, path) { return items.map(function (item, i) {
      var key = path + '-' + i;
      if (typeof item === 'string') return Highlight ? h(Highlight, { key: key, text: item, keyword: props.keyword }) : item;
      var attrs = Object.assign({ key: key }, item.props);
      // React rejects children on void elements, including an empty array.
      if (item.tag === "br" || item.tag === "hr") return h(item.tag, attrs);
      return h(item.tag, attrs, render(item.children, key));
    }); }
    return h('div', { className: props.mode === 'text' ? 'wb-body-text' : 'wb-markdown' }, render(parse(props.text, props.mode), 'md'));
  };
}
module.exports = { parse: parse, createBody: createBody };
