// 由 scripts/build-addon-clients.mjs 生成；请修改对应 client/client.src.cjs 后重新构建。
window.__ModuleLoader__ = window.__ModuleLoader__ || { modules: {}, load: function (m) { this.modules[m.id] = m.factory; } };
window.__ModuleLoader__.load({
  id: "dsh-workbench-automation",
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

// packages/addons/automation/client/ui/styles.cjs
var require_styles = __commonJS({
  "packages/addons/automation/client/ui/styles.cjs"(exports2, module2) {
    "use strict";
    module2.exports = [
      ".wba-wrap{display:flex;flex-direction:column;gap:12px;padding:16px;overflow:auto;height:100%;box-sizing:border-box}",
      ".wba-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}",
      ".wba-title{font-size:16px;font-weight:650;margin:0}",
      ".wba-sub{font-size:12px;color:var(--wb-muted,#6b7280);margin:2px 0 0}",
      ".wba-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}",
      ".wba-card{border:1px solid var(--wb-border,#e5e7eb);border-radius:10px;background:var(--wb-surface,#fff);padding:12px}",
      ".wba-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}",
      ".wba-kpi{font-size:22px;font-weight:700;line-height:1.2}.wba-kpi-label{font-size:12px;color:var(--wb-muted,#6b7280)}",
      ".wba-table{width:100%;border-collapse:collapse;font-size:12px}.wba-table th,.wba-table td{padding:7px 8px;border-bottom:1px solid var(--wb-border,#eef0f3);text-align:left;vertical-align:top}",
      ".wba-table th{font-weight:600;color:var(--wb-muted,#6b7280);white-space:nowrap}",
      ".wba-btn{border:1px solid var(--wb-border,#d1d5db);background:var(--wb-surface,#fff);color:inherit;border-radius:7px;padding:5px 10px;font-size:12px;cursor:pointer}",
      ".wba-btn:hover:not(:disabled){border-color:var(--wb-accent,#2563eb)}.wba-btn:disabled{opacity:.5;cursor:default}",
      ".wba-btn.primary{background:var(--wb-accent,#2563eb);border-color:var(--wb-accent,#2563eb);color:#fff}",
      ".wba-btn.danger{color:#b91c1c;border-color:#fecaca}",
      ".wba-field{display:flex;flex-direction:column;gap:4px;font-size:12px}.wba-label{font-weight:600}",
      ".wba-field input,.wba-field select,.wba-field textarea{border:1px solid var(--wb-border,#d1d5db);border-radius:7px;padding:6px 8px;font:inherit;background:var(--wb-surface,#fff);color:inherit;min-width:0}",
      ".wba-hint{color:var(--wb-muted,#6b7280);font-size:11px}.wba-notice{padding:8px 10px;border-radius:8px;font-size:12px;background:#eff6ff;color:#1e40af}",
      ".wba-notice.error{background:#fef2f2;color:#b91c1c}.wba-notice.ok{background:#ecfdf5;color:#047857}",
      ".wba-empty{padding:18px;text-align:center;color:var(--wb-muted,#6b7280);font-size:12px;border:1px dashed var(--wb-border,#e5e7eb);border-radius:8px}",
      ".wba-pill{display:inline-block;padding:1px 7px;border-radius:999px;font-size:11px;background:#f3f4f6;color:#374151}",
      ".wba-pill.ok{background:#ecfdf5;color:#047857}.wba-pill.error{background:#fef2f2;color:#b91c1c}.wba-pill.warn{background:#fffbeb;color:#b45309}",
      ".wba-json{margin:0;padding:8px;background:#f8fafc;border-radius:8px;font-size:11px;max-height:240px;overflow:auto}",
      ".wba-muted{color:var(--wb-muted,#6b7280)}.wba-link{color:var(--wb-accent,#2563eb);cursor:pointer;text-decoration:none}",
      ".wba-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}"
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

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/zap.mjs
var zap_exports = {};
__export(zap_exports, {
  __iconData: () => __iconData2,
  default: () => Zap
});
var __iconData2, Zap;
var init_zap = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/zap.mjs"() {
    init_createLucideIcon();
    __iconData2 = {
      name: "zap",
      size: 24,
      node: [
        [
          "path",
          {
            d: "M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z",
            key: "1v7up4"
          }
        ]
      ]
    };
    __iconData2.node;
    Zap = createLucideIcon(__iconData2);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/rotate-ccw-clock.mjs
var __iconData3, RotateCcwClock;
var init_rotate_ccw_clock = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/rotate-ccw-clock.mjs"() {
    init_createLucideIcon();
    __iconData3 = {
      name: "rotate-ccw-clock",
      size: 24,
      node: [
        ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
        ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
        ["path", { d: "M12 7v5l4 2", key: "1fdv2h" }]
      ],
      aliases: ["history"]
    };
    __iconData3.node;
    RotateCcwClock = createLucideIcon(__iconData3);
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

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/database.mjs
var database_exports = {};
__export(database_exports, {
  __iconData: () => __iconData5,
  default: () => Database
});
var __iconData5, Database;
var init_database = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/database.mjs"() {
    init_createLucideIcon();
    __iconData5 = {
      name: "database",
      size: 24,
      node: [
        ["ellipse", { cx: "12", cy: "5", rx: "9", ry: "3", key: "msslwz" }],
        ["path", { d: "M3 5V19A9 3 0 0 0 21 19V5", key: "1wlel7" }],
        ["path", { d: "M3 12A9 3 0 0 0 21 12", key: "mv7ke4" }]
      ]
    };
    __iconData5.node;
    Database = createLucideIcon(__iconData5);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/list.mjs
var list_exports = {};
__export(list_exports, {
  __iconData: () => __iconData6,
  default: () => List
});
var __iconData6, List;
var init_list = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/list.mjs"() {
    init_createLucideIcon();
    __iconData6 = {
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
    __iconData6.node;
    List = createLucideIcon(__iconData6);
  }
});

// packages/addons/automation/client/ui/common.cjs
var require_common = __commonJS({
  "packages/addons/automation/client/ui/common.cjs"(exports2, module2) {
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
      return h("button", { type: props.type || "button", className: "wba-btn" + (props.kind ? " " + props.kind : ""), disabled: props.disabled, onClick: props.onClick, title: props.title }, props.children);
    }
    function Field(props) {
      var h = props.h;
      return h("label", { className: "wba-field" }, h("span", { className: "wba-label" }, props.label), props.children, props.hint ? h("span", { className: "wba-hint" }, props.hint) : null);
    }
    function Notice(props) {
      var h = props.h;
      if (!props.text) return null;
      return h("div", { className: "wba-notice " + (props.kind || "info") }, props.text);
    }
    function Empty(props) {
      var h = props.h;
      return h("div", { className: "wba-empty" }, props.text || "\u6682\u65E0\u6570\u636E");
    }
    function Pill(props) {
      var h = props.h;
      return h("span", { className: "wba-pill " + (props.kind || "") }, props.children);
    }
    function Json(props) {
      var h = props.h;
      var t;
      try {
        t = JSON.stringify(props.value, null, 2);
      } catch (e) {
        t = String(props.value);
      }
      return h("pre", { className: "wba-json" }, t);
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
        call(api, action, args).then(function(d) {
          if (alive) s[1]({ loading: false, data: d, error: "" });
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

// packages/addons/automation/client/views/stats.cjs
var require_stats = __commonJS({
  "packages/addons/automation/client/views/stats.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    module2.exports = function StatsView(props) {
      var h = props.h, api = props.api, React = props.React;
      var st = C.useLoad(React, api, "automation.status", {}, []);
      var opts = C.useLoad(React, api, "automation.actionOptions", {}, []);
      if (st.loading) return h("div", { className: "wba-wrap" }, "\u52A0\u8F7D\u4E2D\u2026");
      if (st.error) return h("div", { className: "wba-wrap" }, h(C.Notice, { h, kind: "error", text: st.error }));
      var s = st.data || {};
      var today = s.today || {};
      return h(
        "div",
        { className: "wba-wrap" },
        h("div", { className: "wba-head" }, h("h2", null, "\u81EA\u52A8\u5316"), h(C.Btn, { h, onClick: st.refresh }, "\u5237\u65B0")),
        h(
          "div",
          { className: "wba-cards" },
          h("div", { className: "wba-card" }, h("div", { className: "wba-card-num" }, s.total || 0), h("div", null, "\u89C4\u5219\u603B\u6570")),
          h("div", { className: "wba-card" }, h("div", { className: "wba-card-num" }, s.enabled || 0), h("div", null, "\u5DF2\u542F\u7528")),
          h("div", { className: "wba-card" }, h("div", { className: "wba-card-num" }, today.ok || 0), h("div", null, "\u4ECA\u65E5\u6210\u529F")),
          h("div", { className: "wba-card" }, h("div", { className: "wba-card-num" }, today.error || 0), h("div", null, "\u4ECA\u65E5\u5931\u8D25")),
          h("div", { className: "wba-card" }, h("div", { className: "wba-card-num" }, today.skipped || 0), h("div", null, "\u4ECA\u65E5\u8DF3\u8FC7"))
        ),
        h(
          "div",
          { className: "wba-panel" },
          h("h3", null, "\u80FD\u505A\u4EC0\u4E48"),
          h("p", null, "\u6309\u56FA\u5B9A\u95F4\u9694\u3001\u6BCF\u5929\u56FA\u5B9A\u65F6\u95F4\u3001\u57DF\u4E8B\u4EF6\u6216\u624B\u52A8\u8FD0\u884C\uFF0C\u8C03\u7528\u767D\u540D\u5355 action\uFF1B\u53C2\u6570\u652F\u6301\u6A21\u677F\u4E0E\u6761\u4EF6\u3002"),
          h("p", null, "\u6BCF\u89C4\u5219\u6BCF\u5C0F\u65F6\u4E0A\u9650 " + (s.config && s.config.perHour || 60) + " \u6B21\uFF0C\u89C4\u5219\u4E0A\u9650 " + (s.config && s.config.maxRules || 50) + " \u6761\uFF1B\u8D85\u9650\u6216\u5E76\u53D1\u5DF2\u6EE1\u4F1A\u8BB0\u4E3A skipped\u3002"),
          h("p", { className: "wba-muted" }, "\u4E0D\u5141\u8BB8\u8C03\u7528 vault.*\u3001automation.*\u3001audit.* \u6216\u4EFB\u4F55 delete/backup action\u3002")
        ),
        h(
          "div",
          { className: "wba-panel" },
          h("h3", null, "\u767D\u540D\u5355"),
          opts.loading ? "\u52A0\u8F7D\u4E2D\u2026" : h("div", { className: "wba-pills" }, (opts.data && opts.data.actions || []).map(function(a) {
            return h(C.Pill, { h, key: a }, a);
          }))
        )
      );
    };
  }
});

// packages/addons/automation/client/views/rules.cjs
var require_rules = __commonJS({
  "packages/addons/automation/client/views/rules.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    function emptyForm() {
      return { id: "", name: "", enabled: true, kind: "interval", everyMinutes: 60, time: "09:00", tz: "Asia/Shanghai", weekdays: "1,2,3,4,5", domainId: "", event: "", actionName: "message.send", actionArgs: '{\n  "title": "\u81EA\u52A8\u5316\u63D0\u9192",\n  "body": "\u89C4\u5219 {{rule.name}} \u5DF2\u8FD0\u884C"\n}', condition: "" };
    }
    function formFromRule(rule) {
      var f = emptyForm();
      f.id = rule.id;
      f.name = rule.name;
      f.enabled = rule.enabled;
      f.actionName = rule.actionName;
      f.actionArgs = JSON.stringify(rule.actionArgs || {}, null, 2);
      f.condition = rule.condition ? JSON.stringify(rule.condition, null, 2) : "";
      var t = rule.triggerConfig || {};
      f.kind = t.kind || "manual";
      if (t.kind === "interval") f.everyMinutes = t.everyMinutes || 60;
      if (t.kind === "dailyAt") {
        f.time = t.time || "09:00";
        f.tz = t.tz || "Asia/Shanghai";
        f.weekdays = (t.weekdays || [1, 2, 3, 4, 5]).join(",");
      }
      if (t.kind === "event") {
        f.domainId = t.domainId || "";
        f.event = t.event || "";
      }
      return f;
    }
    function triggerText(rule) {
      var t = rule.triggerConfig || {};
      if (t.kind === "interval") return "\u6BCF " + t.everyMinutes + " \u5206\u949F";
      if (t.kind === "dailyAt") return "\u6BCF\u5929 " + t.time + "\uFF08" + t.tz + "\uFF0C\u5468" + (t.weekdays || []).join(",") + "\uFF09";
      if (t.kind === "event") return "\u4E8B\u4EF6 " + t.domainId + "/" + t.event;
      return "\u624B\u52A8";
    }
    module2.exports = function RulesView(props) {
      var h = props.h, api = props.api, React = props.React;
      var list = C.useLoad(React, api, "automation.ruleList", {}, []);
      var opts = C.useLoad(React, api, "automation.actionOptions", {}, []);
      var form = React.useState(null);
      var msg = React.useState("");
      var busy = React.useState(false);
      var f = form[0];
      function set(k, v) {
        var next = Object.assign({}, form[0]);
        next[k] = v;
        form[1](next);
      }
      function fail(e) {
        msg[1](C.errText(e));
      }
      function payload() {
        var triggerConfig = { kind: f.kind };
        if (f.kind === "interval") triggerConfig.everyMinutes = Number(f.everyMinutes) || 60;
        if (f.kind === "dailyAt") {
          triggerConfig.time = f.time;
          triggerConfig.tz = f.tz;
          triggerConfig.weekdays = String(f.weekdays || "").split(",").map(function(x) {
            return Number(x.trim());
          }).filter(Boolean);
        }
        if (f.kind === "event") {
          triggerConfig.domainId = f.domainId;
          triggerConfig.event = f.event;
        }
        var args, cond = null;
        try {
          args = f.actionArgs.trim() ? JSON.parse(f.actionArgs) : {};
        } catch (e) {
          throw new Error("actionArgs \u4E0D\u662F\u5408\u6CD5 JSON");
        }
        if (f.condition.trim()) {
          try {
            cond = JSON.parse(f.condition);
          } catch (e) {
            throw new Error("\u6761\u4EF6\u4E0D\u662F\u5408\u6CD5 JSON");
          }
        }
        var out = { id: f.id || void 0, name: f.name, enabled: f.enabled, triggerType: f.kind === "event" ? "event" : f.kind === "manual" ? "manual" : "schedule", triggerConfig, actionName: f.actionName, actionArgs: args, condition: cond };
        return out;
      }
      function save() {
        busy[1](true);
        msg[1]("");
        var p;
        try {
          p = payload();
        } catch (e) {
          busy[1](false);
          return fail(e);
        }
        var action = f.id ? "automation.ruleUpdate" : "automation.ruleCreate";
        C.call(api, action, p).then(function() {
          form[1](null);
          list.refresh();
          msg[1]("\u5DF2\u4FDD\u5B58");
        }).catch(fail).then(function() {
          busy[1](false);
        });
      }
      function remove(rule) {
        if (typeof window !== "undefined" && !window.confirm("\u5220\u9664\u89C4\u5219\u300C" + rule.name + "\u300D\uFF1F")) return;
        C.call(api, "automation.ruleDelete", { id: rule.id }).then(function() {
          list.refresh();
        }).catch(fail);
      }
      function run(rule) {
        busy[1](true);
        msg[1]("");
        C.call(api, "automation.ruleRun", { id: rule.id }).then(function(r) {
          msg[1](r && r.skipped ? "\u5DF2\u8DF3\u8FC7\uFF1A" + (r.reason || "") : "\u5DF2\u6267\u884C");
          list.refresh();
        }).catch(fail).then(function() {
          busy[1](false);
        });
      }
      function toggle(rule) {
        C.call(api, "automation.ruleUpdate", { id: rule.id, enabled: !rule.enabled }).then(function() {
          list.refresh();
        }).catch(fail);
      }
      var rows = list.data && list.data.items || [];
      return h(
        "div",
        { className: "wba-wrap" },
        h("div", { className: "wba-head" }, h("h2", null, "\u89C4\u5219"), h(
          "div",
          { className: "wba-row" },
          h(C.Btn, { h, kind: "primary", onClick: function() {
            form[1](emptyForm());
            msg[1]("");
          } }, "\u65B0\u5EFA\u89C4\u5219"),
          h(C.Btn, { h, onClick: list.refresh }, "\u5237\u65B0")
        )),
        h(C.Notice, { h, text: msg[0], kind: /失败|不是|错误|非法/.test(msg[0]) ? "error" : "info" }),
        list.error ? h(C.Notice, { h, kind: "error", text: list.error }) : null,
        rows.length === 0 && !list.loading ? h(C.Empty, { h, text: "\u8FD8\u6CA1\u6709\u89C4\u5219\u3002\u65B0\u5EFA\u4E00\u6761\uFF0C\u6216\u4ECE\u5907\u4EFD\u5BFC\u5165\u3002" }) : null,
        h(
          "div",
          { className: "wba-table-wrap" },
          h(
            "table",
            { className: "wba-table" },
            h("thead", null, h("tr", null, ["\u540D\u79F0", "\u89E6\u53D1", "action", "\u72B6\u6001", "\u4E0A\u6B21", "\u64CD\u4F5C"].map(function(x) {
              return h("th", { key: x }, x);
            }))),
            h("tbody", null, rows.map(function(r) {
              return h(
                "tr",
                { key: r.id },
                h("td", null, h("b", null, r.name), h("div", { className: "wba-muted" }, r.id)),
                h("td", null, triggerText(r)),
                h("td", null, h("code", null, r.actionName)),
                h("td", null, h(C.Pill, { h, kind: r.enabled ? "ok" : "" }, r.enabled ? "\u542F\u7528" : "\u505C\u7528"), " ", h("span", { className: "wba-muted" }, r.lastStatus)),
                h("td", null, C.fmtTime(r.lastRunAt, props.lang)),
                h("td", null, h(
                  "div",
                  { className: "wba-row" },
                  h(C.Btn, { h, onClick: function() {
                    run(r);
                  }, disabled: busy[0] }, "\u8FD0\u884C"),
                  h(C.Btn, { h, onClick: function() {
                    form[1](formFromRule(r));
                  } }, "\u7F16\u8F91"),
                  h(C.Btn, { h, onClick: function() {
                    toggle(r);
                  } }, r.enabled ? "\u505C\u7528" : "\u542F\u7528"),
                  h(C.Btn, { h, kind: "danger", onClick: function() {
                    remove(r);
                  } }, "\u5220\u9664")
                ))
              );
            }))
          )
        ),
        f ? h(
          "div",
          { className: "wba-panel" },
          h("h3", null, f.id ? "\u7F16\u8F91\u89C4\u5219" : "\u65B0\u5EFA\u89C4\u5219"),
          h(
            "div",
            { className: "wba-grid" },
            h(C.Field, { h, label: "\u540D\u79F0" }, h("input", { className: "wba-input", value: f.name, onChange: function(e) {
              set("name", e.target.value);
            } })),
            h(C.Field, { h, label: "\u542F\u7528" }, h("input", { type: "checkbox", checked: f.enabled, onChange: function(e) {
              set("enabled", e.target.checked);
            } })),
            h(C.Field, { h, label: "\u89E6\u53D1\u7C7B\u578B" }, h(
              "select",
              { className: "wba-input", value: f.kind, onChange: function(e) {
                set("kind", e.target.value);
              } },
              [["interval", "\u56FA\u5B9A\u95F4\u9694"], ["dailyAt", "\u6BCF\u5929\u56FA\u5B9A\u65F6\u95F4"], ["event", "\u57DF\u4E8B\u4EF6"], ["manual", "\u624B\u52A8"]].map(function(x) {
                return h("option", { key: x[0], value: x[0] }, x[1]);
              })
            )),
            h(C.Field, { h, label: "action" }, h(
              "select",
              { className: "wba-input", value: f.actionName, onChange: function(e) {
                set("actionName", e.target.value);
              } },
              (opts.data && opts.data.actions || [f.actionName]).map(function(a) {
                return h("option", { key: a, value: a }, a);
              })
            ))
          ),
          f.kind === "interval" ? h(C.Field, { h, label: "\u6BCF\u51E0\u5206\u949F\uFF081\u201310080\uFF09" }, h("input", { className: "wba-input", type: "number", value: f.everyMinutes, onChange: function(e) {
            set("everyMinutes", e.target.value);
          } })) : null,
          f.kind === "dailyAt" ? h(
            "div",
            { className: "wba-grid" },
            h(C.Field, { h, label: "\u65F6\u95F4 HH:MM" }, h("input", { className: "wba-input", value: f.time, onChange: function(e) {
              set("time", e.target.value);
            } })),
            h(C.Field, { h, label: "\u65F6\u533A" }, h("input", { className: "wba-input", value: f.tz, onChange: function(e) {
              set("tz", e.target.value);
            } })),
            h(C.Field, { h, label: "\u661F\u671F\uFF081\u20137\uFF0C\u9017\u53F7\u5206\u9694\uFF09" }, h("input", { className: "wba-input", value: f.weekdays, onChange: function(e) {
              set("weekdays", e.target.value);
            } }))
          ) : null,
          f.kind === "event" ? h(
            "div",
            { className: "wba-grid" },
            h(C.Field, { h, label: "\u57DF id" }, h("input", { className: "wba-input", value: f.domainId, onChange: function(e) {
              set("domainId", e.target.value);
            }, placeholder: "wb-addon-connector" })),
            h(C.Field, { h, label: "\u4E8B\u4EF6\u540D" }, h("input", { className: "wba-input", value: f.event, onChange: function(e) {
              set("event", e.target.value);
            }, placeholder: "item.created" }))
          ) : null,
          h(C.Field, { h, label: "action \u53C2\u6570\uFF08JSON\uFF0C\u652F\u6301 {{event.field}} / {{item.field}}\uFF09" }, h("textarea", { className: "wba-input wba-code", rows: 8, value: f.actionArgs, onChange: function(e) {
            set("actionArgs", e.target.value);
          } })),
          h(C.Field, { h, label: "\u6761\u4EF6\uFF08\u53EF\u9009 JSON\uFF1A{field,op,value}\uFF09" }, h("textarea", { className: "wba-input wba-code", rows: 4, value: f.condition, onChange: function(e) {
            set("condition", e.target.value);
          } })),
          h(
            "div",
            { className: "wba-row" },
            h(C.Btn, { h, kind: "primary", onClick: save, disabled: busy[0] }, "\u4FDD\u5B58"),
            h(C.Btn, { h, onClick: function() {
              form[1](null);
            } }, "\u53D6\u6D88")
          )
        ) : null
      );
    };
  }
});

// packages/addons/automation/client/views/runs.cjs
var require_runs = __commonJS({
  "packages/addons/automation/client/views/runs.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    module2.exports = function RunsView(props) {
      var h = props.h, api = props.api, React = props.React;
      var ruleId = React.useState("");
      var sel = React.useState(null);
      var page = React.useState(0);
      var list = C.useLoad(React, api, "automation.runList", { ruleId: ruleId[0] || void 0, limit: 100 }, [ruleId[0], page[0]]);
      var rules = C.useLoad(React, api, "automation.ruleList", {}, []);
      var rows = list.data && list.data.items || [];
      return h(
        "div",
        { className: "wba-wrap" },
        h("div", { className: "wba-head" }, h("h2", null, "\u8FD0\u884C\u8BB0\u5F55"), h(C.Btn, { h, onClick: list.refresh }, "\u5237\u65B0")),
        h(
          "div",
          { className: "wba-row" },
          h(
            C.Field,
            { h, label: "\u6309\u89C4\u5219\u7B5B\u9009" },
            h(
              "select",
              { className: "wba-input", value: ruleId[0], onChange: function(e) {
                ruleId[1](e.target.value);
              } },
              h("option", { value: "" }, "\u5168\u90E8\u89C4\u5219"),
              (rules.data && rules.data.items || []).map(function(r) {
                return h("option", { key: r.id, value: r.id }, r.name);
              })
            )
          )
        ),
        list.error ? h(C.Notice, { h, kind: "error", text: list.error }) : null,
        rows.length === 0 && !list.loading ? h(C.Empty, { h, text: "\u8FD8\u6CA1\u6709\u8FD0\u884C\u8BB0\u5F55" }) : null,
        h(
          "div",
          { className: "wba-table-wrap" },
          h(
            "table",
            { className: "wba-table" },
            h("thead", null, h("tr", null, ["\u89C4\u5219", "\u89E6\u53D1", "\u72B6\u6001", "\u5F00\u59CB", "\u8017\u65F6", "\u7ED3\u679C"].map(function(x) {
              return h("th", { key: x }, x);
            }))),
            h("tbody", null, rows.map(function(r) {
              var rule = (rules.data && rules.data.items || []).filter(function(x) {
                return x.id === r.ruleId;
              })[0];
              return h(
                "tr",
                { key: r.id, onClick: function() {
                  sel[1](r);
                } },
                h("td", null, rule ? rule.name : r.ruleId),
                h("td", null, r.trigger),
                h("td", null, h(C.Pill, { h, kind: r.status === "ok" ? "ok" : r.status === "error" ? "error" : "" }, r.status)),
                h("td", null, C.fmtTime(r.startedAt, props.lang)),
                h("td", null, r.finishedAt ? ((r.finishedAt - r.startedAt) / 1e3).toFixed(1) + "s" : "\u2014"),
                h("td", { className: "wba-ellipsis" }, r.error || r.result || "\u2014")
              );
            }))
          )
        ),
        sel[0] ? h(
          "div",
          { className: "wba-panel" },
          h("div", { className: "wba-head" }, h("h3", null, "\u8FD0\u884C\u8BE6\u60C5"), h(C.Btn, { h, onClick: function() {
            sel[1](null);
          } }, "\u5173\u95ED")),
          h("div", { className: "wba-kv" }, h("b", null, "id"), h("code", null, sel[0].id), h("b", null, "\u9519\u8BEF"), h("span", null, sel[0].error || "\u2014")),
          h(C.Json, { h, value: sel[0] })
        ) : null
      );
    };
  }
});

// packages/addons/automation/client/views/config.cjs
var require_config = __commonJS({
  "packages/addons/automation/client/views/config.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    module2.exports = function ConfigView(props) {
      var h = props.h, api = props.api, React = props.React;
      var st = C.useLoad(React, api, "automation.configGet", {}, []);
      var form = React.useState(null);
      var msg = React.useState("");
      React.useEffect(function() {
        if (st.data) form[1]({ maxRules: st.data.maxRules, perHour: st.data.perHour });
      }, [st.data]);
      var f = form[0];
      function set(k, v) {
        form[1](Object.assign({}, f, (function() {
          var o = {};
          o[k] = v;
          return o;
        })()));
      }
      function save() {
        C.call(api, "automation.configSet", { maxRules: Number(f.maxRules), perHour: Number(f.perHour) }).then(function() {
          msg[1]("\u5DF2\u4FDD\u5B58");
          st.refresh();
        }).catch(function(e) {
          msg[1](C.errText(e));
        });
      }
      if (st.loading) return h("div", { className: "wba-wrap" }, "\u52A0\u8F7D\u4E2D\u2026");
      return h(
        "div",
        { className: "wba-wrap" },
        h("h2", null, "\u8BBE\u7F6E"),
        st.error ? h(C.Notice, { h, kind: "error", text: st.error }) : null,
        h(C.Notice, { h, text: msg[0] }),
        f ? h(
          "div",
          { className: "wba-panel" },
          h(
            "div",
            { className: "wba-grid" },
            h(C.Field, { h, label: "\u89C4\u5219\u6570\u91CF\u4E0A\u9650\uFF081\u2013500\uFF09" }, h("input", { className: "wba-input", type: "number", value: f.maxRules, onChange: function(e) {
              set("maxRules", e.target.value);
            } })),
            h(C.Field, { h, label: "\u6BCF\u89C4\u5219\u6BCF\u5C0F\u65F6\u4E0A\u9650\uFF081\u2013600\uFF09" }, h("input", { className: "wba-input", type: "number", value: f.perHour, onChange: function(e) {
              set("perHour", e.target.value);
            } }))
          ),
          h(C.Btn, { h, kind: "primary", onClick: save }, "\u4FDD\u5B58")
        ) : null,
        h(
          "div",
          { className: "wba-panel" },
          h("h3", null, "\u8FD0\u884C\u7EA6\u675F"),
          h("p", null, "\u5B9A\u65F6\u5668\u6BCF 30 \u79D2\u68C0\u67E5\u4E00\u6B21\uFF0C\u5355\u6B21\u6700\u591A\u6267\u884C 3 \u6761\u5230\u671F\u89C4\u5219\uFF1B\u5168\u5C40\u5E76\u53D1 2\uFF0C\u8D85\u51FA\u7684\u5B9A\u65F6\u89E6\u53D1\u8BB0 skipped\u3002"),
          h("p", null, "\u4E8B\u4EF6\u89E6\u53D1\u7531\u5BBF\u4E3B domain-event \u9A71\u52A8\uFF0C\u8BA2\u9605 payload \u4E3A {domainId,event,data}\uFF1Bconnector \u7684 item.created \u5E26 sourceId \u4E0E item \u6458\u8981\uFF0C\u4E0D\u542B\u6B63\u6587\u539F\u6587\u3002"),
          h("p", null, "\u89C4\u5219\u53EF\u4EE5\u88AB\u5907\u4EFD\u5BFC\u5165\u5BFC\u51FA\uFF0C\u8FD0\u884C\u8BB0\u5F55\u53EA\u5728\u672C\u673A\u3002")
        ),
        h(
          "div",
          { className: "wba-panel" },
          h("h3", null, "\u793A\u4F8B"),
          h("p", null, "\u6BCF 60 \u5206\u949F\u8C03\u7528 message.send\uFF1B\u53C2\u6570 title \u56FA\u5B9A\uFF0Cbody \u7528 {{rule.name}}\u3002"),
          h("p", null, "\u4E8B\u4EF6\u89C4\u5219\uFF1A\u57DF wb-addon-connector\u3001\u4E8B\u4EF6 item.created\uFF0Caction message.send\uFF0C\u53C2\u6570 title \u7528 {{item.title}}\uFF0Curl \u7528 {{item.url}}\u3002")
        )
      );
    };
  }
});

// packages/addons/automation/client/views/data.cjs
var require_data = __commonJS({
  "packages/addons/automation/client/views/data.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    module2.exports = function DataView(props) {
      var h = props.h, api = props.api, React = props.React;
      var meta = C.useLoad(React, api, "automation.dataTables", {}, []);
      var table = React.useState("");
      var limit = React.useState(50);
      var offset = React.useState(0);
      var q = C.useLoad(React, api, "automation.dataQuery", { table: table[0] || "automation_rule", limit: limit[0], offset: offset[0] }, [table[0], limit[0], offset[0]]);
      var tables = meta.data && meta.data.tables || [];
      var rows = q.data && q.data.rows || [];
      var cols = rows.length ? Object.keys(rows[0]) : meta.data && meta.data.columns && meta.data.columns[table[0] || "automation_rule"] || [];
      return h(
        "div",
        { className: "wba-wrap" },
        h("div", { className: "wba-head" }, h("h2", null, "\u6570\u636E"), h(C.Btn, { h, onClick: q.refresh }, "\u5237\u65B0")),
        h(C.Notice, { h, kind: "info", text: "\u53EA\u8BFB\u767D\u540D\u5355\u5217\uFF0C\u6309 rowid \u5012\u5E8F\uFF1B\u4E0D\u63A5\u53D7\u4EFB\u610F SQL\u3002" }),
        h(
          "div",
          { className: "wba-row" },
          h(C.Field, { h, label: "\u8868" }, h(
            "select",
            { className: "wba-input", value: table[0], onChange: function(e) {
              table[1](e.target.value);
              offset[1](0);
            } },
            [""].concat(tables).map(function(t) {
              return h("option", { key: t || "none", value: t }, t || "\u9009\u62E9\u8868");
            })
          )),
          h(C.Field, { h, label: "limit" }, h("input", { className: "wba-input", type: "number", value: limit[0], onChange: function(e) {
            limit[1](Number(e.target.value) || 50);
          } })),
          h(C.Field, { h, label: "offset" }, h("input", { className: "wba-input", type: "number", value: offset[0], onChange: function(e) {
            offset[1](Number(e.target.value) || 0);
          } }))
        ),
        q.error ? h(C.Notice, { h, kind: "error", text: q.error }) : null,
        h(
          "div",
          { className: "wba-table-wrap" },
          h(
            "table",
            { className: "wba-table" },
            h("thead", null, h("tr", null, cols.map(function(c) {
              return h("th", { key: c }, c);
            }))),
            h("tbody", null, rows.map(function(r, i) {
              return h("tr", { key: i }, cols.map(function(c) {
                return h("td", { key: c }, r[c] == null ? "\u2014" : String(r[c]));
              }));
            }))
          )
        )
      );
    };
  }
});

// packages/addons/automation/client/views/actions.cjs
var require_actions = __commonJS({
  "packages/addons/automation/client/views/actions.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    module2.exports = function ActionsView(props) {
      var h = props.h, api = props.api, React = props.React;
      var st = C.useLoad(React, api, "automation.actionSchema", {}, []);
      var opts = C.useLoad(React, api, "automation.actionOptions", {}, []);
      var names = st.data && st.data.actions || [];
      return h(
        "div",
        { className: "wba-wrap" },
        h("div", { className: "wba-head" }, h("h2", null, "Action"), h(C.Btn, { h, onClick: st.refresh }, "\u5237\u65B0")),
        h(C.Notice, { h, kind: "info", text: "\u6E05\u5355\u7531 automation.actionSchema \u81EA\u8BC1\uFF0C\u4E0D\u8BFB\u5BBF\u4E3B schema \u63A5\u53E3\u3002" }),
        st.error ? h(C.Notice, { h, kind: "error", text: st.error }) : null,
        h(
          "div",
          { className: "wba-panel" },
          h("h3", null, "\u53EF\u88AB\u89C4\u5219\u8C03\u7528"),
          h("div", { className: "wba-pills" }, (opts.data && opts.data.actions || []).map(function(a) {
            return h(C.Pill, { h, key: a, kind: "ok" }, a);
          }))
        ),
        h(
          "div",
          { className: "wba-panel" },
          h("h3", null, "\u5DF2\u6CE8\u518C action\uFF08" + names.length + "\uFF09"),
          h("ul", { className: "wba-list" }, names.map(function(n) {
            return h("li", { key: n }, h("code", null, n));
          }))
        )
      );
    };
  }
});

// packages/addons/automation/client/client.src.cjs
(function() {
  var root = typeof window !== "undefined" ? window : null;
  var host = root && root.__WB_HOST__;
  if (!host || !host.react) {
    if (typeof console !== "undefined") console.error("[dsh-workbench-automation] \u5BBF\u4E3B\u524D\u7AEF\u672A\u5C31\u7EEA");
    module.exports = { name: "dsh-workbench-automation", inject: [], apply: function() {
    } };
    return;
  }
  var React = host.react;
  var h = host.h;
  var CSS = require_styles();
  var ICONS = {
    activity: (init_activity(), __toCommonJS(activity_exports)).default,
    zap: (init_zap(), __toCommonJS(zap_exports)).default,
    history: (init_history(), __toCommonJS(history_exports)).default,
    sliders: (init_sliders_horizontal(), __toCommonJS(sliders_horizontal_exports)).default,
    database: (init_database(), __toCommonJS(database_exports)).default,
    list: (init_list(), __toCommonJS(list_exports)).default
  };
  function Icon2(props) {
    var C = ICONS[props.name] || ICONS.zap;
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
    if (document.getElementById("wb-automation-style")) return;
    var style = document.createElement("style");
    style.id = "wb-automation-style";
    style.textContent = CSS;
    document.head.appendChild(style);
  }
  ensureStyles();
  host.registerAddon({
    id: "wb-addon-automation",
    version: "0.1.0",
    icon: (init_zap(), __toCommonJS(zap_exports)).default,
    views: [
      { id: "stats", icon: tabIcon("activity"), title: { zh: "\u6982\u89C8", en: "Overview" }, component: withProps(require_stats(), "\u6982\u89C8") },
      { id: "rules", icon: tabIcon("zap"), title: { zh: "\u89C4\u5219", en: "Rules" }, component: withProps(require_rules(), "\u89C4\u5219") },
      { id: "runs", icon: tabIcon("history"), title: { zh: "\u8FD0\u884C\u8BB0\u5F55", en: "Runs" }, component: withProps(require_runs(), "\u8FD0\u884C\u8BB0\u5F55") },
      { id: "config", icon: tabIcon("sliders"), title: { zh: "\u8BBE\u7F6E", en: "Settings" }, component: withProps(require_config(), "\u8BBE\u7F6E") },
      { id: "data", icon: tabIcon("database"), title: { zh: "\u6570\u636E", en: "Data" }, component: withProps(require_data(), "\u6570\u636E") },
      { id: "actions", icon: tabIcon("list"), title: { zh: "Action", en: "Actions" }, component: withProps(require_actions(), "Action") }
    ]
  });
  module.exports = { name: "dsh-workbench-automation", inject: [], apply: function() {
  } };
})();
    return module.exports;
  },
});
