// 由 scripts/build-addon-clients.mjs 生成；请修改对应 client/client.src.cjs 后重新构建。
window.__ModuleLoader__ = window.__ModuleLoader__ || { modules: {}, load: function (m) { this.modules[m.id] = m.factory; } };
window.__ModuleLoader__.load({
  id: "dsh-workbench-calendar",
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

// packages/addons/calendar/client/ui/styles.cjs
var require_styles = __commonJS({
  "packages/addons/calendar/client/ui/styles.cjs"(exports2, module2) {
    "use strict";
    module2.exports = [
      ".wbca-wrap{display:flex;flex-direction:column;gap:12px;padding:16px;overflow:auto;height:100%;box-sizing:border-box}",
      ".wbca-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}",
      ".wbca-title{font-size:16px;font-weight:650;margin:0}",
      ".wbca-sub{font-size:12px;color:var(--wb-muted,#6b7280);margin:2px 0 0}",
      ".wbca-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}",
      ".wbca-card{border:1px solid var(--wb-border,#e5e7eb);border-radius:10px;background:var(--wb-surface,#fff);padding:12px}",
      ".wbca-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}",
      ".wbca-kpi{font-size:22px;font-weight:700;line-height:1.2}.wbca-kpi-label{font-size:12px;color:var(--wb-muted,#6b7280)}",
      ".wbca-table{width:100%;border-collapse:collapse;font-size:12px}.wbca-table th,.wbca-table td{padding:7px 8px;border-bottom:1px solid var(--wb-border,#eef0f3);text-align:left;vertical-align:top}",
      ".wbca-table th{font-weight:600;color:var(--wb-muted,#6b7280);white-space:nowrap}",
      ".wbca-btn{border:1px solid var(--wb-border,#d1d5db);background:var(--wb-surface,#fff);color:inherit;border-radius:7px;padding:5px 10px;font-size:12px;cursor:pointer}",
      ".wbca-btn:hover:not(:disabled){border-color:var(--wb-accent,#2563eb)}.wbca-btn:disabled{opacity:.5;cursor:default}",
      ".wbca-btn.primary{background:var(--wb-accent,#2563eb);border-color:var(--wb-accent,#2563eb);color:#fff}",
      ".wbca-btn.danger{color:#b91c1c;border-color:#fecaca}",
      ".wbca-field{display:flex;flex-direction:column;gap:4px;font-size:12px}.wbca-label{font-weight:600}",
      ".wbca-field input,.wbca-field select,.wbca-field textarea{border:1px solid var(--wb-border,#d1d5db);border-radius:7px;padding:6px 8px;font:inherit;background:var(--wb-surface,#fff);color:inherit;min-width:0}",
      ".wbca-hint{color:var(--wb-muted,#6b7280);font-size:11px}.wbca-notice{padding:8px 10px;border-radius:8px;font-size:12px;background:#eff6ff;color:#1e40af}",
      ".wbca-notice.error{background:#fef2f2;color:#b91c1c}.wbca-notice.ok{background:#ecfdf5;color:#047857}",
      ".wbca-empty{padding:18px;text-align:center;color:var(--wb-muted,#6b7280);font-size:12px;border:1px dashed var(--wb-border,#e5e7eb);border-radius:8px}",
      ".wbca-pill{display:inline-block;padding:1px 7px;border-radius:999px;font-size:11px;background:#f3f4f6;color:#374151}",
      ".wbca-pill.ok{background:#ecfdf5;color:#047857}.wbca-pill.error{background:#fef2f2;color:#b91c1c}.wbca-pill.warn{background:#fffbeb;color:#b45309}",
      ".wbca-json{margin:0;padding:8px;background:#f8fafc;border-radius:8px;font-size:11px;max-height:240px;overflow:auto}",
      ".wbca-muted{color:var(--wb-muted,#6b7280)}.wbca-link{color:var(--wb-accent,#2563eb);cursor:pointer;text-decoration:none}",
      ".wbca-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}",
      ".wbca-page{display:flex;flex-direction:column;gap:12px;padding:16px;overflow:auto;height:100%;box-sizing:border-box}",
      ".wbca-input{border:1px solid var(--wb-border,#d1d5db);border-radius:7px;padding:6px 8px;font:inherit;background:var(--wb-surface,#fff);color:inherit;min-width:120px}",
      ".wbca-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}",
      ".wbca-list{display:flex;flex-direction:column;gap:2px}",
      ".wbca-list-row{display:flex;align-items:center;gap:10px;padding:8px;border-bottom:1px solid var(--wb-border,#eef0f3)}",
      ".wbca-main{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}",
      ".wbca-time{font-variant-numeric:tabular-nums;font-size:12px;color:var(--wb-muted,#6b7280);min-width:44px}",
      ".wbca-dot{width:9px;height:9px;border-radius:50%;background:#11a89b;flex:none}",
      ".wbca-big{font-size:22px;font-weight:700}",
      ".wbca-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}",
      ".wbca-group h3{font-size:12px;color:var(--wb-muted,#6b7280);margin:10px 0 2px}",
      ".wbca-icon-btn{border:0;background:transparent;color:var(--wb-muted,#6b7280);font-size:16px;line-height:1;cursor:pointer;padding:2px 6px;border-radius:6px}",
      ".wbca-icon-btn:hover{background:#fef2f2;color:#b91c1c}",
      ".wbca-ul{margin:6px 0 0;padding-left:18px;font-size:12px;line-height:1.7}"
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

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/calendar-days.mjs
var calendar_days_exports = {};
__export(calendar_days_exports, {
  __iconData: () => __iconData,
  default: () => CalendarDays
});
var __iconData, CalendarDays;
var init_calendar_days = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/calendar-days.mjs"() {
    init_createLucideIcon();
    __iconData = {
      name: "calendar-days",
      size: 24,
      node: [
        ["path", { d: "M8 2v3", key: "1ioesn" }],
        ["path", { d: "M16 2v3", key: "otl347" }],
        ["rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", key: "h1oib" }],
        ["path", { d: "M3 9h18", key: "1pudct" }],
        ["path", { d: "M8 13h.01", key: "1sbv64" }],
        ["path", { d: "M12 13h.01", key: "y0uutt" }],
        ["path", { d: "M16 13h.01", key: "wip0gl" }],
        ["path", { d: "M8 17h.01", key: "p3bg7i" }],
        ["path", { d: "M12 17h.01", key: "p32p05" }],
        ["path", { d: "M16 17h.01", key: "ql8jdd" }]
      ]
    };
    __iconData.node;
    CalendarDays = createLucideIcon(__iconData);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/calendar.mjs
var calendar_exports = {};
__export(calendar_exports, {
  __iconData: () => __iconData2,
  default: () => Calendar
});
var __iconData2, Calendar;
var init_calendar = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/calendar.mjs"() {
    init_createLucideIcon();
    __iconData2 = {
      name: "calendar",
      size: 24,
      node: [
        ["path", { d: "M8 2v3", key: "1ioesn" }],
        ["path", { d: "M16 2v3", key: "otl347" }],
        ["rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", key: "h1oib" }],
        ["path", { d: "M3 9h18", key: "1pudct" }]
      ]
    };
    __iconData2.node;
    Calendar = createLucideIcon(__iconData2);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/sliders-horizontal.mjs
var sliders_horizontal_exports = {};
__export(sliders_horizontal_exports, {
  __iconData: () => __iconData3,
  default: () => SlidersHorizontal
});
var __iconData3, SlidersHorizontal;
var init_sliders_horizontal = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/sliders-horizontal.mjs"() {
    init_createLucideIcon();
    __iconData3 = {
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
    __iconData3.node;
    SlidersHorizontal = createLucideIcon(__iconData3);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/database.mjs
var database_exports = {};
__export(database_exports, {
  __iconData: () => __iconData4,
  default: () => Database
});
var __iconData4, Database;
var init_database = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/database.mjs"() {
    init_createLucideIcon();
    __iconData4 = {
      name: "database",
      size: 24,
      node: [
        ["ellipse", { cx: "12", cy: "5", rx: "9", ry: "3", key: "msslwz" }],
        ["path", { d: "M3 5V19A9 3 0 0 0 21 19V5", key: "1wlel7" }],
        ["path", { d: "M3 12A9 3 0 0 0 21 12", key: "mv7ke4" }]
      ]
    };
    __iconData4.node;
    Database = createLucideIcon(__iconData4);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/list.mjs
var list_exports = {};
__export(list_exports, {
  __iconData: () => __iconData5,
  default: () => List
});
var __iconData5, List;
var init_list = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/list.mjs"() {
    init_createLucideIcon();
    __iconData5 = {
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
    __iconData5.node;
    List = createLucideIcon(__iconData5);
  }
});

// packages/addons/calendar/client/ui/common.cjs
var require_common = __commonJS({
  "packages/addons/calendar/client/ui/common.cjs"(exports2, module2) {
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
      return h("button", { type: props.type || "button", className: "wbca-btn" + (props.kind ? " " + props.kind : ""), disabled: props.disabled, onClick: props.onClick, title: props.title }, props.children);
    }
    function Field(props) {
      var h = props.h;
      return h("label", { className: "wbca-field" }, h("span", { className: "wbca-label" }, props.label), props.children, props.hint ? h("span", { className: "wbca-hint" }, props.hint) : null);
    }
    function Notice(props) {
      var h = props.h;
      if (!props.text) return null;
      return h("div", { className: "wbca-notice " + (props.kind || "info") }, props.text);
    }
    function Empty(props) {
      var h = props.h;
      return h("div", { className: "wbca-empty" }, props.text || "\u6682\u65E0\u6570\u636E");
    }
    function Pill(props) {
      var h = props.h;
      return h("span", { className: "wbca-pill " + (props.kind || "") }, props.children);
    }
    function Json(props) {
      var h = props.h;
      var t;
      try {
        t = JSON.stringify(props.value, null, 2);
      } catch (e) {
        t = String(props.value);
      }
      return h("pre", { className: "wbca-json" }, t);
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

// packages/addons/calendar/client/views/events.cjs
var require_events = __commonJS({
  "packages/addons/calendar/client/views/events.cjs"(exports2, module2) {
    "use strict";
    module2.exports = function Events(props) {
      var h = props.h, React = props.React, api = props.api, lang = props.lang;
      var C = require_common();
      var now = Date.now();
      var load = C.useLoad(React, api, "calendar.eventsBetween", { from: now - 864e5, to: now + 14 * 864e5, limit: 200 }, []);
      var st = React.useState({ open: false, title: "", start: "", duration: 60, location: "", attendees: "" });
      var form = st[0], setForm = st[1];
      var msg = React.useState(null);
      function set(k, v) {
        setForm(Object.assign({}, form, { [k]: v }));
      }
      function openForm() {
        var d = new Date(Date.now() + 864e5);
        d.setHours(10, 0, 0, 0);
        var local = new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
        setForm({ open: true, title: "", start: local, duration: 60, location: "", attendees: "" });
      }
      function submit() {
        if (!form.title.trim()) {
          msg[1]({ kind: "error", text: "\u6807\u9898\u4E0D\u80FD\u4E3A\u7A7A" });
          return;
        }
        var startAt = new Date(form.start).getTime();
        if (!Number.isFinite(startAt)) {
          msg[1]({ kind: "error", text: "\u5F00\u59CB\u65F6\u95F4\u4E0D\u5408\u6CD5" });
          return;
        }
        var attendees = form.attendees.split(/[,，;；\n]/).map(function(s) {
          return s.trim();
        }).filter(Boolean).map(function(email) {
          return { email };
        });
        C.call(api, "calendar.eventCreate", { title: form.title.trim(), startAt, endAt: startAt + Number(form.duration || 60) * 6e4, location: form.location, attendees }).then(function() {
          msg[1]({ kind: "ok", text: "\u5DF2\u521B\u5EFA" });
          setForm(Object.assign({}, form, { open: false }));
          load.refresh();
        }).catch(function(e) {
          msg[1]({ kind: "error", text: C.errText(e) });
        });
      }
      function remove(id) {
        C.call(api, "calendar.eventDelete", { id }).then(function() {
          load.refresh();
        }).catch(function(e) {
          msg[1]({ kind: "error", text: C.errText(e) });
        });
      }
      var items = load.data && load.data.items || [];
      var groups = {};
      items.forEach(function(ev) {
        var k = new Date(ev.startAt).toLocaleDateString(lang === "en" ? "en-US" : "zh-CN", { month: "short", day: "numeric", weekday: "short" });
        (groups[k] = groups[k] || []).push(ev);
      });
      return h(
        "div",
        { className: "wbca-page" },
        h("div", { className: "wbca-head" }, h("div", null, h("h2", null, "\u65E5\u7A0B"), h("p", { className: "wbca-sub" }, "\u8FD1 14 \u5929\uFF1B\u63D0\u9192\u901A\u8FC7\u6D88\u606F\u63D2\u4EF6\u53D1\u9001")), h(C.Btn, { h, kind: "primary", onClick: openForm }, "\u65B0\u5EFA\u4E8B\u4EF6")),
        h(C.Notice, { h, text: msg[0] && msg[0].text, kind: msg[0] && msg[0].kind }),
        form.open ? h(
          "div",
          { className: "wbca-card" },
          h(C.Field, { h, label: "\u6807\u9898" }, h("input", { className: "wbca-input", value: form.title, onChange: function(e) {
            set("title", e.target.value);
          } })),
          h(
            "div",
            { className: "wbca-row" },
            h(C.Field, { h, label: "\u5F00\u59CB" }, h("input", { className: "wbca-input", type: "datetime-local", value: form.start, onChange: function(e) {
              set("start", e.target.value);
            } })),
            h(C.Field, { h, label: "\u65F6\u957F\uFF08\u5206\u949F\uFF09" }, h("input", { className: "wbca-input", type: "number", min: 5, max: 1440, value: form.duration, onChange: function(e) {
              set("duration", e.target.value);
            } }))
          ),
          h(C.Field, { h, label: "\u5730\u70B9" }, h("input", { className: "wbca-input", value: form.location, onChange: function(e) {
            set("location", e.target.value);
          } })),
          h(C.Field, { h, label: "\u53C2\u4E0E\u4EBA", hint: "\u90AE\u7BB1\uFF0C\u7528\u9017\u53F7\u5206\u9694" }, h("input", { className: "wbca-input", value: form.attendees, onChange: function(e) {
            set("attendees", e.target.value);
          } })),
          h("div", { className: "wbca-actions" }, h(C.Btn, { h, kind: "primary", onClick: submit }, "\u4FDD\u5B58"), h(C.Btn, { h, onClick: function() {
            set("open", false);
          } }, "\u53D6\u6D88"))
        ) : null,
        load.loading ? h(C.Empty, { h, text: "\u52A0\u8F7D\u4E2D\u2026" }) : load.error ? h(C.Notice, { h, kind: "error", text: load.error }) : items.length === 0 ? h(C.Empty, { h, text: "\u8FD9\u6BB5\u65F6\u95F4\u6CA1\u6709\u5B89\u6392" }) : Object.keys(groups).map(function(day) {
          return h("section", { key: day, className: "wbca-group" }, h("h3", null, day), groups[day].map(function(ev) {
            return h("div", { key: ev.id, className: "wbca-list-row" }, h("div", { className: "wbca-time" }, new Date(ev.startAt).toLocaleTimeString(lang === "en" ? "en-US" : "zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false })), h("div", { className: "wbca-main" }, h("strong", null, ev.title), h("span", { className: "wbca-muted" }, [ev.location, ev.attendees ? ev.attendees.length + " \u4EBA" : ""].filter(Boolean).join(" \xB7 "))), h("button", { type: "button", className: "wbca-icon-btn", title: "\u5220\u9664", onClick: function() {
              remove(ev.id);
            } }, "\xD7"));
          }));
        })
      );
    };
  }
});

// packages/addons/calendar/client/views/calendars.cjs
var require_calendars = __commonJS({
  "packages/addons/calendar/client/views/calendars.cjs"(exports2, module2) {
    "use strict";
    module2.exports = function Calendars(props) {
      var h = props.h, React = props.React, api = props.api;
      var C = require_common();
      var load = C.useLoad(React, api, "calendar.calendarList", {}, []);
      var name = React.useState("");
      var msg = React.useState(null);
      function add() {
        if (!name[0].trim()) return;
        C.call(api, "calendar.calendarCreate", { name: name[0].trim() }).then(function() {
          name[1]("");
          load.refresh();
        }).catch(function(e) {
          msg[1]({ kind: "error", text: C.errText(e) });
        });
      }
      function del(id) {
        C.call(api, "calendar.calendarDelete", { id }).then(function() {
          load.refresh();
        }).catch(function(e) {
          msg[1]({ kind: "error", text: C.errText(e) });
        });
      }
      var items = load.data && load.data.items || [];
      return h(
        "div",
        { className: "wbca-page" },
        h("div", { className: "wbca-head" }, h("div", null, h("h2", null, "\u65E5\u5386"), h("p", { className: "wbca-sub" }, "\u672C\u5730\u65E5\u5386\uFF1B\u4E8B\u4EF6\u9ED8\u8BA4\u5199\u5165\u7B2C\u4E00\u4E2A")), null),
        h("div", { className: "wbca-row" }, h("input", { className: "wbca-input", placeholder: "\u65B0\u65E5\u5386\u540D\u79F0", value: name[0], onChange: function(e) {
          name[1](e.target.value);
        }, onKeyDown: function(e) {
          if (e.key === "Enter") add();
        } }), h(C.Btn, { h, kind: "primary", onClick: add }, "\u6DFB\u52A0")),
        h(C.Notice, { h, text: msg[0] && msg[0].text, kind: msg[0] && msg[0].kind }),
        load.loading ? h(C.Empty, { h, text: "\u52A0\u8F7D\u4E2D\u2026" }) : load.error ? h(C.Notice, { h, kind: "error", text: load.error }) : items.length === 0 ? h(C.Empty, { h, text: "\u8FD8\u6CA1\u6709\u65E5\u5386" }) : h("div", { className: "wbca-list" }, items.map(function(c) {
          return h("div", { key: c.id, className: "wbca-list-row" }, h("span", { className: "wbca-dot", style: { background: c.color || "#11a89b" } }), h("div", { className: "wbca-main" }, h("strong", null, c.name), h("span", { className: "wbca-muted" }, c.tz)), h("button", { type: "button", className: "wbca-icon-btn", title: "\u5220\u9664", onClick: function() {
            del(c.id);
          } }, "\xD7"));
        }))
      );
    };
  }
});

// packages/addons/calendar/client/views/config.cjs
var require_config = __commonJS({
  "packages/addons/calendar/client/views/config.cjs"(exports2, module2) {
    "use strict";
    module2.exports = function Config(props) {
      var h = props.h, React = props.React, api = props.api;
      var C = require_common();
      var s = C.useLoad(React, api, "calendar.stats", {}, []);
      return h(
        "div",
        { className: "wbca-page" },
        h("h2", null, "\u8BBE\u7F6E\u4E0E\u8BF4\u660E"),
        s.error ? h(C.Notice, { h, kind: "error", text: s.error }) : h(
          "div",
          { className: "wbca-cards" },
          h("div", { className: "wbca-card" }, h("div", { className: "wbca-muted" }, "\u65E5\u5386"), h("strong", { className: "wbca-big" }, s.data ? s.data.calendars : "\u2014")),
          h("div", { className: "wbca-card" }, h("div", { className: "wbca-muted" }, "\u4E8B\u4EF6"), h("strong", { className: "wbca-big" }, s.data ? s.data.events : "\u2014")),
          h("div", { className: "wbca-card" }, h("div", { className: "wbca-muted" }, "\u672A\u6765 7 \u5929"), h("strong", { className: "wbca-big" }, s.data ? s.data.next7d : "\u2014"))
        ),
        h(
          "div",
          { className: "wbca-card" },
          h("h3", null, "\u8FB9\u754C"),
          h(
            "ul",
            { className: "wbca-ul" },
            h("li", null, "\u53EA\u5728\u672C\u673A\u4FDD\u5B58\uFF0C\u4E0D\u53C2\u4E0E\u4E91\u540C\u6B65\uFF1B\u5907\u4EFD\u5305\u542B\u65E5\u5386\u4E0E\u4E8B\u4EF6\u3002"),
            h("li", null, "RRULE \u53EA\u5B58\u539F\u6587\uFF0C\u4E0D\u5C55\u5F00\u91CD\u590D\u4E8B\u4EF6\u3002"),
            h("li", null, "\u4E0D\u8FDE\u63A5 CalDAV\uFF1B\u9700\u8981\u8FDC\u7AEF\u65E5\u5386\u65F6\u901A\u8FC7\u8FDE\u63A5\u5668\u53E6\u884C\u6269\u5C55\u3002"),
            h("li", null, "\u63D0\u9192\u901A\u8FC7 message.send \u53D1\u9001\uFF0C\u4E0D\u505A\u7CFB\u7EDF\u7EA7\u901A\u77E5\u3002")
          )
        ),
        h("div", { className: "wbca-card" }, h("h3", null, "\u5F53\u524D\u6570\u636E"), h(C.Json, { h, value: s.data || {} }))
      );
    };
  }
});

// packages/addons/calendar/client/views/data.cjs
var require_data = __commonJS({
  "packages/addons/calendar/client/views/data.cjs"(exports2, module2) {
    "use strict";
    module2.exports = function Data(props) {
      var h = props.h, React = props.React, api = props.api;
      var C = require_common();
      var tables = C.useLoad(React, api, "calendar.dataTables", {}, []);
      var table = React.useState("calendar");
      var limit = React.useState(20);
      var rows = C.useLoad(React, api, "calendar.dataQuery", { table: table[0], limit: Number(limit[0]) || 20 }, [table[0], limit[0]]);
      var list = tables.data && tables.data.tables || [];
      return h(
        "div",
        { className: "wbca-page" },
        h("h2", null, "\u6570\u636E\u6D4F\u89C8"),
        h(
          "div",
          { className: "wbca-row" },
          h("select", { className: "wbca-input", value: table[0], onChange: function(e) {
            table[1](e.target.value);
          } }, list.map(function(t) {
            return h("option", { key: t.name, value: t.name }, t.name);
          })),
          h("input", { className: "wbca-input", type: "number", min: 1, max: 100, value: limit[0], onChange: function(e) {
            limit[1](e.target.value);
          } })
        ),
        rows.error ? h(C.Notice, { h, kind: "error", text: rows.error }) : h(C.Json, { h, value: rows.data && rows.data.rows || [] })
      );
    };
  }
});

// packages/addons/calendar/client/views/actions.cjs
var require_actions = __commonJS({
  "packages/addons/calendar/client/views/actions.cjs"(exports2, module2) {
    "use strict";
    module2.exports = function Actions(props) {
      var h = props.h, React = props.React, api = props.api;
      var C = require_common();
      var s = C.useLoad(React, api, "calendar.actionSchema", {}, []);
      var list = s.data && s.data.actions || [];
      return h(
        "div",
        { className: "wbca-page" },
        h("h2", null, "Action \u6E05\u5355"),
        h("p", { className: "wbca-sub" }, "\u8BFB\u53D6 calendar.actionSchema\uFF1B\u5199\u64CD\u4F5C\u4EC5 UI\u3002"),
        s.error ? h(C.Notice, { h, kind: "error", text: s.error }) : h("div", { className: "wbca-list" }, list.map(function(a) {
          return h("div", { key: a.name, className: "wbca-list-row" }, h("div", { className: "wbca-main" }, h("strong", null, a.name), h("span", { className: "wbca-muted" }, a.description || "")));
        }))
      );
    };
  }
});

// packages/addons/calendar/client/client.src.cjs
(function() {
  var root = typeof window !== "undefined" ? window : null;
  var host = root && root.__WB_HOST__;
  if (!host || !host.react) {
    if (typeof console !== "undefined") console.error("[dsh-workbench-calendar] \u5BBF\u4E3B\u524D\u7AEF\u672A\u5C31\u7EEA");
    module.exports = { name: "dsh-workbench-calendar", inject: [], apply: function() {
    } };
    return;
  }
  var React = host.react;
  var h = host.h;
  var CSS = require_styles();
  var ICONS = {
    calendar: (init_calendar_days(), __toCommonJS(calendar_days_exports)).default,
    grid: (init_calendar(), __toCommonJS(calendar_exports)).default,
    sliders: (init_sliders_horizontal(), __toCommonJS(sliders_horizontal_exports)).default,
    database: (init_database(), __toCommonJS(database_exports)).default,
    list: (init_list(), __toCommonJS(list_exports)).default
  };
  function Icon2(props) {
    var C = ICONS[props.name] || ICONS.calendar;
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
    if (document.getElementById("wb-calendar-style")) return;
    var style = document.createElement("style");
    style.id = "wb-calendar-style";
    style.textContent = CSS;
    document.head.appendChild(style);
  }
  ensureStyles();
  host.registerAddon({
    id: "wb-addon-calendar",
    version: "0.1.0",
    views: [
      { id: "events", icon: tabIcon("calendar"), title: { zh: "\u65E5\u7A0B", en: "Agenda" }, component: withProps(require_events(), "\u65E5\u7A0B") },
      { id: "calendars", icon: tabIcon("grid"), title: { zh: "\u65E5\u5386", en: "Calendars" }, component: withProps(require_calendars(), "\u65E5\u5386") },
      { id: "config", icon: tabIcon("sliders"), title: { zh: "\u8BBE\u7F6E", en: "Settings" }, component: withProps(require_config(), "\u8BBE\u7F6E") },
      { id: "data", icon: tabIcon("database"), title: { zh: "\u6570\u636E", en: "Data" }, component: withProps(require_data(), "\u6570\u636E") },
      { id: "actions", icon: tabIcon("list"), title: { zh: "Action", en: "Actions" }, component: withProps(require_actions(), "Action") }
    ]
  });
  module.exports = { name: "dsh-workbench-calendar", inject: [], apply: function() {
  } };
})();
    return module.exports;
  },
});
