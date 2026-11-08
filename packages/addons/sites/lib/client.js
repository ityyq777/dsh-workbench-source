// 由 scripts/build-addon-clients.mjs 生成；请修改 client/client.src.cjs 后重新构建。
window.__ModuleLoader__ = window.__ModuleLoader__ || { modules: {}, load: function (m) { this.modules[m.id] = m.factory; } };
window.__ModuleLoader__.load({
  id: "dsh-workbench-sites",
  factory: function (require) {
    var module = { exports: {} };
    var exports = module.exports;
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

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/toKebabCase.mjs
var toKebabCase;
var init_toKebabCase = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/toKebabCase.mjs"() {
    toKebabCase = (string) => string?.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/toLucideIconData.mjs
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
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/toLucideIconData.mjs"() {
    init_toKebabCase();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/toCamelCase.mjs
var toCamelCase;
var init_toCamelCase = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/toCamelCase.mjs"() {
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

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/toPascalCase.mjs
var toPascalCase;
var init_toPascalCase = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/toPascalCase.mjs"() {
    init_toCamelCase();
    toPascalCase = (string) => {
      const camelCase = toCamelCase(string);
      return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
    };
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var mergeClasses;
var init_mergeClasses = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs"() {
    mergeClasses = (...classes) => classes.filter((className, index, array) => {
      return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
    }).join(" ").trim();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/build/defaultAttributes.mjs
var defaultAttributes;
var init_defaultAttributes = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/build/defaultAttributes.mjs"() {
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

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/build/buildLucideIconNode.mjs
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
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/build/buildLucideIconNode.mjs"() {
    init_defaultAttributes();
    init_mergeClasses();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/build/buildLucideIconForReact.mjs
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
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/build/buildLucideIconForReact.mjs"() {
    init_buildLucideIconNode();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/hasA11yProp.mjs
var hasA11yProp;
var init_hasA11yProp = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/hasA11yProp.mjs"() {
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

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/context.mjs
var import_react, LucideContext, useLucideContext;
var init_context = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/context.mjs"() {
    "use strict";
    "use client";
    import_react = require("react");
    LucideContext = (0, import_react.createContext)({});
    useLucideContext = () => (0, import_react.useContext)(LucideContext);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/Icon.mjs
var import_react2, Icon;
var init_Icon = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/Icon.mjs"() {
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

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/createLucideIcon.mjs
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
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/createLucideIcon.mjs"() {
    import_react3 = require("react");
    init_toLucideIconData();
    init_toPascalCase();
    init_Icon();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/refresh-cw.mjs
var refresh_cw_exports = {};
__export(refresh_cw_exports, {
  __iconData: () => __iconData,
  default: () => RefreshCw
});
var __iconData, RefreshCw;
var init_refresh_cw = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/refresh-cw.mjs"() {
    init_createLucideIcon();
    __iconData = {
      name: "refresh-cw",
      size: 24,
      node: [
        ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
        ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
        ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
        ["path", { d: "M8 16H3v5", key: "1cv678" }]
      ]
    };
    __iconData.node;
    RefreshCw = createLucideIcon(__iconData);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/globe.mjs
var globe_exports = {};
__export(globe_exports, {
  __iconData: () => __iconData2,
  default: () => Globe
});
var __iconData2, Globe;
var init_globe = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/globe.mjs"() {
    init_createLucideIcon();
    __iconData2 = {
      name: "globe",
      size: 24,
      node: [
        ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
        ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", key: "13o1zl" }],
        ["path", { d: "M2 12h20", key: "9i4pu4" }]
      ]
    };
    __iconData2.node;
    Globe = createLucideIcon(__iconData2);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/link-2.mjs
var link_2_exports = {};
__export(link_2_exports, {
  __iconData: () => __iconData3,
  default: () => Link2
});
var __iconData3, Link2;
var init_link_2 = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/link-2.mjs"() {
    init_createLucideIcon();
    __iconData3 = {
      name: "link-2",
      size: 24,
      node: [
        ["path", { d: "M9 17H7A5 5 0 0 1 7 7h2", key: "8i5ue5" }],
        ["path", { d: "M15 7h2a5 5 0 1 1 0 10h-2", key: "1b9ql8" }],
        ["line", { x1: "8", x2: "16", y1: "12", y2: "12", key: "1jonct" }]
      ]
    };
    __iconData3.node;
    Link2 = createLucideIcon(__iconData3);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/tag.mjs
var tag_exports = {};
__export(tag_exports, {
  __iconData: () => __iconData4,
  default: () => Tag
});
var __iconData4, Tag;
var init_tag = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/tag.mjs"() {
    init_createLucideIcon();
    __iconData4 = {
      name: "tag",
      size: 24,
      node: [
        [
          "path",
          {
            d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",
            key: "vktsd0"
          }
        ],
        ["circle", { cx: "7.5", cy: "7.5", r: ".5", fill: "currentColor", key: "kqv944" }]
      ]
    };
    __iconData4.node;
    Tag = createLucideIcon(__iconData4);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/chart-pie.mjs
var __iconData5, ChartPie;
var init_chart_pie = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/chart-pie.mjs"() {
    init_createLucideIcon();
    __iconData5 = {
      name: "chart-pie",
      size: 24,
      node: [
        [
          "path",
          {
            d: "M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z",
            key: "pzmjnu"
          }
        ],
        ["path", { d: "M21.21 15.89A10 10 0 1 1 8 2.83", key: "k2fpak" }]
      ],
      aliases: ["pie-chart"]
    };
    __iconData5.node;
    ChartPie = createLucideIcon(__iconData5);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/pie-chart.mjs
var pie_chart_exports = {};
__export(pie_chart_exports, {
  default: () => ChartPie
});
var init_pie_chart = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/pie-chart.mjs"() {
    init_chart_pie();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/folder-tree.mjs
var folder_tree_exports = {};
__export(folder_tree_exports, {
  __iconData: () => __iconData6,
  default: () => FolderTree
});
var __iconData6, FolderTree;
var init_folder_tree = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/folder-tree.mjs"() {
    init_createLucideIcon();
    __iconData6 = {
      name: "folder-tree",
      size: 24,
      node: [
        [
          "path",
          {
            d: "M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z",
            key: "hod4my"
          }
        ],
        [
          "path",
          {
            d: "M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.9a1 1 0 0 1-.88-.55l-.42-.85a1 1 0 0 0-.92-.6H13a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z",
            key: "w4yl2u"
          }
        ],
        ["path", { d: "M3 5a2 2 0 0 0 2 2h3", key: "f2jnh7" }],
        ["path", { d: "M3 3v13a2 2 0 0 0 2 2h3", key: "k8epm1" }]
      ]
    };
    __iconData6.node;
    FolderTree = createLucideIcon(__iconData6);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/unlink.mjs
var unlink_exports = {};
__export(unlink_exports, {
  __iconData: () => __iconData7,
  default: () => Unlink
});
var __iconData7, Unlink;
var init_unlink = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/unlink.mjs"() {
    init_createLucideIcon();
    __iconData7 = {
      name: "unlink",
      size: 24,
      node: [
        [
          "path",
          {
            d: "m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71",
            key: "yqzxt4"
          }
        ],
        [
          "path",
          {
            d: "m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71",
            key: "4qinb0"
          }
        ],
        ["line", { x1: "8", x2: "8", y1: "2", y2: "5", key: "1041cp" }],
        ["line", { x1: "2", x2: "5", y1: "8", y2: "8", key: "14m1p5" }],
        ["line", { x1: "16", x2: "16", y1: "19", y2: "22", key: "rzdirn" }],
        ["line", { x1: "19", x2: "22", y1: "16", y2: "16", key: "ox905f" }]
      ]
    };
    __iconData7.node;
    Unlink = createLucideIcon(__iconData7);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/layers.mjs
var layers_exports = {};
__export(layers_exports, {
  __iconData: () => __iconData8,
  default: () => Layers
});
var __iconData8, Layers;
var init_layers = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/layers.mjs"() {
    init_createLucideIcon();
    __iconData8 = {
      name: "layers",
      size: 24,
      node: [
        [
          "path",
          {
            d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
            key: "zw3jo"
          }
        ],
        [
          "path",
          {
            d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",
            key: "1wduqc"
          }
        ],
        [
          "path",
          {
            d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
            key: "kqbvx6"
          }
        ]
      ],
      aliases: ["layers-3"]
    };
    __iconData8.node;
    Layers = createLucideIcon(__iconData8);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/plus.mjs
var plus_exports = {};
__export(plus_exports, {
  __iconData: () => __iconData9,
  default: () => Plus
});
var __iconData9, Plus;
var init_plus = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/plus.mjs"() {
    init_createLucideIcon();
    __iconData9 = {
      name: "plus",
      size: 24,
      node: [
        ["path", { d: "M5 12h14", key: "1ays0h" }],
        ["path", { d: "M12 5v14", key: "s699le" }]
      ]
    };
    __iconData9.node;
    Plus = createLucideIcon(__iconData9);
  }
});

// packages/addons/sites/client/charts.cjs
var require_charts = __commonJS({
  "packages/addons/sites/client/charts.cjs"(exports2, module2) {
    var React2 = require("react");
    var h2 = React2.createElement;
    var ICONS = {
      "refresh": (init_refresh_cw(), __toCommonJS(refresh_cw_exports)).default,
      "globe": (init_globe(), __toCommonJS(globe_exports)).default,
      "link": (init_link_2(), __toCommonJS(link_2_exports)).default,
      "tag": (init_tag(), __toCommonJS(tag_exports)).default,
      "pie": (init_pie_chart(), __toCommonJS(pie_chart_exports)).default,
      "folder": (init_folder_tree(), __toCommonJS(folder_tree_exports)).default,
      "unlink": (init_unlink(), __toCommonJS(unlink_exports)).default,
      "layers": (init_layers(), __toCommonJS(layers_exports)).default,
      "plus": (init_plus(), __toCommonJS(plus_exports)).default
    };
    var COLORS = [
      "var(--dsw-alias-state-business-primary, #4f6ef7)",
      "var(--dsw-alias-state-success-primary, #2f9e6e)",
      "var(--dsw-alias-state-warn-primary, #d99100)",
      "var(--dsw-alias-state-error-primary, #d9534f)",
      "var(--dsw-alias-state-done-primary, #7c5cff)",
      "var(--dsw-alias-state-idle-primary, #8f959e)"
    ];
    function css(prefix) {
      return [
        ".@-stats{display:flex;flex-direction:column;gap:14px;padding:4px 2px 24px;color:var(--dsw-alias-label-primary,#1f2329)}",
        ".@-stoolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
        ".@-seg{display:inline-flex;border:1px solid var(--dsw-alias-border-l2,#e5e6eb);border-radius:9px;overflow:hidden;background:var(--dsw-alias-bg-layer-1,#fff)}",
        ".@-seg button{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary,#646a73);font-size:12px;padding:6px 10px;cursor:pointer;white-space:nowrap}",
        ".@-seg button.@-on{background:var(--dsw-alias-brand-primary,#4f6ef7);color:var(--dsw-alias-label-primary-inverted,#fff)}",
        ".@-ghost{appearance:none;border:1px solid var(--dsw-alias-border-l2,#e5e6eb);background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-secondary,#646a73);border-radius:8px;font-size:12px;padding:6px 10px;cursor:pointer;display:inline-flex;align-items:center;gap:5px;font-family:inherit}",
        ".@-ghost:disabled{opacity:.6;cursor:progress}",
        ".@-ico{display:block;flex:none}",
        ".@-kpi-l .@-ico{opacity:.7}",
        ".@-ghost:hover{border-color:var(--dsw-alias-brand-primary,#4f6ef7);color:var(--dsw-alias-brand-primary,#4f6ef7)}",
        ".@-muted{color:var(--dsw-alias-label-tertiary,#8f959e);font-size:12px}",
        ".@-sgrid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:12px}",
        ".@-scard{grid-column:span 6;min-width:0;background:var(--dsw-alias-bg-layer-1,#fff);border:1px solid var(--dsw-alias-border-l2,#e5e6eb);border-radius:12px;padding:14px 16px}",
        ".@-span-3{grid-column:span 3}.@-span-4{grid-column:span 4}.@-span-6{grid-column:span 6}.@-span-8{grid-column:span 8}.@-span-12{grid-column:span 12}",
        ".@-chead{display:flex;align-items:baseline;gap:8px;margin-bottom:10px;flex-wrap:wrap}",
        ".@-ctitle{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary,#1f2329)}",
        ".@-cnote{font-size:11px;color:var(--dsw-alias-label-tertiary,#8f959e)}",
        ".@-kpis{grid-column:span 12;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}",
        ".@-kpi{background:var(--dsw-alias-bg-layer-1,#fff);border:1px solid var(--dsw-alias-border-l2,#e5e6eb);border-radius:12px;padding:12px 14px;min-width:0}",
        ".@-kpi-l{font-size:12px;color:var(--dsw-alias-label-tertiary,#8f959e);display:flex;align-items:center;gap:6px}",
        ".@-kpi-v{font-size:26px;line-height:1.25;font-weight:650;margin-top:4px;font-variant-numeric:tabular-nums}",
        ".@-kpi-u{font-size:12px;font-weight:400;color:var(--dsw-alias-label-tertiary,#8f959e);margin-left:3px}",
        ".@-kpi-h{font-size:11px;color:var(--dsw-alias-label-tertiary,#8f959e);margin-top:3px}",
        ".@-kpi.@-danger .@-kpi-v{color:var(--dsw-alias-state-error-primary,#d9534f)}",
        ".@-kpi.@-warn .@-kpi-v{color:var(--dsw-alias-state-warn-primary,#d99100)}",
        ".@-kpi.@-ok .@-kpi-v{color:var(--dsw-alias-state-success-primary,#2f9e6e)}",
        ".@-donut{display:flex;align-items:center;gap:16px;flex-wrap:wrap}",
        ".@-donut svg{flex:0 0 auto}",
        ".@-legend{display:flex;flex-direction:column;gap:7px;min-width:120px;flex:1}",
        ".@-leg{display:flex;align-items:center;gap:7px;font-size:12px;color:var(--dsw-alias-label-secondary,#646a73)}",
        ".@-dot{width:8px;height:8px;border-radius:50%;flex:0 0 auto}",
        ".@-leg b{margin-left:auto;font-weight:600;color:var(--dsw-alias-label-primary,#1f2329);font-variant-numeric:tabular-nums}",
        ".@-bars{display:flex;flex-direction:column;gap:9px}",
        ".@-bar{display:grid;grid-template-columns:minmax(72px,1.2fr) 3fr auto;gap:8px;align-items:center;font-size:12px}",
        ".@-bar-l{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary,#646a73)}",
        ".@-bar-t{display:block;height:8px;border-radius:6px;background:var(--dsw-alias-bg-skeleton,#f2f3f5);overflow:hidden}",
        ".@-bar-f{display:block;height:100%;border-radius:6px;background:var(--dsw-alias-state-business-primary,#4f6ef7);min-width:2px}",
        ".@-bar-v{font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary,#1f2329);font-weight:600;min-width:34px;text-align:right}",
        ".@-stack{display:flex;flex-direction:column;gap:10px}",
        ".@-srow-l{font-size:12px;color:var(--dsw-alias-label-secondary,#646a73);margin-bottom:4px;display:flex}",
        ".@-srow-l b{margin-left:auto;color:var(--dsw-alias-label-primary,#1f2329);font-variant-numeric:tabular-nums}",
        ".@-strack{display:flex;height:10px;border-radius:6px;overflow:hidden;background:var(--dsw-alias-bg-skeleton,#f2f3f5)}",
        ".@-seg-f{height:100%}",
        ".@-hist{display:flex;align-items:flex-end;gap:8px;height:150px;padding-top:16px}",
        ".@-hbar{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:5px;min-width:0;height:100%}",
        ".@-hbar-v{font-size:11px;color:var(--dsw-alias-label-secondary,#646a73);font-variant-numeric:tabular-nums}",
        ".@-hbar-f{width:100%;max-width:44px;border-radius:5px 5px 0 0;background:var(--dsw-alias-state-business-primary,#4f6ef7);min-height:2px}",
        ".@-hbar-l{font-size:11px;color:var(--dsw-alias-label-tertiary,#8f959e);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}",
        ".@-trend{width:100%;height:auto;display:block}",
        ".@-tlegend{display:flex;gap:14px;flex-wrap:wrap;margin-top:6px;font-size:11px;color:var(--dsw-alias-label-tertiary,#8f959e)}",
        ".@-table{width:100%;border-collapse:collapse;font-size:12px}",
        ".@-table th{text-align:left;font-weight:500;color:var(--dsw-alias-label-tertiary,#8f959e);padding:6px 8px;border-bottom:1px solid var(--dsw-alias-border-l2,#e5e6eb);white-space:nowrap}",
        ".@-table td{padding:7px 8px;border-bottom:1px solid var(--dsw-alias-border-l1,#f2f3f5);color:var(--dsw-alias-label-secondary,#646a73);vertical-align:top}",
        ".@-table tr:last-child td{border-bottom:0}",
        ".@-table td.@-num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}",
        ".@-empty{padding:26px 8px;text-align:center;color:var(--dsw-alias-label-tertiary,#8f959e);font-size:12px}",
        ".@-err{display:flex;align-items:center;gap:10px;background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#d9534f) 8%,transparent);border:1px solid color-mix(in srgb,var(--dsw-alias-state-error-primary,#d9534f) 30%,transparent);color:var(--dsw-alias-state-error-primary,#d9534f);border-radius:10px;padding:10px 12px;font-size:12px}",
        ".@-warn{grid-column:span 12;border:1px dashed var(--dsw-alias-state-warn-primary,#d99100);border-radius:10px;padding:9px 12px;font-size:12px;color:var(--dsw-alias-state-warn-primary,#d99100);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#d99100) 6%,transparent)}",
        ".@-sk{height:14px;border-radius:6px;background:var(--dsw-alias-bg-skeleton,#f2f3f5);margin:7px 0;animation:@-pulse 1.2s ease-in-out infinite}",
        "@keyframes @-pulse{0%,100%{opacity:.55}50%{opacity:1}}",
        "@media (max-width:900px){.@-scard{grid-column:span 12}.@-span-3,.@-span-4,.@-span-6,.@-span-8{grid-column:span 12}.@-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}",
        "@media (max-width:600px){.@-stats{padding-bottom:16px}.@-hist{height:130px}.@-kpi-v{font-size:22px}}",
        "@media (prefers-reduced-motion:reduce){.@-sk{animation:none}}"
      ].join("\n").replace(/@-/g, prefix + "-");
    }
    function makeCharts(prefix) {
      if (typeof document !== "undefined" && !document.getElementById(prefix + "-charts-css")) {
        var el = document.createElement("style");
        el.id = prefix + "-charts-css";
        el.textContent = css(prefix);
        document.head.appendChild(el);
      }
      function ico(name, size) {
        var C = ICONS[name];
        if (!C) return null;
        return h2(C, { size: size || 13, strokeWidth: 2, "aria-hidden": "true", className: prefix + "-ico" });
      }
      function num(lang, n) {
        var v = Number(n);
        if (!isFinite(v)) return "\u2014";
        try {
          return new Intl.NumberFormat(lang === "en" ? "en-US" : "zh-CN").format(v);
        } catch (e) {
          return String(v);
        }
      }
      function pct(v, digits) {
        if (v === null || v === void 0 || !isFinite(Number(v))) return "\u2014";
        return (Number(v) * 100).toFixed(digits === void 0 ? 1 : digits) + "%";
      }
      function timeText(ms) {
        if (!ms) return "";
        var d = new Date(Number(ms));
        function p(n) {
          return String(n).padStart(2, "0");
        }
        return p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
      }
      function dateText(ms) {
        if (!ms) return "\u2014";
        var d = new Date(Number(ms));
        function p(n) {
          return String(n).padStart(2, "0");
        }
        return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
      }
      function Card(props) {
        var cls = prefix + "-scard" + (props.span ? " " + prefix + "-span-" + props.span : "");
        return h2(
          "section",
          { className: cls },
          props.title || props.right ? h2(
            "div",
            { className: prefix + "-chead" },
            h2("span", { className: prefix + "-ctitle" }, props.title),
            props.note ? h2("span", { className: prefix + "-cnote" }, props.note) : null,
            props.right ? h2("span", { style: { marginLeft: "auto" } }, props.right) : null
          ) : null,
          props.children
        );
      }
      function Kpi(props) {
        var tone = props.tone ? " " + prefix + "-" + props.tone : "";
        return h2(
          "div",
          { className: prefix + "-kpi" + tone },
          h2("div", { className: prefix + "-kpi-l" }, ico(props.icon, 13), props.label),
          h2(
            "div",
            { className: prefix + "-kpi-v" },
            props.value === null || props.value === void 0 ? "\u2014" : typeof props.value === "number" ? num(props.lang, props.value) : props.value,
            props.unit ? h2("span", { className: prefix + "-kpi-u" }, props.unit) : null
          ),
          props.hint ? h2("div", { className: prefix + "-kpi-h" }, props.hint) : null
        );
      }
      function Donut(props) {
        var data = (props.data || []).filter(function(d) {
          return Number(d.count) > 0;
        });
        var total = Number(props.total || 0);
        var size = props.size || 168;
        var r = size / 2 - 16;
        var c = 2 * Math.PI * r;
        var offset = 0;
        var aria = props.aria || data.map(function(d) {
          return d.label + " " + d.count;
        }).join("\uFF0C");
        return h2(
          "div",
          { className: prefix + "-donut" },
          h2(
            "svg",
            { width: size, height: size, viewBox: "0 0 " + size + " " + size, role: "img", "aria-label": aria },
            h2("circle", { cx: size / 2, cy: size / 2, r, fill: "none", stroke: "var(--dsw-alias-bg-skeleton,#f2f3f5)", strokeWidth: 18 }),
            total > 0 ? data.map(function(d, i) {
              var len = Number(d.count) / total * c;
              var seg = h2("circle", {
                key: d.key || d.label || i,
                cx: size / 2,
                cy: size / 2,
                r,
                fill: "none",
                stroke: d.color || COLORS[i % COLORS.length],
                strokeWidth: 18,
                strokeDasharray: len + " " + (c - len),
                strokeDashoffset: -offset,
                transform: "rotate(-90 " + size / 2 + " " + size / 2 + ")",
                strokeLinecap: "butt"
              }, h2("title", null, d.label + "\uFF1A" + d.count));
              offset += len;
              return seg;
            }) : null,
            h2("text", { x: size / 2, y: size / 2 - 2, textAnchor: "middle", fill: "var(--dsw-alias-label-primary,#1f2329)", fontSize: 24, fontWeight: 650 }, num(props.lang, total)),
            h2("text", { x: size / 2, y: size / 2 + 18, textAnchor: "middle", fill: "var(--dsw-alias-label-tertiary,#8f959e)", fontSize: 11 }, props.centerLabel || "")
          ),
          h2("div", { className: prefix + "-legend" }, (props.data || []).map(function(d, i) {
            return h2(
              "div",
              { key: d.key || d.label || i, className: prefix + "-leg" },
              h2("span", { className: prefix + "-dot", style: { background: d.color || COLORS[i % COLORS.length] } }),
              h2("span", null, d.label),
              h2("b", null, num(props.lang, d.count))
            );
          }))
        );
      }
      function BarList(props) {
        var data = props.data || [];
        var max = Number(props.max || 0) || data.reduce(function(m, d) {
          return Math.max(m, Number(d.value || 0));
        }, 0) || 1;
        return h2("div", { className: prefix + "-bars" }, data.map(function(d, i) {
          var v = Number(d.value || 0);
          return h2(
            "div",
            { key: d.key || d.label || i, className: prefix + "-bar" },
            h2("span", { className: prefix + "-bar-l", title: d.title || d.label }, d.label),
            h2("span", { className: prefix + "-bar-t" }, h2("span", { className: prefix + "-bar-f", style: { width: Math.max(2, v / max * 100) + "%", background: d.color || props.color || COLORS[0] } })),
            h2("span", { className: prefix + "-bar-v" }, props.format ? props.format(v) : num(props.lang, v))
          );
        }));
      }
      function StackedRows(props) {
        var rows = props.rows || [];
        var keys = props.keys || [];
        return h2("div", { className: prefix + "-stack" }, rows.map(function(row, ri) {
          var total = Number(row.total || 0) || 1;
          return h2(
            "div",
            { key: row.key || ri },
            h2("div", { className: prefix + "-srow-l" }, h2("span", null, row.label), h2("b", null, num(props.lang, row.total))),
            h2("div", { className: prefix + "-strack" }, keys.map(function(k, i) {
              var v = Number(row.parts && row.parts[k.key] || 0);
              if (v <= 0) return null;
              return h2("span", {
                key: k.key,
                className: prefix + "-seg-f",
                title: k.label + " " + v,
                style: { width: v / total * 100 + "%", background: k.color || COLORS[i % COLORS.length] }
              });
            }))
          );
        }));
      }
      function Trend(props) {
        var data = props.data || [];
        var series = props.series || [];
        var width = 640;
        var height = props.height || 200;
        var left = 30, right = 10, top = 12, bottom = 24;
        var pw = width - left - right, ph = height - top - bottom;
        var max = 1;
        data.forEach(function(d) {
          series.forEach(function(s) {
            max = Math.max(max, Number(d[s.key] || 0));
          });
        });
        max = Math.ceil(max * 1.15) || 1;
        function x(i2) {
          return left + (data.length <= 1 ? pw / 2 : i2 / (data.length - 1) * pw);
        }
        function y(v) {
          return top + ph - Number(v || 0) / max * ph;
        }
        var ticks = [];
        for (var t = 0; t <= 3; t++) ticks.push(Math.round(max / 3 * t));
        var labelIdx = [];
        if (data.length) {
          var step = Math.max(1, Math.floor(data.length / 5));
          for (var i = 0; i < data.length; i += step) labelIdx.push(i);
          if (labelIdx[labelIdx.length - 1] !== data.length - 1) labelIdx.push(data.length - 1);
        }
        var aria = series.map(function(s) {
          return s.label + " " + data.reduce(function(n, d) {
            return n + Number(d[s.key] || 0);
          }, 0);
        }).join("\uFF0C");
        return h2(
          "div",
          null,
          h2(
            "svg",
            { className: prefix + "-trend", viewBox: "0 0 " + width + " " + height, role: "img", "aria-label": props.aria || aria },
            ticks.map(function(v, i2) {
              return h2(
                "g",
                { key: "t" + i2 },
                h2("line", { x1: left, x2: width - right, y1: y(v), y2: y(v), stroke: "var(--dsw-alias-border-l1,#f2f3f5)", strokeWidth: 1 }),
                h2("text", { x: left - 5, y: y(v) + 3, textAnchor: "end", fontSize: 9, fill: "var(--dsw-alias-label-tertiary,#8f959e)" }, num(props.lang, v))
              );
            }),
            series.map(function(s, si) {
              var pts = data.map(function(d, i2) {
                return x(i2) + "," + y(d[s.key]);
              }).join(" ");
              return h2(
                "g",
                { key: s.key },
                h2("polyline", { points: pts, fill: "none", stroke: s.color || COLORS[si % COLORS.length], strokeWidth: 2, strokeLinejoin: "round", strokeLinecap: "round" }),
                data.map(function(d, i2) {
                  if (data.length > 40 && i2 % 3 !== 0) return null;
                  return h2(
                    "circle",
                    { key: i2, cx: x(i2), cy: y(d[s.key]), r: 2.4, fill: s.color || COLORS[si % COLORS.length] },
                    h2("title", null, d.bucket + "\uFF1A" + s.label + " " + (d[s.key] || 0))
                  );
                })
              );
            }),
            labelIdx.map(function(i2) {
              return h2("text", { key: "x" + i2, x: x(i2), y: height - 6, textAnchor: "middle", fontSize: 9, fill: "var(--dsw-alias-label-tertiary,#8f959e)" }, String(data[i2].bucket).slice(5));
            })
          ),
          h2("div", { className: prefix + "-tlegend" }, series.map(function(s, i2) {
            return h2(
              "span",
              { key: s.key, style: { display: "inline-flex", alignItems: "center", gap: 5 } },
              h2("span", { className: prefix + "-dot", style: { background: s.color || COLORS[i2 % COLORS.length] } }),
              s.label
            );
          }))
        );
      }
      function Histogram(props) {
        var data = props.data || [];
        var max = data.reduce(function(m, d) {
          return Math.max(m, Number(d.count || 0));
        }, 0) || 1;
        return h2(
          "div",
          { className: prefix + "-hist", role: "img", "aria-label": props.aria || data.map(function(d) {
            return d.label + " " + d.count;
          }).join("\uFF0C") },
          data.map(function(d, i) {
            return h2(
              "div",
              { key: d.key || d.label || i, className: prefix + "-hbar", title: d.label + "\uFF1A" + d.count },
              h2("span", { className: prefix + "-hbar-v" }, num(props.lang, d.count)),
              h2("span", { className: prefix + "-hbar-f", style: { height: Math.max(2, Number(d.count || 0) / max * 100) + "%", background: d.color || props.color || COLORS[0] } }),
              h2("span", { className: prefix + "-hbar-l" }, d.label)
            );
          })
        );
      }
      function DataTable(props) {
        var cols = props.columns || [];
        var rows = props.rows || [];
        if (!rows.length) return h2("div", { className: prefix + "-empty" }, props.empty || "\u6682\u65E0\u6570\u636E");
        return h2(
          "table",
          { className: prefix + "-table" },
          h2("thead", null, h2("tr", null, cols.map(function(c) {
            return h2("th", { key: c.key, className: c.num ? prefix + "-num" : "" }, c.label);
          }))),
          h2("tbody", null, rows.map(function(row, ri) {
            return h2("tr", { key: row.id || row.key || ri }, cols.map(function(c) {
              return h2("td", { key: c.key, className: c.num ? prefix + "-num" : "" }, c.render ? c.render(row) : row[c.key]);
            }));
          }))
        );
      }
      function RangeSwitch(props) {
        return h2(
          "div",
          { className: prefix + "-stoolbar" },
          h2("div", { className: prefix + "-seg", role: "group", "aria-label": props.aria || "\u65F6\u95F4\u8303\u56F4" }, (props.options || []).map(function(o) {
            return h2("button", {
              key: o.key,
              type: "button",
              className: o.key === props.value ? prefix + "-on" : "",
              "aria-pressed": o.key === props.value,
              onClick: function() {
                props.onChange(o.key);
              }
            }, o.label);
          })),
          h2("button", { type: "button", className: prefix + "-ghost", disabled: !!props.loading, onClick: props.onRefresh }, ico("refresh", 13), props.refreshLabel || "\u5237\u65B0"),
          h2("span", { className: prefix + "-muted" }, props.generatedAt ? (props.timeLabel || "\u622A\u81F3") + " " + timeText(props.generatedAt) : ""),
          props.right ? h2("span", { style: { marginLeft: "auto" } }, props.right) : null
        );
      }
      function Empty(props) {
        return h2("div", { className: prefix + "-empty" }, props.text || "\u6682\u65E0\u6570\u636E");
      }
      function Skeleton() {
        return h2(
          "div",
          { className: prefix + "-sgrid" },
          h2("div", { className: prefix + "-kpis" }, [0, 1, 2, 3].map(function(i) {
            return h2(
              "div",
              { key: i, className: prefix + "-kpi" },
              h2("div", { className: prefix + "-sk", style: { width: "40%" } }),
              h2("div", { className: prefix + "-sk", style: { width: "65%", height: 26 } })
            );
          })),
          [0, 1].map(function(i) {
            return h2(
              "div",
              { key: "c" + i, className: prefix + "-scard " + prefix + "-span-6" },
              h2("div", { className: prefix + "-sk", style: { width: "30%" } }),
              h2("div", { className: prefix + "-sk", style: { height: 120 } })
            );
          })
        );
      }
      function ErrorBar(props) {
        return h2(
          "div",
          { className: prefix + "-err", role: "alert" },
          h2("span", null, props.message),
          props.onRetry ? h2("button", { type: "button", className: prefix + "-ghost", onClick: props.onRetry }, props.retryLabel || "\u91CD\u8BD5") : null
        );
      }
      function Warnings(props) {
        var items = props.items || [];
        if (!items.length) return null;
        return h2("div", { className: prefix + "-warn", role: "status" }, items.map(function(w) {
          return w.message;
        }).join("\uFF1B"));
      }
      return {
        Card,
        Kpi,
        Donut,
        BarList,
        StackedRows,
        Trend,
        Histogram,
        DataTable,
        RangeSwitch,
        Empty,
        Skeleton,
        ErrorBar,
        Warnings,
        num,
        pct,
        timeText,
        dateText,
        colors: COLORS
      };
    }
    module2.exports = { makeCharts };
  }
});

// packages/addons/sites/client/config.cjs
var require_config = __commonJS({
  "packages/addons/sites/client/config.cjs"(exports2, module2) {
    var React2 = require("react");
    var h2 = React2.createElement;
    var DOMAIN = "sites";
    var PREFIX = "wbs";
    var COPY = {
      zh: {
        title: "\u914D\u7F6E",
        note: "\u8FD9\u4E9B\u504F\u597D\u53EA\u4FDD\u5B58\u5728\u672C\u673A\uFF0C\u4E0D\u53C2\u4E0E\u4E91\u7AEF\u540C\u6B65",
        loading: "\u8BFB\u53D6\u914D\u7F6E\u4E2D\u2026",
        loadFail: "\u914D\u7F6E\u670D\u52A1\u672A\u5C31\u7EEA\uFF08\u63D2\u4EF6\u7248\u672C\u8FC7\u65E7\uFF1F\uFF09",
        retry: "\u91CD\u8BD5",
        saveFail: "\u4FDD\u5B58\u5931\u8D25\uFF1A",
        saved: "\u5DF2\u4FDD\u5B58",
        saving: "\u4FDD\u5B58\u4E2D\u2026",
        reset: "\u6062\u590D\u9ED8\u8BA4",
        resetAll: "\u5168\u90E8\u6062\u590D\u9ED8\u8BA4",
        resetting: "\u6062\u590D\u4E2D\u2026",
        modified: "\u5DF2\u4FEE\u6539",
        defaultValue: "\u9ED8\u8BA4",
        allDefault: "\u5168\u90E8\u4F7F\u7528\u9ED8\u8BA4\u503C",
        on: "\u5F00",
        off: "\u5173",
        empty: "\u6CA1\u6709\u53EF\u914D\u7F6E\u9879",
        confirmResetAll: "\u786E\u5B9A\u628A\u5168\u90E8\u914D\u7F6E\u6062\u590D\u9ED8\u8BA4\u503C\uFF1F",
        min: "\u6700\u5C0F",
        max: "\u6700\u5927"
      },
      en: {
        title: "Config",
        note: "Preferences stay on this machine; they are not synced to the cloud",
        loading: "Loading config\u2026",
        loadFail: "Config service not ready (plugin too old?)",
        retry: "Retry",
        saveFail: "Save failed: ",
        saved: "Saved",
        saving: "Saving\u2026",
        reset: "Reset",
        resetAll: "Reset all",
        resetting: "Resetting\u2026",
        modified: "Modified",
        defaultValue: "Default",
        allDefault: "All defaults",
        on: "On",
        off: "Off",
        empty: "Nothing to configure",
        confirmResetAll: "Reset every setting to its default?",
        min: "Min",
        max: "Max"
      }
    };
    var CSS = [
      ".__P__-cfg{--cfg-line:var(--wb-line,var(--dsw-alias-border-l2,color-mix(in oklab,currentColor 16%,transparent)));--cfg-surface:var(--wb-surface,var(--dsw-alias-bg-layer-1,transparent));--cfg-muted:var(--dsw-alias-label-secondary,color-mix(in oklab,currentColor 62%,transparent));--cfg-faint:var(--dsw-alias-label-tertiary,color-mix(in oklab,currentColor 42%,transparent));--cfg-hover:var(--dsw-alias-interactive-bg-hover,color-mix(in oklab,currentColor 5%,transparent));display:flex;flex-direction:column;gap:16px;width:100%;min-width:0;padding-bottom:6px;color:inherit;font-size:13.5px}",
      ".__P__-cfg-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap}",
      ".__P__-cfg-headmain{min-width:0}",
      ".__P__-cfg-head h2{margin:0;font-size:17px;font-weight:660;letter-spacing:.1px}",
      ".__P__-cfg-note{font-size:12px;color:var(--cfg-muted);margin-top:5px;line-height:1.6}",
      ".__P__-cfg-status{display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border:1px solid var(--cfg-line);border-radius:999px;background:var(--cfg-surface);font-size:11.5px;color:var(--cfg-muted);max-width:100%;line-height:1.4}",
      ".__P__-cfg-status::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-success-primary,currentColor);flex:none}",
      ".__P__-cfg-status.err{color:var(--dsw-alias-state-error-primary,inherit);border-color:color-mix(in oklab,var(--dsw-alias-state-error-primary,currentColor) 35%,var(--cfg-line))}",
      ".__P__-cfg-status.err::before{background:var(--dsw-alias-state-error-primary,currentColor)}",
      ".__P__-cfg-group{border:1px solid var(--cfg-line);border-radius:14px;background:var(--cfg-surface);overflow:hidden;box-shadow:0 1px 2px color-mix(in oklab,currentColor 3%,transparent)}",
      ".__P__-cfg-gtitle{display:flex;align-items:center;gap:8px;padding:12px 18px;background:color-mix(in oklab,currentColor 3%,transparent);border-bottom:1px solid var(--cfg-line);font-size:12.5px;font-weight:660;letter-spacing:.1px}",
      ".__P__-cfg-gcount{margin-left:auto;font-size:11px;font-weight:500;color:var(--cfg-muted);font-variant-numeric:tabular-nums}",
      ".__P__-cfg-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(200px,300px);gap:28px;align-items:center;padding:15px 18px;border-top:1px solid color-mix(in oklab,currentColor 7%,transparent);transition:background .12s ease}",
      ".__P__-cfg-gtitle+.__P__-cfg-row{border-top:none}",
      ".__P__-cfg-row:hover{background:var(--cfg-hover)}",
      ".__P__-cfg-label{min-width:0}",
      ".__P__-cfg-name{display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:600;line-height:1.4;flex-wrap:wrap}",
      ".__P__-cfg-hint{font-size:12px;color:var(--cfg-muted);line-height:1.55;margin-top:4px}",
      ".__P__-cfg-id{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:var(--cfg-muted);margin-top:5px;letter-spacing:.2px;word-break:break-all}",
      ".__P__-cfg-control{display:flex;align-items:center;justify-content:flex-end;gap:8px;min-width:0;flex-wrap:wrap}",
      ".__P__-cfg-select,.__P__-cfg-input{border:1px solid var(--cfg-line);background:var(--dsw-alias-bg-base,transparent);color:inherit;border-radius:9px;padding:7px 11px;font:inherit;font-size:13px;line-height:1.4;outline:none;min-width:132px;max-width:100%;transition:border-color .15s ease,box-shadow .15s ease}",
      ".__P__-cfg-select:hover,.__P__-cfg-input:hover{border-color:color-mix(in oklab,currentColor 28%,var(--cfg-line))}",
      ".__P__-cfg-select:focus,.__P__-cfg-input:focus{border-color:var(--dsw-alias-brand-primary,currentColor);box-shadow:0 0 0 3px color-mix(in oklab,var(--dsw-alias-brand-primary,currentColor) 14%,transparent)}",
      ".__P__-cfg-select{min-width:152px;padding-right:10px}",
      ".__P__-cfg-input{width:132px}",
      ".__P__-cfg-switch{position:relative;display:inline-flex;align-items:center;gap:9px;cursor:pointer;font-size:12.5px;color:var(--cfg-muted);user-select:none}",
      ".__P__-cfg-switch input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer}",
      ".__P__-cfg-track{position:relative;width:38px;height:22px;border-radius:999px;background:color-mix(in oklab,currentColor 18%,transparent);transition:background .16s ease;flex:none}",
      ".__P__-cfg-track::after{content:'';position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:var(--dsw-alias-label-primary,currentColor);transition:transform .16s ease,background .16s ease}",
      ".__P__-cfg-switch input:checked+.__P__-cfg-track{background:var(--dsw-alias-brand-primary,currentColor)}",
      ".__P__-cfg-switch input:checked+.__P__-cfg-track::after{transform:translateX(16px);background:var(--dsw-alias-label-primary-inverted,var(--dsw-alias-bg-base))}",
      ".__P__-cfg-switch input:focus-visible+.__P__-cfg-track{outline:2px solid var(--dsw-alias-brand-primary,currentColor);outline-offset:2px}",
      ".__P__-cfg-multi{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end;max-width:100%}",
      ".__P__-cfg-multi label{position:relative;display:inline-flex;align-items:center;padding:5px 11px;border:1px solid var(--cfg-line);border-radius:999px;font-size:12px;color:var(--cfg-muted);cursor:pointer;line-height:1.4;transition:color .12s ease,border-color .12s ease,background .12s ease}",
      ".__P__-cfg-multi label:hover{background:var(--cfg-hover);color:var(--dsw-alias-label-primary,inherit)}",
      ".__P__-cfg-multi input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer}",
      ".__P__-cfg-multi label:has(input:checked){color:var(--dsw-alias-label-primary,inherit);border-color:color-mix(in oklab,currentColor 40%,var(--cfg-line));background:color-mix(in oklab,currentColor 7%,transparent);font-weight:600}",
      ".__P__-cfg-multi input:focus-visible+span{outline:2px solid var(--dsw-alias-brand-primary,currentColor);outline-offset:2px;border-radius:4px}",
      ".__P__-cfg-chip{font-size:10.5px;line-height:1.5;padding:1px 7px;border-radius:999px;background:color-mix(in oklab,currentColor 8%,transparent);color:var(--cfg-muted);font-weight:600;white-space:nowrap}",
      ".__P__-cfg-btn{display:inline-flex;align-items:center;gap:4px;border:1px solid transparent;background:transparent;color:var(--cfg-muted);border-radius:8px;padding:5px 9px;font:inherit;font-size:11.5px;cursor:pointer;white-space:nowrap;transition:background .12s ease,color .12s ease,border-color .12s ease}",
      ".__P__-cfg-btn:hover{background:var(--cfg-hover);color:var(--dsw-alias-label-primary,inherit)}",
      ".__P__-cfg-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,currentColor);outline-offset:2px}",
      ".__P__-cfg-btn:disabled{opacity:.45;cursor:not-allowed}",
      ".__P__-cfg-btn-outline{border-color:var(--cfg-line);color:var(--dsw-alias-label-primary,inherit)}",
      ".__P__-cfg-foot{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:2px 2px 0;min-height:32px}",
      ".__P__-cfg-changed{font-size:12px;color:var(--cfg-muted)}",
      ".__P__-cfg-grow{flex:1}",
      ".__P__-cfg-loading{display:flex;flex-direction:column;gap:10px;padding:6px 2px}",
      ".__P__-cfg-sk{height:14px;border-radius:7px;background:var(--dsw-alias-bg-skeleton,color-mix(in oklab,currentColor 6%,transparent));animation:__P__-cfg-pulse 1.4s ease-in-out infinite}",
      ".__P__-cfg-sk:nth-child(3){width:72%}",
      ".__P__-cfg-sk:nth-child(4){width:48%}",
      "@keyframes __P__-cfg-pulse{0%,100%{opacity:.65}50%{opacity:1}}",
      ".__P__-cfg-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}",
      ".__P__-cfg-empty{border:1px dashed var(--cfg-line);border-radius:14px;padding:40px 16px;text-align:center;font-size:12.5px;color:var(--cfg-muted)}",
      ".__P__-cfg-error{display:flex;align-items:center;gap:10px;flex-wrap:wrap;border:1px solid color-mix(in oklab,var(--dsw-alias-state-error-primary,currentColor) 32%,var(--cfg-line));border-radius:10px;padding:10px 13px;color:var(--dsw-alias-state-error-primary,inherit);font-size:12.5px;line-height:1.5}",
      "@media (max-width:820px){.__P__-cfg-row{grid-template-columns:1fr;gap:10px;padding:13px 16px}.__P__-cfg-control{justify-content:flex-start}.__P__-cfg-multi{justify-content:flex-start}.__P__-cfg-gtitle{padding:11px 16px}}",
      "@media (prefers-reduced-motion:reduce){.__P__-cfg-track,.__P__-cfg-track::after,.__P__-cfg-sk{animation:none;transition:none}}"
    ].join("\n").split("__P__").join(PREFIX);
    function injectCss() {
      if (typeof document === "undefined") return;
      var old = document.getElementById("wb-addon-" + DOMAIN + "-config-css");
      if (old) {
        old.textContent = CSS;
        return;
      }
      var s = document.createElement("style");
      s.id = "wb-addon-" + DOMAIN + "-config-css";
      s.setAttribute("data-wb-addon", "wb-addon-" + DOMAIN);
      s.textContent = CSS;
      document.head.appendChild(s);
    }
    function unwrap(r) {
      return r && r.result !== void 0 ? r.result : r;
    }
    function optionLabel(opt, lang) {
      return lang === "en" ? String(opt.en || opt.zh || opt.value) : String(opt.zh || opt.en || opt.value);
    }
    function sameValue(a, b) {
      return JSON.stringify(a) === JSON.stringify(b);
    }
    function useConfig(api, fallback) {
      var fb = fallback || {};
      var stateS = React2.useState({
        ready: false,
        values: Object.assign({}, fb),
        items: [],
        groups: [],
        overrides: {},
        error: "",
        state: null
      });
      var state = stateS[0], setState = stateS[1];
      React2.useEffect(function() {
        var alive = true;
        Promise.resolve(api.call(DOMAIN + ".configGet")).then(function(r) {
          if (!alive) return;
          var body = unwrap(r);
          if (r && r.ok === false) throw new Error(r && r.error || "load failed");
          if (!body || !body.values) throw new Error("empty config");
          setState({
            ready: true,
            values: Object.assign({}, fb, body.values),
            items: body.items || [],
            groups: body.groups || [],
            overrides: body.overrides || {},
            error: "",
            state: body
          });
        }).catch(function(e) {
          if (!alive) return;
          setState({
            ready: true,
            values: Object.assign({}, fb),
            items: [],
            groups: [],
            overrides: {},
            error: String(e && e.message || e),
            state: null
          });
        });
        return function() {
          alive = false;
        };
      }, [api]);
      return state;
    }
    function ConfigView(props) {
      var api = props.api;
      var lang = props.lang === "en" ? "en" : "zh";
      var t = COPY[lang];
      var loadS = React2.useState(true);
      var loading = loadS[0], setLoading = loadS[1];
      var stateS = React2.useState(null);
      var state = stateS[0], setState = stateS[1];
      var errS = React2.useState("");
      var err = errS[0], setErr = errS[1];
      var noticeS = React2.useState({ id: "", text: "", error: false });
      var notice = noticeS[0], setNotice = noticeS[1];
      var savingS = React2.useState("");
      var savingId = savingS[0], setSavingId = savingS[1];
      var draftsS = React2.useState({});
      var drafts = draftsS[0], setDrafts = draftsS[1];
      var busyS = React2.useState(false);
      var busy = busyS[0], setBusy = busyS[1];
      React2.useEffect(function() {
        injectCss();
      }, []);
      var load = React2.useCallback(function() {
        setLoading(true);
        return Promise.resolve(api.call(DOMAIN + ".configGet")).then(function(r) {
          var body2 = unwrap(r);
          if (r && r.ok === false) throw new Error(r && r.error || "load failed");
          setState(body2 || null);
          setErr("");
          setLoading(false);
        }).catch(function(e) {
          setErr(String(e && e.message || e));
          setLoading(false);
        });
      }, [api]);
      React2.useEffect(function() {
        load();
      }, [load]);
      function setValueLocal(id, value) {
        setState(function(prev) {
          if (!prev) return prev;
          var values = Object.assign({}, prev.values);
          values[id] = value;
          var overrides = Object.assign({}, prev.overrides);
          overrides[id] = value;
          return Object.assign({}, prev, { values, overrides });
        });
      }
      function save(id, value) {
        var prevState = state;
        setSavingId(id);
        setNotice({ id, text: t.saving, error: false });
        setValueLocal(id, value);
        return Promise.resolve(api.call(DOMAIN + ".configSet", { values: (function() {
          var o = {};
          o[id] = value;
          return o;
        })() })).then(function(r) {
          var body2 = unwrap(r);
          if (r && r.ok === false) throw new Error(r && r.error || "save failed");
          setSavingId("");
          if (body2 && body2.state) setState(body2.state);
          setNotice({ id, text: t.saved, error: false });
        }).catch(function(e) {
          setSavingId("");
          if (prevState) setState(prevState);
          setNotice({ id, text: t.saveFail + String(e && e.message || e), error: true });
        });
      }
      function resetItem(id) {
        var prevState = state;
        setBusy(true);
        setNotice({ id, text: t.resetting, error: false });
        return Promise.resolve(api.call(DOMAIN + ".configReset", { ids: [id] })).then(function(r) {
          var body2 = unwrap(r);
          if (r && r.ok === false) throw new Error(r && r.error || "reset failed");
          setBusy(false);
          if (body2 && body2.state) setState(body2.state);
          setNotice({ id, text: t.defaultValue, error: false });
        }).catch(function(e) {
          setBusy(false);
          if (prevState) setState(prevState);
          setNotice({ id, text: String(e && e.message || e), error: true });
        });
      }
      function resetAll() {
        if (typeof window !== "undefined" && window.confirm && !window.confirm(t.confirmResetAll)) return;
        var prevState = state;
        setBusy(true);
        setNotice({ id: "", text: t.resetting, error: false });
        Promise.resolve(api.call(DOMAIN + ".configReset", {})).then(function(r) {
          var body2 = unwrap(r);
          if (r && r.ok === false) throw new Error(r && r.error || "reset failed");
          setBusy(false);
          if (body2 && body2.state) setState(body2.state);
          setNotice({ id: "", text: t.allDefault, error: false });
        }).catch(function(e) {
          setBusy(false);
          if (prevState) setState(prevState);
          setNotice({ id: "", text: String(e && e.message || e), error: true });
        });
      }
      function commitDraft(item) {
        var raw = drafts[item.id];
        if (raw === void 0) return;
        var next = String(raw).trim();
        setDrafts(function(prev) {
          var copy = Object.assign({}, prev);
          delete copy[item.id];
          return copy;
        });
        if (next === "") return;
        var value = Number(next);
        if (!Number.isFinite(value)) return;
        if (sameValue(value, state.values[item.id])) return;
        save(item.id, value);
      }
      function renderControl(item) {
        var value = state.values[item.id];
        var label = lang === "en" ? item.en : item.zh;
        if (item.type === "bool") {
          return h2(
            "label",
            { className: PREFIX + "-cfg-switch" },
            h2("input", {
              type: "checkbox",
              checked: value === true,
              onChange: function(e) {
                save(item.id, e.target.checked);
              }
            }),
            h2("span", { className: PREFIX + "-cfg-track", "aria-hidden": "true" }),
            h2("span", { className: PREFIX + "-cfg-switchstate" }, value === true ? t.on : t.off)
          );
        }
        if (item.type === "enum") {
          return h2("select", {
            className: PREFIX + "-cfg-select",
            value: String(value),
            onChange: function(e) {
              var hit = (item.options || []).filter(function(o) {
                return String(o.value) === e.target.value;
              })[0];
              if (hit) save(item.id, hit.value);
            }
          }, (item.options || []).map(function(o) {
            return h2("option", { key: String(o.value), value: String(o.value) }, optionLabel(o, lang));
          }));
        }
        if (item.type === "int") {
          var draft = drafts[item.id] !== void 0 ? drafts[item.id] : String(value);
          return h2("input", {
            className: PREFIX + "-cfg-input",
            type: "number",
            value: draft,
            min: item.min,
            max: item.max,
            "aria-label": label,
            onChange: function(e) {
              var v = e.target.value;
              setDrafts(function(prev) {
                var c = Object.assign({}, prev);
                c[item.id] = v;
                return c;
              });
            },
            onBlur: function() {
              commitDraft(item);
            },
            onKeyDown: function(e) {
              if (e.key === "Enter") {
                e.preventDefault();
                commitDraft(item);
              }
            }
          });
        }
        if (item.type === "multi") {
          var picked = Array.isArray(value) ? value : [];
          return h2("div", { className: PREFIX + "-cfg-multi" }, (item.options || []).map(function(o) {
            var on = picked.indexOf(o.value) >= 0;
            return h2(
              "label",
              { key: String(o.value) },
              h2("input", {
                type: "checkbox",
                checked: on,
                onChange: function() {
                  var next = picked.slice();
                  if (on) {
                    if (next.length <= 1) return;
                    next = next.filter(function(x) {
                      return x !== o.value;
                    });
                  } else next.push(o.value);
                  save(item.id, next);
                }
              }),
              h2("span", null, optionLabel(o, lang))
            );
          }));
        }
        return h2("input", {
          className: PREFIX + "-cfg-input",
          type: "text",
          defaultValue: value === void 0 ? "" : String(value),
          onBlur: function(e) {
            if (!sameValue(e.target.value, value)) save(item.id, e.target.value);
          }
        });
      }
      var body = [];
      if (loading && !state) body.push(h2(
        "div",
        { key: "loading", className: PREFIX + "-cfg-loading", "aria-busy": "true" },
        h2("span", { className: PREFIX + "-cfg-sr" }, t.loading),
        h2("div", { className: PREFIX + "-cfg-sk" }),
        h2("div", { className: PREFIX + "-cfg-sk" }),
        h2("div", { className: PREFIX + "-cfg-sk" })
      ));
      if (!loading && err && !state) {
        body.push(h2(
          "div",
          { key: "err", className: PREFIX + "-cfg-error" },
          h2("span", null, t.loadFail + " " + err),
          h2("button", { type: "button", className: PREFIX + "-cfg-btn", onClick: load }, t.retry)
        ));
      }
      if (state) {
        var items = state.items || [];
        var groups = state.groups || [];
        var byGroup = {};
        items.forEach(function(item) {
          (byGroup[item.group] = byGroup[item.group] || []).push(item);
        });
        var order = groups.length ? groups : Object.keys(byGroup).map(function(id) {
          return { id, zh: id, en: id };
        });
        order.forEach(function(g) {
          var list = byGroup[g.id] || [];
          if (!list.length) return;
          body.push(h2(
            "section",
            { key: "g-" + g.id, className: PREFIX + "-cfg-group" },
            h2(
              "div",
              { className: PREFIX + "-cfg-gtitle" },
              h2("span", null, lang === "en" ? g.en : g.zh),
              h2("span", { className: PREFIX + "-cfg-gcount" }, list.length + (lang === "en" ? " items" : " \u9879"))
            ),
            list.map(function(item) {
              var overridden = state.overrides && state.overrides[item.id] !== void 0;
              var isSaving = savingId === item.id;
              return h2(
                "div",
                { key: item.id, className: PREFIX + "-cfg-row" },
                h2(
                  "div",
                  { className: PREFIX + "-cfg-label" },
                  h2(
                    "div",
                    { className: PREFIX + "-cfg-name" },
                    h2("span", null, lang === "en" ? item.en : item.zh),
                    overridden ? h2("span", { className: PREFIX + "-cfg-chip" }, t.modified) : null,
                    isSaving ? h2("span", { className: PREFIX + "-cfg-chip" }, t.saving) : null
                  ),
                  (lang === "en" ? item.hintEn : item.hintZh) ? h2("div", { className: PREFIX + "-cfg-hint" }, lang === "en" ? item.hintEn : item.hintZh) : null,
                  h2("div", { className: PREFIX + "-cfg-id" }, item.id)
                ),
                h2(
                  "div",
                  { className: PREFIX + "-cfg-control" },
                  renderControl(item),
                  overridden ? h2("button", {
                    type: "button",
                    className: PREFIX + "-cfg-btn",
                    disabled: busy,
                    onClick: function() {
                      resetItem(item.id);
                    },
                    title: t.reset
                  }, t.reset) : null
                )
              );
            })
          ));
        });
        if (!items.length && !loading) body.push(h2("div", { key: "empty", className: PREFIX + "-cfg-empty" }, t.empty));
        var anyOverride = Object.keys(state.overrides || {}).length > 0;
        body.push(h2(
          "div",
          { key: "foot", className: PREFIX + "-cfg-foot" },
          h2(
            "span",
            { className: PREFIX + "-cfg-changed" },
            anyOverride ? Object.keys(state.overrides || {}).length + (lang === "en" ? " changed" : " \u9879\u5DF2\u4FEE\u6539") : lang === "en" ? "All preferences are at their defaults" : "\u5168\u90E8\u914D\u7F6E\u5747\u4E3A\u9ED8\u8BA4\u503C"
          ),
          h2("span", { className: PREFIX + "-cfg-grow" }),
          anyOverride ? h2("button", { type: "button", className: PREFIX + "-cfg-btn " + PREFIX + "-cfg-btn-outline", disabled: busy, onClick: resetAll }, busy ? t.resetting : t.resetAll) : null
        ));
        var warn = (state.warnings || []).filter(function(w) {
          return w && w.message;
        });
        if (warn.length) {
          body.push(h2(
            "div",
            { key: "warn", className: PREFIX + "-cfg-error" },
            h2("span", null, warn.map(function(w) {
              return w.message;
            }).join("\uFF1B"))
          ));
        }
      }
      return h2(
        "div",
        { className: PREFIX + "-cfg" },
        h2(
          "div",
          { className: PREFIX + "-cfg-head" },
          h2(
            "div",
            { className: PREFIX + "-cfg-headmain" },
            h2("h2", null, t.title),
            h2("div", { className: PREFIX + "-cfg-note" }, t.note)
          ),
          notice.text ? h2("div", { key: "notice", className: PREFIX + "-cfg-status" + (notice.error ? " err" : ""), role: "status" }, notice.text) : null
        ),
        body
      );
    }
    module2.exports = { ConfigView, useConfig, DOMAIN };
  }
});

// packages/addons/sites/client/stats.cjs
var require_stats = __commonJS({
  "packages/addons/sites/client/stats.cjs"(exports2, module2) {
    var React2 = require("react");
    var h2 = React2.createElement;
    var charts = require_charts();
    var configView = require_config();
    var COPY = {
      zh: {
        range7: "\u8FD1 7 \u5929",
        range30: "\u8FD1 30 \u5929",
        range90: "\u8FD1 90 \u5929",
        range365: "\u8FD1 1 \u5E74",
        rangeAll: "\u5168\u90E8",
        refresh: "\u5237\u65B0",
        asOf: "\u622A\u81F3",
        retry: "\u91CD\u8BD5",
        loadFail: "\u7EDF\u8BA1\u670D\u52A1\u672A\u5C31\u7EEA\uFF0C\u8BF7\u5347\u7EA7\u63D2\u4EF6\u540E\u91CD\u8BD5",
        sites: "\u7AD9\u70B9\u603B\u6570",
        bindable: "\u53EF\u7ED1\u5B9A",
        tagged: "\u6709\u6807\u7B7E",
        coverage: "\u6807\u7B7E\u8986\u76D6\u7387",
        nodes: "\u76EE\u5F55\u6570",
        noLink: "\u65E0\u94FE\u63A5",
        multiLink: "\u591A\u94FE\u63A5",
        newSites: "\u8303\u56F4\u5185\u65B0\u589E\u7AD9\u70B9",
        current: "\u5F53\u524D",
        inRange: "\u8303\u56F4\u5185",
        ofTotal: "\u5360\u603B\u91CF",
        links: "\u94FE\u63A5\u5065\u5EB7",
        linksNote: "\u6309\u7AD9\u70B9\u94FE\u63A5\u6570\u5206\u6876",
        freshness: "\u66F4\u65B0\u65B0\u9C9C\u5EA6",
        freshnessNote: "\u8DDD\u6700\u8FD1\u4E00\u6B21\u66F4\u65B0",
        nodeDist: "\u76EE\u5F55\u5206\u5E03",
        nodeNote: "\u542B\u5B50\u6811\u7AD9\u70B9\u6570",
        topTags: "\u6807\u7B7E Top",
        topTagsNote: "\u6309\u5173\u8054\u7AD9\u70B9\u6570\u6392\u5E8F",
        trend: "\u65B0\u589E\u7AD9\u70B9 / \u76EE\u5F55\u8D8B\u52BF",
        trendNote: "\u6309\u81EA\u7136\u65E5 / \u5468 / \u6708\u5206\u6876",
        siteSeries: "\u65B0\u589E\u7AD9\u70B9",
        nodeSeries: "\u65B0\u589E\u76EE\u5F55",
        stale: "\u6700\u4E45\u672A\u66F4\u65B0",
        staleNote: "\u6309\u672A\u66F4\u65B0\u5929\u6570\u964D\u5E8F",
        duplicates: "\u91CD\u590D URL",
        duplicatesNote: "\u5F52\u4E00\u5316\u540E\u8BA1\u6570 > 1",
        orphans: "\u65E0\u76EE\u5F55\u7AD9\u70B9",
        orphansNote: "\u7F3A\u5C11\u76EE\u5F55\u6620\u5C04",
        emptyNodes: "\u7A7A\u76EE\u5F55",
        emptyNodesNote: "\u542B\u5B50\u6811 0 \u4E2A\u7AD9\u70B9",
        colName: "\u540D\u79F0",
        colSubtree: "\u5B50\u6811\u7AD9\u70B9",
        colShare: "\u5360\u6BD4",
        colDirect: "\u76F4\u63A5",
        colDepth: "\u5C42\u7EA7",
        colUpdated: "\u6700\u8FD1\u66F4\u65B0",
        colAge: "\u672A\u66F4\u65B0\u5929\u6570",
        colUrl: "URL",
        colSites: "\u7AD9\u70B9",
        noStale: "\u6CA1\u6709\u9648\u65E7\u7AD9\u70B9",
        noDup: "\u6CA1\u6709\u91CD\u590D URL",
        noOrphan: "\u6240\u6709\u7AD9\u70B9\u90FD\u5DF2\u5F52\u6863",
        noEmpty: "\u6CA1\u6709\u7A7A\u76EE\u5F55",
        noData: "\u8FD8\u6CA1\u6709\u7AD9\u70B9\u3002\u5728\u300C\u7AD9\u70B9\u300D\u9875\u6536\u85CF\u540E\uFF0C\u8FD9\u91CC\u4F1A\u81EA\u52A8\u6C47\u603B",
        noTagDomain: "\u6807\u7B7E\u63D2\u4EF6\u672A\u542F\u7528\uFF0C\u6807\u7B7E\u76F8\u5173\u533A\u5757\u5DF2\u9690\u85CF"
      },
      en: {
        range7: "7 days",
        range30: "30 days",
        range90: "90 days",
        range365: "1 year",
        rangeAll: "All",
        refresh: "Refresh",
        asOf: "As of",
        retry: "Retry",
        loadFail: "Stats service not ready. Upgrade the plugin and retry.",
        sites: "Sites",
        bindable: "Bindable",
        tagged: "Tagged",
        coverage: "Tag coverage",
        nodes: "Folders",
        noLink: "No link",
        multiLink: "Multi-link",
        newSites: "New sites",
        current: "Current",
        inRange: "In range",
        ofTotal: "of total",
        links: "Link health",
        linksNote: "Sites by link count",
        freshness: "Freshness",
        freshnessNote: "Since last update",
        nodeDist: "Folder distribution",
        nodeNote: "Sites in subtree",
        topTags: "Top tags",
        topTagsNote: "By linked sites",
        trend: "New sites / folders",
        trendNote: "Bucketed by day / week / month",
        siteSeries: "Sites",
        nodeSeries: "Folders",
        stale: "Stalest sites",
        staleNote: "Oldest update first",
        duplicates: "Duplicate URLs",
        duplicatesNote: "Normalized count > 1",
        orphans: "Sites without folder",
        orphansNote: "Missing folder mapping",
        emptyNodes: "Empty folders",
        emptyNodesNote: "0 sites in subtree",
        colName: "Name",
        colSubtree: "Sites",
        colShare: "Share",
        colDirect: "Direct",
        colDepth: "Depth",
        colUpdated: "Updated",
        colAge: "Days idle",
        colUrl: "URL",
        colSites: "Sites",
        noStale: "No stale sites",
        noDup: "No duplicate URLs",
        noOrphan: "All sites are filed",
        noEmpty: "No empty folders",
        noData: "No sites yet. Save one on the Sites page and the summary appears here.",
        noTagDomain: "Tag plugin is not enabled; tag blocks are hidden."
      }
    };
    var RANGES = ["7d", "30d", "90d", "365d", "all"];
    var CFG_FALLBACK = { "stats.range": "30d", "stats.top": 10, "stats.showKpi": true };
    function SitesStatsView(props) {
      var lang = props.lang === "en" ? "en" : "zh";
      var cfg = configView.useConfig(props.api, CFG_FALLBACK);
      if (!cfg.ready) {
        return h2("div", { style: { padding: "48px", textAlign: "center", fontSize: "12.5px", opacity: 0.6 } }, lang === "en" ? "Loading\u2026" : "\u8F7D\u5165\u4E2D\u2026");
      }
      return h2(SitesStatsBody, Object.assign({}, props, { cfg: cfg.values }));
    }
    function SitesStatsBody(props) {
      var lang = props.lang === "en" ? "en" : "zh";
      var t = COPY[lang];
      var api = props.api;
      var cfg = props.cfg || {};
      var cfgRange = RANGES.indexOf(cfg["stats.range"]) >= 0 ? cfg["stats.range"] : "30d";
      var cfgTop = Math.floor(Number(cfg["stats.top"]));
      if (!(cfgTop >= 5)) cfgTop = 10;
      if (cfgTop > 20) cfgTop = 20;
      var cfgSections = Array.isArray(cfg["stats.sections"]) ? cfg["stats.sections"] : null;
      function sectionOn(key) {
        return !cfgSections || cfgSections.indexOf(key) >= 0;
      }
      var ch = React2.useMemo(function() {
        return charts.makeCharts("wbs");
      }, []);
      var rangePair = React2.useState(cfgRange);
      var range = rangePair[0], setRange = rangePair[1];
      var dataPair = React2.useState(null);
      var data = dataPair[0], setData = dataPair[1];
      var errPair = React2.useState("");
      var err = errPair[0], setErr = errPair[1];
      var loadPair = React2.useState(true);
      var loading = loadPair[0], setLoading = loadPair[1];
      var req = React2.useRef(0);
      var load = React2.useCallback(function(silent) {
        var id = ++req.current;
        if (!silent) setLoading(true);
        return Promise.resolve(api.call("sites.statsReport", { range, top: cfgTop })).then(function(r) {
          return r && r.result !== void 0 ? r.result : r;
        }).then(function(d) {
          if (id === req.current) {
            setData(d);
            setErr("");
          }
        }).catch(function(e) {
          if (id === req.current) setErr(String(e && e.message || e || "load failed"));
        }).then(function() {
          if (id === req.current) setLoading(false);
        });
      }, [api, range]);
      React2.useEffect(function() {
        load(false);
      }, [load]);
      React2.useEffect(function() {
        if (!api || typeof api.subscribe !== "function") return void 0;
        var timer = null;
        var pending = false;
        var off = api.subscribe(function(payload) {
          var ev = payload && payload.event;
          if (ev !== "sites-changed" && ev !== "site-nodes-changed" && ev !== "tags-changed") return;
          if (typeof document !== "undefined" && document.visibilityState && document.visibilityState !== "visible") {
            pending = true;
            return;
          }
          if (timer) clearTimeout(timer);
          timer = setTimeout(function() {
            load(true);
          }, 800);
        });
        function onVisible() {
          if (typeof document !== "undefined" && document.visibilityState === "visible" && pending) {
            pending = false;
            load(true);
          }
        }
        if (typeof document !== "undefined") document.addEventListener("visibilitychange", onVisible);
        return function() {
          if (timer) clearTimeout(timer);
          if (typeof document !== "undefined") document.removeEventListener("visibilitychange", onVisible);
          if (typeof off === "function") off();
        };
      }, [api, load]);
      var options = RANGES.map(function(key) {
        return { key, label: t["range" + (key === "all" ? "All" : key.replace("d", ""))] };
      });
      var children = [];
      if (!data && loading) children.push(h2(ch.Skeleton, { key: "sk" }));
      if (!data && !loading && err) children.push(h2(ch.Card, { key: "err", span: 12 }, h2(ch.Empty, { text: t.loadFail })));
      if (data && data.totals) {
        var totals = data.totals;
        var rates = data.rates || {};
        var b = data.breakdowns || {};
        var tagMissing = rates.tagCoverage === null || rates.tagCoverage === void 0;
        children.push(h2(
          "div",
          { key: "kpi", className: "wbs-kpis" },
          h2(ch.Kpi, { label: t.sites, icon: "globe", value: totals.sites, hint: t.current, lang }),
          h2(ch.Kpi, { label: t.bindable, icon: "link", value: totals.bindable, hint: ch.pct(rates.bindableRatio) + " " + t.ofTotal, lang }),
          h2(ch.Kpi, { label: t.tagged, icon: "tag", value: tagMissing ? "\u2014" : totals.tagged, hint: tagMissing ? t.noTagDomain : ch.pct(rates.tagCoverage) + " " + t.ofTotal, lang }),
          h2(ch.Kpi, { label: t.coverage, icon: "pie", value: tagMissing ? "\u2014" : ch.pct(rates.tagCoverage), hint: t.current, tone: tagMissing ? "" : "ok", lang }),
          h2(ch.Kpi, { label: t.nodes, icon: "folder", value: totals.nodes, hint: t.current, lang }),
          h2(ch.Kpi, { label: t.noLink, icon: "unlink", value: totals.noLink, hint: ch.pct(rates.linkCoverage) + " " + t.ofTotal, tone: totals.noLink > 0 ? "warn" : "", lang }),
          h2(ch.Kpi, { label: t.multiLink, icon: "layers", value: totals.multiLink, hint: t.current, lang }),
          h2(ch.Kpi, { label: t.newSites, icon: "plus", value: totals.newSites, hint: t.inRange, lang })
        ));
        if (totals.sites === 0 && totals.nodes === 0) {
          children.push(h2(ch.Card, { key: "empty", span: 12 }, h2(ch.Empty, { text: t.noData })));
        } else {
          children.push(h2(
            ch.Card,
            { key: "links", span: 4, title: t.links, note: t.linksNote },
            h2(ch.Donut, {
              data: (b.links || []).map(function(x, i) {
                return { key: x.key, label: x.label, count: x.count, color: ch.colors[i] };
              }),
              total: totals.sites,
              lang,
              centerLabel: t.sites,
              aria: (b.links || []).map(function(x) {
                return x.label + " " + x.count;
              }).join("\uFF0C")
            })
          ));
          children.push(h2(
            ch.Card,
            { key: "fresh", span: 4, title: t.freshness, note: t.freshnessNote },
            h2(ch.Histogram, { data: b.freshness || [], lang, color: ch.colors[2] })
          ));
          children.push(h2(
            ch.Card,
            { key: "nodes", span: 4, title: t.nodeDist, note: t.nodeNote },
            h2(ch.BarList, {
              data: (data.rankings && data.rankings.topNodes || []).map(function(x) {
                return { key: x.id, label: x.name, value: x.subtree, title: x.name };
              }),
              lang,
              color: ch.colors[0]
            })
          ));
          children.push(h2(
            ch.Card,
            { key: "trend", span: 8, title: t.trend, note: t.trendNote },
            h2(ch.Trend, {
              data: data.trend || [],
              lang,
              series: [
                { key: "sites", label: t.siteSeries, color: ch.colors[0] },
                { key: "nodes", label: t.nodeSeries, color: ch.colors[1] }
              ]
            })
          ));
          children.push(h2(
            ch.Card,
            { key: "topTags", span: 4, title: t.topTags, note: t.topTagsNote },
            tagMissing ? h2(ch.Empty, { text: t.noTagDomain }) : h2(ch.BarList, {
              data: (data.rankings && data.rankings.topTags || []).map(function(x) {
                return { key: x.id, label: x.name, value: x.count, title: x.name };
              }),
              lang,
              color: ch.colors[4]
            })
          ));
          children.push(h2(
            ch.Card,
            { key: "stale", span: 6, title: t.stale, note: t.staleNote },
            h2(ch.DataTable, {
              rows: data.lists && data.lists.stale || [],
              lang,
              empty: t.noStale,
              columns: [
                { key: "name", label: t.colName },
                { key: "ageDays", label: t.colAge, num: true },
                { key: "updatedAt", label: t.colUpdated, render: function(r) {
                  return ch.dateText(r.updatedAt);
                } }
              ]
            })
          ));
          children.push(h2(
            ch.Card,
            { key: "dup", span: 6, title: t.duplicates, note: t.duplicatesNote },
            h2(ch.DataTable, {
              rows: data.lists && data.lists.duplicates || [],
              lang,
              empty: t.noDup,
              columns: [
                { key: "url", label: t.colUrl, render: function(r) {
                  return h2("span", { title: r.url }, String(r.url).slice(0, 46) + (String(r.url).length > 46 ? "\u2026" : ""));
                } },
                { key: "sites", label: t.colSites, render: function(r) {
                  return (r.sites || []).map(function(s) {
                    return s.name;
                  }).join("\u3001");
                } }
              ]
            })
          ));
          children.push(h2(
            ch.Card,
            { key: "orphan", span: 6, title: t.orphans, note: t.orphansNote },
            h2(ch.DataTable, {
              rows: data.lists && data.lists.orphanSites || [],
              lang,
              empty: t.noOrphan,
              columns: [{ key: "name", label: t.colName }]
            })
          ));
          children.push(h2(
            ch.Card,
            { key: "emptyNodes", span: 6, title: t.emptyNodes, note: t.emptyNodesNote },
            h2(ch.DataTable, {
              rows: data.lists && data.lists.emptyNodes || [],
              lang,
              empty: t.noEmpty,
              columns: [
                { key: "name", label: t.colName },
                { key: "depth", label: t.colDepth, num: true }
              ]
            })
          ));
        }
        children.push(h2(ch.Warnings, { key: "warn", items: data.warnings || [] }));
      }
      children = children.filter(function(node) {
        var k = node && node.key;
        if (!k || k === "sk" || k === "err" || k === "warn" || k === "empty") return true;
        if (k === "kpi") return cfg["stats.showKpi"] !== false;
        return sectionOn(k);
      });
      return h2(
        "div",
        { className: "wbs-stats" },
        h2(ch.RangeSwitch, {
          options,
          value: range,
          onChange: setRange,
          onRefresh: function() {
            load(false);
          },
          loading,
          generatedAt: data && data.generatedAt,
          refreshLabel: t.refresh,
          timeLabel: t.asOf
        }),
        err && data ? h2(ch.ErrorBar, { message: err, onRetry: function() {
          load(false);
        }, retryLabel: t.retry }) : null,
        h2("div", { className: "wbs-sgrid" }, children)
      );
    }
    module2.exports = { SitesStatsView };
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/x.mjs
var x_exports = {};
__export(x_exports, {
  __iconData: () => __iconData10,
  default: () => X
});
var __iconData10, X;
var init_x = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/x.mjs"() {
    init_createLucideIcon();
    __iconData10 = {
      name: "x",
      size: 24,
      node: [
        ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
        ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
      ]
    };
    __iconData10.node;
    X = createLucideIcon(__iconData10);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/check.mjs
var check_exports = {};
__export(check_exports, {
  __iconData: () => __iconData11,
  default: () => Check
});
var __iconData11, Check;
var init_check = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/check.mjs"() {
    init_createLucideIcon();
    __iconData11 = {
      name: "check",
      size: 24,
      node: [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]
    };
    __iconData11.node;
    Check = createLucideIcon(__iconData11);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/pencil.mjs
var pencil_exports = {};
__export(pencil_exports, {
  __iconData: () => __iconData12,
  default: () => Pencil
});
var __iconData12, Pencil;
var init_pencil = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/pencil.mjs"() {
    init_createLucideIcon();
    __iconData12 = {
      name: "pencil",
      size: 24,
      node: [
        [
          "path",
          {
            d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
            key: "1a8usu"
          }
        ],
        ["path", { d: "m15 5 4 4", key: "1mk7zo" }]
      ]
    };
    __iconData12.node;
    Pencil = createLucideIcon(__iconData12);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/trash.mjs
var __iconData13, Trash;
var init_trash = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/trash.mjs"() {
    init_createLucideIcon();
    __iconData13 = {
      name: "trash",
      size: 24,
      node: [
        ["path", { d: "M10 11v6", key: "nco0om" }],
        ["path", { d: "M14 11v6", key: "outv1u" }],
        ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", key: "miytrc" }],
        ["path", { d: "M3 6h18", key: "d0wm0j" }],
        ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "e791ji" }]
      ],
      aliases: ["trash-2"]
    };
    __iconData13.node;
    Trash = createLucideIcon(__iconData13);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/trash-2.mjs
var trash_2_exports = {};
__export(trash_2_exports, {
  default: () => Trash
});
var init_trash_2 = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/trash-2.mjs"() {
    init_trash();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/folder.mjs
var folder_exports = {};
__export(folder_exports, {
  __iconData: () => __iconData14,
  default: () => Folder
});
var __iconData14, Folder;
var init_folder = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/folder.mjs"() {
    init_createLucideIcon();
    __iconData14 = {
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
    __iconData14.node;
    Folder = createLucideIcon(__iconData14);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/folder-open.mjs
var folder_open_exports = {};
__export(folder_open_exports, {
  __iconData: () => __iconData15,
  default: () => FolderOpen
});
var __iconData15, FolderOpen;
var init_folder_open = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/folder-open.mjs"() {
    init_createLucideIcon();
    __iconData15 = {
      name: "folder-open",
      size: 24,
      node: [
        [
          "path",
          {
            d: "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",
            key: "usdka0"
          }
        ]
      ]
    };
    __iconData15.node;
    FolderOpen = createLucideIcon(__iconData15);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/folder-plus.mjs
var folder_plus_exports = {};
__export(folder_plus_exports, {
  __iconData: () => __iconData16,
  default: () => FolderPlus
});
var __iconData16, FolderPlus;
var init_folder_plus = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/folder-plus.mjs"() {
    init_createLucideIcon();
    __iconData16 = {
      name: "folder-plus",
      size: 24,
      node: [
        ["path", { d: "M12 10v6", key: "1bos4e" }],
        ["path", { d: "M9 13h6", key: "1uhe8q" }],
        [
          "path",
          {
            d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
            key: "1kt360"
          }
        ]
      ]
    };
    __iconData16.node;
    FolderPlus = createLucideIcon(__iconData16);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/house.mjs
var house_exports = {};
__export(house_exports, {
  __iconData: () => __iconData17,
  default: () => House
});
var __iconData17, House;
var init_house = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/house.mjs"() {
    init_createLucideIcon();
    __iconData17 = {
      name: "house",
      size: 24,
      node: [
        ["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8", key: "5wwlr5" }],
        [
          "path",
          {
            d: "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
            key: "r6nss1"
          }
        ]
      ],
      aliases: ["home"]
    };
    __iconData17.node;
    House = createLucideIcon(__iconData17);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/star.mjs
var star_exports = {};
__export(star_exports, {
  __iconData: () => __iconData18,
  default: () => Star
});
var __iconData18, Star;
var init_star = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/star.mjs"() {
    init_createLucideIcon();
    __iconData18 = {
      name: "star",
      size: 24,
      node: [
        [
          "path",
          {
            d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
            key: "r04s7s"
          }
        ]
      ]
    };
    __iconData18.node;
    Star = createLucideIcon(__iconData18);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/search.mjs
var search_exports = {};
__export(search_exports, {
  __iconData: () => __iconData19,
  default: () => Search
});
var __iconData19, Search;
var init_search = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/search.mjs"() {
    init_createLucideIcon();
    __iconData19 = {
      name: "search",
      size: 24,
      node: [
        ["path", { d: "m21 21-4.34-4.34", key: "14j7rj" }],
        ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }]
      ]
    };
    __iconData19.node;
    Search = createLucideIcon(__iconData19);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/chevron-left.mjs
var chevron_left_exports = {};
__export(chevron_left_exports, {
  __iconData: () => __iconData20,
  default: () => ChevronLeft
});
var __iconData20, ChevronLeft;
var init_chevron_left = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/chevron-left.mjs"() {
    init_createLucideIcon();
    __iconData20 = {
      name: "chevron-left",
      size: 24,
      node: [["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]]
    };
    __iconData20.node;
    ChevronLeft = createLucideIcon(__iconData20);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/chevron-right.mjs
var chevron_right_exports = {};
__export(chevron_right_exports, {
  __iconData: () => __iconData21,
  default: () => ChevronRight
});
var __iconData21, ChevronRight;
var init_chevron_right = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/chevron-right.mjs"() {
    init_createLucideIcon();
    __iconData21 = {
      name: "chevron-right",
      size: 24,
      node: [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]]
    };
    __iconData21.node;
    ChevronRight = createLucideIcon(__iconData21);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/chevron-down.mjs
var chevron_down_exports = {};
__export(chevron_down_exports, {
  __iconData: () => __iconData22,
  default: () => ChevronDown
});
var __iconData22, ChevronDown;
var init_chevron_down = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/chevron-down.mjs"() {
    init_createLucideIcon();
    __iconData22 = {
      name: "chevron-down",
      size: 24,
      node: [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]]
    };
    __iconData22.node;
    ChevronDown = createLucideIcon(__iconData22);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/arrow-up.mjs
var arrow_up_exports = {};
__export(arrow_up_exports, {
  __iconData: () => __iconData23,
  default: () => ArrowUp
});
var __iconData23, ArrowUp;
var init_arrow_up = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/arrow-up.mjs"() {
    init_createLucideIcon();
    __iconData23 = {
      name: "arrow-up",
      size: 24,
      node: [
        ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
        ["path", { d: "M12 19V5", key: "x0mq9r" }]
      ]
    };
    __iconData23.node;
    ArrowUp = createLucideIcon(__iconData23);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/arrow-down.mjs
var arrow_down_exports = {};
__export(arrow_down_exports, {
  __iconData: () => __iconData24,
  default: () => ArrowDown
});
var __iconData24, ArrowDown;
var init_arrow_down = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/arrow-down.mjs"() {
    init_createLucideIcon();
    __iconData24 = {
      name: "arrow-down",
      size: 24,
      node: [
        ["path", { d: "M12 5v14", key: "s699le" }],
        ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
      ]
    };
    __iconData24.node;
    ArrowDown = createLucideIcon(__iconData24);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/arrow-up-down.mjs
var arrow_up_down_exports = {};
__export(arrow_up_down_exports, {
  __iconData: () => __iconData25,
  default: () => ArrowUpDown
});
var __iconData25, ArrowUpDown;
var init_arrow_up_down = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/arrow-up-down.mjs"() {
    init_createLucideIcon();
    __iconData25 = {
      name: "arrow-up-down",
      size: 24,
      node: [
        ["path", { d: "m21 16-4 4-4-4", key: "f6ql7i" }],
        ["path", { d: "M17 20V4", key: "1ejh1v" }],
        ["path", { d: "m3 8 4-4 4 4", key: "11wl7u" }],
        ["path", { d: "M7 4v16", key: "1glfcx" }]
      ]
    };
    __iconData25.node;
    ArrowUpDown = createLucideIcon(__iconData25);
  }
});

// packages/addons/sites/client/client.src.cjs
var React = require("react");
var h = React.createElement;
(function() {
  var host = window.__WB_HOST__;
  if (!host) {
    console.error("[wb-addon-sites] \u7F3A\u5C11 window.__WB_HOST__\uFF0C\u65E0\u6CD5\u6CE8\u518C\u7AD9\u70B9\u89C6\u56FE");
    return { name: "dsh-workbench-sites", inject: [], apply: function() {
    } };
  }
  var React2 = require("react");
  var h2 = React2.createElement;
  var statsView = require_stats();
  var configView = require_config();
  var ICONS = {
    "x": (init_x(), __toCommonJS(x_exports)).default,
    "plus": (init_plus(), __toCommonJS(plus_exports)).default,
    "check": (init_check(), __toCommonJS(check_exports)).default,
    "edit": (init_pencil(), __toCommonJS(pencil_exports)).default,
    "trash": (init_trash_2(), __toCommonJS(trash_2_exports)).default,
    "folder": (init_folder(), __toCommonJS(folder_exports)).default,
    "folder-open": (init_folder_open(), __toCommonJS(folder_open_exports)).default,
    "folder-plus": (init_folder_plus(), __toCommonJS(folder_plus_exports)).default,
    "folder-tree": (init_folder_tree(), __toCommonJS(folder_tree_exports)).default,
    "house": (init_house(), __toCommonJS(house_exports)).default,
    "link": (init_link_2(), __toCommonJS(link_2_exports)).default,
    "tag": (init_tag(), __toCommonJS(tag_exports)).default,
    "star": (init_star(), __toCommonJS(star_exports)).default,
    "search": (init_search(), __toCommonJS(search_exports)).default,
    "refresh": (init_refresh_cw(), __toCommonJS(refresh_cw_exports)).default,
    "chevron-left": (init_chevron_left(), __toCommonJS(chevron_left_exports)).default,
    "chevron-right": (init_chevron_right(), __toCommonJS(chevron_right_exports)).default,
    "chevron-down": (init_chevron_down(), __toCommonJS(chevron_down_exports)).default,
    "arrow-up": (init_arrow_up(), __toCommonJS(arrow_up_exports)).default,
    "arrow-down": (init_arrow_down(), __toCommonJS(arrow_down_exports)).default,
    "arrow-up-down": (init_arrow_up_down(), __toCommonJS(arrow_up_down_exports)).default
  };
  function Icon2(props) {
    var C = ICONS[props.name];
    if (!C) return null;
    return h2(C, {
      size: props.size || 14,
      strokeWidth: props.strokeWidth || 2,
      "aria-hidden": "true",
      className: "wbs-svg" + (props.className ? " " + props.className : "")
    });
  }
  var useState = React2.useState;
  var useEffect = React2.useEffect;
  var useRef = React2.useRef;
  var useMemo2 = React2.useMemo;
  var COPY = {
    zh: {
      title: "\u7AD9\u70B9",
      all: "\u5168\u90E8\u7AD9\u70B9",
      directory: "\u76EE\u5F55",
      addDir: "\u65B0\u5EFA\u76EE\u5F55",
      addChild: "\u65B0\u5EFA\u5B50\u76EE\u5F55",
      rename: "\u91CD\u547D\u540D",
      remove: "\u5220\u9664\u76EE\u5F55",
      search: "\u641C\u7D22\u7AD9\u70B9\u540D\u79F0\u6216\u63CF\u8FF0",
      newSite: "\u65B0\u5EFA\u7AD9\u70B9",
      siteCol: "\u7AD9\u70B9 / \u5E73\u53F0",
      tagCol: "\u6807\u7B7E",
      createTime: "\u521B\u5EFA\u65F6\u95F4",
      updateTime: "\u66F4\u65B0\u65F6\u95F4",
      actions: "\u64CD\u4F5C",
      links: "\u94FE\u63A5",
      dirs: "\u76EE\u5F55",
      edit: "\u7F16\u8F91",
      del: "\u5220\u9664",
      default: "\u9ED8\u8BA4",
      noLink: "\u6682\u65E0\u94FE\u63A5",
      noDesc: "\u6682\u65E0\u63CF\u8FF0",
      empty: "\u8FD8\u6CA1\u6709\u7AD9\u70B9",
      emptyHint: "\u70B9\u51FB\u53F3\u4E0A\u89D2\u201C\u65B0\u5EFA\u7AD9\u70B9\u201D\uFF0C\u6216\u5728\u5F53\u524D\u76EE\u5F55\u4E0B\u521B\u5EFA\u7B2C\u4E00\u6761\u8BB0\u5F55\u3002",
      loading: "\u52A0\u8F7D\u4E2D\u2026",
      prev: "\u4E0A\u4E00\u9875",
      next: "\u4E0B\u4E00\u9875",
      total: "\u5171 {n} \u4E2A",
      deleteTitle: "\u5220\u9664\u7AD9\u70B9",
      deleteText: "\u786E\u5B9A\u5220\u9664\u300C{name}\u300D\u5417\uFF1F\u7AD9\u70B9\u4F1A\u88AB\u8F6F\u5220\u9664\uFF0C\u76EE\u5F55\u4E0E\u6807\u7B7E\u5173\u8054\u4E5F\u4F1A\u6E05\u7406\u3002",
      cancel: "\u53D6\u6D88",
      confirm: "\u786E\u5B9A\u5220\u9664",
      createTitle: "\u65B0\u5EFA\u7AD9\u70B9",
      editTitle: "\u7F16\u8F91\u7AD9\u70B9",
      step1: "\u57FA\u7840\u4FE1\u606F",
      step2: "\u5173\u8054\u76EE\u5F55",
      step3: "\u5173\u8054\u6807\u7B7E",
      siteName: "\u7AD9\u70B9\u540D\u79F0",
      siteNamePh: "\u4F8B\u5982\uFF1AMDN",
      desc: "\u4E00\u53E5\u8BDD\u63CF\u8FF0",
      descPh: "\u8FD9\u4E2A\u7AD9\u70B9\u662F\u505A\u4EC0\u4E48\u7684",
      linkList: "\u94FE\u63A5",
      linkDesc: "\u63CF\u8FF0",
      linkUrl: "\u7F51\u5740",
      addLink: "\u6DFB\u52A0\u94FE\u63A5",
      setDefault: "\u8BBE\u4E3A\u9ED8\u8BA4",
      removeLink: "\u79FB\u9664",
      chooseDirs: "\u9009\u62E9\u76EE\u5F55\uFF08\u81F3\u5C11\u4E00\u4E2A\uFF09",
      chooseTags: "\u9009\u62E9\u6807\u7B7E",
      tagSearch: "\u641C\u7D22\u6807\u7B7E",
      noTags: "\u6CA1\u6709\u5339\u914D\u7684\u6807\u7B7E",
      noDirs: "\u8FD8\u6CA1\u6709\u76EE\u5F55\uFF0C\u8BF7\u5148\u5728\u5DE6\u4FA7\u65B0\u5EFA\u76EE\u5F55",
      back: "\u4E0A\u4E00\u6B65",
      nextStep: "\u4E0B\u4E00\u6B65",
      save: "\u4FDD\u5B58",
      saving: "\u4FDD\u5B58\u4E2D\u2026",
      requiredName: "\u8BF7\u586B\u5199\u7AD9\u70B9\u540D\u79F0",
      requiredDirs: "\u8BF7\u81F3\u5C11\u9009\u62E9\u4E00\u4E2A\u76EE\u5F55",
      tagFilter: "\u6807\u7B7E\u7B5B\u9009",
      allTags: "\u5168\u90E8\u6807\u7B7E",
      clear: "\u6E05\u9664",
      refresh: "\u5237\u65B0",
      selected: "\u5DF2\u9009 {n} \u9879",
      deleteSelected: "\u5220\u9664\u6240\u9009",
      removeDirTitle: "\u5220\u9664\u76EE\u5F55",
      removeDirText: "\u786E\u5B9A\u5220\u9664\u300C{name}\u300D\u53CA\u5176\u6240\u6709\u5B50\u76EE\u5F55\u5417\uFF1F\u76EE\u5F55\u4E0B\u7684\u7AD9\u70B9\u4E0D\u4F1A\u88AB\u5220\u9664\uFF0C\u53EA\u4F1A\u89E3\u9664\u76EE\u5F55\u5173\u8054\u3002",
      dirName: "\u76EE\u5F55\u540D\u79F0",
      create: "\u521B\u5EFA",
      renameTitle: "\u91CD\u547D\u540D\u76EE\u5F55",
      bulkConfirm: "\u786E\u5B9A\u5220\u9664\u9009\u4E2D\u7684 {n} \u4E2A\u7AD9\u70B9\u5417\uFF1F",
      opFail: "\u64CD\u4F5C\u5931\u8D25\uFF1A{msg}",
      loadFail: "\u52A0\u8F7D\u5931\u8D25\uFF1A{msg}",
      saved: "\u5DF2\u4FDD\u5B58",
      deleted: "\u5DF2\u5220\u9664",
      moved: "\u5DF2\u79FB\u52A8"
    },
    en: {
      title: "Sites",
      all: "All sites",
      directory: "Folders",
      addDir: "New folder",
      addChild: "New subfolder",
      rename: "Rename",
      remove: "Delete folder",
      search: "Search site name or description",
      newSite: "New site",
      siteCol: "Site",
      tagCol: "Tags",
      createTime: "Created",
      updateTime: "Updated",
      actions: "Actions",
      links: "Links",
      dirs: "Folders",
      edit: "Edit",
      del: "Delete",
      default: "Default",
      noLink: "No link",
      noDesc: "No description",
      empty: "No sites yet",
      emptyHint: "Use \u201CNew site\u201D in the top right to add the first one.",
      loading: "Loading\u2026",
      prev: "Prev",
      next: "Next",
      total: "{n} sites",
      deleteTitle: "Delete site",
      deleteText: "Delete \u201C{name}\u201D? The site is soft deleted and its folder/tag links are cleaned up.",
      cancel: "Cancel",
      confirm: "Delete",
      createTitle: "New site",
      editTitle: "Edit site",
      step1: "Basics",
      step2: "Folders",
      step3: "Tags",
      siteName: "Site name",
      siteNamePh: "e.g. MDN",
      desc: "Description",
      descPh: "What is this site for?",
      linkList: "Links",
      linkDesc: "Label",
      linkUrl: "URL",
      addLink: "Add link",
      setDefault: "Default",
      removeLink: "Remove",
      chooseDirs: "Choose at least one folder",
      chooseTags: "Choose tags",
      tagSearch: "Search tags",
      noTags: "No matching tags",
      noDirs: "No folders yet. Create one on the left first.",
      back: "Back",
      nextStep: "Next",
      save: "Save",
      saving: "Saving\u2026",
      requiredName: "Site name is required",
      requiredDirs: "Choose at least one folder",
      tagFilter: "Filter by tag",
      allTags: "All tags",
      clear: "Clear",
      refresh: "Refresh",
      selected: "{n} selected",
      deleteSelected: "Delete selected",
      removeDirTitle: "Delete folder",
      removeDirText: "Delete \u201C{name}\u201D and all subfolders? Sites are kept; only folder links are removed.",
      dirName: "Folder name",
      create: "Create",
      renameTitle: "Rename folder",
      bulkConfirm: "Delete {n} selected sites?",
      opFail: "Operation failed: {msg}",
      loadFail: "Load failed: {msg}",
      saved: "Saved",
      deleted: "Deleted",
      moved: "Moved"
    }
  };
  function text(lang, key, vars) {
    var dict = COPY[lang] || COPY.zh;
    var value = dict[key] !== void 0 ? dict[key] : COPY.zh[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function(k) {
        value = value.split("{" + k + "}").join(String(vars[k]));
      });
    }
    return value;
  }
  function hostHasAddon(id) {
    var list = host.addons;
    if (!Array.isArray(list)) return true;
    return list.some(function(a) {
      return a && a.id === id && a.enabled !== false;
    });
  }
  var cssText = [
    ".wbs-root{--wbs-line:var(--dsw-alias-border-l2, color-mix(in srgb, var(--dsw-alias-label-primary,#1f2328) 13%, transparent));--wbs-soft:var(--dsw-alias-interactive-bg-hover, color-mix(in srgb, var(--dsw-alias-label-primary,#1f2328) 4.5%, transparent));--wbs-accent:var(--dsw-alias-brand-primary,#0a8f7d);--wbs-muted:var(--dsw-alias-label-secondary, color-mix(in srgb, var(--dsw-alias-label-primary,#1f2328) 58%, transparent));display:flex;flex-direction:column;min-height:560px;color:var(--dsw-alias-label-primary,#1f2328);font-size:13px}",
    ".wbs-grow{flex:1;min-width:0}",
    ".wbs-head{display:flex;align-items:center;gap:10px;margin:2px 0 14px}",
    ".wbs-badge{width:27px;height:27px;flex:none;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--wbs-accent) 12%,transparent);color:var(--wbs-accent)}",
    ".wbs-head h2{margin:0;font-size:21px;font-weight:650;letter-spacing:.01em}",
    ".wbs-count{font-size:12px;color:var(--wbs-muted)}",
    ".wbs-btn{appearance:none;border:1px solid var(--wbs-line);background:transparent;color:inherit;border-radius:8px;padding:6px 10px;font-size:12px;cursor:pointer;line-height:1.35;white-space:nowrap;font-family:inherit;display:inline-flex;align-items:center;justify-content:center;gap:5px;transition:background .12s ease,border-color .12s ease,color .12s ease}",
    ".wbs-btn:hover{background:var(--wbs-soft)}",
    ".wbs-btn.on{border-color:color-mix(in srgb,var(--wbs-accent) 45%,transparent);color:var(--wbs-accent);background:color-mix(in srgb,var(--wbs-accent) 8%,transparent)}",
    ".wbs-btn.icononly{padding:4px;gap:0}",
    ".wbs-btn:focus-visible,.wbs-mini:focus-visible,.wbs-caret:focus-visible,.wbs-crumb:focus-visible,.wbs-search input:focus-visible,.wbs-th-sort:focus-visible{outline:2px solid color-mix(in srgb,var(--wbs-accent) 55%,transparent);outline-offset:1px}",
    ".wbs-btn.primary{background:var(--wbs-accent);color:var(--dsw-alias-label-primary-inverted,#fff);border-color:transparent}",
    ".wbs-btn.primary:hover{filter:brightness(1.06)}",
    ".wbs-btn.danger{color:var(--dsw-alias-state-error-primary,#bd3b32);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary,#bd3b32) 34%,transparent)}",
    ".wbs-btn.danger:hover{background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#bd3b32) 8%,transparent)}",
    ".wbs-btn.sm{padding:3px 7px;font-size:11px;border-radius:6px}",
    ".wbs-btn:disabled{opacity:.5;cursor:not-allowed}",
    ".wbs-body{display:flex;gap:16px;align-items:flex-start;flex:1;min-height:0}",
    ".wbs-tree{width:236px;flex:none;border:1px solid var(--wbs-line);border-radius:12px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#fff) 62%,transparent);padding:8px;max-height:calc(100vh - 220px);overflow:auto}",
    ".wbs-tree-top{display:flex;align-items:center;gap:6px;padding:3px 4px 8px;border-bottom:1px solid var(--wbs-line);margin-bottom:6px}",
    ".wbs-tree-title{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:var(--wbs-muted);flex:1}",
    ".wbs-tree-title .wbs-svg{opacity:.75}",
    ".wbs-node{display:flex;align-items:center;gap:3px;padding:4px 5px;border-radius:7px;cursor:pointer;min-height:27px;box-sizing:border-box;transition:background .12s ease}",
    ".wbs-node:hover{background:var(--wbs-soft)}",
    ".wbs-node.active{background:color-mix(in srgb,var(--wbs-accent) 13%,transparent);color:var(--wbs-accent);font-weight:600}",
    ".wbs-caret{width:17px;height:17px;flex:none;display:inline-flex;align-items:center;justify-content:center;border-radius:4px;color:var(--wbs-muted);cursor:pointer;opacity:.8}",
    ".wbs-caret:hover{background:var(--wbs-soft);color:inherit;opacity:1}",
    ".wbs-caret.plain{cursor:default;opacity:.7}",
    ".wbs-caret.plain:hover{background:transparent}",
    ".wbs-caret .wbs-svg{transition:transform .13s ease}",
    ".wbs-caret.open .wbs-svg{transform:rotate(90deg)}",
    ".wbs-node-ico{display:inline-flex;align-items:center;flex:none;color:var(--wbs-muted);margin-right:1px}",
    ".wbs-node.active .wbs-node-ico{color:inherit}",
    ".wbs-node-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".wbs-node-actions{display:none;align-items:center;gap:1px;flex:none}",
    ".wbs-node:hover .wbs-node-actions{display:flex}",
    ".wbs-mini{appearance:none;border:0;background:transparent;color:var(--wbs-muted);border-radius:5px;cursor:pointer;font-size:12px;line-height:1;padding:3px 4px;font-family:inherit;display:inline-flex;align-items:center;justify-content:center;gap:4px;transition:background .12s ease,color .12s ease}",
    ".wbs-mini:hover{background:var(--wbs-line);color:inherit}",
    ".wbs-svg{display:block;flex:none}",
    ".wbs-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:10px}",
    ".wbs-crumbs{display:flex;align-items:center;gap:4px;flex-wrap:wrap;font-size:12px;min-height:22px}",
    ".wbs-crumb{appearance:none;border:0;background:transparent;color:var(--wbs-muted);padding:3px 4px;border-radius:5px;cursor:pointer;font-family:inherit;font-size:12px}",
    ".wbs-crumb:hover{background:var(--wbs-soft);color:inherit}",
    ".wbs-crumb.cur{color:inherit;font-weight:600}",
    ".wbs-sep{display:inline-flex;align-items:center;color:var(--wbs-muted);opacity:.45}",
    ".wbs-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
    ".wbs-search{display:flex;align-items:center;gap:6px;border:1px solid var(--wbs-line);border-radius:8px;padding:0 8px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#fff) 58%,transparent);min-width:210px;flex:0 1 300px}",
    ".wbs-search input{border:0;outline:0;background:transparent;color:inherit;font:inherit;padding:7px 0;flex:1;min-width:0}",
    ".wbs-search button{border:0;background:transparent;color:var(--wbs-muted);cursor:pointer;font-size:12px;padding:3px}",
    ".wbs-tagfilter{position:relative}",
    ".wbs-tagmenu{position:absolute;z-index:30;top:calc(100% + 6px);left:0;width:230px;max-height:300px;overflow:auto;background:var(--dsw-alias-bg-layer-1,#fffdf7);border:1px solid var(--wbs-line);border-radius:10px;box-shadow:0 12px 30px rgba(0,0,0,.14);padding:8px}",
    ".wbs-tagmenu-head{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--wbs-muted);padding:2px 4px 7px}",
    ".wbs-tagopt{display:flex;align-items:center;gap:7px;padding:6px;border-radius:6px;cursor:pointer;font-size:12px}",
    ".wbs-tagopt:hover{background:var(--wbs-soft)}",
    ".wbs-tablewrap{border:1px solid var(--wbs-line);border-radius:12px;overflow:auto;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#fff) 55%,transparent)}",
    ".wbs-table{width:100%;border-collapse:collapse;table-layout:fixed}",
    ".wbs-table th{font-size:11px;font-weight:600;color:var(--wbs-muted);text-align:left;padding:9px 9px;border-bottom:1px solid var(--wbs-line);white-space:nowrap;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2,#f4f1e4) 55%,transparent)}",
    ".wbs-table td{padding:10px 9px;border-bottom:1px solid color-mix(in srgb,var(--wbs-line) 68%,transparent);vertical-align:top}",
    ".wbs-table tr:last-child td{border-bottom:0}",
    ".wbs-table tbody tr:hover td{background:color-mix(in srgb,var(--wbs-accent) 3.5%,transparent)}",
    ".wbs-th-sort{cursor:pointer;user-select:none}",
    ".wbs-th-sort:hover{color:inherit}",
    ".wbs-th-label{display:inline-flex;align-items:center;gap:3px}",
    ".wbs-sort-ico{opacity:.3}",
    ".wbs-th-sort:hover .wbs-sort-ico{opacity:.6}",
    ".wbs-th-sort.on{color:var(--wbs-accent)}",
    ".wbs-th-sort.on .wbs-sort-ico{opacity:1}",
    ".wbs-site-name{font-weight:600;font-size:13px;word-break:break-word}",
    ".wbs-site-desc{font-size:12px;color:var(--wbs-muted);margin-top:3px;word-break:break-word}",
    ".wbs-site-link{display:inline-flex;align-items:center;gap:4px;margin-top:4px;font-size:11.5px;color:var(--wbs-accent);text-decoration:none;max-width:100%;overflow:hidden;white-space:nowrap;vertical-align:top}",
    ".wbs-site-link .wbs-svg{opacity:.75}",
    ".wbs-site-link span{overflow:hidden;text-overflow:ellipsis}",
    ".wbs-site-link:hover{text-decoration:underline}",
    ".wbs-muted{color:var(--wbs-muted)}",
    ".wbs-chip{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--wbs-line);border-radius:999px;padding:2px 7px;font-size:11px;margin:0 4px 3px 0;background:color-mix(in srgb,var(--wbs-accent) 6%,transparent);max-width:100%}",
    ".wbs-chip button{border:0;background:transparent;color:inherit;cursor:pointer;padding:0;display:inline-flex;align-items:center;opacity:.6}",
    ".wbs-chip button:hover{opacity:1}",
    ".wbs-actions{display:flex;gap:4px;flex-wrap:nowrap;align-items:center}",
    ".wbs-expand td{background:color-mix(in srgb,var(--dsw-alias-bg-layer-2,#f4f1e4) 52%,transparent);padding:10px 12px}",
    ".wbs-subtable{width:100%;border-collapse:collapse;font-size:12px}",
    ".wbs-subtable th{font-size:10px;color:var(--wbs-muted);text-align:left;padding:3px 6px;border-bottom:1px solid var(--wbs-line)}",
    ".wbs-subtable td{padding:5px 6px;border-bottom:1px solid color-mix(in srgb,var(--wbs-line) 45%,transparent);word-break:break-all}",
    ".wbs-dirpath{line-height:1.7}",
    ".wbs-dirpath>div{display:flex;align-items:center;gap:5px}",
    ".wbs-dirpath .wbs-svg{color:var(--wbs-muted);flex:none}",
    ".wbs-def{display:inline-flex;align-items:center;vertical-align:-2px;margin-right:4px;color:var(--wbs-accent)}",
    ".wbs-empty{text-align:center;padding:52px 12px;color:var(--wbs-muted)}",
    ".wbs-empty-ico{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:12px;margin-bottom:10px;background:var(--wbs-soft);opacity:.75}",
    ".wbs-empty b{display:block;color:inherit;font-size:14px;margin-bottom:6px}",
    ".wbs-pager{display:flex;align-items:center;gap:8px;justify-content:flex-end;padding:2px 0;font-size:12px;color:var(--wbs-muted);flex-wrap:wrap}",
    ".wbs-pager-pos{min-width:52px;text-align:center;font-variant-numeric:tabular-nums}",
    ".wbs-pager select{border:1px solid var(--wbs-line);border-radius:6px;background:transparent;color:inherit;font:inherit;padding:4px 6px}",
    ".wbs-loading{padding:24px;text-align:center;color:var(--wbs-muted);font-size:12px}",
    ".wbs-error{padding:10px 12px;border:1px solid color-mix(in srgb,var(--dsw-alias-state-error-primary,#bd3b32) 30%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#bd3b32) 6%,transparent);border-radius:8px;color:var(--dsw-alias-state-error-primary,#a4312a);font-size:12px}",
    ".wbs-toast{position:fixed;left:50%;bottom:38px;transform:translateX(-50%);z-index:1200;background:var(--dsw-alias-toast-bg,#26302d);color:var(--dsw-alias-toast-label,#fff);border-radius:8px;padding:8px 14px;font-size:12px;box-shadow:0 8px 24px rgba(0,0,0,.22);max-width:80vw}",
    ".wbs-toast.err{background:var(--dsw-alias-state-error-primary,#9d332b)}",
    ".wbs-mask{position:fixed;inset:0;z-index:900;background:rgba(24,28,26,.34);display:flex;align-items:center;justify-content:center;padding:22px}",
    ".wbs-modal{width:min(700px,96vw);max-height:88vh;overflow:auto;background:var(--dsw-alias-bg-layer-1,#fffdf7);border:1px solid var(--wbs-line);border-radius:14px;box-shadow:0 24px 70px rgba(0,0,0,.24);padding:18px}",
    ".wbs-modal.small{width:min(430px,94vw)}",
    ".wbs-modal-title{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:650;margin-bottom:4px}",
    ".wbs-modal-title .wbs-svg{color:var(--wbs-accent);opacity:.85;flex:none}",
    ".wbs-modal-x{margin-left:auto;color:var(--wbs-muted);flex:none}",
    ".wbs-modal-x:hover{background:var(--wbs-soft);color:inherit}",
    ".wbs-modal-sub{font-size:12px;color:var(--wbs-muted);margin-bottom:14px;line-height:1.6}",
    ".wbs-steps{display:flex;gap:6px;margin:2px 0 16px;flex-wrap:wrap}",
    ".wbs-step{font-size:11px;color:var(--wbs-muted);padding:4px 8px;border-radius:999px;border:1px solid transparent}",
    ".wbs-step.on{color:var(--wbs-accent);border-color:color-mix(in srgb,var(--wbs-accent) 30%,transparent);background:color-mix(in srgb,var(--wbs-accent) 8%,transparent);font-weight:600}",
    ".wbs-label{font-size:12px;font-weight:600;margin:12px 0 5px;display:block}",
    ".wbs-input,.wbs-textarea,.wbs-select{width:100%;box-sizing:border-box;border:1px solid var(--wbs-line);border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#fff) 55%,transparent);color:inherit;font:inherit;font-size:13px;padding:8px 9px;outline:0}",
    ".wbs-input:focus,.wbs-textarea:focus{border-color:var(--wbs-accent)}",
    ".wbs-textarea{min-height:70px;resize:vertical;line-height:1.6}",
    ".wbs-linkrow{display:grid;grid-template-columns:1fr 1.5fr auto auto;gap:6px;align-items:center;margin-bottom:6px}",
    ".wbs-linkrow .wbs-input{font-size:12px;padding:6px 8px}",
    ".wbs-radio{display:flex;align-items:center;gap:4px;font-size:11px;white-space:nowrap;color:var(--wbs-muted);cursor:pointer}",
    ".wbs-dirlist{border:1px solid var(--wbs-line);border-radius:9px;max-height:300px;overflow:auto;padding:5px}",
    ".wbs-dircheck{display:flex;align-items:center;gap:6px;padding:5px 6px;border-radius:6px;cursor:pointer;font-size:12px}",
    ".wbs-dircheck:hover{background:var(--wbs-soft)}",
    ".wbs-dircheck input{margin:0}",
    ".wbs-tagsearch{display:flex;gap:6px;align-items:center}",
    ".wbs-tagresults{border:1px solid var(--wbs-line);border-radius:9px;max-height:190px;overflow:auto;margin-top:7px;padding:4px}",
    ".wbs-tagresult{width:100%;display:flex;align-items:center;gap:7px;text-align:left;border:0;background:transparent;color:inherit;padding:6px;border-radius:6px;cursor:pointer;font:inherit;font-size:12px}",
    ".wbs-tagresult:hover{background:var(--wbs-soft)}",
    ".wbs-tagresult.on{background:color-mix(in srgb,var(--wbs-accent) 10%,transparent);color:var(--wbs-accent)}",
    ".wbs-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:7px;min-height:10px}",
    ".wbs-formfoot{display:flex;align-items:center;gap:8px;margin-top:18px;padding-top:14px;border-top:1px solid var(--wbs-line)}",
    ".wbs-formerr{color:var(--dsw-alias-state-error-primary,#b5392f);font-size:12px;flex:1;min-width:0}",
    ".wbs-note{font-size:11px;color:var(--wbs-muted);line-height:1.6}",
    "@media(max-width:860px){.wbs-body{flex-direction:column}.wbs-tree{width:100%;max-height:220px}.wbs-table{min-width:760px}.wbs-root{min-height:0}}",
    "@media(max-width:600px){.wbs-head h2{font-size:18px}.wbs-linkrow{grid-template-columns:1fr 1fr}.wbs-modal{padding:14px}}"
  ].join("\n");
  function injectCss() {
    var id = "wb-addon-sites-css";
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    if (el.textContent !== cssText) el.textContent = cssText;
  }
  function errText(e) {
    if (!e) return "\u672A\u77E5\u9519\u8BEF";
    return String(e.message || e);
  }
  function callApi(api, name, args) {
    return api.call(name, args || {}).then(function(r) {
      if (!r || r.ok !== true) throw new Error(r && r.error || "\u8BF7\u6C42\u5931\u8D25");
      return r.result;
    });
  }
  function pathLabel(path) {
    return (path || []).map(function(p) {
      return p.name;
    }).join(" / ");
  }
  function flattenTree(nodes, depth, out) {
    out = out || [];
    (nodes || []).forEach(function(node) {
      out.push({ node, depth: depth || 0 });
      if (node.children && node.children.length) flattenTree(node.children, (depth || 0) + 1, out);
    });
    return out;
  }
  function Modal(props) {
    return h2("div", {
      className: "wbs-mask",
      onMouseDown: function(e) {
        if (e.target === e.currentTarget && props.onClose) props.onClose();
      }
    }, h2("div", { className: "wbs-modal" + (props.small ? " small" : "") }, props.children));
  }
  function SiteFormModal(props) {
    var api = props.api;
    var lang = props.lang || "zh";
    var mode = props.mode;
    var site = props.site;
    var current = props.current || { id: "0", path: [] };
    var tagOn = !!props.tagOn;
    var maxStep = tagOn ? 2 : 1;
    var [step, setStep] = useState(0);
    var [name, setName] = useState(site ? site.siteName : "");
    var [desc, setDesc] = useState(site ? site.description : "");
    var [links, setLinks] = useState(function() {
      if (site && site.siteLinks && site.siteLinks.length) {
        return site.siteLinks.map(function(l) {
          return { description: l.description || "", link: l.link || "" };
        });
      }
      return [{ description: "", link: "" }];
    });
    var [defaultIdx, setDefaultIdx] = useState(function() {
      if (site && site.siteLinks) {
        var idx = site.siteLinks.findIndex(function(l) {
          return l.isDefault;
        });
        if (idx >= 0) return idx;
      }
      return 0;
    });
    var [dirTree, setDirTree] = useState([]);
    var [dirIds, setDirIds] = useState(function() {
      if (site && site.dirs && site.dirs.length) return site.dirs.map(function(d) {
        return d.id;
      });
      return current.id !== "0" ? [current.id] : [];
    });
    var [tags, setTags] = useState(site && site.tags ? site.tags.slice() : []);
    var [tagQuery, setTagQuery] = useState("");
    var [tagResults, setTagResults] = useState([]);
    var [error, setError] = useState("");
    var [saving, setSaving] = useState(false);
    useEffect(function() {
      callApi(api, "siteNodes.tree").then(function(rows) {
        setDirTree(rows || []);
      }).catch(function(e) {
        setError(errText(e));
      });
    }, []);
    useEffect(function() {
      if (!tagOn) {
        setTagResults([]);
        return;
      }
      var alive = true;
      var timer = setTimeout(function() {
        callApi(api, "siteTags.search", { text: tagQuery, pageSize: 50 }).then(function(r) {
          if (alive) setTagResults(r.records || []);
        }).catch(function() {
          if (alive) setTagResults([]);
        });
      }, 220);
      return function() {
        alive = false;
        clearTimeout(timer);
      };
    }, [tagQuery, tagOn]);
    var flatDirs = useMemo2(function() {
      return flattenTree(dirTree, 0);
    }, [dirTree]);
    function toggleDir(id) {
      setDirIds(function(prev) {
        if (prev.indexOf(id) >= 0) return prev.filter(function(x) {
          return x !== id;
        });
        return prev.concat([id]);
      });
    }
    function toggleTag(tag) {
      setTags(function(prev) {
        if (prev.some(function(x) {
          return x.id === tag.id;
        })) {
          return prev.filter(function(x) {
            return x.id !== tag.id;
          });
        }
        return prev.concat([tag]);
      });
    }
    function updateLink(index, key, value) {
      setLinks(function(prev) {
        return prev.map(function(l, i) {
          return i === index ? Object.assign({}, l, { [key]: value }) : l;
        });
      });
    }
    function addLink() {
      setLinks(function(prev) {
        return prev.concat([{ description: "", link: "" }]);
      });
    }
    function removeLink(index) {
      setLinks(function(prev) {
        var next2 = prev.filter(function(_, i) {
          return i !== index;
        });
        return next2.length ? next2 : [{ description: "", link: "" }];
      });
      if (defaultIdx === index) setDefaultIdx(0);
      else if (defaultIdx > index) setDefaultIdx(defaultIdx - 1);
    }
    function validate(toStep) {
      if (toStep >= 1 && !String(name).trim()) {
        setError(text(lang, "requiredName"));
        return false;
      }
      if (toStep >= 2 && !dirIds.length) {
        setError(text(lang, "requiredDirs"));
        return false;
      }
      setError("");
      return true;
    }
    function next() {
      if (step >= maxStep) return;
      if (!validate(step + 1)) return;
      setStep(step + 1);
    }
    function save() {
      if (!validate(2)) return;
      setSaving(true);
      setError("");
      var siteLinks = links.filter(function(l) {
        return String(l.link || "").trim() || String(l.description || "").trim();
      }).map(function(l, i) {
        return { description: String(l.description || "").trim(), link: String(l.link || "").trim(), isDefault: i === defaultIdx };
      });
      var payload = {
        siteName: String(name).trim(),
        description: String(desc || "").trim(),
        siteLinks,
        dirIds
      };
      if (tagOn) payload.tagIds = tags.map(function(t) {
        return t.id;
      });
      var p;
      if (mode === "edit" && site) {
        p = callApi(api, "sites.update", Object.assign({ id: site.id }, payload));
      } else {
        p = callApi(api, "sites.create", payload);
      }
      p.then(function() {
        setSaving(false);
        props.onSaved();
      }).catch(function(e) {
        setSaving(false);
        setError(errText(e));
      });
    }
    var steps = tagOn ? [text(lang, "step1"), text(lang, "step2"), text(lang, "step3")] : [text(lang, "step1"), text(lang, "step2")];
    var title = mode === "edit" ? text(lang, "editTitle") : text(lang, "createTitle");
    return h2(
      Modal,
      { onClose: saving ? null : props.onClose },
      h2(
        "div",
        { className: "wbs-modal-title" },
        h2(Icon2, { name: mode === "edit" ? "edit" : "plus", size: 15 }),
        title,
        h2("button", { type: "button", className: "wbs-mini wbs-modal-x", title: text(lang, "cancel"), onClick: props.onClose }, h2(Icon2, { name: "x", size: 15 }))
      ),
      h2("div", { className: "wbs-steps" }, steps.map(function(s, i) {
        return h2("span", { key: i, className: "wbs-step" + (i === step ? " on" : "") }, i + 1 + " \xB7 " + s);
      })),
      step === 0 ? h2(
        "div",
        null,
        h2("label", { className: "wbs-label" }, text(lang, "siteName")),
        h2("input", {
          className: "wbs-input",
          value: name,
          autoFocus: true,
          placeholder: text(lang, "siteNamePh"),
          onChange: function(e) {
            setName(e.target.value);
          }
        }),
        h2("label", { className: "wbs-label" }, text(lang, "desc")),
        h2("textarea", {
          className: "wbs-textarea",
          value: desc,
          placeholder: text(lang, "descPh"),
          onChange: function(e) {
            setDesc(e.target.value);
          }
        }),
        h2("label", { className: "wbs-label" }, text(lang, "linkList")),
        links.map(function(l, i) {
          return h2(
            "div",
            { className: "wbs-linkrow", key: i },
            h2("input", {
              className: "wbs-input",
              value: l.description,
              placeholder: text(lang, "linkDesc"),
              onChange: function(e) {
                updateLink(i, "description", e.target.value);
              }
            }),
            h2("input", {
              className: "wbs-input",
              value: l.link,
              placeholder: text(lang, "linkUrl"),
              onChange: function(e) {
                updateLink(i, "link", e.target.value);
              }
            }),
            h2(
              "label",
              { className: "wbs-radio", title: text(lang, "setDefault") },
              h2("input", {
                type: "radio",
                name: "wbs-default-link",
                checked: defaultIdx === i,
                onChange: function() {
                  setDefaultIdx(i);
                }
              }),
              text(lang, "default")
            ),
            h2("button", { type: "button", className: "wbs-mini", title: text(lang, "removeLink"), onClick: function() {
              removeLink(i);
            } }, h2(Icon2, { name: "x", size: 13 }))
          );
        }),
        h2("button", { type: "button", className: "wbs-btn sm", onClick: addLink }, h2(Icon2, { name: "plus", size: 13 }), text(lang, "addLink"))
      ) : null,
      step === 1 ? h2(
        "div",
        null,
        h2("div", { className: "wbs-label" }, text(lang, "chooseDirs")),
        !flatDirs.length ? h2("div", { className: "wbs-note" }, text(lang, "noDirs")) : h2(
          "div",
          { className: "wbs-dirlist" },
          flatDirs.map(function(item) {
            var id = String(item.node.id);
            return h2(
              "label",
              {
                key: id,
                className: "wbs-dircheck",
                style: { paddingLeft: 6 + item.depth * 16 }
              },
              h2("input", {
                type: "checkbox",
                checked: dirIds.indexOf(id) >= 0,
                onChange: function() {
                  toggleDir(id);
                }
              }),
              h2("span", null, item.node.name)
            );
          })
        ),
        h2("div", { className: "wbs-note", style: { marginTop: 8 } }, "\u7AD9\u70B9\u53EF\u540C\u65F6\u6302\u5728\u591A\u4E2A\u76EE\u5F55\u4E0B\uFF1B\u5217\u8868\u4F1A\u6309\u76EE\u5F55\u5B50\u6811\u8FC7\u6EE4\u3002")
      ) : null,
      tagOn && step === 2 ? h2(
        "div",
        null,
        h2("div", { className: "wbs-label" }, text(lang, "chooseTags")),
        tags.length ? h2("div", { className: "wbs-chips" }, tags.map(function(t) {
          return h2(
            "span",
            { className: "wbs-chip", key: t.id },
            t.name,
            h2("button", { type: "button", onClick: function() {
              toggleTag(t);
            }, title: "\u79FB\u9664" }, h2(Icon2, { name: "x", size: 12 }))
          );
        })) : h2("div", { className: "wbs-note" }, "\u6682\u672A\u9009\u62E9\u6807\u7B7E"),
        h2(
          "div",
          { className: "wbs-tagsearch", style: { marginTop: 10 } },
          h2("input", {
            className: "wbs-input",
            value: tagQuery,
            placeholder: text(lang, "tagSearch"),
            onChange: function(e) {
              setTagQuery(e.target.value);
            }
          })
        ),
        h2("div", { className: "wbs-tagresults" }, tagResults.length ? tagResults.map(function(t) {
          var on = tags.some(function(x) {
            return x.id === t.id;
          });
          return h2(
            "button",
            {
              key: t.id,
              type: "button",
              className: "wbs-tagresult" + (on ? " on" : ""),
              onClick: function() {
                toggleTag(t);
              }
            },
            h2(Icon2, { name: on ? "check" : "plus", size: 12 }),
            h2("span", null, t.name)
          );
        }) : h2("div", { className: "wbs-note", style: { padding: 6 } }, text(lang, "noTags"))),
        h2("div", { className: "wbs-note", style: { marginTop: 8 } }, "\u6807\u7B7E\u7531\u6807\u7B7E\u5B50\u63D2\u4EF6\u63D0\u4F9B\uFF0C\u53EF\u591A\u9009\u3002")
      ) : null,
      h2(
        "div",
        { className: "wbs-formfoot" },
        h2("div", { className: "wbs-formerr" }, error || ""),
        step > 0 ? h2("button", { type: "button", className: "wbs-btn", disabled: saving, onClick: function() {
          setStep(step - 1);
        } }, h2(Icon2, { name: "chevron-left", size: 13 }), text(lang, "back")) : null,
        h2("button", { type: "button", className: "wbs-btn", disabled: saving, onClick: props.onClose }, text(lang, "cancel")),
        step < maxStep ? h2("button", { type: "button", className: "wbs-btn primary", onClick: next }, text(lang, "nextStep"), h2(Icon2, { name: "chevron-right", size: 13 })) : h2("button", { type: "button", className: "wbs-btn primary", disabled: saving, onClick: save }, h2(Icon2, { name: "check", size: 13 }), saving ? text(lang, "saving") : text(lang, "save"))
      )
    );
  }
  function DirModal(props) {
    var api = props.api;
    var lang = props.lang || "zh";
    var dlg = props.dlg;
    var [name, setName] = useState(dlg.name || "");
    var [error, setError] = useState("");
    var [saving, setSaving] = useState(false);
    var isDelete = dlg.mode === "delete";
    var title = isDelete ? text(lang, "removeDirTitle") : dlg.mode === "rename" ? text(lang, "renameTitle") : text(lang, "addDir");
    function submit() {
      if (!isDelete && !String(name).trim()) {
        setError(text(lang, "requiredName"));
        return;
      }
      setSaving(true);
      setError("");
      var p;
      if (isDelete) p = callApi(api, "siteNodes.delete", { id: dlg.id });
      else if (dlg.mode === "rename") p = callApi(api, "siteNodes.rename", { id: dlg.id, name: String(name).trim() });
      else p = callApi(api, "siteNodes.create", { parentId: dlg.parentId || "0", name: String(name).trim() });
      p.then(function() {
        setSaving(false);
        props.onDone();
      }).catch(function(e) {
        setSaving(false);
        setError(errText(e));
      });
    }
    return h2(
      Modal,
      { small: true, onClose: saving ? null : props.onClose },
      h2(
        "div",
        { className: "wbs-modal-title" },
        h2(Icon2, { name: isDelete ? "trash" : dlg.mode === "rename" ? "edit" : "folder-plus", size: 15 }),
        title,
        h2("button", { type: "button", className: "wbs-mini wbs-modal-x", title: text(lang, "cancel"), onClick: props.onClose }, h2(Icon2, { name: "x", size: 15 }))
      ),
      isDelete ? h2("div", { className: "wbs-modal-sub" }, text(lang, "removeDirText", { name: dlg.name || "" })) : h2(
        "div",
        null,
        h2("label", { className: "wbs-label" }, text(lang, "dirName")),
        h2("input", {
          className: "wbs-input",
          value: name,
          autoFocus: true,
          placeholder: "\u672A\u547D\u540D",
          onChange: function(e) {
            setName(e.target.value);
          },
          onKeyDown: function(e) {
            if (e.key === "Enter") submit();
          }
        })
      ),
      h2(
        "div",
        { className: "wbs-formfoot" },
        h2("div", { className: "wbs-formerr" }, error || ""),
        h2("button", { className: "wbs-btn", disabled: saving, onClick: props.onClose }, text(lang, "cancel")),
        h2(
          "button",
          { className: "wbs-btn primary" + (isDelete ? " danger" : ""), disabled: saving, onClick: submit },
          h2(Icon2, { name: isDelete ? "trash" : dlg.mode === "rename" ? "check" : "plus", size: 13 }),
          saving ? "\u2026" : isDelete ? text(lang, "confirm") : dlg.mode === "rename" ? text(lang, "save") : text(lang, "create")
        )
      )
    );
  }
  function DeleteSiteModal(props) {
    var api = props.api;
    var lang = props.lang || "zh";
    var site = props.site;
    var [saving, setSaving] = useState(false);
    var [error, setError] = useState("");
    function submit() {
      setSaving(true);
      setError("");
      callApi(api, "sites.delete", { id: site.id }).then(function() {
        setSaving(false);
        props.onDone();
      }).catch(function(e) {
        setSaving(false);
        setError(errText(e));
      });
    }
    return h2(
      Modal,
      { small: true, onClose: saving ? null : props.onClose },
      h2(
        "div",
        { className: "wbs-modal-title" },
        h2(Icon2, { name: "trash", size: 15 }),
        text(lang, "deleteTitle"),
        h2("button", { type: "button", className: "wbs-mini wbs-modal-x", title: text(lang, "cancel"), onClick: props.onClose }, h2(Icon2, { name: "x", size: 15 }))
      ),
      h2("div", { className: "wbs-modal-sub" }, text(lang, "deleteText", { name: site.siteName })),
      error ? h2("div", { className: "wbs-error" }, error) : null,
      h2(
        "div",
        { className: "wbs-formfoot" },
        h2("div", { className: "wbs-grow" }),
        h2("button", { className: "wbs-btn", disabled: saving, onClick: props.onClose }, text(lang, "cancel")),
        h2("button", { className: "wbs-btn danger", disabled: saving, onClick: submit }, h2(Icon2, { name: "trash", size: 13 }), saving ? "\u2026" : text(lang, "confirm"))
      )
    );
  }
  var CFG_FALLBACK = {
    "list.pageSize": 16,
    "list.sortColumn": "update_time",
    "list.sortOrder": "desc",
    "ui.confirmDelete": true,
    "ui.toastDuration": 2600,
    "stats.range": "30d",
    "stats.top": 10,
    "stats.showKpi": true,
    "stats.sections": ["links", "fresh", "nodes", "trend", "topTags", "stale", "dup", "orphan", "emptyNodes"]
  };
  function SitesView(props) {
    var lang = props.lang === "en" ? "en" : "zh";
    var cfg = configView.useConfig(props.api, CFG_FALLBACK);
    if (!cfg.ready) {
      return h2("div", { style: { padding: "48px", textAlign: "center", fontSize: "12.5px", opacity: 0.6 } }, lang === "en" ? "Loading\u2026" : "\u8F7D\u5165\u4E2D\u2026");
    }
    return h2(SitesViewBody, Object.assign({}, props, { cfg: cfg.values }));
  }
  function SitesViewBody(props) {
    var api = props.api;
    var lang = props.lang || "zh";
    var cfg = props.cfg || {};
    var cfgSize = Math.floor(Number(cfg["list.pageSize"]));
    if (!(cfgSize > 0)) cfgSize = 16;
    var cfgSortCol = ["update_time", "create_time", "site_name"].indexOf(cfg["list.sortColumn"]) >= 0 ? cfg["list.sortColumn"] : "update_time";
    var cfgSortOrder = cfg["list.sortOrder"] === "asc" ? "asc" : "desc";
    var cfgConfirm = cfg["ui.confirmDelete"] !== false;
    var cfgToast = Math.floor(Number(cfg["ui.toastDuration"]));
    if (!(cfgToast >= 800)) cfgToast = 2600;
    var [kids, setKids] = useState({});
    var kidsRef = useRef({});
    var [expanded, setExpanded] = useState({});
    var [current, setCurrent] = useState({ id: "0", path: [] });
    var [sites, setSites] = useState([]);
    var [total, setTotal] = useState(0);
    var [page, setPage] = useState(1);
    var [pageSize, setPageSize] = useState(cfgSize);
    var [textQuery, setTextQuery] = useState("");
    var [searchInput, setSearchInput] = useState("");
    var [tagFilter, setTagFilter] = useState([]);
    var [allTags, setAllTags] = useState([]);
    var [tagMenu, setTagMenu] = useState(false);
    var [tagOn, setTagOn] = useState(false);
    var tagOnRef = useRef(false);
    var [sortCol, setSortCol] = useState(cfgSortCol);
    var [sortOrder, setSortOrder] = useState(cfgSortOrder);
    var [loading, setLoading] = useState(false);
    var [error, setError] = useState("");
    var [tick, setTick] = useState(0);
    var [expandedRow, setExpandedRow] = useState(null);
    var [selected, setSelected] = useState({});
    var [editing, setEditing] = useState(null);
    var [dirDlg, setDirDlg] = useState(null);
    var [deleting, setDeleting] = useState(null);
    var [toast, setToast] = useState(null);
    var dragRef = useRef("");
    var tagKey = tagFilter.slice().sort().join(",");
    function showToast(msg, kind) {
      setToast({ msg, kind: kind || "" });
    }
    useEffect(function() {
      if (!toast) return;
      var timer = setTimeout(function() {
        setToast(null);
      }, cfgToast);
      return function() {
        clearTimeout(timer);
      };
    }, [toast, cfgToast]);
    function refreshTree() {
      return callApi(api, "siteNodes.children", { id: 0 }).then(function(root) {
        var map = { "0": root || [] };
        var ids = Object.keys(kidsRef.current).filter(function(id) {
          return id !== "0";
        });
        return Promise.all(ids.map(function(id) {
          return callApi(api, "siteNodes.children", { id }).then(function(rows) {
            map[id] = rows || [];
          }).catch(function() {
          });
        })).then(function() {
          kidsRef.current = map;
          setKids(map);
        });
      }).catch(function(e) {
        showToast(text(lang, "loadFail", { msg: errText(e) }), "err");
      });
    }
    function loadChildren(id) {
      return callApi(api, "siteNodes.children", { id }).then(function(rows) {
        var map = Object.assign({}, kidsRef.current);
        map[id] = rows || [];
        kidsRef.current = map;
        setKids(map);
      });
    }
    function loadAllTags() {
      if (!tagOnRef.current) return Promise.resolve([]);
      return callApi(api, "siteTags.search", { pageSize: 100 }).then(function(r) {
        setAllTags(r.records || []);
      }).catch(function() {
      });
    }
    useEffect(function() {
      refreshTree();
      callApi(api, "sites.capabilities").then(function(r) {
        var on = !!(r && r.tags) && hostHasAddon("wb-addon-tags");
        tagOnRef.current = on;
        setTagOn(on);
        if (!on) {
          setTagFilter([]);
          setTagMenu(false);
        } else {
          loadAllTags();
        }
      }).catch(function() {
        tagOnRef.current = false;
        setTagOn(false);
      });
    }, []);
    useEffect(function() {
      var off = api.subscribe(function(msg) {
        if (!msg) return;
        if (msg.event === "sites-changed") setTick(function(x) {
          return x + 1;
        });
        if (msg.event === "tags-changed") loadAllTags();
        if (msg.event === "site-nodes-changed") {
          setTick(function(x) {
            return x + 1;
          });
          refreshTree();
        }
      });
      return function() {
        if (typeof off === "function") off();
      };
    }, []);
    useEffect(function() {
      var alive = true;
      setLoading(true);
      setError("");
      callApi(api, "sites.list", {
        nodeId: current.id,
        text: textQuery,
        tagIds: tagFilter,
        pageNumber: page,
        pageSize,
        sortColumn: sortCol,
        sortOrder
      }).then(function(r) {
        if (!alive) return;
        setSites(r.records || []);
        setTotal(Number(r.total || 0));
      }).catch(function(e) {
        if (!alive) return;
        setSites([]);
        setTotal(0);
        setError(text(lang, "loadFail", { msg: errText(e) }));
      }).finally(function() {
        if (alive) setLoading(false);
      });
      return function() {
        alive = false;
      };
    }, [current.id, textQuery, tagKey, page, pageSize, sortCol, sortOrder, tick]);
    useEffect(function() {
      if (current.id === "0") return;
      var alive = true;
      callApi(api, "siteNodes.path", { id: current.id }).then(function(rows) {
        if (!alive) return;
        if (!rows || !rows.length) {
          setCurrent({ id: "0", path: [] });
          return;
        }
        setCurrent({ id: current.id, path: rows });
      }).catch(function() {
      });
      return function() {
        alive = false;
      };
    }, [current.id, tick]);
    useEffect(function() {
      if (!tagMenu) return void 0;
      function onDown(e) {
        var el = e.target;
        while (el && el !== document.body) {
          if (el.classList && el.classList.contains("wbs-tagfilter")) return;
          el = el.parentNode;
        }
        setTagMenu(false);
      }
      function onKey(e) {
        if (e.key === "Escape") setTagMenu(false);
      }
      document.addEventListener("mousedown", onDown, true);
      document.addEventListener("keydown", onKey, true);
      return function() {
        document.removeEventListener("mousedown", onDown, true);
        document.removeEventListener("keydown", onKey, true);
      };
    }, [tagMenu]);
    function selectDir(id) {
      if (id === "0") {
        setCurrent({ id: "0", path: [] });
        setPage(1);
        return;
      }
      callApi(api, "siteNodes.path", { id }).then(function(rows) {
        if (!rows || !rows.length) return;
        setCurrent({ id, path: rows });
        setPage(1);
      }).catch(function(e) {
        showToast(text(lang, "opFail", { msg: errText(e) }), "err");
      });
    }
    function toggleNode(node) {
      var open = !!expanded[node.id];
      if (!open && !Object.prototype.hasOwnProperty.call(kidsRef.current, node.id)) {
        loadChildren(node.id).catch(function(e) {
          showToast(errText(e), "err");
        });
      }
      setExpanded(function(prev) {
        var next = Object.assign({}, prev);
        if (open) delete next[node.id];
        else next[node.id] = true;
        return next;
      });
    }
    function onDropNode(e, target) {
      e.preventDefault();
      e.stopPropagation();
      var sourceId = dragRef.current;
      dragRef.current = "";
      if (!sourceId || sourceId === target.id) return;
      var moveType = expanded[target.id] ? 0 : 2;
      callApi(api, "siteNodes.move", { sourceId, targetId: target.id, moveType }).then(function() {
        showToast(text(lang, "moved"));
        refreshTree();
        setTick(function(x) {
          return x + 1;
        });
      }).catch(function(e2) {
        showToast(text(lang, "opFail", { msg: errText(e2) }), "err");
      });
    }
    function renderNode(node, depth) {
      var open = !!expanded[node.id];
      var list = kids[node.id] || [];
      return h2(
        "div",
        { key: node.id },
        h2(
          "div",
          {
            className: "wbs-node" + (current.id === String(node.id) ? " active" : ""),
            style: { paddingLeft: 4 + depth * 14 },
            draggable: true,
            onDragStart: function(e) {
              dragRef.current = String(node.id);
              e.dataTransfer.effectAllowed = "move";
            },
            onDragOver: function(e) {
              e.preventDefault();
            },
            onDrop: function(e) {
              onDropNode(e, node);
            }
          },
          h2("span", { className: "wbs-caret" + (open ? " open" : ""), onClick: function(e) {
            e.stopPropagation();
            toggleNode(node);
          } }, h2(Icon2, { name: "chevron-right", size: 13 })),
          h2("span", { className: "wbs-node-ico" }, h2(Icon2, { name: open ? "folder-open" : "folder", size: 13 })),
          h2("span", { className: "wbs-node-name", onClick: function() {
            selectDir(String(node.id));
          }, title: node.name }, node.name),
          h2(
            "span",
            { className: "wbs-node-actions" },
            h2("button", { className: "wbs-mini", title: text(lang, "addChild"), onClick: function(e) {
              e.stopPropagation();
              setDirDlg({ mode: "create", parentId: String(node.id), name: "" });
            } }, h2(Icon2, { name: "plus", size: 13 })),
            h2("button", { className: "wbs-mini", title: text(lang, "rename"), onClick: function(e) {
              e.stopPropagation();
              setDirDlg({ mode: "rename", id: String(node.id), name: node.name });
            } }, h2(Icon2, { name: "edit", size: 13 })),
            h2("button", { className: "wbs-mini", title: text(lang, "remove"), onClick: function(e) {
              e.stopPropagation();
              setDirDlg({ mode: "delete", id: String(node.id), name: node.name });
            } }, h2(Icon2, { name: "trash", size: 13 }))
          )
        ),
        open ? list.map(function(child) {
          return renderNode(child, depth + 1);
        }) : null
      );
    }
    function openCreate() {
      setEditing({ mode: "create", site: null });
    }
    function openEdit(site) {
      setEditing({ mode: "edit", site });
    }
    function onSaved() {
      setEditing(null);
      showToast(text(lang, "saved"));
      setTick(function(x) {
        return x + 1;
      });
    }
    function onDirDone() {
      var dlg = dirDlg;
      setDirDlg(null);
      setTick(function(x) {
        return x + 1;
      });
      refreshTree();
      if (dlg && dlg.mode === "create") {
        var parentId = String(dlg.parentId || "0");
        setExpanded(function(prev) {
          var next = Object.assign({}, prev);
          next[parentId] = true;
          return next;
        });
        loadChildren(parentId).catch(function() {
        });
      }
      if (dlg && dlg.mode === "delete" && current.path.some(function(p) {
        return String(p.id) === String(dlg.id);
      })) {
        setCurrent({ id: "0", path: [] });
      }
    }
    function onSiteDeleted() {
      setDeleting(null);
      showToast(text(lang, "deleted"));
      setTick(function(x) {
        return x + 1;
      });
      refreshTree();
    }
    function toggleSelected(id) {
      setSelected(function(prev) {
        var next = Object.assign({}, prev);
        if (next[id]) delete next[id];
        else next[id] = true;
        return next;
      });
    }
    var selectedIds = Object.keys(selected).filter(function(id) {
      return selected[id];
    });
    var allSelected = sites.length > 0 && sites.every(function(s) {
      return selected[s.id];
    });
    function toggleAll() {
      if (allSelected) {
        setSelected(function(prev) {
          var next = Object.assign({}, prev);
          sites.forEach(function(s) {
            delete next[s.id];
          });
          return next;
        });
        return;
      }
      setSelected(function(prev) {
        var next = Object.assign({}, prev);
        sites.forEach(function(s) {
          next[s.id] = true;
        });
        return next;
      });
    }
    function removeSite(site) {
      callApi(api, "sites.delete", { id: site.id }).then(function() {
        onSiteDeleted();
      }).catch(function(e) {
        showToast(text(lang, "opFail", { msg: errText(e) }), "err");
      });
    }
    function deleteSelected() {
      if (!selectedIds.length) return;
      if (cfgConfirm && !window.confirm(text(lang, "bulkConfirm", { n: selectedIds.length }))) return;
      var chain = Promise.resolve();
      selectedIds.forEach(function(id) {
        chain = chain.then(function() {
          return callApi(api, "sites.delete", { id });
        });
      });
      chain.then(function() {
        setSelected({});
        setTick(function(x) {
          return x + 1;
        });
        refreshTree();
        showToast(text(lang, "deleted"));
      }).catch(function(e) {
        showToast(text(lang, "opFail", { msg: errText(e) }), "err");
      });
    }
    function sortBy(col) {
      if (sortCol === col) setSortOrder(function(o) {
        return o === "asc" ? "desc" : "asc";
      });
      else {
        setSortCol(col);
        setSortOrder("desc");
      }
      setPage(1);
    }
    function sortIcon(col) {
      var on = sortCol === col;
      var name = !on ? "arrow-up-down" : sortOrder === "asc" ? "arrow-up" : "arrow-down";
      return h2(Icon2, { name, size: 12, className: "wbs-sort-ico" });
    }
    var pages = Math.max(1, Math.ceil(total / pageSize));
    var tagsVisible = tagOn && hostHasAddon("wb-addon-tags");
    var colCount = tagsVisible ? 6 : 5;
    return h2(
      "div",
      { className: "wbs-root" },
      h2(
        "div",
        { className: "wbs-head" },
        h2("span", { className: "wbs-badge" }, h2(Icon2, { name: "folder-tree", size: 15 })),
        h2("h2", null, text(lang, "title")),
        h2("span", { className: "wbs-count" }, text(lang, "total", { n: total })),
        h2("div", { className: "wbs-grow" }),
        h2("button", { className: "wbs-btn primary", onClick: openCreate }, h2(Icon2, { name: "plus", size: 14 }), text(lang, "newSite"))
      ),
      h2(
        "div",
        { className: "wbs-body" },
        h2(
          "aside",
          { className: "wbs-tree" },
          h2(
            "div",
            { className: "wbs-tree-top" },
            h2("span", { className: "wbs-tree-title" }, h2(Icon2, { name: "folder-tree", size: 13 }), text(lang, "directory")),
            h2("button", { className: "wbs-mini", title: text(lang, "addDir"), onClick: function() {
              setDirDlg({ mode: "create", parentId: "0", name: "" });
            } }, h2(Icon2, { name: "folder-plus", size: 13 })),
            h2("button", { className: "wbs-mini", title: text(lang, "refresh"), onClick: refreshTree }, h2(Icon2, { name: "refresh", size: 13 }))
          ),
          h2(
            "div",
            {
              className: "wbs-node" + (current.id === "0" ? " active" : ""),
              style: { paddingLeft: 4 }
            },
            h2("span", { className: "wbs-caret plain" }, h2(Icon2, { name: "house", size: 13 })),
            h2("span", { className: "wbs-node-name", onClick: function() {
              selectDir("0");
            } }, text(lang, "all")),
            h2(
              "span",
              { className: "wbs-node-actions" },
              h2("button", { className: "wbs-mini", title: text(lang, "addDir"), onClick: function(e) {
                e.stopPropagation();
                setDirDlg({ mode: "create", parentId: "0", name: "" });
              } }, h2(Icon2, { name: "folder-plus", size: 13 }))
            )
          ),
          (kids["0"] || []).map(function(node) {
            return renderNode(node, 1);
          })
        ),
        h2(
          "section",
          { className: "wbs-main" },
          h2(
            "div",
            { className: "wbs-crumbs" },
            h2("button", { className: "wbs-crumb" + (current.id === "0" ? " cur" : ""), onClick: function() {
              selectDir("0");
            } }, text(lang, "all")),
            (current.path || []).map(function(p, i) {
              return h2(
                React2.Fragment,
                { key: String(p.id) },
                h2("span", { className: "wbs-sep" }, h2(Icon2, { name: "chevron-right", size: 12 })),
                h2("button", {
                  className: "wbs-crumb" + (i === current.path.length - 1 ? " cur" : ""),
                  onClick: function() {
                    setCurrent({ id: String(p.id), path: current.path.slice(0, i + 1) });
                    setPage(1);
                  }
                }, p.name)
              );
            })
          ),
          h2(
            "div",
            { className: "wbs-toolbar" },
            h2(
              "div",
              { className: "wbs-search" },
              h2("input", {
                value: searchInput,
                placeholder: text(lang, "search"),
                onChange: function(e) {
                  setSearchInput(e.target.value);
                },
                onKeyDown: function(e) {
                  if (e.key === "Enter") {
                    setTextQuery(searchInput.trim());
                    setPage(1);
                  }
                }
              }),
              h2("button", { title: "\u641C\u7D22", onClick: function() {
                setTextQuery(searchInput.trim());
                setPage(1);
              } }, h2(Icon2, { name: "search", size: 14 })),
              searchInput ? h2("button", { title: "\u6E05\u7A7A", onClick: function() {
                setSearchInput("");
                setTextQuery("");
                setPage(1);
              } }, h2(Icon2, { name: "x", size: 14 })) : null
            ),
            tagsVisible ? h2(
              "div",
              { className: "wbs-tagfilter" },
              h2("button", {
                className: "wbs-btn" + (tagFilter.length ? " on" : ""),
                onClick: function() {
                  setTagMenu(!tagMenu);
                }
              }, h2(Icon2, { name: "tag", size: 13 }), text(lang, "tagFilter") + (tagFilter.length ? " \xB7 " + tagFilter.length : ""), h2(Icon2, { name: "chevron-down", size: 12 })),
              tagMenu ? h2(
                "div",
                { className: "wbs-tagmenu" },
                h2(
                  "div",
                  { className: "wbs-tagmenu-head" },
                  h2("span", null, text(lang, "allTags")),
                  h2("span", { className: "wbs-grow" }),
                  h2("button", { className: "wbs-mini", title: text(lang, "clear"), onClick: function() {
                    setTagFilter([]);
                    setPage(1);
                  } }, h2(Icon2, { name: "x", size: 12 }), text(lang, "clear"))
                ),
                allTags.length ? allTags.map(function(t) {
                  var on = tagFilter.indexOf(t.id) >= 0;
                  return h2(
                    "label",
                    { key: t.id, className: "wbs-tagopt" },
                    h2("input", {
                      type: "checkbox",
                      checked: on,
                      onChange: function() {
                        setTagFilter(function(prev) {
                          return on ? prev.filter(function(x) {
                            return x !== t.id;
                          }) : prev.concat([t.id]);
                        });
                        setPage(1);
                      }
                    }),
                    h2("span", null, t.name)
                  );
                }) : h2("div", { className: "wbs-note", style: { padding: 6 } }, "\u6682\u65E0\u6807\u7B7E")
              ) : null
            ) : null,
            h2("div", { className: "wbs-grow" }),
            selectedIds.length ? h2("button", { className: "wbs-btn danger", onClick: deleteSelected }, h2(Icon2, { name: "trash", size: 13 }), text(lang, "deleteSelected") + " (" + selectedIds.length + ")") : null
          ),
          error ? h2("div", { className: "wbs-error" }, error) : null,
          h2(
            "div",
            { className: "wbs-tablewrap" },
            h2(
              "table",
              { className: "wbs-table" },
              h2(
                "colgroup",
                null,
                h2("col", { style: { width: 34 } }),
                h2("col", null),
                tagsVisible ? h2("col", { style: { width: 150 } }) : null,
                h2("col", { style: { width: 112 } }),
                h2("col", { style: { width: 112 } }),
                h2("col", { style: { width: 214 } })
              ),
              h2(
                "thead",
                null,
                h2(
                  "tr",
                  null,
                  h2("th", null, h2("input", { type: "checkbox", checked: allSelected, onChange: toggleAll, "aria-label": "\u5168\u9009" })),
                  h2("th", null, text(lang, "siteCol")),
                  tagsVisible ? h2("th", null, text(lang, "tagCol")) : null,
                  h2("th", { className: "wbs-th-sort" + (sortCol === "create_time" ? " on" : ""), onClick: function() {
                    sortBy("create_time");
                  } }, h2("span", { className: "wbs-th-label" }, text(lang, "createTime"), sortIcon("create_time"))),
                  h2("th", { className: "wbs-th-sort" + (sortCol === "update_time" ? " on" : ""), onClick: function() {
                    sortBy("update_time");
                  } }, h2("span", { className: "wbs-th-label" }, text(lang, "updateTime"), sortIcon("update_time"))),
                  h2("th", null, text(lang, "actions"))
                )
              ),
              h2(
                "tbody",
                null,
                loading ? h2("tr", null, h2("td", { colSpan: colCount }, h2("div", { className: "wbs-loading" }, text(lang, "loading")))) : null,
                !loading && !sites.length ? h2("tr", null, h2(
                  "td",
                  { colSpan: colCount },
                  h2(
                    "div",
                    { className: "wbs-empty" },
                    h2("span", { className: "wbs-empty-ico" }, h2(Icon2, { name: "folder-open", size: 24 })),
                    h2("b", null, text(lang, "empty")),
                    h2("span", null, text(lang, "emptyHint"))
                  )
                )) : null,
                !loading ? sites.map(function(s) {
                  var row = h2(
                    "tr",
                    { key: s.id },
                    h2("td", null, h2("input", { type: "checkbox", checked: !!selected[s.id], onChange: function() {
                      toggleSelected(s.id);
                    }, "aria-label": "\u9009\u62E9" })),
                    h2(
                      "td",
                      null,
                      h2("div", { className: "wbs-site-name" }, s.siteName),
                      s.description ? h2("div", { className: "wbs-site-desc" }, s.description) : h2("div", { className: "wbs-site-desc wbs-muted" }, text(lang, "noDesc")),
                      s.defaultLink ? h2("a", { className: "wbs-site-link", href: s.defaultLink, target: "_blank", rel: "noreferrer noopener", title: s.defaultLink }, h2(Icon2, { name: "link", size: 11 }), h2("span", null, s.defaultLink)) : h2("div", { className: "wbs-site-desc wbs-muted" }, text(lang, "noLink"))
                    ),
                    tagsVisible ? h2("td", null, s.tags && s.tags.length ? s.tags.map(function(t) {
                      return h2("span", { className: "wbs-chip", key: t.id }, t.name);
                    }) : h2("span", { className: "wbs-muted" }, "\u2014")) : null,
                    h2("td", { className: "wbs-muted" }, s.createTime || "\u2014"),
                    h2("td", { className: "wbs-muted" }, s.updateTime || "\u2014"),
                    h2(
                      "td",
                      null,
                      h2(
                        "div",
                        { className: "wbs-actions" },
                        h2("button", { className: "wbs-btn sm", title: text(lang, "links"), onClick: function() {
                          setExpandedRow(expandedRow && expandedRow.id === s.id && expandedRow.type === "links" ? null : { id: s.id, type: "links" });
                        } }, h2(Icon2, { name: "link", size: 12 }), text(lang, "links") + " " + (s.siteLinks ? s.siteLinks.length : 0)),
                        h2("button", { className: "wbs-btn sm", title: text(lang, "dirs"), onClick: function() {
                          setExpandedRow(expandedRow && expandedRow.id === s.id && expandedRow.type === "dirs" ? null : { id: s.id, type: "dirs" });
                        } }, h2(Icon2, { name: "folder", size: 12 }), text(lang, "dirs") + " " + (s.dirs ? s.dirs.length : 0)),
                        h2("button", { className: "wbs-btn sm icononly", title: text(lang, "edit"), onClick: function() {
                          openEdit(s);
                        } }, h2(Icon2, { name: "edit", size: 13 })),
                        h2("button", { className: "wbs-btn sm danger icononly", title: text(lang, "del"), onClick: function() {
                          if (cfgConfirm) setDeleting(s);
                          else removeSite(s);
                        } }, h2(Icon2, { name: "trash", size: 13 }))
                      )
                    )
                  );
                  if (!expandedRow || expandedRow.id !== s.id) return row;
                  var detail = expandedRow.type === "links" ? s.siteLinks && s.siteLinks.length ? h2(
                    "table",
                    { className: "wbs-subtable" },
                    h2("thead", null, h2("tr", null, h2("th", null, "\u63CF\u8FF0"), h2("th", null, "\u7F51\u5740"))),
                    h2("tbody", null, s.siteLinks.map(function(l, i) {
                      return h2(
                        "tr",
                        { key: i },
                        h2("td", null, l.isDefault ? h2("span", { className: "wbs-def", title: text(lang, "default") }, h2(Icon2, { name: "star", size: 11 })) : null, l.description || "\u2014"),
                        h2("td", null, l.link ? h2("a", { href: l.link, target: "_blank", rel: "noreferrer noopener" }, l.link) : "\u2014")
                      );
                    }))
                  ) : h2("div", { className: "wbs-muted" }, text(lang, "noLink")) : s.dirs && s.dirs.length ? h2("div", { className: "wbs-dirpath" }, s.dirs.map(function(d) {
                    return h2("div", { key: d.id }, h2(Icon2, { name: "folder", size: 12 }), (d.path || []).map(function(p) {
                      return p.name;
                    }).join(" / "));
                  })) : h2("div", { className: "wbs-muted" }, "\u672A\u5173\u8054\u76EE\u5F55");
                  return h2(
                    React2.Fragment,
                    { key: s.id + ":detail" },
                    row,
                    h2("tr", { className: "wbs-expand" }, h2("td", { colSpan: colCount }, detail))
                  );
                }) : null
              )
            )
          ),
          h2(
            "div",
            { className: "wbs-pager" },
            h2("span", null, "\u5171 " + total + " \u6761"),
            h2("button", { className: "wbs-btn sm icononly", title: text(lang, "prev"), "aria-label": text(lang, "prev"), disabled: page <= 1, onClick: function() {
              setPage(Math.max(1, page - 1));
            } }, h2(Icon2, { name: "chevron-left", size: 14 })),
            h2("span", { className: "wbs-pager-pos" }, page + " / " + pages),
            h2("button", { className: "wbs-btn sm icononly", title: text(lang, "next"), "aria-label": text(lang, "next"), disabled: page >= pages, onClick: function() {
              setPage(Math.min(pages, page + 1));
            } }, h2(Icon2, { name: "chevron-right", size: 14 })),
            h2("select", {
              value: pageSize,
              onChange: function(e) {
                setPageSize(Number(e.target.value));
                setPage(1);
              }
            }, [16, 30, 50].map(function(n) {
              return h2("option", { key: n, value: n }, n + " / \u9875");
            }))
          )
        )
      ),
      editing ? h2(SiteFormModal, {
        api,
        lang,
        mode: editing.mode,
        site: editing.site,
        current,
        tagOn: tagsVisible,
        onClose: function() {
          setEditing(null);
        },
        onSaved
      }) : null,
      dirDlg ? h2(DirModal, {
        api,
        lang,
        dlg: dirDlg,
        onClose: function() {
          setDirDlg(null);
        },
        onDone: onDirDone
      }) : null,
      deleting ? h2(DeleteSiteModal, {
        api,
        lang,
        site: deleting,
        onClose: function() {
          setDeleting(null);
        },
        onDone: onSiteDeleted
      }) : null,
      toast ? h2("div", { className: "wbs-toast" + (toast.kind === "err" ? " err" : "") }, toast.msg) : null
    );
  }
  injectCss();
  host.registerAddon({
    id: "wb-addon-sites",
    version: "1.6.0",
    views: [
      { id: "stats", title: { zh: "\u7EDF\u8BA1", en: "Stats" }, component: statsView.SitesStatsView },
      { id: "sites", title: { zh: "\u8BB0\u5F55", en: "Records" }, component: SitesView },
      { id: "config", title: { zh: "\u914D\u7F6E", en: "Config" }, component: configView.ConfigView }
    ]
  });
  module.exports = { name: "dsh-workbench-sites", inject: [], apply: function() {
  } };
})();
    return module.exports;
  },
});
