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

// packages/addons/contacts/client/ui/styles.cjs
var require_styles = __commonJS({
  "packages/addons/contacts/client/ui/styles.cjs"(exports2, module2) {
    "use strict";
    module2.exports = [
      ".wbct-wrap{display:flex;flex-direction:column;gap:12px;padding:16px;overflow:auto;height:100%;box-sizing:border-box}",
      ".wbct-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}",
      ".wbct-title{font-size:16px;font-weight:650;margin:0}",
      ".wbct-sub{font-size:12px;color:var(--wb-muted,#6b7280);margin:2px 0 0}",
      ".wbct-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}",
      ".wbct-card{border:1px solid var(--wb-border,#e5e7eb);border-radius:10px;background:var(--wb-surface,#fff);padding:12px}",
      ".wbct-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}",
      ".wbct-kpi{font-size:22px;font-weight:700;line-height:1.2}.wbct-kpi-label{font-size:12px;color:var(--wb-muted,#6b7280)}",
      ".wbct-table{width:100%;border-collapse:collapse;font-size:12px}.wbct-table th,.wbct-table td{padding:7px 8px;border-bottom:1px solid var(--wb-border,#eef0f3);text-align:left;vertical-align:top}",
      ".wbct-table th{font-weight:600;color:var(--wb-muted,#6b7280);white-space:nowrap}",
      ".wbct-btn{border:1px solid var(--wb-border,#d1d5db);background:var(--wb-surface,#fff);color:inherit;border-radius:7px;padding:5px 10px;font-size:12px;cursor:pointer}",
      ".wbct-btn:hover:not(:disabled){border-color:var(--wb-accent,#2563eb)}.wbct-btn:disabled{opacity:.5;cursor:default}",
      ".wbct-btn.primary{background:var(--wb-accent,#2563eb);border-color:var(--wb-accent,#2563eb);color:#fff}",
      ".wbct-btn.danger{color:#b91c1c;border-color:#fecaca}",
      ".wbct-field{display:flex;flex-direction:column;gap:4px;font-size:12px}.wbct-label{font-weight:600}",
      ".wbct-field input,.wbct-field select,.wbct-field textarea{border:1px solid var(--wb-border,#d1d5db);border-radius:7px;padding:6px 8px;font:inherit;background:var(--wb-surface,#fff);color:inherit;min-width:0}",
      ".wbct-hint{color:var(--wb-muted,#6b7280);font-size:11px}.wbct-notice{padding:8px 10px;border-radius:8px;font-size:12px;background:#eff6ff;color:#1e40af}",
      ".wbct-notice.error{background:#fef2f2;color:#b91c1c}.wbct-notice.ok{background:#ecfdf5;color:#047857}",
      ".wbct-empty{padding:18px;text-align:center;color:var(--wb-muted,#6b7280);font-size:12px;border:1px dashed var(--wb-border,#e5e7eb);border-radius:8px}",
      ".wbct-pill{display:inline-block;padding:1px 7px;border-radius:999px;font-size:11px;background:#f3f4f6;color:#374151}",
      ".wbct-pill.ok{background:#ecfdf5;color:#047857}.wbct-pill.error{background:#fef2f2;color:#b91c1c}.wbct-pill.warn{background:#fffbeb;color:#b45309}",
      ".wbct-json{margin:0;padding:8px;background:#f8fafc;border-radius:8px;font-size:11px;max-height:240px;overflow:auto}",
      ".wbct-muted{color:var(--wb-muted,#6b7280)}.wbct-link{color:var(--wb-accent,#2563eb);cursor:pointer;text-decoration:none}",
      ".wbct-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}"
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

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/users.mjs
var users_exports = {};
__export(users_exports, {
  __iconData: () => __iconData,
  default: () => Users
});
var __iconData, Users;
var init_users = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/users.mjs"() {
    init_createLucideIcon();
    __iconData = {
      name: "users",
      size: 24,
      node: [
        ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
        ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
        ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
        ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
      ]
    };
    __iconData.node;
    Users = createLucideIcon(__iconData);
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

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/upload.mjs
var upload_exports = {};
__export(upload_exports, {
  __iconData: () => __iconData3,
  default: () => Upload
});
var __iconData3, Upload;
var init_upload = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/upload.mjs"() {
    init_createLucideIcon();
    __iconData3 = {
      name: "upload",
      size: 24,
      node: [
        ["path", { d: "M12 3v12", key: "1x0j5s" }],
        ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
        ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }]
      ]
    };
    __iconData3.node;
    Upload = createLucideIcon(__iconData3);
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

// packages/addons/contacts/client/ui/common.cjs
var require_common = __commonJS({
  "packages/addons/contacts/client/ui/common.cjs"(exports2, module2) {
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
      return h("button", { type: props.type || "button", className: "wbct-btn" + (props.kind ? " " + props.kind : ""), disabled: props.disabled, onClick: props.onClick, title: props.title }, props.children);
    }
    function Field(props) {
      var h = props.h;
      return h("label", { className: "wbct-field" }, h("span", { className: "wbct-label" }, props.label), props.children, props.hint ? h("span", { className: "wbct-hint" }, props.hint) : null);
    }
    function Notice(props) {
      var h = props.h;
      if (!props.text) return null;
      return h("div", { className: "wbct-notice " + (props.kind || "info") }, props.text);
    }
    function Empty(props) {
      var h = props.h;
      return h("div", { className: "wbct-empty" }, props.text || "\u6682\u65E0\u6570\u636E");
    }
    function Pill(props) {
      var h = props.h;
      return h("span", { className: "wbct-pill " + (props.kind || "") }, props.children);
    }
    function Json(props) {
      var h = props.h;
      var t;
      try {
        t = JSON.stringify(props.value, null, 2);
      } catch (e) {
        t = String(props.value);
      }
      return h("pre", { className: "wbct-json" }, t);
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

// packages/addons/contacts/client/views/contacts.cjs
var require_contacts = __commonJS({
  "packages/addons/contacts/client/views/contacts.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
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
          } }, "\u65B0\u5EFA\u8054\u7CFB\u4EBA"),
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
          h("thead", null, h("tr", null, ["\u59D3\u540D", "\u7EC4\u7EC7 / \u804C\u4F4D", "\u8054\u7CFB\u65B9\u5F0F", "\u5206\u7EC4", "\u66F4\u65B0\u65F6\u95F4", "\u64CD\u4F5C"].map(function(x) {
            return h("th", { key: x }, x);
          }))),
          h("tbody", null, rows.map(function(c) {
            return h(
              "tr",
              { key: c.id },
              h("td", null, h("b", null, c.name)),
              h("td", null, [c.org, c.title].filter(Boolean).join(" / ") || "\u2014"),
              h("td", null, h("div", { className: "wbct-muted" }, (c.fields || []).map(function(x) {
                return x.kind + ": " + x.value;
              }).join("\uFF1B") || "\u2014")),
              h("td", null, (c.groups || []).map(function(g) {
                return h(C.Pill, { h, key: g.id }, g.name);
              })),
              h("td", null, C.fmtTime(c.updatedAt, props.lang)),
              h("td", null, h(
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

// packages/addons/contacts/client/views/data.cjs
var require_data = __commonJS({
  "packages/addons/contacts/client/views/data.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    module2.exports = function DataView(props) {
      var h = props.h, api = props.api, React = props.React;
      var meta = C.useLoad(React, api, "contacts.dataTables", {}, []);
      var table = React.useState("contact");
      var limit = React.useState(50);
      var offset = React.useState(0);
      var q = C.useLoad(React, api, "contacts.dataQuery", { table: table[0], limit: limit[0], offset: offset[0] }, [table[0], limit[0], offset[0]]);
      var rows = q.data && q.data.rows || [];
      var cols = rows.length ? Object.keys(rows[0]) : meta.data && meta.data.columns && meta.data.columns[table[0]] || [];
      return h(
        "div",
        { className: "wbct-wrap" },
        h("h2", null, "\u6570\u636E"),
        h(
          "div",
          { className: "wbct-row" },
          h("select", { className: "wbct-input", value: table[0], onChange: function(e) {
            table[1](e.target.value);
            offset[1](0);
          } }, (meta.data && meta.data.tables || []).map(function(t) {
            return h("option", { key: t, value: t }, t);
          })),
          h("input", { className: "wbct-input", type: "number", value: limit[0], onChange: function(e) {
            limit[1](Number(e.target.value) || 50);
          } }),
          h("input", { className: "wbct-input", type: "number", value: offset[0], onChange: function(e) {
            offset[1](Number(e.target.value) || 0);
          } })
        ),
        q.error ? h(C.Notice, { h, kind: "error", text: q.error }) : null,
        h("div", { className: "wbct-table-wrap" }, h(
          "table",
          { className: "wbct-table" },
          h("thead", null, h("tr", null, cols.map(function(c) {
            return h("th", { key: c }, c);
          }))),
          h("tbody", null, rows.map(function(r, i) {
            return h("tr", { key: i }, cols.map(function(c) {
              return h("td", { key: c }, r[c] == null ? "\u2014" : String(r[c]));
            }));
          }))
        ))
      );
    };
  }
});

// packages/addons/contacts/client/views/actions.cjs
var require_actions = __commonJS({
  "packages/addons/contacts/client/views/actions.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    module2.exports = function ActionsView(props) {
      var h = props.h, api = props.api, React = props.React;
      var st = C.useLoad(React, api, "contacts.actionSchema", {}, []);
      var names = st.data && st.data.actions || [];
      return h(
        "div",
        { className: "wbct-wrap" },
        h("h2", null, "Action"),
        h(C.Notice, { h, kind: "info", text: "\u6E05\u5355\u7531 contacts.actionSchema \u81EA\u8BC1\u3002" }),
        st.error ? h(C.Notice, { h, kind: "error", text: st.error }) : null,
        h("ul", { className: "wbct-list" }, names.map(function(n) {
          return h("li", { key: n }, h("code", null, n));
        }))
      );
    };
  }
});

// packages/addons/contacts/client/client.src.cjs
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
    users: (init_users(), __toCommonJS(users_exports)).default,
    folder: (init_folder(), __toCommonJS(folder_exports)).default,
    upload: (init_upload(), __toCommonJS(upload_exports)).default,
    sliders: (init_sliders_horizontal(), __toCommonJS(sliders_horizontal_exports)).default,
    database: (init_database(), __toCommonJS(database_exports)).default,
    list: (init_list(), __toCommonJS(list_exports)).default
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
  function ensureStyles() {
    if (typeof document === "undefined" || !document.head) return;
    if (document.getElementById("wb-contacts-style")) return;
    var style = document.createElement("style");
    style.id = "wb-contacts-style";
    style.textContent = CSS;
    document.head.appendChild(style);
  }
  ensureStyles();
  host.registerAddon({
    id: "wb-addon-contacts",
    version: "0.1.0",
    icon: (init_users(), __toCommonJS(users_exports)).default,
    views: [
      { id: "contacts", icon: tabIcon("users"), title: { zh: "\u8054\u7CFB\u4EBA", en: "Contacts" }, component: withProps(require_contacts(), "\u8054\u7CFB\u4EBA") },
      { id: "groups", icon: tabIcon("folder"), title: { zh: "\u5206\u7EC4", en: "Groups" }, component: withProps(require_groups(), "\u5206\u7EC4") },
      { id: "importExport", icon: tabIcon("upload"), title: { zh: "\u5BFC\u5165\u5BFC\u51FA", en: "Import / Export" }, component: withProps(require_importExport(), "\u5BFC\u5165\u5BFC\u51FA") },
      { id: "config", icon: tabIcon("sliders"), title: { zh: "\u8BBE\u7F6E", en: "Settings" }, component: withProps(require_config(), "\u8BBE\u7F6E") },
      { id: "data", icon: tabIcon("database"), title: { zh: "\u6570\u636E", en: "Data" }, component: withProps(require_data(), "\u6570\u636E") },
      { id: "actions", icon: tabIcon("list"), title: { zh: "Action", en: "Actions" }, component: withProps(require_actions(), "Action") }
    ]
  });
  module.exports = { name: "dsh-workbench-contacts", inject: [], apply: function() {
  } };
})();
    return module.exports;
  },
});
