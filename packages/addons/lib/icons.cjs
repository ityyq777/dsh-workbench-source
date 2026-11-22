// 共享图标组件工厂：统一 alias 解析、尺寸、兜底与无障碍属性。
//
// 注意：lucide 图标必须由各插件自己 require（每个图标都会随该插件的 client.js
// 打包）。不要在共享层放一张包含全部图标的总表——那样每个插件都会把其它插件的
// 图标一起打进包里，单插件体积会明显超出预算。
"use strict";

var h = require("react").createElement;

/**
 * 生成某插件的图标集。
 * prefix:   类名前缀，输出 `<prefix>-svg`
 * glyphs:   { 别名: lucide 图标组件 }，别名就是视图里 Icon({ name }) 用的名字
 * options:
 *   fallback         找不到别名时回退的别名
 *   classNameAppend  是否把调用方传入的 className 追加到图标类名后
 *   focusable        是否给 svg 打 focusable=false（装饰性图标不进入 Tab 顺序）
 *   sizeOf           (props) => 尺寸，默认取 props.size 或 14
 *   tabIcon          是否额外导出 tabIcon(name)，用于视图标签页图标
 */
function create(prefix, glyphs, options) {
  var opts = options || {};
  var ICONS = Object.assign({}, glyphs);

  function Icon(props) {
    var C = ICONS[props.name] || (opts.fallback ? ICONS[opts.fallback] : null);
    if (!C) return null;
    var size = typeof opts.sizeOf === "function" ? opts.sizeOf(props) : props.size || 14;
    var cls = prefix + "-svg" + (opts.classNameAppend && props.className ? " " + props.className : "");
    var attrs = {
      size: size,
      strokeWidth: props.strokeWidth || 2,
      "aria-hidden": "true",
      className: cls,
    };
    if (opts.focusable) attrs.focusable = false;
    return h(C, attrs);
  }

  var set = { ICONS: ICONS, Icon: Icon };
  // 图标 + 文字的按钮内容：按钮里包着一层 .wb-icon-label，窄屏由共享样式收成纯图标按钮。
  set.label = function (name, text) {
    return require("./icon-label.cjs")(h, function NamedIcon(props) {
      return h(Icon, Object.assign({ name: name }, props));
    }, text);
  };
  if (opts.tabIcon) {
    // 视图标签页标题左侧图标：与各插件标题图标同语义、同尺寸。
    set.tabIcon = function (name) {
      return function TabIcon() {
        return h(Icon, { name: name, size: 14 });
      };
    };
  }
  return set;
};

module.exports = { create: create };
