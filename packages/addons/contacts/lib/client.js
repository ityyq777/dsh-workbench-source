// 由 scripts/build-addon-clients.mjs 生成；请修改对应 client/client.src.cjs 后重新构建。
window.__ModuleLoader__ = window.__ModuleLoader__ || { modules: {}, load: function (m) { this.modules[m.id] = m.factory; } };
window.__ModuleLoader__.load({
  id: "dsh-workbench-contacts",
  factory: function (require) {
    var module = { exports: {} };
    var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/addons/lib/icon-label.cjs
var require_icon_label = __commonJS({
  "packages/addons/lib/icon-label.cjs"(exports2, module2) {
    "use strict";
    var VISUALLY_HIDDEN = "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap";
    module2.exports = function iconLabel(h, Icon2, text, options) {
      var opts = options || {};
      var cls = "wb-icon-label" + (opts.short ? " wb-icon-label-short" : "") + (Icon2 ? "" : " wb-icon-label-fallback");
      return h(
        "span",
        { className: cls, title: typeof text === "string" ? text : void 0 },
        Icon2 ? h(Icon2, { size: 14, strokeWidth: 2, "aria-hidden": true, focusable: false }) : null,
        h("span", { className: "wb-icon-label-text" }, text)
      );
    };
    module2.exports.styles = ".wb-icon-label{display:inline-flex;align-items:center;gap:5px;max-width:100%;vertical-align:middle;text-align:start}.wb-icon-label>svg{flex:none}.wb-icon-label>span{min-width:0;overflow-wrap:anywhere}button .wb-icon-label:not(.wb-icon-label-fallback) .wb-icon-label-text{" + VISUALLY_HIDDEN + "}button .wb-icon-label.wb-icon-label-short .wb-icon-label-text{position:static;width:auto;height:auto;margin:0;overflow:visible;clip-path:none;white-space:normal}";
  }
});

// packages/addons/lib/icons.cjs
var require_icons = __commonJS({
  "packages/addons/lib/icons.cjs"(exports2, module2) {
    "use strict";
    var h = require("react").createElement;
    function create(prefix, glyphs, options) {
      var opts = options || {};
      var ICONS = Object.assign({}, glyphs);
      function Icon2(props) {
        var C = ICONS[props.name] || (opts.fallback ? ICONS[opts.fallback] : null);
        if (!C) return null;
        var size = typeof opts.sizeOf === "function" ? opts.sizeOf(props) : props.size || 14;
        var cls = prefix + "-svg" + (opts.classNameAppend && props.className ? " " + props.className : "");
        var attrs = {
          size,
          strokeWidth: props.strokeWidth || 2,
          "aria-hidden": "true",
          className: cls
        };
        if (opts.focusable) attrs.focusable = false;
        return h(C, attrs);
      }
      var set = { ICONS, Icon: Icon2 };
      set.label = function(name, text, options2) {
        return require_icon_label()(h, function NamedIcon(props) {
          return h(Icon2, Object.assign({ name }, props));
        }, text, options2);
      };
      if (opts.tabIcon) {
        set.tabIcon = function(name) {
          return function TabIcon() {
            return h(Icon2, { name, size: 14 });
          };
        };
      }
      return set;
    }
    module2.exports = { create };
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/utils/toKebabCase.mjs
var toKebabCase;
var init_toKebabCase = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/utils/toKebabCase.mjs"() {
    toKebabCase = (string) => string?.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/utils/toLucideIconData.mjs
function toLucideIconData(iconName, iconNode, aliases = []) {
  if (iconNode == null) {
    throw new Error("[lucide]: iconNode is required when icon name is used");
  }
  return {
    name: toKebabCase(iconName),
    size: 24,
    node: iconNode,
    ...aliases.length > 0 ? { aliases } : {}
  };
}
var init_toLucideIconData = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/utils/toLucideIconData.mjs"() {
    init_toKebabCase();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/utils/toCamelCase.mjs
var toCamelCase;
var init_toCamelCase = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/utils/toCamelCase.mjs"() {
    toCamelCase = (string) => {
      let out = "";
      let upperNext = false;
      for (const ch of string) {
        if (ch === "-" || ch === "_" || ch <= " ") {
          upperNext = out.length > 0;
          continue;
        }
        if (out.length === 0) {
          out += ch.toLowerCase();
        } else {
          out += upperNext ? ch.toUpperCase() : ch;
        }
        upperNext = false;
      }
      return out;
    };
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/utils/toPascalCase.mjs
var toPascalCase;
var init_toPascalCase = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/utils/toPascalCase.mjs"() {
    init_toCamelCase();
    toPascalCase = (string) => {
      const camelCase = toCamelCase(string);
      return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
    };
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var mergeClasses;
var init_mergeClasses = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs"() {
    mergeClasses = (...classes) => classes.filter((className, index, array) => {
      return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
    }).join(" ").trim();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/build/defaultAttributes.mjs
var defaultAttributes;
var init_defaultAttributes = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/build/defaultAttributes.mjs"() {
    defaultAttributes = {
      xmlns: "http://www.w3.org/2000/svg",
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2,
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    };
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/build/buildLucideIconNode.mjs
function isDefined(value) {
  return value !== null && value !== void 0;
}
function buildLucideIconNode(icon, params = {}) {
  const attributeNames = params.attributeNames ?? {};
  const getAttributeName = (attributeName) => attributeNames[attributeName] ?? attributeName;
  const viewBoxWidth = icon.size ?? icon.width ?? defaultAttributes["width"];
  const viewBoxHeight = icon.size ?? icon.height ?? defaultAttributes["height"];
  const aliasClassNames = icon.aliases?.filter((alias) => typeof alias === "string" && alias.trim() !== "").map((alias) => `lucide-${alias}`) ?? [];
  const iconClassNames = [...icon.name ? [`lucide-${icon.name}`] : [], ...aliasClassNames];
  const classNamesFromClassName = params.className?.split(" ").filter(Boolean) ?? [];
  const className = params.includeDefaultClasses === false ? mergeClasses(...classNamesFromClassName) : mergeClasses("lucide", ...iconClassNames, ...classNamesFromClassName);
  const calculatedStrokeWidth = params.absoluteStrokeWidth ? Number(params.strokeWidth ?? defaultAttributes["stroke-width"]) * Number(icon.size ?? icon.width ?? defaultAttributes["width"]) / Number(params.size ?? params.width ?? defaultAttributes["width"]) : params.strokeWidth ?? defaultAttributes["stroke-width"];
  const attributes = {
    ...Object.entries(defaultAttributes).reduce((attrs, [attrName, value]) => {
      attrs[getAttributeName(attrName)] = value;
      return attrs;
    }, {}),
    ..."color" in params && params.color && {
      [getAttributeName("stroke")]: params.color
    },
    ..."size" in params && isDefined(params.size) && {
      [getAttributeName("width")]: params.size,
      [getAttributeName("height")]: params.size
    },
    ..."width" in params && isDefined(params.width) && {
      [getAttributeName("width")]: params.width
    },
    ..."height" in params && isDefined(params.height) && {
      [getAttributeName("height")]: params.height
    },
    [getAttributeName("stroke-width")]: calculatedStrokeWidth,
    ...className && {
      [getAttributeName("class")]: className
    },
    [getAttributeName("viewBox")]: `0 0 ${viewBoxWidth} ${viewBoxHeight}`,
    ...params.hasA11yProp === false ? {
      [getAttributeName("aria-hidden")]: "true"
    } : {},
    ..."attributes" in params && params.attributes
  };
  return [
    "svg",
    attributes,
    icon.node.map((child) => {
      const [name, attrs, children] = child;
      const nextAttrs = params.nonScalingStroke ? { [getAttributeName("vector-effect")]: "non-scaling-stroke", ...attrs } : attrs;
      return children ? [name, nextAttrs, children] : [name, nextAttrs];
    })
  ];
}
var init_buildLucideIconNode = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/build/buildLucideIconNode.mjs"() {
    init_defaultAttributes();
    init_mergeClasses();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/build/buildLucideIconForReact.mjs
function buildLucideIconForReact(icon, params = {}) {
  return buildLucideIconNode(icon, {
    ...params,
    attributeNames: {
      ...params.attributeNames,
      class: "className",
      "stroke-width": "strokeWidth",
      "stroke-linecap": "strokeLinecap",
      "stroke-linejoin": "strokeLinejoin",
      "vector-effect": "vectorEffect"
    }
  });
}
var init_buildLucideIconForReact = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/build/buildLucideIconForReact.mjs"() {
    init_buildLucideIconNode();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/utils/hasA11yProp.mjs
var hasA11yProp;
var init_hasA11yProp = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/utils/hasA11yProp.mjs"() {
    hasA11yProp = (props) => {
      for (const prop in props) {
        if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
          return true;
        }
      }
      return false;
    };
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/context.mjs
var import_react, LucideContext, useLucideContext;
var init_context = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/context.mjs"() {
    "use strict";
    "use client";
    import_react = require("react");
    LucideContext = (0, import_react.createContext)({});
    useLucideContext = () => (0, import_react.useContext)(LucideContext);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/Icon.mjs
var import_react2, Icon;
var init_Icon = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/Icon.mjs"() {
    "use strict";
    "use client";
    import_react2 = require("react");
    init_mergeClasses();
    init_buildLucideIconForReact();
    init_hasA11yProp();
    init_context();
    Icon = (0, import_react2.forwardRef)(
      ({
        color,
        size,
        width,
        height,
        strokeWidth,
        absoluteStrokeWidth,
        nonScalingStroke,
        className = "",
        children,
        iconNode = [],
        icon = {
          node: iconNode,
          aliases: [],
          size: 24
        },
        ...rest
      }, ref) => {
        const {
          size: contextSize = 24,
          strokeWidth: contextStrokeWidth = 2,
          absoluteStrokeWidth: contextAbsoluteStrokeWidth = false,
          nonScalingStroke: contextNonScalingStroke = false,
          color: contextColor = "currentColor",
          className: contextClass = ""
        } = useLucideContext() ?? {};
        const hasAccessibleProp = Boolean(children) || hasA11yProp(rest);
        const [name, svgAttributes, builtIconNode = []] = buildLucideIconForReact(icon, {
          color: color ?? contextColor,
          width: width ?? size ?? contextSize,
          height: height ?? size ?? contextSize,
          strokeWidth: strokeWidth ?? contextStrokeWidth,
          absoluteStrokeWidth: absoluteStrokeWidth ?? contextAbsoluteStrokeWidth,
          nonScalingStroke: nonScalingStroke ?? contextNonScalingStroke,
          className: mergeClasses(contextClass, className),
          hasA11yProp: hasAccessibleProp,
          attributes: rest
        });
        return (0, import_react2.createElement)(
          name,
          {
            ref,
            ...svgAttributes
          },
          [
            ...builtIconNode.map(([tag, attrs]) => (0, import_react2.createElement)(tag, attrs)),
            ...Array.isArray(children) ? children : [children]
          ]
        );
      }
    );
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/createLucideIcon.mjs
function createLucideIcon(iconDataOrName, iconNode = [], aliases = []) {
  const iconData = typeof iconDataOrName === "string" ? toLucideIconData(iconDataOrName, iconNode, aliases) : iconDataOrName;
  const Component = (0, import_react3.forwardRef)(
    ({ className, ...props }, ref) => (0, import_react3.createElement)(Icon, {
      ref,
      icon: iconData,
      className,
      ...props
    })
  );
  if (iconData.name) {
    Component.displayName = toPascalCase(iconData.name);
  }
  return Component;
}
var import_react3;
var init_createLucideIcon = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/createLucideIcon.mjs"() {
    import_react3 = require("react");
    init_toLucideIconData();
    init_toPascalCase();
    init_Icon();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/database.mjs
var database_exports = {};
__export(database_exports, {
  __iconData: () => __iconData,
  default: () => Database
});
var __iconData, Database;
var init_database = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/database.mjs"() {
    init_createLucideIcon();
    __iconData = {
      name: "database",
      size: 24,
      node: [
        ["ellipse", { cx: "12", cy: "5", rx: "9", ry: "3", key: "msslwz" }],
        ["path", { d: "M3 5V19A9 3 0 0 0 21 19V5", key: "1wlel7" }],
        ["path", { d: "M3 12A9 3 0 0 0 21 12", key: "mv7ke4" }]
      ]
    };
    __iconData.node;
    Database = createLucideIcon(__iconData);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/folder.mjs
var folder_exports = {};
__export(folder_exports, {
  __iconData: () => __iconData2,
  default: () => Folder
});
var __iconData2, Folder;
var init_folder = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/folder.mjs"() {
    init_createLucideIcon();
    __iconData2 = {
      name: "folder",
      size: 24,
      node: [
        [
          "path",
          {
            d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
            key: "1kt360"
          }
        ]
      ]
    };
    __iconData2.node;
    Folder = createLucideIcon(__iconData2);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/list.mjs
var list_exports = {};
__export(list_exports, {
  __iconData: () => __iconData3,
  default: () => List
});
var __iconData3, List;
var init_list = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/list.mjs"() {
    init_createLucideIcon();
    __iconData3 = {
      name: "list",
      size: 24,
      node: [
        ["path", { d: "M3 5h.01", key: "18ugdj" }],
        ["path", { d: "M3 12h.01", key: "nlz23k" }],
        ["path", { d: "M3 19h.01", key: "noohij" }],
        ["path", { d: "M8 5h13", key: "1pao27" }],
        ["path", { d: "M8 12h13", key: "1za7za" }],
        ["path", { d: "M8 19h13", key: "m83p4d" }]
      ]
    };
    __iconData3.node;
    List = createLucideIcon(__iconData3);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/sliders-horizontal.mjs
var sliders_horizontal_exports = {};
__export(sliders_horizontal_exports, {
  __iconData: () => __iconData4,
  default: () => SlidersHorizontal
});
var __iconData4, SlidersHorizontal;
var init_sliders_horizontal = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/sliders-horizontal.mjs"() {
    init_createLucideIcon();
    __iconData4 = {
      name: "sliders-horizontal",
      size: 24,
      node: [
        ["path", { d: "M10 5H3", key: "1qgfaw" }],
        ["path", { d: "M12 19H3", key: "yhmn1j" }],
        ["path", { d: "M14 3v4", key: "1sua03" }],
        ["path", { d: "M16 17v4", key: "1q0r14" }],
        ["path", { d: "M21 12h-9", key: "1o4lsq" }],
        ["path", { d: "M21 19h-5", key: "1rlt1p" }],
        ["path", { d: "M21 5h-7", key: "1oszz2" }],
        ["path", { d: "M8 10v4", key: "tgpxqk" }],
        ["path", { d: "M8 12H3", key: "a7s4jb" }]
      ]
    };
    __iconData4.node;
    SlidersHorizontal = createLucideIcon(__iconData4);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/upload.mjs
var upload_exports = {};
__export(upload_exports, {
  __iconData: () => __iconData5,
  default: () => Upload
});
var __iconData5, Upload;
var init_upload = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/upload.mjs"() {
    init_createLucideIcon();
    __iconData5 = {
      name: "upload",
      size: 24,
      node: [
        ["path", { d: "M12 3v12", key: "1x0j5s" }],
        ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
        ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }]
      ]
    };
    __iconData5.node;
    Upload = createLucideIcon(__iconData5);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/users.mjs
var users_exports = {};
__export(users_exports, {
  __iconData: () => __iconData6,
  default: () => Users
});
var __iconData6, Users;
var init_users = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/users.mjs"() {
    init_createLucideIcon();
    __iconData6 = {
      name: "users",
      size: 24,
      node: [
        ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
        ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
        ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
        ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
      ]
    };
    __iconData6.node;
    Users = createLucideIcon(__iconData6);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/user-plus.mjs
var user_plus_exports = {};
__export(user_plus_exports, {
  __iconData: () => __iconData7,
  default: () => UserPlus
});
var __iconData7, UserPlus;
var init_user_plus = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/user-plus.mjs"() {
    init_createLucideIcon();
    __iconData7 = {
      name: "user-plus",
      size: 24,
      node: [
        ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
        ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
        ["line", { x1: "19", x2: "19", y1: "8", y2: "14", key: "1bvyxn" }],
        ["line", { x1: "22", x2: "16", y1: "11", y2: "11", key: "1shjgl" }]
      ]
    };
    __iconData7.node;
    UserPlus = createLucideIcon(__iconData7);
  }
});

// packages/addons/contacts/client/ui/icons.cjs
var require_icons2 = __commonJS({
  "packages/addons/contacts/client/ui/icons.cjs"(exports2, module2) {
    "use strict";
    var icons = require_icons();
    var set = icons.create("wbct", {
      "database": (init_database(), __toCommonJS(database_exports)).default,
      "folder": (init_folder(), __toCommonJS(folder_exports)).default,
      "list": (init_list(), __toCommonJS(list_exports)).default,
      "sliders-horizontal": (init_sliders_horizontal(), __toCommonJS(sliders_horizontal_exports)).default,
      "upload": (init_upload(), __toCommonJS(upload_exports)).default,
      "users": (init_users(), __toCommonJS(users_exports)).default,
      "user-plus": (init_user_plus(), __toCommonJS(user_plus_exports)).default
    });
    module2.exports = { ICONS: set.ICONS, Icon: set.Icon, label: set.label };
  }
});

// packages/addons/lib/client-base-styles.cjs
var require_client_base_styles = __commonJS({
  "packages/addons/lib/client-base-styles.cjs"(exports2, module2) {
    "use strict";
    var SECRET_FIELD = [
      ".wb-secret-field{position:relative;display:flex;align-items:center;min-width:0}",
      ".wb-secret-field input{flex:1 1 auto;min-width:0;padding-right:34px}",
      ".wb-eye{position:absolute;right:4px;display:inline-flex;align-items:center;justify-content:center;background:transparent;border:0;border-radius:6px;padding:4px;color:var(--wb-muted,#6b7280);cursor:pointer}",
      ".wb-eye:hover:not(:disabled){color:var(--wb-accent,#2563eb);background:color-mix(in srgb, var(--wb-accent,#2563eb) 12%, transparent)}",
      ".wb-eye:focus-visible{outline:2px solid var(--wb-accent,#2563eb);outline-offset:1px}",
      ".wb-eye:disabled{opacity:.45;cursor:not-allowed}"
    ];
    module2.exports = function baseStyles(prefix) {
      var p = String(prefix || "wb");
      var s = "." + p;
      return SECRET_FIELD.concat([
        s + "-wrap{display:flex;flex-direction:column;gap:12px;padding:16px;overflow:auto;height:100%;box-sizing:border-box}",
        s + "-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}",
        s + "-title{font-size:16px;font-weight:650;margin:0}",
        s + "-sub{font-size:12px;color:var(--wb-muted,#6b7280);margin:2px 0 0}",
        s + "-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}",
        s + "-card{border:1px solid var(--wb-border,#e5e7eb);border-radius:10px;background:var(--wb-surface,#fff);padding:12px}",
        s + "-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}",
        s + "-kpi{font-size:22px;font-weight:700;line-height:1.2}" + s + "-kpi-label{font-size:12px;color:var(--wb-muted,#6b7280)}",
        s + "-table{width:100%;border-collapse:collapse;font-size:12px}" + s + "-table th," + s + "-table td{padding:7px 8px;border-bottom:1px solid var(--wb-border,#eef0f3);text-align:left;vertical-align:top}",
        s + "-table th{font-weight:600;color:var(--wb-muted,#6b7280);white-space:nowrap}",
        s + "-btn{border:1px solid var(--wb-border,#d1d5db);background:var(--wb-surface,#fff);color:inherit;border-radius:7px;padding:5px 10px;font-size:12px;cursor:pointer}",
        s + "-btn:hover:not(:disabled){border-color:var(--wb-accent,#2563eb)}" + s + "-btn:disabled{opacity:.5;cursor:default}",
        s + "-btn.primary{background:var(--wb-accent,#2563eb);border-color:var(--wb-accent,#2563eb);color:var(--dsw-alias-label-primary-inverted,#fff)}",
        s + "-btn.danger{color:var(--wb-danger,#b91c1c);border-color:color-mix(in oklab,var(--wb-danger,#b91c1c) 35%,transparent)}",
        s + "-field{display:flex;flex-direction:column;gap:4px;font-size:12px}" + s + "-label{font-weight:600}",
        s + "-field input," + s + "-field select," + s + "-field textarea{border:1px solid var(--wb-border,#d1d5db);border-radius:7px;padding:6px 8px;font:inherit;background:var(--wb-surface,#fff);color:inherit;min-width:0}",
        s + "-hint{color:var(--wb-muted,#6b7280);font-size:11px}" + s + "-notice{padding:8px 10px;border-radius:8px;font-size:12px;background:color-mix(in oklab,var(--wb-accent,#2563eb) 9%,transparent);color:var(--dsw-alias-label-primary,inherit)}",
        s + "-notice.error{background:color-mix(in oklab,var(--wb-danger,#b91c1c) 10%,transparent);color:var(--wb-danger,#b91c1c)}" + s + "-notice.ok{background:color-mix(in oklab,var(--wb-ok,#047857) 10%,transparent);color:var(--wb-ok,#047857)}",
        s + "-empty{padding:18px;text-align:center;color:var(--wb-muted,#6b7280);font-size:12px;border:1px dashed var(--wb-border,#e5e7eb);border-radius:8px}",
        s + "-pill{display:inline-block;padding:1px 7px;border-radius:999px;font-size:11px;background:color-mix(in oklab,currentColor 7%,transparent);color:inherit}",
        s + "-pill.ok{background:color-mix(in oklab,var(--wb-ok,#047857) 12%,transparent);color:var(--wb-ok,#047857)}" + s + "-pill.error{background:color-mix(in oklab,var(--wb-danger,#b91c1c) 12%,transparent);color:var(--wb-danger,#b91c1c)}" + s + "-pill.warn{background:color-mix(in oklab,var(--wb-warn,#b45309) 14%,transparent);color:var(--wb-warn,#b45309)}",
        s + "-json{margin:0;padding:8px;background:color-mix(in oklab,currentColor 4%,transparent);border-radius:8px;font-size:11px;max-height:240px;overflow:auto}",
        s + "-muted{color:var(--wb-muted,#6b7280)}" + s + "-link{color:var(--wb-accent,#2563eb);cursor:pointer;text-decoration:none}",
        s + "-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}",
        // 窄屏：页面容器不再自带左右内边距（宿主的 .wb-immersive-main 已经给过），
        // 卡片与栅格收紧，把宽度尽量留给内容——窄屏下两侧留白比桌面更影响可读性。
        "@media(max-width:760px){" + s + "-wrap{padding:0 0 8px;gap:10px}" + s + "-card{padding:12px;border-radius:10px}" + s + "-grid{grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px}" + s + "-form{grid-template-columns:minmax(0,1fr)}" + s + "-title{font-size:15px}" + s + "-btn." + s + "-icon-text ." + s + "-btn-label{display:none}" + s + "-btn." + s + "-icon-text{padding-left:8px;padding-right:8px}" + s + "-table-wrap{overflow-x:auto;max-width:100%}" + s + "-table{width:max-content;min-width:100%}}button .wb-icon-label:not(.wb-icon-label-fallback) .wb-icon-label-text{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}button .wb-icon-label.wb-icon-label-short .wb-icon-label-text{position:static;width:auto;height:auto;margin:0;overflow:visible;clip-path:none;white-space:normal}@media(max-width:420px){" + s + "-wrap{padding:0 0 6px}" + s + "-card{padding:10px}" + s + "-grid{grid-template-columns:repeat(auto-fit,minmax(120px,1fr))}}"
      ]);
    };
    module2.exports.secretFieldStyles = SECRET_FIELD;
  }
});

// packages/addons/contacts/client/ui/styles.cjs
var require_styles = __commonJS({
  "packages/addons/contacts/client/ui/styles.cjs"(exports2, module2) {
    "use strict";
    var BASE = require_client_base_styles()("wbct");
    var OWN = `
/* \u8054\u7CFB\u65B9\u5F0F\uFF1A\u684C\u9762\u7AEF\u4E00\u884C\u591A\u6BB5\uFF0C\u7A84\u5C4F\u4E00\u9879\u4E00\u884C\u3002 */
.wbct-fields { display: flex; flex-wrap: wrap; gap: 2px 10px; }
.wbct-field { overflow-wrap: break-word; }

/* \u7A84\u5C4F\uFF1A\u8054\u7CFB\u65B9\u5F0F\u5217\u53EF\u6362\u884C\uFF0C\u7EC4\u7EC7/\u5206\u7EC4/\u66F4\u65B0\u65F6\u95F4\u6309\u5217\u88C1\u526A\uFF0C\u64CD\u4F5C\u6309\u94AE\u6362\u884C\u4E0D\u6491\u5BBD\u3002 */
@media (max-width:600px) {
  /* \u57FA\u7840\u8868\u683C\u662F width:max-content\uFF0C\u7A84\u5C4F\u4E09\u5217\u8981\u538B\u56DE 100%\uFF0C\u5426\u5219\u64CD\u4F5C\u5217\u88AB\u63A8\u5230\u5C4F\u5E55\u5916\u3002 */
  .wbct-table { width: 100%; min-width: 0; }
  .wbct-c-org, .wbct-c-groups, .wbct-c-updated { display: none; }
  .wbct-table th, .wbct-table td { padding-left: 8px; padding-right: 8px; }
  .wbct-c-contact .wbct-muted { overflow-wrap: break-word; }
  /* \u8054\u7CFB\u65B9\u5F0F\u4E00\u9879\u4E00\u884C\uFF0C\u957F\u90AE\u7BB1\u624D\u4E0D\u4F1A\u88AB\u62C6\u6210\u4E24\u622A\u3002 */
  .wbct-fields { flex-direction: column; gap: 2px; }
  .wbct-row { flex-wrap: wrap; gap: 4px; }
  /* \u59D3\u540D\u5217\u4E0D\u6362\u884C\uFF0C\u907F\u514D\u300C\u5F20\u4F1F\u300D\u88AB\u62C6\u6210\u7AD6\u6392\uFF1B\u64CD\u4F5C\u6309\u94AE\u4FDD\u6301\u4E00\u884C\u5E76\u6536\u7A84\u5185\u8FB9\u8DDD\u3002 */
  .wbct-c-name { white-space: nowrap; padding-right: 10px; }
  .wbct-c-act .wbct-row { flex-wrap: nowrap; gap: 4px; }
  .wbct-c-act .wbct-btn { padding-left: 8px; padding-right: 8px; }
}
`;
    module2.exports = (Array.isArray(BASE) ? BASE.join("\n") : String(BASE)) + OWN;
  }
});

// packages/addons/lib/inject-styles.cjs
var require_inject_styles = __commonJS({
  "packages/addons/lib/inject-styles.cjs"(exports2, module2) {
    "use strict";
    function toCss(value) {
      var v = typeof value === "function" ? value() : value;
      if (Array.isArray(v)) return v.filter(Boolean).join("\n");
      if (v === null || v === void 0) return "";
      return String(v);
    }
    module2.exports = function injectStyles(options) {
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
    module2.exports.toCss = toCss;
  }
});

// packages/addons/lib/switch.cjs
var require_switch = __commonJS({
  "packages/addons/lib/switch.cjs"(exports2, module2) {
    "use strict";
    var SWITCH_STYLES = [
      ".wbctl-switch{display:inline-flex;align-items:center;gap:7px;white-space:nowrap;min-height:24px;padding:2px;border:0;background:transparent;font:inherit;font-size:12px;color:var(--wb-muted,#6b7280);cursor:pointer;user-select:none;border-radius:999px}",
      ".wbctl-switch-track{position:relative;display:inline-flex;align-items:center;box-sizing:border-box;width:34px;height:20px;padding:2px;border-radius:999px;background:color-mix(in oklab,currentColor 22%,transparent);transition:background .16s ease;flex:none}",
      ".wbctl-switch-knob{display:block;width:16px;height:16px;border-radius:50%;background:var(--wb-card,#fff);box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .16s ease}",
      ".wbctl-switch[aria-checked=true]{color:var(--wb-accent,#2563eb)}",
      ".wbctl-switch[aria-checked=true] .wbctl-switch-track{background:var(--wb-accent,#2563eb)}",
      ".wbctl-switch[aria-checked=true] .wbctl-switch-knob{transform:translateX(14px)}",
      ".wbctl-switch:hover:not(:disabled) .wbctl-switch-track{outline:1px solid var(--wb-accent,#2563eb)}",
      ".wbctl-switch:focus-visible{outline:2px solid var(--wb-accent,#2563eb);outline-offset:2px}",
      ".wbctl-switch:disabled{opacity:.45;cursor:not-allowed}",
      ".wbctl-switch-text{white-space:nowrap}",
      "@media (prefers-reduced-motion:reduce){.wbctl-switch-track,.wbctl-switch-knob{transition:none}}"
    ];
    function Switch(props) {
      var h = props.h;
      var on = props.checked === true || props.checked === "true";
      var disabled = !!props.disabled;
      var text = props.label;
      if (props.showState) text = on ? props.onText || "\u5F00" : props.offText || "\u5173";
      return h(
        "button",
        {
          type: "button",
          role: "switch",
          "aria-checked": on ? "true" : "false",
          className: "wbctl-switch" + (props.className ? " " + props.className : ""),
          disabled,
          title: props.title,
          "aria-label": text ? void 0 : props.ariaLabel,
          onClick: function(e) {
            e.preventDefault();
            if (disabled) return;
            if (typeof props.onChange === "function") props.onChange(!on);
          }
        },
        h(
          "span",
          { className: "wbctl-switch-track", "aria-hidden": "true" },
          h("span", { className: "wbctl-switch-knob" })
        ),
        text ? h("span", { className: "wbctl-switch-text" }, text) : null
      );
    }
    module2.exports = { Switch, styles: SWITCH_STYLES };
  }
});

// packages/addons/lib/number-field.cjs
var require_number_field = __commonJS({
  "packages/addons/lib/number-field.cjs"(exports2, module2) {
    "use strict";
    var React = require("react");
    var NUM = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;
    var TEXT = {
      zh: {
        required: "\u8BF7\u586B\u5199\u6570\u5B57",
        invalid: "\u8BF7\u8F93\u5165\u6570\u5B57",
        integer: "\u9700\u8981\u662F\u6574\u6570",
        min: "\u4E0D\u80FD\u5C0F\u4E8E {min}",
        max: "\u4E0D\u80FD\u5927\u4E8E {max}",
        range: "\u9700\u8981\u5728 {min}\u2013{max} \u4E4B\u95F4",
        step: "\u9700\u8981\u662F {step} \u7684\u500D\u6570",
        unit: "\u5355\u4F4D"
      },
      en: {
        required: "Please enter a number",
        invalid: "Please enter a number",
        integer: "Must be a whole number",
        min: "Must be at least {min}",
        max: "Must be at most {max}",
        range: "Must be between {min} and {max}",
        step: "Must be a multiple of {step}",
        unit: "unit"
      }
    };
    function messages(lang) {
      return lang === "en" ? TEXT.en : TEXT.zh;
    }
    function fill(text, vars) {
      return String(text).replace(/\{(\w+)\}/g, function(m, key) {
        return vars && vars[key] !== void 0 ? String(vars[key]) : m;
      });
    }
    function validateNumber(raw, opts) {
      var o = opts || {};
      var M = messages(o.lang);
      var text = raw === null || raw === void 0 ? "" : String(raw).trim();
      if (text === "") {
        return o.allowEmpty ? { ok: true, value: null, error: "" } : { ok: false, value: null, error: M.required };
      }
      if (!NUM.test(text)) return { ok: false, value: null, error: M.invalid };
      var n = Number(text);
      if (!isFinite(n)) return { ok: false, value: null, error: M.invalid };
      if (o.integer && Math.round(n) !== n) return { ok: false, value: null, error: M.integer };
      var hasMin = o.min !== void 0 && o.min !== null && o.min !== "";
      var hasMax = o.max !== void 0 && o.max !== null && o.max !== "";
      if (hasMin && hasMax && n >= o.min && n <= o.max) {
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
    function rangeHint(opts, lang) {
      var o = opts || {};
      var M = messages(lang);
      var en = lang === "en";
      var hasMin = o.min !== void 0 && o.min !== null && o.min !== "";
      var hasMax = o.max !== void 0 && o.max !== null && o.max !== "";
      var parts = [];
      if (hasMin && hasMax) parts.push(String(o.min) + "\u2013" + String(o.max));
      else if (hasMin) parts.push((en ? "\u2265 " : "\u2265 ") + String(o.min));
      else if (hasMax) parts.push((en ? "\u2264 " : "\u2264 ") + String(o.max));
      if (o.integer) parts.push(en ? "whole numbers" : "\u6574\u6570");
      else if (o.step && Number(o.step) > 0) parts.push((en ? "step " : "\u6B65\u957F ") + String(o.step));
      return parts.join(en ? ", " : "\uFF0C");
    }
    function NumberField(props) {
      var h = props.h || React.createElement;
      var lang = props.lang;
      var M = messages(lang);
      var text = props.value === null || props.value === void 0 ? "" : String(props.value);
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
      var skipBlurRef = React.useRef(false);
      React.useEffect(
        function() {
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
        var cur = props.value === null || props.value === void 0 ? null : Number(props.value);
        if (r.value !== cur) {
          lastRef.current = r.value === null ? "" : String(r.value);
          if (typeof props.onCommit === "function") props.onCommit(r.value);
        }
        return true;
      }
      var hint = props.hint !== void 0 ? props.hint : rangeHint(props, lang);
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
            "aria-invalid": err ? "true" : void 0,
            onFocus: function() {
              setFocused(true);
            },
            onChange: function(e) {
              setDraft(e.target.value);
              if (err) setErr("");
              if (typeof props.onDraft === "function") props.onDraft(e.target.value);
            },
            onBlur: function() {
              setFocused(false);
              if (skipBlurRef.current) {
                skipBlurRef.current = false;
                return;
              }
              commit(draft);
            },
            onKeyDown: function(e) {
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
            }
          }),
          props.unit ? h("span", { className: "wbctl-num-unit" }, props.unit) : null
        ),
        err ? h("span", { className: "wbctl-num-err", role: "alert" }, err) : shown ? h("span", { className: "wbctl-num-hint" }, shown) : null
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
      "@media (prefers-reduced-motion:reduce){.wbctl-num-input{transition:none}}"
    ];
    module2.exports = {
      NumberField,
      validateNumber,
      rangeHint,
      messages,
      styles: NUMBER_STYLES
    };
  }
});

// packages/addons/lib/client-common.cjs
var require_client_common = __commonJS({
  "packages/addons/lib/client-common.cjs"(exports2, module2) {
    "use strict";
    module2.exports = function createCommon(prefix) {
      var p = String(prefix || "wb");
      function unwrap(r) {
        if (r && r.ok === false) {
          var error = new Error(r.error || r.message || "\u64CD\u4F5C\u5931\u8D25");
          if (r.code !== void 0) error.code = r.code;
          error.payload = r;
          throw error;
        }
        return r && r.result !== void 0 ? r.result : r;
      }
      function call(api, action, args) {
        return Promise.resolve(api.call(action, args || {})).then(unwrap);
      }
      function errText(e) {
        if (!e) return "\u64CD\u4F5C\u5931\u8D25";
        if (typeof e === "string") return e;
        return e.message || e.error || String(e);
      }
      function fmtTime(ts, lang) {
        if (!ts) return "\u2014";
        try {
          return new Date(ts).toLocaleString(lang === "en" ? "en-US" : "zh-CN", { hour12: false });
        } catch (e) {
          return String(ts);
        }
      }
      function Btn(props) {
        var h = props.h;
        return h("button", {
          type: props.type || "button",
          className: p + "-btn" + (props.kind ? " " + props.kind : ""),
          disabled: props.disabled,
          onClick: props.onClick,
          title: props.title,
          children: props.children
        });
      }
      function Field(props) {
        var h = props.h;
        return h("label", {
          className: p + "-field",
          children: [
            h("span", { key: "label", className: p + "-label", children: props.label }),
            props.children,
            props.hint ? h("span", { key: "hint", className: p + "-hint", children: props.hint }) : null
          ]
        });
      }
      function Notice(props) {
        var h = props.h;
        if (!props.text) return null;
        return h("div", { className: p + "-notice " + (props.kind || "info"), children: props.text });
      }
      function Empty(props) {
        var h = props.h;
        return h("div", { className: p + "-empty", children: props.text || "\u6682\u65E0\u6570\u636E" });
      }
      function Pill(props) {
        var h = props.h;
        return h("span", { className: p + "-pill " + (props.kind || ""), children: props.children });
      }
      function Json(props) {
        var h = props.h;
        var text;
        try {
          text = JSON.stringify(props.value, null, 2);
        } catch (e) {
          text = String(props.value);
        }
        return h("pre", { className: p + "-json", children: text });
      }
      function useLoad(React, api, action, args, deps) {
        var s = React.useState({ loading: true, data: null, error: "" });
        var tick = React.useState(0);
        var refresh = function() {
          tick[1](tick[0] + 1);
        };
        React.useEffect(
          function() {
            var alive = true;
            s[1]({ loading: true, data: null, error: "" });
            call(api, action, args).then(function(data) {
              if (alive) s[1]({ loading: false, data, error: "" });
            }).catch(function(e) {
              if (alive) s[1]({ loading: false, data: null, error: errText(e) });
            });
            return function() {
              alive = false;
            };
          },
          (deps || []).concat([tick[0]])
        );
        return { loading: s[0].loading, data: s[0].data, error: s[0].error, refresh };
      }
      return {
        unwrap,
        call,
        errText,
        fmtTime,
        Switch: require_switch().Switch,
        switchStyles: require_switch().styles,
        NumberField: require_number_field().NumberField,
        numberFieldStyles: require_number_field().styles,
        validateNumber: require_number_field().validateNumber,
        Btn,
        Field,
        Notice,
        Empty,
        Pill,
        Json,
        useLoad
      };
    };
  }
});

// packages/addons/contacts/client/ui/common.cjs
var require_common = __commonJS({
  "packages/addons/contacts/client/ui/common.cjs"(exports2, module2) {
    "use strict";
    module2.exports = require_client_common()("wbct");
  }
});

// packages/addons/contacts/client/views/contacts.cjs
var require_contacts = __commonJS({
  "packages/addons/contacts/client/views/contacts.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    var icons = require_icons2();
    function empty() {
      return { id: "", name: "", org: "", title: "", note: "", birthday: "", fieldsText: "", groups: [] };
    }
    function fieldsText(fields) {
      return (fields || []).map(function(f) {
        return f.kind + ":" + f.value;
      }).join("\n");
    }
    function fromContact(c) {
      return { id: c.id, name: c.name, org: c.org, title: c.title, note: c.note, birthday: c.birthday, fieldsText: fieldsText(c.fields), groups: (c.groups || []).map(function(g) {
        return g.id;
      }) };
    }
    function parseFields(text) {
      return String(text || "").split(/\n+/).map(function(line) {
        return line.trim();
      }).filter(Boolean).map(function(line) {
        var i = line.indexOf(":");
        if (i < 0) return { kind: "email", value: line };
        return { kind: line.slice(0, i).trim() || "email", value: line.slice(i + 1).trim() };
      }).filter(function(f) {
        return f.value;
      });
    }
    module2.exports = function ContactsView(props) {
      var h = props.h, api = props.api, React = props.React;
      var q = React.useState("");
      var form = React.useState(null);
      var msg = React.useState("");
      var list = C.useLoad(React, api, "contacts.list", { q: q[0] || void 0, limit: 100 }, [q[0]]);
      var groups = C.useLoad(React, api, "contacts.groupList", {}, []);
      var f = form[0];
      function set(k, v) {
        var n = Object.assign({}, f);
        n[k] = v;
        form[1](n);
      }
      function fail(e) {
        msg[1](C.errText(e));
      }
      function save() {
        var payload = { id: f.id || void 0, name: f.name, org: f.org, title: f.title, note: f.note, birthday: f.birthday, fields: parseFields(f.fieldsText), groups: f.groups };
        C.call(api, f.id ? "contacts.update" : "contacts.create", payload).then(function() {
          form[1](null);
          list.refresh();
          msg[1]("\u5DF2\u4FDD\u5B58");
        }).catch(fail);
      }
      function remove(c) {
        if (typeof window !== "undefined" && !window.confirm("\u5220\u9664\u8054\u7CFB\u4EBA\u300C" + c.name + "\u300D\uFF1F")) return;
        C.call(api, "contacts.delete", { id: c.id }).then(function() {
          list.refresh();
        }).catch(fail);
      }
      var rows = list.data && list.data.items || [];
      var gs = groups.data && groups.data.items || [];
      function toggleGroup(id) {
        var cur = f.groups || [];
        set("groups", cur.indexOf(id) >= 0 ? cur.filter(function(x) {
          return x !== id;
        }) : cur.concat([id]));
      }
      return h(
        "div",
        { className: "wbct-wrap" },
        h("div", { className: "wbct-head" }, h("h2", null, "\u8054\u7CFB\u4EBA"), h(
          "div",
          { className: "wbct-row" },
          h(C.Btn, { h, kind: "primary", onClick: function() {
            form[1](empty());
            msg[1]("");
          } }, icons.label("user-plus", "\u65B0\u5EFA", { short: true })),
          h(C.Btn, { h, onClick: list.refresh }, "\u5237\u65B0")
        )),
        h(C.Notice, { h, text: msg[0] }),
        h(C.Field, { h, label: "\u641C\u7D22" }, h("input", { className: "wbct-input", value: q[0], placeholder: "\u59D3\u540D / \u7EC4\u7EC7 / \u90AE\u7BB1 / \u7535\u8BDD", onChange: function(e) {
          q[1](e.target.value);
        } })),
        list.error ? h(C.Notice, { h, kind: "error", text: list.error }) : null,
        rows.length === 0 && !list.loading ? h(C.Empty, { h, text: "\u8FD8\u6CA1\u6709\u8054\u7CFB\u4EBA\uFF1B\u65B0\u5EFA\u4E00\u4E2A\u6216\u4ECE vCard \u5BFC\u5165\u3002" }) : null,
        h("div", { className: "wbct-table-wrap" }, h(
          "table",
          { className: "wbct-table" },
          // 窄屏按列裁剪：组织/职位、分组、更新时间三列在 ≤600px 隐藏，只留姓名/联系方式/操作。
          h("thead", null, h("tr", null, [["\u59D3\u540D", "wbct-c-name"], ["\u7EC4\u7EC7 / \u804C\u4F4D", "wbct-c-org"], ["\u8054\u7CFB\u65B9\u5F0F", "wbct-c-contact"], ["\u5206\u7EC4", "wbct-c-groups"], ["\u66F4\u65B0\u65F6\u95F4", "wbct-c-updated"], ["\u64CD\u4F5C", ""]].map(function(x) {
            return h("th", { key: x[0], className: x[1] || void 0 }, x[0]);
          }))),
          h("tbody", null, rows.map(function(c) {
            return h(
              "tr",
              { key: c.id },
              h("td", { className: "wbct-c-name" }, h("b", null, c.name)),
              h("td", { className: "wbct-c-org" }, [c.org, c.title].filter(Boolean).join(" / ") || "\u2014"),
              h("td", { className: "wbct-c-contact" }, h(
                "div",
                { className: "wbct-muted wbct-fields" },
                (c.fields || []).length ? c.fields.map(function(x, i) {
                  return h("span", { className: "wbct-field", key: i }, x.kind + ": " + x.value);
                }) : "\u2014"
              )),
              h("td", { className: "wbct-c-groups" }, (c.groups || []).map(function(g) {
                return h(C.Pill, { h, key: g.id }, g.name);
              })),
              h("td", { className: "wbct-c-updated" }, C.fmtTime(c.updatedAt, props.lang)),
              h("td", { className: "wbct-c-act" }, h(
                "div",
                { className: "wbct-row" },
                h(C.Btn, { h, onClick: function() {
                  form[1](fromContact(c));
                } }, "\u7F16\u8F91"),
                h(C.Btn, { h, kind: "danger", onClick: function() {
                  remove(c);
                } }, "\u5220\u9664")
              ))
            );
          }))
        )),
        f ? h(
          "div",
          { className: "wbct-panel" },
          h("h3", null, f.id ? "\u7F16\u8F91\u8054\u7CFB\u4EBA" : "\u65B0\u5EFA\u8054\u7CFB\u4EBA"),
          h(
            "div",
            { className: "wbct-grid" },
            h(C.Field, { h, label: "\u59D3\u540D" }, h("input", { className: "wbct-input", value: f.name, onChange: function(e) {
              set("name", e.target.value);
            } })),
            h(C.Field, { h, label: "\u7EC4\u7EC7" }, h("input", { className: "wbct-input", value: f.org, onChange: function(e) {
              set("org", e.target.value);
            } })),
            h(C.Field, { h, label: "\u804C\u4F4D" }, h("input", { className: "wbct-input", value: f.title, onChange: function(e) {
              set("title", e.target.value);
            } })),
            h(C.Field, { h, label: "\u751F\u65E5 YYYY-MM-DD" }, h("input", { className: "wbct-input", value: f.birthday, onChange: function(e) {
              set("birthday", e.target.value);
            } }))
          ),
          h(C.Field, { h, label: "\u8054\u7CFB\u65B9\u5F0F\uFF08\u6BCF\u884C kind:value\uFF0Ckind=email/phone/im/url\uFF09" }, h("textarea", { className: "wbct-input wbct-code", rows: 4, value: f.fieldsText, onChange: function(e) {
            set("fieldsText", e.target.value);
          } })),
          h(C.Field, { h, label: "\u5907\u6CE8" }, h("textarea", { className: "wbct-input", rows: 3, value: f.note, onChange: function(e) {
            set("note", e.target.value);
          } })),
          h(C.Field, { h, label: "\u5206\u7EC4" }, h("div", { className: "wbct-pills" }, gs.map(function(g) {
            return h("label", { key: g.id, className: "wbct-check" }, h("input", { type: "checkbox", checked: (f.groups || []).indexOf(g.id) >= 0, onChange: function() {
              toggleGroup(g.id);
            } }), g.name);
          }))),
          h("div", { className: "wbct-row" }, h(C.Btn, { h, kind: "primary", onClick: save }, "\u4FDD\u5B58"), h(C.Btn, { h, onClick: function() {
            form[1](null);
          } }, "\u53D6\u6D88"))
        ) : null
      );
    };
  }
});

// packages/addons/contacts/client/views/groups.cjs
var require_groups = __commonJS({
  "packages/addons/contacts/client/views/groups.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    module2.exports = function GroupsView(props) {
      var h = props.h, api = props.api, React = props.React;
      var list = C.useLoad(React, api, "contacts.groupList", {}, []);
      var name = React.useState("");
      var color = React.useState("#11a89b");
      var msg = React.useState("");
      function create() {
        C.call(api, "contacts.groupCreate", { name: name[0], color: color[0] }).then(function() {
          name[1]("");
          list.refresh();
        }).catch(function(e) {
          msg[1](C.errText(e));
        });
      }
      function remove(g) {
        if (typeof window !== "undefined" && !window.confirm("\u5220\u9664\u5206\u7EC4\u300C" + g.name + "\u300D\uFF1F\u8054\u7CFB\u4EBA\u672C\u8EAB\u4E0D\u4F1A\u88AB\u5220\u9664\u3002")) return;
        C.call(api, "contacts.groupDelete", { id: g.id }).then(function() {
          list.refresh();
        }).catch(function(e) {
          msg[1](C.errText(e));
        });
      }
      var rows = list.data && list.data.items || [];
      return h(
        "div",
        { className: "wbct-wrap" },
        h("h2", null, "\u5206\u7EC4"),
        h(C.Notice, { h, text: msg[0] }),
        h(
          "div",
          { className: "wbct-panel" },
          h(
            "div",
            { className: "wbct-row" },
            h("input", { className: "wbct-input", placeholder: "\u65B0\u5206\u7EC4\u540D\u79F0", value: name[0], onChange: function(e) {
              name[1](e.target.value);
            } }),
            h("input", { className: "wbct-input", type: "color", value: color[0], onChange: function(e) {
              color[1](e.target.value);
            }, style: { width: "48px" } }),
            h(C.Btn, { h, kind: "primary", onClick: create }, "\u65B0\u5EFA")
          )
        ),
        rows.length === 0 && !list.loading ? h(C.Empty, { h, text: "\u8FD8\u6CA1\u6709\u5206\u7EC4" }) : null,
        h("div", { className: "wbct-table-wrap" }, h(
          "table",
          { className: "wbct-table" },
          h("thead", null, h("tr", null, ["\u540D\u79F0", "\u989C\u8272", "\u4EBA\u6570", "\u64CD\u4F5C"].map(function(x) {
            return h("th", { key: x }, x);
          }))),
          h("tbody", null, rows.map(function(g) {
            return h("tr", { key: g.id }, h("td", null, h(C.Pill, { h }, g.name)), h("td", null, g.color || "\u2014"), h("td", null, g.count || 0), h("td", null, h(C.Btn, { h, kind: "danger", onClick: function() {
              remove(g);
            } }, "\u5220\u9664")));
          }))
        ))
      );
    };
  }
});

// packages/addons/contacts/client/views/importExport.cjs
var require_importExport = __commonJS({
  "packages/addons/contacts/client/views/importExport.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    module2.exports = function ImportExportView(props) {
      var h = props.h, api = props.api, React = props.React;
      var text = React.useState("");
      var out = React.useState("");
      var msg = React.useState("");
      function doImport() {
        C.call(api, "contacts.importVcf", { text: text[0] }).then(function(r) {
          msg[1]("\u5BFC\u5165 " + r.imported + " \u6761\uFF0C\u8DF3\u8FC7 " + r.skipped + " \u6761");
        }).catch(function(e) {
          msg[1](C.errText(e));
        });
      }
      function doExport() {
        C.call(api, "contacts.exportVcf", {}).then(function(r) {
          out[1](r.vcf);
          msg[1]("\u5BFC\u51FA " + r.count + " \u6761");
        }).catch(function(e) {
          msg[1](C.errText(e));
        });
      }
      return h(
        "div",
        { className: "wbct-wrap" },
        h("h2", null, "\u5BFC\u5165 / \u5BFC\u51FA"),
        h(C.Notice, { h, text: msg[0] }),
        h(
          "div",
          { className: "wbct-panel" },
          h("h3", null, "\u5BFC\u5165 vCard"),
          h("p", { className: "wbct-muted" }, "\u7C98\u8D34 vCard 3.0 \u6587\u672C\uFF1B\u6BCF\u5F20\u5361\u7247\u9700\u6709 FN \u4E0E\u81F3\u5C11\u4E00\u4E2A EMAIL/TEL/URL\u3002\u6700\u591A 500 \u6761\u3002"),
          h("textarea", { className: "wbct-input wbct-code", rows: 8, value: text[0], onChange: function(e) {
            text[1](e.target.value);
          }, placeholder: "BEGIN:VCARD..." }),
          h(C.Btn, { h, kind: "primary", onClick: doImport }, "\u5BFC\u5165")
        ),
        h(
          "div",
          { className: "wbct-panel" },
          h("h3", null, "\u5BFC\u51FA vCard"),
          h(C.Btn, { h, onClick: doExport }, "\u5BFC\u51FA\u5168\u90E8\uFF08\u6700\u591A 200 \u6761\uFF09"),
          h("textarea", { className: "wbct-input wbct-code", rows: 10, value: out[0], readOnly: true })
        )
      );
    };
  }
});

// packages/addons/contacts/client/views/config.cjs
var require_config = __commonJS({
  "packages/addons/contacts/client/views/config.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    module2.exports = function ConfigView(props) {
      var h = props.h, api = props.api, React = props.React;
      var st = C.useLoad(React, api, "contacts.status", {}, []);
      return h(
        "div",
        { className: "wbct-wrap" },
        h("h2", null, "\u8BBE\u7F6E"),
        st.error ? h(C.Notice, { h, kind: "error", text: st.error }) : null,
        h(
          "div",
          { className: "wbct-panel" },
          h("h3", null, "\u6570\u636E"),
          h("p", null, "\u8054\u7CFB\u4EBA " + (st.data && st.data.contacts || 0) + " \u4E2A\uFF0C\u5206\u7EC4 " + (st.data && st.data.groups || 0) + " \u4E2A\uFF0C\u5B57\u6BB5 " + (st.data && st.data.fields || 0) + " \u4E2A\u3002"),
          h("p", null, "\u8054\u7CFB\u4EBA\u53EA\u5728\u672C\u673A\u4FDD\u5B58\uFF0C\u4E0D\u53C2\u4E0E\u4E91\u540C\u6B65\uFF1B\u5907\u4EFD\u5305\u542B\u8054\u7CFB\u4EBA\u4E0E\u5206\u7EC4\u3002")
        ),
        h(
          "div",
          { className: "wbct-panel" },
          h("h3", null, "\u5BFC\u5165\u5BFC\u51FA"),
          h("p", null, "vCard 3.0\uFF1B\u5BFC\u5165\u6309 FN \u4E0E EMAIL/TEL/URL \u8BC6\u522B\uFF0C\u7A7A\u59D3\u540D\u6216\u7A7A\u8054\u7CFB\u65B9\u5F0F\u4F1A\u8DF3\u8FC7\u3002"),
          h("p", { className: "wbct-muted" }, "CardDAV \u540C\u6B65\u4E0D\u5728\u672C\u63D2\u4EF6\uFF1B\u7531\u8FDE\u63A5\u5668\u9A71\u52A8\u53E6\u884C\u5904\u7406\u3002")
        )
      );
    };
  }
});

// packages/addons/lib/highlight.cjs
var require_highlight = __commonJS({
  "packages/addons/lib/highlight.cjs"(exports2, module2) {
    "use strict";
    module2.exports = function(React) {
      var h = React.createElement;
      function sourceOf(keyword) {
        var pattern = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return pattern.replace(/[a-zA-Z]/g, function(letter) {
          return "[" + letter.toLowerCase() + letter.toUpperCase() + "]";
        });
      }
      return function createHighlight(prefix) {
        var className = String(prefix || "wb") + "-hit";
        function hit(rawText, rawKeyword) {
          var text = rawText == null ? "" : String(rawText);
          var keyword = rawKeyword == null ? "" : String(rawKeyword);
          if (!keyword) return text;
          var matcher, match, end = 0, parts = [];
          try {
            matcher = new RegExp(sourceOf(keyword), "g");
          } catch (error) {
            return text;
          }
          while (match = matcher.exec(text)) {
            if (match.index > end) parts.push(text.slice(end, match.index));
            parts.push(h("mark", { className, key: match.index }, match[0]));
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
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/chevron-right.mjs
var chevron_right_exports = {};
__export(chevron_right_exports, {
  __iconData: () => __iconData8,
  default: () => ChevronRight
});
var __iconData8, ChevronRight;
var init_chevron_right = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/chevron-right.mjs"() {
    init_createLucideIcon();
    __iconData8 = {
      name: "chevron-right",
      size: 24,
      node: [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]]
    };
    __iconData8.node;
    ChevronRight = createLucideIcon(__iconData8);
  }
});

// packages/addons/lib/disclosure-styles.cjs
var require_disclosure_styles = __commonJS({
  "packages/addons/lib/disclosure-styles.cjs"(exports2, module2) {
    "use strict";
    module2.exports = [
      ".wb-disc{min-width:0;border:0;padding:0;margin:0}",
      // 原生 details/summary 保留键盘与无障碍语义，这里只接管观感：去掉默认三角并铺满整行。
      ".wb-disc>summary{display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12.5px;font-weight:600;line-height:1.6;color:inherit;user-select:none;list-style:none;padding:2px 8px 2px 2px;margin:-2px -8px -2px -2px;border-radius:7px}",
      ".wb-disc>summary::-webkit-details-marker{display:none}",
      '.wb-disc>summary::marker{content:""}',
      ".wb-disc>summary:hover{background:color-mix(in oklab,currentColor 6%,transparent)}",
      ".wb-disc>summary:focus-visible{outline:2px solid var(--wb-accent,var(--dsw-alias-brand-primary,Highlight));outline-offset:2px}",
      ".wb-disc-chev{flex:0 0 auto;width:14px;height:14px;transition:transform 160ms ease}",
      ".wb-disc[open]>summary .wb-disc-chev{transform:rotate(90deg)}",
      ".wb-disc-title{min-width:0;overflow-wrap:anywhere}",
      ".wb-disc-meta{font-weight:400;font-size:12px;color:var(--wb-muted,var(--dsw-alias-label-tertiary,GrayText))}",
      ".wb-disc-body{margin-top:8px;min-width:0;animation:wb-disc-in 160ms ease}",
      "@keyframes wb-disc-in{from{opacity:0;transform:translateY(-2px)}to{opacity:1;transform:none}}",
      "@media(prefers-reduced-motion:reduce){.wb-disc-chev{transition:none}.wb-disc-body{animation:none}}"
    ].join("\n");
  }
});

// packages/addons/lib/disclosure.cjs
var require_disclosure = __commonJS({
  "packages/addons/lib/disclosure.cjs"(exports2, module2) {
    "use strict";
    var ChevronRight2 = (init_chevron_right(), __toCommonJS(chevron_right_exports)).default;
    function createDisclosure(React) {
      var h = React.createElement;
      function Disclosure(props) {
        var attrs = Object.assign({ className: ("wb-disc " + (props.className || "")).trim() }, props.attrs || {});
        if (props.open !== void 0) attrs.open = !!props.open;
        else if (props.defaultOpen !== void 0) attrs.open = !!props.defaultOpen;
        if (props.onToggle) attrs.onToggle = props.onToggle;
        return h(
          "details",
          attrs,
          h(
            "summary",
            null,
            h(ChevronRight2, { className: "wb-disc-chev", "aria-hidden": true, focusable: false }),
            h("span", { className: "wb-disc-title" }, props.title),
            props.meta != null && props.meta !== "" ? h("span", { className: "wb-disc-meta" }, props.meta) : null
          ),
          h("div", { className: "wb-disc-body" }, props.children)
        );
      }
      return { Disclosure, css: require_disclosure_styles() };
    }
    module2.exports = { createDisclosure, css: require_disclosure_styles() };
  }
});

// packages/addons/lib/action-schema-style.cjs
var require_action_schema_style = __commonJS({
  "packages/addons/lib/action-schema-style.cjs"(exports2, module2) {
    "use strict";
    module2.exports = function(PREFIX, DOMAIN) {
      var P = PREFIX + "-as";
      var hairline = "1px solid color-mix(in oklab,currentColor 8%,transparent)";
      var CSS = [
        "." + P + "{display:flex;flex-direction:column;gap:12px;width:100%;min-width:0;font-size:13px;color:inherit}",
        "." + P + "-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
        "." + P + "-title{font-size:15px;font-weight:660;margin:0}",
        "." + P + "-badge{display:inline-flex;align-items:center;gap:4px;max-width:100%;border:1px solid var(--wb-border,#e3e5e9);border-radius:999px;padding:1px 8px;font-size:11px;color:var(--dsw-alias-label-secondary,currentColor);font-variant-numeric:tabular-nums;overflow-wrap:anywhere}",
        "." + P + "-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px}",
        "." + P + "-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
        "." + P + "-search{position:relative;flex:1 1 220px;min-width:0;display:flex;align-items:center}",
        "." + P + "-search input{width:100%;border:1px solid var(--wb-border,#e3e5e9);border-radius:8px;background:var(--wb-surface,var(--dsw-alias-bg-layer-1,transparent));color:inherit;font:inherit;padding:6px 10px 6px 30px}",
        "." + P + "-search input:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4f6ef7);outline-offset:1px}",
        "." + P + "-search .wbi-svg{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--dsw-alias-label-tertiary,inherit)}",
        "." + P + " select{border:1px solid var(--wb-border,#e3e5e9);border-radius:8px;background:var(--wb-surface,var(--dsw-alias-bg-layer-1,transparent));color:inherit;font:inherit;padding:6px 8px;max-width:100%}",
        "." + P + " select:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4f6ef7);outline-offset:1px}",
        "." + P + "-list{display:flex;flex-direction:column;gap:8px}",
        "." + P + "-card{border:1px solid var(--wb-border,#e3e5e9);border-radius:10px;padding:10px 12px;background:var(--wb-surface,var(--dsw-alias-bg-layer-1,transparent));display:flex;flex-direction:column;gap:8px;min-width:0}",
        "." + P + "-cardhead{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:start;gap:8px}",
        "." + P + "-cardmeta{display:flex;align-items:center;flex-wrap:wrap;gap:8px;min-width:0;min-height:24px}",
        "." + P + "-cardhead code{font-weight:640;overflow-wrap:anywhere;min-width:0}",
        "." + P + "-hintline{margin:0;color:var(--dsw-alias-label-tertiary,inherit);font-size:11.5px;line-height:1.5}",
        "." + P + "-origins{display:inline-flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end;min-width:0}",
        "." + P + "-origins-label{font-size:11px;color:var(--wb-muted);white-space:nowrap}",
        "." + P + "-origin{display:inline-flex;align-items:center;gap:4px;font-size:11.5px;color:var(--wb-muted);cursor:pointer;user-select:none}",
        // 该 action 本身不支持的来源：整项置灰、不可点，示意「不是没开，是开不了」。
        "." + P + "-origin-off{opacity:.55;cursor:not-allowed}",
        "." + P + "-origin input[type=checkbox]{width:13px;height:13px;margin:0;accent-color:var(--wb-accent);cursor:inherit}",
        "." + P + "-origin input[type=checkbox]:focus-visible{outline:2px solid var(--wb-accent);outline-offset:2px}",
        "." + P + "-locked{border-color:var(--wb-warn,#b7791f);color:var(--wb-warn,#b7791f)}",
        "." + P + "-desc{margin:0;color:var(--dsw-alias-label-secondary,inherit);line-height:1.55;font-size:12.5px;overflow-wrap:anywhere}",
        // 搜索命中：用品牌色透明度叠加而不是写死浅色，深浅主题都可读；继承文字颜色、不覆盖 ::selection。
        "." + P + " mark." + P + "-hit{background:color-mix(in oklab,var(--dsw-alias-brand-primary,#4f6ef7) 22%,transparent);color:inherit;border-radius:2px;padding:0;font:inherit;box-decoration-break:clone;-webkit-box-decoration-break:clone}",
        "." + P + "-table{width:100%;border-collapse:collapse;font-size:12px;table-layout:auto}",
        "." + P + "-table th{text-align:left;font-weight:620;font-size:11px;letter-spacing:.4px;text-transform:uppercase;color:var(--dsw-alias-label-tertiary,inherit);padding:4px 8px 4px 0;white-space:nowrap}",
        "." + P + "-table td{padding:4px 8px 4px 0;vertical-align:top;border-top:" + hairline + ";line-height:1.5;overflow-wrap:anywhere}",
        "." + P + "-req{color:var(--dsw-alias-state-error-primary,#d9534f);font-weight:620}",
        "." + P + "-opt{color:var(--dsw-alias-label-tertiary,inherit)}",
        "." + P + "-none{color:var(--dsw-alias-label-tertiary,inherit);font-size:12px}",
        "." + P + "-example{position:relative;display:flex;flex-direction:column;gap:4px;min-width:0}",
        "." + P + "-examplehead{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}",
        "." + P + "-pre{margin:0;padding:8px 10px;border-radius:8px;background:var(--dsw-alias-bg-skeleton,#f2f3f5);color:inherit;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;line-height:1.5;overflow:auto;max-height:280px;white-space:pre-wrap;word-break:break-word}",
        "." + P + "-copy{border:1px solid var(--wb-border,#e3e5e9);border-radius:7px;background:transparent;color:inherit;font:inherit;font-size:11.5px;padding:2px 8px;cursor:pointer}",
        "." + P + "-copy:hover{background:var(--dsw-alias-interactive-bg-hover,color-mix(in oklab,currentColor 5%,transparent))}",
        "." + P + "-copy:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4f6ef7);outline-offset:2px}",
        // 折叠头观感已收口到共享控件 disclosure-styles.cjs（.wb-disc），这里不再重复定义 details>summary。
        "." + P + "-params{min-width:0}",
        "." + P + "-empty{padding:24px;text-align:center;border:1px dashed var(--wb-border,#e3e5e9);border-radius:10px;color:var(--dsw-alias-label-tertiary,inherit)}",
        "." + P + "-error{padding:12px;border:1px solid var(--dsw-alias-state-error-primary,#d9534f);border-radius:10px;color:var(--dsw-alias-state-error-primary,#d9534f);display:flex;gap:10px;align-items:center;flex-wrap:wrap;overflow-wrap:anywhere}",
        "." + P + "-toast{position:sticky;bottom:8px;align-self:flex-start;border-radius:999px;padding:3px 10px;background:var(--dsw-alias-bg-skeleton,#f2f3f5);font-size:11.5px;max-width:100%}",
        // 窄屏：五列参数表压成一列会丢失列名、且 table 布局按最小内容宽度撑破容器，
        // 这里整体改成块级网格：每行 = 名称 / 类型 / 必填 + 约束行 + 说明行，行间用细线分隔。
        "@media(max-width:760px){." + P + "-toolbar{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;align-items:end}." + P + "-search{grid-column:1/-1}." + P + "-toolbar>label{display:flex;flex-direction:column;align-items:stretch;gap:4px;min-width:0}." + P + "-toolbar select{width:100%;min-width:0}." + P + "-cardhead{grid-template-columns:minmax(0,1fr);row-gap:6px}." + P + "-origins{justify-content:flex-start}." + P + "-table{display:block}." + P + "-table thead{display:none}." + P + "-table tbody{display:block}." + P + '-table tr{display:grid;grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:"name type need" "extra extra extra" "desc desc desc";column-gap:8px;padding:9px 0;border-top:' + hairline + "}." + P + "-table tr:first-child{border-top:0;padding-top:2px}." + P + "-table tr:last-child{padding-bottom:2px}." + P + "-table td{display:block;border:0;padding:0;min-width:0}." + P + "-table td:empty{display:none}." + P + "-pname{grid-area:name;font-weight:640}." + P + "-ptype{grid-area:type;justify-self:start;align-self:center;color:var(--dsw-alias-label-tertiary,inherit)}." + P + "-pneed{grid-area:need;justify-self:end;align-self:center;font-size:11px;line-height:1.6;white-space:nowrap}." + P + "-pextra{grid-area:extra;margin-top:3px;color:var(--dsw-alias-label-secondary,inherit);line-height:1.55}." + P + "-pdesc{grid-area:desc;margin-top:3px;color:var(--dsw-alias-label-secondary,inherit);line-height:1.55}}",
        // 中等宽度（521–760px）三个筛选项正好排成一行，避免第三项独占一行显得参差。
        "@media(min-width:521px) and (max-width:760px){." + P + "-toolbar{grid-template-columns:repeat(3,minmax(0,1fr))}}",
        "@media(max-width:420px){." + P + "-toolbar{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}." + P + "-card{padding:10px}." + P + "-table tr{padding:8px 0}}"
      ].join("\n") + "\n" + require_disclosure_styles();
      return function injectCss() {
        if (typeof document === "undefined") return;
        var id = "wb-addon-" + DOMAIN + "-actions-css";
        var old = document.getElementById(id);
        if (old) {
          old.textContent = CSS;
          return;
        }
        var style = document.createElement("style");
        style.id = id;
        style.setAttribute("data-wb-addon", "wb-addon-" + DOMAIN);
        style.textContent = CSS;
        document.head.appendChild(style);
      };
    };
  }
});

// packages/addons/lib/action-schema-view.cjs
var require_action_schema_view = __commonJS({
  "packages/addons/lib/action-schema-view.cjs"(exports2, module2) {
    "use strict";
    var React = require("react");
    var createHighlight = require_highlight()(React);
    var Disclosure = require_disclosure().createDisclosure(React).Disclosure;
    var h = React.createElement;
    var COPY = {
      zh: {
        title: "Action",
        hint: "\u8FD0\u884C\u65F6\u6CE8\u518C \xB7 \u53EA\u8BFB",
        switchHint: "\u5141\u8BB8\u6765\u6E90\u843D\u672C\u673A\u3001\u5373\u6539\u5373\u751F\u6548\uFF1A\u52FE\u4E0A\u7684\u6765\u6E90\u624D\u80FD\u8C03\u7528\u8BE5 action\uFF0C\u5176\u4F59\u4F1A\u88AB ACTION_ORIGIN_DENIED \u62E6\u4E0B\u3002",
        hostHint: "\u5BBF\u4E3B action \u7684\u5141\u8BB8\u6765\u6E90\uFF1B\u6807\u300C\u6765\u6E90\u56FA\u5B9A\u300D\u7684\u4E0D\u53EF\u4FEE\u6539\u3002",
        originsLabel: "\u5141\u8BB8\u6765\u6E90",
        originUi: "\u754C\u9762",
        originPlugin: "\u63D2\u4EF6",
        originAgent: "agent",
        originSync: "\u540C\u6B65",
        originsSaving: "\u4FDD\u5B58\u4E2D\u2026",
        originsToast: "\u5DF2\u66F4\u65B0\u5141\u8BB8\u6765\u6E90",
        originsFail: "\u66F4\u65B0\u5141\u8BB8\u6765\u6E90\u5931\u8D25",
        originsEmpty: "\u81F3\u5C11\u8981\u4FDD\u7559\u4E00\u4E2A\u6765\u6E90",
        originsUnsupported: "\u8BE5 action \u672C\u8EAB\u4E0D\u652F\u6301\u8FD9\u4E2A\u6765\u6E90",
        originsPinned: "\u6765\u6E90\u56FA\u5B9A",
        originsPinnedHint: "\u8BE5 action \u7684\u5141\u8BB8\u6765\u6E90\u88AB\u56FA\u5B9A\uFF08\u5B89\u5168\u7EA6\u675F\uFF09\uFF0C\u4E0D\u80FD\u4FEE\u6539",
        domain: "\u57DF",
        versionLabel: "\u7248\u672C",
        shell: "\u5BBF\u4E3B",
        count: function(shown, total) {
          return shown + " / " + total + " \u4E2A action";
        },
        search: "\u641C\u7D22\u540D\u79F0\u3001\u63CF\u8FF0\u3001\u53C2\u6570\uFF08\u547D\u4E2D\u5904\u9AD8\u4EAE\uFF09",
        filterReq: "\u5FC5\u586B\u7B5B\u9009",
        all: "\u5168\u90E8",
        onlyRequired: "\u542B\u5FC5\u586B\u9879",
        onlyOptional: "\u65E0\u5FC5\u586B\u9879",
        filterType: "\u53C2\u6570\u7C7B\u578B",
        allTypes: "\u5168\u90E8\u7C7B\u578B",
        filterOrigin: "\u5141\u8BB8\u6765\u6E90",
        allOrigins: "\u5168\u90E8\u6765\u6E90",
        colName: "\u53C2\u6570",
        colType: "\u7C7B\u578B",
        colReq: "\u5FC5\u586B",
        colExtra: "\u9ED8\u8BA4 / \u679A\u4E3E / \u7EA6\u675F",
        colDesc: "\u8BF4\u660E",
        required: "\u5FC5\u586B",
        optional: "\u53EF\u9009",
        noParams: "\u65E0\u53C2\u6570",
        paramCount: function(n) {
          return n + " \u4E2A\u53C2\u6570";
        },
        params: "\u53C2\u6570",
        requiredCount: function(n) {
          return "\u5FC5\u586B " + n;
        },
        examples: "\u793A\u4F8B",
        noExamples: "\u65E0\u793A\u4F8B",
        copy: "\u590D\u5236",
        copied: "\u5DF2\u590D\u5236",
        raw: "\u539F\u59CB JSON Schema",
        loading: "\u8F7D\u5165\u4E2D\u2026",
        loadFail: "\u8BFB\u53D6 action schema \u5931\u8D25",
        retry: "\u91CD\u8BD5",
        empty: "\u6CA1\u6709\u5339\u914D\u7684 action",
        emptyRegistry: "\u8BE5\u57DF\u6CA1\u6709\u6CE8\u518C action",
        envelope: "\u9ED8\u8BA4",
        enumLabel: "\u679A\u4E3E",
        range: "\u8303\u56F4",
        length: "\u957F\u5EA6",
        pattern: "\u6B63\u5219",
        format: "\u683C\u5F0F",
        items: "\u5143\u7D20\u6570"
      },
      en: {
        title: "Actions",
        hint: "runtime registry \xB7 read-only",
        switchHint: "Allowed origins are stored locally and apply immediately: only checked origins may call the action; others get ACTION_ORIGIN_DENIED.",
        hostHint: "Allowed origins for host actions; items marked pinned cannot be changed.",
        originsLabel: "Origins",
        originUi: "UI",
        originPlugin: "Plugin",
        originAgent: "Agent",
        originSync: "Sync",
        originsSaving: "Saving\u2026",
        originsToast: "Allowed origins updated",
        originsFail: "Failed to update allowed origins",
        originsEmpty: "Keep at least one origin",
        originsUnsupported: "This action does not support this origin",
        originsPinned: "Pinned",
        originsPinnedHint: "Allowed origins are pinned for this action (security constraint) and cannot be changed",
        originsDefaultOn: "Allowed by default",
        originsDefaultOff: "Off by default, can be enabled",
        domain: "Domain",
        versionLabel: "Version",
        shell: "Host",
        count: function(shown, total) {
          return shown + " / " + total + " actions";
        },
        search: "Search name, description, params (matches highlighted)",
        filterReq: "Required",
        all: "All",
        onlyRequired: "Has required",
        onlyOptional: "No required",
        filterType: "Param type",
        allTypes: "All types",
        filterOrigin: "Origins",
        allOrigins: "All origins",
        colName: "Param",
        colType: "Type",
        colReq: "Required",
        colExtra: "Default / enum / constraints",
        colDesc: "Description",
        required: "required",
        optional: "optional",
        noParams: "No parameters",
        paramCount: function(n) {
          return n + " params";
        },
        params: "Parameters",
        requiredCount: function(n) {
          return n + " required";
        },
        examples: "Examples",
        noExamples: "No examples",
        copy: "Copy",
        copied: "Copied",
        raw: "Raw JSON Schema",
        loading: "Loading\u2026",
        loadFail: "Failed to read action schema",
        retry: "Retry",
        empty: "No matching action",
        emptyRegistry: "This domain has no registered action",
        envelope: "Default",
        enumLabel: "Enum",
        range: "Range",
        length: "Length",
        pattern: "Pattern",
        format: "Format",
        items: "Items"
      }
    };
    function typeLabel(schema) {
      if (!schema || typeof schema !== "object") return "";
      if (Array.isArray(schema.type)) return schema.type.join(" | ");
      if (typeof schema.type === "string") {
        if (schema.type === "array" && schema.items) {
          var inner = typeLabel(schema.items);
          return inner ? inner + "[]" : "array";
        }
        return schema.type;
      }
      if (Array.isArray(schema.oneOf)) return schema.oneOf.map(typeLabel).filter(Boolean).join(" | ");
      if (Array.isArray(schema.anyOf)) return schema.anyOf.map(typeLabel).filter(Boolean).join(" | ");
      return "";
    }
    function typeNames(schema) {
      var label = typeLabel(schema);
      if (!label) return [];
      return label.split("|").map(function(x) {
        return x.trim().replace(/\[\]$/, "");
      }).filter(Boolean);
    }
    function scalar(value) {
      if (typeof value === "string") return JSON.stringify(value);
      return String(value);
    }
    function extraText(schema, t) {
      if (!schema || typeof schema !== "object") return "";
      var parts = [];
      if (Object.prototype.hasOwnProperty.call(schema, "default")) {
        parts.push(t.envelope + " " + scalar(schema.default));
      }
      if (Array.isArray(schema.enum)) {
        parts.push(t.enumLabel + " " + schema.enum.map(scalar).join(" / "));
      }
      if (typeof schema.minimum === "number" || typeof schema.maximum === "number") {
        var lo = typeof schema.minimum === "number" ? schema.minimum : null;
        var hi = typeof schema.maximum === "number" ? schema.maximum : null;
        if (lo !== null && hi !== null) parts.push(t.range + " \u2265" + lo + " \u4E14 \u2264" + hi);
        else if (lo !== null) parts.push(t.range + " \u2265" + lo);
        else parts.push(t.range + " \u2264" + hi);
      }
      if (typeof schema.minLength === "number" || typeof schema.maxLength === "number") {
        parts.push(t.length + " " + (schema.minLength ?? 0) + "\u2013" + (schema.maxLength ?? "\u221E"));
      }
      if (typeof schema.minItems === "number" || typeof schema.maxItems === "number") {
        parts.push(t.items + " " + (schema.minItems ?? 0) + "\u2013" + (schema.maxItems ?? "\u221E"));
      }
      if (typeof schema.pattern === "string") parts.push(t.pattern + " " + schema.pattern);
      if (typeof schema.format === "string") parts.push(t.format + " " + schema.format);
      return parts.join(" \xB7 ");
    }
    function paramRows(action) {
      var input = action && action.input && typeof action.input === "object" ? action.input : {};
      var props = input.properties && typeof input.properties === "object" ? input.properties : {};
      var required = Array.isArray(input.required) ? input.required : [];
      return Object.keys(props).map(function(key) {
        var schema = props[key] && typeof props[key] === "object" ? props[key] : {};
        return {
          name: key,
          schema,
          type: typeLabel(schema),
          types: typeNames(schema),
          required: required.indexOf(key) >= 0,
          description: typeof schema.description === "string" ? schema.description : ""
        };
      });
    }
    module2.exports = function createActionSchemaView(options) {
      var raw = String(options.domain || "");
      var SOURCE = options.source === "actions.list" ? "actions.list" : "actionSchema";
      var DOMAIN = SOURCE === "actions.list" ? raw : raw.indexOf("wb-addon-") === 0 ? raw : "wb-addon-" + raw;
      var LIST_DOMAIN = options.listDomain ? String(options.listDomain) : DOMAIN;
      var prefix = options.prefix;
      var P = prefix + "-as";
      var Icon2 = options.Icon || null;
      var injectCss = require_action_schema_style()(prefix, DOMAIN);
      var Highlight = createHighlight(P);
      function icon(name, size) {
        return Icon2 ? h(Icon2, { name, size: size || 14 }) : null;
      }
      function plainCopy(text) {
        if (typeof document === "undefined") return;
        var area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "readonly");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        try {
          document.execCommand("copy");
        } catch (e) {
        }
        document.body.removeChild(area);
      }
      function ActionSchemaView(props) {
        var lang = props.lang === "en" ? "en" : "zh";
        var t = COPY[lang];
        var api = props.api;
        var snapState = React.useState(null);
        var snap = snapState[0], setSnap = snapState[1];
        var errState = React.useState("");
        var err = errState[0], setErr = errState[1];
        var loadingState = React.useState(true);
        var loading = loadingState[0], setLoading = loadingState[1];
        var reloadState = React.useState(0);
        var reload = reloadState[0], setReload = reloadState[1];
        var queryState = React.useState("");
        var query = queryState[0], setQuery = queryState[1];
        var reqState = React.useState("all");
        var reqMode = reqState[0], setReqMode = reqState[1];
        var typeState = React.useState("");
        var typePick = typeState[0], setTypePick = typeState[1];
        var originFilterState = React.useState("");
        var originPick = originFilterState[0], setOriginPick = originFilterState[1];
        var toastState = React.useState("");
        var toast = toastState[0], setToast = toastState[1];
        var savingState = React.useState("");
        var saving = savingState[0], setSaving = savingState[1];
        var foldsState = React.useState({});
        var folds = foldsState[0], setFolds = foldsState[1];
        React.useEffect(function() {
          injectCss();
        }, []);
        React.useEffect(function() {
          var alive = true;
          setLoading(true);
          setErr("");
          var pending;
          var actionName = SOURCE === "actions.list" ? "actions.list" : DOMAIN.replace(/^wb-addon-/, "") + ".actionSchema";
          var callArgs = SOURCE === "actions.list" ? { detail: true, domain: LIST_DOMAIN } : void 0;
          if (api && typeof api.call === "function") {
            pending = Promise.resolve(api.call(actionName, callArgs)).then(function(r) {
              if (r && r.ok === false) return r;
              return r && r.result || r;
            });
          } else {
            pending = Promise.reject(new Error("no call api"));
          }
          Promise.resolve(pending).then(function(r) {
            if (!alive) return;
            if (!r || r.ok === false) {
              setSnap(null);
              setErr(String(r && (r.error || r.text) || t.loadFail));
            } else {
              setSnap(r);
            }
            setLoading(false);
          }, function(e) {
            if (!alive) return;
            setSnap(null);
            setErr(String(e && e.message || e || t.loadFail));
            setLoading(false);
          });
          return function() {
            alive = false;
          };
        }, [reload]);
        function copy(text) {
          var done = function() {
            setToast(t.copied);
          };
          if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
            navigator.clipboard.writeText(text).then(done, function() {
              plainCopy(text);
              done();
            });
            return;
          }
          plainCopy(text);
          done();
        }
        var ORIGINS = ["ui", "plugin", "agent", "sync"];
        var originText = { ui: t.originUi, plugin: t.originPlugin, agent: t.originAgent, sync: t.originSync };
        function setOrigins(action, origin) {
          var name = action.name;
          var current = Array.isArray(action.origins) ? action.origins.slice() : [];
          var index = current.indexOf(origin);
          var next = index >= 0 ? current.filter(function(o) {
            return o !== origin;
          }) : current.concat([origin]);
          if (next.length === 0) {
            setToast(t.originsEmpty);
            return;
          }
          next = ORIGINS.filter(function(o) {
            return next.indexOf(o) >= 0;
          });
          setSaving(name);
          setToast("");
          var fail = function(e) {
            setSaving("");
            setToast(t.originsFail + "\uFF1A" + String(e && e.message || e || ""));
          };
          var done = function(r) {
            setSaving("");
            var payload = r && typeof r === "object" && Object.prototype.hasOwnProperty.call(r, "result") ? r.result : r;
            if (r && r.ok === false) {
              setToast(t.originsFail + "\uFF1A" + String(r.error || r.text || ""));
              return;
            }
            var value = payload && Array.isArray(payload.origins) ? payload.origins : next;
            var source = payload && typeof payload.source === "string" ? payload.source : action.originsSource;
            setSnap(function(prev) {
              if (!prev || !Array.isArray(prev.actions)) return prev;
              return Object.assign({}, prev, {
                actions: prev.actions.map(function(a) {
                  if (!a || a.name !== name) return a;
                  return Object.assign({}, a, { origins: value, originsSource: source });
                })
              });
            });
            setToast(t.originsToast);
          };
          if (!api || typeof api.call !== "function") {
            fail(new Error("no call api"));
            return;
          }
          Promise.resolve(api.call("actions.setActionOrigins", { action: name, origins: next })).then(done, fail);
        }
        function paramsOpen(action) {
          if (Object.prototype.hasOwnProperty.call(folds, action.name)) return folds[action.name] === true;
          return Boolean(String(query || "").trim()) || reqMode !== "all" || Boolean(typePick);
        }
        function resetFolds() {
          setFolds(function(prev) {
            return Object.keys(prev).length ? {} : prev;
          });
        }
        var all = snap && Array.isArray(snap.actions) ? snap.actions.filter(function(a) {
          return a && a.domain === DOMAIN;
        }) : [];
        var info = snap && Array.isArray(snap.domains) ? snap.domains.filter(function(d) {
          return d && d.id === DOMAIN;
        })[0] || null : null;
        var typeOptions = [];
        all.forEach(function(a) {
          paramRows(a).forEach(function(row) {
            row.types.forEach(function(name) {
              if (typeOptions.indexOf(name) < 0) typeOptions.push(name);
            });
          });
        });
        typeOptions.sort();
        var kw = String(query || "").trim();
        var q = kw.toLowerCase();
        var visible = all.filter(function(a) {
          var rows = paramRows(a);
          if (q) {
            var hay = [a.name || "", a.description || ""].concat(rows.map(function(row) {
              return row.name + " " + row.type + " " + row.description;
            })).join(" ").toLowerCase();
            if (hay.indexOf(q) < 0) return false;
          }
          var hasRequired = rows.some(function(row) {
            return row.required;
          });
          if (reqMode === "required" && !hasRequired) return false;
          if (reqMode === "optional" && hasRequired) return false;
          if (typePick && !rows.some(function(row) {
            return row.types.indexOf(typePick) >= 0;
          })) return false;
          if (originPick && (!Array.isArray(a.origins) || a.origins.indexOf(originPick) < 0)) return false;
          return true;
        });
        function paramRow(row) {
          var extra = extraText(row.schema, t);
          return h(
            "tr",
            { key: row.name },
            h("td", { className: P + "-mono " + P + "-pname" }, Highlight.hit(row.name, kw)),
            h("td", { className: P + "-mono " + P + "-ptype" }, Highlight.hit(row.type, kw)),
            h(
              "td",
              { className: row.required ? P + "-req " + P + "-pneed" : P + "-opt " + P + "-pneed" },
              row.required ? t.required : t.optional
            ),
            // extra（默认 / 枚举 / 约束）不在过滤 haystack 里，因此也不高亮，保持「显示即命中」口径。
            h("td", { className: P + "-mono " + P + "-pextra" }, extra),
            h("td", { className: P + "-pdesc" }, Highlight.hit(row.description, kw))
          );
        }
        function originsChips(action) {
          if (!Array.isArray(action.origins)) return null;
          if (action.originsSource === "invalid") {
            return h("span", { className: P + "-badge " + P + "-locked", title: t.originsPinnedHint, "data-origins-invalid": action.name }, t.originsPinned);
          }
          var busy = saving === action.name;
          var pinned = action.name === "actions.setActionOrigins";
          var supported = Array.isArray(action.originsDeclared) ? action.originsDeclared : action.origins;
          return h(
            "div",
            { className: P + "-origins", "data-origins-row": action.name },
            h("span", { className: P + "-origins-label" }, t.originsLabel),
            ORIGINS.map(function(origin) {
              var on = action.origins.indexOf(origin) >= 0;
              var allowed = supported.indexOf(origin) >= 0;
              var preset = Array.isArray(action.originsDefault) ? action.originsDefault : supported;
              var byDefault = preset.indexOf(origin) >= 0;
              return h(
                "label",
                {
                  key: origin,
                  className: P + "-origin" + (allowed ? "" : " " + P + "-origin-off"),
                  title: pinned ? t.originsPinnedHint : !allowed ? t.originsUnsupported : originText[origin] + " \xB7 " + action.name + " \xB7 " + (byDefault ? t.originsDefaultOn : t.originsDefaultOff)
                },
                h("input", {
                  type: "checkbox",
                  checked: on,
                  disabled: busy || pinned || !allowed,
                  "data-origin": origin,
                  "data-origin-row": action.name,
                  "data-origin-supported": allowed ? "1" : "0",
                  onChange: function() {
                    setOrigins(action, origin);
                  }
                }),
                h("span", null, originText[origin])
              );
            }),
            busy ? h("span", { className: P + "-origins-label" }, t.originsSaving) : null
          );
        }
        function card(action) {
          var rows = paramRows(action);
          var required = rows.filter(function(row) {
            return row.required;
          }).length;
          var open = paramsOpen(action);
          var examples = Array.isArray(action.examples) ? action.examples : [];
          return h(
            "div",
            { className: P + "-card", key: action.name },
            h(
              "div",
              { className: P + "-cardhead" },
              h(
                "div",
                { className: P + "-cardmeta" },
                h("code", { className: P + "-mono" }, Highlight.hit(action.name, kw)),
                h("span", { className: P + "-badge" }, rows.length ? t.paramCount(rows.length) : t.noParams),
                rows.some(function(row) {
                  return row.required;
                }) ? h("span", { className: P + "-badge " + P + "-req" }, t.required) : null
              ),
              originsChips(action)
            ),
            action.description ? h("p", { className: P + "-desc" }, Highlight.hit(action.description, kw)) : null,
            rows.length ? h(
              Disclosure,
              {
                className: P + "-params",
                title: t.params,
                meta: required ? t.requiredCount(required) : "",
                attrs: { "data-params-fold": action.name },
                open,
                // 原生 details 自带键盘与无障碍语义，这里只记下用户的开合；
                // 筛选变化引起的程序性开合也会触发 toggle，记下的值与当次默认一致，随后由 resetFolds 清掉。
                onToggle: function(e) {
                  var next = !!(e && e.currentTarget && e.currentTarget.open);
                  setFolds(function(prev) {
                    if (prev[action.name] === next) return prev;
                    var out = Object.assign({}, prev);
                    out[action.name] = next;
                    return out;
                  });
                }
              },
              h(
                "table",
                { className: P + "-table" },
                h("thead", null, h(
                  "tr",
                  null,
                  h("th", null, t.colName),
                  h("th", null, t.colType),
                  h("th", null, t.colReq),
                  h("th", null, t.colExtra),
                  h("th", null, t.colDesc)
                )),
                h("tbody", null, rows.map(paramRow))
              )
            ) : h("div", { className: P + "-none" }, t.noParams),
            h(
              "div",
              { className: P + "-example" },
              h(
                "div",
                { className: P + "-examplehead" },
                h("span", { className: P + "-none" }, t.examples),
                examples.length ? h("button", {
                  type: "button",
                  className: P + "-copy",
                  "data-copy-example": action.name,
                  onClick: function() {
                    copy(JSON.stringify(examples.length === 1 ? examples[0] : examples, null, 2));
                  }
                }, t.copy) : null
              ),
              examples.length ? examples.map(function(example, index) {
                return h("pre", { className: P + "-pre", key: index }, JSON.stringify(example, null, 2));
              }) : h("div", { className: P + "-none" }, t.noExamples)
            ),
            h(
              Disclosure,
              { title: t.raw },
              h("pre", { className: P + "-pre" }, JSON.stringify(action.input || {}, null, 2))
            )
          );
        }
        var body;
        if (loading) {
          body = h("div", { className: P + "-empty", role: "status" }, t.loading);
        } else if (err) {
          body = h(
            "div",
            { className: P + "-error", role: "alert" },
            h("span", null, t.loadFail + "\uFF1A" + err),
            h("button", { type: "button", className: P + "-copy", onClick: function() {
              setReload(reload + 1);
            } }, t.retry)
          );
        } else if (!all.length) {
          body = h("div", { className: P + "-empty" }, t.emptyRegistry);
        } else if (!visible.length) {
          body = h("div", { className: P + "-empty" }, t.empty);
        } else {
          body = h("div", { className: P + "-list" }, visible.map(card));
        }
        return h(
          "div",
          { className: P },
          h(
            "div",
            { className: P + "-head" },
            h("h3", { className: P + "-title" }, t.title),
            h("span", { className: P + "-badge" }, t.domain + " " + DOMAIN),
            info && info.version ? h("span", { className: P + "-badge" }, t.versionLabel + " v" + info.version) : null,
            snap && snap.shellVersion ? h("span", { className: P + "-badge" }, t.shell + " v" + snap.shellVersion) : null,
            h("span", { className: P + "-badge" }, t.count(visible.length, all.length)),
            h("span", { className: P + "-none" }, t.hint)
          ),
          h("p", { className: P + "-hintline" }, SOURCE === "actions.list" ? t.hostHint : t.switchHint),
          snap ? h(
            "div",
            { className: P + "-toolbar" },
            h(
              "label",
              { className: P + "-search" },
              icon("search", 14),
              h("input", {
                type: "search",
                value: query,
                placeholder: t.search,
                "aria-label": t.search,
                onChange: function(e) {
                  setQuery(e.target.value);
                  resetFolds();
                }
              })
            ),
            h(
              "label",
              { className: P + "-none" },
              t.filterReq + " ",
              h(
                "select",
                { value: reqMode, "aria-label": t.filterReq, onChange: function(e) {
                  setReqMode(e.target.value);
                  resetFolds();
                } },
                h("option", { value: "all" }, t.all),
                h("option", { value: "required" }, t.onlyRequired),
                h("option", { value: "optional" }, t.onlyOptional)
              )
            ),
            h(
              "label",
              { className: P + "-none" },
              t.filterType + " ",
              h(
                "select",
                { value: typePick, "aria-label": t.filterType, onChange: function(e) {
                  setTypePick(e.target.value);
                  resetFolds();
                } },
                h("option", { value: "" }, t.allTypes),
                typeOptions.map(function(name) {
                  return h("option", { value: name, key: name }, name);
                })
              )
            ),
            h(
              "label",
              { className: P + "-none" },
              t.filterOrigin + " ",
              h(
                "select",
                { value: originPick, "aria-label": t.filterOrigin, "data-origin-filter": "", onChange: function(e) {
                  setOriginPick(e.target.value);
                } },
                h("option", { value: "" }, t.allOrigins),
                ORIGINS.map(function(origin) {
                  return h("option", { value: origin, key: origin }, originText[origin]);
                })
              )
            )
          ) : null,
          body,
          toast ? h("div", { className: P + "-toast", role: "status" }, toast) : null
        );
      }
      return { ActionSchemaView, DOMAIN, typeLabel, paramRows };
    };
  }
});

// packages/addons/contacts/client/views/actions.cjs
var require_actions = __commonJS({
  "packages/addons/contacts/client/views/actions.cjs"(exports2, module2) {
    "use strict";
    module2.exports = require_action_schema_view()({
      domain: "wb-addon-contacts",
      prefix: "wbct"
    }).ActionSchemaView;
  }
});

// packages/addons/contacts/client/client.src.cjs
var GLYPHS = require_icons2().ICONS;
(function() {
  var root = typeof window !== "undefined" ? window : null;
  var host = root && root.__WB_HOST__;
  if (!host || !host.react) {
    if (typeof console !== "undefined") console.error("[dsh-workbench-contacts] \u5BBF\u4E3B\u524D\u7AEF\u672A\u5C31\u7EEA");
    module.exports = { name: "dsh-workbench-contacts", inject: [], apply: function() {
    } };
    return;
  }
  var React = host.react;
  var h = host.h;
  var CSS = require_styles();
  var ICONS = {
    users: GLYPHS["users"],
    folder: GLYPHS["folder"],
    upload: GLYPHS["upload"],
    sliders: GLYPHS["sliders-horizontal"],
    list: GLYPHS["list"]
  };
  function Icon2(props) {
    var C = ICONS[props.name] || ICONS.users;
    return h(C, { size: props.size || 14, strokeWidth: 2, "aria-hidden": "true", className: "wbg-svg" });
  }
  function tabIcon(name) {
    return function() {
      return h(Icon2, { name, size: 14 });
    };
  }
  function withProps(Inner, title) {
    return function Wrapped(props) {
      return h(Inner, { api: props.api, lang: props.lang === "en" ? "en" : "zh", h, React, title });
    };
  }
  var injectStyles = require_inject_styles();
  function ensureStyles() {
    injectStyles({ id: "wb-contacts-style", css: CSS, addon: "wb-addon-contacts" });
  }
  ensureStyles();
  host.registerAddon({
    id: "wb-addon-contacts",
    version: "0.1.16",
    icon: GLYPHS["users"],
    views: [
      { id: "contacts", icon: tabIcon("users"), title: { zh: "\u8054\u7CFB\u4EBA", en: "Contacts" }, component: withProps(require_contacts(), "\u8054\u7CFB\u4EBA") },
      { id: "groups", icon: tabIcon("folder"), title: { zh: "\u5206\u7EC4", en: "Groups" }, component: withProps(require_groups(), "\u5206\u7EC4") },
      { id: "importExport", icon: tabIcon("upload"), title: { zh: "\u5BFC\u5165\u5BFC\u51FA", en: "Import / Export" }, component: withProps(require_importExport(), "\u5BFC\u5165\u5BFC\u51FA") },
      { id: "config", icon: tabIcon("sliders"), title: { zh: "\u8BBE\u7F6E", en: "Settings" }, component: withProps(require_config(), "\u8BBE\u7F6E") },
      { id: "actions", icon: tabIcon("list"), title: { zh: "Action", en: "Actions" }, component: withProps(require_actions(), "Action") }
    ]
  });
  module.exports = { name: "dsh-workbench-contacts", inject: [], apply: function() {
  } };
})();
    return module.exports;
  },
});
