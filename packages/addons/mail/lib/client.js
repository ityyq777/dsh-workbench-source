// 由 scripts/build-addon-clients.mjs 生成；请修改对应 client/client.src.cjs 后重新构建。
window.__ModuleLoader__ = window.__ModuleLoader__ || { modules: {}, load: function (m) { this.modules[m.id] = m.factory; } };
window.__ModuleLoader__.load({
  id: "dsh-workbench-mail",
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

// packages/addons/mail/client/ui/styles.cjs
var require_styles = __commonJS({
  "packages/addons/mail/client/ui/styles.cjs"(exports2, module2) {
    "use strict";
    module2.exports = [
      ".wbm-wrap{display:flex;flex-direction:column;gap:12px;padding:16px;overflow:auto;height:100%;box-sizing:border-box}",
      ".wbm-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}",
      ".wbm-title{font-size:16px;font-weight:650;margin:0}",
      ".wbm-sub{font-size:12px;color:var(--wb-muted,#6b7280);margin:2px 0 0}",
      ".wbm-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}",
      ".wbm-card{border:1px solid var(--wb-border,#e5e7eb);border-radius:10px;background:var(--wb-surface,#fff);padding:12px}",
      ".wbm-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}",
      ".wbm-kpi{font-size:22px;font-weight:700;line-height:1.2}.wbm-kpi-label{font-size:12px;color:var(--wb-muted,#6b7280)}",
      ".wbm-table{width:100%;border-collapse:collapse;font-size:12px}.wbm-table th,.wbm-table td{padding:7px 8px;border-bottom:1px solid var(--wb-border,#eef0f3);text-align:left;vertical-align:top}",
      ".wbm-table th{font-weight:600;color:var(--wb-muted,#6b7280);white-space:nowrap}",
      ".wbm-btn{border:1px solid var(--wb-border,#d1d5db);background:var(--wb-surface,#fff);color:inherit;border-radius:7px;padding:5px 10px;font-size:12px;cursor:pointer}",
      ".wbm-btn:hover:not(:disabled){border-color:var(--wb-accent,#2563eb)}.wbm-btn:disabled{opacity:.5;cursor:default}",
      ".wbm-btn.primary{background:var(--wb-accent,#2563eb);border-color:var(--wb-accent,#2563eb);color:#fff}",
      ".wbm-btn.danger{color:#b91c1c;border-color:#fecaca}",
      ".wbm-field{display:flex;flex-direction:column;gap:4px;font-size:12px}.wbm-label{font-weight:600}",
      ".wbm-field input,.wbm-field select,.wbm-field textarea{border:1px solid var(--wb-border,#d1d5db);border-radius:7px;padding:6px 8px;font:inherit;background:var(--wb-surface,#fff);color:inherit;min-width:0}",
      ".wbm-hint{color:var(--wb-muted,#6b7280);font-size:11px}.wbm-notice{padding:8px 10px;border-radius:8px;font-size:12px;background:#eff6ff;color:#1e40af}",
      ".wbm-notice.error{background:#fef2f2;color:#b91c1c}.wbm-notice.ok{background:#ecfdf5;color:#047857}",
      ".wbm-empty{padding:18px;text-align:center;color:var(--wb-muted,#6b7280);font-size:12px;border:1px dashed var(--wb-border,#e5e7eb);border-radius:8px}",
      ".wbm-pill{display:inline-block;padding:1px 7px;border-radius:999px;font-size:11px;background:#f3f4f6;color:#374151}",
      ".wbm-pill.ok{background:#ecfdf5;color:#047857}.wbm-pill.error{background:#fef2f2;color:#b91c1c}.wbm-pill.warn{background:#fffbeb;color:#b45309}",
      ".wbm-json{margin:0;padding:8px;background:#f8fafc;border-radius:8px;font-size:11px;max-height:240px;overflow:auto}",
      ".wbm-muted{color:var(--wb-muted,#6b7280)}.wbm-link{color:var(--wb-accent,#2563eb);cursor:pointer;text-decoration:none}",
      ".wbm-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}",
      ".wbm-page{display:flex;flex-direction:column;gap:12px;padding:16px;overflow:auto;height:100%;box-sizing:border-box}",
      ".wbm-input{border:1px solid var(--wb-border,#d1d5db);border-radius:7px;padding:6px 8px;font:inherit;background:var(--wb-surface,#fff);color:inherit;min-width:120px}",
      ".wbm-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}",
      ".wbm-list{display:flex;flex-direction:column;gap:2px}",
      ".wbm-list-row{display:flex;align-items:center;gap:10px;padding:8px;border-bottom:1px solid var(--wb-border,#eef0f3)}",
      ".wbm-main{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}",
      ".wbm-time{font-variant-numeric:tabular-nums;font-size:12px;color:var(--wb-muted,#6b7280);min-width:44px}",
      ".wbm-dot{width:9px;height:9px;border-radius:50%;background:#11a89b;flex:none}",
      ".wbm-big{font-size:22px;font-weight:700}",
      ".wbm-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}",
      ".wbm-group h3{font-size:12px;color:var(--wb-muted,#6b7280);margin:10px 0 2px}",
      ".wbm-icon-btn{border:0;background:transparent;color:var(--wb-muted,#6b7280);font-size:16px;line-height:1;cursor:pointer;padding:2px 6px;border-radius:6px}",
      ".wbm-icon-btn:hover{background:#fef2f2;color:#b91c1c}",
      ".wbm-ul{margin:6px 0 0;padding-left:18px;font-size:12px;line-height:1.7}",
      ".wbm-page{display:flex;flex-direction:column;gap:12px;padding:16px;overflow:auto;height:100%;box-sizing:border-box}",
      ".wbm-input{border:1px solid var(--wb-border,#d1d5db);border-radius:7px;padding:6px 8px;font:inherit;background:var(--wb-surface,#fff);color:inherit;min-width:120px}",
      ".wbm-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}",
      ".wbm-list{display:flex;flex-direction:column;gap:2px}",
      ".wbm-list-row{display:flex;align-items:center;gap:10px;padding:8px;border:0;border-bottom:1px solid var(--wb-border,#eef0f3);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}",
      ".wbm-main{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}",
      ".wbm-time{font-size:11px;color:var(--wb-muted,#6b7280);white-space:nowrap}",
      ".wbm-body{white-space:pre-wrap;font:inherit;font-size:13px;line-height:1.6;margin:8px 0 0}",
      ".wbm-icon-btn{border:0;background:transparent;color:var(--wb-muted,#6b7280);font-size:16px;cursor:pointer;padding:2px 6px}"
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

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/mail.mjs
var mail_exports = {};
__export(mail_exports, {
  __iconData: () => __iconData,
  default: () => Mail
});
var __iconData, Mail;
var init_mail = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/mail.mjs"() {
    init_createLucideIcon();
    __iconData = {
      name: "mail",
      size: 24,
      node: [
        ["path", { d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7", key: "132q7q" }],
        ["rect", { x: "2", y: "4", width: "20", height: "16", rx: "2", key: "izxlao" }]
      ]
    };
    __iconData.node;
    Mail = createLucideIcon(__iconData);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/send.mjs
var send_exports = {};
__export(send_exports, {
  __iconData: () => __iconData2,
  default: () => Send
});
var __iconData2, Send;
var init_send = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/send.mjs"() {
    init_createLucideIcon();
    __iconData2 = {
      name: "send",
      size: 24,
      node: [
        [
          "path",
          {
            d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
            key: "1ffxy3"
          }
        ],
        ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }]
      ]
    };
    __iconData2.node;
    Send = createLucideIcon(__iconData2);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/users.mjs
var users_exports = {};
__export(users_exports, {
  __iconData: () => __iconData3,
  default: () => Users
});
var __iconData3, Users;
var init_users = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/users.mjs"() {
    init_createLucideIcon();
    __iconData3 = {
      name: "users",
      size: 24,
      node: [
        ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
        ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
        ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
        ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
      ]
    };
    __iconData3.node;
    Users = createLucideIcon(__iconData3);
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

// packages/addons/mail/client/ui/common.cjs
var require_common = __commonJS({
  "packages/addons/mail/client/ui/common.cjs"(exports2, module2) {
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
      return h("button", { type: props.type || "button", className: "wbm-btn" + (props.kind ? " " + props.kind : ""), disabled: props.disabled, onClick: props.onClick, title: props.title }, props.children);
    }
    function Field(props) {
      var h = props.h;
      return h("label", { className: "wbm-field" }, h("span", { className: "wbm-label" }, props.label), props.children, props.hint ? h("span", { className: "wbm-hint" }, props.hint) : null);
    }
    function Notice(props) {
      var h = props.h;
      if (!props.text) return null;
      return h("div", { className: "wbm-notice " + (props.kind || "info") }, props.text);
    }
    function Empty(props) {
      var h = props.h;
      return h("div", { className: "wbm-empty" }, props.text || "\u6682\u65E0\u6570\u636E");
    }
    function Pill(props) {
      var h = props.h;
      return h("span", { className: "wbm-pill " + (props.kind || "") }, props.children);
    }
    function Json(props) {
      var h = props.h;
      var t;
      try {
        t = JSON.stringify(props.value, null, 2);
      } catch (e) {
        t = String(props.value);
      }
      return h("pre", { className: "wbm-json" }, t);
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

// packages/addons/mail/client/views/messages.cjs
var require_messages = __commonJS({
  "packages/addons/mail/client/views/messages.cjs"(exports2, module2) {
    "use strict";
    module2.exports = function Messages(props) {
      var h = props.h, React = props.React, api = props.api;
      var C = require_common();
      var accounts = C.useLoad(React, api, "mail.accountList", {}, []);
      var accountId = React.useState("");
      var list = C.useLoad(React, api, "mail.messageList", { accountId: accountId[0] || void 0, limit: 50 }, [accountId[0]]);
      var sel = React.useState(null);
      var msg = React.useState(null);
      var accs = accounts.data && accounts.data.items || [];
      function open(id) {
        C.call(api, "mail.messageGet", { id }).then(function(d) {
          sel[1](d);
        }).catch(function(e) {
          msg[1]({ kind: "error", text: C.errText(e) });
        });
      }
      function sync() {
        if (!accountId[0]) {
          msg[1]({ kind: "error", text: "\u5148\u5728\u5DE6\u4FA7\u9009\u62E9\u4E00\u4E2A\u8D26\u6237" });
          return;
        }
        C.call(api, "mail.sync", { id: accountId[0], limit: 20 }).then(function(r) {
          msg[1]({ kind: "ok", text: "\u6293\u53D6 " + r.fetched + " \u5C01\uFF0C\u65B0\u589E " + r.inserted });
          list.refresh();
        }).catch(function(e) {
          msg[1]({ kind: "error", text: C.errText(e) });
        });
      }
      var items = list.data && list.data.items || [];
      var unread = items.filter(function(m) {
        return !m.seen;
      }).length;
      var current = sel[0];
      return h(
        "div",
        { className: "wbm-page" },
        h("div", { className: "wbm-head" }, h("div", null, h("h2", null, "\u90AE\u4EF6"), h("p", { className: "wbm-sub" }, "\u672C\u5730\u526F\u672C\uFF1BIMAP \u53EA\u6293\u4FE1\u5934\uFF0C\u5BC6\u7801\u4FDD\u5B58\u5728\u4FDD\u9669\u7BB1\u3002")), h(
          "div",
          { className: "wbm-row" },
          h(C.Btn, { h, onClick: list.refresh }, "\u5237\u65B0")
        )),
        h(C.Notice, { h, text: msg[0] && msg[0].text, kind: msg[0] && msg[0].kind }),
        accounts.error ? h(C.Notice, { h, kind: "error", text: accounts.error }) : null,
        h(
          "div",
          { className: "wbm-layout" + (current ? " has-detail" : "") },
          h(
            "aside",
            { className: "wbm-rail" },
            h(
              "div",
              { className: "wbm-card wbm-rail-card" },
              h("div", { className: "wbm-rail-title" }, "\u6536\u4EF6\u8D26\u6237"),
              h("select", { className: "wbm-input", value: accountId[0], onChange: function(e) {
                accountId[1](e.target.value);
                sel[1](null);
              } }, h("option", { value: "" }, "\u5168\u90E8\u8D26\u6237"), accs.map(function(a) {
                return h("option", { key: a.id, value: a.id }, a.name);
              })),
              h("div", { className: "wbm-rail-stats" }, h("span", null, h("b", null, items.length), " \u5C01\u672C\u5730"), h("span", null, h("b", null, unread), " \u5C01\u672A\u8BFB")),
              h(C.Btn, { h, kind: "primary", onClick: sync }, "\u540C\u6B65\u6536\u4EF6\u7BB1"),
              h("p", { className: "wbm-hint" }, "\u53EA\u6293\u6700\u8FD1 20 \u5C01\u4FE1\u5934\uFF1B\u6B63\u6587\u6309\u9700\u4E0B\u8F7D\u3002")
            ),
            h("div", { className: "wbm-rail-tip" }, "\u63D0\u793A\uFF1A\u70B9\u5F00\u4E00\u5C01\u90AE\u4EF6\u4F1A\u5728\u53F3\u4FA7\u9605\u8BFB\uFF0C\u5217\u8868\u4E0D\u4F1A\u6D88\u5931\u3002")
          ),
          h(
            "section",
            { className: "wbm-pane wbm-listpane" },
            h("div", { className: "wbm-pane-head" }, h("strong", null, "\u90AE\u4EF6\u5217\u8868"), h("span", { className: "wbm-muted" }, items.length + " \u5C01")),
            list.loading ? h(C.Empty, { h, text: "\u52A0\u8F7D\u4E2D\u2026" }) : list.error ? h(C.Notice, { h, kind: "error", text: list.error }) : items.length === 0 ? h(C.Empty, { h, text: "\u6CA1\u6709\u672C\u5730\u90AE\u4EF6\uFF1B\u5148\u5728\u8D26\u6237\u9875\u540C\u6B65\u3002" }) : h("div", { className: "wbm-list" }, items.map(function(m) {
              return h(
                "button",
                { key: m.id, type: "button", className: "wbm-list-row" + (current && current.id === m.id ? " on" : "") + (m.seen ? "" : " unread"), onClick: function() {
                  open(m.id);
                } },
                h("span", { className: "wbm-dot" }),
                h(
                  "div",
                  { className: "wbm-main" },
                  h("strong", { className: "wbm-subject" }, m.subject || "(\u65E0\u4E3B\u9898)"),
                  h("span", { className: "wbm-muted" }, (m.from || "\u672A\u77E5\u53D1\u4EF6\u4EBA") + " \xB7 " + (m.mailbox || "INBOX")),
                  m.preview ? h("span", { className: "wbm-snippet" }, m.preview) : null
                ),
                h("span", { className: "wbm-time" }, C.fmtTime(m.dateAt, props.lang))
              );
            }))
          ),
          current ? h(
            "section",
            { className: "wbm-pane wbm-detailpane" },
            h(
              "div",
              { className: "wbm-detail-head" },
              h("div", { className: "wbm-detail-title" }, h("strong", null, current.subject || "(\u65E0\u4E3B\u9898)"), h("span", { className: "wbm-muted" }, (current.from || "") + " \xB7 " + C.fmtTime(current.dateAt, props.lang))),
              h(C.Btn, { h, onClick: function() {
                sel[1](null);
              } }, "\u5173\u95ED")
            ),
            h("div", { className: "wbm-detail-meta" }, h("span", null, "\u6536\u4EF6\u4EBA\uFF1A", current.to || "\u2014"), h("span", null, "\u90AE\u7BB1\uFF1A", current.mailbox || "INBOX")),
            h("pre", { className: "wbm-body" }, current.body || current.preview || "(\u6B63\u6587\u672A\u4E0B\u8F7D)")
          ) : null
        )
      );
    };
  }
});

// packages/addons/mail/client/views/compose.cjs
var require_compose = __commonJS({
  "packages/addons/mail/client/views/compose.cjs"(exports2, module2) {
    "use strict";
    module2.exports = function Compose(props) {
      var h = props.h, React = props.React, api = props.api;
      var C = require_common();
      var accounts = C.useLoad(React, api, "mail.accountList", {}, []);
      var st = React.useState({ accountId: "", to: "", subject: "", text: "" });
      var msg = React.useState(null);
      var busy = React.useState(false);
      var accs = accounts.data && accounts.data.items || [];
      function set(k, v) {
        st[1](Object.assign({}, st[0], { [k]: v }));
      }
      function send() {
        var to = st[0].to.split(/[,，;；\n]/).map(function(s) {
          return s.trim();
        }).filter(Boolean);
        if (!st[0].accountId || !to.length) {
          msg[1]({ kind: "error", text: "\u8BF7\u9009\u62E9\u8D26\u6237\u5E76\u586B\u5199\u6536\u4EF6\u4EBA" });
          return;
        }
        busy[1](true);
        C.call(api, "mail.messageSend", { accountId: st[0].accountId, to, subject: st[0].subject, text: st[0].text }).then(function() {
          msg[1]({ kind: "ok", text: "\u5DF2\u53D1\u9001" });
          st[1](Object.assign({}, st[0], { to: "", subject: "", text: "" }));
        }).catch(function(e) {
          msg[1]({ kind: "error", text: C.errText(e) });
        }).finally(function() {
          busy[1](false);
        });
      }
      return h(
        "div",
        { className: "wbm-page" },
        h("h2", null, "\u5199\u4FE1"),
        h(C.Notice, { h, text: msg[0] && msg[0].text, kind: msg[0] && msg[0].kind }),
        h(
          "div",
          { className: "wbm-card" },
          h(C.Field, { h, label: "\u53D1\u4EF6\u8D26\u6237" }, h("select", { className: "wbm-input", value: st[0].accountId, onChange: function(e) {
            set("accountId", e.target.value);
          } }, h("option", { value: "" }, "\u8BF7\u9009\u62E9"), accs.map(function(a) {
            return h("option", { key: a.id, value: a.id }, a.name + " <" + a.email + ">");
          }))),
          h(C.Field, { h, label: "\u6536\u4EF6\u4EBA", hint: "\u591A\u4E2A\u90AE\u7BB1\u7528\u9017\u53F7\u5206\u9694" }, h("input", { className: "wbm-input", value: st[0].to, onChange: function(e) {
            set("to", e.target.value);
          } })),
          h(C.Field, { h, label: "\u4E3B\u9898" }, h("input", { className: "wbm-input", value: st[0].subject, onChange: function(e) {
            set("subject", e.target.value);
          } })),
          h(C.Field, { h, label: "\u6B63\u6587" }, h("textarea", { className: "wbm-input", rows: 10, value: st[0].text, onChange: function(e) {
            set("text", e.target.value);
          } })),
          h("div", { className: "wbm-actions" }, h(C.Btn, { h, kind: "primary", disabled: busy[0], onClick: send }, busy[0] ? "\u53D1\u9001\u4E2D\u2026" : "\u53D1\u9001"))
        )
      );
    };
  }
});

// packages/addons/mail/client/views/accounts.cjs
var require_accounts = __commonJS({
  "packages/addons/mail/client/views/accounts.cjs"(exports2, module2) {
    "use strict";
    module2.exports = function Accounts(props) {
      var h = props.h, React = props.React, api = props.api;
      var C = require_common();
      var load = C.useLoad(React, api, "mail.accountList", {}, []);
      var form = React.useState({ open: false, name: "", email: "", imapHost: "", imapPort: 993, smtpHost: "", smtpPort: 465, username: "", secretId: "" });
      var msg = React.useState(null);
      function set(k, v) {
        form[1](Object.assign({}, form[0], { [k]: v }));
      }
      function add() {
        C.call(api, "mail.accountCreate", form[0]).then(function() {
          form[1]({ open: false, name: "", email: "", imapHost: "", imapPort: 993, smtpHost: "", smtpPort: 465, username: "", secretId: "" });
          load.refresh();
        }).catch(function(e) {
          msg[1]({ kind: "error", text: C.errText(e) });
        });
      }
      function test(id) {
        C.call(api, "mail.accountTest", { id }).then(function(r) {
          msg[1]({ kind: "ok", text: "\u8FDE\u63A5\u6210\u529F\uFF0C\u53D1\u73B0 " + r.mailboxes + " \u4E2A\u6587\u4EF6\u5939" });
        }).catch(function(e) {
          msg[1]({ kind: "error", text: C.errText(e) });
        });
      }
      function del(id) {
        C.call(api, "mail.accountDelete", { id }).then(function() {
          load.refresh();
        }).catch(function(e) {
          msg[1]({ kind: "error", text: C.errText(e) });
        });
      }
      var items = load.data && load.data.items || [];
      return h(
        "div",
        { className: "wbm-page" },
        h("div", { className: "wbm-head" }, h("div", null, h("h2", null, "\u90AE\u7BB1\u8D26\u6237"), h("p", { className: "wbm-sub" }, "\u5BC6\u7801\u53EA\u5B58\u4FDD\u9669\u7BB1\uFF0C\u8D26\u6237\u4FDD\u5B58 secretId")), h(C.Btn, { h, kind: "primary", onClick: function() {
          set("open", !form[0].open);
        } }, "\u6DFB\u52A0\u8D26\u6237")),
        h(C.Notice, { h, text: msg[0] && msg[0].text, kind: msg[0] && msg[0].kind }),
        form[0].open ? h(
          "div",
          { className: "wbm-card" },
          h(
            "div",
            { className: "wbm-row" },
            h(C.Field, { h, label: "\u540D\u79F0" }, h("input", { className: "wbm-input", value: form[0].name, onChange: function(e) {
              set("name", e.target.value);
            } })),
            h(C.Field, { h, label: "\u90AE\u7BB1" }, h("input", { className: "wbm-input", value: form[0].email, onChange: function(e) {
              set("email", e.target.value);
            } })),
            h(C.Field, { h, label: "IMAP \u4E3B\u673A" }, h("input", { className: "wbm-input", value: form[0].imapHost, onChange: function(e) {
              set("imapHost", e.target.value);
            } })),
            h(C.Field, { h, label: "SMTP \u4E3B\u673A" }, h("input", { className: "wbm-input", value: form[0].smtpHost, onChange: function(e) {
              set("smtpHost", e.target.value);
            } })),
            h(C.Field, { h, label: "\u4FDD\u9669\u7BB1 secret id" }, h("input", { className: "wbm-input", value: form[0].secretId, onChange: function(e) {
              set("secretId", e.target.value);
            } }))
          ),
          h("div", { className: "wbm-actions" }, h(C.Btn, { h, kind: "primary", onClick: add }, "\u4FDD\u5B58"))
        ) : null,
        load.loading ? h(C.Empty, { h, text: "\u52A0\u8F7D\u4E2D\u2026" }) : items.length === 0 ? h(C.Empty, { h, text: "\u8FD8\u6CA1\u6709\u8D26\u6237" }) : h("div", { className: "wbm-list" }, items.map(function(a) {
          return h("div", { key: a.id, className: "wbm-list-row" }, h("div", { className: "wbm-main" }, h("strong", null, a.name), h("span", { className: "wbm-muted" }, a.email + " \xB7 IMAP " + a.imapHost)), h(C.Btn, { h, onClick: function() {
            test(a.id);
          } }, "\u6D4B\u8BD5"), h("button", { type: "button", className: "wbm-icon-btn", onClick: function() {
            del(a.id);
          } }, "\xD7"));
        }))
      );
    };
  }
});

// packages/addons/mail/client/views/data.cjs
var require_data = __commonJS({
  "packages/addons/mail/client/views/data.cjs"(exports2, module2) {
    "use strict";
    module2.exports = function Data(props) {
      var h = props.h, React = props.React, api = props.api;
      var C = require_common();
      var tables = C.useLoad(React, api, "mail.dataTables", {}, []);
      var table = React.useState("mail_message");
      var rows = C.useLoad(React, api, "mail.dataQuery", { table: table[0], limit: 20 }, [table[0]]);
      var list = tables.data && tables.data.tables || [];
      return h(
        "div",
        { className: "wbm-page" },
        h("h2", null, "\u6570\u636E\u6D4F\u89C8"),
        h("select", { className: "wbm-input", value: table[0], onChange: function(e) {
          table[1](e.target.value);
        } }, list.map(function(t) {
          return h("option", { key: t.name, value: t.name }, t.name);
        })),
        rows.error ? h(C.Notice, { h, kind: "error", text: rows.error }) : h(C.Json, { h, value: rows.data && rows.data.rows || [] })
      );
    };
  }
});

// packages/addons/mail/client/views/actions.cjs
var require_actions = __commonJS({
  "packages/addons/mail/client/views/actions.cjs"(exports2, module2) {
    "use strict";
    module2.exports = function Actions(props) {
      var h = props.h, React = props.React, api = props.api;
      var C = require_common();
      var s = C.useLoad(React, api, "mail.actionSchema", {}, []);
      var list = s.data && s.data.actions || [];
      return h("div", { className: "wbm-page" }, h("h2", null, "Action \u6E05\u5355"), h("p", { className: "wbm-sub" }, "\u90AE\u4EF6\u5199\u64CD\u4F5C\u4E0E\u540C\u6B65\u4EC5 UI"), s.error ? h(C.Notice, { h, kind: "error", text: s.error }) : h("div", { className: "wbm-list" }, list.map(function(a) {
        return h("div", { key: a.name, className: "wbm-list-row" }, h("div", { className: "wbm-main" }, h("strong", null, a.name), h("span", { className: "wbm-muted" }, a.description || "")));
      })));
    };
  }
});

// packages/addons/mail/client/client.src.cjs
(function() {
  var root = typeof window !== "undefined" ? window : null;
  var host = root && root.__WB_HOST__;
  if (!host || !host.react) {
    module.exports = { name: "dsh-workbench-mail", inject: [], apply: function() {
    } };
    return;
  }
  var React = host.react;
  var h = host.h;
  var CSS = require_styles();
  var I = { mail: (init_mail(), __toCommonJS(mail_exports)).default, send: (init_send(), __toCommonJS(send_exports)).default, users: (init_users(), __toCommonJS(users_exports)).default, db: (init_database(), __toCommonJS(database_exports)).default, list: (init_list(), __toCommonJS(list_exports)).default };
  function Icon2(p) {
    var C = I[p.name] || I.mail;
    return h(C, { size: 14, strokeWidth: 2, className: "wbg-svg" });
  }
  function tab(n) {
    return function() {
      return h(Icon2, { name: n });
    };
  }
  function withProps(Inner, title) {
    return function(p) {
      return h(Inner, { api: p.api, lang: p.lang === "en" ? "en" : "zh", h, React, title });
    };
  }
  if (typeof document !== "undefined" && document.head && !document.getElementById("wb-mail-style")) {
    var s = document.createElement("style");
    s.id = "wb-mail-style";
    s.textContent = CSS;
    document.head.appendChild(s);
  }
  host.registerAddon({ id: "wb-addon-mail", version: "0.1.0", views: [
    { id: "messages", icon: tab("mail"), title: { zh: "\u90AE\u4EF6", en: "Messages" }, component: withProps(require_messages(), "\u90AE\u4EF6") },
    { id: "compose", icon: tab("send"), title: { zh: "\u5199\u4FE1", en: "Compose" }, component: withProps(require_compose(), "\u5199\u4FE1") },
    { id: "accounts", icon: tab("users"), title: { zh: "\u8D26\u6237", en: "Accounts" }, component: withProps(require_accounts(), "\u8D26\u6237") },
    { id: "data", icon: tab("db"), title: { zh: "\u6570\u636E", en: "Data" }, component: withProps(require_data(), "\u6570\u636E") },
    { id: "actions", icon: tab("list"), title: { zh: "Action", en: "Actions" }, component: withProps(require_actions(), "Action") }
  ] });
  module.exports = { name: "dsh-workbench-mail", inject: [], apply: function() {
  } };
})();
    return module.exports;
  },
});
