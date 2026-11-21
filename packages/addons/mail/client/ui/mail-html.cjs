"use strict";
/**
 * 邮件 HTML 正文渲染：白名单清洗 + 沙箱 iframe 隔离排版 + 内联图（cid）走本地附件通道 + 远程图片按需加载。
 * 安全边界有两层：这里的字符串清洗只做收敛，真正的兜底是 iframe 的 sandbox（不给 allow-scripts）
 * 与文档内 CSP（default-src 'none'），所以即使清洗漏掉脚本，邮件脚本也不会在宿主里执行。
 */
var C = require("./common.cjs");

/** 连同内容一起丢弃的标签：脚本、嵌套文档、可执行插件、以及不参与排版的容器。 */
var SKIP_CONTENT = ["script", "iframe", "object", "applet", "svg", "math", "template", "noscript", "canvas", "audio", "video", "form", "select", "textarea", "button"];
/** 没有闭合标签、只丢自身标签的可执行/表单控件。 */
var SKIP_VOID = ["input", "embed", "keygen"];
/** 只丢标签、保留内部的标签（外链样式表、base、meta 刷新等）。 */
var VOID_DROP = ["link", "meta", "base", "frame", "frameset", "area", "source", "track", "col", "colgroup"];
/** 自闭合标签，输出时补 "/"。 */
var VOID_KEEP = ["br", "hr", "img", "wbr"];
var PLACEHOLDER = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
var MAX_INLINE_BYTES = 8 * 1024 * 1024;

var TOKEN = /<!--[\s\S]*?-->|<![^>]*>|<\?[^>]*\?>|<\/?([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*?)\/?>/g;
var ATTR = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

function attrValue(m) {
  return m[3] != null ? m[3] : m[4] != null ? m[4] : m[5] != null ? m[5] : "";
}
function isHttp(url) {
  return /^\s*(?:https?|\/\/)/i.test(url);
}
function safeUrl(url, kind) {
  var v = String(url || "").replace(/[\u0000-\u001f\u007f]/g, "").trim();
  if (!v) return "";
  if (/^javascript:/i.test(v) || /^data:/i.test(v) && !/^data:image\//i.test(v) && kind !== "href") return "";
  if (/^(?:https?:|mailto:)/i.test(v)) return v;
  if (/^cid:/i.test(v)) return v;
  if (/^data:image\//i.test(v)) return v;
  if (/^\.{0,2}\//.test(v) || /^#/.test(v)) return "";
  return "";
}
function cssSafe(css, allowRemote) {
  var out = String(css || "").replace(/expression\s*\(/gi, "").replace(/behavior\s*:/gi, "")
    .replace(/url\s*\(\s*['"]?\s*(?:javascript|vbscript|data:text\/html)[^)]*\)/gi, "none");
  if (!allowRemote) out = out.replace(/url\s*\(\s*['"]?(?:https?:)?\/\/[^)]*\)/gi, "none");
  return out;
}
function cleanStyleBlocks(html, allowRemote) {
  return String(html).replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, function (all, open, body, close) {
    var css = body.replace(/@import[^;]*;?/gi, "");
    return open + cssSafe(css, allowRemote) + close;
  });
}

/**
 * 白名单清洗。allowRemote=true 时保留远程图片地址，否则换成透明占位并记录数量。
 * 返回 { html, remoteCount, cidIds }：cidIds 是正文引用到的 Content-ID，交给调用方按需下载。
 */
function sanitize(html, opts) {
  var allowRemote = !!(opts && opts.allowRemote);
  var src = cleanStyleBlocks(String(html == null ? "" : html), allowRemote);
  var out = [], remoteCount = 0, cidIds = [], last = 0, m, skipUntil = null;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(src))) {
    // 丢弃标签块（script 等）内部是纯文本，不能当作正文追加。
    if (!skipUntil) out.push(src.slice(last, m.index));
    last = m.index + m[0].length;
    if (m[0].slice(0, 4) === "<!--" || m[0].slice(0, 2) === "<!") continue; // 注释与 doctype 直接丢
    var name = String(m[1] || "").toLowerCase(), closing = m[0].charAt(1) === "/", attrs = m[2] || "";
    if (!name) continue;
    if (skipUntil) { if (closing && name === skipUntil) skipUntil = null; continue; }
    if (!closing && SKIP_VOID.indexOf(name) >= 0) continue;
    if (!closing && SKIP_CONTENT.indexOf(name) >= 0) {
      skipUntil = /\/>$/.test(m[0]) ? null : name; // 自闭合标签不影响后续内容
      continue;
    }
    if (VOID_DROP.indexOf(name) >= 0) continue;
    if (closing) { out.push("</" + name + ">"); continue; }
    var keep = [];
    ATTR.lastIndex = 0;
    var a;
    while ((a = ATTR.exec(attrs))) {
      var attr = a[1].toLowerCase(), value = attrValue(a);
      if (!attr || attr.slice(0, 2) === "on") continue;
      if (attr === "srcset") continue;
      if (attr === "style") { value = cssSafe(value, allowRemote); if (value) keep.push('style="' + escapeAttr(value) + '"'); continue; }
      if (attr === "href") {
        value = safeUrl(value, "href");
        if (!value) continue;
        keep.push('href="' + escapeAttr(value) + '"');
        continue;
      }
      if (attr === "src") {
        if (/^cid:/i.test(value)) {
          var cid = value.slice(4).replace(/^<|>$/g, "").toLowerCase();
          if (cid && cidIds.indexOf(cid) < 0) cidIds.push(cid);
          keep.push('src="cid:' + escapeAttr(cid) + '"');
          continue;
        }
        value = safeUrl(value, "src");
        if (!value) continue;
        if (isHttp(value)) { remoteCount++; if (!allowRemote) value = PLACEHOLDER; }
        keep.push('src="' + escapeAttr(value) + '"');
        continue;
      }
      if (attr === "background" || attr === "poster" || attr === "data") continue;
      if (attr === "class" || attr === "id" || attr === "width" || attr === "height" || attr === "alt" || attr === "title" || attr === "colspan" || attr === "rowspan" || attr === "align" || attr === "valign" || attr === "dir" || attr === "lang" || attr === "border" || attr === "cellpadding" || attr === "cellspacing" || attr === "bgcolor") {
        keep.push(attr + '="' + escapeAttr(value) + '"');
      }
    }
    var tagName = name === "a" ? 'a target="_blank" rel="noopener noreferrer nofollow"' : name;
    var tail = VOID_KEEP.indexOf(name) >= 0 ? " />" : ">";
    out.push("<" + tagName + (keep.length ? " " + keep.join(" ") : "") + tail);
  }
  out.push(src.slice(last));
  return { html: out.join(""), remoteCount: remoteCount, cidIds: cidIds };
}

function escapeAttr(v) {
  return String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** 把清洗后的 cid 引用换成已下载的 data URL，没有对应图片时保留透明占位。 */
function replaceCid(html, cidMap) {
  return String(html || "").replace(/(src\s*=\s*["'])cid:([^"']*)(["'])/gi, function (all, open, cid, close) {
    var key = String(cid).toLowerCase(), url = cidMap && cidMap[key];
    return open + (url || PLACEHOLDER) + close;
  });
}

/** 宿主主题色，透传给 iframe，避免在邮件视图里另立色板。 */
function themeVars() {
  if (typeof document === "undefined" || !document.documentElement) return {};
  var cs = typeof getComputedStyle === "function" ? getComputedStyle(document.documentElement) : null;
  var root = document.querySelector ? document.querySelector(".wb-root") : null;
  var rs = root && typeof getComputedStyle === "function" ? getComputedStyle(root) : null;
  var pick = function (name, fallback) {
    var v = (cs && cs.getPropertyValue(name)) || (rs && rs.getPropertyValue(name)) || "";
    return String(v).trim() || fallback;
  };
  return {
    paper: pick("--wb-surface", "#fff"),
    line: pick("--wb-line", "#e5e7eb"),
    link: pick("--wb-accent", "#0a66c2"),
    ink: (rs && String(rs.color || "").trim()) || (cs && String(cs.color || "").trim()) || "#1f2328",
  };
}

/** 组装 iframe 文档：CSP 兜底 + 主题化的基础排版，邮件自带样式继续生效。 */
function buildDoc(html, opts) {
  var allowRemote = !!(opts && opts.allowRemote), theme = (opts && opts.theme) || {};
  var csp = "default-src 'none'; img-src data:" + (allowRemote ? " https: http:" : "") +
    "; style-src 'unsafe-inline'; font-src data:; media-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'";
  var paper = theme.paper || "#fff", ink = theme.ink || "#1f2328", link = theme.link || "#0a66c2";
  return "<!doctype html><html><head><meta charset=\"utf-8\">" +
    "<meta http-equiv=\"Content-Security-Policy\" content=\"" + csp + "\">" +
    "<style>html{color-scheme:light}html,body{margin:0;padding:0}body{padding:2px;font:13px/1.65 -apple-system,BlinkMacSystemFont,\"Segoe UI\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;color:" + ink + ";background:" + paper + ";overflow-x:hidden;word-break:break-word;overflow-wrap:anywhere}" +
    "img{max-width:100%;height:auto}a{color:" + link + "}table{max-width:100%;border-collapse:collapse}td,th{vertical-align:top}pre{white-space:pre-wrap;overflow-wrap:anywhere}" +
    "blockquote{margin:0 0 0 12px;padding-left:10px;border-left:2px solid " + (theme.line || "#e5e7eb") + ";color:inherit}</style></head><body>" + String(html || "") + "</body></html>";
}

module.exports = function MailHtml(props) {
  var h = props.h, React = props.React, api = props.api;
  var expanded = React.useState(false);
  var images = React.useState({});
  var frame = React.useRef(null);
  var meta = React.useMemo(function () { return sanitize(props.html, { allowRemote: expanded[0] }); }, [props.html, expanded[0]]);
  var byCid = React.useMemo(function () {
    var map = {};
    (props.attachments || []).forEach(function (a) {
      if (a && a.contentId) map[String(a.contentId).toLowerCase()] = a;
      else if (a && a.content_id) map[String(a.content_id).toLowerCase()] = a;
    });
    return map;
  }, [props.attachments]);
  var hasRemote = React.useMemo(function () {
    return sanitize(props.html, { allowRemote: true }).remoteCount;
  }, [props.html]);
  React.useEffect(function () {
    if (!api) return;
    var alive = true, want = [];
    meta.cidIds.forEach(function (cid) {
      var item = byCid[cid];
      if (!item || images[0][cid] || want.some(function (w) { return w.cid === cid; })) return;
      if (item.size > MAX_INLINE_BYTES) return;
      want.push({ cid: cid, item: item });
    });
    if (!want.length) return;
    want.forEach(function (w) {
      C.call(api, "mail.attachmentDownload", { id: w.item.id }).then(function (file) {
        if (!alive || !file || !file.base64) return;
        var url = "data:" + String(file.mime || w.item.mime || "image/png") + ";base64," + file.base64;
        images[1](function (prev) { var next = Object.assign({}, prev); next[w.cid] = url; return next; });
      }).catch(function () { /* 内联图取不到时保持占位，正文仍可读 */ });
    });
    return function () { alive = false; };
  }, [meta.cidIds, byCid, api]);
  var doc = React.useMemo(function () {
    return buildDoc(replaceCid(meta.html, images[0]), { allowRemote: expanded[0], theme: themeVars() });
  }, [meta.html, images[0], expanded[0]]);
  function measure() {
    var f = frame.current;
    if (!f) return;
    try {
      var d = f.contentDocument;
      if (!d) return;
      var height = Math.max(d.documentElement ? d.documentElement.scrollHeight : 0, d.body ? d.body.scrollHeight : 0);
      f.style.height = Math.max(height + 2, 72) + "px";
    } catch (e) { /* 拿不到文档就保持默认高度 */ }
  }
  React.useEffect(measure, [doc]);
  return h("div", { className: "wbml-htmwrap" },
    h("div", { className: "wbml-htmlbar" },
      h("span", { className: "wbml-muted" }, expanded[0] ? "已加载远程图片，内容由发件方服务器提供。" : hasRemote ? "此邮件含 " + hasRemote + " 个远程图片，默认不加载。" : "已按原信排版显示，图片来自本地附件。"),
      hasRemote
        ? h(C.Btn, { h: h, onClick: function () { expanded[1](!expanded[0]); } }, expanded[0] ? "不显示远程图片" : "显示图片")
        : null,
    ),
    h("iframe", {
      ref: frame,
      className: "wbml-htmlframe",
      title: props.title || "邮件正文",
      sandbox: "allow-same-origin allow-popups allow-popups-to-escape-sandbox",
      referrerPolicy: "no-referrer",
      srcDoc: doc,
      onLoad: measure,
    }),
  );
};

module.exports.sanitize = sanitize;
module.exports.buildDoc = buildDoc;
module.exports.replaceCid = replaceCid;
module.exports.PLACEHOLDER = PLACEHOLDER;
