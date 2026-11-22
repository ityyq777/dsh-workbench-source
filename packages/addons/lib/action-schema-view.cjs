"use strict";
// 共享「Action」页视图：数据来自各插件自己注册的 <域>.actionSchema（插件自证清单，
// 与 actions.list(detail=true) 同源同义），按当前插件域过滤后结构化渲染。本页不提供 action 执行入口；
// 唯一写操作是「允许来源」多选（actions.setActionOrigins），落本机 meta，不进云同步。
// source:"actions.list" 是给宿主自己的页面用的：宿主 action 不属于任何业务域，只能从 actions.list 取。
// 跨域 action（如任务页偶尔调用 tags.*）不算本域清单，也不改真实 schema。
// 搜索采用「过滤 + 高亮同口径」：命中范围与过滤 haystack 完全一致（名称 / 描述 / 参数名 / 类型 / 说明），
// 示例与原始 JSON Schema 只展示不高亮，避免在代码块里插标签破坏可复制性。
var React = require("react");
var createHighlight = require("./highlight.cjs")(React);
var h = React.createElement;

var COPY = {
  zh: {
    title: "Action",
    hint: "运行时注册 · 只读",
    switchHint: "允许来源落本机、即改即生效：勾上的来源才能调用该 action，其余会被 ACTION_ORIGIN_DENIED 拦下。",
    hostHint: "宿主 action 的允许来源；标「来源固定」的不可修改。",
    originsLabel: "允许来源",
    originUi: "界面",
    originPlugin: "插件",
    originAgent: "agent",
    originSync: "同步",
    originsSaving: "保存中…",
    originsToast: "已更新允许来源",
    originsFail: "更新允许来源失败",
    originsEmpty: "至少要保留一个来源",
    originsUnsupported: "该 action 本身不支持这个来源",
    originsPinned: "来源固定",
    originsPinnedHint: "该 action 的允许来源被固定（安全约束），不能修改",
    domain: "域",
    versionLabel: "版本",
    shell: "宿主",
    count: function (shown, total) { return shown + " / " + total + " 个 action"; },
    search: "搜索名称、描述、参数（命中处高亮）",
    filterReq: "必填筛选",
    all: "全部",
    onlyRequired: "含必填项",
    onlyOptional: "无必填项",
    filterType: "参数类型",
    allTypes: "全部类型",
    filterOrigin: "允许来源",
    allOrigins: "全部来源",
    colName: "参数",
    colType: "类型",
    colReq: "必填",
    colExtra: "默认 / 枚举 / 约束",
    colDesc: "说明",
    required: "必填",
    optional: "可选",
    noParams: "无参数",
    paramCount: function (n) { return n + " 个参数"; },
    examples: "示例",
    noExamples: "无示例",
    copy: "复制",
    copied: "已复制",
    raw: "原始 JSON Schema",
    loading: "载入中…",
    loadFail: "读取 action schema 失败",
    retry: "重试",
    empty: "没有匹配的 action",
    emptyRegistry: "该域没有注册 action",
    envelope: "默认",
    enumLabel: "枚举",
    range: "范围",
    length: "长度",
    pattern: "正则",
    format: "格式",
    items: "元素数",
  },
  en: {
    title: "Actions",
    hint: "runtime registry · read-only",
    switchHint: "Allowed origins are stored locally and apply immediately: only checked origins may call the action; others get ACTION_ORIGIN_DENIED.",
    hostHint: "Allowed origins for host actions; items marked pinned cannot be changed.",
    originsLabel: "Origins",
    originUi: "UI",
    originPlugin: "Plugin",
    originAgent: "Agent",
    originSync: "Sync",
    originsSaving: "Saving…",
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
    count: function (shown, total) { return shown + " / " + total + " actions"; },
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
    paramCount: function (n) { return n + " params"; },
    examples: "Examples",
    noExamples: "No examples",
    copy: "Copy",
    copied: "Copied",
    raw: "Raw JSON Schema",
    loading: "Loading…",
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
    items: "Items",
  },
};

/** JSON Schema 的 type：支持数组联合、数组元素与 oneOf/anyOf；缺省返回空串，不臆造类型。 */
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

/** 单个参数的类型集合（供类型筛选），去掉数组后缀。 */
function typeNames(schema) {
  var label = typeLabel(schema);
  if (!label) return [];
  return label.split("|").map(function (x) {
    return x.trim().replace(/\[\]$/, "");
  }).filter(Boolean);
}

function scalar(value) {
  if (typeof value === "string") return JSON.stringify(value);
  return String(value);
}

/** 默认 / 枚举 / 数值长度约束，按出现顺序拼成短文本；没有就返回空串。 */
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
    if (lo !== null && hi !== null) parts.push(t.range + " ≥" + lo + " 且 ≤" + hi);
    else if (lo !== null) parts.push(t.range + " ≥" + lo);
    else parts.push(t.range + " ≤" + hi);
  }
  if (typeof schema.minLength === "number" || typeof schema.maxLength === "number") {
    parts.push(t.length + " " + (schema.minLength ?? 0) + "–" + (schema.maxLength ?? "∞"));
  }
  if (typeof schema.minItems === "number" || typeof schema.maxItems === "number") {
    parts.push(t.items + " " + (schema.minItems ?? 0) + "–" + (schema.maxItems ?? "∞"));
  }
  if (typeof schema.pattern === "string") parts.push(t.pattern + " " + schema.pattern);
  if (typeof schema.format === "string") parts.push(t.format + " " + schema.format);
  return parts.join(" · ");
}

function paramRows(action) {
  var input = action && action.input && typeof action.input === "object" ? action.input : {};
  var props = input.properties && typeof input.properties === "object" ? input.properties : {};
  var required = Array.isArray(input.required) ? input.required : [];
  return Object.keys(props).map(function (key) {
    var schema = props[key] && typeof props[key] === "object" ? props[key] : {};
    return {
      name: key,
      schema: schema,
      type: typeLabel(schema),
      types: typeNames(schema),
      required: required.indexOf(key) >= 0,
      description: typeof schema.description === "string" ? schema.description : "",
    };
  });
}

module.exports = function createActionSchemaView(options) {
  var raw = String(options.domain || "");
  // source=actions.list 给宿主自己的页面用：宿主 action 归在 wb-shell 下，没有业务插件注册 <域>.actionSchema；
  // 业务插件页面一律走默认的 actionSchema（插件自证数据源）。
  var SOURCE = options.source === "actions.list" ? "actions.list" : "actionSchema";
  var DOMAIN = SOURCE === "actions.list" ? raw : raw.indexOf("wb-addon-") === 0 ? raw : "wb-addon-" + raw;
  var LIST_DOMAIN = options.listDomain ? String(options.listDomain) : DOMAIN;
  var prefix = options.prefix;
  var P = prefix + "-as";
  var Icon = options.Icon || null;
  var injectCss = require("./action-schema-style.cjs")(prefix, DOMAIN);
  // 高亮类名跟本页样式同前缀（"wbt-as" → "wbt-as-hit"），避免与记录页的 wbt-hit 抢样式；
  // 这里直接取 Highlight.hit() 的片段，少一层元素包装，同步渲染的视图测试也能断到 mark。
  var Highlight = createHighlight(P);

  function icon(name, size) {
    return Icon ? h(Icon, { name: name, size: size || 14 }) : null;
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
    try { document.execCommand("copy"); } catch (e) { /* 剪贴板不可用时静默降级 */ }
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

    React.useEffect(function () { injectCss(); }, []);

    React.useEffect(function () {
      var alive = true;
      setLoading(true);
      setErr("");
      var pending;
      // 业务插件页只读本插件自己注册的 <域>.actionSchema（页面归属插件，不经过宿主 schema 接口）；
      // 宿主页没有归属插件，才走宿主自己的 actions.list。
      var actionName = SOURCE === "actions.list" ? "actions.list" : DOMAIN.replace(/^wb-addon-/, "") + ".actionSchema";
      var callArgs = SOURCE === "actions.list" ? { detail: true, domain: LIST_DOMAIN } : undefined;
      if (api && typeof api.call === "function") {
        pending = Promise.resolve(api.call(actionName, callArgs)).then(function (r) {
          if (r && r.ok === false) return r;
          return (r && r.result) || r;
        });
      } else {
        pending = Promise.reject(new Error("no call api"));
      }
      Promise.resolve(pending).then(function (r) {
        if (!alive) return;
        if (!r || r.ok === false) {
          setSnap(null);
          setErr(String((r && (r.error || r.text)) || t.loadFail));
        } else {
          setSnap(r);
        }
        setLoading(false);
      }, function (e) {
        if (!alive) return;
        setSnap(null);
        setErr(String((e && e.message) || e || t.loadFail));
        setLoading(false);
      });
      return function () { alive = false; };
    }, [reload]);

    function copy(text) {
      var done = function () { setToast(t.copied); };
      if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard.writeText(text).then(done, function () { plainCopy(text); done(); });
        return;
      }
      plainCopy(text);
      done();
    }

    var ORIGINS = ["ui", "plugin", "agent", "sync"];
    var originText = { ui: t.originUi, plugin: t.originPlugin, agent: t.originAgent, sync: t.originSync };

    /** 切换某个来源：写宿主本机 meta（actions.setActionOrigins），只认 ui origin。 */
    function setOrigins(action, origin) {
      var name = action.name;
      var current = Array.isArray(action.origins) ? action.origins.slice() : [];
      var index = current.indexOf(origin);
      var next = index >= 0 ? current.filter(function (o) { return o !== origin; }) : current.concat([origin]);
      if (next.length === 0) { setToast(t.originsEmpty); return; }
      // 归一成 ui/plugin/agent/sync 的固定顺序，和宿主返回保持一致。
      next = ORIGINS.filter(function (o) { return next.indexOf(o) >= 0; });
      setSaving(name);
      setToast("");
      var fail = function (e) {
        setSaving("");
        setToast(t.originsFail + "：" + String((e && e.message) || e || ""));
      };
      var done = function (r) {
        setSaving("");
        var payload = r && typeof r === "object" && Object.prototype.hasOwnProperty.call(r, "result") ? r.result : r;
        if (r && r.ok === false) {
          setToast(t.originsFail + "：" + String(r.error || r.text || ""));
          return;
        }
        var value = payload && Array.isArray(payload.origins) ? payload.origins : next;
        var source = payload && typeof payload.source === "string" ? payload.source : action.originsSource;
        // 就地更新本条，避免整页重载闪一下；宿主返回的生效值优先。
        setSnap(function (prev) {
          if (!prev || !Array.isArray(prev.actions)) return prev;
          return Object.assign({}, prev, {
            actions: prev.actions.map(function (a) {
              if (!a || a.name !== name) return a;
              return Object.assign({}, a, { origins: value, originsSource: source });
            }),
          });
        });
        setToast(t.originsToast);
      };
      if (!api || typeof api.call !== "function") { fail(new Error("no call api")); return; }
      Promise.resolve(api.call("actions.setActionOrigins", { action: name, origins: next })).then(done, fail);
    }

    var all = snap && Array.isArray(snap.actions)
      ? snap.actions.filter(function (a) { return a && a.domain === DOMAIN; })
      : [];
    var info = snap && Array.isArray(snap.domains)
      ? snap.domains.filter(function (d) { return d && d.id === DOMAIN; })[0] || null
      : null;

    var typeOptions = [];
    all.forEach(function (a) {
      paramRows(a).forEach(function (row) {
        row.types.forEach(function (name) {
          if (typeOptions.indexOf(name) < 0) typeOptions.push(name);
        });
      });
    });
    typeOptions.sort();

    // 过滤用转小写后的 q；高亮用 trim 后的原串（高亮内部只折叠 ASCII 大小写）。
    var kw = String(query || "").trim();
    var q = kw.toLowerCase();
    var visible = all.filter(function (a) {
      var rows = paramRows(a);
      if (q) {
        var hay = [a.name || "", a.description || ""]
          .concat(rows.map(function (row) { return row.name + " " + row.type + " " + row.description; }))
          .join(" ")
          .toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      var hasRequired = rows.some(function (row) { return row.required; });
      if (reqMode === "required" && !hasRequired) return false;
      if (reqMode === "optional" && hasRequired) return false;
      if (typePick && !rows.some(function (row) { return row.types.indexOf(typePick) >= 0; })) return false;
      // 来源筛选：只列「允许该来源」的 action；宿主没注入 origins 时（老宿主 / agent 视角）不参与筛选。
      if (originPick && (!Array.isArray(a.origins) || a.origins.indexOf(originPick) < 0)) return false;
      return true;
    });

    function paramRow(row) {
      var extra = extraText(row.schema, t);
      // 每格带语义类名：宽屏靠表格列，窄屏由样式改成「参数卡片」网格，
      // 名称 / 类型 / 必填挤一行、约束与说明各占整行，避免五列压成一条竖排文本。
      return h("tr", { key: row.name },
        h("td", { className: P + "-mono " + P + "-pname" }, Highlight.hit(row.name, kw)),
        h("td", { className: P + "-mono " + P + "-ptype" }, Highlight.hit(row.type, kw)),
        h("td", { className: row.required ? P + "-req " + P + "-pneed" : P + "-opt " + P + "-pneed" },
          row.required ? t.required : t.optional),
        // extra（默认 / 枚举 / 约束）不在过滤 haystack 里，因此也不高亮，保持「显示即命中」口径。
        h("td", { className: P + "-mono " + P + "-pextra" }, extra),
        h("td", { className: P + "-pdesc" }, Highlight.hit(row.description, kw)));
    }

    // 允许来源多选（原生 checkbox）：声明是上界，不在声明里的来源直接 disabled。
    function originsChips(action) {
      if (!Array.isArray(action.origins)) return null;
      if (action.originsSource === "invalid") {
        return h("span", { className: P + "-badge " + P + "-locked", title: t.originsPinnedHint, "data-origins-invalid": action.name }, t.originsPinned);
      }
      var busy = saving === action.name;
      var pinned = action.name === "actions.setActionOrigins";
      var supported = Array.isArray(action.originsDeclared) ? action.originsDeclared : action.origins;
      return h("div", { className: P + "-origins", "data-origins-row": action.name },
        h("span", { className: P + "-origins-label" }, t.originsLabel),
        ORIGINS.map(function (origin) {
          var on = action.origins.indexOf(origin) >= 0;
          var allowed = supported.indexOf(origin) >= 0;
          var preset = Array.isArray(action.originsDefault) ? action.originsDefault : supported;
          var byDefault = preset.indexOf(origin) >= 0;
          return h("label", {
            key: origin,
            className: P + "-origin" + (allowed ? "" : " " + P + "-origin-off"),
            title: pinned
              ? t.originsPinnedHint
              : !allowed
                ? t.originsUnsupported
                : originText[origin] + " · " + action.name + " · " + (byDefault ? t.originsDefaultOn : t.originsDefaultOff),
          },
            h("input", {
              type: "checkbox",
              checked: on,
              disabled: busy || pinned || !allowed,
              "data-origin": origin,
              "data-origin-row": action.name,
              "data-origin-supported": allowed ? "1" : "0",
              onChange: function () { setOrigins(action, origin); },
            }),
            h("span", null, originText[origin]));
        }),
        busy ? h("span", { className: P + "-origins-label" }, t.originsSaving) : null);
    }

    function card(action) {
      var rows = paramRows(action);
      var examples = Array.isArray(action.examples) ? action.examples : [];
      return h("div", { className: P + "-card", key: action.name },
        h("div", { className: P + "-cardhead" },
          h("div", { className: P + "-cardmeta" },
            h("code", { className: P + "-mono" }, Highlight.hit(action.name, kw)),
            h("span", { className: P + "-badge" }, rows.length ? t.paramCount(rows.length) : t.noParams),
            rows.some(function (row) { return row.required; })
              ? h("span", { className: P + "-badge " + P + "-req" }, t.required)
              : null),
          originsChips(action)),
        action.description ? h("p", { className: P + "-desc" }, Highlight.hit(action.description, kw)) : null,
        rows.length
          ? h("table", { className: P + "-table" },
            h("thead", null, h("tr", null,
              h("th", null, t.colName),
              h("th", null, t.colType),
              h("th", null, t.colReq),
              h("th", null, t.colExtra),
              h("th", null, t.colDesc))),
            h("tbody", null, rows.map(paramRow)))
          : h("div", { className: P + "-none" }, t.noParams),
        h("div", { className: P + "-example" },
          h("div", { className: P + "-examplehead" },
            h("span", { className: P + "-none" }, t.examples),
            examples.length
              ? h("button", {
                type: "button",
                className: P + "-copy",
                "data-copy-example": action.name,
                onClick: function () { copy(JSON.stringify(examples.length === 1 ? examples[0] : examples, null, 2)); },
              }, t.copy)
              : null),
          examples.length
            ? examples.map(function (example, index) {
              return h("pre", { className: P + "-pre", key: index }, JSON.stringify(example, null, 2));
            })
            : h("div", { className: P + "-none" }, t.noExamples)),
        h("details", null,
          h("summary", null, t.raw),
          h("pre", { className: P + "-pre" }, JSON.stringify(action.input || {}, null, 2))));
    }

    var body;
    if (loading) {
      body = h("div", { className: P + "-empty", role: "status" }, t.loading);
    } else if (err) {
      body = h("div", { className: P + "-error", role: "alert" },
        h("span", null, t.loadFail + "：" + err),
        h("button", { type: "button", className: P + "-copy", onClick: function () { setReload(reload + 1); } }, t.retry));
    } else if (!all.length) {
      body = h("div", { className: P + "-empty" }, t.emptyRegistry);
    } else if (!visible.length) {
      body = h("div", { className: P + "-empty" }, t.empty);
    } else {
      body = h("div", { className: P + "-list" }, visible.map(card));
    }

    return h("div", { className: P },
      h("div", { className: P + "-head" },
        h("h3", { className: P + "-title" }, t.title),
        h("span", { className: P + "-badge" }, t.domain + " " + DOMAIN),
        info && info.version ? h("span", { className: P + "-badge" }, t.versionLabel + " v" + info.version) : null,
        snap && snap.shellVersion ? h("span", { className: P + "-badge" }, t.shell + " v" + snap.shellVersion) : null,
        h("span", { className: P + "-badge" }, t.count(visible.length, all.length)),
        h("span", { className: P + "-none" }, t.hint)),
      h("p", { className: P + "-hintline" }, SOURCE === "actions.list" ? t.hostHint : t.switchHint),
      snap
        ? h("div", { className: P + "-toolbar" },
          h("label", { className: P + "-search" },
            icon("search", 14),
            h("input", {
              type: "search",
              value: query,
              placeholder: t.search,
              "aria-label": t.search,
              onChange: function (e) { setQuery(e.target.value); },
            })),
          h("label", { className: P + "-none" },
            t.filterReq + " ",
            h("select", { value: reqMode, "aria-label": t.filterReq, onChange: function (e) { setReqMode(e.target.value); } },
              h("option", { value: "all" }, t.all),
              h("option", { value: "required" }, t.onlyRequired),
              h("option", { value: "optional" }, t.onlyOptional))),
          h("label", { className: P + "-none" },
            t.filterType + " ",
            h("select", { value: typePick, "aria-label": t.filterType, onChange: function (e) { setTypePick(e.target.value); } },
              h("option", { value: "" }, t.allTypes),
              typeOptions.map(function (name) { return h("option", { value: name, key: name }, name); }))),
          h("label", { className: P + "-none" },
            t.filterOrigin + " ",
            h("select", { value: originPick, "aria-label": t.filterOrigin, "data-origin-filter": "", onChange: function (e) { setOriginPick(e.target.value); } },
              h("option", { value: "" }, t.allOrigins),
              ORIGINS.map(function (origin) { return h("option", { value: origin, key: origin }, originText[origin]); }))))
        : null,
      body,
      toast ? h("div", { className: P + "-toast", role: "status" }, toast) : null);
  }

  return { ActionSchemaView: ActionSchemaView, DOMAIN: DOMAIN, typeLabel: typeLabel, paramRows: paramRows };
};
