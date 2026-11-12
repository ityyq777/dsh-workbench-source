// 由 scripts/build-addon-clients.mjs 生成；请修改对应 client/client.src.cjs 后重新构建。
window.__ModuleLoader__ = window.__ModuleLoader__ || { modules: {}, load: function (m) { this.modules[m.id] = m.factory; } };
window.__ModuleLoader__.load({
  id: "dsh-workbench-connector",
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

// packages/addons/connector/client/ui/styles.cjs
var require_styles = __commonJS({
  "packages/addons/connector/client/ui/styles.cjs"(exports2, module2) {
    "use strict";
    module2.exports = [
      ".wbc-wrap{display:flex;flex-direction:column;gap:12px;padding:16px;overflow:auto;height:100%;box-sizing:border-box}",
      ".wbc-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}",
      ".wbc-title{font-size:16px;font-weight:650;margin:0}",
      ".wbc-sub{font-size:12px;color:var(--wb-muted,#6b7280);margin:2px 0 0}",
      ".wbc-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}",
      ".wbc-card{border:1px solid var(--wb-border,#e5e7eb);border-radius:10px;background:var(--wb-surface,#fff);padding:12px}",
      ".wbc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}",
      ".wbc-kpi{font-size:22px;font-weight:700;line-height:1.2}.wbc-kpi-label{font-size:12px;color:var(--wb-muted,#6b7280)}",
      ".wbc-table{width:100%;border-collapse:collapse;font-size:12px}.wbc-table th,.wbc-table td{padding:7px 8px;border-bottom:1px solid var(--wb-border,#eef0f3);text-align:left;vertical-align:top}",
      ".wbc-table th{font-weight:600;color:var(--wb-muted,#6b7280);white-space:nowrap}",
      ".wbc-btn{border:1px solid var(--wb-border,#d1d5db);background:var(--wb-surface,#fff);color:inherit;border-radius:7px;padding:5px 10px;font-size:12px;cursor:pointer}",
      ".wbc-btn:hover:not(:disabled){border-color:var(--wb-accent,#2563eb)}.wbc-btn:disabled{opacity:.5;cursor:default}",
      ".wbc-btn.primary{background:var(--wb-accent,#2563eb);border-color:var(--wb-accent,#2563eb);color:#fff}",
      ".wbc-btn.danger{color:#b91c1c;border-color:#fecaca}",
      ".wbc-field{display:flex;flex-direction:column;gap:4px;font-size:12px}.wbc-label{font-weight:600}",
      ".wbc-field input,.wbc-field select,.wbc-field textarea{border:1px solid var(--wb-border,#d1d5db);border-radius:7px;padding:6px 8px;font:inherit;background:var(--wb-surface,#fff);color:inherit;min-width:0}",
      ".wbc-hint{color:var(--wb-muted,#6b7280);font-size:11px}.wbc-notice{padding:8px 10px;border-radius:8px;font-size:12px;background:#eff6ff;color:#1e40af}",
      ".wbc-notice.error{background:#fef2f2;color:#b91c1c}.wbc-notice.ok{background:#ecfdf5;color:#047857}",
      ".wbc-empty{padding:18px;text-align:center;color:var(--wb-muted,#6b7280);font-size:12px;border:1px dashed var(--wb-border,#e5e7eb);border-radius:8px}",
      ".wbc-pill{display:inline-block;padding:1px 7px;border-radius:999px;font-size:11px;background:#f3f4f6;color:#374151}",
      ".wbc-pill.ok{background:#ecfdf5;color:#047857}.wbc-pill.error{background:#fef2f2;color:#b91c1c}.wbc-pill.warn{background:#fffbeb;color:#b45309}",
      ".wbc-json{margin:0;padding:8px;background:#f8fafc;border-radius:8px;font-size:11px;max-height:240px;overflow:auto}",
      ".wbc-muted{color:var(--wb-muted,#6b7280)}.wbc-link{color:var(--wb-accent,#2563eb);cursor:pointer;text-decoration:none}",
      ".wbc-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}"
    ].join("\n");
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

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/activity.mjs
var activity_exports = {};
__export(activity_exports, {
  __iconData: () => __iconData,
  default: () => Activity
});
var __iconData, Activity;
var init_activity = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/activity.mjs"() {
    init_createLucideIcon();
    __iconData = {
      name: "activity",
      size: 24,
      node: [
        [
          "path",
          {
            d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
            key: "169zse"
          }
        ]
      ]
    };
    __iconData.node;
    Activity = createLucideIcon(__iconData);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/rss.mjs
var rss_exports = {};
__export(rss_exports, {
  __iconData: () => __iconData2,
  default: () => Rss
});
var __iconData2, Rss;
var init_rss = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/rss.mjs"() {
    init_createLucideIcon();
    __iconData2 = {
      name: "rss",
      size: 24,
      node: [
        ["path", { d: "M4 11a9 9 0 0 1 9 9", key: "pv89mb" }],
        ["path", { d: "M4 4a16 16 0 0 1 16 16", key: "k0647b" }],
        ["circle", { cx: "5", cy: "19", r: "1", key: "bfqh0e" }]
      ]
    };
    __iconData2.node;
    Rss = createLucideIcon(__iconData2);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/inbox.mjs
var inbox_exports = {};
__export(inbox_exports, {
  __iconData: () => __iconData3,
  default: () => Inbox
});
var __iconData3, Inbox;
var init_inbox = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/inbox.mjs"() {
    init_createLucideIcon();
    __iconData3 = {
      name: "inbox",
      size: 24,
      node: [
        ["polyline", { points: "22 12 16 12 14 15 10 15 8 12 2 12", key: "o97t9d" }],
        [
          "path",
          {
            d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
            key: "oot6mr"
          }
        ]
      ]
    };
    __iconData3.node;
    Inbox = createLucideIcon(__iconData3);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/rotate-ccw-clock.mjs
var __iconData4, RotateCcwClock;
var init_rotate_ccw_clock = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/rotate-ccw-clock.mjs"() {
    init_createLucideIcon();
    __iconData4 = {
      name: "rotate-ccw-clock",
      size: 24,
      node: [
        ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
        ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
        ["path", { d: "M12 7v5l4 2", key: "1fdv2h" }]
      ],
      aliases: ["history"]
    };
    __iconData4.node;
    RotateCcwClock = createLucideIcon(__iconData4);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/history.mjs
var history_exports = {};
__export(history_exports, {
  default: () => RotateCcwClock
});
var init_history = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/history.mjs"() {
    init_rotate_ccw_clock();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/sliders-horizontal.mjs
var sliders_horizontal_exports = {};
__export(sliders_horizontal_exports, {
  __iconData: () => __iconData5,
  default: () => SlidersHorizontal
});
var __iconData5, SlidersHorizontal;
var init_sliders_horizontal = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/sliders-horizontal.mjs"() {
    init_createLucideIcon();
    __iconData5 = {
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
    __iconData5.node;
    SlidersHorizontal = createLucideIcon(__iconData5);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/database.mjs
var database_exports = {};
__export(database_exports, {
  __iconData: () => __iconData6,
  default: () => Database
});
var __iconData6, Database;
var init_database = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/database.mjs"() {
    init_createLucideIcon();
    __iconData6 = {
      name: "database",
      size: 24,
      node: [
        ["ellipse", { cx: "12", cy: "5", rx: "9", ry: "3", key: "msslwz" }],
        ["path", { d: "M3 5V19A9 3 0 0 0 21 19V5", key: "1wlel7" }],
        ["path", { d: "M3 12A9 3 0 0 0 21 12", key: "mv7ke4" }]
      ]
    };
    __iconData6.node;
    Database = createLucideIcon(__iconData6);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/list.mjs
var list_exports = {};
__export(list_exports, {
  __iconData: () => __iconData7,
  default: () => List
});
var __iconData7, List;
var init_list = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/list.mjs"() {
    init_createLucideIcon();
    __iconData7 = {
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
    __iconData7.node;
    List = createLucideIcon(__iconData7);
  }
});

// packages/addons/connector/client/ui/common.cjs
var require_common = __commonJS({
  "packages/addons/connector/client/ui/common.cjs"(exports2, module2) {
    "use strict";
    function unwrap(r) {
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
      return h(
        "button",
        { type: props.type || "button", className: "wbc-btn" + (props.kind ? " " + props.kind : ""), disabled: props.disabled, onClick: props.onClick, title: props.title },
        props.children
      );
    }
    function Field(props) {
      var h = props.h;
      return h("label", { className: "wbc-field" }, h("span", { className: "wbc-label" }, props.label), props.children, props.hint ? h("span", { className: "wbc-hint" }, props.hint) : null);
    }
    function Notice(props) {
      var h = props.h;
      if (!props.text) return null;
      return h("div", { className: "wbc-notice " + (props.kind || "info") }, props.text);
    }
    function Empty(props) {
      var h = props.h;
      return h("div", { className: "wbc-empty" }, props.text || "\u6682\u65E0\u6570\u636E");
    }
    function Pill(props) {
      var h = props.h;
      return h("span", { className: "wbc-pill " + (props.kind || "") }, props.children);
    }
    function Json(props) {
      var h = props.h;
      var text;
      try {
        text = JSON.stringify(props.value, null, 2);
      } catch (e) {
        text = String(props.value);
      }
      return h("pre", { className: "wbc-json" }, text);
    }
    function useLoad(React, api, action, args, deps) {
      var s = React.useState({ loading: true, data: null, error: "" });
      var tick = React.useState(0);
      var refresh = function() {
        tick[1](tick[0] + 1);
      };
      React.useEffect(function() {
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
      }, (deps || []).concat([tick[0]]));
      return { loading: s[0].loading, data: s[0].data, error: s[0].error, refresh };
    }
    module2.exports = { unwrap, call, errText, fmtTime, Btn, Field, Notice, Empty, Pill, Json, useLoad };
  }
});

// packages/addons/connector/client/views/stats.cjs
var require_stats = __commonJS({
  "packages/addons/connector/client/views/stats.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    module2.exports = function StatsView(props) {
      var h = props.h, api = props.api, React = props.React, lang = props.lang || "zh";
      var s = C.useLoad(React, api, "connector.stats", {}, []);
      var d = s.data || {};
      return h(
        "div",
        { className: "wbc-wrap" },
        h("div", { className: "wbc-head" }, h("div", null, h("h2", { className: "wbc-title" }, "\u8FDE\u63A5\u5668\u6982\u89C8"), h("p", { className: "wbc-sub" }, "RSS \u4E0E Webhook \u5185\u5BB9\u63A5\u5165\uFF1B\u6765\u6E90\u5B9A\u4E49\u53EF\u540C\u6B65\uFF0C\u51ED\u636E\u548C\u672C\u673A\u72B6\u6001\u4E0D\u51FA\u673A\u5668\u3002")), h(C.Btn, { h, onClick: s.refresh }, "\u5237\u65B0")),
        s.error ? h(C.Notice, { h, kind: "error", text: s.error }) : null,
        h(
          "div",
          { className: "wbc-grid" },
          h("div", { className: "wbc-card" }, h("div", { className: "wbc-kpi" }, d.sources || 0), h("div", { className: "wbc-kpi-label" }, "\u6765\u6E90")),
          h("div", { className: "wbc-card" }, h("div", { className: "wbc-kpi" }, d.enabled || 0), h("div", { className: "wbc-kpi-label" }, "\u542F\u7528\u4E2D")),
          h("div", { className: "wbc-card" }, h("div", { className: "wbc-kpi" }, d.items || 0), h("div", { className: "wbc-kpi-label" }, "\u5DF2\u6293\u53D6\u5185\u5BB9")),
          h("div", { className: "wbc-card" }, h("div", { className: "wbc-kpi" }, d.errorSources || 0), h("div", { className: "wbc-kpi-label" }, "\u9519\u8BEF\u6765\u6E90"))
        ),
        h(
          "div",
          { className: "wbc-card" },
          h("div", { className: "wbc-row" }, h("strong", null, "\u6700\u8FD1\u4E00\u6B21\u8FD0\u884C"), d.lastRun ? h(C.Pill, { h, kind: d.lastRun.status === "ok" ? "ok" : "error" }, d.lastRun.status) : h("span", { className: "wbc-muted" }, "\u8FD8\u6CA1\u6709\u8FD0\u884C\u8BB0\u5F55")),
          d.lastRun ? h("p", { className: "wbc-sub" }, C.fmtTime(d.lastRun.startedAt, lang)) : null
        ),
        h("div", { className: "wbc-card" }, h("strong", null, "\u5F00\u59CB\u4F7F\u7528"), h("ol", { className: "wbc-sub" }, h("li", null, "\u5148\u5230\u300C\u51ED\u636E\u300D\u5EFA\u7ACB\u5E76\u89E3\u9501\u4FDD\u9669\u7BB1\uFF08Webhook token \u9700\u8981\uFF09\u3002"), h("li", null, "\u5728\u300C\u6765\u6E90\u300D\u65B0\u5EFA RSS \u6216 Webhook \u6765\u6E90\u3002"), h("li", null, "\u6309\u9700\u5F00\u542F\u6295\u9012\uFF0C\u65B0\u5185\u5BB9\u4F1A\u8FDB\u5165\u6D88\u606F\u57DF\u3002")))
      );
    };
  }
});

// packages/addons/connector/client/views/sources.cjs
var require_sources = __commonJS({
  "packages/addons/connector/client/views/sources.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    function defaults(driver) {
      var out = {};
      var fields = driver && driver.configFields || [];
      fields.forEach(function(f) {
        if (f.default !== void 0) out[f.name] = f.default;
        else if (f.type === "boolean") out[f.name] = false;
        else out[f.name] = "";
      });
      return out;
    }
    module2.exports = function SourcesView(props) {
      var h = props.h, api = props.api, React = props.React, lang = props.lang || "zh";
      var s = C.useLoad(React, api, "connector.sourceList", {}, []);
      var drvS = React.useState([]), secS = React.useState([]);
      var rows = s.data && s.data.sources || [];
      var formS = React.useState(null), busyS = React.useState(false), msgS = React.useState(""), bindS = React.useState({});
      React.useEffect(function() {
        C.call(api, "connector.driverList").then(function(r) {
          drvS[1](r && r.drivers || []);
        }).catch(function() {
        });
        C.call(api, "vault.secretList").then(function(r) {
          secS[1](r && r.items || []);
        }).catch(function() {
          secS[1]([]);
        });
      }, []);
      var drivers = drvS[0], secrets = secS[0];
      function driver(id) {
        return drivers.filter(function(d2) {
          return d2.id === id;
        })[0] || null;
      }
      function startCreate() {
        var d2 = drivers[0];
        formS[1]({ id: "", name: "", driver: d2 ? d2.id : "rss", config: defaults(d2), scheduleSec: 900, sink: "message", enabled: true, secretId: "" });
        msgS[1]("");
      }
      function startEdit(src) {
        formS[1]({ id: src.id, name: src.name, driver: src.driver, config: Object.assign({}, src.config), scheduleSec: src.scheduleSec, sink: src.sink, enabled: src.enabled, secretId: src.state && src.state.secretId || "" });
        msgS[1]("");
      }
      function setField(k, v) {
        formS[1](function(f2) {
          var n = Object.assign({}, f2);
          n[k] = v;
          return n;
        });
      }
      function setConfig(k, v, type) {
        var val = v;
        if (type === "number") val = v === "" ? "" : Number(v);
        if (type === "boolean") val = Boolean(v);
        formS[1](function(f2) {
          var n = Object.assign({}, f2);
          n.config = Object.assign({}, f2.config);
          n.config[k] = val;
          return n;
        });
      }
      function save() {
        var f2 = formS[0];
        if (!f2) return;
        busyS[1](true);
        msgS[1]("");
        var payload = { name: f2.name.trim(), driver: f2.driver, config: f2.config, scheduleSec: Number(f2.scheduleSec) || 0, sink: f2.sink, enabled: f2.enabled, secretId: f2.secretId };
        var p = f2.id ? C.call(api, "connector.sourceUpdate", Object.assign({ id: f2.id }, payload)) : C.call(api, "connector.sourceCreate", payload);
        p.then(function() {
          busyS[1](false);
          formS[1](null);
          s.refresh();
        }).catch(function(e) {
          busyS[1](false);
          msgS[1](C.errText(e));
        });
      }
      function run(src) {
        busyS[1](true);
        msgS[1]("");
        C.call(api, "connector.sourceRun", { id: src.id }).then(function(r) {
          busyS[1](false);
          msgS[1]("\u8FD0\u884C\u5B8C\u6210\uFF1A" + JSON.stringify(r));
          s.refresh();
        }).catch(function(e) {
          busyS[1](false);
          msgS[1](C.errText(e));
        });
      }
      function bind(src) {
        var secretId = bindS[0][src.id] !== void 0 ? bindS[0][src.id] : src.state && src.state.secretId || "";
        busyS[1](true);
        msgS[1]("");
        C.call(api, "connector.sourceBind", { id: src.id, secretId }).then(function() {
          busyS[1](false);
          s.refresh();
        }).catch(function(e) {
          busyS[1](false);
          msgS[1](C.errText(e));
        });
      }
      function toggle(src) {
        busyS[1](true);
        C.call(api, "connector.sourceDelivery", { id: src.id, enabled: !(src.state && src.state.deliveryEnabled) }).then(function() {
          busyS[1](false);
          s.refresh();
        }).catch(function(e) {
          busyS[1](false);
          msgS[1](C.errText(e));
        });
      }
      function del(src) {
        if (!window.confirm("\u5220\u9664\u6765\u6E90\u300C" + src.name + "\u300D\uFF1F\u672C\u673A\u6761\u76EE\u4F1A\u4FDD\u7559\u3002")) return;
        busyS[1](true);
        C.call(api, "connector.sourceDelete", { id: src.id }).then(function() {
          busyS[1](false);
          s.refresh();
        }).catch(function(e) {
          busyS[1](false);
          msgS[1](C.errText(e));
        });
      }
      var f = formS[0], d = f ? driver(f.driver) : null;
      return h(
        "div",
        { className: "wbc-wrap" },
        h("div", { className: "wbc-head" }, h("div", null, h("h2", { className: "wbc-title" }, "\u6765\u6E90"), h("p", { className: "wbc-sub" }, "\u4E00\u4E2A\u6765\u6E90\u4E00\u6761\u5B9A\u4E49\uFF1BRSS \u5B9A\u65F6\u6293\u53D6\uFF0CWebhook \u7B49\u5F85\u5916\u90E8\u63A8\u9001\u3002")), h("div", { className: "wbc-row" }, h(C.Btn, { h, onClick: s.refresh }, "\u5237\u65B0"), h(C.Btn, { h, kind: "primary", onClick: startCreate, disabled: drivers.length === 0 }, "\u65B0\u5EFA\u6765\u6E90"))),
        msgS[0] ? h(C.Notice, { h, kind: msgS[0].indexOf("\u5B8C\u6210") >= 0 ? "ok" : "error", text: msgS[0] }) : null,
        s.error ? h(C.Notice, { h, kind: "error", text: s.error }) : null,
        f ? h(
          "div",
          { className: "wbc-card" },
          h("div", { className: "wbc-head" }, h("strong", null, f.id ? "\u7F16\u8F91\u6765\u6E90" : "\u65B0\u5EFA\u6765\u6E90"), h(C.Btn, { h, onClick: function() {
            formS[1](null);
          } }, "\u53D6\u6D88")),
          h(
            "div",
            { className: "wbc-form" },
            h(C.Field, { h, label: "\u540D\u79F0" }, h("input", { value: f.name, maxLength: 80, onChange: function(e) {
              setField("name", e.target.value);
            }, placeholder: "\u4F8B\u5982\uFF1A\u5C11\u6570\u6D3E RSS" })),
            h(C.Field, { h, label: "\u7C7B\u578B" }, h("select", { value: f.driver, onChange: function(e) {
              var nd = driver(e.target.value);
              setField("driver", e.target.value);
              setField("config", defaults(nd));
            } }, drivers.map(function(x) {
              return h("option", { key: x.id, value: x.id }, x.title);
            }))),
            h(C.Field, { h, label: "\u6293\u53D6\u95F4\u9694\uFF08\u79D2\uFF09", hint: f.driver === "webhook" ? "Webhook \u56FA\u5B9A\u4E3A\u63A8\u9001\uFF0C0" : "\u6700\u5C11 60\uFF1B0 \u8868\u793A\u53EA\u624B\u52A8" }, h("input", { type: "number", min: 0, value: f.scheduleSec, onChange: function(e) {
              setField("scheduleSec", e.target.value);
            } })),
            h(C.Field, { h, label: "\u65B0\u5185\u5BB9\u6295\u9012" }, h("select", { value: f.sink, onChange: function(e) {
              setField("sink", e.target.value);
            } }, h("option", { value: "message" }, "\u6D88\u606F\u57DF"), h("option", { value: "none" }, "\u53EA\u5165\u5E93\u4E0D\u6295\u9012"))),
            h(C.Field, { h, label: "\u542F\u7528" }, h("select", { value: f.enabled ? "1" : "0", onChange: function(e) {
              setField("enabled", e.target.value === "1");
            } }, h("option", { value: "1" }, "\u542F\u7528"), h("option", { value: "0" }, "\u505C\u7528"))),
            h(C.Field, { h, label: "\u51ED\u636E" }, h("select", { value: f.secretId || "", onChange: function(e) {
              setField("secretId", e.target.value);
            } }, h("option", { value: "" }, "\u4E0D\u7ED1\u5B9A"), secrets.map(function(x) {
              return h("option", { key: x.id, value: x.id }, x.name + " (" + x.kind + ")");
            })))
          ),
          d ? h("div", { className: "wbc-form", style: { marginTop: "10px" } }, (d.configFields || []).map(function(cf) {
            var val = f.config[cf.name] === void 0 ? "" : f.config[cf.name];
            if (cf.type === "select") return h(C.Field, { key: cf.name, label: cf.label || cf.name, hint: cf.placeholder || "" }, h("select", { value: val || (cf.default || ""), onChange: function(e) {
              setConfig(cf.name, e.target.value);
            } }, (cf.options || []).map(function(op) {
              return h("option", { key: op, value: op }, op);
            })));
            if (cf.type === "boolean") return h(C.Field, { key: cf.name, label: cf.label || cf.name }, h("select", { value: val ? "1" : "0", onChange: function(e) {
              setConfig(cf.name, e.target.value === "1", "boolean");
            } }, h("option", { value: "1" }, "\u662F"), h("option", { value: "0" }, "\u5426")));
            return h(C.Field, { key: cf.name, label: cf.label || cf.name, hint: cf.placeholder || "" }, h("input", { type: cf.type === "number" ? "number" : "text", value: val, onChange: function(e) {
              setConfig(cf.name, e.target.value, cf.type);
            } }));
          })) : null,
          h("div", { className: "wbc-row", style: { marginTop: "10px" } }, h(C.Btn, { h, kind: "primary", onClick: save, disabled: busyS[0] || !f.name.trim() }, busyS[0] ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58"))
        ) : null,
        s.loading ? h(C.Empty, { h, text: "\u52A0\u8F7D\u4E2D\u2026" }) : rows.length === 0 ? h(C.Empty, { h, text: "\u8FD8\u6CA1\u6709\u6765\u6E90\u3002" }) : rows.map(function(src) {
          var st = src.state || {};
          return h(
            "div",
            { key: src.id, className: "wbc-card" },
            h(
              "div",
              { className: "wbc-head" },
              h(
                "div",
                null,
                h("div", { className: "wbc-row" }, h("strong", null, src.name), h(C.Pill, { h }, src.driver), h(C.Pill, { h, kind: src.enabled ? "ok" : "warn" }, src.enabled ? "\u542F\u7528" : "\u505C\u7528"), st.lastStatus === "error" ? h(C.Pill, { h, kind: "error" }, "\u9519\u8BEF") : null),
                h("p", { className: "wbc-sub" }, (src.scheduleSec ? "\u6BCF " + src.scheduleSec + " \u79D2" : "\u4EC5\u624B\u52A8/\u63A8\u9001") + " \xB7 " + (src.sink === "message" ? "\u6295\u9012\u5230\u6D88\u606F" : "\u53EA\u5165\u5E93") + (st.secretId ? " \xB7 \u5DF2\u7ED1\u5B9A\u51ED\u636E" : " \xB7 \u672A\u7ED1\u5B9A\u51ED\u636E"))
              ),
              h("div", { className: "wbc-row" }, h(C.Btn, { h, onClick: function() {
                run(src);
              }, disabled: busyS[0] }, "\u7ACB\u5373\u8FD0\u884C"), h(C.Btn, { h, onClick: function() {
                toggle(src);
              }, disabled: busyS[0] }, st.deliveryEnabled ? "\u5173\u95ED\u6295\u9012" : "\u5F00\u542F\u6295\u9012"), h(C.Btn, { h, onClick: function() {
                startEdit(src);
              } }, "\u7F16\u8F91"), h(C.Btn, { h, kind: "danger", onClick: function() {
                del(src);
              } }, "\u5220\u9664"))
            ),
            h(
              "div",
              { className: "wbc-grid", style: { marginTop: "8px" } },
              h("div", { className: "wbc-sub" }, "\u4E0A\u6B21\u8FD0\u884C\uFF1A", C.fmtTime(st.lastRunAt, lang)),
              h("div", { className: "wbc-sub" }, "\u4E0B\u6B21\uFF1A", st.nextRunAt ? C.fmtTime(st.nextRunAt, lang) : "\u2014"),
              h("div", { className: "wbc-sub" }, "\u5931\u8D25\u6B21\u6570\uFF1A", st.failCount || 0),
              st.lastError ? h("div", { className: "wbc-sub" }, "\u9519\u8BEF\uFF1A", st.lastError) : null
            ),
            h("div", { className: "wbc-row", style: { marginTop: "8px" } }, h("span", { className: "wbc-sub" }, "\u51ED\u636E"), h("select", { value: bindS[0][src.id] !== void 0 ? bindS[0][src.id] : st.secretId || "", onChange: function(e) {
              var n = Object.assign({}, bindS[0]);
              n[src.id] = e.target.value;
              bindS[1](n);
            } }, h("option", { value: "" }, "\u4E0D\u7ED1\u5B9A"), secrets.map(function(x) {
              return h("option", { key: x.id, value: x.id }, x.name);
            })), h(C.Btn, { h, onClick: function() {
              bind(src);
            }, disabled: busyS[0] }, "\u4FDD\u5B58\u7ED1\u5B9A")),
            h(C.Json, { h, value: src.config })
          );
        })
      );
    };
  }
});

// packages/addons/connector/client/views/items.cjs
var require_items = __commonJS({
  "packages/addons/connector/client/views/items.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    module2.exports = function ItemsView(props) {
      var h = props.h, api = props.api, React = props.React, lang = props.lang || "zh";
      var qS = React.useState(""), srcS = React.useState(""), selS = React.useState(null);
      var s = C.useLoad(React, api, "connector.itemList", { q: qS[0], sourceId: srcS[0], limit: 100 }, [qS[0], srcS[0]]);
      var srcs = C.useLoad(React, api, "connector.sourceList", {}, []);
      var list = s.data && s.data.items || [];
      var sources = srcs.data && srcs.data.sources || [];
      return h(
        "div",
        { className: "wbc-wrap" },
        h("div", { className: "wbc-head" }, h("div", null, h("h2", { className: "wbc-title" }, "\u5185\u5BB9"), h("p", { className: "wbc-sub" }, "\u6309 external_id \u53BB\u91CD\uFF1B\u70B9\u6807\u9898\u770B\u6458\u8981\u4E0E\u539F\u59CB\u5B57\u6BB5\u3002")), h(C.Btn, { h, onClick: s.refresh }, "\u5237\u65B0")),
        h(
          "div",
          { className: "wbc-row" },
          h(C.Field, { h, label: "\u641C\u7D22" }, h("input", { value: qS[0], onChange: function(e) {
            qS[1](e.target.value);
          }, placeholder: "\u6807\u9898 / \u6458\u8981 / \u4F5C\u8005" })),
          h(C.Field, { h, label: "\u6765\u6E90" }, h("select", { value: srcS[0], onChange: function(e) {
            srcS[1](e.target.value);
          } }, h("option", { value: "" }, "\u5168\u90E8\u6765\u6E90"), sources.map(function(x) {
            return h("option", { key: x.id, value: x.id }, x.name);
          })))
        ),
        s.error ? h(C.Notice, { h, kind: "error", text: s.error }) : null,
        s.loading ? h(C.Empty, { h, text: "\u52A0\u8F7D\u4E2D\u2026" }) : list.length === 0 ? h(C.Empty, { h, text: "\u8FD8\u6CA1\u6709\u5185\u5BB9\uFF1B\u65B0\u5EFA\u6765\u6E90\u540E\u7B49\u4E00\u6B21\u6293\u53D6\uFF0C\u6216\u7528 Webhook \u63A8\u9001\u3002" }) : h(
          "div",
          { className: "wbc-card" },
          h("table", { className: "wbc-table" }, h("thead", null, h("tr", null, h("th", null, "\u6807\u9898"), h("th", null, "\u6765\u6E90"), h("th", null, "\u53D1\u5E03"), h("th", null, "\u6293\u53D6"))), h("tbody", null, list.map(function(it) {
            return h("tr", { key: it.id }, h("td", null, h("a", { className: "wbc-link", href: it.url || "#", target: "_blank", rel: "noreferrer", onClick: function(e) {
              if (!it.url) {
                e.preventDefault();
                selS[1](it);
              }
            } }, it.title || "(\u65E0\u6807\u9898)")), h("td", null, it.sourceName || it.source_id), h("td", null, C.fmtTime(it.publishedAt, lang)), h("td", null, C.fmtTime(it.fetchedAt, lang)));
          })))
        ),
        selS[0] ? h("div", { className: "wbc-card" }, h("div", { className: "wbc-head" }, h("strong", null, selS[0].title), h(C.Btn, { h, onClick: function() {
          selS[1](null);
        } }, "\u5173\u95ED")), h("p", { className: "wbc-sub" }, selS[0].summary || ""), h(C.Json, { h, value: selS[0] })) : null
      );
    };
  }
});

// packages/addons/connector/client/views/runs.cjs
var require_runs = __commonJS({
  "packages/addons/connector/client/views/runs.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    module2.exports = function RunsView(props) {
      var h = props.h, api = props.api, React = props.React, lang = props.lang || "zh";
      var s = C.useLoad(React, api, "connector.runList", { limit: 50 }, []);
      var rows = s.data && s.data.runs || [];
      return h(
        "div",
        { className: "wbc-wrap" },
        h("div", { className: "wbc-head" }, h("div", null, h("h2", { className: "wbc-title" }, "\u8FD0\u884C\u8BB0\u5F55"), h("p", { className: "wbc-sub" }, "\u6BCF\u6B21\u6293\u53D6/\u63A8\u9001\u7684\u8BA1\u6570\u4E0E\u9519\u8BEF\uFF1B\u5931\u8D25\u4F1A\u6307\u6570\u9000\u907F\u3002")), h(C.Btn, { h, onClick: s.refresh }, "\u5237\u65B0")),
        s.error ? h(C.Notice, { h, kind: "error", text: s.error }) : null,
        s.loading ? h(C.Empty, { h, text: "\u52A0\u8F7D\u4E2D\u2026" }) : rows.length === 0 ? h(C.Empty, { h, text: "\u8FD8\u6CA1\u6709\u8FD0\u884C\u8BB0\u5F55\u3002" }) : h(
          "div",
          { className: "wbc-card" },
          h("table", { className: "wbc-table" }, h("thead", null, h("tr", null, h("th", null, "\u5F00\u59CB"), h("th", null, "\u6765\u6E90"), h("th", null, "\u89E6\u53D1"), h("th", null, "\u72B6\u6001"), h("th", null, "\u6293\u53D6/\u65B0\u589E/\u66F4\u65B0/\u8DF3\u8FC7"), h("th", null, "\u9519\u8BEF"))), h("tbody", null, rows.map(function(r) {
            return h("tr", { key: r.id }, h("td", null, C.fmtTime(r.startedAt, lang)), h("td", null, r.sourceName || r.source_id), h("td", null, r.trigger), h("td", null, h(C.Pill, { h, kind: r.status === "ok" ? "ok" : "error" }, r.status)), h("td", null, [r.fetched, r.inserted, r.updated, r.skipped].join(" / ")), h("td", { className: "wbc-muted" }, r.error || "\u2014"));
          })))
        )
      );
    };
  }
});

// packages/addons/connector/client/views/config.cjs
var require_config = __commonJS({
  "packages/addons/connector/client/views/config.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    module2.exports = function ConfigView(props) {
      var h = props.h, api = props.api, React = props.React;
      var st = C.useLoad(React, api, "connector.status", {}, []);
      var v = C.useLoad(React, api, "vault.status", {}, []);
      var d = st.data || {}, vault = v.data || {};
      return h(
        "div",
        { className: "wbc-wrap" },
        h("div", { className: "wbc-head" }, h("div", null, h("h2", { className: "wbc-title" }, "\u8BBE\u7F6E\u4E0E\u8BF4\u660E"), h("p", { className: "wbc-sub" }, "\u8FDE\u63A5\u5668\u7684\u8C03\u5EA6\u3001\u6295\u9012\u4E0E\u51ED\u636E\u8FB9\u754C\u3002")), h(C.Btn, { h, onClick: function() {
          st.refresh();
          v.refresh();
        } }, "\u5237\u65B0")),
        st.error ? h(C.Notice, { h, kind: "error", text: st.error }) : null,
        h("div", { className: "wbc-card" }, h("strong", null, "\u8C03\u5EA6"), h("ul", { className: "wbc-sub" }, h("li", null, "\u5BBF\u4E3B\u6BCF 15 \u79D2\u68C0\u67E5\u4E00\u6B21\uFF0C\u5355\u6B21\u6700\u591A\u8FD0\u884C 3 \u4E2A\u5230\u671F\u6765\u6E90\u3002"), h("li", null, "\u6BCF\u4E2A\u6765\u6E90\u95F4\u9694\u6700\u5C11 60 \u79D2\uFF0C\u6700\u957F 7 \u5929\uFF1B0 \u8868\u793A\u53EA\u624B\u52A8\u6216\u63A8\u9001\u3002"), h("li", null, "\u5931\u8D25\u6309 60/120/240\u2026\u79D2\u6307\u6570\u9000\u907F\uFF0C\u4E0A\u9650\u7EA6 1 \u5C0F\u65F6\uFF1B\u8FDE\u7EED\u5931\u8D25\u4F1A\u5199 last_error\u3002"), h("li", null, "\u5F53\u524D\u5230\u671F\uFF1A", String(d.due || 0), " \u4E2A\u3002"))),
        h("div", { className: "wbc-card" }, h("strong", null, "\u51ED\u636E\u8FB9\u754C"), h("p", { className: "wbc-sub" }, "token \u53EA\u5B58\u5728 vault\uFF1B\u8FDE\u63A5\u5668\u901A\u8FC7 plugin \u79DF\u7EA6\u5728\u5185\u5B58\u91CC\u53D6\u7528\uFF0C\u5217\u8868\u4E0E\u6570\u636E\u9875\u90FD\u4E0D\u4F1A\u56DE\u663E\u660E\u6587\u3002"), h("div", { className: "wbc-row" }, h("span", null, "\u4FDD\u9669\u7BB1\uFF1A"), h(C.Pill, { h, kind: vault.unlocked ? "ok" : "warn" }, vault.unlocked ? "\u5DF2\u89E3\u9501" : "\u5DF2\u9501\u5B9A"), h("span", { className: "wbc-muted" }, vault.unlockMode ? "\u6A21\u5F0F " + vault.unlockMode : "\u672A\u521D\u59CB\u5316"), h("span", { className: "wbc-muted" }, "\u5230\u300C\u4FDD\u9669\u7BB1\u300D\u89C6\u56FE\u521B\u5EFA/\u89E3\u9501\u51ED\u636E"))),
        h("div", { className: "wbc-card" }, h("strong", null, "Webhook \u5165\u53E3"), h("p", { className: "wbc-sub" }, "\u9ED8\u8BA4\u53EA\u5141\u8BB8\u672C\u673A\u56DE\u73AF\uFF1B\u516C\u7F51\u8BF7\u7528\u53CD\u5411\u4EE3\u7406\u8F6C\u5230 127.0.0.1\uFF0C\u4E0D\u8981\u76F4\u63A5\u66B4\u9732\u7AEF\u53E3\u3002"), h("pre", { className: "wbc-json" }, 'POST /workbench/hooks/connector/inbound?source=<sourceId>\nHeader: x-webhook-token: <token>\nBody: {"id":"\u53EF\u9009","title":"\u2026","body":"\u2026","url":"\u2026"}')),
        h("div", { className: "wbc-card" }, h("strong", null, "Driver"), (st.data && st.data.drivers || []).map(function(x) {
          return h("div", { key: x, className: "wbc-sub" }, "\xB7 " + x);
        }))
      );
    };
  }
});

// packages/addons/connector/client/views/data.cjs
var require_data = __commonJS({
  "packages/addons/connector/client/views/data.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    module2.exports = function DataView(props) {
      var h = props.h, api = props.api, React = props.React;
      var tS = React.useState(null), tableS = React.useState("connector_source");
      React.useEffect(function() {
        C.call(api, "connector.dataTables").then(function(r) {
          tS[1](r && r.tables || []);
        }).catch(function() {
        });
      }, []);
      var tables = tS[0] || [];
      var s = C.useLoad(React, api, "connector.dataQuery", { table: tableS[0], limit: 100 }, [tableS[0]]);
      var rows = s.data && s.data.rows || [];
      return h(
        "div",
        { className: "wbc-wrap" },
        h("div", { className: "wbc-head" }, h("div", null, h("h2", { className: "wbc-title" }, "\u6570\u636E"), h("p", { className: "wbc-sub" }, "\u53EA\u8BFB\u67E5\u770B\u56DB\u5F20\u8868\uFF1B\u6765\u6E90\u5B9A\u4E49\u53C2\u4E0E\u4E91\u540C\u6B65\uFF0C\u5176\u4F59\u53EA\u5728\u672C\u673A\u3002")), h(C.Btn, { h, onClick: s.refresh }, "\u5237\u65B0")),
        h("div", { className: "wbc-row" }, h(C.Field, { h, label: "\u8868" }, h("select", { value: tableS[0], onChange: function(e) {
          tableS[1](e.target.value);
        } }, tables.map(function(t) {
          return h("option", { key: t.name, value: t.name }, t.name);
        }))), h("span", { className: "wbc-muted" }, rows.length + " \u884C\uFF08\u6700\u591A 100\uFF09")),
        s.error ? h(C.Notice, { h, kind: "error", text: s.error }) : null,
        s.loading ? h(C.Empty, { h, text: "\u52A0\u8F7D\u4E2D\u2026" }) : rows.length === 0 ? h(C.Empty, { h, text: "\u8FD9\u5F20\u8868\u8FD8\u6CA1\u6709\u6570\u636E\u3002" }) : h(
          "div",
          { className: "wbc-card" },
          h("table", { className: "wbc-table" }, h("thead", null, h("tr", null, Object.keys(rows[0] || {}).map(function(k) {
            return h("th", { key: k }, k);
          }))), h("tbody", null, rows.map(function(r, i) {
            return h("tr", { key: i }, Object.keys(rows[0] || {}).map(function(k) {
              var v = r[k];
              return h("td", { key: k }, typeof v === "string" && v.length > 120 ? v.slice(0, 120) + "\u2026" : String(v == null ? "" : v));
            }));
          })))
        )
      );
    };
  }
});

// packages/addons/connector/client/views/actions.cjs
var require_actions = __commonJS({
  "packages/addons/connector/client/views/actions.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    module2.exports = function ActionsView(props) {
      var h = props.h, api = props.api, React = props.React;
      var s = C.useLoad(React, api, "connector.actionSchema", {}, []);
      var rows = s.data && s.data.actions || [];
      return h(
        "div",
        { className: "wbc-wrap" },
        h("div", { className: "wbc-head" }, h("div", null, h("h2", { className: "wbc-title" }, "Action \u6E05\u5355"), h("p", { className: "wbc-sub" }, "\u672C\u63D2\u4EF6\u81EA\u8BC1\u6E05\u5355\uFF0C\u4E0D\u8BFB\u5BBF\u4E3B\u7EDF\u4E00\u63A5\u53E3\u3002")), h(C.Btn, { h, onClick: s.refresh }, "\u5237\u65B0")),
        s.error ? h(C.Notice, { h, kind: "error", text: s.error }) : null,
        s.loading ? h(C.Empty, { h, text: "\u52A0\u8F7D\u4E2D\u2026" }) : h(
          "div",
          { className: "wbc-card" },
          h("table", { className: "wbc-table" }, h("thead", null, h("tr", null, h("th", null, "action"), h("th", null, "\u8BF4\u660E"), h("th", null, "\u5FC5\u586B"))), h("tbody", null, rows.map(function(a) {
            var req = a.input && a.input.required || [];
            return h("tr", { key: a.name }, h("td", null, h("code", null, a.name)), h("td", null, a.description), h("td", null, req.join(", ") || "\u2014"));
          })))
        )
      );
    };
  }
});

// packages/addons/connector/client/client.src.cjs
(function() {
  var root = typeof window !== "undefined" ? window : null;
  var host = root && root.__WB_HOST__;
  if (!host || !host.react) {
    if (typeof console !== "undefined") console.error("[dsh-workbench-connector] \u5BBF\u4E3B\u524D\u7AEF\u672A\u5C31\u7EEA");
    module.exports = { name: "dsh-workbench-connector", inject: [], apply: function() {
    } };
    return;
  }
  var React = host.react;
  var h = host.h;
  var CSS = require_styles();
  var ICONS = {
    activity: (init_activity(), __toCommonJS(activity_exports)).default,
    rss: (init_rss(), __toCommonJS(rss_exports)).default,
    inbox: (init_inbox(), __toCommonJS(inbox_exports)).default,
    history: (init_history(), __toCommonJS(history_exports)).default,
    sliders: (init_sliders_horizontal(), __toCommonJS(sliders_horizontal_exports)).default,
    database: (init_database(), __toCommonJS(database_exports)).default,
    list: (init_list(), __toCommonJS(list_exports)).default
  };
  function Icon2(props) {
    var C = ICONS[props.name] || ICONS.rss;
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
  function ensureStyles() {
    if (typeof document === "undefined" || !document.head) return;
    if (document.getElementById("wb-connector-style")) return;
    var style = document.createElement("style");
    style.id = "wb-connector-style";
    style.textContent = CSS;
    document.head.appendChild(style);
  }
  ensureStyles();
  host.registerAddon({
    id: "wb-addon-connector",
    version: "0.1.0",
    icon: (init_rss(), __toCommonJS(rss_exports)).default,
    views: [
      { id: "stats", icon: tabIcon("activity"), title: { zh: "\u6982\u89C8", en: "Overview" }, component: withProps(require_stats(), "\u6982\u89C8") },
      { id: "sources", icon: tabIcon("rss"), title: { zh: "\u6765\u6E90", en: "Sources" }, component: withProps(require_sources(), "\u6765\u6E90") },
      { id: "items", icon: tabIcon("inbox"), title: { zh: "\u5185\u5BB9", en: "Items" }, component: withProps(require_items(), "\u5185\u5BB9") },
      { id: "runs", icon: tabIcon("history"), title: { zh: "\u8FD0\u884C\u8BB0\u5F55", en: "Runs" }, component: withProps(require_runs(), "\u8FD0\u884C\u8BB0\u5F55") },
      { id: "config", icon: tabIcon("sliders"), title: { zh: "\u8BBE\u7F6E", en: "Settings" }, component: withProps(require_config(), "\u8BBE\u7F6E") },
      { id: "data", icon: tabIcon("database"), title: { zh: "\u6570\u636E", en: "Data" }, component: withProps(require_data(), "\u6570\u636E") },
      { id: "actions", icon: tabIcon("list"), title: { zh: "Action", en: "Actions" }, component: withProps(require_actions(), "Action") }
    ]
  });
  module.exports = { name: "dsh-workbench-connector", inject: [], apply: function() {
  } };
})();
    return module.exports;
  },
});
