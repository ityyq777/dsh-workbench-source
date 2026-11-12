// 由 scripts/build-addon-clients.mjs 生成；请修改对应 client/client.src.cjs 后重新构建。
window.__ModuleLoader__ = window.__ModuleLoader__ || { modules: {}, load: function (m) { this.modules[m.id] = m.factory; } };
window.__ModuleLoader__.load({
  id: "dsh-workbench-vault",
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

// packages/addons/vault/client/ui/styles.cjs
var require_styles = __commonJS({
  "packages/addons/vault/client/ui/styles.cjs"(exports2, module2) {
    "use strict";
    module2.exports = [
      ".wbv{display:flex;flex-direction:column;gap:14px;font-size:13px;min-height:100%;padding:2px}",
      ".wbv h2{font-size:17px;margin:0}.wbv h3{font-size:14px;margin:0}",
      ".wbv-muted{opacity:.62}.wbv-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}",
      ".wbv-grow{flex:1}.wbv-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}",
      ".wbv-card{border:1px solid var(--wb-border,#e5e7eb);border-radius:10px;padding:12px;background:var(--wb-card,#fff)}",
      ".wbv-card h3{margin-bottom:6px}.wbv-kpi{font-size:22px;font-weight:650;line-height:1.2}",
      ".wbv-btn{border:1px solid var(--wb-border,#d1d5db);background:var(--wb-btn,#fff);color:inherit;border-radius:7px;padding:5px 10px;cursor:pointer;font-size:12px;line-height:1.4}",
      ".wbv-btn:hover{border-color:#9ca3af}.wbv-btn:disabled{opacity:.45;cursor:not-allowed}",
      ".wbv-btn.primary{background:#2563eb;border-color:#2563eb;color:#fff}.wbv-btn.danger{color:#b91c1c;border-color:#fecaca}",
      ".wbv-btn.ghost{background:transparent;border-color:transparent;color:#2563eb;padding:2px 4px}",
      ".wbv-field{display:flex;flex-direction:column;gap:4px;min-width:180px;flex:1}",
      ".wbv-label{font-size:11px;font-weight:600;opacity:.75}.wbv-hint{font-size:11px;opacity:.55}",
      ".wbv input,.wbv select,.wbv textarea{border:1px solid var(--wb-border,#d1d5db);border-radius:7px;padding:6px 8px;font:inherit;background:var(--wb-input,#fff);color:inherit;width:100%;box-sizing:border-box}",
      ".wbv input[type=checkbox]{width:auto}",
      ".wbv textarea{min-height:70px;resize:vertical}",
      ".wbv-notice{border-radius:8px;padding:8px 10px;font-size:12px;border:1px solid #bfdbfe;background:#eff6ff;color:#1e3a8a}",
      ".wbv-notice.error{border-color:#fecaca;background:#fef2f2;color:#991b1b}.wbv-notice.ok{border-color:#bbf7d0;background:#f0fdf4;color:#166534}",
      ".wbv-empty{padding:22px;text-align:center;opacity:.55;border:1px dashed var(--wb-border,#d1d5db);border-radius:10px}",
      ".wbv-table{width:100%;border-collapse:collapse;font-size:12px}.wbv-table th,.wbv-table td{text-align:left;padding:7px 8px;border-bottom:1px solid var(--wb-border,#eee);vertical-align:top}",
      ".wbv-table th{font-weight:600;opacity:.65;white-space:nowrap}.wbv-table code{font-size:11px;opacity:.8}",
      ".wbv-pill{display:inline-block;border-radius:999px;padding:1px 8px;font-size:11px;background:#f3f4f6;color:#374151}",
      ".wbv-pill.ok{background:#dcfce7;color:#166534}.wbv-pill.warn{background:#fef3c7;color:#92400e}.wbv-pill.bad{background:#fee2e2;color:#991b1b}",
      ".wbv-tabs{display:flex;gap:6px;flex-wrap:wrap}.wbv-tab{border:none;background:transparent;padding:4px 8px;border-radius:6px;cursor:pointer;font-size:12px}",
      ".wbv-tab.on{background:#eef2ff;color:#3730a3;font-weight:600}",
      ".wbv-secret{font-family:ui-monospace,Menlo,Consolas,monospace;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:6px 8px;word-break:break-all}",
      ".wbv-inline{display:flex;gap:6px;align-items:center}",
      ".wbv-modal{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;z-index:50;padding:18px}",
      ".wbv-modal-box{background:var(--wb-card,#fff);border-radius:12px;padding:16px;width:min(440px,100%);display:flex;flex-direction:column;gap:10px;box-shadow:0 12px 40px rgba(0,0,0,.2)}",
      ".wbv-code{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;white-space:pre-wrap;word-break:break-word;background:#f9fafb;border-radius:8px;padding:10px;max-height:320px;overflow:auto}"
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

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/shield.mjs
var shield_exports = {};
__export(shield_exports, {
  __iconData: () => __iconData,
  default: () => Shield
});
var __iconData, Shield;
var init_shield = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/shield.mjs"() {
    init_createLucideIcon();
    __iconData = {
      name: "shield",
      size: 24,
      node: [
        [
          "path",
          {
            d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
            key: "oel41y"
          }
        ]
      ]
    };
    __iconData.node;
    Shield = createLucideIcon(__iconData);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/key-round.mjs
var key_round_exports = {};
__export(key_round_exports, {
  __iconData: () => __iconData2,
  default: () => KeyRound
});
var __iconData2, KeyRound;
var init_key_round = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/key-round.mjs"() {
    init_createLucideIcon();
    __iconData2 = {
      name: "key-round",
      size: 24,
      node: [
        [
          "path",
          {
            d: "M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z",
            key: "1s6t7t"
          }
        ],
        ["circle", { cx: "16.5", cy: "7.5", r: ".5", fill: "currentColor", key: "w0ekpg" }]
      ]
    };
    __iconData2.node;
    KeyRound = createLucideIcon(__iconData2);
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

// packages/addons/vault/client/ui/common.cjs
var require_common = __commonJS({
  "packages/addons/vault/client/ui/common.cjs"(exports2, module2) {
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
        {
          type: props.type || "button",
          className: "wbv-btn" + (props.kind ? " " + props.kind : ""),
          disabled: props.disabled,
          onClick: props.onClick,
          title: props.title
        },
        props.children
      );
    }
    function Field(props) {
      var h = props.h;
      return h(
        "label",
        { className: "wbv-field" },
        h("span", { className: "wbv-label" }, props.label),
        props.children,
        props.hint ? h("span", { className: "wbv-hint" }, props.hint) : null
      );
    }
    function Notice(props) {
      var h = props.h;
      if (!props.text) return null;
      return h("div", { className: "wbv-notice " + (props.kind || "info") }, props.text);
    }
    function Empty(props) {
      var h = props.h;
      return h("div", { className: "wbv-empty" }, props.text || "\u6682\u65E0\u6570\u636E");
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
    module2.exports = {
      unwrap,
      call,
      errText,
      fmtTime,
      Btn,
      Field,
      Notice,
      Empty,
      useLoad
    };
  }
});

// packages/addons/vault/client/views/status.cjs
var require_status = __commonJS({
  "packages/addons/vault/client/views/status.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    module2.exports = function StatusView(props) {
      var h = props.h;
      var api = props.api;
      var lang = props.lang || "zh";
      var React = props.React;
      var st = React.useState({ loading: true, data: null, error: "" });
      var status = st[0].data;
      var error = st[0].error;
      var busy = React.useState(false);
      var pass = React.useState("");
      var pass2 = React.useState("");
      var mode = React.useState("A");
      var msg = React.useState("");
      var refreshTick = React.useState(0);
      var refresh = function() {
        refreshTick[1](refreshTick[0] + 1);
      };
      React.useEffect(function() {
        var alive = true;
        C.call(api, "vault.status").then(function(data) {
          if (alive) st[1]({ loading: false, data, error: "" });
        }).catch(function(e) {
          if (alive) st[1]({ loading: false, data: null, error: C.errText(e) });
        });
        return function() {
          alive = false;
        };
      }, [refreshTick[0]]);
      function run(fn) {
        busy[1](true);
        msg[1]("");
        return fn().then(function() {
          pass[1]("");
          pass2[1]("");
          busy[1](false);
          refresh();
        }).catch(function(e) {
          msg[1](C.errText(e));
          busy[1](false);
        });
      }
      if (st[0].loading) return h("div", { className: "wbv" }, h(C.Empty, { h, text: "\u6B63\u5728\u8BFB\u53D6\u4FDD\u9669\u7BB1\u72B6\u6001\u2026" }));
      if (error) {
        return h(
          "div",
          { className: "wbv" },
          h("h2", null, "\u51ED\u636E\u4FDD\u9669\u7BB1"),
          h(C.Notice, { h, kind: "error", text: error }),
          h(C.Btn, { h, onClick: refresh }, "\u91CD\u8BD5")
        );
      }
      if (!status || !status.initialized) {
        return h(
          "div",
          { className: "wbv" },
          h("h2", null, "\u521D\u59CB\u5316\u51ED\u636E\u4FDD\u9669\u7BB1"),
          h("p", { className: "wbv-muted" }, "\u53E3\u4EE4\u53EA\u7528\u4E8E\u6D3E\u751F\u5BC6\u94A5\uFF0C\u4E0D\u4F1A\u843D\u5E93\uFF1B\u5FD8\u8BB0\u53E3\u4EE4\u65E0\u6CD5\u6062\u590D\u5DF2\u4FDD\u5B58\u7684\u51ED\u636E\u3002"),
          h(C.Notice, { h, kind: "info", text: "\u9ED8\u8BA4 A \u6A21\u5F0F\uFF1A\u6BCF\u6B21\u542F\u52A8\u540E\u9700\u8981\u91CD\u65B0\u89E3\u9501\u3002\u53EF\u7A0D\u540E\u5728\u8BBE\u7F6E\u91CC\u6539\u6210\u81EA\u52A8\u89E3\u9501\u3002" }),
          h(
            "div",
            { className: "wbv-card wbv-row" },
            h(
              C.Field,
              { h, label: "\u4E3B\u53E3\u4EE4\uFF08\u81F3\u5C11 10 \u4F4D\uFF09" },
              h("input", { type: "password", value: pass[0], autoComplete: "new-password", onChange: function(e) {
                pass[1](e.target.value);
              } })
            ),
            h(
              C.Field,
              { h, label: "\u786E\u8BA4\u53E3\u4EE4" },
              h("input", { type: "password", value: pass2[0], autoComplete: "new-password", onChange: function(e) {
                pass2[1](e.target.value);
              } })
            ),
            h(
              C.Field,
              { h, label: "\u89E3\u9501\u6A21\u5F0F" },
              h(
                "select",
                { value: mode[0], onChange: function(e) {
                  mode[1](e.target.value);
                } },
                h("option", { value: "A" }, "A \u5168\u9501\uFF08\u63A8\u8350\uFF09"),
                h("option", { value: "B" }, "B \u81EA\u52A8\u89E3\u9501\uFF0C\u67E5\u770B\u51ED\u636E\u518D\u8F93\u53E3\u4EE4"),
                h("option", { value: "C" }, "C \u81EA\u52A8\u89E3\u9501\uFF0C\u67E5\u770B\u514D\u53E3\u4EE4\uFF08\u4E0D\u5EFA\u8BAE\uFF09")
              )
            )
          ),
          h(C.Notice, { h, kind: "error", text: msg[0] }),
          h(
            "div",
            { className: "wbv-row" },
            h(C.Btn, { h, kind: "primary", disabled: busy[0], onClick: function() {
              if (pass[0].length < 10) return msg[1]("\u53E3\u4EE4\u81F3\u5C11 10 \u4E2A\u5B57\u7B26");
              if (pass[0] !== pass2[0]) return msg[1]("\u4E24\u6B21\u8F93\u5165\u4E0D\u4E00\u81F4");
              run(function() {
                return C.call(api, "vault.setup", { passphrase: pass[0], mode: mode[0] });
              });
            } }, busy[0] ? "\u521D\u59CB\u5316\u4E2D\u2026" : "\u521B\u5EFA\u4FDD\u9669\u7BB1")
          )
        );
      }
      if (status.locked) {
        return h(
          "div",
          { className: "wbv" },
          h("h2", null, "\u4FDD\u9669\u7BB1\u5DF2\u9501\u5B9A"),
          h("p", { className: "wbv-muted" }, "\u8F93\u5165\u4E3B\u53E3\u4EE4\u89E3\u9501\u3002\u89E3\u9501\u72B6\u6001\u53EA\u4FDD\u5B58\u5728\u5F53\u524D\u8FDB\u7A0B\u5185\u5B58\uFF0C\u7A7A\u95F2\u8D85\u65F6\u4F1A\u81EA\u52A8\u9501\u5B9A\u3002"),
          h(
            "div",
            { className: "wbv-card wbv-row" },
            h(
              C.Field,
              { h, label: "\u4E3B\u53E3\u4EE4" },
              h("input", { type: "password", value: pass[0], autoComplete: "current-password", onChange: function(e) {
                pass[1](e.target.value);
              } })
            ),
            h(C.Btn, { h, kind: "primary", disabled: busy[0], onClick: function() {
              if (!pass[0]) return msg[1]("\u8BF7\u8F93\u5165\u53E3\u4EE4");
              run(function() {
                return C.call(api, "vault.unlock", { passphrase: pass[0] });
              });
            } }, busy[0] ? "\u89E3\u9501\u4E2D\u2026" : "\u89E3\u9501")
          ),
          h(C.Notice, { h, kind: "error", text: msg[0] }),
          h("p", { className: "wbv-muted" }, "\u6A21\u5F0F\uFF1A" + modeName(status.unlockMode) + "\uFF1B\u8FDE\u7EED\u5931\u8D25 5 \u6B21\u4F1A\u9501\u5B9A 5 \u5206\u949F\u3002")
        );
      }
      var modeText = modeName(status.unlockMode);
      return h(
        "div",
        { className: "wbv" },
        h("div", { className: "wbv-row" }, h("h2", { className: "wbv-grow" }, "\u51ED\u636E\u4FDD\u9669\u7BB1"), h("span", { className: "wbv-pill ok" }, "\u5DF2\u89E3\u9501")),
        h(
          "div",
          { className: "wbv-grid" },
          h("div", { className: "wbv-card" }, h("div", { className: "wbv-muted" }, "\u51ED\u636E\u6570\u91CF"), h("div", { className: "wbv-kpi" }, status.secretCount || 0)),
          h("div", { className: "wbv-card" }, h("div", { className: "wbv-muted" }, "\u89E3\u9501\u6A21\u5F0F"), h("div", { className: "wbv-kpi" }, status.unlockMode), h("div", { className: "wbv-muted" }, modeText)),
          h("div", { className: "wbv-card" }, h("div", { className: "wbv-muted" }, "\u4E0A\u6B21\u89E3\u9501"), h("div", null, C.fmtTime(status.lastUnlockAt, lang)))
        ),
        h(C.Notice, { h, kind: "info", text: "agent \u53EA\u80FD\u770B\u5230\u540D\u79F0\u548C\u5907\u6CE8\uFF1B\u67E5\u770B\u660E\u6587\u5FC5\u987B\u7531\u4F60\u5728\u754C\u9762\u4E0A\u64CD\u4F5C\u3002" }),
        h(
          "div",
          { className: "wbv-row" },
          h(C.Btn, { h, onClick: function() {
            run(function() {
              return C.call(api, "vault.lock");
            });
          } }, "\u7ACB\u5373\u9501\u5B9A"),
          h(C.Btn, { h, onClick: function() {
            var p = window.prompt("\u5207\u6362\u4E3A A \u6A21\u5F0F\u540E\uFF0C\u4E0B\u6B21\u542F\u52A8\u9700\u8981\u91CD\u65B0\u89E3\u9501\u3002\u8F93\u5165\u4E3B\u53E3\u4EE4\u786E\u8BA4\uFF1A");
            if (p === null) return;
            busy[1](true);
            msg[1]("");
            C.call(api, "vault.unlock", { passphrase: p }).then(function() {
              return C.call(api, "vault.setUnlockMode", { mode: "A" });
            }).then(function() {
              busy[1](false);
              refresh();
            }).catch(function(e) {
              busy[1](false);
              msg[1](C.errText(e));
            });
          } }, "\u5207\u56DE A \u6A21\u5F0F")
        ),
        h(C.Notice, { h, kind: "error", text: msg[0] })
      );
    };
    function modeName(mode) {
      if (mode === "B") return "\u542F\u52A8\u81EA\u52A8\u89E3\u9501\uFF0C\u67E5\u770B\u51ED\u636E\u9700\u53E3\u4EE4";
      if (mode === "C") return "\u542F\u52A8\u81EA\u52A8\u89E3\u9501\uFF0C\u67E5\u770B\u514D\u53E3\u4EE4";
      return "\u5168\u9501\uFF1A\u6BCF\u6B21\u542F\u52A8\u9700\u89E3\u9501";
    }
  }
});

// packages/addons/vault/client/views/secrets.cjs
var require_secrets = __commonJS({
  "packages/addons/vault/client/views/secrets.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    var KIND_LABEL = {
      password: "\u5BC6\u7801",
      token: "Token",
      app_password: "\u5E94\u7528\u4E13\u7528\u5BC6\u7801",
      api_key: "API Key",
      other: "\u5176\u5B83"
    };
    module2.exports = function SecretsView(props) {
      var h = props.h;
      var api = props.api;
      var lang = props.lang || "zh";
      var React = props.React;
      var listS = React.useState({ loading: true, rows: [], error: "" });
      var qS = React.useState("");
      var statusS = React.useState(null);
      var formS = React.useState(emptyForm());
      var editingS = React.useState(false);
      var busyS = React.useState(false);
      var msgS = React.useState("");
      var revealS = React.useState(null);
      var rows = listS[0].rows;
      function load() {
        listS[1](function(old) {
          return Object.assign({}, old, { loading: true });
        });
        Promise.all([
          C.call(api, "vault.secretList", { q: qS[0] }),
          C.call(api, "vault.status").catch(function() {
            return null;
          })
        ]).then(function(r) {
          listS[1]({ loading: false, rows: r[0] && (r[0].items || r[0].secrets) || [], error: "" });
          statusS[1](r[1]);
        }).catch(function(e) {
          listS[1]({ loading: false, rows: [], error: C.errText(e) });
        });
      }
      React.useEffect(function() {
        load();
      }, []);
      function startCreate() {
        formS[1](emptyForm());
        editingS[1](true);
        msgS[1]("");
      }
      function startEdit(row) {
        var meta = {};
        try {
          meta = JSON.parse(row.meta || "{}");
        } catch (e) {
          meta = {};
        }
        formS[1]({ id: row.id, name: row.name, kind: row.kind, secret: "", username: meta.username || "", url: meta.url || "" });
        editingS[1](true);
        msgS[1]("");
      }
      function save() {
        var f = formS[0];
        if (!f.name.trim()) return msgS[1]("\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A");
        if (!editingS[0]) return;
        if (!f.id && !f.secret) return msgS[1]("\u65B0\u589E\u51ED\u636E\u5FC5\u987B\u586B\u5199\u660E\u6587");
        busyS[1](true);
        msgS[1]("");
        var meta = { username: f.username, url: f.url };
        var p = f.id ? C.call(api, "vault.secretUpdate", { id: f.id, name: f.name.trim(), kind: f.kind, secret: f.secret || void 0, meta }) : C.call(api, "vault.secretCreate", { name: f.name.trim(), kind: f.kind, secret: f.secret, meta });
        p.then(function() {
          busyS[1](false);
          editingS[1](false);
          formS[1](emptyForm());
          load();
        }).catch(function(e) {
          busyS[1](false);
          msgS[1](C.errText(e));
        });
      }
      function del(row) {
        if (!window.confirm("\u5220\u9664\u51ED\u636E\u300C" + row.name + "\u300D\uFF1F\u7ED1\u5B9A\u5B83\u7684\u8FDE\u63A5\u5668\u4F1A\u5931\u6548\u3002")) return;
        busyS[1](true);
        msgS[1]("");
        C.call(api, "vault.secretDelete", { id: row.id }).then(function() {
          busyS[1](false);
          load();
        }).catch(function(e) {
          busyS[1](false);
          msgS[1](C.errText(e));
        });
      }
      function reveal(row) {
        msgS[1]("");
        var mode = statusS[0] && statusS[0].unlockMode;
        var passphrase;
        if (mode === "B") {
          passphrase = window.prompt("B \u6A21\u5F0F\u4E0B\u67E5\u770B\u51ED\u636E\u9700\u8981\u518D\u6B21\u8F93\u5165\u4E3B\u53E3\u4EE4\uFF1A");
          if (passphrase === null) return;
        }
        busyS[1](true);
        C.call(api, "vault.secretReveal", { id: row.id, passphrase }).then(function(r) {
          busyS[1](false);
          revealS[1]({ name: row.name, secret: r.secret });
        }).catch(function(e) {
          busyS[1](false);
          msgS[1](C.errText(e));
        });
      }
      return h(
        "div",
        { className: "wbv" },
        h(
          "div",
          { className: "wbv-row" },
          h("h2", { className: "wbv-grow" }, "\u51ED\u636E"),
          h("input", { style: { maxWidth: "220px" }, placeholder: "\u641C\u7D22\u540D\u79F0\u6216\u5907\u6CE8", value: qS[0], onChange: function(e) {
            qS[1](e.target.value);
          } }),
          h(C.Btn, { h, onClick: load }, "\u641C\u7D22"),
          h(C.Btn, { h, kind: "primary", onClick: startCreate }, "\u65B0\u589E\u51ED\u636E")
        ),
        h(C.Notice, { h, kind: "error", text: listS[0].error || msgS[0] }),
        listS[0].loading ? h(C.Empty, { h, text: "\u8BFB\u53D6\u4E2D\u2026" }) : rows.length === 0 ? h(C.Empty, { h, text: "\u8FD8\u6CA1\u6709\u51ED\u636E\u3002\u65B0\u589E\u4E00\u6761\u540E\uFF0C\u53EF\u628A\u5B83\u7ED1\u5B9A\u7ED9\u8FDE\u63A5\u5668\u3002" }) : h(
          "table",
          { className: "wbv-table" },
          h("thead", null, h("tr", null, ["\u540D\u79F0", "\u7C7B\u578B", "\u5907\u6CE8", "\u6700\u8FD1\u4F7F\u7528", "\u64CD\u4F5C"].map(function(x) {
            return h("th", { key: x }, x);
          }))),
          h("tbody", null, rows.map(function(row) {
            var meta = {};
            try {
              meta = JSON.parse(row.meta || "{}");
            } catch (e) {
              meta = {};
            }
            return h(
              "tr",
              { key: row.id },
              h("td", null, h("strong", null, row.name)),
              h("td", null, h("span", { className: "wbv-pill" }, KIND_LABEL[row.kind] || row.kind)),
              h("td", null, [meta.username, meta.url].filter(Boolean).join(" \xB7 ") || "\u2014"),
              h("td", null, C.fmtTime(row.lastUsedAt, lang)),
              h("td", null, h(
                "div",
                { className: "wbv-inline" },
                h(C.Btn, { h, kind: "ghost", onClick: function() {
                  reveal(row);
                } }, "\u67E5\u770B"),
                h(C.Btn, { h, kind: "ghost", onClick: function() {
                  startEdit(row);
                } }, "\u7F16\u8F91"),
                h(C.Btn, { h, kind: "ghost", onClick: function() {
                  del(row);
                } }, "\u5220\u9664")
              ))
            );
          }))
        ),
        editingS[0] ? h(
          "div",
          { className: "wbv-modal" },
          h(
            "div",
            { className: "wbv-modal-box" },
            h("h3", null, formS[0].id ? "\u7F16\u8F91\u51ED\u636E" : "\u65B0\u589E\u51ED\u636E"),
            h(C.Field, { h, label: "\u540D\u79F0" }, h("input", { value: formS[0].name, onChange: function(e) {
              formS[1](Object.assign({}, formS[0], { name: e.target.value }));
            } })),
            h(
              C.Field,
              { h, label: "\u7C7B\u578B" },
              h(
                "select",
                { value: formS[0].kind, onChange: function(e) {
                  formS[1](Object.assign({}, formS[0], { kind: e.target.value }));
                } },
                Object.keys(KIND_LABEL).map(function(k) {
                  return h("option", { key: k, value: k }, KIND_LABEL[k]);
                })
              )
            ),
            h(
              C.Field,
              { h, label: formS[0].id ? "\u65B0\u660E\u6587\uFF08\u7559\u7A7A\u4E0D\u8F6E\u6362\uFF09" : "\u660E\u6587" },
              h("input", { type: "password", autoComplete: "new-password", value: formS[0].secret, placeholder: formS[0].id ? "\u4E0D\u4FEE\u6539\u8BF7\u7559\u7A7A" : "\u5BC6\u7801 / token", onChange: function(e) {
                formS[1](Object.assign({}, formS[0], { secret: e.target.value }));
              } })
            ),
            h(C.Field, { h, label: "\u5907\u6CE8\u7528\u6237\u540D" }, h("input", { value: formS[0].username, onChange: function(e) {
              formS[1](Object.assign({}, formS[0], { username: e.target.value }));
            } })),
            h(C.Field, { h, label: "\u5907\u6CE8 URL" }, h("input", { value: formS[0].url, onChange: function(e) {
              formS[1](Object.assign({}, formS[0], { url: e.target.value }));
            } })),
            h(C.Notice, { h, kind: "error", text: msgS[0] }),
            h(
              "div",
              { className: "wbv-row" },
              h("span", { className: "wbv-grow" }),
              h(C.Btn, { h, onClick: function() {
                editingS[1](false);
              } }, "\u53D6\u6D88"),
              h(C.Btn, { h, kind: "primary", disabled: busyS[0], onClick: save }, busyS[0] ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58")
            )
          )
        ) : null,
        revealS[0] ? h(
          "div",
          { className: "wbv-modal", onClick: function() {
            revealS[1](null);
          } },
          h(
            "div",
            { className: "wbv-modal-box", onClick: function(e) {
              e.stopPropagation();
            } },
            h("h3", null, "\u51ED\u636E\u660E\u6587 \xB7 " + revealS[0].name),
            h("div", { className: "wbv-secret" }, revealS[0].secret),
            h(
              "div",
              { className: "wbv-row" },
              h(C.Btn, { h, onClick: function() {
                if (navigator.clipboard) navigator.clipboard.writeText(revealS[0].secret).then(function() {
                  msgS[1]("\u5DF2\u590D\u5236");
                });
              } }, "\u590D\u5236"),
              h("span", { className: "wbv-grow" }),
              h(C.Btn, { h, onClick: function() {
                revealS[1](null);
              } }, "\u5173\u95ED")
            )
          )
        ) : null
      );
    };
    function emptyForm() {
      return { id: "", name: "", kind: "password", secret: "", username: "", url: "" };
    }
  }
});

// packages/addons/vault/client/views/config.cjs
var require_config = __commonJS({
  "packages/addons/vault/client/views/config.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    var MODES = [
      { id: "A", title: "A \u5168\u9501\uFF08\u63A8\u8350\uFF09", desc: "\u6BCF\u6B21 DSH \u542F\u52A8\u540E\u9700\u8981\u8F93\u5165\u4E3B\u53E3\u4EE4\uFF1B\u660E\u6587\u53EA\u5728\u5F53\u524D\u8FDB\u7A0B\u5185\u5B58\u3002" },
      { id: "B", title: "B \u81EA\u52A8\u89E3\u9501\uFF0C\u67E5\u770B\u9700\u53E3\u4EE4", desc: "\u542F\u52A8\u65F6\u7528\u672C\u673A device key \u81EA\u52A8\u89E3\u9501\uFF1B\u6BCF\u6B21\u67E5\u770B/\u7F16\u8F91\u51ED\u636E\u518D\u8F93\u4E3B\u53E3\u4EE4\u3002" },
      { id: "C", title: "C \u81EA\u52A8\u89E3\u9501\uFF0C\u67E5\u770B\u514D\u53E3\u4EE4", desc: "\u542F\u52A8\u81EA\u52A8\u89E3\u9501\uFF0C\u754C\u9762\u4E0A\u53EF\u76F4\u63A5\u67E5\u770B\u660E\u6587\uFF1B\u9002\u5408\u5355\u4EBA\u53D7\u63A7\u673A\u5668\u3002" }
    ];
    module2.exports = function ConfigView(props) {
      var h = props.h;
      var api = props.api;
      var React = props.React;
      var st = React.useState(null);
      var mode = React.useState("A");
      var oldPass = React.useState("");
      var newPass = React.useState("");
      var msg = React.useState("");
      var busy = React.useState(false);
      var tick = React.useState(0);
      React.useEffect(function() {
        C.call(api, "vault.status").then(function(s) {
          st[1](s);
          if (s && s.unlockMode) mode[1](s.unlockMode);
        }).catch(function(e) {
          msg[1](C.errText(e));
        });
      }, [tick[0]]);
      function run(p) {
        busy[1](true);
        msg[1]("");
        p.then(function() {
          busy[1](false);
          tick[1](tick[0] + 1);
        }).catch(function(e) {
          busy[1](false);
          msg[1](C.errText(e));
        });
      }
      function applyMode() {
        var target = mode[0];
        var passphrase;
        if (target === "B" || target === "C") {
          if (!st[0] || st[0].locked) {
            passphrase = window.prompt("\u5207\u6362\u5230 " + target + " \u6A21\u5F0F\u9700\u8981\u4E3B\u53E3\u4EE4\uFF1A");
            if (passphrase === null) return;
          }
        }
        run(C.call(api, "vault.setUnlockMode", { mode: target, passphrase }));
      }
      function changePass() {
        if (newPass[0].length < 10) return msg[1]("\u65B0\u53E3\u4EE4\u81F3\u5C11 10 \u4E2A\u5B57\u7B26");
        run(C.call(api, "vault.changePassphrase", { oldPassphrase: oldPass[0], newPassphrase: newPass[0] }));
        oldPass[1]("");
        newPass[1]("");
      }
      function rotate() {
        var p = window.prompt("\u8F6E\u6362 device key \u9700\u8981\u4E3B\u53E3\u4EE4\uFF1B\u65E7 key \u6587\u4EF6\u4F1A\u88AB\u8986\u76D6\uFF1A");
        if (p === null) return;
        run(C.call(api, "vault.rotateDeviceKey", { passphrase: p }));
      }
      var status = st[0];
      return h(
        "div",
        { className: "wbv" },
        h("h2", null, "\u4FDD\u9669\u7BB1\u8BBE\u7F6E"),
        h(C.Notice, { h, kind: "error", text: msg[0] }),
        h(
          "div",
          { className: "wbv-card" },
          h("h3", null, "\u89E3\u9501\u6A21\u5F0F"),
          MODES.map(function(m) {
            return h(
              "label",
              { key: m.id, className: "wbv-row", style: { padding: "6px 0", alignItems: "flex-start", cursor: "pointer" } },
              h("input", { type: "radio", name: "vault-mode", checked: mode[0] === m.id, onChange: function() {
                mode[1](m.id);
              } }),
              h("span", null, h("strong", null, m.title), h("br"), h("span", { className: "wbv-muted" }, m.desc))
            );
          }),
          h(
            "div",
            { className: "wbv-row" },
            h("span", { className: "wbv-muted" }, status ? "\u5F53\u524D\uFF1A" + status.unlockMode + (status.locked ? "\uFF08\u5DF2\u9501\u5B9A\uFF09" : "\uFF08\u5DF2\u89E3\u9501\uFF09") : ""),
            h("span", { className: "wbv-grow" }),
            h(C.Btn, { h, kind: "primary", disabled: busy[0], onClick: applyMode }, busy[0] ? "\u5E94\u7528\u4E2D\u2026" : "\u5E94\u7528\u6A21\u5F0F")
          )
        ),
        h(
          "div",
          { className: "wbv-card" },
          h("h3", null, "\u4FEE\u6539\u4E3B\u53E3\u4EE4"),
          h("p", { className: "wbv-muted" }, "\u53EA\u91CD\u5305 DEK\uFF0C\u4E0D\u4F1A\u91CD\u65B0\u52A0\u5BC6\u6240\u6709\u51ED\u636E\uFF1Bdevice key \u4E0D\u53D7\u5F71\u54CD\u3002"),
          h(
            "div",
            { className: "wbv-row" },
            h(C.Field, { h, label: "\u5F53\u524D\u53E3\u4EE4" }, h("input", { type: "password", value: oldPass[0], onChange: function(e) {
              oldPass[1](e.target.value);
            } })),
            h(C.Field, { h, label: "\u65B0\u53E3\u4EE4\uFF08\u81F3\u5C11 10 \u4F4D\uFF09" }, h("input", { type: "password", value: newPass[0], onChange: function(e) {
              newPass[1](e.target.value);
            } }))
          ),
          h(C.Btn, { h, disabled: busy[0], onClick: changePass }, "\u4FEE\u6539\u53E3\u4EE4")
        ),
        h(
          "div",
          { className: "wbv-card" },
          h("h3", null, "Device key"),
          h("p", { className: "wbv-muted" }, "B/C \u6A21\u5F0F\u7528\u6765\u5728\u542F\u52A8\u65F6\u81EA\u52A8\u89E3\u9501\u3002key \u6587\u4EF6\u4F4D\u4E8E $WB_HOME/vault-device.key\uFF0C\u6743\u9650 0600\uFF1B\u5220\u9664\u5B83\u7B49\u540C\u56DE\u5230\u9501\u5B9A\u72B6\u6001\u3002"),
          h(C.Btn, { h, disabled: busy[0] || !status || status.unlockMode === "A", onClick: rotate }, "\u8F6E\u6362 device key")
        )
      );
    };
  }
});

// packages/addons/vault/client/views/data.cjs
var require_data = __commonJS({
  "packages/addons/vault/client/views/data.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    module2.exports = function DataView(props) {
      var h = props.h;
      var api = props.api;
      var React = props.React;
      var tableS = React.useState("vault_secret");
      var dataS = React.useState({ loading: false, data: null, error: "" });
      var tablesS = React.useState([]);
      React.useEffect(function() {
        C.call(api, "vault.dataTables").then(function(r) {
          tablesS[1](r && r.tables || []);
        }).catch(function() {
        });
      }, []);
      function load(table) {
        tableS[1](table);
        dataS[1]({ loading: true, data: null, error: "" });
        C.call(api, "vault.dataQuery", { table, limit: 50 }).then(function(data) {
          dataS[1]({ loading: false, data, error: "" });
        }).catch(function(e) {
          dataS[1]({ loading: false, data: null, error: C.errText(e) });
        });
      }
      React.useEffect(function() {
        load("vault_secret");
      }, []);
      var d = dataS[0].data;
      var cols = d && d.rows && d.rows.length ? Object.keys(d.rows[0]) : [];
      return h(
        "div",
        { className: "wbv" },
        h("h2", null, "\u6570\u636E"),
        h("p", { className: "wbv-muted" }, "\u4FDD\u9669\u7BB1\u4E0D\u53C2\u4E0E\u4E91\u540C\u6B65\uFF1B\u5BC6\u6587\u5217\u4E0E KDF/\u5305\u88F9\u503C\u56FA\u5B9A\u663E\u793A\u4E3A ***\u3002"),
        h(
          "div",
          { className: "wbv-tabs" },
          ["vault_secret", "vault_meta"].map(function(t) {
            return h("button", { key: t, type: "button", className: "wbv-tab" + (tableS[0] === t ? " on" : ""), onClick: function() {
              load(t);
            } }, t);
          }),
          h("span", { className: "wbv-grow" }),
          h(C.Btn, { h, onClick: function() {
            load(tableS[0]);
          } }, "\u5237\u65B0")
        ),
        h(C.Notice, { h, kind: "error", text: dataS[0].error }),
        dataS[0].loading ? h(C.Empty, { h, text: "\u8BFB\u53D6\u4E2D\u2026" }) : !d || !d.rows || d.rows.length === 0 ? h(C.Empty, { h, text: "\u6CA1\u6709\u6570\u636E" }) : h(
          "div",
          { style: { overflowX: "auto" } },
          h(
            "table",
            { className: "wbv-table" },
            h("thead", null, h("tr", null, cols.map(function(c) {
              return h("th", { key: c }, c);
            }))),
            h("tbody", null, d.rows.map(function(row, i) {
              return h("tr", { key: i }, cols.map(function(c) {
                var v = row[c];
                return h("td", { key: c }, v === null || v === void 0 ? "\u2014" : typeof v === "object" ? JSON.stringify(v) : String(v));
              }));
            }))
          )
        ),
        h("p", { className: "wbv-muted" }, "\u8868\uFF1A" + (tablesS[0].map(function(t) {
          return t.name;
        }).join(" / ") || "\u2014"))
      );
    };
  }
});

// packages/addons/vault/client/views/actions.cjs
var require_actions = __commonJS({
  "packages/addons/vault/client/views/actions.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    module2.exports = function ActionsView(props) {
      var h = props.h;
      var api = props.api;
      var React = props.React;
      var s = React.useState({ loading: true, data: null, error: "" });
      var q = React.useState("");
      React.useEffect(function() {
        C.call(api, "vault.actionSchema").then(function(data2) {
          s[1]({ loading: false, data: data2, error: "" });
        }).catch(function(e) {
          s[1]({ loading: false, data: null, error: C.errText(e) });
        });
      }, []);
      var data = s[0].data;
      var list = data && data.actions || [];
      if (q[0]) list = list.filter(function(a) {
        return (a.name + " " + (a.description || "")).toLowerCase().indexOf(q[0].toLowerCase()) >= 0;
      });
      return h(
        "div",
        { className: "wbv" },
        h(
          "div",
          { className: "wbv-row" },
          h("h2", { className: "wbv-grow" }, "Action \u6E05\u5355"),
          h("input", { style: { maxWidth: "220px" }, placeholder: "\u8FC7\u6EE4", value: q[0], onChange: function(e) {
            q[1](e.target.value);
          } })
        ),
        h("p", { className: "wbv-muted" }, "\u5171 " + (data && data.actions || []).length + " \u4E2A action\uFF1Bschema \u662F agent \u552F\u4E00\u53EF\u89C1\u7684\u5951\u7EA6\u3002"),
        h(C.Notice, { h, kind: "error", text: s[0].error }),
        s[0].loading ? h(C.Empty, { h, text: "\u8BFB\u53D6\u4E2D\u2026" }) : list.length === 0 ? h(C.Empty, { h, text: "\u6CA1\u6709\u5339\u914D\u7684 action" }) : h(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: "8px" } },
          list.map(function(a) {
            return h(
              "details",
              { key: a.name, className: "wbv-card" },
              h("summary", { style: { cursor: "pointer" } }, h("code", null, a.name), h("span", { className: "wbv-muted" }, " \u2014 " + (a.description || ""))),
              h("pre", { className: "wbv-code", style: { marginTop: "8px" } }, JSON.stringify(a.input || {}, null, 2))
            );
          })
        )
      );
    };
  }
});

// packages/addons/vault/client/client.src.cjs
(function() {
  var root = typeof window !== "undefined" ? window : null;
  var host = root && root.__WB_HOST__;
  if (!host || !host.react) {
    if (typeof console !== "undefined") console.error("[dsh-workbench-vault] \u5BBF\u4E3B\u524D\u7AEF\u672A\u5C31\u7EEA\uFF0C\u65E0\u6CD5\u6CE8\u518C\u63D2\u4EF6\u754C\u9762");
    module.exports = { name: "dsh-workbench-vault", inject: [], apply: function() {
    } };
    return;
  }
  var React = host.react;
  var h = host.h;
  var CSS = require_styles();
  var ICONS = {
    shield: (init_shield(), __toCommonJS(shield_exports)).default,
    key: (init_key_round(), __toCommonJS(key_round_exports)).default,
    sliders: (init_sliders_horizontal(), __toCommonJS(sliders_horizontal_exports)).default,
    database: (init_database(), __toCommonJS(database_exports)).default,
    list: (init_list(), __toCommonJS(list_exports)).default
  };
  function Icon2(props) {
    var C = ICONS[props.name] || ICONS.shield;
    return h(C, { size: props.size || 14, strokeWidth: 2, "aria-hidden": "true", className: "wbg-svg" });
  }
  function tabIcon(name) {
    return function() {
      return h(Icon2, { name, size: 14 });
    };
  }
  function withProps(Inner, title) {
    return function Wrapped(props) {
      return h(Inner, {
        api: props.api,
        lang: props.lang === "en" ? "en" : "zh",
        h,
        React,
        title
      });
    };
  }
  function ensureStyles() {
    if (typeof document === "undefined" || !document.head) return;
    if (document.getElementById("wb-vault-style")) return;
    var style = document.createElement("style");
    style.id = "wb-vault-style";
    style.textContent = CSS;
    document.head.appendChild(style);
  }
  ensureStyles();
  host.registerAddon({
    id: "wb-addon-vault",
    version: "0.1.0",
    views: [
      { id: "status", icon: tabIcon("shield"), title: { zh: "\u4FDD\u9669\u7BB1", en: "Vault" }, component: withProps(require_status(), "\u4FDD\u9669\u7BB1") },
      { id: "secrets", icon: tabIcon("key"), title: { zh: "\u51ED\u636E", en: "Secrets" }, component: withProps(require_secrets(), "\u51ED\u636E") },
      { id: "config", icon: tabIcon("sliders"), title: { zh: "\u8BBE\u7F6E", en: "Settings" }, component: withProps(require_config(), "\u8BBE\u7F6E") },
      { id: "data", icon: tabIcon("database"), title: { zh: "\u6570\u636E", en: "Data" }, component: withProps(require_data(), "\u6570\u636E") },
      { id: "actions", icon: tabIcon("list"), title: { zh: "Action", en: "Actions" }, component: withProps(require_actions(), "Action") }
    ]
  });
  module.exports = { name: "dsh-workbench-vault", inject: [], apply: function() {
  } };
})();
    return module.exports;
  },
});
